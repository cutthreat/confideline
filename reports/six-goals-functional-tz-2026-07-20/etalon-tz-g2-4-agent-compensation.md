# ТЗ для Игоря - G2.4 «Начисления и выплаты Агентам»

Документ описывает продуктовую логику. Технический способ реализации определяет Игорь.

## 1. Цель

Создать прозрачный и управляемый контур вознаграждения Агентов, в котором каждое начисление:

- связано с конкретной завершенной consultation session;
- относится к фактическому Агенту, который вел экспертную анкету во время этой session;
- рассчитывается по сохраненной версии правил;
- отдельно показывает положительное начисление, удержание, возвратную корректировку и фактическую выплату;
- объяснимо через минуты, списанные credits, процент, курс и округление;
- не смешивается с клиентским балансом, публичной статистикой Эксперта и legacy-расходами партнера.

Результат G2.4 - super-admin может открыть конкретного Агента или расчетный период и восстановить полную цепочку:

`consultation session -> списанные credits -> eligible base -> 30% -> USD conversion -> hold -> weekly period -> manual payout -> refund correction`.

Наличие ТЗ, HTML и DOCX подтверждает готовность спецификации, но не готовность реализации на сайте.

## 2. Место G2.4 в общем продукте

G2.4 использует результаты соседних задач:

- G1.1 хранит карточку consultation и actual Agent;
- G1.3 определяет завершение consultation и причины abnormal end;
- G2.1 хранит credits, их источник, цену и курс;
- G2.2 создает started-minute debit;
- G2.3 создает refund и связанную отрицательную correction;
- G4 хранит support/refund/quality evidence;
- G6.1 определяет, какой Агент фактически управлял экспертной анкетой в момент session.

G2.4 не отвечает за:

- продажу credits клиенту;
- списание started minute;
- принятие refund-решения;
- изменение terminal status consultation;
- публичный рейтинг Эксперта;
- автоматический банковский перевод;
- расчет налогов, договоров и бухгалтерской отчетности вне платформы.

## 3. Термины

### Агент

Внутренний сотрудник, который ведет одну или несколько публичных экспертных анкет. Начисление относится к actual Agent конкретной session, а не к текущему владельцу анкеты.

### Consultation accrual

Положительное начисление за завершенную consultation session.

### Eligible credits

Credits, фактически списанные за оказанные started minutes и разрешенные активной compensation policy.

### Compensation percentage

Доля eligible credits, формирующая вознаграждение Агента. Стартовое значение - **30%**.

### Compensation credits

Расчетная единица внутри формулы вознаграждения. Она не является клиентским балансом и не может быть потрачена на сайте.

### Conversion rate

Управляемый курс перевода compensation credits в валюту выплаты. Стартовое значение - **1 credit = 0.1665 USD**.

### Hold

Период между созданием начисления и допуском к выплате. Стартовое значение - **7 календарных дней**.

### Calculation period

Период группировки доступных начислений и corrections. Стартовый режим - **еженедельно, понедельник-воскресенье**.

### Negative correction

Отдельная отрицательная запись, связанная с исходным начислением. Она не переписывает исходную consultation и уже выполненную выплату.

### Manual payout

Подтвержденная super-admin фактическая выплата вне автоматической банковской интеграции с сохранением суммы, даты, способа и reference.

## 4. Роли и видимость

### Super-admin

На первом этапе только super-admin:

- управляет compensation policy;
- видит все начисления, удержания, периоды и выплаты;
- открывает расчет конкретной session;
- ставит и снимает ручной hold с причиной;
- создает разрешенную ручную correction;
- закрывает расчетный период;
- подтверждает и отмечает выплату выполненной;
- видит audit, внутренние причины и связанные refund/quality cases.

### Агент

В MVP отдельный доступ Агента к расчетам не включается. Архитектура должна позволить позднее выдать permission на просмотр только собственного breakdown без чужих ставок, клиентского баланса, support evidence и внутренних fraud/safety данных.

### Эксперт и клиент

Публичный Эксперт и клиент не видят внутреннюю compensation policy, процент, курс, начисление или выплату Агенту.

## 5. Обязательные invariants

1. Одно завершение одной consultation создает не более одного исходного consultation accrual.
2. Начисление без `service session`, actual Agent, expert profile и policy snapshot запрещено.
3. Reassignment анкеты после session не переносит историческое начисление новому Агенту.
4. Compensation credits не являются клиентскими credits и не изменяют клиентский balance.
5. Публичный доход/рейтинг Эксперта не является источником расчета зарплаты Агента.
6. Изменение процента, курса или source toggle действует только на новые применимые session.
7. Refund не редактирует исходное начисление, а создает отдельную negative correction.
8. Legacy-расходы партнера на premium, gifts, spotlight, groups и другие функции не уменьшают вознаграждение Агента.
9. Повторная доставка события, reload или double click не создают второе начисление, correction или payout.
10. Выплаченный период immutable; исправление отражается в следующем разрешенном периоде.
11. Автоматический банковский перевод в MVP запрещен.
12. Fixed/SLA и additional-task components по умолчанию `disabled`.

## 6. Стартовая compensation policy

Для limited pilot применяется:

| Параметр | Стартовое значение | Управление |
|---|---:|---|
| Consultation component | active | super-admin |
| Compensation percentage | 30% | numeric input, versioned |
| Purchased credits | included | отдельный toggle |
| Welcome credits | included | отдельный toggle |
| Trial credits/minutes | included | отдельный toggle |
| Promo credits | included | отдельный toggle |
| Compensation credits клиента | included | отдельный toggle |
| Refunded/erroneous/reversed credits | excluded | обязательное правило |
| Conversion rate | 0.1665 USD за credit | numeric input, versioned |
| Hold | 7 календарных дней | numeric input |
| Period | weekly, Monday-Sunday | selector + timezone |
| Payout execution | manual | автоматический payout disabled |
| Fixed/SLA component | disabled | отдельное будущее включение |
| Additional-task pay | disabled | отдельное будущее включение |

Каждый source toggle включается и выключается независимо. Неописанный или неизвестный источник credits обрабатывается fail-closed: он не попадает в payable amount, а запись получает configuration review.

## 7. Формула начисления

Для одной завершенной session:

1. Система берет фактически списанные credits за оказанные started minutes.
2. Из списания выбираются credit sources, включенные активной policy.
3. Исключаются erroneous, reversed и уже refunded credits.
4. Полученное число является `eligible_credits`.
5. Рассчитываются compensation credits:

`eligible_credits × compensation_percentage`.

Шаг 6. Рассчитывается USD amount:

`compensation_credits × conversion_rate`.

Шаг 7. В начислении сохраняются исходные значения, версия policy, промежуточный расчет и итог.

Внутренний расчет хранит достаточную точность для воспроизведения результата. Денежный итог периода округляется до двух знаков. Способ округления и внутренняя precision управляются в админ-панели и сохраняются в policy snapshot.

## 8. Пример расчета

Условия:

- 10 paid minutes;
- 30 credits за started minute;
- фактически списано 300 credits;
- все sources разрешены;
- compensation percentage 30%;
- conversion rate 0.1665 USD.

Расчет:

- eligible credits: 300;
- compensation credits: 90;
- USD before final rounding: 14.985;
- отображаемый итог: 14.99 USD.

Если позднее клиенту возвращено 60 eligible credits:

- negative correction: 60 × 30% = 18 compensation credits;
- USD correction: 18 × 0.1665 = 2.997 USD;
- после округления correction: -3.00 USD;
- историческое исходное начисление 14.99 USD не переписывается.

## 9. Момент создания начисления

Consultation accrual создается сразу после корректного terminal completion session.

Начисление не создается, если:

- consultation фактически не стартовала;
- нет ни одного оказанного started minute или разрешенного trial entitlement;
- debit не подтвержден;
- session duplicate/fraud record;
- отсутствует actual Agent;
- нет активной валидной compensation policy;
- событие завершения не прошло idempotency check.

Если policy отсутствует или невалидна, session ledger сохраняется, а super-admin получает configuration incident. Скрытое нулевое начисление запрещено.

## 10. Hold и доступность к выплате

Сразу после расчета начисление получает статус `Ожидает окончания hold`.

Стартовое значение hold - 7 календарных дней от времени завершения consultation. Значение:

- управляется в админ-панели;
- сохраняется snapshot в начислении;
- не изменяется задним числом при редактировании настройки;
- может быть продлено ручным hold только super-admin с причиной.

После истечения hold начисление становится доступным для ближайшего открытого weekly period, если нет активного refund, dispute, quality или financial incident.

Открытый review удерживает только затронутое начисление. Остальные начисления этого Агента проходят обычный путь.

## 11. Расчетный период

Стартовый период:

- weekly;
- понедельник 00:00 - воскресенье 23:59;
- timezone задается в админ-панели;
- период создается системой, но закрывается вручную super-admin.

Начисление входит в первый период, в котором одновременно:

- истек его hold;
- нет блокирующего review;
- policy и attribution валидны;
- период еще не закрыт.

Изменение period type применяется только к новым периодам. Уже открытый или закрытый период сохраняет прежние границы.

## 12. Статусы начисления

Используются понятные продуктовые состояния:

- `Рассчитано`;
- `Ожидает окончания hold`;
- `На проверке`;
- `Доступно к выплате`;
- `Включено в период`;
- `Выплачено`;
- `Скорректировано`;
- `Отменено как ошибочное`.

Причина hold/review/cancel хранится отдельно от основного статуса.

## 13. Refund и negative correction

G2.3 передает в G2.4 только фактически исполненный refund result.

Если refund выполнен до выплаты:

- создается negative correction;
- correction включается в тот же или ближайший открытый period;
- payable amount уменьшается;
- исходное начисление остается неизменным.

Если refund выполнен после выплаты:

- выполненный payout не переписывается;
- correction переносится в следующий расчетный период;
- автоматическое списание с банковского счета или платежного метода Агента запрещено;
- при недостатке будущих начислений случай остается видимым до ручного решения super-admin.

Cumulative corrections не могут превышать attributable consultation accrual. Excess уходит в manual review и не создает скрытый долг.

## 14. Другие удержания

На действующей странице `/ru/admin/partner/payments?id={agentId}&mode=minus` уже показываются legacy-расходы партнера.

После G2.4 страница должна явно разделять:

- compensation correction по refund;
- ручную compensation correction;
- разрешенное удержание по отдельному активному правилу;
- legacy credit spending партнера.

Только записи compensation contour влияют на payout. Premium, gifts, spotlight и другие клиентские/partner balance расходы не являются зарплатным удержанием.

## 15. Ручная correction

Super-admin может создать ручную correction только при наличии:

- выбранного Агента;
- связанного исходного accrual или расчетного периода;
- типа correction;
- суммы и единицы;
- обязательной причины;
- evidence/reference;
- preview старого и нового итога.

Ручная correction append-only. Удаление или скрытое редактирование финансового факта запрещено.

## 16. Фактическая выплата

Автоматическая платежная интеграция не входит в MVP.

Super-admin:

1. Открывает расчетный период.
2. Проверяет список Агентов и breakdown.
3. Выбирает Агента.
4. Видит planned amount, corrections и final amount.
5. Выполняет платеж вручную вне системы.
6. Нажимает «Отметить выплаченным».
7. Указывает фактическую сумму, валюту, дату, способ выплаты, reference и комментарий.
8. Подтверждает действие.

До подтверждения запись не считается выплаченной. Отметка `paid` не должна инициировать внешний платеж.

## 17. Existing partner pages - обязательное переиспользование

На действующем сайте подтверждены страницы:

- `/ru/admin/partner/payment-info?id={agentId}` - платежная информация;
- `/ru/admin/partner/payments?id={agentId}` - начисления;
- `/ru/admin/partner/payouts?id={agentId}` - выплаты;
- `/ru/admin/partner/payments?id={agentId}&mode=minus` - удержания;
- `/ru/admin/partner/update-balance?id={agentId}` - legacy редактирование platform balance.
- G2.4 не создает вторые карточки тех же фактов и расширяет перечисленные страницы.

### «Начисления»

Существующая страница расширяется:

- типом `Consultation compensation`;
- ссылкой на consultation;
- expert profile;
- actual Agent;
- eligible credits;
- процентом;
- conversion snapshot;
- USD amount;
- статусом hold/review;
- policy version.

### «Выплаты»

Существующая таблица с Plan/Fact расширяется:

- расчетным периодом;
- planned, correction и final amount;
- валютой;
- статусом;
- датой подтверждения;
- payment method;
- reference;
- связью с breakdown.

### «Удержания»

Существующая страница получает отдельную category/filter и запрещает смешивать compensation correction с legacy credit spending.

### «Платежная информация»

Существующая страница остается владельцем реквизитов. G2.4 только использует выбранный способ в manual payout record и не создает копию реквизитов.

## 18. Новые административные поверхности

### Финансы -> Вознаграждение агентов

В существующем разделе «Финансы» создается пункт **«Вознаграждение агентов»**:

`/ru/admin/agent-compensation/index`.

Страница является общей операционной сводкой:

- Агенты;
- текущий период;
- рассчитано;
- на hold;
- на проверке;
- corrections;
- доступно к выплате;
- выплачено;
- незакрытые проблемы;
- переход в карточку Агента и период.

Она не заменяет существующие partner pages, а агрегирует их.

### Настройки -> Настройки вознаграждений

В `/ru/admin/settings/index` создается страница:

`/ru/admin/settings/agent-compensation`.

Название пункта: **«Настройки вознаграждений»**.

Здесь находятся только правила:

- component states;
- percentage;
- отдельные source toggles;
- conversion rate/currency;
- hold;
- weekly period/timezone;
- rounding/precision;
- scopes и overrides;
- correction rules;
- permissions;
- effective date;
- versions, preview и audit.

Операционные начисления и выплаты на странице настроек не размещаются.

## 19. Global, group и Agent override

Policy поддерживает:

1. global default;
2. group override;
3. individual Agent override.

Приоритет:

`individual Agent -> Agent group -> global`.

Super-admin всегда видит effective rule и причину, почему применена именно она. Неявное объединение конфликтующих правил запрещено.

## 20. Fixed/SLA component

Интерфейс конфигурации предусматривается, но component стартует `disabled`.

Пока component выключен:

- фикс не рассчитывается;
- SLA не уменьшает consultation accrual;
- отсутствие числа не трактуется как нулевой долг;
- UI явно показывает «Выключено».

Включение требует отдельной active policy со ставкой, условиями, периодом и правилами уменьшения.

## 21. Additional-task pay

Интерфейс конфигурации предусматривается, но component стартует `disabled`.

Будущее правило должно поддерживать task type, rate, evidence, approver, duplicate key, limit и period. До отдельного включения никакие task accrual не создаются.

## 22. Snapshots и audit

Каждое начисление сохраняет:

- consultation/session reference;
- expert profile;
- actual Agent;
- completed time;
- started minutes;
- debit references;
- credit source breakdown;
- eligible credits;
- compensation percentage;
- compensation credits;
- currency и conversion rate;
- precision/rounding;
- hold duration/deadline;
- policy id/version;
- calculated amount;
- status и reasons.

Каждая policy version, correction, hold, period close и payout хранит:

- old/new;
- actor;
- timestamp;
- обязательную причину для ручного изменения;
- связанные evidence/reference;
- результат preview.

Исторический расчет должен воспроизводиться без использования текущих настроек.

## 23. Уведомления и readback

В MVP обязательны внутренние административные уведомления:

- отсутствует валидная policy;
- начисление не имеет actual Agent;
- неизвестный credit source исключен fail-closed;
- hold просрочен, но начисление не попало в period;
- review блокирует выплату;
- correction превышает допустимый остаток;
- period содержит reconciliation mismatch;
- manual payout не имеет reference;
- retry/double action был отклонен.

Автоматическая отправка клиенту или Агенту данных о внутреннем вознаграждении запрещена.

## 24. Ошибки, retry и concurrency

Система должна безопасно обрабатывать:

- два события completion одной session;
- session завершилась во время изменения policy;
- одновременно пришли completion и refund;
- refund повторно доставлен;
- refund пришел после period close;
- refund пришел после payout;
- reassignment произошел сразу после completion;
- два super-admin одновременно закрывают period;
- два super-admin подтверждают один payout;
- manual payout отмечен paid с другой суммой;
- source toggle изменился после session;
- conversion rate изменился после session;
- неизвестный credit source;
- negative correction больше исходного accrual;
- legacy minus ошибочно пытаются включить в salary;
- closed period пытаются редактировать задним числом.

Во всех случаях финансовые факты остаются объяснимыми, append-only и защищенными от дублей.

## 25. Критерии готового результата

### Positive

1. Завершенная paid consultation создает одно начисление actual Agent.
2. 300 eligible credits при 30% дают 90 compensation credits.
3. Курс 0.1665 дает воспроизводимый USD amount.
4. Purchased, welcome, trial, promo и compensation sources включаются независимо.
5. Отключенный source не попадает в eligible base.
6. Начисление сразу видно, но находится на 7-day hold.
7. После hold начисление входит в ближайший weekly period.
8. Period формируется по configured timezone.
9. Partner «Начисления» показывает consultation breakdown.
10. Partner «Выплаты» показывает Plan/Fact, period и reference.
11. Partner «Удержания» отделяет refund correction от legacy spending.
12. Payment info переиспользуется без копирования.
13. Partial refund создает пропорциональную negative correction.
14. Refund после payout переносится в будущий period.
15. Reassignment не меняет historical Agent.
16. Super-admin вручную отмечает выплату paid.
17. Fixed/SLA и task components остаются disabled.
18. Изменение policy применяется только к новым session/period.
19. Global/group/Agent priority объясняется в readback.
20. Исторический расчет воспроизводится по snapshot.

### Negative, privacy и concurrency

1. Duplicate completion не создает второе начисление.
2. Duplicate refund не создает вторую correction.
3. Double payout confirm не создает вторую выплату.
4. Клиентские credits не изменяются compensation calculation.
5. Compensation credits нельзя потратить на сайте.
6. Legacy premium/gifts/spotlight не уменьшают зарплату.
7. Unknown source не включается скрыто.
8. Missing policy не создает скрытый zero accrual.
9. Missing actual Agent блокирует payout и создает incident.
10. Correction не превышает attributable accrual.
11. Closed/paid period не переписывается.
12. Refund не меняет unrelated fixed/task component.
13. Agent/Expert/Client не получают super-admin financial access.
14. Manual correction без причины запрещена.
15. Paid mark без amount/date/method/reference запрещен.
16. Изменение процента или курса не переписывает историю.
17. Concurrent period close дает один результат.
18. External payment не запускается из MVP UI.

## 26. Действия Игоря

### Перед реализацией

Игорь:

- показывает фактические модели и controllers существующих partner payments/payouts;
- определяет, какие поля и таблицы можно безопасно расширить;
- подтверждает границу legacy balance transactions и compensation ledger;
- показывает связь с service session, debit и refund records;
- выбирает технический способ реализации;
- сообщает PM только о расхождениях, влияющих на продуктовую логику.

### После реализации

Игорь предоставляет:

- build/commit reference;
- список измененных маршрутов и экранов;
- mapping существующих и новых сущностей;
- positive/negative/concurrency tests;
- proof exactly-once accrual/correction/payout;
- proof historical actual-Agent attribution;
- policy/admin readback и snapshots;
- weekly period reconciliation;
- proof separation legacy minus vs compensation correction;
- role-positive и role-negative proof;
- screenshots основных admin states;
- список известных ограничений.

## Основание продуктового решения

- Владелец подтвердил 30% как стартовый consultation percentage.
- Percentage управляется из админ-панели.
- Purchased, welcome, trial, promo и compensation sources включаются независимо.
- Conversion rate управляется из админ-панели; стартовое значение 0.1665 USD.
- Начисление создается сразу, hold стартует с 7 дней и управляется настройкой.
- Период weekly и управляется настройкой.
- Выплата выполняется вручную; автоматический банковский payout не входит.
- Refund после payout переносится negative correction в будущий period.
- Fixed/SLA и additional-task components остаются disabled.
- На live-сайте проверены существующие partner payment-info, payments, payouts и minus surfaces; они должны быть расширены, а не продублированы.

## Служебные сведения о документе

- Задача: G2.4.
- Версия: 1.0.
- Дата: 2026-07-28.
- Приоритет: P1.
- Автор постановки: Product Owner / Project Manager Nebula.
- Статус спецификации: `spec_handoff_ready`.
- Статус реализации: `implementation_runtime_open`.
- Связанный технический контекст: `codex-context-g2-4-agent-compensation.md`.
