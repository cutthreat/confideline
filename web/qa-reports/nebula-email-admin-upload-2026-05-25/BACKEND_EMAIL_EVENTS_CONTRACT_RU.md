# Фактический backend-контракт email-уведомлений

Механизм работает как комбинация vent_name + condition_id + delay. На каждую значимую комбинацию нужен отдельный EmailTemplate.

## Conditions

| ID | Constant | Label | Использование |
|---:|---|---|---|
| 0 | NONE | No conditions | Мгновенное/обычное событие без дополнительной сегментации. |
| 1 | NOT_LOGGED_1_DAY | Hasn't logged in for 1 day | Follow-up после user.register, если пользователь не вошел 1 день. |
| 2 | NOT_LOGGED_3_DAYS | Hasn't logged in for 3 days | Follow-up после user.register, если пользователь не вошел 3 дня. |
| 3 | NOT_LOGGED_7_DAYS | Hasn't logged in for 7 days | Follow-up после user.register, если пользователь не вошел 7 дней. |
| 4 | NO_PHOTOS | No photos | Legacy profile/photo сценарий; не нужен для текущей онлайн чат-консультации. |
| 5 | NO_MESSAGES | No messages | Можно применить для no-first-message reminder, но нужно проверить, что условие смотрит именно чат-консультацию, а не legacy personal messages. |
| 6 | PROFILE_LESS_30 | Profile is less than 30% complete | Legacy profile scenario. |
| 7 | NOT_PREMIUM | Not premium | Legacy premium scenario. |
| 8 | PREMIUM_ACTIVE | Premium active | Legacy premium scenario. |
| 9 | PREMIUM_EXPIRES_24H | Premium expires in the next 24 hours | Legacy premium scenario. |

## Совместимость шаблонов

| Шаблон | event_name | condition_id | delay | Статус | Недостающие переменные | Рекомендация |
|---|---|---:|---:|---|---|---|
| user_registration | user.register | 0 | 0 | compatible |  | Можно загружать по текущему event после проверки trigger/queue. |
| email_confirmation | user.email_confirmation | 0 | 0 | compatible |  | Можно загружать по текущему event после проверки trigger/queue. |
| support_ticket_opened | support.ticket.opened | 0 | 0 | event_missing | legalMerchantName, privacyUrl, refundPolicyUrl, siteName, siteUrl, supportCaseId, supportCaseUrl, supportEmail, termsUrl, userName | Такого event_name нет в текущем списке; нельзя загружать как готовый шаблон без backend-доработки. |
| support_message_received | support.message.received | 0 | 0 | needs_event_or_payload | legalMerchantName, privacyUrl, refundPolicyUrl, siteUrl, supportCaseId, supportCaseStatus, supportCaseUrl, supportEmail, supportUpdatedAt, termsUrl | Event есть, но payload слишком бедный для предложенного письма; нужен расширенный context или отдельный event. |
| payment_refund | payment.refund | 0 | 0 | needs_event_or_payload | currency, legalMerchantName, orderId, privacyUrl, processorRefundId, refundAmount, refundEta, refundPolicyUrl, siteUrl, supportCaseUrl, supportEmail, termsUrl | Event есть, но payload слишком бедный для предложенного письма; нужен расширенный context или отдельный event. |
| payment_refund_update | payment.refund.update | 0 | 0 | event_missing | legalMerchantName, privacyUrl, refundPolicyUrl, siteName, siteUrl, supportCaseId, supportCaseUrl, supportUpdatedAt, termsUrl, userName | Такого event_name нет в текущем списке; нельзя загружать как готовый шаблон без backend-доработки. |
| advisor_followup_offer | advisor.followup.offer | 0 | 72 | event_missing | advisorName, chatUrl, emailPreferencesUrl, followupOfferUrl, legalMerchantName, privacyUrl, refundPolicyUrl, siteName, siteUrl, termsUrl, unsubscribeUrl, userName | Такого event_name нет в текущем списке; нельзя загружать как готовый шаблон без backend-доработки. |
| review_request | review.request | 0 | 24 | event_missing | emailPreferencesUrl, legalMerchantName, privacyUrl, refundPolicyUrl, reviewUrl, siteName, siteUrl, termsUrl, unsubscribeUrl, userName | Такого event_name нет в текущем списке; нельзя загружать как готовый шаблон без backend-доработки. |
| message_chat_saved | message.chat_saved | 0 | 48 | event_missing | chatUrl, emailPreferencesUrl, legalMerchantName, privacyUrl, refundPolicyUrl, siteName, siteUrl, termsUrl, unsubscribeUrl, userName | Такого event_name нет в текущем списке; нельзя загружать как готовый шаблон без backend-доработки. |
| support_safety_notice | support.safety_notice | 0 | 0 | event_missing | legalMerchantName, privacyUrl, refundPolicyUrl, siteName, siteUrl, supportEmail, supportUrl, termsUrl, userName | Такого event_name нет в текущем списке; нельзя загружать как готовый шаблон без backend-доработки. |
| user_age_restricted | user.age_restricted | 0 | 0 | event_missing | legalMerchantName, privacyUrl, refundPolicyUrl, siteName, siteUrl, supportEmail, supportUrl, termsUrl, userName | Такого event_name нет в текущем списке; нельзя загружать как готовый шаблон без backend-доработки. |
| user_password_recovery | user.password_recovery | 0 | 0 | event_missing | legalMerchantName, privacyUrl, refundPolicyUrl, resetExpiresAt, resetUrl, siteName, siteUrl, supportEmail, termsUrl, userName | Такого event_name нет в текущем списке; нельзя загружать как готовый шаблон без backend-доработки. |
| security_change | security.security_change | 0 | 0 | event_missing | accountSecurityUrl, legalMerchantName, privacyUrl, refundPolicyUrl, securityChangedAt, siteName, siteUrl, supportEmail, termsUrl, userName | Такого event_name нет в текущем списке; нельзя загружать как готовый шаблон без backend-доработки. |
| payment_success | payment.success | 0 | 0 | needs_event_or_payload | advisorName, chatUrl, firstResponseSla, legalMerchantName, merchantDescriptor, orderId, paidAt, privacyUrl, receiptUrl, refundPolicyUrl, siteUrl, supportEmail, termsUrl | Event есть, но payload слишком бедный для предложенного письма; нужен расширенный context или отдельный event. |
| payment_error | payment.error | 0 | 0 | needs_event_or_payload | checkoutUrl, currency, legalMerchantName, privacyUrl, refundPolicyUrl, siteUrl, supportUrl, termsUrl | Event есть, но payload слишком бедный для предложенного письма; нужен расширенный context или отдельный event. |
| payment_init | payment.init | 0 | 2 | needs_event_or_payload | checkoutUrl, emailPreferencesUrl, legalMerchantName, privacyUrl, refundPolicyUrl, siteUrl, termsUrl, unsubscribeUrl | Event есть, но payload слишком бедный для предложенного письма; нужен расширенный context или отдельный event. |
| message_no_first_chat_message | message.no_first_chat_message | 5 | 2 | event_missing | chatUrl, legalMerchantName, orderId, privacyUrl, refundPolicyUrl, siteName, siteUrl, supportUrl, termsUrl, userName | Такого event_name нет в текущем списке; нельзя загружать как готовый шаблон без backend-доработки. |
| message_answer_delayed | message.answer_delayed | 0 | 0 | event_missing | answerDueAt, chatUrl, consultationId, legalMerchantName, privacyUrl, refundPolicyUrl, siteName, siteUrl, supportCaseId, supportCaseUrl, termsUrl, updatedAnswerEta, userName | Такого event_name нет в текущем списке; нельзя загружать как готовый шаблон без backend-доработки. |
| message_received | message.received | 0 | 0 | needs_event_or_payload | advisorName, chatUrl, legalMerchantName, privacyUrl, refundPolicyUrl, siteUrl, supportEmail, supportUrl, termsUrl | Event есть, но payload слишком бедный для предложенного письма; нужен расширенный context или отдельный event. |

