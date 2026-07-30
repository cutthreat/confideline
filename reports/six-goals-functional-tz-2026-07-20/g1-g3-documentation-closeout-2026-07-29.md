# Closeout: продуктовая и документальная ревизия G1–G3

Дата: 2026-07-29  
Статус постановки: `G1_G2_G3_15_of_15_spec_handoff_ready`  
Статус реализации: `not_runtime_verified / NO_GO`

## 1. Итог

Все задачи G1.1–G3.7 приведены к единому эталонному стандарту:

- 15 автономных ТЗ для Игоря;
- 15 автономных контекстов для Codex Игоря;
- 15 HTML и 15 DOCX для вычитки и передачи;
- единые product objects, роли, состояния, defaults и административное владение;
- отдельная фиксация текущего сайта и целевого продукта;
- панель по шести целям синхронизирована с новым комплектом.

`ТЗ = 100%` означает готовность постановки. Это не означает, что функции уже реализованы или приняты на production.

## 2. Главные документы

| Документ | Назначение |
|---|---|
| `g1-g3-documentation-matrix.md` | адресная матрица всех 15 задач и файлов |
| `current-site-state-g1-g3-2026-07-29.md` | доказанное текущее состояние сайта |
| `target-site-vision-g1-g3.md` | единое представление целевого сайта |
| `g1-g3-product-consistency-register.md` | решения по всем межцелевым конфликтам |
| `g1-g3-product-object-dictionary.md` | канонические роли, объекты и термины |
| `g1-g3-route-and-admin-ownership-matrix.md` | client/admin routes и owner-page каждой настройки |
| `owner-decisions.md` | принятые значения и оставшиеся release gates |
| `admin-panel-settings-development-package.md` | разработка управляемых admin-поверхностей |

Панель:

`H:\GPT-Codex\Confideline\web\qa-reports\nebula-6-goals-master-plan-2026-06-11\index.html`

## 3. Зафиксированная продуктовая модель

### G1 — коммуникация и консультация

- постоянный бесплатный диалог отделён от consultation request и paid consultation session;
- один диалог может содержать несколько последовательных консультаций;
- платный режим начинается только после явного подтверждения клиента;
- принятие клиентского запроса Агентом открывает confirmation card, но не создаёт session; принятие предложения Эксперта клиентом само является consent;
- committed explicit client consent для любого initiation path создаёт exactly one session в `connecting`; trial не может обойти consent;
- clarification заменяет активный 15-минутный request clock на 60-минутный, а после ответа клиента запускается новый 15-минутный срок Эксперта;
- публичная роль — Эксперт, внутренний оператор — Агент;
- один Агент может вести несколько назначенных анкет, но только одну active paid/pause session;
- `connecting / trial / paid / balance_pause / completed` — единые primary states;
- waiting и reconnect — подстатусы, а support/refund/quality — отдельные связанные процессы;
- sender-visible original и recipient-visible censored copy разделены; incident и original защищены audit/ACL;
- история сохраняет actual actor, public author и immutable snapshots.

### G2 — credits и деньги

- пакеты продают credits за USD, а не минуты;
- consultation price показывается в credits за started minute;
- global default — 30 credits/мин, profile override допускается;
- Starter Package — 60 credits за 9.99 USD;
- пакетная скидка меняет USD-цену credits, не цену минуты Эксперта;
- каждая начатая paid-минута списывается атомарно и exactly once;
- balance pause — один раз, стартово 5 минут;
- top-up не возобновляет paid автоматически: требуется явное «Продолжить»;
- client/agent reconnect — отдельные настраиваемые 60 секунд без новой минуты;
- trial entitlement редактируется только в G2.1 Coupons; consultation settings показывает applied read-only snapshot;
- при trial entitlement больше `0` нулевой balance не блокирует session/connecting/trial; balance проверяется перед первой paid minute, а при нехватке credits та же session переходит в `balance_pause`;
- Expert/Agent может инициировать проверку или рекомендовать компенсацию, но любой фактический refund/coupon/bonus grant выполняется только после ручного решения super-admin;
- refund, compensation и agent accrual/correction не смешиваются и не переписывают исходные ledger entries.

### G3 — витрина и выбор Эксперта

- `/{language}/` — мультиязычная витрина;
- `/{language}/dashboard` — expert-only каталог вместо dating-выдачи;
- country/city применяют hard regional scope, общий dashboard — только явно выбранный geo-фильтр;
- клиентская taxonomy: Отношения, Карьера, Будущее, Развитие, Духовность;
- `expert_specialization_taxonomy_v1_legacy` сохраняет неизменяемый migration baseline, а первая активная `expert_specialization_taxonomy_v2` исключает deprecated `Energy Diagnostics` из specialization, добавляет `Energy Practices` в methods и «Переезд и жизненные перемены» в specializations без переиндексации остальных IDs;
- specialization, method и consultation style являются разными осями;
- G3.6 поставляет completeness/blocker input, а G3.7 единолично возвращает `display_eligible + capabilities[] + reason_codes`;
- обязательный versioned admission приходит из G6.4; missing/stale admission закрывает eligibility, а G3.7 не создаёт параллельный admission-контур;
- полный registry поверхностей един для G3.6/G3.7: `home`, `dashboard_catalog`, `country`, `city`, `category`, `matching_result`, `thematic_block`, `expert_profile`; скрытая inheritance запрещена;
- catalog capabilities закрыты списком `open_profile / send_free_message / notify_availability / create_consultation_request`; paid-start capability не существует;
- `paid_start_eligible` не входит в G3.7 catalog contract: владельцы G1/G2/G6 вычисляют его заново непосредственно перед созданием session или финансовым действием; expert-ranking показывает только read-only readback;
- главная, каталог и geo используют один eligibility/ranking source, без параллельного ручного пула;
- реальные availability, price, completed consultation count и published reviews не заменяются макетными данными;
- обычный review связан с completed consultation;
- historical testimonial требует отдельного super-admin override, source/consent/reason, имеет `verified_consultation=false` и не влияет на rating;
- числовые лимиты витрины имеют отдельные admin cells; стартово: темы `6 desktop / 4 mobile`, карточки Экспертов `6`, специализации в компактной карточке `3`, FAQ `6`, последние консультации `3`, отзывы на главной `3`;
- V3 pilot minimum включает taxonomy v2, ручной completeness input, eligibility и manual order при disabled KPI; автоматическая KPI-ротация относится к V5.

## 4. Управление через админ-панель

Закреплено правило одного редактора:

- lifecycle/timers/reconnect/consultation-history projection retention — `/ru/admin/settings/consultations`;
- censorship/attachments/edit chat policy — `/ru/admin/settings/chat`;
- global/profile prices, packages, package discounts и balance rules — `/ru/admin/settings/prices`;
- правила и шаблоны coupons, bonus/compensation, trial entitlement и bonus expiry — `/ru/admin/settings/coupons`; фактическое ручное начисление конкретному пользователю — существующая карточка баланса пользователя;
- refunds policy/settings — `/ru/admin/settings/refunds`; operation — связанный refund case;
- accrual configuration — `/ru/admin/settings/accruals`; существующие partner payments/payouts используются только для operation/readback;
- storefront content — **Содержимое → Витрина Nebula**;
- storefront display rules и home-review presentation — `/ru/admin/settings/storefront`;
- matching questions/branching/mapping — `/ru/admin/settings/matching`;
- review policy/eligibility/moderation/aggregate/historical override и profile limit — `/ru/admin/settings/reviews`; очередь — **Содержимое → Отзывы**;
- taxonomy/profile fields и versioned mapping — `/ru/admin/profile-field/index`;
- completeness rules/input — `/ru/admin/profile-field/completeness`;
- eligibility/ranking/pin/priority — `/ru/admin/settings/expert-ranking`;
- roles — только существующая **Настройка ролей**;
- translations — существующая система ключей;
- email body — `/ru/admin/email-template/index`; delivery rules — `/ru/admin/notification-rule/index`.

На первом этапе новые права получает super-admin; дальнейшая раздача выполняется существующим permissions-контуром.

Ранние `task-details.html` и связанные карточки теперь явно помечены как архив. Они сохраняют историю и макеты, но не являются источником требований G1–G3.

## 5. Проверки

| Проверка | Результат |
|---|---:|
| Сквозная структура и semantic audit G1–G3 | `402/402 PASS` |
| Независимый residual-аудит архитектуры G1–G3 | `PASS`, остаточных P0/P1/P2 нет |
| Focused G1.1 | `115/115 PASS` |
| Focused G1.2 | `81/81 PASS` |
| Focused G1.3 | `80/80 PASS` |
| Focused G1.4 | `116/116 PASS` |
| Focused G2.1 | `111/111 PASS` |
| Focused G2.2 | `131/131 PASS` |
| Focused G2.3 | `138/138 PASS` |
| Focused G2.4 | `106/106 PASS` |
| Общая карта 30 задач | `309/309 PASS` |
| DOCX renderer repair smoke | `PASS`: PATH discovery; `10/10` PNG decoded; `0` hanging soffice; `13.07 s` |
| Panel JavaScript syntax | `32/32 PASS` inline-script blocks в 41 HTML-файле |
| Panel local href existence | `145/145 PASS` прямых локальных href; ранее раскрытые шаблонные и динамические mappings также прошли static audit |
| Panel G1–G3 artifact mapping | `15/15` задач; PM HTML + Codex MD + DOCX `45/45 PASS` |
| DOCX visual contact sheets | `PASS`, 15/15 документов / 198 страниц; page PNG + sheets `213/213` decoded |
| Targeted `git diff --check` | `PASS` |

Контактные листы визуальной проверки:

`doc-previews/g1-g3-2026-07-29-r9-contact-sheets/`  
`tooling-repair-proof/doc-preview-contact-sheets/`

Встроенный Browser отказался открывать локальный `file://` URL по своей security policy. Поэтому визуальная приёмка панели через Browser не заявляется; её JavaScript и локальные ссылки проверены статически.

## 6. Bounded repair DOCX renderer

Канонический `render_docx.py` формировал некорректный Windows URI временного LibreOffice-профиля и мог зависать с GUI launcher.

Исправлено:

- `Path(...).resolve().as_uri()` → корректный `file:///...`;
- console launcher `soffice.com`;
- глобальная LibreOffice configuration не изменялась.

Текущий SHA256 канонического bundled renderer: `C494BC01719DC600E274B05B634AD5049B69CE975859492C729654607DB847C4`.

Preimage, SHA256, verifier и проверяемый rollback текущего bundled renderer находятся в `tooling-repair/`. `tooling-repair-proof/` сохраняет исторический proof раннего task-local renderer и актуальные contact sheets.

## 7. База решений и граница доказательств

В продуктовом проходе использованы:

- обязательная Nebula knowledge-card `H:\GPT-Codex\.ops\knowledge\nebula\answers\expert-training-and-operational-knowledge.md`;
- текущий product source G6.4 `reports/tz-product-g6-4-expert-training-admission-2026-07-16.md`;
- admission/readiness evidence `reports/learning-content-pack-ready-2026-07-17/06-admission-readiness-rules-audit.md`;
- локальные карты текущего сайта, маршрутов, объектов, административного владения и согласованности из этого пакета;
- текущие PM/Codex ТЗ, panel mappings и verifier results, перечисленные выше.

Figma остаётся источником визуальной правды. Этот проход не переизобретает дизайн и не выдаёт наличие макетов за runtime acceptance: функциональная логика фиксируется в PM-ТЗ, а визуальная parity принимается отдельно по текущей реализации и исходным Figma-экранам.

Knowledge/reference-материалы подтверждают покрытие и риски, но не заменяют owner/legal решения, current build mapping, server-side proof или runtime evidence.

## 8. Что остаётся открытым

Это release/runtime gates, а не скрытые пробелы ТЗ:

1. mapped build/commit для каждой реализованной задачи;
2. server-side positive/negative ACL proof, особенно запрет чужой экспертной анкеты;
3. единый end-to-end money/state/audit evidence packet;
4. свежая visual/source acceptance реализаций Home, catalog и profile на пяти ширинах;
5. legal wording, crisis resources, privacy/retention review;
6. brand/domain;
7. compensation economics O4, пока значения остаются `unset/disabled`;
8. public traffic gate O5 после pilot baseline;
9. включение KPI influence только после пилота и отдельного решения.

## 9. Рекомендуемый порядок реализации

1. G6.1/G6.7 server-side assignment и ACL foundation.
2. G1.2, затем G1.1/G1.3 + G2.1/G2.2: role chat, одна consultation session, lifecycle, price snapshot, minute ledger, pause/reconnect.
3. G1.4 + G2.3/G2.4: notifications, refund/correction/accrual.
4. G3.3 + V3 minimum G3.6 и interface shell G3.1-G3.4: чистые реальные profile data, taxonomy/completeness input, catalog/storefront/profile/matching.
5. G4.1-G4.3 + G5.1 + minimum G6.2-G6.4: support/rules/event lineage и current versioned admission-gate minimum. Этот G6.4 prerequisite обязан быть доказан до G3.7/G3.5, хотя primary ownership полного G6.4 workflow остаётся в V4 operations package.
6. V3 minimum G3.7: единый eligibility/manual ranking для восьми surfaces; missing/stale/failed admission действует fail-closed.
7. Runtime QA G3.1-G3.4 на одной mapped build.
8. G3.5: полный клиентский E2E, включая admission-negative cases, и `P0 FAIL → NO_GO`.

Публикация на GitHub Pages и повышение runtime-статуса в рамках этого closeout не выполнялись.
