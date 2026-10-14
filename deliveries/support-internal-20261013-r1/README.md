# Внутренний чат: пакет для Игоря

Редакция R5, 15.10.2026. Открыть index.html. Полный комплект: те же пять HTML-макетов, CSS/JS, локальные vendor/fonts/images, исходный internal-messenger.css, ТЗ в Markdown и HTML, результаты сценариев QA-R5.md, проверка demo-policy, notices и MANIFEST.json с SHA-256.

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

R5: Support подключает агента/эксперта к тикету независимо от автора; отдельные приватные каналы; вопросы со связанным ответом/отменой, продолжением ожидания и переназначением без нового срока. Стартовая гипотеза внутренних сроков — напоминание 12 / цель 24 календарных часа, настройки только для новых вопросов. Существующие SLA и отдельное окно подтверждения решения не заменяются. Колба/сдвиг времени/ошибка сохранения — только демо.

На живом сайте прочитаны формы/очередь/настройки без отправок. Подтверждено текущее окно Settings[resolvedReplyHours] = 24. Support использует low/normal/high/urgent, Chat V2 пока low/medium/high/critical: требуется согласование общего server intake. Права агента-автора на приёмку/возврат live не подтверждены: в макете это явно помеченные authorCapabilities, не утвержденный backend grant. Полный список границ и серверных работ — в ТЗ и QA-R5.md.

Переиспользовать принятый YouDate/AdminLTE layout и готовые компоненты Support/Agent Chat. Не менять фоновые страницы; убрать только прежнюю вкладку Internal из карточки и подключить сквозную панель. Сохранить серверные audience/membership, вопросы, lifecycle/SLA и защищенные запросы. Рабочие личные пары и actor-scoped summary — новый серверный объем с отдельным правом, не копия Support DTO.

internal-widget.js использует синтетические роли, ID и localStorage. Это демонстрационный controller, не production auth/API. CSP/custom.js ограничивают demo-операции, не задают production security. Реальные права, transport, retries, upload/scan, платежи и service_session этим пакетом не проверены.

ticket-policy.js содержит чистую модель демонстрационных вопросов, которую проверяет `node developer/tests/policy.test.cjs` из корня распакованного комплекта. Этот тест не заменяет HTTP/RBAC/транзакционную приемку. При ошибке storage текст сохраняется в памяти текущей вкладки и переживает ее повторный render/переходы; перезагрузка при недоступном storage не гарантирует восстановление.

Для совместного просмотра двух ролей нужен один HTTP origin. Отдельный file://-просмотр возможен, но браузер может ограничивать storage; запускать обычный локальный static server. Пакет самодостаточен и не требует CDN. Production AssetBundle/шрифты не менять из-за offline адаптации.

ZIP содержит тот же developer-комплект, README/notices/index и manifest; не содержит сам себя, старую память, приватные реестры и QA-скриншоты. Проверки/receipt этой публикации хранятся отдельно локально.
