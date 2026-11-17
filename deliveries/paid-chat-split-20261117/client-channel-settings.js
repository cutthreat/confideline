const $ = selector => document.querySelector(selector);
const params = new URLSearchParams(location.search);
const scenario = params.get('scenario') || '';
const scenarioSuffix = /^[a-z0-9-]{1,40}$/.test(scenario) ? '-' + scenario : '';
const storeKey = 'confideline-split-channels-v1' + scenarioSuffix;
const channelNames = {
  chat: 'События в чате',
  site: 'Уведомления сайта',
  email: 'Электронная почта',
};
const initial = {
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
      const settings = JSON.parse(localStorage.getItem('confideline-split-preview-v1-chat' + scenarioSuffix));
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
if ($('#admin-channel-form')) setupChannels($('#admin-channel-form'), true);
if ($('#client-channel-form')) setupChannels($('#client-channel-form'), false);
