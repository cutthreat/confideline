# Admin Agent Chat — разбор утверждённого handoff

## Результат

Разбор архива завершён. `chat-stage1.html` вместе с его JS/CSS и контрактами зафиксирован как утверждённая версия поведения макета для следующего этапа интеграции в Yii2.

Это не оценка дизайна и не предложение альтернатив. Ниже описано, что именно должно работать так, как показано, и какой backend/realtime-контур необходим, чтобы это поведение стало рабочим.

Для product-решений archive handoff читается вместе с каноническими PM-ТЗ G1.2/G1.3/G2.1/G2.2. При расхождении demo-контракта или fixture с последним PM-решением приоритет имеет PM-ТЗ; demo не является источником цен, ролей, billing state или policy.

## Исходный пакет

| Поле | Значение |
|---|---|
| Архив | `admin-chat-stage1-20260804-handoff.rar` |
| SHA-256 архива | `1D111B27B71060174323BE17278F89BA2680DFB00262B591A52F40A193D605F3` |
| Размер | `1 396 296` bytes |
| Извлечённая копия | `extracted/` |
| Состав | `65` файлов, `42` вложенных каталога |
| Проверка встроенных SHA-256 | `64/64` файлов совпали; checksum-файл не включает сам себя |

## Документы

- [Принятая функциональная карта](ACCEPTED_FUNCTIONAL_MAP-RU.md) — полный пользовательский и серверный контракт.
- [Контекст для Codex интеграции](CODEX-INTEGRATION-CONTEXT.md) — самодостаточный handoff для агента, который будет подключать макет к backend.
- [Production-поверхности для внедрения](EXTENDED_PRODUCTION_SURFACES-RU.md) — 12 незавершённых integration-поверхностей плюс зафиксированный безопасный `Copy history`, с endpoint, payload/response, RBAC, persistence, audit, ошибками и DoD.
- [Описание работы бейджей](BADGE-BEHAVIOR-RU.md) — 19 stable-кодов, правила взаимозаменяемости, порядок отображения, фильтры и приёмка.
- [Расхождения карточки G1.2 на панели](PANEL-TZ-G1-2-DISCREPANCIES-RU.md) — проверка опубликованной краткой карточки против полного ТЗ и handoff.
- [Инвентарь пакета](INVENTORY.md) — состав архива и назначение каждой группы файлов.
- [Верификация и доказательства](VERIFICATION.md) — повторяемые проверки, runtime smoke и скриншоты.

## Статус

`handoff_analysis: complete`
`ui_contract: accepted_as_source_of_truth`
`yii2_runtime_integration: not_started_in_this_pass`
`backend_open_surfaces: contract_ready_for_integration`

Важно: локальный preview работает в `transport=demo`. Это доказывает согласованность UI-модели и demo-переходов, но не доказывает production billing, RBAC, persistence или realtime до подключения описанных endpoints.

Перед передачей исходного архива внешнему исполнителю обязательно удалить или заменить demo CSRF из `chat-stage1.html` и не передавать его как credential. Аналогично не передаются demo IDs, sample URLs и fixtures; production значения генерируются текущим Yii2 runtime.

## Что принято как неизменяемая основа

1. `#admin-agent-chat` — единственный корень чата.
2. `global_custom.*` обслуживает общий admin chrome и статус оператора; `agent_chat_custom.*` — чат; `agent_chat_paid_session.*` — paid-session.
3. Сервер является источником правды для прав, сообщений, денег, таймеров, сессии и аудита.
4. Все state-changing запросы возвращают канонический server snapshot; browser не начисляет деньги и не решает переходы самостоятельно.
5. DOM ids, `data-*` атрибуты, state classes, event names и response envelopes из контрактов являются границей интеграции.

В [Production-поверхностях для внедрения](EXTENDED_PRODUCTION_SURFACES-RU.md) отдельно закрыты все функции, которые в исходном пакете были оставлены как integration points: attachments, disabled voice/audio, AI refresh/use, private Notes, Follow, Assign, Note, Resolve, package action, operator preferences и keyboard shortcuts. Это расширяет handoff-контракт, но не означает, что production backend уже подключён.
