(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.CatalogExpertCard = api; api.mount(); }
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const favorite = new Set();
  const validPrice = p => Number.isFinite(p.creditsPerMinute) && p.creditsPerMinute > 0;
  const validTrial = p => validPrice(p) && Number.isSafeInteger(p.trialMinutes) && p.trialMinutes > 0;
  function offer(p, lang) {
    const t = words[lang];
    return `<div class="cl-expert-offer">${validTrial(p) ? `<div class="cl-expert-trial">${esc(t.trial(p.trialMinutes))}</div>` : ''}<div class="cl-expert-price">${validPrice(p) ? `${validTrial(p)?`<span class="cl-expert-price-prefix">${lang==='ru'?'Затем':'Then'}</span>`:''}<strong>${p.creditsPerMinute}</strong><span>${esc(t.rate)}</span>` : esc(t.noPrice)}</div></div>`;
  }
  const words = {
    ru: { online: 'В сети', busy: 'Занят', offline: 'Не в сети', favorite: 'В избранное', unfavorite: 'Убрать из избранного', more: n => `Ещё ${n}`, chat: 'Чат', votes: n => new Intl.PluralRules('ru').select(n) === 'one' ? `${n} оценка` : new Intl.PluralRules('ru').select(n) === 'few' ? `${n} оценки` : `${n} оценок`, experience: n => `Опыт: ${n} ${new Intl.PluralRules('ru').select(n) === 'one' ? 'год' : new Intl.PluralRules('ru').select(n) === 'few' ? 'года' : 'лет'}`, rate: 'кредитов / мин', trial: n => `Первые ${n} мин бесплатно`, noPrice: 'Условия в чате', close: 'Закрыть', profile: 'Профиль', directions: 'Направления', topics: 'Темы', signIn: 'Войти', signInText: name => `Войдите, чтобы написать ${name}`, message: 'Сообщение', send: 'Отправить', noCharge: 'Открытие чата не запускает платную консультацию.', chatTitle: name => `Чат с ${name}` },
    en: { online: 'Online', busy: 'Busy', offline: 'Offline', favorite: 'Add to favorites', unfavorite: 'Remove from favorites', more: n => `${n} more`, chat: 'Chat', votes: n => `${n} ${n === 1 ? 'rating' : 'ratings'}`, experience: n => `${n} ${n === 1 ? 'year' : 'years'} of experience`, rate: 'credits / min', trial: n => `First ${n} min free`, noPrice: 'Terms in chat', close: 'Close', profile: 'Profile', directions: 'Expertise', topics: 'Topics', signIn: 'Sign in', signInText: name => `Sign in to message ${name}`, message: 'Message', send: 'Send', noCharge: 'Opening a chat does not start a paid consultation.', chatTitle: name => `Chat with ${name}` }
  };
  function render(p, lang = 'ru', labels = window.CatalogFilterModel.profileLabels) {
    const t = words[lang], id = esc(p.id), name = esc(p.name);
    const tag = key => `<span class="cl-expert-tag">${esc(labels.areas[key])}</span>`;
    const areas = [...new Set(p.areas)].filter(key => Object.hasOwn(labels.areas, key));
    const rating = Number.isFinite(p.rating) && p.rating >= 1 && p.rating <= 5 && Number.isSafeInteger(p.votes) && p.votes > 0;
    return `<div class="col-12 col-sm-6 col-lg-4 col-xl-3 directory-item cl-expert-item"><article class="card cl-expert-card" data-profile-id="${id}">
      <div class="cl-expert-content"><div class="cl-expert-heading"><div class="cl-expert-avatar">
      <a class="cl-expert-photo" href="#profile-${id}" data-card-action="profile" aria-label="${esc(t.profile)}: ${name}">${p.photo ? `<img class="card-img-top" src="${esc(p.photo)}" width="500" height="500" alt="${name}">` : ''}<span class="cl-expert-photo-fallback" aria-hidden="true"${p.photo ? ' hidden' : ''}><i class="fa fa-user" aria-hidden="true"></i></span></a>
      ${['online','busy','offline'].includes(p.status) ? `<details class="cl-expert-presence" data-status="${esc(p.status)}"><summary aria-label="${name}: ${esc(t[p.status])}"><span aria-hidden="true"></span></summary><span class="cl-expert-presence-label">${esc(t[p.status])}</span></details>` : ''}</div>
      <div class="cl-expert-favorite"><button type="button" data-card-action="favorite" aria-pressed="${favorite.has(p.id)}" aria-label="${esc(favorite.has(p.id) ? t.unfavorite : t.favorite)}: ${name}" title="${esc(favorite.has(p.id) ? t.unfavorite : t.favorite)}"><i class="fa ${favorite.has(p.id) ? 'fa-heart' : 'fa-heart-o'}" aria-hidden="true"></i></button></div>
      <div class="cl-expert-identity"><h2 class="cl-expert-title"><a href="#profile-${id}" data-card-action="profile">${name}</a></h2>
      ${rating ? `<a class="cl-expert-rating" href="#reviews-${id}" data-card-action="reviews" aria-label="${esc(`${p.name}: ${p.rating.toFixed(1)} / 5, ${t.votes(p.votes)}`)}"><i class="fa fa-star" aria-hidden="true"></i><strong>${p.rating.toFixed(1)}</strong><span>· ${esc(t.votes(p.votes))}</span></a>` : ''}
      ${Number.isSafeInteger(p.experience) && p.experience > 0 ? `<p class="cl-expert-experience">${esc(t.experience(p.experience))}</p>` : ''}
      </div></div><div class="cl-expert-directions">
      ${areas.length ? `<div class="cl-expert-areas">${areas.slice(0,2).map(tag).join('')}</div>` : ''}
      ${areas.length > 2 ? `<details class="cl-expert-more"><summary><span class="cl-expert-more-label">${esc(t.more(areas.length-2))}<span class="sr-only">: ${esc(t.directions)}, ${name}</span></span><span class="cl-expert-less-label">${lang==='ru'?'Свернуть':'Show less'}<span class="sr-only">: ${esc(t.directions)}, ${name}</span></span><i class="fa fa-angle-down" aria-hidden="true"></i></summary><div class="cl-expert-areas">${areas.slice(2).map(tag).join('')}</div></details>` : ''}
      </div><div class="cl-expert-footer">${offer(p,lang)}
      <a class="btn btn-primary cl-expert-chat" href="#chat-${id}" data-card-action="chat"><i class="fa fa-comment-o" aria-hidden="true"></i>${esc(t.chat)}<span class="sr-only">: ${name}</span></a></div></div></article></div>`;
  }
  // Preview-only interactions; production links and favorite controls belong to the site.
  function mount() {
    const root = document.querySelector('.cl-catalog');
    if (!root) return;
    let trigger, current, mode;
    const drafts = new Map(), messages = new Map();
    const dialog = document.createElement('dialog');
    dialog.className = 'cl-expert-demo-dialog';
    dialog.setAttribute('aria-labelledby', 'expert-preview-title');
    root.append(dialog);
    const language = () => root.lang === 'en' || (!root.lang && new URLSearchParams(location.search).get('lang') === 'en') ? 'en' : 'ru';
    function close() {
      dialog.close();
      const card = [...root.querySelectorAll('[data-profile-id]')].find(node=>node.dataset.profileId===current?.id);
      const target = trigger?.isConnected ? trigger : card?.querySelector('[data-card-action="chat"]');
      target?.focus({preventScroll:true});
    }
    function show(p, action, owner) {
      current = p; mode = action; trigger = owner || trigger;
      const t = words[language()], labels = window.CatalogFilterModel.profileLabels;
      const auth = document.body.classList.contains('light');
      const title = action === 'chat' ? t.chatTitle(p.name) : p.name;
      let body;
      if (action === 'favorite' && !auth) {
        body = `<p>${language()==='ru'?`Войдите, чтобы добавить ${esc(p.name)} в избранное`:`Sign in to add ${esc(p.name)} to favorites`}</p><a class="btn btn-primary" href="catalog-filter-auth.html${esc(location.search)}#favorite=${encodeURIComponent(p.id)}">${esc(t.signIn)}</a>`;
      } else if (action === 'reviews') {
        body = `<p>${Number.isFinite(p.rating) && p.votes > 0 ? `${p.rating.toFixed(1)} / 5 · ${esc(t.votes(p.votes))}` : ''}</p><p>${language()==='ru'?'Текстовых отзывов пока нет.':'No written reviews yet.'}</p>`;
      } else if (action !== 'chat') {
        body = `${p.photo?`<img class="cl-expert-demo-avatar" src="${esc(p.photo)}" alt="">`:''}<div class="cl-expert-demo-details"><h3>${esc(t.directions)}</h3><p>${p.areas.map(k=>esc(labels.areas[k])).join(' · ')}</p><h3>${esc(t.topics)}</h3><p>${p.topics.map(k=>esc(labels.topics[k])).join(' · ')}</p></div><button type="button" class="btn btn-primary" data-demo-chat>${esc(t.chat)}</button>`;
      } else if (!auth) {
        body = `<p>${esc(t.signInText(p.name))}</p><a class="btn btn-primary" href="catalog-filter-auth.html${esc(location.search)}#chat=${encodeURIComponent(p.id)}">${esc(t.signIn)}</a>`;
      } else {
        body = `<div class="cl-expert-demo-terms">${offer(p,language())}</div><p>${esc(t.noCharge)}</p><div class="cl-expert-demo-messages" aria-live="polite">${(messages.get(p.id)||[]).map(s=>`<p>${esc(s)}</p>`).join('')}</div><form data-demo-message><label for="expert-demo-message">${esc(t.message)}</label><textarea id="expert-demo-message" name="message" required maxlength="2000" rows="3">${esc(drafts.get(p.id)||'')}</textarea><button class="btn btn-primary" type="submit">${esc(t.send)}</button></form>`;
      }
      dialog.innerHTML = `<header><h2 id="expert-preview-title" tabindex="-1">${action==='reviews'?(language()==='ru'?'Отзывы: ':'Reviews: '):''}${esc(title)}</h2><button type="button" data-demo-close aria-label="${esc(t.close)}"><i class="fa fa-times" aria-hidden="true"></i></button></header><div class="cl-expert-demo-body">${body}</div>`;
      if (!dialog.open) dialog.showModal();
      dialog.querySelector('h2').focus({preventScroll:true});
    }
    root.addEventListener('click', event => {
      const button = event.target.closest('[data-card-action]');
      if (!button) return;
      event.preventDefault();
      const p = window.CatalogFilterFixtures.find(p=>p.id===button.closest('[data-profile-id]').dataset.profileId);
      if (!p) return;
      if (button.dataset.cardAction === 'favorite') {
        if (!document.body.classList.contains('light')) { show(p,'favorite',button); return; }
        favorite.has(p.id) ? favorite.delete(p.id) : favorite.add(p.id);
        const t=words[language()], label=favorite.has(p.id)?t.unfavorite:t.favorite;
        button.setAttribute('aria-pressed', String(favorite.has(p.id)));
        button.setAttribute('aria-label', `${label}: ${p.name}`); button.title=label;
        button.querySelector('i').className='fa '+(favorite.has(p.id)?'fa-heart':'fa-heart-o');
      } else show(p, button.dataset.cardAction, button);
    });
    dialog.addEventListener('cancel', event=>{event.preventDefault();close();});
    dialog.addEventListener('click', event=>{
      if (event.target.closest('[data-demo-close]')) close();
      if (event.target.closest('[data-demo-chat]')) show(current,'chat');
    });
    dialog.addEventListener('input',event=>{if(event.target.name==='message'){event.target.setCustomValidity('');drafts.set(current.id,event.target.value);}});
    dialog.addEventListener('submit',event=>{
      event.preventDefault(); const field=dialog.querySelector('textarea'); const value=field.value.trim();
      if (!value) { field.setCustomValidity(language()==='ru'?'Введите сообщение':'Enter a message'); field.reportValidity(); return; }
      field.setCustomValidity(''); messages.set(current.id,[...(messages.get(current.id)||[]),value]); drafts.delete(current.id); show(current,mode); dialog.querySelector('textarea').focus();
    });
    const favoriteId = new URLSearchParams(location.hash.slice(1)).get('favorite');
    if (document.body.classList.contains('light') && window.CatalogFilterFixtures.some(p=>p.id===favoriteId)) favorite.add(favoriteId);
    const requested = new URLSearchParams(location.hash.slice(1)).get('chat');
    const p = window.CatalogFilterFixtures.find(p=>p.id===requested);
    if (p) show(p,'chat');
    if (favoriteId || requested) {
      const hash = new URLSearchParams(location.hash.slice(1));
      hash.delete('favorite'); hash.delete('chat');
      history.replaceState(null,'',location.pathname+location.search+(hash.size?'#'+hash.toString():''));
    }
  }
  return {render, offer, mount};
});
