/**
 * Global helpers for the PPR-Solution front experience.
 */

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

function toAbsolute(url) {
  if (!url) return url;
  if (/^[a-z]+:/i.test(url)) {
    return url;
  }
  try {
    return new URL(url, `${window.location.origin}${window.location.pathname}`).toString();
  } catch (error) {
    return url;
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

  // Pages regroupées sous "Ressources" dans la navigation principale.
  const RESSOURCES_PAGES = ["blog.html", "article.html", "validateur.html"];

  function markActiveNav() {
    const pathname = window.location.pathname;
    let current = pathname.split("/").filter(Boolean).pop() || "index.html";
    // Pages d'article statiques servies comme /blog/<slug>/ (index.html implicite).
    if (/\/blog\/[^/]+\/?$/.test(pathname) && current !== "blog.html") {
      current = "article.html";
    }
    navLinks.forEach((link) => {
      const target = link.getAttribute("href");
      if (!target) return;
      const normalized = target.split("/").pop() || "index.html";
      const isMatch =
        normalized === current ||
        (normalized === "ressources.html" && RESSOURCES_PAGES.includes(current));
      link.classList.toggle("is-active", isMatch);
    });
  }

  markActiveNav();

  if (toggle && menu) {
    const toggleLabel = toggle.querySelector(".sr-only");

    function setMenuOpen(isOpen) {
      menu.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      if (toggleLabel) {
        toggleLabel.textContent = isOpen ? "Fermer le menu" : "Ouvrir le menu";
      }
    }

    toggle.addEventListener("click", () => {
      setMenuOpen(!menu.classList.contains("open"));
    });

    menu.addEventListener("click", (event) => {
      if (event.target.matches("a")) {
        setMenuOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("open")) {
        setMenuOpen(false);
        toggle.focus();
      }
    });
  }
}

const THEME_STORAGE_KEY = "ppr-theme";
const THEME_COLOR = { light: "#0f3f91", dark: "#171c26" };

function initThemeToggle() {
  const toggle = document.querySelector("[data-theme-toggle]");
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", THEME_COLOR[theme]);
    }
    if (toggle) {
      const isDark = theme === "dark";
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.setAttribute("aria-label", isDark ? "Activer le thème clair" : "Activer le thème sombre");
    }
  }

  applyTheme(currentTheme());

  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch (error) {
        // Stockage indisponible (navigation privée) : le choix ne persistera pas.
      }
      applyTheme(next);
    });
  }

  media.addEventListener("change", (event) => {
    let stored = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
    } catch (error) {
      stored = null;
    }
    if (stored === "light" || stored === "dark") return;
    applyTheme(event.matches ? "dark" : "light");
  });
}

function updateArticleMeta(post) {
  document.title = `${post.title} - Blog PPR-Solution`;
  const metaMap = [
    ['meta[name="description"]', post.meta_description || post.description],
    ['meta[property="og:title"]', post.title],
    ['meta[property="og:description"]', post.description],
    ['meta[property="og:image"]', toAbsolute(post.og_image || post.hero_image)],
    ['meta[property="og:url"]', post.canonical || window.location.href],
    ['meta[name="twitter:title"]', post.title],
    ['meta[name="twitter:description"]', post.description],
    ['meta[name="twitter:image"]', toAbsolute(post.og_image || post.hero_image)]
  ];

  metaMap.forEach(([selector, value]) => {
    const node = document.querySelector(selector);
    if (node && value) {
      node.setAttribute(node.tagName.toLowerCase() === "meta" ? "content" : "href", value);
    }
  });

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical && post.canonical) {
    canonical.setAttribute("href", post.canonical);
  }
}

function renderArticle(post) {
  const titleNode = document.querySelector("[data-article-title]");
  const metaNode = document.querySelector("[data-article-meta]");
  const contentNode = document.querySelector("[data-article-content]");
  const tagsNode = document.querySelector("[data-article-tags]");
  const imageNode = document.querySelector("[data-article-image]");
  const schemaNode = document.querySelector("#article-schema");

  if (!titleNode || !contentNode) return;

  titleNode.textContent = post.title;
  if (metaNode) {
    metaNode.textContent = `${formatDate(post.date)} - ${post.reading_time || "Lecture"} - PPR-Solution`;
  }
  contentNode.innerHTML = post.content_html;

  if (imageNode) {
    imageNode.src = post.hero_image;
    imageNode.alt = `Illustration de l'article ${post.title}`;
  }

  if (tagsNode) {
    tagsNode.innerHTML = post.tags
      .map((tag) => `<span class="tag" aria-label="Etiquette ${tag}">${tag}</span>`)
      .join("");
  }

  if (schemaNode) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.meta_description || post.description,
      image: post.og_image || post.hero_image,
      author: {
        "@type": "Organization",
        name: "PPR-Solution"
      },
      publisher: {
        "@type": "Organization",
        name: "PPR-Solution",
        logo: {
          "@type": "ImageObject",
          url: "https://gooseppr.github.io/ppr_solution_site/assets/img/og-default.jpg"
        }
      },
      datePublished: post.date,
      dateModified: post.date,
      mainEntityOfPage: post.canonical || window.location.href
    };
    schemaNode.textContent = JSON.stringify(schema, null, 2);
  }

  updateArticleMeta(post);
}

async function handleArticlePage() {
  const isArticle = Boolean(document.querySelector("[data-article-content]"));
  if (!isArticle) return;

  try {
    const response = await fetch("blog/posts.json", { cache: "no-cache" });
    const posts = await response.json();

    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");

    const post = posts.find((item) => item.slug === slug);
    if (post) {
      renderArticle(post);
    } else {
      const container = document.querySelector("[data-article-content]");
      if (container) {
        container.innerHTML =
          '<p class="text-muted">Article introuvable. Retournez au <a href="blog.html">blog</a>.</p>';
      }
    }
  } catch (error) {
    const container = document.querySelector("[data-article-content]");
    if (container) {
      container.innerHTML = "<p class=\"text-muted\">Impossible de charger l'article pour le moment.</p>";
    }
  }
}

function updateFooterYear() {
  const yearNode = document.querySelector("#footer-year");
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupSkipLink();
  initNavbar();
  initThemeToggle();
  handleArticlePage();
  updateFooterYear();
});

window.formatDate = formatDate;
