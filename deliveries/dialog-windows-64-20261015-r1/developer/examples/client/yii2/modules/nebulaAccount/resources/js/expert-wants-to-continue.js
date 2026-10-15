(() => {
  const root = document.querySelector('[data-nebula-followup-offer]');
  if (!root) return;

  const frame = root.querySelector('.followup-offer__frame');
  const modal = root.querySelector('.followup-offer__modal');
  const heading = root.querySelector('#followup-offer-title');
  const close = root.querySelector('[data-offer-action="dismiss"]');
  const start = root.querySelector('[data-offer-action="accept"]');
  const live = root.querySelector('[data-offer-live]');
  if (!frame || !modal || !heading || !close || !start) return;

  let offerAnchor = document.querySelector('[data-offer-anchor]');
  let acceptPending = false;
  const announce = (message) => { if (live) live.textContent = message; };
  const detail = (reason) => ({
    reason,
    offerId: root.dataset.offerId || null,
    offerVersion: root.dataset.offerVersion || null,
    expertId: root.dataset.expertId || null,
    fixtureCopyOnly: root.dataset.visibleCopy === 'fixture-only',
    offerAccepted: false,
    sessionCreated: false,
    sessionStarted: false,
    connectingStarted: false,
    paymentStarted: false,
    balanceMutation: false,
  });
  const dismiss = (reason) => {
    root.hidden = true;
    frame.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    root.dataset.lastAction = 'followup-offer-dismissed';
    root.dispatchEvent(new CustomEvent('nebula:followup-offer-dismissed', { detail: detail(reason), bubbles: true }));
    offerAnchor?.focus();
    announce('Follow-up offer dismissed. The persistent free dialogue and server offer state are unchanged.');
  };

  close.addEventListener('click', () => dismiss('close-button'));
  start.addEventListener('click', () => {
    if (acceptPending) return;
    acceptPending = true;
    root.dataset.lastAction = 'consultation-offer-accept-requested';
    start.setAttribute('aria-disabled', 'true');
    start.setAttribute('aria-busy', 'true');
    root.dispatchEvent(new CustomEvent('nebula:consultation-offer-accept-requested', {
      detail: detail('start-chat-button'),
      bubbles: true,
    }));
    announce('Offer acceptance was requested from the host. No session, connection, payment or balance change occurred.');
  });

  root.addEventListener('nebula:followup-offer-accept-rejected', (event) => {
    const payload = event.detail || {};
    if (payload.offerId !== root.dataset.offerId || String(payload.offerVersion) !== root.dataset.offerVersion) return;
    acceptPending = false;
    start.removeAttribute('aria-disabled');
    start.removeAttribute('aria-busy');
    root.dataset.lastAction = 'consultation-offer-accept-rejected';
    start.focus();
    announce(payload.fixtureOnly ? 'Fixture simulated rejection — no host was called. Start chat is available to retry.' : 'The host rejected the offer acceptance request. Start chat is available to retry.');
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dismiss('escape');
      return;
    }
    if (event.key !== 'Tab') return;
    const focusables = [close, start];
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

  root.addEventListener('nebula:followup-offer-open', (event) => {
    const payload = event.detail || {};
    const valid = payload.serverState === 'expert_followup_offer_pending'
      && payload.offerId
      && payload.offerVersion !== undefined
      && payload.offerVersion !== null
      && payload.expertId
      && payload.expiresAt
      && payload.eligibility
      && payload.capabilities
      && payload.authenticatedClient === true;
    if (root.dataset.staticProjection !== 'true' && !valid) {
      root.dataset.lastAction = 'open-rejected-authoritative-offer-required';
      announce('A server-authoritative follow-up offer snapshot is required.');
      return;
    }
    offerAnchor = payload.offerAnchor instanceof HTMLElement ? payload.offerAnchor : offerAnchor;
    if (payload.offerId) root.dataset.offerId = payload.offerId;
    if (payload.offerVersion !== undefined && payload.offerVersion !== null) root.dataset.offerVersion = String(payload.offerVersion);
    if (payload.expertId) root.dataset.expertId = payload.expertId;
    acceptPending = false;
    start.removeAttribute('aria-disabled');
    start.removeAttribute('aria-busy');
    root.hidden = false;
    frame.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    root.dataset.lastAction = 'followup-offer-opened';
    heading.focus();
  });

  if (!root.hidden && !frame.hidden) {
    document.documentElement.classList.add('nebula-modal-open');
    requestAnimationFrame(() => heading.focus());
  }
})();
