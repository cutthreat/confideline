(function () {
  'use strict';
  const en=mockState.get('lang')==='en';
  const text=(ru,english)=>en?english:ru;
  const noun=(count,one,few,many)=>count%10===1&&count%100!==11?one:count%10>=2&&count%10<=4&&(count%100<12||count%100>14)?few:many;
  document.documentElement.lang=en?'en':'ru';
  const profileRating=document.createElement('a');
  profileRating.className='profile-rating-link';profileRating.href='#reviews';
  document.querySelector('.review-location').after(profileRating);
  let store;
  // Explicit visual fixtures are isolated. The ordinary pages share only synthetic demo data.
  const fixture=mockState.has('reviews')||mockState.has('ratingMode')||mockState.has('moderation');
  if(fixture){
    const state=ReviewAdminWorkflow.initialState();
    if(mockState.has('moderation'))state.moderationRequired=mockState.get('moderation')!=='off';
    if(mockState.get('reviews')==='empty')state.reviews=[];
    if(mockState.get('ratingMode')==='manual'){
      try{state.overrides['EX-101']=ReviewRatingModel.validateRating({mode:'manual',rating:mockState.get('rating'),votes:mockState.get('votes')});}catch(_){}
    }
    let raw=JSON.stringify(state);
    store=ReviewAdminWorkflow.create({getItem:()=>raw,setItem:(_,value)=>{raw=value;}});
  }else{
    try{store=ReviewAdminWorkflow.create(window.localStorage);}catch(_){store=ReviewAdminWorkflow.create({getItem:()=>{throw new Error('storage');}});}
  }
  const errorMessage=error=>text(error.message==='stars'?'Выберите оценку от 1 до 5 звёзд.':error.message==='duplicate_consultation'?'Отзыв по этой консультации уже отправлен.':'Не удалось сохранить отзыв. Изменения не выполнены.',error.message==='stars'?'Choose a Rating from 1 to 5.':error.message==='duplicate_consultation'?'A Review for This Consultation Was Already Submitted.':'Your Review Could Not Be Saved. No Changes Applied.');
  function policy(){const required=store.settings().moderationRequired;$('send').textContent=required?text('Отправить на проверку','Submit for Review'):text('Опубликовать','Publish');$('client-publication-policy').textContent=required?text('После одобрения модератором','After Moderator Approval'):text('Публикация без предварительной модерации','Published Without Prior Moderation');}
  function renderPublic(){
    const pub=store.publicReviews('EX-101'),summary=store.summary('EX-101'),own=store.clientStatus();
    const average=summary.rating;
    $('rating').textContent=average===null?'—':average.toFixed(1);
    $('rating-stars').innerHTML=average===null?'':stars(Math.round(average));
    $('review-count').textContent=summary.votes+' '+text(noun(summary.votes,'голос','голоса','голосов'),summary.votes===1?'rating':'ratings')+' · '+summary.textCount+' '+text(noun(summary.textCount,'текстовый отзыв','текстовых отзыва','текстовых отзывов'),summary.textCount===1?'text review':'text reviews');
    $('review-list').innerHTML=pub.map(r=>'<article class="review-entry"><div class="review-entry-top"><div class="review-author"><span class="review-avatar">'+escapeHtml(r.anonymous?'?':r.author[0])+'</span><div><b>'+escapeHtml(r.anonymous?text('Анонимный клиент','Anonymous Client'):r.author)+'</b><small>'+escapeHtml(r.createdAt.slice(0,10))+'</small></div></div><span class="review-stars" aria-label="'+r.stars+' / 5">'+stars(r.stars)+'</span></div><p>'+escapeHtml(r.text)+'</p>'+(r.consultationVerified?'<small class="review-verified"><i class="fa fa-check" aria-hidden="true"></i> '+text('После завершённой консультации','After a Completed Consultation')+'</small>':r.verified?'<small class="review-verified"><i class="fa fa-check" aria-hidden="true"></i> '+text('Проверен','Verified')+'</small>':'')+'</article>').join('');
    profileRating.hidden=average===null;
    profileRating.innerHTML=average===null?'':'<span class="review-stars" aria-hidden="true">'+stars(Math.round(average))+'</span><strong>'+average.toFixed(1)+'</strong><small>'+escapeHtml($('review-count').textContent)+'</small>';
    if(average===null)profileRating.removeAttribute('aria-label');else profileRating.setAttribute('aria-label',text('Рейтинг ','Rating ')+average.toFixed(1)+' / 5');
    $('rating-summary').hidden=average===null;
    $('review-empty').hidden=pub.length!==0;
    $('review-empty').querySelector('strong').textContent=text('Текстовых отзывов пока нет','No Text Reviews Yet');
    $('review-empty').querySelector('p').textContent=summary.votes?text('Оценки без комментария учтены в рейтинге.','Ratings Without Comments Are Included in the Rating.'):text('Первый отзыв появится после публикации.','The First Review Will Appear Once Published.');
    $('write-review').hidden=!reviewEligible;
    $('write-review').disabled=!!own;
    $('write-review').textContent=own?text(({pending:'На проверке',published:'Отзыв опубликован',rejected:'Отзыв отклонён',hidden:'Отзыв скрыт',deleted:'Отзыв удалён'})[own.status],({pending:'Pending Moderation',published:'Review Published',rejected:'Review Rejected',hidden:'Review Hidden',deleted:'Review Deleted'})[own.status]):pub.length?text('Оставить отзыв','Write a Review'):text('Оставить первый отзыв','Write the First Review');
    policy();
  }
  render=renderPublic;
  function safeRender(){try{renderPublic();}catch(e){$('client-state').textContent=errorMessage(e);$('client-state').hidden=false;$('write-review').disabled=true;notify(errorMessage(e));}}
  $('reviews-heading').textContent=text('Отзывы о консультациях','Consultation Reviews');
  $('review-title').textContent=text('Оценить консультацию','Rate Your Consultation');
  document.querySelector('.review-star-picker legend').textContent=text('Ваша оценка','Your Rating');
  $('client-text-label').textContent=text('Ваш отзыв · необязательно','Your Review · Optional');
  $('review-text').placeholder=text('Поделитесь впечатлениями о консультации','Share Your Consultation Experience');
  $('client-anonymous-label').textContent=text('Анонимно','Anonymous');
  document.querySelectorAll('[name="stars"]').forEach((el,i)=>{el.setAttribute('aria-label',(i+1)+' / 5');el.nextElementSibling.title=(i+1)+' / 5';});
  if(en){document.querySelector('.review-dialog-expert small').textContent='Consultation CT-1024 · September 30';document.querySelector('[data-close="review-dialog"]').title='Close';document.querySelector('[data-close="review-dialog"]').setAttribute('aria-label','Close');}
  let operationId=crypto.randomUUID(),busy=false;
  $('write-review').onclick=()=>{try{if(!reviewEligible||store.clientStatus())return;policy();$('client-state').hidden=true;openDialog('review-dialog');}catch(e){notify(errorMessage(e));}};
  $('review-form').onsubmit=e=>{
    e.preventDefault();if(busy||!reviewEligible)return;
    busy=true;$('send').disabled=true;$('client-state').hidden=true;
    try{
      const review=store.submitClient({operationId,expertId:'EX-101',stars:document.querySelector('[name="stars"]:checked')?.value||'',text:$('review-text').value,anonymous:$('review-anonymous').checked});
      $('published-notice').textContent=review.status==='pending'?(review.text?text('Отзыв отправлен на проверку. Он появится в анкете после одобрения модератором.','Your Review Was Submitted for Moderation. It Will Appear After Approval.'):text('Оценка отправлена на проверку. Она будет учтена после одобрения модератором.','Your Rating Was Submitted for Moderation. It Will Be Counted After Approval.')):(review.text?text('Ваш отзыв опубликован. Спасибо!','Your Review Has Been Published. Thank You!'):text('Ваша оценка учтена. Спасибо!','Your Rating Has Been Counted. Thank You!'));
      $('published-notice').hidden=false;safeRender();$('review-dialog').close();$('reviews').scrollIntoView({behavior:'smooth',block:'center'});
    }catch(e){busy=false;$('send').disabled=false;$('client-state').textContent=errorMessage(e);$('client-state').hidden=false;}
  };
  addEventListener('storage',safeRender);
  $('moderation-toggle').textContent=text('Админка','Administration');
  $('moderation-toggle').onclick=()=>{location.href='reviews.html?role=moderator&lang='+(en?'en':'ru');};
  function closeMenus(){['account','more'].forEach(name=>{$(name+'-menu').hidden=true;$(name+'-toggle').setAttribute('aria-expanded','false');});}
  ['account','more'].forEach(name=>{$(name+'-toggle').onclick=()=>{const open=$(name+'-menu').hidden;closeMenus();$(name+'-menu').hidden=!open;$(name+'-toggle').setAttribute('aria-expanded',String(open));};});
  document.addEventListener('click',e=>{if(!e.target.closest('.review-account,.review-more'))closeMenus();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){const active=document.querySelector('[aria-controls][aria-expanded="true"]');closeMenus();if(active)active.focus();}});
  document.querySelectorAll('[data-demo]').forEach(a=>a.onclick=e=>{e.preventDefault();notify(a.dataset.demo);});
  $('notifications').onclick=()=>notify(text('Новых уведомлений нет','No New Notifications'));
  $('wallet').onclick=()=>notify(text('Баланс: 4074.00','Balance: 4074.00'));
  $('give-gift').onclick=()=>notify(text('Выбор подарка для Marcus Antoniu','Gift for Marcus Antoniu'));
  $('all-gifts').onclick=()=>notify(text('Подарков пока нет','No Gifts Yet'));
  $('report-profile').onclick=()=>{closeMenus();openDialog('support-dialog');};
  $('dismiss-ad').onclick=()=>{$('sidebar-ad').hidden=true;};
  document.querySelectorAll('[data-photo]').forEach(b=>b.onclick=()=>{$('gallery-photo').src='reviews-site-assets/'+b.dataset.photo;openDialog('photo-dialog');});
  safeRender();
  if(mockState.get('view')==='admin')location.replace('reviews.html?role=moderator&lang='+(en?'en':'ru'));
})();
