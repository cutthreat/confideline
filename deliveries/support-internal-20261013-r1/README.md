# Внутренний чат: пакет для Игоря

Редакция R4, 14.10.2026. Открыть index.html. Полный комплект: пять HTML-макетов, CSS/JS, локальные vendor/fonts/images, исходный internal-messenger.css, ТЗ в Markdown и HTML, notices и MANIFEST.json с SHA-256.

## Названия и сценарии

Виджет — «Внутренний чат». Вкладки: «Тикеты» и «Рабочие чаты».
Агент/эксперт создает обращение в «Тикетах» либо выбирает сотрудника по никнейму и общается без тикета в «Рабочих чатах». Сотрудник может первым написать доступному агенту. Клиент в админку не входит.

## Входы

- developer/support-work-chat-agent.html?section=work&recipient=502 — агент, рабочий чат.
- developer/support-work-chat-agent.html?section=cases — агент, обращения и создание тикета.
- developer/support-work-chat-moderator.html?section=work&recipient=104 — Support, рабочий чат.
- developer/support-work-chat-moderator.html?actor=moderator&section=work — Moderator.
- developer/support-work-chat-moderator.html?actor=admin&section=work — Super Admin.
- developer/support-ticket-queue-final.html — исходная очередь с виджетом.
- developer/support-ticket-chat-final.html — исходная карточка с виджетом.
- developer/chat-v2-internal.html — кнопка в шапке с инструментами оператора.
- developer/tz.html / developer/TZ.md — актуальное ТЗ, включая карту приемки и интеграцию.

## Внедрение

Переиспользовать принятый YouDate/AdminLTE layout и готовые компоненты Support/Agent Chat. Не менять фоновые страницы; убрать только прежнюю вкладку Internal из карточки и подключить сквозную панель. Сохранить серверные audience/membership, вопросы, lifecycle/SLA и защищенные запросы. Рабочие личные пары и actor-scoped summary — новый серверный объем с отдельным правом, не копия Support DTO.

internal-widget.js использует синтетические роли, ID и localStorage. Это демонстрационный controller, не production auth/API. CSP/custom.js ограничивают demo-операции, не задают production security. Реальные права, transport, retries, upload/scan, платежи и service_session этим пакетом не проверены.

Для совместного просмотра двух ролей нужен один HTTP origin. Отдельный file://-просмотр возможен, но браузер может ограничивать storage; запускать обычный локальный static server. Пакет самодостаточен и не требует CDN. Production AssetBundle/шрифты не менять из-за offline адаптации.

ZIP содержит тот же developer-комплект, README/notices/index и manifest; не содержит сам себя, старую память, приватные реестры и QA-скриншоты. Проверки/receipt этой публикации хранятся отдельно локально.
