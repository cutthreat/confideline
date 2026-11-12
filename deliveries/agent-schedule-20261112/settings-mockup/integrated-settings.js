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
    ['booking','Открыть календарь записи'], ['link','Перейти по ссылке']
  ];
  // These are illustrative entries for the site's existing language dictionary.
  const rows = [
    {id:'chat', source:'Start chat', caption:'Начать чат', action:'chat', statuses:['online']},
    {id:'wait', source:'Notify me when available', caption:'Уведомить, когда освободится', action:'wait', statuses:['busy']},
    {id:'book', source:'Book a time', caption:'Забронировать время', action:'booking', statuses:['offline']}
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
      fs.append(make('legend',row.caption));
      const grid = make('div','',{class:'conf-grid'});
      const caption = make('div','',{class:'form-group'});
      caption.append(make('label','Подпись'),make('div',row.caption,{class:'conf-caption'}));
      const translations = make('a','Изменить русский перевод',{class:'conf-translation',target:'_blank',rel:'noopener noreferrer'});
      translations.href = 'https://confideline.com/ru/admin/language/translate?language_id=ru-RU&LanguageSourceSearch%5Bcategory%5D=expert_profile_buttons&LanguageSourceSearch%5Bmessage%5D=' + encodeURIComponent(row.source);
      caption.append(translations);
      const action = selectField('Действие',`action-${row.id}`,actions,row.action);
      grid.append(caption,action.container);
      const linkGroup = make('div','',{class:'form-group',hidden:''});
      const linkId = `link-${row.id}`;
      linkGroup.append(make('label','Адрес ссылки',{for:linkId}),make('input','',{class:'form-control',id:linkId,name:linkId,type:'url',placeholder:'https://'}));
      grid.append(linkGroup);
      const updateAction = () => { linkGroup.hidden = action.input.value !== 'link'; };
      action.input.addEventListener('change',updateAction);
      const states = make('fieldset','',{class:'conf-statuses'});
      states.append(make('legend','Показывать при статусе'));
      [['online','Онлайн'],['busy','Занят'],['offline','Не в сети']].forEach(([value,title]) => {
        const label = make('label'); const check = make('input','',{type:'checkbox',name:`status-${row.id}-${value}`});
        check.checked = row.statuses.includes(value); label.append(check,document.createTextNode(' '+title)); states.append(label);
      });
      fs.append(grid,states); container.append(fs); updateAction();
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
    document.getElementById('advance-field').hidden = selected.value !== 'confirm';
  }
  function displaySavedCatalog() {
    if (page !== 'catalog') return;
    ['catalog-filter-version','catalog-cards-version'].forEach(id => {
      const el = document.getElementById(id), text = el.closest('.form-group').querySelector('.help-block span');
      if (text) text.textContent = el.selectedOptions[0].textContent;
    });
  }
  let saved = capture();
  try { const existing = JSON.parse(localStorage.getItem(storageKey)); if (existing) { saved = {...saved,...existing}; apply(saved); } } catch (_) {}
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
    for (const el of form.querySelectorAll('input[type="url"]')) {
      if (!el.closest('[hidden]') && (!el.value || !el.validity.valid)) { el.setCustomValidity('Укажите корректный адрес ссылки.'); el.reportValidity(); el.setCustomValidity(''); return; }
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
