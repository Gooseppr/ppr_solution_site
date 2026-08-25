#!/usr/bin/env node
/**
 * Générateur statique pour les articles de blog PPR-Solution.
 *
 * Lit blog/posts.json et écrit une page HTML statique autonome par article
 * dans blog/<slug>/index.html (title, meta description, canonical, Open
 * Graph, Twitter Card, JSON-LD Article et contenu directement dans le HTML,
 * sans dépendre de l'exécution JavaScript pour le SEO).
 *
 * Usage : node scripts/build-blog.js
 * (aucune dépendance externe : Node.js seul suffit)
 */

const fs = require("fs");
const path = require("path");

const SITE_ROOT = path.join(__dirname, "..");
const POSTS_PATH = path.join(SITE_ROOT, "blog", "posts.json");
const BASE_URL = "https://gooseppr.github.io/ppr_solution_site";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function formatDateFr(dateString) {
  try {
    return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(dateString));
  } catch (error) {
    return dateString;
  }
}

function toAbsolute(url) {
  if (!url) return url;
  if (/^[a-z]+:/i.test(url)) return url;
  return `${BASE_URL}/${url.replace(/^\/+/, "")}`;
}

function renderPage(post) {
  const canonical = `${BASE_URL}/blog/${post.slug}/`;
  const heroImage = toAbsolute(post.og_image || post.hero_image);
  const metaDescription = escapeHtml(post.meta_description || post.description);
  const title = escapeHtml(post.title);
  const tagsHtml = (post.tags || [])
    .map((tag) => `<span class="tag" aria-label="Etiquette ${escapeHtml(tag)}">${escapeHtml(tag)}</span>`)
    .join("");

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: "PPR-Solution",
        url: `${BASE_URL}/`
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: `${BASE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog.html` },
          { "@type": "ListItem", position: 3, name: post.title, item: canonical }
        ]
      },
      {
        "@type": "Article",
        headline: post.title,
        description: post.meta_description || post.description,
        image: heroImage,
        author: { "@type": "Organization", name: "PPR-Solution" },
        publisher: {
          "@type": "Organization",
          name: "PPR-Solution",
          logo: { "@type": "ImageObject", url: `${BASE_URL}/assets/img/og-default.jpg` }
        },
        datePublished: post.date,
        dateModified: post.date,
        mainEntityOfPage: canonical
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} · Blog PPR-Solution</title>
  <meta name="description" content="${metaDescription}">
  <link rel="canonical" href="${canonical}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../assets/css/style.css">
  <link rel="icon" href="../../assets/favicon/favicon.ico" sizes="32x32">
  <link rel="apple-touch-icon" href="../../assets/favicon/icon-192.png">
  <link rel="manifest" href="../../manifest.webmanifest">
  <meta name="theme-color" content="#0f3f91">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${heroImage}">
  <meta property="og:locale" content="fr_FR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${metaDescription}">
  <meta name="twitter:image" content="${heroImage}">
  <script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
  </script>
</head>
<body>
  <a class="skip-link" href="#main-content">Aller au contenu</a>
  <header class="navbar">
    <div class="container nav-inner">
      <a class="brand" href="../../index.html">
        <span class="brand-mark">PPR</span>
        <span>PPR-Solution</span>
      </a>
      <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="primary-navigation">
        <span class="sr-only">Ouvrir le menu</span>
        <span class="nav-icon"></span>
      </button>
      <nav class="primary-nav" id="primary-navigation" data-nav-menu>
        <a data-nav-link href="../../index.html">Accueil</a>
        <a data-nav-link href="../../services.html">Services</a>
        <a data-nav-link href="../../demonstrations.html">Démonstrations</a>
        <a data-nav-link href="../../a-propos.html">À propos</a>
        <a data-nav-link href="../../contact.html">Contact</a>
      </nav>
    </div>
  </header>

  <main id="main-content">
    <section class="section-hero">
      <div class="container">
        <div class="hero">
          <div class="hero-content">
            <div class="breadcrumbs">
              <a href="../../index.html">Accueil</a> · <a href="../../blog.html">Blog</a> · <span aria-current="page">${title}</span>
            </div>
            <h1>${title}</h1>
            <p class="text-muted">${formatDateFr(post.date)} · ${escapeHtml(post.reading_time || "Lecture")} · PPR-Solution</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section section-tight">
      <div class="container">
        <article class="article-body">
          <img src="${heroImage}" alt="Illustration de l'article ${title}" loading="lazy">
          <div>${post.content_html}</div>
          <div class="article-tags">${tagsHtml}</div>
          <div class="article-cta">
            <h2>Aller plus loin</h2>
            <div class="cta-group">
              <a class="btn btn-primary" href="../../services.html">Voir nos services</a>
              <a class="btn btn-outline" href="../../demonstrations.html">Voir une démonstration</a>
              <a class="btn btn-outline" href="../../contact.html">Demander un prédiagnostic</a>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <p>© <span id="footer-year"></span> PPR-Solution · Prestations XML et documentation structurée</p>
      <div class="footer-links">
        <a href="../../a-propos.html">À propos</a>
        <a href="../../blog.html">Blog</a>
        <a href="../../charte-ethique.html">Charte éthique</a>
        <a href="../../mentions-legales.html">Mentions légales</a>
        <a href="../../confidentialite.html">Confidentialité</a>
      </div>
    </div>
  </footer>

  <script src="../../assets/js/main.js" defer></script>
</body>
</html>
`;
}

function main() {
  const posts = JSON.parse(fs.readFileSync(POSTS_PATH, "utf8"));
  let count = 0;

  posts.forEach((post) => {
    const dir = path.join(SITE_ROOT, "blog", post.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), renderPage(post), "utf8");
    count += 1;
    console.log(`Généré : blog/${post.slug}/index.html`);
  });

  console.log(`${count} page(s) d'article générée(s).`);
}

main();
