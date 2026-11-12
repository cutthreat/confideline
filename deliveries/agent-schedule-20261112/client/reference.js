const root = document.querySelector('.client-reference');
const find = selector => root.querySelector(selector);
const model = window.BookingPreview;
const cardActions = {
  offline: {dialog: 'booking', icon: 'fa-calendar-o', label: 'Забронировать время'},
  busy: {dialog: 'wait', icon: 'fa-bell-o', label: 'Уведомить, когда освободится'},
};
const catalog = find('#catalog-grid');
for (const profile of window.CatalogFilterFixtures) {
  catalog.insertAdjacentHTML('beforeend', window.CatalogExpertCard.render(profile));
  const action = cardActions[profile.status];
  if (!action) continue;
  const original = catalog.lastElementChild.querySelector('[data-card-action="chat"]');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = original.className;
  button.dataset.cardAction = original.dataset.cardAction;
  button.dataset.open = action.dialog;
  button.dataset.profileId = profile.id;
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-controls', action.dialog);
  const icon = original.querySelector('i');
  icon.className = 'fa ' + action.icon;
  const label = document.createElement('span');
  label.dataset.actionLabel = '';
  label.textContent = action.label;
  button.append(icon, label, original.querySelector('.sr-only'));
  original.replaceWith(button);
  if (profile.id === 'vera') {
    const bookingButton = button.cloneNode(true);
    bookingButton.dataset.open = 'booking';
    bookingButton.setAttribute('aria-controls', 'booking');
    bookingButton.querySelector('i').className = 'fa fa-calendar-o';
    bookingButton.querySelector('[data-action-label]').textContent = 'Забронировать время';
    button.insertAdjacentElement('afterend', bookingButton);
  }
}
const setCardActionLabel = (dialog, label, profileId = null) => {
  const selector = '[data-open="' + dialog + '"]' + (profileId ? '[data-profile-id="' + profileId + '"]' : '') + ' [data-action-label]';
  const target = find(selector);
  if (target) target.textContent = label;
};
const bookingForm = find('#booking-form');
const monthTitle = find('#booking-month');
const previousMonth = find('#month-previous');
const nextMonth = find('#month-next');
const zone = find('#booking-zone');
const dayList = find('#booking-days');
const timeList = find('#booking-times');
const calendarToday = new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Minsk', year:'numeric', month:'2-digit', day:'2-digit'}).format(new Date());
const calendarDateAt = date => new Date(date + 'T12:00:00Z');
const addCalendarDays = (date, days) => {
  const value = calendarDateAt(date);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};
const monthStart = calendarDateAt(calendarToday.slice(0, 7) + '-01');
const monthTitleFor = date => {
  const value = new Intl.DateTimeFormat('ru', {month:'long', year:'numeric', timeZone:'UTC'}).format(date);
  return value.charAt(0).toUpperCase() + value.slice(1);
};
const nextMonthStart = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1, 12));
const afterNextMonth = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 2, 1, 12)).toISOString().slice(0, 10);
const months = [monthStart, nextMonthStart].map(date => [date.toISOString().slice(0, 7), monthTitleFor(date)]);
const dates = [];
for (let day = calendarToday; day < afterNextMonth; day = addCalendarDays(day, 1)) dates.push(day);
let demonstrationSubscriptionDeadline = null;
const calendarDate = new Intl.DateTimeFormat('ru', {day: 'numeric', month: 'long', weekday: 'long', timeZone: 'UTC'});
let selectedDay = calendarToday;
let monthIndex = 0;
let selectedInstant = null;
let bookingProfile = 'alisa';
let currentBookingId = null;
let displayedQuote = null;
let slotIndex = new Map();
let subscription = false;
let trigger = null;

// The preview settings and the catalogue run on separate local ports. Only the
// explicitly defined mock channel flags are exchanged with the other preview.
const channelOrigin = location.origin;
const channelScenario = new URLSearchParams(location.search).get('scenario') || '';
const channelQuery = /^[a-z0-9-]{1,40}$/.test(channelScenario) ? '?scenario=' + encodeURIComponent(channelScenario) : '';
const channelFrame = document.createElement('iframe');
channelFrame.hidden = true;
channelFrame.title = 'Настройки уведомлений';
channelFrame.src = '../settings-mockup/channel-bridge.html' + channelQuery;
document.body.append(channelFrame);
let frameReady = false;
let channelRequest = 0;
const pendingChannelRequests = new Map();
channelFrame.addEventListener('load', () => { frameReady = true; });
window.addEventListener('message', event => {
  if (event.origin !== channelOrigin || event.source !== channelFrame.contentWindow || event.data?.type !== 'availability-channels') return;
  const pending = pendingChannelRequests.get(event.data.requestId);
  if (!pending) return;
  pendingChannelRequests.delete(event.data.requestId);
  clearTimeout(pending.timeout);
  pending.resolve(event.data.error ? null : event.data);
});
function getChannels() {
  return new Promise(resolve => {
    const requestId = ++channelRequest;
    const timeout = setTimeout(() => { pendingChannelRequests.delete(requestId); resolve(null); }, 2500);
    pendingChannelRequests.set(requestId, {resolve, timeout});
    const send = () => channelFrame.contentWindow.postMessage({type: 'get-availability-channels', requestId}, channelOrigin);
    if (frameReady) send(); else channelFrame.addEventListener('load', send, {once: true});
  });
}
find('#wait-settings').href += channelQuery;
find('#wait-active-settings').href += channelQuery;

const local = (instant, options) => new Intl.DateTimeFormat('ru', {timeZone: zone.value, ...options}).format(instant);
const timeLabel = instant => local(instant, {hour: '2-digit', minute: '2-digit'});
const dateLabel = instant => local(instant, {day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'});
const zoneLabel = () => zone.selectedOptions[0].textContent;
const slotsForDay = day => slotIndex.get(day) || [];
const dateInZone = (instant, timeZone) => new Intl.DateTimeFormat('sv-SE', {timeZone, year:'numeric', month:'2-digit', day:'2-digit'}).format(instant);
const bookingInstant = booking => new Date(booking.date + 'T' + booking.time + ':00+03:00');
const ownBooking = (state, profileId) => state.entries.find(item => item.previewClient && item.profile === profileId && model.active(item));
function updateCardLabels(state) {
  for (const button of root.querySelectorAll('[data-open="booking"][data-profile-id]')) {
    const profile = state.profiles.find(item => item.id === button.dataset.profileId);
    button.hidden = !profile;
    setCardActionLabel('booking', ownBooking(state, button.dataset.profileId) ? 'Посмотреть заявку' : 'Забронировать время', button.dataset.profileId);
  }
}
function buildSlots() {
  const state = model.read();
  slotIndex = new Map();
  updateCardLabels(state);
  if (!state.profiles.some(item => item.id === bookingProfile)) return;
  if (!state.agent.days.some(day => day.enabled) && !state.agent.exceptions.some(day => day.kind === 'hours')) return;
  const end = Date.parse(afterNextMonth + 'T23:59:00+03:00');
  const replyAt = model.deadline(state.agent, Date.now(), end);
  if (!replyAt) return;
  for (let date = addCalendarDays(calendarToday, -1); date <= afterNextMonth; date = addCalendarDays(date, 1)) {
    const rule = model.effective(state.agent, date);
    for (let start = Math.ceil(model.minutes(rule.from) / model.slotLength) * model.slotLength;
         rule.enabled && start + model.slotLength <= model.minutes(rule.to); start += model.slotLength) {
      const value = model.time(start);
      const instant = new Date(date + 'T' + value + ':00+03:00');
      if (+instant <= Date.now() || +instant <= replyAt + 60 * 60 * 1000 || model.availability(state.agent, null, date, start) || model.occupied(state.entries, date, start).length) continue;
      const localDay = dateInZone(instant, zone.value);
      if (localDay < calendarToday || localDay >= afterNextMonth) continue;
      if (!slotIndex.has(localDay)) slotIndex.set(localDay, []);
      slotIndex.get(localDay).push(instant.toISOString());
    }
  }
}

function choice(label, name, value, checked) {
  const wrapper = document.createElement('label');
  wrapper.className = 'choice';
  const input = document.createElement('input');
  input.type = 'radio';
  input.name = name;
  input.value = value;
  input.checked = checked;
  const caption = document.createElement('span');
  caption.textContent = label;
  wrapper.append(input, caption);
  return wrapper;
}

function renderDays(focusDay) {
  const [month, title] = months[monthIndex];
  const start = new Date(month + '-01T12:00:00Z');
  const [year, monthNumber] = month.split('-').map(Number);
  const count = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const leading = (start.getUTCDay() + 6) % 7;
  monthTitle.textContent = title;
  previousMonth.setAttribute('aria-disabled', String(monthIndex === 0));
  nextMonth.setAttribute('aria-disabled', String(monthIndex === months.length - 1));
  dayList.replaceChildren();
  for (let index = 0; index < leading + count; index += 7) {
    const row = document.createElement('tr');
    for (let column = 0; column < 7; column++) {
      const day = index + column - leading + 1;
      const cell = document.createElement('td');
      if (day >= 1 && day <= count) {
        const date = month + '-' + String(day).padStart(2, '0');
        const past = date < calendarToday;
        const available = !past && slotsForDay(date).length > 0;
        const button = document.createElement('button');
        button.type = 'button';
        button.disabled = past;
        button.className = 'calendar-day';
        button.dataset.date = date;
        button.dataset.available = String(available);
        button.setAttribute('aria-pressed', String(date === selectedDay));
        const status = past ? 'дата прошла' : available ? 'есть свободное время' : 'свободного времени нет';
        button.setAttribute('aria-label', calendarDate.format(new Date(date + 'T12:00:00Z')) + ', ' + status);
        button.tabIndex = date === selectedDay ? 0 : -1;
        button.textContent = String(day);
        cell.append(button);
      }
      row.append(cell);
    }
    dayList.append(row);
  }
  if (focusDay) dayList.querySelector('[data-date="' + focusDay + '"]')?.focus();
}

function renderTimes() {
  timeList.replaceChildren();
  const slots = slotsForDay(selectedDay);
  if (selectedInstant && !slots.includes(selectedInstant)) selectedInstant = null;
  for (const value of slots) {
    const instant = new Date(value);
    timeList.append(choice(timeLabel(instant), 'slot', value, value === selectedInstant));
  }
  const empty = find('#booking-empty');
  empty.hidden = slots.length !== 0;
  empty.textContent = slots.length ? '' : 'В этот день свободного времени нет. Выберите другой день.';
  updateBookingReview();
}

function updateBookingReview() {
  bookingForm.querySelector('[type=submit]').disabled = !selectedInstant;
  find('#booking-summary').textContent = selectedInstant
    ? dateLabel(new Date(selectedInstant)) + ' · ' + zoneLabel()
    : 'Выберите дату и время.';
}

function showBooking() {
  const state = model.read();
  const profile = state.profiles.find(item => item.id === bookingProfile);
  const booking = ownBooking(state, bookingProfile);
  currentBookingId = booking?.id ?? null;
  find('#booking-profile-name').textContent = profile?.name || 'Эксперт';
  find('#booking-price').textContent = (profile?.price ?? 10) + ' кредитов/мин';
  find('#booking-payment').textContent = state.paymentMode === 'after-confirmation' ? 'после подтверждения — аванс за 3 минуты, на оплату 30 минут' : 'оплата с начала сеанса';
  if (!booking) displayedQuote = {price:profile?.price ?? 10, mode:state.paymentMode};
  bookingForm.hidden = Boolean(booking);
  find('#booking-result').hidden = !booking;
  if (booking) {
    find('#booking-result h3').textContent = ({pending:'Ожидает подтверждения', processing:'Ожидает оплаты', confirmed:'Запись подтверждена'})[booking.state] || model.labels[booking.state];
    find('#booking-result-time').textContent = (profile?.name || 'Эксперт') + ' · ' + dateLabel(bookingInstant(booking)) + ' · ' + zoneLabel();
    find('#booking-result-due').textContent = booking.state === 'pending' ? 'Агент ответит до ' + dateLabel(new Date(booking.deadlineAt)) + '.' : booking.deadline;
    find('#booking-result-price').textContent = booking.acceptedPrice + ' кредитов за минуту.';
    find('#booking-cancel-request').hidden = booking.state !== 'pending';
  } else {
    buildSlots();
    if (!slotsForDay(selectedDay).length) {
      selectedDay = dates.find(day => day.startsWith(months[monthIndex][0]) && slotsForDay(day).length) || dates.find(day => slotsForDay(day).length) || calendarToday;
      monthIndex = Math.max(0, months.findIndex(([month]) => selectedDay.startsWith(month)));
    }
    renderDays();
    renderTimes();
  }
}
let channelRender = 0;
async function showWait(cancelled = false) {
  const renderId = ++channelRender;
  find('#wait-form').hidden = subscription || cancelled;
  find('#wait-active').hidden = !subscription;
  find('#wait-cancelled').hidden = !cancelled;
  find('#wait-until').textContent = subscription ? 'Подписка действует до ' + dateLabel(demonstrationSubscriptionDeadline) + ' · ' + zoneLabel() + '.' : '';
  setCardActionLabel('wait', subscription ? 'Посмотреть ожидание' : cardActions.busy.label);
  if (cancelled) return;
  const confirm = find('#wait-confirm');
  confirm.disabled = true;
  find('#wait-settings').hidden = true;
  find('#wait-active-settings').hidden = true;
  find('#wait-description').textContent = 'Проверяем доступные способы уведомления…';
  find('#wait-channel-message').textContent = '';
  find('#wait-active-channel-message').textContent = '';
  const channels = await getChannels();
  if (renderId !== channelRender) return;
  if (!channels) {
    find(subscription ? '#wait-active-channel-message' : '#wait-channel-message').textContent = 'Не удалось проверить настройки уведомлений. Закройте окно и попробуйте ещё раз.';
    find('#wait-description').textContent = '';
  } else if (!channels.allowed.length) {
    find(subscription ? '#wait-active-channel-message' : '#wait-channel-message').textContent = subscription
      ? 'Доставка временно недоступна. Ожидание сохранится до указанного срока.'
      : 'Уведомления сейчас недоступны.';
    find('#wait-description').textContent = '';
  } else if (!channels.selected.length) {
    find(subscription ? '#wait-active-channel-message' : '#wait-channel-message').textContent = subscription
      ? 'Доставка временно недоступна. Включите способ уведомления до окончания ожидания.'
      : 'Выберите способ уведомления в настройках, затем подтвердите ожидание.';
    find(subscription ? '#wait-active-settings' : '#wait-settings').hidden = false;
    find('#wait-description').textContent = '';
  } else {
    find('#wait-description').textContent = 'Сообщим, когда Вера Ланская снова будет доступна. Ожидание действует 7 дней.';
    if (!subscription) confirm.disabled = false;
  }
}

root.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', event => {
  event.stopPropagation();
  trigger = button;
  const dialog = document.getElementById(button.dataset.open);
  if (dialog.id === 'booking') { bookingProfile = button.dataset.profileId; selectedInstant = null; find('#booking-error').hidden = true; showBooking(); }
  else showWait();
  dialog.showModal();
  dialog.querySelector('.modal-title').focus();
}));
root.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('close', () => trigger?.focus()));
root.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));

function stepMonth(offset) {
  const target = monthIndex + offset;
  if (!months[target]) return;
  monthIndex = target;
  const [month] = months[monthIndex];
  selectedDay = dates.find(date => date.startsWith(month) && slotsForDay(date).length) || month + '-01';
  selectedInstant = null;
  renderDays();
  renderTimes();
}
previousMonth.addEventListener('click', () => stepMonth(-1));
nextMonth.addEventListener('click', () => stepMonth(1));
dayList.addEventListener('click', event => {
  const date = event.target.closest('[data-date]')?.dataset.date;
  if (!date || date < calendarToday) return;
  selectedDay = date;
  selectedInstant = null;
  renderDays(date);
  renderTimes();
});
dayList.addEventListener('keydown', event => {
  const button = event.target.closest('[data-date]');
  const offset = {ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7}[event.key];
  if (!button || offset === undefined) return;
  event.preventDefault();
  const target = new Date(button.dataset.date + 'T12:00:00Z');
  target.setUTCDate(target.getUTCDate() + offset);
  const date = target.toISOString().slice(0, 10);
  const next = dayList.querySelector('[data-date="' + date + '"]');
  if (!next || next.disabled) return;
  dayList.querySelector('[tabindex="0"]').tabIndex = -1;
  next.tabIndex = 0;
  next.focus();
});
zone.addEventListener('change', () => {
  const chosen = selectedInstant;
  buildSlots();
  if (chosen) {
    const newDay = dateInZone(new Date(chosen), zone.value);
    if (slotsForDay(newDay).includes(chosen)) {
      selectedDay = newDay;
      selectedInstant = chosen;
      monthIndex = Math.max(0, months.findIndex(([month]) => newDay.startsWith(month)));
    } else selectedInstant = null;
  }
  renderDays();
  renderTimes();
  if (currentBookingId) showBooking();
});
timeList.addEventListener('change', event => {
  selectedInstant = event.target.value;
  updateBookingReview();
});
bookingForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!selectedInstant || currentBookingId) return;
  const current = model.read();
  const profile = current.profiles.find(item => item.id === bookingProfile);
  if (profile && ((profile.price ?? 10) !== displayedQuote.price || current.paymentMode !== displayedQuote.mode)) {
    find('#booking-error').textContent = 'Цена или условия оплаты изменились. Проверьте их перед отправкой заявки.';
    find('#booking-error').hidden = false;
    displayedQuote = {price:profile.price ?? 10, mode:current.paymentMode};
    find('#booking-price').textContent = displayedQuote.price + ' кредитов/мин';
    find('#booking-payment').textContent = displayedQuote.mode === 'after-confirmation' ? 'после подтверждения — аванс за 3 минуты, на оплату 30 минут' : 'оплата с начала сеанса';
    return;
  }
  const stamp = model.now(new Date(selectedInstant).getTime());
  const result = model.requestBooking(bookingProfile, stamp.slice(0,10), stamp.slice(11,16));
  if (result.error) {
    const error = find('#booking-error');
    error.textContent = result.error;
    error.hidden = false;
    selectedInstant = null;
    buildSlots(); renderDays(); renderTimes();
    return;
  }
  find('#booking-error').hidden = true;
  updateCardLabels(result.state);
  showBooking();
  find('#booking-result h3').focus();
});
find('#booking-cancel-request').addEventListener('click', () => {
  if (!currentBookingId) return;
  const result = model.cancelOwnRequest(currentBookingId);
  if (result.error) { showBooking(); return; }
  currentBookingId = null;
  selectedInstant = null;
  updateCardLabels(result.state);
  find('#booking').close();
});
model.watch(state => {
  updateCardLabels(state);
  if (find('#booking').open) {
    if (currentBookingId) showBooking();
    else { buildSlots(); renderDays(); renderTimes(); }
  }
});
updateCardLabels(model.read());

find('#wait-confirm').addEventListener('click', async () => {
  find('#wait-confirm').disabled = true;
  const channels = await getChannels();
  if (!channels || !channels.allowed.length || !channels.selected.length) { showWait(); return; }
  subscription = true;
  demonstrationSubscriptionDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  showWait();
  find('#wait-active [data-close]').focus();
});
window.addEventListener('focus', () => { if (find('#wait').open) showWait(); });
find('#wait-cancel').addEventListener('click', () => {
  subscription = false;
  demonstrationSubscriptionDeadline = null;
  showWait(true);
  find('#wait-cancelled [data-close]').focus();
});

const navToggle = find('.reference-nav-toggle');
navToggle.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'false';
  navToggle.setAttribute('aria-expanded', String(expanded));
  find('#header-navigation').classList.toggle('show', expanded);
});

