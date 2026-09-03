function initServiceCatalogTracking() {
  const downloadLink = document.querySelector("[data-service-catalog-download]");
  if (!downloadLink) return;

  downloadLink.addEventListener("click", () => {
    const eventData = {
      event: "service_catalog_download",
      document: "prestations-ppr-solution.pdf",
      page: "services"
    };

    window.dispatchEvent(new CustomEvent("ppr:analytics", { detail: eventData }));
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(eventData);

    const endpoint = document.querySelector('meta[name="ppr-analytics-endpoint"]')?.content.trim();
    if (!endpoint) return;

    const payload = new URLSearchParams({
      event: eventData.event,
      document: eventData.document,
      page: eventData.page
    });

    try {
      if (navigator.sendBeacon && navigator.sendBeacon(endpoint, payload)) return;
    } catch (_error) {
      // Le téléchargement reste prioritaire si la mesure est indisponible.
    }

    fetch(endpoint, { method: "POST", body: payload, keepalive: true }).catch(() => {});
  });
}

document.addEventListener("DOMContentLoaded", initServiceCatalogTracking);
