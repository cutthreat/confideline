# Технический контекст G3.7 для Codex Игоря: eligibility, ranking и rotation

## 1. Паспорт задачи

- Task ID: `G3.7`
- Название: «Допуск, выдача и ротация экспертных анкет»
- Фаза: `V3 client pilot` для eligibility + manual order при disabled KPI; automation/KPI scale — `V5`
- Приоритет: `P0`
- Парное PM-ТЗ: `etalon-tz-g3-7-eligibility-rotation.md`
- `spec_completeness`: `100%`
- `owner_policy_closure`: `closed`
- `implementation_status`: `code_present_unmapped`
- `runtime_acceptance`: `not_run`
- Владелец продукта: Product Owner / Project Manager Nebula
- Целевые роли: гость, клиент, Эксперт, Агент, модератор, super-admin

Owner claim об implementation-in-progress и наличие текущих sorting/weight controls не заменяют mapped build и runtime proof.

## 2. Краткий контекст

Текущая платформа имеет dating-oriented browse/dashboard, geo pages, profile fields и отдельные экспертные анкеты. Целевой продукт:

- не показывает обычных пользователей друг другу;
- использует одну expert eligibility truth на всех поверхностях;
- различает видимость анкеты, catalog capabilities и свежий transactional paid-start guard;
- применяет ranking только после eligibility;
- позволяет объяснить результат до публикации;
- держит KPI influence выключенным в pilot.

Критический риск — дать pin/weight/KPI возможность обойти недопуск, busy/blocked state или stale start conditions.

V3 pilot minimum: explicit policy records for all eight stable surfaces, manual eligibility/order controls with preview/audit and `KPI mode = disabled`. V5 adds automated/KPI-driven scale; it is not the owner of the pilot minimum.

## 3. Результат

Для заданных `surface + client context + rule version + time/state snapshot` система возвращает:

1. одну запись решения на каждую candidate profile;
2. единый decision contract: `display_eligible`, `capabilities[]`, `reason_codes`;
5. ranking factors только для eligible profiles;
6. стабильный упорядоченный список без дублей;
7. preview/readback, совпадающий с public result;
8. immutable decision snapshot и audit.

## 4. Термины

| Термин | Значение |
|---|---|
| Candidate pool | Исходный набор profiles для surface |
| Display eligibility | Можно ли показать profile |
| Action capability | Какие действия можно показать |
| Fresh paid-start guard | `paid_start_eligible`, вычисляемый G1/G2/G6 непосредственно перед start и не кэшируемый с каталогом |
| Exclusion | Явное правило, исключающее profile |
| Ranking factor | Фактор порядка только eligible profile |
| Surface policy | Versioned rules конкретной поверхности |
| Inheritance | Только явный `base_policy_ref` и field-level overrides/readback; скрытое наследование запрещено |
| Stable view | Один логический snapshot выдачи и pagination |
| Pin/Priority/Weight | Три разные admin controls |
| KPI mode | disabled/after_threshold/immediate |
| Decision explanation | Причины eligibility/action/rank без раскрытия private data |

## 5. Scope

### Входит

- candidate pool per surface;
- eligibility stages;
- action capability;
- region/topic/language scope;
- busy/offline visibility;
- ranking factors;
- pin/priority/weight/exclusion;
- explicit base-policy references and field-level overrides for every registered surface;
- no-duplicate/stable view/pagination;
- KPI modes with pilot disabled;
- insufficient_data;
- reassignment/cold start;
- versioned config;
- admin preview/public parity;
- override audit/expiry;
- retry/concurrency/degraded behavior;
- current-state revalidation handoff.

### Не входит

- profile content and field definitions;
- G3.6 evaluation semantics;
- profile card design;
- price/package calculation;
- session/request lifecycle;
- actual paid start authorization and transactional `paid_start_eligible` evaluation;
- KPI formulas/data collection;
- review moderation;
- assignment mutation;
- guaranteed traffic share;
- Agent profile cap;
- paid waitlist/async consultation;
- technical algorithm prescription.

### Зависимости

- G3.6 completeness/blocker input only;
- G3.1/G3.2/G3.3 surface contracts;
- G3.4 matching/start handoff;
- profile publication/moderation;
- G6.1 assignment, G6.2 state/SLA, G6.3 quality and G6.4 versioned admission; missing/stale required admission is a fail-closed eligibility input, never a local G3.7 default;
- G2 effective price;
- G5 KPI definitions/data, only after enablement;
- taxonomy/region/language data.

## 6. Роли и доступ

| Роль | Разрешено | Запрещено | Видимость |
|---|---|---|---|
| Гость/клиент | view/filter/open/allowed CTA | internal formula/KPI/Agent identity | public result/reasons |
| Эксперт profile | appear according to rules | self-pin/weight/exclude | own public result |
| Агент | operational online/profile actions for assigned profiles | ranking config, foreign data | assigned states only |
| Модератор | permitted content/quality status | global rule publish unless permission | review consequence |
| Super-admin | draft/preview/publish/override/audit | bypass protected eligibility | full config/explanation |

Server-side ACL applies to admin mutations and preview data. Agent cannot enumerate internal reasons or KPI of other profiles.

## 7. Preconditions и triggers

### Config publish preconditions

- all eight surface identities exist; any base-policy reference and field-level override is explicit and valid;
- eligibility rules complete;
- every ranking factor has type/range/no-data behavior;
- fallback behavior defined;
- KPI mode explicit;
- required translations present;
- pin positions and exclusions non-conflicting or conflict policy explicit;
- representative preview completed;
- version/audit/effective time ready.

### Runtime decision preconditions

- one active version resolved;
- candidate sources available or safe degraded behavior selected;
- client context normalized;
- profile/assignment/admission/content/price/state inputs carry source/version/time;
- pagination/view context valid.

### Triggers

- public list request;
- filter/topic/region change;
- matching request;
- state/assignment/profile change;
- version effective;
- override create/expire;
- next page request;
- start action revalidation.

## 8. Invariants

1. Eligibility before ranking.
2. Excluded/blocked/unadmitted/unassigned cannot be restored by ranking.
3. G3.7 capabilities and transactional `paid_start_eligible` are separate.
4. Busy/offline may be visible only with honest allowed action.
5. Region is hard only on region surface or explicit filter.
6. Same profile appears once per list.
7. One logical view uses one rule/data snapshot policy.
8. Pin applies only to eligible profile.
9. Priority/weight cannot cancel exclusions.
10. KPI pilot mode is `disabled`.
11. `insufficient_data` is not zero KPI.
12. Public rating profile ≠ internal Agent KPI.
13. Reassignment preserves prior decision snapshots and resets new Agent KPI context.
14. No automatic top-N cap per Agent.
15. Overrides require reason/scope/time/audit.
16. Preview/public same inputs/version → same result.
17. Stale list never authorizes paid start.
18. Missing config/data does not widen eligibility.

## 9. Состояния и переходы

### 9.1. Policy version

| State | Trigger | Guards | Result |
|---|---|---|---|
| `draft` | create/edit | permission | no public effect |
| `preview_ready` | validation + fixtures | complete config | comparable output |
| `scheduled` | publish future | one next version | immutable waiting |
| `active` | effective time | valid | runtime uses version |
| `superseded` | next active | — | historical explainability |
| `invalid` | missing/conflict | — | cannot activate |

### 9.2. Per-profile decision

Public/internal integration uses one result shape:

```json
{
  "display_eligible": true,
  "capabilities": ["open_profile", "send_free_message", "create_consultation_request"],
  "reason_codes": ["profile_and_scope_valid"]
}
```

Rules:

- `display_eligible=false` requires `capabilities=[]` and at least one stable `reason_code`;
- `display_eligible=true` requires `open_profile`;
- optional catalog capabilities are `send_free_message`, `notify_availability`, `create_consultation_request`;
- `create_consultation_request` opens request/consent only;
- `paid_start_eligible` is forbidden in stored/cached G3.7 decisions and list payloads;
- internal evaluation stages may exist for diagnostics, but cannot become a second public decision contract.

### 9.3. View snapshot

- `created`;
- `active`;
- `stale_state_revalidation_required`;
- `expired`;
- `invalidated_configuration`.

Forbidden:

- excluded → ranked without new valid decision;
- busy/offline → paid capability from weight/pin;
- disabled KPI → KPI factor applied;
- stale view → direct paid without current guard;
- mutation of old decision after reassignment/version change.

## 10. Функциональные сценарии

### S1. Home slice

`home` получает limited result from same eligible pool; no separate manually duplicated list.

### S2. General catalog

`dashboard_catalog`: topic/language/method/availability/price dominate; geo optional unless explicit.

### S3. Country/city

`country` and `city`: region is hard surface scope; multi-region profile present once.

### S4. Topic/category

`category`: explicit taxonomy match before rank; no hidden unrelated expansion.

### S5. Matching

`matching_result`: G3.4 answers become context; same rules/explanation contract.

### S5a. Thematic block

`thematic_block`: explicit topic/content scope; no implicit reuse of another surface's result.

### S5b. Expert profile

`expert_profile`: public profile visibility and allowed CTAs use the same decision contract without inventing a second eligibility source.

### S6. Busy/offline

Profile may be shown with message/notify; paid request unavailable.

### S7. Pin

Eligible pinned profile occupies scoped position; blocked one is removed with warning.

### S8. Priority/weight

Eligible profiles order/frequency changes explainably, no eligibility change.

### S9. Stable pagination

Pages from one view have no duplicate/skip due solely to tie/randomness.

### S10. KPI disabled/cold start

No KPI factor; no-data marked insufficient_data.

### S11. Reassignment

New decisions use current Agent state/KPI context; historical snapshots unchanged.

### S12. State change

Profile becomes busy/blocked after page load; G3.7 can refresh catalog capabilities, while actual start is independently decided by the fresh transactional guard.

### S13. Empty result

Safe empty/fallback without fake profiles or eligibility widening.

### S14. Degraded ranking

Safe deterministic fallback among eligible only; staff incident/readback.

### S15. Version switch

New view uses effective version; old view explainable and start revalidated.

## 11. Контракт данных

### Surface policy

- surface ID, restricted to `home`, `dashboard_catalog`, `country`, `city`, `category`, `matching_result`, `thematic_block`, `expert_profile`;
- explicit `base_policy_ref` or explicit no-base value;
- field-level override map and resolved-policy readback;
- hard scopes;
- display eligibility rules;
- action capability rules;
- ranking factor definitions;
- fallback;
- result/page limits;
- stable-view behavior;
- KPI mode/enablement;
- version/effective time.

### Profile decision

- profile ID;
- surface/context hash/reference;
- input versions/time;
- `display_eligible: boolean`;
- `capabilities: string[]`;
- `reason_codes: string[]`;
- applied completeness/admission/assignment/state/price sources;
- override refs;
- decision time.

`paid_start_eligible` is not persisted here and is not returned by catalog cache. The paid-start endpoint re-evaluates it inside the session/ledger transaction using current G1/G2/G6 inputs and its own idempotency key.

### Ranking result

- view ID;
- rule version;
- candidate/eligible counts;
- ordered unique profile IDs;
- per-profile factors;
- pin/priority/weight;
- insufficient_data;
- tie/fallback explanation;
- pagination continuity;
- created/expiry time.

### Override

- profile/surface;
- exclusion/pin/priority/weight;
- old/new;
- actor/reason;
- start/end;
- status;
- version/audit.

### Source of truth / mutability

| Data | Owner | G3.7 use |
|---|---|---|
| profile content/status | profile/moderation | eligibility input |
| completeness/blockers | G3.6 | input only; never final display/action decision |
| price | G2.1 | display/action guard |
| assignment/admission/state | G6/G1 | action eligibility |
| reviews/rating | G3 review owner | rank/display if approved |
| KPI | G5.3 | disabled pilot; future rank input |
| policy/overrides | G3.7 | own versioned truth |
| `paid_start_eligible` final guard | G1/G2/G6 | fresh transactional downstream revalidation; never cached catalog capability |

Policy versions, decisions and historical view snapshots are immutable. Current pointers and state inputs may change.

## 12. Поверхности

### Client

- `home`;
- `dashboard_catalog`;
- `country`;
- `city`;
- `category`;
- `matching_result`;
- `thematic_block`;
- `expert_profile`;
- filters/pagination/empty.

### Agent

- assigned operational status only;
- no ranking manipulation or competitors' data.

### Support/moderator

- linked public result/version where needed for case;
- permitted content/quality actions;
- no unrestricted formulas.

### Super-admin

- the only target editor route is `/ru/admin/settings/expert-ranking`; other admin surfaces expose read-only applied version/readback and a link to this owner;
- surface registry;
- rule versions/diff;
- preview inputs;
- eligible/excluded/ranked explanation;
- override editor/history;
- public parity check;
- config/degraded incidents;
- top-N concentration monitoring without auto-cap.

### Notifications/readback

- configuration invalid;
- blocked pin;
- override expiry;
- preview/public mismatch;
- degraded ranking;
- unexpected duplicate/stability defect.

## 13. Ошибки и negative behavior

| Condition | Expected |
|---|---|
| Unauthorized admin mutation | server denial + audit |
| Missing active version | safe no-result/last approved policy; incident; no widened eligibility |
| Missing/implicit inheritance or inheritance cycle/conflict | publish blocked |
| Duplicate publish/retry | one logical version |
| Concurrent override | version/conflict control; no silent overwrite |
| Pin blocked profile | exclude + warning |
| KPI missing while disabled | normal non-KPI result |
| KPI missing while future enabled | approved fallback/fail-closed; no zero |
| Ranking dependency down | deterministic eligible fallback or safe empty |
| Eligibility dependency unknown | profile not granted broader capability |
| Duplicate candidate sources | one profile in output |
| Page snapshot expired | explicit refresh/new view |
| State changes before start | fresh transactional guard recalculated; denied start creates no session/debit |
| Preview partial failure | not accepted/published as full |
| Public/preview mismatch | incident/FAIL; capture versions/inputs |

## 14. Acceptance matrix

| ID | Given | When | Then | Evidence |
|---|---|---|---|---|
| R01 | published/admitted/assigned valid profile | general catalog | profile eligible and ranked | decision + public |
| R02 | admin-blocked profile + high weight | list requested | excluded, no CTA | decision/public |
| R03 | unassigned/unadmitted profile | list requested | protected exclusion | decision |
| R04 | busy profile, free message allowed | list requested | visible message, no paid request | public/state |
| R05 | offline profile, notify enabled | list requested | notify capability only | public/state |
| R06 | country surface + multi-region profile | country matches | appears once | result |
| R07 | wrong country | country list | excluded_scope | decision |
| R08 | general catalog + client geo mismatch | no explicit geo filter | not excluded solely by geo | result |
| R09 | explicit topic | list | only taxonomy-compatible candidates | decisions |
| R10 | eligible pin | publish/result | fixed scoped position | preview/public |
| R11 | pinned then blocked | state changes | removed; config warning | state/result |
| R12 | priority/weight changed | new version effective | explainable order change only | diff/preview |
| R13 | same profile from multiple matches | list | one card | output uniqueness |
| R14 | ties + pagination | pages traversed | stable no duplicate/skip | view/page evidence |
| R15 | new Agent/profile | KPI mode disabled | insufficient_data, no KPI rank | explanation |
| R16 | KPI values present | pilot disabled | values ignored | factor readback |
| R17 | mode enable attempted without gate | publish | blocked/kept disabled | admin/audit |
| R18 | reassignment after prior view | new view/history opened | new current inputs; old snapshot unchanged | before/after |
| R19 | stale page profile becomes busy | start clicked | fresh `paid_start_eligible=false`; no session/debit | UI + state/ledger |
| R20 | no eligible profiles | list | safe empty; no fake/widening | UI + decisions |
| R21 | ranking dependency down | list | eligible-only fallback/incident | output + incident |
| R22 | invalid config draft | publish | blocked; current remains | admin |
| R23 | two publishes concurrently | submit | one sequential active version | versions/audit |
| R24 | override expires | deadline | influence removed; history remains | result/audit |
| R25 | preview same inputs/version | compare public | exact eligibility/order/actions match | preview/public |
| R26 | unauthorized Agent | edits priority | server denial | response/audit |
| R27 | high profile concentration one Agent | top-N generated | monitored only; no hidden cap | result/metric |

## 15. Programmer handoff

Обязательные integration outcomes:

- candidate source dedup;
- G3.6 input-only boundary and one `display_eligible + capabilities[] + reason_codes` contract;
- staged G3.7 eligibility/action/ranking;
- explicit policy records for all eight stable surface IDs, including field-level base/override readback;
- versioned rules/overrides;
- stable view/pagination;
- KPI disabled enforcement;
- insufficient_data semantics;
- preview/public parity;
- fresh transactional `paid_start_eligible` handoff outside catalog cache;
- server-side admin ACL/audit;
- degraded safe behavior.

Current source navigation:

- current `/ru/dashboard`/browse discovery;
- country/city pages;
- current profile fields and expert profiles;
- admin controls related to profiles/settings;
- `tz-g3-catalog-profile-rotation.md`;
- `product-architecture-g1-g6-ownership-map.md`;
- G3.1–G3.6, G5 and G6 handoffs;
- current panel/rotation owner facts.

Existing weights/pinning/exclusions must be inventoried by actual effect. Do not assume name/form presence equals target semantics or all-surface runtime coverage.

На review предоставить build/config map, surface map, rule/override version model, fixtures, preview/public proof, negative/concurrency checks и residuals.

## 16. Definition of Done

- build marker mapped;
- all surfaces registered;
- eligibility/action/ranking separated;
- version lifecycle and rollback work;
- KPI disabled enforced;
- 3–5 fixture profiles cover states/scopes;
- preview/public parity proven;
- stable pagination/no duplicates proven;
- stale-start revalidation proven;
- protected exclusions survive pin/weight;
- admin ACL/audit/override expiry proven;
- degraded behavior proven;
- cleanup/PM verdict complete.

## 17. Proof boundary

Документы доказывают autonomous target contract.

Не доказано:

- actual current controls semantics;
- build mapping;
- all-surface eligibility;
- ranking stability;
- preview/public parity;
- state revalidation;
- KPI disabled enforcement;
- runtime concurrency/degraded behavior.

Panel `implementation_in_progress` и admin-form existence не повышают status без указанного proof.

## 18. Knowledge basis

- `etalon-tz-g3-7-eligibility-rotation.md`;
- `functional-tz-quality-standard.md`;
- `product-architecture-g1-g6-ownership-map.md`;
- `owner-decisions.md`;
- `tz-g3-catalog-profile-rotation.md`;
- `qa-ba-autonomous-tester/contracts/SIX-GOALS-RUNTIME-ACCEPTANCE.md`;
- accepted G3.1–G3.6 and regional decisions.

Claim class: owner-approved product rules + current contour observations.

Исключено:

- competitor opaque ranking;
- KPI influence during pilot;
- hidden geo hard filter in general catalog;
- profile cap per Agent;
- paid queue;
- pin/weight bypass of eligibility.

## 19. Самооценка

| Критерий | Балл | Обоснование |
|---|---:|---|
| Q1 | 5/5 | measurable multi-surface result |
| Q2 | 8/8 | scope/non-goals/dependencies |
| Q3 | 10/10 | roles/admin ACL/visibility |
| Q4 | 7/7 | config/runtime triggers |
| Q5 | 12/12 | policy/decision/view states + invariants |
| Q6 | 12/12 | all surface/ranking flows |
| Q7 | 12/12 | authorization/retry/concurrent/degraded/stale |
| Q8 | 8/8 | versions/snapshots/overrides/audit |
| Q9 | 6/6 | client/staff/admin/monitoring |
| Q10 | 12/12 | 27 oracle cases |
| Q11 | 5/5 | PM + Codex pair |
| Q12 | 3/3 | DoD/proof boundary |
| **Итого** | **100/100** | |

Hard gates: `pass`.

Blocking specification gaps: нет.

Deferred gates: enablement KPI beyond `disabled`, public traffic O5, public-scale performance.

Implementation/runtime gaps: current controls mapping and complete multi-surface proof.

Verdict: `spec_handoff_ready`.
