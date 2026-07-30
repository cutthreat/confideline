# Технический контекст G1.1 для Codex Игоря: карточка консультации / `service_session`

Версия: `1.3`  
Дата: 2026-07-28  
Task ID: `G1.1`  
Фаза: `pilot_core`  
Приоритет: `P0`  
Стандарт: `functional-tz-quality-standard.md`  
Продуктовое ТЗ владельца: `etalon-tz-g1-1-service-session.md`  

> Этот файл не является постановкой задачи от PM. Он передаётся техническому агенту Codex вместе с продуктовым ТЗ и объясняет общую картину, текущий код, зависимости, интеграционные точки, риски и проверку. При расхождении в желаемом продуктовом поведении приоритет имеет продуктовое ТЗ для Игоря.

```text
spec_completeness: 100%
hard_gates: pass
owner_policy_closure: closed_for_G1.1
implementation_status: code_present_unmapped
runtime_acceptance: fail_not_acceptance_ready
```

## 1. Паспорт задачи

### Назначение

Создать единицу учёта одной конкретной консультации внутри долгоживущего диалога клиента с экспертной анкетой.

### Целевые роли

- клиент;
- публичная экспертная анкета;
- внутренний агент, фактически ведущий консультацию;
- support/moderator в пределах полномочий;
- super-admin;
- система.

### Владелец продуктового результата

Product owner / PM Nebula. Реализация и техническое решение — зона программиста.

## 2. Контекст и проблема

Один chat/dialog может существовать долго и содержать:

- обычные asynchronous сообщения;
- несколько отдельных trial/paid консультаций;
- сообщения до, между и после консультаций;
- обращения support и refund по конкретной услуге.

Если учитывать весь диалог как одну услугу, невозможно однозначно восстановить:

- какая консультация была оплачена;
- какая цена и правила действовали;
- сколько минут списано;
- кто фактически отвечал;
- какое назначение анкеты действовало;
- к чему относится refund или жалоба;
- почему и когда конкретная консультация завершилась.

`service_session` решает эту проблему: каждая консультация становится отдельной неизменяемо идентифицируемой услугой, не разрывая общий диалог.

## 3. Требуемый результат

Для любой консультации система и разрешённые роли могут по одному session identifier восстановить согласованную картину:

```text
клиент -> экспертная анкета -> фактический агент -> действовавшее назначение
-> request/Agent accept or Expert offer -> explicit client confirmation/committed consent
-> exactly one service_session -> connecting -> trial (если есть) -> paid (если начался)
-> pause/resume/end -> сообщения -> debit/refund/correction
-> support case -> итог и причина завершения
```

Две консультации одной пары внутри одного диалога не смешивают состояния, время, применённые правила, деньги, фактического агента или обращения.

## 4. Термины

| Термин | Определение |
|---|---|
| `dialog/conversation` | долгоживущий канал сообщений между клиентом и экспертной анкетой |
| `consultation request attempt` | попытка клиента начать консультацию; может быть отклонена/пропущена до создания услуги |
| `service_session` | одна явно подтверждённая клиентом consultation как отдельная услуга внутри dialog |
| `expert profile` | публичная экспертная анкета, которую видит клиент |
| `actual agent` | внутренний сотрудник, фактически выполняющий действие от имени expert profile |
| `assignment snapshot` | назначение expert profile на agent, действовавшее при запуске consultation |
| `trial` | необязательная первая фаза той же service session без paid debit |
| `paid phase` | фаза, в которой каждая начатая минута списывается по snapshot цены |
| `session snapshot` | неизменяемый набор применённых правил/значений на момент соответствующего перехода |
| `readback` | согласованное отображение сохранённой session для конкретной роли |
| `abnormal end` | завершение по технической, safety или иной нештатной причине с reason code |

## 5. Scope

### Входит в G1.1

1. Граница между dialog, request attempt и service session.
2. Уникальная идентификация каждой consultation.
3. Правило создания session и защита от дублей.
4. Связь session с client, expert profile, actual agent и assignment snapshot.
5. Связь сообщений, событий, денег, refund/correction и support case с session.
6. Неизменяемые snapshots применённых правил.
7. Client/support/admin history/readback.
8. Append-only history и запрет потери финансовой/actor truth.
9. Integration outcomes, acceptance cases и evidence contract.

### Не входит в G1.1

- точная формула списания — G2.1/G2.2;
- полный state machine и таймеры — G1.3/G2.2;
- assignment administration и ACL — G6.1/G6.7;
- refund policy/проценты — G2.3/G4.2;
- compensation formula — G2.4;
- notification catalog — G1.4/G5.1;
- UI-дизайн, Figma, layout и техническая архитектура.

G1.1 обязана хранить ссылки/snapshots результатов этих контрактов, но не дублирует их внутренние формулы.

Жёсткая граница ответственности:

- G1.1 владеет identity, составом, связями, видимостью и readback карточки;
- G1.3 единолично владеет lifecycle state machine, guards, переходами, deadlines, pause/reconnect и terminal behavior;
- G2 единолично владеет расчётами credits, started minute, debit, refund и compensation;
- действие из карточки является командой в систему-владелец, а не локальным изменением карточки.

### Зависимости

| Dependency | Что потребляет G1.1 |
|---|---|
| G6.1 | authoritative assignment и actual agent на момент запуска |
| G6.7/G1.2 | server-side role/participant authorization |
| G2.1 | effective credits/minute и price rule version |
| G2.2/G1.3 | lifecycle result, timestamps, pause/reconnect snapshots |
| G2.3/G4.2 | refund case и correction linkage |
| G2.4 | compensation policy/accrual linkage |
| G5.1 | canonical event lineage |

## 6. Доступ к карточке, действия и видимость

G1.1 не является RBAC/permissions contract. Она потребляет authoritative role/permission result из существующей системы и связанных G1.2/G6.1/G6.7. В рамках G1.1 проверяются только доступ к конкретной карточке, разрешённые действия и фильтрация данных на всех путях вызова, включая direct URL/action.

| Роль | Разрешено | Запрещено/скрыто |
|---|---|---|
| Клиент | открыть свои sessions, увидеть expert profile, human-readable state, time, price/debits/refunds, messages и support route | actual agent, assignment internals, KPI, чужие sessions |
| Assigned actual agent | работать с active session назначенной анкеты, видеть operational state и разрешённый контекст | чужие profiles/sessions, полные payment details, изменение historical snapshot |
| Support/moderator | открыть session из case, видеть service/money/message evidence в пределах permission, фиксировать case result | действия вне permission, скрытые security fields без основания |
| Super-admin | полный readback session, actor/assignment, events, financial linkages, config versions и audit | физическое удаление/перезапись historical truth |
| System | создать/перевести/закрыть session только через валидные guards и idempotent commands | молчаливый переход, duplicate side effect, client-supplied internal actor/role |

Все ограничения действуют server-side для UI, direct URL/action, retry и background command одинаково.

## 7. Preconditions и trigger создания

### Preconditions подтверждённого запуска

Перед созданием service session система должна определить:

1. authenticated client;
2. выбранный expert profile;
3. authoritative assignment и actual agent;
4. разрешение actual agent работать от этой анкеты;
5. отсутствие другого active paid/pause session у агента;
6. доступность/eligibility profile для старта;
7. valid effective price/trial/billing configuration;
8. применимую обязательную terms/policy version;
9. committed explicit client consent с version/time и client-visible snapshot;
10. уникальный idempotency key start attempt.

Если обязательная precondition не выполнена, consultation не запускается, service session/connecting/trial/debit не создаются, а request attempt получает объяснимый результат.

### Trigger

Service session создаётся атомарно и exactly once только после committed explicit client consent:

- client-initiated path: Agent принимает request, система показывает confirmation card, клиент явно подтверждает;
- Expert-initiated path: клиент явно принимает предложение Эксперта, и это действие является consent.

До consent принятие Агентом лишь изменяет pre-session request и не создаёт session, `connecting`, `trial` или debit. После commit consent система одним idempotent result связывает client, expert profile и actual agent, сохраняет consent version/time/full client-visible snapshot и создаёт session в каноническом состоянии `connecting`.

Trial является первой фазой уже созданной после consent session. Он не создаёт и не заменяет consent ни при entitlement больше `0`, ни при entitlement=`0`. Если trial не применим, та же созданная после consent session переходит к paid-start guards без trial.

## 8. Неизменяемые invariants

1. Одна service session относится ровно к одному client и одному expert profile.
2. Session имеет один stable identifier на весь lifecycle.
3. Один dialog может содержать ноль, одну или много service sessions.
4. Одно сообщение внутри consultation связано максимум с одной service session.
5. Reconnect, retry, top-up и повторное открытие UI не создают новую session.
6. Новая consultation после terminal end создаёт новую session.
7. Actual agent и assignment snapshot прошлой session не переписываются после reassignment.
8. Price, trial, billing, pause/reconnect и policy snapshots не переписываются после изменения admin config.
9. Financial events, refund/correction и audit append-only; исходное движение не заменяется.
10. Session не может исчезнуть, если с ней связан debit, accrual, refund/correction, support case или message.
11. Client request не задаёт internal actor, role, visibility, state или financial result.
12. Duplicate/concurrent command не создаёт вторую session или второй side effect.
13. Недопустимый transition не меняет session, ledger или history.
14. Client и internal readback получают одну source truth с различной разрешённой видимостью.
15. G1.1 не меняет terminal result, полученный от G1.3, и не изменяет financial result, полученный от G2.
16. Agent accept без client confirmation не создаёт session/connecting/trial/debit.
17. Один committed consent создаёт не более одной service session; повтор/конкуренция возвращают уже сохранённый результат.
18. Trial entitlement/usage никогда не обходят и не заменяют explicit client consent.

## 9. Состояния и граница с G1.3

G1.3 владеет полным state machine. G1.1 обязана хранить и показывать current state, state version, timestamps, events и terminal reason, но не определяет ни один переход или timeout.

Минимально распознаваемые состояния session:

| State | Что отображает G1.1 |
|---|---|
| `connecting` | label, actor readiness, deadline и разрешённое действие из readback G1.3 |
| `trial` | label, остаток entitlement и consent indicator из G1.3/G2 |
| `paid` | label, timer и финансовый summary из G1.3/G2 |
| `balance_pause` | label, deadline, причина и действие пополнения из G1.3/G2 |
| `completed` | terminal label, initiator, type, разрешённая причина и связанные routes из G1.3 |

Request до создания session имеет собственный lifecycle G1.3 и не является состоянием service session. Session history хранит каждый переход с `from`, `to`, trigger, occurred time, actor, rule/version и reason/context в разрешённом объёме.

## 10. Функциональные сценарии карточки

Эти сценарии проверяют identity, связи и отображение. Правильность самих переходов отдельно принимается по G1.3, а правильность денег — по G2.

### S1. Создание одной карточки

После принятия client request Агентом клиент получает confirmation card. До явного подтверждения session отсутствует. Committed client consent создаёт одну session; карточка показывает client, expert profile, actual agent во внутреннем readback, assignment snapshot, consent version/time/snapshot и связь с постоянным dialog. Для Expert offer явное принятие клиентом выполняет тот же consent/create contract.

### S2. Получение нового состояния

После валидного перехода G1.3 карточка показывает новое состояние, state version, timestamp, actor, deadline и разрешённые действия. Карточка не вычисляет переход повторно.

### S3. Request без session

Declined, cancelled, missed или expired request, а также declined/expired confirmation остаются результатом G1.3. G1.1 не создаёт для них карточку оказанной consultation и не изображает paid result.

### S4. Повторная consultation в существующем dialog

Новый request после нового committed client consent создаёт новый session identifier. Карточки, messages, totals и states разных консультаций доступны раздельно.

### S5. Duplicate/retry/concurrent creation

Повтор или конкурирующая consent/create команда дают максимум одну карточку. Повторный UI-readback открывает уже созданную session и не добавляет бизнес-событие.

### S6. Отображение pause/reconnect/waiting

Карточка показывает фактический primary state, operational substate, deadline и действия из G1.3. Она не продлевает период, не выдаёт второй период и не решает, можно ли продолжить.

### S7. Финансовый readback

Цена, started minutes, debit, refund, correction и итог показываются по ledger G2. Карточка не пересчитывает и не исправляет их локально.

### S8. Reassignment после консультации

Historical session продолжает показывать прежний actual agent и assignment snapshot во внутреннем readback.

### S9. Support/refund linkage

Связанный case открывается из конкретной session. Карточка показывает разрешённый статус процесса, не превращая его в lifecycle state консультации.

### S10. Terminal readback

Карточка показывает terminal result G1.3: safe outcome, actor/system source, time и связанные routes. Повторное открытие карточки не меняет результат.

## 11. Продуктовый контракт данных

Это логический контракт, а не предписание схемы БД.

| Группа | Обязательная truth | Snapshot/history | Видимость |
|---|---|---|---|
| Identity | session ID, request-attempt ID, dialog ID | session ID immutable | client limited; staff by role |
| Parties | client, expert profile | immutable | client sees public identities |
| Internal actor | actual agent, assignment reference/version | immutable after start | authorized staff only |
| Lifecycle | state, state version, created/accepted/consented/connected/trial/paid/pause/resume/end timestamps | append-only transitions | role-specific |
| Consent | status, timestamp, terms/policy version, initiation source, client-visible Expert/price/trial/started-minute/balance snapshot | immutable prerequisite for session creation | client + authorized staff |
| Pricing | effective credits/minute, source global/profile/promo, rule/version | snapshot before paid | client sees applicable result |
| Trial | eligibility/result, duration, source/version | snapshot | client + staff |
| Timers | balance-pause and reconnect-grace values/deadlines/version | snapshot when period begins | role-specific |
| Billing | started paid minutes, debit entries, total debited/refunded/net | ledger-linked append-only | client summary; staff detail |
| Compensation | applied policy reference, accrual/correction links | append-only | internal permitted roles |
| Messages | session linkage for consultation messages | immutable linkage except audited repair | conversation participants/staff by role |
| Support | case IDs, category/status/outcome/refund link | append-only | client/support by policy |
| End result | terminal state, reason code, ended time/actor | immutable terminal fact | client safe text; staff full |
| Audit | command/event/idempotency actor, time, old/new/reason | append-only | authorized staff |

No raw blocked contact/PII value is copied into session/audit. Privacy evidence remains masked/category-based according to O6 policy.

## 12. Поверхности и обязательный readback

### Client

Для каждой своей consultation:

- expert profile;
- date/time and human-readable result;
- trial/paid distinction;
- credits/minute snapshot и debited/refunded/net totals;
- transcript/messages относящиеся к session;
- support/refund entry и case status;
- понятный technical/abnormal result без internal data.

### Agent

- current session/profile/client context, разрешённый для работы;
- operational state и доступные actions;
- session boundary в общем dialog;
- отсутствие чужих sessions/assignment internals.

### Support/moderator

- поиск/открытие по session ID или case;
- summary lifecycle;
- relevant messages;
- money/refund readback;
- actual agent/assignment только при permission;
- case actions и history.

### Super-admin

- полная карточка session;
- event timeline;
- config/policy snapshots;
- actual actor/assignment;
- financial and compensation linkages;
- support/refund;
- audit/idempotency readback.

Readback разных поверхностей не может противоречить одной persisted truth.

## 13. Ошибки и negative behavior

| Условие | Ожидаемый результат | Запрещённый side effect |
|---|---|---|
| Missing/invalid price config | start rejected/config incident | session paid/debit |
| No authorized assignment | request rejected | session или foreign access |
| Agent already in paid/pause | busy outcome | second active paid session |
| Agent accept without client consent | confirmation remains pre-session | session/connecting/trial/debit |
| Missing consent for either initiation path | confirmation rejected/expired | session/connecting/trial/debit |
| Trial entitlement without committed consent | pre-session confirmation required | session/trial/debit |
| Foreign session read/send | server-side forbidden without data disclosure | read/message/event |
| Client supplies role/actor/state | ignored/rejected; server derives context | privilege/state change |
| Duplicate create command | original result returned | second session/event |
| Concurrent create | one winner | duplicate session/debit |
| Invalid transition | explicit conflict/result | state/ledger mutation |
| Partial persistence failure | atomic rollback or recoverable failed command | split session/event/ledger truth |
| Event/notification unavailable | visible degraded incident/retry policy | invented state or debit |
| Historical config changed | new sessions use new config | old snapshot rewrite |
| Delete/anonymize request | legal retention/anonymization policy preserves required financial/audit linkage | loss of required truth |

## 14. Acceptance matrix

| ID | Given | When | Then / oracle | Evidence |
|---|---|---|---|---|
| G11-A01 | valid assigned profile, eligible trial | Agent accepts client request | confirmation card only; no session/connecting/trial/debit | response + DB/readback absence |
| G11-A01a | accepted client request | client commits confirmation | one session created exactly once before connecting/trial; consent and party snapshots correct | response + DB/readback + event |
| G11-A01b | active Expert offer | client accepts | acceptance commits consent and creates one session exactly once | response + DB/readback + event |
| G11-A02 | valid consented start, no trial | paid start guard runs | one session exists before first debit; trial skipped without bypassing consent | state + ledger timeline |
| G11-A03 | declined request | agent declines | no service session/debit/accrual; attempt outcome visible | request log + absence proof |
| G11-A04 | missed/unavailable agent | timeout/fallback | no paid session; client sees next action | UI/result + absence proof |
| G11-A05 | ended first session in existing dialog | second request receives new client consent | new session ID; totals/statuses separate | client/admin history |
| G11-A06 | same start idempotency key | command repeated | original session returned; count remains one | command result + count + audit |
| G11-A07 | two concurrent starts | both execute | maximum one session and one start event | concurrency evidence |
| G11-A08 | price config invalid | start attempted | rejected fail-closed; no session/debit | error + DB/ledger absence |
| G11-A09 | consent missing, including trial entitlement > 0 | create/trial attempted | no session/trial/debit | state + ledger absence |
| G11-A10 | assigned agent/profile | normal consultation | actual agent and assignment snapshot saved | admin readback |
| G11-A11 | reassignment after terminal end | history reopened | original actor/assignment unchanged | before/after readback |
| G11-A12 | config changes after start | history/new session inspected | old snapshot retained; new session uses new version | two-session compare |
| G11-A13 | client reconnects in grace | chat reopened | same session; no new trial/start/debit | IDs + event/ledger |
| G11-A14 | reconnect after terminal timeout | chat reopened | old session remains terminal; new start required | history + state |
| G11-A15 | balance top-up before deadline | balance updated; client explicitly presses Continue; fresh guards pass | no auto-resume; same session resumes only after the explicit command; snapshot retained | state/events/ledger |
| G11-A16 | top-up after timeout | balance updated | ended session not resumed | balance + terminal history |
| G11-A17 | message during session | sender sends | message linked to correct session and server-derived actor | message/admin readback |
| G11-A18 | async message outside session | sender sends | no false paid-session linkage | message readback |
| G11-A19 | foreign authenticated user | direct read/send attempted | forbidden server-side; no data or message | HTTP/result + absence proof |
| G11-A20 | support case from session | support opens case | exact session/messages/money restored | case/admin screenshot + readback |
| G11-A21 | partial/full refund | decision confirmed | append-only refund/correction linked; original debit retained | ledger + case + audit |
| G11-A22 | technical interruption | grace expires | terminal technical reason/support route; no unexplained new minute | timeline + ledger |
| G11-A23 | session with financial/support links | deletion attempted | destructive action forbidden/preserved | action result + readback |
| G11-A24 | persistence fails after command starts | failure injected | no split session/event/ledger result | rollback evidence |
| G11-A25 | client opens own history | session rendered | correct public result; actual agent/KPI hidden | client screenshot/DOM |
| G11-A26 | super-admin opens session | session rendered | full actor/config/event/financial truth | admin screenshot/readback |

Все cases выполняются на идентифицируемой сборке с обезличенными fixtures. UI-only proof недостаточен для денег, actor и ACL.

## 15. Programmer handoff

### Обязательные integration outcomes

Программист должен предоставить связный результат, в котором:

1. committed explicit client consent создаёт ровно одну session для обоих initiation paths;
2. Agent accept вызывает только pre-session confirmation behavior, а committed confirmation/Expert-offer acceptance вызывает idempotent session domain behavior;
3. chat read/send проверяют participant/assignment server-side;
4. internal actor/role/visibility выводятся из authenticated server context;
5. messages во время consultation связываются с session;
6. lifecycle events, financial entries и session projection меняются согласованно;
7. client/support/admin history читают одну persisted truth;
8. automated tests покрывают G11-A01–A26 либо дают эквивалентное доказательство по каждому oracle;
9. migration/config/code привязаны к commit/build;
10. programmer заполняет evidence handoff ниже.

### Current source navigation

Текущий локальный source содержит заготовки:

- `application/models/ServiceSession.php`;
- `application/models/ServiceSessionEvent.php`;
- `application/models/ServiceSessionRuntimeEvent.php`;
- `application/models/ServiceSessionLedgerEntry.php`;
- `application/models/ServiceSessionRefundCase.php`;
- `application/services/ServiceSessionStateMachine.php`;
- `application/services/ServiceSessionPricingGate.php`;
- `application/services/ServiceSessionRuntimeMeter.php`;
- `application/services/ServiceSessionRefundLedger.php`;
- `application/services/ServiceSessionMessagePolicy.php`;
- migrations `m260615_*service_session*.php`.

Корень текущего source:

`H:\GPT-Codex\Confideline\Chat\youdate-2.0.2-yii2\Source\youdate_extracted`

Это карта проверки, а не требование сохранить текущую архитектуру.

### Current implementation gaps на 2026-07-27

Статический backend preflight классифицирует source как `code_present_not_acceptance_ready`. Для G1.1/G1 integration обнаружены:

- accepted lifecycle `trial -> paid -> balance_pause -> resume/timeout` не доказан;
- historical actual agent/assignment linkage не доказан;
- session participant guard неполон;
- consultation role/scope может приходить из client request вместо server context;
- controller/application command integration не найдена;
- actual actor audit не доказан;
- automated domain tests отсутствуют;
- reviewed files не привязаны к programmer build/commit.

Эти gaps являются implementation baseline, а не пробелами данного ТЗ.

### Handoff, который возвращает программист

```text
task: G1.1
commit:
build/environment:
implemented entry points:
persisted session/event/audit surfaces:
client history route:
support/admin readback route:
automated tests:
acceptance cases covered:
known residuals:
migrations/config:
rollback:
```

## 16. Definition of Done

G1.1 получает `runtime_verified` только когда одновременно:

1. есть commit и идентифицируемая развернутая build;
2. A01–A26 имеют PASS или согласованный эквивалент;
3. positive lifecycle доказан end-to-end;
4. duplicate/concurrent/unauthorized/invalid/partial-failure cases доказаны;
5. persisted session, events, messages, ledger и audit согласованы;
6. client, support и super-admin readback согласованы по общей truth;
7. actual agent/assignment сохраняются исторически;
8. rollback/fixture cleanup выполнен;
9. нет открытого P0 по money, identity, ACL или history;
10. PM принял evidence packet.

Наличие файлов, миграций, моделей, static HTML или unit syntax PASS не заменяет эти пункты.

## 17. Proof boundary

### Доказано этим документом

- полная функциональная граница G1.1;
- автономный role/data/state/readback contract;
- positive и negative acceptance oracle;
- programmer handoff;
- отсутствие текущего owner gate для структуры G1.1.

### Не доказано этим документом

- соответствие текущего кода требованиям;
- deploy/migration success;
- runtime behavior;
- UI visual acceptance;
- legal release wording;
- корректность денег/ACL без runtime evidence.

## 18. Knowledge basis

| Source | Использование | Claim class |
|---|---|---|
| `six-global-goals-final-canonical-pm-plan-2026-07-14.md`, G1.1 | session identity/result/dependencies | accepted canonical requirement |
| `tz-g1-chat-service-session.md`, G1.1 | ранее собранные functional rules | accepted input, refined here |
| `qa-ba-autonomous-tester/contracts/SIX-GOALS-RUNTIME-ACCEPTANCE.md`, sections 1–3, 7–9 | proof/status/negative-runtime contract | canonical QA contract |
| `.ops/knowledge/nebula/answers/paid-session-chat-ux.md` | visible paid-session states | reference fact, not runtime proof |
| `.ops/knowledge/nebula/research/paid-session-client-video-2025-04-11.md` | connecting/no-charge/chat/timer/refill states | observed client-side reference |
| `.ops/knowledge/nebula/answers/expert-training-and-operational-knowledge.md` | role/chat/source boundary | advisory source gate |
| `six-goals-training-product-addendum.md` | role/chat/quality implications | source-derived proposed/accepted rules by later owner decisions |
| `owner-decisions.md` | consent, trial, pause, reconnect, credits, privacy/safety decisions | owner decisions |

### Исключённые reference mechanics

- hidden billing state;
- artificial incompleteness;
- fear/dependency pressure;
- repeated unsolicited booking pressure;
- competitor role labels;
- competitor five-minute/free-session behavior, если оно противоречит owner decisions.

## 19. Самооценка по стандарту

| Критерий | Балл | Основание |
|---|---:|---|
| Q1 Паспорт/результат | 5/5 | task, phase, roles, outcome и четыре статуса |
| Q2 Scope/dependencies | 8/8 | in/out/dependency contracts явные |
| Q3 Terms/roles/access | 10/10 | glossary + server-side role matrix |
| Q4 Preconditions/triggers | 7/7 | accepted-start preconditions и creation trigger |
| Q5 States/invariants | 12/12 | state boundary, transition history и 15 invariants |
| Q6 Functional flow | 12/12 | S1–S10 |
| Q7 Edge/security/idempotency | 12/12 | negative table + duplicate/concurrent/rollback |
| Q8 Data/audit/readback | 8/8 | полный logical data contract |
| Q9 Surfaces | 6/6 | client/agent/support/super-admin |
| Q10 Acceptance | 12/12 | G11-A01–A26 с oracle/evidence |
| Q11 Programmer handoff | 5/5 | outcomes, current navigation/gaps, return packet |
| Q12 DoD/proof boundary | 3/3 | explicit runtime gate and evidence boundary |
|  | **100/100** |  |

Hard gates: `pass`.  
Blocking specification gaps: `none`.  
Deferred enablement/release gates: downstream G2/G6 values consume versioned contracts; не блокируют G1.1 implementation.  
Implementation/runtime gaps: перечислены в sections 15–17.  
Verdict: `spec_handoff_ready / not_runtime_verified`.
