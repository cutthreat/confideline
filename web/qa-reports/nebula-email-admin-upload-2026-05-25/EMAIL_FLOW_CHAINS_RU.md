# Flow-цепочки email-уведомлений

Дата обновления: 2026-06-01 12:37

Скоуп: только онлайн-консультация через чат. Документ фиксирует не внешний вид писем, а порядок срабатывания, пересечения, отмены, suppression-правила и backend-gates.

## Основания из email-маркетинга

- **Klaviyo Academy:** Ключевые lifecycle-flow, split logic, разные шаблоны под разные цели, минимум 1 день между маркетинговыми письмами. (https://academy.klaviyo.com/en-us/best-practices/best-practices-for-flows)
- **Klaviyo scheduling:** Abandoned checkout/payment recovery лучше запускать не мгновенно, а через 2-4 часа и отменять после покупки. (https://www.klaviyo.com/blog/how-to-schedule-marketing-emails)
- **HubSpot deliverability:** Персонализация, ограничение частоты и сегментация поддерживают доставляемость и снижают перегрузку пользователя. (https://knowledge.hubspot.com/marketing-email/overview-of-email-deliverability)
- **Litmus accessibility:** Live HTML text, читаемые размеры, line-height и отступы важны для email-доступности. (https://www.litmus.com/blog/ultimate-guide-accessible-emails)
- **Litmus dark mode:** Письма должны проверяться в light/dark mode, потому что email-клиенты по-разному инвертируют цвета. (https://www.litmus.com/dark-mode-email-best-practices)

## Глобальные правила

- **Отложенные письма проверяют состояние дважды:** При постановке в очередь фиксируется execute_at, но перед отправкой cron/job обязан заново проверить бизнес-состояние.
- **Событие в dropdown не равно рабочему trigger:** event_name из админки считается готовым только после проверки queue-binding в backend-коде.
- **Дедупликация обязательна:** Минимальный ключ: userId + templateKey + entityId/orderId/chatId/refundId + eventVersion/status.
- **Service/security/payment письма не блокируются маркетинговым opt-out:** Marketing/lifecycle письма respect user settings, unsubscribeUrl и count_user_settings.
- **Колокольчик и email должны иметь согласованное время:** Если notification связан с delayed email, использовать visible_at=execute_at либо явно принять продуктово, что bell появляется сразу.
- **Общие event_name требуют context:** message.received в Nebula MVP означает ответ эксперта клиенту; payment.refund.update и payment.refund разделяют промежуточный и финальный refund; review.request и review.left разделяют запрос и факт отзыва.

## Регистрация и доступ

- Роль: Дать пользователю доступ, подтвердить email и не смешать welcome, confirmation и legacy follow-up.
- Правило: Welcome и email confirmation являются разными письмами. Legacy follow-up по user.register с условиями 1/3 дня не должен дублировать базовую регистрацию.

| # | Когда | template_key | Пользовательский смысл | Backend gate | Отмена/пропуск | Действие для Игоря |
|---|---|---|---|---|---|---|
| 1 | сразу | user_registration | Сервисный старт. Не продает, не заменяет подтверждение email. | пользователь создан впервые; не legacy follow-up; не повторная отправка | пропустить при повторной регистрации/дубликате события | Обновлять live id=3, не id=1/id=2. Проверить legacy follow-up условия. |
| 2 | сразу | email_confirmation | Критичный double opt-in/access step. Нельзя блокировать маркетинговым opt-out. | token активен; confirmationExpiresAt доступен; throttling соблюден | не слать, если email уже подтвержден до выполнения очереди | Обновлять live id=4. Проверить confirmUrl и срок token. |
| 3 | по запросу | user_password_recovery | Security письмо. Приоритет выше всех маркетинговых и lifecycle ограничений. | reset token активен; rate limit соблюден; ответ UI не раскрывает существование аккаунта | не блокировать маркетинговыми настройками; пропустить старый token после нового запроса | Добавить/подтвердить event и renderer variables resetUrl/resetExpiresAt. |
| 4 | сразу | security_change | Security письмо. Минимум деталей, только полезное действие и поддержка. | изменение сохранено; есть тип изменения и безопасное время события | не раскрывать лишние IP/device данные без privacy-основания | Добавить event security.security_change и whitelist типов security-событий. |

Пересечения:
- id=1 и id=2 в live-админке являются отложенными registration follow-up, а базовый welcome соответствует id=3.
- Email confirmation не заменяет welcome: оба могут уйти после регистрации, но только confirmation содержит confirmUrl.
- Подтверждение email должно отменять/подавлять legacy follow-up, если его цель - вернуть неподтвержденного или неактивного пользователя.

## Оплата и незавершенный checkout

- Роль: Зафиксировать оплату, восстановить незавершенную оплату и не отправить взаимоисключающие письма.
- Правило: payment.init ставит delayed recovery через 2 часа. payment.success или финальный payment.error должны закрыть эту ветку для конкретной попытки оплаты.

| # | Когда | template_key | Пользовательский смысл | Backend gate | Отмена/пропуск | Действие для Игоря |
|---|---|---|---|---|---|---|
| 1 | +2 часа | payment_init | Abandoned checkout recovery: +2 часа, только если заказ все еще unpaid. | заказ все еще unpaid; нет success/error по более свежей попытке; пользователь допускает lifecycle письма | отменить при payment.success, финальном payment.error, новом оплаченном order или refund | Delay=2. Queue item отменяется success/error/refund по orderId/paymentAttemptId. |
| 2 | сразу | payment_success | Post-purchase service письмо: чек, статус, переход в чат, отмена abandoned checkout. | webhook дедуплицирован; orderId, amount, currency, receiptUrl, chatUrl доступны | отменить pending payment_init по orderId; не слать повторно при повторном webhook | Webhook idempotency обязателен. После success отменить payment_init. |
| 3 | сразу | payment_error | Recovery без давления: отправлять только на финальный failed/error. | ошибка финальная, а не промежуточный provider status; checkoutUrl безопасен | не слать, если по этому order уже есть success; отменить pending payment_init для этой попытки | Фильтровать только финальный failed/error, не provider pending. |

Пересечения:
- payment_init пересекается с payment_success и payment_error: delayed письмо должно повторно проверить состояние перед отправкой.
- Один order может иметь несколько paymentAttemptId; письмо об успехе дедуплицируется по orderId, ошибка - по конкретной финальной попытке.
- После payment.success начинается чат-цепочка: открывается чат и может планироваться reminder о первом сообщении.

## Оплаченная чат-консультация

- Роль: Довести пользователя от оплаты до первого сообщения, удержать доверие во время ожидания и вернуть к ответу эксперта.
- Правило: На текущем этапе консультация только через онлайн-чат. Все письма должны быть привязаны к chatId/consultationId и учитывать направление сообщения.

| # | Когда | template_key | Пользовательский смысл | Backend gate | Отмена/пропуск | Действие для Игоря |
|---|---|---|---|---|---|---|
| 1 | +2 часа после payment.success/open chat | message_no_first_chat_message | Activation reminder: пользователь уже оплатил, но не сделал ключевое действие. | чат активен; нет первого client message; консультация не закрыта; reminder еще не отправлялся | отменить при первом сообщении клиента, refund, закрытии/ограничении чата | Нужен job: paid chat + no first client message. Отмена на first message. |
| 2 | по SLA job | message_answer_delayed | Service recovery: честно объясняет задержку до обращения в поддержку. | нет видимого ответа эксперта; SLA threshold достигнут; чат не закрыт | отменить при ответе эксперта, refund, safety block, закрытии чата | SLA job создает event только если advisor answer все еще отсутствует. |
| 3 | сразу | message_received | Главное возвращающее письмо: ответ готов, CTA ведет в конкретный чат. | message.received в текущем MVP означает ответ эксперта клиенту; ответ видим клиенту; chatUrl ведет в нужный чат | отменить pending message_answer_delayed | Использовать текущий MESSAGE_RECEIVED / message.received как ответ эксперта клиенту. Отменить SLA-delay. |

Пересечения:
- message.received в Nebula MVP используется только как email-событие ответа эксперта клиенту.
- Ответ эксперта должен отменять SLA-delay письмо; первое сообщение клиента должно отменять no-message reminder без отдельного email пользователю.
- Refund, safety notice или age restriction прерывают чат-ветку и подавляют удерживающие письма.

## Поддержка, возвраты и safety

- Роль: Аккуратно обработать спорные и сервисные ситуации без маркетингового давления.
- Правило: Support/refund/safety события могут прерывать платежные, чатовые и retention-цепочки. Эти письма не должны зависеть от маркетингового opt-out.

| # | Когда | template_key | Пользовательский смысл | Backend gate | Отмена/пропуск | Действие для Игоря |
|---|---|---|---|---|---|---|
| 1 | сразу | support_ticket_opened | Service confirmation: номер обращения и ожидание ответа. | есть supportCaseId; обращение видно пользователю; это не внутренняя заметка | не дублировать при каждом комментарии | Не отправлять на internal note или автослужебные события. |
| 2 | сразу | support_message_received | Service return: пользователь видит, что поддержка ответила. | ответ публичный; не internal note; supportUrl доступен | не слать на внутренние статусы и operator-only комментарии | Только public support reply; нужен supportCaseUrl/supportMessageId. |
| 3 | сразу | payment_refund_update | Service status update: только значимые статусы, не внутренние provider-события. | refund_status не финальный, но видимый пользователю; есть refundEta/supportUrl | не слать на технические provider/internal статусы | Нужен новый event payment.refund.update либо backend-разводка промежуточного user-visible refund status до выбора шаблона. |
| 4 | сразу | payment_refund | Financial trust: финальный статус возврата, сумма и сроки. | финальный статус возврата; refundAmount, orderId, processorRefundId доступны | после финального refund подавить review/follow-up/reflection по этой консультации | payment.refund требует final confirmed/processed; затем подавить retention. |
| 5 | сразу | support_safety_notice / user_age_restricted |  | триггер подтвержден; текст согласован; нет лишних чувствительных деталей | подавить маркетинг, review/follow-up/reflection и спорные чатовые письма |  |

Пересечения:
- payment.refund.update и payment.refund должны быть разными событиями/статусами: update и confirmed не являются одним письмом.
- Support публичный ответ и internal note должны быть разными событиями или иметь явный флаг visibility.
- Safety/age restriction является стоп-сигналом для коммерческих цепочек.

## Качество и возврат после консультации

- Роль: Собрать оценку и мягко вернуть пользователя без спама и давления.
- Правило: Retention-письма идут каскадом: review +24h, D2 reflection +48h, same advisor follow-up +72h. Они не должны приходить одновременно.

| # | Когда | template_key | Пользовательский смысл | Backend gate | Отмена/пропуск | Действие для Игоря |
|---|---|---|---|---|---|---|
| 1 | +24 часа после завершения консультации | review_request | Quality loop: не раньше +24ч, отменять при оставленном отзыве, refund или жалобе. | нет review; нет жалобы/refund/safety; пользователь допускает lifecycle письма | отменить при review.left, refund, complaint, safety/age restriction | Нужен новый event review.request. review.left используется только как факт отзыва и отменяет pending request. |
| 2 | +48 часов после завершения/сохранения чата | message_chat_saved | Value reminder: +48ч, мягкий возврат к сохраненному чату без давления. | чат доступен; нет refund/dispute/deletion; пользователь допускает lifecycle письма | отменить при refund, active dispute, удалении чата, safety restriction | Нужен message.chat_saved/lifecycle event и suppression refund/dispute/delete. |
| 3 | +72 часа после завершения консультации | advisor_followup_offer | Commercial follow-up: +72ч, после quality/value писем и только при уместности. | эксперт доступен; нет активного чата; нет refund/complaint/safety; пользователь допускает маркетинг | отменить при новой активной консультации, opt-out, refund, complaint, safety restriction | Нужен advisor.followup.offer, advisor availability, no active chat, opt-out check. |

Пересечения:
- Это самая рискованная ветка по частоте писем: нельзя ставить review и follow-up на один delay.
- review.request нужен для запроса оценки; review.left является фактом оставленного отзыва и должен отменять pending request.
- Любой refund/support complaint/safety должен подавлять retention по этой консультации.

## Матрица отмен и suppression

| Событие | Отменяет/подавляет | Entity | Почему |
|---|---|---|---|
| payment.success | payment_init | orderId/paymentAttemptId | оплата уже успешна, abandoned checkout больше не актуален |
| payment.error | payment_init | paymentAttemptId | попытка оплаты финально завершилась ошибкой |
| first client message | message_no_first_chat_message | chatId | пользователь уже написал в оплаченный чат |
| advisor reply | message_answer_delayed | chatId | задержка ответа больше не актуальна |
| review left | review_request | chatId | оценка уже оставлена |
| refund confirmed/update | review_request, message_chat_saved, advisor_followup_offer | orderId/chatId | финансовый спор делает retention неуместным |
| safety/age restriction | marketing/lifecycle/chat follow-up | userId/safetyCaseId | юридический или safety стоп-сигнал выше маркетинга |
| new active chat | advisor_followup_offer | userId/advisorId | не предлагать продолжение, когда активный чат уже есть |
| email confirmed/login/chat activity | legacy user.register follow-up id=1/id=2 if applicable | userId | отложенные no-login/welcome сценарии больше не соответствуют состоянию |

