# Технический контекст G3.INT: интеграция Oracle / Nebula layout с backend Confideline

## 1. Паспорт задачи

- Task ID: `G3.INT`
- Название: «Интеграция новой верстки Oracle / Nebula с backend Confideline»
- Фаза: `V3 client pilot`
- Приоритет: `P0`
- Парное PM-ТЗ: `etalon-tz-g3-int-layout-backend-integration.md`
- `spec_completeness`: `100%`
- `owner_policy_closure`: `closed`
- `implementation_status`: `code_present_unmapped`
- `runtime_acceptance`: `not_run`
- Владелец продукта: Product Owner / Project Manager Nebula
- Целевые роли: гость, клиент, Эксперт, Агент, модератор, super-admin
- Класс: `MIXED`; layout/backend — development, G3.INT.I18N — `OPS_FIRST`

`code_present_unmapped` означает: Oracle / Nebula layout files и Confideline backend существуют, но их единая production binding не доказана.

## 2. Краткий контекст

Целевой публичный дизайн находится в контуре Oracle / Nebula. Рабочая доменная, admin и runtime база находится в Confideline/YouDate Yii2.

Риск задачи — принять наличие HTML/CSS за интеграцию. G3.INT должна связать presentation с реальными routes, data owners, commands, role checks, translations, SEO и rollout, не создавая параллельный продукт. Это implementation package, а не новая продуктовая задача и не 31-я строка канонического реестра.

G3.5 остается release gate и тестирует готовую сборку. G3.INT производит интегрированную сборку и task-specific proof.

Игорь не владеет translations, policy copy или admin publication. Moderator/super-admin сначала использует существующие admin owners; Codex Игоря получает только evidence-backed technical gaps.

## 3. Результат

Для каждого зарегистрированного G3 surface система:

1. открывает канонический Confideline route;
2. рендерит принятую Oracle / Nebula layout version;
3. получает реальные данные из канонических владельцев;
4. разрешает только server-authorized actions;
5. сохраняет locale, auth intent, SEO и user continuity;
6. имеет observable loading/empty/stale/error/degraded behavior;
7. поддерживает preview, limited rollout и rollback без изменения domain data;
8. предоставляет build/runtime evidence для G3.5.

## 4. Термины

| Термин | Значение |
|---|---|
| Layout source | Figma/source-backed Oracle / Nebula визуальный контракт |
| Static candidate | HTML/CSS, который может показывать интерфейс, но не доказывает backend behavior |
| Surface | Стабильная клиентская область из registry G3.6/G3.7 |
| Binding | Связь route, layout, real data, action, state и owner contract |
| Shared shell | Header, navigation, footer и общие responsive/auth элементы |
| Demo data | Фиктивные profile, price, rating, review, counter или online state |
| Intent | Выбранные Expert/topic/question/return route до auth |
| Rollout mode | `legacy_active`, `nebula_preview`, `nebula_limited`, `nebula_active`, `rollback_active` |
| Build marker | Идентификатор сборки, доказанной в runtime packet |
| Task-specific acceptance | Проверка конкретной surface до сквозного G3.5 |
| Translation key registry | Версионируемый реестр всех системных строк Nebula: key, смысл, surface, owner, RU/EN source copy, placeholders и coverage по включённым локалям |
| Required locale | Локаль, включённая в существующей админ-панели для публичного rollout конкретной Nebula surface |

## 5. Scope и границы

### Входит

- `home`, `dashboard_catalog`, `country`, `city`, `category`, `matching_result`, `thematic_block`, `expert_profile`;
- shared shell;
- login/signup/auth-return states;
- real data binding;
- action/form binding;
- filters, sorting, pagination;
- personalization blocks defined by owner tasks;
- inventory of visible Oracle / Nebula strings, creation of missing translation keys and per-required-locale coverage;
- translations and localized routes;
- SEO metadata and indexing boundary;
- responsive/accessibility behavior;
- caching/stale behavior;
- preview/rollout/rollback;
- surface-level runtime evidence.

### Не входит

- new consultation states;
- money/refund/accrual rules;
- review/taxonomy/eligibility ownership duplication;
- staff workspace redesign;
- source-less visual invention;
- broad backend rewrite unrelated to surface binding;
- G3.5 release verdict;
- public traffic O5 decision;
- deletion of legacy path before post-acceptance disposition.

### Dependencies

- G3.1 storefront contract;
- G3.2 catalog/geo contract;
- G3.3 expert profile/reviews contract;
- G3.4 matching/auth-intent contract;
- G3.6 taxonomy/completeness input;
- G3.7 display/action eligibility and ranking;
- G1/G2 dialog/session/money contracts;
- G4 support/refund entry points;
- G4-approved support/refund/policy/legal copy as source truth for corresponding keys;
- G5.1 analytics events;
- G6 admission/assignment/availability;
- current Oracle / Nebula source lineage and page status;
- current Confideline runtime and route inventory.

## 6. Роли и доступ

### Guest

- may read public eligible data;
- may initiate an auth-required intent;
- cannot execute client-only actions directly;
- must not receive private client/staff data.

### Client

- may read own balance/session/history indicators where owner contract permits;
- may execute only current capabilities and owner flows;
- cannot see Agent, internal IDs, staff notes, hidden reasons or another client data.

### Expert

- is rendered as a public profile according to G3.3/G3.7;
- receives no new admin permission from G3.INT.

### Agent / Moderator

- no special public-layout mutation access;
- operational work remains on owned staff/admin surfaces.

### Super-admin

- sees surface binding registry, source/layout version, rollout mode, build marker, proof/readback and errors;
- changes rollout only through existing theme/permission/audit contour;
- does not edit foreign business settings on the layout page.

All authorization is enforced server-side. Hidden controls are not an authorization mechanism.

## 7. Preconditions и triggers

### Preconditions

- target route is inventoried;
- source layout status is known;
- page-specific PM owner contract is current;
- data/action owners are identified;
- translation and SEO owners are identified;
- rollback target exists;
- test fixtures and authorized preview audience exist;
- source lineage is sufficient for the claimed visual level.

### Triggers

- request to a registered route;
- client filter/pagination/sort action;
- CTA/form action;
- auth success/return;
- availability/price/eligibility refresh;
- rollout mode change;
- cache invalidation;
- rollback command.

If source, owner, route or rollback mapping is missing, public activation fails closed.

## 8. Invariants

1. Static HTML is never runtime proof.
2. One domain action has one canonical owner.
3. No demo data can be used as fallback.
4. `display_eligible` and capabilities come only from G3.7.
5. Price and balance truth come only from G2.1.
6. Paid start requires fresh G1/G2/G6 guards.
7. G3.INT does not persist a second session/chat/refund/review/taxonomy state.
8. Locale and auth intent survive the round trip.
9. Unauthorized direct actions have zero domain side effects.
10. Duplicate/retry does not duplicate request, message, purchase or session.
11. Rollout changes presentation only, not domain data.
12. Rollback preserves current authentication and active business operations.
13. One request uses one coherent shell/layout version.
14. Personal surfaces are not indexed.
15. Cache cannot keep a blocked profile actionable.
16. Source-blocked layout cannot be promoted by a label or feature flag.
17. Route aliases and inheritance are explicit.
18. G3.5 consumes a named build; it does not test an unidentified moving target.

## 9. Состояния и переходы

### Surface rollout state

| Current | Trigger | Guard | Result |
|---|---|---|---|
| `legacy_active` | enable preview | source/route/data/action map exists | `nebula_preview` |
| `nebula_preview` | enable limited | task-specific proof passed | `nebula_limited` |
| `nebula_limited` | enable active | PM approval + no P0 surface blocker | `nebula_active` |
| any Nebula mode | rollback | known rollback target | `rollback_active` |
| `rollback_active` | restore legacy | rollback proof complete | `legacy_active` |
| `rollback_active` | resume Nebula | defect fixed + proof refreshed | prior allowed Nebula mode |

Forbidden:

- `legacy_active -> nebula_active` without preview/task proof;
- activation with missing source status;
- activation with demo/unbound actions;
- deletion of rollback target during pilot;
- mixed layout versions inside one logical render.

### Render state

| State | Meaning | Allowed output |
|---|---|---|
| `loading` | data pending | skeleton only |
| `ready` | current real data | full permitted UI |
| `empty` | valid zero result | honest empty state |
| `unauthorized` | auth required | auth route with saved intent |
| `stale` | input changed | refresh/revalidate; no stale action |
| `error` | operation failed | safe error + idempotent retry |
| `degraded` | dependency partial | only confirmed data/actions |

Render states are presentation states, not a new persisted business state machine.

## 10. Функциональные сценарии

### S1. Public storefront

Guest requests `/{lang}/`. System renders the new shell, real content blocks and eligible Expert slice from G3.7. Missing data becomes loading/empty/error, never demo content.

### S2. Expert-only dashboard/catalog

Authenticated client opens dashboard. System does not expose ordinary users, applies explicit filters, stable pagination and G3.7 order, and returns canonical profile routes.

### S3. Country/city/category

System applies the hard regional/topic scope defined by G3.2 while reading the same taxonomy and eligibility owners. A profile present in multiple regions appears once per result set.

### S4. Expert profile

Profile reads public fields, credits/minute, availability, reviews and capabilities from owners. Internal Agent/KPI/staff information is absent.

### S5. Auth intent restoration

Guest selects Expert, topic and question. After login/signup, system restores the exact allowed intent once. Repeated callback returns the same result.

### S6. Matching

Matching produces 3–5 explainable results when available. It does not create paid session and does not bypass G3.7 or fresh paid-start guard.

### S7. Stale action

Availability/price/eligibility changes between render and action. Server revalidates and returns current state without forbidden side effect.

### S8. Partial dependency failure

One noncritical data source fails. Page shows confirmed information and hides/disables unconfirmed action; monitoring receives the failure. Critical owner failure blocks the dependent action.

### S9. Limited rollout

Only configured preview/limited audience gets the named new build. The same user/request does not alternate layouts mid-flow.

### S10. Rollback

Presentation returns to legacy without reversing user data, balance, dialog or consultation. Audit keeps old/new mode, actor, time, reason and build.

### S11. G1/G2 transition

Profile/catalog CTA opens the canonical free-dialog/request flow. G3.INT carries identifiers and intent but does not create paid state itself.

### S12. G3.5 handoff

After all mandatory surfaces have task-specific PASS, one build marker and proof index are handed to G3.5 for the dual-initiation end-to-end gate.

## 11. Контракт данных

Minimum product fields per binding record:

- `surface_id`;
- `canonical_route`;
- `layout_source_id`;
- `layout_source_status`;
- `layout_version`;
- `data_owner_refs[]`;
- `action_owner_refs[]`;
- `translation_owner`;
- `seo_owner`;
- `rollout_mode`;
- `audience_scope`;
- `build_marker`;
- `last_runtime_proof`;
- `last_visual_proof`;
- `rollback_target`;
- `updated_by`;
- `updated_at`;
- `reason`;
- `status/reason_codes`.

The implementation schema is Igor's decision. The product contract requires:

- explicit version/readback;
- no hidden inheritance;
- immutable audit events for rollout;
- source-of-truth references;
- historical ability to explain what layout/build served a request.

Domain payloads remain owned by G1–G7 contracts and must not be duplicated into the binding registry.

## 12. Surface mapping contract

| Surface | Primary PM owner | Required data/action binding |
|---|---|---|
| `home` | G3.1 + G3.7 | content blocks, eligible Expert slice, personalized return cards |
| `dashboard_catalog` | G3.2 + G3.7 | expert-only query, filters, order, pagination |
| `country` | G3.2 + G3.7 | country hard scope + canonical taxonomy |
| `city` | G3.2 + G3.7 | city hard scope + canonical taxonomy |
| `category` | G3.2/G3.6/G3.7 | versioned taxonomy + eligibility |
| `matching_result` | G3.4 + G3.7 | explainable matches + allowed capabilities |
| `thematic_block` | G3.1/G3.2/G3.7 | scoped eligible cards |
| `expert_profile` | G3.3 + G3.7 | public profile/reviews/price/availability/CTA |

Shared auth/shell components consume the mapping but do not own eligibility.

## 13. Current source navigation

### Oracle / Nebula layout truth

- `H:\Nebula\GPT`
- `H:\Nebula\GPT\_unzipped`
- `H:\Nebula\GPT\figma-manifest\oracle-workspace-status.json`
- `H:\Nebula\GPT\docs\oracle-nebula\layout-production-backlog-2026-07-12.csv`
- `H:\Nebula\GPT\_unzipped\product-breakpoint-matrix.json`
- `H:\Nebula\GPT\_unzipped\site-map.html`

Important current candidates:

- `home.html` — source-verified candidate, not accepted runtime;
- `all-psychic-new.html` — strongest catalog visual candidate, strict ready controls still open;
- `expert-page-new.html` — visual file exists, current source intake/lineage proof is incomplete;
- `auth-login-state-new.html`, `login.html`, `signup-step-1.html`, `signup-step-2.html` — auth candidates with open source/mobile gates;
- `psychic-reading-new.html` — public money-page candidate outside the narrow G3 surface set, useful for shared shell continuity.

Current source/binding crosswalk:

| Surface/path | Exact source evidence | Current binding status |
|---|---|---|
| `home` | C76 `9:9`, `35:2`, `49:194`, `51:239`, `530:3176`; 11 sections × 5 widths | source-backed; `implementation_ready_claim=false` |
| `dashboard_catalog` | ALL PSYCHIC NEW `924:16998`, `924:17233`, `924:17473`, `924:17713`, `924:17948`; authenticated 01-Psychics family also exists | proposal to bind both families to one surface; owner/source decision open |
| `country`, `city` | current Confideline route shapes exist | no exact Oracle/C76 geo packet found; `blocked_source` |
| `category`, `thematic_block` | required stable surface IDs | no accepted standalone delivery binding; `blocked_source` |
| `expert_profile` | Psychic CARD and Profile C76 families exist | public Expert vs user/account source identity unresolved; fixed booking semantics forbidden |
| `matching_result` | C76 families for question, selection, detail, unavailable, offline and no-match exist | visual states are source-backed; client route/backend-result contract open |
| shared auth path | 15 exact login/signup frame IDs plus local login/signup candidates | not a ninth surface; backend success/verification/return-context contract open |

Primary source evidence for implementation intake:

- `H:\Nebula\GPT\figma-manifest\truth-packets\c76-master-map-top-level-frame-index-20260716.json`;
- `H:\Nebula\GPT\figma-manifest\truth-packets\public-home-master-c76-source-packet-2026-07-13.json`;
- `H:\Nebula\GPT\figma-manifest\truth-packets\auth-account-entry-state-handoff-2026-07-28.json`;
- `H:\Nebula\GPT\docs\oracle-nebula\layout-production-backlog-2026-07-12.csv`.

Page status must be re-read at implementation time. This list is navigation, not an instruction to publish every file.

### Confideline runtime/backend navigation

- `H:\GPT-Codex\Confideline\Chat\youdate-2.0.2-yii2\Source\youdate_extracted\application`
- current routes/config/controllers/views/themes under that application;
- current public and admin route inventories under `web/qa-reports`;
- existing translation admin `/ru/admin/language/list`;
- existing theme owners `/ru/admin/theme/settings` and `/ru/admin/theme/index`;
- existing profile-field, review, pricing, chat and notification owners named in G1–G3 docs.

These roots identify investigation areas only. Architecture, component boundaries and implementation method remain Igor's responsibility.

## 14. Internationalization, SEO и route contract

`G3.INT.I18N` is a mandatory P0 workstream inside G3.INT, not a new task code or a parallel translation system.

### Owner split

Moderator/super-admin:

1. inventories every visible string and its surface/locale;
2. searches existing translation keys before creating a gap;
3. prepares approved RU/EN copy and translations for selected rollout locales;
4. edits through the existing `/admin/language` contour;
5. performs cache refresh, admin readback and public readback;
6. records one status: `existing_ok`, `translation_missing`, `key_missing`, `broken_binding`, `runtime_gap`.

Игорь:

- adds or repairs only `key_missing`, `broken_binding`, hardcoded production copy, placeholder/pluralization, runtime readback or safe-import capability;
- does not author or approve translations, policy, financial, support or legal meaning;
- returns the build to moderator for final translation/configuration readback.

Every technical escalation includes route, component, locale, visible string, existing-key search result, expected key/value, save/cache/readback result and reproducible evidence.

- every public route begins with locale;
- current locale survives links, auth and form errors;
- every visible system string is inventoried and uses a stable translation key; production hardcoded UI copy fails the build gate;
- the implementation produces a versioned key registry with `key`, category/scope, surface/component, context, functional owner, RU/EN source copy, placeholders, pluralization, HTML policy and status for every required locale;
- missing keys are created in the existing Yii/Confideline translation contour and remain editable through `/ru/admin/language/list` plus the current translate page; no Oracle-specific translation store or second admin is allowed;
- Russian and English copy are prepared first and remain the canonical source pair for review;
- before a surface can enter `nebula_active` for a locale, every required key for that surface has an approved translation in that enabled locale and has admin/public readback;
- the actual required-locale set is read from explicit `surface × rollout_locale` settings in the G3.INT theme-rollout contour; entries reference existing Language IDs and never duplicate translation values;
- global Language `Active/Beta/Inactive` alone does not admit a Nebula surface to that locale;
- an incomplete locale stays on the proven legacy/fallback surface or remains outside the Nebula rollout; a raw key or silent copy from another language is forbidden;
- dynamic names, prices, counts and dates use typed escaped placeholders; locale-aware plural and formatting rules are tested;
- a key is not repurposed for a materially different meaning; semantic changes create a new key or an explicit versioned migration with usage scan and rollback;
- G1–G4 functional owners approve the meaning of their copy. G3.INT owns key creation/binding/coverage, not product, financial, support or legal wording;
- canonical/hreflang/title/description/index policy have explicit owner/readback;
- dashboard/account/dialog/session pages are noindex;
- route change has redirect/canonical proof;
- query/filter state is canonicalized and does not generate uncontrolled duplicates;
- 404/redirect behavior is tested for legacy links.

Missing translation or metadata is observable and cannot silently fall back to another language in public acceptance.

### Required i18n artifacts

- `g3-int-i18n-key-registry.json` and a human-readable CSV/Markdown view;
- hardcoded-string scan with explicit allowlist for non-user-facing technical constants;
- matrix `surface × required locale × required key` with `missing`, `draft`, `reviewed`, `published`, `readback_pass`;
- admin write/readback proof for representative keys, including cache invalidation;
- public screenshot/readback for RU, EN and every additional locale included in the limited/active rollout;
- placeholder/pluralization fixtures, missing-key negative fixture and rollback evidence;
- list of G4/legal-controlled keys that cannot be published until their owner gate passes.

### Translation import safety contract

The existing import route is reused, but G3.INT acceptance requires a bounded translation-only mode:

1. package schema pins source build, target Language IDs, exact keys, values, placeholders and expected preimage hashes;
2. dry-run is mandatory and returns added/changed/unchanged/rejected/conflicted counts plus the exact value diff;
3. the operation cannot create a Language, change `Language.status`, rename a locale or touch keys outside the package;
4. schema, locale, placeholder, pluralization and allowed-HTML validation completes before the first write;
5. one batch is atomic from the product perspective: any invalid/conflicted item rejects the entire batch;
6. a manual edit after the captured preimage causes an optimistic conflict and requires a new dry-run;
7. rerunning the same accepted package is idempotent and returns `0 changes`;
8. actor, timestamp, source hash, target keys/locales, diff, result and rollback reference are audited;
9. rollback restores only the batch-owned values and is followed by cache refresh plus admin/public readback.

The current import implementation is a reusable starting point, not proof that these guards already exist.

## 15. Security, authorization and privacy

- server-side ACL for every client action;
- CSRF and form-integrity behavior preserved;
- no trust in client price, balance, role, profile ID, capability or session state;
- output encoding and upload/link policies remain owned by security/chat contracts;
- personal/internal identifiers excluded from public payloads;
- no secrets, tokens, cookies or profile internals in logs/proof;
- auth return target is allowlisted;
- cache keys separate locale, role and private/public content;
- error output does not expose stack/config/private data.

## 16. Cache, consistency and concurrency

1. Eligibility/profile/status cache invalidates or revalidates before action.
2. A blocked/unpublished Expert cannot remain actionable from stale HTML.
3. Pagination uses one stable logical view where G3.7 requires it.
4. Parallel filter requests may finish out of order; only the current request updates the visible result.
5. Repeated CTA/form uses owner idempotency contract.
6. Rollout mode is stable for one request and session continuity window.
7. Theme/layout cache invalidation is proven after activation and rollback.
8. Partial cache failure degrades safely and is observable.

## 17. Поверхности и admin ownership

### Client

- new public/account layouts;
- real data/actions;
- all defined render states;
- no internal diagnostic details.

### Agent/Moderator

- no new public editing surface;
- existing operational owners remain unchanged.

### Super-admin

Existing theme/settings contour is extended with:

- surface registry;
- source/layout version;
- rollout mode/audience;
- build marker;
- last runtime/visual proof status;
- rollback target;
- error/readback;
- audit.

No duplicated price, review, taxonomy, ranking, matching, notification or support settings.

### Monitoring

Records:

- route/layout binding miss;
- source-blocked activation attempt;
- demo-data detector signal;
- missing translation/SEO owner, hardcoded visible copy and incomplete required-locale coverage;
- broken CTA/action mapping;
- stale capability rejection;
- asset/render failure;
- rollout inconsistency;
- rollback event.

## 18. Ошибки и negative behavior

| Condition | Required result | Forbidden side effect |
|---|---|---|
| Unknown surface | safe 404/fallback + signal | guessed template |
| Missing source status | activation rejected | public enable |
| Demo value detected | build/gate fail | public rendering |
| Unauthorized direct action | access denied | domain mutation |
| Duplicate submit | original result/rejection | duplicate object/debit |
| Stale profile/price/capability | refresh and clear explanation | stale paid action |
| Missing translation | observable fail/fallback policy | raw key silently accepted |
| Hardcoded visible copy | build/activation fail with file/component location | production publish |
| Locale coverage incomplete | locale stays legacy/outside rollout | partial Nebula activation |
| Placeholder contract mismatch | validation error and safe fallback | malformed or unescaped output |
| Key reused with new meaning | migration required and activation blocked | silent semantic overwrite |
| Broken asset | usable content fallback + signal | blocked primary action without message |
| Query invalid | normalized validation error | broad unscoped data |
| Dependency down | degraded/error state | invented data |
| Rollout write conflict | one version wins/readback | mixed state |
| Rollback target missing | command rejected | partial rollback |
| Cache purge fails | fail closed for activation | serving inconsistent versions |
| SEO owner missing | public activation blocked for indexed page | unowned metadata |
| Auth return invalid | safe default route | open redirect |

## 19. Acceptance matrix

| ID | Given | When | Then | Evidence |
|---|---|---|---|---|
| G3I-A01 | `home`, guest, RU | route opens | new shell + real eligible data + RU keys | screenshot + payload/readback |
| G3I-A02 | `home`, guest, EN | route opens | same contract, EN keys/canonical | screenshot + SEO readback |
| G3I-A03 | client with active consultation | home opens | owner-defined return card, no local session logic | runtime trace |
| G3I-A04 | dashboard client | filters applied | expert-only stable results | query/result proof |
| G3I-A05 | country/city route | page opens | hard geo scope, no ordinary users | result fixture |
| G3I-A06 | category route | category selected | taxonomy v2 and G3.7 eligibility used | version/readback |
| G3I-A07 | expert profile | page opens | real fields/price/status/reviews/capabilities | cross-owner trace |
| G3I-A08 | guest CTA intent | auth succeeds | intent restored once | session-safe trace |
| G3I-A09 | repeated auth callback | callback repeats | same result, no duplicate | idempotency proof |
| G3I-A10 | matching result | flow completes | explainable allowed profiles, no paid start | result/readback |
| G3I-A11 | no eligible profiles | surface opens | honest empty state | screenshot + zero-result proof |
| G3I-A12 | profile blocked after render | CTA called | server rejects/updates, zero side effect | stale-action trace |
| G3I-A13 | price changed | profile/action refresh | current display; G2 owns snapshot | price trace |
| G3I-A14 | unauthorized direct action | request sent | access denied, no mutation | ACL/audit |
| G3I-A15 | duplicate form | repeated | one canonical action | idempotency/audit |
| G3I-A16 | dependency fails | page loads | degraded/error without demo data | fault injection |
| G3I-A17 | translation missing | page renders | observable configured failure | log/readback |
| G3I-A18 | asset missing | page renders | usable fallback and monitoring signal | fault injection |
| G3I-A19 | 320/576/768/992/1200 | each surface renders | no clipping/overflow, accepted hierarchy | current visual proof |
| G3I-A20 | keyboard-only | core journey used | focus/order/forms work | accessibility evidence |
| G3I-A21 | personal route | crawler metadata read | noindex/no private payload | header/HTML proof |
| G3I-A22 | legacy external URL | request sent | canonical/redirect, no 404 loop | route trace |
| G3I-A23 | preview mode | normal guest opens | guest remains legacy | role/audience proof |
| G3I-A24 | preview mode | super-admin/tester opens | exact new build shown | build/readback |
| G3I-A25 | limited mode | audience split | stable one-version experience | rollout evidence |
| G3I-A26 | concurrent rollout edits | two writes | deterministic conflict/readback/audit | concurrency proof |
| G3I-A27 | rollback | active data exists | old presentation, data unchanged | before/after proof |
| G3I-A28 | rollback during consultation | client continues | business session remains intact | runtime trace |
| G3I-A29 | stale cache | blocked Expert cached | no actionable card after guard | cache/stale proof |
| G3I-A30 | production artifact scan | build inspected | no demo profiles/counters/URLs | detector report |
| G3I-A31 | G1/G2 CTA | client continues | canonical dialog/request/session owners invoked | integration trace |
| G3I-A32 | accepted Oracle / Nebula surface | visible strings scanned | every system string maps to registered key; no unallowlisted hardcoded copy | scan + key registry |
| G3I-A33 | additional public locale selected for a surface | rollout requested | 100% required-key coverage and admin/public readback or locale remains legacy/outside rollout | coverage matrix + screenshots |
| G3I-A34 | super-admin edits translation | cache refresh completes | target locale displays the new value; other locales and keys remain unchanged | admin before/after + public readback |
| G3I-A35 | key contains name/count/price/date | fixtures render | typed placeholder, escaping, pluralization and locale formatting remain valid | positive/negative fixture report |
| G3I-A36 | translation package prepared | dry-run requested | exact target-only diff; no Language/status or out-of-package mutation | dry-run report + negative checks |
| G3I-A37 | one package item invalid/conflicted | import requested | whole batch rejected; zero partial writes | transaction/readback proof |
| G3I-A38 | accepted package rerun | same source hash submitted | `0 changes`; no duplicate keys or audit action | idempotency readback |
| G3I-A39 | translation batch rollback | rollback requested | only batch-owned values restored; cache/admin/public equal preimage | before/after + rollback audit |
| G3I-A40 | G3.5 starts | build selected | named build + complete i18n/proof index used | G3.5 intake evidence |

## 20. Development handoff and operator handback

Before development, moderator/super-admin provides the applied admin baseline and I18N registry with operational statuses. Игорь provides:

- current route/action inventory;
- exact page/source status inventory;
- surface mapping matrix;
- shared shell/component ownership proposal;
- data/action owner matrix;
- demo/stub inventory;
- auth/locale/SEO continuity plan;
- cache/concurrency plan;
- rollout/rollback plan;
- test fixture and proof plan;
- conflicts/questions returned to PM;
- exact technical rows accepted for development.

On development review, Игорь provides:

- changed-file/build map;
- route/layout/data/action traceability;
- surface registry/readback;
- automated positive/negative results;
- server ACL/idempotency/stale/cache proof;
- technical translations/SEO/auth binding proof;
- hardcoded-string scan and proof for corrected missing/broken keys, placeholders and safe-import runtime;
- five-width current visual proof;
- preview/limited/rollback audit;
- residual ledger;
- G3.5 handoff marker.

Moderator/super-admin then completes translation-key registry, surface×rollout-locale coverage, translation import dry-run/atomic/idempotency/rollback evidence and admin/public readback. QA verifies the combined package; neither the developer nor moderator alone issues G3.5 acceptance.

## 21. Definition of Done

- all eight surfaces mapped explicitly;
- shared shell/auth integration present;
- real data/actions bound to canonical owners;
- no demo data or dead CTA;
- role/ACL/CSRF/privacy checks preserved;
- locale, SEO and route compatibility proven;
- all visible production copy is key-backed and every locale admitted to Nebula rollout has 100% required-key coverage with readback;
- translation import cannot mutate Language/status or non-target keys and has proven dry-run, preimage conflict guard, atomic result, idempotent rerun, audit and rollback;
- loading/empty/stale/error/degraded states proven;
- duplicate/concurrent/cache/partial-failure cases proven;
- current visual proof at five widths for each activated source-backed surface;
- preview/limited/active/rollback transitions and audit proven;
- persisted/readback explains layout/build per surface;
- legacy rollback target retained;
- G3.5 receives named build and proof index;
- PM task-specific verdict recorded.

## 22. Proof boundary

This document proves an autonomous target contract and source navigation.

It does not prove:

- that every Oracle / Nebula file has current Figma/source acceptance;
- that any static page is backend-bound;
- that the current live Confideline route uses the new layout;
- that translations, SEO, auth, data/actions or rollback are implemented;
- that G3.5 passed;
- that the product is launch-ready.

Current verdict remains `spec_handoff_ready`, `runtime open`.

## 23. Knowledge basis

- `etalon-tz-g3-int-layout-backend-integration.md`;
- `functional-tz-quality-standard.md`;
- `target-site-vision-g1-g3.md`;
- `g1-g3-route-and-admin-ownership-matrix.md`;
- `g1-g3-product-consistency-register.md`;
- G1.1–G3.7 PM/Codex contracts;
- `H:\GPT-Codex\.ops\docs\projects\NEBULA-MASTER.md`;
- current Oracle / Nebula manifest/backlog and source files;
- current Confideline runtime source and route evidence.

Claim class: current owner direction + accepted G1–G3 product contracts + current local source inventory.

Excluded:

- competitor-specific subscription/booking mechanics;
- fixed-duration packages instead of credits;
- layout-driven business-rule invention;
- static-page readiness promotion;
- separate Oracle admin/product data store;
- public traffic approval.

## 24. Самооценка

| Критерий | Балл | Обоснование |
|---|---:|---|
| Q1 | 5/5 | measurable backend-bound surfaces |
| Q2 | 8/8 | scope/non-goals/dependencies explicit |
| Q3 | 10/10 | roles, visibility and server authorization |
| Q4 | 7/7 | source/route/owner/rollback preconditions |
| Q5 | 12/12 | rollout/render states and invariants |
| Q6 | 12/12 | public/auth/data/action/rollout flows |
| Q7 | 12/12 | unauthorized, duplicate, stale, cache, concurrent and degraded |
| Q8 | 8/8 | binding versions, build markers, audit and readback |
| Q9 | 6/6 | client/admin/monitoring surfaces |
| Q10 | 12/12 | 40 acceptance cases |
| Q11 | 5/5 | PM + Codex handoff pair |
| Q12 | 3/3 | DoD and proof boundary |
| **Итого** | **100/100** | |

Hard gates: `pass`.

Blocking specification gaps: нет.

Deferred gates: per-page source/visual acceptance, public traffic O5, legal/brand decision.

Implementation/runtime gaps: route/layout/data/action binding, migration, runtime and G3.5 proof.

Verdict: `spec_handoff_ready`.
