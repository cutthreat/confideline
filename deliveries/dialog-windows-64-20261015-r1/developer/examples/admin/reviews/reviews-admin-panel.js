'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 const reviews=[
  {id:'RV-201',consultation:'CT-1001',author:'Ирина',expert:'Marcus Antoniu',stars:5,text:'Спасибо за внимательную беседу. Получилось спокойно обсудить мой вопрос и посмотреть на ситуацию по-другому.',status:'published'},
  {id:'RV-202',consultation:'CT-1002',author:'Александр',expert:'Marcus Antoniu',stars:3,text:'Ответы были понятными, но хотелось подробнее обсудить некоторые моменты.',status:'published'}
 ];
 const audit=[];let filter='all',pending=null,returnFocus=null,toastTimer;
 const labels={published:'Опубликован',hidden:'Скрыт',deleted:'Удалён'};
 const actionLabels={hide:'Скрыть отзыв',restore:'Восстановить отзыв',delete:'Удалить отзыв'};
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const stars=value=>'<i class="fa fa-star" aria-hidden="true"></i>'.repeat(value)+'<i class="fa fa-star-o" aria-hidden="true"></i>'.repeat(5-value);
 function actionButton(review,action,icon){return '<button type="button" class="btn btn-default btn-sm review-action-'+action+'" data-id="'+review.id+'" data-action="'+action+'" title="'+actionLabels[action]+'" aria-label="'+actionLabels[action]+' '+review.id+'"><i class="fa '+icon+'" aria-hidden="true"></i></button>'}
 function render(){
  const published=reviews.filter(r=>r.status==='published');
  $('admin-average').textContent=published.length?(published.reduce((sum,r)=>sum+r.stars,0)/published.length).toFixed(1):'—';
  $('sidebar-review-count').textContent=reviews.filter(r=>r.status!=='deleted').length;
  document.querySelectorAll('[data-count]').forEach(el=>el.textContent=reviews.filter(r=>el.dataset.count==='all'||r.status===el.dataset.count).length);
  const query=$('admin-search').value.trim().toLowerCase();
  const columns=Object.fromEntries([...document.querySelectorAll('[data-column]')].map(el=>[el.dataset.column,el.value.trim().toLowerCase()]));
  const visible=reviews.filter(r=>{
   if(filter!=='all'&&r.status!==filter)return false;
   const values={id:r.id,person:r.author+' '+r.expert,consultation:r.consultation,stars:String(r.stars),text:r.text};
   if(query&&![...Object.values(values),labels[r.status]].join(' ').toLowerCase().includes(query))return false;
   return Object.entries(columns).every(([key,value])=>!value||(key==='stars'?values[key]===value:values[key].toLowerCase().includes(value)));
  });
  $('admin-rows').innerHTML=visible.map(r=>'<tr><td><strong>'+r.id+'</strong><small>30.09.2026</small></td><td>'+escape(r.author)+'<small>'+escape(r.expert)+'</small></td><td>'+r.consultation+'<small>Завершена</small></td><td><span class="review-admin-stars" aria-label="'+r.stars+' из 5">'+stars(r.stars)+'</span></td><td>'+escape(r.text||'Без комментария')+'</td><td><span class="label '+({published:'label-success',hidden:'label-warning',deleted:'label-default'}[r.status])+'">'+labels[r.status]+'</span></td><td><div class="review-admin-actions">'+(r.status==='published'?actionButton(r,'hide','fa-eye-slash'):r.status==='hidden'?actionButton(r,'restore','fa-undo'):'')+(r.status!=='deleted'?actionButton(r,'delete','fa-trash-o'):'')+'</div></td></tr>').join('')||'<tr><td colspan="7" class="review-admin-empty">Отзывы не найдены.</td></tr>';
  $('admin-result-count').textContent='Показано: '+visible.length+' · Всего: '+reviews.length;
  $('reset-filters').hidden=filter==='all'&&!query&&!Object.values(columns).some(Boolean);
  document.querySelectorAll('[data-filter]').forEach(el=>{const active=el.dataset.filter===filter;el.parentElement.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active))});
  if(!audit.length){$('audit-list').textContent='Действий пока нет.';return}
  $('audit-list').replaceChildren(...audit.map(row=>{
   const el=document.createElement('div');el.className='review-audit-entry';
   const title=document.createElement('strong');title.textContent=row.id+' · '+row.status;
   const reason=document.createElement('div');reason.textContent=row.reason;
   const meta=document.createElement('small');meta.textContent=row.time+' · admin';
   el.append(title,reason,meta);return el;
  }));
 }
 function notify(text){clearTimeout(toastTimer);$('admin-feedback').textContent=text;$('admin-feedback').hidden=false;toastTimer=setTimeout(()=>{$('admin-feedback').hidden=true},3000)}
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
  $('reason-context').textContent=review.id+' · '+review.author+' · '+review.expert+' · '+review.consultation;
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
  audit.unshift({id:review.id,status:labels[review.status],reason,time});
  render();$('reason-dialog').close();notify('Решение сохранено. Рейтинг пересчитан.');
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
