(function () {
  'use strict';
  const en=mockState.get('lang')==='en';
  const text=(ru,english)=>en?english:ru;
  const noun=(count,one,few,many)=>count%10===1&&count%100!==11?one:count%10>=2&&count%10<=4&&(count%100<12||count%100>14)?few:many;
  const scenario=ReviewProfileStates.createCase(mockState.get('case'));
  const canReview=reviewEligible&&(scenario?scenario.ui.eligible:true);
  let phaseRecovered=false;
  let revisionDraft=null,appealDraft=null,appealOperation=null;
  const ownPanel=document.createElement('section');ownPanel.id='own-review-panel';ownPanel.className='review-block review-own';ownPanel.hidden=true;ownPanel.setAttribute('aria-labelledby','own-review-title');
  ownPanel.innerHTML='<h2 id="own-review-title">'+text('Мой отзыв','My Review')+'</h2><div id="own-status"></div><p id="own-reason"></p><p id="own-appeal-state" role="status"></p><p id="own-appeal-reply"></p><div class="review-own-actions"><button class="btn btn-outline-primary btn-sm" id="revise-review" type="button"><i class="fa fa-pencil" aria-hidden="true"></i> '+text('Исправить текст','Edit Text')+'</button><button class="btn btn-outline-secondary btn-sm" id="appeal-review" type="button"><i class="fa fa-comment-o" aria-hidden="true"></i> '+text('Запросить пересмотр','Request Reconsideration')+'</button></div>';
  $('reviews').after(ownPanel);$('own-status').append($('published-notice'));
  document.documentElement.lang=en?'en':'ru';
  const profileRating=document.createElement('a');
  profileRating.className='profile-rating-link';profileRating.href='#reviews';
  document.querySelector('.review-location').after(profileRating);
  let store;
  // Explicit visual fixtures are isolated. The ordinary pages share only synthetic demo data.
  const fixture=!!scenario||mockState.has('reviews')||mockState.has('ratingMode')||mockState.has('moderation');
  if(fixture){
    const state=scenario?scenario.state:ReviewAdminWorkflow.initialState();
    if(mockState.has('moderation')){const mode=mockState.get('moderation');state.moderationMode=ReviewAdminWorkflow.moderationModes.includes(mode)?mode:mode==='off'?'none':'premoderation';}
    if(mockState.get('reviews')==='empty')state.reviews=[];
    if(mockState.get('ratingMode')==='manual'){
      try{state.overrides['EX-101']=ReviewRatingModel.validateRating({mode:'manual',rating:mockState.get('rating'),votes:mockState.get('votes')});}catch(_){}
    }
    let raw=JSON.stringify(state);
    store=ReviewAdminWorkflow.create({getItem:()=>raw,setItem:(_,value)=>{raw=value;}});
  }else{
    try{store=ReviewAdminWorkflow.create(window.localStorage);}catch(_){store=ReviewAdminWorkflow.create({getItem:()=>{throw new Error('storage');}});}
  }
  const loadState=document.createElement('div');loadState.id='reviews-load-state';loadState.className='review-load-state';loadState.hidden=true;loadState.setAttribute('role','status');
  loadState.innerHTML='<span id="reviews-load-message"></span><button class="btn btn-outline-primary btn-sm" id="retry-reviews" type="button"><i class="fa fa-refresh" aria-hidden="true"></i></button>';
  document.querySelector('.review-heading').before(loadState);
  $('retry-reviews').title=text('Повторить загрузку','Retry Loading');$('retry-reviews').setAttribute('aria-label',$('retry-reviews').title);
  function showLoadState(loading){
    ownPanel.hidden=true;
    loadState.hidden=false;loadState.setAttribute('role',loading?'status':'alert');loadState.classList.toggle('text-danger',!loading);
    $('reviews-load-message').textContent=loading?text('Загрузка отзывов…','Loading Reviews…'):text('Не удалось загрузить отзывы.','Reviews Could Not Be Loaded.');
    $('retry-reviews').hidden=loading;$('rating-summary').hidden=true;profileRating.hidden=true;$('review-list').replaceChildren();$('review-empty').hidden=true;$('write-review').hidden=true;$('published-notice').hidden=true;
  }
  function errorMessage(error){
    const lifecycle={review_conflict:['Отзыв изменился. Черновик сохранён. Закройте форму и откройте актуальную запись.','Your Review Changed. Your Draft Is Preserved. Close the Form and Open the Current Submission.'],appeal_pending:['Запрос пересмотра уже рассматривается. Дождитесь ответа.','Your Reconsideration Request Is Being Reviewed. Wait for the Reply.'],appeal_exists:['Пересмотр этого решения уже запрошен.','Reconsideration Was Already Requested for This Decision.'],unchanged:['Измените текст перед повторной проверкой.','Change the Text Before Resubmitting.'],reason:['Напишите сообщение от 1 до 500 символов.','Enter a Message of 1 to 500 Characters.']};
    if(lifecycle[error.message])return text(...lifecycle[error.message]);
    const messages={stars:['Выберите оценку от 1 до 5 звёзд.','Choose a Rating from 1 to 5.'],duplicate_consultation:['Отзыв по этой консультации уже отправлен.','A Review for This Consultation Was Already Submitted.'],text_required:['Добавьте текст отзыва.','Add Review Text.'],anonymous_disabled:['Анонимные отзывы отключены. Снимите флажок, чтобы продолжить.','Anonymous Reviews Are Disabled. Clear the Checkbox to Continue.'],submissions_closed:['Приём отзывов сейчас закрыт.','Review Submissions Are Currently Closed.']};
    if(error.message==='text'){const limit=store.settings().maxTextLength;return text('Текст не должен превышать '+limit+' символов.','Text Must Not Exceed '+limit+' Characters.');}
    return text(...(messages[error.message]||['Не удалось сохранить отзыв. Изменения не выполнены.','Your Review Could Not Be Saved. No Changes Applied.']));
  }
  function policy(){
    const p=store.settings(),required=p.moderationMode==='premoderation';
    $('send').textContent=required||revisionDraft?text('Отправить на проверку','Submit for Review'):text('Опубликовать','Publish');
    const publication=$('client-publication-policy'),showPolicy=(required||!!revisionDraft)&&p.moderationMode!=='none';
    publication.hidden=!showPolicy;
    publication.textContent=showPolicy?text('Публикация после проверки модератором','Published After Moderator Review'):'';
    $('review-text').maxLength=p.maxTextLength;$('review-text').required=!p.ratingOnlyAllowed;
    $('client-text-label').textContent=p.ratingOnlyAllowed?text('Ваш отзыв · необязательно','Your Review · Optional'):text('Ваш отзыв','Your Review');
    $('characters').textContent=$('review-text').value.length+' / '+p.maxTextLength;
    $('review-anonymous').closest('label').hidden=!revisionDraft&&!p.anonymousAllowed&&!$('review-anonymous').checked;
    document.querySelectorAll('[name="stars"]').forEach(el=>{el.disabled=!!revisionDraft;});$('review-anonymous').disabled=!!revisionDraft;
    $('send').disabled=busy||(!revisionDraft&&(!p.reviewsEnabled||!p.clientSubmissionEnabled));
    if(!revisionDraft&&$('review-dialog').open&&(!p.reviewsEnabled||!p.clientSubmissionEnabled)){$('client-state').textContent=errorMessage({message:'submissions_closed'});$('client-state').hidden=false;}
  }
  function ownNotice(own){
    ownPanel.hidden=!own;
    if(!own){$('published-notice').hidden=true;return;}
    const review=own.hasText;
    const messages={
      pending:review?['Отзыв отправлен на проверку. Он появится в анкете после одобрения модератором.','Your Review Was Submitted for Moderation. It Will Appear After Approval.']:['Оценка отправлена на проверку. Она будет учтена после одобрения модератором.','Your Rating Was Submitted for Moderation. It Will Be Counted After Approval.'],
      published:review?['Ваш отзыв опубликован. Спасибо!','Your Review Has Been Published. Thank You!']:['Ваша оценка учтена. Спасибо!','Your Rating Has Been Counted. Thank You!'],
      rejected:review?['Ваш отзыв отклонён.','Your Review Was Rejected.']:['Ваша оценка отклонена.','Your Rating Was Rejected.'],
      hidden:review?['Ваш отзыв скрыт.','Your Review Is Hidden.']:['Ваша оценка скрыта.','Your Rating Is Hidden.'],
      deleted:review?['Ваш отзыв удалён.','Your Review Was Deleted.']:['Ваша оценка удалена.','Your Rating Was Deleted.']
    };
    $('published-notice').textContent=text(...messages[own.status]);
    $('published-notice').dataset.status=own.status;$('published-notice').hidden=false;
    const negative=['rejected','hidden','deleted'].includes(own.status),reason=ReviewAdminWorkflow.decisionReasons[own.decision?.code];
    $('own-reason').textContent=negative?(own.decision?.message||(reason?text(...reason.message):text('Вы можете запросить пересмотр решения.','You May Request Reconsideration.'))):'';
    $('own-reason').hidden=!negative;
    $('revise-review').hidden=!own.canRevise;$('appeal-review').hidden=!own.canAppeal;
    const appealMessages={pending:['Запрос пересмотра принят. Ожидайте решения модератора.','Your Reconsideration Request Was Received. Awaiting a Moderator Decision.'],accepted:['После пересмотра запись опубликована.','The Submission Was Published After Reconsideration.'],declined:['Пересмотр завершён. Решение оставлено в силе.','Reconsideration Is Complete. The Original Decision Stands.']};
    $('own-appeal-state').textContent=own.appeal?text(...appealMessages[own.appeal.status]):'';$('own-appeal-state').hidden=!own.appeal;
    $('own-appeal-reply').textContent=own.appeal?.reply||'';$('own-appeal-reply').hidden=!own.appeal?.reply;
  }
  const intakeState=document.createElement('p');intakeState.id='reviews-intake-state';intakeState.className='review-intake-state';intakeState.hidden=true;intakeState.textContent=text('Приём отзывов сейчас закрыт.','Review Submissions Are Currently Closed.');
  document.querySelector('.review-heading').after(intakeState);
  function renderPublic(){
    const p=store.settings();
    ownNotice(store.clientStatus());
    $('reviews').hidden=!p.reviewsEnabled;
    if(!p.reviewsEnabled){profileRating.hidden=true;policy();return;}
    if(scenario?.ui.phase&&!phaseRecovered){showLoadState(scenario.ui.phase==='loading');return;}
    const pub=store.publicReviews('EX-101'),summary=store.publicSummary('EX-101')||{rating:null,votes:0,textCount:pub.length},own=store.clientStatus();
    loadState.hidden=true;
    const average=summary.rating;
    $('rating').textContent=average===null?'—':average.toFixed(1);
    $('rating-stars').innerHTML=average===null?'':stars(Math.round(average));
    $('review-count').textContent=summary.votes+' '+text(noun(summary.votes,'голос','голоса','голосов'),summary.votes===1?'rating':'ratings')+' · '+summary.textCount+' '+text(noun(summary.textCount,'текстовый отзыв','текстовых отзыва','текстовых отзывов'),summary.textCount===1?'text review':'text reviews');
    $('review-list').innerHTML=pub.map(r=>'<article class="review-entry"><div class="review-entry-top"><div class="review-author"><span class="review-avatar">'+escapeHtml(r.anonymous?'?':r.author[0])+'</span><div><b>'+escapeHtml(r.anonymous?text('Анонимный клиент','Anonymous Client'):r.author)+'</b><small>'+escapeHtml(r.createdAt.slice(0,10))+'</small></div></div><span class="review-stars" aria-label="'+r.stars+' / 5">'+stars(r.stars)+'</span></div><p>'+escapeHtml(r.text)+'</p>'+(r.consultationVerified?'<small class="review-verified"><i class="fa fa-check" aria-hidden="true"></i> '+text('После завершённой консультации','After a Completed Consultation')+'</small>':r.verified?'<small class="review-verified"><i class="fa fa-check" aria-hidden="true"></i> '+text('Проверен','Verified')+'</small>':'')+'</article>').join('');
    profileRating.hidden=average===null;
    profileRating.innerHTML=average===null?'':'<span class="review-stars" aria-hidden="true">'+stars(Math.round(average))+'</span><strong>'+average.toFixed(1)+'</strong><small>'+escapeHtml($('review-count').textContent)+'</small>';
    if(average===null)profileRating.removeAttribute('aria-label');else profileRating.setAttribute('aria-label',text('Рейтинг ','Rating ')+average.toFixed(1)+' / 5');
    $('rating-summary').hidden=average===null;
    $('review-list').hidden=!p.textReviewsVisible;
    $('review-empty').hidden=!p.textReviewsVisible||pub.length!==0;
    $('review-empty').querySelector('strong').textContent=text('Текстовых отзывов пока нет','No Text Reviews Yet');
    $('review-empty').querySelector('p').textContent=summary.votes?text('Оценки без комментария учтены в рейтинге.','Ratings Without Comments Are Included in the Rating.'):text('Первый отзыв появится после публикации.','The First Review Will Appear Once Published.');
    $('write-review').hidden=!canReview||(!p.clientSubmissionEnabled&&!own);
    $('write-review').disabled=!!own;
    intakeState.hidden=!canReview||p.clientSubmissionEnabled||!!own;
    const ownLabels=own?.hasText?
      {pending:['На проверке','Pending Moderation'],published:['Отзыв опубликован','Review Published'],rejected:['Отзыв отклонён','Review Rejected'],hidden:['Отзыв скрыт','Review Hidden'],deleted:['Отзыв удалён','Review Deleted']}:
      {pending:['На проверке','Pending Moderation'],published:['Оценка учтена','Rating Counted'],rejected:['Оценка отклонена','Rating Rejected'],hidden:['Оценка скрыта','Rating Hidden'],deleted:['Оценка удалена','Rating Deleted']};
    $('write-review').textContent=own?text(...ownLabels[own.status]):p.textReviewsVisible&&summary.textCount===0?text('Оставить первый отзыв','Write the First Review'):text('Оставить отзыв','Write a Review');
    policy();
  }
  render=renderPublic;
  function safeRender(){try{renderPublic();}catch(e){showLoadState(false);}}
  $('retry-reviews').onclick=()=>{phaseRecovered=true;safeRender();};
  $('reviews-heading').textContent=text('Отзывы о консультациях','Consultation Reviews');
  $('review-title').textContent=text('Оценить консультацию','Rate Your Consultation');
  document.querySelector('.review-star-picker legend').textContent=text('Ваша оценка','Your Rating');
  $('review-text').placeholder=text('Поделитесь впечатлениями о консультации','Share Your Consultation Experience');
  $('client-anonymous-label').textContent=text('Анонимно','Anonymous');
  document.querySelectorAll('[name="stars"]').forEach((el,i)=>{el.setAttribute('aria-label',(i+1)+' / 5');el.nextElementSibling.title=(i+1)+' / 5';});
  if(en){document.querySelector('.review-dialog-expert small').textContent='Consultation CT-1024 · September 30';document.querySelector('[data-close="review-dialog"]').title='Close';document.querySelector('[data-close="review-dialog"]').setAttribute('aria-label','Close');}
  let operationId=crypto.randomUUID(),busy=false;
  $('appeal-title').textContent=text('Запросить пересмотр','Request Reconsideration');$('appeal-label').textContent=text('Почему решение нужно пересмотреть?','Why Should This Decision Be Reconsidered?');$('appeal-send').textContent=text('Отправить запрос','Send Request');$('appeal-cancel').textContent=text('Отмена','Cancel');
  $('appeal-dialog').querySelector('[data-close]').title=text('Закрыть','Close');$('appeal-dialog').querySelector('[data-close]').setAttribute('aria-label',text('Закрыть','Close'));
  $('revise-review').onclick=()=>{try{const own=store.clientStatus();if(!own?.canRevise)return;revisionDraft=own;operationId=crypto.randomUUID();busy=false;$('review-title').textContent=text('Исправить отзыв','Edit Your Review');$('review-text').value=own.text;$('review-anonymous').checked=own.anonymous;document.querySelectorAll('[name="stars"]').forEach(el=>{el.checked=Number(el.value)===own.stars;el.nextElementSibling.classList.toggle('chosen',Number(el.value)<=own.stars);});$('client-state').hidden=true;policy();openDialog('review-dialog');}catch(e){notify(errorMessage(e));}};
  $('appeal-review').onclick=()=>{try{const own=store.clientStatus();if(!own?.canAppeal)return;appealDraft=own;appealOperation=crypto.randomUUID();$('appeal-context').textContent=own.id+' · CT-1024 · Marcus Antoniu';$('appeal-text').value='';$('appeal-error').hidden=true;$('appeal-send').disabled=false;openDialog('appeal-dialog');}catch(e){notify(errorMessage(e));}};
  $('appeal-form').onsubmit=e=>{e.preventDefault();if(!appealDraft||$('appeal-send').disabled)return;$('appeal-send').disabled=true;try{store.appealClient({id:appealDraft.id,version:appealDraft.version,operationId:appealOperation,message:$('appeal-text').value});$('appeal-dialog').close();safeRender();ownPanel.scrollIntoView({block:'center'});}catch(e){$('appeal-error').textContent=errorMessage(e);$('appeal-error').hidden=false;$('appeal-send').disabled=false;}};
  $('review-text').oninput=()=>{try{policy();}catch(_){}};
  $('review-anonymous').onchange=()=>{try{policy();}catch(_){}};
  $('write-review').onclick=()=>{try{const p=store.settings();if(!canReview||!p.reviewsEnabled||!p.clientSubmissionEnabled||store.clientStatus())return;policy();$('client-state').hidden=true;openDialog('review-dialog');}catch(e){notify(errorMessage(e));}};
  $('review-form').onsubmit=e=>{
    e.preventDefault();if(busy||!canReview)return;
    busy=true;$('send').disabled=true;$('client-state').hidden=true;
    try{
      const review=revisionDraft?store.reviseClient({id:revisionDraft.id,version:revisionDraft.version,operationId,text:$('review-text').value}):store.submitClient({operationId,expertId:'EX-101',stars:document.querySelector('[name="stars"]:checked')?.value||'',text:$('review-text').value,anonymous:$('review-anonymous').checked});
      $('published-notice').textContent=review.status==='pending'?(review.text?text('Отзыв отправлен на проверку. Он появится в анкете после одобрения модератором.','Your Review Was Submitted for Moderation. It Will Appear After Approval.'):text('Оценка отправлена на проверку. Она будет учтена после одобрения модератором.','Your Rating Was Submitted for Moderation. It Will Be Counted After Approval.')):(review.text?text('Ваш отзыв опубликован. Спасибо!','Your Review Has Been Published. Thank You!'):text('Ваша оценка учтена. Спасибо!','Your Rating Has Been Counted. Thank You!'));
      $('published-notice').hidden=false;safeRender();$('review-dialog').close();ownPanel.scrollIntoView({behavior:'smooth',block:'center'});
    }catch(e){busy=false;try{policy();}catch(_){}$('client-state').textContent=errorMessage(e);$('client-state').hidden=false;}
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
  if(scenario){
    const ui=scenario.ui;
    const notices={
      'pending-text':text('Отзыв отправлен на проверку. Он появится в анкете после одобрения модератором.','Your Review Was Submitted for Moderation. It Will Appear After Approval.'),
      'pending-rating':text('Оценка отправлена на проверку. Она будет учтена после одобрения модератором.','Your Rating Was Submitted for Moderation. It Will Be Counted After Approval.'),
      'published-text':text('Ваш отзыв опубликован. Спасибо!','Your Review Has Been Published. Thank You!'),
      'published-rating':text('Ваша оценка учтена. Спасибо!','Your Rating Has Been Counted. Thank You!')
    };
    if(ui.notice){$('published-notice').textContent=notices[ui.notice];$('published-notice').hidden=false;}
    if(ui.form){
      if(ui.stars){const input=document.querySelector('[name="stars"][value="'+ui.stars+'"]');input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));}
      $('review-text').value=ui.text;$('review-text').dispatchEvent(new Event('input',{bubbles:true}));$('review-anonymous').checked=ui.anonymous;policy();
      if(ui.error){$('client-state').textContent=errorMessage({message:ui.error});$('client-state').hidden=false;}
      if(ui.sending){busy=true;document.querySelectorAll('#review-form input,#review-form textarea,#review-form button').forEach(el=>{el.disabled=true;});$('send').textContent=text('Отправка…','Sending…');}
      openDialog('review-dialog');
    }
    if(!ui.form)$('reviews').scrollIntoView({block:'start'});
  }
  if(mockState.get('view')==='admin')location.replace('reviews.html?role=moderator&lang='+(en?'en':'ru'));
})();
