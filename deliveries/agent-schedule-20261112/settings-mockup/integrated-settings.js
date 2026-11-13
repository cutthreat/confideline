(() => {
  const form = document.querySelector('#conf-integrated-form');
  if (!form) return;
  const page = form.dataset.page;
  const scenario = new URLSearchParams(location.search).get('scenario') || '';
  const suffix = /^[a-z0-9-]{1,40}$/.test(scenario) ? '-' + scenario : '';
  const storageKey = 'confideline-integrated-settings-v2-' + page + suffix;
  const status = document.querySelector('#conf-save-status');
  const actions = [
    ['chat','Открыть чат'], ['wait','Уведомить о доступности'],
    ['booking','Открыть календарь записи'], ['link','Перейти по ссылке'],
    ['none','Не показывать кнопку']
  ];
  const rows = [
    {id:'online', title:'Онлайн', caption:'Написать в чат', action:'chat'},
    {id:'busy', title:'Занят', caption:'Уведомить, когда освободится', action:'wait'},
    {id:'offline', title:'Не в сети', caption:'Забронировать время', action:'booking'}
  ];
  function make(tag, text, attrs = {}) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    Object.entries(attrs).forEach(([k,v]) => node.setAttribute(k,v));
    return node;
  }
  function selectField(label, name, choices, value) {
    const container = make('div','',{class:'form-group'});
    const text = make('label',label,{for:name});
    const input = make('select','',{class:'form-control',id:name,name});
    choices.forEach(([v,t]) => input.add(new Option(t,v,false,v===value)));
    container.append(text,input);
    return {container,input};
  }
  if (page === 'catalog') {
    const container = document.querySelector('#conf-button-fields');
    rows.forEach(row => {
      const fs = make('fieldset','',{class:'conf-buttons-row'});
      fs.append(make('legend',row.title));
      const grid = make('div','',{class:'conf-grid'});
      const caption = make('div','',{class:'form-group'});
      const captionId = `caption-${row.id}`;
      const label = make('label','Текст кнопки (русский)',{for:captionId});
      const captionInput = make('input','',{class:'form-control',id:captionId,name:captionId,type:'text',maxlength:'80'});
      captionInput.value = row.caption;
      caption.append(label,captionInput);
      const action = selectField('Действие',`action-${row.id}`,actions,row.action);
      grid.append(caption,action.container);
      const linkGroup = make('div','',{class:'form-group',hidden:''});
      const linkId = `link-${row.id}`;
      const link = make('input','',{class:'form-control',id:linkId,name:linkId,type:'text',placeholder:'https:// или /страница'});
      linkGroup.append(make('label','Адрес ссылки',{for:linkId}),link);
      grid.append(linkGroup);
      const updateAction = () => {
        const hidden = action.input.value === 'none';
        caption.hidden = hidden; captionInput.required = !hidden;
        linkGroup.hidden = action.input.value !== 'link';
        link.required = !linkGroup.hidden;
      };
      action.input.addEventListener('change',updateAction);
      fs.append(grid); container.append(fs); updateAction();
    });
  }
  const controls = () => Array.from(form.querySelectorAll('input[name],select[name],textarea[name]'));
  function capture() {
    return Object.fromEntries(controls().map(el => [el.name, el.type === 'checkbox' ? el.checked : el.value]));
  }
  function apply(values) {
    controls().forEach(el => { if (!(el.name in values)) return; if (el.type === 'checkbox') el.checked = !!values[el.name]; else el.value = values[el.name]; });
    form.querySelectorAll('select').forEach(el => el.dispatchEvent(new Event('change')));
    displayPayment();
  }
  function displayPayment() {
    const selected = form.querySelector('[name="paymentMode"]');
    if (!selected) return;
    const hasAdvance = selected.value === 'confirm';
    document.getElementById('advance-field').hidden = !hasAdvance;
    ['booking-payment-deadline','booking-full-refund','booking-late-policy','booking-late-fee','booking-grace','booking-no-show','booking-review-deadline','booking-payment-review'].forEach(id => {
      const field=document.getElementById(id); if(field)field.closest('.form-group').hidden=!hasAdvance;
    });
    const late=document.getElementById('booking-late-policy'),fee=document.getElementById('booking-late-fee');
    if(fee && late)fee.closest('.form-group').hidden=!hasAdvance || late.value!=='percent';
    const payout=form.querySelector('[name="payoutSchedule"]');
    if(payout){
      const week=document.getElementById('payout-weekday-field'),month=document.getElementById('payout-monthday-field');
      week.hidden=payout.value!=='weekly';month.hidden=payout.value!=='monthly';
      week.querySelector('select').required=!week.hidden;month.querySelector('input').required=!month.hidden;
    }
  }
  function displaySavedCatalog() {
    if (page !== 'catalog') return;
    ['catalog-filter-version','catalog-cards-version'].forEach(id => {
      const el = document.getElementById(id), text = el.closest('.form-group').querySelector('.help-block span');
      if (text) text.textContent = el.selectedOptions[0].textContent;
    });
  }
  let saved = capture();
  try { const existing = JSON.parse(localStorage.getItem(storageKey)); if (existing) { apply(existing); saved = capture(); } } catch (_) {}
  const save = form.querySelector('button[type="submit"],.box-footer button');
  const cancel = Array.from(form.querySelectorAll('.box-footer button')).find(b => b.textContent.trim() === 'Отменить изменения');
  function displayPaid() {
    const paid = form.querySelector('[name="paidEnabled"]');
    if (!paid) return;
    const hasObligations = new URLSearchParams(location.search).get('obligations') !== '0';
    document.getElementById('conf-paid-status').textContent = saved.paidEnabled ? 'Включён' : hasObligations ? 'Завершение обязательств' : 'Выключен';
    document.getElementById('conf-obligations').hidden = !!saved.paidEnabled || !hasObligations;
  }
  const updateDirty = () => { if (page === 'catalog') save.disabled = JSON.stringify(capture()) === JSON.stringify(saved); status.textContent = ''; displayPayment(); };
  form.addEventListener('input',updateDirty); form.addEventListener('change',updateDirty);
  if (cancel) cancel.addEventListener('click',() => { apply(saved); updateDirty(); });
  form.addEventListener('submit',event => {
    event.preventDefault();
    for (const el of form.querySelectorAll('input[name^="link-"]')) {
      if (el.closest('[hidden]')) continue;
      const value = el.value.trim();
      let valid = /^\/(?![\/\\])\S*$/.test(value);
      if (!valid) { try { valid = ['http:','https:'].includes(new URL(value).protocol); } catch (_) {} }
      if (!valid) { el.setCustomValidity('Укажите корректный адрес ссылки.'); el.reportValidity(); el.setCustomValidity(''); return; }
    }
    const values = capture();
    try {
      localStorage.setItem(storageKey,JSON.stringify(values)); saved = values;
      if (page === 'catalog') {
        save.disabled = true;
        displaySavedCatalog();
      }
      displayPaid(); status.textContent = 'Настройки сохранены';
    }
    catch (_) { status.textContent = 'Не удалось сохранить настройки.'; }
  });
  document.querySelectorAll('.main-sidebar a[aria-disabled="true"]').forEach(a => a.addEventListener('click',e => e.preventDefault()));
  document.querySelector('.sidebar-toggle')?.addEventListener('click',event => { event.preventDefault(); const mobile = matchMedia('(max-width: 767px)').matches; document.body.classList.toggle(mobile ? 'sidebar-open' : 'sidebar-collapse'); });
  displayPayment(); displayPaid(); displaySavedCatalog(); updateDirty();
})();
