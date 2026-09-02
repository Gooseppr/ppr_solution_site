function initServiceNav() {
  const links = document.querySelectorAll("[data-service-nav]");
  if (!links.length || !("IntersectionObserver" in window)) return;

  const linkByTarget = new Map();
  links.forEach((link) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) linkByTarget.set(target, link);
  });
  if (!linkByTarget.size) return;

  function setActive(target) {
    links.forEach((link) => {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });
    const active = linkByTarget.get(target);
    if (active) {
      active.classList.add("is-active");
      active.setAttribute("aria-current", "true");
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActive(visible[0].target);
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
  );

  linkByTarget.forEach((_link, target) => observer.observe(target));
}

document.addEventListener("DOMContentLoaded", initServiceNav);
