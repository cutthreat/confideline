(function () {
  'use strict';
  const {role, lang, can, store, error} = ReviewAdminUI;
  const $ = id => document.getElementById(id);
  const section = $('expert-rating-settings');
  if (!can('settings') || !can('rating') || !section) {
    section?.remove();
    ['rating-expert-dialog','rating-policy-dialog','rating-discard-dialog'].forEach(id => $(id)?.remove());
    return;
  }
  const en = lang === 'en';
  const labels = en ? {
    title:'Rating calculation',policy:'Global mode',individual:'Individual settings',allAuto:'Everyone: published ratings only',allManual:'Everyone: include manual base',
    applyPolicy:'Save mode',reload:'Reload saved data',search:'Expert: name or ID',registry:'Expert rating register',expert:'Expert',published:'Published',base:'Manual base',withBase:'With base',mode:'Mode',total:'Effective',actions:'Actions',
    publishedFull:'Published ratings only',baseFull:'Saved manual base, whether included or not',withBaseFull:'Published ratings plus the saved manual base',withBaseMode:'Include manual base',history:'Calculation change history',emptyHistory:'No changes yet',
    policyConfirm:'Change calculation for all experts?',reason:'Reason for change',cancel:'Cancel',confirm:'Confirm',expertMode:'Calculation for this expert',baseRating:'Base rating',baseVotes:'Base votes',save:'Save',
    unsaved:'Unsaved changes',discardDescription:'Discard unsaved changes for this expert?',keep:'Keep editing',discard:'Discard changes',
    votes:'votes',noRatings:'No ratings',noBase:'Not set',noResults:'No experts found',edit:'Edit rating calculation',locked:'Locked by global mode',
    auto:'Published only',manual:'With manual base',policySaved:'Global mode saved',expertSaved:'Expert calculation saved',
    individualState:'Each expert uses their saved individual mode.',globalState:'Individual editing is locked. Saved modes and bases are preserved.',
    individualImpact:'Saved individual modes will apply again. Manual bases will not be changed.',autoImpact:'Every expert will use published ratings only. Individual modes and manual bases will be preserved.',manualImpact:'Every expert will use their own manual base, if it has votes. No base means published ratings only. Individual modes and bases will be preserved.',
    baseInactive:'The base is saved but not included in this expert’s current mode.',baseActive:'The base is added to published ratings; it does not create reviews.',
    policy_conflict:'The global mode has changed. Your input is preserved. Reload the saved data before saving.',rating_locked:'Individual editing is locked by the global mode. Your input is preserved.',rating_conflict:'This expert was changed elsewhere. Your input is preserved. Reload the saved data before saving.'
  } : {
    title:'Расчёт рейтинга',policy:'Общий режим',individual:'Индивидуально',allAuto:'Для всех: только опубликованные оценки',allManual:'Для всех: с учётом ручной базы',
    applyPolicy:'Сохранить режим',reload:'Загрузить сохранённые данные',search:'Эксперт: имя или ID',registry:'Реестр рейтингов экспертов',expert:'Эксперт',published:'Оценки',base:'Ручная база',withBase:'С базой',mode:'Режим',total:'Итог',actions:'Действия',
    publishedFull:'Только опубликованные оценки',baseFull:'Сохранённая ручная база, независимо от её включения',withBaseFull:'Опубликованные оценки с учётом сохранённой ручной базы',withBaseMode:'С учётом ручной базы',history:'История изменений расчёта',emptyHistory:'Изменений пока нет',
    policyConfirm:'Изменить расчёт для всех экспертов?',reason:'Причина изменения',cancel:'Отмена',confirm:'Подтвердить',expertMode:'Расчёт для эксперта',baseRating:'Рейтинг базы',baseVotes:'Голосов базы',save:'Сохранить',
    unsaved:'Есть несохранённые изменения',discardDescription:'Не сохранять изменения выбранного эксперта?',keep:'Продолжить редактирование',discard:'Не сохранять',
    votes:'голосов',noRatings:'Нет оценок',noBase:'Не задана',noResults:'Эксперты не найдены',edit:'Изменить расчёт рейтинга',locked:'Заблокировано общим режимом',
    auto:'По оценкам',manual:'С базой',policySaved:'Общий режим сохранён',expertSaved:'Расчёт эксперта сохранён',
    individualState:'Для каждого эксперта действует его сохранённый режим.',globalState:'Индивидуальное редактирование заблокировано. Персональные режимы и базы сохранены.',
    individualImpact:'Снова начнут действовать сохранённые индивидуальные режимы. Ручные базы не изменятся.',autoImpact:'У всех экспертов будут учитываться только опубликованные оценки. Индивидуальные режимы и ручные базы сохранятся.',manualImpact:'Каждому эксперту добавится его собственная база, если в ней есть голоса. Без базы — только опубликованные оценки. Индивидуальные режимы и базы сохранятся.',
    baseInactive:'База сохраняется, но не участвует в текущем режиме эксперта.',baseActive:'База добавляется к опубликованным оценкам и не создаёт отзывы.',
    policy_conflict:'Общий режим изменён в другой вкладке. Ввод сохранён. Перед сохранением загрузите актуальные данные.',rating_locked:'Общий режим блокирует индивидуальное редактирование. Ввод сохранён.',rating_conflict:'Расчёт эксперта изменён в другой вкладке. Ввод сохранён. Перед сохранением загрузите актуальные данные.'
  };
  section.hidden = false;
  document.querySelectorAll('#confideline-reviews [data-rating-label]').forEach(el => { el.textContent = labels[el.dataset.ratingLabel]; });
  document.querySelectorAll('#confideline-reviews [data-rating-title]').forEach(el => { el.title = labels[el.dataset.ratingTitle]; if (el.tagName === 'BUTTON') el.ariaLabel = el.title; });
  $('rating-search').placeholder = labels.search;
  const expertDialog=$('rating-expert-dialog'), policyDialog=$('rating-policy-dialog'), discardDialog=$('rating-discard-dialog');
  const picker=$('rating-policy'), form=$('rating-form');
  let policy, policyVersion, policyTarget, expertId, expertVersion, expertPolicyVersion, baseline='', expertStale=false, policyStale=false;
  let expertFocus=null, discardAction=null, ascending=true;
  const modeName = mode => labels[mode === 'individual' ? 'individual' : mode === 'auto' ? 'allAuto' : 'allManual'];
  const number = value => value === null ? '—' : value.toLocaleString(en?'en-GB':'ru-RU',{minimumFractionDigits:1,maximumFractionDigits:1});
  const voteCount = votes => votes.toLocaleString(en?'en-GB':'ru-RU')+' '+(en?(votes===1?'vote':'votes'):{one:'голос',few:'голоса',many:'голосов',other:'голоса'}[new Intl.PluralRules('ru').select(votes)]);
  const pair = (rating,votes) => number(rating)+' · '+voteCount(votes);
  const values = () => ({mode:form.querySelector('[name="rating-mode"]:checked').value,rating:$('manual-rating').value,votes:$('manual-votes').value});
  const draft = () => JSON.stringify({...values(),reason:$('rating-reason').value});
  const dirty = () => expertDialog.open && draft() !== baseline;
  const message = e => labels[e.message] || error(e);
  const showError = (id,e) => { $(id).textContent=message(e); $(id).hidden=false; };
  const feedback = text => { $('rating-feedback').textContent=text; $('rating-feedback').hidden=false; };
  const nameOf = id => ReviewAdminWorkflow.experts.find(e=>e.id===id)?.name || id;

  function dialogOpen(dialog, target) {
    dialog.showModal(); dialog.scrollTop=0;
    dialog.querySelector('.modal-body')?.scrollTo(0,0);
    target.focus({preventScroll:true});
  }
  [expertDialog,policyDialog,discardDialog].forEach(dialog => {
    dialog.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const nodes=[...dialog.querySelectorAll('button,input,textarea,select,[tabindex="0"]')].filter(el=>!el.disabled && el.getClientRects().length);
      const first=nodes[0], last=nodes.at(-1);
      if (e.shiftKey && (document.activeElement===first || !nodes.includes(document.activeElement))) {e.preventDefault(); last?.focus();}
      else if (!e.shiftKey && (document.activeElement===last || !nodes.includes(document.activeElement))) {e.preventDefault(); first?.focus();}
    });
  });
  function requestDiscard(action) {discardAction=action;dialogOpen(discardDialog,$('rating-keep'));}
  $('rating-keep').onclick=()=>{discardAction=null;discardDialog.close();};
  $('rating-discard').onclick=()=>{const action=discardAction;discardAction=null;discardDialog.close();action?.();};
  discardDialog.addEventListener('cancel',()=>{discardAction=null;});
  discardDialog.addEventListener('close',()=>{if(expertDialog.open) $('rating-expert-cancel').focus({preventScroll:true});});

  function renderHistory() {
    if (!can('audit')) return;
    $('rating-history').hidden=false;
    const events=store.audit(role).filter(e=>['rating','rating_policy'].includes(e.action));
    $('rating-history-list').replaceChildren();$('rating-history-empty').hidden=!!events.length;
    for (const event of events) {
      const li=document.createElement('li'),change=document.createElement('p'),reason=document.createElement('p'),meta=document.createElement('p');
      if(event.action==='rating_policy') change.textContent=labels.policy+': '+modeName(event.before.mode)+' → '+modeName(event.after.mode);
      else {const describe=v=>labels[v.mode]+'; '+labels.base+': '+pair(v.rating,v.votes ?? 0);change.textContent=nameOf(event.id)+' · '+event.id+': '+describe(event.before)+' → '+describe(event.after);}
      reason.textContent=event.reason;meta.className='text-muted';meta.textContent=event.actorName+' · '+new Date(event.at).toLocaleString(en?'en-GB':'ru-RU');
      li.append(change,reason,meta);$('rating-history-list').append(li);
    }
  }
  function renderRows() {
    const rows=$('rating-rows'),query=$('rating-search').value.trim().toLocaleLowerCase(),all=ReviewAdminWorkflow.experts;
    const experts=all.filter(e=>(e.name+' '+e.id).toLocaleLowerCase().includes(query)).sort((a,b)=>(ascending?1:-1)*a.name.localeCompare(b.name,en?'en':'ru'));
    rows.replaceChildren();$('rating-count').textContent=en?experts.length+' of '+all.length+' experts':'Экспертов: '+experts.length+' из '+all.length;
    for (const expert of experts) {
      const value=store.ratingComparison(expert.id),tr=document.createElement('tr');
      const who=document.createElement('th');who.scope='row';who.title=expert.name+' · '+expert.id;
      const name=document.createElement('span'),id=document.createElement('small');name.textContent=expert.name;id.textContent=expert.id;who.append(name,id);tr.append(who);
      for(const [rating,votes,empty] of [[value.published.rating,value.published.votes,labels.noRatings],[value.base.rating,value.base.votes,labels.noBase],[value.withBase.rating,value.withBase.votes,labels.noRatings]]) {
        const td=document.createElement('td'),strong=document.createElement('span'),small=document.createElement('small');td.className='rating-number';
        strong.textContent=number(rating);small.textContent=votes?voteCount(votes):empty;td.append(strong,small);tr.append(td);
      }
      const mode=document.createElement('td'),badge=document.createElement('span');badge.className='review-rating-badge';badge.textContent=labels[value.effective.mode];mode.append(badge);
      if(policy.mode!=='individual'){const saved=document.createElement('small');saved.textContent=(en?'Saved: ':'Личный: ')+labels[value.individual.mode];mode.append(saved);}
      tr.append(mode);
      const total=document.createElement('td');total.className='rating-number rating-effective';
      const strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=number(value.effective.rating);small.textContent=value.effective.votes?voteCount(value.effective.votes):labels.noRatings;total.append(strong,small);tr.append(total);
      const action=document.createElement('td'),button=document.createElement('button');button.type='button';button.className='btn btn-default review-rating-icon';button.dataset.expertId=expert.id;
      button.disabled=policy.mode!=='individual';button.title=(button.disabled?labels.locked:labels.edit)+' · '+expert.name;button.ariaLabel=button.title;
      const icon=document.createElement('i');icon.className='fa '+(button.disabled?'fa-lock':'fa-pencil');icon.ariaHidden='true';button.append(icon);
      button.onclick=()=>openExpert(expert.id,button);action.append(button);tr.append(action);rows.append(tr);
    }
    if(!experts.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=7;td.className='review-rating-empty';td.textContent=labels.noResults;tr.append(td);rows.append(tr);}
  }
  function loadPolicy() {
    policy=store.ratingPolicy();policyVersion=policy.version;picker.value=policy.mode;policyStale=false;$('rating-policy-apply').disabled=true;
    $('rating-policy-state').textContent=policy.mode==='individual'?labels.individualState:labels.globalState;
  }
  function refresh(){renderRows();renderHistory();}
  picker.onchange=()=>{$('rating-policy-apply').disabled=policyStale || picker.value===policy.mode;};
  $('rating-search').oninput=renderRows;
  $('rating-sort').onclick=()=>{ascending=!ascending;$('rating-sort').parentElement.setAttribute('aria-sort',ascending?'ascending':'descending');$('rating-sort').querySelector('i').className='fa '+(ascending?'fa-sort-alpha-asc':'fa-sort-alpha-desc');renderRows();};
  $('rating-policy-reload').onclick=()=>{loadPolicy();refresh();$('rating-error').hidden=true;};
  $('rating-policy-form').onsubmit=e=>{
    e.preventDefault();if(picker.value===policy.mode || policyStale)return;
    policyTarget=picker.value;$('rating-policy-transition').textContent=modeName(policy.mode)+' → '+modeName(policyTarget);
    $('rating-policy-impact').textContent=labels[policyTarget==='individual'?'individualImpact':policyTarget==='auto'?'autoImpact':'manualImpact'];
    $('rating-policy-error').hidden=true;$('rating-policy-confirm').disabled=false;dialogOpen(policyDialog,$('rating-policy-cancel'));
  };
  $('rating-policy-cancel').onclick=()=>policyDialog.close();
  policyDialog.addEventListener('close',()=>{$('rating-policy-apply').focus({preventScroll:true});});
  $('rating-policy-confirm-form').onsubmit=e=>{
    e.preventDefault();$('rating-policy-error').hidden=true;
    try {
      if(policyStale)throw new Error('policy_conflict');
      store.setRatingPolicy(role,policyTarget,$('rating-policy-reason').value,policyVersion);
      $('rating-policy-reason').value='';loadPolicy();refresh();policyDialog.close();feedback(labels.policySaved+' · '+modeName(policy.mode));
    }catch(e){showError('rating-policy-error',e);}
  };
  function preview() {
    const value=values();$('manual-rating').disabled=value.votes.trim()==='0';$('manual-rating').required=!$('manual-rating').disabled;
    $('rating-base-state').textContent=labels[value.mode==='auto'?'baseInactive':'baseActive'];
    try {
      const comparison=store.ratingComparison(expertId),base=ReviewRatingModel.validateRating({...value,mode:'manual'});
      const sum=comparison.published.publishedSum+base.rating*base.votes,votes=comparison.published.votes+base.votes;
      $('rating-total-summary').textContent=pair(votes?sum/votes:null,votes);
    }catch(_){$('rating-total-summary').textContent='—';}
  }
  function loadExpert() {
    const value=store.ratingComparison(expertId);expertVersion=value.individual.version;expertPolicyVersion=value.policy.version;expertStale=false;
    form.querySelectorAll('[name="rating-mode"]').forEach(el=>{el.checked=el.value===value.individual.mode;});
    $('manual-rating').value=value.base.rating ?? '';$('manual-votes').value=value.base.votes;$('rating-reason').value='';
    $('rating-published-summary').textContent=pair(value.published.rating,value.published.votes);$('rating-expert-title').textContent=nameOf(expertId);$('rating-expert-context').textContent=expertId;
    $('rating-expert-error').hidden=true;$('rating-save').disabled=value.policy.mode!=='individual';
    lockExpert(value.policy.mode!=='individual');preview();baseline=draft();
  }
  function lockExpert(locked) {
    form.querySelectorAll('[name="rating-mode"]').forEach(el=>{el.disabled=locked;});
    ['manual-rating','manual-votes','rating-reason'].forEach(id=>{$(id).readOnly=locked;});
  }
  function openExpert(id,trigger) {
    try{if(store.ratingPolicy().mode!=='individual')throw new Error('rating_locked');expertId=id;expertFocus=trigger;loadExpert();dialogOpen(expertDialog,$('rating-expert-title'));}
    catch(e){showError('rating-error',e);}
  }
  const closeExpert=()=>expertDialog.close();
  $('rating-expert-cancel').onclick=()=>dirty()?requestDiscard(closeExpert):closeExpert();
  expertDialog.addEventListener('cancel',e=>{if(dirty()){e.preventDefault();requestDiscard(closeExpert);}});
  expertDialog.addEventListener('close',()=>{
    const target=[...$('rating-rows').querySelectorAll('button')].find(b=>b.dataset.expertId===expertId);
    (target&&!target.disabled?target:expertFocus?.isConnected&&!expertFocus.disabled?expertFocus:$('rating-search')).focus({preventScroll:true});
  });
  $('rating-reload').onclick=()=>{const reload=()=>{loadPolicy();refresh();loadExpert();form.querySelector('[name="rating-mode"]').focus();};dirty()?requestDiscard(reload):reload();};
  form.addEventListener('input',preview);form.addEventListener('change',preview);
  form.onsubmit=e=>{
    e.preventDefault();$('rating-expert-error').hidden=true;
    try{
      if(expertStale)throw new Error('rating_conflict');
      store.setRating(role,expertId,values(),$('rating-reason').value,expertVersion,expertPolicyVersion);
      const saved=nameOf(expertId);refresh();expertDialog.close();feedback(labels.expertSaved+' · '+saved);
    }catch(e){showError('rating-expert-error',e);}
  };
  addEventListener('storage',()=>{
    try{
      const current=store.ratingPolicy();
      if(current.version!==policyVersion){
        if(policyDialog.open || picker.value!==policy.mode){policyStale=true;$('rating-policy-apply').disabled=true;showError(policyDialog.open?'rating-policy-error':'rating-error',new Error('policy_conflict'));}
        else loadPolicy();
      }
      if(expertDialog.open){
        const value=store.ratingComparison(expertId);
        lockExpert(value.policy.mode!=='individual');
        if(value.policy.version!==expertPolicyVersion || value.individual.version!==expertVersion){
          if(dirty()){expertStale=true;$('rating-save').disabled=true;showError('rating-expert-error',new Error(value.policy.version!==expertPolicyVersion?'policy_conflict':'rating_conflict'));}
          else loadExpert();
        }
      }
      // The register reflects persisted policy, never an unconfirmed selection.
      policy=current;refresh();
    }catch(e){showError('rating-error',e);}
  });
  addEventListener('beforeunload',e=>{if(dirty() || picker.value!==policy.mode || policyDialog.open&&$('rating-policy-reason').value){e.preventDefault();e.returnValue='';}});
  try{loadPolicy();refresh();}catch(e){showError('rating-error',e);$('rating-policy-apply').disabled=true;}
})();
