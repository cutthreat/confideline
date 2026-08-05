# Диагностический контекст G3.5: сквозной client-path gate

## 1. Паспорт задачи

- Task ID: `G3.5`
- Название: «Сквозная проверка клиентского пути»
- Фаза: `limited_paid_pilot_gate`
- Приоритет: `P0`
- Основной QA-протокол: `etalon-tz-g3-5-client-path-qa.md`
- `spec_completeness`: `100%`
- `owner_policy_closure`: `closed`
- `implementation_status`: `code_present_unmapped`
- `runtime_acceptance`: `fail`
- Владелец результата: PM Nebula
- Целевые роли: гость, клиент, Эксперт, Агент, support/moderator, super-admin
- Primary executor: независимый QA/super-admin
- Developer role: build/fixtures/hooks и исправление evidence-backed FAIL

`runtime_acceptance: fail` означает, что текущий полный flow не доказан и известны P0 ACL/session gaps. Это не оценка качества документа.

## 2. Краткий контекст

Платформа имеет отдельные public/admin/auth/chat/finance элементы, а G1/G2 уже получили продуктовые handoff. Но limited paid pilot нельзя принимать по наличию файлов или отдельных функций. Нужен один связный runtime path на одной сборке и обязательные negative proofs.

G3.5 является интеграционным gate:

- не меняет правила зависимых модулей;
- не подставляет значения при отсутствии config;
- не принимает UI без persisted/admin readback;
- не усредняет P0 FAIL;
- формирует evidence, который может независимо проверить PM и программист.

Codex Игоря не выполняет финальную независимую приёмку собственной реализации и не выдаёт `GO/NO_GO`.

## 3. Результат

Один build проходит полный positive client path, money/ACL/state/idempotency negative matrix и cross-role readback. Evidence packet связывает owner rule → build → UI action → persisted state → admin/audit/ledger → verdict. При любом открытом P0 итог остаётся `NO_GO`.

## 4. Термины

| Термин | Значение |
|---|---|
| Gate run | Один полный проход на зафиксированной сборке/config |
| Case | Один scenario с Given/When/Then/evidence |
| Fixture manifest | Список обезличенных test entities и исходных состояний |
| Build traceability | Однозначная связь проверяемого поведения с deploy/build |
| Cross-role proof | Согласованный result на client, Agent и admin surfaces |
| Persisted readback | Доказательство сохранённого business result, не только UI |
| Residual | Неустранённый риск с owner/disposition, не скрытый внутри PASS |
| GO/NO_GO | PM-решение limited paid pilot |

## 5. Scope

### Входит

- один guest-to-consultation positive flow;
- auth intent preservation;
- free dialogue/request/consent;
- trial/paid/minute/debit;
- pause/top-up/end/reconnect;
- session history;
- support/refund link;
- client/Agent/super-admin readback;
- ACL/unauthorized;
- duplicate/retry/concurrency;
- financial reconciliation;
- event/notification lineage;
- config snapshot;
- evidence/rollback;
- retest after fixes;
- final GO/NO_GO.

### Не входит

- изобретение новых owner rules;
- изменение target behavior ради PASS;
- production payment;
- public traffic;
- legal approval;
- performance/load public scale;
- полная автоматизация QA/SLA/training;
- визуальная parity всех Figma pages;
- тест с реальными клиентскими данными.

### Зависимости

- все P0 pilot contracts G1/G2/G3.1–G3.7, включая V3 G3.6 taxonomy/completeness input и G3.7 eligibility/manual order;
- minimum G4 support/refund/rules;
- G5.1 event lineage;
- G6.1–G6.4/G6.7 assignment/ACL/SLA/quality/versioned admission;
- current runtime acceptance contract;
- controlled test environment and browser route.

## 6. Роли и доступ

| Роль | Действия в gate | Запрет/обязательный negative |
|---|---|---|
| Гость | public discovery/auth entry | protected state creation без auth |
| Клиент | own dialogue/request/session/history/support | чужая session/dialogue/read/refund |
| Агент | assigned profile/dialogue/request/session | foreign profile/dialogue/send/assignment |
| Support/moderator | permitted case handling | деньги/quality/private data вне permission |
| Super-admin | full readback, manual financial decision | скрытое изменение истории/ledger |
| PM | принимает evidence и residuals | GO при P0 FAIL |

Доступ проверяется direct action, а не только видимостью кнопок.

## 7. Preconditions и triggers

### Run preconditions

- deploy/build marker;
- target URL/environment;
- current configuration versions;
- auth route без export cookies/tokens/profile data;
- fixture manifest;
- starting balances/entitlements;
- assignments;
- versioned G6.4 admission fixtures для current/pass, missing, stale/expired и failed/blocked состояний с точной связью actual Agent ↔ expert profile;
- current admission source/version/status и ожидаемый reason code; положительный fixture обязан иметь `admitted_active`;
- public/profile states;
- expected events;
- rollback plan;
- no real-user/real-payment side effects.

### Case preconditions

Каждый case фиксирует конкретные:

- actor/role;
- starting state;
- applicable snapshot;
- admission snapshot: status, course/policy/scorecard versions, reviewer/approver result, actual Agent/profile binding и checked_at;
- expected transition/result;
- forbidden side effects;
- evidence locations.

### Triggers

- manual/automated gate run start;
- client action;
- Agent action;
- timer/deadline;
- retry/concurrent request;
- dependency failure;
- fix deployed → focused retest → full gate rerun when required.

## 8. Invariants

1. Все обязательные cases относятся к одному build marker либо явно разделены на invalidated runs.
2. Static files не являются runtime proof.
3. Один dialogue может содержать несколько sessions без смешения денег.
4. Один Agent не имеет две активные paid sessions.
5. Client consent обязателен до paid.
6. Started minute списывается не более одного раза.
7. Foreign access/send отклоняется server-side.
8. Actual Agent и assignment snapshot не переписываются.
9. Refund/correction не выполняются дважды.
10. Event/notification failure не меняет корректный business result.
11. UI, persisted state, ledger и admin readback согласованы.
12. Test mutations имеют rollback/cleanup.
13. P0 FAIL всегда даёт `NO_GO`.
14. Missing config — не PASS и не скрытый default.
15. Evidence не содержит secrets или прямые персональные данные.
16. Missing, stale/expired, failed/blocked или чужой admission всегда fail-closed: нет eligibility, session и debit; P0 gate получает `NO_GO`.

## 9. Состояния и переходы

G3.5 не создаёт новые product states. Она имеет gate-state:

| State | Trigger | Guards | Result |
|---|---|---|---|
| `planned` | scope/fixtures ready | contracts identified | run manifest |
| `preflight_failed` | missing build/config/fixture | — | NO_GO, exact blocker |
| `running` | preflight PASS | one build | cases execute |
| `failed` | P0 case FAIL | evidence sufficient | NO_GO + defect handoff |
| `retest_required` | fix prepared | mapped new build | focused/full retest |
| `evidence_complete` | all mandatory cases terminal | no missing proof | review packet |
| `go` | PM accepts | all P0 PASS | pilot may proceed under scope |
| `no_go` | PM rejects/open P0 | — | pilot prohibited |
| `invalidated` | build/config/evidence mismatch | — | result unusable |

Запрещено:

- `running -> go` без evidence_complete;
- `failed -> go` без mapped fix and retest;
- перенос PASS между несовместимыми builds без доказанной неизменности;
- трактовать `blocked/retest` как PASS.

## 10. Функциональные сценарии

### S1A. Full positive — client request

Guest → discovery → auth → free dialogue → client request → assigned Agent accept → confirmation card without session → committed client consent → exactly one `connecting` session → trial → paid minute → end → history → support/refund link.

### S1B. Full positive — Expert offer

Guest → discovery → auth → free dialogue → Expert offer → client sees current conditions and accepts → this acceptance is committed consent → exactly one `connecting` session → trial → paid minute → end → history → support/refund link. No additional Agent accept exists in this path.

### S2. Zero trial

Trial entitlement `0`; paid starts only after all guards, без phantom trial.

### S3. No balance / pause

Недостаточно для next minute; одна balance pause, top-up и explicit continue либо timeout.

### S4. Reconnect

Client и Agent reconnect cases; no new session/trial/debit; timeout technical end.

### S5. Concurrent paid start

Пять attempts одного Agent; один result может стать active, остальные clean fail.

### S6. Foreign ACL

Assigned positive + foreign profile/dialogue/session/send/assignment negative.

### S7. Duplicate financial/state commands

Repeat request/accept/minute/end/refund возвращает existing result.

### S8. Stale discovery

Profile/price/availability меняется после page open; start revalidation блокирует старые условия.

### S9. Censorship/privacy

Sender sees source + warning; recipient safe version; full incident only admin; no recipient leak.

### S10. Refund lifecycle

Case linked to completed session; manual decision; exactly-once execution; client-safe status; Agent no details.

### S11. Partial/degraded dependency

Finance, notification, analytics или support failure produces defined safe behavior.

### S12. Historical readback

Assignment/config changes after session; historical actor/snapshots remain.

### S13. Current admission positive

Actual Agent имеет current `admitted_active` G6.4 admission для выбранной анкеты; source/version/status проверяются до session creation и повторно до paid start, snapshot сохраняется в readback.

### S14. Admission fail-closed

Отдельно запускаются missing, stale/expired, failed/blocked и wrong Agent/profile admission cases. Каждый даёт no display/action eligibility, no session, no debit, стабильный reason code/audit и `NO_GO`; никакой default admission не подставляется.

## 11. Контракт данных

### Run manifest

- run ID;
- build/commit marker;
- environment;
- started/finished time;
- applicable config versions;
- case list/version;
- fixture manifest hash/reference;
- operator/reviewer;
- stop conditions;
- final verdict.

### Case result

- case ID;
- owner rule/task;
- actor;
- Given/When/Then;
- actual;
- before/after refs;
- UI evidence;
- persisted/admin/ledger/audit refs;
- forbidden side-effect check;
- status;
- defect/retest link;
- cleanup.

### Traceability objects

- client;
- public expert profile;
- actual Agent;
- assignment snapshot;
- dialogue;
- request;
- session;
- message range/event;
- price/trial/settings snapshots;
- G6.4 admission snapshot и Agent/profile binding;
- paid minute/debit;
- accrual;
- terminal result;
- support/refund/quality links;
- events/notifications.

Run/case evidence is append-only. Retest creates a new result linked to superseded evidence; it does not rewrite the original FAIL.

## 12. Поверхности

### Client

- guest pages;
- auth;
- dashboard/catalog/profile;
- messages/request/session;
- balance/top-up;
- consultation history;
- support/refund.

### Agent

- isolated assigned workspace;
- dialogue/request/session;
- state/action controls;
- no foreign data.

### Support/moderator

- support case and permitted links;
- no unauthorized finance/private details.

### Super-admin

- consultation card;
- message/audit;
- assignment;
- orders/transactions;
- refund/accrual;
- settings versions;
- incidents/monitoring.

### Notifications/readback

- in-app/chat badge;
- email fallback;
- staff delivery incident;
- canonical event lineage.

## 13. Ошибки и negative behavior

| Condition | Expected result |
|---|---|
| Missing build marker | preflight_failed/NO_GO |
| Missing fixture/config | blocked exact; no guessed default |
| Missing G6.4 admission | fail-closed, no eligibility/session/debit, reason code, NO_GO |
| Stale/expired admission | fail-closed до re-check, no session/debit, NO_GO |
| Failed/blocked/wrong-binding admission | paid flow запрещён, safe audit, NO_GO |
| Unauthorized direct action | server denial + safe audit |
| Invalid transition | conflict/current state; no mutation |
| Duplicate/retry | original result; no second side effect |
| Concurrent start | one winner maximum |
| Partial debit/session failure | recover/reconcile or P0 FAIL |
| Ledger/admin mismatch | P0 FAIL |
| Response lost after commit | retry readback same result |
| Analytics down | business result stays; monitor |
| Notification down | delivery retry/incident; no duplicate business action |
| Support down | session stays; client safe retry |
| Browser auth unavailable | RETEST_AUTH_REQUIRED, not final ACL FAIL |
| Cleanup failure | residual with owner; production contamination prohibited |

## 14. Acceptance matrix

| ID | Given | When | Then | Evidence |
|---|---|---|---|---|
| E01 | guest, eligible profile | full positive run | completed session + linked history/support | UI + admin + audit |
| E02 | guest selection/draft | auth completes | exact intent restored/revalidated | UI + intent |
| E03 | free dialogue | message sent | no debit/request/session | dialogue + ledger absence |
| E04A | client request in free dialogue | assigned Agent accepts | confirmation card only; no session/debit; committed client consent then creates exactly one `connecting` session | UI + session absence/presence + audit |
| E04B | Expert offer in free dialogue | client accepts current conditions | acceptance is committed consent and creates exactly one `connecting` session; no second Agent accept | UI + session + audit |
| E04C | `connecting` session + trial entitlement | both ready | trial then one paid minute | timeline + ledger |
| E05 | trial=0 | both ready/balance sufficient | no trial; one paid start | state + ledger |
| E06 | zero balance after trial | boundary reached | one pause, zero next debit | state + ledger |
| E07 | top-up before deadline | client continues | same session resumes explicitly | session + balance |
| E08 | top-up after timeout | payment arrives | session remains completed; balance credited | history + ledger |
| E09 | Agent reconnect timeout | Agent absent | technical end; no next minute | timeline + incident |
| E10 | five concurrent starts for the same client and/or the same Agent capacity | attempts sent in parallel | server-side two-sided capacity guard: max one active/waiting paid consultation per client and max one active `paid`/`balance_pause` session per Agent; one winner only, losers return current state/conflict with no second session/minute/debit | sessions + ledger + audit |
| E11 | assigned Agent | read/send | allowed + actual actor audit | UI + audit |
| E12 | foreign Agent | direct read/send | denied; no message/data leak | response + audit |
| E13 | foreign client | opens session | denied safely | response + audit |
| E14 | duplicate minute command | replay | one debit/minute/event | ledger + audit |
| E15 | stale price/profile state | start attempted | current conditions required/no old start | UI + snapshot |
| E16 | censored contact | message sent | sender source/warning, recipient safe version | two-role UI + incident |
| E17 | completed session | refund approved/executed twice | one eligible movement | case + ledger |
| E18 | assignment changes later | history opened | original Agent/snapshots unchanged | before/after admin |
| E19 | notification provider down | business result occurs | state committed; delivery incident/retry | state + delivery log |
| E20 | admin/ledger discrepancy | reconciliation runs | FAIL/NO_GO, not averaged | report + refs |
| E21 | all P0 PASS | PM reviews packet | explicit GO with residual disposition | signed verdict |
| E22 | current `admitted_active` admission, matching Agent/profile and versions | full positive flow reaches session/paid guards | admission revalidated twice; one saved snapshot; flow may continue | admission readback + session audit |
| E23 | admission missing | profile/action/start is evaluated | no eligibility/session/debit; stable reason code; NO_GO | UI + admin + audit + ledger absence |
| E24 | admission stale/expired after critical version change | start or paid transition attempted | fail-closed до re-check; no session/debit; NO_GO | version readback + audit + ledger absence |
| E25 | admission failed/blocked or belongs to another Agent/profile | request/session/paid action attempted | denied safely; no client-data leak and no financial side effect; NO_GO | ACL/admission audit + ledger absence |

## 15. Development handoff и QA handback

Обязательные outcomes:

- deploy/build traceability;
- safe fixtures;
- observable persisted states;
- admin links/readback;
- server-side ACL/idempotency/concurrency;
- financial reconciliation;
- event lineage;
- reversible test mutations;
- exact defect/retest mapping.

Current source navigation:

- `qa-ba-autonomous-tester/contracts/SIX-GOALS-RUNTIME-ACCEPTANCE.md`;
- `qa-ba-autonomous-tester/QA-EXPERT-TESTING-STANDARD.md`;
- live public/admin maps;
- G1/G2/G3 task handoffs;
- consultation/chat/support/finance/admin surfaces;
- `product-architecture-g1-g6-ownership-map.md`;
- `owner-decisions.md`.

Игорь предоставляет build manifest, fixture manifest и traceability. Независимый QA формирует case matrix, raw evidence refs, reconciliation, rollback log и PM-ready closeout. Для каждого FAIL Игорь получает отдельный reproducible defect ticket и возвращает исправленную сборку; QA выполняет retest.

## 16. Definition of Done

- preflight complete;
- one build identified;
- all mandatory cases terminal;
- positive flow PASS;
- ACL/money/state/idempotency PASS;
- persisted/admin readback PASS;
- discrepancies resolved/retested;
- evidence packet complete;
- cleanup complete;
- no open P0;
- PM issues explicit GO.

## 17. Proof boundary

Документ и static verifier доказывают только полноту gate contract.

Текущий runtime не принят, потому что:

- отдельная live service session не доказана;
- Agent foreign-access gap известен;
- complete money/lifecycle/admin reconciliation отсутствует;
- full E2E run на mapped build не выполнен.

Каждый будущий PASS должен быть привязан к сборке и фактическому evidence.

## 18. Knowledge basis

- `etalon-tz-g3-5-client-path-qa.md`;
- `functional-tz-quality-standard.md`;
- `qa-ba-autonomous-tester/contracts/SIX-GOALS-RUNTIME-ACCEPTANCE.md`;
- `qa-ba-autonomous-tester/QA-EXPERT-TESTING-STANDARD.md`;
- `product-architecture-g1-g6-ownership-map.md`;
- `owner-decisions.md`;
- эталонные G1/G2 и новые G3.1–G3.7 handoffs.

Claim class: accepted owner rules + mandatory runtime acceptance contract.

Исключено: production payment, personal-data evidence, static-artifact promotion, competitor behavior without owner adoption.

## 19. Самооценка

| Критерий | Балл | Обоснование |
|---|---:|---|
| Q1 | 5/5 | gate goal и measurable GO |
| Q2 | 8/8 | full scope/non-goals/dependencies |
| Q3 | 10/10 | all roles + direct ACL |
| Q4 | 7/7 | run/case preconditions |
| Q5 | 12/12 | gate state model/invariants |
| Q6 | 12/12 | positive + alternative E2E flows |
| Q7 | 12/12 | money/ACL/retry/concurrency/degraded |
| Q8 | 8/8 | manifests, traceability, immutable evidence |
| Q9 | 6/6 | client/staff/admin/delivery surfaces |
| Q10 | 12/12 | 21 oracle cases |
| Q11 | 5/5 | PM + Codex pair |
| Q12 | 3/3 | DoD/proof boundary |
| **Итого** | **100/100** | |

Hard gates: `pass`.

Blocking specification gaps: нет.

Deferred gates: O5 public traffic, legal wording, public-scale load.

Implementation/runtime gaps: current full flow FAIL until mapped build and evidence.

Verdict: `spec_handoff_ready`, `runtime NO_GO`.
