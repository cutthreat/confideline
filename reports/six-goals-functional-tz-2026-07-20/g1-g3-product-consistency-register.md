# Реестр согласованности продукта G1–G3

Дата: 2026-07-29  
Статус: `canonical_consistency_register`

## 1. Зачем нужен реестр

Реестр определяет владельца каждой логики и снимает дублирование между консультацией, чатом, деньгами и витриной. Если отдельное ТЗ формулирует правило иначе, применяется более позднее решение владельца и этот реестр, а документ задачи должен быть исправлен.

## 2. Границы задач

| Задача | Владеет | Не владеет |
|---|---|---|
| G1.1 | одной карточкой consultation, связями, readback и доступом к карточке | state machine, RBAC implementation, money calculation |
| G1.2 | постоянным диалогом, авторством, сообщениями, вложениями, censorship | lifecycle, price, refunds, назначение ролей |
| G1.3 | request/offer/consent, состояниями, timers ожидания, историей | message transport, ledger calculation, support case |
| G1.4 | in-app/email уведомлениями consultation и delivery policy | support notifications, email-template редактор, lifecycle |
| G2.1 | credits, packages, price selection, balance buckets | minute tick, refund workflow, payout |
| G2.2 | trial/paid minute ledger, pause, reconnect, hard stop | package price, refund decision, lifecycle presentation |
| G2.3 | refund case, eligibility, decision, execution, appeal | support ticket, cash dispute, agent payout formula |
| G2.4 | agent accrual, components, period, corrections, payout readback | session debit, client refund UI, assignment |
| G3.1 | публичной главной, блоками, CTA, home slice | общий catalog ranking, profile schema, paid start |
| G3.2 | dashboard/catalog/geo, filters и result set | профильные данные, eligibility engine, session start |
| G3.3 | публичным профилем и card/profile CTA | общий ranking, message/payment engine |
| G3.4 | объяснимым подбором и сохранением intake | eligibility, paid session creation, queue |
| G3.5 | сквозным acceptance gate клиентского пути | реализацией функций других задач |
| G3.6 | required fields, completeness и quality of profile data | порядок eligible Экспертов |
| G3.7 | eligibility, ranking, rotation, preview | создание контента анкеты, consultation KPI definition |

## 3. Единые сущности и владельцы правды

| Факт | Канонический владелец |
|---|---|
| consultation identity и связи | G1.1 |
| текущий financial/lifecycle state | G1.3 + результаты G2.2 |
| публичный и фактический автор сообщения | G1.2 |
| effective price snapshot | G2.1 |
| одна начатая paid-минута и debit | G2.2 |
| refund correction | G2.3 |
| agent accrual correction | G2.4 |
| profile field values | существующие profile fields + G3.6 |
| eligibility | G3.7 |
| ranking result | G3.7 |
| layout главной | Figma + G3.1 |
| translation | существующая language subsystem |
| permissions | существующая role subsystem |

## 4. Снятые противоречия

### 4.1. Credits или минуты

Покупаются credits со скидкой. Пакет не закрепляет число минут. Минуты рассчитываются по effective price выбранной анкеты.

### 4.2. USD или credits

USD показывается на покупке пакета. Consultation показывает credits/мин. Нельзя рекламировать USD/min как цену консультации.

### 4.3. Trial

Trial — entitlement бесплатных минут. При 0 этап пропускается. Сам coupon является представлением права, а не отдельным lifecycle-состоянием. Если entitlement больше `0`, trial после consent/readiness проходит независимо от balance; balance проверяется только перед первой и каждой следующей paid minute.

### 4.4. Диалог и consultation

Постоянный диалог может существовать без consultation. Принятие запроса Агентом остаётся pre-session и только открывает confirmation card. Consultation создаёт отдельную карточку exactly once только после committed explicit client consent для любого initiation path.

### 4.5. G1.1 и G1.3

G1.1 показывает и связывает карточку. G1.3 рассчитывает переходы и историю. Карточка не создаёт вторую state machine.

### 4.6. G1.2 и роли

G1.2 определяет видимость и допустимые действия ролей в чате, но не создаёт роли и не дублирует `/ru/admin/settings/role`.

### 4.7. Цензура: блок или доставка

Сообщение не отклоняется целиком:

- отправитель видит исходный текст и предупреждение;
- получатель видит безопасную версию с «ЦЕНЗУРА»;
- запрещённое вложение, которое нельзя безопасно преобразовать, не доставляется;
- incident и audit создаются один раз.

### 4.8. Waiting и pause

`balance_pause` — каноническое primary state consultation наряду с `connecting / trial / paid / completed`. Waiting и reconnect — только подстатусы доступности с причиной и отдельным clock; они не создают альтернативную главную state machine.

### 4.9. Technical interruption

Начатая минута завершается и остаётся списанной; следующая не начинается. Reconnect grace не запускает минуту. Система создаёт incident/refund/compensation candidate и расчётный preview, но не выполняет автоматический refund или compensation. Любое фактическое начисление требует отдельного ручного решения super-admin и успешного grant.

### 4.10. Refund и consultation status

Спор, refund и quality review — связанные процессы. Основная consultation остаётся завершённой и получает только безопасный indicator.

### 4.11. География

Country/city membership — hard filter только на региональных страницах или при явном выборе. Общий dashboard не ограничивается скрыто городом клиента.

### 4.12. Категория, специализация и метод

- короткая категория — навигационный верхний уровень;
- specialization — конкретная проблема клиента;
- method — инструмент/практика Эксперта.

Это три уровня одной модели, а не взаимозаменяемые списки.

Миграция taxonomy является append-only:

- `expert_specialization_taxonomy_v1_legacy` — неизменяемый baseline существующего profile field `id=18`, values `1–20`; это migration snapshot, а не активная публичная Nebula taxonomy;
- `expert_specialization_taxonomy_v2` — первая активная Nebula taxonomy;
- legacy specialization `id=18:value=13` (`Energy Diagnostics`) сохраняется в history/alias как `deprecated`, но исключается из всех active `specialization_value_ids`;
- новый method `id=17:value=16` (`Energy Practices`) добавляется append-only, и migration mapping связывает legacy `id=18:value=13` с этим method;
- остальные legacy IDs не переиндексируются и не переиспользуются с новым смыслом.

### 4.13. Число консультаций

Публичный фактический показатель вычисляется из completed consultation sessions. Ручное legacy-поле id=19 не смешивается с системным счётчиком.

### 4.14. Главная и rotation

G3.1 не хранит отдельный ручной список Экспертов. Она получает eligible/ranked slice G3.7 для своей поверхности. Pin/priority настраиваются в G3.7 и объясняются preview.

### 4.15. Отзывы

Обычный рейтинг строится только из consultation-linked опубликованных отзывов. Исторический testimonial через super-admin override маркируется непроверенным consultation и не влияет на rating.

### 4.16. Eligibility и возможность действия

G3.7 возвращает единый контракт результата:

- `display_eligible: boolean` — можно ли показывать анкету на выбранной surface;
- `capabilities[]` — ровно разрешённые catalog-действия `open_profile`, `send_free_message`, `notify_availability`, `create_consultation_request`;
- `reason_codes[]` — объяснимые причины включения, ограничения или исключения.

`create_consultation_request` означает только вход в request/consent flow. Paid-start capability не существует. Отдельный `paid_start_eligible` возвращает свежий server-authoritative guard G1/G2/G6 непосредственно перед созданием session/финансовым действием; он не входит в G3.7 catalog contract и не наследуется из кэша витрины. Pin, priority, weight и matching не могут его обойти.

Обязательный versioned admission принадлежит G6.4 и является внешним input G3.7. Missing/stale admission не получает локальный default и даёт fail-closed eligibility с объяснимым `reason_code`.

## 5. Карта настроек без дублирования

| Настройка | Единственное место |
|---|---|
| request/offer/connecting/wait/reconnect/balance_pause timers | `/ru/admin/settings/consultations` |
| censorship, attachment types, message edit policy | Настройки чата |
| roles и permissions | существующая Настройка ролей |
| global/profile prices и packages | `/ru/admin/settings/prices`, G2.1 |
| coupons, trial entitlement и bonus expiry | `/ru/admin/settings/coupons`, G2.1 |
| applied trial entitlement в consultation | read-only snapshot и ссылка на G2.1 owner-page |
| refund windows/rules | Настройки возвратов |
| accrual components/periods/rates | `/ru/admin/settings/accruals`, G2.4 |
| accrual operation/readback | существующие partner payments/payouts; без редактора правил |
| in-app/email delivery rules, delays и quiet hours | `/ru/admin/notification-rule/index`, G1.4 |
| storefront content/media/order | Содержимое → Витрина Nebula |
| storefront visibility/display limits/fallback | Настройки → Настройки витрины |
| home review block presentation | Настройки → Настройки витрины, G3.1 |
| review policy/eligibility/moderation/aggregate/historical override | `/ru/admin/settings/reviews` + Содержимое → Отзывы, G3.3 |
| matching questions/mapping/explanation | `/ru/admin/settings/matching`, G3.4 |
| тексты интерфейса | Языки / translation keys |
| email content | Email Templates |
| client email toggles | пользовательские настройки уведомлений |
| taxonomy values и versioned category→specialization→method mapping | Поля анкеты / G3.6 |
| completeness field rules/evaluation/preview/input override | `/ru/admin/profile-field/completeness`, G3.6 |
| eligibility/ranking/pin/priority | G3.7 |
| support SLA/workflow | G4, не G1 |
| consultation-history projection retention | `/ru/admin/settings/consultations` |
| message-storage/privacy retention | отдельный privacy/data-retention owner, не Настройки консультаций |

## 6. Значения по умолчанию, которые не должны расходиться

| Параметр | Старт |
|---|---:|
| global price | 30 credits/мин |
| starter package | 60 credits / 9.99 USD |
| regular packages | 150 / 22.99 USD; 300 / 42.99 USD; 600 / 79.99 USD |
| request hard expiry | 15 минут |
| clarification response | 60 минут |
| expert offer | 15 минут |
| connecting | 3 минуты |
| inactivity reminder | 2 минуты |
| waiting return | 4 часа |
| invitations per waiting period | 1 |
| maximum return cycles | 3 |
| trial entitlement default | 3 минуты при наличии права |
| low-balance warning | 2 полные paid-минуты |
| balance pause | 5 минут, один раз |
| client reconnect | 60 секунд |
| agent reconnect | 60 секунд |
| unread message email | 5 минут |
| critical email after confirmed absence | 1 минута |
| noncritical quiet hours | 22:00–08:00 local |
| refund claim | 30 дней |
| refund decision target | 72 часа после полного evidence |
| refund appeal | 7 дней |
| bonus refund-use grace | 30 дней |
| Expert SLA compensation proposal | 1 бонусная минута, только manual super-admin grant |
| accrual period | weekly |
| notification delivery log retention | 90 дней |
| client consultation history | 24 месяца после завершения |
| home topics | 6 desktop / 4 mobile |
| home Expert cards | 6 |
| specializations in compact Expert card | 3 |
| home FAQ | 6 |
| recent consultations on home | 3 |
| home review cards | 3 |

Все значения являются versioned admin settings. Изменение не переписывает исторические snapshots.

## 7. Release gates, а не пробелы функционального ТЗ

Следующие значения могут оставаться открытыми без выдумывания:

- точная compensation economics O4;
- числовой public traffic gate O5 до pilot baseline;
- окончательные legal формулировки;
- brand/domain;
- точный исторический baseline числа консультаций;
- включение KPI influence после пилота.

Для каждого действует fail-closed:

- `unset` не создаёт начисление;
- `disabled` не влияет на ranking;
- legal-unapproved claim не публикуется;
- public traffic остаётся `NO_GO`;
- неподтверждённый показатель не показывается.

## 8. Обязательный сквозной proof

Одна тестовая консультация должна связать:

1. выбор реального eligible Эксперта;
2. бесплатный диалог;
3. request/offer и consent;
4. consultation card;
5. effective price snapshot;
6. trial или его пропуск;
7. paid minute debit;
8. waiting/reconnect/pause;
9. завершение;
10. историю и уведомления;
11. refund/correction;
12. agent accrual/correction;
13. review eligibility;
14. admin audit.

Без этого пакет является готовой постановкой, но не готовым сайтом.
