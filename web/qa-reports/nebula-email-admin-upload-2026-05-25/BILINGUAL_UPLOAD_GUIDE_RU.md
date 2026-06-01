# Двуязычный комплект шаблонов RU / EN

Назначение: передать программисту готовые английские и русские версии каждого email-шаблона для загрузки в админку Confideline.

Основной язык внедрения: **English**. Русский язык остается вторым языком локализации и нужен для удобного просмотра/согласования смысла.

## Принцип внедрения

- Для каждого сценария есть две языковые папки: n/ и u/.
- EN используется как основная версия для первичной загрузки и тестирования, RU как русская локализация того же сценария.
- Внедряемая структура единая: файлы лежат только внутри 	emplates/NN_template_code/en/ и 	emplates/NN_template_code/ru/; корневых дублей внутри папки сценария нет.
- vent_name, condition_id, delay, 	ype_id, count_user_settings одинаковые для обеих языковых версий одного сценария.
- Переменные одинаковые по контракту {{...}}; бренд всегда передается через {{siteName}}.
- В письмах нет текста консультации, ответа эксперта, фрагментов переписки или raw-аудита.
- Для события message.received используется только сценарий dvisor_chat_reply_ready: в MVP email-сообщение означает ответ эксперта клиенту.

## Файлы на шаблон

- subject_email.txt - тема письма.
- preheader_note.txt - прехедер для контроля первого экрана inbox.
- ody_email_html.html - HTML для поля Body Email HTML.
- ody_email_txt.txt - plain text fallback.
- comment_about.txt - служебный комментарий без внутренних данных.
- dmin-meta.json - поля загрузки и переменные.

## Индексы

- ADMIN_UPLOAD_INDEX_RU_EN.csv - 38 строк: 19 сценариев x 2 языка (19 EN + 19 RU).
- ADMIN_UPLOAD_INDEX_RU_EN.json - тот же индекс для Codex/скриптов.
- Старый ADMIN_UPLOAD_INDEX_RU.csv оставлен для совместимости с RU-only загрузкой.

## Настройка в админке

Если в админке есть языковые вкладки/переводы, для одного шаблона используйте одинаковые trigger-настройки и разные языковые поля. Если языковой модели нет, создавайте отдельные записи по языку с тем же vent_name и фильтром аудитории/локали на стороне backend.

## Список шаблонов
- 00 `user_registration` / `en` / `templates/00_user_registration/en` / subject: Welcome to {{siteName}}
- 00 `user_registration` / `ru` / `templates/00_user_registration/ru` / subject: Добро пожаловать в {{siteName}}
- 01 `email_confirmation` / `en` / `templates/01_email_confirmation/en` / subject: Confirm your email for {{siteName}}
- 01 `email_confirmation` / `ru` / `templates/01_email_confirmation/ru` / subject: Подтвердите email для {{siteName}}
- 02 `password_reset` / `en` / `templates/02_password_reset/en` / subject: Reset your {{siteName}} password
- 02 `password_reset` / `ru` / `templates/02_password_reset/ru` / subject: Сброс пароля для {{siteName}}
- 03 `security_change_alert` / `en` / `templates/03_security_change_alert/en` / subject: Security change in your {{siteName}} account
- 03 `security_change_alert` / `ru` / `templates/03_security_change_alert/ru` / subject: Изменение безопасности в аккаунте {{siteName}}
- 04 `payment_success_receipt` / `en` / `templates/04_payment_success_receipt/en` / subject: Payment confirmed: your {{siteName}} chat consultation is ready
- 04 `payment_success_receipt` / `ru` / `templates/04_payment_success_receipt/ru` / subject: Оплата подтверждена: чат-консультация {{siteName}} готова
- 05 `payment_failed` / `en` / `templates/05_payment_failed/en` / subject: Your payment did not go through
- 05 `payment_failed` / `ru` / `templates/05_payment_failed/ru` / subject: Оплата не прошла
- 06 `payment_started` / `en` / `templates/06_payment_started/en` / subject: You can finish paying for your chat consultation
- 06 `payment_started` / `ru` / `templates/06_payment_started/ru` / subject: Вы можете завершить оплату чат-консультации
- 07 `paid_chat_no_message_reminder` / `en` / `templates/07_paid_chat_no_message_reminder/en` / subject: Your advisor chat is ready - send your first message
- 07 `paid_chat_no_message_reminder` / `ru` / `templates/07_paid_chat_no_message_reminder/ru` / subject: Чат с экспертом доступен - осталось написать сообщение
- 08 `chat_sla_delay` / `en` / `templates/08_chat_sla_delay/en` / subject: Chat status: the reply is delayed
- 08 `chat_sla_delay` / `ru` / `templates/08_chat_sla_delay/ru` / subject: Статус чата: ответ задерживается
- 09 `advisor_chat_reply_ready` / `en` / `templates/09_advisor_chat_reply_ready/en` / subject: Your advisor replied in chat
- 09 `advisor_chat_reply_ready` / `ru` / `templates/09_advisor_chat_reply_ready/ru` / subject: Эксперт ответил в чате
- 10 `support_ticket_opened` / `en` / `templates/10_support_ticket_opened/en` / subject: Your support request was created
- 10 `support_ticket_opened` / `ru` / `templates/10_support_ticket_opened/ru` / subject: Обращение в поддержку создано
- 11 `support_reply` / `en` / `templates/11_support_reply/en` / subject: Support replied to case #{{supportCaseId}}
- 11 `support_reply` / `ru` / `templates/11_support_reply/ru` / subject: Поддержка ответила по обращению #{{supportCaseId}}
- 12 `refund_confirmed` / `en` / `templates/12_refund_confirmed/en` / subject: Refund for order #{{orderId}} is confirmed
- 12 `refund_confirmed` / `ru` / `templates/12_refund_confirmed/ru` / subject: Возврат по заказу #{{orderId}} подтверждён
- 13 `refund_case_update` / `en` / `templates/13_refund_case_update/en` / subject: Refund status updated
- 13 `refund_case_update` / `ru` / `templates/13_refund_case_update/ru` / subject: Статус возврата обновлён
- 14 `same_advisor_followup_offer` / `en` / `templates/14_same_advisor_followup_offer/en` / subject: You can continue the chat with {{advisorName}}
- 14 `same_advisor_followup_offer` / `ru` / `templates/14_same_advisor_followup_offer/ru` / subject: Можно продолжить чат с {{advisorName}}
- 15 `review_request` / `en` / `templates/15_review_request/en` / subject: Rate your chat consultation experience
- 15 `review_request` / `ru` / `templates/15_review_request/ru` / subject: Оцените опыт консультации в чате
- 16 `d2_chat_reflection` / `en` / `templates/16_d2_chat_reflection/en` / subject: Your advisor chat has been saved
- 16 `d2_chat_reflection` / `ru` / `templates/16_d2_chat_reflection/ru` / subject: Ваш чат с экспертом сохранён
- 17 `safety_notice` / `en` / `templates/17_safety_notice/en` / subject: Important support information
- 17 `safety_notice` / `ru` / `templates/17_safety_notice/ru` / subject: Важная информация о поддержке
- 18 `minor_or_age_restriction_notice` / `en` / `templates/18_minor_or_age_restriction_notice/en` / subject: Access to the service is restricted
- 18 `minor_or_age_restriction_notice` / `ru` / `templates/18_minor_or_age_restriction_notice/ru` / subject: Доступ к сервису ограничен
