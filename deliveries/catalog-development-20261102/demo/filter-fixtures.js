(function (root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.CatalogFilterFixtures = data;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  return [
    { isExpert: true, id: 'demo-elena', name: 'Elena', photo: 'images/elena.jpeg', areas: ['taro', 'numerology', 'intuitive-consultant', 'empath'], topics: ['love', 'career', 'partner'], status: 'online', rating: 4.8, votes: 124, experience: 8, creditsPerMinute: 30, trialMinutes: 3 },
    { isExpert: true, id: 'demo-marina', name: 'Marina', photo: 'images/marina.png', areas: ['astrology', 'spiritual-practitioner', 'spiritual-mentor'], topics: ['career', 'life-path', 'finances'], status: 'busy', rating: 4.9, votes: 86, experience: 12, creditsPerMinute: 35, trialMinutes: 0 },
    { isExpert: true, id: 'demo-anna', name: 'Anna', photo: 'images/anna.jpeg', areas: ['mediums'], topics: ['love', 'life-path'], status: 'offline', rating: null, votes: 0, experience: 5, creditsPerMinute: 25, trialMinutes: 0 },
    { isExpert: true, id: 'demo-alex', name: 'Alex', photo: null, areas: ['clairvoyant', 'taro', 'psychic'], topics: ['finances', 'partner', 'career'], status: 'online', rating: 4.7, votes: 231, experience: 10, creditsPerMinute: 40, trialMinutes: 3 },
    { isExpert: true, id: 'demo-sofia', name: 'Sofia', photo: 'images/sofia.jpeg', areas: ['numerology', 'psychoenergetic-practitioner'], topics: ['love', 'partner', 'balance'], status: 'online', rating: 5, votes: 2, experience: null, creditsPerMinute: null, trialMinutes: 0 },
    { isExpert: true, id: 'demo-maria', name: 'Maria', photo: 'images/maria.png', areas: ['mediums', 'clairvoyant'], topics: ['family', 'love'], status: 'busy', rating: 4.6, votes: 58, experience: 6, creditsPerMinute: 30, trialMinutes: 0 }
  ];
});
