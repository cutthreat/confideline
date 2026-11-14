(() => {
  "use strict";

  const manager = document.querySelector("#profile-field-manager");
  const dialog = manager.querySelector("#field-dialog");
  const dialogBody = manager.querySelector("#dialog-body");
  const dialogFooter = manager.querySelector("#dialog-footer");
  const search = manager.querySelector("#field-search");
  const category = manager.querySelector("#field-category");
  const origin = manager.querySelector("#field-origin");
  const profileFilter = manager.querySelector("#field-profile");
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
  if (isAllMode) { manager.querySelector("#mode-note").hidden = false; document.querySelector("#new-field-link").href = "field-form.html?mode=all"; }
  const { typeNames, profileTypes, listSettings, originalCategories, categories, propertyNames, modelClasses, builtIns, customCatalog, emptySettings } = profileFieldsData;
  const flagSortButtons = [...manager.querySelectorAll("[data-sort]")].filter(button =>
    listSettings.includes(button.dataset.sort)
  );
  function readSavedState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
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

  function appliesTo(field, type) {
    if (isAllMode) return true;
    const assigned = state.fieldTypes?.[field.id];
    if (assigned) return assigned.includes(type);
    return field.types.includes(type) ||
      (!field.explicitTypes && type === "expert" && field.types.includes("client"));
  }

  function fieldsFor(type) {
    return [...customCatalog, ...builtIns, ...state.added].map(field => ({ ...field, ...(state.fieldOverrides?.[field.id] || {}) })).filter(field => {
      const available = type ? appliesTo(field, type) : typesFor(field).length > 0;
      return available && !state.removed.includes(field.id);
    });
  }

  function rulesFor(field, type) {
    const saved = state.rules[isAllMode ? "client" : type][field.id];
    if (saved) return { ...emptySettings, ...saved };
    const isProfessional = field.origin === "custom" && Number(field.id) >= 17;
    const activeBuiltIn = field.origin === "built-in" && field.category !== "dating";
    return {
      ...emptySettings,
      form: activeBuiltIn || isProfessional,
      view: activeBuiltIn && field.showInView !== false,
      search: field.canSearch && (field.id === "sex" || isProfessional)
    };
  }

  function applyRules(field, changes) {
    if (isAllMode) {
      const combined = { ...rulesFor(field, "client"), ...Object.values(changes)[0] };
      state.rules.client[field.id] = { ...combined };
      state.rules.expert[field.id] = { ...combined };
      return;
    }
    for (const [type, rules] of Object.entries(changes)) {
      state.rules[type][field.id] = { ...rulesFor(field, type), ...rules };
    }
  }

  function save(field, changes, feedback = "Настройки сохранены в макете.", color = "text-success") {
    const saved = persist(feedback, () => applyRules(field, changes), color);
    if (saved && differences.checked && !hasDifferences(field)) {
      message.textContent += " Настройки совпали. Поле скрыто фильтром.";
    }
    return saved;
  }

  function persist(feedback, change, color = "text-success") {
    pendingChanges.push(change);
    state = readSavedState() || state;
    const previousState = JSON.parse(JSON.stringify(state));
    for (const apply of pendingChanges) apply();
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      pendingChanges.length = 0;
      message.classList.remove("text-warning", "text-success", "text-danger");
      message.classList.add(color);
      message.textContent = feedback;
      return true;
    } catch {
      state = previousState;
      pendingChanges.length = 0;
      message.classList.remove("text-warning", "text-success", "text-danger");
      message.classList.add("text-danger");
      message.textContent = "Не удалось сохранить изменение в макете. Прежняя настройка восстановлена.";
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

  function typesFor(field) {
    return profileTypes.filter(type => appliesTo(field, type));
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
      (isChecked ? " checked" : "") + (isAllMode && type === "expert" ? ' disabled title="В этом режиме настройки одинаковы для всех анкет"' : "") + '></label></td>';
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
    return Number(rulesFor(field, profileFilter.value)[key]);
  }

  function rowActions(field, span) {
    const id = escapeText(field.id);
    const title = escapeText(fieldTitle(field));
    const pencil = '<i class="fa fa-pencil" aria-hidden="true"></i>';
    const edit = field.origin === "custom"
      ? '<a class="btn btn-default btn-xs" href="field-form.html?id=' + encodeURIComponent(field.id) + (isAllMode ? "&amp;mode=all" : "") +
        '" title="Редактировать" aria-label="Редактировать — ' + title + '">' + pencil + '</a>'
      : '<button type="button" class="btn btn-default btn-xs" data-edit="' + id +
        '" title="Настройки в макете" aria-label="Настройки в макете — ' + title + '">' + pencil + '</button>';
    const remove = field.origin === "custom"
      ? '<button type="button" class="btn btn-default btn-xs" data-delete="' + id +
        '" title="Удалить" aria-label="Удалить — ' + title + '"><i class="fa fa-trash-o" aria-hidden="true"></i></button>'
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
    const filtered = Boolean(profileFilter.value);
    differences.disabled = filtered || isAllMode;
    if (filtered || isAllMode) differences.checked = false;
    if (isAllMode) differences.title = "В этом режиме настройки полей одинаковы для всех анкет";
    sortHint.hidden = filtered;
    flagSortButtons.forEach(button => {
      button.disabled = !filtered;
      button.closest("th").title = filtered ? "" : "Для сортировки выберите тип анкеты";
    });
    if (!filtered && listSettings.includes(sort.key)) {
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
    for (const control of [search, category, origin, profileFilter]) control.value = "";
    differences.checked = false;
    syncRoleFilter();
    startResults();
    search.focus();
  }

  function hasDifferences(field) {
    if (typesFor(field).length !== profileTypes.length) return true;
    const [client, expert] = profileTypes.map(type => rulesFor(field, type));
    return listSettings.some(key => settingAvailable(field, key) && client[key] !== expert[key]);
  }

  function renderRows(revealField = "") {
    const type = profileFilter.value;
    const query = search.value.trim().toLocaleLowerCase("ru");
    const found = fieldsFor(type).filter(field => {
      const label = [registeredId(field), field.title, field.frontTitle, field.originalTitle, field.key].join(" ").toLocaleLowerCase("ru");
      return (!query || label.includes(query)) &&
        (!category.value || category.value === field.category) &&
        (!origin.value || origin.value === field.origin) &&
        (!differences.checked || hasDifferences(field));
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
      const metadata = '<td class="pf-id" rowspan="' + span + '">' + escapeText(id) +
        '</td><td rowspan="' + span + '">' + escapeText(categories.get(field.category)) +
        '</td><td rowspan="' + span + '"><span class="pf-name">' + escapeText(fieldTitle(field)) +
        '</span>' + source + '</td>' +
        technicalDetails(field, span);
      return types.map((type, index) => {
        const first = index === 0;
        const rowClasses = [fieldIndex % 2 ? "pf-field-even" : "", first ? "" : "pf-type-continuation"];
        return '<tr data-field-row="' + escapeText(field.id) + '" data-row-type="' + type + '" class="' +
          rowClasses.filter(Boolean).join(" ") + '">' + (first ? metadata : '') +
          '<th scope="row" class="pf-profile-scope"><button type="button" class="pf-sort" data-edit="' +
          escapeText(field.id) + '" data-edit-type="' + type + '" aria-label="Настройки — ' +
          escapeText(typeNames[type] + " — " + fieldTitle(field)) + '"' +
          (isAllMode && type === "expert" ? ' disabled title="В этом режиме настройки одинаковы для всех анкет"' : '') + '>' + typeNames[type] + '</button></th>' +
          listSettings.map(key => toggleCell(field, key, type)).join("") +
          (first ? rowActions(field, span) : '') + '</tr>';
      }).join("");
    }).join("") || '<tr><td colspan="11" class="pf-empty">По выбранным фильтрам полей нет. ' +
      '<button type="button" class="btn btn-default btn-xs" data-reset-filters>Сбросить фильтры</button></td></tr>';
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
    const type = trigger.dataset.editType || profileFilter.value;
    const editTypes = isAllMode ? ["client"] : type ? [type] : typesFor(field);
    const typeControls = editTypes.map(type => {
      const rules = rulesFor(field, type);
      const controls = Object.entries(propertyNames).filter(([key]) => settingAvailable(field, key))
        .map(([key, label]) => checkControl(type + "-" + key, label, rules[key])).join("");
      return '<fieldset class="pf-role-settings"><legend>' + (isAllMode ? "Все анкеты" : typeNames[type]) + '</legend>' +
        controls + checkControl(type + "-required", "Обязательно в форме", rules.required, !rules.form) +
        '</fieldset>';
    }).join("");
    const body = '<form id="field-editor" data-edit-field="' + escapeText(field.id) +
      '" data-edit-type="' + (isAllMode ? "client" : type) + '">' +
      '<p class="text-muted">' + escapeText(categories.get(field.category)) + '</p>' +
      '<p>Источник <code>' + escapeText(field.key) + '</code></p>' +
      '<div class="pf-settings-columns">' + typeControls + '</div>' +
      (field.id === "status" ? '<p class="help-block">Это встроенный статус отношений. У поля Marital Status №8 свой справочник.</p>' : '') +
      (field.id === "age" ? '<p class="help-block">Настройка действует сразу на обе границы возраста.</p>' : '') +
      '<p class="help-block">При отключении сохранённые значения остаются в анкете.</p></form>';
    showDialog("Настройки в макете — " + fieldTitle(field), body, editFooter, trigger);
  }

  function confirmDelete(field, trigger) {
    const body = '<p>Удалить поле <strong>«' + escapeText(fieldTitle(field)) +
      '»</strong> из списка макета?</p><p>Поле будет удалено для анкет: ' +
      typesFor(field).map(type => typeNames[type]).join(", ") + '.</p>';
    const footer = '<button type="button" class="btn btn-default" data-close autofocus>Отмена</button>' +
      '<button type="button" class="btn btn-danger" data-confirm-delete="' + escapeText(field.id) + '">Удалить</button>';
    showDialog("Удалить поле", body, footer, trigger);
  }

  function showCategories(trigger) {
    showDialog("Категории полей", '<p class="text-muted">Список и видимость категорий на действующем сайте · 10.11.2026</p>' +
      '<div class="table-responsive"><table class="table pf-preview-content"><thead><tr><th scope="col">Категория</th>' +
      '<th scope="col">Полей</th><th scope="col">Видимость</th></tr></thead><tbody>' +
      originalCategories.map(([, name, total, visible]) => '<tr><th scope="row">' + escapeText(name) +
        '</th><td>' + total + '</td><td>' + (visible ? "Включена" : "Скрыта") + '</td></tr>').join("") +
      '</tbody></table></div><p class="help-block">В макете встроенные поля сгруппированы в «Основные сведения» и «Знакомства».</p>',
      closeButton, trigger);
  }

  document.addEventListener("click", event => {
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
    const action = event.target.closest("[data-preview], [data-edit], [data-delete], [data-confirm-delete], [data-close], [data-categories], [data-sort], [data-reset-filters], [data-page]");
    if (!action) return;
    const data = action.dataset;
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
      if (profileFilter.value) params.set("type", profileFilter.value);
      if (isAllMode) params.set("mode", "all");
      history.replaceState({ ...history.state, profileFieldsUi: {
        search: search.value, category: category.value, origin: origin.value,
        type: profileFilter.value, differences: differences.checked,
        pageSize: pageSize.value, page, sort,
        scroll: document.querySelector(".wrapper").scrollTop
      } }, "");
      let fallback = "";
      try {
        sessionStorage.setItem("confideline-profile-preview-session", JSON.stringify(state));
      } catch {
        fallback = "#state=" + encodeURIComponent(JSON.stringify(state));
      }
      location.href = "preview.html" + (params.size ? "?" + params.toString() : "") + fallback;
    }
    if ("categories" in data) { event.preventDefault(); showCategories(action); }
    if (data.edit) editField(fieldsFor().find(field => field.id === data.edit), action);
    if (data.delete) confirmDelete(fieldsFor().find(field => field.id === data.delete), action);
    if (data.confirmDelete) {
      if (!persist("Поле удалено из списка макета", () => {
        if (!state.removed.includes(data.confirmDelete)) state.removed.push(data.confirmDelete);
      })) { dialog.close(); return; }
      const previousCategory = category.value;
      renderCategories();
      if ([...category.options].some(option => option.value === previousCategory)) category.value = previousCategory;
      renderRows();
      focusReturn = search;
      dialog.close();
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
  profileFilter.addEventListener("change", () => {
    syncRoleFilter();
    startResults();
  });
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
      if (required.disabled) required.checked = false;
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
        return [type, Object.fromEntries(keys.map(key => [key, data.has(type + "-" + key)]))];
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
      profileFilter.value = saved.type || "";
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
  restoreTable();
  window.addEventListener("pageshow", event => {
    if (event.persisted) restoreTable();
  });
})();
