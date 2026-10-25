(function () {
  'use strict';
  const root = document.getElementById('confideline-interactions');
  if (!root) return;
  const table = root.querySelector('#interactionTable');
  const checkbox = root.querySelector('#iconOnlyHeaders');
  const toolbar = root.querySelector('.cl-table-tools');
  const toggle = document.createElement('button');
  toggle.type = 'button'; toggle.id = 'clIconHeaders'; toggle.className = 'cl-tool';
  toggle.setAttribute('aria-controls', 'interactionTable');
  toggle.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';
  toolbar.insertBefore(toggle, toolbar.querySelector('.cl-sort-picker'));
  toggle.addEventListener('click', function () {
    checkbox.checked = !checkbox.checked;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    sync();
  });
  function sync() {
    const compact = table.classList.contains('header-icons');
    toggle.disabled = checkbox.disabled;
    toggle.setAttribute('aria-pressed', String(compact));
    toggle.setAttribute('aria-label', 'Пиктограммы в заголовках');
    toggle.title = checkbox.disabled ? 'На сенсорном и узком экране используются подписи' : compact ? 'Показать подписи столбцов' : 'Показать пиктограммы столбцов';
    table.style.setProperty('--cl-metric-count', table.querySelectorAll('th.col-action').length);
    table.querySelectorAll('[data-sort-key]').forEach(function (button) {
      button.title = button.dataset.headerTooltip;
      const key = button.dataset.sortKey;
      const mark = button.querySelector('.header-mark');
      if (mark && key === 'pairLTV' && mark.textContent !== 'П') mark.textContent = 'П';
      if (mark && key === 'platformLTV' && mark.textContent !== 'К') mark.textContent = 'К';
    });
    table.querySelectorAll('.pair-ref > span').forEach(function (label) { label.classList.add('cl-reference-label'); });
  }
  new MutationObserver(sync).observe(table, { childList: true, subtree: true });
  // Popup geometry belongs to interactions-layout.js; avoid a competing viewport clamp.
  window.addEventListener('resize', sync);
  if (!checkbox.disabled) {
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
  }
  sync();
})();
