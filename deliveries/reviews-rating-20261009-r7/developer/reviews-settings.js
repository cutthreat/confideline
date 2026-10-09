(function () {
  'use strict';
  const {role,t,can,store,error}=ReviewAdminUI,$=id=>document.getElementById(id);
  document.title=t('reviewSettings');
  if(!can('settings')){$('settings-forbidden').hidden=false;$('settings-surface').remove();return;}
  $('settings-surface').hidden=false;
  let timer;
  function feedback(message){$('admin-feedback').textContent=message;$('admin-feedback').hidden=false;clearTimeout(timer);timer=setTimeout(()=>{$('admin-feedback').hidden=true;},5000);}
  function showError(id,e){$(id).textContent=error(e);$(id).hidden=false;}
  const fields={reviewsEnabled:'reviews-enabled',ratingVisible:'rating-visible',textReviewsVisible:'text-reviews-visible',clientSubmissionEnabled:'client-submission-enabled',anonymousAllowed:'anonymous-allowed',ratingOnlyAllowed:'rating-only-allowed'};
  let version,baseline,dirty=false;
  function values(){const result={};for(const[key,id]of Object.entries(fields))result[key]=$(id).checked;result.moderationMode=$('moderation-mode').value;result.maxTextLength=$('max-text-length').value;return result;}
  function dependencies(){
    const enabled=$('reviews-enabled').checked;
    for(const id of ['rating-visible','text-reviews-visible','client-submission-enabled'])$(id).disabled=!enabled;
  }
  function changed(){dirty=JSON.stringify(values())!==baseline||!!$('settings-reason').value;dependencies();$('settings-dirty').hidden=!dirty;}
  function state(){
    const policy=store.settings();version=policy.version;
    for(const[key,id]of Object.entries(fields))$(id).checked=policy[key];
    $('moderation-mode').value=policy.moderationMode;
    $('max-text-length').value=policy.maxTextLength;$('settings-reason').value='';
    baseline=JSON.stringify(values());dirty=false;$('settings-dirty').hidden=true;$('settings-stale').hidden=true;$('settings-error').hidden=true;
    $('settings-save').disabled=false;dependencies();
  }
  $('settings-reload').title=t('reloadSettings');$('settings-reload').setAttribute('aria-label',t('reloadSettings'));
  $('settings-form').addEventListener('input',changed);
  $('settings-form').addEventListener('change',changed);
  $('settings-reload').onclick=()=>{try{state();$('reviews-enabled').focus();}catch(e){showError('settings-error',e);}};
  try{state();}catch(e){showError('settings-error',e);$('settings-save').disabled=true;}
  $('settings-form').onsubmit=e=>{e.preventDefault();$('settings-error').hidden=true;try{store.setSettings(role,values(),$('settings-reason').value,version);state();feedback(t('settingsSaved'));}catch(e){showError('settings-error',e);if(e.message==='settings_conflict')$('settings-stale').hidden=false;}};
  addEventListener('storage',event=>{if(event.key!==ReviewAdminWorkflow.storageKey)return;try{if(dirty){if(store.settings().version!==version)$('settings-stale').hidden=false;}else state();}catch(e){showError('settings-error',e);}});
})();
