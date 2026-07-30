# ТЗ для Игоря — G3.3 «Публичный профиль Эксперта»

Продуктовая постановка для вычитки и согласования с программистом. Документ описывает, что клиент должен увидеть и сделать на полном публичном профиле Эксперта. Способ реализации выбирает Игорь. Визуальная основа берётся из существующих Figma-экранов и компонентов, но booking-логика из текущего reference HTML не является продуктовым требованием.

## 1. Цель

Клиент должен принять осознанное решение:

- подходит ли ему конкретный Эксперт;
- по каким темам и методам работает Эксперт;
- на каком языке проходит общение;
- каков подтверждённый опыт;
- доступен ли Эксперт сейчас;
- сколько стоит начатая минута;
- какие реальные отзывы оставили пользователи;
- как бесплатно задать вопрос и при каких условиях может начаться paid consultation.

Профиль должен продавать доверие к публичной анкете без раскрытия внутреннего Агента и без неподтверждённых обещаний результата.

## 2. Сущность и граница

G3.3 описывает **публичный профиль Эксперта**.

Публичный профиль:

- является отдельной устойчивой анкетой/персоной;
- может быть назначен одному фактическому Агенту в данный момент;
- сохраняет имя, контент, reviews и public rating при reassignment;
- не раскрывает имя, ID, workload, KPI или финансовую мотивацию Агента;
- использует availability из G1/G6;
- использует price/trial из G2;
- передаёт каноническую карточку и profile projection потребителю G3.2;
- использует taxonomy и completeness только из G3.6;
- использует финальные display/action eligibility и ranking только из G3.7.

Compact card на G3.1/G3.2 является сокращённой проекцией этого профиля. Она не хранит отдельную копию данных.

Стабильные surface IDs единого G3-контракта: `home`, `dashboard_catalog`, `country`, `city`, `category`, `matching_result`, `thematic_block`, `expert_profile`. G3.3 нативно владеет содержимым `expert_profile` и отдаёт card/profile projection остальным поверхностям; ни одна поверхность не получает скрытый локальный вариант данных.

## 3. Визуальный источник

Используются существующие Figma Expert Page и shared public components.

Правила:

1. Figma определяет layout, surfaces, typography, components, images и responsive behavior.
2. Тексты, fields, credits, CTA, review rules, availability и states определяются этим ТЗ.
3. Текущий reference flow `Book a session → Pick duration → Confirm payment` исключается: Nebula использует бесплатный диалог, request, consent, trial и поминутный paid mode.
4. Static name, rating, session count, schedule, USD price и claims заменяются реальными данными.
5. Missing states должны быть добавлены как варианты существующей Figma-системы, а не придуманы независимо в коде.

## 4. Роли

### Гость

Может:

- просматривать публичный профиль;
- читать темы, методы, опыт и опубликованные отзывы;
- начать «Задать вопрос».

Перед отправкой вопроса проходит auth; выбранный Эксперт, тема и введённый вопрос сохраняются.

### Авторизованный клиент

Может:

- открыть/продолжить один постоянный бесплатный диалог с этой экспертной анкетой;
- отправить вопрос;
- увидеть применимые price, trial/bonus и доступные полные минуты;
- перейти в request/consent flow;
- оставить отзыв по завершённой consultation.

### Эксперт

Публичная роль в интерфейсе. Может иметь технический доступ к разрешённой части своих данных, если это включено permissions, но не может публиковать неподтверждённые изменения или управлять reviews/rating.

### Агент

Внутренняя роль человека, ведущего одну или несколько анкет. Видит и действует только в рамках назначенных профилей. Клиент не видит связь profile → Agent.

### Moderator

Может модерировать разрешённые изменения/отзывы, если владелец назначит право. В MVP новые настройки доступны super-admin.

### Super-admin

Управляет профилем, taxonomy, moderation, individual price link, region/language assignments, publication/blocks и review rules. Все важные действия имеют audit.

## 5. Состав публичного профиля

### 5.1. Первый экран

- фото;
- публичное имя;
- реальная availability;
- public headline;
- короткое описание;
- effective price в credits/мин;
- применимый текущему клиенту trial/bonus;
- rating/review count, если допустимо;
- подтверждённый опыт;
- системное число завершённых consultations либо отдельно подтверждённый historical count;
- основной CTA.

### 5.2. О себе

- расширенное public bio;
- стиль консультации;
- языки;
- допустимые availability expectations без ложного SLA.

### 5.3. Темы и методы

- primary specialization;
- остальные specializations;
- primary method;
- остальные methods;
- краткое понятное объяснение, если translation/content заполнены.

Topic и Method визуально и семантически разделены.

### 5.4. Опыт

Используется существующее поле `My Experience`, id=20:

- 1+ год;
- 3+ года;
- 5+ лет;
- 7+ лет;
- 10+ лет;
- 15+ лет;
- 20+ лет.

Существующее `Number of Consultations`, id=19, является заявленным диапазоном. Оно не заменяет системный счётчик завершённых sessions.

### 5.5. Отзывы

- rating summary;
- количество опубликованных review;
- список отзывов;
- формат публичного автора;
- дата в локальном timezone клиента;
- pagination/load more;
- отсутствие блока при отсутствии опубликованных отзывов.

### 5.6. Действие и правила

- «Задать вопрос»;
- «Продолжить диалог», если он уже существует;
- статус busy/offline;
- price/trial explanation;
- link на правила consultation и support.

Прямой click не начинает paid mode.

## 6. Новые и уточнённые поля профиля

Нужно поддержать:

- Public headline;
- Short card description;
- Full public bio;
- Consultation style;
- Primary specialization;
- Primary method;
- Topics;
- Methods;
- Languages;
- Regions multi-select;
- Experience;
- public photo/media;
- publication/moderation status.

Все тексты используют translation-aware подход существующего сайта. Если профиль ведётся на одном исходном языке, правила fallback/translation должны быть явными.

## 7. Taxonomy

Профиль использует единый справочник G3.6; G3.2 только потребляет его в каталоге:

- однословные верхние topics;
- вложенные specializations;
- methods отдельно;
- styles отдельно.

Нельзя одновременно публиковать одно legacy значение как несовместимые Topic, Method и Style без явного правила совместимого преобразования.

Unsafe/ambiguous labels проходят content/safety review. Переименование сохраняет historical alias и assignment.

## 8. Цена, trial и баланс

1. Профиль показывает effective price в credits/мин.
2. Если индивидуальная цена не задана, используется активная global price G2.1.
3. USD minute price не показывается.
4. Trial/bonus отображается только если он реально применим к текущему клиенту.
5. Guest видит только общие условия; нельзя обещать персональный trial до определения entitlement.
6. Авторизованный клиент может видеть баланс и рассчитанные полные минуты рядом с action, если это соответствует согласованному Figma-state.
7. Price и entitlement повторно проверяются перед request/paid start.
8. Изменение цены не переписывает уже созданную session.

## 9. Availability и действия

### Доступен

- можно открыть/продолжить бесплатный диалог;
- можно отправить request;
- фактический paid start требует G1 consent и повторной проверки.

### Занят

- profile остаётся доступным;
- можно написать бесплатно;
- можно выбрать другого Эксперта;
- нельзя обещать немедленный paid start.

### Офлайн

- profile доступен, если published/eligible;
- можно написать;
- можно включить уведомление о доступности, если функция активна.

### Blocked / unpublished / ineligible

- профиль не показывается в каталогах;
- прямой URL возвращает принятую безопасную страницу unavailable/not found;
- request/paid start запрещён;
- внутреннюю причину клиенту не раскрывают.

## 10. Бесплатный вопрос и auth

1. Guest может начать ввод вопроса.
2. До отправки система требует auth.
3. После auth восстанавливаются профиль, тема и вопрос.
4. Перед отправкой повторно проверяется право на диалог с этим профилем.
5. Одна пара `client + Expert profile` использует один постоянный бесплатный диалог.
6. Повторная отправка одной команды не создаёт второй identical message/request.
7. Платная consultation не начинается автоматически.

## 11. Отзывы и rating

G3.3 «Отзывы» — единственный владелец review policy, eligibility, moderation, author modes, aggregate/rating и historical override. G3.1 управляет только представлением готовой projection на главной (`enabled`, visibility, layout, `home_review_card_limit`, fallback) и не дублирует эти правила.

### Обычный review

1. Реальный авторизованный пользователь.
2. Реально завершённая consultation с этим Expert profile.
3. Один текущий review на consultation.
4. Rating обязателен; text может быть необязательным.
5. Разрешённый author display mode выбирает пользователь.
6. До публикации review проходит configured moderation.
7. В rating входят только опубликованные review, связанные с завершённой consultation.

### Historical override

Для переноса реальных исторических отзывов:

- отдельный toggle доступен только super-admin;
- super-admin использует `login-as-user` и ту же client form;
- общее правило для обычных пользователей не отключается;
- обязательны реальный user, Expert, причина, source/consent и audit;
- consultation reference может отсутствовать;
- для такого отзыва канонически сохраняется `verified_consultation=false`;
- такой review не влияет на rating и не участвует в расчёте среднего значения или количества подтверждённых отзывов;
- он не помечается как подтверждённая consultation.

### Модерация и версии

Состояния:

`draft → submitted → under_review → published | rejected → hidden`.

Редактирование опубликованного review создаёт version и, если правило включено, повторную moderation. Физическое удаление истории запрещено.

## 12. Reassignment и история

1. Public profile остаётся той же сущностью при смене Agent.
2. Public name/content/reviews/rating/URL не сбрасываются.
3. Новые actions используют active assignment.
4. Старые consultations сохраняют actual Agent snapshot.
5. Если assignment отсутствует, новый paid start запрещён; profile может быть offline/unavailable по принятому правилу.
6. Клиент не видит фамилию/ID нового или старого Agent.
7. Super-admin видит current assignment и историю.

## 13. Publication и moderation профиля

Публичные состояния:

- Draft;
- On moderation;
- Published;
- Temporarily unavailable;
- Blocked;
- Archived.

Изменения risk/public fields:

- не попадают в public profile до разрешённой публикации;
- имеют author, time, reason и version;
- сохраняют current public version до принятия новой;
- не удаляют historical content.

Photo, headline, bio, topics/methods и claims проходят применимую moderation.

## 14. Админ-панель и ownership настроек

Владельцем административного управления профилем является super-admin. На первом этапе все перечисленные действия доступны только super-admin; позднее доступ может быть выдан через существующий permissions без создания параллельной системы ролей.

Раздел профиля не дублирует цены, роли, переводы, session lifecycle или финансовые настройки. Он хранит и редактирует только данные публичной анкеты и ссылки/readback на канонические источники смежных функций.

### Профиль Эксперта

Содержит:

- public fields;
- topic/method/style assignments;
- languages;
- regions;
- experience;
- moderation/publication;
- link на individual price owner;
- current assignment readback;
- reviews summary/link;
- eligibility/completeness summary;
- audit/history.

### `Поля профиля → Таксономия Экспертов`

Управляет shared topics/methods/styles, не отдельной копией профиля.

### `Содержимое → Отзывы`

Только moderation queue, search/filter/view/decision/history. Отдельная admin creation form не создаётся.

### `Настройки → Отзывы`

Управляет:

- review enabled;
- completed consultation requirement;
- super-admin historical override;
- min/max text;
- rating required;
- author display modes;
- edit window;
- re-moderation;
- `profile_review_card_limit`;
- sort;
- minimum count for block;
- retention/history.

`home_review_card_limit` отсутствует на этой странице и принадлежит G3.1 «Настройки витрины».

Цена, roles, chat, consultation и rotation не дублируются.

## 15. Переводы

- все labels/messages/fields используют translation keys;
- RU и EN обязательны на этапе handoff;
- dynamic taxonomy переводится через единый registry;
- missing translation uses configured fallback;
- raw key/ID не показывается;
- public bio/headline translation policy должна быть видна super-admin.

## 16. SEO

1. Published public profile индексируется, если eligibility позволяет.
2. Есть canonical stable URL.
3. Title/description/hreflang используют существующий SEO/translation owner.
4. Agent/internal data, balance и personal trial не входят в public HTML/structured data.
5. Blocked/unpublished/archived profile получает согласованный noindex/404/redirect behavior.
6. Review structured data использует только допустимые опубликованные review и честный aggregate.
7. Reassignment не меняет public canonical URL.

## 17. Analytics

Без question/review text и личных данных:

- profile viewed;
- source surface;
- topic/method expanded;
- review section viewed/load more;
- question CTA;
- auth started/completed with restored context;
- dialogue continued;
- availability notification;
- unavailable result;
- support/policy link;
- load/retry error.

Agent identity и внутренние quality flags не отправляются в public analytics.

## 18. Loading, empty и error

- profile loading — skeleton по Figma structure;
- review loading — отдельный skeleton;
- no reviews — block hidden or safe empty state;
- missing optional field — section omitted without empty label;
- missing required public field — profile cannot be newly published;
- dependency error — safe partial state and Retry;
- unavailable profile — no fake replacement and no paid CTA;
- image error — accessible fallback without layout break;
- analytics error — no user-flow interruption.

## 19. Accessibility и performance

- keyboard and visible focus;
- semantic heading order;
- accessible rating label, not stars only;
- availability not color-only;
- images have meaningful alt or decorative state;
- controls have translated names;
- mobile CTA remains visible without covering content;
- no horizontal overflow;
- no nested interactive conflicts;
- LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms at 75th percentile;
- reviews/media are paged/lazy-loaded without losing accessibility.

## 20. Особые и ошибочные случаи

1. Stale price/status after page load — action revalidates.
2. Assignment changes while profile open — no foreign/old Agent action.
3. Profile becomes blocked — CTA denied and public cache invalidated.
4. Guest returns after auth after profile removed — explain unavailability, preserve question only according to privacy policy.
5. Duplicate question/review/notify command — one business result.
6. Concurrent review edits — explicit version conflict, no silent overwrite.
7. Historical override toggled off — existing review remains auditable; new override creation blocked.
8. Review rejected/hidden — rating aggregate updates consistently.
9. Invalid experience/consultation count — no misleading public display.
10. Translation/content missing — required publication blocks; optional section hides.
11. Unauthorized Agent edits another profile — denied server-side.
12. Partial save — current published profile remains consistent.

## 21. Критерии готового результата

### Positive

1. Guest/client sees one coherent public profile on RU/EN and all breakpoints.
2. Compact card values equal full profile source.
3. Topics, methods, styles, languages and experience come from canonical sources.
4. Price/trial/status equal G1/G2/G6 readback.
5. Auth preserves question intent.
6. Free question does not start paid mode.
7. Published reviews and aggregate follow rules.
8. Reassignment preserves public identity/reviews and uses new active Agent.
9. Draft/moderation/publish/history works.
10. SEO, analytics, accessibility and performance pass.

### Negative

1. Client cannot see Agent/internal flags.
2. Stale/blocked/unassigned profile cannot start paid.
3. Unauthorized edit/direct action is denied.
4. Duplicate/retry/concurrent actions do not create duplicates or lost updates.
5. Historical review without consultation does not affect rating.
6. Invalid/missing required content does not publish.
7. Cross-profile reassignment or review linkage does not leak.

## 22. Связанные задачи

- G1 — dialogue/request/session/notifications;
- G2 — price/trial/balance/debit;
- G3.1 — home presentation consumer; G3.2 — catalog/card consumer;
- G3.4 — matching;
- G3.5 — E2E;
- G3.6 — taxonomy/completeness;
- G3.7 — final display/action eligibility и ranking;
- G4 — policy/support/dispute;
- G5 — events;
- G6 — assignment/admission/quality/access.

## 23. Что не входит

- new independent visual design;
- fixed-duration booking;
- full catalog/matching;
- consultation/debit/refund implementation;
- Agent workspace;
- training/admission rules;
- final legal/brand;
- admin-created fictional reviews;
- post-pilot KPI ordering.

## 24. Действия Игоря

### Перед реализацией

Игорь возвращает:

- exact Figma profile/card nodes and states;
- карта действующего публичного профиля и его административного редактирования;
- current fields/translation/SEO/review source map;
- assignment/price/availability integration map;
- план совместимого перехода для полей 17–21 и публичных данных;
- moderation/versioning proposal;
- positive/negative test plan;
- product conflicts.

### После реализации

Игорь предоставляет:

- build marker;
- guest/client/Agent/super-admin proof;
- card/profile consistency;
- auth/question/start boundary;
- review/moderation/historical override/rating proof;
- reassignment/stale/blocked/unauthorized/duplicate/concurrent proof;
- admin persisted readback/audit;
- RU/EN responsive/SEO/analytics/accessibility/performance evidence;
- cleanup/rollback/residual notes.

## Основание продуктового решения

- owner decisions по роли Эксперт/Агент, price, reviews, experience и CTA;
- G1–G6 ownership map;
- live profile fields/readback;
- existing Expert Page/Home/All Psychics Figma;
- official competitor card/profile patterns как benchmark, не product policy.

## Служебные сведения о документе

- Task: G3.3.
- Название: Публичный профиль Эксперта.
- Приоритет: P0.
- Фаза: client pilot / expert discovery.
- Связанный технический контекст: `codex-context-g3-3-expert-profile.md`.
- Версия: 1.0.
- Дата: 2026-07-29.
