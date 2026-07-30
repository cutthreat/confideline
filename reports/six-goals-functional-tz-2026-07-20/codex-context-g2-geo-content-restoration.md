# Технический и диагностический контекст G2.GEO: country/city content

## 1. Паспорт задачи

- Task ID: `G2.GEO`
- Panel task ID: `task-g2-geo-content`
- Название: «Восстановление и AI-заполнение контента страниц стран и городов»
- Фаза: `V2 content restoration prerequisite`
- Приоритет: `P0`
- Основной операционный пакет: `etalon-tz-g2-geo-content-restoration.md`
- `spec_completeness`: `100%`
- `owner_policy_closure`: `closed`
- `implementation_status`: `existing_tooling_requires_current_mapping`
- `runtime_acceptance`: `five_country_text_pilot_complete_full_rollout_open`
- Владелец продукта: Product Owner / Project Manager Nebula
- Primary executor: moderator/content operator под авторизацией `super-admin`
- Developer trigger: только evidence-backed missing/broken capability

G2.GEO — связанный implementation/content package второй глобальной цели. Это не G2.5 и не 31-я строка канонического функционального реестра.

## 1.1 Граница владельцев

Moderator/Codex сначала выполняет inventory, existing-field/key search, source reconciliation, draft, review, controlled publish и readback. Игорю передаётся только технический gap с route, locale, entity, expected/actual, save/cache/readback и воспроизводимым evidence. Игорь не авторит и не утверждает geo-тексты.

Пилот Japan, South Korea, Mexico, Vietnam и Thailand имеет финальный статус `complete`: повторно подтверждены `5/5` controlled before/after RU, `30/30` final source↔CMS readback и `5/5` финальных RU visual checks. Статус относится к согласованному text-pilot; полный rollout всего country/city denominator остаётся отдельным scope, а фото `0/2` — вне text-scope.

## 2. Задача в одном абзаце

Нужно получить актуальный список всех active country/city locale pages, сопоставить их с сохранёнными source-пакетами, восстановить потерянные после обновления шаблона значения, использовать Codex для контролируемой адаптации или генерации отсутствующего материала, показать super-admin preview/diff, опубликовать утверждённую revision и доказать результат admin/public readback. Наличие source-файлов, старых PASS-отчётов или успешного теста одной пары не равно текущему runtime acceptance.

## 3. Текущая source truth

### 3.1 Существующие сущности и маршруты

Текущая административная карта содержит:

- `/ru/admin/country/index`;
- `/ru/admin/geoname/index`;
- `/ru/admin/country/update?id={countryId}`;
- `/ru/admin/geoname/update?id={geonameId}`;
- `/ru/admin/language/list`.

Публичные маршруты:

- country: `/{lang}/country/{slug}`;
- city: фактический SEO route может включать country code, например `/{lang}/city/am-yerevan`.

Нельзя конструировать public URL только по простому slug. Canonical URL берётся из свежего runtime/entity readback.

### 3.2 Сохранённые пакеты

Канонические каталоги:

```text
H:\GPT-Codex\.ops\content-packages\all-locations\countries\<slug>\
H:\GPT-Codex\.ops\content-packages\all-locations\cities\<slug>\
```

Основные подготовленные материалы:

```text
<slug>-ru-ru-fields.txt
<slug>-ru-ru-html-description.txt
```

В пакетах могут присутствовать другие locale и service files. Не делать вывод о готовности только по двум именам: состав проверяется manifest/audit contract.

### 3.3 Manifest и QA

Текущие локальные точки входа:

```text
H:\GPT-Codex\Confideline\web\geo-content-panel\manifest.json
H:\GPT-Codex\Confideline\web\geo-content-panel\geo-text-audit.json
H:\GPT-Codex\Confideline\web\geo-content-panel\geo-seo-quality-audit.json
H:\GPT-Codex\Confideline\web\geo-content-panel\source-preservation-audit.json
H:\GPT-Codex\Confideline\reports\geo-content-qa\latest.json
```

Snapshot от 2026-05-27:

| Метрика | Значение |
|---|---:|
| Country pages | 39 |
| City pages | 118 |
| Всего pages | 157 |
| Locales в SEO audit | 6 |
| Locale pages | 942 |
| Expected/existing TXT files | 1884 / 1884 |
| Source-linked pages | 157 / 157 |
| Exact duplicate groups | 0 |
| Hard near-duplicate pairs | 0 |

Этот snapshot полезен как source inventory, но является stale для утверждения текущего сайта после template update.

### 3.4 Проверенные partial live slices

Артефакты 2026-07-03:

```text
H:\GPT-Codex\Confideline\geo-content-production\scripts\README-geo-v5-autoload.md
H:\GPT-Codex\Confideline\reports\geo-v5-admin-inventory-20260703-live-pages\summary.json
H:\GPT-Codex\Confideline\reports\geo-v5-admin-inventory-20260703-closeout.md
H:\GPT-Codex\Confideline\reports\geo-v5-autoload\
H:\GPT-Codex\Confideline\reports\geo-v5-admin-inventory-20260703-public-readback\
H:\GPT-Codex\Confideline\reports\geo-v5-batch-5x5-20260704\closeout.md
```

Pre-fill inventory 2026-07-03 зафиксировала потерю только на sampled-паре Armenia/Yerevan: для русской локали обеих сущностей status panel показывал `HTML missing`, `SEO incomplete`, `Фотографии: 0/2`, `FAQ: 0`, `Localized page is not saved`. Это доказательство двух страниц, а не всей матрицы.

После заполнения эта пара прошла inventory → dry-run → fill → admin readback → public readback. Ограниченный batch от 2026-07-04 подтвердил 30 страниц × 6 локалей = 180 locale pages по admin status/readback с `badCount = 0`; публичный RU smoke прошёл 30 из 30 URL. Этот результат является частичным proof и не подтверждает остальные locale pages или актуальную полноту после последующих изменений.

До новой полной инвентаризации обязательный статус:

```text
live_content_coverage = unknown_after_template_update
source_package_coverage = historical_snapshot_available
```

## 4. Обязательная стартовая классификация

До любой write-операции создать свежий reconciliation snapshot из трёх множеств:

1. активные country/city entities и locales из текущего CMS;
2. элементы `manifest.json`;
3. фактические source-package directories/files.

Каждая строка классифицируется:

| Класс | Значение |
|---|---|
| `cms_manifest_source` | есть entity, manifest mapping и source |
| `cms_manifest_no_source` | есть entity и manifest, source отсутствует |
| `cms_no_manifest_source` | есть entity/source, manifest устарел |
| `cms_only` | активная entity без manifest и source |
| `manifest_source_no_cms` | историческая строка, которой нет среди active entities |
| `inactive_with_history` | entity неактивна, история сохраняется |
| `locale_missing_in_form` | язык включён, но недоступен в current country/city form |

Denominator для публикации формируется из активных и индексируемых `entity + locale`, а reconciliation issues отображаются отдельно.

Не удалять manifest/source строки автоматически, если они не найдены в current CMS.

## 5. Техническая граница ownership

### G2.GEO владеет

- content coverage inventory;
- source binding;
- content revisions;
- Codex runs;
- validation results;
- review/approval;
- publish queue;
- admin/public readback evidence;
- rollback;
- coverage dashboard.

### G2.GEO не владеет

- country/geoname master entities;
- geo URL router;
- active locale registry;
- taxonomy и specialization mapping;
- expert eligibility/ranking;
- country/city page layout;
- expert listing query;
- prices, credits, refunds или accruals;
- photo generation pipeline;
- legal policy wording.

### Integration owners

| Объект | Владелец |
|---|---|
| Country/Geoname entity | existing admin country/geoname |
| Per-locale page fields | existing country/geoname update form |
| Languages | existing `/admin/language/list` |
| Public layout | G3.INT |
| Geo expert filtering | G3.2 |
| Taxonomy | G3.6 |
| Eligibility/order | G3.7 |
| SEO infrastructure | existing SEO/translation contour |
| Shared macro blocks | existing macro/content owner |
| Text content lifecycle | G2.GEO |

## 6. Current form mapping

Historical inventory обнаружила:

- tabs: `Информация`, `Описание`, `Image/Images`, `FAQ`, `SEO`;
- page fields: `CountryPage[...]` / `GeonamePage[...]`;
- FAQ arrays:
  - `CountryPageFaq[n][question|answer|sort|is_active]`;
  - `GeonamePageFaq[n][question|answer|sort|is_active]`;
- photo inputs:
  - `Country[mainPhoto]`, `Country[coverPhoto]`;
  - `Geoname[mainPhoto]`, `Geoname[coverPhoto]`;
- status surface: `.geo-status-panel`.

Это не вечный schema contract. Перед write выполнить `inventory` и построить current field map.

Минимальный semantic field map:

| Semantic key | Назначение |
|---|---|
| `meta_title` | SEO title |
| `meta_description` | SEO description |
| `h1` | основной заголовок |
| `seo_text` | SEO text |
| `html_description` | основной rich content |
| `hero_h1` | hero heading |
| `hero_h2` | hero supporting heading |
| `teaser` | краткое описание |
| `hero_card` | content hero card |
| `cta_title` | CTA heading |
| `cta_text` | CTA body |
| `faq[]` | question/answer/sort/is_active |
| `image_meta` | alt/title/description |
| `og_title` / `og_description` / `og_image_meta` | Open Graph content, если присутствует в current form |
| `robots_policy` | read-only current indexability policy |
| `schema_binding` | read-only current structured-data contract |
| `canonical` / `hreflang` | read-only route/locale binding |
| `is_active` | read-only entity/page activity |
| `show_on_main` | read-only page flag |

Конкретный HTML input name связывается с semantic key в current build adapter. Unknown input не заполняется автоматически.

AI/write allowlist может содержать только локализованные content fields, явно разрешённые свежим mapping. `entity_id`, `slug`, canonical/public route, page-level `is_active`, `show_on_main`, robots/indexability, hreflang и структура schema являются immutable/read-only для Codex pipeline. FAQ content может быть draft, но FAQ `is_active` не переключается AI автоматически. Payload с попыткой изменить эти значения отклоняется до preview/publish.

### 6.1 Template migration regression guard

Перед deployment любой миграции country/city template или form mapping:

1. сохранить versioned pre-migration inventory по каждой затрагиваемой `entity + locale`;
2. зафиксировать required-field contract, form fingerprint, canonical route и normalized per-field hashes;
3. отдельно зафиксировать read-only `is_active`, `show_on_main`, robots, hreflang и schema binding;
4. выполнить field mapping в dry-run и показать unmapped/dropped fields;
5. после deployment повторить inventory и hashes;
6. сравнить required fields, locale coverage, values и routes с preimage.

Любой необъяснимый missing field, hash mismatch, потерянная locale или route drift блокирует batch/write, инвалидирует approval и создаёт `FORM_DRIFT`/`rollback_required`. Миграция считается принятой только после успешного pre/post comparison; сам факт deployment не является proof.

## 7. Нормализованная модель записи

Логический record `geo_content_locale` должен иметь как минимум:

- geo entity type и immutable ID;
- locale;
- canonical route;
- current form version/fingerprint;
- source reference и source hash;
- current published revision/hash;
- current draft revision/hash;
- lifecycle status;
- validation status;
- applied policy snapshot;
- latest Codex run reference;
- latest approval reference;
- latest publish/readback reference;
- rollback parent/preimage reference;
- timestamps и actual actor.

Способ хранения выбирает Игорь. Требуется наблюдаемое поведение, а не конкретное имя таблицы.

## 8. Статусы и допустимые переходы

Основная последовательность:

```text
missing
  -> source_ready
  -> draft
  -> review_required
  -> approved
  -> publish_queued
  -> published
  -> verified
```

Допустимые боковые переходы:

```text
any non-terminal -> stale
draft/review -> validation_failed
missing/source_ready -> blocked_source
publish_queued/published -> publish_failed
published/verified -> rollback_required
rollback_required -> published -> verified
```

Rules:

1. `published` не означает `verified`.
2. `verified` требует admin и public readback.
3. Изменение source/prompt/template/form fingerprint/required fields инвалидирует approval и переводит revision в `stale`.
4. `blocked_source` не может перейти в `approved` без source resolution или explicit documented `generate_missing` flow.
5. Неактивная entity не активируется lifecycle-переходом content record.

## 9. Source selection algorithm

Для каждого semantic field:

1. получить latest readable published value и revision;
2. получить source-package value;
3. получить last verified export/readback;
4. определить managed macro/shared block;
5. сравнить hashes и normalized values;
6. выбрать mode:
   - `restore` — source → empty current field;
   - `adapt` — source → changed current template;
   - `repair` — current/source имеют конкретный validation defect;
   - `translate` — approved master → locale draft;
   - `generate_missing` — источника действительно нет;
7. создать field-level diff;
8. не выполнять silent overwrite при конфликте.

Общие макросы вроде `{{whatWeOfferBlock}}`, `{{geoServiceListBlock}}`, `{{informationalDisclaimerBlock}}` считаются ожидаемыми только если они разрешены active contract. Unknown placeholder — blocker.

## 10. Codex run contract

MVP не требует прямой интеграции Codex API в admin UI. Поддерживаются:

- export/import валидируемого job packet;
- job handoff локальному или серверному runner с последующим импортом draft.

Если выбран server-side runner, credentials находятся только в штатном secret storage и никогда не сохраняются в admin fields, job packet, prompt, audit или evidence. Super-admin не вводит и не получает API key через G2.GEO. Direct API call может быть будущей реализацией, но не является критерием MVP.

Input packet:

```text
task_id
entity_type
entity_id
slug
locale
canonical_route
mode
current_form_fingerprint
source_refs[]
source_hashes[]
current_published_fields
required_field_contract
active_prompt_id/version
active_quality_policy_version
allowed_macros[]
forbidden_claim_categories[]
```

Output packet:

```text
run_id
input_hash
mode
draft_fields
output_hash
source_usage
detected_claims
warnings
blockers
validation_summary
model_route_label
prompt_version
completed_at
```

Никаких cookies, tokens, browser profile data, raw private runtime dumps или client content в packet.

Codex output всегда draft. Даже `blockers=0` не является publish authorization.

`draft_fields` валидируются по write allowlist. Любая попытка изменить entity ID, slug, route, canonical, page-level `is_active`, `show_on_main`, robots/indexability, hreflang или schema structure является blocker. AI result никогда не вызывает save/publish/activation автоматически.

## 11. Content generation policy

### `restore`

Использует исходные значения без творческой перезаписи, кроме безопасного переноса в новое field mapping.

### `adapt`

Сохраняет style, sequence, major theses, local/astro anchors и source vocabulary. Меняет структуру ровно настолько, насколько требует current template.

### `repair`

Исправляет конкретный defect: duplicate, wrong geo name, placeholder, meta length, malformed HTML, unsafe claim или grammar.

### `translate`

Использует approved source/master revision. Не переводит URL, IDs, macros и data tokens. Отдельно валидирует target locale.

### `generate_missing`

Разрешён только когда source действительно отсутствует. Использует approved factual sources и нейтральный online-service framing. Любое локальное утверждение должно иметь evidence reference; иначе оно не включается.

## 12. Quality gates

### Format gate

- required fields present;
- lengths within active ranges;
- meta fields contain no HTML;
- HTML allowlist respected;
- no `<h1>` in HTML Description;
- no `script/style/img/html/head/body`;
- no class/id/style/dir/data-* layout attributes;
- allowed placeholders only.

### Locale gate

- correct language;
- correct geo name and grammar;
- no other entity names;
- locale available in form;
- translation keys/macros resolve.

### SEO gate

- Meta Title contains required `{{siteName}}` contract where applicable;
- Meta Description/H1/SEO Text populated;
- localized offer and FAQ blocks present;
- canonical/hreflang match route registry;
- robots/indexability match current page policy;
- schema/structured-data output conforms to current server-owned contract;
- no exact duplicates;
- no hard near-duplicates at configured threshold;
- no keyword stuffing or boilerplate-only text.

### Source-preservation gate

- source ref exists;
- source hash recorded;
- length and overlap thresholds pass;
- required anchors preserved;
- rewrite mode uses its explicit threshold set;
- no claim of source-backed text when source validation failed.

### Safety gate

Block:

- guaranteed outcome;
- clinical/medical/legal/financial advice;
- crisis handling claims;
- offline/local presence without evidence;
- invented ratings, counts, price or availability;
- PII/private data;
- unsupported regional facts;
- fear/dependency copy;
- hidden billing/subscription claim.

## 13. Existing QA contract

Use:

```text
H:\GPT-Codex\.ops\docs\playbooks\CONFIDELINE-GEO-CONTENT-QA-CONTRACT.md
```

Before mass rewrite:

```powershell
H:\GPT-Codex\Confideline\geo-content-production\scripts\Invoke-GeoSeoRewriteContract.ps1 -Mode preflight -CheckHub
```

Before local handoff:

```powershell
H:\GPT-Codex\Confideline\geo-content-production\scripts\Invoke-GeoContentQa.ps1
H:\GPT-Codex\Confideline\geo-content-production\scripts\Invoke-GeoSeoRewriteContract.ps1 -Mode final
```

Current contract includes:

- `completePages == pages`;
- `missingFilePages == 0`;
- `issuePages == 0`;
- zero forbidden literals/unknown placeholders;
- zero exact/hard near duplicates;
- all pages source-linked;
- zero source-preservation failures;
- local pages verifier pass.

G2.GEO adds a new runtime layer: current CMS inventory, actual admin save and public readback. Existing package QA alone is insufficient.

## 14. Admin UI contract

Canonical parent:

```text
Countries & Cities
```

Children:

```text
Countries
Cities
Контент стран и городов
```

Recommended route:

```text
/{lang}/admin/geo-content/index
```

This route is a queue/status/operations surface, not a duplicate editor.

### Dashboard summary

- inventory version/time;
- denominator;
- country/city/entity-locale counts;
- coverage by status;
- verified percentage;
- stale/blocked/failed/rollback counts;
- source coverage;
- duplicate and safety blockers;
- current queue state.

### Filters

- entity type;
- country/city;
- locale;
- content lifecycle status;
- source status;
- validation status;
- publish/readback status;
- stale reason;
- assigned batch/run.

### Row actions

- open existing entity update;
- open public page;
- inspect source;
- create/recreate draft;
- export Codex job packet / import validated draft result;
- preview/diff;
- approve/reject;
- queue publish;
- retry readback;
- rollback;
- open audit/evidence.

### No duplication

Do not edit:

- geo entity identity;
- taxonomy;
- expert assignment/filter;
- eligibility/ranking;
- prices;
- roles;
- language activation;
- route rules

on the G2.GEO page. Show link/badge to the canonical owner.

The write allowlist excludes `entity_id`, `slug`, canonical/public route, page-level `is_active`, `show_on_main`, robots/indexability, hreflang mapping and schema structure. Their values are re-read as publish preconditions and compared after save, never taken from AI output.

## 15. Review and approval

Approval record binds:

- entity + locale;
- exact draft revision/hash;
- source hashes;
- prompt/policy versions;
- form fingerprint;
- validation report hash;
- actor/time/comment.

If any bound input changes, approval is stale.

Package approval can cover only homogeneous blocker-free revisions under one source/prompt/policy contract. Any warning, source conflict, generated local fact or manual edit requires individual review.

## 16. Publish operation

Preconditions:

- approved current revision;
- current entity and locale;
- current form fingerprint compatible;
- active page policy;
- no blocking validation;
- preimage captured;
- no concurrent publish;
- authorized super-admin.

Operation:

1. allocate/reuse idempotency key;
2. re-read current revision/form;
3. compare preconditions, including immutable route/activity/indexability values;
4. write only allowed field set;
5. save;
6. capture admin response/status and post-save immutable-field hashes;
7. read fields back;
8. enqueue public readback;
9. mark `verified` only after both match.

No unrelated entity fields may change.

## 17. Batch runner

Batch snapshot fields:

- batch ID;
- inventory version;
- immutable item list;
- filters used;
- mode;
- prompt/policy versions;
- item state;
- attempts;
- last error;
- queue cursor;
- pause/stop reason.

Execution constraints:

- one current browser/admin session must not run conflicting DOM inventories/fills in parallel;
- default to sequential admin interaction unless isolated sessions are proven;
- throttle and retry settings come from admin policy snapshot;
- stop after configured consecutive failures;
- stop on form fingerprint drift;
- resume skips already verified exact revisions;
- item failure does not rewrite successful items.

## 18. Readback contract

### Admin readback

Compare semantic keys against approved payload after normalization. Also record visible status-panel state.

Historical expected status labels included:

- `Активно`;
- `Show on main`;
- `HTML completed`;
- `SEO completed`;
- `Фотографии: 2/2`;
- `FAQ: 4`;
- `Localized page is saved`.

Do not hardcode labels as the only proof. Use current form/field values and status semantics.

### Public readback

Check:

- expected public URL resolves;
- final canonical matches registry;
- intended locale renders;
- H1 matches approved semantic value;
- required visible blocks exist;
- no raw template placeholders;
- no wrong geo name;
- no empty template shell;
- no 5xx;
- index/noindex policy correct;
- response content hash/evidence stored safely.

## 19. Rollback contract

Preimage includes every field in allowed publish set plus revision identifiers.

Rollback:

- creates a new operation, never deletes history;
- requires super-admin reason;
- restores one exact entity + locale preimage;
- does not rollback entity identity, route, taxonomy, experts or other locales;
- runs admin/public readback;
- records linkage from bad revision to restored revision.

If preimage is missing or unreadable, fail closed before publish.

## 20. Photo boundary

The geo QA panel tracks photos, but G2.GEO is primarily a text/content restoration package.

Rules:

- preserve valid existing image linkage and metadata;
- never replace an existing valid photo because a text run was requested;
- show text and photo readiness separately;
- missing photos remain explicit work items;
- generation/selection/upload of new images uses the existing dedicated photo workflow;
- publication rule may require photos only if current page policy explicitly does so.

Current historical photo gaps must not be presented as current without fresh audit.

## 21. Configuration model

Versioned settings:

- modes enabled;
- active prompt per mode/locale;
- required semantic fields;
- allowed HTML/macros;
- field length limits;
- duplicate thresholds;
- source-preservation thresholds;
- batch size;
- sequential/concurrency mode;
- max consecutive failures;
- attempts/retry delay;
- stale TTL;
- review sample rule;
- package approval permission;
- publication schedule/limits;
- retention;
- enabled validators.

Every run stores applied settings snapshot. Config change does not reinterpret historical results.

## 22. Audit and privacy

Audit records:

- actual actor;
- action;
- entity/locale/revision;
- old/new status;
- reason/comment;
- source/prompt/policy/form versions;
- idempotency key;
- timestamps;
- result/evidence refs;
- error class.

Do not store:

- cookies/tokens/OAuth;
- browser profile internals;
- raw private client content;
- secrets in prompt or evidence;
- direct personal contact/payment data.

## 23. Failure taxonomy

| Code | Meaning | Expected action |
|---|---|---|
| `SOURCE_MISSING` | no safe source | block or controlled generate_missing |
| `SOURCE_CONFLICT` | current/source disagree | manual review |
| `FORM_DRIFT` | current fields differ from inventory | stop and re-inventory |
| `LOCALE_UNAVAILABLE` | locale missing in form | enable/fix canonical language route |
| `VALIDATION_FORMAT` | format/HTML/length failure | repair draft |
| `VALIDATION_LOCALE` | wrong language/geo | repair draft |
| `VALIDATION_DUPLICATE` | exact/hard near duplicate | rewrite/manual exception |
| `VALIDATION_SOURCE` | source preservation failure | restore/rewrite with source |
| `VALIDATION_SAFETY` | unsafe/unsupported claim | block and remove claim |
| `REVISION_CONFLICT` | page changed after preview | refresh diff/approval |
| `SAVE_FAILED` | admin save not confirmed | retry without duplicate |
| `ADMIN_READBACK_MISMATCH` | persisted fields differ | stop batch; investigate |
| `PUBLIC_ROUTE_MISMATCH` | guessed/old URL | resolve canonical route |
| `PUBLIC_READBACK_FAILED` | public result absent/wrong | retry or rollback |
| `ROLLBACK_FAILED` | preimage restore not proven | manual incident, no green status |

## 24. Acceptance matrix

| ID | Test | Required evidence |
|---|---|---|
| G2G-A01 | Fresh current entity inventory | versioned entity/locale snapshot |
| G2G-A02 | Manifest reconciliation | classified set differences |
| G2G-A03 | Source-directory reconciliation | hashes and mapping |
| G2G-A04 | Current form inventory country | field fingerprint |
| G2G-A05 | Current form inventory city | field fingerprint |
| G2G-A06 | Locale selector verification | active locales in real form |
| G2G-A07 | Restore empty country locale | draft/source diff |
| G2G-A08 | Restore empty city locale | draft/source diff |
| G2G-A09 | Adapt old pack to current fields | no content loss, validation pass |
| G2G-A10 | Generate missing with safe sources | evidence-linked draft, no publish |
| G2G-A11 | Source conflict | `review_required`, no write |
| G2G-A12 | Unknown field | no guessed write |
| G2G-A13 | Unknown placeholder | validation blocker |
| G2G-A14 | Wrong geo name | validation blocker |
| G2G-A15 | Wrong locale | validation blocker |
| G2G-A16 | Exact duplicate | validation blocker |
| G2G-A17 | Hard near duplicate | rewrite/manual exception |
| G2G-A18 | Unsupported local fact | safety blocker |
| G2G-A19 | Guaranteed outcome claim | safety blocker |
| G2G-A20 | PII injection fixture | safety blocker, no data leak |
| G2G-A21 | Approve exact revision | immutable approval binding |
| G2G-A22 | Change source after approval | approval stale |
| G2G-A23 | Change prompt after approval | approval stale |
| G2G-A24 | Template/form migration guard | pre/post hashes and required fields match; otherwise publish blocked |
| G2G-A25 | Unauthorized actor | server-side deny |
| G2G-A26 | Double approval | one logical result |
| G2G-A27 | Double publish callback | one save/result |
| G2G-A28 | Concurrent manual edit | revision conflict |
| G2G-A29 | Successful country save/readback | admin exact match |
| G2G-A30 | Successful city save/readback | admin exact match |
| G2G-A31 | Country public readback | canonical/H1/blocks |
| G2G-A32 | City code-prefixed public route | canonical route resolves |
| G2G-A33 | Admin save/public fail | not verified; retry/rollback |
| G2G-A34 | Batch pause | cursor/results retained |
| G2G-A35 | Batch resume | no duplicate verified writes |
| G2G-A36 | Consecutive error threshold | batch stops |
| G2G-A37 | Form drift mid-batch | batch stops before further writes |
| G2G-A38 | Item retry after worker loss | idempotent continuation |
| G2G-A39 | Rollback country locale | preimage restored/read back |
| G2G-A40 | Rollback city locale | preimage restored/read back |
| G2G-A41 | Rollback without preimage | fail closed |
| G2G-A42 | Inactive entity in batch | no activation/publish |
| G2G-A43 | CMS-only active entity | in denominator as blocked_source |
| G2G-A44 | Manifest-only historical entity | reconciliation row, no silent delete |
| G2G-A45 | Text ready/photo missing | separate status, no false full-ready |
| G2G-A46 | Coverage export | UI/JSON totals match |
| G2G-A47 | Two-user role isolation | non-super-admin cannot mutate |
| G2G-A48 | Audit completeness | actor/revision/source/prompt/policy/evidence present |

## 25. Focused verifier requirements

Create a focused verifier that checks:

- both handoff documents and human artifacts exist;
- task is P0 and not counted as a new primary functional task;
- panel card and artifact mapping exist;
- required admin routes and ownership boundaries are present;
- historical snapshot is labelled stale, not current runtime;
- source-first rule exists;
- no-auto-publish rule exists;
- states and failure taxonomy are present;
- PM and Codex acceptance case counts are exact;
- current geo QA contract is referenced;
- generated HTML/DOCX are current;
- DOCX render produced decodable page PNGs;
- overview/current/target/route/delivery docs are updated.

This verifier proves package completeness only. It must not promote `runtime_acceptance`.

## 26. Runtime proof packet

Minimum evidence for implementation acceptance:

```text
build/commit identity
current inventory snapshot
form fingerprints
manifest/source reconciliation
configuration snapshot
Codex run records
validation reports
approval records
publish operations
admin readback
public readback
rollback proof
coverage report
remaining blockers
```

At least:

- one country and one city positive path;
- one source restore and one controlled generate/repair path;
- negative source/safety/duplicate/locale cases;
- idempotency/concurrency cases;
- pause/resume/failure recovery;
- rollback on country and city;
- full denominator coverage report.

## 27. Definition of Done for Codex implementation

1. `spec_completeness = 100%`.
2. Fresh inventory and reconciliation are reproducible.
3. Current form mapping is not assumed from stale evidence.
4. Source-first restoration is enforced.
5. Codex output cannot auto-publish.
6. AI cannot change slug/routes, activity/display flags, robots, hreflang or schema structure.
7. MVP Codex route works without secrets in the admin UI and without mandatory direct API integration.
8. Approval is revision-bound.
9. Publish is idempotent and preimage-backed.
10. Admin/public readback gates `verified`.
11. Template migration regression guard proves required fields and pre/post hashes.
12. Batch stops on form/readback drift.
13. Rollback is verified.
14. Dashboard shows current denominator and honest status.
15. Existing geo QA and new runtime acceptance both pass.
16. Runtime evidence names the exact build and source/config versions.
17. No unresolved P0 content blocker is hidden behind a percentage.

## 28. Non-goals

- Do not redesign Oracle / Nebula country/city pages.
- Do not create new geo, taxonomy, expert, language, SEO or role masters.
- Do not implement G2 money logic.
- Do not alter expert eligibility/ranking.
- Do not use old manifest public URLs without current canonical readback.
- Do not use one successful page as proof for the matrix.
- Do not publish externally as part of spec preparation.
- Do not call a local source pack a published page.
- Do not call old PASS current after template update.

## 29. Residuals before runtime start

- Exact current CMS denominator must be measured.
- Current form fingerprints must be captured.
- Current live loss pattern must be classified field by field.
- Exact implementation mechanism for Codex job execution remains Igor-owned; MVP may use export/import or job handoff and does not require embedded direct API.
- Legal review may change disclaimer/policy content; affected revisions then become stale.
- Photo gaps remain a separate tracked dimension.

## 30. Handoff rule

Start implementation from current inventory, not from the old 157-row result alone. Preserve the existing content packs and field history. First prove one country and one city through the new pipeline, including rollback, then run a bounded batch with automatic stop on drift. Close only with current coverage and public readback evidence.
