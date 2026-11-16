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
  function demoData() {
    const contacts=[], sessions=[], topups=[], pending=[], pings=[],reviews=[],complaints=[];
    for (let i=0;i<120;i++) {
      const profile=profiles[i%profiles.length].id, client='c'+i;
      const start=day(5+(i*13)%100), author=ownerAt(profile,start), hasContact=i%10!==0;
      if (hasContact) contacts.push({id:'q'+i,client,profile,agent:author,replyAgent:i%7!==0?ownerAt(profile,start+(1+(i*3)%20)*60000):null,time:start,answered:i%7!==0,replyMinutes:i%7!==0?1+(i*3)%20:null});
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
    }
    profiles.forEach((p,i) => {
      for(let x=0;x<(i%3)+1;x++) pending.push({profile:p.id,agent:p.owner,age:5+i*4+x*3});
      for(let x=0;x<(i%4)+2;x++) pings.push({profile:p.id,agent:p.owner});
    });
    sessions.sort((a,b)=>a.time-b.time);
    return {contacts,sessions,topups,pending,pings,reviews,complaints};
  }
  const inPeriod=(time,from,to)=>time>=from && time<to+DAY;
  function calculate(data,opt) {
    const profileOK=p=>opt.profile==='all'||p===opt.profile;
    const agentOK=a=>opt.agent==='all'||a===opt.agent;
    const performer=x=>x.replyAgent||x.agent;
    const allowed=p=>opt.mode!=='agent'||profiles.some(x=>x.id===p&&x.owner==='k')||data.contacts.some(x=>x.profile===p&&performer(x)==='k')||data.sessions.some(x=>x.profile===p&&x.agent==='k');
    const scope=x=>allowed(x.profile)&&profileOK(x.profile)&&agentOK(performer(x));
    const firstContacts=new Map();
    data.contacts.slice().sort((a,b)=>a.time-b.time).forEach(c=>{const key=c.client+'|'+c.profile;if(!firstContacts.has(key))firstContacts.set(key,c);});
    const sessionById=new Map();
    data.sessions.filter(s=>Number(s.debit)>0&&s.confirmed===true&&s.time<=AS_OF).slice().sort((a,b)=>a.time-b.time).forEach(s=>{if(!sessionById.has(s.id))sessionById.set(s.id,s);});
    const sessions=[...sessionById.values()];
    const events=[...firstContacts.values()].filter(x=>scope(x)&&inPeriod(x.time,opt.from,opt.to));
    const paid=sessions.filter(x=>scope(x)&&inPeriod(x.time,opt.from,opt.to));
    const unique=a=>new Set(a).size;
    const firstPaid=new Map(), firstPair=new Map();
    sessions.forEach(s=>{if(!firstPaid.has(s.client))firstPaid.set(s.client,s);const k=s.client+'|'+s.profile;if(!firstPair.has(k))firstPair.set(k,s);});
    const aged=x=>x.time+30*DAY<=AS_OF;
    const answeredContacts=events.filter(c=>c.answered&&Number.isFinite(c.replyMinutes)).map(c=>Object.assign({},c,{time:c.time+c.replyMinutes*60000}));
    const conversion=answeredContacts.filter(aged), pendingConversion=answeredContacts.length-conversion.length;
    const converted=conversion.filter(c=>sessions.some(s=>s.client===c.client&&s.profile===c.profile&&s.time>c.time&&s.time<=c.time+30*DAY));
    const platformByPerson=new Map();
    [...firstContacts.values()].sort((a,b)=>a.time-b.time).forEach(c=>{if(!platformByPerson.has(c.client))platformByPerson.set(c.client,c);});
    const newPlatform=[...platformByPerson.values()].filter(c=>scope(c)&&inPeriod(c.time,opt.from,opt.to)&&(!firstPaid.has(c.client)||firstPaid.get(c.client).time>=c.time));
    const platformAged=newPlatform.filter(aged);
    const firstPlatform=platformAged.filter(c=>{const s=firstPaid.get(c.client);return s&&s.time>=c.time&&s.time<=c.time+30*DAY;});
    const pairFirst=[...firstPair.values()].filter(s=>scope(s)&&inPeriod(s.time,opt.from,opt.to)).sort((a,b)=>a.time-b.time);
    const byPerson=new Map();pairFirst.forEach(s=>{if(!byPerson.has(s.client))byPerson.set(s.client,[]);byPerson.get(s.client).push(s);});
    const repeatBase=[...byPerson.values()], repeatAged=repeatBase.filter(group=>group.every(aged));
    const returned=repeatAged.filter(group=>group.some(first=>sessions.some(s=>s.client===first.client&&s.profile===first.profile&&s.id!==first.id&&s.time>first.time&&s.time<=first.time+30*DAY)));
    const scopedClients=new Set(data.contacts.filter(scope).map(x=>x.client).concat(sessions.filter(scope).map(x=>x.client)));
    const topups=data.topups.filter(x=>scopedClients.has(x.client)&&inPeriod(x.time,opt.from,opt.to));
    const reviews=(data.reviews||[]).filter(x=>scope(x)&&inPeriod(x.time,opt.from,opt.to));
    const complaints=(data.complaints||[]).filter(x=>scope(x)&&inPeriod(x.time,opt.from,opt.to));
    const replyTimes=events.filter(x=>x.answered&&Number.isFinite(x.replyMinutes)).map(x=>x.replyMinutes).sort((a,b)=>a-b);
    const middle=Math.floor(replyTimes.length/2),medianReply=replyTimes.length?(replyTimes.length%2?replyTimes[middle]:(replyTimes[middle-1]+replyTimes[middle])/2):null;
    const firstPaidInPeriod=paid.filter(s=>firstPaid.get(s.client).id===s.id);
    return {events,paid,clients:unique(paid.map(x=>x.client)),minutes:paid.reduce((n,x)=>n+x.minutes,0),
      debit:paid.reduce((n,x)=>n+x.debit,0),accrual:paid.reduce((n,x)=>n+x.accrual,0),
      answered:events.filter(x=>x.answered).length,
      conversion:{n:converted.length,d:conversion.length,waiting:pendingConversion},
      firstPlatform:{n:firstPlatform.length,d:platformAged.length,waiting:newPlatform.length-platformAged.length},
      repeat:{n:returned.length,d:repeatAged.length,waiting:repeatBase.length-repeatAged.length},
      firstPaid:firstPaidInPeriod.length,
      topupAmount:topups.reduce((n,x)=>n+x.credits,0),topupCount:topups.length,
      pending:data.pending.filter(scope).length,pings:data.pings.filter(scope).length,
      reviews,complaints,medianReply,replySamples:replyTimes.length};
  }
  if (typeof module!=='undefined'&&module.exports) module.exports={calculate,demoData,AS_OF,DAY,minskStart,inPeriod};
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
  const kpi=(icon,title,value,sub,detail)=>'<button type="button" class="pa-kpi" data-detail="'+detail+'"><span class="pa-icon"><i class="fa fa-'+icon+'" aria-hidden="true"></i></span><span class="pa-kpi-text"><span class="pa-kpi-name">'+title+'</span><strong class="pa-kpi-value">'+value+'</strong><span class="pa-kpi-sub">'+sub+'</span></span><span class="pa-kpi-arrow">ⓘ</span></button>';
  const card=(title,obj,explain)=>'<div class="pa-cohort-card"><div class="pa-cohort-title">'+title+'</div><div class="pa-cohort-number"><strong>'+valueRatio(obj)+'</strong><span>'+ratioDetail(obj)+'</span></div><div class="pa-cohort-detail">'+explain+'</div><div class="pa-cohort-detail">'+t('Окно ещё открыто: ','Window still open: ')+fmt(obj.waiting)+'</div></div>';
  const linkSuffix=en?'?lang=en&v=reply-author-20261116':'?v=reply-author-20261116';
  root.innerHTML=
    '<div class="pa-header"><div><h2>'+t(mode==='agent'?'Аналитика агента':'Аналитика команды',mode==='agent'?'Agent analytics':'Team analytics')+'</h2><p>'+t(mode==='agent'?'Работа с клиентами и результаты ваших анкет':'Клиенты и результаты курируемых агентов',mode==='agent'?'Customers and performance of your profiles':'Customers and performance of supervised agents')+'</p></div><div class="pa-role-nav"><span class="pa-preview-label">'+t('Два макета:','Previews:')+'</span><a '+(mode==='agent'?'aria-current="page"':'')+' href="./'+linkSuffix+'">'+t('Агент','Agent')+'</a><a '+(mode==='manager'?'aria-current="page"':'')+' href="supervisor.html'+linkSuffix+'">'+t('Руководитель','Supervisor')+'</a><span class="pa-demo">'+t('Пример данных','Sample data')+'</span></div></div>'+
    '<div class="pa-toolbar"><div class="pa-tabs" role="tablist" aria-label="'+t('Раздел отчёта','Report section')+'"><button class="pa-tab" type="button" role="tab" data-tab="summary">'+t('Сводка','Overview')+'</button><button class="pa-tab" type="button" role="tab" data-tab="interactions">'+t('Взаимодействия','Interactions')+'</button><button class="pa-tab" type="button" role="tab" data-tab="charts">'+t('Графики','Charts')+'</button></div>'+
    '<form class="pa-filters" id="v2-filters"><label>'+t('Период','Period')+'<select id="v2-period" class="form-control"><option value="prev">'+t('Прошлый месяц','Previous month')+'</option><option value="30">'+t('Последние 30 дней','Last 30 days')+'</option><option value="7">'+t('Последние 7 дней','Last 7 days')+'</option><option value="custom">'+t('Выбрать даты','Custom dates')+'</option></select></label>'+
    '<label class="pa-custom" id="v2-from-wrap" hidden>'+t('С','From')+'<input id="v2-from" class="form-control" type="date" value="2026-10-01"></label><label class="pa-custom" id="v2-to-wrap" hidden>'+t('По','To')+'<input id="v2-to" class="form-control" type="date" value="2026-10-31"></label>'+
    (mode==='manager'?'<label>'+t('Агент','Agent')+'<select id="v2-agent" class="form-control"><option value="all">'+t('Все агенты','All agents')+'</option>'+agents.map(a=>'<option value="'+a.id+'">'+a.name+'</option>').join('')+'</select></label>':'')+
    '<label>'+t('Анкета','Profile')+'<select id="v2-profile" class="form-control"><option value="all">'+t('Все доступные анкеты','All available profiles')+'</option>'+profiles.filter(p=>mode==='manager'||p.owner==='k'||data.contacts.some(x=>x.profile===p.id&&(x.replyAgent||x.agent)==='k')||data.sessions.some(x=>x.profile===p.id&&x.agent==='k')).map(p=>'<option value="'+p.id+'">'+p.name+(mode==='agent'&&p.owner!=='k'?t(' (ранее)',' (former)'):'')+'</option>').join('')+'</select></label>'+
    '<button class="btn btn-primary" type="submit">'+t('Применить','Apply')+'</button><button class="btn btn-default" type="button" id="v2-reset">'+t('Сбросить','Reset')+'</button><div class="pa-error" id="v2-error" role="alert" hidden></div></form><p class="pa-context" id="v2-context" aria-live="polite"></p></div>'+
    '<section id="v2-summary" role="tabpanel"><div class="pa-work"><div class="pa-work-heading"><strong>'+t('Работа сейчас','Work now')+'</strong><small>'+t('На 16 ноября','As of 16 November')+'</small></div><div class="pa-work-item"><strong id="v2-pending"></strong><span>'+t('ждут ответа','awaiting reply')+'</span></div><div class="pa-work-item"><strong id="v2-pings"></strong><span>'+t('пингов','pings')+'</span></div><a class="pa-work-link" target="_blank" rel="noopener" href="https://confideline.com/ru/admin/chat/v2?leadType=chats">'+t('Открыть Chat V2','Open Chat V2')+' <i class="fa fa-external-link" aria-hidden="true"></i></a></div>'+
    '<div class="pa-section-head"><div><h3>'+t('Результаты за период','Results for the period')+'</h3><p>'+t('Нажмите на показатель, чтобы узнать, что в него входит.','Select a metric to see its definition.')+'</p></div></div><div class="pa-kpis" id="v2-kpis"></div>'+
    (mode==='manager'?'<section class="pa-box pa-team-queue"><div class="pa-box-head"><div><h3>'+t('Ожидают ответа по агентам','Awaiting reply by agent')+'</h3><p>'+t('Текущая очередь, отдельно от периода отчёта','Current queue, separate from the report period')+'</p></div></div><div id="v2-queue"></div></section>':'')+
    '<section class="pa-box pa-table-box"><div class="pa-box-head"><div><h3 id="v2-table-title"></h3><p id="v2-table-sub"></p></div>'+(mode==='manager'?'<div class="pa-switch"><button type="button" data-group="agents">'+t('По агентам','By agent')+'</button><button type="button" data-group="profiles">'+t('По анкетам','By profile')+'</button></div>':'')+'</div><div class="pa-table-scroll" id="v2-table"></div></section>'+
    '<section class="pa-box pa-quality-box"><div class="pa-box-head"><div><h3>'+t('Качество обслуживания','Service quality')+'</h3><p>'+t('За выбранный период','For the selected period')+'</p></div></div><div class="pa-quality" id="v2-quality"></div></section>'+
    '<div class="pa-grid-2"><section class="pa-box"><div class="pa-box-head"><div><h3>'+t('Переход в платную консультацию','Transition to paid consultations')+'</h3><p>'+t('Клиенты за выбранный период · окно 30 дней · на 16 ноября','Customers in the selected period · 30-day window · as of 16 November')+'</p></div></div><div id="v2-conversions"></div><p class="pa-note">'+t('Диалог с ответом относится к ответившему агенту, консультация — к её исполнителю.','A replied conversation is attributed to the responding agent, and a consultation to its performer.')+'</p></section><section class="pa-box"><div class="pa-box-head"><div><h3>'+t('Возврат клиентов','Returning customers')+'</h3><p>'+t('Повторная консультация в течение 30 дней · на 16 ноября','Repeat consultation within 30 days · as of 16 November')+'</p></div></div><div id="v2-retention"></div><h3 class="pa-finance-title">'+t('Финансы за период','Finances for the period')+'</h3><div id="v2-finance"></div></section></div>'+
    '<p class="pa-source"><i class="fa fa-info-circle" aria-hidden="true"></i> '+t('Условные данные. Показатели и фильтры приведены для обсуждения.','Illustrative data. Metrics and filters are provided for discussion.')+'</p></section>'+
    '<section id="v2-interactions" role="tabpanel" hidden><div class="pa-box" style="margin-top:14px"><div class="pa-box-head"><div><h3>'+t('Взаимодействия','Interactions')+'</h3><p>'+t('Примеры диалогов за выбранный период','Example conversations in the selected period')+'</p></div></div><div class="pa-table-scroll" id="v2-interactions-table"></div></div></section>'+
    '<section id="v2-charts" role="tabpanel" hidden><div class="pa-box" style="margin-top:14px"><div class="pa-box-head"><div><h3>'+t('Динамика консультаций','Consultation trend')+'</h3><p>'+t('Оплаченные консультации по датам первого списания','Paid consultations by first-debit date')+'</p></div></div><div class="pa-bar-chart" id="v2-chart"></div></div></section>'+
    '<dialog id="detail-dialog"><div class="pa-dialog-head"><h3 id="detail-title"></h3><button type="button" class="pa-close" id="detail-close" aria-label="'+t('Закрыть','Close')+'">×</button></div><div id="detail-content"></div><div class="pa-dialog-actions"><button type="button" class="btn btn-default" id="detail-done">'+t('Закрыть','Close')+'</button></div></dialog>';
  const details={
    chats:[t('Новые диалоги','New conversations'),t('Клиенты, начавшие бесплатное общение с анкетой за выбранный период.','Customers who started a free conversation with a profile in the selected period.')],
    paid:[t('Платные консультации','Paid consultations'),t('Консультации с первым подтверждённым списанием кредитов за услугу в выбранный период. Пополнение не считается консультацией.','Consultations with the first confirmed credit debit for the service in the selected period. A top-up is not a consultation.')],
    clients:[t('Клиенты консультаций','Consultation customers'),t('Уникальные клиенты с оплаченной консультацией. В общей сводке клиент учитывается один раз.','Unique customers with a paid consultation. The total counts each customer once.')],
    responses:[t('Доля ответов','Reply rate'),t('Ответы по новым диалогам за период. Пинги без сообщения клиента сюда не входят.','Responses to new conversations in the period. Pings without a customer message are excluded.')],
    accrual:[t('Начислено','Accrued'),t('Пример начислений в кредитах по фактическому исполнителю. Действующая ставка и права требуют отдельной проверки.','Illustrative credit accrual by actual performer. The actual rate and access require verification.')]
  };
  function applyPreset(value) {
    if(value==='prev'){opt.from=minskStart('2026-10-01');opt.to=minskStart('2026-10-31');}
    if(value==='30'){opt.from=minskStart('2026-10-18');opt.to=minskStart('2026-11-16');}
    if(value==='7'){opt.from=minskStart('2026-11-10');opt.to=minskStart('2026-11-16');}
  }
  function tableFor(rows) {
    if(!rows.length)return '<p class="pa-empty">'+t('Нет данных за выбранный период','No data for the selected period')+'</p>';
    const columns=[['name',mode==='manager'&&grouping==='agents'?t('Агент','Agent'):t('Анкета','Profile')],['chats',t('Новые диалоги','New conversations')],['answers',t('Доля ответов','Reply rate')],['paid',t('Консультации','Consultations')],['clients',t('Клиенты','Customers')],['debit',t('Списано, кред.','Debited, credits')],['accrual',t('Начислено, кред.','Accrued, credits')]];
    const sortValue=(r,key)=>key==='answers'?(r.chats?r.answers/r.chats:-1):r[key];
    rows.sort((a,b)=>{const x=sortValue(a,sortKey),y=sortValue(b,sortKey);return (typeof x==='string'?x.localeCompare(y):x-y)*(sortDesc?-1:1);});
    return '<table class="table"><thead><tr>'+columns.map(c=>'<th scope="col"'+(c[0]===sortKey?' aria-sort="'+(sortDesc?'descending':'ascending')+'"':'')+'><button type="button" class="pa-sort" data-sort="'+c[0]+'">'+c[1]+' '+(c[0]===sortKey?(sortDesc?'↓':'↑'):'↕')+'</button></th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr><td><strong>'+r.name+'</strong>'+(r.note?'<br><small>'+r.note+'</small>':'')+'</td><td>'+fmt(r.chats)+'</td><td>'+(r.chats?Math.round(r.answers/r.chats*100)+'% · ':'')+fmt(r.answers)+' / '+fmt(r.chats)+'</td><td>'+fmt(r.paid)+'</td><td>'+fmt(r.clients)+'</td><td>'+fmt(r.debit)+'</td><td>'+fmt(r.accrual)+'</td></tr>').join('')+'</tbody></table>';
  }
  function associated(p,agent){return agent==='all'||p.owner===agent||data.contacts.some(x=>x.profile===p.id&&(x.replyAgent||x.agent)===agent)||data.sessions.some(x=>x.profile===p.id&&x.agent===agent);}
  function associatedInPeriod(p,agent){return agent==='all'||p.owner===agent||data.contacts.some(x=>x.profile===p.id&&(x.replyAgent||x.agent)===agent&&inPeriod(x.time,opt.from,opt.to))||data.sessions.some(x=>x.profile===p.id&&x.agent===agent&&inPeriod(x.time,opt.from,opt.to));}
  function syncProfileOptions() {
    if(mode!=='manager')return;
    const selected=e('v2-agent').value,select=e('v2-profile');
    [...select.options].forEach(o=>{if(o.value!=='all')o.disabled=!associated(profiles.find(p=>p.id===o.value),selected);});
    if(select.selectedOptions[0].disabled)select.value='all';
  }
  function render(){
    const x=calculate(data,opt), p=profiles.find(z=>z.id===opt.profile), a=agents.find(z=>z.id===opt.agent);
    e('v2-context').textContent=date(opt.from)+' — '+date(opt.to)+' · Europe/Minsk · '+(a?a.name:t('Все агенты','All agents'))+' · '+(p?p.name:t('Все доступные анкеты','All available profiles'));
    e('v2-pending').textContent=fmt(x.pending);e('v2-pings').textContent=fmt(x.pings);
    if(mode==='manager'){
      const queue=agents.filter(a=>opt.agent==='all'||opt.agent===a.id).map(a=>({agent:a,items:data.pending.filter(q=>q.agent===a.id&&(opt.profile==='all'||q.profile===opt.profile))})).filter(q=>q.items.length);
      e('v2-queue').innerHTML=queue.length?queue.map(q=>'<button class="pa-queue-row" type="button" data-select-agent="'+q.agent.id+'"><strong>'+q.agent.name+'</strong><span>'+fmt(q.items.length)+' '+t('ждут ответа','awaiting reply')+'</span><small>'+t('Самое долгое ожидание: ','Oldest waiting: ')+Math.max(...q.items.map(i=>i.age))+' '+t('мин','min')+'</small><i class="fa fa-angle-right" aria-hidden="true"></i></button>').join(''):'<p class="pa-empty">'+t('Нет ожидающих сообщений','No messages awaiting reply')+'</p>';
    }
    e('v2-kpis').innerHTML=kpi('comments-o',t('Новые диалоги','New conversations'),fmt(x.events.length),t('клиенты написали','customers started a chat'),'chats')+
      kpi('reply',t('Доля ответов','Reply rate'),x.events.length?Math.round(x.answered/x.events.length*100)+'%':'—',fmt(x.answered)+' / '+fmt(x.events.length),'responses')+
      kpi('commenting-o',t('Платные консультации','Paid consultations'),fmt(x.paid.length),fmt(x.minutes)+' '+t('платных минут','paid minutes'),'paid')+
      kpi('users',t('Платные клиенты','Paying customers'),fmt(x.clients),t('уникальные клиенты','unique customers'),'clients');
    const rows=[];
    if(mode==='manager'&&grouping==='agents'){
      agents.filter(a=>(opt.agent==='all'||a.id===opt.agent)&&(opt.profile==='all'||associatedInPeriod(profiles.find(p=>p.id===opt.profile),a.id))).forEach(a=>{const y=calculate(data,Object.assign({},opt,{agent:a.id}));rows.push({name:a.name,note:t('Сейчас: ','Current: ')+profiles.filter(p=>p.owner===a.id).map(p=>p.name).join(', '),chats:y.events.length,answers:y.answered,paid:y.paid.length,clients:y.clients,debit:y.debit,accrual:y.accrual});});
      e('v2-table-title').textContent=t('Результаты агентов','Agent performance');
      e('v2-table-sub').textContent=t('Действия фактического исполнителя','Actions by the actual performer');
    }else{
      profiles.filter(p=>(mode==='manager'||p.owner==='k'||associated(p,'k'))&&associatedInPeriod(p,opt.agent)&&(opt.profile==='all'||opt.profile===p.id)).forEach(p=>{const y=calculate(data,Object.assign({},opt,{profile:p.id}));rows.push({name:p.name,note:mode==='agent'&&p.owner!=='k'?t('Ранее','Former'):'',chats:y.events.length,answers:y.answered,paid:y.paid.length,clients:y.clients,debit:y.debit,accrual:y.accrual});});
      e('v2-table-title').textContent=t('Результаты анкет','Profile performance');
      e('v2-table-sub').textContent=mode==='manager'&&opt.agent==='all'?t('История анкет по всем исполнителям','Profile history across performers'):t('Результаты в выбранной области','Results in the selected scope');
    }
    e('v2-table').innerHTML=tableFor(rows);
    document.querySelectorAll('[data-group]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.group===grouping)));
    const rating=x.reviews.length?(x.reviews.reduce((n,r)=>n+r.rating,0)/x.reviews.length).toFixed(1).replace('.',en?'.':','):'—';
    e('v2-quality').innerHTML='<div><span>'+t('Первый ответ','First reply')+'</span><strong>'+(x.medianReply===null?'—':fmt(x.medianReply)+' '+t('мин','min'))+'</strong><small>'+t('медиана · диалогов: ','median · conversations: ')+fmt(x.replySamples)+'</small></div><div><span>'+t('Средняя оценка','Average rating')+'</span><strong>'+rating+(x.reviews.length?' / 5':'')+'</strong><small>'+t('оценок: ','ratings: ')+fmt(x.reviews.length)+'</small></div><div><span>'+t('Жалобы','Complaints')+'</span><strong>'+fmt(x.complaints.length)+'</strong><small>'+t('за выбранный период','in the selected period')+'</small></div>';
    e('v2-conversions').innerHTML=card(t('После общения с той же анкетой','After speaking with the same profile'),x.conversion,t('Доля диалогов с ответом агента, после которого за 30 дней оплачена консультация этой анкеты.','Share of conversations with an agent reply followed within 30 days by a paid consultation with that profile.'))+
      card(t('Первая платная консультация на сайте','First paid consultation on the site'),x.firstPlatform,t('Из ранее не плативших клиентов, впервые начавших диалог на сайте, оплатили консультацию у любой анкеты.','Previously non-paying customers who started their first conversation on the site and paid for a consultation with any profile.'));
    e('v2-retention').innerHTML=card(t('Вернулись к той же анкете','Returned to the same profile'),x.repeat,t('Из клиентов с первой консультацией у анкеты за период вернулись к ней в течение 30 дней.','Customers with a first consultation with the profile in the period who returned within 30 days.'));
    e('v2-finance').innerHTML='<div class="pa-inline-metric"><span>'+t('Первых платных клиентов за период','First-time paying customers in period')+'</span><strong>'+fmt(x.firstPaid)+'</strong></div><div class="pa-inline-metric"><span>'+t('Списано за консультации','Debited for consultations')+'</span><strong>'+fmt(x.debit)+' '+t('кред.','credits')+'</strong></div><div class="pa-inline-metric"><span>'+t(mode==='agent'?'Мои начисления':'Начислено агентам',mode==='agent'?'My accruals':'Accrued to agents')+'</span><strong>'+fmt(x.accrual)+' '+t('кред.','credits')+'</strong></div><div class="pa-inline-metric"><span>'+t('Пополнения клиентов','Customer top-ups')+'</span><strong>'+fmt(x.topupAmount)+' '+t('кред.','credits')+'</strong></div><p class="pa-note">'+t('Пополнения выбранных клиентов не являются оплатой консультации и не приписываются агенту.','Selected customers’ top-ups are not consultation payments and are not attributed to the agent.')+'</p>';
    const ints=x.events.slice().sort((a,b)=>b.time-a.time).slice(0,30);
    e('v2-interactions-table').innerHTML=ints.length?'<table class="table"><thead><tr><th>'+t('Дата','Date')+'</th><th>'+t('Клиент','Customer')+'</th><th>'+t('Анкета','Profile')+'</th><th>'+t('Агент','Agent')+'</th><th>'+t('Ответ','Reply')+'</th></tr></thead><tbody>'+ints.map(c=>'<tr><td>'+date(c.time)+'</td><td>'+t('Клиент','Customer')+' '+c.client.slice(1)+'</td><td>'+profiles.find(p=>p.id===c.profile).name+'</td><td>'+agents.find(a=>a.id===(c.replyAgent||c.agent)).name+'</td><td>'+(c.answered?t('Есть','Answered'):t('Нет','No reply'))+'</td></tr>').join('')+'</tbody></table>':'<p class="pa-empty">'+t('Нет данных за выбранный период','No data for the selected period')+'</p>';
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
    if(b.dataset.selectAgent){e('v2-agent').value=b.dataset.selectAgent;syncProfileOptions();opt.agent=b.dataset.selectAgent;opt.profile=e('v2-profile').value;render();e('v2-agent').focus();}
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
  render();
})();
