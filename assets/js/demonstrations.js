function initDemoExplorer() {
  const explorer = document.querySelector("#demo-explorer");
  const filterForm = document.querySelector("[data-demo-filters]");
  const typeFilter = document.querySelector('[data-demo-filter="type"]');
  const outputFilter = document.querySelector('[data-demo-filter="output"]');
  const summaries = Array.from(document.querySelectorAll("[data-demo-summary]"));
  const cases = Array.from(document.querySelectorAll("[data-demo-case]"));
  const resultCount = document.querySelector("#demo-result-count");
  const resetButton = document.querySelector("[data-demo-reset]");
  const emptyState = document.querySelector("[data-demo-empty]");
  const emptyReset = document.querySelector("[data-demo-empty-reset]");
  const casePrompt = document.querySelector("[data-case-prompt]");

  if (!explorer || !filterForm || !typeFilter || !outputFilter || !resultCount || !resetButton || !emptyState || !emptyReset || !casePrompt || !summaries.length || !cases.length) return;

  const tabControllers = new Map();
  const openActions = Array.from(document.querySelectorAll("[data-demo-open]"));
  let selectedCaseId = null;

  function setupTabs(caseElement) {
    const tabList = caseElement.querySelector("[data-demo-tabs]");
    const tabs = Array.from(caseElement.querySelectorAll("[data-demo-tab]"));
    const panels = Array.from(caseElement.querySelectorAll("[data-demo-panel]"));
    if (!tabList || !tabs.length || tabs.length !== panels.length) return null;

    tabList.setAttribute("role", "tablist");
    tabList.setAttribute("aria-orientation", "horizontal");

    function activate(tab, options = {}) {
      const panelId = tab.getAttribute("href").slice(1);
      tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute("aria-selected", String(active));
        item.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.id !== panelId;
      });
      if (options.focus) tab.focus();
      if (options.updateHash) history.replaceState(null, "", `#${panelId}`);
    }

    tabs.forEach((tab, index) => {
      const panelId = tab.getAttribute("href").slice(1);
      const panel = caseElement.querySelector(`#${panelId}`);
      const tabId = `${panelId}-tab`;
      tab.id = tabId;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panelId);
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabId);
      panel.tabIndex = 0;

      tab.addEventListener("click", (event) => {
        event.preventDefault();
        activate(tab, { updateHash: true });
      });

      tab.addEventListener("keydown", (event) => {
        let nextIndex = null;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        if (nextIndex === null) return;
        event.preventDefault();
        activate(tabs[nextIndex], { focus: true, updateHash: true });
      });
    });

    activate(tabs[0]);
    return {
      activateFirst: () => activate(tabs[0]),
      activatePanel(panelId) {
        const tab = tabs.find((item) => item.getAttribute("href") === `#${panelId}`);
        if (tab) activate(tab);
      }
    };
  }

  cases.forEach((caseElement) => {
    const controller = setupTabs(caseElement);
    if (controller) tabControllers.set(caseElement.id, controller);
    caseElement.hidden = true;
    const closeButton = caseElement.querySelector("[data-demo-close]");
    if (closeButton) closeButton.hidden = false;
  });

  document.documentElement.classList.add("demos-enhanced");
  filterForm.hidden = false;
  casePrompt.hidden = false;
  openActions.forEach((action) => {
    action.setAttribute("aria-controls", action.dataset.demoOpen);
    action.setAttribute("aria-expanded", "false");
  });

  function updateCount(count) {
    const number = document.createElement("strong");
    number.textContent = String(count);
    resultCount.replaceChildren(number, ` démonstration${count > 1 ? "s" : ""}`);
  }

  function clearSelectedCase(removeHash = true) {
    selectedCaseId = null;
    openActions.forEach((action) => action.setAttribute("aria-expanded", "false"));
    cases.forEach((caseElement) => {
      caseElement.hidden = true;
    });
    casePrompt.hidden = false;
    if (removeHash && location.hash && location.hash !== "#demo-explorer") {
      history.replaceState(null, "", `${location.pathname}${location.search}#demo-explorer`);
    }
  }

  function applyFilters() {
    const type = typeFilter.value;
    const output = outputFilter.value;
    const filtersActive = type !== "all" || output !== "all";
    let visibleCount = 0;

    summaries.forEach((summary) => {
      const typeMatches = type === "all" || summary.dataset.type === type;
      const outputs = (summary.dataset.output || "").split(" ");
      const outputMatches = output === "all" || outputs.includes(output);
      const visible = typeMatches && outputMatches;
      summary.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    if (selectedCaseId) {
      const selectedSummary = summaries.find((summary) => summary.querySelector(`[data-demo-open="${selectedCaseId}"]`));
      if (selectedSummary && selectedSummary.hidden) clearSelectedCase();
    }

    updateCount(visibleCount);
    resetButton.hidden = !filtersActive;
    emptyState.hidden = visibleCount !== 0;
  }

  function resetFilters() {
    typeFilter.value = "all";
    outputFilter.value = "all";
    applyFilters();
    typeFilter.focus();
  }

  function openCase(caseId, options = {}) {
    const target = cases.find((caseElement) => caseElement.id === caseId);
    if (!target) return;
    selectedCaseId = caseId;
    openActions.forEach((action) => action.setAttribute("aria-expanded", String(action.dataset.demoOpen === caseId)));
    cases.forEach((caseElement) => {
      caseElement.hidden = caseElement !== target;
    });
    casePrompt.hidden = true;
    const controller = tabControllers.get(caseId);
    if (controller) {
      if (options.panelId) controller.activatePanel(options.panelId);
      else controller.activateFirst();
    }
    if (options.updateHash !== false) history.pushState(null, "", `#${options.panelId || caseId}`);
    target.scrollIntoView({ block: "start" });
    if (options.focusHeading !== false) {
      const heading = target.querySelector("h2");
      if (heading) heading.focus({ preventScroll: true });
    }
  }

  function restoreFromHash() {
    const fragment = location.hash.slice(1);
    if (!fragment || fragment === "demo-explorer") {
      clearSelectedCase(false);
      return;
    }
    const directCase = cases.find((caseElement) => caseElement.id === fragment);
    if (directCase) {
      openCase(directCase.id, { updateHash: false, focusHeading: false });
      return;
    }
    const panel = document.getElementById(fragment);
    const parentCase = panel ? panel.closest("[data-demo-case]") : null;
    if (parentCase) openCase(parentCase.id, { panelId: fragment, updateHash: false, focusHeading: false });
  }

  filterForm.addEventListener("submit", (event) => event.preventDefault());
  typeFilter.addEventListener("change", applyFilters);
  outputFilter.addEventListener("change", applyFilters);
  resetButton.addEventListener("click", resetFilters);
  emptyReset.addEventListener("click", resetFilters);

  summaries.forEach((summary) => {
    const action = summary.querySelector("[data-demo-open]");
    if (!action) return;
    action.addEventListener("click", (event) => {
      event.preventDefault();
      openCase(action.dataset.demoOpen);
    });
  });

  cases.forEach((caseElement) => {
    const closeButton = caseElement.querySelector("[data-demo-close]");
    if (!closeButton) return;
    closeButton.addEventListener("click", () => {
      clearSelectedCase();
      explorer.scrollIntoView({ block: "start" });
      document.querySelector("#demo-explorer-title").focus({ preventScroll: true });
    });
  });

  window.addEventListener("hashchange", restoreFromHash);
  applyFilters();
  restoreFromHash();
}

document.addEventListener("DOMContentLoaded", initDemoExplorer);
