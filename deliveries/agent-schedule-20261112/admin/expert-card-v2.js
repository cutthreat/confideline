(() => {
 'use strict';
 const root=document.querySelector('.expert-card-preview'), $=(s,p=root)=>p.querySelector(s), $$=(s,p=root)=>[...p.querySelectorAll(s)];
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const model=window.BookingPreview;
 if(location.hash==='#schedule'){location.replace(model.link('partner.html','schedule'));return;}
 const {expertId,clone,labels,minutes,now:agentNow}=model;
 let data=model.read(),bookings=data.entries.filter(b=>b.profile===expertId);
 const assignedProfile=()=>data.profiles.find(profile=>profile.id===expertId);
 const currentProfile=()=>assignedProfile()||(data.formerProfiles||[]).slice().reverse().find(profile=>profile.id===expertId);
 if(!currentProfile()){
  const notice=document.createElement('div');notice.className='alert alert-warning';notice.textContent='Анкета не найдена среди назначенных. Проверьте список анкет партнёра.';root.prepend(notice);
  $$('.expert-panel').forEach(panel=>panel.hidden=true);return;
 }
 const initialProfile=currentProfile();
 $$('[data-profile-name]').forEach(el=>el.textContent=initialProfile.name);
 $$('[data-agent-name]').forEach(el=>el.textContent=model.partnerName);
 if(initialProfile.userId){
  document.querySelectorAll('[data-expert-heading]').forEach(el=>el.textContent='Пользователь #'+initialProfile.userId);
  $('[data-expert-user-id]').textContent=initialProfile.userId;
  $('.widget-user-username').textContent=initialProfile.username||initialProfile.name;
  $('.widget-user-desc').textContent='—';
  $('.demo-avatar').textContent=initialProfile.name.charAt(0);
  $$('[data-sample-only]').forEach(el=>{el.classList.remove('text-success','text-warning');el.textContent='—';});
 }
 function sync(state=model.read()){data=state;bookings=data.entries.filter(b=>b.profile===expertId);}
 let selected=null,price=initialProfile.price==null?'':String(initialProfile.price),active=null,focusBefore=null,journalView='list',detailOrigin=null;
 const showPrice=()=>{$$('[data-price]').forEach(el=>el.textContent=price===''?'Общий тариф сайта':Number(price)===0?'Платные консультации отключены':price+' кредитов / мин');$('#price-input').value=price;};
 showPrice();
 const dateText=x=>x.split('-').reverse().join('.');
 const iso=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
 const parseDate=s=>{let [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12);};
 const addDays=(s,n)=>{let d=parseDate(s);d.setDate(d.getDate()+n);return iso(d);};
 const ruDate=s=>new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',weekday:'short'}).format(parseDate(s));
 let journalDate=data.firstDate;
 function alternativeSlots(booking,date){
  sync();
  return model.alternatives(data,bookings.find(b=>b.id===booking.id),date).map(time=>({date,time}));
 }
 function updateAlternativeSlots(b){
  const date=$('#alternative-date').value,slot=$('#alternative-slot'),submit=$('#dialog-submit');
  if(!date){slot.innerHTML='<option value="">Сначала выберите дату</option>';slot.disabled=true;submit.disabled=true;return;}
  const slots=alternativeSlots(b,date);slot.innerHTML='<option value="">'+(slots.length?'Выберите время':'Нет свободного времени')+'</option>'+slots.map(s=>'<option value="'+s.date+'T'+s.time+'">'+s.time+'</option>').join('');
  slot.disabled=!slots.length;submit.disabled=!slots.length;
 }
 const titles={account:'Редактировать аккаунт',profile:'Редактировать профиль',balance:'Баланс',photos:'Фотографии',public:'Посмотреть на сайте',login:'Войти как пользователь',action:'Действия с аккаунтом'};
 function show(name){
  const section=['info','price','bookings','balance'].includes(name)?name:'other';
  $$('.expert-panel').forEach(p=>p.hidden=p.id!=='view-'+section);
  $$('#expert-nav li').forEach(li=>{
   const link=li.querySelector('a'),current=link.dataset.panel===name;
   li.classList.toggle('active',current);
   if(current)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  });
  if([...$('#mobile-expert-nav').options].some(o=>o.value===name))$('#mobile-expert-nav').value=name;
  if(section==='other')$('#other-title').textContent=titles[name]||'Раздел';
  if(section==='bookings')renderBookings();
 }
 const responsiveActions=window.matchMedia('(max-width:1100px)');
 function setActionsViewport(){ $('.account-actions').open=!responsiveActions.matches; }
 responsiveActions.addEventListener('change',setActionsViewport);setActionsViewport();
 const compactFilters=window.matchMedia('(max-width:767px)');
 function setFilterLayout(){ $('.journal-filter-panel').open=!compactFilters.matches; }
 compactFilters.addEventListener('change',setFilterLayout);setFilterLayout();
 function navigate(section){
  selected=null;detailOrigin=null;$('#booking-detail').hidden=true;$('#booking-workspace').hidden=false;
  if(location.hash!=='#'+section)history.pushState(null,'','#'+section);
  show(section);
  const heading=$('.expert-panel:not([hidden]) h2');
  heading?.setAttribute('tabindex','-1');heading?.focus();
 }
 $('#mobile-expert-nav').addEventListener('change',e=>navigate(e.target.value));
 $('#price-form').addEventListener('submit',e=>{e.preventDefault();const result=model.savePrice(expertId,$('#price-input').value);if(result.error){$('#price-result').textContent=result.error;return;}sync(result.state);price=currentProfile().price==null?'':String(currentProfile().price);showPrice();$('#price-result').textContent='Цена сохранена.';});
 $('#price-reset').addEventListener('click',()=>{$('#price-input').value=price;$('#price-result').textContent='Несохранённые изменения отменены.';});
 $('#balance-demo-form').addEventListener('submit',e=>{
  e.preventDefault();if(!e.currentTarget.reportValidity())return;
  const balance=Number($('#balance-value').textContent),amount=Number($('#balance-demo-amount').value);
  $('#balance-value').textContent=(balance+amount).toFixed(2);
  $('#balance-demo-result').textContent='Баланс обновлён.';
 });
 function actions(b){
  const buttons={confirm:'Подтвердить',decline:'Отклонить',cancel:'Отменить запись',withdraw:'Отозвать предложение',reschedule:'Предложить перенос','no-show':'Сообщить о неявке'};
  return model.actions(b).map(action=>'<button type="button" class="btn btn-'+(action==='confirm'?'primary':'default')+'" data-booking-action="'+action+'" data-id="'+b.id+'">'+buttons[action]+'</button>').join(' ');
 }
 function matching(b,filter,search){return (filter==='all'||model.visibleStatus(b)===filter||(filter==='cancelled'&&b.state==='declined'))&&b.client.toLocaleLowerCase().includes(search);}
 function bookingConflict(b){return model.scheduleConflicts([b],data.agent,assignedProfile(),expertId)[0];}
 function bookingTile(b,slot=null){const status=model.visibleStatus(b),hold=b.proposal?model.proposalDeadline(b):model.holdDescription(b),urgency=hold?'<span class="journal-due">'+esc(hold)+'</span>':'',shownTime=slot?.time||b.time,shownDate=slot?.date||b.date,conflict=bookingConflict(b),conflictText=conflict?(conflict.scheduleConflictOriginal&&conflict.scheduleConflictProposal?' · Конфликт обоих окон':conflict.scheduleConflictProposal?' · Конфликт предложенного времени':' · Конфликт графика'):'';return '<button type="button" class="journal-item" data-booking-action="details" data-id="'+b.id+'"><span class="journal-item-time">'+esc(shownTime)+'</span><span class="journal-item-main"><strong>'+esc(b.client)+'</strong><small>'+dateText(shownDate)+(slot?.proposed?' · Предложенное время':'')+' · '+esc(labels[status])+conflictText+'</small>'+urgency+'</span><span aria-hidden="true" class="journal-chevron">›</span></button>';}
 function calendarRender(items){
  const container=$('#journal-calendar'),bar=$('#journal-date-bar');
  bar.hidden=journalView==='list';container.hidden=journalView==='list';$('#booking-rows').hidden=journalView!=='list';
  $$('#view-bookings [data-journal-view]').forEach(b=>{let on=b.dataset.journalView===journalView;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  $('#journal-date').value=journalDate;if(journalView==='list')return;
  if(journalView==='day'){
   $('#journal-period').textContent=ruDate(journalDate);
   const rows=model.dayRows(data,journalDate,expertId);
   const body=rows.map(({time,end,booking,label,proposed})=>{
    const content=booking?(items.includes(booking)?bookingTile(booking,{date:journalDate,time,proposed}):'<div class="agent-busy">'+(booking.profile===expertId?'Запись вне фильтра':'Агент занят')+'</div>'):'<span class="day-free">'+esc(label)+'</span>';
    return '<div class="day-line"><span class="day-hour">'+time+(booking?'':'–'+end)+'</span><div class="day-content">'+content+'</div></div>';
   }).join('');
   const history=model.calendarEvents(items,journalDate).filter(slot=>!rows.some(row=>row.booking?.id===slot.booking.id&&Boolean(row.proposed)===slot.proposed)).map(slot=>bookingTile(slot.booking,slot)).join('');
   container.innerHTML='<div class="day-schedule">'+(body||'<p class="journal-empty">У агента выходной.</p>')+history+'</div>';
  } else {
   let start=addDays(journalDate,-((parseDate(journalDate).getDay()+6)%7)),end=addDays(start,6);$('#journal-period').textContent=ruDate(start)+' — '+ruDate(end);
   container.innerHTML='<div class="week-schedule">'+Array.from({length:7},(_,i)=>{
    const date=addDays(start,i),events=model.calendarEvents(items,date);
    const busy=model.calendarEvents(data.entries,date).filter(slot=>model.active(slot.booking)&&!items.includes(slot.booking))
     .map(slot=>'<span class="agent-busy">'+esc(slot.time)+(slot.booking.profile===expertId?' · Запись вне фильтра':' · Агент занят')+'</span>');
    const content=events.map(slot=>bookingTile(slot.booking,slot)).join('')+busy.join('');
    return '<section class="week-day"><button type="button" class="week-heading" data-open-day="'+date+'">'+ruDate(date)+'</button>'+(content||'<span class="day-free">'+(model.effective(data.agent,date).enabled?'Нет записей':'У агента выходной')+'</span>')+'</section>';
   }).join('')+'</div>';
  }
 }
 function renderBookings(){
  sync();
  let filter=$('#booking-filter').value,search=$('#booking-search').value.trim().toLocaleLowerCase(),items=bookings.filter(b=>matching(b,filter,search));
  const applied=Number(filter!=='all')+Number(Boolean(search));
  $('#journal-active-filters').textContent=applied?'('+applied+')':'';
  const today=agentNow().slice(0,10);items.sort((a,b)=>(a.state==='pending'?-1:0)-(b.state==='pending'?-1:0)||(a.state==='pending'&&b.state==='pending'?String(a.deadlineAt||'9999').localeCompare(String(b.deadlineAt||'9999')):0)||(a.date<today?1:0)-(b.date<today?1:0)||(a.date+a.time).localeCompare(b.date+b.time));
  $('#pending-count').textContent=bookings.filter(b=>model.visibleStatus(b)==='pending').length;$('#processing-count').textContent=bookings.filter(b=>model.visibleStatus(b)==='processing').length;$('#review-count').textContent=bookings.filter(b=>b.state==='review').length;
  $$('#view-bookings [data-quick]').forEach(b=>{let on=b.dataset.quick===filter;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  $('#booking-count').textContent='Найдено: '+items.length;
  $('#booking-rows').innerHTML=items.length?items.map(bookingTile).join(''):'<div class="journal-empty">По выбранным условиям записей нет. Измените фильтры или дату.</div>';
  calendarRender(items);
  if(journalView!=='list'){
   let start=journalView==='day'?journalDate:addDays(journalDate,-((parseDate(journalDate).getDay()+6)%7)),end=journalView==='day'?start:addDays(start,6);
   let shown=items.filter(b=>(b.date>=start&&b.date<=end)||(b.proposal?.holdsSlot&&b.proposal.date>=start&&b.proposal.date<=end));
   $('#booking-count').textContent='Записей в периоде: '+shown.length;
  }
  if(selected)renderDetails(bookings.find(b=>b.id===selected));
 }
 function renderDetails(b){
  let el=$('#booking-detail');if(!b){el.hidden=true;return;}el.hidden=false;
  $('#booking-workspace').hidden=true;
  const status=model.visibleStatus(b);
  const price=Number.isFinite(b.acceptedPrice)?'<div><span>Цена этой записи</span><strong>'+esc(b.acceptedPrice)+' кредитов / мин</strong></div>':'';
  const waiting=b.state==='review'?'<p class="role-note">Передано ответственному сотруднику на проверку.</p>':b.proposal?'<p class="role-note">Предложено: '+dateText(b.proposal.date)+' · '+esc(b.proposal.time)+'. '+esc(model.proposalDescription(b))+'</p>':'';
  const outcome=model.needsOutcomeCheck(b)?'<p class="role-note">Время встречи наступило. Проверьте состояние консультации в чате.</p>':'';
  const conflict=bookingConflict(b),scheduleConflict=conflict?'<p class="role-note">'+(conflict.scheduleConflictOriginal?'Исходное время вне рабочего графика. ':'')+(conflict.scheduleConflictProposal?'Предложенное время вне рабочего графика. ':'')+'Выберите действие, чтобы решить конфликт.</p>':'';
  el.innerHTML='<button class="journal-back" type="button" data-close-detail>‹ '+(detailOrigin==='schedule'?'К графику':journalView==='list'?'К списку':'К календарю')+'</button><div class="detail-heading"><div><span class="detail-kicker">Запись · '+esc(currentProfile().name)+'</span><h3>'+esc(b.client)+'</h3><p>'+dateText(b.date)+' · '+esc(b.time)+'</p></div><span class="status-pill state-'+esc(status)+'">'+esc(labels[status])+'</span></div><div class="detail-grid"><div><span>Срок / следующее действие</span><strong>'+esc(b.proposal?model.proposalDeadline(b):b.deadline)+'</strong></div><div><span>Ответственный агент</span><strong>'+esc(model.partnerName)+'</strong></div>'+price+'</div>'+scheduleConflict+waiting+outcome+'<div class="booking-actions detail-actions">'+actions(b)+'</div><details class="detail-history"><summary>История записи · '+b.history.length+'</summary><ul>'+b.history.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></details>';
 }
 const dialog=$('#booking-dialog');
 function openDialog(b,action){
  $('#booking-action-error').textContent='';
  active={id:b.id,action};focusBefore=document.activeElement;let head=$('#dialog-heading'),body=$('#dialog-body'),submit=$('#dialog-submit'),who='<p><strong>'+esc(b.client)+'</strong> · '+dateText(b.date)+' '+esc(b.time)+' · '+esc(currentProfile().name)+'</p>';
  if(action==='confirm'){head.textContent='Подтвердить заявку';body.innerHTML=who+'<p>Время останется за этой записью.</p>';submit.textContent='Подтвердить заявку';}
  if(action==='decline'){head.textContent='Отклонить заявку';body.innerHTML=who+'<p>Время освободится после сохранения.</p><label for="action-note">Причина для клиента</label><textarea id="action-note" class="form-control" rows="3" required></textarea>';submit.textContent='Отклонить заявку';}
  if(action==='cancel'){head.textContent='Отменить запись';body.innerHTML=who+'<p>Время освободится после сохранения.</p><label for="action-note">Причина отмены</label><textarea id="action-note" class="form-control" rows="3" required></textarea>';submit.textContent='Подтвердить отмену';}
  if(action==='reschedule'){
   head.textContent='Предложить другое время';
   const today=agentNow().slice(0,10),copy=(b.date+'T'+b.time>agentNow().slice(0,16)?'Оба времени будут удерживаться до ответа клиента или окончания срока.':'Новое время будет удерживаться до ответа клиента или окончания срока.')+(b.state==='pending'?' Предложение подтверждает вашу готовность на новое время.':'');body.innerHTML=who+'<p>'+esc(copy)+'</p><div class="form-group"><label for="alternative-date">Дата</label><input id="alternative-date" type="date" class="form-control" min="'+today+'" value="'+(b.date<today?today:b.date)+'" required></div><div class="form-group"><label for="alternative-slot">Свободное время</label><select id="alternative-slot" class="form-control" required></select><span id="alternative-error" role="alert"></span></div><label for="action-note">Комментарий клиенту (необязательно)</label><textarea id="action-note" class="form-control" rows="2" placeholder="Комментарий"></textarea>';
   submit.textContent='Предложить время';updateAlternativeSlots(b);
   $('#alternative-date').addEventListener('change',()=>updateAlternativeSlots(b));
  } else submit.disabled=false;
  if(action==='withdraw'){const hold=model.holdDescription(b),holdNote=hold?'Прежнее время удерживается. '+hold+'.':'Прежнее время сохраняется, пока запись подтверждена.';head.textContent='Отозвать предложение';body.innerHTML=who+'<p>Предложение другого времени будет отозвано. '+esc(holdNote)+'</p>';submit.textContent='Отозвать предложение';}
  if(action==='no-show'){head.textContent='Сообщить о возможной неявке';body.innerHTML=who+'<p>Вы ожидаете клиента более 10 минут. Случай будет передан ответственному сотруднику для проверки.</p>';submit.textContent='Сообщить о неявке';}
  dialog.showModal();(action==='reschedule'?$('#alternative-date'):$('#action-note')||$('#dialog-cancel')).focus();
 }
 function closeDialog(){dialog.close();if(focusBefore?.isConnected)focusBefore.focus();active=null;}
 root.addEventListener('click',e=>{
  let link=e.target.closest('[data-panel]');if(link){e.preventDefault();navigate(link.dataset.panel);return;}
  let quick=e.target.closest('[data-quick]');if(quick){selected=null;$('#booking-detail').hidden=true;$('#booking-workspace').hidden=false;$('#booking-filter').value=quick.dataset.quick;$('#booking-search').value='';journalView='list';renderBookings();return;}
  let view=e.target.closest('[data-journal-view]');if(view){journalView=view.dataset.journalView;renderBookings();return;}
  let step=e.target.closest('[data-journal-step]');if(step){journalDate=addDays(journalDate,Number(step.dataset.journalStep)*(journalView==='week'?7:1));renderBookings();return;}
  if(e.target.closest('[data-journal-today]')){journalDate=agentNow().slice(0,10);renderBookings();return;}
  let day=e.target.closest('[data-open-day]');if(day){journalDate=day.dataset.openDay;journalView='day';renderBookings();return;}
  if(e.target.closest('[data-close-detail]')){
   const previous=selected;selected=null;$('#booking-detail').hidden=true;$('#booking-workspace').hidden=false;
   renderBookings();
   const origin=$((journalView==='list'?'#booking-rows ':'#journal-calendar ')+'[data-booking-action="details"][data-id="'+previous+'"]');
   const filterTarget=$('.journal-filter-panel').open?$('#booking-filter'):$('.journal-filter-panel summary');
   (origin||filterTarget).focus();return;
  }
  let btn=e.target.closest('[data-booking-action]');if(!btn)return;let b=bookings.find(x=>x.id===Number(btn.dataset.id));if(!b)return;
  if(btn.dataset.bookingAction==='details'){detailOrigin=null;selected=b.id;renderDetails(b);$('#booking-detail').scrollIntoView({block:'nearest'});$('#booking-detail [data-close-detail]').focus();}else openDialog(b,btn.dataset.bookingAction);
 });
 $('#booking-filter').addEventListener('change',renderBookings);$('#booking-search').addEventListener('input',renderBookings);
 $('#journal-date').addEventListener('change',e=>{if(e.target.value){journalDate=e.target.value;renderBookings();}});
 $('#journal-reset').addEventListener('click',()=>{$('#booking-filter').value='all';$('#booking-search').value='';renderBookings();});
 $('#dialog-close').addEventListener('click',closeDialog);$('#dialog-cancel').addEventListener('click',closeDialog);dialog.addEventListener('cancel',e=>{e.preventDefault();closeDialog();});
 $('#booking-action-form').addEventListener('submit',e=>{
  e.preventDefault();if(!e.currentTarget.reportValidity()||!active)return;
  const {id,action}=active,note=$('#action-note')?.value.trim()||'';
  const [date,time]=($('#alternative-slot')?.value||'').split('T');
  const result=model.perform(id,action,{date,time,note});
  if(result.error){$('#booking-action-error').textContent=result.error;if(action==='reschedule')updateAlternativeSlots({id});return;}
  sync(result.state);selected=id;closeDialog();renderBookings();$('#booking-detail').scrollIntoView({block:'nearest'});$('#booking-detail [data-close-detail]').focus();
 });
 document.querySelectorAll('.main-header a, .main-sidebar a, .main-footer a, .content-header a').forEach(el=>el.addEventListener('click',e=>e.preventDefault()));
 document.querySelector('.sidebar-toggle')?.addEventListener('click',()=>document.body.classList.toggle('sidebar-open'));
 document.querySelector('.header-search')?.addEventListener('submit',e=>e.preventDefault());
 $$('#expert-nav i, .account-actions i').forEach(icon=>icon.setAttribute('aria-hidden','true'));
 function updateAssignmentUI(){
  const assigned=Boolean(assignedProfile());
  $('#expert-journal-time').textContent=(assigned?'время агента':'время прежнего агента')+': Минск, UTC+3';
  $$('[data-agent-name]').forEach(el=>el.textContent=assigned?model.partnerName:'Не назначен');
  for(const section of ['bookings']){
   const link=$('#agent-'+section+'-link'),target=section==='bookings'&&!assigned?'bookings:'+expertId:section;
   const url=new URL(model.link('partner.html',target),location.href);
   url.searchParams.set('fromExpert',section);link.href=url.href;
   if(section==='bookings')link.textContent=assigned?'Все записи агента':'История у прежнего партнёра';
  }
 }
 updateAssignmentUI();
 renderBookings();show(location.hash.slice(1)||'info');
 window.addEventListener('hashchange',()=>navigate(location.hash.slice(1)||'info'));
 model.watch(state=>{
  sync(state);
  if(!currentProfile())return;
  updateAssignmentUI();
  if(!$('#view-bookings').hidden&&!dialog.open)renderBookings();
 });
})();
