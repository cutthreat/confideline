# Стандарт качества функционального ТЗ Confideline / Nebula

Версия: `1.1`  
Дата: 2026-07-29  
Статус: `canonical_standard_for_30_tasks`  
Назначение: объективно определять полноту каждой задачи G1.1–G6.7 и выдавать правильному исполнителю автономный handoff без необходимости восстанавливать контекст по чатам.

## 1. Что означает «ТЗ готово на 100%»

`100% ТЗ` означает одновременно:

1. основной исполнитель и участники понимают требуемый продуктовый результат без чтения старых веток;
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
| Q11 | Role-aware handoff: правильный основной документ, операционный владелец и техническая эскалация | 5 |
| Q12 | Definition of Done, proof и runtime boundary | 3 |
|  | **Итого** | **100** |

## 4. Hard gates

Документ не может иметь `handoff_ready` и не может получить 100%, если выполняется хотя бы одно:

1. исполнитель должен угадать, кто actor, что является сущностью или когда начинается операция;
2. для stateful flow нет исчерпывающей state/transition модели либо явной ссылки на канонический контракт;
3. деньги, доступ или история могут измениться без negative/idempotency case;
4. роли описаны через видимость кнопок, но отсутствует server-side expected behavior;
5. не определено, какие значения snapshot и какие могут меняться;
6. `unset`, `0`, `disabled`, `no_data` или timeout смешаны;
7. acceptance сформулирован как «проверить, что работает» без expected result;
8. не определены ошибки, retry, duplicate, concurrent и unauthorized behavior;
9. owner/legal value отсутствует и нет fail-closed/disabled behavior;
10. документ смешивает product, operations и development либо без проверки существующей админ-панели передаёт разработчику настройку, контент или staff-решение;
11. static HTML, найденные файлы или локальный PASS названы runtime proof;
12. scope конфликтует с другим G-task и конфликт не разрешен.

Hard gate имеет приоритет над арифметическим баллом.

## 5. Role-aware handoff

Каноническая маршрутизация находится в `task-execution-ownership-matrix.md`. Универсальный комплект «ТЗ для Игоря + контекст для Codex Игоря» запрещён.

### 5.1 Типы основного документа

| Класс | Основной документ | Обязательное дополнение |
|---|---|---|
| `DEV` | функциональное ТЗ разработчику | технический контекст реализации и проверки |
| `MIXED` | функциональное ТЗ с отдельными operational и development lanes | операционный runbook + технический контекст только development scope |
| `OPS_FIRST` | операционный runbook moderator/super-admin | scoped change request только после evidence-backed gap |
| `CONTENT_POLICY` | утверждённый source/policy/content пакет и инструкция публикации | technical ticket только для missing/broken capability |
| `QA_GATE` | test/gate protocol, evidence packet и verdict | defect ticket на каждый подтверждённый FAIL |

Старое имя файла `*-for-igor.*` может временно сохраняться для обратной совместимости ссылок. Оно не определяет исполнителя.

### 5.2 Обязательная структура

1. цель и измеримый результат;
2. класс пакета;
3. product/domain owner;
4. primary executor и approver;
5. существующие поверхности и capability baseline;
6. operator-first action;
7. development scope, если он доказан или обязателен;
8. technical escalation trigger и evidence;
9. роли, права и protected decisions;
10. positive/negative scenarios;
11. admin/public readback, audit и rollback;
12. proof boundary и Definition of Done.

### 5.3 Операционный runbook

Операционный документ должен объяснять moderator/super-admin:

- где находится существующая страница или сущность;
- что можно изменить без разработки;
- какие значения, тексты, переводы, content/status и permissions допустимы;
- кто утверждает защищённое решение;
- как выполнить preview, save, cache/refresh, admin readback и public readback;
- как зафиксировать preimage, audit и rollback;
- какой результат является `operator_done`;
- какое evidence превращает проблему в `developer_gap`.

Moderator не получает право принимать refund, assignment, protected policy activation или PM GO/NO_GO, если это закреплено за super-admin/PM/legal.

### 5.4 Технический контекст

Технический контекст создаётся только для `DEV`, development lane класса `MIXED` либо подтверждённой эскалации `OPS_FIRST`/`CONTENT_POLICY`/`QA_GATE`. Он содержит:

1. task/package ID и development scope;
2. подтверждённый capability gap;
3. точный route, locale, role, build и reproduction;
4. expected/actual, save/readback и запрещённый side effect;
5. current source navigation;
6. invariants, ACL, states, money/idempotency требования;
7. integration outcomes без навязывания архитектуры;
8. positive/negative acceptance matrix;
9. build marker, persisted/admin/public readback, audit и rollback;
10. handback операционному владельцу.

Технический контекст не поручает Игорю:

- придумывать или переводить тексты;
- утверждать legal/policy/domain смысл;
- выбирать financial/refund решение;
- модерировать profile/review/message;
- выполнять PM/QA verdict;
- повторно создавать существующую admin-функцию без capability probe.

### 5.5 Gate технической эскалации

До technical ticket обязательны:

1. точный admin/public route, роль и объект;
2. поиск существующего editor/key/field/action;
3. expected/actual;
4. save → refresh/cache → admin readback → public readback;
5. locale, version и permission;
6. screenshot или воспроизводимый сценарий.

Эскалация допустима для missing field/page/action/key/binding, hardcoded copy, raw/blank translation, save/readback mismatch, runtime error, broken route/cache/query/state/ACL либо отсутствующих atomicity/idempotency/version/audit/rollback.

После исправления операционный владелец завершает исходную настройку или публикацию. Закрытый code ticket без прикладного readback не закрывает задачу.

При расхождении документов:

1. желаемое продуктовое поведение определяется PM/product source;
2. операционный документ определяет разрешённую работу staff;
3. технический файл ограничен подтверждённым development scope;
4. архитектуру определяет программист;
5. невыводимое product/legal/financial решение возвращается владельцу, а не принимается Игорем или moderator молча.

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

Существующие code paths приводятся только в техническом контексте `Current source navigation`. Операционный runbook вместо этого называет реальные admin/public routes и процедуру readback; функциональное ТЗ не предписывает архитектуру.

## 10. Definition of Ready и Definition of Done

### `spec_handoff_ready`

- `spec_completeness = 100%`;
- все hard gates пройдены;
- owner/policy gates либо closed, либо имеют полный fail-closed contract;
- acceptance matrix покрывает positive и negative behavior;
- класс пакета и primary executor совпадают с `task-execution-ownership-matrix.md`;
- основной документ автономно описывает желаемый и операционный результат;
- development scope и technical context существуют только там, где они нужны;
- operational, product/policy, QA и development зоны не смешаны.

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

## 12. Применение ко всем задачам

Все задачи переводятся на этот стандарт по одной:

1. текущий document block оценивается по Q1–Q12;
2. назначаются класс, primary executor, approver и operator-first action;
3. hard-gate и ownership defects фиксируются до переписывания;
4. выпускается правильный основной документ и только применимые дополнения;
5. отдельный verifier проверяет структуру, task-specific invariants и routing;
6. только после verifier и senior review ставится `spec_handoff_ready`.

Массовая отметка «100%» без поочередного task-level прохода запрещена.
