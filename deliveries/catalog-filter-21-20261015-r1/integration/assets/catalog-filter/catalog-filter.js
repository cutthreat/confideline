(function () {
  'use strict';
  const mounted = new WeakSet();
  function mount(root) {
    if (mounted.has(root)) return;
    const ownerDocument = root.ownerDocument;
    const form = root.querySelector('[data-filter-form]');
    const dialog = root.querySelector('dialog');
    const opener = root.querySelector('[data-filter-open]');
    if (!form || !dialog || !opener) return;
    mounted.add(root);
    const inputs = [...form.querySelectorAll('input[type=checkbox][data-filter-group]')];
    const heading = dialog.querySelector('h2');
    const reset = form.querySelector('[data-filter-reset]');
    const summary = root.querySelector('[data-applied]');
    const count = root.querySelector('[data-applied-count]');
    const text = JSON.parse(root.dataset.labels);
    const format = (template, values) => template.replace(/\{(label|count)\}/g, (_, key) => values[key]);
    const snapshot = () => inputs.filter(el => el.checked).map(el => ({ group: el.dataset.filterGroup, value: el.value, label: el.closest('label').querySelector('.cl-option-label').textContent }));
    let applied = snapshot(), scrollOrigin = null;
    const matches = (el, item) => el.dataset.filterGroup === item.group && el.value === item.value;
    function counters() {
      for (const badge of form.querySelectorAll('[data-selection-count]')) {
        const n = inputs.filter(el => el.dataset.filterGroup === badge.dataset.selectionCount && el.checked).length;
        badge.textContent = String(n); badge.hidden = !n;
      }
      reset.disabled = !inputs.some(el => el.checked) && !applied.length;
    }
    function restore() { for (const el of inputs) el.checked = applied.some(item => matches(el, item)); counters(); }
    function sync() {
      counters(); summary.replaceChildren(); summary.hidden = !applied.length;
      count.textContent = String(applied.length); count.hidden = !applied.length;
      opener.dataset.active = String(applied.length > 0);
      opener.setAttribute('aria-label', applied.length ? format(text.open, {count:applied.length}) : text.title);
      for (const item of applied) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'cl-applied-chip';
        button.dataset.removeValue = item.value; button.dataset.removeGroup = item.group;
        button.title = format(text.remove, item); button.setAttribute('aria-label', button.title);
        const label = document.createElement('span'); label.textContent = item.label;
        const icon = document.createElement('i'); icon.className = 'fa fa-times'; icon.setAttribute('aria-hidden', 'true');
        button.append(label, icon); summary.append(button);
      }
      if (applied.length > 1) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'cl-applied-chip cl-applied-more';
        button.dataset.expandFilters = ''; button.setAttribute('aria-haspopup', 'dialog'); button.setAttribute('aria-controls', dialog.id);
        button.title = format(text.more, {count:applied.length-1}); button.setAttribute('aria-label', button.title);
        const icon = document.createElement('i'); icon.className = 'fa fa-ellipsis-h'; icon.setAttribute('aria-hidden', 'true');
        const label = document.createElement('span'); label.textContent = '+' + (applied.length-1);
        button.append(icon, label); summary.append(button);
      }
    }
    function viewport() {
      const v = window.visualViewport;
      if (dialog.open && v && v.scale <= 1.001 && matchMedia('(pointer:coarse)').matches && matchMedia('(max-width:575px), (max-height:500px)').matches) {
        for (const [key, value] of Object.entries({height:v.height,width:v.width,top:v.offsetTop,left:v.offsetLeft})) dialog.style.setProperty('--cl-drawer-'+key,value+'px');
      } else for (const key of ['height','width','top','left']) dialog.style.removeProperty('--cl-drawer-'+key);
    }
    function finish(cancel = true) {
      if (cancel) restore();
      if (dialog.open) dialog.close();
      sync(); viewport(); opener.setAttribute('aria-expanded','false');
      if (scrollOrigin && (scrollX !== scrollOrigin.x || scrollY !== scrollOrigin.y)) window.scrollTo(scrollOrigin.x,scrollOrigin.y);
      scrollOrigin = null; opener.focus({preventScroll:true});
    }
    opener.addEventListener('click', () => {
      restore(); scrollOrigin = {x:scrollX,y:scrollY}; dialog.showModal(); viewport();
      opener.setAttribute('aria-expanded','true'); dialog.querySelector('.cl-drawer-body').scrollTop = 0; heading.focus({preventScroll:true});
    });
    dialog.querySelector('[data-filter-close]').addEventListener('click', () => finish());
    dialog.addEventListener('cancel', event => { event.preventDefault(); finish(); });
    dialog.addEventListener('close', () => { if (!dialog.open) finish(); });
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const list = [...dialog.querySelectorAll('button,input')].filter(el => !el.disabled && el.getClientRects().length);
      if (event.shiftKey && (document.activeElement === list[0] || document.activeElement === heading)) { event.preventDefault(); list[list.length-1]?.focus(); }
      else if (!event.shiftKey && document.activeElement === list[list.length-1]) { event.preventDefault(); list[0]?.focus(); }
    });
    const outside = event => { const r = dialog.getBoundingClientRect(); return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom; };
    let backdrop = false;
    dialog.addEventListener('pointerdown', event => { backdrop = outside(event); });
    dialog.addEventListener('pointerup', event => { if (backdrop && outside(event)) finish(); backdrop = false; });
    form.addEventListener('change', counters);
    form.addEventListener('submit', () => { applied = snapshot(); finish(false); });
    reset.addEventListener('click', () => { for (const el of inputs) el.checked = false; form.requestSubmit(); });
    summary.addEventListener('click', event => {
      const more = event.target.closest('[data-expand-filters]'); if (more) { opener.click(); return; }
      const button = event.target.closest('[data-remove-value]'); if (!button) return;
      restore(); inputs.find(el => el.value === button.dataset.removeValue && el.dataset.filterGroup === button.dataset.removeGroup).checked = false; form.requestSubmit();
    });
    const stopBackground = event => { if (dialog.open && !event.target.closest('.cl-drawer-body')) event.preventDefault(); };
    const keepScroll = () => { if (dialog.open && scrollOrigin && (scrollX !== scrollOrigin.x || scrollY !== scrollOrigin.y)) window.scrollTo(scrollOrigin.x,scrollOrigin.y); };
    const leave = () => { if (!root.isConnected) return; if (dialog.open) finish(); };
    const observer = new MutationObserver(() => {
      if (root.isConnected) return;
      observer.disconnect();
      ownerDocument.removeEventListener('wheel',stopBackground); ownerDocument.removeEventListener('touchmove',stopBackground);
      window.removeEventListener('scroll',keepScroll); window.removeEventListener('resize',viewport); window.removeEventListener('popstate',leave);
      window.visualViewport?.removeEventListener('resize',viewport); window.visualViewport?.removeEventListener('scroll',viewport);
    });
    document.addEventListener('wheel',stopBackground,{passive:false}); document.addEventListener('touchmove',stopBackground,{passive:false});
    window.addEventListener('scroll',keepScroll,{passive:true}); window.addEventListener('resize',viewport); window.addEventListener('popstate',leave);
    window.visualViewport?.addEventListener('resize',viewport); window.visualViewport?.addEventListener('scroll',viewport);
    observer.observe(document.body,{childList:true,subtree:true}); sync();
  }
  const init = () => document.querySelectorAll('[data-catalog-filter]').forEach(mount);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
  document.addEventListener('pjax:end',init);
  if (window.jQuery) window.jQuery(document).on('pjax:end.clCatalogFilter',init);
})();
