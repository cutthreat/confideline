(() => {
 'use strict';

 const scenario = new URLSearchParams(location.search).get('scenario') || 'default';
 const key = 'confideline-shared-agent-schedule-20261112-v2' + (['active-session','client-conflict'].includes(scenario) ? '-' + scenario + '-20261113b' : '');
 const partnerSample = scenario.startsWith('partner195');
 const noProfiles = scenario.startsWith('partner-moderator');
 const otherView = new URLSearchParams(location.search).get('demoAgent') === 'kristy';
 const primaryExpertId = partnerSample ? 'auroravale' : 'anna';
 const expertId = otherView ? 'solara' : primaryExpertId;
 const partnerName = otherView ? 'Kristy' : 'saffettr';
 const slotLength = 30;
 const weekdays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
 const labels = {pending:'Нужен ответ', processing:'Ожидает оформления', confirmed:'Подтверждена', declined:'Отклонена', cancelled:'Отменена', expired:'Истекла', review:'Возможная неявка', completed:'Завершена'};
 const clock = new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Minsk', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23'});
 const displayDateTime = new Intl.DateTimeFormat('ru-RU', {timeZone:'Europe/Minsk', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit', second:'2-digit'});
 const displayDeadline = new Intl.DateTimeFormat('ru-RU', {timeZone:'Europe/Minsk', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit'});
 const now = (at = Date.now()) => clock.format(new Date(at)).replace(' ', 'T');
 const today = () => now().slice(0, 10);
 const parse = date => new Date(date + 'T12:00:00');
 const addDays = (date, days) => {
  const d = parse(date);
  d.setDate(d.getDate() + days);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
 };
 const minutes = value => Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));
 const time = value => String(Math.floor(value / 60)).padStart(2, '0') + ':' + String(value % 60).padStart(2, '0');
 const atTime = (date, value) => Date.parse(date + 'T' + value + ':00+03:00');
 const clone = value => JSON.parse(JSON.stringify(value));
 const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
 const active = booking => ['pending', 'processing', 'confirmed'].includes(booking.state);
 const visibleStatus = booking => active(booking) && booking.proposal ? (booking.proposal.acceptedAt ? 'accepted-conflict' : 'proposal') : booking.state;
 const holdDescription = booking => ['pending','processing'].includes(booking.state) ? booking.deadline : '';
 const proposalDeadline = booking => booking.proposal?.holdsSlot
  ? (booking.proposal.acceptedAt ? 'Разрешить конфликт до ' : 'Ответ клиента до ') + displayDeadline.format(booking.proposal.expiresAt)
  : '';
 const proposalDescription = booking => booking.proposal?.holdsSlot
  ? (booking.proposal.acceptedAt
     ? 'Клиент согласовал перенос. Новое время применится, если конфликт устранить до '
     : (atTime(booking.date,booking.time) > Date.now() ? 'Оба времени удерживаются до ответа клиента или до ' : 'Новое время удерживается до ответа клиента или до ')) + displayDeadline.format(booking.proposal.expiresAt) + '.'
  : 'Ожидается ответ клиента.';
 const needsOutcomeCheck = booking => booking.state === 'confirmed' && atTime(booking.date,booking.time) <= Date.now();
 labels.proposal = 'Ожидает ответа клиента';
 labels['accepted-conflict'] = 'Перенос согласован · есть конфликт';
 const overlaps = (a,b,c,d) => a < d && c < b;
 const nextWork = date => {
  while ([0,6].includes(parse(date).getDay())) date = addDays(date,1);
  return date;
 };
 const defaultInterests = () => partnerSample ? [
  {client:'Мария Л.',profile:'auroravale',profileName:'Aurora Veil',at:'10:15'},
  {client:'Алексей В.',profile:'aurora',profileName:'Aurora Wilson',at:'11:10'}
 ] : noProfiles ? [] : [
  {client:'Мария Л.',profile:'anna',profileName:'Анна Веста',at:'10:15'},
  {client:'Алексей В.',profile:'talia',profileName:'Talia',at:'11:10'}
 ];

 function effective(schedule, date, fallback) {
  const exception = schedule.exceptions.find(item => item.date === date);
  if (exception) return {...exception, enabled:exception.kind === 'hours'};
  if (fallback) return effective(fallback, date);
  return schedule.days[(parse(date).getDay() + 6) % 7];
 }
 function inHours(rule, start, length = slotLength) {
  return rule.enabled && start >= minutes(rule.from) && start + length <= minutes(rule.to);
 }
 function inBreak(schedule, start, length = slotLength) {
  return schedule.breakEnabled && overlaps(start, start + length, minutes(schedule.breakFrom), minutes(schedule.breakTo));
 }
 function availability(agent, profile, date, start) {
  if (!inHours(effective(agent,date),start)) return 'Вне графика агента';
  if (inBreak(agent,start)) return 'Перерыв агента';
  // One schedule belongs to the agent; profiles do not have separate hours.
  return '';
 }
 function deadline(agent, requestedAt, meetingAt) {
  const limit = meetingAt - 60 * 60 * 1000;
  let remaining = 120;
  for (let at = Math.ceil(requestedAt / 60000) * 60000; at < limit; at += 60000) {
   const stamp = now(at);
   const date = stamp.slice(0,10);
   const minute = minutes(stamp.slice(11,16));
   if (inHours(effective(agent,date),minute,1) && !inBreak(agent,minute,1) && --remaining === 0) return at + 60000;
  }
  return null;
 }
 function seed() {
  const agent = {
   days:weekdays.map((name,i) => ({name, enabled:i < 5, from:'09:00', to:'18:00'})),
   exceptions:[], breakEnabled:false, breakFrom:'13:00', breakTo:'14:00'
  };
  const initialProfiles = partnerSample ? [
   {id:'auroravale',name:'Aurora Veil',username:'AuroraVale',assignment:25,userId:30,city:'Ванкувер - Канада',created:'28 окт. 2026 г.',photo:'https://hugs-project.s3.amazonaws.com/content/photos/1/thumb_0drzKfN_MhDYZEDcY40Wbc3CniK2b5zN.webp',mode:'inherit'},
   {id:'aurora',name:'Aurora Wilson',username:'Aurora',assignment:26,userId:28,city:'Торонто - Канада',created:'28 окт. 2026 г.',photo:'https://hugs-project.s3.amazonaws.com/content/photos/1/thumb_nvDaYgCR7wRspQ9SWvM2s36_IfG_yGW8.webp',mode:'inherit'},
   {id:'zorya',name:'Zorya Dawnlight',username:'ZoryaDawnlight',assignment:27,userId:53,city:'Нью-Йорк - Соединенные Штаты',created:'28 окт. 2026 г.',photo:'https://hugs-project.s3.amazonaws.com/content/photos/1/thumb_Mz7cAq_7xjRdVF5V509Yg8FbC_TqoFCf.webp',mode:'inherit'},
   {id:'asha',name:'Asha Iyengar',username:'Asha',assignment:28,userId:41,city:'Бангалор - Индия',created:'9 нояб. 2026 г.',photo:'https://hugs-project.s3.amazonaws.com/content/photos/1/thumb_f6kp27GXt_Jaq5FM-QwvvJSXGs51xU9E.webp',mode:'inherit'}
  ] : noProfiles ? [] : [
   {id:primaryExpertId, name:'Анна Веста', mode:'inherit'},
   {id:'talia', name:'Talia', mode:'inherit'},
   {id:'stella', name:'Stella', mode:'inherit'},
   {id:'alisa', name:'Алиса Берг', mode:'inherit', price:12},
   {id:'vera', name:'Вера Ланская', mode:'inherit', price:30}
  ];
  const profiles = initialProfiles.map(profile => ({...profile}));
  const firstDate = nextWork(addDays(today(), 5));
  const nextDate = nextWork(addDays(firstDate, 1));
  const received = Date.now();
  const due = deadline(agent, received, atTime(firstDate,'10:00'));
  const holdUntil = received + 25 * 60 * 1000;
  const entries = [
   {id:1,client:'Мария Л.',profile:primaryExpertId,date:firstDate,time:'10:00',state:'pending',deadlineAt:due,deadline:'Ответить до '+displayDeadline.format(due),history:['Заявка получена. Окно удержано.']},
   {id:2,client:'Алексей В.',profile:'talia',date:firstDate,time:'11:00',state:'confirmed',deadline:'Встреча подтверждена',history:['Заявка подтверждена.']},
   {id:3,client:'Ирина С.',profile:'stella',date:firstDate,time:'15:00',state:'processing',holdUntil,deadline:'Оформление до '+displayDateTime.format(holdUntil),history:['Агент подтвердил заявку.']},
   {id:4,client:'Павел К.',profile:primaryExpertId,date:nextDate,time:'14:00',state:'confirmed',deadline:'Встреча подтверждена',history:['Заявка подтверждена.']},
   {id:5,client:'Олег К.',profile:primaryExpertId,date:addDays(today(),-1),time:'10:00',state:'review',deadline:'Ожидает проверки',history:['Возможная неявка передана на проверку.']},
   {id:6,client:'Нина Т.',profile:primaryExpertId,date:addDays(today(),-2),time:'14:00',state:'expired',deadline:'Срок оформления истёк',history:['Срок оформления истёк. Окно освобождено.']},
   {id:7,client:'Павел Р.',profile:primaryExpertId,date:addDays(today(),-3),time:'11:00',state:'completed',deadline:'Консультация завершена',history:['Консультация завершена.']},
   {id:8,client:'Кирилл Т.',profile:primaryExpertId,date:addDays(today(),-1),time:'12:00',state:'confirmed',deadline:'Ожидание превысило 10 минут',noShowEligible:true,history:['Встреча подтверждена. Агент ожидает клиента.']}
  ];
  if (partnerSample) entries.forEach(b=>{if(b.profile==='talia')b.profile='aurora';if(b.profile==='stella')b.profile='zorya';});
  entries.forEach(booking=>{const profile=profiles.find(item=>item.id===booking.profile);if(profile?.assignment)booking.assignment=profile.assignment;});
  if (noProfiles) entries.length=0;
  const paymentMode = scenario === 'after-start' ? 'after-start' : 'after-confirmation';
  if (paymentMode === 'after-start') {
   const existing = entries.find(item => item.id === 3);
   existing.state = 'confirmed';
   existing.deadline = 'Встреча подтверждена';
   delete existing.holdUntil;
  }
  entries.forEach(booking=>{
   booking.paymentMode=paymentMode;
   booking.acceptedPrice=profiles.find(profile=>profile.id===booking.profile)?.price??10;
   if(booking.state==='confirmed')booking.advancePaid=paymentMode==='after-confirmation';
  });
  const interests = defaultInterests().map(item=>({...item,date:today()}));
  const otherProfile={id:'solara',name:'Solara Ortiz',username:'SolaraOrtiz',userId:103,assignment:16};
  const otherAgent={agent:clone(agent),profiles:[otherProfile],entries:[{id:101,client:'Анна Д.',profile:'solara',assignment:16,date:firstDate,time:'11:00',state:'confirmed',advancePaid:true,paymentMode:'after-confirmation',acceptedPrice:10,deadline:'Встреча подтверждена',history:['Заявка подтверждена.']}],interests:[],firstDate,paymentMode:'after-confirmation'};
  let liveSession = null;
  if (scenario === 'active-session') {
   liveSession = {profile:'alisa', status:'active', active:true, provider:'partner195'};
   entries.push({id:10,client:'Мария Л.',profile:'alisa',date:nextDate,time:'12:00',state:'confirmed',deadline:'Встреча подтверждена',history:['Встреча подтверждена.'],paymentMode:'after-confirmation',acceptedPrice:12,advancePaid:true});
  }
  if (scenario === 'client-conflict') entries.push({id:9,client:'Анна С.',profile:'alisa',date:today(),time:now().slice(11,16),state:'confirmed',deadline:'Встреча подтверждена',history:['Встреча подтверждена.'],paymentMode:'after-confirmation',acceptedPrice:12,advancePaid:true,advanceAmount:36,previewClient:true,delayed:true});
  return {agent, profiles, entries, interests, firstDate, paymentMode, otherAgent, liveSession};
 }

 let fallback;
 function readRoot() {
  let state;try { state = JSON.parse(localStorage.getItem(key)); } catch {}
  return state || fallback;
 }
 function writeRoot(state) {
  fallback=state;try { localStorage.setItem(key,JSON.stringify(state)); } catch {}
 }
 function write(state) {
  settleAcceptedProposals(state,Date.now());
  if (!otherView) return writeRoot(state);
  const root=readRoot()||seed();root.otherAgent=state;writeRoot(root);
 }
 const originalHoldUntil = booking => booking.state === 'pending' ? booking.deadlineAt : booking.state === 'processing' ? booking.holdUntil : null;
 function expire(booking, at) {
  const due=originalHoldUntil(booking);
  if(due&&at>=due){
   booking.deadline=booking.state==='pending'?'Срок ответа истёк':'Срок оформления истёк';
   booking.state='expired';
   booking.history.push(booking.deadline+(booking.proposal?.holdsSlot?'. Оба окна освобождены.':'. Окно освобождено.'));
   booking.proposal=null;
   return true;
  }
  if(booking.proposal&&!booking.proposal.holdsSlot){
   booking.proposal=null;
   booking.history.push('Прежнее предложение без удержания закрыто. Исходное время не изменилось.');
   return true;
  }
  if(booking.proposal?.expiresAt&&at>=booking.proposal.expiresAt){
   booking.proposal=null;
   booking.history.push('Срок предложения переноса истёк. Исходное время не изменилось.');
   return true;
  }
  return false;
 }
 function read() {
  let root=readRoot();
  if (!root) {root=seed();writeRoot(root);}
  if (!root.otherAgent) {root.otherAgent=seed().otherAgent;writeRoot(root);}
  const state=otherView?root.otherAgent:root;
  const at = Date.now();
  let changed = false;
  for (const booking of state.entries) if (expire(booking,at)) changed = true;
  if (changed) write(state);
  return state;
 }
 function watch(listener) {
  let signature = JSON.stringify(read());
  const refresh = () => {
   const state = read(), next = JSON.stringify(state);
   if (next === signature) return;
   signature = next;
   listener(state);
  };
  window.addEventListener('storage', event => { if (event.key === key) refresh(); });
  window.addEventListener('pageshow', refresh);
  window.addEventListener('focus', refresh);
  window.setInterval(refresh, 1000);
 }
 function occupied(entries,date,start,ignoreId) {
  const matches=(day,at)=>day===date&&overlaps(start,start+slotLength,minutes(at),minutes(at)+slotLength);
  return entries.filter(booking => booking.id !== ignoreId && active(booking) && !booking.unassigned &&
   (matches(booking.date,booking.time) || (booking.proposal?.holdsSlot && matches(booking.proposal.date,booking.proposal.time))));
 }
 function alternatives(state,booking,date) {
  if (!booking || !date || !active(booking) || date < today()) return [];
  const rule = effective(state.agent,date);
  const profile = state.profiles.find(item => item.id === booking.profile);
  if (!profile) return [];
  const slots = [];
  for (let start = Math.ceil(minutes(rule.from)/slotLength)*slotLength; rule.enabled && start + slotLength <= minutes(rule.to); start += slotLength) {
   const value = time(start);
   if (atTime(date,value) <= Date.now() || (date === booking.date && value === booking.time)) continue;
   if (availability(state.agent,profile,date,start) || occupied(state.entries,date,start,booking.id).length) continue;
   slots.push(value);
  }
  return slots;
 }
 function dayRows(state, date, profileId) {
  const rule = effective(state.agent,date);
  const profile = state.profiles.find(item => item.id === profileId);
  const rows = [];
  for (let start = Math.ceil(minutes(rule.from)/slotLength)*slotLength; rule.enabled && start + slotLength <= minutes(rule.to); start += slotLength) {
   const bookings = occupied(state.entries,date,start);
   const label = bookings.length ? '' : availability(state.agent,profile,date,start) || 'Нет записей';
   const previous = rows.at(-1);
   if (!bookings.length && previous?.label === label) previous.end = time(start + slotLength);
   else if (!bookings.length) rows.push({time:time(start),end:time(start + slotLength),label});
   else for (const booking of bookings) {
    const original=booking.date===date&&overlaps(start,start+slotLength,minutes(booking.time),minutes(booking.time)+slotLength);
    rows.push({time:time(start),end:time(start + slotLength),booking,proposed:!original});
   }
  }
  return rows;
 }
 function calendarEvents(entries,date) {
  return entries.flatMap(booking=>{
   const result=[];
   if (booking.date===date) result.push({booking,date,time:booking.time,proposed:false});
   if (active(booking)&&booking.proposal?.holdsSlot&&booking.proposal.date===date)
    result.push({booking,date,time:booking.proposal.time,proposed:true});
   return result;
  }).sort((a,b)=>a.time.localeCompare(b.time));
 }
 function calendarBookings(entries) {
  return entries.flatMap(booking=>active(booking)&&booking.proposal?.holdsSlot
   ? [booking,{...booking,date:booking.proposal.date,time:booking.proposal.time,proposedSlot:true}]
   : [booking]);
 }
 function scheduleConflicts(entries,agent,profile,profileId) {
  return entries.filter(booking=>active(booking)&&(!profileId||booking.profile===profileId)).flatMap(booking=>{
   const conflictsAt=(date,time)=>atTime(date,time)>Date.now()&&Boolean(availability(agent,profile,date,minutes(time)));
   const original=conflictsAt(booking.date,booking.time);
   const proposed=Boolean(booking.proposal?.holdsSlot&&conflictsAt(booking.proposal.date,booking.proposal.time));
   return original||proposed?[{...booking,scheduleConflictOriginal:original,scheduleConflictProposal:proposed}]:[];
  });
 }
 function actions(booking) {
  if (!active(booking)) return [];
  const meetingAt = atTime(booking.date,booking.time);
  if (meetingAt <= Date.now()) {
   if (booking.state !== 'confirmed') return [];
   const result = booking.noShowEligible && !booking.delayed && Date.now() >= meetingAt + 10 * 60 * 1000 ? ['no-show'] : [];
   if (!booking.proposal?.acceptedAt) result.push(booking.proposal ? 'withdraw' : 'reschedule');
   return result;
  }
  const result = booking.state === 'pending' ? ['confirm','decline'] : ['cancel'];
  if (booking.proposal && booking.state === 'pending') result.shift();
  if (booking.proposal?.acceptedAt) return result;
  return [...result, booking.proposal ? 'withdraw' : 'reschedule'];
 }
 function confirmRequest(booking,at,paymentMode){
  booking.paymentMode??=paymentMode;
  booking.state=booking.paymentMode==='after-confirmation'?'processing':'confirmed';
  booking.holdUntil=booking.state==='processing'?Math.min(at+30*60*1000,atTime(booking.date,booking.time)):null;
  booking.deadline=booking.holdUntil?'Оформление до '+displayDateTime.format(booking.holdUntil):'Встреча подтверждена';
 }
 function perform(id, action, values = {}) {
  const state = read();
  const booking = state.entries.find(item => item.id === id);
  if (!booking || !actions(booking).includes(action)) return {error:'Состояние записи изменилось. Проверьте доступные действия.'};
  const {date,time:proposedTime,note = ''} = values;
  if (['decline','cancel'].includes(action) && !note.trim()) return {error:'Укажите причину.'};
  if (action === 'confirm') {
   const profile = state.profiles.find(item => item.id === booking.profile);
   if (!profile) return {error:'Анкета больше не назначена. Проверьте запись и назначение.'};
   if (availability(state.agent,profile,booking.date,minutes(booking.time)) || occupied(state.entries,booking.date,minutes(booking.time),id).length) return {error:'Интервал больше недоступен.'};
  }
  if (action === 'reschedule' && !alternatives(state,booking,date).includes(proposedTime)) return {error:'Это время больше недоступно. Выберите другое.'};
  const at = Date.now();
  if (expire(booking,at)) {
   write(state);
   return {error:booking.deadline+'. Окно освобождено.'};
  }
  if (action === 'confirm') {
   confirmRequest(booking,at,state.paymentMode);
   booking.history.push('Агент подтвердил заявку.');
  } else if (action === 'decline' || action === 'cancel') {
   booking.state = action === 'decline' ? 'declined' : 'cancelled';
   booking.deadline = '—';
   booking.proposal = null;
   booking.history.push((action === 'decline' ? 'Заявка отклонена. ' : 'Запись отменена. ') + note.trim());
  } else if (action === 'reschedule') {
   const originalDeadline=originalHoldUntil(booking);
   if(booking.state!=='confirmed'&&!Number.isFinite(originalDeadline))return {error:'Срок исходного удержания неизвестен. Проверьте заявку.'};
   const originalStart=atTime(booking.date,booking.time);
   const expiresAt=Math.min(at+24*60*60*1000,originalDeadline??Infinity,originalStart>at?originalStart:Infinity,atTime(date,proposedTime));
   if(expiresAt<=at)return {error:'Срок предложения уже истёк. Выберите другое окно.'};
   state.nextProposalId=(state.nextProposalId||0)+1;
   booking.proposal={id:(otherView?'kristy':'partner195')+'-proposal-'+state.nextProposalId,date,time:proposedTime,holdsSlot:true,expiresAt};
   booking.history.push('Предложено время: ' + date + ' ' + proposedTime + (note ? '. ' + note : ''));
  } else if (action === 'withdraw') {
   booking.proposal = null;
   booking.history.push('Предложение переноса отозвано.');
  } else if (action === 'no-show') {
   booking.state = 'review';
   booking.proposal = null;
   booking.deadline = 'Ожидает проверки';
   booking.history.push('Возможная неявка передана на проверку.');
  }
  write(state);
  return {state};
 }
 function applyAcceptedReschedule(booking,at,paymentMode) {
  booking.date=booking.proposal.date;
  booking.time=booking.proposal.time;
  if(booking.state==='pending')confirmRequest(booking,at,paymentMode);
  booking.history.push(booking.proposal.acceptedAt
   ? 'Конфликт устранён. Согласованный перенос применён.'
   : 'Клиент согласовал перенос. Время записи изменено.');
  booking.proposal=null;
 }
 function settleAcceptedProposals(state,at) {
  for(const booking of state.entries){
   const proposal=booking.proposal;
   if(!active(booking)||!proposal?.acceptedAt||at>=proposal.expiresAt)continue;
   const due=originalHoldUntil(booking);
   if(due&&at>=due)continue;
   const profile=state.profiles.find(item=>item.id===booking.profile);
   const start=minutes(proposal.time);
   if(!profile||occupied(state.entries,proposal.date,start,booking.id).length)continue;
   applyAcceptedReschedule(booking,at,state.paymentMode);
  }
 }
 function answerReschedule(id,accepted,proposalId) {
  const state=read(),booking=state.entries.find(item=>item.id===id);
  if (!booking || !active(booking) || !booking.proposal?.holdsSlot) return {error:'Предложение переноса уже недоступно.'};
  const at=Date.now();
  if(expire(booking,at)){write(state);return {error:'Срок предложения переноса истёк.'};}
  if (!proposalId || booking.proposal.id!==proposalId) return {error:'Предложение изменилось. Откройте актуальное время и подтвердите его отдельно.'};
  const proposal=booking.proposal;
  if(proposal.acceptedAt)return accepted ? {state,deferred:true} : {error:'Клиент уже согласовал перенос.'};
  if (accepted) {
   const profile=state.profiles.find(item=>item.id===booking.profile);
   const start=minutes(proposal.time);
   if(!profile)return {error:'Предложенное время сейчас недоступно. Передайте конфликт ответственному.'};
   const occupiedByAnother=occupied(state.entries,proposal.date,start,booking.id).length>0;
   if(occupiedByAnother&&proposal.transferConflict){
    proposal.acceptedAt=at;
    booking.history.push('Клиент согласовал перенос. Новое время пока занято другой записью агента.');
    write(state);return {state,deferred:true};
   }
   if(occupiedByAnother)
    return {error:'Предложенное время сейчас недоступно. Передайте конфликт ответственному.'};
   applyAcceptedReschedule(booking,at,state.paymentMode);
  } else {
   booking.history.push('Клиент отклонил перенос. Исходная запись сохранена.');
   booking.proposal=null;
  }
  write(state);return {state};
 }
 function saveSchedule(candidate, baseline, profileId) {
  if (profileId) return {error:'Расписание задаётся только в графике агента.'};
  const state = read();
  const current = state.agent;
  const schedulePart = value => Object.fromEntries(['days','exceptions','breakEnabled','breakFrom','breakTo'].map(key=>[key,value[key]]));
  if (!same(schedulePart(current), schedulePart(baseline))) return {error:'График изменился в другой карточке. Загрузите сохранённую версию перед повторным редактированием.'};
  const conflicts = scheduleConflicts(state.entries,candidate,null,null);
  if (!same(schedulePart(current), schedulePart(candidate))) state.agent = clone(candidate);
  write(state);
  return conflicts.length ? {state, conflicts} : {state};
 }
 function addProfile(profile) {
  const state=read();if(state.profiles.some(p=>p.id===profile.id||(profile.userId!=null&&p.userId===profile.userId)))return {error:'Анкета уже назначена.'};
  const id=Math.max(0,...state.profiles.map(p=>p.assignment||0),...(state.formerProfiles||[]).map(p=>p.assignment||0))+1;
  const createdIso=today(),created=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short',year:'numeric'}).format(parse(createdIso));
  const previous=(state.formerProfiles||[]).slice().reverse().find(p=>p.id===profile.id);
  const restoredPrice=previous?.price===undefined?{}:{price:previous.price};
  state.profiles.push({...profile,...restoredPrice,assignment:id,previewOnly:true,created,createdIso});
  state.entries.filter(b=>b.profile===profile.id&&b.unassigned&&active(b)).forEach(b=>{b.unassigned=false;b.assignment=id;b.history.push('Анкета вновь назначена агенту.');});
  write(state);return {state};
 }
 function removeProfile(id) {
  const state=read();
  const profile=state.profiles.find(p=>p.id===id);
  if(!profile)return {error:'Анкета уже не назначена. Обновите список.'};
  if(hasLiveSession(state,id))return {error:'По этой анкете идёт консультация. Снимите назначение после её завершения.'};
  if(state.entries.some(b=>b.profile===id&&active(b)))return {error:'У анкеты есть активные заявки или записи. Сначала рассмотрите их.'};
  state.formerProfiles ||= [];
  const former=state.formerProfiles.filter(item=>item.id===id);
  const attributed=new Set(former.flatMap(item=>item.bookingIds||[]));
  const ambiguous=former.some(item=>!Array.isArray(item.bookingIds));
  const bookingIds=state.entries.filter(item=>item.profile===id&&((item.assignment!=null&&item.assignment===profile.assignment)||
   (item.assignment==null&&!ambiguous&&!attributed.has(item.id)))).map(item=>item.id);
  state.formerProfiles.push({...clone(profile),bookingIds});
  state.profiles=state.profiles.filter(p=>p.id!==id);write(state);return {state};
 }
 function inspectTransfer(id,targetId) {
  const root=readRoot(),state=otherView?root?.otherAgent:root,target=otherView?root:root?.otherAgent;
  const profile=state?.profiles.find(p=>p.id===id),validTarget=otherView?targetId==='partner195':targetId==='kristy';
  if(!validTarget||!profile||!target)return {error:'Выберите доступного агента и анкету.'};
  if(target.profiles.some(p=>p.id===id))return {error:'Анкета уже назначена выбранному агенту.'};
  const activeEntries=state.entries.filter(b=>b.profile===id&&active(b));
  target.entries.forEach(b=>expire(b,Date.now()));
  const conflicts=activeEntries.flatMap(b=>{
   const times=[{date:b.date,time:b.time}];if(b.proposal?.holdsSlot)times.push({date:b.proposal.date,time:b.proposal.time,proposed:true});
   return times.filter(t=>occupied(target.entries,t.date,minutes(t.time)).length).map(t=>({id:b.id,client:b.client,...t}));
  });
  const scheduleIssues=scheduleConflicts(activeEntries,target.agent,profile,id);
  const live=hasLiveSession(state,id);
  return {activeEntries,conflicts,scheduleIssues,live};
 }
 function transferProfile(id,targetId) {
  const check=inspectTransfer(id,targetId);if(check.error)return check;
  if(check.live)return {error:'Передать анкету можно после завершения текущей консультации.'};
  const root=readRoot(),state=otherView?root.otherAgent:root,target=otherView?root:root.otherAgent,profile=state.profiles.find(p=>p.id===id);
  if(!profile||target.profiles.some(p=>p.id===id))return {error:'Назначение изменилось. Обновите список.'};
  const newAssignment=Math.max(0,...target.profiles.map(p=>p.assignment||0))+1;
  const moved=state.entries.filter(b=>b.profile===id&&active(b));
  const historical=state.entries.filter(b=>b.profile===id&&!active(b)).map(b=>b.id);
  state.formerProfiles ||= [];
  state.formerProfiles.push({...clone(profile),bookingIds:historical});
  state.profiles=state.profiles.filter(p=>p.id!==id);
  state.entries=state.entries.filter(b=>!(b.profile===id&&active(b)));
  target.profiles.push({...clone(profile),assignment:newAssignment});
  for(const booking of moved){
   const received={...clone(booking),assignment:newAssignment,history:[...booking.history,'Анкета и запись переданы другому агенту.']};
   if(received.proposal&&check.conflicts.some(conflict=>conflict.id===booking.id&&conflict.proposed))received.proposal.transferConflict=true;
   target.entries.push(received);
  }
  const at=Date.now();
  settleAcceptedProposals(state,at);
  settleAcceptedProposals(target,at);
  writeRoot(root);return {state,conflicts:check.conflicts,scheduleIssues:check.scheduleIssues};
 }
 function hasLiveSession(state,id) {
  const session=state.liveSession;
  return Boolean(session && session.profile===id && (session.active || ['active','trial','paused','reconnecting'].includes(session.status)));
 }
 function emergencyRemove(id,reason) {
  const state=read(),profile=state.profiles.find(p=>p.id===id);
  if(!profile || !hasLiveSession(state,id))return {error:'Состояние консультации изменилось. Проверьте анкету.'};
  if(!reason.trim())return {error:'Укажите причину срочного отзыва доступа.'};
  const session=state.liveSession;
  session.active=false;session.status='stopped';session.stoppedAt=Date.now();session.reason=reason.trim();
  state.formerProfiles ||= [];
  state.formerProfiles.push({...clone(profile),bookingIds:state.entries.filter(b=>b.profile===id).map(b=>b.id)});
  state.profiles=state.profiles.filter(p=>p.id!==id);
  state.entries.filter(b=>b.profile===id&&active(b)).forEach(b=>{b.unassigned=true;b.history.push('Назначение снято. Запись сохранена для рассмотрения.');});
  state.audit ||= [];state.audit.push({event:'emergency-unassignment',profile:id,provider:session.provider,at:session.stoppedAt,reason:session.reason,financialStatus:'review'});
  write(state);return {state};
 }
 function resetClientConflict() { if(scenario==='client-conflict') writeRoot(seed()); }
 function clientDelayAction(id,action,values={}) {
  const state=read(),booking=state.entries.find(b=>b.id===id&&b.previewClient&&b.delayed&&b.state==='confirmed');
  if(!booking)return {error:'Состояние встречи изменилось. Откройте запись ещё раз.'};
  if(action==='wait') {booking.clientChoice='wait';booking.clientSuggestion=null;booking.history.push('Клиент выбрал ожидание.');}
  else if(action==='reschedule') {
   const {date,time:next}=values,profile=state.profiles.find(p=>p.id===booking.profile);
   if(!profile||!date||!next||atTime(date,next)<=Date.now()||availability(state.agent,null,date,minutes(next))||occupied(state.entries,date,minutes(next),booking.id).length)return {error:'Это время уже недоступно. Выберите другое.'};
   booking.clientChoice='reschedule';booking.clientSuggestion={date,time:next};booking.history.push('Клиент предложил другое время: '+date+' '+next+'.');
  } else if(action==='cancel') {
   booking.state='cancelled';booking.clientChoice='cancel';booking.delayed=false;booking.clientSuggestion=null;booking.proposal=null;
   if(booking.advancePaid && Number.isFinite(booking.advanceAmount)){
    booking.refundStatus='complete';booking.refundAmount=booking.advanceAmount;
    state.previewBalance=(state.previewBalance||0)+booking.refundAmount;
   }else booking.refundStatus=booking.advancePaid?'processing':'none';
   booking.history.push('Клиент отменил задержанную встречу.');
  } else return {error:'Выберите действие.'};
  write(state);return {state,booking};
 }
 function addCity(id,city) {const state=read(),p=state.profiles.find(item=>item.id===id);if(!p)return {error:'Анкета не найдена.'};p.cities ||= p.city?[p.city]:[];if(p.cities.includes(city))return {error:'Город уже добавлен.'};p.cities.push(city);p.city ||= city;write(state);return {state};}
 function savePrice(profileId, value) {
  const state=read(), profile=state.profiles.find(item=>item.id===profileId)||(state.formerProfiles||[]).slice().reverse().find(item=>item.id===profileId), price=String(value).trim()===''?null:Number(value);
  if (!profile) return {error:'Анкета не найдена.'};
  if (price!==null&&(!Number.isFinite(price)||price<0)) return {error:'Укажите неотрицательную цену или оставьте поле пустым.'};
  profile.price=price;write(state);return {state};
 }
 function requestBooking(profileId, date, value) {
  const state=read(), profile=state.profiles.find(item=>item.id===profileId);
  if(!profile) return {error:'Эксперт не назначен агенту. Выберите другую анкету.'};
  const start=minutes(value), meeting=atTime(date,value), due=deadline(state.agent,Date.now(),meeting);
  if(!Number.isFinite(meeting)||meeting<=Date.now()||!due||availability(state.agent,null,date,start)||occupied(state.entries,date,start).length)
   return {error:'Это время уже недоступно. Выберите другое.'};
  const booking={id:Math.max(0,...state.entries.map(item=>Number(item.id)||0))+1, client:'Анна С.',
   profile:profileId,date,time:value,state:'pending',deadlineAt:due,deadline:'Ответить до '+displayDeadline.format(due),
   history:['Заявка получена. Окно удержано.'],paymentMode:state.paymentMode,acceptedPrice:profile.price??10,previewClient:true};
  state.entries.push(booking); write(state); return {state,booking};
 }
 function cancelOwnRequest(id) {
  const state=read(), booking=state.entries.find(item=>item.id===id&&item.previewClient&&item.state==='pending');
  if(!booking)return {error:'Заявка уже изменилась. Обновите страницу.'};
  booking.state='cancelled';booking.deadline='Заявка отменена';booking.history.push('Клиент отменил заявку. Окно освобождено.');
  write(state);return {state};
 }
 function link(page, hash) {
  const scenario = new URLSearchParams(location.search).get('scenario');
  const query=new URLSearchParams();if(scenario)query.set('scenario',scenario);if(otherView)query.set('demoAgent','kristy');
  return page + (query.toString()?'?'+query.toString():'') + '#' + hash;
 }
 window.BookingPreview = {expertId,partnerName,otherView,slotLength,labels,now,today,addDays,minutes,time,clone,same,active,visibleStatus,holdDescription,proposalDeadline,proposalDescription,needsOutcomeCheck,effective,availability,occupied,alternatives,dayRows,calendarEvents,calendarBookings,scheduleConflicts,actions,read,watch,perform,answerReschedule,saveSchedule,savePrice,addProfile,removeProfile,hasLiveSession,emergencyRemove,clientDelayAction,resetClientConflict,inspectTransfer,transferProfile,addCity,defaultInterests,deadline,requestBooking,cancelOwnRequest,link};
})();
