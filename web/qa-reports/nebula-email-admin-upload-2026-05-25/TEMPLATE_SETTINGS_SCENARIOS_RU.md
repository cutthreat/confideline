# Сценарии и настройки email-шаблонов

Дата: 2026-05-27

Документ объясняет, когда, зачем и с какими настройками использовать каждый из 19 шаблонов. Он не заменяет проверку backend-кода: event_name из dropdown не доказывает наличие реального trigger.

## Общие правила настройки

- subject_email должен оставаться с переменными {{...}}, без жесткой привязки к рабочему/проектному названию.
- event_name - ключ события, но для отправки нужен реальный backend-trigger.
- condition_id использовать только если существующее условие точно совпадает с бизнес-гейтом. Для большинства новых сценариев правильнее проверять условие в backend job.
- delay трактовать как задержку перед финальной проверкой состояния. По live-шаблону id=1 похоже на часы, но единицу должен подтвердить production-код EmailTemplate.
- Сервисные и security/finance/legal письма не должны зависеть от маркетинговой отписки: count_user_settings=0.
- Коммерческие follow-up письма и мягкие reactivation-сценарии должны уважать пользовательские настройки: count_user_settings=1.
- Для отложенных писем backend обязан повторно проверить состояние в момент отправки: платеж все еще не оплачен, сообщения все еще нет, отзыв еще не оставлен.
- Базовый импорт идет EN-first: сначала английский текст, затем переводы. Русский пакет нужно внедрять как RU-локализацию или после EN-base.
- Нельзя придумывать новые переменные в шаблонах. Использовать только переменные, доступные конкретному template/event; новая переменная означает изменение backend-кода.
- Queue-binding проверяется отдельно: часть template events уже обрабатывается очередями, часть не задействована.

## Сводная матрица

| # | Шаблон | Когда | event_name | condition_id | delay | source_trigger | Решение |
|---:|---|---|---|---:|---:|---|---|
| 0 | user_registration | Сразу после создания аккаунта по событию user.register. | user.register | 0 | 0 | user_registered | проверить trigger |
| 1 | email_confirmation | Сразу после регистрации или смены email, когда адрес еще не подтвержден. | user.email_confirmation | 0 | 0 | email_confirmation_required | проверить trigger |
| 10 | support_ticket_opened | Сразу после создания обращения пользователем или оператором от имени пользователя. | support.ticket.opened | 0 | 0 | support_ticket_opened | нужен backend event |
| 11 | support_message_received | Сразу после публичного ответа поддержки пользователю. | support.message.received | 0 | 0 | support_message_received_created | проверить trigger |
| 12 | payment_refund | После финального подтверждения возврата платежным или финансовым контуром. | payment.refund | 0 | 0 | payment_refund | проверить trigger |
| 13 | payment_refund_update | Когда по возврату появляется значимое изменение статуса, но это еще не финальное подтверждение. | payment.refund.update | 0 | 0 | payment_refund_updated | нужен backend event |
| 14 | advisor_followup_offer | Через 72 часа после завершения консультации, если повторная консультация разрешена и уместна. | advisor.followup.offer | 0 | 72 | same_advisor_followup_allowed | нужен backend event |
| 15 | review_request | Через 24 часа после завершения консультации, если отзыв еще не оставлен. | review.request | 0 | 24 | review_request_allowed | нужен backend event |
| 16 | message_chat_saved | Через 48 часов после завершения/сохранения чата. | message.chat_saved | 0 | 48 | message_chat_saved_allowed | нужен backend event |
| 17 | support_safety_notice | По событию safety/support flow: предупреждение, важная инструкция, ограничение или безопасный канал связи. | support.safety_notice | 0 | 0 | safety_flow_notice | нужен backend event |
| 18 | user_age_restricted | Сразу после решения ограничить доступ к сервису по возрасту или правилам платформы. | user.age_restricted | 0 | 0 | minor_or_age_restricted | нужен backend event |
| 2 | user_password_recovery | Сразу после запроса восстановления пароля. | user.password_recovery | 0 | 0 | user_password_recovery_requested | нужен backend event |
| 3 | security_change | Сразу после изменения пароля, email, 2FA или другого чувствительного параметра аккаунта. | security.security_change | 0 | 0 | security_setting_changed | нужен backend event |
| 4 | payment_success | Сразу после успешного подтверждения платежа платежным провайдером. | payment.success | 0 | 0 | payment_success | проверить trigger |
| 5 | payment_error | После финального отказа платежа или ошибки, когда пользователь может повторить попытку. | payment.error | 0 | 0 | payment_error | проверить trigger |
| 6 | payment_init | Через 2 часа после начала оплаты, только если заказ остался неоплаченным. | payment.init | 0 | 2 | payment_init_not_completed | проверить trigger |
| 7 | message_no_first_chat_message | Через 2 часа после оплаты/открытия чата, если пользователь так и не написал первое сообщение. | message.no_first_chat_message | 5 | 2 | paid_chat_no_message_after_delay | нужен backend event |
| 8 | message_answer_delayed | Когда SLA ответа нарушен или приближается к нарушению, а ответа эксперта все еще нет. | message.answer_delayed | 0 | 0 | chat_answer_sla_delay_detected | нужен backend event |
| 9 | message_received | Сразу после публикации ответа эксперта клиенту. | message.received | 0 | 0 | advisor_chat_reply_created | проверить trigger |

## Детальные сценарии

### 0. Регистрация пользователя (user_registration)

- **Когда отправлять:** Сразу после создания аккаунта по событию user.register.
- **Зачем:** Это отдельное welcome/service-письмо: оно подтверждает факт регистрации, но не заменяет письмо подтверждения email.
- **Subject:** Добро пожаловать в {{siteName}}
- **event_name:** user.register
- **condition_id:** 0
- **delay:** 0
- **source_trigger:** user_registered
- **type_id / settings:** 1 / count_user_settings=0
- **Почему такие настройки:** Сервисное письмо, type_id 1, event user.register, condition_id 0, delay 0, count_user_settings 0.
- **Backend-гейт:** Пользователь создан; письмо не должно отправляться повторно для условий 1/3 days; подтверждение email обрабатывается отдельным user.email_confirmation.
- **Решение по внедрению:** Загружать в отдельный User registration / No conditions шаблон. Не подменять им Email confirmation.
- **Проверка:** Создать тестового пользователя; проверить welcome-письмо, затем отдельно проверить email confirmation.
- **Переменные:** legalMerchantName, privacyUrl, refundPolicyUrl, siteName, siteUrl, supportEmail, termsUrl, userName

### 1. Подтверждение email (email_confirmation)

- **Когда отправлять:** Сразу после регистрации или смены email, когда адрес еще не подтвержден.
- **Зачем:** Закрывает базовый доступ и доставляемость: пользователь подтверждает адрес, а сервис получает рабочий email для критичных уведомлений.
- **Subject:** Подтвердите email для {{siteName}}
- **event_name:** user.email_confirmation
- **condition_id:** 0
- **delay:** 0
- **source_trigger:** email_confirmation_required
- **type_id / settings:** 1 / count_user_settings=0
- **Почему такие настройки:** Сервисное письмо, без учета пользовательских email-настроек, без задержки и без дополнительных условий.
- **Backend-гейт:** У пользователя есть неподтвержденный email; confirmation token активен; письмо не отправлялось повторно слишком часто.
- **Решение по внедрению:** Можно импортировать первым, но backend-trigger все равно подтвердить в актуальном коде.
- **Проверка:** Создать тестового пользователя или запросить повторное подтверждение email; проверить ссылку, срок действия и отсутствие жестко прошитого бренда в тексте.
- **Переменные:** confirmationExpiresAt, confirmUrl, legalMerchantName, privacyUrl, refundPolicyUrl, siteName, siteUrl, supportEmail, termsUrl, userName

### 10. Обращение в поддержку создано (support_ticket_opened)

- **Когда отправлять:** Сразу после создания обращения пользователем или оператором от имени пользователя.
- **Зачем:** Фиксирует факт обращения и снижает повторные обращения: пользователь знает номер и дальнейший путь.
- **Subject:** Обращение в поддержку создано
- **event_name:** support.ticket.opened
- **condition_id:** 0
- **delay:** 0
- **source_trigger:** support_ticket_opened
- **type_id / settings:** 2 / count_user_settings=0
- **Почему такие настройки:** Поведенческое сервисное письмо, delay 0, condition 0, без маркетингового opt-out.
- **Backend-гейт:** Support case создан; есть supportCaseId; обращение доступно пользователю; письмо не дублируется при каждом комментарии.
- **Решение по внедрению:** Нужен backend event support.ticket.opened или привязка к текущей support-модели.
- **Проверка:** Создать тестовое обращение; проверить номер, ссылку и отсутствие отправки при внутренней операторской заметке.
- **Переменные:** legalMerchantName, privacyUrl, refundPolicyUrl, siteName, siteUrl, supportCaseId, supportCaseUrl, supportEmail, termsUrl, userName

### 11. Поддержка ответила (support_message_received)

- **Когда отправлять:** Сразу после публичного ответа поддержки пользователю.
- **Зачем:** Возвращает пользователя к решению вопроса и уменьшает пропущенные ответы поддержки.
- **Subject:** Поддержка ответила по обращению #{{supportCaseId}}
- **event_name:** support.message.received
- **condition_id:** 0
- **delay:** 0
- **source_trigger:** support_message_received_created
- **type_id / settings:** 2 / count_user_settings=0
- **Почему такие настройки:** Поведенческое сервисное письмо, delay 0, condition 0.
- **Backend-гейт:** Создан публичный ответ поддержки; есть supportCaseId; сообщение не является внутренней заметкой.
- **Решение по внедрению:** Event есть в dropdown, но нужно подтвердить реальный trigger и переменные supportCaseId/supportUrl.
- **Проверка:** Ответить в тестовом тикете публичным сообщением; проверить письмо и ссылку на обращение.
- **Переменные:** legalMerchantName, privacyUrl, refundPolicyUrl, siteName, siteUrl, supportCaseId, supportCaseStatus, supportCaseUrl, supportEmail, supportUpdatedAt, termsUrl, userName

### 12. Возврат подтвержден (payment_refund)

- **Когда отправлять:** После финального подтверждения возврата платежным или финансовым контуром.
- **Зачем:** Сервисное финансовое письмо: снижает тревогу по деньгам и фиксирует ожидания по срокам.
- **Subject:** Возврат по заказу #{{orderId}} подтверждён
- **event_name:** payment.refund
- **condition_id:** 0
- **delay:** 0
- **source_trigger:** payment_refund
- **type_id / settings:** 2 / count_user_settings=0
- **Почему такие настройки:** Поведенческое/сервисное финансовое письмо, delay 0, condition 0, без маркетингового opt-out.
- **Backend-гейт:** Refund имеет confirmed/processed status; сумма и orderId известны; событие дедуплицировано по refundId.
- **Решение по внедрению:** Event payment.refund есть в dropdown, но нужно различить confirmed и update.
- **Проверка:** Смоделировать refund confirmed; проверить сумму, orderId, refundEta и отсутствие дубля при повторном webhook.
- **Переменные:** currency, legalMerchantName, orderId, privacyUrl, processorRefundId, refundAmount, refundEta, refundPolicyUrl, siteName, siteUrl, supportCaseUrl, supportEmail, termsUrl, userName

### 13. Статус возврата обновлен (payment_refund_update)

- **Когда отправлять:** Когда по возврату появляется значимое изменение статуса, но это еще не финальное подтверждение.
- **Зачем:** Держит пользователя в курсе спорного/длинного финансового процесса.
- **Subject:** Статус возврата обновлён
- **event_name:** payment.refund.update
- **condition_id:** 0
- **delay:** 0
- **source_trigger:** payment_refund_updated
- **type_id / settings:** 2 / count_user_settings=0
- **Почему такие настройки:** Поведенческое финансовое письмо, delay 0, condition 0.
- **Backend-гейт:** Статус refund case изменился на пользовательски значимый; не отправлять на технические/внутренние статусы.
- **Решение по внедрению:** Нужен отдельный backend event payment.refund.update, чтобы не конфликтовать с финальным payment.refund.
- **Проверка:** Перевести refund case между пользовательскими статусами; проверить, что письмо не уходит на внутренние изменения.
- **Переменные:** legalMerchantName, privacyUrl, refundPolicyUrl, siteName, siteUrl, supportCaseId, supportCaseUrl, supportUpdatedAt, termsUrl, userName

### 14. Продолжить с тем же экспертом (advisor_followup_offer)

- **Когда отправлять:** Через 72 часа после завершения консультации, если повторная консультация разрешена и уместна.
- **Зачем:** Мягкое коммерческое продолжение: пользователь может вернуться к знакомому эксперту без поиска заново.
- **Subject:** Можно продолжить чат с {{advisorName}}
- **event_name:** advisor.followup.offer
- **condition_id:** 0
- **delay:** 72
- **source_trigger:** same_advisor_followup_allowed
- **type_id / settings:** 3 / count_user_settings=1
- **Почему такие настройки:** Маркетинговое письмо: type_id 3, count_user_settings 1, delay 72, condition 0.
- **Backend-гейт:** Чат завершен; эксперт доступен; нет открытого активного чата; пользователь не отписан; тематика не запрещает follow-up.
- **Решение по внедрению:** Нужен новый backend event advisor.followup.offer и бизнес-правила допустимого follow-up.
- **Проверка:** Закрыть тестовый чат; проверить отправку через 72 часа только при разрешенном follow-up и активных user settings.
- **Переменные:** advisorName, chatUrl, emailPreferencesUrl, followupOfferUrl, legalMerchantName, privacyUrl, refundPolicyUrl, siteName, siteUrl, termsUrl, unsubscribeUrl, userName

### 15. Попросить оценку консультации (review_request)

- **Когда отправлять:** Через 24 часа после завершения консультации, если отзыв еще не оставлен.
- **Зачем:** Собирает обратную связь и помогает контролировать качество экспертов.
- **Subject:** Оцените опыт консультации в чате
- **event_name:** review.request
- **condition_id:** 0
- **delay:** 24
- **source_trigger:** review_request_allowed
- **type_id / settings:** 3 / count_user_settings=1
- **Почему такие настройки:** Маркетингово-поведенческое письмо: type_id 3, count_user_settings 1, event review.request, delay 24.
- **Backend-гейт:** Консультация завершена; review еще не оставлен; нет активной жалобы/refund по консультации; пользователь не отписан.
- **Решение по внедрению:** Нужен отдельный backend event review.request; review.left остается событием уже оставленного отзыва и должен отменять pending request.
- **Проверка:** Завершить чат без отзыва; проверить письмо через delay. Затем оставить отзыв до delay и убедиться, что письмо не ушло.
- **Переменные:** emailPreferencesUrl, legalMerchantName, privacyUrl, refundPolicyUrl, reviewUrl, siteName, siteUrl, termsUrl, unsubscribeUrl, userName

### 16. Чат сохранен, можно вернуться (message_chat_saved)

- **Когда отправлять:** Через 48 часов после завершения/сохранения чата.
- **Зачем:** Ненавязчиво возвращает пользователя к ценности консультации и истории ответа.
- **Subject:** Ваш чат с экспертом сохранён
- **event_name:** message.chat_saved
- **condition_id:** 0
- **delay:** 48
- **source_trigger:** message_chat_saved_allowed
- **type_id / settings:** 3 / count_user_settings=1
- **Почему такие настройки:** Маркетингово-поведенческое письмо: type_id 3, count_user_settings 1, delay 48, condition 0.
- **Backend-гейт:** Чат завершен и доступен в кабинете; нет удаления/возврата/спора; пользователь не отписан.
- **Решение по внедрению:** Нужен backend event message.chat_saved или отдельный lifecycle event.
- **Проверка:** Закрыть чат и дождаться/смоделировать 48 часов; проверить ссылку на сохраненный чат и respect user settings.
- **Переменные:** chatUrl, emailPreferencesUrl, legalMerchantName, privacyUrl, refundPolicyUrl, siteName, siteUrl, termsUrl, unsubscribeUrl, userName

### 17. Важная информация о поддержке (support_safety_notice)

- **Когда отправлять:** По событию safety/support flow: предупреждение, важная инструкция, ограничение или безопасный канал связи.
- **Зачем:** Сервисная защита пользователя и компании: сообщает важные правила без маркетинга.
- **Subject:** Важная информация о поддержке
- **event_name:** support.safety_notice
- **condition_id:** 0
- **delay:** 0
- **source_trigger:** safety_flow_notice
- **type_id / settings:** 1 / count_user_settings=0
- **Почему такие настройки:** Сервисное письмо, type_id 1, count_user_settings 0, delay 0, condition 0.
- **Backend-гейт:** Есть подтвержденное safety-событие; текст соответствует юридически утвержденному сценарию; не раскрывает чувствительные подробности.
- **Решение по внедрению:** Нужен backend event support.safety_notice и юридическое согласование текста/триггеров.
- **Проверка:** Смоделировать safety flow; проверить, что письмо уходит только адресату и не содержит лишних деталей.
- **Переменные:** legalMerchantName, privacyUrl, refundPolicyUrl, siteName, siteUrl, supportEmail, supportUrl, termsUrl, userName

### 18. Ограничение доступа по возрасту/правилам (user_age_restricted)

- **Когда отправлять:** Сразу после решения ограничить доступ к сервису по возрасту или правилам платформы.
- **Зачем:** Юридически аккуратно объясняет ограничение и дает путь в поддержку без спорных деталей.
- **Subject:** Доступ к сервису ограничен
- **event_name:** user.age_restricted
- **condition_id:** 0
- **delay:** 0
- **source_trigger:** minor_or_age_restricted
- **type_id / settings:** 1 / count_user_settings=0
- **Почему такие настройки:** Сервисное legal-письмо, type_id 1, count_user_settings 0, delay 0, condition 0.
- **Backend-гейт:** Решение об ограничении принято надежным процессом; пользовательский аккаунт/сессия ограничены; есть ссылка поддержки.
- **Решение по внедрению:** Нужен backend event user.age_restricted и юридическое подтверждение формулировок.
- **Проверка:** На тестовом аккаунте применить ограничение; проверить письмо, поддержку и отсутствие деталей, которые нельзя раскрывать.
- **Переменные:** legalMerchantName, privacyUrl, refundPolicyUrl, siteName, siteUrl, supportEmail, supportUrl, termsUrl, userName

### 2. Сброс пароля (user_password_recovery)

- **Когда отправлять:** Сразу после запроса восстановления пароля.
- **Зачем:** Критичное security-письмо: пользователь должен быстро и безопасно восстановить доступ.
- **Subject:** Сброс пароля для {{siteName}}
- **event_name:** user.password_recovery
- **condition_id:** 0
- **delay:** 0
- **source_trigger:** user_password_recovery_requested
- **type_id / settings:** 1 / count_user_settings=0
- **Почему такие настройки:** Сервисное письмо, без opt-out, delay 0, condition 0. Не должно зависеть от маркетинговых настроек.
- **Backend-гейт:** Запрос восстановления создан; reset token активен; не превышен rate limit; email принадлежит найденному аккаунту или используется безопасный одинаковый ответ.
- **Решение по внедрению:** Нужен backend event или привязка к текущему mailer восстановления пароля.
- **Проверка:** Запросить восстановление пароля на тестовом аккаунте; проверить одноразовость ссылки, срок действия и отсутствие раскрытия существования аккаунта.
- **Переменные:** legalMerchantName, privacyUrl, refundPolicyUrl, resetExpiresAt, resetUrl, siteName, siteUrl, supportEmail, termsUrl, userName

### 3. Изменение безопасности (security_change)

- **Когда отправлять:** Сразу после изменения пароля, email, 2FA или другого чувствительного параметра аккаунта.
- **Зачем:** Снижает риск захвата аккаунта: пользователь видит подозрительное изменение и может обратиться в поддержку.
- **Subject:** Изменение безопасности в аккаунте {{siteName}}
- **event_name:** security.security_change
- **condition_id:** 0
- **delay:** 0
- **source_trigger:** security_setting_changed
- **type_id / settings:** 1 / count_user_settings=0
- **Почему такие настройки:** Сервисное security-письмо, без пользовательского opt-out, delay 0, condition 0.
- **Backend-гейт:** Изменение безопасности действительно сохранено; есть тип изменения, время, IP/устройство если это разрешено политикой приватности.
- **Решение по внедрению:** Нужен новый backend event и согласованный список типов security-событий.
- **Проверка:** Изменить пароль/2FA в тестовом аккаунте; проверить, что письмо не содержит лишних персональных или технических данных.
- **Переменные:** accountSecurityUrl, legalMerchantName, privacyUrl, refundPolicyUrl, securityChangedAt, siteName, siteUrl, supportEmail, termsUrl, userName

### 4. Оплата подтверждена (payment_success)

- **Когда отправлять:** Сразу после успешного подтверждения платежа платежным провайдером.
- **Зачем:** Дает пользователю уверенность, чек/статус оплаты и быстрый переход к чату с экспертом.
- **Subject:** Оплата подтверждена: чат-консультация {{siteName}} готова
- **event_name:** payment.success
- **condition_id:** 0
- **delay:** 0
- **source_trigger:** payment_success
- **type_id / settings:** 1 / count_user_settings=0
- **Почему такие настройки:** Сервисное платежное письмо, delay 0, condition 0, без учета маркетинговых настроек.
- **Backend-гейт:** Платеж имеет финальный success/paid status; заказ связан с консультацией; сумма и orderId доступны.
- **Решение по внедрению:** Event есть в dropdown, но нужен реальный trigger от платежного контура.
- **Проверка:** Провести тестовую оплату/sandbox callback; проверить сумму, orderId, ссылку на чат и отсутствие дублей при повторном webhook.
- **Переменные:** advisorName, amount, chatUrl, currency, firstResponseSla, legalMerchantName, merchantDescriptor, orderId, paidAt, privacyUrl, receiptUrl, refundPolicyUrl, siteName, siteUrl, supportEmail, termsUrl, userName

### 5. Оплата не прошла (payment_error)

- **Когда отправлять:** После финального отказа платежа или ошибки, когда пользователь может повторить попытку.
- **Зачем:** Снижает потерю оплачиваемого сценария: объясняет статус и дает аккуратный путь повторить оплату.
- **Subject:** Оплата не прошла
- **event_name:** payment.error
- **condition_id:** 0
- **delay:** 0
- **source_trigger:** payment_error
- **type_id / settings:** 1 / count_user_settings=0
- **Почему такие настройки:** Сервисное письмо, delay 0, condition 0. Не отправлять на каждую промежуточную provider-ошибку.
- **Backend-гейт:** Платеж в failed/error status; заказ не оплачен; доступна безопасная ссылка повторной оплаты.
- **Решение по внедрению:** Event есть в dropdown, но нужно подтвердить точку вызова и дедупликацию.
- **Проверка:** Смоделировать failed payment; проверить один email на одну попытку и корректный retry URL.
- **Переменные:** amount, checkoutUrl, currency, legalMerchantName, privacyUrl, refundPolicyUrl, siteName, siteUrl, supportUrl, termsUrl, userName

### 6. Оплата начата, но не завершена (payment_init)

- **Когда отправлять:** Через 2 часа после начала оплаты, только если заказ остался неоплаченным.
- **Зачем:** Аккуратное восстановление незавершенного платежа без давления: пользователь мог закрыть страницу или потерять ссылку.
- **Subject:** Вы можете завершить оплату чат-консультации
- **event_name:** payment.init
- **condition_id:** 0
- **delay:** 2
- **source_trigger:** payment_init_not_completed
- **type_id / settings:** 3 / count_user_settings=1
- **Почему такие настройки:** Маркетингово-поведенческое письмо: type_id 3, count_user_settings 1, event payment.init, delay 2, condition 0.
- **Backend-гейт:** Payment init создан; success/error/refund не наступили; нет более свежей успешной оплаты по этому заказу; пользователь не отписан от таких писем.
- **Решение по внедрению:** Event есть в dropdown, но delay должен работать как отложенная проверка состояния, а не как мгновенный email.
- **Проверка:** Создать платеж и не завершать его; через тестовый delay проверить, что письмо уходит только для unpaid order. При success/error до delay письмо должно быть отменено.
- **Переменные:** amount, checkoutUrl, currency, emailPreferencesUrl, legalMerchantName, privacyUrl, refundPolicyUrl, siteName, siteUrl, termsUrl, unsubscribeUrl, userName

### 7. Оплаченный чат без первого сообщения (message_no_first_chat_message)

- **Когда отправлять:** Через 2 часа после оплаты/открытия чата, если пользователь так и не написал первое сообщение.
- **Зачем:** Сохраняет ценность оплаченной консультации: пользователь купил доступ, но не сделал главный шаг.
- **Subject:** Чат с экспертом доступен - осталось написать сообщение
- **event_name:** message.no_first_chat_message
- **condition_id:** 5
- **delay:** 2
- **source_trigger:** paid_chat_no_message_after_delay
- **type_id / settings:** 2 / count_user_settings=0
- **Почему такие настройки:** Поведенческое сервисное письмо: type_id 2, condition_id 5 No messages, delay 2, count_user_settings 0.
- **Backend-гейт:** Чат оплачен и активен; от пользователя нет первого сообщения; консультация не закрыта; reminder еще не отправлялся.
- **Решение по внедрению:** Нужен новый backend event или cron/queue job с проверкой no messages.
- **Проверка:** Оплатить тестовый чат и не писать сообщение; проверить отправку после delay и отсутствие письма, если сообщение появилось до delay.
- **Переменные:** chatUrl, legalMerchantName, orderId, privacyUrl, refundPolicyUrl, siteName, siteUrl, supportUrl, termsUrl, userName

### 8. Ответ эксперта задерживается (message_answer_delayed)

- **Когда отправлять:** Когда SLA ответа нарушен или приближается к нарушению, а ответа эксперта все еще нет.
- **Зачем:** Предотвращает недоверие и обращения в поддержку: пользователь видит, что сервис контролирует задержку.
- **Subject:** Статус чата: ответ задерживается
- **event_name:** message.answer_delayed
- **condition_id:** 0
- **delay:** 0
- **source_trigger:** chat_answer_sla_delay_detected
- **type_id / settings:** 2 / count_user_settings=0
- **Почему такие настройки:** Поведенческое сервисное письмо, delay 0 на момент SLA job, condition 0. Сам delay должен жить в SLA job, не в шаблоне.
- **Backend-гейт:** Есть активный оплаченный чат; клиент ждет ответа; SLA threshold достигнут; эксперт еще не ответил; письмо не отправлялось ранее по этой задержке.
- **Решение по внедрению:** Нужен новый backend event/message.answer_delayed и SLA-проверка.
- **Проверка:** Создать чат без ответа эксперта и искусственно сдвинуть время; проверить одно письмо и отмену, если эксперт ответил.
- **Переменные:** answerDueAt, chatUrl, consultationId, legalMerchantName, privacyUrl, refundPolicyUrl, siteName, siteUrl, supportCaseId, supportCaseUrl, termsUrl, updatedAnswerEta, userName

### 9. Эксперт ответил в чате (message_received)

- **Когда отправлять:** Сразу после публикации ответа эксперта клиенту.
- **Зачем:** Главное retention-письмо консультации: возвращает пользователя в кабинет к готовому ответу.
- **Subject:** Эксперт ответил в чате
- **event_name:** message.received
- **condition_id:** 0
- **delay:** 0
- **source_trigger:** advisor_chat_reply_created
- **type_id / settings:** 2 / count_user_settings=0
- **Почему такие настройки:** Поведенческое уведомление, delay 0, condition 0. В Nebula MVP используем текущий backend event message.received.
- **Backend-гейт:** Создан ответ эксперта; ответ видим клиенту; клиент не находится уже в активном чате/не получил realtime-уведомление в той же сессии.
- **Решение по внедрению:** Использовать существующее событие MESSAGE_RECEIVED / message.received: других email-сообщений, кроме ответа эксперта клиенту, в MVP нет.
- **Проверка:** Создать ответ эксперта; проверить, что письмо ушло клиенту и содержит ссылку на конкретный чат.
- **Переменные:** advisorName, chatUrl, legalMerchantName, privacyUrl, refundPolicyUrl, siteName, siteUrl, supportEmail, supportUrl, termsUrl, userName
