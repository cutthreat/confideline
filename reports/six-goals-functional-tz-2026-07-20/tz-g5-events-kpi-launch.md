# G5. Функциональное ТЗ: события, KPI, dashboard и launch control

Статус: `requirement_defined_pilot_readback_accepted_public_gate_deferred_not_runtime_verified`  
Задачи: G5.1-G5.4  
Фазы: core lineage — `pilot_minimum`; full analytics — `public_launch/post_launch`

## Маршрутизация исполнения G5

| Task | Класс | Операционная дорожка | Development-дорожка |
|---|---|---|---|
| G5.1 | `DEV` | PM/data owner утверждает event dictionary; analyst проверяет coverage | Emission, lineage, idempotency, privacy и reconciliation |
| G5.2 | `DEV` | Staff/PM определяет вопросы и role visibility; analyst использует результат | Dashboard/query layer, filters, freshness, drill-down и ACL |
| G5.3 | `MIXED` | PM/super-admin задаёт definitions/thresholds/windows/actions; QA использует readback | Aggregation, versioning, coverage и explainable dashboard |
| G5.4 | `QA_GATE` | PM/super-admin вручную выдаёт GO/NO_GO по свежему evidence | Только отсутствующий evidence/readback/traffic-control runtime |

Допуск рекламы не является автоматическим решением Игоря. Канон: `task-execution-ownership-matrix.md`.

## Общий результат G5

Команда может восстановить путь конкретной consultation по product, money, support и quality событиям. KPI имеют прозрачные определения и не превращают пропуски данных в ложные выводы. Публичный трафик включается только по доказанному gate.

## G5.1 События воронки

### Pilot event minimum

Для каждой service session должны быть доступны согласованные события:

- paid request создан;
- request принят/отклонен/пропущен;
- consent получен;
- trial начат/завершен;
- paid start;
- результат каждой начатой минуты;
- low/zero balance и pause;
- top-up result;
- resume/end и причина;
- consultation accrual;
- support case;
- refund decision и correction;
- critical quality/safety outcome, если возник.
- safety signal created/reviewed/confirmed/dismissed/actioned с rule/source version без raw message в обычной аналитике.

### Функциональные требования

1. События одной consultation сопоставляются с session, client, expert profile и actual agent в разрешенном аналитическом контуре.
2. Повтор технического/пользовательского действия не создает ложное второе бизнес-событие.
3. Порядок и время позволяют восстановить последовательность lifecycle.
4. Money events сверяются с фактическим финансовым итогом session.
5. Reassignment не меняет историческую attribution прошлых событий.
6. Missing event/coverage видим как проблема данных, а не как отсутствие действия пользователя.
7. События не раскрывают клиентские сообщения или персональные детали в обычной аналитике.
8. Названия и смысл событий стабильны для периода или имеют видимую версию определения.
9. Ошибка доставки аналитического события не должна менять продуктовый результат; она создает data-quality gap.
10. Full public-launch funnel может добавлять acquisition, profile views, filters, conversion, retention и repeat session только после доказанного core lineage.
11. Даже после reassignment или изменения связанных справочных данных событие позволяет восстановить client, expert profile, actual agent и session периода; конкретный технический формат выбирает программист.
12. Safety signal и confirmed violation являются разными состояниями; dismissed false positive не попадает в KPI/critical-fail outcome как нарушение.
13. Chat privacy blocked-attempt event хранит category/rule/result и masked evidence, но не raw contact/secret; ordinary analytics не раскрывает content.

### Приемка

- Полный session lifecycle сопоставляется с events и money readback.
- Retry не дает duplicate.
- Искусственно отсутствующее событие отмечает incomplete coverage.
- Reassignment сохраняет attribution.
- Technical interruption имеет согласованный product/support event path.

## G5.2 Dashboard

### Требуемый результат

Dashboard помогает принять операционное решение и показывает качество исходных данных. Он не является источником истины вместо session/money/support records.

### Функциональные требования

1. Каждый показатель имеет название, период, определение, обновленность и coverage status.
2. `0`, `no data`, `insufficient sample`, `stale` и `partial coverage` отображаются различимо.
3. Финансовые totals могут быть сверены с исходным итогом за тот же период.
4. Фильтры по времени/роли/agent/expert profile не смешивают public expert metrics и internal agent KPI.
5. Reassignment не переносит прошлый agent KPI новому агенту.
6. Ошибка/задержка данных видна и не окрашивает показатель как green/pass.
7. Пользователь dashboard понимает, какое решение поддерживает показатель и куда перейти для разбора.
8. Pilot может использовать минимальный operational readback/manual report; полноценный dashboard не блокирует pilot.
9. Права ограничивают видимость финансовых, agent и quality данных.
10. Экспорт/детализация, если доступны, сохраняют те же definitions и ограничения.

### Минимальные представления после появления trusted events

- Consultation lifecycle и success/error counts.
- Paid requests, accepted/missed и first-response SLA.
- Trial-to-paid и paid minutes.
- Refunds/corrections и unresolved money incidents.
- Quality reviews/critical fails.
- Data freshness/coverage.

### Приемка

- Zero/no-data/stale/partial cases.
- Reconciliation финансового периода.
- Role visibility.
- Reassignment.
- Переход из anomalous metric к объяснимым source records.

## G5.3 KPI table

### Initial KPI families

- Paid request acceptance/miss rate.
- First-response SLA.
- Trial-to-paid conversion.
- Paid minutes/session duration в разрешенном аналитическом смысле.
- Refund/correction rate и quality outcomes.

Pilot active policy: KPI используется только для operational readback/coaching, влияние на rotation = `disabled`, rolling window = 30 дней, global minimum = 20 completed paid sessions и 5 QA-reviewed sessions на агента. При недостатке данных показывается `insufficient_data` без штрафа/pass.

### Definition contract

Для каждого KPI обязательно определены:

1. Бизнес-смысл и владелец.
2. Формула, числитель и знаменатель.
3. Окно расчета и timezone/period boundary.
4. Minimum sample и `insufficient_data` behavior.
5. Включения, исключения и treatment technical interruptions.
6. Treatment reassignment, new agent и blocked/off-shift periods.
7. Где KPI только наблюдается, где используется для coaching и где может влиять на G3.7.
8. Источник данных и coverage/freshness requirement.
9. Порог и направление «лучше/хуже», если утверждены.
10. Версия определения при изменении правила.
11. Weight, normalization/cap/floor и composite membership, если они используются.
12. Role visibility, effective date, reason и current-vs-draft preview.

Все перечисленные изменяемые параметры управляются на отдельном admin-экране `KPI и влияние` по `admin-panel-settings-development-package.md`. Admin может параметризовать только поддерживаемые formula/aggregation options; произвольный исполняемый код не является допустимой настройкой.

### Product guardrails

- Public expert rating/reviews не равны internal agent KPI.
- Empty/short sample не считается плохим или хорошим результатом.
- Busy paid period не ухудшает async response SLA очереди.
- Technical/platform issue не ухудшает агента без согласованного attribution.
- KPI profit/duration не может компенсировать critical quality/safety fail.
- Влияние KPI на rotation включается только по admin mode и owner-approved definitions.
- KPI нельзя улучшить исключением failed/refunded sessions без утвержденного правила.
- Current pilot admin mode зафиксирован как `disabled` для rotation; технический toggle не может включить влияние без отдельного post-pilot owner/evidence gate.

### Приемка

- Cold start/no data.
- Reassignment.
- Busy queue exclusion.
- Refund и technical interruption.
- Изменение KPI definition между периодами.
- Immediate/after-threshold/disabled влияние на G3.7.
- Admin positive/negative: formula/window/sample/weight/threshold/freshness/preview/version и запрещенная premature activation.

## G5.4 Допуск рекламы

### Требуемый результат

Public traffic включается только после доказанной способности продукта и команды безопасно обслужить платный путь. Неизвестный или устаревший показатель означает `NO_GO`, а не pass.

### Gate areas

1. **Paid path:** G3.5 проходит на текущей сборке.
2. **Money integrity:** debits, accruals, refund/corrections согласованы; нет открытого P0 duplication/attribution defect.
3. **Roles/access:** G6.1/G6.7 и foreign negative matrix проходят.
4. **Support:** клиентский case/refund route работает, есть owner и SLA.
5. **Supply:** достаточный допущенный pilot/public pool, смены и busy behavior.
6. **Quality/safety:** scorecard, critical fail и escalation выполняются.
7. **Data:** core event coverage/freshness позволяет отличать success от missing.
8. **Operations:** есть stop owner, incident route и возможность быстро выключить traffic/paid availability по продуктовому решению.

### Функциональные требования

1. Gate показывает pass/fail/unknown по каждому обязательному пункту и evidence date/build.
2. Один проваленный P0 блокирует GO.
3. GO имеет approving role, дату, область трафика и условия пересмотра.
4. Stop rule определяет события немедленной паузы трафика.
5. Новый build или существенное изменение payment/session/access требует повторной релевантной проверки.
6. Limited paid pilot и public traffic имеют разные gate; pilot pass не равен public-launch pass.
7. Marketing claims не опираются только на PM/static/training artifacts.

### Приемка

- Полный GO packet с актуальным proof.
- Искусственный FAIL одного P0 дает NO_GO.
- Unknown/missing data не проходит.
- Истекшее/чужое build evidence не проходит.
- Stop incident переводит traffic status в pause/review.

## Отложенные enablement/release gates

- O3 pilot readback принят: metric families, window 30 days, minimum 20 paid + 5 QA, no-data behavior и admin management не требуют повторного owner-решения.
- Exact supported formulas/aggregation выбираются из admin registry и проходят preview/validation; произвольный код запрещен.
- Только post-pilot включение KPI influence на ranking остается evidence-dependent owner gate.
- Numeric public traffic thresholds после pilot baseline.
- GO/stop role binding конфигурируется в admin; окончательная активация public traffic производится после baseline и O5.
- До их утверждения G5.1 и dashboard/data-quality behavior могут разрабатываться и приниматься независимо.

## Knowledge basis

- Claim class: accepted pilot measurement rules + deferred post-pilot/public thresholds; runtime открыт.
- `reports/six-global-goals-final-canonical-pm-plan-2026-07-14.md`, G5.
- `reports/tz-product-g5-3-kpi-scorecard-measurement-2026-07-16.md`.
- `reports/final-review/six-global-goals-final-committee-arbitration-2026-07-14.md` для KPI/reassignment/pilot gate rules.
- `.ops/knowledge/video-intelligence/corpora/nebula-expert-training-source-recovery-2026-07-16/knowledge/six-goals-training-product-addendum.md`; коммерческие reference-механики не становятся KPI автоматически.
