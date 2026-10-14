(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ConfidelineTicketPolicy=api;})(typeof window==='undefined'?this:window,function(){
  'use strict';
  const HOUR=3600000,priorities=['low','normal','high','urgent'];
  const iso=n=>new Date(n).toISOString();
  const validDate=v=>Number.isFinite(Date.parse(v));
  function settings(value={}) {
    const target=Number(value.internalQuestionTargetHours??24),reminder=Number(value.internalQuestionReminderHours??12);
    if(!Number.isInteger(target)||target<2||target>168||!Number.isInteger(reminder)||reminder<1||reminder>=target)throw Error('Напоминание должно быть от 1 часа и раньше срока ответа; срок — от 2 до 168 часов.');
    return {internalQuestionTargetHours:target,internalQuestionReminderHours:reminder};
  }
  function normalize(q,config={},now=Date.now(),sourceTime) {
    const cfg=settings(config),sent=validDate(q.sentAt)?q.sentAt:validDate(q.createdAt)?q.createdAt:validDate(sourceTime)?sourceTime:iso(now);
    if(!validDate(q.sentAt)){q.legacyTiming=!validDate(q.createdAt)&&!validDate(sourceTime);q.sentAt=sent;}
    q.createdAt??=sent;q.originalRecipientId??=q.recipientId;q.internal??=q.channelKey!=='client';
    if(q.status==='answered'&&!validDate(q.answeredAt)){q.answeredAt=sent;q.legacyTiming=true;}
    if(q.status==='cancelled'&&!validDate(q.cancelledAt)){q.cancelledAt=sent;q.legacyTiming=true;}
    if(!q.internal){q.timeline??=[];return q;}
    q.targetHours??=cfg.internalQuestionTargetHours;q.reminderHours??=cfg.internalQuestionReminderHours;
    q.deadlineAt??=iso(Date.parse(sent)+q.targetHours*HOUR);q.reminderAt??=iso(Date.parse(sent)+q.reminderHours*HOUR);q.timeline??=[];
    return q;
  }
  function timing(q,now=Date.now()) {
    return {open:q.status==='open',reminder:q.internal&&q.status==='open'&&now>=Date.parse(q.reminderAt),overdue:q.internal&&q.status==='open'&&now>=Date.parse(q.deadlineAt),lateAnswer:q.internal&&q.status==='answered'&&validDate(q.answeredAt)&&Date.parse(q.answeredAt)>Date.parse(q.deadlineAt)};
  }
  function event(t,q,type,now,actorId,extra={}) {
    const e={type,at:iso(now),actorId,...extra};q.timeline.push(e);
    t.history??=[];t.history.push({id:q.id+':'+type+':'+q.timeline.length,type:'question_'+type,questionId:q.id,actorId,createdAt:e.at,by:actorId?'Участник #'+actorId:'Демо таймера',time:new Date(now).toISOString(),summary:({created:'Вопрос отправлен',answered:'Ответ на вопрос получен',cancelled:'Вопрос отменён',reassigned:'Адресат вопроса изменён',waiting_resumed:'Support продолжает ожидание',reminder:'Напоминание адресату',overdue:'Внутренний срок ответа истёк'})[type]||type,...extra});
    return e;
  }
  function writable(t){if(!t||t.workflow==='closed')throw Error('Тикет закрыт. Доступна история.');}
  function target(t,recipientId) {
    if(t.clientConnected&&t.clientVerified&&t.clientId===recipientId)return {id:recipientId,name:t.client,channelKey:'client'};
    const p=t.participants.find(p=>p.userId===recipientId&&p.verified);
    if(!p)throw Error('Участник не подключён к тикету.');
    return {id:recipientId,name:p.name,channelKey:'participant:'+recipientId};
  }
  function addParticipant(t,p,reason,actorId,now=Date.now()) {
    writable(t);if(!p||p.group!=='agent'||!p.active||!reason?.trim())throw Error('Выберите доступного агента/эксперта и укажите основание.');
    if(t.participants.some(x=>x.userId===p.id))throw Error('Участник уже подключён.');
    t.participants.push({userId:p.id,name:p.name,initials:p.initials,verified:true,joinedAt:iso(now),joinedBy:actorId});
    t.channels['participant:'+p.id]={messages:[],unread:{},readCursors:{},needsReplyBy:null};
    t.history.push({id:'participant:'+p.id+':'+now,type:'participant_added',actorId,by:'Support',time:iso(now),summary:'Подключён участник: '+p.name,reason:reason.trim()});
  }
  function ask(t,{id,recipientId,text,actorId},config={},now=Date.now()) {
    writable(t);const p=target(t,recipientId);if(!text?.trim())throw Error('Напишите вопрос.');
    if(t.questions.some(q=>q.status==='open'&&q.channelKey===p.channelKey))throw Error('У адресата уже есть открытый вопрос.');
    const q=normalize({id,recipientId,target:p.name,channelKey:p.channelKey,text:text.trim(),status:'open',sentAt:iso(now),createdAt:iso(now)},config,now);
    t.questions.push(q);t.workflow='waiting_participant';t.waitingQuestionId=q.id;event(t,q,'created',now,actorId);return q;
  }
  function answer(t,qid,actorId,text,now=Date.now()) {
    writable(t);const q=t.questions.find(q=>q.id===qid&&q.status==='open'&&q.recipientId===actorId);
    if(!q||!text?.trim())throw Error('Вопрос изменён или ответ не указан.');
    const p=target(t,actorId);if(q.channelKey!==p.channelKey)throw Error('Адресат вопроса изменён.');
    q.status='answered';q.answer=text.trim();q.answeredAt=iso(now);t.workflow='waiting_support';t.waitingQuestionId=null;event(t,q,'answered',now,actorId,{late:timing(q,now).lateAnswer});return q;
  }
  function cancel(t,qid,reason,actorId,now=Date.now()) {
    writable(t);const q=t.questions.find(q=>q.id===qid&&q.status==='open');if(!q||!reason?.trim())throw Error('Укажите причину отмены открытого вопроса.');
    q.status='cancelled';q.cancelledAt=iso(now);q.cancelReason=reason.trim();event(t,q,'cancelled',now,actorId,{reason:q.cancelReason});
    if(!t.questions.some(x=>x.status==='open')){t.workflow='waiting_support';t.waitingQuestionId=null;}
    else if(t.waitingQuestionId===qid)t.waitingQuestionId=null;
    return q;
  }
  function resume(t,qid,actorId,now=Date.now()) {
    writable(t);const q=t.questions.find(q=>q.id===qid&&q.status==='open');if(!q)throw Error('Вопрос больше не ожидает ответа.');
    target(t,q.recipientId);t.workflow='waiting_participant';t.waitingQuestionId=q.id;event(t,q,'waiting_resumed',now,actorId);return q;
  }
  function reassign(t,qid,recipientId,reason,actorId,now=Date.now()) {
    writable(t);const q=t.questions.find(q=>q.id===qid&&q.status==='open'),p=target(t,recipientId);
    if(!q?.internal||p.channelKey==='client')throw Error('Переназначение допустимо только между внутренними участниками.');
    if(!q||q.recipientId===recipientId||!reason?.trim())throw Error('Выберите другого подключённого участника и укажите причину.');
    if(t.questions.some(x=>x!==q&&x.status==='open'&&x.channelKey===p.channelKey))throw Error('У нового адресата уже есть открытый вопрос.');
    const old={recipientId:q.recipientId,channelKey:q.channelKey,target:q.target};
    q.recipientId=recipientId;q.channelKey=p.channelKey;q.target=p.name;
    event(t,q,'reassigned',now,actorId,{fromRecipientId:old.recipientId,toRecipientId:recipientId,reason:reason.trim(),deadlineAt:q.deadlineAt});return {q,old};
  }
  function milestones(t,now=Date.now()) {
    if(t.workflow==='closed')return false;
    let changed=false;
    for(const q of t.questions){if(q.status!=='open')continue;const x=timing(q,now);
      if(x.reminder&&!q.reminderRecordedAt){q.reminderRecordedAt=iso(now);event(t,q,'reminder',now,0,{recipientId:q.recipientId,scheduledAt:q.reminderAt});changed=true;}
      if(x.overdue&&!q.overdueRecordedAt){q.overdueRecordedAt=iso(now);event(t,q,'overdue',now,0,{scheduledAt:q.deadlineAt});changed=true;}
    }return changed;
  }
  function canReview(t,actorId,now=Date.now()) {
    return Boolean(t&&t.reporterId===actorId&&t.workflow==='resolved'&&t.authorCapabilities?.acceptResolution&&t.authorCapabilities?.returnForRework&&validDate(t.resolutionDeadline)&&now<Date.parse(t.resolutionDeadline));
  }
  function returnForRework(t,actorId,text,now=Date.now()) {
    writable(t);if(!canReview(t,actorId,now)||!text?.trim())throw Error('Возврат недоступен или не указано, что осталось нерешённым.');
    t.workflow='waiting_support';t.resolutionReturnedAt=iso(now);t.history.push({id:'rework:'+now,type:'resolution_reopened',actorId,by:'Автор обращения',time:iso(now),summary:'Автор вернул тикет на доработку'});
  }
  function mayMutate(t,operation){return operation==='mark_read'?Boolean(t):Boolean(t&&t.workflow!=='closed');}
  return {HOUR,priorities,settings,normalize,timing,addParticipant,ask,answer,cancel,resume,reassign,milestones,canReview,returnForRework,mayMutate};
});
