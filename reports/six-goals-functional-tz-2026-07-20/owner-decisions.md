# Owner decisions для завершения комплекта G1-G6

Дата: 2026-07-21  
Статус: `O1_O2_O3_O6_O7_O8_R1_P1_USD_30_credits_starter_package_accepted_remaining_discount_grid_refill_O4_O5_open`

## Уже подтверждено и не требует повторного вопроса

- Одна анкета назначается одному агенту; один агент управляет многими анкетами.
- Назначение и переназначение выполняет super-admin или роль с соответствующим правом.
- Агент видит только назначенные анкеты и работает в едином workspace.
- Один активный paid chat на агента; остальные анкеты busy для нового paid start.
- Async messages принимаются в очередь, но не обслуживаются параллельно paid/pause.
- Trial обычно три минуты, длительность настраивается и видна клиенту.
- До старта клиент дает явный consent на переход в paid.
- Тарификация поминутная; каждая начатая минута оплачивается полностью.
- Balance pause управляется в админ-панели; текущее значение — 5 минут, она может быть завершена раньше и предоставляется один раз.
- Late top-up остается на балансе для новой session.
- Reassignment запрещен во время paid и pause.
- Expert profile может иметь несколько городов; город клиента используется как фильтр.
- Profile cap одного агента не вводится.
- Public rating/reviews принадлежат expert profile; internal KPI принадлежит агенту.
- Вознаграждение агента может включать consultation %, fixed/SLA и task pay; компоненты управляются независимо.
- Consultation accrual возникает сразу после консультации; refund создает отрицательную correction.
- Partial refund по умолчанию влияет пропорционально возвращенной части; super-admin может изменить базу/процент конкретного случая с причиной.
- Выключение анкеты требует причины; возвращение online при новой смене включает анкеты, кроме административно заблокированных.

## O1. Числовой SLA до limited paid pilot

`owner_decision_accepted_2026-07-21`

- Paid request accept/decline: 60 секунд.
- Первый содержательный ответ после фактического старта: 60 секунд.
- Первая реакция support: 15 минут в настроенные support hours.
- Critical payment/access/safety incident: немедленная escalation.
- Обычный breach: escalation при 2x соответствующего SLA.
- Async queue в limited pilot: operational readback без отдельного hard threshold; busy paid/pause исключается.

Все значения и режимы управляются из админ-панели. Обязательны разрешенная роль, единицы, validation, сохранение с readback, version/audit history и snapshot примененного значения. Изменение не сдвигает deadline уже начавшегося SLA-периода и применяется к новым периодам. Полный контракт — `tz-crosscut-admin-managed-settings.md`.

Решение сняло owner blocker для G4.1/G4.4/G6.2/G6.5. Runtime/admin acceptance остается открытой.

## O2. Минимальный QA scorecard и critical fail

`owner_decision_accepted_2026-07-21`

- Scorecard: максимум 100 баллов; pass = 80.
- Critical fail перекрывает общий score и блокирует/приостанавливает paid access до разрешенного решения.
- Critical fails: hidden/false billing state; prohibited guarantee; pressure/fear/dependency manipulation; missed safety escalation; foreign-data/access action; unauthorized refund/payment action; private-data disclosure; internal agent presented as public expert.
- Первичный verdict: moderator/QA lead.
- Override/unblock: super-admin с обязательной причиной.
- Re-admission: correction -> retraining -> повторный тест -> новая trial consultation -> повторный review.

По прямому решению владельца score limits, pass threshold, critical-fail registry, role bindings и re-admission workflow должны быть отдельной разработкой админ-панели. Обязательны draft/active version, validation, authorized activation, history/audit, readback и snapshot примененной версии. Полный handoff: `admin-panel-settings-development-package.md`.

Решение сняло owner blocker для G6.3 и O2-части G6.4. Runtime/admin acceptance остается открытой; O6 safety/legal approval остается отдельным gate.

## O3. KPI успешного агента перед влиянием на ротацию

`owner_decision_accepted_2026-07-21_for_pilot_readback`

- Limited pilot mode: KPI influence на public rotation = `disabled`.
- KPI используются только как operational readback/coaching evidence.
- Rolling window: текущее значение 30 дней.
- Global minimum sample до любого будущего влияния: 20 completed paid sessions и 5 QA-reviewed sessions на агента.
- Initial metric families: paid request acceptance/miss, first-response SLA, trial-to-paid, paid minutes/session duration, refund/correction и QA/critical-fail outcomes.
- New/insufficient-data agent не получает скрытый штраф или pass; показывается `insufficient_data`.
- Включение `immediate` или `after_threshold` требует отдельного owner decision после pilot review и не происходит одним техническим toggle без evidence gate.

По прямому решению владельца все изменяемые параметры KPI должны управляться в отдельном admin-экране и быть явно перечислены в ТЗ: active/mode/use, formula inputs, numerator/denominator, window/timezone, minimum sample, inclusions/exclusions, attribution, thresholds, direction, weights, normalization/caps, freshness, no-data behavior, role visibility, effective version и preview. Полный handoff: `admin-panel-settings-development-package.md`.

Решение сняло текущий owner blocker для pilot readback G5.3 и зафиксировало `disabled` для KPI-влияния G3.7. Runtime/admin proof и будущий post-pilot enablement остаются открытыми.

## O4. Полная compensation policy

Нужно утвердить перед включением соответствующего компонента:

- consultation percentage и область его применения;
- размер/условия fixed за график/SLA;
- правила оплаты additional tasks;
- случаи уменьшения/отмены каждого компонента;
- период расчета и роль, утверждающая исключения.

Это не блокирует consultation accrual/correction в limited pilot.

Функциональная/admin-модель закрыта: отдельный screen `Вознаграждение агентов` управляет consultation percentage/base, fixed/SLA, task pay, periods, scopes/overrides, caps, rounding, refund corrections, permissions, preview, versions и audit. До O4 consultation component остается `draft/unset`, fixed/SLA и task pay — `disabled`; session ledger продолжает собираться. Открытым owner/economics gate остается только initial consultation percentage и eligible-base policy, а дополнительные компоненты требуют чисел лишь перед их включением.

## O5. Public traffic gate

Нужно утвердить после получения pilot baseline:

- минимальный success rate paid-path;
- допустимые уровни billing/refund defects;
- SLA support и paid request;
- допустимый critical-fail rate;
- минимальную event coverage/freshness;
- кто дает GO и кто имеет право немедленно остановить traffic.

## O6. Обязательные клиентские правила и safety

`owner_decision_accepted_2026-07-21`

Обязательный minimum:

- клиент видит цену, trial, started-minute rule, pause/end и support/refund route;
- запрещены гарантии результата, выигрыша, исцеления, возврата партнера и точного будущего;
- запрещены давление страхом, зависимостью, искусственной незавершенностью и сокрытие paid state;
- запрещены медицинские, юридические и финансовые диагнозы/указания вместо профильной помощи;
- запрещены внешние платежи, скрытое booking pressure и передача private contacts вне утвержденного контура;
- self-harm, violence, illegal и minor-sensitive cases прекращают обычный сценарий и направляются в утвержденный support/safety route;
- при critical safety route новая paid minute не начинается; incident и примененная версия правила доступны staff, а refund остается отдельным evidence-based решением.

По прямому решению владельца prohibited-claims registry, incident categories, escalation routes, client messages и approved resources управляются в отдельном admin-разделе. Protected minimum нельзя удалить/ослабить обычным редактированием; такое изменение требует отдельного owner/legal approval. Полный handoff: `admin-panel-settings-development-package.md`.

O6 owner gate закрыт для product minimum G4.3/G6.3/G6.4/G6.5. Точный US-English wording, jurisdiction/domain review и crisis resources остаются legal/release gate, а runtime/admin proof — открытым.

Публичная достоверность личности/аватара не входит в этот пакет по прямому решению владельца.

## R1. Refund framework

`owner_decision_accepted_2026-07-21`

- Confirmed platform/agent technical failure: full или proportional refund затронутой части.
- Duplicate/incorrect debit: обязательная полная correction ошибочного движения.
- Service quality complaint без доказанного critical fail: manual no/partial/full decision по case evidence.
- Confirmed O6 violation: escalation и refund candidate; финансовый исход остается evidence-based decision.
- Client changed mind after correctly delivered started minute: no automatic refund; manual exception только с причиной.
- Повтор решения/action не создает второй refund; cumulative refund не превышает eligible historical charges.

По прямому решению владельца refund categories, modes, percentages, amount limits, claim/review periods, evidence requirements, role approvals, reason codes, rounding и auto/manual thresholds управляются в отдельном admin-экране. Все числа имеют отдельные input cells с unit, validation, allowed range, current value, preview и version/audit. Неутвержденное числовое значение остается `unset`; система не подставляет выдуманный default.

Protected invariants нельзя отключить обычной настройкой: duplicate/incorrect debit исправляется полностью, cumulative refund не превышает eligible debit, refund не создает положительную agent correction. Полный handoff: `admin-panel-settings-development-package.md`.

R1 снял policy blocker для G2.3/G4.2. Runtime/admin/money reconciliation proof остается открытым.

## P1. Credits, consultation price и packages

`owner_decision_accepted_2026-07-21_USD_and_30_credits_package_grid_open`

- Клиент всегда покупает credits; consultation price показывается в credits за started minute, а не в USD за минуту.
- Валюта покупки credit packages — `USD`; она используется только на credit package purchase/payment surface.
- Global default consultation price — `30 credits/started minute`, по текущему публичному ориентиру AskNebula. Значение управляется и версионируется в admin-панели, а не hardcoded.
- Для каждой expert profile доступен отдельный credits/minute override.
- Изменение global/override действует только на новые service sessions; начавшаяся session хранит snapshot credits/minute.
- Credit packages, discounts, coupons и bonus credits являются отдельной управляемой admin-разработкой.
- Coupon/package discount не скрывает фактический результат: до покупки видны money price/currency, purchased credits, bonus credits, coupon effect и итог.
- Стартовый package принят: `9.99 USD -> 60 credits`, что соответствует двум полным started minutes по global default `30 credits/minute`.
- Admin создает и версионирует управляемые packages минут: nominal minutes, reference credits/minute, purchased/bonus credits, list price, sale price и package discount.
- Package discount может быть задан как percent, fixed USD reduction, bonus credits или bonus minutes; stacking, limits, audience и dates управляются отдельно.
- Для profile override клиенту показывается реальное число доступных полных минут по effective profile price. Название package не может обещать одинаковое число минут для всех анкет, если цена отличается.

Все variable/numeric values имеют отдельные admin input cells: global/profile credits per minute, nominal minutes, reference rate, package list/sale price, credits amount, bonus credits/minutes, discount/coupon value, caps/minimums, usage limits, dates, stacking, expiry и balance-bucket spending rules. Принятые initial values: global `30 credits/started minute`, purchase currency `USD`, starter package `9.99 USD -> 60 credits -> 2 standard-rate minutes`. Неутвержденные дополнительные tiers остаются draft/unset; неполный package fail-closed и не активируется.

Consultation refund возвращает credits по R1 в client credit balance. Cash/payment refund покупки credit package является отдельным payment-dispute route и не смешивается с session refund.

P1 снял model blocker G2.1/G2.2/G3.3/G3.4; global price, purchase currency, starter package и управляемая discount-модель закрыты. Числовая сетка дополнительных package discounts и refill/auto-refill остаются owner/economics values. Основание и граница переноса эталона: `asknebula-pricing-benchmark-2026-07-21.md`. Полный handoff: `admin-panel-settings-development-package.md`.

## O7. Trial закончился при нулевом балансе

`owner_decision_accepted_2026-07-20`

Если consent уже дан, но на первую paid-минуту недостаточно средств, session без списания переходит в свою единственную balance pause. Длительность pause управляется в админ-панели; текущее значение — 5 минут. Примененное значение фиксируется для этой pause и не меняется при редактировании настройки во время countdown. Top-up до deadline продолжает эту session; timeout завершает ее.

Решение сняло owner blocker для G1.3/G2.2. Runtime acceptance остается открытой.

## O8. Потеря связи агентом во время paid/pause

`owner_decision_accepted_2026-07-20`

Reconnect grace управляется в админ-панели; текущее значение — 60 секунд. Примененное значение фиксируется при начале grace. Уже начатая paid minute сохраняет свой итог, новая paid minute не начинается. Возврат агента до deadline продолжает ту же session без нового trial и повторного списания. Если агент не вернулся, session получает technical end и support/refund route. Top-up за это время остается на балансе и не возобновляет завершенную session.

Во время grace все анкеты агента остаются недоступными для нового paid start. После technical end агент считается offline для новых paid requests, пока снова не включит online-смену; отдельный общий timeout для иных offline-событий этим решением не задается.

Решение сняло owner blocker для G2.2/G3.1/G6.2. Runtime acceptance остается открытой.

## O9. Request, ожидание и compact lifecycle G1.3

`owner_decision_accepted_2026-07-27`

- До принятия существует отдельный consultation request, а не service session.
- Hard expiry запроса — 15 минут; внутренний paid-request SLA 60 секунд является отдельным G6.2 clock и не закрывает request автоматически.
- Уточняющий вопрос Эксперта ожидает ответ клиента 60 минут.
- Предложение Эксперта действует 15 минут и требует явного подтверждения клиента.
- Connecting timeout — 3 минуты.
- Inactivity reminder — 2 минуты и не выполняет auto-transition.
- Waiting-client return window — 4 часа.
- Один период ожидания допускает 1 приглашение; максимум 3 цикла.
- Все значения управляются в админ-панели и snapshot в начавшемся clock.
- Session имеет compact primary states `connecting / trial / paid / balance_pause / completed`; ожидание/reconnect являются подстатусами.
- Persisted terminal state один — `completed`; initiator/type/reason/client wording хранятся отдельно.
- Support, refund, quality и appeal являются связанными процессами, а не состояниями session.

Канонические handoff: `etalon-tz-g1-3-status-history.md`, `codex-context-g1-3-status-history.md`, `product-architecture-g1-g6-ownership-map.md`.

## O10. Refund approval и appeal periods

`owner_decision_accepted_2026-07-27`

- Любой фактический refund credits подтверждает только `super-admin`.
- Автоматическое правило может создать candidate и calculation preview, но не financial action.
- Client refund request window — 30 дней после завершения session, admin-managed до legal review.
- Клиент может один раз обжаловать итоговое решение в течение 7 дней; значение admin-managed.
- Финансовая ошибка оставляет case открытым до успешного движения и корректного клиентского сообщения.
- Compensation bonus отделен от refund; обещание клиенту допустимо только после фактического grant.

## O11. Quality review и appeal Агента

`owner_decision_accepted_2026-07-27`

- Автоматический signal создает кандидата на review, но не доказанную вину.
- Quality outcomes включают dismissed, insufficient evidence, monitoring, coaching, warning, retraining/reassessment, temporary paid suspension, profile restriction, safety/legal/security escalation, block и corrected/overturned.
- Внутренний quality outcome не меняет public rating и не выполняет refund автоматически.
- Агент не видит support ticket, refund details или внутреннюю клиентскую переписку.
- Appeal Агента содержит обязательный комментарий, действует 7 дней, управляется feature toggle для новых решений и рассматривается `super-admin` в MVP.
- Уже открытая appeal не исчезает при отключении функции.

## Правило работы с открытыми решениями

Открытый owner gate не блокирует написание остальных требований. Он блокирует только включение зависящего поведения или соответствующий launch gate. Значение не подставляется по конкуренту или рекомендации модели без решения владельца.

Для build действует fail-closed правило:

- unset обязательного QA/KPI/compensation/traffic value не показывается как pass; missing/invalid SLA config не заменяет принятое последнее корректное значение и создает видимый configuration incident;
- зависимое автоматическое влияние остается disabled;
- staff видит, какое owner value отсутствует;
- изменение значения имеет версию/readback и применяется только к новым соответствующим периодам;
- O5 нельзя закрыть до появления pilot baseline.

Таким образом, открытые O4/O5, additional discount tiers и refill values больше не являются пробелами функционального ТЗ; это отдельные enablement/launch gates. USD, global `30 credits/started minute`, starter `9.99 USD -> 60 credits` и managed minute packages/discounts приняты. O1/O2/O3/O6/O7/O8/R1/P1 требуют runtime/admin proof; post-pilot KPI influence и точный legal/domain wording остаются отдельными gates.

Консервативные рекомендуемые pilot defaults и короткий формат ответа собраны в `owner-enablements-pilot-defaults-proposal.md`. Пока владелец их не подтвердил, они остаются предложением и не заменяют решения выше.
