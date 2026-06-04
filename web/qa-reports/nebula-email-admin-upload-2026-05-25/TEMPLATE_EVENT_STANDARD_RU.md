# Стандарт имен email-событий

Правило: `Event title` -> `CONST_NAME` -> `event.name` -> `template_key` -> `templates/NN_template_key`.

| # | Event title | Const | event_name | template_key | folder | status |
|---|---|---|---|---|---|---|
| 0 | User registration | `USER_REGISTER` | `user.register` | `user_registration` | `templates/00_user_registration` | existing_backend_event |
| 1 | Email confirmation | `USER_EMAIL_CONFIRMATION` | `user.email_confirmation` | `email_confirmation` | `templates/01_email_confirmation` | existing_backend_event |
| 2 | User password recovery | `USER_PASSWORD_RECOVERY` | `user.password_recovery` | `user_password_recovery` | `templates/02_user_password_recovery` | backend_first |
| 3 | Security change | `SECURITY_CHANGE` | `security.security_change` | `security_change` | `templates/03_security_change` | backend_first |
| 4 | No first chat message | `MESSAGE_NO_FIRST_CHAT_MESSAGE` | `message.no_first_chat_message` | `message_no_first_chat_message` | `templates/04_message_no_first_chat_message` | backend_first |
| 5 | Advisor answer delayed | `MESSAGE_ANSWER_DELAYED` | `message.answer_delayed` | `message_answer_delayed` | `templates/05_message_answer_delayed` | backend_first |
| 6 | New message received | `MESSAGE_RECEIVED` | `message.received` | `message_received` | `templates/06_message_received` | existing_backend_event |
| 7 | Support ticket opened | `SUPPORT_TICKET_OPENED` | `support.ticket.opened` | `support_ticket_opened` | `templates/07_support_ticket_opened` | backend_first |
| 8 | Support message received | `SUPPORT_MESSAGE_RECEIVED` | `support.message.received` | `support_message_received` | `templates/08_support_message_received` | existing_backend_event |
| 9 | Payment refund | `PAYMENT_REFUND` | `payment.refund` | `payment_refund` | `templates/09_payment_refund` | existing_backend_event |
| 10 | Payment refund update | `PAYMENT_REFUND_UPDATE` | `payment.refund.update` | `payment_refund_update` | `templates/10_payment_refund_update` | backend_first |
| 11 | Advisor follow-up offer | `ADVISOR_FOLLOWUP_OFFER` | `advisor.followup.offer` | `advisor_followup_offer` | `templates/11_advisor_followup_offer` | backend_first |
| 12 | Review request | `REVIEW_REQUEST` | `review.request` | `review_request` | `templates/12_review_request` | backend_first |
| 13 | Chat saved | `MESSAGE_CHAT_SAVED` | `message.chat_saved` | `message_chat_saved` | `templates/13_message_chat_saved` | backend_first |
| 14 | Support safety notice | `SUPPORT_SAFETY_NOTICE` | `support.safety_notice` | `support_safety_notice` | `templates/14_support_safety_notice` | backend_first |
| 15 | User age restricted | `USER_AGE_RESTRICTED` | `user.age_restricted` | `user_age_restricted` | `templates/15_user_age_restricted` | backend_first |
| 16 | Balance top-up successful | `BALANCE_TOPUP_SUCCESS` | `balance.topup.success` | `balance_topup_success` | `templates/16_balance_topup_success` | backend_first |
| 17 | Service purchase successful | `SERVICE_PURCHASE_SUCCESS` | `service.purchase.success` | `service_purchase_success` | `templates/17_service_purchase_success` | backend_first |

Текущая платежная модель использует `balance_topup_success` и `service_purchase_success`.
