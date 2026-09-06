const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..");
const baseUrl = "https://gooseppr.github.io/ppr_solution_site/";
const posts = JSON.parse(fs.readFileSync(path.join(root, "blog", "posts.json"), "utf8"));
const { BLOG_PAGE_SIZE, READING_WORDS_PER_MINUTE, addHeadingIds, countReadableWords, preparePost, readingTimeMinutes } = require("../scripts/build-blog");

const articlePaths = posts.map((post) => `blog/${post.slug}/index.html`);
const indexablePaths = [
  "index.html", "services.html", "demonstrations.html", "blog.html", "a-propos.html",
  "contact.html", "validateur.html", "charte-ethique.html", "mentions-legales.html",
  "confidentialite.html", ...articlePaths
];
const importantSocialPaths = [
  "index.html", "services.html", "demonstrations.html", "blog.html", "a-propos.html",
  "contact.html", "validateur.html", ...articlePaths
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function attribute(html, selector, attributeName) {
  let pattern;
  if (selector === "title") return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim() || "";
  if (selector.startsWith("meta:name:")) {
    const name = selector.slice(10).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    pattern = new RegExp(`<meta(?=[^>]*\\bname=["']${name}["'])[^>]*\\b${attributeName}=["']([^"']*)["'][^>]*>`, "i");
  } else if (selector.startsWith("meta:property:")) {
    const property = selector.slice(14).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    pattern = new RegExp(`<meta(?=[^>]*\\bproperty=["']${property}["'])[^>]*\\b${attributeName}=["']([^"']*)["'][^>]*>`, "i");
  } else if (selector === "canonical") {
    pattern = new RegExp(`<link(?=[^>]*\\brel=["'][^"']*canonical[^"']*["'])[^>]*\\b${attributeName}=["']([^"']*)["'][^>]*>`, "i");
  }
  return html.match(pattern)?.[1] || "";
}

function mainHtml(html) {
  return html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || "";
}

function canonicalFor(relativePath) {
  if (relativePath === "index.html") return baseUrl;
  if (relativePath.startsWith("blog/") && relativePath.endsWith("/index.html")) {
    return `${baseUrl}${relativePath.slice(0, -"index.html".length)}`;
  }
  return `${baseUrl}${relativePath}`;
}

test("la convention de lecture est documentée et stable", () => {
  assert.equal(READING_WORDS_PER_MINUTE, 220);
  assert.equal(BLOG_PAGE_SIZE, 3);
  assert.equal(readingTimeMinutes("<p>court</p>"), 1);
  assert.equal(readingTimeMinutes(`<p>${"mot ".repeat(220)}</p>`), 1);
  assert.equal(readingTimeMinutes(`<p>${"mot ".repeat(221)}</p>`), 2);
  assert.equal(countReadableWords("<h2>Titre utile</h2><ul><li>Premier point</li><li>Second point</li></ul>"), 6);
  assert.equal(countReadableWords("<p>Exemple</p><pre><code>const resultat = source + cible;</code></pre>"), 5);
  assert.equal(countReadableWords("<script>mots non lus</script><style>autres mots</style><p>Texte lu</p>"), 2);
});

test("les temps calculés alimentent les cartes, les articles et Schema.org", () => {
  const blog = read("blog.html");
  for (const rawPost of posts) {
    const post = preparePost(rawPost);
    assert.match(blog, new RegExp(`data-slug="${post.slug}"[^>]*data-reading-time="${post.reading_time}"`));
    const article = read(`blog/${post.slug}/index.html`);
    assert.match(article, new RegExp(`<span>${post.reading_time}<\\/span>`));
    assert.match(article, new RegExp(`"timeRequired": "PT${post.reading_minutes}M"`));
  }
});

test("les titres, descriptions et canonicals des pages indexables sont présents et uniques", () => {
  const titles = new Set();
  const descriptions = new Set();
  const canonicals = new Set();
  for (const relativePath of indexablePaths) {
    const html = read(relativePath);
    const title = attribute(html, "title");
    const description = attribute(html, "meta:name:description", "content");
    const canonical = attribute(html, "canonical", "href");
    assert.ok(title, `${relativePath}: title absent`);
    assert.ok(description, `${relativePath}: description absente`);
    assert.equal(canonical, canonicalFor(relativePath), `${relativePath}: canonical incohérent`);
    assert.ok(!titles.has(title), `${relativePath}: title dupliqué`);
    assert.ok(!descriptions.has(description), `${relativePath}: description dupliquée`);
    assert.ok(!canonicals.has(canonical), `${relativePath}: canonical dupliqué`);
    titles.add(title);
    descriptions.add(description);
    canonicals.add(canonical);
  }
});

test("les pages importantes ont un balisage social complet et cohérent", () => {
  for (const relativePath of importantSocialPaths) {
    const html = read(relativePath);
    const canonical = attribute(html, "canonical", "href");
    for (const property of ["og:title", "og:description", "og:type", "og:url", "og:image", "og:locale", "og:image:width", "og:image:height", "og:image:alt"]) {
      assert.ok(attribute(html, `meta:property:${property}`, "content"), `${relativePath}: ${property} absent`);
    }
    assert.equal(attribute(html, "meta:property:og:url", "content"), canonical);
    for (const name of ["twitter:card", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt"]) {
      assert.ok(attribute(html, `meta:name:${name}`, "content"), `${relativePath}: ${name} absent`);
    }
  }
});

test("les données structurées sont du JSON valide et reflètent les pages", () => {
  for (const relativePath of ["index.html", "blog.html", ...articlePaths]) {
    const html = read(relativePath);
    const scripts = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
    assert.ok(scripts.length > 0, `${relativePath}: JSON-LD absent`);
    for (const match of scripts) assert.doesNotThrow(() => JSON.parse(match[1]), `${relativePath}: JSON-LD invalide`);
  }
  for (const relativePath of articlePaths) {
    const html = read(relativePath);
    assert.match(html, /"@type": "BlogPosting"/);
    assert.doesNotMatch(html, /"logo"\s*:/, `${relativePath}: faux logo déclaré`);
  }
});

test("chaque page publique conserve un H1 unique et une hiérarchie principale sans saut", () => {
  for (const relativePath of [...indexablePaths, "404.html"]) {
    const headings = [...mainHtml(read(relativePath)).matchAll(/<h([1-3])\b[^>]*>/gi)].map((match) => Number(match[1]));
    assert.equal(headings.filter((level) => level === 1).length, 1, `${relativePath}: H1`);
    for (let index = 1; index < headings.length; index += 1) {
      assert.ok(headings[index] <= headings[index - 1] + 1, `${relativePath}: saut H${headings[index - 1]} vers H${headings[index]}`);
    }
  }
});

test("les sommaires sont générés depuis les vrais H2 avec des identifiants uniques", () => {
  const duplicate = addHeadingIds("<h2>État</h2><h2>Etat</h2><h2>État</h2>");
  assert.deepEqual(duplicate.headings.map((heading) => heading.id), ["etat", "etat-2", "etat-3"]);
  for (const relativePath of articlePaths) {
    const html = read(relativePath);
    const ids = [...mainHtml(html).matchAll(/<h2\s+id="([^"]+)"/gi)].map((match) => match[1]);
    const toc = html.match(/<nav class="article-toc"[\s\S]*?<\/nav>/i)?.[0] || "";
    const links = [...toc.matchAll(/href="#([^"]+)"/gi)].map((match) => match[1]);
    assert.deepEqual(links, ids, `${relativePath}: sommaire désynchronisé`);
    assert.equal(new Set(ids).size, ids.length, `${relativePath}: id H2 dupliqué`);
  }
});

test("sitemap, noindex et URL d’accueil sont cohérents", () => {
  const sitemap = read("sitemap.xml");
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(new Set(locations), new Set(indexablePaths.map(canonicalFor)));
  assert.ok(locations.includes(baseUrl));
  assert.ok(!locations.some((url) => url.endsWith("/index.html")));
  assert.match(read("404.html"), /<meta name="robots" content="noindex, follow">/);
  assert.match(read("documents/prestations-ppr-solution.html"), /<meta name="robots" content="noindex">/);
  assert.match(read("robots.txt"), new RegExp(`Sitemap: ${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}sitemap\\.xml`));
  assert.equal(attribute(read("index.html"), "meta:property:og:url", "content"), baseUrl);
  assert.match(read("index.html"), new RegExp(`"url":"${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
});

test("les images HTML ont un texte alternatif et des dimensions explicites", () => {
  for (const relativePath of [...indexablePaths, "404.html"]) {
    const images = [...read(relativePath).matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
    for (const image of images) {
      assert.match(image, /\balt="[^"]*"/i, `${relativePath}: alt absent`);
      assert.match(image, /\bwidth="\d+"/i, `${relativePath}: width absent`);
      assert.match(image, /\bheight="\d+"/i, `${relativePath}: height absent`);
    }
  }
});

test("les six articles et la pagination validée restent présents dans le HTML", () => {
  const blog = read("blog.html");
  assert.equal((blog.match(/data-blog-post\b/g) || []).length, posts.length);
  assert.equal((blog.match(/class="article-card-link"/g) || []).length, posts.length);
  assert.match(blog, /data-blog-page-size="3"/);
  assert.doesNotMatch(blog, /article-vedette|featured/i);
});
