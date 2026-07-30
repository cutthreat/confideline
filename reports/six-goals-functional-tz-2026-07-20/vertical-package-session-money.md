# Vertical 2: consultation session и деньги

Дата: 2026-07-20  
Статус: `requirement_handoff_ready_enablement_values_partially_open_not_runtime_verified`  
Coverage: G1.1, G1.3, G2.1, G2.2, G2.3, G2.4

## Результат

Одна service session проходит детерминированный путь `trial -> paid -> pause/resume|timeout -> end`, а цена, debit, refund, accrual и correction восстанавливаются без расхождений.

## Обязательный scope

- G1.1: отдельная service session и неизменяемая историческая карточка.
- G1.3: состояния, переходы, history и technical end.
- G2.1: global/profile credits/minute, credit balance, package/coupon/bonus catalog и snapshot примененных правил; money currency только на purchase surface.
- G2.2: фиксированный free-minute trial, consent, atomic debit в начале started minute, low-balance threshold 2, explicit continuation, admin-managed pause 5 минут и client/agent reconnect grace по 60 секунд; refund/compensation только вручную.
- G2.3: отдельный session-linked refund case, no/partial/full manual super-admin decision, affected-minute/exact-credit preview, exactly-once bucket restoration, appeal и immutable correction.
- G2.4: consultation accrual и отрицательная correction после refund.

## Enablement gates, не блокирующие build

- P1 credit model принят; global default `30 credits/started minute`, package purchase currency `USD`, starter package `9.99 USD -> 60 credits`. Package продает credits, а не минуты; доступные минуты рассчитываются отдельно по active global/profile price выбранного Эксперта. Discount grid управляется в admin; auto-refill не входит в MVP; неполный package не активируется. Paid start использует принятую active global/profile price configuration.
- R1 refund policy принят; все variable/numeric fields управляются в admin. Unset operational input отключает только зависимый auto path, но не protected duplicate/incorrect-debit correction.
- Compensation admin model готова в `Экран 7. Вознаграждение агентов`: consultation component draft/unset до O4, fixed/SLA/task disabled; ledger, component scopes, preview, snapshot, refund correction и permissions реализуются независимо от numeric enablement.

## Acceptance suite

| ID | Сценарий | PASS |
|---|---|---|
| M1 | Trial с consent и достаточным балансом | Одна session, paid начинается один раз |
| M2 | Trial с consent и нулевым балансом | Одна pause без debit, current admin value = 5 минут |
| M3 | Top-up до/после pause deadline | До deadline balance увеличивается без auto-resume; та же session возобновляется только после explicit client continue и fresh guards / после deadline деньги остаются на балансе и завершённую session не оживляют |
| M4 | Вторая нехватка баланса | Вторая pause не создается, session завершается |
| M5 | Early end начатой минуты | Одна полная started minute, без следующего debit |
| M6 | Agent disconnect до/после 60 секунд | Resume / technical end, новая minute не начинается |
| M7 | Retry/reconnect/billing tick | Нет duplicate session/debit/event |
| M8 | Изменение цены после старта | Старая session неизменна, новая использует новое значение |
| M9 | Full/partial/no refund | Итог ограничен eligible charges и связан с case/session |
| M10 | Повтор refund/override | Нет второго движения; причина и actor сохранены |
| M11 | Accrual и refund correction | Один accrual и согласованная отрицательная correction |
| M12 | Reassignment после end | Historical actual agent и attribution не переписаны |
| M13 | Refund numeric config/preview | Value/unit/unset/range/version и фактическое движение согласованы |
| M14 | Duplicate debit при optional auto cap | Full correction обязательна; cap может отправить на manual approval, но не отменить ее |
| M15 | Global price/profile override | Effective credits/minute и inheritance readback совпадают |
| M16 | Package/coupon/bonus purchase retry | Один money result и один credit/bonus grant |
| M17 | Price/promo change after session start | Active snapshot прежний; новая session использует новую version |
| M18 | Trial coupon 3 minutes / trial=0 | Бесплатные минуты без wallet debit / этап пропущен |
| M19 | Inactivity in paid | Reminder видим; billing продолжается до explicit waiting/end |
| M20 | Low-balance threshold 2 | Один warning episode; Agent не видит exact balance |
| M21 | Top-up during pause | Balance увеличен; auto-resume отсутствует; explicit continue создает одну minute |
| M22 | Client disconnect before/after 60 seconds | Resume / technical end без automatic compensation |
| M23 | Simultaneous/platform interruption | Один incident; manual super-admin financial decision only |
| M24 | Same-category repeated refund request | Существующий active case дополнен; duplicate case/movement отсутствует |
| M25 | Different refund category | Создан linked case; общий cumulative ceiling сохранен |
| M26 | Refund purchased/bonus allocation | Purchased без expiry; bonus source/original expiry или 30-day grace |
| M27 | Refund execution retry | Один logical balance result; failure остается открытым |
| M28 | Client appeal | Одна appeal за 7 дней; original decision immutable |

## Handoff программиста

Обязательны task IDs, environment, build/commit marker, role paths, sanitized fixtures, реализованные переходы, отсутствующие enablement values и готовность к QA. Без build marker пакет остается `requirement_handoff_ready`.

## Stop

Любое двойное списание, возобновление завершенной session, paid start без consent/полной цены или расхождение session/refund/accrual — P0 возврат программисту.

Rollback: только task-local документ и его ссылки; runtime/source code не менялся.
