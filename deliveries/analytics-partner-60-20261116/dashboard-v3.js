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
      for(let x=0;x<(i%3)+1;x++) pending.push({profile:p.id,agent:p.owner,age:5+i*4+x*3});
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
  function summarizePings(pings,opt) {
    const leads=new Map(), writtenEvents=new Set(), responseEvents=new Set();
    const observedThrough=snapshotTime(opt);
    for(const ping of pings.filter(p=>p.id&&Number.isFinite(p.time)&&p.time<=observedThrough).sort((a,b)=>a.time-b.time)){
      if(leads.has(ping.id))continue;
      const writtenEvent=ping.writtenEventId??ping.id;
      const responseEvent=ping.responseEventId??ping.id;
      const written=Boolean(ping.writer)&&Number.isFinite(ping.writtenAt)&&ping.writtenAt>ping.time&&ping.writtenAt<=observedThrough&&!writtenEvents.has(writtenEvent);
      const responded=written&&Number.isFinite(ping.respondedAt)&&ping.respondedAt>ping.writtenAt&&ping.respondedAt<=observedThrough&&!responseEvents.has(responseEvent);
      if(written)writtenEvents.add(writtenEvent);
      if(responded)responseEvents.add(responseEvent);
      leads.set(ping.id,{ping,written,responded});
    }
    const matchesProfile=ping=>opt.profile==='all'||ping.profile===opt.profile;
    const matchesAgent=agent=>opt.agent==='all'||agent===opt.agent;
    const available=[...leads.values()];
    const acquired=available.filter(({ping})=>matchesProfile(ping)&&matchesAgent(ping.agent)&&reportTime(ping.time,opt));
    const contacted=acquired.filter(lead=>lead.written);
    const performed=available.filter(({ping,written})=>matchesProfile(ping)&&matchesAgent(ping.writer)&&written&&reportTime(ping.writtenAt,opt));
    return {acquired:acquired.length,contacted:contacted.length,responded:contacted.filter(lead=>lead.responded).length,
      performed:performed.length,performedResponded:performed.filter(lead=>lead.responded).length};
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
      return time!==null&&time>=x.time&&time<=observedThrough?time:null;
    };
    const contacts=data.contacts.filter(c=>c.time<=observedThrough);
    const firstContacts=new Map();
    contacts.slice().sort((a,b)=>a.time-b.time).forEach(c=>{const key=pairKey(c);if(!firstContacts.has(key))firstContacts.set(key,c);});
    const sessionById=new Map();
    data.sessions.filter(s=>Number(s.debit)>0&&s.confirmed===true&&s.time<=observedThrough).slice().sort((a,b)=>a.time-b.time).forEach(s=>{if(!sessionById.has(s.id))sessionById.set(s.id,s);});
    const sessions=[...sessionById.values()];
    const events=[...firstContacts.values()].filter(x=>scope(x)&&selectedTime(x.time));
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
    const platformByPerson=new Map();
    [...firstContacts.values()].sort((a,b)=>a.time-b.time).forEach(c=>{if(!platformByPerson.has(c.client))platformByPerson.set(c.client,c);});
    const platformEntries=[...platformByPerson.values()].filter(c=>scope(c)&&selectedTime(c.time));
    const ambiguousPlatform=platformEntries.filter(c=>firstPaid.get(c.client)?.time===c.time).length;
    const newPlatform=platformEntries.filter(c=>!firstPaid.has(c.client)||firstPaid.get(c.client).time>c.time);
    const platformAged=newPlatform.filter(aged);
    const firstPlatform=platformAged.filter(c=>{const s=firstPaid.get(c.client);return s&&s.time>c.time&&s.time<=c.time+30*DAY;});
    const firstRepeat=[];
    for(const first of firstPair.values()){
      const next=sessions.find(s=>pairKey(s)===pairKey(first)&&s.id!==first.id&&s.time>first.time&&s.time<=first.time+30*DAY);
      if(next)firstRepeat.push({first,next});
    }
    const repeatBase=[...firstPair.values()].filter(s=>detailAllowed(s.profile)&&profileOK(s.profile)&&selectedTime(s.time));
    const repeatAged=repeatBase.filter(aged);
    const repeatIds=new Set(firstRepeat.map(row=>row.first.id));
    const returned=repeatAged.filter(first=>repeatIds.has(first.id));
    const performedRepeats=firstRepeat.map(row=>row.next).filter(s=>scope(s)&&selectedTime(s.time));
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
      answered:events.filter(x=>observedReply(x)!==null).length,
      conversion:{n:converted,d:matureReplies.length-ambiguousReply,waiting:answeredContacts.length-matureReplies.length},
      firstPlatform:{n:firstPlatform.length,d:platformAged.length,waiting:newPlatform.length-platformAged.length},
      ambiguousSequence:{reply:ambiguousReply,platform:ambiguousPlatform},
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
  if (typeof module!=='undefined'&&module.exports) module.exports={calculate,demoData,AS_OF,DAY,minskStart,inPeriod,summarizePings,summarizeWork};
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
  let tab='summary', grouping='agents', sortKey='name', sortDesc=false, openedBy=null;
  const fmt=n=>new Intl.NumberFormat(en?'en-US':'ru-RU').format(n);
  const date=n=>new Intl.DateTimeFormat(en?'en-GB':'ru-RU',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'Europe/Minsk'}).format(new Date(n));
  const valueRatio=q=>q.d?Math.round(q.n/q.d*100)+'%':t('Недостаточно данных','Not enough data');
  const ratioDetail=q=>q.d?fmt(q.n)+' / '+fmt(q.d):t('Нет завершённых периодов наблюдения','No completed observation periods');
  const e=id=>document.getElementById(id);
  const kpi=(icon,title,value,sub,detail,comparison)=>'<button type="button" class="pa-kpi" data-detail="'+detail+'"><span class="pa-icon"><i class="fa fa-'+icon+'" aria-hidden="true"></i></span><span class="pa-kpi-text"><span class="pa-kpi-name">'+title+'</span><strong class="pa-kpi-value">'+value+'</strong><span class="pa-kpi-sub">'+sub+'</span><span class="pa-kpi-compare">'+comparison+'</span></span><span class="pa-kpi-arrow" aria-hidden="true">ⓘ</span></button>';
  const card=(title,obj,explain)=>'<div class="pa-cohort-card"><div class="pa-cohort-title">'+title+'</div><div class="pa-cohort-number"><strong>'+valueRatio(obj)+'</strong><span>'+ratioDetail(obj)+'</span></div><div class="pa-cohort-detail">'+explain+'</div><div class="pa-cohort-detail">'+t('Окно ещё открыто: ','Window still open: ')+fmt(obj.waiting)+'</div></div>';
  const allProfilesLabel=mode==='agent'?t('Все мои результаты','All my results'):t('Все доступные анкеты','All available profiles');
  const conversionsPanel='<section class="pa-box"><div class="pa-box-head"><div><h3>'+t('Платные консультации за 30 дней','Paid consultations within 30 days')+'</h3><p>'+t('Период определяет дату входа каждой группы','The period selects each cohort’s entry date')+'</p></div></div><div id="v2-conversions"></div></section>';
  const pingsPanel='<section class="pa-box"><div class="pa-box-head"><div><h3>'+t('Исходящие · Работа с пингами','Outbound · Ping follow-up')+'</h3><p>'+t('Пинги за выбранный период · результат на дату среза','Pings in the selected period · outcomes as of the snapshot')+'</p></div></div><div id="pa-ping-path"></div></section>';
  const pathPanels='<div class="pa-grid-2 pa-path-grid">'+(mode==='agent'?pingsPanel+conversionsPanel:conversionsPanel+pingsPanel)+'</div>';
  const comparisonPanel='<section class="pa-box pa-table-box"><div class="pa-box-head"><div><h3 id="v2-table-title"></h3><p id="v2-table-sub"></p></div>'+(mode==='manager'?'<div class="pa-switch"><button type="button" data-group="agents">'+t('По агентам','By agent')+'</button><button type="button" data-group="profiles">'+t('По анкетам','By profile')+'</button></div>':'')+'</div><div class="pa-table-scroll" id="v2-table"></div></section>';
  const linkSuffix=en?'?lang=en&v=kpi-20261117':'?v=kpi-20261117';
  root.innerHTML=
    '<div class="pa-header"><div><h2>'+t(mode==='agent'?'Аналитика агента':'Аналитика команды',mode==='agent'?'Agent analytics':'Team analytics')+'</h2><p>'+t(mode==='agent'?'Текущие диалоги и результаты закреплённых анкет':'Текущая нагрузка и результаты агентов',mode==='agent'?'Open conversations and assigned profiles':'Current workload and agent performance')+'</p></div><div class="pa-role-nav"><span class="pa-preview-label">'+t('Макеты','Previews')+'</span><a '+(mode==='agent'?'aria-current="page"':'')+' href="paces-agent.html'+linkSuffix+'">'+t('Агент','Agent')+'</a><a '+(mode==='manager'?'aria-current="page"':'')+' href="paces-supervisor.html'+linkSuffix+'">'+t('Руководитель','Supervisor')+'</a><span class="pa-demo">'+t('Условные данные','Sample data')+'</span></div></div>'+
    '<section class="pa-current" aria-labelledby="pa-current-title"><div class="pa-section-head pa-current-heading"><div><h3 id="pa-current-title">'+t('Работа сейчас','Work now')+'</h3><p>'+t('Срез на 16 ноября, 15:00 · Минск','Snapshot on 16 November, 15:00 · Minsk')+'</p></div><a class="pa-work-link" target="_blank" rel="noopener" href="https://confideline.com/'+(en?'en':'ru')+'/admin/chat/v2?leadType=chats">'+t('Открыть Chat V2','Open Chat V2')+' <i class="fa fa-external-link" aria-hidden="true"></i></a></div><div class="pa-live-grid"><div id="pa-work-summary"></div>'+
    '<section class="pa-box pa-today" aria-labelledby="pa-today-title"><h4 id="pa-today-title">'+t('Сегодня','Today')+'</h4><div class="pa-quality" id="pa-today-summary"></div></section></div></section>'+
    '<div class="pa-toolbar"><div class="pa-tabs" role="tablist" aria-label="'+t('Раздел отчёта','Report section')+'"><button class="pa-tab" type="button" role="tab" data-tab="summary">'+t('Сводка','Overview')+'</button><button class="pa-tab" type="button" role="tab" data-tab="interactions">'+t('Взаимодействия','Interactions')+'</button><button class="pa-tab" type="button" role="tab" data-tab="charts">'+t('Графики','Charts')+'</button></div>'+
    '<form class="pa-filters" id="v2-filters"><label>'+t('Период','Period')+'<select id="v2-period" class="form-control"><option value="prev">'+t('Прошлый месяц','Previous month')+'</option><option value="30">'+t('Последние 30 дней','Last 30 days')+'</option><option value="7">'+t('Последние 7 дней','Last 7 days')+'</option><option value="custom">'+t('Выбрать даты','Custom dates')+'</option></select></label>'+
    '<label class="pa-custom" id="v2-from-wrap" hidden>'+t('С','From')+'<input id="v2-from" class="form-control" type="date" value="2026-10-01"></label><label class="pa-custom" id="v2-to-wrap" hidden>'+t('По','To')+'<input id="v2-to" class="form-control" type="date" value="2026-10-31"></label>'+
    (mode==='manager'?'<label>'+t('Агент','Agent')+'<select id="v2-agent" class="form-control"><option value="all">'+t('Все агенты','All agents')+'</option>'+agents.map(a=>'<option value="'+a.id+'">'+a.name+'</option>').join('')+'</select></label>':'')+
    '<label>'+t('Анкета','Profile')+'<select id="v2-profile" class="form-control"><option value="all">'+allProfilesLabel+'</option>'+profiles.filter(p=>mode==='manager'||p.owner==='k').map(p=>'<option value="'+p.id+'">'+p.name+'</option>').join('')+'</select></label>'+
    '<button class="btn btn-primary" type="submit">'+t('Применить','Apply')+'</button><button class="btn btn-default" type="button" id="v2-reset">'+t('Сбросить','Reset')+'</button><div class="pa-error" id="v2-error" role="alert" hidden></div></form><p class="pa-context" id="v2-context" aria-live="polite"></p></div>'+
    '<section id="v2-summary" role="tabpanel">'+
    '<div class="pa-section-head"><div><h3>'+t('Результаты за период','Results for the period')+'</h3><p id="pa-comparison-period"></p></div></div><div class="pa-kpis" id="v2-kpis"></div>'+
    (mode==='manager'?'<section class="pa-box pa-team-queue" aria-labelledby="pa-queue-title"><div class="pa-box-head"><h4 id="pa-queue-title">'+t('Очередь по агентам','Queue by agent')+'</h4></div><div id="v2-queue"></div></section>':'')+
    (mode==='manager'?comparisonPanel+pathPanels:pathPanels+comparisonPanel)+
    '<section class="pa-box pa-quality-box"><div class="pa-box-head"><div><h3>'+t('Качество обслуживания','Service quality')+'</h3><p>'+t('За выбранный период','For the selected period')+'</p></div></div><div class="pa-quality" id="v2-quality"></div></section>'+
    '<div class="pa-grid-2"><section class="pa-box"><div class="pa-box-head"><div><h3>'+t('Повторные консультации','Repeat consultations')+'</h3><p>'+t('30 дней с первой платной консультации пары клиент—анкета','30 days from the first paid consultation of each customer–profile pair')+'</p></div></div><div id="v2-retention"></div></section><section class="pa-box"><h3 class="pa-finance-title">'+t('Финансы за период','Finances for the period')+'</h3><div id="v2-finance"></div></section></div>'+
    '<p class="pa-source"><i class="fa fa-info-circle" aria-hidden="true"></i> '+t('Условные данные. Показатели и фильтры приведены для обсуждения.','Illustrative data. Metrics and filters are provided for discussion.')+'</p></section>'+
    '<section id="v2-interactions" role="tabpanel" hidden><div class="pa-box" style="margin-top:14px"><div class="pa-box-head"><div><h3>'+t('Взаимодействия','Interactions')+'</h3><p>'+t(mode==='agent'?'Диалоги по сейчас закреплённым анкетам за выбранный период':'Примеры диалогов за выбранный период',mode==='agent'?'Conversations for currently assigned profiles in the selected period':'Example conversations in the selected period')+'</p></div></div><div class="pa-table-scroll" id="v2-interactions-table"></div></div></section>'+
    '<section id="v2-charts" role="tabpanel" hidden><div class="pa-box" style="margin-top:14px"><div class="pa-box-head"><div><h3>'+t('Динамика консультаций','Consultation trend')+'</h3><p>'+t('Оплаченные консультации по датам первого списания','Paid consultations by first-debit date')+'</p></div></div><div class="pa-bar-chart" id="v2-chart"></div></div></section>'+
    '<dialog id="detail-dialog"><div class="pa-dialog-head"><h3 id="detail-title"></h3><button type="button" class="pa-close" id="detail-close" aria-label="'+t('Закрыть','Close')+'">×</button></div><div id="detail-content"></div><div class="pa-dialog-actions"><button type="button" class="btn btn-default" id="detail-done">'+t('Закрыть','Close')+'</button></div></dialog>';
  const details={
    chats:[t('Новые диалоги','New conversations'),t('Первое содержательное сообщение клиента в паре клиент—анкета. Оно может прийти в ответ на исходящее агента по пингу. Повторные сообщения той же пары не создают новый диалог в отчёте.','The first substantive message from the customer to the profile. It may be a reply to the agent’s outbound ping follow-up. Further messages from that pair do not create another conversation in the report.')],
    paid:[t('Платные консультации','Paid consultations'),t('Консультации с первым подтверждённым списанием кредитов за услугу в выбранный период. Пополнение не считается консультацией.','Consultations with the first confirmed credit debit for the service in the selected period. A top-up is not a consultation.')],
    conversion:[t('Перешли к оплате','Converted to paid'),t('Из пар клиент—анкета с первым ответом агента в выбранный период: консультация той же анкеты после ответа и в пределах 30 дней. В долю входят пары с полностью завершённым периодом наблюдения.','Of customer–profile pairs with a first agent reply in the period: a consultation for the same profile was paid after that reply within 30 days. The rate includes only pairs with completed observation windows.')],
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
    const columns=[['name',mode==='manager'&&grouping==='agents'?t('Агент','Agent'):t('Анкета','Profile')],['chats',t('Новые диалоги','New conversations')],['answers',t('С ответом','Answered')],['replies',t('Первые ответы','First replies')],['median',t('Медиана, мин','Median, min')],['pingReplies',t('Ответы на исходящие','Outbound reply rate')],['paid',t('Консультации','Consultations')],['repeats',t('Повторные за 30 дней','30-day repeat sessions')],['clients',t('Клиенты','Customers')],['debit',t('Списано, кред.','Debited, credits')],['accrual',t('Начислено, кред.','Accrued, credits')]];
    const ratio=(value,base)=>base?value/base:null;
    const sortValue=(r,key)=>key==='answers'?ratio(r.answers,r.chats):key==='pingReplies'?ratio(r.pingReplies,r.pingSent):r[key];
    rows.sort((a,b)=>{
      const x=sortValue(a,sortKey),y=sortValue(b,sortKey);
      if(x===null||y===null)return Number(x===null)-Number(y===null);
      return (typeof x==='string'?x.localeCompare(y):x-y)*(sortDesc?-1:1);
    });
    const tableRate=(value,base)=>base?Math.round(value/base*100)+'% · '+fmt(value)+' / '+fmt(base):'— · 0 / 0';
    const groupHead='<tr class="pa-column-groups"><th aria-hidden="true"></th><th scope="colgroup" colspan="2">'+t('По получателю','By recipient')+'</th><th scope="colgroup" colspan="6">'+t('По исполнителю','By performer')+'</th><th scope="colgroup" colspan="2">'+t('Финансы','Finances')+'</th></tr>';
    return '<table class="table"><colgroup span="1"></colgroup><colgroup span="2"></colgroup><colgroup span="6"></colgroup><colgroup span="2"></colgroup><thead>'+groupHead+'<tr>'+columns.map(c=>'<th scope="col"'+(c[0]===sortKey?' aria-sort="'+(sortDesc?'descending':'ascending')+'"':'')+'><button type="button" class="pa-sort" data-sort="'+c[0]+'">'+c[1]+' '+(c[0]===sortKey?(sortDesc?'↓':'↑'):'↕')+'</button></th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr><td><strong>'+r.name+'</strong>'+(r.note?'<br><small>'+r.note+'</small>':'')+'</td><td>'+fmt(r.chats)+'</td><td>'+tableRate(r.answers,r.chats)+'</td><td>'+fmt(r.replies)+'</td><td>'+(r.median===null?'—':fmt(r.median))+'</td><td>'+tableRate(r.pingReplies,r.pingSent)+'</td><td>'+fmt(r.paid)+'</td><td>'+fmt(r.repeats)+'</td><td>'+fmt(r.clients)+'</td><td>'+fmt(r.debit)+'</td><td>'+fmt(r.accrual)+'</td></tr>').join('')+'</tbody></table>';
  }
  function comparisonRow(name,note,result){
    return {name,note,chats:result.events.length,answers:result.answered,replies:result.replied.length,median:result.medianReply,
      pingReplies:result.pingPath.performedResponded,pingSent:result.pingPath.performed,paid:result.paid.length,repeats:result.performedRepeats.length,
      clients:result.clients,debit:result.debit,accrual:result.accrual};
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
  function renderWork(){
    const work=summarizeWork(data,mode==='agent'?'k':'all');
    const age=work.oldest===null?t('Очередь пуста','Queue is empty'):t('Самое долгое ожидание: ','Oldest waiting: ')+fmt(work.oldest)+' '+t('мин','min');
    e('pa-work-summary').innerHTML='<div class="pa-work pa-current-counts"><div class="pa-work-item"><strong>'+fmt(work.pending)+'</strong><span>'+t('диалогов ждут ответа','conversations awaiting a reply')+'</span><small>'+age+'</small></div><div class="pa-work-item"><strong>'+fmt(work.pings)+'</strong><span>'+t('пингов в очереди','pings in the queue')+'</span><small>'+t('Отдельно от входящих сообщений','Separate from incoming messages')+'</small></div></div>';
    const today=work.today;
    e('pa-today-summary').innerHTML=qualityItem(t('Первые ответы','First replies sent'),fmt(today.replied.length+today.unknownReplies.length))+
      qualityItem(t('Время первого ответа','First reply time'),today.medianReply===null?'—':fmt(today.medianReply)+' '+t('мин','min'),t('медиана · ответов: ','median · replies: ')+fmt(today.replySamples))+
      qualityItem(t('Платные консультации','Paid consultations'),fmt(today.paid.length));
    if(mode!=='manager')return;
    const queue=agents.map(agent=>({agent,work:summarizeWork(data,agent.id)})).filter(row=>row.work.pending)
      .sort((a,b)=>b.work.oldest-a.work.oldest||b.work.pending-a.work.pending);
    e('v2-queue').innerHTML=queue.length?queue.map(({agent,work})=>'<button class="pa-queue-row" type="button" data-select-agent="'+agent.id+'"><strong>'+agent.name+'</strong><span>'+fmt(work.pending)+' '+t('ждут ответа','awaiting reply')+'</span><small>'+t('Самое долгое ожидание: ','Oldest waiting: ')+fmt(work.oldest)+' '+t('мин','min')+'</small><i class="fa fa-angle-right" aria-hidden="true"></i></button>').join(''):'<p class="pa-empty">'+t('Нет ожидающих сообщений','No messages awaiting reply')+'</p>';
  }
  function compareKpis(x){
    const span=opt.to-opt.from+DAY;
    const endsToday=AS_OF>=opt.to&&AS_OF<opt.to+DAY;
    const cutoff=AS_OF-span;
    const prior={...opt,from:opt.from-span,to:opt.to-span,asOf:cutoff,through:endsToday?cutoff:undefined};
    const complete=prior.from>=minskStart(iso(day(99))) && opt.from>=minskStart(iso(day(99)));
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
    const replyChange=y&&x.events.length&&y.events.length?100*(x.answered/x.events.length-y.answered/y.events.length):null;
    const conversionChange=y&&x.conversion.d&&y.conversion.d?100*(x.conversion.n/x.conversion.d-y.conversion.n/y.conversion.d):null;
    return {
      chats:delta(y?x.events.length-y.events.length:null,'')+(y?' · '+t('было ','was ')+fmt(y.events.length):''),
      response:delta(replyChange,t('п. п.','pp'))+(y&&y.events.length?' · '+t('было ','was ')+fmt(y.answered)+' / '+fmt(y.events.length):''),
      paid:delta(y?x.paid.length-y.paid.length:null,'')+(y?' · '+t('было ','was ')+fmt(y.paid.length):''),
      conversion:delta(conversionChange,t('п. п.','pp'))+(y&&y.conversion.d?' · '+t('было ','was ')+fmt(y.conversion.n)+' / '+fmt(y.conversion.d):''),
    };
  }
  function render(){
    const x=calculate(data,opt), p=profiles.find(z=>z.id===opt.profile), a=agents.find(z=>z.id===opt.agent);
    e('v2-context').textContent=date(opt.from)+' — '+date(opt.to)+' · Europe/Minsk · '+(a?a.name:t('Все агенты','All agents'))+' · '+(p?p.name:allProfilesLabel);
    const changes=compareKpis(x);
    e('v2-kpis').innerHTML=kpi('comments-o',t('Входящие диалоги','Incoming conversations'),fmt(x.events.length),t('первое сообщение клиента','first customer message'),'chats',changes.chats)+
      kpi('reply',t('Входящие с ответом','Incoming with a reply'),x.events.length?Math.round(x.answered/x.events.length*100)+'%':'—',fmt(x.answered)+' / '+fmt(x.events.length),'responses',changes.response)+
      kpi('commenting-o',t('Платные консультации','Paid consultations'),fmt(x.paid.length),t('Клиентов: ','Customers: ')+fmt(x.clients),'paid',changes.paid)+
      kpi('exchange',t('Перешли к оплате','Converted to paid'),x.conversion.d?valueRatio(x.conversion):'—',fmt(x.conversion.n)+' / '+fmt(x.conversion.d)+' · '+t('после ответа','after first reply'),'conversion',changes.conversion);
    const rows=[];
    if(mode==='manager'&&grouping==='agents'){
      agents.filter(a=>(opt.agent==='all'||a.id===opt.agent)&&(opt.profile==='all'||associatedInPeriod(profiles.find(p=>p.id===opt.profile),a.id))).forEach(a=>{const y=calculate(data,Object.assign({},opt,{agent:a.id}));rows.push(comparisonRow(a.name,t('Сейчас: ','Current: ')+profiles.filter(p=>p.owner===a.id).map(p=>p.name).join(', '),y));});
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
      card(t('Первая платная консультация на сайте','First paid consultation on the site'),x.firstPlatform,t('Вход — дата первого сообщения клиента на сайте. Клиент учитывается у получателя этого сообщения. Первое списание за консультацию может быть по другой анкете и у другого исполнителя в течение 30 дней.','Entry: date of the customer’s first incoming message on the site. The cohort is attributed to that message’s recipient. The first consultation debit may be for another profile and provider within 30 days.')+orderNote(x.ambiguousSequence.platform));
    const retentionScope=p?p.name:mode==='agent'?t('Закреплённые анкеты','Assigned profiles'):t('Вся команда','Entire team');
    e('v2-retention').innerHTML=(x.repeatApplicable
      ?card(t('Вернулись к той же анкете','Returned to the same profile')+' · '+retentionScope,x.repeat,t('Вход — дата первой оплаченной консультации пары клиент—анкета. Процент рассчитывается по анкетам независимо от исполнителя.','Entry: first paid consultation date for each customer–profile pair. The return rate covers the profiles across providers.'))
      :'<p class="pa-note">'+t('Чтобы увидеть 30-дневную долю возврата команды или анкеты, выберите «Все агенты».','Select “All agents” to see the 30-day return rate for the team or profile.')+'</p>')+
      '<div class="pa-inline-metric"><span>'+t(mode==='agent'?'Первые возвраты, которые я провёл':'Проведённые первые возвраты',mode==='agent'?'First returns I handled':'First returns handled')+'</span><strong>'+fmt(x.performedRepeats.length)+'</strong></div><p class="pa-note">'+t('Вторая оплаченная консультация пары за 30 дней учитывается по дате её оплаты у фактического исполнителя. Начисления относятся к тому же исполнителю.','The pair’s second paid consultation within 30 days is counted by its debit date for the provider who performed it. Accrual belongs to the same provider.')+'</p>';
    const ping=x.pingPath;
    const pingRate=(value,base)=>base?Math.round(value/base*100)+'% · '+fmt(value)+' / '+fmt(base):'—';
    const pingRow=(label,value)=>'<div class="pa-inline-metric"><span>'+label+'</span><strong>'+value+'</strong></div>';
    e('pa-ping-path').innerHTML=pingRow(t('Поступившие пинги за период','Incoming pings in period'),fmt(ping.acquired))+
      pingRow(t('По этим пингам написали клиенту','Customers contacted after these pings'),pingRate(ping.contacted,ping.acquired))+
      pingRow(t('Клиент ответил на исходящее','Customers replied to these messages'),pingRate(ping.responded,ping.contacted))+
      pingRow(t(mode==='agent'?'Мои первые исходящие по пингам за период':'Первые исходящие по пингам за период',mode==='agent'?'My first outbound messages after pings in period':'First outbound messages after pings in period'),fmt(ping.performed))+
      '<p class="pa-note">'+t('Каждая отдельная запись пинга учитывается один раз. Ответы на исходящие наблюдаем с момента отправки до даты среза. Исходящие за период считаются по дате сообщения и его автору.','Each distinct ping is counted once. We observe customer replies from outbound send time through the snapshot. Outbound messages in the period are counted by send date and author.')+'</p>';
    e('v2-finance').innerHTML=pingRow(t('Первых платных клиентов за период','First-time paying customers in period'),fmt(x.firstPaid))+
      pingRow(t('Оплаченные минуты','Paid minutes'),fmt(x.minutes))+
      pingRow(t('Списано за консультации','Debited for consultations'),fmt(x.debit)+' '+t('кред.','credits'))+
      pingRow(t(mode==='agent'?'Мои начисления':'Начислено агентам',mode==='agent'?'My accruals':'Accrued to agents'),fmt(x.accrual)+' '+t('кред.','credits'))+
      pingRow(t('Пополнения клиентов','Customer top-ups'),fmt(x.topupAmount)+' '+t('кред.','credits'))+
      '<p class="pa-note">'+t('Пополнения показаны отдельно от оплаты консультаций и начислений агента.','Top-ups are separate from consultation payments and agent accruals.')+'</p>';
    const responseEvents=new Set(x.replied.concat(x.unknownReplies).map(c=>c.id));
    const latestEvent=c=>responseEvents.has(c.id)?c.replyObservedAt:c.time;
    const ints=x.detailRows.sort((a,b)=>latestEvent(b)-latestEvent(a)).slice(0,30);
    const interactionHead=[t('Поступило','Received'),t('Клиент','Customer'),t('Анкета','Profile'),t('Поступило агенту','Received by'),t('Первый ответ','First reply'),t('Ответил','Replied by')];
    e('v2-interactions-table').innerHTML=ints.length?'<table class="table"><thead><tr>'+interactionHead.map(label=>'<th scope="col">'+label+'</th>').join('')+'</tr></thead><tbody>'+ints.map(c=>{
      const reply=c.replyObservedAt;
      const customer=c.source==='ping'
        ?t('Клиент','Customer')+' '+c.client.replace('ping-client','')+'<br><small>'+t('Ответ на пинг','Reply to a ping')+'</small>'
        :t('Клиент','Customer')+' '+c.client.replace(/^(c|today-client)/,'');
      return '<tr><td>'+date(c.time)+'</td><td>'+customer+'</td><td>'+profiles.find(p=>p.id===c.profile).name+'</td><td>'+agents.find(a=>a.id===c.agent).name+'</td><td>'+(reply===null?'—':date(reply))+'</td><td>'+(reply===null?'—':(agents.find(a=>a.id===c.replyAgent)?.name||t('Автор не установлен','Author unknown')))+'</td></tr>';
    }).join('')+'</tbody></table>':'<p class="pa-empty">'+t('Нет данных за выбранный период','No data for the selected period')+'</p>';
    const counts=[], days=Math.round((opt.to-opt.from)/DAY)+1, bins=days<=14?days:8;
    for(let n=0;n<bins;n++){const lo=opt.from+Math.floor(days*n/bins)*DAY,hi=opt.from+Math.floor(days*(n+1)/bins)*DAY;const first=date(lo).slice(0,5),last=date(hi-DAY).slice(0,5);counts.push({label:first===last?first:first+'–'+last,count:x.paid.filter(s=>s.time>=lo&&s.time<hi).length});}
    const max=Math.max(1,...counts.map(c=>c.count));
    e('v2-chart').innerHTML=counts.map(c=>'<div class="pa-bar-col" title="'+c.label+': '+c.count+'"><strong>'+c.count+'</strong><i style="height:'+Math.max(1,c.count/max*115)+'px"></i><span>'+c.label+'</span></div>').join('');
    ['summary','interactions','charts'].forEach(name=>{e('v2-'+name).hidden=tab!==name;const b=document.querySelector('[data-tab="'+name+'"]');b.setAttribute('aria-selected',String(tab===name));});
  }
  e('v2-period').addEventListener('change',()=>{const show=e('v2-period').value==='custom';e('v2-from-wrap').hidden=!show;e('v2-to-wrap').hidden=!show;});
  e('v2-filters').addEventListener('submit',ev=>{ev.preventDefault();e('v2-error').hidden=true;const choice=e('v2-period').value;
    if(choice==='custom'){const from=minskStart(e('v2-from').value),to=minskStart(e('v2-to').value);if(!Number.isFinite(from)||!Number.isFinite(to)||from>to||to>AS_OF){e('v2-error').textContent=t('Проверьте даты: начало не позже конца, конец не позже 16.11.2026.','Check dates: start must precede end, and end must be no later than 16 November 2026.');e('v2-error').hidden=false;return;}opt.from=from;opt.to=to;}else applyPreset(choice);
    opt.profile=e('v2-profile').value;if(mode==='manager')opt.agent=e('v2-agent').value;render();});
  e('v2-reset').addEventListener('click',()=>{e('v2-period').value='prev';e('v2-profile').value='all';if(mode==='manager')e('v2-agent').value='all';e('v2-from-wrap').hidden=true;e('v2-to-wrap').hidden=true;e('v2-error').hidden=true;opt.profile='all';opt.agent=mode==='agent'?'k':'all';applyPreset('prev');render();});
  root.addEventListener('click',ev=>{
    const b=ev.target.closest('button');if(!b)return;
    if(b.dataset.tab){tab=b.dataset.tab;render();}
    if(b.dataset.group){grouping=b.dataset.group;sortKey='name';sortDesc=false;render();}
    if(b.dataset.sort){const key=b.dataset.sort;if(sortKey===key)sortDesc=!sortDesc;else{sortKey=key;sortDesc=false;}render();root.querySelector('[data-sort="'+key+'"]')?.focus();}
    if(b.dataset.selectAgent){tab='summary';grouping='agents';e('v2-agent').value=b.dataset.selectAgent;syncProfileOptions();opt.agent=b.dataset.selectAgent;opt.profile=e('v2-profile').value;render();e('v2-agent').focus();}
    if(b.dataset.detail){const d=details[b.dataset.detail];if(d){openedBy=b;e('detail-title').textContent=d[0];e('detail-content').textContent=d[1];e('detail-dialog').showModal();}}
  });
  root.querySelectorAll('[data-tab]').forEach(button=>{
    button.id='tab-'+button.dataset.tab;
    button.setAttribute('aria-controls','v2-'+button.dataset.tab);
    e('v2-'+button.dataset.tab).setAttribute('aria-labelledby',button.id);
    button.addEventListener('keydown',ev=>{
      const tabs=[...root.querySelectorAll('[data-tab]')],i=tabs.indexOf(button);
      let j=i;
      if(ev.key==='ArrowRight')j=(i+1)%tabs.length;
      else if(ev.key==='ArrowLeft')j=(i+tabs.length-1)%tabs.length;
      else if(ev.key==='Home')j=0;
      else if(ev.key==='End')j=tabs.length-1;
      else return;
      ev.preventDefault();tabs[j].click();tabs[j].focus();
    });
  });
  function closeDialog(){e('detail-dialog').close();if(openedBy&&openedBy.isConnected)openedBy.focus();}
  e('detail-close').addEventListener('click',closeDialog);e('detail-done').addEventListener('click',closeDialog);
  e('detail-dialog').addEventListener('close',()=>{if(openedBy&&openedBy.isConnected)openedBy.focus();});
  if(mode==='manager')e('v2-agent').addEventListener('change',syncProfileOptions);
  document.querySelectorAll('[data-preview-sidebar]').forEach(b=>b.addEventListener('click',ev=>{ev.preventDefault();document.body.classList.toggle('sidebar-collapse');document.body.classList.toggle('sidebar-open');}));
  renderWork();
  render();
})();
