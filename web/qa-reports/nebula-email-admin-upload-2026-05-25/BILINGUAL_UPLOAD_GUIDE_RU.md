# Bilingual upload guide

Current package: 18 scenarios / 36 language rows.

The payment block follows the current balance/service model.

- 00 `user_registration` / `en` / `templates/00_user_registration/en` / subject: Welcome to {{siteName}}
- 00 `user_registration` / `ru` / `templates/00_user_registration/ru` / subject: Добро пожаловать в {{siteName}}
- 01 `email_confirmation` / `en` / `templates/01_email_confirmation/en` / subject: Confirm your email for {{siteName}}
- 01 `email_confirmation` / `ru` / `templates/01_email_confirmation/ru` / subject: Подтвердите email для {{siteName}}
- 02 `user_password_recovery` / `en` / `templates/02_user_password_recovery/en` / subject: Reset your {{siteName}} password
- 02 `user_password_recovery` / `ru` / `templates/02_user_password_recovery/ru` / subject: Сброс пароля для {{siteName}}
- 03 `security_change` / `en` / `templates/03_security_change/en` / subject: Security change in your {{siteName}} account
- 03 `security_change` / `ru` / `templates/03_security_change/ru` / subject: Изменение безопасности в аккаунте {{siteName}}
- 04 `message_no_first_chat_message` / `en` / `templates/04_message_no_first_chat_message/en` / subject: Your advisor chat is ready - send your first message
- 04 `message_no_first_chat_message` / `ru` / `templates/04_message_no_first_chat_message/ru` / subject: Чат с экспертом доступен - осталось написать сообщение
- 05 `message_answer_delayed` / `en` / `templates/05_message_answer_delayed/en` / subject: Chat status: the reply is delayed
- 05 `message_answer_delayed` / `ru` / `templates/05_message_answer_delayed/ru` / subject: Статус чата: ответ задерживается
- 06 `message_received` / `en` / `templates/06_message_received/en` / subject: Your advisor replied in chat
- 06 `message_received` / `ru` / `templates/06_message_received/ru` / subject: Эксперт ответил в чате
- 07 `support_ticket_opened` / `en` / `templates/07_support_ticket_opened/en` / subject: Your support request was created
- 07 `support_ticket_opened` / `ru` / `templates/07_support_ticket_opened/ru` / subject: Обращение в поддержку создано
- 08 `support_message_received` / `en` / `templates/08_support_message_received/en` / subject: Support replied to case #{{supportCaseId}}
- 08 `support_message_received` / `ru` / `templates/08_support_message_received/ru` / subject: Поддержка ответила по обращению #{{supportCaseId}}
- 09 `payment_refund` / `en` / `templates/09_payment_refund/en` / subject: Refund for order #{{orderId}} is confirmed
- 09 `payment_refund` / `ru` / `templates/09_payment_refund/ru` / subject: Возврат по заказу #{{orderId}} подтверждён
- 10 `payment_refund_update` / `en` / `templates/10_payment_refund_update/en` / subject: Refund status updated
- 10 `payment_refund_update` / `ru` / `templates/10_payment_refund_update/ru` / subject: Статус возврата обновлён
- 11 `advisor_followup_offer` / `en` / `templates/11_advisor_followup_offer/en` / subject: You can continue the chat with {{advisorName}}
- 11 `advisor_followup_offer` / `ru` / `templates/11_advisor_followup_offer/ru` / subject: Можно продолжить чат с {{advisorName}}
- 12 `review_request` / `en` / `templates/12_review_request/en` / subject: Rate your chat consultation experience
- 12 `review_request` / `ru` / `templates/12_review_request/ru` / subject: Оцените опыт консультации в чате
- 13 `message_chat_saved` / `en` / `templates/13_message_chat_saved/en` / subject: Your advisor chat has been saved
- 13 `message_chat_saved` / `ru` / `templates/13_message_chat_saved/ru` / subject: Ваш чат с экспертом сохранён
- 14 `support_safety_notice` / `en` / `templates/14_support_safety_notice/en` / subject: Important support information
- 14 `support_safety_notice` / `ru` / `templates/14_support_safety_notice/ru` / subject: Важная информация о поддержке
- 15 `user_age_restricted` / `en` / `templates/15_user_age_restricted/en` / subject: Access to the service is restricted
- 15 `user_age_restricted` / `ru` / `templates/15_user_age_restricted/ru` / subject: Доступ к сервису ограничен
- 16 `balance_topup_success` / `en` / `templates/16_balance_topup_success/en` / subject: Your {{siteName}} balance has been topped up
- 16 `balance_topup_success` / `ru` / `templates/16_balance_topup_success/ru` / subject: Ваш баланс {{siteName}} пополнен
- 17 `service_purchase_success` / `en` / `templates/17_service_purchase_success/en` / subject: Your {{serviceName}} purchase is confirmed
- 17 `service_purchase_success` / `ru` / `templates/17_service_purchase_success/ru` / subject: Покупка {{serviceName}} подтверждена
