(function () {
  'use strict';
  const DAY = 86400000;
  const AS_OF = Date.UTC(2026, 10, 16, 12);
  const minskStart=s=>Date.parse(s+'T00:00:00+03:00');
  const day = n => AS_OF - n * DAY;
  const iso = n => new Date(n).toISOString().slice(0, 10);
  const profiles = [
    {id:'a',name:'Мира',owner:'k'}, {id:'b',name:'Луна',owner:'k'},
    {id:'c',name:'Амелия',owner:'k'}, {id:'d',name:'Солара',owner:'s'},
    {id:'e',name:'Талия',owner:'m'}, {id:'f',name:'Зора',owner:'s'}
  ];
  const agents = [{id:'k',name:'Кристи'}, {id:'s',name:'София'}, {id:'m',name:'Марк'}];
  const ownerAt = (profile, time) => profile === 'a' && time < day(45) ? 'm' : profile === 'f' && time < day(45) ? 'k' : profiles.find(p => p.id === profile).owner;
  const replyTime = contact => {
    if(!contact.answered)return null;
    if(Number.isFinite(contact.replyAt))return contact.replyAt;
    return Number.isFinite(contact.replyMinutes)&&contact.replyMinutes>=0?contact.time+contact.replyMinutes*60000:null;
  };
  function demoData() {
    const contacts=[], sessions=[], topups=[], pending=[], pings=[],reviews=[],complaints=[];
    for (let i=0;i<120;i++) {
      const profile=profiles[i%profiles.length].id, client='c'+i;
      const start=day(5+(i*13)%100), author=ownerAt(profile,start), hasContact=i%10!==0;
      const replyMinutes=author==='m'?22+i%19:2+(i*3)%13;
      if (hasContact) contacts.push({id:'q'+i,client,profile,agent:author,replyAgent:i%7!==0&&i%31!==0?ownerAt(profile,start+replyMinutes*60000):null,time:start,answered:i%7!==0,replyMinutes:i%7!==0?replyMinutes:null});
      if (i%6===0) {
        const previous=profiles[(i+1)%profiles.length].id, before=start-18*DAY;
        sessions.push({id:'old'+i,client,profile:previous,agent:ownerAt(previous,before),time:before,minutes:9+i%8,debit:48+i%36,accrual:8+i%7,confirmed:true});
      }
      if (i%5!==0) {
        const paid=start+(2+(i*7)%35)*DAY;
        if (paid<=AS_OF) {
          const paidProfile=i%13===0 ? profiles[(i+1)%profiles.length].id : profile;
          sessions.push({id:'s'+i,client,profile:paidProfile,agent:ownerAt(paidProfile,paid),time:paid,minutes:8+(i*3)%23,debit:55+(i*17)%160,accrual:12+(i*7)%38,confirmed:true});
          if (i%4===1 && paid+DAY<=AS_OF) reviews.push({client,profile:paidProfile,agent:ownerAt(paidProfile,paid),time:paid+DAY,rating:4+(i%3===0?1:0)});
          if (i%3===0) {
            const next=paid+(7+(i*5)%31)*DAY;
            if (next<=AS_OF) sessions.push({id:'r'+i,client,profile:paidProfile,agent:ownerAt(paidProfile,next),time:next,minutes:7+(i*5)%24,debit:40+(i*19)%150,accrual:10+(i*11)%30,confirmed:true});
          }
        }
      }
      const topup=start+DAY;
      if (i%4!==0 && topup<=AS_OF) topups.push({id:'t'+i,client,time:topup,credits:100+(i%4)*50});
      if (i%29===1 && start+2*DAY<=AS_OF) complaints.push({client,profile,agent:author,time:start+2*DAY});
      if (i%5===0 || i%5===2) {
        const makePing=(id,pingAt)=>{
          const writtenAt=i%4!==0?pingAt+DAY:null, writer=writtenAt===null?null:ownerAt(profile,writtenAt);
          const responds=writer==='s'?i%7===1:writer==='m'?i%7!==0:i%5!==0;
          const respondedAt=writtenAt!==null&&responds?writtenAt+6*3600000:null;
          pings.push({id,client:'ping-client'+i,profile,agent:ownerAt(profile,pingAt),time:pingAt,
            writtenAt, writer, respondedAt, writtenEventId:writtenAt===null?null:id+'-out', responseEventId:respondedAt===null?null:id+'-reply'});
        };
        const pingAt=start-2*DAY;
        makePing('ping'+i,pingAt);
        if(i%11===0&&pingAt+28*DAY<AS_OF)makePing('renewed-ping'+i,pingAt+28*DAY);
      }
    }
    profiles.forEach((p,i) => {
      for(let x=0;x<(i%3)+1;x++) pending.push({id:(i+1)+'-'+(x+1),profile:p.id,agent:p.owner,age:5+i*4+x*3});
      const now = AS_OF-(15+i*7)*60000;
      contacts.push({id:'today'+i,client:'today-client'+i,profile:p.id,agent:p.owner,replyAgent:p.owner,time:now,answered:true,replyMinutes:3+i*2});
      if(i%2===0) sessions.push({id:'today-paid'+i,client:'today-client'+i,profile:p.id,agent:p.owner,time:now+12*60000,minutes:9+i,debit:48,accrual:12,confirmed:true});
      for(let x=0;x<(i%4)+2;x++){
        pings.push({id:'open-ping'+i+'-'+x,client:'open-ping-client'+i+'-'+x,profile:p.id,agent:p.owner,time:AS_OF-(7+x*6+i)*60000,open:true});
      }
    });
    const pingConversations=new Set();
    const firstInbound=pings.filter(p=>Number.isFinite(p.respondedAt)&&p.respondedAt<=AS_OF).sort((a,b)=>a.respondedAt-b.respondedAt);
    for(const ping of firstInbound){
      const pair=pairKey(ping);
      if(pingConversations.has(pair))continue;
      pingConversations.add(pair);
      const time=ping.respondedAt, agent=ownerAt(ping.profile,time);
      const replyMinutes=agent==='m'?29:8;
      const replyAt=time+replyMinutes*60000, answered=replyAt<=AS_OF;
      contacts.push({id:ping.responseEventId,source:'ping',client:ping.client,profile:ping.profile,agent,time,answered,
        replyAgent:answered?ownerAt(ping.profile,replyAt):null,replyAt:answered?replyAt:null,replyMinutes:answered?replyMinutes:null});
    }
    const sameTimestamp=day(36);
    contacts.push({id:'same-time-incoming',client:'c121',profile:'d',agent:'s',time:sameTimestamp,answered:true,replyAt:sameTimestamp,replyAgent:'s'});
    sessions.push({id:'same-time-debit',client:'c121',profile:'d',agent:'s',time:sameTimestamp,minutes:8,debit:50,accrual:12,confirmed:true});
    sessions.sort((a,b)=>a.time-b.time);
    return {contacts,sessions,topups,pending,pings,reviews,complaints};
  }
  const inPeriod=(time,from,to)=>time>=from && time<to+DAY;
  const pairKey = item => item.client+'|'+item.profile;
  const snapshotTime=opt=>Math.min(opt.asOf??AS_OF,AS_OF);
  const reportTime=(time,opt)=>time<=Math.min(snapshotTime(opt),opt.through??AS_OF)&&inPeriod(time,opt.from,opt.to);
  function selectPings(pings,opt) {
    const leads=new Map(), writtenEvents=new Set(), responseEvents=new Set();
    const observedThrough=snapshotTime(opt);
    const source=pings.filter(p=>p.id&&Number.isFinite(p.time)&&p.time<=observedThrough).sort((a,b)=>a.time-b.time);
    const writtenRefs=new Map(),responseRefs=new Map();
    for(const ping of source){
      for(const [refs,id] of [[writtenRefs,ping.writtenEventId],[responseRefs,ping.responseEventId]]){
        if(id){if(!refs.has(id))refs.set(id,new Set());refs.get(id).add(ping.id);}
      }
    }
    for(const ping of source){
      if(leads.has(ping.id))continue;
      const writtenEvent=ping.writtenEventId,responseEvent=ping.responseEventId;
      const hasWritten=Number.isFinite(ping.writtenAt)&&ping.writtenAt>ping.time&&ping.writtenAt<=observedThrough;
      const written=hasWritten&&Boolean(ping.writer)&&Boolean(writtenEvent)&&writtenRefs.get(writtenEvent)?.size===1&&!writtenEvents.has(writtenEvent);
      const hasResponse=written&&Number.isFinite(ping.respondedAt)&&ping.respondedAt>ping.writtenAt&&ping.respondedAt<=observedThrough;
      const responded=hasResponse&&Boolean(responseEvent)&&responseRefs.get(responseEvent)?.size===1&&!responseEvents.has(responseEvent);
      if(written)writtenEvents.add(writtenEvent);
      if(responded)responseEvents.add(responseEvent);
      leads.set(ping.id,{ping,written,responded,unknownWrite:hasWritten&&!written,unknownResponse:hasResponse&&!responded});
    }
    const matchesProfile=ping=>opt.profile==='all'||ping.profile===opt.profile;
    const matchesAgent=agent=>opt.agent==='all'||agent===opt.agent;
    const available=[...leads.values()];
    const acquired=available.filter(({ping})=>matchesProfile(ping)&&matchesAgent(ping.agent)&&reportTime(ping.time,opt));
    const contacted=acquired.filter(lead=>lead.written);
    const performed=available.filter(({ping,written})=>matchesProfile(ping)&&matchesAgent(ping.writer)&&written&&reportTime(ping.writtenAt,opt));
    return {acquired,contacted,performed};
  }
  function summarizePings(pings,opt) {
    const {acquired,contacted,performed}=selectPings(pings,opt);
    return {acquired:acquired.length,contacted:contacted.length,responded:contacted.filter(lead=>lead.responded).length,
      unknownContact:acquired.filter(lead=>lead.unknownWrite).length,
      resolvedContactResponses:contacted.filter(lead=>!lead.unknownResponse).length,
      performed:performed.length,performedResponded:performed.filter(lead=>lead.responded).length,
      resolvedPerformedResponses:performed.filter(lead=>!lead.unknownResponse).length};
  }
  function pingResponseTiming(pings,opt){
    const {contacted}=selectPings(pings,opt);
    const durations=contacted.map(({ping})=>(ping.writtenAt-ping.time)/60000).sort((a,b)=>a-b);
    const count=durations.length;
    const center=Math.floor(count/2);
    const medianMinutes=count?(count%2?durations[center]:(durations[center-1]+durations[center])/2):null;
    return {medianMinutes,count};
  }
  function summarizeWork(data,agent='all') {
    const matches = item => agent==='all'||item.agent===agent;
    const pending=data.pending.filter(matches);
    const pings=(data.pings||[]).filter(p=>p.open&&matches(p));
    const dayStart=minskStart(iso(AS_OF+3*3600000));
    const today=calculate(data,{mode:'manager',agent,profile:'all',from:dayStart,to:dayStart});
    return {pending:pending.length,oldest:pending.length?Math.max(...pending.map(p=>p.age)):null,pings:pings.length,today};
  }
  function calculate(data,opt) {
    const isAgent=opt.mode==='agent';
    const selectedAgent=isAgent?'k':opt.agent;
    const observedThrough=snapshotTime(opt);
    const detailAllowed=p=>!isAgent||profiles.some(x=>x.id===p&&x.owner===selectedAgent);
    const profileOK=p=>opt.profile==='all'||p===opt.profile;
    const aggregateProfile=p=>profileOK(p)&&(opt.profile==='all'||detailAllowed(p));
    const agentOK=a=>selectedAgent==='all'||a===selectedAgent;
    const performer=x=>x.replyAgent;
    const scope=x=>aggregateProfile(x.profile)&&agentOK(x.agent);
    const replyScope=x=>Boolean(performer(x))&&aggregateProfile(x.profile)&&agentOK(performer(x));
    const selectedTime=time=>reportTime(time,opt);
    const observedReply=x=>{
      const time=replyTime(x);
      return time!==null&&time>x.time&&time<=observedThrough?time:null;
    };
    const contacts=data.contacts.filter(c=>c.time<=observedThrough);
    const firstContacts=new Map();
    contacts.slice().sort((a,b)=>a.time-b.time).forEach(c=>{const key=pairKey(c);if(!firstContacts.has(key))firstContacts.set(key,c);});
    const sessionById=new Map();
    data.sessions.filter(s=>Number(s.debit)>0&&s.confirmed===true&&s.time<=observedThrough).slice().sort((a,b)=>a.time-b.time).forEach(s=>{if(!sessionById.has(s.id))sessionById.set(s.id,s);});
    const sessions=[...sessionById.values()];
    const events=[...firstContacts.values()].filter(x=>scope(x)&&selectedTime(x.time));
    const ambiguousReplyOrder=events.filter(x=>replyTime(x)!==null&&replyTime(x)===x.time&&x.time<=observedThrough);
    const responseBase=events.length-ambiguousReplyOrder.length;
    const replyEvents=[...firstContacts.values()].filter(x=>observedReply(x)!==null&&selectedTime(observedReply(x)));
    const replied=replyEvents.filter(replyScope);
    const unknownReplies=selectedAgent==='all'?replyEvents.filter(x=>!performer(x)&&aggregateProfile(x.profile)):[];
    const allReplies=replied.concat(unknownReplies);
    const paid=sessions.filter(x=>scope(x)&&selectedTime(x.time));
    const unique=a=>new Set(a).size;
    const firstPaid=new Map(), firstPair=new Map();
    sessions.forEach(s=>{if(!firstPaid.has(s.client))firstPaid.set(s.client,s);const k=s.client+'|'+s.profile;if(!firstPair.has(k))firstPair.set(k,s);});
    const aged=x=>x.time+30*DAY<=observedThrough;
    const answeredContacts=allReplies.map(c=>({...c,time:observedReply(c)}));
    const matureReplies=answeredContacts.filter(aged);
    let converted=0, ambiguousReply=0;
    for(const contact of matureReplies){
      const outcomes=sessions.filter(s=>pairKey(s)===pairKey(contact)&&s.time>=contact.time&&s.time<=contact.time+30*DAY);
      if(outcomes.some(s=>s.time>contact.time))converted++;
      else if(outcomes.some(s=>s.time===contact.time))ambiguousReply++;
    }
    const platformByPerson=new Map(),ambiguousFirstInbound=new Set();
    [...firstContacts.values()].sort((a,b)=>a.time-b.time).forEach(c=>{
      if(!platformByPerson.has(c.client))platformByPerson.set(c.client,c);
      else if(platformByPerson.get(c.client).time===c.time)ambiguousFirstInbound.add(c.client);
    });
    const platformEntries=[...platformByPerson.values()].filter(c=>!ambiguousFirstInbound.has(c.client)&&scope(c)&&selectedTime(c.time));
    const unknownFirstInbound=selectedAgent==='all'&&opt.profile==='all'
      ?[...platformByPerson.values()].filter(c=>ambiguousFirstInbound.has(c.client)&&aggregateProfile(c.profile)&&selectedTime(c.time)).length:0;
    const ambiguousPlatform=unknownFirstInbound+platformEntries.filter(c=>firstPaid.get(c.client)?.time===c.time).length;
    const newPlatform=platformEntries.filter(c=>!firstPaid.has(c.client)||firstPaid.get(c.client).time>c.time);
    const platformAged=newPlatform.filter(aged);
    const firstPlatform=platformAged.filter(c=>{const s=firstPaid.get(c.client);return s&&s.time>c.time&&s.time<=c.time+30*DAY;});
    const firstRepeat=[],ambiguousFirstPairs=new Set();
    for(const first of firstPair.values()){
      const pairSessions=sessions.filter(s=>pairKey(s)===pairKey(first));
      if(pairSessions.filter(s=>s.time===first.time).length>1){ambiguousFirstPairs.add(pairKey(first));continue;}
      const candidates=pairSessions.filter(s=>s.time>first.time&&s.time<=first.time+30*DAY);
      if(candidates.length){
        const next=candidates[0],sameTime=candidates.filter(s=>s.time===next.time);
        const performerCertain=sameTime.every(s=>Boolean(s.agent)&&s.agent===next.agent);
        firstRepeat.push({first,next,performerCertain});
      }
    }
    const allRepeatBase=[...firstPair.values()].filter(s=>detailAllowed(s.profile)&&profileOK(s.profile)&&selectedTime(s.time));
    const ambiguousRepeatFirst=allRepeatBase.filter(s=>ambiguousFirstPairs.has(pairKey(s))).length;
    const repeatBase=allRepeatBase.filter(s=>!ambiguousFirstPairs.has(pairKey(s)));
    const repeatAged=repeatBase.filter(aged);
    const repeatIds=new Set(firstRepeat.map(row=>row.first.id));
    const returned=repeatAged.filter(first=>repeatIds.has(first.id));
    const performedRepeats=firstRepeat.filter(row=>row.performerCertain).map(row=>row.next).filter(s=>scope(s)&&selectedTime(s.time));
    const ambiguousRepeatPerformer=selectedAgent==='all'?firstRepeat.filter(row=>!row.performerCertain&&aggregateProfile(row.next.profile)&&selectedTime(row.next.time)).length:0;
    const scopedClients=new Set(contacts.filter(x=>scope(x)||(observedReply(x)!==null&&replyScope(x))).map(x=>x.client).concat(sessions.filter(scope).map(x=>x.client)));
    const topups=data.topups.filter(x=>scopedClients.has(x.client)&&selectedTime(x.time));
    const reviews=(data.reviews||[]).filter(x=>scope(x)&&selectedTime(x.time));
    const complaints=(data.complaints||[]).filter(x=>scope(x)&&selectedTime(x.time));
    const replyTimes=allReplies.map(x=>(observedReply(x)-x.time)/60000).sort((a,b)=>a-b);
    const middle=Math.floor(replyTimes.length/2),medianReply=replyTimes.length?(replyTimes.length%2?replyTimes[middle]:(replyTimes[middle-1]+replyTimes[middle])/2):null;
    const firstPaidInPeriod=paid.filter(s=>firstPaid.get(s.client).id===s.id);
    const detailRows=[...new Map(events.concat(allReplies).filter(c=>detailAllowed(c.profile)).map(c=>[c.id,{...c,replyObservedAt:observedReply(c)}])).values()];
    const knowsQueue=observedThrough===AS_OF;
    const pingPath=opt.profile==='all'||detailAllowed(opt.profile)?summarizePings(data.pings,{...opt,agent:selectedAgent}):summarizePings([],opt);
    return {events,replied,unknownReplies,detailRows,paid,clients:unique(paid.map(x=>x.client)),minutes:paid.reduce((n,x)=>n+x.minutes,0),
      debit:paid.reduce((n,x)=>n+x.debit,0),accrual:paid.reduce((n,x)=>n+x.accrual,0),
      answered:events.filter(x=>observedReply(x)!==null).length,responseBase,
      answeredContactIds:events.filter(x=>observedReply(x)!==null).map(x=>x.id),
      ambiguousReplyOrderIds:ambiguousReplyOrder.map(x=>x.id),
      conversion:{n:converted,d:matureReplies.length-ambiguousReply,waiting:answeredContacts.length-matureReplies.length},
      firstPlatform:{n:firstPlatform.length,d:platformAged.length,waiting:newPlatform.length-platformAged.length},
      ambiguousSequence:{reply:ambiguousReply,platform:ambiguousPlatform,repeat:ambiguousRepeatFirst,repeatPerformer:ambiguousRepeatPerformer},
      repeat:{n:returned.length,d:repeatAged.length,waiting:repeatBase.length-repeatAged.length},
      repeatApplicable:isAgent||selectedAgent==='all',
      performedRepeats,
      firstPaid:firstPaidInPeriod.length,
      topupAmount:topups.reduce((n,x)=>n+x.credits,0),topupCount:topups.length,
      pending:knowsQueue?data.pending.filter(x=>scope(x)&&detailAllowed(x.profile)).length:0,
      pings:knowsQueue?data.pings.filter(p=>p.open&&p.time<=observedThrough&&scope(p)&&detailAllowed(p.profile)).length:0,
      pingPath,
      reviews,complaints,medianReply,replySamples:replyTimes.length};
  }
  function periodBins(data,opt){
    const days=Math.round((opt.to-opt.from)/DAY)+1;
    const size=days<=7?days:Math.min(days,7);
    return Array.from({length:size},(_,index)=>{
      const from=opt.from+Math.floor(days*index/size)*DAY;
      const to=opt.from+(Math.floor(days*(index+1)/size)-1)*DAY;
      const result=calculate(data,{...opt,from,to});
      return {from,to,incoming:result.events.length,answered:result.answered,paid:result.paid.length,
        repeats:result.performedRepeats.length,debit:result.debit,accrual:result.accrual,topups:result.topupAmount,
        pings:result.pingPath.acquired,pingContacted:result.pingPath.contacted,pingResponded:result.pingPath.responded};
    });
  }
  function replyDistribution(result){
    const ranges=[0,0,0,0];
    for(const contact of result.replied.concat(result.unknownReplies)){
      const minutes=(replyTime(contact)-contact.time)/60000;
      const range=minutes<=5?0:minutes<=15?1:minutes<=30?2:3;
      ranges[range]++;
    }
    return ranges;
  }
  function periodCoverage(from,to,first,last){
    const start=Math.max(from,first);
    const end=Math.min(to+DAY-1,last);
    const status=start>end?'outside':start>from||end<to+DAY-1?'partial':'full';
    return {status,start,end};
  }
  function chatSelection(result,kind){
    const replies=result.replied.concat(result.unknownReplies);
    const candidates=kind==='sent'?replies:result.events;
    const visible=new Map(result.detailRows.map(row=>[row.id,row]));
    const answered=new Set(result.answeredContactIds),unknownOrder=new Set(result.ambiguousReplyOrderIds);
    const rows=[];
    let total=0;
    for (const contact of candidates) {
      const row=visible.get(contact.id);
      if(kind==='answered'&&!answered.has(contact.id)) continue;
      if(kind==='unanswered'&&(answered.has(contact.id)||unknownOrder.has(contact.id))) continue;
      total++;
      if(row) rows.push(row);
    }
    rows.sort((a,b)=>kind==='sent'?b.replyObservedAt-a.replyObservedAt:b.time-a.time);
    return {total,rows};
  }
  if (typeof module!=='undefined'&&module.exports) module.exports={calculate,demoData,AS_OF,DAY,minskStart,inPeriod,summarizePings,summarizeWork,periodBins,replyDistribution,pingResponseTiming,periodCoverage,chatSelection};
  if (typeof document==='undefined') return;
  const root=document.getElementById('partner-analytics');
  if (!root) return;
  const mode=root.dataset.mode==='manager'?'manager':'agent';
  const en=new URLSearchParams(location.search).get('lang')==='en';
  const t=(ru,eng)=>en?eng:ru;
  document.title=t(mode==='agent'?'Аналитика агента · Confideline':'Аналитика команды · Confideline',mode==='agent'?'Agent analytics · Confideline':'Team analytics · Confideline');
  const data=demoData();
  if(en){
    const names={'Мира':'Mira','Луна':'Luna','Амелия':'Amelia','Солара':'Solara','Талия':'Talia','Зора':'Zora','Кристи':'Kristy','София':'Sofia','Марк':'Mark'};
    profiles.forEach(p=>p.name=names[p.name]||p.name);agents.forEach(a=>a.name=names[a.name]||a.name);
    const words=[['Взаимодействия пользователей','User interactions'],['Панель аналитики','Analytics dashboard'],['Администрирование','Administration'],['Эксперты','Experts'],['Партнеры','Partners'],['Финансы','Finance'],['Поддержка','Support'],['Аналитика','Analytics'],['Диалоги','Dialogs'],['МОДЕРАЦИЯ','MODERATION'],['Сообщения','Messages'],['СОДЕРЖИМОЕ','CONTENT'],['Главное','Home']];
    const translate=s=>words.reduce((v,pair)=>v.split(pair[0]).join(pair[1]),s);
    document.querySelectorAll('.main-header,.main-sidebar,.content-header,.main-footer').forEach(el=>{
      const walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
      while(walk.nextNode())walk.currentNode.nodeValue=translate(walk.currentNode.nodeValue);
      el.querySelectorAll('[aria-label],[title],[placeholder]').forEach(item=>['aria-label','title','placeholder'].forEach(attr=>{if(item.hasAttribute(attr))item.setAttribute(attr,translate(item.getAttribute(attr)));}));
    });
    document.documentElement.lang='en';root.setAttribute('aria-label','Analytics');
  }
  const opt={mode,agent:mode==='agent'?'k':'all',profile:'all',from:minskStart('2026-10-01'),to:minskStart('2026-10-31')};
  const tabs=[
    ['summary',t('Сводка','Overview')],
    ...(mode==='manager'?[['team',t('Команда','Team')]]:[]),
    ['chats',t('Пинги и чаты','Pings and chats')],
    ['funnel',t('Воронка','Funnel')],
    ['consultations',t('Консультации и возвраты','Consultations and returns')],
    ['finance',t(mode==='agent'?'Мои начисления':'Финансы',mode==='agent'?'My earnings':'Finances')]
  ];
  let tab='summary', grouping='agents', sortKey='name', sortDesc=false, openedBy=null;
  let interactionFilter='incoming', interactionPage=0, comparisonScope=null;
  const numberFormat=new Intl.NumberFormat(en?'en-US':'ru-RU');
  const fmt=n=>numberFormat.format(n);
  const date=n=>new Intl.DateTimeFormat(en?'en-GB':'ru-RU',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'Europe/Minsk'}).format(new Date(n));
  const timeFormat=new Intl.DateTimeFormat(en?'en-GB':'ru-RU',{hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:'Europe/Minsk'});
  const instant=n=>date(n)+' '+timeFormat.format(n);
  const firstSample=Math.min(...data.contacts.map(x=>x.time),...data.sessions.map(x=>x.time),...data.pings.map(x=>x.time));
  const coverage=()=>periodCoverage(opt.from,opt.to,firstSample,AS_OF);
  const amountDate=t('По дате оплаты консультации','By consultation payment date');
  const valueRatio=q=>q.d?Math.round(q.n/q.d*100)+'%':t('Недостаточно данных','Not enough data');
  const ratioDetail=q=>q.d?fmt(q.n)+' / '+fmt(q.d):t('Нет завершённых периодов наблюдения','No completed observation periods');
  const e=id=>document.getElementById(id);
  const kpi=(icon,title,value,sub,detail,comparison,target)=>'<div class="pa-kpi"><button type="button" class="pa-kpi-nav" data-go-tab="'+target+'"'+(target==='chats'?' data-interaction="'+(detail==='responses'?'answered':'incoming')+'"':'')+'><span class="pa-icon"><i class="fa fa-'+icon+'" aria-hidden="true"></i></span><span class="pa-kpi-text"><span class="pa-kpi-name">'+title+'</span><strong class="pa-kpi-value">'+value+'</strong><span class="pa-kpi-sub">'+sub+'</span><span class="pa-kpi-compare">'+comparison+'</span></span></button><button type="button" class="pa-kpi-info" data-detail="'+detail+'" aria-label="'+t('Как считается: ','About this metric: ')+title+'">ⓘ</button></div>';
  const card=(title,obj,explain)=>{
    const fill=obj.d?obj.n/obj.d*100:0;
    return '<div class="pa-cohort-card"><div class="pa-cohort-title">'+title+'</div>'+
      '<div class="pa-cohort-number"><strong>'+valueRatio(obj)+'</strong><span>'+ratioDetail(obj)+'</span></div>'+
      (obj.d?'<div class="pa-cohort-meter" aria-hidden="true"><span style="--pa-fill:'+fill+'%"></span></div>':'')+
      '<div class="pa-cohort-detail">'+explain+'</div><div class="pa-cohort-detail">'+t('Окно ещё открыто: ','Window still open: ')+fmt(obj.waiting)+'</div></div>';
  };
  const allProfilesLabel=mode==='agent'?t('Все мои результаты','All my results'):t('Все доступные анкеты','All available profiles');
  const comparisonPanel='<section class="pa-box pa-table-box"><div class="pa-box-head"><div><h3 id="v2-table-title"></h3><p id="v2-table-sub"></p></div>'+(mode==='manager'?'<div class="pa-switch"><button type="button" data-group="agents">'+t('По агентам','By agent')+'</button><button type="button" data-group="profiles">'+t('По анкетам','By profile')+'</button></div>':'')+'</div><div class="pa-table-scroll" id="v2-table" tabindex="0" role="region" aria-labelledby="v2-table-title"></div></section>';
  const box=(title,description,body)=>'<section class="pa-box pa-report-box"><div class="pa-box-head"><div><h3>'+title+'</h3>'+(description?'<p>'+description+'</p>':'')+'</div></div>'+body+'</section>';
  const slot=id=>'<div id="'+id+'"></div>';
  const panel=(id,body)=>'<section id="v2-'+id+'" class="pa-report-panel" role="tabpanel" tabindex="0" aria-labelledby="tab-'+id+'"'+(id==='summary'?'':' hidden')+'><p class="pa-box pa-report-empty" hidden>'+t('Нет данных за выбранный период. Выберите даты из доступного интервала.','No data for this period. Choose dates within the available range.')+'</p>'+body+'</section>';
  const linkSuffix=en?'?lang=en&v=handoff-20261117':'?v=handoff-20261117';
  root.innerHTML=
    '<div class="pa-header"><div><h2>'+t(mode==='agent'?'Аналитика агента':'Аналитика команды',mode==='agent'?'Agent analytics':'Team analytics')+'</h2><p>'+t(mode==='agent'?'Текущие диалоги и мои результаты':'Текущая нагрузка и результаты агентов',mode==='agent'?'Open conversations and my results':'Current workload and agent performance')+'</p></div><div class="pa-role-nav"><span class="pa-preview-label">'+t('Макеты','Previews')+'</span><a '+(mode==='agent'?'aria-current="page"':'')+' href="paces-agent.html'+linkSuffix+'">'+t('Агент','Agent')+'</a><a '+(mode==='manager'?'aria-current="page"':'')+' href="paces-supervisor.html'+linkSuffix+'">'+t('Руководитель','Supervisor')+'</a><span class="pa-demo">'+t('Условные данные','Sample data')+'</span></div></div>'+
    '<section class="pa-current" aria-labelledby="pa-current-title" aria-describedby="pa-work-scope"><div class="pa-section-head pa-current-heading"><div><h3 id="pa-current-title">'+t('Работа сейчас','Work now')+'</h3><p id="pa-work-scope"></p></div><a class="pa-work-link" target="_blank" rel="noopener" href="https://confideline.com/'+(en?'en':'ru')+'/admin/chat/v2?leadType=chats">'+t('Chat V2 · общий список','Chat V2 · general list')+' <i class="fa fa-external-link" aria-hidden="true"></i></a></div><div class="pa-live-grid"><div id="pa-work-summary"></div>'+
    '<section class="pa-box pa-today" aria-labelledby="pa-today-title"><h4 id="pa-today-title">'+t('Сегодня','Today')+'</h4><div class="pa-quality" id="pa-today-summary"></div></section></div></section>'+
    '<dialog id="pa-work-queue-dialog" aria-labelledby="pa-work-queue-title"><div class="pa-dialog-head"><div><h3 id="pa-work-queue-title"></h3><p id="pa-work-queue-scope"></p></div><button type="button" class="pa-close" id="pa-work-queue-close" data-close-work-queue aria-label="'+t('Закрыть','Close')+'">×</button></div><div id="pa-work-queue-content"></div></dialog>'+
    '<button type="button" class="btn btn-default pa-work-toggle" id="pa-work-toggle" aria-expanded="false" aria-controls="pa-current-section">'+t('Работа сейчас','Work now')+'</button><div class="pa-toolbar"><div class="pa-tabs" role="tablist" aria-label="'+t('Раздел отчёта','Report section')+'">'+tabs.map(([id,label])=>'<button id="tab-'+id+'" class="pa-tab" type="button" role="tab" data-tab="'+id+'" aria-controls="v2-'+id+'" aria-selected="'+(id==='summary')+'" tabindex="'+(id==='summary'?0:-1)+'">'+label+'</button>').join('')+'</div>'+
    '<button type="button" class="btn btn-default pa-filter-toggle" id="pa-filter-toggle" aria-expanded="false" aria-controls="v2-filters">'+t('Фильтры','Filters')+'</button><form class="pa-filters" id="v2-filters"><label>'+t('Период','Period')+'<select id="v2-period" class="form-control"><option value="prev">'+t('Прошлый месяц','Previous month')+'</option><option value="30">'+t('Последние 30 дней','Last 30 days')+'</option><option value="7">'+t('Последние 7 дней','Last 7 days')+'</option><option value="custom">'+t('Выбрать даты','Custom dates')+'</option></select></label>'+
    '<label class="pa-custom" id="v2-from-wrap" hidden>'+t('С','From')+'<input id="v2-from" class="form-control" type="date" value="2026-10-01"></label><label class="pa-custom" id="v2-to-wrap" hidden>'+t('По','To')+'<input id="v2-to" class="form-control" type="date" value="2026-10-31"></label>'+
    (mode==='manager'?'<label>'+t('Агент','Agent')+'<select id="v2-agent" class="form-control"><option value="all">'+t('Все агенты','All agents')+'</option>'+agents.map(a=>'<option value="'+a.id+'">'+a.name+'</option>').join('')+'</select></label>':'')+
    '<label>'+t('Анкета','Profile')+'<select id="v2-profile" class="form-control"><option value="all">'+allProfilesLabel+'</option>'+profiles.filter(p=>mode==='manager'||p.owner==='k').map(p=>'<option value="'+p.id+'">'+p.name+'</option>').join('')+'</select></label>'+
    '<button class="btn btn-primary" type="submit">'+t('Применить','Apply')+'</button><button class="btn btn-default" type="button" id="v2-reset">'+t('Сбросить','Reset')+'</button><div class="pa-error" id="v2-error" role="alert" hidden></div></form><p class="pa-context" id="v2-context" aria-live="polite"></p><p class="pa-coverage" id="pa-coverage" hidden></p></div>'+
    panel('summary',
      '<div class="pa-section-head"><div><h3>'+t('Результаты за период','Results for the period')+'</h3><p id="pa-comparison-period"></p></div>'+(mode==='manager'?'<button class="btn btn-default" id="pa-back-team" type="button" hidden>'+t('К сравнению команды','Back to team comparison')+'</button>':'')+'</div><div class="pa-kpis" id="v2-kpis"></div>'+
      box(t('Динамика входящих и консультаций','Incoming conversations and consultations over time'),t('Два отдельных показателя по датам событий','Two independent measures by event date'),slot('pa-summary-chart')))+
    (mode==='manager'?panel('team',
      '<div class="pa-grid-2 pa-report-grid">'+
      box(t('Очередь по агентам','Queue by agent'),t('Текущий срез · независимо от периода отчёта','Current snapshot · independent of the report period'),slot('v2-queue'))+
      box(t('Сравнение агентов','Compare agents'),t('Для сравнения в одинаковых условиях выберите одну анкету.','Choose one profile to compare agents in a common context.'),'<label class="pa-team-select">'+t('Показатель','Measure')+'<select class="form-control" id="pa-team-selector"><option value="median">'+t('Медиана первого ответа','Median first reply time')+'</option><option value="conversion">'+t('Оплата после ответа, 30 дней','Paid after reply, 30 days')+'</option><option value="ping">'+t('Ответы на исходящие по пингам','Replies to ping outreach')+'</option><option value="paid">'+t('Платные консультации','Paid consultations')+'</option><option value="repeats">'+t('Первые возвраты','First returns')+'</option></select></label>'+slot('pa-team-chart'))+'</div>'+
      comparisonPanel):'')+
    panel('chats',
      '<div class="pa-grid-2 pa-report-grid">'+
      box(t('Исходящие по пингам','Outbound ping follow-up'),t('Поступившие за период · результат на дату среза','Received in period · outcomes as of the snapshot'),slot('pa-ping-path'))+
      box(t('Входящие диалоги','Incoming conversations'),t('Группировка по первому сообщению клиента','Grouped by first customer message'),'<div class="pa-quality pa-report-metrics" id="pa-chats-metrics"></div>'+slot('pa-chats-chart'))+'</div>'+
      '<div class="pa-grid-2 pa-report-grid">'+
      box(t('Динамика пингов','Ping activity over time'),t('По дате создания пинга. Последующие действия наблюдаем до среза.','By ping creation date. Follow-up is observed through the snapshot.'),slot('pa-pings-chart'))+
      box(t('Распределение времени первого ответа','First reply time distribution'),t('Интервалы в минутах · по дате первого ответа','Minutes per interval · by date of the first reply'),slot('pa-reply-distribution'))+'</div>'+
      '<details class="pa-box pa-report-box pa-interaction-details" id="pa-interaction-details"><summary>'+t('Диалоги и исходящие','Conversations and outreach')+'</summary><div class="pa-list-controls"><label>'+t('Показать','Show')+'<select class="form-control" id="pa-interaction-filter"><option value="incoming">'+t('Все поступившие диалоги','All incoming conversations')+'</option><option value="answered">'+t('Диалоги с первым ответом','Conversations with a first reply')+'</option><option value="unanswered">'+t('Диалоги без ответа к срезу','Unanswered conversations at snapshot')+'</option><option value="sent">'+t('Первые ответы за период','First replies sent in period')+'</option><option value="ping-outbound">'+t('Исходящие по пингам','Ping outreach')+'</option></select></label><p id="pa-interaction-count" aria-live="polite"></p></div><div class="pa-table-scroll" id="v2-interactions-table"></div><div id="pa-interaction-pages" class="pa-list-pages"></div></details>'+
      (mode==='agent'?comparisonPanel:''))+
    panel('funnel',
      box(t('Путь клиента','Customer journey'),t('Отдельные входы из чатов и пингов. Числа по шагам могут включать одни и те же пары.','Chats and pings have separate entry points. The same pairs can appear in more than one step.'),slot('pa-journey'))+
      box(t('Переход к оплате за 30 дней','Paid conversion within 30 days'),t('Две когорты с разными датами входа. База в каждой доле указана отдельно.','Two cohorts with different entry dates. Each ratio has its own denominator.'),slot('v2-conversions')))+
    panel('consultations',
      box(t('Платные консультации','Paid consultations'),t('Дата первого положительного подтверждённого списания за сеанс','Date of first confirmed positive debit for the consultation'),'<div class="pa-quality pa-report-metrics" id="pa-consultations-metrics"></div>'+slot('pa-consultations-chart'))+
      '<div class="pa-grid-2 pa-report-grid">'+box(t('Повторные консультации','Repeat consultations'),t('30 дней с первой платной консультации пары клиент—анкета','30 days from the first paid consultation of each customer–profile pair'),slot('v2-retention'))+
      box(t('Качество обслуживания','Service quality'),t('За выбранный период','For the selected period'),'<div class="pa-quality" id="v2-quality"></div>'+slot('pa-consultations-missing'))+'</div>')+
    panel('finance',
      box(t(mode==='agent'?'Мои начисления':'Финансы за период',mode==='agent'?'My earnings':'Finances for the period'),t('Суммы в кредитах · за выбранный период','Credit amounts · selected period'),'<div class="pa-quality pa-report-metrics" id="pa-finance-metrics"></div>'+slot('pa-finance-chart')+slot('pa-finance-detail')))+
    '<dialog id="detail-dialog"><div class="pa-dialog-head"><h3 id="detail-title"></h3><button type="button" class="pa-close" id="detail-close" aria-label="'+t('Закрыть','Close')+'">×</button></div><div id="detail-content"></div><div class="pa-dialog-actions"><button type="button" class="btn btn-default" id="detail-done">'+t('Закрыть','Close')+'</button></div></dialog>';
  const details={
    chats:[t('Новые диалоги','New conversations'),t('Первое содержательное сообщение клиента в паре клиент—анкета. Оно может прийти в ответ на исходящее агента по пингу. Повторные сообщения той же пары не создают новый диалог в отчёте.','The first substantive message from the customer to the profile. It may be a reply to the agent’s outbound ping follow-up. Further messages from that pair do not create another conversation in the report.')],
    paid:[t('Платные консультации','Paid consultations'),t('Консультации с первым подтверждённым списанием кредитов за услугу в выбранный период. Пополнение не считается консультацией.','Consultations with the first confirmed credit debit for the service in the selected period. A top-up is not a consultation.')],
    conversion:[t('Перешли к оплате','Converted to paid'),t('Из пар клиент—анкета с первым ответом агента в выбранный период: консультация той же анкеты после ответа и в пределах 30 дней. В долю входят пары с полностью завершённым периодом наблюдения.','Of customer–profile pairs with a first agent reply in the period: a consultation for the same profile was paid after that reply within 30 days. The rate includes only pairs with completed observation windows.')],
    repeats:[t('Первые возвраты','First returns'),t('Вторая оплаченная консультация пары клиент—анкета в 30-дневном окне. Учитывается по дате списания и у исполнителя второй консультации.','The second paid session for a customer–profile pair within 30 days. Counted by debit date and attributed to the second session’s provider.')],
    responses:[t('Обращения с ответом','Conversations answered'),t('Доля поступивших обращений, на которые клиент получил ответ любого агента. Пинги без сообщения клиента не учитываются.','Share of incoming conversations that received a reply from any agent. Pings without a customer message are excluded.')],
    accrual:[t('Начислено','Accrued'),t('Пример начислений в кредитах по фактическому исполнителю. Действующая ставка и права требуют отдельной проверки.','Illustrative credit accrual by actual performer. The actual rate and access require verification.')]
  };
  function applyPreset(value) {
    if(value==='prev'){opt.from=minskStart('2026-10-01');opt.to=minskStart('2026-10-31');}
    if(value==='30'){opt.from=minskStart('2026-10-18');opt.to=minskStart('2026-11-16');}
    if(value==='7'){opt.from=minskStart('2026-11-10');opt.to=minskStart('2026-11-16');}
  }
  function tableFor(rows) {
    if(!rows.length)return '<p class="pa-empty">'+t('Нет данных за выбранный период','No data for the selected period')+'</p>';
    const columns=[['name',mode==='manager'&&grouping==='agents'?t('Агент','Agent'):t('Анкета','Profile')],['chats',t('Новые диалоги','New conversations')],['answers',t('С ответом','Answered')],['replies',t('Первые ответы','First replies')],['median',t('Медиана, мин','Median, min')],['pingReplies',t('Ответы на исходящие','Outbound reply rate')],['conversion',t('Оплата после ответа, 30 дней','Paid after reply, 30 days')],['paid',t('Консультации','Consultations')],['repeats',t('Первые возвраты','First returns')],['clients',t('Клиенты','Customers')]];
    const ratio=(value,base)=>base?value/base:null;
    const sortValue=(r,key)=>key==='answers'?ratio(r.answers,r.responseBase):key==='pingReplies'?ratio(r.pingReplies,r.pingSent):key==='conversion'?ratio(r.conversion.n,r.conversion.d):r[key];
    rows.sort((a,b)=>{
      const x=sortValue(a,sortKey),y=sortValue(b,sortKey);
      if(x===null||y===null)return Number(x===null)-Number(y===null);
      return (typeof x==='string'?x.localeCompare(y):x-y)*(sortDesc?-1:1);
    });
    const tableRate=(value,base)=>base?Math.round(value/base*100)+'% · '+fmt(value)+' / '+fmt(base):'— · 0 / 0';
    const groupHead='<tr class="pa-column-groups"><th aria-hidden="true"></th><th scope="colgroup" colspan="2">'+t('По получателю','By recipient')+'</th><th scope="colgroup" colspan="7">'+t('По исполнителю','By performer')+'</th></tr>';
    const nameCell=r=>r.agent?'<button type="button" class="pa-agent-filter" data-select-agent="'+r.agent+'">'+r.name+'</button>':'<strong>'+r.name+'</strong>';
    const body=rows.map(r=>'<tr><td>'+nameCell(r)+(r.note?'<br><small>'+r.note+'</small>':'')+'</td><td>'+fmt(r.chats)+'</td><td>'+tableRate(r.answers,r.responseBase)+'</td><td>'+fmt(r.replies)+'</td><td>'+(r.median===null?'—':fmt(r.median))+'</td><td>'+tableRate(r.pingReplies,r.pingSent)+'</td><td>'+tableRate(r.conversion.n,r.conversion.d)+'</td><td>'+fmt(r.paid)+'</td><td>'+fmt(r.repeats)+'</td><td>'+fmt(r.clients)+'</td></tr>').join('');
    return '<table class="table"><colgroup span="1"></colgroup><colgroup span="2"></colgroup><colgroup span="7"></colgroup><thead>'+groupHead+'<tr>'+columns.map(c=>'<th scope="col"'+(c[0]===sortKey?' aria-sort="'+(sortDesc?'descending':'ascending')+'"':'')+'><button type="button" class="pa-sort" data-sort="'+c[0]+'">'+c[1]+' '+(c[0]===sortKey?(sortDesc?'↓':'↑'):'↕')+'</button></th>').join('')+'</tr></thead><tbody>'+body+'</tbody></table>';
  }
  function comparisonRow(name,note,result,agent){
    return {name,note,chats:result.events.length,answers:result.answered,responseBase:result.responseBase,replies:result.replied.length,median:result.medianReply,
      pingReplies:result.pingPath.performedResponded,pingSent:result.pingPath.resolvedPerformedResponses,paid:result.paid.length,repeats:result.performedRepeats.length,
      clients:result.clients,conversion:result.conversion,agent};
  }
  function associated(p,agent){
    return agent==='all'||p.owner===agent||data.contacts.some(x=>x.profile===p.id&&(x.agent===agent||x.replyAgent===agent))||
      data.sessions.some(x=>x.profile===p.id&&x.agent===agent)||data.pings.some(x=>x.profile===p.id&&(x.agent===agent||x.writer===agent));
  }
  function associatedInPeriod(p,agent){
    return agent==='all'||p.owner===agent||data.contacts.some(x=>x.profile===p.id&&(
      (x.agent===agent&&inPeriod(x.time,opt.from,opt.to))||
      (x.replyAgent===agent&&replyTime(x)!==null&&inPeriod(replyTime(x),opt.from,opt.to))
    ))||data.sessions.some(x=>x.profile===p.id&&x.agent===agent&&inPeriod(x.time,opt.from,opt.to))||
      data.pings.some(x=>x.profile===p.id&&((x.agent===agent&&inPeriod(x.time,opt.from,opt.to))||(x.writer===agent&&inPeriod(x.writtenAt,opt.from,opt.to))));
  }
  function syncProfileOptions() {
    if(mode!=='manager')return;
    const selected=e('v2-agent').value,select=e('v2-profile');
    [...select.options].forEach(o=>{if(o.value!=='all')o.disabled=!associated(profiles.find(p=>p.id===o.value),selected);});
    if(select.selectedOptions[0].disabled)select.value='all';
  }
  function qualityItem(label,value,description=''){
    return '<div><span>'+label+'</span><strong>'+value+'</strong>'+(description?'<small>'+description+'</small>':'')+'</div>';
  }
  function columnChart(bins,series,unit,label){
    const covered=bin=>periodCoverage(bin.from,bin.to,firstSample,AS_OF).status!=='outside';
    if(!bins.some(covered))return '<p class="pa-empty">'+t('Этот период вне демонстрационной выборки.','The selected period is outside the sample dataset.')+'</p>';
    const start=bins[0].from, end=bins.at(-1).to+DAY-1;
    const partial=start<firstSample||end>AS_OF;
    const coverage=partial?'<p class="pa-note">'+t('Учтена доступная часть периода: ','Available portion of the period: ')+instant(Math.max(start,firstSample))+' — '+instant(Math.min(end,AS_OF))+' · Europe/Minsk</p>':'';
    const totalMax=Math.max(0,...bins.flatMap(bin=>series.map(([key])=>bin[key])));
    if(!totalMax)return '<p class="pa-empty">'+t('В доступных данных за этот период значения равны 0.','All values in the available data for this period are zero.')+'</p>'+coverage;
    const expectedStep=totalMax/4;
    const magnitude=10**Math.floor(Math.log10(expectedStep));
    const step=Math.max(1,[1,2,5,10].find(n=>n*magnitude>=expectedStep)*magnitude);
    const scale=4*step;
    const keys=series.map(([key,title,color])=>'<span><i class="pa-chart-key '+color+'" aria-hidden="true"></i>'+title+'</span>').join('');
    const ticks=[4,3,2,1,0].map(n=>'<span>'+fmt(step*n)+'</span>').join('');
    return '<figure class="pa-column-chart"><figcaption class="pa-chart-caption"><div class="pa-chart-legend">'+keys+'</div><span class="pa-chart-unit">'+unit+'</span></figcaption>'+
      '<div class="pa-chart-view" tabindex="0" role="region" aria-label="'+label+'"><div class="pa-chart-axis" aria-hidden="true">'+ticks+'</div>'+
      '<ol class="pa-chart-groups" role="list">'+bins.map(bin=>{
        const start=date(bin.from).slice(0,5), end=date(bin.to).slice(0,5);
        const valueLabel=covered(bin)?series.map(([key,title])=>title+': '+fmt(bin[key])).join(' · '):t('Вне выборки','Outside sample');
        const fullPeriod=date(bin.from)+(bin.from===bin.to?'':' — '+date(bin.to));
        return '<li class="pa-chart-group" aria-label="'+fullPeriod+' · '+valueLabel+'" title="'+fullPeriod+' · '+valueLabel+'"><span class="pa-chart-bars" aria-hidden="true">'+
          (covered(bin)?series.map(([key,,color])=>'<i class="'+color+'" style="--pa-fill:'+(bin[key]/scale*100)+'%"></i>').join(''):'<span class="pa-chart-unavailable">—</span>')+
          '</span><span class="pa-chart-date" aria-hidden="true">'+start+(start===end?'':'<br>– '+end)+'</span></li>';
      }).join('')+'</ol></div>'+coverage+
      '<details class="pa-chart-values"><summary>'+t('Значения графика','Chart values')+'</summary><div class="pa-table-scroll"><table class="table"><thead><tr><th scope="col">'+t('Даты','Dates')+'</th>'+series.map(([,title])=>'<th scope="col">'+title+'</th>').join('')+'</tr></thead><tbody>'+
      bins.map(bin=>'<tr><th scope="row">'+date(bin.from)+(bin.from===bin.to?'':' — '+date(bin.to))+'</th>'+series.map(([key])=>'<td>'+(covered(bin)?fmt(bin[key]):'—')+'</td>').join('')+'</tr>').join('')+
      '</tbody></table></div></details></figure>';
  }
  function meterRows(rows,maximum){
    return '<ul class="pa-meter-list">'+rows.map(({label,value,text,color='pa-tone-1'})=>
      '<li><div><span>'+label+'</span><strong>'+text+'</strong></div>'+
      (value===null?'':'<span class="pa-meter-track" aria-hidden="true"><i class="'+color+'" style="--pa-fill:'+(maximum?value/maximum*100:0)+'%"></i></span>')+'</li>').join('')+'</ul>';
  }
  function compareRate(n,d){
    if(!d) return {value:null,text:t('Нет базы','No observations')};
    const value=100*n/d;
    const sensitivity=Math.round(1000/d)/10;
    return {
      value,
      text:fmt(Math.round(value))+'% · '+fmt(n)+' / '+fmt(d)+
        ' · '+t('1 случай = ','1 case = ')+fmt(sensitivity)+t(' п. п.',' pp'),
    };
  }
  function renderCharts(){
    const bins=periodBins(data,opt);
    const activity=[['incoming',t('Входящие диалоги','Incoming conversations'),'pa-tone-1'],['paid',t('Платные консультации','Paid consultations'),'pa-tone-2']];
    const units=t('Количество','Count');
    e('pa-summary-chart').innerHTML=columnChart(bins,activity,units,t('Динамика входящих и консультаций','Incoming conversations and consultations over time'));
    e('pa-chats-chart').innerHTML=columnChart(bins,[activity[0],['answered',t('Из них с ответом','Of those, answered'),'pa-tone-2']],t('Диалоги','Conversations'),t('Динамика входящих диалогов','Incoming conversation trend'));
    e('pa-pings-chart').innerHTML=columnChart(bins,[
      ['pings',t('Поступили','Received'),'pa-tone-1'],
      ['pingContacted',t('Написали','Contacted'),'pa-tone-2'],
      ['pingResponded',t('Клиент ответил','Customer replied'),'pa-tone-3']
    ],t('Пинги','Pings'),t('Динамика пингов','Ping activity over time'));
    e('pa-consultations-chart').innerHTML=columnChart(bins,[['paid',activity[1][1],'pa-tone-1'],['repeats',t('Из них первые возвраты','Of those, first returns'),'pa-tone-2']],t('Сеансы','Sessions'),t('Динамика консультаций','Consultation trend'));
    const credits=[['accrual',t(mode==='agent'?'Мои начисления':'Начисления агентам',mode==='agent'?'My earnings':'Agent earnings'),'pa-tone-1']];
    if(mode==='manager')credits.push(['debit',t('Списания','Debits'),'pa-tone-2'],['topups',t('Пополнения','Top-ups'),'pa-tone-3']);
    e('pa-finance-chart').innerHTML=columnChart(bins,credits,t('Кредиты','Credits'),t('Динамика кредитов','Credit activity over time'));
    if(mode==='manager')renderTeamChart();
  }
  function renderTeamChart(){
    const metric=e('pa-team-selector').value||'median';
    const shows=agents.filter(a=>(opt.agent==='all'||opt.agent===a.id)&&(opt.profile==='all'||associatedInPeriod(profiles.find(p=>p.id===opt.profile),a.id)));
    const measurements={
      median:result=>({value:result.medianReply,text:result.medianReply===null?t('Нет ответов','No replies'):fmt(result.medianReply)+' '+t('мин','min')+' · '+t('ответов: ','replies: ')+fmt(result.replySamples)}),
      conversion:result=>compareRate(result.conversion.n,result.conversion.d),
      ping:result=>compareRate(result.pingPath.performedResponded,result.pingPath.resolvedPerformedResponses),
      paid:result=>({value:result.paid.length,text:fmt(result.paid.length)+' · '+t('сеансов','sessions')}),
      repeats:result=>({value:result.performedRepeats.length,text:fmt(result.performedRepeats.length)+' / '+fmt(result.paid.length)+' · '+t('из платных сеансов','of paid sessions')}),
    };
    const rows=shows.map(a=>{
      const result=calculate(data,{...opt,agent:a.id});
      return {label:a.name,...measurements[metric](result)};
    });
    const ratioMetric=metric==='conversion'||metric==='ping';
    const scale=ratioMetric?100:Math.max(1,...rows.map(row=>row.value??0));
    const note=ratioMetric?t('Чем меньше база, тем сильнее один случай меняет процент.','Smaller samples are more sensitive to a single case.'):'';
    const transfer=opt.profile==='a'||opt.profile==='f';
    const handover=transfer&&inPeriod(day(45),opt.from,opt.to)
      ?'<p class="pa-note">'+t('Анкета передана ','Profile transferred ')+date(day(45))+'. '+t('Обращения и действия учитываются по участникам на дату события.','Contacts and actions follow the people involved on each event date.')+'</p>':'';
    e('pa-team-chart').innerHTML=rows.length?meterRows(rows,scale)+handover+(note?'<p class="pa-note">'+note+'</p>':''):'<p class="pa-empty">'+t('Нет данных за выбранный период','No data for the selected period')+'</p>';
  }
  function renderJourney(x){
    const missing=t('Нет данных','No data');
    const rate=(numerator,base)=>(base?fmt(Math.round(numerator/base*100))+'%':'—')+' · '+fmt(numerator)+' / '+fmt(base);
    const steps=[
      [t('Интерес к анкете','Profile interest'),missing,'',t('Просмотры анкет отсутствуют в выборке. Пинги учтены на следующем шаге.','Profile views are unavailable in this sample. Pings are counted at the next step.')],
      [t('Контакт','Contact'),t('Входящие: ','Inbound: ')+fmt(x.events.length),t('Пинги: ','Pings: ')+fmt(x.pingPath.acquired)+' · '+t('первые исходящие: ','first outbound messages: ')+fmt(x.pingPath.performed),t('Входящие считаются по первому сообщению клиента в паре. Поступившие пинги считаются по дате создания, первые исходящие — по дате отправки и автору.','Inbound counts use the customer’s first message to a profile. Received pings use creation date, and first outbound messages use send date and author.')],
      [t('Общение','Conversation'),t('Входящие с ответом: ','Inbound answered: ')+rate(x.answered,x.responseBase),t('Ответы на исходящие по пингам: ','Replies to ping outreach: ')+rate(x.pingPath.performedResponded,x.pingPath.resolvedPerformedResponses),t('Доля входящих с ответом считается среди поступивших в период диалогов. Доля ответов на пинги считается среди первых исходящих, отправленных в период. Обе доли наблюдаются до среза.','The inbound share uses conversations that arrived in the period. The ping reply share uses first outreach messages sent in the period. Both are observed through the snapshot.')],
      [t('Запрос','Request'),missing,'',t('События запросов на платный чат отсутствуют в выборке.','The sample contains no paid chat request events.')],
      [t('Подключение','Connection'),missing,'',t('События подключения к платному чату отсутствуют в выборке. Пробные консультации: нет данных.','The sample contains no paid chat connection events. Trial consultations: no data.')],
      [t('Платная консультация','Paid consultation'),fmt(x.paid.length),t('Сеансы с первым положительным списанием','Sessions with a first positive debit'),t('В период входит один сеанс на ID с первым подтверждённым положительным списанием.','Each session ID is counted once by its first confirmed positive debit.')],
      [t('Повторная платная консультация','Repeat paid consultation'),fmt(x.performedRepeats.length),t('Первые возвраты по дате второго сеанса','First returns by date of the second session'),t('Считается вторая оплаченная консультация пары клиент—анкета в течение 30 дней после первой. Возврат учитывается у исполнителя второго сеанса.','The second paid consultation for a customer–profile pair within 30 days of the first. The return is attributed to the provider of the second session.'),true],
    ];
    e('pa-journey').innerHTML='<ol class="pa-journey">'+steps.map(([title,value,sub,description,returns])=>'<li><details><summary><span>'+title+'</span><strong>'+value+'</strong>'+(sub?'<small>'+sub+'</small>':'')+'</summary><p>'+description+'</p>'+(returns?'<button type="button" class="btn btn-default pa-journey-link" data-go-tab="consultations">'+t('Консультации и возвраты','Consultations and returns')+'</button>':'')+'</details></li>').join('')+'</ol>'+
      '<p class="pa-note">'+t('Шаги описывают путь клиента. Их числа имеют разные базы, поэтому переходы между ними здесь не рассчитываются.','The steps describe the customer journey. They use different denominators, so no step-to-step rates are shown here.')+'</p>';
  }
  function renderReplyDistribution(x){
    const labels=['0–5','>5–15','>15–30','>30'];
    const counts=replyDistribution(x);
    e('pa-reply-distribution').innerHTML=(x.replySamples?meterRows(counts.map((value,i)=>({label:labels[i]+' '+t('мин','min'),value,text:fmt(value)+' / '+fmt(x.replySamples)})),x.replySamples)
      :'<p class="pa-empty">'+t('За период нет первых ответов для распределения.','There are no first replies in the selected period.')+'</p>')+
      '<p class="pa-note">'+t('Время последующих ответов: нет данных.','Subsequent reply times: no data.')+'</p>';
  }
  function workScope(agentId){
    const agent=agents.find(a=>a.id===agentId);
    const scope=agent?agent.name+t(' · все закреплённые сейчас анкеты',' · all currently assigned profiles'):t('Вся команда · все текущие анкеты','Entire team · all current profiles');
    return scope+' · '+t('16 ноября, 15:00 Минск','16 November, 15:00 Minsk');
  }
  function renderWork(){
    const work=summarizeWork(data,opt.agent);
    e('pa-work-scope').textContent=workScope(opt.agent);
    const age=work.oldest===null?t('Очередь пуста','Queue is empty'):t('Самое долгое ожидание: ','Oldest waiting: ')+fmt(work.oldest)+' '+t('мин','min');
    const counter=(type,count,label,note)=>'<button class="pa-work-item pa-work-queue-trigger" type="button" data-open-work-queue="'+type+'" aria-haspopup="dialog"><strong>'+fmt(count)+'</strong><span>'+label+'</span><small>'+note+'</small></button>';
    e('pa-work-summary').innerHTML='<div class="pa-work pa-current-counts">'+
      counter('chats',work.pending,t('Диалоги ждут ответа','Conversations awaiting reply'),age)+
      counter('pings',work.pings,t('Пинги в очереди','Pings in queue'),t('Ожидают первого исходящего','Awaiting first outreach'))+'</div>';
    const today=work.today;
    e('pa-today-summary').innerHTML=qualityItem(t('Первые ответы','First replies sent'),fmt(today.replied.length+today.unknownReplies.length))+
      qualityItem(t('Время первого ответа','First reply time'),today.medianReply===null?'—':fmt(today.medianReply)+' '+t('мин','min'),t('медиана · ответов: ','median · replies: ')+fmt(today.replySamples))+
      qualityItem(t('Платные консультации','Paid consultations'),fmt(today.paid.length));
  }
  function renderTeamQueue(){
    if(mode!=='manager')return;
    const queue=agents.map(agent=>({agent,work:summarizeWork(data,agent.id)})).filter(row=>row.work.pending||row.work.pings)
      .sort((a,b)=>(b.work.oldest??-1)-(a.work.oldest??-1)||b.work.pending-a.work.pending||b.work.pings-a.work.pings);
    e('v2-queue').innerHTML=queue.length?queue.map(({agent,work})=>'<div class="pa-team-queue-row">'+
      '<button class="pa-agent-filter" type="button" data-select-agent="'+agent.id+'" aria-label="'+t('Аналитика агента: ','Analytics for agent: ')+agent.name+'">'+agent.name+'</button>'+
      '<div><span>'+t('Чаты: ','Chats: ')+fmt(work.pending)+' · '+t('Пинги: ','Pings: ')+fmt(work.pings)+'</span>'+
      (work.oldest===null?'':'<small>'+t('Самое долгое ожидание: ','Oldest waiting: ')+fmt(work.oldest)+' '+t('мин','min')+'</small>')+'</div>'+
      '<button type="button" class="btn btn-default pa-team-queue-action" data-open-work-queue="both" data-queue-agent="'+agent.id+'" aria-haspopup="dialog" aria-label="'+t('Очередь агента: ','Queue for agent: ')+agent.name+'">'+t('Очередь','Queue')+'</button></div>').join(''):'<p class="pa-empty">'+t('Очередь пуста','Queue is empty')+'</p>';
  }
  function workQueueEntries(kind,agentId){
    const rows=kind==='chats'?data.pending:data.pings.filter(p=>p.open);
    return rows.filter(row=>agentId==='all'||row.agent===agentId)
      .map(row=>({...row,age:kind==='chats'?row.age:Math.floor((AS_OF-row.time)/60000)}))
      .sort((a,b)=>b.age-a.age||a.id.localeCompare(b.id));
  }
  function openWorkQueue(trigger){
    const agentId=trigger.dataset.queueAgent||opt.agent;
    const kinds=trigger.dataset.openWorkQueue==='both'?['chats','pings']:[trigger.dataset.openWorkQueue];
    const title=kind=>kind==='chats'?t('Диалоги ждут ответа','Conversations awaiting reply'):t('Пинги в очереди','Pings in queue');
    const dialog=e('pa-work-queue-dialog');
    e('pa-work-queue-title').textContent=kinds.length===2?t('Текущая очередь','Current queue'):title(kinds[0]);
    e('pa-work-queue-scope').textContent=workScope(agentId)+' · '+t('Условные данные','Sample data');
    e('pa-work-queue-content').innerHTML=kinds.map(kind=>{
      const entries=workQueueEntries(kind,agentId);
      const list=entries.map(row=>{
        const profile=profiles.find(p=>p.id===row.profile).name;
        const owner=agentId==='all'?' · '+agents.find(a=>a.id===row.agent).name:'';
        const label=kind==='chats'?t('Диалог №','Conversation #')+row.id:t('Пинг №','Ping #')+row.id.replace('open-ping','');
        return '<li><span><strong>'+label+'</strong><small>'+profile+owner+'</small></span><span>'+fmt(row.age)+' '+t('мин','min')+'</span></li>';
      }).join('');
      return '<section><h4>'+title(kind)+' · '+fmt(entries.length)+'</h4>'+
        (list?'<ul class="pa-work-queue-list">'+list+'</ul>':'<p class="pa-empty">'+t('Очередь пуста','Queue is empty')+'</p>')+'</section>';
    }).join('');
    dialog.showModal();
    e('pa-work-queue-close').focus();
    dialog.addEventListener('close',()=>{if(trigger.isConnected)trigger.focus();},{once:true});
  }
  root.addEventListener('click',event=>{
    const open=event.target.closest('[data-open-work-queue]');
    if(open)openWorkQueue(open);
    if(event.target.closest('[data-close-work-queue]'))e('pa-work-queue-dialog').close();
  });
  function compareKpis(x){
    const span=opt.to-opt.from+DAY;
    const endsToday=AS_OF>=opt.to&&AS_OF<opt.to+DAY;
    const cutoff=AS_OF-span;
    const prior={...opt,from:opt.from-span,to:opt.to-span,asOf:cutoff,through:endsToday?cutoff:undefined};
    const priorCoverage=periodCoverage(prior.from,prior.to,firstSample,prior.asOf);
    const currentCoverage=coverage();
    const complete=(endsToday?priorCoverage.start===prior.from&&currentCoverage.start===opt.from:priorCoverage.status==='full'&&currentCoverage.status==='full');
    e('pa-comparison-period').textContent=complete
      ? t('Сравнение с предыдущим равным периодом: ','Compared with the preceding period of the same length: ')+date(prior.from)+' — '+date(prior.to)+(endsToday?t(' · последний день до 15:00 в обеих выборках',' · final day through 15:00 in both periods'):'')
      : t('Предыдущий сопоставимый период вне выборки','The preceding comparable period is outside the dataset');
    const y=complete?calculate(data,prior):null;
    const noComparison=t('Нет сопоставимой базы','No comparable base');
    const delta=(v,unit)=>{
      if(v===null)return noComparison;
      const rounded=Math.round(v*10)/10;
      return (rounded>0?'+':rounded<0?'−':'')+fmt(Math.abs(rounded))+(unit?' '+unit:'');
    };
    const replyChange=y&&x.responseBase&&y.responseBase?100*(x.answered/x.responseBase-y.answered/y.responseBase):null;
    const conversionChange=y&&x.conversion.d&&y.conversion.d?100*(x.conversion.n/x.conversion.d-y.conversion.n/y.conversion.d):null;
    return {
      chats:delta(y?x.events.length-y.events.length:null,'')+(y?' · '+t('было ','was ')+fmt(y.events.length):''),
      response:delta(replyChange,t('п. п.','pp'))+(y&&y.responseBase?' · '+t('было ','was ')+fmt(y.answered)+' / '+fmt(y.responseBase):''),
      paid:delta(y?x.paid.length-y.paid.length:null,'')+(y?' · '+t('было ','was ')+fmt(y.paid.length):''),
      conversion:delta(conversionChange,t('п. п.','pp'))+(y&&y.conversion.d?' · '+t('было ','was ')+fmt(y.conversion.n)+' / '+fmt(y.conversion.d):''),
      repeats:delta(y?x.performedRepeats.length-y.performedRepeats.length:null,'')+(y?' · '+t('было ','was ')+fmt(y.performedRepeats.length):''),
      accrual:delta(y?x.accrual-y.accrual:null,t('кред.','credits'))+(y?' · '+t('было ','was ')+fmt(y.accrual):''),
    };
  }
  function render(){
    renderWork();
    const x=calculate(data,opt), p=profiles.find(z=>z.id===opt.profile), a=agents.find(z=>z.id===opt.agent);
    e('v2-context').textContent=date(opt.from)+' — '+date(opt.to)+' · Europe/Minsk · '+(a?a.name:t('Все агенты','All agents'))+' · '+(p?p.name:allProfilesLabel);
    const reportCoverage=coverage();
    root.classList.toggle('pa-outside',reportCoverage.status==='outside');
    root.querySelectorAll('.pa-report-empty').forEach(message=>{
      message.hidden=reportCoverage.status!=='outside';
    });
    const coverageLabel=e('pa-coverage');
    coverageLabel.hidden=reportCoverage.status==='full';
    coverageLabel.textContent=reportCoverage.status==='outside'
      ?t('Доступные данные: ','Available data: ')+instant(firstSample)+' — '+instant(AS_OF)
      :t('Доступная часть периода: ','Available part of period: ')+instant(reportCoverage.start)+' — '+instant(reportCoverage.end);
    if(mode==='manager') e('pa-back-team').hidden=!comparisonScope;
    const changes=compareKpis(x);
    e('v2-kpis').innerHTML=kpi('comments-o',t('Входящие диалоги','Incoming conversations'),fmt(x.events.length),t('первое сообщение клиента','first customer message'),'chats',changes.chats,'chats')+
      kpi('reply',t('Входящие с ответом','Incoming with a reply'),x.responseBase?Math.round(x.answered/x.responseBase*100)+'%':'—',fmt(x.answered)+' / '+fmt(x.responseBase),'responses',changes.response,'chats')+
      kpi('commenting-o',t('Платные консультации','Paid consultations'),fmt(x.paid.length),t('Клиентов: ','Customers: ')+fmt(x.clients),'paid',changes.paid,'consultations')+
      kpi('exchange',t('Перешли к оплате','Converted to paid'),x.conversion.d?valueRatio(x.conversion):'—',fmt(x.conversion.n)+' / '+fmt(x.conversion.d)+' · '+t('после ответа','after first reply'),'conversion',changes.conversion,'funnel')+
      kpi('repeat',t('Первые возвраты','First returns'),fmt(x.performedRepeats.length),t('по дате второго сеанса','by date of second session'),'repeats',changes.repeats,'consultations')+
      kpi('credit-card',t(mode==='agent'?'Мои начисления':'Начисления агентам',mode==='agent'?'My earnings':'Agent earnings'),fmt(x.accrual)+' '+t('кред.','credits'),amountDate,'accrual',changes.accrual,'finance');
    const rows=[];
    if(mode==='manager'&&grouping==='agents'){
      agents.filter(a=>(opt.agent==='all'||a.id===opt.agent)&&(opt.profile==='all'||associatedInPeriod(profiles.find(p=>p.id===opt.profile),a.id))).forEach(a=>{const y=calculate(data,Object.assign({},opt,{agent:a.id}));rows.push(comparisonRow(a.name,t('Сейчас: ','Current: ')+profiles.filter(p=>p.owner===a.id).map(p=>p.name).join(', '),y,a.id));});
      e('v2-table-title').textContent=t('Результаты агентов','Agent performance');
      e('v2-table-sub').textContent=t('Обращения по получателю, ответы и консультации по исполнителю','Incoming conversations by recipient, replies and consultations by performer');
    }else{
      profiles.filter(p=>(mode==='manager'||p.owner==='k')&&associatedInPeriod(p,opt.agent)&&(opt.profile==='all'||opt.profile===p.id)).forEach(p=>{const y=calculate(data,Object.assign({},opt,{profile:p.id}));rows.push(comparisonRow(p.name,'',y));});
      e('v2-table-title').textContent=t('Результаты анкет','Profile performance');
      e('v2-table-sub').textContent=mode==='agent'&&opt.profile==='all'
        ?t('Здесь показаны только закреплённые сейчас анкеты. Общие личные итоги выше учитывают и работу по прежним анкетам.','This table shows currently assigned profiles. Your personal totals above also include past work on former profiles.')
        :mode==='manager'&&opt.agent==='all'?t('История анкет по всем исполнителям','Profile history across performers'):t('Результаты в выбранной области','Results in the selected scope');
    }
    e('v2-table').innerHTML=tableFor(rows)+(x.unknownReplies.length?'<p class="pa-note">'+t('Первые ответы без известного автора: ','First replies with unknown author: ')+fmt(x.unknownReplies.length)+'</p>':'');
    document.querySelectorAll('[data-group]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.group===grouping)));
    const rating=x.reviews.length?(x.reviews.reduce((n,r)=>n+r.rating,0)/x.reviews.length).toFixed(1).replace('.',en?'.':','):'—';
    e('v2-quality').innerHTML='<div><span>'+t('Первый ответ','First reply')+'</span><strong>'+(x.medianReply===null?'—':fmt(x.medianReply)+' '+t('мин','min'))+'</strong><small>'+t('медиана · диалогов: ','median · conversations: ')+fmt(x.replySamples)+'</small></div><div><span>'+t('Средняя оценка','Average rating')+'</span><strong>'+rating+(x.reviews.length?' / 5':'')+'</strong><small>'+t('оценок: ','ratings: ')+fmt(x.reviews.length)+'</small></div><div><span>'+t('Жалобы','Complaints')+'</span><strong>'+fmt(x.complaints.length)+'</strong><small>'+t('за выбранный период','in the selected period')+'</small></div>';
    const orderNote=count=>count?' '+t('Случаев с неустановленным порядком событий вне расчёта: ','Cases excluded because event order could not be determined: ')+fmt(count)+'.':'';
    const unknownNote=x.unknownReplies.length?' '+t('В командную когорту включены подтверждённые ответы без автора: ','The team cohort includes confirmed replies with an unknown author: ')+fmt(x.unknownReplies.length)+'.':'';
    e('v2-conversions').innerHTML=card(t('После первого ответа','After the first reply'),x.conversion,t('Вход — дата первого ответа агента. Из пар клиент—анкета: оплаченная консультация той же анкеты в следующие 30 дней.','Entry: date of the first agent reply. Customer–profile pairs with a paid consultation for that profile in the next 30 days.')+unknownNote+orderNote(x.ambiguousSequence.reply))+
      card(t('Первая оплата на сайте после первого входящего','First site payment after the first incoming message'),x.firstPlatform,t('Результат относится к получателю первого сообщения. Консультацию в течение 30 дней может провести другой агент или другая анкета.','Attributed to the recipient of the first message. The consultation within 30 days may be handled by another agent or profile.')+orderNote(x.ambiguousSequence.platform))+
      '<p class="pa-note"><button type="button" class="btn btn-default" data-go-tab="consultations">'+t('Сеансы по фактическому исполнителю','Sessions by actual performer')+'</button></p>';
    const retentionScope=p?p.name:mode==='agent'?t('Закреплённые анкеты','Assigned profiles'):t('Вся команда','Entire team');
    e('v2-retention').innerHTML=(x.repeatApplicable
      ?card(t('Вернулись к той же анкете','Returned to the same profile')+' · '+retentionScope,x.repeat,t('Вход — дата первой оплаченной консультации пары клиент—анкета. Процент рассчитывается по анкетам независимо от исполнителя.','Entry: first paid consultation date for each customer–profile pair. The return rate covers the profiles across providers.')+orderNote(x.ambiguousSequence.repeat))
      :'<p class="pa-note">'+t('Чтобы увидеть 30-дневную долю возврата команды или анкеты, выберите «Все агенты».','Select “All agents” to see the 30-day return rate for the team or profile.')+'</p>')+
      '<div class="pa-inline-metric"><span>'+t(mode==='agent'?'Первые возвраты, которые я провёл':'Проведённые первые возвраты',mode==='agent'?'First returns I handled':'First returns handled')+'</span><strong>'+fmt(x.performedRepeats.length)+'</strong></div><p class="pa-note">'+t('Вторая оплаченная консультация пары за 30 дней учитывается по дате её оплаты у фактического исполнителя. Начисления относятся к тому же исполнителю.','The pair’s second paid consultation within 30 days is counted by its debit date for the provider who performed it. Accrual belongs to the same provider.')+orderNote(x.ambiguousSequence.repeatPerformer)+'</p>';
    const ping=x.pingPath;
    const pingTiming=pingResponseTiming(data.pings,opt);
    const pingRate=(value,base)=>base?Math.round(value/base*100)+'% · '+fmt(value)+' / '+fmt(base):'—';
    const pingRow=(label,value)=>'<div class="pa-inline-metric"><span>'+label+'</span><strong>'+value+'</strong></div>';
    e('v2-retention').innerHTML+=pingRow(t('Возврат на платформу за 30 дней','30-day platform return'),t('Источник и расчёт уточняются','Source and calculation to be confirmed'));
    e('pa-consultations-missing').innerHTML=pingRow(t('Пробные консультации','Trial consultations'),t('Нет данных','No data'))+
      pingRow(t('Причины завершения сеансов','Session end reasons'),t('Нет данных','No data'));
    const incomingPingRows=[
      {label:t('Поступившие пинги за период','Incoming pings in period'),value:ping.acquired,text:fmt(ping.acquired)},
      {label:t('По этим пингам написали клиенту','Customers contacted after these pings'),value:ping.contacted,text:pingRate(ping.contacted,ping.acquired),color:'pa-tone-2'},
      {label:t('Клиент ответил на исходящее','Customers replied to these messages'),value:ping.responded,text:pingRate(ping.responded,ping.resolvedContactResponses),color:'pa-tone-3'},
    ];
    e('pa-ping-path').innerHTML=meterRows(incomingPingRows,ping.acquired)+
      pingRow(t('Без исходящего к срезу','No outreach by snapshot'),fmt(ping.acquired-ping.contacted-ping.unknownContact))+
      (ping.unknownContact?pingRow(t('Не удалось связать с исходящим','Could not link outreach'),fmt(ping.unknownContact)):'')+
      pingRow(t('До первого исходящего по этим пингам','Time to first outreach for these pings'),pingTiming.count
        ?t('Медиана: ','Median: ')+(pingTiming.medianMinutes>=60?fmt(pingTiming.medianMinutes/60)+' '+t('ч','h'):fmt(pingTiming.medianMinutes)+' '+t('мин','min'))+' · '+t('пингов: ','pings: ')+fmt(pingTiming.count)
        :t('Нет данных','No data'))+
      pingRow(t(mode==='agent'?'Мои первые исходящие по пингам за период':'Первые исходящие по пингам за период',mode==='agent'?'My first outbound messages after pings in period':'First outbound messages after pings in period'),fmt(ping.performed))+
      pingRow(t('Ответы на эти исходящие','Customer replies to this outreach'),pingRate(ping.performedResponded,ping.resolvedPerformedResponses))+
      '<button type="button" class="btn btn-default" data-go-tab="chats" data-interaction="ping-outbound">'+t('Посмотреть исходящие','View outreach')+'</button>'+
      '<p class="pa-note">'+t('Каждая отдельная запись пинга учитывается один раз. Ответы на исходящие наблюдаем с момента отправки до даты среза. Исходящие за период считаются по дате сообщения и его автору.','Each distinct ping is counted once. We observe customer replies from outbound send time through the snapshot. Outbound messages in the period are counted by send date and author.')+'</p>';
    const financeNote=mode==='agent'
      ?t('В демоданных начисления сгруппированы по дате первой оплаты консультации. Даты операций начисления отсутствуют.','In the sample dataset, earnings are grouped by the consultation’s first debit date. Accrual transaction dates are unavailable.')
      :t('Списания и начисления учитываются по консультациям выбранного исполнителя и анкеты. В демоданных начисления сгруппированы по дате первой оплаты консультации. Пополнения показаны по связанным клиентам и дате пополнения. Один клиент может войти в выборку нескольких агентов, поэтому их суммы пополнений не складываются.','Debits and earnings follow sessions for the selected provider and profile. In the sample dataset, earnings are grouped by each consultation’s first debit date. Top-ups follow linked customers and their top-up date. The same customer can be included for several agents, so their top-up totals do not add up to the team total.');
    e('pa-finance-detail').innerHTML=pingRow(t('Выплаты','Payouts'),t('Нет данных','No data'))+'<p class="pa-note">'+financeNote+'</p>';
    const creditsUnit=' '+t('кред.','credits');
    e('pa-finance-metrics').innerHTML=qualityItem(t(mode==='agent'?'Мои начисления':'Начисления агентам',mode==='agent'?'My earnings':'Agent earnings'),fmt(x.accrual)+creditsUnit,amountDate)+
      (mode==='manager'?qualityItem(t('Списания за консультации','Session debits'),fmt(x.debit)+creditsUnit)+qualityItem(t('Пополнения связанных клиентов','Top-ups by linked customers'),fmt(x.topupAmount)+creditsUnit,t('Могут учитываться у нескольких агентов','May appear under multiple agents'))
        :qualityItem(t('Платные консультации','Paid consultations'),fmt(x.paid.length))+qualityItem(t('Оплаченные минуты','Paid minutes'),fmt(x.minutes)));
    const median=x.medianReply===null?'—':fmt(x.medianReply)+' '+t('мин','min');
    e('pa-chats-metrics').innerHTML=qualityItem(t('Диалоги','Conversations'),fmt(x.events.length))+
      qualityItem(t('С ответом','Answered'),x.responseBase?Math.round(x.answered/x.responseBase*100)+'%':'—',fmt(x.answered)+' / '+fmt(x.responseBase))+
      qualityItem(t('Без ответа к срезу','Unanswered at snapshot'),fmt(x.responseBase-x.answered))+
      (x.ambiguousReplyOrderIds.length?qualityItem(t('Неизвестен порядок ответа','Reply order unknown'),fmt(x.ambiguousReplyOrderIds.length)):'')+
      qualityItem(t('Первый ответ','First reply'),median,t('медиана','median'));
    e('pa-consultations-metrics').innerHTML=qualityItem(t('Сеансы','Sessions'),fmt(x.paid.length))+
      qualityItem(t('Клиенты','Customers'),fmt(x.clients),t('впервые оплатили: ','first-time payers: ')+fmt(x.firstPaid))+
      qualityItem(t('Оплаченные минуты','Paid minutes'),fmt(x.minutes));
    renderInteractions(x);
    renderJourney(x);
    renderReplyDistribution(x);
    renderCharts();
    activateTab(tab);
  }
  function renderInteractions(result=calculate(data,opt)){
    const isOutreach=interactionFilter==='ping-outbound';
    let selection;
    if(isOutreach){
      const sent=selectPings(data.pings,opt).performed;
      const visible=sent.filter(({ping})=>mode==='manager'||profiles.some(p=>p.id===ping.profile&&p.owner===opt.agent));
      selection={total:sent.length,rows:visible.sort((a,b)=>b.ping.writtenAt-a.ping.writtenAt)};
    } else {
      selection=chatSelection(result,interactionFilter);
    }
    const pageSize=12;
    const lastPage=Math.max(0,Math.ceil(selection.rows.length/pageSize)-1);
    interactionPage=Math.min(interactionPage,lastPage);
    const offset=interactionPage*pageSize;
    const ints=selection.rows.slice(offset,offset+pageSize);
    const shown=selection.rows.length<selection.total
      ?t('Доступно ','Available: ')+fmt(selection.rows.length)+' / '+fmt(selection.total)+' · '+t('История прежних анкет входит в итог.','The total includes work on former profiles.')
      :(isOutreach?t('Исходящих: ','Outbound: '):t('Диалогов: ','Conversations: '))+fmt(selection.total);
    e('pa-interaction-count').textContent=shown;
    const interactionHead=isOutreach
      ?[t('Пинг','Ping'),t('Анкета','Profile'),t('Исходящее','Outbound sent'),t('Автор','Author'),t('Ответ клиента','Customer reply')]
      :[t('Поступило','Received'),t('Клиент','Customer'),t('Анкета','Profile'),t('Получатель','Recipient'),t('Первый ответ','First reply'),t('Ответил','Replied by'),t('Ожидание','Wait')];
    e('v2-interactions-table').innerHTML=ints.length?'<table class="table"><thead><tr>'+interactionHead.map(label=>'<th scope="col">'+label+'</th>').join('')+'</tr></thead><tbody>'+ints.map(c=>{
      if(isOutreach){
        const {ping,responded}=c;
        const profile=profiles.find(p=>p.id===ping.profile).name;
        const author=agents.find(a=>a.id===ping.writer)?.name||t('Автор не установлен','Author unknown');
        const response=responded?instant(ping.respondedAt):t('Без ответа к срезу','Unanswered at snapshot');
        return '<tr><td>'+instant(ping.time)+'</td><td>'+profile+'</td><td>'+instant(ping.writtenAt)+'</td><td>'+author+'</td><td>'+response+'</td></tr>';
      }
      const reply=c.replyObservedAt;
      const customer=c.source==='ping'
        ?t('Клиент','Customer')+' '+c.client.replace('ping-client','')+'<br><small>'+t('Ответ на пинг','Reply to a ping')+'</small>'
        :t('Клиент','Customer')+' '+c.client.replace(/^(c|today-client)/,'');
      const wait=reply===null?'—':fmt(Math.round((reply-c.time)/6000)/10)+' '+t('мин','min');
      return '<tr><td>'+instant(c.time)+'</td><td>'+customer+'</td><td>'+profiles.find(p=>p.id===c.profile).name+'</td><td>'+agents.find(a=>a.id===c.agent).name+'</td><td>'+(reply===null?'—':instant(reply))+'</td><td>'+(reply===null?'—':(agents.find(a=>a.id===c.replyAgent)?.name||t('Автор не установлен','Author unknown')))+'</td><td>'+wait+'</td></tr>';
    }).join('')+'</tbody></table>':'<p class="pa-empty">'+t('В этой выборке нет доступных записей.','There are no accessible entries in this selection.')+'</p>';
    e('pa-interaction-pages').innerHTML=lastPage?'<button type="button" class="btn btn-default" data-interaction-step="-1"'+(!interactionPage?' disabled':'')+'>'+t('Назад','Previous')+'</button><span>'+fmt(offset+1)+'–'+fmt(offset+ints.length)+' / '+fmt(selection.rows.length)+'</span><button type="button" class="btn btn-default" data-interaction-step="1"'+(interactionPage===lastPage?' disabled':'')+'>'+t('Дальше','Next')+'</button>':'';
  }
  function activateTab(name){
    tab=name;
    root.classList.toggle('pa-overview-active',name==='summary');
    for(const [id] of tabs){
      const active=id===tab;
      e('v2-'+id).hidden=!active;
      const button=e('tab-'+id);
      button.setAttribute('aria-selected',String(active));
      button.tabIndex=active?0:-1;
    }
  }
  e('pa-filter-toggle').addEventListener('click',()=>{
    const button=e('pa-filter-toggle');
    const opening=button.getAttribute('aria-expanded')==='false';
    button.setAttribute('aria-expanded',String(opening));
    root.classList.toggle('pa-mobile-filters-open',opening);
  });
  const workSection=root.querySelector('.pa-current');
  workSection.id='pa-current-section';
  const workToggle=e('pa-work-toggle');
  workToggle.addEventListener('click',()=>{
    const opening=workToggle.getAttribute('aria-expanded')==='false';
    workToggle.setAttribute('aria-expanded',String(opening));
    root.classList.toggle('pa-mobile-work-open',opening);
  });
  e('pa-interaction-filter').addEventListener('change',()=>{
    interactionFilter=e('pa-interaction-filter').value;
    interactionPage=0;
    renderInteractions();
  });
  e('v2-period').addEventListener('change',()=>{const show=e('v2-period').value==='custom';e('v2-from-wrap').hidden=!show;e('v2-to-wrap').hidden=!show;});
  e('v2-filters').addEventListener('submit',ev=>{ev.preventDefault();e('v2-error').hidden=true;const choice=e('v2-period').value;
    if(choice==='custom'){const from=minskStart(e('v2-from').value),to=minskStart(e('v2-to').value);if(!Number.isFinite(from)||!Number.isFinite(to)||from>to||to>AS_OF){e('v2-error').textContent=t('Проверьте даты: начало не позже конца, конец не позже 16.11.2026.','Check dates: start must precede end, and end must be no later than 16 November 2026.');e('v2-error').hidden=false;return;}opt.from=from;opt.to=to;}else applyPreset(choice);
    opt.profile=e('v2-profile').value;if(mode==='manager')opt.agent=e('v2-agent').value;interactionPage=0;render();});
  e('v2-reset').addEventListener('click',()=>{e('v2-period').value='prev';e('v2-profile').value='all';if(mode==='manager')e('v2-agent').value='all';e('v2-from-wrap').hidden=true;e('v2-to-wrap').hidden=true;e('v2-error').hidden=true;opt.profile='all';opt.agent=mode==='agent'?'k':'all';applyPreset('prev');render();});
  root.addEventListener('click',ev=>{
    const b=ev.target.closest('button');if(!b)return;
    if(b.dataset.tab)activateTab(b.dataset.tab);
    if(b.dataset.goTab){
      activateTab(b.dataset.goTab);
      if(b.dataset.interaction&&coverage().status!=='outside'){
        interactionFilter=b.dataset.interaction;
        interactionPage=0;
        e('pa-interaction-filter').value=interactionFilter;
        const details=e('pa-interaction-details');
        details.open=true;
        renderInteractions();
        details.querySelector('summary').focus();
      } else {
        e('v2-'+b.dataset.goTab).focus();
      }
    }
    if(b.dataset.interactionStep){
      interactionPage+=Number(b.dataset.interactionStep);
      renderInteractions();
      const pages=e('pa-interaction-pages');
      (pages.querySelector('button:not([disabled])[data-interaction-step="'+b.dataset.interactionStep+'"]')||pages.querySelector('button:not([disabled])'))?.focus();
    }
    if(b.id==='pa-back-team'&&comparisonScope){
      const previous=comparisonScope;
      comparisonScope=null;
      e('v2-agent').value=previous.agent;
      syncProfileOptions();
      e('v2-profile').value=previous.profile;
      opt.agent=previous.agent;
      opt.profile=previous.profile;
      grouping=previous.grouping;
      sortKey=previous.sortKey;
      sortDesc=previous.sortDesc;
      tab='team';
      render();
      e('tab-team').focus();
    }
    if(b.dataset.group){grouping=b.dataset.group;sortKey='name';sortDesc=false;render();}
    if(b.dataset.sort){const key=b.dataset.sort;if(sortKey===key)sortDesc=!sortDesc;else{sortKey=key;sortDesc=false;}render();root.querySelector('[data-sort="'+key+'"]')?.focus();}
    if(b.dataset.selectAgent){
      if(tab==='team') comparisonScope={agent:opt.agent,profile:opt.profile,grouping,sortKey,sortDesc};
      grouping='agents';
      e('v2-agent').value=b.dataset.selectAgent;
      syncProfileOptions();
      opt.agent=b.dataset.selectAgent;
      opt.profile=e('v2-profile').value;
      tab='summary';
      render();
      e('v2-summary').focus();
    }
    if(b.dataset.detail){const d=details[b.dataset.detail];if(d){openedBy=b;e('detail-title').textContent=d[0];e('detail-content').textContent=d[1];e('detail-dialog').showModal();}}
  });
  root.querySelectorAll('[data-tab]').forEach(button=>{
    button.addEventListener('keydown',ev=>{
      const tabs=[...root.querySelectorAll('[data-tab]')],i=tabs.indexOf(button);
      let j=i;
      if(ev.key==='ArrowRight')j=(i+1)%tabs.length;
      else if(ev.key==='ArrowLeft')j=(i+tabs.length-1)%tabs.length;
      else if(ev.key==='Home')j=0;
      else if(ev.key==='End')j=tabs.length-1;
      else return;
      ev.preventDefault();activateTab(tabs[j].dataset.tab);tabs[j].focus();
    });
  });
  function closeDialog(){e('detail-dialog').close();if(openedBy&&openedBy.isConnected)openedBy.focus();}
  e('detail-close').addEventListener('click',closeDialog);e('detail-done').addEventListener('click',closeDialog);
  e('detail-dialog').addEventListener('close',()=>{if(openedBy&&openedBy.isConnected)openedBy.focus();});
  if(mode==='manager'){
    e('v2-agent').addEventListener('change',syncProfileOptions);
    e('pa-team-selector').addEventListener('change',renderTeamChart);
  }
  document.querySelectorAll('[data-preview-sidebar]').forEach(b=>b.addEventListener('click',ev=>{ev.preventDefault();document.body.classList.toggle('sidebar-collapse');document.body.classList.toggle('sidebar-open');}));
  renderTeamQueue();
  render();
})();
