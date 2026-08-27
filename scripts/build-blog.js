#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const SITE_ROOT = path.join(__dirname, "..");
const POSTS_PATH = path.join(SITE_ROOT, "blog", "posts.json");
const BASE_URL = "https://gooseppr.github.io/ppr_solution_site";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#39;" }[char]));
}
function formatDateFr(dateString) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(dateString));
}
function nav(prefix = "") {
  return `<header class="navbar"><div class="container nav-inner"><a class="brand" href="${prefix}index.html"><span class="brand-mark">PPR</span><span>PPR-Solution</span></a><button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="primary-navigation"><span class="sr-only">Ouvrir le menu</span><span class="nav-icon"></span></button><nav class="primary-nav" id="primary-navigation" data-nav-menu><a data-nav-link href="${prefix}services.html">Prestations</a><a data-nav-link href="${prefix}demonstrations.html">Démonstrations</a><a data-nav-link href="${prefix}blog.html">Blog</a><a data-nav-link href="${prefix}a-propos.html">À propos</a><a class="btn btn-primary nav-cta" href="${prefix}contact.html">Contact</a></nav></div></header>`;
}
function footer(prefix = "") {
  return `<footer class="site-footer"><div class="container footer-grid"><div><strong>PPR-Solution</strong><p class="muted">Prestations XML & données structurées</p><p class="muted">© <span id="footer-year"></span> PPR-Solution</p></div><div><h3>Navigation</h3><div class="footer-links"><a href="${prefix}services.html">Prestations</a><a href="${prefix}demonstrations.html">Démonstrations</a><a href="${prefix}blog.html">Blog</a><a href="${prefix}a-propos.html">À propos</a><a href="${prefix}contact.html">Contact</a></div></div><div><h3>Informations</h3><div class="footer-links"><a href="${prefix}confidentialite.html">Confidentialité</a><a href="${prefix}mentions-legales.html">Mentions légales</a><a href="${prefix}charte-ethique.html">Charte éthique</a></div></div></div></footer>`;
}
function head({ title, description, canonical, prefix = "", type = "article" }) {
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${canonical}"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;650;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="${prefix}assets/css/style.css"><link rel="icon" href="${prefix}assets/favicon/favicon.ico" sizes="32x32"><link rel="apple-touch-icon" href="${prefix}assets/favicon/icon-192.png"><link rel="manifest" href="${prefix}manifest.webmanifest"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:type" content="${type}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${BASE_URL}/assets/img/og-default.jpg"><meta name="theme-color" content="#124C8C">`;
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
    { "@type": "Article", headline: post.title, description: post.meta_description || post.description, author: { "@type": "Organization", name: "PPR-Solution" }, publisher: { "@type": "Organization", name: "PPR-Solution", logo: { "@type": "ImageObject", url: `${BASE_URL}/assets/img/og-default.jpg` } }, datePublished: post.date, dateModified: post.updated || post.date, mainEntityOfPage: canonical }
  ]};
  const related = [previous, next].filter(Boolean).map((p) => `<li><a href="../${p.slug}/">${escapeHtml(p.title)}</a></li>`).join("");
  return `<!DOCTYPE html><html lang="fr"><head>${head({ title: `${post.title} · Blog PPR-Solution`, description: post.meta_description || post.description, canonical, prefix: "../../" })}<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script></head><body><a class="skip-link" href="#main-content">Aller au contenu</a>${nav("../../")}<main id="main-content"><section class="section-hero"><div class="container article-shell"><div><p class="breadcrumbs"><a href="../../index.html">Accueil</a> · <a href="../../blog.html">Blog</a> · <span aria-current="page">${escapeHtml(post.title)}</span></p><p class="eyebrow">${escapeHtml(post.category || (post.tags || ["Blog"])[0])}</p><h1>${escapeHtml(post.title)}</h1><p class="lead">${escapeHtml(post.description)}</p><p class="meta">Publié le ${formatDateFr(post.date)}${post.updated ? ` · Mis à jour le ${formatDateFr(post.updated)}` : ""} · ${escapeHtml(post.reading_time || "Lecture")}</p></div><aside class="article-aside"><p class="eyebrow">Sommaire</p><ol><li>Contexte</li><li>Méthode</li><li>Livrables</li></ol></aside></div></section><section class="section-tight"><div class="container article-shell"><article class="article-body">${post.content_html}<hr class="rule"><h2>Prestation associée</h2><p>Ce sujet correspond aux prestations de contrôle, extraction, transformation ou documentation XML selon le contexte.</p><p><a class="btn" href="../../services.html">Voir les prestations</a></p><h2>Démonstration associée</h2><p><a href="../../demonstrations.html">Voir les démonstrations techniques →</a></p>${related ? `<h2>Articles liés</h2><ul>${related}</ul>` : ""}</article><aside class="article-aside"><p class="eyebrow">Tags</p><p>${(post.tags || []).map(escapeHtml).join(" · ")}</p></aside></div></section></main>${footer("../../")}<script src="../../assets/js/main.js" defer></script></body></html>`;
}
function renderBlog(posts) {
  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  const featured = sorted[0];
  const rows = sorted.slice(1).map((post) => `<article class="article-row"><div><p class="meta">${escapeHtml(post.category || "Blog")} · ${formatDateFr(post.date)}</p></div><div><h3><a href="blog/${post.slug}/">${escapeHtml(post.title)}</a></h3><p>${escapeHtml(post.description)}</p></div></article>`).join("");
  return `<!DOCTYPE html><html lang="fr"><head>${head({ title: "Blog PPR-Solution · XML, données structurées et S1000D", description: "Analyses, méthodes et retours techniques autour de XML, des données structurées et de S1000D.", canonical: `${BASE_URL}/blog.html`, prefix: "", type: "website" })}</head><body><a class="skip-link" href="#main-content">Aller au contenu</a>${nav("")}<main id="main-content"><section class="section-hero"><div class="container blog-hero-layout"><div><p class="eyebrow">Blog</p><h1>Analyses et méthodes XML</h1></div><p class="lead">Articles techniques autour de XML, des données structurées, de la validation, de l’extraction, de la transformation et de S1000D.</p></div></section><section class="section-tight"><div class="container"><p class="eyebrow">Article mis en avant</p><article class="featured-article"><div><p class="meta">${escapeHtml(featured.category)} · ${formatDateFr(featured.date)}</p></div><div><h2><a href="blog/${featured.slug}/">${escapeHtml(featured.title)}</a></h2><p>${escapeHtml(featured.description)}</p><a href="blog/${featured.slug}/">Lire →</a></div></article></div></section><section class="section-tight"><div class="container"><h2>Derniers articles</h2><div class="article-list">${rows}</div></div></section></main>${footer("")}<script src="assets/js/main.js" defer></script></body></html>`;
}
function renderSitemap(posts) {
  const urls = ["index.html", "services.html", "demonstrations.html", "blog.html", "a-propos.html", "contact.html", "validateur.html", "charte-ethique.html", "mentions-legales.html", "confidentialite.html"].map((url) => `${BASE_URL}/${url}`);
  posts.forEach((post) => urls.push(`${BASE_URL}/blog/${post.slug}/`));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url>\n    <loc>${u}</loc>\n  </url>`).join("\n")}\n</urlset>\n`;
}
function main() {
  const posts = JSON.parse(fs.readFileSync(POSTS_PATH, "utf8"));
  posts.forEach((post, index) => {
    const dir = path.join(SITE_ROOT, "blog", post.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), renderArticle(post, posts[index - 1], posts[index + 1]), "utf8");
    console.log(`Généré : blog/${post.slug}/index.html`);
  });
  fs.writeFileSync(path.join(SITE_ROOT, "blog.html"), renderBlog(posts), "utf8");
  fs.writeFileSync(path.join(SITE_ROOT, "sitemap.xml"), renderSitemap(posts), "utf8");
  console.log(`${posts.length} article(s), blog.html et sitemap.xml générés.`);
}
main();