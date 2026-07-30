# G3.1 — технический контекст для Codex Игоря

Этот файл передаётся агенту Codex вместе с продуктовым ТЗ `etalon-tz-g3-1-storefront.md`. Он описывает интеграционный контур, обязательные состояния и проверку, но не предписывает Игорю конкретную архитектуру.

## 1. Паспорт задачи

- Task ID: G3.1.
- Название: Публичная витрина.
- Фаза: client pilot / public storefront.
- Приоритет: P0.
- `spec_completeness`: 100%.
- `owner_policy_closure`: closed; brand/domain, final legal wording и public traffic остаются deferred release gates.
- `implementation_status`: code_present_unmapped.
- `runtime_acceptance`: not_run.
- Product owner: Product Owner / Project Manager Nebula.
- Целевые роли: guest, client, Expert public profile, Agent as hidden operator, super-admin.

Приоритет источников:

1. `etalon-tz-g3-1-storefront.md` — желаемое продуктовое поведение.
2. Актуальные owner decisions и канонические G1–G6 contracts.
3. Точные Figma frames/nodes — visual truth.
4. Мapped build/commit Игоря — фактическая техническая база.
5. Этот файл — integration and verification context.
6. Старые static task cards, Oracle HTML и competitor pages — reference only.

## 2. Краткий контекст

Текущая Confideline-база выросла из dating-сценария, а целевой продукт продаёт онлайн-консультацию с Экспертом. Визуальная Home-система существует, но её тексты, brand labels, статические анкеты, USD minute price и claims не являются продуктовой truth.

G3.1 должна соединить Figma-композицию с реальными источниками Экспертов, статусов, price, reviews, topics, personalized consultation states, translations, SEO и admin publishing. Страница должна оставаться честной при частичной недоступности зависимостей.

Shared stable surface registry is complete: `home`, `dashboard_catalog`, `country`, `city`, `category`, `matching_result`, `thematic_block`, `expert_profile`. G3.1 owns presentation only for `home`; it must not create aliases, partial copies or hidden inheritance for the other surfaces.

## 3. Результат

На одном mapped build публичный `/{language}/`:

- показывает source-backed Figma layout;
- использует только актуальные допустимые Expert profiles;
- сохраняет intent через auth;
- показывает role-safe personalized states;
- получает price/status/reviews/topics из их канонических owners;
- управляется super-admin через draft/preview/publish/versioned settings;
- проходит guest/auth, accessibility, performance, SEO, analytics, cache-isolation и negative acceptance.

## 4. Термины

- **Storefront** — публичная главная, а не каталог и не dashboard.
- **Public block** — индексируемый общий блок, одинаковый для допустимого контекста.
- **Personal block** — данные конкретного клиента, не индексируемые и не shared-cacheable.
- **Expert profile** — публичная анкета; Agent не раскрывается.
- **Eligibility** — можно ли показать анкету на конкретной surface.
- **Rotation result** — порядок уже допустимых анкет из G3.7.
- **Topic** — клиентский тип вопроса.
- **Method** — инструмент/практика Эксперта.
- **Effective price** — актуальная цена Эксперта в credits/мин из G2.
- **Home review presentation** — только `enabled`, visibility, layout, `home_review_card_limit` и fallback для готовой projection G3.3.
- **Figma visual truth** — layout, components, assets и breakpoint behavior; не business rules.

## 5. Scope

### In scope

- multilingual storefront route;
- public and personalized composition;
- topics entry;
- compact Expert cards;
- links to G3.2/G3.3/G3.4;
- credits explanation and active offer projection;
- trust, reviews, FAQ and footer projection;
- draft/preview/publish/schedule/version/rollback;
- desktop/mobile image variants;
- loading/empty/error/degraded states;
- guest/auth return context;
- personalized cache and indexing isolation;
- analytics events;
- SEO integration;
- accessibility and performance acceptance;
- admin readback and audit.

### Out of scope

- catalog filtering/ranking implementation;
- full Expert profile;
- matching algorithm;
- consultation/request state machine;
- price/debit/refund calculation;
- support workflow;
- final marketing campaign;
- final legal copy;
- brand/domain choice;
- post-pilot KPI activation;
- new visual system independent from Figma.

### Dependencies

- G1: dialogue, request, consultation, notification states.
- G2: price, balance, trial, packages, pause and refunds.
- G3.2/G3.3/G3.4: target routes.
- G3.3 Reviews: единственный owner review policy, eligibility, moderation, author modes, aggregate/rating и historical override; G3.1 читает только published home projection.
- G3.6: completeness/blocker input only; G3.7: final display/action eligibility and ordered pools.
- G4: support/policy links.
- G5: events and release gate.
- G6: assignment, availability and profile admission.

## 6. Роли и доступ

### Guest

- read public blocks;
- select topic;
- open catalog/profile/matching;
- initiate question intent;
- cannot send question or access personal blocks before auth.

### Client

- all guest actions;
- read only own balance, request/session/pause/recent consultations;
- continue only own dialogue/session;
- preserve own intent across auth.

### Expert / Agent

- no storefront management permission;
- cannot force a profile into public result outside eligibility/rotation;
- Agent identity is not exposed through payload, markup or analytics.

### Moderator

- no new storefront content/settings permission by G3.1;
- review moderation permission, if assigned later, is separate.

### Super-admin

- manage storefront content/settings;
- preview/publish/schedule/rollback;
- manage only home review presentation: enabled/visibility/layout/`home_review_card_limit`/fallback;
- all state-changing actions require server-side permission and audit.

Unauthorized direct action must return a clear denial and leave draft/current/public versions unchanged.

## 7. Preconditions и triggers

### Preconditions

- requested language is supported or fallback is defined;
- an active published storefront version exists, or safe minimal fallback exists;
- dependent data sources expose an explicit success/empty/error result;
- personal composition runs only with authenticated client identity;
- Expert cards have eligibility result for `home` surface;
- no price/status value is trusted only from browser state.

### Triggers

- GET/initial render of `/{language}/`;
- client login/logout;
- topic selection;
- CTA click;
- dynamic block load/retry;
- profile availability/price/publication change;
- storefront preview/publish/schedule/rollback;
- review moderation change.

## 8. Invariants

1. No fake Expert, review, price, availability or metric.
2. Public profile and actual Agent remain separate.
3. A personal block is never emitted into another client's response or public cache.
4. G3.1 never creates request/session/debit by merely rendering or opening a card.
5. Paid start always revalidates through G1/G2/G6.
6. Storefront does not own a duplicate Expert list, price, role, taxonomy, consultation or policy setting.
7. Draft changes never mutate current public version.
8. Publish/rollback/retry is idempotent per operation identity/version.
9. Disabled/unset data uses explicit hide/fallback behavior; `0`, `unset`, `empty` and `error` are distinct.
10. Figma visual structure cannot override current owner product rules.
11. Analytics failure cannot block user action.
12. G3.1 never decides review eligibility/moderation and never recalculates rating/aggregate supplied by G3.3.
13. Blocked/unpublished Expert cannot reappear because of cache, pin or stale preview.
14. Translation fallback never exposes raw keys.
15. Client question text and personal data never enter analytics.

## 9. Состояния и переходы

### Storefront publication

| State | Trigger | Guard | Result |
|---|---|---|---|
| Draft | edit | authorized super-admin | saved editable version, public unchanged |
| Previewable | successful validation | required fields valid | preview available by context/breakpoint |
| Scheduled | schedule | future time and timezone valid | current public unchanged until activation |
| Published | publish/activation | validation passes | one active immutable version |
| Superseded | newer publish | previous current exists | remains in history |
| Rolled-forward | rollback action | historical version valid | new published version based on history |
| Rejected | invalid publish | validation fails | no public change, errors returned |

Forbidden:

- direct Draft → public without validation;
- deleting audit/history;
- two current versions for same scope/language at the same effective time;
- rollback by rewriting/removing historical records.

### Dynamic block

| State | Meaning | UI |
|---|---|---|
| Loading | response pending | skeleton |
| Ready | validated data | actual block |
| Empty | successful zero result | block-specific hide/empty action |
| Degraded | optional dependency failed | safe fallback or block hidden |
| Error-retryable | retry may help | safe error + Retry |
| Forbidden | personal access denied | no data disclosure, auth/denial route |

### Client priority state

Precedence:

`active consultation > balance pause/current consultation state > pending request > recent dialogue > ordinary CTA`.

The storefront only projects the canonical G1/G2 state. It does not perform its own transition.

## 10. Функциональные сценарии

### S1. Guest storefront

1. Resolve language and published public version.
2. Render public blocks.
3. Resolve eligible ordered Expert cards for `home`.
4. Guest selects topic or Expert.
5. Guest may open G3.2/G3.3/G3.4.
6. On «Задать вопрос», capture non-sensitive intent and route to auth.
7. After auth, restore allowed intent and revalidate profile/topic.

### S2. Authenticated storefront

1. Render same public composition.
2. Resolve client-specific state.
3. Show highest-priority personal action.
4. Balance is visible only to owner.
5. Full-minute projection appears only with selected Expert/effective price.

### S3. Profile status changed

1. Card loaded as available.
2. Profile becomes busy/offline/blocked.
3. CTA revalidates.
4. Busy/offline gives allowed alternative; blocked denies route.
5. No request/session/debit is created from stale state.

### S4. Content publishing

1. Super-admin edits Draft.
2. Validation distinguishes missing required field, empty optional block and disabled block.
3. Preview renders guest/auth contexts and supported breakpoints.
4. Publish creates one current version and audit.
5. Retry returns the same operation result.

### S5. Review projection

1. Request the published home projection from G3.3.
2. Render only fields and aggregate returned by that owner; do not re-evaluate eligibility, moderation or rating.
3. Apply only G3.1 presentation fields: enabled/visibility/layout/`home_review_card_limit`/fallback.
4. Empty projection hides the block without a layout gap.

### S6. Partial dependency failure

If reviews/offers/personal state/analytics fails:

- essential navigation and Expert discovery remain usable where safe;
- affected block hides or shows fallback;
- fake/stale replacement is forbidden;
- diagnostic result is available to staff without secret/personal payload.

## 11. Контракт данных

Exact storage is implementation-defined. Observable concepts:

### Storefront version

- version identity;
- status;
- language/source translation keys;
- effective/scheduled time and timezone;
- created/updated/published by and at;
- reason;
- parent/history relation;
- content block order/config;
- asset references;
- validation result.

Immutable after publish except by a new version.

### Block configuration

- stable block code;
- enabled;
- order;
- heading/body/CTA translation keys;
- audience: public/guest/authenticated;
- limit;
- desktop/mobile asset;
- empty/error behavior;
- source owner reference;
- active period.

### Topic projection

- taxonomy ID;
- one-word label key;
- full category key;
- slug;
- icon;
- order;
- active state.

Source of truth is the shared Expert taxonomy, not storefront content.

### Expert card projection

- public profile ID/slug;
- photo/public name;
- availability;
- headline/description;
- primary method and specializations;
- experience;
- published review aggregate;
- consultation count source/verification class;
- effective credits/min;
- client-specific trial/bonus when authenticated;
- CTA state;
- eligibility/rotation decision version.

Actual Agent ID must not enter public projection.

### Personal state projection

- client identity;
- balance summary;
- active/pending consultation/request reference;
- public status/timer projection;
- recent consultation links.

Private; never shared-cacheable or indexable.

### Review projection

- G3.3 projection/version identity;
- already-safe public author label/avatar projection;
- Expert public profile reference;
- already-safe current text and rating display;
- published aggregate snapshot/version;
- presentation eligibility supplied by G3.3;
- no private author, consultation, moderation, override or audit fields in the storefront payload.

### Analytics event

- canonical event name;
- page/surface/language;
- anonymous/session attribution allowed by policy;
- Expert/topic ID where allowed;
- outcome/error category;
- correlation and deduplication identity;
- timestamp.

No message/question text, contact data, payment identifier or internal Agent identity.

## 12. Поверхности

### Client public surface

- `/{language}/`;
- responsive Figma-based blocks;
- topic and Expert cards;
- CTA and safe fallbacks.

### Client personal projection

- same route after auth;
- balance, request/session/pause/recent consultation cards;
- strict identity isolation.

### Admin operational content

Recommended product placement:

- `Содержимое → Витрина Nebula`;
- block list, draft, preview, publish, schedule, versions and assets.

### Admin settings

- `Настройки → Настройки витрины`;
- limits, toggles, audiences and fallbacks;
- review fields are limited to enabled/visibility/layout/`home_review_card_limit`/fallback.
- initial independent numeric settings: `home_topic_limit_desktop=6`, `home_topic_limit_mobile=4`, `home_expert_card_limit=6`, `expert_card_specialization_limit=3`, `home_faq_limit=6`, `home_recent_consultation_limit=3`, `home_review_card_limit=3`;
- every numeric setting has unit, range validation, preview, version/audit and explicit `unset` versus `0`; publishing a new value must not create a second manually curated Expert pool.

### Review operations

- G3.3 `Содержимое → Отзывы` moderation queue and `Настройки → Отзывы` are linked read-only owners;
- no review creation, moderation, eligibility, aggregate/rating or historical-override control exists in G3.1.

### Read-only linked owners

- prices/settings;
- translations;
- SEO;
- taxonomy;
- eligibility/rotation;
- consultation/support/policy.

## 13. Ошибки и negative behavior

| Condition | Required result | Forbidden side effect |
|---|---|---|
| Unsupported language | configured fallback or 404 policy | raw translation key |
| Missing active version | safe minimal fallback/admin incident | draft exposure |
| Block validation fail | field errors, publish rejected | current mutation |
| Duplicate publish | original result | second current version |
| Concurrent publish | deterministic winner/conflict | mixed version |
| Unauthorized edit | deny + security audit | data change |
| Expert becomes blocked | remove/deny action | stale paid start |
| Price changes | re-read current on next action | silent old-price start |
| Review source failure | hide/degraded block | fabricated review |
| Personal source failure | safe personal fallback | another user's data |
| Shared-cache collision | detect/prevent, user-safe reload | private disclosure |
| Analytics failure | continue flow | blocked CTA |
| Asset failure | accessible fallback | broken layout/hidden CTA |
| Missing translation | fallback language | raw key |
| Conflicting schedule | reject/resolve explicitly | two active versions |
| Repeated CTA | one intent/business action | duplicate request/session |

## 14. Acceptance matrix

| ID | Given | When | Then | Evidence |
|---|---|---|---|---|
| A01 | guest, RU | open storefront | public blocks and real cards render; no personal data | browser + DOM/network |
| A02 | guest, EN | open storefront | same structure with EN keys and valid canonical/hreflang | browser + HTML |
| A03 | guest entered question | complete auth | Expert/topic/question restored if still valid | browser + state readback |
| A04 | authenticated client with active session | open storefront | top action returns to same session | browser + session ID |
| A05 | client in balance pause | open storefront | canonical timer/replenish action shown | browser + G1/G2 readback |
| A06 | no reviews | render | review block absent without layout gap | DOM + screenshot |
| A07 | G3.3 review projection changes | render | latest published projection/version displayed; G3.1 performs no aggregate recalculation | UI + owner projection readback |
| A08 | Expert becomes busy | click stale CTA | busy alternative, no paid start/debit | browser + session/ledger absence |
| A09 | Expert blocked | refresh/click | card removed/denied | browser + eligibility readback |
| A10 | review dependency fails | render | other discovery blocks remain usable | fault injection + browser |
| A11 | analytics fails | click CTA | navigation succeeds | browser + failed analytics probe |
| A12 | draft edited | public reload | old published content remains | admin/public pair |
| A13 | publish valid version | public reload | exact version active once | admin audit + public DOM |
| A14 | duplicate publish | retry same operation | no second version/event | persisted readback |
| A15 | concurrent publish | two admins/actions | explicit conflict/deterministic result | audit/version readback |
| A16 | unauthorized direct publish | submit | denied; content unchanged | response + audit |
| A17 | shared-cache test with two clients | alternate requests | no cross-client balance/session data | two-user proof + headers |
| A18 | keyboard-only | traverse page | all controls reachable, focus visible | accessibility evidence |
| A19 | 320/576/768/992/1200 | render | no horizontal overflow, Figma variants respected | screenshots + layout metrics |
| A20 | production-like mobile sample | measure | LCP/CLS/INP targets satisfied | performance report |
| A21 | bot/public fetch | inspect | public content indexable, personal content absent | raw HTML/SEO proof |
| A22 | duplicate CTA | double-click/retry | one preserved intent/action | request/session readback |
| A23 | missing translation | render | approved fallback, no raw key | browser + translation readback |
| A24 | stale offer/price disabled | render | old value absent | config/public readback |

## 15. Programmer handoff

### Mandatory integration outcomes

- one canonical storefront composition result;
- shared taxonomy, Expert, price, status and review projections;
- strict public/personal response boundary;
- versioned admin publishing and settings;
- idempotent state-changing operations;
- guest-auth intent preservation;
- role-safe analytics;
- fresh revalidation before downstream business actions;
- Figma-linked responsive implementation and explicit missing-state design.

### Current source navigation

Verify against Igor's mapped repository/build:

- `application/controllers/SiteController.php`;
- current site/index/home view and theme assets;
- `application/controllers/DashboardController.php`;
- `content/themes/youdate/views/dashboard/index.php`;
- `content/themes/youdate/views/dashboard/_item_new.php`;
- `application/controllers/ProfileController.php`;
- current auth/signup return-context handling;
- `application/modules/admin/controllers/SettingsController.php`;
- `application/modules/admin/views/settings/_layout.php`;
- existing Info Blocks admin surface;
- existing language/translation and SEO admin surfaces;
- existing price and profile-field owners.

Visual/reference navigation:

- `H:\Nebula\GPT\_unzipped\home.html`;
- `H:\Nebula\GPT\_unzipped\img\breakpoints\home-1200-reference.png`;
- corresponding 992/768/576/320 references;
- `H:\Nebula\GPT\figma-manifest\oracle-workspace-status.json`.

Important: workspace status currently contains conflicting Home signals: inherited baseline `ready`, while page delivery lacks source lineage/fresh gates. Do not claim visual acceptance until exact current Figma nodes and post-change proof are published.

### Review return

Codex/Igor must return:

- mapped files/routes/components;
- Figma node map;
- decision on legacy migration;
- source-owner map;
- test map;
- build marker;
- proof packet and residuals.

## 16. Definition of Done

- PM and Codex pair reviewed together.
- Exact Figma nodes/breakpoints are linked.
- Implementation is traceable to one build/commit.
- Public/personal data boundaries pass server-side and two-user tests.
- Admin draft/preview/publish/schedule/rollback passes.
- Positive and negative matrix passes.
- Persisted versions, settings and audit are readable.
- Expert status/price/review changes propagate without stale paid action.
- RU/EN, SEO, analytics, accessibility and performance proof exists.
- Test data and temporary schedules are cleaned up or explicitly retained.
- PM issues a runtime verdict; static HTML or local visual parity alone is insufficient.

## 17. Proof boundary

These documents prove only the desired contract and specification completeness.

They do not prove:

- current live Confideline behavior;
- deployed routes;
- actual data isolation;
- Figma parity after implementation;
- Core Web Vitals;
- SEO index behavior;
- analytics delivery;
- end-to-end consultation start.

Each requires mapped build and runtime evidence.

## 18. Knowledge basis

### Exact sources

- `etalon-tz-g3-1-storefront.md`;
- `product-architecture-g1-g6-ownership-map.md`;
- `tz-g3-catalog-profile-rotation.md`;
- `qa-ba-autonomous-tester/reports/admin-functional-map-live-current.md`;
- `reports/profile-field-all-i18n-20260723/live-readback-after.json`;
- `H:\Nebula\GPT\_unzipped\home.html`;
- Home breakpoint references;
- `H:\Nebula\GPT\figma-manifest\oracle-workspace-status.json`;
- current owner decisions in the G3.1 review.

### Claim classes

- Owner decisions: routes, credits, role names, auth gate, taxonomy direction, reviews, admin ownership.
- Current facts: legacy Yii2/admin/profile-field surfaces and local Figma/HTML sources exist.
- Ownership decision converted into requirement: G3.1 owns home presentation only; all review policy and aggregate logic remains in G3.3.
- Deferred: brand/domain, final legal copy, marketing campaign, public traffic, post-pilot KPI.

### Excluded reference mechanics

- competitor USD minute price;
- subscription-first mechanics;
- fixed-duration booking;
- automatic paid start;
- unverified `24/7`, accuracy or guarantee;
- static fake profiles/reviews;
- competitor legal/safety wording.

## 19. Самооценка по Q1–Q12

| Criterion | Score | Basis |
|---|---:|---|
| Q1 | 5/5 | measurable storefront result |
| Q2 | 8/8 | in/out/dependencies explicit |
| Q3 | 10/10 | roles, visibility and server-side access |
| Q4 | 7/7 | preconditions/triggers defined |
| Q5 | 12/12 | publication/block/personal invariants and transitions |
| Q6 | 12/12 | complete primary and alternative flows |
| Q7 | 12/12 | stale, duplicate, concurrent, cache, degraded cases |
| Q8 | 8/8 | versions, projections, audit and readback |
| Q9 | 6/6 | public, personal, admin and review surfaces |
| Q10 | 12/12 | 24 observable acceptance cases |
| Q11 | 5/5 | paired PM and Codex files |
| Q12 | 3/3 | DoD and proof boundary explicit |

`spec_completeness`: 100%.  
`hard_gates`: pass.  
`owner_policy_closure`: closed_with_deferred_release_gates.  
`implementation_status`: code_present_unmapped.  
`runtime_acceptance`: not_run.  
`blocking specification gaps`: none.  
`deferred enablement/release gates`: brand/domain, final legal wording, marketing/public traffic, post-pilot KPI.  
`implementation/runtime gaps`: full mapped implementation and all runtime proof.  
`verdict`: candidate_spec_handoff_ready_pending_independent_review.
