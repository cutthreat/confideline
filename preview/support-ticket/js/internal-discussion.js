(function () {
  'use strict';
  var panel = document.getElementById('ticket-discussion');
  if (!panel) return;
  var layout = document.querySelector('.ticket-discussion-layout');
  var openButton = document.getElementById('ticket-discussion-open');
  var input = document.getElementById('ticket-discussion-input');
  var send = document.getElementById('ticket-discussion-send');
  var log = document.getElementById('ticket-discussion-log');
  var draftStatus = document.getElementById('ticket-discussion-draft');
  var active = 'agent';
  var drafts = { agent: '', senior: '' };
  var key = 'support-ticket-demo-discussion-1';
  var demo = document.documentElement.getAttribute('data-support-demo') === 'true';
  var threads = demo ? {
    agent: [
      { author: 'Chapajev Wasil · Модератор', time: '11:18', text: 'Елена, клиент оплатил подписку, но доступ к группе не появился. Можете проверить, отображается ли он среди участников?', self: true },
      { author: 'Елена · Агент', time: '11:24', text: 'Проверила. В списке участников его нет. Подписка на группу доступна, ограничений с моей стороны нет.', self: false }
    ], senior: []
  } : { agent: [], senior: [] };
  var unread = demo ? 1 : 0;
  if (demo) { try { var stored = JSON.parse(sessionStorage.getItem(key) || '{}'); drafts.agent = stored.agent || ''; drafts.senior = stored.senior || ''; } catch (e) {} }
  function save() { if (demo) { try { sessionStorage.setItem(key, JSON.stringify(drafts)); } catch (e) {} } }
  function updateUnread() {
    var badge = document.getElementById('ticket-discussion-count');
    badge.textContent = unread;
    badge.hidden = !unread;
    document.getElementById('discussion-agent-unread').hidden = !unread;
  }
  function render() {
    log.replaceChildren();
    threads[active].forEach(function (item) {
      var article = document.createElement('article');
      article.className = 'ticket-discussion-message' + (item.self ? ' is-self' : '');
      var header = document.createElement('header');
      var author = document.createElement('strong'); author.textContent = item.author;
      var time = document.createElement('time'); time.textContent = item.time;
      header.append(author, time);
      var body = document.createElement('p'); body.textContent = item.text;
      article.append(header, body); log.append(article);
    });
    if (!threads[active].length) {
      var empty = document.createElement('p'); empty.className = 'ticket-discussion-empty';
      empty.textContent = 'Обсуждение ещё не начато. Напишите адресату, чтобы уточнить вопрос по этому тикету.';
      log.append(empty);
    }
    input.value = drafts[active]; send.disabled = !demo || !input.value.trim();
    document.getElementById('ticket-discussion-label').textContent = active === 'agent' ? 'Сообщение агенту · Елена' : 'Сообщение старшему модератору';
    document.getElementById('ticket-discussion-audience').textContent = active === 'agent' ? 'Участники: Chapajev Wasil, агент Елена' : 'Участники: Chapajev Wasil, старший модератор';
    log.setAttribute('aria-labelledby', active === 'agent' ? 'discussion-agent-tab' : 'discussion-senior-tab');
    document.querySelectorAll('[data-discussion-thread]').forEach(function (tab) { tab.setAttribute('aria-selected', String(tab.dataset.discussionThread === active)); });
    draftStatus.textContent = 'Только участникам диалога';
    if (active === 'agent') { unread = 0; updateUnread(); }
    log.scrollTop = log.scrollHeight;
  }
  function toggle(open) {
    var originalPanel = document.getElementById('ticket-side-panel');
    originalPanel.classList.remove('is-scroll-fixed');
    originalPanel.style.top = ''; originalPanel.style.left = ''; originalPanel.style.width = '';
    var placeholder = layout.querySelector('.ticket-side-panel-sticky-placeholder');
    if (placeholder) { placeholder.hidden = true; placeholder.style.height = ''; }
    panel.hidden = !open; layout.classList.toggle('discussion-open', open);
    openButton.setAttribute('aria-expanded', String(open));
    if (open) { render(); input.focus({ preventScroll: true }); }
    else { layout.classList.remove('discussion-wide'); openButton.focus({ preventScroll: true }); }
    window.dispatchEvent(new Event('resize'));
  }
  openButton.addEventListener('click', function () { toggle(panel.hidden); });
  document.getElementById('ticket-discussion-close').addEventListener('click', function () { toggle(false); });
  document.getElementById('ticket-discussion-expand').addEventListener('click', function () {
    var wide = layout.classList.toggle('discussion-wide');
    this.title = wide ? 'Уменьшить обсуждение' : 'Расширить обсуждение'; this.setAttribute('aria-label', this.title);
  });
  document.querySelectorAll('[data-discussion-thread]').forEach(function (tab) { tab.addEventListener('click', function () { drafts[active] = input.value; save(); active = tab.dataset.discussionThread; render(); }); });
  input.addEventListener('input', function () { drafts[active] = input.value; save(); send.disabled = !demo || !input.value.trim(); draftStatus.textContent = 'Черновик сохранён'; });
  document.getElementById('ticket-discussion-form').addEventListener('submit', function (event) {
    event.preventDefault();
    if (!demo || !input.value.trim()) return;
    threads[active].push({ author: 'Chapajev Wasil · Модератор', time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }), text: input.value.trim(), self: true });
    drafts[active] = ''; save(); render();
  });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !panel.hidden) toggle(false); });
  updateUnread();
})();
