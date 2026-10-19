(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./reviews-rating-model.js'));
  else root.ReviewAdminWorkflow = factory(root.ReviewRatingModel);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (model) {
  'use strict';
  const storageKey = 'confideline_reviews_r7_synthetic_v1';
  const profiles = [{id:'USR-301',name:'Ирина',active:true},{id:'USR-302',name:'Александр',active:true},{id:'USR-303',name:'Анна',active:true}];
  const experts = [{id:'EX-101',name:'Marcus Antoniu'},{id:'EX-102',name:'Elena Petrova'}];
  const copy = value => JSON.parse(JSON.stringify(value));
  const capabilities = {
    moderator:['view','moderate','history'],
    superadmin:['view','moderate','history','create','rating','audit','settings'],
    client:['submit']
  };
  const permissions = role => (capabilities[role] || []).slice();
  const decisionReasons = {
    personal_data:{editable:true,label:['Личные данные или контакты','Personal Data or Contacts'],message:['Уберите из текста личные данные и контакты. Оценка останется прежней.','Remove Personal Data and Contacts from the Text. Your Rating Will Stay the Same.']},
    off_topic:{editable:true,label:['Текст не о консультации','Off-topic Text'],message:['Опишите ваш опыт этой консультации без посторонних тем.','Describe Your Experience of This Consultation Without Unrelated Topics.']},
    abuse:{editable:true,label:['Оскорбления или угрозы','Abuse or Threats'],message:['Уберите оскорбления и угрозы. Отрицательную оценку и описание опыта можно сохранить.','Remove Abuse and Threats. You May Keep a Negative Rating and Describe Your Experience.']},
    not_related:{editable:false,label:['Нарушение правил оценки','Rating Rule Violation'],message:['Запись не соответствует правилам оценки консультации.','This Submission Does Not Meet the Consultation Rating Rules.']},
    other:{editable:false,label:['Другая причина','Another Reason'],message:['Запись снята с публикации. Вы можете запросить пересмотр решения.','This Submission Is Not Published. You May Request Reconsideration.']}
  };
  const negative = status => ['rejected','hidden','deleted'].includes(status);
  const moderationModes = ['premoderation','postmoderation','none'];
  const consultationFixtures = [{id:'CT-1024',expertId:'EX-101',authorProfileId:'USR-303',started:true,completed:true,settled:true,charged:20,date:'2026-10-18T12:00:00Z'}];
  function reviewEligibility(session) {
    return !!session && session.started === true && session.completed === true && session.settled === true && Number.isFinite(session.charged) && session.charged > 0;
  }
  const policyBooleans = ['reviewsEnabled','ratingVisible','textReviewsVisible','clientSubmissionEnabled','anonymousAllowed','ratingOnlyAllowed'];
  function validateSettings(input) {
    const result = {};
    for (const key of policyBooleans) {
      if (typeof input[key] !== 'boolean') throw new Error('settings');
      result[key] = input[key];
    }
    if (!moderationModes.includes(input.moderationMode)) throw new Error('moderation');
    result.moderationMode = input.moderationMode;
    if (!/^\d+$/.test(String(input.maxTextLength)) || !Number.isSafeInteger(Number(input.maxTextLength)) || Number(input.maxTextLength) < 1 || Number(input.maxTextLength) > 5000) throw new Error('text_limit');
    result.maxTextLength = Number(input.maxTextLength);
    if (result.reviewsEnabled && !result.ratingVisible && !result.textReviewsVisible) throw new Error('visibility');
    return result;
  }
  function initial() {
    return {schema:1,revision:0,nextId:204,reviewsEnabled:true,ratingVisible:true,textReviewsVisible:true,clientSubmissionEnabled:true,moderationMode:'premoderation',anonymousAllowed:true,ratingOnlyAllowed:true,maxTextLength:1000,settingsVersion:0,overrides:{},audit:[],submissions:{},reviews:[
      {id:'RV-201',expertId:'EX-101',authorProfileId:'USR-301',author:'Ирина',stars:5,text:'Спасибо за внимательную беседу. Получилось спокойно обсудить мой вопрос и посмотреть на ситуацию по-другому.',anonymous:false,status:'published',consultation:'CT-1001',source:'client',consultationVerified:true,verified:true,createdAt:'2026-09-30T10:00:00Z'},
      {id:'RV-202',expertId:'EX-101',authorProfileId:'USR-302',author:'Александр',stars:3,text:'Ответы были понятными, но хотелось подробнее обсудить некоторые моменты.',anonymous:false,status:'published',consultation:'CT-1002',source:'client',consultationVerified:true,verified:true,createdAt:'2026-09-30T11:00:00Z'},
      {id:'RV-203',expertId:'EX-101',authorProfileId:'USR-303',author:'Анна',stars:4,text:'Благодарю за подробные ответы.',anonymous:false,status:'pending',consultation:'CT-1003',source:'client',consultationVerified:true,verified:false,createdAt:'2026-10-08T10:00:00Z'}
    ]};
  }
  function create(storage, clock) {
    clock = clock || (() => new Date().toISOString());
    function read() {
      let raw;
      try { raw = storage.getItem(storageKey); } catch (_) { throw new Error('storage'); }
      if (raw === null) return initial();
      let data;
      try { data = JSON.parse(raw); } catch (_) { throw new Error('storage'); }
      if (data && !Object.hasOwn(data,'moderationMode') && typeof data.moderationRequired === 'boolean') {
        data.moderationMode = data.moderationRequired ? 'premoderation' : 'none';
        delete data.moderationRequired;
      }
      if (!data || data.schema !== 1 || !Array.isArray(data.reviews) || !Array.isArray(data.audit) || !data.overrides || !data.submissions || !Number.isSafeInteger(data.settingsVersion) || data.settingsVersion < 0 || !Number.isSafeInteger(data.nextId) || !Number.isSafeInteger(data.revision)) throw new Error('storage');
      try { validateSettings(data); } catch (_) { throw new Error('storage'); }
      return data;
    }
    function requirePermission(role, action) { if (!permissions(role).includes(action)) throw new Error('forbidden'); }
    function transact(role, permission, operation) {
      requirePermission(role, permission);
      const data = copy(read());
      const result = operation(data);
      if (result.replayed) return copy(result);
      data.revision++;
      try { storage.setItem(storageKey, JSON.stringify(data)); } catch (_) { throw new Error('storage'); }
      return copy(result);
    }
    function audit(data, role, action, id, reason, before, after) {
      data.audit.unshift({at:clock(),actor:role === 'client' ? 'DEMO-CLIENT-USR-303' : 'DEMO-' + role.toUpperCase(),actorName:role==='client'?'Анна':role==='moderator'?'Alexey Saava':'Admin Admin',action,id,reason,before:copy(before),after:copy(after)});
    }
    function sessions(data) { return (data.consultations || consultationFixtures).filter(s=>s.authorProfileId==='USR-303'); }
    function submit(role, input, client) {
      return transact(role, client ? 'submit' : 'create', data => {
        const value = model.validateReview(client ? {...input,authorProfileId:'USR-303'} : input, profiles, 5000);
        if (!experts.some(e => e.id === input.expertId)) throw new Error('expert');
        const reason = client ? '' : model.validateReason(input.reason);
        if (!/^[a-zA-Z0-9-]{8,100}$/.test(String(input.operationId || ''))) throw new Error('operation');
        const consultationId = client ? (input.consultationId || 'CT-1024') : null;
        const fingerprint = JSON.stringify({role,value,expertId:input.expertId,reason,...(client&&consultationId!=='CT-1024'?{consultationId}:{})});
        const previous = data.submissions[input.operationId];
        if (previous) {
          if (previous.fingerprint !== fingerprint) throw new Error('operation_conflict');
          return {...data.reviews.find(r => r.id === previous.id),replayed:true};
        }
        // A successful retry stays idempotent even after policy changes. New writes use current policy.
        if (client && (!data.reviewsEnabled || !data.clientSubmissionEnabled)) throw new Error('submissions_closed');
        if (value.anonymous && !data.anonymousAllowed) throw new Error('anonymous_disabled');
        if (!value.text && !data.ratingOnlyAllowed) throw new Error('text_required');
        if (value.text.length > data.maxTextLength) throw new Error('text');
        if (client) {
          const session=sessions(data).find(s=>s.id===consultationId&&s.expertId===input.expertId);
          if(!session||!reviewEligibility(session))throw new Error('consultation_ineligible');
          if(data.reviews.some(r=>r.source==='client'&&r.consultation===consultationId))throw new Error('duplicate_consultation');
        }
        const review = {...value,id:'RV-' + data.nextId++,expertId:input.expertId,source:client ? 'client' : 'admin',consultation:consultationId,consultationVerified:client,status:data.moderationMode === 'premoderation' ? 'pending' : 'published',moderationPending:data.moderationMode !== 'none',verified:false,version:0,decisionId:0,publicationPolicy:data.moderationMode,createdAt:clock(),createdBy:client ? 'DEMO-CLIENT-USR-303' : 'DEMO-SUPERADMIN'};
        data.reviews.unshift(review);
        data.submissions[input.operationId] = {fingerprint,id:review.id};
        audit(data,role,'create',review.id,reason,null,review);
        return review;
      });
    }
    function versionOf(review) {
      const version=review.version===undefined?0:review.version;
      if(!Number.isSafeInteger(version)||version<0||version===Number.MAX_SAFE_INTEGER)throw new Error('storage');
      return version;
    }
    function expectVersion(review, expected) {
      if(!Number.isSafeInteger(expected)||expected!==versionOf(review))throw new Error('review_conflict');
    }
    function clientDecision(input) {
      if(!input||!Object.hasOwn(decisionReasons,input.code))throw new Error('client_reason');
      const message=String(input.message||'').trim();
      if(message.length>500||(input.code==='other'&&!message))throw new Error('client_reason');
      return {code:input.code,message};
    }
    function owned(data, id) {
      const review=data.reviews.find(r=>r.id===id&&sessions(data).some(s=>s.id===r.consultation&&s.expertId===r.expertId)&&r.authorProfileId==='USR-303'&&r.source==='client');
      if(!review)throw new Error('forbidden');
      return review;
    }
    function operation(data, key, payload) {
      if(!/^[a-zA-Z0-9-]{8,100}$/.test(String(key||'')))throw new Error('operation');
      const fingerprint=JSON.stringify(payload),previous=data.submissions[key];
      if(previous&&previous.fingerprint!==fingerprint)throw new Error('operation_conflict');
      return {fingerprint,previous};
    }
    function moderate(role, id, action, reason, expectedVersion, feedback) {
      return transact(role,'moderate',data => {
        reason = model.validateReason(reason);
        const review = data.reviews.find(r => r.id === id);
        if (!review) throw new Error('not_found');
        expectVersion(review,expectedVersion);
        if(review.appeal?.status==='pending')throw new Error('appeal_pending');
        const transitions = {approve:{pending:'published'},reject:{pending:'rejected'},hide:{published:'hidden'},restore:{hidden:'published'},delete:{pending:'deleted',published:'deleted',hidden:'deleted',rejected:'deleted'}};
        const postmoderation = review.status === 'published' && review.moderationPending === true;
        const target = postmoderation && action === 'approve' ? 'published' : postmoderation && action === 'reject' ? 'rejected' : transitions[action] && transitions[action][review.status];
        if (!target) throw new Error('transition');
        const before = copy(review);
        if(negative(target))review.clientDecision=clientDecision(feedback);
        else review.clientDecision=null;
        review.status = target;
        review.moderationPending = false;
        review.version=versionOf(review)+1;
        review.decisionId=(review.decisionId||0)+1;
        if (action === 'approve') { review.verified = true; review.verifiedBy = 'DEMO-' + role.toUpperCase(); }
        audit(data,role,action,id,reason,before,review);
        return review;
      });
    }
    function reviseClient(input) {
      return transact('client','submit',data=>{
        const review=owned(data,input.id),text=String(input.text||'').trim();
        const op=operation(data,input.operationId,{action:'revise',id:input.id,text,version:input.version});
        if(op.previous)return {...review,replayed:true};
        expectVersion(review,input.version);
        if(review.status!=='rejected'||!decisionReasons[review.clientDecision?.code]?.editable)throw new Error('transition');
        if(review.appeal?.status==='pending')throw new Error('appeal_pending');
        if(!text&&!data.ratingOnlyAllowed)throw new Error('text_required');
        if(text.length>data.maxTextLength)throw new Error('text');
        if(text===review.text)throw new Error('unchanged');
        const before=copy(review);
        review.text=text;review.status='pending';review.moderationPending=true;review.verified=false;delete review.verifiedBy;
        review.version=versionOf(review)+1;review.publicationPolicy='resubmitted_moderation';
        data.submissions[input.operationId]={fingerprint:op.fingerprint,id:review.id};
        audit(data,'client','revise',review.id,'',before,review);
        return review;
      });
    }
    function appealClient(input) {
      return transact('client','submit',data=>{
        const review=owned(data,input.id),message=model.validateReason(input.message);
        const op=operation(data,input.operationId,{action:'appeal',id:input.id,message,version:input.version});
        if(op.previous)return {...review,replayed:true};
        expectVersion(review,input.version);
        if(!negative(review.status))throw new Error('transition');
        if(review.appeal?.decisionId===(review.decisionId||0))throw new Error('appeal_exists');
        const before=copy(review);
        review.appeal={status:'pending',message,decisionId:review.decisionId||0,createdAt:clock()};
        review.version=versionOf(review)+1;
        data.submissions[input.operationId]={fingerprint:op.fingerprint,id:review.id};
        audit(data,'client','appeal',review.id,'',before,review);
        return review;
      });
    }
    function resolveAppeal(role,id,outcome,internalReason,reply,expectedVersion) {
      return transact(role,'moderate',data=>{
        internalReason=model.validateReason(internalReason);
        reply=String(reply||'').trim();if(!reply||reply.length>500)throw new Error('appeal_reply');
        const review=data.reviews.find(r=>r.id===id);
        if(!review)throw new Error('not_found');
        expectVersion(review,expectedVersion);
        if(!negative(review.status)||review.appeal?.status!=='pending'||!['publish','decline'].includes(outcome))throw new Error('transition');
        const before=copy(review);
        review.appeal={...review.appeal,status:outcome==='publish'?'accepted':'declined',reply,resolvedAt:clock()};
        if(outcome==='publish'){review.status='published';review.verified=true;review.verifiedBy='DEMO-'+role.toUpperCase();review.clientDecision=null;}
        review.version=versionOf(review)+1;
        audit(data,role,'appeal_'+outcome,id,internalReason,before,review);
        return review;
      });
    }
    function list(role) {
      requirePermission(role,'view');
      return read().reviews.map(r => ({id:r.id,expertId:r.expertId,authorProfileId:r.authorProfileId,author:r.author,stars:r.stars,text:r.text,anonymous:r.anonymous,status:r.status,moderationPending:r.status==='pending'||r.moderationPending===true,consultation:r.consultation,consultationVerified:r.consultationVerified === true && !!r.consultation,verified:r.verified,version:versionOf(r),clientDecision:r.clientDecision||null,appeal:r.appeal||null,createdAt:r.createdAt}));
    }
    function publicReviews(expertId) {
      const data = read();
      if (!data.reviewsEnabled || !data.textReviewsVisible) return [];
      return data.reviews.filter(r => r.expertId === expertId && r.status === 'published' && r.text.trim()).map(r => ({id:r.id,author:r.anonymous ? 'Анонимный клиент' : r.author,anonymous:r.anonymous,stars:r.stars,text:r.text,verified:r.verified,consultationVerified:r.consultationVerified === true && !!r.consultation,createdAt:r.createdAt}));
    }
    function ratingValue(data, expertId) {
      const value = data.overrides[expertId] || {mode:'auto',rating:null,votes:null};
      const version = value.version === undefined ? 0 : value.version;
      if (!Number.isSafeInteger(version) || version < 0) throw new Error('storage');
      return {...value,version};
    }
    function setRating(role, expertId, input, reason, expectedVersion) {
      return transact(role,'rating',data => {
        if (!experts.some(e => e.id === expertId)) throw new Error('expert');
        reason = model.validateReason(reason);
        const before = ratingValue(data,expertId);
        if (!Number.isSafeInteger(expectedVersion) || expectedVersion !== before.version || before.version === Number.MAX_SAFE_INTEGER) throw new Error('rating_conflict');
        const value = model.validateRating(input);
        if (JSON.stringify(value) === JSON.stringify(model.validateRating(before))) return {...before,replayed:true};
        model.aggregate(data.reviews,expertId,value);
        value.version = before.version + 1;
        data.overrides[expertId] = value;
        audit(data,role,'rating',expertId,reason,before,value);
        return value;
      });
    }
    function settings() {
      const data = read();
      return {...validateSettings(data),version:data.settingsVersion};
    }
    function setSettings(role, input, reason, expectedVersion) {
      return transact(role,'settings',data => {
        reason = model.validateReason(reason);
        if (!Number.isSafeInteger(expectedVersion) || expectedVersion !== data.settingsVersion) throw new Error('settings_conflict');
        const before = validateSettings(data), after = validateSettings(input);
        if (JSON.stringify(before) === JSON.stringify(after)) return {...after,version:data.settingsVersion,replayed:true};
        Object.assign(data,after);
        data.settingsVersion++;
        audit(data,role,'settings','reviews',reason,before,after);
        return {...after,version:data.settingsVersion};
      });
    }
    function setModeration(role, enabled, reason) {
      requirePermission(role,'settings');
      if (typeof enabled !== 'boolean') throw new Error('moderation');
      const before = settings();
      return setSettings(role,{...before,moderationMode:enabled?'premoderation':'none'},reason,before.version);
    }
    function clientStatus(consultationId='CT-1024') {
        const data=read(),r=data.reviews.find(r=>r.consultation===consultationId&&r.authorProfileId==='USR-303'&&r.source==='client'&&sessions(data).some(s=>s.id===r.consultation&&s.expertId===r.expertId));
        if(!r)return null;
        const currentAppeal=r.status!=='pending'&&r.appeal?.decisionId===(r.decisionId||0)?r.appeal:null;
        return {id:r.id,consultationId:r.consultation,status:r.status,hasText:!!r.text.trim(),text:r.text,stars:r.stars,anonymous:r.anonymous,version:versionOf(r),decision:r.clientDecision||null,appeal:currentAppeal?{status:currentAppeal.status,message:currentAppeal.message,reply:currentAppeal.reply||''}:null,canRevise:r.status==='rejected'&&!!decisionReasons[r.clientDecision?.code]?.editable&&r.appeal?.status!=='pending',canAppeal:negative(r.status)&&r.appeal?.decisionId!==(r.decisionId||0)};
    }
    function consultations(expertId) {
      const data=read();
      return sessions(data).filter(s=>s.expertId===expertId).sort((a,b)=>b.date.localeCompare(a.date)).map(s=>({id:s.id,date:s.date,eligible:reviewEligibility(s),own:clientStatus(s.id)}));
    }
    function moderationHistory(role,id) {
      requirePermission(role,'history');
      const data=read();
      if(!data.reviews.some(r=>r.id===id))throw new Error('not_found');
      const actions=['approve','reject','hide','restore','delete','revise','appeal','appeal_publish','appeal_decline'];
      // Explicit projection: never expose private reasons or raw snapshots to the moderator.
      return data.audit.filter(a=>a.id===id&&actions.includes(a.action)).map(a=>({at:a.at,action:a.action,actorName:a.actorName||(a.actor==='DEMO-MODERATOR'?'Alexey Saava':a.actor==='DEMO-SUPERADMIN'?'Admin Admin':'Клиент'),actorRole:a.actor==='DEMO-SUPERADMIN'?'superadmin':a.actor==='DEMO-MODERATOR'?'moderator':'client',from:a.before?.status||null,to:a.after?.status||null,decision:['reject','hide','delete'].includes(a.action)&&a.after?.clientDecision?{code:a.after.clientDecision.code,message:a.after.clientDecision.message}:null,reply:a.action.startsWith('appeal_')?a.after?.appeal?.reply||'':'',outcome:a.action.startsWith('appeal_')?a.after?.appeal?.status||null:null}));
    }
    return {
      list,publicReviews,moderate,reviseClient,appealClient,resolveAppeal,setRating,setModeration,setSettings,settings,clientStatus,consultations,moderationHistory,
      createReview:(role,input) => submit(role,input,false),
      submitClient:input => submit('client',input,true),
      summary:expertId => { const data = read(); return model.aggregate(data.reviews,expertId,data.overrides[expertId]); },
      publicSummary:expertId => { const data=read(); return data.reviewsEnabled && data.ratingVisible ? model.aggregate(data.reviews,expertId,data.overrides[expertId]) : null; },
      rating:expertId => copy(ratingValue(read(),expertId)),
      audit:role => { requirePermission(role,'audit'); return copy(read().audit); }
    };
  }
  function historyExample() {
    const state=initial();state.reviews.find(r=>r.id==='RV-203').consultation='CT-1024';
    let raw=JSON.stringify(state),day=15;
    const store=create({getItem:()=>raw,setItem:(_,value)=>{raw=value;}},()=>`2026-10-${++day}T10:00:00Z`);
    store.moderate('moderator','RV-203','reject','PRIVATE: contact investigation',0,{code:'personal_data',message:'Уберите номер телефона из текста.'});
    store.reviseClient({id:'RV-203',version:1,operationId:'history-revision-001',text:'Спасибо за подробные ответы без личных данных.'});
    store.moderate('superadmin','RV-203','approve','PRIVATE: checked account source',2);
    return JSON.parse(raw);
  }
  return {create,permissions,profiles,experts,storageKey,decisionReasons,moderationModes,reviewEligibility,historyExample,initialState:initial};
});
