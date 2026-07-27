# Технический контекст G1.3 для Codex Игоря: запрос, lifecycle и история consultation

Версия: `1.2`  
Дата: 2026-07-28  
Task ID: `G1.3`  
Фаза: `pilot_core`  
Приоритет: `P0`  
Стандарт: `functional-tz-quality-standard.md`  
Продуктовое ТЗ владельца: `etalon-tz-g1-3-status-history.md`  

> Этот файл не является постановкой задачи от PM. Он передаётся техническому агенту Codex вместе с продуктовым ТЗ и объясняет общую картину, границы объектов, зависимости, интеграционные точки, риски и проверку. При расхождении в желаемом продуктовом поведении приоритет имеет продуктовое ТЗ для Игоря.

```text
spec_completeness: 100%
hard_gates: pass
owner_policy_closure: closed_for_G1.3
implementation_status: open_until_mapped_build
runtime_acceptance: open_until_positive_negative_QA
```

## 1. Паспорт задачи

### Назначение

Обеспечить единый и проверяемый lifecycle запроса на консультацию и одной принятой `service_session`, не смешивая его с постоянным бесплатным диалогом, финансовыми процессами, support и quality.

### Целевые роли

- Клиент;
- публичный Эксперт;
- внутренний Агент;
- Support/moderator;
- Super-admin.

### Владелец продуктового результата

Product Owner / Project Manager Nebula. Продуктовые ответы закрыты; legal/privacy retention остаётся внешним release gate и не меняет зафиксированную модель.

## 2. Краткий контекст

Существующий постоянный диалог не может одновременно быть:

- попыткой начать платную услугу;
- паспортом одной консультации;
- финансовым ledger;
- support/quality case.

G1.3 разделяет бесплатный диалог, pre-session request и одну принятую service session. Это позволяет не создавать фиктивные консультации для отказов и timeout, не смешивать несколько консультаций одной пары и не раздувать state machine состояниями Support/Refund/Quality.

G1.3 является единственным техническим контрактом для lifecycle state machine, guards, переходов, deadlines, pause/reconnect и terminal behavior. G1.1 потребляет и отображает эти результаты, но не реализует параллельный автомат состояний.

## 3. Результат

Система должна обеспечивать:

```text
dialog
-> consultation_request
-> accepted
-> one service_session
-> connecting
-> trial? -> paid
-> waiting/reconnect/balance_pause?
-> completed
```

Каждый переход имеет trigger, guard, actor, applied rule version, timestamp и observable result. Повтор/конкуренция не создают второй бизнес-результат.

## 4. Термины

- `dialog`: постоянная бесплатная переписка пары client + expert profile.
- `consultation_request`: pre-session запрос/предложение начать платную consultation.
- `service_session`: одна принятая консультация и ее карточка G1.1.
- `primary lifecycle state`: connecting/trial/paid/balance pause/completed.
- `operational substate`: waiting client/expert или reconnect.
- `terminal metadata`: initiator/type/reason/client message/financial result, а не набор независимых terminal states.
- `applied snapshot`: версия настройки, примененная к конкретному начатому периоду.

## 5. Scope

### Входит

- request/proposal lifecycle;
- один ожидающий request на клиента;
- request timeout/clarification/cancel/decline;
- handoff request -> one session;
- primary lifecycle;
- waiting/reconnect substates;
- balance pause behavior boundary;
- terminal result metadata;
- client/agent/admin history/readback;
- idempotency/concurrency;
- lifecycle settings placement.

Любое действие, инициированное из карточки G1.1, входит в G1.3 только как lifecycle-команда с серверной проверкой текущего state/version/guard.

### Не входит

- message transport/censorship: G1.2;
- session passport/linkages: G1.1;
- price/debit/refund/compensation calculation: G2;
- support case/dispute: G4;
- analytical event definitions/KPI: G5;
- SLA engine/quality sanction: G6;
- architecture, schema, controller/API choice.

### Зависимости

| Task | Потребляемый контракт |
|---|---|
| G1.1 | canonical session card, actor/message/money/support linkages |
| G1.2 | dialog, messages, delivery/edit/censorship |
| G1.4 | client notification delivery |
| G2.1-G2.2 | entitlement, price snapshot, started minute, debit, pause guard |
| G2.3 | refund/correction/compensation result |
| G4.1-G4.2 | support/dispute link and client-safe status |
| G5.1 | canonical event definitions |
| G6.1-G6.2 | assignment, busy lock, online/SLA/reconnect facts |
| G6.3 | quality review linkage |

## 6. Роли и доступ

| Роль | Разрешено | Запрещено |
|---|---|---|
| Client | own request/session, cancel/consent/continue/end, client history | чужие records, internal reasons, arbitrary transition |
| Assigned Agent | assigned request/session actions, required staff reason | foreign profile/session, client-hidden internals outside scope |
| Moderator | linked support/quality actions by permission | rewrite lifecycle/money history |
| Super-admin | full readback/audit, permitted corrective actions | arbitrary impossible status, history deletion |
| System | deterministic timeout/transition by active rule | transition without guard/version/audit |

Server-side outcome must match UI permission. Hiding a button is insufficient.

## 7. Preconditions и triggers

### Request creation

- authenticated client;
- selected expert profile;
- non-empty short question;
- no other active/waiting paid request;
- actor/profile availability per G6;
- active request settings version.

### Session creation

- accepted request;
- applicable client confirmation/consent;
- valid assignment and busy lock;
- no existing session for the same accepted request;
- pricing/entitlement/settings snapshots available.

## 8. Invariants

1. One accepted request -> at most one service session.
2. Declined/cancelled/expired request -> no debit/session.
3. One client -> at most one active/waiting paid request.
4. One Agent -> at most one paid/balance-pause session.
5. Trial is not a separate session.
6. Waiting/reconnect -> no new paid minute.
7. One balance pause per session.
8. Completed session never resumes.
9. First committed terminal action wins.
10. Retry does not duplicate request/session/transition/event.
11. Support/refund/quality statuses never become lifecycle states.
12. Applied deadline does not move when admin setting changes.
13. Historical actual Agent is not rewritten by reassignment.

## 9. Состояния и переходы

### 9.1. Request

| From | Trigger | Guard | To/result |
|---|---|---|---|
| none | client submits valid question | no active request | awaiting expert |
| awaiting expert | Agent asks clarification | assigned/authorized | awaiting client |
| awaiting client | client replies before deadline | same request active | awaiting expert |
| awaiting expert | Agent accepts | valid assignment/lock | accepted |
| proposal | client accepts before deadline | proposal active | accepted |
| nonterminal request | client cancels | session not started | cancelled |
| awaiting/proposal | deadline reached | no committed answer/accept | expired |
| awaiting expert | Agent declines | reason present | declined |
| accepted | session creation committed | idempotency guard | one connecting session |

Concurrent accept/cancel/expire resolves to one committed terminal request result. Losing command returns current result without side effects.

### 9.2. Session primary state

| From | Trigger | Guard | To/result |
|---|---|---|---|
| connecting | both ready | trial entitlement > 0 | trial |
| connecting | both ready | no trial, paid consent/guard satisfied | paid |
| connecting | timeout/cancel | paid not started | completed + reason |
| trial | entitlement exhausted | paid consent and funds | paid |
| trial | entitlement exhausted | consent + insufficient funds | balance pause |
| trial | no paid continuation | applicable end action | completed |
| paid | insufficient next minute | pause unused | balance pause |
| paid | normal/technical end | valid terminal trigger | completed |
| balance pause | top-up before deadline | session nonterminal | paid |
| balance pause | deadline/second zero/end | applicable guard | completed |

### 9.3. Operational substates

- waiting client;
- waiting Agent;
- reconnect client;
- reconnect Agent.

Substate starts/stops a separate clock and blocks a new paid minute. It does not overwrite primary state or create a new session.

## 10. Функциональные сценарии

### S1. Client request accepted

Request -> awaiting Expert -> accepted -> one connecting session.

### S2. Clarification

Expert asks -> client responds within 60m -> same request returns to Expert.

### S3. Proposal by Expert

Proposal -> client explicit accept within 15m -> one connecting session; reject/expiry -> no session.

### S4. Concurrent second request

Second request is not created. Client chooses keep current or cancel-and-replace.

### S5. Trial zero

Connecting skips trial and uses paid start guard.

### S6. Waiting client after paid answer

Current started minute finishes; next does not start; waiting window 4h; one invitation per period; max 3 cycles; client returns to continue or end.

### S7. Balance pause

One 5m pause; top-up before deadline resumes same session; late money remains balance.

### S8. Reconnect

Client/Agent return inside their 60s grace resumes same session; after deadline session completes with technical metadata and route.

### S9. Concurrent end

Client and Agent end nearly simultaneously; one terminal result persists, second action reads current result only.

### S10. Linked process failure

Support/event/notification dependency fails after lifecycle commit; lifecycle remains truthful, outbox/retry/incident behavior does not roll back or duplicate business state.

## 11. Продуктовый контракт данных

### Request truth

- request identity;
- dialog/client/expert profile;
- initiator;
- short question;
- request state;
- actor decisions and reasons;
- deadlines;
- applied settings version;
- terminal result;
- linked session identity.

### Session lifecycle truth

- session identity from G1.1;
- primary state;
- optional operational substate;
- state/substate started_at/deadline/ended_at;
- trigger/actor/reason;
- applied rule version;
- terminal metadata;
- linked support/refund/quality identities;
- event lineage/idempotency identity.

The document does not prescribe database tables or class structure.

## 12. Поверхности

### Client

- request status and deadline;
- allowed actions;
- status banner above chat;
- My consultations list;
- client-safe terminal result and financial readback;
- related support/refund status without staff internals.

### Agent

- assigned queue/request;
- active session and allowed next action;
- primary/substate/deadline;
- reason required for staff action;
- no foreign data.

### Support/Moderator

- linked session summary from case;
- no independent copied lifecycle truth.

### Super-admin

- full request/session timeline;
- actual actor;
- applied configuration;
- money/support/quality links;
- concurrency/idempotency/audit readback.

## 13. Ошибки и negative behavior

Обязательные negative classes:

- invalid/empty request;
- unauthorized/foreign actor;
- duplicate submit/accept/session creation;
- concurrent accept/cancel/expire;
- invalid transition;
- timeout boundary race;
- missing pricing/assignment/config dependency;
- late reconnect/top-up;
- second balance pause;
- repeated invitation/cycle overflow;
- terminal action race;
- partial delivery after state commit;
- attempt to mutate historical deadline/snapshot.

Failing dependency must be explicit. `unset`, `0`, `disabled`, timeout and unavailable are distinct states.

## 14. Acceptance matrix

| ID | Given | When | Then |
|---|---|---|---|
| A1 | no active request | client submits valid question | one awaiting request, no debit |
| A2 | active request exists | client requests another Expert | no second request; replace modal |
| A3 | awaiting client | answer before/after 60m | same request resumes / expires |
| A4 | active proposal | accept before/after 15m | one session / no session |
| A5 | accepted request | duplicate create retry | one connecting session |
| A6 | connecting | both ready before 3m | trial or paid by guard |
| A7 | no trial entitlement | start | trial skipped |
| A8 | paid waiting client | waiting starts | current minute completes, next not |
| A9 | waiting period | second invitation | blocked at configured limit |
| A10 | 3 cycles used | new cycle requested | blocked/completed by rule |
| A11 | first zero balance | pause | one 5m pause |
| A12 | pause used | second zero balance | completed, no second pause |
| A13 | reconnect active | return before/after 60s | resume / completed technical |
| A14 | completed session | late top-up/reconnect | no resume; money stays balance |
| A15 | two terminal commands | concurrent commit | one terminal result |
| A16 | setting changes mid-clock | clock active | original deadline retained |
| A17 | support/refund opens | session completed | session remains completed |
| A18 | unauthorized direct transition | command sent | rejected, no side effects, audit |

Evidence must include persisted readback, not only UI screenshots.

## 15. Programmer handoff

Codex should help Igor:

- locate current dialog/message/assignment/pricing/admin surfaces;
- identify existing reusable contracts;
- propose implementation without changing PM behavior;
- preserve backward compatibility where required;
- return any product conflict before coding it away;
- provide traceability from requirement/acceptance ID to implementation and proof.

## 16. Definition of Done

- request and session are not conflated;
- PM states/transitions/invariants implemented;
- admin settings saved, versioned and read back;
- old/new deadline behavior proven;
- positive, negative, duplicate, concurrent and unauthorized cases pass;
- client/Agent/super-admin views agree on one truth;
- money/support/quality integrations reference the same session;
- rollback/cleanup documented;
- runtime proof reviewed by PM/QA.

## 17. Proof boundary

This document proves only agreed product/technical context. It does not prove:

- code exists;
- migration/build succeeded;
- live routes work;
- ACL is enforced;
- money is correct;
- runtime acceptance passed.

Static HTML/mockups are reference surfaces only.

## 18. Knowledge basis

- `product-architecture-g1-g6-ownership-map.md`
- `functional-tz-quality-standard.md`
- `etalon-tz-g1-1-service-session.md`
- `codex-context-g1-1-service-session.md`
- `etalon-tz-g1-2-role-chat.md`
- `codex-context-g1-2-role-chat.md`
- `tz-g2-billing-refunds-compensation.md`
- `tz-g4-support-disputes-rules.md`
- `tz-g5-events-kpi-launch.md`
- `tz-g6-assignment-sla-quality-access.md`
- `qa-ba-autonomous-tester/reports/admin-functional-map-live-current.md`

Claim class: owner decisions + current canonical PM artifacts. Competitor mechanics are not requirements unless explicitly adopted.

## 19. Самооценка

Результат cross-document verifier:

- Q1-Q12 structural/product contract: complete;
- focused checks: `78/78 pass`;
- hard gate: pass для разделения request/session, единого terminal state, settings ownership и связанных Support/Refund/Quality процессов;
- implementation/runtime: open.
