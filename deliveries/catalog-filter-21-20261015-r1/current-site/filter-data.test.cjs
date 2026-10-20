const test = require('node:test');
const assert = require('node:assert/strict');
const model = require('./filter-model.js');
const data = require('./filter-data.js');
const fixtures = require('./filter-fixtures.js');
const query = { areas: [], topics: [], page: 1, lang: 'ru' };

test('both views use the same six synthetic fixtures, paginated after filtering', async () => {
  const result = await data.demo(fixtures)(query);
  assert.equal(result.total, 6); assert.equal(result.items.length, 4); assert.equal(result.pages, 2);
  const next = await data.demo(fixtures)({ ...query, page: 2 });
  assert.equal(new Set([...result.items, ...next.items].map(item => item.id)).size, 6);
  assert.equal(next.items.length, 2);
});
test('demo adapter respects cross-group intersection, published status and no duplicates', async () => {
  const result = await data.demo([...fixtures, fixtures[0], { ...fixtures[0], id: 'hidden', published: false }])({ ...query, areas: ['taro'], topics: ['career'] });
  assert.deepEqual(result.items.map(item => item.id), ['demo-elena', 'demo-alex']);
});
test('empty and out-of-range results use a canonical page', async () => {
  assert.equal((await data.demo(fixtures)({ ...query, areas: ['astrology'], topics: ['fertility'], page: 99 })).total, 0);
  assert.equal((await data.demo(fixtures)({ ...query, page: 99 })).page, 2);
});
test('invalid IDs cannot silently broaden the adapter search', async () => {
  await assert.rejects(data.demo(fixtures)({ ...query, areas: ['unknown'] }), /invalid_query/);
});
test('HTTP adapter sends canonical query, same-origin credentials and abort signal', async () => {
  const controller = new AbortController();
  let captured;
  const result = await data.demo(fixtures)(query);
  const search = data.http('/catalog/search?source=catalog', async (...args) => { captured = args; return { ok: true, json: async () => result }; });
  await search({ ...query, areas: ['taro', 'astrology'], page: 2 }, { signal: controller.signal });
  assert.equal(captured[0], '/catalog/search?source=catalog&areas=astrology%2Ctaro&page=2');
  assert.equal(captured[1].credentials, 'same-origin'); assert.equal(captured[1].signal.aborted, false);
});
test('HTTP failures and malformed payloads reject, not an empty success', async () => {
  await assert.rejects(data.http('/catalog', async () => ({ ok: false }))(query), /request_failed/);
  await assert.rejects(data.http('/catalog', async () => ({ ok: true, json: async () => ({}) }))(query), /invalid_response/);
});
test('HTTP timeout aborts a hanging request and external cancellation is forwarded', async () => {
  const fetcher = (url, { signal }) => new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new Error('aborted'));
    signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  });
  await assert.rejects(data.http('/catalog', fetcher, 5)(query), /aborted/);
  const controller = new AbortController();
  const pending = data.http('/catalog', fetcher)(query, { signal: controller.signal }); controller.abort();
  await assert.rejects(pending, /aborted/);
});
test('API contract rejects duplicate, missing, unsafe and inconsistent result data', async () => {
  const result = await data.demo(fixtures)(query);
  for (const changed of [
    { total: -1 }, { page: 0 }, { pageSize: 0 }, { items: [null, ...result.items.slice(1)] },
    { items: [result.items[0], result.items[0], ...result.items.slice(2)] },
    { items: result.items.slice(1) }, { items: [{ ...result.items[0], photo: 'javascript:alert(1)' }, ...result.items.slice(1)] },
    { items: [{ ...result.items[0], status: 'verified' }, ...result.items.slice(1)] }
  ]) assert.throws(() => data.validateResult({ ...result, ...changed }), /invalid_response/);
});
test('late success cannot overwrite a newer response, even if the adapter ignores abort', async () => {
  const pending = [];
  const run = data.latest((q, opts) => new Promise(resolve => pending.push({ resolve, signal: opts.signal })));
  const first = run(query); const second = run({ ...query, page: 2 });
  assert(pending[0].signal.aborted);
  pending[1].resolve('new'); assert.deepEqual(await second, { result: 'new' });
  pending[0].resolve('old'); assert.deepEqual(await first, { stale: true });
});
test('late failure and explicit cancel do not surface stale errors', async () => {
  let reject;
  const run = data.latest(() => new Promise((resolve, no) => { reject = no; }));
  const result = run(query); run.cancel(); reject(new Error('old'));
  assert.deepEqual(await result, { stale: true });
});
test('latest request failures are exposed and can be retried', async () => {
  let calls = 0;
  const run = data.latest(async () => { if (++calls === 1) throw new Error('offline'); return 'ok'; });
  assert.match((await run(query)).error.message, /offline/);
  assert.deepEqual(await run(query), { result: 'ok' });
});
test('URL state is canonical, unique and round-trips', () => {
  const state = { ...query, areas: ['taro', 'astrology', 'taro'], topics: ['career'], page: 2, lang: 'en' };
  assert.equal(model.writeQuery(state), 'areas=astrology%2Ctaro&topics=career&page=2&lang=en');
  assert.deepEqual(model.readQuery('?' + model.writeQuery(state)), { areas: ['astrology', 'taro'], topics: ['career'], page: 2, lang: 'en', invalid: [] });
});
test('malformed page, duplicate singleton and unsupported locale remain explicit errors', () => {
  for (const value of ['0', '-1', '1.2', 'abc', 'Infinity', '9007199254740992']) assert(model.readQuery('?page=' + value).invalid.includes('page'));
  assert(model.readQuery('?page=1&page=2').invalid.includes('page'));
  assert(model.readQuery('?lang=de').invalid.includes('lang'));
});
test('all 2048 option combinations have unique, consistent paginated results', async () => {
  const run = data.demo(fixtures);
  for (let a = 0; a < 32; a++) for (let t = 0; t < 64; t++) {
    const areas = model.areas.filter((id, index) => a & (1 << index));
    const topics = model.topics.filter((id, index) => t & (1 << index));
    const expected = fixtures.filter(p => (!areas.length || areas.some(id => p.areas.includes(id))) && (!topics.length || topics.some(id => p.topics.includes(id))));
    const first = await run({ ...query, areas, topics });
    const all = [...first.items];
    for (let page = 2; page <= first.pages; page++) all.push(...(await run({ ...query, areas, topics, page })).items);
    assert.equal(first.total, expected.length);
    assert.deepEqual(all.map(p => p.id), expected.map(p => p.id));
    assert.equal(new Set(all.map(p => p.id)).size, all.length);
  }
});
