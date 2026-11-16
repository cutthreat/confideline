(() => {
 'use strict';
 const model = window.BookingPreview;
 const select = document.querySelector('#pd-period');
 const counts = {7:[3,5,2,4], 30:[11,19,3,12]};
 function updateMetrics() {
  ['chats','pings','unanswered','consultations'].forEach((key,index) => {
   document.querySelector('#pd-'+key).textContent = counts[select.value][index];
  });
 }
 select.addEventListener('change',updateMetrics);
 window.addEventListener('pageshow',()=>requestAnimationFrame(updateMetrics));
 const weekday = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
 const fmt = new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short'});
 const parsed = value => new Date(value+'T12:00:00');
 const node = (tag,className,text) => {
  const el=document.createElement(tag); if(className)el.className=className;
  if(text!==undefined)el.textContent=text; return el;
 };
 function render(state) {
  const week=model.weekOf(model.today()), last=model.addDays(week,6), next=model.addDays(week,7);
  const current=model.getWeek(state.agent,week), upcoming=model.getWeek(state.agent,next);
  document.querySelector('#pd-week-range').textContent=fmt.format(parsed(week))+' — '+fmt.format(parsed(last));
  const status=document.querySelector('#pd-week-state');
  const open=model.canRequest(state.agent,week);
  status.textContent=!open&&state.agent.approval.pauseActive?'Запись закрыта':current.approved?'Утверждён':'Не утверждён';
  status.className='pd-badge '+(open&&current.approved?'pd-badge--ok':'pd-badge--pending');
  const weekBox=document.querySelector('#pd-week');weekBox.replaceChildren();
  weekday.forEach((day,index)=>{
   const date=model.addDays(week,index), hours=model.effective(state.agent,date);
   const available=hours.enabled&&model.canRequest(state.agent,date);
   const box=node('div','pd-day'+(available?'':' pd-day--off'));
   box.append(node('strong','',day+' '+date.slice(-2)));
   const hoursText=!current.approved?'—':hours.enabled?hours.from+'–'+hours.to:'Выходной';
   if(!current.approved)box.setAttribute('aria-label',day+' '+date.slice(-2)+': график не утверждён');
   box.append(node('span','',hoursText));
   weekBox.append(box);
  });
  const breakInfo=document.querySelector('#pd-break');
  breakInfo.hidden=!current.approved?.breakEnabled;
  breakInfo.textContent=breakInfo.hidden?'':'Перерыв: '+current.approved.breakFrom+'–'+current.approved.breakTo;
  const notice=document.querySelector('#pd-next-week');notice.replaceChildren();
  const icon=node('i','fa fa-calendar-o');icon.setAttribute('aria-hidden','true');notice.append(icon);
  const nextText=current.pending?'Изменения этой недели отправлены на согласование.':upcoming.pending?'Следующая неделя отправлена на согласование.':upcoming.returned?'График на следующую неделю возвращён на доработку.':upcoming.approved&&model.canRequest(state.agent,next)?'График на следующую неделю утверждён.':upcoming.approved&&state.agent.approval.pauseActive?'После остановки график на следующую неделю нужно согласовать заново.':'График на следующую неделю не утверждён.';
  notice.append(document.createTextNode(' '+nextText));
  const list=document.querySelector('#pd-bookings');list.replaceChildren();
  const now=model.now().slice(0,16);
  const entries=state.entries.filter(b=>model.active(b)&&!b.unassigned&&(b.date+'T'+b.time)>=now).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,3);
  if(!entries.length){list.append(node('p','pd-muted','Ближайших записей нет'));return;}
  entries.forEach(b=>{
   const row=node('div','pd-booking'), when=node('div','pd-booking-time');
   when.append(document.createTextNode(fmt.format(parsed(b.date))));
   const end=model.time(model.minutes(b.time)+model.bookingLength(b));
   when.append(node('small','',b.time+'–'+end));
   const details=node('div','pd-booking-detail');
   details.append(node('strong','',b.client));
   const expert=state.profiles.find(p=>p.id===b.profile);
   details.append(node('span','',expert?expert.name:'Анкета эксперта'));
   const kind=model.visibleStatus(b), label=model.labels[kind]||kind;
   row.append(when,details,node('span','pd-badge '+(kind==='confirmed'?'pd-badge--ok':kind==='pending'?'pd-badge--request':'pd-badge--pending'),label));
   list.append(row);
  });
 }
 updateMetrics();
 if(model){render(model.read());model.watch(render);}else{
  const state=document.querySelector('#pd-week-state');state.textContent='Нет данных';state.className='pd-badge pd-badge--pending';
  document.querySelector('#pd-week').textContent='Не удалось загрузить график.';
  document.querySelector('#pd-bookings').textContent='Не удалось загрузить записи.';
 }
})();
