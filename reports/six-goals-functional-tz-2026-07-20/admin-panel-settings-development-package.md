# Programmer/QA package: админ-панель управления продуктовой конфигурацией

Дата: 2026-07-21  
Статус: `cross_vertical_requirement_handoff_ready_O1_O2_O3_O6_O7_O8_R1_P1_credit_model_accepted_not_runtime_verified`  
Coverage mapping: G1.2, G1.3, G1.4, G2.1, G2.2, G2.3, G3.3, G3.4, G3.7, G4.1, G4.2, G4.3, G4.4, G5.3, G6.2, G6.3, G6.4, G6.5.  
Тип: сквозной subpackage к существующим vertical 2/3/4/5; не является седьмым vertical и не дублирует 30-task coverage.

## Результат разработки

В существующем staff/admin settings-контуре имеются отдельные доменные страницы продуктовой конфигурации. Уполномоченная роль может увидеть, изменить, проверить и активировать разрешенные настройки; каждое изменение версионируется и применяется без переписывания уже начавшихся периодов и исторических решений.

Каноническая карта размещения: `product-architecture-g1-g6-ownership-map.md`. Один параметр редактируется только на одной доменной странице. Сводный readback может показывать параметры из нескольких доменов, но не создает вторую точку редактирования.

## Навигация и общая поверхность

Админ-раздел должен предоставлять:

1. список групп настроек со статусом `configured / configuration_missing / draft / active / retired`;
2. текущую активную версию, дату действия и автора последнего изменения;
3. переход в отдельные экраны `Настройки консультаций`, `Настройки чата`, `Настройки поддержки`, `Качество и допуск`, `KPI и влияние`, `Trust & Safety`, `Возвраты` и `Credits, цены и промо`;
4. понятные pending/success/failure при сохранении;
5. preview/readback фактически сохраняемой версии до и после активации;
6. историю версий и изменений;
7. role/permission guard для просмотра, редактирования, активации и override;
8. отсутствие dead controls: недоступное действие объяснено или скрыто, прямой вызов запрещен тем же правилом.

## Сквозной контракт времени и SLA

Это сводная карта clocks, а не самостоятельная дублирующая страница редактирования. Каждый параметр изменяется на указанной канонической странице.

Обязательные управляемые поля:

| Поле | Текущее значение | Единица/тип | Каноническая страница |
|---|---:|---|---|
| Request hard expiry | 15 | минут | Настройки консультаций |
| Paid request accept/decline SLA | 60 | секунд | G6.2 SLA settings/readback |
| Clarification client response | 60 | минут | Настройки консультаций |
| Expert proposal validity | 15 | минут | Настройки консультаций |
| Connection timeout | 3 | минут | Настройки консультаций |
| Trial entitlement default | 3 | бесплатных минут | Настройки консультаций |
| Inactivity reminder | 2 | минут | Настройки консультаций |
| Low-balance warning threshold | 2 | полных оплачиваемых минут | Настройки консультаций |
| Client return window | 4 | часа | Настройки консультаций |
| Balance pause duration | 5 | минут | Настройки консультаций |
| Balance pause count per consultation | 1 | раз | Настройки консультаций |
| Agent reconnect grace | 60 | секунд | Настройки консультаций |
| Client reconnect grace | 60 | секунд | Настройки консультаций |
| First meaningful response | 60 | секунд | Настройки консультаций / G6.2 contract |
| Support first response | 15 | минут | Настройки поддержки |
| Ordinary support escalation | 2 | multiplier SLA | Настройки поддержки |
| Critical support escalation | immediate | режим | Настройки поддержки |
| Expert SLA compensation proposal | `unset` | минут coupon grant | Credits, цены и промо / compensation |
| Consultation history retention | 24 | месяцев после завершения | Lifecycle/privacy G1.3/G4.3 |
| Support hours/calendar/timezone | operational config | schedule/timezone | Настройки поддержки |

`Expert SLA compensation proposal` — стартовое значение для ручного решения super-admin после подтвержденного Expert/Agent SLA failure. Оно не создает автоматического начисления. Клиентское уведомление может показывать конкретное число только после успешного ручного grant. Client reconnect, Agent reconnect и общий platform failure создают факты/кандидат для проверки, но сами не выдают coupon, refund или compensation.

Страница `/ru/admin/settings/consultation` размещается внутри существующего `/ru/admin/settings/index` отдельным пунктом «Настройки консультаций»: сразу после «Настройки чата» и перед «Настройки фото». Здесь находятся только lifecycle/timer-параметры consultation. Цена, coupons, refunds, support, RBAC и chat moderation остаются на своих канонических страницах и не дублируются.

`Consultation history retention` управляет клиентской историей сообщений. Legal/privacy review может изменить default. Dispute/refund/safety/legal hold применяется только к связанному evidence с обязательными reason, scope, owner, expiry/review и audit; финансовые/audit записи имеют отдельную retention policy.

Правила validation/readback/snapshot и AS1-AS10 определены в `tz-crosscut-admin-managed-settings.md`.

## Экран 2. Качество и допуск

### Scorecard

- Максимальный score: текущее значение 100.
- Проходной score: текущее значение 80.
- Max/pass управляются в admin и активируются одной согласованной версией; pass не может превышать max.
- Критический fail перекрывает итоговый score.
- Review сохраняет примененную scorecard version; последующее изменение не пересчитывает историю автоматически.

### Critical-fail registry

Admin управляет версионированным перечнем. Для каждого правила видны category, title, description, active state, resulting action и effective version. Текущий обязательный минимум:

1. скрытый или ложный billing state;
2. запрещенная гарантия результата;
3. pressure/fear/dependency manipulation;
4. пропуск обязательной safety escalation;
5. foreign-data/access action;
6. unauthorized refund/payment action;
7. раскрытие private client data;
8. выдача internal agent за публичного эксперта.

Перед paid pilot активная версия не может иметь пустой critical-fail registry. Retire/disable правила доступен только разрешенной роли, создает новую версию и требует причины; исторические reviews сохраняют прежнюю версию.

### Decision roles и override

- Первичный verdict: moderator/QA lead по разрешенной роли.
- Override/unblock: super-admin с обязательной причиной и audit.
- Admin-панель управляет role bindings через разрешенные роли, но не позволяет выдать право самому себе обходом текущего ACL.

### Appeal Агента

- feature toggle применяется только к новым quality decisions;
- текущий deadline — `7 дней`, numeric/admin-managed;
- обязательный комментарий;
- reviewer/decision actor в MVP — `super-admin`;
- Эксперт/Агент видит только допустимую категорию, action, effective period, deadline и appeal status;
- support ticket, refund details, raw client evidence и внутренняя переписка не раскрываются;
- уже открытая апелляция сохраняется при последующем отключении feature.

### Re-admission workflow

Текущая активная последовательность:

```text
correction -> retraining -> repeat test -> new trial consultation -> repeat review
```

Этапы, обязательность и порядок управляются как versioned workflow. Пропуск обязательного этапа не открывает paid access. Незавершенная draft-версия не влияет на действующий admission.

## Экран 3. KPI и влияние

### Активный pilot baseline

| Параметр | Текущее значение |
|---|---|
| KPI influence на public rotation | `disabled` |
| Разрешенное использование | operational readback / coaching evidence |
| Rolling window | 30 дней |
| Global minimum completed paid sessions | 20 на агента |
| Global minimum QA-reviewed sessions | 5 на агента |
| New/insufficient-data behavior | `insufficient_data`, без штрафа/pass |

Режимы `immediate` и `after_threshold` могут быть предусмотрены интерфейсом, но их активация запрещена до отдельного post-pilot owner decision и актуального evidence gate.

### Реестр KPI

Для каждого KPI admin управляет всеми изменяемыми параметрами:

1. название, описание, active/draft/retired state;
2. use mode: `readback`, `coaching`, `rotation_candidate`;
3. source events/records и обязательная coverage;
4. formula type, numerator, denominator и aggregation;
5. window length/unit, timezone и period boundary;
6. metric-specific minimum sample и global eligibility minimum;
7. inclusions/exclusions, включая technical interruption, test data, refund/correction и busy/off-shift;
8. attribution при reassignment и границу expert-profile/public rating против internal agent KPI;
9. direction `higher_is_better / lower_is_better / neutral_readback`;
10. target/warning/block thresholds, если применимы;
11. weight, normalization и cap/floor для будущего composite score;
12. freshness/stale threshold и поведение при missing/partial data;
13. role visibility и разрешенные действия;
14. effective date/version, reason и preview результата.

Admin не вводит произвольный исполняемый код формулы. Он выбирает и параметризует поддерживаемые продуктом formula/aggregation options; неподдерживаемая комбинация не активируется и объясняется.

### Initial KPI definitions

| KPI | Базовое определение для readback | Настраиваемые части |
|---|---|---|
| Paid request acceptance rate | accepted eligible paid requests / all eligible paid requests | eligibility, exclusions, window, sample, thresholds, direction |
| Missed paid request rate | missed eligible paid requests / all eligible paid requests | missed rule, exclusions, window, sample, thresholds |
| First-response SLA compliance | eligible started consultations within applied first-response SLA / eligible started consultations | meaningful-response rule, exclusions, window, sample, threshold |
| Trial-to-paid conversion | eligible trial sessions reaching paid / eligible completed trial sessions with consent | eligibility, technical exclusions, window, sample |
| Paid minutes/session duration | sum/average/median paid minutes over eligible completed paid sessions | aggregation, caps, exclusions, window, sample; readback only by default |
| Refund/correction outcome | refunded amount / eligible billed amount и affected sessions / eligible completed paid sessions | amount/session variant, eligibility, attribution, window, sample |
| QA score | average normalized score over QA-reviewed sessions | scorecard version, aggregation, window, minimum QA sample |
| Critical-fail rate | reviews with critical fail / QA-reviewed sessions | registry version, categories, window, sample; cannot be offset by commercial KPI |

### Preview и активация

1. Preview показывает current vs draft result на одном выбранном обезличенном периоде/агенте и причины `insufficient_data/stale`.
2. Активация создает одну согласованную KPI definition version; исторические периоды сохраняют прежнее определение.
3. При отсутствии coverage/freshness/denominator показатель не превращается в zero/pass.
4. Composite/rotation influence не активируется, если хотя бы один обязательный definition/weight/sample/evidence gate невалиден.
5. Сумма/нормализация weights проверяется как единый набор; partial save не меняет active set.
6. Refund, reassignment и technical correction пересчитывают только разрешенный текущий/readback период с audit lineage, не переписывая сохраненный historical decision без явной recalculation version.

## Экран 4. Trust & Safety

### Protected prohibited-claims registry

Admin-раздел содержит версионированные правила с category, public/internal description, trigger/examples, severity, required agent action, client message, staff route и active/effective state.

Protected minimum до paid pilot:

1. guarantees of result/win/healing/partner return/exact future;
2. fear, dependency, artificial incompleteness или hidden paid-state pressure;
3. medical, legal или financial diagnosis/instruction вместо профильной помощи;
4. external payment, hidden booking pressure или private-contact transfer;
5. privacy/foreign-data disclosure;
6. self-harm, violence, illegal и minor-sensitive cases как обязательная critical escalation.

Обычная authorized policy role может добавлять/уточнять более строгие правила и маршруты. Удаление, отключение или ослабление protected minimum не активируется без отдельного owner/legal approval, причины и новой версии.

### Incident categories и routes

Для каждой категории настраиваются:

- severity и critical/non-critical mode;
- обычный сценарий: continue with boundary / stop consultation / immediate end;
- запрет старта новой paid minute;
- ответственные support/moderator/super-admin roles и duty queue;
- acknowledgement/escalation deadline;
- client-facing message/template version;
- разрешенные resources и jurisdiction/language applicability;
- refund-candidate flag без автоматического финансового решения;
- agent paid-access pause/review action;
- required evidence и retention/readback status.

Для self-harm, violence, illegal и minor-sensitive critical cases активный minimum требует прекращения обычного консультационного сценария, запрета новой paid minute и немедленного staff route. Exact crisis resources и US-English wording активируются только после legal/domain review; отсутствие approved resource показывается staff как release blocker, а не заполняется выдуманным текстом.

### Обнаружение нарушения или critical situation

Система не считает любое автоматическое совпадение доказанным нарушением. Она создает safety signal, сохраняет evidence и запускает действие по active rule. Источники сигнала:

1. **System-enforced event:** запрещенная попытка доступа, unauthorized payment/refund action, hidden/incorrect billing state или другое объективное product event.
2. **Message monitoring:** проверка client и agent messages по active prohibited/critical rules до отправки или сразу после нее, согласно mode конкретного правила.
3. **Client report:** жалоба из session/message с категорией, комментарием и выбранным сообщением/эпизодом.
4. **Staff flag:** moderator/support/super-admin отмечает message/session вручную с причиной.
5. **QA review:** обязательный pilot review или выборочная последующая проверка выявляет нарушение.
6. **Reconciliation/anomaly:** расхождение session, billing, refund, access или staff action создает технический/финансовый signal.

Для голосового, внешнего или иного не наблюдаемого системой общения автоматическое обнаружение не заявляется. Оно возможно только по доступному approved transcript/record либо complaint/evidence route. Off-platform нарушение не считается «не было» только потому, что система его не увидела.

### Detection states и решение

```text
signal_created -> under_review -> confirmed_violation | dismissed_false_positive
-> actioned -> appealed/reopened (если применимо)
```

- Автоматический content signal сам по себе не создает окончательный штраф, refund или исторический critical fail агента.
- Protected critical signal может немедленно удержать запрещенное сообщение, остановить обычный сценарий, запретить новую paid minute и создать incident до human verdict.
- Объективно запрещенное system action блокируется сразу и сохраняет attempt/result.
- Moderator/QA подтверждает или отклоняет signal; super-admin override требует причины.
- Confirmed violation связывается с session, message/event, expert profile, actual agent, active rule/version и примененными действиями.
- False positive сохраняется для audit/quality improvement и не ухудшает KPI/допуск.

### Evidence packet safety signal

Для каждого signal/incident доступны:

- signal/incident ID, source и detection mode;
- rule/category/version и detector version;
- session/message/event references, client/expert/actual agent в пределах role access;
- detected time, минимально необходимый excerpt/context либо system-event facts;
- confidence/reason для автоматического сигнала без выдачи его за доказанный факт;
- provisional action, reviewer/verdict, evidence, reason и timestamps;
- final action, refund-candidate status, access/admission impact и appeal/override;
- dedup/linkage с уже существующим incident.

Обычная аналитика не получает raw client message. Контекст доступен только разрешенной review-роли и минимизируется до необходимого evidence.

### Chat privacy: запрет контактов и чувствительных личных данных

Защита действует server-side до фактической отправки в обе стороны `client -> expert/agent` и `agent -> client`. UI-предупреждение является только частью поведения и не заменяет прямой/API guard.

Protected categories по умолчанию:

1. телефоны и альтернативно записанные номера;
2. email;
3. messenger/social handles, invite links и просьбы перейти во внешний канал;
4. внешние URL, short links, QR/contact cards, кроме approved allowlist;
5. точный домашний/рабочий адрес и precise geolocation;
6. passport/identity/tax/social identifiers и изображения документов;
7. bank card/account/payment/crypto details;
8. authentication secrets, passwords, codes и recovery data;
9. полное юридическое имя и иные direct identifiers; дата, время и место рождения разрешены как consultation data;
10. любой набор данных, который в контексте позволяет обойти запрет внешнего контакта или идентифицировать частное лицо вне необходимого service scope.

First name, возрастной диапазон, город/регион, дата/время/место рождения, zodiac/topic и обезличенный relationship context не считаются автоматически запрещенными, пока не образуют direct contact identifier. Structured fields для astrology/Tarot inputs предпочтительны, но не обязательны: разрешенные consultation data могут передаваться свободным текстом.

### Поведение перед отправкой

1. Protected direct-contact/payment/identity/secret match использует current mode `sender_original_recipient_censored`: сообщение считается отправленным, но получатель получает версию с заменой каждого запрещенного фрагмента на `ЦЕНЗУРА`.
2. Отправитель видит исходный текст в своей истории и отдельное системное предупреждение о нарушении политики. Получатель не видит raw value.
3. Для каждой категории `super-admin` может отдельно включить или выключить проверку. Изменение требует причины, создает новую version/effective date и audit record.
4. Проверяются paste/edit/retry, разделение по нескольким последовательным сообщениям, пробелы/слова/символы/emoji/leet-like obfuscation и language/locale variants.
5. Проверяются message text, link metadata и поддерживаемые attachments/images/QR/OCR. Если тип вложения нельзя надежно проверить, он блокируется в consultation chat либо направляется в отдельный approved secure-support route.
6. Approved internal product links и approved safety resources проходят только по versioned allowlist; redirect/shortener не наследует доверие автоматически.
7. Recipient-facing history и обычная analytics сохраняют только censored content. Raw prohibited value, необходимый для расследования и sender history, изолируется в restricted evidence storage с минимальными правами, retention и audit каждого staff-view.
8. Повторные попытки связываются в один incident. Для агента repeated bypass становится critical quality/privacy signal; для клиента — понятное предупреждение и при необходимости support route без автоматического обвинения.
9. False positive не дает пользователю bypass protected rule: сообщение можно исправить; staff корректирует rule/allowlist через versioned review.
10. Support, refund или identity evidence, реально необходимое для обработки, собирается только через отдельные защищенные поля/маршрут с минимальными правами, purpose и retention, не через consultation chat.

### Admin settings для chat privacy

На странице «Настройки чата» только `super-admin` управляет:

- protected/optional categories и active rule version;
- enabled/disabled toggle для каждой категории;
- language/locale/pattern/detector settings и obfuscation window;
- internal-domain/safety-resource allowlist и external deny rules;
- sender warning template и recipient replacement label;
- repeated-attempt thresholds и agent/client action mapping;
- evidence retention rules и audit staff-view;
- detector version, preview fixtures, effective date и rollback.

Двусторонняя проверка и режим `sender_original_recipient_censored` являются утвержденными правилами G1.2 и не выводятся как переключатели. Назначение reviewer role/queue на этой странице отсутствует.

Отключение любой категории доступно только `super-admin`, требует обязательной причины и предупреждения о риске перед активацией новой версии. При detector unavailable protected send действует fail-closed и показывает понятную временную недоступность, а не отправляет получателю непроверенный raw content.

### Место страницы «Настройки чата»

В существующем разделе настроек по адресу `/ru/admin/settings/index` нужно добавить самостоятельную страницу **«Настройки чата»**.

- предлагаемая route: `/ru/admin/settings/chat`;
- пункт показывается в существующем левом списке страниц настроек;
- положение: сразу после **«Основные настройки»** и перед **«Настройки фото»**;
- это отдельная страница текущего settings-контура, без создания нового верхнеуровневого раздела меню;
- ранее предложенная вложенность `Настройки консультаций → Чат и роли` не используется.

Страница группирует только относящиеся к consultation chat настройки: лимиты сообщений, документы/вложения, цензура, in-chat templates/system messages, причины скрытия сообщения и chat-specific delivery/edit/censorship/attachment texts.

На странице **не размещаются** создание и редактирование ролей, назначение роли сотруднику и общий редактор permissions. Эти функции уже существуют на `/ru/admin/settings/role`, `/ru/admin/role/create`, `/ru/admin/role/update` и `/ru/admin/settings/admin`. Страница чата только проверяет выданные там права; она не создает второй контур управления доступом.

В MVP вся страница, preview, сохранение, активация и rollback доступны только `super-admin`. Отдельный monitoring/evidence surface в контуре «Сообщения» также доступен только `super-admin`. Новая роль и новые role assignments сейчас не создаются. Возможное последующее делегирование оформляется через существующий RBAC-контур отдельным решением.

### Проверка на дублирование с live admin

По live-аудиту существующей админ-панели от 2026-07-27:

- `/ru/admin/settings/prices` уже управляет пакетами credits, базовой ценой, скидкой, ценой за credit и итоговой ценой — этих полей на странице чата нет;
- `/ru/admin/settings/payment` уже управляет валютой и платежными системами — этих полей на странице чата нет;
- `/ru/admin/settings/photo` уже управляет общими image size/dimensions/quality — страница чата использует эти ограничения и не создает их копию;
- `/ru/admin/settings/stories` управляет только stories media — эти значения не переиспользуются как скрытые chat defaults;
- `/ru/admin/settings/premium` уже содержит dating/premium quotas для incoming/outgoing messages, read status, edit sent messages и mutual timer — они остаются на прежней странице и не становятся вторым набором consultation-chat настроек;
- `/ru/admin/email-template/index` остается контуром email, а chat templates являются отдельными сообщениями внутри продукта;
- `/ru/admin/message/index` остается операционным реестром сообщений; мониторинг censored attempts расширяет этот контур либо его дочернюю страницу, но не помещается в конфигурацию чата. В MVP новый фильтр/дочерняя страница и restricted-original evidence доступны только `super-admin`; действие physical delete для consultation messages заменяется на hide with mandatory reason and audit;
- `/ru/admin/support/index` остается очередью support cases;
- `/ru/admin/users-log/index` используется для audit действий `super-admin`, но не хранит значения конфигурации.

### Admin settings для форматов и поведения чата

В секции «Форматы и поведение» страницы `/ru/admin/settings/chat` только `super-admin` управляет:

- максимальной длиной одного сообщения;
- количеством сообщений в одном rate-limit окне и длительностью этого окна;
- разрешенными MIME/форматами документов, максимальным размером документа и максимальным количеством вложений в одном сообщении;
- обязательным inspection fallback для документов, изображений и QR/OCR;
- staff hide reasons без physical delete;
- библиотекой optional agent templates/suggestions и in-chat system messages, доступностью по языку/сценарию и версиями.

Text, system, emoji и approved images являются разрешенным MVP-поведением; audio, video и arbitrary files запрещены. Эти продуктовые правила, typing/delivered/read, edited marker, idempotent retry и запрет physical delete не выводятся как включаемые переключатели. Общие image size/dimensions/quality берутся из `/ru/admin/settings/photo`, а страница чата задает только channel-specific inspection и attachment count.

Максимальная длина сообщения, rate-limit count/window, размер документа и количество вложений являются отдельными числовыми полями с единицами измерения и валидацией. Client/Agent reconnect, request/session timers, причины завершения и consultation-history retention редактируются в lifecycle/privacy-контурах G1.3/G4.3, а не на странице чата. Автоматическая отправка template/suggestion запрещена и не может быть включена настройкой.

### Управляемые detection parameters

Для каждого active rule admin-панель управляет:

- enabled protected source set и language/jurisdiction scope;
- monitoring mode `manual_only / flag_after_send / hold_before_send / immediate_safety_route`;
- warning/hold/critical confidence thresholds;
- provisional action и final action mapping;
- dedup/link window;
- evidence/context limit и retention/review period;
- detector/rule version, effective date и fallback behavior;
- behavior при detector unavailable: `monitoring_degraded`, staff incident и fail-closed для rule, где hold/critical monitoring является обязательным.

Protected critical rules нельзя одновременно перевести в `manual_only`/disabled так, чтобы исчезло обязательное обнаружение/route, без owner/legal approval. Настройка порогов проходит preview на positive, negative, ambiguous и obfuscated fixtures; изменение не переписывает старые verdicts.

### Client messages и approved resources

1. Template имеет language, jurisdiction/domain, category, version, approval state и effective date.
2. Draft/stale/unapproved critical template не считается активным.
3. Client message не раскрывает internal agent, чужие данные или неподтвержденные обещания помощи.
4. Resource имеет owner/source, проверенную ссылку/контакт, geography/language и freshness/review date.
5. Удаленный/stale resource не продолжает показываться как доступный; staff получает configuration incident.

### Version/snapshot

Session, message review, incident, admission и training record сохраняют примененную safety-policy/template/resource version. Новая версия действует на новые события; исторические решения не переписываются. Существенное изменение обязательных клиентских правил требует нового consent до следующего paid start.

## Экран 5. Возвраты

### Active refund policy

| Параметр | Текущее значение | Input/unit | Empty behavior |
|---|---:|---|---|
| Full refund percent | 100 | numeric, % | required/protected |
| Duplicate/incorrect debit correction | 100 | numeric, % ошибочного движения | required/protected |
| Technical failure mode | full или proportional affected part | select | required |
| Proportional refund factor | 100 | numeric, % eligible affected part | required |
| Client changed mind automatic refund | 0 | numeric, % | required/protected default |
| Maximum cumulative refund | 100 | numeric, % eligible historical charges | required/protected ceiling |
| Agent consultation correction factor | 100 | numeric, % returned eligible consultation component | required |
| Quality complaint automatic percent | `unset` | numeric, % | manual decision only |
| Safety violation automatic percent | `unset` | numeric, % | refund candidate/manual decision |
| Minimum/maximum case amount | `unset` | numeric, session currency | no artificial limit; never above eligible remaining charges |
| Claim submission window | 30 | numeric, days | current product default до legal review |
| Refund decision target | 72 | numeric, hours | starts after complete evidence; paused in waiting_client |
| Client appeal window | 7 | numeric, days | one client appeal per final decision |
| Bonus refund-use grace | 30 | numeric, days | minimum usable term if original bonus expiry is shorter or expired |
| Automatic-processing amount cap | `disabled` | numeric, session currency | actual refund automation disabled |
| Manual-approval threshold | 0 | numeric amount/% | every actual refund requires super-admin |

### Требования к числовым ячейкам

Каждый числовой параметр имеет отдельную видимую input cell, а не число внутри текста. Для поля обязательны:

1. label и business meaning;
2. current value и unit `% / amount / minutes / hours / days / multiplier`;
3. required/optional status и поведение при `unset`;
4. допустимый min/max и validation до сохранения;
5. currency scope для amount fields;
6. precision/rounding rule и calculation preview;
7. old/new value, actor, reason, effective date и version;
8. readback фактически активного значения после save;
9. запрет ambiguous value без unit;
10. empty/zero различаются: `unset` не равен `0`.

### Категории и decision rules

- Technical platform/agent failure: full либо proportional affected-part outcome согласно active category rule.
- Duplicate/incorrect debit: protected full correction ошибочного движения.
- Quality complaint: manual `no / partial / full` по evidence, если не утвержден отдельный automatic rule.
- Confirmed O6 violation: escalation и refund candidate; automatic percent остается unset до отдельной активации.
- Correctly delivered started minute + changed mind: automatic refund 0%; manual exception с причиной.
- Category, eligibility, evidence checklist, default outcome, allowed result range, roles, escalation и client wording являются versioned admin fields.

### Case calculation preview

Перед подтверждением admin/support видит:

- session currency и eligible historical charges;
- уже выполненные refunds/corrections;
- remaining refundable amount;
- выбранную category/policy version;
- proposed percent/amount и rounding;
- итог client balance;
- proportional agent correction и запрещенные unrelated effects;
- warning/error при превышении protected ceiling или отсутствии approver/evidence.

Save/confirm различает draft decision и фактическое financial action. Повтор confirm/retry не создает второе движение. Session хранит consent/terms version, case — decision policy version; более поздняя admin policy не уменьшает уже обещанные клиенту права и не переписывает завершенный refund.

Любой фактический refund подтверждает `super-admin`. Автоматические категории формируют candidate/default calculation, но не выполняют движение credits. Финансовая ошибка оставляет case открытым до успешного движения и корректного клиентского сообщения.

### Размещение и граница страницы

В существующем `/ru/admin/settings/index` добавляется пункт **«Настройки возвратов»** с маршрутом `/ru/admin/settings/refunds`. В вертикальном списке он располагается сразу после **«Настройки цен»** и перед **«Group settings»**.

Страница содержит только policy/settings, версии и preview. Она не является очередью refund cases и не дублирует support conversation, consultation card, balance transactions или cash/payment disputes. Операционный refund case открывается из связанного support ticket, consultation card или защищенного financial readback.

### Protected invariants

- Cumulative refund не превышает фактические eligible charges.
- Duplicate/incorrect debit исправляется полностью независимо от optional auto cap; крупный случай может перейти в manual approval, но обязательство не исчезает.
- Refund/correction не превращается в положительное agent accrual.
- `unset` automatic percent не означает 0%, 100% или pass; это manual/disabled state.
- Обычный admin не отключает protected invariants; изменение требует owner/financial/legal approval и новой версии.

## Экран 6. Credits, цены и промо

### Consultation price

| Параметр | Текущее значение | Input/unit | Empty behavior |
|---|---:|---|---|
| Global default consultation price | `30` | numeric, credits/started minute | accepted initial value; paid start fail-closed только если active config invalid/missing |
| Expert profile price override | optional/unset | numeric, credits/started minute | используется global default |
| Effective price priority | profile override -> global default | ordered rule | required/protected |
| Session price snapshot | effective value at start | readback | immutable для active/historical session |
| Default package purchase currency | `USD` | ISO 4217 select | accepted initial value; package may override only if enabled market policy permits |

### Управление ценой минуты

Admin-панель обязана позволять уполномоченной роли:

1. изменять global default в отдельной numeric input cell с unit `credits/started minute`; initial active value — `30`;
2. задавать, изменять и снимать override для конкретной expert profile;
3. видеть effective price до сохранения: `profile override`, иначе `global default`;
4. сохранять изменение как draft, просматривать затронутые новые sessions и активировать новую version с effective date/time;
5. указывать обязательную reason; audit хранит old/new value, actor, time, version и affected scope;
6. запрещать отрицательные, дробные вне разрешенной precision, превышающие configured max и пустые active global values;
7. применять новую цену только к sessions, начатым после effective time; active и historical sessions сохраняют прежний snapshot;
8. выполнять rollback только новой version без переписывания истории и уже созданных debits;
9. показывать preview клиентских profile/consent/start states до activation;
10. запрещать изменение цены ролям без отдельного `pricing.manage` permission.

Клиентские profile, consent/start, active session и history показывают credits/minute и согласованный credit debit. USD или иная purchase currency не показывается как consultation price/minute. Source boundary для initial values — `asknebula-pricing-benchmark-2026-07-21.md`.

### Credit package catalog

Initial active packages:

| Package | Purchased credits | List price | Package discount | Final price |
|---|---:|---:|---:|---:|
| Starter | 60 | 9.99 USD | none / 0% | 9.99 USD |
| Basic | 150 | 24.98 USD | 1.99 USD | 22.99 USD |
| Standard | 300 | 49.95 USD | 6.96 USD | 42.99 USD |
| Plus | 600 | 99.90 USD | 19.91 USD | 79.99 USD |

Package продает credits, а не фиксированное число минут. Доступные полные минуты всегда являются расчетной проекцией `floor(balance credits / effective Expert credits per minute)` и меняются в зависимости от выбранной экспертной анкеты.

Для каждого package admin управляет отдельными fields:

- internal/admin name и client label;
- active/draft/retired state;
- package presentation mode: `credits`;
- purchase currency;
- regular/list money price;
- sale money price;
- discount mode `none / percent / fixed USD / bonus credits` и numeric value;
- автоматически рассчитанные saved USD и effective discount percent;
- purchased credits amount;
- bonus credits amount;
- total credits preview;
- effective money-per-credit readback на purchase screen, не как consultation price;
- market/language/audience;
- start/end/timezone;
- minimum/maximum purchases и per-client/global limits;
- coupon/promo eligibility;
- ручные точки top-up; auto-refill в MVP отключен;
- tax/payment wording status;
- display order и version/effective date.

Package с unset currency, sale price или credits amount не активируется. Sale price не может превышать list price при активной discount-метке; фальшивая зачеркнутая цена запрещена. `0`, `unset`, bonus и purchased credits различаются. Историческая purchase хранит package version, money paid, currency, purchased/bonus credits, discount и applied coupon.

### Управляемые пакеты credits и package discount

Admin может создавать любое число draft packages и для каждого управлять credits/price/discount независимо. Перед activation preview показывает:

- package card для клиента: purchased и bonus credits, regular и final USD price;
- saved USD и фактический discount percent;
- полные started minutes для global price и для выбранной expert profile override: `floor(total credits / effective credits per minute)`;
- остаток credits после указанного числа полных минут;
- результат совместного применения package discount, coupon и bonus с объяснением stacking priority;
- old/new catalog version и effective date.

Если expert profile имеет override, клиентская карточка показывает точный расчет доступных полных минут по цене выбранного Эксперта. Package никогда не обещает универсальное `N минут`. Изменение global/profile price не меняет credits уже купленного package.

### Coupons, discounts и bonus credits

Admin fields:

1. code/name и active state;
2. target `package_price_discount / fixed_money_discount / bonus_credits / profile_session_price_promo`;
3. numeric value и unit `% / money / credits`;
4. minimum purchase/package и maximum discount/bonus cap;
5. eligible packages/profiles/markets/audiences;
6. start/end/timezone;
7. total usage limit, per-client limit и first-purchase rule;
8. stacking mode, priority и incompatible promotions;
9. purchased/bonus credit bucket и expiry rule;
10. client wording, preview, reason и version/effective date.

Package coupon по умолчанию изменяет purchase price или granted bonus credits, но не credits/minute текущей consultation. Если promo прямо меняет profile session price, клиент видит final credits/minute до consent/start, а session сохраняет promo/rule snapshot.

### Credit balance и buckets

- Ledger различает purchased, bonus/promo, refund и correction movements.
- Spending priority между buckets является versioned admin rule и виден staff readback.
- Purchased-credit expiry не включается без отдельного owner/legal approval. Bonus/promo expiry имеет explicit date/days/timezone и заранее видна клиенту; `unset` не создает скрытое истечение.
- Consultation R1 refund возвращает credits в client balance с исходной session/case linkage; cash refund package purchase идет отдельным payment-dispute route.
- Coupon retry/payment retry не удваивает credits/bonus; purchase и grant имеют exactly-once readback.

### Admin numeric/input contract

Global/profile price, package money/credits/bonus, discount, caps, limits, expiry days и refill thresholds имеют отдельные input cells с value, unit, min/max, unset/zero, currency scope, preview, validation, old/new, actor, reason и version. Bulk package/coupon activation является согласованным versioned set: partial save не публикует несогласованную витрину.

### Price/package preview

До активации staff видит:

- client package card с money price/currency и purchased/bonus/total credits;
- coupon eligibility и итог;
- effective global/profile credits/minute;
- сколько started minutes доступно при выбранном balance/package без обещания неполной минуты;
- поведение sufficient/insufficient balance, top-up и session snapshot;
- missing/invalid config и affected market/profile.

## Экран 7. Вознаграждение агентов

### Компоненты и initial mode

| Компонент | Initial mode | Управляемые поля | Unset behavior |
|---|---|---|---|
| Consultation percentage | `active` для pilot | active, percentage, eligible base, currency, period, scope, effective date | invalid config блокирует payout и создает incident |
| Fixed за график/SLA | `disabled` | amount, currency, period, schedule/SLA conditions, reduction/cancel rules | component не начисляется |
| Additional-task pay | `disabled` | task type, amount/rate, evidence, approval, limits, period | component не начисляется |

Consultation, fixed/SLA и task-pay являются независимыми компонентами. Включение одного не включает другой и не позволяет одному компоненту маскировать ошибку другого.

### Настройки consultation component

Admin управляет:

1. active/draft/retired state и effective date/timezone;
2. percentage в отдельной numeric input cell с allowed range и precision;
3. supported eligible-base rule: какие фактически оказанные/оплаченные consultation debits входят в базу;
4. обращением с purchased, bonus, promo и refunded credits; неописанная категория fail-closed и не попадает в payout silently;
5. payout/readback currency и согласованным conversion snapshot, если база и выплата имеют разные units;
6. period `session / daily / weekly / monthly` и close date;
7. global rule, agent-group rule и individual agent override с явным priority readback;
8. minimum/maximum amount, rounding и negative-correction carry-forward;
9. eligible session states и исключения technical/cancelled/fraud/duplicate;
10. approval roles, optional dual control, reason/evidence и export fields.

Принятые initial values:

- consultation percentage - 30%;
- purchased, welcome, trial, promo и compensation sources - отдельные toggles, стартово включены;
- refunded, erroneous, reversed и duplicate credits - исключены;
- unknown source - fail-closed с configuration incident;
- payout currency - USD;
- conversion rate - 0.1665 USD за credit;
- hold - 7 календарных дней;
- period - weekly, Monday-Sunday;
- payout execution - manual;
- initial access - super-admin only.

Каждая session accrual хранит service session, expert profile, actual agent, eligible base, rule/version, percentage, calculated amount, currency/conversion snapshot и state. Reassignment после session не меняет actual-agent accrual.

### Fixed/SLA component

Admin может независимо настроить fixed amount/currency и pay period; schedule/shift/team/agent scope; обязательные hours/tasks/SLA thresholds; tolerated exclusions и no-data behavior; proportional/step/manual reduction; cancel conditions/caps/approval; preview по агенту и периоду. До прямого O4 enablement component остается `disabled`; отсутствие значения не трактуется как нулевая выполненная работа или задолженность.

### Additional-task pay

Для каждого task type admin задает label, eligibility/evidence, unit `per task / hour / quantity`, rate, currency, limits, approver, duplicate key, period и effective version. Одно и то же подтвержденное задание не оплачивается повторно при retry/double submit.

### Refund и corrections

- Session refund создает отдельную negative consultation correction по примененной compensation rule/version и фактически возвращенной eligible части.
- Correction не переписывает исходный accrual и не изменяет unrelated fixed/SLA/task pay без отдельного active rule.
- Cumulative negative correction не превышает attributable consultation accrual; excess/exception идет в manual review.
- Super-admin override требует reason, evidence, old/new preview и отдельный audit event.
- Закрытый/выплаченный период не переписывается: correction попадает в разрешенный adjustment period с linkage на исходную session.

### Breakdown, права и numeric invariant

Уполномоченный admin видит current/draft policy, расчет по session/agent/period, pending/approved/paid/corrected states, refund linkage и export reconciliation. Агент видит только разрешенный собственный breakdown без чужих данных, внутренних fraud/security деталей и чужих ставок. Изменение требует `compensation.manage`; approve/pay/override разделяются отдельными permissions.

Все percentage, amount, threshold, cap, period, rate, precision и conversion inputs имеют отдельные видимые cells с unit, allowed range, unset/zero distinction, preview, old/new, actor, reason, version и effective date. Retroactive activation запрещена; исторический результат воспроизводится по snapshot.

### Размещение и переиспользование

- `Финансы -> Вознаграждение агентов` (`/ru/admin/agent-compensation/index`) - общая операционная сводка по Агентам и периодам.
- `Настройки -> Настройки вознаграждений` (`/ru/admin/settings/agent-compensation`) - только policy, versions, preview и audit.
- `/ru/admin/partner/payments?id={id}` - consultation accrual detail внутри существующей карточки партнера.
- `/ru/admin/partner/payouts?id={id}` - period Plan/Fact и manual payout result.
- `/ru/admin/partner/payments?id={id}&mode=minus` - compensation corrections отдельно от legacy balance spending.
- `/ru/admin/partner/payment-info?id={id}` - единственный владелец payout details; копия реквизитов не создается.

Existing partner balance operations, premium, gifts, spotlight и group spending не являются compensation deductions и не входят в payout totals без отдельного G2.4 classification.

## Общий жизненный цикл конфигурации

1. Изменение создается как draft.
2. Validation показывает ошибки до активации.
3. Уполномоченная роль активирует согласованную версию.
4. Новые SLA clocks/reviews/admission cases используют новую версию.
5. Активные clocks и уже созданные reviews/cases сохраняют snapshot прежней версии.
6. Rollback оформляется как новая версия с причиной.
7. Missing/invalid active configuration не считается pass и создает staff-visible configuration incident; зависимый paid/admission path действует fail-closed.

## Programmer handoff

```text
затронутые task IDs:
environment/build marker:
admin routes/screens:
реализованные setting groups и fields:
view/edit/activate/override роли:
validation rules:
version/audit/readback:
snapshot paths для clock/review/admission:
еще отсутствующие groups/fields:
fixtures и готовность к QA:
```

## Acceptance suite

| ID | Сценарий | PASS |
|---|---|---|
| AP1 | Authorized view/edit/activate | Сохранена одна новая версия, readback совпадает |
| AP2 | Unauthorized UI/direct action | Запрещено; active config не изменена |
| AP3 | Invalid SLA/score values | Понятная ошибка; последняя active version сохранена |
| AP4 | Change during active SLA clock | Старый deadline сохранен, новый clock использует новую версию |
| AP5 | Score 79/80 при max 100 | Fail/pass согласно активной версии |
| AP6 | Critical fail при high score | Paid access block/incident независимо от score |
| AP7 | Critical rule retired after review | Исторический review сохраняет прежнее правило/version |
| AP8 | Moderator verdict + super-admin override | Оба решения, actors, evidence и причина сохранены |
| AP9 | Re-admission missing required stage | Paid access закрыт с понятной причиной |
| AP10 | Full re-admission path | Новая trial/review связаны с agent и rule version |
| AP11 | Double submit/concurrent activation | Одна согласованная active version |
| AP12 | Rollback | Новая audit version, история не переписана |
| AP13 | Empty critical registry | Активация для paid pilot запрещена |
| AP14 | Admin mobile/narrow viewport | Критические поля/actions читаемы и не перекрыты |
| AP15 | KPI draft preview | Current/draft различимы; formula inputs и sample объяснимы |
| AP16 | KPI missing/stale/zero denominator | `insufficient_data/stale`, не zero/pass |
| AP17 | Invalid weights/threshold/window | Активация запрещена; active set не изменен |
| AP18 | Attempt enable rotation influence | Запрещено без post-pilot owner/evidence gate; active mode остается disabled |
| AP19 | KPI version change | Новый период использует новую definition; historical result хранит прежнюю version |
| AP20 | Refund/reassignment/technical case | Attribution и exclusions совпадают с active definition и lineage |
| AP21 | Add stricter prohibited rule | Новая version активна и доступна в staff/training readback |
| AP22 | Attempt remove protected minimum | Активация запрещена без owner/legal approval; active policy сохранена |
| AP23 | Critical self-harm/violence/illegal/minor case | Обычный сценарий остановлен, новая paid minute не начинается, incident routed immediately |
| AP24 | Unapproved/stale template/resource | Не используется как active; виден release/configuration blocker |
| AP25 | Safety version changed after session | Историческая session/review хранит прежнюю version |
| AP26 | Foreign/unauthorized safety config action | Запрещено; данные active policy не раскрыты/не изменены |
| AP27 | Duplicate critical event | Один связанный incident/action с dedup/readback |
| AP28 | Refund candidate safety incident | Case отмечен, но автоматического refund без отдельного policy decision нет |
| AP29 | Rule update before next paid start | Требуется актуальный consent, если изменились обязательные client terms |
| AP30 | Approved resource freshness expires | Resource перестает считаться approved; staff получает actionable incident |
| AP31 | Explicit prohibited guarantee in agent message | Signal с rule/version; configured hold/flag; moderator verdict связан с message/session |
| AP32 | Explicit self-harm/violence client message | Immediate safety route, no new paid minute, one incident; final disciplinary verdict не выдуман |
| AP33 | Ordinary benign message | Нет confirmed violation; отсутствие ложного stop |
| AP34 | Ambiguous/obfuscated wording | Signal/review следует configured threshold/mode; evidence и detector version видимы |
| AP35 | Client report selected message | Один incident со ссылкой на session/message и доступным status readback |
| AP36 | Manual staff flag | Actor/reason/evidence сохранены; foreign role запрещена |
| AP37 | False positive dismissed | KPI/admission не ухудшены; verdict/audit сохранены |
| AP38 | Duplicate signals from monitoring/report/QA | Один связанный incident либо явная linkage, без повторного action |
| AP39 | Detector unavailable | `monitoring_degraded`; staff incident; обязательный hold/critical route действует fail-closed |
| AP40 | Unobservable off-platform allegation | Complaint/evidence route без ложного заявления об автоматическом proof |
| AP41 | Plain/spaced/worded phone number | Sender видит original + warning; recipient видит `ЦЕНЗУРА`; один incident |
| AP42 | Email, messenger handle, social invite | Recipient-safe censorship с category/rule version и sender warning |
| AP43 | External URL/shortener/QR/contact card | Recipient видит censored value; approved internal/safety allowlist проходит по active version |
| AP44 | Address, document, bank/payment/crypto details | Recipient видит `ЦЕНЗУРА`; raw evidence доступен только через restricted audited route |
| AP45 | Password/code/secret | Recipient не получает raw secret; sender получает policy warning |
| AP46 | Contact split across sequential messages | Один связанный incident; recipient не восстанавливает значение из частей |
| AP47 | Paste/edit/retry/direct send | Один и тот же server-side guard и результат |
| AP48 | Benign price/date/time/card-number-like discussion | Нет ложной доставки PII; допустимый service context проходит или дает edit route |
| AP49 | Approved structured birth-data field | Purpose/consent/version сохранены; данные не требуют публикации в free chat |
| AP50 | Uninspectable attachment | Fail-closed в consultation chat либо approved secure route |
| AP51 | Repeated agent bypass attempt | Critical privacy signal/paid-access review с masked evidence |
| AP52 | Repeated client attempt | Warning/support route без автоматического disciplinary verdict |
| AP53 | Unauthorized change/disable protected filter | Запрещено; active policy сохранена |
| AP54 | Detector unavailable | Protected send fail-closed; visible degraded incident |
| AP55 | False-positive rule correction | Новая version/allowlist; historical blocked attempt не переписан |
| AP56 | Full refund 100% | Client/case/session/agent correction согласованы |
| AP57 | Partial affected-part refund | Numeric preview и proportional correction совпадают |
| AP58 | Duplicate/incorrect debit | Полная correction; optional auto cap не отменяет обязательство |
| AP59 | Quality complaint with unset automatic percent | Только manual no/partial/full с evidence/approver |
| AP60 | Safety refund candidate | Incident связан; автоматический refund не выдуман |
| AP61 | Changed mind after delivered started minute | Auto = 0%; manual exception требует причины |
| AP62 | Multiple partial refunds | Cumulative amount не превышает 100% eligible charges |
| AP63 | Empty versus zero input | `unset` и `0` имеют разные readback/behavior |
| AP64 | Invalid percent/amount/unit | Save запрещен; active version сохранена |
| AP65 | Currency/precision/rounding | Preview и фактическое движение совпадают |
| AP66 | Policy changed during open/closed case | Applied terms/decision versions видимы; completed movement не переписано |
| AP67 | Concurrent/repeated confirm | Одно financial action и один связанный correction |
| AP68 | Unauthorized refund/config change | Запрещено; protected values/history не изменены |
| AP69 | Attempt cumulative > eligible charges | Block с объяснением remaining refundable amount |
| AP70 | Numeric input readback/audit | Value, unit, old/new, actor, reason, effective version воспроизводимы |
| AP71 | Global credits/minute configured | Profile/start/session debit согласованы |
| AP72 | Profile override/unset | Override используется; unset наследует global; priority readback видим |
| AP73 | Price changed during active session | Active snapshot прежний; новая session использует новую цену |
| AP74 | Global and override both unset | Paid start fail-closed с top-up/config explanation без debit |
| AP75 | Package purchase | Money/currency, purchased/bonus/total credits и ledger совпадают |
| AP76 | Invalid package numeric/unit | Активация запрещена; active catalog сохранен |
| AP77 | Percent/fixed/bonus coupon | Eligibility, cap, usage limit и итоговый grant/price совпадают с preview |
| AP78 | Coupon stacking conflict | Один объяснимый outcome по priority/stacking rule |
| AP79 | Coupon/payment retry | Один purchase/grant, без duplicate credits/bonus |
| AP80 | Session-price promo | Final credits/minute видны до consent; session snapshot неизменяем |
| AP81 | Package coupon during active session | Balance grant меняется, active credits/minute не переписывается |
| AP82 | Bonus expiry unset/set | Нет скрытого expiry; explicit deadline/timezone видны до purchase/use |
| AP83 | Attempt enable purchased-credit expiry | Запрещено без owner/legal approval |
| AP84 | Spending priority changed | Новые debits используют новую rule version; historical ledger не переписан |
| AP85 | Consultation refund | Credits возвращены с session/case linkage; cash package refund не подменен |
| AP86 | Currency differs by package/market | Consultation остается credits/minute; purchase currency однозначна |
| AP87 | Bulk package/coupon activation | Одна согласованная version без partial published state |
| AP88 | Unauthorized price/package/coupon change | Запрещено; active values/history сохранены |
| AP89 | Numeric unset versus zero | UI/readback/behavior различают состояния |
| AP90 | Client transparency | До purchase/start видны все применимые credits, bonus, price и expiry без скрытого conversion |
| AP91 | Starter package | Purchase/readback совпадают: 9.99 USD и 60 credits; минуты не являются содержимым package |
| AP92 | Credit package with profile override | Preview показывает реальное число полных минут по выбранной цене и остаток credits |
| AP93 | Package percent/fixed discount | Final USD, saved USD и фактический percent совпадают с расчетом |
| AP94 | Bonus credits | Bonus grant хранит точное количество credits, источник и expiry; grant не меняется задним числом |
| AP95 | False discount/list price | Activation запрещена, если saving <= 0 или list price не подтверждена active package version |
| AP96 | Package discount plus coupon | Stacking priority дает один объяснимый итог без double discount |
| AP97 | Package price/rate changed after purchase | Historical money/credits/discount snapshot и баланс клиента не переписаны |
| AP98 | Consultation percentage draft/unset | Component не начисляется; session ledger сохранен, config incident видим |
| AP99 | Consultation component active | Eligible base, percent, amount, currency и rule snapshot совпадают с preview |
| AP100 | Multiple profiles handled by one agent | Accruals связаны с каждой session/profile и одним actual agent без дублей |
| AP101 | Reassignment after consultation | Historical actual-agent accrual не перемещен новому агенту |
| AP102 | Partial/full refund | Отдельная proportional/full negative correction связана с исходным accrual |
| AP103 | Refund after period paid | История не переписана; correction попала в разрешенный adjustment period |
| AP104 | Fixed/SLA and task components disabled | Никаких скрытых accrual/debt; consultation component работает независимо |
| AP105 | Fixed/SLA enabled with threshold/exclusion | Agent-period preview и фактический result совпадают; no-data не выдан за fail/pass |
| AP106 | Additional task retry/double submit | Один accrual по duplicate key и evidence |
| AP107 | Agent-specific override | Priority readback объясняет global/group/agent source; новая session использует новую version |
| AP108 | Unauthorized manage/approve/pay/override | Action запрещен; policy, accrual и period state сохранены |
| AP109 | Manual compensation override | Old/new, reason, evidence, actor и approval сохранены; unrelated components не изменены |
| AP110 | Retroactive policy attempt | Activation запрещена; historical sessions/closed periods не пересчитаны |

## Stop

Admin-форма без server-side role guard, save readback, version/audit или snapshot не принимается. Static mockup, запись без фактического применения и UI hiding не являются runtime proof.
