const root = document.querySelector('.client-reference');
const find = selector => root.querySelector(selector);
const model = window.BookingPreview;
if (new URLSearchParams(location.search).get('scenario') === 'client-conflict') model.resetClientConflict();
const configScenario = new URLSearchParams(location.search).get('scenario') || '';
const configSuffix = /^[a-z0-9-]{1,40}$/.test(configScenario) ? '-' + configScenario : '';
let buttonSettings = {};
try { buttonSettings = JSON.parse(localStorage.getItem('confideline-integrated-settings-v2-catalog' + configSuffix)) || {}; } catch (_) {}
const {defaults, actionLabels, isValid} = window.CatalogActionLabels;
const cardActions = Object.fromEntries(Object.entries(defaults).map(([status, preset]) => {
  const action = buttonSettings['action-' + status] || preset.action;
  const savedLabel = buttonSettings['caption-' + status];
  return [status, {
    action,
    label: isValid(savedLabel) ? savedLabel.trim() : actionLabels[action] || preset.label,
    url: buttonSettings['link-' + status] || ''
  }];
}));
const actionIcons = {chat:'fa-comment-o',wait:'fa-bell-o',booking:'fa-calendar-o',link:'fa-external-link'};
const catalog = find('#catalog-grid');
for (const profile of window.CatalogFilterFixtures) {
  catalog.insertAdjacentHTML('beforeend', window.CatalogExpertCard.render(profile));
  const action = cardActions[profile.status];
  const original = catalog.lastElementChild.querySelector('[data-card-action="chat"]');
  if (!action || action.action === 'none') { original.remove(); continue; }
  const label = document.createElement('span'); label.dataset.actionLabel = ''; label.textContent = action.label;
  const icon = original.querySelector('i'); icon.className = 'fa ' + (actionIcons[action.action] || actionIcons.chat);
  original.replaceChildren(icon, label, original.querySelector('.sr-only'));
  if (action.action === 'chat') continue;
  if (action.action === 'link') {
    let safe=/^\/(?![\/\\])\S*$/.test(action.url);
    if(!safe){try{safe=['http:','https:'].includes(new URL(action.url).protocol);}catch(_){}}
    if(!safe){original.remove();continue;}
    original.removeAttribute('data-card-action'); original.href = action.url;
    original.rel = 'noopener noreferrer'; continue;
  }
  const button = document.createElement('button');
  button.type = 'button'; button.className = original.className;
  button.dataset.cardAction = 'chat'; button.dataset.open = action.action;
  button.dataset.profileId = profile.id; button.setAttribute('aria-haspopup','dialog');
  button.setAttribute('aria-controls',action.action);
  button.replaceChildren(...original.childNodes); original.replaceWith(button);
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
const afterLastDay = addCalendarDays(calendarToday, Math.ceil(model.readPolicy().horizonDays) + 1);
const months = [];
for (let date = monthStart; date.toISOString().slice(0,10) < afterLastDay; date = new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,1,12))) {
  months.push([date.toISOString().slice(0,7), monthTitleFor(date)]);
}
const dates = [];
for (let day = calendarToday; day < afterLastDay; day = addCalendarDays(day, 1)) dates.push(day);
const subscriptions = new Map();
let waitProfile = 'vera';
const calendarDate = new Intl.DateTimeFormat('ru', {day: 'numeric', month: 'long', weekday: 'long', timeZone: 'UTC'});
let selectedDay = calendarToday;
let monthIndex = 0;
let selectedInstant = null;
let bookingProfile = 'alisa';
let currentBookingId = null;
let movingBookingId = null;
let displayedQuote = null;
let slotIndex = new Map();
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
  if(Number.isFinite(state.previewBalance))find('#user-balance-in-header').textContent=state.previewBalance.toFixed(2);
  for (const button of root.querySelectorAll('[data-open="booking"][data-profile-id]')) {
    const profileState = model.readForProfile(button.dataset.profileId);
    const profile = profileState.profiles.find(item => item.id === button.dataset.profileId);
    button.hidden = !profile;
    const booking=ownBooking(profileState,button.dataset.profileId);
    const fixture=window.CatalogFilterFixtures.find(item=>item.id===button.dataset.profileId);
    setCardActionLabel('booking', booking ? (booking.state==='confirmed'?'Посмотреть запись':'Посмотреть заявку') : cardActions[fixture?.status]?.label || actionLabels.booking, button.dataset.profileId);
  }
}
function buildSlots() {
  const state = model.readForProfile(bookingProfile);
  slotIndex = new Map();
  updateCardLabels(state);
  if (!state.profiles.some(item => item.id === bookingProfile)) return;
  if (!state.agent.days.some(day => day.enabled) && !state.agent.exceptions.some(day => day.kind === 'hours')) return;
  const end = Date.parse(afterLastDay + 'T23:59:00+03:00');
  const replyAt = model.deadline(state.agent, Date.now(), end);
  if (!replyAt) return;
  for (let date = addCalendarDays(calendarToday, -1); date <= afterLastDay; date = addCalendarDays(date, 1)) {
    const rule = model.effective(state.agent, date);
    const step=model.readPolicy().stepMinutes;
    for (let start = Math.ceil(model.minutes(rule.from) / step) * step;
         rule.enabled && start + model.slotLength <= model.minutes(rule.to); start += step) {
      const value = model.time(start);
      const instant = new Date(date + 'T' + value + ':00+03:00');
      if (+instant <= Date.now() || +instant <= replyAt + model.readPolicy().beforeHours * 60 * 60 * 1000 || model.availability(state.agent, null, date, start) || model.occupied(state.entries, date, start).length) continue;
      const localDay = dateInZone(instant, zone.value);
      if (localDay < calendarToday || localDay >= afterLastDay) continue;
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
  const state = model.readForProfile(bookingProfile);
  const profile = state.profiles.find(item => item.id === bookingProfile);
  const booking = ownBooking(state, bookingProfile) || state.entries.find(item=>item.previewClient&&item.profile===bookingProfile&&item.state==='cancelled'&&(item.id===currentBookingId||item.transferConflict));
  currentBookingId = booking?.id ?? null;
  movingBookingId = null;
  find('#booking-title').textContent = booking ? 'Ваша запись' : 'Забронировать время';
  find('#booking-profile-name').textContent = profile?.name || 'Эксперт';
  find('#booking-price').textContent = (profile?.price ?? 10) + ' кредитов/мин';
  const policy=booking?.policySnapshot || model.readPolicy();
  const paymentMode=booking?.paymentMode || policy.paymentMode || state.paymentMode;
  find('#booking-payment').textContent = paymentMode === 'after-confirmation' ? 'после подтверждения — аванс за ' + policy.advanceMinutes + ' мин., на оплату ' + policy.paymentDeadlineMinutes + ' мин.' : 'оплата с начала сеанса';
  const lateTerms=policy.lateCancelMode==='full'?'позже аванс также возвращается полностью':policy.lateCancelMode==='manual'?'позднюю отмену рассматривает сотрудник':'позже удерживается '+policy.lateCancelPercent+'%';
  find('#booking-cancel-terms').textContent = paymentMode === 'after-confirmation' ? 'При отмене не позднее чем за ' + policy.fullRefundHours + ' ч. аванс возвращается полностью; ' + lateTerms + '. Для поздней оплаты действует льготный срок ' + policy.latePaymentGraceMinutes + ' мин.' : 'До начала консультации аванс не списывается.';
  if (!booking) displayedQuote = {price:profile?.price ?? 10, mode:paymentMode, policy:JSON.stringify(policy)};
  bookingForm.hidden = Boolean(booking);
  find('#booking-result').hidden = !booking;
  find('#booking-delay-options').hidden = !booking?.delayed || booking.state!=='confirmed';
  find('#booking-delay-move').hidden = policy.rescheduleMode==='disabled';
  find('#booking-delay-move').textContent = policy.rescheduleMode==='manual'?'Обратиться в поддержку':'Выбрать другое время';
  find('#booking-delay-cancel-confirm').hidden = true;
  find('#booking-form [type=submit]').textContent = 'Отправить заявку';
  const proposal = booking?.proposal;
  find('#booking-proposal').hidden = !proposal;
  if (proposal) {
    const time = bookingInstant(proposal);
    find('#booking-proposal-time').textContent = dateLabel(time) + ' · ' + zoneLabel() +
      '. До вашего согласия действует прежнее время. Цена и аванс сохранятся.';
    for (const button of root.querySelectorAll('[data-booking-answer]')) button.disabled = Boolean(proposal.acceptedAt);
    if (proposal.acceptedAt) find('#booking-proposal-time').textContent = dateLabel(time) + ' · Время уточняется.';
  }
  if (booking) {
    find('#booking-result h3').textContent = booking.delayed ? 'Начало встречи задерживается' : ({pending:'Ожидает подтверждения', processing:'Ожидает оплаты', confirmed:'Запись подтверждена',cancelled:'Встреча отменена'})[booking.state] || model.labels[booking.state];
    find('#booking-result-time').textContent = (profile?.name || 'Эксперт') + ' · ' + dateLabel(bookingInstant(booking)) + ' · ' + zoneLabel();
    find('#booking-result-due').textContent = booking.state === 'pending' ? 'Ответ до ' + dateLabel(new Date(booking.deadlineAt)) + '.' : booking.state==='cancelled' ? (booking.refundStatus==='complete'?'На ваш баланс возвращено '+booking.refundAmount+' кредитов.':booking.refundStatus==='processing'?'Возврат неиспользованного аванса в обработке.':'Дополнительных списаний нет.') : booking.deadline;
    find('#booking-result-price').textContent = booking.acceptedPrice + ' кредитов за минуту.' + (booking.advancePaid && Number.isFinite(booking.advanceAmount) ? ' Аванс: ' + booking.advanceAmount + ' кредитов.' : '');
    find('#booking-cancel-request').hidden = booking.state !== 'pending';
    if(booking.delayed) find('#booking-delay-message').textContent = booking.clientChoice==='wait' ? 'Вы решили подождать. Сообщим, когда эксперт сможет начать. Время ожидания не оплачивается.' : booking.clientSuggestion ? 'Ваше предложение отправлено. Сообщим, когда время будет подтверждено. Прежняя цена сохранится.' : (policy.rescheduleMode==='disabled'?'Эксперт сможет подключиться позже. Вы можете подождать или отменить встречу. Время ожидания не оплачивается.':policy.rescheduleMode==='manual'?'Эксперт сможет подключиться позже. Вы можете подождать, обратиться в поддержку или отменить встречу. Время ожидания не оплачивается.':'Эксперт сможет подключиться позже. Вы можете подождать, выбрать другое время или отменить встречу. Время ожидания не оплачивается; цена останется прежней.');
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
  const subscription = subscriptions.get(waitProfile);
  const profile = window.CatalogFilterFixtures.find(item=>item.id===waitProfile);
  find('#wait-profile-name').textContent = profile?.name || 'Эксперт';
  find('#wait-title').textContent = profile?.status === 'offline' ? 'Уведомить, когда появится онлайн?' : 'Уведомить, когда освободится?';
  find('#wait-form').hidden = subscription || cancelled;
  find('#wait-active').hidden = !subscription;
  find('#wait-cancelled').hidden = !cancelled;
  find('#wait-until').textContent = subscription ? 'Подписка действует до ' + dateLabel(subscription.deadline) + ' · ' + zoneLabel() + '.' : '';
  setCardActionLabel('wait', subscription ? 'Посмотреть ожидание' : cardActions[profile?.status]?.label || 'Уведомить меня', waitProfile);
  if (cancelled) return;
  const confirm = find('#wait-confirm');
  confirm.hidden = false; confirm.disabled = true;
  find('#wait-settings').hidden = true;
  find('#wait-active-settings').hidden = true;
  find('#wait-description').textContent = 'Проверяем доступные способы уведомления…';
  find('#wait-channel-message').textContent = '';
  find('#wait-active-channel-message').textContent = '';
  if(profile?.status==='online' && !subscription){find('#wait-description').textContent='Эксперт уже доступен. Вы можете написать ему в чат.';confirm.hidden=true;return;}
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
    find('#wait-description').textContent = 'Сообщим, когда эксперт снова будет доступен. Ожидание действует ' + model.readPolicy().waitingDays + ' дней.';
    if (!subscription) confirm.disabled = false;
  }
}

function openBookingFor(button) {
  trigger = button;
  bookingProfile = button.dataset.profileId; selectedInstant = null; currentBookingId = null; movingBookingId = null;
  find('#booking-error').hidden = true;
  find('#booking-proposal-message').hidden = true;
  showBooking();
  find('#booking').showModal();
  find('#booking .modal-title').focus();
}
for (const button of root.querySelectorAll('[data-booking-answer]')) button.addEventListener('click', () => {
  const booking = ownBooking(model.readForProfile(bookingProfile), bookingProfile);
  if (!booking?.proposal) return;
  const accept = button.dataset.bookingAnswer === 'accept';
  const result = model.answerReschedule(booking.id, accept, booking.proposal.id, bookingProfile);
  showBooking();
  const notice = find('#booking-proposal-message');
  notice.hidden = false;
  notice.textContent = result.error || (result.deferred ? 'Согласие принято. Уточняем новое время.' :
    accept ? 'Время записи изменено.' : 'Прежнее время сохранено.');
  find('#booking-result h3').focus();
});
root.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', event => {
  event.stopPropagation();
  trigger = button;
  if (button.dataset.open === 'booking') { openBookingFor(button); return; }
  const dialog = find('#wait');
  waitProfile = button.dataset.profileId; showWait();
  dialog.showModal();
  dialog.querySelector('.modal-title').focus();
}));
root.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('close', () => {
  if (!root.querySelector('dialog[open]')) trigger?.focus();
}));
root.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
find('#wait-booking').addEventListener('click', event => {
  event.preventDefault();
  bookingProfile = trigger?.dataset.profileId || 'vera';
  selectedInstant = null;
  currentBookingId = null;
  movingBookingId = null;
  find('#booking-error').hidden = true;
  find('#wait').close();
  showBooking();
  find('#booking').showModal();
  find('#booking .modal-title').focus();
});

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
  if (currentBookingId && !movingBookingId) showBooking();
});
timeList.addEventListener('change', event => {
  selectedInstant = event.target.value;
  updateBookingReview();
});
bookingForm.addEventListener('submit', event => {
  event.preventDefault();
  if(movingBookingId && selectedInstant){
    const stamp=model.now(new Date(selectedInstant).getTime());
    const result=model.clientDelayAction(movingBookingId,'reschedule',{date:stamp.slice(0,10),time:stamp.slice(11,16)},bookingProfile);
    if(result.error){find('#booking-error').textContent=result.error;find('#booking-error').hidden=false;buildSlots();renderDays();renderTimes();return;}
    movingBookingId=null;find('#booking-error').hidden=true;showBooking();find('#booking-result h3').focus();return;
  }
  if (!selectedInstant || currentBookingId) return;
  const current = model.readForProfile(bookingProfile);
  const profile = current.profiles.find(item => item.id === bookingProfile);
  const policy = model.readPolicy(), paymentMode = policy.paymentMode || current.paymentMode;
  if (profile && ((profile.price ?? 10) !== displayedQuote.price || paymentMode !== displayedQuote.mode || JSON.stringify(policy) !== displayedQuote.policy)) {
    find('#booking-error').textContent = 'Цена или условия оплаты изменились. Проверьте их перед отправкой заявки.';
    find('#booking-error').hidden = false;
    displayedQuote = {price:profile.price ?? 10, mode:paymentMode, policy:JSON.stringify(policy)};
    find('#booking-price').textContent = displayedQuote.price + ' кредитов/мин';
    find('#booking-payment').textContent = displayedQuote.mode === 'after-confirmation' ? 'после подтверждения — аванс за '+policy.advanceMinutes+' мин., на оплату '+policy.paymentDeadlineMinutes+' мин.' : 'оплата с начала сеанса';
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
  const result = model.cancelOwnRequest(currentBookingId,bookingProfile);
  if (result.error) { showBooking(); return; }
  currentBookingId = null;
  selectedInstant = null;
  updateCardLabels(result.state);
  find('#booking').close();
});
find('#booking-delay-wait').addEventListener('click',()=>{
  const result=model.clientDelayAction(currentBookingId,'wait',{},bookingProfile);
  if(!result.error)showBooking();else find('#booking-delay-message').textContent=result.error;
});
find('#booking-delay-move').addEventListener('click',()=>{
  const booking=model.readForProfile(bookingProfile).entries.find(item=>item.id===currentBookingId);
  const rescheduleMode=booking?.policySnapshot?.rescheduleMode || model.readPolicy().rescheduleMode;
  if(rescheduleMode!=='consent'){find('#booking-delay-message').textContent='Чтобы изменить время, обратитесь в поддержку.';return;}
  movingBookingId=currentBookingId;selectedInstant=null;
  find('#booking-title').textContent='Выберите другое время';
  find('#booking-result').hidden=true;bookingForm.hidden=false;
  find('#booking-price').textContent=(booking?.acceptedPrice??0)+' кредитов/мин';
  find('#booking-payment').textContent=booking?.advancePaid?'предоплата сохранится':'оплата по прежним условиям';
  find('#booking-form [type=submit]').textContent='Предложить время';
  buildSlots();renderDays();renderTimes();find('#booking-title').focus();
});
find('#booking-delay-cancel').addEventListener('click',()=>{
  const b=model.readForProfile(bookingProfile).entries.find(x=>x.id===currentBookingId);
  find('#booking-delay-options').hidden=true;find('#booking-delay-cancel-confirm').hidden=false;
  find('#booking-delay-cancel-copy').textContent=b?.advancePaid?'Отменить встречу? Неиспользованный аванс вернётся на ваш баланс.':'Отменить встречу? Дополнительных списаний не будет.';
  find('#booking-delay-cancel-back').focus();
});
find('#booking-delay-cancel-back').addEventListener('click',()=>{showBooking();find('#booking-delay-cancel').focus();});
find('#booking-delay-cancel-confirm-button').addEventListener('click',()=>{
  const result=model.clientDelayAction(currentBookingId,'cancel',{},bookingProfile);
  if(result.error){find('#booking-delay-cancel-copy').textContent=result.error;return;}
  showBooking();updateCardLabels(result.state);find('#booking-result h3').focus();
});
model.watch(state => {
  updateCardLabels(state);
  if (find('#booking').open) {
    if (currentBookingId && !movingBookingId) showBooking();
    else { buildSlots(); renderDays(); renderTimes(); }
  }
});
updateCardLabels(model.read());
if (['transfer-conflict','transfer-multiple'].includes(configScenario) && location.hash === '#booking-alisa') {
  const button = find('[data-open="booking"][data-profile-id="alisa"]');
  if (button) openBookingFor(button);
}

find('#wait-confirm').addEventListener('click', async () => {
  find('#wait-confirm').disabled = true;
  const channels = await getChannels();
  if (!channels || !channels.allowed.length || !channels.selected.length) { showWait(); return; }
  subscriptions.set(waitProfile,{deadline:new Date(Date.now() + model.readPolicy().waitingDays * 24 * 60 * 60 * 1000)});
  showWait();
  find('#wait-active [data-close]').focus();
});
window.addEventListener('focus', () => { if (find('#wait').open) showWait(); });
find('#wait-cancel').addEventListener('click', () => {
  subscriptions.delete(waitProfile);
  showWait(true);
  find('#wait-cancelled [data-close]').focus();
});

const navToggle = find('.reference-nav-toggle');
navToggle.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'false';
  navToggle.setAttribute('aria-expanded', String(expanded));
  find('#header-navigation').classList.toggle('show', expanded);
});

