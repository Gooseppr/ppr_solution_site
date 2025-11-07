/* TODO: remplacer par l'URL réelle Google Apps Script */
const GAS_CONTACT_URL = "https://script.google.com/macros/s/XXXXX/exec";

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

function validateContactForm(data) {
  if (!data.email || !emailRegex.test(data.email)) {
    return "Renseignez une adresse email valide.";
  }
  if (!data.message || data.message.trim().length < 10) {
    return "Le message doit comporter au moins 10 caracteres.";
  }
  return null;
}

async function submitToScript(data) {
  if (GAS_CONTACT_URL.includes("XXXXX")) {
    return mockSubmission();
  }

  const response = await fetch(GAS_CONTACT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}`);
  }

  return response.json();
}

function mockSubmission() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: "success", message: "Mock OK" });
    }, 800);
  });
}

async function submitContact(event) {
  event.preventDefault();
  if (!contactForm) return;

  const formData = new FormData(contactForm);
  const payload = {
    name: formData.get("name")?.toString().trim(),
    email: formData.get("email")?.toString().trim(),
    company: formData.get("company")?.toString().trim(),
    message: formData.get("message")?.toString().trim(),
    source: "ppr-solution-site"
  };

  const error = validateContactForm(payload);
  if (error) {
    setStatus(error, "error");
    return;
  }

  setStatus("Envoi en cours...");

  try {
    await submitToScript(payload);
    setStatus("Message envoye. Nous revenons vers vous rapidement.", "success");
    contactForm.reset();
  } catch (err) {
    setStatus("Impossible d'envoyer le message pour le moment.", "error");
  }
}

if (contactForm) {
  contactForm.addEventListener("submit", submitContact);
}

window.submitContact = submitContact;
