(() => {
  const root = document.querySelector('[data-nebula-consultation-review]');
  if (!root) return;

  const frame = root.querySelector('.consultation-review__frame');
  const modal = root.querySelector('.consultation-review__modal');
  const field = root.querySelector('[data-review-draft]');
  const close = root.querySelector('[data-review-action="dismiss"]');
  const send = root.querySelector('[data-review-action="submit-intent"]');
  const complain = root.querySelector('[data-review-action="complain"]');
  const live = root.querySelector('[data-review-live]');
  if (!frame || !modal || !field || !close || !send || !complain) return;

  let opener = document.querySelector('[data-completed-action="write-review"]');
  let ratingDraft = Number(root.dataset.ratingDraft) || null;

  const announce = (message) => { if (live) live.textContent = message; };
  const intentDetail = (reason) => ({
    reason,
    completedSessionId: root.dataset.sessionId || null,
    sessionVersion: root.dataset.sessionVersion || null,
    expertId: root.dataset.expertId || null,
    reviewDraft: field.value,
    ratingDraft,
    reviewSubmitted: false,
    reviewPublished: false,
    lifecycleMutation: false,
  });
  const hide = (reason) => {
    root.hidden = true;
    frame.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    root.dataset.lastAction = 'review-composer-dismissed';
    root.dispatchEvent(new CustomEvent('nebula:consultation-review-dismissed', {
      detail: intentDetail(reason),
      bubbles: true,
    }));
    opener?.focus();
    announce('Review composer dismissed. The unsent draft remains in memory.');
  };

  field.addEventListener('input', () => {
    root.dataset.hasDraft = field.value ? 'true' : 'false';
  });
  close.addEventListener('click', () => hide('close-button'));
  send.addEventListener('click', () => {
    root.dataset.lastAction = 'review-submit-required';
    root.dispatchEvent(new CustomEvent('nebula:consultation-review-submit-required', {
      detail: intentDetail('send-request-button'),
      bubbles: true,
    }));
    announce('Review submission requested from the host. Nothing was submitted or published here.');
  });
  complain.addEventListener('click', () => {
    root.dataset.lastAction = 'consultation-complaint-required';
    root.dispatchEvent(new CustomEvent('nebula:consultation-complaint-required', {
      detail: intentDetail('complain-link'),
      bubbles: true,
    }));
    announce('Complaint handoff requested from the host. No review or consultation state changed.');
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      hide('escape');
      return;
    }
    if (event.key !== 'Tab') return;
    const focusables = [close, field, send, complain];
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

  root.addEventListener('nebula:consultation-review-open', (event) => {
    const payload = event.detail || {};
    const valid = payload.serverState === 'completed'
      && payload.completedSessionId
      && payload.sessionVersion !== undefined
      && payload.sessionVersion !== null
      && payload.expertSnapshot?.id
      && payload.expertSnapshot?.displayName
      && payload.reviewEligible === true
      && payload.authenticatedClient === true;
    if (root.dataset.staticProjection !== 'true' && !valid) {
      root.dataset.lastAction = 'open-rejected-completed-review-snapshot-required';
      announce('A completed-session review snapshot is required.');
      return;
    }
    opener = payload.opener instanceof HTMLElement ? payload.opener : opener;
    if (payload.completedSessionId) root.dataset.sessionId = payload.completedSessionId;
    if (payload.sessionVersion !== undefined && payload.sessionVersion !== null) root.dataset.sessionVersion = String(payload.sessionVersion);
    if (payload.expertSnapshot?.id) root.dataset.expertId = payload.expertSnapshot.id;
    if (payload.expertSnapshot?.displayName) {
      root.querySelector('#consultation-review-title').textContent = `Rate ${payload.expertSnapshot.displayName}'s consultation`;
      root.querySelector('#consultation-review-description').textContent = `Describe your experience with ${payload.expertSnapshot.displayName} in detail to help others make their choice`;
    }
    if (Number.isInteger(payload.ratingDraft) && payload.ratingDraft >= 1 && payload.ratingDraft <= 5) ratingDraft = payload.ratingDraft;
    root.hidden = false;
    frame.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    root.dataset.lastAction = 'review-composer-opened';
    field.focus();
    announce('Review composer opened. Draft text is not submitted automatically.');
  });

  if (!root.hidden && !frame.hidden) {
    document.documentElement.classList.add('nebula-modal-open');
    requestAnimationFrame(() => field.focus());
  }
})();
