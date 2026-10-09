(function () {
  'use strict';
  const {role,lang,t,can,store,error}=ReviewAdminUI,$=id=>document.getElementById(id);
  if(!can('rating')){$('rating-management').remove();$('rating-dialog').remove();return;}
  $('rating-management').hidden=false;
  const form=$('rating-form');let expertId=null,version=null,focusReturn=null;
  const pair=(rating,votes)=>(rating===null?'—':rating.toFixed(1))+' · '+t('votes')+': '+votes;
  function showError(e){$('rating-error').textContent=error(e);$('rating-error').hidden=false;}
  function render(){
    const summary=store.summary($('create-expert').value);
    $('admin-average').textContent=summary.rating===null?'—':summary.rating.toFixed(1);
    $('admin-votes').textContent=summary.votes;$('admin-texts').textContent=summary.textCount;
    $('admin-rating-mode').textContent=t(summary.mode);
    $('public-preview').href='profile.html?shared=1&lang='+lang;
    $('public-preview').title=t('expertProfile');$('public-preview').setAttribute('aria-label',t('expertProfile'));
    $('public-preview').hidden=$('create-expert').value!=='EX-101';
  }
  function safeRender(){try{render();$('rating-management-error').hidden=true;}catch(e){$('rating-management-error').textContent=error(e);$('rating-management-error').hidden=false;}}
  function mode(){
    const manual=document.querySelector('[name="rating-mode"]:checked')?.value==='manual';
    $('manual-rating-fields').hidden=!manual;
    $('manual-rating').disabled=!manual||String($('manual-votes').value).trim()==='0';
    $('manual-votes').disabled=!manual;
  }
  function load(){
    const value=store.rating(expertId),summary=store.summary(expertId);version=value.version;
    $('rating-expert-name').textContent=ReviewAdminWorkflow.experts.find(e=>e.id===expertId).name+' · '+expertId;
    $('rating-published-summary').textContent=pair(summary.autoRating,summary.publishedCount);
    $('rating-base-summary').textContent=pair(summary.baseRating,summary.baseVotes);
    $('rating-total-summary').textContent=pair(summary.rating,summary.votes);
    document.querySelectorAll('[name="rating-mode"]').forEach(el=>{el.checked=el.value===value.mode;});
    $('manual-rating').value=value.rating??'';$('manual-votes').value=value.votes??'';
    $('rating-reason').value='';$('rating-error').hidden=true;$('rating-reload').hidden=true;mode();
  }
  $('edit-rating').onclick=()=>{try{expertId=$('create-expert').value;load();focusReturn=document.activeElement;$('rating-dialog').showModal();}catch(e){$('rating-management-error').textContent=error(e);$('rating-management-error').hidden=false;}};
  document.querySelectorAll('[data-close="rating-dialog"]').forEach(el=>{el.title=t('cancel');el.setAttribute('aria-label',t('cancel'));el.onclick=()=>$('rating-dialog').close();});
  $('rating-dialog').addEventListener('close',()=>{if(focusReturn?.isConnected)focusReturn.focus({preventScroll:true});});
  $('rating-reload').title=t('reloadRating');$('rating-reload').setAttribute('aria-label',t('reloadRating'));
  $('rating-reload').onclick=()=>{try{load();}catch(e){showError(e);}};
  document.querySelectorAll('[name="rating-mode"]').forEach(el=>el.onchange=mode);
  $('manual-votes').addEventListener('input',mode);
  form.onsubmit=e=>{e.preventDefault();try{
    store.setRating(role,expertId,{mode:document.querySelector('[name="rating-mode"]:checked').value,rating:$('manual-rating').value,votes:$('manual-votes').value},$('rating-reason').value,version);
    $('rating-dialog').close();safeRender();$('rating-management-feedback').textContent=t('ratingSaved');$('rating-management-feedback').hidden=false;
  }catch(e){showError(e);if(e.message==='rating_conflict')$('rating-reload').hidden=false;}};
  $('create-expert').addEventListener('change',()=>{$('rating-management-feedback').hidden=true;safeRender();});
  $('create-form').addEventListener('submit',safeRender);
  addEventListener('storage',()=>{safeRender();if(!$('rating-dialog').open)return;try{if(store.rating(expertId).version!==version){showError(new Error('rating_conflict'));$('rating-reload').hidden=false;}}catch(e){showError(e);}});
  safeRender();
})();
