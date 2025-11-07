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

  function markActiveNav() {
    const current = window.location.pathname.split("/").pop() || "index.html";
    navLinks.forEach((link) => {
      const target = link.getAttribute("href");
      if (!target) return;
      const normalized = target.split("/").pop() || "index.html";
      if (normalized === current || (normalized === "blog.html" && current === "article.html")) {
        link.classList.add("is-active");
      } else {
        link.classList.remove("is-active");
      }
    });
  }

  markActiveNav();

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    menu.addEventListener("click", (event) => {
      if (event.target.matches("a")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }
}

async function mockServiceStatus() {
  const banner = document.querySelector("[data-service-status]");
  if (!banner) return;

  const textNode = banner.querySelector("[data-status-text]");

  if (textNode) {
    textNode.textContent = "Statut service : verification...";
  }

  try {
    // TODO: remplacer par un vrai appel HTTP vers votre API de supervision.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    banner.dataset.status = "ok";
    if (textNode) {
      textNode.textContent = "Statut service : operationnel (demo)";
    }
  } catch (error) {
    banner.dataset.status = "down";
    if (textNode) {
      textNode.textContent = "Statut service : indisponible (mock)";
    }
  }
}

function renderBlogList(posts) {
  const container = document.querySelector("[data-blog-list]");
  if (!container) return;

  container.innerHTML = "";

  posts.forEach((post) => {
    const card = document.createElement("article");
    card.className = "blog-card";
    card.innerHTML = `
      <div class="blog-meta">
        <span>${formatDate(post.date)}</span>
        ${post.reading_time ? `<span>${post.reading_time}</span>` : ""}
      </div>
      <h3>${post.title}</h3>
      <p>${post.summary}</p>
      <div>
        ${post.tags
          .map((tag) => `<span class="tag" aria-label="Etiquette ${tag}">${tag}</span>`)
          .join("")}
      </div>
      <div>
        <a class="btn btn-ghost" href="article.html?slug=${encodeURIComponent(post.slug)}">Lire l'article</a>
      </div>
    `;
    container.appendChild(card);
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
          url: "https://www.ppr-solution.com/assets/img/og-default.jpg"
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

async function handleBlogPages() {
  const isBlogIndex = Boolean(document.querySelector("[data-blog-list]"));
  const isArticle = Boolean(document.querySelector("[data-article-content]"));

  if (!isBlogIndex && !isArticle) return;

  try {
    const response = await fetch("blog/posts.json", { cache: "no-cache" });
    const posts = await response.json();

    if (isBlogIndex) {
      renderBlogList(posts);
    }

    if (isArticle) {
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
    }
  } catch (error) {
    const container = document.querySelector("[data-blog-list]");
    if (container) {
      container.innerHTML = "<p class=\"text-muted\">Impossible de charger les articles pour le moment.</p>";
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
  mockServiceStatus();
  handleBlogPages();
  updateFooterYear();
});

window.formatDate = formatDate;
