document.addEventListener("DOMContentLoaded", function () {
  initOffcanvasScrollLock();
  initInlineVideoEmbed();
  initClientsSlider();
  initClientsVideoSlider();
  initLoveReviewSlider();
});

function initOffcanvasScrollLock() {
  if (!window.jQuery) return;

  var headers = document.querySelectorAll(".site-header");
  if (!headers.length) return;

  var bodyLock = null;

  function isControlForMenu(control, menu) {
    if (!control || !control.getAttribute) return false;
    return (
      control.getAttribute("aria-controls") === menu.id ||
      control.getAttribute("data-target") === "#" + menu.id
    );
  }

  function findExternalControl(header, menu) {
    var controls = header.querySelectorAll("[aria-controls], [data-target]");
    for (var index = 0; index < controls.length; index += 1) {
      if (isControlForMenu(controls[index], menu) && !menu.contains(controls[index])) {
        return controls[index];
      }
    }
    return null;
  }

  function syncMenuControls(header, menu, expanded) {
    var controls = header.querySelectorAll("[aria-controls], [data-target]");
    for (var index = 0; index < controls.length; index += 1) {
      if (isControlForMenu(controls[index], menu)) {
        controls[index].setAttribute("aria-expanded", expanded ? "true" : "false");
      }
    }
    // Keep the menu's accessibility tree in the same state as its visual
    // collapse. At 993px Bootstrap's lg row is inline again, so a closed
    // collapse must still be exposed to screen readers on desktop.
    var desktop = window.matchMedia && window.matchMedia("(min-width: 993px)").matches;
    menu.setAttribute("aria-hidden", expanded || desktop ? "false" : "true");
  }

  function lockBodyScroll(menu) {
    if (!bodyLock) {
      bodyLock = {
        menu: menu,
        scrollY: window.scrollY || window.pageYOffset || 0,
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width
      };
    } else {
      bodyLock.menu = menu;
    }

    document.body.classList.add("nav-open");

    // More reliable than overflow:hidden on iOS: freeze body at current scroll.
    document.body.style.position = "fixed";
    document.body.style.top = -bodyLock.scrollY + "px";
    document.body.style.width = "100%";
  }

  function unlockBodyScroll(menu) {
    if (!bodyLock || bodyLock.menu !== menu) return;

    var restoreY = bodyLock.scrollY;
    document.body.classList.remove("nav-open");
    document.body.style.position = bodyLock.position;
    document.body.style.top = bodyLock.top;
    document.body.style.width = bodyLock.width;
    bodyLock = null;
    window.scrollTo(0, restoreY);
  }

  Array.prototype.forEach.call(headers, function (header) {
    var menus = header.querySelectorAll(".navbar-collapse[id]");
    if (menus.length !== 1) return;

    var menu = menus[0];
    var $menu = window.jQuery(menu);
    if ($menu.data("nebulaOffcanvasBound")) return;
    $menu.data("nebulaOffcanvasBound", true);

    var returnFocus = null;

    $menu.on("show.bs.collapse", function () {
      var activeElement = document.activeElement;
      if (
        activeElement &&
        header.contains(activeElement) &&
        isControlForMenu(activeElement, menu) &&
        !menu.contains(activeElement)
      ) {
        returnFocus = activeElement;
      } else {
        returnFocus = findExternalControl(header, menu);
      }
    });

    $menu.on("shown.bs.collapse", function () {
      lockBodyScroll(menu);
      syncMenuControls(header, menu, true);
      var focusTarget = menu.querySelector(
        ".site-header__offcanvas-close, a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"
      );
      if (focusTarget) {
        try {
          focusTarget.focus({ preventScroll: true });
        } catch (error) {
          focusTarget.focus();
        }
      }
    });

    $menu.on("hidden.bs.collapse", function () {
      unlockBodyScroll(menu);
      var focusReturnTarget = returnFocus;
      syncMenuControls(header, menu, false);
      returnFocus = null;
      // A pointer click focuses the close button after Bootstrap emits `hidden`.
      // Defer the established trigger return so close click and Escape converge.
      window.requestAnimationFrame(function () {
        if (!focusReturnTarget || !document.documentElement.contains(focusReturnTarget)) return;
        try {
          focusReturnTarget.focus({ preventScroll: true });
        } catch (error) {
          focusReturnTarget.focus();
        }
      });
    });

    menu.addEventListener("keydown", function (event) {
      if (!$menu.hasClass("show")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        $menu.collapse("hide");
        return;
      }
      if (event.key !== "Tab") return;

      // The full-screen mobile menu must not tab into the covered page.
      var focusable = Array.prototype.filter.call(
        menu.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]"),
        function (element) {
          return element.tabIndex >= 0 && element.getClientRects().length > 0 &&
            window.getComputedStyle(element).visibility !== "hidden";
        }
      );
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    // Safety: if a page is restored with an open menu, keep the body locked.
    if ($menu.hasClass("show")) {
      syncMenuControls(header, menu, true);
      lockBodyScroll(menu);
    } else {
      // The close control is rendered inside the panel, so correct its static
      // markup state before Bootstrap emits any collapse lifecycle event.
      syncMenuControls(header, menu, false);
    }

    // Desktop layout cannot retain a mobile collapse or a frozen body.
    window.addEventListener("resize", function () {
      if (!window.matchMedia || !window.matchMedia("(min-width: 993px)").matches) {
        return;
      }
      if ($menu.hasClass("show")) {
        $menu.collapse("hide");
      } else {
        unlockBodyScroll(menu);
      }
    });
  });
}

function initInlineVideoEmbed() {
  var cover = document.querySelector(".video-section__cover");
  if (!cover) return;

  cover.addEventListener("click", function () {
    if (cover.classList.contains("is-playing")) return;

    var videoUrl = cover.getAttribute("data-video-url");
    if (!videoUrl) return;

    var media = cover.querySelector(".video-section__cover-media");
    if (!media) return;

    var iframe = document.createElement("iframe");
    iframe.className = "video-section__iframe";
    iframe.src = videoUrl;
    iframe.title = "Neuro video";
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.setAttribute("allowfullscreen", "");

    media.appendChild(iframe);
    cover.classList.add("is-playing");
    cover.setAttribute("aria-pressed", "true");
  });
}
document.addEventListener("DOMContentLoaded", function () {
  var roots = document.querySelectorAll('[data-accordion="single"]');
  if (!roots.length) return;

  roots.forEach(function (root) {
    function setIcon(btn, isOpen) {
      var icon = btn ? btn.querySelector(".faq-section__icon") : null;
      if (!icon) return;
      icon.innerHTML = isOpen
        ? '<span class="faq-section__icon-cross"></span>'
        : '<span class="faq-section__icon-plus"></span>';
    }

    function measurePreviewHeight(item) {
      var panel = item.querySelector(".faq-section__panel");
      var body = item.querySelector(".faq-section__body");
      if (!panel || !body) return 0;

      var wasOpen = item.classList.contains("is-open");
      item.classList.remove("is-open");

      var prevHeight = panel.scrollHeight;

      if (wasOpen) item.classList.add("is-open");
      return prevHeight;
    }

    function setToPreview(item) {
      var btn = item.querySelector(".faq-section__toggle");
      var panelId = btn && btn.getAttribute("aria-controls");
      var panel = panelId ? document.getElementById(panelId) : null;
      if (!btn || !panel) return;

      item.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      setIcon(btn, false);

      var h = measurePreviewHeight(item);
      panel.style.height = h + "px";
    }

    function openItem(item) {
      var btn = item.querySelector(".faq-section__toggle");
      var panelId = btn && btn.getAttribute("aria-controls");
      var panel = panelId ? document.getElementById(panelId) : null;
      if (!btn || !panel) return;

      var from = panel.scrollHeight;

      item.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      setIcon(btn, true);

      var to = panel.scrollHeight;

      panel.style.height = from + "px";
      requestAnimationFrame(function () {
        panel.style.height = to + "px";
      });

      panel.addEventListener(
        "transitionend",
        function (e) {
          if (e.propertyName !== "height") return;
          if (!item.classList.contains("is-open")) return;
          panel.style.height = "auto";
        },
        { once: true },
      );
    }

    function closeItem(item) {
      var btn = item.querySelector(".faq-section__toggle");
      var panelId = btn && btn.getAttribute("aria-controls");
      var panel = panelId ? document.getElementById(panelId) : null;
      if (!btn || !panel) return;

      var from = panel.scrollHeight;

      item.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      setIcon(btn, false);

      var to = panel.scrollHeight;

      panel.style.height = from + "px";
      requestAnimationFrame(function () {
        panel.style.height = to + "px";
      });
    }

    function closeAll(except) {
      root.querySelectorAll(".faq-section__item").forEach(function (item) {
        if (except && item === except) return;
        setToPreview(item);
      });
    }

    root.addEventListener("click", function (e) {
      var btn = e.target.closest(".faq-section__toggle");
      if (!btn || !root.contains(btn)) return;

      var item = btn.closest(".faq-section__item");
      if (!item) return;

      var isOpen = btn.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeItem(item);
        return;
      }

      closeAll(item);
      openItem(item);
    });

    var items = root.querySelectorAll(".faq-section__item");
    var initiallyOpen = root.querySelector(".faq-section__item.is-open") || root.querySelector(".faq-section__item");
    items.forEach(function (item) {
      if (item === initiallyOpen) return;
      setToPreview(item);
    });

    if (initiallyOpen) {
      var initialBtn = initiallyOpen.querySelector(".faq-section__toggle");
      var initialPanelId = initialBtn && initialBtn.getAttribute("aria-controls");
      var initialPanel = initialPanelId ? document.getElementById(initialPanelId) : null;
      initiallyOpen.classList.add("is-open");
      if (initialBtn) {
        initialBtn.setAttribute("aria-expanded", "true");
        setIcon(initialBtn, true);
      }
      if (initialPanel) initialPanel.style.height = "auto";
    }
  });
});

function initClientsSlider() {
  var container = document.querySelector(
    ".clients-section__grid-swiper.swiper",
  );
  if (!container) return;

  var track = container.querySelector(".swiper-wrapper");
  var slides = Array.prototype.slice.call(
    container.querySelectorAll(".clients-section__review"),
  );
  var prevBtn = document.querySelector(".clients-section__slider-btn--prev");
  var nextBtn = document.querySelector(".clients-section__slider-btn--next");
  if (!track || !slides.length || !prevBtn || !nextBtn) return;

  var index = 0;
  var mobileQuery = window.matchMedia("(max-width: 767.98px)");

  function setDisabled(btn, disabled) {
    btn.disabled = disabled;
    btn.classList.toggle("is-disabled", disabled);
    btn.classList.toggle("swiper-button-disabled", disabled);
  }

  function getStep() {
    var slide = slides[0];
    var styles = window.getComputedStyle(track);
    var gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    return slide.getBoundingClientRect().width + gap;
  }

  function apply() {
    if (!mobileQuery.matches) {
      index = 0;
      track.style.transform = "";
      setDisabled(prevBtn, true);
      setDisabled(nextBtn, true);
      return;
    }

    var maxIndex = Math.max(0, slides.length - 1);
    index = Math.max(0, Math.min(index, maxIndex));
    track.style.transform = "translateX(" + -index * getStep() + "px)";
    setDisabled(prevBtn, index === 0);
    setDisabled(nextBtn, index === maxIndex);
  }

  prevBtn.addEventListener("click", function () {
    index -= 1;
    apply();
  });

  nextBtn.addEventListener("click", function () {
    index += 1;
    apply();
  });

  window.addEventListener("resize", apply);
  apply();
}

function initLoveReviewSlider() {
  var section = document.querySelector(".lov-clients-love");
  if (!section) return;

  var track = section.querySelector("[data-love-review-carousel]");
  var controls = section.querySelector(".lov-review-controls");
  var prevBtn = section.querySelector(".lov-review-control--prev");
  var nextBtn = section.querySelector(".lov-review-control--next");
  if (
    !track ||
    !controls ||
    !prevBtn ||
    !nextBtn ||
    section.__loveReviewSliderBound
  ) {
    return;
  }
  section.__loveReviewSliderBound = true;

  var mobileQuery = window.matchMedia("(max-width: 575.98px)");
  var index = 0;

  function update(shouldScroll) {
    var cards = Array.prototype.filter.call(
      track.querySelectorAll(".lov-review-card"),
      function (card) {
        return !card.hidden && window.getComputedStyle(card).display !== "none";
      },
    );
    var enabled = mobileQuery.matches && cards.length === 2;

    if (!enabled) {
      index = 0;
      track.classList.remove("is-review-carousel-enhanced");
      track.removeAttribute("tabindex");
      track.removeAttribute("aria-label");
      track.scrollLeft = 0;
      controls.hidden = true;
      controls.setAttribute("aria-hidden", "true");
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }

    index = Math.max(0, Math.min(index, 1));
    track.classList.add("is-review-carousel-enhanced");
    track.setAttribute("tabindex", "0");
    track.setAttribute("aria-label", "Client reviews");
    controls.hidden = false;
    controls.removeAttribute("aria-hidden");
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === 1;
    if (shouldScroll) {
      var left =
        index === 0 ? 0 : Math.max(0, track.scrollWidth - track.clientWidth);
      if (typeof track.scrollTo === "function") {
        track.scrollTo({ left: left, behavior: "auto" });
      } else {
        track.scrollLeft = left;
      }
    }
  }

  function activate(nextIndex, source, destination) {
    var keepFocus = document.activeElement === source;
    index = nextIndex;
    update(true);
    if (keepFocus && source.disabled) {
      try {
        destination.focus({ preventScroll: true });
      } catch (error) {
        destination.focus();
      }
    }
  }

  prevBtn.addEventListener("click", function () {
    activate(0, prevBtn, nextBtn);
  });
  nextBtn.addEventListener("click", function () {
    activate(1, nextBtn, prevBtn);
  });
  track.addEventListener("scroll", function () {
    if (!mobileQuery.matches) return;
    var maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    index = track.scrollLeft >= maxScroll / 2 ? 1 : 0;
    update(false);
  }, { passive: true });
  window.addEventListener("resize", update);
  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", update);
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(update);
  }
  update(true);
}

function initClientsVideoSlider() {
  var section = document.querySelector(".clients-section");
  if (!section) return;

  var existingController = section.__clientsVideoSliderController;
  var initialIndex =
    existingController && existingController.getIndex
      ? existingController.getIndex()
      : 0;
  if (existingController) existingController.destroy();
  delete section.__clientsVideoSliderController;

  var viewport = section.querySelector("[data-video-testimonials]");
  var track = viewport
    ? viewport.querySelector(".clients-section__videos")
    : null;
  var cards = viewport
    ? Array.prototype.slice.call(
        viewport.querySelectorAll(".clients-section__video-card"),
      )
    : [];
  var controls = section.querySelector(".clients-section__video-controls");
  var prevBtn = section.querySelector(
    ".clients-section__slider-btn--video-prev",
  );
  var nextBtn = section.querySelector(
    ".clients-section__slider-btn--video-next",
  );

  function restoreAccessibleFallback() {
    if (viewport) viewport.classList.remove("is-video-slider-enhanced");
    if (track) track.style.transform = "";
    if (controls) {
      controls.hidden = true;
      controls.setAttribute("aria-hidden", "true");
    }
    cards.forEach(function (card) {
      card.removeAttribute("aria-hidden");
      card.removeAttribute("inert");
      card.removeAttribute("tabindex");
      card.removeAttribute("aria-current");
    });
  }

  restoreAccessibleFallback();

  if (!track || cards.length < 2 || !controls || !prevBtn || !nextBtn) {
    return;
  }

  var index = Math.max(0, Math.min(initialIndex, cards.length - 1));
  var mobileQuery = window.matchMedia("(max-width: 480px)");

  function setDisabled(btn, disabled) {
    btn.disabled = disabled;
    btn.classList.toggle("is-disabled", disabled);
    btn.classList.toggle("swiper-button-disabled", disabled);
  }

  function setCardState(card, active) {
    if (active) {
      card.removeAttribute("aria-hidden");
      card.removeAttribute("inert");
      card.removeAttribute("tabindex");
      card.setAttribute("aria-current", "true");
      return;
    }

    card.setAttribute("aria-hidden", "true");
    card.setAttribute("inert", "");
    card.setAttribute("tabindex", "-1");
    card.removeAttribute("aria-current");
  }

  function getStep() {
    var styles = window.getComputedStyle(track);
    var gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    return cards[0].getBoundingClientRect().width + gap;
  }

  function moveFocusBeforeHiding(activeCard) {
    var focused = document.activeElement;
    if (
      focused &&
      cards.indexOf(focused) !== -1 &&
      focused !== activeCard
    ) {
      activeCard.focus();
    }
  }

  function apply() {
    if (!mobileQuery.matches) {
      viewport.classList.remove("is-video-slider-enhanced");
      track.style.transform = "";
      controls.hidden = true;
      controls.setAttribute("aria-hidden", "true");
      cards.forEach(function (card) {
        card.removeAttribute("aria-hidden");
        card.removeAttribute("inert");
        card.removeAttribute("tabindex");
        card.removeAttribute("aria-current");
      });
      return;
    }

    var maxIndex = Math.max(0, cards.length - 1);
    index = Math.max(0, Math.min(index, maxIndex));
    var activeCard = cards[index];
    setCardState(activeCard, true);
    moveFocusBeforeHiding(activeCard);
    cards.forEach(function (card, cardIndex) {
      setCardState(card, cardIndex === index);
    });
    controls.hidden = false;
    controls.removeAttribute("aria-hidden");
    track.style.transform = "translateX(" + -index * getStep() + "px)";
    setDisabled(prevBtn, index === 0);
    setDisabled(nextBtn, index === maxIndex);
    viewport.classList.add("is-video-slider-enhanced");
  }

  function onPrevClick() {
    if (index > 0) index -= 1;
    apply();
  }

  function onNextClick() {
    if (index < cards.length - 1) index += 1;
    apply();
  }

  prevBtn.addEventListener("click", onPrevClick);
  nextBtn.addEventListener("click", onNextClick);
  window.addEventListener("resize", apply);
  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", apply);
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(apply);
  }
  var controller = {
    getIndex: function () {
      return index;
    },
    refresh: apply,
    destroy: function () {
      prevBtn.removeEventListener("click", onPrevClick);
      nextBtn.removeEventListener("click", onNextClick);
      window.removeEventListener("resize", apply);
      if (typeof mobileQuery.removeEventListener === "function") {
        mobileQuery.removeEventListener("change", apply);
      } else if (typeof mobileQuery.removeListener === "function") {
        mobileQuery.removeListener(apply);
      }
      restoreAccessibleFallback();
      if (section.__clientsVideoSliderController === controller) {
        delete section.__clientsVideoSliderController;
      }
    },
  };
  section.__clientsVideoSliderController = controller;
  apply();
}
