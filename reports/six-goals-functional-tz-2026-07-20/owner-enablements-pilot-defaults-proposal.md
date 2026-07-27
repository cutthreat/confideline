# Owner enablements: рекомендуемые pilot defaults

Дата: 2026-07-20  
Статус: `O1_O2_O3_O6_R1_P1_starter_package_accepted_remaining_discount_grid_refill_proposal`  
Назначение: закрыть минимум owner gates для limited paid pilot без влияния KPI на public rotation и без преждевременного public traffic.

## O1. SLA — принято 2026-07-21

- Accept/decline paid request: 60 секунд.
- Первый содержательный ответ после фактического старта: 60 секунд.
- Первая реакция support в pilot support hours: 15 минут.
- Critical payment/access/safety incident: немедленная escalation; обычный breach — при 2x соответствующего SLA.
- Все значения admin-configurable и versioned; offline/busy exclusions сохраняются. Полный admin/readback/snapshot contract: `tz-crosscut-admin-managed-settings.md`.

## O2. QA и critical fail — принято 2026-07-21

- Scorecard: 100 баллов; pass = 80.
- Critical fail перекрывает общий score.
- Critical fails: скрытый/ложный billing state; запрещенная гарантия результата; pressure/fear/dependency manipulation; пропуск safety escalation; foreign-data/access action; unauthorized refund/payment action; раскрытие private client data; выдача internal agent за публичного эксперта.
- Первичный verdict: moderator/QA lead; override/unblock: super-admin с причиной.
- Re-admission: correction -> retraining -> повторный тест -> новая trial consultation -> повторный review.
- Score/pass, critical-fail registry, role bindings и re-admission workflow управляются и версионируются в отдельной admin-поверхности по `admin-panel-settings-development-package.md`.

## O3. KPI и rotation — принято для pilot readback 2026-07-21

- Limited pilot mode: `disabled` для влияния KPI на public rotation.
- KPI считаются только как operational readback.
- Rolling window: 30 дней.
- Minimum sample до любого влияния: 20 completed paid sessions и 5 QA-reviewed sessions на агента.
- Initial metrics: first-response SLA, accepted/missed paid requests, trial-to-paid, paid minutes, refunds, QA score.
- New/insufficient-data agent не получает скрытый штраф; включение KPI-влияния требует отдельного owner decision после pilot review.
- Все изменяемые KPI parameters вынесены в отдельный admin screen по `admin-panel-settings-development-package.md`.

## O4. Compensation — безопасный pilot route

- Consultation percentage: требуется конкретное значение владельца.
- Eligible base: требуется owner/economics решение о purchased/bonus/promo/refund treatment; неописанная категория исключается fail-closed.
- Fixed/SLA component: disabled до утверждения экономики и SLA.
- Additional-task pay: disabled до утверждения перечня и ставок.
- Refund correction: пропорциональна возвращенной части по принятому правилу; override только super-admin с причиной.
- Вся functional/admin model уже описана в screen `Вознаграждение агентов`: component states, bases, periods, scopes/overrides, preview, permissions, versions, snapshots и corrections. Это не требует дополнительных owner-вопросов.

## O5. Public traffic gate

Сейчас не закрывается: нужен pilot baseline. До него `NO_GO`.

Предварительный каркас оценки:

- 0 открытых P0 billing/ACL/safety defects;
- 100% coverage критических событий;
- paid-path success, support SLA, refund defect rate и critical-fail rate имеют достаточную выборку и свежий evidence;
- GO дает owner/super-admin после QA+PM; stop authority имеют owner/super-admin при новом P0.

Точные числовые thresholds утверждаются только после baseline.

## O6. Minimum safety/prohibited claims — принято 2026-07-21

- Никаких гарантий результата, выигрыша, возврата партнера, исцеления или точного будущего.
- Никакого давления страхом, зависимостью, искусственной незавершенностью или сокрытием paid state.
- Никаких медицинских, юридических или финансовых диагнозов/указаний вместо профильной помощи.
- Crisis, self-harm, violence, illegal/minor-sensitive cases немедленно прекращают обычный сценарий и идут в approved support/safety route.
- Никаких внешних платежей, скрытого booking pressure или передачи private contacts вне утвержденного контура.
- Этот product minimum требует отдельной legal/domain проверки формулировок перед paid pilot.
- Registry, incident routes, client messages и approved resources управляются в отдельном protected admin screen по `admin-panel-settings-development-package.md`.

## Дополнительные billing enablements

### Price/package table

P1 model принят: consultation price только в credits/minute; global default + profile override; session snapshot; packages/coupons/bonus credits admin-managed. Приняты `USD`, global `30 credits/started minute` и starter package `9.99 USD -> 60 credits -> 2 standard-rate minutes`. Admin-конструктор управляет nominal minutes, credits conversion, list/sale price, percent/fixed/bonus discount, stacking, limits и dates. Остались owner values: числовая сетка дополнительных package discounts и refill/auto-refill behavior. Неполный package не активируется. Source boundary: `asknebula-pricing-benchmark-2026-07-21.md`.

### Refund eligibility — принято 2026-07-21

- Confirmed platform/agent technical failure: full или proportional refund затронутой части.
- Duplicate/incorrect debit: обязательная полная correction ошибочного движения.
- Service quality complaint без доказанного critical fail: manual no/partial/full decision по case evidence.
- Confirmed prohibited-claims/safety violation: escalation и refund candidate; agent access может быть приостановлен независимо от денег.
- Client changed mind after correctly delivered started minute: no automatic refund; manual exception с причиной.
- Все variable/numeric values управляются отдельными admin input cells по `admin-panel-settings-development-package.md`; unset не заменяется выдуманным числом.

## Как ответить владельцу

Можно одной строкой:

```text
O4 consultation %=...; packages/refill=...; O5 — после pilot baseline.
```

O5 вернется после pilot baseline и сейчас ответа не требует.
