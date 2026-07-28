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
- G2.2: trial, consent, started minute, admin-managed pause 5 минут и reconnect grace 60 секунд.
- G2.3: no/partial/full refund, duplicate guard и override с причиной.
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
| M3 | Top-up до/после pause deadline | Resume той же session / деньги остаются на балансе новой session |
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

## Handoff программиста

Обязательны task IDs, environment, build/commit marker, role paths, sanitized fixtures, реализованные переходы, отсутствующие enablement values и готовность к QA. Без build marker пакет остается `requirement_handoff_ready`.

## Stop

Любое двойное списание, возобновление завершенной session, paid start без consent/полной цены или расхождение session/refund/accrual — P0 возврат программисту.

Rollback: только task-local документ и его ссылки; runtime/source code не менялся.
