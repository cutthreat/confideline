# Технический контекст для Codex Игоря - G2.2

Этот файл передается агенту Codex вместе с `etalon-tz-g2-2-timer-debit-pause.md`. Он объясняет полный integration contract, но не заменяет анализ фактического repository/build и не предписывает Игорю конкретную архитектуру.

## 1. Паспорт задачи

Задача: `G2.2`.

Цель: реализовать server-authoritative trial/paid minute meter, exactly-once debit, low-balance warning, one balance pause, explicit continuation, reconnect financial behavior и technical incident handoff.

Current truthful status:

`local_service_session_runtime_slice_present_unmapped_and_not_runtime_accepted`

Локальный extracted source содержит ServiceSession, StateMachine, RuntimeMeter и runtime events. Он не доказывает tracked/migrated/deployed behavior.

Приоритет источников:

1. `etalon-tz-g2-2-timer-debit-pause.md`;
2. текущие owner decisions;
3. G1.3 lifecycle contract;
4. G2.1 price/balance contract;
5. mapped repository/build;
6. legacy local source только как navigation/evidence.

## 2. Product invariants

1. Trial is fixed free-minute entitlement, not wallet debit.
2. Trial default is 3 minutes and may be zero.
3. Paid start requires both parties ready, valid consent, price snapshot and full minute balance.
4. A paid minute is charged once at its start.
5. Early end does not auto-refund a started minute.
6. Minute boundary creates at most one next-minute debit.
7. No new minute starts during waiting, reconnect, balance pause or terminal state.
8. Low-balance warning default is 2 full minutes.
9. Inactivity reminder default is 2 minutes and does not auto-transition.
10. Balance pause default is 5 minutes and is available once per session.
11. Payment success never auto-resumes paid.
12. Client and Agent reconnect defaults are independent 60-second clocks.
13. Technical interruption creates one incident/candidate, not automatic money action.
14. All actual refund/compensation decisions are manual super-admin actions.
15. Server time and committed financial records are authoritative.
16. Trial entitlement/usage never replaces explicit client consent; the same paid-consent contract applies when trial is zero or positive.

## 3. Scope

### In scope

- trial entitlement snapshot/consumption;
- trial active-time clock;
- pre-paid-start guards;
- paid minute ordinal and boundary;
- price snapshot consumption;
- atomic wallet check/debit/ledger;
- low-balance warning;
- inactivity financial behavior;
- balance pause use/deadline;
- explicit continuation after top-up;
- client/agent reconnect financial contract;
- simultaneous/platform technical interruption;
- timer/admin readback;
- idempotency and concurrency;
- G1.3/G2.1/G2.3/G4 handoff events.

### Out of scope

- request/offer lifecycle;
- exact UI visual design;
- package checkout internals;
- payment provider configuration;
- refund approval/execution;
- agent payout;
- support case workflow;
- notification channel delivery;
- analytics dashboard;
- automatic compensation.

## 4. Current source navigation

Verify these paths against Igor's actual repository and mapped commit:

- `application/services/ServiceSessionRuntimeMeter.php`
- `application/services/ServiceSessionStateMachine.php`
- `application/services/ServiceSessionPricingGate.php`
- `application/models/ServiceSession.php`
- `application/models/ServiceSessionRuntimeEvent.php`
- `application/models/ServiceSessionEvent.php`
- `application/models/ServiceSessionLedgerEntry.php`
- `application/models/Balance.php`
- `application/models/BalanceTransaction.php`
- `application/managers/BalanceManager.php`
- `application/migrations/m260615_230000_service_session_runtime_meter.php`
- `application/migrations/m260615_181500_service_session_state_machine.php`
- `application/migrations/m260615_210000_service_session_pricing_gate.php`
- client consultation/chat actions and views;
- admin consultation list/card/settings surfaces;
- job/queue/scheduler path responsible for overdue clocks.

Local reference root:

`Chat/youdate-2.0.2-yii2/Source/youdate_extracted`

Before reuse, record:

- tracked/untracked state;
- migration status;
- module/service registration;
- actual call sites;
- runtime worker/cron/queue path;
- transaction boundaries;
- existing tests;
- whether the slice exists in target build.

## 5. Known local gaps to verify, not blindly patch

The local extracted slice currently appears to:

- use a compact legacy status list that does not fully represent accepted G1.3 primary/substate ownership;
- place dispute/refund in ServiceSession status, conflicting with the accepted linked-process boundary;
- store `minutesRemaining` and `amountRemaining` without proving the final trial-vs-wallet model;
- save session projection and runtime event in separate operations;
- expose no demonstrated logical minute idempotency key;
- expose no demonstrated atomic wallet bucket debit;
- expose no demonstrated row/optimistic lock for concurrent boundary actions;
- expose no demonstrated trial clock, consent guard, presence guard or reconnect clocks;
- expose no demonstrated one-pause counter/deadline;
- expose no demonstrated server scheduler/overdue recovery;
- expose no mapped UI/admin runtime proof.

These observations are evidence/navigation only. Igor may replace or refactor the slice rather than preserve its exact structure.

## 6. Conceptual records

Exact tables/classes are Igor's choice. The implementation must preserve these concepts.

### Trial entitlement snapshot

- session;
- source coupon/campaign/manual rule;
- source G2.1 rule/version is the only configuration owner; default welcome template is 3 free minutes and 0 skips trial;
- granted free minutes;
- consumed free seconds/minutes;
- remaining;
- active rule/version;
- captured time.

### Consent snapshot

- session/client;
- initiation path: client request accepted by Agent or Expert proposal accepted by client;
- accepted terms/rule version;
- accepted at;
- valid/withdrawn status;
- client-visible Expert/profile;
- effective credits/minute;
- trial minutes including zero;
- started-minute rule;
- balance readback shown at confirmation.

For a client-initiated request, Agent acceptance only opens the confirmation step. Do not create the session or connecting state until the client commits this snapshot. For an Expert-initiated offer, the client's explicit acceptance commits the same snapshot and is the consent action. Decline/expiry produces no session/debit.

### Paid minute result

- session;
- ordinal;
- logical idempotency identity;
- scheduled/actual start;
- server deadline;
- effective credits/minute;
- debit result/ledger references;
- status: started/completed/affected;
- interruption linkage;
- created/committed time.

### Clock snapshot

- clock type;
- session;
- applied duration;
- started at;
- deadline;
- state;
- actor expected;
- config version;
- completion/timeout reason.

### Balance pause usage

- session;
- use ordinal;
- started/deadline/ended;
- starting balance;
- required next-minute amount;
- outcome;
- continuation identity.

### Technical incident link

- session;
- affected minute ordinals;
- missing actors/platform reason;
- first/last signal;
- dedup identity;
- support/refund candidate reference;
- no automatic financial result.

## 7. Authoritative time contract

- Persist server timestamps for all boundaries.
- Client countdown is derived from `server_now` and persisted deadline.
- Browser clock cannot start, stop or extend a financial interval.
- Reload/second device receives the current committed state and deadline.
- Worker delay does not extend a minute or create extra charge.
- Overdue recovery applies transitions from persisted deadlines exactly once.
- Use one stable ordering rule for simultaneous end/start/timeout events.

Do not rely on one long-running browser timer as source of truth.

## 8. Trial clock contract

Trial uses free-minute entitlement and no wallet debit.

An explicit paid-consent snapshot must already exist before session creation for both `trial=0` and `trial>0`. Trial entitlement and trial activity are not consent.

Required behavior:

1. Resolve/capture entitlement before active trial.
2. If zero, emit a skip result and evaluate paid start only with the committed consent snapshot.
3. Start only when both parties are ready.
4. Track consumed active trial time.
5. Inactivity inside active trial continues the timer.
6. Waiting/reconnect freezes remaining trial without restoring consumed time.
7. Retry/reload reads the same entitlement and remaining time.
8. Trial exhaustion resolves once.
9. Trial end reuses the pre-session consent snapshot and, with sufficient balance, attempts the first paid-minute start.
10. Trial end without consent produces no debit.

## 9. Paid-start guards

One server-side guard must check:

- authorized active session;
- expected client/Agent binding;
- both ready/present;
- no terminal/waiting/reconnect/pause condition;
- valid price snapshot;
- consent snapshot;
- full spendable balance;
- no already-started ordinal for the same boundary.

The guard is identical after a zero-trial skip and after a positive trial exhausts. Trial presence must never bypass the consent check.

Return one of:

- `paid_minute_started`;
- `trial`;
- `consent_required`;
- `balance_pause_started`;
- `reconnect_or_waiting`;
- `session_terminal`;
- safe configuration/technical failure.

## 10. Atomic minute-start unit

The logical business transaction is:

1. lock/read authoritative session and expected next ordinal;
2. revalidate state/participants/consent;
3. read immutable session price;
4. atomically allocate/debit G2.1 balance buckets;
5. append ledger movement;
6. persist paid minute result and server deadline;
7. append runtime/lifecycle event/outbox signal;
8. commit;
9. return readback.

If commit fails, the minute is not considered started.

Do not treat a UI response timeout as transaction failure. Retry must read the already committed result by logical identity.

## 11. Minute idempotency

Required logical identity:

`session_id + paid_minute_ordinal`

An equivalent stable identity is acceptable if it proves the same uniqueness.

The following must reuse/read the existing result:

- duplicate API submit;
- queue retry;
- browser retry;
- delayed worker;
- two tabs;
- reconnect;
- lost response;
- repeated boundary tick.

No retry may create a second wallet movement, ledger line, event or accrual trigger for the same ordinal.

## 12. Boundary ordering

At the next-minute boundary:

- lock/read current session;
- determine whether terminal/end/wait/reconnect/pause already committed;
- if eligible, attempt next ordinal atomically;
- otherwise emit/read the no-next-minute outcome.

Concurrent `end` and `next-minute start` use first committed authoritative result:

- start/debit committed first -> full new minute remains charged;
- terminal end committed first -> no new minute/debit.

Persist enough ordering evidence for dispute readback.

## 13. Balance integration

Use G2.1:

- session price snapshot;
- spendable bucket ordering;
- nearest-expiry bonus credits first;
- purchased credits second;
- non-negative balance invariant;
- ledger reconciliation.

G2.2 must not:

- recalculate a current profile price mid-session;
- create fixed purchased minutes;
- expose exact balance to Agent;
- grant top-up credits;
- implement provider checkout.

## 14. Low-balance warning

Default threshold:

`floor(spendable_credits / session_credits_per_minute) <= 2`

Use active admin value rather than hardcoding.

Warning identity should prevent duplicate user-visible warning for the same session/threshold episode. A balance increase may reset eligibility only according to a deterministic rule.

`0` disables early warning, not balance enforcement.

## 15. Inactivity

Paid remains financially active until an allowed transition commits.

- inactivity reminder default: 120 seconds;
- reminder is not a pause;
- message count does not define billability;
- explicit waiting/end transition blocks the next minute;
- already started minute remains charged;
- no silent auto-pause.

G1.3 owns the waiting substate and return window. G2.2 reacts to the committed substate and blocks the next ordinal.

## 16. Balance pause

Entry conditions:

- next paid-minute start failed only because full balance is unavailable;
- session has not used its one allowed pause;
- session is otherwise continuable.

On entry:

- do not debit;
- mark pause usage ordinal `1`;
- snapshot 300-second default or current active value;
- persist deadline and required amount;
- emit one lifecycle/runtime result.

Second insufficient-balance episode:

- do not create pause ordinal `2`;
- complete session with insufficient-balance reason.

Pause timeout and early end resolve exactly once.

## 17. Top-up and continuation

Payment success updates G2.1 balance only.

Continuation requires an explicit client command after confirmed balance readback.

Guard:

- pause active and before deadline;
- client authorized;
- both parties present/ready;
- full next-minute balance;
- no terminal result;
- continuation identity unused.

Successful continuation starts one new paid-minute transaction. It does not merely change status to paid without a debit.

Concurrent top-up/timeout/continue must yield one consistent state and no orphan debit.

## 18. Reconnect integration

Client and Agent have independent 60-second defaults.

On disconnect during paid:

- current started minute remains;
- stop eligibility for next ordinal;
- snapshot grace;
- emit one actor-specific absence result.

On disconnect during balance pause:

- balance-pause deadline continues;
- reconnect grace runs independently;
- returning actor does not reset pause;
- whichever required terminal deadline commits first controls the result.

Resume requires all required actors present and current state still valid.

Timeout:

- terminal technical end;
- one technical incident/candidate;
- no automatic refund/compensation;
- no late resume.

## 19. Simultaneous/platform incident dedup

Use a stable incident correlation/dedup identity for one interruption episode.

One incident may collect:

- client absent;
- Agent absent;
- platform/transport degraded;
- balance/ledger unavailable;
- affected paid-minute ordinals.

Repeated monitoring signals update/link the same incident. They do not create repeated client messages, refund candidates or compensation grants.

## 20. Failure handling

### Balance/ledger unavailable before minute start

Fail closed: no minute/debit; show technical state; create operational incident where appropriate.

### Debit committed, response lost

Retry reads committed ordinal/debit and reconstructs timer.

### Minute saved without ledger or ledger without minute

This is an implementation defect. Use atomicity or a durable reconciliation design; never expose a normal successful paid minute while records disagree.

### Worker delayed/restarted

Recover from persisted deadlines/ordinals and process once.

### Configuration invalid

Preserve last valid active config or fail closed with visible configuration incident according to admin contract. Do not invent a value.

## 21. Manual refund/compensation boundary

G2.2 creates factual evidence/candidate only.

Actual action requirements:

- super-admin decision;
- reason;
- eligible affected minute/amount;
- preview;
- idempotency identity;
- ledger/grant result;
- linked support/refund case;
- audit.

No automatic grant path may be introduced under G2.2.

Client copy:

- before decision: case is under review;
- after successful action: exact credits and calculated full-minute equivalent;
- failure: no false success; case remains open.

## 22. Admin integration

Canonical page:

- group: `Общие настройки`;
- name: `Настройки консультаций`;
- recommended route: `/ru/admin/settings/consultations`;
- position: after `Настройки чата`, before `Настройки фото`.

G2.2-managed fields:

- low-balance full-minute threshold = 2;
- inactivity reminder seconds/minutes = 2 minutes;
- balance pause duration = 5 minutes;
- maximum balance pauses = 1;
- client reconnect grace = 60 seconds;
- Agent reconnect grace = 60 seconds.

Trial entitlement is not edited here. The only editor is the G2.1 Coupons surface. Consultation settings show a read-only link/readback of the active G2.1 rule and the applied session snapshot; the current welcome-template value is 3 free minutes and `0` skips trial.

Required admin contract:

- numeric cell/unit/min/max;
- zero/unset distinction;
- draft/validate/activate;
- effective time;
- actor/reason;
- version history;
- current readback;
- impacted-new-clock preview;
- rollback through a new version;
- role guard via existing permissions.

Do not duplicate:

- G2.1 price/package/coupon editor;
- Payment systems;
- chat settings;
- support/refund settings;
- role assignment.

## 23. Role and privacy contract

### Client

Own session, own exact balance/debits, safe incident status.

### Agent

Assigned session operations, timers and badges only. No exact balance, payment details, staff evidence or manual money action.

### Moderator

Only linked support/safety scope from its owner process.

### Super-admin

Full configuration, timeline, ledger linkage, incident and manual decision readback.

Server-side ACL is required. Hidden UI alone is not proof.

## 24. Event/outbox contract

Implementation names are flexible. Observable business events include:

- trial_started;
- trial_skipped;
- trial_exhausted;
- paid_minute_started;
- paid_minute_completed;
- low_balance_warning;
- balance_pause_started;
- balance_pause_ended;
- balance_pause_timed_out;
- continuation_requested/confirmed/rejected;
- participant_disconnected/reconnected;
- reconnect_timed_out;
- technical_incident_created/updated;
- consultation_financial_finalized.

User notifications and analytics consume committed events; they must not own or recreate billing transitions.

## 25. Acceptance matrix

1. Trial=3 with committed consent -> three free active minutes, zero wallet debit, then paid guard.
2. Trial=0 with committed consent -> skip once and evaluate the same paid guard.
3. Duplicate trial start -> one trial result.
4. Trial disconnect/reconnect -> consumed time preserved, no new entitlement.
5. Trial end + consent + balance -> one paid ordinal/debit.
6. Trial end without consent -> no debit.
6a. Agent accepts a client request without client confirmation -> no session/connecting/debit.
6b. Client confirms either initiation path -> consent version/time/full snapshot persisted once.
6c. Client declines or confirmation expires -> no session/debit.
7. Both-ready false -> no paid start.
8. First paid start -> price snapshot debited once.
9. Duplicate start/tick -> same ordinal/result.
10. Early end -> full started-minute charge, no next charge.
11. End vs next boundary -> one committed ordering outcome.
12. Balance enough -> next ordinal starts once.
13. Balance insufficient -> no debit, one pause.
14. Concurrent last-credit starts -> one winner, no negative balance.
15. Low-balance threshold=2 -> one warning episode.
16. Threshold=0 -> no early warning, hard balance guard remains.
17. Inactivity -> reminder only, paid continues.
18. Explicit waiting -> no next ordinal.
19. Payment pending/failed -> pause unchanged.
20. Payment confirmed -> balance only, no auto-resume.
21. Explicit continue -> one next ordinal/debit.
22. Continue retry/two tabs -> one result.
23. Pause timeout vs top-up/continue -> one consistent outcome.
24. Second insufficiency -> terminal, no second pause.
25. Client reconnect before/after deadline -> resume/technical end.
26. Agent reconnect before/after deadline -> resume/technical end.
27. Disconnect during pause -> independent clocks, no reset.
28. Simultaneous disconnect -> one incident episode.
29. Platform outage -> no next minute, manual candidate only.
30. Debit response lost -> retry reads same result.
31. Worker restart -> no missing/duplicate ordinal.
32. Setting changed mid-clock -> old deadline retained.
33. Agent response/API does not expose exact balance.
34. Unauthorized settings/manual action denied.
35. Manual compensation success -> one grant and truthful client copy.
36. Manual compensation failure -> case open, no false success.
37. Completed readback reconciles minute results, ledger and total.
38. Late top-up/reconnect does not revive completed session.

## 26. Implementation handoff

Before code:

- mapped repository/build/commit;
- current source navigation and tracked status;
- reused/replaced parts;
- state/clock/financial ownership map;
- transaction/idempotency strategy;
- migration/config plan;
- test plan.

After code:

- exact changed files;
- migration/config notes;
- unit/integration/e2e results;
- clock recovery proof;
- debit/bucket/ledger reconciliation;
- concurrency/idempotency proof;
- role-positive/negative proof;
- admin version/readback;
- screenshots;
- known limits;
- rollback notes.

## 27. Definition of Done

Runtime G2.2 is ready only when:

- mapped build/commit is identified;
- server-authoritative trial/paid/pause/reconnect clocks work;
- each ordinal has exactly one debit;
- balance cannot become negative;
- one-pause and explicit-continuation rules pass;
- client/Agent/super-admin visibility passes;
- manual-only compensation boundary is proven;
- admin change/readback/version/rollback passes;
- restart/retry/concurrency tests pass;
- ledger/session/card totals reconcile;
- PM accepts the observable behavior.

## 28. Proof boundary

Current truthful status:

- product specification: ready;
- technical context: ready;
- local source slice: code-present, untracked/unmapped reference;
- HTML/DOCX: documentation artifacts;
- implementation: open;
- runtime acceptance: open.

## 29. Knowledge basis

- Owner-confirmed G2.2 clarification sequence dated 2026-07-28.
- O7/O8 owner decisions.
- `etalon-tz-g1-3-status-history.md`.
- `etalon-tz-g2-1-price-balance.md`.
- `tz-g2-billing-refunds-compensation.md`.
- `vertical-package-session-money.md`.
- `admin-panel-settings-development-package.md`.
- `expert-training-and-operational-knowledge.md`, used for source/reference boundary only.
- Local extracted Yii2 ServiceSession/RuntimeMeter/StateMachine source, used only as navigation and gap evidence.

## 30. Самооценка

| Критерий эталона ТЗ | Балл |
|---|---:|
| Q1. Цель и измеримый результат | 5/5 |
| Q2. Границы задачи и зависимости | 8/8 |
| Q3. Роли, права и видимость данных | 10/10 |
| Q4. Термины, сущности и источники истины | 7/7 |
| Q5. Пользовательские и административные сценарии | 12/12 |
| Q6. Бизнес-правила, расчеты и ограничения | 12/12 |
| Q7. Состояния, ошибки и пограничные случаи | 12/12 |
| Q8. Настройки админ-панели и их размещение | 8/8 |
| Q9. Уведомления, локализация и отображение | 6/6 |
| Q10. Acceptance criteria и тестовые примеры | 12/12 |
| Q11. Интеграции, данные, безопасность и audit | 5/5 |
| Q12. Definition of Done и граница доказательств | 3/3 |
| **Итого** | **100/100** |

100/100 означает полноту спецификации, а не готовность runtime.
