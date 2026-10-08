(function () {
  'use strict';
  const {role,t,can,store,error}=ReviewAdminUI,$=id=>document.getElementById(id);
  document.title=t('reviewSettings');
  if(!can('settings')){$('settings-forbidden').hidden=false;$('settings-surface').remove();return;}
  $('settings-surface').hidden=false;
  let timer;
  function feedback(message){$('admin-feedback').textContent=message;$('admin-feedback').hidden=false;clearTimeout(timer);timer=setTimeout(()=>{$('admin-feedback').hidden=true;},5000);}
  function showError(id,e){$(id).textContent=error(e);$(id).hidden=false;}
  const form=$('rating-form');
  function mode(){$('manual-rating-fields').hidden=form.elements['rating-mode'].value!=='manual';}
  function summaries(){
    const summary=store.summary($('settings-expert').value);
    $('settings-summary').textContent=t('rating')+': '+(summary.rating===null?'—':summary.rating.toFixed(1))+' · '+t('votes')+': '+summary.votes+' · '+t('texts')+': '+summary.textCount;
    $('moderation-state').textContent=t(store.settings().moderationRequired?'on':'off');
  }
  function load(){const value=store.rating($('settings-expert').value);form.elements['rating-mode'].value=value.mode;$('manual-rating').value=value.rating??'';$('manual-votes').value=value.votes??'';$('moderation-required').checked=store.settings().moderationRequired;mode();summaries();}
  try{load();}catch(e){feedback(error(e));document.querySelectorAll('#settings-surface button').forEach(el=>{el.disabled=true;});}
  $('settings-expert').onchange=()=>{try{load();$('rating-error').hidden=true;$('rating-reason').value='';}catch(e){showError('rating-error',e);}};
  document.querySelectorAll('[name="rating-mode"]').forEach(el=>el.onchange=mode);
  form.onsubmit=e=>{e.preventDefault();$('rating-error').hidden=true;try{store.setRating(role,$('settings-expert').value,{mode:form.elements['rating-mode'].value,rating:$('manual-rating').value,votes:$('manual-votes').value},$('rating-reason').value);$('rating-reason').value='';summaries();feedback(t('ratingSaved'));}catch(e){showError('rating-error',e);}};
  $('settings-form').onsubmit=e=>{e.preventDefault();$('settings-error').hidden=true;try{store.setModeration(role,$('moderation-required').checked,$('settings-reason').value);$('settings-reason').value='';summaries();feedback(t('settingsSaved'));}catch(e){showError('settings-error',e);}};
  addEventListener('storage',()=>{try{summaries();}catch(e){feedback(error(e));}});
})();
