(() => {
  const headers = [...document.querySelectorAll('[data-account-shell]')];
  headers.forEach((header) => {
    const trigger = header.querySelector('[data-common-account-menu-trigger]');
    const menu = header.querySelector('#nb-account-menu');
    const scrim = header.querySelector('[data-common-account-menu-scrim]');
    if (!trigger || !menu) return;
    let open = false;
    let lastFocus = trigger;
    const items = () => [...menu.querySelectorAll('[role="menuitem"]')].filter((item) => item.getClientRects().length);
    const setOpen = (next, restore = false) => {
      open = next;
      menu.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      if (scrim) scrim.hidden = !open;
      header.classList.toggle('is-account-menu-open', open);
      if (open) {
        lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : trigger;
        items()[0]?.focus();
      } else if (restore) {
        (lastFocus || trigger).focus();
      }
    };
    trigger.addEventListener('click', () => setOpen(!open));
    scrim?.addEventListener('click', () => setOpen(false, true));
    menu.addEventListener('click', (event) => {
      if (event.target.closest('[role="menuitem"]')) setOpen(false);
    });
    menu.addEventListener('keydown', (event) => {
      const list = items();
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false, true); return; }
      if (event.key === 'Tab') { setOpen(false, true); return; }
      if (event.key === ' ') { event.preventDefault(); document.activeElement?.click(); return; }
      if (!list.length) return;
      let next;
      const index = Math.max(0, list.indexOf(document.activeElement));
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % list.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + list.length) % list.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = list.length - 1;
      else return;
      event.preventDefault();
      list[next]?.focus();
    });
    document.addEventListener('click', (event) => {
      if (open && !header.contains(event.target)) setOpen(false);
    });
    document.addEventListener('focusin', (event) => {
      if (open && !header.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (open && event.key === 'Escape') { event.preventDefault(); setOpen(false, true); }
    });
  });
})();
