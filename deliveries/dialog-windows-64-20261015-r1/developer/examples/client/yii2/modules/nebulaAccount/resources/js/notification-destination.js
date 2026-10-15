(() => {
  const root = document.querySelector('[data-nebula-notify-destination]');
  if (!root) return;
  const frame = root.querySelector('.notify-destination__frame');
  const modal = root.querySelector('.notify-destination__modal');
  const heading = root.querySelector('#notify-destination-title');
  const close = root.querySelector('[data-notify-action="dismiss"]');
  const next = root.querySelector('[data-notify-action="next"]');
  const options = Array.from(root.querySelectorAll('[data-channel]'));
  const live = root.querySelector('[data-notify-live]');
  if (!frame || !modal || !heading || !close || !next || options.length !== 3) return;

  let opener = document.querySelector('[data-notify-destination-anchor]');
  let pending = false;
  const announce = (message) => { if (live) live.textContent = message; };
  const setChecked = (option, active) => {
    option.classList.toggle('is-selected', active);
    option.setAttribute('aria-checked', String(active));
    option.querySelector('img').src = option.querySelector('img').src.replace(active ? 'unselected.svg' : 'selected.svg', active ? 'selected.svg' : 'unselected.svg');
  };
  const selectedChannels = () => options.filter((option) => option.getAttribute('aria-checked') === 'true').map((option) => option.dataset.channel);
  const detail = (reason) => ({ reason, notificationIntentId: root.dataset.flowId || null, version: root.dataset.flowVersion || null, selectedChannelIds: selectedChannels(), preferenceSaved: false, subscriptionCreated: false, notificationSent: false, deliveryClaimed: false });
  const dismiss = (reason) => {
    root.hidden = true; frame.hidden = true; document.documentElement.classList.remove('nebula-modal-open');
    root.dataset.lastAction = 'notification-destination-dismissed';
    root.dispatchEvent(new CustomEvent('nebula:notification-destination-dismissed', { detail: detail(reason), bubbles: true }));
    opener?.focus();
  };

  options.forEach((option, index) => {
    option.addEventListener('click', () => { if (!pending) setChecked(option, option.getAttribute('aria-checked') !== 'true'); });
    option.addEventListener('keydown', (event) => {
      if (pending || event.key !== ' ') return;
      event.preventDefault();
      option.click();
    });
  });
  close.addEventListener('click', () => dismiss('close-button'));
  next.addEventListener('click', () => {
    if (pending) return;
    pending = true;
    next.setAttribute('aria-disabled', 'true'); next.setAttribute('aria-busy', 'true');
    root.dataset.lastAction = 'notification_destination_requested';
    root.dispatchEvent(new CustomEvent('nebula:notification-destination-requested', { detail: detail('next-button'), bubbles: true }));
    announce('Notification destination was sent to the host. No preference was saved and no notification was sent.');
  });
  root.addEventListener('nebula:notification-destination-rejected', (event) => {
    const payload = event.detail || {};
    if (payload.notificationIntentId !== root.dataset.flowId || String(payload.version) !== root.dataset.flowVersion) return;
    pending = false; next.removeAttribute('aria-disabled'); next.removeAttribute('aria-busy'); next.focus();
    root.dataset.lastAction = 'notification-destination-rejected';
  });
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); dismiss('escape'); return; }
    if (event.key !== 'Tab') return;
    const focusables = [close, ...options, next];
    if (event.shiftKey && document.activeElement === focusables[0]) { event.preventDefault(); focusables[focusables.length - 1].focus(); }
    else if (!event.shiftKey && document.activeElement === focusables[focusables.length - 1]) { event.preventDefault(); focusables[0].focus(); }
  });
  root.addEventListener('nebula:notification-destination-open', (event) => {
    const payload = event.detail || {};
    const valid = payload.serverState === 'notification_channel_selection' && payload.notificationIntentId && payload.version != null
      && payload.subjectId && Array.isArray(payload.availableChannels) && payload.availableChannels.length > 0
      && payload.verifiedEndpoints && payload.consent && payload.capabilities && payload.authenticatedClient === true;
    if (root.dataset.staticProjection !== 'true' && !valid) { root.dataset.lastAction = 'open-rejected-authoritative-notification-flow-required'; return; }
    opener = payload.opener instanceof HTMLElement ? payload.opener : opener;
    if (payload.notificationIntentId) root.dataset.flowId = String(payload.notificationIntentId);
    if (payload.version != null) root.dataset.flowVersion = String(payload.version);
    pending = false; next.removeAttribute('aria-disabled'); next.removeAttribute('aria-busy');
    root.hidden = false; frame.hidden = false; document.documentElement.classList.add('nebula-modal-open'); heading.focus();
  });
  if (!root.hidden && !frame.hidden) { document.documentElement.classList.add('nebula-modal-open'); requestAnimationFrame(() => heading.focus()); }
})();
