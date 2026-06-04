# Сверка пакета с текущей моделью

Текущий пакет очищен от старых платежных шаблонов.

| # | key | event_name | действие |
|---|---|---|---|
| 0 | user_registration | `user.register` | можно создавать/обновлять после проверки trigger |
| 1 | email_confirmation | `user.email_confirmation` | можно создавать/обновлять после проверки trigger |
| 2 | user_password_recovery | `user.password_recovery` | backend-first, затем создать шаблон |
| 3 | security_change | `security.security_change` | backend-first, затем создать шаблон |
| 4 | message_no_first_chat_message | `message.no_first_chat_message` | backend-first, затем создать шаблон |
| 5 | message_answer_delayed | `message.answer_delayed` | backend-first, затем создать шаблон |
| 6 | message_received | `message.received` | можно создавать/обновлять после проверки trigger |
| 7 | support_ticket_opened | `support.ticket.opened` | backend-first, затем создать шаблон |
| 8 | support_message_received | `support.message.received` | можно создавать/обновлять после проверки trigger |
| 9 | payment_refund | `payment.refund` | можно создавать/обновлять после проверки trigger |
| 10 | payment_refund_update | `payment.refund.update` | backend-first, затем создать шаблон |
| 11 | advisor_followup_offer | `advisor.followup.offer` | backend-first, затем создать шаблон |
| 12 | review_request | `review.request` | backend-first, затем создать шаблон |
| 13 | message_chat_saved | `message.chat_saved` | backend-first, затем создать шаблон |
| 14 | support_safety_notice | `support.safety_notice` | backend-first, затем создать шаблон |
| 15 | user_age_restricted | `user.age_restricted` | backend-first, затем создать шаблон |
| 16 | balance_topup_success | `balance.topup.success` | backend-first, затем создать шаблон |
| 17 | service_purchase_success | `service.purchase.success` | backend-first, затем создать шаблон |
