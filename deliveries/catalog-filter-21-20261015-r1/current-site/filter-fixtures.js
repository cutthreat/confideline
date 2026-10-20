(function (root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.CatalogFilterFixtures = data;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  return [
    { id: 'demo-elena', name: 'Elena', photo: 'images/elena.jpeg', areas: ['taro', 'numerology'], topics: ['love', 'career', 'soulmate'], status: 'online' },
    { id: 'demo-marina', name: 'Marina', photo: 'images/marina.png', areas: ['astrology'], topics: ['career', 'life-path', 'fortune'], status: 'busy' },
    { id: 'demo-anna', name: 'Anna', photo: 'images/anna.jpeg', areas: ['mediums'], topics: ['love', 'life-path'], status: 'offline' },
    { id: 'demo-alex', name: 'Alex', photo: 'images/alex.jpeg', areas: ['palmistry', 'taro'], topics: ['fortune', 'soulmate', 'career'], status: 'online' },
    { id: 'demo-sofia', name: 'Sofia', photo: 'images/sofia.jpeg', areas: ['numerology'], topics: ['love', 'soulmate'], status: 'online' },
    { id: 'demo-maria', name: 'Maria', photo: 'images/maria.png', areas: ['mediums', 'palmistry'], topics: ['fertility', 'love'], status: 'busy' }
  ];
});
