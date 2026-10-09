(function () {
  'use strict';
  const {role,lang,t,esc,can,store,error} = ReviewAdminUI,$ = id => document.getElementById(id);
  document.title = t('moderation');
  if (!can('view')) { $('moderation').innerHTML = '<div class="alert alert-danger" role="alert">' + t('forbidden') + '</div>'; document.querySelectorAll('dialog').forEach(d=>d.remove()); return; }
  let filter = 'all',pending = null,focusReturn = null,timer;
  const columnNames = ['id','person','consultation','stars','text'];
  const actionIcons = {approve:'check',reject:'ban',hide:'eye-slash',restore:'undo',delete:'trash-o',appeal_publish:'gavel',appeal_decline:'ban'};
  const appealTab=document.createElement('li');appealTab.innerHTML='<a href="#" data-filter="appeal">'+t('appeal')+' <span data-count="appeal" class="badge">0</span></a>';document.querySelector('[data-filter="pending"]').parentElement.after(appealTab);
  function feedback(message) { $('admin-feedback').textContent=message; $('admin-feedback').hidden=false; clearTimeout(timer); timer=setTimeout(()=>{$('admin-feedback').hidden=true;},4000); }
  function showError(id,e) { $(id).textContent=error(e); $(id).hidden=false; }
  function open(id) { focusReturn=document.activeElement; $(id).showModal(); }
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
  ['reason-close','reason-cancel'].forEach(id=>$(id).onclick=()=>$('reason-dialog').close());
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('close',()=>{if(focusReturn?.isConnected&&!focusReturn.disabled)focusReturn.focus({preventScroll:true});}));
  $('restricted-audit').hidden=!can('audit');
  if (!can('audit')) $('restricted-audit').remove();
  document.querySelectorAll('thead>tr:first-child th').forEach((el,i)=>{el.textContent=t(['date','person','consultation','stars','textColumn','status','actions'][i]);});
  $('admin-search').placeholder=t('search'); $('admin-search').setAttribute('aria-label',t('search'));
  $('expert-select').setAttribute('aria-label',t('expert'));
  document.querySelector('.review-admin-summary .box-title').textContent=t('reviews');
  $('moderation-reason').placeholder=t('reason');
  $('reason-close').title=t('cancel');$('reason-close').setAttribute('aria-label',t('cancel'));
  document.querySelectorAll('[data-column]').forEach(el=>el.setAttribute('aria-label',t(({id:'date',person:'person',consultation:'consultation',stars:'stars',text:'text'})[el.dataset.column])));
  document.querySelector('[data-column="stars"] option').textContent=t('all');
  $('reset-filters').title=t('reset'); $('reset-filters').setAttribute('aria-label',t('reset'));
  $('internal-reason-label').textContent=t('internalReason');$('client-decision-label').textContent=t('clientDecision');$('client-message-label').textContent=t('clientMessage');$('appeal-reply-label').textContent=t('appealReply');
  $('client-decision-code').innerHTML=Object.entries(ReviewAdminWorkflow.decisionReasons).map(([code,value])=>'<option value="'+code+'">'+esc(value.label[lang==='en'?1:0])+'</option>').join('');
  function clientPreview(){$('client-decision-preview').textContent=ReviewAdminWorkflow.decisionReasons[$('client-decision-code').value].message[lang==='en'?1:0];}
  $('client-decision-code').onchange=clientPreview;
  $('reason-form').querySelector('button[type="submit"]').textContent=t('confirm');
  $('reason-cancel').textContent=t('cancel');
  function render() {
    const expertId=$('expert-select').value;
    const all=store.list(role),rows=all.filter(r=>r.expertId===expertId);
    const matches=(r,status)=>status==='all'||(status==='appeal'?r.appeal?.status==='pending':status==='pending'?r.moderationPending:r.status===status);
    document.querySelectorAll('[data-count]').forEach(el=>{el.textContent=rows.filter(r=>matches(r,el.dataset.count)).length;});
    const query=$('admin-search').value.trim().toLowerCase();
    const columns=Object.fromEntries(columnNames.map(key=>[key,document.querySelector('[data-column="'+key+'"]').value.trim().toLowerCase()]));
    $('reset-filters').hidden=!query&&!Object.values(columns).some(Boolean)&&filter==='all'&&expertId==='EX-101';
    const visible=rows.filter(r=>{
      const person=r.author+' '+(ReviewAdminWorkflow.experts.find(e=>e.id===r.expertId)?.name||'');
      return matches(r,filter)&&[r.id,person,r.consultation,r.text].join(' ').toLowerCase().includes(query)&&Object.entries({...r,person}).every(([key,value])=>!columns[key]||(key==='stars'?String(value)===columns[key]:String(value||'').toLowerCase().includes(columns[key])));
    });
    $('admin-rows').innerHTML=visible.map(r=>{
      const actions=r.appeal?.status==='pending'?['appeal_publish','appeal_decline']:r.moderationPending?['approve','reject','delete']:r.status==='published'?['hide','delete']:r.status==='hidden'?['restore','delete']:r.status==='rejected'?['delete']:[];
      return '<tr data-review-id="'+r.id+'"><td><b>'+r.id+'</b><small>'+esc(r.createdAt.slice(0,10))+'</small></td><td>'+esc(r.author)+'<small>'+esc(r.authorProfileId)+' · '+esc(ReviewAdminWorkflow.experts.find(e=>e.id===r.expertId)?.name||'')+'</small>'+(r.anonymous?'<small>'+t('anonymous')+'</small>':'')+'</td><td>'+esc(r.consultation||t('noConsultation'))+'</td><td><span class="review-admin-stars" aria-label="'+r.stars+' / 5">'+'<i class="fa fa-star" aria-hidden="true"></i>'.repeat(r.stars)+'<i class="fa fa-star-o" aria-hidden="true"></i>'.repeat(5-r.stars)+'</span></td><td>'+esc(r.text||t('noText'))+'</td><td><span class="label '+({pending:'label-warning',published:'label-success',hidden:'label-warning',rejected:'label-danger',deleted:'label-default'})[r.status]+'">'+t(r.status)+'</span><small>'+t(r.verified?'checked':'notChecked')+'</small></td><td><div class="review-admin-actions">'+actions.map(action=>'<button class="btn btn-default btn-sm review-action-'+action+'" type="button" data-action="'+action+'" data-id="'+r.id+'" title="'+t(action)+'" aria-label="'+t(action)+'"><i class="fa fa-'+actionIcons[action]+'" aria-hidden="true"></i></button>').join('')+'</div></td></tr>';
    }).join('')||'<tr><td colspan="7" class="review-admin-empty">'+t('empty')+'</td></tr>';
    for(const row of visible.filter(r=>r.appeal?.status==='pending'||r.status==='published'&&r.moderationPending)){const cell=document.querySelector('[data-review-id="'+row.id+'"] td:nth-child(6)'),badge=document.createElement('small');badge.textContent=t(row.appeal?.status==='pending'?'appeal':'awaitingPostmoderation');badge.className='text-info';cell.append(badge);}
    $('admin-result-count').textContent=visible.length+' / '+rows.length;
    if (can('audit')) {
      const audit=store.audit(role).filter(a=>['approve','reject','hide','restore','delete','appeal_publish','appeal_decline'].includes(a.action));
      $('audit-list').innerHTML=audit.map(a=>'<div class="review-audit-entry"><strong>'+esc(a.id)+' · '+esc(a.action)+' · '+esc(a.actor)+'</strong><small>'+esc(a.at)+'</small><div>'+esc(a.reason)+'</div><details><summary>Before / After</summary><pre>'+esc(JSON.stringify({before:a.before,after:a.after},null,2))+'</pre></details></div>').join('')||t('noActions');
    }
  }
  function safeRender() { try { render(); } catch(e) { $('admin-rows').innerHTML='<tr><td colspan="7" class="text-danger">'+error(e)+'</td></tr>'; feedback(error(e)); } }
  document.querySelectorAll('[data-filter]').forEach(a=>a.onclick=e=>{e.preventDefault();filter=a.dataset.filter;document.querySelectorAll('[data-filter]').forEach(el=>{el.parentElement.classList.toggle('active',el===a);el.setAttribute('aria-pressed',String(el===a));});safeRender();});
  document.querySelectorAll('[data-column],#admin-search').forEach(el=>el.addEventListener('input',safeRender));
  $('expert-select').onchange=safeRender;
  $('reset-filters').onclick=()=>{filter='all';$('expert-select').value='EX-101';$('admin-search').value='';document.querySelectorAll('[data-column]').forEach(el=>{el.value='';});document.querySelectorAll('[data-filter]').forEach(el=>{el.parentElement.classList.toggle('active',el.dataset.filter==='all');el.setAttribute('aria-pressed',String(el.dataset.filter==='all'));});safeRender();};
  $('admin-rows').onclick=e=>{const button=e.target.closest('[data-action]');if(!button)return;const review=store.list(role).find(r=>r.id===button.dataset.id);pending={id:review.id,version:review.version,action:button.dataset.action};const appeal=pending.action.startsWith('appeal_');$('reason-title').textContent=t(pending.action);$('reason-context').textContent=pending.id+' · '+t(review.status);$('moderation-reason').value='';$('client-message').value='';$('appeal-reply').value='';$('client-decision-code').value='personal_data';clientPreview();$('client-feedback').hidden=appeal||!['reject','hide','delete'].includes(pending.action);$('appeal-response').hidden=!appeal;$('appeal-message').hidden=!appeal;$('appeal-message').textContent=review.appeal?.message||'';$('reason-error').hidden=true;open('reason-dialog');};
  $('reason-form').onsubmit=e=>{e.preventDefault();if(!pending)return;try{if(pending.action.startsWith('appeal_'))store.resolveAppeal(role,pending.id,pending.action.slice(7),$('moderation-reason').value,$('appeal-reply').value,pending.version);else store.moderate(role,pending.id,pending.action,$('moderation-reason').value,pending.version,{code:$('client-decision-code').value,message:$('client-message').value});pending=null;$('reason-dialog').close();safeRender();feedback(t('decisionSaved'));}catch(e){showError('reason-error',e);}};
  addEventListener('storage',safeRender);
  safeRender();
})();
