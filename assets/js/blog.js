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

  if (!controls || !results || !featuredRegion || !grid || !searchInput || !sortSelect || !countNode || !resetButton || !emptyState || !emptyReset || !dataStatus) return;

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
      _index: index
    }));
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

  function createPost(post, featured) {
    const article = document.createElement("article");
    article.className = featured ? "blog-featured" : "blog-card";
    if (featured) {
      const label = document.createElement("p");
      label.className = "eyebrow";
      label.textContent = "Article mis en avant";
      article.append(label);
    }

    const meta = document.createElement("p");
    meta.className = "meta";
    const time = document.createElement("time");
    time.dateTime = post.date;
    time.textContent = dateFormatter.format(new Date(`${post.date}T00:00:00Z`));
    meta.append(document.createTextNode(`${post.category} · `), time, document.createTextNode(` · ${post.reading_time}`));

    const heading = document.createElement(featured ? "h2" : "h3");
    const titleLink = document.createElement("a");
    titleLink.href = `blog/${post.slug}/`;
    titleLink.textContent = post.title;
    heading.append(titleLink);

    const description = document.createElement("p");
    description.textContent = post.description;

    const readLink = document.createElement("a");
    readLink.className = "blog-read-link";
    readLink.href = `blog/${post.slug}/`;
    readLink.textContent = "Lire l’article complet →";

    article.append(meta, heading, description, createTagList(post.tags), readLink);
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
    if (!visiblePosts.length) return;
    featuredRegion.append(createPost(visiblePosts[0], true));
    visiblePosts.slice(1).forEach((post) => grid.append(createPost(post, false)));
  }

  function reset() {
    searchInput.value = "";
    if (categorySelect) categorySelect.value = "all";
    if (tagSelect) tagSelect.value = "all";
    sortSelect.value = "newest";
    render();
    searchInput.focus();
  }

  function updateAvailableFilters() {
    updateSelect(categorySelect, uniqueValues(posts, "category"), "Toutes les catégories");
    updateSelect(tagSelect, uniqueValues(posts, "tags", true), "Tous les sujets");
  }

  controls.addEventListener("submit", (event) => event.preventDefault());
  searchInput.addEventListener("input", render);
  if (categorySelect) categorySelect.addEventListener("change", render);
  if (tagSelect) tagSelect.addEventListener("change", render);
  sortSelect.addEventListener("change", render);
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
