(function (root, factory) {
  const model = factory();
  if (typeof module === 'object' && module.exports) module.exports = model;
  else root.CatalogFilterModel = model;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const areas = ['astrology', 'mediums', 'taro', 'numerology', 'palmistry'];
  const topics = ['love', 'fortune', 'career', 'life-path', 'fertility', 'soulmate'];
  const profileLabels = {
    areas: { astrology: 'Astrologer', mediums: 'Medium', taro: 'Tarot Reader', numerology: 'Numerologist', palmistry: 'Palmistry', psychic: 'Psychic', clairvoyant: 'Clairvoyant', 'spiritual-practitioner': 'Spiritual Practitioner', 'psychoenergetic-practitioner': 'Psychoenergetic Practitioner', 'energy-healer': 'Energy Healer', 'intuitive-consultant': 'Intuitive Consultant', 'karmic-consultant': 'Karmic Consultant', 'spiritual-mentor': 'Spiritual Mentor', 'mindfulness-practitioner': 'Mindfulness Practitioner', 'subconscious-work-specialist': 'Subconscious Work Specialist', empath: 'Empath' },
    topics: { love: 'Love & Relationships', fortune: 'Fortune', career: 'Career & Purpose', 'life-path': 'Future & Life Path', fertility: 'Fertility', soulmate: 'Soulmate', romance: 'Romance & Dating', family: 'Marriage & Family', breakups: 'Breakups & Divorce', partner: 'Finding a Partner', compatibility: 'Compatibility', finances: 'Money & Finances', business: 'Business & Projects', decisions: 'Choices & Decisions', karmic: 'Karmic Connections', energy: 'Energy Diagnostics', growth: 'Personal Growth', balance: 'Emotional Balance', uncertainty: 'Worries & Uncertainty', blocks: 'Inner Blocks', confidence: 'Confidence & Self-Esteem', spiritual: 'Spiritual Development', ancestral: 'Ancestral Themes', relocation: 'Relocation & Life Changes' }
  };
  function normalize(values, allowed) {
    return [...new Set(values)].filter(value => allowed.includes(value));
  }
  function select(profiles, selectedAreas, selectedTopics) {
    const a = normalize(selectedAreas, areas);
    const t = normalize(selectedTopics, topics);
    return [...new Map(profiles.filter(profile => profile.published !== false &&
      (!a.length || (profile.areas || []).some(value => a.includes(value))) &&
      (!t.length || (profile.topics || []).some(value => t.includes(value))))
      .map(profile => [profile.id, profile])).values()];
  }
  function paginate(items, requestedPage, pageSize) {
    const pages = Math.max(1, Math.ceil(items.length / pageSize));
    const page = Math.min(pages, Math.max(1, Math.trunc(Number(requestedPage)) || 1));
    return { page, pages, total: items.length, items: items.slice((page - 1) * pageSize, page * pageSize) };
  }
  function readQuery(search) {
    const params = new URLSearchParams(search);
    const invalid = [];
    const values = name => params.getAll(name).flatMap(value => value.split(',')).filter(Boolean);
    for (const name of params.keys()) {
      if (!['areas', 'topics', 'page', 'lang'].includes(name)) invalid.push(name);
    }
    for (const [name, allowed] of [['areas', areas], ['topics', topics]]) {
      for (const value of values(name)) if (!allowed.includes(value)) invalid.push(`${name}:${value}`);
    }
    if (params.has('page') && (params.getAll('page').length !== 1 || !/^[1-9]\d*$/.test(params.get('page')) || !Number.isSafeInteger(Number(params.get('page'))))) invalid.push('page');
    if (params.has('lang') && (params.getAll('lang').length !== 1 || !['ru', 'en'].includes(params.get('lang')))) invalid.push('lang');
    return {
      areas: normalize(values('areas'), areas), topics: normalize(values('topics'), topics),
      page: Number(params.get('page')) || 1, lang: params.get('lang') === 'en' ? 'en' : 'ru',
      invalid: [...new Set(invalid)]
    };
  }
  function writeQuery(state) {
    const params = new URLSearchParams();
    for (const [name, allowed] of [['areas', areas], ['topics', topics]]) {
      const values = normalize(state[name] || [], allowed).sort();
      if (values.length) params.set(name, values.join(','));
    }
    if (state.page > 1) params.set('page', String(state.page));
    if (state.lang === 'en') params.set('lang', 'en');
    return params.toString();
  }
  return { areas, topics, profileLabels, normalize, select, paginate, readQuery, writeQuery };
});
