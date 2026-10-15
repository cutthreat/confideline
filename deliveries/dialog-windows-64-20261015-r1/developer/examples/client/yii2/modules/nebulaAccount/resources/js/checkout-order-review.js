(() => {
  const root = document.querySelector('[data-nebula-checkout-review]');
  if (!root) return;
  const frame = root.querySelector('.checkout-review__frame');
  const modal = root.querySelector('.checkout-review__modal');
  const heading = root.querySelector('#checkout-review-title');
  const close = root.querySelector('[data-checkout-action="dismiss"]');
  const chooser = root.querySelector('[data-checkout-action="saved-chooser"]');
  const buy = root.querySelector('[data-checkout-action="submit"]');
  const radios = Array.from(root.querySelectorAll('[role="radio"][data-method-id]'));
  const live = root.querySelector('[data-checkout-live]');
  if (!frame || !modal || !heading || !close || !chooser || !buy || radios.length !== 4) return;

  let opener = document.querySelector('[data-checkout-anchor]');
  let pendingAction = null;
  const announce = (message) => { if (live) live.textContent = message; };
  const selected = () => radios.find((radio) => radio.getAttribute('aria-checked') === 'true') || null;
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
    [...radios, chooser, buy].forEach((item) => item.setAttribute('aria-disabled', 'true'));
    control.setAttribute('aria-busy', 'true');
  };
  const clearPending = () => {
    pendingAction = null;
    [...radios, chooser, buy].forEach((item) => {
      item.removeAttribute('aria-disabled');
      item.removeAttribute('aria-busy');
    });
  };
  const baseDetail = (action) => ({
    action,
    checkoutId: root.dataset.checkoutId || null,
    checkoutVersion: root.dataset.checkoutVersion || null,
    packageId: root.dataset.packageId || null,
    packageVersion: root.dataset.packageVersion || null,
    selectedMethodId: root.dataset.selectedMethodId || null,
    selectedMethodVersion: root.dataset.selectedMethodVersion || null,
    idempotencyKey: action === 'submit' ? root.dataset.submitIdempotencyKey || null : root.dataset.chooserIdempotencyKey || null,
    orderFixtureOnly: root.dataset.orderCopy === 'fixture-only',
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
    root.dataset.lastAction = 'checkout-review-dismissed';
    root.dispatchEvent(new CustomEvent('nebula:checkout-review-dismissed', { detail: { ...baseDetail('dismiss'), reason }, bubbles: true }));
    opener?.focus();
  };

  close.addEventListener('click', () => dismiss('close-button'));
  radios.forEach((radio, index) => {
    radio.addEventListener('click', () => setSelected(radio, true));
    radio.addEventListener('keydown', (event) => {
      if (pendingAction) return;
      let next = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = radios[Math.min(radios.length - 1, index + 1)];
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = radios[Math.max(0, index - 1)];
      else if (event.key === 'Home') next = radios[0];
      else if (event.key === 'End') next = radios[radios.length - 1];
      else if (event.key === ' ') next = radio;
      if (!next) return;
      event.preventDefault();
      setSelected(next, true);
    });
  });
  chooser.addEventListener('click', () => {
    if (pendingAction) return;
    setPending(chooser, 'chooser');
    root.dataset.lastAction = 'saved-payment-method-chooser-requested';
    root.dispatchEvent(new CustomEvent('nebula:saved-payment-method-chooser-requested', { detail: baseDetail('chooser'), bubbles: true }));
    announce('A saved payment method chooser was requested from the host. No chooser contents or payment flow was opened.');
  });
  buy.addEventListener('click', () => {
    if (pendingAction || !selected()) return;
    setPending(buy, 'submit');
    root.dataset.lastAction = 'checkout-submit-requested';
    root.dispatchEvent(new CustomEvent('nebula:checkout-submit-requested', { detail: baseDetail('submit'), bubbles: true }));
    announce('Checkout submission was requested from the host. No provider, charge, credits, balance or session state changed.');
  });

  root.addEventListener('nebula:checkout-request-rejected', (event) => {
    const payload = event.detail || {};
    const expectedKey = pendingAction === 'submit' ? root.dataset.submitIdempotencyKey : root.dataset.chooserIdempotencyKey;
    if (payload.checkoutId !== root.dataset.checkoutId
      || String(payload.checkoutVersion) !== root.dataset.checkoutVersion
      || payload.action !== pendingAction
      || payload.selectedMethodId !== root.dataset.selectedMethodId
      || String(payload.selectedMethodVersion) !== root.dataset.selectedMethodVersion
      || payload.idempotencyKey !== expectedKey) return;
    const target = pendingAction === 'submit' ? buy : chooser;
    clearPending();
    root.dataset.lastAction = 'checkout-request-rejected';
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
    const controls = [close, ...radios.filter((radio) => radio.tabIndex === 0), chooser, buy];
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

  root.addEventListener('nebula:checkout-review-open', (event) => {
    const payload = event.detail || {};
    const methods = Array.isArray(payload.eligibleMethods) ? payload.eligibleMethods : [];
    const exactTypes = ['paypal','apple_pay','credit_card','saved_card'];
    const validMethods = methods.length === 4 && exactTypes.every((type) => methods.filter((method) => method?.type === type && method.id && method.version !== undefined && method.version !== null).length === 1);
    const selectedMethod = methods.find((method) => method?.id === payload.selectedMethodId);
    const valid = payload.serverState === 'checkout_order_review'
      && payload.checkoutId && payload.checkoutVersion !== undefined && payload.checkoutVersion !== null
      && payload.packageId && payload.packageVersion !== undefined && payload.packageVersion !== null
      && payload.credits && payload.subtotal && payload.total && payload.currency
      && validMethods && selectedMethod && payload.selectedMethodVersion !== undefined && payload.selectedMethodVersion !== null
      && payload.submitIdempotencyKey && payload.chooserIdempotencyKey && payload.submitIdempotencyKey !== payload.chooserIdempotencyKey
      && payload.authenticatedClient === true
      && payload.capabilities?.checkoutSubmit === true && payload.capabilities?.savedMethodChooser === true;
    if (root.dataset.staticProjection !== 'true' && !valid) {
      root.dataset.lastAction = 'open-rejected-authoritative-checkout-required';
      announce('A server-authoritative checkout snapshot is required.');
      return;
    }
    opener = payload.opener instanceof HTMLElement ? payload.opener : opener;
    ['checkoutId','checkoutVersion','packageId','packageVersion','selectedMethodId','selectedMethodVersion','submitIdempotencyKey','chooserIdempotencyKey'].forEach((key) => {
      if (payload[key] !== undefined && payload[key] !== null) root.dataset[key] = String(payload[key]);
    });
    methods.forEach((method) => {
      const radio = radios.find((item) => item.dataset.methodType === method.type);
      if (radio) {
        radio.dataset.methodId = String(method.id);
        radio.dataset.methodVersion = String(method.version);
      }
    });
    const selectedRadio = radios.find((radio) => radio.dataset.methodId === root.dataset.selectedMethodId);
    clearPending();
    setSelected(selectedRadio, false);
    root.hidden = false;
    frame.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    root.dataset.lastAction = 'checkout-review-opened';
    heading.focus();
  });

  if (!root.hidden && !frame.hidden) {
    document.documentElement.classList.add('nebula-modal-open');
    requestAnimationFrame(() => heading.focus());
  }
})();
