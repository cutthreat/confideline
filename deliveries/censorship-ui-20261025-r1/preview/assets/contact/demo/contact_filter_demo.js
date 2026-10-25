/* Local static preview only. No requests, persistence or real moderation actions. */
(() => {
  'use strict';
  const DEMO = Object.freeze({
    defaultPageSize: 10, // Initial number of fictional journal rows per page.
    pageSizes: [5, 10, 25, 50], // Allowed preview page sizes, not a server limit.
    maxPagerButtons: 7, // Limit the number of page buttons in a narrow footer.
    actorName: 'Демо-модератор', // Fictional editor/reviewer shown in the preview.
    demoLocale: 'ru-RU', // Date/number presentation in this preview.
    storageMode: 'memory', // Never persist restricted original texts.
  });
  const root = document.querySelector('[data-contact-filter-page][data-preview="true"]');
  const UI = window.ContactFilterUI;
  if (!root || !UI) return;
  const isRules = root.dataset.contactFilterPage === 'rules';
  const filterForm = document.getElementById('contactFilterForm');
  const table = root.querySelector('table');
  let rules = [...root.querySelectorAll('[data-cf-rule-models] script')].map(node => JSON.parse(node.textContent));
  let incidents = isRules ? [] : JSON.parse(document.getElementById('contact-incident-models').textContent);
  let rawIncidentId = null;
  const rawViews = new Map();
  const initialQuery = new URLSearchParams(location.search);
  const permissionMode = initialQuery.get('permissions') || 'manage';
  root.dataset.canManage = String(!['view', 'raw-only'].includes(permissionMode));
  root.dataset.canRaw = String(!['view', 'review-only'].includes(permissionMode));
  if (permissionMode !== 'manage') root.querySelector('[data-cf-readonly]').hidden = false;
  if (root.dataset.canManage !== 'true') {
    root.querySelectorAll('[data-cf-edit-rule],#contactPolicyForm input,#contactPolicyForm button').forEach(node => { node.disabled = true; });
  }
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const icon = kind => `<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">${kind === 'eye' ? '<path d="M1.5 10s3-5.5 8.5-5.5 8.5 5.5 8.5 5.5-3 5.5-8.5 5.5S1.5 10 1.5 10Z"/><circle cx="10" cy="10" r="2.5"/>' : kind === 'check' ? '<path d="m4 10 4 4 8-8"/>' : '<path d="m12.5 3.5 4 4-9 9-4.5 1 1-4.5zM10.5 5.5l4 4"/>'}</svg>`;
  const date = value => { const [d, t] = value.split('T'); const [year, month, day] = d.split('-'); return `${day}.${month}.${year.slice(2)} ${t.slice(0, 5)}`; };
  const contains = (value, query) => String(value).toLocaleLowerCase(DEMO.demoLocale).includes(String(query).trim().toLocaleLowerCase(DEMO.demoLocale));
  function localTimestamp() {
    const now = new Date();
    const values = [now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()].map((value, i) => i ? String(value).padStart(2, '0') : value);
    return `${values[0]}-${values[1]}-${values[2]}T${values[3]}:${values[4]}:${values[5]}`;
  }
  function filters() { return Object.fromEntries(new FormData(filterForm)); }
  function filtered() {
    const values = filters();
    return (isRules ? rules : incidents).filter(row => {
      if (values.id && !contains(row.id, values.id)) return false;
      if (values.category && (isRules ? row.category !== values.category : !row.categories.includes(values.category))) return false;
      if (isRules) return (!values.label || contains(row.label, values.label)) && (!values.is_enabled || String(row.is_enabled) === values.is_enabled);
      return (!values.date_from || row.created_at.slice(0, 10) >= values.date_from)
        && (!values.date_to || row.created_at.slice(0, 10) <= values.date_to)
        && (!values.conversation_id || contains(row.conversation_id, values.conversation_id))
        && (!values.sender_user_id || String(row.sender.id) === values.sender_user_id)
        && (!values.recipient_user_id || String(row.recipient.id) === values.recipient_user_id)
        && (!values.status || row.review_status === values.status);
    });
  }
  function rowMarkup(row) {
    if (isRules) return `<tr data-rule-id="${row.id}"><td class="cf-id">${row.id}</td><td><strong>${escape(row.label)}</strong></td><td class="cf-category"><span class="cf-badge">${UI.CATEGORIES[row.category]}</span></td><td class="cf-example"><code title="${escape(row.positive_examples)}">${escape(row.positive_examples.split('\n')[0])}</code></td><td class="cf-rule-state"><span class="cf-badge ${row.is_enabled ? 'is-enabled' : ''}">${row.is_enabled ? 'Включено' : 'Выключено'}</span></td><td class="cf-date">${date(row.updated_at)}<span class="cf-secondary cf-muted">${escape(row.updated_by)}</span></td><td class="cf-actions">${root.dataset.canManage === 'true' ? `<button class="cf-icon-btn" type="button" data-cf-edit-rule="${row.id}" aria-label="Редактировать правило ${escape(row.label)}" title="Редактировать правило">${icon('edit')}</button>` : '<span class="cf-muted">—</span>'}</td></tr>`;
    const canRaw = root.dataset.canRaw === 'true', canManage = root.dataset.canManage === 'true';
    const approve = canManage && row.review_status === UI.CONFIG.pendingStatus ? `<form class="cf-approve-form" method="post" action="/ru/admin/chat-contact-incident/review?id=${row.id}" data-cf-approve data-incident-id="${row.id}"><input type="hidden" name="status" value="${UI.CONFIG.confirmedStatus}"><button type="submit" class="cf-icon-btn cf-approve-btn" title="Подтвердить срабатывание" aria-label="Подтвердить срабатывание ${row.id}">${icon('check')}</button></form>` : '';
    return `<tr data-incident-id="${row.id}"><td class="cf-id">${row.id}</td><td class="cf-conversation"><a href="#" data-demo-conversation="${row.conversation_id}" title="Открыть диалог #${row.conversation_id}">msg #${row.message_id}</a><span class="cf-secondary cf-muted">v${row.content_version}</span></td><td class="cf-person"><strong>${escape(row.sender.name)}</strong><span class="cf-secondary cf-muted">ID ${row.sender.id} · ${row.sender_type === 'expert' ? 'Эксперт' : 'Клиент'}</span></td><td class="cf-person"><strong>${escape(row.recipient.name)}</strong><span class="cf-secondary cf-muted">ID ${row.recipient.id}</span></td><td class="cf-date">${date(row.created_at)}</td><td class="cf-category"><div class="cf-badge-list">${row.categories.map(category => `<span class="cf-badge">${UI.CATEGORIES[category]}</span>`).join('')}</div></td><td class="cf-review"><div class="cf-review-line"><span class="cf-badge is-${row.review_status.replaceAll('_', '-')}">${UI.STATUSES[row.review_status]}</span>${approve}</div>${row.raw_deleted_at ? '<span class="cf-secondary cf-muted">Оригинал удалён</span>' : ''}</td><td class="cf-actions">${canRaw && !row.raw_deleted_at ? `<form method="post" action="/ru/admin/chat-contact-incident/raw?id=${row.id}" target="_blank" data-cf-raw data-incident-id="${row.id}"><button type="submit" class="cf-icon-btn" aria-label="Открыть оригинал срабатывания ${row.id}" title="Просмотреть оригинал">${icon('eye')}</button></form>` : ''}${canManage ? `<button type="button" class="cf-icon-btn" data-cf-review data-incident-id="${row.id}" data-review-status="${row.review_status}" data-review-action="/ru/admin/chat-contact-incident/review?id=${row.id}" title="Изменить статус проверки" aria-label="Изменить статус срабатывания ${row.id}">${icon('edit')}</button>` : ''}${!canRaw && !canManage ? '<span class="cf-muted">—</span>' : ''}</td></tr>`;
  }
  function render() {
    const values = filters();
    const rows = filtered();
    const sort = values.sort || (isRules ? 'id' : '-created_at');
    const descending = sort.startsWith('-');
    const key = sort.replace(/^-/, '');
    const column = row => key === 'sender_user_id' ? row.sender.id : key === 'recipient_user_id' ? row.recipient.id : row[key];
    rows.sort((a, b) => {
      const x = column(a), y = column(b);
      const comparison = typeof x === 'number' ? x - y : String(x).localeCompare(String(y), DEMO.demoLocale);
      return (descending ? -1 : 1) * comparison;
    });
    const size = DEMO.pageSizes.includes(Number(values['per-page'])) ? Number(values['per-page']) : DEMO.defaultPageSize;
    const pageCount = Math.max(1, Math.ceil(rows.length / size));
    const page = Math.max(1, Math.min(pageCount, Number(values.page) || 1));
    filterForm.elements.namedItem('page').value = String(page);
    const start = (page - 1) * size;
    const visible = rows.slice(start, start + size);
    table.tBodies[0].innerHTML = visible.length ? visible.map(rowMarkup).join('') : `<tr><td class="cf-empty" colspan="${isRules ? 7 : 8}">Ничего не найдено. Измените или сбросьте фильтры.</td></tr>`;
    root.querySelector('[data-cf-count]').textContent = rows.length ? `Показано ${start + 1}–${Math.min(start + size, rows.length)} из ${rows.length}${isRules ? ` · включено ${rules.filter(row => row.is_enabled).length} из ${rules.length}` : ''}` : 'Найдено: 0';
    root.querySelectorAll('[data-sort-column]').forEach(th => {
      th.setAttribute('aria-sort', th.dataset.sortColumn === key ? (descending ? 'descending' : 'ascending') : 'none');
      th.querySelector('a').href = `?sort=${th.dataset.sortColumn === key && !descending ? '-' : ''}${th.dataset.sortColumn}`;
    });
    const pager = root.querySelector('.pagination');
    const item = (n, label, description) => `<li class="${n === page && !description ? 'active' : ''}"><a href="?page=${n}" data-demo-page="${n}" ${n === page && !description ? 'aria-current="page"' : ''} ${description ? `aria-label="${description}"` : ''}>${label}</a></li>`;
    pager.innerHTML = (page > 1 ? item(page - 1, '‹', 'Предыдущая страница') : '<li class="disabled"><span aria-label="Предыдущая страница">‹</span></li>')
      + Array.from({length: Math.min(pageCount, DEMO.maxPagerButtons)}, (_, i) => item(i + 1, i + 1, '')).join('')
      + (page < pageCount ? item(page + 1, '›', 'Следующая страница') : '<li class="disabled"><span aria-label="Следующая страница">›</span></li>');
    root.querySelectorAll('[data-cf-status]').forEach(link => {
      const status = link.dataset.cfStatus;
      link.setAttribute('aria-current', String((values.status || '') === status));
      link.querySelector('.cf-tab-count').textContent = status ? incidents.filter(row => row.review_status === status).length : incidents.length;
    });
    UI.syncScrollbar();
  }
  function syncRuleModels() {
    const models = root.querySelector('[data-cf-rule-models]');
    models.replaceChildren();
    for (const rule of rules) {
      const node = document.createElement('script');
      node.type = 'application/json';
      node.id = `contact-rule-${rule.id}`;
      node.textContent = JSON.stringify(rule);
      models.appendChild(node);
    }
  }
  function showOriginal(id) {
    const row = incidents.find(item => item.id === id);
    if (!row || row.raw_deleted_at || root.dataset.canRaw !== 'true') return;
    rawIncidentId = id;
    const views = rawViews.get(id) || [];
    views.unshift(`${DEMO.actorName} · ${date(localTimestamp())}`);
    rawViews.set(id, views);
    const examples = {phone: '+1 (202) 555-0173', email: 'anna@example.com', link: 'https://example.com/profile', messenger: 'Telegram: @anna_demo'};
    const fragments = row.categories.map(category => examples[category]);
    document.getElementById('contactOriginalFacts').textContent = `Демо-срабатывание #${id} · диалог #${row.conversation_id} · сообщение ${row.message_id}`;
    document.getElementById('contactOriginalText').textContent = `Давайте продолжим завтра. Мои контакты: ${fragments.join('; ')}.\nБуду ждать вашего ответа.`;
    document.getElementById('contactDeliveredText').textContent = `Давайте продолжим завтра. Мои контакты: ${fragments.map(() => '[контакт скрыт]').join('; ')}.\nБуду ждать вашего ответа.`;
    document.getElementById('contactOriginalViews').textContent = views.join('\n');
    const deleteForm = document.getElementById('contactDeleteRawForm');
    deleteForm.action = `/ru/admin/chat-contact-incident/delete-raw?id=${id}`;
    deleteForm.hidden = root.dataset.canManage !== 'true';
    UI.openModal('contactOriginalModal');
  }
  document.addEventListener('submit', event => {
    if (event.defaultPrevented) return;
    const form = event.target;
    if (!form.closest('[data-contact-filter-page]') && !form.closest('.cf-modal')) return;
    event.preventDefault();
    if (form === filterForm) { render(); return; }
    if (form.matches('#contactRuleForm')) {
      if (root.dataset.canManage !== 'true') return;
      const data = Object.fromEntries(new FormData(form));
      const id = Number(data.id) || Math.max(0, ...rules.map(row => row.id)) + 1;
      const rule = {...data, id, is_enabled: data.is_enabled ? 1 : 0, updated_at: localTimestamp(), updated_by: DEMO.actorName};
      rules = rules.filter(row => row.id !== id).concat(rule);
      syncRuleModels();
      render();
      UI.closeModal();
      UI.notify('Демо: правило изменено только в макете. Рабочий сервер проверит PCRE и примеры перед сохранением.');
      return;
    }
    if (form.matches('#contactPolicyForm')) { UI.notify('Демо: настройки приняты в макете. Фильтр рабочего чата не изменён.'); return; }
    if (form.matches('[data-cf-raw]')) { showOriginal(Number(form.dataset.incidentId)); return; }
    if (form.matches('[data-cf-approve]')) {
      if (root.dataset.canManage !== 'true') return;
      const row = incidents.find(item => item.id === Number(form.dataset.incidentId));
      if (!row || row.review_status !== UI.CONFIG.pendingStatus || form.elements.namedItem('status').value !== UI.CONFIG.confirmedStatus) return;
      const visibleRows = [...table.tBodies[0].querySelectorAll('tr[data-incident-id]')];
      const index = visibleRows.findIndex(node => node.dataset.incidentId === String(row.id));
      const adjacentId = (visibleRows[index + 1] || visibleRows[index - 1])?.dataset.incidentId;
      row.review_status = UI.CONFIG.confirmedStatus;
      render();
      const target = table.querySelector(`[data-cf-review][data-incident-id="${row.id}"]`)
        || table.querySelector(`tr[data-incident-id="${adjacentId}"] .cf-approve-btn`) || root.querySelector('.cf-scroll');
      target?.focus({preventScroll: true});
      UI.notify('Демо: срабатывание подтверждено. Текст сообщения в чате не изменяется.');
      return;
    }
    if (form.matches('#contactReviewForm')) {
      if (root.dataset.canManage !== 'true') return;
      const row = incidents.find(item => item.id === Number(form.dataset.incidentId));
      if (!row || !Object.hasOwn(UI.STATUSES, form.elements.namedItem('status').value)) return;
      row.review_status = form.elements.namedItem('status').value;
      render();
      UI.closeModal();
      UI.notify('Демо: результат проверки обновлён. Текст сообщения в чате не изменяется.');
      return;
    }
    if (form.matches('#contactDeleteRawForm')) {
      if (root.dataset.canManage !== 'true' || root.dataset.canRaw !== 'true') return;
      const row = incidents.find(item => item.id === rawIncidentId);
      if (!row) return;
      row.raw_deleted_at = localTimestamp();
      render();
      UI.closeModal();
      UI.notify('Демо: оригинал удалён из макета. Метаданные срабатывания и скрытый текст сохранены.');
    }
  });
  root.addEventListener('click', event => {
    const page = event.target.closest('[data-demo-page]');
    const sort = event.target.closest('[data-cf-sort]');
    const status = event.target.closest('[data-cf-status]');
    const conversation = event.target.closest('[data-demo-conversation]');
    if (page) { event.preventDefault(); filterForm.elements.namedItem('page').value = page.dataset.demoPage; render(); }
    if (sort) {
      event.preventDefault();
      const value = sort.dataset.cfSort;
      filterForm.elements.namedItem('sort').value = filterForm.elements.namedItem('sort').value === value ? `-${value}` : value;
      filterForm.elements.namedItem('page').value = '1';
      render();
    }
    if (status) { event.preventDefault(); filterForm.elements.namedItem('status').value = status.dataset.cfStatus; filterForm.elements.namedItem('page').value = '1'; render(); }
    if (conversation) { event.preventDefault(); UI.notify(`Демо: в рабочей версии откроется связанный диалог #${conversation.dataset.demoConversation}.`); }
  });
  root.addEventListener('contact-filter:modal-closed', () => { rawIncidentId = null; });
  for (const field of root.querySelectorAll('[data-cf-filter]')) {
    if (initialQuery.has(field.name)) {
      field.value = initialQuery.get(field.name);
      if (field.matches('[data-cf-person-select]') && window.jQuery?.fn.select2) window.jQuery(field).trigger('change.select2');
    }
  }
  if (!isRules && initialQuery.has('date') && !initialQuery.has('date_from') && !initialQuery.has('date_to')) {
    filterForm.elements.namedItem('date_from').value = initialQuery.get('date');
    filterForm.elements.namedItem('date_to').value = initialQuery.get('date');
  }
  UI.syncDateRange();
  if (initialQuery.has('page')) filterForm.elements.namedItem('page').value = initialQuery.get('page');
  if (initialQuery.has('sort')) filterForm.elements.namedItem('sort').value = initialQuery.get('sort');
  render();
})();
