# Словарь продуктовых объектов G1–G3

Дата: 2026-07-29  
Статус: `canonical_product_vocabulary`

## 1. Люди и публичные роли

### Клиент

Авторизованный пользователь, который выбирает Эксперта, ведёт бесплатный диалог, подтверждает consultation, покупает credits и видит только свои данные.

### Эксперт

Публичная роль и экспертная анкета в интерфейсе клиента. Эксперт имеет имя, фото, специализации, методы, availability, цену, отзывы и публичную статистику.

Эксперт не равен внутреннему сотруднику и не является названием RBAC-роли автоматически.

### Агент

Внутренний фактический оператор, которому назначена одна или несколько экспертных анкет. Клиент не видит имя и ID Агента. Исторический actor каждого действия сохраняется.

### Moderator

Сотрудник support/quality/safety. Отдельная публичная роль Support в MVP не создаётся. Его клиентские сообщения отображаются как «Поддержка Nebula».

### Super-admin

Стартовый владелец новых administrative permissions. Может выполнять аварийные и финансовые действия только с причиной и audit.

## 2. Коммуникация

### Permanent dialog

Постоянный бесплатный диалог клиента с экспертной анкетой. Может существовать до первой consultation и содержать ссылки на несколько последовательных consultations.

### Message

Логическое сообщение с:

- dialog;
- public author;
- actual actor;
- sender-visible original;
- recipient-visible безопасной версией;
- delivery/read/edit facts;
- applied censorship rule version.

### Censorship incident

Одна audit-запись попытки передать защищённые данные. Не является публичным сообщением, refund или доказанной виной.

## 3. Консультация

### Consultation request

Ожидающий запрос клиента или предложение Эксперта. Существует до service session, ничего не списывает и имеет собственный expiry/SLA.

### Service session / consultation session

Одна каноническая запись платного рассмотрения конкретного кейса:

- client;
- expert profile;
- dialog;
- actual Agent;
- assignment snapshot;
- price/trial/rule snapshots;
- lifecycle;
- minute ledger;
- links to support/refund/quality/accrual.

Термины `service session` и `consultation session` описывают одну сущность. В интерфейсе используется «Консультация».

### Primary state

Канонические значения:

`connecting / trial / paid / balance_pause / completed`.

Waiting и reconnect — подстатусы с причиной и clock, а не новые primary states.

### Completion facts

У session один terminal state `completed`. Отдельно сохраняются:

- initiator;
- completion type;
- internal reason code;
- client-safe wording;
- timestamps;
- linked incidents.

### Consultation history

Разрешённая projection неизменяемых событий session для клиента/staff. Имеет собственный срок доступности, но не является копией и не управляет retention message storage, restricted evidence, financial ledger или audit.

## 4. Деньги

### Credit package

Предложение купить определённое число credits за USD с discount/coupon/bonus. Пакет не продаёт фиксированное число минут.

### Balance bucket

Источник credits с типом:

- purchased;
- bonus;
- promo;
- compensation;
- refund restoration.

Bucket хранит source, amount, remaining, expiry и restrictions.

### Effective price

Цена одной начатой paid-минуты:

- profile override, если активен;
- иначе global default.

При создании session сохраняется immutable price snapshot.

### Trial entitlement

Право на определённое число бесплатных минут из coupon/bonus rule. Единственный редактор entitlement — `/ru/admin/settings/coupons` в G2.1. Consultation settings и session показывают только applied read-only snapshot. Если entitlement равен 0 или отсутствует, trial пропускается. Если entitlement больше нуля, trial начинается после consent/readiness независимо от balance и не списывает credits; недостаточный balance блокирует только первую paid-минуту.

### Started minute

60-секундный финансовый интервал. Полная effective price атомарно списывается в момент начала. Одна logical minute имеет один idempotency key.

### Debit

Append-only движение credits для одной started minute.

### Refund case

Отдельный процесс проверки и возврата eligible credits. Не меняет terminal state consultation и не переписывает debit.

### Refund correction

Append-only движение, восстанавливающее credits в допустимые source buckets.

### Compensation grant

Отдельное ручное начисление бонусных credits, которое фактически выполняет только super-admin с обязательной причиной. Автоматическое правило может создать candidate/preview для решения, но не выполняет движение само. Grant не называется refund и не обещается клиенту до успешного движения.

### Agent accrual

Расчётное начисление actual Agent по snapshot compensation policy. Не равно client debit и не является фактом банковской выплаты.

### Accrual correction

Append-only корректировка Agent accrual, обычно после successful refund или ручного решения.

## 5. Экспертная выдача

### Category

Один из пяти канонических верхнеуровневых клиентских фильтров:

1. Отношения и семья;
2. Карьера, деньги и проекты;
3. Выбор, будущее и перемены;
4. Личностный рост и внутреннее равновесие;
5. Духовность, карма и родовые темы.

Единственный owner taxonomy и versioned category→specialization→method mapping — `/ru/admin/profile-field/index` в контуре G3.6. Единственный редактор completeness rules — `/ru/admin/profile-field/completeness` в том же существующем контуре «Поля анкеты». Остальные G3-поверхности используют applied snapshots.

`expert_specialization_taxonomy_v1_legacy` — immutable baseline существующего `id=18`, values `1–20`. Первая active Nebula taxonomy — `expert_specialization_taxonomy_v2`: specialization `id=18:value=13` deprecated и исключён из active mapping, method `id=17:value=16 = Energy Practices` и specialization `id=18:value=21 = Relocation & Life Changes` добавлены append-only. Mapping `id=18:value=13 -> id=17:value=16` сохраняет lineage; остальные IDs не переиндексируются.

### Specialization

Конкретная задача клиента внутри category.

### Method

Инструмент или практика Эксперта: Tarot, Astrology, Numerology и т. п.

### Consultation style

Способ общения: supportive, direct, structured, reflective. Стиль не смешивается с method.

### Availability

Server-authoritative публичный status:

- available;
- busy;
- offline;
- blocked/hidden — не обязательно публичный label, но исключает start.

### Completeness

Объяснимая оценка заполненности и качества profile data по versioned G3.6 policy. Не равна eligibility.

### Eligibility

Server-authoritative решение G3.7 для конкретной surface и входных условий. Канонический catalog/display contract:

- `display_eligible: boolean` — можно ли показывать анкету;
- `capabilities[]` — только `open_profile`, `send_free_message`, `notify_availability`, `create_consultation_request`;
- `reason_codes[]` — почему показ/действие разрешены, ограничены или запрещены.

`create_consultation_request` только открывает request/consent flow. Отдельного capability ID для финансового старта не существует. `paid_start_eligible` не входит в G3.7 catalog/display contract: это отдельный fresh transactional guard G1/G2/G6 непосредственно перед созданием session/финансовым действием. Поэтому `display_eligible=true` не означает автоматически разрешённый paid start.

### Ranking

Порядок уже eligible анкет. Не может вернуть исключённую анкету.

### Surface

Один из восьми стабильных IDs: `home`, `dashboard_catalog`, `country`, `city`, `category`, `matching_result`, `thematic_block`, `expert_profile`. Все восемь существуют в registry явно; base-policy reference и field-level overrides должны быть видимы в readback, скрытая inheritance запрещена.

### Pin / priority / weight

- pin фиксирует допустимую анкету в позиции;
- priority задаёт относительный порядок;
- weight влияет на относительное ранжирование/частоту;
- ни один из них не отменяет eligibility.

## 6. Отзывы

G3.3 «Отзывы» — единственный owner review policy, eligibility, moderation, author modes, aggregate/rating и historical override. G3.1 владеет только home presentation: enabled/visibility/layout/`home_review_card_limit`/fallback. Profile presentation limit `profile_review_card_limit` принадлежит G3.3.

### Consultation-linked review

Отзыв реального клиента по завершённой consultation. После moderation участвует в rating.

### Historical testimonial

Отзыв, созданный через super-admin impersonation с отдельным override, source/consent/reason и `verified_consultation=false`. Не влияет на rating.

### Rating

Агрегат только опубликованных consultation-linked reviews.

## 7. Конфигурация

### Active version

Единственная версия правила, применяемая к новым объектам после effective time.

### Snapshot

Неизменяемая копия значений, применённых к конкретному request/session/minute/refund/accrual/result.

### Preview

Read-only расчёт ожидаемого результата по указанным входным данным. Preview не изменяет production state.

### Audit

Append-only факт actor/action/time/reason/before/after/version. Audit не заменяет operational record.
