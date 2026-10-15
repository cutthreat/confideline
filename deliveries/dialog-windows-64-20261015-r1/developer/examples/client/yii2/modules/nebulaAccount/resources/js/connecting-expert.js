(() => {
  const root = document.querySelector('[data-nebula-connecting-expert]');
  if (!root) return;
  const frame = root.querySelector('.connecting-expert__frame');
  const modal = root.querySelector('.connecting-expert__modal');
  const heading = root.querySelector('#connecting-expert-title');
  const close = root.querySelector('[data-connecting-action="dismiss"]');
  const live = root.querySelector('[data-connecting-live]');
  if (!frame || !modal || !heading || !close) return;

  let statusAnchor = document.querySelector('[data-connecting-fixture-anchor]');
  const announce = (text) => { if (live) live.textContent = text; };
  const dismiss = (reason) => {
    root.hidden = true;
    frame.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    root.dataset.lastAction = 'connecting-dismiss-requested';
    root.dispatchEvent(new CustomEvent('nebula:connecting-dismiss-requested', { detail: { reason, sessionId: root.dataset.sessionId || null }, bubbles: true }));
    statusAnchor?.focus();
    announce('Connecting status dismissed. The consultation was not cancelled.');
  };

  close.addEventListener('click', () => dismiss('close-button'));
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); dismiss('escape'); return; }
    if (event.key === 'Tab') { event.preventDefault(); close.focus(); }
  });
  root.addEventListener('nebula:consultation-connecting-open', (event) => {
    const detail = event.detail || {};
    if (root.dataset.staticProjection !== 'true' && (detail.serverState !== 'connecting' || !detail.sessionId || !detail.expertSnapshot)) {
      root.dataset.lastAction = 'open-rejected-server-connecting-snapshot-required';
      announce('A server-authoritative connecting snapshot is required.');
      return;
    }
    statusAnchor = detail.statusAnchor instanceof HTMLElement ? detail.statusAnchor : statusAnchor;
    if (detail.sessionId) root.dataset.sessionId = detail.sessionId;
    root.hidden = false;
    frame.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    root.dataset.lastAction = 'consultation-connecting-opened';
    heading.focus();
    announce('Consultation is connecting. Waiting for server status.');
  });

  if (!root.hidden && !frame.hidden) document.documentElement.classList.add('nebula-modal-open');
})();
