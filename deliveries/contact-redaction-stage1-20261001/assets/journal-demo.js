(function(){
  'use strict';
  var root=document.querySelector('[data-cr-page="journal"]');if(!root||root.dataset.crBound)return;root.dataset.crBound='true';
  var labels={phone:'Телефон',email:'E-mail',link:'Ссылка',messenger:'Мессенджер'};
  var states={new:'Не разобрано',confirmed:'Подтверждено',false:'Ложное срабатывание'};
  var entries=[
    {id:6106,conversation:32,sender:'client',from:'Алексей · клиент #104',to:'Serena Moon · эксперт #208',at:'01.10.2026 10:13:24',original:'Да, удобно после 18:00. Мой номер +1 202 555 0147, напишите вечером.',status:'new'},
    {id:6105,conversation:32,sender:'expert',from:'Serena Moon · эксперт #208',to:'Алексей · клиент #104',at:'01.10.2026 10:14:02',original:'Хорошо. Дополнительные материалы: https://example.test/guide. Обсудим ваш вопрос здесь.',status:'new'},
    {id:6104,conversation:41,sender:'operator',from:'Serena Moon · эксперт #208',actor:'Елена · сотрудник #12',to:'Мария · клиент #105',at:'01.10.2026 09:52:17',original:'Продолжим завтра. Напишите на tester@example.test или в Telegram @demo_contact_61. Я отвечу после 18:00.',status:'confirmed'},
    {id:6103,conversation:41,sender:'client',from:'Мария · клиент #105',to:'Serena Moon · эксперт #208',at:'01.10.2026 09:50:01',original:'tester@example.test',status:'new'},
    {id:6102,conversation:52,sender:'client',from:'Ольга · клиент #106',to:'Anna · эксперт #209',at:'30.09.2026 17:06:33',original:'Номер моего заказа 1234567890. Подскажите, как его проверить?',status:'false'},
    {id:6101,conversation:52,sender:'expert',from:'Anna · эксперт #209',to:'Ольга · клиент #106',at:'30.09.2026 16:44:05',original:'Спасибо за вопрос. Материалы находятся на example.test, мы можем обсудить их здесь.',status:'confirmed'}
  ];
  entries.forEach(function(e){var r=ContactRules.mask(e.original);e.safe=r.text;e.categories=r.categories;e.views=[];e.reviews=[];e.version='1';});
  var requestedAccess=new URLSearchParams(location.search).get('access');
  var access=['journal','none'].indexOf(requestedAccess)>=0?requestedAccess:'full',selected=null,returnFocus=null;
  var rows=document.getElementById('cr-rows'),panel=document.getElementById('cr-journal-panel'),modal=document.getElementById('cr-detail');
  function el(tag,text,cls){var n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
  function td(tr,text){var n=el('td',text);tr.appendChild(n);return n;}
  function render(){
    rows.replaceChildren();
    if(access==='none'){var denied=el('tr');var cell=td(denied,'Доступ к журналу не предоставлен.');cell.colSpan=6;rows.appendChild(denied);document.getElementById('cr-row-count').textContent='';document.getElementById('cr-summary').textContent='';return;}
    var search=document.getElementById('cr-search').value.toLowerCase(),cat=document.getElementById('cr-category').value,sender=document.getElementById('cr-sender').value,status=document.getElementById('cr-status').value;
    var visible=entries.filter(function(e){return (!search||(e.id+' '+e.conversation+' '+e.from+' '+e.to+' '+(e.actor||'')).toLowerCase().indexOf(search)>=0)&&(!cat||e.categories.indexOf(cat)>=0)&&(!sender||e.sender===sender)&&(!status||e.status===status);});
    visible.forEach(function(e){
      var tr=el('tr');td(tr,'#'+e.id).appendChild(el('small',e.at+' · Minsk'));var a=td(tr,e.from+' → '+e.to);a.appendChild(el('small','Диалог #'+e.conversation+(e.actor?' · Автор: '+e.actor:'')));
      td(tr,e.safe).className='cr-safe-cell';var c=td(tr);e.categories.forEach(function(k){c.appendChild(el('span',labels[k],'cr-chip'));});
      var s=td(tr);s.appendChild(el('span',states[e.status],'cr-chip '+(e.status==='new'?'warning':e.status==='confirmed'?'good':'')));
      var action=td(tr),b=el('button','Подробнее','cr-button');b.type='button';b.setAttribute('aria-label','Подробнее о срабатывании '+e.id);b.addEventListener('click',function(){open(e,b);});action.appendChild(b);rows.appendChild(tr);
    });
    if(!visible.length){var empty=el('tr');var c=td(empty,'По выбранным фильтрам срабатываний нет.');c.colSpan=6;rows.appendChild(empty);}
    document.getElementById('cr-row-count').textContent='Показано '+visible.length+' из '+entries.length+' · Часовой пояс: Europe/Minsk';
    var summary=document.getElementById('cr-summary');summary.replaceChildren();['new','confirmed','false'].forEach(function(s){var n=el('span');n.append(el('b',entries.filter(function(e){return e.status===s;}).length),document.createTextNode(states[s]));summary.appendChild(n);});
  }
  function renderViews(){var audit=document.getElementById('cr-audit');audit.replaceChildren();if(!selected.views.length){audit.appendChild(el('p','Оригинал ещё не открывали.','cr-muted'));return;}
    selected.views.forEach(function(v){audit.appendChild(el('p',v.time+' · '+v.actor+' · '+v.reason,'cr-muted'));});}
  function hideOriginal(){document.getElementById('cr-original').textContent='';document.getElementById('cr-original').hidden=true;document.getElementById('cr-view-reason').value='';document.getElementById('cr-access-result').textContent='';}
  function open(entry,button){selected=entry;returnFocus=button;hideOriginal();document.getElementById('cr-detail-title').textContent='Срабатывание #'+entry.id;document.getElementById('cr-detail-meta').textContent=entry.at+' · Minsk · Диалог #'+entry.conversation+' · Правила '+entry.version;
    var actors=document.getElementById('cr-detail-actors');actors.replaceChildren();[['Отправитель',entry.from],['Получатель',entry.to],['Фактический автор',entry.actor||entry.from],['Категории',entry.categories.map(function(c){return labels[c];}).join(', ')]].forEach(function(a){var box=el('div',undefined,'cr-context-cell');box.append(el('small',a[0]),document.createTextNode(a[1]));actors.appendChild(box);});
    document.getElementById('cr-detail-safe').textContent=entry.safe;document.getElementById('cr-detail-status').textContent=states[entry.status];document.getElementById('cr-review-note').value='';document.getElementById('cr-review-audit').textContent=entry.reviews.map(function(r){return r.time+' · '+r.actor+' · '+states[r.status]+' · '+r.note;}).join('\n');
    document.getElementById('cr-open-original').disabled=access!=='full';document.getElementById('cr-view-reason').disabled=access!=='full';document.querySelectorAll('[data-review]').forEach(function(b){b.disabled=access!=='full';});document.getElementById('cr-access-result').textContent=access==='full'?'':'У вас нет права просматривать оригинал.';renderViews();modal.hidden=false;modal.querySelector('.cr-modal').focus();}
  function close(){modal.hidden=true;hideOriginal();selected=null;if(returnFocus&&returnFocus.isConnected)returnFocus.focus();}
  document.getElementById('cr-detail-close').addEventListener('click',close);modal.addEventListener('click',function(e){if(e.target===modal)close();});
  document.addEventListener('keydown',function(e){if(modal.hidden)return;if(e.key==='Escape')close();if(e.key==='Tab'){var nodes=Array.from(modal.querySelectorAll('button:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]')).filter(function(n){return n.getClientRects().length>0;});var first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  function now(){return new Date().toLocaleString('ru-RU',{timeZone:'Europe/Minsk'});}
  document.getElementById('cr-view-original').addEventListener('submit',function(e){e.preventDefault();if(!selected||access!=='full')return;var reason=document.getElementById('cr-view-reason').value;if(!reason)return;
    selected.views.push({actor:'Елена · сотрудник #12',time:now(),reason:reason});var original=document.getElementById('cr-original');original.textContent=selected.original;original.hidden=false;document.getElementById('cr-access-result').textContent='Просмотр зарегистрирован. Повторное открытие создаст новую запись.';renderViews();});
  document.querySelectorAll('[data-review]').forEach(function(b){b.addEventListener('click',function(){if(!selected||access!=='full')return;selected.status=b.dataset.review;selected.reviews.push({actor:'Елена · сотрудник #12',time:now(),status:selected.status,note:document.getElementById('cr-review-note').value.trim()});document.getElementById('cr-detail-status').textContent=states[selected.status];document.getElementById('cr-review-audit').textContent=selected.reviews.map(function(r){return r.time+' · '+r.actor+' · '+states[r.status]+' · '+r.note;}).join('\n');render();});});
  ['cr-search','cr-category','cr-sender','cr-status'].forEach(function(id){document.getElementById(id).addEventListener(id==='cr-search'?'input':'change',render);});
  document.getElementById('cr-filter-form').addEventListener('submit',function(e){e.preventDefault();render();});document.getElementById('cr-filter-form').addEventListener('reset',function(){setTimeout(render,0);});
  document.getElementById('cr-settings-tab').hidden=access!=='full';
  document.querySelector('.cr-menu-toggle').addEventListener('click',function(){if(innerWidth<=768)root.classList.toggle('cr-nav-open');else root.classList.toggle('cr-nav-collapsed');});
  var query=new URLSearchParams(location.search);if(query.get('conversation'))document.getElementById('cr-search').value=query.get('conversation');render();
})();
