(() => {
  const root = document.querySelector('[data-nebula-card-details]');
  if (!root) return;
  const frame = root.querySelector('.card-details__frame');
  const modal = root.querySelector('.card-details__modal');
  const heading = root.querySelector('#card-details-title');
  const close = root.querySelector('[data-card-details-action="dismiss"]');
  const chooser = root.querySelector('[data-card-details-action="saved-chooser"]');
  const secureFields = Array.from(root.querySelectorAll('[data-card-details-action="secure-form"]'));
  const buy = root.querySelector('[data-card-details-action="submit"]');
  const radios = Array.from(root.querySelectorAll('[role="radio"][data-method-id]'));
  const live = root.querySelector('[data-card-details-live]');
  if (!frame || !modal || !heading || !close || !chooser || !buy || secureFields.length !== 3 || radios.length !== 4) return;

  let opener = document.querySelector('[data-card-details-anchor]');
  let pendingAction = null;
  let pendingControl = null;
  const announce = (message) => { if (live) live.textContent = message; };
  const selected = () => radios.find((radio) => radio.getAttribute('aria-checked') === 'true') || null;
  const allActions = [...radios, chooser, ...secureFields, buy];
  const setSelected = (radio, focus = true) => {
    if (pendingAction || !radio) return;
    radios.forEach((item) => {
      const active = item === radio;
      item.setAttribute('aria-checked', active ? 'true' : 'false');
      item.tabIndex = active ? 0 : -1;
    });
    root.dataset.selectedMethodId = radio.dataset.methodId;
    root.dataset.selectedMethodVersion = radio.dataset.methodVersion;
    if (focus) radio.focus();
  };
  const setPending = (control, action) => {
    pendingAction = action;
    pendingControl = control;
    allActions.forEach((item) => item.setAttribute('aria-disabled', 'true'));
    control.setAttribute('aria-busy', 'true');
  };
  const clearPending = () => {
    pendingAction = null;
    pendingControl = null;
    allActions.forEach((item) => {
      item.removeAttribute('aria-disabled');
      item.removeAttribute('aria-busy');
    });
  };
  const keyFor = (action) => ({
    method: root.dataset.methodIdempotencyKey,
    chooser: root.dataset.chooserIdempotencyKey,
    secureForm: root.dataset.secureFormIdempotencyKey,
    submit: root.dataset.submitIdempotencyKey,
  }[action] || null);
  const baseDetail = (action) => ({
    action,
    checkoutId: root.dataset.checkoutId || null,
    checkoutVersion: root.dataset.checkoutVersion || null,
    packageId: root.dataset.packageId || null,
    packageVersion: root.dataset.packageVersion || null,
    selectedMethodId: root.dataset.selectedMethodId || null,
    selectedMethodVersion: root.dataset.selectedMethodVersion || null,
    idempotencyKey: keyFor(action),
    secureFieldSlot: action === 'secureForm' ? pendingControl?.dataset.secureFieldSlot || null : null,
    orderFixtureOnly: root.dataset.orderCopy === 'fixture-only',
    cardDataIncluded: false,
    secureFormMounted: false,
    providerLaunched: false,
    checkoutSubmitted: false,
    cardCaptured: false,
    charged: false,
    creditsGranted: false,
    balanceMutation: false,
    sessionMutation: false,
    sessionResumed: false,
  });
  const dismiss = (reason) => {
    root.hidden = true;
    frame.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    root.dataset.lastAction = 'card-details-dismissed';
    root.dispatchEvent(new CustomEvent('nebula:card-details-dismissed', { detail: { ...baseDetail('dismiss'), reason }, bubbles: true }));
    opener?.focus();
  };
  const dispatchPending = (control, action, eventName, message) => {
    if (pendingAction) return;
    setPending(control, action);
    root.dataset.lastAction = eventName;
    root.dispatchEvent(new CustomEvent(`nebula:${eventName}`, { detail: baseDetail(action), bubbles: true }));
    announce(message);
  };

  close.addEventListener('click', () => dismiss('close-button'));
  radios.forEach((radio, index) => {
    radio.addEventListener('click', () => {
      if (pendingAction) return;
      setSelected(radio, true);
      dispatchPending(radio, 'method', 'payment-method-selection-requested', 'Payment method selection was requested from the host. No provider or payment flow was opened.');
    });
    radio.addEventListener('keydown', (event) => {
      if (pendingAction) return;
      let next = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = radios[Math.min(radios.length - 1, index + 1)];
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = radios[Math.max(0, index - 1)];
      else if (event.key === 'Home') next = radios[0];
      else if (event.key === 'End') next = radios[radios.length - 1];
      if (!next) return;
      event.preventDefault();
      setSelected(next, true);
    });
  });
  chooser.addEventListener('click', () => dispatchPending(chooser, 'chooser', 'saved-payment-method-chooser-requested', 'A saved payment method chooser was requested from the host.'));
  secureFields.forEach((field) => field.addEventListener('click', () => dispatchPending(field, 'secureForm', 'secure-payment-form-required', 'A provider-hosted secure form was requested. No card data was captured.')));
  buy.addEventListener('click', () => {
    if (!selected()) return;
    dispatchPending(buy, 'submit', 'checkout-submit-requested', 'Checkout submission was requested from the host without card values.');
  });

  root.addEventListener('nebula:card-details-request-rejected', (event) => {
    const payload = event.detail || {};
    if (payload.checkoutId !== root.dataset.checkoutId
      || String(payload.checkoutVersion) !== root.dataset.checkoutVersion
      || payload.action !== pendingAction
      || payload.selectedMethodId !== root.dataset.selectedMethodId
      || String(payload.selectedMethodVersion) !== root.dataset.selectedMethodVersion
      || payload.idempotencyKey !== keyFor(pendingAction)
      || (pendingAction === 'secureForm' && payload.secureFieldSlot !== pendingControl?.dataset.secureFieldSlot)) return;
    const target = pendingControl || (pendingAction === 'submit' ? buy : pendingAction === 'chooser' ? chooser : selected());
    clearPending();
    root.dataset.lastAction = 'card-details-request-rejected';
    target?.focus();
    announce(payload.fixtureOnly ? 'Fixture simulated rejection — no host was called. The action is available to retry.' : 'The host rejected the request. The action is available to retry.');
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dismiss('escape');
      return;
    }
    if (event.key !== 'Tab') return;
    const controls = [close, ...radios.filter((radio) => radio.tabIndex === 0), chooser, ...secureFields, buy];
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

  root.addEventListener('nebula:card-details-open', (event) => {
    const payload = event.detail || {};
    const methods = Array.isArray(payload.eligibleMethods) ? payload.eligibleMethods : [];
    const exactTypes = ['paypal', 'apple_pay', 'credit_card', 'saved_card'];
    const validMethods = methods.length === 4 && exactTypes.every((type, index) => methods[index]?.type === type && methods[index]?.id && methods[index]?.version !== undefined && methods[index]?.version !== null);
    const selectedMethod = methods.find((method) => method?.id === payload.selectedMethodId && String(method?.version) === String(payload.selectedMethodVersion));
    const keys = [payload.methodIdempotencyKey, payload.chooserIdempotencyKey, payload.secureFormIdempotencyKey, payload.submitIdempotencyKey];
    const valid = payload.serverState === 'checkout_card_details'
      && payload.checkoutId && payload.checkoutVersion !== undefined && payload.checkoutVersion !== null
      && payload.packageId && payload.packageVersion !== undefined && payload.packageVersion !== null
      && payload.total && payload.currency && validMethods && selectedMethod
      && payload.secureFormCapability === true && payload.authenticatedClient === true
      && payload.capabilities?.paymentMethodSelection === true
      && payload.capabilities?.savedMethodChooser === true
      && payload.capabilities?.securePaymentForm === true
      && payload.capabilities?.checkoutSubmit === true
      && keys.every(Boolean) && new Set(keys).size === keys.length;
    if (root.dataset.staticProjection !== 'true' && !valid) {
      root.dataset.lastAction = 'open-rejected-authoritative-secure-checkout-required';
      announce('A server-authoritative checkout snapshot and secure-form capability are required.');
      return;
    }
    opener = payload.opener instanceof HTMLElement ? payload.opener : opener;
    ['checkoutId', 'checkoutVersion', 'packageId', 'packageVersion', 'selectedMethodId', 'selectedMethodVersion', 'methodIdempotencyKey', 'chooserIdempotencyKey', 'secureFormIdempotencyKey', 'submitIdempotencyKey'].forEach((key) => {
      if (payload[key] !== undefined && payload[key] !== null) root.dataset[key] = String(payload[key]);
    });
    methods.forEach((method, index) => {
      radios[index].dataset.methodId = String(method.id);
      radios[index].dataset.methodVersion = String(method.version);
    });
    clearPending();
    setSelected(radios.find((radio) => radio.dataset.methodId === root.dataset.selectedMethodId), false);
    root.hidden = false;
    frame.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    root.dataset.lastAction = 'card-details-opened';
    heading.focus();
  });

  if (!root.hidden && !frame.hidden) {
    document.documentElement.classList.add('nebula-modal-open');
    requestAnimationFrame(() => heading.focus());
  }
})();
