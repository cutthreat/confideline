(() => {
  const root = document.querySelector('[data-nebula-favorites]');
  if (!root) return;
  const status = root.querySelector('[data-favorite-status]');
  const announce = (message) => { if (status) status.textContent = message; };
  const menuTrigger = root.querySelector('#profile-menu-trigger:not([data-common-account-menu-trigger])');
  const accountMenu = root.querySelector('#profile-account-drawer');
  const accountScrim = root.querySelector('[data-account-drawer-scrim]');
  const filterTrigger = root.querySelector('[data-filter-toggle]');
  const legacyFilterMenu = root.querySelector('#fv-filter-menu');
  const drawer = root.querySelector('#fv-filter-drawer');
  const scrim = root.querySelector('[data-filter-scrim]');
  let previousBodyOverflow = '';
  let accountMenuOpen = false;
  let lastAccountFocus = menuTrigger;
  const accountFocusables = () => accountMenu ? [...accountMenu.querySelectorAll('a,button:not([disabled])')].filter((el) => el.getClientRects().length > 0) : [];
  const setAccountMenu = (open, restore = false) => {
    if (!accountMenu || !menuTrigger) return;
    accountMenuOpen = open;
    accountMenu.hidden = !open;
    accountMenu.setAttribute('aria-modal', open ? 'true' : 'false');
    menuTrigger.setAttribute('aria-expanded', String(open));
    if (accountScrim) accountScrim.hidden = !open;
    root.querySelector('.fv-board')?.toggleAttribute('inert', open);
    if (open) {
      lastAccountFocus = menuTrigger;
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      accountFocusables()[0]?.focus();
    } else {
      document.body.style.overflow = previousBodyOverflow;
      if (restore) lastAccountFocus?.focus();
    }
  };
  const closeMenus = (restore = false) => { if (accountMenuOpen) setAccountMenu(false, restore); else { accountMenu?.setAttribute('hidden', ''); menuTrigger?.setAttribute('aria-expanded', 'false'); if (accountScrim) accountScrim.hidden = true; } legacyFilterMenu?.setAttribute('hidden', ''); filterTrigger?.setAttribute('aria-expanded', 'false'); if (restore) filterTrigger?.focus(); };
  const setDrawer = (open, restore = false) => {
    if (!drawer || !scrim) return;
    if (open) closeMenus();
    drawer.hidden = !open; scrim.hidden = !open; filterTrigger?.setAttribute('aria-expanded', String(open));
    root.querySelector('.fv-topbar')?.toggleAttribute('inert', open); root.querySelector('.fv-board')?.toggleAttribute('inert', open);
    if (open) { previousBodyOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; drawer.querySelector('[data-filter-close]')?.focus(); }
    else { document.body.style.overflow = previousBodyOverflow; if (restore) filterTrigger?.focus(); }
  };
  menuTrigger?.addEventListener('click', () => setAccountMenu(!accountMenuOpen));
  accountScrim?.addEventListener('click', () => setAccountMenu(false, true));
  filterTrigger?.addEventListener('click', () => setDrawer(drawer?.hidden !== false));
  root.querySelector('[data-filter-close]')?.addEventListener('click', () => setDrawer(false, true));
  scrim?.addEventListener('click', () => setDrawer(false, true));
  document.addEventListener('keydown', (event) => {
    if (accountMenu && !accountMenu.hidden && event.key === 'Tab') {
      const focusable = accountFocusables();
      if (focusable.length) { const first = focusable[0]; const last = focusable[focusable.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
      return;
    }
    if (drawer && !drawer.hidden && event.key === 'Tab') {
      const focusable = [...drawer.querySelectorAll('button:not([disabled]),select,input:not([disabled])')].filter((item) => !item.closest('[hidden]'));
      if (focusable.length) { const first = focusable[0]; const last = focusable[focusable.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
      return;
    }
    if (event.key !== 'Escape') return;
    if (drawer && !drawer.hidden) { event.preventDefault(); setDrawer(false, true); } else if (accountMenu && !accountMenu.hidden) { event.preventDefault(); setAccountMenu(false, true); }
  });
  const statusInputs = [...root.querySelectorAll('[data-filter-status]')];
  statusInputs.forEach((input) => input.addEventListener('change', () => { if (input.value === 'all' && input.checked) statusInputs.filter((other) => other !== input).forEach((other) => { other.checked = false; }); if (input.value !== 'all' && input.checked) statusInputs.find((other) => other.value === 'all').checked = false; if (!statusInputs.some((other) => other.checked)) statusInputs.find((other) => other.value === 'all').checked = true; }));
  const resetFilters = () => { root.querySelector('[data-filter-sort]').value = 'recommended'; statusInputs.forEach((input) => { input.checked = input.value === 'all'; }); root.querySelectorAll('[data-filter-specialty]').forEach((input) => { input.checked = false; }); root.querySelector('[data-filter-experience][value="any"]').checked = true; root.querySelector('[data-filter-rating][value="4"]').checked = true; };
  const applyFilters = () => {
    const selectedStatus = statusInputs.filter((input) => input.checked && input.value !== 'all').map((input) => input.value);
    const specialties = [...root.querySelectorAll('[data-filter-specialty]:checked')].map((input) => input.value);
    const minExperience = Number(root.querySelector('[data-filter-experience]:checked')?.value || 0);
    const minRating = Number(root.querySelector('[data-filter-rating]:checked')?.value || 0);
    const sort = root.querySelector('[data-filter-sort]')?.value || 'recommended';
    const grid = root.querySelector('[data-favorite-grid]'); const cards = [...root.querySelectorAll('[data-psychic-card]')];
    cards.forEach((card) => { const cardTags = (card.dataset.specialties || '').split(' '); const statusMatch = !selectedStatus.length || selectedStatus.includes(card.dataset.status); const specialtyMatch = !specialties.length || specialties.every((tag) => (card.dataset.specialties || '').includes(tag)); card.hidden = !(statusMatch && specialtyMatch && Number(card.dataset.experience || 0) >= minExperience && Number(card.dataset.rating || 0) >= minRating); });
    cards.sort((a, b) => sort === 'rating-desc' ? Number(b.dataset.rating) - Number(a.dataset.rating) : sort === 'experience-desc' ? Number(b.dataset.experience) - Number(a.dataset.experience) : 0).forEach((card) => grid?.appendChild(card));
    const visible = cards.filter((card) => !card.hidden).length; announce(`${visible} favorite ${visible === 1 ? 'expert' : 'experts'} shown locally. Saving filters requires the host.`); setDrawer(false, true);
  };
  root.querySelector('[data-filter-reset]')?.addEventListener('click', resetFilters);
  root.querySelector('[data-filter-apply]')?.addEventListener('click', applyFilters);
  root.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => { if (button.dataset.filter === 'online') { statusInputs.find((input) => input.value === 'all').checked = false; statusInputs.find((input) => input.value === 'online').checked = true; applyFilters(); } }));
  root.querySelectorAll('[data-favorite-toggle]').forEach((button) => button.addEventListener('click', () => {
    const card = button.closest('[data-psychic-card]');
    const name = card?.querySelector('h2')?.textContent.trim() || 'Expert';
    const pressed = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', pressed ? 'false' : 'true');
    const icon = button.querySelector('img[data-favorite-on]');
    if (icon) icon.src = pressed ? icon.dataset.favoriteOff : icon.dataset.favoriteOn;
    button.setAttribute('aria-label', `${pressed ? 'Add' : 'Remove'} ${name} ${pressed ? 'to' : 'from'} favorites`);
    announce(`${name} ${pressed ? 'removed from' : 'kept in'} favorites locally. Saving requires the host.`);
    root.dispatchEvent(new CustomEvent('nebula:favorite-host-intent', { bubbles: true, detail: { action: pressed ? 'remove' : 'add', psychicName: name, backendRequired: true, persisted: false, listMutation: false, staticProjection: true } }));
  }));
  root.querySelectorAll('[data-psychic-start]').forEach((link) => link.addEventListener('click', () => {
    const card = link.closest('[data-psychic-card]');
    root.dispatchEvent(new CustomEvent('nebula:psychic-start-intent-required', {
      bubbles: true,
      detail: {
        psychic: link.dataset.psychicName || card?.querySelector('h2')?.textContent.trim() || 'Expert',
        offer: {
          freeMinutes: Number(link.dataset.freeMinutes || 0),
          postTrialRateCreditsPerMinute: Number(link.dataset.rateCreditsPerMinute || 0),
          source: 'static-projection',
          eligibility: 'host-required'
        },
        backendRequired: true,
        sessionCreated: false,
        paymentStarted: false,
        persisted: false,
        staticProjection: true
      }
    }));
  }));
  root.querySelectorAll('[data-card-intent]').forEach((button) => button.addEventListener('click', () => { const name = button.closest('[data-psychic-card]')?.querySelector('h2')?.textContent.trim() || 'Expert'; announce(`${button.dataset.cardIntent === 'book' ? 'Booking' : 'Chat'} for ${name} requires the host; no session or payment was started.`); root.dispatchEvent(new CustomEvent('nebula:favorite-card-host-intent', { bubbles: true, detail: { action: button.dataset.cardIntent, psychicName: name, backendRequired: true, sessionCreated: false, paymentStarted: false, persisted: false, staticProjection: true } })); }));
})();
