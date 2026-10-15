(() => {
  const root = document.querySelector('[data-nebula-discount-offer]');
  if (!root) return;

  const frame = root.querySelector('.discount-offer__frame');
  const modal = root.querySelector('.discount-offer__modal');
  const heading = root.querySelector('#discount-offer-title');
  const close = root.querySelector('[data-discount-action="dismiss"]');
  const proceed = root.querySelector('[data-discount-action="continue"]');
  const summary = root.querySelector('.discount-offer__summary');
  const live = root.querySelector('[data-discount-live]');
  if (!frame || !modal || !heading || !close || !proceed || !summary) return;

  let opener = document.querySelector('[data-discount-offer-anchor]');
  let requestPending = false;
  const announce = (message) => { if (live) live.textContent = message; };
  const detail = (reason) => ({
    reason,
    offerId: root.dataset.offerId || null,
    offerVersion: root.dataset.offerVersion || null,
    catalogVersion: root.dataset.catalogVersion || null,
    expertId: root.dataset.expertId || null,
    readingIntentId: root.dataset.readingIntentId || null,
    pricingFixtureOnly: root.dataset.pricingCopy === 'fixture-only',
    checkoutStarted: false,
    paymentRedirected: false,
    charged: false,
    balanceMutation: false,
    sessionCreated: false,
    sessionResumed: false,
  });
  const dismiss = (reason) => {
    root.hidden = true;
    frame.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    root.dataset.lastAction = 'discount-offer-dismissed';
    root.dispatchEvent(new CustomEvent('nebula:discount-offer-dismissed', { detail: detail(reason), bubbles: true }));
    opener?.focus();
    announce('Discounted refill offer dismissed. No pricing, balance, payment or session state changed.');
  };

  close.addEventListener('click', () => dismiss('close-button'));
  proceed.addEventListener('click', () => {
    if (requestPending) return;
    requestPending = true;
    root.dataset.lastAction = 'discounted-checkout-requested';
    proceed.setAttribute('aria-disabled', 'true');
    proceed.setAttribute('aria-busy', 'true');
    root.dispatchEvent(new CustomEvent('nebula:discounted-checkout-requested', { detail: detail('continue-button'), bubbles: true }));
    announce('Discounted checkout was requested from the host. No checkout, charge, balance change or session transition occurred.');
  });

  root.addEventListener('nebula:discounted-checkout-rejected', (event) => {
    const payload = event.detail || {};
    if (payload.offerId !== root.dataset.offerId
      || String(payload.offerVersion) !== root.dataset.offerVersion
      || String(payload.catalogVersion) !== root.dataset.catalogVersion) return;
    requestPending = false;
    proceed.removeAttribute('aria-disabled');
    proceed.removeAttribute('aria-busy');
    root.dataset.lastAction = 'discounted-checkout-rejected';
    proceed.focus();
    announce(payload.fixtureOnly ? 'Fixture simulated rejection — no host was called. Continue is available to retry.' : 'The host rejected the discounted checkout request. Continue is available to retry.');
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dismiss('escape');
      return;
    }
    if (event.key !== 'Tab') return;
    if (event.shiftKey && document.activeElement === close) {
      event.preventDefault();
      proceed.focus();
    } else if (!event.shiftKey && document.activeElement === proceed) {
      event.preventDefault();
      close.focus();
    }
  });

  root.addEventListener('nebula:discount-offer-open', (event) => {
    const payload = event.detail || {};
    const valid = payload.serverState === 'discounted_refill_offer'
      && payload.offerId
      && payload.offerVersion !== undefined
      && payload.offerVersion !== null
      && payload.catalogVersion
      && payload.expertId
      && payload.readingIntentId
      && payload.credits
      && payload.listPrice
      && payload.effectivePrice
      && payload.currency
      && payload.discountClaim
      && payload.entitlement
      && payload.capabilities
      && payload.authenticatedClient === true;
    if (root.dataset.staticProjection !== 'true' && !valid) {
      root.dataset.lastAction = 'open-rejected-authoritative-discount-offer-required';
      announce('A server-authoritative discounted refill offer is required.');
      return;
    }
    opener = payload.opener instanceof HTMLElement ? payload.opener : opener;
    if (payload.offerId) root.dataset.offerId = payload.offerId;
    if (payload.offerVersion !== undefined && payload.offerVersion !== null) root.dataset.offerVersion = String(payload.offerVersion);
    if (payload.catalogVersion) root.dataset.catalogVersion = String(payload.catalogVersion);
    if (payload.expertId) root.dataset.expertId = String(payload.expertId);
    if (payload.readingIntentId) root.dataset.readingIntentId = String(payload.readingIntentId);
    requestPending = false;
    proceed.removeAttribute('aria-disabled');
    proceed.removeAttribute('aria-busy');
    root.hidden = false;
    frame.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    root.dataset.lastAction = 'discount-offer-opened';
    heading.focus();
  });

  if (!root.hidden && !frame.hidden) {
    document.documentElement.classList.add('nebula-modal-open');
    requestAnimationFrame(() => heading.focus());
  }
})();
