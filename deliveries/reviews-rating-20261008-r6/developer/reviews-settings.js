(function () {
  'use strict';
  const {role,t,can,store,error}=ReviewAdminUI,$=id=>document.getElementById(id);
  document.title=t('reviewSettings');
  if(!can('settings')){$('settings-forbidden').hidden=false;$('settings-surface').remove();return;}
  $('settings-surface').hidden=false;
  let timer;
  function feedback(message){$('admin-feedback').textContent=message;$('admin-feedback').hidden=false;clearTimeout(timer);timer=setTimeout(()=>{$('admin-feedback').hidden=true;},5000);}
  function showError(id,e){$(id).textContent=error(e);$(id).hidden=false;}
  function state(){const enabled=store.settings().moderationRequired;$('moderation-required').checked=enabled;$('moderation-state').textContent=t(enabled?'on':'off');}
  try{state();}catch(e){showError('settings-error',e);$('settings-form').querySelector('button[type="submit"]').disabled=true;}
  $('settings-form').onsubmit=e=>{e.preventDefault();$('settings-error').hidden=true;try{store.setModeration(role,$('moderation-required').checked,$('settings-reason').value);$('settings-reason').value='';state();feedback(t('settingsSaved'));}catch(e){showError('settings-error',e);}};
  addEventListener('storage',()=>{try{state();}catch(e){showError('settings-error',e);}});
})();
