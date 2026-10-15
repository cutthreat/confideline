(() => {
  'use strict';

  document.documentElement.dataset.nebulaAllPsychicOwner = 'c76-20260727';

  const root = document.querySelector('[data-nebula-all-psychics]');
  if (!root) return;

  const advisorChatUrl = root.dataset.advisorChatUrl;
  if (advisorChatUrl) {
    root.querySelectorAll('.apn-love-card').forEach((card) => {
      const link = card.querySelector('.apn-love-card__cta .c-btn');
      const name = card.querySelector('.apn-love-card__name')?.textContent?.trim();
      if (!link || !name) return;

      const advisor = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const url = new URL(advisorChatUrl, document.baseURI);
      url.searchParams.set('advisor', advisor);
      link.href = url.href;
      link.dataset.advisorChatIntent = advisor;
    });
  }

  const mobileCarouselQuery = window.matchMedia('(max-width: 767.98px)');
  // C76 keeps expert rails scrollable through tablet sizes, but the three
  // client reviews become a rail only on the 320px composition.
  const clientCarouselQuery = window.matchMedia('(max-width: 399px)');
  const carouselRecords = [];

  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ensureButton = (node, label) => {
    if (node.tagName === 'BUTTON') {
      node.type = 'button';
      node.setAttribute('aria-label', label);
      return node;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = node.className;
    button.innerHTML = node.innerHTML;
    button.setAttribute('aria-label', label);
    node.replaceWith(button);
    return button;
  };

  const getStep = (track) => {
    const card = track.firstElementChild;
    if (!card) return track.clientWidth;
    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
    return Math.max(1, card.getBoundingClientRect().width + gap);
  };

  const syncCarouselControls = (record) => {
    const enabled = record.query.matches;
    const maxScrollLeft = Math.max(0, record.track.scrollWidth - record.track.clientWidth);
    const atStart = record.track.scrollLeft <= 1;
    const atEnd = maxScrollLeft <= 1 || record.track.scrollLeft >= maxScrollLeft - 1;

    record.nav.setAttribute('aria-hidden', enabled ? 'false' : 'true');
    record.buttons.forEach((button, index) => {
      if (!enabled) {
        button.disabled = false;
        button.removeAttribute('aria-disabled');
        return;
      }
      const disabled = index === 0 ? atStart : atEnd;
      button.disabled = disabled;
      button.setAttribute('aria-disabled', String(disabled));
    });
  };

  const bindCarousel = (track, nav, label, query = mobileCarouselQuery) => {
    if (!track || !nav || track.dataset.apnSliderBound === 'true') return;
    const rawButtons = Array.from(nav.querySelectorAll('.apn-online__nav-btn')).slice(0, 2);
    if (rawButtons.length !== 2) return;

    track.dataset.apnSliderBound = 'true';
    track.id = track.id || `apn-mobile-slider-${carouselRecords.length + 1}`;
    track.setAttribute('aria-label', label);
    track.setAttribute('aria-roledescription', 'carousel');
    track.setAttribute('role', 'region');
    // Keep the track itself keyboard-reachable.  Arrow handling below is
    // intentionally attached to the track so keyboard users get the same
    // one-card movement as touch and button users.
    if (!track.hasAttribute('tabindex')) track.setAttribute('tabindex', '0');
    nav.removeAttribute('aria-hidden');

    const buttons = rawButtons.map((node, index) => ensureButton(node, `${index === 0 ? 'Previous' : 'Next'} ${label.toLowerCase()}`));
    buttons.forEach((button, index) => {
      button.setAttribute('aria-controls', track.id);
      button.dataset.apnSliderDirection = index === 0 ? '-1' : '1';
    });

    const record = { track, nav, buttons, query };
    carouselRecords.push(record);
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        if (!record.query.matches || button.disabled) return;
        const direction = Number(button.dataset.apnSliderDirection || '0');
        track.scrollBy({ left: direction * getStep(track), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        window.setTimeout(() => syncCarouselControls(record), 360);
      });
    });
    track.addEventListener('scroll', () => syncCarouselControls(record), { passive: true });
    track.addEventListener('keydown', (event) => {
        if (!record.query.matches || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
      event.preventDefault();
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      track.scrollBy({ left: direction * getStep(track), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });
    syncCarouselControls(record);
  };

  root.querySelectorAll('.apn-online-host').forEach((section) => {
    const title = section.querySelector('.apn-online__title')?.textContent?.trim() || 'expert cards';
    bindCarousel(section.querySelector('.apn-online__grid'), section.querySelector('.apn-online__nav'), `${title} cards`);
  });
  const clients = root.querySelector('.apn-clients');
  const clientTrack = clients?.querySelector('.apn-clients__grid');
  let clientsNav = clients?.querySelector('.apn-clients__nav');
  if (clientCarouselQuery.matches && clients && clientTrack && !clientsNav) {
    clientsNav = document.createElement('div');
    clientsNav.className = 'apn-online__nav apn-clients__nav';
    clientsNav.setAttribute('aria-hidden', 'true');
    clientsNav.innerHTML = '<div class="apn-online__nav-btn">‹</div><div class="apn-online__nav-btn apn-online__nav-btn--active">›</div>';
    clients.append(clientsNav);
    clients.classList.add('apn-clients--slider-ready');
  }
  if (clientCarouselQuery.matches) bindCarousel(clientTrack, clientsNav, 'Real reviews', clientCarouselQuery);

  window.addEventListener('resize', () => carouselRecords.forEach(syncCarouselControls));
})();
