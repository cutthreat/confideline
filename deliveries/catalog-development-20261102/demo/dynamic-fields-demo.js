(function () {
  'use strict';
  const root = document.querySelector('.cl-catalog');
  if (!root) return;
  const form = root.querySelector('#catalog-filter');
  const model = window.CatalogFilterModel;
  const data = window.CatalogFilterData;
  const english = new URLSearchParams(location.search).get('lang') === 'en';
  const areaEntries = Object.entries(model.profileLabels.areas).filter(([key]) => key !== 'palmistry');
  const topicEntries = Object.entries(model.profileLabels.topics).filter(([key]) => !['fortune', 'fertility', 'soulmate'].includes(key));
  model.areas.splice(0, model.areas.length, ...areaEntries.map(([key]) => key));
  model.topics.splice(0, model.topics.length, ...topicEntries.map(([key]) => key));
  function coreOptions(selector, name, entries) {
    const container = form.querySelector(selector);
    container.replaceChildren();
    for (const [key, label] of entries) {
      const wrapper = document.createElement('label'); wrapper.className = 'cl-chip';
      const input = document.createElement('input'); input.type = 'checkbox'; input.name = name; input.value = key;
      const visual = document.createElement('span'); visual.className = 'cl-option';
      const text = document.createElement('span'); text.className = 'cl-option-label'; text.textContent = label;
      const mark = document.createElement('span'); mark.className = 'cl-check'; mark.setAttribute('aria-hidden', 'true');
      const icon = document.createElement('i'); icon.className = 'fa fa-check'; mark.append(icon);
      visual.append(text, mark); wrapper.append(input, visual); container.append(wrapper);
    }
  }
  coreOptions('.cl-filter-areas .cl-options', 'areas', areaEntries);
  coreOptions('.cl-filter-topics .cl-options', 'topics', topicEntries);

  const fixtureDetails = {
    'demo-elena': { topics: ['love', 'career', 'partner'], consultations: 4200, languages: ['english', 'italian'], gender: 'female', age: 34, location: 'London' },
    'demo-marina': { topics: ['career', 'life-path', 'finances'], consultations: 1500, languages: ['english'], gender: 'female', age: 45, location: 'Paris' },
    'demo-anna': { consultations: 600, languages: ['spanish'], gender: 'female', age: 30, location: 'Madrid' },
    'demo-alex': { areas: ['clairvoyant', 'taro', 'psychic'], topics: ['finances', 'partner', 'career'], consultations: 2000, languages: ['english'], gender: 'male', age: 38, location: 'London' },
    'demo-sofia': { topics: ['love', 'partner', 'balance'], consultations: 80, languages: ['english', 'spanish'], gender: 'female', age: 26, location: 'Madrid' },
    'demo-maria': { areas: ['mediums', 'clairvoyant'], topics: ['family', 'love'], consultations: 500, languages: ['italian'], gender: 'female', age: 41, location: 'Rome' }
  };
  window.CatalogFilterFixtures = window.CatalogFilterFixtures.map(profile => ({ ...profile, ...(fixtureDetails[profile.id] || {}) }));

  const defaults = [
    { id: 'gender', label: english ? 'Gender' : 'Пол', type: 'select', searchable: true, property: 'gender', options: [['female', english ? 'Woman' : 'Женщина'], ['male', english ? 'Man' : 'Мужчина']] },
    { id: 'age_from', label: english ? 'Age from' : 'Возраст от', type: 'number', searchable: true, property: 'age', match: 'atLeast' },
    { id: 'age_to', label: english ? 'Age to' : 'Возраст до', type: 'number', searchable: true, property: 'age', match: 'atMost' },
    { id: 'location', label: english ? 'Location' : 'Местоположение', type: 'text', searchable: true, property: 'location', match: 'textContains' },
    { id: 'consultations', label: english ? 'Number of consultations' : 'Количество консультаций', type: 'select', searchable: true, searchablePremium: false, property: 'consultations', match: 'minimum', options: [['100', english ? 'More than 100' : 'Более 100'], ['1000', english ? 'More than 1,000' : 'Более 1 000'], ['4000', english ? 'More than 4,000' : 'Более 4 000']] },
    { id: 'experience', label: english ? 'Experience' : 'Опыт', type: 'select', searchable: true, searchablePremium: false, property: 'experience', match: 'minimum', options: [['1', english ? 'More than 1 year' : 'Более 1 года'], ['5', english ? 'More than 5 years' : 'Более 5 лет'], ['10', english ? 'More than 10 years' : 'Более 10 лет']] },
    { id: 'languages', label: english ? 'Languages' : 'Языки', type: 'select', searchable: true, searchablePremium: false, property: 'languages', match: 'contains', options: [['english', english ? 'English' : 'Английский'], ['italian', english ? 'Italian' : 'Итальянский'], ['spanish', english ? 'Spanish' : 'Испанский']] }
  ];
  const source = Array.isArray(window.CatalogDemoFieldConfig) ? window.CatalogDemoFieldConfig : defaults;
  const premium = window.CatalogDemoPremium === true;
  const fields = source.filter(field => field && (field.searchable === true || field.searchablePremium === true) && /^[a-z][a-z0-9_-]*$/.test(field.id) && ['select', 'text', 'number', 'checkbox'].includes(field.type));
  const body = form.querySelector('.cl-drawer-body');
  const section = document.createElement('section');
  section.className = 'cl-filter-group cl-extra-section';
  const sectionHeading = document.createElement('h3');
  sectionHeading.className = 'cl-extra-heading';
  sectionHeading.textContent = english ? 'Additional filters' : 'Дополнительные параметры';
  const extraFields = document.createElement('div');
  extraFields.className = 'cl-extra-fields';
  section.append(sectionHeading, extraFields);
  for (const field of fields) {
    const group = document.createElement('div'); group.className = 'cl-extra-field';
    group.dataset.wide = String(field.id === 'location' || field.label.length > 24);
    const label = document.createElement('label'); label.className = 'cl-extra-label'; label.htmlFor = 'demo-extra-' + field.id;
    const title = document.createElement('span'); title.textContent = field.label; label.append(title);
    const locked = field.searchablePremium === true && !premium;
    let control;
    if (field.type === 'select') {
      control = document.createElement('select');
      const empty = document.createElement('option'); empty.value = ''; empty.textContent = english ? 'Any' : 'Неважно'; control.append(empty);
      for (const [value, text] of field.options || []) {
        const option = document.createElement('option'); option.value = value; option.textContent = text; control.append(option);
      }
    } else {
      control = document.createElement('input'); control.type = field.type;
    }
    control.id = label.htmlFor; control.name = 'extra_' + field.id; control.className = 'cl-extra-control';
    control.disabled = locked; control.dataset.extraField = field.id;
    label.append(control); group.append(label);
    if (locked) {
      const hint = document.createElement('small'); hint.id = control.id + '-hint'; hint.textContent = english ? 'Premium only' : 'Только Premium';
      control.setAttribute('aria-describedby', hint.id); group.append(hint);
    }
    extraFields.append(group);
  }
  if (fields.length) body.append(section);
  const fieldMap = new Map(fields.map(field => [field.id, field]));
  const controlFor = id => form.querySelector('[data-extra-field="' + id + '"]');
  function allowed(field) { return field && (!field.searchablePremium || premium); }
  function valid(field, value) {
    if (field.type === 'select') return (field.options || []).some(option => String(option[0]) === value);
    if (field.type === 'checkbox') return value === '1';
    if (field.type === 'number') return /^\d{1,8}$/.test(value);
    return value.length > 0 && value.length <= 100;
  }
  function readDraft() {
    const selected = {};
    for (const field of fields) {
      const control = controlFor(field.id);
      if (!control || control.disabled) continue;
      const value = field.type === 'checkbox' ? (control.checked ? '1' : '') : control.value.trim();
      if (value && valid(field, value)) selected[field.id] = value;
    }
    return selected;
  }
  for (const field of fields) {
    const control = controlFor(field.id);
    for (const event of ['input', 'change']) control.addEventListener(event, () => control.setCustomValidity(''));
  }
  form.addEventListener('submit', event => {
    for (const field of fields) {
      const control = controlFor(field.id);
      if (!control || control.disabled) continue;
      const value = field.type === 'checkbox' ? (control.checked ? '1' : '') : control.value.trim();
      control.setCustomValidity(value && !valid(field, value) ? (english ? 'Enter a valid value.' : 'Введите корректное значение.') : '');
      if (!control.checkValidity()) {
        event.preventDefault(); event.stopImmediatePropagation(); control.focus(); control.reportValidity(); return;
      }
    }
  }, true);
  function restore(values = {}) {
    for (const field of fields) {
      const control = controlFor(field.id), value = values[field.id] || '';
      if (field.type === 'checkbox') control.checked = value === '1'; else control.value = value;
    }
  }
  function labelFor(id, value) {
    const field = fieldMap.get(id);
    const option = (field?.options || []).find(entry => String(entry[0]) === value);
    return field ? field.label + ': ' + (option ? option[1] : value) : value;
  }
  function clearField(id) {
    const control = controlFor(id);
    if (!control) return;
    if (control.type === 'checkbox') control.checked = false; else control.value = '';
  }
  const originalRead = model.readQuery, originalWrite = model.writeQuery;
  const previewKeys = ['preview', 'onlineOnly', 'hideDirectory', 'hideProfiles', 'hideFields', 'sourceFailure', 'searchFailure'];
  model.readQuery = function (search) {
    const params = new URLSearchParams(search), extras = {}, invalid = [];
    for (const name of previewKeys) params.delete(name);
    for (const name of [...new Set(params.keys())]) {
      if (!name.startsWith('x_')) continue;
      const id = name.slice(2), field = fieldMap.get(id), values = params.getAll(name);
      if (!allowed(field) || values.length !== 1 || !valid(field, values[0])) invalid.push(name);
      else extras[id] = values[0];
      params.delete(name);
    }
    const result = originalRead(params.toString());
    return { ...result, extras, invalid: [...new Set([...result.invalid, ...invalid])] };
  };
  model.writeQuery = function (state) {
    const params = new URLSearchParams(originalWrite(state));
    const original = new URLSearchParams(location.search);
    if (original.get('preview') === '1') {
      for (const name of previewKeys) if (original.has(name)) params.set(name, original.get(name));
    }
    for (const id of Object.keys(state.extras || {}).sort()) {
      const field = fieldMap.get(id), value = String(state.extras[id]);
      if (allowed(field) && valid(field, value)) params.set('x_' + id, value);
    }
    return params.toString();
  };
  const originalDemo = data.demo;
  data.demo = profiles => async query => {
    if (window.CatalogDemoSourceFailure) throw new Error('Synthetic availability source failure');
    if (window.CatalogDemoSearchFailure && (query.areas.length || query.topics.length || Object.keys(query.extras || {}).length)) throw new Error('Synthetic search failure');
    const visible = profiles.filter(profile => Object.entries(query.extras || {}).every(([id, value]) => {
      const field = fieldMap.get(id), actual = profile[field.property];
      if (field.match === 'minimum') return Number.isFinite(actual) && actual > Number(value);
      if (field.match === 'atLeast') return Number.isFinite(actual) && actual >= Number(value);
      if (field.match === 'atMost') return Number.isFinite(actual) && actual <= Number(value);
      if (field.match === 'textContains') return typeof actual === 'string' && actual.toLocaleLowerCase().includes(value.toLocaleLowerCase());
      if (field.match === 'contains') return Array.isArray(actual) && actual.includes(value);
      return String(actual ?? '') === value;
    }));
    return originalDemo(visible)(query);
  };
  window.CatalogDynamicDemo = { readDraft, restore, labelFor, clearField, fields };
})();
