# Completion audit: функциональные ТЗ 30 задач

Дата актуализации: 2026-08-05
Статус: `G1_G2_G3_15_of_15_etalon_pairs_verified_G4_G6_historical_coverage_runtime_open`  
Область доказательства: полнота и связность функционального ТЗ, не реализация сайта.

> Текущая граница аудита: структурное покрытие 30/30 сохранено, но универсальная модель «PM-ТЗ + Codex-контекст для Игоря» отменена. `task-execution-ownership-matrix.md` распределяет задачи между operations, content/policy, QA и development. G1-G3 имеют task-level документы; G4-G6 сохраняют историческое структурное покрытие и ожидают role-aware переоформления. Ни одна задача не считается runtime-ready без применимого operational/development proof.

Implementation/runtime остаётся открыт для всех задач: документальная полнота не заменяет build mapping, persisted readback, role-negative proof и PM acceptance.

Актуальные owner/state refs для G1-G3: `g1-g3-product-consistency-register.md`, `g1-g3-route-and-admin-ownership-matrix.md`, `g1-g3-product-object-dictionary.md`, `owner-decisions.md`, `current-site-state-g1-g3-2026-07-29.md` и `target-site-vision-g1-g3.md`. Старые межзадачные `tz-g*-*.md` являются обзорными источниками; автономный task handoff имеет приоритет.

Сквозной cross-goal audit от 2026-08-05: `g1-g3-cross-goal-audit-2026-08-05.md`. В нём отдельно зафиксировано устранение рассинхронизации по regional fallback и подтверждено, что оставшиеся пункты являются runtime/release gates, а не конфликтами требований.

## Критерии аудита

Для каждой задачи требуется одновременно:

1. один канонический task heading в G1-G6 ТЗ;
2. описанное требуемое поведение и приемка;
3. ровно один programmer/QA vertical;
4. обязательный proof и следующий шаг в delivery matrix;
5. owner gate только там, где решение нельзя безопасно вывести;
6. статус runtime не выше `not_runtime_verified` без mapped build и evidence.

## Матрица 30/30

| Task | Каноническое ТЗ | Vertical | Невыводимый gate | Requirement verdict | Runtime verdict |
|---|---|---|---|---|---|
| G1.1 | `etalon-tz-g1-1-service-session.md` + Codex pair | session-money | нет | etalon spec 100% | open |
| G1.2 | `etalon-tz-g1-2-role-chat.md` + Codex pair | assignment/ACL/chat | нет | etalon spec 100% | open |
| G1.3 | `etalon-tz-g1-3-status-history.md` + Codex pair | session-money | нет; O7/O8 закрыты | etalon spec 100% | open |
| G1.4 | `etalon-tz-g1-4-chat-notifications.md` + Codex pair | client-pilot | `/ru/admin/notification-rule/index` — owner delivery rules | etalon spec 100% | open |
| G2.1 | `etalon-tz-g2-1-price-balance.md` + Codex pair | session-money | `/ru/admin/settings/prices` и `/ru/admin/settings/coupons`; remaining enablements fail-closed | etalon spec 100% | open |
| G2.2 | `etalon-tz-g2-2-timer-debit-pause.md` + Codex pair | session-money | `/ru/admin/settings/consultations`; O7/O8 закрыты | etalon spec 100% | open |
| G2.3 | `etalon-tz-g2-3-refunds.md` + Codex pair | session-money | refund owner route; R1 принят/admin-managed | etalon spec 100% | open |
| G2.4 | `etalon-tz-g2-4-agent-accruals.md` + Codex pair | session-money | `/ru/admin/settings/accruals`; numeric enablement fail-closed | etalon spec 100% | open |
| G3.1 | `etalon-tz-g3-1-storefront.md` + Codex pair | V3 client-pilot | `home` slice только из G3.7; отдельного pilot pool нет | etalon spec 100% | open |
| G3.2 | `etalon-tz-g3-2-expert-catalog.md` + Codex pair | V3 client-pilot | taxonomy G3.6 и eligibility/order G3.7 | etalon spec 100% | open |
| G3.3 | `etalon-tz-g3-3-expert-profile.md` + Codex pair | V3 client-pilot | `/ru/admin/settings/reviews`; copy/legal — release review | etalon spec 100% | open |
| G3.4 | `etalon-tz-g3-4-matching-start.md` + Codex pair | V3 client-pilot | `/ru/admin/settings/matching` — единственный editor matching | etalon spec 100% | open |
| G3.5 | `etalon-tz-g3-5-client-path-qa.md` + Codex pair | V3 pilot gate | GO только после P0 runtime evidence | etalon spec 100% | open |
| G3.6 | `etalon-tz-g3-6-profile-completeness.md` + Codex pair | P0 MVP manual minimum | `/ru/admin/profile-field/completeness`; taxonomy v2 + manual input | etalon spec 100%; automation находится в post-MVP backlog | open |
| G3.7 | `etalon-tz-g3-7-eligibility-rotation.md` + Codex pair | P0 MVP manual minimum | `/ru/admin/settings/expert-ranking`; KPI influence disabled | etalon spec 100%; KPI automation находится в post-MVP backlog | open |
| G4.1 | `tz-g4-support-disputes-rules.md` | client-pilot | нет; O1 принят, owner назначается operationally | ready | open |
| G4.2 | `tz-g4-support-disputes-rules.md` | client-pilot | нет; R1 принят/admin-managed | ready | open |
| G4.3 | `tz-g4-support-disputes-rules.md` | client-pilot | нет owner gate; O6 product minimum принят, legal wording/resources release gate | ready | open |
| G4.4 | `tz-g4-support-disputes-rules.md` | public-scale | нет; O1 принят, route настраивается operationally | ready | open |
| G5.1 | `tz-g5-events-kpi-launch.md` | client-pilot | нет | ready | open |
| G5.2 | `tz-g5-events-kpi-launch.md` | analytics-launch | нет; строится после trusted events | ready | open |
| G5.3 | `tz-g5-events-kpi-launch.md` | public-scale | нет сейчас; O3 pilot readback принят/admin-managed | ready, influence disabled | open |
| G5.4 | `tz-g5-events-kpi-launch.md` | analytics-launch | O5 после pilot baseline | ready; gate корректно отложен | open |
| G6.1 | `tz-g6-assignment-sla-quality-access.md` | assignment/ACL/chat | нет | ready | open |
| G6.2 | `tz-g6-assignment-sla-quality-access.md` | operations-pilot | нет; O1 принят и admin-managed | ready | open |
| G6.3 | `tz-g6-assignment-sla-quality-access.md` | operations-pilot | нет; O2 принят и admin-managed | ready | open |
| G6.4 | `tz-g6-assignment-sla-quality-access.md` | operations-pilot | нет owner gate; O2/O6 приняты, legal resources release gate | ready | open |
| G6.5 | `tz-g6-assignment-sla-quality-access.md` | operations-pilot | нет; O1 принят, route настраивается operationally | ready | open |
| G6.6 | `tz-g6-assignment-sla-quality-access.md` | public-scale | нет; scope выведен из role/task contracts | ready | open |
| G6.7 | `tz-g6-assignment-sla-quality-access.md` | assignment/ACL/chat | нет | ready | open |

## Закрытые выводимые решения

Следующие вопросы не эскалируются владельцу:

- все unset owner values имеют fail-closed/disabled state и staff readback;
- operational assignee и escalation route задаются разрешенной staff-ролью; G3 pilot не создаёт отдельный pool, а использует versioned manual G3.6/G3.7 policy records для тех же восьми surfaces;
- KPI не влияет на public rotation до отдельного O3 и достаточной выборки;
- fixed/SLA/task compensation отключены до O4, но consultation ledger/correction остаются build-ready;
- O5 не получает выдуманных thresholds до pilot baseline;
- legal/copy review является release check, а не пробелом функционального ТЗ;
- GO limited paid pilot является runtime acceptance после P0 proof, а не решением о содержании ТЗ.

## Остаток owner-gates

До limited paid pilot нужны только:

1. O4: initial consultation percentage и eligible-base policy; admin model уже закрыта, прочие compensation-компоненты могут оставаться disabled.
2. Billing enablement: числовая сетка дополнительных package discounts и refill/auto-refill. Global `30 credits/minute`, `USD`, starter `9.99 USD -> 60 credits` и управляемая package/discount-модель уже приняты.

Post-pilot переключение KPI influence из `disabled` является будущим evidence-dependent owner gate и не требуется для закрытия текущего pilot functional TZ.

O6 product minimum принят; exact legal/domain wording и approved jurisdiction resources остаются release gate, а не повторным owner-вопросом о самих запретах.

Violation detection закрыт как функциональное требование: system events, message monitoring, client report, staff flag, QA review и reconciliation создают `safety signal`; только разрешенный review переводит его в confirmed/dismissed verdict. Protected critical signal может немедленно остановить обычный сценарий, но не становится автоматическим финансовым/дисциплинарным приговором.

Chat privacy closure: phone/email/messenger/external links, exact address, identity/payment/authentication data и другие protected direct identifiers блокируются server-side до отправки в обе стороны. Obfuscation/split/direct/attachment cases входят в acceptance; raw blocked value не хранится в chat/audit, а необходимые service/support data идут через approved structured/secure fields.

O5 остается обязательным, но его корректный момент — после pilot baseline. Это не текущий owner-вопрос.

## Итог

Функциональный слой сохраняет историческое структурное покрытие `30/30`. По новому стандарту task-level документы есть для `15/15` задач G1.1-G3.7; G4-G6 ещё требуют полного role-aware переоформления. Ни одна строка не доказана как `runtime-ready`: нужны operator/config/content readback, применимый build marker и независимое positive/negative QA evidence.

## Финальный audit snapshot 2026-07-29

| Контур | Доказано | Статус |
|---|---|---|
| Canonical task scope | G1-G3: 15/15 эталонных пар; G4-G6: историческое структурное coverage | `G1_G3_spec_ready / G4_G6_reaudit_open` |
| Role-aware handoff | `task-execution-ownership-matrix.md` + 6 `vertical-package-*.md`; operations/content/QA не подменяются development | `routing_ready_runtime_open` |
| Admin development | 7 screens: SLA, QA/admission, KPI, Trust & Safety/privacy, refunds, credits/packages/discounts, agent compensation | `requirement_ready` |
| Current owner/economics inputs | только additional package discount grid + refill/auto-refill и O4 initial consultation percentage + eligible base | `waiting_owner_values` |
| Deferred evidence gates | O5 после pilot baseline; legal/domain safety wording/resources. KPI influence не является gate MVP и находится в post-MVP backlog | `correctly_deferred` |
| Runtime/site | нет mapped build, positive/negative role proof, persisted readback/audit и PM acceptance | `NO_GO` |

Текущие owner inputs не являются пробелами структуры ТЗ: для каждого есть admin fields, unset/disabled behavior, versioning, preview, fail-closed rule и acceptance scenarios. Они нужны только для активации зависимой экономики. Новых owner-вопросов сверх двух строк выше completion audit не выявил.

## Архивный snapshot 2026-07-21

Сохранённый исторический status marker: `requirement_scope_audited_30_of_30_runtime_open`.

Исторический вывод «Функциональный слой доказан как `requirement-ready 30/30`» относился только к структурному coverage-аудиту от 21.07.2026 и не заменяет текущий task-level verdict выше.

Прежний заголовок snapshot для трассировки: `## Финальный audit snapshot 2026-07-21`. Этот marker не является текущим разделом или текущим readiness verdict.
