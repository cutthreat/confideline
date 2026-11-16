(() => {
  'use strict';
  const root = document.querySelector('#partner-analytics');
  const $ = id => document.getElementById(id);
  const profiles = [{id:'a',name:'Мира'}, {id:'b',name:'Луна'}, {id:'c',name:'Амелия'}];
  const dayMs = 86400000;
  const anchor = Date.UTC(2026, 10, 16);
  const dayKey = day => new Date(day).toISOString().slice(0,10);
  const displayDate = iso => english ? iso.slice(5,7)+'/'+iso.slice(8,10)+'/'+iso.slice(0,4) : iso.split('-').reverse().join('.');
  const ruNumber = n => new Intl.NumberFormat(english?'en-US':'ru-RU').format(n);
  const money = n => '$' + new Intl.NumberFormat(english?'en-US':'ru-RU', {minimumFractionDigits:2, maximumFractionDigits:2}).format(n / 100);
  const records = [];
  const prior = new Set();
  for (let day = 59; day >= 0; day--) {
    profiles.forEach((p, pi) => {
      const n = 3 + ((day + pi * 2) % 3);
      for (let i = 0; i < n; i++) {
        const user = 'demo-' + ((day * 3 + pi * 17 + i * 11) % 120);
        const chat = i < n - 1;
        const paid = chat && ((day + pi + i) % 3 !== 0);
        const repeatKey = p.id + ':' + user;
        const repeat = paid && prior.has(repeatKey);
        if (paid) prior.add(repeatKey);
        const minutes = paid ? 8 + ((day * 3 + pi * 5 + i * 7) % 20) : 0;
        const answered = chat && ((day + pi + i) % 5 !== 0);
        records.push({date:dayKey(anchor - day * dayMs),profile:p.id,user,chat,paid,repeat,answered,minutes,
          credits: paid ? minutes * (8 + pi * 2) : 0,
          remuneration: paid ? (330 + ((day * 59 + pi * 83 + i * 97) % 520)) : 0});
      }
    });
  }
  const maxDay = dayKey(anchor), minDay = dayKey(anchor - 29 * dayMs);
  for (const input of [$('from-date'), $('to-date')]) { input.min=minDay; input.max=maxDay; }
  $('from-date').value = minDay; $('to-date').value = maxDay;
  let applied = {from:minDay, to:maxDay, profile:'all', period:'30'};
  const metricDefs = [
    {key:'chats', name:'Новые чаты', icon:'comments-o', sub:'за период', detail:'Первое появление чата, включая переход из пинга. Сообщения в существующем чате не создают новый чат.'},
    {key:'paid', name:'Оплаченные консультации', icon:'commenting-o', sub:'за период', detail:'Консультации, по которым в периоде произошло первое подтверждённое положительное списание.'},
    {key:'clients', name:'Клиенты консультаций', icon:'users', sub:'уникальные клиенты', detail:'Количество разных клиентов с оплаченной консультацией. Один клиент учитывается один раз даже при нескольких консультациях и анкетах.'},
    {key:'minutes', name:'Платные минуты', icon:'clock-o', sub:'время консультаций', detail:'Минуты платной части консультаций за выбранный период.'},
    {key:'returning', name:'Повторные клиенты', icon:'refresh', sub:'вернулись на консультацию', detail:'Разные клиенты, которые в выбранном периоде повторно оплатили консультацию с той же анкетой.'},
    {key:'answerRate', name:'Доля ответа', icon:'reply', sub:'по парам клиент — анкета', detail:'Доля пар с ответом после сообщения клиента среди пар с сообщением клиента за выбранный период.'},
    {key:'credits', name:'Списано клиентами', icon:'credit-card', sub:'кредиты за консультации', detail:'Кредиты, списанные с клиентов за консультации. Начисления партнёру показаны отдельно.'},
    {key:'remuneration', name:'Начислено партнёру', icon:'money', sub:'по начислениям', detail:'Начисления за консультации по правилам сайта. Если индивидуальный процент не задан, используется общий.'}
  ];
  const english = new URLSearchParams(location.search).get('lang') === 'en';
  const translations = [
    ['Первое появление чата, включая переход из пинга. Сообщения в существующем чате не создают новый чат.','First appearance of a chat, including conversion from a ping. Messages in an existing chat do not create a new chat.'],
    ['Консультации, по которым в периоде произошло первое подтверждённое положительное списание.','Consultations with their first confirmed positive charge during the period.'],
    ['Количество разных клиентов с оплаченной консультацией. Один клиент учитывается один раз даже при нескольких консультациях и анкетах.','Unique clients with a paid consultation. A client is counted once across consultations and profiles.'],
    ['Минуты платной части консультаций за выбранный период.','Minutes in paid portions of consultations during the selected period.'],
    ['Разные клиенты, которые в выбранном периоде повторно оплатили консультацию с той же анкетой.','Unique clients who paid again for a consultation with the same profile during the period.'],
    ['Доля пар с ответом после сообщения клиента среди пар с сообщением клиента за выбранный период.','Share of client–profile pairs with a reply after a client message among pairs with a client message in the period.'],
    ['Кредиты, списанные с клиентов за консультации. Начисления партнёру показаны отдельно.','Credits charged to clients for consultations. Partner earnings are shown separately.'],
    ['Начисления за консультации по правилам сайта. Если индивидуальный процент не задан, используется общий.','Consultation earnings according to site rules. The general rate applies if no individual rate is set.'],
    ['Для примера выберите даты с ','For the example choose dates from '], ['Дата начала не может быть позже даты окончания.','The start date cannot be later than the end date.'], ['Укажите начальную и конечную дату.','Enter both the start and end dates.'],
    ['Клиенты и консультации закреплённых анкет','Clients and consultations for assigned profiles'],
    ['Клиенты, прошедшие этапы за выбранный период.','Clients who completed the steps during the selected period.'],
    ['Уникальные клиенты по закреплённым анкетам','Unique clients across assigned profiles'],
    ['Сравнение закреплённых анкет за выбранный период','Assigned profiles over the selected period'],
    ['Нажмите на название анкеты, чтобы отфильтровать панель.','Select a profile name to filter the dashboard.'],
    ['Нажмите на показатель, чтобы узнать, что в него входит.','Select a metric to see what it includes.'],
    ['Показаны условные данные для обсуждения состава и вида аналитики.','Example data for discussing the dashboard.'],
    ['Последние 30 дней','Last 30 days'], ['Последние 7 дней','Last 7 days'], ['Выбрать даты','Choose dates'],
    ['Все мои анкеты','All my profiles'], ['Панель аналитики','Analytics dashboard'], ['Аналитика партнёра','Partner analytics'],
    ['Взаимодействия пользователей','User interactions'], ['Начислено партнёру','Partner earnings'], ['Клиенты консультаций','Consultation clients'],
    ['Оплаченные консультации','Paid consultations'], ['Повторные клиенты','Returning clients'], ['Платные минуты','Paid minutes'],
    ['Списано клиентами','Client charges'], ['Новые чаты','New chats'], ['Доля ответа','Response rate'],
    ['по парам клиент — анкета','per client–profile pair'], ['вернулись на консультацию','returned for a consultation'],
    ['кредиты за консультации','credits for consultations'], ['по начислениям','from earnings'], ['уникальные клиенты','unique clients'],
    ['время консультаций','consultation time'], ['за период','for the period'], ['За выбранный период','Selected period'],
    ['Показатель графика','Chart metric'], ['Количество за выбранный период','Count in the selected period'], ['Динамика','Trend'],
    ['Путь клиента','Client journey'], ['Посмотрели анкету','Viewed a profile'], ['Начали чат','Started a chat'], ['Оплатили консультацию','Paid for a consultation'],
    ['Все клиенты','All clients'], ['от предыдущего шага','of previous step'], ['по 5 дней','per 5 days'],
    ['Результаты анкет','Profile results'], ['ПРОСМОТРЫ','VIEWS'], ['НОВЫЕ ЧАТЫ','NEW CHATS'], ['ОПЛАЧЕННЫЕ','PAID'], ['ПЛАТНЫЕ МИНУТЫ','PAID MINUTES'],
    ['НАЧИСЛЕНО ПАРТНЁРУ','PARTNER EARNINGS'], ['АНКЕТА','PROFILE'], ['Просмотры','Views'], ['Оплаченные','Paid'],
    ['Пример данных','Example data'], ['Администрирование','Administration'], ['Эксперты','Experts'], ['Партнеры','Partners'], ['Финансы','Finance'],
    ['Поддержка','Support'], ['Аналитика','Analytics'], ['Диалоги','Dialogs'], ['Модерация','Moderation'], ['Сообщения','Messages'],
    ['Содержимое','Content'], ['Главное','Home'], ['Применить','Apply'], ['Сбросить','Reset'], ['Период','Period'], ['Анкета','Profile'],
    ['Закрыть','Close'], ['Подробнее','Details'], ['Поиск','Search'], ['Мира','Mira'], ['Луна','Luna'], ['Амелия','Amelia']
  ].sort((a,b)=>b[0].length-a[0].length);
  function translatePage(){
    if(!english)return;
    const swap = text => translations.reduce((s,[ru,en])=>s.split(ru).join(en),text);
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){const n=walker.currentNode;if(!['SCRIPT','STYLE'].includes(n.parentElement?.tagName)){const s=n.nodeValue;n.nodeValue=s.trim()==='С'?s.replace('С','From'):s.trim()==='По'?s.replace('По','To'):swap(s);}}
    document.querySelectorAll('[aria-label],[title],[placeholder]').forEach(el=>{for(const attr of ['aria-label','title','placeholder'])if(el.hasAttribute(attr))el.setAttribute(attr,swap(el.getAttribute(attr)));});
    document.documentElement.lang='en'; document.title='Partner analytics · Confideline';
  }
  const sum = (rows, key) => rows.reduce((a,r) => a + (key === 'chats' ? Number(r.chat) : key === 'paid' ? Number(r.paid) : Number(r[key] || 0)),0);
  const unique = (rows, predicate) => new Set(rows.filter(predicate).map(r=>r.user)).size;
  const fmt = (key, value) => key === 'remuneration' ? money(value) : key === 'answerRate' ? value : ruNumber(value);
  const between = (row, f) => row.date >= f.from && row.date <= f.to && (f.profile === 'all' || row.profile === f.profile);
  const summary = rows => {
    const pairs=new Set(rows.filter(r=>r.chat).map(r=>r.profile+':'+r.user));
    const answeredPairs=new Set(rows.filter(r=>r.chat&&r.answered).map(r=>r.profile+':'+r.user));
    return {chats:sum(rows,'chats'), paid:sum(rows,'paid'), clients:unique(rows,r=>r.paid),
      minutes:sum(rows,'minutes'), returning:unique(rows,r=>r.repeat),
      answerRate:pairs.size ? Math.round(100*answeredPairs.size/pairs.size)+'%' : '—',
      credits:sum(rows,'credits'), remuneration:sum(rows,'remuneration')};
  };

  function renderKpis(rows) {
    const v=summary(rows);
    $('kpis').innerHTML=metricDefs.map(m=>`<button type="button" class="pa-kpi" data-metric="${m.key}" aria-label="${m.name}: ${fmt(m.key,v[m.key])}. Подробнее"><span class="pa-icon"><i class="fa fa-${m.icon}" aria-hidden="true"></i></span><span class="pa-kpi-text"><span class="pa-kpi-name">${m.name}</span><span class="pa-kpi-value">${fmt(m.key,v[m.key])}</span><span class="pa-kpi-sub">${m.sub}</span></span><i class="fa fa-angle-right pa-kpi-arrow" aria-hidden="true"></i></button>`).join('');
  }
  function renderFunnel(rows) {
    const stages=[{label:'Посмотрели анкету',n:unique(rows,()=>true)}, {label:'Начали чат',n:unique(rows,r=>r.chat)}, {label:'Оплатили консультацию',n:unique(rows,r=>r.paid)}];
    const max=stages[0].n;
    $('funnel').innerHTML=stages.map((s,i)=>{
      const priorValue=i?stages[i-1].n:null, ratio=priorValue?Math.round(s.n/priorValue*100)+'%':(i?'—':'Все клиенты');
      return `<div class="pa-step"><div class="pa-step-header"><span>${s.label}</span><strong>${ruNumber(s.n)}</strong></div><div class="pa-track"><div class="pa-bar" style="width:${max?s.n/max*100:0}%"></div></div><small>${i?ratio+' от предыдущего шага':ratio}</small></div>`;
    }).join('');
  }
  function renderTrend(rows) {
    const metric=$('trend-metric').value;
    const label={paid:'Оплаченные консультации',chats:'Новые чаты',minutes:'Платные минуты'}[metric];
    const from = Date.parse(applied.from+'T00:00:00Z'), to = Date.parse(applied.to+'T00:00:00Z');
    const days=Math.floor((to-from)/dayMs)+1, group=days>14?5:1, buckets=[];
    for(let i=0;i<days;i+=group){
      const lo=dayKey(from+i*dayMs), hi=dayKey(Math.min(to,from+(i+group-1)*dayMs));
      buckets.push({label:displayDate(lo).slice(0,5),value:sum(rows.filter(r=>r.date>=lo&&r.date<=hi),metric)});
    }
    const width=620,height=150,pad=26,max=Math.max(1,...buckets.map(b=>b.value)), h=height-32;
    const x=i=>pad+(width-pad-6)*(buckets.length===1?0.5:i/(buckets.length-1));
    const y=n=>10+h-(n/max)*h;
    const line=buckets.map((b,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(b.value).toFixed(1)).join(' ');
    const circles=buckets.map((b,i)=>`<circle cx="${x(i)}" cy="${y(b.value)}" r="3" fill="#3f88bd"><title>${b.label}: ${b.value}</title></circle>`).join('');
    const labels=buckets.map((b,i)=>`<text x="${x(i)}" y="148" text-anchor="middle">${b.label}</text>`).join('');
    const grid=[0,0.5,1].map(v=>`<line x1="${pad}" x2="614" y1="${y(max*v)}" y2="${y(max*v)}" stroke="#edf1f5"/><text x="0" y="${y(max*v)+4}">${Math.round(max*v)}</text>`).join('');
    $('trend-chart').innerHTML=`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}: ${buckets.map(b=>b.label+' — '+b.value).join(', ')}">${grid}<path d="${line}" fill="none" stroke="#3f88bd" stroke-width="2.5" stroke-linejoin="round"/>${circles}${labels}</svg><div class="pa-legend"><span><i></i>${label}${group>1?' · по 5 дней':''}</span></div>`;
  }
  function renderProfiles(rows) {
    const selected=profiles.filter(p=>applied.profile==='all'||p.id===applied.profile);
    $('profile-rows').innerHTML=selected.map(p=>{
      const data=rows.filter(r=>r.profile===p.id), v=summary(data);
      return `<tr><td><button class="pa-profile" type="button" data-profile="${p.id}">${p.name}</button></td><td>${ruNumber(data.length)}</td><td>${ruNumber(v.chats)}</td><td>${ruNumber(v.paid)}</td><td>${ruNumber(v.minutes)}</td><td>${money(v.remuneration)}</td></tr>`;
    }).join('');
  }
  function render(){
    const rows=records.filter(r=>between(r,applied));
    const selected=applied.profile==='all'?'Все мои анкеты':profiles.find(p=>p.id===applied.profile).name;
    $('context').textContent=`${displayDate(applied.from)} — ${displayDate(applied.to)} · ${selected} · Europe/Minsk`;
    renderKpis(rows);renderFunnel(rows);renderTrend(rows);renderProfiles(rows);translatePage();
  }
  $('period').addEventListener('change',()=>{const custom=$('period').value==='custom';$('from-wrap').hidden=!custom;$('to-wrap').hidden=!custom;});
  $('filter-form').addEventListener('submit',e=>{
    e.preventDefault(); const period=$('period').value; let from,to=maxDay;
    if(period==='custom'){from=$('from-date').value;to=$('to-date').value;}else from=dayKey(anchor-(Number(period)-1)*dayMs);
    if(!from||!to||from>to||from<minDay||to>maxDay){
      $('filter-error').textContent=!from||!to?'Укажите начальную и конечную дату.':from>to?'Дата начала не может быть позже даты окончания.':'Для примера выберите даты с '+displayDate(minDay)+' по '+displayDate(maxDay)+'.';
      $('filter-error').hidden=false;translatePage();return;
    }
    $('filter-error').hidden=true;applied={from,to,period,profile:$('profile').value};render();
  });
  $('reset').addEventListener('click',()=>{$('period').value='30';$('profile').value='all';$('from-date').value=minDay;$('to-date').value=maxDay;$('from-wrap').hidden=true;$('to-wrap').hidden=true;$('filter-error').hidden=true;applied={from:minDay,to:maxDay,profile:'all',period:'30'};render();});
  $('trend-metric').addEventListener('change',()=>{renderTrend(records.filter(r=>between(r,applied)));translatePage();});
  $('profile-rows').addEventListener('click',e=>{const button=e.target.closest('[data-profile]');if(!button)return;applied.profile=button.dataset.profile;$('profile').value=applied.profile;render();root.scrollIntoView({behavior:'smooth',block:'start'});});
  $('kpis').addEventListener('click',e=>{const button=e.target.closest('[data-metric]');if(!button)return;const m=metricDefs.find(x=>x.key===button.dataset.metric),v=summary(records.filter(r=>between(r,applied)));$('detail-title').textContent=m.name;$('detail-content').innerHTML=`<strong>${fmt(m.key,v[m.key])}</strong><p>${m.detail}</p><p>${displayDate(applied.from)} — ${displayDate(applied.to)}</p>`;translatePage();$('detail-dialog').showModal();});
  $('detail-close').addEventListener('click',()=>$('detail-dialog').close());
  $('detail-done').addEventListener('click',()=>$('detail-dialog').close());
  document.querySelector('.sidebar-toggle')?.addEventListener('click',e=>{e.preventDefault();document.body.classList.toggle(innerWidth<768?'sidebar-open':'sidebar-collapse');});
  document.querySelectorAll('.main-sidebar a[role="button"][aria-expanded]').forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault();const submenu=a.nextElementSibling;if(!submenu)return;
    const open=a.getAttribute('aria-expanded')==='true';a.setAttribute('aria-expanded',String(!open));submenu.style.display=open?'none':'block';
  }));
  document.querySelectorAll('.main-sidebar a[href="#"], .main-header a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));
  render();
})();
