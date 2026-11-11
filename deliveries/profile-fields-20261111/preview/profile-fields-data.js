const profileFieldsData = (() => {
  const typeNames = { client: "Клиент", expert: "Эксперт" };
  const profileTypes = Object.keys(typeNames);
  const listSettings = ["view", "premiumView", "search", "premiumSearch"];
  const originalCategories = [
    ["target", "Цель знакомства", 1, false],
    ["about", "Обо мне", 4, false],
    ["appearance", "Appearance", 2, false],
    ["education", "Education and Profession", 2, false],
    ["more", "More About Me", 4, false],
    ["contacts", "Контакты", 3, false],
    ["expertise", "Expertise", 3, true],
    ["experience", "Expert Experience", 2, true]
  ];
  const categories = new Map([
    ["basic", "Основные сведения"],
    ["dating", "Знакомства"],
    ...originalCategories.map(([key, name]) => [key, name])
  ]);
  const propertyNames = {
    form: "В форме", view: "Видимость", premiumView: "Видимо только премиум-пользователям",
    search: "Поиск", premiumSearch: "Поиск (премиум)"
  };
  const modelClasses = {
    text: "Text", textarea: "TextArea", number: "Number",
    select: "Select", multi: "MultiSelect", checkbox: "Checkbox"
  };
  const builtIns = [
    { id: "name", title: "Имя / псевдоним", key: "Profile[name]", component: "text", sample: "Анна" },
    { id: "photo", title: "Фотография", key: "Фотогалерея профиля", component: "photo", sample: "Фото профиля" },
    {
      id: "bio", title: "Описание", key: "Profile[description]", component: "textarea",
      sample: "Рассказываю о себе в анкете."
    },
    {
      id: "birth-date", title: "Дата рождения", key: "Profile[dob]", component: "date",
      sample: "1995-05-14", showInView: false
    },
    {
      id: "country", title: "Страна", key: "Profile[country]", component: "select",
      options: ["Беларусь", "Литва", "Польша"], sample: "Беларусь", canSearch: true
    },
    {
      id: "city", title: "Город", key: "Profile[city]", component: "select",
      options: ["Минск", "Брест", "Гродно"], sample: "Минск", canSearch: true
    },
    {
      id: "sex", title: "Пол",
      key: "Profile[sex]", component: "select", options: ["Не указано", "Мужчина", "Женщина"],
      sample: "Женщина", canSearch: true
    },
    {
      id: "status", title: "Статус отношений", frontTitle: "Статус", category: "dating",
      key: "Profile[status]", component: "select",
      options: ["Не указано", "Свободна", "Встречается с кем-то", "В браке", "Открытые отношения"],
      sample: "Свободна", canSearch: false
    },
    {
      id: "looking", title: "Я ищу", category: "dating",
      key: "Profile[looking_for_sex_array]", component: "multi",
      options: ["Мужчины", "Женщины"], sample: "Мужчины", canSearch: true
    },
    {
      id: "age", title: "Возрастом", category: "dating",
      key: "Profile[looking_for_from_age] и Profile[looking_for_to_age]", component: "age",
      sample: "25–40 лет", canSearch: true
    }
  ].map(field => ({ category: "basic", types: ["client"], ...field, origin: "built-in" }));

  const customCatalog = [
    [7, "Цель знакомства", "target", "Trigger", "multi"],
    [8, "Marital Status", "about", "Marital_status", "select"],
    [11, "Children", "about", "children", "select"],
    [12, "Bad Habits", "about", "bad_hobby", "select"],
    [6, "Favorite Drinks", "about", "favoriteDrink", "multi"],
    [2, "Рост", "appearance", "height", "number"],
    [1, "Вес", "appearance", "weight", "number"],
    [9, "Education", "education", "education", "select"],
    [10, "Профессия", "education", "profession", "select"],
    [15, "Zodiac Sign", "more", "Zodiac", "select"],
    [14, "Pets", "more", "Pets", "checkbox"],
    [5, "My Hobbies", "more", "tags_hobby", "multi"],
    [13, "Religion", "more", "religions", "select"],
    [3, "Facebook", "contacts", "facebookUrl", "text"],
    [4, "Twitter", "contacts", "twitterUrl", "text"],
    [16, "My Telegram", "contacts", "TG", "text"],
    [17, "Направления", "expertise", "value", "multi", "Areas", "Tarot Reader"],
    [18, "Специализация", "expertise", "specialistic", "multi", "Specialization", "Tarot"],
    [19, "Количество консультаций", "experience", "ncons", "select", "Number of Consultations", "Более 500"],
    [20, "Опыт практики", "experience", "experience", "select", "My Experience", "Более 5 лет"],
    [21, "Языки консультаций", "expertise", "language", "multi", "My Languages", "Русский, английский"]
  ].map(([id, title, categoryId, key, component, originalTitle, sample]) => ({
    id: String(id), title, category: categoryId, key, component, originalTitle, sample,
    origin: "custom", types: [id >= 17 ? "expert" : "client"], canSearch: true
  }));

  const emptySettings = {
    form: false, view: false, premiumView: false, search: false, premiumSearch: false, required: false
  };
  return { typeNames, profileTypes, listSettings, originalCategories, categories, propertyNames, modelClasses, builtIns, customCatalog, emptySettings };
})();
