# Маршруты и административное владение G1–G3

Дата: 2026-07-29  
Статус: `target_route_ownership`

## 1. Клиентские маршруты

| Поверхность | Текущий факт | Целевое действие | Владелец |
|---|---|---|---|
| `/{lang}/` | существует мультиязычный public entry, остаётся dating-copy risk | сделать витриной Nebula | G3.1 |
| `/{lang}/dashboard` | dating-выдача пользователей | expert-only выдача | G3.2 |
| `/{lang}/country/{slug}` | существует geo page; полная current content coverage после template update не доказана | G2.GEO content + единая taxonomy и regional experts | G2.GEO content; G3.2/G3.7 listing |
| `/{lang}/city/{slug}` | существует geo page; полная current content coverage после template update не доказана | G2.GEO content + единая taxonomy и regional experts | G2.GEO content; G3.2/G3.7 listing |
| профиль пользователя | существует | публичный профиль Эксперта без Agent data | G3.3 |
| диалог | существует transport/UI | free dialog + consultation links | G1.2 |
| consultation request | не доказан | построить | G1.3 |
| consultation card | не доказана | построить client view | G1.1 |
| «Мои консультации» | не доказан | построить list/detail | G1.1/G1.3 |
| balance/checkout | частично существует | credits packages и readback | G2.1 |
| refund request | не доказан | entry из истории/support | G2.3 |
| review form | не доказана | единая frontend form | G3.3 |
| `/settings/notifications` | email toggles существуют | добавить G1.4 categories | G1.4 |

Stable surface registry G3.6/G3.7 содержит ровно: `home`, `dashboard_catalog`, `country`, `city`, `category`, `matching_result`, `thematic_block`, `expert_profile`. Route/component mapping обязан ссылаться на один из этих IDs; скрытые aliases и неявная inheritance запрещены.

G3.INT выполняет presentation/backend binding для этих восьми IDs и общего auth-пути. Он не становится владельцем маршрута или данных: owner в последней колонке остаётся каноническим, а G3.INT фиксирует source → route → controller/view/assets → projection/action → proof. Для surface без source gate статус — `blocked_source`.

## 2. Операционные admin-маршруты

| Маршрут | Решение |
|---|---|
| `/ru/admin/message/chat` | сохранить как рабочий staff chat; показать текущую session и ссылки, не хранить session truth |
| `/ru/admin/message/index` | сохранить как message journal; добавить censorship monitoring/filter |
| `/ru/admin/chat/index` | исправить menu link на рабочий маршрут или retire redirect |
| `/ru/admin/consultation/index` | новый список consultation |
| `/ru/admin/consultation/view?id={id}` | новая единая карточка |
| `/ru/admin/refund/index` | новый/расширенный refund case list |
| `/ru/admin/refund/view?id={id}` | refund decision/execution |
| `/ru/admin/review/index` | moderation queue |
| `/{lang}/admin/geo-content/index` | новая операционная очередь G2.GEO: fresh inventory, source/draft/review/publish/readback/failure status и rollback; не является вторым редактором сущности |
| `/{lang}/admin/country/update?id={id}` | существующий канонический editor content/SEO/media одной страны; G2.GEO пишет только через этот owner-контур или его эквивалентный сервис |
| `/{lang}/admin/geoname/update?id={id}` | существующий канонический editor content/SEO/media одного города; G2.GEO пишет только через этот owner-контур или его эквивалентный сервис |
| `/ru/admin/partner/payments?id={agentId}` | reuse для начислений |
| `/ru/admin/partner/payouts?id={agentId}` | reuse для payout readback |
| `/ru/admin/partner/payments?id={agentId}&mode=minus` | reuse для corrections |

Точные controller/action URL может адаптировать Игорь к текущим Yii2 conventions, но названия меню, смысл и отсутствие параллельных сущностей обязательны.

## 3. Settings-маршруты

| Страница | Что редактирует | Что только показывает ссылкой |
|---|---|---|
| `/ru/admin/settings/consultations` | request/lifecycle timers, reconnect, `balance_pause`, consultation-history projection retention | price/chat/support rules, trial entitlement editor, message-storage/privacy retention |
| `/ru/admin/settings/chat` | message limits, edit, attachments, censorship, templates | reconnect, roles/prices/support |
| `/ru/admin/settings/prices` | global/profile price, packages, package discounts, balance bucket/spending rules | coupons/trial entitlement, minute ledger/refund |
| `/ru/admin/settings/coupons` | coupons, bonus credits, trial entitlement и bonus expiry | global/profile price и packages |
| `/ru/admin/settings/refunds` | windows, categories, calculation/approval policy | support ticket |
| `/ru/admin/settings/accruals` | единственный editor period, components, rates, conversion и correction policy | actual client debit и partner operation/readback |
| `/ru/admin/notification-rule/index` | единственный editor delivery delays, quiet hours, categories и retention | email body |
| `/ru/admin/email-template/index` | email content | delivery timing |
| `/ru/admin/settings/storefront` | block visibility/limits/fallback/media; для home reviews только enabled/visibility/layout/`home_review_card_limit`/fallback | order/content, review policy/eligibility/moderation/aggregate, prices/eligibility |
| `/ru/admin/settings/reviews` | единственный G3.3 editor review policy, eligibility, moderation rules, author modes, `profile_review_card_limit`, aggregate/rating и historical override | review content и `home_review_card_limit` |
| `/ru/admin/profile-field/completeness` | единственный editor completeness rules/evaluation/preview/input override в существующем контуре «Поля анкеты» | ranking/final eligibility |
| `/ru/admin/settings/expert-ranking` | `display_eligible`, `capabilities[]`, `reason_codes[]`, ranking/surface preview и только read-only fresh `paid_start_eligible` readback со ссылкой на owner G1/G2/G6 | field content/matching, paid-start rule/edit/action |
| `/ru/admin/settings/matching` | G3.4 questions, branching, versioned mappings и explanation preview | taxonomy, eligibility/ranking, paid start |
| `/ru/admin/settings/role` | permissions | product settings |
| `/ru/admin/language/list` и существующая translate-страница | единственный редактор translation keys и переводов; Nebula scope/filter, RU/EN source copy, coverage/readback включённых локалей | business/support/legal meaning, theme rollout, отдельная Oracle translation store |
| `/ru/admin/profile-field/index` | исходные profile fields и их значения | category mapping, ranking/matching |
| `/ru/admin/profile-field/expert-taxonomy` | единственный versioned category→specialization→method mapping; меню «Поля профиля → Таксономия Экспертов» | исходные profile-field values, ranking/matching |

## 4. Content-маршруты

| Раздел | Назначение |
|---|---|
| `Содержимое → Витрина Nebula` | блоки, тексты, media, order, draft/preview/publish/schedule; visibility только read-only badge/link |
| `Содержимое → Отзывы` | moderation queue |
| `Страны и города → Контент стран и городов` | G2.GEO status/queue: inventory, source lineage, Codex draft handoff, review, controlled publish, readback и rollback |
| существующие pages/news/info blocks | SEO и редакционные страницы, если подходят по текущей архитектуре |

## 5. Правило одного редактора

Если значение принадлежит одной странице:

- другие страницы показывают applied snapshot;
- дают ссылку на owner-page;
- не создают второе input;
- не сохраняют локальную копию как независимую настройку.

Примеры:

- consultation card показывает price snapshot, но не меняет global price;
- chat settings показывает ссылку на roles, но не назначает permissions;
- storefront показывает expert slice preview, но не хранит ranking;
- Content редактирует storefront order, но visibility показывает только badge/link на Settings;
- Settings редактирует storefront visibility, но order показывает только read-only ссылкой на Content;
- consultation settings показывает applied trial snapshot, но entitlement редактируется только в G2.1 Coupons;
- matching показывает applied taxonomy/eligibility versions, но не редактирует их;
- G3.7 хранит явную запись для каждого из восьми surface IDs; base-policy references и field-level overrides видны в preview/readback, не наследуются скрыто;
- G3.INT показывает applied build/source/config/i18n versions и ссылки на owner pages, создаёт недостающие ключи только через существующий translation-контур, но не создаёт отдельный редактор storefront, translations, taxonomy, ranking, matching, prices, reviews или permissions;
- G3.INT theme rollout хранит только ссылки `surface → rollout Language IDs`; сами Language и переводы остаются в существующем владельце. Translation-only import не может создавать/активировать Language или менять его статус;
- G2.GEO status page показывает job/source/readback state и ссылки на country/geoname editor, но не хранит независимую копию HTML, SEO, media или locale-полей;
- G2.GEO владеет geo content; G3.2/G3.7 используют его рядом со своей listing projection, G3.INT натягивает presentation, а G3.5 принимает E2E — ни один из этих контуров не редактирует чужой owner state;
- template migration сохраняет preimage/hash каждого locale-content record и проходит post-migration field/public readback; при расхождении новая версия не включается;
- refund card показывает original debits, но не редактирует minute ledger.
