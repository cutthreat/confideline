(() => {
  const root = document.querySelector('[data-nebula-chatroom][data-c76-state="notification_destination"]');
  const notify = root?.querySelector('[data-notify-action="toggle-menu"]');
  const menu = root?.querySelector('#c76-notify-menu');
  const items = menu ? [...menu.querySelectorAll('[role="menuitem"]')] : [];
  if (!root || !notify || !menu || !items.length) return;

  const emitHostIntent = (action) => {
    const isSettings = action === 'settings';
    root.dataset.lastAction = isSettings ? 'notification-destination-open-required' : 'notification-reminder-open-required';
    root.dispatchEvent(new CustomEvent(isSettings ? 'nebula:notification-destination-open-required' : 'nebula:notification-reminder-open-required', {
      bubbles: true,
      detail: {
        routeOwner: '/nebula-account/chatroom/notify',
        state: 'notification_destination',
        targetState: isSettings ? 'notification_channel_selection' : 'notification_reminder_setup',
        action,
        backendRequired: true,
        transitionEvidence: 'figma_1489_45092_notify_interaction_state',
        preferenceSaved: false,
        notificationSent: false,
        deliveryClaimed: false,
        reminderScheduled: false,
        sessionMutation: false,
        balanceMutation: false,
        messageMutation: false,
      },
    }));
  };

  const setOpen = (open, returnFocus = true) => {
    notify.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    if (open) {
      items[0].focus();
      return;
    }
    if (returnFocus) notify.focus();
  };

  const toggle = () => setOpen(menu.hidden);

  notify.addEventListener('click', toggle);
  notify.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (menu.hidden) toggle();
    }
  });

  menu.addEventListener('click', (event) => {
    const item = event.target.closest('[role="menuitem"]');
    if (!item) return;
    emitHostIntent(item.dataset.notifyMenuAction || 'settings');
    setOpen(false);
  });

  menu.addEventListener('keydown', (event) => {
    const index = items.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      items[event.key === 'Home' ? 0 : items.length - 1].focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Tab') {
      setOpen(false, false);
    }
  });

  document.addEventListener('click', (event) => {
    if (!menu.hidden && !event.target.closest('.c76-notify-wrap')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      event.preventDefault();
      setOpen(false);
    }
  });
})();
