# Целевой сайт Confideline / Nebula в границах G1–G3

Дата фиксации: 2026-07-29  
Статус: `target_product_reference`  
Горизонт: limited paid pilot → public launch

## 1. Итоговое представление продукта

Nebula — мультиязычная платформа персональных онлайн-консультаций с Экспертами. Клиент может изучить витрину, каталог и профиль без регистрации, затем авторизоваться, задать вопрос в бесплатном постоянном диалоге и перейти к платной поминутной consultation session только после явного подтверждения.

Продукт не является dating-сервисом:

- клиенты не видят друг друга;
- публичное лицо консультации — экспертная анкета;
- внутренний сотрудник называется Агентом и может вести назначенные анкеты;
- служебное вмешательство отображается как «Поддержка Nebula»;
- одна консультация имеет одну каноническую запись, финансовую историю и audit.

## 2. Целевая информационная архитектура

### Публичные и клиентские поверхности

| Маршрут / поверхность | Назначение |
|---|---|
| `/{language}/` | мультиязычная публичная витрина G3.1 |
| `/{language}/dashboard` | expert-only выдача для авторизованного клиента, G3.2 |
| `/{language}/country/{slug}` | региональная страница и региональный пул Экспертов |
| `/{language}/city/{slug}` | городская страница и региональный пул Экспертов |
| профиль Эксперта | полный публичный профиль G3.3 |
| постоянный диалог | бесплатное общение, запрос и предложение консультации |
| consultation card | состояние, таймер, финансовый readback, история и связанные процессы |
| «Мои консультации» | список консультаций клиента и переход в каждую запись |
| balance / checkout | покупка credits за USD и расшифровка баланса |
| notification settings | только пользовательские email-переключатели |

Brand и домен могут быть утверждены отдельно. Они не меняют функциональные границы.

### Административные поверхности

| Раздел | Назначение |
|---|---|
| **Консультации → Все консультации** | новый операционный список |
| `/ru/admin/consultation/view?id=...` | одна каноническая карточка консультации |
| `/ru/admin/settings/consultations` — **Настройки консультаций** | lifecycle, timers, reconnect, `balance_pause`, consultation-history projection retention; trial только read-only snapshot/link |
| **Настройки → Настройки чата** | только chat-specific policy, censorship, attachments и message edit limits; reconnect здесь не редактируется |
| `/ru/admin/settings/prices` — **Настройки цен** | единственный editor global/profile credits/min, packages, package discounts и balance rules |
| `/ru/admin/settings/coupons` — **Купоны и бонусы** | единственный editor coupons, bonus credits, trial entitlement и bonus expiry |
| **Финансы → Возвраты** | refund cases и исполнение |
| `/ru/admin/settings/accruals` — **Вознаграждение Агентов** | единственный editor accrual rules, periods, rates, conversion и correction policy |
| существующие partner payments/payouts | только operation/readback начислений и выплат; configuration здесь не редактируется |
| `/ru/admin/notification-rule/index` — **Настройки уведомлений** | единственный editor delivery categories, delays, quiet hours и retention |
| `/ru/admin/email-template/index` — **Email Templates** | только содержимое email; delivery rules не дублируются |
| **Содержимое → Витрина Nebula** | блоки главной, content, desktop/mobile media, единственный редактор order, draft/preview/publish; visibility read-only badge/link |
| **Настройки → Настройки витрины** | единственный редактор visibility, общих home limits/fallback и home-review presentation (`home_review_card_limit`); review policy отсутствует; order read-only link |
| **Содержимое → Отзывы** | moderation queue и версии отзывов |
| `/{language}/admin/geo-content/index` — **Контент стран и городов** | операционная очередь G2.GEO: inventory, source/draft/review/publish/readback/failure status и rollback; не дублирует редакторы сущностей |
| `/{language}/admin/country/update?id=...` и `/{language}/admin/geoname/update?id=...` | канонические редакторы content/SEO/media полей одной страны или города |
| `/ru/admin/settings/reviews` | единственный G3.3 editor review policy, eligibility, moderation, author modes, `profile_review_card_limit`, aggregate/rating и historical override |
| `/ru/admin/settings/matching` | G3.4 questions, branching, versioned matching mapping и explanation preview |
| `/ru/admin/settings/expert-ranking` | G3.7 eligibility contract, ranking, surface preview и только read-only fresh paid-start readback; правило и действие принадлежат G1/G2/G6 |
| `/ru/admin/profile-field/index` в существующих **Полях анкеты** | методы, специализации, опыт, языки и единственный versioned taxonomy mapping |
| `/ru/admin/profile-field/completeness` в существующих **Полях анкеты** | единственный editor completeness rules, evaluation, preview и input override |
| существующие **Роли и permissions** | доступ; не дублируется в chat/consultation settings |
| существующие **Языки** | все тексты через translation keys |

На первом этапе новые административные действия доступны super-admin. Далее владелец раздаёт права через существующий permissions-контур.

## 3. Единый клиентский путь

```text
Витрина / каталог / geo
  → профиль Эксперта
  → авторизация при необходимости
  → бесплатный постоянный диалог
  → запрос клиента или предложение Эксперта
  → явное подтверждение клиента
  → connecting
  → trial, если есть entitlement
  → paid по начатым минутам
  → waiting / reconnect / balance pause при применимости
  → завершена
  → история, отзыв, support/refund/quality как связанные процессы
```

Выбранные Эксперт, тема и введённый вопрос сохраняются через авторизацию.

## 4. Консультационное ядро G1

### Каноническая запись

Одна consultation session:

- относится к одному клиенту, одной экспертной анкете и одному постоянному диалогу;
- хранит фактического Агента;
- сохраняет immutable snapshots цены, правил и назначений;
- допускает только один активный paid/pause режим для клиента;
- связывает сообщения, minute ledger, refund, support, quality и accrual;
- не переписывает историю при reassignment, refund или staff-действии.

Primary state имеет только значения `connecting / trial / paid / balance_pause / completed`. Waiting и reconnect являются подстатусами с причиной и отдельным clock.

Consultation-history projection имеет собственный retention и не является message storage. Message-storage/privacy retention, restricted evidence, financial ledger и audit управляются отдельными владельцами и не сокращаются настройкой клиентской projection истории.

### Бесплатный диалог и paid-режим

- Бесплатный диалог может продолжаться без consultation session.
- Клиент отправляет один ожидающий запрос либо Эксперт делает предложение.
- Принятие запроса Агентом только открывает confirmation card; session, connecting, trial и debit ещё отсутствуют.
- Committed explicit client consent для любого initiation path создаёт exactly one session в `connecting`.
- Trial и paid могут начаться только внутри этой consented session; trial не заменяет consent.
- Clarification, connecting и ожидание не списывают credits.
- Запрос, offer и timers управляются в админ-панели.

### Роли и авторство

- клиент видит «Эксперт», а не внутреннего Агента;
- Агент работает только с назначенной анкетой и разрешённым клиентским контекстом;
- moderator выполняет support/safety-функции;
- moderator и аварийный super-admin пишут как «Поддержка Nebula»;
- исторический public author и фактический actor хранятся отдельно.

### Цензура

Контакты, платежные данные, внутренние ID, секреты, ссылки и настраиваемые категории проверяются в обе стороны:

- отправитель видит свой исходный текст и отдельное предупреждение;
- получатель получает безопасную копию, где запрещённые фрагменты заменены на «ЦЕНЗУРА»;
- оригинал не раскрывается через quote, notifications, history или search;
- попытка создаёт один audit incident;
- super-admin видит мониторинг и ограниченный оригинал, а просмотр оригинала аудируется;
- отдельные категории можно включать и выключать;
- допустимые консультационные данные не блокируются только из-за того, что введены свободным текстом.

## 5. Деньги G2

### Credits и цены

- Пакеты продают credits за USD.
- Consultation показывает только credits за начатую минуту.
- Глобальная цена по умолчанию — 30 credits/мин.
- У анкеты возможна индивидуальная цена.
- Цена фиксируется в session snapshot и не меняется задним числом.
- Пакетная скидка уменьшает USD-стоимость credits, а не фиксирует число минут.

### Баланс

- общий баланс имеет понятную расшифровку;
- сначала расходуются бонусные credits с ближайшим expiry, затем бессрочные купленные;
- купленные credits не сгорают;
- expiry бонусных типов управляется;
- manual top-up доступен из кабинета, диалога и balance pause;
- auto-refill не входит в MVP.

### Minute ledger

- trial — entitlement в бесплатных минутах; при 0 этап пропускается;
- каждая paid-минута равна 60 секундам;
- полная цена атомарно списывается в начале минуты;
- retry/reconnect не создаёт дубль;
- следующая минута начинается только после всех проверок;
- при отсутствии баланса session один раз переходит в balance pause на 5 минут;
- пополнение не возобновляет paid автоматически: клиент нажимает «Продолжить»;
- client и agent reconnect по умолчанию 60 секунд и не начинают новую минуту;
- деньги, поступившие после технического завершения, остаются на балансе.

### Refund и compensation

- refund case является отдельным связанным процессом, а consultation остаётся завершённой;
- возврат credits по consultation и cash refund покупки — разные процессы;
- все refunds в MVP подтверждает super-admin;
- возврат восстанавливает исходные balance buckets;
- исходный ledger не переписывается, создаются correction entries;
- финансовая ошибка оставляет case открытым;
- appeal является внутренним управляемым процессом;
- компенсация credits/coupon в MVP фактически выполняется только после ручного решения super-admin с причиной; автоматическое правило может создать candidate/preview, но не начисляет credits само.

### Вознаграждение Агента

- начисление связано с session, expert profile и actual agent;
- consultation component, fixed/SLA component и task component разделены;
- новые правила применяются только к новым периодам;
- refund создаёт correction, не переписывая accrual;
- fixed/SLA и task components остаются disabled до отдельного enablement;
- проценты и eligible base могут оставаться `unset`, но скрытое начисление запрещено.

## 6. Витрина, каталог и профиль G3

### Главная G3.1

Первый экран:

> Персональная консультация Эксперта по вашему вопросу

Подзаголовок объясняет бесплатный диалог и явное подтверждение paid-режима.

CTA:

- «Подобрать Эксперта»;
- «Смотреть всех Экспертов»;
- для авторизованного клиента с диалогом — «Продолжить диалог»;
- при активной session — «Вернуться в консультацию».

Главная использует реальных eligible Экспертов из G3.7. Она не хранит параллельный вручную собранный пул и не показывает недоказанные accuracy, 24/7 или platform-wide числа.

Для отзывов G3.1 владеет только home presentation: enabled/visibility/layout/`home_review_card_limit`/fallback. Review policy, eligibility, moderation, author modes, aggregate/rating, historical override и `profile_review_card_limit` принадлежат только G3.3.

Стартовые управляемые лимиты главной: `6` тем на desktop и `4` на mobile, `6` карточек Экспертов, `3` специализации в компактной карточке, `6` FAQ, `3` последних консультации и `3` отзыва. Это отдельные versioned numeric cells с preview; они не меняют eligibility и не создают ручной пул анкет.

### Единая taxonomy

Единые верхнеуровневые категории на всех G3-поверхностях имеют короткое однословное название в фильтре и полное пояснение в админ-панели:

1. **Отношения / Relationships** — отношения и семья.
2. **Карьера / Career** — карьера, деньги и проекты.
3. **Будущее / Future** — выбор, будущее и перемены.
4. **Развитие / Growth** — личностный рост и внутреннее равновесие.
5. **Духовность / Spirituality** — духовность, карма и родовые темы.

Специализации и методы — разные оси. Полный утверждённый список и правила country/city-фильтра зафиксированы в `expert-specialization-taxonomy-v2-2026-07-29.md`. `expert_specialization_taxonomy_v1_legacy` сохраняет migration baseline существующего `id=18`, values `1–20`; первая активная Nebula taxonomy — `expert_specialization_taxonomy_v2`. В ней:

- `id=18:value=21 = Relocation & Life Changes` добавляется append-only;
- `id=18:value=13 = Energy Diagnostics` остаётся legacy/deprecated alias/history и исключается из active specialization mapping;
- `id=17:value=16 = Energy Practices` добавляется append-only в method axis;
- versioned mapping `id=18:value=13 -> id=17:value=16` сохраняет migration lineage;
- остальные legacy IDs не переиндексируются и не переиспользуются.

Исходные значения остаются в `/ru/admin/profile-field/index`. Единственный owner versioned category→specialization→method mapping — новая страница `/ru/admin/profile-field/expert-taxonomy` (`Поля профиля → Таксономия Экспертов`) в контуре G3.6. Storefront, catalog, profile, matching и ranking используют applied snapshot mapping и не создают локальные копии.

Completeness редактируется только на `/ru/admin/profile-field/completeness` в том же контуре «Поля анкеты».

### Geo-контент G2.GEO

`G2.GEO` — отдельный обязательный P0 implementation/content package вне канонических `30` primary tasks. Его результат — заполненные и проверенные страницы всех активных стран и городов во всех включённых локалях.

Обязательный поток:

```text
fresh inventory
  → preserved source lookup
  → source adaptation или Codex draft при доказанном gap
  → human review
  → controlled publish
  → admin readback + public readback
  → accepted либо rollback/failure queue
```

Сохранённый исторический корпус (`157 = 39 стран + 118 городов`, `942` locale pages, `1884` source-файла) используется source-first и не заменяется массовой генерацией. Codex готовит draft и не публикует его без review. Полная текущая live coverage после смены шаблона должна быть заново измерена; доказанные `180` восстановленных locale pages и RU `30/30` являются только частичным proof.

`/{language}/admin/geo-content/index` показывает операционное состояние и запускает/принимает content job, но редактирование конкретной сущности остаётся в существующих country/geoname update-формах. Переводы используют текущий locale/translation-контур; секреты или Codex credentials в admin не хранятся.

Границы:

- G2.GEO владеет текстом, SEO/media content completeness, source lineage, review, publish/readback и rollback;
- G3.2/G3.7 владеют eligibility, фильтрацией и порядком региональных Экспертов;
- G3.INT владеет presentation/backend binding;
- G3.5 владеет итоговой E2E-приёмкой клиентского пути.

Любое следующее обновление template/schema проходит обязательный regression guard: до миграции сохраняются locale-content snapshots/hashes, после миграции проверяются требуемые поля и публичный readback; при потере данных включение новой версии запрещено и выполняется rollback.

### Dashboard и каталог G3.2

Основной порядок фильтров:

1. тема;
2. специализация;
3. реальная доступность;
4. язык;
5. метод;
6. цена;
7. опыт и рейтинг.

География:

- является первичным hard eligibility на country/city страницах;
- если региональный eligible result пуст, региональная страница явно показывает общий eligible pool с теми же негеографическими фильтрами и плашкой об отсутствии Экспертов в выбранном регионе;
- fallback не выдаёт общие анкеты за локальные, фиксирует `regional_result_count=0` и не создаёт региональную подписку/уведомление о появлении;
- в общем dashboard география не применяется как скрытый hard filter и региональный fallback туда не переносится;
- география может быть явным дополнительным фильтром в общем каталоге.

Пустой результат региональной выборки не расширяется скрыто: сначала фиксируется zero regional result, затем разрешён только объяснимый fallback в общий eligible pool с сохранением остальных фильтров. Если общий pool тоже пуст, объясняются критерии и предлагается снять фильтры/изменить запрос. Недопустимые анкеты не подмешиваются.

### Карточка и профиль G3.3

Карточка содержит:

- фото и публичное имя;
- реальный status available/busy/offline;
- короткий headline;
- 2–3 специализации и `+N`;
- основной метод;
- опыт;
- фактическое число завершённых консультаций;
- rating и число опубликованных отзывов;
- effective credits/min;
- применимый trial/bonus;
- CTA.

Не показываются dating-поля, внутренний Агент, KPI/SLA и отдельный verification badge.

### Подбор G3.4

Подбор является дополнительным, пропускаемым путём. Он не создаёт paid session и не скрывает критерии выбора. Результат объясняет совпадение по теме, языку, доступности, методу и другим выбранным критериям.

Единственный редактор вопросов, branching и matching mapping — `/ru/admin/settings/matching`. Он читает taxonomy и eligibility как applied version и не изменяет их.

### Completeness и rotation G3.6–G3.7

- единый stable surface registry: `home`, `dashboard_catalog`, `country`, `city`, `category`, `matching_result`, `thematic_block`, `expert_profile`;
- все восемь records существуют явно; base-policy references и field-level overrides видны в preview/readback, скрытая inheritance запрещена;
- обязательность поля и его влияние — разные настройки;
- неполная анкета не публикуется, если отсутствует hard-required поле;
- score объясним и воспроизводим;
- eligibility отделена от ranking;
- versioned admission является обязательным внешним input G6.4; missing/stale admission даёт fail-closed eligibility, а G3.7 не создаёт и не редактирует admission;
- каждый результат выдачи содержит `display_eligible`, `reason_codes[]` и только capabilities `open_profile`, `send_free_message`, `notify_availability`, `create_consultation_request`;
- `paid_start_eligible` всегда повторно проверяется server-side непосредственно перед paid start и не наследуется из cached storefront result;
- отдельного capability ID для финансового старта нет; `create_consultation_request` только открывает request/consent flow;
- порядок стабилен при одинаковых входных данных;
- pin/priority/weight имеют preview и audit;
- KPI influence в пилоте disabled;
- public result совпадает с admin preview при одинаковых входах.

V3 pilot minimum включает taxonomy v2, manual completeness input и eligibility/manual order при disabled KPI. Автоматическая completeness/ranking/KPI-ротация относится к V5 public scale.

### Сквозная интеграция G3.INT

G3.INT — implementation package, который переносит принятую Oracle / Nebula presentation-часть на существующий backend Confideline. Он не является новой продуктовой задачей, не меняет реестр 30 задач и не забирает ownership у G3.1–G3.7.

В единой mapped build должны быть связаны восемь stable surfaces: `home`, `dashboard_catalog`, `country`, `city`, `category`, `matching_result`, `thematic_block`, `expert_profile`. Для каждой фиксируется crosswalk:

```text
Figma/source package
  → Confideline route
  → controller/view/theme asset
  → canonical data/action owner
  → guest/auth/private states
  → focused proof
```

Интеграция:

- разбирает source HTML/CSS/JS на Yii2 layout/partials/assets без переноса demo data и demo JS как бизнес-логики;
- использует реальные projections G3.1–G3.7, G1/G2/G4/G5/G6 и не сохраняет их параллельные копии;
- сохраняет auth intent и вызывает канонический free-dialog/request/consent flow без автоматического paid start;
- поддерживает RU/EN keys, SSR/SEO, accessibility, пять ширин, loading/empty/error/degraded states;
- разделяет public cache и client-private composition;
- вводится через versioned preview/limited/active modes с rollback только presentation/config слоя;
- передает named build и page-level evidence в независимый G3.5 gate.

Если для country/city/category/matching/thematic surface нет доказанного source binding, строка остаётся `blocked_source`. Общий CSS или donor page не используются для самостоятельного дорисовывания отсутствующего визуального контракта.

## 7. Отзывы

G3.3 — единственный owner этого раздела. G3.1 только показывает готовую home projection и не меняет правила или aggregate.

- Обычный отзыв доступен после завершённой консультации.
- Автор — реальный пользователь.
- Один актуальный отзыв относится к одной consultation.
- Rating обязателен, текст может быть необязательным.
- Автор выбирает разрешённый формат публичности.
- Новый или изменённый отзыв проходит moderation.
- В рейтинг входят только опубликованные consultation-linked отзывы.
- При отсутствии опубликованных отзывов блок скрывается.

Для исторического testimonial допускается только отдельный безопасный super-admin override через impersonation:

- обязательны причина, источник и подтверждение согласия;
- `verified_consultation=false`;
- такой testimonial не влияет на рейтинг;
- нельзя глобально отключать правило завершённой consultation для всех пользователей.

## 8. Контент, переводы и legal

- Русский и английский готовятся первыми.
- Любая строка интерфейса хранится как translation key.
- Существующая система SEO/translation переиспользуется.
- G3.INT инвентаризирует строки новой Oracle / Nebula-верстки, создаёт недостающие ключи в существующем Yii/Confideline translation-контуре и удаляет hardcoded production copy.
- Для каждой включаемой публичной локали требуется 100% покрытие обязательных ключей подключаемой поверхности и admin/public readback; неполная локаль не переводится в `nebula_active`.
- Допуск задаётся явной матрицей `surface × rollout locale`, которая ссылается на существующие Language IDs; глобальная активность языка не доказывает готовность новой Nebula-поверхности.
- Раздел `Языки` остаётся единственным местом создания и редактирования ключей и переводов. Для Nebula добавляется однозначный scope/filter и видимый контроль покрытия, без второй translation-админки.
- Массовый translation import работает только после dry-run/diff и preimage; не может создавать/активировать языки или менять их статус, применяется атомарно, поддерживает идемпотентный повтор, audit и rollback.
- Функциональные владельцы G1–G4 утверждают смысл своих сообщений; G3.INT отвечает за техническое создание ключей, подключение переводов и проверку покрытия, но не меняет business/support/legal wording.
- Для disclaimer добавляется один канонический ключ; историческая опечатка может поддерживаться временным alias.
- 18+, отсутствие гарантии результата и границы медицинской/юридической/финансовой/экстренной помощи проходят legal/content release gate.
- Полная censorship/refund/safety-механика находится в policies, а главная сообщает только понятные продуктовые факты.

## 9. Нефункциональная планка

- адаптивность 320/576/768/992/1200+;
- клавиатурная доступность;
- отсутствие горизонтального scroll;
- skeleton при загрузке;
- безопасный fallback без фиктивных Экспертов и цен;
- LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms на p75 для целевой выборки;
- публичные страницы индексируются;
- баланс, консультации и персональные блоки не индексируются;
- кэш не показывает устаревший status или возможность старта;
- события аналитики имеют стабильные имена и не содержат PII.

## 10. Что означает «сайт готов»

Готовность требует одновременно:

1. эталонных ТЗ и Codex-context по каждой задаче;
2. реализации;
3. миграций и admin readback;
4. positive/negative/concurrency/security tests;
5. визуальной проверки по Figma;
6. runtime evidence на одной сквозной consultation;
7. limited pilot и baseline;
8. отдельного GO по O5 до публичного трафика.

Полная документация не заменяет эти пункты.
