# Сквозной PM-аудит G1–G3

Дата: 2026-08-05
Объект: функциональная модель Nebula/Confideline, канонические ТЗ, технические контексты Codex, ownership/admin-карта, связанные P0-пакеты и валидаторы.
Граница: это аудит согласованности постановки и handoff-документов; он не является доказательством того, что production-сайт уже реализован.

## Итоговое решение

После сверки G1.1–G3.7 незакрытых противоречий в продуктовых правилах не осталось. Найденный конфликт был документальным: старое ТЗ G3.2 запрещало общий fallback при нулевой региональной выдаче, тогда как актуальное решение владельца разрешает его. Правило теперь одинаково зафиксировано в G3.2, G3.7, G3.INT, consistency register, target vision, taxonomy и closeout.

Итоговый контракт для country/city:

1. Сначала применяется выбранный регион как основной scope.
2. Если после остальных фильтров региональный eligible-результат равен нулю, разрешается второй запрос в общий eligible pool с теми же негеографическими фильтрами.
3. Клиент видит плашку «В выбранном регионе пока нет Экспертов»; общие анкеты не выдаются за локальные.
4. В readback сохраняются `regional_result_count=0`, `fallback_scope=general`, причина/версия решения; регион попадает в `regions_without_experts`.
5. Уведомления о появлении регионального Эксперта не создаются. Если общий pool также пуст, показывается честный empty state.

Это не повышает runtime-readiness: все три цели остаются `NO_GO` до доказательства на сопоставленной сборке.

## Межцелевые инварианты

| Контур | Единое правило | Владелец | Конфликт после аудита |
|---|---|---|---|
| Dialogue/session | Один постоянный диалог `client + expert profile`; внутри может быть несколько service sessions | G1.1/G1.3 | Нет |
| Consent | Запрос клиента или предложение Эксперта остаются бесплатными до явного подтверждения клиента; создаётся ровно одна session | G1.3 | Нет |
| Roles | Публично «Эксперт», внутренне Agent; роли и permissions не дублируются в настройках чата | G1.2 + существующий RBAC | Нет |
| Chat | G1.2 владеет сообщениями, видимостью, редактированием, вложениями и censorship; lifecycle/цены/refund вынесены | G1.2 | Нет |
| Consultation state | Только `connecting / trial / paid / balance_pause / completed`; waiting/reconnect — подстатусы с отдельными clocks | G1.3/G2.2 | Нет |
| Price | Покупаются credits в USD-пакетах; консультация показывает credits/min; effective price фиксируется snapshot на старте session | G2.1 | Нет |
| Minute | Полная стоимость списывается атомарно при старте минуты; при нехватке баланса следующая минута не начинается | G2.2 | Нет |
| Pause/reconnect | Одна balance pause — 5 минут; reconnect grace клиента и Агента — 60 секунд; во время grace новая минута не начинается | G1.3/G2.2 | Нет |
| Refund/compensation | Refund, dispute и quality — отдельные процессы; фактическое начисление/возврат только вручную super-admin, ledger не переписывается | G2.3 | Нет |
| Accrual | Начисления Агенту ведутся отдельно от client ledger; weekly/компонентные правила не подменяют paid-minute debit | G2.4 | Нет |
| Capacity | Один клиент — не более одной активной/ожидающей paid-консультации; один Agent — не более одной активной `paid`/`balance_pause`; параллельные попытки дают одного победителя | G3.5 + crosscut register | Нет |
| Eligibility | G3.7 возвращает только `display_eligible`, catalog capabilities и reason codes; `paid_start_eligible` проверяется свежим server-side guard G1/G2/G6 | G3.7/G6.4 | Нет |
| Storefront | G3.1 не хранит отдельный ручной pool и получает slice из G3.7; G3.2 использует тот же eligibility/ranking контракт | G3.1/G3.7 | Нет |
| Reviews | Consultation-linked отзывы влияют на рейтинг; исторические testimonials через super-admin override не влияют на rating | G3.3 | Нет |
| Taxonomy | Категория — короткий навигационный уровень, specialization — проблема клиента, method — инструмент; legacy IDs не переиспользуются | G3.6 | Нет |
| i18n | Смысл подтверждает functional owner, публикацию делает moderator, технические gaps исправляет разработчик; импорт ключей атомарный и откатываемый | G3.INT | Нет |
| Admin ownership | Один редактор на настройку: consultations, chat, prices, coupons, refunds, accruals, notifications, storefront, reviews, matching, taxonomy — без дублирования | Crosscut route map | Нет |

## Проверка по задачам

### G1 — консультационный контур

| Задача | Что проверено | Документальный результат | Runtime |
|---|---|---|---|
| G1.1 Карточка consultation session | карточка, readback, snapshot/link; state machine не дублирует G1.3 | PM/Codex/HTML/DOCX согласованы; focused verifier 115/115 | `code_present_unmapped`, acceptance не готов |
| G1.2 Role-based chat | автор/получатель, видимость, edit, attachments, censorship, audit; RBAC остаётся существующим | focused verifier 81/81 | open до mapped build и positive/negative QA |
| G1.3 Request/offer/status/history | request → Agent accept/clarification → client consent → connecting; отдельные clocks и история | focused verifier 80/80; 60-sec Agent SLA и 15-min lifecycle deadline не смешаны | open |
| G1.4 Notifications | in-app/email consultation events; пользовательские email-переключатели и notification rules; не дублирует email-template editor/support/team notifications | focused verifier 116/116 | open |

Риск-контроль G1: основная опасность — принять наличие интерфейса за доказанный persisted state/ACL. Приёмка требует server readback, role-negative cases, audit и idempotency.

### G2 — деньги и расчёты

| Задача | Что проверено | Документальный результат | Runtime |
|---|---|---|---|
| G2.1 Credits/price/balance | USD-пакеты, discounts/coupons, global/profile price, immutable session price snapshot, expiry buckets | focused verifier 111/111 | open до Stripe/payment, ledger и readback proof |
| G2.2 Timer/debit/pause | 60-sec minute, atomic debit, 5-min single pause, 60-sec reconnect, hard stop/no next minute | focused verifier 131/131 | open до boundary/idempotency/reconciliation proof |
| G2.3 Refunds/disputes | case states, eligibility/preview, manual super-admin decision, correction entries, appeal; session остаётся completed | focused verifier 138/138 | open до payment-provider and ledger proof |
| G2.4 Agent accruals | weekly accrual, consultation/fixed/SLA/task components, correction entries, fail-closed disabled/unset | focused verifier 106/106 | open до расчётного readback и correction proof |

Связка G2.1 ↔ G2.2 ↔ G2.3 не конфликтует: G2.1 владеет ценой/балансом, G2.2 — фактом минуты и debit, G2.3 — отдельным refund case и ручным решением. Compensation не запускается автоматически из technical incident.

Связанный пакет G2.GEO: текстовый пилот 5/5 стран закрыт с 5/5 controlled RU before/after, 30/30 source↔CMS readback и 5/5 RU visual checks; полный динамический denominator после смены шаблона остаётся отдельным gate. Фото вне text-scope не считаются закрытыми.

### G3 — витрина, выдача и сквозной путь

| Задача | Что проверено | Документальный результат | Runtime |
|---|---|---|---|
| G3.1 Storefront | home blocks, limits, CTA, balance/consultations, eligible slice из G3.7, без отдельного manual pool | pair и ownership согласованы | open |
| G3.2 Expert catalog | dashboard/catalog/profile/geo filters; primary regional scope + explicit general fallback при нуле | stale regional rule исправлено, PM/Codex/derivatives обновлены | open |
| G3.3 Expert profile/reviews | profile fields, actual user-linked reviews, moderation, historical testimonial override | единый review owner и rating rule | open |
| G3.4 Matching/start | intake, specialization/method, auth boundary, request/consent handoff; не создаёт свою session machine | pair согласована | open |
| G3.5 Client-path QA | positive/negative money/ACL/state/idempotency, two-sided capacity, evidence packet и PM GO | E10 уточнён: один победитель на client/Agent guard | open; independent gate |
| G3.6 Profile completeness/taxonomy | v2 taxonomy, completeness, manual MVP; automation в post-MVP | taxonomy verifier 41/41 | open |
| G3.7 Eligibility/rotation | display eligibility, capabilities, reasons, manual ordering/pinning, KPI influence disabled | региональный zero-result contract синхронизирован с G3.2 | open |

Связанный пакет G3.INT закрыт как документационный implementation handoff 60/60, но не считается отдельной 31-й задачей и не заменяет G3.5. Он должен доказать binding Oracle/Nebula layout → backend route/data/action, locale key coverage, auth/cache/rollback и readback.

## Разделение исполнения

| Тип работы | Кто выполняет | Примеры |
|---|---|---|
| Операционная работа в админке | moderator/super-admin | ключи и переводы, SEO/geo-тексты, страны/города, отзывы, taxonomy values, цены/пакеты/купоны, настройки rules |
| Контент и policy | PM/policy owner + moderator | полиси, crisis wording/resources, FAQ/copy, legal review, source-first geo content |
| Разработка | Игорь | недостающие routes/data binding, server guards, ledger/idempotency, ACL, persistence, i18n import gaps, integration of new layout |
| QA/приёмка | QA + PM/super-admin | build traceability, screenshots, persisted/admin readback, role-negative, rollback, GO/NO_GO |

Legacy filename `for-igor` не означает, что вся задача передаётся программисту: ownership matrix является главным источником исполнителя.

## Что остаётся до MVP-запуска

Это не конфликты, а обязательные release gates:

1. Зафиксировать mapped build/runtime environment для G1–G3.
2. Доказать positive и negative ACL/admission на реальных ролях; G6.4 admission и G6.7 permissions являются внешними зависимостями.
3. Подтвердить Stripe/payment readback, credits ledger, minute idempotency, refund execution и accrual correction.
4. Выполнить G2.GEO full current inventory после template update, включая отдельный photo scope.
5. Выполнить G3.INT фактическое backend binding и передать evidence в независимый G3.5.
6. Провести полный client-path QA, включая concurrent-start, reconnect, pause, zero-balance, censorship, review и notification cases.
7. Закрыть legal/privacy/safety wording и срок хранения истории; значение 24 месяца остаётся provisional до review.
8. Только после pilot baseline закрывать O5/public-traffic gate и делать рекламный запуск.

## Доказательства этого прохода

| Проверка | Результат |
|---|---:|
| `Test-SixGoalsFunctionalTz.ps1` | 309/309, 0 fail, 30/30 tasks |
| `Test-SixGoalsMvpPriorityPolicy.ps1` | 50/50 |
| `Test-TaskExecutionOwnership.ps1` | 63/63 |
| `Test-G1G3Documentation.ps1` | 402/402 |
| `Test-G2GeoContentHandoff.ps1` | 61/61 |
| `Test-G3IntegrationHandoff.ps1` | 60/60 |
| `Test-G5SeoLaunchPlan.ps1` | 55/55 |
| `Test-ExpertTaxonomyV2.ps1` | 41/41 |
| Focused G1.1/G1.2/G1.3/G1.4 | 115/115; 81/81; 80/80; 116/116 |
| Focused G2.1/G2.2/G2.3/G2.4 | 111/111; 131/131; 138/138; 106/106 |

Все проверки относятся к документации, ownership и handoff. Production runtime-код в рамках этого аудита не изменялся; статус сайта остаётся `not_runtime_verified / NO_GO` до появления сопоставленной сборки и полного evidence packet.
