(function () {
  "use strict";

  var STORAGE_KEY = "confideline.emailTemplateComments.v1";
  var PAGE_ID = (location.pathname.split("/").pop() || "index.html").replace(/[?#].*$/, "");

  function loadStore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { version: 1, updatedAt: null, items: {} };
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") throw new Error("bad store");
      if (!parsed.items || typeof parsed.items !== "object") parsed.items = {};
      return parsed;
    } catch (error) {
      return { version: 1, updatedAt: null, items: {} };
    }
  }

  function saveStore(store) {
    store.version = 1;
    store.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  function normalize(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function hash(text) {
    var h = 2166136261;
    for (var i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return (h >>> 0).toString(36);
  }

  function rowSignature(row) {
    var codeCells = Array.prototype.slice.call(row.querySelectorAll("code"))
      .map(function (node) { return normalize(node.textContent); })
      .filter(Boolean);
    if (codeCells.length) return codeCells.slice(0, 6).join("|");

    return Array.prototype.slice.call(row.cells)
      .slice(0, 5)
      .map(function (cell) { return normalize(cell.textContent); })
      .filter(Boolean)
      .join("|");
  }

  function rowLabel(row) {
    var parts = Array.prototype.slice.call(row.cells)
      .slice(0, 4)
      .map(function (cell) { return normalize(cell.textContent); })
      .filter(Boolean);
    var label = parts.join(" / ");
    return label.length > 180 ? label.slice(0, 177) + "..." : label;
  }

  function ensureToolbar(store) {
    if (document.querySelector(".comment-toolbar")) return;

    var toolbar = document.createElement("section");
    toolbar.className = "comment-toolbar";
    toolbar.innerHTML = [
      '<div>',
      '<strong>Комментарии к строкам</strong>',
      '<span>Сохраняются в браузере с историей. Для передачи другому человеку используйте экспорт/импорт JSON.</span>',
      '</div>',
      '<div class="comment-toolbar-actions">',
      '<button type="button" data-comment-export>Экспорт JSON</button>',
      '<button type="button" data-comment-import>Импорт JSON</button>',
      '<input type="file" accept="application/json,.json" data-comment-file hidden>',
      '</div>'
    ].join("");

    var anchor = document.querySelector("main, .wrap, header, body");
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(toolbar, anchor);
    } else {
      document.body.insertBefore(toolbar, document.body.firstChild);
    }

    toolbar.querySelector("[data-comment-export]").addEventListener("click", function () {
      var data = JSON.stringify(loadStore(), null, 2);
      var blob = new Blob([data], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "confideline-email-template-comments-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    toolbar.querySelector("[data-comment-import]").addEventListener("click", function () {
      toolbar.querySelector("[data-comment-file]").click();
    });

    toolbar.querySelector("[data-comment-file]").addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var incoming = JSON.parse(String(reader.result || "{}"));
          if (!incoming.items || typeof incoming.items !== "object") throw new Error("no items");
          var current = loadStore();
          Object.keys(incoming.items).forEach(function (key) {
            var src = incoming.items[key];
            if (!current.items[key]) current.items[key] = src;
            else {
              var history = Array.isArray(current.items[key].history) ? current.items[key].history : [];
              var incomingHistory = Array.isArray(src.history) ? src.history : [];
              var seen = {};
              history.concat(incomingHistory).forEach(function (entry) {
                seen[String(entry.at || "") + "|" + String(entry.text || "")] = entry;
              });
              current.items[key].history = Object.keys(seen).sort().map(function (id) { return seen[id]; });
              if (src.current) current.items[key].current = src.current;
              if (src.label) current.items[key].label = src.label;
            }
          });
          saveStore(current);
          location.reload();
        } catch (error) {
          alert("Не удалось импортировать комментарии: " + error.message);
        }
      };
      reader.readAsText(file);
    });
  }

  function renderHistory(item) {
    var history = Array.isArray(item.history) ? item.history : [];
    if (!history.length) return "<p>Истории пока нет.</p>";
    return "<ol>" + history.slice().reverse().map(function (entry) {
      return "<li><time>" + escapeHtml(entry.at || "") + "</time><p>" + escapeHtml(entry.text || "") + "</p></li>";
    }).join("") + "</ol>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function openHistoryModal(item) {
    var overlay = document.createElement("div");
    overlay.className = "comment-modal";
    overlay.innerHTML = [
      '<div class="comment-modal-box" role="dialog" aria-modal="true">',
      '<button type="button" class="comment-modal-close" aria-label="Закрыть">×</button>',
      '<h2>История комментариев</h2>',
      '<p class="comment-modal-label">' + escapeHtml(item.label || "") + '</p>',
      '<div class="comment-history">' + renderHistory(item) + '</div>',
      '</div>'
    ].join("");
    document.body.appendChild(overlay);
    overlay.querySelector(".comment-modal-close").addEventListener("click", function () { overlay.remove(); });
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) overlay.remove();
    });
  }

  function buildCommentControl(key, label, store) {
    var item = store.items[key] || { page: PAGE_ID, rowKey: key, label: label, current: "", history: [] };
    item.label = label;
    store.items[key] = item;

    var box = document.createElement("div");
    box.className = "comment-inline";
    box.innerHTML = [
      '<label>Комментарий</label>',
      '<textarea rows="3" placeholder="Добавить комментарий..."></textarea>',
      '<div class="comment-actions">',
      '<button type="button" data-comment-save>Сохранить</button>',
      '<button type="button" data-comment-history>История <span></span></button>',
      '</div>',
      '<small></small>'
    ].join("");

    var textarea = box.querySelector("textarea");
    var count = box.querySelector("[data-comment-history] span");
    var status = box.querySelector("small");
    textarea.value = item.current || "";
    count.textContent = "(" + (Array.isArray(item.history) ? item.history.length : 0) + ")";
    status.textContent = item.history && item.history.length ? "Последнее сохранение: " + item.history[item.history.length - 1].at : "Не сохранено";

    box.querySelector("[data-comment-save]").addEventListener("click", function () {
      var text = textarea.value.trim();
      if (!text) {
        status.textContent = "Пустой комментарий не сохранен.";
        return;
      }
      var current = loadStore();
      var currentItem = current.items[key] || { page: PAGE_ID, rowKey: key, label: label, current: "", history: [] };
      if (!Array.isArray(currentItem.history)) currentItem.history = [];
      currentItem.label = label;
      currentItem.current = text;
      currentItem.history.push({ at: new Date().toISOString(), text: text });
      current.items[key] = currentItem;
      saveStore(current);
      count.textContent = "(" + currentItem.history.length + ")";
      status.textContent = "Сохранено: " + currentItem.history[currentItem.history.length - 1].at;
    });

    box.querySelector("[data-comment-history]").addEventListener("click", function () {
      var current = loadStore();
      openHistoryModal(current.items[key] || item);
    });

    return box;
  }

  function injectComments() {
    var store = loadStore();
    ensureToolbar(store);

    Array.prototype.slice.call(document.querySelectorAll("table")).forEach(function (table, tableIndex) {
      if (table.closest(".comment-modal")) return;
      var rows = Array.prototype.slice.call(table.querySelectorAll("tbody tr"));
      if (!rows.length) return;

      var headRow = table.querySelector("thead tr") || table.querySelector("tr");
      if (headRow && !headRow.querySelector(".comment-head")) {
        var th = document.createElement("th");
        th.className = "comment-head";
        th.textContent = "Комментарий";
        headRow.appendChild(th);
      }

      rows.forEach(function (row, rowIndex) {
        if (row.querySelector(".comment-cell")) return;
        var signature = rowSignature(row) || ("row-" + rowIndex);
        var key = PAGE_ID + "::table-" + tableIndex + "::" + hash(signature);
        var label = rowLabel(row) || signature;
        var td = document.createElement("td");
        td.className = "comment-cell";
        td.appendChild(buildCommentControl(key, label, store));
        row.appendChild(td);
      });
    });

    Array.prototype.slice.call(document.querySelectorAll("article.card")).forEach(function (card, cardIndex) {
      if (card.closest(".comment-modal") || card.querySelector(".comment-inline")) return;
      var id = card.getAttribute("id") || ("card-" + cardIndex);
      var label = normalize(card.querySelector("h2,h3,strong") ? card.querySelector("h2,h3,strong").textContent : card.textContent);
      if (!label) label = id;
      var key = PAGE_ID + "::card::" + hash(id + "|" + label);
      card.appendChild(buildCommentControl(key, label, store));
    });

    saveStore(store);
  }

  var style = document.createElement("style");
  style.textContent = [
    ".comment-toolbar{max-width:1440px;margin:14px auto 0;padding:12px 22px;display:flex;justify-content:space-between;gap:12px;align-items:center;background:#fff;border:1px solid #d9e2ef;border-radius:8px;color:#172033;font-family:Arial,Helvetica,sans-serif}",
    ".comment-toolbar strong{display:block;font-size:14px}.comment-toolbar span{display:block;color:#667085;font-size:12px}.comment-toolbar-actions{display:flex;gap:8px;flex-wrap:wrap}",
    ".comment-toolbar button,.comment-actions button{border:1px solid #d9e2ef;border-radius:7px;background:#fff;color:#172033;font:700 12px/1.2 Arial,Helvetica,sans-serif;padding:7px 10px;cursor:pointer}",
    ".comment-toolbar button:hover,.comment-actions button:hover{border-color:#6338d8;color:#4220a8}",
    "th.comment-head,td.comment-cell{min-width:260px;width:260px}",
    ".comment-cell textarea{width:100%;min-height:74px;resize:vertical;border:1px solid #d9e2ef;border-radius:7px;padding:8px;font:13px/1.35 Arial,Helvetica,sans-serif;color:#172033;background:#fff}",
    ".comment-inline{margin-top:12px;padding-top:12px;border-top:1px solid #d9e2ef}.comment-inline label{display:block;margin-bottom:6px;color:#667085;font:700 12px/1.2 Arial,Helvetica,sans-serif;text-transform:uppercase}.comment-inline textarea{width:100%;min-height:74px;resize:vertical;border:1px solid #d9e2ef;border-radius:7px;padding:8px;font:13px/1.35 Arial,Helvetica,sans-serif;color:#172033;background:#fff}",
    ".comment-actions{display:flex;gap:6px;margin-top:6px;flex-wrap:wrap}.comment-cell small{display:block;margin-top:5px;color:#667085;font-size:11px}",
    ".comment-modal{position:fixed;inset:0;z-index:5000;background:rgba(15,23,42,.44);display:flex;align-items:center;justify-content:center;padding:20px}",
    ".comment-modal-box{width:min(720px,100%);max-height:82vh;overflow:auto;background:#fff;border-radius:10px;border:1px solid #d9e2ef;padding:20px;box-shadow:0 24px 70px rgba(15,23,42,.28)}",
    ".comment-modal-close{float:right;border:0;background:#fff;font-size:28px;line-height:1;cursor:pointer}.comment-modal h2{margin:0 0 8px;font-size:22px}.comment-modal-label{color:#667085}.comment-history ol{padding-left:22px}.comment-history time{display:block;color:#667085;font-size:12px}.comment-history p{white-space:pre-wrap;margin:4px 0 14px}",
    "@media(max-width:900px){.comment-toolbar{margin:10px 14px 0;padding:10px;align-items:flex-start;flex-direction:column}th.comment-head,td.comment-cell{min-width:220px;width:220px}}"
  ].join("\n");
  document.head.appendChild(style);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectComments);
  } else {
    injectComments();
  }
}());
