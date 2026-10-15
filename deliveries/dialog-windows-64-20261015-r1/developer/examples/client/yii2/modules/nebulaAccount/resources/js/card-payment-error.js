(() => {
  const root = document.querySelector('[data-nebula-card-error]');
  if (!root) return;

  const frame = root.querySelector('.card-error__frame');
  const modal = root.querySelector('.card-error__modal');
  const heading = root.querySelector('#card-error-title');
  const close = root.querySelector('[data-card-error-action="dismiss"]');
  const support = root.querySelector('[data-card-error-action="support"]');
  const wallet = root.querySelector('[data-card-error-action="wallet"]');
  const savedMethod = root.querySelector('[data-card-error-action="saved-method"]');
  const chooser = root.querySelector('[data-card-error-action="chooser"]');
  const live = root.querySelector('[data-card-error-live]');
  const actionControls = [support, wallet, savedMethod, chooser];
  if (!frame || !modal || !heading || !close || actionControls.some((control) => !control)) return;

  let opener = document.querySelector('[data-card-error-anchor]');
  let pendingAction = null;
  const announce = (message) => { if (live) live.textContent = message; };
  const idempotencyKey = (action) => ({
    support: root.dataset.supportIdempotencyKey,
    wallet: root.dataset.walletIdempotencyKey,
    'saved-method': root.dataset.cardIdempotencyKey,
    chooser: root.dataset.chooserIdempotencyKey,
  })[action] || null;
  const detail = (action, reason) => ({
    action,
    reason,
    orderId: root.dataset.orderId || null,
    orderVersion: root.dataset.orderVersion || null,
    attemptId: root.dataset.attemptId || null,
    attemptVersion: root.dataset.attemptVersion || null,
    upstreamContext: root.dataset.upstreamContext || null,
    redactedReference: root.dataset.redactedReference || null,
    methodId: action === 'wallet' ? root.dataset.walletMethodId || null : action === 'saved-method' ? root.dataset.cardMethodId || null : null,
    methodVersion: action === 'wallet' ? root.dataset.walletMethodVersion || null : action === 'saved-method' ? root.dataset.cardMethodVersion || null : null,
    idempotencyKey: idempotencyKey(action),
    reconciliationStatus: 'reconciled',
    methodFixtureOnly: root.dataset.methodCopy === 'fixture-only',
    retryStarted: false,
    orderCreated: false,
    walletLaunched: false,
    charged: false,
    cardCaptured: false,
    balanceMutation: false,
    sessionMutation: false,
    sessionResumed: false,
  });
  const setPending = (control, action) => {
    pendingAction = action;
    actionControls.forEach((button) => button.setAttribute('aria-disabled', 'true'));
    control.setAttribute('aria-busy', 'true');
  };
  const clearPending = () => {
    pendingAction = null;
    actionControls.forEach((button) => {
      button.removeAttribute('aria-disabled');
      button.removeAttribute('aria-busy');
    });
  };
  const dismiss = (reason) => {
    root.hidden = true;
    frame.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    root.dataset.lastAction = 'card-payment-error-dismissed';
    root.dispatchEvent(new CustomEvent('nebula:card-payment-error-dismissed', { detail: detail('dismiss', reason), bubbles: true }));
    opener?.focus();
    announce('Card payment error dismissed. No retry, charge, balance or session state changed.');
  };
  const request = (control, action, eventName, message) => {
    if (pendingAction) return;
    setPending(control, action);
    root.dataset.lastAction = action;
    root.dispatchEvent(new CustomEvent(eventName, { detail: detail(action, `${action}-control`), bubbles: true }));
    announce(message);
  };

  close.addEventListener('click', () => dismiss('close-button'));
  support.addEventListener('click', () => request(support, 'support', 'nebula:payment-support-requested', 'Payment support was requested from the host. No support destination or payment change was claimed.'));
  support.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    support.click();
  });
  wallet.addEventListener('click', () => request(wallet, 'wallet', 'nebula:wallet-payment-intent-requested', 'A wallet payment intent was requested from the host. No wallet, charge or payment flow was started.'));
  savedMethod.addEventListener('click', () => request(savedMethod, 'saved-method', 'nebula:saved-payment-method-intent-requested', 'A saved payment method intent was requested from the host. No card data or charge was processed.'));
  chooser.addEventListener('click', () => request(chooser, 'chooser', 'nebula:payment-method-chooser-requested', 'A payment method chooser was requested from the host. No retry or new order was started.'));

  root.addEventListener('nebula:card-payment-error-request-rejected', (event) => {
    const payload = event.detail || {};
    if (payload.orderId !== root.dataset.orderId
      || String(payload.orderVersion) !== root.dataset.orderVersion
      || payload.attemptId !== root.dataset.attemptId
      || String(payload.attemptVersion) !== root.dataset.attemptVersion
      || payload.action !== pendingAction
      || payload.idempotencyKey !== idempotencyKey(pendingAction)) return;
    const target = ({ support, wallet, 'saved-method': savedMethod, chooser })[pendingAction];
    clearPending();
    root.dataset.lastAction = 'card-payment-error-request-rejected';
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
    const controls = [close, support, wallet, savedMethod, chooser];
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

  root.addEventListener('nebula:card-payment-error-open', (event) => {
    const payload = event.detail || {};
    const methods = Array.isArray(payload.eligibleMethods) ? payload.eligibleMethods : [];
    const walletMethod = methods.find((method) => method?.type === 'apple_pay' && method.id && method.version !== undefined && method.version !== null);
    const cardMethod = methods.find((method) => method?.type === 'saved_card' && method.id && method.version !== undefined && method.version !== null && method.maskedDisplay);
    const keys = payload.idempotencyKeys || {};
    const valid = payload.serverState === 'card_payment_error'
      && payload.reconciliationStatus === 'reconciled'
      && payload.orderId && payload.orderVersion !== undefined && payload.orderVersion !== null
      && payload.attemptId && payload.attemptVersion !== undefined && payload.attemptVersion !== null
      && payload.upstreamContext && payload.redactedReference
      && walletMethod && cardMethod
      && keys.wallet && keys.savedMethod && keys.chooser && keys.support
      && payload.authenticatedClient === true
      && payload.capabilities?.walletPaymentIntent === true
      && payload.capabilities?.savedPaymentMethodIntent === true
      && payload.capabilities?.paymentMethodChooser === true
      && payload.capabilities?.paymentSupport === true;
    if (root.dataset.staticProjection !== 'true' && !valid) {
      root.dataset.lastAction = 'open-rejected-authoritative-card-payment-error-required';
      announce('A reconciled server-authoritative card payment error snapshot is required.');
      return;
    }
    opener = payload.opener instanceof HTMLElement ? payload.opener : opener;
    ['orderId','orderVersion','attemptId','attemptVersion','upstreamContext','redactedReference'].forEach((key) => {
      if (payload[key] !== undefined && payload[key] !== null) root.dataset[key] = String(payload[key]);
    });
    if (walletMethod) {
      root.dataset.walletMethodId = String(walletMethod.id);
      root.dataset.walletMethodVersion = String(walletMethod.version);
    }
    if (cardMethod) {
      root.dataset.cardMethodId = String(cardMethod.id);
      root.dataset.cardMethodVersion = String(cardMethod.version);
    }
    if (keys.wallet) root.dataset.walletIdempotencyKey = String(keys.wallet);
    if (keys.savedMethod) root.dataset.cardIdempotencyKey = String(keys.savedMethod);
    if (keys.chooser) root.dataset.chooserIdempotencyKey = String(keys.chooser);
    if (keys.support) root.dataset.supportIdempotencyKey = String(keys.support);
    clearPending();
    root.hidden = false;
    frame.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    root.dataset.lastAction = 'card-payment-error-opened';
    heading.focus();
  });

  if (!root.hidden && !frame.hidden) {
    document.documentElement.classList.add('nebula-modal-open');
    requestAnimationFrame(() => heading.focus());
  }
})();
