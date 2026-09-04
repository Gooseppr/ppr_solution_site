#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const SITE_ROOT = path.join(__dirname, "..");
const POSTS_PATH = path.join(SITE_ROOT, "blog", "posts.json");
const BASE_URL = "https://gooseppr.github.io/ppr_solution_site";
const SOCIAL_IMAGE = `${BASE_URL}/assets/img/og-default.jpg`;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function formatDateFr(dateString) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${dateString}T00:00:00Z`));
}

function nav(prefix = "") {
  return `<header class="navbar"><div class="container nav-inner"><a class="brand" href="${prefix}index.html"><span class="brand-mark">PPR</span><span>PPR-Solution</span></a><button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="primary-navigation"><span class="sr-only">Ouvrir le menu</span><span class="nav-icon"></span></button><nav class="primary-nav" id="primary-navigation" data-nav-menu><a data-nav-link href="${prefix}services.html">Prestations</a><a data-nav-link href="${prefix}demonstrations.html">Démonstrations</a><a data-nav-link href="${prefix}blog.html">Blog</a><a data-nav-link href="${prefix}a-propos.html">À propos</a><a class="btn btn-primary nav-cta" href="${prefix}contact.html">Contact</a></nav></div></header>`;
}

function footer(prefix = "") {
  return `<footer class="site-footer"><div class="container footer-grid"><div><strong>PPR-Solution</strong><p class="muted">Documentation structurée &amp; données exploitables</p><p class="muted">© <span id="footer-year">2026</span> PPR-Solution</p></div><div><h3>Navigation</h3><div class="footer-links"><a href="${prefix}services.html">Prestations</a><a href="${prefix}demonstrations.html">Démonstrations</a><a href="${prefix}blog.html">Blog</a><a href="${prefix}a-propos.html">À propos</a><a href="${prefix}contact.html">Contact</a></div></div><div><h3>Informations</h3><div class="footer-links"><a href="${prefix}confidentialite.html">Confidentialité</a><a href="${prefix}mentions-legales.html">Mentions légales</a><a href="${prefix}charte-ethique.html">Charte éthique</a></div></div></div></footer>`;
}

function head({ title, description, canonical, prefix = "", type = "article", published, updated }) {
  const articleDates = type === "article"
    ? `<meta property="article:published_time" content="${escapeHtml(published)}"><meta property="article:modified_time" content="${escapeHtml(updated || published)}">`
    : "";
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${escapeHtml(canonical)}"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;650;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="${prefix}assets/css/style.css"><noscript><style>@media (max-width: 760px) { .nav-inner { flex-wrap: wrap; } .nav-toggle { display: none; } .primary-nav { position: static; width: 100%; display: flex; flex-direction: column; align-items: stretch; border: 0; padding: 0 0 1rem; } }</style></noscript><link rel="icon" href="${prefix}assets/favicon/favicon.ico" sizes="32x32"><link rel="apple-touch-icon" href="${prefix}assets/favicon/icon-192.png"><link rel="manifest" href="${prefix}manifest.webmanifest"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:type" content="${type}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:site_name" content="PPR-Solution"><meta property="og:locale" content="fr_FR"><meta property="og:image" content="${SOCIAL_IMAGE}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="PPR-Solution — documentation structurée et données exploitables">${articleDates}<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${SOCIAL_IMAGE}"><meta name="twitter:image:alt" content="PPR-Solution — documentation structurée et données exploitables"><meta name="theme-color" content="#124C8C">`;
}

function decodeEntities(value) {
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function headingSlug(value) {
  const plainText = decodeEntities(String(value).replace(/<[^>]*>/g, " "));
  return plainText
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-FR")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";
}

function addHeadingIds(html) {
  const used = new Map();
  const headings = [];
  const content = html.replace(/<h2(?:\s[^>]*)?>([\s\S]*?)<\/h2>/gi, (match, labelHtml) => {
    const base = headingSlug(labelHtml);
    const count = (used.get(base) || 0) + 1;
    used.set(base, count);
    const id = count === 1 ? base : `${base}-${count}`;
    const label = decodeEntities(String(labelHtml).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
    headings.push({ id, label });
    return `<h2 id="${id}">${labelHtml}</h2>`;
  });
  return { content, headings };
}

function enhanceArticleTables(html) {
  const unwrapped = html.replace(/<div class="table-wrap">\s*(<table class="mapping-table">[\s\S]*?<\/table>)\s*<\/div>/gi, "$1");
  return unwrapped.replace(/<table class="mapping-table">([\s\S]*?)<\/table>/gi, (match, tableContent) => {
    const caption = /<caption(?:\s[^>]*)?>/i.test(tableContent) ? "" : '<caption class="sr-only">Correspondances entre la source et la cible</caption>';
    return `<div class="table-wrap"><table class="mapping-table">${caption}${tableContent}</table></div>`;
  });
}

function renderToc(headings) {
  if (headings.length < 2) return "";
  const items = headings.map((heading) => `<li><a href="#${heading.id}">${escapeHtml(heading.label)}</a></li>`).join("");
  return `<nav class="article-toc" aria-label="Sommaire de l’article"><p class="eyebrow">Dans cet article</p><ol>${items}</ol></nav>`;
}

function postDataAttributes(post) {
  return `data-blog-post data-slug="${escapeHtml(post.slug)}" data-title="${escapeHtml(post.title)}" data-description="${escapeHtml(post.description)}" data-category="${escapeHtml(post.category || "Blog")}" data-tags="${escapeHtml((post.tags || []).join("|"))}" data-date="${escapeHtml(post.date)}" data-reading-time="${escapeHtml(post.reading_time || "Lecture")}"`;
}

function renderTags(tags = []) {
  return `<ul class="blog-tag-list" aria-label="Sujets">${tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul>`;
}

function renderPostCard(post) {
  return `<article class="blog-card" ${postDataAttributes(post)}><a class="article-card-link" href="blog/${escapeHtml(post.slug)}/"><p class="meta"><span class="blog-card-category">${escapeHtml(post.category || "Blog")}</span><span><time datetime="${escapeHtml(post.date)}">${formatDateFr(post.date)}</time><span aria-hidden="true"> · </span>${escapeHtml(post.reading_time || "Lecture")}</span></p><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.description)}</p>${renderTags(post.tags)}<span class="blog-read-label">Lire l’article →</span></a></article>`;
}

function usefulValues(posts, key) {
  const counts = new Map();
  posts.forEach((post) => {
    const values = Array.isArray(post[key]) ? new Set(post[key]) : new Set([post[key]].filter(Boolean));
    values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  });
  return [...counts.entries()]
    .filter(([, count]) => count < posts.length)
    .map(([value]) => value)
    .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
}

function renderSelect({ id, label, dataAttribute, allLabel, values }) {
  if (values.length < 2) return "";
  return `<div class="blog-control-field"><label for="${id}">${label}</label><select id="${id}" ${dataAttribute}><option value="all">${allLabel}</option>${values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}</select></div>`;
}

function renderArticle(post, previous, next) {
  const canonical = `${BASE_URL}/blog/${post.slug}/`;
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "Organization", "@id": `${BASE_URL}/#organization`, name: "PPR-Solution", url: `${BASE_URL}/` },
    { "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`, itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog.html` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical }
    ]},
    { "@type": "Article", headline: post.title, description: post.meta_description || post.description, image: SOCIAL_IMAGE, author: { "@type": "Organization", name: "PPR-Solution" }, publisher: { "@type": "Organization", name: "PPR-Solution", logo: { "@type": "ImageObject", url: SOCIAL_IMAGE } }, datePublished: post.date, dateModified: post.updated || post.date, mainEntityOfPage: canonical }
  ]};
  const related = [previous, next].filter(Boolean).map((item) => `<li><a href="../${escapeHtml(item.slug)}/">${escapeHtml(item.title)}</a></li>`).join("");
  const serviceUrl = post.service_url || "services.html";
  const serviceLabel = post.service_label || "Prestations XML";
  const demoUrl = post.demo_url || "demonstrations.html";
  const demoLabel = post.demo_label || "Démonstrations techniques";
  const contactLabel = post.contact_label;
  const contactContext = post.contact_context;
  const connections = `<hr class="rule"><section class="article-connections" aria-labelledby="pour-aller-plus-loin"><h2 id="pour-aller-plus-loin">Pour aller plus loin</h2><div class="article-connection-grid"><div><p class="eyebrow">Prestation associée</p><h3><a href="../../${escapeHtml(serviceUrl)}">${escapeHtml(serviceLabel)}</a></h3></div><div><p class="eyebrow">Démonstration associée</p><h3><a href="../../${escapeHtml(demoUrl)}">${escapeHtml(demoLabel)}</a></h3></div></div><div class="article-conversion"><p>${escapeHtml(contactContext)}</p><a class="btn btn-primary" href="../../contact.html">${escapeHtml(contactLabel)}</a></div></section>`;
  const relatedSection = related ? `<section class="article-related" aria-labelledby="articles-lies"><h2 id="articles-lies">Articles liés</h2><ul>${related}</ul></section>` : "";
  const enhanced = addHeadingIds(`${enhanceArticleTables(post.content_html)}${connections}${relatedSection}`);
  const toc = renderToc(enhanced.headings);
  const safeSchema = JSON.stringify(schema, null, 2).replace(/</g, "\\u003c");

  return `<!DOCTYPE html><html lang="fr"><head>${head({ title: `${post.title} · Blog PPR-Solution`, description: post.meta_description || post.description, canonical, prefix: "../../", published: post.date, updated: post.updated || post.date })}<script type="application/ld+json">${safeSchema}</script></head><body><a class="skip-link" href="#main-content">Aller au contenu</a>${nav("../../")}<main id="main-content"><header class="article-header"><div class="container article-header-inner"><p class="breadcrumbs"><a href="../../index.html">Accueil</a> · <a href="../../blog.html">Blog</a> · <span aria-current="page">${escapeHtml(post.title)}</span></p><p class="eyebrow">${escapeHtml(post.category || (post.tags || ["Blog"])[0])}</p><h1>${escapeHtml(post.title)}</h1><p class="lead">${escapeHtml(post.description)}</p><p class="meta"><span>Publié le <time datetime="${escapeHtml(post.date)}">${formatDateFr(post.date)}</time></span><span>Mis à jour le <time datetime="${escapeHtml(post.updated || post.date)}">${formatDateFr(post.updated || post.date)}</time></span><span>${escapeHtml(post.reading_time || "Lecture")}</span></p></div></header><section class="article-content-section"><div class="container article-main-layout"><aside class="article-sidebar">${toc}<div class="article-tags"><p class="eyebrow">Sujets</p>${renderTags(post.tags)}</div></aside><article class="article-body">${enhanced.content}</article></div></section></main>${footer("../../")}<script src="../../assets/js/main.js" defer></script></body></html>`;
}

function renderBlog(posts) {
  const sorted = posts.map((post, index) => ({ post, index })).sort((a, b) => new Date(b.post.date) - new Date(a.post.date) || a.index - b.index).map(({ post }) => post);
  const categories = [...new Set(posts.map((post) => post.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
  const tags = usefulValues(posts, "tags");
  const cards = sorted.map((post) => renderPostCard(post)).join("");
  const blogSchema = { "@context": "https://schema.org", "@type": "CollectionPage", name: "Ressources documentation, données et technologies · PPR-Solution", url: `${BASE_URL}/blog.html`, mainEntity: { "@type": "ItemList", itemListElement: sorted.map((post, index) => ({ "@type": "ListItem", position: index + 1, url: `${BASE_URL}/blog/${post.slug}/`, name: post.title })) } };
  const safeSchema = JSON.stringify(blogSchema).replace(/</g, "\\u003c");
  const categoryControl = renderSelect({ id: "blog-category", label: "Catégorie", dataAttribute: "data-blog-category", allLabel: "Toutes les catégories", values: categories });
  const tagControl = renderSelect({ id: "blog-tag", label: "Sujet", dataAttribute: "data-blog-tag", allLabel: "Tous les sujets", values: tags });
  const searchIcon = `<svg class="icon" aria-hidden="true"><use href="assets/icons/lucide-sprite.svg#search"></use></svg>`;
  const filterIcon = `<svg class="icon" aria-hidden="true"><use href="assets/icons/lucide-sprite.svg#sliders-horizontal"></use></svg>`;

  return `<!DOCTYPE html><html lang="fr"><head>${head({ title: "Ressources documentation, données et technologies · PPR-Solution", description: "Méthodes et analyses autour de la documentation structurée, des formats techniques, de l’automatisation et de l’IA appliquée.", canonical: `${BASE_URL}/blog.html`, prefix: "", type: "website" })}<script type="application/ld+json">${safeSchema}</script></head><body><a class="skip-link" href="#main-content">Aller au contenu</a>${nav("")}<main id="main-content"><section class="section-tight blog-library-section" id="blog-library" aria-labelledby="blog-library-title"><div class="container"><header class="blog-library-intro"><p class="eyebrow">Ressources &amp; veille</p><h1 id="blog-library-title">Documentation, données et technologies</h1><p class="lead">Méthodes, analyses et actualités autour de la documentation structurée, des formats techniques, de l’automatisation et de l’IA.</p></header><form class="blog-controls" data-blog-controls hidden><div class="blog-control-primary"><div class="blog-control-field blog-search-field"><label for="blog-search">${searchIcon}Rechercher</label><input id="blog-search" type="search" placeholder="Documentation, XML, automatisation…" autocomplete="off" data-blog-search></div><div class="blog-control-field blog-sort-field"><label for="blog-sort">Trier</label><select id="blog-sort" data-blog-sort><option value="newest">Plus récent</option><option value="oldest">Plus ancien</option><option value="title-asc">Titre A–Z</option><option value="title-desc">Titre Z–A</option></select></div></div><details class="blog-filter-details"><summary>${filterIcon}Filtres <span>Catégorie et sujet</span></summary><div class="blog-filter-grid">${categoryControl}${tagControl}</div></details><div class="blog-control-status"><p id="blog-result-count" role="status" aria-live="polite"><strong>${posts.length}</strong> articles</p><button class="btn btn-text" type="button" data-blog-reset hidden>Réinitialiser</button></div></form><p class="blog-data-status" data-blog-data-status role="status" hidden></p><div class="blog-empty-state" data-blog-empty role="status" hidden><p class="eyebrow">Aucun résultat</p><h2>Aucun article ne correspond à cette recherche.</h2><p>Modifiez les critères ou affichez toute la bibliothèque.</p><button class="btn" type="button" data-blog-empty-reset>Afficher tous les articles</button></div><div data-blog-results><div class="blog-card-grid" data-blog-grid>${cards}</div><nav class="blog-pagination" aria-label="Pagination des articles" data-blog-pagination hidden></nav></div></div></section></main>${footer("")}<script src="assets/js/main.js" defer></script><script src="assets/js/blog.js" defer></script></body></html>`;
}

function renderSitemap(posts) {
  const urls = ["index.html", "services.html", "demonstrations.html", "blog.html", "a-propos.html", "contact.html", "validateur.html", "charte-ethique.html", "mentions-legales.html", "confidentialite.html"].map((url) => `${BASE_URL}/${url}`);
  posts.forEach((post) => urls.push(`${BASE_URL}/blog/${post.slug}/`));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>`).join("\n")}\n</urlset>\n`;
}

function validatePosts(posts) {
  if (!Array.isArray(posts) || !posts.length) throw new Error("blog/posts.json doit contenir au moins un article.");
  const slugs = new Set();
  posts.forEach((post, index) => {
    ["slug", "title", "description", "meta_description", "date", "category", "reading_time", "content_html"].forEach((field) => {
      if (!post[field]) throw new Error(`Article ${index + 1} : champ ${field} manquant.`);
    });
    if (!/^[a-z0-9][a-z0-9-]*$/.test(post.slug)) throw new Error(`Slug invalide : ${post.slug}`);
    if (slugs.has(post.slug)) throw new Error(`Slug dupliqué : ${post.slug}`);
    if (!Array.isArray(post.tags) || !post.tags.length) throw new Error(`Tags invalides : ${post.slug}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date) || Number.isNaN(Date.parse(`${post.date}T00:00:00Z`))) {
      throw new Error(`Date invalide : ${post.slug}`);
    }
    ["service_url", "service_label", "demo_url", "demo_label", "contact_label", "contact_context"].forEach((field) => {
      if (!post[field]) throw new Error(`Article ${post.slug} : association ${field} manquante.`);
    });
    slugs.add(post.slug);
  });
}

function main() {
  const posts = JSON.parse(fs.readFileSync(POSTS_PATH, "utf8"));
  validatePosts(posts);
  posts.forEach((post, index) => {
    const directory = path.join(SITE_ROOT, "blog", post.slug);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, "index.html"), renderArticle(post, posts[index - 1], posts[index + 1]), "utf8");
    console.log(`Généré : blog/${post.slug}/index.html`);
  });
  fs.writeFileSync(path.join(SITE_ROOT, "blog.html"), renderBlog(posts), "utf8");
  fs.writeFileSync(path.join(SITE_ROOT, "sitemap.xml"), renderSitemap(posts), "utf8");
  console.log(`${posts.length} article(s), blog.html et sitemap.xml générés.`);
}

main();
