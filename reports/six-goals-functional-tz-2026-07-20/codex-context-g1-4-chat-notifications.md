# Технический контекст G1.4 для Codex Игоря: уведомления консультации

Этот файл передается Codex Игоря вместе с продуктовым ТЗ `etalon-tz-g1-4-chat-notifications.md`. Продуктовое ТЗ является источником истины о желаемом поведении. Этот документ дает техническую картину, границы владения, известные исходники, invariants и proof contract, но не заменяет инженерное исследование текущего проекта.

## 1. Паспорт задачи

### Назначение

Достроить существующий Yii2 notification contour до полного G1.4: in-app, chat badges, email fallback, user preferences, admin rules, delivery log, deduplication, retries, stale guards и role-safe content.

### Целевые роли

- client;
- public Expert profile;
- actual Agent;
- super-admin;
- Moderator/Support только через G4.4 boundary.

### Статус на входе

- spec: `spec_handoff_ready`;
- current source: `code_present_unmapped`;
- runtime: `not_verified`;
- public/live UI: существующий notification center/settings/email templates подтверждены, полный G1.4 не подтвержден.

## 2. Краткий контекст

В проекте уже есть notification manager, in-app records, категории, пользовательские email preferences, notification center, очередь email и отдельная система Email Templates. В локальном source также есть bounded consultation-message notification slice.

Этот slice подтверждает полезные integration points, но не доказывает:

- весь каталог G1.4;
- admin rule page;
- required/optional channel policy;
- offline/unread delays;
- quiet hours;
- delivery log и 90-day retention;
- critical super-admin escalation;
- stale-action guards для всех событий;
- runtime acceptance.

Не объявлять G1.4 implemented без mapped build и positive/negative runtime proof.

## 3. Результат

После реализации один canonical consultation-related business event должен:

1. быть зафиксирован владельцем бизнес-процесса;
2. определить разрешенного получателя;
3. получить snapshot действующего notification rule;
4. создать обязательную in-app запись;
5. при необходимости запланировать email;
6. безопасно повторяться без дублей;
7. открывать актуальный объект с повторной ACL-проверкой;
8. сохранить delivery metadata;
9. не менять исходный business state при delivery failure.

## 4. Источник правды и приоритеты

При конфликте:

1. текущие owner decisions и продуктовое ТЗ G1.4;
2. G1.1/G1.2/G1.3 и ownership map;
3. текущая живая карта админки;
4. current mapped runtime source;
5. локальные preview/code slices;
6. исторические и competitor материалы.

Reference-практики не являются утвержденной Nebula policy.

## 5. Scope

### Входит

- consultation notification event contract;
- recipient resolution;
- in-app record и category «Консультации»;
- reuse chat unread/badges;
- email fallback;
- user optional email preferences;
- admin notification rules;
- priority, channels, delay, quiet hours;
- idempotency/dedup;
- retry and delivery state;
- stale link/action guard;
- safe content;
- super-admin critical failure signal;
- delivery log, 90-day managed retention;
- RU/EN translation keys.

### Не входит

- lifecycle ownership G1.3;
- billing/refund/coupon execution G2;
- Support workflow and notifications G4.4;
- analytics event ownership G5.1;
- team/Telegram notifications G6.5;
- role assignment and permissions editor;
- browser push in MVP;
- email copy ownership;
- full transcript export;
- redesign of `/ru/messages`.

### Зависимости

- `etalon-tz-g1-1-service-session.md`;
- `etalon-tz-g1-2-role-chat.md`;
- `etalon-tz-g1-3-status-history.md`;
- `product-architecture-g1-g6-ownership-map.md`;
- existing Email Templates package;
- current notification center/settings/chat indicators;
- current role/permission system.

## 6. Current source navigation

Primary local application root:

`H:\GPT-Codex\Confideline\Chat\youdate-2.0.2-yii2\Source\youdate_extracted\application`

Known current integration points:

- `managers/NotificationManager.php` — categories, in-app query, mark viewed, email settings;
- `models/Notification.php` and query — persisted notification record/read state;
- `controllers/NotificationsController.php` — notification center and mark viewed;
- `controllers/SettingsController.php` — user notification settings action;
- `notifications/BaseNotification.php`;
- `notifications/BaseNotificationCategory.php`;
- `jobs/SendNotification.php`;
- `views/notifications/*`;
- `views/settings/notifications.php`;
- `modules/admin/controllers/EmailTemplateController.php` and related views;
- `modules/admin/views/layouts/_menu.php`;
- `config/core.php`.

Local consultation slice:

- `notifications/ConsultationMessageAttentionCategory.php`;
- `notifications/ConsultationMessageAttentionNotification.php`;
- `services/ConsultationNotificationService.php`.

Observed properties of the slice:

- category id `consultations`;
- source message/session deep link;
- recipient resolution client/Expert;
- internal note rejection;
- read-policy check;
- source-message duplicate check;
- in-app record plus queued notification job.

Treat these files as `code_present_unmapped`: verify whether they are tracked, migrated, registered and executed in the actual target build.

## 7. Canonical event envelope

Each G1.4 input needs a stable logical envelope sufficient to recover:

- unique business event id;
- stable event key;
- event version;
- occurred-at server time;
- owner module;
- actor id and role where allowed;
- intended recipient subject;
- dialog/request/service_session reference as applicable;
- public Expert profile reference where applicable;
- safe payload fields;
- source business result status;
- correlation/idempotency key;
- locale/timezone context;
- sensitivity class.

Do not put raw transcript, prohibited content, contacts or payment secrets into the generic event payload.

## 8. Rule snapshot

Delivery uses a snapshot of the effective admin rule:

- rule id/key;
- rule version;
- enabled state;
- priority;
- required/optional status;
- recipient policy;
- channels;
- delays;
- quiet-hour behavior;
- retry policy;
- email-template event key;
- retention value.

Changing the admin rule affects new event processing. Existing notification/delivery history retains the applied version.

## 9. Recipient resolution and ACL

Recipient resolution must be server authoritative.

Invariants:

1. client notification belongs to the session/request/dialog client;
2. Agent notification follows authoritative assignment and G1.2 ACL;
3. public Expert name does not expose actual Agent;
4. internal note never targets client;
5. Support author is public «Поддержка Nebula»;
6. opening the notification repeats authorization against current access;
7. old notification does not grant access after reassignment/revocation;
8. URL parameters never become recipient truth;
9. bulk send cannot mix recipients or cross-pollinate payload;
10. super-admin critical signal contains metadata, not restricted content.

## 10. Event groups and stable keys

Exact naming may adapt to project conventions, but keys must be stable and documented.

### Messages

- `consultation.free_message.created`;
- `consultation.active_message.created`;
- `consultation.request.clarification_created`;
- `consultation.message.unread_threshold_reached`;
- `consultation.message.delivery_failed`.

### Requests

- `consultation.request.created`;
- `consultation.proposal.created`;
- `consultation.request.accepted`;
- `consultation.request.declined`;
- `consultation.request.cancelled`;
- `consultation.request.expired`;
- `consultation.request.awaiting_client`;
- `consultation.request.awaiting_expert`.

### Connection

- `consultation.connecting.started`;
- `consultation.connecting.ready`;
- `consultation.expert.unavailable`;
- `consultation.expert.available`;
- `consultation.client.disconnected`;
- `consultation.agent.disconnected`;
- `consultation.client.reconnected`;
- `consultation.agent.reconnected`;
- `consultation.reconnect.timeout`.

### Trial, paid and credits

- `consultation.trial.started`;
- `consultation.trial.ending`;
- `consultation.paid.started`;
- `consultation.balance.low`;
- `consultation.balance.zero`;
- `consultation.balance_pause.started`;
- `consultation.topup.succeeded`;
- `consultation.topup.failed`;
- `consultation.resumed`.

### Completion

- `consultation.completed`;
- `consultation.history.available`;
- `consultation.rating.requested`;
- `consultation.action.stale`.

### Technical and compensation

- `consultation.delivery.critical_failure`;
- `consultation.technical_end`;
- `consultation.sla.breached`;
- `consultation.linked_incident.created`;
- `consultation.compensation.review`;
- `consultation.compensation.granted`.

G4.4/G6.5 may consume shared source facts, but their workflow keys and recipients remain separate.

## 11. Commit and delivery boundary

Required ordering:

1. business owner commits canonical result;
2. notification event becomes eligible for delivery;
3. notification processing creates/updates delivery records;
4. channel adapters attempt delivery.

Prohibited:

- send success before business commit;
- rollback business result because email failed;
- emit granted compensation before credit/coupon commit;
- create a second request/session/debit from notification retry.

Use a durable post-commit/outbox-equivalent boundary suitable for the codebase. The exact implementation is Igor's decision; acceptance is based on the invariants.

## 12. In-app and chat badges

### In-app

- one persisted notification per recipient/event/rule variant;
- category `consultations`;
- read/unread;
- newest-first;
- safe render;
- current deep link;
- mark viewed must be recipient-scoped.

### Chat badges

- reuse existing message unread truth;
- do not increment twice because both message and notification exist;
- per-dialog badge and global badge reconcile after read;
- consultation deep link can focus the related session without creating a second dialog.

## 13. Email integration boundary

G1.4 provides:

- event key;
- recipient;
- required/optional classification;
- safe variables;
- send time;
- deep link;
- delivery state.

Email Templates provides:

- subject;
- body;
- translations;
- macro rendering;
- layout.

Required:

- admin rule chooses an existing compatible template;
- missing/disabled template produces a delivery error, not malformed mail;
- only allowlisted safe variables are passed;
- content is RU/EN via existing translation/template mechanisms;
- template editing does not alter event priority, recipient or channel policy.

Relevant existing packages:

- `H:\GPT-Codex\Confideline\email_templates\NEBULA_EMAIL_IMPLEMENTATION_HANDOFF_RU_2026-05-25.md`;
- `H:\GPT-Codex\Confideline\email_templates\nebula-admin-upload-ready-ru-2026-05-25\EMAIL_NOTIFICATION_LOGIC_RU.md`;
- `H:\GPT-Codex\Confideline\email_templates\nebula-admin-upload-ready-ru-2026-05-25\INTEGRATION_STATUS_RU.md`.

## 14. Presence, delay and quiet hours

Starting managed values:

- important unread email delay: 5 minutes;
- confirmed critical delivery failure delay: 1 minute;
- noncritical quiet hours: 22:00–08:00 recipient local time;
- delivery log retention: 90 days.

Presence must not rely solely on an old session flag. The accepted observable behavior:

- if user is active and views the event before delay, optional fallback email is not needed;
- if the event stays unseen, email is sent once;
- critical email ignores quiet hours;
- timezone change applies to new scheduling decisions;
- existing pending delivery retains applied rule snapshot unless explicitly cancelled by a safe current-state guard.

## 15. Idempotency, ordering and stale guards

Recommended logical dedup identity:

`business_event_id + recipient_id + channel + rule_version`

Required behavior:

- retry returns/updates same logical delivery;
- concurrent workers cannot create duplicate user-visible notifications;
- delivery attempts are append-only or otherwise auditable;
- later lifecycle state suppresses obsolete action;
- click handler validates current state and ACL;
- old notification may remain as history but cannot re-run the action;
- notification ordering uses occurred-at plus stable ordering, not client clock.

## 16. Delivery states and retry

The implementation must distinguish at least:

- pending;
- scheduled;
- suppressed because viewed/disabled/quiet-hours rule;
- processing;
- delivered/accepted by channel;
- failed retryable;
- failed terminal;
- stale/cancelled safely.

Do not equate queued with delivered.

Retry policy is admin-managed. A confirmed critical terminal failure creates one super-admin incident/signal. Optional email failure with an intact in-app record does not automatically become a critical incident.

## 17. Admin surface

Add to «Общие настройки»:

- label: «Настройки уведомлений»;
- recommended route: `/ru/admin/notification-rule/index`;
- position: adjacent to `/ru/admin/email-template/index`.

Required screens:

1. rule list with search/filters;
2. rule edit/create within allowed catalog;
3. version/audit/readback;
4. rollback;
5. delivery log;
6. critical failure detail;
7. safe confirmation for disabling/degrading critical behavior.

Initial access is super-admin. Reuse existing permissions mechanism; do not add chat-role assignment to this page.

## 18. User settings

Extend `/ru/settings/notifications`:

- free-dialog message email;
- consultation message email;
- unread reminder email;
- rating request email;
- other optional consultation email categories.

Mandatory in-app and critical email are read-only/explained, not toggleable.

Settings changes affect future scheduling. If an optional email is pending and the user disables it before send, apply a defined safe suppression rule and record why it was suppressed.

## 19. Delivery log and privacy

Delivery metadata:

- event key/id;
- rule id/version;
- recipient id/role;
- channel;
- scheduled/attempted/delivered timestamps;
- attempt count;
- safe error category;
- dialog/request/session reference;
- template key/version where applicable;
- critical incident reference.

Do not store:

- full transcript;
- prohibited original content;
- contact/payment data;
- secrets;
- rendered email body when not required for legal/audit purpose.

Retention default 90 days, admin-managed, pending legal/privacy review. Retention cleanup must preserve required business/audit records owned by other modules.

## 20. Failure and concurrency scenarios

### F1. Duplicate event

Same business event received twice -> one notification and one logical delivery per channel.

### F2. Concurrent workers

Two workers process same target -> one visible result; attempts auditable.

### F3. In-app success, email failure

Business state and in-app stay valid; email retries; no duplicate in-app.

### F4. Recipient loses access

Before send/open -> no restricted content; link returns safe forbidden/current-state response.

### F5. Rule changes while pending

Pending item keeps applied snapshot or follows an explicitly documented safe cancellation rule; no silent mixed configuration.

### F6. Template missing

Email fails safely with metadata; no empty/unsafe message; in-app remains.

### F7. Viewed before fallback

Optional email is suppressed once, with reason.

### F8. Stale request action

Old accept/proposal link opens current state and performs no transition.

### F9. Compensation race

Review event and grant event arrive close together -> user never sees grant before commit; later grant supersedes review.

### F10. Critical failure race

Several terminal attempts -> one super-admin signal.

### F11. Censored content

Notification/email contains only safe generic text; original fragment never leaks.

### F12. Late delivery

Session completed before notification opens -> link goes to history/current state.

## 21. Acceptance matrix

1. Given a free message, when recipient is authorized, then one chat badge and one safe notification appear.
2. Given an active consultation message, when unread for 5 minutes, then one optional email is sent if enabled.
3. Given event viewed before 5 minutes, then optional email is suppressed.
4. Given paid started, when user is in quiet hours, then critical notification is not delayed.
5. Given duplicate event, when processed concurrently, then one visible result exists.
6. Given internal note, when notification pipeline runs, then client receives nothing.
7. Given censored message, then no original prohibited content appears in any delivery.
8. Given changed assignment, then unauthorized Agent cannot receive/open old target.
9. Given stale request link, then no accept/session/debit is repeated.
10. Given top-up failed, then no success text is sent.
11. Given coupon review, then no granted compensation claim is sent.
12. Given coupon committed, then one granted notification is sent.
13. Given email template missing, then in-app survives and failure is logged.
14. Given critical delivery terminal failure, after 1 minute one super-admin signal exists.
15. Given optional email failure, then no critical signal is created solely for it.
16. Given rule version change, then historical record retains applied version.
17. Given user preference off, then optional email is not sent.
18. Given critical preference, then user cannot disable mandatory channel.
19. Given delivery log, then super-admin can filter and read safe metadata.
20. Given retention cleanup at 90 days, then only G1.4 delivery metadata expires according to policy.
21. Given RU/EN locale, then correct translation/template is used.
22. Given notification click, then server repeats recipient ACL and current-state validation.
23. Given G4/G6 event, then G1.4 does not take ownership of support/team workflow.
24. Given channel failure, then consultation/payment lifecycle is unchanged.

## 22. Implementation handoff

Before code:

- map current tracked source and migrations;
- confirm target branch/build;
- map notification/email/settings/admin routes;
- list existing models/tables/jobs relevant to reuse;
- flag conflicts with the product spec;
- produce event-to-recipient-to-channel matrix;
- define rollback and migration safety.

After code:

- build/commit reference;
- changed-files map;
- migration and rollback proof;
- unit/integration/UI proof;
- positive/negative/concurrency/privacy results;
- admin readback/version/rollback proof;
- delivery log/retention proof;
- live/staging runtime evidence;
- known residuals.

## 23. Definition of Done

G1.4 implementation may be accepted only when:

- all required event groups are mapped to actual code;
- recipient ACL passes positive and negative tests;
- dedup/concurrency tests pass;
- chat badges and notification center reconcile;
- optional/mandatory email settings behave as specified;
- Email Templates integration is proven;
- admin rules, versions, audit and rollback are proven;
- delay, quiet hours and retention are proven;
- stale actions and safe content are proven;
- delivery failures do not mutate business state;
- build/commit and runtime target are identified;
- PM separately accepts the user-visible result.

## 24. Proof boundary

The following are not runtime proof:

- this Markdown;
- generated HTML/DOCX;
- static mockup;
- presence of local PHP files;
- model review;
- passing text verifier.

They prove only specification/handoff completeness.

Current truthful closeout until implementation evidence exists:

- specification: ready;
- code: present in bounded slices, unmapped;
- runtime: open;
- production: not accepted.

## 25. Knowledge basis and source class

- Owner decisions in the current G1 review: `owner decision`.
- Live admin/notification/settings observations: `current UI evidence`.
- Local Yii2 notification files: `current local source, runtime unmapped`.
- Email template handoff package: `separate implementation dependency`.
- G1.1/G1.2/G1.3 and ownership map: `canonical PM boundary`.
- AskNebula training references: `observed reference behavior`, not accepted Nebula policy.

Safety and privacy:

- no raw transcript or real client data enters fixtures/public proofs;
- notification content uses abstract/anonymized data;
- legal/privacy review remains a release gate for retention and mandatory communications.

## 26. Самооценка

| Критерий | Балл |
|---|---:|
| Q1 Цель и измеримый результат | 5/5 |
| Q2 Scope, non-goals, dependencies | 8/8 |
| Q3 Роли и ACL | 10/10 |
| Q4 Triggers и preconditions | 7/7 |
| Q5 Event/delivery states и invariants | 12/12 |
| Q6 Основные сценарии | 12/12 |
| Q7 Negative/retry/concurrency/privacy | 12/12 |
| Q8 Data, audit, retention | 8/8 |
| Q9 Поверхности и admin ownership | 6/6 |
| Q10 Acceptance matrix | 12/12 |
| Q11 Programmer handoff | 5/5 |
| Q12 DoD и proof boundary | 3/3 |
| **Итого** | **100/100** |

Служебные сведения: G1.4, версия 1.0, дата 2026-07-28, статус `technical_handoff_ready_runtime_open`.
