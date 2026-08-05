# Инвентарь admin-chat-stage1

## Файлы, которые являются source of truth

| Группа | Файлы | Назначение |
|---|---|---|
| Страница | `chat-stage1.html` | Полный утверждённый layout: header, queue, center chat, context, modals, configs. |
| Чат | `assets/agent_chat_custom.js`, `assets/agent_chat_custom.css` | Очередь, переключение диалога, сообщения, composer, context panel, local UI и AJAX integration points. |
| Paid session | `assets/agent_chat_paid_session.js`, `assets/agent_chat_paid_session.css` | Каноническая state machine, floating control, billing panel, модальные окна и timers. |
| Admin chrome | `assets/global_custom.js`, `assets/global_custom.css` | Network quality, Online/Busy/Offline, global problem report, общие модали и mobile chrome. |
| Контракты | `CHAT_CONTROL_BACKEND_MATRIX.md`, `CHAT_QUEUE_CONTRACT.md`, `CHAT_MESSAGE_DATA_CONTRACT.md`, `PAID_SESSION_CONTRACT.md` | Обязательные UI/backend/data/realtime правила. |
| Контракты окружения | `OPERATOR_STATUS_NETWORK_CONTRACT.md`, `API_RESPONSE_CONTRACT_AUDIT.md`, `YII2_MIGRATION_NOTES.md` | Общий статус оператора, response envelope и порядок Yii2-переноса. |
| Аудит | `AGENT_CHAT_JS_AUDIT.md`, `FINAL_HANDOFF_AUDIT.md`, `DELIVERY_README.md` | Сводка утверждённых изменений и порядок доставки. |

## Проверяющие инструменты

- `tools/verify_badge_contract.ps1`
- `tools/verify_message_contract.ps1`
- `tools/verify_control_contract.ps1`
- `tools/verify_paid_session_contract.ps1`

## Среда preview

- `codex-static-server.cjs` — локальный read-only static server.
- `assets/demo-audio-10s.wav` — demo-ресурс аудио-сообщения.
- `CHECKSUMS-SHA256.txt` — контроль целостности всех 64 перечисленных файлов.

## Вендорские ресурсы

Папки `assets/original/...` и `assets/youdate-original/...` содержат существующие Bootstrap, Font Awesome, Fancybox, Inter, Angular/CSS и логотипы. Их задача — сохранить текущий admin chrome и совместимость старого шаблона; они не являются новым доменным контрактом чата.

## Что не следует переносить из demo буквально

- `transport: demo` и локальные demo delays/state transitions;
- demo ids, имена, внешние sample URLs и sample CSRF из HTML;
- локальные `demoSetState()`/demo payloads;
- закомментированные `fetch()` блоки как готовый production API.

В Yii2 эти значения заменяются серверными конфигурациями, реальными данными и разрешёнными endpoints из контрактов.
