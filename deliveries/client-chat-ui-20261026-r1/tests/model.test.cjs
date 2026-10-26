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
