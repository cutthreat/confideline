(() => {
 'use strict';
 const root=document.querySelector('.partner-workspace'), $=(s,p=root)=>p.querySelector(s), $$=(s,p=root)=>[...p.querySelectorAll(s)];
 $$('.partner-nav i').forEach(el=>el.setAttribute('aria-hidden','true'));
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const model=window.BookingPreview;
 const {today,clone,active,labels:statuses}=model;
 if(model.otherView){
  document.title='Пользователь #12 · Confideline';
  document.querySelector('.content-header h1').textContent='Пользователь #12';
  document.querySelector('.content-header .breadcrumb .active').textContent='Пользователь #12';
  $('.widget-user-username').textContent='Kristy';$('.widget-user-desc').textContent='Агент';
  const photo=$('.widget-user-image img');photo.src='assets/avatar.svg';photo.alt='Kristy';
  $$('.partner-nav a[href*="id=195"]').forEach(a=>a.href=a.href.replace('id=195','id=12'));
  $('#page-info').innerHTML='<div class="box box-default"><div class="box-header with-border"><h2 class="box-title">Информация аккаунта</h2></div><div class="box-body">Агент Kristy</div></div>';
  $('#transfer-agent').innerHTML='<option value="">Выберите агента</option><option value="partner195">saffettr</option>';
 }
 const parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12);};
 const iso=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
 const add=(s,n)=>{let d=parse(s);d.setDate(d.getDate()+n);return iso(d);};
 const dateText=s=>new Intl.DateTimeFormat('ru-RU',{weekday:'short',day:'numeric',month:'long'}).format(parse(s));
 const numeric=model.minutes;
 let data=model.read(),saved=data.agent,profiles=data.profiles,entries=data.entries;
 let agentBaseline=clone(saved),draft=clone(saved),view='list',date=data.firstDate,selected=null,detailOrigin='bookings',profileEditing=model.expertId,profileDrafts={},profileBaselines={},dialogAction=null;
 let profileSort='assignment',profileSortDirection=1,profileAction=null,bookingContext=null,lastProfileTrigger=null;
 let agentCalendar,profileCalendar;
 const mobileNav=$('#partner-mobile-nav'),leaveDialog=$('#schedule-leave-dialog');
 const historyKey='confidelinePartnerPosition';
 let historyPosition=history.state?.[historyKey]??0;
 let pendingLeave, restoringHistory, approvedHistory;
 history.replaceState({...history.state,[historyKey]:historyPosition},'');
 const fromExpert = new URLSearchParams(location.search).get('fromExpert');
 if (fromExpert === 'bookings') {
  const back = $('#return-expert-' + fromExpert);
  back.hidden = false;
  back.querySelector('a').href = model.link('index.html',fromExpert);
 }
 function sync(state=model.read()){
  data=state;saved=state.agent;profiles=state.profiles;entries=state.entries;
 }
 const name=id=>profiles.find(x=>x.id===id)?.name||(data.formerProfiles||[]).slice().reverse().find(x=>x.id===id)?.name||'Анкета';
 const titleMap={account:'Редактировать аккаунт','payment-info':'Платёжная информация',payments:'Начисления',payouts:'Выплаты',deductions:'Удержания',balance:'Редактировать баланс',login:'Войти как пользователь'};
 function show(page,scroll=false){
  if(page==='profile-schedule'){page='schedule';history.replaceState(history.state,'','#schedule');}
  const valid=['info','profiles','schedule','bookings'].includes(page),target=valid?page:'existing';
  $$('.partner-page').forEach(el=>{el.hidden=el.id!=='page-'+target;});
  $$('.partner-nav [data-page]').forEach(el=>{
   const current=el.dataset.page===page;
   el.classList.toggle('active',current);
   if(current)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
  });
  const mobile=page;
  if([...mobileNav.options].some(x=>x.value===mobile))mobileNav.value=mobile;
  if(!valid)$('#existing-title').textContent=titleMap[page]||'Раздел';
  if(page==='bookings')renderBookings();
  if(page==='profiles')renderProfiles();
  if(page==='waiting'){
   const items=(data.interests || model.defaultInterests()).filter(item=>profiles.some(p=>p.id===item.profile));
   $('#waiting-list').innerHTML=items.map(item=>{const profile=profiles.find(p=>p.id===item.profile),when=item.date?dateText(item.date)+', '+item.at:'Дата запроса не указана';return '<div class="waiting-row"><div><strong>'+esc(item.client)+'</strong><span>'+esc(profile.name)+' · '+esc(when)+'</span></div><span class="status">Ожидает</span></div>';}).join('')||'<p class="empty">Ожидающих нет.</p>';
  }
  if(page==='schedule')renderSchedule();
  if(scroll&&matchMedia('(max-width:1000px)').matches)$('#page-'+target).scrollIntoView({block:'start'});
 }
 function focusPage(){
  const heading=$('.partner-page:not([hidden]) h2');
  heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});
 }
 function hasVisibleScheduleDraft(){
  const conflictOrigin=!$('#page-bookings').hidden&&selected?detailOrigin:null;
  if(!$('#page-schedule').hidden||conflictOrigin==='schedule')return !model.same(draft,agentBaseline);
  return false;
 }
 function requestScheduleLeave(proceed,trigger){
  if(!leaveDialog||!hasVisibleScheduleDraft()){proceed();return;}
  if(pendingLeave)return;
  pendingLeave={proceed,trigger};
  leaveDialog.showModal();$('#schedule-leave-stay').focus();
 }
 function finishScheduleLeave(confirmed){
  if(!pendingLeave)return;
  const {proceed,trigger}=pendingLeave;pendingLeave=null;
  leaveDialog.close();
  if(confirmed){proceed();return;}
  if(trigger?.isConnected&&trigger!==document.body)trigger.focus({preventScroll:true});
  else focusPage();
 }
 $('#schedule-leave-stay')?.addEventListener('click',()=>finishScheduleLeave(false));
 $('#schedule-leave-go')?.addEventListener('click',()=>finishScheduleLeave(true));
 leaveDialog?.addEventListener('cancel',event=>{event.preventDefault();finishScheduleLeave(false);});
 function nav(page){
  if(page==='bookings'){selected=null;$('#booking-detail').hidden=true;$('#booking-workspace').hidden=false;}
  const hash='#'+page+(page==='bookings'&&$('#booking-profile').value!=='all'?':'+$('#booking-profile').value:'');
  if(location.hash!==hash)history.pushState({...history.state,[historyKey]:++historyPosition},'',hash);
  show(page,true);
  focusPage();
 }
 mobileNav.addEventListener('change',e=>{
  const page=e.target.value;
  const id=model.otherView?'12':'195',urls={account:'/ru/admin/partner/update?id='+id,'payment-info':'/ru/admin/partner/payment-info?id='+id,payments:'/ru/admin/partner/payments?id='+id,payouts:'/ru/admin/partner/payouts?id='+id,deductions:'/ru/admin/partner/payments?id='+id+'&mode=minus',balance:'/ru/admin/partner/update-balance?id='+id};
  if(urls[page]){location.href='https://confideline.com'+urls[page];return;}
  if(page==='login'){e.target.value='info';return;}
  if(hasVisibleScheduleDraft()){
   mobileNav.value=!$('#page-schedule').hidden?'schedule':'bookings';
  }
  requestScheduleLeave(()=>{
   if(page==='bookings'){$('#booking-profile').value='all';$('#booking-status').value='all';bookingContext=null;}
   nav(page);
  },mobileNav);
 });
 function renderProfiles(){
  const term=$('#profile-search').value.trim().toLocaleLowerCase(),id=$('#profile-id-filter').value.trim(),day=$('#profile-date-filter').value,end=$('#profile-date-to').value;
  const dateOf=p=>p.createdIso||(p.assignment===28?'2026-11-09':p.assignment?'2026-10-28':'');
  const list=profiles.filter(p=>(p.name+' '+(p.username||'')).toLocaleLowerCase().includes(term)&&String(p.assignment||'').includes(id)&&(!day||dateOf(p)>=day)&&(!end||dateOf(p)<=end)).sort((a,b)=>profileSortDirection*String(profileSort==='created'?dateOf(a):a[profileSort]??'').localeCompare(String(profileSort==='created'?dateOf(b):b[profileSort]??''),undefined,{numeric:true}));
  $('#profiles-summary').textContent=list.length?'Показаны записи 1–'+list.length+' из '+list.length+'.':'Анкеты не найдены.';
  $('#profiles-list').innerHTML=list.length?list.map(p=>{
   const photo=p.photo?'<img src="'+esc(p.photo)+'" alt="">':'<span class="profile-placeholder" aria-hidden="true">'+esc(p.name.charAt(0))+'</span>';
   const user=p.userId?'https://confideline.com/ru/admin/user/info?id='+p.userId:p.id===model.expertId?model.link('index.html','info'):null;
   const isLocal=p.previewOnly||!p.userId||(p.assignment&&![25,26,27,28].includes(p.assignment));
   const view=p.assignment?'https://confideline.com/ru/admin/chief-under/view?id='+p.assignment:user;
   const viewButton=isLocal?'<button class="btn btn-default btn-sm" type="button" title="Просмотр" aria-label="Просмотр: '+esc(p.name)+'" data-profile-view="'+p.id+'"><i class="fa fa-eye"></i></button>':'<a class="btn btn-default btn-sm" href="'+esc(view)+'" title="Просмотр" aria-label="Просмотр: '+esc(p.name)+'"><i class="fa fa-eye"></i></a>';
   const person=photo+'<span><strong>'+esc(p.name)+'</strong><small>'+esc(p.username||p.name)+'</small></span>';
   const personCell=user?'<a class="profile-user" href="'+esc(user)+'">'+person+'</a>':'<span class="profile-user">'+person+'</span>';
   return '<tr><td>'+esc(p.assignment||'—')+'</td><td>'+personCell+'</td><td>'+(p.city?'<span class="label label-success">'+esc(p.city)+'</span>':'—')+'</td><td>'+esc(p.created||'—')+'</td><td><div class="profile-actions">'+viewButton+'<button type="button" class="btn btn-default btn-sm" title="Города эксперта" aria-label="Города эксперта: '+esc(p.name)+'" data-profile-cities="'+p.id+'"><i class="fa fa-map-marker"></i></button><button type="button" class="btn btn-default btn-sm profile-action-text" aria-label="Записи: '+esc(p.name)+'" data-profile-bookings="'+p.id+'">Записи</button><button type="button" class="btn btn-default btn-sm text-danger" title="Снять назначение" aria-label="Снять назначение: '+esc(p.name)+'" data-profile-remove="'+p.id+'"><i class="fa fa-trash"></i></button></div></td></tr>';
  }).join(''):'<tr><td colspan="5" class="profiles-empty">Нет анкет по выбранным условиям</td></tr>';
 }
 ['profile-search','profile-id-filter','profile-date-filter','profile-date-to'].forEach(id=>$('#'+id).addEventListener('input',renderProfiles));
 $('#profile-filter-reset').addEventListener('click',()=>{['profile-search','profile-id-filter','profile-date-filter','profile-date-to'].forEach(id=>$('#'+id).value='');renderProfiles();});
 const availableProfiles={solara:{id:'solara',name:'Solara Ortiz',username:'SolaraOrtiz',userId:103},'stella-new':{id:'stella-new',name:'Stella Bērziņa',username:'StellaBerzina',userId:104},'talia-new':{id:'talia-new',name:'Talia Munkrest',username:'TaliaMunkrest',userId:105}};
 function addCandidates(){
  const candidates=[...Object.values(availableProfiles),...(data.formerProfiles||[]).slice().reverse()],unique=[];
  for(const item of candidates)if(!unique.some(p=>p.id===item.id)&&!profiles.some(p=>p.id===item.id||(item.userId!=null&&p.userId===item.userId)))unique.push(item);
  return unique;
 }
 function renderAddOptions(){$('#profile-add-options').innerHTML=addCandidates().map(item=>'<option value="'+esc(item.name)+'"></option>').join('');}
 renderAddOptions();
 $('#profile-add-button').addEventListener('click',()=>{const term=$('#profile-add').value.trim().toLocaleLowerCase(),candidate=addCandidates().find(x=>x.name.toLocaleLowerCase()===term||(x.username||'').toLocaleLowerCase()===term),msg=$('#profile-add-message');if(!candidate){msg.textContent='Выберите пользователя из списка.';return;}const p=Object.fromEntries(['id','name','username','userId','city','photo'].filter(key=>candidate[key]!=null).map(key=>[key,candidate[key]])),result=model.addProfile(p);if(result.error){msg.textContent=result.error;return;}sync(result.state);refillProfiles();renderAddOptions();renderProfiles();$('#profile-add').value='';msg.textContent='Анкета добавлена.';});
 $('#profile-view-close').addEventListener('click',()=>{$('#profile-view-dialog').close();$('[data-profile-view="'+profileAction+'"]')?.focus();});
 function renderCities(){const p=profiles.find(x=>x.id===profileAction);if(!p)return;$('#cities-title').textContent='Города эксперта: '+p.name;const cities=p.cities||(p.city?[p.city]:[]);$('#cities-list').innerHTML=cities.map((c,i)=>'<div class="list-group-item">'+esc(c)+(i===0?' <span class="label label-success">По умолчанию</span>':'')+'</div>').join('')||'Города не назначены.';}
 $('#cities-close').addEventListener('click',()=>{$('#cities-dialog').close();$('[data-profile-cities="'+profileAction+'"]')?.focus();});
 $('#cities-form').addEventListener('submit',e=>{e.preventDefault();const city=$('#cities-input').value.trim();if(!city)return;const result=model.addCity(profileAction,city);$('#cities-message').textContent=result.error||'Город добавлен.';if(result.state){sync(result.state);renderCities();$('#cities-input').value='';}});
 $('#remove-profile-cancel').addEventListener('click',()=>{$('#remove-profile-dialog').close();$('[data-profile-remove="'+profileAction+'"]')?.focus();});
 $('#emergency-profile-open').addEventListener('click',()=>{$('#remove-profile-dialog').close();$('#emergency-profile-reason').value='';$('#emergency-profile-error').textContent='';$('#emergency-profile-dialog').showModal();$('#emergency-profile-reason').focus();});
 $('#emergency-profile-cancel').addEventListener('click',()=>{$('#emergency-profile-dialog').close();$('#remove-profile-dialog').showModal();$('#emergency-profile-open').focus();});
 $('#emergency-profile-form').addEventListener('submit',e=>{
  e.preventDefault();if(!e.currentTarget.reportValidity())return;
  const result=model.emergencyRemove(profileAction,$('#emergency-profile-reason').value);
  if(result.error){$('#emergency-profile-error').textContent=result.error;return;}
  sync(result.state);$('#emergency-profile-dialog').close();refillProfiles();renderProfiles();
  $('#profile-action-message').textContent='Доступ отозван. Консультация остановлена. Проверьте расчёт и будущие записи.';
  $('#profile-search').focus();
 });
 $('#remove-profile-open-bookings').addEventListener('click',()=>{
  const id=profileAction;$('#remove-profile-dialog').close();bookingContext={profile:id,from:'profiles'};
  $('#booking-profile').value=id;$('#booking-status').value='all';selected=null;nav('bookings');
 });
 $('#transfer-agent').addEventListener('change',()=>{
  const target=$('#transfer-agent').value,button=$('#transfer-profile-confirm'),summary=$('#transfer-summary');
  if(!target){button.disabled=true;summary.textContent='';return;}
  const result=model.inspectTransfer(profileAction,target);
  if(result.error){button.disabled=true;summary.textContent=result.error;return;}
  button.disabled=result.live;
  const overlaps=result.conflicts.length?'У выбранного агента есть совпадающие записи: '+result.conflicts.map(c=>dateText(c.date)+' '+c.time).join(', ')+'. ':'',outside=result.scheduleIssues.length?'Вне рабочего времени агента: '+result.scheduleIssues.map(c=>dateText(c.scheduleConflictProposal&&!c.scheduleConflictOriginal?c.proposal.date:c.date)+' '+(c.scheduleConflictProposal&&!c.scheduleConflictOriginal?c.proposal.time:c.time)).join(', ')+'. ':'';
  summary.textContent=result.live?'Передать анкету можно после завершения текущей консультации.':overlaps||outside?overlaps+outside+'Записи сохранятся; конфликт нужно решить с клиентами.':'Анкета и активные записи перейдут выбранному агенту.';
 });
 $('#transfer-profile-confirm').addEventListener('click',()=>{
  const id=profileAction,profileName=name(id),result=model.transferProfile(id,$('#transfer-agent').value);
  if(result.error){$('#remove-profile-message').textContent=result.error;return;}
  sync(result.state);delete profileDrafts[id];delete profileBaselines[id];$('#remove-profile-dialog').close();refillProfiles();renderAddOptions();renderProfiles();
  const q=new URLSearchParams(location.search),targetName=model.otherView?'saffettr':'Kristy';if(model.otherView)q.delete('demoAgent');else q.set('demoAgent','kristy');const target='partner.html?'+q.toString()+'#bookings';
  $('#profile-action-message').innerHTML='Анкета '+esc(profileName)+' передана агенту '+esc(targetName)+'.'+(result.conflicts.length||result.scheduleIssues.length?' Есть конфликт записей. ':' ')+'<a href="'+esc(target)+'">Открыть записи агента</a>';
 });
 $('#remove-profile-confirm').addEventListener('click',()=>{
  const id=profileAction,profileName=name(id),result=model.removeProfile(id);
  if(result.error){sync();$('#remove-profile-message').textContent=result.error;const blocked=entries.some(entry=>entry.profile===id&&active(entry));$('#remove-profile-open-bookings').hidden=!blocked;$('#remove-profile-confirm').hidden=blocked;if(blocked)$('#remove-profile-open-bookings').focus();return;}
  sync(result.state);delete profileDrafts[id];delete profileBaselines[id];
  $('#remove-profile-dialog').close();refillProfiles();renderAddOptions();renderProfiles();
  const message=$('#profile-action-message');message.textContent='Назначение снято: '+profileName+'.';
  if(entries.some(entry=>entry.profile===id)){
   message.append(' История записей сохранена. ');
   const button=document.createElement('button');button.type='button';button.className='text-button';button.dataset.formerBookings=id;button.textContent='Открыть историю';message.appendChild(button);
  }
  $('#profile-search').focus();
 });
 function updateAgentPreview(){$('#agent-calendar-preview').hidden=model.same(draft,agentBaseline);}
 const scheduleMessage=(msg,error=false)=>{let box=$('#schedule-message');box.textContent=msg;box.classList.toggle('error',error);updateAgentPreview();};
 function dayAppearance(row,on){if(!row)return;row.classList.toggle('is-work',on);row.classList.toggle('is-off',!on);const state=row.querySelector('.day-state');if(state)state.textContent=on?'Рабочий':'Выходной';}
 function dayRow(d,i,profile=false){const prefix=profile?'p':'',label=esc(d.name);return '<div class="day-rule '+(d.enabled?'is-work':'is-off')+'"><label class="day-label"><input type="checkbox" data-'+prefix+'day="'+i+'" '+(d.enabled?'checked':'')+'> <span>'+label+'</span><span class="day-state">'+(d.enabled?'Рабочий':'Выходной')+'</span></label><label class="time-label">С<input aria-label="'+label+' с" class="form-control" type="time" data-'+prefix+'from="'+i+'" value="'+d.from+'" '+(!d.enabled?'disabled':'')+'></label><label class="time-label">До<input aria-label="'+label+' до" class="form-control" type="time" data-'+prefix+'to="'+i+'" value="'+d.to+'" '+(!d.enabled?'disabled':'')+'></label></div>';}
 function drawDays(){
  $('#agent-days').innerHTML=draft.days.map((d,i)=>dayRow(d,i)).join('');
 }
 function drawExceptions(){
  $('#exception-list').innerHTML=draft.exceptions.length?draft.exceptions.map((x,i)=>'<div class="exception-row"><span>'+dateText(x.date)+' · '+(x.kind==='closed'?'Выходной':x.from+'–'+x.to)+'</span><button type="button" class="btn btn-default btn-sm" data-remove-exception="'+i+'">Удалить</button></div>').join(''):'';
 }
 function renderSchedule(){drawDays();drawExceptions();$('#agent-break-enabled').checked=draft.breakEnabled;$('#agent-break-from').value=draft.breakFrom;$('#agent-break-to').value=draft.breakTo;$('#agent-break-from').disabled=!draft.breakEnabled;$('#agent-break-to').disabled=!draft.breakEnabled;agentCalendar?.refresh();updateAgentPreview();renderSavedScheduleConflicts();}
 function conflictsFor(candidate){
  return model.scheduleConflicts(entries,candidate,null,null);
 }
 function conflictButtons(conflicts){
  return conflicts.map(b=>{
   const times=[];
   if(b.scheduleConflictOriginal)times.push(dateText(b.date)+' '+b.time);
   if(b.scheduleConflictProposal)times.push('Предложенное время: '+dateText(b.proposal.date)+' '+b.proposal.time);
   return '<button type="button" class="btn btn-default btn-sm conflict-link" data-conflict="'+b.id+'">'+esc(name(b.profile))+' · '+esc(b.client)+' · '+esc(times.join(' · '))+'</button>';
  }).join('');
 }
 const savedConflictButtons={};
 function renderSavedScheduleConflicts(){
  const prefix='saved-schedule';
  const box=$('#'+prefix+'-conflicts');
  if(!box)return;
  const conflicts=conflictsFor(saved);
  const buttons=conflictButtons(conflicts);
  box.hidden=!conflicts.length;
  if(buttons===savedConflictButtons[prefix])return;
  savedConflictButtons[prefix]=buttons;
  $('#'+prefix+'-conflict-message').textContent=conflicts.length?'Записи вне рабочего времени по сохранённому графику: '+conflicts.length+'. Откройте запись, чтобы решить конфликт.':'';
  $('#'+prefix+'-conflict-links').innerHTML=buttons;
 }
 $('#agent-days').addEventListener('change',e=>{
  const t=e.target,idx=Number(t.dataset.day??t.dataset.from??t.dataset.to);if(!Number.isInteger(idx))return;
  if(t.dataset.day!==undefined)draft.days[idx].enabled=t.checked;
  if(t.dataset.from!==undefined)draft.days[idx].from=t.value;
  if(t.dataset.to!==undefined)draft.days[idx].to=t.value;
  if(t.dataset.day!==undefined){$$('[data-from="'+idx+'"],[data-to="'+idx+'"]').forEach(input=>input.disabled=!t.checked);dayAppearance(t.closest('.day-rule'),t.checked);}
  scheduleMessage('Есть несохранённые изменения.');agentCalendar?.refresh();
 });
 ['agent-break-enabled','agent-break-from','agent-break-to'].forEach(id=>$('#'+id).addEventListener('change',()=>{
  draft.breakEnabled=$('#agent-break-enabled').checked;draft.breakFrom=$('#agent-break-from').value;draft.breakTo=$('#agent-break-to').value;
  $('#agent-break-from').disabled=!draft.breakEnabled;$('#agent-break-to').disabled=!draft.breakEnabled;scheduleMessage('Есть несохранённые изменения.');agentCalendar?.refresh();
 }));
 $('#exception-kind').addEventListener('change',()=>{let on=$('#exception-kind').value==='hours';$('#exception-from-label').hidden=!on;$('#exception-to-label').hidden=!on;});
 $('#exception-add').addEventListener('click',()=>{
  const date=$('#exception-date').value,kind=$('#exception-kind').value,from=$('#exception-from').value,to=$('#exception-to').value;
  if(!date)return scheduleMessage('Выберите дату.',true);
  if(draft.exceptions.some(x=>x.date===date))return scheduleMessage('Для этой даты изменение уже добавлено.',true);
  if(kind==='hours'&&(!from||!to||from>=to))return scheduleMessage('Проверьте время начала и окончания.',true);
  draft.exceptions.push({date,kind,from,to});drawExceptions();scheduleMessage('Изменение добавлено. Сохраните график.');agentCalendar?.refresh();
 });
 $('#exception-list').addEventListener('click',e=>{const x=e.target.closest('[data-remove-exception]');if(x){draft.exceptions.splice(Number(x.dataset.removeException),1);drawExceptions();scheduleMessage('Есть несохранённые изменения.');agentCalendar?.refresh();}});
 $('#schedule-reset').addEventListener('click',()=>{sync();agentBaseline=clone(saved);draft=clone(saved);renderSchedule();scheduleMessage('Загружен сохранённый график.');});
 $('#agent-schedule').addEventListener('submit',e=>{
  e.preventDefault();
  if(draft.days.some(d=>d.enabled&&(!d.from||!d.to||d.from>=d.to)))return scheduleMessage('Проверьте время начала и окончания рабочих дней.',true);
  if(draft.breakEnabled&&(!draft.breakFrom||!draft.breakTo||draft.breakFrom>=draft.breakTo))return scheduleMessage('Проверьте время перерыва.',true);
  const result=model.saveSchedule(draft,agentBaseline);
  if(result.error)return scheduleMessage(result.error,true);
  sync(result.state);agentBaseline=clone(saved);
  scheduleMessage('График сохранён.');
  renderSavedScheduleConflicts();
 });
 function refillProfiles(){
  const select=$('#booking-profile'),previous=select.value,former=[];
  for(const p of (data.formerProfiles||[]).slice().reverse()){
   const current=profiles.some(item=>item.id===p.id);
   const attributable=entries.some(entry=>entry.profile===p.id&&((p.assignment!=null&&entry.assignment===p.assignment)||(p.bookingIds||[]).includes(entry.id)));
   if(!current&&!former.some(old=>old.id===p.id)&&entries.some(entry=>entry.profile===p.id))former.push({...p,filterKey:p.id});
   else if(current&&attributable)former.push({...p,filterKey:'former-'+p.id+'-'+p.assignment});
  }
  select.innerHTML='<option value="all">Все анкеты</option>'+profiles.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>').join('')+former.map(p=>'<option value="'+esc(p.filterKey)+'">'+esc(p.name)+' · ранее назначена'+(p.filterKey===p.id?'':' №'+esc(p.assignment))+'</option>').join('');
  select.value=[...select.options].some(option=>option.value===previous)?previous:'all';
 }
 refillProfiles();$('#booking-date').value=date;
 function profileMatches(b,p){
  if(p==='all'||p===b.profile)return true;
  const former=(data.formerProfiles||[]).find(item=>'former-'+item.id+'-'+item.assignment===p);
  return Boolean(former&&b.profile===former.id&&((former.assignment!=null&&b.assignment===former.assignment)||(former.bookingIds||[]).includes(b.id)));
 }
 function filtered(b){const p=$('#booking-profile').value,s=$('#booking-status').value;return profileMatches(b,p)&&(s==='all'||s===model.visibleStatus(b)||(s==='cancelled'&&b.state==='declined'));}
 function overlapConflict(b,date=b.date,time=b.time){return active(b)&&model.occupied(entries,date,numeric(time),b.id).length>0;}
 function entry(b,privateView=false,hideTime=false,slot=null){
  const shownTime=slot?.time||b.time,shownDate=slot?.date||b.date;
  if(privateView)return '<div class="busy-entry">'+(hideTime?'':esc(shownTime)+' · ')+'Партнёр занят</div>';
  const status=model.visibleStatus(b);
  const hold=b.proposal?model.proposalDeadline(b):model.holdDescription(b);
  const profile=profiles.find(p=>p.id===b.profile),conflict=model.scheduleConflicts([b],saved,profile,b.profile)[0];
  const conflictText=conflict?(conflict.scheduleConflictOriginal&&conflict.scheduleConflictProposal?' · Конфликт обоих окон':conflict.scheduleConflictProposal?' · Конфликт предложенного времени':' · Конфликт графика'):'';
  const unassigned=active(b)&&!profiles.some(p=>p.id===b.profile)?' · Требуется назначить агента':'';
  return '<div class="entry"><button type="button" class="entry-btn" data-entry="'+b.id+'"><strong>'+esc(shownTime)+'</strong><span class="entry-main"><strong>'+esc(b.client)+' · '+esc(name(b.profile))+'</strong><span>'+esc(dateText(shownDate))+(slot?.proposed?' · Предложенное время':'')+(hold?' · '+esc(hold):'')+conflictText+unassigned+(overlapConflict(b,shownDate,shownTime)?' · Конфликт записей':'')+'</span></span><span class="status '+esc(status)+'">'+esc(statuses[status])+'</span></button></div>';
 }
 function renderBookings(){
  sync();
  refillProfiles();
  $('#booking-date').value=date;
  const filterProfile=$('#booking-profile').value;
  const profileBack=$('#booking-back-profile');profileBack.hidden=!bookingContext||Boolean(selected);profileBack.textContent='‹ К анкетам';
  ['pending','processing','confirmed'].forEach(s=>{$('#'+s+'-count').textContent=entries.filter(x=>model.visibleStatus(x)===s&&profileMatches(x,filterProfile)).length;});
  $$('.quick').forEach(b=>{const on=b.dataset.quick===$('#booking-status').value;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  $$('[data-view]').forEach(b=>{const on=b.dataset.view===view;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  let list=entries.filter(filtered).sort((a,b)=>(a.state==='pending'?-1:0)-(b.state==='pending'?-1:0)||(a.state==='pending'&&b.state==='pending'?(a.deadlineAt||Infinity)-(b.deadlineAt||Infinity):0)||a.date.localeCompare(b.date)||a.time.localeCompare(b.time)),result=$('#booking-results'),profile=$('#booking-profile').value;
  $('#booking-date-label').hidden=view==='list';
  if(view==='list'){
   $('#booking-count').textContent='Найдено: '+list.length;
   result.innerHTML=list.length?list.map(b=>entry(b)).join(''):'<p class="empty">По выбранным условиям записей нет.</p>';
  }else{
   const begin=view==='day'?date:add(date,-((parse(date).getDay()+6)%7)),end=view==='day'?date:add(begin,6),inRange=list.filter(b=>(b.date>=begin&&b.date<=end)||(b.proposal?.holdsSlot&&b.proposal.date>=begin&&b.proposal.date<=end));
   $('#booking-count').textContent='Записей в периоде: '+inRange.length;
   $('#booking-period').textContent=view==='day'?dateText(date):dateText(begin)+' — '+dateText(end);
   if(view==='day'){
    const matching=model.calendarEvents(entries,date).filter(slot=>filtered(slot.booking));
    const rows=model.dayRows(data,date,profile);
    const lines=rows.map(({time,end,booking,label,proposed})=>{
     const slot={date,time,proposed};
     const content=booking?(filtered(booking)?entry(booking,false,false,slot):entry(booking,true,true,slot)):'<span class="slot-note">'+esc(label)+'</span>';
     return '<div class="timeline-row"><span class="timeline-time">'+time+(booking?'':'–'+end)+'</span><div>'+content+'</div></div>';
    });
    const history=matching.filter(slot=>!rows.some(row=>row.booking?.id===slot.booking.id&&Boolean(row.proposed)===slot.proposed)).map(slot=>entry(slot.booking,false,false,slot)).join('');
    result.innerHTML=(lines.join('')||'<p class="empty">У партнёра выходной.</p>')+history;
   }else{
    result.innerHTML=Array.from({length:7},(_,i)=>{
     let day=add(begin,i),all=model.calendarEvents(entries,day);
     let rows=all.map(slot=>filtered(slot.booking)?entry(slot.booking,false,false,slot):active(slot.booking)?entry(slot.booking,true,false,slot):'').join('');
     return '<div class="day-heading">'+esc(dateText(day))+'</div>'+(rows||'<p class="empty">Записей нет.</p>');
    }).join('');
   }
  }
  if(selected)renderDetail(entries.find(b=>b.id===selected));
 }
 function renderDetail(b){
  if(!b)return;
  $('#booking-workspace').hidden=true;$('#booking-back-profile').hidden=true;const d=$('#booking-detail');d.hidden=false;
  const buttons={confirm:'Подтвердить',decline:'Отклонить',cancel:'Отменить запись',withdraw:'Отозвать предложение',reschedule:'Предложить перенос','no-show':'Сообщить о неявке'};
  const actions=model.actions(b).map(action=>'<button type="button" class="btn btn-'+(action==='confirm'?'primary':'default')+'" data-action="'+action+'">'+buttons[action]+'</button>').join(' ');
  const status=model.visibleStatus(b);
  const price=Number.isFinite(b.acceptedPrice)?'<div><span>Цена этой записи</span><strong>'+esc(b.acceptedPrice)+' кредитов / мин</strong></div>':'';
  const proposed=active(b)&&b.proposal?'<p class="proposal-note">Предложено: '+esc(dateText(b.proposal.date))+' · '+esc(b.proposal.time)+'. '+esc(model.proposalDescription(b))+'</p>':'';
  const outcome=model.needsOutcomeCheck(b)?'<p class="proposal-note">Время встречи наступило. Проверьте состояние консультации в чате.</p>':'';
  const conflict=model.scheduleConflicts([b],saved,profiles.find(p=>p.id===b.profile),b.profile)[0];
  const scheduleConflict=conflict?'<p class="proposal-note">'+(conflict.scheduleConflictOriginal?'Исходное время вне рабочего графика. ':'')+(conflict.scheduleConflictProposal?'Предложенное время вне рабочего графика. ':'')+'Выберите действие, чтобы решить конфликт.</p>':'';
  const doubleBooking=overlapConflict(b)?'<p class="proposal-note">На исходное время у партнёра есть другая запись.</p>':'';
  const proposalOverlap=b.proposal&&overlapConflict(b,b.proposal.date,b.proposal.time)?'<p class="proposal-note">На предложенное время у партнёра есть другая запись.</p>':'';
  const clientSuggestion=b.clientSuggestion?'<p class="proposal-note">Клиент предложил время: '+esc(dateText(b.clientSuggestion.date))+' · '+esc(b.clientSuggestion.time)+'. Проверьте возможность переноса и ответьте клиенту.</p>':'';
  const unassigned=active(b)&&!profiles.some(p=>p.id===b.profile)?'<p class="proposal-note">По этой анкете нужно назначить агента и обеспечить встречу в согласованное время. При необходимости изменения времени свяжитесь с клиентом.</p>':'';
  const back=detailOrigin==='schedule'?'К графику':view==='list'?'К записям':'К календарю';
  d.innerHTML='<button type="button" class="text-button" data-back>‹ '+back+'</button><div class="detail-heading"><div><h3>'+esc(b.client)+'</h3><p>'+esc(name(b.profile))+' · '+esc(dateText(b.date))+' · '+esc(b.time)+'</p></div><span class="status '+esc(status)+'">'+esc(statuses[status])+'</span></div><div class="detail-grid"><div><span>Анкета</span><strong>'+esc(name(b.profile))+'</strong></div><div><span>Следующее действие</span><strong>'+esc(b.proposal?model.proposalDeadline(b):b.deadline)+'</strong></div><div><span>Окно в графике</span><strong>'+esc(b.time)+'–'+model.time(numeric(b.time)+model.slotLength)+'</strong></div>'+price+'</div>'+unassigned+scheduleConflict+doubleBooking+proposed+proposalOverlap+clientSuggestion+outcome+'<div class="form-row">'+actions+'</div><details><summary>История записи</summary><ul>'+b.history.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></details>';
 }
 function openEntry(id,origin='bookings'){
  selected=id;detailOrigin=origin;show('bookings');renderDetail(entries.find(b=>b.id===id));$('#booking-detail [data-back]').focus();
 }
 function closeDetail(){
  let old=selected;selected=null;$('#booking-detail').hidden=true;$('#booking-workspace').hidden=false;
  if(detailOrigin==='schedule'){
   const page=detailOrigin;detailOrigin='bookings';sync();show(page);
   if(page==='schedule'&&!model.same(draft,agentBaseline)){
    const conflicts=conflictsFor(draft);
    scheduleMessage(conflicts.length?'В черновике графика записи вне рабочего времени: '+conflicts.length+'. При сохранении графика время записей не изменится.':'Есть несохранённые изменения.');
   }
   const trigger=$('#page-'+page+' [data-conflict="'+old+'"]');
   if(trigger)trigger.focus();else focusPage();
   return;
  }
  renderBookings();let trigger=$('[data-entry="'+old+'"]');if(trigger)trigger.focus();else $('#booking-profile').focus();
 }
 function alternatives(b,date){sync();return model.alternatives(data,entries.find(item=>item.id===b.id),date);}
 function refreshAlternatives(b){const date=$('#alternative-date').value,slots=alternatives(b,date);$('#alternative-time').innerHTML='<option value="">'+(slots.length?'Выберите время':'Нет свободного времени')+'</option>'+slots.map(t=>'<option value="'+t+'">'+t+'</option>').join('');$('#alternative-time').disabled=!slots.length;$('#dialog-submit').disabled=!slots.length;}
 $('#alternative-date').addEventListener('change',()=>{const b=entries.find(x=>x.id===selected);if(b)refreshAlternatives(b);});
 function openDialog(action){
  const b=entries.find(x=>x.id===selected);dialogAction=action;
  const isConfirm=action==='confirm',isMove=action==='reschedule',isWithdraw=action==='withdraw',isNoShow=action==='no-show',reason=$('#dialog-reason-label');reason.hidden=isConfirm||isWithdraw||isNoShow;$('#dialog-reason').required=['cancel','decline'].includes(action);$('#dialog-reason').value='';
  $('#dialog-reason-caption').textContent=isMove?'Комментарий клиенту (необязательно)':'Причина';
  $('#dialog-error').textContent='';
  $('#dialog-alternative').hidden=!isMove;$('#alternative-date').required=isMove;$('#alternative-time').required=isMove;$('#dialog-submit').disabled=false;
  $('#dialog-title').textContent=isConfirm?'Подтвердить заявку':action==='decline'?'Отклонить заявку':isMove?'Предложить другое время':isWithdraw?'Отозвать предложение':isNoShow?'Сообщить о возможной неявке':'Отменить запись';
  const hold=model.holdDescription(b),holdNote=hold?'Прежнее время удерживается. '+hold+'. ':'Прежнее время сохраняется, пока запись подтверждена. ';
  $('#dialog-copy').textContent=isConfirm?'Время останется за этой записью.':isMove?((b.date+'T'+b.time>model.now().slice(0,16)?'Оба времени будут удерживаться до ответа клиента или окончания срока.':'Новое время будет удерживаться до ответа клиента или окончания срока.')+(b.state==='pending'?' Предложение подтверждает вашу готовность на новое время.':'')):isWithdraw?holdNote:isNoShow?'Случай будет передан на проверку.':'Время освободится после сохранения.';
  $('#dialog-submit').textContent=isConfirm?'Подтвердить':action==='decline'?'Отклонить':isMove?'Предложить время':isWithdraw?'Отозвать':isNoShow?'Сообщить о неявке':'Отменить запись';
  if(isMove){$('#alternative-date').min=today();$('#alternative-date').value=b.date<today()?today():b.date;refreshAlternatives(b);}
  $('#confirm-dialog').showModal();(isMove?$('#alternative-date'):reason.hidden?$('#dialog-cancel'):$('#dialog-reason')).focus();
 }
 $('#dialog-cancel').addEventListener('click',()=>{$('#confirm-dialog').close();$('#booking-detail [data-back]').focus();});
 $('#dialog-form').addEventListener('submit',e=>{
  e.preventDefault();if(!e.currentTarget.reportValidity())return;const b=entries.find(x=>x.id===selected),note=$('#dialog-reason').value.trim();
  const result=model.perform(b.id,dialogAction,{note,date:$('#alternative-date').value,time:$('#alternative-time').value});
  if(result.error){$('#dialog-error').textContent=result.error;if(dialogAction==='reschedule')refreshAlternatives(b);return;}
  sync(result.state);$('#confirm-dialog').close();renderBookings();$('#booking-detail [data-back]').focus();
 });
 root.addEventListener('click',e=>{
  const n=e.target.closest('[data-page]');
  if(n){
   e.preventDefault();
   const page=n.dataset.page;
   if(page==='schedule'&&location.hash==='#schedule'){
    if(selected&&detailOrigin==='schedule')closeDetail();
    return;
   }
   requestScheduleLeave(()=>{
    if(page==='bookings'){$('#booking-profile').value='all';$('#booking-status').value='all';bookingContext=null;}
    nav(page);
   },n);
   return;
  }
  const sort=e.target.closest('[data-profile-sort]');if(sort){profileSortDirection=profileSort===sort.dataset.profileSort?-profileSortDirection:1;profileSort=sort.dataset.profileSort;renderProfiles();return;}
  const city=e.target.closest('[data-profile-cities]');if(city){profileAction=city.dataset.profileCities;$('#cities-input').value='';$('#cities-message').textContent='';renderCities();$('#cities-dialog').showModal();return;}
  const pv=e.target.closest('[data-profile-view]');if(pv){profileAction=pv.dataset.profileView;$('#profile-view-name').textContent=name(profileAction);$('#profile-view-dialog').showModal();return;}
  const remove=e.target.closest('[data-profile-remove]');if(remove){
   sync();profileAction=remove.dataset.profileRemove;
   const blocked=entries.filter(entry=>entry.profile===profileAction&&active(entry));
   const live=model.hasLiveSession(data,profileAction);
   $('#remove-profile-title').textContent='Снять назначение: '+name(profileAction)+'?';
   $('#remove-profile-copy').textContent=live?'По этой анкете идёт консультация. Снимите назначение после её завершения.':'Снять назначение анкеты '+name(profileAction)+' с этого партнёра?'+(blocked.length?' У анкеты есть активные заявки или записи, поэтому выберите нового агента.':'');
   $('#remove-profile-message').textContent='';$('#remove-profile-open-bookings').hidden=!blocked.length;
   $('#remove-profile-confirm').hidden=Boolean(blocked.length)||live;
   $('#transfer-profile-options').hidden=!blocked.length||live;$('#transfer-profile-confirm').hidden=!blocked.length||live;
   $('#emergency-profile-open').hidden=!live;
   $('#transfer-profile-confirm').disabled=true;$('#transfer-agent').value='';$('#transfer-summary').textContent='';
   $('#remove-profile-dialog').showModal();(live?$('#remove-profile-cancel'):blocked.length?$('#transfer-agent'):$('#remove-profile-cancel')).focus();return;
  }
  const former=e.target.closest('[data-former-bookings]');if(former){bookingContext=null;$('#booking-profile').value=former.dataset.formerBookings;$('#booking-status').value='all';selected=null;nav('bookings');return;}
  const goto=e.target.closest('[data-goto]');if(goto){requestScheduleLeave(()=>nav(goto.dataset.goto),goto);return;}
  if(e.target.closest('#booking-back-profile')){const context=bookingContext;bookingContext=null;nav('profiles');if(context)$('[data-profile-bookings="'+context.profile+'"]')?.focus();return;}
  const pb=e.target.closest('[data-profile-bookings]');if(pb){requestScheduleLeave(()=>{bookingContext={profile:pb.dataset.profileBookings,from:'profiles'};$('#booking-profile').value=pb.dataset.profileBookings;$('#booking-status').value='all';selected=null;$('#booking-detail').hidden=true;$('#booking-workspace').hidden=false;nav('bookings');},pb);return;}
  const q=e.target.closest('[data-quick]');if(q){$('#booking-status').value=q.dataset.quick;view='list';selected=null;$('#booking-detail').hidden=true;$('#booking-workspace').hidden=false;renderBookings();return;}
  const v=e.target.closest('[data-view]');if(v){view=v.dataset.view;renderBookings();return;}
  const ent=e.target.closest('[data-entry]');if(ent){openEntry(Number(ent.dataset.entry));return;}
  const c=e.target.closest('[data-conflict]');if(c){openEntry(Number(c.dataset.conflict),'schedule');return;}
  if(e.target.closest('[data-back]')){closeDetail();return;}
  const action=e.target.closest('[data-action]');if(action){openDialog(action.dataset.action);return;}
 });
 $('#booking-date').addEventListener('change',e=>{if(e.target.value){date=e.target.value;renderBookings();}});
 function saveBookingFilter(){const value=$('#booking-profile').value;history.replaceState(history.state,'','#bookings'+(value==='all'?'':':'+value));}
 $('#booking-profile').addEventListener('change',()=>{saveBookingFilter();renderBookings();});$('#booking-status').addEventListener('change',renderBookings);
 $('#booking-reset').addEventListener('click',()=>{$('#booking-profile').value='all';$('#booking-status').value='all';saveBookingFilter();renderBookings();});
 function route(){
  const [page,id]=location.hash.slice(1).split(':');
  if(page==='bookings'){
   $('#booking-profile').value=[...$('#booking-profile').options].some(option=>option.value===id)?id:'all';
   selected=null;$('#booking-workspace').hidden=false;$('#booking-detail').hidden=true;
  }
  show(page||'bookings');
 }
 window.addEventListener('popstate',event=>{
  const position=event.state?.[historyKey];
  if(restoringHistory&&position===historyPosition){
   const {delta,target,trigger}=restoringHistory;restoringHistory=null;
   requestScheduleLeave(()=>{approvedHistory=target;history.go(delta);},trigger);
   return;
  }
  if(Number.isInteger(position)&&position!==historyPosition){
   if(leaveDialog&&position!==approvedHistory&&hasVisibleScheduleDraft()){
    // A traversal has already changed the URL. Restore its exact history entry
    // before prompting, then replay the traversal only if the user proceeds.
    const delta=position-historyPosition;
    restoringHistory={delta,target:position,trigger:document.activeElement};
    history.go(-delta);
    return;
   }
   historyPosition=position;approvedHistory=null;
  }
  route();focusPage();
 });
 root.addEventListener('click',e=>{
  const step=e.target.closest('[data-booking-step]');
  if(step){date=add(date,Number(step.dataset.bookingStep)*(view==='week'?7:1));renderBookings();}
  if(e.target.closest('[data-booking-today]')){date=today();renderBookings();}
 });
 const calendarState=s=>({mode:s.mode==='inherit'?'inherited':s.mode,days:s.days.map(d=>({enabled:d.enabled,start:d.from,end:d.to})),exceptions:s.exceptions.map(x=>({...x,start:x.from,end:x.to})),breakEnabled:s.breakEnabled,breakStart:s.breakFrom,breakEnd:s.breakTo});
 agentCalendar=window.initExpertScheduleCalendar($('#agent-calendar'),{
  getState:()=>calendarState(draft),getBookings:()=>model.calendarBookings(entries.filter(model.active)),sourceLabel:()=> 'График агента',breakLabel:'Перерыв',
  selectDate:day=>{$('#exception-date').value=day;},editDate:()=>{$('#exception-date').scrollIntoView({block:'center'});$('#exception-date').focus();}
 });
 route();
 window.addEventListener('beforeunload',event=>{
  const unsavedAgent=!model.same(draft,agentBaseline);
  if(unsavedAgent){event.preventDefault();event.returnValue='';}
 });
 model.watch(state=>{
  const cleanAgent=model.same(draft,agentBaseline);
  const agentChanged=!model.same(saved,state.agent);
  sync(state);renderAddOptions();
  agentCalendar?.refresh();
   if(cleanAgent){agentBaseline=clone(saved);draft=clone(saved);}
   if(!$('#page-schedule').hidden){
    if(cleanAgent&&agentChanged)renderSchedule();else renderSavedScheduleConflicts();
   }
  if(!$('#page-bookings').hidden&&!$('#confirm-dialog').open)renderBookings();
  if(!$('#page-profiles').hidden)renderProfiles();
 });
})();
