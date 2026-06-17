(function () {
  const root = document.querySelector("[data-geo-directory]");
  if (!root) return;

  const cards = Array.from(root.querySelectorAll("[data-directory-card]"));
  const modeButtons = Array.from(root.querySelectorAll("[data-directory-mode]"));
  const alphaButtons = Array.from(root.querySelectorAll("[data-directory-letter]"));
  const alphaScroller = root.querySelector("[data-directory-alpha]");
  const alphaShell = root.querySelector("[data-directory-alpha-shell]");
  const alphaScrollButtons = Array.from(root.querySelectorAll("[data-directory-alpha-scroll]"));
  const searchInput = root.querySelector("[data-directory-search]");
  const countNode = root.querySelector("[data-directory-count]");
  const emptyNode = root.querySelector("[data-directory-empty]");
  const titleNode = root.querySelector("[data-directory-title]");
  const leadNode = root.querySelector("[data-directory-lead]");
  const paginationNode = root.querySelector("[data-directory-pagination]");
  const urlParams = new URLSearchParams(window.location.search);
  const previewPageSize = Number(urlParams.get("pageSize"));
  const pageSize = previewPageSize > 0 ? previewPageSize : Number(root.dataset.pageSize || 20);

  const copy = {
    countries: {
      title: root.dataset.directoryTitleText || "Страны",
      lead: root.dataset.directoryLeadText || "Выберите страну, если вопрос связан с направлением, отношениями, переездом, работой, совместимостью или личным выбором.",
      searchPlaceholder: root.dataset.directorySearchPlaceholder || "Поиск страны"
    },
    cities: {
      title: root.dataset.directoryTitleText || "Города",
      lead: root.dataset.directoryLeadText || "Выберите город, если важны конкретная среда, ритм места, переезд, работа или отношения именно там.",
      searchPlaceholder: root.dataset.directorySearchPlaceholder || "Поиск города"
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

  function hasLetter(letter) {
    return letter === "all" || cards.some(card => card.dataset.mode === state.mode && card.dataset.letter === letter);
  }

  function updateAlphaAvailability() {
    alphaButtons.forEach(button => {
      const letter = button.dataset.directoryLetter;
      const available = hasLetter(letter);
      button.hidden = !available;
      button.classList.toggle("is-active", state.letter === letter);
      button.setAttribute("aria-pressed", state.letter === letter ? "true" : "false");
    });
  }

  function updateAlphaScrollControls() {
    if (!alphaScroller || !alphaScrollButtons.length) return;

    const applyState = (hasPrev, hasNext) => {
      if (alphaShell) {
        alphaShell.classList.toggle("has-prev", hasPrev);
        alphaShell.classList.toggle("has-next", hasNext);
      }

      alphaScrollButtons.forEach(button => {
        const isPrev = button.dataset.directoryAlphaScroll === "prev";
        const available = isPrev ? hasPrev : hasNext;
        button.classList.toggle("is-hidden", !available);
        button.disabled = !available;
        button.setAttribute("aria-hidden", available ? "false" : "true");
      });
    };

    let maxScroll = Math.max(0, alphaScroller.scrollWidth - alphaScroller.clientWidth - 1);
    let hasPrev = alphaScroller.scrollLeft > 1;
    let hasNext = alphaScroller.scrollLeft < maxScroll;
    applyState(hasPrev, hasNext);

    maxScroll = Math.max(0, alphaScroller.scrollWidth - alphaScroller.clientWidth - 1);
    if (alphaScroller.scrollLeft > maxScroll) alphaScroller.scrollLeft = maxScroll;
    hasPrev = alphaScroller.scrollLeft > 1;
    hasNext = alphaScroller.scrollLeft < maxScroll;
    applyState(hasPrev, hasNext);
  }

  function scrollActiveLetterIntoView() {
    if (!alphaScroller) return;
    if (state.letter === "all") {
      alphaScroller.scrollTo({ left: 0, behavior: "smooth" });
      window.setTimeout(updateAlphaScrollControls, 180);
      return;
    }

    const activeButton = alphaButtons.find(button => button.dataset.directoryLetter === state.letter && !button.hidden);
    if (activeButton) {
      activeButton.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
    window.setTimeout(updateAlphaScrollControls, 180);
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

  function fitCityLinks() {
    const maxVisible = 2;
    const minCardWidthForTags = 320;

    root.querySelectorAll(".geo-directory-card__links").forEach(nav => {
      const card = nav.closest(".geo-directory-card");
      const main = card?.querySelector(".geo-directory-card__main, .geo-directory-card > span");
      const candidates = Array.from(nav.querySelectorAll("a:not(.geo-directory-card__city-arrow)"));

      candidates.forEach(link => link.classList.add("is-hidden-by-fit"));
      if (!card || !main) return;

      const cardWidth = card.getBoundingClientRect().width;
      if (cardWidth < minCardWidthForTags) return;

      let visibleCount = 0;
      candidates.forEach(link => {
        if (visibleCount >= maxVisible) return;

        link.classList.remove("is-hidden-by-fit");
        const labelIsClipped = link.scrollWidth > link.clientWidth + 1;
        const mainTextIsClipped = Array.from(main.querySelectorAll("h3, p")).some(node => node.scrollWidth > node.clientWidth + 1);
        const mainRect = main.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();
        const hasRoom = mainRect.right + 12 <= navRect.left;

        if (labelIsClipped || mainTextIsClipped || !hasRoom) {
          link.classList.add("is-hidden-by-fit");
          return;
        }

        visibleCount += 1;
      });
    });
  }

  function render() {
    const currentCopy = copy[state.mode] || copy.countries;
    if (!hasLetter(state.letter)) state.letter = "all";
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
    if (searchInput) searchInput.placeholder = currentCopy.searchPlaceholder;
    if (countNode) {
      countNode.textContent = matched.length;
      const countBadge = countNode.closest(".geo-directory-search__count");
      if (countBadge) countBadge.hidden = !state.query.trim();
    }
    if (emptyNode) emptyNode.classList.toggle("is-visible", matched.length === 0);
    renderPagination(page.totalPages);
    fitCityLinks();
    scrollActiveLetterIntoView();
    updateAlphaScrollControls();
  }

  modeButtons.forEach(button => {
    button.addEventListener("click", () => setMode(button.dataset.directoryMode));
  });

  alphaButtons.forEach(button => {
    button.addEventListener("click", () => {
      const nextLetter = button.dataset.directoryLetter;
      state.letter = state.letter === nextLetter ? "all" : nextLetter;
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

  cards.forEach(card => {
    if (card.tagName.toLowerCase() === "a") return;
    const mainLink = card.querySelector(".geo-directory-card__main[href]");
    if (!mainLink) return;

    card.tabIndex = 0;
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", mainLink.getAttribute("aria-label") || mainLink.textContent.trim());

    card.addEventListener("click", event => {
      if (event.target.closest("a")) return;
      mainLink.click();
    });

    card.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      mainLink.click();
    });
  });

  if (paginationNode) {
    paginationNode.addEventListener("click", event => {
      const button = event.target.closest("[data-directory-page]");
      if (!button || button.disabled) return;
      state.page = Number(button.dataset.directoryPage);
      render();
      root.querySelector(".geo-directory-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  alphaScrollButtons.forEach(button => {
    button.addEventListener("click", () => {
      if (!alphaScroller) return;
      const direction = button.dataset.directoryAlphaScroll === "prev" ? -1 : 1;
      alphaScroller.scrollBy({ left: direction * Math.round(alphaScroller.clientWidth * .72), behavior: "smooth" });
      window.setTimeout(updateAlphaScrollControls, 220);
    });
  });

  if (alphaScroller) {
    alphaScroller.addEventListener("scroll", () => window.requestAnimationFrame(updateAlphaScrollControls));
  }

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      fitCityLinks();
      updateAlphaScrollControls();
    }, 120);
  });

  render();
})();
