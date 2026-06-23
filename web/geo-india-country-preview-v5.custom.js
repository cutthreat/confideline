const geoExpertPool = [
      {
        id: "mira",
        name: "Мира",
        image: "./img/geo/advisors/expert-mira.png",
        level: "Ведущий эксперт",
        proof: "6 лет практики",
        tone: "rose",
        priority: 96,
        countries: ["india"],
        cities: ["country", "delhi", "mumbai"],
        topics: ["relationship", "compatibility", "choice"],
        copy: {
          default: { role: "Отношения", tag: "отношения", text: "Помогает разобрать паузу в общении, сомнения и возвращение к диалогу." },
          relocation: { role: "Решение в отношениях", tag: "отношения", text: "Подходит, если переезд связан с семьей, партнером или трудным разговором." }
        }
      },
      {
        id: "anaya",
        name: "Аная",
        image: "./img/geo/advisors/expert-anaya.png",
        level: "Синастрия",
        proof: "5 лет практики",
        tone: "violet",
        priority: 94,
        countries: ["india"],
        cities: ["country", "delhi", "bangalore"],
        topics: ["compatibility", "relationship", "relocation"],
        copy: {
          default: { role: "Синастрия", tag: "совместимость", text: "Смотрит совместимость, повторяющиеся сценарии и сильные стороны пары." },
          relocation: { role: "Совместимость", tag: "совместимость", text: "Смотрит, как переезд может повлиять на пару и общие планы." }
        }
      },
      {
        id: "lina",
        name: "Лина",
        image: "./img/geo/advisors/expert-lina.png",
        level: "Мягкая поддержка",
        proof: "4 года практики",
        tone: "blue",
        priority: 92,
        countries: ["india"],
        cities: ["country", "delhi", "goa"],
        topics: ["choice", "relationship", "relocation"],
        copy: {
          default: { role: "Личный выбор", tag: "личный выбор", text: "Помогает сформулировать вопрос и отделить тревогу от решения." },
          relocation: { role: "Личный выбор", tag: "выбор", text: "Помогает сравнить несколько сценариев и выбрать спокойный следующий шаг." }
        }
      },
      {
        id: "devi",
        name: "Деви",
        image: "./img/geo/advisors/expert-devi.png",
        level: "Астрокартография",
        proof: "7 лет практики",
        tone: "teal",
        priority: 91,
        countries: ["india"],
        cities: ["country", "delhi", "mumbai", "bangalore"],
        topics: ["relocation", "choice", "compatibility"],
        copy: {
          default: { role: "Астрокартография", tag: "локация", text: "Смотрит, как страна и город могут усиливать семейный или личный сценарий." },
          relocation: { role: "Астрокартография", tag: "переезд", text: "Подходит для вопросов о стране, городе, адаптации и смене ритма жизни." }
        }
      },
      {
        id: "sofia",
        name: "София",
        image: "./img/geo/advisors/expert-mira.png",
        level: "Таро и отношения",
        proof: "8 лет практики",
        tone: "rose",
        priority: 88,
        countries: ["india"],
        cities: ["country", "goa", "mumbai"],
        topics: ["relationship", "choice"],
        copy: { default: { role: "Таро", tag: "отношения", text: "Помогает увидеть эмоциональный фон, скрытые ожидания и следующий разговор." } }
      },
      {
        id: "olivia",
        name: "Оливия",
        image: "./img/geo/advisors/expert-lina.png",
        level: "Натальная карта",
        proof: "6 лет практики",
        tone: "blue",
        priority: 87,
        countries: ["india"],
        cities: ["country", "bangalore"],
        topics: ["choice", "relocation"],
        copy: { default: { role: "Натальная карта", tag: "выбор", text: "Показывает, какие личные циклы сейчас сильнее влияют на решение." } }
      },
      {
        id: "naomi",
        name: "Наоми",
        image: "./img/geo/advisors/expert-anaya.png",
        level: "Совместимость",
        proof: "5 лет практики",
        tone: "violet",
        priority: 86,
        countries: ["india"],
        cities: ["country", "delhi"],
        topics: ["compatibility", "relationship"],
        copy: { default: { role: "Совместимость", tag: "пара", text: "Разбирает динамику пары, разные ожидания и повторяющиеся сценарии." } }
      },
      {
        id: "elina",
        name: "Элина",
        image: "./img/geo/advisors/expert-devi.png",
        level: "Астрокартография",
        proof: "9 лет практики",
        tone: "teal",
        priority: 85,
        countries: ["india"],
        cities: ["country", "mumbai", "goa"],
        topics: ["relocation", "choice"],
        copy: { default: { role: "Астрокартография", tag: "город", text: "Сравнивает города и районы, где легче держать фокус и ресурс." } }
      },
      {
        id: "reya",
        name: "Рея",
        image: "./img/geo/advisors/expert-mira.png",
        level: "Личный разбор",
        proof: "4 года практики",
        tone: "rose",
        priority: 83,
        countries: ["india"],
        cities: ["country", "delhi"],
        topics: ["relationship", "choice"],
        copy: { default: { role: "Личный разбор", tag: "диалог", text: "Подходит, когда вопрос пока звучит нечетко, но решение откладывать нельзя." } }
      },
      {
        id: "sara",
        name: "Сара",
        image: "./img/geo/advisors/expert-anaya.png",
        level: "Синастрия",
        proof: "7 лет практики",
        tone: "violet",
        priority: 82,
        countries: ["india"],
        cities: ["country", "mumbai", "bangalore"],
        topics: ["compatibility", "relocation"],
        copy: { default: { role: "Синастрия", tag: "совместимость", text: "Проверяет, как выбранная среда влияет на близость, планы и устойчивость пары." } }
      },
      {
        id: "inga",
        name: "Инга",
        image: "./img/geo/advisors/expert-lina.png",
        level: "Карьерный выбор",
        proof: "6 лет практики",
        tone: "blue",
        priority: 81,
        countries: ["india"],
        cities: ["country", "bangalore", "mumbai"],
        topics: ["choice", "relocation"],
        copy: { default: { role: "Карьерный выбор", tag: "работа", text: "Помогает сопоставить карьерный ритм города с личным состоянием и целями." } }
      },
      {
        id: "maya",
        name: "Майя",
        image: "./img/geo/advisors/expert-devi.png",
        level: "Таро и циклы",
        proof: "5 лет практики",
        tone: "teal",
        priority: 79,
        countries: ["india"],
        cities: ["country", "goa"],
        topics: ["choice", "relationship"],
        copy: { default: { role: "Таро", tag: "сценарии", text: "Сравнивает несколько вариантов и помогает увидеть, где меньше внутреннего шума." } }
      },
      {
        id: "kamilla",
        name: "Камилла",
        image: "./img/geo/advisors/expert-mira.png",
        level: "Отношения",
        proof: "5 лет практики",
        tone: "rose",
        priority: 78,
        countries: ["india"],
        cities: ["country", "delhi", "goa"],
        topics: ["relationship", "compatibility"],
        copy: { default: { role: "Отношения", tag: "семья", text: "Разбирает семейное давление, паузы в общении и сложные разговоры." } }
      },
      {
        id: "nika",
        name: "Ника",
        image: "./img/geo/advisors/expert-anaya.png",
        level: "Натальная карта",
        proof: "4 года практики",
        tone: "violet",
        priority: 76,
        countries: ["india"],
        cities: ["country", "bangalore"],
        topics: ["choice", "compatibility"],
        copy: { default: { role: "Натальная карта", tag: "циклы", text: "Показывает, какие внутренние темы сейчас сильнее всего требуют внимания." } }
      },
      {
        id: "viola",
        name: "Виола",
        image: "./img/geo/advisors/expert-lina.png",
        level: "Мягкая поддержка",
        proof: "3 года практики",
        tone: "blue",
        priority: 74,
        countries: ["india"],
        cities: ["country", "mumbai"],
        topics: ["relationship", "choice", "relocation"],
        copy: { default: { role: "Поддержка", tag: "ясность", text: "Помогает спокойно описать ситуацию и не принимать решение из тревоги." } }
      },
      {
        id: "tais",
        name: "Таис",
        image: "./img/geo/advisors/expert-devi.png",
        level: "Астрокартография",
        proof: "6 лет практики",
        tone: "teal",
        priority: 72,
        countries: ["india"],
        cities: ["country", "delhi", "bangalore", "goa"],
        topics: ["relocation", "choice"],
        copy: { default: { role: "Астрокартография", tag: "локация", text: "Смотрит страну, город и период как единую карту следующего шага." } }
      }
    ];

    const form = document.querySelector("#countryFilter");
    const countrySelect = form.querySelector(".js-geo-country");
    const citySelect = form.querySelector(".js-geo-city");
    const list = document.querySelector(".js-advisors");
    const onboarding = document.querySelector("[data-onboarding]");
    const questionModal = document.querySelector("[data-question-modal]");
    const questionContext = document.querySelector(".js-question-context");
    const geoSwitchModal = document.querySelector("[data-geo-switch-modal]");
    const geoSwitchText = document.querySelector(".js-geo-switch-text");
    const geoSwitchLink = document.querySelector(".js-geo-switch-link");
    let onboardingReturnFocus = null;

    const geoTargets = {
      countries: {
        italy: { label: "Италия", href: "https://confideline.com/ru/country/italy" },
        france: { label: "Франция", href: "https://confideline.com/ru/country/france" },
        japan: { label: "Япония", href: "https://confideline.com/ru/country/japan" },
        canada: { label: "Канада", href: "https://confideline.com/ru/country/canada" }
      },
      cities: {
        delhi: { label: "Дели", href: "geo-delhi-city-preview-v4.html" },
        mumbai: { label: "Мумбаи", href: "https://confideline.com/ru/city/mumbai" },
        bangalore: { label: "Бангалор", href: "https://confideline.com/ru/city/bangalore" },
        goa: { label: "Гоа", href: "https://confideline.com/ru/city/goa" },
        paris: { label: "Париж", href: "https://confideline.com/ru/city/paris" },
        rome: { label: "Рим", href: "https://confideline.com/ru/city/rome" },
        tokyo: { label: "Токио", href: "https://confideline.com/ru/city/tokyo" },
        toronto: { label: "Торонто", href: "https://confideline.com/ru/city/toronto" }
      }
    };

    const cityOptionsByCountry = {
      india: [
        { value: "delhi", label: "Дели" },
        { value: "mumbai", label: "Мумбаи" },
        { value: "bangalore", label: "Бангалор" },
        { value: "goa", label: "Гоа" }
      ],
      italy: [
        { value: "rome", label: "Рим" }
      ],
      france: [
        { value: "paris", label: "Париж" }
      ],
      japan: [
        { value: "tokyo", label: "Токио" }
      ],
      canada: [
        { value: "toronto", label: "Торонто" }
      ]
    };
    const geoSeedKey = "confidelineGeoExpertSeed";
    const geoContextKey = "confidelineGeoExpertContext";
    const visibleGeoExpertCards = 4;
    const topicCopyFallback = {
      relationship: { role: "Отношения", tag: "отношения", text: "Помогает разобрать связь, паузу в общении, сомнения и следующий шаг." },
      compatibility: { role: "Совместимость", tag: "совместимость", text: "Смотрит динамику пары, разные ожидания и устойчивость выбранного сценария." },
      relocation: { role: "Переезд", tag: "переезд", text: "Помогает сравнить страну, город и период для спокойного решения о переменах." },
      choice: { role: "Личный выбор", tag: "личный выбор", text: "Помогает сформулировать вопрос и выбрать направление без лишнего давления." }
    };

    function readCookie(name) {
      return document.cookie
        .split("; ")
        .find(row => row.startsWith(`${name}=`))
        ?.split("=")[1] || "";
    }

    function writeCookie(name, value) {
      document.cookie = `${name}=${encodeURIComponent(value)}; max-age=31536000; path=/; samesite=lax`;
    }

    function getVisitorSeed() {
      let seed = localStorage.getItem(geoSeedKey) || decodeURIComponent(readCookie(geoSeedKey));
      if (!seed) {
        seed = crypto && crypto.getRandomValues
          ? String(crypto.getRandomValues(new Uint32Array(1))[0])
          : String(Date.now());
      }
      localStorage.setItem(geoSeedKey, seed);
      writeCookie(geoSeedKey, seed);
      return seed;
    }

    function hashString(value) {
      let hash = 2166136261;
      for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }
      return hash >>> 0;
    }

    function stableRotate(items, context, limit = visibleGeoExpertCards) {
      const source = [...items];
      const offset = hashString(`${getVisitorSeed()}|${context}`) % source.length;
      return source.slice(offset).concat(source.slice(0, offset)).slice(0, limit);
    }

    function currentContextKey() {
      const topic = selectedTopicValue();
      const city = selectedCityValue();
      return `india:${city}:${topic}`;
    }

    function selectedCityValue() {
      return citySelect.value || "country";
    }

    function selectedTopicValue() {
      return form.querySelector(".js-topic:checked")?.value || "relationship";
    }

    function selectedTopicText() {
      const checkedTopic = form.querySelector(".js-topic:checked");
      if (!checkedTopic) return "Выберите тему";
      return checkedTopic.closest(".geo-topic-option").querySelector(".geo-topic-option__label").textContent;
    }

    function selectedCityText() {
      if (!citySelect.value) return "Все города";
      return citySelect.selectedOptions[0]?.textContent || "Все города";
    }

    function populateCitySelect(countryValue) {
      const cities = cityOptionsByCountry[countryValue] || [];
      citySelect.innerHTML = '<option value="" selected disabled hidden>Город</option>';
      cities.forEach(city => {
        const option = document.createElement("option");
        option.value = city.value;
        option.textContent = city.label;
        citySelect.append(option);
      });
      citySelect.value = "";
      citySelect.disabled = cities.length === 0;
    }

    function promptTopicOptions() {
      const topicOptions = form.querySelector(".geo-topic-options--city-v2");
      if (!topicOptions) return;
      topicOptions.classList.remove("is-prompting");
      void topicOptions.offsetWidth;
      topicOptions.classList.add("is-prompting");
      window.setTimeout(() => topicOptions.classList.remove("is-prompting"), 760);
    }

    function clearSelectedTopic() {
      form.querySelectorAll(".js-topic:checked").forEach(topic => {
        topic.checked = false;
      });
    }

    function getExpertCopy(expert, topic) {
      return expert.copy[topic] || topicCopyFallback[topic] || expert.copy.default;
    }

    function scoreExpert(expert, city, topic, context) {
      const topicScore = expert.topics.includes(topic) ? 100 : 0;
      const cityScore = expert.cities.includes(city) ? 44 : expert.cities.includes("country") ? 22 : 0;
      const stableOffset = hashString(`${getVisitorSeed()}|${context}|${expert.id}`) % 19;
      return topicScore + cityScore + expert.priority + stableOffset;
    }

    function selectLocalExperts() {
      const topic = selectedTopicValue();
      const city = selectedCityValue();
      const context = currentContextKey();
      const topicMatched = geoExpertPool.filter(expert => expert.countries.includes("india") && expert.topics.includes(topic));
      const sourcePool = topicMatched.length >= visibleGeoExpertCards
        ? topicMatched
        : geoExpertPool.filter(expert => expert.countries.includes("india"));
      const matched = sourcePool
        .map(expert => ({
          expert,
          copy: getExpertCopy(expert, topic),
          score: scoreExpert(expert, city, topic, context)
        }))
        .sort((left, right) => right.score - left.score || left.expert.name.localeCompare(right.expert.name, "ru"));

      return stableRotate(matched, context, visibleGeoExpertCards);
    }

    function renderAdvisors(options = {}) {
      const context = currentContextKey();
      const advisors = selectLocalExperts();
      localStorage.setItem(geoContextKey, context);
      list.innerHTML = advisors.map(({ expert, copy }, index) => {
        const progress = advisors.map((_, progressIndex) => `<span class="${progressIndex === index ? "is-active" : ""}"></span>`).join("");
        return `
        <article class="geo-advisor ${index === 0 ? "is-selected" : ""}" tabindex="0" data-expert-id="${expert.id}" data-name="${expert.name}" data-role="${copy.role}" data-text="${copy.text}" data-tone="${expert.tone}" aria-selected="${index === 0 ? "true" : "false"}">
          <div class="geo-advisor__progress" aria-hidden="true">${progress}</div>
          <div class="geo-advisor__top">
            <img class="geo-advisor__avatar" src="${expert.image}" alt="${expert.name}">
            <div class="geo-advisor__identity">
              <strong>${expert.name}</strong>
            </div>
          </div>
          <div class="geo-advisor__meta">
            <span>${expert.level}</span>
            <span>${expert.proof}</span>
          </div>
          <small>${copy.text}</small>
          <a class="btn btn-primary geo-advisor__cta" href="https://confideline.com/registration/register" target="_blank" rel="noopener" data-expert="${expert.name}" data-tone="${expert.tone}">Регистрация</a>
        </article>
      `;
      }).join("");
      if (options.scroll) {
        document.querySelector("#consultants").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    function openGeoSwitch(target) {
      if (!target) return;
      geoSwitchText.textContent = `Вы выбрали страну «${target.label}». Для нее лучше открыть отдельную страницу с правильным текстом, фото и экспертами.`;
      geoSwitchLink.href = target.href;
      geoSwitchLink.textContent = `Перейти: ${target.label}`;
      geoSwitchModal.hidden = false;
      document.body.classList.add("geo-modal-open");
      geoSwitchModal.querySelector(".geo-modal__close").focus();
    }

    function closeGeoSwitch() {
      geoSwitchModal.hidden = true;
      document.body.classList.remove("geo-modal-open");
      countrySelect.value = "";
      populateCitySelect("");
    }

    function handleGeoSelectChange(event) {
      if (event.target === countrySelect) {
        populateCitySelect(countrySelect.value);
        clearSelectedTopic();
        return;
      }

      if (event.target === citySelect && citySelect.value) {
        clearSelectedTopic();
        promptTopicOptions();
      }
    }

    countrySelect.addEventListener("change", handleGeoSelectChange);
    citySelect.addEventListener("change", handleGeoSelectChange);

    form.addEventListener("change", event => {
      if (event.target.classList.contains("js-topic")) {
        const cityTarget = geoTargets.cities[citySelect.value];
        const countryTarget = geoTargets.countries[countrySelect.value];
        if (cityTarget) {
          window.location.href = cityTarget.href;
          return;
        }
        if (!citySelect.value && countryTarget) {
          window.location.href = countryTarget.href;
          return;
        }
        renderAdvisors({ userAction: true });
      }
    });

    form.addEventListener("submit", event => {
      event.preventDefault();
      renderAdvisors({ scroll: true, userAction: true });
    });

    function setActiveAdvisor(card) {
      if (!card) return;
      list.querySelectorAll(".geo-advisor").forEach(item => {
        item.classList.remove("is-selected");
        item.setAttribute("aria-selected", "false");
      });
      card.classList.add("is-selected");
      card.setAttribute("aria-selected", "true");
    }

    function syncAdvisorFromScroll() {
      const cards = Array.from(list.querySelectorAll(".geo-advisor"));
      if (!cards.length) return;
      const listRect = list.getBoundingClientRect();
      const listCenter = listRect.left + listRect.width / 2;
      const closest = cards.reduce((winner, card) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - listCenter);
        return distance < winner.distance ? { card, distance } : winner;
      }, { card: cards[0], distance: Infinity }).card;
      setActiveAdvisor(closest);
    }

    let advisorScrollTimer = null;
    let advisorSwipe = null;
    let advisorSuppressClick = false;

    function moveAdvisorBy(direction) {
      const cards = Array.from(list.querySelectorAll(".geo-advisor"));
      if (!cards.length) return;
      const activeIndex = Math.max(0, cards.findIndex(card => card.classList.contains("is-selected")));
      const nextIndex = (activeIndex + direction + cards.length) % cards.length;
      setActiveAdvisor(cards[nextIndex]);
      cards[nextIndex].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }

    function currentContextText() {
      return `Индия / ${selectedCityText()} / ${selectedTopicText()}`;
    }

    function openQuestion(card) {
      if (!card) return;
      setActiveAdvisor(card);
      questionContext.textContent = `Эксперт: ${card.dataset.name}. ${currentContextText()}. После входа вопрос сохранится и откроется следующий шаг консультации.`;
      questionModal.hidden = false;
      document.body.classList.add("geo-modal-open");
      questionModal.querySelector("textarea").focus();
    }

    function closeQuestion() {
      questionModal.hidden = true;
      document.body.classList.remove("geo-modal-open");
    }

    list.addEventListener("click", event => {
      if (advisorSuppressClick) return;
      if (event.target.closest(".geo-advisor__cta")) return;
      const card = event.target.closest(".geo-advisor");
      if (window.matchMedia("(max-width: 767.98px)").matches && !card) {
        moveAdvisorBy(1);
        return;
      }
      if (!card) return;
      if (window.matchMedia("(max-width: 767.98px)").matches && card.classList.contains("is-selected")) {
        moveAdvisorBy(1);
        return;
      }
      setActiveAdvisor(card);
      if (window.matchMedia("(max-width: 767.98px)").matches) {
        card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    });

    list.addEventListener("keydown", event => {
      if (event.target.closest(".geo-advisor__cta")) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      const card = event.target.closest(".geo-advisor");
      if (!card) return;
      event.preventDefault();
      card.click();
    });

    document.querySelectorAll("[data-advisor-scroll]").forEach(button => {
      button.addEventListener("click", () => {
        const direction = button.dataset.advisorScroll === "next" ? 1 : -1;
        moveAdvisorBy(direction);
      });
    });

    list.addEventListener("scroll", () => {
      if (window.matchMedia("(min-width: 768px)").matches) return;
      clearTimeout(advisorScrollTimer);
      advisorScrollTimer = setTimeout(syncAdvisorFromScroll, 120);
    }, { passive: true });

    list.addEventListener("pointerdown", event => {
      if (window.matchMedia("(min-width: 768px)").matches) return;
      if (!event.target.closest(".geo-advisor") || event.target.closest(".geo-advisor__cta")) return;
      advisorSwipe = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        dragging: false
      };
      list.setPointerCapture(event.pointerId);
    });

    list.addEventListener("pointermove", event => {
      if (!advisorSwipe || event.pointerId !== advisorSwipe.pointerId) return;
      const deltaX = event.clientX - advisorSwipe.startX;
      const deltaY = event.clientY - advisorSwipe.startY;
      if (!advisorSwipe.dragging && Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        advisorSwipe.dragging = true;
      }
      if (!advisorSwipe.dragging) return;
      event.preventDefault();
      list.scrollLeft -= event.clientX - advisorSwipe.lastX;
      advisorSwipe.lastX = event.clientX;
    });

    list.addEventListener("pointerup", event => {
      if (!advisorSwipe || event.pointerId !== advisorSwipe.pointerId) return;
      const deltaX = event.clientX - advisorSwipe.startX;
      const shouldMove = advisorSwipe.dragging && Math.abs(deltaX) > 38;
      list.releasePointerCapture(event.pointerId);
      advisorSwipe = null;
      if (!shouldMove) {
        syncAdvisorFromScroll();
        return;
      }
      advisorSuppressClick = true;
      window.setTimeout(() => {
        advisorSuppressClick = false;
      }, 180);
      moveAdvisorBy(deltaX < 0 ? 1 : -1);
    });

    list.addEventListener("pointercancel", event => {
      if (!advisorSwipe || event.pointerId !== advisorSwipe.pointerId) return;
      list.releasePointerCapture(event.pointerId);
      advisorSwipe = null;
      syncAdvisorFromScroll();
    });
    const scrollTrigger = document.querySelector("[data-scroll]");
    if (scrollTrigger) {
      scrollTrigger.addEventListener("click", event => {
        document.querySelector(event.currentTarget.dataset.scroll).scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    function openOnboarding(trigger) {
      onboardingReturnFocus = trigger;
      onboarding.hidden = false;
      document.body.classList.add("geo-modal-open");
      onboarding.querySelector(".geo-modal__close").focus();
    }

    function closeOnboarding() {
      onboarding.hidden = true;
      document.body.classList.remove("geo-modal-open");
      if (onboardingReturnFocus) {
        onboardingReturnFocus.focus();
      }
    }

    document.querySelectorAll("[data-open-onboarding]").forEach(button => {
      button.addEventListener("click", () => openOnboarding(button));
    });

    document.querySelectorAll("[data-close-onboarding]").forEach(button => {
      button.addEventListener("click", closeOnboarding);
    });

    document.querySelectorAll("[data-close-question]").forEach(button => {
      button.addEventListener("click", closeQuestion);
    });

    document.querySelectorAll("[data-close-geo-switch]").forEach(button => {
      button.addEventListener("click", closeGeoSwitch);
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !onboarding.hidden) {
        closeOnboarding();
      }
      if (event.key === "Escape" && questionModal && !questionModal.hidden) {
        closeQuestion();
      }
      if (event.key === "Escape" && geoSwitchModal && !geoSwitchModal.hidden) {
        closeGeoSwitch();
      }
    });

    const faq = document.querySelector("[data-faq]");

    function setFaqState(activeItem) {
      const faqItems = Array.from(faq.querySelectorAll(".geo-faq__item"));
      const shouldClose = activeItem.classList.contains("is-open");
      faqItems.forEach(item => {
        const shouldOpen = item === activeItem && !shouldClose;
        item.classList.toggle("is-open", shouldOpen);
        item.setAttribute("aria-expanded", String(shouldOpen));
      });
    }

    if (faq) {
      faq.addEventListener("click", event => {
        const item = event.target.closest(".geo-faq__item");
        if (!item || !faq.contains(item)) return;
        setFaqState(item);
      });

      faq.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const item = event.target.closest(".geo-faq__item");
        if (!item || !faq.contains(item)) return;
        event.preventDefault();
        setFaqState(item);
      });
    }

    renderAdvisors();

