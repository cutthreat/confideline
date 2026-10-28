(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./filter-model.js') : root.CatalogFilterModel);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CatalogFilterData = api;
})(typeof window === 'object' ? window : globalThis, function (model) {
  'use strict';
  const pageSize = 4;
  function checkQuery(query) {
    if (query.areas.some(id => !model.areas.includes(id)) || query.topics.some(id => !model.topics.includes(id))) throw new Error('invalid_query');
  }
  function validateResult(result) {
    if (!result || !Array.isArray(result.items) || !Number.isSafeInteger(result.total) || result.total < 0 ||
      !Number.isSafeInteger(result.page) || result.page < 1 || result.pageSize !== pageSize ||
      result.page > Math.max(1, Math.ceil(result.total / pageSize)) ||
      result.items.length !== Math.min(pageSize, Math.max(0, result.total - (result.page - 1) * pageSize)) ||
      new Set(result.items.map(item => item?.id)).size !== result.items.length) throw new Error('invalid_response');
    for (const item of result.items) {
      if (!item || typeof item.id !== 'string' || !item.id || typeof item.name !== 'string' || !item.name ||
        (item.photo !== null && (typeof item.photo !== 'string' || !/^(?:images\/[\w.-]+|https:\/\/)/.test(item.photo))) ||
        !Array.isArray(item.areas) || item.areas.some(id => !Object.hasOwn(model.profileLabels.areas, id)) ||
        !Array.isArray(item.topics) || item.topics.some(id => !Object.hasOwn(model.profileLabels.topics, id)) ||
        !['online', 'busy', 'offline'].includes(item.status)) throw new Error('invalid_response');
    }
    return { ...result, pages: Math.max(1, Math.ceil(result.total / pageSize)) };
  }
  function demo(profiles) {
    return async query => {
      checkQuery(query);
      return validateResult({ ...model.paginate(model.select(profiles, query.areas, query.topics), query.page, pageSize), pageSize });
    };
  }
  // The real endpoint is supplied by the Yii integration, never inferred from a page URL.
  function http(endpoint, fetcher = globalThis.fetch, timeoutMs = 15000) {
    return async (query, { signal } = {}) => {
      checkQuery(query);
      const separator = endpoint.includes('?') ? '&' : '?';
      const controller = new AbortController();
      const forwardAbort = () => controller.abort();
      if (signal?.aborted) forwardAbort();
      else signal?.addEventListener('abort', forwardAbort, { once: true });
      const timer = setTimeout(forwardAbort, timeoutMs);
      try {
        const response = await fetcher(endpoint + separator + model.writeQuery(query), { signal: controller.signal, credentials: 'same-origin', headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('request_failed');
        return validateResult(await response.json());
      } finally {
        clearTimeout(timer); signal?.removeEventListener('abort', forwardAbort);
      }
    };
  }
  function latest(adapter) {
    let version = 0;
    let abort;
    const run = async query => {
      const request = ++version;
      abort?.abort();
      abort = new AbortController();
      try {
        const result = await adapter(query, { signal: abort.signal });
        return request === version ? { result } : { stale: true };
      } catch (error) {
        return request === version ? { error } : { stale: true };
      }
    };
    run.cancel = () => { ++version; abort?.abort(); };
    return run;
  }
  return { demo, http, latest, validateResult, pageSize };
});
