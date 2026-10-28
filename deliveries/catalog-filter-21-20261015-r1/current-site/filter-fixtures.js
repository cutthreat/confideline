(function (root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.CatalogFilterFixtures = data;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  return [
    { id: 'demo-elena', name: 'Elena', photo: 'images/elena.jpeg', areas: ['taro', 'numerology', 'intuitive-consultant', 'empath'], topics: ['love', 'career', 'soulmate'], status: 'online', rating: 4.8, votes: 124, experience: 8, creditsPerMinute: 30, trialMinutes: 3 },
    { id: 'demo-marina', name: 'Marina', photo: 'images/marina.png', areas: ['astrology', 'spiritual-practitioner', 'spiritual-mentor'], topics: ['career', 'life-path', 'fortune'], status: 'busy', rating: 4.9, votes: 86, experience: 12, creditsPerMinute: 35, trialMinutes: 0 },
    { id: 'demo-anna', name: 'Anna', photo: 'images/anna.jpeg', areas: ['mediums'], topics: ['love', 'life-path'], status: 'offline', rating: null, votes: 0, experience: 5, creditsPerMinute: 25, trialMinutes: 0 },
    { id: 'demo-alex', name: 'Alex', photo: 'images/alex.jpeg', areas: ['palmistry', 'taro', 'psychic'], topics: ['fortune', 'soulmate', 'career'], status: 'online', rating: 4.7, votes: 231, experience: 10, creditsPerMinute: 40, trialMinutes: 3 },
    { id: 'demo-sofia', name: 'Sofia', photo: 'images/sofia.jpeg', areas: ['numerology', 'psychoenergetic-practitioner'], topics: ['love', 'soulmate', 'balance'], status: 'online', rating: 5, votes: 2, experience: null, creditsPerMinute: null, trialMinutes: 0 },
    { id: 'demo-maria', name: 'Maria', photo: 'images/maria.png', areas: ['mediums', 'palmistry'], topics: ['fertility', 'love'], status: 'busy', rating: 4.6, votes: 58, experience: 6, creditsPerMinute: 30, trialMinutes: 0 }
  ];
});
