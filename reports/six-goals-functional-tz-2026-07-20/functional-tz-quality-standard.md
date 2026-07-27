# Стандарт качества функционального ТЗ Confideline / Nebula

Версия: `1.0`  
Дата: 2026-07-27  
Статус: `canonical_standard_for_30_tasks`  
Назначение: объективно определять полноту каждого ТЗ G1.1–G6.7 и выдавать программисту автономный handoff без необходимости восстанавливать контекст по чатам.

## 1. Что означает «ТЗ готово на 100%»

`100% ТЗ` означает одновременно:

1. программист понимает требуемый продуктовый результат без чтения старых веток;
2. границы задачи, роли, состояния, правила, данные и ошибки определены однозначно;
3. для каждого существенного требования есть проверяемый acceptance oracle;
4. зависимости и не входящий scope названы явно;
5. неизвестные owner/legal/runtime values имеют поля, допустимое `unset/disabled` поведение и gate;
6. документ не навязывает архитектуру, но называет обязательные интеграционные результаты;
7. текущий код и runtime не выдаются за доказательство готовности;
8. hard gates ниже пройдены.

Полнота ТЗ не означает, что функция реализована, развернута или принята на сайте.

## 2. Четыре независимых показателя

Для каждой задачи всегда показываются отдельно:

| Показатель | Что измеряет | Допустимые значения |
|---|---|---|
| `spec_completeness` | полнота и однозначность ТЗ | `0–100%` |
| `owner_policy_closure` | приняты ли необходимые owner/legal/economics решения | `closed / waiting / deferred` |
| `implementation_status` | наличие связного кода и build traceability | `not_started / code_present_unmapped / implemented_unverified` |
| `runtime_acceptance` | доказан ли flow на развернутой сборке | `not_run / fail / runtime_verified / accepted` |

Запрещено объединять эти показатели в один общий процент.

Пример корректного статуса:

```text
spec_completeness: 100%
owner_policy_closure: closed
implementation_status: code_present_unmapped
runtime_acceptance: fail
```

## 3. Шкала `spec_completeness`

Каждый критерий получает `0 / 25 / 50 / 75 / 100%` своей весовой доли:

- `0%`: раздел отсутствует;
- `25%`: упомянут, но не позволяет принять решение;
- `50%`: основной happy path понятен, существенные границы отсутствуют;
- `75%`: почти полный, остаются неоднозначные edge/negative/readback cases;
- `100%`: автономный, непротиворечивый и проверяемый контракт.

Итог равен сумме взвешенных баллов.

| ID | Критерий | Вес |
|---|---|---:|
| Q1 | Паспорт, цель и измеримый результат | 5 |
| Q2 | Scope: входит / не входит / зависимости | 8 |
| Q3 | Термины, роли, права и видимость | 10 |
| Q4 | Preconditions, triggers и входные условия | 7 |
| Q5 | Состояния, переходы и неизменяемые invariants | 12 |
| Q6 | Полные функциональные правила и основной flow | 12 |
| Q7 | Edge cases, ошибки, security и idempotency | 12 |
| Q8 | Данные, snapshots, audit, history и readback | 8 |
| Q9 | Клиентская, agent, support и admin surfaces | 6 |
| Q10 | Positive/negative acceptance matrix с oracle | 12 |
| Q11 | Двухфайловый handoff: PM-ТЗ для программиста + технический контекст для Codex | 5 |
| Q12 | Definition of Done, proof и runtime boundary | 3 |
|  | **Итого** | **100** |

## 4. Hard gates

Документ не может иметь `handoff_ready` и не может получить 100%, если выполняется хотя бы одно:

1. программист должен угадать, кто actor, что является сущностью или когда начинается операция;
2. для stateful flow нет исчерпывающей state/transition модели либо явной ссылки на канонический контракт;
3. деньги, доступ или история могут измениться без negative/idempotency case;
4. роли описаны через видимость кнопок, но отсутствует server-side expected behavior;
5. не определено, какие значения snapshot и какие могут меняться;
6. `unset`, `0`, `disabled`, `no_data` или timeout смешаны;
7. acceptance сформулирован как «проверить, что работает» без expected result;
8. не определены ошибки, retry, duplicate, concurrent и unauthorized behavior;
9. owner/legal value отсутствует и нет fail-closed/disabled behavior;
10. PM-ТЗ для программиста смешивает product requirement с предположением о таблице, классе, API или UI-фреймворке;
11. static HTML, найденные файлы или локальный PASS названы runtime proof;
12. scope конфликтует с другим G-task и конфликт не разрешен.

Hard gate имеет приоритет над арифметическим баллом.

## 5. Обязательный двухфайловый handoff

Каждая задача передаётся двумя отдельными файлами.

### Файл 1. Продуктовое ТЗ для программиста

Это постановка от Product Owner / Project Manager. Программист должен понять:

- что хочет получить владелец;
- зачем это нужно;
- как функция должна работать для каждой роли;
- какие продуктовые правила нельзя нарушать;
- что должно быть видно на пользовательских и staff-поверхностях;
- какие изменяемые значения управляются через админ-панель;
- по каким демонстрируемым сценариям владелец принимает результат.

В этом файле запрещены:

- текущие классы, controllers, migrations и таблицы;
- предполагаемая схема БД;
- команды внутренних verifier-ов;
- self-score и внутренние readiness statuses;
- анализ существующего кода;
- техническая декомпозиция;
- предписание архитектуры.

Рекомендуемая структура:

1. что хочет получить PM;
2. продуктовая идея и место в общем journey;
3. роли;
4. момент создания/запуска функции;
5. основной и альтернативные сценарии;
6. обязательные продуктовые правила;
7. поведение client/agent/support/admin surfaces;
8. ошибки и особые случаи;
9. admin-managed settings;
10. связанные задачи;
11. что не входит;
12. критерии готового результата;
13. что программист возвращает перед реализацией и на QA.

### Файл 2. Технический контекст для Codex программиста

Этот файл программист передаёт своему агенту Codex вместе с PM-ТЗ. Он объясняет всю техническую картину и не заменяет решение программиста.

Технический контекст содержит разделы в указанном порядке:

1. **Паспорт задачи**
   - task ID, название, фаза, приоритет;
   - `spec_completeness`, owner/policy, implementation и runtime statuses;
   - владелец продукта и целевые роли.
2. **Краткий контекст**
   - проблема;
   - зачем это пользователю и бизнесу;
   - связь с общим journey.
3. **Результат**
   - одно проверяемое описание конечного поведения.
4. **Термины**
   - только термины, необходимые для самостоятельного чтения.
5. **Scope**
   - входит;
   - не входит;
   - зависимости и потребляемые контракты.
6. **Роли и доступ**
   - actor;
   - разрешенные действия;
   - запрещенные действия;
   - видимость данных.
7. **Preconditions и triggers**
   - что должно быть истинно до начала;
   - какое событие запускает flow.
8. **Invariants**
   - правила, которые нельзя нарушать ни UI, ни direct action, ни retry.
9. **Состояния и переходы**
   - state;
   - trigger;
   - guards;
   - result;
   - forbidden transitions.
10. **Функциональные сценарии**
    - happy path;
    - альтернативные paths;
    - повтор, reconnect, timeout, reassignment, support/refund там, где применимо.
11. **Контракт данных**
    - продуктовые поля без навязывания схемы БД;
    - source of truth;
    - mutable/immutable;
    - visibility;
    - retention/history.
12. **Поверхности**
    - client;
    - agent;
    - support/moderator;
    - super-admin;
    - notifications/readback.
13. **Ошибки и negative behavior**
    - unauthorized;
    - invalid state;
    - duplicate/retry;
    - concurrent;
    - partial failure;
    - degraded dependency.
14. **Acceptance matrix**
    - ID;
    - Given;
    - When;
    - Then;
    - evidence.
15. **Programmer handoff**
    - обязательные integration outcomes;
    - current source areas как навигация, не архитектурный приказ;
    - что предоставить на review.
16. **Definition of Done**
    - code/build;
    - positive/negative proof;
    - persisted/admin readback;
    - audit;
    - rollback/cleanup;
    - PM verdict.
17. **Proof boundary**
    - что доказано документом;
    - что требует implementation/runtime.
18. **Knowledge basis**
    - точные source refs;
    - claim class;
    - исключенные competitor/reference mechanics.
19. **Самооценка по Q1–Q12**
    - баллы;
    - hard-gate verdict;
    - остаточные debts.

При расхождении документов:

1. желаемое продуктовое поведение определяется PM-ТЗ;
2. технический файл уточняет текущую систему и проверку;
3. архитектуру и способ реализации определяет программист;
4. найденное реальное продуктовое противоречие возвращается PM как вопрос, а не решается агентом молча.

## 6. Правила формулировки требований

Каждое обязательное правило использует проверяемую конструкцию:

```text
При <precondition/trigger>
роль/система <обязательное действие>
и получает <observable result>;
если <negative condition>,
система <явный отказ/альтернативный результат>
без <запрещенный side effect>.
```

Хорошо:

> При повторной команде создания с тем же idempotency key система возвращает исходную session и не создаёт вторую session, debit или event.

Плохо:

> Предусмотреть защиту от дублей.

## 7. Правила acceptance matrix

Каждый существенный rule должен иметь хотя бы один acceptance case. Для money/access/state задач обязательны:

- happy path;
- insufficient/missing input;
- unauthorized direct action;
- invalid state transition;
- duplicate/retry;
- concurrent request;
- partial failure/rollback;
- historical readback после изменения config/assignment;
- cross-role visibility;
- degraded dependency;
- exact evidence type.

`Then` всегда содержит наблюдаемый oracle: state, response/result, persisted record, ledger/audit/readback и отсутствие запрещенного side effect.

## 8. Правила owner и внешних gates

Неизвестное значение не снижает `spec_completeness`, если одновременно определены:

1. отдельное поле/registry;
2. тип, unit и allowed range;
3. authorized role;
4. `unset/disabled` behavior;
5. activation gate;
6. version/audit;
7. snapshot/effective-date rule;
8. acceptance case.

При отсутствии хотя бы одного пункта это пробел ТЗ.

O5/public traffic, legal wording, domain review и runtime evidence отмечаются как `deferred release gate`, если не мешают программисту реализовать fail-closed workflow.

## 9. Граница архитектуры

Функциональное ТЗ обязано назвать:

- какие команды/действия должны существовать;
- какие данные должны сохраняться;
- какие результаты должны видеть роли;
- какие invariants должны обеспечиваться server-side;
- какие integration points должны дать единый результат.

Функциональное ТЗ не должно без отдельного технического решения диктовать:

- конкретную таблицу или имя колонки;
- конкретный controller/service/class;
- transport/endpoint format;
- библиотеку, framework upgrade или UI implementation method.

Существующие файлы приводятся только в техническом контексте `Current source navigation` как карта текущего кода и зона проверки. В PM-ТЗ для программиста их быть не должно.

## 10. Definition of Ready и Definition of Done

### `spec_handoff_ready`

- `spec_completeness = 100%`;
- все hard gates пройдены;
- owner/policy gates либо closed, либо имеют полный fail-closed contract;
- acceptance matrix покрывает positive и negative behavior;
- PM-ТЗ автономно описывает желаемое поведение;
- отдельный Codex-контекст автономно описывает техническую картину и проверку;
- документы ссылаются друг на друга и не смешивают зоны ответственности.

### `implemented_unverified`

- есть commit/build marker;
- entry points связаны с доменной логикой;
- migrations/config применимы к build;
- automated tests существуют;
- ещё нет полного runtime evidence.

### `runtime_verified`

- positive и negative cases пройдены на идентифицируемой сборке;
- persisted state/admin readback/audit согласованы;
- деньги и ACL проверены server-side;
- evidence packet полон.

### `accepted`

- PM принял runtime evidence;
- residual risks перечислены и имеют disposition;
- release gate не имеет открытого P0.

## 11. Шаблон итоговой оценки

```text
Task:
spec_completeness:
hard_gates:
owner_policy_closure:
implementation_status:
runtime_acceptance:

Q1  /5:
Q2  /8:
Q3 /10:
Q4  /7:
Q5 /12:
Q6 /12:
Q7 /12:
Q8  /8:
Q9  /6:
Q10 /12:
Q11  /5:
Q12  /3:

Blocking specification gaps:
Deferred enablement/release gates:
Implementation/runtime gaps:
Verdict:
```

## 12. Применение к остальным 29 задачам

G1.1 становится первым эталоном. Остальные задачи переводятся на этот стандарт по одной:

1. текущий document block оценивается по Q1–Q12;
2. hard-gate defects фиксируются до переписывания;
3. выпускается автономное task-ТЗ;
4. отдельный verifier проверяет обязательную структуру и task-specific invariants;
5. только после verifier и senior review ставится `spec_handoff_ready`.

Массовая отметка «100%» без поочередного task-level прохода запрещена.
