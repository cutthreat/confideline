# G1 — повторная сверка HTML-чата и контрактов архива

**Дата:** 14.08.2026  
**Источник макета:** `J:\Codex Base J\Users\alexe\Downloads\Telegram Desktop\admin-chat-stage1-20260804-handoff.rar`  
**Рабочая распаковка для аудита:** `H:\GPT-Codex\Confideline\.tmp\chat-archive-audit-20260814-r1`  
**Статус:** `frontend_contract_audit_complete`; production-интеграция не доказана.

## Как читать результат

- `PASS` — HTML и контракт согласованы с текущим продуктовым решением.
- `ADAPT` — технический hook/контракт есть, но при интеграции нужен явный
  продуктовый ограничитель или маппинг.
- `DEFERRED` — в архиве есть hook, но контракт сознательно оставляет решение
  на следующий этап; backend не должен самовольно включать действие.
- `FIX` — в demo/fixture есть несоответствие, которое нельзя переносить в
  production.

Контракты архива являются основой технической разметки и integration points.
Демо-данные, `demo` transport и строки `Open Production Decisions` не являются
доказательством готового backend.

## Сводная проверка по областям

| Область HTML | Контракт архива | Сверка с логикой проекта | Статус и действие |
|---|---|---|---|
| Глобальный header: подключение, Проблема, Online/Busy/Offline | `OPERATOR_STATUS_NETWORK_CONTRACT.md`; `assets/global_custom.js` | Статус оператора и качество сети разделены. Offline блокирует Online; при потере сети Online переводится в Busy. Это глобальная админ-логика, не логика чата. | **PASS/ADAPT** — переносить как отдельный global asset; реальные endpoints и RBAC проверить в Yii2. |
| Левая очередь `Chats / Pings / Rejects` | `CHAT_QUEUE_CONTRACT.md` | Это переключатель типа очереди, а не badge-фильтр. Выбор одной зоны сбрасывает остальные фильтры. `Rejects` не получает произвольные badge-коды. | **PASS** — сохранить семантику и единый payload `getQueueStatePayload`. |
| Поиск, User, Expert, quick filters | `CHAT_QUEUE_CONTRACT.md` | Зоны независимые, не кумулятивные. Фильтры используют только 19 stable `badge_code`, а не видимый текст. | **PASS** — backend должен принимать `active_filter_zone`, `changed_by`, сценарий и коды. |
| Badge-слой Left/Center/Right | `CHAT_QUEUE_CONTRACT.md`, `codex-context-badge-resolver-ru.md` | 19 кодов: 10 Chats, 9 Pings. `Fire > Hot > NEW`, `Reply XOR Await`, `Live/PP/Skeptic/Risk` скрывают Sell, Paid — глобальный успешный wallet top-up, PP — текущий checkout, первое сообщение клиента → Chats с `Reply`. | **PASS** — не хранить готовую строку badge; использовать server-side resolver и сценарий поверхности. |
| Badge `Needs reply` в Chats | `CHAT_QUEUE_CONTRACT.md` + G1.2 reconciliation | В HTML есть кнопка `Needs reply`, но это не один из 19 badge-кодов и не `pings_reply`. Это отдельное рабочее состояние Chats. | **ADAPT** — не добавлять `chats_reply` без отдельного PM-контракта. Кнопка текущего этапа visual-only. |
| Карточка очереди и переключение диалога | `CHAT_QUEUE_CONTRACT.md` | Сервер возвращает conversation metadata, `messages_html`, `context_json`, `pinned_messages`; переключение изолирует draft/reply/edit/attachments/translation по `conversation_id`. | **PASS** — не применять late response к уже сменившемуся диалогу. |
| Header выбранного диалога | `CHAT_QUEUE_CONTRACT.md`, HTML `dialog-meta` | Center получает только разрешённые badge-коды текущего сценария; favorite/pinned — состояния, не badges. | **PASS** — не смешивать `pings_*` и `chats_*`. |
| Кнопка платной консультации `#paidSessionControl` | `PAID_SESSION_CONTRACT.md` | Сервер авторитетен. `no_consent → offer_pending → ready → connecting → active`; `active → paused/reconnecting`; terminal `completed`. Consent не списывает, connecting не тарифицируется. | **PASS** — использовать полный snapshot, `expected_version`, idempotency и server timers. |
| Offer modal | `PAID_SESSION_CONTRACT.md` | Предложение отправляется атомарно с client-visible message. Текст разрешается сервером по `offer_template_id + offer_template_version`; preview браузера диагностический. | **PASS/ADAPT** — версия action-template сохраняется как immutable snapshot; это не revision history каталога. Не использовать demo `10 credits/min` как цену. |
| Start modal | `PAID_SESSION_CONTRACT.md` | Клиент уже дал consent; Start переводит в connecting. Trial/paid — billing mode; 0 trial пропускает trial. | **PASS** — списание только после готовности обеих сторон. |
| Active / Live | `PAID_SESSION_CONTRACT.md`, Badge Contract | Live означает начатую незавершённую консультацию. При pause/reconnect Live остаётся; снимается при manual/technical terminal end. | **PASS** — не снимать Live на временной паузе или reconnect. |
| Pause modal | `PAID_SESSION_CONTRACT.md` | Client message и internal comment разделены. Причина обязательна; операция pause + сообщение + внутренний комментарий атомарна. Новая минута не начинается; top-up не возобновляет автоматически. | **PASS** — internal comment не отправлять клиенту/переводчику/realtime client payload. |
| Resume / Reconnect | `PAID_SESSION_CONTRACT.md` | Resume идёт через connecting; reconnect имеет grace и timeout; backend решает terminal outcome. | **PASS/ADAPT** — не доверять браузерному таймеру для billing. |
| Complete modal | `PAID_SESSION_CONTRACT.md` | Причина обязательна; завершение — отдельный terminal transition, не Resolve очереди. | **PASS** — возвращать timeline event и полный session snapshot. |
| Paid-session panel / balance | `PAID_SESSION_CONTRACT.md` | Показываются status clock, billing mode/readiness/balance signal. Exact balance не должен идти в session-control panel. | **ADAPT** — статические/точные demo credits в HTML заменить серверным безопасным представлением. |
| Сообщения и system events | `CHAT_MESSAGE_DATA_CONTRACT.md` | Author — `operator/client/system`; stable message_id; system paid-session events — внутренний timeline, client offer/pause — обычное сообщение; realtime и history dedupe. | **PASS** — не превращать internal timeline в клиентский текст. |
| Цензура и moderation | `CHAT_MESSAGE_DATA_CONTRACT.md` | Frontend получает только safe/censored text; partial/full, full без copy/reply/translate. | **PASS** — исходный запрещённый фрагмент не должен попадать в браузер. |
| Reply / Edit / Delete / Pin / Retry | `CHAT_MESSAGE_DATA_CONTRACT.md` | Reply/edit/delete — разные composer modes; edit/delete только operator message по viewed rule; soft/hard delete различаются; retry только failed; pin server-canonical. | **PASS** — сохранять серверные id/timestamps и rollback при ошибке. |
| Перевод сообщения | `CHAT_MESSAGE_DATA_CONTRACT.md`; Quality section | AUTO разрешается через профиль клиента; Quality override действует для диалога. Перевод запускается явно; результат preview/read-only; отправка отдельной кнопкой. | **ADAPT** — provider не выбран; не включать внешний сервис и auto-send. Мismatch с языком клиента должен показываться modal-подсказкой. |
| Composer direct/reply/edit | `CHAT_MESSAGE_DATA_CONTRACT.md` | Режимы взаимно исключающие; attachments вторичны; stale translation блокирует send; drafts изолированы по conversation. | **PASS** — не переносить состояние между диалогами. |
| Composer templates | HTML `#composerTemplateOptions`, `CHAT_CONTROL_BACKEND_MATRIX.md` | В HTML 10 демо quick templates. По продукту каталог системных/анкето-экспертных/личных шаблонов; placement только `pings`, `active_chat`, `paid_chat`. | **ADAPT** — demo 10 не считать утверждённым каталогом. Системные создаёт super-admin, шаблоны анкеты — назначенный Agent/operator, личные — владелец. |
| Action templates платной session | `PAID_SESSION_CONTRACT.md` | Offer/pause options имеют `data-template-id` и `data-template-version`; сервер выбирает канонический текст. | **PASS** — сохранять ID+version операции; не путать с отсутствующей общей history шаблонов. |
| Attach menu: image/gallery/document | `CHAT_MESSAGE_DATA_CONTRACT.md`, `CHAT_CONTROL_BACKEND_MATRIX.md` | Prototype умеет local staging; transport (pre-upload token или multipart) ещё не закрыт. | **ADAPT** — images/documents разрешены только server allowlist, ACL, MIME/size/AV checks; до transport contract не включать production send. |
| Audio/voice/video/arbitrary files | Архивный message contract и HTML hooks | В архиве есть `audio`, `voice`, `mix`, `#btnUploadAudio`, `#btnVoiceMessage`, demo MP3/WAV/JS/TXT. PM-правило продукта: запрещены audio/video/voice и arbitrary files. | **FIX** — production скрыть/disable эти hooks; `mix` с запрещённым элементом отклонять; demo MP3/JS/TXT не переносить. |
| AI tab | `CHAT_QUEUE_CONTRACT.md`, `CHAT_CONTROL_BACKEND_MATRIX.md` | AI — подсказка оператору, не отдельный чат; Use draft только вставляет текст, не отправляет. Refresh/AI audit остаются product decision. | **DEFERRED** — не считать AI endpoint готовым до решения о sync/queue/audit. |
| Client / Partner / Restrictions | `CHAT_QUEUE_CONTRACT.md` | Context sections приходят через `context_json.apply_sections`; сохранение optimistic с rollback. Ограничения — server-authored guidance. | **PASS/ADAPT** — проверить privacy/permission и скрыть лишние внутренние идентификаторы от не-super-admin. |
| Pay tab / Send package link | `CHAT_QUEUE_CONTRACT.md`, G2 contracts | `Send package link` должен вернуть server-rendered `message_html`; package card — не attachment. | **DEFERRED** — package action policy и выбор пакета ещё не утверждены; не отправлять demo link. |
| Notes tab / Note button | `CHAT_QUEUE_CONTRACT.md` | Notes private; Save создаёт note, Clear очищает только textarea. | **ADAPT/DEFERRED** — отдельный `Note` control visual-only до PM action contract; tab persistence endpoint должен быть реализован отдельно. |
| Follow tab | `CHAT_QUEUE_CONTRACT.md` | Postpone меняет follow schedule, не отправляет сообщение; worker отвечает за будущую доставку. | **DEFERRED** — follow semantics, limits и queue transitions не активировать из demo. |
| Quality tab | `CHAT_QUEUE_CONTRACT.md`, product decision | Translation direction и server-authored checks/supervisor note; Agent can set dialogue language, super-admin can lock. | **PASS/ADAPT** — не показывать внутреннюю supervisor note клиенту; правомочия проверяются backend. |
| `Needs reply / Assign / Note / Resolve` | `CHAT_QUEUE_CONTRACT.md` / backend matrix | Архив перечисляет endpoints, но одновременно помечает бизнес-решения как open. Текущий PM-канон: visual-only/deferred. | **DEFERRED** — не создавать persistence, assignment, resolve или side effects без отдельного PM-контракта. Resolve не завершает consultation. |
| Report / Delete chat | `CHAT_QUEUE_CONTRACT.md` | Report требует reason, description optional; Delete по умолчанию запрещён и backend permission-gated. | **PASS/ADAPT** — не переносить demo “запрещено” как окончательную RBAC-модель; проверять сервером. |
| Operator/network global controls | `OPERATOR_STATUS_NETWORK_CONTRACT.md` | Это global admin chrome; endpoint drafts commented. | **PASS/ADAPT** — интегрировать отдельно от chat backend. |
| API envelopes / CSRF | `API_RESPONSE_CONTRACT_AUDIT.md`, `YII2_MIGRATION_NOTES.md` | `ok`, stable `code/message`, canonical ids/timestamps, `message_html`, complete paid session snapshot; CSRF through one adapter. | **PASS** — не раскручивать отдельные несовместимые fetch-форматы. |
| Responsive/accessibility | `AGENT_CHAT_JS_AUDIT.md` | В архиве заявлены checks 319px, no overflow, unique IDs, no console errors. | **ADAPT** — это proof статического prototype, а не production; повторить после Yii2 render и реальных данных. |

## Найденные артефакты, которые нельзя переносить в production

1. `chat-stage1.html` содержит demo `rate_label="10 credits/min"`, `Paid active`,
   `50 credits`, LTV и статические имена/ID. Эти значения заменяются server
   context и текущими настройками админ-панели.
2. В demo-очереди sender карточки — `Alla`, а статический right Client context
   начинается с `Orion Esposito`; это fixture mismatch. При реальном
   conversation response `context_json.profile` обязан соответствовать
   выбранной карточке.
3. В demo есть `voice.mp3`, `widget.js`, `notes.txt`, audio/voice messages и
   `#btnUploadAudio`; они нарушают текущий продуктовый allowlist и должны быть
   исключены/disabled на production-слое.
4. `verify_badge_contract.ps1` из архива при запуске в PowerShell с одним
   найденным элементом падает на scalar `.Count` (строка 125). Это дефект
   verifier-а, а не бизнес-логики; перед CI его нужно исправить через
   `@(...)`/нормализацию коллекции. Остальные проверки archive прошли:
   message 22 direct + 3 system, control 20 chat + 5 global endpoints,
   paid-session 8 states + 7 endpoint keys, JS syntax — PASS.
5. Внешние URL и CSRF в standalone HTML — fixtures/integration placeholders;
   production должен рендерить Yii2 URL/CSRF, а не копировать архивные значения.

## Порядок интеграции без разночтений

1. Сначала сохранить HTML hooks и server response shapes из архива.
2. Подключить queue/conversation/message read path и server BadgeResolver.
3. Подключить paid-session state machine с consent, expected_version,
   idempotency и атомарными client/timeline events.
4. Подключить moderation/censorship, send guard, translation direction и
   drafts.
5. Включить только разрешённые image/document attachments; audio/voice/video/
   arbitrary file controls оставить disabled.
6. После этого отдельно закрывать open product decisions (AI, Follow, package,
   Assign/Note/Resolve, upload transport) отдельными PM-решениями.

## Приёмка

Обязательные доказательства после интеграции:

- серверный readback выбранной карточки совпадает с queue/context/messages;
- 19 badge-кодов и разрешённые поверхности совпадают с Badge Contract;
- первое сообщение клиента появляется в Chats с `Reply`, не в Pings;
- `Paid` появляется только после успешного wallet top-up, `PP` исчезает по
  terminal payment/TTL, `Live` остаётся в pause/reconnect;
- offer/pause messages и internal timeline не дублируются;
- internal comment не попадает клиенту/переводчику;
- запрещённые вложения отклоняются server-side;
- каждый mutation endpoint возвращает `ok`, canonical ids/timestamps и
  rollback/conflict result;
- после Yii2 render повторены JS/HTML/CSS, responsive и accessibility checks.

**Вывод:** HTML-макет и архивные контракты согласованы с продуктовой логикой
после четырёх явных адаптаций: action-template version ≠ catalog history,
ограничение attachments, deferred controls и замена demo fixtures на server
state. Архив можно передавать Игорю как техническую основу только вместе с
этим audit/context-файлом.
