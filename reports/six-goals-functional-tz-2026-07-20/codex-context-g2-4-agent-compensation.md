# Технический контекст для Codex Игоря - G2.4

Этот файл передается агенту Codex вместе с `etalon-tz-g2-4-agent-compensation.md`. Product behavior из PM-ТЗ обязателен; имена классов, таблиц, endpoints и способ миграции определяются после mapping реального build.

## 1. Паспорт задачи

- Task: G2.4 Agent compensation.
- Product source: `etalon-tz-g2-4-agent-compensation.md`.
- Priority: P1.
- Specification status: `spec_handoff_ready`.
- Implementation/runtime status: `open`.
- Pilot scope: consultation percentage active; fixed/SLA and additional-task pay disabled.
- Initial access: super-admin only.

## 2. Product invariants

1. One completed consultation produces at most one original consultation accrual.
2. Accrual requires service session, expert profile, historical actual Agent and immutable policy snapshot.
3. Compensation ledger is not client balance.
4. Public Expert metrics are not internal Agent compensation.
5. Reassignment never rewrites historical attribution.
6. Refund creates append-only negative correction.
7. Closed/paid period is immutable.
8. Legacy partner spending does not reduce compensation.
9. Automated bank payout is out of MVP.
10. Every variable/numeric parameter is admin-managed and versioned.

## 3. Scope

Implement:

- consultation accrual creation after terminal session completion;
- credit-source eligibility;
- percentage and conversion calculation;
- hold/review;
- weekly periods;
- negative corrections;
- manual payout record;
- admin policy lifecycle;
- aggregate Finance page;
- extensions of existing partner payments/payouts/minus/payment-info;
- idempotency, audit, RBAC and reconciliation.

Do not implement:

- client package purchase;
- minute debit engine;
- refund decision engine;
- automatic bank/payroll transfer;
- taxes/contracts/accounting outside the platform;
- public Expert compensation display;
- active fixed/SLA or task pay.

## 4. Live admin facts verified 2026-07-28

Authenticated live navigation confirmed:

| Existing route | Current role |
|---|---|
| `/ru/admin/partner/payment-info?id={id}` | Partner payout details |
| `/ru/admin/partner/payments?id={id}` | Positive partner transactions/accruals |
| `/ru/admin/partner/payouts?id={id}` | Payout list with Plan/Fact, reward, amount, payout date and type |
| `/ru/admin/partner/payments?id={id}&mode=minus` | Negative partner transactions/legacy spending |
| `/ru/admin/partner/update-balance?id={id}` | Legacy platform balance adjustment |

Observed live behavior:

- positive table contains ID, user, code, amount, pre-operation balance, date and description;
- payout table already exposes Plan/Fact and payout-related columns;
- minus table currently includes premium, gifts, spotlight, groups and other platform spending;
- payment-info already owns payout methods/details;
- partner card navigation already links all four surfaces.

These are current UI/runtime facts, not proof of underlying source shape.

## 5. Current source boundary

The available extracted YouDate source contains generic balance/payment primitives, but the live partner payments/payouts extensions are not fully mapped in that extracted source.

Before changes:

1. Locate actual runtime repository/build.
2. Map PartnerController/actions for payments, payouts and payment-info.
3. Map positive/minus ledger model and payout model.
4. Map permissions and partner card navigation.
5. Map service session, debit, refund and assignment sources.
6. Produce a short reuse/migration note.

Do not infer current database ownership only from route names or HTML columns.

## 6. Conceptual records

Names below are conceptual, not mandatory class/table names.

### CompensationPolicy

Required facts:

- id/version/state;
- effective date/timezone;
- scope type and scope id;
- consultation component active;
- percentage;
- per-source inclusion toggles;
- payout currency;
- conversion rate;
- hold duration;
- period type/boundary;
- rounding/precision;
- correction behavior;
- fixed/SLA state;
- task-pay state;
- permissions/approval mode;
- created/activated/retired actor and reason.

### SessionAccrual

Required facts:

- stable accrual id;
- session id;
- expert profile id;
- actual Agent id;
- terminal completion event id;
- started-minute/debit references;
- source bucket breakdown;
- eligible credits;
- percentage;
- compensation credits;
- currency/rate snapshot;
- precise and display amounts;
- hold deadline;
- policy snapshot/version;
- status and reason;
- created/updated timestamps.

### AccrualCorrection

Required facts:

- correction id;
- original accrual id;
- refund/manual source id;
- affected debit/minutes/credits;
- correction percentage/rate snapshot;
- compensation-credit amount;
- currency amount;
- reason/evidence;
- target period;
- status;
- created by/at.

### CompensationPeriod

Required facts:

- period id;
- start/end/timezone;
- state;
- policy boundary;
- totals by Agent;
- hold/review/correction totals;
- reconciliation result;
- close actor/time/reason.

### AgentPayout

Required facts:

- Agent id;
- period id;
- planned amount;
- corrections;
- final payable;
- actual paid amount/currency;
- payout date;
- payment method reference;
- external/manual reference;
- comment;
- status;
- confirm actor/time;
- idempotency key.

## 7. Truth ownership

- Session completion and actual Agent: G1.1/G1.3/G6.1 service-session truth.
- Started-minute debit and credit source: G2.1/G2.2 financial ledger.
- Refund execution: G2.3 immutable refund movement.
- Compensation policy: G2.4 versioned policy store.
- Accrual/correction: G2.4 append-only compensation ledger.
- Payout details: existing partner payment-info.
- Manual payout result: existing payout contour extended by G2.4.

No projection may become a competing source of truth.

## 8. Policy precedence

Resolve effective rule in this order:

1. individual Agent override;
2. Agent group override;
3. global default.

The resolved snapshot must include:

- winning rule id/version;
- scope chain considered;
- effective time;
- exact fields used;
- rejected/missing conflicts.

No field-by-field merge of unrelated active rules unless explicitly modeled and previewed.

## 9. Initial policy

```text
consultation.active = true
consultation.percentage = 30
source.purchased = true
source.welcome = true
source.trial = true
source.promo = true
source.compensation = true
source.refunded = false
source.erroneous = false
source.reversed = false
currency = USD
conversion_rate = 0.1665
hold_days = 7
period = weekly
week_start = Monday
payout_execution = manual
fixed_sla.active = false
task_pay.active = false
```

All values are admin configuration, not code constants.

## 10. Credit-source eligibility

The calculation input must retain source-lot attribution from the debit ledger.

Each supported source has an independent policy toggle:

- purchased;
- welcome;
- trial;
- promo;
- compensation.

Mandatory exclusions:

- refunded;
- erroneous;
- reversed;
- duplicate.

Unknown/unmapped source:

- does not enter payable base;
- records a configuration incident;
- remains visible in preview/reconciliation;
- cannot be silently treated as purchased or zero.

## 11. Accrual formula

```text
eligible_credits =
  sum(debited credit lots whose source toggle is enabled)
  - already reversed/refunded eligible lots

compensation_credits =
  eligible_credits * percentage / 100

precise_currency_amount =
  compensation_credits * conversion_rate
```

Keep sufficient internal decimal precision. Round the period monetary output using the snapshotted rounding rule. Default display currency precision is 2.

Never derive historical amounts from current price package, current percentage or current conversion rate.

## 12. Accrual trigger

Trigger only from accepted terminal completion truth.

Preconditions:

- session exists;
- completion is terminal and valid;
- actual Agent exists;
- expert profile exists;
- debit/trial usage is finalized;
- effective policy resolves successfully;
- completion idempotency key is not processed.

Recommended idempotency identity:

`consultation_component + session_id + terminal_completion_revision`.

Implementation may choose another stable key with equivalent semantics.

## 13. No-policy behavior

Missing/invalid active policy must not create a hidden zero result.

Required behavior:

- persist unresolved session-ledger candidate;
- create configuration incident;
- expose reason to super-admin;
- exclude from payout;
- allow deterministic recalculation only through explicit recovery with audit.

Retroactive policy activation is prohibited. Recovery must snapshot an explicitly selected rule and reason.

## 14. Hold lifecycle

At creation:

- accrual calculated;
- `hold_deadline = completed_at + snapshotted hold duration`;
- status `pending_hold`.

After deadline:

- if no blocking review, mark `eligible`;
- if review exists, mark `under_review` with reason/reference;
- once review closes, route to first open eligible period.

Policy change during hold does not change the existing deadline or formula.

## 15. Review holds

Supported references:

- refund case;
- payment incident;
- quality review;
- safety/fraud review;
- manual super-admin hold.

Hold scope is the affected accrual only unless a separate Agent-level suspension rule explicitly exists. Do not freeze unrelated earnings by implication.

Manual hold/release requires:

- actor;
- reason;
- reference/evidence;
- old/new preview;
- timestamp.

## 16. Weekly period

Default:

- Monday 00:00 through Sunday 23:59;
- configured timezone;
- system-created;
- manually closed.

Accrual selection:

- hold expired before cutoff;
- not under blocking review;
- not already assigned to a closed/paid period;
- valid attribution and policy snapshot.

Changing weekly/monthly/daily mode applies only to new periods. Existing boundaries are immutable.

## 17. Period state

Minimum states:

- open;
- review;
- ready_to_pay;
- partially_paid, if supported;
- paid;
- corrected;
- closed_with_issue.

State naming may follow current project conventions, but behavior must preserve:

- no silent close with mismatch;
- one close result under concurrency;
- immutable paid period;
- linked future adjustments.

## 18. Refund correction

Consume only completed G2.3 refund execution.

Correction basis:

- attributable refunded eligible credits;
- source eligibility from original policy snapshot;
- original percentage;
- original conversion snapshot unless owner-approved policy explicitly specifies another correction rule.

The correction must link:

- refund movement;
- refund case;
- original accrual;
- session;
- Agent;
- target period.

Idempotency identity should include stable refund execution and original accrual identity.

## 19. Correction before payout

If target period is open:

- append correction;
- recalculate planned/final period totals;
- retain original accrual;
- show reason and refund linkage.

If original accrual is still on hold:

- correction may reduce it to zero;
- both records remain visible;
- do not delete the original.

## 20. Correction after payout

Never mutate historical payout.

Required behavior:

- create negative correction;
- carry it to next permitted open period;
- display source paid period;
- do not initiate external debit;
- keep unresolved remainder visible if future earnings are insufficient.

Do not allow cumulative negative correction beyond attributable original accrual. Excess is a manual-review incident.

## 21. Legacy minus separation

Current live minus list includes non-compensation spending.

Add an explicit classification contract:

- `compensation_refund_correction`;
- `compensation_manual_correction`;
- `compensation_rule_deduction`;
- `legacy_partner_balance_spend`.

Only the first three may enter compensation totals. Existing premium/gift/spotlight/group records remain legacy balance facts.

Migration or backfill must not reclassify legacy records as salary deductions without explicit evidence.

## 22. Manual correction

Required authorization: super-admin in MVP.

Required input:

- Agent;
- original accrual/period;
- category;
- signed amount and unit;
- reason;
- evidence/reference;
- idempotency token;
- preview.

Append-only. A correction of a correction is a new linked event.

## 23. Manual payout

The system records a payout; it does not send money.

Required confirm input:

- period;
- Agent;
- planned amount;
- corrections;
- final payable;
- actual amount;
- currency;
- payout date;
- method selected from current payment-info where applicable;
- external/manual reference;
- optional comment;
- idempotency token.

No external payment provider call should be reachable from this MVP action.

## 24. Existing admin integration

### Partner payments

Extend current positive ledger projection with consultation-compensation fields and filters. Preserve legacy records.

### Partner payouts

Extend current payout list and detail with period, breakdown, corrections, final amount, method/reference and status.

### Partner minus

Add classification/filter and compensation-only totals. Preserve current legacy balance spend.

### Partner payment-info

Reuse as payout-method owner. Do not duplicate sensitive payout fields into compensation settings or reports.

### Partner update-balance

Keep as legacy balance operation. It must not create compensation accrual/correction unless an explicit G2.4 action and reference exist.

## 25. New admin routes

Operational aggregate:

`/ru/admin/agent-compensation/index`

Configuration:

`/ru/admin/settings/agent-compensation`

The operational route belongs to Finance. The settings route belongs to the existing settings list.

Do not place live accrual/payout queues inside the settings page.

## 26. RBAC and privacy

Initial permissions:

- super-admin: all management/read actions;
- Agent/Expert/Client: denied.

Prepare separate future capabilities:

- compensation.read.all;
- compensation.read.own;
- compensation.policy.manage;
- compensation.hold.manage;
- compensation.correction.create;
- compensation.period.close;
- compensation.payout.mark_paid;
- compensation.export.

Backend scope must enforce own-Agent visibility independently of menu visibility.

Do not expose:

- client exact balance;
- client contact/payment data;
- support/safety evidence;
- other Agents' rates;
- masked payout details beyond authorized need.

## 27. Events and outbox

Suggested semantic events:

- consultation_accrual_created;
- consultation_accrual_configuration_failed;
- accrual_hold_expired;
- accrual_review_started;
- accrual_became_eligible;
- accrual_correction_created;
- compensation_period_opened;
- compensation_period_ready;
- compensation_period_closed;
- agent_payout_marked_paid;
- compensation_reconciliation_failed.

Retry must be safe. Notifications/analytics consume events without creating financial truth.

## 28. Concurrency controls

Required cases:

- duplicate completion;
- completion concurrent with refund;
- policy activation concurrent with completion;
- reassignment concurrent with completion;
- duplicate refund execution;
- two period-close actions;
- two payout confirmations;
- payout confirm concurrent with late correction.

Use transaction/locking/version checks appropriate to the actual stack. Product result must be one stable accrual/correction/payout and explicit stale-action feedback.

## 29. Reconciliation

For each period prove:

```text
sum(eligible original accruals)
+ sum(enabled fixed/SLA, currently zero)
+ sum(enabled task pay, currently zero)
- sum(negative corrections)
= planned payable

planned payable
vs actual payout
= reconciliation state
```

Mismatch blocks clean close and creates one visible incident.

## 30. Acceptance matrix

| ID | Scenario | Expected |
|---|---|---|
| AC01 | Paid session completed | One accrual for historical actual Agent |
| AC02 | 300 credits, 30% | 90 compensation credits |
| AC03 | Rate 0.1665 | Reproducible precise/USD display amount |
| AC04 | Purchased enabled | Purchased debit included |
| AC05 | Trial disabled | Trial debit/usage excluded with explanation |
| AC06 | Promo toggled after session | Existing snapshot unchanged |
| AC07 | Unknown source | Excluded fail-closed, incident visible |
| AC08 | Duplicate completion | No second accrual |
| AC09 | Reassignment after session | Historical Agent unchanged |
| AC10 | Missing Agent | No payout, incident visible |
| AC11 | Seven-day hold | Not payable before deadline |
| AC12 | Hold expires | Enters first open eligible period |
| AC13 | Refund review open | Only affected accrual held |
| AC14 | Partial refund before payout | One proportional correction |
| AC15 | Full refund before payout | Original retained, net may become zero |
| AC16 | Refund after payout | Future-period carry-forward |
| AC17 | Duplicate refund event | No duplicate correction |
| AC18 | Correction exceeds original | Blocked/manual review |
| AC19 | Legacy premium spend | Does not reduce compensation |
| AC20 | Weekly boundary/timezone | Period selection reproducible |
| AC21 | Policy changes mid-period | Existing snapshots unchanged |
| AC22 | Concurrent period close | One close result |
| AC23 | Manual paid record | Requires amount/date/method/reference |
| AC24 | Double paid confirm | One payout record |
| AC25 | Paid period correction | Historical payout immutable |
| AC26 | Fixed/SLA disabled | Zero hidden accrual/debt |
| AC27 | Task pay disabled | No task accrual |
| AC28 | Unauthorized Agent access | Backend denial |
| AC29 | Settings route | Policy only, no operational queue |
| AC30 | Finance aggregate | Totals reconcile to partner detail |
| AC31 | Payment-info reuse | No duplicate payout-detail owner |
| AC32 | Missing/invalid policy | Candidate/incident, no hidden zero |
| AC33 | Manual correction without reason | Rejected |
| AC34 | No external payout integration | Mark-paid causes no provider call |

## 31. Implementation handoff and DoD

Before code:

- actual build/repository mapped;
- existing partner models/actions identified;
- service-session/debit/refund/assignment owners identified;
- reuse vs new storage decision documented;
- migration/backfill risk reviewed.

Implementation proof:

- build and commit reference;
- schema/config/readback evidence;
- route mapping;
- RBAC positive/negative proof;
- AC01-AC34 results;
- idempotency/concurrency proof;
- period reconciliation;
- live admin screenshots;
- no external payout call proof;
- rollback/migration note;
- known limitations.

Do not claim runtime ready from static documents, source presence, migrations, HTTP 200 or screenshots alone.

## 32. Knowledge basis

- `etalon-tz-g2-4-agent-compensation.md`.
- `tz-g2-billing-refunds-compensation.md`.
- `vertical-package-session-money.md`.
- `admin-panel-settings-development-package.md`.
- `owner-decisions.md`.
- `etalon-tz-g2-3-refunds.md`.
- Live authenticated admin pages verified 2026-07-28.

## 33. Самооценка

- Product logic: complete for accepted pilot model.
- Admin placement: aligned with existing Finance, Settings and Partner surfaces.
- Economic defaults: owner-confirmed and admin-managed.
- Source mapping: required from Igor's actual runtime build.
- Runtime proof: open.
