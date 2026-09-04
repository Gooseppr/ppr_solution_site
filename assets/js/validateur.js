const API_BASE_URL = "https://s1000d-api.vercel.app";
const API_VALIDATE_ENDPOINT = "/validate";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
const VALIDATION_TIMEOUT_MS = 20000;

const VALIDATOR_MESSAGES = {
  network: "La requête n’a pas pu atteindre le service de validation. Vérifiez votre connexion et réessayez.",
  timeout: "Le service de validation n’a pas répondu dans le délai prévu. Aucun résultat n’a été produit.",
  validation: "Le service n’a pas pu valider ce fichier. Vérifiez qu’il s’agit d’un module XML S1000D Issue 6.0 exploitable.",
  service: "Le service de validation est momentanément indisponible. Aucun résultat fiable n’a pu être produit. Réessayez plus tard.",
  invalidResponse: "La réponse du service de validation est inexploitable. Aucun résultat fiable n’a pu être produit.",
  type: "Le service a refusé le type de fichier transmis. Sélectionnez un fichier portant l’extension .xml.",
  size: "Le service a refusé le fichier en raison de sa taille. La limite est de 10 Mo."
};

class ValidationRequestError extends Error {
  constructor(code) {
    super(code);
    this.name = "ValidationRequestError";
    this.code = code;
  }
}

const formElement = document.querySelector("#validator-form");
const resultPanel = document.querySelector(".result-panel");
const submitButton = formElement?.querySelector('button[type="submit"]');
const submitButtonDefaultLabel = submitButton ? submitButton.textContent : "";
const fileInput = formElement?.querySelector('input[type="file"]');
const fileNameNode = document.querySelector("[data-file-name]");
const fileStatusNode = document.querySelector("[data-file-status]");

let isValidating = false;

function updateFileName() {
  if (!fileNameNode) return;
  const selectedFile = fileInput?.files?.[0];
  const visibleLabel = selectedFile ? selectedFile.name : "Aucun fichier sélectionné";
  fileNameNode.textContent = visibleLabel;
  fileNameNode.title = visibleLabel;
  if (fileStatusNode) {
    fileStatusNode.textContent = selectedFile
      ? `Fichier sélectionné : ${selectedFile.name}`
      : "Aucun fichier sélectionné";
  }
}

function createTextElement(tagName, text, className = "") {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function setSubmitting(submitting) {
  isValidating = submitting;
  if (!submitButton) return;
  submitButton.disabled = submitting;
  submitButton.setAttribute("aria-busy", submitting ? "true" : "false");
  submitButton.textContent = submitting ? "Analyse en cours…" : submitButtonDefaultLabel;
}

function setFileError(message) {
  const field = document.querySelector("#xml-file");
  const errorNode = document.querySelector("#xml-file-error");
  if (errorNode) errorNode.textContent = message || "";
  if (field) {
    if (message) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
  }
}

function focusResults() {
  document.querySelector("#validator-results-title")?.focus();
}

function renderLoading() {
  if (!resultPanel) return;
  resultPanel.dataset.resultState = "loading";
  resultPanel.replaceChildren(createTextElement("p", "Analyse en cours…", "muted"));
}

function renderSummary(summary) {
  const entries = [
    { label: "Total", key: "total" },
    { label: "OK", key: "ok" },
    { label: "Erreurs", key: "error" },
    { label: "Sans schéma", key: "no_schema" },
    { label: "XML invalide", key: "not_well_formed" }
  ];
  const fragment = document.createDocumentFragment();
  const grid = document.createElement("div");
  grid.className = "summary-grid";

  entries.forEach(({ label, key }) => {
    const item = document.createElement("div");
    item.className = "summary-item";
    item.append(
      createTextElement("span", label, "summary-label"),
      createTextElement("span", String(summary[key] ?? 0), "summary-value")
    );
    grid.append(item);
  });

  fragment.append(grid);
  if (typeof summary.duration_ms === "number") {
    fragment.append(createTextElement("p", `Durée : ${summary.duration_ms} ms`, "muted"));
  }
  return fragment;
}

function normalizePayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ValidationRequestError("invalidResponse");
  }
  if (!payload.summary || typeof payload.summary !== "object" || Array.isArray(payload.summary)) {
    throw new ValidationRequestError("invalidResponse");
  }
  if (!Array.isArray(payload.results) || payload.results.some((item) => !item || typeof item !== "object" || Array.isArray(item))) {
    throw new ValidationRequestError("invalidResponse");
  }
  return payload;
}

function renderResult(payload) {
  if (!resultPanel) return;
  const normalizedPayload = normalizePayload(payload);
  const stack = document.createElement("div");
  stack.className = "result-stack";

  if (normalizedPayload.results.length === 0) {
    stack.append(createTextElement("p", "Aucun résultat à afficher.", "muted"));
  } else {
    normalizedPayload.results.forEach((item) => {
      const card = document.createElement("article");
      const rawStatus = String(item.status || "INFO");
      const normalizedStatus = rawStatus.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
      card.className = "result-card";
      card.dataset.status = normalizedStatus;

      const header = document.createElement("header");
      const filename = String(item.filename || "Fichier analysé");
      const heading = createTextElement("h3", filename);
      heading.title = filename;
      header.append(heading, createTextElement("span", rawStatus, "badge"));
      card.append(header);

      if (item.schema_used) {
        card.append(createTextElement("p", `Schéma utilisé : ${String(item.schema_used)}`, "muted"));
      }

      if (Array.isArray(item.errors) && item.errors.length > 0) {
        const list = document.createElement("ul");
        list.className = "list-bullet";
        item.errors.forEach((error) => list.append(createTextElement("li", String(error))));
        card.append(list);
      } else {
        card.append(createTextElement("p", "Aucune erreur signalée.", "muted"));
      }
      stack.append(card);
    });
  }

  resultPanel.dataset.resultState = "success";
  resultPanel.replaceChildren(renderSummary(normalizedPayload.summary), stack);
  focusResults();
}

function renderError(message) {
  if (!resultPanel) return;
  const status = createTextElement("p", message, "form-status");
  status.dataset.status = "error";
  resultPanel.dataset.resultState = "error";
  resultPanel.replaceChildren(status);
  focusResults();
}

function buildFormData(file) {
  const formData = new FormData();
  formData.append("xml_files", file);
  return formData;
}

function publicValidationMessage(error) {
  if (error instanceof ValidationRequestError && VALIDATOR_MESSAGES[error.code]) {
    return VALIDATOR_MESSAGES[error.code];
  }
  return VALIDATOR_MESSAGES.network;
}

async function callValidationAPI(formData) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), VALIDATION_TIMEOUT_MS);

  try {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}${API_VALIDATE_ENDPOINT}`, {
        method: "POST",
        body: formData,
        signal: controller.signal
      });
    } catch (error) {
      if (error?.name === "AbortError") throw new ValidationRequestError("timeout");
      throw new ValidationRequestError("network");
    }

    if (!response.ok) {
      if (response.status === 400 || response.status === 422) throw new ValidationRequestError("validation");
      if (response.status === 413) throw new ValidationRequestError("size");
      if (response.status === 415) throw new ValidationRequestError("type");
      throw new ValidationRequestError(response.status >= 500 ? "service" : "network");
    }

    let payload;
    try {
      payload = await response.json();
    } catch (_error) {
      throw new ValidationRequestError("invalidResponse");
    }
    return normalizePayload(payload);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function handleUpload(event) {
  event.preventDefault();
  if (!formElement || isValidating) return;

  const currentFileInput = formElement.querySelector('input[type="file"]');
  setFileError("");

  if (!currentFileInput?.files?.length) {
    setFileError("Ajoutez un fichier XML avant de lancer la validation.");
    currentFileInput?.focus();
    return;
  }

  const file = currentFileInput.files[0];
  if (file.size === 0) {
    setFileError("Le fichier sélectionné est vide.");
    currentFileInput.focus();
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    setFileError("Le fichier dépasse la limite de 10 Mo.");
    currentFileInput.focus();
    return;
  }
  if (!file.name.toLowerCase().endsWith(".xml")) {
    setFileError("Seuls les fichiers .xml sont acceptés.");
    currentFileInput.focus();
    return;
  }

  setSubmitting(true);
  renderLoading();

  try {
    const payload = await callValidationAPI(buildFormData(file));
    renderResult(payload);
  } catch (error) {
    renderError(publicValidationMessage(error));
  } finally {
    setSubmitting(false);
  }
}

if (formElement) {
  formElement.addEventListener("submit", handleUpload);
  fileInput?.addEventListener("change", updateFileName);
}
