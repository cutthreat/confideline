const {test} = require('node:test');
const assert = require('node:assert/strict');
const M = require('../demo/client-chat-model.js');
const chat = () => M.createState().chats[0];
test('empty draft and offline cannot send', () => {
  const c = chat(); assert.throws(() => M.prepareSend(c,'1'),/empty/);
  M.editDraft(c,{text:'hello'}); assert.throws(() => M.prepareSend(c,'1','offline'),/offline/);
  assert.equal(c.messages.length,5); assert.equal(c.draft.text,'hello');
});
test('duplicate submit reuses one operation', () => {
  const c = chat(); M.editDraft(c,{text:'one'});
  const first = M.prepareSend(c,'1'); assert.equal(M.prepareSend(c,'2'),first);
  assert.equal(c.messages.filter(m => m.id==='1').length,1);
});
test('success clears only acknowledged revision', () => {
  const c = chat(); M.editDraft(c,{text:'first'}); M.prepareSend(c,'1');
  M.editDraft(c,{text:'second\nline'}); M.settleSend(c,'1',true);
  assert.equal(c.draft.text,'second\nline');
});
test('normal acknowledgement clears draft and ignores duplicate', () => {
  const c = chat(); M.editDraft(c,{text:'one',replyId:'el-1'}); M.prepareSend(c,'1');
  assert.equal(M.settleSend(c,'1',true),true); assert.equal(c.draft.text,'');
  assert.equal(c.draft.replyId,null); assert.equal(M.settleSend(c,'1',true),false);
});
test('failed draft survives and retry is idempotent', () => {
  const c = chat(); M.editDraft(c,{text:'first\nsecond'}); M.prepareSend(c,'1'); M.settleSend(c,'1',false);
  assert.equal(c.draft.text,'first\nsecond'); assert.equal(M.prepareSend(c,'2').id,'1');
  assert.equal(c.messages.filter(m=>m.id==='1').length,1); M.settleSend(c,'1',true); assert.equal(c.draft.text,'');
});
test('retry old failed message does not erase newer draft', () => {
  const c = chat(); M.editDraft(c,{text:'first'}); M.prepareSend(c,'1'); M.settleSend(c,'1',false);
  M.editDraft(c,{text:'newer'}); assert.equal(M.retrySend(c,'1').id,'1'); M.settleSend(c,'1',true);
  assert.equal(c.draft.text,'newer'); assert.equal(M.retrySend(c,'1'),null);
});
test('acknowledgement stays in originating conversation', () => {
  const s = M.createState(); M.editDraft(s.chats[0],{text:'first'}); M.prepareSend(s.chats[0],'1');
  M.editDraft(s.chats[1],{text:'other'}); s.selected='orion'; M.settleSend(s.chats[0],'1',true);
  assert.equal(s.chats[1].draft.text,'other'); assert.equal(s.chats[0].draft.text,'');
});
test('stale and invalid consultation snapshots are rejected', () => {
  const c = chat(); M.applySession(c,{id:'a',version:1,status:'waiting'});
  assert.equal(M.applySession(c,{id:'a',version:1,status:'active'}),false);
  assert.throws(()=>M.applySession(c,{id:'b',version:2,status:'active'}),/session_identity/);
  assert.throws(()=>M.applySession(c,{id:'a',version:2,status:'unknown'}),/session/);
});
test('completed session cannot resume; repeat uses a new identity', () => {
  const c = chat(); M.applySession(c,{id:'a',version:1,status:'completed'});
  assert.throws(()=>M.applySession(c,{id:'a',version:2,status:'active'}),/terminal/);
  assert.equal(M.applySession(c,{id:'b',version:1,status:'waiting'}),true);
});
test('message length limit preserves text', () => {
  const c = chat(); M.editDraft(c,{text:'x'.repeat(4001)}); assert.throws(()=>M.prepareSend(c,'1'),/length/);
  assert.equal(c.draft.text.length,4001);
});
test('attachment type, zero size, individual, count and total limits', () => {
  const f = {name:'notes.txt',size:10,type:'text/plain'};
  assert.equal(M.validateFiles([f]),true);
  for (const name of ['voice.mp3','movie.mp4','pack.zip','page.html','run.exe']) assert.throws(()=>M.validateFiles([{...f,name}]),/file_type/);
  assert.throws(()=>M.validateFiles([{...f,name:'fake.png',type:'text/html'}]),/file_type/);
  assert.throws(()=>M.validateFiles([{...f,size:0}]),/file_size/);
  assert.throws(()=>M.validateFiles([{...f,size:10*1024*1024+1}]),/file_size/);
  assert.throws(()=>M.validateFiles(Array(6).fill(f)),/file_count/);
  assert.throws(()=>M.validateFiles(Array(3).fill({...f,size:9*1024*1024})),/file_total/);
});
test('elapsed time display uses whole, nonnegative seconds', () => {
  assert.equal(M.duration(0),'00:00'); assert.equal(M.duration(-1),'00:00');
  assert.equal(M.duration(324.9),'05:24'); assert.equal(M.duration(3600),'60:00');
});

const quote = c => ({id:c.session.id,version:c.session.version,termsKey:M.termsKey(c.session.terms)});
const offered = scenario => M.createState(scenario||'offer').chats[0];
test('request alone preserves draft and cannot start billing or invent a price',()=>{
  const c=chat();M.editDraft(c,{text:'two\nlines'});
  M.prepareConsultation(c,'request','r1',quote(c));M.settleConsultation(c,'r1','success');
  assert.equal(c.session.status,'waiting');assert.equal(c.session.consentAccepted,false);
  assert.equal(c.session.terms,undefined);assert.equal(c.session.acceptedTerms,undefined);assert.equal(c.draft.text,'two\nlines');
});
test('double request and unknown response cannot be retried',()=>{
  const c=chat(), expected=quote(c);M.prepareConsultation(c,'request','r1',expected);
  assert.throws(()=>M.prepareConsultation(c,'request','r2',expected),/request_pending/);
  M.settleConsultation(c,'r1','unknown');assert.equal(c.session.pendingOperation.status,'unknown');
  assert.throws(()=>M.prepareConsultation(c,'request','r3',expected),/request_pending/);
  assert.equal(M.settleConsultation(c,'r1','success'),true);assert.equal(M.settleConsultation(c,'r1','success'),false);
});
test('confirmed rejection allows explicit retry, but keeps draft and quote',()=>{
  const c=offered();M.editDraft(c,{text:'draft'});const before=M.termsKey(c.session.terms);
  M.prepareConsultation(c,'accept','a1',quote(c),true);M.settleConsultation(c,'a1','rejected');
  assert.equal(c.session.status,'offer');assert.equal(M.termsKey(c.session.terms),before);assert.equal(c.draft.text,'draft');
  M.prepareConsultation(c,'accept','a2',quote(c),true);assert.equal(M.settleConsultation(c,'a2','success'),true);
});
test('accept needs consent, complete terms, eligibility and online state',()=>{
  const c=offered();assert.throws(()=>M.prepareConsultation(c,'accept','x',quote(c)),/consent/);
  assert.throws(()=>M.prepareConsultation(c,'accept','x',quote(c),true,'offline'),/offline/);
  for(const scenario of ['offer-checking','offer-low-balance','offer-incomplete']){
    const other=offered(scenario);assert.throws(()=>M.prepareConsultation(other,'accept','x',quote(other),true),/payment_check|terms_incomplete/);
    assert.equal(other.session.pendingOperation,undefined);
  }
});
test('accept saves immutable shown quote and still waits without billing',()=>{
  const c=offered('offer-trial');M.prepareConsultation(c,'accept','a',quote(c),true);M.settleConsultation(c,'a','success');
  assert.equal(c.session.status,'waiting');assert.equal(c.session.consentAccepted,true);assert.equal(c.session.acceptedTerms.trialMinutes,3);
  c.session.terms.rate=99;assert.equal(c.session.acceptedTerms.rate,10);
});
test('stale price is rejected even if incoming version was not incremented',()=>{
  const c=offered(), expected=quote(c);c.session.terms.rate=20;
  assert.throws(()=>M.prepareConsultation(c,'accept','a',expected,true),/offer_changed/);
});
test('expiry before click or while pending never accepts an offer',()=>{
  const c=offered(), time=c.session.terms.expiresAt;
  assert.throws(()=>M.prepareConsultation(c,'accept','a',quote(c),true,'online',time),/offer_expired/);
  M.prepareConsultation(c,'accept','a',quote(c),true,'online',time-1000);
  assert.throws(()=>M.settleConsultation(c,'a','success',time+1),/offer_expired/);
  assert.equal(c.session.consentAccepted,undefined);
});
test('offer change during pending prevents consent from transferring',()=>{
  const c=offered();M.prepareConsultation(c,'accept','a',quote(c),true);c.session.terms={...c.session.terms,id:'new',version:2};
  assert.throws(()=>M.settleConsultation(c,'a','success'),/offer_changed/);assert.equal(c.session.status,'offer');
});
test('decline has no billing and is terminal only for that offer',()=>{
  const c=offered();M.prepareConsultation(c,'decline','d',quote(c));M.settleConsultation(c,'d','success');
  assert.equal(c.session.status,'free');assert.equal(c.session.outcome,'declined');assert.equal(c.session.terms,undefined);
  M.prepareConsultation(c,'request','next',quote(c));M.settleConsultation(c,'next','success');assert.equal(c.session.id,'DEMO-next');
});
test('new consultation does not inherit old agreed terms',()=>{
  const c=offered('completed');assert.ok(c.session.acceptedTerms);
  M.prepareConsultation(c,'request','next',quote(c));M.settleConsultation(c,'next','success');
  assert.equal(c.session.acceptedTerms,undefined);assert.equal(c.session.consentAccepted,false);assert.equal(c.session.total,undefined);
});
test('unknown billing, missing unit and invalid values fail closed',()=>{
  const t=offered().session.terms;assert.equal(M.completeTerms(t),true);
  for(const patch of [{billing:'unknown'},{unit:null},{rate:0},{minimumBalance:NaN},{trialMinutes:-1},{version:0},{expiresAt:null}]) assert.equal(M.completeTerms({...t,...patch}),false);
});
test('a late acknowledgement cannot override a newer authoritative session',()=>{
  const c=offered();M.prepareConsultation(c,'accept','a',quote(c),true);
  M.applySession(c,{...c.session,pendingOperation:undefined,version:2,status:'free',outcome:'expired'});
  assert.equal(M.settleConsultation(c,'a','success'),false);assert.equal(c.session.status,'free');
});
