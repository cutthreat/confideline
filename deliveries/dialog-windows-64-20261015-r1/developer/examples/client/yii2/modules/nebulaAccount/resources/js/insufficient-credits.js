(() => {
  const root = document.querySelector('[data-nebula-insufficient-credits]');
  if (!root) return;

  const frame = root.querySelector('.insufficient-credits__frame');
  const modal = root.querySelector('.insufficient-credits__modal');
  const heading = root.querySelector('#insufficient-credits-title');
  const close = root.querySelector('[data-balance-action="dismiss"]');
  const activate = root.querySelector('[data-balance-action="activate"]');
  const skip = root.querySelector('[data-balance-action="standard-topup"]');
  const live = root.querySelector('[data-balance-live]');
  if (!frame || !modal || !heading || !close || !activate || !skip) return;

  let balancePauseAnchor = document.querySelector('[data-balance-pause-anchor]');
  const announce = (message) => { if (live) live.textContent = message; };
  const detail = (reason) => ({
    reason,
    sessionId: root.dataset.sessionId || null,
    sessionVersion: root.dataset.sessionVersion || null,
    commercialFixtureOnly: root.dataset.commercialCopy === 'fixture-only',
    paymentStarted: false,
    autoRefillEnrolled: false,
    balanceMutation: false,
    sessionMutation: false,
    sessionResumed: false,
  });
  const dismiss = (reason) => {
    root.hidden = true;
    frame.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    root.dataset.lastAction = 'insufficient-credits-dismissed';
    root.dispatchEvent(new CustomEvent('nebula:insufficient-credits-dismissed', { detail: detail(reason), bubbles: true }));
    balancePauseAnchor?.focus();
    announce('Offer dismissed. Balance pause and its server deadline are unchanged.');
  };

  close.addEventListener('click', () => dismiss('close-button'));
  activate.addEventListener('click', () => {
    root.dataset.lastAction = 'autorefill-consent-required';
    root.dispatchEvent(new CustomEvent('nebula:autorefill-consent-required', {
      detail: detail('activate-button'),
      bubbles: true,
    }));
    announce('Auto refill consent flow requested from the host. No enrollment, charge or top up occurred.');
  });
  skip.addEventListener('click', () => {
    root.dataset.lastAction = 'standard-topup-required';
    root.dispatchEvent(new CustomEvent('nebula:standard-topup-required', {
      detail: detail('skip-standard-payment'),
      bubbles: true,
    }));
    announce('Standard top up flow requested from the host. The session remains paused.');
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dismiss('escape');
      return;
    }
    if (event.key !== 'Tab') return;
    const focusables = [close, activate, skip];
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

  root.addEventListener('nebula:insufficient-credits-open', (event) => {
    const payload = event.detail || {};
    const valid = payload.serverState === 'balance_pause'
      && payload.pauseReason === 'insufficient_balance'
      && payload.sessionId
      && payload.sessionVersion !== undefined
      && payload.sessionVersion !== null
      && payload.balanceSnapshot
      && payload.pauseDeadline
      && payload.effectiveExpertPrice
      && payload.capabilities;
    if (root.dataset.staticProjection !== 'true' && !valid) {
      root.dataset.lastAction = 'open-rejected-balance-pause-snapshot-required';
      announce('A server-authoritative insufficient-balance pause snapshot is required.');
      return;
    }
    balancePauseAnchor = payload.balancePauseAnchor instanceof HTMLElement ? payload.balancePauseAnchor : balancePauseAnchor;
    if (payload.sessionId) root.dataset.sessionId = payload.sessionId;
    if (payload.sessionVersion !== undefined && payload.sessionVersion !== null) root.dataset.sessionVersion = String(payload.sessionVersion);
    root.hidden = false;
    frame.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    root.dataset.lastAction = 'insufficient-credits-opened';
    heading.focus();
    announce('Insufficient credits offer opened. The displayed economics are a static fixture until the host supplies an approved offer.');
  });

  if (!root.hidden && !frame.hidden) {
    document.documentElement.classList.add('nebula-modal-open');
    requestAnimationFrame(() => heading.focus());
  }
})();
