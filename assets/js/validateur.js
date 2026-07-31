const API_BASE_URL = "https://s1000d-api.vercel.app";
const API_VALIDATE_ENDPOINT = "/validate";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo

const formElement = document.querySelector("#validator-form");
const resultPanel = document.querySelector(".result-panel");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function renderSummary(summary = {}) {
  const entries = [
    { label: "Total", key: "total" },
    { label: "OK", key: "ok" },
    { label: "Erreurs", key: "error" },
    { label: "Sans schéma", key: "no_schema" },
    { label: "XML invalide", key: "not_well_formed" }
  ];

  const durationInfo =
    typeof summary.duration_ms === "number"
      ? `<p class="text-muted">Durée : ${summary.duration_ms} ms</p>`
      : "";

  return `
    <div class="summary-grid">
      ${entries
        .map(
          ({ label, key }) => `
            <div class="summary-item">
              <span class="summary-label">${escapeHtml(label)}</span>
              <span class="summary-value">${escapeHtml(summary[key] ?? 0)}</span>
            </div>
          `
        )
        .join("")}
    </div>
    ${durationInfo}
  `;
}

function renderResult(payload) {
  if (!resultPanel) return;

  const files = Array.isArray(payload.results) ? payload.results : [];
  const summaryBlock = renderSummary(payload.summary || {});

  const cards =
    files.length > 0
      ? files
        .map((item) => {
          const status = escapeHtml((item.status || "INFO").toLowerCase());
          const filename = escapeHtml(item.filename || "Fichier analysé");
          const errors =
            Array.isArray(item.errors) && item.errors.length > 0
              ? `<ul class="list-bullet">${item.errors.map((err) => `<li>${escapeHtml(err)}</li>`).join("")}</ul>`
              : `<p class="text-muted">Aucune erreur signalée.</p>`;

          return `
            <article class="result-card" data-status="${status}">
              <header>
                <h3 title="${filename}">${filename}</h3>
                <span class="badge">${escapeHtml(item.status || "N/A")}</span>
              </header>
              ${
                item.schema_used
                  ? `<p class="text-muted">Schéma utilisé : ${escapeHtml(item.schema_used)}</p>`
                  : ""
              }
              ${errors}
            </article>
          `;
        })
          .join("")
      : `<p class="text-muted">Aucun résultat à afficher.</p>`;

  resultPanel.innerHTML = `
    ${summaryBlock}
    <div class="result-stack">
      ${cards}
    </div>
  `;
}

function renderError(message) {
  if (!resultPanel) return;
  resultPanel.innerHTML = `<p class="text-muted">${escapeHtml(message)}</p>`;
}

function buildFormData(file) {
  const formData = new FormData();
  formData.append("xml_files", file);
  return formData;
}

async function callValidationAPI(formData) {
  const response = await fetch(`${API_BASE_URL}${API_VALIDATE_ENDPOINT}`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erreur API ${response.status} · ${text}`);
  }

  return response.json();
}

async function handleUpload(event) {
  event.preventDefault();
  if (!formElement) return;

  const fileInput = formElement.querySelector('input[type="file"]');

  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    renderError("Ajoutez un fichier XML avant de lancer la validation.");
    return;
  }

  const file = fileInput.files[0];

  if (file.size > MAX_FILE_SIZE) {
    renderError("Le fichier dépasse la limite de 10 Mo.");
    return;
  }

  if (!file.name.toLowerCase().endsWith(".xml")) {
    renderError("Seuls les fichiers .xml sont acceptés.");
    return;
  }

  renderError("Analyse en cours…");

  try {
    const payload = await callValidationAPI(buildFormData(file));
    renderResult(payload);
  } catch (error) {
    renderError(`Une erreur est survenue : ${error.message}`);
  }
}

if (formElement) {
  formElement.addEventListener("submit", handleUpload);
}
