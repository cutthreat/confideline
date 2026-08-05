# ТЗ для Игоря — G3.2 «Каталог и выдача Экспертов»

Продуктовая постановка для вычитки и согласования с программистом. Документ описывает требуемую логику общего каталога, персональной выдачи и страниц стран/городов. Способ технической реализации выбирает Игорь. Визуальные компоненты должны использовать существующие экраны Figma и карточки сайта.

## 1. Цель

Клиент должен видеть только Экспертов, подходящих его явному запросу и выбранной странице, и уметь сузить выдачу по понятным критериям онлайн-консультации.

Каталог должен:

- исключить dating-логику показа обычных пользователей;
- объяснять, кто доступен, занят или офлайн;
- отделять тему вопроса от метода Эксперта;
- учитывать язык и реальную доступность раньше второстепенной географии;
- сохранять фильтры и порядок;
- не дублировать анкеты и не показывать запрещённые профили;
- вести в полный профиль или бесплатный диалог без ложного paid start.

## 2. Маршруты и типы выдачи

G3.2 владеет следующими поверхностями:

1. `/{language}/dashboard` — общий каталог и персональная выдача Экспертов.
2. `/{language}/country/{countrySlug}` — региональная страница страны.
3. `/{language}/city/{citySlug}` — региональная страница города.
4. Тематические варианты каталога, если они создаются как отдельные индексируемые страницы.

Гость может изучать каталог и публичные профили. Авторизация требуется перед фактической отправкой вопроса.

Обычные клиентские анкеты никогда не показываются в этой выдаче и не видят друг друга.

## 3. Границы G3.2

G3.2 отвечает за:

- получение допустимого списка Экспертов;
- фильтры;
- user-selected sorting;
- отображение compact cards;
- pagination/load more;
- сохранение query context;
- country/city scope;
- empty/error/loading states;
- SEO для публичных directory surfaces;
- admin preview фактической выдачи.

G3.2 не отвечает за:

- состав главной — G3.1;
- полный профиль — G3.3;
- matching quiz — G3.4;
- completeness и blocker input — G3.6;
- display/action eligibility, default ranking и rotation — G3.7;
- availability, assignment и block — G1/G6;
- price/trial/balance — G2;
- consultation start — G1/G2;
- финальный SEO content — отдельная content/SEO задача.

## 4. Роли

### Гость

Может:

- открыть общий и региональный каталог;
- применить фильтры;
- открыть профиль;
- начать intent «Задать вопрос».

Перед отправкой вопроса проходит auth с сохранением фильтров, выбранного Эксперта, темы и введённого вопроса.

### Авторизованный клиент

Имеет те же действия и может:

- видеть применимый баланс/bonus только там, где это предусмотрено карточкой;
- использовать сохранённые предпочтения как необязательную начальную настройку;
- явно сбросить любые автоматически предложенные фильтры.

### Эксперт / Агент

Не управляет своей позицией через клиентский каталог. Может редактировать только разрешённые данные анкеты; G3.6 передаёт полноту и blockers, а итоговое попадание, разрешённые действия и порядок определяет G3.7.

### Super-admin

Управляет taxonomy через её каноническую страницу, а scope, display/action eligibility, priority и preview — через G3.7. Роли позднее назначаются через permissions.

### Каноническая граница географии

Country/city сначала используют регион как hard scope: в первичную региональную выдачу входят только Эксперты, явно связанные с выбранной страной или городом. Если после применения остальных выбранных фильтров в этом регионе нет ни одной eligible анкеты, разрешён только явный безопасный fallback в общий eligible pool с теми же негеографическими фильтрами. В этом случае страница показывает заметную плашку «В выбранном регионе пока нет Экспертов» и не создаёт подписку/уведомление о появлении регионального Эксперта. Fallback не является скрытым смешением результатов: в readback сохраняются `regional_result_count=0`, `fallback_scope=general`, причина и версия решения. Если региональный результат непустой, общий pool не подмешивается.

Общий dashboard не использует географию как hard scope; регион ограничивает общий каталог только после явно выбранного пользователем географического фильтра. Региональный fallback применяется только на country/city surface и не меняет общий dashboard.

Открытие общего dashboard без выбранного региона не должно незаметно наследовать страну, город, IP-геолокацию или старый dating-фильтр. На country/city, напротив, смена или очистка регионального контекста должна либо открыть соответствующую региональную страницу, либо явно перевести пользователя в общий каталог.

## 5. Визуальный источник

Используются существующие Figma-экраны All Psychics, карточки Home и regional directory components.

Figma определяет layout, карточки, responsive behavior и component variants. Это ТЗ определяет:

- реальные поля;
- короткие фильтры;
- credits вместо USD minute price;
- статусы;
- действия;
- empty/error/loading;
- правила general/geo выдачи.

Текущие статические имена, показатели, `Neuro`, claims и фиксированный текст из HTML/Figma не являются данными каталога.

## 6. Единая taxonomy

### 6.1. Темы клиента

В верхнем фильтре показываются пять коротких однословных категорий. Их полные названия едины для главной, общего каталога, country/city, профиля и matching:

| Короткое название RU / EN | Полная категория | Вложенные темы |
|---|---|---|
| Отношения / Relationships | Отношения и семья | любовь и отношения, романтика и знакомства, брак и семья, расставание и развод, поиск партнёра, совместимость |
| Карьера / Career | Карьера, деньги и проекты | карьера и призвание, деньги и финансы, бизнес и проекты |
| Будущее / Future | Выбор, будущее и перемены | выбор и решения, будущее и жизненный путь, переезд и жизненные перемены |
| Развитие / Growth | Личностный рост и внутреннее равновесие | личностный рост, эмоциональное равновесие, тревоги и неопределённость, внутренние блоки, уверенность и самооценка |
| Духовность / Spirituality | Духовность, карма и родовые темы | кармические связи, духовное развитие, родовые темы |

### 6.2. Методы Эксперта

Хранятся отдельно:

- Tarot;
- Astrology;
- Numerology;
- Oracle Cards;
- Runes;
- Intuitive Reading;
- Clairvoyance;
- Mediumship;
- Energy Practices — append-only method value `id=17:value=16`;
- Mindfulness Practices;
- Spiritual Guidance;
- Dream Interpretation.

`Empath` относится к стилю. Небезопасные legacy labels нормализуются через aliases совместимости, а не удаляются молча.

### 6.3. Правила справочника

Для каждого значения:

- stable ID;
- RU/EN translation keys;
- slug;
- parent;
- type: topic/method/style;
- icon;
- order;
- active status;
- surface flags;
- assigned profile count;
- alias совместимости.

Выключение значения не удаляет исторические связи.

### 6.4. Версионированная связь категорий и специализаций

Страницы не хранят собственные списки и не hardcode-ят соответствие. Они получают активную `taxonomy_version` и опубликованный mapping `category_id -> specialization_value_ids`.

`expert_specialization_taxonomy_v1_legacy` — неизменяемый migration baseline текущего profile field `id=18`: legacy values `1–20`, включая `13 = Energy Diagnostics`. Это не активная публичная Nebula taxonomy и не означает, что legacy flat-list когда-либо имел опубликованный category mapping.

Первая активная Nebula-версия — `expert_specialization_taxonomy_v2`:

| Stable category ID | Короткий фильтр RU / EN | Полная категория | `Specialization` value IDs |
|---|---|---|---|
| `relationships_family` | Отношения / Relationships | Отношения и семья | `1, 2, 3, 4, 5, 6` |
| `career_money_projects` | Карьера / Career | Карьера, деньги и проекты | `7, 8, 9` |
| `choice_future_changes` | Будущее / Future | Выбор, будущее и перемены | `10, 11, 21` |
| `personal_growth_inner_balance` | Развитие / Growth | Личностный рост и внутреннее равновесие | `14, 15, 16, 17, 18` |
| `spirituality_energy_practices` | Духовность / Spirituality | Духовность, карма и родовые темы | `12, 19, 20` |

Полный утверждённый список публичных RU/EN-названий, правила geo-фильтра и миграции находятся в `expert-specialization-taxonomy-v2-2026-07-29.md`. `Все / All` является сбросом фильтра, а не отдельной категорией.

Здесь `Specialization value ID` — идентификатор значения внутри profile field `id=18`, а не ID самого profile field. Existing IDs не переиндексируются:

- `id=18:value=13` сохраняется как legacy/deprecated alias/history, удаляется из active specialization choices и не входит ни в один active `specialization_value_ids`;
- `id=17:value=16 = Energy Practices` добавляется append-only в method axis;
- migration mapping `id=18:value=13 -> id=17:value=16` сохраняет происхождение и audit без destructive rewrite;
- `id=18:value=21 = Relocation and Life Changes / Переезд и жизненные перемены` добавляется append-only и относится к `choice_future_changes`;
- IDs `1–12, 14–20` сохраняют прежние identity; удалённый из active mapping ID `13` не переиспользуется.

Отключение, переименование или перенос значения создаёт новую неизменяемую версию mapping; historical snapshots остаются разрешимыми.

## 7. Источники полей Эксперта

Существующий административный контур уже содержит:

- `Areas`, id=17 — текущий flat method/role list;
- `Specialization`, id=18 — текущие клиентские темы;
- `Number of Consultations`, id=19 — заявленный исторический диапазон;
- `My Experience`, id=20 — опыт;
- `My Languages`, id=21 — языки.

Целевая модель:

- id=17 мигрируется/связывается с Methods;
- id=18 мигрируется/связывается с Topics;
- id=20 используется для фильтра опыта;
- id=21 используется для языка;
- id=19 не считается фактическим системным числом завершённых consultations.

## 8. Основные фильтры общего каталога

Порядок:

1. тема;
2. доступность;
3. язык;
4. метод;
5. цена в credits/мин;
6. опыт;
7. rating;
8. регион — в дополнительных фильтрах.

Правила:

- фильтры комбинируются как явное пересечение;
- внутри одной группы может быть multi-select, если это понятно пользователю;
- applied filters видны и снимаются по одному;
- есть «Сбросить всё»;
- значения с нулевым результатом disabled либо показывают понятный count, но не ведут в ложный результат;
- изменение фильтра сбрасывает pagination, но не остальные выбранные критерии;
- URL отражает публично допустимый filter state;
- личные предпочтения не попадают в индексируемый URL без явного выбора.

## 9. География

### Общий каталог

География не является автоматическим hard restriction, потому что консультации проходят онлайн.

- сохранённая страна/город клиента может предложить фильтр;
- фильтр не применяется скрыто;
- клиент может выбрать или сбросить регион;
- язык, тема, метод и availability имеют больший продуктовый приоритет.

### Страница страны

- страна является hard scope;
- показываются только Эксперты, назначенные этой стране или допустимому входящему городу по принятой региональной модели;
- city select ведёт на выбранную city page;
- topic filter использует единую taxonomy.

### Страница города

- город является hard scope;
- показываются только Эксперты, у которых этот город есть в admin multi-select;
- один Эксперт может присутствовать в нескольких городах;
- выбор другого города переводит на соответствующий route, а не расширяет текущий результат.

Если региональный результат пуст, сначала фиксируется отсутствие локальных eligible Экспертов, затем по единому G3.7-контракту запрашивается общий eligible pool с сохранёнными темой, специализацией, методом, языком, availability и другими фильтрами. На странице показываются общий список и обязательная плашка о нулевом региональном результате. Общие анкеты не должны выглядеть как локальные; региональная принадлежность в карточках не заявляется. Если общий pool также пуст, показывается обычный empty state без фиктивных данных. Отдельная запись в операционном списке `regions_without_experts` создаётся/обновляется для страны или города; автоматическое уведомление клиенту о появлении регионального Эксперта не создаётся.

## 10. Доступность

Публичные состояния:

- `Доступен`;
- `Занят`;
- `Офлайн`.

Внутренние `agent-offline`, `profile-offline`, `admin-blocked` и paid lock могут иметь разные причины, но клиент получает безопасную публичную формулировку.

Правила:

1. `Доступен` означает возможность принять новый paid request после повторной server-side проверки.
2. `Занят` может оставаться в каталоге, если бесплатный диалог разрешён.
3. `Офлайн` может оставаться с действиями «Написать» и «Уведомить о доступности».
4. `admin-blocked`, unpublished или ineligible не показывается.
5. Высокий ranking/pin не отменяет недоступность или block.

Каталог получает от G3.7 один канонический контракт решения:

- `display_eligible: boolean`;
- `capabilities: string[]`;
- `reason_codes: string[]`.

При `display_eligible=false` карточка отсутствует, `capabilities=[]`, а `reason_codes` содержит хотя бы одну стабильную машинную причину. Разрешённые catalog capabilities: `open_profile`, `send_free_message`, `notify_availability`, `create_consultation_request`. Последняя означает только вход в request/consent flow и не разрешает финансовый старт.

Других capability IDs нет. Отдельного capability ID для финансового старта не существует. `paid_start_eligible` не является capability и не входит в cached catalog capabilities. Это свежий транзакционный guard G1/G2/G6 непосредственно перед созданием paid session: он повторно читает актуальные assignment/admission/state, цену, balance/trial, consent и session locks. Отказ не создаёт session и не списывает credits.

## 11. Карточка в каталоге

Показывает:

- photo;
- public name;
- availability;
- headline;
- до трёх specializations;
- primary method;
- consultation style при наличии;
- language;
- experience;
- rating/review count при допустимой выборке;
- системный completed consultation count либо отдельно подтверждённый historical count;
- effective credits/min;
- применимый клиенту trial/bonus;
- CTA.

Не показывает:

- Agent;
- внутренний KPI/SLA;
- age, gender, distance, marital status;
- internal sanctions;
- непроверенные claims;
- отдельную verification badge.

## 12. Действия

- Клик по карточке/имени — G3.3.
- «Задать вопрос» для клиента — бесплатный диалог.
- «Задать вопрос» для гостя — auth с return context.
- Busy — «Написать» или профиль.
- Offline — «Написать», профиль или уведомление.
- «Начать consultation» не используется как прямой автоматический paid start; запрос и consent проходят G1.

Повторный клик не создаёт duplicate message/request/session.

## 13. Сортировка и порядок

Default order всегда приходит из G3.7 для конкретной surface.

Разрешённые user sorts:

- рекомендованные;
- доступные сейчас;
- цена по возрастанию;
- опыт;
- rating — только при достаточной опубликованной выборке.

User sort:

- не отменяет eligibility;
- не показывает blocked/off-scope profiles;
- имеет стабильный tie-break;
- сохраняется при pagination;
- не переписывает default rotation settings.

## 14. Pagination и стабильность

1. Одна анкета появляется не более одного раза в одном результате.
2. При неизменных filter inputs, dataset version и state порядок стабилен.
3. Page/load-more не создаёт пропусков и дублей.
4. Изменение availability между запросами может изменить результат, но должно быть объяснимо.
5. Возврат из профиля восстанавливает filter, sort, page/scroll context.
6. При устаревшем cursor/page token система безопасно перезапрашивает/объясняет обновление, а не смешивает две выборки.

## 15. Loading, empty и error

### Loading

Skeleton cards без фальшивых данных.

### Empty

Показываются:

- выбранные критерии;
- предложение убрать один или несколько фильтров;
- переход к общему каталогу;
- offline/busy alternatives только если они соответствуют текущему scope;
- уведомление о доступности, если функция включена.

### Error

- безопасный текст;
- Retry;
- сохранённые filters;
- отсутствие статического fallback списка;
- ошибка одного дополнительного facet не должна раскрывать неподходящие анкеты.

## 16. Админ-панель

### `Поля профиля → Таксономия Экспертов`

Новая страница: `/ru/admin/profile-field/expert-taxonomy`. Она управляет category mapping и не дублирует существующий редактор значений `/ru/admin/profile-field/index`.

Две основные вкладки:

- Темы консультаций;
- Методы и практики.

Управляются переводами, slug, parent, order, icon, active status, surfaces и aliases.

### Профиль Эксперта

Назначаются:

- topics;
- methods;
- primary topic/method;
- languages;
- regions multi-select;
- experience;
- public card fields;
- individual price в каноническом G2 owner.

### `Настройки → Выдача Экспертов`

G3.7 владеет default ordering, surface scopes, pin, priority, weight и preview.

G3.2 только использует настройки и предоставляет preview-link/readback. Цены, роли, consultation settings и KPI не дублируются.

## 17. SEO

1. Общий публичный каталог, country/city и утверждённые topic pages могут индексироваться.
2. Персональная выдача, private preferences и бесконечные filter combinations не создают индексируемые дубли.
3. Canonical, hreflang, title, description и approved filter URLs используют существующий SEO-контур.
4. Empty/invalid filter URLs не создают misleading landing.
5. Только актуальные public data входят в structured data.
6. Скрытая ordinary-user/dating выдача не остаётся в sitemap, links или public HTML.

## 18. Аналитика

Без текста вопроса и личных данных:

- каталог открыт;
- surface type;
- topic/method/language/availability/price/experience/rating filter применён;
- filter снят/reset;
- sort изменён;
- page/load more;
- empty result;
- Expert opened;
- question/auth intent;
- notify availability;
- load/retry error.

Analytics failure не меняет результат выдачи или CTA.

## 19. Accessibility и performance

- keyboard filters и cards;
- visible focus;
- labels и counts доступны screen reader;
- состояние не кодируется только цветом;
- mobile filter drawer удерживает выбранные значения и focus;
- нет horizontal overflow;
- responsive Figma breakpoints;
- изображения карточек оптимизированы;
- loading не вызывает заметный layout shift;
- LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms на 75-м перцентиле;
- large result set не блокирует input.

## 20. Особые случаи

1. Profile меняет region/topic/method между страницами — новая выдача использует новую version; текущая карточка revalidates.
2. Profile reassigned Agent — public identity/reviews сохраняются; availability меняется по новому active assignment.
3. Один Expert совпал по нескольким темам/городам — одна карточка.
4. Price unset/invalid — paid action unavailable; поведение показа определяется eligibility.
5. Rating sample insufficient — rating sort/claim не вводит пользователя в заблуждение.
6. Filter value disabled после сохранения URL — оно удаляется/объясняется, raw ID не показывается.
7. Concurrent state changes — no paid start from stale card.
8. Unauthorized filter/admin mutation — denied without config change.
9. Search dependency degraded — explicit error/limited mode, no broadened unsafe result.
10. Country/city has zero regional experts — show the explicit regional-empty banner and the same-filter general eligible pool; never imply that fallback profiles belong to the selected region.

## 21. Критерии готового результата

### Positive

1. Guest и client видят только Expert profiles.
2. General filters работают совместно и сохраняются.
3. Geography в общем каталоге применяется только явно.
4. Country/city сначала применяет региональный scope; при нулевом regional result допускается только явный general fallback с banner/readback и без утверждения локальной принадлежности.
5. Multi-region Expert отображается по каждому назначенному региону без дубля внутри результата.
6. Default order совпадает с G3.7 preview.
7. User sort сохраняет eligibility и stable pagination.
8. Возврат из G3.3 восстанавливает контекст.
9. Auth сохраняет Expert/topic/question intent.
10. RU/EN, mobile/desktop, SEO, analytics, accessibility и performance пройдены.

### Negative

1. Ordinary client profile не попадает в каталог.
2. Blocked/unpublished/ineligible Expert не появляется через filter, URL, cache или pin.
3. Duplicate/retry/load-more не дублирует карточки.
4. Empty regional result не расширяется скрыто: fallback в general pool возможен только с явным banner, reason/readback и сохранением остальных фильтров.
5. Stale card не начинает paid flow.
6. Unauthorized actor не меняет taxonomy/rotation/profile scope.
7. Analytics/search failure не приводит к disclosure или fake data.

## 22. Связанные задачи

- G1/G2 — downstream dialogue/request/start/price;
- G3.1 — входы с главной;
- G3.3 — полный профиль;
- G3.4 — matching;
- G3.5 — E2E;
- G3.6 — profile completeness и blocker input;
- G3.7 — display/action eligibility, order и rotation;
- G5 — events/SEO release;
- G6 — assignment/availability/admission.

## 23. Что не входит

- редизайн Figma;
- full profile;
- matching quiz;
- calculation of G3.6 completeness/blockers и G3.7 eligibility/ranking;
- automatic paid start;
- dating discovery;
- paid queue/asynchronous consultation;
- final SEO content;
- post-pilot KPI scoring.

## 24. Действия Игоря

### Перед реализацией

Игорь возвращает:

- mapped routes/views/query logic для dashboard, profile, country/city и auth return;
- exact Figma nodes/breakpoints;
- действующие поля профиля и план совместимого перехода;
- taxonomy/geo source-owner map;
- proposed public/private URL and cache policy;
- stable pagination/sort strategy;
- test plan и найденные product conflicts.

### После реализации

Игорь предоставляет:

- build/commit marker;
- guest/client/country/city/browser proof;
- filter/sort/pagination/return-context proof;
- duplicate/stale/blocked/unauthorized/degraded negative proof;
- taxonomy/profile/rotation admin readback;
- SEO/analytics/accessibility/performance evidence;
- cleanup/rollback notes и residuals.

## Основание продуктового решения

- owner decisions по dashboard, geo, taxonomy и card fields;
- существующие Confideline country/city и profile-field surfaces;
- G3 canonical packet;
- existing All Psychics/Home Figma;
- official competitor category/topic/card patterns как benchmark, не политика.

## Служебные сведения о документе

- Task: G3.2.
- Название: Каталог и выдача Экспертов.
- Приоритет: P0.
- Фаза: client pilot / public directory.
- Связанный технический контекст: `codex-context-g3-2-expert-catalog.md`.
- Версия: 1.1.
- Дата: 2026-08-05.
