(() => {
  "use strict";
  const query = new URLSearchParams(location.search);
  const isAllMode = false;
  const storageKey = "confideline-profile-field-draft-20261113-v3-" + (isAllMode ? "all" : "expert");
  const editKey = storageKey + "-editing";
  const draftKey = storageKey + "-pending";
  let editing = false;
  try { editing = isAllMode && sessionStorage.getItem(editKey) === "yes"; } catch { /* keep mode locked */ }
  if (isAllMode && !editing) { location.replace("index.html?mode=all"); return; }
  const { customCatalog, builtIns = [], emptySettings } = profileFieldsData;
  const form = document.querySelector("#field-definition");
  const element = id => document.querySelector("#" + id);
  const selectedId = query.get("id");
  let state = { rules: { client: {}, expert: {} }, added: [], removed: [], fieldTypes: {} };
  const formStore = isAllMode ? sessionStorage : localStorage;
  const formStoreKey = isAllMode ? draftKey : storageKey;
  let openedState = null;
  let stateAvailable = true;
  try {
    openedState = formStore.getItem(formStoreKey);
    if (isAllMode && openedState === null) throw new Error("missing draft");
    if (openedState !== null) {
      const saved = JSON.parse(openedState);
      if (!saved?.rules?.client || !saved.rules.expert || !Array.isArray(saved.added) || !Array.isArray(saved.removed)) throw new Error("invalid state");
      state = saved;
    }
  } catch { stateAvailable = false; }
  state.fieldTypes ||= {};
  state.fieldOverrides ||= {};
  state.fieldDefinitions ||= {};
  const baseField = [...customCatalog, ...state.added].find(item => item.id === selectedId);
  const field = baseField ? { ...baseField, ...(state.fieldOverrides[baseField.id] || {}) } : null;
  const client = element("field-client-form");
  const expert = element("field-expert-form");
  const category = element("field-category-form");
  const type = element("field-class-form");
  const title = element("field-title-form");
  const alias = element("field-alias-form");
  const visible = element("field-visible-form");
  const premiumView = element("field-premium-view-form");
  const inForm = element("field-in-form");
  const searchable = element("field-search-form");
  const premium = element("field-premium-form");
  const required = element("field-required-form");
  const back = "index.html" + (isAllMode ? "?mode=all" : "");
  element("back-fields").href = back; element("back-crumb").href = back;
  if (field) {
    const name = field.originalTitle || field.title;
    document.title = 'Редактирование поля "' + name + '"';
    element("field-form-title").textContent = document.title;
    element("field-crumb").textContent = document.title;
    category.value = field.category; type.value = field.component;
    title.value = name; alias.value = field.key;
    const definition = state.fieldDefinitions[field.id] || {};
    element("field-language-form").value = definition.language ?? "app";
    element("field-order-form").value = definition.order ?? field.sortOrder ?? 100;
    element("field-weight-form").value = definition.weight ?? (field.id === "17" ? "0" : "");
    element("field-initial-rules").hidden = true;
    element("field-output-form").value = definition.output || "Через запятую";
    element("field-format-form").value = definition.format || "";
    const assigned = state.fieldTypes[field.id] || (field.types.includes("client") && !field.explicitTypes ? ["client", "expert"] : field.types);
    client.checked = assigned.includes("client"); expert.checked = assigned.includes("expert");
    const options = field.options || profileFieldOptions[field.id] || [];
    element("field-options-form").value = definition.optionsText ?? options.map((value, i) => (i + 1) + " => " + value).join("\n");
  } else { client.checked = true; expert.checked = true; }
  if (isAllMode) {
    element("field-mode-hint").hidden = false;
    element("field-mode-hint").textContent = "Изменения применятся после общего сохранения.";
    form.querySelector('button[type="submit"]').textContent = "Добавить к изменениям";
  }
  function showOptions() { element("field-options-block").hidden = !["select", "multi", "checkbox"].includes(type.value); }
  type.addEventListener("change", showOptions); showOptions();
  inForm.addEventListener("change", () => {
    required.disabled = !inForm.checked;
  });
  let formChanged = false;
  form.addEventListener("input", () => { formChanged = true; });
  form.addEventListener("change", () => { formChanged = true; });
  window.addEventListener("beforeunload", event => {
    if (formChanged) { event.preventDefault(); event.returnValue = ""; }
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    const error = element("field-form-error");
    if (!category.value || !type.value || !title.value.trim() || !alias.value.trim()) { error.textContent = "Заполните категорию, класс, заголовок и псевдоним."; error.hidden = false; return; }
    const assigned = [client.checked && "client", expert.checked && "expert"].filter(Boolean);
    if (!assigned.length) { error.textContent = "Выберите хотя бы один тип анкеты."; error.hidden = false; return; }
    try {
      if (!stateAvailable) throw new Error("state unavailable");
      if (formStore.getItem(formStoreKey) !== openedState) {
        error.textContent = "Настройки изменились в другой вкладке. Вернитесь к списку и откройте поле заново.";
        error.hidden = false;
        return;
      }
    } catch {
      error.textContent = "Не удалось проверить актуальность настроек. Попробуйте ещё раз.";
      error.hidden = false;
      return;
    }
    const previousState = JSON.parse(JSON.stringify(state));
    const id = field?.id || ("local-" + Date.now());
    const previousOrder = field ? String(state.fieldDefinitions[id]?.order ?? field.sortOrder ?? 100) : null;
    const previousTypes = field ? (state.fieldTypes[id] || (field.types.includes("client") && !field.explicitTypes ? ["client", "expert"] : field.types)) : [];
    const firstAssignments = field
      ? assigned.filter(role => !previousTypes.includes(role) && !state.rules[role][id]) : [];
    if (field) {
      state.fieldTypes[id] = assigned;
    } else {
      state.added.push({ id, title: title.value.trim(), originalTitle: title.value.trim(), key: alias.value.trim(), category: category.value, component: type.value, origin: "custom", types: assigned, explicitTypes: true, canSearch: true });
      state.fieldTypes[id] = assigned;
    }
    const optionsText = element("field-options-form").value;
    const options = optionsText.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
      const separator = line.indexOf("=>");
      return separator < 0 ? line : line.slice(separator + 2).trim();
    });
    state.fieldOverrides[id] = { title: title.value.trim(), originalTitle: title.value.trim(), key: alias.value.trim(), category: category.value, component: type.value, options };
    state.fieldDefinitions[id] = {
      language: element("field-language-form").value,
      order: element("field-order-form").value || "100",
      weight: element("field-weight-form").value,
      optionsText,
      output: element("field-output-form").value,
      format: element("field-format-form").value
    };
    const nextOrder = element("field-order-form").value || "100";
    if (!field || nextOrder !== previousOrder) {
      const allFields = [...customCatalog, ...builtIns, ...state.added].filter(item => !state.removed.includes(item.id));
      const byId = new Map(allFields.map(item => [item.id, item]));
      const ids = [...(state.fieldOrder || []), ...allFields.map(item => item.id)]
        .filter((fieldId, index, source) => byId.has(fieldId) && source.indexOf(fieldId) === index);
      const customIds = ids.filter(fieldId => byId.get(fieldId).origin === "custom");
      const oldPosition = new Map(customIds.map((fieldId, index) => [fieldId, index]));
      const sortValue = fieldId => {
        const raw = state.fieldDefinitions[fieldId]?.order || (byId.get(fieldId).sortOrder ?? 100);
        const value = Number(raw);
        return Number.isFinite(value) ? value : 100;
      };
      customIds.sort((a, b) => sortValue(a) - sortValue(b) || oldPosition.get(a) - oldPosition.get(b));
      let index = 0;
      state.fieldOrder = ids.map(fieldId => byId.get(fieldId).origin === "custom" ? customIds[index++] : fieldId);
    }
    if (!field) {
      for (const role of assigned) {
        state.rules[role][id] = {
          ...emptySettings,
          form: inForm.checked,
          view: visible.checked,
          premiumView: premiumView.checked,
          search: searchable.checked,
          premiumSearch: premium.checked,
          required: required.checked
        };
      }
    }
    for (const role of firstAssignments) {
      const source = role === "client" ? "expert" : "client";
      if (!previousTypes.includes(source)) continue;
      const professional = Number(id) >= 17 && Number(id) <= 21;
      const fallback = { ...emptySettings, form: professional, view: id === "7" && source === "client", search: professional && !!field.canSearch };
      state.rules[role][id] = { ...fallback, ...(state.rules[source][id] || {}) };
    }
    try { formStore.setItem(formStoreKey, JSON.stringify(state)); formChanged = false; location.href = back; }
    catch { state = previousState; error.textContent = "Не удалось сохранить изменения. Попробуйте ещё раз."; error.hidden = false; }
  });
})();
