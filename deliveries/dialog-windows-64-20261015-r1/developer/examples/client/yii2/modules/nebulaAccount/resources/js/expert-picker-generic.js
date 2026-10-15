(() => {
  const root = document.querySelector('[data-nebula-expert-picker]');
  if (!root) return;
  const frame = root.querySelector('.expert-picker-generic__frame');
  const modal = root.querySelector('.expert-picker-generic__modal');
  const close = root.querySelector('[data-picker-action="close"]');
  const previous = root.querySelector('[data-picker-action="previous"]');
  const next = root.querySelector('[data-picker-action="next"]');
  const commit = root.querySelector('[data-picker-action="commit-intent"]');
  const cards = Array.from(root.querySelectorAll('[data-picker-card]'));
  const live = root.querySelector('[data-picker-live]');
  if (!frame || !modal || !close || !previous || !next || !commit || cards.length !== 3) return;

  let selected = 1;
  let opener = null;
  const compact320 = window.matchMedia('(max-width: 320px)');
  const announce = (message) => { if (live) live.textContent = message; };
  const minIndex = () => compact320.matches ? 1 : 0;

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
    const bounded = Math.max(minIndex(), Math.min(cards.length - 1, index));
    if (bounded === selected && !focus) return;
    selected = bounded;
    render(focus);
    announce(`${cards[selected].querySelector('strong')?.textContent || 'Expert'} selected.`);
  };

  cards.forEach((card, index) => {
    card.addEventListener('click', () => select(index));
    card.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      select(selected + (event.key === 'ArrowRight' ? 1 : -1));
    });
  });
  previous.addEventListener('click', () => select(selected - 1));
  next.addEventListener('click', () => select(selected + 1));
  compact320.addEventListener?.('change', () => select(Math.max(selected, minIndex()), false));

  const closeFixture = () => {
    // A mounted fixture has no guaranteed opener. Dismissal must still close
    // the owned frame; focus restoration is conditional on a real opener.
    frame.hidden = true;
    root.dataset.lastAction = 'close-intent-owner-transition-required';
    root.dispatchEvent(new CustomEvent('nebula:expert-picker-generic-dismiss-required', {
      bubbles: true,
      detail: { dismissOnly: true, backendRequired: true, staticProjection: true, sessionMutated: false },
    }));
    announce('Expert picker close intent recorded.');
    if (opener instanceof HTMLElement) {
      opener.focus();
    } else {
      // Fixture-only mount has no invented return route or caller. Keep focus
      // on the owning root instead of leaving it on the hidden close control.
      root.tabIndex = -1;
      root.dataset.focusRecovery = 'fixture-owner-root';
      root.focus();
    }
  };
  close.addEventListener('click', closeFixture);
  frame.addEventListener('click', (event) => { if (event.target === frame) closeFixture(); });
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); closeFixture(); return; }
    if (event.key !== 'Tab') return;
    const order = [close, previous, cards[selected], next, commit].filter((item) => !item.disabled && item.offsetParent !== null);
    const first = order[0]; const last = order[order.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  root.addEventListener('nebula:expert-picker-generic-open', (event) => {
    const payload = event.detail || {};
    opener = payload.opener instanceof HTMLElement ? payload.opener : (document.activeElement instanceof HTMLElement ? document.activeElement : opener);
    frame.hidden = false;
    root.dataset.lastAction = 'expert-picker-generic-opened';
    cards[selected].focus();
    announce('Available expert picker opened.');
  });
  commit.addEventListener('click', () => {
    root.dataset.lastAction = 'selection-intent-commit-host-required';
    root.dataset.pendingExpertId = cards[selected].dataset.expertId;
    root.dispatchEvent(new CustomEvent('nebula:expert-picker-generic-selection-required', {
      bubbles: true,
      detail: {
        expertId: cards[selected].dataset.expertId,
        backendRequired: true,
        staticProjection: true,
        sessionCreated: false,
        debitApplied: false,
      },
    }));
    announce('The selected expert is ready for server revalidation.');
  });
  render(false);
})();
