(function () {
  'use strict';
  const root = document.querySelector('.cl-catalog-vertical');
  if (!root || root.dataset.drawerMounted) return;
  root.dataset.drawerMounted = 'true';
  const model = window.CatalogFilterModel;
  const form = root.querySelector('#catalog-filter');
  const drawer = root.querySelector('#catalog-drawer');
  const opener = root.querySelector('#catalog-filter-open');
  const heading = root.querySelector('#catalog-drawer-title');
  const close = root.querySelector('#catalog-drawer-close');
  const counter = root.querySelector('#catalog-applied-count');
  const summary = root.querySelector('#catalog-applied');
  let scrollOrigin = null;
  const labels = Object.fromEntries([...form.querySelectorAll('input')].map(input => [input.value, input.closest('label').querySelector('.cl-option-label').textContent]));
  const strings = {
    ru: { title: 'Фильтры', close: 'Закрыть фильтры', reset: 'Сбросить фильтр', all: 'Все выбранные фильтры', more: n => `Все выбранные фильтры, ещё ${n}`, applied: 'Применённые фильтры', remove: label => `Убрать фильтр ${label}`, open: n => n ? `Фильтры, применено: ${n}` : 'Фильтры' },
    en: { title: 'Filters', close: 'Close filters', reset: 'Reset filters', all: 'All selected filters', more: n => `All selected filters, ${n} more`, applied: 'Applied filters', remove: label => `Remove ${label} filter`, open: n => n ? `Filters, ${n} applied` : 'Filters' }
  };
  const applied = () => model.readQuery(location.search);
  function sync() {
    const state = applied(), t = strings[state.lang];
    const values = [...state.areas.map(value => ['areas', value]), ...state.topics.map(value => ['topics', value])];
    heading.textContent = t.title;
    close.title = t.close; close.setAttribute('aria-label', t.close);
    const reset = root.querySelector('#catalog-reset');
    reset.title = t.reset; reset.setAttribute('aria-label', t.reset);
    opener.querySelector('[data-drawer-label]').textContent = t.title;
    opener.setAttribute('aria-label', t.open(values.length));
    opener.dataset.active = String(values.length > 0);
    counter.textContent = String(values.length); counter.hidden = !values.length;
    summary.hidden = !values.length; summary.setAttribute('aria-label', t.applied);
    summary.replaceChildren(...values.map(([name, value]) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'cl-applied-chip';
      button.dataset.removeGroup = name; button.dataset.removeValue = value;
      button.setAttribute('aria-label', t.remove(labels[value])); button.title = t.remove(labels[value]);
      const label = document.createElement('span'); label.textContent = labels[value];
      const icon = document.createElement('i'); icon.className = 'fa fa-times'; icon.setAttribute('aria-hidden', 'true');
      button.append(label, icon); return button;
    }));
    if (values.length > 1) {
      const more = document.createElement('button');
      more.type = 'button'; more.className = 'cl-applied-chip cl-applied-more';
      more.dataset.expandFilters = ''; more.title = t.all;
      more.setAttribute('aria-label', t.more(values.length - 1));
      more.setAttribute('aria-haspopup', 'dialog'); more.setAttribute('aria-controls', drawer.id);
      const icon = document.createElement('i'); icon.className = 'fa fa-ellipsis-h'; icon.setAttribute('aria-hidden', 'true');
      const count = document.createElement('span'); count.textContent = '+' + (values.length - 1);
      more.append(icon, count); summary.append(more);
    }
  }
  function restoreForm() {
    const state = applied();
    for (const input of form.querySelectorAll('input')) input.checked = state[input.name].includes(input.value);
    form.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function syncViewport() {
    const v = window.visualViewport;
    // The frozen legacy header can make mobile browsers shrink the whole page.
    if (drawer.open && v && v.scale <= 1.001 && matchMedia('(pointer:coarse)').matches && matchMedia('(max-width:575px), (max-height:500px)').matches) {
      drawer.style.setProperty('--cl-drawer-height', v.height + 'px');
      drawer.style.setProperty('--cl-drawer-width', v.width + 'px');
      drawer.style.setProperty('--cl-drawer-top', v.offsetTop + 'px');
      drawer.style.setProperty('--cl-drawer-left', v.offsetLeft + 'px');
    } else {
      for (const name of ['height', 'width', 'top', 'left']) drawer.style.removeProperty('--cl-drawer-' + name);
    }
  }
  function restoreScroll() {
    const origin = scrollOrigin; scrollOrigin = null;
    if (origin && (scrollX !== origin.x || scrollY !== origin.y)) window.scrollTo(origin.x, origin.y);
  }
  function finish() {
    restoreForm();
    if (drawer.open) drawer.close();
    sync(); syncViewport(); restoreScroll(); opener.setAttribute('aria-expanded', 'false');
    opener.focus({ preventScroll: true });
  }
  opener.addEventListener('click', () => {
    restoreForm(); sync();
    scrollOrigin = { x: scrollX, y: scrollY };
    drawer.showModal(); opener.setAttribute('aria-expanded', 'true');
    syncViewport();
    root.querySelector('.cl-drawer-body').scrollTop = 0;
    heading.focus({ preventScroll: true });
  });
  close.addEventListener('click', finish);
  drawer.addEventListener('close', () => {
    if (drawer.open) return;
    restoreForm(); sync(); syncViewport(); restoreScroll(); opener.setAttribute('aria-expanded', 'false');
    opener.focus({ preventScroll: true });
  });
  drawer.addEventListener('cancel', event => { event.preventDefault(); finish(); });
  drawer.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...drawer.querySelectorAll('button,input,select,textarea,a[href],[tabindex="0"]')].filter(el => !el.disabled && el.getClientRects().length);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === heading)) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first?.focus();
    }
  });
  const outside = event => {
    const r = drawer.getBoundingClientRect();
    return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;
  };
  let backdropDown = false;
  drawer.addEventListener('pointerdown', event => { backdropDown = outside(event); });
  drawer.addEventListener('pointerup', event => { if (backdropDown && outside(event)) finish(); backdropDown = false; });
  // Keep the original controller's apply/reset and async error handling intact.
  form.addEventListener('submit', () => { finish(); });
  root.querySelector('#catalog-reset').addEventListener('click', finish);
  root.querySelector('#catalog-message').addEventListener('click', event => {
    if (event.target.closest('[data-catalog-action="reset"]')) finish();
  });
  summary.addEventListener('click', event => {
    if (event.target.closest('[data-expand-filters]')) { opener.click(); return; }
    const button = event.target.closest('[data-remove-value]');
    if (!button) return;
    restoreForm();
    const input = form.querySelector(`input[name="${button.dataset.removeGroup}"][value="${button.dataset.removeValue}"]`);
    input.checked = false;
    form.dispatchEvent(new Event('change', { bubbles: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  // Native dialog makes the page inert; prevent wheel/touch scrolling its background too.
  for (const name of ['wheel', 'touchmove']) document.addEventListener(name, event => {
    if (drawer.open && !event.target.closest('.cl-drawer-body')) event.preventDefault();
  }, { passive: false });
  window.addEventListener('scroll', () => {
    if (drawer.open && scrollOrigin && (scrollX !== scrollOrigin.x || scrollY !== scrollOrigin.y)) window.scrollTo(scrollOrigin.x, scrollOrigin.y);
  }, { passive: true });
  window.addEventListener('resize', syncViewport);
  window.visualViewport?.addEventListener('resize', syncViewport);
  window.visualViewport?.addEventListener('scroll', syncViewport);
  window.addEventListener('popstate', () => { if (drawer.open) finish(); else sync(); });
  sync();
})();
