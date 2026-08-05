# G3.2 — технический контекст для Codex Игоря

Этот файл передаётся агенту Codex вместе с `etalon-tz-g3-2-expert-catalog.md`. Он задаёт integration outcomes, data contracts и acceptance, но не диктует конкретную схему БД, endpoint или query engine.

## 1. Паспорт задачи

- Task ID: G3.2.
- Название: Каталог и выдача Экспертов.
- Фаза: client pilot / public directory.
- Приоритет: P0.
- `spec_completeness`: 100%.
- `owner_policy_closure`: closed.
- `implementation_status`: code_present_unmapped.
- `runtime_acceptance`: not_run.
- Product owner: Product Owner / Project Manager Nebula.
- Роли: guest, client, Expert public profile, hidden Agent, super-admin.

Приоритет источников:

1. `etalon-tz-g3-2-expert-catalog.md`.
2. Canonical G1–G6 ownership and owner decisions.
3. Exact All Psychics/country/city Figma nodes for visual behavior.
4. Igor's mapped code/build.
5. This integration context.
6. Competitor and static HTML reference only.

## 2. Краткий контекст

Текущий `/dashboard` происходит из dating discovery и должен стать expert-only directory. Действующие country/city pages уже имеют region selectors и четыре hard-coded topics, а admin profile fields содержат flat Areas/Specialization/Experience/Languages.

Целевой каталог должен объединить:

- one taxonomy;
- general and regional scopes;
- actual profile fields;
- G3.6 completeness/blocker input;
- G3.7 display/action eligibility and ordering;
- G1/G6 availability;
- G2 price;
- stable filter/pagination context;
- public SEO and private personalization boundaries.

## 3. Результат

На одном mapped build guest/client открывает general, country и city surfaces, видит только eligible Expert profiles, применяет deterministic filters/sorts, возвращается из профиля без потери context и не может получить ordinary user, blocked profile, cross-region leakage, duplicate card или stale paid action.

## 4. Термины

- **General catalog** — expert directory without hard geo scope.
- **Regional catalog** — country/city surface with primary regional scope and an explicit, audited general-pool fallback only when the regional eligible result is empty.
- **Topic** — клиентский вопрос.
- **Method** — способ/практика Эксперта.
- **Facet** — filter group/value/count.
- **Filter state** — explicit user-selected criteria.
- **Default order** — G3.7 decision before user sort.
- **User sort** — allowed deterministic reorder inside eligible filtered set.
- **Dataset/decision version** — identity needed for stable pagination/readback.
- **Public card projection** — role-safe subset of G3.3.
- **Return context** — route, filters, sort, page/cursor and scroll anchor.

## 5. Scope

### In scope

- `/{language}/dashboard`;
- country/city directory integration;
- topic/method/style/language/availability/price/experience/rating/region filters;
- user sorting;
- public card projection;
- stable pagination/load more;
- return context;
- guest/auth intent;
- loading/empty/error;
- taxonomy and region admin linkage;
- public/private cache;
- SEO, analytics, accessibility, performance;
- preview/readback.

### Out of scope

- full profile contents;
- matching quiz;
- G3.6 completeness/blocker calculation;
- G3.7 eligibility/ranking calculation;
- rotation calculation;
- consultation/request/debit;
- review moderation workflow;
- content writing for SEO landing;
- final legal/brand;
- post-pilot KPI activation.

### Dependencies

- G1/G6 availability and assignment.
- G2 price/trial.
- G3.3 card/profile contract.
- G3.6 completeness/blocker input.
- G3.7 display/action eligibility, ordering and preview.
- Existing country/city administration.
- Existing translation/SEO.

## 6. Роли и доступ

### Guest

- read public catalog/filter/card/profile links;
- cannot receive client-private defaults/balance;
- auth required for sending question.

### Client

- read same public result;
- may receive suggested preferences, clearly marked and removable;
- can preserve own intent and return context;
- cannot inspect other client data or internal ranking reasons.

### Expert / Agent

- public profile appears only through canonical eligibility;
- cannot edit order/pin/weight through catalog actions;
- Agent identity and workload details remain private.

### Moderator

- no new catalog settings by default.

### Super-admin

- manage taxonomy/profile region assignments via canonical owners;
- manage G3.6 completeness settings and G3.7 eligibility/order settings through their separate canonical owners;
- direct mutations require permission, validation, version and audit.

## 7. Preconditions и triggers

### Preconditions

- surface and language resolved;
- hard regional scope resolved for country/city;
- active taxonomy version exists;
- G3.6 returns versioned completeness/blocker input;
- G3.7 returns the canonical `display_eligible + capabilities[] + reason_codes` decision and order version;
- profile projections have public visibility;
- filter values are validated against active registries.

### Triggers

- open/reload a catalog URL;
- apply/remove/reset filter;
- change sort;
- paginate/load more;
- return from profile/auth;
- profile/taxonomy/region/availability/price change;
- click profile/question/notify action;
- admin preview request.

## 8. Invariants

1. Only Expert profiles; ordinary users are server-side excluded.
2. Eligibility precedes filters and sorting.
3. Regional scope is evaluated first; a general fallback is allowed only after a proven zero regional eligible result, with explicit banner/readback and no claim that fallback profiles belong to the region.
4. General catalog never applies client's geo silently.
5. One profile appears once per result.
6. Filter state is explicit and reproducible.
7. User sort cannot restore ineligible profiles.
8. Pagination uses one coherent dataset/decision context or explicitly refreshes.
9. Profile/Agent identities remain separate.
10. Price/status/trial are current projections and revalidated before downstream actions.
11. `no_data`, `zero results`, `disabled filter`, `dependency error` and `unauthorized` remain distinct.
12. Raw taxonomy/region IDs are not exposed as user text.
13. Query strings cannot bypass access/eligibility.
14. Search/analytics failure cannot broaden result.
15. Duplicate question/notify intent is idempotent.
16. Disabled taxonomy/region value preserves history but cannot create a new active filter.
17. G3.6 never grants display/action eligibility; G3.7 owns the final catalog decision.
18. `paid_start_eligible` is never accepted from catalog cache or a prior list response.

## 9. Состояния и переходы

### Catalog result

| State | Trigger/result | UI |
|---|---|---|
| Initial | route resolved | skeleton |
| Ready | valid non-empty result | cards + facets |
| Empty | successful zero result | explicit criteria + recovery actions |
| Invalid-filter | unknown/disabled/conflicting value | remove/explain invalid value |
| Refresh-required | dataset/cursor stale | controlled refresh with context |
| Degraded | optional facet/count failed | safe limited UI, no broadened result |
| Error | essential result failed | error + Retry |
| Forbidden | private/access condition invalid | deny/auth without disclosure |

### Profile availability projection

| Internal decision | Public state | Catalog action |
|---|---|---|
| eligible + available | Доступен | profile/question |
| eligible + paid busy | Занят | profile/free message |
| eligible + offline | Офлайн | profile/message/notify |
| admin-blocked/unpublished/ineligible | absent | none |

### Filter state transitions

- apply filter → validate value → reset pagination → query;
- remove filter → retain all others → reset pagination → query;
- reset → surface defaults only;
- return from profile/auth → restore valid state;
- disabled value on restore → remove with explanation.

Forbidden:

- retaining stale page/cursor after filter change;
- silently applying saved geo;
- silently merging regional and general sets to avoid empty; the fallback must be a second explicit G3.7 query with `regional_result_count=0`, `fallback_scope=general` and the same non-geographic filters;
- client control over internal pin/priority.

## 10. Функциональные сценарии

### S1. General catalog

1. Resolve language and public/general surface.
2. Resolve eligibility and G3.7 order.
3. Apply explicit filter state.
4. Apply user sort if selected.
5. Return cards, facets, decision version and pagination.

### S2. Country page

1. Resolve active country.
2. Apply country hard scope.
3. Apply topic/other explicit filters.
4. If regional result is non-empty, return only matching region profiles.
5. If regional result is empty, request the general eligible pool with the same non-geographic filters and return it with a regional-empty banner and fallback metadata.
6. City selector navigates to city surface.

### S3. City page

1. Resolve city and parent country.
2. Apply city hard scope from Expert multi-select assignment.
3. If the city result is non-empty, return only matching city profiles.
4. If it is empty, request the general eligible pool with the same non-geographic filters and return it with the regional-empty banner and `regions_without_experts` operational marker.

### S4. Guest question intent

1. Guest selects Expert/topic and enters question.
2. Store allowed return context without leaking it to analytics/shared users.
3. Route to auth.
4. Restore context and revalidate profile/filter after auth.

### S5. Stable pagination

1. First page returns decision/dataset identity.
2. Next page uses compatible identity.
3. Duplicate profile IDs are eliminated by contract, not hidden visually.
4. If identity is stale, controlled refresh starts and informs user when context changes materially.

### S6. State change

When Expert changes availability/eligibility/price:

- next result reflects current state;
- already opened card/CTA revalidates;
- stale cache cannot permit forbidden paid action.

### S7. Admin preview

Super-admin provides surface, language, filters, region and optional client-safe context. Preview returns eligibility/order/card reasons sufficient to compare with public result, without exposing private Agent data to public users.

## 11. Контракт данных

### Taxonomy entry

- stable ID/type;
- RU/EN keys;
- slug;
- parent;
- icon/order;
- active;
- surface flags;
- aliases;
- version/effective dates;
- audit.

### Versioned category-to-specialization mapping

Pages consume an active registry version and never hardcode category membership:

| `category_id` | Public filter RU / EN | RU full label | `specialization_value_ids` |
|---|---|---|---|
| `relationships_family` | Отношения / Relationships | Отношения и семья | `[1,2,3,4,5,6]` |
| `career_money_projects` | Карьера / Career | Карьера, деньги и проекты | `[7,8,9]` |
| `choice_future_changes` | Будущее / Future | Выбор, будущее и перемены | `[10,11,21]` |
| `personal_growth_inner_balance` | Развитие / Growth | Личностный рост и внутреннее равновесие | `[14,15,16,17,18]` |
| `spirituality_energy_practices` | Духовность / Spirituality | Духовность, карма и родовые темы | `[12,19,20]` |

Canonical RU/EN specialization labels, geo-filter behavior and migration readback are defined in `expert-specialization-taxonomy-v2-2026-07-29.md`.

`expert_specialization_taxonomy_v1_legacy` is the immutable migration baseline of existing profile field `id=18`, values `1..20`, including legacy `13 = Energy Diagnostics`. It is not an active public Nebula taxonomy and did not have an owned category mapping.

The first active Nebula version is `expert_specialization_taxonomy_v2`:

- active specialization mappings use IDs `1..12,14..21`; ID `13` is absent from every active `specialization_value_ids`;
- `id=18:value=13` remains resolvable as deprecated legacy alias/history;
- `id=17:value=16 = Energy Practices` is appended to the method axis;
- migration mapping `id=18:value=13 -> id=17:value=16` is versioned/audited and non-destructive;
- `id=18:value=21 = Relocation and Life Changes / Переезд и жизненные перемены` is append-only;
- no other legacy ID is reindexed, reused or silently assigned a new identity.

Mapping changes publish a new immutable version; old profile/history references remain resolvable.

### Expert directory projection

- public profile ID/slug;
- public fields required by card;
- topic/method/style IDs;
- language IDs;
- region assignments;
- experience;
- review aggregate;
- consultation count and verification class;
- effective price/trial projection;
- availability;
- G3.7 decision: `display_eligible`, `capabilities[]`, `reason_codes`;
- eligibility/order decision version and time;
- public version timestamp.

Actual Agent ID is not part of public projection.

The only allowed capability IDs are `open_profile`, `send_free_message`, `notify_availability`, `create_consultation_request`. No separate capability ID exists for financial start. `paid_start_eligible` is a separate fresh transactional guard, not a capability.

### Region assignment

- Expert profile;
- country/city stable identifiers;
- active/effective status;
- assignment source/actor/time;
- history.

Many regions per Expert are allowed.

### Catalog query context

- surface type;
- language;
- hard scope;
- explicit filter values;
- sort;
- page/cursor;
- dataset/decision version;
- authenticated suggestion flags separated from explicit selection;
- correlation identity.

### Catalog result

- ordered unique profile IDs/cards;
- applied filters;
- facets/counts with freshness;
- next cursor/page;
- empty/degraded/error classification;
- decision/readback identity.

### Return context

- client/session-safe identity;
- target Expert/topic/question reference where allowed;
- route/filter/sort/page/scroll;
- expiry;
- consumed/idempotency state.

## 12. Поверхности

### General

- `/{language}/dashboard`.

If current route is auth-only, implementation must align it with the owner rule allowing guest catalog browsing, or return a product conflict before implementation.

### Regional

- current `/{language}/country/{slug}`;
- current `/{language}/city/{slug}`.

### Profile target

- G3.3 route using stable public slug/ID.

### Admin

- existing `/admin/profile-field/index`;
- existing `/admin/profile-field-category/index`;
- existing country/geoname pages;
- new `/ru/admin/profile-field/expert-taxonomy`, menu `Поля профиля → Таксономия Экспертов`, as the sole versioned category mapping editor;
- G3.6 completeness/blocker settings;
- G3.7 display/action eligibility, ranking/rotation and preview;
- existing roles/translations/SEO/prices.

## 13. Ошибки и negative behavior

| Condition | Required result | Forbidden |
|---|---|---|
| ordinary user matches legacy query | excluded server-side | public card |
| unknown filter ID/slug | remove/explain or valid 404 policy | raw exception |
| disabled taxonomy value in saved URL | safe removal + notice | reactivation |
| country/city inactive | canonical redirect/404 policy | mixed region |
| zero regional result | explicit regional-empty banner + same-filter general eligible fallback + operational marker | silent fallback, local-region claim or regional notification subscription |
| duplicate profile from joins | one result | duplicate cards/count |
| stale cursor/version | controlled refresh | mixed pages |
| concurrent availability change | latest safe state/action | stale paid start |
| search dependency failure | error/degraded explicit | broadened result |
| price unavailable | no paid promise | zero/fake price |
| unauthorized admin mutation | deny + audit | config change |
| duplicate notify/question | original result | duplicate record/event |
| private suggested filter leak | isolate/remove | shared cache disclosure |
| analytics failure | user flow continues | blocked query/action |
| translation missing | fallback key resolution | raw ID/key |

## 14. Acceptance matrix

| ID | Given | When | Then | Evidence |
|---|---|---|---|---|
| A01 | guest general catalog | open | only Experts, no ordinary users | browser + result IDs |
| A02 | authenticated client | open | same public pool plus isolated optional suggestions | two-user proof |
| A03 | explicit topic+method+language | filter | intersection only | request/readback |
| A04 | explicit price+experience | filter | every card satisfies range | result assertions |
| A05 | general catalog with client city saved | open | geo not silently applied | UI/query proof |
| A06 | explicit region in general | apply | region filter visible/removable | browser + query |
| A07 | country page | open | only assigned country profiles | admin assignment/public proof |
| A08 | city multi-select Expert | open each city | profile appears in both | public/admin proof |
| A09 | non-matching city | open | profile absent | result proof |
| A10 | zero regional result | open | general eligible fallback with banner, same non-geographic filters and operational marker | browser + IDs + decision metadata |
| A11 | one profile matches several values | query | one card | IDs/count |
| A12 | default order | open | matches G3.7 preview | public/admin comparison |
| A13 | price sort | apply/paginate | stable ascending eligible result | multi-page proof |
| A14 | rating insufficient | inspect/sort | no misleading rank/claim | UI/data proof |
| A15 | return from profile | back | filters/sort/page/scroll restored | browser |
| A16 | guest auth return | authenticate | Expert/topic/question context restored | browser + intent readback |
| A17 | profile becomes busy | next query/click | busy action, no paid start | state/session proof |
| A18 | profile blocked | cached URL/query | absent/denied | eligibility/public proof |
| A19 | stale cursor | load more | refresh/no mixed dataset | fault/state proof |
| A20 | duplicate load-more/retry | repeat | no duplicate cards/event | result IDs/audit |
| A21 | search outage | query | explicit error/degraded; no broadening | fault injection |
| A22 | unauthorized admin request | mutate taxonomy/scope | denied, unchanged | response + audit |
| A23 | RU/EN | compare | translated labels/slugs policy | browser + admin keys |
| A24 | keyboard/mobile | use filters | operable focus-preserving UI | accessibility proof |
| A25 | supported breakpoints | render | Figma variants/no overflow | screenshots/layout |
| A26 | production-like data | measure | performance targets pass | performance report |
| A27 | public SEO URLs | fetch | canonical/hreflang, no private data | raw HTML |
| A28 | analytics unavailable | filter/open profile | user result unaffected | browser/network |

## 15. Programmer handoff

### Mandatory integration outcomes

- expert-only server-side base query;
- explicit surface and hard-scope contract;
- shared taxonomy source;
- G3.6 completeness/blockers consumed by G3.7;
- one G3.7 decision contract: `display_eligible + capabilities[] + reason_codes`;
- deterministic filter/user-sort/pagination;
- public profile projection;
- stale-state revalidation plus fresh transactional `paid_start_eligible` guard outside catalog cache;
- intent/return-context isolation;
- admin preview parity;
- public/private cache and SEO split.

### Current source navigation

Verify against mapped build:

- `application/controllers/DashboardController.php`;
- `content/themes/youdate/views/dashboard/index.php`;
- `content/themes/youdate/views/dashboard/_item_new.php`;
- `application/controllers/ProfileController.php`;
- profile field models/query helpers;
- `application/modules/admin/controllers/ProfileFieldController.php`;
- `application/modules/admin/controllers/ProfileFieldCategoryController.php`;
- corresponding admin views;
- current country/geoname controllers, routes and public views in deployed source;
- current auth return-context mechanism;
- translation and SEO components.

Current live/readback evidence:

- `reports/profile-field-all-i18n-20260723/live-readback-after.json`;
- `qa-ba-autonomous-tester/reports/admin-functional-map-live-current.md`;
- owner-provided country/city DOM with current four-topic filter.

Visual/reference:

- `H:\Nebula\GPT\_unzipped\all-psychic-new.html`;
- `H:\Nebula\GPT\_unzipped\img\all-psychic-page-1200-shot.png`;
- 992/768/576/320 shots;
- exact Figma nodes in current source manifest.

`all-psychic-new` is a visual/reference candidate with a current production compliance blocker. Do not claim it as accepted runtime/donor authority solely from the HTML.

## 16. Definition of Done

- paired documents accepted;
- exact Figma nodes and mapped build recorded;
- legacy ordinary-user discovery excluded server-side;
- taxonomy/geo migration complete and reversible;
- G3.6 input-only boundary and G3.7 decision/preview parity proven;
- positive/negative matrix passes;
- multi-page stability and concurrency tested;
- persisted taxonomy/regions/settings/audit readback exists;
- guest/client two-user isolation passes;
- RU/EN, SEO, analytics, accessibility and performance pass;
- test fixtures cleaned/retained explicitly;
- PM runtime verdict recorded.

## 17. Proof boundary

The specification does not prove:

- deployed expert-only query;
- actual country/city assignment enforcement;
- pagination stability;
- no private cache leak;
- Figma parity;
- SEO/index state;
- runtime availability/price consistency.

Static task cards and current legacy code are not runtime proof.

## 18. Knowledge basis

### Sources

- `etalon-tz-g3-2-expert-catalog.md`;
- `tz-g3-catalog-profile-rotation.md`;
- `product-architecture-g1-g6-ownership-map.md`;
- `reports/profile-field-all-i18n-20260723/live-readback-after.json`;
- `qa-ba-autonomous-tester/reports/admin-functional-map-live-current.md`;
- current country/city owner evidence;
- `H:\Nebula\GPT\_unzipped\all-psychic-new.html`;
- Oracle workspace status and Figma lineage;
- current owner decisions.

### Claim classes

- Owner decision: expert-only dashboard; ordinary users hidden; general geo secondary; regional geo hard; short topics; auth before message.
- Current fact: ids 17–21 and country/city/admin surfaces exist in live readback.
- Proposed owned rule: normalized topic/method taxonomy and stable filters.
- Reference fact: competitors separate category/method and topic and show availability/card trust signals.

### Excluded mechanics

- dating age/gender/distance discovery;
- competitor USD price;
- fixed-duration booking;
- paid queue;
- automatic paid start;
- KPI rank during pilot;
- competitor unsafe/healing claims.

## 19. Самооценка по Q1–Q12

| Criterion | Score |
|---|---:|
| Q1 | 5/5 |
| Q2 | 8/8 |
| Q3 | 10/10 |
| Q4 | 7/7 |
| Q5 | 12/12 |
| Q6 | 12/12 |
| Q7 | 12/12 |
| Q8 | 8/8 |
| Q9 | 6/6 |
| Q10 | 12/12 |
| Q11 | 5/5 |
| Q12 | 3/3 |

`spec_completeness`: 100%.  
`hard_gates`: pass.  
`owner_policy_closure`: closed.  
`implementation_status`: code_present_unmapped.  
`runtime_acceptance`: not_run.  
`blocking specification gaps`: none.  
`deferred enablement/release gates`: final SEO content/public traffic and post-pilot KPI.  
`implementation/runtime gaps`: mapped query/routes, migration and full evidence.  
`verdict`: candidate_spec_handoff_ready_pending_independent_review.
