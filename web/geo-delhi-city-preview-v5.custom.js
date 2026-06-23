const advisorData = {
      relationship: [
        { name: "Мира", role: "Отношения", text: "Помогает разобрать паузу в общении, сомнения и возвращение к диалогу.", tag: "отношения" },
        { name: "Аная", role: "Отношения", text: "Подходит, если нужно понять динамику пары и разные ожидания партнеров.", tag: "отношения" },
        { name: "Лина", role: "Отношения", text: "Помогает сформулировать вопрос и отделить тревогу от решения.", tag: "отношения" },
        { name: "Деви", role: "Отношения", text: "Смотрит, как Дели может усиливать семейный или личный сценарий.", tag: "отношения" }
      ],
      relocation: [
        { name: "Деви", role: "Переезд", text: "Подходит для вопросов о городе, адаптации и смене ритма жизни.", tag: "переезд" },
        { name: "Лина", role: "Переезд", text: "Помогает сравнить несколько сценариев без давления.", tag: "переезд" },
        { name: "Мира", role: "Переезд", text: "Подходит, если переезд связан с человеком или общими планами.", tag: "переезд" },
        { name: "Аная", role: "Переезд", text: "Разбирает, как переезд влияет на динамику пары и ожидания партнеров.", tag: "переезд" }
      ],
      career: [
        { name: "Деви", role: "Карьера", text: "Разбирает карьерные циклы, перегруз и моменты для осторожных решений.", tag: "карьера" },
        { name: "Лина", role: "Карьера", text: "Помогает сравнить варианты и выбрать следующий спокойный шаг.", tag: "карьера" },
        { name: "Аная", role: "Карьера", text: "Подходит, если карьерный выбор влияет на отношения или переезд.", tag: "карьера" },
        { name: "Мира", role: "Карьера", text: "Помогает подготовить разговор, если работа влияет на пару или семью.", tag: "карьера" }
      ],
      compatibility: [
        { name: "Аная", role: "Совместимость", text: "Смотрит совместимость, повторяющиеся сценарии и сильные стороны пары.", tag: "совместимость" },
        { name: "Мира", role: "Совместимость", text: "Помогает понять, стоит ли продолжать разговор и как снизить напряжение.", tag: "совместимость" },
        { name: "Деви", role: "Совместимость", text: "Показывает, какие личные циклы влияют на отношения сейчас.", tag: "совместимость" },
        { name: "Лина", role: "Совместимость", text: "Помогает назвать вопрос простыми словами и выбрать следующий шаг.", tag: "совместимость" }
      ]
    };

    const advisorProfiles = {
      "Мира": { id: "mira", image: "img/geo/advisors/expert-mira.png", level: "Ведущий консультант", proof: "6 лет практики", tone: "rose" },
      "Аная": { id: "anaya", image: "img/geo/advisors/expert-anaya.png", level: "Синастрия", proof: "5 лет практики", tone: "violet" },
      "Лина": { id: "lina", image: "img/geo/advisors/expert-lina.png", level: "Мягкая поддержка", proof: "4 года практики", tone: "blue" },
      "Деви": { id: "devi", image: "img/geo/advisors/expert-devi.png", level: "Астрокартография", proof: "7 лет практики", tone: "teal" }
    };

    const advisorExtras = {
      relationship: [
        { name: "София", profile: "Мира", role: "Отношения", text: "Помогает увидеть, где в общении накопилась усталость и как вернуть спокойный тон.", tag: "отношения" },
        { name: "Ника", profile: "Аная", role: "Отношения", text: "Разбирает смешанные сигналы, паузы и ожидания без давления на решение.", tag: "отношения" },
        { name: "Элина", profile: "Лина", role: "Отношения", text: "Помогает сформулировать вопрос партнеру так, чтобы разговор не ушел в спор.", tag: "отношения" },
        { name: "Рея", profile: "Деви", role: "Отношения", text: "Смотрит, как городская нагрузка влияет на близость, доверие и личные границы.", tag: "отношения" },
        { name: "Илана", profile: "Мира", role: "Отношения", text: "Подходит, если нужно отделить тревогу от фактов и понять следующий шаг.", tag: "отношения" },
        { name: "Тара", profile: "Аная", role: "Отношения", text: "Помогает понять повторяющийся сценарий пары и выбрать мягкую точку входа.", tag: "отношения" },
        { name: "Майя", profile: "Лина", role: "Отношения", text: "Разбирает ситуацию после ссоры, молчания или резкого изменения дистанции.", tag: "отношения" },
        { name: "Самира", profile: "Деви", role: "Отношения", text: "Смотрит, как личные циклы и среда Дели усиливают ожидания в паре.", tag: "отношения" }
      ],
      relocation: [
        { name: "София", profile: "Деви", role: "Переезд", text: "Помогает оценить адаптацию, быт и эмоциональную цену нового маршрута.", tag: "переезд" },
        { name: "Ника", profile: "Лина", role: "Переезд", text: "Сравнивает несколько сценариев переезда и помогает выбрать спокойный шаг.", tag: "переезд" },
        { name: "Элина", profile: "Мира", role: "Переезд", text: "Подходит, когда переезд связан с отношениями, семьей или совместным планом.", tag: "переезд" },
        { name: "Рея", profile: "Аная", role: "Переезд", text: "Разбирает, как смена города меняет динамику пары и ожидания партнеров.", tag: "переезд" },
        { name: "Илана", profile: "Деви", role: "Переезд", text: "Смотрит карту места, ритм города и точки, где может появиться перегруз.", tag: "переезд" },
        { name: "Тара", profile: "Лина", role: "Переезд", text: "Помогает собрать аргументы за и против без ощущения срочности.", tag: "переезд" },
        { name: "Майя", profile: "Мира", role: "Переезд", text: "Разбирает разговор о переезде, если решение зависит от другого человека.", tag: "переезд" },
        { name: "Самира", profile: "Аная", role: "Переезд", text: "Подходит, если переезд может изменить баланс роли, работы и отношений.", tag: "переезд" }
      ],
      career: [
        { name: "София", profile: "Деви", role: "Карьера", text: "Разбирает рабочую нагрузку, сроки и моменты, когда лучше не торопиться.", tag: "карьера" },
        { name: "Ника", profile: "Лина", role: "Карьера", text: "Помогает выбрать следующий шаг, если вариантов много и все выглядят рискованно.", tag: "карьера" },
        { name: "Элина", profile: "Аная", role: "Карьера", text: "Смотрит, как карьерное решение влияет на отношения и личную устойчивость.", tag: "карьера" },
        { name: "Рея", profile: "Мира", role: "Карьера", text: "Помогает подготовить разговор о работе, деньгах или смене графика.", tag: "карьера" },
        { name: "Илана", profile: "Деви", role: "Карьера", text: "Оценивает циклы роста, усталость и подходящее окно для осторожного движения.", tag: "карьера" },
        { name: "Тара", profile: "Лина", role: "Карьера", text: "Помогает сравнить стабильность, амбиции и личный ресурс.", tag: "карьера" },
        { name: "Майя", profile: "Аная", role: "Карьера", text: "Разбирает карьерный выбор, если он меняет планы пары или семьи.", tag: "карьера" },
        { name: "Самира", profile: "Мира", role: "Карьера", text: "Помогает назвать рабочий запрос простыми словами перед консультацией.", tag: "карьера" }
      ],
      compatibility: [
        { name: "София", profile: "Аная", role: "Совместимость", text: "Смотрит сильные стороны пары и зоны, где ожидания говорят на разных языках.", tag: "совместимость" },
        { name: "Ника", profile: "Мира", role: "Совместимость", text: "Помогает понять, стоит ли продолжать разговор и как снизить напряжение.", tag: "совместимость" },
        { name: "Элина", profile: "Деви", role: "Совместимость", text: "Показывает, какие личные циклы влияют на контакт сейчас.", tag: "совместимость" },
        { name: "Рея", profile: "Лина", role: "Совместимость", text: "Помогает сформулировать общий вопрос без обвинений и лишней драматизации.", tag: "совместимость" },
        { name: "Илана", profile: "Аная", role: "Совместимость", text: "Разбирает повторяющийся сценарий пары и точки, где можно договориться.", tag: "совместимость" },
        { name: "Тара", profile: "Мира", role: "Совместимость", text: "Подходит для сомнений, когда есть чувства, но не хватает ясности.", tag: "совместимость" },
        { name: "Майя", profile: "Деви", role: "Совместимость", text: "Смотрит влияние места, темпа жизни и личных циклов на динамику пары.", tag: "совместимость" },
        { name: "Самира", profile: "Лина", role: "Совместимость", text: "Помогает выбрать спокойную формулировку для следующего разговора.", tag: "совместимость" }
      ]
    };

    const advisorPool = Object.fromEntries(
      Object.entries(advisorData).map(([topic, advisors]) => [topic, advisors.concat(advisorExtras[topic] || [])])
    );
    const advisorPageSize = 4;
    const advisorOffsets = {};
    let advisorLoading = false;

    const form = document.querySelector("#cityFilter");
    const countrySelect = form.querySelector(".js-geo-country");
    const citySelect = form.querySelector(".js-geo-city");
    const list = document.querySelector(".js-advisors");
    const moreAdvisorsButton = document.querySelector("[data-advisors-more]");
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

    function selectedTopicValue() {
      return form.querySelector(".js-topic:checked")?.value || "relationship";
    }

    function selectedTopicText() {
      const checkedTopic = form.querySelector(".js-topic:checked");
      if (!checkedTopic) return "Выберите тему";
      return checkedTopic.closest(".geo-topic-option").querySelector(".geo-topic-option__label").textContent.trim();
    }

    function advisorCardTemplate(advisor, index, batchSize, selected) {
      const profile = advisorProfiles[advisor.profile || advisor.name];
      const progress = Array.from({ length: batchSize }, (_, progressIndex) => `<span class="${progressIndex === index % batchSize ? "is-active" : ""}"></span>`).join("");
      return `
          <article class="geo-advisor ${selected ? "is-selected" : ""}" tabindex="0" data-expert-id="${profile.id}" data-name="${advisor.name}" data-role="${advisor.role}" data-text="${advisor.text}" data-tone="${profile.tone}" aria-selected="${selected ? "true" : "false"}">
            <div class="geo-advisor__progress" aria-hidden="true">${progress}</div>
            <div class="geo-advisor__top">
              <img class="geo-advisor__avatar" src="${profile.image}" alt="${advisor.name}">
              <div class="geo-advisor__identity">
                <strong>${advisor.name}</strong>
              </div>
            </div>
            <div class="geo-advisor__meta">
              <span>${advisor.role}</span>
              <span>${profile.proof}</span>
            </div>
            <small>${advisor.text}</small>
            <a class="btn btn-primary geo-advisor__cta" href="https://confideline.com/registration/register" target="_blank" rel="noopener" data-expert="${advisor.name}" data-tone="${profile.tone}">Регистрация</a>
          </article>
        `;
    }

    function updateMoreAdvisorsButton(topic) {
      if (!moreAdvisorsButton) return;
      const pool = advisorPool[topic] || advisorPool.relationship;
      const offset = advisorOffsets[topic] || advisorPageSize;
      const hasMore = offset < pool.length;
      moreAdvisorsButton.hidden = !hasMore;
      moreAdvisorsButton.disabled = advisorLoading || !hasMore;
      moreAdvisorsButton.textContent = advisorLoading ? "Загрузка..." : "Еще";
    }

    function renderAdvisors() {
      const topic = selectedTopicValue();
      const advisors = (advisorPool[topic] || advisorPool.relationship).slice(0, advisorPageSize);
      advisorOffsets[topic] = advisorPageSize;
      list.innerHTML = advisors.map((advisor, index) => advisorCardTemplate(advisor, index, advisors.length, index === 0)).join("");
      updateMoreAdvisorsButton(topic);
    }

    function fetchAdvisorBatch(topic, offset) {
      const pool = advisorPool[topic] || advisorPool.relationship;
      return new Promise(resolve => {
        window.setTimeout(() => resolve(pool.slice(offset, offset + advisorPageSize)), 260);
      });
    }

    async function loadMoreAdvisors() {
      if (advisorLoading) return;
      const topic = selectedTopicValue();
      const offset = advisorOffsets[topic] || advisorPageSize;
      advisorLoading = true;
      updateMoreAdvisorsButton(topic);
      const batch = await fetchAdvisorBatch(topic, offset);
      advisorLoading = false;
      if (!batch.length) {
        updateMoreAdvisorsButton(topic);
        return;
      }
      const currentCount = list.querySelectorAll(".geo-advisor").length;
      list.insertAdjacentHTML("beforeend", batch.map((advisor, index) => advisorCardTemplate(advisor, currentCount + index, batch.length, false)).join(""));
      advisorOffsets[topic] = offset + batch.length;
      updateMoreAdvisorsButton(topic);
    }

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
      return `Индия / Дели / ${selectedTopicText()}`;
    }

    function openQuestionModal(card) {
      const expertName = card.dataset.name || "эксперт";
      const expertText = card.dataset.text || "";
      questionContext.textContent = `Эксперт: ${expertName}. ${currentContextText()}. После входа вопрос сохранится и откроется следующий шаг консультации. ${expertText}`;
      questionModal.hidden = false;
      document.body.classList.add("geo-modal-open");
      questionModal.querySelector("textarea").focus();
    }

    function closeQuestionModal() {
      questionModal.hidden = true;
      document.body.classList.remove("geo-modal-open");
    }

    function resetGeoFilters() {
      countrySelect.value = "";
      populateCitySelect("");
    }

    function openGeoSwitch(target, type) {
      const targetType = type === "city" ? "города" : "страны";
      geoSwitchText.textContent = `Вы выбрали страницу ${targetType} «${target.label}». Для нее лучше открыть отдельную посадочную страницу с правильным текстом, фото и экспертами.`;
      geoSwitchLink.href = target.href;
      geoSwitchLink.textContent = `Перейти: ${target.label}`;
      geoSwitchModal.hidden = false;
      document.body.classList.add("geo-modal-open");
      geoSwitchModal.querySelector(".geo-modal__close").focus();
    }

    function closeGeoSwitch() {
      geoSwitchModal.hidden = true;
      document.body.classList.remove("geo-modal-open");
      resetGeoFilters();
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
        return;
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
        renderAdvisors();
      }
    });

    document.querySelectorAll("[data-close-geo-switch]").forEach(button => {
      button.addEventListener("click", closeGeoSwitch);
    });

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
      button.addEventListener("click", closeQuestionModal);
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !onboarding.hidden) {
        closeOnboarding();
      }
      if (event.key === "Escape" && !geoSwitchModal.hidden) {
        closeGeoSwitch();
      }
      if (event.key === "Escape" && !questionModal.hidden) {
        closeQuestionModal();
      }
    });

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

    if (moreAdvisorsButton) {
      moreAdvisorsButton.addEventListener("click", loadMoreAdvisors);
    }

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

    populateCitySelect(countrySelect.value);
    renderAdvisors();

