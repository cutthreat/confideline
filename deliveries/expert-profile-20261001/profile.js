"use strict";

const byId = (id) => document.getElementById(id);
const openDialog = (id) => byId(id).showModal();

byId("favorite").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const selected = button.getAttribute("aria-pressed") !== "true";
  const label = selected ? "Убрать из избранного" : "Добавить в избранное";
  button.setAttribute("aria-pressed", String(selected));
  button.setAttribute("aria-label", label);
  button.title = label;
});

byId("consultation-message").addEventListener("click", () => openDialog("chat-dialog"));
byId("gift-button").addEventListener("click", () => openDialog("gifts-dialog"));
byId("all-gifts").addEventListener("click", () => openDialog("gifts-dialog"));

document.querySelectorAll("[data-photo]").forEach((button) => {
  button.addEventListener("click", () => {
    byId("gallery-photo").src = button.querySelector("img").src;
    openDialog("photo-dialog");
  });
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => byId(button.dataset.close).close());
});
