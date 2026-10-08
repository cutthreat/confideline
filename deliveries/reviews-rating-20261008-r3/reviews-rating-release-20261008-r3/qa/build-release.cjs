'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dev=path.join(root,'developer'),qa=__dirname;
const id='reviews-rating-20261008-r3',base='58ea4f15dedd73e2de0eb480561afbfedc08624d';
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const files=dir=>fs.readdirSync(dir,{withFileTypes:true}).filter(e=>e.name!=='node_modules').flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);
const rel=(dir,f)=>path.relative(dir,f).replaceAll('\\','/');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8').replace(/^\uFEFF/,''));
const write=(f,value)=>fs.writeFileSync(f,typeof value==='string'?value:JSON.stringify(value,null,2));
const page=(title,content)=>`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>*{box-sizing:border-box;letter-spacing:0}body{margin:0;background:#f4f5f7;color:#242a32;font:15px/1.6 Arial,sans-serif}main{max-width:1040px;margin:auto;padding:24px}h1{font-size:26px;margin:0 0 8px}h2{font-size:18px;margin:24px 0 8px}a{color:#165a9c;text-underline-offset:3px;overflow-wrap:anywhere}li{margin:8px 0}ul{padding-left:20px}p{margin:8px 0}small{color:#59616b}table{width:100%;border-collapse:collapse}td,th{text-align:left;vertical-align:top;padding:8px;border-bottom:1px solid #d5dae0;overflow-wrap:anywhere}@media(max-width:600px){main{padding:16px}h1{font-size:23px}}</style></head><body><main><h1>${title}</h1><p>${id} · 08.10.2026</p>${content}</main></body></html>`;
function manifest(dir,extra){
 const rows=files(dir).filter(f=>path.basename(f)!=='manifest.json'&&!f.endsWith('.log')).sort().map(f=>({path:rel(dir,f),bytes:fs.statSync(f).size,sha256:hash(f)}));
 write(path.join(dir,'manifest.json'),{schema:'confideline_release_manifest.v1',release_id:id,created_at_utc:new Date().toISOString(),backend_verified:false,base_commit:base,...extra,files:rows});return rows;
}
if(process.argv[2]==='prepare'){
 write(path.join(dev,'index.html'),page('Отзывы и рейтинг #62',`<h2>Макеты</h2><ul><li><a href="reviews-admin-panel-20260930.html">Админ-панель: рейтинг, голоса и отзыв от профиля</a></li><li><a href="reviews-current-site-mock-20260930.html">Анкета с отзывами</a></li><li><a href="reviews-current-site-mock-20260930.html?ratingMode=manual&amp;rating=4.8&amp;votes=125">Анкета: ручной рейтинг 4.8 / 125 голосов</a></li><li><a href="reviews-current-site-mock-20260930.html?adminReview=1">Анкета: отзыв с административным источником</a></li><li><a href="reviews-current-site-mock-20260930.html?reviews=empty&amp;ratingMode=manual&amp;rating=4.8&amp;votes=125">Рейтинг без текстовых отзывов</a></li><li><a href="reviews-current-site-mock-20260930.html?ratingMode=manual&amp;votes=0">Ноль голосов при существующих отзывах</a></li><li><a href="reviews-current-site-mock-20260930.html?reviews=empty">Без оценок</a></li><li><a href="reviews-current-site-mock-20260930.html?reviews=empty&amp;eligible=0">Без допуска к отзыву</a></li></ul><h2>Игорю</h2><ul><li><a href="POINT6-HANDOFF.md">Пункт 6: действия, права, данные и приёмка</a></li><li><a href="HANDOFF.md">Общий handoff</a></li><li><a href="CONTRACT.md">Контракт с дополнением r3</a></li><li><a href="README.md">Состав и границы</a></li><li><a href="EVIDENCE.md">Доказательства</a></li><li><a href="SOURCE-PROVENANCE.md">Происхождение</a></li><li><a href="manifest.json">SHA256 manifest</a></li></ul><p><small>Демонстрационные данные. Состояние сбрасывается при reload. Backend и приёмка продукта не подтверждены. r2 сохранена.</small></p>`));
 console.log('Prepared r3 navigation.');
}else if(process.argv[2]==='finish'){
 const unit=spawnSync(process.execPath,['--test','--test-reporter=tap',path.join(qa,'model.test.cjs')],{encoding:'utf8'});
 assert.equal(unit.status,0,unit.stdout+unit.stderr);
 const passes=Number(unit.stdout.match(/# pass (\d+)/)?.[1]);assert.equal(passes,32);
 write(path.join(qa,'model-results.json'),{status:'pass',tests:passes,failed:0,checked_at_utc:new Date().toISOString(),output:unit.stdout});
 const native=read(path.join(qa,'native-runtime.json'));assert.equal(native.status,'pass');assert(native.checks.every(c=>c.pass));assert(native.checks.length>=40);assert.deepEqual(native.browser_errors,[]);
 for(const row of native.source_files)assert.equal(hash(path.join(dev,row.path)),row.sha256,'Runtime source drift: '+row.path);
 const resources=read(path.join(qa,'resource-audit.json'));assert.equal(resources.status,'pass');assert.deepEqual(resources.missing,[]);
 const devRows=manifest(dev,{audience:'developer',requirements:['baseline-r2','card62-point6'],backend_status:'not_run',product_acceptance:'not_verified',excluded:['QA screenshots','runtime tools','internal ledgers']});
 const nativeHash=hash(path.join(qa,'native-runtime.json'));
 const qaResult={schema:'confideline_reviews_release_qa.v2',release_id:id,status:'pass',checked_at_utc:new Date().toISOString(),developer_manifest_sha256:hash(path.join(dev,'manifest.json')),native_receipt_sha256:nativeHash,unit_tests:32,native_checks:native.checks.length,widths:[1440,1024,768,390,360],backend_status:'not_run',product_acceptance:'not_verified',resource_audit:'pass',missing_resources:0,checks:native.checks.map(c=>({id:c.id,pass:c.pass})),scope:'Static mock UI, pure model, dependencies, responsive layout and portable package. No backend/live-site acceptance.'};
 write(path.join(qa,'QA-RESULTS.json'),qaResult);
 const screens=files(path.join(qa,'screens')).filter(f=>f.endsWith('.jpg'));
 write(path.join(qa,'index.html'),page('Отзывы #62 · QA r3',`<p>Макеты и чистая модель: PASS. Backend: NOT_RUN. Product acceptance: NOT_VERIFIED.</p><ul><li><a href="QA-RESULTS.json">Результаты и привязка к developer</a></li><li><a href="native-runtime.json">Нативные браузерные проверки</a></li><li><a href="model-results.json">32 unit-теста</a></li><li><a href="resource-audit.json">Полный CSS/HTML resource graph</a></li><li><a href="README.md">Границы и повтор проверки</a></li></ul><h2>Снимки</h2><ul>${screens.map(f=>`<li><a href="${rel(qa,f)}">${path.basename(f)}</a></li>`).join('')}</ul>`));
 manifest(qa,{audience:'QA_evidence',developer_manifest_sha256:hash(path.join(dev,'manifest.json')),excluded:['installed node_modules','local server logs']});
 write(path.join(root,'index.html'),page('Отзывы #62 · Передача r3',`<h2>Игорю</h2><ul><li><a href="developer/index.html">Макеты, контракт и handoff</a></li><li><a href="../reviews-rating-developer-20261008-r3.zip">Developer ZIP</a></li></ul><h2>Доказательства</h2><ul><li><a href="qa/index.html">QA и снимки</a></li><li><a href="../reviews-rating-qa-20261008-r3.zip">QA ZIP</a></li><li><a href="RELEASE.json">Целостность архивов</a></li></ul><p><small>GitHub/Pages - только макеты и документация; действующий сайт и backend не изменены.</small></p>`));
 const stage=path.join(root,'zip-stage','qa');fs.mkdirSync(stage,{recursive:true});
 for(const f of files(qa).filter(f=>!f.endsWith('.log'))){const target=path.join(stage,rel(qa,f));fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(f,target)}
 console.log(JSON.stringify({status:'pass',developer_files:devRows.length,qa_screenshots:screens.length,unit_tests:32,native_checks:native.checks.length,developer_manifest_sha256:hash(path.join(dev,'manifest.json'))}));
}else throw new Error('Use prepare or finish');
