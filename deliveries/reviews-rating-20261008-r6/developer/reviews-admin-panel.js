(function () {
  'use strict';
  const {role,lang,t,esc,can,store,error} = ReviewAdminUI,$ = id => document.getElementById(id);
  document.title = t('moderation');
  if (!can('view')) { $('moderation').innerHTML = '<div class="alert alert-danger" role="alert">' + t('forbidden') + '</div>'; document.querySelectorAll('dialog').forEach(d=>d.remove()); return; }
  let filter = 'all',pending = null,focusReturn = null,timer;
  const columnNames = ['id','person','consultation','stars','text'];
  const actionIcons = {approve:'check',reject:'ban',hide:'eye-slash',restore:'undo',delete:'trash-o'};
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
  $('public-preview').title=t('expert');$('public-preview').setAttribute('aria-label',t('expert'));
  $('moderation-reason').placeholder=t('reason');
  $('reason-close').title=t('cancel');$('reason-close').setAttribute('aria-label',t('cancel'));
  document.querySelectorAll('[data-column]').forEach(el=>el.setAttribute('aria-label',t(({id:'date',person:'person',consultation:'consultation',stars:'stars',text:'text'})[el.dataset.column])));
  document.querySelector('[data-column="stars"] option').textContent=t('all');
  $('reset-filters').title=t('reset'); $('reset-filters').setAttribute('aria-label',t('reset'));
  $('reason-form').querySelector('label').textContent=t('reason');
  $('reason-form').querySelector('button[type="submit"]').textContent=t('confirm');
  $('reason-cancel').textContent=t('cancel');
  function render() {
    const expertId=$('expert-select').value;
    const all=store.list(role),rows=all.filter(r=>r.expertId===expertId),summary=store.summary(expertId);
    $('admin-average').textContent=summary.rating===null?'—':summary.rating.toFixed(1);
    $('admin-votes').textContent=summary.votes; $('admin-texts').textContent=summary.textCount;
    $('admin-rating-mode').textContent=t(summary.mode);
    $('admin-auto-summary').textContent=summary.mode==='manual'?t('ratingBase')+': '+(summary.baseRating===null?'—':summary.baseRating.toFixed(1))+' · '+t('votes')+': '+summary.baseVotes:'';
    $('public-preview').href='profile.html?shared=1&lang='+lang;
    $('public-preview').hidden=expertId!=='EX-101';
    document.querySelectorAll('[data-count]').forEach(el=>{el.textContent=rows.filter(r=>el.dataset.count==='all'||r.status===el.dataset.count).length;});
    const query=$('admin-search').value.trim().toLowerCase();
    const columns=Object.fromEntries(columnNames.map(key=>[key,document.querySelector('[data-column="'+key+'"]').value.trim().toLowerCase()]));
    $('reset-filters').hidden=!query&&!Object.values(columns).some(Boolean)&&filter==='all'&&expertId==='EX-101';
    const visible=rows.filter(r=>{
      const person=r.author+' '+(ReviewAdminWorkflow.experts.find(e=>e.id===r.expertId)?.name||'');
      return (filter==='all'||r.status===filter)&&[r.id,person,r.consultation,r.text].join(' ').toLowerCase().includes(query)&&Object.entries({...r,person}).every(([key,value])=>!columns[key]||(key==='stars'?String(value)===columns[key]:String(value||'').toLowerCase().includes(columns[key])));
    });
    $('admin-rows').innerHTML=visible.map(r=>{
      const actions=r.status==='pending'?['approve','reject','delete']:r.status==='published'?['hide','delete']:r.status==='hidden'?['restore','delete']:r.status==='rejected'?['delete']:[];
      return '<tr data-review-id="'+r.id+'"><td><b>'+r.id+'</b><small>'+esc(r.createdAt.slice(0,10))+'</small></td><td>'+esc(r.author)+'<small>'+esc(r.authorProfileId)+' · '+esc(ReviewAdminWorkflow.experts.find(e=>e.id===r.expertId)?.name||'')+'</small>'+(r.anonymous?'<small>'+t('anonymous')+'</small>':'')+'</td><td>'+esc(r.consultation||t('noConsultation'))+'</td><td><span class="review-admin-stars" aria-label="'+r.stars+' / 5">'+'<i class="fa fa-star" aria-hidden="true"></i>'.repeat(r.stars)+'<i class="fa fa-star-o" aria-hidden="true"></i>'.repeat(5-r.stars)+'</span></td><td>'+esc(r.text||t('noText'))+'</td><td><span class="label '+({pending:'label-warning',published:'label-success',hidden:'label-warning',rejected:'label-danger',deleted:'label-default'})[r.status]+'">'+t(r.status)+'</span><small>'+t(r.verified?'checked':'notChecked')+'</small></td><td><div class="review-admin-actions">'+actions.map(action=>'<button class="btn btn-default btn-sm review-action-'+action+'" type="button" data-action="'+action+'" data-id="'+r.id+'" title="'+t(action)+'" aria-label="'+t(action)+'"><i class="fa fa-'+actionIcons[action]+'" aria-hidden="true"></i></button>').join('')+'</div></td></tr>';
    }).join('')||'<tr><td colspan="7" class="review-admin-empty">'+t('empty')+'</td></tr>';
    $('admin-result-count').textContent=visible.length+' / '+rows.length;
    if (can('audit')) {
      const audit=store.audit(role);
      $('audit-list').innerHTML=audit.map(a=>'<div class="review-audit-entry"><strong>'+esc(a.id)+' · '+esc(a.action)+' · '+esc(a.actor)+'</strong><small>'+esc(a.at)+'</small><div>'+esc(a.reason)+'</div><details><summary>Before / After</summary><pre>'+esc(JSON.stringify({before:a.before,after:a.after},null,2))+'</pre></details></div>').join('')||t('noActions');
    }
  }
  function safeRender() { try { render(); } catch(e) { $('admin-rows').innerHTML='<tr><td colspan="7" class="text-danger">'+error(e)+'</td></tr>'; feedback(error(e)); } }
  document.querySelectorAll('[data-filter]').forEach(a=>a.onclick=e=>{e.preventDefault();filter=a.dataset.filter;document.querySelectorAll('[data-filter]').forEach(el=>{el.parentElement.classList.toggle('active',el===a);el.setAttribute('aria-pressed',String(el===a));});safeRender();});
  document.querySelectorAll('[data-column],#admin-search').forEach(el=>el.addEventListener('input',safeRender));
  $('expert-select').onchange=safeRender;
  $('reset-filters').onclick=()=>{filter='all';$('expert-select').value='EX-101';$('admin-search').value='';document.querySelectorAll('[data-column]').forEach(el=>{el.value='';});document.querySelectorAll('[data-filter]').forEach(el=>{el.parentElement.classList.toggle('active',el.dataset.filter==='all');el.setAttribute('aria-pressed',String(el.dataset.filter==='all'));});safeRender();};
  $('admin-rows').onclick=e=>{const button=e.target.closest('[data-action]');if(!button)return;pending={id:button.dataset.id,action:button.dataset.action};$('reason-title').textContent=t(pending.action);$('reason-context').textContent=pending.id;$('moderation-reason').value='';$('reason-error').hidden=true;open('reason-dialog');};
  $('reason-form').onsubmit=e=>{e.preventDefault();if(!pending)return;try{store.moderate(role,pending.id,pending.action,$('moderation-reason').value);pending=null;$('reason-dialog').close();safeRender();feedback(t('decisionSaved'));}catch(e){showError('reason-error',e);}};
  if(!can('rating')){$('edit-rating').remove();$('rating-dialog').remove();}
  else{
    const form=$('rating-form');let ratingExpertId=null;
    const pair=(rating,votes)=>(rating===null?'—':rating.toFixed(1))+' · '+t('votes')+': '+votes;
    function mode(){$('manual-rating-fields').hidden=form.elements['rating-mode'].value!=='manual';$('manual-rating').disabled=String($('manual-votes').value).trim()==='0';}
    $('edit-rating').title=t('editRatingBase');
    const close=$('rating-dialog').querySelector('.close');close.title=t('cancel');close.setAttribute('aria-label',t('cancel'));
    $('edit-rating').onclick=()=>{
      try{
        ratingExpertId=$('expert-select').value;
        const value=store.rating(ratingExpertId),summary=store.summary(ratingExpertId);
        $('rating-expert-name').textContent=ReviewAdminWorkflow.experts.find(e=>e.id===ratingExpertId).name+' · '+ratingExpertId;
        $('rating-published-summary').textContent=pair(summary.autoRating,summary.publishedCount);
        $('rating-base-summary').textContent=pair(summary.baseRating,summary.baseVotes);
        $('rating-total-summary').textContent=pair(summary.rating,summary.votes);
        form.elements['rating-mode'].value=value.mode;$('manual-rating').value=value.rating??'';$('manual-votes').value=value.votes??'';
        $('rating-reason').value='';$('rating-error').hidden=true;mode();open('rating-dialog');
      }catch(e){feedback(error(e));}
    };
    document.querySelectorAll('[name="rating-mode"]').forEach(el=>el.onchange=mode);
    $('manual-votes').addEventListener('input',mode);
    form.onsubmit=e=>{e.preventDefault();$('rating-error').hidden=true;try{store.setRating(role,ratingExpertId,{mode:form.elements['rating-mode'].value,rating:$('manual-rating').value,votes:$('manual-votes').value},$('rating-reason').value);$('rating-dialog').close();safeRender();feedback(t('ratingSaved'));}catch(e){showError('rating-error',e);}};
  }
  addEventListener('storage',safeRender);
  safeRender();
})();
