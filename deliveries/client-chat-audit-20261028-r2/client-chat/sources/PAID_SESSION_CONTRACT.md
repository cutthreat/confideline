<!-- source-intake:2026-09-28 -->
> Источник: архив Игоря от 28.09.2026. Тип: **Документальный источник Игоря**.
> Сведения и тесты относятся к условиям исходного документа; сайт при подготовке пакета не перепроверялся. [Происхождение и статус](../SOURCE-REGISTER.md).

# Paid Session Contract

## Scope

This contract owns the paid-session control inside `#admin-agent-chat`:

- `#paidSessionControl` is the primary business action.
- `#billingPanel` displays the current server state. Opening or collapsing it does not change the session.
- `assets/agent_chat_paid_session.js` owns state transitions, rendering and transport.
- `assets/agent_chat_paid_session.css` owns all paid-session presentation.
- The server is authoritative. The browser must replace its local snapshot with every returned `session` object.
- Paid-session controls use local inline SVG paths instead of icon-font glyphs, so state icons do not depend on font encoding or load order.

The implementation is dependency-free and does not require jQuery. It is designed for a Yii2 PHP view and asset bundle.

## Canonical State

```json
{
  "session_id": "ps-843",
  "consent_id": "consent-843",
  "conversation_id": "843",
  "status": "active",
  "billing_mode": "paid",
  "pause_reason": null,
  "version": 7,
  "service_id": "paid_consultation_per_minute",
  "service_version": "1",
  "rate_label": "10 credits/min",
  "balance_signal": "sufficient",
  "trial_available": false,
  "expert_ready": true,
  "client_ready": true,
  "offer_expires_at": null,
  "connection_deadline": null,
  "pause_expires_at": null,
  "reconnect_deadline": null,
  "started_at": "2026-07-30T09:30:00.000Z",
  "updated_at": "2026-07-30T09:31:00.000Z"
}
```

The client never receives or renders an exact balance. `balance_signal` is one of `unknown`, `sufficient`, `low`, or `required`.

The offer modal renders `#paidSessionServiceSelect` as a real service selector.
It currently contains the canonical default service and is intentionally
`disabled` until the backend supplies an operator-selectable service catalog.
The option value is the stable `service_id`; `data-service-version` carries the
service definition version. The disabled UI state does not remove these values
from the offer request.

## Statuses

| Status | Meaning | Main control |
|---|---|---|
| `no_consent` | No active client consent or offer | Neutral `Offer consultation` |
| `offer_pending` | Offer sent; waiting for client | Disabled neutral waiting state |
| `ready` | Client consent committed; expert may connect | Green pulsating `Start paid session` |
| `connecting` | Both sides are being connected; billing has not started | Disabled blue progress state |
| `active` | Trial or paid session is running | Red `Pause paid session` |
| `paused` | Session is paused and no new billable segment may start | Amber `Resume paid session` |
| `reconnecting` | Temporary technical reconnect grace period | Disabled amber progress state |
| `completed` | Session is terminal | Disabled gray completed state |

`billing_mode` is independent of status and is one of `none`, `trial`, or `paid`.

The primary control uses a solid lightning symbol before the offer. The icon has
no internal circle or outline and does not depend on an icon font.
`offer_pending`, `connecting`, and `reconnecting` keep an indeterminate SVG
progress indicator rotating. `offer_pending` additionally uses a subtle blue
orbit/glow, visually distinct from the green readiness pulse.

The primary control gives short scale/press feedback for accepted clicks.
`#billingPanel` uses a restrained entrance animation whenever an operational
state opens it. The non-load `offer_pending` → `ready` transition plays one
short Web Audio consent-confirmation chime. The first non-load transition into
`active` plays a separate quiet session-start tone. Neither sound plays while
restoring state on page load, on ordinary rerenders, or when resuming a session
that already has `started_at`. Backend teams can disable or tune the sounds
through the `offerAcceptedSound*` and `sessionStartSound*` values in
paid-session defaults.

Paid-session modals follow a compact information hierarchy: one concise action
title, required controls, an exact client-message preview where a template is
sent, one short operational consequence when needed, and footer actions.
Selected template names do not repeat as explanatory headings; client previews
use the short `Клиенту` legend, while internal comments remain explicitly
separate from client-visible text.

The pause modal groups its payload by audience. `Для клиента` contains the
template selector and exact chat-message preview. `Для сервиса` contains the
required pause reason, optional supervisor comment, and the billing consequence.
Backend payload names and transition rules remain unchanged by this visual
grouping.

## Transition Rules

| From | Action | To | Required data |
|---|---|---|---|
| `no_consent` | `offer` | `offer_pending` | Rate, optional client message |
| `offer_pending` | server consent event | `ready` | Committed `consent_id` |
| `offer_pending` | server client-decline event | `no_consent` | Request is marked `declined`; no billing starts |
| `offer_pending` | assigned operator cancels offer | `no_consent` | Request is marked `cancelled`; no billing starts |
| `ready` | `start` | `connecting` | `consent_id`, readiness confirmation |
| `connecting` | server ready event | `active` | Both parties ready; billing begins now |
| `connecting` | operator cancels connection | `completed` | `technical_end`, `connecting_cancelled`; no billing |
| `active` | `pause` | `paused` | Mandatory pause reason |
| `paused` | `resume` | `connecting` | Resume confirmation |
| `active` or `paused` | `complete` | `completed` | Mandatory completion reason |
| `active` | server connection loss | `reconnecting` | Reconnect deadline |
| `reconnecting` | server reconnect event | `active` | Canonical server snapshot |
| `reconnecting` | timeout | `completed` | Technical completion reason |

`completed` is terminal for that particular session row. A repeat
consultation is not a transition out of `completed`: the operator's
`Offer paid consultation` action creates a new request and a new session for
the same long-lived conversation while preserving the previous session's
timeline and charge history.

The pause/resume modal exposes compact `Pause`, `Complete`, and `Cancel`
actions. `Complete` closes that modal and opens a separate completion modal
with the required reason selector; its `Complete` action submits
`event=complete`. This preserves the server-side audit requirement and is not
an extra lifecycle state.

Persistent paid-session timeline events:

| State change | `event_code` |
|---|---|
| Offer committed | `offer_sent` |
| Client consent committed | `offer_accepted` |
| Client decline committed | `offer_declined` |
| Connection completed and billing started | `session_started` |
| Session paused | `session_paused` |
| Paused session active again | `session_resumed` |
| Session completed | `session_completed` |

These are internal operator timeline records, not client-visible message text.
The backend creates each event in the same transaction as its authoritative
state change and publishes it through the conversation realtime channel.

Business constraints:

1. No consent means no paid mode.
2. Consent alone does not debit the client.
3. `connecting` is free. Billing starts only after both sides are ready.
4. A zero trial entitlement skips `trial` and starts `paid`.
5. Pause or completion never starts another initial reservation; deferred
   completion settles only the active seconds recorded in the event log.
6. Duplicate clicks must not create duplicate offers, sessions or debits.
7. A top-up never resumes a paused session automatically.
8. Refunds and compensations are separate moderator workflows, not session-control actions.
9. A new paid offer requires paid-wallet capacity for at least three configured-rate
   minutes. The exact balance is never returned to the browser. If the wallet is
   short, the offer and canonical client message are still created, but consent
   remains blocked until the server guard passes.
10. A short-wallet client is sent to the existing balance page with a safe return
    URL for the same messages conversation. After payment, the page selects that
    contact again; the client must explicitly accept and the operator must still
    start the consultation.

## Panel Rules

The panel opens automatically for `offer_pending`, `connecting`, `active`, `paused`, and `reconnecting`. The operator may collapse it without changing session state. It contains:

- status; the same status pill contains every relevant clock, including `Connecting · mm:ss`, `Live · mm:ss`, `Session paused · mm:ss`, and `Reconnecting · mm:ss`;
- billing mode;
- readiness;
- operational balance signal;
- a top-up action only for `low` or `required` balance.

While `offer_pending`, the server spinner stays visible and the assigned
operator has a `Cancel offer` action. It records `offer_cancelled`, marks the
request cancelled, returns the session to `no_consent`, and allows a later
offer; it is distinct from client decline and scheduler expiry.

Exact credit balance is intentionally not rendered.
The panel has no separate timer pill. It can render at most four pills at once:
status with its clock, billing mode, readiness, and balance. In practice the
state-specific rules reduce the visible maximum to three:

- `active` / `paused`: status with clock, billing mode, balance;
- `connecting` / `reconnecting`: status with countdown and readiness only.

Billing mode, balance, and Top-up are deliberately hidden during connection
progress. Balance color follows `balance_signal`: green for `sufficient`, amber
for `low`, red for `required`, and neutral gray for `unknown`.

The `Live · mm:ss` clock is the server-calculated active communication duration,
not wall-clock time since the first `started_at`. The server sums intervals
opened by `connection_ready`/`reconnected` and closed by pause, connection loss,
completion, or technical termination. A manual or balance pause therefore
freezes the active clock; time spent paused is not billable and is not included
after resume. The browser renders the returned `activeElapsedSeconds` baseline
and `activeElapsedAsOf` timestamp with a display-only interpolation between
server refreshes; it never calculates or authorizes billing from its own timer.

## Transport Configuration

The PHP view renders `#paidSessionConfig` as JSON. `transport` is `demo` for this prototype and must become `ajax` in Yii2.

All editable fallback timings and demo values are grouped at the top of
`agent_chat_paid_session.js`. Production business values should be supplied by
the PHP view through `defaults`; changing the browser constants must not replace
server-side billing rules.

```php
<?= Html::tag('script', Json::htmlEncode([
    'transport' => YII_ENV_DEV ? 'demo' : 'ajax',
    'conversationId' => (string) $conversation->id,
    'operatorId' => (string) Yii::$app->user->id,
    'csrf' => [
        'param' => Yii::$app->request->csrfParam,
        'token' => Yii::$app->request->csrfToken,
    ],
    'defaults' => [
        'offerTtlSeconds' => 900,
        'connectionTimeoutSeconds' => 180,
        'manualPauseSeconds' => 300,
        'reconnectGraceSeconds' => 60,
        'errorVisibilityMs' => 4200,
    ],
    'endpoints' => [
        'state' => Url::to(['/admin/paid-session/state']),
        'offer' => Url::to(['/admin/paid-session/offer']),
        'start' => Url::to(['/admin/paid-session/start']),
        'pause' => Url::to(['/admin/paid-session/pause']),
        'resume' => Url::to(['/admin/paid-session/resume']),
        'complete' => Url::to(['/admin/paid-session/complete']),
        'topUp' => Url::to(['/admin/paid-session/top-up']),
    ],
    'initialState' => $paidSessionPresenter->toArray($conversation),
]), [
    'type' => 'application/json',
    'id' => 'paidSessionConfig',
]) ?>
```

## Endpoints

### `GET /admin/paid-session/state`

Query:

```json
{
  "conversation_id": "843"
}
```

### Transition requests

`POST /admin/paid-session/offer`

```json
{
  "conversation_id": "843",
  "operator_id": "1",
  "expected_version": 3,
  "idempotency_key": "paid-offer-...",
  "service_id": "paid_consultation_per_minute",
  "service_version": "1",
  "rate_label": "10 credits/min",
  "offer_template_id": "paid_session_standard",
  "offer_template_version": "1",
  "client_message_preview": "Предлагаю продолжить в формате платной консультации...",
  "delivery_mode": "automatic_chat_message"
}
```

The backend must resolve the canonical template text by `offer_template_id` and version. `client_message_preview` is diagnostic/demo data and must not be trusted as the message source.

Creating the offer and its client-visible chat message is one backend transaction. The response additionally includes:

```json
{
  "offer_message": {
    "message_id": "msg-1042",
    "template_id": "paid_session_standard",
    "template_version": "1",
    "text": "Canonical text rendered by the backend",
    "delivery_status": "sent"
  }
}
```

The normal realtime message channel adds the returned/created message to the operator chat. The paid-session module emits `agentpaid:offer-created` but does not append another message locally, preventing duplicate rendering.

`POST /admin/paid-session/start`

```json
{
  "conversation_id": "843",
  "session_id": "ps-843",
  "consent_id": "consent-843",
  "operator_id": "1",
  "expected_version": 4,
  "idempotency_key": "paid-start-...",
  "expert_ready": true
}
```

`POST /admin/paid-session/pause`

```json
{
  "conversation_id": "843",
  "session_id": "ps-843",
  "operator_id": "1",
  "expected_version": 6,
  "idempotency_key": "paid-pause-...",
  "pause_reason": "client_request",
  "pause_template_id": "paid_pause_client_request",
  "pause_template_version": "1",
  "client_message_preview": "Ставлю консультацию на паузу по вашей просьбе...",
  "delivery_mode": "automatic_chat_message",
  "internal_comment": "Клиент попросил вернуться к вопросу после уточнения деталей."
}
```

The backend resolves the canonical client-visible text by `pause_template_id` and
`pause_template_version`. As with the offer flow, `client_message_preview` is
diagnostic/demo data and must not be trusted as the message source.

`internal_comment` is private operational context for supervisors. It must never
be rendered in the client chat, passed to a translation provider, or included in
the client-visible message payload.

Pausing the session, creating the canonical client message, and storing the
internal comment are one atomic backend operation. A successful response may
add:

```json
{
  "pause_message": {
    "message_id": "msg-1051",
    "template_id": "paid_pause_client_request",
    "template_version": "1",
    "text": "Canonical text rendered by the backend",
    "delivery_status": "sent"
  },
  "internal_comment_saved": true
}
```

The regular realtime channel renders `pause_message`. The paid-session module
emits `agentpaid:pause-created` for integrations and does not append the message
itself, preventing duplicate rendering.

`POST /admin/paid-session/resume`

```json
{
  "conversation_id": "843",
  "session_id": "ps-843",
  "operator_id": "1",
  "expected_version": 7,
  "idempotency_key": "paid-resume-..."
}
```

`POST /admin/paid-session/complete`

```json
{
  "conversation_id": "843",
  "session_id": "ps-843",
  "operator_id": "1",
  "expected_version": 8,
  "idempotency_key": "paid-complete-...",
  "completion_reason": "consultation_finished",
  "client_message": ""
}
```

`POST /admin/paid-session/top-up`

```json
{
  "conversation_id": "843",
  "session_id": "ps-843",
  "operator_id": "1",
  "expected_version": 8,
  "idempotency_key": "paid-top-up-...",
  "source": "billing_panel"
}
```

All transition responses use:

```json
{
  "ok": true,
  "request_id": "req-...",
  "session": {},
  "timeline_event": {
    "message_id": "system-paid-1051",
    "conversation_id": "843",
    "session_id": "ps-843",
    "system_kind": "paid_session",
    "event_code": "session_paused",
    "text": "Консультация поставлена на паузу · По просьбе клиента",
    "tone": "warning",
    "occurred_at": "2026-07-30T18:51:00Z",
    "metadata": {
      "pause_reason": "client_request"
    }
  }
}
```

The `session` object is always complete, canonical and safe to render.
`timeline_event` is optional when no persistent timeline record belongs to the
response. Consent and connection-complete events are normally delivered by
realtime because they are server-originated asynchronous transitions.
Recommended errors:

- `403` permission denied;
- `409` stale version, duplicate command or concurrent active session;
- `410` expired offer;
- `422` invalid transition or missing reason;
- `503` connection or billing provider unavailable.

An error response should include `code`, `message`, and, when available, a fresh canonical `session`.

## Field Validation

- Validation errors stay inside the modal and directly under the field they describe.
- The invalid control receives `aria-invalid="true"` and keeps its existing value.
- The field wrapper receives `.is-invalid`; the message uses `role="alert"` and the control references it through `aria-describedby`.
- Selecting a valid reason or template clears that field's error immediately.
- The modal remains open and focuses the first invalid field; no request is sent until all required fields are valid.

## Concurrency and Idempotency

- Every mutation sends `expected_version`.
- Every mutation sends a new `idempotency_key`.
- The backend stores an idempotency result per operator/action/session.
- A `409` with a canonical `session` is not blindly retried by the UI; the UI applies the server snapshot.
- Controls are disabled while a request is pending.

## Browser API and Events

The module exposes:

```js
window.AgentPaidSession.getState();
window.AgentPaidSession.reload();
window.AgentPaidSession.applySessionSnapshot(session);
window.AgentPaidSession.demoSetState(status, patch);
```

Events:

- listens to `agentchat:conversation-changed` and reloads state for the committed conversation;
- emits `agentpaid:state-changed` with `{ previous, session, source }`;
- emits `agentpaid:layout-changed` after panel visibility changes;
- emits `agentpaid:offer-created` with the canonical `offer_message`;
- emits `agentpaid:pause-created` with the canonical `pause_message` and internal-note persistence result;
- emits `agentpaid:timeline-event` with a canonical persistent technical event;
- emits `agentpaid:topup-requested` after a successful top-up request.

## Demo Flow

The local prototype uses a demo transport with the same payload and response shapes as AJAX:

1. Offer creates `offer_pending`.
2. Demo client consent changes it to `ready`.
3. Start creates `connecting`.
4. Demo readiness changes it to `active`.
5. Pause, resume and complete follow the canonical transitions.

`demoSetState()` exists only for focused UI testing and must not be used by production code.

## Yii2 Integration Checklist

1. Register `agent_chat_paid_session.css` and `agent_chat_paid_session.js` in the chat-only asset bundle.
2. Render `#paidSessionConfig` from the PHP view.
3. Validate RBAC, conversation access, consent ownership and current state in every action.
4. Resolve selected offer and pause templates server-side; never trust their preview text from the browser.
5. Create an offer plus its chat message in one transaction; create a pause transition, its client message, and its private supervisor comment in one transaction.
6. Never expose `internal_comment` through chat-message, translation, or client-facing realtime payloads.
7. Wrap all other transitions and billing changes in database transactions.
8. Enforce version and idempotency constraints server-side.
9. Return the full canonical session snapshot after every request.
10. Push automatic offer/pause messages and external client/readiness/reconnect changes through the existing realtime channel, then call `applySessionSnapshot()`.
11. Never trust client timers for billing.

## Local server billing adapter

The current branch includes a local settings-backed adapter so the lifecycle
can be exercised before the external G2 payment/entitlement sources are
available:

- `common.paidSessionRateCreditsPerMinute` is the immutable numeric rate copied
  into each offer snapshot. A new offer is rejected if the value is missing or
  zero, rather than creating an unpriced session that can only time out during
  `connecting`.
- `common.paidSessionTrialMinutes` is the initial lifetime grant for each
  client. The remaining allowance is stored in `balance.trial_minutes`; the
  session trial snapshot is only a transport/read projection. A trial minute
  atomically decrements that balance field and is recorded as a zero-amount
  `service_session_charge` row.
- These keys are stored in the existing `setting` table (`category = common`)
  and are edited through `/admin/settings/payment`. The exact keys are
  camelCase (not
  `paid_session_rate_credit_per_minute`):
  Set the approved credits-per-minute price and trial minutes in that form;
  saving through the existing settings service invalidates the Redis settings
  cache automatically.
- New sessions use `billing_strategy=deferred_seconds`. The first active minute
  is reserved exactly once before `connecting -> active` (trial consumption or
  one full paid-minute debit). After that, the append-only session events
  determine the exact active seconds; pause and reconnect gaps are excluded.
  When the session reaches `completed`, `service-session/bill` writes one
  idempotent final settlement row for the remaining seconds. Paid credits are
  calculated as `ceil(seconds * rate_credits_per_minute / 60)`; for example,
  61 seconds after the initial minute at 10 credits/minute costs 11 credits.
- The worker keeps an affordability guard while a deferred session is active:
  it does not debit each minute, but moves the session to `balance_pause` when
  the accumulated unpaid estimate exceeds the current balance and remaining
  trial minutes. A completed session is settled even if that debit makes the
  wallet negative; a top-up is required for a later consultation, not to make
  the prior settlement possible.
- The admin Chat V2 and experimental client state reads run the same locked
  active guard as a bounded fallback when the billing worker is late. This
  fallback can pause an active session but does not replace the worker and does
  not post the deferred terminal debit before completion.
- Existing rows with `billing_strategy=minute_legacy` continue to use the
  previous per-started-minute reconciler. The migration adds explicit charge
  type, billable seconds, trial-minute count and settlement key columns so
  retries cannot create duplicate final components.
- The price snapshot is intentionally immutable. Saving a rate later does not
  repair an already-created `mvp_unpriced` historical session: cancel/let that
  connection end, then create a fresh offer so it receives the configured
  snapshot.
- `service_session_charge(session_id, unit_no)` is unique, so a retry cannot
  debit the same session minute twice. The balance row lock also prevents two
  simultaneous consultations from spending the same lifetime trial minute.
- `php yii service-session/bill --limit=100` is the trusted worker entry point.
  It activates connecting sessions only after both Redis readiness flags,
  maintains the deferred active-time/affordability projection, and settles
  completed deferred sessions. It must run on a short deployment schedule
  together with `service-session/sweep`.

This adapter deliberately does not claim the final G2 provider, coupon,
entitlement, refund or compensation semantics. Those sources must replace the
settings adapter before production financial rollout.

### Activation trigger versus billing worker

`service-session/bill` is a bounded console sweep, not a command that an
operator should run manually for every consultation. In the current slice it
is the trusted retry point that calls `tryActivate()` for connecting sessions,
checks affordability/active seconds while a deferred session is live, and
settles completed deferred sessions from the server event log. The protected
`cron.php` bridge can invoke the same command in a deployment scheduler.

Activation may also be called directly from the PHP readiness request after it
has stored the authenticated side's Redis flag: the request can call the
application service `ServiceSessionReadinessService::tryActivate()`, not spawn
the console command through `shell_exec` or an HTTP self-request. That gives a
fast `connecting` -> `active` response when both flags are already present and
the pricing/balance gate passes.

The readiness assertion itself is an authenticated HTTP request. The existing
WebSocket connection accelerates UI refresh and presence, but it is not a
prerequisite for the client or assigned operator to refresh their own short-
lived readiness flag. The first paid/trial minute is prepared in the same DB
transaction **before** the state machine previews `connection_ready` or
`reconnected`; otherwise an `active` transition with `billing_mode=none` must
be rejected.

The canonical readiness/state response includes only the safe
`activationBlocked` code when a connecting session cannot activate:
`billing_unavailable` (the server rate/snapshot is unavailable) or
`insufficient_balance`. It never returns an exact balance, rate, pricing
snapshot, or internal actor identity. Both the temporary client bridge and
Chat v2 render that code as an actionable human message rather than a generic
`billing pending` label.

The periodic billing sweep must remain even with that synchronous trigger. It
is needed to retry after a lost readiness request, maintain the server-side
active-time/affordability guard when no browser makes a request, settle a
completed conversation exactly once, and recover after PHP/WebSocket/network
failures. Browser timers and the WebSocket process must never be the financial
clock. The intended production shape is therefore hybrid: direct PHP
activation for responsive UX plus a scheduled server sweep as the authoritative
retry/reconciliation safety net.

### Operational backlog: recurring billing schedule

The manual local verification on 2026-08-07 confirmed the immediate first
paid unit (10 credits) at activation. With deferred billing, a long active
session intentionally keeps only that initial debit until completion; the
scheduled `service-session/bill` run after completion records the remaining
seconds and one aggregate debit. Treat installation and monitoring of that
schedule as P0 before any real-money rollout; it may be deferred while the
current branch remains an experimental integration environment.

### Duration and balance boundary

The current local adapter has three different timing boundaries:

- `offer_pending` is free and expires after the server-owned offer TTL (900
  seconds by default; the value is clamped to 60 seconds–24 hours).
- `connecting` is free and has a 180-second connection deadline by default. If
  both parties are not ready by then, the lifecycle sweep closes the session
  with `technical_end` / `connecting_timeout`.
- `active` starts only after both readiness signals pass and a trusted PHP
  activation attempt reserves the first minute. This attempt normally happens
  directly in the final readiness request and is retried by the billing worker.
  Deferred sessions then accumulate exact active seconds and settle them after
  completion; the first minute remains a separate trial/paid reservation.

There is currently **no hard maximum active duration and no per-session credit
cap**. The effective MVP limit is the client's available balance: for deferred
sessions the server estimates the unpaid second cost (after remaining trial
minutes) and moves the session to `paused` with
`pause_reason=insufficient_balance` when that estimate is not covered. It does
not debit the active session minute-by-minute. A top-up does not resume the
session automatically; the operator must resume it and both parties must pass
the connection gate again. Manual pause, completion, reconnect grace (60
seconds by default), and technical timeouts are separate controls and are not
an active-session maximum.

Therefore, with a rate of 10 credits/minute, no trial and no other balance
changes, a balance of approximately `B` credits covers the accumulated unpaid
seconds until the affordability guard pauses the session. The final completed
session still records the exact second cost rounded up and may take the wallet
negative if the balance changed after the guard check.

Before production rollout the product contract must explicitly choose whether
to add a hard maximum (minutes, credits, or both), and whether insufficient
balance should pause or terminate the consultation. The local implementation
is balance-limited with a pause and terminal second settlement, not a promise
of unlimited-duration consultations.

### Recovery of a stale `connecting` session

The Chat v2 control is intentionally disabled while a session is
`connecting`; a second `start_requested` is not a legal transition. The
server-owned `connecting_deadline_at` is the normal exit path. Until the
deployment worker is scheduled, run the lifecycle sweep from the
`application` directory:

```text
php yii service-session/sweep --dryRun=1 --limit=100
php yii service-session/sweep --limit=100
```

An overdue row is closed with the idempotent `technical_end` event and
`connecting_timeout` reason, preserving the audit trail. A readiness request
that arrives after the deadline performs the same server-time expiry, so a
client does not remain in `connecting` merely because the scheduler is late.
The operator also has an explicit `Cancel connection` action, which uses
`technical_end` with `connecting_cancelled` and does not start billing. Do not
delete the `service_session` row manually; that would orphan its request,
message and event history. A completed row can receive a new offer, which
creates a fresh request/session while retaining this audit history.
