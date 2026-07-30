# Nebula PM-watch delta — 2026-07-17

## Что изменилось

В локальном веб-контуре появились свежие артефакты:

- `training-panel-2026-07-17.html` — панель обучения и допуска для пилота: 5 агентов, до 25 профилей экспертов, 1 модератор, 1 супер-админ.
- `task-details.html` — обновленная версия мастер-плана, которая уже связывает G6.4 с этой панелью.

Это не новая клиентская страница и не доказательство готовности рабочего кабинета. Это управленческий контур подготовки экспертной команды.

## Реестр страниц

| page_id | Артефакт | Пользовательский сценарий | Роль в продукте | Статус |
|---|---|---|---|---|
| `nebula-training-panel-v2` | `training-panel-2026-07-17.html` | обучение → тесты → пробная консультация → допуск → первые смены | G6.4: обучение и регламенты | `local_review_ready`, runtime не доказан |
| `nebula-six-goals-task-details` | `task-details.html` | просмотр целей, зависимостей и task cards | PM-контур | `local_review_ready` |

Область текущего источника — E / esoteric. События и правила D / dating из этого артефакта не выводятся.

## Handoff для программиста и backend

Панель фиксирует требуемую продуктовую модель допуска, но не доказывает ее реализацию в админке. Для backend/admin нужно отдельно реализовать и подтвердить:

1. словарь ролей: эксперт, агент, модератор, супер-админ;
2. состояния допуска: `not_started`, `in_training`, `tests_pending`, `exam_pending`, `trial_review`, `approved`, `blocked`, `recheck`;
3. владельца и доказательство каждого gate;
4. блокировку paid access до допуска и контролируемые первые смены после допуска;
5. журнал решений, hard-fail по safety/billing/manipulation и повторную проверку;
6. связи с G1 chat, G2 billing, G4 support и G5 quality/metrics.

Пока нет runtime/admin proof, нельзя утверждать, что paid access реально блокируется, а допуск сохраняется или влияет на выдачу профиля.

## Marketing notes

- Панель не является публичной витриной, рекламной страницей или доказательством готовности привлекать клиентов.
- Ее маркетинговое значение косвенное: до рекламы должен быть подтвержден supply gate — допущенные эксперты, понятный SLA и контролируемые первые консультации.
- Не публиковать обещания о количестве экспертов, качестве обучения или готовности консультаций только на основании этой панели.

## Codex implementation notes

- Считать `training-panel-2026-07-17.html` локальным evidence/read-model, а не production UI.
- Не добавлять fake backend, fake admission status или fake paid-access success.
- Следующий технический пакет должен привязать каждое состояние к реальному owner, persisted record и проверяемому admin action.
- В текущем page family registry панель относится к G6 / staff enablement; она не расширяет клиентский flow и не меняет C76 Chatroom contract.

## PM knowledge notes

### Подтверждено

- Собраны источники обучения: Trello-карты, локальные файлы, exports Docs, тесты/forms и материалы по admission path.
- Выделены M0–M10: роль, чат, структура ответа, эмпатия, engagement policy, free/paid boundary, качество, astrology, tarot, сложные ситуации, допуск.
- В модели присутствуют owner gates: role dictionary, rubric, billing/legal truth, domain review, Trust & Safety, runtime proof.

### Не подтверждено

- Формальные pass/fail thresholds.
- Canonical Moodle/Forms route.
- Реальная запись допуска и блокировка paid access в Yii2/admin.
- Утвержденная policy по спорным материалам и финальная legal/billing truth.

### Текущий PM-вывод

Новая панель закрывает пробел в описании G6.4 и делает обучение частью launch dependency map. Она не закрывает runtime readiness. Следующий bounded шаг — product-only TZ для admission board и затем read-only QA walkthrough в админке, без изменения клиентской рекламы.

## Proof / blocker

- Свежий визуальный источник: `training-panel-2026-07-17.html`.
- Связь с мастер-планом: `task-details.html`.
- В этих файлах есть ссылки на `reports/nebula-training-panel-v2-2026-07-17.md` и `reports/trello-astrologi-training-board-2026-07-17/trello-astrologi-training-proof-pack.md`, но по ожидаемым локальным путям эти два файла сейчас не найдены. Это blocker для source-level verification, не основание считать панель неверной.

`status: new_local_pm_evidence`
`next_action: восстановить/проверить два связанных proof-файла, затем подготовить admission-board TZ`

## Delta 2026-07-21: functional TZ panel

### Page registry

Добавлена/обновлена страница `task-tz.html` — единая панель 30 функциональных ТЗ с programmer/QA handoff. Она покрывает G1–G6 и выделяет O1/O2/O7/O8 как принятые owner/admin settings, вынесенные в отдельную разработку админ-панели.

`page_status: local_review_ready`
`product_status: functional_tz_complete_runtime_open`

### Backend handoff

Панель полезна как навигация для реализации, но ее статусы не являются runtime proof. Для backend/QA остаются обязательными проверки:

- G1: отдельная консультация, роли, доступ агента только к назначенным анкетам, audit и уведомления;
- G2: цена, баланс, таймер, остановка, возврат и начисление по конкретной консультации;
- G3: реальные данные каталога, карточки экспертов, подбор и объяснимая ротация;
- G4: создание support case, связь с консультацией, решение и outcome;
- G5: события, дашборд и допуск маркетинга только после подтвержденных данных;
- G6: назначение, SLA, качество, обучение и допуск команды.

Отдельно сохранить правило: `30/30 functional TZ` = полнота описания и передачи, а не `implemented` и не `launch_ready`.

### Marketing notes

Новая панель не дает права запускать рекламу. До marketing gate нужно доказать рабочий клиентский путь, оплату/остановку, support/refund, назначение и качество. Внешние обещания нельзя строить на процентах готовности ТЗ.

### Codex implementation notes

- Использовать `task-tz.html` как карту handoff и acceptance dependencies.
- Не переводить `tzReady: 100` в runtime-ready автоматически.
- Сначала закрывать P0 с runtime-open: G1.1/G1.2/G1.3, G2.1/G2.2/G2.3, G4.1/G4.2 и зависимости G6.
- O1/O2/O7/O8 считать отдельным admin-settings workstream; не смешивать его с доказательством клиентского flow.

### PM knowledge notes

Подтвержден новый управленческий вывод: документирование функционала теперь собрано в единой панели, но фактический прогресс по продукту должен читаться по runtime acceptance, owner policy и связному proof. На текущем источнике отдельно видны gaps по backend guard для агента, service_session, начислениям, support runtime и допуску рекламы.

### Proof / blocker update

- Новый локальный источник: `task-tz.html`.
- Существующая связь с мастер-планом: `index.html` и `task-details.html`.
- Статус PM: `new_local_pm_evidence`, не promotion.
- Блокер не изменился по сути: runtime proof и owner/legal decisions остаются открытыми; ссылки на внешние/связанные proof-пакеты нужно проверить отдельным bounded pass.

`next_action: bounded QA по P0 runtime-open задачам, начиная с G1.2 role/access guard и G2/G4 payment-support boundaries`

## Delta 2026-07-22: owner/admin settings in functional TZ

### Page registry

`task-tz.html` обновлен как текущая локальная панель функциональных ТЗ. В ней теперь явно отмечены принятые owner/admin settings: `O1/O2/O3/O6/O7/O8/R1/P1`. Это не новая клиентская страница, а расширение handoff-контуров G1–G6.

### Backend handoff

В панели зафиксированы требования к управляемым настройкам:

- SLA: ответ поддержки 15 минут, paid decision/first response 60 секунд, обычная эскалация 2x, critical — immediate;
- quality: max 100, pass 80, critical-fail/prohibited registry и отдельная safety-сигнализация;
- billing: USD, global 30 credits/minute, starter 9.99 USD → 60 credits, управляемые credit packages/discounts; package не продает фиксированные минуты;
- training: versioned re-admission и защищенный Trust & Safety workflow.

Эти значения являются owner/admin requirements из локального handoff. Их нельзя считать работающей бизнес-логикой, пока нет server-side persistence, прав доступа, audit и runtime positive/negative proof.

### Marketing notes

Конкретные цены и SLA теперь нельзя трактовать как публичное обещание: они зафиксированы для admin-managed configuration и требуют подтверждения на клиентской поверхности, в письмах и support wording. Реклама остается заблокированной до связного runtime proof.

### Codex implementation notes

- Развести `accepted admin setting` и `runtime accepted` в статусах и UI.
- Проверить immutable/versioned snapshot для цены, тарификации, SLA и quality policy.
- Для каждого значения нужны positive case, negative case, rollback и audit trail.
- Не поднимать процент готовности сайта только из-за принятого значения в ТЗ.

### PM knowledge notes

Новый источник усиливает модель `settings-first`: владелец сначала управляет правилами через админ-контур, затем команда доказывает их применение в консультации. Самые критичные связи: G1 session/chat → G2 billing → G4 support/refund → G5 quality/marketing gate → G6 admission.

### Proof / blocker update

- Свежий локальный источник: `task-tz.html`.
- Ожидаемый связанный пакет `H:\GPT-Codex\reports\six-goals-functional-tz-2026-07-20` локально не найден; ссылки на него в панели требуют восстановления или корректировки.
- Статус: `owner_settings_recorded_runtime_acceptance_open`.

`next_action: проверить наличие и build mapping связанных TZ-пакетов, затем провести P0 runtime walkthrough по G1/G2/G4/G6`

## Delta 2026-07-24: Zodiac Compatibility, responsive header 992

### Page registry

Обновлен локальный артефакт `H:\Nebula\GPT\_unzipped\zodiac-compatibility-new.html`. На ширине 992 px страница использует внешний `Open menu` и drawer `#navbarOffcanvas`; это реальное интерактивное состояние публичной страницы, а не отдельный продуктовый flow.

`page_status: fresh_local_source_reviewed`
`interaction_status: 992_header_defect_open`
`acceptance_status: not_accepted`

### Frontend handoff

В текущем source дефект не закрыт:

- drawer включен page-owned CSS до `1199.98px`;
- общий shell скрывает `.site-header__offcanvas-top` начиная с `992px`;
- стили `.site-header__offcanvas-close` применяются только до `991.98px`;
- `home.js` обрабатывает scroll lock/unlock, но не содержит явного возврата фокуса к точному opener.

На 992 px меню может перейти в `show`, но пользователь не получает видимую operable кнопку закрытия; полный цикл `open -> close -> focus return` не доказан. Это frontend/shared-header defect, backend не требуется.

### Marketing notes

Изменение не влияет на маркетинговые обещания и не дает readiness. Неработающее закрытие меню на 992 px остается препятствием для пользовательской приемки публичной страницы.

### Codex implementation notes

- Исправлять в source-backed shared-header/component boundary, не отдельным визуальным костылем страницы.
- Сохранить 1200 desktop и поведение 768/576/320.
- Проверить pointer и Enter/Space для opener, видимый close, `aria-expanded false -> true -> false`, закрытие и возврат фокуса.
- Escape/outside-click не добавлять без подтвержденного shared-header contract.
- После ремонта нужен runtime regression proof на 1200/992/768/576/320.

### PM knowledge notes

Свежая сборка подтверждает, что наличие close-кнопки в HTML не является доказательством доступного действия: breakpoint cascade скрывает управляющий элемент ровно на 992 px. PM-решение остается прежним: это реальный responsive-header interaction defect, а не source debt и не backend blocker.

### Proof / blocker update

- HTML control: `H:\Nebula\GPT\_unzipped\zodiac-compatibility-new.html:36`.
- Shared shell conflict: `H:\Nebula\GPT\_unzipped\zodiac-compatibility-new.00-shell-home-bundle.css:156-173`.
- Page drawer range: `H:\Nebula\GPT\_unzipped\zodiac-compatibility-new.05-mobile-drawer-expert.css:258-294`.
- Runtime support code: `H:\Nebula\GPT\_unzipped\home.js:38-47`.

`next_action: source-backed repair общего responsive header и пятиширинный runtime regression proof`

## Delta 2026-07-26: Zodiac FAQ icon cascade candidate

### Page registry

Появился новый локальный proof-пакет `zc-faq-shell-icon-cascade-source-authority-029`. Он относится к FAQ на публичной странице Zodiac Compatibility, но не меняет product/runtime-файлы.

`artifact_status: independent_challenge_pass`
`page_status: not_accepted`
`pageReady: false`
`product_mutation: false`

### Frontend handoff

Пакет доказывает узкую безопасную трансформацию общего CSS:

- удалить ровно 6 конфликтующих selector/declaration tuples для FAQ plus/cross icons;
- не добавлять новых деклараций;
- сохранить байты вне целевого семейства;
- сохранить статическую семантику `closed -> open -> switch -> reclose` на 1200/992/768/576/320.

Это generator/source-authority proof. Для применения к странице требуется отдельное решение и последующая runtime-проверка. Предыдущий 992 px responsive-header defect остается открытым, поскольку product-файлы не изменялись.

### Marketing notes

Пакет не меняет пользовательское предложение, контент, CTA или launch readiness. Его нельзя учитывать как прогресс по маркетингу либо готовность страницы.

### Codex implementation notes

- Использовать только замороженную six-row transformation с `outside_family_delta: 0`.
- Не переносить вывод на другие CSS-семейства: parser source-specific.
- После возможного применения проверить FAQ в runtime: initial open item, open/close/switch/reclose, keyboard/focus, `aria-expanded`, визуальный результат на пяти ширинах.
- Не смешивать FAQ-icon repair с исправлением responsive header на 992 px.

### PM knowledge notes

Новый пакет закрывает только вопрос о корректности генератора и границах CSS-изменения. Он не является доказательством runtime, accessibility, Figma parity, Caster/Anton acceptance или готовности страницы.

### Proof / blocker update

- Candidate closeout: `H:\Nebula\GPT\artifacts\zc-faq-shell-icon-cascade-source-authority-029\candidate\OWNER-029-CLOSEOUT.md`.
- Independent verifier: `H:\Nebula\GPT\artifacts\zc-faq-shell-icon-cascade-source-authority-029\independent-verifier-sol-high-019f9ae0-5cff-7153-b8d3-a3c6314c73ae\VERIFIER-CLOSEOUT.md`.
- Проверено: 6 удалений, 0 добавлений, 0 изменений вне семейства; fixtures 12/12; protected preimages 12/12.
- Не проверено: browser runtime, AX, Figma visual acceptance, Caster/Anton acceptance.
- Общий Nebula knowledge-verifier: 229 checks passed, 9 failed из-за отсутствующих локальных файлов корпуса `nebula-expert-training-source-recovery-2026-07-16`; это отдельный knowledge-source blocker, не дефект FAQ candidate.

`next_action: отдельное решение о применении candidate; после применения — runtime/AX/visual proof FAQ на пяти ширинах, без закрытия 992 header defect`

## Delta 2026-07-26: global public-page layout-quality wave

### Page registry

В локальном Oracle/Nebula-контуре выполнен крупный технический проход по публичным страницам. Обновлены HTML/CSS/JS и созданы отдельные layout-quality пакеты для Home, FAQ, Blog, Privacy Policy, Phone Psychic, Palm Reading, Aura Reading, Tarot Reading, Love Reading, All Psychics, Blog Input, Cheap Psychic, Psychic Reading и Taurus Compatibility.

Текущая управленческая классификация:

| Группа | Страницы | Статус |
|---|---|---|
| Технический layout gate пройден, приемка открыта | All Psychics, Aura Reading, Blog Input, Cheap Psychic, Love Reading, Palm Reading, Psychic Reading, Tarot Reading, Taurus Compatibility | `technical_layout_ready_not_accepted` |
| Нужен независимый visual/product challenge | Privacy Policy | `layout_ready_for_challenge_not_accepted` |
| Архитектура исправлена после первоначального blocker | Blog, Phone Psychic | latest strict report: `strict_quality_ready`; отдельная итоговая приемка не доказана |
| Архитектура готова, но exact C76 source отсутствует | About Us, Contact Us | `source_missing_not_accepted` |
| Shared-header/architecture debt остается | Zodiac Compatibility | current strict report: `fail`; 992 px close/focus defect остается открытым |
| Базовый strict architecture gate пройден, acceptance proof не найден | Home, FAQ | `strict_quality_ready`; не `pageReady` |

Ни одна из страниц в этой волне не получила `accepted_1to1`, Caster/Anton acceptance, platform AX, production readiness или promotion.

### Backend handoff

Волна касается публичной верстки и общего frontend shell. Она не доказывает backend-интеграцию экспертов, цен, статусов, чата, поминутной тарификации, support или `service_session`. При натягивании дизайна на backend нужно сохранить page-owned CSS boundaries и повторить user-flow proof уже с реальными данными.

### Marketing notes

Новые страницы можно использовать как более зрелую локальную визуальную основу, но не как основание для запуска рекламы. Marketing gate остается привязан к рабочему клиентскому пути, реальным карточкам экспертов, цене, консультации, оплате/остановке, support и аналитике.

### Codex implementation notes

- Не переводить `technical_layout_ready` или `strict_quality_ready` в `pageReady`.
- Для каждой страницы нужен независимый visual/product challenge и текущий пятиширинный proof после последней мутации.
- Для Blog и Phone Psychic использовать только latest after-architecture-repair reports; первоначальные fail-отчеты сохранять как pre-repair evidence.
- About Us и Contact Us не принимать визуально без exact C76 source.
- Zodiac Compatibility чинить отдельным shared-header/owner pass; не смешивать с уже закрытыми page-local layout пакетами.
- Bootstrap CSS 4.6.2 / JS 4.1.3 остается общим runtime watch и не должен исправляться внутри отдельной страницы.

### PM knowledge notes

Фронтенд существенно продвинулся по ширине покрытия: большинство публичных страниц теперь имеют локальные пятиширинные проверки и чистый owner-boundary. Главный оставшийся разрыв — между технической версткой и продуктовой готовностью: backend data binding, реальные интерактивные сценарии, accessibility, независимая визуальная приемка и launch flow пока не закрыты.

### Proof / blocker update

- Global audit: `H:\Nebula\GPT\artifacts\global-layout-quality-audit-20260726`.
- Ranking snapshot: `H:\Nebula\GPT\artifacts\global-layout-ranking-035\20260726-040851\ranking.json`; это промежуточный снимок до части последующих repairs, не текущая приемка.
- Architecture triage: `H:\Nebula\GPT\artifacts\remaining-pages-layout-triage-043\architecture-triage.json`.
- Page closeouts: `H:\Nebula\GPT\artifacts\*-layout-quality-0*\*-CLOSEOUT.md`.
- Открыто: Caster/Anton visual-product acceptance, platform AX, backend-integrated user flows, exact source для About/Contact, Zodiac architecture/header defect.

`next_action: принять волны по одной странице через current five-width visual/product/AX gate; параллельно не терять основной backend integration backlog G1-G6`

## Delta 2026-07-26: global family/state acceptance challenge

### Page registry

Создан глобальный acceptance-пакет для 17 публичных страниц. Owner closeout заявил готовность технического layout/route contour, но независимый Sol/high challenge отклонил портфельный technical pass.

`global_status: challenge_rework_required_no_promotion`
`page_acceptance: not_accepted`
`pageReady: false`
`promotion: false`

Подтверждено:

- 17/17 страниц проходят static strict architecture gate без failures и quality debt;
- 19/19 verifier regression cases пройдены;
- 1 239 локальных ссылок проверены, missing routes = 0;
- 17/17 headers имеют статически согласованные opener semantics;
- FAQ DOM-unit честно показывает 1 доступный ответ и 16 недоступных вопросов.

Не принято независимым challenge:

- портфельная technical readiness;
- заявленные 85/85 browser-contained states;
- Caster conditional visual acceptance;
- полнота exact rollback;
- pageReady, publication или promotion.

### Frontend handoff

Требуется proof-only rework:

- пересобрать пятиширинную runtime matrix на текущих 195 source identities;
- проверять containment по `documentElement.scrollWidth <= documentElement.clientWidth`;
- исправить или доказать 10 проблемных строк на 320 px: Home и девять страниц с `320/301`;
- добавить exact preimages/rollback для измененных `all-psychic-new.html`, `tarot-reading-new.html`, `zodiac-compatibility-new.html`;
- включить immutable visual evidence, если сохраняется Caster claim.

Текущий Zodiac proof не закрывает страницу: CTA находится в flow, но `h1NoClip=false` зафиксирован на 1200/992/576, а 992 px header lifecycle должен быть перепроверен на финальном source.

### Backend handoff

Новая волна не меняет основной backend backlog G1-G6. Она добавляет два конкретных product-input blocker для публичного контура:

- FAQ: источник содержит только 1 ответ на 17 вопросов;
- Contact Us: 3 поля не входят в форму, submit contract отсутствует, `support@neuro.example` является placeholder.

До выбора реального support endpoint/email и обработки формы нельзя связывать Contact Us с G4 support flow.

### Marketing notes

Реклама и публичный launch остаются заблокированы. Нельзя направлять трафик на Contact Us с неработающей отправкой и placeholder email или считать FAQ готовым при 1/17 ответов. Route integrity без product truth не является conversion readiness.

### Codex implementation notes

- Использовать independent challenge как актуальный верхний verdict; owner technical closeout не повышает readiness.
- Не исправлять отсутствующий FAQ/Contact content через выдуманный текст или фальшивый endpoint.
- Повторить runtime/visual proof после фиксации текущих байтов, а не переиспользовать R5 evidence.
- Static header ARIA contract не заменяет keyboard/runtime/platform AX acceptance.
- About Us и Contact Us остаются без exact five-width Figma authority.

### PM knowledge notes

Техническая консолидация действительно сократила CSS/route debt, но выявила границу между «код стал чище» и «продукт готов». Главные текущие фронтовые blockers теперь предметные: мобильное containment, доказуемость финальной сборки, support transaction truth, полный FAQ content, exact source About/Contact и platform AX.

### Proof / blocker update

- Owner closeout: `H:\Nebula\GPT\artifacts\global-layout-family-state-acceptance-20260726\R6-R1-ACCEPTANCE-CLOSEOUT.md`.
- Caster/Anton review: `H:\Nebula\GPT\artifacts\global-layout-family-state-acceptance-20260726\CASTER-ANTON-R6-REVIEW.md`.
- Independent challenge: `H:\Nebula\GPT\artifacts\global-layout-family-state-acceptance-20260726\sol-high-independent-challenge-r6-r1-20260726\01-SOL-HIGH-R6-R1-CHALLENGE-CLOSEOUT.md`.
- Anton product verdict подтвержден: `blocked`.
- Общая knowledge-quality оговорка по 9 отсутствующим training-source файлам остается открытой отдельно.

`next_action: proof-only rebuild current-source runtime matrix и rollback/visual freeze; затем повторный independent challenge без изменения product truth`

## Delta 2026-07-26: R2 source-owner repair

### Page registry

После R6-R1 challenge выполнен R2 source-owner repair. Независимая exact-byte проверка признала ремонт технически корректным.

`repair_status: challenge_pass_source_owner_repair_technically_sound`
`final_runtime_17x5: pending`
`final_visual_17x5: pending`
`page_acceptance: not_accepted`
`promotion: false`

### Frontend handoff

Причины десяти 320 px containment failures устранены в 12 точных owner-файлах:

- девять `body min-width: 320px` заменены на `min-width: 0`;
- Phone и Cheap переведены с page-band `100vw` на container-relative `100%`;
- Blog pagination получила bounded width;
- Home carousel overflow ограничен на уровне owning section.

Документальный overflow mask не добавлялся. Outside-scope drift = 0; CSS rollback 12/12 и late HTML rollback 3/3 доказаны. Однако это static/exact-byte proof, а не browser acceptance.

### Backend and marketing notes

Backend backlog и marketing gate не изменились. FAQ 1/17, Contact Us без submit contract и с placeholder email, source missing About/Contact и platform AX остаются блокерами независимо от исправления CSS owners.

### Codex implementation notes

- Считать R2 актуальным source-repair verdict, который supersedes R6-R1 rework по десяти width discrepancies.
- Не утверждать, что overflow исправлен в runtime, пока нет свежей current-source 17×5 matrix.
- Не использовать исторические R5 screenshots как post-repair visual proof.
- После fresh runtime/visual matrix отдельно провести Caster и Anton gates.
- Fortune Reading order 15 не включать в текущие 17 страниц: exact source coverage остается `0/5`.

### Proof / blocker update

- Owner R2: `H:\Nebula\GPT\artifacts\global-layout-family-state-acceptance-20260726\r6-r2-proof-rework\R2-SOURCE-OWNER-REPAIR-CLOSEOUT.md`.
- Independent R2: `H:\Nebula\GPT\artifacts\global-layout-family-state-acceptance-20260726\sol-high-independent-challenge-r2-source-repair-20260726\01-SOL-HIGH-R2-SOURCE-REPAIR-CHALLENGE-CLOSEOUT.md`.
- Технически подтверждено: 195/195 source identity, 12 owner changes, 17/17 strict rows, 19/19 regression.
- Открыто: fresh runtime containment 17×5, current visual 17×5, human visual review, platform AX и product acceptance.
- Отдельный source blocker: Fortune Reading order 15, exact five-width authority `0/5`.

`next_action: governed current-source runtime/visual 17x5; затем независимые Caster/Anton gates без предварительного повышения page_acceptance`

## Delta 2026-07-27: incomplete R7 current-source capture

### Page registry

Начат R7 current-source runtime/visual capture, но terminal proof не сформирован.

`capture_status: incomplete_no_terminal_receipt`
`captured_pages: 2/17`
`captured_rows: 10/85`
`interaction_receipts: 0/17`
`page_acceptance: not_accepted`

### Evidence and blocker

В R7 присутствуют по пять скриншотов только для Home и Psychic Reading. Файл `CURRENT-SOURCE-RUNTIME-VISUAL.json`, итоговая summary и interaction receipts отсутствуют. Причина незавершения по локальным артефактам не доказана.

- Packet: `H:\Nebula\GPT\artifacts\global-layout-family-state-acceptance-20260726\r7-current-source-runtime-visual-20260726`.
- Capture script: `run-current-source-17x5.mjs`.
- Existing screenshots: 10.

### PM decision

R7 не заменяет R2 independent verdict и не закрывает runtime/visual gate. Backend, marketing и product blockers остаются без изменений. Нельзя частично принимать Home или Psychic Reading из этого пакета без terminal row data, interaction receipt и current-source binding.

`next_action: завершить governed 17x5 capture с 85 rows, 17 interaction receipts и terminal JSON; затем проверить exact source binding и только после этого запускать Caster/Anton`

## Delta 2026-07-27: G1.1 service session specification and admin mockup

### Page registry

В 6-goals master-plan добавлен отдельный интерактивный макет админ-карточки одной консультации:

`g11-consultation-admin-mockup.html`

Макет показывает staff-поверхность G1.1 для super-admin, support/moderator и agent, а также состояния `paid active`, `balance pause`, `technical end`, `completed`. Все действия, которые требуют backend, явно помечены как demo; сама страница прямо сообщает, что не является доказательством backend/runtime.

`artifact_status: interactive_product_mockup`
`backend_status: not_proven`
`runtime_status: fail_not_acceptance_ready`

### PM/spec status

Для G1.1 созданы и локально доступны:

- продуктовое ТЗ для Игоря `tz-g1-1-for-igor.html`;
- технический контекст `codex-context-g1-1-service-session.md`;
- 12-критериальный standard/gate;
- 26 атомарных positive/negative acceptance cases.

Текущая корректная классификация:

- `spec_completeness: 100%`;
- `hard_gates: pass`;
- `owner_policy_closure: closed_for_G1.1`;
- `implementation_status: code_present_unmapped`;
- `runtime_acceptance: fail_not_acceptance_ready`.

`service_session` на live-сайте по-прежнему не реализован как отдельная сущность; подтвержден только базовый чат.

Связанный G1.2 также получил полный двухфайловый handoff:

- `etalon-tz-g1-2-role-chat.md`;
- `codex-context-g1-2-role-chat.md`;
- `tz-g1-2-for-igor.html` и DOCX.

Его корректный статус: `spec_handoff_ready`, implementation/runtime требуют подтверждения на выбранном build.

### Backend handoff

Программисту нужно:

- сопоставить существующий код с конкретным build/commit и controller/application integration;
- реализовать lifecycle `request -> accept -> connecting -> trial -> consent -> paid -> pause/reconnect -> end`;
- связать session с dialog/messages, client, public expert profile, actual agent, assignment snapshot, pricing/events/support;
- доказать role ACL, duplicate/idempotency guards, persisted audit/readback и negative cases;
- вернуть проверяемую сборку для независимого QA.

Макет задает состав экрана и желаемое поведение, но не диктует техническую реализацию и не повышает готовность сайта.

### Marketing notes

Изменение не открывает marketing gate. До runtime proof нельзя обещать отдельную консультационную сессию, paid lifecycle, баланс-паузу, audit или support linkage как работающие функции.

### Codex implementation notes

- Хранить отдельно три метрики: completeness ТЗ, implementation status, runtime acceptance.
- Не считать demo state selector и demo transitions сохраненными backend-событиями.
- Использовать 26 acceptance cases как минимальный QA contract после mapped build.
- Синхронизировать `task-readiness.html`: там G1.1 все еще отображается как `tzReady: 95`, тогда как `index.html` и `task-tz.html` уже используют новый подтвержденный spec score `100`.
- Устранить аналогичный конфликт G1.2: `task-tz.html` показывает 100%, `task-readiness.html` — 90%, а `index.html` одновременно содержит 100% и legacy/pending-audit wording.

### PM knowledge notes

G1.1 теперь является эталонным execution-ready PM package, но не готовой функцией. Главный следующий управленческий переход — не дописывание концепции, а получение scope/build от программиста и доказательство lifecycle/ACL/audit на runtime.

### Proof / blocker update

- Mockup: `H:\GPT-Codex\Confideline\web\qa-reports\nebula-6-goals-master-plan-2026-06-11\g11-consultation-admin-mockup.html`.
- Product TZ: `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\tz-g1-1-for-igor.html`.
- Codex context: `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\codex-context-g1-1-service-session.md`.
- G1.2 product/Codex handoff: `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\etalon-tz-g1-2-role-chat.md` и `codex-context-g1-2-role-chat.md`.
- Master index correctly retains acceptance blockers and progress 30%.
- PM data-consistency blocker: G1.1/G1.2 spec scores and audit wording расходятся между `task-tz.html`, `task-readiness.html` и `index.html`.

`next_action: синхронизировать G1.1/G1.2 readiness statuses, получить mapped build/scope от Игоря и прогнать G11-A01-G11-A26 без повышения статуса по макету или одному commit`

## Delta 2026-07-27: G1.3 status/history handoff and Home source drift

### PM/spec status

Для G1.3 «Статусы и история консультации» сформирован полный handoff:

- `etalon-tz-g1-3-status-history.md`;
- `codex-context-g1-3-status-history.md`;
- `tz-g1-3-for-igor.html` и DOCX;
- `product-architecture-g1-g6-ownership-map.md`;
- verifier `Test-FunctionalTzStandardG13.ps1`.

Verifier прошел `78/78`. Поэтому корректная классификация G1.3:

- `spec_completeness: 100%`;
- `spec_handoff: ready`;
- `implementation_status: not_runtime_verified`;
- `runtime_acceptance: not_run`;
- `site_readiness: unchanged`.

Спецификация разделяет постоянный бесплатный dialog, pre-session `consultation_request` и одну принятую `service_session`; это продуктовый контракт, а не доказательство наличия этих сущностей на текущем сайте.

### Readiness consistency

Панели пока расходятся:

- `task-tz.html` после локального override показывает G1.3 как `etalon_spec_ready_runtime_open`, `tzReady: 100`;
- `index.html` показывает G1.3 `tzReady: 100`;
- `task-readiness.html` остается на legacy `accepted_bounded_slice`, `tzReady: 65`.

Это data-consistency blocker интерфейса мастер-плана, а не дефект самого G1.3 ТЗ.

### Oracle/Home source drift

После R2 source freeze изменены три файла Home:

- `home.html`: 102369 -> 103357 bytes, SHA-256 изменен;
- `home.owner.02.css`: 41589 -> 42971 bytes, SHA-256 изменен;
- `home.js`: 8610 -> 13760 bytes, SHA-256 изменен.

Последние изменения датированы 27.07.2026 15:45-17:35. R2 identity был сформирован раньше, 26.07.2026. Следовательно:

- R2 source identity больше не описывает текущий Home;
- 5 Home screenshots из незавершенного R7 нельзя использовать как current-source proof;
- R7 по-прежнему содержит только 10/85 screenshots, 0/17 interaction receipts и не имеет terminal manifest;
- визуальная, interaction и product acceptance Home остаются открыты.

### Backend handoff

G1.3 можно передавать в реализацию только вместе с G1.1/G1.2 boundaries. Программист должен вернуть mapped build и доказать request lifecycle, one-request/one-session guards, idempotency, persisted state history, role-safe readback и negative cases. До этого статусы и история остаются спецификацией.

### Marketing notes

Новых разрешенных обещаний нет. Нельзя заявлять клиенту работающие статусы консультации, историю переходов, ожидание/reconnect или balance pause до runtime acceptance.

### Codex implementation notes

- Синхронизировать G1.3 между `task-tz.html`, `task-readiness.html` и `index.html`.
- Не распространять `tzReady: 100` на задачи, которые не прошли отдельный standard verifier.
- Пересобрать source identity после стабилизации Home.
- Удалить из будущего R7 stale Home evidence и повторить Home 5-width capture плюс interaction receipt на текущих исходниках.
- Не запускать Caster/Anton final acceptance по частичному R7.

### Proof refs

- `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\Test-FunctionalTzStandardG13.ps1` -> `pass`, 78/78.
- `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\etalon-tz-g1-3-status-history.md`.
- `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\codex-context-g1-3-status-history.md`.
- `H:\Nebula\GPT\artifacts\global-layout-family-state-acceptance-20260726\global-family-state-acceptance-r2-source-repair-freeze\03-active-source-identity-r2.json`.
- `H:\Nebula\GPT\artifacts\global-layout-family-state-acceptance-20260726\r7-current-source-runtime-visual-20260726`.

`next_action: синхронизировать G1.3 readiness, стабилизировать Home, пересобрать current-source identity и заново выполнить полный R7 с 85 screenshots, 17 interaction receipts и terminal manifest`

## Delta 2026-07-28: human handoff proof for G1.1-G1.3

### PM/spec status

Пакеты первых трех задач глобального чата обновлены в человекочитаемом формате:

- G1.1: HTML/DOCX, 10-страничный render smoke;
- G1.2: HTML/DOCX, 12-страничный render smoke;
- G1.3: HTML/DOCX, 13-страничный render smoke.

Текущие независимые проверки:

- G1.1: `pass`, 115/115 checks, 26 acceptance cases;
- G1.3: `pass`, 80/80 checks;
- PDF render logs присутствуют, все ожидаемые страницы созданы.

Это подтверждает пригодность документов для передачи человеку, но не реализацию функций.

### Product and backend boundary

Статусы не повышаются:

- G1.1: `code_present_unmapped`, runtime acceptance `fail_not_acceptance_ready`;
- G1.2: `spec_handoff_ready`, mapped build/runtime proof отсутствуют;
- G1.3: `spec_handoff_ready`, runtime acceptance `not_run`.

`service_session`, lifecycle консультации, role chat и persisted status history остаются целевыми контрактами до доказательства на выбранной сборке.

### Master-plan consistency

`task-tz.html` обновлен и показывает G1.3 как `spec_handoff_ready_runtime_open` / 100% ТЗ. Однако `task-readiness.html` по-прежнему хранит legacy G1.3 `accepted_bounded_slice` / 65%. Конфликт readiness-панелей не закрыт.

### Oracle/Nebula watch

После предыдущего heartbeat новых изменений в `_unzipped` и новых terminal acceptance artifacts R7 не найдено. Зафиксированный Home source drift и неполный R7 остаются блокерами current-source visual proof.

### PM decision

Документы G1.1-G1.3 можно использовать для постановки работы программисту. Нельзя использовать document verifier или PDF render как доказательство backend, runtime либо допуска рекламы.

`next_action: синхронизировать readiness-панели, получить mapped build для G1.1-G1.3 и прогнать lifecycle/ACL/history acceptance; отдельно завершить новый current-source R7 для Oracle/Home`

## Delta 2026-07-28: G1.2 final check and G1.4 notification specification

### PM/spec status

G1.2 «Чат по ролям» повторно собран и проверен:

- `spec_completeness: 100%`;
- verifier: `pass`, 81/81;
- `implementation_status: open_until_mapped_build`;
- `runtime_acceptance: open_until_positive_negative_QA`.

Для G1.4 «Уведомления консультации» создан новый полный handoff:

- `etalon-tz-g1-4-chat-notifications.md`;
- `codex-context-g1-4-chat-notifications.md`;
- `tz-g1-4-for-igor.html` и DOCX;
- отдельная карточка задачи в мастер-плане;
- verifier: `pass`, 116/116.

Корректный статус G1.4: `specification ready / implementation and runtime open`.

### Product boundary

G1.4 описывает более широкий операционный контур, чем ранее подготовленная клиентская email-карта:

- клиентская email-карта остается ограниченной клиентом, сайтом, email и in-app;
- G1.4 покрывает client, expert, agent и super-admin как получателей событий консультации;
- Telegram, SMS и push в этот handoff не добавлены;
- Email Templates владеет текстами писем, а G1.4 владеет событием, получателем, каналом, задержкой, quiet hours, retry, retention и привязкой шаблона.

Эти два артефакта нельзя смешивать: клиентская карта нужна для клиентского пути, G1.4 — для полной реализации доставки по ролям.

### Defined policy requiring runtime proof

В спецификации зафиксированы:

- обязательная in-app запись для каталожных событий;
- optional email после 300 секунд непрочитанного сообщения;
- mandatory email после 60 секунд подтвержденного отсутствия для критического события;
- deduplication, retry, stale guards и delivery log;
- стартовый retention delivery metadata 90 дней;
- super-admin как стартовый владелец правил и критических сигналов.

Retention и обязательные коммуникации остаются под legal/privacy release gate. Ни одно из этих правил пока не подтверждено на рабочей сборке.

### Existing implementation boundary

В исходниках и текущем UI подтверждены отдельные части notification contour: notification manager, in-app records/categories, email preferences, notification center, email queue и Email Templates. Полный event catalog G1.4, role-safe delivery, admin rules, dedup/concurrency, retries и delivery audit не подтверждены.

### Master-plan consistency

`task-tz.html` и `index.html` показывают G1.4 как 100% ТЗ с открытым runtime. `task-readiness.html` остается на legacy 55% и старом названии «Уведомления чата». Аналогичное расхождение G1.2 сохраняется: 100% в основном контуре против legacy 90/95% в readiness-панели.

### Oracle/Nebula watch

Новых изменений страниц `_unzipped` и новых terminal R7 artifacts за период не найдено. Home source drift и неполный current-source visual/interaction proof остаются без изменений.

### PM decision

G1.2 и G1.4 готовы для постановки реализации, но не для приемки продукта или рекламы. Следующий полезный шаг — mapped build, event/source mapping и сквозные positive/negative/concurrency/privacy тесты, а не дальнейшее расширение документа.

`next_action: синхронизировать G1.2/G1.4 readiness-панели; передать Игорю четыре G1 handoff-пакета как единый контур; получить mapped build и доказать chat/session/status/notification flow без повышения runtime-статуса по verifier ТЗ`
