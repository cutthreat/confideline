
## Исправление r2 — восстановлен ранее доработанный макет «Мои выплаты»

Версия r1 ошибочно подменила доработанный интерфейс обычной версией при сборке v9. В r2 возвращены карточка баланса, двухколоночный запрос, самостоятельная панель истории, бейджи статусов, разметка карточки и реквизитов. Образец — finance-headings-v6 / my-payouts, а не упрощённый v9. Отдельная страница сохраняется.

Сокращённые RU/EN-подписи и существующий range-picker сохранены; min-width1120 и два native-date не возвращены. Общая шапка остаётся текущей синей: global_custom/shared-admin целиком не подключаются. Только нужные общие правила старого макета изолированы в #cl-my-payouts внутри payout-feature.css, вместе с его прежними компонентами. На других страницах этот CSS не работает.

Для внедрения: три partial внутри существующей content-wrapper, один уникальный #cl-my-payouts на странице; payout-feature.css и my-payouts-ui.js. UI-scroll adapter согласовать с lifecycle текущего модуля. Данные, фильтры, i18n, confirm, запросы, CSRF, request key и финансы — текущие серверные механизмы. restored-payouts-preview.js и payout-headings.js только для макетов. Демонстрационное подтверждение HTML не является production/OS-dialog проверкой.

# Только адресные изменения финансового UI

Прочитать ../IGOR-CODEX.md и ../CSS-INTEGRATION.md. HEADINGS-RU-EN.json + FINANCE-TABLE-HEADINGS-RU-EN.md — подписи/полные имена для существующих view; TABLE-FIELDS.json — порядок/смысл колонок. Применять через i18n/GridView, не заменять controller или sorting links.

payout-feature.css — прежний scoped CSS только карточки выплаты и реквизитов. Два partial — внутренняя разметка для адаптации существующих views: значения placeholders, маршруты/ActiveForm/CSRF/права берутся из приложения. Не вкладывать content-wrapper в content-wrapper. Проверить формы, PJAX и lifecycle текущего модуля; в папке нет нового production JS/endpoint/миграции/расчётов.

Партнёры не перерабатываются. История выплат и баланс остаются отдельными страницами. Не переносить shared-admin, global_custom, vendor, preview/helpers или демонстрационные деньги/кошельки.
