# Сквозная продуктовая архитектура Nebula: границы G1-G6

Статус: каноническая PM-карта ответственности для подготовки ТЗ  
Дата: 2026-07-27  
Область: консультации, чат, деньги, support, качество, аналитика и staff-контур

## 1. Назначение

Документ определяет:

- какие продуктовые объекты существуют в Nebula;
- какая задача G1-G6 владеет каждым правилом;
- какие процессы связаны с консультацией, но не являются ее состояниями;
- где в действующей админ-панели находится операционная работа и где меняются настройки;
- какие требования должны ссылаться друг на друга, но не дублироваться.

Если локальное ТЗ конфликтует с этой картой, конфликт должен быть устранен до передачи правильному исполнителю.

### 1.1. Два уровня ownership

`G1.1`, `G4.3` или другой G-код является владельцем продуктового правила, но не именем человека, который выполняет работу.

- Moderator/content operator выполняет разрешённые content, translation, profile/review, support и evidence операции.
- Super-admin выполняет assignments, protected configuration, refund/financial decisions, activation/rollback и полный audit.
- PM/legal/domain owner утверждает product/policy meaning и GO/NO_GO.
- Игорь реализует отсутствующий или сломанный technical contract.
- QA независимо принимает runtime.

Класс, operator-first action и technical escalation trigger каждой задачи определяет `task-execution-ownership-matrix.md`.

## 2. Канонический клиентский путь

```text
Постоянный бесплатный диалог
        |
        v
Запрос клиента или предложение Эксперта начать консультацию
        |
        v
Явное подтверждение клиента + принятие Экспертом
        |
        v
Одна карточка консультации
        |
        v
Подключение -> trial (если предоставлен) -> paid
        |
        +-> временное ожидание / reconnect
        +-> balance pause
        |
        v
Завершена
        |
        +-> клиентская история
        +-> support case
        +-> жалоба / спор
        +-> refund decision и финансовая операция
        +-> quality review / appeal
        +-> события, dashboard и KPI
```

Постоянный диалог может существовать до, во время и после нескольких консультаций. Он не является карточкой консультации и не хранит финансовый итог услуги.

## 3. Канонические продуктовые объекты

### 3.1. Постоянный диалог

Владелец: G1.2.

Одна пара `клиент + экспертная анкета` имеет один постоянный бесплатный диалог. Диалог хранит сообщения и их доставку, но не заменяет запрос, консультацию, возврат или обращение.

### 3.2. Запрос на консультацию

Владелец: G1.3. Связи: G1.2, G3.3-G3.4, G6.1-G6.2.

Запрос существует до создания консультации. Инициатором может быть клиент или Эксперт внутри бесплатного диалога.

Запрос хранит:

- инициатора;
- клиента и экспертную анкету;
- короткую тему/вопрос клиента;
- связь с постоянным диалогом;
- текущее состояние ожидания;
- уточняющий вопрос и срок ответа;
- решение Эксперта;
- подтверждение клиента;
- applied settings snapshot;
- итог: принят, отклонен, отменен или истек;
- ссылку на созданную консультацию, если она появилась.

Отклоненный, отмененный или истекший запрос не создает карточку оказанной консультации и не создает списание.

Lifecycle deadline запроса и внутренний SLA реакции Агента являются разными clocks. SLA breach может создать operational/quality route, но не закрывает request до его hard expiry, если отдельное правило явно не утверждено.

### 3.3. Карточка консультации

Владелец: G1.1. Lifecycle: G1.3. Деньги: G2.

После принятия запроса и выполнения обязательных условий создается одна карточка консультации. Она является паспортом конкретной услуги и связывает:

- клиента;
- публичную экспертную анкету;
- фактического Агента;
- постоянный диалог;
- относящиеся к консультации сообщения;
- состояния, подстатусы, таймеры и события;
- price/trial/billing snapshots;
- debits, refunds, corrections и compensation;
- support, dispute, quality и appeal records;
- итог и audit.

Карточка не дублируется в Chat, Support, Finance или Quality. Эти разделы открывают одну и ту же карточку по ссылке.

### 3.4. Support case

Владелец: G4.1.

Support case является отдельным процессом обслуживания клиента. Он может быть связан с консультацией, но имеет собственные статусы, SLA, переписку, владельца и итог.

### 3.5. Жалоба / спор

Владелец: G4.2.

Жалоба хранит клиентскую претензию, контекст, evidence, reviewer и итоговое продуктовое решение. Жалоба может создать:

- запрос финансового решения;
- quality review;
- safety/privacy incident;
- клиентскую апелляцию.

Жалоба не меняет состояние завершенной консультации.

### 3.6. Refund decision и финансовое исполнение

Владелец решения: G4.2.  
Владелец расчета и финансовой операции: G2.3.

Продуктовое решение и движение credits разделяются. Одно подтвержденное решение создает не более одной финансовой операции. Повторная доставка команды не создает второй возврат.

### 3.7. Compensation

Владелец правил/шаблонов и фактического начисления: G2.1 (`/ru/admin/settings/coupons` + существующая карточка баланса пользователя). G2.3 передаёт только связанные refund facts и compensation candidate/preview, но не владеет issuance.

Компенсация является отдельным бонусным начислением, а не возвратом. Фактический grant выполняет только super-admin вручную с обязательной причиной; автоматическое правило может создать только candidate/preview. Клиентское сообщение может обещать компенсацию только после успешного начисления.

### 3.8. Quality review

Владелец: G6.3.

Quality review является внутренней проверкой консультации и фактического Агента. Она имеет собственные scorecard, reviewer, verdict, action, sanction, correction и апелляцию Агента.

Quality review:

- не меняет public rating автоматически;
- не выполняет refund автоматически;
- не становится состоянием консультации;
- может создать refund candidate или ограничение paid access.

### 3.9. Событие, уведомление и KPI

- G5.1 владеет аналитическим событием и его определением.
- G1.4 владеет клиентскими уведомлениями консультации.
- G4.4 владеет support-уведомлениями.
- G6.5 владеет командными уведомлениями.
- G5.2 владеет dashboard.
- G5.3 владеет KPI, порогами и режимом влияния.

Ошибка аналитической доставки не должна менять результат consultation, refund или support case.

## 4. Состояния запроса на консультацию

| Состояние | Смысл |
|---|---|
| Ожидает ответа Эксперта | Клиент отправил запрос, списаний нет |
| Ожидает ответа клиента | Эксперт задал уточняющий вопрос |
| Предложено Экспертом | Эксперт предложил начать консультацию, требуется подтверждение клиента |
| Принят | Эксперт согласился, начинается подготовка подключения |
| Отклонен | Эксперт отказал; публичная и внутренняя причины разделены |
| Отменен | Клиент отменил запрос до фактического старта |
| Истек | Применимый timeout завершил ожидание без списания |

Один клиент может иметь только один активный или ожидающий запрос на платную консультацию. Бесплатные диалоги с другими Экспертами остаются доступны.

## 5. Состояния консультации

### 5.1. Основное состояние

| Состояние | Смысл |
|---|---|
| Подключение | Консультация создана, обе стороны готовятся к фактическому старту |
| Trial | Расходуются заранее предоставленные бесплатные минуты |
| Paid | Идет поминутная тарификация |
| Balance pause | Следующая полная минута не может начаться из-за баланса |
| Завершена | Единый конечный статус |

### 5.2. Операционный подстатус

Основной этап может временно сохраняться вместе с подстатусом:

- ожидание клиента;
- ожидание Эксперта;
- reconnect клиента;
- reconnect Агента;
- техническая проверка подключения.

Подстатус имеет отдельный таймер, причину, actor и deadline. Он не создает вторую consultation и не меняет финансовый этап без разрешенного перехода.

### 5.3. Завершение

Для завершенной консультации отдельно сохраняются:

- инициатор;
- тип завершения;
- внутренний reason code;
- клиентская формулировка;
- время;
- примененные правила;
- последняя фактически начатая минута;
- финансовый итог;
- необходимость support/quality/refund route.

`Technical end`, `balance timeout`, завершение клиентом и завершение Агентом являются типами/причинами результата, а не отдельными конечными состояниями.

## 6. Владельцы требований по G-задачам

| Область | Канонический владелец |
|---|---|
| Паспорт одной консультации и связи | G1.1 |
| Сообщения, авторство, вложения и цензура | G1.2 |
| Запрос, lifecycle, подстатусы, завершение и история | G1.3 |
| Клиентские consultation notifications | G1.4 |
| Цена, credits, trial entitlement и coupons | G2.1 |
| Started minute, debit, timer и hard stop | G2.2 |
| Расчет refund/correction и финансовое исполнение | G2.3 |
| Начисления Агенту | G2.4 |
| Клиентские страницы старта и карточка Эксперта | G3 |
| Support case | G4.1 |
| Жалоба, спор, клиентское решение и клиентская апелляция | G4.2 |
| Terms, privacy, consent и policy wording | G4.3 |
| Support notifications | G4.4 |
| Event catalog | G5.1 |
| Dashboard | G5.2 |
| KPI definitions и влияние | G5.3 |
| Marketing release gate | G5.4 |
| Assignment | G6.1 |
| SLA engine и operational clocks | G6.2 |
| Quality review, sanctions и appeal Агента | G6.3 |
| Training/admission | G6.4 |
| Team notifications | G6.5 |
| Staff workspace | G6.6 |
| Server-side staff isolation | G6.7 |

## 7. Размещение ответов по вопросам G1.3

| Номера решений | Куда включить |
|---|---|
| 1-8 | G1.3: запросы, ожидание и возврат к консультации; уведомления дополнительно G1.4 |
| 9-14 | G2.3/G4.2: refunds и compensation; G6.3 для fault review |
| 15-18 | G1.1/G1.3: единая карточка, история и edited marker; message behavior также G1.2 |
| 19-33 | G4.1: support workflow по принятому HTML-прототипу |
| 34-39 | G4.2 и G6.3: два вида appeal; G1.1 только связанные ссылки |
| 40-50 | G2.3/G4.2: refund request, decision, calculation, execution и client appeal |
| 51-59 | G6.2/G6.3: SLA, quality review, sanctions и quality appeal |
| 60-64 | G4.1: клиентские и staff support surfaces |
| 65-68 | G1.1/G1.3: terminal action, audit и concurrency |
| 69-75 | Сквозная карта админ-панели; настройки распределяются по владельцам |
| 76-77 | G6.3: quality settings и единая фактическая truth |
| 78 | G1.3: отображение ожидания, pause и reconnect |
| 79-80 | G5.2/G5.3: dashboard, KPI и управляемые thresholds |
| 81 | G3.INT.I18N: RU/EN source pair и 100% translation-key coverage/readback каждой локали, допущенной к Nebula rollout |
| 82 | G5.1 events; delivery в G1.4/G4.4/G6.5 |

## 8. Админ-панель: операционная работа

| Раздел | Назначение | Рекомендуемый маршрут |
|---|---|---|
| Консультации | список и единая карточка consultation | `/ru/admin/consultation/index`, `/view` |
| Сообщения | бесплатные диалоги, сообщения, delivery и censorship monitoring | существующий message-контур |
| Поддержка | очередь support cases | существующий `/ru/admin/support/index` |
| Финансы -> Возвраты | очередь решений и финансового исполнения | `/ru/admin/refund/index` |
| Контроль качества | reviews, incidents, sanctions и appeal Агента | `/ru/admin/quality/index` |
| Содержимое → Витрина Nebula | блоки, тексты, desktop/mobile media, единственный editor порядка, draft/preview/publish/schedule; visibility только read-only badge/link на `/ru/admin/settings/storefront` | новая страница в существующем разделе **Содержимое** |
| Содержимое → Отзывы | moderation queue, версии и публикационный readback; review policy не дублируется и редактируется только в `/ru/admin/settings/reviews` | новая страница в существующем разделе **Содержимое** |
| Аналитика | dashboard и KPI readback | отдельные G5-поверхности |

Agent workspace G6.6 является отдельной рабочей поверхностью. Размещение страницы в staff-контуре не заменяет permissions и server-side isolation G6.7.

## 9. Админ-панель: настройки

| Страница | Что редактируется |
|---|---|
| Настройки консультаций | запросы, lifecycle, ожидание, reconnect, balance pause и завершение |
| Настройки чата | сообщения, rate limits, chat attachments, edit/read behavior и censorship presentation |
| `/ru/admin/notification-rule/index` | категории, delivery channel, delays, quiet hours, retry/deduplication и retention уведомлений |
| `/ru/admin/settings/prices` | credits/minute, profile overrides, packages, package discounts и balance rules |
| `/ru/admin/settings/coupons` | coupons, bonus credits, trial entitlement, bonus expiry и promo eligibility |
| `/ru/admin/settings/accruals` | components, rates, periods, conversion и correction policy вознаграждения Агентов |
| Настройки поддержки | categories, statuses, support SLA, schedule и escalation |
| Настройки возвратов | eligibility, deadlines, limits, reasons и calculation rules |
| `/ru/admin/settings/storefront` | visibility/limits/fallback и home presentation; content/order редактируются отдельно в «Витрина Nebula» |
| `/ru/admin/settings/reviews` | review policy, eligibility, moderation rules, aggregate/rating и historical override |
| `/ru/admin/profile-field/index` | profile fields и единственный versioned taxonomy mapping |
| `/ru/admin/profile-field/completeness` | completeness rules, evaluation, preview и input override |
| `/ru/admin/settings/expert-ranking` | G3.7 eligibility/ranking/surface preview; paid-start только read-only readback |
| `/ru/admin/settings/matching` | G3.4 questions, branching и matching mappings |
| Качество и допуск | scorecard, critical fail, sanctions, re-admission и appeal Агента |
| KPI и влияние | definitions, windows, samples, thresholds и influence mode |
| Настройка ролей | существующие RBAC permissions |
| Языки/переводы | существующие translation keys; RU/EN source pair; полный coverage/readback всех локалей, допускаемых к Nebula rollout; дополнительные языки вне MVP — post-MVP |

Одно значение имеет только одно место редактирования. На связанных страницах допускаются read-only значение, applied snapshot и ссылка на каноническую настройку.

## 10. Границы страниц настроек

### Настройки консультаций не содержат

- пакеты и цену credits;
- refund policy;
- support statuses;
- quality scorecard;
- KPI formulas;
- role assignments.

### Настройки чата не содержат

- request/session timers;
- billing и compensation;
- support workflow;
- refund decisions;
- quality sanctions;
- KPI.

### Настройки поддержки не содержат

- consultation lifecycle;
- chat censorship rules;
- pricing;
- quality scorecard;
- KPI.

### Настройки качества не содержат

- финансовое исполнение refund;
- public rating;
- consultation state transitions;
- support conversation settings.

## 11. Сквозной контракт управляемых настроек

Для каждой изменяемой настройки обязательны:

- понятное название;
- значение, единица и допустимый диапазон;
- различение `unset`, `0` и `disabled`;
- scope: global/group/profile, если поддерживается;
- current и draft;
- preview результата;
- reason при изменении;
- actor и timestamp;
- version/effective time;
- audit/history;
- applied snapshot в новом request/session/case/review/KPI period;
- запрет обратного изменения уже начатого периода;
- rollback на предыдущую допустимую версию.

## 12. Неотключаемые invariants

Админ-панель не должна позволять отключить:

- server-side permissions и assignment isolation;
- audit важных staff/financial/state действий;
- idempotency финансовых и state-changing операций;
- запрет debit во время ожидания, reconnect и balance pause;
- cumulative refund выше eligible charges;
- сохранение исторических snapshots;
- запрет физического удаления финансовой и staff-истории;
- валидность state transitions;
- разделение public expert и actual agent;
- защиту получателя от раскрытия процензурированного оригинала.

Гибкая настройка чисел и режимов не означает возможность разрушить финансовую, privacy или access целостность продукта.

## 13. Разделение возврата, коррекции и компенсации

| Операция | Смысл | Решение |
|---|---|---|
| Refund | возврат ранее списанных credits | только ручное подтверждение super-admin |
| Correction | исправление ошибочного/дублированного ledger movement | защищенная операция super-admin; предотвращенный дубль не требует correction |
| Compensation | дополнительные bonus credits, при необходимости отображаемые как расчетный эквивалент минут | только ручное решение и фактический grant super-admin; автоматическое правило создаёт лишь candidate/preview |
| Cash refund | возврат USD за пакет | отдельный payment-dispute route |

Автоматический сигнал может создать candidate и calculation preview, но не подменяет обязательное ручное решение по refund или compensation.

## 14. Два вида апелляций

### Клиентская апелляция

- владелец: G4.2;
- предмет: решение по жалобе/support/refund;
- клиент видит статус и клиентский итог;
- срок и число попыток управляются в настройках возвратов/споров.

### Апелляция Агента

- владелец: G6.3;
- предмет: quality verdict, sanction или paid-access restriction;
- внутренняя переписка клиенту не видна;
- Эксперт/Агент не получает доступ к support ticket;
- функция может включаться/выключаться для новых решений;
- уже открытая апелляция не удаляется при изменении настройки.

## 15. Правило событий и уведомлений

Бизнес-модуль сначала фиксирует фактический результат, затем создает каноническое событие. Уведомление и аналитика потребляют это событие независимо.

Пример:

```text
refund approved
-> refund financial action committed
-> refund_completed event
-> клиентское уведомление
-> dashboard/KPI ingestion
```

Если финансовая операция не выполнена, сообщение не должно утверждать, что refund или compensation уже зачислены.

## 16. Порядок разработки и приемки

1. Запрос на консультацию и одна service session.
2. Связь с постоянным диалогом и message boundaries.
3. Lifecycle и state history.
4. Price/trial/minute/debit ledger.
5. Assignment, actual actor и server-side isolation.
6. Client/agent/super-admin readback.
7. Support case.
8. Жалоба и refund decision.
9. Финансовое исполнение refund/correction/compensation.
10. Quality/SLA/admission.
11. Events, dashboard и KPI.
12. Notification delivery.
13. Marketing release gate.

Статический HTML, ТЗ или макет подтверждают только проектное решение. Готовность сайта подтверждается отдельным runtime proof.

## 17. Source references

- `H:\GPT-Codex\.ops\knowledge\nebula\answers\expert-training-and-operational-knowledge.md`
- `H:\GPT-Codex\.ops\knowledge\video-intelligence\corpora\asknebula-training-2026-06-18\knowledge\asknebula-provided-training-materials-kb.md`
- `functional-tz-quality-standard.md`
- `etalon-tz-g1-1-service-session.md`
- `etalon-tz-g1-2-role-chat.md`
- `tz-g1-chat-service-session.md`
- `tz-g2-billing-refunds-compensation.md`
- `tz-g4-support-disputes-rules.md`
- `tz-g5-events-kpi-launch.md`
- `tz-g6-assignment-sla-quality-access.md`
- `tz-crosscut-admin-managed-settings.md`
- `admin-panel-settings-development-package.md`
- `qa-ba-autonomous-tester/reports/admin-functional-map-live-current.md`
