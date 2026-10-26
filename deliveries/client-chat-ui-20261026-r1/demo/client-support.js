(function(){
  'use strict';
  const M=ClientSupportModel, root=document.getElementById('client-support'), $=id=>document.getElementById(id);
  const params=new URLSearchParams(location.search), profiles=Object.fromEntries(ClientChatModel.createState().chats.map(c=>[c.id,c.name]));
  const context=Object.hasOwn(profiles,params.get('fromChat'))?params.get('fromChat'):null;
  const key='confideline-client-chat-ui-20261026:support-v2', draftKey='create:'+(context||'general');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const query=context?'fromChat='+encodeURIComponent(context):'';
  const route=(path,extra='')=>path+([query,extra].filter(Boolean).length?'?'+[query,extra].filter(Boolean).join('&'):'');
  const chatUrl='messages.html'+(context?'?chat='+encodeURIComponent(context):'');
  let store=M.createStore(),files=[],pending=false,failNext=params.get('supportError')==='1',operationId=crypto.randomUUID();
  try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved&&Array.isArray(saved.tickets)&&saved.drafts&&Number.isSafeInteger(saved.next))store=saved;}catch{}
  try{const runtime=JSON.parse(sessionStorage.getItem('confideline-client-chat-ui-20261026:runtime-v2')||'null'),balance=document.querySelector('.header .user-balance');if(balance&&Number.isFinite(runtime?.balance))balance.textContent=runtime.balance.toFixed(2);}catch{}
  function persist(candidate=store){try{localStorage.setItem(key,JSON.stringify(candidate));return true;}catch{showError('Не удалось сохранить данные в браузере. Введённый текст остаётся на странице.');return false;}}
  function clearFieldError(input){
    input?.removeAttribute('aria-invalid');
    if(input?.dataset.errorDescription){input.removeAttribute('aria-describedby');delete input.dataset.errorDescription;}
    $(input?.id+'-error')?.remove();
  }
  function showError(text,field){
    const e=$('cs-error')||$('cs-feedback');e.hidden=false;e.textContent=text;e.dataset.tone='error';e.setAttribute('role','alert');
    const input=field&&$(field);
    if(input){clearFieldError(input);input.setAttribute('aria-invalid','true');const hint=document.createElement('p');hint.id=field+'-error';hint.className='cs-field-error';hint.textContent=text;input.after(hint);input.setAttribute('aria-describedby',hint.id);input.dataset.errorDescription='true';input.focus();}
  }
  function status(t){return `<span class="cs-status" data-closed="${t.closed}"><i class="fa ${t.closed?'fa-check-circle-o':'fa-clock-o'}" aria-hidden="true"></i>${t.closed?'Закрыто':'В работе'}</span>`;}
  function fileList(){return '<ul class="cs-file-list" id="cs-files"></ul><p class="cs-file-help" id="cs-file-help">До 10 файлов, по 15 МБ каждый и 30 МБ на сообщение. JPG, PNG, WebP, HEIC, PDF, TXT, DOCX, XLSX, CSV.</p>';}
  function fileInput(){return '<div class="cs-upload"><input type="file" id="cs-attachments" name="attachments[]" aria-label="Добавить файлы" aria-describedby="cs-file-help" multiple accept=".jpg,.jpeg,.png,.webp,.heic,.pdf,.txt,.docx,.xlsx,.csv"><span aria-hidden="true"><i class="fa fa-paperclip"></i>Добавить файлы</span></div>'+fileList();}
  function errorNode(){return '<p class="cs-error" id="cs-error" role="alert" hidden></p>';}
  function renderFiles(){const box=$('cs-files');if(box)box.innerHTML=files.map((f,i)=>`<li><i class="fa fa-paperclip" aria-hidden="true"></i><span>${esc(f.name)} · ${(f.size/1024/1024).toFixed(1).replace('.',',')} МБ</span><button type="button" data-remove="${i}" title="Убрать ${esc(f.name)}" aria-label="Убрать ${esc(f.name)}"><i class="fa fa-times" aria-hidden="true"></i></button></li>`).join('');}
  function wireFiles(){
    $('cs-attachments').onchange=e=>{const added=[...e.target.files];e.target.value='';try{M.validateFiles(added,files);files.push(...added);$('cs-error').hidden=true;renderFiles();}catch(err){showError(({count:'Можно прикрепить до 10 файлов.',size:'Файл должен быть непустым и не больше 15 МБ.',total:'Общий размер файлов не должен превышать 30 МБ.',type:'Выберите поддерживаемое изображение или документ.'})[err.message]||'Не удалось прикрепить файл.');}};
    $('cs-files').onclick=e=>{const b=e.target.closest('[data-remove]');if(b&&!pending){files.splice(Number(b.dataset.remove),1);renderFiles();$('cs-attachments').focus();}};
  }
  function lock(value){
    pending=value;root.querySelectorAll('form input,form textarea,form select,form button').forEach(e=>e.disabled=value);
    const submit=$('cs-submit');
    if(submit){submit.setAttribute('aria-busy',String(value));submit.innerHTML=`<i class="fa ${value?'fa-circle-o-notch fa-spin':'fa-paper-plane'}" aria-hidden="true"></i><span>${value?'Отправляется…':root.dataset.view==='create'?'Отправить обращение':'Отправить ответ'}</span>`;}
  }
  if(context){$('cs-chat-return').href=chatUrl;$('cs-chat-return').hidden=false;$('cs-chat-return').append(document.createTextNode(' с '+profiles[context]));}
  $('cs-list-link').href=route('support.html');
  document.querySelectorAll('[data-local-messages]').forEach(a=>a.href=chatUrl);
  function renderList(){
    $('cs-page-title').textContent='Мои обращения в поддержку';$('cs-list-link').hidden=true;
    const create=document.createElement('a');create.className='btn btn-primary';create.href=route('support-create.html');create.innerHTML='<i class="fa fa-plus" aria-hidden="true"></i>Создать обращение';$('cs-page-title').parentElement.append(create);
    $('cs-main').innerHTML=`<section class="cs-card" aria-label="Мои обращения">${store.tickets.map(t=>`<a class="cs-ticket-row" href="${route('support-ticket.html','ticket='+encodeURIComponent(t.id))}"><div class="cs-ticket-copy"><strong>#${esc(t.id)} · ${esc(t.title)}</strong><p>${esc(t.messages.at(-1)?.text||'')}</p><small>${esc(M.categories[t.category])}</small></div><div class="cs-ticket-meta">${status(t)}<small>${esc(t.created)}</small></div><i class="fa fa-angle-right cs-row-arrow" aria-hidden="true"></i></a>`).join('')}</section>`;
    if(!store.tickets.length)$('cs-main').firstElementChild.innerHTML='<div class="cs-empty"><i class="fa fa-inbox" aria-hidden="true"></i><h2>У вас пока нет обращений</h2></div>';
  }
  function renderCreate(){
    $('cs-page-title').textContent='Создать обращение';
    const saved=store.drafts[draftKey], category=M.categories[params.get('category')]?params.get('category'):context?'consultation':'';
    const draft=saved||{category,title:context?'Вопрос по консультации с '+profiles[context]:'',description:'',context};
    $('cs-main').innerHTML=`<section class="cs-card"><form class="cs-form support-client-form" id="cs-form" novalidate><div class="cs-card-body"><p class="cs-note">Выберите тему и опишите, что произошло. Поддержка ответит в этом обращении.</p><div class="form-group"><label for="cs-category">Тема</label><select class="form-control" name="category" id="cs-category"><option value="">Выберите тему</option>${Object.entries(M.categories).map(([v,label])=>`<option value="${v}"${draft.category===v?' selected':''}>${label}</option>`).join('')}</select></div><div class="form-group"><label for="cs-title">Краткое описание</label><input class="form-control" type="text" name="title" id="cs-title" maxlength="255" value="${esc(draft.title)}" placeholder="Краткое описание"></div><div class="form-group"><label for="cs-description">Описание</label><textarea class="form-control" name="description" id="cs-description" maxlength="10000" rows="6" placeholder="Опишите проблему, чего вы ожидали и что произошло.">${esc(draft.description)}</textarea></div><div class="form-group"><label for="cs-attachments">Вложения</label>${fileInput()}</div>${errorNode()}</div><div class="cs-actions"><a class="btn btn-secondary" href="${route('support.html')}">Отмена</a><button class="btn btn-primary" id="cs-submit" type="submit"><i class="fa fa-paper-plane" aria-hidden="true"></i>Отправить обращение</button></div></form></section>`;
    function read(){return {category:$('cs-category').value,title:$('cs-title').value,description:$('cs-description').value,context,files};}
    $('cs-form').oninput=e=>{clearFieldError(e.target);const d=read();store.drafts[draftKey]={...d,files:[]};persist();};
    $('cs-form').onsubmit=e=>{
      e.preventDefault();if(pending)return;const d=read();
      try{M.validateForm(d);}catch(err){const fields={category:['Выберите тему обращения.','cs-category'],title:['Укажите краткое описание.','cs-title'],description:['Опишите, что произошло.','cs-description']};showError(...(fields[err.message]||['Проверьте поля обращения.']));return;}
      $('cs-error').hidden=true;lock(true);const failure=failNext;failNext=false;
      setTimeout(()=>{lock(false);if(failure){showError('Не удалось отправить обращение. Введённый текст и файлы сохранены — попробуйте ещё раз.');return;}
        const candidate=structuredClone(store),t=M.addTicket(candidate,d,operationId);delete candidate.drafts[draftKey];
        if(!persist(candidate))return;store=candidate;files=[];location.href=route('support-ticket.html','ticket='+encodeURIComponent(t.id)+'&created=1');
      },650);
    };wireFiles();
  }
  function renderTicket(){
    const ticketId=params.get('ticket'),t=ticketId?store.tickets.find(x=>x.id===ticketId):store.tickets[0];
    $('cs-page-title').textContent='Обращение в поддержку';
    if(!t){$('cs-main').innerHTML='<section class="cs-card cs-empty"><i class="fa fa-file-o" aria-hidden="true"></i><h2>Обращение не найдено</h2><p>Возможно, оно больше недоступно.</p></section>';return;}
    if(params.get('created')==='1'){$('cs-feedback').hidden=false;$('cs-feedback').textContent='Обращение создано. Ответ поддержки появится здесь.';params.delete('created');}
    const replyKey='reply:'+t.id,saved=store.drafts[replyKey]?.text||'';
    $('cs-main').innerHTML=`<section class="cs-card"><header class="cs-ticket-heading"><div><h2>#${esc(t.id)} · ${esc(t.title)}</h2><p>${esc(M.categories[t.category])} · ${esc(t.created)}</p></div>${status(t)}</header><section class="cs-thread" aria-label="Разговор с поддержкой">${t.messages.map(m=>`<article class="cs-message" data-support="${m.author==='Поддержка'}"><header><strong>${esc(m.author)}</strong><time>${esc(m.time)}</time></header><p>${esc(m.text)}</p>${m.files?.length?`<ul class="cs-file-list">${m.files.map(f=>`<li><i class="fa fa-file-o" aria-hidden="true"></i><span>${esc(f.name)}</span></li>`).join('')}</ul>`:''}</article>`).join('')}</section>${t.closed?`<div class="cs-closed">Это обращение закрыто. Создайте новое обращение, если вам нужна дополнительная помощь.<br><a href="${route('support-create.html')}">Создать новое обращение</a></div>`:`<form class="cs-form cs-reply" id="cs-form" novalidate><div class="cs-card-body"><h2>Ответить поддержке</h2><label for="cs-description">Сообщение</label><textarea class="form-control" id="cs-description" name="message" maxlength="10000" rows="4" placeholder="Напишите ответ…">${esc(saved)}</textarea><div class="form-group cs-reply-files"><label for="cs-attachments">Вложения</label>${fileInput()}</div>${errorNode()}</div><div class="cs-actions cs-actions-reply"><button type="button" class="btn btn-outline-secondary" id="cs-close" aria-expanded="false" aria-controls="cs-close-confirm"><i class="fa fa-check" aria-hidden="true"></i>Закрыть обращение</button><button class="btn btn-primary" id="cs-submit" type="submit"><i class="fa fa-paper-plane" aria-hidden="true"></i>Отправить ответ</button></div></form><section class="cs-close-confirm" id="cs-close-confirm" hidden aria-labelledby="cs-close-title"><h2 id="cs-close-title">Закрыть обращение?</h2><p>Отправить ответ в закрытое обращение будет нельзя. Закрытие обращения не завершает консультацию и не выполняет возврат средств.</p><div class="cs-actions"><button type="button" class="btn btn-secondary" id="cs-close-cancel">Оставить открытым</button><button type="button" class="btn btn-primary" id="cs-close-confirm-button">Закрыть обращение</button></div><p class="cs-close-error" id="cs-close-error" role="alert" hidden></p></section>`}</section>`;
    if(t.closed)return;
    $('cs-description').oninput=e=>{clearFieldError(e.target);store.drafts[replyKey]={text:$('cs-description').value};persist();};wireFiles();renderFiles();
    $('cs-form').onsubmit=e=>{e.preventDefault();if(pending)return;const text=$('cs-description').value;if(!text.trim()&&!files.length){showError('Напишите сообщение или прикрепите файл.','cs-description');return;}
      $('cs-error').hidden=true;lock(true);$('cs-close').disabled=true;const failure=failNext;failNext=false;
      setTimeout(()=>{lock(false);$('cs-close').disabled=false;if(failure){showError('Не удалось отправить ответ. Текст и файлы сохранены.');return;}
        const candidate=structuredClone(store),target=candidate.tickets.find(x=>x.id===t.id);try{M.addReply(target,text,files,operationId);}catch{showError('Не удалось отправить ответ в это обращение.');return;}
        delete candidate.drafts[replyKey];if(!persist(candidate))return;store=candidate;files=[];operationId=crypto.randomUUID();renderTicket();$('cs-description').focus();$('cs-feedback').textContent='Ответ отправлен.';$('cs-feedback').hidden=false;
      },650);
    };
    $('cs-close').onclick=()=>{$('cs-close-confirm').hidden=false;$('cs-close').setAttribute('aria-expanded','true');$('cs-close-cancel').focus();};
    $('cs-close-cancel').onclick=()=>{$('cs-close-confirm').hidden=true;$('cs-close').setAttribute('aria-expanded','false');$('cs-close').focus();};
    $('cs-close-confirm').onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();$('cs-close-cancel').click();}};
    $('cs-close-confirm-button').onclick=()=>{
      if(pending)return;
      if($('cs-description').value.trim()||files.length){$('cs-close-error').hidden=false;$('cs-close-error').textContent='Сначала отправьте или уберите набранный ответ и вложения.';return;}
      const candidate=structuredClone(store);candidate.tickets.find(x=>x.id===t.id).closed=true;if(!persist(candidate))return;store=candidate;renderTicket();$('cs-page-title').setAttribute('tabindex','-1');$('cs-page-title').focus();
    };
  }
  document.querySelectorAll('[data-shell-link]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));
  const previewShell=root.closest('.page-content'),settingsToggle=previewShell.querySelector('.btn-toggle-sidebar'),settingsMenu=previewShell.querySelector('.sidebar-menu');
  if(settingsToggle&&settingsMenu){
    function setMenu(open){settingsMenu.classList.toggle('d-none',!open);settingsToggle.setAttribute('aria-expanded',String(open));const icon=settingsToggle.querySelector('i');icon.classList.toggle(settingsToggle.dataset.iconShow,!open);icon.classList.toggle(settingsToggle.dataset.iconHide,open);}
    settingsToggle.setAttribute('aria-label','Разделы настроек');settingsToggle.setAttribute('aria-expanded','false');settingsToggle.onclick=()=>setMenu(settingsToggle.getAttribute('aria-expanded')!=='true');
    previewShell.addEventListener('keydown',e=>{if(e.key==='Escape'&&settingsToggle.getAttribute('aria-expanded')==='true'){setMenu(false);settingsToggle.focus();}});
  }
  addEventListener('beforeunload',e=>{if(files.length){e.preventDefault();e.returnValue='';}});
  ({create:renderCreate,ticket:renderTicket,list:renderList})[root.dataset.view]();
})();
