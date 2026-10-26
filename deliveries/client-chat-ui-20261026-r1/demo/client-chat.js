(function () {
  'use strict';
  const M = ClientChatModel, $ = id => document.getElementById(id), root = $('client-chat');
  const query = new URLSearchParams(location.search), state = M.createState(query.get('scenario') || 'free');
  const key = 'confideline-client-chat-ui-20261026:personal-drafts';
  const runtimeKey = 'confideline-client-chat-ui-20261026:runtime-v2';
  const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const current = () => state.chats.find(c => c.id === state.selected);
  const fileSize = bytes => bytes > 1024 * 1024 ? (bytes / 1024 / 1024).toFixed(1).replace('.',',') + ' МБ' : Math.max(1,Math.round(bytes / 1024)) + ' КБ';
  const mq = matchMedia('(max-width:767px)');
  let openPopup = null, popupReturn = null, dialogReturn = null, saveTimer, feedbackTimer, selectedMessage = null, searchMatches = [], searchIndex = 0, dialogGeneration = 0;
  let sessionClockStarted = Date.now(), sessionClockBase = current().session.elapsed, termsContext = null;
  function error(message) { $('cc-composer-error').textContent = message; $('cc-composer-error').hidden = false; }
  function feedback(message, undo) {
    const el = $('cc-feedback'); clearTimeout(feedbackTimer); el.replaceChildren(document.createTextNode(message));
    if (undo) { const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Отменить'; button.onclick = () => { undo(); el.hidden = true; }; el.append(button); }
    el.hidden = false; feedbackTimer = setTimeout(() => { el.hidden = true; },8000);
  }
  function persist() {
    const drafts = Object.fromEntries(state.chats.map(c => [c.id,{text:c.draft.text,replyId:c.draft.replyId,revision:c.draft.revision}]));
    try { localStorage.setItem(key,JSON.stringify({savedAt:Date.now(),drafts})); }
    catch { error('Черновик не удалось сохранить в браузере. Не закрывайте страницу до отправки.'); }
    try { sessionStorage.setItem(runtimeKey,JSON.stringify({savedAt:Date.now(),balance:state.balance,chats:state.chats.map(c=>({id:c.id,deleted:c.deleted,session:{...c.session,elapsed:c.id===state.selected&&c.session.status==='active'?sessionClockBase+Math.floor((Date.now()-sessionClockStarted)/1000):c.session.elapsed},messages:c.messages.slice(-200),preview:c.preview}))},(k,v)=>['blob','url','requesting'].includes(k)?undefined:v)); }
    catch { /* Local navigation continuity is independent of message delivery. */ }
  }
  try {
    const saved=JSON.parse(sessionStorage.getItem(runtimeKey)||'null');
    if(!query.has('scenario')&&saved&&Array.isArray(saved.chats)){
      for(const c of state.chats){const item=saved.chats.find(x=>x.id===c.id);if(!item)continue;c.deleted=!!item.deleted;if(item.session){M.applySession(c,item.session);if(item.session.pendingOperation)c.session.pendingOperation={...item.session.pendingOperation,status:'unknown'};}if(Array.isArray(item.messages))c.messages=item.messages.filter(m=>typeof m.id==='string'&&typeof m.text==='string').slice(-200).map(m=>({...m,status:m.status==='pending'?'failed':m.status}));if(typeof item.preview==='string')c.preview=item.preview;}
      if(Number.isFinite(saved.balance)&&saved.balance>=0)state.balance=saved.balance;
      if(Number.isFinite(saved.savedAt)){const delta=Math.max(0,Math.floor((Date.now()-saved.savedAt)/1000));state.chats.filter(c=>c.session.status==='active').forEach(c=>c.session.elapsed+=delta);}
      sessionClockBase=current().session.elapsed||0;sessionClockStarted=Date.now();
    }
  }catch{}
  const previewBalance=document.querySelector('.header .user-balance');if(previewBalance)previewBalance.textContent=state.balance.toFixed(2);
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && Date.now() - saved.savedAt < 7 * 86400000 && saved.drafts && typeof saved.drafts === 'object') {
      for (const c of state.chats) {
        const d = saved.drafts[c.id];
        if (d && typeof d.text === 'string' && d.text.length <= 4000) { M.editDraft(c,{text:d.text,replyId:c.messages.some(m => m.id === d.replyId) ? d.replyId : null}); if(Number.isSafeInteger(d.revision)&&d.revision>=0)c.draft.revision=d.revision; }
      }
    }
  } catch { /* A corrupt or blocked local draft never replaces the current conversation. */ }
  function closePopup(restore = false) {
    if (!openPopup) return;
    openPopup.hidden = true;
    popupReturn?.setAttribute('aria-expanded','false');
    if (restore && popupReturn?.isConnected) popupReturn.focus({preventScroll:true});
    openPopup = popupReturn = null;
  }
  function togglePopup(button, popup) {
    const closing = openPopup === popup;
    closePopup(); if (closing) return;
    openPopup = popup; popupReturn = button; popup.hidden = false; button.setAttribute('aria-expanded','true');
    popup.querySelector('button')?.focus({preventScroll:true});
  }
  function closeDialog() { $('cc-dialog').close(); }
  function dialog(title, body, actions, options = {}) {
    dialogGeneration++;
    termsContext = null;
    $('cc-dialog').removeAttribute('data-purpose');
    const origin = popupReturn || document.activeElement;
    closePopup(); if (!$('cc-dialog').open) dialogReturn = origin;
    $('cc-dialog-title').textContent = title;
    $('cc-dialog-body').innerHTML = body;
    $('cc-dialog-footer').replaceChildren();
    for (const action of actions) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'btn ' + (action.primary ? 'btn-primary' : 'btn-secondary');
      button.textContent = action.label; if (action.id) button.id = action.id;
      button.disabled = !!action.disabled;
      button.onclick = action.run || closeDialog; $('cc-dialog-footer').append(button);
    }
    if (!$('cc-dialog').open) $('cc-dialog').showModal();
    (options.focusTitle !== false ? $('cc-dialog-title') : $('cc-dialog-footer').querySelector('button')).focus({preventScroll:true});
    $('cc-dialog').scrollTop = 0;
    $('cc-dialog-body').scrollTop = 0;
  }
  $('cc-dialog-close').onclick = closeDialog;
  $('cc-dialog').addEventListener('close',() => { termsContext=null; const matching=dialogReturn?.dataset.sessionAction && [...root.querySelectorAll('[data-session-action]')].find(b=>b.dataset.sessionAction===dialogReturn.dataset.sessionAction); (dialogReturn?.isConnected && dialogReturn.getBoundingClientRect().width ? dialogReturn : matching || root.querySelector('[data-session-action]') || $('cc-profile')).focus({preventScroll:true}); });
  $('cc-dialog').addEventListener('keydown',e => {
    if (e.key !== 'Tab') return;
    const nodes = [...$('cc-dialog').querySelectorAll('button,a[href],input,textarea,select')].filter(n => !n.disabled && !n.hidden && n.getBoundingClientRect().width);
    const first = nodes[0], last = nodes.at(-1);
    if (e.shiftKey && (document.activeElement === first || document.activeElement === $('cc-dialog-title'))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  function renderList() {
    const total = state.chats.filter(c => !c.deleted).reduce((sum,c) => sum + c.unread,0);
    $('cc-total-unread').textContent = total; $('cc-total-unread').hidden = !total;
    $('cc-unread-tab').textContent = total; $('cc-unread-tab').hidden = !total;
    const search = state.search.trim().toLocaleLowerCase('ru');
    const visible = state.chats.filter(c => !c.deleted && (state.filter !== 'unread' || c.unread) && (state.filter !== 'favorite' || c.favorite) && c.name.toLocaleLowerCase('ru').includes(search));
    $('cc-contact-list').innerHTML = visible.map(c => `<button type="button" class="cc-contact" data-chat="${c.id}" aria-current="${c.id === state.selected}" aria-label="${esc(c.name)}${c.unread ? ', непрочитанных: '+c.unread : ''}"><span class="cc-avatar"><img src="${c.image}" alt=""><span class="cc-presence" data-online="${c.online}"></span></span><span class="cc-contact-copy"><strong>${esc(c.name)}</strong><span>${esc(c.pending ? 'Отправляется…' : c.draft.text ? 'Черновик: '+c.draft.text : c.preview)}</span></span><span class="cc-contact-meta"><time>${esc(c.time)}</time>${c.unread ? `<span class="cc-contact-badge">${c.unread}</span>` : c.favorite ? '<i class="fa fa-star" aria-hidden="true"></i>' : ''}</span></button>`).join('');
    $('cc-list-empty').hidden = visible.length > 0;
    root.querySelectorAll('[data-list-filter]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.listFilter === state.filter)));
  }
  function sessionSnapshot(chat, patch) {
    M.applySession(chat,{...chat.session,...patch,version:chat.session.version+1});
    if (chat.id === state.selected) { sessionClockBase = chat.session.elapsed || 0; sessionClockStarted = Date.now(); renderSession(); }
  }
  function renderSession() {
    const c = current(), s = c.session, terms=s.acceptedTerms||s.terms, rate = terms ? esc(terms.rate)+' '+esc(terms.unit) : 'Тариф уточняется';
    const map = {
      free:{icon:'comments-o',title:s.outcome==='expired'?'Предложение истекло':s.outcome==='declined'?'Предложение отклонено':'Платная консультация',note:'Не началась · До согласия списаний нет',action:'request',label:'Запросить',symbol:'bolt'},
      offer:{icon:'bolt',title:s.terms?.expiresAt<=Date.now()?'Предложение истекло':'Предложение консультации',note:rate+' · Оплата не началась',action:'terms',label:'Условия и согласие',symbol:'arrow-right'},
      waiting:{icon:'clock-o',title:s.consentAccepted?'Ожидаем подключения':'Ожидаем предложение',note:s.consentAccepted?'Условия приняты · Оплата не началась':'Запрос отправлен · Оплата не началась'},
      connecting:{icon:'circle-o-notch fa-spin',title:'Подключение к консультации',note:'Оплата начнётся после подключения обеих сторон'},
      active:{icon:'check',title:'Консультация идёт',note:`<span class="cc-session-time" id="cc-session-time">${M.duration(s.elapsed)}</span> · ${rate}`},
      trial:{icon:'clock-o',title:'Пробная консультация',note:'Пробный период · Условия оплаты приняты'},
      reconnecting:{icon:'wifi',title:'Восстанавливаем соединение',note:'Состояние консультации и оплаты уточняется'},
      paused:{icon:'pause',title:'Консультация на паузе',note:'Списания приостановлены · Ожидаем эксперта'},
      'low-balance':{icon:'pause',title:'Недостаточно средств',note:'Консультация на паузе · Списаний нет',action:'balance',label:'Пополнить'},
      completed:{icon:'check-circle-o',title:'Консультация завершена',note:s.total ? `${esc(s.duration)} · ${esc(s.total)} кредитов` : 'Списания остановлены · Итоги уточняются',action:'summary',label:'Итоги'}
    };
    const pending=s.pendingOperation;
    const v = pending ? {icon:pending.status==='unknown'?'info-circle':'circle-o-notch fa-spin',title:pending.status==='unknown'?'Уточняем результат':'Отправляем запрос',note:pending.status==='unknown'?'Подтверждение не получено. Не отправляйте повторно.':'Ожидаем подтверждения сервиса'} : map[s.status];
    $('cc-session').dataset.state = s.status;
    $('cc-session').innerHTML = `<span class="cc-session-mark"><i class="fa fa-${v.icon}" aria-hidden="true"></i></span><div class="cc-session-copy"><strong>${v.title}</strong><p>${v.note}</p></div><div class="cc-session-actions"><button type="button" class="btn btn-outline-secondary" data-session-action="help" title="Помощь с этой консультацией"><i class="fa fa-life-ring" aria-hidden="true"></i>Помощь</button>${v.action!=='terms'?'<button type="button" class="btn btn-outline-secondary" data-session-action="terms"><i class="fa fa-file-text-o" aria-hidden="true"></i>Условия</button>':''}${v.action ? `<button type="button" class="btn ${['request','balance','terms'].includes(v.action) ? 'btn-primary' : 'btn-outline-secondary'}" data-session-action="${v.action}">${v.symbol ? `<i class="fa fa-${v.symbol}" aria-hidden="true"></i>` : ''}${v.label}</button>` : ''}</div>`;
  }
  function renderHeader() {
    const c = current(); $('cc-name').textContent = c.name; $('cc-avatar').src = c.image;
    $('cc-presence').dataset.online = String(c.online); $('cc-person-meta').textContent = 'Эксперт · '+(c.online ? 'В сети' : 'Не в сети');
    $('cc-profile').title = 'Об эксперте '+c.name; $('cc-conversation').setAttribute('aria-label','Диалог с '+c.name);
    $('cc-favorite-label').textContent = c.favorite ? 'Убрать из избранного' : 'В избранное';
  }
  function fileMarkup(f, id, index) {
    if (f.type === 'image' && f.url) return `<button class="cc-image-open" type="button" data-open-file="${esc(id)}" data-file-index="${index}" title="Открыть изображение"><img class="cc-image-message" src="${esc(f.url)}" alt="${esc(f.name)}"></button>`;
    return `<button class="cc-file-open" type="button" data-open-file="${esc(id)}" data-file-index="${index}" title="Открыть файл ${esc(f.name)}"><span class="cc-file-message"><i class="fa fa-file-text-o" aria-hidden="true"></i><span><strong>${esc(f.name)}</strong><small>${fileSize(f.size)}</small></span><i class="fa fa-arrow-down" aria-hidden="true"></i></span></button>`;
  }
  function renderMessages(keepScroll = false) {
    const timeline = $('cc-timeline'), before = timeline.scrollTop, c = current();
    timeline.innerHTML = `<div class="cc-date">${c.id === 'elena' ? 'Сегодня, 26 октября' : c.id === 'orion' ? 'Вчера, 25 октября' : '24 октября'}</div>` + c.messages.map(m => {
      if (m.system) return `<div class="cc-system">${esc(m.text)} <time>${esc(m.time)}</time></div>`;
      const original = c.messages.find(x => x.id === m.replyId);
      const quote = original ? `<button type="button" class="cc-quote" data-jump-to="${original.id}"><strong>${original.mine ? 'Вы' : esc(c.name)}</strong>${esc(original.text).slice(0,130)}</button>` : '';
      const files = m.file ? [m.file] : m.files || [];
      return `<article class="cc-message" data-message-id="${esc(m.id)}" data-mine="${m.mine}" aria-label="${m.mine ? 'Ваше сообщение' : esc(c.name)} в ${esc(m.time)}"><div class="cc-message-line"><div class="cc-bubble">${quote}${m.text ? `<div class="cc-message-text">${esc(m.text)}</div>` : ''}${files.map((f,i) => fileMarkup(f,m.id,i)).join('')}</div><button class="cc-icon cc-message-action" type="button" data-message-options="${esc(m.id)}" aria-label="Действия с сообщением в ${esc(m.time)}" title="Действия с сообщением"><i class="fa fa-ellipsis-h" aria-hidden="true"></i></button></div><div class="cc-message-meta"><time>${esc(m.time)}</time>${m.mine ? m.status === 'pending' ? '<i class="fa fa-clock-o" aria-hidden="true"></i><span>Отправляется</span>' : m.status === 'failed' ? `<span class="cc-failed">Не отправлено</span><button type="button" class="cc-retry" data-retry="${esc(m.id)}">Повторить</button>` : `<i class="fa fa-check cc-delivered" aria-hidden="true"></i><span>${m.status === 'read' ? 'Прочитано' : 'Отправлено'}</span>` : ''}</div></article>`;
    }).join('');
    if (keepScroll) timeline.scrollTop = before;
    else timeline.scrollTop = timeline.scrollHeight;
    updateSearch(false); updateJump();
  }
  function resizeDraft() { $('cc-draft').style.height = 'auto'; $('cc-draft').style.height = Math.min($('cc-draft').scrollHeight,138)+'px'; }
  function renderComposer() {
    const c = current(), d = c.draft;
    if ($('cc-draft').value !== d.text) $('cc-draft').value = d.text;
    const reply = c.messages.find(m => m.id === d.replyId);
    $('cc-reply').hidden = !reply;
    if (reply) { $('cc-reply-name').textContent = reply.mine ? 'Вы' : c.name; $('cc-reply-text').textContent = reply.text || 'Вложение'; }
    $('cc-attachments').hidden = !d.files.length;
    $('cc-attachments').innerHTML = d.files.map((f,i) => `<span class="cc-attachment"><i class="fa fa-${f.type === 'image' ? 'picture-o' : 'file-text-o'}" aria-hidden="true"></i><span>${esc(f.name)}</span><button class="cc-icon" type="button" data-remove-file="${i}" title="Убрать ${esc(f.name)}" aria-label="Убрать ${esc(f.name)}"><i class="fa fa-times" aria-hidden="true"></i></button></span>`).join('');
    $('cc-send').disabled = (!d.text.trim() && !d.files.length) || !!c.pending || state.network === 'offline';
    $('cc-send').title = state.network === 'offline' ? 'Нет соединения' : c.pending ? 'Сообщение отправляется' : 'Отправить сообщение';
    resizeDraft();
  }
  function selectChat(id, navigate = true) {
    closePopup(); persist(); const c = state.chats.find(x => x.id === id && !x.deleted); if (!c) return;
    if (current().session.status === 'active') current().session.elapsed = sessionClockBase + Math.floor((Date.now()-sessionClockStarted)/1000);
    state.selected = id; c.unread = 0; $('cc-empty-conversation').hidden = true;
    $('cc-thread-search').hidden = true; $('cc-search-toggle').setAttribute('aria-expanded','false'); $('cc-message-query').value = '';
    $('cc-composer-error').hidden = true; sessionClockBase = c.session.elapsed; sessionClockStarted = Date.now();
    renderHeader(); renderSession(); renderList(); renderMessages(); renderComposer();
    if (navigate) { const wasList = root.dataset.mobilePane === 'list'; root.dataset.mobilePane = 'detail'; history[wasList && mq.matches ? 'pushState' : 'replaceState']({chat:id},'',location.pathname+location.search+'#chat='+id); }
    if (mq.matches && navigate) $('cc-profile').focus({preventScroll:true});
  }
  function updateJump() { const t = $('cc-timeline'); $('cc-jump').hidden = t.scrollHeight - t.scrollTop - t.clientHeight < 100; }
  $('cc-jump').onclick = () => { $('cc-timeline').scrollTop = $('cc-timeline').scrollHeight; $('cc-jump').hidden = true; };
  $('cc-timeline').addEventListener('scroll',() => { updateJump(); if (openPopup?.id === 'cc-message-menu') closePopup(); });
  function updateSearch(scroll = true) {
    const q = $('cc-message-query').value.trim().toLocaleLowerCase('ru');
    searchMatches = [];
    root.querySelectorAll('.cc-message').forEach(el => { el.classList.remove('is-match','is-current-match'); if (q && el.querySelector('.cc-message-text')?.textContent.toLocaleLowerCase('ru').includes(q)) { el.classList.add('is-match'); searchMatches.push(el); } });
    searchIndex = Math.min(Math.max(searchIndex,0),searchMatches.length-1);
    $('cc-search-count').textContent = q ? (searchMatches.length ? (searchIndex+1)+' / '+searchMatches.length : 'Не найдено') : '';
    $('cc-search-next').disabled = $('cc-search-prev').disabled = !searchMatches.length;
    if (searchMatches[searchIndex]) { searchMatches[searchIndex].classList.add('is-current-match'); if (scroll) searchMatches[searchIndex].scrollIntoView({block:'center',behavior:'instant'}); }
  }
  $('cc-search-toggle').onclick = () => { closePopup(); const show = $('cc-thread-search').hidden; $('cc-thread-search').hidden = !show; $('cc-search-toggle').setAttribute('aria-expanded',String(show)); if (show) $('cc-message-query').focus(); else { $('cc-message-query').value = ''; updateSearch(); } };
  $('cc-search-close').onclick = () => { $('cc-thread-search').hidden = true; $('cc-message-query').value = ''; $('cc-search-toggle').setAttribute('aria-expanded','false'); updateSearch(); $('cc-search-toggle').focus(); };
  $('cc-thread-search').onsubmit = e => { e.preventDefault(); updateSearch(); };
  $('cc-message-query').oninput = () => { searchIndex = 0; updateSearch(); };
  $('cc-search-prev').onclick = () => { searchIndex = (searchIndex-1+searchMatches.length)%searchMatches.length; updateSearch(); };
  $('cc-search-next').onclick = () => { searchIndex = (searchIndex+1)%searchMatches.length; updateSearch(); };
  $('cc-contact-list').onclick = e => { const row = e.target.closest('[data-chat]'); if (row) selectChat(row.dataset.chat); };
  $('cc-contact-search').oninput = e => { state.search = e.target.value; renderList(); };
  root.querySelectorAll('[data-list-filter]').forEach(b => { b.onclick = () => { state.filter = b.dataset.listFilter; renderList(); }; });
  $('cc-list-reset').onclick = () => { state.filter = 'all'; state.search = ''; $('cc-contact-search').value = ''; renderList(); $('cc-contact-search').focus(); };
  function showList() { closePopup(); persist(); root.dataset.mobilePane = 'list'; root.querySelector(`[data-chat="${state.selected}"]`)?.focus({preventScroll:true}); }
  $('cc-back').onclick = () => { showList(); history.replaceState({},'',location.pathname+location.search); };
  addEventListener('popstate',() => { const id = location.hash.replace('#chat=',''); if (state.chats.some(c => c.id === id)) { selectChat(id,false); root.dataset.mobilePane = 'detail'; } else showList(); });
  $('cc-more').onclick = () => togglePopup($('cc-more'),$('cc-chat-menu'));
  $('cc-attach').onclick = () => togglePopup($('cc-attach'),$('cc-attach-menu'));
  $('cc-emoji').onclick = () => togglePopup($('cc-emoji'),$('cc-emoji-menu'));
  $('cc-emoji-menu').innerHTML = ['😊','🙂','🙏','❤️','✨','👍','🌿','💛','🤔','☀️'].map((emoji,i) => `<button type="button" data-emoji="${emoji}" aria-label="${['Улыбка','Лёгкая улыбка','Спасибо','Сердце','Искры','Одобрение','Веточка','Жёлтое сердце','Размышление','Солнце'][i]}">${emoji}</button>`).join('');
  $('cc-emoji-menu').onclick = e => { const b = e.target.closest('[data-emoji]'); if (!b) return; const input = $('cc-draft'), start = input.selectionStart, end = input.selectionEnd; const value = input.value.slice(0,start)+b.dataset.emoji+input.value.slice(end); if (value.length > 4000) return; M.editDraft(current(),{text:value}); renderComposer(); closePopup(); input.focus(); input.setSelectionRange(start+b.dataset.emoji.length,start+b.dataset.emoji.length); persist(); renderList(); };
  $('cc-attach-menu').onclick = e => { const b = e.target.closest('[data-action]'); if (!b) return; closePopup(); $(b.dataset.action === 'image' ? 'cc-image-input' : 'cc-file-input').click(); };
  function attach(e) {
    const files = [...e.target.files]; e.target.value = ''; if (!files.length) return;
    try {
      M.validateFiles(files,current().draft.files);
      const added = files.map(f => ({name:f.name,size:f.size,type:/^image\//.test(f.type) ? 'image' : 'document',url:URL.createObjectURL(f),blob:f}));
      M.editDraft(current(),{files:[...current().draft.files,...added]}); $('cc-composer-error').hidden = true; renderComposer(); $('cc-draft').focus();
    } catch (err) { error(({file_count:'Можно прикрепить до 5 файлов.',file_size:'Файл должен быть непустым и не больше 10 МБ.',file_total:'Общий размер вложений не должен превышать 25 МБ.',file_type:'Выберите JPG, PNG, WebP или поддерживаемый документ. Аудио, видео и архивы не принимаются.'})[err.message] || 'Не удалось прикрепить файл.'); }
  }
  $('cc-file-input').onchange = $('cc-image-input').onchange = attach;
  $('cc-attachments').onclick = e => { const b = e.target.closest('[data-remove-file]'); if (!b) return; const files = current().draft.files.slice(), removed = files[Number(b.dataset.removeFile)]; if (!state.chats.some(c => c.messages.some(m => m.files?.some(f => f.url === removed.url)))) URL.revokeObjectURL(removed.url); files.splice(Number(b.dataset.removeFile),1); M.editDraft(current(),{files}); renderComposer(); $('cc-attach').focus(); };
  $('cc-reply-cancel').onclick = () => { M.editDraft(current(),{replyId:null}); renderComposer(); persist(); $('cc-draft').focus(); };
  $('cc-draft').oninput = () => { M.editDraft(current(),{text:$('cc-draft').value}); clearTimeout(saveTimer); saveTimer = setTimeout(persist,400); renderComposer(); renderList(); };
  $('cc-draft').addEventListener('keydown',e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && !mq.matches) { e.preventDefault(); $('cc-composer').requestSubmit(); } });
  // All asynchronous acknowledgements below are local fixtures, never a billing or delivery authority.
  function dispatchMessage(c, operation) {
    const fail = state.failNext; state.failNext = false;
    renderList(); renderMessages(); renderComposer();
    setTimeout(() => {
      M.settleSend(c,operation.id,!fail); persist();
      if(!fail&&c.id===state.selected)$('cc-live').textContent='Сообщение отправлено.';
      if (c.id === state.selected) { const t = $('cc-timeline'), readingHistory = t.scrollHeight - t.scrollTop - t.clientHeight > 100; renderMessages(readingHistory); renderComposer(); if (fail) error('Не удалось отправить сообщение. Текст сохранён — можно повторить отправку.'); else $('cc-composer-error').hidden = true; }
      renderList();
    },650);
  }
  $('cc-composer').onsubmit = e => {
    e.preventDefault(); const c = current(); if (c.pending) return;
    try { const operation = M.prepareSend(c,crypto.randomUUID(),state.network); $('cc-composer-error').hidden = true; dispatchMessage(c,operation); }
    catch (err) { if (err.message === 'offline') error('Нет соединения. Сообщение не отправлено, черновик сохранён.'); }
  };
  $('cc-connection').hidden = state.network !== 'offline';
  $('cc-reconnect').onclick = () => { state.network = 'online'; $('cc-connection').hidden = true; renderComposer(); feedback('Соединение восстановлено'); };
  const messageMenu = document.createElement('div'); messageMenu.id = 'cc-message-menu'; messageMenu.className = 'cc-menu'; messageMenu.hidden = true; messageMenu.innerHTML = '<button type="button" data-message-action="reply"><i class="fa fa-reply" aria-hidden="true"></i>Ответить</button><button type="button" data-message-action="copy"><i class="fa fa-copy" aria-hidden="true"></i>Копировать текст</button>'; root.append(messageMenu);
  $('cc-timeline').onclick = e => {
    const options = e.target.closest('[data-message-options]');
    if (options) {
      selectedMessage = options.dataset.messageOptions; togglePopup(options,messageMenu);
      const box = options.getBoundingClientRect(), area = root.getBoundingClientRect();
      const menu = messageMenu.getBoundingClientRect();
      messageMenu.style.left = Math.max(8,Math.min(box.left-area.left,area.width-menu.width-8))+'px'; messageMenu.style.right = 'auto';
      messageMenu.style.top = Math.max(8,Math.min(box.bottom-area.top+5,area.height-menu.height-8))+'px'; return;
    }
    const jump = e.target.closest('[data-jump-to]');
    if (jump) root.querySelector(`[data-message-id="${jump.dataset.jumpTo}"]`)?.scrollIntoView({block:'center',behavior:'instant'});
    const retry = e.target.closest('[data-retry]');
    if (retry && state.network === 'online') { const c = current(), operation = M.retrySend(c,retry.dataset.retry); if (operation) dispatchMessage(c,operation); }
    const file = e.target.closest('[data-open-file]'); if (file) openFile(file.dataset.openFile,Number(file.dataset.fileIndex));
  };
  messageMenu.onclick = async e => {
    const b = e.target.closest('[data-message-action]'); if (!b) return; const c = current(), m = c.messages.find(x => x.id === selectedMessage); if (!m) return;
    closePopup(b.dataset.messageAction === 'copy');
    if (b.dataset.messageAction === 'reply') { M.editDraft(c,{replyId:m.id}); renderComposer(); persist(); $('cc-draft').focus(); }
    else { try { await navigator.clipboard.writeText(m.text); feedback('Текст скопирован'); } catch { feedback('Не удалось скопировать текст'); } }
  };
  function expertCard(c) { return `<div class="cc-confirm-expert"><img src="${c.image}" alt=""><div><strong>${esc(c.name)}</strong><span>${esc(c.topic)}</span></div></div>`; }
  $('cc-profile').onclick = () => { const c = current(); dialog('Об эксперте',expertCard(c)+`<p><i class="fa fa-star" aria-hidden="true"></i> ${c.rating} · ${c.reviews} отзывов</p><p>Помогаю рассмотреть ситуацию с разных сторон и найти собственные ориентиры.</p>`,[{label:'Закрыть'}],{focusTitle:true}); };
  function openSupport() { persist(); const c = current(); location.href = 'support-create.html?category=consultation&fromChat='+encodeURIComponent(c.id); }
  function openFile(messageId,index) {
    const m = current().messages.find(x => x.id === messageId); if (!m) return;
    const f = m.file || m.files?.[index]; if (!f) return;
    if(!f.sample&&!f.url){dialog('Вложение недоступно','<p>Не удалось загрузить вложение. Попробуйте открыть его позже.</p>',[{label:'Закрыть'}]);return;}
    const url = f.sample ? URL.createObjectURL(new Blob(['Основные рекомендации после консультации\n\nДайте себе время принять решение. Запишите важные для вас ориентиры.'],{type:'text/plain;charset=utf-8'})) : f.url;
    const preview = f.type === 'image' ? `<img src="${esc(url)}" alt="${esc(f.name)}" style="width:100%;max-height:340px;object-fit:contain">` : `<p><i class="fa fa-file-text-o" aria-hidden="true"></i> ${esc(f.name)}</p><p class="cc-dialog-note">${fileSize(f.size)}</p>`;
    dialog('Вложение',preview+`<p><a href="${esc(url)}" download="${esc(f.name)}">Скачать файл</a></p>`,[{label:'Закрыть'}],{focusTitle:true});
  }
  $('cc-chat-menu').onclick = e => {
    const b = e.target.closest('[data-action]'); if (!b) return; const c = current(); closePopup(true);
    if (b.dataset.action === 'favorite') { c.favorite = !c.favorite; renderHeader(); renderList(); feedback(c.favorite ? 'Диалог добавлен в избранное' : 'Диалог убран из избранного'); }
    if (b.dataset.action === 'files') {
      const files = c.messages.flatMap(m => (m.file ? [m.file] : m.files || []).map((f,i) => ({...f,messageId:m.id,index:i})));
      dialog('Файлы и изображения',files.length ? files.map(f => `<p><button class="btn btn-link" type="button" data-library-file="${esc(f.messageId)}" data-file-index="${f.index}"><i class="fa fa-file-o" aria-hidden="true"></i> ${esc(f.name)} · ${fileSize(f.size)}</button></p>`).join('') : '<p>В этом диалоге пока нет вложений.</p>',[{label:'Закрыть'}],{focusTitle:true});
    }
    if (b.dataset.action === 'report') {
      dialog('Жалоба',`<p>Диалог с ${esc(c.name)}</p><fieldset class="cc-report-reasons"><legend>Причина</legend>${['Спаммер','Содержимое профиля','Грубое поведение','Поддельный профиль','Мошенник','Другое'].map((reason,i)=>`<label><input type="radio" name="reason" value="${['spam','profile','rude','fake','scam','other'][i]}"> ${reason}</label>`).join('')}</fieldset><div class="form-group"><label for="cc-report-text">Описание</label><textarea class="form-control" id="cc-report-text" name="description" rows="3" placeholder="Описание"></textarea></div><p id="cc-report-error" class="cc-dialog-error" role="alert" hidden></p>`,[{label:'Отмена'},{label:'Жалоба',primary:true,run:() => { if (!$('cc-dialog-body').querySelector('input[name=reason]:checked')) { $('cc-report-error').textContent = 'Выберите причину жалобы.'; $('cc-report-error').hidden = false; $('cc-dialog-body').querySelector('input[name=reason]').focus(); return; } closeDialog(); feedback('Жалоба принята'); }}]);
    }
    if (b.dataset.action === 'delete') {
      if(!['free','completed'].includes(c.session.status)){dialog('Консультация ещё не завершена','<p>Перед удалением беседы уточните состояние консультации в поддержке.</p>',[{label:'Закрыть'},{label:'Помощь',primary:true,run:openSupport}]);return;}
      dialog('Удаление беседы',`<p>Диалог с ${esc(c.name)}</p><p>Подтвердите удаление этой беседы.</p>${c.draft.text||c.draft.files.length?'<p>Неотправленный черновик будет удалён.</p>':''}`,[{label:'Отмена'},{label:'Удалить',primary:true,run:() => { c.deleted=true;M.editDraft(c,{text:'',replyId:null,files:[]});closeDialog();persist();const next=state.chats.find(x=>!x.deleted);state.filter='all';state.search='';$('cc-contact-search').value='';if(next)selectChat(next.id);else{renderList();$('cc-empty-conversation').hidden=false;} }}]);
    }
  };
  $('cc-dialog-body').onclick = e => { const b = e.target.closest('[data-library-file]'); if (b) openFile(b.dataset.libraryFile,Number(b.dataset.fileIndex)); };
  const credit = value => Number(value).toLocaleString('ru-RU',{maximumFractionDigits:2})+' кредитов';
  const expectedSession = c => ({id:c.session.id,version:c.session.version,termsKey:M.termsKey(c.session.terms)});
  function consultationError(code) {
    return ({offer_changed:'Предложение изменилось. Откройте актуальные условия и подтвердите их заново.',offer_expired:'Срок предложения истёк. Принять его уже нельзя. Запросите новое предложение.',terms_incomplete:'Не все условия получены. Принятие недоступно до их подтверждения.',payment_check:'Условия оплаты ещё не подтверждены. Принятие недоступно.',consent:'Подтвердите условия перед принятием предложения.',offline:'Нет соединения. Запрос не отправлен.',request_pending:'Результат предыдущего запроса ещё не подтверждён. Повторная отправка недоступна.'})[code] || 'Не удалось выполнить действие. Обратитесь в поддержку.';
  }
  function showConsultationError(message) {
    const el=$('cc-consent-error'); if(el){el.textContent=message;el.hidden=false;}
  }
  function submitConsultation(c,kind,expected) {
    let operation;
    try { operation=M.prepareConsultation(c,kind,crypto.randomUUID(),expected,!!$('cc-consent')?.checked,state.network); }
    catch(e){showConsultationError(consultationError(e.message));if(e.message==='consent')$('cc-consent')?.focus();return;}
    const generation=dialogGeneration, failed=state.failSessionNext, unknown=state.unknownSessionNext;
    state.failSessionNext=state.unknownSessionNext=false;
    $('cc-dialog-footer').querySelectorAll('button').forEach(b=>b.disabled=true);
    $('cc-consent')?.setAttribute('disabled','');
    if($('cc-consult-submit'))$('cc-consult-submit').textContent='Отправляем…';
    renderSession();persist();
    // Demo response only. A timeout is not a confirmed rejection or a new request.
    setTimeout(()=>{
      let changed=false, failure='';
      try { changed=M.settleConsultation(c,operation.id,unknown?'unknown':failed?'rejected':'success'); }
      catch(e){failure=consultationError(e.message);}
      if(c.id===state.selected)renderSession();persist();
      if(changed){
        const text=kind==='accept'?'Условия приняты: '+credit(operation.terms.rate)+'/мин. Ожидаем подключения; оплата не началась.':kind==='decline'?'Вы отклонили предложение. Оплата не началась.':'Запрос отправлен. Ожидаем предложение с условиями; оплата не началась.';
        c.messages.push({id:operation.id,system:true,text,time:new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})});
        if(c.id===state.selected){renderMessages();$('cc-live').textContent=text;}
        persist();if(generation===dialogGeneration&&$('cc-dialog').open)closeDialog();
      } else if(generation===dialogGeneration&&$('cc-dialog').open){
        if(unknown){showTerms(c);showConsultationError('Подтверждение не получено. Уточняем результат того же запроса; повторная отправка недоступна.');}
        else if(failed){showTerms(c,kind==='request');showConsultationError('Сервис отклонил отправку. Действие не выполнено; можно повторить.');}
        else {showTerms(c);showConsultationError(failure||'Состояние уже изменилось. Проверьте актуальные условия.');}
      }
    },650);
  }
  function termsMarkup(t, accepted) {
    const rate=Number.isFinite(t.rate)?credit(t.rate)+'/мин':'Уточняется';
    const trial=Number.isSafeInteger(t.trialMinutes)?t.trialMinutes?`${t.trialMinutes} мин бесплатно, затем ${rate}`:'Не предусмотрен':'Уточняется';
    const billing=t.billing==='deferred_seconds'?(t.trialMinutes?'Пробные минуты не оплачиваются. Затем учитывается активное время по тарифу. Итог округляется вверх до целого кредита.':'При старте списывается первая минута целиком. Далее учитываются активные секунды; остаток списывается после завершения с округлением вверх до целого кредита.'):
      t.billing==='minute_legacy'?'Каждая начатая платная минута оплачивается целиком.':'Порядок списания ещё не получен.';
    return `<p class="cc-terms-kicker">${accepted?'Принятые условия':'Персональное предложение'}</p><dl class="cc-terms-facts"><div class="cc-terms-price"><dt>Стоимость</dt><dd>${esc(rate)}</dd></div><div><dt>Пробный период</dt><dd>${esc(trial)}</dd></div><div><dt>Для принятия на балансе</dt><dd>${Number.isFinite(t.minimumBalance)?esc(credit(t.minimumBalance)):'Уточняется'}</dd></div>${!accepted&&Number.isFinite(t.expiresAt)?`<div><dt>Предложение действует до</dt><dd>${esc(new Date(t.expiresAt).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}))}</dd></div>`:''}</dl><p class="cc-dialog-note">Требование к балансу — не предоплата и не лимит стоимости.</p><div class="cc-terms-rules"><h3>Начало оплаты</h3><p>После вашего согласия и подключения обеих сторон оператором${t.trialMinutes?', когда закончатся пробные минуты':''}. Ожидание и подключение бесплатны.</p><h3>Порядок списания</h3><p>${esc(billing)}</p><p>Подтверждённая пауза не оплачивается; итог доступен после завершения.</p><p class="cc-terms-limit">Фиксированного лимита суммы и длительности нет. При нехватке средств — пауза; итоговый расчёт может превысить остаток баланса.</p></div>`;
  }
  function showTerms(c=current(), request=false) {
    const s=c.session, pending=!!s.pendingOperation, offer=!request&&s.status==='offer', accepted=!request&&!!s.acceptedTerms;
    const t=accepted?s.acceptedTerms:offer?s.terms:null, complete=M.completeTerms(t), expired=offer&&t?.expiresAt<=Date.now();
    const ready=offer&&complete&&!expired&&s.canAccept===true&&!pending&&state.network==='online';
    const expected=expectedSession(c);
    let content=t?termsMarkup(t,accepted):`<p>${s.status==='waiting'?'Запрос отправлен. Эксперт подготовит предложение.':'Эксперт подготовит предложение для этого диалога.'}</p><ol class="cc-request-steps"><li>Получите стоимость и условия.</li><li>Примите предложение, если оно вам подходит.</li><li>Дождитесь запуска оператором и подключения.</li></ol><p class="cc-terms-notice">Отправка запроса бесплатна. Цена ещё не согласована; запрос не даёт согласия на списания.</p>${!c.online?'<p class="cc-dialog-note">Эксперт сейчас не в сети. Точное время ответа неизвестно.</p>':''}`;
    if(pending)content+='<p class="cc-terms-notice">Уточняем результат отправки. Закрытие окна не отменяет запрос. Не отправляйте его повторно.</p>';
    if(offer&&!pending){
      if(expired)content+='<p class="cc-dialog-error">Предложение истекло. Оплата не началась.</p>';
      else if(!complete)content+='<p class="cc-dialog-error">Не все условия получены. Принятие недоступно.</p>';
      else if(s.canAccept===false)content+=`<p class="cc-dialog-error">Недостаточно средств для принятия. Нужно не менее ${esc(credit(t.minimumBalance))}.</p><p><a href="https://confideline.com/ru/balance/services" target="_blank" rel="noopener">Пополнить баланс <i class="fa fa-external-link" aria-hidden="true"></i></a></p><p class="cc-dialog-note">Пополнение не принимает предложение и не запускает консультацию. Вернитесь к этому диалогу и подтвердите актуальные условия.</p>`;
      else if(s.canAccept!==true)content+='<p class="cc-terms-notice">Проверяем возможность оплаты. Принятие пока недоступно.</p>';
      if(ready)content+=`<label class="cc-consent"><input type="checkbox" id="cc-consent"><span>Принимаю стоимость и порядок списания${t.trialMinutes?', включая переход к оплате после пробных минут':''}.</span></label>`;
      if(!expired)content+='<button class="cc-terms-decline" type="button" id="cc-offer-decline">Отклонить предложение</button>';
    }
    if(accepted)content+='<p class="cc-terms-notice">Условия сохранены для этой консультации. Просмотр ничего не меняет.</p>';
    if(state.network!=='online')content+='<p class="cc-dialog-error">Нет соединения. Отправка недоступна.</p>';
    content+='<p class="cc-dialog-error" id="cc-consent-error" role="alert" hidden></p>';
    const actions=[{label:request?'Отмена':'Закрыть'}];
    if(!pending&&offer&&!expired)actions.push({id:'cc-consult-submit',label:'Принять условия',primary:true,disabled:!ready,run:()=>submitConsultation(c,'accept',expected)});
    if(!pending&&request&&['free','completed'].includes(s.status))actions.push({id:'cc-consult-submit',label:'Отправить запрос',primary:true,disabled:state.network!=='online',run:()=>submitConsultation(c,'request',expected)});
    if(expired&&!pending)actions.push({label:'Запросить заново',primary:true,run:()=>{sessionSnapshot(c,{status:'free',terms:null,acceptedTerms:null,outcome:'expired'});requestConsultation();}});
    dialog(request?'Запросить консультацию':'Условия консультации',expertCard(c)+content,actions);
    $('cc-dialog').dataset.purpose='consultation';
    termsContext={chatId:c.id,expected,offer,expired};
    if($('cc-offer-decline'))$('cc-offer-decline').onclick=()=>dialog('Отклонить предложение?',expertCard(c)+'<p>Оплата не начнётся. Позже можно запросить новое предложение.</p><p class="cc-dialog-error" id="cc-consent-error" role="alert" hidden></p>',[{label:'Назад',run:()=>showTerms(c)},{label:'Отклонить',run:()=>submitConsultation(c,'decline',expected)}]);
  }
  function requestConsultation() { showTerms(current(),true); }
  function checkOpenTerms() {
    if(!termsContext||!$('cc-dialog').open||!termsContext.offer)return;
    const c=state.chats.find(c=>c.id===termsContext.chatId), s=c?.session;
    const expired=s?.terms?.expiresAt<=Date.now();
    if(!s||s.pendingOperation)return;
    if(expired&&!termsContext.expired||s.version!==termsContext.expected.version||s.id!==termsContext.expected.id||M.termsKey(s.terms)!==termsContext.expected.termsKey){
      if($('cc-consult-submit'))$('cc-consult-submit').disabled=true;
      if($('cc-consent')){$('cc-consent').checked=false;$('cc-consent').disabled=true;}
      if($('cc-offer-decline'))$('cc-offer-decline').disabled=true;
      showConsultationError(consultationError(expired?'offer_expired':'offer_changed'));
      if(!$('cc-terms-refresh')){const b=document.createElement('button');b.type='button';b.id='cc-terms-refresh';b.className='btn btn-secondary';b.textContent='Актуальные условия';b.onclick=()=>showTerms(c);$('cc-dialog-footer').append(b);}
    }
  }
  // Local demo snapshot hook. Production transport and financial authority stay outside this file.
  root.addEventListener('clientchat:session',e=>{
    const c=state.chats.find(c=>c.id===e.detail?.chatId);if(!c)return;
    try{if(M.applySession(c,e.detail.snapshot)){if(c.id===state.selected)renderSession();checkOpenTerms();persist();}}catch{feedback('Не удалось обновить состояние консультации.');}
  });
  $('cc-session').onclick = e => {
    const b = e.target.closest('[data-session-action]'); if (!b) return; const c = current(), action = b.dataset.sessionAction;
    if (action === 'help') openSupport();
    if (action === 'request') requestConsultation();
    if (action === 'terms') showTerms();
    if (action === 'balance') dialog('Пополнение баланса','<p>Консультация приостановлена. После пополнения эксперт должен возобновить её с повторным подключением.</p><p><a href="https://confideline.com/ru/balance/services" target="_blank" rel="noopener">Открыть пополнение баланса <i class="fa fa-external-link" aria-hidden="true"></i></a></p>',[{label:'Закрыть'}]);
    if (action === 'summary') dialog('Итоги консультации',expertCard(c)+(c.session.total ? `<dl class="cc-price-details"><dt>Продолжительность</dt><dd>${esc(c.session.duration)}</dd><dt>Списано</dt><dd>${esc(c.session.total)} кредитов</dd></dl>` : '<p>Консультация завершена. Сервис готовит итоговую сумму.</p>')+'<p class="cc-dialog-note">История переписки сохранена в этом диалоге.</p>',[{label:'Закрыть'},{label:'Новая консультация',primary:true,run:requestConsultation}],{focusTitle:true});
  };
  root.addEventListener('keydown',e => {
    if ($('cc-dialog').open) return;
    if (e.key === 'Escape') { if (openPopup) { e.preventDefault(); closePopup(true); } else if (!$('cc-thread-search').hidden) $('cc-search-close').click(); }
    if (openPopup && ['ArrowDown','ArrowUp','Home','End'].includes(e.key)) {
      const buttons = [...openPopup.querySelectorAll('button')], index = buttons.indexOf(document.activeElement);
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length-1 : (index+(e.key === 'ArrowDown' ? 1 : -1)+buttons.length)%buttons.length;
      e.preventDefault(); buttons[next]?.focus();
    }
  });
  document.addEventListener('pointerdown',e => { if (openPopup && !openPopup.contains(e.target) && !popupReturn?.contains(e.target)) closePopup(); });
  root.addEventListener('focusin',e => { if (openPopup && !openPopup.contains(e.target) && !popupReturn?.contains(e.target)) closePopup(); });
  document.querySelectorAll('[data-shell-link]').forEach(a => a.addEventListener('click',e => e.preventDefault()));
  addEventListener('pagehide',persist);
  addEventListener('beforeunload',e => { if (state.chats.some(c => c.draft.files.length)) { e.preventDefault(); e.returnValue = ''; } });
  setInterval(() => { const c = current(); if (c.session.status === 'active' && !c.session.ending && $('cc-session-time')) $('cc-session-time').textContent = M.duration(sessionClockBase+Math.floor((Date.now()-sessionClockStarted)/1000)); },1000);
  setInterval(checkOpenTerms,1000);
  const initial = query.get('chat') || location.hash.replace('#chat=','');
  if(current().deleted)state.selected=state.chats.find(c=>!c.deleted)?.id||state.selected;
  if (state.chats.some(c => c.id === initial && !c.deleted)) state.selected = initial;
  root.dataset.mobilePane = initial ? 'detail' : mq.matches ? 'list' : 'detail';
  if(state.chats.every(c=>c.deleted)){renderList();$('cc-empty-conversation').hidden=false;}
  else selectChat(state.selected,false);
  function fitMobileViewport() {
    resizeDraft();
    if (!mq.matches) { root.style.removeProperty('--cc-available-height'); return; }
    const viewport = visualViewport;
    const top = root.getBoundingClientRect().top;
    root.style.setProperty('--cc-available-height',Math.max(180,(viewport?.height || innerHeight)-Math.max(0,top)-12)+'px');
  }
  addEventListener('resize',fitMobileViewport);
  visualViewport?.addEventListener('resize',fitMobileViewport);
  fitMobileViewport();
  // Fonts and responsive height can settle after the first message render.
  const timeline = $('cc-timeline');
  let followLatest = true;
  timeline.addEventListener('scroll',() => { followLatest = timeline.scrollHeight-timeline.scrollTop-timeline.clientHeight < 80; });
  new ResizeObserver(() => {
    if (followLatest && !$('cc-thread-search').hidden) return;
    if (followLatest) timeline.scrollTop = timeline.scrollHeight;
    updateJump();
  }).observe(timeline);
  document.fonts.ready.then(() => { if (followLatest) timeline.scrollTop = timeline.scrollHeight; });
})();
