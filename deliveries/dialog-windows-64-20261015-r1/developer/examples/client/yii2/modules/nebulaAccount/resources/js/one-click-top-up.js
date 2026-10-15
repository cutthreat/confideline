(() => {
  const root = document.querySelector('[data-nebula-one-click]');
  if (!root) return;

  const frame = root.querySelector('.one-click__frame');
  const modal = root.querySelector('.one-click__modal');
  const heading = root.querySelector('#one-click-title');
  const close = root.querySelector('[data-one-click-action="dismiss"]');
  const purchase = root.querySelector('[data-one-click-action="purchase"]');
  const decline = root.querySelector('[data-one-click-action="decline"]');
  const live = root.querySelector('[data-one-click-live]');
  if (!frame || !modal || !heading || !close || !purchase || !decline) return;

  let opener = document.querySelector('[data-one-click-anchor]');
  let requestPending = false;
  const announce = (message) => { if (live) live.textContent = message; };
  const detail = (reason, action = null) => ({
    action,
    reason,
    sessionId: root.dataset.sessionId || null,
    sessionVersion: root.dataset.sessionVersion || null,
    offerId: root.dataset.offerId || null,
    offerVersion: root.dataset.offerVersion || null,
    packageId: root.dataset.packageId || null,
    packageVersion: root.dataset.packageVersion || null,
    idempotencyKey: root.dataset.idempotencyKey || null,
    commercialFixtureOnly: root.dataset.commercialCopy === 'fixture-only',
    checkoutStarted: false,
    charged: false,
    balanceMutation: false,
    sessionMutation: false,
    sessionResumed: false,
  });
  const setPending = (control, value) => {
    requestPending = value;
    [purchase, decline].forEach((button) => {
      if (value) button.setAttribute('aria-disabled', 'true');
      else button.removeAttribute('aria-disabled');
    });
    if (value) control.setAttribute('aria-busy', 'true');
    else {
      purchase.removeAttribute('aria-busy');
      decline.removeAttribute('aria-busy');
    }
  };
  const dismiss = (reason) => {
    root.hidden = true;
    frame.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    root.dataset.lastAction = 'one-click-dismissed';
    root.dispatchEvent(new CustomEvent('nebula:one-click-dismissed', { detail: detail(reason, 'dismiss'), bubbles: true }));
    opener?.focus();
    announce('One-click top up dismissed. No decline, payment, balance or session state changed.');
  };

  close.addEventListener('click', () => dismiss('close-button'));
  purchase.addEventListener('click', () => {
    if (requestPending) return;
    setPending(purchase, true);
    root.dataset.lastAction = 'one-click-topup-requested';
    root.dispatchEvent(new CustomEvent('nebula:one-click-topup-requested', { detail: detail('purchase-button', 'purchase'), bubbles: true }));
    announce('One-click top up was requested from the host. No payment, balance change or session transition occurred.');
  });
  decline.addEventListener('click', () => {
    if (requestPending) return;
    setPending(decline, true);
    root.dataset.lastAction = 'continuation-decline-requested';
    root.dispatchEvent(new CustomEvent('nebula:continuation-decline-requested', { detail: detail('decline-button', 'decline'), bubbles: true }));
    announce('Continuation decline was requested from the host. The consultation and conversation remain unchanged.');
  });

  root.addEventListener('nebula:one-click-request-rejected', (event) => {
    const payload = event.detail || {};
    if (payload.sessionId !== root.dataset.sessionId
      || String(payload.sessionVersion) !== root.dataset.sessionVersion
      || payload.offerId !== root.dataset.offerId
      || String(payload.offerVersion) !== root.dataset.offerVersion
      || payload.packageId !== root.dataset.packageId
      || String(payload.packageVersion) !== root.dataset.packageVersion
      || payload.idempotencyKey !== root.dataset.idempotencyKey) return;
    setPending(purchase, false);
    root.dataset.lastAction = 'one-click-request-rejected';
    const target = payload.action === 'decline' ? decline : purchase;
    target.focus();
    announce(payload.fixtureOnly ? 'Fixture simulated rejection — no host was called. The action is available to retry.' : 'The host rejected the request. The action is available to retry.');
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dismiss('escape');
      return;
    }
    if (event.key !== 'Tab') return;
    const controls = [close, purchase, decline];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  root.addEventListener('nebula:one-click-open', (event) => {
    const payload = event.detail || {};
    const valid = payload.serverState === 'one_click_topup_offer'
      && payload.pauseReason === 'insufficient_balance'
      && payload.sessionId
      && payload.sessionVersion !== undefined
      && payload.sessionVersion !== null
      && payload.offerId
      && payload.offerVersion !== undefined
      && payload.offerVersion !== null
      && payload.packageId
      && payload.packageVersion !== undefined
      && payload.packageVersion !== null
      && payload.idempotencyKey
      && payload.expiresAt
      && payload.oneClickEligible === true
      && payload.paymentCapability === true
      && payload.authenticatedClient === true;
    if (root.dataset.staticProjection !== 'true' && !valid) {
      root.dataset.lastAction = 'open-rejected-authoritative-one-click-offer-required';
      announce('A server-authoritative one-click offer is required.');
      return;
    }
    opener = payload.opener instanceof HTMLElement ? payload.opener : opener;
    ['sessionId', 'sessionVersion', 'offerId', 'offerVersion', 'packageId', 'packageVersion'].forEach((key) => {
      if (payload[key] !== undefined && payload[key] !== null) root.dataset[key] = String(payload[key]);
    });
    root.dataset.idempotencyKey = String(payload.idempotencyKey);
    setPending(purchase, false);
    root.hidden = false;
    frame.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    root.dataset.lastAction = 'one-click-opened';
    heading.focus();
  });

  if (!root.hidden && !frame.hidden) {
    document.documentElement.classList.add('nebula-modal-open');
    requestAnimationFrame(() => heading.focus());
  }
})();
