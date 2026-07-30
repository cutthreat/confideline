# Контекст для Codex Игоря — G2.4 «Начисления и вознаграждение Агентов»

## 1. Паспорт задачи

- Task ID: `G2.4`
- Phase: `pilot financial backbone`
- Priority: `P0`; session-linked consultation accrual обязателен до расчёта pilot settlement
- Product artifact: `etalon-tz-g2-4-agent-accruals.md`
- Spec completeness: `100`
- Owner/economics closure: functional contract closed; initial percentage/exact eligible base `unset`
- Implementation status: `code_present_unmapped`
- Runtime acceptance: `not_run`
- Product owner: Product Owner / Project Manager Nebula
- Roles: Agent, expert profile, super-admin; moderator only by later permission

Этот файл передаётся вместе с PM-ТЗ. PM-ТЗ определяет желаемое продуктовое поведение; этот файл объясняет интеграционные границы, данные, отрицательные сценарии и proof. Архитектуру и конкретную реализацию выбирает Игорь.

## 2. Краткий контекст

В текущем продукте есть общий финансовый контур партнёра: начисления, выплаты и отрицательные операции. Это полезная основа, но она не доказывает G2.4.

Новая product truth:

`service session -> actual Agent snapshot -> active compensation policy snapshot -> accrual -> successful refund -> append-only correction -> weekly payout linkage -> audit`.

Public expert profile и internal Agent являются разными объектами. Клиент покупает консультацию у публичного Эксперта; внутреннее вознаграждение относится к фактическому Агенту, который провёл session.

## 3. Результат

На идентифицируемом build каждая eligible completed consultation:

1. создаёт один объяснимый session ledger fact;
2. при active complete rule создаёт один monetary accrual;
3. хранит actual Agent и immutable rule/conversion snapshot;
4. попадает в управляемый weekly period;
5. после успешного refund получает exactly-once negative correction;
6. отображается на существующих partner payment/payout/minus surfaces;
7. не раскрывает клиентские private data;
8. воспроизводится через persisted readback и audit.

## 4. Термины

- `service session` — одна принятая consultation G1.1/G1.3.
- `actual Agent` — внутренний actor/assignment snapshot конкретной session.
- `expert profile` — публичная анкета, не получатель внутренней compensation.
- `component` — в MVP только consultation; fixed/SLA и additional task зарезервированы в post-MVP backlog.
- `policy` — versioned configuration одного component.
- `eligible base` — explicitly allowed input amount/units.
- `accrual` — внутренний calculation result, не payout.
- `correction` — append-only adjustment к исходному accrual.
- `period` — per-session/daily/weekly/monthly calculation window.
- `payout` — существующий отдельный процесс фактической выплаты.
- `hold` — временное исключение из payout с reason/owner/review.
- `snapshot` — неизменяемые policy inputs конкретного результата.

## 5. Scope

### In scope P0 MVP

- consultation session ledger facts;
- actual Agent attribution;
- consultation component;
- policy draft/activation/retirement;
- weekly default;
- percentage/rate/base/limits/rounding;
- conversion snapshot;
- scopes and overrides;
- calculation preview;
- accrual states;
- refund-triggered correction;
- closed-period adjustment;
- existing partner surface integration;
- role-safe readback;
- idempotency/concurrency;
- audit, versioning and rollback-by-new-version;
- reconciliation/export proof.

Fixed/SLA pay, additional-task pay и автоматическая внешняя выплата находятся в `post-mvp-backlog-2026-07-29.md`. В MVP обязательны только отсутствие их скрытых сумм и отсутствие зависимости consultation accrual от этих расширений.

### Not in scope MVP

- client price and debit calculation;
- balance credit restoration;
- refund decision/evidence;
- assignment workflow;
- public rating;
- payroll/tax engine;
- automatic external payout;
- bank/provider integration;
- KPI/QA formula ownership;
- exact initial consultation percentage/base economics.
- active fixed/SLA or additional-task calculation;
- automatic payout.

### Dependencies

- G1.1/G1.3: session identity, completion and actual Agent snapshot;
- G2.1: units/credits and financial movement lineage;
- G2.2: minute ordinals and debits;
- G2.3: successful immutable refund execution;
- G5/G6 SLA/QA/shift facts не потребляются consultation component в MVP;
- existing permissions and partner finance surfaces.

## 6. Роли и доступ

| Role | Allowed | Forbidden |
|---|---|---|
| Client | none of internal compensation | Agent identity, rate, amount, payout |
| Expert profile | used as historical source dimension | own internal financial authority |
| Agent | own safe breakdown and payout linkage | foreign data, own rate/override/approve, client balance/evidence |
| Moderator | no access by default | implicit financial access |
| Super-admin | configuration, preview, calculate, hold/release, approve/override, correction, payout linkage, audit | delete/rewrite completed financial history |
| System | deterministic calculation from active snapshots | invent missing values, cross-role access, duplicate result |

Every read and action must repeat server-side permission and ownership checks. UI hiding is insufficient.

## 7. Preconditions и triggers

### Consultation fact trigger

`session completed` with:

- stable session identity;
- actual Agent snapshot;
- expert profile snapshot;
- paid-minute/debit lineage;
- terminal fact;
- one logical completion identity.

This always produces at most one session ledger fact.

### Monetary calculation trigger

Requires:

- applicable active consultation policy;
- percentage/rate set;
- eligible base fully defined;
- allowed session/debit categories;
- valid currency/conversion if needed;
- open applicable period;
- no prior successful calculation for the same logical identity.

Missing required value gives `configuration_pending`; it never silently supplies zero, competitor default or stale rule.

### Correction trigger

Only a successful G2.3 refund movement with stable execution identity may trigger correction. Candidate, requested, approved-but-not-executed or failed refund does not change Agent compensation.

## 8. Invariants

1. One session/component/policy application -> maximum one original accrual.
2. One refund execution/original accrual -> maximum one logical correction.
3. Actual Agent comes from session history, never current profile assignment.
4. Policy, rate, base, currency, conversion and period are snapshot.
5. `unset`, `0`, `disabled`, `pending`, `held` and `no_data` are distinct.
6. Disabled component produces no amount.
7. Missing base/category/conversion is fail-closed.
8. Accrual is not payout.
9. Correction is append-only.
10. Cumulative correction cannot silently exceed attributable accrual.
11. Closed/settled period is never rewritten.
12. Refund does not affect unrelated components without an active explicit rule.
13. Retry/concurrency does not duplicate amount, event or payout linkage.
14. Override requires old/new, reason, actor and permission.
15. Agent cannot change or approve own compensation.
16. Private client/support/refund evidence remains inaccessible to Agent.
17. Historical result remains reproducible after configuration/assignment changes.
18. External payout remains manual/separate in MVP.

## 9. Состояния и переходы

### Accrual state

| From | Trigger | Guards | To/result |
|---|---|---|---|
| none | completed session fact | stable identity | recorded |
| recorded | calculate | full active config | calculated |
| recorded | calculate | required config missing | configuration_pending |
| configuration_pending | new active complete version | session still eligible | calculated |
| calculated | hold | authorized reason | held |
| held | release | issue resolved | calculated |
| calculated | payout eligibility check | all guards pass | eligible_for_payout |
| eligible_for_payout | payout batch includes row | one active linkage | included_in_payout |
| included_in_payout | payout confirms | immutable payout fact | settled |
| calculated/eligible/settled | successful refund | attributable amount exists | correction linked; original unchanged |

### Forbidden transitions

- configuration_pending -> settled;
- disabled component -> calculated;
- Agent direct -> approved/settled/override;
- settled -> deleted/recalculated in place;
- failed refund -> corrected;
- current reassignment -> historical recipient changed;
- old rule edit -> historical amount changed.

### Correction state

`pending -> calculated -> approved -> included_in_adjustment -> settled`

Any operational error may produce `failed`, with safe retry against the same logical identity. Failed does not create a second correction on retry.

## 10. Functional scenarios

### S1. Session record with unset policy

Completion is persisted with session, profile, actual Agent and debit lineage. Consultation component becomes `configuration_pending`; no amount or payout promise is created.

### S2. Consultation accrual

Active rule is selected by explicit priority:

1. individual Agent override;
2. Agent group;
3. global.

System captures policy/base/rate/conversion/rounding/period, calculates one amount and stores a readable breakdown.

### S3. Several profiles of one Agent

Each session keeps its own profile and session row. Weekly Agent breakdown aggregates eligible rows without losing source links.

### S4. Reassignment

New sessions use the new actual Agent. Old sessions, accruals, corrections and payout links retain the old Agent snapshot.

### S5. Weekly close

Default period is weekly. Preview lists eligible, held, pending and corrected rows. Only eligible approved rows enter the existing payout process. Close stores one versioned breakdown.

### S6. Full refund

After successful G2.3 execution, use the original accrual snapshot and attributable eligible amount to create one negative correction. If the period is already settled, link the correction to an allowed later adjustment period.

### S7. Partial refund

Use actual refunded eligible part. Calculate proportional correction. A permitted case override stores original/final calculation, reason and actor.

### S8. Fixed/SLA

Post-MVP. В текущем P0-срезе любые входы не создают сумму и не блокируют consultation ledger/accrual.

### S9. Additional task

Post-MVP. В текущем P0-срезе evidence не создаёт task pay и не блокирует consultation ledger/accrual.

### S10. Payout failure

Existing payout process reports failure. Accrual stays unpaid/included according to factual state; no settled marker or success copy is created.

## 11. Data contract

Exact storage design is Igor's decision. The implementation must preserve these product records.

### Compensation policy/version

- component;
- status draft/active/retired;
- rate/percentage and unit;
- eligible-base rules;
- source credit/debit treatment;
- payout/readback currency;
- conversion rule;
- precision/rounding;
- period/timezone;
- global/group/Agent scope and priority;
- min/max/caps;
- allowed/excluded session states;
- correction behavior;
- permissions/approval;
- effective from/to;
- author/reason/version.

### Session compensation fact

- session;
- expert profile;
- actual Agent and assignment snapshot;
- completion identity/time;
- minute/debit lineage;
- eligibility input;
- linked consultation calculation;
- current safe status.

### Accrual result

- logical identity;
- session/period/component;
- policy snapshot;
- eligible base;
- rate/percentage;
- conversion snapshot;
- calculated amount/currency;
- status;
- hold;
- payout linkage;
- created/calculated/approved actors and times.

### Correction

- logical correction identity;
- original accrual;
- refund execution;
- attributable amount;
- original and final preview;
- amount/currency;
- adjustment period;
- status;
- override reason/actor;
- audit.

### Period

- type;
- timezone;
- start/end/close;
- active version;
- consultation totals;
- held/pending/eligible rows;
- payout linkage;
- closed actor/time.

## 12. Truth ownership and snapshots

| Fact | Owner | Snapshot rule |
|---|---|---|
| Session/actual Agent | G1.1/G1.3/G6.1 | immutable historical binding |
| Paid minutes/debits | G2.2/G2.1 ledger | immutable financial result |
| Refund success | G2.3 | immutable execution identity |
| Compensation policy | G2.4 | snapshot per calculation |
| Conversion | G2.4 config | snapshot per calculation |
| Accrual/correction | G2.4 | append-only |
| Payout settlement | existing payout process | linked factual readback |
| SLA/QA facts | G5/G6 | не потребляются G2.4 в MVP |

Configuration changes apply prospectively. Rollback is a new version, not mutation.

## 13. Поверхности

### Configuration

Add one settings entry `Вознаграждение Агентов` under existing `/ru/admin/settings/index`; it must open `/ru/admin/settings/accruals`.

`/ru/admin/settings/accruals` is the canonical and only owner of accrual configuration. It manages policies only. It is not an accrual queue and not a payout ledger.

### Existing operational surfaces

- `/ru/admin/partner/payments?id={agentId}` — operation/readback accrual/breakdown rows;
- `/ru/admin/partner/payouts?id={agentId}` — operation/readback payout periods/operations;
- `/ru/admin/partner/payments?id={agentId}&mode=minus` — operation/readback corrections/negative rows.

Extend these operation/readback surfaces; do not create a second competing partner-finance workflow and do not edit compensation policy from them.

### Consultation card

Authorized super-admin sees one link to source accrual/correction/payout facts. Agent sees only allowed own breakdown. Client sees none.

### Required UI states

- loading;
- empty;
- configuration pending;
- calculated;
- held;
- eligible;
- included;
- settled;
- corrected;
- failed;
- forbidden;
- stale/current-state redirect.

## 14. Admin configuration contract

All numeric/configurable values need:

- distinct input;
- label/unit;
- allowed range/precision;
- `unset` vs zero;
- validation;
- preview;
- draft/active version;
- effective date/timezone;
- permission;
- author/reason;
- old/new;
- activation/readback;
- rollback by new version.

Initial configuration:

- consultation percentage: `unset`;
- exact eligible base: `unset`;
- compensation period: `weekly`;
- fixed/SLA: отсутствует в MVP;
- additional task: отсутствует в MVP;
- conversion: managed and required only when units differ;
- external payout: manual/separate.

## 15. Idempotency and concurrency

Stable logical identities are required for:

- session completion -> session compensation fact;
- session + component + policy application -> original accrual;
- refund execution + original accrual -> correction;
- period + Agent + payout linkage -> inclusion.

Concurrency guards must cover:

- two completion events;
- two calculators;
- policy activation during calculation;
- reassignment during calculation;
- refund during period close;
- two overrides;
- payout result retry;
- correction retry.

Expected result is one committed outcome or an explicit retryable failure, never split truth.

## 16. Refund/correction integration

G2.4 subscribes only to successful immutable refund execution.

It must ignore:

- candidate;
- requested;
- under review;
- decision ready;
- approved but not executed;
- execution failed;
- support or quality signal without refund.

Correction calculation:

1. load original accrual snapshot;
2. resolve actually refunded eligible allocation;
3. calculate attributable negative amount;
4. apply permitted case override if present;
5. enforce cumulative ceiling;
6. create one append-only correction;
7. link to current/open adjustment period;
8. update safe Agent/super-admin readback;
9. do not mutate unrelated components.

## 17. Privacy and audit

Every config, calculation, hold, release, override, correction and payout linkage records:

- command/action;
- actor and role;
- time;
- target Agent/session/period;
- old/new or calculation inputs/result;
- reason/evidence reference;
- policy/version;
- outcome;
- idempotency identity.

Agent-safe readback excludes:

- client message/transcript;
- contacts and exact balance;
- support/refund private evidence;
- fraud/security notes;
- other Agents' rates/results.

Audit is append-only and permission-protected. Restricted audit views are themselves logged.

## 18. Errors and degraded dependencies

| Condition | Required result | Forbidden side effect |
|---|---|---|
| Missing percentage/base | configuration_pending | invented amount |
| Missing conversion | pending/incident | payout inclusion |
| Duplicate completion | original fact returned | second accrual |
| Concurrent calculation | one winner | double amount |
| Current reassignment | historical snapshot retained | recipient rewrite |
| Refund not executed | no correction | premature negative |
| Duplicate refund event | original correction returned | second correction |
| Closed period | later adjustment link | historical rewrite |
| Payout failure | factual failed/unsettled state | false settled |
| Unauthorized Agent action | forbidden + audit | config/amount change |
| Post-MVP task evidence | no financial side effect | hidden task pay |
| Partial persistence failure | atomic rollback/recoverable command | orphan amount/link |
| Source session unavailable | visible incident/retry | unlinked payment |
| Stale page/action | current readback | old action repeated |

## 19. Acceptance matrix

| ID | Given | When | Then | Evidence |
|---|---|---|---|---|
| G24-A01 | completed session, policy unset | completion processed | one recorded/configuration_pending fact, zero monetary accrual | session/admin readback |
| G24-A02 | active complete rule | completion processed | one calculated accrual actual Agent | result + audit |
| G24-A03 | two profiles same Agent | weekly preview | separate rows, correct aggregate | preview/export |
| G24-A04 | session then reassignment | history opened | original Agent retained | before/after |
| G24-A05 | global and individual rules | calculate | individual priority visible | snapshot |
| G24-A06 | rule changes later | old/new sessions inspected | old snapshot unchanged, new version used | compare |
| G24-A07 | weekly default | period preview | correct boundaries/timezone | period readback |
| G24-A08 | period setting changed | next period created | new type only prospectively | version audit |
| G24-A09 | units differ, valid conversion | calculate | exact conversion snapshot | breakdown |
| G24-A10 | conversion missing | calculate | pending/incident, no payout | negative proof |
| G24-A11 | full refund executed | event handled | one full attributable correction | linkage |
| G24-A12 | partial refund executed | event handled | one proportional correction | calculation |
| G24-A13 | refund candidate only | signal handled | no correction | absence proof |
| G24-A14 | duplicate refund event | retry | original correction returned | count/idempotency |
| G24-A15 | settled old period | refund succeeds | later linked adjustment, no rewrite | period compare |
| G24-A16 | fixed/SLA disabled | period close | no fixed amount | absence proof |
| G24-A17 | post-MVP fixed/SLA enablement | current MVP build | feature absent; no hidden amount | absence proof |
| G24-A18 | task pay disabled | evidence submitted | no amount | config/result |
| G24-A19 | post-MVP task pay enablement | current MVP build | feature absent; no hidden amount | absence proof |
| G24-A20 | task evidence submitted | current MVP build | no task pay side effect | count/absence proof |
| G24-A21 | duplicate completion | retry | one session fact/accrual | count |
| G24-A22 | concurrent calculate | two commands | one amount | concurrency proof |
| G24-A23 | policy activation during calculate | race | one coherent snapshot | transaction/readback |
| G24-A24 | refund during close | race | one coherent period/adjustment outcome | reconciliation |
| G24-A25 | Agent opens own breakdown | read | safe own rows | role proof |
| G24-A26 | Agent opens foreign breakdown | direct read | forbidden/no disclosure | negative role proof |
| G24-A27 | Agent changes own rate | direct action | forbidden + audit | command result |
| G24-A28 | super-admin override | confirm with reason | old/new append-only result | audit |
| G24-A29 | settled row edit attempt | direct action | rejected; history unchanged | before/after |
| G24-A30 | payout fails | provider/process result | no false settled | payout readback |
| G24-A31 | correction exceeds attributable amount | calculate | manual review/no silent excess | guard proof |
| G24-A32 | Agent breakdown | inspect payload/UI | no client private data | privacy proof |
| G24-A33 | rollback policy | activate prior values as new version | history unchanged | version compare |
| G24-A34 | partial persistence failure | command fails | no orphan amount/link | rollback proof |
| G24-A35 | existing partner routes | full workflow | payments/payouts/minus show linked truth without duplicate surface | UI/readback |

## 20. Current source navigation

Known current surfaces:

- `https://confideline.com/ru/admin/partner/payments?id=12`;
- `https://confideline.com/ru/admin/partner/payouts?id=12`;
- `https://confideline.com/ru/admin/partner/payments?id=12&mode=minus`;
- `https://confideline.com/ru/admin/settings/index`;
- `task-g2-accruals.html`;
- `tz-g2-billing-refunds-compensation.md`;
- `admin-panel-settings-development-package.md`;
- `vertical-package-session-money.md`.

These are navigation/accepted integration references, not runtime proof and not an instruction to preserve an unsuitable internal architecture.

Before implementation Igor/Codex must map:

- route/controller/service/model ownership;
- current balance/payment/payout truth;
- current partner access checks;
- existing status meanings;
- current negative-operation semantics;
- source migrations/config;
- safe extension points;
- obsolete/conflicting rules.

## 21. Programmer handoff

Before implementation return:

- current-source map;
- proposed integration map;
- conflict list;
- migration/backfill plan;
- permissions matrix;
- calculation/reconciliation fixtures;
- rollout and rollback plan.

After implementation return:

- build/commit;
- migrations/config;
- changed surfaces;
- automated test results;
- G24-A01–G24-A35 proof;
- persisted Agent/session/policy/correction readback;
- weekly period reconciliation;
- partner payments/payouts/minus screenshots/readback;
- audit/version/rollback proof;
- residuals.

## 22. Definition of Done

G2.4 is implemented only when:

- one session-linked financial lineage exists;
- actual Agent and snapshots persist;
- weekly default/configuration versions work;
- unset/disabled gates fail closed;
- consultation component работает независимо от post-MVP extensions;
- refund correction is exactly once and append-only;
- existing partner financial surfaces are reused without conflicting truth;
- direct unauthorized actions are blocked server-side;
- Agent and super-admin readbacks are role-safe;
- payout and accrual statuses remain separate;
- reconciliation passes;
- build/runtime target is identified;
- PM issues a separate acceptance verdict.

## 23. Proof boundary

This document and its verifier prove only specification completeness.

They do not prove:

- that current partner payment pages already implement session-linked accrual;
- that a task page is working code;
- that policy values are economically approved;
- that migration/backfill is safe;
- that payout or correction passes at runtime.

Runtime acceptance requires build-specific positive, negative, concurrency, permissions, persisted readback and reconciliation evidence.

## 24. Knowledge basis

| Source | Use | Claim class |
|---|---|---|
| `etalon-tz-g2-4-agent-accruals.md` | desired product behavior | owner/PM contract |
| `owner-decisions.md`, O4 and confirmed base rules | unset/disabled and refund correction boundaries | owner decision |
| `product-architecture-g1-g6-ownership-map.md` | G1/G2/G5/G6 ownership | accepted architecture |
| `tz-g2-billing-refunds-compensation.md` | umbrella financial requirements | accepted input |
| `admin-panel-settings-development-package.md`, screen 7 | managed settings contract | accepted handoff input |
| `vertical-package-session-money.md` | session-money proof lineage | accepted vertical contract |
| partner payments/payouts/minus routes | existing surface placement | current UI fact to re-map |

Excluded reference behavior:

- hidden payout formula;
- automatic use of unset rate;
- current-assignment attribution for historical sessions;
- retroactive policy rewrite;
- automatic negative Agent balance without approved rule;
- automatic external payout;
- client-visible internal Agent earnings.

## 25. Самооценка

| Criterion | Score | Basis |
|---|---:|---|
| Q1 Passport/goal/result | 5/5 | task, statuses and measurable outcome |
| Q2 Scope/dependencies | 8/8 | explicit G1/G2/G5/G6 boundaries |
| Q3 Roles/access | 10/10 | client/Agent/moderator/super-admin matrix |
| Q4 Preconditions/triggers | 7/7 | session, calculation and correction triggers |
| Q5 States/invariants | 12/12 | accrual/correction transitions and forbidden paths |
| Q6 Functional rules | 12/12 | consultation, refund correction и явная post-MVP граница |
| Q7 Edge/security/idempotency | 12/12 | concurrency, duplicate, failures, ACL |
| Q8 Data/snapshots/audit/readback | 8/8 | full conceptual contracts |
| Q9 Surfaces | 6/6 | settings + existing partner routes |
| Q10 Acceptance matrix | 12/12 | G24-A01–G24-A35 |
| Q11 Dual handoff | 5/5 | PM-ТЗ + this Codex context |
| Q12 DoD/proof boundary | 3/3 | implementation/runtime separated |
| **Total** | **100/100** | hard gates pass at specification level |

Open MVP enablement values:

- initial consultation percentage;
- exact eligible-base economics;
Post-MVP: fixed/SLA numbers and task rates. Они не входят в MVP acceptance и не уменьшают specification completeness обязательного consultation contour.
