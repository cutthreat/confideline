# Аудит первичных backend-источников для BadgeResolver

**Дата аудита:** 2026-08-06  
**Проект:** Confideline / Nebula  
**Назначение:** передача Игорю и его Codex перед подключением серверного BadgeResolver.

## 1. Итог

В локальном снимке Yii2 найдена **частичная заготовка service-session и платёжного контура**, но не полный runtime-контур, описанный в Badge Contract.

| Блок | Фактический результат аудита | Статус для BadgeResolver |
|---|---|---|
| G1.3 lifecycle | `service_session`, lifecycle events, runtime events, pricing gate, pause-low-balance и refund case существуют | `IMPLEMENTED_SCAFFOLD`, runtime не подтверждён |
| G2 payments | legacy `order` + `balance` + Stripe/PayPal/Robokassa + manual bonus существуют | `IMPLEMENTED_LEGACY/PARTIAL`, нет payment-attempt, session-link, trial/coupon |
| G4 Risk/Safe/Skeptic | есть общий `report`, `ban` и refund/dispute; специализированных risk/safety/skeptic источников нет | `MISSING` |
| G6 assignment/SLA/quality | есть admin roles/permissions и аналитическое чтение `chief_under`; enforcement, assignment history, SLA/quality incident нет | `MISSING/PARTIAL` |
| Pings/Leads | модель, миграция, сервис, endpoint и conversion event не найдены | `MISSING` |
| BadgeResolver/realtime | отдельный resolver, badge read-model, event bus/realtime payload не найдены | `MISSING` |

**Вывод:** по найденным источникам нельзя безопасно вычислять все 19 badge-кодов. Нельзя подменять отсутствующие authoritative sources догадками или чтением текста/подписи бейджа.

## 2. Правила чтения отчёта

- `IMPLEMENTED_SCAFFOLD` — исходники и схема присутствуют, но это не доказательство выката и работы на production.
- `IMPLEMENTED_LEGACY/PARTIAL` — есть старый общий механизм, но он не удовлетворяет session-scoped контракту.
- `MISSING` — в проверенном backend-снимке нет модели, миграции, сервиса или endpoint с таким смыслом.
- `CONTRADICTS_CONTRACT` — найденное поведение расходится с каноническим Badge Contract или G1.3.
- `UNVERIFIED_RUNTIME` — нужны runtime/DB/readback-проверки; локальный файл сам по себе их не заменяет.

Аудит read-only. Новая архитектура и новые таблицы в этом отчёте не предлагаются.

## 3. Канонические нормативные файлы

| Назначение | Точный локальный путь | Git-статус / ссылка |
|---|---|---|
| Бизнес-правила 19 бейджей | `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\codex-context-badge-resolver-ru.md` | локальный canonical; на текущем remote branch отсутствует (untracked) |
| UI-контракт очереди | `H:\GPT-Codex\Confideline\$review\CHAT_QUEUE_CONTRACT.md` | локальный review-файл; на remote branch отсутствует |
| Paid-session contract | `H:\GPT-Codex\Confideline\$review\PAID_SESSION_CONTRACT.md` | локальный review-файл; на remote branch отсутствует |
| G1.3 status/history | `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\etalon-tz-g1-3-status-history.md` | tracked; [GitHub-файл](https://github.com/cutthreat/confideline/blob/codex/geo-country-simplified-width-2026-06-11/reports/six-goals-functional-tz-2026-07-20/etalon-tz-g1-3-status-history.md) |
| G1.2 role-based chat | `H:\GPT-Codex\Confideline\reports\tz-product-g1-2-role-chat-consultation-2026-07-16.md` | локальный product TZ; runtime-источником не является |
| G2 billing/refund | `H:\GPT-Codex\Confideline\reports\tz-product-g2-billing-truth-2026-07-16.md` | локальный product TZ; runtime-источником не является |
| G4.3 safety/policy | `H:\GPT-Codex\Confideline\reports\tz-product-g4-3-rules-trust-safety-2026-07-16.md` | локальный product TZ; финальные legal words отдельно не подтверждены |
| G6.3 quality | `H:\GPT-Codex\Confideline\reports\tz-product-g6-3-quality-control-2026-07-16.md` | локальный product TZ; implementation не найден |

Хэш главного Badge Contract на момент аудита: `SHA-256 8AB7F395B141DFF1E696EFA8338327C520DAA0D7F77CB22A7476EF4D6DED50F8`.

## 4. G1.3 — lifecycle consultation/session

### 4.1 Реальные модели и таблицы

| Источник | Таблица | Поля, видимые в модели/миграции | Кто пишет/изменяет | События/переходы | Статус |
|---|---|---|---|---|---|
| `application/models/ServiceSession.php:54-62` | `{{%service_session}}` | `id`, `public_session_ref`, `client_user_id`, `expert_user_id`, `entry_mode`, `question_text`, `pricing_mode`, `offer_ref`, `offer_snapshot_json`, `customer_visible_price_copy`, `allowance_rule_json`, `trial_or_bonus_rule_json`, `continuation_rule_json`, `session_start_allowed`, `pricing_bound_at`, `pricing_bound_by`, `billing_started_at`, `warning_emitted_at`, `hard_stop_reason`, `remaining_allowance_snapshot`, `total_amount_billed`, `total_minutes_billed`, `last_billed_at`, `status`, message refs, `started_at`, `ended_at`, timestamps | AR + сервисы ниже; фактическая DB запись не проверена | статусы `draft`, `ready_to_start`, `active`, `ended`, `paused_low_balance`, `disputed`, `refunded` | `IMPLEMENTED_SCAFFOLD`, `CONTRADICTS_CONTRACT` |
| `application/models/ServiceSessionEvent.php:10-29` | `{{%service_session_event}}` | `session_id`, `from_status`, `to_status`, `event_name`, `actor_type`, `reason_code`, `payload_json`, `occurred_at`, `created_at`; actors `system/client/expert/admin/support` | `ServiceSessionStateMachine::apply()` | lifecycle audit event | `IMPLEMENTED_SCAFFOLD` |
| `application/models/ServiceSessionRuntimeEvent.php:10-30` | `{{%service_session_runtime_event}}` | `session_id`, `event_name`, `amount_delta`, `minutes_delta`, `remaining_allowance_after`, `payload_json`, `occurred_at`, `created_at` | `ServiceSessionRuntimeMeter` | `billing_started`, `usage_debited`, `warning_threshold_reached`, `allowance_exhausted`, `continuation_rejected`, `continuation_confirmed`, `billing_finalized` | `IMPLEMENTED_SCAFFOLD` |
| `application/models/ServiceSessionLedgerEntry.php:10-37` | `{{%service_session_ledger_entry}}` | charge/adjustment/refund entry, amount, currency, status, reason, operator note, payload, balance transaction ref | `ServiceSessionRefundLedger` | `recorded`, `approved`, `rejected` | `IMPLEMENTED_SCAFFOLD` |
| `application/models/ServiceSessionRefundCase.php:10-36` | `{{%service_session_refund_case}}` | `session_id`, opened-by, issue reason, billing snapshot, decision status/note, resolved and audit timestamps | `ServiceSessionRefundLedger` | `open`, `approved`, `rejected`, `resolved_without_refund` | `IMPLEMENTED_SCAFFOLD`; это refund/dispute, не Risk/Safe |

Миграции:

- `application/migrations/m260615_163000_service_session.php` — базовая таблица и client/expert/message FK.
- `application/migrations/m260615_181500_service_session_state_machine.php` — status projection + `service_session_event`.
- `application/migrations/m260615_210000_service_session_pricing_gate.php` — offer/price/allowance/trial/continuation JSON и pricing bind.
- `application/migrations/m260615_230000_service_session_runtime_meter.php` — billing projection + `service_session_runtime_event`.
- `application/migrations/m260615_235000_service_session_refund_ledger.php` — ledger и refund case.
- `application/migrations/m260615_170000_message_consultation_contract.php` — привязка сообщения к `service_session_id` и role/scope/kind.

### 4.2 Фактическая state machine

`application/services/ServiceSessionStateMachine.php:10-32` поддерживает только:

| Из | Событие | В | Guard |
|---|---|---|---|
| `draft` | `session_created` | `ready_to_start` | client, expert и question обязательны |
| `ready_to_start` | `consultation_started` | `active` | требуется pricing-gate truth |
| `active` | `consultation_completed` | `ended` | обязательна `reason_code` |
| `active` | `hard_stop_by_allowance` | `paused_low_balance` | обязательна `reason_code` |
| `paused_low_balance` | `continue_confirmed` | `active` | continuation + allowance |
| `ended` | `client_dispute_opened` | `disputed` | обязательна причина |
| `disputed` | `refund_approved` | `refunded` | explicit support approval |
| `disputed` | `dispute_rejected_or_resolved` | `ended` | explicit resolved |

`ServiceSessionRuntimeMeter` запускает расход только при `status=active`, принимает minute/amount deltas из caller context и переводит hard stop в `paused_low_balance`. Новой минуты, timer loop или reconnect manager в исходниках не найдено.

### 4.3 Несоответствия G1.3/Badge Contract

1. Нет `request` сущности и request lifecycle: `awaiting_expert`, `awaiting_client`, `accepted`, `declined`, `cancelled`, `expired`.
2. Нет отдельного `consent`/client-confirmed snapshot и нет guard, который запрещает `consultation_started` без explicit client consent. Сейчас guard проверяет только pricing truth.
3. Нет состояний `connecting`, `paused`, `reconnecting`, `completed`; используются другие значения `ready_to_start`, `active`, `paused_low_balance`, `ended`.
4. Нет отдельного `billing_mode=trial|paid`; `trial_or_bonus_rule_json` — только JSON-снимок. Поэтому `trial_active` и `paid_active` нельзя надёжно различить.
5. Нет operational substate (`waiting_client`, `waiting_expert`, `reconnect_*`) и deadline/applied-settings clock history.
6. Нет `conversation_id`, исходного request id, actual agent id, assignment id, tariff/consent version и immutable attribution.
7. Нет client reconnect/agent reconnect grace и technical-end transition.
8. `active` может ошибочно выглядеть как `Live`, хотя Badge Contract разрешает Live только для active trial/paid.
9. `getSessionByPair()` в `MessageShellService.php:434-444` возвращает только последнюю session по паре client/expert, поэтому история нескольких consultations по одному диалогу не является источником resolver-а.

### 4.4 API и payload

`application/modules/admin/controllers/MessageController.php` предоставляет только:

- `GET /admin/message/conversations` — список диалогов;
- `GET /admin/message/messages` — сообщения с optional `serviceSessionId`;
- `GET /admin/message/session-card` — текущая карточка;
- `GET /admin/message/session-lifecycle` — session + последние 5 lifecycle/runtime events;
- `POST /admin/message/send` — отправка staff message.

`MessageShellService::getSessionLifecycle()` фактически строит также `ledgerEntries` и `refundCase` (`:198-288`), но `MessageController::actionSessionLifecycle()` (`:161-172`) возвращает только `session`, `events`, `runtimeEvents`. Для resolver-а это потеря части финансового readback.

Переходов session, request, consent, reconnect и badge endpoint в контроллере нет.

## 5. G2 — payments, trial, coupons

### 5.1 Что реально существует

| Источник | Таблица/объект | Поля и статусы | Создание/изменение | События | Статус |
|---|---|---|---|---|---|
| `application/models/Order.php:16-41` + `m200511_120000_order.php` | `{{%order}}` | `id`, `guid`, `user_id`, `currency`, `total_price`, `amount` (credits), `status`, `payment_method`, `payment_id`, `data`, timestamps, `callback_at`; statuses `NEW`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`; methods Stripe/PayPal/Robokassa | `application/payments/Checkout.php:137-154` создаёт; provider checkout/validation/webhook обновляет status/id | provider-specific success/cancel/failure | `IMPLEMENTED_LEGACY/PARTIAL` |
| `application/models/Balance.php`, `BalanceTransaction.php` + `m180604_180001_balance.php` | `{{%balance}}`, `{{%balance_transaction}}` | текущий агрегированный balance; transaction `user_id`, `amount`, `data`, `created_at` | `BalanceManager`/`Checkout::successPayment()`; admin `UserController` manual credit | balance increase/decrease | `IMPLEMENTED_LEGACY/PARTIAL` |
| `application/models/Price.php` + `m210117_100000_price.php` | `{{%price}}` | package `credits`, `base_price`, `discount`, timestamps | admin price CRUD; Checkout resolves credits → actual price | package purchase | `IMPLEMENTED_LEGACY` |
| `application/payments/StripeCheckout.php` | provider adapter | order metadata, payment intent id, callback raw/type in order `data` | create session, return validation, webhook | `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled` | `IMPLEMENTED_LEGACY/PARTIAL` |
| `application/payments/PaypalCheckout.php`, `RobokassaCheckout.php` | provider adapters | provider payment id and order status | checkout/success/failure endpoints | provider capture/success/failure/cancel | `IMPLEMENTED_LEGACY/PARTIAL` |
| `application/payments/AdminBonusTransaction.php` + `modules/admin/forms/BalanceUpdateForm.php` | JSON `BalanceTransaction.data` | manual `amount` + free-form `notes`; no entitlement type/expiry | super-admin/admin user balance action | manual credit | `IMPLEMENTED_LEGACY/PARTIAL` |
| `ServiceSession` JSON `trial_or_bonus_rule_json` | no separate table | only applied snapshot field | `ServiceSessionPricingGate::bind()` | no entitlement event | `IMPLEMENTED_SCAFFOLD`, not a trial source |

### 5.2 MISSING для badge PP/Paid/Trial/Coupon/Revive

- `payment_attempt` model/table/migration/service отсутствует. Нет `attempt_status`, `expires_at`, `cancelled_at`, `failed_at`, `succeeded_at`, idempotency key и связи с session.
- `Order` связан только с `user_id`; нет `client_user_id + expert_user_id + consultation_id/service_session_id`. Общая покупка credits не может доказать `Paid` конкретного диалога.
- `callback_at` — время callback, а не TTL payment process; `expires_at` отсутствует.
- Нет `trial_entitlement`/allowance ledger: нет owner, remaining, source, issued/used/expired timestamps и pair/session scope.
- Нет `coupon_request`, compensation request или отдельного coupon grant/expiry read-model. Доступный manual bonus в `BalanceTransaction.data` не должен активировать `Coupon` по контракту.
- Нет `revive_context` с причиной, сроком и связью с client/expert/session/lead.
- `BalanceTransaction` не содержит статуса или источника, а `data` — произвольный JSON; этого недостаточно для строгой идемпотентной Resolver-проекции.

### 5.3 Найденный технический риск платежного адаптера

В `StripeCheckout::handleWebhook()` (`:201-204`) вызывается `findOrder(['order.payment_id' => $paymentIntent->id])`, тогда как `Checkout::findOrder()` ожидает scalar `$paymentId` и сам формирует `where(['payment_method' => ..., 'payment_id' => $paymentId])`. Это нужно отдельно воспроизвести и проверить Игорю; не считать Stripe webhook runtime-доказанным.

## 6. G4/G6 — Risk, Safe, Skeptic, assignment, Reply/Await, SLA/quality

### 6.1 Найденные общие механизмы

| Источник | Фактическое назначение | Поля/переходы | Ограничение |
|---|---|---|---|
| `application/models/Report.php:13-31` + `m180602_200001_report.php` | пользовательский report на пользователя | `from_user_id`, `reported_user_id`, `is_viewed`, `reason`, `description`, `created_at`; причины spam/profile/rude/fake/scam/other | не связан с message/session/pair, нет resolved/owner/severity/policy snapshot |
| `application/models/Ban.php` + `m200510_200000_ban.php` | IP ban | `ip`, timestamps | не Risk/Safe decision и не pair/session scope |
| `ServiceSessionRefundCase`/`ServiceSessionLedgerEntry` | dispute/refund | open/approved/rejected/resolved_without_refund | это деньги/диспут, не quality incident и не safety decision |
| `application/models/Admin.php:25-50` + `m210117_110000_moderators.php` | admin role and permissions | roles `admin`, `moderator`; permissions string | RBAC есть, но no assignment-scoped ACL or audit of actual agent |
| `application/modules/admin/components/Permission.php:11-24` | coarse permissions | users/groups/messages/photos/orders/pages/help/news/languages/reports/verifications/expertApplications/gifts/bans | нет permissions для risk/safety/quality/assignment/badge override |
| `PartnerInteractionAnalyticsService.php:207-280` | read-only analytics tries dynamic `chief_under` | dynamic table/column discovery (`user_id/chief_id/partner_id` → `under_id/expert_id/questionnaire_id/child_id`) | нет migration/model/history/mutation/ACL; это не доказательство consultation assignment |

### 6.2 Message role/scope — частичная защита, но не assignment enforcement

`application/models/Message.php:38-68` имеет поля `service_session_id`, `consultation_role`, `visibility_scope`, `message_kind` и значения:

- roles: `client`, `expert`, `agent`, `admin`, `system`;
- scopes: `client_thread`, `operator_thread`, `admin_only`;
- kinds: `message`, `internal_note`, `system_reference`.

`ServiceSessionMessagePolicy::canRead()` ограничивает чтение scope по роли. Однако:

1. `MessageController::actionSend()` (`:181-209`) принимает `consultationRole`, `visibilityScope`, `messageKind` из POST и не принимает/проверяет actual-agent или assignment id.
2. `MessageShellService::getSessionByPair()` не проверяет assigned agent.
3. В модели Message нет immutable `actual_agent_id` и `assignment_id_at_send`.
4. Поэтому роль/visibility-поля являются контекстом сообщения, но не являются доказанным server-owned turn ownership.

### 6.3 MISSING для G4/G6 и badge-правил

Не найдены ни по filename, ни по PHP symbols в `application`:

- `risk`/policy incident read-model с severity, pair/session scope, opened/resolved/expired и блокировкой Sell;
- `safety_decision`/Safe с автором, причиной, scope, expiry и audit;
- `skeptic_case` с обязательной причиной, open/resolved/closed и связью с offer;
- quality incident/quality review с scorecard, hard-fail, owner и decision history;
- assignment entity/history, atomic reassignment, assigned-only read/send negative ACL;
- SLA clock/deadline/shift/exclusion/escalation model;
- `outstanding_action`, turn ownership или authoritative Reply/Await;
- manual badge override audit (и по контракту прямой badge override запрещён).

Следовательно, `Risk`, `Safe`, `Skeptic`, `Reply`, `Await` и `Sell` нельзя вычислять из найденных текущих таблиц без недоказанных предположений.

Создание/изменение найденного общего report подтверждается `application/controllers/ReportController.php:44-55` (пользователь создаёт запись), а просмотр/удаление — `application/modules/admin/controllers/ReportController.php:64-99`. `BanController.php:39-101` управляет IP-ban. Это существующие moderation surfaces, но они не являются source-ами Badge Contract.

В исходнике нет отдельной роли `super-admin`: `application/models/Admin.php:25-26` объявляет только `admin` и `moderator`, а `MessageController` допускает эти две роли (`:44-50`). Поэтому обозначение `super-admin` в product-документах сейчас является организационным уровнем доступа, а не отдельным backend role/permission source.

## 7. Pings / Leads

В проверенном backend-снимке отсутствуют:

- `Ping`/`Lead` model и table;
- migration, query, service, controller и endpoint для создания/dedup/close/expiry;
- `fire/hot/new` freshness projection;
- `lead.converted_to_chat` event or field;
- link lead → client/expert/pair/session/payment/trial/risk;
- `ping.outreach_sent`, `ping.expired`, `ping.closed` и другие логические события Badge Contract.

Обычный `GuestManager`/profile-view tracking и обычные messages не являются Ping/Lead источником и не переводят lead в Chats.

## 8. Существующие события и payload

Найденный event/queue контур относится к legacy messages/notifications:

- `application/managers/MessageManager.php:31-35,251-269` — `onBeforeMessageCreate`, `onAfterMessageCreate`, attachment events; после сохранения ставится `CheckNewMessages` job.
- `application/bootstrap/WebBootstrap.php:78-88` — `ConsultationNotificationService` создаёт notification для сообщения session; это не BadgeResolver event.
- `application/jobs/CheckNewMessages.php` — email new-message job; realtime websocket/badge snapshot не найден.
- `application/modules/admin/services/MessageShellService.php:453-467` — message payload содержит `serviceSessionId`, role/scope/kind, sender, attachments, translation.

Не найдены `badge_codes`, `rule_version`, `as_of`, `queue_snapshot`, `payment_attempt` payload или realtime transport для обновления Left/Center/Right. Для BadgeResolver нет endpoint/controller/service.

## 9. Существующие API endpoints (фактически найденные)

### Admin messages

Источник: `application/modules/admin/controllers/MessageController.php`.

| Метод | Route/action | Что реально делает |
|---|---|---|
| GET | `conversations` | список диалогов через MessageShellService |
| GET | `messages` | пара пользователей + optional `serviceSessionId` |
| GET | `session-card` | последняя session по паре |
| GET | `session-lifecycle` | session + 5 последних lifecycle/runtime events; ledger/refund из service не прокинут controller-ом |
| POST | `send` | создаёт admin message с переданными role/scope/kind |

### Public messages

Источник: `application/controllers/MessagesController.php`.

`conversations`, `messages($contactId)`, `create`, `upload-images`, `read-conversation`, `new-messages-counters`, delete actions. При переданном `serviceSessionId` клиентский поток ограничивается `client_thread`, но session transition API отсутствует.

### Payments/balance

Источник: `application/controllers/BalanceController.php`.

`buy`, `stripe-create-session`, `stripe-success`, `stripe-cancel`, `stripe-webhook`, `process-paypal`, `paypal-success`, `paypal-failure`, `process-robokassa`, `robokassa-success`, `robokassa-failure`, плюс legacy premium/boost/spotlight. Ни один endpoint не принимает consultation/session context.

## 10. Схема базы и граница доказательства

- Найден `H:\GPT-Codex\Confideline\Chat\youdate-2.0.2-yii2\Source\youdate-manual-installation.sql` (62 `CREATE TABLE`), но это старый manual-install dump и в нём нет `service_session`, `service_session_event`, `service_session_runtime_event`, `service_session_ledger_entry`, `service_session_refund_case`, `payment_attempt`, `coupon_request`, `ping` или `lead`.
- Поэтому для новых session tables первичным source в этом снимке являются перечисленные migrations, а не SQL dump.
- Подключения к live production DB и readback `information_schema` в рамках этого аудита не выполнялись. Нельзя заявлять, что migrations уже применены на production.
- Большая часть найденного Yii2 source и локальных contracts находится в рабочем дереве как untracked. Это не означает, что Igor сможет получить их по GitHub URL без отдельного commit/publish.

## 11. Итоговая матрица для подключения resolver-а

| Badge group | Нужный authoritative source по контракту | Фактически найдено | Разрешённый вывод сейчас |
|---|---|---|---|
| `chats_live` | session status + `billing_mode` | status `active`, billing mode отсутствует | **нельзя вычислять без false-positive риска** |
| `chats_payment_process` | payment attempt по consultation | только user-level order | **MISSING** |
| `chats_paid` | pair/dialog/session-scoped paid context/history | user-level order/balance | **MISSING/CONTRADICTS** |
| `chats_trial` | trial entitlement remaining | JSON snapshot only | **MISSING** |
| `chats_revive` | revive context | отсутствует | **MISSING** |
| `chats_coupon` | open coupon request | отсутствует | **MISSING** |
| `chats_risk` | unresolved risk/policy/quality incident | generic report/refund only | **MISSING** |
| `chats_safe` | pair-scoped safety decision | отсутствует | **MISSING** |
| `chats_skeptic` | open skeptic case | отсутствует | **MISSING** |
| `pings_fire/hot/new` | Ping/Lead created_at + freshness | отсутствует | **MISSING** |
| `pings_paid/trial/revive/risk` | lead-scoped payment/entitlement/revive/risk | отсутствуют | **MISSING** |
| `pings_reply/await` | outstanding action + message delivery/read | message `is_new` only | **MISSING/UNVERIFIED** |
| `chats_sell` | offer eligibility + blockers | no offer/request/risk/skeptic sources | **MISSING** |

## 12. Что передать Игорю сейчас

1. Передать этот audit как source map и **не реализовывать resolver по badge label или по текущему `active`**.
2. Для каждого `MISSING` получить первичный source: фактическую migration/model/service/API или зафиксированный `MISSING` в implementation backlog.
3. Отдельно проверить, применены ли пять service-session migrations в целевой БД.
4. Отдельно воспроизвести Stripe webhook и проверить scalar/array mismatch в `findOrder()`.
5. Для существующих controller payload сделать readback-тест: session-card, session-lifecycle, message filtering, admin send, payment success/failure.
6. Только после появления authoritative sources подключать BadgeResolver и проверять положительные/отрицательные cases из раздела 8 `codex-context-badge-resolver-ru.md`.

Это не список новой архитектуры и не разрешение заменить отсутствующие источники предположениями.

## 13. Проверка артефакта

Проверки на момент подготовки:

- source search по `application` и filename search по всему `youdate_extracted` для coupon/trial/payment-attempt/ping/lead/risk/safety/quality/assignment/SLA/reconnect выполнены;
- найденные модели, миграции, сервисы и controllers сверены с исходным кодом;
- manual-install SQL проверен на наличие новых session/badge источников;
- отчёт создан read-only аудитом, код backend не изменялся.

Граница результата: это **source audit**, а не утверждение production readiness и не доказательство того, что полный BadgeResolver уже реализован.
