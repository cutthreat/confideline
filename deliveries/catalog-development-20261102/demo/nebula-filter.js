(function () {
  'use strict';
  const desktop = matchMedia('(min-width: 576px) and (pointer: fine)');
  const en = document.documentElement.lang.toLowerCase().startsWith('en');
  const words = en
    ? { topic: 'Topic', extra: 'Refine criteria', submit: 'Show experts', count: n => n + ' selected' }
    : { topic: 'Тема вопроса', extra: 'Уточнить критерии', submit: 'Показать экспертов', count: n => 'выбрано: ' + n };

  function optionSearch(group) {
    const more = group.querySelector('.cl-options-more');
    const options = group.querySelector('.cl-options');
    const labels = [...(options?.querySelectorAll(':scope > .cl-chip') || [])];
    if (!more || labels.length < 10) return null;
    const topic = group.classList.contains('cl-filter-topics');
    const name = en ? (topic ? 'Search topics' : 'Search specialties')
      : (topic ? 'Найти тему' : 'Найти направление');
    const box = document.createElement('div');
    box.className = 'nb-option-search';
    const icon = document.createElement('i');
    icon.className = 'fa fa-search';
    icon.setAttribute('aria-hidden', 'true');
    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = name;
    input.setAttribute('aria-label', name);
    input.setAttribute('aria-controls', options.id);
    input.autocomplete = 'off';
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'nb-search-clear';
    clear.setAttribute('aria-label', en ? 'Clear search' : 'Очистить поиск');
    clear.title = clear.getAttribute('aria-label');
    const cross = document.createElement('i');
    cross.className = 'fa fa-times';
    cross.setAttribute('aria-hidden', 'true');
    clear.append(cross);
    const status = document.createElement('p');
    status.className = 'nb-search-status';
    status.setAttribute('role', 'status');
    box.append(icon, input, clear);
    options.before(box, status);

    function render() {
      const expanded = more.getAttribute('aria-expanded') === 'true';
      box.hidden = !desktop.matches || !expanded;
      const query = input.value.trim().toLocaleLowerCase();
      clear.hidden = !query;
      status.hidden = !desktop.matches || !expanded || !query;
      if (!desktop.matches) return;
      let matches = 0;
      for (const [index, label] of labels.entries()) {
        const matched = label.textContent.toLocaleLowerCase().includes(query);
        if (matched) matches++;
        label.hidden = expanded ? !matched : index >= 6 && !label.querySelector('input').checked;
      }
      status.textContent = matches
        ? (en ? 'Options found: ' : 'Найдено вариантов: ') + matches
        : (en ? 'No matching options' : 'Совпадений нет');
    }
    function reset() {
      input.value = '';
      render();
    }
    input.addEventListener('input', render);
    // This search narrows available labels, never the catalog query itself.
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter' || (event.key === 'Escape' && input.value)) {
        event.preventDefault();
        event.stopPropagation();
        if (event.key === 'Escape') reset();
      }
    });
    clear.addEventListener('click', () => { reset(); input.focus(); });
    more.addEventListener('click', () => {
      reset();
      if (desktop.matches && more.getAttribute('aria-expanded') === 'true') input.focus();
    });
    group.addEventListener('change', render);
    desktop.addEventListener('change', () => {
      reset();
      group.dispatchEvent(new Event('change'));
    });
    render();
    return { reset };
  }

  function selectChoice(select, { icons, name } = {}) {
    const options = [...select.options];
    const source = select.closest('label');
    const title = source?.querySelector('span');
    if (!title || select.multiple || options.length < 2 || options.length > 5 ||
        new Set(options.map(option => option.value)).size !== options.length ||
        (icons && (options.length !== icons.size || options.some(option => !icons.has(option.value))))) return null;

    const view = document.createElement('fieldset');
    view.className = icons ? 'nb-gender' : 'nb-choice-list';
    const legend = document.createElement('legend');
    legend.textContent = name || title.textContent;
    if (select.hasAttribute('aria-describedby')) {
      view.setAttribute('aria-describedby', select.getAttribute('aria-describedby'));
    }
    const row = document.createElement('div');
    row.className = icons ? 'nb-gender-options' : 'nb-choice-options';
    const radios = options.map(option => {
      const label = document.createElement('label');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'nb-choice-' + select.id;
      radio.value = option.value;
      const face = document.createElement('span');
      face.className = icons ? 'nb-gender-face' : 'nb-choice-face';
      if (icons) {
        const icon = document.createElement('i');
        icon.className = 'fa fa-' + icons.get(option.value);
        icon.setAttribute('aria-hidden', 'true');
        face.append(icon);
      }
      const text = document.createElement('span');
      text.textContent = option.textContent;
      face.append(text);
      label.append(radio, face);
      row.append(label);
      radio.addEventListener('change', () => {
        if (!radio.checked) return;
        select.value = radio.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });
      return [radio, option];
    });
    view.append(legend, row);
    function sync() {
      for (const [radio, option] of radios) {
        radio.disabled = select.disabled || option.disabled;
        radio.checked = select.value === radio.value;
      }
    }
    return {
      sync,
      show() {
        source.parentElement.classList.add('nb-full-field');
        source.classList.add('nb-field-source');
        source.hidden = true;
        source.before(view);
        sync();
      },
      hide() {
        view.remove();
        source.parentElement.classList.remove('nb-full-field');
        source.hidden = false;
        source.classList.remove('nb-field-source');
      }
    };
  }

  function ageRange(fields) {
    const inputs = ['age_from', 'age_to'].map(id => fields.querySelector('input[type="number"][data-extra-field="' + id + '"]'));
    if (inputs.some(input => !input)) return null;
    const groups = inputs.map(input => input.closest('.cl-extra-field'));
    if (groups[0].nextElementSibling !== groups[1]) return null;
    const titles = inputs.map(input => input.closest('label').querySelector('span'));
    const original = titles.map(title => title.textContent);
    const view = document.createElement('fieldset');
    view.className = 'nb-age-range';
    const legend = document.createElement('legend');
    legend.textContent = en ? 'Expert age, years' : 'Возраст эксперта, лет';
    const row = document.createElement('div');
    row.className = 'nb-age-fields';
    view.append(legend, row);
    return {
      show() {
        groups[0].before(view);
        row.append(...groups);
        titles.forEach((title, i) => {
          title.textContent = (en ? ['From', 'To'] : ['От', 'До'])[i];
          inputs[i].setAttribute('aria-label', original[i]);
        });
      },
      hide() {
        view.replaceWith(...groups);
        titles.forEach((title, i) => {
          title.textContent = original[i];
          inputs[i].removeAttribute('aria-label');
        });
      }
    };
  }

  function citySuggestions(input) {
    const aliases = { London: 'Лондон', Madrid: 'Мадрид', Paris: 'Париж', Rome: 'Рим' };
    const access = window.CatalogDemoAccess || {};
    const cities = access.hideFields || access.hideProfiles || access.hideDirectory || window.CatalogDemoSourceFailure
      ? []
      : [...new Set(window.CatalogFilterFixtures.map(profile => profile.location).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b));
    const source = input.closest('.cl-extra-field');
    const title = input.closest('label').querySelector('span');
    const oldTitle = title.textContent;
    const oldPlaceholder = input.getAttribute('placeholder');
    const popup = document.createElement('div');
    popup.id = input.id + '-suggestions';
    popup.className = 'nb-city-suggestions';
    popup.setAttribute('role', 'listbox');
    popup.setAttribute('aria-label', en ? 'Suggested cities' : 'Подсказки городов');
    const box = document.createElement('span');
    box.className = 'nb-city-input';
    const icon = document.createElement('i');
    icon.className = 'fa fa-search';
    icon.setAttribute('aria-hidden', 'true');
    box.append(icon);
    let matches = [], active = -1;

    function close() {
      popup.hidden = true;
      active = -1;
      if (!box.isConnected) return;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
    }
    function render() {
      if (!box.isConnected || input.disabled) return;
      const term = input.value.trim().toLocaleLowerCase();
      matches = cities.filter(city => [city, aliases[city]].some(name => name?.toLocaleLowerCase().includes(term))).slice(0, 8);
      close();
      popup.replaceChildren(...matches.map((city, i) => {
        const option = document.createElement('div');
        option.id = popup.id + '-' + i;
        option.dataset.index = String(i);
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', 'false');
        option.textContent = !en && aliases[city] ? city + ' · ' + aliases[city] : city;
        return option;
      }));
      if (!matches.length) return;
      popup.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }
    function choose(index) {
      const value = matches[index];
      if (!value) return;
      input.value = value;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      close();
    }
    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    input.addEventListener('blur', close);
    input.addEventListener('keydown', event => {
      if (!box.isConnected) return;
      if (event.key === 'Escape' && !popup.hidden) {
        event.preventDefault();
        event.stopPropagation();
        close();
      } else if (event.key === 'Enter' && !popup.hidden && active !== -1) {
        event.preventDefault();
        choose(active);
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (popup.hidden) render();
        if (popup.hidden) return;
        event.preventDefault();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        active = active === -1 ? (step === 1 ? 0 : matches.length - 1)
          : Math.max(0, Math.min(matches.length - 1, active + step));
        [...popup.children].forEach((option, i) => option.setAttribute('aria-selected', String(i === active)));
        input.setAttribute('aria-activedescendant', popup.children[active].id);
        popup.children[active].scrollIntoView({ block: 'nearest' });
      }
    });
    popup.addEventListener('mousedown', event => event.preventDefault());
    popup.addEventListener('click', event => {
      const option = event.target.closest('[role="option"]');
      if (option) choose(Number(option.dataset.index));
    });
    return {
      close,
      show() {
        title.textContent = en ? 'City' : 'Город';
        input.placeholder = en ? 'Start typing a city' : 'Начните вводить город';
        if (!cities.length) return;
        source.classList.add('nb-city-field');
        input.before(box);
        box.append(input);
        source.append(popup);
        input.setAttribute('role', 'combobox');
        input.setAttribute('aria-autocomplete', 'list');
        input.setAttribute('aria-controls', popup.id);
        input.setAttribute('autocomplete', 'off');
        close();
      },
      hide() {
        title.textContent = oldTitle;
        if (oldPlaceholder === null) input.removeAttribute('placeholder');
        else input.placeholder = oldPlaceholder;
        if (!box.isConnected) return;
        close();
        box.replaceWith(input);
        popup.remove();
        source.classList.remove('nb-city-field');
        for (const attr of ['role', 'aria-autocomplete', 'aria-controls', 'aria-expanded', 'autocomplete']) input.removeAttribute(attr);
      }
    };
  }

  for (const root of document.querySelectorAll('.cl-catalog-filter.cl-catalog-vertical')) {
    const drawer = root.querySelector('.cl-filter-drawer');
    const body = drawer?.querySelector('.cl-drawer-body');
    const form = body?.closest('form');
    const areas = body?.querySelector('.cl-filter-areas');
    const topics = body?.querySelector('.cl-filter-topics');
    const topicLabel = topics?.querySelector('legend [data-i18n]');
    const submit = drawer?.querySelector('.cl-filter-actions [type="submit"] [data-i18n]');
    if (!body || !areas || !topics || !topicLabel || !submit) continue;
    const originalTopic = topicLabel.textContent;
    const originalSubmit = submit.textContent;
    const extra = body.querySelector('.cl-extra-section');
    const extraHeading = extra?.querySelector('.cl-extra-heading');
    const extraFields = extra?.querySelector('.cl-extra-fields');
    const selectFor = id => extraFields?.querySelector('select[data-extra-field="' + id + '"]');
    const choices = [
      [selectFor('gender'), { icons: new Map([['', 'minus'], ['female', 'venus'], ['male', 'mars']]) }],
      [selectFor('experience'), {}],
      [selectFor('languages'), { name: en ? 'Consultation language' : 'Язык консультации' }]
    ].flatMap(([select, options]) => select ? [[select, selectChoice(select, options)]] : []);
    const age = extraFields && ageRange(extraFields);
    const location = extraFields?.querySelector('input[type="text"][data-extra-field="location"]');
    const city = location && citySuggestions(location);
    const countField = selectFor('consultations')?.closest('.cl-extra-field');
    const countNext = countField?.nextElementSibling;
    const updateGutter = () => {
      const gutter = body.offsetWidth - body.clientWidth;
      body.style.setProperty('--nb-gutter', gutter + 'px');
    };
    new ResizeObserver(updateGutter).observe(body);
    const details = document.createElement('details');
    details.className = 'nb-filter-extra';
    const summary = document.createElement('summary');
    const label = document.createElement('span');
    label.className = 'nb-filter-extra-label';
    label.textContent = words.extra;
    const heading = document.createElement('span');
    heading.className = 'nb-filter-extra-heading';
    const preview = document.createElement('span');
    preview.className = 'nb-filter-extra-preview';
    preview.hidden = true;
    const badge = document.createElement('span');
    badge.className = 'cl-selection-count nb-filter-extra-count';
    badge.setAttribute('aria-hidden', 'true');
    badge.hidden = true;
    const mark = document.createElement('i');
    mark.className = 'fa fa-list-ul nb-filter-extra-mark';
    mark.setAttribute('aria-hidden', 'true');
    const caret = document.createElement('i');
    caret.className = 'fa fa-angle-down nb-filter-extra-caret';
    caret.setAttribute('aria-hidden', 'true');
    heading.append(mark, label, badge, caret);
    summary.append(heading, preview);
    details.append(summary);

    function updateExtraCount() {
      if (!details.isConnected) return;
      const values = window.CatalogDynamicDemo.readDraft();
      const keys = Object.keys(values).filter(id => id !== 'age_from' && id !== 'age_to');
      const count = keys.length + Number(Boolean(values.age_from || values.age_to));
      badge.hidden = count === 0;
      badge.textContent = count ? String(count) : '';
      const selected = [];
      for (const id of keys) {
        const control = extraFields.querySelector('[data-extra-field="' + id + '"]');
        if (!control || control.disabled) continue;
        const title = control.closest('label')?.querySelector('span')?.textContent || id;
        const value = control.tagName === 'SELECT' ? control.selectedOptions[0]?.textContent : control.value;
        selected.push(control.type === 'checkbox' ? title : title + ': ' + value);
      }
      if (values.age_from || values.age_to) {
        const range = [values.age_from && (en ? 'from ' : 'от ') + values.age_from,
          values.age_to && (en ? 'to ' : 'до ') + values.age_to].filter(Boolean).join(' ');
        selected.push((en ? 'Age: ' : 'Возраст: ') + range);
      }
      preview.textContent = selected.join(' · ');
      preview.hidden = !selected.length;
      summary.setAttribute('aria-label', [words.extra, count ? words.count(count) : '', ...selected].filter(Boolean).join(', '));
    }

    function layout() {
      if (desktop.matches) {
        body.insertBefore(topics, areas);
        topicLabel.textContent = words.topic;
        submit.textContent = words.submit;
        if (extraHeading && extraFields && !details.isConnected) {
          extraHeading.replaceWith(details);
          details.append(extraFields);
          choices.forEach(([, view]) => view?.show());
          age?.show();
          city?.show();
          if (countField && countNext) {
            countField.classList.add('nb-full-field');
            extraFields.append(countField);
          }
        }
        updateExtraCount();
      } else {
        body.insertBefore(areas, topics);
        topicLabel.textContent = originalTopic;
        submit.textContent = originalSubmit;
        if (details.isConnected) {
          choices.forEach(([, view]) => view?.hide());
          age?.hide();
          city?.hide();
          if (countField && countNext) {
            countField.classList.remove('nb-full-field');
            countNext.before(countField);
          }
          details.replaceWith(extraHeading, extraFields);
        }
      }
    }

    drawer.addEventListener('input', updateExtraCount);
    drawer.addEventListener('change', event => {
      for (const [select, view] of choices) if (event.target === select || event.target === form) view?.sync();
      updateExtraCount();
    });
    drawer.addEventListener('invalid', event => {
      if (extraFields?.contains(event.target) && details.isConnected) details.open = true;
    }, true);
    const searches = [];
    const mountSearch = () => {
      for (const group of [topics, areas]) {
        const search = optionSearch(group);
        if (search) searches.push(search);
      }
    };
    if (document.readyState !== 'complete' && !areas.dataset.compactMounted) {
      document.addEventListener('DOMContentLoaded', mountSearch, { once: true });
    } else mountSearch();
    drawer.addEventListener('close', () => {
      city?.close();
      searches.forEach(search => search.reset());
      details.open = false;
      updateExtraCount();
    });
    desktop.addEventListener('change', layout);
    layout();
  }
})();
