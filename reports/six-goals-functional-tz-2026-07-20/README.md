# Confideline / Nebula: канонический комплект функциональных ТЗ G1-G6

Дата: 2026-07-20  
Статус комплекта: `legacy_30_of_30_structural_coverage / G1.1_etalon_spec_verified / remaining_29_standard_audit_open`  
Область: 30 задач G1.1-G6.7  
Продуктовый статус: `not_runtime_verified / NO_GO`

## Назначение

Комплект переводит канонический PM-план в функциональные ТЗ, пригодные для постановки программисту и независимой приемки. Он описывает, какой результат требуется, как продукт должен вести себя для каждой роли и как доказать готовность.

Комплект не определяет архитектуру, структуру данных, API, классы, таблицы, алгоритмы, технологии или способ написания кода. Эти решения принимает программист.

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
| `functional-tz-quality-standard.md` | G1-G6 methodology | Канонические 12 критериев, 12 hard gates, readiness statuses и шаблон автономного ТЗ |
| `etalon-tz-g1-1-service-session.md` | G1.1 / Игорь | Чистое продуктовое ТЗ от PM: логика, функции, роли, поверхности, admin settings и критерии результата; без предписания реализации |
| `tz-g1-1-for-igor.html` | G1.1 / чтение | Основная человекочитаемая версия с оглавлением, адаптивной версткой, печатным режимом и ссылкой на DOCX |
| `tz-g1-1-for-igor.docx` | G1.1 / передача | Оформленный Word-документ для вычитки, комментариев и передачи Игорю |
| `codex-context-g1-1-service-session.md` | G1.1 / Codex Игоря | Полная техническая картина: состояния, data contract, current source navigation, gaps, 26 acceptance-кейсов и proof boundary |
| `product-architecture-g1-g6-ownership-map.md` | G1-G6 cross-cut | Канонические объекты, владельцы правил, разделение request/session/support/refund/quality/KPI и карта админ-панели |
| `etalon-tz-g1-3-status-history.md` | G1.3 / Игорь | Продуктовое ТЗ: consultation request, compact lifecycle, ожидание, reconnect, единое завершение и история |
| `codex-context-g1-3-status-history.md` | G1.3 / Codex Игоря | Технический контекст, transitions, invariants, data/readback и acceptance matrix G1.3 |
| `Test-FunctionalTzStandardG11.ps1` | standard + G1.1 | Автоматическая проверка разделения PM/Codex, структуры, hard gates, score и acceptance IDs |
| `tz-g1-chat-service-session.md` | G1.1-G1.4 | Consultation, role chat, states/history, critical notifications |
| `tz-g2-billing-refunds-compensation.md` | G2.1-G2.4 | Price/balance, timer, refund, agent compensation |
| `tz-g3-catalog-profile-rotation.md` | G3.1-G3.7 | Storefront, catalog, profile, start, E2E, completeness, rotation |
| `tz-g4-support-disputes-rules.md` | G4.1-G4.4 | Support, disputes/refunds, mandatory terms, support notifications |
| `tz-g5-events-kpi-launch.md` | G5.1-G5.4 | Event lineage, dashboard, KPI, traffic gate |
| `tz-g6-assignment-sla-quality-access.md` | G6.1-G6.7 | Assignment, SLA, QA, admission, staff alerts/workspace/ACL |
| `tz-crosscut-admin-managed-settings.md` | G1-G6 cross-cut | Admin-managed values, readback, version/audit, snapshot и acceptance |
| `admin-panel-settings-development-package.md` | cross-vertical programmer/QA subpackage | Отдельная разработка admin-разделов SLA/timers, QA/admission, KPI, Trust & Safety, refunds, prices/packages и agent compensation |
| `asknebula-pricing-benchmark-2026-07-21.md` | current market reference + owner decision boundary | USD для покупки, global 30 credits/minute; package conversion не выдуман |
| `owner-decisions.md` | owner gates | Только решения, которые нельзя безопасно вывести из подтвержденной модели |
| `delivery-matrix.md` | 30 задач | Фазы, зависимости, proof и текущий следующий шаг |
| `review-register.md` | committee proof | PM, Антон, Gemini и Evidence Lead review |
| `vertical-package-g6-1-g6-7-g1-2.md` | first programmer slice | Назначение анкет, изолированный доступ и чат по ролям |
| `vertical-package-session-money.md` | vertical 2 | Service session, lifecycle, billing, refund и compensation |
| `vertical-package-client-pilot.md` | vertical 3 | Полный клиентский путь, support, rules и core events |
| `vertical-package-operations-pilot.md` | vertical 4 | SLA, QA, admission и critical alerts |
| `vertical-package-public-scale.md` | vertical 5 | Completeness, rotation, KPI и staff workspace |
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

- G1.1: `spec_completeness=100`, `hard_gates=pass`, `owner_policy_closure=closed_for_G1.1`;
- G1.3: `spec_completeness=100`, focused verifier `78/78`, двухфайловый handoff и readable HTML/DOCX готовы;
- G1.1 implementation: `code_present_unmapped`;
- G1.1 runtime: `fail_not_acceptance_ready`;
- G1.2-G6.7: исходные оценки сохранены, повторный task-level audit открыт.

Принятые O1/O2/O3/O6/O7/O8/O9/O10/O11/R1/P1 реализуются отдельной разработкой admin-панели по `tz-crosscut-admin-managed-settings.md` и `admin-panel-settings-development-package.md`, а не как неизменяемые константы. Для P1 приняты USD, global `30 credits/started minute`, starter `9.99 USD -> 60 credits` и управляемые credit packages/discounts; package не продает фиксированные минуты, auto-refill не входит в MVP. O4/O5 и оставшиеся values реализуются как явно настраиваемые или disabled/unset состояния. Они блокируют включение зависимой функции либо launch gate, но не блокируют разработку остальных состояний, прав, readback и acceptance hooks.

## Требование к handoff программиста

Каждая переданная на QA версия сопровождается:

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
