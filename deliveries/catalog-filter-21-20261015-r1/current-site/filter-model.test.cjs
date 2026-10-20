const test = require('node:test');
const assert = require('node:assert/strict');
const model = require('./filter-model.js');

const fixtures = [
  { id: 'a', areas: ['taro', 'astrology'], topics: ['love'], status: 'online' },
  { id: 'b', areas: ['numerology'], topics: ['love', 'career'], status: 'busy' },
  { id: 'c', areas: ['taro'], topics: ['career'], status: 'offline' },
  { id: 'd', areas: [], topics: [] },
  { id: 'unpublished', areas: ['taro'], topics: ['love'], published: false }
];
const ids = profiles => profiles.map(profile => profile.id);

test('no selection returns all published profiles, including busy/offline', () => {
  assert.deepEqual(ids(model.select(fixtures, [], [])), ['a', 'b', 'c', 'd']);
});
test('area values are OR', () => {
  assert.deepEqual(ids(model.select(fixtures, ['taro', 'numerology'], [])), ['a', 'b', 'c']);
});
test('topic values are OR', () => {
  assert.deepEqual(ids(model.select(fixtures, [], ['love', 'career'])), ['a', 'b', 'c']);
});
test('groups are AND', () => {
  assert.deepEqual(ids(model.select(fixtures, ['taro'], ['career'])), ['c']);
});
test('a profile matching several values occurs once', () => {
  assert.deepEqual(ids(model.select([...fixtures, fixtures[0]], ['taro', 'astrology'], [])), ['a', 'c']);
});
test('an empty group does not restrict the other group', () => {
  assert.deepEqual(ids(model.select(fixtures, [], ['love'])), ['a', 'b']);
});
test('incompatible filters produce an empty result', () => {
  assert.deepEqual(model.select(fixtures, ['palmistry'], ['fertility']), []);
});
test('pagination follows filtered unique results and retains their total', () => {
  const slice = model.paginate(model.select([...fixtures, fixtures[0]], [], []), 2, 2);
  assert.deepEqual({ ...slice, items: ids(slice.items) }, { page: 2, pages: 2, total: 4, items: ['c', 'd'] });
});
test('out-of-range page clamps to the available range', () => {
  assert.equal(model.paginate(fixtures, 99, 4).page, 2);
  for (const value of [-2, 0, NaN, 'invalid']) assert.equal(model.paginate(fixtures, value, 4).page, 1);
});
test('empty result has no extra pages', () => {
  assert.deepEqual(model.paginate([], 99, 4), { page: 1, pages: 1, total: 0, items: [] });
});
test('reload query restores values, language and requested page', () => {
  assert.deepEqual(model.readQuery('?areas=taro,numerology&topics=love&page=2&lang=en'), {
    areas: ['taro', 'numerology'], topics: ['love'], page: 2, lang: 'en', invalid: []
  });
});
test('repeated query values are unique', () => {
  assert.deepEqual(model.readQuery('?areas=taro,taro&areas=astrology').areas, ['taro', 'astrology']);
});
test('unknown filter IDs remain an explicit error, not an unfiltered success', () => {
  assert.deepEqual(model.readQuery('?areas=unknown,taro').invalid, ['areas:unknown']);
});
test('unknown parameter is explicitly reported', () => {
  assert.deepEqual(model.readQuery('?rating=5').invalid, ['rating']);
});
test('all eleven canonical IDs remain available', () => {
  assert.equal(model.areas.length, 5);
  assert.equal(model.topics.length, 6);
  assert(model.areas.includes('taro'));
  assert(model.topics.includes('fortune'));
});
