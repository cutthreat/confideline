# G3.3 — технический контекст для Codex Игоря

Этот файл передаётся агенту Codex вместе с `etalon-tz-g3-3-expert-profile.md`. Он описывает обязательные integration outcomes, state/data boundaries и verification. Архитектуру и concrete schema выбирает Игорь.

## 1. Паспорт задачи

- Task ID: G3.3.
- Название: Публичный профиль Эксперта.
- Фаза: client pilot / expert discovery.
- Приоритет: P0.
- `spec_completeness`: 100%.
- `owner_policy_closure`: closed; final legal/brand wording deferred.
- `implementation_status`: code_present_unmapped.
- `runtime_acceptance`: not_run.
- Product owner: Product Owner / Project Manager Nebula.
- Роли: guest, client, Expert public identity, Agent, moderator, super-admin.

Приоритет источников:

1. `etalon-tz-g3-3-expert-profile.md`.
2. Canonical G1–G6 contracts and current owner decisions.
3. Exact current Figma Expert Page/card nodes for visual truth.
4. Igor's mapped build and runtime.
5. This technical context.
6. Static HTML/competitor/reference content only as non-authoritative evidence.

## 2. Краткий контекст

Existing Yii2 profile was designed for a user/dating entity. Target Nebula needs a stable public Expert persona that can be operated by an internally assigned Agent, while preserving reviews, public identity and historical consultation links across reassignment.

The current local `expert-page-new.html` is a visual concept but contains incompatible fixed-duration booking. Live profile fields ids 17–21 provide useful source values, but taxonomy, public copy, review authenticity, rating and system consultation count require explicit contracts.

## 3. Результат

A mapped build exposes one canonical public Expert profile whose compact projections match G3.1/G3.2, whose price/status/reviews/assignment are safely sourced, whose free-question/auth flow cannot auto-start payment, and whose public identity/history survive Agent reassignment without leaking internal data.

## 4. Термины

- **Expert profile** — stable public persona/entity.
- **Agent** — internal human operator currently assigned to one or more profiles.
- **Public profile version** — approved published snapshot of public content.
- **Compact card projection** — subset consumed by storefront/catalog.
- **Topic / Method / Style** — separate taxonomy dimensions.
- **Declared consultation count** — legacy manual bucket id=19.
- **System consultation count** — calculated from qualifying completed sessions.
- **Review aggregate** — rating/count from eligible published reviews only.
- **Historical review override** — audited super-admin migration path without completed-session linkage.
- **Availability projection** — public state from assignment/profile/Agent/session facts.

## 5. Scope

### In scope

- public profile route and projection;
- card/profile source consistency;
- public profile fields and versions;
- taxonomy/language/region/experience;
- price/trial/balance projections;
- availability and CTA;
- guest-auth question intent;
- review form eligibility, moderation, versions and aggregate;
- safe historical override;
- reassignment behavior;
- profile publication/moderation;
- admin readback/audit;
- translations, SEO, analytics;
- responsive/accessibility/performance;
- loading/empty/error/degraded states.

### Out of scope

- catalog query/ranking;
- matching;
- session/request lifecycle implementation;
- debit/refund;
- Agent workspace;
- review policy legal copy;
- training/admission;
- final brand/domain;
- independent redesign.

### Dependencies

- G1 dialogue/request/session and actor snapshots.
- G2 price/trial/balance.
- G3.2 catalog/card consumer.
- G3.6 taxonomy/completeness owner.
- G3.7 final display/action eligibility and ranking owner.
- G6 assignment/admission/availability/ACL.
- G4 policy/support.
- G5 events.

Stable surface registry used by all G3 consumers is complete and explicit: `home`, `dashboard_catalog`, `country`, `city`, `category`, `matching_result`, `thematic_block`, `expert_profile`. G3.3 owns canonical content for `expert_profile`; other surfaces consume projections without hidden local variants.

## 6. Роли и доступ

### Guest

- read published public profile and reviews;
- cannot read personal price entitlement/balance/dialogue;
- may create question intent but not send before auth.

### Client

- read public profile;
- read only own entitlement/balance/dialogue state;
- send free question to this profile;
- create review only when eligibility rule passes;
- cannot read Agent/internal audit/rejection reasons.

### Expert

- public identity only in client UI;
- any self-edit permissions are limited to assigned/owned allowed fields and moderation flow.

### Agent

- act only for active assigned profiles;
- no foreign-profile edit/dialogue/start access;
- cannot alter reviews/rating or public historical attribution;
- internal identity never appears in public response/SEO/analytics.

### Moderator

- review public content/reviews only if explicit permission exists;
- cannot use super-admin historical override unless separately authorized (MVP: no).

### Super-admin

- manage all profile public fields/publication;
- inspect active/history assignment;
- configure review policy and historical override;
- moderation decisions and manual overrides require reason/audit.

All restrictions are server-side; hidden controls alone are not sufficient.

## 7. Preconditions и triggers

### Preconditions

- stable public profile identity/slug;
- published version for public response;
- assignment and availability source returns explicit state;
- effective price resolves or fails closed;
- taxonomy IDs map to active/public values;
- review aggregate has version/freshness;
- personal projections require authenticated client identity.

### Triggers

- open/reload profile;
- enter/click question;
- auth return;
- continue dialogue/request;
- submit/edit review;
- moderation decision;
- public field edit/moderation/publish;
- Agent reassignment;
- price/availability/eligibility change;
- profile block/archive.

## 8. Invariants

1. Public profile identity is not Agent identity.
2. Reassignment never rewrites historical Agent/session attribution.
3. Reviews/rating belong to Expert profile, not current Agent.
4. Public content changes only through valid publication/version flow.
5. G3.1/G3.2 cards read the same canonical public source.
6. Effective price and availability are revalidated before request/start.
7. Profile render/question click never auto-starts paid mode.
8. One client/profile pair has one permanent free dialogue.
9. Duplicate command cannot create duplicate message/request/review/notify.
10. Rating uses only published completed-consultation-linked reviews.
11. Historical override cannot globally weaken ordinary-user eligibility.
12. No physical deletion of review/publication/assignment/audit history.
13. Blocked/unpublished/ineligible profile cannot be started through direct URL.
14. Missing required public content blocks publication; missing optional content hides section.
15. Agent/internal identifiers never enter public markup, structured data or public analytics.
16. `unset`, `0`, `no reviews`, `insufficient sample`, `offline` and `blocked` are distinct.

## 9. Состояния и переходы

### Profile content lifecycle

| State | Trigger | Guard | Result |
|---|---|---|---|
| Draft | create/edit | authorized actor | private editable version |
| Under moderation | submit | required fields valid | current public unchanged |
| Published | approve/publish | moderation/eligibility valid | immutable public version active |
| Temporarily unavailable | operational state | profile still preserved | public safe unavailable behavior |
| Blocked | admin/safety decision | reason/audit required | excluded/start denied |
| Archived | lifecycle action | no new public use | history retained |
| Rejected | moderation reject | reason required | draft/current public handled explicitly |

Forbidden:

- Draft → public without guards;
- blocked → available from Agent online toggle alone;
- physical removal of historical version;
- changing public canonical identity on reassignment.

### Review lifecycle

| State | Trigger | Result |
|---|---|---|
| Draft | user starts form | private |
| Submitted | valid submit | immutable submitted version |
| Under review | moderation queued | not public |
| Published | approve | public; aggregate if eligible |
| Rejected | reject with reason | not public |
| Hidden | later moderation/safety action | removed from public, history kept |

Edit of published review creates a new version; configured re-moderation determines whether old public text remains until approval or review is temporarily hidden.

### Public availability

Resolution must combine:

- profile publication/block;
- active assignment;
- Agent shift/connectivity/paid lock;
- profile manual availability;
- eligibility.

Public states: available, busy, offline, unavailable/absent.

## 10. Функциональные сценарии

### S1. Guest reads profile

1. Resolve stable profile and public version.
2. Resolve public taxonomy, experience, reviews, price and availability.
3. Render no personal data.
4. Guest initiates question; allowed intent is preserved.
5. After auth, revalidate profile and restore context.

### S2. Client free question

1. Resolve/create the single permanent dialogue for client+profile.
2. Validate profile/assignment/chat permissions.
3. Submit message idempotently.
4. No paid session/debit starts.

### S3. Review after consultation

1. Client opens review action tied to completed consultation/profile.
2. Validate one-current-review rule.
3. Capture rating/text/author mode.
4. Submit to moderation.
5. On publish, aggregate recalculates once.

### S4. Historical review

1. Super-admin enables scoped override.
2. Uses approved `login-as-user` flow and same client form.
3. Selects/retains real user and Expert.
4. Provides reason and source/consent.
5. Submitted review is stored with `verified_consultation=false`.
6. Review is excluded from aggregate: он не влияет на rating и не участвует в количестве подтверждённых отзывов.
7. Audit stores impersonating actor and public author separately.

### S5. Reassignment

1. Active Agent changes.
2. Public profile ID/URL/content/reviews stay unchanged.
3. New actions resolve new assignment.
4. Old consultation history retains actual Agent snapshot.
5. No active assignment means no new paid start.

### S6. Public content update

1. Edit creates Draft.
2. Risk/public fields go to moderation.
3. Current published version remains.
4. Approved version becomes current atomically.
5. Retry does not create duplicate version/event.

### S7. Dependency degradation

Reviews/price/availability/personal entitlement may fail independently:

- price missing blocks paid promise;
- availability missing uses safe offline/unavailable;
- reviews missing hides/degrades review block;
- personal data failure never falls back to another client;
- core public profile remains only if required source truth is intact.

## 11. Контракт данных

### Expert public identity

- stable profile ID;
- public slug/canonical URL;
- public name;
- lifecycle/publication status;
- created/history references.

Stable across Agent reassignment.

### Public profile version

- version identity;
- headline/card description/full bio translation content;
- photo/media references;
- topic/method/style/language/region assignments or version references;
- experience;
- public claims;
- author/moderator/published timestamps;
- reason and previous version;
- moderation result.

Published version is immutable.

### Assignment projection

- profile;
- active Agent reference;
- status/effective period;
- assignment reason/actor;
- history.

Public response uses only derived availability, never Agent reference.

### Price/entitlement projection

- effective credits/min and source version;
- current client trial/bonus entitlement when authenticated;
- balance/full-minute projection when allowed;
- freshness.

Not a session snapshot; downstream G1/G2 creates immutable session values.

### Review

G3.3 Reviews is the sole owner of review policy, eligibility, moderation, author modes, aggregate/rating and historical override. G3.1 receives only a published home projection and owns only enabled/visibility/layout/`home_review_card_limit`/fallback.

- review ID;
- real author user ID;
- Expert profile ID;
- consultation ID nullable only under historical override;
- `verified_consultation`; historical override always writes `false`;
- rating;
- text versions;
- author display mode;
- moderation state/reason;
- affects-rating;
- submitted/published/hidden times;
- historical override actor/reason/source/consent;
- audit.

Review settings expose `profile_review_card_limit`, not a combined home/profile limit. `home_review_card_limit` is edited only in G3.1 storefront settings and is linked here read-only.

### Review aggregate

- profile ID;
- eligible published count;
- rating calculation/version/freshness;
- updated time.

Must reconcile with eligible review rows; retry cannot double-count.

### Experience/count

- experience from canonical id=20 mapping;
- declared historical consultation range from id=19 with verification class;
- system completed consultation count from qualifying G1 sessions;
- public display rule/source.

These are separate fields.

### Question return context

- client/session-safe intent;
- profile/topic/question draft reference;
- expiry/consumed identity;
- no public/shared cache.

## 12. Поверхности

### Public/client

- stable public profile route;
- compact card projections on G3.1/G3.2;
- review form/list;
- auth and dialogue links;
- safe unavailable route.

### Agent/Expert

- existing assigned-profile edit/workspace surfaces, only if permissions/assignment allow;
- no exposure of foreign profiles.

### Super-admin

- current Expert/profile edit surface;
- taxonomy;
- profile moderation/publication/history;
- current and past assignment readback;
- review queue;
- review settings;
- price owner link;
- completeness/eligibility summary;
- audit.

### Notifications/readback

- review submitted/decision notifications according to notification owner;
- availability notification according to G1/G5;
- admin readback of public version, aggregate and assignment.

## 13. Ошибки и negative behavior

| Condition | Required result | Forbidden |
|---|---|---|
| profile not found/unpublished | safe 404/unavailable policy | private reason |
| blocked after cache | deny action + invalidate | paid start |
| no active assignment | offline/unavailable | stale Agent use |
| price missing/invalid | no paid promise | zero/fake price |
| duplicate question | original result | second message/request |
| duplicate review submit | original/current review | second review |
| concurrent review edit | explicit version conflict | silent overwrite |
| review publish retry | one aggregate change | double count |
| unauthorized profile edit | deny + audit | content change |
| Agent edits foreign profile | deny server-side | data disclosure/change |
| reassignment race | one active assignment truth | mixed actor |
| historical override disabled | deny new override | ordinary rule change |
| override without reason/source | validation fail | publish |
| translation missing required | publication fail/fallback rule | raw key |
| review service fails | profile works without fake aggregate | fabricated rating |
| analytics fails | user flow continues | blocked CTA |
| partial public save | current version unchanged | mixed fields |

## 14. Acceptance matrix

| ID | Given | When | Then | Evidence |
|---|---|---|---|---|
| A01 | published profile guest | open RU/EN | public fields, no personal/Agent data | browser + raw HTML |
| A02 | same profile in Home/catalog/profile | compare | identical name/status/price/source fields | API/DOM comparison |
| A03 | client with entitlement | open | own trial/balance projection only | two-user proof |
| A04 | guest question draft | authenticate | profile/topic/question restored | browser + context readback |
| A05 | client first question | send | one permanent dialogue/message, no session/debit | chat/session/ledger readback |
| A06 | duplicate question command | retry | original result, no duplicate | message/audit |
| A07 | available → busy | click stale action | busy alternative, no paid start | state/session proof |
| A08 | profile blocked | direct URL/action | safe unavailable/deny | browser + eligibility |
| A09 | no active assignment | open/action | no new paid start | assignment/session proof |
| A10 | Agent reassigned | reopen | same public URL/reviews; new action uses new Agent | public/admin/audit |
| A11 | old consultation after reassignment | inspect | original actual Agent preserved | session history |
| A12 | completed consultation client | submit review | one submitted review in moderation | client/admin proof |
| A13 | no completed consultation | ordinary submit | denied without review | response/readback |
| A14 | publish eligible review | approve | appears once, aggregate updates once | public/admin aggregate |
| A15 | hide published review | moderate | public removed, aggregate consistent, history retained | public/admin |
| A16 | edit published review | submit | new version and configured moderation | versions/public |
| A17 | historical override valid | login-as submit | audited testimonial, aggregate unchanged | review/audit/aggregate |
| A18 | override disabled | attempt | denied, ordinary rules unchanged | response/settings |
| A19 | override missing source/reason | submit | validation fail | form/audit absence |
| A20 | unauthorized Agent foreign profile | direct action | denied; no disclosure/change | response/audit |
| A21 | concurrent profile publish | two actions | deterministic version conflict/result | version/audit |
| A22 | partial dependency failure | reviews/analytics fail | safe profile remains, no fake data | fault/browser |
| A23 | invalid price | open/action | no paid promise/start | UI/session proof |
| A24 | missing required translated field | publish | rejected, current public unchanged | admin/public |
| A25 | supported breakpoints | render | Figma-aligned, no overflow | screenshots/layout |
| A26 | keyboard/screen reader | use | focus, labels, rating/status semantics pass | accessibility evidence |
| A27 | production-like mobile | measure | LCP/CLS/INP targets pass | performance report |
| A28 | search bot | fetch | canonical/hreflang/public-only structured data | raw HTML/SEO |
| A29 | analytics unavailable | CTA | flow succeeds | browser/network |

## 15. Programmer handoff

### Mandatory integration outcomes

- stable Expert public identity independent from Agent;
- versioned/moderated public content;
- one shared projection for cards/profile;
- canonical taxonomy/experience/language/region;
- current price/availability with downstream revalidation;
- permanent free dialogue intent;
- authentic review workflow and aggregate;
- separate historical override;
- reassignment/history preservation;
- server-side ACL and public/private/SEO boundaries.

### Current source navigation

Verify against Igor's mapped repository:

- `application/controllers/ProfileController.php`;
- `content/themes/youdate/views/profile/view.php`;
- `content/themes/youdate/views/profile/_message.php`;
- profile model/query/fields/behaviors;
- `content/themes/youdate/widgets/views/profile/extra-fields.php`;
- current profile photo/media handling;
- `application/controllers/DashboardController.php` and card view;
- `application/modules/admin/controllers/ProfileFieldController.php`;
- `application/modules/admin/controllers/ProfileFieldCategoryController.php`;
- admin profile field views;
- current partner/profile assignment surfaces;
- current report/review/rating code, if any;
- language/translation and SEO sources;
- login-as-user route and audit behavior.

Current readback:

- `reports/profile-field-all-i18n-20260723/live-readback-after.json`;
- `qa-ba-autonomous-tester/reports/admin-functional-map-live-current.md`;
- ids 17–21 exact values and flags.

Visual/reference:

- `H:\Nebula\GPT\_unzipped\expert-page-new.html`;
- `H:\Nebula\GPT\_unzipped\home.html`;
- `H:\Nebula\GPT\_unzipped\all-psychic-new.html`;
- exact current Figma Expert Page/card nodes.

`expert-page-new.html` is not a delivery authority and its fixed 10/15/30-minute booking contradicts the product model. Use visual structure only.

### Required review return

- route/source/field map;
- Figma node map;
- migration and compatibility plan;
- ACL and assignment resolution;
- review aggregate/retry strategy;
- test plan/build marker;
- evidence packet/residuals.

## 16. Definition of Done

- paired PM/Codex specs accepted;
- current build/commit mapped;
- exact Figma nodes/states linked;
- public identity and Agent separation proven;
- profile/card consistency proven;
- field/taxonomy migration and rollback proven;
- review/historical override/aggregate flows pass;
- reassignment and historical actor readback pass;
- unauthorized/duplicate/concurrent/stale/partial failure tests pass;
- admin persisted versions/settings/audit visible;
- guest/client/Agent/super-admin cross-role evidence exists;
- RU/EN, responsive, SEO, analytics, accessibility and performance pass;
- fixtures/impersonation sessions cleaned up;
- PM runtime verdict recorded.

## 17. Proof boundary

These files prove specification completeness only.

They do not prove:

- live profile route/current deploy;
- actual Agent isolation;
- review authenticity/runtime aggregate;
- current assignment or price;
- Figma parity;
- SEO/index behavior;
- performance/accessibility.

Local HTML, owner claim and field existence are not runtime acceptance.

## 18. Knowledge basis, source navigation и текущие факты

### Sources

- `etalon-tz-g3-3-expert-profile.md`;
- `product-architecture-g1-g6-ownership-map.md`;
- `tz-g3-catalog-profile-rotation.md`;
- `reports/profile-field-all-i18n-20260723/live-readback-after.json`;
- `qa-ba-autonomous-tester/reports/admin-functional-map-live-current.md`;
- G1/G2/G6 owner specs;
- local Expert Page/Home/All Psychics sources and Figma evidence;
- current owner review decisions.

### Claim classes

- Owner decision: public Expert vs internal Agent; credits/min; auth before message; experience id=20; real-user reviews; super-admin permissions.
- Proposed rule adopted for safety: historical override separate from ordinary review rule and excluded from rating.
- Current fact: legacy profile/dashboard/admin fields exist, but target runtime is unverified.
- Visual fact: Expert Page reference exists, but its booking logic is incompatible.

### Excluded mechanics

- fixed-duration booking;
- USD minute display;
- automatic paid start;
- public Agent identity;
- fictional/admin-authored anonymous review;
- historical review affecting rating;
- unverified accuracy/healing/guarantee;
- separate verification badge;
- competitor legal/marketing copy.

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
`owner_policy_closure`: closed_with_deferred_legal_brand_gate.  
`implementation_status`: code_present_unmapped.  
`runtime_acceptance`: not_run.  
`blocking specification gaps`: none.  
`deferred enablement/release gates`: final legal/brand wording and public traffic.  
`implementation/runtime gaps`: mapped implementation, migration, ACL/review/assignment/runtime proof.  
`verdict`: candidate_spec_handoff_ready_pending_independent_review.
