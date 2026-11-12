(() => {
  const root = document.querySelector('.expert-card-preview');
  const titles = {account:'Редактировать аккаунт', profile:'Редактировать профиль', balance:'Баланс', photos:'Фотографии', public:'Посмотреть на сайте', login:'Войти как пользователь', action:'Действия с аккаунтом'};
  function show(name) {
    const supported = ['info','schedule','price','bookings','reviews'];
    const section = supported.includes(name) ? name : 'other';
    root.querySelectorAll('.expert-panel').forEach(p => p.hidden = p.id !== 'view-' + section);
    root.querySelectorAll('#expert-nav li').forEach(li => li.classList.toggle('active',li.querySelector('a').dataset.panel === name));
    if (section === 'other') document.getElementById('other-title').textContent = titles[name] || 'Раздел';
  }
  root.addEventListener('click', event => {
    const link = event.target.closest('[data-panel]');
    if (link) { event.preventDefault(); const name = link.dataset.panel; history.replaceState(null,'','#'+name); show(name); return; }
    const action = event.target.closest('.demo-action');
    if (action) { event.preventDefault(); let notice = action.parentElement.querySelector('.demo-feedback'); if (!notice) {notice=document.createElement('p'); notice.className='demo-feedback text-muted'; notice.setAttribute('role','status'); action.insertAdjacentElement('afterend',notice)} notice.textContent=action.dataset.demo; }
  });
  document.getElementById('price-form').addEventListener('submit',event=>{
    event.preventDefault(); const val = document.getElementById('price-input').value;
    root.querySelectorAll('[data-price]').forEach(el=>el.textContent=val);
    document.getElementById('price-result').textContent='Изменено только в макете';
  });
  const schedule = document.getElementById('schedule-form');
  schedule.addEventListener('change', event => {
    if (event.target.type !== 'checkbox') return;
    event.target.closest('tr').querySelectorAll('input[type=time]').forEach(input => input.disabled = !event.target.checked);
    document.getElementById('schedule-result').textContent = '';
  });
  schedule.addEventListener('submit',event=>{
    event.preventDefault();
    const invalid = [...schedule.querySelectorAll('tbody tr')].some(row => {
      const enabled = row.querySelector('input[type=checkbox]').checked;
      const times = [...row.querySelectorAll('input[type=time]')];
      return enabled && (!times[0].value || !times[1].value || times[0].value >= times[1].value);
    });
    document.getElementById('schedule-result').textContent = invalid ? 'Проверьте время начала и окончания.' : 'Изменено только в макете';
  });
  document.querySelectorAll('.main-header a, .main-sidebar a, .main-footer a, .content-header a').forEach(el=>el.addEventListener('click',e=>e.preventDefault()));
  document.querySelector('.header-search')?.addEventListener('submit',e=>e.preventDefault());
  show(location.hash.slice(1) || 'info');
})();
