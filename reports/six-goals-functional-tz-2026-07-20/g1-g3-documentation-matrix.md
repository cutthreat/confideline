# Матрица документации и готовности G1–G3

Дата: 2026-07-29  
Правило: `ТЗ 100%` означает, что правильный исполнитель может выполнить свой scope без устного восстановления логики. Класс и разделение admin/development задаёт `task-execution-ownership-matrix.md`. Это не означает `runtime 100%`.

| Задача | Класс | Основной документ | Technical lane | Human HTML/DOCX | Runtime |
|---|---|---|---|---|---|
| G1.1 Карточка консультации | `MIXED` | `etalon-tz-g1-1-service-session.md` | `codex-context-g1-1-service-session.md` | `tz-g1-1-for-igor.*` | открыт |
| G1.2 Чат по ролям | `MIXED` | `etalon-tz-g1-2-role-chat.md` | `codex-context-g1-2-role-chat.md` | `tz-g1-2-for-igor.*` | открыт |
| G1.3 Статусы и история | `MIXED` | `etalon-tz-g1-3-status-history.md` | `codex-context-g1-3-status-history.md` | `tz-g1-3-for-igor.*` | открыт |
| G1.4 Уведомления | `MIXED` | `etalon-tz-g1-4-chat-notifications.md` | `codex-context-g1-4-chat-notifications.md` | `tz-g1-4-for-igor.*` | открыт |
| G2.1 Цена и баланс | `MIXED` | `etalon-tz-g2-1-price-balance.md` | `codex-context-g2-1-price-balance.md` | `tz-g2-1-for-igor.*` | открыт |
| G2.2 Timer/debit/pause | `MIXED` | `etalon-tz-g2-2-timer-debit-pause.md` | `codex-context-g2-2-timer-debit-pause.md` | `tz-g2-2-for-igor.*` | открыт |
| G2.3 Refunds | `MIXED` | `etalon-tz-g2-3-refunds.md` | `codex-context-g2-3-refunds.md` | `tz-g2-3-for-igor.*` | открыт |
| G2.4 Начисления | `MIXED` | `etalon-tz-g2-4-agent-accruals.md` | `codex-context-g2-4-agent-accruals.md` | `tz-g2-4-for-igor.*` | открыт |
| G3.1 Витрина | `MIXED` | `etalon-tz-g3-1-storefront.md` | `codex-context-g3-1-storefront.md` | `tz-g3-1-for-igor.*` | открыт |
| G3.2 Каталог | `MIXED` | `etalon-tz-g3-2-expert-catalog.md` | `codex-context-g3-2-expert-catalog.md` | `tz-g3-2-for-igor.*` | открыт |
| G3.3 Профиль Эксперта | `MIXED` | `etalon-tz-g3-3-expert-profile.md` | `codex-context-g3-3-expert-profile.md` | `tz-g3-3-for-igor.*` | открыт |
| G3.4 Подбор и старт | `MIXED` | `etalon-tz-g3-4-matching-start.md` | `codex-context-g3-4-matching-start.md` | `tz-g3-4-for-igor.*` | открыт |
| G3.5 Клиентский путь QA | `QA_GATE` | `etalon-tz-g3-5-client-path-qa.md` | Только defect/diagnostic context: `codex-context-g3-5-client-path-qa.md` | legacy `tz-g3-5-for-igor.*` | gate открыт |
| G3.6 Completeness + taxonomy | `OPS_FIRST` | `etalon-tz-g3-6-profile-completeness.md` | Только gap context: `codex-context-g3-6-profile-completeness.md` | legacy `tz-g3-6-for-igor.*` | открыт |
| G3.7 Eligibility/rotation | `MIXED` | `etalon-tz-g3-7-eligibility-rotation.md` | `codex-context-g3-7-eligibility-rotation.md` | `tz-g3-7-for-igor.*` | открыт |

Связанные P0 implementation/content packages, не входящие в 15 продуктовых пар и не меняющие реестр 30 задач:

| Пакет | Класс | Основной документ | Technical lane | Human HTML/DOCX | Runtime |
|---|---|---|---|---|---|
| G2.GEO Страны и города: восстановление + AI-контент | `OPS_FIRST + CONTENT_POLICY` | `etalon-tz-g2-geo-content-restoration.md` | Gap-only: `codex-context-g2-geo-content-restoration.md` | legacy `tz-g2-geo-content-for-igor.*` | 5-country text-pilot `complete`; full rollout всего denominator — отдельный scope |
| G3.INT Oracle/Nebula → Confideline backend, включая P0 G3.INT.I18N | `MIXED`; I18N `OPS_FIRST` | `etalon-tz-g3-int-layout-backend-integration.md` | `codex-context-g3-int-layout-backend-integration.md` | `tz-g3-int-for-igor.*` | integration открыт; moderator-first i18n coverage/readback обязателен до G3.5 |

Общие документы:

- `current-site-state-g1-g3-2026-07-29.md`;
- `target-site-vision-g1-g3.md`;
- `g1-g3-product-consistency-register.md`;
- `expert-specialization-taxonomy-v2-2026-07-29.md`;
- `g1-g3-product-object-dictionary.md`;
- `g1-g3-route-and-admin-ownership-matrix.md`;
- `g1-g3-documentation-closeout-2026-07-29.md`;
- `owner-decisions.md`;
- `task-execution-ownership-matrix.md`;
- `functional-tz-quality-standard.md`.
