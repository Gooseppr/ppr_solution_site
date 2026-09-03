function initBlogLibrary() {
  const controls = document.querySelector("[data-blog-controls]");
  const results = document.querySelector("[data-blog-results]");
  const featuredRegion = document.querySelector("[data-blog-featured]");
  const grid = document.querySelector("[data-blog-grid]");
  const searchInput = document.querySelector("[data-blog-search]");
  const categorySelect = document.querySelector("[data-blog-category]");
  const tagSelect = document.querySelector("[data-blog-tag]");
  const sortSelect = document.querySelector("[data-blog-sort]");
  const countNode = document.querySelector("#blog-result-count");
  const resetButton = document.querySelector("[data-blog-reset]");
  const emptyState = document.querySelector("[data-blog-empty]");
  const emptyReset = document.querySelector("[data-blog-empty-reset]");
  const dataStatus = document.querySelector("[data-blog-data-status]");
  const pagination = document.querySelector("[data-blog-pagination]");

  if (!controls || !results || !featuredRegion || !grid || !searchInput || !sortSelect || !countNode || !resetButton || !emptyState || !emptyReset || !dataStatus || !pagination) return;

  const PAGE_SIZE = 6;

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("fr-FR")
      .trim();
  }

  function readFallbackPosts() {
    return Array.from(document.querySelectorAll("[data-blog-post]")).map((element, index) => ({
      slug: element.dataset.slug,
      title: element.dataset.title,
      description: element.dataset.description,
      category: element.dataset.category,
      tags: (element.dataset.tags || "").split("|").filter(Boolean),
      date: element.dataset.date,
      reading_time: element.dataset.readingTime,
      preview: parsePreview(element.dataset.preview),
      _index: index
    }));
  }

  function parsePreview(value) {
    try {
      return normalizePreview(JSON.parse(value || "{}"));
    } catch (_error) {
      return { kind: "flow", label: "Aperçu technique", items: [] };
    }
  }

  function normalizePreview(preview) {
    const kind = preview && ["mapping", "table"].includes(preview.kind) ? preview.kind : "flow";
    const items = Array.isArray(preview?.items) ? preview.items.slice(0, 3) : [];
    return {
      kind,
      label: String(preview?.label || "Aperçu technique"),
      items: ["mapping", "table"].includes(kind)
        ? items.map((item) => ({ from: String(item?.from || ""), to: String(item?.to || "") })).filter((item) => item.from && item.to)
        : items.map((item) => String(item || "")).filter(Boolean)
    };
  }

  function normalizePosts(payload) {
    if (!Array.isArray(payload) || !payload.length) throw new Error("Données du blog invalides.");
    return payload.map((post, index) => {
      if (!post || !/^[a-z0-9][a-z0-9-]*$/.test(String(post.slug || "")) || !post.title || !post.description || !post.date || !Array.isArray(post.tags)) {
        throw new Error("Un article ne possède pas les métadonnées attendues.");
      }
      return {
        slug: String(post.slug),
        title: String(post.title),
        description: String(post.description),
        category: String(post.category || "Blog"),
        tags: post.tags.map((tag) => String(tag)),
        date: String(post.date),
        reading_time: String(post.reading_time || "Lecture"),
        preview: normalizePreview(post.preview),
        _index: index
      };
    });
  }

  function createTagList(tags) {
    const list = document.createElement("ul");
    list.className = "blog-tag-list";
    list.setAttribute("aria-label", "Sujets");
    tags.forEach((tag) => {
      const item = document.createElement("li");
      item.textContent = tag;
      list.append(item);
    });
    return list;
  }

  function createPreview(preview) {
    const container = document.createElement("div");
    container.className = `blog-technical-preview blog-preview-${preview.kind}`;
    const label = document.createElement("p");
    label.textContent = preview.label;
    container.append(label);

    const list = document.createElement(["mapping", "table"].includes(preview.kind) ? "ul" : "ol");
    preview.items.forEach((item) => {
      const row = document.createElement("li");
      if (["mapping", "table"].includes(preview.kind)) {
        const source = document.createElement("code");
        const arrow = document.createElement("span");
        const target = document.createElement("code");
        source.textContent = item.from;
        arrow.textContent = "→";
        arrow.setAttribute("aria-hidden", "true");
        target.textContent = item.to;
        row.append(source, arrow, target);
      } else {
        const code = document.createElement("code");
        code.textContent = item;
        row.append(code);
      }
      list.append(row);
    });
    container.append(list);
    return container;
  }

  function createPost(post, featured) {
    const article = document.createElement("article");
    article.className = featured ? "blog-featured" : "blog-card";
    const link = document.createElement("a");
    link.className = "article-card-link";
    link.href = `blog/${post.slug}/`;
    if (featured) {
      const label = document.createElement("p");
      label.className = "eyebrow";
      label.textContent = "Article mis en avant";
      link.append(label);
    }

    const meta = document.createElement("p");
    meta.className = "meta";
    const time = document.createElement("time");
    time.dateTime = post.date;
    time.textContent = dateFormatter.format(new Date(`${post.date}T00:00:00Z`));
    meta.append(document.createTextNode(`${post.category} · `), time, document.createTextNode(` · ${post.reading_time}`));

    const heading = document.createElement(featured ? "h2" : "h3");
    heading.textContent = post.title;

    const description = document.createElement("p");
    description.textContent = post.description;

    const readLabel = document.createElement("span");
    readLabel.className = "blog-read-label";
    readLabel.textContent = "Lire l’article →";

    link.append(meta, heading, description, createPreview(post.preview), createTagList(post.tags), readLabel);
    article.append(link);
    return article;
  }

  function uniqueValues(posts, key, excludeUniversal = false) {
    const counts = new Map();
    posts.forEach((post) => {
      const values = Array.isArray(post[key]) ? new Set(post[key]) : new Set([post[key]].filter(Boolean));
      values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
    });
    return [...counts.entries()]
      .filter(([, count]) => !excludeUniversal || count < posts.length)
      .map(([value]) => value)
      .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
  }

  function updateSelect(select, values, allLabel) {
    if (!select) return;
    const field = select.closest(".blog-control-field");
    if (values.length < 2) {
      field.hidden = true;
      select.value = "all";
      return;
    }
    field.hidden = false;
    const previousValue = select.value;
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = allLabel;
    const options = values.map((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      return option;
    });
    select.replaceChildren(allOption, ...options);
    select.value = values.includes(previousValue) ? previousValue : "all";
  }

  function updateCount(count) {
    const strong = document.createElement("strong");
    strong.textContent = String(count);
    countNode.replaceChildren(strong, ` article${count > 1 ? "s" : ""}`);
  }

  let posts = readFallbackPosts();
  let currentPage = 1;

  function filteredAndSortedPosts() {
    const query = normalizeText(searchInput.value);
    const category = categorySelect ? categorySelect.value : "all";
    const tag = tagSelect ? tagSelect.value : "all";
    const sort = sortSelect.value;
    const filtered = posts.filter((post) => {
      const searchable = normalizeText([post.title, post.description, post.category, ...post.tags].join(" "));
      const searchMatches = !query || searchable.includes(query);
      const categoryMatches = category === "all" || post.category === category;
      const tagMatches = tag === "all" || post.tags.includes(tag);
      return searchMatches && categoryMatches && tagMatches;
    });

    return filtered.sort((first, second) => {
      if (sort === "oldest") return new Date(first.date) - new Date(second.date) || first._index - second._index;
      if (sort === "title-asc") return first.title.localeCompare(second.title, "fr", { sensitivity: "base" });
      if (sort === "title-desc") return second.title.localeCompare(first.title, "fr", { sensitivity: "base" });
      return new Date(second.date) - new Date(first.date) || first._index - second._index;
    });
  }

  function render() {
    const visiblePosts = filteredAndSortedPosts();
    const controlsActive = searchInput.value.trim() || (categorySelect && categorySelect.value !== "all") || (tagSelect && tagSelect.value !== "all") || sortSelect.value !== "newest";
    updateCount(visiblePosts.length);
    resetButton.hidden = !controlsActive;
    emptyState.hidden = visiblePosts.length !== 0;
    results.hidden = visiblePosts.length === 0;
    featuredRegion.replaceChildren();
    grid.replaceChildren();
    pagination.replaceChildren();
    pagination.hidden = true;
    if (!visiblePosts.length) return;

    const pageCount = Math.ceil(visiblePosts.length / PAGE_SIZE);
    currentPage = Math.min(currentPage, pageCount);
    const pagePosts = visiblePosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    featuredRegion.append(createPost(pagePosts[0], true));
    pagePosts.slice(1).forEach((post) => grid.append(createPost(post, false)));

    if (pageCount > 1) {
      const list = document.createElement("ol");
      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = String(pageNumber);
        button.setAttribute("aria-label", `Afficher la page ${pageNumber}`);
        if (pageNumber === currentPage) button.setAttribute("aria-current", "page");
        button.addEventListener("click", () => {
          currentPage = pageNumber;
          render();
          featuredRegion.querySelector(".article-card-link")?.focus();
        });
        item.append(button);
        list.append(item);
      }
      pagination.append(list);
      pagination.hidden = false;
    }
  }

  function reset() {
    searchInput.value = "";
    if (categorySelect) categorySelect.value = "all";
    if (tagSelect) tagSelect.value = "all";
    sortSelect.value = "newest";
    currentPage = 1;
    render();
    searchInput.focus();
  }

  function updateAvailableFilters() {
    updateSelect(categorySelect, uniqueValues(posts, "category"), "Toutes les catégories");
    updateSelect(tagSelect, uniqueValues(posts, "tags", true), "Tous les sujets");
  }

  controls.addEventListener("submit", (event) => event.preventDefault());
  function updateFromControls() {
    currentPage = 1;
    render();
  }

  searchInput.addEventListener("input", updateFromControls);
  if (categorySelect) categorySelect.addEventListener("change", updateFromControls);
  if (tagSelect) tagSelect.addEventListener("change", updateFromControls);
  sortSelect.addEventListener("change", updateFromControls);
  resetButton.addEventListener("click", reset);
  emptyReset.addEventListener("click", reset);

  controls.hidden = false;
  updateAvailableFilters();
  render();

  fetch("blog/posts.json", { headers: { Accept: "application/json" } })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((payload) => {
      posts = normalizePosts(payload);
      dataStatus.hidden = true;
      updateAvailableFilters();
      render();
    })
    .catch(() => {
      dataStatus.textContent = "La mise à jour des données n’a pas pu être chargée. Les articles statiques restent disponibles et filtrables.";
      dataStatus.hidden = false;
    });
}

document.addEventListener("DOMContentLoaded", initBlogLibrary);
