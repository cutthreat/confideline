(() => {
  "use strict";
  const query = new URLSearchParams(location.search);
  const isAllMode = query.get("mode") === "all";
  const storageKey = "confideline-profile-field-draft-20261113-v3-" + (isAllMode ? "all" : "expert");
  const { customCatalog, emptySettings } = profileFieldsData;
  const form = document.querySelector("#field-definition");
  const element = id => document.querySelector("#" + id);
  const selectedId = query.get("id");
  let state = { rules: { client: {}, expert: {} }, added: [], removed: [], fieldTypes: {} };
  try { const saved = JSON.parse(localStorage.getItem(storageKey)); if (saved?.rules?.client && saved.rules.expert && Array.isArray(saved.added) && Array.isArray(saved.removed)) state = saved; } catch { /* use example state */ }
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
    element("field-order-form").value = definition.order ?? (field.id === "17" ? "16" : "");
    element("field-weight-form").value = definition.weight ?? (field.id === "17" ? "0" : "");
    required.checked = !!definition.required;
    element("field-initial-rules").hidden = true;
    element("field-output-form").value = definition.output || "Через запятую";
    element("field-format-form").value = definition.format || "";
    const assigned = state.fieldTypes[field.id] || (field.types.includes("client") && !field.explicitTypes ? ["client", "expert"] : field.types);
    client.checked = assigned.includes("client"); expert.checked = assigned.includes("expert");
    const options = field.options || profileFieldOptions[field.id] || [];
    element("field-options-form").value = definition.optionsText ?? options.map((value, i) => (i + 1) + " => " + value).join("\n");
  } else { client.checked = true; expert.checked = true; }
  if (isAllMode) {
    client.checked = expert.checked = true;
    client.disabled = expert.disabled = true;
    element("field-mode-hint").hidden = false;
  }
  function showOptions() { element("field-options-block").hidden = !["select", "multi", "checkbox"].includes(type.value); }
  type.addEventListener("change", showOptions); showOptions();
  inForm.addEventListener("change", () => {
    required.disabled = !inForm.checked;
    if (required.disabled) required.checked = false;
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    const error = element("field-form-error");
    if (!category.value || !type.value || !title.value.trim() || !alias.value.trim()) { error.textContent = "Заполните категорию, класс, заголовок и псевдоним."; error.hidden = false; return; }
    const assigned = [client.checked && "client", expert.checked && "expert"].filter(Boolean);
    if (!assigned.length) { error.textContent = "Выберите хотя бы один тип анкеты."; error.hidden = false; return; }
    const id = field?.id || ("local-" + Date.now());
    const previousTypes = field ? (state.fieldTypes[id] || (field.types.includes("client") && !field.explicitTypes ? ["client", "expert"] : field.types)) : [];
    const firstClientAssignment = Boolean(field && !isAllMode && Number(id) >= 17 && Number(id) <= 21 &&
      previousTypes.includes("expert") && !previousTypes.includes("client") &&
      assigned.includes("client") && !state.rules.client[id]);
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
      order: element("field-order-form").value,
      weight: element("field-weight-form").value,
      required: required.checked,
      optionsText,
      output: element("field-output-form").value,
      format: element("field-format-form").value
    };
    if (!field) {
      for (const role of assigned) {
        state.rules[role][id] = {
          ...emptySettings,
          form: inForm.checked,
          view: visible.checked,
          premiumView: premiumView.checked,
          search: searchable.checked,
          premiumSearch: premium.checked,
          required: inForm.checked && required.checked
        };
      }
    }
    if (firstClientAssignment) {
      const expertRules = state.rules.expert[id] || { ...emptySettings, form: true, search: true };
      state.rules.client[id] = { ...emptySettings, ...expertRules };
    }
    try { localStorage.setItem(storageKey, JSON.stringify(state)); location.href = back; }
    catch { error.textContent = "Не удалось сохранить изменения. Попробуйте ещё раз."; error.hidden = false; }
  });
})();
