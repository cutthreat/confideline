(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PartnerInteractionColumns = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const coreMetrics = Object.freeze(['profileViews', 'favorites', 'newDialogs', 'clientMessages', 'expertMessages', 'paidConsultations']);
  // Display preferences only: the analytics service owns rows, totals and scope.
  function create(allowedMetrics, initialMetrics = []) {
    const keys = [...new Set(allowedMetrics)];
    const selected = new Set(initialMetrics.filter(key => keys.includes(key)));
    const visible = () => keys.filter(key => selected.has(key));
    return Object.freeze({
      visible,
      toggle(key) {
        if (!keys.includes(key)) return false;
        if (selected.has(key)) selected.delete(key); else selected.add(key);
        return true;
      },
      all() { keys.forEach(key => selected.add(key)); },
      core() { selected.clear(); coreMetrics.forEach(key => { if (keys.includes(key)) selected.add(key); }); },
      clear() { selected.clear(); },
      sort(current) {
        const metrics = visible();
        const [key, direction] = String(current).split('_');
        return metrics.includes(key) && ['asc', 'desc'].includes(direction)
          ? current : metrics.length ? metrics[0] + '_desc' : 'activity_desc';
      }
    });
  }
  function settleRequest(picker, draft, current, presentationChanged) {
    return { ...draft, sort: picker.sort(presentationChanged ? current.sort : draft.sort), page: presentationChanged ? 1 : draft.page };
  }
  return { create, coreMetrics, settleRequest };
});
