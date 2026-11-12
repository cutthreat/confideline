const $ = selector => document.querySelector(selector);
const params = new URLSearchParams(location.search);
const scenario = params.get('scenario') || '';
const scenarioSuffix = /^[a-z0-9-]{1,40}$/.test(scenario) ? '-' + scenario : '';
const storeKey = 'confideline-settings-reference-v1' + scenarioSuffix;
const channelNames = {
  chat: 'События в чате',
  site: 'Уведомления сайта',
  email: 'Электронная почта',
};
const statusNames = {online: 'Онлайн', busy: 'Занят', offline: 'Не в сети'};
const actionNames = {
  chat: 'Открыть обычный чат',
  wait: 'Открыть окно уведомления',
  booking: 'Открыть окно записи',
  link: 'Перейти по ссылке',
};
// Demonstration values for the existing site-wide translation workflow.
// The real translations must come from the site's language catalogue.
const buttonTranslations = {
  chat: {source: 'Start chat', ru: 'Начать чат'},
  wait: {source: 'Notify me when available', ru: 'Уведомить, когда освободится'},
  booking: {source: 'Book a time', ru: 'Забронировать время'},
};
const initial = {
  paid: 'enabled',
  obligations: [
    ['Консультация № 120', 'Идёт сейчас'],
    ['Заявка № 302', 'Ожидает подтверждения'],
    ['Заявка № 304', 'Ожидает оплаты'],
    ['Запись № 306', 'Подтверждена'],
  ],
  buttons: [
    {id: 'chat', name: 'Чат', action: 'chat', url: '', statuses: ['online']},
    {id: 'wait', name: 'Уведомление', action: 'wait', url: '', statuses: ['busy']},
    {id: 'booking', name: 'Бронирование', action: 'booking', url: '', statuses: ['offline']},
  ],
  allowed: Object.keys(channelNames),
  preferred: ['site'],
  preferredAvailability: ['site'],
};
let state = structuredClone(initial);
try {
  if (params.get('reset') === '1') localStorage.removeItem(storeKey);
} catch {}
function readState() {
  try { return JSON.parse(localStorage.getItem(storeKey)) || state; } catch { return state; }
}
state = readState();
function save(changes) {
  const next = {...readState(), ...changes};
  try {
    localStorage.setItem(storeKey, JSON.stringify(next));
    state = next;
    return true;
  } catch { return false; }
}
function create(tag, text, className) {
  const item = document.createElement(tag);
  if (text) item.textContent = text;
  if (className) item.className = className;
  return item;
}
function setupShell() {
  document.querySelectorAll('a[aria-disabled="true"]').forEach(link => link.addEventListener('click', event => event.preventDefault()));
  const toggle = $('.sidebar-toggle');
  if (toggle) {
    toggle.addEventListener('click', event => {
      event.preventDefault();
      const mobile = matchMedia('(max-width: 767px)').matches;
      const active = document.body.classList.toggle(mobile ? 'sidebar-open' : 'sidebar-collapse');
      toggle.setAttribute('aria-expanded', String(mobile ? active : !active));
    });
  }
  $('.reference-nav-toggle')?.addEventListener('click', event => {
    const expanded = event.currentTarget.getAttribute('aria-expanded') === 'false';
    event.currentTarget.setAttribute('aria-expanded', String(expanded));
    $('#header-navigation').classList.toggle('show', expanded);
  });
  $('.client-settings-reference .btn-toggle-sidebar')?.addEventListener('click', event => {
    const menu = $('.client-settings-reference .sidebar-menu');
    const expanded = menu.classList.toggle('d-none') === false;
    event.currentTarget.setAttribute('aria-expanded', String(expanded));
  });
}
function setupPaid(form) {
  const toggle = $('#paid-enabled');
  const feedback = $('#paid-feedback');
  if (params.get('settled') === '1' && state.paid === 'draining') {
    save({obligations: [], paid: 'disabled'});
  }
  function renderHint() {
    let text = 'Обычная переписка доступна. Действующие консультации и записи доводятся до результата.';
    if (state.paid === 'draining') text = 'Новые платные консультации и заявки остановлены. Существующие записи и оплаты обрабатываются по прежним условиям.';
    if (!toggle.checked && state.paid === 'enabled' && state.obligations.length) text = 'После сохранения новые заявки будут остановлены. Текущие консультации и записи сохранятся.';
    if (toggle.checked && state.paid !== 'enabled') text = 'После сохранения новые платные действия снова станут доступны по правилам сайта.';
    $('#paid-hint').textContent = text;
  }
  function render() {
    toggle.checked = state.paid === 'enabled';
    const status = $('#paid-status');
    status.textContent = {enabled: 'Включён', draining: 'Завершение обязательств', disabled: 'Выключен'}[state.paid];
    status.dataset.state = state.paid;
    renderHint();
    const panel = $('#paid-obligations');
    panel.hidden = state.paid !== 'draining';
    $('#obligation-list').replaceChildren(...state.obligations.map(([title, detail]) => {
      const row = create('li', '', 'list-group-item');
      row.append(create('strong', title), create('span', detail));
      return row;
    }));
  }
  toggle.addEventListener('change', () => {
    feedback.textContent = '';
    renderHint();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const paid = toggle.checked ? 'enabled' : readState().obligations.length ? 'draining' : 'disabled';
    if (!save({paid})) {
      feedback.textContent = 'Не удалось сохранить настройку. Попробуйте ещё раз.';
      return;
    }
    render();
    feedback.textContent = 'Настройка сохранена.';
  });
  render();
}
function checkbox(name, text, checked) {
  const label = create('label', '', 'setting-check');
  const input = create('input');
  input.type = 'checkbox';
  input.name = name;
  input.value = name;
  input.checked = checked;
  label.append(input, document.createTextNode(text));
  return label;
}
function field(labelText, control) {
  const label = create('label', labelText, 'setting-field');
  control.className = 'form-control';
  label.append(control);
  return label;
}
function buttonConfig(button) {
  const section = create('fieldset', '', 'button-settings');
  section.dataset.button = button.id;
  section.append(create('legend', button.name));
  const fields = create('div', '', 'button-settings-fields');
  const action = create('select');
  action.name = 'action';
  for (const [value, label] of Object.entries(actionNames)) action.add(new Option(label, value, false, value === button.action));
  fields.append(field('Действие', action));
  const caption = create('output', buttonTranslations[button.id].ru);
  caption.name = 'caption';
  const captionField = create('div', '', 'caption-field');
  captionField.append(field('Подпись', caption));
  const captionHelp = create('small', '', 'caption-translation');
  captionHelp.append(document.createTextNode('Исходник: ' + buttonTranslations[button.id].source + ' · '));
  const translationsLink = create('a', 'Языки');
  translationsLink.href = 'https://confideline.com/ru/admin/language/list';
  translationsLink.target = '_blank';
  translationsLink.rel = 'noopener noreferrer';
  captionHelp.append(translationsLink);
  captionField.append(captionHelp);
  fields.append(captionField);
  const url = create('input');
  url.name = 'url';
  url.value = button.url;
  const linkField = field('Адрес ссылки', url);
  linkField.hidden = button.action !== 'link';
  fields.append(linkField);
  const statuses = create('fieldset', '', 'status-fields');
  statuses.append(create('legend', 'Показывать при статусах'));
  for (const [value, label] of Object.entries(statusNames)) statuses.append(checkbox(value, label, button.statuses.includes(value)));
  section.append(fields, statuses);
  return section;
}
function setupButtons(form) {
  const fields = $('#button-fields');
  fields.replaceChildren(...state.buttons.map(buttonConfig));
  const feedback = $('#buttons-feedback');
  const previewAction = $('#preview-action');
  const status = $('#preview-status');
  function readButtons() {
    return state.buttons.map(item => {
      const section = fields.querySelector('[data-button="' + item.id + '"]');
      const value = name => section.querySelector('[name="' + name + '"]').value.trim();
      const statuses = [...section.querySelectorAll('input[type="checkbox"]:checked')].map(input => input.value);
      const {ru, en, ...saved} = item; // Ignore legacy mock-only translations.
      return {...saved, action: value('action'), url: value('url'), statuses};
    });
  }
  function renderPreview() {
    const preview = $('#preview-buttons');
    previewAction.textContent = '';
    const buttons = readButtons().filter(button => button.statuses.includes(status.value));
    preview.replaceChildren(...buttons.map(button => {
      const element = create('button', buttonTranslations[button.id].ru, 'btn btn-default');
      element.type = 'button';
      element.addEventListener('click', () => {
        previewAction.textContent = 'Действие: ' + actionNames[button.action] + (button.action === 'link' && button.url ? ' · ' + button.url : '');
      });
      return element;
    }));
    if (!buttons.length) preview.append(create('p', 'Нет кнопок для этого статуса.'));
  }
  fields.addEventListener('input', event => {
    feedback.textContent = '';
    if (event.target.name === 'action') {
      const url = event.target.closest('[data-button]').querySelector('[name="url"]');
      url.closest('label').hidden = event.target.value !== 'link';
    }
    renderPreview();
  });
  status.addEventListener('change', renderPreview);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const buttons = readButtons();
    const invalid = buttons.find(button => button.action === 'link' && !validLink(button.url));
    if (invalid) {
      feedback.textContent = invalid.name + ': укажите корректный адрес.';
      fields.querySelector('[data-button="' + invalid.id + '"] [name="url"]').focus();
      return;
    }
    if (!save({buttons})) {
      feedback.textContent = 'Не удалось сохранить настройки. Попробуйте ещё раз.';
      return;
    }
    feedback.textContent = 'Настройки сохранены.';
    renderPreview();
  });
  renderPreview();
}
function validLink(value) {
  if (/^\/(?![\/\\])\S*$/.test(value)) return true;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}
function setupChannels(form, admin) {
  const fields = form.querySelector(admin ? 'fieldset' : '#client-channel-fields');
  const availabilityFields = admin ? null : form.querySelector('#client-availability-fields');
  const originalSettings = [...form.querySelectorAll('input[data-original-setting]')];
  for (const input of originalSettings) {
    if (typeof state.originalEmailSettings?.[input.dataset.originalSetting] === 'boolean') {
      input.checked = state.originalEmailSettings[input.dataset.originalSetting];
    }
  }
  function optionalAvailable(type = 'booking') {
    try {
      const settings = JSON.parse(localStorage.getItem('confideline-integrated-settings-v2-chat' + scenarioSuffix));
      const prefix = type === 'availability' ? 'available' : 'booking';
      if (settings) return ['site', 'email'].filter(channel => settings[prefix + (channel === 'site' ? 'Site' : 'Email')] !== false);
    } catch {}
    return ['site', 'email'];
  }
  function render() {
    fields.querySelectorAll('label, p').forEach(item => item.remove());
    const available = admin ? ['site', 'email'] : optionalAvailable();
    const chosen = admin ? state.allowed : state.preferred;
    for (const channel of available) {
      if (admin) {
        fields.append(checkbox(channel, channelNames[channel], chosen.includes(channel)));
      } else {
        const label = create('label', '', 'custom-control custom-checkbox');
        const input = create('input', '', 'custom-control-input');
        input.type = 'checkbox'; input.value = channel; input.checked = chosen.includes(channel);
        label.append(input, create('span', channelNames[channel], 'custom-control-label'));
        fields.append(label);
      }
    }
    if (!available.length) fields.append(create('p', 'Другие способы уведомлений сейчас недоступны.'));
    if (availabilityFields) {
      availabilityFields.querySelectorAll('label, p').forEach(item => item.remove());
      const availableForWait = optionalAvailable('availability');
      const selectedForWait = Array.isArray(state.preferredAvailability) ? state.preferredAvailability : ['site'];
      for (const channel of availableForWait) {
        const label = create('label', '', 'custom-control custom-checkbox');
        const input = create('input', '', 'custom-control-input');
        input.type = 'checkbox'; input.value = channel; input.checked = selectedForWait.includes(channel);
        label.append(input, create('span', channelNames[channel], 'custom-control-label'));
        availabilityFields.append(label);
      }
      if (!availableForWait.length) availabilityFields.append(create('p', 'Уведомления о доступности сейчас недоступны.'));
    }
  }
  render();
  form.addEventListener('submit', event => {
    event.preventDefault();
    const selected = [...fields.querySelectorAll('input:checked')].map(input => input.value);
    const saved = admin
      ? save({allowed: selected})
      : save({
          preferred: selected.filter(channel => optionalAvailable().includes(channel)),
          preferredAvailability: [
            ...(Array.isArray(state.preferredAvailability) ? state.preferredAvailability : ['site']).filter(channel => !optionalAvailable('availability').includes(channel)),
            ...[...availabilityFields.querySelectorAll('input:checked')].map(input => input.value).filter(channel => optionalAvailable('availability').includes(channel)),
          ],
          originalEmailSettings: Object.fromEntries(originalSettings.map(input => [input.dataset.originalSetting, input.checked])),
        });
    if (!saved) {
      $('#channel-feedback').textContent = 'Не удалось сохранить настройки. Попробуйте ещё раз.';
      return;
    }
    render();
    $('#channel-feedback').textContent = 'Настройки сохранены.';
  });
}
setupShell();
if ($('#paid-form')) setupPaid($('#paid-form'));
if ($('#buttons-form')) setupButtons($('#buttons-form'));
if ($('#admin-channel-form')) setupChannels($('#admin-channel-form'), true);
if ($('#client-channel-form')) setupChannels($('#client-channel-form'), false);

