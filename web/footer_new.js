(function initGeoFooter() {
  const modalTriggers = document.querySelectorAll("[data-footer-modal-target]");
  let activeModal = null;
  let returnFocus = null;

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/ё/g, "е")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function findModal(selector) {
    if (!selector || selector.charAt(0) !== "#") return null;
    return document.querySelector(selector);
  }

  function focusFirst(modal) {
    const target = modal.querySelector("[data-footer-autofocus]") || modal.querySelector(
      "[data-dismiss='modal'], [data-dismiss=\"modal\"], a[href], button, input"
    );
    if (target) window.setTimeout(() => target.focus(), 0);
  }

  function closeModal(modal) {
    const target = modal || activeModal;
    if (!target) return;

    target.classList.remove("show");
    target.setAttribute("aria-hidden", "true");
    target.removeAttribute("aria-modal");
    document.body.classList.remove("modal-open", "geo-modal-open");

    if (activeModal === target) activeModal = null;
    if (returnFocus) returnFocus.focus();
    returnFocus = null;
  }

  function openModal(modal, trigger) {
    if (!modal) return;
    if (activeModal && activeModal !== modal) closeModal(activeModal);

    activeModal = modal;
    returnFocus = trigger || null;
    modal.classList.add("show");
    modal.removeAttribute("aria-hidden");
    modal.setAttribute("aria-modal", "true");
    document.body.classList.add("modal-open", "geo-modal-open");
    modal.dispatchEvent(new CustomEvent("footer-modal-open"));
    focusFirst(modal);
  }

  modalTriggers.forEach(trigger => {
    trigger.addEventListener("click", event => {
      const modal = findModal(trigger.dataset.footerModalTarget);
      if (!modal) return;
      event.preventDefault();
      openModal(modal, trigger);
    });
  });

  document.addEventListener("click", event => {
    const closeButton = event.target.closest("[data-dismiss='modal'], [data-dismiss=\"modal\"], [data-footer-modal-close]");
    if (closeButton) {
      const modal = closeButton.closest(".modal");
      if (modal) {
        event.preventDefault();
        closeModal(modal);
      }
      return;
    }

    if (event.target.classList.contains("modal") && event.target.classList.contains("show")) {
      closeModal(event.target);
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && activeModal) {
      closeModal(activeModal);
    }
  });

  document.querySelectorAll("[data-footer-directory-modal]").forEach(modal => {
    const search = modal.querySelector("[data-footer-directory-search]");
    const items = Array.from(modal.querySelectorAll("[data-footer-directory-item]"));
    const sections = Array.from(modal.querySelectorAll("[data-footer-directory-section]"));
    const countNode = modal.querySelector("[data-footer-directory-count]");
    const emptyNode = modal.querySelector("[data-footer-directory-empty]");

    function filterItems() {
      const query = normalize(search ? search.value : "");
      let visibleCount = 0;

      items.forEach(item => {
        const haystack = normalize(item.dataset.search || item.textContent);
        const visible = !query || haystack.includes(query);
        item.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      sections.forEach(section => {
        const hasVisibleItems = Boolean(section.querySelector("[data-footer-directory-item]:not([hidden])"));
        section.hidden = !hasVisibleItems;
      });

      if (countNode) countNode.textContent = String(visibleCount);
      if (emptyNode) emptyNode.hidden = visibleCount > 0;
    }

    if (search) {
      search.addEventListener("input", filterItems);
      modal.addEventListener("footer-modal-open", () => {
        search.value = "";
        filterItems();
      });
    }

    filterItems();
  });
})();
