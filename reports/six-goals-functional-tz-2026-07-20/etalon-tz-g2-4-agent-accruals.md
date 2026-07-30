# ТЗ для Игоря — G2.4 «Начисления и вознаграждение Агентов»

## 1. Цель

Создать прозрачный контур начислений, в котором super-admin и Агент могут объяснить каждую сумму через конкретную консультацию, применённое правило, недельный период, возврат и корректировку.

Готовый результат:

- завершённая consultation сохраняет финансовый факт по фактическому Агенту этой session;
- активное правило рассчитывает вознаграждение по неизменяемому snapshot;
- изменение назначения, ставки или курса не переписывает историю;
- refund создаёт отдельную отрицательную correction, а не меняет исходное начисление;
- consultation component работает как обязательное MVP-ядро; fixed/SLA и additional-task components вынесены после MVP и не создают суммы;
- начисление не смешивается с фактической выплатой;
- повтор, concurrent action или ошибка не создают вторую сумму;
- существующие страницы начислений, выплат и удержаний расширяются, а не дублируются.

### Граница P0 для MVP

В обязательный результат G2.4 входят session ledger, consultation accrual, refund correction, недельная ручная сверка, связь с существующим payout process, безопасный readback и audit.

Fixed/SLA pay, additional-task pay и автоматическая внешняя выплата находятся только в `post-mvp-backlog-2026-07-29.md`. В MVP они не реализуются как активные модели и не входят в acceptance; система не должна создавать для них скрытые суммы.

## 2. Место G2.4 в общем продукте

G2.4 получает подтверждённые факты от других задач:

- G1.1 — service session, expert profile и фактический Агент;
- G1.3 — завершение consultation и terminal metadata;
- G2.1 — credits, balance buckets и применимые units;
- G2.2 — paid-minute results и фактически списанные credits;
- G2.3 — успешно исполненный refund;
- G5/G6 SLA/QA/shift facts не потребляются обязательным consultation component в MVP; они относятся только к post-MVP расширениям.

G2.4 владеет:

- правилами внутреннего вознаграждения Агентов;
- calculation snapshot;
- начислением по consultation;
- недельным compensation period;
- отрицательной correction после успешного refund;
- явная граница, запрещающая fixed/SLA и additional-task начисления в MVP;
- breakdown, audit и связью с существующим payout process.

G2.4 не владеет:

- ценой consultation для клиента;
- списанием credits;
- решением о refund;
- public rating Эксперта;
- назначением анкеты Агенту;
- payroll, налоговой или кадровой системой;
- автоматическим переводом денег Агенту;
- банковскими реквизитами и payment-provider settlement;
- формулами KPI и QA.

## 3. Термины

### Фактический Агент

Внутренний сотрудник, который был назначен на экспертную анкету и фактически проводил конкретную consultation session. Исторический получатель определяется по snapshot session, а не по текущему назначению анкеты.

### Consultation component

Вознаграждение, рассчитываемое по фактически оказанной и оплаченной consultation согласно активной версии правила.

### Fixed/SLA component (после MVP)

Отдельное вознаграждение за график, смену или выполнение утверждённых SLA-условий за период.

### Additional-task component (после MVP)

Отдельное вознаграждение за подтверждённое дополнительное задание, которое не является consultation.

### Eligible base

Явно определённая активным правилом база, к которой применяется ставка или процент. Неописанный тип credits, refund или session не включается в базу молча.

### Accrual

Внутренний результат расчёта вознаграждения. Accrual не означает, что деньги уже выплачены.

### Payout

Отдельный операционный процесс фактической выплаты Агенту через существующий финансовый контур.

### Correction

Новое append-only движение, объясняющее уменьшение или исправление ранее созданного accrual. Correction не переписывает исходную запись.

### Compensation period

Период группировки и расчёта. Стартовое значение — **weekly**, оно управляется в админ-панели и применяется только к новым периодам.

### Policy snapshot

Неизменяемая копия активного правила, scope, ставки, базы, курса, округления и версии, применённых к начислению.

## 4. Роли и видимость

### Клиент

Не видит внутреннее вознаграждение, ставку, курс, payout status или фактического Агента. Клиентский balance и refund отображаются по G2.1/G2.3.

### Экспертная анкета

Используется как публичный источник consultation и статистики, но не является получателем внутреннего начисления.

### Агент

Видит только собственный разрешённый breakdown:

- период;
- экспертную анкету без лишних клиентских данных;
- связанную consultation;
- consultation component;
- рассчитанную сумму;
- status;
- refund/correction fact;
- связь с payout.

Агент не видит чужие ставки, чужие начисления, точный клиентский balance, support/refund evidence, fraud/security details или внутренние комментарии super-admin.

### Модератор

Не получает финансовый доступ автоматически. Доступ возможен позднее только через существующую permissions-модель.

### Super-admin

На первом этапе имеет полный доступ к configuration, preview, accrual, correction, weekly period, payout linkage, override и audit. Другие роли владелец позднее назначает через существующие permissions.

## 5. Обязательные invariants

1. Одной consultation соответствует не более одного исходного consultation accrual по одной версии active component.
2. Accrual связан с service session, expert profile и фактическим Агентом.
3. Reassignment после consultation не меняет исторического получателя.
4. Accrual и payout — разные процессы и разные статусы.
5. Изменение policy, ставки, курса или периода не переписывает исторический snapshot.
6. `unset` не равен `0`, `disabled` или «рассчитать по умолчанию».
7. Неактивный component не создаёт сумму.
8. Неописанная eligible-base category действует fail-closed.
9. Refund влияет на consultation component только после успешного исполнения G2.3.
10. Correction не переписывает исходный accrual.
11. Одна logical correction не создаётся повторно из-за retry.
12. Cumulative negative correction не превышает attributable consultation accrual без отдельного manual-review решения.
13. Consultation refund не изменяет unrelated fixed/SLA или task pay без отдельного активного правила.
14. Закрытый или выплаченный период не переписывается задним числом.
15. Любой override имеет автора, причину, old/new preview и audit.
16. Агент не может утвердить или изменить собственную ставку, correction или payout.
17. Client-facing price, public rating и internal compensation не смешиваются.
18. Автоматическая внешняя выплата в MVP запрещена.

## 6. Preconditions и trigger consultation accrual

До расчёта должны существовать:

- одна завершённая service session;
- фактический Agent snapshot;
- expert profile snapshot;
- paid-minute/debit facts G2.2;
- active consultation compensation rule;
- определённая eligible base;
- применимый conversion rule, если units различаются;
- открытый или допустимый compensation period;
- stable logical operation identity.

Trigger — подтверждённое завершение одной consultation session.

Если обязательная конфигурация отсутствует:

- session ledger fact сохраняется;
- component получает понятное состояние `configuration_pending`;
- сумма не подставляется;
- staff видит configuration incident;
- payout не создаётся.

## 7. Consultation component

Super-admin настраивает:

- `draft / active / retired`;
- процент или ставку;
- eligible base;
- обращение с purchased, bonus, promo и refunded credits;
- payout/readback currency;
- conversion rule;
- precision и rounding;
- minimum/maximum;
- global, group или individual Agent scope;
- effective date/timezone;
- допустимые session outcomes и exclusions;
- negative-correction behavior;
- permissions и approval.

Стартовый процент и точная eligible base остаются **`unset`** до отдельного economics-решения. Это не блокирует разработку, сохранение session ledger и preview, но блокирует фактический monetary accrual.

Initial mode — **`disabled`**: до публикации валидной policy фактическое денежное начисление не создаётся. Session-linked ledger, preview и audit при этом работают и доказываются как обязательная часть MVP.

При нескольких применимых правилах система показывает приоритет:

1. individual Agent override;
2. Agent group rule;
3. global rule.

Скрытый fallback запрещён.

## 8. Fixed/SLA component — после MVP

Компонент не входит в MVP и вынесен в `post-mvp-backlog-2026-07-29.md`. Для текущего P0-среза обязательно только отсутствие скрытого начисления.

Ниже сохранены будущие продуктовые inputs; они не являются требованием реализации или acceptance текущего MVP:

- fixed amount и currency;
- weekly или другой управляемый period;
- shift/schedule scope;
- обязательные hours/tasks/SLA thresholds;
- допустимые exclusions;
- no-data behavior;
- proportional, step или manual reduction;
- cancel conditions;
- caps;
- approval.

Отсутствие подтверждённых SLA/shift facts не трактуется как pass. Component остаётся pending/held либо не рассчитывается согласно активному fail-closed правилу.

## 9. Additional-task component — после MVP

Компонент не входит в MVP и вынесен в `post-mvp-backlog-2026-07-29.md`. Для текущего P0-среза обязательно только отсутствие скрытого начисления.

Ниже сохранены будущие продуктовые inputs; они не являются требованием реализации или acceptance текущего MVP:

- название;
- единицу `task / hour / quantity`;
- rate и currency;
- обязательное evidence;
- approver;
- limits;
- duplicate identity;
- compensation period;
- effective version.

После отдельного возврата функции из post-MVP backlog дополнительные задания могут получить собственный approval contract. В текущем MVP evidence не создаёт оплату.

## 10. Период расчёта

Стартовый compensation period — **weekly**.

Через админ-панель можно выбрать:

- per session;
- daily;
- weekly;
- monthly.

Для period сохраняются timezone, start/end, close date и active rule version. Изменение периода действует на новые периоды. Уже открытый период сохраняет прежний snapshot.

Закрытие weekly period:

1. показывает preview по каждому Агенту и component;
2. выявляет configuration incidents, holds и unresolved corrections;
3. не включает неподтверждённые строки в payout;
4. фиксирует итоговую версию breakdown;
5. передаёт разрешённые суммы в существующий payout process.

## 11. Курс и units

Если calculation base и payout используют разные units, курс управляется в админ-панели.

Обязательны:

- source unit;
- target currency;
- numeric rate;
- precision;
- rounding;
- effective date/time;
- scope;
- version;
- preview;
- author и причина.

Accrual сохраняет использованный conversion snapshot. Изменение курса не пересчитывает историческую строку.

Missing/invalid rate действует fail-closed: сумма не рассчитывается и не попадает в payout.

## 12. Refund и correction

Только успешный refund movement G2.3 создаёт trigger correction.

Правила:

1. Full refund создаёт отрицательную correction по всей attributable eligible части.
2. Partial refund создаёт пропорциональную correction по фактически возвращённой eligible части.
3. Если конкретный refund имеет разрешённый override базы/процента, сохраняются исходный и итоговый preview, автор и причина.
4. Correction использует policy snapshot исходного accrual, а не текущую ставку.
5. Correction не затрагивает unrelated components.
6. Повторное refund event не создаёт вторую correction.
7. Если исходный period уже закрыт/выплачен, correction переносится в допустимый adjustment period со ссылкой на исходную session и payout.
8. Ошибка correction оставляет финансовый case открытым для retry и не создаёт ложный success.

## 13. Ручной override

Super-admin может изменить рассчитанный результат только в рамках разрешённого action:

- hold/release;
- eligible-base exception;
- rate/percentage exception для конкретного случая;
- correction adjustment;
- status correction до payout;
- linkage repair.

Перед confirm показываются:

- исходный результат;
- предлагаемое значение;
- разница;
- затронутый period;
- связь с session/refund/payout;
- последствия для Agent;
- обязательная reason category и comment.

Completed financial fact не удаляется. Ошибка исправляется новой append-only записью.

## 14. Состояния

### Consultation accrual

- `recorded` — session ledger fact сохранён;
- `configuration_pending` — обязательное active rule/value отсутствует;
- `calculated` — сумма рассчитана по snapshot;
- `held` — строка временно исключена из payout с причиной;
- `eligible_for_payout` — строка прошла применимые guards;
- `included_in_payout` — связана с существующим payout;
- `settled` — payout process подтвердил итог;
- `corrected` — есть связанная correction;
- `cancelled` — только для ошибочно созданного до payout кандидата с audit; исходная запись не удаляется.

### Correction

- `pending`;
- `calculated`;
- `approved`;
- `included_in_adjustment`;
- `settled`;
- `failed`.

Статус payout принадлежит существующему payout process и не подменяется статусом accrual.

## 15. Админ-панель: настройки

В существующем `/ru/admin/settings/index` добавляется пункт **«Вознаграждение Агентов»**, ведущий на `/ru/admin/settings/accruals`. Это единственный маршрут-владелец configuration начислений; policy, ставки, conversion, периоды и версии не редактируются на partner pages.

Настройки содержат:

- один consultation component; post-MVP components на странице отсутствуют;
- active/draft/retired versions;
- weekly default и другие periods;
- процент/ставка consultation;
- eligible base;
- conversion;
- scope/priority;
- limits/rounding;
- refund correction;
- permissions;
- preview;
- audit/rollback.

На странице нет:

- client prices/packages;
- refund approval;
- support queue;
- assignment editor;
- public rating;
- банковских реквизитов;
- списка фактических выплат.

## 16. Админ-панель: операционная работа

Существующие страницы сохраняются и расширяются:

- `/ru/admin/partner/payments?id={agentId}` — operation/readback начислений и breakdown Агента;
- `/ru/admin/partner/payouts?id={agentId}` — operation/readback фактических payout periods/operations;
- `/ru/admin/partner/payments?id={agentId}&mode=minus` — operation/readback отрицательных corrections/удержаний.

Эти страницы не владеют configuration и не могут создавать или изменять compensation policy; настройка выполняется только на `/ru/admin/settings/accruals`.

Не создаётся параллельная вторая карточка платежей.

В каждой строке доступны:

- Agent;
- consultation component;
- period;
- session reference;
- expert profile;
- calculated amount/currency;
- policy/conversion snapshot;
- status;
- hold/correction/payout links;
- created/approved actor;
- audit.

Из карточки consultation G1.1 доступна ссылка на связанный accrual. Из accrual доступна обратная ссылка на session и refund.

## 17. Локализация и клиентская безопасность

Интерфейсные тексты создаются translation keys. На текущем этапе обязательны русский и английский.

В Agent readback и export запрещено раскрывать:

- клиентский вопрос и transcript без отдельного permission;
- точный клиентский balance;
- контакты и payment data клиента;
- чужие ставки;
- support/refund private evidence;
- fraud/security comments.

## 18. Ошибки, retry и concurrency

Система должна безопасно обрабатывать:

- duplicate session-completed event;
- два concurrent calculation;
- refund event до/после period close;
- duplicate refund event;
- reassignment между completion и calculation;
- policy или rate change во время расчёта;
- missing/invalid config;
- missing conversion;
- payout failure;
- correction failure;
- two concurrent overrides;
- unauthorized direct action;
- task evidence duplicate;
- closed-period mutation attempt;
- partial persistence failure;
- export/readback retry.

Во всех случаях сохраняется один объяснимый financial outcome без orphan amount и скрытого переписывания истории.

## 19. Критерии готового результата

### Positive

1. Completed session создаёт один session ledger fact.
2. Active consultation rule рассчитывает один accrual фактическому Агенту.
3. Две анкеты одного Агента дают отдельные session rows и единый weekly breakdown.
4. Reassignment после session не меняет получателя.
5. Новая policy применяется только к новым sessions/periods.
6. Weekly preview совпадает с суммой eligible rows.
7. Per-session/daily/monthly period можно включить новой версией.
8. Conversion snapshot объясняет payout currency.
9. Full refund создаёт одну полную attributable correction.
10. Partial refund создаёт одну пропорциональную correction.
11. Paid/closed period получает linked adjustment, а не rewrite.
12. Agent видит собственный разрешённый breakdown.
13. Super-admin восстанавливает session → rule → accrual → refund → correction → payout.

### Negative, retry и privacy

16. `unset` percentage/base не создаёт hidden accrual.
17. Disabled fixed/task component не создаёт сумму.
18. Missing conversion не попадает в payout.
19. Duplicate completion не создаёт второй accrual.
20. Duplicate refund event не создаёт вторую correction.
21. Concurrent calculation даёт один итог.
22. Reassignment не переводит историю новому Агенту.
23. Unauthorized Agent не меняет rate/status/override.
24. Agent не видит чужой breakdown или client private data.
25. Correction не делает unrelated fixed/task negative.
26. Cumulative correction не превышает attributable accrual без manual review.
27. Closed/settled row не переписывается.
28. Payout failure не помечает accrual как выплаченный.
29. Rollback configuration создаёт новую version и не меняет историю.
30. Invalid direct status transition отклоняется и попадает в audit.
31. Partial failure не оставляет amount без session/rule/Agent linkage.

Positive enablement fixed/SLA и additional-task pay проверяется только после отдельного возврата соответствующих элементов из post-MVP backlog.

## 20. Действия Игоря

### Перед реализацией

Игорь возвращает:

- карту существующих partner payments/payouts/minus и их текущих владельцев данных;
- найденные конфликты с этим ТЗ;
- proposed mapping без создания дублирующих финансовых страниц;
- permission matrix;
- план migration/backfill для старых записей;
- план positive, negative, idempotency, concurrency и reconciliation QA.

### После реализации

Игорь предоставляет:

- build/commit reference;
- список затронутых surfaces и migrations/config;
- proof session → actual Agent → policy snapshot → accrual;
- proof weekly preview/close и existing payout linkage;
- proof full/partial refund corrections;
- duplicate/concurrency/unauthorized proof;
- Agent/super-admin readback;
- version/audit/rollback proof;
- reconciliation export;
- residuals и cleanup plan.

## 21. Что не входит

- выбор initial consultation percentage и exact eligible-base economics;
- fixed/SLA pay и additional-task pay целиком;
- автоматические налоги и кадровые удержания;
- автоматическая внешняя выплата;
- банковская интеграция;
- public Expert earnings;
- изменение client balance;
- refund decision;
- KPI formula.

Открытые consultation economics values не блокируют build: поля, units, validation, `unset`, preview, version, audit и fail-closed behavior обязательны. Post-MVP components не требуют MVP-редакторов или скрытых заделов.

## 22. Граница доказательств

Этот документ доказывает согласованное желаемое поведение G2.4. Он не доказывает наличие implementation или runtime.

Наличие существующих `/partner/payments`, `/partner/payouts`, `mode=minus`, task HTML или старого финансового кода не является доказательством новой session-linked цепочки.

Runtime acceptance требует идентифицируемый build и фактическое прохождение positive/negative cases с persisted readback, audit и reconciliation.

## Служебные сведения

Задача: `G2.4`

Версия: `1.0`

Дата: `2026-07-29`

Автор постановки: `Product Owner / Project Manager Nebula`

Приоритет: `P0`, обязательное финансовое ядро до платного pilot settlement

Статус ТЗ: `spec_handoff_ready`

Связанный технический контекст: `codex-context-g2-4-agent-accruals.md`

Implementation status: `code_present_unmapped`

Runtime acceptance: `not_run`

Owner/economics gate: initial consultation percentage и exact eligible base остаются `unset`; fixed/SLA и task pay находятся после MVP
