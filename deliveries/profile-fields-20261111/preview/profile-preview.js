(() => {
  "use strict";

  const { builtIns, customCatalog, categories, emptySettings } = profileFieldsData;
  const typeSelect = document.querySelector("#preview-type");
  const audienceSelect = document.querySelector("#preview-audience");
  const audienceLabel = document.querySelector("#preview-audience-label");
  const content = document.querySelector("#preview-content");
  const viewButtons = [...document.querySelectorAll("[data-view]")];
  const storageKey = "confideline-profile-field-mock-20261110";
  const query = new URLSearchParams(location.search);
  let view = "profile";
  let state = { rules: { client: {}, expert: {} }, added: [], removed: [] };

  if (query.get("type") === "expert") typeSelect.value = "expert";
  try {
    const fallback = new URLSearchParams(location.hash.slice(1)).get("state");
    const transferred = fallback || sessionStorage.getItem("confideline-profile-preview-session");
    if (transferred && !fallback) sessionStorage.removeItem("confideline-profile-preview-session");
    const saved = JSON.parse(transferred || localStorage.getItem(storageKey));
    if (saved?.rules?.client && saved.rules.expert && Array.isArray(saved.added) && Array.isArray(saved.removed)) {
      state = saved;
    }
  } catch {
    // The default configuration still allows the preview to open.
  }

  function escapeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
  }

  function rulesFor(field, type) {
    const saved = state.rules[type][field.id];
    if (saved) return { ...emptySettings, ...saved };
    const professional = field.origin === "custom" && Number(field.id) >= 17;
    const basic = field.origin === "built-in" && field.category !== "dating";
    return {
      ...emptySettings,
      form: basic || professional,
      view: (basic && field.showInView !== false) || (field.id === "7" && type === "client"),
      search: field.canSearch && (field.id === "sex" || professional)
    };
  }

  function availableFields() {
    const type = typeSelect.value;
    return [...builtIns, ...customCatalog, ...state.added].filter(field => {
      const applies = field.types.includes(type) ||
        (!field.explicitTypes && type === "expert" && field.types.includes("client"));
      return applies && !state.removed.includes(field.id);
    });
  }

  function visibleFields() {
    const premium = audienceSelect.value === "premium";
    return availableFields().filter(field => {
      const rules = rulesFor(field, typeSelect.value);
      if (view === "form") return rules.form;
      if (view === "profile") return rules.premiumView ? premium : rules.view;
      return field.canSearch && (rules.search || (premium && rules.premiumSearch));
    });
  }

  function labelFor(field) {
    return field.frontTitle || field.title || field.originalTitle;
  }

  function choicesFor(field) {
    return field.options?.length ? field.options : (profileFieldOptions[field.id] || []);
  }

  function sampleFor(field) {
    return field.sample || choicesFor(field)[0] || "Не заполнено";
  }

  function controlsFor(field, location) {
    const name = escapeText(labelFor(field));
    const id = "preview-field-" + escapeText(field.id);
    const required = location === "form" && rulesFor(field, typeSelect.value).required;
    const marker = required ? ' <span aria-label="обязательное">*</span>' : "";
    const choiceList = choicesFor(field);
    const full = ["name", "bio"].includes(field.id) ? " preview-full" : "";
    if (field.component === "photo") {
      return '<div class="preview-full"><strong>Фотографии</strong><p class="preview-example">Фотографии добавляются в разделе «Фотографии».</p></div>';
    }
    if (field.component === "age") {
      return '<fieldset class="' + full + '"><legend>' + name + marker + '</legend><div class="row">' +
        '<label class="col">С <input class="form-control" type="number" value="25"></label>' +
        '<label class="col">По <input class="form-control" type="number" value="40"></label></div></fieldset>';
    }
    if ((field.component === "select" || field.component === "multi") && choiceList.length) {
      if (field.id === "country" || field.id === "city" || field.origin === "custom") {
        const options = choiceList.map(option => '<option>' + escapeText(option) + '</option>').join("");
        return '<label class="' + full + '" for="' + id + '">' + name + marker +
          '<select id="' + id + '" class="form-control"' + (field.component === "multi" ? " multiple" : "") +
          '>' + options + '</select></label>';
      }
      const inputType = field.component === "multi" ? "checkbox" : "radio";
      const choices = choiceList.map((option, index) =>
        '<label class="preview-option"><input type="' + inputType + '" name="' + id +
        '" value="' + escapeText(option) + '"' +
        (option === field.sample || (!choiceList.includes(field.sample) && index === 0 && inputType === "radio") ? " checked" : "") +
        '> ' + escapeText(option) + '</label>'
      ).join("");
      const layout = location === "search" && field.id === "sex" ? "preview-segments" : "";
      return '<fieldset class="' + full + ' ' + layout + '"><legend>' + name + marker + '</legend>' + choices + '</fieldset>';
    }
    if (field.component === "checkbox") {
      return '<label class="preview-option"><input type="checkbox"> ' + name + marker + '</label>';
    }
    if (field.component === "textarea") {
      return '<label class="' + full + '" for="' + id + '">' + name + marker +
        '<textarea id="' + id + '" class="form-control" rows="3">' + escapeText(field.sample || "") + '</textarea></label>';
    }
    const inputType = ["number", "date"].includes(field.component) ? field.component : "text";
    return '<label class="' + full + '" for="' + id + '">' + name + marker +
      '<input id="' + id + '" class="form-control" type="' + inputType +
      '" value="' + escapeText(field.sample || "") + '"></label>';
  }

  function profilePage(fields) {
    const name = fields.find(field => field.id === "name");
    const photo = fields.find(field => field.id === "photo");
    const location = fields.filter(field => ["country", "city"].includes(field.id));
    const details = fields.filter(field => !["name", "photo", "country", "city"].includes(field.id));
    const groups = [...new Set(details.map(field => field.category))];
    const sections = groups.map(category => {
      const rows = details.filter(field => field.category === category).map(field =>
        '<div class="' + (field.id === "bio" ? 'preview-full' : '') + '"><dt>' +
        escapeText(labelFor(field)) + ':</dt><dd>' + escapeText(sampleFor(field)) + '</dd></div>'
      ).join("");
      return '<section class="preview-section card-body"><h2>' + escapeText(categories.get(category)) +
        '</h2><dl class="preview-field-grid">' + rows + '</dl></section>';
    }).join("");
    const photoCard = photo ? '<aside class="card"><div class="card-body"><img class="preview-photo" src="assets/site-preview/photo-placeholder.svg" alt="Пример фотографии профиля"></div></aside>' : "";
    return '<div class="preview-breadcrumb">Главная › Анкета</div><div class="preview-profile' +
      (photo ? "" : " preview-no-photo") + '">' + photoCard +
      '<div><section class="card"><div class="card-body"><h1 class="preview-profile-name">' +
      escapeText(name ? sampleFor(name) : "Анкета") + '</h1>' +
      (location.length ? '<div class="preview-location">' + location.map(field => escapeText(sampleFor(field))).join(", ") + '</div>' : '') +
      '</div></section><div class="card">' + (sections || '<p class="preview-empty">Поля для показа не включены.</p>') +
      '</div></div><aside><div class="card"><div class="card-body text-muted">Уровень заполнения профиля</div></div>' +
      '<div class="card"><div class="card-body text-muted">Популярность</div></div></aside></div>';
  }

  function formPage(fields) {
    const controls = fields.map(field => controlsFor(field, "form")).join("");
    return '<div class="preview-settings"><aside class="preview-settings-menu"><h1>Настройки</h1>' +
      '<div class="active">Профиль</div><div>Фотографии</div><div>Уведомления</div><div>Поддержка</div><div>Аккаунт</div></aside>' +
      '<section class="card"><div class="preview-card-title">Настройки профиля</div>' +
      '<div class="card-body"><div class="preview-form-fields">' + (controls ||
      '<p class="preview-empty">Поля для редактирования не включены.</p>') + '</div></div>' +
      '<div class="preview-footer"><button type="button" class="btn btn-primary" disabled>Сохранить</button></div></section></div>';
  }

  function searchPage(fields) {
    const controls = fields.map(field => {
      if (field.id === "sex") return controlsFor({ ...field, frontTitle: "Я ищу", options: ["Не важно", "Мужчины", "Женщины"] }, "search");
      if (field.id === "age") return controlsFor({ ...field, frontTitle: "Возраст" }, "search");
      return controlsFor(field, "search");
    }).join("");
    return '<div class="preview-search-layout"><section class="card"><div class="preview-card-title">Обзор</div>' +
      '<div class="preview-search-empty">Здесь показываются результаты поиска</div></section>' +
      '<section class="preview-search-panel"><div class="preview-card-title"><h1>Фильтры</h1></div>' +
      '<div class="preview-search-fields"><strong>Уточнить условия</strong>' +
      (controls || '<p class="preview-example">Настраиваемые поля поиска выключены.</p>') +
      '<label class="preview-option"><input type="checkbox"> Пользователи онлайн</label>' +
      '<label class="preview-option"><input type="checkbox"> Проверенные пользователи</label>' +
      '<label class="preview-option"><input type="checkbox"' +
      (audienceSelect.value === "premium" ? "" : " disabled") + '> Только с фото</label></div>' +
      '<div class="preview-footer"><button type="button" class="btn btn-primary" disabled>Показать экспертов</button></div></section></div>';
  }

  function render() {
    const fields = visibleFields();
    audienceLabel.hidden = view === "form";
    viewButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.view === view)));
    content.querySelectorAll("select.selectized").forEach(select => select.selectize?.destroy());
    content.innerHTML = view === "profile" ? profilePage(fields) : view === "form" ? formPage(fields) : searchPage(fields);
    if (window.jQuery?.fn.selectize) {
      window.jQuery(content).find("select[multiple]").selectize({
        plugins: ["remove_button"],
        placeholder: "Выберите варианты"
      });
    }
    document.title = "Предпросмотр — " + (view === "profile" ? "анкета" : view === "form" ? "редактирование" : "фильтр") + " — Confideline";
  }

  typeSelect.addEventListener("change", render);
  audienceSelect.addEventListener("change", render);
  viewButtons.forEach(button => button.addEventListener("click", () => {
    view = button.dataset.view;
    render();
  }));
  document.querySelector("#preview-back").addEventListener("click", event => {
    if (document.referrer && new URL(document.referrer).origin === location.origin) {
      event.preventDefault();
      history.back();
    }
  });
  render();
})();
