(function () {
  'use strict';
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const client = params.get('audience') === 'client';
  const requested = window.CatalogFilterModel.readQuery(params.get('return') || '');
  const query = requested.invalid.length ? '' : window.CatalogFilterModel.writeQuery(requested);
  const catalog = 'catalog-filter' + (client ? '-auth' : '') + '.html' + (query ? '?' + query : '');
  const clientCatalog = 'catalog-filter-auth.html' + (query ? '?' + query : '');
  const profile = window.CatalogFilterFixtures.find(item => item.id === id);
  const $ = name => document.getElementById(name);
  const en = requested.lang === 'en';
  if (en) {
    document.documentElement.lang = 'en';
    document.querySelectorAll('[data-en]').forEach(el => { el.textContent = el.dataset.en; });
    $('close-login').setAttribute('aria-label', 'Close');
    document.querySelector('.profile-aside').setAttribute('aria-label', 'Contact expert');
  }
  for (const name of ['brand-link', 'header-back', 'back-link']) $(name).href = catalog;
  if (!profile) { $('profile-missing').hidden = false; return; }
  const words = window.CatalogFilterModel.profileLabels;
  const status = en ? { online: 'Online', busy: 'Busy', offline: 'Offline' } : { online: 'В сети', busy: 'Занят', offline: 'Не в сети' };
  document.title = profile.name + (en ? ' — expert profile' : ' — профиль эксперта');
  $('profile-name').textContent = profile.name;
  $('breadcrumb-name').textContent = profile.name;
  $('profile-status').textContent = status[profile.status] || '';
  $('profile-status').dataset.status = profile.status;
  if (profile.photo) {
    const photo = $('profile-photo');
    photo.addEventListener('error', () => { photo.hidden = true; $('photo-placeholder').hidden = false; });
    photo.alt = profile.name;
    photo.src = profile.photo;
  } else {
    $('profile-photo').hidden = true;
    $('photo-placeholder').hidden = false;
  }
  const areas = profile.areas.map(key => words.areas[key]).filter(Boolean);
  const topics = profile.topics.map(key => words.topics[key]).filter(Boolean);
  function tags(id, values) {
    const list = $(id);
    for (const value of values) { const li = document.createElement('li'); li.textContent = value; list.append(li); }
  }
  tags('profile-areas', areas);
  tags('profile-topics', topics);
  $('profile-about').textContent = en
    ? (topics.length ? 'I work with questions about ' + topics.join(', ') + '. You can discuss your question and the consultation format in chat.' : 'You can discuss your question and the consultation format in chat.')
    : (topics.length ? 'Работаю с запросами по темам: ' + topics.join(', ') + '. В переписке можно уточнить ваш вопрос и формат консультации.' : 'В переписке можно уточнить ваш вопрос и формат консультации.');
  if (Number.isSafeInteger(profile.experience) && profile.experience > 0) {
    const years = en ? (profile.experience === 1 ? 'year of experience' : 'years of experience') : ({one:'год опыта',few:'года опыта',many:'лет опыта',other:'лет опыта'}[new Intl.PluralRules('ru').select(profile.experience)]);
    $('profile-experience').textContent = profile.experience + ' ' + years;
  } else $('experience-section').hidden = true;
  const rating = Number.isFinite(profile.rating) && profile.rating >= 1 && profile.rating <= 5 && profile.votes > 0;
  const votes = en ? (profile.votes === 1 ? 'rating' : 'ratings') : ({one:'оценка',few:'оценки',many:'оценок',other:'оценки'}[new Intl.PluralRules('ru').select(profile.votes)]);
  $('profile-rating').textContent = rating ? '★ ' + profile.rating.toFixed(1) + ' · ' + profile.votes + ' ' + votes : (en ? 'No ratings yet' : 'Пока нет оценок');
  $('profile-reviews').textContent = rating ? profile.votes + ' ' + votes + ' · ' + profile.rating.toFixed(1) + (en ? ' out of 5' : ' из 5') : (en ? 'No ratings yet' : 'Пока нет оценок');
  const hasPrice = Number.isFinite(profile.creditsPerMinute) && profile.creditsPerMinute > 0;
  $('profile-price').textContent = hasPrice ? profile.creditsPerMinute + (en ? ' credits / min' : ' кредитов / мин') : (en ? 'Terms in chat' : 'Условия в чате');
  if (client && hasPrice && Number.isSafeInteger(profile.trialMinutes) && profile.trialMinutes > 0) {
    $('profile-trial').textContent = en ? 'First ' + profile.trialMinutes + ' min free' : 'Первые ' + profile.trialMinutes + ' мин бесплатно';
    $('profile-trial').hidden = false;
  }
  const hash = '#chat=' + encodeURIComponent(profile.id);
  for (const name of ['profile-chat', 'mobile-chat']) {
    const link = $(name);
    link.href = catalog + hash;
    if (!client) link.addEventListener('click', event => {
      event.preventDefault();
      $('login-text').textContent = en ? 'Sign in to message ' + profile.name + '.' : 'Войдите, чтобы написать ' + profile.name + '.';
      $('login-link').href = clientCatalog + hash;
      $('login-dialog').showModal();
    });
  }
  $('close-login').addEventListener('click', () => $('login-dialog').close());
  $('profile-view').hidden = false;
})();
