(() => {
  const root = document.querySelector('[data-nebula-top-up-start]');
  if (!root) return;

  const frame = root.querySelector('.top-up-start__frame');
  const modal = root.querySelector('.top-up-start__modal');
  const heading = root.querySelector('#top-up-start-title');
  const back = root.querySelector('[data-funding-action="back"]');
  const close = root.querySelector('[data-funding-action="dismiss"]');
  const pay = root.querySelector('[data-funding-action="checkout"]');
  const packages = [...root.querySelectorAll('[data-package-id]')];
  const live = root.querySelector('[data-funding-live]');
  if (!frame || !modal || !heading || !back || !close || !pay || packages.length !== 3) return;

  let opener = document.querySelector('[data-funding-opener]');
  let chatAnchor = document.querySelector('[data-chat-anchor]');
  const announce = (message) => { if (live) live.textContent = message; };
  const selectedPackage = () => packages.find((item) => item.getAttribute('aria-checked') === 'true');
  const selectPackage = (next, shouldFocus = true) => {
    packages.forEach((item) => {
      const active = item === next;
      item.classList.toggle('is-selected', active);
      item.setAttribute('aria-checked', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    root.dataset.selectedPackageId = next.dataset.packageId;
    root.dataset.lastAction = 'fixture-package-selected';
    if (shouldFocus) next.focus();
    announce('Package fixture selected locally. No financial action occurred.');
  };
  const detail = (reason) => {
    const selected = selectedPackage();
    return {
      reason,
      intentId: root.dataset.intentId || null,
      intentVersion: root.dataset.intentVersion || null,
      packageId: selected?.dataset.packageId || null,
      packageVersion: selected?.dataset.packageVersion || null,
      commercialFixtureOnly: root.dataset.commercialCopy === 'fixture-only',
      checkoutStarted: false,
      paymentRedirected: false,
      charged: false,
      balanceMutation: false,
      sessionCreated: false,
      sessionStarted: false,
    };
  };
  const hide = (reason, target) => {
    root.hidden = true;
    frame.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    root.dataset.lastAction = reason;
    root.dispatchEvent(new CustomEvent(`nebula:${reason}`, { detail: detail(reason), bubbles: true }));
    target?.focus();
  };

  packages.forEach((item, index) => {
    item.addEventListener('click', () => selectPackage(item));
    item.addEventListener('keydown', (event) => {
      let nextIndex = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = Math.min(index + 1, packages.length - 1);
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = Math.max(index - 1, 0);
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = packages.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      selectPackage(packages[nextIndex]);
    });
  });
  back.addEventListener('click', () => hide('pre-start-funding-back-required', opener));
  close.addEventListener('click', () => hide('pre-start-funding-dismissed', chatAnchor));
  pay.addEventListener('click', () => {
    root.dataset.lastAction = 'package-checkout-required';
    root.dispatchEvent(new CustomEvent('nebula:package-checkout-required', { detail: detail('pay-button'), bubbles: true }));
    announce('Checkout was requested from the host. No checkout, charge, balance update or session start occurred.');
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      hide('pre-start-funding-dismissed', chatAnchor);
      return;
    }
    if (event.key !== 'Tab') return;
    const selected = selectedPackage();
    const focusables = [back, close, selected, pay].filter(Boolean);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  root.addEventListener('nebula:pre-start-funding-open', (event) => {
    const payload = event.detail || {};
    const valid = payload.serverState === 'pre_start_funding_required'
      && payload.intentId
      && payload.intentVersion !== undefined
      && payload.intentVersion !== null
      && Array.isArray(payload.packages)
      && payload.packages.length > 0
      && payload.catalogVersion
      && payload.expertSnapshot
      && payload.capabilities
      && payload.authenticatedClient === true;
    if (root.dataset.staticProjection !== 'true' && !valid) {
      root.dataset.lastAction = 'open-rejected-authoritative-funding-snapshot-required';
      announce('A server-authoritative pre-start funding snapshot is required.');
      return;
    }
    opener = payload.opener instanceof HTMLElement ? payload.opener : opener;
    chatAnchor = payload.chatAnchor instanceof HTMLElement ? payload.chatAnchor : chatAnchor;
    if (payload.intentId) root.dataset.intentId = payload.intentId;
    if (payload.intentVersion !== undefined && payload.intentVersion !== null) root.dataset.intentVersion = String(payload.intentVersion);
    root.hidden = false;
    frame.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    root.dataset.lastAction = 'pre-start-funding-opened';
    heading.focus();
  });

  if (!root.hidden && !frame.hidden) {
    document.documentElement.classList.add('nebula-modal-open');
    requestAnimationFrame(() => heading.focus());
  }
})();
