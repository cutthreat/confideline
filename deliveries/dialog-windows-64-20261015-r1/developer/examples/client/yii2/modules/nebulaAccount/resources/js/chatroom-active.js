(() => {
  const root = document.querySelector('[data-nebula-chatroom-active]');
  if (!root) return;
  const intent = (name, detail) => root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  const composer = root.querySelector('[data-active-composer]');
  const send = root.querySelector('[data-active-action="send-intent"]');
  const sendStateImage = send?.querySelector('[data-active-send-state-image]');
  const live = root.querySelector('[data-active-live-status]');
  const favorite = root.querySelector('[data-active-action="favorite"]');
  const rail = root.querySelector('[data-active-list-open]');
  const drawer = root.querySelector('#active-list-drawer');
  const scrim = root.querySelector('[data-active-list-scrim]');
  const drawerClose = root.querySelector('[data-active-list-close]');
  const consultationControl = root.querySelector('[data-active-action="consultation-toggle"]');
  const activeHeader = root.querySelector('.active-thread-head');
  const activeActions = root.querySelector('.active-actions');
  const activeDots = activeActions?.querySelector('.active-dots');
  let activeMore = null;
  let activeMoreMenu = null;
  let activeMoreMuted = false;
  let activeMoreOrigin = null;
  const activeMenuItems = [
    '<button type="button" role="menuitem" data-active-chat-menu="profile"><svg class="active-chat-menu__icon" viewBox="0 0 20 20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="6" r="3.25"/><path d="M3.5 19c.55-3.35 2.75-5 6.5-5s5.95 1.65 6.5 5"/></g></svg><span>View profile</span></button>',
    '<button type="button" role="menuitem" data-active-chat-menu="clear"><svg class="active-chat-menu__icon" viewBox="0 0 20 20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15.5 14.5 5"/><path d="m11.5 4 4.5 4.5"/><path d="M3 18h9"/><path d="m5 15 5-5"/></g></svg><span>Clear history</span></button>',
    '<button type="button" role="menuitem" data-active-chat-menu="delete"><svg class="active-chat-menu__icon" viewBox="0 0 20 20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6.5h12"/><path d="M7 6.5V4h6v2.5"/><path d="M5.5 8v9h9V8"/><path d="M8.5 10.5v4M11.5 10.5v4"/></g></svg><span>Delete chat</span></button>',
    '<button type="button" role="menuitemcheckbox" aria-checked="false" data-active-chat-menu="mute"><svg class="active-chat-menu__icon" viewBox="0 0 20 20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h3l4-3v10l-4-3H3z"/><path d="m13 8 4 4M17 8l-4 4"/></g></svg><span data-active-menu-label>Mute</span></button>',
    '<button type="button" role="menuitem" data-active-chat-menu="review"><svg class="active-chat-menu__icon" viewBox="0 0 20 20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5h14v10H8l-4 3v-3H3z"/><path d="M6 8h8M6 11h5"/></g></svg><span>Write a review</span></button>',
    '<button type="button" role="menuitem" data-active-chat-menu="block"><svg class="active-chat-menu__icon" viewBox="0 0 20 20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><path d="m6 6 8 8"/></g></svg><span>Block</span></button>',
  ];
  if (activeHeader && activeActions && activeDots) {
    activeMore = document.createElement('button');
    activeMore.type = 'button';
    activeMore.className = 'active-more';
    activeMore.setAttribute('aria-label', 'Chat actions');
    activeMore.setAttribute('aria-haspopup', 'menu');
    activeMore.setAttribute('aria-expanded', 'false');
    activeMore.setAttribute('aria-controls', 'active-chat-more-menu');
    activeDots.replaceWith(activeMore);
    activeMore.appendChild(activeDots);
    activeMoreMenu = document.createElement('div');
    activeMoreMenu.id = 'active-chat-more-menu';
    activeMoreMenu.className = 'active-chat-more-menu';
    activeMoreMenu.hidden = true;
    activeMoreMenu.setAttribute('role', 'menu');
    activeMoreMenu.setAttribute('aria-label', 'Chat actions');
    activeMoreMenu.innerHTML = activeMenuItems.join('');
    activeHeader.appendChild(activeMoreMenu);
  }
  const closeActiveMore = (restoreFocus = true) => {
    if (!activeMore || !activeMoreMenu) return;
    activeMoreMenu.hidden = true;
    activeMore.setAttribute('aria-expanded', 'false');
    if (restoreFocus) (activeMoreOrigin || activeMore).focus();
    activeMoreOrigin = null;
  };
  const openActiveMore = () => {
    if (!activeMore || !activeMoreMenu) return;
    activeMoreOrigin = document.activeElement === activeMore ? activeMore : activeMore;
    activeMoreMenu.hidden = false;
    activeMore.setAttribute('aria-expanded', 'true');
    activeMoreMenu.querySelector('button')?.focus();
  };
  activeMore?.addEventListener('click', () => {
    if (activeMoreMenu?.hidden) openActiveMore(); else closeActiveMore(false);
  });
  activeMoreMenu?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-active-chat-menu]');
    if (!button) return;
    const action = button.dataset.activeChatMenu;
    if (action === 'mute') {
      activeMoreMuted = !activeMoreMuted;
      button.setAttribute('aria-checked', activeMoreMuted ? 'true' : 'false');
      const label = button.querySelector('[data-active-menu-label]');
      if (label) label.textContent = activeMoreMuted ? 'Muted' : 'Mute';
      announce(activeMoreMuted ? 'Muted locally. Host confirmation required.' : 'Unmuted locally. Host confirmation required.');
    } else {
      const eventMap = {
        profile: ['nebula:chat-profile-intent-required', { profileOpened: false }],
        clear: ['nebula:chat-clear-history-intent-required', { historyCleared: false }],
        delete: ['nebula:chat-delete-intent-required', { chatDeleted: false }],
        review: ['nebula:chat-review-intent-required', { reviewSubmitted: false }],
        block: ['nebula:chat-block-intent-required', { blocked: false }],
      };
      const mapped = eventMap[action];
      if (mapped) intent(mapped[0], { conversationId: 'miss-shaya', ...mapped[1], backendRequired: true, persisted: false, staticProjection: true, liveMount: false });
      announce('Host confirmation required. No local chat state was changed.');
    }
    closeActiveMore();
  });
  activeMoreMenu?.addEventListener('keydown', (event) => {
    const items = [...activeMoreMenu.querySelectorAll('[data-active-chat-menu]')];
    const index = items.indexOf(document.activeElement);
    if (event.key === 'Escape') { event.preventDefault(); closeActiveMore(); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); const step = event.key === 'ArrowDown' ? 1 : -1; items[(index + step + items.length) % items.length]?.focus();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); (event.key === 'Home' ? items[0] : items[items.length - 1])?.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!activeMoreMenu || activeMoreMenu.hidden) return;
    if (!activeMoreMenu.contains(event.target) && event.target !== activeMore) closeActiveMore();
  }, true);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activeMoreMenu && !activeMoreMenu.hidden) { event.preventDefault(); closeActiveMore(); }
  });
  let drawerOrigin = null;
  const announce = (message) => { if (live) live.textContent = message; };
  const renderFavorite = (selected) => {
    if (!favorite) return;
    favorite.setAttribute('aria-pressed', selected ? 'true' : 'false');
    favorite.setAttribute('aria-label', selected ? 'Remove Miss Shaya from favorites' : 'Add Miss Shaya to favorites');
    const inactiveIcon = favorite.querySelector('[data-favorite-state="inactive"]');
    const activeIcon = favorite.querySelector('[data-favorite-state="active"]');
    if (inactiveIcon) inactiveIcon.hidden = selected;
    if (activeIcon) activeIcon.hidden = !selected;
    root.dataset.favoriteState = selected ? 'selected-local' : 'inactive';
  };
  const renderConsultation = (state) => {
    if (!consultationControl) return;
    const running = state === 'running';
    consultationControl.dataset.consultationState = state;
    consultationControl.setAttribute('aria-pressed', running ? 'true' : 'false');
    const label = consultationControl.querySelector('[data-consultation-label]');
    if (label) label.textContent = running ? 'Pause consultation' : 'Resume consultation';
    consultationControl.setAttribute('aria-label', running ? 'Pause consultation' : 'Resume consultation');
    root.dataset.consultationState = state;
  };
  const syncComposer = () => {
    if (!composer || !send) return;
    const ready = composer.value.trim().length > 0;
    const multiline = composer.value.includes('\n') || composer.scrollHeight > composer.clientHeight + 2;
    send.disabled = !ready;
    send.setAttribute('aria-disabled', ready ? 'false' : 'true');
    const state = ready ? (multiline ? 'multiline' : 'text_ready') : 'empty_unactive';
    root.dataset.composerState = state;
    const activeState = state === 'multiline' ? 'multiline' : (state === 'text_ready' ? 'ready' : 'empty');
    const stateSrc = sendStateImage?.dataset[`src${activeState[0].toUpperCase()}${activeState.slice(1)}`];
    if (sendStateImage && stateSrc) {
      sendStateImage.src = stateSrc;
      sendStateImage.dataset.state = activeState;
    }
  };
  const sendIntent = () => {
    if (!composer || !send || send.disabled) return;
    intent('nebula:chat-send-intent-required', {
      text: composer.value,
      messageLength: composer.value.trim().length,
      backendRequired: true,
      persisted: false,
      deliveryClaimed: false,
      staticProjection: true,
    });
    root.dataset.lastAction = 'send-intent-backend-required';
    announce('Message is ready to send. Delivery requires the chat backend.');
    composer.focus();
  };
  composer?.addEventListener('input', syncComposer);
  composer?.addEventListener('keydown', (event) => {
    if (event.isComposing || event.keyCode === 229) return;
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    sendIntent();
  });
  send?.addEventListener('click', sendIntent);
  syncComposer();
  consultationControl?.addEventListener('click', () => {
    const next = consultationControl.dataset.consultationState === 'running' ? 'paused' : 'running';
    const eventName = next === 'running' ? 'nebula:consultation-start-intent-required' : 'nebula:consultation-pause-intent-required';
    renderConsultation(next);
    intent(eventName, { backendRequired: true, sessionMutated: false, timerStarted: false, timerMutated: false, billingMutated: false, persisted: false, staticProjection: true, liveMount: false });
    announce(next === 'running' ? 'Consultation start requested. Host confirmation is required.' : 'Consultation pause requested. Host confirmation is required.');
  });
  renderConsultation(consultationControl?.dataset.consultationState || 'running');
  renderFavorite(favorite?.getAttribute('aria-pressed') === 'true');
  favorite?.addEventListener('click', () => {
    const selected = favorite.getAttribute('aria-pressed') !== 'true';
    renderFavorite(selected);
    intent('nebula:active-favorite-intent-required', {
      backendRequired: true,
      favoriteSelected: selected,
      persisted: false,
      staticProjection: true,
      liveMount: false,
    });
    announce(selected ? 'Favorite request sent. Saving requires the account host.' : 'Favorite removal request sent. Saving requires the account host.');
  });
  root.querySelector('[data-active-action="end-chat-intent"]')?.addEventListener('click', () => {
    intent('nebula:end-chat-intent-required', { backendRequired: true, sessionMutated: false, staticProjection: true });
  });
  root.querySelector('.active-back')?.addEventListener('click', () => {
    intent('nebula:chat-active-back-required', { backendRequired: true, staticProjection: true });
  });

  const setDrawer = (open) => {
    if (!rail || !drawer) return;
    drawer.hidden = false;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    drawer.inert = !open;
    rail.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (scrim) scrim.hidden = !open;
    if (open) {
      drawerOrigin = document.activeElement === rail ? rail : (drawerOrigin || rail);
      drawerClose?.focus();
    } else {
      drawerOrigin?.focus();
      drawerOrigin = null;
    }
  };
  if (drawer && window.matchMedia('(max-width: 991px)').matches) {
    drawer.setAttribute('aria-hidden', 'true');
    drawer.inert = true;
  }
  rail?.addEventListener('click', () => setDrawer(true));
  drawerClose?.addEventListener('click', () => setDrawer(false));
  scrim?.addEventListener('click', () => setDrawer(false));
  drawer?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); setDrawer(false); return; }
    if (event.key !== 'Tab') return;
    const focusables = [...drawer.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])')].filter((node) => !node.hasAttribute('disabled'));
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
})();
