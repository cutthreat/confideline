# G3. Функциональное ТЗ: витрина, каталог, профиль и ротация

Статус: `requirement_defined_post_pilot_enablement_deferred_not_runtime_verified`  
Задачи: G3.1-G3.7  
Фазы: G3.1-G3.5 и минимальные slices G3.6-G3.7 входят в `V3 client pilot`; V3 включает `expert_specialization_taxonomy_v2`, manual completeness/blocker input и eligibility/manual order при `KPI mode = disabled`. Автоматическая completeness/ranking и KPI-ротация относятся к `V5 public scale`.

Этот файл является межзадачным обзором. Основные документы и technical lanes находятся в `etalon-tz-g3-*` и `codex-context-g3-*`; технический файл не делает Игоря владельцем content/config/QA.

## Маршрутизация исполнения G3

| Task | Класс | Операционная дорожка | Development-дорожка |
|---|---|---|---|
| G3.1 | `MIXED` | Storefront blocks/copy/media/FAQ/reviews, preview/publish | Routes/theme, dynamic projection, composer/cache/states |
| G3.2 | `MIXED` | Profile fields, taxonomy mapping, regions/languages и publication | Expert-only query, filters, pagination, geo/taxonomy binding |
| G3.3 | `MIXED` | Profile/review content, moderation, translations и publication | Public projection, review workflow, ACL/history |
| G3.4 | `MIXED` | Questions/answers/branching copy, translations и rule publication | Matching, auth-intent, idempotency и backend actions |
| G3.5 | `QA_GATE` | QA/super-admin evidence; PM GO/NO_GO | Build/fixtures/hooks и исправление конкретных FAIL |
| G3.6 | `OPS_FIRST` | Field/taxonomy/completeness inventory, rules, preview/publish | Только missing evaluator/version/binding/admin capability |
| G3.7 | `MIXED` | Eight-surface policies, exclusions/order и preview/publish | Eligibility/ranking runtime, stale/concurrency/ACL |

G3.INT является `MIXED`, но G3.INT.I18N — `OPS_FIRST`: moderator сначала ищет существующие keys, переводит и делает readback; Игорь исправляет только missing/broken technical capability. Канон: `task-execution-ownership-matrix.md`.

## Общий результат G3

Клиент на любой поддерживаемой странице видит допустимые экспертные анкеты, понимает их реальную доступность и может открыть бесплатный диалог. Платная consultation начинается только внутри G1 request/consent flow. Администратор управляет eligibility и порядком выдачи по типам страниц и может объяснить фактический результат.

## G3.1 Витрина

### Функциональные требования

1. `/{language}/` является публичной мультиязычной витриной. `/dashboard` остаётся отдельной expert-only выдачей G3.2.
2. На витрине показываются только анкеты, которые G3.7 разрешил для поверхности `home`; G3.1 не хранит второй ручной список.
3. Pilot использует versioned manual eligibility/order policy G3.7 для поверхности `home`; отдельный ручной pilot pool или второй список анкет не создаётся.
4. Для каждой анкеты отображаются согласованные real status, effective price/trial и доступное действие.
5. `online` означает возможность принять новый paid request с учетом текущего состояния управляющего агента.
6. Если агент ведет paid chat/pause, все его анкеты показываются как busy для нового paid start.
7. Offline/admin-blocked анкета не обещает немедленный paid start.
8. При недоступности клиент получает честное следующее действие: написать бесплатно, выбрать другого Эксперта, запросить уведомление или вернуться к каталогу.
9. Гость может смотреть home/catalog/profile. Перед отправкой вопроса требуется auth с сохранением Эксперта, темы и текста.
10. Блоки, desktop/mobile media, порядок, visibility, draft/preview/publish/schedule управляются в `Содержимое → Витрина Nebula` и `Настройки → Настройки витрины`.
11. Все тексты используют существующие translation keys; первыми готовятся RU/EN.
12. Недоказанные accuracy, 24/7, число Экспертов, отзывы и гарантии результата не публикуются.
13. Результат публичной витрины должен совпадать с admin preview для тех же входных условий.
14. При потере связи агентом во время paid/pause все его анкеты остаются недоступными для нового paid start в течение reconnect grace; текущее admin-значение — 60 секунд. После technical end анкеты остаются agent-offline до новой online-смены.

### Приемка

- Online, busy, agent-offline, profile-offline и admin-blocked состояния.
- Одновременный paid start меняет доступность всех анкет агента.
- Недоступная анкета не начинает paid и не списывает деньги.
- Public result совпадает с preview.
- Agent disconnect во время paid/pause не создает ложный online/start; до и после grace витрина совпадает с session/online state.

## G3.2 Каталог

### Функциональные требования

1. `/dashboard` и общий каталог показывают только Экспертов; обычные клиенты друг другу не видны.
2. Фильтры разделены на тему, specialization, availability, язык, method, price, experience/rating и явный дополнительный регион.
3. Короткие категории: Отношения, Карьера, Будущее, Развитие, Духовность. Они раскрываются в specialization; methods остаются отдельной осью.
4. Expert profile может относиться к нескольким странам/городам через admin multi-select.
5. На country/city странице регион является hard scope: показываются только анкеты, назначенные соответствующему региону.
6. В общем dashboard сохранённый город клиента не является скрытым hard filter. Если клиент явно выбирает регион, результат соответствует выбранному фильтру.
7. Busy/offline/admin-blocked состояния соблюдаются так же, как на витрине.
8. Одна анкета не дублируется из-за нескольких совпавших признаков.
9. Порядок в рамках одного стабильного просмотра не меняется хаотично при pagination/reload без изменившихся условий.
10. Переходы между страницами и фильтрами не теряют явно выбранный клиентом контекст.
11. Пустой результат объясняется и предлагает снять фильтр, показать допустимых offline-Экспертов, уведомить о доступности или перейти в общий каталог; недопустимые анкеты не подмешиваются.

### Приемка

- Single-city и multi-city expert profiles.
- Несовпадающий город исключает анкету на соответствующей geo-странице или при явном region filter, но не скрыто в общем dashboard.
- Category + explicit city одновременно.
- Pagination без дублей/пропусков в стабильной выборке.
- State change между запросами корректно меняет доступность.

## G3.3 Карточка эксперта

### Функциональные требования

1. Публичная карточка принадлежит expert profile и не раскрывает управляющего агента.
2. На компактной карточке согласованы фото, публичное имя, headline, 2–3 specialization, primary method, experience, реальное число completed consultations, effective credits/min, применимый trial/bonus, rating/reviews, online/busy/offline и CTA.
3. Полный профиль дополнительно показывает описание, стиль консультации, языки, полную taxonomy, доступность, отзывы и понятное объяснение старта.
4. Public reviews/rating остаются у expert profile после reassignment.
5. Ручной profile field `Number of Consultations` не используется как фактический счётчик; он строится из completed consultation sessions.
6. Отдельный verification badge не показывается.
7. Перед началом консультации система повторно проверяет актуальные eligibility, availability, price, trial и agent paid state.
8. Устаревшая открытая карточка не позволяет начать консультацию на уже неактуальных условиях.
9. Busy/offline/admin-blocked имеет понятный клиентский результат без ложного CTA.
10. Если агент вручную выключил анкету, сохраняется причина; при старте новой online-смены анкета может вернуться online, кроме admin-blocked.
11. Expert account может иметь свой технический вход, но карточка не должна показывать внутреннюю модель управления.

### Приемка

- Profile-to-start consistency для всех статусов.
- Price изменена после открытия карточки.
- Reassignment не меняет public reviews.
- Agent starts new shift: допустимые анкеты возвращаются, admin-blocked остается blocked.

## G3.4 Подбор и старт

### Функциональные требования

1. Подбор является необязательным и пропускаемым способом сузить выбор по теме, желаемой доступности, языку, optional method/style и price range.
2. Результат показывает 3–5 объяснимых совпадений и ссылку на полный каталог.
3. Birth data не запрашивается в общем подборе; оно допускается только в явно релевантном Astrology-сценарии с объяснением цели и без обязательности.
4. Результат подбора открывает профиль или бесплатный диалог и не создаёт paid session.
5. До фактического старта в контуре G1/G2 подтверждаются:
   - допуск анкеты к выбранной поверхности;
   - active assignment;
   - online/paid availability агента;
   - актуальные цена и trial;
   - достаточность баланса или доступность top-up;
   - consent клиента.
6. Первый успешно принятый paid request делает агента занятым для остальных paid starts.
7. Одновременные попытки не создают две активные paid session одного агента.
8. Если несколько клиентов одновременно пытаются начать paid chat одного агента, ровно одна попытка может завершиться успешным стартом; остальные получают busy/недоступность без списания, accrual или ложной session.
9. Busy/offline/no-balance/no-consent дают понятный отказ без списания и accrual.
10. После signup/login сохраняются выбранная анкета, тема и введённый вопрос либо клиент получает явное объяснение изменения.
11. Start action ведет в реальный consultation flow, а не в статический или тупиковый экран.
12. Отказ в старте не раскрывает внутренние данные агента или чужой session.

### Приемка

- Positive start из витрины, каталога и карточки.
- Simultaneous start attempts.
- Пять одновременных попыток одного агента: один start, остальные чисто отклонены, их баланс не изменен.
- Busy, offline, blocked, insufficient balance, stale price, missing consent.
- Auth/signup не теряет выбранный профиль.

## G3.5 Сквозная проверка клиентского пути

### Gate result

Limited paid pilot допускается только после прохождения на одной сборке:

```text
витрина/каталог -> карточка -> start validation -> consent -> trial
-> paid minute -> pause/top-up или end -> session history
-> support/dispute -> refund/correction readback
```

### Требования к evidence

1. Один и тот же build marker во всех шагах.
2. Фиксированы client, expert profile, actual agent и assignment.
3. Согласованы price, debits, accrual и refund/correction.
4. Есть foreign-agent negative cases.
5. Есть abnormal/technical path или явно зарегистрированный residual.
6. Каждый FAIL получает отдельный воспроизводимый handoff программисту.
7. Один проваленный P0 оставляет gate в `NO_GO`.

## G3.6 Вес полей и completeness

### Функциональные требования

1. Поля классифицируются как hard-required, weighted, informational или risk-reviewed.
2. Администратор может управлять вкладом значимых полей в completeness. Eligibility использует результат, но остаётся отдельным решением G3.7.
3. Видно, какие поля учитываются, какой у них вклад и какой итог имеет анкета.
4. Optional missing не считается fraud или critical quality failure.
5. Формально заполненное мусорное значение не должно давать тот же полезный результат, что и валидное содержимое.
6. Существующее `ProfileField[weight]` нельзя автоматически объявить completeness score без проверки семантики; реализация должна либо доказать reuse, либо ввести versioned rule layer.
7. Изменение веса влияет только на будущую оценку/выдачу и подтверждается admin preview/readback.
8. Pilot использует manual completeness/blocker input G3.6 и versioned manual eligibility/order policy G3.7; отдельный пул анкет не создаётся, а полная автоматизация completeness не блокирует V3.
9. Manual override имеет автора, причину и при необходимости срок.
10. Completeness не заменяет admission, online state, assignment или quality decision.

### Приемка

- Полный, неполный, optional-missing и очевидно мусорный профиль.
- Изменение веса и повторный preview.
- Manual override и окончание срока.
- Одинаковое объяснение результата до и после refresh.

## G3.7 Выдача и ротация

### Поверхности управления

Ротация задается по единому каноническому registry из восьми stable surface IDs:

- `home`;
- `dashboard_catalog`;
- `country`;
- `city`;
- `category`;
- `matching_result`;
- `thematic_block`;
- `expert_profile`.

Других скрытых списков поверхностей нет. Настройки одной surface не должны скрыто менять другую: hidden inheritance запрещена, а общее правило допустимо только как явно версионированная политика с preview/readback для каждой из восьми surfaces.

### Порядок принятия решения

1. Сначала применяется eligibility: assignment, admission, hard-required completeness, surface scope, regional scope только для geo/explicit region, online/offline/busy/admin-blocked и обязательные exclusions.
2. Затем применяются управляемые факторы порядка: surface rule, pin/fixed position, manual priority/weight и стабильный tie-break.
3. Доступны KPI modes: `immediate`, `after_threshold`, `disabled`; текущий active pilot mode — `disabled`.
4. Недостаточная выборка агента означает `insufficient_data`, а не нулевое качество.
5. При reassignment public rating остается у анкеты, а internal KPI берется у нового агента по его cold-start mode.
6. Profile cap или ограничение количества анкет одного агента в top positions не вводится.
7. Концентрация анкет одного агента может наблюдаться, но не изменяет порядок автоматически без owner decision.
8. Приоритет успешных агентов может влиять на выдачу только после post-pilot gate, через утвержденные KPI definitions и включенный admin mode. В пилоте quality/SLA/conversion не входят в score и могут только дать отдельно утверждённый hard exclusion.
9. Admin может включить/исключить анкету, задать приоритет/вес, закрепление и область применения.
10. Product semantics controls:
    - `pin/fixed position` удерживает выбранную допустимую анкету на указанной позиции/области;
    - `priority` ставит допустимые анкеты с более высоким приоритетом выше более низкого в соответствующей области;
    - `weight` увеличивает относительное влияние анкеты на порядок/частоту выдачи, но не отменяет eligibility, busy/offline/block и fixed-position rule;
    - фактический эффект любого значения объясняется preview, а способ расчета выбирает программист.
11. Override имеет автора, причину и срок либо явно бессрочный статус.
12. Preview показывает входные условия, eligibility, примененные факторы и ожидаемый порядок.
13. Фактический public result совпадает с preview для тех же условий.
14. Изменение состояния агента/profile немедленно исключает невозможный paid start даже при высоком score/pin.
15. KPI mode, definitions, weights, window, sample, thresholds, exclusions, freshness и preview управляются на отдельном admin-экране по `admin-panel-settings-development-package.md`.
16. `immediate/after_threshold` нельзя активировать до отдельного post-pilot owner decision и успешного evidence gate; одно наличие admin control не считается разрешением.

### Приемка

- Отдельные наборы main/catalog/city/category/thematic.
- Exclusion, pin, weight, priority и срок override.
- KPI immediate/after-threshold/disabled.
- New agent и insufficient data.
- Reassignment.
- Busy/offline/admin-blocked поверх высокого приоритета.
- Preview против фактической выдачи.
- Stable pagination/order при неизменных условиях.

## Отложенные enablement/release gates

- Post-pilot owner/evidence gate перед переключением KPI influence из принятого `disabled` в `immediate/after_threshold`.
- Состав page blocks первого public launch выбирается как release scope из уже описанных блоков и не является пробелом функционального ТЗ.
- Manual defaults для priority/weight настраиваются операционно через admin и не требуют нового owner-решения.

## Knowledge basis

- Claim class: owner decisions + accepted canonical product rules; public/admin runtime не доказан.
- `reports/six-global-goals-owner-facts-update-2026-07-12.md`.
- `reports/six-global-goals-final-canonical-pm-plan-2026-07-14.md`, G3.
- `reports/tz-product-g3-expert-profile-catalog-2026-07-16.md` как поддерживающий product packet.
- `reports/final-review/six-global-goals-final-committee-arbitration-2026-07-14.md` для no-cap, KPI cold start и pilot/public split.
- `owner-decisions.md`, O15–O19, является более новым источником для routes, taxonomy, reviews и admin ownership.
- `current-site-state-g1-g3-2026-07-29.md` и `target-site-vision-g1-g3.md` разделяют существующий сайт и целевой продукт.
