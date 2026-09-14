const fs = require("node:fs");
const path = require("node:path");
const MarkdownIt = require("markdown-it");
const YAML = require("yaml");

function fail(filename, message) {
  throw new Error('ERROR article "' + filename + '": ' + message);
}

function parseSource(source, filename) {
  const match = source.replace(/^\uFEFF/, "").match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) fail(filename, "expected YAML frontmatter between --- delimiters");
  let data;
  try {
    const document = YAML.parseDocument(match[1], { version: "1.2", uniqueKeys: true });
    if (document.errors.length || document.warnings.length) {
      throw new Error([...document.errors, ...document.warnings].map(item => item.message).join("; "));
    }
    data = document.toJS({ maxAliasCount: 0 });
  } catch (error) {
    fail(filename, "invalid YAML: " + error.message);
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) fail(filename, "frontmatter must be a mapping");
  const allowed = new Set(["title", "slug", "description", "meta_description", "date", "updated", "category", "tags", "service", "demonstration", "contact", "order"]);
  for (const field of Object.keys(data)) {
    if (!allowed.has(field)) fail(filename, "unknown field: " + field);
  }
  for (const field of ["title", "slug", "description", "meta_description", "date", "category", "tags"]) {
    if (data[field] === undefined || data[field] === null || data[field] === "") fail(filename, "missing required field: " + field);
  }
  for (const field of ["title", "slug", "description", "meta_description", "category"]) {
    if (typeof data[field] !== "string" || !data[field].trim()) fail(filename, "expected non-empty string: " + field);
    data[field] = data[field].trim();
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) fail(filename, "invalid slug: " + data.slug);
  for (const field of ["date", "updated"]) {
    if (field === "updated" && data[field] === undefined) continue;
    const date = data[field];
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isFinite(Date.parse(date + "T00:00:00Z")) ||
        new Date(date + "T00:00:00Z").toISOString().slice(0, 10) !== date) {
      fail(filename, "invalid date (YYYY-MM-DD): " + field);
    }
  }
  if (data.updated && data.updated < data.date) fail(filename, "updated precedes date");
  if (!Array.isArray(data.tags) || !data.tags.length ||
      data.tags.some(tag => typeof tag !== "string" || !tag.trim() || tag !== tag.trim() || tag.includes("|"))) {
    fail(filename, "tags must be a non-empty list of non-empty strings without |");
  }
  if (new Set(data.tags).size !== data.tags.length) fail(filename, "duplicate tag");
  if (data.order !== undefined && (!Number.isSafeInteger(data.order) || data.order < 0)) fail(filename, "order must be a non-negative integer");
  for (const field of ["service", "demonstration", "contact"]) {
    if (data[field] === undefined) continue;
    const keys = field === "contact" ? ["label", "context"] : ["url", "label"];
    const value = data[field];
    if (!value || typeof value !== "object" || Array.isArray(value)) fail(filename, field + " must be a mapping");
    if (Object.keys(value).some(key => !keys.includes(key))) fail(filename, "unknown field in " + field);
    for (const key of keys) {
      if (typeof value[key] !== "string" || !value[key].trim()) fail(filename, "expected non-empty string: " + field + "." + key);
    }
  }
  if (!match[2].trim()) fail(filename, "empty Markdown body");
  return { data, body: match[2], filename };
}

// Authors use site-root logical paths, never filesystem paths or ../../.
// No network fetches are made during build.
function localUrl(value, filename) {
  if (typeof value !== "string" || /[\s\\<>"\x00-\x1f]/.test(value) ||
      value.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(value) || value.includes("?")) {
    fail(filename, "invalid internal URL: " + value);
  }
  let decoded;
  try { decoded = decodeURIComponent(value); } catch { fail(filename, "invalid URL encoding: " + value); }
  if (/[\\<>"\x00-\x1f]/.test(decoded) || decoded.split(/[\/#]/).some(part => part === ".." || part === ".") ||
      /^[a-z][a-z0-9+.-]*:/i.test(decoded) || decoded.startsWith("/")) fail(filename, "invalid internal URL: " + value);
  return decoded;
}

function checkTarget(value, filename, siteRoot, generated = new Map(), currentPath = "") {
  const decoded = localUrl(value, filename);
  const [pathname, fragment, extra] = decoded.split("#");
  if (extra !== undefined) fail(filename, "invalid internal URL: " + value);
  let relative = pathname || currentPath;
  if (!relative || relative.endsWith("/")) relative += "index.html";
  let html = generated.get(relative);
  if (html === undefined) {
    const target = path.resolve(siteRoot, relative);
    if (!target.startsWith(path.resolve(siteRoot) + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
      fail(filename, "internal target not found: " + value);
    }
    html = fs.readFileSync(target, "utf8");
  }
  if (fragment && ![...html.matchAll(/\bid=["']([^"']+)["']/g)].some(match => match[1] === fragment)) {
    fail(filename, "internal fragment not found: " + value);
  }
}

function renderMarkdown(body, filename, siteRoot) {
  const md = new MarkdownIt({ html: false, linkify: false, typographer: false });
  const escape = md.utils.escapeHtml;
  // Two small, controlled components; labels are always text, never raw HTML.
  md.block.ruler.before("fence", "ppr_container", (state, start, end, silent) => {
    const line = state.src.slice(state.bMarks[start] + state.tShift[start], state.eMarks[start]);
    const match = line.match(/^:::(pipeline|table)(?:[ \t]+(.+))?$/);
    if (!match || state.sCount[start] - state.blkIndent >= 4) return false;
    if (silent) return true;
    let close = start + 1;
    while (close < end && state.src.slice(state.bMarks[close] + state.tShift[close], state.eMarks[close]).trim() !== ":::") close++;
    if (close === end) fail(filename, "unclosed :::" + match[1] + " block");
    const inner = state.getLines(start + 1, close, state.blkIndent, false).trim();
    let html;
    if (match[1] === "pipeline") {
      if (match[2] || !inner) fail(filename, "pipeline expects plain-text steps on separate lines");
      html = '<div class="pipeline">' + inner.split(/\r?\n/).filter(item => item.trim()).map(item => "<span>" + escape(item.trim()) + "</span>").join("") + "</div>\n";
    } else {
      if (!match[2] || inner.includes(":::")) fail(filename, "table expects a caption and a single Markdown table");
      const tokens = md.parse(inner, state.env);
      if (tokens[0]?.type !== "table_open" || tokens.at(-1)?.type !== "table_close" ||
          tokens.filter(token => token.type === "table_open").length !== 1) fail(filename, ":::table must contain a single table");
      html = md.renderer.render(tokens, md.options, state.env).replace('<table class="mapping-table">', '<table class="mapping-table"><caption>' + escape(match[2]) + "</caption>");
    }
    const token = state.push("html_block", "", 0);
    token.content = html;
    token.map = [start, close + 1];
    state.line = close + 1;
    return true;
  }, { alt: ["paragraph", "reference", "blockquote", "list"] });
  md.renderer.rules.table_open = () => '<div class="table-wrap"><table class="mapping-table">\n';
  md.renderer.rules.table_close = () => "</table></div>\n";
  md.renderer.rules.th_open = () => '<th scope="col">';
  const imageRenderer = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, index, options, env, renderer) => {
    const token = tokens[index];
    const src = localUrl(token.attrGet("src"), filename);
    if (!src || src.includes("#")) fail(filename, "image requires a local PNG or SVG path");
    const alt = token.content.trim();
    if (!alt) fail(filename, "image alt text is required");
    const file = path.resolve(siteRoot, src);
    if (!file.startsWith(path.resolve(siteRoot) + path.sep) || !fs.existsSync(file)) fail(filename, "image not found: " + src);
    const buffer = fs.readFileSync(file);
    let width, height;
    if (/\.png$/i.test(src) && buffer.length >= 24 && buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") {
      width = buffer.readUInt32BE(16); height = buffer.readUInt32BE(20);
    } else if (/\.svg$/i.test(src)) {
      const svg = buffer.toString("utf8").match(/<svg\b[^>]*>/)?.[0] || "";
      const viewBox = svg.match(/\bviewBox=["']([^"']+)["']/)?.[1].trim().split(/[\s,]+/).map(Number);
      width = Number(svg.match(/\bwidth=["']([\d.]+)(?:px)?["']/)?.[1]) || viewBox?.[2];
      height = Number(svg.match(/\bheight=["']([\d.]+)(?:px)?["']/)?.[1]) || viewBox?.[3];
    }
    if (!(width > 0 && height > 0 && Number.isFinite(width + height))) fail(filename, "image needs readable PNG/SVG dimensions: " + src);
    token.attrSet("width", String(Math.ceil(width)));
    token.attrSet("height", String(Math.ceil(height)));
    token.attrSet("loading", "lazy");
    token.attrSet("src", "../../" + src);
    return imageRenderer(tokens, index, options, env, renderer);
  };
  const tokens = md.parse(body, {});
  let previous = 1;
  for (const token of tokens) {
    if (token.type !== "heading_open") continue;
    const level = Number(token.tag.slice(1));
    if (level === 1) fail(filename, "H1 is generated from title; use ## in the body");
    if (level > 4 || level > previous + 1) fail(filename, "invalid heading hierarchy: H" + previous + " to H" + level);
    previous = level;
  }
  let html = md.renderer.render(tokens, md.options, {});
  html = html.replace(/^<p>/, '<p class="lead">')
    .replace(/<blockquote>\s*<p><strong>(À retenir|Note|Attention|Limite|Exemple)<\/strong><\/p>\s*([\s\S]*?)<\/blockquote>/g,
      '<div class="note"><strong>$1</strong>$2</div>')
    .replace(/<tr>\s*<td><strong>([^<]+)<\/strong><\/td>/g, '<tr><th scope="row">$1</th>');
  const links = [];
  html = html.replace(/href="([^"]+)"/g, (attribute, href) => {
    if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href)) return attribute;
    // Markdown-it already rejects dangerous schemes. Reject ambiguous relative links.
    localUrl(href, filename);
    links.push(href);
    return 'href="' + (href.startsWith("#") ? href : "../../" + href) + '"';
  });
  return { html, links };
}

function loadPosts(siteRoot, preparePost) {
  const directory = path.join(siteRoot, "content", "blog");
  const files = fs.readdirSync(directory).filter(name => name.endsWith(".md")).sort();
  const sources = files.map(filename => parseSource(fs.readFileSync(path.join(directory, filename), "utf8"), filename));
  const seen = new Set();
  for (const { data, filename } of sources) {
    if (seen.has(data.slug)) fail(filename, "duplicate slug/public URL: " + data.slug);
    seen.add(data.slug);
  }
  return sources.map(({ data, body, filename }) => {
    if (filename !== data.slug + ".md") fail(filename, "filename must match slug: " + data.slug + ".md");
    for (const field of ["service", "demonstration"]) {
      if (data[field]) checkTarget(data[field].url, filename, siteRoot);
    }
    const rendered = renderMarkdown(body, filename, siteRoot);
    const { service, demonstration, contact, ...metadata } = data;
    const post = preparePost({
      ...metadata,
      service_url: service?.url || "services.html",
      service_label: service?.label || "Prestations XML",
      demo_url: demonstration?.url || "demonstrations.html",
      demo_label: demonstration?.label || "Démonstrations techniques",
      ...(contact ? { contact_label: contact.label, contact_context: contact.context } : {}),
      content_html: rendered.html
    });
    return { post, filename, links: rendered.links };
  }).sort((a, b) => (a.post.order ?? Number.MAX_SAFE_INTEGER) - (b.post.order ?? Number.MAX_SAFE_INTEGER) ||
    a.post.slug.localeCompare(b.post.slug, "en"));
}

module.exports = { parseSource, renderMarkdown, loadPosts, localUrl, checkTarget };
