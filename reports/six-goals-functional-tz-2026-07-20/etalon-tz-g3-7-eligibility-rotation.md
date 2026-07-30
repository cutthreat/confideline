# ТЗ для Игоря — G3.7 «Допуск, выдача и ротация экспертных анкет»

## 1. Цель

Создать единую объяснимую систему, которая для каждой клиентской поверхности:

1. определяет, какие экспертные анкеты можно показать;
2. определяет разрешённые действия для каждой анкеты;
3. упорядочивает только допустимые анкеты;
4. сохраняет стабильный результат в рамках одного просмотра;
5. позволяет super-admin заранее увидеть и объяснить фактическую выдачу.

Eligibility и ranking должны быть разделены. Высокий вес, pin или KPI никогда не обходят блокировку, недопуск, отсутствие назначения, невалидную цену или запрет paid-старта.

## 2. Место G3.7 в общем продукте

```text
profile data + G3.6 completeness/blocker input
+ admission/assignment
+ public/content/safety status
+ surface/topic/language/region context
+ availability/action inputs
-> G3.7 display/action eligibility result
-> ranking/rotation rules
-> versioned preview
-> public list
-> повторная start validation в G3.4/G1
```

G3.7 владеет правилами допуска к выдаче и порядком. Она не владеет содержимым профиля, ценой, session state, KPI definitions или финансовым стартом.

Минимум V3 limited paid pilot: eligibility для полного registry поверхностей, manual order/pin/priority с preview и audit, `KPI mode = disabled`. Автоматическая KPI-ротация и масштабирование относятся к V5 и не блокируют bounded pilot.

## 3. Термины

### Display eligibility

Решение, можно ли показать анкету на конкретной поверхности.

### Action capability

Разрешённые клиентские действия при текущем состоянии: открыть профиль, написать, включить уведомление или перейти к request flow.

### Fresh paid-start guard

`paid_start_eligible` — отдельная свежая транзакционная проверка возможности перейти к фактическому paid-старту. Она не является capability каталога, не кэшируется вместе с выдачей и не принадлежит G3.7. Показ анкеты или возможность создать consultation request не означают разрешение paid-старта.

### Ranking

Определение порядка среди уже допустимых анкет.

### Surface

Полный стабильный registry состоит ровно из восьми IDs: `home`, `dashboard_catalog`, `country`, `city`, `category`, `matching_result`, `thematic_block`, `expert_profile`.

### Pin

Закрепление допустимой анкеты в заданной позиции/scope.

### Priority

Управляемое преимущество допустимой анкеты перед анкетами с меньшим значением в том же scope.

### Weight

Относительное влияние допустимой анкеты на порядок или частоту ротации. Weight не гарантирует позицию.

### Insufficient data

Явное состояние отсутствия достаточной выборки. Оно не равно нулевому качеству.

### Ranking snapshot

Версия правил, входной контекст, eligibility decisions, применённые факторы и полученный порядок одного логического просмотра.

## 4. Роли

### Гость и клиент

Видят допустимые анкеты, реальные статусы, понятный порядок и безопасный empty state. Не видят внутренние формулы, KPI Агента и закрытые причины.

### Эксперт

Является публичной анкетой в выдаче. Не управляет своим pin/priority/weight и не видит чужие внутренние показатели.

### Агент

Управляет только назначенными анкетами в разрешённых operational действиях. Не может менять eligibility/ranking.

### Модератор

Может применять только выданные permissions к content/safety/quality status. Не редактирует глобальную политику выдачи без отдельного права.

### Super-admin

Управляет версиями, surface scopes, exclusions, pin/priority/weight, видит preview, причины и audit. В MVP все настройки G3.7 доступны только super-admin.

## 5. Eligibility до ranking

Для каждой анкеты G3.7 возвращает один канонический контракт:

- `display_eligible: boolean` — можно ли показывать анкету на этой поверхности;
- `capabilities: string[]` — разрешённые действия `open_profile`, `send_free_message`, `notify_availability`, `create_consultation_request`;
- `reason_codes: string[]` — стабильные машинные причины решения.

При `display_eligible=false` обязательны `capabilities=[]` и хотя бы один `reason_code`. `create_consultation_request` разрешает только вход в request/consent flow и не равен paid-start.

Решение учитывает:

- профиль опубликован;
- профиль прошёл применимую модерацию;
- нет admin/safety block;
- пройден требуемый admission;
- существует допустимое assignment;
- G3.6 вернул актуальную completeness/blocker оценку, и применимые blockers отсутствуют;
- есть применимая цена, если поверхность показывает paid action;
- анкета соответствует surface scope;
- язык и тема совместимы с явным клиентским контекстом;
- region соответствует только там, где он является обязательным scope;
- текущее состояние profile/Agent допускает конкретное действие;
- нет глобального paid-lock для нового paid request.

Admission является обязательным versioned input от G6.4. Если применимый admission отсутствует, просрочен или не подтверждён, G3.7 действует fail-closed: анкета не получает `display_eligible=true` и consultation capabilities, а decision сохраняет соответствующий `reason_code`. G3.7 не создаёт и не редактирует admission.

Busy/offline анкета может оставаться видимой, если разрешён бесплатный диалог или уведомление, но не получает ложный paid CTA.

G3.6 не принимает финальное решение о показе или действиях: он возвращает только `completeness_pass`, `blocker_codes`, `completeness_version` и время оценки. G3.7 объединяет этот input с admission, assignment, content/safety, surface scope, availability и price-state и формирует канонический контракт.

Перед фактическим paid-стартом G1/G2/G6 внутри той же транзакционной границы, где создаётся session и резервируется/списывается стоимость, заново проверяют assignment, admission, текущее состояние, effective price, balance/trial, consent, идемпотентность и session locks. Только этот свежий ответ может содержать `paid_start_eligible`; отказ не создаёт session и не списывает credits.

## 6. Surface scopes

### `home`

Показывает ограниченный срез общего eligible pool. Отдельный дублирующий ручной список Экспертов не создаётся.

### `dashboard_catalog`

География является дополнительным, а не обязательным ограничением. Приоритетны тема, специализация, язык, метод, доступность и цена.

### `country` и `city`

Region assignment является жёстким surface scope. Один Эксперт может быть связан с несколькими регионами и появляется на каждом допустимом, но не дублируется внутри одного списка.

### `category`

Явно выбранная клиентская тема является обязательным контекстом. Связь должна быть объяснима через taxonomy.

### `matching_result`

Использует ответы G3.4 как контекст, но применяет те же eligibility и ranking rules, а не отдельную скрытую формулу.

### `thematic_block`

Каждый блок имеет явно заданный scope и собственный readback.

### `expert_profile`

Управляет доступностью публичного профиля и его допустимых CTA без создания отдельного каталожного решения.

Все восемь surface records существуют в registry явно. Если используется общая base policy, каждая surface хранит `base_policy_ref`, field-level overrides и effective version; неуказанная или скрытая inheritance запрещена. Изменение одной поверхности не должно молча менять другую.

## 7. Ranking среди допустимых анкет

Допустимые факторы:

- точное соответствие теме/специализации;
- язык;
- метод;
- текущая action capability;
- цена в пределах явного фильтра;
- опыт;
- опубликованный допустимый rating/reviews;
- completeness G3.6;
- manual priority;
- weight;
- pin;
- KPI mode, только после отдельного enablement gate.

Порядок применения и значения управляются через опубликованную версию и объясняются preview. Программист определяет технический способ расчёта, но результат должен быть воспроизводим и не нарушать invariants.

## 8. Pin, priority, weight и exclusion

- Exclusion применяется до ranking.
- Pin работает только для eligible анкеты.
- Если закреплённая анкета стала недопустимой, позиция освобождается; нельзя показывать её как доступную.
- Priority сравнивается только внутри определённого scope.
- Weight не отменяет pin и не гарантирует абсолютную позицию.
- Все overrides имеют actor, reason, scope, start, expiry либо явный бессрочный статус.
- Повторное сохранение не создаёт две активные версии одного override.
- Profile cap по числу анкет одного Агента в top-N не вводится.
- Концентрация одного Агента наблюдается как метрика, но не изменяет порядок автоматически.

## 9. KPI и cold start

Поддерживаются режимы:

- `disabled`;
- `after_threshold`;
- `immediate`.

Для limited paid pilot активный режим — `disabled`.

Правила:

- наличие административного переключателя не разрешает KPI-влияние;
- `after_threshold` требует достаточной выборки;
- новая анкета/Агент получает `insufficient_data`, а не нулевой KPI;
- KPI относится к фактическому Агенту, public rating — к экспертной анкете;
- reassignment не переносит внутренний KPI предыдущего Агента;
- переход из `disabled` требует post-pilot owner/evidence gate;
- invalid/missing KPI configuration не заменяется выдуманным default и оставляет влияние disabled.

## 10. Стабильность выдачи

В рамках одного логического просмотра:

- pagination не создаёт дублей или пропусков;
- повторное открытие страницы с тем же snapshot не меняет порядок без причины;
- одинаковые результаты имеют стабильное разрешение tie;
- изменения rule version, явных фильтров или состояния могут создать новый результат;
- устаревшая выдача не авторизует paid-start: перед действием выполняется актуальная проверка;
- multi-city/topic совпадения не создают две карточки одной анкеты.

## 11. Empty и degraded states

Если eligible результатов нет:

- не показывать фиктивные анкеты;
- объяснить отсутствие результата безопасной формулировкой;
- предложить изменить фильтр;
- открыть общий каталог;
- показать офлайн/занятых только с корректным разрешённым действием;
- предложить уведомление, если функция включена.

При недоступности ranking dependency система может использовать последнюю допустимую опубликованную версию и детерминированный safe fallback среди eligible анкет. Она не может расширить eligibility.

## 12. Админ-панель: preview и версии

Логичное место — отдельная страница «Выдача Экспертов».

Владельцем страницы и её операций на первом этапе является super-admin. Позднее доступ назначается через существующий permissions; отдельная роль внутри G3.7 не создаётся.

Для preview super-admin задаёт:

- surface;
- язык;
- тему/категорию;
- страну/город;
- состояние пользователя;
- filters;
- момент/версию;
- число результатов.

Preview показывает:

- входной контекст;
- применённую версию;
- eligible и excluded анкеты;
- причину каждого решения;
- разрешённые действия;
- применённые ranking factors;
- pin/priority/weight;
- `insufficient_data`;
- итоговый порядок;
- предупреждения конфигурации.

Изменения проходят draft → preview → publish → effective time. Rollback создаёт новую версию. Фактическая выдача для тех же входов и версии должна совпадать с preview.

## 13. Админ-панель: управляемые настройки

Единственный owner-route — `/ru/admin/settings/expert-ranking`, страница «Выдача Экспертов». Она управляет только eligibility, scope и порядком выдачи, использует профиль, taxonomy, цены, admission, KPI definitions и review moderation как внешние канонические источники и не создаёт их копии. Другие административные страницы показывают только read-only applied version/readback и ссылку на этот редактор.

Управляются:

- полный registry восьми stable surface IDs;
- явные `base_policy_ref` и field-level overrides/readback без скрытой inheritance;
- eligibility rules;
- region/topic/language scope;
- разрешённая видимость busy/offline;
- fallback actions;
- result limits;
- pin;
- priority;
- weight;
- exclusions;
- override scope/dates;
- stable-order policy;
- KPI mode и enablement status;
- draft/current version;
- effective time;
- preview;
- audit/history;
- rollback.

Не редактируются:

- profile field content;
- prices/packages;
- session lifecycle;
- assignment permissions;
- KPI definitions;
- review moderation;
- notification templates.

## 14. Ошибки, retry и concurrency

- Две публикации одновременно: активируется одна последовательная версия.
- Повтор publish: не создаёт дубликат версии или override.
- Анкета изменила state между preview и public request: start validation использует актуальное состояние.
- Assignment изменился: historical ranking snapshot остаётся, новые решения используют новое назначение.
- Pin ссылается на blocked profile: анкета исключается, staff видит configuration warning.
- KPI provider недоступен при disabled mode: выдача работает без KPI.
- KPI provider недоступен при будущем enabled mode: используется утверждённое fail-closed/fallback правило, причина видна; eligibility не расширяется.
- Частичный сбой preview: результат не публикуется как полный.
- Невалидное обязательное значение: draft не активируется.
- Translation отсутствует: клиент не видит technical key.

## 15. Обязательные invariants

1. Eligibility всегда раньше ranking.
2. Ranking не делает blocked/unadmitted/unassigned анкету допустимой.
3. G3.7 catalog capability не является `paid_start_eligible`; paid-start разрешает только свежий транзакционный guard G1/G2/G6.
4. Busy/offline не получают ложный paid CTA.
5. Region является hard scope только на region surfaces или при явном фильтре.
6. Один профиль не дублируется внутри списка.
7. Public result объясним и воспроизводим.
8. Preview и public используют одну версию.
9. KPI pilot mode — disabled.
10. Missing KPI — `insufficient_data`, не zero.
11. Pin/weight/priority имеют scope и audit.
12. Нет автоматического cap анкет одного Агента.
13. Stale list не обходит актуальную start validation.
14. Исторический snapshot не переписывается.

## 16. Связанные задачи

- G3.1 — состав витрины.
- G3.2 — фильтры и списки.
- G3.3 — данные карточки.
- G3.4 — подбор и start handoff.
- G3.6 — completeness/blocker input без display/action решения.
- G5.1/G5.3 — события и KPI definitions.
- G6.1–G6.4 — assignment, SLA/state, quality и обязательный admission.
- G1/G2 — actual session и финансовые guards.

## 17. Что не входит

- контент profile fields;
- дизайн карточек;
- price calculation;
- session start;
- formula KPI;
- public rating moderation;
- paid queue;
- гарантия равной доли трафика;
- автоматический profile cap одного Агента;
- включение KPI до post-pilot gate;
- технический алгоритм хранения/расчёта.

## 18. Критерии готового результата

1. `home`, `dashboard_catalog`, `country`, `city`, `category`, `matching_result`, `thematic_block`, `expert_profile` зарегистрированы явно и работают независимо.
2. Eligibility и ranking видны раздельно.
3. Blocked/unadmitted/unassigned исключаются.
4. Busy/offline показывают только разрешённые actions.
5. Multi-region профиль не дублируется.
6. Pin не обходит eligibility.
7. Priority/weight дают объяснимый результат.
8. Pagination стабильна.
9. New profile показывает `insufficient_data`.
10. KPI disabled не влияет на порядок.
11. Preview совпадает с public result для тех же условий.
12. State change перед start не допускает ложный paid.
13. Overrides имеют reason/scope/expiry.
14. Draft/publish/rollback и historical snapshot доказаны.
15. Fixture 3–5 анкет покрывает положительные и отрицательные случаи.

## 19. Что Игорь возвращает

### До реализации

- инвентаризацию существующих controls/ranking behavior;
- карту всех surface entry points;
- перечень источников eligibility и ranking;
- список конфликтов с текущей dating-выдачей;
- предложение по version/preview/readback;
- fixture и concurrency plan.

### На QA

- build marker;
- опубликованную rule version;
- preview и public readback для всех surfaces;
- 3–5 fixtures;
- positive/negative eligibility;
- pin/priority/weight/exclusion;
- stable pagination;
- busy/offline/state-change;
- KPI disabled/insufficient_data;
- audit, rollback и cleanup.

## Основание продуктового решения

- `functional-tz-quality-standard.md`;
- `product-architecture-g1-g6-ownership-map.md`;
- `owner-decisions.md`;
- `tz-g3-catalog-profile-rotation.md`;
- принятые owner-решения по G3.1–G3.3 и региональным страницам.

## Служебные сведения о документе

- Task: `G3.7`
- Версия: `1.0`
- Дата: `2026-07-29`
- Приоритет: `P0`
- Фаза: `V3 client pilot` — eligibility + manual order при `KPI disabled`; automation/KPI scale — `V5`
- Парный технический контекст: `codex-context-g3-7-eligibility-rotation.md`
