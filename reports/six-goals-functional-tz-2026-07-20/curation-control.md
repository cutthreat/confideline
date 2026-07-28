# Кураторский контроль: Confideline / 6 глобальных целей

Дата обновления: 2026-07-21  
Статус: `waiting_two_owner_economics_inputs_requirement_layer_verified`  
Режим исполнения: `artifact_only_current_lite_thread`  

## Контур

- Активная задача/цель: `019f8091-703a-76d3-b27c-e0e49e8c4252`.
- Источниковая ветка: `019f4195-0094-7e00-922b-d84746b66ea0`.
- Источниковая ветка не является текущей поверхностью исполнения: повторное открытие не требуется; работа продолжается по каноническому локальному комплекту.
- Runtime watchdog: `blocked_runtime_unstable`; запрещено превращать локальную полноту ТЗ в заявление о готовности сайта.

## Текущее состояние

| Область | Состояние | Доказательство |
|---|---|---|
| Функциональные ТЗ | 30/30 structural coverage; G1.1 `etalon_spec_100`; 29 task-level audits open | `functional-tz-quality-standard.md`, эталон G1.1 и шесть legacy G1-G6 пакетов |
| Programmer/QA verticals | 6/6 | шесть `vertical-package-*.md`; каждая задача входит ровно в один пакет |
| Последний verifier | `pass`, 295/295, 0 failed | `Test-SixGoalsFunctionalTz.ps1`, 2026-07-21; проверены 30 task blocks, 6 unique Coverage packets, 7 admin screens, exact owner/runtime boundary и panel state |
| Owner decisions O1/O2/O3/O6/O7/O8/R1/P1 | закрыты | SLA/timers, QA/admission, KPI, safety/privacy, refund и credit model приняты; управление вынесено в admin development package |
| Owner enablement O4 + discount grid/refill | требуется решение | USD, global 30, starter 9.99/60 и managed packages/discount закрыты; остальное в `owner-enablements-pilot-defaults-proposal.md` |
| Owner enablement O5 | отложен корректно | решение принимается после накопления pilot baseline |
| Runtime/сайт | `NO_GO` | нет mapped build и полного positive/negative runtime evidence |

## Очередь решений владельца

1. Определить числовую сетку скидок дополнительных пакетов и refill/auto-refill; USD, global 30, starter 9.99/60, managed package model и refund R1 уже приняты.
2. Определить только O4 initial consultation percentage и eligible-base policy; compensation admin model уже закрыта.
3. Передать шесть vertical packets программисту и принимать каждый только по build marker и runtime evidence.
4. Вернуться к O5 после достоверного pilot baseline; не выдумывать launch thresholds заранее.

## Условия завершения кураторской задачи

Кураторская задача закрывается только когда:

1. все необходимые owner decisions зафиксированы либо явно отложены до измеримого gate;
2. каждый из 30 task IDs связан с programmer handoff и QA verdict;
3. положительные и отрицательные сценарии проверены на идентифицируемой сборке;
4. остаточные дефекты и блокеры имеют owner, next action и evidence;
5. итоговый статус разделяет `requirement_ready`, `runtime_verified` и `accepted`.

## Стоп-условия

- Нет build/commit marker или окружения для QA.
- Требуется логин, MFA, платёж, внешний publish/deploy или иное owner-level действие.
- Появилась попытка назвать static panel, документ или код runtime-доказательством.
- Verifier получил regression или задача выпала из уникального покрытия 30/30.

## Кураторский ledger

| Дата | Изменение | Результат | Следующий контроль |
|---|---|---|---|
| 2026-07-21 | Принята текущая lite-задача как поверхность курации; тяжёлая ветка оставлена источником | канонический комплект сохранён, runtime claim не повышен | получить первый пакет owner decisions |
| 2026-07-21 | Проведен completion audit 30/30 и нормализованы ложные owner-gates | operational settings и runtime GO больше не эскалируются владельцу; verifier 237/0 | согласовать O1 SLA одним коротким вопросом |
| 2026-07-21 | Владелец принял O1 и потребовал управление всеми такими значениями из admin | добавлено cross-cut admin-settings ТЗ; O1 связан с G4.1/G4.4/G6.2/G6.5 и vertical 4 | проверить связность и перейти к O2 |
| 2026-07-21 | Владелец принял O2 и потребовал считать настройки отдельной разработкой admin-панели | выпущен cross-vertical admin development package; O2 связан с G6.3/G6.4 и vertical 4 | проверить пакет и перейти к O3 |
| 2026-07-21 | Владелец принял O3 с требованием управлять всеми variable KPI parameters через admin | добавлен KPI admin screen, definitions registry, preview/version/activation guards; G3.7/G5.3 и vertical 5 обновлены | проверить и перейти к O6/refund либо financial values |
| 2026-07-21 | Владелец принял полный O6 prohibited minimum | добавлен protected Trust & Safety admin screen, incident routes/templates/resources и guard против ослабления без owner/legal | проверить и перейти к refund framework |
| 2026-07-21 | Владелец запросил механизм выявления нарушения | добавлены six-source safety signals, signal/confirmed states, evidence, human verdict, false-positive/dedup/degraded acceptance | проверить detection contract и продолжить refund decision |
| 2026-07-21 | Владелец потребовал запрет контактов и других личных данных в чате | добавлен protected pre-send server guard, PII categories, obfuscation/split/attachment coverage, masked evidence и secure exceptions | проверить censorship contract и продолжить refund decision |
| 2026-07-21 | Владелец принял R1 refund framework и потребовал отдельные numeric input cells | добавлен refund admin screen с values/units/ranges/unset/zero/preview/version и protected invariants | проверить и перейти к price/package values |
| 2026-07-21 | Владелец отверг USD/minute и принял P1 credits model | добавлен admin screen global/profile credits/minute, packages, coupons, discounts, bonus credits, buckets и snapshots | определить валюту/global default/package values |
| 2026-07-21 | Владелец принял USD для покупки и AskNebula как ценовой эталон | официальный public reference подтверждает от 30 credits/min; global default установлен 30 и оставлен admin-managed; package conversion не выдуман | согласовать initial package/refill grid |
| 2026-07-21/28 | Владелец принял starter 9.99 USD -> 60 credits и уточнил, что packages продают credits, а не минуты | package builder хранит credits, list/sale/discount fields; минуты только рассчитываются по effective profile price; AP91-AP97 обновлены | runtime/admin proof |
| 2026-07-21 | Повторный audit owner-gates после package update | из G3/G5/G6 удалены устаревшие повторные owner-вопросы; O3/O1/O2/O6 отмечены принятыми, release/runtime gates отделены | запросить только discount grid/refill и O4 |
| 2026-07-21 | Закрыт функциональный пробел O4 admin management | добавлен экран 7 agent compensation, component/basis/scope/period/correction/permission controls и AP98-AP110 | получить только initial percentage/base; fixed/SLA/task оставить disabled |
| 2026-07-21 | Финальный completion audit requirement layer | 30/30 tasks, 6/6 unique Coverage packets, 7 admin screens; ложных owner-gates не осталось | ожидать только package/refill grid и O4 percentage/base; runtime не повышать |
| 2026-07-27 | Введен строгий стандарт полноты ТЗ и создан эталон G1.1 | G1.1: 100/100, 12/12 hard gates, 26 acceptance cases; implementation/runtime отделены | последовательно переоформлять G1.2-G6.7, не наследовать старые 100% автоматически |
