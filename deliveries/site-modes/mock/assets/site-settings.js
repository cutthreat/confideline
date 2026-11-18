"use strict";

const panels = Array.from(document.querySelectorAll("[data-page]"));
const sectionLinks = Array.from(document.querySelectorAll('a[href^="#"]')).filter(
    link => panels.some(panel => link.hash === "#" + panel.id)
);
const menu = document.querySelector("#menu-toggle");
const onMobile = window.matchMedia("(max-width: 767px)");
const settingsSubmenu = document.querySelector("#sidebar .menu-open");
settingsSubmenu.style.display = "block";
const temporaryValues = new Map();
const exampleKey = "confideline-dev52-v1:" + document.body.dataset.example + ":";

function setMenuState() {
    const open = onMobile.matches
        ? document.body.classList.contains("sidebar-open")
        : !document.body.classList.contains("sidebar-collapse");
    menu.setAttribute("aria-expanded", String(open));
}

menu.addEventListener("click", event => {
    event.preventDefault();
    document.body.classList.toggle(onMobile.matches ? "sidebar-open" : "sidebar-collapse");
    setMenuState();
});
menu.addEventListener("keydown", event => {
    if (event.key === " ") {
        event.preventDefault();
        menu.click();
    }
});
onMobile.addEventListener("change", setMenuState);
setMenuState();

function showSection() {
    const selected = panels.find(panel => "#" + panel.id === location.hash) || panels[0];
    panels.forEach(panel => { panel.hidden = panel !== selected; });
    const heading = document.querySelector("#page-title");
    heading.textContent = selected.id === "chat" ? "Настройки чата" : "Общие настройки";
    sectionLinks.forEach(link => {
        const current = link.hash === "#" + selected.id;
        if (current) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
        const item = link.closest("li");
        if (item && item.parentElement.id === "section-nav") item.classList.toggle("active", current);
        if (item && item.parentElement === settingsSubmenu) {
            item.classList.toggle("active", current || (selected.id === "catalog" && link.hash === "#general"));
        }
    });
    document.body.classList.remove("sidebar-open");
    setMenuState();
}

window.addEventListener("hashchange", showSection);
showSection();

const search = document.querySelector("#section-search");
function searchSection() {
    const value = search.value.trim().toLocaleLowerCase("ru");
    const links = Array.from(document.querySelectorAll("#section-nav a"));
    const found = value && links.find(link => link.textContent.toLocaleLowerCase("ru").includes(value));
    search.setCustomValidity(found ? "" : "Введите название раздела настроек.");
    if (found) {
        location.hash = found.hash;
        search.value = "";
    } else {
        search.reportValidity();
    }
}
search.addEventListener("input", () => search.setCustomValidity(""));
search.addEventListener("keydown", event => {
    if (event.key === "Enter") { event.preventDefault(); searchSection(); }
});
document.querySelector("#open-search").addEventListener("click", searchSection);

function restore(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || {};
    } catch {
        return temporaryValues.get(key) || {};
    }
}

document.querySelectorAll("form[data-settings]").forEach(form => {
    const key = exampleKey + form.dataset.settings;
    const fields = Array.from(form.querySelectorAll("[name]"));
    const status = form.querySelector(".save-status");
    const values = restore(key);
    for (const field of fields) {
        const value = values[field.name];
        if (field.type === "checkbox" && typeof value === "boolean") field.checked = value;
        if (field.type !== "checkbox" && typeof value === "string") {
            const initial = field.value;
            field.value = value;
            if (!field.value || !field.validity.valid) field.value = initial;
        }
    }
    form.addEventListener("input", () => { status.textContent = ""; });
    form.addEventListener("submit", event => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const settings = Object.fromEntries(fields.map(field => [
            field.name, field.type === "checkbox" ? field.checked : field.value
        ]));
        temporaryValues.set(key, settings);
        try {
            localStorage.setItem(key, JSON.stringify(settings));
            status.textContent = "Настройки сохранены.";
        } catch {
            status.textContent = "Настройки сохранены до закрытия страницы.";
        }
    });
});
