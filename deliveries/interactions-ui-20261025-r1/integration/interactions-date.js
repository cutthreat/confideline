(function () {
  'use strict';
  const root = document.getElementById('confideline-interactions');
  const $ = window.jQuery;
  if (!root || !$ || !$.fn.daterangepicker) return;
  const trigger = root.querySelector('.cl-date-picker > summary');
  const period = root.querySelector('#period');
  const from = root.querySelector('#fromDate');
  const to = root.querySelector('#toDate');
  const now = window.moment.parseZone(root.dataset.reportNow || new Date().toISOString()).utcOffset(180);
  const labels = {'Сегодня':'today','Последние 7×24 часа':'7d','Последние 30×24 часа':'30d'};
  root.classList.add('cl-site-date-picker');
  trigger.addEventListener('click', function (event) { event.preventDefault(); });
  $(trigger).daterangepicker({
    parentEl: root, opens: 'right', autoUpdateInput: false, autoApply: true, showDropdowns: true,
    alwaysShowCalendars: true, linkedCalendars: true, maxDate: now.clone(),
    startDate: from.value, endDate: to.value,
    ranges: {
      'Сегодня': [now.clone().startOf('day'), now.clone()],
      'Последние 7×24 часа': [now.clone().subtract(7,'days'), now.clone()],
      'Последние 30×24 часа': [now.clone().subtract(30,'days'), now.clone()]
    },
    locale: {
      format:'YYYY-MM-DD', separator:' — ', applyLabel:'Применить', cancelLabel:'Отмена',
      customRangeLabel:'Свой период', firstDay:1,
      daysOfWeek:['вс','пн','вт','ср','чт','пт','сб'],
      monthNames:['янв.','февр.','март','апр.','май','июнь','июль','авг.','сент.','окт.','нояб.','дек.']
    }
  });
  const picker = $(trigger).data('daterangepicker');
  picker.container.addClass('finance-date-picker cl-interaction-calendar');
  const all = document.createElement('li');
  all.textContent = 'Весь период'; all.dataset.period = 'all';
  const custom = picker.container[0].querySelector('.ranges li:last-child');
  custom.before(all);
  function draft(value) {
    period.value = value;
    period.dispatchEvent(new Event('change', {bubbles:true}));
  }
  all.addEventListener('click', function (event) {
    event.stopPropagation(); draft('all'); picker.hide(); trigger.focus({preventScroll:true});
  });
  $(trigger).on('apply.daterangepicker', function (_, instance) {
    const value = labels[instance.chosenLabel] || 'custom';
    if (value === 'custom') { from.value=instance.startDate.format('YYYY-MM-DD'); to.value=instance.endDate.format('YYYY-MM-DD'); }
    draft(value); trigger.focus({preventScroll:true});
  });
  function prepare() {
    picker.container[0].querySelectorAll('td.available,th.prev.available,th.next.available,.ranges li').forEach(function (node) {
      node.tabIndex=0; node.setAttribute('role','button');
      if (node.matches('th.prev')) node.setAttribute('aria-label','Предыдущий месяц');
      if (node.matches('th.next')) node.setAttribute('aria-label','Следующий месяц');
    });
    picker.container[0].querySelectorAll('select').forEach(function (select) {
      select.setAttribute('aria-label', (select.closest('.left') ? 'Начало: ' : 'Конец: ') + (select.classList.contains('monthselect') ? 'месяц' : 'год'));
    });
  }
  function alignCalendar() {
    const header=document.querySelector('.main-header');
    root.style.setProperty('--cl-calendar-top', Math.max(12,(header?header.getBoundingClientRect().bottom:0)+12)+'px');
    if (document.documentElement.clientWidth<=767 || picker.container[0].style.display==='none') return;
    const parent=root.getBoundingClientRect();
    const wanted=Math.max(12,Math.min(trigger.getBoundingClientRect().left,document.documentElement.clientWidth-638));
    picker.container[0].style.left=(wanted-parent.left)+'px';
    picker.container[0].style.right='auto';
  }
  $(trigger).on('show.daterangepicker', function () {
    root.querySelectorAll('.cl-popup[open],#profilePicker[open]').forEach(function (d) { d.open=false; });
    const start=period.value==='custom'?window.moment.parseZone(from.value+'T00:00:00+03:00'):period.value==='today'?now.clone().startOf('day'):period.value==='7d'?now.clone().subtract(7,'days'):period.value==='30d'?now.clone().subtract(30,'days'):null;
    const end=period.value==='custom'?window.moment.parseZone(to.value+'T23:59:59+03:00'):now.clone();
    const bounds={from:start?start.valueOf():null,to:Math.min(end.valueOf(),now.valueOf())};
    if (bounds.from!==null) { picker.setStartDate(window.moment(bounds.from)); picker.setEndDate(window.moment(bounds.to)); picker.updateView(); }
    if (period.value==='all') { picker.container[0].querySelectorAll('.ranges li.active').forEach(function (n) { n.classList.remove('active'); }); all.classList.add('active'); }
    trigger.setAttribute('aria-expanded','true'); prepare(); alignCalendar();
  });
  $(trigger).on('hide.daterangepicker', function () { trigger.setAttribute('aria-expanded','false'); });
  picker.container[0].addEventListener('keydown', function (event) {
    if (event.key==='Escape') { event.stopPropagation(); picker.clickCancel(); trigger.focus({preventScroll:true}); }
    else if ((event.key==='Enter'||event.key===' ') && event.target.matches('td.available,th.prev.available,th.next.available,.ranges li')) { event.preventDefault(); event.target.click(); }
  });
  new MutationObserver(prepare).observe(picker.container[0],{childList:true,subtree:true});
  new ResizeObserver(alignCalendar).observe(root);
})();
