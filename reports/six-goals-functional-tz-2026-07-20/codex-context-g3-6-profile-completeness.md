# Диагностический контекст G3.6: versioned profile completeness

## 1. Паспорт задачи

- Task ID: `G3.6`
- Название: «Полнота и готовность анкеты Эксперта»
- Фаза: `V3 client pilot` для taxonomy v2 + manual completeness input; automation scale — `V5`
- Приоритет: `P0`
- Основной операционно-функциональный пакет: `etalon-tz-g3-6-profile-completeness.md`
- `spec_completeness`: `100%`
- `owner_policy_closure`: `closed`
- `implementation_status`: `code_present_unmapped`
- `runtime_acceptance`: `not_run`
- Владелец продукта: Product Owner / Project Manager Nebula
- Целевые роли: клиент, Эксперт/Агент, модератор, super-admin
- Primary executor: super-admin/moderator
- Developer trigger: only `missing_capability`, `broken_binding` or `runtime_gap`

Существующий profile-field contour является foundation, но не доказательством product completeness semantics.

## 2. Краткий контекст

Live admin уже имеет profile fields, categories, visibility/searchability/order-like properties и заполненные expert-oriented поля. На текущем evidence:

- `Areas` и `Specialization` являются multi-select;
- `My Experience` хранит диапазон опыта;
- есть ручное `Number of Consultations`;
- существующие properties не доказаны как Nebula completeness weights.

G3.6 должен добавить отдельную versioned rule semantics и единую versioned taxonomy без молчаливого изменения смысла существующих controls.

## 3. Результат

Для каждой анкеты и surface система воспроизводимо рассчитывает evaluation snapshot под одной опубликованной версией: blockers, valid weighted contributions, optional missing, risk status, score и completeness input. Отдельно G3.6 публикует единую taxonomy version для всех G3-поверхностей. Super-admin видит объяснение, preview, version/audit/rollback; клиент не видит внутренний score. Финальный display/action eligibility рассчитывает только G3.7.

V3 pilot minimum: active `expert_specialization_taxonomy_v2` plus audited manual completeness/blocker input. V5 adds automated completeness recalculation at scale; it is not a prerequisite for the bounded V3 pilot.

## 4. Термины

| Термин | Значение |
|---|---|
| Field definition | Существующее определение profile field |
| Field rule | Product rule G3.6 поверх field definition |
| Rule set | Набор правил одной опубликованной версии |
| Validation status | valid/invalid/pending/not_applicable для значения |
| Moderation status | отдельный content/safety result |
| Completeness evaluation | расчёт для profile + surface + rule version |
| Blocker | невыполненное обязательное условие |
| Weighted contribution | вклад valid weighted field |
| Override | audited surface-limited manual result |
| Taxonomy registry | versioned category → specialization → method mapping |
| Eligibility input | completeness/blocker result, потребляемый G3.7; не финальный display/action result |

## 5. Scope

### Входит

- mapping existing field → explicit G3.6 rule;
- versioned taxonomy registry и stable category/specialization mapping;
- classes blocking/weighted/informational/risk;
- per-surface applicability;
- validation/moderation precondition;
- deterministic evaluation;
- score/reason breakdown;
- versioned draft/preview/publish/effective/rollback;
- bulk re-evaluation;
- historical snapshot;
- manual completeness/blocker input override;
- client/staff visibility boundaries;
- invalid/missing configuration behavior;
- integration output for G3.7.

Canonical surface registry is complete and explicit: `home`, `dashboard_catalog`, `country`, `city`, `category`, `matching_result`, `thematic_block`, `expert_profile`. Applicability is stored/read back for all eight IDs; bulk apply expands to explicit draft values and never creates hidden inheritance.

### Не входит

- storage/schema prescription;
- ranking/rotation;
- final `display_eligible`, `capabilities[]` и `reason_codes[]`;
- fresh `paid_start_eligible` guard;
- profile content authoring UX;
- KPI Agent;
- public rating calculation;
- admission/assignment;
- claims policy definition;
- automated semantic AI moderation;
- session start/price;
- full profile CMS redesign.

### Зависимости

- existing profile field definitions/values;
- legacy baseline `expert_specialization_taxonomy_v1_legacy`, active `expert_specialization_taxonomy_v2` и translation keys;
- G3.2/G3.3 surface fields;
- G3.7 eligibility;
- G4.3 claims/safety policy;
- G6.3 quality and G6.4 admission as separate gates;
- translation and admin audit/version conventions.

## 6. Роли и доступ

| Роль | Разрешено | Запрещено | Видимость |
|---|---|---|---|
| Клиент | видеть published profile fields | internal score/reasons/config | public valid data only |
| Эксперт/Агент | видеть actionable missing/fix list для assigned profile | менять rules/override/moderation | assigned profile feedback |
| Модератор | set permitted validation/moderation outcome | publish global rules без permission | review fields + reason |
| Super-admin | rule versions, preview, publish, override, rollback | bypass protected safety/access/money blockers | full explanation/audit |

Любая admin mutation требует server-side permission, reason и audit.

## 7. Preconditions и triggers

### Rule publish preconditions

- field definition существует и имеет стабильный identity;
- class/surface/applicability заданы;
- weighted rule имеет валидный weight;
- blocking/risk rule имеет observable condition;
- `unset/0/disabled/no_data/not_applicable` определены;
- preview выполнен на representative fixtures;
- translations для admin/client-facing reason доступны;
- нет unresolved duplicate/conflicting rules.

### Evaluation preconditions

- конкретные profile values прочитаны согласованно;
- выбрана одна published rule version для effective time/surface;
- validation/moderation statuses доступны либо применяется явный no-data behavior.

### Triggers

- profile value/status change;
- moderation decision;
- new rule version effective;
- surface preview;
- bulk re-evaluation;
- override create/expire/revoke;
- G3.7 requests current eligibility input.

## 8. Invariants

1. Existing display order/searchable/legacy weight не означает G3.6 product weight.
2. Одно field value оценивается под explicit rule/version.
3. Non-empty invalid value не получает valid contribution.
4. Optional missing не является blocker/quality fail/fraud.
5. Blocking rule не превращается в weighted penalty.
6. Completeness не равна admission, rating или Agent KPI.
7. Одновременно для scope действует одна published version.
8. Draft не влияет на public result.
9. Historical snapshot immutable.
10. Override не обходит admin/safety/admission/assignment/price protected gates.
11. Client не видит internal score/staff reasons.
12. Invalid rule set fail-closed and cannot publish.
13. Re-evaluation не смешивает contributions разных versions.
14. Archived/deleted field не меняет активную semantics молча.
15. G3.6 выдаёт только taxonomy/completeness/blocker input; final display/action eligibility принадлежит G3.7.
16. Ни один consumer не hardcode-ит category membership, не переиндексирует legacy IDs и не возвращает deprecated `id=18:value=13` в active specialization mapping.
17. `paid_start_eligible` вычисляется свежим транзакционным guard G1/G2/G6, а не G3.6.

## 9. Состояния и переходы

### 9.1. Rule set

| State | Trigger | Guards | Result |
|---|---|---|---|
| `draft` | create/edit | permission | no public effect |
| `preview_ready` | validation complete | representative preview | comparable result |
| `scheduled` | publish future time | full valid config | immutable version waiting |
| `active` | effective time | one version per scope | evaluations use version |
| `superseded` | new version active | — | historical only |
| `invalid` | broken/missing dependency | — | cannot activate |

Rollback is a new version based on a prior valid configuration, not mutation of old version.

### 9.2. Profile evaluation

| State | Meaning |
|---|---|
| `not_evaluated` | no result for version/surface |
| `evaluating` | consistent input snapshot in progress |
| `eligible_input` | blockers passed; score/reasons available |
| `blocked_missing` | required data/validation missing |
| `blocked_risk` | risk/moderation condition blocks |
| `pending_review` | required moderation unresolved |
| `configuration_error` | active rule cannot be safely applied |
| `overridden_pass_input` | authorized temporary completeness input within limits |
| `overridden_block_input` | authorized manual blocker input |

Forbidden:

- `configuration_error -> eligible_input` via guessed default;
- `blocked_risk -> overridden_pass_input` if protected safety rule forbids it;
- historical snapshot state rewrite after new version.

## 10. Функциональные сценарии

### S1. Complete valid

All blockers valid; weighted fields contribute; score/reasons persisted.

### S2. Required missing

One surface-required field absent; exact blocker and remediation shown.

### S3. Optional missing

Optional field absent; no penalty unless an explicit weighted rule says only present valid value adds points.

### S4. Garbage

Non-empty placeholder fails validation and contributes zero/blocks as defined.

### S5. Risk content

Prohibited/unsafe claim yields pending/blocked risk independent of text presence.

### S6. Surface difference

Region missing: common catalog may pass, city surface fails.

### S7. Draft preview

Draft results visible in admin but public/current evaluation unchanged.

### S8. Publish/effective

New version activates at time; new current evaluations use it; old snapshots remain.

### S9. Rollback

New version copies valid prior semantics and activates normally.

### S10. Manual pilot input override

Super-admin changes only the completeness/blocker input with reason/scope/expiry; protected blockers remain, and G3.7 independently recalculates final eligibility.

### S11. Override expiry

Automatic return to current evaluated result with audit.

### S12. Partial bulk failure

Results tagged by version; failed profiles retry without mixing old/new breakdown.

### S13. Field archived

Configuration incident and explicit rule update required; no silent remap.

### S14. Concurrent publish

One sequential active version; second request conflicts/rebases.

## 11. Контракт данных

### Field rule

- rule identity;
- field identity;
- class;
- surface scope;
- applicability condition;
- required/optional/not-applicable behavior;
- weight and range, if weighted;
- validation/moderation requirement;
- no-data behavior;
- admin/client-safe reason keys;
- version identity/effective time.

### Taxonomy version

- immutable version identity and effective time;
- stable category ID, RU/EN translation keys and display order;
- stable specialization value IDs and active/deprecated status;
- category → specialization → method mapping;
- migration alias, if a label changes;
- author, reason, diff, publish/rollback audit.

`expert_specialization_taxonomy_v1_legacy` is the immutable migration baseline of existing profile field `id=18`, values `1..20`, including `13 = Energy Diagnostics`. It remains resolvable for history/aliases but is not the active public Nebula taxonomy.

The first active Nebula version is `expert_specialization_taxonomy_v2`:

| `category_id` | Public filter RU / EN | Full category | `specialization_value_ids` |
|---|---|---|---|
| `relationships_family` | Отношения / Relationships | Отношения и семья | `[1,2,3,4,5,6]` |
| `career_money_projects` | Карьера / Career | Карьера, деньги и проекты | `[7,8,9]` |
| `choice_future_changes` | Будущее / Future | Выбор, будущее и перемены | `[10,11,21]` |
| `personal_growth_inner_balance` | Развитие / Growth | Личностный рост и внутреннее равновесие | `[14,15,16,17,18]` |
| `spirituality_energy_practices` | Духовность / Spirituality | Духовность, карма и родовые темы | `[12,19,20]` |

Canonical RU/EN specialization labels, geo-filter behavior and migration readback are defined in `expert-specialization-taxonomy-v2-2026-07-29.md`.

Migration policy:

- `id=18:value=13` is preserved as deprecated legacy alias/history and is absent from all active `specialization_value_ids`;
- `id=17:value=16 = Energy Practices` is appended to the method axis;
- versioned mapping `id=18:value=13 -> id=17:value=16` is non-destructive and audited;
- `id=18:value=21 = Relocation and Life Changes / Переезд и жизненные перемены` is append-only;
- all other legacy IDs retain identity and are never reindexed or reused.

### Evaluation snapshot

- profile;
- surface/context;
- rule version;
- input field versions/statuses;
- evaluated time;
- blocker list;
- pending/risk list;
- contributions;
- score/max/normalization context;
- completeness/blocker result;
- rule and taxonomy versions;
- configuration warnings.

### Override

- profile;
- surface;
- pass/block input;
- original result;
- actor;
- reason;
- start/end;
- current status;
- revoked/expired audit.

### Source of truth / mutability

| Truth | Owner | Mutable rule |
|---|---|---|
| profile value | profile-field owner | normal profile edit/version |
| taxonomy registry | G3.6 `/ru/admin/profile-field/expert-taxonomy` | draft; published version immutable |
| validation/moderation | owning review process | append decision/history |
| rule set | G3.6 `/ru/admin/profile-field/completeness` | draft; published immutable |
| evaluation snapshot | G3.6 result | immutable per version/input |
| current evaluation pointer | G3.6 | moves to latest completed valid |
| override | super-admin | append/revoke/expire, no history rewrite |
| final display/action eligibility | G3.7 | consumes G3.6 input; returns `display_eligible`, exact capabilities `open_profile / send_free_message / notify_availability / create_consultation_request`, and `reason_codes[]` |
| paid start guard | G1/G2/G6 transactional owners | always fresh; never inferred from catalog cache |

Retention follows profile/audit/privacy policy. Historical decisions required to explain prior listing remain available to authorized staff.

## 12. Поверхности

### Client

- no internal score;
- only public valid profile fields;
- safe unavailable state if blocked.

### Agent

- assigned-profile completeness checklist;
- no global weights or private competitor profile data.

### Support/moderator

- moderation task/reason only within permissions;
- link to evaluation consequence, not hidden reconfiguration.

### Super-admin

- sole completeness editor `/ru/admin/profile-field/completeness` inside existing `Поля анкеты`;
- sole taxonomy mapping editor `/ru/admin/profile-field/expert-taxonomy` inside existing `Поля профиля`;
- rules list/editor;
- taxonomy values/mapping, versions/diff/preview/publish/rollback;
- versions/diff;
- preview fixtures;
- profile explanation;
- bulk status;
- override;
- audit/rollback/config incidents.

### Notifications/readback

- profile needs action;
- moderation required;
- override expiry;
- configuration/bulk failure;
- no raw private content in generic event.

## 13. Ошибки и negative behavior

| Condition | Expected |
|---|---|
| Unauthorized config mutation | server denial + audit |
| Unknown field identity | version invalid/config incident |
| Weighted rule missing weight | publish blocked |
| Duplicate conflicting rule | publish blocked |
| `unset` required value | invalid draft |
| `0` weight | explicit zero contribution, not unset |
| Disabled rule | excluded from new version |
| Profile changes mid-evaluation | consistent snapshot or retry |
| Duplicate evaluate | same version/input result, no duplicate current effects |
| Concurrent publish | one active sequential version |
| Bulk partial failure | per-profile status/retry; no mixed result |
| Override beyond permission | denial |
| Expired override retry | remains expired |
| Missing translation | version cannot expose technical key |
| Downstream G3.7 unavailable | evaluation persists; listing handled downstream |
| Unknown/unpublished taxonomy version | fail closed with configuration result; no guessed mapping |

## 14. Acceptance matrix

| ID | Given | When | Then | Evidence |
|---|---|---|---|---|
| C01 | complete valid profile | evaluate common catalog | completeness input + breakdown; no final listing decision | snapshot/admin |
| C02 | required field missing | evaluate | blocked_missing exact reason | snapshot/UI |
| C03 | optional field missing | evaluate | no blocker/hidden fraud | breakdown |
| C04 | garbage non-empty | evaluate | invalid/no contribution | validation + snapshot |
| C05 | prohibited claim | moderation/evaluate | blocked_risk/pending | decision + snapshot |
| C06 | region absent | common vs city | common possible; city blocked | two snapshots |
| C07 | existing sort/search field | no explicit rule | no G3.6 contribution | config/readback |
| C08 | manual consultation count | profile evaluated | not treated as system completed count | breakdown |
| C09 | draft changed | preview | public/current result unchanged | preview/current |
| C10 | valid version published | effective time arrives | one active version | versions/audit |
| C11 | later rules change | history opened | old snapshot unchanged | before/after |
| C12 | rollback | publish rollback version | new version, prior history intact | version diff |
| C13 | allowed pilot input override | create | scoped input + reason/expiry; G3.7 still decides | override/audit |
| C14 | protected risk blocker | pass-input attempted | denied/no bypass | response/audit |
| C15 | override expires | deadline | automatic evaluated result restored | history |
| C16 | duplicate evaluation | replay | one logical current result | result identity |
| C17 | concurrent publishes | two actors | one active sequential result | versions/audit |
| C18 | bulk partial failure | run interrupted | completed tagged; failed retryable | bulk readback |
| C19 | field archived | active rule resolves | configuration incident, no silent remap | incident |
| C20 | unauthorized Agent | mutates weight | server denial | response/audit |
| C21 | taxonomy v2 published | all G3 surfaces read | same five categories and active mapping | API/UI readback |
| C22 | legacy specialization values | taxonomy published | no reindex; `id=18:13` deprecated, `id=17:16` and `id=18:21` append-only | before/after map |
| C23 | G3.6 input passes | other G3.7 gate fails | `display_eligible=false` with downstream reason | integration evidence |
| C24 | paid CTA rendered | client starts paid mode | fresh G1/G2/G6 guard runs; no cached G3.6 decision | transactional evidence |

## 15. Scoped development handoff

Обязательные integration outcomes:

- explicit separation field definition vs G3.6 rule;
- versioned taxonomy registry with stable legacy IDs;
- versioned rule sets;
- consistent evaluation snapshots;
- validation/moderation inputs;
- per-surface output;
- preview/publish/effective/rollback;
- protected input-only overrides;
- downstream G3.7 contract;
- server-side RBAC/audit;
- bulk retry/readback.

Current source navigation:

- `/ru/admin/profile-field/index`;
- `/ru/admin/profile-field/expert-taxonomy` as the sole category→specialization→method mapping editor;
- `/ru/admin/profile-field-category/index`;
- `/ru/admin/profile-field/completeness` as the sole completeness editor;
- logical `Поля анкеты → Таксономия Экспертов` within the existing profile-field contour;
- current expert field updates, including `Areas`, `Specialization`, `Number of Consultations`, `My Experience`;
- public expert cards/profile surfaces;
- `tz-g3-catalog-profile-rotation.md`;
- `product-architecture-g1-g6-ownership-map.md`;
- G3.2/G3.3/G3.7 and G4.3/G6 handoffs.

Не предполагать, что существующее свойство с названием `weight`, `sort`, `searchable` или `order` реализует этот контракт. Фактическую semantics map и baseline readback сначала возвращает super-admin/moderator. Игорь получает только строки, где доказана отсутствующая или сломанная техническая возможность.

Игорь на review предоставляет build/config, technical mapping, fixtures, automated checks и residuals. Super-admin завершает rule publication, admin/public readback и rollback evidence.

## 16. Definition of Done

- mapped build;
- explicit rules for every counted/blocking field;
- legacy taxonomy v1 baseline + active taxonomy v2, stable IDs and publish/rollback readback;
- no legacy semantic assumption;
- version lifecycle works;
- 3–5 fixtures cover complete/missing/optional/garbage/risk;
- surface-specific output works;
- input-only override/expiry/protected denial works;
- G3.7 remains sole final display/action eligibility owner;
- concurrent/partial failures handled;
- persisted snapshots/admin readback/audit agree;
- rollback and cleanup complete;
- PM verdict recorded.

## 17. Proof boundary

Документы доказывают product/technical acceptance contract.

Не доказано:

- existing code semantics;
- actual score calculation;
- validation quality;
- admin version controls;
- bulk consistency;
- G3.7 consumption;
- runtime/UI evidence.

Current profile-field availability proves only reuse potential. Static field list is not G3.6 implementation proof.

## 18. Knowledge basis

- `etalon-tz-g3-6-profile-completeness.md`;
- `functional-tz-quality-standard.md`;
- `product-architecture-g1-g6-ownership-map.md`;
- `tz-g3-catalog-profile-rotation.md`;
- current live admin profile-field map;
- accepted G3 taxonomy/card decisions.

Claim class: current-state observed field contour + owner-approved target contract.

Excluded reference mechanics:

- formal non-empty-only completeness;
- public display of internal score;
- automatic quality/fraud label;
- hidden reuse of dating weights;
- KPI/admission substitution.

## 19. Самооценка

| Критерий | Балл | Обоснование |
|---|---:|---|
| Q1 | 5/5 | measurable evaluation result |
| Q2 | 8/8 | boundaries/dependencies explicit |
| Q3 | 10/10 | roles/RBAC/visibility |
| Q4 | 7/7 | publish/evaluation triggers |
| Q5 | 12/12 | dual states + invariants |
| Q6 | 12/12 | all field classes/version flows |
| Q7 | 12/12 | config/retry/concurrent/partial/protected |
| Q8 | 8/8 | snapshots/version/audit/history |
| Q9 | 6/6 | all surfaces/readback |
| Q10 | 12/12 | 20 oracle cases |
| Q11 | 5/5 | PM + Codex pair |
| Q12 | 3/3 | DoD/proof boundary |
| **Итого** | **100/100** | |

Hard gates: `pass`.

Blocking specification gaps: нет.

Deferred gates: exact pilot numeric weights/thresholds are admin configuration; public runtime evidence.

Implementation/runtime gaps: source semantics mapping and runtime proof.

Verdict: `spec_handoff_ready`.
