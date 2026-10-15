(() => {
  const root = document.querySelector('[data-nebula-chatroom]');
  const frame = root?.querySelector('.c76-frame');
  const opener = root?.querySelector('[data-action="open-expert-details"]');
  const modal = root?.querySelector('[data-expert-details-modal]');
  const scrim = modal?.querySelector('[data-action="close-expert-details"]');
  if (!root || !frame || !opener || !modal || !scrim) return;

  // Keep the dialog variant in the same responsive cohort as chat-details.css.
  // The former 321px cutoff selected the desktop card on ordinary phones.
  const desktop = window.matchMedia('(min-width: 576px)');
  const activeDialog = () => modal.querySelector(desktop.matches ? '.expert-card--standard' : '.expert-card--mobile');
  const activeHeading = () => activeDialog()?.querySelector('h2');
  const focusables = () => Array.from(activeDialog()?.querySelectorAll('button:not([disabled]),a[href]') || [])
    .filter((item) => item.offsetParent !== null);

  const announce = (message) => {
    const live = root.querySelector('[data-c76-live-status]');
    if (live) live.textContent = message;
  };

  const close = () => {
    if (modal.hidden) return;
    modal.hidden = true;
    opener.setAttribute('aria-expanded', 'false');
    frame.removeAttribute('aria-hidden');
    frame.inert = false;
    document.documentElement.classList.remove('c76-modal-open');
    root.dataset.overlayState = 'closed';
    opener.focus();
    announce('Expert details closed.');
  };

  const open = () => {
    if (!modal.hidden) return;
    modal.hidden = false;
    opener.setAttribute('aria-expanded', 'true');
    frame.setAttribute('aria-hidden', 'true');
    frame.inert = true;
    document.documentElement.classList.add('c76-modal-open');
    root.dataset.overlayState = 'expert_details_open';
    activeHeading()?.focus();
    const profileLink = activeDialog()?.querySelector('[data-expert-profile-link]');
    if (profileLink) profileLink.setAttribute('aria-label', `Open ${root.querySelector('[data-chat-name]')?.textContent || 'expert'} in Psychics`);
    announce('Expert details opened.');
  };

  opener.addEventListener('click', open);
  opener.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    open();
  });

  modal.querySelectorAll('[data-expert-details-close]').forEach((button) => button.addEventListener('click', close));

  scrim.addEventListener('click', (event) => {
    if (event.target === scrim) close();
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = focusables();
    if (!items.length) {
      event.preventDefault();
      activeHeading()?.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === activeHeading())) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  modal.querySelectorAll('[data-expert-action]').forEach((control) => {
    control.addEventListener('click', () => {
      root.dataset.lastAction = `${control.dataset.expertAction}-backend-required`;
      announce('This expert action requires the product backend.');
    });
  });

  const unavailable = root.querySelector('[data-expert-unavailable-modal]');
  const unavailableScrim = unavailable?.querySelector('[data-action="close-expert-unavailable"]');
  const unavailableHeading = unavailable?.querySelector('h2');
  let unavailableReturnFocus = null;
  if (!unavailable || !unavailableScrim || !unavailableHeading) return;

  const unavailableFocusables = () => Array.from(unavailable.querySelectorAll('button:not([disabled])'))
    .filter((item) => item.offsetParent !== null);

  const closeUnavailable = () => {
    if (unavailable.hidden) return;
    unavailable.hidden = true;
    frame.removeAttribute('aria-hidden');
    frame.inert = false;
    document.documentElement.classList.remove('c76-modal-open');
    root.dataset.overlayState = 'closed';
    if (unavailableReturnFocus instanceof HTMLElement && unavailableReturnFocus.isConnected) {
      unavailableReturnFocus.focus();
    }
    announce('Expert unavailable dialog closed.');
  };

  const openUnavailable = (detail = {}) => {
    if (detail.intentSaved !== true) {
      announce('The expert availability could not be confirmed. Please try again.');
      return;
    }
    close();
    unavailableReturnFocus = detail.opener instanceof HTMLElement ? detail.opener : document.activeElement;
    unavailable.hidden = false;
    frame.setAttribute('aria-hidden', 'true');
    frame.inert = true;
    document.documentElement.classList.add('c76-modal-open');
    root.dataset.overlayState = 'expert_unavailable';
    unavailableHeading.focus();
    announce('The selected expert is busy.');
  };

  root.addEventListener('nebula:expert-unavailable', (event) => openUnavailable(event.detail || {}));
  unavailableScrim.addEventListener('click', (event) => {
    if (event.target === unavailableScrim) closeUnavailable();
  });
  unavailable.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeUnavailable();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = unavailableFocusables();
    if (!items.length) {
      event.preventDefault();
      unavailableHeading.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === unavailableHeading)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  unavailable.querySelector('[data-unavailable-action="close"]')?.addEventListener('click', closeUnavailable);
  unavailable.querySelector('[data-unavailable-action="wait"]')?.addEventListener('click', closeUnavailable);
  unavailable.querySelector('[data-unavailable-action="select-another"]')?.addEventListener('click', () => {
    root.dataset.lastAction = 'select-another-expert-server-required';
    root.dispatchEvent(new CustomEvent('nebula:select-alternative-expert', { bubbles: true }));
    announce('Finding an eligible available expert requires the matching service.');
  });
  unavailable.querySelector('[data-unavailable-action="question-in-advance"]')?.addEventListener('click', () => {
    root.dataset.lastAction = 'question-in-advance-state-required';
    root.dispatchEvent(new CustomEvent('nebula:open-question-before-start', { bubbles: true }));
    announce('The advance question form is not connected yet.');
  });
})();
