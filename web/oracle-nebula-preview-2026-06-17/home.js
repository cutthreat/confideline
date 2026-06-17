document.addEventListener("DOMContentLoaded", function () {
  initOffcanvasScrollLock();
  initInlineVideoEmbed();
  initClientsSlider();
});

function initOffcanvasScrollLock() {
  var $menu = window.jQuery ? window.jQuery("#navbarOffcanvas") : null;
  if (!$menu || !$menu.length) return;

  var lastScrollY = 0;

  function lockBodyScroll() {
    lastScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.classList.add("nav-open");

    // More reliable than overflow:hidden on iOS: freeze body at current scroll.
    document.body.style.position = "fixed";
    document.body.style.top = -lastScrollY + "px";
    document.body.style.width = "100%";
  }

  function unlockBodyScroll() {
    var top = document.body.style.top;
    var restoreY = lastScrollY;
    if (top) {
      var parsed = parseInt(top, 10);
      if (!Number.isNaN(parsed)) restoreY = Math.abs(parsed);
    }

    document.body.classList.remove("nav-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, restoreY);
  }

  $menu.on("shown.bs.collapse", lockBodyScroll);
  $menu.on("hidden.bs.collapse", unlockBodyScroll);

  // Safety: if menu is already open (e.g. back/forward cache), keep it locked.
  if ($menu.hasClass("show")) lockBodyScroll();

  // If switching to desktop layout, ensure the page isn't left frozen.
  window.addEventListener("resize", function () {
    if (window.matchMedia && window.matchMedia("(min-width: 992px)").matches) {
      unlockBodyScroll();
    }
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
  if (typeof Swiper === "undefined") return;

  var container = document.querySelector(
    ".clients-section__grid-swiper.swiper",
  );
  if (!container) return;

  var prevBtn = document.querySelector(".clients-section__slider-btn--prev");
  var nextBtn = document.querySelector(".clients-section__slider-btn--next");

  var swiper = new Swiper(container, {
    slidesPerView: "auto",
    spaceBetween: 10,
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 14,
      },
      768: {
        slidesPerView: "auto",
        spaceBetween: 10,
      },
    },
    navigation: {
      prevEl: prevBtn,
      nextEl: nextBtn,
    },
  });
}
