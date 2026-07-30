# Матрица исполнения задач G1–G6: админ-панель и разработка

Версия: `1.0`  
Дата: 2026-07-29  
Статус: `canonical_execution_routing_for_30_tasks_and_2_linked_packages`

## 1. Назначение

Эта матрица определяет не только владельца требования, но и правильный порядок выполнения:

```text
проверить существующую админ-панель
→ выполнить доступную настройку или операцию
→ зафиксировать readback и доказательства
→ передать разработчику только подтверждённый технический gap
→ после исправления завершить настройку и повторный readback
```

Наличие задачи в шести целях не означает, что её целиком выполняет программист. Модератор или super-admin не должны заказывать разработку функции, уже доступной в существующей админ-панели. Игорь не должен придумывать тексты, переводы, policy-смысл, финансовое решение, результат модерации или PM-вердикт.

## 2. Классы пакетов

| Класс | Когда применяется | Основной документ | Когда подключается Игорь |
|---|---|---|---|
| `DEV` | Требуется новый server/runtime/UI-контракт; существующая настройка не может дать результат | Функциональное ТЗ разработчику + технический контекст | Сразу после готовности требований |
| `MIXED` | Для результата обязательны и новая разработка, и последующая работа в админке | Разделённый пакет: функциональное ТЗ + операционный runbook | По явно указанному development scope; контент и решения остаются у операционного владельца |
| `OPS_FIRST` | Нужная сущность или редактор уже существует либо должен быть сначала проверен | Операционный runbook moderator/super-admin | Только по evidence-backed gap |
| `CONTENT_POLICY` | Сначала нужно утвердить смысл текста, policy, учебного или справочного материала | Утверждённый source + инструкция публикации/перевода | Только если отсутствует key, поле, route, binding, versioning или readback |
| `QA_GATE` | Задача принимает или отклоняет уже собранный результат | Протокол проверки, evidence packet и verdict | Только для исправления конкретного FAIL |

`MIXED` не означает «Игорь делает всё». Внутри такого пакета обе дорожки всегда отделены.

## 3. Роли

- **Moderator / content operator** — тексты, переводы, content/profile/review queues, support cases, evidence collection и разрешённые публикации.
- **Super-admin** — конфигурация MVP до делегирования permissions, назначения, financial decisions, protected policy versions, rollback и полный audit.
- **PM / Product Owner** — продуктовый смысл, scope, приёмка и GO/NO_GO.
- **Legal / policy owner** — юридические и safety-формулировки, которые нельзя выводить из интерфейса или конкурентов.
- **Игорь / разработка** — отсутствующий или сломанный технический контракт.
- **QA** — независимая проверка на идентифицируемой сборке; QA не подменяет разработчика и PM.

Текущая техническая авторизация многих операций остаётся `super-admin`. После реализации владелец может распределить permissions через существующий RBAC; это не требует создания отдельной продуктовой роли.

## 4. Матрица 30 задач

| Task | Класс | Операционная работа в админке | Разработка | Правильный handoff |
|---|---|---|---|---|
| G1.1 Карточка консультации | `MIXED` | Super-admin/moderator восстанавливает случай через текущие Chat, Сообщения и Поддержку; после build использует единую карточку, связи и audit | Consultation list/view, единая карточка, ACL, snapshots, links и readback | Функциональное ТЗ разработчику + runbook просмотра/разбора консультации |
| G1.2 Чат по ролям | `MIXED` | Moderator ведёт support/safety, super-admin проверяет сообщения, нарушения и RBAC; настраивает разрешённые параметры чата после появления страницы | Assignment ACL, публичное авторство, free/session split, цензура, attachments, versions, retry и audit | ТЗ разработчику по доказанным gaps + operational chat checklist |
| G1.3 Статусы и история | `MIXED` | Super-admin управляет разрешёнными timeout/reason settings и разбирает связанные incidents; ручная установка невозможного state запрещена | Request/session state machine, clocks, history, «Мои консультации», settings и immutable audit | ТЗ разработчику + инструкция настройки lifecycle |
| G1.4 Уведомления консультации | `MIXED` | Super-admin/moderator ведёт Email Templates, тексты и пользовательские категории; проверяет delivery log/readback | Event catalog, rules, quiet hours, dedup/retry, safe payload и notification settings | ТЗ разработчику + каталог операционных шаблонов/правил |
| G2.1 Цена, credits и баланс | `MIXED` | Super-admin управляет prices, packages, coupons, grants, Payment systems, Orders и Transactions; финансовые значения проходят preview/readback | Wallet/balance buckets, package/coupon extensions, profile override, snapshots, payment idempotency и reconciliation | ТЗ разработчику + финансовый admin-runbook |
| G2.2 Таймер и остановка | `MIXED` | Super-admin задаёт trial, warning, pause и reconnect limits после build; moderator финансовых прав не получает | Server-authoritative timer, atomic debit, pause/reconnect, incidents и ledger | ТЗ разработчику + инструкция activation/readback параметров |
| G2.3 Возвраты | `MIXED` | Moderator ведёт support case; только super-admin принимает и исполняет ручное financial decision, проверяет readback | Refund lifecycle, session/debit linkage, preview, bucket restore, appeal, exactly-once execution и audit | ТЗ разработчику + refund operating procedure |
| G2.4 Начисления Агентам | `MIXED` | Super-admin использует partner payments/payouts/minus, weekly reconciliation и ручной settlement | Session→actual Agent ledger, rule snapshot, correction, idempotency и reconciliation | ТЗ разработчику + settlement/reconciliation runbook |
| G3.1 Витрина | `MIXED` | Moderator/super-admin ведёт блоки, тексты, media, FAQ, review presentation, preview, publication и rollback | Routes/theme, dynamic data, composer/versioning, role/personal states, cache/error handling | ТЗ разработчику + storefront content runbook |
| G3.2 Каталог и dashboard | `MIXED` | Super-admin проверяет profile fields, taxonomy mapping, assignments, languages и regions; публикует согласованную taxonomy version | Expert-only query, filters, pagination, geo binding, migration и missing taxonomy runtime | ТЗ разработчику + taxonomy/catalog configuration runbook |
| G3.3 Профиль Эксперта | `MIXED` | Moderator заполняет и модерирует анкеты и отзывы, управляет публикацией и переводами | Public projection, review workflow, ACL, versions, history и reassignment integration | ТЗ разработчику + profile/review operations |
| G3.4 Подбор и старт | `MIXED` | Moderator/PM готовит вопросы, варианты, branching copy и переводы; super-admin публикует rule version | Matching engine, auth-intent, idempotency, backend actions и negative states | ТЗ разработчику + matching-content runbook |
| G3.5 Сквозная проверка | `QA_GATE` | QA/super-admin фиксирует baseline, выполняет scenarios, rollback и reconciliation; PM выдаёт GO/NO_GO | Игорь предоставляет build marker, fixtures/hooks и исправляет отдельные FAIL | QA-протокол и evidence packet; defect tickets вместо «ТЗ Игорю» |
| G3.6 Полнота и taxonomy | `OPS_FIRST` | Super-admin сначала инвентаризирует profile fields, утверждает taxonomy/completeness rules, overrides, preview/publish/rollback | Только missing evaluator, snapshot/versioning, binding, bulk action или admin capability | Операционный taxonomy/completeness runbook → scoped dev request по gaps |
| G3.7 Eligibility и ротация | `MIXED` | Super-admin ведёт surface policies, exclusions, pin/priority/weight, preview/publish/rollback | Eligibility/ranking runtime, stable pagination, stale-state, concurrency и ACL enforcement | ТЗ разработчику + eight-surface policy runbook |
| G4.1 Поддержка | `MIXED` | Moderator ведёт очередь и переписку, категории, SLA и клиентский результат; super-admin видит полный audit | Persistent case, session linkage, ownership/ACL, evidence, status/readback | ТЗ разработчику + support operating procedure |
| G4.2 Жалобы и возвраты | `MIXED` | Moderator расследует complaint/dispute; только super-admin принимает refund/correction decision | Linked dispute lifecycle, decision→one correction, appeal, ledger/readback | ТЗ разработчику + dispute/refund decision runbook |
| G4.3 Документы и правила | `CONTENT_POLICY` | PM/legal утверждают смысл; moderator создаёт версии, переводы и публикацию; super-admin активирует protected version | Consent/version enforcement, stale/missing fail-closed, key/route/binding gaps | Policy source + publication runbook; dev ticket только по техническому gap |
| G4.4 Уведомления поддержки | `MIXED` | Super-admin настраивает owner routes, SLA/escalation rules и шаблоны; moderator обрабатывает alert | Critical routing, dedup, overdue/escalation events, delivery/readback | ТЗ разработчику + escalation configuration runbook |
| G5.1 События воронки | `DEV` | После build super-admin/analyst проверяет event catalog и data-quality gaps; ручное событие не создаётся | Canonical emission, identity/lineage, idempotency, privacy и reconciliation | ТЗ разработчику; затем event validation protocol |
| G5.2 Дашборд | `DEV` | Analyst/super-admin использует filters и readback после появления trustworthy data | Dashboard, metric queries, no-data/stale/error/reconciliation и ACL | ТЗ разработчику; операционная инструкция после build |
| G5.3 Таблица показателей | `MIXED` | PM/super-admin утверждает definitions, thresholds, windows, samples и actions; pilot influence остаётся disabled до evidence | Calculation, lineage, freshness, configuration, versioning и explainable readback | KPI dictionary/admin-runbook + ТЗ calculation/runtime |
| G5.4 Допуск рекламы | `QA_GATE` | PM/super-admin выполняет manual gate и выдаёт GO/NO_GO по свежему evidence; O5 остаётся закрытым до pilot baseline | Только автоматизированный сбор/отображение доказанных inputs, если включён в scope; решение не автоматизируется | Launch-gate protocol; defect/data tickets по конкретным FAIL |
| G6.1 Назначение | `MIXED` | Только super-admin назначает/переназначает анкеты, указывает причину и проверяет history | Assignment/reassignment transaction, ACL, actual actor, audit и conflict guards | ТЗ разработчику + assignment operations |
| G6.2 Сроки реакции | `MIXED` | Super-admin задаёт SLA/schedule/escalation, moderator работает по очереди и incidents | Timers, deadlines, breach events, snapshots, busy/reconnect semantics и readback | ТЗ разработчику + SLA configuration/runbook |
| G6.3 Контроль качества | `MIXED` | Moderator/QA проводит review и appeal; super-admin публикует scorecard/critical-fail version и принимает protected actions | Review workflow, sampling, versioned scorecard, audit, access blocks и events | ТЗ разработчику + QA operating procedure |
| G6.4 Обучение и регламенты | `CONTENT_POLICY` | PM/domain/legal утверждают программу и правила; moderator/Ксения ведут Moodle, review и evidence; owner допускает к paid | Admission/re-admission gates, version linkage, fail-closed paid access и audit | Учебный/content пакет + admission runbook; dev ticket по gate/runtime gaps |
| G6.5 Командные уведомления | `MIXED` | Super-admin настраивает получателей, severity, fallback и escalation; staff обрабатывает alert | Critical staff events, dedup/retry, role-safe delivery и journal | ТЗ разработчику + team-alert configuration |
| G6.6 Админка на отдельном URL | `DEV` | Super-admin принимает целевой route и проверяет доступ после build | Отдельный route/shell, redirects, session/security boundary и rollback | ТЗ разработчику |
| G6.7 Изолированный доступ в админку | `DEV` | Super-admin назначает permissions через существующий RBAC и выполняет role readback | Server-side role/assignment ACL, direct-URL deny, isolation tests и audit | ТЗ разработчику + независимая role acceptance matrix |

## 5. Связанные P0-пакеты вне реестра 30 задач

| Package | Класс | Операционная работа | Разработка | Текущий статус |
|---|---|---|---|---|
| G2.GEO Country/city content | `OPS_FIRST` + `CONTENT_POLICY` | Codex готовит source-first draft; moderator проверяет, публикует через существующие country/geoname editors и делает admin/public readback | Только missing field/binding/route/save/readback/template gap | Пятистрановой text-pilot `complete`: Japan, South Korea, Mexico, Vietnam, Thailand; доказаны `5/5` controlled before/after RU, `30/30` final source↔CMS readback и `5/5` RU visual checks. Full rollout всего denominator — отдельный scope; фото `0/2` вне text scope |
| G3.INT Oracle/Nebula → backend | `MIXED` | Владельцы страниц дают source/config readback; moderator выполняет i18n inventory, existing-key search, translations, cache/admin/public readback и rollout-locales | Layout→route/data/action integration, auth/cache/SEO/rollback; только missing/broken i18n bindings и import-safety gaps | Integration runtime открыт; G3.5 принимает результат независимо |

G2.GEO review: `H:\GPT-Codex\Confideline\reports\g2-geo-five-country-pilot-2026-07-29\review.html`.

## 6. Обязательный gate перед технической эскалацией

До передачи Игорю moderator/super-admin фиксирует:

1. точный admin/public route и роль;
2. что искалось в существующей админ-панели;
3. текущую настройку, key, field или entity;
4. ожидаемый и фактический результат;
5. save → refresh/cache → admin readback → public readback;
6. locale, version и применимые permissions;
7. screenshot или воспроизводимый сценарий;
8. отсутствие или поломку технической возможности.

Техническая эскалация допустима, если доказано хотя бы одно:

- нужного поля, страницы, действия, permission или binding нет;
- строка hardcoded либо key отсутствует;
- key существует, но выводится raw/blank/не на той locale;
- save не сохраняется или readback расходится;
- route, cache, model, query, state, ACL или integration воспроизводимо сломаны;
- операция требует недоступной atomicity, idempotency, versioning, audit или rollback.

После исправления moderator/super-admin завершает исходную операцию и прикладывает повторный readback. Закрытый dev ticket без прикладного admin/public результата не закрывает задачу.

## 7. Правила документов на панели

- Пользовательская подпись первого документа: **«Основной документ задачи»**, а не универсальное «ТЗ для Игоря».
- Пользовательская подпись второго документа: **«Технический контекст / эскалация»**.
- Для `DEV` основной документ является ТЗ разработчику.
- Для `MIXED` основной документ явно содержит две дорожки; technical context описывает только development lane.
- Для `OPS_FIRST` основной документ является операционным runbook; технический контекст открывается только при gap.
- Для `CONTENT_POLICY` основным является утверждённый source/policy/content пакет и инструкция публикации.
- Для `QA_GATE` основным является протокол проверки; Игорь получает отдельные defect tickets.
- Имена старых файлов `*-for-igor.*` могут временно сохраняться ради совместимости ссылок, но не определяют владельца работы.

## 8. Граница готовности

`spec_completeness = 100%` означает, что работа корректно маршрутизирована и проверяема. Это не означает:

- что moderator уже выполнил admin operation;
- что Игорь реализовал development scope;
- что QA принял runtime;
- что PM дал GO;
- что ограниченный пилот доказывает полный coverage.
