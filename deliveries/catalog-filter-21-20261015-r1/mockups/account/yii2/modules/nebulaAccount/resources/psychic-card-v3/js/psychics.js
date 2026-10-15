(() => {
  const root = document.querySelector('[data-nebula-psychics]');
  if (!root || root.dataset.psychicsBound === 'true') return;
  root.dataset.psychicsBound = 'true';

  const emit = (name, detail) => root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  const nameOf = (node) => node.dataset.psychicName || node.closest('[data-psychic-card]')?.querySelector('.ps-card__identity h3')?.textContent?.trim() || 'Expert';

  root.addEventListener('click', (event) => {
    const favorite = event.target.closest('[data-psychic-favorite]');
    if (favorite && root.contains(favorite)) {
      const wasPressed = favorite.getAttribute('aria-pressed') === 'true';
      const psychic = nameOf(favorite);
      favorite.setAttribute('aria-pressed', wasPressed ? 'false' : 'true');
      const icon = favorite.querySelector('img[data-favorite-on]');
      if (icon) icon.src = wasPressed ? icon.dataset.favoriteOff : icon.dataset.favoriteOn;
      favorite.setAttribute('aria-label', (wasPressed ? 'Add ' : 'Remove ') + psychic + (wasPressed ? ' to' : ' from') + ' favorites');
      emit('nebula:psychic-favorite-intent-required', { psychic, backendRequired: true, persisted: false, listMutation: false, staticProjection: true });
      return;
    }

    const start = event.target.closest('[data-psychic-start]');
    if (start && root.contains(start)) {
      emit('nebula:psychic-start-intent-required', {
        psychic: nameOf(start),
        offer: {
          freeMinutes: Number(start.dataset.freeMinutes || 0),
          postTrialRateCreditsPerMinute: Number(start.dataset.rateCreditsPerMinute || 0),
          source: 'static-projection',
          eligibility: 'host-required'
        },
        backendRequired: true,
        sessionCreated: false,
        paymentStarted: false,
        persisted: false,
        staticProjection: true
      });
      return;
    }

    const cardIntent = event.target.closest('[data-card-intent]');
    if (cardIntent && root.contains(cardIntent)) {
      emit('nebula:psychic-card-intent-required', {
        action: cardIntent.dataset.cardIntent || 'book',
        psychic: nameOf(cardIntent),
        backendRequired: true,
        persisted: false,
        sessionCreated: false,
        paymentStarted: false,
        staticProjection: true
      });
      return;
    }

    const browse = event.target.closest('[data-section-prev],[data-section-next]');
    if (browse && root.contains(browse)) {
      const section = browse.closest('.ps-section');
      const grid = section?.querySelector('.ps-grid');
      if (grid && grid.scrollWidth > grid.clientWidth) {
        grid.scrollBy({ left: browse.hasAttribute('data-section-next') ? 260 : -260, behavior: 'smooth' });
      }
    }
  });

  root.querySelectorAll('[data-faq-toggle]').forEach((toggle) => toggle.addEventListener('click', () => {
    const panel = document.getElementById(toggle.getAttribute('aria-controls'));
    if (!panel) return;
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    toggle.closest('.pc-faq__item')?.classList.toggle('is-open', !open);
    panel.hidden = open;
  }));
})();
