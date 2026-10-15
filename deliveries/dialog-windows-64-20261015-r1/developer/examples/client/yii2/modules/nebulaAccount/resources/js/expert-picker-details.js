(() => {
  const root = document.querySelector('[data-nebula-expert-picker-details]');
  if (!root) return;
  const frame = root.querySelector('.expert-picker-details__frame');
  const modal = root.querySelector('.expert-picker-details__modal');
  const heading = root.querySelector('#expert-picker-details-title');
  const back = root.querySelector('[data-expert-details-action="back"]');
  const close = root.querySelector('[data-expert-details-action="close"]');
  const favorite = root.querySelector('[data-expert-details-action="favorite-intent"]');
  const reviews = root.querySelector('[data-expert-details-action="reviews-intent"]');
  const payment = root.querySelector('[data-expert-details-action="payment-preflight"]');
  const live = root.querySelector('[data-expert-details-live]');
  if (!frame || !modal || !heading || !back || !close || !favorite || !reviews || !payment) return;
  favorite.setAttribute('aria-pressed', favorite.getAttribute('aria-pressed') || 'false');

  let pickerOpener = document.querySelector('[data-expert-details-fixture-opener]');
  let flowOpener = pickerOpener;
  const announce = (message) => { if (live) live.textContent = message; };
  const emit = (name, detail = {}) => root.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));

  const hide = () => {
    root.hidden = true;
    frame.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
  };
  const show = () => {
    root.hidden = false;
    frame.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    heading.focus();
  };
  const goBack = () => {
    hide();
    root.dataset.lastAction = 'generic-picker-return-required';
    emit('nebula:expert-details-generic-picker-return-required', { selectedExpertId: root.dataset.expertId || 'margo-lover' });
    pickerOpener?.focus();
    announce('Return to the generic expert picker requested.');
  };
  const closeFlow = (reason) => {
    hide();
    root.dataset.lastAction = 'selection-flow-close-required';
    emit('nebula:expert-selection-flow-close-required', { reason });
    flowOpener?.focus();
    announce('Close selection flow requested.');
  };

  back.addEventListener('click', goBack);
  close.addEventListener('click', () => closeFlow('close-button'));
  frame.addEventListener('click', (event) => { if (event.target === frame) closeFlow('scrim'); });
  favorite.addEventListener('click', () => {
    const selected = favorite.getAttribute('aria-pressed') !== 'true';
    favorite.setAttribute('aria-pressed', String(selected));
    favorite.classList.toggle('is-local-selected', selected);
    root.dataset.lastAction = selected ? 'favorite-local-draft-selected' : 'favorite-local-draft-cleared';
    emit('nebula:expert-favorite-intent-required', { expertId: root.dataset.expertId || 'margo-lover', localSelected: selected, persisted: false });
    announce(selected ? 'Favorite selected locally. Saving requires a host adapter.' : 'Local favorite selection cleared.');
  });
  reviews.addEventListener('click', () => {
    root.dataset.lastAction = 'reviews-intent-host-required';
    emit('nebula:expert-reviews-intent-required', { expertId: root.dataset.expertId || 'margo-lover' });
    announce('Reviews destination requires a host adapter.');
  });
  payment.addEventListener('click', () => {
    root.dataset.lastAction = 'payment-preflight-required';
    emit('nebula:payment-preflight-required', { expertId: root.dataset.expertId || 'margo-lover' });
    announce('Payment preflight requires server revalidation.');
  });
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); closeFlow('escape'); return; }
    if (event.key !== 'Tab') return;
    const order = [back, close, favorite, reviews, payment].filter((item) => !item.disabled && item.offsetParent !== null);
    const first = order[0]; const last = order[order.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  root.addEventListener('nebula:expert-details-before-selection-open', (event) => {
    if (root.dataset.staticProjection !== 'true' && event.detail?.genericSelectionVerified !== true) {
      root.dataset.lastAction = 'open-rejected-generic-selection-required';
      announce('A verified generic expert selection is required.');
      return;
    }
    pickerOpener = event.detail?.pickerTrigger instanceof HTMLElement ? event.detail.pickerTrigger : pickerOpener;
    flowOpener = event.detail?.flowTrigger instanceof HTMLElement ? event.detail.flowTrigger : flowOpener;
    if (event.detail?.expertId) root.dataset.expertId = event.detail.expertId;
    show();
    root.dataset.lastAction = 'expert-details-before-selection-opened';
  });

  root.dataset.expertId = root.dataset.expertId || 'margo-lover';
  if (!root.hidden && !frame.hidden) document.documentElement.classList.add('nebula-modal-open');
})();
