const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric"
});

function formatDate(dateString) {
  try {
    return DATE_FORMATTER.format(new Date(dateString));
  } catch (error) {
    return dateString;
  }
}

function setupSkipLink() {
  const skipLink = document.querySelector(".skip-link");
  const main = document.querySelector("#main-content");
  if (!skipLink || !main) return;
  skipLink.addEventListener("click", (event) => {
    event.preventDefault();
    main.setAttribute("tabindex", "-1");
    main.focus({ preventScroll: false });
  });
}

function initNavbar() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");
  const navLinks = document.querySelectorAll("[data-nav-link]");

  function currentPageKey() {
    const pathname = window.location.pathname.replace(/\\/g, "/");
    const current = pathname.split("/").filter(Boolean).pop() || "index.html";
    if (/\/blog\/[^/]+\/?$/.test(pathname)) return "blog.html";
    if (current === "validateur.html") return "demonstrations.html";
    return current;
  }

  const current = currentPageKey();
  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const target = href.split("/").filter(Boolean).pop() || "index.html";
    const active = target === current;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  if (!toggle || !menu) return;
  const label = toggle.querySelector(".sr-only");
  function setMenuOpen(open) {
    menu.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (label) label.textContent = open ? "Fermer le menu" : "Ouvrir le menu";
  }
  toggle.addEventListener("click", () => setMenuOpen(!menu.classList.contains("open")));
  menu.addEventListener("click", (event) => {
    if (event.target.matches("a")) setMenuOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("open")) {
      setMenuOpen(false);
      toggle.focus();
    }
  });
}

function updateFooterYear() {
  const yearNode = document.querySelector("#footer-year");
  if (yearNode) yearNode.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", () => {
  setupSkipLink();
  initNavbar();
  updateFooterYear();
});

window.formatDate = formatDate;