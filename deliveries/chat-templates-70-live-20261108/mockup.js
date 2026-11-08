"use strict";

const root = document.querySelector("#chat70");
const editor = root.querySelector("#messageInput");
const tools = root.querySelector(".js-composer-tools-toggle");
const panel = root.querySelector("#composerToolsPanel");
const picker = root.querySelector("#composerTemplateSelect");
const decision = root.querySelector("#draftDecision");
const templateText = {
  time: "Please let me know a convenient time and your time zone.",
  data: "Thank you, I will check the information and get back to you.",
};
let pending = "";

function setPicker(open) {
  panel.hidden = !open;
  tools.setAttribute("aria-expanded", String(open));
  if (open) picker.focus();
}

tools.addEventListener("click", () => setPicker(panel.hidden));
panel.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  setPicker(false);
  tools.focus();
});

function positionDecision() {
  const composer = root.getBoundingClientRect();
  const height = decision.getBoundingClientRect().height;
  const below = composer.bottom + 12;
  const above = composer.top - height - 12;
  const top = below + height <= innerHeight - 12
    ? below
    : above >= 12 ? above : Math.max(12, (innerHeight - height) / 2);
  decision.style.top = top + "px";
}

picker.addEventListener("change", () => {
  const text = templateText[picker.value];
  picker.value = "";
  if (!text) return;
  setPicker(false);
  if (editor.value === "") {
    editor.value = text;
    editor.focus();
    return;
  }
  pending = text;
  decision.showModal();
  positionDecision();
});

decision.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.value === "replace") editor.value = pending;
  if (button.value === "append") {
    const separator = editor.value.endsWith("\n") ? "" : "\n";
    editor.value += separator + pending;
  }
  decision.close();
});

decision.addEventListener("close", () => {
  pending = "";
  editor.focus();
  editor.setSelectionRange(editor.value.length, editor.value.length);
});

window.addEventListener("resize", () => {
  if (decision.open) positionDecision();
});
