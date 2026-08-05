# Admin Agent Chat — принятая функциональная карта

Документ описывает утверждённый результат макета. Формулировки «обязательно» относятся к интеграции: UI должен сохранять показанные состояния и переходы, а backend должен обеспечить их авторитетно.

## 1. Акторы и источник правды

| Участник | Что делает в интерфейсе | Что решает сервер |
|---|---|---|
| Эксперт/оператор | Выбирает диалог, отвечает, редактирует разрешённое сообщение, предлагает paid-консультацию, запускает/ставит на паузу/возобновляет/завершает сессию, управляет внутренним контекстом. | RBAC, доступ к диалогу, допустимость действия, состояние сессии, запись аудита и транзакции. |
| Клиент | Подтверждает предложение и готовность к подключению, получает сообщения и безопасные системные события. | Факт consent, client readiness, баланс, billing и серверную доставку. |
| Система | Показывает очереди, статусы, таймеры, ошибки, realtime-события и модерационные состояния. | Канонические snapshots, timestamps, delivery/read state, deduplication и reconciliation. |
| Super-admin/staff | Получает внутренние причины, audit и quality/support контекст в разрешённом scope. | Политики доступа и раскрытия внутренних полей. |

Браузер никогда не является источником правды для денег, таймеров, авторизации, consent, state transitions или сохранения данных.

## 2. Каркас страницы и responsive-поведение

| Регион | Содержание | Требуемое поведение |
|---|---|---|
| Global admin chrome | Верхний header, network badge, Refresh, Problem, статус Online/Busy/Offline, sidebar. | Сохраняется существующий admin layout; global assets не смешиваются с chat-only logic. |
| Левая панель | Chats/Pings/Rejects, поиск, User, Expert, quick filters, список карточек. | На телефоне сворачивается в rail/overlay; открытие/закрытие не меняет серверные данные. |
| Центральная панель | Заголовок диалога, actions, billing panel, сообщения, composer. | Основная рабочая область; floating paid control позиционируется относительно центра и composer. |
| Правая панель | Client, AI, Pay, Notes, Follow, Quality. | На телефоне становится отдельным rail/overlay; секции могут обновляться частично через `apply_sections`. |
| Модали/drawers | Paid session, report, delete, busy/offline/problem, pinned drawer, translation/gallery. | `hidden`/focus/Escape/backdrop/close; запрет действия отображается внутри modal, а не через silent failure. |

Главные anchors: `chat-stage1.html:183-205,209-337,481-607`; `agent_chat_custom.js:1178-1408`; `agent_chat_paid_session.css:681-755`; `global_custom.css:1738-1794`.

## 3. Очередь диалогов

### 3.1 Сценарии

| Элемент | Логика |
|---|---|
| `Chats` | Обычные чат-лиды. |
| `Pings` | Ping-style лиды/задачи. |
| `Rejects` | Отклонённые/отказанные лиды. |
| Text search | Debounce `1000 ms`; Enter запускает сразу; clear возвращает полный список и фокус. |
| User select | Поиск/выбор пользователя; хранит `selected_user_id`. |
| Expert select | Поиск/выбор эксперта/backend-side; хранит `selected_expert_id`. |
| Quick filters | Группы 19 утверждённых badge-кодов; checkbox только staging, Apply отправляет запрос, Reset очищает. |

Пять зон независимы: `quick_preset`, `search`, `user_select`, `expert_select`, `quick_filters`. Выбор одной зоны очищает остальные четыре; зоны не комбинируются.

### 3.2 Карточка и badges

Карточка обязана содержать `data-conversation-id`, sender/recipient ids/names/avatars, lead type, display name, language и badges. Технические роли клиента/эксперта остаются в `data-*`, даже если визуально скрыты.

19 стабильных кодов:

- Chats: `chats_sell`, `chats_live`, `chats_payment_process`, `chats_paid`, `chats_trial`, `chats_skeptic`, `chats_revive`, `chats_risk`, `chats_safe`, `chats_coupon`.
- Pings: `pings_fire`, `pings_hot`, `pings_new`, `pings_paid`, `pings_reply`, `pings_await`, `pings_revive`, `pings_trial`, `pings_risk`.

Backend сначала разрешает семантические замены (`Fire > Hot > NEW`, `Reply XOR Await`, `Live/PP/Skeptic/Risk` скрывают `Sell`, `Safe` заменяет `Risk` только в Chats), затем отдаёт коды, роли, приоритеты и зоны. UI не определяет badge по видимому тексту и не удаляет badge из-за ограничения ширины.

### 3.3 Переключение диалога

Один commit-path применяет к выбранной карточке:

1. center header и labels;
2. `messages_html`;
3. `context_json` по секциям;
4. `pinned_messages`;
5. draft только нового `conversation_id`;
6. translation direction и client profile language.

Перед запросом сохраняется draft исходного диалога. Reply/edit/attachment/translation state и unsaved Notes сбрасываются. Поздний ответ старого диалога отбрасывается. Если активная карточка исчезла после фильтра, выбирается первая видимая карточка тем же switch-flow.

Контракт: `CHAT_QUEUE_CONTRACT.md:369-570`, endpoint `GET /admin/messages/conversations/{conversation_id}`.

## 4. Центр диалога

### 4.1 Заголовок и действия

| Действие | Поведение |
|---|---|
| Search in conversation | Открывает inline search, server search возвращает compact results dropdown. |
| Favorite / pinned conversation | Optimistic toggle, после ответа синхронизирует header и queue card. |
| Pinned messages | Открывает drawer; pin/unpin, message indicator и список используют один canonical store. |
| Jump first / last | При загруженной границе — local scroll; иначе запрашивает boundary window; кнопки блокируются на время запроса; target подсвечивается. |
| Date separator | Открывает range picker; `Показать` загружает период; `Сбросить` — день `00:00–23:59`; во время запроса кнопки disabled. |
| Font +/- | Локальная настройка размера шрифта, `localStorage`. |
| Report | Открывает report modal для текущего клиента/диалога; причина обязательна, описание опционально. |
| Delete chat | Открывает modal. В текущем макете удаление запрещено; даже при включении UI backend повторно проверяет permission. |

### 4.2 Сообщения

Каждое реальное сообщение имеет `data-message-id`, `data-message-author` (`operator|client|system`), `data-message-has-text`, язык, attachment kind/count и, если нужно, read/delivery/moderation metadata. Бизнес-логика не выводится из положения bubble слева/справа.

Поддержанные отображения:

- обычный текст с сохранением `\n` и `white-space: pre-wrap`;
- файлы, одно фото, gallery, audio/voice;
- `sending`, `failed`, `retrying`, `sent`;
- reply quote;
- system payment/hint/typing и paid-session timeline rows;
- partial/full censorship.

System row — отдельный тип, не обычный bubble: нет reply/copy/translate по умолчанию; persistent event имеет стабильный `message_id`. Ответ realtime и ответ mutation с одним id должны отрисоваться один раз.

## 5. Composer и message actions

### 5.1 Взаимоисключающие режимы

| Mode | Действие |
|---|---|
| `direct` | Новый ответ: `POST /admin/messages`. |
| `reply` | Ответ с `reply_to_message_id`: `POST /admin/messages`. |
| `edit` | Редактирование operator message: `PATCH /admin/messages/{message_id}`. |

Reply и edit взаимоисключающие. Attachment — вторичный payload для direct/reply; attachment + edit не разрешается текущим контрактом. Voice — вторичный тип отправки.

### 5.2 Защищённая отправка

При `sendUnlockEnabled=true` непустой текст/attachment начинается в `locked`; первый клик запускает countdown, второй в `ready` отправляет. Изменение текста во время countdown сбрасывает state. При `false` корректный контент отправляется одним кликом. Пустой текст и stale translation всегда блокируются.

Draft:

- быстрый local buffer примерно через `400 ms`;
- server snapshot примерно каждые `10 s`, только если fingerprint изменился;
- при смене диалога — принудительный flush;
- ключ и payload изолированы по `conversation_id`;
- очистка пустого draft отправляет `draft_deleted=true`.

### 5.3 Действия сообщения

- Reply — для клиентских сообщений и разрешённых operator messages; не для system, failed/retrying и full-censored.
- Translate — для текста; inbound вызывает API, operator translated message переключает сохранённый original локально.
- Copy — только когда есть текст и нет full-censorship/deleted.
- Pin/Unpin — первый пункт `...`, optimistic с rollback; сервер возвращает canonical title/preview/meta.
- Edit/Delete — только собственное operator message и только пока `data-message-viewed-by-client="false"`.
- Soft delete оставляет `Message deleted`; hard delete разрешён только eligible billing offer-card и полностью убирает card.
- Failed send получает Retry; при ошибке state возвращается в `failed`.

Контракт: `CHAT_MESSAGE_DATA_CONTRACT.md:351-659,790-866`.

## 6. Цензура и безопасность текста

Server отправляет во frontend только safe/censored text; исходные запрещённые фрагменты браузеру не передаются.

| Состояние | Отображение | Запрещённые действия |
|---|---|---|
| `partial` | Текст остаётся читаемым, запрещённый фрагмент — `.message-censored-fragment`. | Допустимые actions определяет безопасный message model. |
| `full` | Нейтральное уведомление «Message hidden by server moderation». | Reply, Copy, Translate скрыты. |
| Moderated | Subtle `moderated` badge в meta row. | Internal category/original не раскрываются. |

Модерация, audit и policy decisions остаются на сервере; frontend не восстанавливает исходный текст.

## 7. Правая панель контекста

| Вкладка | Что отображает/делает |
|---|---|
| Client | Profile, badges, summary KPI, Personal data и Partner editable accordions, Support info, restrictions/report. |
| AI | Summary, next best actions, loss-risk, refresh, insert draft. Draft только вставляется в composer и не отправляется автоматически. При incoming message summary получает stale-состояние. |
| Pay | Operational balance/status/events, package/top-up action; точный расчёт приходит сервером. |
| Notes | Внутренние notes. Save создаёт note; Clear очищает только unsaved textarea, существующие notes не удаляются. |
| Follow | Postpone next touch; действие не отправляет сообщение клиенту само. Worker отвечает за будущую доставку. |
| Quality | Translation direction, checks, private supervisor note и `send_guard`: `allow`, `confirm`, `block`. |

`context_json.apply_sections` позволяет подключать разделы постепенно, не заменяя весь right panel.

## 8. Paid consultation: кнопка и модали

### 8.1 Единственная бизнес-кнопка

`#paidSessionControl` — единственный control, который меняет paid-session state. `#billingPanel` только отображает текущий server snapshot и может сворачиваться без изменения состояния.

| Server state | Кнопка | Доступное действие |
|---|---|---|
| `no_consent` | Neutral lightning | `Offer paid consultation` → Offer modal. |
| `offer_pending` | Disabled spinner | Ожидание client consent; повторный offer запрещён. |
| `ready` | Green play | `Start paid session` → Start modal. |
| `connecting` | Disabled spinner | Бесплатное подключение; billing ещё не начался. |
| `active` | Red pause | `Pause paid session` → Pause modal. |
| `paused` | Amber play | `Resume paid session` → Resume modal. |
| `reconnecting` | Disabled reconnect | Grace-period; новая минута не запускается. |
| `completed` | Disabled check | Терминальное состояние; только история/support route. |

`billing_mode` независим: `none`, `trial`, `paid`. Если trial entitlement равен нулю, trial пропускается и после подключения стартует paid.

### 8.2 Модальные окна

| Modal | Поля и кнопки | Результат |
|---|---|---|
| Offer | Service/rate из server catalog (в текущем UI selector disabled), обязательный template, точный client preview, `Отмена`, `Отправить предложение`. | Одна транзакция создаёт offer и client-visible message; state → `offer_pending`. |
| Start | Показывает `Trial` или `Paid`; сообщает, что подключение не тарифицируется; `Отмена`, `Начать подключение`. | State → `connecting`; billing начинается только после готовности обеих сторон. |
| Pause | Для клиента: template + preview. Для сервиса: обязательная reason, optional private supervisor comment; `Завершить`, `Отмена`, `Поставить на паузу`. | State → `paused`; existing started minute может закончиться, следующая не начинается; message, internal comment и state атомарны. |
| Resume | Показывает pause reason; `Завершить`, `Отмена`, `Продолжить`. | State → `connecting`; после readiness — `active`; top-up сам по себе не resume. |
| Complete | Обязательная completion reason; optional final client message; `Отмена`, `Завершить консультацию`. | State → `completed`, persistent `session_completed`. |

Причины pause: `client_request`, `expert_break`, `technical`, `balance`. Причины completion: `consultation_finished`, `client_left`, `technical_end`, `policy_stop`.

### 8.3 Таймеры, деньги, транзакции

- Consent не списывает credits.
- `connecting` бесплатен.
- Billing начинается после server-confirmed readiness обеих сторон.
- Pause/complete завершают уже начатую минуту, но не начинают следующую.
- `manualPauseSeconds=300`, `reconnectGraceSeconds=60`, `offerTtlSeconds=900`, `connectionTimeoutSeconds=180` — стартовые значения макета; production values приходят через PHP `defaults` и управляются backend/admin policy.
- UI показывает только `balance_signal`: `unknown|sufficient|low|required`, не точный баланс.
- Top-up показывается только при `low|required` и никогда не возобновляет сессию автоматически.
- Refund/compensation — отдельный staff/moderator workflow, не действие paid-session control.

### 8.4 Конкурентность

Каждая мутация несёт `conversation_id`, `session_id`, `consent_id`, `operator_id`, `expected_version` и новый `idempotency_key`. Pending control disabled. При `409` свежий `session` применяется сразу, blind retry запрещён. Любой успешный response обязан вернуть полный canonical session snapshot.

События: `agentpaid:state-changed`, `agentpaid:layout-changed`, `agentpaid:offer-created`, `agentpaid:pause-created`, `agentpaid:timeline-event`, `agentpaid:topup-requested`.

Контракт: `PAID_SESSION_CONTRACT.md:52-157,200-448`.

## 9. Операторский статус и сеть

Статус оператора и качество сети — разные состояния.

| Контур | Значения | Правило |
|---|---|---|
| Operator status | `Online`, `Busy`, `Offline` | Рабочая доступность. Busy/Offline применяются через modal с причиной/comment. |
| Network quality | `good`, `unstable`, `offline` | `Connected`, `Unstable`, `No connection`. |

При network `offline` Online недоступен; если оператор был Online, frontend переводит его в Busy. Busy из status dropdown и user-menu открывает одну modal. Network dot не меняется напрямую status-action.

Контракт: `OPERATOR_STATUS_NETWORK_CONTRACT.md:13-60,84-206`.

## 10. Response, realtime и Yii2 integration boundary

### 10.1 Общий response envelope

Успех: `ok: true`, `request_id`, canonical ids/timestamps и данные действия. Ошибка: `ok: false`, stable `code`, safe `message`, при возможности свежий snapshot. Conversation-scoped response сохраняет `conversation_id`; серверный moderated display text не пересобирается browser.

### 10.2 Рекомендуемый порядок переноса

1. Отрендерить страницу как PHP view/partials, сохранив существующий admin header/menu/footer.
2. Подключить оригинальные assets, затем `global_custom.*`, затем `agent_chat_custom.*` и `agent_chat_paid_session.*`.
3. Заполнить `#adminAgentChatConfig` и `#paidSessionConfig` серверными данными, CSRF и endpoint URLs.
4. Заменить demo fixtures на реальные Yii2 responses через один request adapter.
5. Проверить каждый endpoint, RBAC/CSRF/transaction/idempotency/version и только после этого включить realtime.
6. Для realtime разделить bootstrap snapshot и live delta; повторное событие dedupe по stable id; reconnect требует reconciliation.

### 10.3 Обязательные endpoint groups

- Queue/switch/refresh/state: `/admin/messages/conversations/filter`, `/admin/messages/conversations/{id}`, `/refresh`.
- Message/search/history: `/admin/messages`, `/search`, `/translate`, `/translate-draft`, `/boundary`, `/range`, `/drafts/save`, `/{message_id}`, `/{message_id}/retry`.
- Pin/context/follow/billing: `/pinned`, `/context/{section}`, `/follow`, `/billing/action`.
- Paid session: `/admin/paid-session/state`, `/offer`, `/start`, `/pause`, `/resume`, `/complete`, `/top-up`.
- Operator/global: `/admin/operator/status`, `/busy`, `/offline`, `/network-health`, `/admin/report/problem`.

Полный список payloads и response examples находится в `CHAT_CONTROL_BACKEND_MATRIX.md`, `CHAT_QUEUE_CONTRACT.md`, `CHAT_MESSAGE_DATA_CONTRACT.md`, `PAID_SESSION_CONTRACT.md`.

## 11. Зафиксированные интеграционные поверхности без пересмотра UI

Следующие 12 видимых действий уже имеют финальную UI-модель, но в исходном handoff прямо помечены как требующие backend/product semantics до включения production transport:

1. attachment upload (pre-upload IDs/tokens или final multipart);
2. voice upload timing;
3. AI refresh persistence/queue;
4. AI insert audit;
5. Notes save/clear endpoint semantics;
6. Follow schedule/worker semantics;
7. Assign target/picker;
8. Note control behavior;
9. Resolve final/reversible state and queue effect;
10. package action/selector/link policy;
11. compact mode/sound preference persistence;
12. keyboard shortcuts modal или removal.

Это не альтернативы и не оценка утверждённого макета. Это граница handoff: визуальное поведение принято, но программисту перед запуском production requests нужно реализовать эти серверные контракты или получить отдельную зафиксированную спецификацию.

Источники: `CHAT_CONTROL_BACKEND_MATRIX.md:58-73`, `AGENT_CHAT_JS_AUDIT.md:79-94`.
