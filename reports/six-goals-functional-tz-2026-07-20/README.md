# Confideline / Nebula: канонический комплект функциональных ТЗ G1-G6

Дата: 2026-07-29  
Статус комплекта: `G1_G2_G3_15_of_15_etalon_pairs_verified / G4_G6_legacy_structural_coverage_standard_audit_open`  
Область: 30 задач G1.1-G6.7  
Продуктовый статус: `not_runtime_verified / NO_GO`

## Правило MVP-приоритета

Все 30 задач шести глобальных целей имеют приоритет `P0` и входят в шестимесячную программу запуска MVP. Их порядок определяется зависимостями и vertical-пакетами, а не понижением приоритета.

Связанные `G2.GEO` и `G3.INT` также обязательны как P0 implementation/content packages, но не являются primary tasks и не меняют канонический реестр `30`.

Расширения сверх минимального безопасного и управляемого MVP вынесены в `post-mvp-backlog-2026-07-29.md`. Они не входят в 30 задач, проценты целей и текущий дедлайн.

## Назначение

Комплект переводит канонический PM-план в role-aware пакеты для moderator/super-admin, PM/policy owner, QA и разработчика. Он описывает, какой результат требуется, кто и в каком порядке его выполняет, как продукт должен вести себя для каждой роли и как доказать готовность.

Комплект не определяет архитектуру, структуру данных, API, классы, таблицы, алгоритмы, технологии или способ написания кода. Эти решения принимает программист только внутри явно выделенного development scope.

## Единый источник истины

Приоритет:

1. Последние прямые решения владельца.
2. Этот комплект и канонический PM-план от 2026-07-14.
3. Действующее runtime/admin/QA evidence конкретной сборки.
4. Ранее выпущенные продуктовые ТЗ как источниковый материал.
5. Конкурентные материалы и модельные review как challenge, но не как продуктовая истина.

При противоречии более позднее решение владельца имеет приоритет. Старые `TBD`, old Starter Package и иные отмененные гипотезы не возвращаются в активное ТЗ.

## Состав

| Пакет | Задачи | Назначение |
|---|---|---|
| `functional-tz-quality-standard.md` | G1-G6 methodology | Канонические 12 критериев, 12 hard gates, readiness statuses и role-aware типы документов |
| `task-execution-ownership-matrix.md` | 30 задач + G2.GEO/G3.INT | Каноническое разделение operational/admin, content/policy, QA и development; gate технической эскалации |
| `g1-g3-documentation-matrix.md` | G1.1-G3.7 | Адресная матрица основных документов, технических контекстов, HTML/DOCX и честной runtime-границы |
| `etalon-tz-g2-geo-content-restoration.md` + `codex-context-g2-geo-content-restoration.md` | G2.GEO linked P0 package | Source-first восстановление и Codex-заполнение страниц стран/городов, review/publish/readback/rollback и template regression guard |
| `Test-G2GeoContentHandoff.ps1` | G2.GEO | Focused proof документации, честной current-state границы и panel/handoff mapping |
| `etalon-tz-g3-int-layout-backend-integration.md` + `codex-context-g3-int-layout-backend-integration.md` | G3.INT linked P0 package | Oracle / Nebula → Confideline backend binding; обязательный G3.INT.I18N с key registry, safe translation-only import и 100% coverage/readback каждой rollout-локали |
| `Test-G3IntegrationHandoff.ps1` | G3.INT | Focused proof integration/i18n boundary, human HTML/DOCX, panel mapping, acceptance cases и честной runtime-границы |
| `current-site-state-g1-g3-2026-07-29.md` | G1-G3 / current | Что подтверждено на существующем сайте, что найдено только в коде или макетах и чего в runtime пока нет |
| `target-site-vision-g1-g3.md` | G1-G3 / target | Целевой клиентский путь, информационная архитектура, консультационное ядро, credits, выдача Экспертов и критерии готового сайта |
| `g1-g3-product-consistency-register.md` | G1-G3 / consistency | Разрешение межцелевых противоречий, единые defaults, owners и release gates |
| `expert-specialization-taxonomy-v2-2026-07-29.md` | G3 / taxonomy | Пять однословных RU/EN-категорий, полный список specialization IDs 1–21, geo-filter, admin route и недеструктивная миграция |
| `g1-g3-product-object-dictionary.md` | G1-G3 / vocabulary | Канонические роли, объекты, состояния, деньги, выдача, reviews и configuration semantics |
| `g1-g3-route-and-admin-ownership-matrix.md` | G1-G3 / routes | Текущие и целевые client/admin routes и правило одного редактора настройки |
| `g1-g3-documentation-closeout-2026-07-29.md` | G1-G3 / closeout | Итог ревизии, проверенные результаты, bounded DOCX repair и честные остаточные gates |
| `etalon-tz-g1-1-*.md` … `etalon-tz-g3-7-*.md` | G1.1-G3.7 / основной документ | 15 функциональных, mixed, operational или QA-пакетов согласно ownership matrix |
| `codex-context-g1-1-*.md` … `codex-context-g3-7-*.md` | G1.1-G3.7 / technical lane | Технические контексты только для обязательного development scope или evidence-backed escalation |
| `tz-g1-1-for-igor.*` … `tz-g3-7-for-igor.*` | G1.1-G3.7 / чтение | Человекочитаемые HTML и DOCX; legacy filename не определяет исполнителя |
| `product-architecture-g1-g6-ownership-map.md` | G1-G6 cross-cut | Канонические объекты, владельцы правил, разделение request/session/support/refund/quality/KPI и карта админ-панели |
| `Test-G1G3Documentation.ps1` | G1.1-G3.7 | Сквозная проверка 15 пар, HTML/DOCX, обязательных разделов, семантических инвариантов и panel mappings |
| `Test-FunctionalTzStandardG11.ps1` … `Test-FunctionalTzStandardG24.ps1` | G1-G2 | Focused verifiers продуктовых и технических контрактов G1/G2 |
| `tz-g1-chat-service-session.md` | G1.1-G1.4 | Consultation, role chat, states/history, critical notifications |
| `tz-g2-billing-refunds-compensation.md` | G2.1-G2.4 | Price/balance, timer, refund, agent compensation |
| `tz-g3-catalog-profile-rotation.md` | G3.1-G3.7 | Storefront, catalog, profile, start, E2E, completeness, rotation |
| `tz-g4-support-disputes-rules.md` | G4.1-G4.4 | Support, disputes/refunds, mandatory terms, support notifications |
| `tz-g5-events-kpi-launch.md` | G5.1-G5.4 | Event lineage, dashboard, KPI, traffic gate |
| `tz-g6-assignment-sla-quality-access.md` | G6.1-G6.7 | Assignment, SLA, QA, admission, staff alerts/workspace/ACL |
| `tz-crosscut-admin-managed-settings.md` | G1-G6 cross-cut | Admin-managed values, readback, version/audit, snapshot и acceptance |
| `admin-panel-settings-development-package.md` | cross-vertical mixed subpackage | Разработка отсутствующих admin-capabilities и последующая операционная настройка/readback без дублирования существующих редакторов |
| `asknebula-pricing-benchmark-2026-07-21.md` | current market reference + owner decision boundary | USD для покупки, global 30 credits/minute; package conversion не выдуман |
| `owner-decisions.md` | owner gates | Только решения, которые нельзя безопасно вывести из подтвержденной модели |
| `delivery-matrix.md` | 30 задач | Фазы, зависимости, proof и текущий следующий шаг |
| `post-mvp-backlog-2026-07-29.md` | вне 30 задач | Расширения после MVP, границы обязательных P0-срезов и условия возврата |
| `review-register.md` | committee proof | PM, Антон, Gemini и Evidence Lead review |
| `vertical-package-g6-1-g6-7-g1-2.md` | first programmer slice | Назначение анкет, изолированный доступ и чат по ролям |
| `vertical-package-session-money.md` | vertical 2 | Service session, lifecycle, billing, refund и compensation |
| `vertical-package-client-pilot.md` | vertical 3 | Полный клиентский путь, support, rules, core events и обязательный V3 manual minimum G3.6/G3.7: taxonomy v2, completeness input, eligibility/manual order при disabled KPI. До G3.7/G3.5 потребляет ранний prerequisite slice G6.4: current versioned admission + fail-closed no eligibility/session/debit |
| `vertical-package-operations-pilot.md` | vertical 4 owner package | Primary ownership G6.2-G6.5. G6.4 сначала поставляет admission-gate minimum как prerequisite V3, затем полный training/re-admission/first-shift operations; порядковый номер пакета не откладывает prerequisite до окончания V3 |
| `vertical-package-public-scale.md` | vertical 5 | Историческое имя; в шестимесячной программе содержит обязательные MVP-срезы G4.4, G5.3 и G6.6. Scale extensions вынесены в post-MVP backlog |
| `vertical-package-analytics-launch.md` | vertical 6 | Dashboard и public traffic gate |
| `readiness-summary.md` | readiness map | 30/30 task coverage, enablement gates и runtime boundary |
| `owner-enablements-pilot-defaults-proposal.md` | owner decision shortcut | Рекомендуемые O1/O2/O3/O6 defaults, O4/price inputs и O5 baseline gate |
| `curation-control.md` | active curation control | Текущий статус, очередь owner decisions, done/stop conditions и кураторский ledger |
| `completion-audit.md` | 30-task completion audit | Связность каждого task с ТЗ, vertical, неизбежным owner gate и runtime boundary |

## Общий Definition of Done

Задача закрыта только когда:

1. Требуемое поведение доступно на идентифицируемой сборке и окружении.
2. Положительные сценарии проходят для разрешенных ролей.
3. Отрицательные сценарии запрещают чужие, повторные и недопустимые действия.
4. Состояние после действия можно восстановить в клиентской истории и/или разрешенной staff-поверхности.
5. Деньги, авторство, назначение и примененные правила не противоречат друг другу.
6. Есть evidence packet с expected/actual, build marker, ролями, обезличенными объектами, результатом и остаточными рисками.
7. QA присвоил `runtime_verified`, PM присвоил `accepted`.

Наличие кода, макета, static HTML, формы настроек или сообщения «готово» не закрывает задачу.

## Общие продуктовые инварианты

1. Одна экспертная анкета одновременно назначена только одному агенту.
2. Один агент может управлять многими экспертными анкетами, но вести только один paid chat одновременно.
3. Клиент видит экспертную анкету; агент остается внутренней ролью.
4. Super-admin видит фактического агента каждого сообщения и действия.
5. Foreign actor не читает, не открывает и не отправляет от чужой анкеты независимо от пути входа.
6. Один диалог может содержать несколько service sessions без смешения денег и статусов.
7. Trial используется только после предварительного согласия клиента; затем начинается поминутная оплата каждой начатой минуты.
8. Balance pause предоставляется один раз на session; ее длительность управляется в админ-панели, текущее значение — 5 минут; позднее пополнение не оживляет завершенную session.
9. При потере связи агентом во время paid/pause reconnect grace управляется в админ-панели, текущее значение — 60 секунд; новая paid minute не начинается, после timeout session получает единый статус `completed` с техническим типом/причиной.
10. Повтор действия не создает второй transition, debit, refund, correction или notification.
11. Reassignment не переписывает исторического агента, цену, правила, начисления и public rating экспертной анкеты.
12. Public expert metrics не смешиваются с internal agent KPI.
13. Missing/no-data не показывается как zero, pass или плохое качество.
14. Ручное исполнение SLA, QA и admission допустимо в limited pilot, если оно воспроизводимо и доказано.
15. Админ-настройка считается работающей только после readback в фактическом результате; изменение настройки не переписывает значение, уже примененное к активному периоду session.

## Общие требования к пользовательскому и staff-поведению

1. У каждой критической операции различимы pending, success и failure; ожидание не показывается как успех.
2. Ошибка объясняет, что произошло и какое действие доступно дальше, не раскрывая внутренние или чужие данные.
3. Пустой список, отсутствие данных, загрузка и недоступность имеют отдельные понятные состояния.
4. Кнопка или ссылка на критическом пути не может быть статической имитацией действия.
5. Запрещенное действие либо не предлагается роли, либо при прямом обращении дает согласованный запрет; UI hiding не является proof.
6. Даты/countdown и consultation price в credits/minute отображаются однозначно; money currency используется только на package/payment surface и имеет отдельный staff-readback.
7. Повторная отправка после timeout/retry не должна создавать дубликат результата.
8. Критические client/staff экраны должны оставаться читаемыми на поддерживаемых desktop/mobile размерах без перекрытия управляющих действий.

## Фазы

- `pilot_core`: права, session, деньги и audit должны работать полностью до первого платного пилота.
- `pilot_minimum`: минимальный клиентский, support и operations slice до limited paid pilot.
- `limited_paid_pilot_gate`: сквозная приемка контролируемого платного пилота.
- `public_launch`: полный каталог, ротация и операционная масштабируемость до публичного трафика.
- `post_launch`: расширенная автоматизация и аналитика после достоверного event layer.

## Полнота ТЗ и enablement

Исторический audit подтвердил структурное покрытие 30/30 и включение каждой задачи ровно в один из шести vertical packets. После введения более строгого task-level стандарта это больше не считается автоматическим доказательством `100%` каждого ТЗ.

Текущий подтвержденный результат по новому стандарту:

- G1.1-G3.7: `15/15` автономных пар документов, которые теперь маршрутизируются по классу задачи, а не автоматически Игорю;
- G1.1-G3.7: `15/15` человекочитаемых HTML и DOCX;
- G2.GEO и G3.INT: `2` связанные P0 implementation/content пары поверх 15 продуктовых пар, без изменения реестра 30;
- G1/G2 имеют focused verifiers, G1-G3 имеют отдельный cross-goal semantic verifier;
- G1-G3 specification readiness: `100%`;
- G1-G3 implementation/runtime: открыты до mapped build, positive/negative QA и PM acceptance;
- G2.GEO runtime: historical source inventory `157 = 39 + 118`, `942` locale pages и `1884` files сохранён; пятистрановой text-pilot Japan, South Korea, Mexico, Vietnam и Thailand имеет статус `complete` (`5/5` controlled before/after RU, `30/30` final source↔CMS readback, `5/5` RU visual checks). Full rollout всего current denominator является отдельным scope; фото `0/2` находятся вне text-scope;
- G4-G6: историческое структурное покрытие и vertical handoff сохранены, но повторный task-level audit по новому стандарту ещё открыт.

Следовательно, `ТЗ G1-G3 = 100%` не означает, что сайт реализован на 100%. Актуальное различие зафиксировано в `current-site-state-g1-g3-2026-07-29.md`, `target-site-vision-g1-g3.md` и панели.

Принятые O1/O2/O3/O6/O7/O8/O9/O10/O11/R1/P1 реализуются отдельной разработкой admin-панели по `tz-crosscut-admin-managed-settings.md` и `admin-panel-settings-development-package.md`, а не как неизменяемые константы. Для P1 приняты USD, global `30 credits/started minute`, starter `9.99 USD -> 60 credits` и управляемые credit packages/discounts; package не продает фиксированные минуты, auto-refill не входит в MVP. O4/O5 и оставшиеся values реализуются как явно настраиваемые или disabled/unset состояния. Они блокируют включение зависимой функции либо launch gate, но не блокируют разработку остальных состояний, прав, readback и acceptance hooks.

## Требование к development handoff

Каждая переданная разработчиком на QA версия сопровождается:

```text
task IDs в версии:
доступное поведение:
еще отсутствующее поведение:
окружение и build/commit marker:
пути проверки для client/agent/moderator/super-admin/support:
тестовые роли и обезличенные данные:
известные ограничения:
готовность к QA:
```

## Базовые источники

- `reports/six-global-goals-final-canonical-pm-plan-2026-07-14.md`
- `reports/final-review/six-global-goals-final-committee-arbitration-2026-07-14.md`
- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\contracts\SIX-GOALS-RUNTIME-ACCEPTANCE.md`
- `reports/tz-product-*.md` от 2026-07-16
- `.ops/knowledge/nebula/answers/paid-session-chat-ux.md`
- `.ops/knowledge/nebula/answers/expert-training-and-operational-knowledge.md`
