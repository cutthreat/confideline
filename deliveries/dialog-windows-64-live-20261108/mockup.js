"use strict";

const scope = document.querySelector("#dialog-64-fixture");
const cases = [
  { id: "modal-footer-directory", start: "[data-footer-directory-search]" },
  { id: "modal-language-switcher", start: ".modal-header .close" },
];

for (const { id, start } of cases) {
  const dialog = scope.querySelector("#" + id);
  const trigger = scope.querySelector('a[href="#' + id + '"]');
  const input = dialog.querySelector(start);

  trigger.addEventListener("click", event => {
    event.preventDefault();
    if (dialog.open) return;
    dialog.showModal();
    dialog.scrollTop = 0;
    dialog.querySelector(".modal-body").scrollTop = 0;
    input.focus();
  });

  dialog.addEventListener("keydown", event => {
    if (event.key !== "Tab") return;
    const focusable = [...dialog.querySelectorAll('a[href], button, input, [tabindex]')]
      .filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  dialog.addEventListener("close", () => trigger.focus());
  dialog.querySelectorAll("[data-dismiss]").forEach(button =>
    button.addEventListener("click", () => dialog.close())
  );
}

scope.querySelectorAll("[data-preview-link]").forEach(link =>
  link.addEventListener("click", event => event.preventDefault())
);

const directory = scope.querySelector("#modal-footer-directory");
const search = directory.querySelector("[data-footer-directory-search]");
const sections = [...directory.querySelectorAll("[data-footer-directory-section]")];
search.addEventListener("input", () => {
  const query = search.value.trim().toLocaleLowerCase("ru");
  let count = 0;
  for (const section of sections) {
    let visible = 0;
    for (const item of section.querySelectorAll("[data-footer-directory-item]")) {
      item.hidden = !item.dataset.search.toLocaleLowerCase("ru").includes(query);
      if (!item.hidden) visible++;
    }
    section.hidden = visible === 0;
    count += visible;
  }
  directory.querySelector("[data-footer-directory-count]").textContent = String(count);
  const empty = directory.querySelector("[data-footer-directory-empty]");
  if (empty) empty.hidden = count !== 0;
});
