# PM + Антон + Gemini + Evidence Lead: арбитраж комплекта G1-G6

Дата: 2026-07-20  
Статус: `committee_review_complete_owner_decisions_applied_handoff_ready`

## PM verdict

`pass_with_owner_gates`

- 30/30 задач имеют функциональный результат и acceptance.
- Pilot/public/post-launch slices не смешаны.
- Критический dependency order сохранен.
- Старые `TBD` не имеют приоритета над owner decisions.
- Исправлено: assignment выполняет только super-admin.
- Исправлено: client city filter не расширяется скрыто сохраненным городом.

## Антон verdict

`pass_with_runtime_and_copy_proof_open`

- Клиентский путь не имеет намеренно тупиковых critical actions.
- Busy/offline/no-balance/no-consent дают честный результат без списания.
- Declined/missed/connecting failure не маскируется под paid session.
- Support case имеет статус, owner и понятный outcome.
- Dashboard обязан различать zero/no-data/stale.
- Runtime и точная client copy остаются отдельными proof gates.

## Gemini verdict

Первый проход: `revise`, 23 pass / 7 revise / 0 blocked.

После арбитража:

- 5 функциональных пробелов исправлены;
- 5 implementation-prescriptive формулировок отклонены;
- 2 реальных owner decisions вынесены в `owner-decisions.md`.

Подробно: `gemini-review-result.md`.

## Evidence Lead verdict

`pass_for_requirement_packet_not_runtime`

- Все 30 task codes присутствуют один раз.
- Claim class и knowledge basis добавлены для G1-G6.
- Static/code/model review не повышают runtime status.
- Для завершения потребуется verifier, build mapping и runtime evidence.

## Итог

Владелец закрыл O7/O8 2026-07-20: balance pause и reconnect grace управляются в админ-панели, текущие значения — 5 минут и 60 секунд. Точечный bounded re-review не выявил нового конфликта: значения фиксируются для уже начавшегося периода, runtime/readback остаются обязательными proof gates.

Владелец закрыл O1 2026-07-21: paid decision 60 секунд, first meaningful response 60 секунд, support first response 15 минут, ordinary escalation 2x, critical escalation immediate. По прямому уточнению владельца все эти значения должны управляться из админ-панели. Cross-cut contract требует authorized change, validation, readback, version/audit и snapshot уже начавшегося SLA-clock; runtime/admin proof остается открытым.

Владелец закрыл O2 2026-07-21: max score 100, pass 80, critical fail overrides score, moderator/QA lead verdict, super-admin reasoned override и обязательный re-admission workflow. Владелец отдельно уточнил, что это должно идти самостоятельной разработкой admin-панели, а не примечанием к backend logic. Выпущен `admin-panel-settings-development-package.md`; он является cross-vertical subpackage и не нарушает уникальное покрытие 30 задач шестью vertical packets.

Владелец закрыл O3 для pilot readback 2026-07-21 и потребовал сделать настраиваемыми все изменяемые параметры KPI, перечисленные в ТЗ. Active pilot mode остается `disabled` для влияния на rotation; window 30 дней, global minimum 20 completed paid + 5 QA-reviewed sessions, insufficient data без штрафа/pass. Admin package расширен отдельным KPI registry, formula/window/sample/weight/threshold/freshness/preview/version controls; post-pilot activation остается отдельным evidence-dependent owner gate.

Владелец закрыл O6 product minimum 2026-07-21: guarantees, pressure/dependency, hidden paid state, medical/legal/financial instruction, external payments/private contacts запрещены; self-harm, violence, illegal и minor-sensitive cases немедленно выводят из обычного сценария. Admin package расширен protected Trust & Safety registry, routes, templates/resources и guard против ослабления baseline без owner/legal approval. Exact jurisdiction wording/resources остаются legal release gate, не product-owner question.

По вопросу владельца «как нарушение отслеживается» добавлен отдельный detection contract: objective system events, message monitoring, client report, staff flag, QA review и reconciliation создают safety signal. Signal отделен от confirmed violation; автоматический сигнал может применить protective hold/stop, но окончательный штраф/refund/critical fail требует разрешенного verdict. Добавлены evidence, false-positive, duplicate, detector-degraded и unobservable off-platform cases.

По прямому решению владельца добавлен запрет передачи контактов и других чувствительных личных данных через consultation chat. Protected categories блокируются server-side до отправки в обе стороны; включены obfuscation/split/direct/attachment cases, allowlist approved internal/safety links, masked evidence и отдельные structured/secure fields для действительно необходимых service/support данных. UI warning без server guard отклонен как недостаточный.

Владелец принял R1 refund framework 2026-07-21 и потребовал, чтобы каждый числовой лимит был отдельной admin input cell. Добавлен refund screen: accepted outcomes, protected 100% duplicate correction/cumulative ceiling, explicit unset/zero, units/ranges/currency/rounding, eligible-amount preview, roles/evidence, version/audit и exactly-once financial action. Неутвержденные сроки/amount thresholds оставлены unset, а не выдуманы.

Владелец отклонил рекомендацию USD/minute и принял P1 credit model 2026-07-21: клиент всегда покупает credits, consultation price показывается credits/started minute; есть global default, profile override и immutable session snapshot. Затем владелец принял USD как purchase currency и поручил брать AskNebula за ценовой эталон. Текущая официальная публичная страница AskNebula указывает от 30 credits/minute, поэтому initial global default принят как `30 credits/started minute`. Итоговое уточнение владельца от 2026-07-28: starter продает `60 credits за 9.99 USD`, regular packages также продают credits со скидкой; ни один package не продает фиксированные минуты. Доступные минуты рассчитываются отдельно по effective цене выбранного Эксперта.

Комплект окончательно owner-approved как функциональные требования и готов к programmer handoff. Это не повышает runtime-статус продукта: до build mapping и QA продукт остается `NO_GO`.
