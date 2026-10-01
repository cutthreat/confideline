(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PartnerInteractionCharts = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Keep the original time-bucket index. Missing values break a line; they are not zeroes.
  function lineSegments(points) {
    if (!Array.isArray(points)) throw new TypeError('Chart points must be an array');
    const segments = [];
    let segment = null;
    for (let index = 0; index < points.length; index++) {
      const point = points[index];
      const value = typeof point === 'number' ? point : point?.value;
      if (!Number.isFinite(value)) { segment = null; continue; }
      if (!segment) { segment = []; segments.push(segment); }
      segment.push({ index, value, point });
    }
    return segments;
  }

  // The owning analytics service controls metric permission and data. This helper
  // only resolves compatible presentation controls, without changing the metric.
  function presentation(metric, type = 'line', compare = 'none', period = 'custom') {
    const cumulative = ['pairLTV', 'platformLTV'].includes(metric);
    const types = cumulative ? ['line', 'bar', 'table']
      : metric === 'activity' ? ['line', 'bar', 'stacked', 'pie', 'table']
      : ['line', 'bar', 'pie', 'table'];
    const reasons = [];
    const effectiveType = types.includes(type) ? type : 'line';
    if (effectiveType !== type) {
      reasons.push(cumulative
        ? 'Для LTV доступны линия, столбцы и таблица. Выбран линейный график.'
        : type === 'stacked'
          ? 'Структура активности доступна только для показателя активности. Выбран линейный график.'
          : 'Недоступный тип графика заменён линейным.');
    }
    const previousAllowed = period !== 'all' && ['line', 'bar', 'table'].includes(effectiveType);
    const compares = previousAllowed ? ['none', 'segments', 'previous'] : ['none', 'segments'];
    const effectiveCompare = compares.includes(compare) ? compare : 'none';
    if (effectiveCompare !== compare) {
      reasons.push(compare === 'previous'
        ? period === 'all'
          ? 'Сравнение с предыдущим периодом недоступно для всего периода. Сравнение отключено.'
          : 'Сравнение с предыдущим периодом доступно для линии, столбцов и таблицы. Сравнение отключено.'
        : 'Недоступное сравнение отключено.');
    }
    return { types, compares, type: effectiveType, compare: effectiveCompare, reasons, reason: reasons.join(' ') };
  }

  // Resolve nullable selection against current candidates. Preserve their order and
  // identifier types; the caller may keep null as a persistent "all" preference.
  function selection(ids, requested = null) {
    if (!Array.isArray(ids)) throw new TypeError('Candidate IDs must be an array');
    if (requested !== null && !Array.isArray(requested)) throw new TypeError('Requested IDs must be an array or null');
    const candidates = [...new Set(ids)];
    if (requested === null) return candidates;
    const wanted = new Set(requested);
    return candidates.filter(id => wanted.has(id));
  }

  function outputState(known, candidates, selected, total) {
    if (!known) return 'no-source';
    if (!candidates) return 'no-events';
    if (!selected) return 'none-selected';
    return total === 0 ? 'zero' : 'data';
  }
  function exactValue(value) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) return 'Нет данных';
    return Number(value).toLocaleString('ru-RU', { maximumFractionDigits: 20 });
  }
  return { lineSegments, presentation, selection, outputState, exactValue };
});
