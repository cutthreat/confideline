(function () {
  'use strict';
  const root = document.getElementById('confideline-interactions');
  if (!root || root.dataset.sharedUiReady) return;
  root.dataset.sharedUiReady = 'initializing';
  const byId = id => root.querySelector('#' + id);
  let selectSummaryView;
  
  const chartGeometry = new WeakMap();
  function fitChart() {
    const svg = root.querySelector('#chartGrid .line-chart');
    if (!svg || !svg.getBoundingClientRect().width) return;
    let chart = chartGeometry.get(svg);
    if (!chart) {
      // Preserve the original renderer's coordinates and read its accessible data table.
      const table = root.querySelector('#chartGrid .analytics-table:last-child table');
      const rows = table ? [...table.tBodies[0].rows] : [];
      const canvas = svg.closest('.chart-canvas');
      chart = {
        nodes: [...svg.querySelectorAll('line,text,circle,rect,polyline')].map(node => ({
          node, attrs:Object.fromEntries(['x','x1','x2','cx','width','points'].filter(key => node.hasAttribute(key)).map(key => [key,node.getAttribute(key)]))
        })), rows, width:0, index:Math.max(0,rows.length - 1)
      };
      chartGeometry.set(svg,chart);
      if (rows.length) {
        const readout = document.createElement('div'); readout.className = 'cl-chart-readout';
        readout.id = 'clChartReadout'; readout.setAttribute('role','status'); readout.setAttribute('aria-atomic','true');
        const inspector = document.createElement('div'); inspector.className = 'cl-chart-inspector';
        const slider = document.createElement('input'); slider.type = 'range'; slider.className = 'cl-chart-cursor';
        slider.min = '0'; slider.max = String(rows.length - 1); slider.step = '1';
        slider.setAttribute('aria-label','Интервал графика');
        slider.disabled = rows.length === 1;
        const marker = document.createElementNS('http://www.w3.org/2000/svg','line');
        marker.classList.add('cl-chart-marker'); marker.setAttribute('y1','18'); marker.setAttribute('y2','222'); marker.setAttribute('aria-hidden','true');
        svg.append(marker); inspector.append(readout,slider); canvas.after(inspector); svg.setAttribute('aria-describedby',readout.id);
        const headers = [...table.tHead.rows[0].cells].slice(1).map(cell => cell.textContent);
        chart.select = index => {
          chart.index = Math.max(0,Math.min(rows.length - 1,index));
          const row = rows[chart.index];
          const date = document.createElement('strong'); date.textContent = row.cells[0].textContent;
          const values = [...row.cells].slice(1).map((cell,i) => {
            const item = document.createElement('span'); item.textContent = headers[i] + ': ' + cell.textContent; return item;
          });
          readout.replaceChildren(date,...values); slider.value = String(chart.index);
          slider.setAttribute('aria-valuetext',[date.textContent,...values.map(item => item.textContent)].join('; '));
          const x = chart.left + (chart.index + .5) * chart.plot / rows.length;
          marker.setAttribute('x1',String(x)); marker.setAttribute('x2',String(x));
        };
        slider.addEventListener('input',() => chart.select(Number(slider.value)));
        canvas.addEventListener('click',event => {
          const bounds = svg.getBoundingClientRect();
          chart.select(Math.floor(((event.clientX - bounds.left) * chart.width / bounds.width - chart.left) / chart.plot * rows.length));
        });
      }
    }
    const width = Math.round(svg.closest('.chart-canvas').getBoundingClientRect().width);
    if (chart.width === width) return;
    chart.width = width;
    const yLabels = chart.nodes.filter(({node}) => node.tagName === 'text' && Number(node.getAttribute('y')) < 240);
    chart.left = Math.max(42,...yLabels.map(({node}) => Math.ceil(node.getComputedTextLength()) + 10));
    chart.plot = Math.max(1,width - chart.left - 12);
    const scale = chart.plot / 825;
    const x = value => chart.left + (Number(value) - 50) * scale;
    svg.setAttribute('viewBox','0 0 ' + width + ' 260');
    for (const {node,attrs} of chart.nodes) {
      for (const key of ['x','x1','x2','cx']) if (key in attrs) node.setAttribute(key,String(x(attrs[key])));
      if ('width' in attrs) node.setAttribute('width',String(Number(attrs.width) * scale));
      if ('points' in attrs) node.setAttribute('points',attrs.points.split(' ').map(point => {
        const [px,py] = point.split(','); return x(px) + ',' + py;
      }).join(' '));
      if (node.tagName === 'text' && Number(node.getAttribute('y')) < 240) node.setAttribute('x',String(chart.left - 8));
    }
    const ticks = chart.nodes.filter(({node}) => node.tagName === 'text' && Number(node.getAttribute('y')) >= 240);
    ticks.forEach(({node}) => { node.style.display = ''; });
    let edge = -Infinity;
    const last = ticks[ticks.length - 1];
    const lastWidth = last?.node.getComputedTextLength() || 0;
    const lastX = last ? Math.min(width - lastWidth / 2 - 2,x(last.attrs.x)) : width;
    ticks.forEach(({node,attrs},i) => {
      const size = node.getComputedTextLength();
      const px = Math.min(width - size / 2 - 2,Math.max(size / 2 + 2,x(attrs.x)));
      const show = i === ticks.length - 1 || (px - size / 2 >= edge + 12 && px + size / 2 < lastX - lastWidth / 2 - 12);
      node.style.display = show ? '' : 'none'; node.setAttribute('x',String(px));
      if (show) edge = px + size / 2;
    });
    chart.select?.(chart.index);
  }
  function disclosure(title, className) {
    const details = document.createElement('details');
    details.className = 'cl-disclosure ' + className;
    const summary = document.createElement('summary'); summary.textContent = title;
    const body = document.createElement('div'); body.className = 'cl-disclosure-body';
    details.append(summary, body);
    return { details, summary, body };
  }
  function glyph(name) {
    const icon = document.createElement('i');
    if (window.lucide) icon.dataset.lucide = name;
    else icon.className = 'fa fa-' + ({'list-filter':'filter','rotate-ccw':'undo','circle-plus':'plus-circle','ban':'ban','eye':'eye','list':'list','sliders-horizontal':'sliders','check':'check'}[name] || name);
    icon.setAttribute('aria-hidden', 'true');
    return icon;
  }
  function tool(element, name, title, label) {
    element.replaceChildren(glyph(name));
    element.title = title; element.setAttribute('aria-label', title);
    element.classList.add('cl-tool');
    if (label) { const text = document.createElement('span'); text.textContent = label; element.append(text); }
  }
  function popup(control, name, title, label) {
    control.details.classList.add('cl-popup');
    tool(control.summary, name, title, label);
    return control;
  }
  function fitPopup(item) {
    const body = item.querySelector('.cl-disclosure-body,.profile-picker-body');
    if (!body) return;
    body.style.translate = ''; body.style.top = ''; body.style.bottom = ''; body.style.maxHeight = '';
    const workspace = root.getBoundingClientRect();
    const leftEdge = Math.max(12, workspace.left + 12);
    const rightEdge = Math.min(document.documentElement.clientWidth - 12, workspace.right - 12);
    body.style.maxWidth = Math.max(0, rightEdge - leftEdge) + 'px';
    const trigger = item.querySelector('summary').getBoundingClientRect();
    const topEdge = Math.max(12,(document.querySelector('.topbar,.main-header')?.getBoundingClientRect().bottom || 0) + 12);
    const below = innerHeight - trigger.bottom - 18, above = trigger.top - topEdge - 6;
    const height = body.getBoundingClientRect().height;
    const upward = below < Math.min(height,200) && above > below;
    body.style.maxHeight = Math.max(80,Math.min(520,upward ? above : below)) + 'px';
    if (upward) { body.style.top = 'auto'; body.style.bottom = 'calc(100% + 6px)'; }
    const rect = body.getBoundingClientRect();
    const shift = rect.left < leftEdge ? leftEdge - rect.left : rect.right > rightEdge ? rightEdge - rect.right : 0;
    if (shift) body.style.translate = shift + 'px 0';
  }
  const metricLabels = {
    profileViews:'Просмотры', favorites:'Избранное', newDialogs:'Новые чаты', newPings:'Новые пинги',
    clientMessages:'Сообщ. клиента', expertMessages:'Сообщ. эксперта', paidConsultations:'Платные конс.',
    repeatExpert:'Повт. эксперта', repeatPlatform:'Повт. сайта', pairLTV:'LTV пары',
    platformLTV:'LTV клиента', blocks:'Блокировки', reports:'Жалобы'
  };
  if (root.classList.contains('interactions-page')) {
    const kpiLabels = { metricExperts:byId('expertId').value !== '0' ? 'Профиль с активностью' : 'Активные эксперты', metricPairs:'Пары', metricMessages:'Сообщения', metricActions:'Активность' };
    Object.entries(kpiLabels).forEach(([id,label]) => { byId(id).previousElementSibling.textContent = label; });
    byId('metricNewChats').previousElementSibling.textContent = 'Новые чаты';
    byId('metricNewPings').previousElementSibling.textContent = 'Новые пинги';
    const summaryGrid = root.querySelector('.summary-grid');
    // The 15.10 reconciliation keeps repeats in the table/charts, not extra KPI cards.
    ['riskRepeatExpert','riskRepeatPlatform'].forEach(id => { const card = byId(id)?.closest('.panel'); if (card) card.hidden = true; });
    const secondary = [...summaryGrid.children].filter(item => !item.classList.contains('metric') && !item.hidden);
    const more = disclosure('Другие показатели', 'cl-summary-more');
    more.body.classList.add('cl-summary-grid');
    more.body.append(...secondary); summaryGrid.append(more.details);
    const filters = byId('reportFilters');
    const advanced = disclosure('Дополнительные фильтры', 'cl-extra-filters');
    advanced.body.classList.add('cl-extra-fields');
    ['direction','minActions'].forEach(id => advanced.body.append(byId(id).closest('label')));
    const actions = filters.querySelector('.filter-actions');
    const defaults = Object.fromEntries(['period','fromDate','toDate'].map(id => [id,byId(id).value]));
    const reset = document.createElement('button');
    reset.type = 'button'; reset.id = 'clResetFilters'; reset.className = 'secondary'; reset.textContent = 'Сбросить';
    reset.addEventListener('click', () => {
      if (byId('apply').disabled) return;
      if (byId('profileSearch')) { byId('profileSearch').value = ''; byId('profileSearch').dispatchEvent(new Event('input', { bubbles:true })); }
      byId('selectAllProfiles')?.click();
      Object.entries({ ...defaults, direction:'all', query:'', minActions:'0' }).forEach(([id,value]) => {
        byId(id).value = value;
        byId(id).dispatchEvent(new Event('change', { bubbles:true }));
      });
      byId('apply').click();
    });
    actions.insertBefore(reset,byId('restoreFilters'));
    actions.before(advanced.details);
    const period = byId('period').closest('label');
    const client = byId('query').closest('label');
    const dates = byId('customRange');
    filters.querySelector('.filter-heading').textContent = '';
    const heading = document.createElement('h2'); heading.id = 'filterTitle'; heading.textContent = 'Фильтры';
    filters.querySelector('.filter-heading').append(heading);
    if (byId('profilePicker')) filters.querySelector('.filter-heading').after(byId('profilePicker'));
    filters.insertBefore(period, advanced.details);
    filters.insertBefore(client, advanced.details);
    filters.insertBefore(dates, advanced.details);
    const settings = disclosure('Столбцы', 'cl-column-settings');
    const panel = byId('panel-table');
    const presets = byId('reportPresets');
    presets.after(settings.details);
    settings.body.append(root.querySelector('.metric-picker-head'), byId('actionLegend'));
    panel.querySelector('header h2').textContent = 'Клиенты и эксперты';
    root.querySelector('#presetTitle').textContent = 'Вид';
    const picker = byId('profilePicker');
    if (picker) {
      picker.querySelector('summary > span').textContent = 'Эксперты';
      document.addEventListener('click', event => { if (picker.open && !picker.contains(event.target) && !event.composedPath().includes(picker)) picker.open = false; });
    }
    root.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const details = event.target.closest('details') || root.querySelector('.cl-popup[open],#profilePicker[open]');
      if (details?.open) { event.preventDefault(); details.open = false; details.querySelector('summary').focus(); }
    });
    filters.addEventListener('click', event => {
      if (event.target.closest('#apply') && byId('minimumError')?.textContent) advanced.details.open = true;
    });
    root.classList.add('cl-data-workspace');
    root.prepend(filters);
    const datePicker = popup(disclosure('Период', 'cl-date-picker'), 'calendar-days', 'Выбрать период', 'Период');
    datePicker.body.append(period, dates);
    client.before(datePicker.details);
    client.classList.add('cl-client-search');
    client.prepend(glyph('search'));
    byId('query').placeholder = 'Клиент: имя или ID';
    tool(advanced.summary, 'list-filter', 'Дополнительные фильтры', 'Фильтры');
    advanced.details.classList.add('cl-popup');
    tool(reset, 'rotate-ccw', 'Сбросить все фильтры');
    tool(byId('restoreFilters'), 'undo-2', 'Отменить изменения фильтров');
    tool(byId('apply'), 'check', 'Применить фильтры', 'Применить');
    const selectionRow = document.createElement('div'); selectionRow.className = 'cl-filter-selection';
    const searchRow = document.createElement('div'); searchRow.className = 'cl-filter-search';
    if (picker) selectionRow.append(picker);
    selectionRow.append(datePicker.details, advanced.details);
    searchRow.append(client, actions);
    filters.append(selectionRow, searchRow);
    filters.append(byId('filterDraftStatus'));
    tool(settings.summary, 'columns-3', 'Выбрать столбцы');
    settings.details.classList.add('cl-popup');
    const views = popup(disclosure('Набор столбцов', 'cl-view-picker'), 'layout-list', 'Набор столбцов', 'Обзор');
    views.body.append(presets);
    presets.addEventListener('click', event => {
      if (event.target.closest('[data-preset]')) { views.details.open = false; views.summary.focus(); }
    });
    const tableTools = document.createElement('div'); tableTools.className = 'cl-table-tools';
    tableTools.setAttribute('role', 'group'); tableTools.setAttribute('aria-label', 'Инструменты таблицы');
    const sortPicker = popup(disclosure('Сортировка', 'cl-sort-picker'), 'arrow-down-wide-narrow', 'Сортировка таблицы');
    sortPicker.body.append(byId('sort').closest('label'));
    tableTools.append(views.details, settings.details, sortPicker.details);
    panel.querySelector('header').append(tableTools);
    tool(byId('prevPage'), 'chevron-left', 'Предыдущая страница');
    tool(byId('nextPage'), 'chevron-right', 'Следующая страница');
    byId('iconOnlyHeaders').closest('label').hidden = true;
    root.querySelector('.header-density').hidden = true;
    if (picker) {
      picker.querySelector('summary').prepend(glyph('users-round'));
      picker.querySelector('summary').title = 'Выбрать профили экспертов';
    }
    tool(byId('tab-table'), 'table-2', 'Взаимодействия', 'Взаимодействия');
    tool(byId('tab-charts'), 'chart-no-axes-combined', 'Графики', 'Графики');
    const summaryButton = more.summary;
    more.details.classList.add('cl-popup');
    tool(summaryButton, 'chart-no-axes-column-increasing', 'Все показатели выборки');
    const freshness = document.createElement('span'); freshness.className = 'cl-freshness';
    freshness.id = 'clFreshness'; freshness.setAttribute('aria-hidden', 'true');
    root.querySelector('#reportOverview').append(freshness);
    const overview = byId('reportOverview');
    const context = document.createElement('div'); context.className = 'cl-report-context';
    context.append(byId('appliedScope'), freshness);
    byId('reportTabs').before(context);
    overview.classList.add('panel', 'tab-panel', 'cl-overview-panel');
    overview.dataset.panel = 'summary'; overview.setAttribute('role', 'tabpanel');
    overview.setAttribute('aria-labelledby', 'cl-tab-summary'); overview.tabIndex = 0;
    byId('reportTabs').after(overview);
    const summaryTab = document.createElement('button'); summaryTab.type = 'button';
    summaryTab.id = 'cl-tab-summary'; summaryTab.dataset.tab = 'summary';
    summaryTab.setAttribute('role', 'tab'); summaryTab.setAttribute('aria-controls', overview.id);
    tool(summaryTab, 'layout-dashboard', 'Сводка', 'Сводка');
    byId('reportTabs').prepend(summaryTab);
    const groups = document.createElement('div'); groups.className = 'cl-summary-sections';
    [['Диалоги','messages-square'],['Качество ответов','message-circle-reply'],['Результат и риски','shield-alert']].forEach(([label,icon], index) => {
      const section = document.createElement('section'); const heading = document.createElement('h3');
      heading.append(glyph(icon), document.createTextNode(label)); section.append(heading);
      section.append(...secondary.slice(index * 4, index * 4 + 4)); groups.append(section);
    });
    overview.append(groups); more.details.remove();
    function selectSummary(update) {
      if (update) history.replaceState(null, '', '#summary');
      root.querySelectorAll('[data-tab]').forEach(button => {
        const selected = button === summaryTab;
        button.classList.toggle('active', selected); button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1;
      });
      root.querySelectorAll('.tab-panel').forEach(panel => { panel.hidden = byId('loadStatus').classList.contains('denied') || panel !== overview; });
    }
    summaryTab.addEventListener('click', () => selectSummary(true));
    root.addEventListener('keydown', event => {
      const tabs = [...byId('reportTabs').querySelectorAll('[role=tab]')];
      if (!tabs.includes(event.target) || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault(); event.stopImmediatePropagation();
      const current = tabs.indexOf(event.target);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].click(); tabs[next].focus();
    }, true);
    window.addEventListener('hashchange', () => { if (location.hash === '#summary') selectSummary(false); });
    selectSummaryView = selectSummary;
    const chartControls = root.querySelector('.chart-controls');
    const chartTypeSelect = byId('chartType');
    const chartExtra = popup(disclosure('Параметры графика', 'cl-chart-options'), 'sliders-horizontal', 'Параметры графика');
    ['chartType', 'chartCompare', 'chartGranularity'].forEach(id => chartExtra.body.append(byId(id).closest('label')));
    const chartTypes = document.createElement('div'); chartTypes.className = 'cl-chart-types';
    chartTypes.setAttribute('role', 'group'); chartTypes.setAttribute('aria-label', 'Тип графика');
    const typeIcons = { line:'chart-no-axes-combined', bar:'chart-column', stacked:'chart-column-stacked', pie:'chart-pie', table:'table-2' };
    [...chartTypeSelect.options].forEach(option => {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.clChartType = option.value;
      tool(button, typeIcons[option.value], option.textContent);
      button.addEventListener('click', () => {
        byId('chartType').value = button.dataset.clChartType;
        byId('chartType').dispatchEvent(new Event('change', { bubbles:true }));
      });
      chartTypes.append(button);
    });
    chartTypeSelect.closest('label').classList.add('cl-chart-type-field');
    const series = popup(disclosure('Участники графика', 'cl-chart-series'), 'users-round', 'Участники графика');
    series.body.append(root.querySelector('.chart-participants'));
    chartControls.append(chartTypes, chartExtra.details, series.details);
    document.addEventListener('click', event => {
      const applying = event.target.closest('#apply');
      const invalidMenu = applying && (byId('dateError').textContent ? datePicker.details : byId('minimumError').textContent ? advanced.details : byId('profileSelectionError')?.textContent ? picker : null);
      root.querySelectorAll('.cl-popup[open],#profilePicker[open]').forEach(item => {
        if (item !== invalidMenu && !item.contains(event.target) && !event.composedPath().includes(item)) item.open = false;
      });
      if (invalidMenu) {
        invalidMenu.open = true;
        (invalidMenu === datePicker.details ? byId('fromDate') : invalidMenu === advanced.details ? byId('minActions') : byId('profileSearch')).focus();
      }
    });
    root.addEventListener('change', event => {
      if (event.target.id === 'period' && event.target.value !== 'custom') datePicker.details.open = false;
    });
    root.addEventListener('toggle', event => {
      if (event.target.open && event.target.matches('.cl-popup,#profilePicker')) fitPopup(event.target);
    }, true);
    window.addEventListener('resize', () => root.querySelectorAll('.cl-popup[open],#profilePicker[open]').forEach(fitPopup));
    new ResizeObserver(() => root.querySelectorAll('.cl-popup[open],#profilePicker[open]').forEach(fitPopup)).observe(root);
    const originalDateError = byId('dateError');
    new MutationObserver(() => {
      if (originalDateError.textContent) { datePicker.details.open = true; byId('fromDate').focus(); }
    }).observe(originalDateError, { childList:true });
  }
  let lastMinimumError = '';
  function presentHeaders() {

    if (byId('chartMetric')) for (const [value,label] of [['newDialogs','Новые чаты'],['newPings','Новые пинги']]) {
      const option = byId('chartMetric').querySelector('option[value="' + value + '"]');
      if (option && option.textContent !== label) option.textContent = label;
    }
    const apply = byId('apply');
    if (apply?.textContent === 'Применить фильтры') tool(apply, 'check', 'Применить фильтры', 'Применить');
    root.querySelectorAll('.sort-button[data-sort-key]').forEach(button => {
      const span = button.querySelector('.header-label'), title = metricLabels[button.dataset.sortKey];
      if (span && title && span.textContent !== title) span.textContent = title;
      if (title) {
        button.closest('th').style.minWidth = '86px';
        button.closest('th').style.width = '86px';
      }
    });
    const interactionTable = byId('interactionTable');
    if (interactionTable) interactionTable.style.minWidth = ((matchMedia('(max-width:767px)').matches ? 148 : 360) + interactionTable.querySelectorAll('th.col-action').length * 86) + 'px';
    const count = byId('metricSelectionCount');
    const summary = root.querySelector('.cl-column-settings > summary');
    if (count && summary) {
      const value = count.textContent.replace(/^Выбрано\s*/,'');
      const text = value.split(' из ')[0];
      summary.title = 'Столбцы: ' + value; summary.setAttribute('aria-label', summary.title);
      let badge = summary.querySelector('.cl-badge');
      if (!badge) { badge = document.createElement('span'); badge.className = 'cl-badge'; summary.append(badge); }
      if (badge.textContent !== text) badge.textContent = text;
    }
    const minimum = byId('minActions');
    if (minimum && minimum.previousElementSibling.textContent !== 'Мин. активности') minimum.previousElementSibling.textContent = 'Мин. активности';
    const extra = root.querySelector('.cl-extra-filters');
    if (extra) {
      const active = Number(byId('direction').value !== 'all') + Number(Number(minimum.value) > 0);
      const summary = extra.firstElementChild;
      let badge = summary.querySelector('.cl-badge');
      if (!badge) { badge = document.createElement('span'); badge.className = 'cl-badge'; summary.append(badge); }
      if (badge.textContent !== String(active)) badge.textContent = String(active);
      badge.hidden = !active;
      summary.setAttribute('aria-label', 'Дополнительные фильтры: ' + active);
      const error = byId('minimumError').textContent;
      if (error && error !== lastMinimumError && !extra.open) { extra.open = true; minimum.focus(); }
      lastMinimumError = error;
      byId('clResetFilters').disabled = byId('apply').disabled;
      const periodSummary = root.querySelector('.cl-date-picker > summary span');
      const from = byId('fromDate').value.split('-').reverse();
      const to = byId('toDate').value.split('-').reverse();
      const customText = from[2] !== to[2] ? from.join('.') + ' — ' + to.join('.') : from.slice(0,2).join('.') + ' — ' + to.slice(0,2).join('.') + '.' + (to[2] || '').slice(-2);
      const shortCustom = matchMedia('(max-width:359px)').matches && from[2] === to[2]
        ? from.slice(0,2).join('.') + ' — ' + to.slice(0,2).join('.') : customText;
      const periodText = byId('period').value === 'custom' ? shortCustom : byId('period').selectedOptions[0].text;
      if (periodSummary.textContent !== periodText) periodSummary.textContent = periodText;
      const fullPeriod = byId('period').value === 'custom' ? from.join('.') + ' — ' + to.join('.') : periodText;
      const periodControl = root.querySelector('.cl-date-picker > summary');
      periodControl.title = 'Период: ' + fullPeriod;
      periodControl.setAttribute('aria-label', 'Выбрать период: ' + fullPeriod);
      const selectedView = root.querySelector('[data-preset][aria-pressed="true"]');
      const viewLabel = root.querySelector('.cl-view-picker > summary span');
      const viewText = selectedView?.textContent || 'Свой набор';
      if (viewLabel.textContent !== viewText) viewLabel.textContent = viewText;
      const seriesSummary = root.querySelector('.cl-chart-series > summary');
      root.querySelectorAll('[data-cl-chart-type]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.clChartType === byId('chartType').value));
        button.disabled = [...byId('chartType').options].find(option => option.value === button.dataset.clChartType)?.disabled !== false;
      });
      const chartOptions = root.querySelector('.cl-chart-options > summary');
      const extraChartCount = Number(byId('chartCompare').value !== 'none') + Number(byId('chartGranularity').value !== 'day');
      let optionsBadge = chartOptions.querySelector('.cl-badge');
      if (!optionsBadge) { optionsBadge = document.createElement('span'); optionsBadge.className = 'cl-badge'; chartOptions.append(optionsBadge); }
      if (optionsBadge.textContent !== String(extraChartCount)) optionsBadge.textContent = String(extraChartCount);
      optionsBadge.hidden = !extraChartCount;
      chartOptions.title = 'Параметры графика: ' + byId('chartType').selectedOptions[0].textContent + ', ' + (byId('chartCompare').selectedOptions[0]?.textContent || 'Недоступно') + ', ' + (byId('chartGranularity').selectedOptions[0]?.textContent || 'Недоступно');
      chartOptions.setAttribute('aria-label', chartOptions.title);
      const seriesText = byId('chartSelectionCount').textContent;
      seriesSummary.title = 'Участники графика: ' + seriesText;
      seriesSummary.setAttribute('aria-label', seriesSummary.title);
      let seriesBadge = seriesSummary.querySelector('.cl-badge');
      if (!seriesBadge) { seriesBadge = document.createElement('span'); seriesBadge.className = 'cl-badge'; seriesSummary.append(seriesBadge); }
      const seriesCount = seriesText.replace('Выбрано ', '').replace(' из ','/');
      if (seriesBadge.textContent !== seriesCount) seriesBadge.textContent = seriesCount;
      const fresh = byId('clFreshness');
      const profileSummary = root.querySelector('#profilePicker > summary');
      if (profileSummary) profileSummary.setAttribute('aria-label','Профили экспертов: ' + byId('profileSelectionCount').textContent);
      if (fresh.textContent !== byId('loadStatus').textContent) fresh.textContent = byId('loadStatus').textContent;
        root.querySelectorAll('#interactionTable tbody tr').forEach(row => {
        if (row.children.length < 3 || row.querySelector('.cl-peer')) return;
        const peer = document.createElement('span'); peer.className = 'cl-peer';
        peer.textContent = '\u2192 ' + [...row.children[1].querySelectorAll('.user-name,.user-sub')].map(item => item.textContent).join(' · ');
        row.children[0].append(peer);
      });
      root.querySelectorAll('#interactionTable .pair-ref:not([data-cl-reference])').forEach(link => {
        link.dataset.clReference = 'true';
        const name = link.textContent.trim();
        link.setAttribute('aria-label', name + '. ' + link.title);
        const label = document.createElement('span'); label.textContent = 'Учтено';
        link.replaceChildren(glyph('corner-up-left'), label);
      });
      const totals = root.querySelector('#interactionTable tfoot tr > td');
        if (totals) totals.colSpan = matchMedia('(max-width:767px)').matches ? 1 : 2;
      const identityHead = root.querySelector('#interactionTable thead th');
      if (identityHead) {
          const text = matchMedia('(max-width:767px)').matches ? 'Кто → кому' : 'Кто';
        if (identityHead.textContent !== text) identityHead.textContent = text;
      }
      if (location.hash === '#summary') selectSummaryView(false);
      else {
        byId('reportOverview').hidden = true;
        byId('cl-tab-summary').setAttribute('aria-selected', 'false'); byId('cl-tab-summary').tabIndex = -1;
      }
      fitChart();
      if (root.querySelector('i[data-lucide]')) window.lucide.createIcons({ root, attrs: { width:16, height:16, 'stroke-width':1.7 } });
    }
  }
  presentHeaders();
  // Existing renderers rebuild table headers and partner detail tabs.
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; presentHeaders(); });
  }).observe(root, { childList:true, subtree:true });
  window.addEventListener('resize', presentHeaders);
  if (byId('chartGrid')) {
    new ResizeObserver(fitChart).observe(byId('chartGrid'));
    document.fonts.ready.then(() => {
      const svg = root.querySelector('#chartGrid .line-chart');
      const chart = svg && chartGeometry.get(svg);
      if (chart) chart.width = 0;
      fitChart();
    });
  }
  root.dataset.sharedUiReady = 'true';
  root.dataset.sharedUiVersion = '6';
})();
