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
    moderator:['view','moderate'],
    superadmin:['view','moderate','create','rating','audit','settings'],
    client:['submit']
  };
  const permissions = role => (capabilities[role] || []).slice();
  const policyBooleans = ['reviewsEnabled','ratingVisible','textReviewsVisible','clientSubmissionEnabled','moderationRequired','anonymousAllowed','ratingOnlyAllowed'];
  function validateSettings(input) {
    const result = {};
    for (const key of policyBooleans) {
      if (typeof input[key] !== 'boolean') throw new Error('settings');
      result[key] = input[key];
    }
    if (!/^\d+$/.test(String(input.maxTextLength)) || !Number.isSafeInteger(Number(input.maxTextLength)) || Number(input.maxTextLength) < 1 || Number(input.maxTextLength) > 5000) throw new Error('text_limit');
    result.maxTextLength = Number(input.maxTextLength);
    if (result.reviewsEnabled && !result.ratingVisible && !result.textReviewsVisible) throw new Error('visibility');
    return result;
  }
  function initial() {
    return {schema:1,revision:0,nextId:204,reviewsEnabled:true,ratingVisible:true,textReviewsVisible:true,clientSubmissionEnabled:true,moderationRequired:true,anonymousAllowed:true,ratingOnlyAllowed:true,maxTextLength:1000,settingsVersion:0,overrides:{},audit:[],submissions:{},reviews:[
      {id:'RV-201',expertId:'EX-101',authorProfileId:'USR-301',author:'Ирина',stars:5,text:'Спасибо за внимательную беседу. Получилось спокойно обсудить мой вопрос и посмотреть на ситуацию по-другому.',anonymous:false,status:'published',consultation:'CT-1001',source:'client',verified:true,createdAt:'2026-09-30T10:00:00Z'},
      {id:'RV-202',expertId:'EX-101',authorProfileId:'USR-302',author:'Александр',stars:3,text:'Ответы были понятными, но хотелось подробнее обсудить некоторые моменты.',anonymous:false,status:'published',consultation:'CT-1002',source:'client',verified:true,createdAt:'2026-09-30T11:00:00Z'},
      {id:'RV-203',expertId:'EX-101',authorProfileId:'USR-303',author:'Анна',stars:4,text:'Благодарю за подробные ответы.',anonymous:false,status:'pending',consultation:'CT-1003',source:'client',verified:false,createdAt:'2026-10-08T10:00:00Z'}
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
      data.audit.unshift({at:clock(),actor:role === 'client' ? 'DEMO-CLIENT-USR-303' : 'DEMO-' + role.toUpperCase(),action,id,reason,before:copy(before),after:copy(after)});
    }
    function submit(role, input, client) {
      return transact(role, client ? 'submit' : 'create', data => {
        const value = model.validateReview(client ? {...input,authorProfileId:'USR-303'} : input, profiles, 5000);
        if (!experts.some(e => e.id === input.expertId)) throw new Error('expert');
        const reason = client ? '' : model.validateReason(input.reason);
        if (!/^[a-zA-Z0-9-]{8,100}$/.test(String(input.operationId || ''))) throw new Error('operation');
        const fingerprint = JSON.stringify({role,value,expertId:input.expertId,reason});
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
        // This static fixture has one owned, completed consultation; the server must derive it.
        if (client && (input.expertId !== 'EX-101' || data.reviews.some(r => r.consultation === 'CT-1024'))) throw new Error('duplicate_consultation');
        const review = {...value,id:'RV-' + data.nextId++,expertId:input.expertId,source:client ? 'client' : 'admin',consultation:client ? 'CT-1024' : null,status:data.moderationRequired ? 'pending' : 'published',verified:false,publicationPolicy:data.moderationRequired ? 'moderation' : 'immediate',createdAt:clock(),createdBy:client ? 'DEMO-CLIENT-USR-303' : 'DEMO-SUPERADMIN'};
        data.reviews.unshift(review);
        data.submissions[input.operationId] = {fingerprint,id:review.id};
        audit(data,role,'create',review.id,reason,null,review);
        return review;
      });
    }
    function moderate(role, id, action, reason) {
      return transact(role,'moderate',data => {
        reason = model.validateReason(reason);
        const review = data.reviews.find(r => r.id === id);
        if (!review) throw new Error('not_found');
        const transitions = {approve:{pending:'published'},reject:{pending:'rejected'},hide:{published:'hidden'},restore:{hidden:'published'},delete:{pending:'deleted',published:'deleted',hidden:'deleted',rejected:'deleted'}};
        const target = transitions[action] && transitions[action][review.status];
        if (!target) throw new Error('transition');
        const before = copy(review);
        review.status = target;
        if (action === 'approve') { review.verified = true; review.verifiedBy = 'DEMO-' + role.toUpperCase(); }
        audit(data,role,action,id,reason,before,review);
        return review;
      });
    }
    function list(role) {
      requirePermission(role,'view');
      return read().reviews.map(r => ({id:r.id,expertId:r.expertId,authorProfileId:r.authorProfileId,author:r.author,stars:r.stars,text:r.text,anonymous:r.anonymous,status:r.status,consultation:r.consultation,verified:r.verified,createdAt:r.createdAt}));
    }
    function publicReviews(expertId) {
      const data = read();
      if (!data.reviewsEnabled || !data.textReviewsVisible) return [];
      return data.reviews.filter(r => r.expertId === expertId && r.status === 'published' && r.text.trim()).map(r => ({id:r.id,author:r.anonymous ? 'Анонимный клиент' : r.author,anonymous:r.anonymous,stars:r.stars,text:r.text,verified:r.verified,consultationVerified:r.verified && !!r.consultation,createdAt:r.createdAt}));
    }
    function setRating(role, expertId, input, reason) {
      return transact(role,'rating',data => {
        if (!experts.some(e => e.id === expertId)) throw new Error('expert');
        reason = model.validateReason(reason);
        const value = model.validateRating(input),before = data.overrides[expertId] || {mode:'auto',rating:null,votes:null};
        model.aggregate(data.reviews,expertId,value);
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
      return setSettings(role,{...before,moderationRequired:enabled},reason,before.version);
    }
    return {
      list,publicReviews,moderate,setRating,setModeration,setSettings,settings,
      createReview:(role,input) => submit(role,input,false),
      submitClient:input => submit('client',input,true),
      summary:expertId => { const data = read(); return model.aggregate(data.reviews,expertId,data.overrides[expertId]); },
      publicSummary:expertId => { const data=read(); return data.reviewsEnabled && data.ratingVisible ? model.aggregate(data.reviews,expertId,data.overrides[expertId]) : null; },
      rating:expertId => copy(read().overrides[expertId] || {mode:'auto',rating:null,votes:null}),
      clientStatus:() => { const r = read().reviews.find(r => r.consultation === 'CT-1024'); return r ? {id:r.id,status:r.status,hasText:!!r.text.trim()} : null; },
      audit:role => { requirePermission(role,'audit'); return copy(read().audit); }
    };
  }
  return {create,permissions,profiles,experts,storageKey,initialState:initial};
});
