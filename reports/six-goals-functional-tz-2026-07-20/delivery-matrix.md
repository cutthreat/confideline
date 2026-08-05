# Delivery matrix функциональных ТЗ G1-G6

Дата: 2026-07-20  
Статус: `requirements_30_of_30_verticalized_handoff_ready_runtime_open`

## Единое правило приоритета

Все 30 строк G1.1-G6.7 имеют приоритет `P0` шестимесячной программы запуска MVP. Фаза показывает порядок и gate, но не понижает обязательность задачи. `G2.GEO`, `G3.INT` и `G5.SEO` остаются связанными P0 implementation/content/launch packages и не получают primary ownership. Каждый из этих связанных пакетов не считается 31-м task code, не добавляется в реестр 30 задач и не меняет их primary ownership.

Расширения сверх MVP удалены из обязательного acceptance scope и перечислены отдельно в `post-mvp-backlog-2026-07-29.md`.

## Маршрутизация исполнения

Эта таблица отвечает за зависимости, proof и очередность. Кто выполняет операционную работу в админ-панели, что относится к разработке и когда разрешена техническая эскалация, канонически определяет `task-execution-ownership-matrix.md`.

Общее правило:

```text
existing admin capability probe
→ operator/config/content/QA action
→ evidence-backed developer gap, если он есть
→ development
→ operator readback и PM/QA acceptance
```

Нельзя считать колонку «Следующий шаг» безусловным поручением Игорю. `G3.5` и `G5.4` принадлежат QA/PM gate; `G2.GEO`, `G3.INT.I18N` и `G5.SEO` начинаются с операционной инвентаризации; G4.3/G6.4 требуют policy/content owner, а не авторства разработчика.

| Task | Фаза | Ключевая зависимость | Обязательный proof | Owner gate | Следующий шаг |
|---|---|---|---|---|---|
| G1.1 | pilot_core | G6.1, G2 | две session, history, dispute readback | нет | build-mapped lifecycle |
| G1.2 | pilot_core | G6.7 | assigned/foreign/actual actor + contact/PII pre-send guard | нет; O6 privacy policy accepted/admin-managed | execute V1 + admin privacy subpackage |
| G1.3 | pilot_core | G1.1, G2.2 | полный state-transition set | нет | deterministic lifecycle suite |
| G1.4 | pilot_minimum/public | G1.3, G5.1 | recipient/dedup/stale-event cases | нет | critical pilot events first |
| G2.1 | pilot_core | G3.3-G3.4 | profile/start/session credits/minute + package/coupon readback | P1, USD, global 30 и starter 9.99/60 закрыты; discount tiers/refill open | admin price/package/discount + start/balance/snapshot QA |
| G2.2 | pilot_core | G1.3 | trial/minute/pause/reconnect suite | нет | timer suite |
| G2.3 | pilot_core | G4.1-G4.2 | full/partial/duplicate/override + admin numeric preview | R1 закрыт/admin-managed | admin config + refund reconciliation |
| G2.4 | pilot_core | G1.1, G2.3, G6.1 | session accrual/correction/reassignment + consultation compensation admin screen | O4 initial consultation percentage/base; fixed/SLA/task остаются за границей MVP | consultation ledger/accrual + manual settlement |
| G2.GEO | V3 P0 content package, не primary task | historical source inventory, country/geoname editors, G3.2/G3.7, G3.INT | пятистрановой text-pilot complete; для full rollout: fresh inventory, source-first Codex draft, review/publish, admin+public readback, rollback | полный current denominator вне пилота ещё не измерен | pilot proof сохранён → отдельно планировать inventory всех active entity×locale → fill only proven gaps |
| G3.1 | V3 pilot_minimum/public | G3.3, G3.7, G6.2 | state-to-public action + preview | нет; `home` eligibility/manual order приходит из единого G3.7 contour, отдельного pilot pool нет | pilot storefront QA |
| G3.2 | pilot_minimum/public | G3.1, G3.7 | city/category/multi-city/pagination | нет | pilot filters QA |
| G3.3 | pilot_minimum | G2.1, G6.1 | profile-to-start consistency | нет; copy/legal review — release check | runtime profile/start QA |
| G3.4 | pilot_minimum | G2.1-G2.2, G6.1 | positive + concurrent/negative starts | нет | E2E start acceptance |
| G3.5 | pilot gate | все pilot slices | единый E2E evidence packet | runtime GO после P0 pass; не пробел ТЗ | запуск после P0 pass |
| G3.6 | V3 pilot minimum / V5 automation scale | G3.3, G6.3 | V3: taxonomy v2 + manual completeness/blocker input; V5: automated recalculation | нет для V3; automation enablement только после post-pilot evidence | pilot taxonomy/input QA; automation later |
| G3.7 | V3 pilot minimum / V5 KPI scale | V3: G3.6, G6.1-G6.4; V5 KPI-scale extension: G5.3 | V3: eight-surface eligibility/manual order при KPI disabled; missing/stale G6.4 admission fail-closed; V5: automated/KPI rotation | O3 pilot mode = disabled; post-pilot KPI enablement later | V3 admin/runtime eligibility readback; KPI scale later |
| G3.INT | V3 implementation package, не primary task | G3.1-G3.7, G1/G2/G4/G5/G6, source gates | source→route/view/data crosswalk, `G3.INT.I18N` key registry + hardcoded scan + safe translation-only import/rollback + 100% surface×rollout-locale coverage/readback, five-width/auth/cache/SEO, cutover/rollback и named build | нет; source-gap и incomplete-locale строки fail-closed; G4/legal утверждают смысл своих ключей | focused integration acceptance → handoff в G3.5 |
| G4.1 | pilot_minimum/public | G1.1, G6.7 | create/read/status/foreign access | O1 закрыт; admin SLA + operational owner | persistent linkage + admin SLA QA |
| G4.2 | pilot_minimum | G2.3-G2.4, G4.1 | one decision -> one correction + numeric policy readback | R1 закрыт/admin-managed | linked dispute/admin QA |
| G4.3 | pilot_minimum/public | G2, G6.4 | current/stale/missing consent/rules + protected admin policy | O6 product minimum закрыт; legal wording/resources release gate | admin safety + consent/runtime QA |
| G4.4 | pilot_minimum | G4.1, G6.2 | critical owner/overdue/dedup/role cases | O1 закрыт; route — operational config | critical route + admin escalation QA |
| G5.1 | pilot_minimum/public | G1-G4 | lineage/reconciliation/missing event | нет | core emission QA |
| G5.2 | MVP_operations | trusted G5.1 | minimum money/session/incident/SLA/QA/event-health dashboard; zero/no-data/stale/reconciliation | нет | build minimum dashboard after event truth |
| G5.3 | MVP_operations | G5.1, G6.2-G6.3 | minimum KPI table: cold-start/reassignment/refund + admin config | O3 pilot readback закрыт; KPI influence disabled | build/admin KPI readback suite |
| G5.4 | public gate | G3.5, G5.1, G6 | current release evidence + NO_GO case | thresholds/approver | decide after pilot baseline |
| G5.SEO | linked P0 launch package, `OPS_FIRST + DEV`, основной месяц 4 | brand/domain/locale freeze, G2.GEO, G3.1-G3.7, G3.INT, G4.3, G5.1 | URL/redirect/semantic/metadata registry, mapped build, full crawl, locale/admin/public/search-system readback | PM/legal claims and launch scope; incomplete locale/URL fail-closed | month 1 baseline → month 3 technical integration → month 4 full-team sprint → months 5-6 monitoring |
| G6.1 | pilot_core | foundation | assignment/reassignment/paid block/history | нет | execute issued first vertical package |
| G6.2 | pilot_minimum/public | G1.3, G5.1 | shift/busy/pause/incident + admin config readback | O1 закрыт; values admin-managed | build/admin/runtime SLA suite |
| G6.3 | pilot_minimum/public | G1.1, G5.1 | review/critical fail/appeal/block + admin config | O2 закрыт; config admin-managed | build/admin/runtime quality suite |
| G6.4 | V3 prerequisite admission minimum / V4 operations | G4.3, G6.3 | admission gates/version/paid block | O2/O6 product minimum закрыты; legal resources gate | до G3.7/G3.5 доказать minimum gate; затем полный admin re-admission/safety |
| G6.5 | pilot_minimum | G5.1, G6.2-G6.3 | critical owner/dedup/escalation/role | O1 закрыт; route — operational config | critical alerts + staff fallback |
| G6.6 | public_launch | G6.7 | role navigation/direct negative | нет; scope выведен из role/task contracts | after ACL proof |
| G6.7 | pilot_core | G6.1 | full positive/negative role matrix | нет | execute issued first vertical package |

## Критический порядок

```text
G6.1 + G6.7 -> G1.2 -> G1.1 + G1.3
-> G2.1-G2.3 + consultation G2.4
-> G3.3 + V3 minimum G3.6 + G3.1-G3.4 interface shell
-> G4.1-G4.3 + G5.1 + minimum G6.2-G6.4
-> V3 minimum G3.7 + G2.GEO fresh inventory/source-first restore/readback
-> G3.INT source-lock/backend binding/focused proof + G5.SEO mapped build/month-4 crawl -> G3.5 limited paid pilot
-> full G3/G4/G5/G6 -> G5.4 public traffic gate
```

## Правило статуса

Матрица фиксирует полноту требований, а не реализацию. Любой task остается не выше `requirement_defined/packet_ready`, пока нет build mapping и runtime evidence.

Первый исполнимый handoff: `vertical-package-g6-1-g6-7-g1-2.md`.

## Vertical coverage

1. `vertical-package-g6-1-g6-7-g1-2.md`: G6.1, G6.7, G1.2.
2. `vertical-package-session-money.md`: G1.1, G1.3, G2.1-G2.4.
3. `vertical-package-client-pilot.md`: G1.4, G3.1-G3.7, G4.1-G4.3, G5.1; primary task coverage G3.6/G3.7 здесь означает обязательный V3 manual minimum. G2.GEO и G3.INT являются linked P0 implementation/content packages этого vertical и не получают primary task ownership. До запуска G3.5 пакет обязан потребить G2.GEO fresh inventory/source-first restore/readback, G3.INT mapped build и связанный prerequisite slice G6.4: current versioned admission для Agent/profile и fail-closed запрет eligibility/session/debit при missing/stale/failed admission. Task ownership G6.4 сюда не переносится.
4. `vertical-package-operations-pilot.md`: primary task coverage G6.2-G6.5. Пакет-владелец G6.4 сначала выдаёт и доказывает admission-gate minimum как prerequisite для V3, затем расширяет его полным workflow обучения, re-admission, first shifts и operations. Номер V4 задаёт ownership-пакет, а не разрешает отложить prerequisite до окончания V3.
5. `vertical-package-public-scale.md`: несмотря на историческое имя файла, для шестимесячной программы содержит только обязательные MVP-срезы G4.4, G5.3 и G6.6. Automation/KPI-scale extensions G3.6/G3.7 вынесены в `post-mvp-backlog-2026-07-29.md`.
6. `vertical-package-analytics-launch.md`: G5.2, G5.4.

Все 30 task codes имеют ровно одно primary coverage и приоритет P0. G2.GEO, G3.INT и G5.SEO — linked P0 packages вне primary registry; они не считаются дополнительными task codes. Для G3.6 и G3.7 обязательным является V3 manual minimum; automation/KPI-scale extensions находятся только в отдельном post-MVP backlog. G6.4 сохраняет primary ownership в operations package, но его minimum admission gate является обязательным ранним prerequisite V3 до G3.7/G3.INT/G3.5. G2.GEO сохраняет отдельную content boundary: `157 = 39 + 118`, `942` locale pages и `1884` files — historical source inventory. Пятистрановой text-pilot Japan, South Korea, Mexico, Vietnam и Thailand имеет статус `complete`: доказаны `5/5` controlled before/after RU, `30/30` final source↔CMS readback и `5/5` финальных RU visual checks. Full rollout всего current denominator остаётся отдельным scope; фото `0/2` — вне text-scope. G5.SEO имеет основной спринт в месяце 4, но начинает baseline с месяца 1 и не считается runtime/indexing-ready до mapped build, full crawl и search-system readback. Owner values отделены как enablement gates; готовность конкретного handoff определяется классом `DEV/MIXED/OPS_FIRST/CONTENT_POLICY/QA_GATE`, а не универсальной передачей программисту.
