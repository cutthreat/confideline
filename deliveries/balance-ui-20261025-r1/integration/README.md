# Только адресные изменения финансового UI

Прочитать ../IGOR-CODEX.md и ../CSS-INTEGRATION.md. HEADINGS-RU-EN.json + FINANCE-TABLE-HEADINGS-RU-EN.md — подписи/полные имена для существующих view; TABLE-FIELDS.json — порядок/смысл колонок. Применять через i18n/GridView, не заменять controller или sorting links.

payout-feature.css — прежний scoped CSS только карточки выплаты и реквизитов. Два partial — внутренняя разметка для адаптации существующих views: значения placeholders, маршруты/ActiveForm/CSRF/права берутся из приложения. Не вкладывать content-wrapper в content-wrapper. Проверить формы, PJAX и lifecycle текущего модуля; в папке нет нового production JS/endpoint/миграции/расчётов.

Партнёры не перерабатываются. История выплат и баланс остаются отдельными страницами. Не переносить shared-admin, global_custom, vendor, preview/helpers или демонстрационные деньги/кошельки.
