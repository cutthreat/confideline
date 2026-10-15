(() => {
  const root = document.querySelector('[data-nebula-consultation-completed]');
  if (!root) return;

  const frame = root.querySelector('.consultation-completed__frame');
  const modal = root.querySelector('.consultation-completed__modal');
  const heading = root.querySelector('#consultation-completed-title');
  const close = root.querySelector('[data-completed-action="dismiss"]');
  const askNext = root.querySelector('[data-completed-action="ask-next"]');
  const writeReview = root.querySelector('[data-completed-action="write-review"]');
  const returnToChat = root.querySelector('[data-completed-action="return"]');
  const ratingGroup = root.querySelector('[data-completed-rating]');
  const stars = Array.from(root.querySelectorAll('[data-rating]'));
  const live = root.querySelector('[data-completed-live]');
  if (!frame || !modal || !heading || !close || !askNext || !writeReview || !returnToChat || !ratingGroup || stars.length !== 5) return;

  const filledStar = ratingGroup.dataset.filledStar;
  const outlineStar = ratingGroup.dataset.outlineStar;
  if (!filledStar || !outlineStar) return;
  let chatAnchor = document.querySelector('[data-completed-fixture-anchor]');
  let ratingDraft = root.dataset.staticProjection === 'true' ? 3 : 0;

  const announce = (message) => { if (live) live.textContent = message; };
  const detail = (reason) => ({
    reason,
    sessionId: root.dataset.sessionId || null,
    expertId: root.dataset.expertId || null,
    ratingDraft: ratingDraft || null,
    lifecycleMutation: false,
    reviewSubmitted: false,
  });
  const setRating = (value, focus = false) => {
    ratingDraft = Math.max(0, Math.min(5, Number(value) || 0));
    root.dataset.ratingDraft = String(ratingDraft);
    stars.forEach((star, index) => {
      const rating = index + 1;
      const checked = rating === ratingDraft;
      star.setAttribute('aria-checked', checked ? 'true' : 'false');
      star.tabIndex = checked || (ratingDraft === 0 && rating === 1) ? 0 : -1;
      const image = star.querySelector('img');
      if (image) image.src = rating <= ratingDraft ? filledStar : outlineStar;
    });
    if (focus) stars[Math.max(0, ratingDraft - 1)]?.focus();
    if (ratingDraft) announce(`${ratingDraft} out of 5 selected as a local review draft.`);
    root.dispatchEvent(new CustomEvent('nebula:consultation-rating-draft-changed', {
      detail: detail('rating-control'),
      bubbles: true,
    }));
  };
  const hide = (action) => {
    root.hidden = true;
    frame.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    root.dataset.lastAction = action;
    chatAnchor?.focus();
  };
  const dismiss = (reason) => {
    hide('consultation-completed-dismissed');
    root.dispatchEvent(new CustomEvent('nebula:consultation-completed-dismissed', {
      detail: detail(reason),
      bubbles: true,
    }));
    announce('Completed consultation overlay dismissed. The server state was not changed.');
  };

  stars.forEach((star) => {
    star.addEventListener('click', () => setRating(Number(star.dataset.rating), true));
    star.addEventListener('keydown', (event) => {
      const current = Number(star.dataset.rating);
      let next = current;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = Math.min(5, current + 1);
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = Math.max(1, current - 1);
      else if (event.key === 'Home') next = 1;
      else if (event.key === 'End') next = 5;
      else return;
      event.preventDefault();
      setRating(next, true);
    });
  });
  close.addEventListener('click', () => dismiss('close-button'));
  returnToChat.addEventListener('click', () => dismiss('return-to-chat'));
  askNext.addEventListener('click', () => {
    hide('consultation-ask-next-required');
    root.dispatchEvent(new CustomEvent('nebula:consultation-ask-next-required', {
      detail: detail('ask-next-button'),
      bubbles: true,
    }));
    announce('Return to the permanent dialogue requested. No consultation was created.');
  });
  writeReview.addEventListener('click', () => {
    root.dataset.lastAction = 'consultation-review-open-required';
    root.dispatchEvent(new CustomEvent('nebula:consultation-review-open-required', {
      detail: detail('write-review-button'),
      bubbles: true,
    }));
    announce('Review composer requested. The local rating draft has not been submitted.');
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dismiss('escape');
      return;
    }
    if (event.key !== 'Tab') return;
    const activeStar = stars.find((star) => star.tabIndex === 0) || stars[0];
    const focusables = [close, activeStar, askNext, writeReview, returnToChat].filter((control) => !control.disabled && !control.hidden);
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

  root.addEventListener('nebula:consultation-completed-open', (event) => {
    const payload = event.detail || {};
    const requiredSnapshot = payload.serverState === 'completed'
      && payload.sessionId
      && payload.sessionVersion !== undefined
      && payload.sessionVersion !== null
      && payload.expertSnapshot?.id
      && payload.expertSnapshot?.displayName
      && payload.expertSnapshot?.imageUrl
      && payload.completionSnapshot
      && payload.reviewEligible === true;
    if (root.dataset.staticProjection !== 'true' && !requiredSnapshot) {
      root.dataset.lastAction = 'open-rejected-server-completed-snapshot-required';
      announce('A server-authoritative completed consultation snapshot is required.');
      return;
    }
    chatAnchor = payload.chatAnchor instanceof HTMLElement ? payload.chatAnchor : chatAnchor;
    if (payload.sessionId) root.dataset.sessionId = payload.sessionId;
    if (payload.expertSnapshot?.id) root.dataset.expertId = payload.expertSnapshot.id;
    if (payload.expertSnapshot?.displayName) {
      root.querySelectorAll('[data-completed-expert-name]').forEach((node) => { node.textContent = payload.expertSnapshot.displayName; });
      ratingGroup.setAttribute('aria-label', `Rate ${payload.expertSnapshot.displayName}’s consultation`);
    }
    if (payload.expertSnapshot?.imageUrl) {
      const avatar = root.querySelector('[data-completed-expert-avatar]');
      if (avatar) {
        avatar.src = payload.expertSnapshot.imageUrl;
        avatar.alt = payload.expertSnapshot.displayName;
      }
    }
    setRating(Number.isInteger(payload.ratingDraft) ? payload.ratingDraft : (root.dataset.staticProjection === 'true' ? 3 : 0));
    root.hidden = false;
    frame.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    root.dataset.lastAction = 'consultation-completed-opened';
    heading.focus();
    announce('Completed consultation status opened. Rating remains a local draft until the review flow submits it.');
  });

  setRating(ratingDraft);
  if (!root.hidden && !frame.hidden) document.documentElement.classList.add('nebula-modal-open');
})();
