(function () {
  'use strict';
  const P=window.ConfidelineTicketPolicy,volatileDrafts=new Map(),volatileForms=new Map(),volatileAnswers=new Map();
  const clock=(source=state)=>Date.now()+Number(source?.demoClockOffsetHours||0)*P.HOUR;
  const stamp=value=>new Intl.DateTimeFormat('ru',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Minsk'}).format(new Date(value));
  const draftText=key=>volatileDrafts.has(key)?volatileDrafts.get(key):state.drafts[key]||'';
  function captureDraft(){const input=$('#cl-i-input');if(input?.dataset.clDraft)volatileDrafts.set(input.dataset.clDraft,input.value);}
  function clearDraft(key){volatileDrafts.delete(key);volatileAnswers.delete(key);const input=$('#cl-i-input');if(input?.dataset.clDraft===key)input.value='';}
  const answerIntent=key=>volatileAnswers.has(key)?volatileAnswers.get(key):state.composerMeta[key]?.answerIntent||null;
  function selectAnswer(qid) {
    const t=current(),dk=draftKey(t);let intent;
    try{intent=P.bindAnswer(t,qid,actor.id);}catch(error){ui.sendError=error.message;refreshPreservingView();return;}
    captureDraft();volatileAnswers.set(dk,intent);
    const saved=commit(s=>{const meta=s.composerMeta[dk]||={};meta.answerIntent=intent;});
    if(saved)ui.sendError='';refreshPreservingView();$('#cl-i-input')?.focus();
  }
  function makeOrdinaryMessage() {
    const dk=draftKey(current());captureDraft();volatileAnswers.set(dk,null);
    const saved=commit(s=>{const meta=s.composerMeta[dk]||={};delete meta.answerIntent;});
    ui.answer=null;if(saved)ui.sendError='';refreshPreservingView();$('#cl-i-input')?.focus();
  }
  const widgetName='Внутренний чат';
  const KEY='confideline-support-internal-integrated-20261013-v3-local',LEGACY_KEY='confideline-support-internal-integrated-20261013-v2',$=s=>document.querySelector(s),params=new URLSearchParams(location.search);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fa=n=>`<i class="fa fa-${n}" aria-hidden="true"></i>`,id=()=>crypto.randomUUID();
  const role=document.documentElement.dataset.internalView==='agent'?'agent':'moderator';
  // Legacy client-preview links must not create a client persona inside the admin layout.
  if(params.get('view')==='client'){params.delete('view');const url=new URL(location.href);url.search=params.toString();history.replaceState(null,'',url);}
  const directory=[
    {id:501,name:'Chapajev Wasil',initials:'CW',group:'staff',title:'Support',active:true},
    {id:502,name:'Alexey Saava',initials:'AS',group:'staff',title:'Moderator',active:true},
    {id:503,name:'Admin Admin',initials:'AA',group:'staff',title:'Super Admin',active:true},
    {id:104,name:'Alex Morgan',initials:'AM',group:'agent',title:'Агент',active:true},
    {id:201,name:'Sara Morgan',initials:'SM',group:'agent',title:'Агент',active:true},
    {id:203,name:'Nina North',initials:'NN',group:'agent',title:'Эксперт',active:true},
    {id:204,name:'Leo Rivera',initials:'LR',group:'agent',title:'Агент',active:false}
  ];
  const user=n=>directory.find(p=>p.id===Number(n)),staff=role==='moderator';
  const actor=staff?user(params.get('role')==='superadmin'||params.get('actor')==='admin'?503:params.get('actor')==='moderator'?502:501):user(params.get('actor')==='sara'?201:104);
  const superAdmin=staff&&actor.id===503;
  const pairId=(a,b)=>`direct-${[a,b].sort((x,y)=>x-y).join('-')}`;
  const canContact=(a,b)=>{const first=user(a),second=user(b);return Boolean(first?.active&&second?.active&&first.group!==second.group);};
  const contacts=()=>directory.filter(p=>canContact(actor.id,p.id));
  const workPeer=w=>user(w.participantIds.find(n=>n!==actor.id))||{name:'Недоступный пользователь',title:'Недоступен'};
  const canReadWork=w=>w.participantIds?.length===2&&w.participantIds.includes(actor.id);
  const newWork=peer=>({id:pairId(actor.id,peer.id),pairKey:pairId(actor.id,peer.id),participantIds:[actor.id,peer.id],agentId:staff?peer.id:actor.id,agent:staff?peer.name:actor.name,initials:staff?peer.initials:actor.initials,unreadBy:{},readCursors:{[actor.id]:0,[peer.id]:0},replyRequests:[],needsReplyBy:null,linkedTickets:[],messages:[]});
  const time=()=>new Intl.DateTimeFormat('ru',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Minsk'}).format(new Date());
  const msg=(by,userId,text,extra={})=>({id:id(),by,userId,text,time:time(),createdAt:new Date().toISOString(),...extra});
  const channel=(messages=[])=>({messages,unread:{},needsReplyBy:null});
  const person=(userId,name,initials)=>({userId,name,initials,verified:true});
  function ticket(number,title,people,extra={}) {
    return {id:number,title,kind:'internal_report',participants:people,reporterId:people[0]?.userId,reporter:people[0]?.name,owner:'Chapajev Wasil',sla:'До 14:30',context:'Техническая проблема',workflow:'waiting_support',clientId:null,client:'Не привязан',clientVerified:false,clientConnected:false,notes:[],questions:[],updates:[],requests:[],history:[],channels:{staff:channel(),...Object.fromEntries(people.map(p=>[`participant:${p.userId}`,channel()]))},...extra};
  }
  function audit(t,type,summary,extra={}) {t.history.push({id:id(),type,summary,actorId:actor.id,by:actor.name,time:time(),...extra});}
  function seed() {
    const one=ticket(1,'Проблема с оплатой подписки и доступом к группе',[],{kind:'client',reporter:'Morning@fg.uu',reporterId:2,client:'Morning@fg.uu',clientId:2,clientVerified:true,clientConnected:true,context:'Подписка · оплата'});
    one.notes=[{text:'Проверить платежи и подписку перед публичным ответом.',by:'Chapajev Wasil',pinned:true},{text:'Есть 2 похожих тикета, лучше сверить историю.',by:'moderator_ira',pinned:false},{text:'При подтверждении ошибки передать в биллинг.',by:'admin',pinned:false}];
    one.channels.staff=channel([msg('moderator_ira',502,'Платёж найден. Уточните, активировалась ли подписка?')]);one.channels.client=channel();one.channels.staff.unread[501]=true;
    const sara=ticket(22,'Не удалось подключиться к консультации',[person(201,'Sara Morgan','SM')],{client:'Daniel · #10491',clientId:10491,clientVerified:true,consultationId:'CT-1031',consultationVerified:true,context:'CT-1031 · приостановлена'});
    sara.channels['participant:201'].messages=[msg('Sara Morgan',201,'Не удалось подключиться к консультации. Вижу загрузку чата.')];
    const marcus=ticket(21,'Продолжение консультации',[person(202,'Marcus Antoniu','MA')],{kind:'client',client:'Елена · #10482',clientId:10482,clientVerified:true,clientConnected:true,context:'CT-1024 · завершена',consultationId:'CT-1024',consultationVerified:true});marcus.channels.client=channel();
    return {version:1,ticketSchema:2,cases:[one,sara,marcus],drafts:{},workChats:[{id:'agent-104',agentId:104,agent:'Alex Morgan',initials:'AM',owner:null,unreadBy:{moderator:true,agent:false},needsReplyBy:'moderator',linkedTickets:[],messages:[{id:'work-1',side:'agent',by:'Alex Morgan',userId:104,time:'10:12',text:'Здравствуйте! Можно ли согласовать разовый перенос времени консультации здесь, не меняя расписание на всю неделю?'},{id:'work-2',side:'agent',by:'Alex Morgan',userId:104,time:'10:14',text:'И отдельно: у Marcus не отображается оплаченная консультация CT-1042. Нужна проверка доступа.'}]}]};
  }
  function hydrate(s) {
    if(!s||s.version!==1||!Array.isArray(s.cases))s=seed();s.drafts??={};s.workChats??=seed().workChats;
    s.questionSettings=P.settings(s.questionSettings);s.demoClockOffsetHours??=0;
    // Keep previous local drafts and notes while splitting old conversations by audience.
    for(const t of s.cases) {
      if(!t.channels) {
        const w=s.workChats.find(w=>w.id===t.sourceWorkId),p=w?.agentId||({'Alex Morgan':104,'Sara Morgan':201,'Marcus Antoniu':202}[t.person]);
        t.participants=t.audience==='participant'&&p?[person(p,t.person,t.initials)]:[];t.reporterId=t.reporter===t.person?p:t.clientId;
        t.owner??='Chapajev Wasil';t.sla??='До 14:30';t.clientVerified=Boolean(t.clientId);t.consultationVerified=Boolean(t.context?.startsWith('CT-'));t.consultationId=t.consultationVerified?t.context.split(' · ')[0]:null;
        const key=t.participants.length?`participant:${p}`:'staff';t.channels={staff:channel(),[key]:channel((t.messages||[]).map(m=>({...m,id:m.id||id(),userId:m.own?501:p||502})))};
        t.channels[key].unread[501]=Boolean(t.unread);t.channels[key].needsReplyBy=t.needsReply?501:null;if(p)t.channels[key].unread[p]=Boolean(t.agentUnread);if(t.clientConnected)t.channels.client=channel();
        for(const q of t.questions||[]){q.channelKey=q.channel==='client'?'client':`participant:${p}`;q.recipientId=q.channel==='client'?t.clientId:p;q.id=String(q.id);}
        for(const u of t.updates||[]){u.recipientId=t.reporterId;u.time??=t.time;}
        delete t.messages;
      }
      t.history??=[];t.notes??=[];t.questions??=[];t.requests??=[];t.updates??=[];t.participants??=[];
      if(t.sourceRef==='chat-v2-report-1043'||t.sourceRef==='chat-v2-report-1045'){t.conversationId??=t.sourceRef==='chat-v2-report-1043'?66:71;t.conversationVerified=true;}
      for(const r of t.requests){r.id??=id();r.by??='Chapajev Wasil';r.time??=time();}
      if(s.drafts[t.id])s.drafts[`ticket:${t.id}:staff:501`]??=s.drafts[t.id];
      if(s.drafts[`ticket:${t.id}:agent`])s.drafts[`ticket:${t.id}:participant:104:104`]??=s.drafts[`ticket:${t.id}:agent`];
    }
    for(const w of s.workChats)for(const [r,p] of [['agent',w.agentId],['moderator',501]])if(s.drafts[`work:${w.id}:${r}`])s.drafts[`work:${w.id}:${p}`]??=s.drafts[`work:${w.id}:${r}`];
    for(const w of s.workChats) {
      if(!w.participantIds){const owner=directory.find(p=>p.group==='staff'&&p.name===w.owner)?.id||501;w.participantIds=[w.agentId,owner];w.unreadBy={[w.agentId]:Boolean(w.unreadBy?.agent),[owner]:Boolean(w.unreadBy?.moderator)};w.needsReplyBy=w.needsReplyBy==='moderator'?owner:w.needsReplyBy==='agent'?w.agentId:null;}
      w.pairKey??=pairId(...w.participantIds);w.linkedTickets??=[];w.messages??=[];w.unreadBy??={};
      w.replyRequests??=[];w.needsReplyBy=null;
      for(const n of w.participantIds)if(s.drafts[`work:${w.id}:${n}`])s.drafts[`work:${w.pairKey}:${n}`]??=s.drafts[`work:${w.id}:${n}`];
    }
    if(!s.cases.some(t=>t.sourceRef==='chat-v2-report-1043')) {
      const n=s.cases.some(t=>t.id===30)?Math.max(30,...s.cases.map(t=>t.id))+1:30;
      const t=ticket(n,'Не отправляются сообщения в консультации',[person(104,'Alex Morgan','AM'),person(201,'Sara Morgan','SM')],{sourceRef:'chat-v2-report-1043',sourceType:'chat_v2',context:'CT-1043 · профиль Marcus Antoniu',profile:'Marcus Antoniu',consultationId:'CT-1043',consultationVerified:true,client:'Daniel · #10491',clientId:10491,clientVerified:true});
      t.channels.staff.messages=[msg('moderator_ira',502,'Сначала проверим журнал отправки. Внутренние детали клиенту не передаём.')];t.channels.staff.unread[501]=true;
      t.channels['participant:104'].messages=[msg('Alex Morgan',104,'Во время CT-1043 перестали отправляться сообщения. Создал отчёт из Chat V2.')];t.channels['participant:104'].unread[104]=true;
      t.channels['participant:201'].messages=[msg('Chapajev Wasil',501,'Проверьте назначенный вам тестовый диалог.')];
      t.notes=[{text:'Сверить события отправки до подключения клиента.',by:'Chapajev Wasil',pinned:true}];t.updates=[{id:id(),recipientId:104,status:'Принято',text:'',by:'Chapajev Wasil',time:'12:20'}];
      t.history=[{id:id(),type:'report_created',summary:'Внутренний отчёт из Chat V2 · CT-1043',by:'Alex Morgan',time:'12:18'},{id:id(),type:'reporter_update',summary:'Автору отчёта: Принято',by:'Chapajev Wasil',time:'12:20'}];s.cases.push(t);
    }
    if(!s.cases.some(t=>t.sourceRef==='chat-v2-report-1045')) {
      const n=Math.max(30,...s.cases.map(t=>t.id))+1,t=ticket(n,'Уточнение расписания консультации',[person(104,'Alex Morgan','AM')],{sourceRef:'chat-v2-report-1045',sourceType:'chat_v2',workflow:'waiting_participant',context:'CT-1045 · профиль Elena Vega',profile:'Elena Vega',consultationId:'CT-1045',consultationVerified:true});
      const text='Подтвердите, пожалуйста, на какое время нужно перенести консультацию.',q={id:id(),channelKey:'participant:104',recipientId:104,target:'Alex Morgan',text,status:'open',time:'12:35'};
      t.questions=[q];t.channels['participant:104'].messages=[msg('Alex Morgan',104,'Нужно уточнить время консультации CT-1045.'),msg('Chapajev Wasil',501,text,{questionId:q.id})];t.channels['participant:104'].unread[104]=true;t.updates=[{id:id(),recipientId:104,status:'В работе',text:'Уточняем время.',by:'Chapajev Wasil',time:'12:30'}];t.history=[{id:id(),type:'question_created',summary:'У автора запрошено время переноса',by:'Chapajev Wasil',time:'12:35'}];s.cases.push(t);
    }
    if(params.get('ticket')==='closed'&&!s.cases.some(t=>t.sourceRef==='chat-v2-report-closed')) {
      const n=Math.max(30,...s.cases.map(t=>t.id))+1,t=ticket(n,'Отправка сообщений восстановлена',[person(104,'Alex Morgan','AM')],{sourceRef:'chat-v2-report-closed',sourceType:'chat_v2',workflow:'closed',context:'CT-1044 · завершена',consultationId:'CT-1044',consultationVerified:true});
      t.channels['participant:104'].messages=[msg('Chapajev Wasil',501,'Проверка завершена. Отправка сообщений восстановлена.')];t.updates=[{id:id(),recipientId:104,status:'Решено',text:'',by:'Chapajev Wasil',time:'11:20'}];t.history=[{id:id(),type:'closed',summary:'Обращение закрыто после завершения проверки',by:'Support',time:'12:20'}];s.cases.push(t);
    }
    s.workDraftMeta??={};s.operations??={};s.composerMeta??={};s.creationDrafts??={};
    if(!s.localRevision3){const w=s.workChats.find(w=>w.id==='agent-104');if(w&&w.messages.length===2){w.messages.push({id:'work-3',by:'Chapajev Wasil',userId:501,time:'10:16',text:'Разовый перенос можно согласовать. Проверим доступ отдельно.'},{id:'work-4',by:'Alex Morgan',userId:104,time:'10:18',text:'Клиент видит оплату, но кнопка входа в CT-1042 недоступна.'},{id:'work-5',by:'Chapajev Wasil',userId:501,time:'10:20',text:'Уточните, пожалуйста, время возникновения ошибки.'});w.replyRequests.push({id:'local-example-request',messageId:'work-5',requestedBy:501,recipientId:104,status:'open',createdAt:'2026-10-13T07:20:00Z'});}s.localRevision3=true;}
    for(const t of s.cases)if(t.workflow==='resolved'&&t.resolutionDeadline&&Date.parse(t.resolutionDeadline)<=clock(s)&&!ticketBlockers(t).length)markTicketClosed(t,'deadline',{id:0,name:'Система'});
    for(const w of s.workChats)normalizeReads(w,w.participantIds,'unreadBy');
    for(const t of s.cases)for(const c of Object.values(t.channels))normalizeReads(c,[501,502,503,...t.participants.map(p=>p.userId),...(t.clientId?[t.clientId]:[])],'unread');
    for(const t of s.cases){
      if(['medium','critical'].includes(t.priority)){t.legacyPriority=t.priority;t.priority=t.priority==='medium'?'normal':'urgent';}
      if(!t.authorCapabilities&&t.reporterId&&(t.kind==='client'||t.sourceRef?.startsWith('chat-v2-report-')||t.sourceRef?.startsWith('widget-demo-')))t.authorCapabilities={acceptResolution:true,returnForRework:true,demoFixture:true};
      for(const q of t.questions){P.normalize(q,s.questionSettings,clock(s),t.channels[q.channelKey]?.messages.find(m=>m.questionId===q.id)?.createdAt);if(q.status==='answered'&&!Number.isFinite(Date.parse(q.answeredAt)))q.answeredAt=q.deadlineAt;}
      P.milestones(t,clock(s));
    }
    s.ticketSchema=3;s.workSchema=3;return s;
  }
  function normalizeReads(c,people,flag) {
    c.readCursors??={};c.messages.forEach((m,i)=>m.seq=i+1);
    for(const n of people) {
      c.readCursors[n]??=c[flag][n]?0:c.messages.length;
      c[flag][n]=c.messages.some(m=>m.userId!==n&&m.seq>c.readCursors[n]);
    }
  }
  let state;try{const saved=localStorage.getItem(KEY);state=hydrate(JSON.parse(saved===null?localStorage.getItem(LEGACY_KEY):saved))}catch{state=hydrate(seed())}
const ui={open:false,section:'cases',selected:null,work:null,pendingPeer:null,directory:false,creating:false,contactQuery:'',contactRole:'all',workQuery:'',details:false,answer:null,filters:{cases:'active',work:'all'},channels:{},resizing:false,searchOpen:false,searchQuery:'',searchAt:0,menu:null,scrolls:{},markers:{},restoreScroll:null,scrollTarget:null,sendError:'',createError:'',questionsExpanded:!staff&&innerWidth>=768,demoSaveFailure:false};
  const LAYOUT_KEY=`${KEY}:width:${actor.id}`;
  let preferredWidth=null;
  try{const saved=localStorage.getItem(LAYOUT_KEY),legacy=localStorage.getItem(`${LEGACY_KEY}:width:${actor.id}`),value=Number(saved??legacy);if(Number.isFinite(value)&&value>=360&&value<=10000){preferredWidth=value;if(saved===null)localStorage.setItem(LAYOUT_KEY,String(value));}}catch{}
  let timer,modalAction=null,modalCaseId=null,returnFocus=null,committingAction=false;
  const current=()=>ui.work?(state.workChats.find(w=>w.id===ui.work&&canReadWork(w))||(ui.pendingPeer&&canContact(actor.id,ui.pendingPeer)?newWork(user(ui.pendingPeer)):null)):state.cases.find(t=>t.id===ui.selected);
  const visibleWork=()=>state.workChats.filter(w=>canReadWork(w)&&w.messages.length).sort((a,b)=>(b.lastActivity||0)-(a.lastActivity||0));
  const canSee=t=>staff||t.participants.some(p=>p.userId===actor.id&&p.verified);
  const visibleCases=()=>state.cases.filter(canSee);
  const keys=t=>staff?Object.keys(t.channels).filter(k=>k==='staff'||k==='client'&&t.clientConnected&&t.clientVerified||k.startsWith('participant:')&&t.participants.some(p=>`participant:${p.userId}`===k&&p.verified)):[`participant:${actor.id}`];
  const key=t=>staff?(keys(t).includes(ui.channels[t.id])?ui.channels[t.id]:'staff'):`participant:${actor.id}`;
  const questions=(t,k=key(t))=>t.questions.filter(q=>q.status==='open'&&q.channelKey===k);
  const unread=t=>keys(t).some(k=>t.channels[k]?.unread[actor.id]);
  const needs=t=>staff?keys(t).some(k=>t.channels[k]?.needsReplyBy===501)||t.questions.some(q=>P.timing(q,clock()).overdue):questions(t).length>0;
  const ownUpdate=t=>t.reporterId===actor.id?t.updates.filter(u=>u.recipientId===actor.id).at(-1):null;
  const closed=t=>t?.workflow==='closed';
  const workflow=t=>({new:'Новый',waiting_participant:'Ожидание участника',waiting_support:'Ожидание поддержки',resolved:'Решено',closed:'Закрыто'}[t.workflow]||'Ожидание поддержки');
  const slaLabel=t=>t.workflow==='waiting_participant'?'На паузе':['resolved','closed'].includes(t.workflow)?'Не активен':t.sla;
  const label=(t,k)=>k==='staff'?'Команда Support':k==='client'?`Клиент · ${t.client}`:t.participants.find(p=>`participant:${p.userId}`===k)?.name||'Участник';
  const draftKey=t=>ui.work?`work:${t.pairKey}:${actor.id}`:`ticket:${t.id}:${key(t)}:${actor.id}`;
  const stream=()=>ui.work?current():current()?.channels[key(current())];
  const isSplit=()=>innerWidth>=768&&effectiveWidth()>=680&&!ui.directory&&!ui.creating&&Boolean(ui.work||ui.selected);
  function rememberScroll(){const t=current(),log=$('#cl-i-messages');if(t&&log)ui.scrolls[draftKey(t)]=log.scrollTop;}
  function prepareThread(){ui.creating=false;ui.searchOpen=false;ui.searchQuery='';ui.menu=null;ui.sendError='';const t=current();if(!t)return;const dk=draftKey(t),c=stream();ui.restoreScroll=ui.scrolls[dk]??null;ui.markers[dk]=c.messages.find(m=>m.userId!==actor.id&&m.seq>(c.readCursors?.[actor.id]||0))?.id||null;ui.scrollTarget=ui.restoreScroll===null?ui.markers[dk]||'bottom':null;}
  function feedback(text) {const box=$('#cl-internal-feedback'),a=$('#cl-i-composer');box.style.bottom=ui.open&&a?`${innerHeight-a.getBoundingClientRect().top+10}px`:'18px';box.textContent=text;clearTimeout(timer);timer=setTimeout(()=>box.textContent='',3000);}
  function commit(change,operation='business') {
    let next;
    try {
      if(ui.demoSaveFailure&&operation!=='mark_read')throw Error('Демо: ошибка сохранения');
      next=hydrate(JSON.parse(localStorage.getItem(KEY))||JSON.parse(JSON.stringify(state)));
      if(committingAction&&modalCaseId!==null){const t=next.cases.find(t=>t.id===modalCaseId);if(!t||!canSee(t)||!P.mayMutate(t,operation))throw Error('Обращение закрыто или недоступно.');}
      change(next);hydrate(next);localStorage.setItem(KEY,JSON.stringify(next));state=next;return true;
    } catch(error) {
      if(error.code==='question_draft_conflict'&&next)state=next;
      ui.sendError=(error.message==='Демо: ошибка сохранения'?'Демо: ошибка сохранения. ':error.message+' ')+'Текст остаётся в поле.';
      const box=$('#cl-i-composer-error')||$('#cl-i-create-error')||$('#cl-i-modal-error');
      if(box){box.hidden=false;box.textContent=ui.sendError;}else feedback(ui.sendError);return false;
    }
  }
  let readFrame=null;
  function read() {if(readFrame===null)readFrame=requestAnimationFrame(()=>{readFrame=null;readVisible();});}
  function readVisible() {
    if(!ui.open||ui.directory||ui.creating||ui.menu||ui.resizing||document.visibilityState!=='visible'||!document.hasFocus()||$('#cl-internal-modal').open)return;
    const t=current(),log=$('#cl-i-messages');if(!t||!log)return;
    const stream=ui.work?t:t.channels[key(t)],rect=log.getBoundingClientRect();
    // Capture a rendered boundary, never the latest ID from a later storage response.
    const visible=Array.from(log.querySelectorAll('[data-cl-message]')).filter(n=>{const r=n.getBoundingClientRect();return r.bottom<=rect.bottom+1&&r.bottom>rect.top&&r.top<rect.bottom;});
    const boundary=visible.at(-1)?.dataset.clMessage,m=stream.messages.find(m=>m.id===boundary);if(!m||m.seq<=(stream.readCursors[actor.id]||0))return;
    const work=Boolean(ui.work),n=t.id,k=work?null:key(t);
    if(commit(s=>{const c=work?s.workChats.find(w=>w.id===n&&canReadWork(w)):s.cases.find(t=>t.id===n&&canSee(t))?.channels[k],shown=c?.messages.find(m=>m.id===boundary);if(shown)c.readCursors[actor.id]=Math.max(c.readCursors[actor.id]||0,shown.seq);},'mark_read'))refreshPreservingView();
  }
  function access() {const mobile=innerWidth<768,w=$('.content-wrapper');w.inert=mobile&&ui.open;for(const n of w.children)n.inert=!staff;$('.main-sidebar').inert=!staff||mobile&&ui.open;$('.main-footer').inert=!staff||mobile&&ui.open;const d=$('#cl-internal-drawer');d.setAttribute('role',mobile?'dialog':'complementary');if(mobile&&ui.open)d.setAttribute('aria-modal','true');else d.removeAttribute('aria-modal');}
  function toggle(open) {ui.open=open;if(open)read();render();(open?$('#cl-i-close'):$('#cl-internal-toggle')).focus();}
  function backToInbox() {rememberScroll();ui.selected=null;ui.work=null;ui.pendingPeer=null;ui.searchOpen=false;ui.menu=null;ui.answer=null;render();($(`#cl-i-tab-${ui.section}`)||$('#cl-i-inbox-title'))?.focus();}
  function choose(n) {if(!visibleCases().some(t=>t.id===n))return;rememberScroll();ui.open=true;ui.section='cases';ui.selected=n;ui.work=null;ui.pendingPeer=null;ui.directory=false;ui.details=false;ui.answer=null;const t=current();if(t.sourceType==='widget')ui.channels[n]=`participant:${t.reporterId}`;prepareThread();read();render();($('#cl-i-back')||$('#cl-i-close')).focus();}
  function chooseWork(n) {if(!visibleWork().some(w=>w.id===n))return;rememberScroll();ui.open=true;ui.section='work';ui.selected=null;ui.work=n;ui.pendingPeer=null;ui.directory=false;ui.answer=null;prepareThread();read();render();($('#cl-i-back')||$('#cl-i-tab-work')).focus();}
  function openRecipient(n) {if(!canContact(actor.id,n))return;rememberScroll();const w=state.workChats.find(w=>w.pairKey===pairId(actor.id,n)&&canReadWork(w));ui.open=true;ui.section='work';ui.directory=false;ui.selected=null;ui.work=w?.id||pairId(actor.id,n);ui.pendingPeer=Number(n);ui.answer=null;prepareThread();read();render();$('#cl-i-input')?.focus();}
  function switchSection(s) {rememberScroll();ui.section=s;ui.selected=null;ui.work=null;ui.pendingPeer=null;ui.directory=false;ui.creating=false;ui.searchOpen=false;ui.menu=null;ui.answer=null;read();render();$(`#cl-i-tab-${s}`).focus();}
  const compactWidth=()=>Math.min(440,Math.max(360,Math.round(innerWidth*.28)));
  const maxWidth=()=>Math.max(360,Math.floor(innerWidth*.75));
  const effectiveWidth=()=>innerWidth<768?innerWidth:Math.min(maxWidth(),Math.max(360,preferredWidth??compactWidth()));
  function saveWidth() {try{if(preferredWidth===null)localStorage.removeItem(LAYOUT_KEY);else localStorage.setItem(LAYOUT_KEY,String(preferredWidth));}catch{feedback('Размер изменён, но браузер не сохранил настройку.');}}
  function applyWidth() {
    const width=effectiveWidth(),d=$('#cl-internal-drawer');d.style.setProperty('--cl-drawer-width',`${width}px`);document.body.style.setProperty('--cl-drawer-width',`${width}px`);
    const separator=$('#cl-i-resize');if(separator){separator.setAttribute('aria-valuemin','360');separator.setAttribute('aria-valuemax',String(maxWidth()));separator.setAttribute('aria-valuenow',String(width));}
    const button=$('#cl-i-width');if(button){const wide=width>=innerWidth*.5-2;button.title=wide?'Компактная ширина':'На половину экрана';button.setAttribute('aria-label',wide?'Вернуть компактную ширину':'Развернуть на половину экрана');button.innerHTML=fa(wide?'compress':'expand');}
  }
  function bindWidth() {
    applyWidth();$('#cl-i-width').onclick=()=>{preferredWidth=effectiveWidth()>=innerWidth*.5-2?null:Math.round(innerWidth*.5);saveWidth();refreshPreservingView();};
    const edge=$('#cl-i-resize');let start=null;
    const finish=cancel=>{if(!start)return;const editing=document.activeElement?.id==='cl-i-input';if(cancel)preferredWidth=start.preferred;else saveWidth();start=null;ui.resizing=false;document.body.classList.remove('cl-messages-resizing');applyWidth();refreshPreservingView();if(!editing)$('#cl-i-resize')?.focus({preventScroll:true});};
    edge.onpointerdown=e=>{if(e.button!==0||innerWidth<768)return;e.preventDefault();start={x:e.clientX,width:effectiveWidth(),preferred:preferredWidth};ui.resizing=true;edge.setPointerCapture(e.pointerId);document.body.classList.add('cl-messages-resizing');};
    edge.onpointermove=e=>{if(!start)return;preferredWidth=Math.min(maxWidth(),Math.max(360,start.width+start.x-e.clientX));applyWidth();};
    edge.onpointerup=()=>finish(false);edge.onpointercancel=()=>finish(true);edge.onlostpointercapture=()=>finish(false);
    edge.ondblclick=()=>{preferredWidth=null;saveWidth();refreshPreservingView();};
    edge.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const step=e.shiftKey?50:20;preferredWidth=e.key==='Home'?360:e.key==='End'?maxWidth():Math.min(maxWidth(),Math.max(360,effectiveWidth()+(e.key==='ArrowLeft'?step:-step)));saveWidth();refreshPreservingView();$('#cl-i-resize').focus();};
  }
  function navigation() {
    const counts={cases:visibleCases().filter(t=>!closed(t)&&(unread(t)||needs(t))).length,work:visibleWork().filter(w=>w.unreadBy[actor.id]).length},wide=effectiveWidth()>=innerWidth*.5-2;
    return `<div class="cl-i-resize" id="cl-i-resize" role="separator" aria-orientation="vertical" aria-label="Ширина внутреннего чата" tabindex="0" title="Изменить ширину окна"></div><header class="cl-i-header"><h2 id="cl-i-inbox-title" tabindex="-1">${fa('comments-o')}${role==='client'?'Поддержка':widgetName}</h2><button class="cl-i-icon" id="cl-i-demo" title="Демонстрация и сроки" aria-label="Демонстрация и сроки">${fa('flask')}</button><button class="cl-i-icon cl-i-width-toggle" id="cl-i-width" title="${wide?'Компактная ширина':'На половину экрана'}" aria-label="${wide?'Вернуть компактную ширину':'Развернуть на половину экрана'}">${fa(wide?'compress':'expand')}</button><button class="cl-i-icon" id="cl-i-close" title="Закрыть" aria-label="Закрыть внутренний чат">${fa('times')}</button></header>${role==='client'?'':`<div class="cl-i-sections" role="tablist" aria-label="Разделы внутреннего чата">${[['cases','ticket','Тикеты'],['work','comment-o','Рабочие чаты']].map(([s,icon,text])=>`<button role="tab" id="cl-i-tab-${s}" data-cl-section="${s}" aria-selected="${ui.section===s}" aria-controls="cl-i-panel" tabindex="${ui.section===s?'0':'-1'}">${fa(icon)}<span>${text}</span>${counts[s]?`<span class="cl-i-section-count">${counts[s]}</span>`:''}</button>`).join('')}</div>`}`;
  }
  function inbox() {
    if(ui.section==='work')return workInbox();const list=visibleCases(),filter=ui.filters.cases;
    return `<div class="cl-i-body"><div class="cl-i-inbox-head"><div class="cl-i-dialog-heading"><strong>Обращения</strong>${role==='agent'?`<button class="cl-i-command" data-cl-new-ticket>${fa('plus')}Создать тикет</button>`:''}</div><div class="cl-i-filters">${[['active','Активные',list.filter(t=>!closed(t)).length],['closed','Закрытые',list.filter(closed).length]].map(([s,text,n])=>`<button class="cl-i-filter" data-cl-filter="${s}" aria-pressed="${filter===s}">${text}<span>${n}</span></button>`).join('')}</div></div><div class="cl-i-list">${list.filter(t=>filter==='closed'?closed(t):!closed(t)).map(t=>`<button class="cl-i-item ${ui.selected===t.id?'selected':''} ${unread(t)?'unread':''}" data-cl-case="${t.id}"><div class="cl-i-case-title">#${t.id} · ${esc(t.title)} ${unread(t)?'<span class="cl-i-dot" aria-label="Непрочитанное"></span>':''}</div><div class="cl-i-preview">${esc(t.sourceType==='chat_v2'?'По консультации · '+t.consultationId:t.context)}</div><span class="cl-i-tag">${esc(workflow(t))}</span>${needs(t)?'<span class="cl-i-tag amber">Нужен мой ответ</span>':''}</button>`).join('')||'<div class="cl-i-empty">Обращений пока нет</div>'}</div></div>`;
  }
  function newChatButton() {return `<button class="cl-i-icon" data-cl-new-chat title="Новый диалог" aria-label="Новый диалог">${fa('pencil-square-o')}</button>`;}
  function workInbox() {
    const list=visibleWork(),filter=ui.filters.work,query=ui.workQuery.trim().toLocaleLowerCase('ru'),shown=list.filter(w=>(filter==='unread'?w.unreadBy[actor.id]:true)&&`${workPeer(w).name} ${workPeer(w).title}`.toLocaleLowerCase('ru').includes(query));
    const filters=[['all','Все',list.length],['unread','Непрочитанные',list.filter(w=>w.unreadBy[actor.id]).length]];
    return `<div class="cl-i-body"><div class="cl-i-inbox-head cl-i-work-inbox-head"><div class="cl-i-dialog-heading"><strong>Диалоги</strong>${newChatButton()}</div><div class="cl-i-search-field">${fa('search')}<input id="cl-i-work-search" type="search" aria-label="Поиск диалогов по никнейму" placeholder="Поиск собеседника" maxlength="80" value="${esc(ui.workQuery)}"></div><div class="cl-i-filters">${filters.map(([s,text,n])=>`<button class="cl-i-filter" data-cl-filter="${s}" aria-pressed="${filter===s}">${text}<span>${n}</span></button>`).join('')}</div></div><div class="cl-i-list">${shown.map(w=>{const p=workPeer(w),last=w.messages.filter(m=>!m.system).at(-1),draft=draftText(`work:${w.pairKey}:${actor.id}`);return `<button class="cl-i-item ${ui.work===w.id?'selected':''} ${w.unreadBy[actor.id]?'unread':''}" data-cl-work="${w.id}"><span class="cl-i-avatar">${esc(p.initials||'?')}</span><span class="cl-i-dialog-copy"><span class="cl-i-item-head"><strong>${esc(p.name)}</strong><time>${esc(last?.time||'')}</time></span><small>${esc(p.title)}</small><span class="cl-i-preview">${draft?`<b class="cl-i-draft-label">Черновик:</b> ${esc(draft)}`:`${last?.userId===actor.id?'Вы: ':''}${esc(last?.text||'Вложение')}`}</span></span>${w.unreadBy[actor.id]?'<span class="cl-i-dot" aria-label="Непрочитанное"></span>':''}</button>`}).join('')||`<div class="cl-i-empty">${query?'Собеседник не найден':list.length?'Нет непрочитанных диалогов':'Диалогов пока нет'}</div>`}</div></div>`;
  }
  function recipientPicker() {
    const query=ui.contactQuery.trim().toLocaleLowerCase('ru'),list=contacts().filter(p=>(ui.contactRole==='all'||p.title===ui.contactRole)&&`${p.name} ${p.title}`.toLocaleLowerCase('ru').includes(query));
    return `<div class="cl-i-body"><div class="cl-i-thread-head"><button class="cl-i-icon" id="cl-i-directory-back" title="Назад" aria-label="Назад к диалогам">${fa('angle-left')}</button><div class="cl-i-person"><strong>Новый диалог</strong><small>${staff?'Агенты':'Сотрудники сайта'}</small></div></div><div class="cl-i-directory-search"><div class="cl-i-search-field">${fa('search')}<input type="search" id="cl-i-contact-search" placeholder="Никнейм" aria-label="Поиск собеседника по никнейму" maxlength="80" value="${esc(ui.contactQuery)}"></div>${staff?'':`<select id="cl-i-contact-role" aria-label="Роль собеседника">${['all','Support','Moderator','Super Admin'].map(r=>`<option value="${r}" ${r===ui.contactRole?'selected':''}>${r==='all'?'Все роли':r}</option>`).join('')}</select>`}</div><div class="cl-i-list" aria-label="Доступные собеседники">${list.map(p=>`<button class="cl-i-contact" data-cl-contact="${p.id}"><span class="cl-i-avatar">${esc(p.initials)}</span><span class="cl-i-item-person"><strong>${esc(p.name)}</strong><small>${esc(p.title)}</small></span>${fa('angle-right')}</button>`).join('')||'<div class="cl-i-empty">Собеседник не найден</div>'}</div></div>`;
  }
  function log(messages) {
    const c=stream(),marker=ui.markers[draftKey(current())];let day=null;
    return `<div class="cl-i-message-area"><div class="cl-i-messages" id="cl-i-messages" role="log" aria-label="Переписка выбранной аудитории">${messages.map((m,i)=>{
      const format=new Intl.DateTimeFormat('ru',{day:'numeric',month:'long',timeZone:'Europe/Minsk'}),stamp=m.createdAt?format.format(new Date(m.createdAt)):format.format(new Date()),date=stamp===format.format(new Date())?'Сегодня':stamp,dateHtml=day===date?'':`<div class="cl-i-day">${esc(date)}</div>`;day=date;
      const own=m.userId===actor.id,previous=messages[i-1],grouped=previous&&!previous.system&&previous.userId===m.userId&&previous.time===m.time;
      const quoted=messages.find(x=>x.id===m.replyToMessageId),peerRead=ui.work&&own&&(c.readCursors[workPeer(current()).id]||0)>=m.seq;
      const menu=ui.menu===m.id?`<div class="cl-i-message-menu" role="menu">${!ui.work&&closed(current())?'':`<button role="menuitem" data-cl-quote="${m.id}">${fa('reply')}Ответить</button>`}<button role="menuitem" data-cl-copy="${m.id}">${fa('copy')}Копировать</button></div>`:'';
      const link=m.linkedTicketId&&visibleCases().some(t=>t.id===m.linkedTicketId)?` <button class="cl-i-link" data-cl-linked-case="${m.linkedTicketId}">Обращение #${m.linkedTicketId} ${fa('angle-right')}</button>`:'';
      const text=highlight(m.text),body=`${quoted?quoteMarkup(quoted):''}<div class="cl-i-message-text">${text}</div>${attachmentMarkup(m.attachments)}<span class="cl-i-message-footer"><time>${esc(m.time)}</time>${own?`<span class="cl-i-receipt" role="img" aria-label="${peerRead?'Прочитано':'Отправлено'}" title="${peerRead?'Прочитано':'Отправлено'}">${fa(peerRead?'check-circle-o':'check')}</span>`:''}</span>`;
      return `${dateHtml}${marker===m.id?'<div class="cl-i-unread-divider">Новые сообщения</div>':''}${m.system?`<div class="cl-i-system" data-cl-message="${m.id}">${esc(m.text)}${link}</div>`:`<article data-cl-message="${m.id}" class="cl-i-message direct-chat-msg ${own?'own right':''} ${grouped?'grouped':''}">${!own&&!grouped?`<div class="cl-i-message-author">${esc(m.by)}</div>`:''}<div class="ticket-message-body direct-chat-text cl-i-bubble">${body}</div><button class="cl-i-icon cl-i-message-more" data-cl-message-menu="${m.id}" aria-label="Действия с сообщением" aria-haspopup="menu" aria-expanded="${ui.menu===m.id}" title="Действия с сообщением">${fa('ellipsis-h')}</button>${menu}</article>`}`;
    }).join('')||`<div class="cl-i-empty cl-i-empty-thread">${fa('comment-o')}<strong>${esc(ui.work?workPeer(current()).name:'Сообщений пока нет')}</strong></div>`}</div><button class="cl-i-icon cl-i-jump-bottom" id="cl-i-jump-bottom" title="К последним сообщениям" aria-label="К последним сообщениям" hidden>${fa('chevron-down')}</button></div>`;
  }
  function highlight(value){const text=String(value||''),query=ui.searchQuery.trim();if(!query)return esc(text);let result='',offset=0,index;while((index=text.toLocaleLowerCase('ru').indexOf(query.toLocaleLowerCase('ru'),offset))!==-1){result+=esc(text.slice(offset,index))+`<mark>${esc(text.slice(index,index+query.length))}</mark>`;offset=index+query.length;}return result+esc(text.slice(offset));}
  function quoteMarkup(message){return `<button type="button" class="message-reply-quote ticket-reply-quote" data-cl-jump-message="${message.id}" title="Перейти к сообщению"><span class="message-reply-author">${esc(message.userId===actor.id?'Вы':message.by)}</span><span class="message-reply-text">${esc(message.text||'Вложение')}</span></button>`;}
  function attachmentMarkup(files=[]){return files.map(f=>{if(f.localMetadataOnly)return '<div class="cl-i-attachment ticket-file-card">'+fa('file-o')+'<span>'+esc(f.name)+'<small>'+Math.ceil(f.size/1024)+' КБ · Не загружено</small></span></div>';return '<button type="button" class="cl-i-attachment ticket-file-card" data-cl-file="'+f.id+'" title="Открыть '+esc(f.name)+'">'+(f.type.startsWith('image/')?'<img src="'+esc(f.data)+'" alt="'+esc(f.name)+'">':fa('file-o'))+'<span>'+esc(f.name)+'<small>'+Math.ceil(f.size/1024)+' КБ</small></span></button>';}).join('');}
  function composer(t,text,enabled=true) {
    if(!ui.work&&closed(t))return '<div class="cl-i-required">Обращение закрыто · доступна история</div>';
    const intent=ui.work?null:answerIntent(draftKey(t)),answerState=P.answerIntentState(t,intent,actor.id);if(!ui.work)ui.answer=intent?.questionId||null;const canSend=enabled&&!answerState.conflict;
    const d=draftText(draftKey(t)),meta=state.composerMeta[draftKey(t)]||{},quoted=stream().messages.find(m=>m.id===meta.replyToMessageId),files=meta.attachments||[];
    return `<form class="cl-i-composer cl-i-source-composer" id="cl-i-composer">${answerState.conflict?`<div class="cl-i-answer-conflict" role="alert"><strong>${esc(answerState.message)}</strong><span>Текст сохранён для исходного вопроса.</span></div>`:''}${!ui.work?`<div class="cl-i-composer-label"><label for="cl-i-input">${esc(ui.answer?'Ответ на вопрос':staff?label(t,key(t)):'Сообщение Support')}</label>${ui.answer?'<button type="button" class="cl-i-link" id="cl-i-clear-answer">Сделать обычным сообщением</button>':''}</div>`:'<label class="sr-only" for="cl-i-input">Сообщение</label>'}${quoted?`<div class="cl-i-reply-preview">${quoteMarkup(quoted)}<button class="cl-i-icon" id="cl-i-clear-quote" type="button" title="Отменить цитирование" aria-label="Отменить цитирование">${fa('times')}</button></div>`:''}${files.length?`<div class="cl-i-attachment-preview">${files.map(f=>`<div>${fa(f.type.startsWith('image/')?'picture-o':'file-o')}<span>${esc(f.name)}</span><button type="button" class="cl-i-icon" data-cl-remove-file="${f.id}" title="Убрать вложение" aria-label="Убрать ${esc(f.name)}">${fa('times')}</button></div>`).join('')}</div>`:''}<div class="ticket-composer-input-row"><div class="ticket-composer-input-shell"><textarea id="cl-i-input" data-cl-draft="${esc(draftKey(t))}" class="form-control ticket-composer-textarea" rows="1" maxlength="3000" ${enabled?'':'disabled'} placeholder="${enabled?'Сообщение…':'Собеседник недоступен'}">${esc(d)}</textarea><div class="ticket-composer-input-actions"><button type="button" class="cl-i-icon" id="cl-i-attach" title="Прикрепить файл" aria-label="Прикрепить файл" ${enabled?'':'disabled'}>${fa('paperclip')}</button><span class="cl-i-draft-status" id="cl-i-draft-status" role="status"></span><button class="cl-i-icon cl-i-send cl-i-source-send" id="cl-i-send" type="submit" aria-label="Отправить сообщение" title="Отправить сообщение" data-cl-blocked="${!canSend}" ${canSend&&(d.trim()||files.length)?'':'disabled'}>${fa('paper-plane')}</button></div></div></div><input id="cl-i-file-input" type="file" accept="image/png,image/jpeg,image/webp,application/pdf,text/plain" hidden><div id="cl-i-composer-error" class="cl-i-validation" role="alert" ${ui.sendError&&!answerState.conflict?'':'hidden'}>${esc(ui.sendError)}</div></form>`;
  }
  const resultLabels={requested:'Запрошено',completed:'Выполнено',rejected:'Отклонено',failed:'Ошибка исполнения'};
  function requests(t) {return `<div class="cl-i-requests"><strong>Защищённые запросы</strong>${t.requests.map(r=>`<div class="cl-i-request-log"><strong>${esc(r.kind)}</strong> · <span class="cl-i-tag">${resultLabels[r.status]}</span><div>${esc(r.reason)}</div>${r.amount?`<div>${esc(r.amount)} USD</div>`:''}<small>${esc(r.by)} · ${esc(r.time)}</small>${r.result?`<div>Результат: ${esc(r.result.note)}<br><small>${esc(r.result.by)} · ${esc(r.result.time)}</small></div>`:''}${superAdmin&&r.status==='requested'?`<button class="cl-i-link" data-cl-resolve="${r.id}">Результат исполнителя</button>`:''}</div>`).join('')||'<div>Запросов нет</div>'}</div>`;}
  function ticketThread() {
    const t=current(),k=key(t),open=closed(t)?[]:questions(t),update=ownUpdate(t);
    ui.answer=answerIntent(draftKey(t))?.questionId||null;
    const actions=[['participant','Подключить участника'],['question','Задать вопрос'],['note','Внутренняя заметка'],...(t.kind==='internal_report'&&t.participants.some(p=>p.userId===t.reporterId)?[['update','Статус заявителю']]:[]),...(t.clientVerified||t.consultationVerified?[['protected','Запросить действие']]:[]),...(!t.clientConnected&&t.clientVerified?[['connect','Подключить клиента']]:[]),...(!closed(t)&&t.workflow!=='resolved'?[['resolve','Завершить тикет']]:[]),['close','Закрыть тикет']];
    return '<div class="cl-i-body"><div class="cl-i-thread-head"><button class="cl-i-icon" id="cl-i-back" title="К списку тикетов" aria-label="К списку тикетов">'+fa('angle-left')+'</button><div class="cl-i-person"><strong>#'+t.id+' · '+esc(t.title)+'</strong><small>'+esc(t.context)+'</small></div></div>'+
    '<section class="cl-i-context"><div class="cl-i-context-meta">'+(staff?'<span class="cl-i-tag">Статус тикета: '+workflow(t)+'</span><span class="cl-i-tag">'+esc(t.owner)+' · SLA '+esc(slaLabel(t))+'</span><button class="cl-i-link" id="cl-i-history">История</button><button class="cl-i-link" id="cl-i-context" aria-expanded="'+ui.details+'">'+fa(ui.details?'angle-up':'angle-down')+' Контекст</button>':ticketStatusMarkup(t,update))+'</div>'+
    (staff&&ui.details?'<div class="cl-i-notes"><strong>Участники · '+t.participants.length+'</strong><div>'+t.participants.map(p=>esc(p.name)+' · '+esc(user(p.userId)?.title||'Участник')).join('; ')+'</div><strong>Внутренние заметки · только Support</strong>'+t.notes.map((n,i)=>'<div class="cl-i-note">'+(n.pinned?fa('thumb-tack'):'')+' '+esc(n.text)+'<br><small>'+esc(n.by)+'</small> · <button class="cl-i-link" data-cl-pin="'+i+'">'+(n.pinned?'Открепить':'Закрепить')+'</button></div>').join('')+'</div>'+requests(t):'')+'</section>'+
    (staff?'<div class="cl-i-channels" role="group" aria-label="Аудитория переписки">'+keys(t).map(c=>'<button data-cl-channel="'+c+'" aria-pressed="'+(c===k)+'">'+esc(label(t,c))+(t.channels[c].unread[actor.id]?'<span class="cl-i-dot"></span>':'')+'</button>').join('')+'</div>':'')+
    '<div class="cl-i-tools"><span class="cl-i-private">'+fa('lock')+esc(k==='staff'?'Только команда Support':k==='client'?'Клиентский канал':'Только Support и '+label(t,k))+'</span>'+(staff?'<button class="btn btn-default" id="cl-i-actions" aria-expanded="false">'+fa('bars')+' Действия</button><div class="cl-i-menu" id="cl-i-action-menu" hidden>'+actions.map(([a,text])=>'<button data-cl-action="'+a+'">'+text+'</button>').join('')+'</div>':'')+'</div>'+
    (t.priority==='urgent'&&!closed(t)?'<div class="cl-i-urgent">'+fa('exclamation-triangle')+' Срочно: нужен немедленный ручной разбор Support, не ожидание 24 часов.</div>':'')+
    questionMarkup(t)+ticketLifecycleMarkup(t)+log(t.channels[k].messages)+composer(t,ui.answer?'Ответ на выбранный вопрос':'Обычное сообщение · '+label(t,k))+'</div>';
  }
  function questionMarkup(t) {
    const list=staff?t.questions:t.questions.filter(q=>q.recipientId===actor.id),open=list.filter(q=>q.status==='open'),overdue=open.filter(q=>P.timing(q,clock()).overdue).length;
    if(!list.length||!staff&&!open.length&&P.answerIntentState(t,answerIntent(draftKey(t)),actor.id).conflict)return '';
    const expanded=ui.questionsExpanded;
    return '<section class="cl-i-questions"><div class="cl-i-question-bar"><button class="cl-i-question-summary" id="cl-i-questions-toggle" aria-expanded="'+expanded+'">'+fa('question-circle')+' Вопросы: '+open.length+' ожидают'+(overdue?' · '+overdue+' просрочено':'')+fa(expanded?'angle-up':'angle-down')+'</button>'+(!expanded&&!staff&&open.length&&!closed(t)?'<button class="cl-i-link cl-i-quick-answer" data-cl-answer="'+open[0].id+'">Ответить на вопрос</button>':'')+'</div>'+
      (expanded?'<div class="cl-i-question-list">'+list.map(q=>{
        const x=P.timing(q,clock()),stateLabel=({open:'Ожидается ответ',answered:'Ответ получен',cancelled:'Вопрос отменён'})[q.status],c=t.channels[q.channelKey],message=c?.messages.find(m=>m.questionId===q.id),read=message&&message.seq<=(c.readCursors?.[q.recipientId]||0);
        return '<article class="cl-i-question '+(x.overdue?'is-overdue':'')+'" data-cl-question="'+esc(q.id)+'"><div class="cl-i-question-heading"><strong>'+esc(q.target)+'</strong><span class="cl-i-tag">'+stateLabel+'</span></div><div class="cl-i-question-text">'+esc(q.text)+'</div>'+
        '<small>Отправлен '+esc(stamp(q.sentAt))+' · '+(read?'Прочитан':'Не прочитан')+'</small>'+(q.legacyTiming?'<small>Демо: историческое время восстановлено</small>':'')+
        (q.internal?'<small>Внутренний срок: '+esc(stamp(q.deadlineAt))+' · '+q.targetHours+' кал. ч.</small>':'')+
        (x.overdue?'<strong class="cl-i-overdue">Срок истёк · Support: уточнить или переназначить</strong>':x.reminder?'<strong class="cl-i-reminder">Напоминание адресату · ожидается ответ</strong>':'')+
        (x.lateAnswer?'<small>Поздний ответ · '+esc(stamp(q.answeredAt))+'</small>':q.status==='answered'?'<small>Получен '+esc(stamp(q.answeredAt))+'</small>':q.status==='cancelled'?'<small>Отменён '+esc(stamp(q.cancelledAt))+'</small>':'')+
        (staff&&q.cancelReason?'<small>Причина · только Support: '+esc(q.cancelReason)+'</small>':'')+
        (q.status==='open'&&!closed(t)?'<div class="cl-i-question-actions">'+(staff?
          (t.workflow!=='waiting_participant'||t.waitingQuestionId!==q.id?'<button class="cl-i-link" data-cl-resume-question="'+q.id+'">Продолжить ожидание</button>':'<span>Следующий ход ожидается от адресата</span>')+
          (q.internal?'<button class="cl-i-link" data-cl-reassign-question="'+q.id+'">Переназначить</button>':'')+
          '<button class="cl-i-link" data-cl-cancel-question="'+q.id+'">Отменить вопрос</button>':
          '<button class="cl-i-link" data-cl-answer="'+q.id+'">'+(ui.answer===q.id?'Выбран для ответа':'Ответить на вопрос')+'</button>')+'</div>':'')+'</article>';
      }).join('')+'</div>':'')+'</section>';
  }
  function addParticipant() {
    const t=current(),n=t.id,list=directory.filter(p=>p.group==='agent'&&p.active&&!t.participants.some(x=>x.userId===p.id));
    if(!staff||closed(t))return;
    dialog('Подключить участника · #'+n,'<div class="cl-i-field"><label for="cl-i-member-search">Никнейм</label><input id="cl-i-member-search" type="search" maxlength="80"></div><div class="cl-i-field"><label for="cl-i-member">Агент / эксперт</label><select id="cl-i-member" required><option value="">Выберите участника</option>'+list.map(p=>'<option value="'+p.id+'">'+esc(p.name)+' · '+esc(p.title)+'</option>').join('')+'</select></div>'+field('cl-i-member-reason','Основание подключения · только Support')+'<p class="cl-i-conversion-privacy">'+fa('lock')+' Новый приватный канал. Чужая переписка и сообщения клиента не передаются.</p>','Подключить',()=>{
      const p=user($('#cl-i-member').value),reason=$('#cl-i-member-reason').value.trim();if(!p||!reason)return false;
      if(!commit(s=>{const live=s.cases.find(c=>c.id===n);P.addParticipant(live,p,reason,actor.id,clock(s));}))return false;
      ui.channels[n]='participant:'+p.id;render();return true;
    });
    $('#cl-i-member-search').oninput=e=>{const q=e.target.value.toLocaleLowerCase('ru');for(const o of $('#cl-i-member').options)if(o.value)o.hidden=!o.text.toLocaleLowerCase('ru').includes(q);};
  }
  function resumeQuestion(qid) {
    if(!staff||closed(current()))return;const n=current().id;
    if(commit(s=>{P.resume(s.cases.find(t=>t.id===n),qid,actor.id,clock(s));})){refreshPreservingView();$('#cl-i-questions-toggle')?.focus();}
  }
  function reassignQuestion(qid) {
    const t=current(),q=t.questions.find(x=>x.id===qid&&x.status==='open'),n=t.id;if(!staff||closed(t)||!q||!q.internal)return;
    const available=t.participants.filter(p=>p.verified&&p.userId!==q.recipientId&&!t.questions.some(x=>x.status==='open'&&x.recipientId===p.userId));
    dialog('Переназначить вопрос','<div class="cl-i-field"><label for="cl-i-reassign-recipient">Новый адресат</label><select id="cl-i-reassign-recipient" required><option value="">Выберите подключённого участника</option>'+available.map(p=>'<option value="'+p.userId+'">'+esc(p.name)+'</option>').join('')+'</select></div>'+field('cl-i-reassign-reason','Причина · только Support')+'<p>Исходный срок: '+esc(stamp(q.deadlineAt))+'. Он не изменится.</p>','Переназначить',()=>{
      const recipient=Number($('#cl-i-reassign-recipient').value),reason=$('#cl-i-reassign-reason').value.trim();if(!recipient||!reason)return false;
      if(!commit(s=>{const live=s.cases.find(t=>t.id===n),result=P.reassign(live,qid,recipient,reason,actor.id,clock(s));
        appendLifecycleMessage(live,result.old.channelKey,'Вопрос передан другому участнику. Ответ больше не требуется.');
        live.channels[result.q.channelKey].messages.push(msg(actor.name,actor.id,result.q.text,{questionId:qid}));
        live.channels[result.q.channelKey].unread[recipient]=true;
      }))return false;ui.channels[n]='participant:'+recipient;render();return true;
    });
  }
  function demoSettings() {
    const cfg=state.questionSettings;
    dialog('Демонстрация и сроки', '<div class="cl-i-demo-label">Только макет · не серверные таймеры</div>'+
      (superAdmin?'<div class="cl-i-field"><label for="cl-i-reminder-hours">Напоминание · календарные часы</label><input id="cl-i-reminder-hours" type="number" min="1" max="167" value="'+cfg.internalQuestionReminderHours+'" required></div><div class="cl-i-field"><label for="cl-i-target-hours">Внутренний срок ответа · календарные часы</label><input id="cl-i-target-hours" type="number" min="2" max="168" value="'+cfg.internalQuestionTargetHours+'" required></div><p>Стартовая гипотеза. Изменение относится только к новым вопросам.</p>':'<p>Внутренний вопрос: напоминание '+cfg.internalQuestionReminderHours+' ч., срок '+cfg.internalQuestionTargetHours+' ч. · стартовая гипотеза.</p>')+
      '<div class="cl-i-field"><label for="cl-i-clock-hours">Сдвиг времени макета · часы</label><input id="cl-i-clock-hours" type="number" min="0" max="168" value="'+state.demoClockOffsetHours+'" required></div><label class="cl-i-check"><input id="cl-i-save-failure" type="checkbox" '+(ui.demoSaveFailure?'checked':'')+'> Имитировать ошибку сохранения</label><p>Подтверждение решения — отдельное окно '+(state.resolutionWindowHours||24)+' ч. SLA тикета не меняется.</p>','Применить',()=>{
      let next;try{next=P.settings(superAdmin?{internalQuestionReminderHours:$('#cl-i-reminder-hours').value,internalQuestionTargetHours:$('#cl-i-target-hours').value}:cfg);}catch(error){$('#cl-i-modal-error').hidden=false;$('#cl-i-modal-error').textContent=error.message;return false;}
      const offset=Number($('#cl-i-clock-hours').value),failure=$('#cl-i-save-failure').checked,previous=ui.demoSaveFailure;ui.demoSaveFailure=false;
      const saved=commit(s=>{s.questionSettings=next;s.demoClockOffsetHours=offset;});if(!saved){ui.demoSaveFailure=previous;return false;}ui.demoSaveFailure=failure;refreshPreservingView();return true;
    });modalCaseId=null;
  }
  function workThread() {
    const w=current(),p=workPeer(w),enabled=canContact(actor.id,p.id);
    return `<div class="cl-i-body"><div class="cl-i-thread-head"><button class="cl-i-icon" id="cl-i-back" title="К списку диалогов" aria-label="К списку диалогов">${fa('angle-left')}</button><span class="cl-i-avatar">${esc(p.initials||'?')}</span><div class="cl-i-person"><strong>${esc(p.name)}</strong><small>${esc(p.title)} <span title="Личный диалог: ${esc(actor.name)} и ${esc(p.name)}">${fa('lock')}</span></small></div><button class="cl-i-icon" id="cl-i-search-toggle" title="Поиск в переписке" aria-label="Поиск в переписке" aria-expanded="${ui.searchOpen}">${fa('search')}</button>${newChatButton()}</div>${searchMarkup()}${log(w.messages)}${enabled?'':'<div class="cl-i-required">Собеседник недоступен · доступна история</div>'}${composer(w,'Сообщение',enabled)}</div>`;
  }
  function searchMarkup(){if(!ui.searchOpen)return '';const matches=searchMatches();return `<div class="chat-search-inline cl-i-thread-search"><div class="cl-i-search-field">${fa('search')}<input id="cl-i-message-search" type="search" placeholder="Найти сообщение" aria-label="Найти сообщение" value="${esc(ui.searchQuery)}" maxlength="100"></div><span role="status">${matches.length?`${ui.searchAt%matches.length+1}/${matches.length}`:ui.searchQuery?'Не найдено':''}</span><button class="cl-i-icon" id="cl-i-search-next" title="Следующее совпадение" aria-label="Следующее совпадение" ${matches.length?'':'disabled'}>${fa('chevron-down')}</button><button class="cl-i-icon" id="cl-i-search-close" title="Закрыть поиск" aria-label="Закрыть поиск">${fa('times')}</button></div>`;}
  function searchMatches(){const q=ui.searchQuery.trim().toLocaleLowerCase('ru');return q?(stream()?.messages||[]).filter(m=>String(m.text).toLocaleLowerCase('ru').includes(q)):[];}
  function dialog(title,body,text,action) {returnFocus=document.activeElement;modalCaseId=ui.work?null:current()?.id??null;$('#cl-internal-modal').classList.remove('cl-i-report-modal');$('#cl-internal-modal-body').oninput=null;$('#cl-internal-modal-body').onchange=null;$('#cl-internal-modal-title').textContent=title;$('#cl-internal-modal-body').innerHTML=body;$('#cl-internal-modal-submit').textContent=text;$('#cl-internal-modal-cancel').textContent='Отмена';modalAction=action;$('#cl-internal-modal').setAttribute('aria-labelledby','cl-internal-modal-title');$('#cl-internal-modal-body').insertAdjacentHTML('beforeend','<div id="cl-i-modal-error" class="cl-i-validation" role="alert" hidden></div>');$('#cl-internal-modal').showModal();($('#cl-internal-modal-body').querySelector('input:not([type="hidden"]),select,textarea,button')||$('#cl-internal-modal-submit')).focus();}
  function closeDialog() {$('#cl-internal-modal').close();$('#cl-internal-modal').classList.remove('cl-i-report-modal');$('#cl-internal-modal-body').oninput=null;$('#cl-internal-modal-body').onchange=null;if(returnFocus?.isConnected&&returnFocus.getClientRects().length)returnFocus.focus();else ($('#cl-i-actions')||$('#cl-i-close'))?.focus();read();}
  const field=(name,text,required=true)=>`<div class="cl-i-field"><label for="${name}">${text}</label><textarea id="${name}" maxlength="3000" ${required?'required':''}></textarea></div>`;
  function updateWorkflow(t,nextTurn) {if(closed(t))return;if(nextTurn)t.workflow=nextTurn;else if(!t.questions.some(q=>q.status==='open'))t.workflow='waiting_support';}
  function ticketStatusMarkup(t,update) {
    const status=t.workflow==='waiting_participant'?(questions(t).length?'Нужен ваш ответ':'Дополнительная проверка'):workflow(t);
    return '<span class="cl-i-tag">Статус тикета: '+esc(status)+'</span>'+(update?'<span class="cl-i-tag blue">Статус для вас: '+esc(update.status)+'</span>'+(update.text?'<span>'+esc(update.text)+'</span>':''):'');
  }
  function ticketBlockers(t) {
    const blockers=[],open=t.questions.filter(q=>q.status==='open').length,pending=t.requests.filter(r=>r.status==='requested').length;
    if(open)blockers.push('Не завершены адресные вопросы: '+open+'.');
    if(pending)blockers.push('Ожидаются результаты защищённых запросов: '+pending+'.');
    if(t.externalPause)blockers.push('Не завершена внешняя проверка.');
    return blockers;
  }
  function ticketLifecycleMarkup(t) {
    if(!P.canReview(t,actor.id,clock())||closed(t))return '';

    const deadline=t.resolutionDeadline?new Intl.DateTimeFormat('ru',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Minsk'}).format(new Date(t.resolutionDeadline)):'';
    return '<div class="cl-i-ticket-lifecycle"><strong>Решение готово</strong><small>Демо прав автора · требуется серверная сверка</small>'+(deadline?'<span>Окно подтверждения решения · до '+esc(deadline)+'</span>':'')+'<div class="cl-i-lifecycle-buttons"><button class="btn btn-primary" id="cl-i-confirm-resolution" type="button">'+fa('check')+' Подтвердить решение</button><button class="cl-i-link" id="cl-i-dispute-resolution" type="button">Проблема осталась</button></div></div>';
  }
  function appendLifecycleMessage(t,k,text,source=actor) {
    const c=t.channels[k];if(!c)return;c.messages.push(msg(source.name,source.id,text,{system:true}));c.unread??={};
    const recipient=k==='client'?t.clientId:t.participants.find(p=>p.verified&&k==='participant:'+p.userId)?.userId;
    for(const n of [501,502,503,...(recipient?[recipient]:[])])c.unread[n]=n!==source.id;
  }
  function markTicketClosed(t,reason,source=actor,note='') {
    if(t.workflow==='closed')return false;
    t.workflow='closed';t.closedAt=new Date().toISOString();t.closeReason=reason;
    for(const k of Object.keys(t.channels))appendLifecycleMessage(t,k,'Обращение закрыто.',source);
    t.history.push({id:id(),type:'closed',summary:'Обращение закрыто'+(reason==='deadline'?' по сроку подтверждения':reason==='author_confirmation'?' после подтверждения автора':reason==='client_close'?' клиентом':': '+note),actorId:source.id,by:source.name,time:time(),reason});
    return true;
  }
  function resolveTicket() {
    const original=current(),n=original.id;if(!staff||closed(original)||original.workflow==='resolved')return;
    const participantKeys=keys(original).filter(k=>k.startsWith('participant:')),hasClient=keys(original).includes('client'),targets=participantKeys.map(k=>label(original,k)).join(', ');
    dialog('Завершить тикет #'+n,'<p>Обращение перейдёт в «Решено».</p>'+(hasClient?field('cl-i-resolution-client','Итог для клиента'):'')+(participantKeys.length?'<p>Участники: '+esc(targets)+'</p>'+field('cl-i-resolution-participants','Итог для участников'):'')+(!hasClient&&!participantKeys.length?field('cl-i-resolution-staff','Итог · только Support'):'')+'<div class="cl-i-validation" id="cl-i-lifecycle-error" role="alert" hidden></div>','Отправить решение',()=>{
      const clientText=$('#cl-i-resolution-client')?.value.trim()||'',participantText=$('#cl-i-resolution-participants')?.value.trim()||'',staffText=$('#cl-i-resolution-staff')?.value.trim()||'';
      if(hasClient&&!clientText||participantKeys.length&&!participantText||!hasClient&&!participantKeys.length&&!staffText)return false;
      let completed=false,error='';
      const saved=commit(s=>{
        const t=s.cases.find(t=>t.id===n);if(!t||!canSee(t)||t.demoCanUpdate===false||closed(t)||t.workflow==='resolved'){error='Обращение уже изменилось или недоступно.';return;}
        const blockers=ticketBlockers(t);if(blockers.length){error=blockers.join(' ');return;}
        const available=keys(t).filter(k=>k!=='staff').sort(),expected=[...participantKeys,...(hasClient?['client']:[])].sort();if(available.join('|')!==expected.join('|')){error='Аудитория изменилась. Откройте завершение заново.';return;}
        if(hasClient){t.channels.client.messages.push(msg(actor.name,actor.id,clientText));t.channels.client.unread[t.clientId]=true;}
        for(const k of participantKeys){const p=t.participants.find(p=>k==='participant:'+p.userId);t.channels[k].messages.push(msg(actor.name,actor.id,participantText));t.channels[k].unread[p.userId]=true;}
        if(staffText)t.channels.staff.messages.push(msg(actor.name,actor.id,staffText));
        const hours=Number(s.resolutionWindowHours),windowHours=Number.isInteger(hours)&&hours>=1&&hours<=168?hours:24;
        t.workflow='resolved';t.resolvedAt=new Date(clock(s)).toISOString();t.resolutionDeadline=new Date(clock(s)+windowHours*3600000).toISOString();
        if(t.kind==='internal_report'&&t.participants.some(p=>p.verified&&p.userId===t.reporterId)){t.updates.push({id:id(),recipientId:t.reporterId,status:'Решено',text:'',by:actor.name,time:time()});audit(t,'reporter_update','Автору отчёта: Решено');}
        audit(t,'resolved','Обращение решено; ожидается подтверждение',{deadline:t.resolutionDeadline});completed=true;
      });
      if(!saved||!completed){const box=$('#cl-i-lifecycle-error');box.hidden=false;box.textContent=error||'Не удалось сохранить решение. Текст остаётся в форме.';return false;}render();return true;
    });
  }
  function closeCurrentTicket(confirmResolution=false) {
    const original=current(),n=original.id;if(ui.work||closed(original)||!staff&&!P.canReview(original,actor.id,clock()))return;
    const client=!staff,reasons=[['spam','Спам'],['duplicate','Дубликат'],...(superAdmin?[['senior_decision','Решение старшего сотрудника']]:[])];
    if(client&&!P.canReview(original,actor.id,clock()))return;
    dialog(confirmResolution?'Подтвердить решение':'Закрыть тикет #'+n,client?'<p>Обращение будет закрыто. История сохранится.</p><div class="cl-i-validation" id="cl-i-lifecycle-error" role="alert" hidden></div>':'<div class="cl-i-field"><label for="cl-i-close-reason">Причина закрытия</label><select id="cl-i-close-reason" required><option value="" selected disabled>Выберите причину</option>'+reasons.map(([value,text])=>'<option value="'+value+'">'+text+'</option>').join('')+'</select></div><div class="cl-i-field" id="cl-i-duplicate-wrap" hidden><label for="cl-i-duplicate-id">Номер исходного тикета</label><input id="cl-i-duplicate-id" type="number" min="1"></div>'+field('cl-i-close-note','Объяснение · только History Support')+'<div class="cl-i-validation" id="cl-i-lifecycle-error" role="alert" hidden></div>',client?'Закрыть обращение':'Закрыть тикет',()=>{
      const reason=client?(confirmResolution?'author_confirmation':'author_close'):$('#cl-i-close-reason').value,note=client?'':$('#cl-i-close-note').value.trim(),duplicateId=Number($('#cl-i-duplicate-id')?.value);
      if(!client&&(!reasons.some(([value])=>value===reason)||!note))return false;
      let done=false,error='';
      const saved=commit(s=>{
        const t=s.cases.find(t=>t.id===n);if(!t||!canSee(t)||closed(t)||!client&&t.demoCanUpdate===false){error='Обращение изменилось или недоступно.';return;}
        if(client&&!P.canReview(t,actor.id,clock(s))){error='Решение изменилось. Обновите обращение.';return;}
        const blockers=ticketBlockers(t);if(blockers.length){error=client?'Поддержка ещё завершает проверку. Закрытие пока недоступно.':blockers.join(' ');return;}
        if(reason==='duplicate'){const target=s.cases.find(c=>c.id===duplicateId&&c.id!==n&&canSee(c));if(!target||t.clientId&&target.clientId!==t.clientId){error='Выберите другой существующий тикет того же клиента.';return;}t.duplicateOf=target.id;}
        done=markTicketClosed(t,reason,actor,note);
      });
      if(!saved||!done){const box=$('#cl-i-lifecycle-error');box.hidden=false;box.textContent=error||'Не удалось закрыть обращение.';return false;}ui.answer=null;render();return true;
    });
    if(!client)$('#cl-i-close-reason').onchange=()=>{const duplicate=$('#cl-i-close-reason').value==='duplicate';$('#cl-i-duplicate-wrap').hidden=!duplicate;$('#cl-i-duplicate-id').required=duplicate;};
  }
  function growInput(){const input=$('#cl-i-input');if(!input)return;const style=getComputedStyle(input),line=parseFloat(style.lineHeight)||21,padding=parseFloat(style.paddingTop)+parseFloat(style.paddingBottom),base=line+padding,max=line*(innerHeight<=600&&input.closest('form').querySelector('.cl-i-answer-conflict')?2:5)+padding;input.style.height='0px';input.style.height=`${Math.min(max,Math.max(base,input.scrollHeight))}px`;input.style.overflowY=input.scrollHeight>max?'auto':'hidden';}
  function bindComposer(send) {
    const input=$('#cl-i-input');input.oninput=e=>{const d=draftKey(current()),v=e.target.value;volatileDrafts.set(d,v);ui.sendError='';$('#cl-i-composer-error').hidden=true;const saved=commit(s=>s.drafts[d]=v),files=state.composerMeta[d]?.attachments||[];$('#cl-i-send').disabled=(!v.trim()&&!files.length)||$('#cl-i-send').dataset.clBlocked==='true';$('#cl-i-draft-status').textContent=saved?'':'Не сохранено';growInput();};
    $('#cl-i-composer').onsubmit=e=>{e.preventDefault();if(!$('#cl-i-send').disabled)send();};input.onkeydown=e=>{if(!e.isComposing&&(e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();if(!$('#cl-i-send').disabled)send();}};
    $('#cl-i-attach').onclick=()=>$('#cl-i-file-input').click();$('#cl-i-file-input').onchange=e=>stageAttachment(e.target.files[0]);
    $('#cl-i-clear-quote')?.addEventListener('click',()=>{commit(s=>{const meta=s.composerMeta[draftKey(current())]||={};delete meta.replyToMessageId;});refreshPreservingView();$('#cl-i-input').focus();});
    document.querySelectorAll('[data-cl-remove-file]').forEach(b=>b.onclick=()=>{commit(s=>{const meta=s.composerMeta[draftKey(current())]||={};meta.attachments=(meta.attachments||[]).filter(f=>f.id!==b.dataset.clRemoveFile);});refreshPreservingView();$('#cl-i-input').focus();});growInput();
  }
  function stageAttachment(file){if(!file)return;const dk=draftKey(current()),allowed=['image/png','image/jpeg','image/webp','application/pdf','text/plain'];if(!allowed.includes(file.type)||file.size>1024*1024){ui.sendError='Выберите PNG, JPG, WebP, PDF или TXT до 1 МБ.';$('#cl-i-composer-error').hidden=false;$('#cl-i-composer-error').textContent=ui.sendError;return;}if((state.composerMeta[dk]?.attachments||[]).length>=2){ui.sendError='Можно прикрепить не больше двух файлов.';$('#cl-i-composer-error').hidden=false;$('#cl-i-composer-error').textContent=ui.sendError;return;}const reader=new FileReader();reader.onload=()=>{const added=commit(s=>{const meta=s.composerMeta[dk]||={};meta.attachments??=[];if(meta.attachments.length<2)meta.attachments.push({id:id(),name:file.name,type:file.type,size:file.size,data:String(reader.result)});});if(added&&current()&&draftKey(current())===dk){ui.sendError='';refreshPreservingView();$('#cl-i-input').focus();}};reader.onerror=()=>{ui.sendError='Не удалось прочитать файл.';refreshPreservingView();};reader.readAsDataURL(file);}
  function sendTicket() {
    if(closed(current())||!$('#cl-i-input'))return;
    const n=current().id,k=key(current()),text=$('#cl-i-input').value.trim(),dk=draftKey(current()),intent=answerIntent(dk),answer=intent?.questionId||null,meta=state.composerMeta[dk]||{};
    if(!text&&!meta.attachments?.length||answer&&!text)return;let sent=false;
    const saved=commit(s=>{
      const t=s.cases.find(t=>t.id===n);if(!P.mayMutate(t,'message')||!canSee(t)||!keys(t).includes(k)||!t.channels[k])return;
      if(intent)P.assertAnswerIntent(t,intent,actor.id);
      const q=answer?t.questions.find(q=>q.id===answer&&q.status==='open'&&q.channelKey===k&&q.recipientId===actor.id):null;
      if(answer&&!q)throw Error('Вопрос уже завершён или переназначен.');
      const original=t.channels[k].messages.find(m=>m.id===meta.replyToMessageId),questionMessage=q?t.channels[k].messages.find(m=>m.questionId===q.id):null;
      if(q)P.answer(t,q.id,actor.id,text,clock(s),intent);
      else if(P.canReview(t,actor.id,clock(s)))P.returnForRework(t,actor.id,text,clock(s));
      t.channels[k].messages.push(msg(actor.name,actor.id,text,{...(q?{answerTo:q.id}:{}),replyToMessageId:original?.id||questionMessage?.id,attachments:meta.attachments||[]}));
      if(staff){const p=k==='client'?t.clientId:t.participants.find(p=>'participant:'+p.userId===k)?.userId;if(p)t.channels[k].unread[p]=true;t.channels[k].needsReplyBy=null;}
      else{for(const p of [501,502,503])t.channels[k].unread[p]=true;t.channels[k].needsReplyBy=501;}
      s.drafts[dk]='';s.composerMeta[dk]={};sent=true;
    });
    if(!saved||!sent){if(saved)ui.sendError='Тикет недоступен. Текст остаётся в поле.';refreshPreservingView();return;}
    clearDraft(dk);ui.answer=null;ui.sendError='';ui.scrollTarget='bottom';render();$('#cl-i-input')?.focus();
  }
  function returnForRework() {
    const original=current(),n=original.id;if(!P.canReview(original,actor.id,clock()))return;
    dialog('Проблема осталась',field('cl-i-rework-text','Что осталось нерешённым'),'Вернуть на доработку',()=>{
      const text=$('#cl-i-rework-text').value.trim();if(!text)return false;
      if(!commit(s=>{const t=s.cases.find(t=>t.id===n);P.returnForRework(t,actor.id,text,clock(s));const k='participant:'+actor.id;
        if(!t.channels[k])throw Error('Канал автора недоступен.');t.channels[k].messages.push(msg(actor.name,actor.id,text));t.channels[k].needsReplyBy=501;
      }))return false;
      render();return true;
    });
  }
  function sendWork() {
    const currentChat=current(),peer=workPeer(currentChat),text=$('#cl-i-input').value.trim(),dk=draftKey(currentChat),meta=state.composerMeta[dk]||{};if((!text&&!meta.attachments?.length)||text.length>3000||!canContact(actor.id,peer.id))return;let sentId=null;
    if(!commit(s=>{let w=s.workChats.find(w=>w.pairKey===pairId(actor.id,peer.id));if(w&&!canReadWork(w)||!canContact(actor.id,peer.id))return;
      if(!w){w=newWork(peer);w.createdAt=new Date().toISOString();s.workChats.push(w);}
      const original=w.messages.find(m=>m.id===meta.replyToMessageId),message=msg(actor.name,actor.id,text,{replyToMessageId:original?.id,attachments:meta.attachments||[]});w.messages.push(message);
      w.lastActivity=Date.now();w.history??=[];w.history.push({id:id(),type:'message_sent',actorId:actor.id,time:new Date().toISOString()});s.drafts[dk]='';s.composerMeta[dk]={};sentId=w.id;
    })||!sentId){ui.sendError='Не удалось отправить. Текст остаётся в поле.';const error=$('#cl-i-composer-error');error.hidden=false;error.textContent=ui.sendError;return;}ui.work=sentId;ui.pendingPeer=null;clearDraft(dk);ui.sendError='';ui.scrollTarget='bottom';render();$('#cl-i-input').focus();
  }
  const reportCategories=[['consultation','Вопрос о консультации'],['payment','Платеж'],['access','Доступ к сервису'],['technical','Техническая ошибка'],['consultation_complaint','Жалоба на консультацию'],['other','Другое']];
  const reportPriorities=[['low','Низкий'],['normal','Обычный'],['high','Высокий'],['urgent','Срочный']];
  const reportAccept='.jpg,.jpeg,image/jpeg,.png,image/png,.webp,image/webp,.heic,image/heic,.pdf,application/pdf,.txt,text/plain,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.csv,text/csv';
  function reportContexts() {
    const active=$('#admin-agent-chat .conv-item.active[data-conversation-id]'),currentChat=active?{id:'chat:'+active.dataset.conversationId,conversationId:active.dataset.conversationId,conversationVerified:true,profile:active.dataset.senderName,client:active.dataset.recipientName,clientId:Number(active.dataset.recipientUserId),clientVerified:true}:null;
    return [...(currentChat?[currentChat]:[]),...visibleCases().filter(t=>t.conversationVerified&&t.conversationId&&t.participants.some(p=>p.userId===actor.id&&p.verified))].filter((t,i,a)=>a.findIndex(x=>x.conversationId===t.conversationId)===i);
  }
  function reportFileError(files) {
    if(files.length>10)return 'Можно выбрать до 10 файлов.';
    if(files.some(f=>f.size>15*1024*1024))return 'Размер каждого файла — не больше 15 МБ.';
    if(files.reduce((sum,f)=>sum+f.size,0)>30*1024*1024)return 'Общий размер файлов — не больше 30 МБ.';
    if(files.some(f=>!/\.(jpe?g|png|webp|heic|pdf|txt|docx|xlsx|csv)$/i.test(f.name)))return 'Выберите JPG, PNG, WebP, HEIC, PDF, TXT, DOCX, XLSX или CSV.';
    return '';
  }
  function newTicket(){openReportForm();}
  function openReportForm(conversationId=null) {
    if(role!=='agent')return;
    const entry=conversationId?'chat_v2':'widget',draftId=actor.id+':'+entry+':'+(conversationId||'none'),contexts=reportContexts(),saved=volatileForms.get(draftId)||state.creationDrafts[draftId]||{},linked=contexts.find(t=>String(t.conversationId)===String(conversationId)),draft={...saved,contextId:conversationId?(linked?.id||''):(saved.contextId||'')};
    const options=(list,value,placeholder)=>'<option value="" disabled'+(!value?' selected':'')+'>'+placeholder+'</option>'+list.map(([key,text])=>'<option value="'+key+'"'+(key===value?' selected':'')+'>'+text+'</option>').join('');
    let files=[],fileError='';
    const body='<div class="cl-i-report-form"><div class="form-group"><select class="form-control" id="cl-i-ticket-category" name="category" aria-label="Категория" required>'+options(reportCategories,draft.category,'Категория')+'</select></div><div class="form-group"><select class="form-control" id="cl-i-ticket-priority" name="priority" aria-label="Приоритет" required>'+options(reportPriorities,draft.priority,'Приоритет')+'</select></div><div class="form-group"><input class="form-control" id="cl-i-ticket-title" name="title" aria-label="Краткое описание" placeholder="Краткое описание" maxlength="255" required value="'+esc(draft.title||'')+'"></div><div class="form-group"><textarea class="form-control" id="cl-i-ticket-description" name="description" aria-label="Подробности, шаги, ожидаемый и фактический результат" placeholder="Подробности, шаги, ожидаемый и фактический результат" maxlength="10000" rows="4" required>'+esc(draft.description||'')+'</textarea></div><div class="form-group"><input class="form-control" id="cl-i-ticket-files" name="attachments[]" type="file" aria-label="Вложения" accept="'+reportAccept+'" multiple><small>До 10 файлов, по 15 МБ каждый и 30 МБ на сообщение. JPG, PNG, WebP, HEIC, PDF, TXT, DOCX, XLSX, CSV.</small></div><div class="form-group cl-i-report-context"><label for="cl-i-ticket-context">Чат · необязательно</label><select class="form-control" id="cl-i-ticket-context"><option value="">Без привязки к чату</option>'+contexts.map(t=>'<option value="'+t.id+'"'+(String(draft.contextId)===String(t.id)?' selected':'')+'>Чат #'+esc(t.conversationId)+' · '+esc(t.profile||t.context)+(t.clientVerified?' → '+esc(t.client):'')+'</option>').join('')+'</select></div><div id="cl-i-create-error" class="cl-i-validation" role="alert" hidden></div></div>';
    const saveDraft=()=>{const previous=volatileForms.get(draftId)||state.creationDrafts[draftId]||{},value={operationKey:previous.operationKey||id(),entry,category:$('#cl-i-ticket-category').value,priority:$('#cl-i-ticket-priority').value,title:$('#cl-i-ticket-title').value,description:$('#cl-i-ticket-description').value,contextId:$('#cl-i-ticket-context').value};volatileForms.set(draftId,value);return commit(s=>s.creationDrafts[draftId]=value);};
    const showError=text=>{const box=$('#cl-i-create-error');box.hidden=!text;box.textContent=text;};
    dialog('Сообщить о проблеме',body,'Отправить',()=>{
      const form=$('#cl-internal-modal-form');if(!form.reportValidity())return false;
      if(fileError){showError(fileError);return false;}if(!saveDraft()){showError('Не удалось сохранить. Данные остаются в форме.');return false;}
      const data=state.creationDrafts[draftId];if(!data.title.trim()||!data.description.trim()){showError('Заполните краткое описание и подробности.');return false;}
      let created=null;
      const stored=commit(s=>{
        const previous=s.operations[data.operationKey];if(previous){created=previous.ticketId;return;}
        const context=data.contextId?(String(data.contextId).startsWith('chat:')?reportContexts().find(t=>String(t.id)===data.contextId):s.cases.find(t=>t.id===Number(data.contextId)&&t.conversationVerified&&t.participants.some(p=>p.userId===actor.id&&p.verified))):null;if(data.contextId&&!context)return;
        const n=Math.max(31,...s.cases.map(t=>t.id))+1,t=ticket(n,data.title.trim(),[person(actor.id,actor.name,actor.initials)],{category:data.category,priority:data.priority,sourceType:entry,sourceRef:'widget-demo-'+data.operationKey,authorCapabilities:{acceptResolution:true,returnForRework:true,demoFixture:true},context:context?'Чат #'+context.conversationId:'Общий вопрос',conversationId:context?.conversationId||null,conversationVerified:Boolean(context),profile:context?.profile||null,consultationId:context?.consultationId||null,consultationVerified:Boolean(context?.consultationVerified),clientId:context?.clientId||null,client:context?.client||'Не привязан',clientVerified:Boolean(context?.clientVerified),clientConnected:false});
        t.channels['participant:'+actor.id].messages.push(msg(actor.name,actor.id,data.description.trim(),{attachments:files.map(f=>({id:id(),name:f.name,size:f.size,type:f.type||'application/octet-stream',localMetadataOnly:true}))}));
        for(const staffId of [501,502,503])t.channels['participant:'+actor.id].unread[staffId]=true;
        t.updates.push({id:id(),recipientId:actor.id,status:'Принято',text:'',by:'Support',time:time()});audit(t,'report_created','Обращение создано: '+actor.name);s.cases.unshift(t);s.operations[data.operationKey]={ticketId:n};s.creationDrafts[draftId]={};created=n;
      });
      if(!stored){showError('Не удалось сохранить. Данные остаются в форме.');return false;}
      if(!created){showError('Чат недоступен. Выберите другой или уберите привязку.');return false;}
      volatileForms.delete(draftId);choose(created);return true;
    });
    modalCaseId=null;$('#cl-internal-modal').classList.add('cl-i-report-modal');
    $('#cl-internal-modal-body').oninput=()=>{showError(fileError);saveDraft();};
    $('#cl-internal-modal-body').onchange=()=>{files=Array.from($('#cl-i-ticket-files').files);fileError=reportFileError(files);showError(fileError);saveDraft();};
    $('#cl-i-ticket-category').focus();
  }
  function changeWorkRequest(requestId,action,messageId) {
    const w=current();if(!w||!canReadWork(w)||!canContact(actor.id,workPeer(w).id))return;
    let changed=false;
    commit(s=>{
      const live=s.workChats.find(c=>c.id===w.id&&canReadWork(c));if(!live)return;
      if(messageId){const m=live.messages.find(m=>m.id===messageId&&m.userId===actor.id&&!m.system);if(!m||live.replyRequests.some(r=>r.messageId===m.id&&r.status==='open'))return;live.replyRequests.push({id:id(),messageId:m.id,requestedBy:actor.id,recipientId:workPeer(live).id,status:'open',createdAt:new Date().toISOString()});}
      else {
        const r=live.replyRequests.find(r=>r.id===requestId&&r.status==='open');if(!r)return;
        if(action==='answer'&&r.recipientId===actor.id){s.workDraftMeta[draftKey(live)]={answerId:r.id,requestReply:false};changed=true;return;}
        if(action==='cancel'&&r.requestedBy===actor.id||action==='dismiss'&&r.recipientId===actor.id){r.status=action==='cancel'?'cancelled':'dismissed';r.closedAt=new Date().toISOString();r.closedBy=actor.id;live.messages.push(msg(actor.name,actor.id,action==='cancel'?'Запрос ответа отменён.':'Отметка «Нужен ответ» снята получателем.',{system:true}));}
        else return;
      }
      changed=true;
    });
    if(changed){refreshPreservingView();if(action==='answer')$('#cl-i-input').focus();}
  }
  function caseAction(action) {
    if(!staff||ui.work||closed(current()))return;const t=current(),n=t.id;
    if(action==='participant'){addParticipant();return;}
    if(action==='resolve'){resolveTicket();return;}
    if(action==='close'){closeCurrentTicket();return;}
    if(action==='question') {
      const targets=[...t.participants.filter(p=>p.verified).map(p=>({userId:p.userId,name:p.name,key:`participant:${p.userId}`})),...(t.clientConnected&&t.clientVerified?[{userId:t.clientId,name:`Клиент · ${t.client}`,key:'client'}]:[])];if(!targets.length){feedback('Сначала подключите агента/эксперта или проверенный клиентский канал.');return;}
      dialog('Задать вопрос',`<div class="cl-i-field"><label for="cl-i-recipient">Адресат</label><select id="cl-i-recipient" required><option value="" disabled ${key(t)==='staff'?'selected':''}>Выберите адресата</option>${targets.map(p=>`<option value="${p.key}" ${p.key===key(t)?'selected':''}>${esc(p.name)}</option>`).join('')}</select></div>${field('cl-i-question-text','Вопрос')}<div id="cl-i-question-error" class="cl-i-validation" hidden></div>`,'Отправить вопрос',()=>{
        const k=$('#cl-i-recipient').value,p=targets.find(p=>p.key===k),text=$('#cl-i-question-text').value.trim();if(!p||!text)return false;let added=false;
        if(!commit(s=>{const c=s.cases.find(t=>t.id===n);if(!c.channels[k]||!keys(c).includes(k)||c.questions.some(q=>q.channelKey===k&&q.status==='open'))return;
          const q=P.ask(c,{id:id(),recipientId:p.userId,text,actorId:actor.id},s.questionSettings,clock(s));c.channels[k].messages.push(msg(actor.name,actor.id,text,{questionId:q.id}));c.channels[k].unread[p.userId]=true;c.channels[k].needsReplyBy=null;added=true;}))return false;
        if(!added){$('#cl-i-question-error').hidden=false;$('#cl-i-question-error').textContent='У адресата уже есть открытый вопрос либо канал недоступен.';return false;}ui.channels[n]=k;ui.questionsExpanded=true;render();return true;
      });
    }
    if(action==='note') {dialog('Внутренняя заметка',`<div class="cl-i-template-row">${[['Платёж','Проверить оплату перед публичным ответом.'],['История','Сверить историю предыдущих обращений.'],['Эскалация','Передать подтверждённую проблему старшему сотруднику.']].map(([text,value])=>`<button type="button" class="btn btn-default" data-cl-template="${value}">${text}</button>`).join('')}</div>${field('cl-i-note-text','Заметка · только Support')}`,'Сохранить',()=>{const text=$('#cl-i-note-text').value.trim();if(!text)return false;if(!commit(s=>{const c=s.cases.find(t=>t.id===n);c.notes.push({text,by:actor.name,pinned:false});audit(c,'note_added','Добавлена внутренняя заметка');}))return false;ui.details=true;render();return true;});document.querySelectorAll('[data-cl-template]').forEach(b=>b.onclick=()=>{$('#cl-i-note-text').value=b.dataset.clTemplate;$('#cl-i-note-text').focus();});}
    if(action==='update'&&t.kind==='internal_report') {dialog('Статус автору отчёта',`<p>${esc(t.reporter)} · #${n}</p><div class="cl-i-field"><label for="cl-i-reporter-status">Статус для заявителя</label><select id="cl-i-reporter-status">${['Принято','В работе','Нужна информация','Консультация приостановлена','Эскалировано','Решено'].map(s=>`<option>${s}</option>`).join('')}</select></div>${field('cl-i-reporter-text','Пояснение · необязательно',false)}`,'Отправить статус',()=>{const text=$('#cl-i-reporter-text').value.trim(),status=$('#cl-i-reporter-status').value;if(!commit(s=>{const c=s.cases.find(t=>t.id===n);if(!c.participants.some(p=>p.userId===c.reporterId&&p.verified))return;c.updates.push({id:id(),recipientId:c.reporterId,status,text,by:actor.name,time:time()});c.channels[`participant:${c.reporterId}`].unread[c.reporterId]=true;audit(c,'reporter_update',`Автору отчёта: ${status}`);}))return false;render();feedback('Статус заявителю отправлен. Статус тикета не изменён.');return true;});}
    if(action==='connect'&&t.clientVerified&&!t.clientConnected) {dialog('Подключить клиента',`<p><strong>${esc(t.client)}</strong></p><dl class="cl-i-facts"><dt>Источник связи</dt><dd>${esc(t.consultationId||t.context)}</dd><dt>Тикет</dt><dd>#${n}</dd><dt>Ответственный</dt><dd>${esc(t.owner)}</dd><dt>SLA</dt><dd>${esc(t.sla)}</dd></dl><p class="cl-i-conversion-privacy">${fa('lock')}В клиентском канале нет внутреннего отчёта, заметок и переписки участников.</p>`,'Открыть канал',()=>{let opened=false;if(!commit(s=>{const c=s.cases.find(t=>t.id===n);if(c.clientConnected||!c.clientVerified||!c.clientId)return;c.clientConnected=true;c.channels.client=channel();audit(c,'client_channel_opened',`Открыт клиентский канал: ${c.client}`,{clientId:c.clientId});opened=true;}))return false;if(!opened)return false;ui.channels[n]='client';render();feedback(`Клиентский канал открыт в тикете #${n}.`);return true;});}
    if(action==='protected'&&(t.clientVerified||t.consultationVerified)) {
      const kinds=[...(t.clientVerified?['Возврат','Изменить доступ']:[]),...(t.consultationVerified?['Приостановить консультацию','Возобновить консультацию','Завершить консультацию']:[])];
      dialog('Запросить защищённое действие',`<div class="cl-i-field"><label for="cl-i-request-kind">Действие</label><select id="cl-i-request-kind">${kinds.map(k=>`<option>${k}</option>`).join('')}</select></div><div class="cl-i-field" id="cl-i-amount-wrap"><label for="cl-i-request-amount">Сумма, USD</label><input id="cl-i-request-amount" type="number" min="0.01" step="0.01" required></div>${field('cl-i-request-reason','Основание')}<div class="cl-i-validation" id="cl-i-request-error" hidden></div>`,'Создать запрос',()=>{
        const kind=$('#cl-i-request-kind').value,reason=$('#cl-i-request-reason').value.trim(),amount=kind==='Возврат'?$('#cl-i-request-amount').value:'';if(!reason||kind==='Возврат'&&!(Number(amount)>0))return false;let added=false;
        if(!commit(s=>{const c=s.cases.find(t=>t.id===n);if(c.requests.some(r=>r.kind===kind&&r.status==='requested'))return;const r={id:id(),kind,reason,amount,status:'requested',by:actor.name,time:time()};c.requests.push(r);audit(c,'protected_requested',`Запрошено: ${kind}`,{requestId:r.id});added=true;}))return false;
        if(!added){$('#cl-i-request-error').hidden=false;$('#cl-i-request-error').textContent='Такой запрос уже ожидает результата.';return false;}ui.details=true;render();feedback('Запрос зарегистрирован. Действие не выполнено.');return true;
      });$('#cl-i-request-kind').onchange=()=>{const refund=$('#cl-i-request-kind').value==='Возврат';$('#cl-i-amount-wrap').hidden=!refund;$('#cl-i-request-amount').required=refund;};$('#cl-i-request-kind').onchange();
    }
  }
  function cancelQuestion(qid) {
    if(!staff||closed(current()))return;const n=current().id;
    dialog('Отменить вопрос',field('cl-i-cancel-reason','Причина · только Support'),'Отменить вопрос',()=>{
      const reason=$('#cl-i-cancel-reason').value.trim();if(!reason)return false;
      if(!commit(s=>{const t=s.cases.find(c=>c.id===n),q=P.cancel(t,qid,reason,actor.id,clock(s));appendLifecycleMessage(t,q.channelKey,'Вопрос отменён. Ответ больше не требуется.');}))return false;
      render();return true;
    });
  }
  function resolveRequest(rid) {if(!superAdmin)return;const n=current().id;dialog('Результат исполнителя',`<div class="cl-i-field"><label for="cl-i-result-status">Результат</label><select id="cl-i-result-status"><option value="completed">Completed · Выполнено</option><option value="rejected">Rejected · Отклонено</option><option value="failed">Failed · Ошибка исполнения</option></select></div>${field('cl-i-result-note','Подтверждение или причина')}`,'Зафиксировать результат',()=>{const status=$('#cl-i-result-status').value,note=$('#cl-i-result-note').value.trim();if(!note||!['completed','rejected','failed'].includes(status))return false;let done=false;if(!commit(s=>{const t=s.cases.find(t=>t.id===n),r=t.requests.find(r=>r.id===rid&&r.status==='requested');if(!r)return;r.status=status;r.result={by:'Super Admin',time:time(),note};audit(t,'protected_result',`${r.kind}: ${resultLabels[status]}`,{requestId:rid,result:status});done=true;}))return false;if(!done)return false;render();return true;});}
  function historyMarkup(t) {
    if(!staff)return '';
    return '<div class="ticket-history-list cl-i-audit-list">'+t.history.map(e=>{
      const reassigned=e.type==='question_reassigned',q=t.questions.find(q=>q.id===e.questionId);
      const personName=(snapshot,n)=>snapshot||t.participants.find(p=>p.userId===n)?.name||user(n)?.name||'#'+n;
      const at=e.createdAt||e.time,when=Number.isFinite(Date.parse(at))?stamp(at)+' · '+at:at;
      return '<div class="ticket-history-item" data-cl-audit-id="'+esc(e.id)+'"><strong>'+esc(e.summary)+'</strong>'+
        (reassigned?'<dl class="cl-i-reassignment-facts"><dt>Вопрос</dt><dd>'+esc(e.questionText||q?.text||'Недоступен')+'<small>ID: '+esc(e.questionId)+'</small></dd><dt>Прежний адресат</dt><dd>'+esc(personName(e.fromRecipientName,e.fromRecipientId))+'</dd><dt>Новый адресат</dt><dd>'+esc(personName(e.toRecipientName,e.toRecipientId))+'</dd><dt>Причина</dt><dd>'+esc(e.reason||'Не записана')+'</dd></dl>':'')+
        '<small>'+esc(user(e.actorId)?.name||e.by)+' · '+esc(when)+'</small></div>';
    }).join('')+'</div>';
  }
  function showHistory() {if(!staff)return;const t=current();dialog(`История · #${t.id}`,historyMarkup(t),'Закрыть',()=>true);$('#cl-internal-modal-cancel').textContent='Закрыть';}
  const canImport=t=>staff&&canSee(t)&&!['closed','resolved'].includes(t.workflow)&&t.demoCanUpdate!==false&&Boolean(t.channels.staff);
  function importedIds(s,wid) {return new Set(s.cases.flatMap(t=>[...(t.sourceWorkId===wid?t.sourceMessageIds||[]:[]),...(t.imports||[]).filter(x=>x.conversationId===wid).map(x=>x.messageId)]));}
  function createWorkTicket() {
    const w=current();if(!staff||!canReadWork(w))return;
    if($('#cl-i-work-menu'))$('#cl-i-work-menu').hidden=true;
    const used=importedIds(state,w.id),available=w.messages.filter(m=>!m.system&&!used.has(m.id));
    if(!available.length){feedback('Все сообщения уже переданы в обращения.');return;}
    const operation={key:id(),mode:'existing',target:'',title:`Рабочий вопрос: ${w.agent}`,reporterId:w.agentId,ids:[]};
    const choices=()=>{
      const targets=state.cases.filter(canImport);
      return `<fieldset class="cl-i-transfer-modes"><legend>Куда передать</legend><label><input type="radio" name="transferMode" value="existing" ${operation.mode==='existing'?'checked':''}> В существующее</label><label><input type="radio" name="transferMode" value="new" ${operation.mode==='new'?'checked':''}> В новое обращение</label></fieldset>
        <div class="cl-i-field" id="cl-i-existing-target"><label for="cl-i-target-ticket">Обращение</label><select id="cl-i-target-ticket" required><option value="">Выберите обращение</option>${targets.map(t=>`<option value="${t.id}" ${String(t.id)===String(operation.target)?'selected':''}>#${t.id} · ${esc(t.title)}</option>`).join('')}</select></div>
        <div id="cl-i-new-target"><div class="cl-i-field"><label for="cl-i-new-ticket-title">Тема</label><input id="cl-i-new-ticket-title" maxlength="160" required value="${esc(operation.title)}"></div><div class="cl-i-field"><label for="cl-i-reporter">Заявитель</label><select id="cl-i-reporter">${[user(w.agentId),actor].map(p=>`<option value="${p.id}" ${operation.reporterId===p.id?'selected':''}>${esc(p.name)} · ${esc(p.title)}</option>`).join('')}</select></div></div>
        <fieldset class="cl-i-message-selection"><legend>Сообщения для передачи</legend>${available.map(m=>`<label class="cl-i-select-message"><input type="checkbox" name="sourceMessage" value="${m.id}" ${operation.ids.includes(m.id)?'checked':''}><span><small>${esc(m.by)} · ${esc(m.time)}</small><span>${esc(m.text)}</span></span></label>`).join('')}</fieldset><div id="cl-i-selection-error" class="cl-i-validation" role="alert" hidden>Выберите хотя бы одно сообщение.</div>`;
    };
    const showChoices=()=>{
      $('#cl-internal-modal-body').innerHTML=choices();$('#cl-internal-modal-submit').textContent='Далее';modalAction=review;
      const mode=()=>{operation.mode=$('input[name="transferMode"]:checked').value;$('#cl-i-existing-target').hidden=operation.mode!=='existing';$('#cl-i-target-ticket').disabled=operation.mode!=='existing';$('#cl-i-new-target').hidden=operation.mode!=='new';$('#cl-i-new-ticket-title').disabled=operation.mode!=='new';$('#cl-i-reporter').disabled=operation.mode!=='new';};
      document.querySelectorAll('input[name="transferMode"]').forEach(n=>n.onchange=mode);mode();
    };
    const review=()=>{
      operation.ids=Array.from(document.querySelectorAll('input[name="sourceMessage"]:checked')).map(n=>n.value);
      operation.target=$('#cl-i-target-ticket').value;operation.title=$('#cl-i-new-ticket-title').value.trim();operation.reporterId=Number($('#cl-i-reporter').value);
      if(!operation.ids.length){$('#cl-i-selection-error').hidden=false;return false;}
      const target=state.cases.find(t=>t.id===Number(operation.target));
      if(operation.mode==='existing'&&!target)return false;
      const chosen=w.messages.filter(m=>operation.ids.includes(m.id)),reporter=user(operation.reporterId),targetTitle=target?`#${target.id} · ${target.title}`:`Новое обращение · ${operation.title}`;
      $('#cl-internal-modal-body').innerHTML=`<button type="button" class="cl-i-link" id="cl-i-transfer-back">${fa('angle-left')} Изменить выбор</button><dl class="cl-i-transfer-summary"><dt>Обращение</dt><dd>${esc(targetTitle)}</dd><dt>Канал</dt><dd>Команда Support · служебный</dd><dt>Будут видеть</dt><dd>Сотрудники Support с доступом к этому обращению</dd><dt>Заявитель</dt><dd>${esc(target?target.reporter:reporter.name)}</dd></dl><p class="cl-i-transfer-privacy">${fa('lock')} Клиенту и участникам эти сообщения не отправляются. Доступ к личному диалогу не предоставляется.</p>${operation.mode==='new'?`<p class="cl-i-transfer-membership">Участник нового обращения: ${esc(user(w.agentId).name)}. Его канал будет пустым; личная переписка в него не копируется.</p>`:'<p class="cl-i-transfer-membership">Состав участников и права обращения не изменятся.</p>'}<h3 class="cl-i-transfer-heading">Выбранные сообщения · ${chosen.length}</h3><div class="cl-i-transfer-preview">${chosen.map(m=>`<article><small>${esc(m.by)} · ${esc(m.time)}</small><p>${esc(m.text)}</p></article>`).join('')}</div>`;
      $('#cl-i-transfer-back').onclick=showChoices;$('#cl-internal-modal-submit').textContent='Подтвердить передачу';modalAction=confirm;$('#cl-internal-modal-submit').focus();return false;
    };
    const confirm=()=>{
      let result=null,reason='Обращение или диалог недоступны. Выберите актуальное назначение.';
      const saved=commit(s=>{
        if(s.operations[operation.key]){result=s.operations[operation.key];return;}
        const live=s.workChats.find(c=>c.id===w.id&&canReadWork(c));if(!live||!canContact(actor.id,workPeer(live).id))return;
        const chosen=live.messages.filter(m=>!m.system&&operation.ids.includes(m.id)),used=importedIds(s,w.id);
        if(chosen.length!==operation.ids.length||chosen.some(m=>used.has(m.id))){reason='Выбранные сообщения уже переданы или изменился доступ. Повторной копии не создано.';return;}
        let target;
        if(operation.mode==='existing'){target=s.cases.find(t=>t.id===Number(operation.target));if(!target||!canImport(target))return;}
        else {
          const agent=user(live.agentId),reporter=[agent,actor].find(p=>p.id===operation.reporterId);if(!reporter||!operation.title)return;
          target=ticket(Math.max(30,...s.cases.map(t=>t.id))+1,operation.title,[person(agent.id,agent.name,agent.initials)],{sourceType:'work_chat',reporterId:reporter.id,reporter:reporter.name});s.cases.push(target);
        }
        target.imports??=[];
        for(const m of chosen){target.channels.staff.messages.push({...m,id:id(),source:{conversationId:live.id,messageId:m.id},seq:undefined});target.imports.push({conversationId:live.id,messageId:m.id,channel:'staff',operationKey:operation.key});}
        audit(target,'messages_imported',`Из личного диалога переданы выбранные сообщения: ${chosen.length}`,{operationKey:operation.key,channel:'staff',sourceMessageIds:operation.ids});
        if(!live.linkedTickets.includes(target.id))live.linkedTickets.push(target.id);
        live.messages.push(msg(actor.name,actor.id,`Выбранные сообщения переданы в служебный канал обращения #${target.id}.`,{system:true,linkedTicketId:target.id}));
        result={ticketId:target.id,count:chosen.length};s.operations[operation.key]=result;
      });
      if(!saved)return false;if(!result){feedback(reason);return false;}render();feedback(`Передано ${result.count} сообщения. Обращение #${result.ticketId}.`);return true;
    };
    dialog('Передать в обращение','','Далее',review);showChoices();
  }
  function render() {
    captureDraft();
    const count=visibleCases().filter(t=>!closed(t)&&(unread(t)||needs(t))).length+visibleWork().filter(w=>w.unreadBy[actor.id]).length;$('#cl-internal-count').textContent=count>99?'99+':count||'';$('#cl-internal-toggle').setAttribute('aria-expanded',String(ui.open));$('#cl-internal-toggle').setAttribute('aria-label',`${widgetName}. Тикеты и рабочие чаты. Требуют внимания: ${count}`);$('#cl-internal-drawer').hidden=!ui.open;document.body.classList.toggle('cl-messages-open',ui.open);access();applyWidth();if(!ui.open)return;
    if(ui.selected&&!visibleCases().some(t=>t.id===ui.selected)){ui.selected=null;ui.answer=null;}if(ui.work&&!current()){ui.work=null;ui.pendingPeer=null;}
    const t=current(),d=$('#cl-internal-drawer'),split=isSplit(),content=ui.directory?recipientPicker():ui.work?workThread():ui.selected?ticketThread():inbox();d.innerHTML=navigation()+`<div id="cl-i-panel" class="${split?'cl-i-panel-split':''}" ${role==='client'?'':`role="tabpanel" aria-labelledby="cl-i-tab-${ui.section}"`}>${split?`<div class="cl-i-master">${inbox()}</div>`:''}<div class="cl-i-detail">${content}</div></div>`;$('#cl-i-close').onclick=()=>toggle(false);$('#cl-i-demo').onclick=demoSettings;bindWidth();
    if(ui.selected&&!ui.directory){$('#cl-i-support-info')?.remove();const meta=d.querySelector('.cl-i-context-meta .cl-i-tag:nth-child(2)');if(staff&&meta)meta.textContent=`${t.owner} · SLA ${slaLabel(t)}`;if(closed(t)){d.querySelectorAll('#cl-i-actions,#cl-i-action-menu,[data-cl-pin],[data-cl-resolve]').forEach(n=>n.remove());}}
    if(staff&&!ui.work&&t?.category&&t?.priority){for(const text of [reportCategories.find(([value])=>value===t.category)?.[1],reportPriorities.find(([value])=>value===t.priority)?.[1]])if(text){const tag=document.createElement('span');tag.className='cl-i-tag';tag.textContent=text;d.querySelector('.cl-i-context-meta')?.append(tag);}}
    d.querySelectorAll('[data-cl-section]').forEach(b=>{b.onclick=()=>switchSection(b.dataset.clSection);b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();switchSection(e.key==='Home'?'cases':e.key==='End'?'work':ui.section==='cases'?'work':'cases');}};});
    d.querySelectorAll('[data-cl-new-chat]').forEach(b=>b.onclick=()=>{rememberScroll();ui.directory=true;ui.creating=false;ui.menu=null;ui.contactQuery='';ui.contactRole='all';render();$('#cl-i-contact-search').focus();});
    d.querySelectorAll('[data-cl-new-ticket]').forEach(b=>b.onclick=newTicket);
    d.querySelectorAll('[data-cl-filter]').forEach(b=>b.onclick=()=>{ui.filters[ui.section]=b.dataset.clFilter;refreshPreservingView();$(`[data-cl-filter="${ui.filters[ui.section]}"]`).focus();});
    d.querySelectorAll('[data-cl-case]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.clCase)));d.querySelectorAll('[data-cl-work]').forEach(b=>b.onclick=()=>chooseWork(b.dataset.clWork));
    if($('#cl-i-work-search'))$('#cl-i-work-search').oninput=e=>{ui.workQuery=e.target.value;refreshPreservingView();};
    if(ui.directory){$('#cl-i-directory-back').onclick=()=>{ui.directory=false;render();(d.querySelector('[data-cl-new-chat]')||$('#cl-i-tab-work')).focus();};$('#cl-i-contact-search').oninput=e=>{ui.contactQuery=e.target.value;refreshPreservingView();};if($('#cl-i-contact-role'))$('#cl-i-contact-role').onchange=e=>{ui.contactRole=e.target.value;render();$('#cl-i-contact-role').focus();};d.querySelectorAll('[data-cl-contact]').forEach(b=>b.onclick=()=>openRecipient(Number(b.dataset.clContact)));return;}
    if(!ui.selected&&!ui.work)return;
    if($('#cl-i-back'))$('#cl-i-back').onclick=backToInbox;
    if(ui.work) {
      bindComposer(sendWork);
      $('#cl-i-search-toggle').onclick=()=>{ui.searchOpen=!ui.searchOpen;if(!ui.searchOpen)ui.searchQuery='';refreshPreservingView();$('#cl-i-message-search')?.focus();};
      if($('#cl-i-message-search')){
        $('#cl-i-message-search').oninput=e=>{ui.searchQuery=e.target.value;ui.searchAt=0;refreshPreservingView();const match=searchMatches()[0];if(match)jumpMessage(match.id);};
        const next=()=>{const matches=searchMatches();if(matches.length){ui.searchAt=(ui.searchAt+1)%matches.length;refreshPreservingView();jumpMessage(matches[ui.searchAt].id);$('#cl-i-message-search').focus();}};
        $('#cl-i-search-next').onclick=next;$('#cl-i-message-search').onkeydown=e=>{if(!e.isComposing&&e.key==='Enter'){e.preventDefault();next();}};
        $('#cl-i-search-close').onclick=()=>{ui.searchOpen=false;ui.searchQuery='';refreshPreservingView();$('#cl-i-search-toggle').focus();};
      }
    } else {
      d.querySelectorAll('[data-cl-channel]').forEach(b=>b.onclick=()=>{rememberScroll();ui.channels[t.id]=b.dataset.clChannel;ui.answer=null;prepareThread();read();render();$(`[data-cl-channel="${b.dataset.clChannel}"]`).focus();});
      if($('#cl-i-questions-toggle'))$('#cl-i-questions-toggle').onclick=()=>{ui.questionsExpanded=!ui.questionsExpanded;refreshPreservingView();$('#cl-i-questions-toggle').focus();};
      d.querySelectorAll('[data-cl-resume-question]').forEach(b=>b.onclick=()=>resumeQuestion(b.dataset.clResumeQuestion));d.querySelectorAll('[data-cl-reassign-question]').forEach(b=>b.onclick=()=>reassignQuestion(b.dataset.clReassignQuestion));
      if($('#cl-i-context'))$('#cl-i-context').onclick=()=>{ui.details=!ui.details;render();$('#cl-i-context').focus();};if($('#cl-i-history'))$('#cl-i-history').onclick=showHistory;
      if($('#cl-i-confirm-resolution'))$('#cl-i-confirm-resolution').onclick=()=>closeCurrentTicket(true);
      if($('#cl-i-client-close'))$('#cl-i-client-close').onclick=()=>closeCurrentTicket(false);
      if($('#cl-i-dispute-resolution'))$('#cl-i-dispute-resolution').onclick=returnForRework;
      if($('#cl-i-history'))$('#cl-i-history').textContent='История';
      if($('#cl-i-actions'))$('#cl-i-actions').onclick=()=>{const m=$('#cl-i-action-menu');m.hidden=!m.hidden;$('#cl-i-actions').setAttribute('aria-expanded',String(!m.hidden));};d.querySelectorAll('[data-cl-action]').forEach(b=>b.onclick=()=>{$('#cl-i-action-menu').hidden=true;caseAction(b.dataset.clAction);});
      d.querySelectorAll('[data-cl-answer]').forEach(b=>b.onclick=()=>selectAnswer(b.dataset.clAnswer));d.querySelectorAll('[data-cl-cancel-question]').forEach(b=>b.onclick=()=>cancelQuestion(b.dataset.clCancelQuestion));d.querySelectorAll('[data-cl-resolve]').forEach(b=>b.onclick=()=>resolveRequest(b.dataset.clResolve));
      d.querySelectorAll('[data-cl-pin]').forEach(b=>b.onclick=()=>{commit(s=>{const c=s.cases.find(c=>c.id===t.id);if(closed(c))return;const n=c.notes[Number(b.dataset.clPin)];n.pinned=!n.pinned;audit(c,'note_pinned',n.pinned?'Заметка закреплена':'Заметка откреплена');});render();});if($('#cl-i-clear-answer'))$('#cl-i-clear-answer').onclick=makeOrdinaryMessage;if($('#cl-i-composer'))bindComposer(sendTicket);
    }
    bindMessageActions();const messages=$('#cl-i-messages');if(messages){messages.scrollTop=ui.restoreScroll??messages.scrollHeight;ui.restoreScroll=null;if(ui.scrollTarget==='bottom')messages.scrollTop=messages.scrollHeight;else if(ui.scrollTarget)jumpMessage(ui.scrollTarget);ui.scrollTarget=null;messages.addEventListener('scroll',()=>{updateJump();read();},{passive:true});$('#cl-i-jump-bottom').onclick=()=>{messages.scrollTop=messages.scrollHeight;updateJump();read();};updateJump();}read();
  }
  function updateJump(){const log=$('#cl-i-messages'),button=$('#cl-i-jump-bottom');if(log&&button)button.hidden=log.scrollHeight-log.clientHeight-log.scrollTop<48;}
  function jumpMessage(messageId){const log=$('#cl-i-messages'),target=log?.querySelector(`[data-cl-message="${CSS.escape(messageId)}"]`);if(!target)return;log.scrollTop+=target.getBoundingClientRect().top-log.getBoundingClientRect().top-16;target.classList.add('cl-i-highlight');setTimeout(()=>target.classList.remove('cl-i-highlight'),1200);updateJump();}
  function bindMessageActions(){const d=$('#cl-internal-drawer');d.querySelectorAll('[data-cl-linked-case]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.clLinkedCase)));d.querySelectorAll('[data-cl-message-menu]').forEach(b=>b.onclick=()=>{ui.menu=ui.menu===b.dataset.clMessageMenu?null:b.dataset.clMessageMenu;refreshPreservingView();if(ui.menu)d.querySelector('[role="menuitem"]')?.focus();});d.querySelectorAll('[data-cl-quote]').forEach(b=>b.onclick=()=>{if(!ui.work&&closed(current()))return;const messageId=b.dataset.clQuote;commit(s=>{const meta=s.composerMeta[draftKey(current())]||={};meta.replyToMessageId=messageId;});ui.menu=null;refreshPreservingView();$('#cl-i-input')?.focus();});d.querySelectorAll('[data-cl-jump-message]').forEach(b=>b.onclick=()=>jumpMessage(b.dataset.clJumpMessage));d.querySelectorAll('[data-cl-copy]').forEach(b=>b.onclick=async()=>{const message=stream().messages.find(m=>m.id===b.dataset.clCopy);if(!message)return;let copied=false;try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(message.text);copied=true;}else{const input=document.createElement('textarea');input.value=message.text;d.append(input);input.select();copied=document.execCommand('copy');input.remove();}}catch{}ui.menu=null;refreshPreservingView();if($('#cl-i-draft-status'))$('#cl-i-draft-status').textContent=copied?'Скопировано':'Не удалось скопировать';});d.querySelectorAll('[role="menuitem"]').forEach(b=>b.onkeydown=e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();const items=Array.from(d.querySelectorAll('[role="menuitem"]')),index=items.indexOf(b);items[(index+(e.key==='ArrowDown'?1:items.length-1))%items.length].focus();}});d.querySelectorAll('[data-cl-file]').forEach(b=>b.onclick=()=>{const file=stream().messages.flatMap(m=>m.attachments||[]).find(f=>f.id===b.dataset.clFile);if(!file)return;dialog(file.name,`${file.type.startsWith('image/')?`<img class="cl-i-file-preview" src="${esc(file.data)}" alt="${esc(file.name)}">`:''}<p><a href="${esc(file.data)}" download="${esc(file.name)}">Скачать файл</a></p>`,'Закрыть',()=>true);});}
  function refreshPreservingView(change) {
    const focus=document.activeElement,focusId=focus?.id,focusSelector=focus?.hasAttribute('data-cl-message-menu')?'[data-cl-message-menu="'+CSS.escape(focus.dataset.clMessageMenu)+'"]':null;
    const input=['cl-i-input','cl-i-contact-search','cl-i-work-search','cl-i-message-search','cl-i-ticket-title','cl-i-ticket-description'].includes(document.activeElement?.id)?document.activeElement:null,selection=input?{id:input.id,start:input.selectionStart,end:input.selectionEnd,direction:input.selectionDirection}:null,log=$('#cl-i-messages'),reading=log?{top:log.scrollTop,atEnd:log.scrollHeight-log.clientHeight-log.scrollTop<=24}:null;
    if(change)change();if(ui.resizing)return;render();if(reading&&!reading.atEnd&&$('#cl-i-messages'))$('#cl-i-messages').scrollTop=reading.top;updateJump();
    if(selection&&$(`#${selection.id}`)&&!$(`#${selection.id}`).disabled){const target=$(`#${selection.id}`);target.focus({preventScroll:true});target.setSelectionRange(selection.start,selection.end,selection.direction);}else if(focusId&&$('#'+CSS.escape(focusId))?.getClientRects().length)$('#'+CSS.escape(focusId)).focus({preventScroll:true});else if(focusSelector&&$(focusSelector))$(focusSelector).focus({preventScroll:true});
  }
  window.addEventListener('storage',e=>{if(e.key!==KEY||!e.newValue)return;refreshPreservingView(()=>{try{state=hydrate(JSON.parse(localStorage.getItem(KEY)))}catch{}});});
  // Demo-only local clock refresh. Production uses server time and the existing summary transport.
  setInterval(()=>{if(ui.open&&!$('#cl-internal-modal').open){const next=JSON.parse(JSON.stringify(state)),changed=next.cases.some(t=>P.milestones(t,clock(next)));if(changed&&commit(()=>{},'mark_read'))refreshPreservingView();}},60000);
  window.addEventListener('focus',read);document.addEventListener('visibilitychange',read);
  window.addEventListener('cl-report-problem',e=>openReportForm(e.detail?.conversationId||null));
  $('#cl-internal-toggle').onclick=()=>toggle(!ui.open);$('#cl-internal-modal-close').onclick=closeDialog;$('#cl-internal-modal-cancel').onclick=closeDialog;$('#cl-internal-modal').addEventListener('cancel',e=>{e.preventDefault();closeDialog();});$('#cl-internal-modal-form').onsubmit=e=>{e.preventDefault();if(!$('#cl-internal-modal').open)return;const readOnlyAction=['Закрыть','Открыть обсуждение'].includes($('#cl-internal-modal-submit').textContent);if(closed(state.cases.find(t=>t.id===modalCaseId))&&!readOnlyAction){closeDialog();feedback('Обращение закрыто. Доступна только история.');return;}committingAction=!readOnlyAction;try{if(modalAction&&modalAction()!==false)closeDialog();}finally{committingAction=false;}};
  document.addEventListener('click',e=>{if(e.target.closest('.sidebar-menu a[aria-disabled],.main-header a[aria-disabled],.breadcrumb a[aria-disabled],.main-footer a[aria-disabled]'))e.preventDefault();},true);
  document.addEventListener('keydown',e=>{if($('#cl-internal-modal').open)return;if(e.key==='Escape'&&ui.open){if(ui.menu){const target=ui.menu;ui.menu=null;refreshPreservingView();$(`[data-cl-message-menu="${CSS.escape(target)}"]`)?.focus();}else if(ui.searchOpen){ui.searchOpen=false;ui.searchQuery='';refreshPreservingView();$('#cl-i-search-toggle')?.focus();}else{const m=$('#cl-i-action-menu');if(m&&!m.hidden){m.hidden=true;$('#cl-i-actions').focus();}else if(ui.directory){ui.directory=false;render();(document.querySelector('[data-cl-new-chat]')||$('#cl-i-tab-work')).focus();}else if(ui.creating)switchSection('cases');else toggle(false);}}if(e.key==='Tab'&&ui.open&&innerWidth<768){const ns=Array.from($('#cl-internal-drawer').querySelectorAll('button,textarea,select,input')).filter(n=>n.getClientRects().length&&!n.disabled&&n.tabIndex!==-1);if(e.shiftKey&&document.activeElement===ns[0]){e.preventDefault();ns.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===ns.at(-1)){e.preventDefault();ns[0].focus();}}});let mobileQuestionMode=innerWidth<768;window.addEventListener('resize',()=>{const next=innerWidth<768;if(next&&!mobileQuestionMode)ui.questionsExpanded=false;mobileQuestionMode=next;access();refreshPreservingView();});
  const profile=$('.cl-admin-user');profile.querySelector('.cl-admin-avatar').textContent=actor.initials;profile.querySelector('span:not(.cl-admin-avatar)').textContent=actor.name;profile.title=actor.title||'Клиент';const trigger=$('#cl-internal-toggle'),triggerLabel=trigger.querySelector('span:not(.cl-internal-counter)');triggerLabel.textContent=role==='client'?'Поддержка':widgetName;triggerLabel.classList.add('cl-internal-label');trigger.title=widgetName+': тикеты и рабочие чаты';document.body.classList.toggle('cl-has-chat-header-tools',Boolean($('.main-header .header-tools')));$('#cl-internal-drawer').setAttribute('aria-label',role==='client'?'Поддержка':widgetName);
  commit(()=>{});const q=params.get('ticket'),t=q==='client'?state.cases.find(t=>t.kind==='client'):q==='report'?state.cases.find(t=>t.sourceRef==='chat-v2-report-1043'):q==='second'?state.cases.find(t=>t.sourceRef==='chat-v2-report-1045'):q==='closed'?state.cases.find(t=>t.sourceRef==='chat-v2-report-closed'):state.cases.find(t=>t.id===Number(q));
  if(t&&visibleCases().some(c=>c.id===t.id)){ui.open=true;ui.selected=t.id;}else if(role==='client'){ui.open=true;ui.selected=visibleCases().find(t=>t.sourceRef==='chat-v2-report-1043')?.id||null;}else if(params.get('section')==='cases'){ui.open=true;ui.section='cases';}else if(role==='agent'||params.get('section')==='work'||document.documentElement.dataset.internalStart==='work'){ui.open=true;ui.section='work';}if(params.has('recipient')&&canContact(actor.id,Number(params.get('recipient'))))openRecipient(Number(params.get('recipient')));else{if(document.documentElement.dataset.internalInitial==='closed'&&!params.has('section')&&!params.has('ticket'))ui.open=false;if(current())prepareThread();read();render();}
})();
