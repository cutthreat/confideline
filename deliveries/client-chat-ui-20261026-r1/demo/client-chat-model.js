(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ClientChatModel = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const message = (id, mine, text, time, extra = {}) => ({id, mine, text, time, status: mine ? 'read' : 'received', ...extra});
  function createState(scenario = 'free') {
    const chats = [
      {id:'elena',name:'Elena Petrova',image:'images/elena.jpeg',online:true,rating:'4,9',reviews:124,topic:'Отношения, выбор и личные границы',unread:2,favorite:true,time:'13:42',preview:'Давайте начнём с того, что беспокоит вас сейчас.',messages:[
        message('el-1',false,'Здравствуйте, Daniel! Рада вас видеть. С каким вопросом вы хотели бы разобраться?','13:35'),
        message('el-2',true,'Добрый день! Сейчас мне сложно принять решение в отношениях. Хочу спокойно разобраться и понять, на что опереться.','13:36'),
        message('el-3',false,'Понимаю вас. Расскажите, между какими вариантами вы выбираете и что для вас важно сохранить в этих отношениях.','13:39'),
        message('el-4',true,'Мне важно не торопиться и услышать собственные желания. Можем обсудить это на консультации?','13:40'),
        message('el-5',false,'Да, конечно. Давайте начнём с того, что беспокоит вас сейчас. Я на связи.','13:42')
      ]},
      {id:'orion',name:'Orion Esposito',image:'images/orion.jpeg',online:true,rating:'4,8',reviews:86,topic:'Карьера и важные решения',unread:1,favorite:false,time:'Вчера',preview:'Сохранил для вас основные рекомендации.',messages:[
        message('or-1',true,'Спасибо за разговор. Теперь стало понятнее, с чего начать.','18:12'),
        message('or-2',false,'Пожалуйста! Сохранил для вас основные рекомендации. Можно вернуться к ним, когда будете готовы.','18:14'),
        message('or-3',false,'Краткий план после консультации','18:15',{file:{name:'Рекомендации.txt',size:1240,type:'document',sample:true}})
      ]},
      {id:'marcus',name:'Marcus Antoniu',image:'images/marcus.png',online:false,rating:'4,9',reviews:61,topic:'Личный путь и самопознание',unread:0,favorite:false,time:'24 окт',preview:'Буду рад продолжить наш разговор.',messages:[
        message('ma-1',false,'Здравствуйте! Сейчас я не в сети, но прочитаю ваше сообщение, когда вернусь.','10:20'),
        message('ma-2',false,'Буду рад продолжить наш разговор.','10:21')
      ]}
    ].map(chat => ({...chat,deleted:false,draft:{text:'',replyId:null,revision:0,files:[]},pending:null,session:{id:null,version:0,status:'free',rate:10,elapsed:0}}));
    const states = new Set(['free','offer','waiting','connecting','active','paused','low-balance','completed','reconnecting','trial']);
    const first = chats[0];
    if (states.has(scenario) && scenario !== 'free') first.session = {id:'DEMO-SESSION-1',version:1,status:scenario,rate:10,elapsed:324,canAccept:scenario==='offer',total:scenario === 'completed' ? '82,50' : null,duration:scenario === 'completed' ? '08:15' : null};
    if (scenario === 'offer-low-balance' || scenario === 'offer-checking') first.session = {id:'DEMO-SESSION-1',version:1,status:'offer',rate:10,elapsed:0,canAccept:scenario==='offer-checking'?null:false};
    if (scenario === 'offer-expired') first.session.outcome='expired';
    return {chats,selected:'elena',network:scenario === 'offline' ? 'offline' : 'online',failNext:scenario === 'send-error',failSessionNext:scenario === 'request-error',filter:'all',search:'',balance:scenario === 'offer-low-balance' ? 20 : 120};
  }
  function editDraft(chat, patch) {
    chat.draft = {...chat.draft, ...patch, revision:chat.draft.revision + 1};
    return chat.draft;
  }
  function prepareSend(chat, operationId, network = 'online') {
    if (network !== 'online') throw new Error('offline');
    if (chat.pending) return chat.pending;
    if (!chat.draft.text.trim() && !chat.draft.files.length) throw new Error('empty');
    if (chat.draft.text.length > 4000) throw new Error('length');
    const retry = chat.messages.find(m => m.status === 'failed' && m.draftRevision === chat.draft.revision);
    const operation = {id:retry?.id || operationId, chatId:chat.id, text:chat.draft.text.trim(), files:chat.draft.files.slice(), replyId:chat.draft.replyId, draftRevision:chat.draft.revision};
    chat.pending = operation;
    if (retry) retry.status = 'pending';
    else chat.messages.push({...operation, mine:true,status:'pending',time:new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})});
    return operation;
  }
  function settleSend(chat, operationId, success) {
    const item = chat.messages.find(m => m.id === operationId);
    if (!item || ['sent','read'].includes(item.status)) return false;
    const operation = chat.pending?.id === operationId ? chat.pending : item;
    item.status = success ? 'sent' : 'failed';
    if (success && chat.draft.revision === operation.draftRevision) editDraft(chat, {text:'',replyId:null,files:[]});
    if (chat.pending?.id === operationId) chat.pending = null;
    if (success) chat.preview = item.text || (item.files?.length ? 'Вложение' : 'Сообщение');
    return true;
  }
  function retrySend(chat, messageId) {
    if (chat.pending) return null;
    const item = chat.messages.find(m => m.id === messageId && m.status === 'failed');
    if (!item) return null;
    item.status = 'pending';
    chat.pending = {id:item.id,chatId:chat.id,text:item.text,files:item.files || [],replyId:item.replyId,draftRevision:item.draftRevision};
    return chat.pending;
  }
  function applySession(chat, snapshot) {
    const allowed = ['free','offer','waiting','connecting','active','paused','low-balance','completed','reconnecting','trial'];
    if (!allowed.includes(snapshot.status) || !Number.isSafeInteger(snapshot.version)) throw new Error('session');
    const old = chat.session;
    if (snapshot.id !== old.id && old.id && !['completed','free'].includes(old.status)) throw new Error('session_identity');
    if (snapshot.id === old.id && snapshot.version <= old.version) return false;
    if (snapshot.id === old.id && old.status === 'completed' && snapshot.status !== 'completed') throw new Error('terminal');
    chat.session = {...snapshot};
    return true;
  }
  function validateFiles(files, existing = []) {
    if (files.length + existing.length > 5) throw new Error('file_count');
    const allowed = new Set(['jpg','jpeg','png','webp','pdf','txt','csv','doc','docx','xls','xlsx']);
    for (const file of files) {
      const ext = file.name.toLowerCase().split('.').pop();
      if (!allowed.has(ext)) throw new Error('file_type');
      const mime = file.type || '';
      const imageTypes = {jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp'};
      if (imageTypes[ext] && mime && mime !== imageTypes[ext]) throw new Error('file_type');
      if (/^(audio|video)\//.test(mime) || /(?:javascript|html|executable)/.test(mime)) throw new Error('file_type');
      if (!file.size || file.size > 10 * 1024 * 1024) throw new Error('file_size');
    }
    if ([...files,...existing].reduce((sum,f) => sum + f.size, 0) > 25 * 1024 * 1024) throw new Error('file_total');
    return true;
  }
  function duration(seconds) {
    return Math.floor(Math.max(0,seconds) / 60).toString().padStart(2,'0') + ':' + Math.floor(Math.max(0,seconds) % 60).toString().padStart(2,'0');
  }
  return {createState,editDraft,prepareSend,settleSend,retrySend,applySession,validateFiles,duration};
});
