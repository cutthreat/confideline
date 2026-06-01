(async function () {
  const fixtureUrl = 'fixtures/partner-interactions.fixture.json';
  const response = await fetch(fixtureUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Cannot load offline fixture: ' + response.status);
  }

  const baseFixture = await response.json();
  let fixture = window.PartnerInteractionSimulator.cloneFixture(baseFixture);
  const rng = window.PartnerInteractionSimulator.createRng(Date.now());
  let generatedEvents = [];
  let autoTimer = null;
  const params = new URLSearchParams(window.location.search);
  const debugMode = params.get('debug') === '1';
  const initialTab = ['table', 'charts'].includes(params.get('tab')) ? params.get('tab') : 'table';
  const audience = document.body.dataset.audience || 'admin';
  document.body.classList.toggle('debug-mode', debugMode);
  const state = {
    partnerId: Number(document.body.dataset.partnerId || fixture.meta.defaultPartnerId),
    expertId: Number(document.body.dataset.expertId || 0),
    period: fixture.meta.defaultPeriod,
    direction: fixture.meta.defaultDirection,
    query: '',
    minActions: 0,
    sort: 'total_desc',
    page: 1,
    pageSize: 50,
    activeTab: initialTab,
    chartMetric: 'total',
    chartDimension: '',
    chartType: 'line',
    chartCompare: 'none',
    chartGranularity: 'day',
    chartEntities: []
  };

  const fields = {
    partnerId: document.querySelector('#partnerId'),
    expertId: document.querySelector('#expertId'),
    period: document.querySelector('#period'),
    direction: document.querySelector('#direction'),
    query: document.querySelector('#query'),
    minActions: document.querySelector('#minActions'),
    sort: document.querySelector('#sort'),
    pageSize: document.querySelector('#pageSize'),
    experts: document.querySelector('#experts'),
    rowCount: document.querySelector('#rowCount'),
    pageInfo: document.querySelector('#pageInfo'),
    chartTitle: document.querySelector('#chartTitle'),
    chartScope: document.querySelector('#chartScope'),
    chartGrid: document.querySelector('#chartGrid'),
    chartInsight: document.querySelector('#chartInsight'),
    chartMetric: document.querySelector('#chartMetric'),
    chartDimension: document.querySelector('#chartDimension'),
    chartType: document.querySelector('#chartType'),
    chartCompare: document.querySelector('#chartCompare'),
    chartGranularity: document.querySelector('#chartGranularity'),
    chartEntities: document.querySelector('#chartEntities'),
    payloadLog: document.querySelector('#payloadLog'),
    eventLog: document.querySelector('#eventLog')
  };

  populatePartnerOptions();
  populateExpertOptions();
  if (fields.partnerId) fields.partnerId.value = state.partnerId;
  if (fields.expertId) fields.expertId.value = state.expertId;
  fields.period.value = state.period;
  fields.direction.value = state.direction;
  if (fields.sort) fields.sort.value = state.sort;
  if (fields.pageSize) fields.pageSize.value = state.pageSize;

  initTabs();
  initTableSorting();
  render();
  document.body.dataset.ready = 'true';

  document.querySelector('#apply').addEventListener('click', () => {
    readFilters();
    state.page = 1;
    render();
    sendPayload('apply');
  });

  on('#partnerId', 'change', () => {
    if (!fields.partnerId || fields.partnerId.tagName !== 'SELECT') return;
    state.partnerId = Number(fields.partnerId.value || 0);
    state.expertId = 0;
    state.chartDimension = '';
    state.chartEntities = [];
    populateExpertOptions();
    writeFilters();
    render();
  });

  ['#chartMetric', '#chartDimension', '#chartType', '#chartCompare', '#chartGranularity', '#chartEntities'].forEach(selector => {
    on(selector, 'change', () => {
      readChartControls();
      render();
    });
  });

  on('#prevPage', 'click', () => {
    if (state.page > 1) {
      state.page--;
      render();
      sendPayload('prevPage', false);
    }
  });

  on('#nextPage', 'click', () => {
    readFilters(false);
    const result = window.PartnerInteractionAnalytics.build(fixture, { ...state, audience });
    if (state.page < result.pagination.totalPages) {
      state.page++;
      render();
      sendPayload('nextPage', false);
    }
  });

  on('#randomFilters', 'click', () => {
    Object.assign(state, window.PartnerInteractionSimulator.randomFilters(fixture, rng));
    if (audience === 'partner') {
      state.partnerId = Number(document.body.dataset.partnerId || fixture.meta.defaultPartnerId);
    }
    if (audience === 'expert') {
      state.expertId = Number(document.body.dataset.expertId || state.expertId);
    }
    state.page = 1;
    populateExpertOptions();
    writeFilters();
    render();
    sendPayload('randomFilters');
  });

  on('#sendPayload', 'click', () => {
    readFilters();
    render();
    sendPayload('manual');
  });

  on('#addEvent', 'click', () => {
    addGeneratedEvents(1);
  });

  on('#addBatch', 'click', () => {
    addGeneratedEvents(10);
  });

  on('#resetFixture', 'click', () => {
    fixture = window.PartnerInteractionSimulator.cloneFixture(baseFixture);
    generatedEvents = [];
    stopAutoStream();
    Object.assign(state, {
      partnerId: Number(document.body.dataset.partnerId || fixture.meta.defaultPartnerId),
      expertId: Number(document.body.dataset.expertId || 0),
      period: fixture.meta.defaultPeriod,
      direction: fixture.meta.defaultDirection,
      query: '',
      minActions: 0,
      sort: 'total_desc',
      page: 1,
      pageSize: 50
    });
    populateExpertOptions();
    writeFilters();
    render();
    sendPayload('reset');
  });

  on('#autoStream', 'click', () => {
    if (autoTimer) {
      stopAutoStream();
      return;
    }
    document.querySelector('#autoStream').classList.add('is-active');
    document.querySelector('#autoStream').textContent = 'Остановить автопоток';
    autoTimer = setInterval(() => addGeneratedEvents(1, 'autoStream'), 1200);
  });

  function render() {
    const result = window.PartnerInteractionAnalytics.build(fixture, { ...state, audience });
    if (fields.experts) {
      fields.experts.value = formatExpertScope(result.experts);
    }
    text('#metricExperts', result.summary.experts);
    text('#metricPairs', result.summary.pairs);
    text('#metricMessages', result.summary.messages);
    text('#metricActions', result.summary.actions);
    text('#qualityClients', result.qualitySummary.activeClients);
    text('#qualityClientDialogs', result.qualitySummary.clientStartedDialogs);
    text('#qualityAnswered', result.qualitySummary.answeredDialogs);
    text('#qualityNoAnswer', result.qualitySummary.unansweredDialogs);
    text('#qualityResponseRate', result.qualitySummary.responseRate === null ? 'Нет' : result.qualitySummary.responseRate + '%');
    text('#qualityOutboundOnly', result.qualitySummary.outboundWithoutClientMessage);
    text('#riskReports', result.riskSummary.reports);
    text('#riskBlocks', result.riskSummary.blocks);
    text('#riskPaidConsultations', result.riskSummary.paidConsultations);
    text('#riskHighActivity', result.riskSummary.highActivityPairs);
    text('#mode', result.meta.mode);
    text('#range', result.meta.rangeLabel);
    text('#assignmentSource', result.meta.assignmentSource);
    text('#rowCount', result.pagination.totalRows + ' строк');
    text('#pageInfo', result.pagination.from + '-' + result.pagination.to + ' из ' + result.pagination.totalRows);
    text('#partnerBadge', result.meta.partnerId > 0 ? 'Партнер #' + result.meta.partnerId : 'Все Партнеры');
    if (audience === 'partner') {
      const partner = fixture.users.find(user => user.id === result.meta.partnerId);
      text('#partnerBadge', partner ? partner.name : 'Мой кабинет');
    } else if (audience === 'expert') {
      const expert = fixture.users.find(user => user.id === result.meta.expertId);
      text('#partnerBadge', expert ? expert.name : 'Анкета эксперта');
    }
    text('#periodBadge', result.meta.periodLabel);

    document.querySelector('#warnings').innerHTML = result.warnings
      .map(warning => '<p>' + escapeHtml(warning) + '</p>')
      .join('');

    const table = document.querySelector('#interactionTable');
    const legend = document.querySelector('#actionLegend');
    if (legend) {
      legend.innerHTML = renderActionLegend(result.columns);
    }
    table.querySelector('thead').innerHTML = renderHead(result.columns);
    table.querySelector('tbody').innerHTML = result.rows.length
      ? result.rows.map(row => renderRow(row, result.columns)).join('')
      : '<tr><td colspan="' + (result.columns.length + 4) + '" class="empty">Нет взаимодействий по выбранным фильтрам</td></tr>';
    setDisabled('#prevPage', result.pagination.page <= 1);
    setDisabled('#nextPage', result.pagination.page >= result.pagination.totalPages);
    renderCharts(result);
    setActiveTab(state.activeTab);
    renderEventLog();
    sendPayload('render', false);
  }

  function addGeneratedEvents(count, trigger = 'generate') {
    readFilters();
    const events = [];
    for (let index = 0; index < count; index++) {
      events.push(window.PartnerInteractionSimulator.generateEvent(fixture, state, rng));
    }
    window.PartnerInteractionSimulator.applyEvents(fixture, events);
    generatedEvents.push(...events);
    render();
    sendPayload(trigger, true);
  }

  function sendPayload(trigger, flash = true) {
    if (!fields.payloadLog) {
      return;
    }
    const result = window.PartnerInteractionAnalytics.build(fixture, { ...state, audience });
    const payload = window.PartnerInteractionSimulator.buildPayload(fixture, { ...state, audience }, result, trigger, generatedEvents);
    fields.payloadLog.textContent = JSON.stringify(payload, null, 2);
    if (flash) {
      fields.payloadLog.classList.remove('pulse');
      void fields.payloadLog.offsetWidth;
      fields.payloadLog.classList.add('pulse');
    }
  }

  function renderEventLog() {
    const latest = generatedEvents.slice(-8).reverse();
    if (!fields.eventLog) {
      return;
    }
    fields.eventLog.innerHTML = latest.length
      ? latest.map(event => '<li><strong>' + escapeHtml(event.type) + '</strong> ' + event.actorId + ' -> ' + event.targetId + ' <span>x' + event.count + '</span></li>').join('')
      : '<li class="muted">Сгенерированных событий пока нет</li>';
  }

  function initTabs() {
    document.querySelectorAll('.view-tabs [data-tab]').forEach(button => {
      button.addEventListener('click', () => setActiveTab(button.dataset.tab));
    });
  }

  function initTableSorting() {
    const table = document.querySelector('#interactionTable');
    if (!table) return;
    table.addEventListener('click', event => {
      const button = event.target.closest('[data-sort-key]');
      if (!button) return;
      state.sort = nextSortValue(button.dataset.sortKey);
      ensureSortOption(state.sort, button.dataset.sortLabel || button.textContent.trim());
      state.page = 1;
      render();
      sendPayload('sort', false);
    });
  }

  function setActiveTab(tab) {
    const target = document.querySelector('.tab-panel[data-panel="' + tab + '"]') ? tab : 'table';
    state.activeTab = target;
    document.querySelectorAll('.view-tabs [data-tab]').forEach(button => {
      button.classList.toggle('active', button.dataset.tab === target);
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.hidden = panel.dataset.panel !== target;
    });
  }

  function renderCharts(result) {
    if (!fields.chartGrid) {
      return;
    }

    const mode = resolveChartMode(result);
    syncChartControls(result, mode);
    const selected = getSelectedChartEntities(result, mode);
    const comparison = buildComparisonDataset(result, mode, selected);

    fields.chartTitle.textContent = mode.title;
    fields.chartScope.textContent = mode.scope;
    fields.chartGrid.innerHTML = renderAnalyticsReport(comparison, mode);
    fields.chartInsight.textContent = buildChartInsight(result, comparison, mode);
  }

  function resolveChartMode(result) {
    const available = getChartDimensions(result);
    if (!state.chartDimension || !available.some(item => item.value === state.chartDimension)) {
      state.chartDimension = getDefaultChartDimension();
    }
    const type = state.chartDimension;

    if (audience === 'admin') {
      return {
        type,
        title: chartDimensionTitle(type),
        scope: Number(state.partnerId) === 0 ? 'Все Партнеры, ' + result.meta.periodLabel.toLowerCase() : getUserName(state.partnerId, 'Партнер #' + state.partnerId)
      };
    }

    if (audience === 'partner') {
      return {
        type,
        title: chartDimensionTitle(type),
        scope: getUserName(state.partnerId, 'Партнер #' + state.partnerId)
      };
    }

    return {
      type,
      title: chartDimensionTitle(type),
      scope: getUserName(state.expertId, 'Эксперт #' + state.expertId)
    };
  }

  function syncChartControls(result, mode) {
    syncSelect(fields.chartMetric, [
      ['total', 'Все действия'],
      ['profileViews', 'Просмотры анкет'],
      ['favorites', 'Добавления в избранное'],
      ['clientStartedDialogs', 'Начатые диалоги'],
      ['clientMessages', 'Сообщения клиентов'],
      ['expertReplies', 'Ответы экспертов'],
      ['paidConsultations', 'Оплаты консультаций'],
      ['repeatRequests', 'Повторные обращения'],
      ['risk', 'Жалобы + блокировки']
    ], state.chartMetric);

    syncSelect(fields.chartDimension, getChartDimensions(result).map(item => [item.value, item.label]), state.chartDimension);
    syncSelect(fields.chartType, [
      ['line', 'Линии по времени'],
      ['bar', 'Столбцы по участникам'],
      ['stacked', 'Структура действий'],
      ['pie', 'Доля участников'],
      ['table', 'Таблица сравнения']
    ], state.chartType);
    syncSelect(fields.chartCompare, [
      ['none', 'Без сравнения'],
      ['previous', 'С предыдущим периодом'],
      ['segments', 'Сравнить выбранных']
    ], state.chartCompare);
    syncSelect(fields.chartGranularity, [
      ['day', 'День'],
      ['week', 'Неделя'],
      ['month', 'Месяц']
    ], state.chartGranularity);

    syncEntitySelect(buildChartGroups(result.allRows, mode.type));
  }

  function syncSelect(element, options, value) {
    if (!element) return;
    const current = element.value;
    const selected = options.some(option => option[0] === value) ? value : options[0][0];
    const html = options.map(option => '<option value="' + escapeHtml(option[0]) + '">' + escapeHtml(option[1]) + '</option>').join('');
    if (element.innerHTML !== html) {
      element.innerHTML = html;
    }
    element.value = options.some(option => option[0] === current) ? current : selected;
    if (element === fields.chartMetric) state.chartMetric = element.value;
    if (element === fields.chartDimension) state.chartDimension = element.value;
    if (element === fields.chartType) state.chartType = element.value;
    if (element === fields.chartCompare) state.chartCompare = element.value;
    if (element === fields.chartGranularity) state.chartGranularity = element.value;
  }

  function syncEntitySelect(groups) {
    if (!fields.chartEntities) return;
    const previous = state.chartEntities.length
      ? new Set(state.chartEntities.map(String))
      : new Set(groups.slice(0, 4).map(group => String(group.id)));
    fields.chartEntities.innerHTML = groups.map((group, index) => {
      const checked = previous.has(String(group.id)) ? ' checked' : '';
      const id = 'chartEntity-' + index + '-' + String(group.id).replace(/[^a-zA-Z0-9_-]/g, '');
      return '<label class="checkbox-item" for="' + escapeHtml(id) + '" title="' + escapeHtml('Сравнить: ' + group.label + ', действий: ' + group.total) + '">' +
        '<input id="' + escapeHtml(id) + '" type="checkbox" value="' + escapeHtml(group.id) + '"' + checked + '>' +
        '<span>' + escapeHtml(group.label) + '</span>' +
        '<b>' + formatValue(group.total) + '</b>' +
        '</label>';
    }).join('');
    state.chartEntities = Array.from(fields.chartEntities.querySelectorAll('input[type="checkbox"]:checked')).map(input => input.value);
  }

  function readChartControls() {
    if (fields.chartMetric) state.chartMetric = fields.chartMetric.value;
    if (fields.chartDimension) {
      const previous = state.chartDimension;
      state.chartDimension = fields.chartDimension.value;
      if (previous !== state.chartDimension) {
        state.chartEntities = [];
      }
    }
    if (fields.chartType) state.chartType = fields.chartType.value;
    if (fields.chartCompare) state.chartCompare = fields.chartCompare.value;
    if (fields.chartGranularity) state.chartGranularity = fields.chartGranularity.value;
    if (fields.chartEntities) {
      state.chartEntities = Array.from(fields.chartEntities.querySelectorAll('input[type="checkbox"]:checked')).map(input => input.value);
    }
  }

  function getChartDimensions() {
    if (audience === 'admin') {
      return [
        { value: 'partner', label: 'Партнеры' },
        { value: 'expert', label: 'Анкеты' },
        { value: 'client', label: 'Клиенты' }
      ];
    }
    if (audience === 'partner') {
      return [
        { value: 'expert', label: 'Анкеты' },
        { value: 'client', label: 'Клиенты' }
      ];
    }
    return [
      { value: 'client', label: 'Клиенты' }
    ];
  }

  function getDefaultChartDimension() {
    if (audience === 'expert') return 'client';
    if (audience === 'partner') return 'expert';
    if (Number(state.expertId) > 0) return 'client';
    if (Number(state.partnerId) > 0) return 'expert';
    return 'partner';
  }

  function chartDimensionTitle(type) {
    if (type === 'partner') return 'Сравнение Партнеров';
    if (type === 'expert') return 'Сравнение экспертных анкет';
    return 'Сравнение клиентов';
  }

  function getSelectedChartEntities(result, mode) {
    const groups = buildChartGroups(result.allRows, mode.type);
    const selectedSet = new Set((state.chartEntities || []).map(String));
    const selected = selectedSet.size
      ? groups.filter(group => selectedSet.has(String(group.id)))
      : groups.slice(0, 4);
    return selected.length ? selected.slice(0, 6) : groups.slice(0, 4);
  }

  function buildComparisonDataset(result, mode, selected) {
    const currentRange = getActiveRange(0);
    const previousRange = state.chartCompare === 'previous' ? getActiveRange(-1) : null;
    const currentSeries = buildSeriesForGroups(mode.type, selected, currentRange);
    const previousSeries = previousRange ? buildSeriesForGroups(mode.type, selected, previousRange) : [];
    const rows = selected.map(group => {
      const current = currentSeries.find(series => series.id === group.id) || emptySeries(group);
      const previous = previousSeries.find(series => series.id === group.id) || emptySeries(group);
      return {
        ...group,
        value: current.total,
        previousValue: previous.total,
        delta: current.total - previous.total,
        series: current.points,
        previousSeries: previous.points,
        mix: buildActionMixForGroup(mode.type, group.id, currentRange)
      };
    });

    return {
      metric: getMetricLabel(state.chartMetric),
      rows,
      currentSeries,
      previousSeries,
      total: rows.reduce((sum, row) => sum + row.value, 0),
      previousTotal: rows.reduce((sum, row) => sum + row.previousValue, 0)
    };
  }

  function buildSeriesForGroups(type, groups, range) {
    const groupIds = new Set(groups.map(group => String(group.id)));
    const series = new Map(groups.map(group => [String(group.id), {
      id: group.id,
      label: group.label,
      points: makeBuckets(range).map(bucket => ({ ...bucket, value: 0 })),
      total: 0
    }]));

    fixture.events.forEach(event => {
      const groupId = getEventGroupId(event, type);
      if (!groupIds.has(String(groupId))) return;
      if (!eventMatchesCurrentScope(event)) return;
      const createdAt = new Date(event.createdAt);
      if (range.from && createdAt < range.from) return;
      if (range.to && createdAt > range.to) return;
      const value = getEventMetricValue(event);
      if (value === 0) return;
      const key = bucketKey(createdAt, state.chartGranularity);
      const item = series.get(String(groupId));
      const point = item.points.find(candidate => candidate.key === key);
      if (point) {
        point.value += value;
      }
      item.total += value;
    });

    return Array.from(series.values());
  }

  function renderAnalyticsReport(comparison, mode) {
    if (!comparison.rows.length) {
      return '<div class="analytics-empty">Нет данных для выбранного сравнения. Расширьте период или выберите других участников.</div>';
    }

    const chart = state.chartType === 'bar'
      ? renderCompareBars(comparison.rows)
      : state.chartType === 'stacked'
        ? renderStackedMix(comparison.rows)
        : state.chartType === 'pie'
          ? renderShareChart(comparison.rows)
          : state.chartType === 'table'
            ? renderCompareTable(comparison.rows)
            : renderLineChart(comparison);

    return '<div class="analytics-report">' +
      '<div class="analytics-main">' + chart + '</div>' +
      '<aside class="analytics-side">' +
        '<h3>Легенда сравнения</h3>' +
        '<div class="legend-list">' + comparison.rows.map((row, index) => renderLegendItem(row, index)).join('') + '</div>' +
        '<div class="compare-note">' + renderCompareNote(mode) + '</div>' +
      '</aside>' +
      '</div>' +
      '<div class="analytics-table">' + renderCompareTable(comparison.rows) + '</div>';
  }

  function renderLineChart(comparison) {
    const width = 760;
    const height = 236;
    const padding = { left: 52, right: 76, top: 16, bottom: 34 };
    const allPoints = comparison.rows.flatMap(row => row.series.concat(state.chartCompare === 'previous' ? row.previousSeries : []));
    const max = Math.max(...allPoints.map(point => point.value), 1);
    const count = Math.max(...comparison.rows.map(row => row.series.length), 1);
    const x = index => padding.left + (count === 1 ? 0 : index * (width - padding.left - padding.right) / (count - 1));
    const y = value => height - padding.bottom - value / max * (height - padding.top - padding.bottom);
    const gridParts = [0, .25, .5, .75, 1];
    const grid = gridParts.map(part => {
      const yy = y(max * part);
      return '<line x1="' + padding.left + '" y1="' + yy + '" x2="' + (width - padding.right) + '" y2="' + yy + '" class="grid-line"></line>';
    }).join('');
    const valueLabels = gridParts.map(part => {
      const value = Math.round(max * part);
      return '<text x="' + (padding.left - 8) + '" y="' + (y(max * part) + 4) + '">' + formatValue(value) + '</text>';
    }).join('');
    const lines = comparison.rows.map((row, index) => {
      const color = chartColor(index);
      const points = row.series.map((point, pointIndex) => x(pointIndex) + ',' + y(point.value)).join(' ');
      const previous = state.chartCompare === 'previous'
        ? '<polyline points="' + row.previousSeries.map((point, pointIndex) => x(pointIndex) + ',' + y(point.value)).join(' ') + '" class="chart-line previous" stroke="' + color + '"></polyline>'
        : '';
      const lastPointIndex = Math.max(0, row.series.length - 1);
      const lastPoint = row.series[lastPointIndex] || { value: 0 };
      const labelY = Math.min(height - padding.bottom - 4, Math.max(padding.top + 6, y(lastPoint.value)));
      const endLabel = '<text class="line-end-label" x="' + (x(lastPointIndex) + 8) + '" y="' + labelY + '" fill="' + color + '">' + escapeHtml(shortLabel(row.label)) + '</text>';
      return '<polyline points="' + points + '" class="chart-line" stroke="' + color + '"></polyline>' + previous + endLabel;
    }).join('');
    const labels = (comparison.rows[0]?.series || []).map((point, index) => '<text x="' + x(index) + '" y="' + (height - 10) + '">' + escapeHtml(point.label) + '</text>').join('');

    return '<div class="line-chart-card"><header><h3>' + escapeHtml(comparison.metric) + '</h3><span>' + escapeHtml(chartCompareLabel()) + '</span></header>' +
      '<svg class="line-chart" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="График сравнения">' +
      grid + '<g class="value-labels">' + valueLabels + '</g>' + lines + '<g class="axis-labels">' + labels + '</g></svg></div>';
  }

  function renderCompareBars(rows) {
    const max = Math.max(...rows.map(row => row.value), 1);
    return '<div class="compare-bars">' + rows.map((row, index) => {
      const width = row.value > 0 ? Math.round(row.value / max * 1000) / 10 : 0;
      return '<div class="compare-bar-row">' +
        '<div><b>' + escapeHtml(row.label) + '</b><span>' + escapeHtml(row.sub || '') + '</span></div>' +
        '<div class="compare-bar-track"><i style="width:' + width + '%;background:' + chartColor(index) + '"></i></div>' +
        '<strong>' + formatValue(row.value) + '</strong>' +
        '</div>';
    }).join('') + '</div>';
  }

  function renderStackedMix(rows) {
    return '<div class="stacked-list">' + rows.map((row, rowIndex) => {
      const total = Math.max(row.mix.reduce((sum, item) => sum + item.value, 0), 1);
      return '<div class="stacked-row"><header><b>' + escapeHtml(row.label) + '</b><strong>' + formatValue(row.value) + '</strong></header>' +
        '<div class="stacked-track">' + row.mix.map((item, itemIndex) => {
          const width = Math.round(item.value / total * 1000) / 10;
          return '<i title="' + escapeHtml(item.label + ': ' + item.value) + '" style="width:' + width + '%;background:' + chartColor(itemIndex + rowIndex) + '"></i>';
        }).join('') + '</div>' +
        '<p>' + row.mix.map(item => escapeHtml(item.label + ' ' + item.value)).join(' · ') + '</p></div>';
    }).join('') + '</div>';
  }

  function renderShareChart(rows) {
    const total = Math.max(rows.reduce((sum, row) => sum + row.value, 0), 1);
    return '<div class="share-chart">' +
      '<div class="share-track">' + rows.map((row, index) => {
        const width = Math.round(row.value / total * 1000) / 10;
        return '<i style="width:' + width + '%;background:' + chartColor(index) + '" title="' + escapeHtml(row.label) + '"></i>';
      }).join('') + '</div>' +
      renderCompareBars(rows.map(row => ({ ...row, value: Math.round(row.value / total * 1000) / 10 }))) +
      '</div>';
  }

  function renderCompareTable(rows) {
    return '<table><thead><tr><th>Участник</th><th>Значение</th><th>Предыдущий</th><th>Дельта</th><th>Анкеты</th><th>Клиенты</th></tr></thead><tbody>' +
      rows.map(row => '<tr><td>' + escapeHtml(row.label) + '</td><td>' + formatValue(row.value) + '</td><td>' + formatValue(row.previousValue) + '</td><td class="' + (row.delta >= 0 ? 'delta-up' : 'delta-down') + '">' + formatSigned(row.delta) + '</td><td>' + row.expertsCount + '</td><td>' + row.clientsCount + '</td></tr>').join('') +
      '</tbody></table>';
  }

  function renderLegendItem(row, index) {
    return '<div class="legend-item"><i style="background:' + chartColor(index) + '"></i><div><b>' + escapeHtml(row.label) + '</b><span>' + escapeHtml(row.sub || '') + '</span></div><strong>' + formatValue(row.value) + '</strong></div>';
  }

  function renderCompareNote(mode) {
    if (state.chartCompare === 'previous') {
      return 'Сплошная линия - выбранный период, пунктир - предыдущий период такой же длительности.';
    }
    if (state.chartCompare === 'segments') {
      return 'Сравниваются выбранные участники в одном периоде. Выберите 2-6 участников в поле "Кого сравнить".';
    }
    return 'Выберите показатель, разрез, тип графика и участников сравнения; таблица ниже использует те же фильтры.';
  }

  function buildChartGroups(rows, type) {
    const groups = new Map();

    rows.forEach(row => {
      const pair = splitPair(row);
      let id;
      let label;

      if (type === 'partner') {
        const assignment = getAssignment(pair.expert.id);
        id = assignment ? assignment.partnerId : 0;
        label = id ? getUserName(id, 'Партнер #' + id) : 'Без Партнера';
      } else if (type === 'expert') {
        id = pair.expert.id;
        label = pair.expert.name;
      } else {
        id = pair.client.id;
        label = pair.client.name;
      }

      if (!groups.has(id)) {
        groups.set(id, emptyGroup(id, label));
      }
      addRowToGroup(groups.get(id), row, pair);
    });

    return Array.from(groups.values())
      .map(group => ({
        ...group,
        sub: group.experts.size + ' анкет / ' + group.clients.size + ' клиентов',
        clientsCount: group.clients.size,
        expertsCount: group.experts.size
      }))
      .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, 'ru'));
  }

  function emptyGroup(id, label) {
    const group = {
      id,
      label,
      total: 0,
      risk: 0,
      clients: new Set(),
      experts: new Set()
    };
    window.PartnerInteractionAnalytics.metricKeys.forEach(key => {
      group[key] = 0;
    });
    return group;
  }

  function addRowToGroup(group, row, pair) {
    window.PartnerInteractionAnalytics.metricKeys.forEach(key => {
      group[key] += Number(row[key] || 0);
    });
    group.total += Number(row.total || 0);
    group.risk += Number(row.reports || 0) + Number(row.blocks || 0);
    group.clients.add(pair.client.id);
    group.experts.add(pair.expert.id);
  }

  function buildActionMixForGroup(type, groupId, range) {
    const mix = [
      { key: 'profileViews', label: 'Просмотры', value: 0 },
      { key: 'favorites', label: 'Избранное', value: 0 },
      { key: 'chatStarts', label: 'Начало диалога', value: 0 },
      { key: 'clientMessages', label: 'Сообщения клиентов', value: 0 },
      { key: 'expertReplies', label: 'Ответы экспертов', value: 0 },
      { key: 'paidConsultations', label: 'Оплаты', value: 0 },
      { key: 'repeatRequests', label: 'Повторные обращения', value: 0 },
      { key: 'risk', label: 'Риск', value: 0 }
    ];
    fixture.events.forEach(event => {
      if (String(getEventGroupId(event, type)) !== String(groupId)) return;
      if (!eventMatchesCurrentScope(event)) return;
      const createdAt = new Date(event.createdAt);
      if (range.from && createdAt < range.from) return;
      if (range.to && createdAt > range.to) return;
      const count = Number(event.count || 1);
      if (event.type === 'messages' && getEventDirection(event) === 'client_to_expert') mix[3].value += count;
      else if (event.type === 'messages' && getEventDirection(event) === 'expert_to_client') mix[4].value += count;
      else if (event.type === 'profileViews') mix[0].value += count;
      else if (event.type === 'favorites') mix[1].value += count;
      else if (event.type === 'chatStarts') mix[2].value += count;
      else if (event.type === 'clientMessages') mix[3].value += count;
      else if (event.type === 'expertReplies') mix[4].value += count;
      else if (event.type === 'paidConsultations') mix[5].value += count;
      else if (event.type === 'repeatRequests') mix[6].value += count;
      else if (['reports', 'blocks'].includes(event.type)) mix[7].value += count;
    });
    return mix.filter(item => item.value > 0);
  }

  function buildChartInsight(result, comparison) {
    if (!comparison.rows.length) {
      return 'Нет данных: расширьте период или снимите часть фильтров.';
    }

    const top = comparison.rows.slice().sort((a, b) => b.value - a.value)[0];
    const response = result.qualitySummary.responseRate === null ? 'нет данных' : result.qualitySummary.responseRate + '%';
    return 'Лидер: ' + top.label + ' - ' + formatValue(top.value) + ' по показателю "' + getMetricLabel(state.chartMetric) + '". Контроль качества: доля ответа ' + response + ', жалобы и блокировки.';
  }

  function splitPair(row) {
    const actorIsExpert = row.actor.role === 'expert';
    return {
      expert: actorIsExpert ? row.actor : row.target,
      client: actorIsExpert ? row.target : row.actor
    };
  }

  function getAssignment(expertId) {
    return fixture.assignments.find(item => Number(item.expertId) === Number(expertId));
  }

  function getUserName(id, fallback) {
    const user = fixture.users.find(item => Number(item.id) === Number(id));
    return user ? user.name : fallback;
  }

  function getAudienceLabel() {
    if (audience === 'admin') return 'Админ';
    if (audience === 'partner') return 'Партнер';
    return 'Эксперт';
  }

  function getActiveRange(offset = 0) {
    const now = new Date(fixture.meta.now);
    let from = null;
    let duration = null;
    if (state.period === 'today') {
      from = new Date(now);
      from.setHours(0, 0, 0, 0);
      duration = now.getTime() - from.getTime();
    } else if (state.period === '7d') {
      duration = 7 * 24 * 60 * 60 * 1000;
      from = new Date(now.getTime() - duration);
    } else if (state.period === '30d') {
      duration = 30 * 24 * 60 * 60 * 1000;
      from = new Date(now.getTime() - duration);
    }
    if (offset < 0 && duration) {
      return {
        from: new Date(from.getTime() - duration),
        to: new Date(now.getTime() - duration)
      };
    }
    return { from, to: now };
  }

  function makeBuckets(range) {
    const now = range.to || new Date(fixture.meta.now);
    let from = range.from ? new Date(range.from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const buckets = [];
    let cursor = startOfBucket(from, state.chartGranularity);
    while (cursor <= now && buckets.length < 80) {
      const key = bucketKey(cursor, state.chartGranularity);
      buckets.push({ key, label: formatBucket(key, state.chartGranularity), value: 0 });
      cursor = nextBucket(cursor, state.chartGranularity);
    }
    return buckets.length ? buckets : [{ key: bucketKey(now, state.chartGranularity), label: formatBucket(bucketKey(now, state.chartGranularity), state.chartGranularity), value: 0 }];
  }

  function bucketKey(date, granularity) {
    const d = new Date(date);
    if (granularity === 'month') return d.getFullYear() + '-' + pad2(d.getMonth() + 1);
    if (granularity === 'week') {
      const monday = startOfBucket(d, 'week');
      return monday.getFullYear() + '-W' + pad2(Math.ceil((((monday - new Date(monday.getFullYear(), 0, 1)) / 86400000) + 1) / 7));
    }
    return d.toISOString().slice(0, 10);
  }

  function startOfBucket(date, granularity) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (granularity === 'month') {
      d.setDate(1);
    } else if (granularity === 'week') {
      const day = d.getDay() || 7;
      d.setDate(d.getDate() - day + 1);
    }
    return d;
  }

  function nextBucket(date, granularity) {
    const d = new Date(date);
    if (granularity === 'month') d.setMonth(d.getMonth() + 1);
    else if (granularity === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    return d;
  }

  function formatBucket(key, granularity) {
    if (granularity === 'month') {
      const parts = key.split('-');
      return parts[1] + '.' + parts[0];
    }
    if (granularity === 'week') return key.replace('-W', ' нед. ');
    return formatDay(key);
  }

  function getEventGroupId(event, type) {
    const actor = fixture.users.find(user => Number(user.id) === Number(event.actorId));
    const target = fixture.users.find(user => Number(user.id) === Number(event.targetId));
    const actorIsExpert = actor && actor.role === 'expert';
    const expertId = actorIsExpert ? event.actorId : event.targetId;
    const clientId = actorIsExpert ? event.targetId : event.actorId;
    if (type === 'partner') {
      const assignment = getAssignment(expertId);
      return assignment ? assignment.partnerId : 0;
    }
    if (type === 'expert') return expertId;
    return clientId;
  }

  function eventMatchesCurrentScope(event) {
    const result = window.PartnerInteractionAnalytics.build(fixture, { ...state, audience, pageSize: 500 });
    const keys = new Set(result.allRows.map(row => row.actorId + ':' + row.targetId));
    return keys.has(event.actorId + ':' + event.targetId);
  }

  function getEventMetricValue(event) {
    const count = Number(event.count || 1);
    if (state.chartMetric === 'total') return window.PartnerInteractionAnalytics.metricKeys.includes(event.type) || event.type === 'messages' ? count : 0;
    if (state.chartMetric === 'risk') return ['reports', 'blocks'].includes(event.type) ? count : 0;
    if (state.chartMetric === 'messages') return ['clientMessages', 'expertReplies'].includes(event.type) || event.type === 'messages' ? count : 0;
    if (state.chartMetric === 'clientStartedDialogs') return (event.type === 'chatStarts') || (event.type === 'messages' && getEventDirection(event) === 'client_to_expert') ? count : 0;
    if (state.chartMetric === 'responseRate') return (event.type === 'expertReplies') || (event.type === 'messages' && getEventDirection(event) === 'expert_to_client') ? count : 0;
    return event.type === state.chartMetric ? count : 0;
  }

  function getEventDirection(event) {
    const actor = fixture.users.find(user => Number(user.id) === Number(event.actorId));
    return actor && actor.role === 'expert' ? 'expert_to_client' : 'client_to_expert';
  }

  function getMetricLabel(metric) {
    const labels = {
      total: 'Все действия',
      messages: 'Сообщения',
      clientStartedDialogs: 'Начатые диалоги',
      clientMessages: 'Сообщения клиентов',
      expertReplies: 'Ответы экспертов',
      responseRate: 'Ответы экспертов',
      risk: 'Жалобы + блокировки',
      profileViews: 'Просмотры анкет',
      favorites: 'Добавления в избранное',
      paidConsultations: 'Оплаты консультаций',
      repeatRequests: 'Повторные обращения'
    };
    return labels[metric] || metric;
  }

  function chartCompareLabel() {
    if (state.chartCompare === 'previous') return 'Сравнение с предыдущим периодом';
    if (state.chartCompare === 'segments') return 'Сравнение выбранных участников';
    return 'Выбранный период';
  }

  function chartColor(index) {
    return ['#467fcf', '#48bb78', '#f4c84c', '#f56565', '#805ad5', '#38b2ac'][index % 6];
  }

  function shortLabel(label) {
    const value = String(label || '');
    return value.length > 13 ? value.slice(0, 12) + '…' : value;
  }

  function emptySeries(group) {
    return { id: group.id, label: group.label, points: [], total: 0 };
  }

  function formatValue(value) {
    return Number(value || 0).toLocaleString('ru-RU');
  }

  function formatSigned(value) {
    const number = Number(value || 0);
    return (number > 0 ? '+' : '') + number.toLocaleString('ru-RU');
  }

  function pad2(value) {
    return String(value).padStart(2, '0');
  }

  function formatDay(day) {
    const parts = day.split('-');
    return parts.length === 3 ? parts[2] + '.' + parts[1] : day;
  }

  function formatExpertScope(experts) {
    if (audience === 'expert') {
      const expert = experts[0];
      return expert ? expert.id + ' - ' + expert.name + ' / ' + expert.username : 'Анкета не найдена';
    }
    if (!experts.length) {
      return 'Нет назначенных анкет';
    }
    if (experts.length <= 2) {
      return experts.length + ' назначено: ' + experts.map(expert => expert.name).join(', ');
    }
    return experts.length + ' назначено: ' + experts.slice(0, 2).map(expert => expert.name).join(', ') + ' и еще ' + (experts.length - 2);
  }

  function readFilters(resetPage = true) {
    state.partnerId = fields.partnerId
      ? Number(fields.partnerId.value.trim() || fixture.meta.defaultPartnerId)
      : Number(document.body.dataset.partnerId || fixture.meta.defaultPartnerId);
    state.expertId = fields.expertId ? Number(fields.expertId.value.trim() || 0) : Number(document.body.dataset.expertId || 0);
    if (audience === 'partner') {
      state.partnerId = Number(document.body.dataset.partnerId || state.partnerId);
    }
    if (audience === 'expert') {
      state.expertId = Number(document.body.dataset.expertId || state.expertId);
    }
    state.period = fields.period.value;
    state.direction = fields.direction.value;
    state.query = fields.query ? fields.query.value.trim() : '';
    state.minActions = fields.minActions ? Number(fields.minActions.value || 0) : 0;
    state.sort = fields.sort ? fields.sort.value : state.sort;
    state.pageSize = fields.pageSize ? Number(fields.pageSize.value || 50) : state.pageSize;
    if (resetPage) {
      state.page = 1;
    }
    populateExpertOptions();
  }

  function writeFilters() {
    if (fields.partnerId) fields.partnerId.value = state.partnerId;
    if (fields.expertId) fields.expertId.value = state.expertId;
    fields.period.value = state.period;
    fields.direction.value = state.direction;
    if (fields.query) fields.query.value = state.query;
    if (fields.minActions) fields.minActions.value = state.minActions;
    if (fields.sort) fields.sort.value = state.sort;
    if (fields.pageSize) fields.pageSize.value = state.pageSize;
  }

  function populatePartnerOptions() {
    if (!fields.partnerId || fields.partnerId.tagName !== 'SELECT') return;
    const partners = fixture.users.filter(user => user.role === 'partner');
    fields.partnerId.innerHTML = '<option value="0">Все Партнеры</option>' + partners
      .map(partner => '<option value="' + partner.id + '">' + escapeHtml(partner.name) + ' #' + partner.id + '</option>')
      .join('');
  }

  function populateExpertOptions() {
    if (!fields.expertId || fields.expertId.tagName === 'INPUT' && fields.expertId.type === 'hidden') return;
    const partnerId = fields.partnerId ? Number(fields.partnerId.value || state.partnerId) : state.partnerId;
    const assignedIds = (partnerId > 0 ? fixture.assignments.filter(item => item.partnerId === partnerId) : fixture.assignments)
      .map(item => item.expertId);
    const assignedSet = new Set(assignedIds);
    const experts = fixture.users.filter(user => user.role === 'expert' && assignedSet.has(user.id));
    if (fields.expertId.tagName === 'SELECT') {
      fields.expertId.innerHTML = '<option value="0">Все анкеты</option>' + experts
        .map(expert => '<option value="' + expert.id + '">' + escapeHtml(expert.name) + ' #' + expert.id + '</option>')
        .join('');
      if (!experts.some(expert => expert.id === Number(state.expertId))) {
        state.expertId = 0;
      }
      fields.expertId.value = state.expertId;
    }
  }

  function stopAutoStream() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
    const autoStream = document.querySelector('#autoStream');
    if (autoStream) {
      autoStream.classList.remove('is-active');
      autoStream.textContent = 'Автопоток';
    }
  }

  function text(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  }

  function setDisabled(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
      element.disabled = Boolean(value);
    }
  }

  function on(selector, event, handler) {
    const element = document.querySelector(selector);
    if (element) {
      element.addEventListener(event, handler);
    }
  }

  function renderHead(columns) {
    const actionHeads = columns.map(column => {
      const muted = column.unavailable ? ' muted' : '';
      return '<th class="col-action">' + renderSortButton(column.key, column.label, column.title, 'action-head' + muted, column.key) + '</th>';
    }).join('');

    return '<tr>' +
      '<th class="col-user">' + renderSortButton('actor', 'Кто', 'аккаунт, который совершил действие') + '</th>' +
      '<th class="col-user">' + renderSortButton('target', 'Кому', 'аккаунт, по отношению к которому совершено действие') + '</th>' +
      '<th class="col-direction">' + renderSortButton('direction', 'Направление', 'направление клиент -> эксперт или эксперт -> клиент') + '</th>' +
      actionHeads +
      '<th class="col-total">' + renderSortButton('total', 'Итого', 'сумма активных действий') + '</th>' +
      '</tr>';
  }

  function renderSortButton(key, label, description, extraClass = '', iconKey = '') {
    const active = sortKey(state.sort) === key;
    const dir = sortDirection(state.sort);
    const next = active && dir === 'desc' ? 'по возрастанию' : 'по убыванию';
    const icon = active ? (dir === 'desc' ? '↓' : '↑') : '↕';
    const title = 'Сортировать "' + description + '" ' + next;
    const content = iconKey
      ? '<span class="action-icon action-icon-' + escapeHtml(iconKey) + '" aria-hidden="true">' + actionIconSvg(iconKey) + '</span><span class="sr-only">' + escapeHtml(label) + '</span>'
      : '<span>' + escapeHtml(label) + '</span>';
    return '<button type="button" class="sort-button ' + extraClass + (active ? ' active' : '') + '" data-sort-key="' + escapeHtml(key) + '" data-sort-label="' + escapeHtml(label) + '" title="' + escapeHtml(title) + '" aria-label="' + escapeHtml(title) + '">' +
      content + '<b>' + icon + '</b>' +
      '</button>';
  }

  function actionIconSvg(key) {
    const icons = {
      profileViews: '<svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
      chatStarts: '<svg viewBox="0 0 24 24"><path d="M4 5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"></path><path d="M12 8v6"></path><path d="M9 11h6"></path></svg>',
      clientMessages: '<svg viewBox="0 0 24 24"><path d="M4 6h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-5 4V8a2 2 0 0 1 2-2Z"></path><path d="M8 10h8"></path><path d="M8 13h5"></path></svg>',
      expertReplies: '<svg viewBox="0 0 24 24"><path d="M20 6H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h9l5 4V8a2 2 0 0 0-2-2Z"></path><path d="m8 12 2 2 5-5"></path></svg>',
      paidConsultations: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"></rect><path d="M3 10h18"></path><path d="M8 15h3"></path><path d="M15 15h2"></path></svg>',
      favorites: '<svg viewBox="0 0 24 24"><path d="m12 3 2.6 5.5 6 .8-4.3 4.2 1 5.9L12 16.5 6.7 19.4l1-5.9-4.3-4.2 6-.8L12 3Z"></path></svg>',
      repeatRequests: '<svg viewBox="0 0 24 24"><path d="M17 2v5h-5"></path><path d="M7 22v-5h5"></path><path d="M19 9a7 7 0 0 0-11.7-3.2L7 7"></path><path d="M5 15a7 7 0 0 0 11.7 3.2L17 17"></path></svg>',
      blocks: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M5.7 5.7 18.3 18.3"></path></svg>',
      reports: '<svg viewBox="0 0 24 24"><path d="M12 3 2.5 20h19L12 3Z"></path><path d="M12 9v5"></path><path d="M12 17h.01"></path></svg>'
    };
    return icons[key] || '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"></circle></svg>';
  }

  function renderActionLegend(columns) {
    return columns.map(column => {
      const muted = column.unavailable ? ' muted' : '';
      return '<span class="legend-chip' + muted + '" title="' + escapeHtml(column.title) + '">' +
        '<i class="action-icon action-icon-' + escapeHtml(column.key) + '" aria-hidden="true">' + actionIconSvg(column.key) + '</i>' +
        '<b>' + escapeHtml(column.title) + '</b>' +
        '</span>';
    }).join('');
  }

  function nextSortValue(key) {
    const active = sortKey(state.sort) === key;
    const nextDirection = active && sortDirection(state.sort) === 'desc' ? 'asc' : 'desc';
    return key + '_' + nextDirection;
  }

  function sortKey(value) {
    if (!value) return 'total';
    return value.replace(/_(asc|desc)$/, '');
  }

  function sortDirection(value) {
    return value && value.endsWith('_asc') ? 'asc' : 'desc';
  }

  function ensureSortOption(value, label) {
    if (!fields.sort || Array.from(fields.sort.options).some(option => option.value === value)) return;
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label + (value.endsWith('_asc') ? ', по возрастанию' : ', по убыванию');
    fields.sort.appendChild(option);
    fields.sort.value = value;
  }

  function renderRow(row, columns) {
    const actionCells = columns.map(column => {
      const value = row[column.key];
      if (value === null || typeof value === 'undefined') {
        return '<td class="zero">—</td>';
      }
      const className = value === 0 ? 'zero' : 'num';
      return '<td class="' + className + '">' + value + '</td>';
    }).join('');

    return '<tr data-pair="' + row.actorId + ':' + row.targetId + '">' +
      '<td class="col-user">' + renderUser(row.actor) + '</td>' +
      '<td class="col-user">' + renderUser(row.target) + '</td>' +
      '<td class="col-direction"><span class="direction ' + directionClass(row.directionKey) + '">' + escapeHtml(row.direction) + '</span></td>' +
      actionCells +
      '<td class="total">' + row.total + '</td>' +
      '</tr>';
  }

  function renderUser(user) {
    return '<span class="user-cell">' +
      '<span class="avatar-cell">' + initials(user.name) + '</span>' +
      '<span class="user-meta">' +
      '<span class="user-name">' + escapeHtml(user.name) + '</span>' +
      '<span class="user-sub">' + escapeHtml(roleLabel(user.role)) + ' #' + user.id + '</span>' +
      '</span>' +
      '</span>';
  }

  function directionClass(directionKey) {
    return directionKey === 'expert_to_client' ? 'expert' : 'client';
  }

  function roleLabel(role) {
    if (role === 'partner') return 'Партнер';
    if (role === 'expert') return 'Эксперт';
    if (role === 'client') return 'Клиент';
    return 'Пользователь';
  }

  function initials(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
