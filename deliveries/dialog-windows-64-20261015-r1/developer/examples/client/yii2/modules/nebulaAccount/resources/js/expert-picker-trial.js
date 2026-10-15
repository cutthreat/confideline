(() => {
  const root = document.querySelector('[data-nebula-expert-picker-trial]');
  if (!root) return;
  const frame = root.querySelector('.expert-picker-trial__frame');
  const modal = root.querySelector('.expert-picker-trial__modal');
  const close = root.querySelector('[data-trial-picker-action="close"]');
  const previous = root.querySelector('[data-trial-picker-action="previous"]');
  const next = root.querySelector('[data-trial-picker-action="next"]');
  const commit = root.querySelector('[data-trial-picker-action="commit-intent"]');
  const cards = Array.from(root.querySelectorAll('[data-trial-picker-card]'));
  const live = root.querySelector('[data-trial-picker-live]');
  if (!frame || !modal || !close || !previous || !next || !commit || cards.length !== 3) return;

  let selected = Math.max(0, cards.findIndex((card) => card.getAttribute('aria-checked') === 'true'));
  let opener = null;
  const compact320 = window.matchMedia('(max-width: 320px)');
  const announce = (message) => { if (live) live.textContent = message; };
  const minIndex = () => compact320.matches && root.dataset.staticProjection === 'true' ? 1 : 0;

  const render = (focus = false) => {
    cards.forEach((card, index) => {
      card.classList.toggle('is-before', index < selected);
      card.classList.toggle('is-active', index === selected);
      card.classList.toggle('is-after', index > selected);
      card.setAttribute('aria-checked', index === selected ? 'true' : 'false');
      card.tabIndex = index === selected ? 0 : -1;
    });
    previous.disabled = selected <= minIndex();
    previous.setAttribute('aria-disabled', previous.disabled ? 'true' : 'false');
    next.disabled = selected >= cards.length - 1;
    next.setAttribute('aria-disabled', next.disabled ? 'true' : 'false');
    root.dataset.selectedExpertId = cards[selected].dataset.expertId;
    if (focus) cards[selected].focus();
  };

  const select = (index, focus = true) => {
    selected = Math.max(minIndex(), Math.min(cards.length - 1, index));
    render(focus);
    announce(`${cards[selected].querySelector('strong')?.textContent || 'Expert'} selected.`);
  };

  cards.forEach((card, index) => {
    card.addEventListener('click', () => select(index));
    card.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      select(selected + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1));
    });
  });
  previous.addEventListener('click', () => select(selected - 1));
  next.addEventListener('click', () => select(selected + 1));
  compact320.addEventListener?.('change', () => select(Math.max(selected, minIndex()), false));

  const closeFixture = (reason) => {
    root.hidden = true;
    frame.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    root.dataset.lastAction = 'close-intent-owner-transition-required';
    root.dispatchEvent(new CustomEvent('nebula:expert-picker-trial-close-requested', { detail: { reason }, bubbles: true }));
    if (opener?.isConnected) opener.focus();
    announce('Trial expert picker close intent recorded.');
  };
  close.addEventListener('click', () => closeFixture('close-button'));
  frame.addEventListener('click', (event) => { if (event.target === frame) closeFixture('scrim'); });
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); closeFixture('escape'); return; }
    if (event.key !== 'Tab') return;
    const order = [close, previous, cards[selected], next, commit].filter((item) => !item.disabled && item.offsetParent !== null);
    const first = order[0]; const last = order[order.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  root.addEventListener('nebula:expert-picker-trial-open', (event) => {
    if (root.dataset.staticProjection !== 'true' && event.detail?.entitlementVerified !== true) {
      root.dataset.lastAction = 'open-rejected-server-entitlement-required';
      announce('A verified trial entitlement is required.');
      return;
    }
    opener = event.detail?.trigger instanceof HTMLElement ? event.detail.trigger : document.activeElement;
    const requestedIndex = cards.findIndex((card) => card.dataset.expertId === event.detail?.selectedExpertId);
    if (requestedIndex >= 0) selected = requestedIndex;
    root.hidden = false;
    frame.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    root.dataset.lastAction = 'expert-picker-trial-opened-server-entitlement-required';
    render(true);
    announce('Trial-eligible expert picker opened.');
  });
  commit.addEventListener('click', () => {
    root.dataset.lastAction = 'trial-selection-commit-required';
    root.dataset.pendingExpertId = cards[selected].dataset.expertId;
    root.dispatchEvent(new CustomEvent('nebula:trial-selection-commit-required', {
      detail: { selectedExpertId: cards[selected].dataset.expertId },
      bubbles: true
    }));
    announce('The selected expert and entitlement require server revalidation.');
  });

  if (!root.hidden && !frame.hidden) document.documentElement.classList.add('nebula-modal-open');
  render(false);
})();
