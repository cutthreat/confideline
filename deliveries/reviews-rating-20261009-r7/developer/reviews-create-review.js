(function () {
  'use strict';
  const {role,t,url,can,store,error} = ReviewAdminUI,$ = id => document.getElementById(id);
  document.title = t('write');
  if (!can('create')) { $('create-forbidden').hidden = false; $('create-surface').remove(); $('create-success').remove(); return; }
  $('create-surface').hidden = false;
  $('create-cancel').href = $('create-queue').href = url('reviews.html');
  let operationId = crypto.randomUUID(),busy = false;
  function policy() { try {
    const p=store.settings();
    $('create-submit-label').textContent=t(p.moderationRequired?'submit':'publish');
    $('admin-review-text').maxLength=p.maxTextLength;$('admin-review-text').required=!p.ratingOnlyAllowed;
    document.querySelector('label[for="admin-review-text"]').textContent=t(p.ratingOnlyAllowed?'text':'textRequiredLabel');
    $('create-text-count').textContent=$('admin-review-text').value.length+' / '+p.maxTextLength;
    $('admin-review-anonymous').closest('label').hidden=!p.anonymousAllowed&&!$('admin-review-anonymous').checked;
  } catch (e) { $('create-error').textContent = error(e); $('create-error').hidden = false; $('create-submit').disabled = true; } }
  policy();
  addEventListener('storage',policy);
  $('admin-review-text').oninput = policy;
  $('admin-review-anonymous').onchange=policy;
  $('create-form').onsubmit = e => {
    e.preventDefault(); if (busy) return;
    $('create-error').hidden = true;
    busy = true; $('create-submit').disabled = true;
    try {
      const review = store.createReview(role,{operationId,expertId:$('create-expert').value,authorProfileId:$('review-author').value,stars:document.querySelector('[name="admin-stars"]:checked')?.value || '',text:$('admin-review-text').value,anonymous:$('admin-review-anonymous').checked,reason:$('create-reason').value});
      $('create-surface').hidden = true; $('create-success').hidden = false;
      $('create-result').textContent = review.id + ' · ' + t(review.status === 'pending' ? (review.text ? 'sent' : 'ratingSent') : (review.text ? 'posted' : 'ratingPosted'));
      $('create-queue').focus();
    } catch (e) { busy = false; $('create-submit').disabled = false; policy(); $('create-error').textContent = error(e); $('create-error').hidden = false; }
  };
  $('create-again').onclick = () => { operationId = crypto.randomUUID(); busy = false; $('create-form').reset(); $('create-submit').disabled = false; $('create-text-count').textContent = '0 / 1000'; $('create-success').hidden = true; $('create-surface').hidden = false; policy(); $('review-author').focus(); };
})();
