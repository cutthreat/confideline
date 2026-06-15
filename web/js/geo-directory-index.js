(function () {
  const root = document.querySelector("[data-geo-directory]");
  if (!root) return;

  const cards = Array.from(root.querySelectorAll("[data-directory-card]"));
  const modeButtons = Array.from(root.querySelectorAll("[data-directory-mode]"));
  const alphaButtons = Array.from(root.querySelectorAll("[data-directory-letter]"));
  const searchInput = root.querySelector("[data-directory-search]");
  const countNode = root.querySelector("[data-directory-count]");
  const contextNode = root.querySelector("[data-directory-context]");
  const emptyNode = root.querySelector("[data-directory-empty]");
  const titleNode = root.querySelector("[data-directory-title]");
  const leadNode = root.querySelector("[data-directory-lead]");
  const resetButton = root.querySelector("[data-directory-reset]");
  const rangeNode = root.querySelector("[data-directory-range]");
  const paginationNode = root.querySelector("[data-directory-pagination]");
  const urlParams = new URLSearchParams(window.location.search);
  const previewPageSize = Number(urlParams.get("pageSize"));
  const pageSize = previewPageSize > 0 ? previewPageSize : Number(root.dataset.pageSize || 20);

  const copy = {
    countries: {
      title: "Страны и города",
      lead: "Найдите место, которое связано с вашим вопросом: отношения, переезд, работа, совместимость или личный выбор.",
      context: "Посмотрите, как страна может влиять на отношения, работу, переезд и внутреннее состояние.",
      searchPlaceholder: "Поиск страны или города"
    },
    cities: {
      title: "Города Армении",
      lead: "Выберите город, если важны конкретная среда, ритм места, переезд, работа или отношения именно там.",
      context: "Посмотрите, как энергия города может проявляться в вашем вопросе.",
      searchPlaceholder: "Поиск города"
    }
  };

  const requestedMode = urlParams.get("mode");

  let state = {
    mode: requestedMode === "cities" ? "cities" : root.dataset.initialMode || "countries",
    letter: "all",
    query: "",
    page: 1
  };

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function setMode(mode) {
    state.mode = mode;
    state.letter = "all";
    state.query = "";
    state.page = 1;
    if (searchInput) searchInput.value = "";
    render();
  }

  function visibleCards() {
    const query = normalize(state.query);
    return cards.filter(card => {
      const byMode = card.dataset.mode === state.mode;
      const byLetter = state.letter === "all" || card.dataset.letter === state.letter;
      const byQuery = !query || normalize(card.dataset.search).includes(query);
      return byMode && byLetter && byQuery;
    });
  }

  function updateAlphaAvailability() {
    alphaButtons.forEach(button => {
      const letter = button.dataset.directoryLetter;
      const available = letter === "all" || cards.some(card => card.dataset.mode === state.mode && card.dataset.letter === letter);
      button.hidden = !available;
      button.classList.toggle("is-active", state.letter === letter);
      button.setAttribute("aria-pressed", state.letter === letter ? "true" : "false");
    });
  }

  function pageCards(items) {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    state.page = Math.min(state.page, totalPages);
    const start = (state.page - 1) * pageSize;
    return {
      totalPages,
      start,
      end: Math.min(start + pageSize, items.length),
      items: items.slice(start, start + pageSize)
    };
  }

  function renderPagination(totalPages) {
    if (!paginationNode) return;
    paginationNode.innerHTML = "";
    paginationNode.hidden = totalPages <= 1;
    if (totalPages <= 1) return;

    const createButton = (label, page, active, disabled) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.dataset.directoryPage = String(page);
      button.className = active ? "is-active" : "";
      button.disabled = disabled;
      button.setAttribute("aria-label", active ? `Страница ${page}, текущая` : `Страница ${page}`);
      return button;
    };

    paginationNode.append(createButton("Назад", Math.max(1, state.page - 1), false, state.page === 1));
    for (let page = 1; page <= totalPages; page += 1) {
      paginationNode.append(createButton(String(page), page, state.page === page, false));
    }
    paginationNode.append(createButton("Вперед", Math.min(totalPages, state.page + 1), false, state.page === totalPages));
  }

  function render() {
    const currentCopy = copy[state.mode] || copy.countries;
    const matched = visibleCards();
    const page = pageCards(matched);
    const visible = page.items;

    modeButtons.forEach(button => {
      const active = button.dataset.directoryMode === state.mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    updateAlphaAvailability();

    cards.forEach(card => {
      card.hidden = !visible.includes(card);
    });

    if (titleNode) titleNode.textContent = currentCopy.title;
    if (leadNode) leadNode.textContent = currentCopy.lead;
    if (contextNode) contextNode.textContent = currentCopy.context;
    if (searchInput) searchInput.placeholder = currentCopy.searchPlaceholder;
    if (countNode) countNode.textContent = matched.length;
    if (rangeNode) {
      rangeNode.hidden = matched.length <= pageSize;
      rangeNode.textContent = matched.length ? `Показано ${page.start + 1}-${page.end}` : "";
    }
    if (emptyNode) emptyNode.classList.toggle("is-visible", matched.length === 0);
    if (resetButton) resetButton.hidden = state.letter === "all" && !state.query;
    renderPagination(page.totalPages);
  }

  modeButtons.forEach(button => {
    button.addEventListener("click", () => setMode(button.dataset.directoryMode));
  });

  alphaButtons.forEach(button => {
    button.addEventListener("click", () => {
      state.letter = button.dataset.directoryLetter;
      state.page = 1;
      render();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", event => {
      state.query = event.target.value;
      state.page = 1;
      render();
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      state.letter = "all";
      state.query = "";
      state.page = 1;
      if (searchInput) searchInput.value = "";
      render();
      if (searchInput) searchInput.focus();
    });
  }

  if (paginationNode) {
    paginationNode.addEventListener("click", event => {
      const button = event.target.closest("[data-directory-page]");
      if (!button || button.disabled) return;
      state.page = Number(button.dataset.directoryPage);
      render();
      root.querySelector(".geo-directory-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  render();
})();
