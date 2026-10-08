(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PartnerInteractionReport = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const queryKeys = ['partnerId', 'expertId', 'period', 'fromDate', 'toDate', 'direction', 'query', 'minActions'];
  function signature(filters) {
    return JSON.stringify({
      partnerId: Number(filters.partnerId || 0), expertId: Number(filters.expertId || 0),
      period: filters.period || 'custom',
      fromDate: filters.period === 'custom' ? filters.fromDate || '' : '',
      toDate: filters.period === 'custom' ? filters.toDate || '' : '',
      direction: filters.direction || 'all', query: String(filters.query || '').trim(),
      minActions: String(filters.minActions ?? 0).trim() === '' ? '0' : String(filters.minActions ?? 0).trim()
    });
  }
  function dirty(draft, applied) { return signature(draft) !== signature(applied); }
  function context(filters, labels) {
    const parts = labels.role === 'expert' ? ['Моя анкета', labels.expert] : labels.role === 'partner'
      ? [labels.partner, Number(filters.expertId) ? labels.expert : 'Назначенные анкеты']
      : [Number(filters.partnerId) ? labels.partner : 'Все доступные партнёры', Number(filters.expertId) ? labels.expert : 'Все доступные анкеты'];
    parts.push(labels.range + ' · Europe/Minsk', { all: 'Все направления', client_to_expert: 'Клиент → эксперт', expert_to_client: 'Эксперт → клиент' }[filters.direction || 'all']);
    if (String(filters.query || '').trim()) parts.push('Поиск клиента: «' + String(filters.query).trim() + '»');
    if (Number(filters.minActions) > 0) parts.push('Мин. событий: ' + Number(filters.minActions));
    return parts.filter(Boolean).join(' · ');
  }
  function draftStatus(draft, applied, options = {}) {
    if (options.denied) return { changed: false, text: 'Нет доступа к отчёту', kind: 'denied' };
    const changed = dirty(draft, applied);
    if (options.pending) return { changed, text: options.hasResult ? 'Обновление отчёта…' : 'Загрузка отчёта…', kind: 'pending' };
    return { changed, text: changed ? 'Изменения не применены' : '', kind: changed ? 'dirty' : 'applied' };
  }
  return { queryKeys, signature, dirty, context, draftStatus };
});
