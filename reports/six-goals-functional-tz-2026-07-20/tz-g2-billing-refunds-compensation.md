# G2. Функциональное ТЗ: цена, billing, refunds и compensation

Статус: `g2_1_spec_handoff_ready_other_g2_owner_values_partially_open_not_runtime_verified`  
Задачи: G2.1-G2.4  
Фазы: consultation money — `pilot_core`; полный compensation contour — `public_launch`

## Общий результат G2

Клиент до старта понимает цену, trial и правило списания. Каждая started minute, refund и agent correction объяснима через конкретную service session. Изменение настроек не переписывает исторические финансовые результаты.

## G2.1 Цена и баланс

Эталонное продуктовое ТЗ для Игоря: `etalon-tz-g2-1-price-balance.md`.  
Технический контекст для Codex Игоря: `codex-context-g2-1-price-balance.md`.

### Функциональные требования

1. До paid start клиент видит цену экспертной анкеты в credits за started minute, credit balance, применимый trial и правило оплаты каждой начатой минуты. Purchase currency показывается только на credit package/payment surface.
2. Credits/minute на карточке, экране consent/start и при фактическом старте не противоречат друг другу.
3. Effective price определяется как profile override, иначе global default. При старте session фиксируются credits/minute, source rule/profile/global version и billing rule; последующее изменение влияет только на новые session.
4. Для начала paid minute на балансе должна быть доступна полная стоимость следующей минуты.
5. Если средств недостаточно до начала session/trial, consultation не начинается и деньги не списываются; клиент получает понятный top-up route. Если trial уже завершился при действующем consent, применяется G2.2 balance pause.
6. Если средств недостаточно во время paid, новая минута не начинается и включается G2.2 pause.
7. Клиент видит собственный доступный баланс и результат top-up в объеме, необходимом для решения продолжать ли консультацию.
8. Агент видит возможность/невозможность продолжения, но не получает лишнюю информацию о платежеспособности клиента для давления на него.
9. Super-admin/support видят финансовый итог session и связанные движения в рамках своих полномочий.
10. Global credits/minute и package catalog управляются на существующей `/ru/admin/settings/prices`; profile override — в административной карточке экспертной анкеты. Обязательны numeric cells, effective-price preview, draft/activation/effective date, reason, permission, version/audit и rollback. Initial global value — `30 credits/started minute`; изменение действует только на новые sessions.
11. Packages и discount safeguards расширяют существующую price page. Coupons/bonus rules размещаются на соседней `/ru/admin/settings/coupons`. Ручное начисление расширяет существующий Edit balance, а не создает вторую форму.
12. Package purchase до оплаты показывает money price/currency, purchased credits, bonus credits, coupon effect и total credits; непрозрачный conversion запрещен.
13. Если active global config invalid/missing и profile override отсутствует, paid start fail-closed. Package/coupon с обязательным unset/invalid value не активируется.
14. Initial starter package: `9.99 USD`, `60 credits`, первая confirmed purchase, один раз на клиента по стартовой настройке.
15. Клиент покупает credits, а не минуты. Admin управляет credit packages: credits grant, list/sale price, discount mode/value, bonus, dates, limits, audience, stacking и version. Пакет не обещает фиксированное число минут.
16. При profile override клиент видит точное доступное число полных started minutes по effective price; остаток credits не сгорает и не выдается за полную минуту.
17. Зачеркнутая list price и discount badge показываются только при реальной положительной экономии; UI показывает final USD, saved USD, coupon, применимый tax и фактический процент скидки без скрытых доплат.
18. Купленные credits бессрочны. Bonus/promo/compensation credits могут иметь отдельный admin-managed expiry и расходуются от ближайшего expiry к бессрочным purchased credits.
19. Initial regular packages: `150 credits / 22.99 USD`, `300 credits / 42.99 USD`, `600 credits / 79.99 USD` с сохранением базовой цены и явной встроенной скидки.
20. Auto-refill не входит в MVP. Одна manual top-up логика доступна из account, dialog, start confirmation, low balance и balance pause.

### Приемка

- Достаточный и недостаточный баланс до старта.
- Цена изменена после старта: текущая session не меняется, новая использует новые условия.
- Profile/start/session/history показывают совместимые credits/minute; package purchase отдельно показывает money currency и credit grant.
- Неуспешный start не создает debit/accrual.
- Global/default inheritance, profile override, package/coupon/bonus preview, retry и session price snapshot.
- Starter package purchase/readback: 9.99 USD -> 60 credits; доступные минуты отдельно рассчитываются по effective profile/global price.
- Создание, изменение, activation и rollback package discount; отсутствие ложной скидки, stacking и historical purchase snapshot.
- Payment methods берутся из существующего Payment systems; confirmed payment начисляет credits exactly once.
- Purchased/bonus balance breakdown, expiry order и late payment success без возобновления completed session.

## G2.2 Таймер, trial, started minute и pause

Эталонное продуктовое ТЗ для Игоря: `etalon-tz-g2-2-timer-debit-pause.md`.
Технический контекст для Codex Игоря: `codex-context-g2-2-timer-debit-pause.md`.

### Trial и consent

1. Trial предоставляется как coupon/bonus entitlement на фиксированное количество бесплатных минут; стартовое значение — 3 минуты, admin-managed.
2. Trial не списывает credits и не зависит от цены Эксперта.
3. При entitlement=0 trial пропускается.
4. До фактического старта клиент явно принимает переход в paid после окончания trial.
5. Consent + достаточный balance автоматически начинают первую paid-минуту после trial без второй modal.
6. Окончание trial без действующего consent не начинает списание.
7. Reconnect/retry/reload не дают новый trial и не восстанавливают использованное время.

### Paid minute

1. Тарификация поминутная.
2. Paid start требует server-confirmed readiness обеих сторон, consent, price snapshot и полную стоимость.
3. Полная цена списывается атомарно в момент начала каждой paid minute.
4. Early end не возвращает started minute автоматически.
5. Minute ordinal/debit является exactly-once; повторный tick/retry/reload читает прежний результат.
6. Время connecting/waiting до фактического paid start не считается paid time.
7. Inactivity reminder 2 минуты не выполняет auto-transition; пока state остается paid-active, timer и billing продолжаются.
8. Low-balance warning срабатывает при 2 полных минутах; threshold admin-managed.
9. Waiting/reconnect/pause блокируют только следующую минуту; текущая уже оплаченная сохраняет итог.

### Balance pause

1. Если полной стоимости следующей минуты нет, session переходит в единственную pause. То же правило действует после trial при уже данном consent и нулевом балансе; списания при переходе в pause нет.
2. Длительность pause управляется в админ-панели; текущее значение — 5 минут. Примененное значение фиксируется при начале pause и доступно в session/admin readback.
3. Клиент видит deadline, сумму/действие для продолжения и возможность завершить consultation.
4. Агент остается связан с этой session и не начинает другой paid chat.
5. Успешный top-up только пополняет balance и не запускает paid автоматически.
6. Клиент явно нажимает «Продолжить консультацию»; система повторно проверяет pause, присутствие и полную стоимость.
7. Только после успешной проверки начинается одна новая paid minute и debit.
8. Клиент или Агент может завершить pause раньше.
9. Истечение deadline завершает session.
10. Pause предоставляется один раз на session; второй zero-balance завершает ее.
11. Top-up после deadline остается на балансе, но не оживляет завершенную session.

### Reconnect и technical interruption

1. Client и Agent имеют отдельные admin-managed reconnect grace по 60 секунд.
2. Уже начатая paid minute сохраняет итог, но следующая minute во время grace не начинается.
3. Возврат до deadline продолжает ту же session без нового trial или повторного debit.
4. Timeout завершает session как technical end с одним incident/support/refund candidate.
5. Simultaneous disconnect/platform failure создают один linked incident, а не дубли.
6. Client disconnect не создает automatic compensation.
7. Agent/platform interruption также не выполняет automatic refund/compensation.
8. Любое фактическое начисление выполняется вручную super-admin; до successful grant клиенту не обещается сумма.
9. Top-up во время grace остается на балансе; после technical end он не возобновляет session.
10. Примененное значение grace фиксируется при начале clock и доступно в readback.

### Приемка

- Trial/no-trial.
- Consent accepted/not accepted.
- Early end внутри начатой paid minute.
- Retry/reconnect и повтор billing tick.
- Top-up before/after deadline.
- Early manual end pause.
- Second zero-balance.
- Trial end + consent + zero balance: одна pause без debit.
- Trial end + consent + balance: одна paid minute/debit без второй modal.
- Debit выполняется в начале minute и защищен от duplicate.
- Inactivity продолжает paid до явного waiting/end.
- Low balance warning использует admin threshold 2.
- Top-up не auto-resume; требуется explicit continuation.
- Client/Agent disconnect: reconnect до deadline и technical end после deadline.
- Simultaneous/platform failure: один incident и только manual compensation/refund.
- Admin readback и изменение будущих значений 5 минут/60 секунд без изменения уже активного периода.
- Technical interruption и согласованный financial readback.

## G2.3 Возвраты

### Функциональные требования

1. Refund создается только в контексте конкретной service session и support/dispute case.
2. Доступны результаты: no refund, partial refund, full refund в credits в пределах фактических session debits; cash refund покупки credit package является отдельным payment-dispute route.
3. Повтор обработки того же решения не создает второе финансовое движение.
4. Суммарный refund по session не может превышать ее eligible charges.
5. Partial refund по умолчанию относится к возвращенной части и создает пропорциональную agent correction.
6. Super-admin может изменить базу/процент конкретного удержания, но обязан сохранить исходное и итоговое решение, автора и причину.
7. Override не может превратить refund correction в положительную дополнительную выплату или превысить историческое начисление.
8. Reassignment после консультации не меняет агента, к которому относится correction.
9. Клиент видит сумму и итоговый статус собственного refund без внутренних compensation details.
10. Support/super-admin видят связь decision -> refund -> client balance -> agent correction.
11. Ошибка на части процесса не должна оставлять клиентский результат, case и внутренний итог в необъяснимо разных статусах; такой случай помечается как incident до разрешения.
12. Active refund framework: technical failure = full/proportional affected part; duplicate/incorrect debit = protected full correction; quality complaint = manual no/partial/full; confirmed O6 = refund candidate; correctly delivered started minute + changed mind = auto 0% with reasoned manual exception.
13. Refund categories, modes, percentages, amount limits, claim/review periods, evidence, roles, rounding и auto/manual thresholds управляются на отдельном admin-экране по `admin-panel-settings-development-package.md`.
14. Каждый numeric limit имеет отдельную input cell с unit, min/max validation, unset/zero distinction, calculation preview, version/audit и save readback.
15. Case readback показывает eligible charges, prior refunds, remaining amount, proposed percent/amount, client balance и agent correction до confirm.
16. Любой фактический refund ранее списанных credits выполняется только после ручного решения `super-admin`. Автоматическое правило может создать candidate и calculation preview, но не исполняет refund самостоятельно.
17. Ошибочный/дублированный debit, предотвращенный idempotency до commit, не требует refund. Если неправильное движение уже сохранено, оно исправляется отдельной защищенной correction после решения `super-admin`.
18. Compensation bonus отделен от refund. Автоматическое начисление допустимо только по явно включенному правилу; клиентское сообщение обещает бонус только после успешного grant.

### Приемка

- Full, partial и no-refund cases.
- Повторное решение и повторное действие.
- Несколько partial refunds с cumulative limit.
- Override с причиной.
- Reassignment после session.
- Refund после изменения compensation policy.
- Сверка client history, support case и agent correction.
- Admin numeric fields: unset/zero, invalid unit/range, version change, unauthorized action и calculation preview.

## G2.4 Начисления и оплата агента

### Consultation component — pilot core

1. После завершения consultation создается начисление по правилам, действовавшим для фактического агента этой session.
2. Начисление связано одновременно с service session, expert profile и actual agent периода.
3. Доход и public statistics по expert profile доступны отдельно от internal agent compensation.
4. Refund создает отдельную отрицательную correction, не переписывая исходное начисление.
5. Reassignment не меняет прошлые начисления и corrections.
6. Изменение compensation policy применяется к новым периодам/session и не переписывает историю.
7. Super-admin может объяснить итог через исходную консультацию, примененное правило, refund и override.
8. Consultation percentage, eligible base, purchased/bonus/refund treatment, currency/conversion, period, global/group/agent scope, caps, rounding и permissions управляются на admin screen `Вознаграждение агентов` по `admin-panel-settings-development-package.md`.
9. Неутвержденный consultation percentage остается `draft/unset`; это не создает скрытое начисление, но не блокирует сбор session ledger для будущего расчета.

### Полный compensation contour — public launch

Система должна поддерживать независимо управляемые компоненты:

- процент/доля за консультации;
- fixed за график или выполнение SLA;
- оплата дополнительных заданий.

Для каждого включенного компонента требуется:

1. Период и применимое правило.
2. Условия возникновения, уменьшения и отмены.
3. История изменения правил.
4. Понятный breakdown для super-admin и самого агента в разрешенном объеме.
5. Отдельный учет, чтобы один компонент не маскировал ошибку другого.
6. Возврат по consultation не должен автоматически изменять unrelated fixed/task pay без утвержденного правила.
7. Fixed/SLA и additional-task components по умолчанию `disabled` и включаются только отдельной active version.

### Приемка

- Несколько session разных expert profiles одного агента.
- Reassignment между session.
- Full/partial refund.
- Изменение consultation rule между session.
- Одновременное наличие трех компонентов с раздельным breakdown.
- Исключение/override с автором и причиной.
- Исторический период воспроизводится по применявшимся тогда правилам.
- Unauthorized direct action, duplicate task pay, retroactive activation и refund after closed/paid period.

## Открытые owner gates

- O4 initial consultation percentage и точная eligible-base/economics policy.
- Числовая сетка fixed/SLA и additional tasks нужна только перед включением этих компонентов; до этого они корректно `disabled`.
- Refund framework R1 принят; неутвержденные operational numeric inputs остаются явными `unset` admin fields, а не owner-policy blocker.
- Открытые compensation values не блокируют реализацию общей логики и consultation slice.

## Proof

Один evidence packet должен связать start price, minute results, total debit, accrual, full/partial refund и correction с одной session и actual agent. Отдельно проверяются duplicate/retry, reassignment и изменение правил.

## Knowledge basis

- Claim class: owner decisions + accepted canonical product rules; refund, USD, global price, starter package и managed discount model приняты; O4/additional tiers/refill и runtime открыты.
- `reports/six-global-goals-owner-facts-update-2026-07-12.md`.
- `reports/six-global-goals-final-canonical-pm-plan-2026-07-14.md`, G2.
- `reports/tz-product-g2-billing-truth-2026-07-16.md` используется только там, где не противоречит более поздней owner-confirmed модели.
- `qa-ba-autonomous-tester/contracts/SIX-GOALS-RUNTIME-ACCEPTANCE.md`, раздел G2/G4.
