(function () {
  'use strict';
  const A = window.PartnerInteractionAnalytics;
  const H = window.PartnerInteractionHeaders;
  const R = window.PartnerInteractionReport;
  const G = window.PartnerInteractionCharts;
  const $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = value => value === null || value === undefined ? 'Нет данных' : Number(value).toLocaleString('ru-RU', { maximumFractionDigits: 1 });
  const exact = G.exactValue;
  const metricFmt = (key, value) => ['pairLTV', 'platformLTV'].includes(key) ? exact(value) : fmt(value);
  const access = { role: document.body.dataset.audience || 'admin', partnerId: Number(document.body.dataset.partnerId || 15), expertId: Number(document.body.dataset.expertId || 184), globalPermission: true };
  const state = { partnerId: access.role === 'partner' ? access.partnerId : 0, expertId: access.role === 'expert' ? access.expertId : 0, expertIds: null, period: 'custom', fromDate: '2026-09-07', toDate: '2026-09-15', direction: 'all', query: '', minActions: 0, sort: 'activity_desc', page: 1, pageSize: 50 };
  const chartState = { metric: 'activity', dimension: access.role === 'admin' ? 'partner' : access.role === 'partner' ? 'expert' : 'client', type: 'line', compare: 'none', granularity: 'day', entities: null };
  const metricIcons = { profileViews: 'eye', favorites: 'star', newDialogs: 'message-circle-plus', clientMessages: 'message-circle', expertMessages: 'message-circle-reply', paidConsultations: 'credit-card', repeatExpert: 'repeat', repeatPlatform: 'repeat-2', pairLTV: 'coins', platformLTV: 'wallet', blocks: 'ban', reports: 'flag', activity: 'activity' };
  const data = window.PartnerInteractionExampleData;
  let displayedData;
  let result;
  let lastUpdated = '';
  let requestPending = false;
  let chartDataOpen = false;
  const permitted = [...A.allowedMetrics(access), 'activity', 'messages'];
  const columns = window.PartnerInteractionColumns.create(A.allowedMetrics(access), window.PartnerInteractionColumns.coreMetrics);
  const presets = {
    overview: { metrics: window.PartnerInteractionColumns.coreMetrics },
    workload: { metrics: ['profileViews', 'favorites', 'newDialogs', 'clientMessages'] },
    handling: { metrics: ['newDialogs', 'clientMessages', 'expertMessages'] },
    results: { metrics: ['paidConsultations', 'repeatExpert', 'repeatPlatform', 'pairLTV', 'platformLTV'] },
    quality: { metrics: ['reports', 'blocks', 'repeatExpert'] }
  };
  let activePreset = 'overview', presetCustom = false;
  state.sort = columns.sort(state.sort);
  let headerPreference = 'labels';
  const labelRequired = window.matchMedia('(max-width: 767px), (any-pointer: coarse), (hover: none)');
  const tipState = H.tooltipState();
  const headerTip = document.createElement('div');
  headerTip.id = 'tableHeaderTooltip'; headerTip.className = 'table-header-tooltip'; headerTip.setAttribute('role', 'tooltip'); headerTip.hidden = true;
  document.body.append(headerTip);
  let tipTimer, tipAnchor, lastPointerType = '';
  if (access.role === 'expert') { document.querySelector('.admin-user strong').textContent = 'Эксперт A'; document.querySelector('.admin-user span').textContent = 'EA'; }
  const sidebar = document.querySelector('.sidebar');
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = window.matchMedia('(max-width: 767px)');
  function setNavigation(open) {
    document.body.classList.toggle('navigation-open', open);
    document.body.classList.toggle('navigation-closed', !open);
    navToggle.setAttribute('aria-expanded', String(open));
    sidebar.inert = !open;
    document.querySelector('main').inert = mobileNav.matches && open;
  }
  setNavigation(!mobileNav.matches);
  mobileNav.addEventListener('change', () => setNavigation(!mobileNav.matches));
  navToggle.addEventListener('click', () => setNavigation(navToggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileNav.matches && navToggle.getAttribute('aria-expanded') === 'true') {
      setNavigation(false); navToggle.focus();
    }
  });
  function icon(name) { return '<i data-lucide="' + esc(name) + '" aria-hidden="true"></i>'; }
  function text(id, value) { if ($(id)) $(id).textContent = value; }
  function select(id, options, value) {
    $(id).innerHTML = options.map(item => '<option value="' + esc(item[0]) + '"' + (item[2] ? ' disabled' : '') + '>' + esc(item[1]) + '</option>').join('');
    $(id).value = value;
  }
  const main = document.querySelector('main');
  const status = document.createElement('p');
  status.id = 'loadStatus'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  $('reportOverview').after(status);
  $('period').innerHTML = Object.entries(A.periodLabels).map(([key, label]) => '<option value="' + key + '">' + label + '</option>').join('');
  const dates = document.createElement('div');
  dates.className = 'custom-range'; dates.id = 'customRange';
  dates.innerHTML = '<label><span>С · Europe/Minsk</span><input id="fromDate" type="date" aria-describedby="dateError"></label><label><span>По · включительно</span><input id="toDate" type="date" aria-describedby="dateError"></label><p id="dateError" role="alert"></p>';
  $('period').closest('label').after(dates);
  $('minActions').previousElementSibling.textContent = 'Мин. событий активности';
  $('minActions').insertAdjacentHTML('afterend', '<small id="minimumError" role="alert"></small>');
  $('minActions').setAttribute('aria-describedby', 'minimumError');
  $('minActions').title = 'Просмотры + избранное + сообщения клиентов и экспертов + блокировки + жалобы';
  $('metricActions').previousElementSibling.textContent = 'События активности';
  $('metricActions').closest('.metric').title = $('minActions').title;
  $('metricPairs').closest('.metric').title = 'Уникальные пары клиент–эксперт; направление не удваивает пару';
  $('qualityAnswered').closest('.quality-card').title = 'Эксперт написал после сообщения клиента в выбранном периоде';
  document.querySelector('.summary-grid').insertAdjacentHTML('beforeend', '<div class="panel risk-card" title="Не зависит от направления"><span>Повторные с экспертом</span><strong id="riskRepeatExpert">0</strong></div>' + (access.role === 'admin' ? '<div class="panel risk-card" title="Не зависит от направления"><span>Повторные на платформе</span><strong id="riskRepeatPlatform">0</strong></div>' : ''));
  function renderPreset() {
    document.querySelectorAll('[data-preset]').forEach(button => button.setAttribute('aria-pressed', String(!presetCustom && button.dataset.preset === activePreset)));
    text('presetStatus', presetCustom ? 'Свой набор' : '');
    $('presetStatus').hidden = !presetCustom;

  }
  function applyPreset(key) {
    if (!result || !canView() || !presets[key]) return;
    activePreset = key; presetCustom = false;
    columns.set(presets[key].metrics);
    state.sort = columns.sort(state.sort); state.page = 1;
    result = A.build(displayedData, state, access);
    render(true);
  }
  document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => applyPreset(button.dataset.preset)));
  $('sort').previousElementSibling.textContent = 'Сортировка таблицы';
  updateTableSort();
  const availableProfileIds = A.scope(data, access);
  let draftExpertIds = null;
  const selectedDraftIds = () => draftExpertIds === null ? availableProfileIds : draftExpertIds;
  function profileOwner(expertId) { return data.assignments.find(item => item.expertId === expertId)?.partnerId || 0; }
  function updateProfilePicker() {
    if (!$('profilePicker')) return;
    const selected = new Set(selectedDraftIds());
    $('profileGroups').querySelectorAll('[data-profile-id]').forEach(input => { input.checked = selected.has(Number(input.value)); });
    $('profileGroups').querySelectorAll('[data-agent-id]').forEach(input => {
      const ids = availableProfileIds.filter(id => profileOwner(id) === Number(input.dataset.agentId));
      const count = ids.filter(id => selected.has(id)).length;
      input.checked = count === ids.length; input.indeterminate = count > 0 && count < ids.length;
      text('agentCount-' + input.dataset.agentId, count + ' из ' + ids.length);
    });
    text('profileSelectionCount', selected.size === availableProfileIds.length ? 'Все · ' + selected.size : 'Выбрано ' + selected.size + ' из ' + availableProfileIds.length);
    $('selectAllProfiles').disabled = selected.size === availableProfileIds.length;
    $('clearProfiles').disabled = selected.size === 0;
  }
  function setProfileDraft(ids) {
    const selected = [...new Set(ids.map(Number))].filter(id => availableProfileIds.includes(id)).sort((a,b) => a-b);
    draftExpertIds = selected.length === availableProfileIds.length ? null : selected;
    text('profileSelectionError', ''); if ($('profileSelectionError')) $('profileSelectionError').hidden = true;
    updateProfilePicker();
  }
  function searchProfiles() {
    if (!$('profilePicker')) return;
    const query = $('profileSearch').value.trim().toLocaleLowerCase('ru');
    let visible = 0;
    $('profileGroups').querySelectorAll('.profile-agent-group').forEach(group => {
      let matches = 0;
      group.querySelectorAll('.profile-option').forEach(option => {
        option.hidden = !!query && !(option.dataset.search + ' ' + group.dataset.search).includes(query);
        if (!option.hidden) matches++;
      });
      group.hidden = matches === 0; visible += matches;
    });
    $('profileSearchEmpty').hidden = visible > 0;
  }
  if ($('profilePicker')) {
    const owners = [...new Set(availableProfileIds.map(profileOwner))];
    $('profileGroups').innerHTML = owners.map(ownerId => {
      const owner = data.users.find(u => u.id === ownerId);
      const name = owner?.name || 'Без агента';
      const profiles = data.users.filter(u => availableProfileIds.includes(u.id) && profileOwner(u.id) === ownerId);
      return '<fieldset class="profile-agent-group" data-search="' + esc((name + ' ' + ownerId).toLocaleLowerCase('ru')) + '"><legend><label><input type="checkbox" data-agent-id="' + ownerId + '" aria-label="' + esc('Все профили: ' + name) + '"><span>' + esc(access.role === 'partner' ? 'Все мои профили' : name) + '</span><small id="agentCount-' + ownerId + '"></small></label></legend><div class="profile-agent-options">' + profiles.map(u => '<label class="profile-option" data-search="' + esc((u.name + ' ' + u.username + ' ' + u.id).toLocaleLowerCase('ru')) + '"><input type="checkbox" data-profile-id value="' + u.id + '"><span>' + esc(u.name) + '<small>#' + u.id + '</small></span></label>').join('') + '</div></fieldset>';
    }).join('');
    $('profileGroups').addEventListener('change', event => {
      const input = event.target;
      let ids = selectedDraftIds().slice();
      if (input.matches('[data-agent-id]')) {
        const groupIds = availableProfileIds.filter(id => profileOwner(id) === Number(input.dataset.agentId));
        ids = input.checked ? ids.concat(groupIds) : ids.filter(id => !groupIds.includes(id));
      } else if (input.matches('[data-profile-id]')) ids = input.checked ? ids.concat(Number(input.value)) : ids.filter(id => id !== Number(input.value));
      setProfileDraft(ids); updateDraftStatus();
    });
    $('selectAllProfiles').addEventListener('click', () => { setProfileDraft(availableProfileIds); updateDraftStatus(); });
    $('clearProfiles').addEventListener('click', () => { setProfileDraft([]); updateDraftStatus(); });
    $('profileSearch').addEventListener('input', searchProfiles);
  }
  function writeFilters() {
    Object.entries(state).forEach(([key, value]) => { if ($(key)) $(key).value = value; });
    setProfileDraft(state.expertIds === null ? availableProfileIds : state.expertIds);
    $('customRange').hidden = state.period !== 'custom';
  }
  writeFilters();
  function readFilters() {
    const draft = { ...state };
    R.queryKeys.forEach(key => { if ($(key)) draft[key] = $(key).value; });
    if (access.role === 'partner') draft.partnerId = access.partnerId;
    if (access.role === 'expert') draft.expertId = access.expertId;
    draft.expertIds = access.role === 'expert' ? null : draftExpertIds === null ? null : draftExpertIds.slice();
    draft.page = 1;
    return draft;
  }
  function updateDraftStatus() {
    const denied = !canView();
    const draft = R.draftStatus(readFilters(), state, { pending: requestPending, hasResult: !!result, denied });
    text('filterDraftStatus', draft.text);
    $('filterDraftStatus').hidden = !draft.text;
    $('filterDraftStatus').className = draft.kind;
    $('restoreFilters').hidden = !draft.changed || denied || requestPending;
    $('apply').disabled = denied || requestPending;
    $('apply').textContent = requestPending ? 'Обновление…' : 'Применить фильтры';
  }
  function renderAppliedContext() {
    const user = id => displayedData.users.find(item => item.id === Number(id));
    text('summaryTitle', 'Сводка' + (result.summary.actions === null ? ' по доступным источникам' : ' по выборке'));
    text('appliedScope', R.context(state, {
      role: access.role,
      selection: access.role === 'expert' ? '' : (state.expertIds === null ? (access.role === 'partner' ? 'Все мои профили' : 'Все доступные профили') : 'Профили: ' + (result.experts.length <= 2 ? result.experts.map(u => u.name).join(', ') : result.experts.length)) + ' · ' + result.experts.length + ' проф.',
      partner: user(access.role === 'partner' ? access.partnerId : state.partnerId)?.name,
      expert: user(access.role === 'expert' ? access.expertId : state.expertId)?.name,
      range: result.range.label
    }));
    updateDraftStatus();
  }
  function message(value, kind = '') { status.textContent = value; status.className = kind; }
  function canView() { return access.authorized !== false && ['admin', 'partner', 'expert'].includes(access.role); }
  function refresh(next = state) {
    closeHeaderTip();
    if (!canView()) {
      message('Недоступно для вашей роли', 'denied');
      $('reportPresets').hidden = true;
      $('reportOverview').hidden = true;
      document.querySelector('.view-tabs').hidden = true;
      document.querySelectorAll('.tab-panel').forEach(panel => { panel.hidden = true; });
      updateDraftStatus();
      return;
    }
    requestPending = true;
    main.setAttribute('aria-busy', 'true');
    updateDraftStatus();
    let candidate;
    try { candidate = A.build(data, next, access); }
    catch (error) {
      requestPending = false;
      main.setAttribute('aria-busy', 'false');
      message(error.message + '. ' + (result ? 'Сохранена последняя выборка от ' + lastUpdated : 'Данные пока не загружены'), 'error');
      updateDraftStatus();
      return;
    }
    displayedData = data;
    result = candidate;
    if (R.dirty(next, state)) chartState.entities = null;
    Object.assign(state, next); state.page = result.pagination.page;
    lastUpdated = new Date(data.meta.updatedAt || data.meta.now).toLocaleString('ru-RU', { timeZone: 'Europe/Minsk' });
    requestPending = false;
    main.setAttribute('aria-busy', 'false');
    $('reportPresets').hidden = false;
    $('reportOverview').hidden = false;
    document.querySelector('.view-tabs').hidden = false;
    const missing = result.metrics.activity === null;
    message((missing ? 'Часть показателей недоступна: нет достоверных данных. ' : 'Данные на: ') + lastUpdated + ' · Europe/Minsk');
    render();
    document.body.dataset.ready = 'true';
    return true;
  }
  function sortButton(key, label) {
    const hint = A.pairKeys.includes(key) ? ' · Не зависит от направления' : '';
    const direction = state.sort === key + '_desc' ? ' · по убыванию' : state.sort === key + '_asc' ? ' · по возрастанию' : ' · без сортировки';
    const definition = H.definitions[key];
    return '<button type="button" class="sort-button' + (state.sort.startsWith(key + '_') ? ' sorted' : '') + '" data-sort-key="' + key + '" data-header-tooltip="' + esc(label + hint) + '" aria-label="' + esc(label + direction + ' · изменить сортировку') + '"><span class="header-glyph" aria-hidden="true">' + icon(metricIcons[key]) + (definition.mark ? '<span class="header-mark">' + esc(definition.mark) + '</span>' : '') + '</span><span class="header-label" aria-hidden="true">' + definition.lines.map(esc).join('<br>') + '</span><b class="header-sort" aria-hidden="true">' + (state.sort === key + '_desc' ? '↓' : state.sort === key + '_asc' ? '↑' : '↕') + '</b></button>';
  }
  function ariaSort(key) { return state.sort === key + '_desc' ? 'descending' : state.sort === key + '_asc' ? 'ascending' : 'none'; }
  function closeHeaderTip(reset = true) {
    clearTimeout(tipTimer);
    if (tipAnchor) tipAnchor.removeAttribute('aria-describedby');
    tipAnchor = null; headerTip.hidden = true;
    if (reset) tipState.reset();
  }
  function showHeaderTip() {
    const key = tipState.desired();
    const anchor = key && $('interactionTable').querySelector('[data-sort-key="' + key + '"]');
    if (!anchor || !anchor.isConnected || !canView()) { closeHeaderTip(false); return; }
    if (tipAnchor && tipAnchor !== anchor) tipAnchor.removeAttribute('aria-describedby');
    tipAnchor = anchor;
    headerTip.textContent = anchor.dataset.headerTooltip;
    anchor.setAttribute('aria-describedby', headerTip.id);
    headerTip.hidden = false;
    const coords = H.position(anchor.getBoundingClientRect(), headerTip.getBoundingClientRect(), { width: innerWidth, height: innerHeight });
    headerTip.style.left = coords.left + 'px'; headerTip.style.top = coords.top + 'px';
  }
  function scheduleHeaderTip(delay) { clearTimeout(tipTimer); tipTimer = setTimeout(showHeaderTip, delay); }
  const headerTable = $('interactionTable');
  headerTable.addEventListener('pointerover', event => {
    const anchor = event.target.closest('[data-sort-key]');
    if (!anchor || anchor.contains(event.relatedTarget) || event.pointerType === 'touch' || labelRequired.matches) return;
    const wasOpen = !headerTip.hidden;
    tipState.enter(anchor.dataset.sortKey, 'hover');
    if (wasOpen) showHeaderTip(); else scheduleHeaderTip(400);
  });
  headerTable.addEventListener('pointerout', event => {
    const anchor = event.target.closest('[data-sort-key]');
    if (!anchor || anchor.contains(event.relatedTarget)) return;
    tipState.leave(anchor.dataset.sortKey, 'hover'); scheduleHeaderTip(140);
  });
  headerTable.addEventListener('focusin', event => {
    const anchor = event.target.closest('[data-sort-key]');
    if (!anchor || lastPointerType === 'touch') return;
    tipState.enter(anchor.dataset.sortKey, 'focus'); showHeaderTip();
  });
  headerTable.addEventListener('focusout', event => {
    const anchor = event.target.closest('[data-sort-key]');
    if (!anchor) return;
    tipState.leave(anchor.dataset.sortKey, 'focus'); scheduleHeaderTip(140);
  });
  headerTip.addEventListener('pointerenter', () => { tipState.tip(true); clearTimeout(tipTimer); });
  headerTip.addEventListener('pointerleave', () => { tipState.tip(false); scheduleHeaderTip(140); });
  document.addEventListener('pointerdown', event => { lastPointerType = event.pointerType; closeHeaderTip(); });
  document.addEventListener('keydown', event => {
    lastPointerType = '';
    if (event.key === 'Escape') { tipState.escape(); closeHeaderTip(false); }
  });
  window.addEventListener('scroll', () => closeHeaderTip(), true);
  window.addEventListener('resize', () => closeHeaderTip());
  labelRequired.addEventListener('change', () => { closeHeaderTip(); if (result) render(); });
  $('iconOnlyHeaders').addEventListener('change', () => { headerPreference = $('iconOnlyHeaders').checked ? 'icons' : 'labels'; if (result) render(); });
  function userCell(user) { return '<span class="user-cell"><span class="avatar-cell">' + esc(user.name.split(' ').slice(-1)[0].slice(0, 2)) + '</span><span><span class="user-name">' + esc(user.name) + '</span><span class="user-sub">#' + user.id + ' · ' + esc(user.username) + '</span></span></span>'; }
  function metricCell(row, key) {
    if (row[key] === null) return '<td class="state-value">Нет данных</td>';
    let reference;
    if (A.pairKeys.includes(key) && !row.canonical) reference = row.referenceId;
    if (key === 'platformLTV') {
      const first = result.allRows.find(r => r.canonical && r.client.id === row.client.id);
      if (first?.id !== row.id) reference = first?.id;
    }
    if (reference) return '<td><a class="pair-ref" href="#' + esc(reference) + '" data-reference="' + esc(reference) + '" data-reference-key="' + key + '" title="Значение учитывается один раз; перейти к строке ' + esc(reference) + '">↗ ' + (key === 'platformLTV' ? 'клиент #' + row.client.id : 'пара ' + row.pairId) + '</a></td>';
    return '<td class="' + (row[key] === 0 ? 'zero' : 'num') + '" data-metric="' + key + '">' + metricFmt(key, row[key]) + '</td>';
  }
  function render(tableOnly = false) {
    closeHeaderTip();
    if (!tableOnly) {
      renderAppliedContext();
      const ids = { metricExperts: result.summary.experts, metricPairs: result.summary.pairs, metricMessages: result.summary.messages, metricActions: result.summary.actions, qualityClients: result.summary.clients, qualityClientDialogs: result.quality.dialogs, qualityAnswered: result.quality.answered, qualityNoAnswer: result.quality.noAnswer, qualityOutboundOnly: result.quality.outboundOnly, riskReports: result.metrics.reports, riskBlocks: result.metrics.blocks, riskPaidConsultations: result.metrics.paidConsultations, riskHighActivity: result.highActivity, riskRepeatExpert: result.metrics.repeatExpert, riskRepeatPlatform: result.metrics.repeatPlatform };
      Object.entries(ids).forEach(([id, value]) => text(id, fmt(value)));
      if (access.role === 'expert') text('metricExperts', result.summary.experts === null ? 'Нет данных' : result.summary.experts ? 'Есть' : 'Нет');
      text('qualityResponseRate', result.quality.responseRate === null ? 'Нет данных' : fmt(result.quality.responseRate) + '%');
    }
    renderPreset();
    text('periodBadge', result.range.label);
    text('rowCount', 'Строк: ' + result.pagination.totalRows + ' · ' + (result.summary.pairs === null ? 'Нет данных о парах' : 'Пар: ' + result.summary.pairs));
    text('partnerBadge', access.role === 'expert' ? 'Мой профиль' : 'Профили: ' + result.experts.length + (access.role === 'admin' ? ' · Агенты: ' + new Set(result.experts.map(u => profileOwner(u.id))).size : ''));
    text('pageInfo', result.pagination.from + '–' + result.pagination.to + ' из ' + result.pagination.totalRows);
    $('prevPage').disabled = result.pagination.page <= 1; $('nextPage').disabled = result.pagination.page >= result.pagination.totalPages;
    const metrics = columns.visible();
    const focusedMetric = document.activeElement?.dataset.metricToggle;
    const focusedSort = document.activeElement?.dataset.sortKey;
    $('actionLegend').innerHTML = result.allowedMetrics.map(key => '<button type="button" class="legend-chip' + (metrics.includes(key) ? ' selected' : '') + '" data-metric-toggle="' + key + '" aria-pressed="' + metrics.includes(key) + '" aria-controls="interactionTable" title="' + esc(A.labels[key] + (A.pairKeys.includes(key) ? ' · Не зависит от направления' : '')) + '"><span class="action-icon">' + icon(metricIcons[key]) + '</span><span class="metric-label">' + esc(A.labels[key]) + (result.metrics[key] === null ? '<small>Нет данных</small>' : '') + '</span><span class="metric-check" aria-hidden="true">' + icon('check') + '</span></button>').join('');
    text('metricSelectionCount', 'Выбрано ' + metrics.length + ' из ' + result.allowedMetrics.length);
    $('selectAllMetrics').disabled = metrics.length === result.allowedMetrics.length;
    $('clearMetrics').disabled = metrics.length === 0;
    $('metricEmpty').hidden = metrics.length > 0;
    $('interactionTable').closest('.table-scroll').hidden = metrics.length === 0;
    document.querySelector('.table-panel .pager').hidden = metrics.length === 0;
    const headerMode = H.effectiveMode(headerPreference, { touch: labelRequired.matches });
    const cellTexts = {};
    metrics.forEach(key => {
      cellTexts[key] = [result.metrics[key] === null ? '' : metricFmt(key, result.metrics[key]), ...result.allRows.flatMap(row => row[key] === null ? [] : [metricFmt(key, row[key]), ...(key === 'platformLTV' ? ['↗ клиент #' + row.client.id] : A.pairKeys.includes(key) && !row.canonical ? ['↗ пара ' + row.pairId] : [])])];
    });
    $('interactionTable').style.minWidth = H.tableWidth(metrics, headerMode, cellTexts) + 'px';
    $('interactionTable').classList.toggle('header-icons', headerMode === 'icons');
    $('iconOnlyHeaders').checked = headerMode === 'icons';
    $('iconOnlyHeaders').disabled = labelRequired.matches;
    $('iconModeNote').hidden = headerMode !== 'icons';
    updateTableSort();
    const scopeNote = metrics.some(key => ['pairLTV', 'platformLTV'].includes(key)) ? 'LTV, credits · накоплено на ' + A.dateLabel(result.range.to) + (metrics.includes('platformLTV') ? ' · LTV клиента: вся платформа' : '') : '';
    let scopeNode = $('tableScope');
    if (!scopeNode) { document.querySelector('.metric-picker-head').insertAdjacentHTML('beforebegin', '<div class="filter-scope" id="tableScope"></div>'); scopeNode = $('tableScope'); }
    scopeNode.textContent = scopeNote; scopeNode.hidden = !scopeNote;
    $('interactionTable').querySelector('thead').innerHTML = metrics.length ? '<tr><th scope="col" class="col-user">Кто</th><th scope="col" class="col-user">Кому</th><th scope="col" class="col-direction">Направление</th>' + metrics.map(key => '<th scope="col" class="col-action" style="width:' + H.width(key, headerMode, cellTexts[key]) + 'px" aria-sort="' + ariaSort(key) + '">' + sortButton(key, A.labels[key]) + '</th>').join('') + '</tr>' : '';
    $('interactionTable').querySelector('tbody').innerHTML = !metrics.length ? '' : result.rows.length ? result.rows.map(row => '<tr id="' + esc(row.id) + '" data-pair="' + row.pairId + '"><td class="col-user">' + userCell(row.actor) + '</td><td class="col-user">' + userCell(row.target) + '</td><td class="col-direction"><span class="direction ' + (row.directionKey === 'client_to_expert' ? 'client' : 'expert') + '">' + (row.directionKey === 'client_to_expert' ? 'Клиент → эксперт' : 'Эксперт → клиент') + '</span></td>' + metrics.map(key => metricCell(row, key)).join('') + '</tr>').join('') : '<tr><td colspan="' + (metrics.length + 3) + '" class="empty">' + (result.summary.pairs === null ? 'Нет достоверных данных' : 'Нет событий по выбранным фильтрам') + '</td></tr>';
    let foot = $('interactionTable').querySelector('tfoot');
    if (!foot) { foot = document.createElement('tfoot'); $('interactionTable').append(foot); }
    foot.innerHTML = metrics.length ? '<tr><td colspan="3">Итого по выборке</td>' + metrics.map(key => '<td data-summary="' + key + '">' + (result.metrics[key] === null ? 'Нет данных' : metricFmt(key, result.metrics[key])) + '</td>').join('') + '</tr>' : '';
    if (!tableOnly) renderCharts();
    activateTab(location.hash === '#charts' ? 'charts' : 'table', false);
    window.lucide.createIcons({ attrs: { width: 16, height: 16, 'stroke-width': 1.7 } });
    if (focusedMetric) $('actionLegend').querySelector('[data-metric-toggle="' + focusedMetric + '"]')?.focus({ preventScroll: true });
    if (focusedSort) $('interactionTable').querySelector('[data-sort-key="' + focusedSort + '"]')?.focus({ preventScroll: true });
  }
  function updateTableSort() {
    const metrics = columns.visible();
    select('sort', metrics.length ? metrics.flatMap(key => [[key + '_desc', A.labels[key] + ' ↓'], [key + '_asc', A.labels[key] + ' ↑']]) : [['activity_desc', 'Сначала выберите показатели']], state.sort);
    $('sort').disabled = metrics.length === 0;
  }
  function chooseMetrics(action, key) {
    if (!result || !canView()) return;
    presetCustom = true;
    
    if (action === 'toggle') columns.toggle(key);
    else if (action === 'all') columns.all();
    else columns.clear();
    state.sort = columns.sort(state.sort);
    state.page = 1;
    result = A.build(displayedData, state, access);
    render(true);
  }
  function renderCharts() {
    const entityFocus = document.activeElement?.closest('#chartEntities input')?.value;
    const entityScroll = $('chartEntities').scrollTop;
    const visibleDetails = $('chartGrid').querySelector('.chart-data');
    if (visibleDetails) chartDataOpen = visibleDetails.open;
    const dataOpen = chartDataOpen;
    if (!permitted.includes(chartState.metric)) chartState.metric = 'activity';
    const dimensions = A.dimensions(chartState.metric, access);
    if (!dimensions.includes(chartState.dimension)) { chartState.dimension = dimensions[0]; chartState.entities = null; }
    const cumulative = ['pairLTV', 'platformLTV'].includes(chartState.metric);
    const presentation = G.presentation(chartState.metric, chartState.type, chartState.compare === 'segments' ? 'none' : chartState.compare, state.period);
    chartState.type = presentation.type; chartState.compare = presentation.compare;
    select('chartMetric', permitted.map(key => [key, A.labels[key]]), chartState.metric);
    const dimLabels = { partner: 'Агенты', expert: 'Профили экспертов', client: 'Клиенты', pair: 'Пары клиент–эксперт' };
    select('chartDimension', dimensions.map(key => [key, dimLabels[key]]), chartState.dimension);
    const typeLabels = { line: 'Динамика', bar: 'Столбцы', table: 'Таблица', stacked: 'Структура активности', pie: 'Доли участников' };
    select('chartType', presentation.types.map(type => [type, typeLabels[type]]), chartState.type);
    const previousAllowed = state.period !== 'all' && ['line', 'bar', 'table'].includes(chartState.type);
    select('chartCompare', [['none', 'Без предыдущего периода'], ['previous', 'Предыдущий равный период', !previousAllowed]], chartState.compare);
    $('chartCompare').disabled = !previousAllowed;
    $('chartGranularity').closest('label').hidden = !['line', 'bar', 'table'].includes(chartState.type);
    const settingNote = presentation.reason || (!previousAllowed ? state.period === 'all' ? 'Для всей истории нет предыдущего равного периода.' : 'Сравнение периодов доступно для динамики, столбцов и таблицы.' : '');
    text('chartSettingsNote', settingNote); $('chartSettingsNote').hidden = !settingNote;
    select('chartGranularity', [['day', 'День'], ['week', 'Неделя'], ['month', 'Месяц']], chartState.granularity);
    const groups = A.groups(displayedData, result, chartState.metric, chartState.dimension);
    const selectedIds = G.selection(groups.map(group => group.id), chartState.entities);
    if (chartState.entities !== null) chartState.entities = selectedIds;
    $('chartEntities').innerHTML = groups.map(group => {
      const profiles = chartState.dimension === 'partner' ? displayedData.users.filter(u => group.expertIds?.includes(u.id)) : [];
      const total = chartState.dimension === 'partner' ? availableProfileIds.filter(id => profileOwner(id) === Number(group.id)).length : 0;
      const composition = profiles.length ? '<small>' + profiles.length + ' из ' + total + ' проф.</small>' : '';
      const title = group.label + (profiles.length ? ': ' + profiles.map(u => u.name + ' #' + u.id).join(', ') : '');
      return '<label class="checkbox-item"><input type="checkbox" value="' + esc(group.id) + '"' + (chartState.entities === null || chartState.entities.includes(group.id) ? ' checked' : '') + '><span title="' + esc(title) + '">' + esc(group.label) + composition + '</span><b>' + exact(group.value) + '</b></label>';
    }).join('');
    const chart = A.chart(displayedData, result, chartState);
    $('chartEntities').scrollTop = entityScroll;
    if (entityFocus) [...$('chartEntities').querySelectorAll('input')].find(input => input.value === entityFocus)?.focus({ preventScroll: true });
    text('chartSelectionCount', 'Выбрано ' + selectedIds.length + ' из ' + groups.length);
    $('selectAllChart').disabled = selectedIds.length === groups.length;
    $('clearChart').disabled = selectedIds.length === 0;
    text('chartTitle', A.labels[chartState.metric]);
    text('chartScope', result.range.label + ' · Europe/Minsk');
    const previousLabel = chart.previousRange ? A.dateLabel(chart.previousRange.from) + ' — ' + A.dateLabel(chart.previousRange.to) : '';
    const note = (cumulative ? 'Накоплено на ' + A.dateLabel(result.range.to) + ' · credits' : 'Количество') + (chart.previousRange ? ' · Предыдущий период: ' + previousLabel + (chartState.type === 'bar' ? ' · Заливка — текущий, контур — предыдущий' : chartState.type === 'line' ? ' · Сплошная линия — текущий, пунктир — предыдущий' : '') : '');
    const comparison = value => value.previous === null ? 'Нет данных' : value.previous === 0 ? 'Нет базы сравнения' : fmt((value.value - value.previous) / value.previous * 100) + '%';
    const compareTable = '<div class="analytics-table"><table><caption>По участникам · ' + esc(result.range.label) + '</caption><thead><tr><th scope="col">Участник</th><th scope="col">' + (cumulative ? 'Накоплено, credits' : 'За период') + '</th>' + (chart.previousRange ? '<th scope="col">Предыдущий · ' + esc(previousLabel) + '</th><th scope="col">Изменение</th>' : '') + '</tr></thead><tbody>' + chart.series.map(g => '<tr><th scope="row">' + esc(g.label) + '</th><td>' + exact(g.value) + '</td>' + (chart.previousRange ? '<td>' + exact(g.previous) + '</td><td>' + (g.value === null ? 'Нет данных' : comparison(g)) + '</td>' : '') + '</tr>').join('') + '</tbody></table></div>';
    const intervalTable = '<div class="analytics-table"><table><caption>По интервалам' + (cumulative ? ' · credits' : ' · количество') + '</caption><thead><tr><th scope="col">Конец интервала' + (chart.previousRange ? ' · текущий / предыдущий' : '') + '</th>' + chart.series.map(g => '<th scope="col">' + esc(g.label) + (chart.previousRange ? ' · текущий</th><th scope="col">' + esc(g.label) + ' · предыдущий' : '') + '</th>').join('') + '</tr></thead><tbody>' + chart.intervals.map((bucket, index) => '<tr><th scope="row">' + A.dateLabel(bucket.to) + (chart.previousRange ? ' / ' + A.dateLabel(bucket.to - (result.range.to - result.range.from + 1)) : '') + '</th>' + chart.series.map(g => '<td>' + exact(g.points[index].value) + '</td>' + (chart.previousRange ? '<td>' + exact(g.previousPoints[index].value) + '</td>' : '')).join('') + '</tr>').join('') + '</tbody></table></div>';
    const colors = ['#245b9e', '#237a52', '#946409', '#b03546', '#197a89', '#725294', '#725d44', '#44625b'];
    const colorOrder = groups.map(group => group.id).sort();
    const seriesColors = chart.series.map(group => colors[colorOrder.indexOf(group.id) % colors.length]);
    const legend = '<div class="legend-list">' + (chartState.type === 'stacked' ? A.activityKeys.map((key, i) => '<div class="legend-item"><i style="background:' + colors[i % colors.length] + '"></i><b>' + esc(A.labels[key]) + '</b></div>') : chart.series.map((g, i) => '<div class="legend-item"><i style="background:' + seriesColors[i] + '"></i><b title="' + esc(g.label) + '">' + esc(g.label) + '</b><strong>' + exact(g.value) + (chartState.type === 'pie' && chart.total > 0 ? ' · ' + fmt(g.value / chart.total * 100) + '%' : '') + '</strong></div>')).join('') + '</div>';
    let visual = '';
    if (chartState.type === 'stacked') {
      visual = '<div class="stacked-list">' + chart.series.map(g => {
        const pairs = result.pairs.filter(p => g.pairIds.includes(p.id));
        const values = A.activityKeys.map(key => ({ key, value: pairs.reduce((n, p) => n + (p[key] || 0), 0) }));
        const total = values.reduce((n, v) => n + v.value, 0);
        return '<div class="stacked-row"><header>' + esc(g.label) + '<strong>' + fmt(total) + '</strong></header><div class="stacked-track">' + values.map((v, i) => '<i style="background:' + colors[i % colors.length] + ';width:' + (total ? v.value / total * 100 : 0) + '%" title="' + esc(A.labels[v.key]) + ': ' + v.value + '"></i>').join('') + '</div></div>';
      }).join('') + '</div>';
    } else if (chartState.type === 'pie') {
      const total = chart.series.reduce((n, g) => n + (g.value || 0), 0);
      visual = '<div class="share-chart"><div class="share-track">' + chart.series.map((g, i) => '<i style="background:' + seriesColors[i] + ';width:' + (total ? g.value / total * 100 : 0) + '%" title="' + esc(g.label) + ': ' + fmt(total ? g.value / total * 100 : 0) + '%"></i>').join('') + '</div></div>';
      if (total <= 0) visual = '<div class="state-empty">Нет положительных значений для расчёта долей</div>';
    } else if (chartState.type !== 'table') visual = graphSVG(chart, seriesColors);
    if (chart.total === null) visual = '<div class="state-empty">Нет данных для этого показателя</div>';
    const known = result.metrics[chartState.metric] !== null && result.metrics[chartState.metric] !== undefined;
    const output = G.outputState(known, groups.length, selectedIds.length, chart.total);
    const empty = { 'no-source': 'Нет данных для этого показателя', 'no-events': 'Нет событий за период', 'none-selected': 'Участники не выбраны' }[output] || '';
    const dataTables = chartState.type === 'table' ? compareTable + intervalTable : '<details class="chart-data"' + (dataOpen ? ' open' : '') + '><summary>Данные графика</summary>' + compareTable + intervalTable + '</details>';
    $('chartGrid').innerHTML = empty ? '<div class="state-empty">' + empty + '</div>' : '<p class="chart-note">' + esc(note) + '</p>' + visual + (chartState.type === 'table' ? '' : legend) + dataTables;
    text('chartInsight', !known ? 'Итог недоступен' : groups.length && !selectedIds.length ? 'Участники не выбраны' : 'Итого по выбранным участникам: ' + exact(chart.total) + (cumulative ? ' credits. ' : '. '));
  }
  function graphSVG(chart, colors) {
    const width = 900, height = 260, left = 50, top = 18, bottom = 222;
    const values = chart.series.flatMap(g => g.points.concat(g.previousPoints).map(p => p.value)).filter(v => v !== null);
    if (!values.length) return '<div class="state-empty">Нет данных</div>';
    const maximumRaw = Math.max(1, ...values);
    const minimum = Math.min(0, ...values);
    const maximum = chart.cumulative ? maximumRaw : minimum + Math.max(1, Math.ceil((maximumRaw - minimum) / 4)) * 4;
    const n = Math.max(1, chart.intervals.length);
    const x = i => left + (i + 0.5) * (width - left - 25) / n;
    const y = value => bottom - (value - minimum) / (maximum - minimum) * (bottom - top);
    let svg = '<div class="chart-canvas"><svg class="line-chart" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + esc(A.labels[chart.metric]) + '">';
    for (let i = 0; i <= 4; i++) {
      const value = minimum + (maximum - minimum) * i / 4;
      svg += '<line x1="50" x2="875" y1="' + y(value) + '" y2="' + y(value) + '" class="grid-line"/><text x="44" y="' + (y(value) + 4) + '" text-anchor="end" fill="#718099" font-size="11">' + fmt(value) + '</text>';
    }
    chart.series.forEach((group, groupIndex) => {
      const color = colors[groupIndex % colors.length];
      const periodCount = chart.previousRange ? 2 : 1;
      const barWidth = Math.max(.25, (width - left - 25) / n / Math.max(1, chart.series.length) / periodCount * .7);
      if (chartState.type === 'line') for (const segment of G.lineSegments(group.points)) svg += '<polyline class="chart-line" stroke="' + color + '" points="' + segment.map(point => x(point.index) + ',' + y(point.value)).join(' ') + '"/>';
      if (chartState.type === 'line' && chart.previousRange) for (const segment of G.lineSegments(group.previousPoints)) svg += '<polyline class="chart-line previous" stroke="' + color + '" points="' + segment.map(point => x(point.index) + ',' + y(point.value)).join(' ') + '"/>';
      group.points.forEach((point, i) => {
        if (point.value === null) return;
        const title = esc(group.label + ' · ' + A.dateLabel(point.to) + ': ' + exact(point.value));
        if (chartState.type === 'bar' && point.value !== 0) svg += '<rect x="' + (x(i) + (groupIndex * periodCount - (chart.series.length * periodCount - 1) / 2) * barWidth - barWidth / 2) + '" y="' + Math.min(y(0), y(point.value)) + '" width="' + barWidth + '" height="' + Math.abs(y(point.value) - y(0)) + '" fill="' + color + '"><title>Текущий · ' + title + '</title></rect>';
        if (chartState.type === 'line') svg += '<circle cx="' + x(i) + '" cy="' + y(point.value) + '" r="3" fill="' + color + '"><title>Текущий · ' + title + '</title></circle>';
      });
      if (chart.previousRange) group.previousPoints.forEach((point, i) => {
        if (point.value === null) return;
        const date = point.to - (result.range.to - result.range.from + 1);
        const title = esc('Предыдущий · ' + group.label + ' · ' + A.dateLabel(date) + ': ' + exact(point.value));
        if (chartState.type === 'bar' && point.value !== 0) svg += '<rect x="' + (x(i) + (groupIndex * periodCount + 1 - (chart.series.length * periodCount - 1) / 2) * barWidth - barWidth / 2) + '" y="' + Math.min(y(0), y(point.value)) + '" width="' + barWidth + '" height="' + Math.abs(y(point.value) - y(0)) + '" fill="none" stroke="' + color + '" stroke-dasharray="3 2"><title>' + title + '</title></rect>';
        if (chartState.type === 'line') svg += '<circle cx="' + x(i) + '" cy="' + y(point.value) + '" r="3" fill="#fff" stroke="' + color + '"><title>' + title + '</title></circle>';
      });
    });
    chart.intervals.forEach((bucket, index) => { if (index % Math.max(1, Math.ceil(n / 9)) === 0 || index === n - 1) svg += '<text x="' + x(index) + '" y="247" text-anchor="middle" fill="#718099" font-size="11">' + esc(bucket.label) + '</text>'; });
    return svg + '</svg></div>';
  }
  function activateTab(tab, update = true) {
    closeHeaderTip();
    if (update) history.replaceState(null, '', tab === 'charts' ? '#charts' : '#table');
    document.querySelectorAll('[data-tab]').forEach(button => { button.classList.toggle('active', button.dataset.tab === tab); button.setAttribute('aria-selected', button.dataset.tab === tab); button.tabIndex = button.dataset.tab === tab ? 0 : -1; });
    document.querySelectorAll('.tab-panel').forEach(panel => { panel.hidden = !canView() || panel.dataset.panel !== tab; });
    document.querySelectorAll('[data-report-nav]').forEach(link => { link.classList.toggle('active', link.dataset.reportNav === tab); if (link.dataset.reportNav === tab) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
  }
  $('period').addEventListener('change', () => { $('customRange').hidden = $('period').value !== 'custom'; });
  $('reportFilters').addEventListener('input', updateDraftStatus);
  $('reportFilters').addEventListener('change', updateDraftStatus);
  $('restoreFilters').addEventListener('click', () => {
    if (requestPending || !canView()) return;
    writeFilters(); text('dateError', ''); text('minimumError', ''); $('minActions').removeAttribute('aria-invalid');
    $('fromDate').setAttribute('aria-invalid', 'false'); $('toDate').setAttribute('aria-invalid', 'false');
    updateDraftStatus(); $('apply').focus({ preventScroll: true });
  });
  $('sort').addEventListener('change', () => {
    if (!result || !canView()) return;
     state.sort = columns.sort($('sort').value); state.page = 1;
    result = A.build(displayedData, state, access); render();
  });
  function applyFilters() {
    const next = readFilters();
    if ($('profilePicker') && selectedDraftIds().length === 0) {
      text('profileSelectionError', 'Выберите хотя бы один профиль'); $('profileSelectionError').hidden = false;
      $('profilePicker').open = true; $('profileSearch').value = ''; searchProfiles(); $('profileGroups').querySelector('input')?.focus(); return;
    }
    text('dateError', ''); text('minimumError', '');
    ['fromDate', 'toDate', 'minActions'].forEach(id => $(id).removeAttribute('aria-invalid'));
    try { A.range(data.meta.now, next); }
    catch (error) {
      text('dateError', error.message);
      const field = !$('fromDate').value || $('fromDate').value > $('toDate').value ? $('fromDate') : $('toDate');
      field.setAttribute('aria-invalid', 'true'); field.focus(); return;
    }
    try {
      if ($('minActions').validity.badInput) throw new Error('Укажите целое неотрицательное число');
      next.minActions = A.minimum(next.minActions);
    } catch (error) {
      text('minimumError', error.message); $('minActions').setAttribute('aria-invalid', 'true'); $('minActions').focus(); return;
    }
    refresh(next);
  }
  $('apply').addEventListener('click', applyFilters);
  $('reportFilters').addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.target.tagName === 'INPUT' && !event.target.matches('[type=checkbox], #profileSearch')) { event.preventDefault(); applyFilters(); }
  });
  $('prevPage').addEventListener('click', () => { state.page--; result = A.build(displayedData, state, access); render(); });
  $('nextPage').addEventListener('click', () => { state.page++; result = A.build(displayedData, state, access); render(); });
  $('pageSize').addEventListener('change', () => { state.pageSize = Number($('pageSize').value); state.page = 1; result = A.build(displayedData, state, access); render(); });
  $('actionLegend').addEventListener('click', event => {
    const button = event.target.closest('[data-metric-toggle]');
    if (button) chooseMetrics('toggle', button.dataset.metricToggle);
  });
  function focusMetric() { $('actionLegend').querySelector('button')?.focus({ preventScroll: true }); }
  $('selectAllMetrics').addEventListener('click', () => { chooseMetrics('all'); focusMetric(); });
  $('clearMetrics').addEventListener('click', () => { chooseMetrics('clear'); focusMetric(); });
  $('showAllMetrics').addEventListener('click', () => {
    chooseMetrics('all');
    focusMetric();
  });
  $('interactionTable').addEventListener('click', event => {
    const sort = event.target.closest('[data-sort-key]');
    const reference = event.target.closest('[data-reference]');
    if (sort) {  state.sort = sort.dataset.sortKey + (state.sort === sort.dataset.sortKey + '_desc' ? '_asc' : '_desc'); state.page = 1; result = A.build(displayedData, state, access); render(); $('sort').value = state.sort; }
    if (reference) {
      event.preventDefault();
      const rowId = reference.dataset.reference, key = reference.dataset.referenceKey;
      const index = result.allRows.findIndex(row => row.id === rowId);
      if (index < 0) return;
      state.page = Math.floor(index / Number(state.pageSize)) + 1;
      result = A.build(displayedData, state, access); render();
      const cell = $(rowId)?.querySelector('[data-metric="' + key + '"]') || $(rowId);
      if (cell) { cell.tabIndex = -1; cell.classList.add('reference-target'); cell.focus({ preventScroll: true }); cell.scrollIntoView({ block: 'nearest', inline: 'nearest' }); cell.addEventListener('blur', () => cell.classList.remove('reference-target'), { once: true }); }
    }
  });
  document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => activateTab(button.dataset.tab)));
  document.querySelector('.view-tabs').addEventListener('keydown', event => {
    const buttons = [...document.querySelectorAll('[data-tab]')];
    if (!buttons.includes(event.target) || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = buttons.indexOf(event.target);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    activateTab(buttons[next].dataset.tab); buttons[next].focus();
  });
  document.querySelectorAll('.sidebar a[aria-disabled="true"]').forEach(link => link.addEventListener('click', event => event.preventDefault()));
  document.querySelectorAll('[data-report-nav]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault(); activateTab(link.dataset.reportNav);
    if (mobileNav.matches) setNavigation(false);
    const button = document.querySelector('[data-tab="' + link.dataset.reportNav + '"]');
    button.focus(); button.scrollIntoView({ block: 'start' });
  }));
  window.addEventListener('hashchange', () => activateTab(location.hash === '#charts' ? 'charts' : 'table', false));
  ['Metric', 'Dimension' , 'Type', 'Compare', 'Granularity'].forEach(name => $('chart' + name).addEventListener('change', () => { chartState[name.toLowerCase()] = $('chart' + name).value; if (name === 'Dimension') chartState.entities = null; renderCharts(); }));
  $('chartEntities').addEventListener('change', () => { chartState.entities = [...$('chartEntities').querySelectorAll('input:checked')].map(input => input.value); renderCharts(); });
  $('selectAllChart').addEventListener('click', () => { chartState.entities = null; renderCharts(); $('chartEntities').querySelector('input')?.focus({ preventScroll: true }); });
  $('clearChart').addEventListener('click', () => { chartState.entities = []; renderCharts(); $('selectAllChart').focus({ preventScroll: true }); });
  refresh();
})();
