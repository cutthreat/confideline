const reference = document.querySelector('.chat-v2-reference');
const find = selector => reference.querySelector(selector);
find('.demo-bar').hidden = new URLSearchParams(location.search).get('test') !== '1';
const workspace = find('.chat-layout');
const tabs = [...reference.querySelectorAll('[role="tab"]')];
const mobileLayout = window.matchMedia('(max-width: 600px)');
const bookingAlert = find('#next-booking-alert');
const chatList = find('.chat-list');
const messages = find('.messages');
const draft = find('#draft-message');
const demoTime = find('#demo-time');
const demoError = find('#demo-error');
const initialThread = 'mikhail-vera';
const threads = new Map([
  [initialThread, {
    profile: 'Вера Ланская', client: 'Михаил К.', number: 83,
    history: [
      {text: 'Здравствуйте! Хочу обсудить один вопрос.', time: '14:49'},
      {text: 'Здравствуйте, Михаил. Расскажите, пожалуйста, подробнее.', time: '14:50', outgoing: true},
      {text: 'Спасибо. Хочу обсудить ещё один вопрос.', time: '14:52'},
    ],
  }],
  ['lidia-vera', {
    profile: 'Вера Ланская', client: 'Лидия М.', number: 96,
    history: [
      {text: 'Здравствуйте! Когда вам будет удобно поговорить?', time: '14:35'},
    ],
  }],
  ['lidia-alisa', {
    profile: 'Алиса Берг', client: 'Лидия М.', history: [], ping: true, pingTime: '14:46',
  }],
  ['pavel-alisa', {
    profile: 'Алиса Берг', client: 'Павел Н.', history: [], ping: true, pingTime: '14:50',
  }],
]);
const bookings = new Map();
const bookingStages = [
  {status: 'Ожидает подтверждения', action: 'Павел отправил заявку', at: '14:54'},
  {status: 'Ожидает оплаты', action: 'Агент подтвердил заявку', at: '14:55'},
  {status: 'Подтверждена', action: 'Клиент оплатил заявку', at: '14:56'},
  {status: 'Перенесена по согласию клиента', action: 'Клиент согласился на перенос', at: '14:57'},
  {status: 'Отменена', action: 'Отменить учебную запись', at: '14:58'},
];
const clockLabel = () => ({early: '14:54', ongoing: '14:55', starting: '14:58', none: '15:00'}[demoTime.value]);
let activeThread = initialThread;
let nextConversation = 101;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function isLive(id) {
  return id === initialThread && demoTime.value !== 'early';
}

function placeAlert() {
  if (mobileLayout.matches && workspace.dataset.mobile === 'list') chatList.prepend(bookingAlert);
  else messages.before(bookingAlert);
}

function selectTab(tab, moveFocus = false) {
  for (const item of tabs) {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  }
  if (moveFocus) tab.focus();
}

function openList(tabId) {
  workspace.dataset.mobile = 'list';
  placeAlert();
  selectTab(find(tabId), true);
}

function showConversation() {
  workspace.dataset.mobile = 'conversation';
  placeAlert();
}

function openThread(id) {
  activeThread = id;
  showConversation();
  renderConversation();
  renderLists();
  find('#conversation-title').focus();
}

function renderLists() {
  const chatRows = find('#chat-rows');
  const pingRows = find('#ping-rows');
  const waiting = [...threads].filter(([, thread]) => !thread.number && thread.ping);
  chatRows.replaceChildren();
  pingRows.replaceChildren();
  for (const [id, thread] of [...threads].filter(([, item]) => item.number).sort((a, b) => (b[1].lastActivity || 0) - (a[1].lastActivity || 0))) {
    const button = element('button', '', 'conversation-row');
    button.type = 'button';
    if (id === activeThread) button.setAttribute('aria-current', 'true');
    button.dataset.thread = id;
    const avatar = element('span', thread.client[0], 'avatar');
    avatar.setAttribute('aria-hidden', 'true');
    const details = element('span');
    const lastMessage = thread.history.at(-1);
    const preview = lastMessage?.kind === 'system' ? 'Системное событие · ' + lastMessage.text : lastMessage?.text;
    details.append(element('strong', thread.client + ' · ' + thread.profile), element('small', preview));
    if (isLive(id)) details.append(element('span', 'Live', 'pill'));
    button.append(avatar, details, element('time', lastMessage?.time));
    chatRows.append(button);
  }
  for (const [id, thread] of waiting) {
    const button = element('button', '', 'conversation-row');
    button.type = 'button';
    button.dataset.thread = id;
    button.setAttribute('aria-label', 'Открыть диалог: ' + thread.client + ' · ' + thread.profile);
    const avatar = element('span', thread.client[0], 'avatar violet');
    avatar.setAttribute('aria-hidden', 'true');
    if (id === activeThread) button.setAttribute('aria-current', 'true');
    const details = element('span');
    details.append(element('strong', thread.client), element('small', 'Новый Ping'));
    button.append(avatar, details, element('time', thread.pingTime));
    pingRows.append(button);
  }
  find('#ping-empty').hidden = waiting.length !== 0;
}

function renderConversation() {
  const thread = threads.get(activeThread);
  find('#profile-initial').hidden = !thread;
  find('.session').hidden = !thread;
  find('.compose').hidden = !thread;
  if (!thread) {
    find('#conversation-title').textContent = 'Выберите разговор';
    find('#conversation-number').textContent = '';
    find('#related-booking').hidden = true;
    messages.replaceChildren(element('p', 'Выберите разговор.', 'empty'));
    return;
  }
  find('#profile-initial').textContent = thread.profile[0];
  find('#conversation-title').textContent = thread.profile + ' → ' + thread.client;
  find('#conversation-number').textContent = thread.number ? 'Разговор № ' + thread.number : 'Новый диалог';
  find('#session-label').textContent = isLive(activeThread) ? 'Платная консультация' : 'Обычный чат';
  const booking = bookings.get(activeThread);
  const relatedBooking = find('#related-booking');
  relatedBooking.hidden = !booking;
  if (booking) relatedBooking.textContent = 'Запись № ' + booking.number + ' · ' + bookingStages[booking.stage].status + ' · Управление в разделе «Записи»';
  draft.value = thread.draft || '';
  find('#send-error').textContent = '';
  find('#send-status').textContent = '';
  draft.removeAttribute('aria-invalid');
  messages.replaceChildren();
  if (!thread.history.length) {
    messages.append(element('p', 'В этом диалоге пока нет сообщений.', 'empty'));
    return;
  }
  messages.append(element('div', '11.11.2026', 'day'));
  for (const message of thread.history) {
    if (message.kind === 'system') {
      const event = element('p', '', 'event system-event');
      event.append(element('span', 'Системное событие', 'system-label'), element('span', message.text), element('time', ' ' + message.time));
      messages.append(event);
      continue;
    }
    const bubble = element('article', '', message.outgoing ? 'bubble outgoing' : 'bubble');
    bubble.append(element('p', message.text), element('time', message.time));
    messages.append(bubble);
  }
  if (isLive(activeThread)) messages.append(element('p', '▶ Платная консультация началась', 'event'));
  messages.scrollTop = messages.scrollHeight;
}

for (const tab of tabs) {
  tab.addEventListener('click', () => openList('#' + tab.id));
  tab.addEventListener('keydown', event => {
    const index = tabs.indexOf(tab);
    const destination = {
      ArrowLeft: (index + tabs.length - 1) % tabs.length,
      ArrowRight: (index + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }[event.key];
    if (destination === undefined) return;
    event.preventDefault();
    selectTab(tabs[destination], true);
  });
}

chatList.addEventListener('click', event => {
  const button = event.target.closest('[data-thread]');
  if (button) openThread(button.dataset.thread);
});

find('#open-chats').addEventListener('click', () => openList('#tab-chats'));
find('#open-pings').addEventListener('click', () => openList('#tab-pings'));
draft.addEventListener('input', () => {
  threads.get(activeThread).draft = draft.value;
  find('#send-error').textContent = '';
  draft.removeAttribute('aria-invalid');
});
find('.compose').addEventListener('submit', event => {
  event.preventDefault();
  const text = draft.value.trim();
  const error = find('#send-error');
  if (!text) {
    draft.setAttribute('aria-invalid', 'true');
    error.textContent = 'Введите сообщение.';
    draft.focus();
    return;
  }
  if (demoError.checked) {
    demoError.checked = false;
    error.textContent = 'Сообщение не отправлено. Попробуйте ещё раз.';
    return;
  }
  const thread = threads.get(activeThread);
  const inPing = !thread.number && thread.ping;
  thread.history.push({text, time: clockLabel(), outgoing: true});
  thread.lastActivity = Date.now();
  thread.draft = '';
  renderLists();
  renderConversation();
  selectTab(find(inPing ? '#tab-pings' : '#tab-chats'));
  find('#send-status').textContent = 'Сообщение отправлено.';
  draft.focus();
});

function promoteToChat(thread) {
  if (thread.number) return;
  thread.number = nextConversation++;
  thread.ping = false;
}

find('#demo-no-thread').addEventListener('click', () => {
  activeThread = null;
  renderLists();
  renderConversation();
  find('#demo-feedback').textContent = 'Беседа не выбрана.';
});

find('#demo-client-reply').addEventListener('click', event => {
  const id = 'pavel-alisa';
  const thread = threads.get(id);
  promoteToChat(thread);
  thread.history.push({text:'Здравствуйте! Да, хочу поговорить.', time:clockLabel()});
  thread.lastActivity = Date.now();
  event.currentTarget.disabled = true;
  selectTab(find('#tab-chats'));
  openThread(id);
  find('#demo-feedback').textContent = 'Павел ответил. Разговор находится во вкладке «Чаты».';
});

find('#demo-booking').addEventListener('click', event => {
  const id = 'pavel-alisa';
  const thread = threads.get(id);
  const previous = bookings.get(id);
  const stage = previous ? previous.stage + 1 : 0;
  const step = bookingStages[stage];
  const moved = stage >= 3;
  const booking = {number: 302, date: moved ? '19 ноября' : '18 ноября', time: moved ? '16:00' : '15:00', end: moved ? '16:30' : '15:30', zone: 'Минск', stage};
  bookings.set(id, booking);
  promoteToChat(thread);
  const interval = booking.time + '–' + booking.end;
  const lastStage = stage === bookingStages.length - 1;
  const text = 'Запись № ' + booking.number + ' · ' + step.status + '. ' + booking.date + ', ' + booking.time + ' (' + booking.zone + '). '
    + (lastStage ? 'Интервал в графике освобождён: ' : 'Плановый интервал в графике: ') + interval + '.';
  thread.history.push({text, time: step.at, kind: 'system'});
  thread.lastActivity = Date.now();
  event.currentTarget.disabled = lastStage;
  event.currentTarget.textContent = bookingStages[stage + 1]?.action || 'Учебная запись отменена';
  selectTab(find('#tab-chats'));
  openThread(id);
  find('#demo-feedback').textContent = text;
});

function renderDemoTime() {
  const activeElement = document.activeElement;
  renderLists();
  if (!activeElement?.isConnected) find('[aria-selected="true"]').focus();
  renderConversation();
  const minutes = { ongoing: 5, starting: 2 }[demoTime.value];
  if (!minutes) {
    bookingAlert.replaceChildren();
    return;
  }
  bookingAlert.replaceChildren(
    element('strong', 'Следующая запись через ' + (minutes === 5 ? '5 минут' : '2 минуты')),
    element('span', 'Сегодня, 15:00 · Алиса Берг · клиент Анна Р.'),
    element('span', 'Завершите консультацию с Михаилом К. к началу записи.'),
  );
}

mobileLayout.addEventListener('change', placeAlert);
demoTime.addEventListener('change', renderDemoTime);
window.addEventListener('pageshow', renderDemoTime);
