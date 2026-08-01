// TODO (côté serveur / Apps Script, hors dépôt) : le honeypot "website" n'est
// vérifié que côté client ici. À terme, le rejeter aussi côté serveur et
// ajouter une protection anti-abus (rate limiting) sur cet endpoint.
const GAS_CONTACT_URL =
  "https://script.google.com/macros/s/AKfycbxF8eVCMlGEck31E88W8FXm_qfdWAm0YPYdAO8k2EGKqXKNt1rFoAss7y06GliI1PDeyg/exec";

const contactForm = document.querySelector("#contact-form-element");
const statusNode = document.querySelector(".form-status");

const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

function setStatus(message, type = "") {
  if (!statusNode) return;
  statusNode.textContent = message;
  if (type) {
    statusNode.dataset.status = type;
  } else {
    statusNode.removeAttribute("data-status");
  }
}

function setFieldError(fieldId, errorId, message) {
  const field = document.querySelector(`#${fieldId}`);
  const errorNode = document.querySelector(`#${errorId}`);
  if (errorNode) errorNode.textContent = message || "";
  if (field) {
    if (message) {
      field.setAttribute("aria-invalid", "true");
    } else {
      field.removeAttribute("aria-invalid");
    }
  }
}

function validateContactForm(data) {
  let firstError = null;

  const emailValid = data.email && emailRegex.test(data.email);
  setFieldError("contact-email", "contact-email-error", emailValid ? "" : "Renseignez une adresse email valide.");
  if (!emailValid) firstError = firstError || "Renseignez une adresse email valide.";

  const messageValid = data.message && data.message.trim().length >= 10;
  setFieldError("contact-message", "contact-message-error", messageValid ? "" : "Le message doit comporter au moins 10 caractères.");
  if (!messageValid) firstError = firstError || "Le message doit comporter au moins 10 caractères.";

  return firstError;
}

async function submitToScript(data) {
  const body = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    body.append(key, value ?? "");
  });

  const response = await fetch(GAS_CONTACT_URL, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    },
    body
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}`);
  }

  const json = await response.json().catch(() => ({}));
  if (json && json.ok) {
    return json;
  }
  if (json && json.error) {
    throw new Error(json.error);
  }
  return json;
}

async function submitContact(event) {
  event.preventDefault();
  if (!contactForm) return;

  const formData = new FormData(contactForm);

  // Champ honeypot : rempli uniquement par des robots, jamais visible pour un humain.
  if (formData.get("website")) {
    setStatus("Message envoyé. Nous revenons vers vous rapidement.", "success");
    contactForm.reset();
    return;
  }

  const payload = {
    name: formData.get("name")?.toString().trim() || "",
    email: formData.get("email")?.toString().trim() || "",
    company: formData.get("company")?.toString().trim() || "",
    message: formData.get("message")?.toString().trim() || "",
    marketing: formData.get("marketing") ? "on" : "off"
  };

  const error = validateContactForm(payload);
  if (error) {
    setStatus(error, "error");
    return;
  }

  setStatus("Envoi en cours…");

  try {
    await submitToScript(payload);
    setStatus("Message envoyé. Nous revenons vers vous rapidement.", "success");
    contactForm.reset();
  } catch (err) {
    setStatus("Impossible d’envoyer le message pour le moment.", "error");
  }
}

if (contactForm) {
  contactForm.addEventListener("submit", submitContact);
}
