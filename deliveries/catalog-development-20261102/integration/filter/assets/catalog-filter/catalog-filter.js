(function () {
  'use strict';
  const mounted = new WeakSet();
  function mount(root) {
    if (mounted.has(root)) return;
    const dialog = root.querySelector('dialog'), opener = root.querySelector('[data-filter-open]');
    const close = root.querySelector('[data-filter-close]'), form = dialog?.querySelector('form');
    if (!dialog || !opener || !close || !form) return;
    mounted.add(root);
    let snapshot = [];
    function remember() {
      snapshot = [...form.elements].filter(el => el.name && !['file', 'hidden', 'submit', 'button', 'reset'].includes(el.type)).map(el => ({
        el, value: el.value, checked: el.checked,
        selected: el.options ? [...el.options].map(option => option.selected) : null
      }));
    }
    function restore() {
      for (const item of snapshot) {
        if (!item.el.isConnected) continue;
        if (item.selected) [...item.el.options].forEach((option, index) => { option.selected = !!item.selected[index]; });
        else if (item.el.type === 'checkbox' || item.el.type === 'radio') item.el.checked = item.checked;
        else item.el.value = item.value;
      }
    }
    function finish(cancel) {
      if (cancel) restore();
      if (dialog.open) dialog.close();
      opener.setAttribute('aria-expanded', 'false');
      opener.focus({ preventScroll: true });
    }
    opener.addEventListener('click', () => {
      remember(); dialog.showModal(); opener.setAttribute('aria-expanded', 'true');
      dialog.querySelector('h2')?.focus({ preventScroll: true });
    });
    close.addEventListener('click', () => finish(true));
    dialog.addEventListener('cancel', event => { event.preventDefault(); finish(true); });
    dialog.addEventListener('close', () => opener.setAttribute('aria-expanded', 'false'));
    form.addEventListener('cl:filter-applied', () => finish(false));
  }
  const init = () => document.querySelectorAll('[data-catalog-filter]').forEach(mount);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
  document.addEventListener('pjax:end', init);
  if (window.jQuery) window.jQuery(document).on('pjax:end.clCatalogFilter', init);
})();
