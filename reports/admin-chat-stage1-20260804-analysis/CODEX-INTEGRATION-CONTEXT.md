# Контекст для Codex: интеграция Admin Agent Chat в Yii2

## Роль этого файла

Это source-ready контекст для агента, которому передадут разработку интеграции. Макет и его поведение уже утверждены. Не пересматривать UX, не менять DOM-контракт и не добавлять собственные бизнес-правила без отдельного delta-пакета.

## Обязательный preflight перед передачей архива

Исходный архив — это переданный UI/JS/CSS-прототип, а не production-сборка. Перед тем как отправлять его внешнему исполнителю:

1. Не передавать demo CSRF из `chat-stage1.html`: заменить его placeholder либо удалить из демонстрационного конфига. В production PHP должен генерировать свежий CSRF из текущей Yii2-сессии.
2. Не переносить demo IDs, имена, внешние sample URLs, `transport: demo`, локальные задержки и fixtures в production.
3. Не переносить строку demo `10 credits/min`. Effective price приходит с сервера из G2.1: стартовое global значение — `30 credits/started minute`, profile override и immutable session snapshot.
4. UI-статусы прототипа не являются второй product state machine: `active` отображается как `trial` или `paid` по `billing_mode`, `paused` — как `balance_pause`, `reconnecting` — как reconnect-подстатус G1.3, `completed` — единый terminal status.
5. Несмотря на наличие voice/audio hooks и demo-audio asset, MVP разрешает только text/system/emoji/images/approved documents. Audio, voice, video и arbitrary/uninspectable files должны быть скрыты/disabled на UI и отклоняться server-side.

Если этот preflight не выполнен, production transport не включается.

## Source of truth

Порядок приоритета:

1. Последние owner decisions и канонические PM-ТЗ G1.2, G1.3, G2.1, G2.2 вместе с consistency/admin-ownership картой.
2. `ACCEPTED_FUNCTIONAL_MAP-RU.md` этого отчёта и `EXTENDED_PRODUCTION_SURFACES-RU.md` — согласованный UI/backend handoff.
3. Контракты из извлечённого архива: `PAID_SESSION_CONTRACT.md`, `CHAT_MESSAGE_DATA_CONTRACT.md`, `CHAT_QUEUE_CONTRACT.md`, `CHAT_CONTROL_BACKEND_MATRIX.md`.
4. `chat-stage1.html`, `assets/agent_chat_custom.js`, `assets/agent_chat_paid_session.js`, `assets/global_custom.js` и соответствующие CSS — reference implementation, включая demo fixtures.
5. Yii2 runtime/API/database — implementation and evidence layer; он реализует требования и не переопределяет owner/product contract без отдельного решения.

Если runtime расходится с demo, сохраняется утверждённая UI/state model, а mismatch фиксируется как integration defect с endpoint/state evidence.

Если archive contract или demo fixture расходится с каноническим PM-ТЗ, приоритет имеет PM-ТЗ; расхождение фиксируется в integration log, а не разрешается молча в пользу demo.

Дополнительные межцелевые источники, обязательные для paid/role поведения:

- `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\etalon-tz-g1-2-role-chat.md` — role/visibility/message/censorship contract;
- `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\etalon-tz-g1-3-status-history.md` — request/consent/lifecycle/history owner;
- `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\etalon-tz-g2-1-price-balance.md` — credits, package and effective price owner;
- `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\etalon-tz-g2-2-timer-debit-pause.md` — minute/debit/pause/reconnect owner;
- `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\g1-g3-route-and-admin-ownership-matrix.md` — единственный owner каждой admin-настройки.
- `BADGE-BEHAVIOR-RU.md` этого handoff — stable badge codes, scenario rules, display order и filter behavior.

## Scope

Интегрировать полный экран администратора для эксперта/оператора:

- queue Chats/Pings/Rejects и независимые фильтры;
- атомарное переключение conversation;
- сообщения, delivery/read/moderation, reply/translate/edit/delete/retry/pin;
- draft и composer modes;
- правый context panel Client/AI/Pay/Notes/Follow/Quality;
- paid consultation button/state machine/modals;
- operator status/network и global problem/report flows;
- responsive/mobile rails и существующий admin chrome.

Все оставшиеся production-поверхности перечислены в companion-документе [EXTENDED_PRODUCTION_SURFACES-RU.md](EXTENDED_PRODUCTION_SURFACES-RU.md). Перед реализацией обработчиков, которые в этом пакете являются demo/local, нужно прочитать его матрицу: она фиксирует endpoint, payload/response, RBAC, persistence, audit, idempotency, rollback и acceptance для attachments, voice/audio policy, AI refresh/use, Notes, Follow, Assign, Note, Resolve, package action, operator preferences и keyboard shortcuts.

## Non-goals текущего handoff

- не менять макет, подписи, order, state names, ids, data attributes, state classes;
- не переносить demo ids, demo timings, demo CSRF или demo external URLs в production;
- не использовать browser timer/DOM как billing authority;
- не отдавать client/internal comments, forbidden originals или private supervisor notes в client payload;
- не считать статические JS/CSS проверки доказательством production runtime.

## Неподвижный DOM/asset контракт

- Корень: `#admin-agent-chat`.
- Server configs: `#adminAgentChatConfig`, `#paidSessionConfig`.
- Queue: `.js-queue-tab`, `#conversationsSearch`, `#queueUserSelect`, `#queueExpertSelect`, `.js-qf-apply`, `.js-qf-reset`, `.conv-item`.
- Conversation: `#conversationItems`, `#conversationInputArea`, `#messageInput`, `#btnSendMessage`, `#pinnedMessagesDrawer`.
- Paid: `#paidSessionControl`, `#billingPanel`, `#paidSessionOfferModal`, `#paidSessionStartModal`, `#paidSessionPauseModal`, `#paidSessionResumeModal`, `#paidSessionCompleteModal`.
- Global: `#connDot`, `#connLabel`, `#statusDropdown`, `#modalMakeBusy`, `#modalMakeOffline`, `#modalReportProblem`.

Asset load order: original admin/vendor → `global_custom.*` → `agent_chat_custom.*` → `agent_chat_paid_session.*`.

## Paid-session implementation contract

### States

```text
no_consent -> offer_pending -> ready -> connecting -> active
active -> paused -> connecting -> active
active -> reconnecting -> active | completed
active | paused -> completed
```

`billing_mode=none|trial|paid` независим от `status`.

### Invariants

- offer не начинается без consent flow;
- consent не списывает credits;
- connecting бесплатен;
- billing начинается только после readiness обеих сторон;
- pause/complete не запускают следующую минуту;
- top-up никогда не resume автоматически;
- duplicate click не создаёт второй offer/session/debit;
- вся мутация несёт `expected_version` и свежий `idempotency_key`;
- `409` с canonical session применяется без blind retry;
- каждый success/error при наличии snapshot возвращает полный canonical `session`;
- server timer и billing truth не подменяются локальными часами.

### Action payload baseline

Каждый action получает `conversation_id`, `session_id`, `consent_id`, `operator_id`, `expected_version`, `idempotency_key`. Offer добавляет service/template/version; pause — client template, mandatory internal reason и optional private comment; complete — mandatory reason и optional client message.

### Atomicity

- offer + client-visible message — одна transaction;
- pause + client-visible message + private internal comment + timeline event — одна transaction;
- остальные state/billing transitions — database transaction;
- realtime публикует canonical state/event после commit.

### Realtime

События: `agentpaid:state-changed`, `agentpaid:layout-changed`, `agentpaid:offer-created`, `agentpaid:pause-created`, `agentpaid:timeline-event`, `agentpaid:topup-requested`, обычные conversation message events. Dedupe по stable message/event id. При reconnect: auth/scope check → resume cursor или snapshot reconciliation → live deltas.

## Message/data contract

Каждое сообщение имеет stable id, author, text flag, language и attachment kind/count. Server отдаёт safe moderated text; raw forbidden fragments в browser не попадают. Full-censored message не даёт Reply/Copy/Translate. Operator edit/delete возможны только для собственных сообщений, пока клиент их не прочитал; soft delete сохраняет placeholder, hard delete ограничен billing offer-card.

Composer modes `direct|reply|edit` взаимоисключающие. Draft key/payload изолирован по `conversation_id`; local recovery примерно `400 ms`, server snapshot примерно `10 s`, switch forces flush. Send safety `locked|unlocking|ready` — отдельная ось, не смешивать с mode.

`messages_html` — текущий production renderer contract. Structured JSON message renderer нельзя включать без отдельного adapter, который докажет parity.

## Queue/context contract

Queue filters — пять независимых zones, одна active zone за запрос. Backend возвращает server-rendered `html` либо DTO, но DTO проходит нормализацию в существующий queue path. Conversation response применяет `conversation`, `messages_html`, `context_json`, `pinned_messages`; поздний ответ старого conversation отбрасывается.

`context_json.apply_sections` разрешает обновлять только названные sections. `quality.send_guard` имеет только server-authored режимы `allow|confirm|block`; client не вычисляет policy по тексту.

## Error contract

Ошибки имеют stable `code`, safe `message`, HTTP meaning и, если применимо, field errors/session snapshot:

- `401` — re-auth;
- `403` — permission denied;
- `404` — object absent/hidden;
- `409` — stale version/concurrent/idempotency conflict;
- `410` — expired offer;
- `422` — semantic/field validation;
- `429` — rate limit;
- `503` — connection/billing provider unavailable.

Validation paid-session modal оставляет открытой, ставит `aria-invalid`, field-level alert и фокусирует первое невалидное поле. Не ветвиться по локализованному тексту ошибки.

## Definition of done интеграции

1. PHP view/partials сохраняют существующий admin chrome и все перечисленные DOM hooks.
2. Config JSON server-generated; demo fixtures/CSRF/sample ids не попали в production.
3. Все endpoint groups из control matrix имеют RBAC, CSRF, validation, transaction, idempotency, optimistic version и audit.
4. Положительный UI flow имеет server/data post-condition.
5. Негативные проверки доказали 401/403/409/422/expired/insufficient/offline paths.
6. Realtime доставляет state/message/timeline без дублей и умеет reconciliation после reconnect.
7. Paid flow доказан: offer → consent → connecting (без списания) → active (billing) → pause/resume → complete, включая отсутствие следующей минуты.
8. Composer/message flow доказан на обеих сторонах, включая safe censorship, read-gated edit/delete, retry и drafts.
9. Responsive/a11y проверены на mobile/intermediate widths, keyboard/focus, reduced motion и 200% zoom.
10. Запущены repeatable contract checks и сохранены before/after screenshots, logs и rollback note.

## Порядок реализации через Codex

Работу вести вертикальными срезами, не раскомментировать все `fetch()` одновременно:

### Шаг 0. Baseline и безопасность

- зафиксировать commit/build marker, PHP/Yii2 environment, текущий route и активный permissions fixture;
- подтвердить checksum архива и отсутствие demo CSRF/sample credentials в передаваемой копии;
- поднять локальный preview только для чтения и записать baseline screenshot/console/network evidence.

### Шаг 1. Yii2 shell и assets

- встроить `chat-stage1.html` в существующий admin view/partials, сохранив внешний header/sidebar/footer;
- зарегистрировать assets в порядке `original/vendor → global_custom → agent_chat_custom → agent_chat_paid_session`;
- оставить все hooks/ids/data-атрибуты; не переносить Angular/demo-обвязку как источник business logic;
- сформировать server-generated `adminAgentChatConfig` и `paidSessionConfig` без demo values.

### Шаг 2. Read-only transport

- подключить `GET` очереди, conversation, messages, `context_json`, pins и operator/network snapshot;
- доказать правильное переключение conversation и отбрасывание позднего ответа старого диалога;
- на этом шаге не включать state-changing controls.

### Шаг 3. Message core

- подключить direct/reply send, delivery/read, retry, drafts, edit/pin и realtime dedup;
- использовать server `message_html`, canonical IDs/timestamps и стандартный `{ok,code,message,request_id}` envelope;
- подключить censorship и safe recipient payload до включения production-send;
- проверять assigned-Agent/client/super-admin visibility и 403 direct-URL cases.

### Шаг 4. Attachments и policy

- реализовать только approved image/document pre-upload → scan → `attachment_ids[]` → message;
- forged audio/voice/video/arbitrary/MIME-bypass запросы должны получать stable `422 ATTACHMENT_TYPE_FORBIDDEN` без asset/message/billing side effect;
- размеры, MIME и число вложений читать из owner admin routes, не дублировать `/settings/photo`.

### Шаг 5. Role, audit и context actions

- server-side ACL, actual actor/role, assignment guard, private Notes, safe Copy history, moderation/audit;
- AI summary/draft, Follow, Assign, Resolve, package action, preferences и shortcuts подключать только по `EXTENDED_PRODUCTION_SURFACES-RU.md`, по одному endpoint group с отдельным readback/rollback;
- не создавать новую роль и не дублировать `/ru/admin/settings/role`.

### Шаг 6. Paid-session vertical

- сначала получить от G1.3/G2.1/G2.2 authoritative session/price/balance contracts и admin settings readback;
- затем подключить `state → offer → client consent → connecting → trial/paid → pause/resume → complete`;
- `connecting` не списывает; списание начинается только после server paid transition; pause/reconnect не начинают следующую минуту; top-up не делает auto-resume;
- каждую мутацию выполнять с `expected_version` и новой `idempotency_key`; `409` применять как свежий snapshot, без blind retry;
- offer/pause client message и internal timeline/audit публиковать только после commit, через realtime с dedup.

### Шаг 7. Full negative/runtime QA

- 401/403/404/409/410/422/429/503;
- duplicate click/retry, concurrent start, stale version, reconnect timeout 60 s, connection timeout 3 min, one pause 5 min, zero balance и no-next-minute;
- censorship в обе стороны, read-gated edit, forbidden attachment, private-note leak, wrong-conversation response, client-safe vs super-admin audit;
- persisted admin readback, ledger/audit/realtime evidence, rollback и clean fixture.

### Шаг 8. Приёмка

Игорь отдаёт build marker, список изменённых routes/files, migration notes, endpoint matrix, screenshots, logs, positive/negative evidence, rollback note и список residuals. PM/QA принимают только после server/data post-condition; demo screenshot или отсутствие console errors сами по себе не являются PASS.

## Explicit backend work surfaces from accepted handoff

До production transport требуется реализовать semantics для attachment upload, запрещённых voice/audio, AI refresh/insert, Notes, Follow, Assign, Note, Resolve, package action, preference persistence и keyboard shortcuts. Их UI уже считается утверждённым; точные контракты находятся в `EXTENDED_PRODUCTION_SURFACES-RU.md`. Поверхность не считается готовой из-за работы в `transport=demo`: требуется server-side positive/negative test, persisted readback, idempotency, audit и proof видимости для client/assigned Agent/super-admin.

## Запрещённый короткий путь

Не считать достаточными: наличие кнопки, static HTML, demo `200`, локальный timer, screenshot без server state, отсутствие console error или один happy-path. Приёмка должна связать `user action → transport → authoritative state/data → realtime/UI outcome → negative proof`.
