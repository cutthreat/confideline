(() => {
  'use strict';
  const root = document.querySelector('.client-reference');
  const find = selector => root.querySelector(selector);
  const params = new URLSearchParams(location.search);
  const scenario = params.get('scenario') || '';
  const suffix = /^[a-z0-9-]{1,40}$/.test(scenario) ? '-' + scenario : '';
  const scenarioQuery = suffix ? '?scenario=' + encodeURIComponent(scenario) : '';
  const read = key => { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch (_) { return {}; } };
  const policy = () => read('confideline-split-preview-v1-chat' + suffix);
  const capacity = () => { const n = Number(policy().paidCapacity ?? 1); return Number.isInteger(n) && n >= 0 && n <= 5 ? n : 1; };
  const waitingDays = () => { const n = Number(policy().waitingDays ?? 7); return Number.isInteger(n) && n >= 1 && n <= 7 ? n : 7; };
  const subscriptionsKey = 'confideline-split-wait-preview-v1' + suffix;
  let subscriptions = read(subscriptionsKey);
  const saveSubscriptions = () => localStorage.setItem(subscriptionsKey, JSON.stringify(subscriptions));
  const buttonSettings = read('confideline-split-preview-v1-catalog' + suffix);
  const exampleOnlineWait = params.get('example') === 'online-wait';
  const {defaults, actionLabels, isValid} = window.CatalogActionLabels;
  const cardActions = Object.fromEntries(Object.entries(defaults).map(([status, preset]) => {
    const action = exampleOnlineWait && status === 'offline' ? 'wait' : (buttonSettings['action-' + status] || preset.action);
    const savedLabel = exampleOnlineWait && status === 'offline' ? 'Уведомить меня' : buttonSettings['caption-' + status];
    return [status, {action, label:isValid(savedLabel) ? savedLabel.trim() : actionLabels[action] || preset.label, url:buttonSettings['link-' + status] || ''}];
  }));
  const icons = {chat:'fa-comment-o', wait:'fa-bell-o', booking:'fa-calendar-o', link:'fa-external-link'};
  const catalog = find('#catalog-grid');
  const dialog = find('#wait');
  let waitProfile = null;
  let waitKind = null;
  let trigger = null;
  function activeSubscription(id) {
    const saved = subscriptions[id];
    const deadline = Number(typeof saved === 'object' && saved ? saved.deadline : saved);
    const kind = typeof saved === 'object' && saved?.kind === 'online' ? 'online' : 'slot';
    if (deadline && deadline > Date.now()) return {deadline, kind};
    if (id in subscriptions) { delete subscriptions[id]; saveSubscriptions(); }
    return null;
  }
  function getChannels() {
    const admin = policy();
    const user = read('confideline-split-channels-v1' + suffix);
    const allowed = ['site','email'].filter(channel => admin[channel === 'site' ? 'availableSite' : 'availableEmail'] !== false);
    const preferred = Array.isArray(user.preferredAvailability) ? user.preferredAvailability : ['site'];
    return {allowed, selected:preferred.filter(channel => allowed.includes(channel))};
  }
  function showWait(cancelled = false) {
    const profile = window.CatalogFilterFixtures.find(item => item.id === waitProfile);
    const subscription = activeSubscription(waitProfile);
    const kind = subscription?.kind || waitKind;
    const channels = getChannels();
    find('#wait-profile-name').textContent = profile?.name || 'Эксперт';
    find('#wait-title').textContent = kind === 'online' ? 'Уведомить, когда эксперт в сети?' : 'Уведомить, когда освободится?';
    find('#wait-form').hidden = Boolean(subscription) || cancelled;
    find('#wait-active').hidden = !subscription || cancelled;
    find('#wait-cancelled').hidden = !cancelled;
    find('#wait-until').textContent = subscription ? 'Подписка действует до ' + new Intl.DateTimeFormat('ru-RU',{dateStyle:'long',timeStyle:'short'}).format(subscription.deadline) + '.' : '';
    const confirm = find('#wait-confirm');
    confirm.hidden = false;
    confirm.disabled = true;
    find('#wait-open-chat').hidden = true;
    find('#wait-settings').hidden = true;
    find('#wait-active-settings').hidden = true;
    find('#wait-description').textContent = '';
    find('#wait-channel-message').textContent = '';
    find('#wait-active-channel-message').textContent = '';
    if (cancelled) return;
    const eventAlreadyOccurred = kind === 'online' ? profile?.status !== 'offline' : profile?.status === 'online';
    if (eventAlreadyOccurred && !subscription) {
      find('#wait-description').textContent = kind === 'online' ? 'Эксперт уже в сети. Вы можете открыть чат; он может быть занят.' : 'Эксперт уже доступен. Вы можете открыть чат.';
      confirm.hidden = true;
      find('#wait-open-chat').hidden = false;
      return;
    }
    if (!subscription && kind === 'slot' && (capacity() === 0 || params.get('mode') === '2')) {
      find('#wait-description').textContent = 'Платные консультации сейчас недоступны.';
      confirm.hidden = true;
      return;
    }
    const message = find(subscription ? '#wait-active-channel-message' : '#wait-channel-message');
    if (!channels.allowed.length) {
      message.textContent = subscription ? 'Доставка временно недоступна. Ожидание сохранится до указанного срока.' : 'Уведомления сейчас недоступны.';
    } else if (!channels.selected.length) {
      message.textContent = subscription ? 'Доставка временно недоступна. Включите способ уведомления до окончания ожидания.' : 'Выберите способ уведомления в настройках, затем подтвердите ожидание.';
      find(subscription ? '#wait-active-settings' : '#wait-settings').hidden = false;
    } else if (!subscription) {
      const days = waitingDays();
      const promise = kind === 'online' ? 'Сообщим, когда эксперт появится в сети, даже если он занят.' : 'Сообщим, когда эксперт освободится для платной консультации.';
      find('#wait-description').textContent = promise + ' Ожидание действует ' + days + ' ' + (days === 1 ? 'день' : [2,3,4].includes(days) ? 'дня' : 'дней') + '.';
      confirm.disabled = false;
    }
  }
  find('#wait-settings').href += scenarioQuery;
  find('#wait-active-settings').href += scenarioQuery;
  for (const profile of window.CatalogFilterFixtures) {
    catalog.insertAdjacentHTML('beforeend', window.CatalogExpertCard.render(profile));
    const card = catalog.lastElementChild;
    const note = document.createElement('p');
    note.className = 'cl-availability-note'; note.setAttribute('aria-hidden','true');
    card.querySelector('.cl-expert-footer').after(note);
    if (params.get('mode') === '2') card.querySelector('.cl-expert-price')?.remove();
    const action = cardActions[profile.status];
    const original = card.querySelector('[data-card-action="chat"]');
    if (!action || action.action === 'none') { original.remove(); continue; }
    const existingWait = action.action === 'wait' && activeSubscription(profile.id);
    const paidDisabled = params.get('mode') === '2' || capacity() === 0;
    const blockedAction = action.action === 'booking' || (action.action === 'wait' && !existingWait && profile.status === 'busy');
    if (paidDisabled && blockedAction) {
      if (params.get('mode') !== '2') { note.textContent = 'Платные консультации недоступны'; note.removeAttribute('aria-hidden'); }
      original.remove(); continue;
    }
    const label = document.createElement('span'); label.dataset.actionLabel = ''; label.textContent = existingWait && (capacity() === 0 || params.get('mode') === '2') ? 'Ожидание' : action.label; label.title = label.textContent;
    const icon = original.querySelector('i'); icon.className = 'fa ' + (icons[action.action] || icons.chat);
    original.replaceChildren(icon, label, original.querySelector('.sr-only'));
    if (action.action === 'chat') continue;
    if (action.action === 'link') {
      let safe = /^\/(?![\/\\])\S*$/.test(action.url);
      if (!safe) { try { safe = ['http:','https:'].includes(new URL(action.url).protocol); } catch (_) {} }
      if (!safe) { original.remove(); continue; }
      original.removeAttribute('data-card-action'); original.href = action.url; original.rel = 'noopener noreferrer'; continue;
    }
    const button = document.createElement('button');
    button.type = 'button'; button.className = original.className; button.dataset.profileId = profile.id;
    button.dataset.open = action.action;
    button.replaceChildren(...original.childNodes); original.replaceWith(button);
    if (action.action === 'booking') {
      button.disabled = true; button.title = 'Запись пока недоступна';
      note.textContent = 'Запись пока недоступна'; note.removeAttribute('aria-hidden');
    } else if (action.action === 'wait') {
      button.setAttribute('aria-haspopup','dialog'); button.setAttribute('aria-controls','wait');
      button.addEventListener('click', event => { event.stopPropagation(); trigger = button; waitProfile = profile.id; waitKind = activeSubscription(profile.id)?.kind || (profile.status === 'offline' ? 'online' : 'slot'); showWait(); dialog.showModal(); find('#wait-title').focus(); });
    }
  }
  find('#wait-confirm').addEventListener('click', () => {
    const channels = getChannels();
    const profile = window.CatalogFilterFixtures.find(item => item.id === waitProfile);
    const paidDisabled = capacity() === 0 || params.get('mode') === '2';
    const eventAlreadyOccurred = waitKind === 'online' ? profile?.status !== 'offline' : profile?.status === 'online';
    if (!channels.allowed.length || !channels.selected.length || (waitKind === 'slot' && paidDisabled) || eventAlreadyOccurred) { showWait(); return; }
    subscriptions[waitProfile] = {deadline: Date.now() + waitingDays() * 86400000, kind: waitKind};
    saveSubscriptions(); showWait(); find('#wait-active [data-close]').focus();
  });
  find('#wait-open-chat').addEventListener('click', () => {
    const card = trigger?.closest('.cl-expert-card');
    if (!card) return;
    const chat = document.createElement('button');
    chat.type = 'button'; chat.hidden = true; chat.dataset.cardAction = 'chat';
    card.append(chat); dialog.close(); chat.click(); chat.remove();
  });
  find('#wait-cancel').addEventListener('click', () => { delete subscriptions[waitProfile]; saveSubscriptions(); showWait(true); find('#wait-cancelled [data-close]').focus(); });
  dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('close', () => {
    const profile = window.CatalogFilterFixtures.find(item => item.id === waitProfile);
    if (trigger && waitKind === 'slot' && profile?.status === 'busy' && (capacity() === 0 || params.get('mode') === '2') && !activeSubscription(waitProfile)) {
      const card = trigger.closest('.cl-expert-card');
      const note = card?.querySelector('.cl-availability-note');
      trigger.remove();
      if (note && params.get('mode') !== '2') { note.textContent = 'Платные консультации недоступны'; note.removeAttribute('aria-hidden'); }
      card?.querySelector('.cl-expert-title a')?.focus();
    } else trigger?.focus();
  });
  window.addEventListener('focus', () => { if (dialog.open) showWait(); });
  const navToggle = find('.reference-nav-toggle');
  navToggle.addEventListener('click', () => { const expanded = navToggle.getAttribute('aria-expanded') === 'false'; navToggle.setAttribute('aria-expanded', String(expanded)); find('#header-navigation').classList.toggle('show', expanded); });
})();
