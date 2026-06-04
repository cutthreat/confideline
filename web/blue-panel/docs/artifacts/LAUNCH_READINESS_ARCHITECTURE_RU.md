# Launch Readiness Architecture для YouDate / Nebula

Дата: 2026-06-04
Роль документа: единая архитектура готовности к запуску P0.
Логика: сначала универсальная платформа paid P2P services, затем Nebula как первая нишевая упаковка.

## 1. Главная цель

Собрать проект в управляемую систему запуска:

`трафик -> оффер -> регистрация/выбор исполнителя -> оплата -> запрос -> назначение -> ответ/чат -> support/refund -> повторная покупка -> аналитика -> масштабирование`.

P0 готов только тогда, когда этот путь можно пройти с 5 экспертами, тестовыми платежами, понятной админкой, уведомлениями, поддержкой, QA и ежедневным операционным контролем.

## 2. Что считаем универсальной платформой, а что dating-логикой

### Универсальное ядро

Это функционал, который подходит не только для dating, но и для эзотерики, юридических консультаций, психологических услуг, коучинга и других P2P expert-service сценариев:

- профиль исполнителя/пользователя;
- поиск и фильтры по критериям;
- карточки, фото, описание, специализация, языки, доступность;
- чат, история сообщений, вложения, шаблоны;
- избранное/сохраненные профили;
- online/status/availability;
- рейтинг, отзывы, жалобы;
- платные услуги, баланс, заказы, транзакции;
- роли, права, модерация, баны, ограничения;
- уведомления, email templates, рассылки;
- support/tickets/refunds;
- аналитика, отчеты, логи;
- продвижение профилей/видимость/ранжирование;
- мультиязычность и переводы.

### Dating-логика

Это то, что нельзя переносить в Nebula без переосмысления:

- цель знакомства, романтическое matching-positioning;
- взаимные лайки как начало отношений;
- сексуальные/романтические намерения в тексте;
- gender/age/preference как dating-фильтр, если они не нужны для услуги;
- adult/dating legal wording;
- подарки/флирт как dating-монетизация;
- premium-функции вроде “кто лайкнул меня” и “невидимка”, если они не служат покупке консультации;
- dating Terms/Privacy/Subscription language.

### Серая зона, которую нужно адаптировать

- `boost` -> поднятие эксперта/приоритет видимости;
- `likes` -> сохраненные эксперты/интерес к эксперту;
- `profile views` -> воронка карточки эксперта;
- `pings` -> операционная очередь действий;
- `mass messages` -> CRM/email/onsite campaigns;
- `premium` -> платные пакеты/сервисные уровни;
- `bots` -> автоматизация уведомлений, подсказок, прогрева, но не обман клиента.

## 3. Что уже подтверждено источниками

### Trello

- Доска содержит 291 карточку.
- По широкому фильтру найдено 112 карточек, связанных с Nebula, экспертами, email, обучением, чатами или смежными функциями.
- Отдельно сохранены редактированные безопасные выгрузки:
  - `trello-training-filter-redacted-2026-06-04.json`;
  - `trello-email-filter-redacted-2026-06-04.json`.
- В Trello есть явная карточка обучения: `Адаптация обучающего материала от Nebula`.
- Источник обучения находится не только во вложениях карточки, но и в правой области Trello - комментариях.
- Вложения карточки обучения: урок 1, урок 2, урок 6.
- Комментарии карточки обучения содержат дополнительные ссылки:
  - `Урок 3 (часть 1)` - Google Drive file;
  - две дополнительные Google Drive ссылки без явного названия в тексте комментария;
  - `Урок 5` - Google presentation;
  - `Урок 6` - Trello attachment link.
- Вывод: обучение уже собрано шире, чем было указано в первичном кратком выводе. Для подготовки панели школы нужно разбирать `description + attachments + comments`, а не только attachments.
- Есть задачи по email: `ТЗ по управлению email-рассылки из админки`, `Разобраться как работает система email-рассылки`, `Сделать e-mail шаблоны`, `Email tempates`, `Макеты для почтовых рассылок (ИИ)`.

### Банк знаний

- `NEBULA-MASTER.md` подтверждает: Nebula - платный human text consultation, не AI Tarot и не dating.
- `PBEXPERT.md` и full-launch audit подтверждают сильную базу по expert-chat, paid-session, Book Now, Pings, QA, certification, regulations.
- Quality gate требует разделять факты, выводы, рекомендации, источники и риски.

### Backend/admin

- QA-карта admin от 2026-05-30 подтверждает 54/54 admin routes OK.
- В admin есть разделы: users, orders, support, message/chat, pages, reports, bans, settings/payment/prices, email templates, languages, roles, logs.
- Это подтверждает наличие основы, но не подтверждает готовность Nebula end-to-end процесса.

## 4. P0 карта процессов

| Контур | Что должно работать | Что уже есть как основа | Что нужно закрыть |
|---|---|---|---|
| Клиент | оффер, выбор эксперта, оплата, вопрос, получение ответа, follow-up | дизайн Oracle/Nebula, backend Confideline, чат | связать frontend с backend, убрать dating copy, создать paid-service flow |
| Эксперт | задачи, чат, SLA, подсказки, шаблоны, начисления | admin chat, роли, пользователи, сообщения | экспертский кабинет/роль, очередь назначений, earnings, quality feedback |
| Агент | работа от назначенных профилей, контроль очереди, подсказки | частично через admin/chat | модель назначения анкет, права, журнал действий, ограничения |
| Админ | видеть весь процесс, просрочки, платежи, возвраты, support, качество | admin routes, orders, support, logs | единый operational dashboard, статусы сессий, escalation queue |
| Support | тикеты, ответы, возвраты, жалобы | support раздел | связка ticket -> order/session/client/expert, macros, refund tree |
| Финансы | платеж, заказ, транзакция, начисления, payout | balance/order/payment settings | payment adapter, sandbox path, payout ledger, refund hold |
| Маркетинг | воронка, UTM, email, retention, LTV | маркетинговые исследования, email tasks | CAC/LTV model, channel plan, retention scripts, stop rules |
| QA | тестовые сценарии до трафика | QA tester reports | P0 e2e test suite, role-based storage states, screenshots proof |

## 5. Критичные P0 вопросы и рабочие решения

| Вопрос | Рабочее решение P0 | Риск если не закрыть |
|---|---|---|
| SLA | Для async-first P0: видимый срок ответа, внутренние предупреждения, просрочка в admin queue | Клиент платит и ждет без контроля |
| Expert capacity | 5 экспертов сначала работают на ограниченном трафике, с лимитом одновременных задач | перегруз, просрочки, refund leakage |
| Failure states | Оплата прошла без вопроса, эксперт не ответил, клиент недоволен, чат завис, платеж не прошел, перевод ошибся | ручной хаос и потеря доверия |
| Admin visibility | Admin должен видеть очередь сессий, SLA, статус оплаты, эксперта, support/refund flags | команда не управляет сервисом |
| Quality control | Рубрика ответа, forbidden claims, QA выборка, low rating queue, санкции | плохие ответы, жалобы, возвраты |
| Retention | follow-up same expert, email after answer, saved transcript, повторный вопрос | LTV ниже CAC |
| Trust layer | карточки экспертов, отзывы, прозрачная цена, privacy, disclaimer, refund/help | низкая конверсия в оплату |
| Pre-launch QA | e2e сценарии с тестовыми клиентами/экспертами/админами/support | нельзя покупать трафик уверенно |

## 6. Июньский P0 план

1. Email/уведомления/рассылки: собрать существующие Trello задачи, текущий admin email-template функционал, P0 event matrix, сделать единый co2p пакет.
2. Admin chat для экспертов: связать платный чат, очереди, статусы, SLA, подсказки, QA и support.
3. Экспертский доступ/кабинет: определить роль, вкладки, права, задания, начисления, настройки, назначение профилей.
4. Обучение экспертов: поднять Trello уроки, PbExpert training package, Google forms/tests, собрать красивую панель школы.
5. Регламент эксперта: сделать owned Nebula/YouDate regulation на базе AskNebula/PbExpert, но без копирования сомнительных практик.
6. Admin visibility: operational dashboard P0, чтобы админ видел не вкладки, а состояние сервиса.
7. Failure states и QA: список аварийных сценариев и тестовый пакет до трафика.
8. Legal/content package: подготовить HTML-ready документы с переменными, но финальное legal approval оставить отдельным gate.

## 7. Legal/content package: что готовить

Документы должны быть адаптированы под универсальную paid-service платформу и Nebula-слой:

- Terms of Service;
- Privacy Policy;
- Cookie Policy;
- Payment Terms;
- Refund Policy;
- Disclaimer для эзотерических/развлекательных/самопознательных услуг;
- Expert Terms / Contractor Rules;
- Community / Communication Rules;
- Support Policy;
- Review Policy;
- Email/Marketing Consent text.

HTML-пакет должен использовать переменные:

- `{{PROJECT_NAME}}`;
- `{{LEGAL_ENTITY}}`;
- `{{SUPPORT_EMAIL}}`;
- `{{PAYMENT_DESCRIPTOR}}`;
- `{{REFUND_WINDOW}}`;
- `{{LAUNCH_GEOGRAPHY}}`;
- `{{SERVICE_CATEGORY}}`;
- `{{EFFECTIVE_DATE}}`;
- `{{COMPANY_ADDRESS}}`.

Юридические ориентиры для проверки:

- FTC negative option / subscription cancellation guidance;
- FTC reviews, endorsements and testimonials guidance;
- EU Consumer Rights Directive and digital contract rules;
- GDPR transparency requirements;
- EU DSA only if platform obligations become applicable by scope.

## 8. Что считать закрытием P0

P0 закрыт, когда есть:

- рабочая карта процессов;
- функциональная матрица `есть / частично / нет / доказательство / задача`;
- co2p пакеты по каждому P0 контуру;
- интерактивные макеты для новых admin/client/expert страниц;
- QA expected result документы;
- доказательства backend/admin наличия или gap;
- подготовленная школа 5 экспертов;
- email/уведомления без реальной рассылки;
- no-go список перед покупкой трафика;
- daily PM tracking standard.

## 9. Источники

Локальные:

- `H:\GPT-Codex\.ops\docs\projects\NEBULA-MASTER.md`
- `H:\GPT-Codex\.ops\knowledge\nebula\answers\product-curator-launch-readiness.md`
- `H:\GPT-Codex\.ops\knowledge\nebula\answers\trello-board-knowledge.md`
- `H:\GPT-Codex\.ops\knowledge\trello\dev-process\projects\NEBULA.md`
- `H:\GPT-Codex\.ops\knowledge\trello\dev-process\attachments\extracted-text-index.md`
- `H:\GPT-Codex\.ops\docs\projects\PBEXPERT.md`
- `H:\GPT-Codex\.ops\docs\projects\ASKNEBULA-PBEXPERT-FULL-LAUNCH-KB-AUDIT-2026-05-18.md`
- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\admin-functional-map-current.md`
- `H:\GPT-Codex-worktrees\platform-functionality-universe\.ops\reports\pm-autonomous-sprint-2026-06-04\P0_EVENT_NOTIFICATION_MATRIX_RU.csv`

Внешние ориентиры:

- FTC Negative Option Rule: https://www.ftc.gov/legal-library/browse/rules/negative-option-rule
- FTC Click to Cancel guidance: https://www.ftc.gov/node/86541
- FTC Reviews/Endorsements: https://www.ftc.gov/consumer-protection/endorsements-influencers-reviews
- EU Consumer Rights Directive: https://commission.europa.eu/law/law-topic/consumer-protection-law/consumer-contract-law/consumer-rights-directive_en
- EU Digital contract rules: https://commission.europa.eu/business-economy-euro/doing-business-eu/contract-rules/digital-contracts/digital-contract-rules_en
- GDPR overview: https://commission.europa.eu/law/law-topic/data-protection/reform/what-does-general-data-protection-regulation-gdpr-govern_en

