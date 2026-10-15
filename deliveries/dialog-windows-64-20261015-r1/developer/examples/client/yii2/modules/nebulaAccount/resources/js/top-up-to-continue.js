(() => {
  const root = document.querySelector('[data-nebula-continuation-topup]');
  if (!root) return;

  const frame = root.querySelector('.continuation-topup__frame');
  const modal = root.querySelector('.continuation-topup__modal');
  const heading = root.querySelector('#continuation-topup-title');
  const close = root.querySelector('[data-continuation-action="dismiss"]');
  const pay = root.querySelector('[data-continuation-action="checkout"]');
  const packages = [...root.querySelectorAll('[data-package-id]')];
  const live = root.querySelector('[data-continuation-live]');
  if (!frame || !modal || !heading || !close || !pay || packages.length !== 3) return;

  let continuationAnchor = document.querySelector('[data-continuation-anchor]');
  let checkoutPending = false;
  const announce = (message) => { if (live) live.textContent = message; };
  const selectedPackage = () => packages.find((item) => item.getAttribute('aria-checked') === 'true');
  const selectPackage = (next, shouldFocus = true) => {
    if (checkoutPending) return;
    packages.forEach((item) => {
      const active = item === next;
      item.classList.toggle('is-selected', active);
      item.setAttribute('aria-checked', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    root.dataset.selectedPackageId = next.dataset.packageId;
    root.dataset.lastAction = 'fixture-package-selected';
    if (shouldFocus) next.focus();
    announce('Package fixture selected locally. No financial or session action occurred.');
  };
  const detail = (reason) => {
    const selected = selectedPackage();
    return {
      reason,
      sessionId: root.dataset.sessionId || null,
      sessionVersion: root.dataset.sessionVersion || null,
      catalogVersion: root.dataset.catalogVersion || null,
      packageId: selected?.dataset.packageId || null,
      packageVersion: selected?.dataset.packageVersion || null,
      commercialFixtureOnly: root.dataset.commercialCopy === 'fixture-only',
      deadlineFixtureOnly: root.dataset.deadlineCopy === 'fixture-only',
      checkoutStarted: false,
      paymentRedirected: false,
      charged: false,
      balanceMutation: false,
      sessionResumed: false,
      sessionStarted: false,
    };
  };
  const dismiss = (reason) => {
    root.hidden = true;
    frame.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    root.dataset.lastAction = 'continuation-topup-dismissed';
    root.dispatchEvent(new CustomEvent('nebula:continuation-topup-dismissed', { detail: detail(reason), bubbles: true }));
    continuationAnchor?.focus();
    announce('Continuation funding overlay dismissed. The server-owned consultation remains paused.');
  };

  packages.forEach((item, index) => {
    item.addEventListener('click', () => selectPackage(item));
    item.addEventListener('keydown', (event) => {
      if (checkoutPending) return;
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

  close.addEventListener('click', () => dismiss('close-button'));
  pay.addEventListener('click', () => {
    if (checkoutPending) return;
    checkoutPending = true;
    root.dataset.lastAction = 'continuation-checkout-required';
    pay.setAttribute('aria-disabled', 'true');
    pay.setAttribute('aria-busy', 'true');
    root.dispatchEvent(new CustomEvent('nebula:continuation-checkout-required', { detail: detail('pay-button'), bubbles: true }));
    announce('Continuation checkout was requested from the host. No checkout, charge, balance update or session resume occurred.');
  });

  root.addEventListener('nebula:continuation-checkout-rejected', (event) => {
    const payload = event.detail || {};
    const selected = selectedPackage();
    if (payload.sessionId !== root.dataset.sessionId
      || String(payload.sessionVersion) !== root.dataset.sessionVersion
      || payload.packageId !== selected?.dataset.packageId
      || String(payload.packageVersion) !== selected?.dataset.packageVersion) return;
    checkoutPending = false;
    pay.removeAttribute('aria-disabled');
    pay.removeAttribute('aria-busy');
    root.dataset.lastAction = 'continuation-checkout-rejected';
    pay.focus();
    announce(payload.fixtureOnly ? 'Fixture simulated rejection — no host was called. Pay and continue is available to retry.' : 'The host rejected the continuation checkout request. Pay and continue is available to retry.');
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dismiss('escape');
      return;
    }
    if (event.key !== 'Tab') return;
    const selected = selectedPackage();
    const focusables = [close, selected, pay].filter(Boolean);
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

  root.addEventListener('nebula:continuation-topup-open', (event) => {
    const payload = event.detail || {};
    const valid = payload.serverState === 'continuation_topup_required'
      && payload.sessionId
      && payload.sessionVersion !== undefined
      && payload.sessionVersion !== null
      && payload.pauseReason === 'insufficient_balance'
      && payload.expertSnapshot
      && payload.expiresAt
      && Array.isArray(payload.packages)
      && payload.packages.length > 0
      && payload.catalogVersion
      && payload.capabilities
      && payload.authenticatedClient === true;
    if (root.dataset.staticProjection !== 'true' && !valid) {
      root.dataset.lastAction = 'open-rejected-authoritative-continuation-snapshot-required';
      announce('A server-authoritative continuation funding snapshot is required.');
      return;
    }
    continuationAnchor = payload.continuationAnchor instanceof HTMLElement ? payload.continuationAnchor : continuationAnchor;
    if (payload.sessionId) root.dataset.sessionId = payload.sessionId;
    if (payload.sessionVersion !== undefined && payload.sessionVersion !== null) root.dataset.sessionVersion = String(payload.sessionVersion);
    if (payload.catalogVersion) root.dataset.catalogVersion = String(payload.catalogVersion);
    checkoutPending = false;
    pay.removeAttribute('aria-disabled');
    pay.removeAttribute('aria-busy');
    root.hidden = false;
    frame.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    root.dataset.lastAction = 'continuation-topup-opened';
    heading.focus();
  });

  if (!root.hidden && !frame.hidden) {
    document.documentElement.classList.add('nebula-modal-open');
    requestAnimationFrame(() => heading.focus());
  }
})();
