(function () {
  'use strict';
  const {role, lang, can, store, error, t} = ReviewAdminUI;
  const $ = id => document.getElementById(id);
  const section = $('expert-rating-settings');
  if (!can('settings') || !can('rating') || !section) {
    section?.remove(); $('rating-discard-dialog').remove(); return;
  }
  const en = lang === 'en';
  const picker = $('rating-expert'), form = $('rating-form'), dialog = $('rating-discard-dialog');
  const radios = [...form.querySelectorAll('[name="rating-mode"]')];
  let expertId = picker.value, version, baseline, pending = null, dirty = false, stale = false, focusReturn = null;
  section.hidden = false;
  const pair = (rating, votes) => (rating === null ? '\u2014' : rating.toFixed(1)) + ' \u00b7 ' + t('votes') + ': ' + votes;
  const values = () => ({mode: radios.find(el => el.checked).value, rating: $('manual-rating').value, votes: $('manual-votes').value});
  const showError = e => { $('rating-error').textContent = error(e); $('rating-error').hidden = false; };
  function dependencies() {
    const manual = values().mode === 'manual';
    $('manual-rating-fields').hidden = !manual;
    $('manual-rating').disabled = !manual || $('manual-votes').value.trim() === '0';
    $('manual-votes').disabled = !manual;
  }
  function changed() {
    dirty = JSON.stringify(values()) !== baseline || !!$('rating-reason').value;
    $('rating-dirty').hidden = !dirty;
    dependencies();
  }
  function summary() {
    const value = store.summary(expertId);
    $('rating-published-summary').textContent = pair(value.autoRating, value.publishedCount);
    $('rating-base-summary').textContent = pair(value.baseRating, value.baseVotes);
    $('rating-total-summary').textContent = pair(value.rating, value.votes);
    $('rating-save-context').textContent = picker.options[picker.selectedIndex].textContent;
    if (can('audit')) {
      $('rating-history').hidden = false;
      const events = store.audit(role).filter(event => event.action === 'rating' && event.id === expertId);
      $('rating-history-list').replaceChildren();
      $('rating-history-empty').hidden = !!events.length;
      for (const event of events) {
        const item = document.createElement('li');
        const meta = document.createElement('p'), reason = document.createElement('p'), change = document.createElement('p');
        meta.className = 'text-muted';
        meta.textContent = event.actorName + ' \u00b7 ' + new Date(event.at).toLocaleString(en ? 'en-GB' : 'ru-RU');
        const describe = value => t(value.mode) + ' \u00b7 ' + pair(value.rating, value.votes ?? 0);
        change.textContent = describe(event.before) + ' \u2192 ' + describe(event.after);
        reason.textContent = event.reason;
        item.append(change, reason, meta); $('rating-history-list').append(item);
      }
    }
  }
  function load() {
    const value = store.rating(expertId);
    version = value.version;
    radios.forEach(el => { el.checked = el.value === value.mode; });
    $('manual-rating').value = value.rating ?? '';
    $('manual-votes').value = value.votes ?? '';
    $('rating-reason').value = '';
    baseline = JSON.stringify(values());
    dirty = stale = false;
    $('rating-error').hidden = $('rating-dirty').hidden = true;
    $('rating-save').disabled = false;
    dependencies(); summary();
  }
  function confirmDiscard(action) {
    pending = action;
    focusReturn = document.activeElement;
    const name = ReviewAdminWorkflow.experts.find(e => e.id === expertId).name;
    $('rating-discard-description').textContent = en
      ? 'Discard unsaved rating changes for ' + name + '?'
      : '\u041d\u0435 \u0441\u043e\u0445\u0440\u0430\u043d\u044f\u0442\u044c \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f \u0440\u0435\u0439\u0442\u0438\u043d\u0433\u0430 \u044d\u043a\u0441\u043f\u0435\u0440\u0442\u0430 ' + name + '?';
    dialog.showModal();
    $('rating-keep').focus();
  }
  picker.addEventListener('change', () => {
    const next = picker.value;
    picker.value = expertId;
    const select = () => {
      try { expertId = next; picker.value = next; load(); $('rating-feedback').hidden = true; }
      catch (e) { showError(e); $('rating-save').disabled = true; }
    };
    if (dirty) confirmDiscard(select); else select();
  });
  $('rating-keep').onclick = () => { pending = null; dialog.close(); };
  $('rating-discard').onclick = () => { const action = pending; pending = null; dialog.close(); action?.(); };
  dialog.addEventListener('cancel', () => { pending = null; });
  dialog.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const first = $('rating-keep'), last = $('rating-discard');
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  dialog.addEventListener('close', () => (focusReturn?.isConnected ? focusReturn : picker).focus({preventScroll: true}));
  form.addEventListener('input', changed);
  form.addEventListener('change', changed);
  $('rating-reload').title = $('rating-reload').ariaLabel = t('reloadRating');
  $('rating-save').ariaLabel = en ? 'Save expert rating settings' : '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0440\u0430\u0441\u0447\u0451\u0442 \u0440\u0435\u0439\u0442\u0438\u043d\u0433\u0430 \u044d\u043a\u0441\u043f\u0435\u0440\u0442\u0430';
  $('rating-reload').onclick = () => {
    const reload = () => { try { load(); radios[0].focus(); } catch (e) { showError(e); } };
    if (dirty) confirmDiscard(reload); else reload();
  };
  form.onsubmit = e => {
    e.preventDefault(); $('rating-error').hidden = true;
    try {
      if (stale) throw new Error('rating_conflict');
      const savedExpert = picker.options[picker.selectedIndex].textContent;
      store.setRating(role, expertId, values(), $('rating-reason').value, version);
      load();
      $('rating-feedback').textContent = t('ratingSaved') + ' \u00b7 ' + savedExpert;
      $('rating-feedback').hidden = false;
    } catch (e) { showError(e); }
  };
  addEventListener('storage', () => {
    try {
      if (store.rating(expertId).version !== version) {
        if (dirty) { stale = true; showError(new Error('rating_conflict')); }
        else load();
      } else summary();
    } catch (e) { showError(e); }
  });
  addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  try { load(); } catch (e) { showError(e); $('rating-save').disabled = true; }
})();
