(() => {
  "use strict";

  const manager = document.querySelector("#profile-field-manager");
  const dialog = manager.querySelector("#field-dialog");
  const dialogBody = manager.querySelector("#dialog-body");
  const dialogFooter = manager.querySelector("#dialog-footer");
  const search = manager.querySelector("#field-search");
  const category = manager.querySelector("#field-category");
  const origin = manager.querySelector("#field-origin");
  const profileChecks = [...manager.querySelectorAll(".pf-profile-picker input")];
  const selectedProfile = () => {
    const selected = profileChecks.filter(control => control.checked);
    return selected.length === 1 ? selected[0].id.replace("field-profile-", "") : "";
  };
  const differences = manager.querySelector("#field-differences");
  const pageSize = manager.querySelector("#field-page-size");
  const pages = manager.querySelector("#field-pages");
  const tableScroll = manager.querySelector(".pf-table-scroll");
  const sortHint = manager.querySelector("#field-sort-hint");
  const rows = manager.querySelector("#field-rows");
  const count = manager.querySelector("#field-count");
  const message = manager.querySelector("#field-message");
  const isAllMode = new URLSearchParams(location.search).get("mode") === "all";
  const storageKey = "confideline-profile-field-draft-20261113-v3-" + (isAllMode ? "all" : "expert");
  const editKey = storageKey + "-editing";
  const draftKey = storageKey + "-pending";
  const baseKey = storageKey + "-baseline";
  const rawKey = storageKey + "-baseline-raw";
  const conflictKey = storageKey + "-conflict";
  let editing = false;
  let conflict = false;
  try { editing = isAllMode && sessionStorage.getItem(editKey) === "yes"; } catch { /* view remains available */ }
  try { conflict = editing && sessionStorage.getItem(conflictKey) === "yes"; } catch { /* no saved conflict */ }
  let allowDraftNavigation = false;
  if (isAllMode) {
    manager.classList.add("pf-all-mode");
    manager.querySelector("#mode-note").hidden = true;
    document.querySelector("#new-field-link").href = "field-form.html?mode=all";
    manager.querySelector("#mode-actions").hidden = false;
    manager.querySelector("#mode-expert-tab").setAttribute("aria-selected", "false");
    manager.querySelector("#mode-expert-tab").disabled = true;
    manager.querySelector("#mode-all-tab").setAttribute("aria-selected", "true");
    manager.querySelector("#mode-all-tab").disabled = false;
    manager.querySelector("#field-mode-content").setAttribute("aria-labelledby", "mode-all-tab");
  }
  const { typeNames, profileTypes, listSettings, originalCategories, categories, propertyNames, modelClasses, builtIns, customCatalog, emptySettings } = profileFieldsData;
  const flagSortButtons = [...manager.querySelectorAll("[data-sort]")].filter(button =>
    listSettings.includes(button.dataset.sort)
  );
  function readSavedState() {
    try {
      const saved = JSON.parse(editing ? sessionStorage.getItem(draftKey) : localStorage.getItem(storageKey));
      if (saved?.rules?.client && saved.rules.expert && Array.isArray(saved.added) && Array.isArray(saved.removed)) return saved;
    } catch {
      // The mock remains usable when storage is unavailable.
    }
    return null;
  }
  let state = readSavedState() || { rules: { client: {}, expert: {} }, added: [], removed: [] };
  const pendingChanges = [];
  let focusReturn;
  let sort = { key: "", descending: false };
  let page = 1;

  function escapeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
  }

  function appliesTo(field, type, source = state) {
    const assigned = source.fieldTypes?.[field.id];
    if (assigned) return assigned.includes(type);
    return field.types.includes(type) ||
      (!field.explicitTypes && type === "expert" && field.types.includes("client"));
  }

  function baselineState() {
    if (!isAllMode || !editing) return null;
    try { return JSON.parse(sessionStorage.getItem(baseKey)); } catch { return null; }
  }

  function isPendingNew(field) {
    const baseline = baselineState();
    return Boolean(baseline && state.added.some(item => item.id === field.id) && !baseline.added.some(item => item.id === field.id));
  }

  function isPendingDeletion(field) {
    const baseline = baselineState();
    return Boolean(baseline && state.removed.includes(field.id) && !baseline.removed.includes(field.id));
  }

  function orderedFields(source = state) {
    const fields = [...customCatalog, ...builtIns, ...source.added];
    const position = new Map((source.fieldOrder || []).map((id, index) => [id, index]));
    return fields.map((field, index) => ({ field, index })).sort((a, b) =>
      (position.get(a.field.id) ?? position.size + a.index) - (position.get(b.field.id) ?? position.size + b.index)
    ).map(({ field }) => ({ ...field, ...(source.fieldOverrides?.[field.id] || {}) }));
  }

  function fieldsFor(type) {
    return orderedFields().filter(field => {
      const available = type ? appliesTo(field, type) : typesFor(field).length > 0;
      return available && (!state.removed.includes(field.id) || isPendingDeletion(field));
    });
  }

  function rulesFor(field, type, source = state) {
    const saved = source.rules[type][field.id];
    if (saved) return { ...emptySettings, ...saved };
    const isProfessional = field.origin === "custom" && Number(field.id) >= 17;
    const activeBuiltIn = field.origin === "built-in" && field.category !== "dating";
    return {
      ...emptySettings,
      form: activeBuiltIn || isProfessional,
      view: (activeBuiltIn && field.showInView !== false) || (field.id === "7" && type === "client"),
      search: field.canSearch && (field.id === "sex" || isProfessional)
    };
  }

  function applyRules(field, changes) {
    for (const [type, rules] of Object.entries(changes)) {
      state.rules[type][field.id] = { ...rulesFor(field, type), ...rules };
    }
  }

  function save(field, changes, feedback = "Настройки сохранены.", color = "text-success") {
    const saved = persist(feedback, () => applyRules(field, changes), color);
    if (saved && differences.checked && !hasDifferences(field) && !isAllMode) {
      message.textContent += " Настройки совпали. Поле скрыто фильтром.";
    }
    return saved;
  }

  function persist(feedback, change, color = "text-success") {
    if (isAllMode && !editing) return false;
    pendingChanges.push(change);
    state = readSavedState() || state;
    const previousState = JSON.parse(JSON.stringify(state));
    for (const apply of pendingChanges) apply();
    try {
      if (isAllMode) sessionStorage.setItem(draftKey, JSON.stringify(state));
      else localStorage.setItem(storageKey, JSON.stringify(state));
      pendingChanges.length = 0;
      message.classList.remove("text-warning", "text-success", "text-danger");
      message.classList.add(color);
      message.textContent = isAllMode ? "Изменения не сохранены." : feedback;
      if (isAllMode) syncEditUI();
      return true;
    } catch {
      state = previousState;
      pendingChanges.length = 0;
      message.classList.remove("text-warning", "text-success", "text-danger");
      message.classList.add("text-danger");
      message.textContent = "Не удалось сохранить изменение. Прежняя настройка восстановлена.";
      return false;
    }
  }

  function searchSupported(field) {
    return Boolean(field.canSearch);
  }

  function settingAvailable(field, key) {
    if (key === "premiumView") return field.origin === "custom";
    if (key === "premiumSearch") return field.origin === "custom" && searchSupported(field);
    return key !== "search" || searchSupported(field);
  }

  function typesFor(field, source = state) {
    return profileTypes.filter(type => appliesTo(field, type, source));
  }

  function fieldTitle(field) {
    return field.originalTitle || field.title;
  }

  function toggleCell(field, key, type) {
    if (!settingAvailable(field, key)) {
      return '<td class="pf-setting pf-unavailable" title="Настройка не применяется"><span class="sr-only">Не применяется</span></td>';
    }
    const title = propertyNames[key] + " — " + typeNames[type] + " — " + fieldTitle(field);
    const isChecked = rulesFor(field, type)[key];
    return '<td class="pf-setting"><label class="pf-toggle" title="' + escapeText(title) +
      '"><input type="checkbox" data-field="' + escapeText(field.id) + '" data-setting="' + key +
      '" data-profile-type="' + type + '" aria-label="' + escapeText(title) + '"' +
      (isChecked ? " checked" : "") + (isAllMode && (!editing || isPendingDeletion(field)) ? " disabled" : "") + '></label></td>';
  }

  function categoryOptions(type) {
    const unique = new Set(fieldsFor(type).map(field => field.category));
    return [...categories].filter(([key]) => unique.has(key)).map(([key, name]) =>
      '<option value="' + key + '">' + escapeText(name) + '</option>'
    ).join("");
  }

  function renderCategories() {
    category.innerHTML = '<option value="">Все категории</option>' + categoryOptions();
  }

  function fieldClass(field) {
    return field.origin === "custom" ? modelClasses[field.component] : "";
  }

  function fieldAlias(field) {
    if (field.origin !== "custom") return "";
    return field.key === "Новое поле в макете" ? field.id.replace("-", "_") : field.key;
  }

  function technicalCell(value, span) {
    if (!value) return '<td rowspan="' + span + '"><span class="sr-only">Нет значения</span></td>';
    const wrapped = escapeText(value).split("\\").join("\\<wbr>");
    return '<td rowspan="' + span + '"><code class="pf-code" title="' +
      escapeText(value) + '">' + wrapped + '</code></td>';
  }

  function technicalDetails(field, span) {
    if (field.origin === "built-in") {
      const sources = field.key.split(" и ").map(source =>
        source.startsWith("Profile[") ? '<code class="pf-code">' + escapeText(source) + '</code>' : escapeText(source)
      );
      return '<td colspan="2" rowspan="' + span + '"><span class="pf-origin">Источник</span>' +
        sources.join("<br>") + '</td>';
    }
    const modelClass = fieldClass(field);
    return technicalCell(modelClass ? "app\\models\\fields\\" + modelClass : "", span) +
      technicalCell(fieldAlias(field), span);
  }

  function registeredId(field) {
    return /^\d+$/.test(field.id) ? field.id : "";
  }

  function sortValue(field, key) {
    if (key === "id") return registeredId(field);
    if (key === "title") return fieldTitle(field);
    if (key === "fieldClass") return fieldClass(field);
    if (key === "alias") return fieldAlias(field);
    if (!settingAvailable(field, key)) return "";
    return Number(rulesFor(field, selectedProfile())[key]);
  }

  function rowActions(field, span) {
    const id = escapeText(field.id);
    const title = escapeText(fieldTitle(field));
    if (isPendingDeletion(field)) return '<td class="pf-edit-column" rowspan="' + span + '"><button type="button" class="btn btn-default btn-xs" data-restore="' + id + '" aria-label="Восстановить — ' + title + '">Восстановить</button></td>';
    const pencil = '<i class="fa fa-pencil" aria-hidden="true"></i>';
    const edit = field.origin === "custom"
      ? '<a class="btn btn-default btn-xs" href="field-form.html?id=' + encodeURIComponent(field.id) + (isAllMode ? "&amp;mode=all" : "") +
        '" title="Редактировать" aria-label="Редактировать — ' + title + '"' + (isAllMode && !editing ? ' aria-disabled="true" tabindex="-1"' : '') + '>' + pencil + '</a>'
      : '<button type="button" class="btn btn-default btn-xs" data-edit="' + id +
        '" title="Настройки" aria-label="Настройки — ' + title + '">' + pencil + '</button>';
    const remove = field.origin === "custom"
      ? '<button type="button" class="btn btn-default btn-xs" data-delete="' + id +
        '" title="Удалить" aria-label="Удалить — ' + title + '"' + (isAllMode && !editing ? ' disabled' : '') + '><i class="fa fa-trash-o" aria-hidden="true"></i></button>'
      : '';
    return '<td class="pf-edit-column" rowspan="' + span + '"><div class="pf-row-actions">' + edit + remove + '</div></td>';
  }

  function renderPages(totalPages) {
    if (totalPages <= 1) {
      pages.innerHTML = "";
      return;
    }
    const item = (number, label, hint, disabled = false, step = "") => {
      const current = number === page && !hint;
      return '<li' + (current ? ' class="active"' : '') + '><button type="button" data-page="' + number + '"' +
        ' aria-label="' + (hint || "Страница " + label) + '"' +
        (step ? ' data-page-step="' + step + '"' : '') +
        (current ? ' aria-current="page"' : '') + (disabled ? ' disabled' : '') + '>' + label + '</button></li>';
    };
    pages.innerHTML = '<ul class="pagination">' + item(page - 1, "‹", "Предыдущая страница", page === 1, "prev") +
      Array.from({ length: totalPages }, (_, index) => item(index + 1, index + 1)).join("") +
      item(page + 1, "›", "Следующая страница", page === totalPages, "next") + '</ul>';
  }

  function syncRoleFilter() {
    const filtered = Boolean(selectedProfile());
    const canSortFlags = filtered;
    differences.disabled = filtered;
    if (filtered) differences.checked = false;
    sortHint.hidden = canSortFlags;
    flagSortButtons.forEach(button => {
      button.disabled = !canSortFlags;
      button.closest("th").title = canSortFlags ? "" : "Для сортировки выберите один тип анкеты";
    });
    if (!canSortFlags && listSettings.includes(sort.key)) {
      sort = { key: "", descending: false };
      manager.querySelector("th[aria-sort]")?.removeAttribute("aria-sort");
    }
  }

  function startResults() {
    page = 1;
    if (!message.classList.contains("text-warning")) message.textContent = "";
    renderRows();
  }

  function focusResults() {
    tableScroll.focus({ preventScroll: true });
    tableScroll.scrollIntoView({ block: "start" });
  }

  function resetFilters() {
    for (const control of [search, category, origin]) control.value = "";
    profileChecks.forEach(control => { control.checked = true; });
    differences.checked = false;
    syncRoleFilter();
    startResults();
    search.focus();
  }

  function hasDifferences(field, source = state) {
    if (typesFor(field, source).length !== profileTypes.length) return true;
    const [client, expert] = profileTypes.map(type => rulesFor(field, type, source));
    return listSettings.some(key => settingAvailable(field, key) && client[key] !== expert[key]);
  }

  function renderRows(revealField = "") {
    const type = selectedProfile();
    const query = search.value.trim().toLocaleLowerCase("ru");
    const baseline = isAllMode && editing ? baselineState() : null;
    const found = fieldsFor(type).filter(field => {
      const label = [registeredId(field), field.title, field.frontTitle, field.originalTitle, field.key].join(" ").toLocaleLowerCase("ru");
      return (!query || label.includes(query)) &&
        (!category.value || category.value === field.category) &&
        (!origin.value || origin.value === field.origin) &&
        (!differences.checked || hasDifferences(field) || (baseline && hasDifferences(field, baseline)));
    });
    if (sort.key) {
      found.sort((first, second) => {
        const a = sortValue(first, sort.key);
        const b = sortValue(second, sort.key);
        if (a === "" || b === "") return Number(a === "") - Number(b === "");
        const order = String(a).localeCompare(String(b), "ru", { numeric: true });
        return sort.descending ? -order : order;
      });
    }
    const limit = Number(pageSize.value);
    const totalPages = Math.max(1, Math.ceil(found.length / limit));
    const revealIndex = revealField ? found.findIndex(field => field.id === revealField) : -1;
    if (revealIndex >= 0) page = Math.floor(revealIndex / limit) + 1;
    page = Math.min(page, totalPages);
    const firstIndex = (page - 1) * limit;
    const lastIndex = Math.min(firstIndex + limit, found.length);
    count.textContent = found.length ? "Показаны поля " + (firstIndex + 1) + "–" + lastIndex + " из " + found.length + "." :
      "Найдено полей: 0.";
    renderPages(totalPages);
    rows.innerHTML = found.slice(firstIndex, lastIndex).map((field, fieldIndex) => {
      const types = type ? [type] : typesFor(field);
      const span = types.length;
      const id = registeredId(field);
      const source = field.origin === "built-in" ? '<span class="pf-origin">Встроенное</span>' : '';
      const mark = isPendingDeletion(field) ? '<span class="pf-field-state">Будет удалено</span>' :
        isPendingNew(field) ? '<span class="pf-field-state">Новое</span>' : '';
      const dragDisabled = (isAllMode && !editing) || isPendingDeletion(field);
      const handle = '<button type="button" class="pf-drag-handle" data-drag-field="' + escapeText(field.id) +
        '" draggable="' + !dragDisabled + '" aria-label="Порядок — ' + escapeText(fieldTitle(field)) +
        '" title="Перетащите или используйте стрелки вверх и вниз"' + (dragDisabled ? ' disabled' : '') +
        '><i class="fa fa-bars" aria-hidden="true"></i></button>';
      const metadata = '<td class="pf-id" rowspan="' + span + '"><span class="pf-id-content">' + handle + '<span>' + escapeText(id) + '</span></span>' +
        '</td><td rowspan="' + span + '">' + escapeText(categories.get(field.category)) +
        '</td><td rowspan="' + span + '"><span class="pf-name">' + escapeText(fieldTitle(field)) +
        '</span>' + source + mark + '</td>' +
        technicalDetails(field, span);
      return types.map((type, index) => {
        const scope = typeNames[type];
        const first = index === 0;
        const rowClasses = [fieldIndex % 2 ? "pf-field-even" : "", first ? "" : "pf-type-continuation", isPendingDeletion(field) ? "pf-pending-delete" : ""];
        return '<tr data-field-row="' + escapeText(field.id) + '" data-row-type="' + type + '" class="' +
          rowClasses.filter(Boolean).join(" ") + '">' + (first ? metadata : '') +
          '<th scope="row" class="pf-profile-scope"><button type="button" class="pf-sort" data-edit="' +
          escapeText(field.id) + '" data-edit-type="' + type + '" aria-label="Настройки — ' +
          escapeText(scope + " — " + fieldTitle(field)) + '"' + (isPendingDeletion(field) ? ' disabled' : '') + '>' + scope + '</button></th>' +
          listSettings.map(key => toggleCell(field, key, type)).join("") +
          (first ? rowActions(field, span) : '') + '</tr>';
      }).join("");
    }).join("") || '<tr><td colspan="11" class="pf-empty">По выбранным фильтрам полей нет. ' +
      '<button type="button" class="btn btn-default btn-xs" data-reset-filters>Сбросить фильтры</button></td></tr>';
  }

  function draftChanges() {
    if (!editing) return [];
    let baseline;
    try { baseline = JSON.parse(sessionStorage.getItem(baseKey)); } catch { return []; }
    if (!baseline?.rules) return [];
    const changes = [];
    const fields = new Map([...customCatalog, ...builtIns, ...baseline.added, ...state.added].map(field => [field.id, field]));
    const oldOrder = orderedFields(baseline).filter(field => !baseline.removed.includes(field.id)).map(field => field.id);
    const newOrder = orderedFields(state).filter(field => !state.removed.includes(field.id)).map(field => field.id);
    const commonOrder = oldOrder.filter(id => newOrder.includes(id));
    const updatedOrder = newOrder.filter(id => oldOrder.includes(id));
    if (JSON.stringify(commonOrder) !== JSON.stringify(updatedOrder)) {
      updatedOrder.forEach((id, index) => {
        const before = commonOrder.indexOf(id);
        if (before !== index) changes.push("«" + fieldTitle(fields.get(id)) + "»: Порядок — " + (before + 1) + " → " + (index + 1));
      });
    }
    for (const [id, field] of fields) {
      const wasAdded = baseline.added.some(item => item.id === id);
      const isAdded = state.added.some(item => item.id === id);
      const wasPresent = !baseline.removed.includes(id) && (!id.startsWith("local-") || wasAdded);
      const isPresent = !state.removed.includes(id) && (!id.startsWith("local-") || isAdded);
      const oldField = { ...field, ...(baseline.fieldOverrides?.[id] || {}) };
      const newField = { ...field, ...(state.fieldOverrides?.[id] || {}) };
      const name = fieldTitle(newField);
      if (!wasPresent && isPresent) { changes.push("Добавлено поле «" + name + "»"); continue; }
      if (wasPresent && !isPresent) { changes.push("Будут удалены поле «" + fieldTitle(oldField) + "» и ответы пользователей"); continue; }
      if (!wasPresent || !isPresent) continue;
      const oldTypes = profileTypes.filter(type => appliesTo(oldField, type, baseline));
      const newTypes = profileTypes.filter(type => appliesTo(newField, type, state));
      if (JSON.stringify(oldTypes) !== JSON.stringify(newTypes)) {
        const names = types => types.map(type => typeNames[type]).join(", ") || "не назначено";
        changes.push("«" + name + "»: Анкета — " + names(oldTypes) + " → " + names(newTypes));
      }
      for (const type of profileTypes) {
        const oldRules = rulesFor(oldField, type, baseline);
        const newRules = rulesFor(newField, type, state);
        for (const [key, label] of Object.entries({ ...propertyNames, required: "Обязательно в форме" })) {
          if (Boolean(oldRules[key]) !== Boolean(newRules[key])) {
            changes.push("«" + name + "» · " + typeNames[type] + ": " + label + " — " + (oldRules[key] ? "включено" : "выключено") + " → " + (newRules[key] ? "включено" : "выключено"));
          }
        }
      }
      const labels = { originalTitle: "Название", key: "Псевдоним", category: "Категория", component: "Класс поля", options: "Варианты" };
      for (const [key, label] of Object.entries(labels)) {
        const before = key === "originalTitle" ? fieldTitle(oldField) : oldField[key] ?? (key === "options" ? (profileFieldOptions[id] || []) : "");
        const after = key === "originalTitle" ? fieldTitle(newField) : newField[key] ?? (key === "options" ? (profileFieldOptions[id] || []) : "");
        if (JSON.stringify(before) !== JSON.stringify(after)) {
          const readable = value => Array.isArray(value) ? value.join(", ") : (key === "category" ? categories.get(value) || value : value);
          changes.push("«" + name + "»: " + label + " — «" + readable(before) + "» → «" + readable(after) + "»");
        }
      }
      const defaults = { language: "app", order: id === "17" ? "16" : "", weight: id === "17" ? "0" : "", required: false, optionsText: (oldField.options || profileFieldOptions[id] || []).map((value, i) => (i + 1) + " => " + value).join("\n"), output: "Через запятую", format: "" };
      const oldDefinition = { ...defaults, ...(baseline.fieldDefinitions?.[id] || {}) };
      const newDefinition = { ...defaults, ...(state.fieldDefinitions?.[id] || {}) };
      const definitionLabels = { language: "Язык", order: "Порядок", weight: "Вес", required: "Обязательность", optionsText: "Значения", output: "Формат вывода", format: "Свой формат" };
      for (const [key, label] of Object.entries(definitionLabels)) {
        if (oldDefinition[key] === newDefinition[key]) continue;
        const format = value => typeof value === "boolean" ? (value ? "включено" : "выключено") : (value || "не задано");
        changes.push("«" + name + "»: " + label + " — «" + format(oldDefinition[key]) + "» → «" + format(newDefinition[key]) + "»");
      }
    }
    return changes;
  }

  function syncEditUI() {
    if (!isAllMode) return;
    if (conflict) message.textContent = "Настройки изменились в другой вкладке. Отмените изменения и откройте редактирование заново.";
    else if (editing && draftChanges().length && !message.textContent) message.textContent = "Изменения не сохранены.";
    manager.querySelector("#mode-state").textContent = editing ? "Редактирование" : "Просмотр";
    manager.querySelector("[data-unlock]").hidden = editing;
    manager.querySelector("[data-cancel-edit]").hidden = !editing;
    const saveButton = manager.querySelector("[data-save-draft]");
    saveButton.hidden = !editing;
    saveButton.disabled = !editing || conflict || draftChanges().length === 0;
    const newLink = manager.querySelector("#new-field-link");
    if (editing) { newLink.removeAttribute("aria-disabled"); newLink.removeAttribute("tabindex"); newLink.title = "Новое поле"; }
    else { newLink.setAttribute("aria-disabled", "true"); newLink.setAttribute("tabindex", "-1"); newLink.title = "Сначала откройте редактирование настроек"; }
  }

  function discardDraft() {
    for (const key of [editKey, draftKey, baseKey, rawKey, conflictKey]) sessionStorage.removeItem(key);
    editing = false; conflict = false;
    state = readSavedState() || { rules: { client: {}, expert: {} }, added: [], removed: [] };
    message.textContent = "";
    renderCategories(); syncEditUI(); renderRows();
  }

  function showDialog(title, body, footer, trigger) {
    focusReturn = trigger;
    manager.querySelector("#dialog-title").textContent = title;
    dialogBody.innerHTML = body;
    dialogFooter.innerHTML = footer;
    dialog.showModal();
  }

  const closeButton = '<button type="button" class="btn btn-default" data-close>Закрыть</button>';
  const editFooter = '<button type="button" class="btn btn-default" data-close>Отмена</button>' +
    '<button type="submit" class="btn btn-primary" form="field-editor">Сохранить</button>';

  function checkControl(key, name, checked, disabled = false) {
    return '<div class="checkbox"><label><input type="checkbox" name="' + key + '"' +
      (checked ? " checked" : "") + (disabled ? " disabled" : "") + '> ' + escapeText(name) + '</label></div>';
  }

  function editField(field, trigger) {
    const locked = isAllMode && !editing;
    const type = trigger.dataset.editType || selectedProfile();
    const editTypes = type ? [type] : typesFor(field);
    const typeControls = editTypes.map(type => {
      const rules = rulesFor(field, type);
      const controls = Object.entries(propertyNames).filter(([key]) => settingAvailable(field, key))
        .map(([key, label]) => checkControl(type + "-" + key, label, rules[key], locked)).join("");
      return '<fieldset class="pf-role-settings"><legend>' + typeNames[type] + '</legend>' +
        controls + checkControl(type + "-required", "Обязательно в форме", rules.required, locked || !rules.form) +
        '</fieldset>';
    }).join("");
    const body = '<form id="field-editor" data-edit-field="' + escapeText(field.id) +
      '" data-edit-type="' + type + '">' +
      '<p class="text-muted">' + escapeText(categories.get(field.category)) + '</p>' +
      '<p>Источник <code>' + escapeText(field.key) + '</code></p>' +
      '<div class="pf-settings-columns">' + typeControls + '</div>' +
      (field.id === "status" ? '<p class="help-block">Это встроенный статус отношений. У поля Marital Status №8 свой справочник.</p>' : '') +
      (field.id === "age" ? '<p class="help-block">Настройка действует сразу на обе границы возраста.</p>' : '') +
      '<p class="help-block">При отключении сохранённые значения остаются в анкете.</p></form>';
    showDialog("Настройки — " + fieldTitle(field), body, locked ? closeButton : editFooter, trigger);
  }

  function confirmDelete(field, trigger) {
    const pendingNew = isPendingNew(field);
    const body = pendingNew
      ? '<p>Убрать поле <strong>«' + escapeText(fieldTitle(field)) + '»</strong> из изменений?</p><p>Поле не будет создано.</p>'
      : '<p>Удалить поле <strong>«' + escapeText(fieldTitle(field)) +
        '»</strong>?</p><p>Поле будет удалено для анкет: ' +
        typesFor(field).map(type => typeNames[type]).join(", ") + '.</p>' +
        '<p>При удалении поля будут удалены и ответы пользователей. Чтобы скрыть поле и сохранить ответы, выключите показ, поиск и заполнение в настройках.</p>' +
        (isAllMode ? '<p>Удаление произойдёт после сохранения изменений.</p>' : '');
    const footer = '<button type="button" class="btn btn-default" data-close autofocus>Отмена</button>' +
      '<button type="button" class="btn btn-danger" data-confirm-delete="' + escapeText(field.id) + '">' + (pendingNew ? 'Убрать' : 'Удалить') + '</button>';
    showDialog("Удалить поле", body, footer, trigger);
  }

  function showCategories(trigger) {
    showDialog("Категории полей", '<div class="table-responsive"><table class="table pf-preview-content"><thead><tr><th scope="col">Категория</th>' +
      '<th scope="col">Полей</th><th scope="col">Видимость</th></tr></thead><tbody>' +
      originalCategories.map(([, name, total, visible]) => '<tr><th scope="row">' + escapeText(name) +
        '</th><td>' + total + '</td><td>' + (visible ? "Включена" : "Скрыта") + '</td></tr>').join("") +
      '</tbody></table></div>',
      closeButton, trigger);
  }

  document.addEventListener("click", event => {
    const disabledLink = event.target.closest("a[aria-disabled='true']");
    if (disabledLink && manager.contains(disabledLink)) { event.preventDefault(); return; }
    const formLink = event.target.closest("a[href*='field-form.html']");
    if (formLink && isAllMode && editing) allowDraftNavigation = true;
    const link = event.target.closest("[data-menu-group], [data-preview-only], .sidebar-toggle");
    if (link) {
      event.preventDefault();
      if (link.matches("[data-menu-group]")) {
        const expanded = link.getAttribute("aria-expanded") === "true";
        link.setAttribute("aria-expanded", String(!expanded));
        link.parentElement.classList.toggle("active", !expanded);
        link.nextElementSibling.style.display = expanded ? "none" : "block";
      } else if (link.matches(".sidebar-toggle")) {
        const mobile = matchMedia("(max-width: 767px)").matches;
        const expanded = document.body.classList.toggle(mobile ? "sidebar-open" : "sidebar-collapse");
        link.setAttribute("aria-expanded", String(mobile ? expanded : !expanded));
      }
    }
    const action = event.target.closest("[data-preview], [data-edit], [data-delete], [data-confirm-delete], [data-restore], [data-close], [data-categories], [data-sort], [data-reset-filters], [data-page], [data-unlock], [data-confirm-unlock], [data-save-draft], [data-confirm-save], [data-cancel-edit], [data-confirm-cancel]");
    if (!action) return;
    const data = action.dataset;
    if ("unlock" in data) {
      showDialog("Изменить настройки?", "<p>Изменения применятся к выбранным типам анкет после сохранения.</p>",
        '<button type="button" class="btn btn-default" data-close autofocus>Отмена</button><button type="button" class="btn btn-primary" data-confirm-unlock>Открыть редактирование</button>', action);
      return;
    }
    if ("confirmUnlock" in data) {
      try {
        sessionStorage.setItem(baseKey, JSON.stringify(state));
        sessionStorage.setItem(rawKey, JSON.stringify(localStorage.getItem(storageKey)));
        sessionStorage.setItem(draftKey, JSON.stringify(state));
        sessionStorage.setItem(editKey, "yes");
        editing = true; syncEditUI(); renderRows();
        focusReturn = manager.querySelector("[data-cancel-edit]");
        dialog.close();
      } catch { dialogBody.insertAdjacentHTML("beforeend", '<p class="text-danger" role="alert">Не удалось открыть редактирование. Попробуйте ещё раз.</p>'); }
      return;
    }
    if ("saveDraft" in data) {
      const changes = draftChanges();
      if (!changes.length) return;
      const body = "<p>Проверьте изменения перед сохранением:</p><ul class=\"pf-change-list\">" +
        changes.map(item => "<li>" + escapeText(item) + "</li>").join("") + "</ul>";
      showDialog("Сохранить изменения?", body,
        '<button type="button" class="btn btn-default" data-close autofocus>Вернуться к редактированию</button><button type="button" class="btn btn-primary" data-confirm-save>Сохранить изменения</button>', action);
      return;
    }
    if ("confirmSave" in data) {
      try {
        if (JSON.stringify(localStorage.getItem(storageKey)) !== sessionStorage.getItem(rawKey)) {
          conflict = true; sessionStorage.setItem(conflictKey, "yes"); action.disabled = true; syncEditUI();
          dialogBody.insertAdjacentHTML("beforeend", '<p class="text-danger" role="alert">Настройки изменились в другой вкладке. Отмените изменения, откройте редактирование заново и повторите их.</p>');
          return;
        }
        const baseline = baselineState();
        const matchedFields = differences.checked && baseline && fieldsFor().some(field =>
          hasDifferences(field, baseline) && !hasDifferences(field));
        localStorage.setItem(storageKey, JSON.stringify(state));
        for (const key of [editKey, draftKey, baseKey, rawKey, conflictKey]) sessionStorage.removeItem(key);
        editing = false; conflict = false; syncEditUI(); renderRows();
        message.classList.remove("text-warning", "text-danger"); message.classList.add("text-success");
        message.textContent = matchedFields
          ? "Настройки сохранены. Совпавшие поля скрыты фильтром."
          : "Настройки сохранены.";
        focusReturn = manager.querySelector("[data-unlock]"); dialog.close();
      } catch { dialogBody.insertAdjacentHTML("beforeend", '<p class="text-danger" role="alert">Не удалось сохранить изменения. Они остались в редакторе.</p>'); }
      return;
    }
    if ("cancelEdit" in data) {
      if (!draftChanges().length) { discardDraft(); manager.querySelector("[data-unlock]").focus(); }
      else showDialog("Отменить изменения?", "<p>Несохранённые изменения будут потеряны.</p>",
        '<button type="button" class="btn btn-default" data-close autofocus>Продолжить редактирование</button><button type="button" class="btn btn-danger" data-confirm-cancel>Отменить изменения</button>', action);
      return;
    }
    if ("confirmCancel" in data) { discardDraft(); focusReturn = manager.querySelector("[data-unlock]"); dialog.close(); return; }
    if ("resetFilters" in data) resetFilters();
    if ("page" in data) {
      page = Number(data.page);
      renderRows();
      if (event.detail) {
        focusResults();
      } else {
        const arrow = data.pageStep ? pages.querySelector('[data-page-step="' + data.pageStep + '"]:not(:disabled)') : null;
        (arrow || pages.querySelector('[aria-current="page"]'))?.focus();
      }
    }
    if (data.sort) {
      sort = { key: data.sort, descending: sort.key === data.sort && !sort.descending };
      manager.querySelector("th[aria-sort]")?.removeAttribute("aria-sort");
      action.closest("th").setAttribute("aria-sort", sort.descending ? "descending" : "ascending");
      startResults();
    }
    if ("preview" in data) {
      const params = new URLSearchParams();
      if (selectedProfile()) params.set("type", selectedProfile());
      if (isAllMode) params.set("mode", "all");
      history.replaceState({ ...history.state, profileFieldsUi: {
        search: search.value, category: category.value, origin: origin.value,
        type: selectedProfile(), differences: differences.checked,
        pageSize: pageSize.value, page, sort,
        scroll: document.querySelector(".wrapper").scrollTop
      } }, "");
      let fallback = "";
      try {
        sessionStorage.setItem("confideline-profile-preview-session", JSON.stringify(state));
      } catch {
        fallback = "#state=" + encodeURIComponent(JSON.stringify(state));
      }
      allowDraftNavigation = true;
      location.href = "preview.html" + (params.size ? "?" + params.toString() : "") + fallback;
    }
    if ("categories" in data) { event.preventDefault(); showCategories(action); }
    if (data.edit) editField(fieldsFor().find(field => field.id === data.edit), action);
    if (data.delete) confirmDelete(fieldsFor().find(field => field.id === data.delete), action);
    if (data.confirmDelete) {
      if (!persist("Поле удалено.", () => {
        const field = fieldsFor().find(item => item.id === data.confirmDelete);
        if (field && isPendingNew(field)) {
          state.added = state.added.filter(item => item.id !== data.confirmDelete);
          for (const type of profileTypes) delete state.rules[type][data.confirmDelete];
          if (state.fieldTypes) delete state.fieldTypes[data.confirmDelete];
          if (state.fieldOverrides) delete state.fieldOverrides[data.confirmDelete];
          if (state.fieldDefinitions) delete state.fieldDefinitions[data.confirmDelete];
        } else if (!state.removed.includes(data.confirmDelete)) state.removed.push(data.confirmDelete);
      })) { dialog.close(); return; }
      const previousCategory = category.value;
      renderCategories();
      if ([...category.options].some(option => option.value === previousCategory)) category.value = previousCategory;
      renderRows();
      focusReturn = search;
      dialog.close();
    }
    if (data.restore) {
      if (persist("Поле восстановлено.", () => { state.removed = state.removed.filter(id => id !== data.restore); })) renderRows(data.restore);
    }
    if ("close" in data) dialog.close();
  });

  document.querySelector("#header-search").addEventListener("submit", event => {
    event.preventDefault();
    const query = event.currentTarget.querySelector("input").value;
    search.value = query;
    startResults();
    search.focus();
  });
  search.addEventListener("input", startResults);
  for (const control of [category, origin, differences]) {
    control.addEventListener("change", startResults);
  }
  pageSize.addEventListener("change", () => {
    startResults();
    focusResults();
  });
  function moveField(id, target, after = false) {
    if (id === target || (isAllMode && !editing)) return;
    const moved = persist("Порядок полей сохранён.", () => {
      const order = fieldsFor().map(field => field.id);
      const from = order.indexOf(id);
      const to = order.indexOf(target);
      if (from < 0 || to < 0) return;
      order.splice(from, 1);
      order.splice(order.indexOf(target) + (after ? 1 : 0), 0, id);
      state.fieldOrder = order;
    });
    if (moved) {
      renderRows(id);
      rows.querySelector('[data-drag-field="' + CSS.escape(id) + '"]')?.focus();
    }
  }
  rows.addEventListener("dragstart", event => {
    const handle = event.target.closest("[data-drag-field]");
    if (!handle || handle.disabled) { event.preventDefault(); return; }
    event.dataTransfer.setData("text/plain", handle.dataset.dragField);
    event.dataTransfer.effectAllowed = "move";
  });
  rows.addEventListener("dragover", event => {
    if (event.target.closest("tr[data-field-row]")) event.preventDefault();
  });
  rows.addEventListener("drop", event => {
    const row = event.target.closest("tr[data-field-row]");
    if (!row) return;
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain");
    if (id) moveField(id, row.dataset.fieldRow);
  });
  rows.addEventListener("keydown", event => {
    const handle = event.target.closest("[data-drag-field]");
    if (!handle || handle.disabled || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
    const ids = [...new Set([...rows.querySelectorAll("tr[data-field-row]")].map(row => row.dataset.fieldRow))];
    const index = ids.indexOf(handle.dataset.dragField);
    const next = event.key === "ArrowUp" ? index - 1 : index + 1;
    if (next < 0 || next >= ids.length) return;
    event.preventDefault();
    moveField(handle.dataset.dragField, ids[next], event.key === "ArrowDown");
  });
  profileChecks.forEach(control => control.addEventListener("change", () => {
    if (!profileChecks.some(item => item.checked)) control.checked = true;
    syncRoleFilter();
    startResults();
  }));
  const mobileQuery = matchMedia("(max-width: 767px)");
  const navToggle = document.querySelector(".sidebar-toggle");
  function syncSidebar() {
    const expanded = mobileQuery.matches ? document.body.classList.contains("sidebar-open") :
      !document.body.classList.contains("sidebar-collapse");
    navToggle.setAttribute("aria-expanded", String(expanded));
  }
  mobileQuery.addEventListener("change", syncSidebar);
  syncSidebar();

  manager.addEventListener("change", event => {
    const control = event.target;
    if (control.dataset.setting) {
      const field = fieldsFor().find(item => item.id === control.dataset.field);
      const type = control.dataset.profileType;
      const key = control.dataset.setting;
      const feedback = "«" + fieldTitle(field) + "». " + typeNames[type] + " · " +
        propertyNames[key] + (control.checked ? " · включено." : " · выключено.");
      const saved = save(field, { [type]: { [key]: control.checked } }, feedback,
        control.checked ? "text-success" : "text-danger");
      if (!saved) control.checked = rulesFor(field, type)[key];
      if (sort.key === key || differences.checked || isAllMode) {
        renderRows(field.id);
        const selector = '[data-field="' + CSS.escape(field.id) + '"][data-setting="' + key +
          '"][data-profile-type="' + type + '"]';
        (rows.querySelector(selector) || differences).focus();
      }
    }
    if (control.name?.endsWith("-form") && control.form?.dataset.editField) {
      const required = control.form.elements.namedItem(control.name.replace("-form", "-required"));
      required.disabled = !control.checked;
    }
  });

  dialog.addEventListener("submit", event => {
    if (event.target.id !== "field-editor") return;
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    if (form.dataset.editField) {
      const field = fieldsFor().find(item => item.id === form.dataset.editField);
      const editTypes = form.dataset.editType ? [form.dataset.editType] : typesFor(field);
      const changes = Object.fromEntries(editTypes.map(type => {
        const keys = [...Object.keys(propertyNames), "required"];
        return [type, Object.fromEntries(keys.map(key => [key, key === "required"
          ? Boolean(form.elements.namedItem(type + "-required")?.checked)
          : data.has(type + "-" + key)]))];
      }));
      if (!save(field, changes)) { dialog.close(); return; }
      const editType = focusReturn?.dataset.editType;
      renderRows(field.id);
      const trigger = '[data-edit="' + CSS.escape(field.id) + '"]' +
        (editType ? '[data-edit-type="' + editType + '"]' : ':not([data-edit-type])');
      focusReturn = rows.querySelector(trigger) || (differences.checked ? differences : search);
    }
    dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (focusReturn?.isConnected) focusReturn.focus();
  });

  function restoreTable() {
    const saved = history.state?.profileFieldsUi;
    if (saved) {
      search.value = saved.search || "";
      category.value = saved.category || "";
      origin.value = saved.origin || "";
      profileChecks.forEach(control => {
        control.checked = !saved.type || control.id === "field-profile-" + saved.type;
      });
      differences.checked = Boolean(saved.differences);
      pageSize.value = saved.pageSize || "20";
      page = saved.page || 1;
      sort = saved.sort || { key: "", descending: false };
    }
    syncRoleFilter();
    renderRows();
    if (saved) {
      if (sort.key) {
        const heading = manager.querySelector('[data-sort="' + CSS.escape(sort.key) + '"]')?.closest("th");
        heading?.setAttribute("aria-sort", sort.descending ? "descending" : "ascending");
      }
      document.querySelector(".wrapper").scrollTop = saved.scroll || 0;
      manager.querySelector("[data-preview]").focus({ preventScroll: true });
      const { profileFieldsUi, ...rest } = history.state;
      history.replaceState(rest, "");
    }
  }

  renderCategories();
  syncEditUI();
  restoreTable();
  window.addEventListener("beforeunload", event => {
    if (isAllMode && editing && !allowDraftNavigation && draftChanges().length) {
      event.preventDefault(); event.returnValue = "";
    }
  });
  window.addEventListener("pageshow", event => {
    if (event.persisted) restoreTable();
  });
})();
