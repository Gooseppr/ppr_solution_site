const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const YAML = require("yaml");
const { parseSource, renderMarkdown, loadPosts, checkTarget } = require("../scripts/blog-markdown");
const { build, preparePost, addHeadingIds, renderArticle, renderBlog, renderSitemap } = require("../scripts/build-blog");
const root = path.join(__dirname, "..");
const base = "https://gooseppr.github.io/ppr_solution_site/";
const metadata = {
  title: "Comprendre le XML", slug: "test-xml", description: "Un exemple de description.",
  meta_description: "Description pour les moteurs.", date: "2026-09-01",
  category: "Documentation structurée", tags: ["XML"]
};
function source(data = metadata, body = "Introduction.\n\n## Une section\n\nUn texte.") {
  return "---\n" + YAML.stringify(data) + "---\n\n" + body + "\n";
}
function isolatedSite(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "ppr-blog-test-"));
  t.after(() => {
    const resolved = fs.realpathSync(directory);
    assert.ok(resolved.startsWith(fs.realpathSync(os.tmpdir()) + path.sep));
    assert.ok(path.basename(resolved).startsWith("ppr-blog-test-"));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  fs.cpSync(path.join(root, "content"), path.join(directory, "content"), { recursive: true });
  for (const file of fs.readdirSync(root).filter(file => file.endsWith(".html"))) {
    fs.copyFileSync(path.join(root, file), path.join(directory, file));
  }
  // Copy only static files referenced by the sources, so future image/document
  // links work in the isolated build without copying the complete demo corpus.
  for (const { post, links } of loadPosts(root, preparePost)) {
    const images = [...post.content_html.matchAll(/src="\.\.\/\.\.\/([^"]+)"/g)].map(match => match[1]);
    for (const url of [...images, ...links]) {
      const relative = decodeURIComponent(url.split("#")[0]);
      if (!relative || relative.startsWith("blog/")) continue;
      const original = path.join(root, relative);
      if (!fs.existsSync(original) || !fs.statSync(original).isFile()) continue;
      const target = path.join(directory, relative);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(original, target);
    }
  }
  return directory;
}

test("chaque Markdown est valide et alimente HTML, JSON, index, sitemap et SEO", () => {
  const sources = loadPosts(root, preparePost);
  const generated = JSON.parse(fs.readFileSync(path.join(root, "blog/posts.json"), "utf8"));
  assert.deepEqual(generated, sources.map(item => item.post));
  assert.equal(new Set(sources.map(item => item.post.slug)).size, sources.length);
  const blog = fs.readFileSync(path.join(root, "blog.html"), "utf8");
  const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  for (const { post, filename, links } of sources) {
    const relative = "blog/" + post.slug + "/index.html";
    const html = fs.readFileSync(path.join(root, relative), "utf8");
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.ok(html.includes('<link rel="canonical" href="' + base + "blog/" + post.slug + '/">'));
    assert.ok(blog.includes('href="blog/' + post.slug + '/"'));
    assert.ok(sitemap.includes("<loc>" + base + "blog/" + post.slug + "/</loc>"));
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const article = schema["@graph"].find(item => item["@type"] === "BlogPosting");
    assert.equal(article.headline, post.title);
    assert.equal(article.description, post.meta_description);
    assert.equal(article.datePublished, post.date);
    assert.equal(article.dateModified, post.updated || post.date);
    for (const url of [post.service_url, post.demo_url, ...links]) checkTarget(url, filename, root, new Map(), relative);
  }
});

test("frontmatter : erreurs nommées, types, dates réelles, YAML strict", () => {
  for (const field of Object.keys(metadata)) {
    const data = { ...metadata };
    delete data[field];
    assert.throws(() => parseSource(source(data), "test-xml.md"), new RegExp('ERROR article "test-xml.md": missing required field: ' + field));
  }
  for (const data of [
    { slug: "../invalid" }, { slug: "XML" }, { slug: "xml--json" },
    { date: "2026-02-30" }, { date: "2025-02-29" }, { date: 2026 },
    { updated: "2026-08-01" }, { updated: "not-a-date" },
    { title: [] }, { category: "   " }, { tags: "XML" }, { tags: [] },
    { tags: ["XML", 3] }, { tags: ["XML", "XML"] }, { tags: ["XML|JSON"] },
    { service: { url: "services.html" } }, { contact: [] },
    { reading_time: 42 }, { order: -1 }, { canonical: "https://example.com/" }
  ]) assert.throws(() => parseSource(source({ ...metadata, ...data }), "test-xml.md"), /ERROR article "test-xml.md":/);
  assert.throws(() => parseSource("---\ntitle: A\ntitle: B\n---\ntext", "duplicate.md"), /invalid YAML/);
  assert.throws(() => parseSource("---\na: &a [1]\nb: *a\n---\ntext", "alias.md"), /invalid YAML/);
  assert.throws(() => parseSource("No frontmatter", "missing.md"), /expected YAML/);
  assert.throws(() => parseSource(source(metadata, ""), "empty.md"), /empty Markdown body/);
  assert.equal(parseSource(source({ ...metadata, date: "2024-02-29" }), "test-xml.md").data.date, "2024-02-29");
});

test("doublons, noms physiques et URLs invalides bloquent sans sorties partielles", t => {
  const directory = isolatedSite(t);
  const outputs = build(directory);
  const articleDirectory = path.join(directory, "content/blog");
  const original = fs.readdirSync(articleDirectory)[0];
  const duplicate = path.join(articleDirectory, "duplicate.md");
  fs.copyFileSync(path.join(articleDirectory, original), duplicate);
  assert.throws(() => build(directory), /duplicate slug\/public URL/);
  fs.unlinkSync(duplicate);
  fs.writeFileSync(duplicate, source());
  assert.throws(() => build(directory), /filename must match slug/);
  fs.unlinkSync(duplicate);
  const badSource = path.join(articleDirectory, "test-xml.md");
  for (const url of ["../services.html", "/services.html", "https://example.com", "missing.html", "services.html#missing", "services.html?bad=1", "%2e%2e/services.html", "C:/Windows"]) {
    fs.writeFileSync(badSource, source({ ...metadata, service: { url, label: "Prestation" } }));
    assert.throws(() => build(directory), /ERROR article "test-xml.md": (invalid internal URL|internal target not found|internal fragment not found)/);
  }
  for (const [relative, html] of outputs) assert.equal(fs.readFileSync(path.join(directory, relative), "utf8"), html);
});

test("Markdown standard, composants, tables accessibles et code non exécuté", () => {
  const body = [
    "Introduction avec **gras**, *italique*, un \`code\` et [W3C](https://www.w3.org/TR/xml/).",
    "## État", "### Détails", "#### Un point", "- Un item\n- Un autre", "1. Premier\n2. Second",
    "\`\`\`xml\n<product id=\"P-482\"><name>Pompe</name></product>\n\`\`\`",
    "> Citation simple.", "> **À retenir**\n>\n> Une note avec **gras**.",
    "---", "| Source | Cible |\n| --- | --- |\n| XML | PDF |",
    ":::table Comparaison\n| Critère | XML |\n| --- | --- |\n| **Structure** | Arbre |\n:::",
    ":::pipeline\nXML SOURCE\nXSLT\nPDF\n:::",
    '<script>alert("XSS")</script>', "[danger](javascript:alert(1))"
  ].join("\n\n");
  const html = renderMarkdown(body, "test-xml.md", root).html;
  for (const expected of ['class="lead"', "<strong>gras</strong>", "<em>italique</em>", "<ol>", "<ul>", "<blockquote>", 'class="note"', '<pre><code class="language-xml">', "&lt;product", '<hr>', 'class="pipeline"', '<th scope="col">', '<th scope="row">Structure</th>', "<caption>Comparaison</caption>"]) assert.ok(html.includes(expected), expected);
  assert.equal((html.match(/class="table-wrap"/g) || []).length, 2);
  assert.doesNotMatch(html, /<script>|href="javascript:/);
  assert.match(html, /&lt;script&gt;/);
  for (const invalid of ["# Interdit", "## Début\n\n#### Saut", "### Sans H2", "## A\n\n### B\n\n#### C\n\n##### Trop profond", ":::pipeline\nNon fermé", ":::table Titre\nPas de tableau\n:::"]) assert.throws(() => renderMarkdown(invalid, "test-xml.md", root), /ERROR article "test-xml.md":/);
});

test("H2/H3 au sommaire, H4 ancré, accents et collisions stables", () => {
  const html = renderMarkdown("## État\n\n### Références\n\n#### Détail\n\n## Etat\n\n## État 2", "test-xml.md", root).html;
  const first = addHeadingIds(html);
  assert.deepEqual(addHeadingIds(html), first);
  assert.deepEqual(first.headings.map(item => item.id), ["etat", "references", "etat-2", "etat-2-2"]);
  assert.ok(first.content.includes('<h4 id="detail">'));
  assert.ok(addHeadingIds('<h2>Main content</h2>').content.includes('id="main-content-2"'));
  const reserved = addHeadingIds('<h2>Pour aller plus loin</h2><h2 id="pour-aller-plus-loin">Pour aller plus loin</h2>');
  assert.deepEqual(reserved.headings.map(item => item.id), ["pour-aller-plus-loin-2", "pour-aller-plus-loin"]);
  const escapedContainer = ':::table Test\n| A | B |\n| --- | --- |\n| a | b |\n\n# H1 caché\n\n| A | B |\n| --- | --- |\n| a | b |\n:::';
  assert.throws(() => renderMarkdown(escapedContainer, "test-xml.md", root), /single table/);
});

test("images PNG/SVG locales : dimensions, alt et chemin calculés au build", () => {
  const svg = fs.readdirSync(path.join(root, "assets/diagrams/generated")).find(file => file.endsWith(".svg"));
  const html = renderMarkdown("![Chaîne de publication](assets/diagrams/generated/" + svg + ")", "test-xml.md", root).html;
  assert.match(html, /src="\.\.\/\.\.\/assets\/diagrams\/generated\//);
  assert.match(html, /width="\d+" height="\d+"/);
  assert.match(html, /alt="Chaîne de publication"/);
  assert.throws(() => renderMarkdown("![](assets/diagrams/generated/" + svg + ")", "test-xml.md", root), /alt text is required/);
  assert.throws(() => renderMarkdown("![Erreur](assets/missing.png)", "test-xml.md", root), /image not found/);
  assert.throws(() => renderMarkdown("![Erreur](https://example.com/image.png)", "test-xml.md", root), /invalid internal URL/);
});

test("deux builds identiques, aucun JSON source requis, sorties commitées synchronisées", t => {
  const directory = isolatedSite(t);
  assert.equal(fs.existsSync(path.join(directory, "blog/posts.json")), false);
  const first = build(directory);
  const second = build(directory);
  assert.deepEqual(second, first);
  for (const [relative, html] of second) {
    assert.equal(fs.readFileSync(path.join(directory, relative), "utf8"), html);
    assert.equal(fs.readFileSync(path.join(root, relative), "utf8").replace(/\r\n/g, "\n"), html.replace(/\r\n/g, "\n"), relative + ": relancer npm run build:blog");
  }
});

test("ajout/retrait synchronise index, JSON, sitemap, filtres et liens vers nouvelles pages", t => {
  const directory = isolatedSite(t);
  const filename = path.join(directory, "content/blog/test-xml.md");
  fs.writeFileSync(filename, source({ ...metadata, category: "Nouvelle catégorie", tags: ["Nouveau sujet"] }, "## État\n\n[Section](#etat)\n\n[Prestation](services.html#controle)"));
  const cross = path.join(directory, "content/blog/autre-xml.md");
  fs.writeFileSync(cross, source({ ...metadata, slug: "autre-xml" }, "## Autre\n\n[Article](blog/test-xml/#etat)"));
  const outputs = build(directory);
  assert.ok(outputs.get("blog/test-xml/index.html").includes('href="../../services.html#controle"'));
  assert.match(outputs.get("blog.html"), /Nouvelle catégorie/);
  assert.match(outputs.get("blog.html"), /Nouveau sujet/);
  assert.ok(JSON.parse(outputs.get("blog/posts.json")).some(post => post.slug === "test-xml"));
  assert.ok(outputs.get("sitemap.xml").includes("/blog/test-xml/"));
  fs.unlinkSync(filename);
  fs.unlinkSync(cross);
  const removed = build(directory);
  assert.ok(!removed.get("sitemap.xml").includes("/blog/test-xml/"));
  assert.ok(!removed.get("blog.html").includes('href="blog/test-xml/'));
  assert.ok(!JSON.parse(removed.get("blog/posts.json")).some(post => post.slug === "test-xml"));
});

test("associations optionnelles, échappement SEO et absence de runtime Markdown", () => {
  const post = preparePost({ ...metadata, title: '</script><script>alert("x")</script>', content_html: "<p>Texte</p>" });
  const html = renderArticle(post);
  assert.doesNotMatch(html, /<script>alert|undefined/);
  assert.match(html, /\\u003c\/script>/);
  assert.match(html, /href="\.\.\/\.\.\/services.html"/);
  assert.doesNotMatch(html, /class="article-conversion"/);
  for (const page of [html, renderBlog([post])]) assert.doesNotMatch(page, /<script[^>]+src="[^"]*(markdown-it|yaml|mermaid)/);
  assert.doesNotMatch(renderSitemap([]), /\/blog\/[^<]+/);
});
