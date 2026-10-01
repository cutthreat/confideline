(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PartnerInteractionAnalytics = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const DAY = 86400000;
  const OFFSET = 3 * 3600000;
  const activityKeys = ['profileViews', 'favorites', 'clientMessages', 'expertMessages', 'blocks', 'reports'];
  const labels = {
    profileViews: 'Просмотры профиля', favorites: 'Добавления в избранное',
    newDialogs: 'Новые диалоги', clientMessages: 'Сообщения клиентов', expertMessages: 'Сообщения экспертов',
    paidConsultations: 'Оплаченные консультации', repeatExpert: 'Повторные консультации с экспертом',
    repeatPlatform: 'Повторные консультации на платформе', pairLTV: 'LTV клиент–эксперт, credits',
    platformLTV: 'LTV клиента на платформе, credits', blocks: 'Блокировки', reports: 'Жалобы на пользователя',
    activity: 'События активности', messages: 'Сообщения обеих сторон'
  };
  const metricKeys = Object.keys(labels).filter(key => !['activity', 'messages'].includes(key));
  const globalKeys = ['repeatPlatform', 'platformLTV'];
  const pairKeys = ['newDialogs', 'paidConsultations', 'repeatExpert', 'repeatPlatform', 'pairLTV', 'platformLTV'];
  const periodLabels = { today: 'Сегодня', '7d': 'Последние 7×24 часа', '30d': 'Последние 30×24 часа', all: 'Весь период', custom: 'Произвольный диапазон' };
  const roles = ['admin', 'partner', 'expert'];
  const metricSource = key => ['paidConsultations', 'pairLTV', 'platformLTV'].includes(key) ? 'finance' : ['newDialogs', 'repeatExpert', 'repeatPlatform'].includes(key) ? 'history' : 'activity';
  const sourceKnown = (data, key) => Object.hasOwn(data.sources || {}, key) ? data.sources[key] === true : data.sources?.[metricSource(key)] === true;
  const time = value => new Date(value).getTime();
  const day = value => new Date(time(value) + OFFSET).toISOString().slice(0, 10);
  const dateLabel = value => day(value).split('-').reverse().join('.');
  const emptyMetrics = () => Object.fromEntries([...metricKeys, 'activity', 'messages'].map(key => [key, 0]));
  const sum = (items, key) => items.some(item => item[key] === null) ? null : items.reduce((n, item) => n + (item[key] || 0), 0);
  const dedupe = (items, key) => Array.from(new Map(items.map(item => [item[key], item])).values());

  function range(nowValue, filters) {
    const now = time(nowValue);
    let from = null;
    let to = now;
    if (filters.period === 'custom') {
      const valid = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(value)) && day(value + 'T00:00:00+03:00') === value;
      if (!valid(filters.fromDate) || !valid(filters.toDate)) throw new Error('Укажите обе календарные даты');
      if (filters.fromDate > filters.toDate) throw new Error('Дата «С» не может быть позже даты «По»');
      from = time(filters.fromDate + 'T00:00:00+03:00');
      to = Math.min(time(filters.toDate + 'T00:00:00+03:00') + DAY - 1, now);
      if (from > now) throw new Error('Начало диапазона находится в будущем');
    } else if (filters.period === 'today') from = time(day(now) + 'T00:00:00+03:00');
    else if (filters.period === '7d') from = now - 7 * DAY;
    else if (filters.period === '30d') from = now - 30 * DAY;
    return { from, to, timezone: 'Europe/Minsk', label: (from === null ? 'С начала истории' : dateLabel(from)) + ' — ' + dateLabel(to) };
  }

  function scope(data, access) {
    const all = data.users.filter(user => user.role === 'expert').map(user => user.id);
    if (access.authorized === false || !roles.includes(access.role)) return [];
    if (access.role === 'expert') return all.filter(id => id === access.expertId);
    if (access.role === 'partner') return data.assignments.filter(item => item.partnerId === access.partnerId).map(item => item.expertId);
    return access.expertIds ? all.filter(id => access.expertIds.includes(id)) : all;
  }

  function allowedMetrics(access) {
    if (access.authorized === false || !roles.includes(access.role)) return [];
    return metricKeys.filter(key => !globalKeys.includes(key) || (access.role === 'admin' && access.globalPermission !== false));
  }

  function build(data, rawFilters = {}, access = { role: 'none' }, forcedRange) {
    const filters = { period: 'custom', fromDate: '2026-09-07', toDate: '2026-09-15', direction: 'all', partnerId: 0, expertId: 0, query: '', minActions: 0, sort: 'activity_desc', page: 1, pageSize: 50, ...rawFilters };
    const window = forcedRange || range(data.meta.now, filters);
    const available = allowedMetrics(access);
    let expertIds = scope(data, access);
    if (access.role === 'admin' && Number(filters.partnerId)) expertIds = expertIds.filter(id => data.assignments.some(a => a.expertId === id && a.partnerId === Number(filters.partnerId)));
    if (Number(filters.expertId)) expertIds = expertIds.filter(id => id === Number(filters.expertId));
    const experts = new Set(expertIds);
    const users = new Map(data.users.map(user => [user.id, user]));
    const activityKnown = activityKeys.every(key => sourceKnown(data, key));
    const messagesKnown = ['clientMessages', 'expertMessages'].every(key => sourceKnown(data, key));
    const historyKnown = data.sources?.history === true;
    const financeKnown = data.sources?.finance === true;
    if (Number(filters.minActions) > 0 && !activityKnown) throw new Error('Фильтр минимума недоступен: нет источника всех событий активности');
    const inPeriod = value => time(value) <= window.to && (window.from === null || time(value) >= window.from);
    const events = dedupe(data.events || [], 'id').map(event => {
      const actor = users.get(event.actorId);
      const target = users.get(event.targetId);
      if (!actor || !target || actor.role === target.role) return null;
      const expert = actor.role === 'expert' ? actor : target;
      const client = actor.role === 'client' ? actor : target;
      if (expert.role !== 'expert' || client.role !== 'client') return null;
      const direction = actor.role === 'expert' ? 'expert_to_client' : 'client_to_expert';
      let key = event.type;
      if (key === 'messages') key = actor.role === 'expert' ? 'expertMessages' : 'clientMessages';
      return { ...event, expertId: expert.id, clientId: client.id, direction, key };
    }).filter(Boolean);
    const consultations = dedupe(data.consultations || [], 'id').filter(c => c.serviceStartedAt);
    const transactions = dedupe(data.transactions || [], 'transactionId').filter(t => t.status === 'confirmed' && ['charge', 'refund'].includes(t.type) && t.amount > 0 && consultations.some(c => c.id === t.consultationId && c.clientId === t.clientId && c.expertId === t.expertId));
    const pairs = new Map();
    function getPair(clientId, expertId) {
      if (!experts.has(expertId)) return null;
      const client = users.get(clientId);
      const expert = users.get(expertId);
      if (!client || !expert || client.role !== 'client') return null;
      const query = String(filters.query || '').trim().toLowerCase();
      if (query && ![client.id, client.name, client.username].some(value => String(value).toLowerCase().includes(query))) return null;
      const id = clientId + ':' + expertId;
      if (!pairs.has(id)) pairs.set(id, { id, client, expert, ...emptyMetrics(), directions: { client_to_expert: emptyMetrics(), expert_to_client: emptyMetrics() }, clientTimes: [], expertTimes: [], hasPeriod: false });
      return pairs.get(id);
    }
    events.forEach(event => {
      if (!inPeriod(event.createdAt) || !activityKeys.includes(event.key)) return;
      const pair = getPair(event.clientId, event.expertId);
      if (!pair) return;
      pair.hasPeriod = true;
      if (event.key === 'clientMessages') pair.clientTimes.push(time(event.createdAt));
      if (event.key === 'expertMessages') pair.expertTimes.push(time(event.createdAt));
      if (filters.direction === 'all' || filters.direction === event.direction) pair.directions[event.direction][event.key] += event.count ?? 1;
    });
    // Dialogue creation is derived from the first client message in the complete history.
    const firstMessages = new Map();
    events.filter(e => e.key === 'clientMessages').forEach(event => {
      const key = event.clientId + ':' + event.expertId;
      if (!firstMessages.has(key) || time(event.createdAt) < time(firstMessages.get(key).createdAt)) firstMessages.set(key, event);
    });
    firstMessages.forEach(event => {
      if (!inPeriod(event.createdAt)) return;
      const pair = getPair(event.clientId, event.expertId);
      if (pair) { pair.newDialogs = 1; pair.hasPeriod = true; }
    });
    consultations.forEach(c => {
      const pair = getPair(c.clientId, c.expertId);
      if (!pair) return;
      const charges = transactions.filter(t => t.consultationId === c.id && t.type === 'charge').sort((a, b) => time(a.createdAt) - time(b.createdAt));
      if (charges.length && inPeriod(charges[0].createdAt)) { pair.paidConsultations++; pair.hasPeriod = true; }
      if (inPeriod(c.serviceStartedAt)) {
        pair.hasPeriod = true;
        const earlier = consultations.filter(previous => previous.id !== c.id && previous.clientId === c.clientId && previous.completedAt && time(previous.completedAt) < time(c.serviceStartedAt));
        if (earlier.some(previous => previous.expertId === c.expertId)) pair.repeatExpert++;
        if (earlier.length) pair.repeatPlatform++;
      }
    });
    const globalLTV = new Map();
    const refunded = new Map();
    transactions.filter(t => t.type === 'charge' && time(t.createdAt) <= window.to).forEach(t => {
      globalLTV.set(t.clientId, (globalLTV.get(t.clientId) || 0) + t.amount);
      const pair = getPair(t.clientId, t.expertId);
      if (pair) pair.pairLTV += t.amount;
    });
    transactions.filter(t => t.type === 'refund' && time(t.createdAt) <= window.to).forEach(t => {
      const charge = transactions.find(c => c.transactionId === t.chargeId && c.type === 'charge' && c.consultationId === t.consultationId && time(c.createdAt) <= time(t.createdAt));
      if (!charge) return;
      // A refund is tied to a real charge; duplicate confirmations do not add another refund.
      const amount = Math.min(t.amount, Math.max(0, charge.amount - (refunded.get(charge.transactionId) || 0)));
      refunded.set(charge.transactionId, (refunded.get(charge.transactionId) || 0) + amount);
      globalLTV.set(t.clientId, (globalLTV.get(t.clientId) || 0) - amount);
      const pair = getPair(t.clientId, t.expertId);
      if (pair) { pair.pairLTV -= amount; if (inPeriod(t.createdAt)) pair.hasPeriod = true; }
    });
    let selected = Array.from(pairs.values()).filter(pair => pair.hasPeriod || pair.pairLTV !== 0);
    selected.forEach(pair => {
      activityKeys.forEach(key => { pair[key] = pair.directions.client_to_expert[key] + pair.directions.expert_to_client[key]; });
      pair.activity = activityKeys.reduce((n, key) => n + pair[key], 0);
      pair.messages = pair.clientMessages + pair.expertMessages;
      pair.platformLTV = globalLTV.get(pair.client.id) || 0;
      const visibleClientTimes = filters.direction === 'expert_to_client' ? [] : pair.clientTimes;
      const visibleExpertTimes = filters.direction === 'client_to_expert' ? [] : pair.expertTimes;
      pair.clientDialog = visibleClientTimes.length > 0;
      pair.answered = pair.clientDialog && visibleExpertTimes.some(e => visibleClientTimes.some(c => e > c));
      pair.outboundOnly = !visibleClientTimes.length && visibleExpertTimes.length > 0;
      metricKeys.filter(key => !sourceKnown(data, key)).forEach(key => { pair[key] = null; });
      if (!activityKnown) pair.activity = null;
      if (!messagesKnown) pair.messages = null;
      globalKeys.filter(key => !available.includes(key)).forEach(key => { delete pair[key]; });
    });
    selected = selected.filter(pair => !Number(filters.minActions) || (pair.activity !== null && pair.activity >= Number(filters.minActions)));
    const clients = dedupe(selected.map(pair => pair.client), 'id');
    const metrics = Object.fromEntries([...available, 'activity', 'messages'].map(key => [key, key === 'platformLTV' ? (financeKnown ? clients.reduce((n, c) => n + (globalLTV.get(c.id) || 0), 0) : null) : sum(selected, key)]));
    // Unknown sources remain unknown even when the selected set is empty.
    available.filter(key => !sourceKnown(data, key)).forEach(key => { metrics[key] = null; });
    if (!activityKnown) metrics.activity = null;
    if (!messagesKnown) metrics.messages = null;
    const dialogs = messagesKnown ? selected.filter(p => p.clientDialog).length : null;
    const answered = messagesKnown ? selected.filter(p => p.answered).length : null;
    const directionKeys = filters.direction === 'all' ? ['client_to_expert', 'expert_to_client'] : [filters.direction];
    const rows = selected.flatMap(pair => directionKeys.map((direction, index) => {
      const row = { id: pair.id + '-' + direction, pairId: pair.id, client: pair.client, expert: pair.expert, actor: direction === 'client_to_expert' ? pair.client : pair.expert, target: direction === 'client_to_expert' ? pair.expert : pair.client, directionKey: direction, canonical: index === 0, referenceId: pair.id + '-' + directionKeys[0] };
      available.forEach(key => { row[key] = pairKeys.includes(key) ? pair[key] : (sourceKnown(data, key) ? pair.directions[direction][key] : null); });
      row.activity = activityKnown ? activityKeys.reduce((n, key) => n + (row[key] || 0), 0) : null;
      return row;
    }));
    const [sortKey, sortDirection] = String(filters.sort).split('_');
    const safeSort = [...available, 'activity'].includes(sortKey) ? sortKey : 'activity';
    rows.sort((a, b) => (sortDirection === 'asc' ? 1 : -1) * ((a[safeSort] || 0) - (b[safeSort] || 0)) || a.pairId.localeCompare(b.pairId) || Number(b.canonical) - Number(a.canonical));
    const pageSize = Math.max(1, Math.min(500, Number(filters.pageSize) || 50));
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    const page = Math.min(totalPages, Math.max(1, Number(filters.page) || 1));
    const start = (page - 1) * pageSize;
    return {
      filters, access, range: window, allowedMetrics: available, metrics, pairs: selected, allRows: rows, rows: rows.slice(start, start + pageSize),
      experts: data.users.filter(u => experts.has(u.id)), clients,
      summary: { experts: activityKnown ? new Set(selected.filter(p => p.activity > 0).map(p => p.expert.id)).size : null, pairs: activityKnown || historyKnown || financeKnown ? selected.length : null, clients: activityKnown || historyKnown || financeKnown ? clients.length : null, actions: metrics.activity, messages: metrics.messages },
      quality: { dialogs, answered, noAnswer: dialogs === null ? null : dialogs - answered, responseRate: dialogs ? answered / dialogs * 100 : null, outboundOnly: messagesKnown ? selected.filter(p => p.outboundOnly).length : null },
      highActivity: activityKnown ? selected.filter(p => p.activity >= 10).length : null,
      pagination: { page, pageSize, totalRows: rows.length, totalPages, from: rows.length ? start + 1 : 0, to: Math.min(rows.length, start + pageSize) }
    };
  }

  function dimensions(metric, access) {
    if (access.authorized === false || !roles.includes(access.role)) return [];
    if (!allowedMetrics(access).includes(metric) && !['activity', 'messages'].includes(metric)) return [];
    if (metric === 'platformLTV') return ['client'];
    if (metric === 'pairLTV') return ['pair', 'expert'];
    return access.role === 'admin' ? ['partner', 'expert', 'client', 'pair'] : access.role === 'partner' ? ['expert', 'client', 'pair'] : ['client', 'pair'];
  }

  function groups(data, result, metric, dimension) {
    if (!dimensions(metric, result.access).includes(dimension)) return [];
    const map = new Map();
    result.pairs.forEach(pair => {
      const partnerId = data.assignments.find(a => a.expertId === pair.expert.id)?.partnerId;
      const user = dimension === 'client' ? pair.client : dimension === 'expert' ? pair.expert : data.users.find(u => u.id === partnerId);
      const id = dimension === 'pair' ? pair.id : String(user?.id || 0);
      const label = dimension === 'pair' ? pair.client.name + ' / ' + pair.expert.name : user?.name || 'Без партнёра';
      if (!map.has(id)) map.set(id, { id, label, pairIds: [], value: 0, clientIds: new Set() });
      const group = map.get(id);
      group.pairIds.push(pair.id);
      if (metric !== 'platformLTV' || !group.clientIds.has(pair.client.id)) group.value = group.value === null || pair[metric] === null ? null : group.value + (pair[metric] || 0);
      group.clientIds.add(pair.client.id);
    });
    return Array.from(map.values());
  }

  function buckets(data, window, granularity) {
    const knownTimes = [...data.events.map(e => time(e.createdAt)), ...data.consultations.filter(c => c.serviceStartedAt).map(c => time(c.serviceStartedAt))];
    const earliest = knownTimes.length ? Math.min(...knownTimes) : window.to;
    const from = window.from === null ? Math.min(earliest, window.to) : window.from;
    const shifted = new Date(from + OFFSET);
    shifted.setUTCHours(0, 0, 0, 0);
    if (granularity === 'month') shifted.setUTCDate(1);
    if (granularity === 'week') shifted.setUTCDate(shifted.getUTCDate() - ((shifted.getUTCDay() + 6) % 7));
    const output = [];
    while (shifted.getTime() - OFFSET <= window.to) {
      const begin = shifted.getTime() - OFFSET;
      if (granularity === 'month') shifted.setUTCMonth(shifted.getUTCMonth() + 1);
      else shifted.setUTCDate(shifted.getUTCDate() + (granularity === 'week' ? 7 : 1));
      output.push({ from: Math.max(from, begin), to: Math.min(window.to, shifted.getTime() - OFFSET - 1), label: dateLabel(begin).slice(0, 5) });
    }
    return output;
  }

  function chart(data, result, options) {
    const { metric, dimension, granularity = 'day', entities = null, compare = 'none' } = options;
    const candidates = groups(data, result, metric, dimension);
    const selected = entities === null ? candidates : candidates.filter(group => entities.includes(group.id));
    const intervals = buckets(data, result.range, granularity);
    const cumulative = ['pairLTV', 'platformLTV'].includes(metric);
    const known = result.metrics[metric] !== null && result.metrics[metric] !== undefined;
    const valuesFor = window => {
      const snapshot = build(data, { ...result.filters, query: '', minActions: 0, page: 1 }, result.access, window);
      snapshot.pairs = snapshot.pairs.filter(p => result.pairs.some(original => original.id === p.id));
      return groups(data, snapshot, metric, dimension);
    };
    const previousRange = compare === 'previous' && result.range.from !== null ? { from: result.range.from - (result.range.to - result.range.from + 1), to: result.range.from - 1 } : null;
    const previousValues = previousRange ? valuesFor(previousRange) : [];
    const series = selected.map(group => ({
      ...group,
      points: intervals.map(interval => ({ ...interval, value: known ? valuesFor({ from: cumulative ? null : interval.from, to: interval.to }).find(g => g.id === group.id)?.value ?? 0 : null })),
      previousPoints: previousRange ? intervals.map(interval => {
        const duration = result.range.to - result.range.from + 1;
        return { ...interval, value: known ? valuesFor({ from: cumulative ? null : interval.from - duration, to: interval.to - duration }).find(g => g.id === group.id)?.value ?? 0 : null };
      }) : [],
      previous: previousRange && known ? previousValues.find(g => g.id === group.id)?.value ?? 0 : null
    }));
    return { metric, dimension, cumulative, intervals, series, previousRange, total: !known || series.some(g => g.value === null) ? null : series.reduce((n, g) => n + g.value, 0) };
  }
  return { activityKeys, metricKeys, pairKeys, globalKeys, labels, periodLabels, range, scope, allowedMetrics, build, dimensions, groups, chart, day, dateLabel };
});
