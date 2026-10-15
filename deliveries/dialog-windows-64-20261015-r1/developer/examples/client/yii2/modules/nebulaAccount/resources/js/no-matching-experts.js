(() => {
  const root = document.querySelector('.empty');
  if (!root) return;
  const modal = root.querySelector('.empty__modal');
  const close = root.querySelector('.empty__close');
  const controls = () => [close, ...root.querySelectorAll('[data-action]')].filter((item) => item && !item.disabled && item.offsetParent !== null);
  const dismiss = () => {
    root.dataset.lastAction = 'dismiss-intent-owner-required';
    root.dispatchEvent(new CustomEvent('nebula:no-matching-experts-dismiss-required', {
      bubbles: true,
      detail: { dismissOnly: true, backendRequired: true, staticProjection: true },
    }));
    close?.focus();
  };
  root.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => root.dispatchEvent(new CustomEvent('nebula:no-matching-experts-intent', {
    bubbles: true,
    detail: { action: button.dataset.action, backendRequired: true, staticProjection: true },
  }))));
  close?.addEventListener('click', dismiss);
  modal?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); dismiss(); return; }
    if (event.key !== 'Tab') return;
    const order = controls();
    if (!order.length) return;
    const first = order[0]; const last = order[order.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  if (!root.hidden) close?.focus();
})();
