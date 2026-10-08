'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 const reviews=[
  {id:'RV-201',consultation:'CT-1001',author:'Ирина',expert:'Marcus Antoniu',stars:5,text:'Спасибо за внимательную беседу. Получилось спокойно обсудить мой вопрос и посмотреть на ситуацию по-другому.',status:'published'},
  {id:'RV-202',consultation:'CT-1002',author:'Александр',expert:'Marcus Antoniu',stars:3,text:'Ответы были понятными, но хотелось подробнее обсудить некоторые моменты.',status:'published'}
 ];
 const model=ReviewRatingModel;
 const experts={'EX-101':'Marcus Antoniu','EX-102':'Elena Petrova'};
 const profiles=[{id:'USR-301',name:'Ирина'},{id:'USR-302',name:'Александр'},{id:'USR-303',name:'Анна'}];
 reviews.forEach((r,i)=>Object.assign(r,{expertId:'EX-101',authorProfileId:profiles[i].id,source:'client',date:'30.09.2026'}));
 const overrides={};let nextReviewId=203,dialogExpert=null,dialogTrigger=null;
 const expertId=()=>$('expert-select').value;
 const currentRating=()=>model.aggregate(reviews,expertId(),overrides[expertId()]);
 const describeRating=s=>`${s.mode==='manual'?'Вручную':'Автоматически'}: ${s.rating===null?'нет':s.rating.toFixed(1)}, голосов ${s.votes}`;
 const now=()=>new Intl.DateTimeFormat('ru-RU',{timeZone:'Europe/Minsk',dateStyle:'short',timeStyle:'short'}).format(new Date());
 const audit=[];let filter='all',pending=null,returnFocus=null,toastTimer;
 const labels={published:'Опубликован',hidden:'Скрыт',deleted:'Удалён'};
 const actionLabels={hide:'Скрыть отзыв',restore:'Восстановить отзыв',delete:'Удалить отзыв'};
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const stars=value=>'<i class="fa fa-star" aria-hidden="true"></i>'.repeat(value)+'<i class="fa fa-star-o" aria-hidden="true"></i>'.repeat(5-value);
 function actionButton(review,action,icon){return '<button type="button" class="btn btn-default btn-sm review-action-'+action+'" data-id="'+review.id+'" data-action="'+action+'" title="'+actionLabels[action]+'" aria-label="'+actionLabels[action]+' '+review.id+'"><i class="fa '+icon+'" aria-hidden="true"></i></button>'}
 function render(){
  const scoped=reviews.filter(r=>r.expertId===expertId());
  const summary=currentRating();
  $('admin-average').textContent=summary.rating===null?'—':summary.rating.toFixed(1);
  $('admin-votes').textContent=summary.votes;
  $('admin-rating-mode').textContent=summary.mode==='manual'?'Ручной':'Автоматический';
  $('admin-auto-summary').textContent='Опубликованных отзывов: '+summary.publishedCount+' · Средняя оценка: '+(summary.autoRating===null?'—':summary.autoRating.toFixed(1));
  const preview=new URL('reviews-current-site-mock-20260930.html',location.href);
  if(expertId()==='EX-102')preview.searchParams.set('state','empty');
  if(summary.mode==='manual'){preview.searchParams.set('ratingMode','manual');preview.searchParams.set('rating',summary.rating===null?'':summary.rating);preview.searchParams.set('votes',summary.votes)}
  $('public-preview').href=preview.href;
  $('public-preview').hidden=expertId()!=='EX-101';
  $('sidebar-review-count').textContent=reviews.filter(r=>r.status!=='deleted').length;
  document.querySelectorAll('[data-count]').forEach(el=>el.textContent=scoped.filter(r=>el.dataset.count==='all'||r.status===el.dataset.count).length);
  const query=$('admin-search').value.trim().toLowerCase();
  const columns=Object.fromEntries([...document.querySelectorAll('[data-column]')].map(el=>[el.dataset.column,el.value.trim().toLowerCase()]));
  const visible=scoped.filter(r=>{
   if(filter!=='all'&&r.status!==filter)return false;
   const values={id:r.id,person:r.author+' '+r.expert,consultation:r.consultation||'Добавлен администратором',stars:String(r.stars),text:r.text};
   if(query&&![...Object.values(values),labels[r.status]].join(' ').toLowerCase().includes(query))return false;
   return Object.entries(columns).every(([key,value])=>!value||(key==='stars'?values[key]===value:values[key].toLowerCase().includes(value)));
  });
  $('admin-rows').innerHTML=visible.map(r=>'<tr><td><strong>'+r.id+'</strong><small>'+escape(r.date)+'</small></td><td>'+escape(r.author)+'<small>'+escape(r.authorProfileId)+' · '+escape(r.expert)+'</small></td><td>'+(r.consultation?escape(r.consultation)+'<small>Завершена</small>':'<span class="review-source-admin">Администратор</span><small>Без консультации</small>')+'</td><td><span class="review-admin-stars" aria-label="'+r.stars+' из 5">'+stars(r.stars)+'</span></td><td>'+escape(r.text||'Без комментария')+'</td><td><span class="label '+({published:'label-success',hidden:'label-warning',deleted:'label-default'}[r.status])+'">'+labels[r.status]+'</span></td><td><div class="review-admin-actions">'+(r.status==='published'?actionButton(r,'hide','fa-eye-slash'):r.status==='hidden'?actionButton(r,'restore','fa-undo'):'')+(r.status!=='deleted'?actionButton(r,'delete','fa-trash-o'):'')+'</div></td></tr>').join('')||'<tr><td colspan="7" class="review-admin-empty">Отзывы не найдены.</td></tr>';
  $('admin-result-count').textContent='Показано: '+visible.length+' · Всего: '+scoped.length;
  $('reset-filters').hidden=filter==='all'&&!query&&!Object.values(columns).some(Boolean);
  document.querySelectorAll('[data-filter]').forEach(el=>{const active=el.dataset.filter===filter;el.parentElement.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active))});
  if(!audit.length){$('audit-list').textContent='Действий пока нет.';return}
  $('audit-list').replaceChildren(...audit.map(row=>{
   const el=document.createElement('div');el.className='review-audit-entry';
   const title=document.createElement('strong');title.textContent=row.id+' · '+row.status;
   const reason=document.createElement('div');reason.textContent=row.reason;
   const meta=document.createElement('small');meta.textContent=row.time+' · admin · '+(row.meta||'');
   el.append(title,reason,meta);return el;
  }));
 }
 function notify(text){clearTimeout(toastTimer);$('admin-feedback').textContent=text;$('admin-feedback').hidden=false;toastTimer=setTimeout(()=>{$('admin-feedback').hidden=true},3000)}
 $('expert-select').onchange=()=>{filter='all';$('admin-search').value='';document.querySelectorAll('[data-column]').forEach(el=>el.value='');render()};
 function openEditor(id,button){dialogExpert=expertId();dialogTrigger=button;$(id).showModal()}
 document.querySelectorAll('[data-close]').forEach(button=>button.onclick=()=>$(button.dataset.close).close());
 ['rating-dialog','create-dialog'].forEach(id=>$(id).addEventListener('close',()=>{dialogExpert=null;if(dialogTrigger&&dialogTrigger.isConnected)dialogTrigger.focus({preventScroll:true})}));
 function ratingModeChanged(){const manual=document.querySelector('[name="rating-mode"]:checked').value==='manual';$('manual-rating-fields').hidden=!manual;$('manual-rating').disabled=!manual||$('manual-votes').value.trim()==='0';$('manual-votes').disabled=!manual}
 document.querySelectorAll('[name="rating-mode"]').forEach(input=>input.onchange=ratingModeChanged);
 $('manual-votes').oninput=ratingModeChanged;
 $('edit-rating').onclick=()=>{
  const s=currentRating();$('rating-form').reset();$('rating-error').hidden=true;
  $('rating-context').textContent=experts[expertId()]+' · '+expertId();
  document.querySelector('[name="rating-mode"][value="'+s.mode+'"]').checked=true;
  $('manual-rating').value=s.rating===null?'':s.rating.toFixed(1);$('manual-votes').value=s.votes;ratingModeChanged();
  openEditor('rating-dialog',$('edit-rating'));
 };
 const errors={rating:'Укажите рейтинг от 1.0 до 5.0, не более одного знака после запятой.',votes:'Укажите целое неотрицательное количество голосов.',reason:'Укажите причину от 1 до 500 символов.',author:'Выберите доступный профиль автора.',stars:'Выберите оценку от 1 до 5.',text:'Укажите текст отзыва от 1 до 1000 символов.',mode:'Выберите источник рейтинга.'};
 function editorError(id,error){$(id).textContent=errors[error.message]||'Не удалось сохранить изменение.';$(id).hidden=false;$(id).scrollIntoView({block:'nearest'})}
 $('rating-form').onsubmit=e=>{
  e.preventDefault();if(!$('rating-dialog').open||!dialogExpert)return;
  try{
   const next=model.validateRating({mode:document.querySelector('[name="rating-mode"]:checked').value,rating:$('manual-rating').value,votes:$('manual-votes').value});
   const reason=model.validateReason($('rating-reason').value),id=dialogExpert;
   const before=model.aggregate(reviews,id,overrides[id]);overrides[id]=next;
   const after=model.aggregate(reviews,id,next);
   audit.unshift({id:experts[id]+' · '+id,status:'Рейтинг изменён',reason,time:now(),meta:describeRating(before)+' → '+describeRating(after)});
   render();$('rating-dialog').close();notify('Рейтинг и количество голосов сохранены.');
  }catch(error){editorError('rating-error',error)}
 };
 $('add-review').onclick=()=>{$('create-form').reset();$('create-error').hidden=true;$('create-text-count').textContent='0 / 1000';$('create-context').textContent=experts[expertId()]+' · '+expertId();openEditor('create-dialog',$('add-review'));$('review-author').focus()};
 $('admin-review-text').oninput=()=>{$('create-text-count').textContent=$('admin-review-text').value.length+' / 1000'};
 $('create-form').onsubmit=e=>{
  e.preventDefault();if(!$('create-dialog').open||!dialogExpert)return;
  try{
   const value=model.validateReview({authorProfileId:$('review-author').value,stars:document.querySelector('[name="admin-stars"]:checked')?.value,text:$('admin-review-text').value},profiles);
   const reason=model.validateReason($('create-reason').value),id=dialogExpert;
   const review=Object.assign(value,{id:'RV-'+nextReviewId++,expertId:id,expert:experts[id],status:'published',date:new Intl.DateTimeFormat('ru-RU',{timeZone:'Europe/Minsk'}).format(new Date())});
   reviews.unshift(review);audit.unshift({id:review.id,status:'Отзыв добавлен',reason,time:now(),meta:'Автор: '+value.author+' · '+value.authorProfileId+' · Эксперт: '+id+' · Источник: admin'});
   filter='all';$('admin-search').value='';document.querySelectorAll('[data-column]').forEach(el=>el.value='');render();$('create-dialog').close();notify('Отзыв опубликован от выбранного профиля.');
  }catch(error){editorError('create-error',error)}
 };
 document.querySelectorAll('[data-filter]').forEach(el=>el.onclick=e=>{e.preventDefault();filter=el.dataset.filter;render()});
 $('admin-search').oninput=render;
 document.querySelectorAll('[data-column]').forEach(el=>el.addEventListener(el.tagName==='SELECT'?'change':'input',render));
 $('reset-filters').onclick=()=>{filter='all';$('admin-search').value='';$('header-search').value='';document.querySelectorAll('[data-column]').forEach(el=>el.value='');render()};
 $('header-search-form').onsubmit=e=>{e.preventDefault();$('admin-search').value=$('header-search').value;render();$('admin-search').focus()};
 $('admin-rows').onclick=e=>{
  const button=e.target.closest('[data-action]');if(!button||$('reason-dialog').open)return;
  const review=reviews.find(r=>r.id===button.dataset.id);if(!review||!actionLabels[button.dataset.action])return;
  pending={id:review.id,action:button.dataset.action};returnFocus=button;
  $('reason-title').textContent=actionLabels[pending.action];
  $('reason-context').textContent=review.id+' · '+review.author+' · '+review.expert+' · '+(review.consultation||'Без консультации');
  $('moderation-reason').value='';$('reason-error').hidden=true;$('reason-dialog').showModal();$('moderation-reason').focus();
 };
 $('reason-close').onclick=$('reason-cancel').onclick=()=>{$('reason-dialog').close()};
 $('reason-dialog').addEventListener('close',()=>{pending=null;if(returnFocus&&returnFocus.isConnected)returnFocus.focus({preventScroll:true});else document.querySelector('[data-filter="'+filter+'"]').focus({preventScroll:true})});
 $('reason-form').onsubmit=e=>{
  e.preventDefault();if(!pending)return;
  const reason=$('moderation-reason').value.trim();
  if(!reason||reason.length>500){$('reason-error').textContent='Укажите причину от 1 до 500 символов.';$('reason-error').hidden=false;$('moderation-reason').focus();return}
  const review=reviews.find(r=>r.id===pending.id);
  const valid=review&&(pending.action==='hide'&&review.status==='published'||pending.action==='restore'&&review.status==='hidden'||pending.action==='delete'&&review.status!=='deleted');
  if(!valid)return;
  review.status={hide:'hidden',restore:'published',delete:'deleted'}[pending.action];
  const time=new Intl.DateTimeFormat('ru-RU',{timeZone:'Europe/Minsk',dateStyle:'short',timeStyle:'short'}).format(new Date());
  audit.unshift({id:review.id,status:labels[review.status],reason,time,meta:'Автор: '+review.authorProfileId+' · Эксперт: '+review.expertId});
  render();$('reason-dialog').close();notify('Решение сохранено. '+(currentRating().mode==='manual'?'Ручной рейтинг не изменён.':'Рейтинг пересчитан.'));
 };
 const mobile=()=>matchMedia('(max-width:767px)').matches;
 function updateSidebar(){const open=mobile()?document.body.classList.contains('sidebar-open'):!document.body.classList.contains('sidebar-collapse');$('sidebar-toggle').setAttribute('aria-expanded',String(open));$('sidebar-backdrop').hidden=!mobile()||!open}
 function closeSidebar(){document.body.classList.remove('sidebar-open');updateSidebar()}
 $('sidebar-toggle').onclick=()=>{document.body.classList.toggle(mobile()?'sidebar-open':'sidebar-collapse');updateSidebar()};
 $('sidebar-backdrop').onclick=closeSidebar;
 addEventListener('resize',()=>{if(!mobile())document.body.classList.remove('sidebar-open');updateSidebar()});
 document.querySelectorAll('.sidebar-menu a').forEach(el=>{const title=el.querySelector('span').textContent;el.title=title;el.setAttribute('aria-label',title);if(el.getAttribute('aria-disabled')==='true')el.onclick=e=>e.preventDefault();else el.onclick=closeSidebar});
 const account=$('admin-account-menu');
 function closeAccount(){account.hidden=true;$('admin-account-toggle').setAttribute('aria-expanded','false')}
 $('admin-account-toggle').onclick=()=>{account.hidden=!account.hidden;$('admin-account-toggle').setAttribute('aria-expanded',String(!account.hidden))};
 document.addEventListener('click',e=>{if(!e.target.closest('.user-menu'))closeAccount()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!account.hidden){closeAccount();$('admin-account-toggle').focus()}if(document.body.classList.contains('sidebar-open')){closeSidebar();$('sidebar-toggle').focus()}}});
 render();updateSidebar();
})();
