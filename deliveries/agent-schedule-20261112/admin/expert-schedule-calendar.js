(function () {
  'use strict';
  const monthLabel = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });
  const dateLabel = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const week = [['Пн', 'Понедельник'], ['Вт', 'Вторник'], ['Ср', 'Среда'], ['Чт', 'Четверг'], ['Пт', 'Пятница'], ['Сб', 'Суббота'], ['Вс', 'Воскресенье']];
  const blocking = new Map([['pending', 'Ждёт ответа'], ['processing', 'Оформляется'], ['confirmed', 'Подтверждена']]);
  const format = d => [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  const parse = value => {
    const p = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(value || '');
    if (!p) return null;
    const d = new Date(Number(p[1]), Number(p[2]) - 1, Number(p[3]), 12);
    return format(d) === value ? d : null;
  };
  const mondayIndex = d => (d.getDay() + 6) % 7;
  const shift = (d, days) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days, 12);
  const first = d => new Date(d.getFullYear(), d.getMonth(), 1, 12);
  const shiftMonth = (d, count) => new Date(d.getFullYear(), d.getMonth() + count,
    Math.min(d.getDate(), new Date(d.getFullYear(), d.getMonth() + count + 1, 0).getDate()), 12);
  const time = v => {
    if (!/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(v || '')) return null;
    const [hours, minutes] = v.split(':').map(Number);
    return hours * 60 + minutes;
  };
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  window.initExpertScheduleCalendar = function (container, api) {
    const today = new Date();
    const now = format(today);
    const getBookings = () => (api.getBookings() || []).filter(b => parse(b.date) && blocking.has(b.state));
    const dates = getBookings().map(b => b.date).sort();
    let month = first(parse(dates.find(d => d >= now) || dates.at(-1)) || today);
    let selected = null;
    let focusDay = format(month);
    let stopped = false;

    container.classList.add('expert-schedule-calendar');
    container.innerHTML = `<div class="xsc-header">
      <div><h3 class="xsc-title">График по датам</h3></div>
      <div class="xsc-nav" aria-label="Навигация по месяцам">
        <button type="button" class="btn btn-default" data-xsc-month="-1" aria-label="Предыдущий месяц"><span aria-hidden="true">‹</span></button>
        <span class="xsc-month" aria-live="polite"></span>
        <button type="button" class="btn btn-default" data-xsc-month="1" aria-label="Следующий месяц"><span aria-hidden="true">›</span></button>
      </div>
    </div>
    <div class="xsc-legend" aria-label="Условные обозначения">
      <span><i class="xsc-dot xsc-dot-work" aria-hidden="true"></i>Рабочий день</span>
      <span><i class="xsc-mark xsc-mark-off" aria-hidden="true">–</i>Выходной</span>
      <span><i class="xsc-mark xsc-mark-exception" aria-hidden="true">◆</i>Исключение</span>
      <span><i class="xsc-dot xsc-dot-busy" aria-hidden="true"></i>Заявка или запись</span>
    </div>
    <div class="xsc-week" aria-hidden="true">${week.map(([short, full]) => `<abbr title="${full}">${short}</abbr>`).join('')}</div>
    <div class="xsc-grid" role="group" aria-label="Дни месяца"></div>
    <div class="xsc-detail" aria-live="polite"></div>`;

    const monthElement = container.querySelector('.xsc-month');
    const grid = container.querySelector('.xsc-grid');
    const details = container.querySelector('.xsc-detail');

    function snapshot() {
      const state = api.getState() || {};
      const byDate = new Map();
      for (const b of getBookings()) {
        if (!byDate.has(b.date)) byDate.set(b.date, []);
        byDate.get(b.date).push(b);
      }
      byDate.forEach(values => values.sort((a, b) => String(a.time).localeCompare(String(b.time))));
      return { state, byDate, exceptions: new Map((state.exceptions || []).map(e => [e.date, e])) };
    }

    function info(d, data) {
      const iso = format(d), day = data.state.days?.[mondayIndex(d)], ex = data.exceptions.get(iso);
      const rule = api.getRule?.(iso);
      const start = rule?.start ?? (ex?.kind === 'hours' ? ex.start : day?.start);
      const end = rule?.end ?? (ex?.kind === 'hours' ? ex.end : day?.end);
      const validHours = time(start) !== null && time(end) !== null && start < end;
      const on = rule ? rule.enabled && validHours : ex?.kind !== 'closed' && validHours && (ex?.kind === 'hours' || Boolean(day?.enabled));
      const unavailableDraft = !rule && ex?.kind !== 'closed' && !validHours && (ex?.kind === 'hours' || day?.enabled);
      const kind = unavailableDraft ? 'invalid' : on ? 'work' : 'off';
      const title = unavailableDraft ? 'Проверьте часы' : on ? start + '–' + end : (rule?.statusLabel || 'Выходной');
      const booked = data.byDate.get(iso) || [];
      return { iso, ex, on, kind, start, end, title, booked };
    }

    function showDetail(data) {
      if (!selected) {
        details.hidden = true;
        details.replaceChildren();
        return;
      }
      details.hidden = false;
      const day = info(parse(selected), data);
      const source = day.ex ? 'Исключение на дату' : (api.sourceLabel?.(data.state) || 'График агента');
      const breakText = data.state.breakEnabled && time(data.state.breakStart) !== null && time(data.state.breakEnd) !== null && data.state.breakStart < data.state.breakEnd
        ? ` · ${esc(api.breakLabel || 'Дополнительный перерыв')} ${esc(data.state.breakStart)}–${esc(data.state.breakEnd)}` : '';
      details.innerHTML = `<h4>${esc(cap(dateLabel.format(parse(selected))))}</h4>
        <p><strong>${esc(day.title)}</strong> · ${source}${day.on ? breakText : ''}</p>
        ${day.booked.length ? `<ul class="xsc-bookings">${day.booked.map(b =>
          `<li><span>${esc(b.time)} · ${esc(b.client)}${b.proposedSlot&&b.client!=='Агент занят'&&b.client!=='Партнёр занят'?' · Предложенное время':''}</span>${b.client==='Агент занят'||b.client==='Партнёр занят'?'':`<span class="xsc-status">${esc(window.BookingPreview?.labels[window.BookingPreview.visibleStatus(b)] || blocking.get(b.state))}</span>`}</li>`
        ).join('')}</ul>` : '<p class="xsc-muted">На этот день записей нет.</p>'}
        <p class="xsc-muted">Свободное время зависит от перерывов и занятости агента.</p><button type="button" class="btn btn-default btn-sm" data-xsc-edit>Изменить этот день</button>`;
    }

    function refresh(focus = false) {
      if (stopped) return;
      const data = snapshot(), year = month.getFullYear(), mo = month.getMonth();
      const count = new Date(year, mo + 1, 0).getDate(), before = mondayIndex(month), slots = [];
      const heading = cap(monthLabel.format(month));
      if (monthElement.textContent !== heading) monthElement.textContent = heading;
      for (let i = 0; i < before; i++) slots.push('<span class="xsc-empty" aria-hidden="true"></span>');
      for (let n = 1; n <= count; n++) {
        const d = new Date(year, mo, n, 12), x = info(d, data), busy = x.booked.length;
        const label = [dateLabel.format(d), x.kind==='work'?'Рабочий день':x.title, x.kind==='work'?x.title:'', x.ex ? 'исключение' : '', busy ? 'заявок и записей: ' + busy : ''].filter(Boolean).join(', ');
        slots.push(`<button type="button" class="xsc-day xsc-day-${x.kind}${x.ex?' xsc-has-exception':''}" data-xsc-date="${x.iso}"
          tabindex="${x.iso === focusDay ? '0' : '-1'}" aria-pressed="${x.iso === selected}" ${x.iso === now ? 'aria-current="date"' : ''}
          aria-label="${esc(label)}" title="${esc(label)}"><span class="xsc-day-number">${n}</span>${x.ex?'<span class="xsc-exception-indicator" aria-hidden="true">◆</span>':''}<span class="xsc-hours" aria-hidden="true">${esc(x.title)}</span>
          <span class="xsc-day-mark xsc-day-mark-${x.kind}" aria-hidden="true">${x.kind==='work'?'●':x.kind==='invalid'?'!':'–'}</span>
          ${busy ? `<span class="xsc-count" aria-hidden="true">${busy}</span>` : ''}</button>`);
      }
      grid.innerHTML = slots.join('');
      showDetail(data);
      if (focus) grid.querySelector(`[data-xsc-date="${focusDay}"]`)?.focus();
    }

    function onClick(e) {
      const navigation = e.target.closest('[data-xsc-month]');
      const day = e.target.closest('[data-xsc-date]');
      if (e.target.closest('[data-xsc-edit]')) {
        api.editDate?.();
      } else if (navigation) {
        month = first(shiftMonth(month, Number(navigation.dataset.xscMonth)));
        focusDay = format(month);
        refresh();
      } else if (day) {
        focusDay = selected = day.dataset.xscDate;
        api.selectDate(selected);
        refresh(true);
      }
    }

    function onKeydown(e) {
      const button = e.target.closest('[data-xsc-date]');
      if (!button || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const d = parse(button.dataset.xscDate);
      const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -mondayIndex(d), End: 6 - mondayIndex(d) };
      let next = Object.hasOwn(delta, e.key) ? shift(d, delta[e.key]) : null;
      if (e.key === 'PageUp' || e.key === 'PageDown') next = shiftMonth(d, e.key === 'PageUp' ? -1 : 1);
      if (!next) return;
      e.preventDefault();
      focusDay = format(next);
      month = first(next);
      refresh(true);
    }

    container.addEventListener('click', onClick);
    container.addEventListener('keydown', onKeydown);
    refresh();
    return {
      refresh() { refresh(grid.contains(document.activeElement)); },
      destroy() {
        stopped = true;
        container.removeEventListener('click', onClick);
        container.removeEventListener('keydown', onKeydown);
        container.classList.remove('expert-schedule-calendar');
        container.replaceChildren();
      }
    };
  };
}());
