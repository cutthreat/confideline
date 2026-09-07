# Caster: готовность клиентского пути к платному трафику

Дата: 7 сентября 2026. Роль: независимый review-only Caster. Область: G3 и клиентские/операционные зависимости G4–G6; рекомендации к четырёхмесячному плану. Реализация, публикация и финальный GO остаются у владельцев проекта.

## Вердикт

**Критический путь ещё не принят для платного трафика.** Существующая работа по вёрстке и платному чату сохраняет свою ценность. Следующий результат — интегрировать и принять один работающий клиентский путь на выбранной боевой сборке, затем расширять покрытие. Новый дизайн или повторная сборка принятых экранов для этого не требуются.

`review_status: completed_source_review_with_runtime_gaps`

`visual_verdict: unverified_pending_current_host_screenshots`

`typographic_verdict: unverified; no_fresh_computed_style_or_matching_source_comparison`

`UX_verdict: acceptance_requirements_defined; expert_proxy_only`

`marketing_verdict: measurement_unavailable; paid_traffic_GO_not_supported`

`conformance_not_claimed`; screen-reader и participant evidence в этом review отсутствуют. Текущий браузер продукта этим reviewer не управлялся. Экранные снимки старых версий не выданы за проверку 7 сентября. Cold pass не выполнялся; источники и намерение уже известны, поэтому будущий просмотр этим reviewer будет `intent_contaminated`.

## Что действительно найдено

| Источник и дата | Подтверждённый результат | Граница |
|---|---|---|
| Nebula `PROJECT-PROGRESS-LEDGER.md`, запись 07.09 «layout contour audit» | 66 страниц / 330 строк покрытия; 89 exact и 241 pending; 52 static preview-ready, 13 dependency/route preparation gaps, 1 integrated Yii2 route | Это inventory/layout evidence, не 52 готовые боевые страницы. В той же записи canonical 4180 integrated expert route возвращает 404; старый task-host не заменяет текущий host |
| Тот же ledger, 31.08 | 322 source rows / 30 routes; 64 unit и 106 matrix checks; отдельные keyboard/route-map улучшения | Native/PHP-render/five-width/PM–Caster–Anton приёмка соответствующих остатков не завершена |
| `02-NEBULA-PRODUCT-KNOWLEDGE.md`, 07.09 | Demo paid-chat/lifecycle/media/history и sandbox top-up уже тестировались; current runtime не перепроверен | Нет основания обнулять выполненную разработку; нет основания переносить её PASS на весь публичный путь |
| `G3-OWNER-ANSWERS-AND-PM-PROPOSALS-2026-08-18.md` | Географический вход, самостоятельный выбор, школа до допуска, подтверждённые доступность/ставка, явный общий fallback, operator Start | Это действующие продуктовые решения; референсные макеты не вправе их переопределять |
| `etalon-tz-g3-int-layout-backend-integration.md` и парный technical context | Восемь G3 surfaces, shared shell/auth, реальные owners, I18N, loading/empty/stale/error/degraded, limited rollout и rollback описаны | G3.INT — связанный implementation package, не 31-я бизнес-задача; финальная проверка принадлежит G3.5 |
| `codex-context-g4-g6-implementation.md` + три domain-ТЗ | Разделены case/decision, финансовое исполнение, клиентские уведомления, staff alerts, admission, assignment, SLA и RBAC | Наличие требований не доказывает работающую production-операцию |

Публичный аудит 26.08 с YouDate/How-it-works 404 является историческим baseline. Его нельзя называть новым результатом 07.09 без текущей проверки.

Локальные документы, упомянутые в review, не являются опубликованными страницами этого отчёта. Их расположение сохранено для воспроизводимой проверки; доступность через GitHub Pages не заявляется:

- локальный источник: `F:\CodexProjects\confideline-nebula\canonical\nebula\PROJECT-PROGRESS-LEDGER.md`;
- локальный источник: `F:\CodexProjects\confideline-nebula\canonical\nebula\knowledge\master-bank\02-NEBULA-PRODUCT-KNOWLEDGE.md`;
- локальный источник: `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\G3-OWNER-ANSWERS-AND-PM-PROPOSALS-2026-08-18.md`;
- локальный источник: `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\etalon-tz-g3-int-layout-backend-integration.md`;
- локальный источник: `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\codex-context-g3-int-layout-backend-integration.md`;
- локальный источник: `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\codex-context-g3-5-client-path-qa.md`;
- локальный источник: `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\codex-context-g4-g6-implementation.md`;
- локальный источник: `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\tz-g4-support-disputes-rules.md`;
- локальный источник: `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\tz-g5-events-kpi-launch.md`;
- локальный источник: `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\tz-g6-assignment-sla-quality-access.md`.

## Продуктовая задача и маршрут

- Page type: входная страница консультационного сервиса → каталог/профиль → транзакционный путь → история/поддержка.
- Domain: marketplace человеческих E/esoteric-консультаций с платной сессией. Применены правила каталога (сравнение, цена, доступность), финансового действия (условия, состояние, последствия, восстановление) и поддержки (получение и решение обращения).
- Primary task: выбрать подходящего доступного допущенного эксперта, связаться, согласовать платную услугу, получить её и увидеть результат/стоимость/способ обращения.
- Main CTA: открыть профиль или бесплатный диалог — по этапу пути; платное согласие находится в owning G1/G2 flow. Клик по карточке не создаёт оплату или успешную сессию.
- Business outcome: оказанная платная консультация с согласованными session/money/history records; baseline платного трафика в изученном пакете не установлен.
- Priority segment/traffic intent: владелец выбирает конкретные тему, язык, географию и входную потребность первой кампании. Рабочее имя Nebula, прежний US-first текст и demo-domain не определяют launch market.
- Positioning/benefit/RTB: выбор человека и понятная управляемая услуга; доказательства — утверждённые профили, реальные условия, разрешённые отзывы и работающий путь. Гарантии жизненного, медицинского, юридического или финансового результата не поддержаны источниками.

Один фиксированный приёмочный сценарий: гость приходит по ссылке с объявлением на утверждённую city/topic страницу, выбирает эксперта, проходит auth, возвращается с выбранным экспертом/темой, отправляет бесплатное сообщение, проходит каждый из двух разрешённых входов в paid consultation, принимает условия, видит operator Start, завершение и историю, затем создаёт обращение по этой сессии. Наблюдаемый replay пока не выполнен. В отчёте о будущем прогоне для каждого перехода нужны expected/observed, новое состояние, сохранённый контекст, последствия и восстановление.

## Что добавить к задачам до допуска рекламы

Это acceptance-delta к существующим G-id, а не новый параллельный backlog. Если outcome уже существует, сначала предъявить текущий proof; разработчик получает только подтверждённый gap.

| Задача / ответственность | Обязательный результат | Проверка и критерий принятия |
|---|---|---|
| G3.1 + G3.2; PM/контент → Игорь по binding gap | Утверждённый рекламный вход продолжает тему, язык, географию и обещание объявления; бренд и маршрут едины до чата | Проверить точные launch URLs, title/H1/navigation/footer и конечную страницу после CTA; отсутствуют dating CTA/обычные пользователи/нецелевые metadata. Country/city scope не подменяется общим каталогом без явного fallback |
| G3.3 + G3.6; Superadmin/контент, Игорь | Сравнимые карточки: утверждённое фото, темы, язык, актуальная доступность, ставка, допустимый отзыв/сигнал, рабочий CTA | Длинное имя/тема, отсутствующее фото, отсутствие отзывов, expired/stale цена, blocked или incomplete профиль. Нет выдуманной оценки, testimonial, счётчика или optimistic online. Повторные карточки проверяются как одна component family |
| G3.4 + G3.INT; Игорь, QA | Выбор эксперта/темы и разрешённый черновик переживают auth, back и refresh; matching остаётся рекомендацией | Direct profile и assisted matching; successful/failed/cancelled auth; повторный callback; offline/no-match; профиль заблокирован после просмотра. Возврат в правильный контекст один раз, без offer/session/debit от повторного перехода |
| G3.7 + G6.4/G6.1; Superadmin, Игорь | Клиентская доступность связана с действующим допуском, назначением, сменой и busy-capacity | Missing/stale/blocked admission, off-shift, busy, reassignment и race после открытия страницы. Stale CTA обновляет состояние; сервер не запускает недопустимую сессию. UI не обещает конкретное ожидание без текущего источника |
| G3.5 + G1/G2; QA → PM, Caster/Антон review | Полный путь со всеми материальными состояниями на одном build, включая историю и поддержку | Оба initiation path; explicit consent отдельно от operator Start; pause/resume/complete; low balance; pending/failed/cancelled/unknown top-up; reconnect; повторная команда; история после reload. Условия, текущее состояние и разрешённое следующее действие видимы клиенту; UI не объявляет неизвестный денежный исход успехом |
| G4.1; Moderator + Игорь | Обращение из истории автоматически связано с правильной консультацией; видны получение, номер, статус и ожидание по действующему расписанию | Create → client readback → Moderator ownership → ответ → resolve/reopen. Duplicate submit и чужой case; сохранённый контекст не требует повторного пересказа. Работа вне support hours имеет честное ожидание, не ложный SLA |
| G4.2 + G2.3; Moderator → Superadmin, Игорь | Клиент различает рассмотрение, решение, компенсационный купон и денежный refund; обращение не теряется при финансовой ошибке | Одобрение/отказ/appeal; pending/error в исполнении; повторный submit не создаёт второе движение. Есть case → decision → исполнение G2 → безопасный client status |
| G4.3 + G3.INT.I18N; PM/legal → operational publisher | Существенные условия доступны до согласия; актуальные policy/support/refund тексты на включённых языках, применимая версия зафиксирована | Missing/obsolete policy, длинный перевод, locale switch до/после consent; сохранённый session snapshot. Disclaimer в футере не исправляет противоречащее обещание в Hero или карточке |
| G4.4 + G6.5; Moderator/настройки → Игорь | Клиент получает безопасный статус обращения, сотрудник — отдельный адресный alert с владельцем и escalation | Source event связывает оба consumer; доставка после retry не дублирует case/решение. Failed email сохраняет in-workspace status/alert; нет раскрытия staff notes/Agent identity |
| G5.1; PM/data owner + Игорь, QA | Цепочка от entry/ad identity до оказанной услуги и денег сверяется по разрешённым ключам | `landing_view → profile → auth → free_dialogue → request/offer → consent → operator_start → paid_result → history/support`; реальные имена переиспользуют event catalog. Контролируемые complete/drop-off/duplicate/missing-event прогоны показывают coverage и unmatched records; сообщения и raw личные данные не отправляются в маркетинговую аналитику |
| G5.2 + G5.3; PM/аналитик + Игорь | Дашборд отвечает, где теряется путь и хватает ли команды; zero, no-data, stale, partial различимы | Для метрик зафиксированы числитель, знаменатель, eligible cohort, период/timezone, source grain, owner и freshness. Показать путь к source record и искусственный пропуск данных. Business targets не изобретать до baseline |
| G5.4; PM/Superadmin + ответственный за рекламу | GO имеет build, маршруты, market/locales, бюджет/предел нагрузки, время работы, stop owner и дату пересмотра | P0 FAIL/unknown/stale → NO_GO; drill остановки объявлений/новых paid-start при incident, при сохранении поддержки уже начатых операций. Успех limited pilot не превращается автоматически в разрешение масштабировать |
| G6.2 + G6.5; operations/Superadmin + Игорь | Очередь и staff alerts дают выполнить обещание клиенту: смена, владелец, busy, просрочка, escalation | Смена закончилась, исполнитель занят, никто не подтвердил alert, failed delivery, изменение конфигурации при открытом deadline. Действующий case/session сохраняет исходную версию правила |
| G6.3 + G6.4; Moderator/Ксения/PM, Superadmin | До пилота действуют обучение, допуск, scorecard, разбор риска и возможность снять доступ; после пилота — улучшение по реальным случаям | Показать актуальный admission actual Agent ↔ public profile, пробную консультацию и review; stale/failed admission запрещает следующий платный start. Critical signal создаёт review, не автоматическую «вину» или публичный рейтинг |
| G6.6 + G6.7; Игорь, QA; Superadmin предоставляет fixtures | Рабочий контур позволяет обслуживать assigned queue, paid focus, support/alerts с серверной изоляцией | List/search/direct route/read/send/action под своей и чужой ролью; недопустимый маршрут не раскрывает данные. Отдельный URL и скрытая кнопка сами по себе не являются защитой. Приёмка основной operator-работы — desktop; мобильные staff-действия только при явном рабочем сценарии |

## Mobile, accessibility и производительность

G3.INT производит proof; G3.5 принимает клиентский путь. Обязательные ширины Nebula: **1200 / 992 / 768 / 576 / 320**. Для каждой critical surface и её рискованного состояния требуется актуальная связка source → build/route → screenshot; fonts/assets должны загрузиться. Выше 1200 — существующая ширина content shell; ниже 320 — graceful degradation по отдельному явно ограниченному evidence, без придумывания Figma.

На мобильном проверить открытый header/filter, длинные локализованные labels/цены, empty/error, auth keyboard, composing keyboard, consent card, low-balance/pending payment, reconnect и обращение. При открытой клавиатуре ввод, статус платной сессии и существенные условия остаются доступны. Sticky CTA/notification не перекрывает действие, фокус, последний ответ или способ восстановления. Browser back не теряет выбранный контекст. Горизонтальное переполнение нельзя скрывать на body для зелёного счётчика.

Отдельно: семантические имена, keyboard/focus/escape/focus-return, состояния не только цветом, contrast/forced-colors, text spacing, 200% текст, 320 CSS px reflow, reduced motion и работающие ошибки полей. 320 CSS px — reflow proxy, не утверждение фактического 400% zoom. Screen-reader spot check требует названной OS/browser/reader пары и реального speech evidence; automated/DOM pass этого не заменяет. Эти проверки дают техническую доступность в указанном scope, не общее заявление о соответствии WCAG.

До media/performance работ назначить route-specific budget по реальному мобильному устройству/сети и baseline. Измерять доставленные browser bytes и повторяемые lab timings для входа, каталога, профиля, auth, чата; repository size не использовать как page weight. Проверить responsive images, fallback/alt, шрифты и LCP-media loading. Не назначать произвольный единый byte budget всем маршрутам. После первых реальных посещений собирать согласованную агрегированную field/RUM оценку; лабораторный PASS не доказывает опыт платной аудитории.

В rollout inventory для профиля/фото/отзыва/цены/online/claim нужны owner, источник, last verification, update trigger и stale/remove behavior. Figma-ready текст/портрет может быть принят для точности вёрстки, но не становится автоматически допустимым production testimony или текущей ценой.

## Как уложить это в ближайшие четыре месяца

| Период от старта 07.09 | Результат, который клиент и команда могут проверить | Что должно произойти до следующего этапа |
|---|---|---|
| Месяц 1 | Сверка закрытия G1/G2; один интегрированный G3 путь; подготовленные G4/G6 minimum и G5 event contract | Синхронизированы owner rules и QA; named build; consent/Start/seconds/pause/history/ACL proof; утверждены launch audience/market/route; список gap к существующим компонентам |
| Месяц 2 | Сквозной внутренний rehearsal: выбор → консультация → обращение/решение; допущенная пилотная смена; работающая наблюдаемость | G4.1–4.4, G6 admission/access/SLA/alerts и G5 event/readback minimum приняты. Все обязательные mobile/ошибочные пути launch scope проверены; P0 отсутствуют |
| Месяц 3 | Ограниченный тест платного трафика на боевом сайте — только после отдельного GO; ежедневный разбор реальных сбоев и качества | Ограничения бюджета/одновременных консультаций/смен заданы из проверенной мощности; платежи/support/stop drill подтверждены; принято решение keep/pause/repair по качеству данных и услуг |
| Месяц 4 | Улучшение обнаруженных потерь, надёжности и качества; осторожное расширение маршрутов/смен/кампаний | Повторная приёмка изменившихся flow и policy, когортные результаты, guardrails, решение PM о расширении. Рост бюджета не следует только из процента выполнения плана |

Это рекомендованная последовательность с воротами, а не обещание календарного GO. Подготовку школы, поддержки и событий нужно вести с первого месяца: они необходимы первой платной консультации. Дополнительные темы, массовое SEO, весь остаток 66 экранов и advanced KPI/ranking не должны вытеснять launch-critical путь. Границу first release фиксирует PM; каждое осознанное исключение имеет owner и причину.

## Конфликт, который нужно устранить до QA

В `codex-context-g3-5-client-path-qa.md` ещё присутствуют `started minute`, `trial → paid minute`, автоматические переходы `both ready` и утверждение, будто отдельная live session вообще не доказана. В `tz-g4-support-disputes-rules.md` pilot minimum ещё называет автоматический переход в paid. Их следует сверить с owner answers 18.08 и knowledge 07.09: постоянный бесплатный диалог, отдельное согласие, **operator Start**, посекундная тарификация. Это синхронизация ранее принятых правил; Caster не назначает новое финансовое поведение. Владелец исправления: PM + владельцы G1/G2; QA обновляет expected oracle и сохраняет старые результаты историческими.

## Как показать план без шума в master plan

Сохранить «Сводку месяца» и существующую навигацию, не добавляя новых пунктов. Текущая страница уже имеет вкладку «План до января»: новый блок «Аудит G1–G6 · 07.09» следует поместить туда. Сводка показывает выполненную работу, дату evidence, ближайший результат и несколько реальных release blockers; в ней достаточно одной компактной ссылки на аудит. Не добавлять reviewer/ledger/skill/manifest кнопки в верхний ряд.

В блоке аудита достаточно шести строк: текущий результат, что ещё мешает запуску, ближайший пакет и критерий приёмки. Четырёхмесячная последовательность остаётся внутри «Плана до января»; additions G4/G5/G6 раскрываются под соответствующей целью. Детальная acceptance/state/role матрица открывается по одной контекстной ссылке из соответствующего G, а reviewer notes — из «Источников»/футера. Исторические QA и служебные runtime-пути не размещать первым экраном. Готовность документации и реализованная функция не должны сливаться в один неопределённый процент.

`copy-as-UI verdict: reduce_internal_process_noise` для отчёта; для боевого продукта — `unverified`. Visual-first replacement: статус, короткий next step, дата и ссылка на детализацию вместо длинного объяснения устройства вкладок. Финансовые условия/ошибки/receipt сохраняются непосредственно у действия.

Remove: дубли навигации, старые contradicted readiness-утверждения в current summary. Reduce: служебные terms и однотипные evidence banners на первом экране. Raise: фактический прогресс, текущий launch blocker, ближайшая проверяемая работа. Keep: сводка, 6 целей, имеющиеся task IDs, принятые screen bundles и контекстные ссылки.

## Handoff и границы качества

- Handoff path: PM задаёт launch scope/owners; Игорь выполняет доказанные integration gaps; QA получает build и fixtures; Manhattan обеспечивает доступную runtime-проверку при необходимости; Caster проверяет актуальные source/live/state screenshots; Антон независимо проходит клиентский сценарий; PM принимает GO.
- Source breakpoint evidence / Figma hierarchy / owning subtree / source-to-live mapping: page-specific G3.INT packet обязателен; в этом source review не проверены. Нельзя дать `accepted_1to1` по одному ledger.
- Component/sibling scope: shared shell, expert cards, auth forms, session/price/status controls, history/support entry. Конкретные selectors назначаются после binding discovery, не выдуманы reviewer.
- Code quality review: не проводился; запреты к handoff — screenshot substitution, глобальная CSS-правка локальной проблемы, per-card hacks, скрытое overflow, унаследованные mock actions.
- Attention route desktop/mobile, accent budget, visual foundations и типографика текущего host: unverified. План требует одного главного действия на шаге, видимых материальных условий и reason-to-continue; числовой conversion lift не заявляется.
- Measurement contract: 1–3 главных показателя оказания услуги и 1–2 существенных guardrail выбирает PM/data owner; attribution coverage проверяется до вывода о канале/дизайне. Дизайн не получает заслугу за revenue только по click event.
- Bad decision risks: validation laundering; transport-receipt laundering; attribution overclaim; stale price/availability; annotation leakage; isolated-state approval. Это классификация рисков плана, не новый список наблюдавшихся runtime-дефектов.
- Next UI step: показать один current integrated route с настоящими состояниями от входа до paid/history/support и предъявить соответствующий packet. Только после этого возможен визуальный verdict `pass | direct repair | block` по точному scope.

Status: source review completed; product acceptance unchanged. Blockers: current host/full-path/visual-state proof and launch gate are not established by inspected sources. User needed: owner launch market/domain/budget only where not already decided; no approval requested for this review. Hub update: parent task receives this review. Route: existing G3.INT → G3.5 → G5.4. Residuals: actual host proof, participant evidence, screen-reader proof, field measurement; owners named above.

## Финальный challenge — 08.09.2026

Проверены исходники итогового `launch-audit-2026-09-07.js`, `launch-audit-2026-09-07.md` и CSS/вставка блока в `index.html` этой папки. Вердикт: **`source_review_pass`**.

Выявленный source-level риск исправлен: первая колонка новой таблицы больше не обязана сохранять длинную стадию одной строкой. Scoped CSS ограничен календарём; на ширине до 576 px строки аудита представлены записями с явными подписями полей, табличными ролями и заголовками. Существующий `border-box` предотвращает расширение от padding. Скрытие заголовков на узкой ширине служит сохранению семантики, а не маскировке переполнения страницы. По проверенному исходнику новых материальных замечаний нет.

**Единый приоритетный календарь — итоговый PM-план до января** в `traffic-readiness-plan-2026-09-07.js` и `launch-audit-2026-09-07.md`: сентябрь — ядро/доступ, октябрь — интеграция, ноябрь — закрытый пилот без рекламы, декабрь — release-проверки и GO/NO-GO. Более ранняя четырёхмесячная таблица этого review остаётся рекомендацией reviewer о зависимостях; её вариант платного теста в третьем месяце не является принятым сроком и не переопределяет итоговый календарь.

CTA, trust/content boundaries, необходимые состояния и source gaps в итоговом плане отражены. Новый browser/visual/screen-reader PASS не получен и не заявляется; исправление CSS принято только на уровне исходника. Product acceptance и разрешение платного трафика остаются открытыми. Прочитанные локальные ТЗ/QA не добавляются в публичный payload как будто все их ссылки доступны на GitHub Pages.
