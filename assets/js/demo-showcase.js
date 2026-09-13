/* Lightweight on-site image previews. Native dialog provides modal focus. */
(() => {
  const triggers = [...document.querySelectorAll('[data-preview-src]')];
  if (!triggers.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'showcase-lightbox';
  dialog.setAttribute('aria-labelledby', 'showcase-preview-title');
  dialog.innerHTML = '<div class="showcase-lightbox-toolbar"><p id="showcase-preview-title"></p><button type="button" class="showcase-lightbox-close" aria-label="Fermer l’aperçu" autofocus>×</button></div><div class="showcase-lightbox-image"><img alt=""></div><p class="showcase-lightbox-error" role="status" hidden>Impossible de charger cet aperçu. Fermez cette fenêtre et réessayez.</p>';
  document.body.append(dialog);
  const picture = dialog.querySelector('img');
  const title = dialog.querySelector('#showcase-preview-title');
  const error = dialog.querySelector('[role="status"]');
  let opener;
  let outsidePointerDown = false;
  const outside = (event) => {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  for (const trigger of triggers) {
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.addEventListener('click', () => {
      opener = trigger;
      title.textContent = trigger.dataset.previewLabel || trigger.querySelector('img')?.alt || 'Aperçu du document';
      picture.alt = title.textContent;
      picture.hidden = false;
      error.hidden = true;
      picture.src = trigger.dataset.previewSrc;
      dialog.showModal();
      document.documentElement.classList.add('showcase-preview-open');
    });
  }
  picture.addEventListener('error', () => { picture.hidden = true; error.hidden = false; });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', (event) => {
    // Closing is the only interactive control; keep keyboard focus in the preview.
    if (event.key === 'Tab') {
      event.preventDefault();
      dialog.querySelector('button').focus();
    }
  });
  dialog.addEventListener('pointerdown', (event) => { outsidePointerDown = outside(event); });
  dialog.addEventListener('click', (event) => {
    if (outsidePointerDown && outside(event)) dialog.close();
    outsidePointerDown = false;
  });
  // Escape is handled by the native dialog; all closing paths restore focus.
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('showcase-preview-open');
    opener?.focus({ preventScroll: true });
  });
})();
