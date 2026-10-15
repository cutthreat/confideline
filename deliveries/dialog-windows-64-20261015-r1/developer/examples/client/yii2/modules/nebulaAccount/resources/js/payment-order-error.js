(() => {
  const root = document.querySelector('[data-nebula-payment-error]');
  if (!root) return;

  const frame = root.querySelector('.payment-error__frame');
  const modal = root.querySelector('.payment-error__modal');
  const heading = root.querySelector('#payment-error-title');
  const close = root.querySelector('[data-payment-error-action="dismiss"]');
  const support = root.querySelector('[data-payment-error-action="support"]');
  const alternate = root.querySelector('[data-payment-error-action="alternate"]');
  const live = root.querySelector('[data-payment-error-live]');
  if (!frame || !modal || !heading || !close || !support || !alternate) return;

  let opener = document.querySelector('[data-payment-error-anchor]');
  let pendingAction = null;
  const announce = (message) => { if (live) live.textContent = message; };
  const context = (reason, action = null) => ({
    action,
    reason,
    orderId: root.dataset.orderId || null,
    orderVersion: root.dataset.orderVersion || null,
    attemptId: root.dataset.attemptId || null,
    attemptVersion: root.dataset.attemptVersion || null,
    upstreamContext: root.dataset.upstreamContext || null,
    redactedReference: root.dataset.redactedReference || null,
    idempotencyKey: root.dataset.idempotencyKey || null,
    reconciliationRequired: true,
    retryStarted: false,
    orderCreated: false,
    paymentMethodChanged: false,
    charged: false,
    balanceMutation: false,
    sessionMutation: false,
    sessionResumed: false,
  });
  const setPending = (control, action) => {
    pendingAction = action;
    [support, alternate].forEach((button) => button.setAttribute('aria-disabled', 'true'));
    control.setAttribute('aria-busy', 'true');
  };
  const clearPending = () => {
    pendingAction = null;
    [support, alternate].forEach((button) => {
      button.removeAttribute('aria-disabled');
      button.removeAttribute('aria-busy');
    });
  };
  const dismiss = (reason) => {
    root.hidden = true;
    frame.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    root.dataset.lastAction = 'payment-error-dismissed';
    root.dispatchEvent(new CustomEvent('nebula:payment-error-dismissed', { detail: context(reason, 'dismiss'), bubbles: true }));
    opener?.focus();
    announce('Payment error dismissed. No retry, charge, balance or session state changed.');
  };

  close.addEventListener('click', () => dismiss('close-button'));
  support.addEventListener('click', () => {
    if (pendingAction) return;
    setPending(support, 'support');
    root.dataset.lastAction = 'payment-support-requested';
    root.dispatchEvent(new CustomEvent('nebula:payment-support-requested', { detail: context('support-link', 'support'), bubbles: true }));
    announce('Payment support was requested from the host. No support destination or payment change was claimed.');
  });
  alternate.addEventListener('click', () => {
    if (pendingAction) return;
    setPending(alternate, 'alternate');
    root.dataset.lastAction = 'alternate-payment-method-requested';
    root.dispatchEvent(new CustomEvent('nebula:alternate-payment-method-requested', { detail: context('alternate-method-button', 'alternate'), bubbles: true }));
    announce('An alternate payment method was requested from the host. The original attempt must be reconciled before any new order.');
  });

  root.addEventListener('nebula:payment-error-request-rejected', (event) => {
    const payload = event.detail || {};
    if (payload.orderId !== root.dataset.orderId
      || String(payload.orderVersion) !== root.dataset.orderVersion
      || payload.attemptId !== root.dataset.attemptId
      || String(payload.attemptVersion) !== root.dataset.attemptVersion
      || payload.idempotencyKey !== root.dataset.idempotencyKey
      || payload.action !== pendingAction) return;
    const target = pendingAction === 'support' ? support : alternate;
    clearPending();
    root.dataset.lastAction = 'payment-error-request-rejected';
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
    const controls = [close, support, alternate];
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

  root.addEventListener('nebula:payment-error-open', (event) => {
    const payload = event.detail || {};
    const valid = payload.serverState === 'payment_order_error'
      && payload.orderId
      && payload.orderVersion !== undefined && payload.orderVersion !== null
      && payload.attemptId
      && payload.attemptVersion !== undefined && payload.attemptVersion !== null
      && payload.upstreamContext
      && payload.redactedReference
      && payload.idempotencyKey
      && payload.authenticatedClient === true
      && payload.capabilities?.alternatePaymentMethod === true
      && payload.capabilities?.paymentSupport === true;
    if (root.dataset.staticProjection !== 'true' && !valid) {
      root.dataset.lastAction = 'open-rejected-authoritative-payment-error-required';
      announce('A server-authoritative payment error snapshot is required.');
      return;
    }
    opener = payload.opener instanceof HTMLElement ? payload.opener : opener;
    ['orderId','orderVersion','attemptId','attemptVersion','upstreamContext','redactedReference','idempotencyKey'].forEach((key) => {
      if (payload[key] !== undefined && payload[key] !== null) root.dataset[key] = String(payload[key]);
    });
    clearPending();
    root.hidden = false;
    frame.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    root.dataset.lastAction = 'payment-error-opened';
    heading.focus();
  });

  if (!root.hidden && !frame.hidden) {
    document.documentElement.classList.add('nebula-modal-open');
    requestAnimationFrame(() => heading.focus());
  }
})();
