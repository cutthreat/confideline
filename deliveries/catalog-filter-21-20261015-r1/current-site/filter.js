(function () {
  'use strict';
  const model = window.CatalogFilterModel;
  const data = window.CatalogFilterData;
  const root = document.querySelector('.cl-catalog');
  if (!root || root.dataset.catalogMounted) return;
  root.dataset.catalogMounted = 'true';
  const form = root.querySelector('#catalog-filter');
  const grid = root.querySelector('#catalog-grid');
  const nav = root.querySelector('#catalog-pages');
  const status = root.querySelector('#catalog-count');
  const message = root.querySelector('#catalog-message');
  const loading = root.querySelector('#catalog-loading');
  const submit = form.querySelector('[type="submit"]');
  const request = data.latest(root.dataset.catalogEndpoint ? data.http(root.dataset.catalogEndpoint) : data.demo(window.CatalogFilterFixtures));
  const labels = { astrology: 'Astrology', mediums: 'Mediums', taro: 'Taro', numerology: 'Numerology', palmistry: 'Palmistry', love: 'Love', fortune: 'Fortune', career: 'Career', 'life-path': 'Life Path', fertility: 'Fertility', soulmate: 'Soulmate' };
  const text = {
    ru: { area: 'Направление', topics: 'Темы', search: 'Поиск', reset: 'Сбросить', title: 'Эксперты', found: n => `Найдено: ${n}`, online: 'В сети', busy: 'Занят', offline: 'Не в сети', emptyTitle: 'Эксперты не найдены', emptyText: 'Попробуйте изменить выбранные параметры.', clear: 'Сбросить фильтр', previous: 'Предыдущая страница', next: 'Следующая страница', page: n => `Страница ${n}`, pages: 'Страницы каталога', invalid: 'В ссылке есть неизвестные или некорректные параметры.', invalidTitle: 'Проверьте фильтр', filter: 'Фильтр экспертов', loading: 'Загрузка…', errorTitle: 'Не удалось загрузить экспертов', errorText: 'Выбранные параметры сохранены. Попробуйте ещё раз.', retry: 'Повторить', errorCount: 'Результаты недоступны' },
    en: { area: 'Category', topics: 'Topics', search: 'Search', reset: 'Reset', title: 'Experts', found: n => `Found: ${n}`, online: 'Online', busy: 'Busy', offline: 'Offline', emptyTitle: 'No matching experts', emptyText: 'Try changing the selected filters.', clear: 'Reset filters', previous: 'Previous page', next: 'Next page', page: n => `Page ${n}`, pages: 'Catalog pages', invalid: 'This link contains unknown or invalid parameters.', invalidTitle: 'Check the filters', filter: 'Expert filters', loading: 'Loading…', errorTitle: 'Unable to load experts', errorText: 'Your filters are saved. Please try again.', retry: 'Retry', errorCount: 'Results unavailable' }
  };
  let applied;
  let invalid = [];
  let mode = 'loading';
  let total = 0;
  let lastPageCount = 1;
  let focusRevision = 0;
  document.addEventListener('focusin', () => { ++focusRevision; });
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const selected = name => Array.from(form.querySelectorAll(`input[name="${name}"]:checked`), input => input.value);
  const draft = () => ({ areas: selected('areas'), topics: selected('topics'), page: 1, lang: applied.lang });
  function updateUrl(push) {
    const query = model.writeQuery(applied);
    const url = location.pathname + (query ? '?' + query : '') + location.hash;
    if (url === location.pathname + location.search + location.hash) return;
    try { history[push ? 'pushState' : 'replaceState'](null, '', url); } catch (_) { /* Some file viewers restrict the History API. */ }
  }
  function updatePending() {
    const changed = model.writeQuery({ ...applied, page: 1 }) !== model.writeQuery(draft());
    for (const name of ['areas', 'topics']) {
      const count = selected(name).length;
      const counter = form.querySelector(`[data-selection-count="${name}"]`);
      counter.textContent = String(count);
      counter.hidden = count === 0;
    }
    const recovery = message.querySelector('[data-catalog-action="retry"], [data-catalog-action="apply"]');
    if (recovery) {
      recovery.dataset.catalogAction = changed ? 'apply' : 'retry';
      recovery.textContent = text[applied.lang][changed ? 'search' : 'retry'];
    }
    submit.disabled = mode === 'loading' && !changed;
    submit.setAttribute('aria-busy', String(mode === 'loading'));
    root.querySelector('#catalog-reset').disabled = !invalid.length && !changed && !applied.areas.length && !applied.topics.length;
    status.textContent = text[applied.lang][mode === 'loading' ? 'loading' : 'errorCount'];
    if (mode === 'ready') status.textContent = text[applied.lang].found(total);
  }
  function showMessage(title, body, action) {
    message.hidden = false;
    if (action === 'retry' || mode === 'invalid') message.setAttribute('role', 'alert');
    else message.removeAttribute('role');
    message.innerHTML = `<h2 tabindex="-1">${escape(title)}</h2><p>${escape(body)}</p><button type="button" class="btn btn-primary" data-catalog-action="${action}">${escape(text[applied.lang][action === 'retry' ? 'retry' : 'clear'])}</button>`;
  }
  function localize() {
    const t = text[applied.lang];
    root.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t[node.dataset.i18n]; });
    form.setAttribute('aria-label', t.filter);
    nav.setAttribute('aria-label', t.pages);
    grid.setAttribute('aria-label', t.title);
    root.lang = applied.lang;
    // A filter locale never rewrites the captured RU shell.
  }
  function pagination(pages, page) {
    lastPageCount = pages;
    nav.hidden = pages < 2;
    const t = text[applied.lang];
    const button = (n, label, content, disabled, current = false, numbered = false) => `<button type="button" data-page="${n}"${numbered ? ' data-page-number' : ''} aria-label="${escape(label)}"${disabled ? ' disabled' : ''}${current ? ' aria-current="page"' : ''}>${content}</button>`;
    let html = button(page - 1, t.previous, '<i class="fa fa-angle-left" aria-hidden="true"></i>', page === 1);
    const numbers = [...new Set([1, pages, page - 1, page, page + 1])].filter(n => n > 0 && n <= pages).sort((a, b) => a - b);
    numbers.forEach((n, i) => {
      if (i && n - numbers[i - 1] > 1) html += '<span class="cl-page-gap" aria-hidden="true">…</span>';
      const current = n === page;
      const content = current ? `<span class="cl-page-desktop">${n}</span><span class="cl-page-mobile">${t.page(n)} ${applied.lang === 'ru' ? 'из' : 'of'} ${pages}</span>` : String(n);
      html += button(n, current ? `${t.page(n)} ${applied.lang === 'ru' ? 'из' : 'of'} ${pages}` : t.page(n), content, false, current, true);
    });
    nav.innerHTML = html + button(page + 1, t.next, '<i class="fa fa-angle-right" aria-hidden="true"></i>', page === pages);
  }
  async function load({ push = false, focusPage = false, focusResult = false } = {}) {
    const focusToken = focusRevision;
    const pageOwnedFocus = focusPage && nav.contains(document.activeElement);
    const resultOwnedFocus = focusResult && (document.activeElement === submit || message.contains(document.activeElement));
    const restorePageFocus = target => {
      if (pageOwnedFocus && focusToken === focusRevision) target?.focus();
    };
    const restoreResultFocus = target => {
      if (resultOwnedFocus && focusToken === focusRevision) target?.focus();
    };
    localize();
    if (invalid.length) {
      request.cancel();
      mode = 'invalid'; grid.hidden = true; nav.hidden = true; grid.innerHTML = '';
      loading.hidden = true;
      root.querySelector('#catalog-results').setAttribute('aria-busy', 'false');
      showMessage(text[applied.lang].invalidTitle, text[applied.lang].invalid, 'reset');
      updatePending(); return;
    }
    mode = 'loading';
    root.querySelector('#catalog-results').setAttribute('aria-busy', 'true');
    grid.hidden = true; nav.hidden = true; message.hidden = true;
    loading.hidden = false;
    updateUrl(push); updatePending();
    const response = await request({ ...applied, areas: [...applied.areas], topics: [...applied.topics] });
    if (response.stale) return;
    loading.hidden = true;
    root.querySelector('#catalog-results').setAttribute('aria-busy', 'false');
    if (response.error) {
      mode = 'error'; grid.innerHTML = '';
      showMessage(text[applied.lang].errorTitle, text[applied.lang].errorText, 'retry');
      restorePageFocus(message.querySelector('button'));
      restoreResultFocus(message.querySelector('h2'));
      updatePending(); return;
    }
    const result = response.result;
    applied.page = result.page; total = result.total; mode = 'ready';
    updateUrl(false); updatePending(); grid.hidden = !total;
    grid.innerHTML = result.items.map(profile => window.CatalogExpertCard.render(profile, applied.lang)).join('');
    grid.scrollLeft = 0;
    if (!total) showMessage(text[applied.lang].emptyTitle, text[applied.lang].emptyText, 'reset');
    pagination(result.pages, result.page);
    restorePageFocus(root.querySelector('#catalog-heading'));
    restoreResultFocus(total ? root.querySelector('#catalog-heading') : message.querySelector('h2'));
  }
  function apply() { applied = draft(); invalid = []; return load({ push: true, focusResult: true }); }
  function reset() {
    const ownedFocus = document.activeElement === root.querySelector('#catalog-reset');
    form.reset(); applied = { areas: [], topics: [], page: 1, lang: applied.lang }; invalid = [];
    const pending = load({ push: true });
    if (ownedFocus) form.querySelector('input').focus();
    return pending;
  }
  function restore() {
    const state = model.readQuery(location.search);
    applied = { areas: state.areas, topics: state.topics, page: state.page, lang: state.lang }; invalid = state.invalid;
    for (const name of ['areas', 'topics']) form.querySelectorAll(`input[name="${name}"]`).forEach(input => { input.checked = state[name].includes(input.value); });
    return load();
  }
  form.addEventListener('change', updatePending);
  form.addEventListener('submit', event => { event.preventDefault(); apply(); });
  root.querySelector('#catalog-reset').addEventListener('click', reset);
  message.addEventListener('click', event => {
    const button = event.target.closest('[data-catalog-action]');
    if (!button) return;
    if (button.dataset.catalogAction === 'retry') {
      load({ focusResult: true });
    } else if (button.dataset.catalogAction === 'apply') {
      apply();
    } else {
      reset();
      form.querySelector('input').focus();
    }
  });
  nav.addEventListener('click', event => {
    const button = event.target.closest('button[data-page]');
    if (!button || button.disabled) return;
    const page = Number(button.dataset.page);
    if (page === applied.page || page < 1 || page > lastPageCount) return;
    applied.page = page; load({ push: true, focusPage: true });
  });
  window.addEventListener('popstate', restore);
  document.querySelectorAll('[data-shell-link]').forEach(link => link.addEventListener('click', event => event.preventDefault()));
  restore();
})();
