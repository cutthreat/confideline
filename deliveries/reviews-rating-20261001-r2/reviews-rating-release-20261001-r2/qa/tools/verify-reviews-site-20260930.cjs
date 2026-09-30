const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/alexe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fixtureDir=path.resolve(process.env.REVIEWS_FIXTURE_DIR||__dirname);
const reportDir=path.resolve(process.env.REVIEWS_PROOF_DIR||__dirname);
fs.mkdirSync(reportDir,{recursive:true});

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true,timeout:20000});
 try{
  const page=await browser.newPage();page.setDefaultTimeout(15000);
  const errors=[];const checks=[];const localResourceFailures=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('requestfailed',request=>{if(request.url().startsWith('file:'))localResourceFailures.push(request.url())});
  if(process.env.REVIEWS_OFFLINE==='1')await page.route(/^https?:\/\//,route=>route.abort());
  const url=pathToFileURL(path.join(fixtureDir,'reviews-current-site-mock-20260930.html')).href;
  async function open(suffix=''){
   await page.goto(url+suffix,{waitUntil:'domcontentloaded'});
   await page.locator('.review-photo').evaluate(img=>img.decode());
   await page.locator('.review-photo-thumb img').evaluate(img=>img.decode());
   await page.evaluate(()=>document.fonts.ready);
  }
  async function screenshot(name){await page.screenshot({path:path.join(reportDir,name),fullPage:true,timeout:15000})}
  async function toggleAdmin(){await page.locator('#account-toggle').click();await page.locator('#moderation-toggle').click()}
  async function decision(id,action,reason){
   await page.locator(`[data-id="${id}"][data-action="${action}"]`).click();
   await page.locator('#moderation-reason').fill(reason);
   await page.locator('#reason-form button[type=submit]').click();
  }
  async function layout(width){
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Page overflow '+width);
   assert.equal(await page.locator('#profile-column-content>section.card').count(),2,'Original central cards');
   assert.equal(await page.locator('#profile-column-left>.card').count(),1);
   assert.equal(await page.locator('#profile-column-right>section.card').count(),2);
   assert.equal(await page.locator('#reviews.card').count(),0,'No separate reviews card');
   for(const selector of ['.review-photo-thumb','#favorite','#give-gift','#more-toggle','.review-facts','[data-category=about]','[data-category=expert]','[data-category=lvl]','.review-popularity','.card-gifts','#sidebar-ad']){
    assert(await page.locator(selector).isVisible(),'Missing original block: '+selector);
   }
   assert.equal(await page.locator('.review-nav a').count(),6);
   const left=await page.locator('#profile-column-left').boundingBox();
   const center=await page.locator('#profile-column-content').boundingBox();
   const right=await page.locator('#profile-column-right').boundingBox();
   if(width>=992){assert(left.x+left.width<center.x);assert(center.x+center.width<right.x);assert(Math.abs(left.y-right.y)<2)}
   else if(width>600){assert(left.x+left.width<center.x);assert(right.y>=center.y+center.height-1)}
   else{assert(center.y>=left.y+left.height-1);assert(right.y>=center.y+center.height-1)}
   const name=await page.locator('.review-name-location').boundingBox();
   const favorite=await page.locator('#favorite').boundingBox();
   assert(name.x+name.width<=favorite.x,'Name overlaps favorite');
   assert.equal(await page.evaluate(()=>[...document.querySelectorAll('#profile button')].filter(b=>b.getClientRects().length).some(b=>b.scrollWidth>b.clientWidth+2)),false,'Button text overflow');
  }
  async function unrated(){
   assert.equal(await page.locator('.profile-rating-link').isVisible(),false,'Unrated profile rating row must be hidden');
   assert.equal(await page.locator('.profile-rating-link').textContent(),'');
   assert.equal(await page.locator('.profile-rating-link').evaluate(el=>el.getClientRects().length),0,'Hidden rating row must occupy no layout space');
   assert.equal(await page.getByText('Пока нет оценок',{exact:true}).count(),0);
   assert.equal(await page.locator('.profile-rating-link .fa').count(),0,'Unrated profile must not show stars');
   assert.equal(await page.locator('#rating-summary').isVisible(),false);
   assert(await page.locator('#review-empty').isVisible());
   assert.equal(await page.locator('#review-list article').count(),0);
  }
  for(const width of [1440,1024,768,390,360]){
   await page.setViewportSize({width,height:950});await open();await layout(width);
   const ratedHeader=await page.locator('.card-main-info').boundingBox();
   await screenshot(`reviews-site-${width}.png`);
   await toggleAdmin();await page.locator('#admin-search').fill('CT-1002');
   assert.equal(await page.locator('#admin-rows tr').count(),1);
   await page.locator('#admin-search').fill('');await screenshot(`reviews-admin-${width}.png`);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Admin overflow');
   await toggleAdmin();await page.locator('#write-review').click();
   await page.screenshot({path:path.join(reportDir,`reviews-form-${width}.png`)});
   await page.locator('#send').click();assert(await page.locator('#client-state').isVisible());
   await page.locator('label[for=s5]').click();await page.locator('#review-text').fill('Спасибо за консультацию. <b>Текст клиента</b>');
   await page.locator('[data-close=review-dialog]').click();await page.locator('#write-review').click();
   assert((await page.locator('#review-text').inputValue()).includes('Текст клиента'));
   await page.locator('#send').click();assert.equal(await page.locator('#rating').textContent(),'4.3');
   assert.equal(await page.locator('#review-list b').count(),3);
   assert.equal(await page.locator('#review-list').getByText('Спасибо за консультацию. <b>Текст клиента</b>',{exact:true}).count(),1);
   assert(await page.locator('#write-review').isDisabled());
   await toggleAdmin();await decision('RV-203','hide','Проверка содержания');
   assert.equal(await page.locator('#rating').textContent(),'4.0');
   await decision('RV-203','restore','Проверка завершена');assert.equal(await page.locator('#rating').textContent(),'4.3');
   for(const id of ['RV-203','RV-201','RV-202'])await decision(id,'hide','Проверка полного скрытия');
   await toggleAdmin();await unrated();await layout(width);
   await toggleAdmin();await decision('RV-201','restore','Восстановление');await toggleAdmin();
   assert.equal(await page.locator('#rating').textContent(),'5.0');
   await toggleAdmin();for(const id of ['RV-203','RV-201','RV-202'])await decision(id,'delete','Тест удаления');
   await toggleAdmin();await unrated();
   await open('?reviews=empty');await unrated();await layout(width);
   const emptyHeader=await page.locator('.card-main-info').boundingBox();
   assert(ratedHeader.height-emptyHeader.height>=20,'Empty header must not reserve the rating row height');
   assert(await page.evaluate(()=>{
    const rating=document.querySelector('.profile-rating-link');
    const header=document.querySelector('.card-main-info');
    const before=header.getBoundingClientRect().height;
    const next=rating.nextSibling;const parent=rating.parentNode;
    rating.remove();const after=header.getBoundingClientRect().height;
    parent.insertBefore(rating,next);
    return Math.abs(before-after)<1;
   }),'Hidden rating row must not retain an empty gap');
   assert.equal(await page.locator('#write-review').textContent(),'Оставить первый отзыв');
   await screenshot(`reviews-empty-${width}.png`);
   if(width===1440||width===390){
    await page.locator('.card-main-info').screenshot({path:path.join(reportDir,`reviews-empty-header-${width}.png`)});
    await page.locator('#reviews').screenshot({path:path.join(reportDir,`reviews-empty-section-${width}.png`)});
   }
   assert(await page.locator('#review-empty').isVisible());
   await page.locator('#write-review').click();await page.locator('label[for=s4]').click();await page.locator('#send').click();
   assert.equal(await page.locator('#rating').textContent(),'4.0');
   assert.equal(await page.locator('#review-list article').count(),1);
   assert.equal(await page.locator('#review-empty').isVisible(),false);
   assert.equal(await page.locator('.profile-rating-link .fa-star').count(),4);
   assert(await page.locator('.profile-rating-link').isVisible(),'First published review restores the rating row');
   assert((await page.locator('.profile-rating-link').textContent()).includes('4.0'));
   assert((await page.locator('.profile-rating-link').textContent()).includes('1 отзыв'));
   await page.locator('.profile-rating-link').click();assert(await page.locator('#review-list').isVisible());
   await open('?reviews=empty&eligible=0');await unrated();assert.equal(await page.locator('#write-review').isVisible(),false);
   if(width===1440||width===390)await page.locator('#reviews').screenshot({path:path.join(reportDir,`reviews-empty-ineligible-${width}.png`)});
   await page.locator('.review-photo-thumb').click();assert(await page.locator('#photo-dialog').isVisible());
   await page.locator('#gallery-photo').evaluate(img=>img.decode());await page.keyboard.press('Escape');
   await page.locator('#more-toggle').click();await page.locator('#report-profile').click();
   await page.locator('#support-text').fill('Проверка обращения');await page.locator('#support-send').click();
   assert((await page.locator('#toast').textContent()).includes('SP-1024'));
   checks.push({width,status:'PASS',states:['rated','unrated','unrated_ineligible','first_review','all_hidden','restored','all_deleted','admin','form','gallery']});
   console.log(width+': original blocks, responsive geometry, rated/unrated, first review, moderation, form, gallery PASS');
  }
  for(const width of [1440,1024,768,390,360]){
   await page.setViewportSize({width,height:950});
   await page.goto(pathToFileURL(path.join(fixtureDir,'reviews-admin-panel-20260930.html')).href,{waitUntil:'domcontentloaded'});
   const admin=page;
   await admin.locator('#admin-rows tr').first().waitFor();
   assert.equal(await admin.locator('.review-site-header').isVisible(),false);
   assert.equal(await admin.locator('.review-nav').isVisible(),false);
   assert.equal(await admin.locator('#profile').isVisible(),false);
   assert(await admin.locator('#moderation').isVisible());
   assert.equal(await admin.locator('.main-header').count(),1);
   assert.equal(await admin.locator('.main-sidebar').count(),1);
   assert.equal(await admin.locator('body').evaluate(el=>el.classList.contains('skin-youdate')),true);
   assert.equal(await admin.locator('.main-header .navbar').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(71, 89, 143)');
   assert.equal(await admin.locator('.sidebar-menu .active span').first().textContent(),'Reviews');
   await page.screenshot({path:path.join(reportDir,`reviews-admin-panel-${width}.png`),fullPage:true});
   assert.equal(await admin.locator('body').evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   await admin.locator('#admin-search').fill('CT-1001');
   assert.equal(await admin.locator('#admin-rows tr').count(),1);
   await admin.locator('#admin-search').fill('');
   await admin.locator('[data-column=stars]').selectOption('3');
   assert.equal(await admin.locator('#admin-rows tr').count(),1);
   assert((await admin.locator('#admin-rows').textContent()).includes('RV-202'));
   await admin.locator('[data-column=person]').fill('Ирина');
   assert((await admin.locator('#admin-rows').textContent()).includes('Отзывы не найдены'));
   await admin.locator('#reset-filters').click();
   assert.equal(await admin.locator('#admin-rows tr').count(),2);
   await admin.locator('#sidebar-toggle').click();
   const expectedClass=width<768?'sidebar-open':'sidebar-collapse';
   assert.equal(await admin.locator('body').evaluate((el,name)=>el.classList.contains(name),expectedClass),true);
   if(width<768){
    await page.waitForFunction(()=>{const rect=document.querySelector('.main-sidebar').getBoundingClientRect();return rect.left>=-1&&rect.width>=200});
    await page.screenshot({path:path.join(reportDir,`reviews-admin-menu-${width}.png`)});
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>document.querySelector('.main-sidebar').getBoundingClientRect().right<=1);
   }
   else {
    await admin.waitForFunction(()=>document.querySelector('.main-header .logo').getBoundingClientRect().width<=51);
    assert(await admin.locator('.logo-mini').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'Collapsed logo text must fit');
    await admin.locator('#sidebar-toggle').click();
   }
   await admin.locator('[data-id="RV-201"][data-action="hide"]').click();
   await page.screenshot({path:path.join(reportDir,`reviews-admin-reason-${width}.png`)});
   await admin.locator('#reason-form button[type=submit]').click();
   assert(await admin.locator('#reason-error').isVisible());
   await admin.locator('#moderation-reason').fill('Проверка модерации в отдельной странице');
   await admin.locator('#reason-form button[type=submit]').click();
   await admin.locator('[data-filter="hidden"]').click();
   assert.equal(await admin.locator('#admin-rows tr').count(),1);
   assert((await admin.locator('#audit-list').textContent()).includes('Проверка модерации'));
   await admin.locator('[data-id="RV-201"][data-action="restore"]').click();
   await admin.locator('#moderation-reason').fill('Проверка завершена');
   await admin.locator('#reason-form button[type=submit]').click();
   assert((await admin.locator('#admin-rows').textContent()).includes('Отзывы не найдены'));
   await admin.locator('[data-filter=all]').click();
   await admin.locator('[data-id="RV-202"][data-action="delete"]').click();
   await admin.locator('#moderation-reason').fill('Удаление по регламенту');
   await admin.locator('#reason-form button[type=submit]').click();
   assert.equal(await admin.locator('#admin-average').textContent(),'5.0');
   await admin.locator('[data-filter=deleted]').click();
   assert.equal(await admin.locator('#admin-rows tr').count(),1);
   assert.equal(await admin.locator('#admin-rows [data-action]').count(),0);
   checks.push({width,status:'PASS',states:['standalone_admin','support_admin_template','search','hide','restore','delete','column_filters','filters','audit','reason_dialog','sidebar']});
   console.log(width+': support admin template, responsive shell, search, column filters, moderation, audit PASS');
  }
  assert.deepEqual(errors,[]);
  assert.deepEqual(localResourceFailures,[],'No missing active local assets');
  const subjectFiles=['reviews-current-site-mock-20260930.html','reviews-admin-panel-20260930.html','reviews-polish.css','reviews-polish.js','reviews-admin-panel.css','reviews-admin-panel.js','reviews-site-assets/admin-custom.css'].map(file=>path.join(fixtureDir,file));
  subjectFiles.push(__filename);
  const subjects=subjectFiles.map(file=>({path:file,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}));
  fs.writeFileSync(path.join(reportDir,'reviews-layout-verification-20260930.json'),JSON.stringify({schema:'confideline_reviews_layout_receipt.v1',status:'pass',checked_at_utc:new Date().toISOString(),route:'isolated_local_fixture',checks:checks.map(row=>({...row,name:'viewport_'+row.width,status:'pass'})),subjects,page_errors:errors,local_resource_failures:localResourceFailures,failed_count:0,backend_verified:false},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
