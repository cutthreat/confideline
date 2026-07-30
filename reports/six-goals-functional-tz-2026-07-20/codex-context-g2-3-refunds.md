# Технический контекст для Codex Игоря - G2.3

Этот файл передается агенту Codex вместе с `etalon-tz-g2-3-refunds.md`. Он задает integration contract, known source navigation и proof boundary. Он не заменяет анализ фактического repository/build и не навязывает Игорю конкретную архитектуру.

## 1. Паспорт задачи

Задача: `G2.3`.

Цель: реализовать отдельный session-linked refund process с client request, system/staff candidate, manual super-admin decision, exactly-once credit restoration, appeal, support linkage и audit.

Текущий source status:

`local_refund_slice_present_unmapped_and_product_contract_incompatible`

Specification completeness и runtime readiness оцениваются независимо.

## 2. Product invariants

1. Consultation terminal status never changes because of dispute/refund.
2. Refund case and support ticket are separate linked processes.
3. One active case per `session + problem identity`.
4. Different categories may produce linked cases.
5. Candidate never executes money.
6. Every actual refund requires super-admin confirmation.
7. Cumulative refund never exceeds eligible charges.
8. One logical execution produces one refund result.
9. Completed movements are immutable.
10. Corrections are append-only.
11. Client balance never becomes negative because of refund correction.
12. Cash package refund is a different payment-dispute route.
13. Compensation is not refund.
14. Agent cannot read refund/support details.
15. Policy changes never rewrite historical snapshots.

## 3. Scope

Implement or integrate:

- refund case lifecycle;
- candidate/request entry;
- duplicate active-case guard;
- category and evidence;
- eligibility calculation;
- no/partial/full decision;
- bucket restoration;
- execution idempotency;
- client appeal;
- client/admin readback;
- support/session/ledger links;
- admin settings;
- events and audit.

Do not implement under G2.3:

- paid-minute debit;
- consultation lifecycle changes;
- cash package refunds;
- provider chargebacks;
- compensation automation;
- support chat itself;
- quality/safety verdict engine;
- agent payout calculation.

## 4. Current source navigation

Verify against Igor's actual mapped repository/commit:

- `application/models/ServiceSessionRefundCase.php`
- `application/services/ServiceSessionRefundLedger.php`
- `application/migrations/m260615_235000_service_session_refund_ledger.php`
- `application/models/ServiceSessionLedgerEntry.php`
- `application/models/ServiceSession.php`
- `application/services/ServiceSessionStateMachine.php`
- `application/models/Balance.php`
- `application/models/BalanceTransaction.php`
- `application/managers/BalanceManager.php`
- `application/modules/admin/forms/BalanceUpdateForm.php`
- `application/modules/admin/services/MessageShellService.php`
- `application/modules/admin/views/message/index.php`

Support prototype reference:

- `web/qa-reports/nebula-support-ticket-audit-2026-07-13/source/support-ticket/SUPPORT_TICKET_UI_CONTRACT.md`
- `support-ticket-queue-final.html`
- `support-ticket-chat-final.html`

The prototype is frontend/workflow evidence only.

## 5. Known local incompatibilities

The local slice must not be accepted as-is:

1. `ServiceSession` contains `disputed/refunded` statuses, while accepted G1.3/G2.3 keeps consultation terminal and represents refund as linked process.
2. `ServiceSessionStateMachine` transitions ended -> disputed -> refunded/ended. This violates the product boundary.
3. Migration creates a unique index on `refund_case.session_id`, while accepted behavior permits separate linked cases for different categories.
4. Current case statuses cover only open/approved/rejected/resolved_without_refund and do not cover candidate, review, waiting client, execution, failure, appeal and closed.
5. Current service changes case and session before a proven atomic balance restoration.
6. Ledger append alone is not proof that client balance changed.
7. Default full refund amount uses session total and lacks remaining eligible/cumulative enforcement.
8. Partial refund, affected-minute selection and bucket restoration are not proven.
9. Decision idempotency and lost-worker recovery are not proven.
10. Client route, support link, settings page, appeal and role-safe readback are not mapped.

These are verification/change targets, not authorization to patch an unknown build blindly.

## 6. Conceptual records

### RefundCase

Minimum semantic fields:

- id/public ref;
- session id;
- support ticket id;
- category/problem identity;
- source: client/system/staff;
- candidate source id;
- opened by;
- client description;
- status;
- policy snapshot/version;
- claim deadline;
- decision deadline/clock;
- case revision;
- withdrawn metadata;
- created/updated/closed timestamps.

### RefundEvidence

- case id;
- evidence type;
- message/minute/incident/file ref;
- client/internal visibility;
- purpose;
- restricted storage ref;
- retention status;
- actor/time.

### RefundDecision

- case id/version;
- result no/partial/full;
- selected minute ordinals or exact credits;
- eligible/prior/remaining snapshots;
- calculated percentage/rounding;
- bucket restoration preview;
- agent correction preview;
- internal reason;
- client message;
- actor/time;
- status draft/confirmed/superseded.

### RefundExecution

- decision/version identity;
- idempotency key;
- requested amount;
- restored bucket allocation;
- balance transaction ids;
- status pending/succeeded/failed;
- attempt/readback metadata;
- committed timestamp.

### RefundAppeal

- case and decision version;
- client comment;
- deadline snapshot;
- status;
- reviewed by/time;
- resulting decision version.

## 7. Truth ownership

- G2.2 minute/debit ledger owns charged facts.
- G2.1 wallet/balance ledger owns actual credit movements and buckets.
- Refund case owns request/review/decision/execution references.
- Support owns conversation and general ticket lifecycle.
- G2.4 owns agent correction after successful refund.
- Notification delivery owns channel status.

No view/controller may recalculate authoritative money from UI totals.

## 8. Consultation boundary

Opening, approving, executing, appealing or closing a refund:

- does not mutate consultation terminal status;
- adds linked-process badges/readback;
- may append a non-lifecycle event/reference;
- never reopens paid/trial;
- never changes historical price or minutes.

Remove or bypass refund transitions in the consultation state machine.

## 9. Case identity and deduplication

Define a stable problem identity using at least:

`session_id + category + active_problem_key`.

Rules:

- same active identity returns existing case;
- retry/client nonce does not create a duplicate;
- different category creates a linked case;
- all cases share session cumulative ceiling;
- race is enforced server-side, not by UI lookup only.

## 10. Candidate intake

Candidate may be created by:

- G2.2 technical incident;
- incorrect/duplicate debit anomaly;
- quality/safety verdict;
- reconciliation;
- manual super-admin action.

Candidate creation must be idempotent against source identity, for example:

`source_type + source_id + category`.

Candidate does not create decision/execution or client promise.

## 11. Client request intake

Server must verify:

- current client owns session;
- session is eligible/terminal;
- claim deadline;
- category and description;
- active duplicate identity;
- attachment/evidence policy;
- support linkage.

Entry from consultation binds the session server-side. Never trust a hidden client-supplied foreign session id.

## 12. Claim window

Default: 30 calendar days after session completion.

Store:

- rule/version;
- completed_at basis;
- calculated deadline;
- exception actor/reason when objective correction is opened after deadline.

Policy updates apply prospectively and do not shorten an already open case.

## 13. Decision SLA

Default: 72 hours from complete evidence.

Clock:

- starts/restarts only from server-confirmed complete evidence;
- pauses in waiting_client;
- resumes with remaining duration;
- stores applied setting version;
- breach creates escalation, not refund.

## 14. Case lifecycle

Accepted statuses:

`candidate`
`requested`
`under_review`
`waiting_client`
`decision_ready`
`approved`
`declined`
`execution_pending`
`completed`
`execution_failed`
`appealed`
`closed`

Define explicit transition guards. Support status is not derived by replacing refund status; store/link both and reconcile allowed combinations.

## 15. Eligibility engine

Input:

- committed paid-minute debits;
- bucket allocations;
- category rule;
- affected minute/incident facts;
- prior refund/correction executions.

Output:

- eligible charges;
- exclusions with reasons;
- prior returned;
- remaining refundable;
- allowed result range;
- preview version.

Trial and compensation movements are excluded from session charges.

## 16. Decision calculation

No refund:

- no money movement;
- reason and client message required.

Partial:

- select minute ordinals or exact credits;
- compute percent for readback;
- amount <= remaining;
- rounding uses policy snapshot.

Full:

- amount = remaining eligible within selected base;
- never session gross total blindly.

All calculations are repeated/validated inside confirm transaction or against a locked/versioned snapshot.

## 17. Bucket restoration

Reverse the actual debit allocation:

- purchased portion -> purchased bucket, no expiry;
- bonus portion -> corresponding bonus/source bucket;
- preserve campaign/source;
- expiry = max(original expiry, execution time + configured minimum grace) when original expiry is expired or shorter than grace;
- default minimum grace = 30 days.

One logical refund may create multiple internal bucket credits, but their shared execution identity must reconcile to one total.

## 18. Manual approval

Only `super-admin` in MVP.

Server-side permission guard is mandatory for:

- policy save/activate;
- decision confirm;
- execution/retry;
- appeal outcome;
- correction.

UI hiding is not access control.

## 19. Atomic execution

The financial unit must atomically or recoverably bind:

1. locked case/decision revision;
2. fresh remaining eligible check;
3. execution identity claim;
4. wallet/bucket restoration;
5. balance transaction records;
6. refund execution success;
7. case status projection;
8. outbox/events.

If full cross-component atomicity is impossible, use a recoverable saga/outbox with deterministic reconciliation and no duplicate credits.

## 20. Idempotency

Recommended logical identity:

`refund_case_id + confirmed_decision_version`.

Guarantees:

- double click/retry -> same execution result;
- timeout after commit -> readback existing result;
- worker retry -> no second balance grant;
- concurrent confirms -> one winner, other gets current revision/result;
- appeal creates a new decision version and only a remaining delta may execute.

## 21. Execution failure

On wallet/dependency failure:

- case becomes execution_failed;
- decision remains recorded;
- no success message;
- no agent correction;
- safe retry uses same execution identity;
- support stays actionable;
- reconciliation detects committed wallet movement with stale case state.

Email failure after successful financial commit is a notification failure, not execution rollback.

## 22. Withdrawal

Client withdrawal before decision:

- append withdrawal event;
- do not delete case/evidence;
- block ordinary client path;
- allow objective technical/incorrect-debit candidate to continue internally;
- never reverse a completed financial result.

## 23. Appeal

Default: one appeal within 7 days.

Appeal:

- requires client comment;
- references original decision version;
- is reviewed by super-admin;
- preserves original history;
- produces a new decision version;
- may execute only allowed remaining delta;
- never silently removes already returned credits.

Second client appeal is rejected with safe explanation.

## 24. Completed-refund correction

Never update/delete the original execution.

Create a separate privileged correction:

- reason/evidence;
- actor/time;
- original execution link;
- amount and direction;
- preview;
- balance safety guard;
- no hidden negative balance;
- client-facing explanation when client balance changes.

## 25. Admin integration

Configuration page:

- parent list: `/ru/admin/settings/index`;
- label: `Настройки возвратов`;
- route: `/ru/admin/settings/refunds`;
- placement: after `Настройки цен`, before `Group settings`.

Do not create a second settings owner under Support or Finance.

Operational case surfaces:

- linked support ticket;
- consultation admin card;
- protected refund case/block;
- balance transaction/ledger readback.

Settings page is never a case queue.

## 26. Settings contract

G2.3-managed defaults:

- claim window 30 days;
- decision target 72 hours;
- appeal window 7 days;
- bonus refund-use grace 30 days;
- cumulative ceiling 100%;
- full/proportional factors;
- category/evidence/text rules;
- rounding.

Every field needs unit, min/max, 0/unset semantics, validation, preview, draft/active version, effective time, reason, audit and rollback by new version.

Protected invariants cannot be disabled by ordinary toggles.

## 27. Role and privacy contract

Client API/view:

- only own safe case data;
- no internal notes/codes/Agent identity/correction/fraud evidence.

Agent/Expert:

- no refund/support case data or exact amounts.

Super-admin:

- full authorized case/decision/execution/audit.

Evidence storage:

- purpose-bound;
- restricted;
- audited staff views;
- retention/hold-aware.

## 28. Event and outbox contract

Minimum events:

- refund_candidate_created;
- refund_requested;
- refund_case_updated;
- refund_waiting_client;
- refund_decision_ready;
- refund_decided;
- refund_execution_started;
- refund_completed;
- refund_execution_failed;
- refund_withdrawn;
- refund_appealed;
- refund_closed;
- refund_corrected.

Each event carries stable business identity, session/case refs, actor type, occurred_at, policy/decision versions and privacy-safe payload.

## 29. Acceptance matrix

1. Own session request accepted.
2. Foreign session request denied.
3. Same category retry returns same active case.
4. Different category creates linked case.
5. Candidate is idempotent by source.
6. Candidate does not move credits.
7. Expired ordinary claim denied.
8. Objective debit error may create protected candidate.
9. Waiting client pauses SLA.
10. Response resumes remaining SLA.
11. No-refund creates no balance transaction.
12. Partial by minutes matches debit ordinals.
13. Partial by credits calculates percent.
14. Full uses remaining eligible, not gross.
15. Trial excluded.
16. Compensation excluded.
17. Purchased bucket restored without expiry.
18. Bonus bucket source restored.
19. Expired bonus gets 30-day grace.
20. Cumulative >100% blocked.
21. Concurrent partial decisions do not over-refund.
22. Double confirm creates one execution.
23. Lost response after commit reads existing execution.
24. Wallet failure -> execution_failed/open action.
25. Retry after failure does not duplicate.
26. Success precedes agent correction event.
27. Notification failure does not roll back money.
28. Client sees safe completed result.
29. Agent cannot read case.
30. Unauthorized admin confirm denied.
31. Withdraw before decision recorded.
32. Withdraw cannot cancel protected correction.
33. Appeal once within 7 days accepted.
34. Second appeal denied.
35. Appeal preserves original decision.
36. Completed execution immutable.
37. Correction append-only and balance-safe.
38. Cash package refund routed separately.
39. Consultation terminal status unchanged.
40. Support/refund statuses reconcile without replacement.
41. Policy update preserves case snapshot.
42. Stale revision returns conflict/current readback.

## 30. Implementation handoff and DoD

Before changes:

- identify actual mapped repo/build/commit;
- map current support, session, wallet, admin settings and notification owners;
- document schema/route changes and compatibility;
- remove product-incompatible session refund statuses/transitions safely;
- define migration/backfill/rollback.

Runtime DoD requires:

- server-side ownership/RBAC proof;
- request/candidate dedup;
- separate case lifecycle;
- eligibility/cumulative enforcement;
- atomic/recoverable exactly-once balance restoration;
- source bucket/grace correctness;
- appeal and immutable history;
- support/session/ledger/correction reconciliation;
- admin version/readback;
- positive/negative/concurrency tests;
- mapped build/commit and deployment proof.

Documents, static HTML, local untracked code and support prototype are not runtime proof.

## 31. Knowledge basis

- Owner-confirmed G2.3 decisions dated 2026-07-28.
- `etalon-tz-g2-3-refunds.md`.
- `etalon-tz-g2-1-price-balance.md`.
- `etalon-tz-g2-2-timer-debit-pause.md`.
- `etalon-tz-g1-3-status-history.md`.
- `tz-g4-support-disputes-rules.md`.
- `admin-panel-settings-development-package.md`.
- Support-ticket UI contract and functional audit.
- Local Yii2 slice is code-present/unmapped navigation, not accepted runtime.

## 32. Самооценка

| Критерий | Балл |
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

100/100 означает полноту спецификации, а не готовность implementation/runtime.
