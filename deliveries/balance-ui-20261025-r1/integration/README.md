# Адресные файлы финансового UI · r3

Прочитать ../IGOR-CODEX.md, ../CSS-INTEGRATION.md и ../PAGES-AND-APPROVALS.json.

- HEADINGS-RU-EN.json / FINANCE-TABLE-HEADINGS-RU-EN.md / TABLE-FIELDS.json: подписи и смысл пяти таблиц; сохранить порядок, фильтры, sorting links, i18n и controller.
- payout-feature.css: восстановленный раздел «Мои выплаты», карточка и реквизиты. Все правила внутри #cl-my-payouts; общий реестр и остальные страницы не затрагивать.
- Три partial: my-payouts, my-payout-view, my-payout-details. По одному внутри существующей content-wrapper, с текущими моделями/routes/ActiveForm/CSRF/request key и серверной eligibility. Это образцы разметки, не PHP drop-in.
- my-payouts-ui.js: только прокрутка; связать с lifecycle/PJAX текущего модуля и проверить teardown.

В папке нет нового финансового controller/endpoint/расчётов/миграций. Preview helpers на сайт не переносить. Партнёров не перевёрстывать; отдельные страницы сохраняются.
