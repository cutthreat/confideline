(() => {
  const root = document.querySelector('[data-nebula-reconnect-grace]');
  if (!root) return;

  const frame = root.querySelector('.reconnect-grace__frame');
  const modal = root.querySelector('.reconnect-grace__modal');
  const heading = root.querySelector('#reconnect-grace-title');
  const close = root.querySelector('[data-reconnect-action="dismiss"]');
  const wait = root.querySelector('[data-reconnect-action="wait"]');
  const support = root.querySelector('[data-reconnect-action="support"]');
  const live = root.querySelector('[data-reconnect-live]');
  if (!frame || !modal || !heading || !close || !wait || !support) return;

  let statusAnchor = document.querySelector('[data-reconnect-fixture-anchor]');
  const announce = (message) => { if (live) live.textContent = message; };
  const eventDetail = (reason) => ({
    reason,
    sessionId: root.dataset.sessionId || null,
    lifecycleMutation: false,
  });
  const hide = (action, reason) => {
    root.hidden = true;
    frame.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    root.dataset.lastAction = action;
    statusAnchor?.focus();
  };
  const dismiss = (reason) => {
    hide('reconnect-dismiss-requested', reason);
    root.dispatchEvent(new CustomEvent('nebula:reconnect-dismiss-requested', {
      detail: eventDetail(reason),
      bubbles: true,
    }));
    announce('Reconnect status dismissed. The session and grace period continue on the server.');
  };

  close.addEventListener('click', () => dismiss('close-button'));
  wait.addEventListener('click', () => {
    hide('reconnect-wait-acknowledged', 'wait-button');
    root.dispatchEvent(new CustomEvent('nebula:reconnect-wait-acknowledged', {
      detail: eventDetail('wait-button'),
      bubbles: true,
    }));
    announce('Waiting acknowledged. The server grace period was not changed.');
  });
  support.addEventListener('click', () => {
    root.dataset.lastAction = 'consultation-support-required';
    root.dispatchEvent(new CustomEvent('nebula:consultation-support-required', {
      detail: eventDetail('support-button'),
      bubbles: true,
    }));
    announce('Support handoff requested. The session state was not changed.');
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dismiss('escape');
      return;
    }
    if (event.key !== 'Tab') return;
    const focusables = [close, wait, support].filter((control) => !control.disabled && !control.hidden);
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

  root.addEventListener('nebula:consultation-reconnect-open', (event) => {
    const detail = event.detail || {};
    const requiredSnapshot = detail.serverState === 'reconnect_grace'
      && detail.sessionId
      && detail.expertSnapshot
      && detail.graceDeadlineSnapshot !== undefined
      && detail.graceDeadlineSnapshot !== null
      && detail.financialStateSnapshot?.chargeSuspended === true;
    if (root.dataset.staticProjection !== 'true' && !requiredSnapshot) {
      root.dataset.lastAction = 'open-rejected-server-reconnect-snapshot-required';
      announce('A server-authoritative reconnect snapshot is required.');
      return;
    }
    statusAnchor = detail.statusAnchor instanceof HTMLElement ? detail.statusAnchor : statusAnchor;
    if (detail.sessionId) root.dataset.sessionId = detail.sessionId;
    if (detail.expertSnapshot?.displayName) {
      root.querySelectorAll('[data-reconnect-expert-name]').forEach((node) => { node.textContent = detail.expertSnapshot.displayName; });
      const avatar = root.querySelector('[data-reconnect-expert-avatar]');
      if (avatar) avatar.alt = detail.expertSnapshot.displayName;
    }
    root.hidden = false;
    frame.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    root.dataset.lastAction = 'consultation-reconnect-opened';
    heading.focus();
    announce('Reconnect grace status opened. The deadline and financial state remain server controlled.');
  });

  if (!root.hidden && !frame.hidden) document.documentElement.classList.add('nebula-modal-open');
})();
