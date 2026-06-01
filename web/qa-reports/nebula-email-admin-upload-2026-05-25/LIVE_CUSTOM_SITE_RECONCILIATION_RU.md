# Live-сверка с кастомной админкой Confideline

Дата свежей проверки: 2026-05-28  
Контур: `https://confideline.com/ru/admin/email-template/*`  
Метод: авторизованная Manhattan-сессия, read-only DOM-снятие и скриншоты без сохранения форм.

## Главный вывод

На live сейчас существует 11 записей `EmailTemplate`, но выпадающий список `event_name` содержит 25 событий. Поэтому интеграция делится на три группы:

1. Обновить существующую запись шаблона.
2. Создать новую запись в текущей админке с уже существующим `event_name`.
3. Сначала добавить/подтвердить backend event и trigger, затем создавать шаблон.

Наличие события в dropdown не доказывает, что backend реально ставит письмо в очередь.

## Подтверждено на live

- В индексе показано `1-11 из 11`.
- Страница `id=1`: `user.register`, `condition_id=1`, `delay=24`.
- Страница `id=2`: `user.register`, `condition_id=2`, `delay=72`.
- Страница `id=3`: `user.register`, `condition_id=0`, delay пустой.
- Страница `id=4`: `user.email_confirmation`, `condition_id=0`, delay пустой.
- `delay` практически подтверждается как часы: условие `1 day` связано с `24`, условие `3 days` связано с `72`.
- В форме есть поля `type_id`, `is_active`, `count_user_settings`, `event_name`, `condition_id`, `delay`, `subject_email`, `body_email_html`, `generateBodyTxt`, `body_email_txt`, `comment_about`.
- Тестовая форма отправки использует `email_template_id` и `event_name`.

## Важное расхождение с пакетом

Наш сценарий `user_registration` должен загружаться в существующий live-шаблон `id=3`, а не в `id=1`.

`id=1` и `id=2` на live - это не базовое welcome-письмо, а отложенные registration follow-up по условиям:

- `id=1`: hasn't logged in for 1 day + delay 24.
- `id=2`: hasn't logged in for 3 days + delay 72.

## Сверка пакета с live

| # | Сценарий | event_name | condition | live-статус | Действие |
|---:|---|---|---:|---|---|
| 0 | user_registration | `user.register` | 0 | есть `id=3` | обновлять `id=3` |
| 1 | email_confirmation | `user.email_confirmation` | 0 | есть `id=4` | обновлять `id=4` |
| 2 | password_reset | `user.password_recovery` | 0 | нет event в dropdown | нужен backend event/trigger |
| 3 | security_change_alert | `security.security_change` | 0 | нет event в dropdown | нужен backend event/trigger |
| 4 | payment_success_receipt | `payment.success` | 0 | event есть, шаблона нет | создать новый шаблон |
| 5 | payment_failed | `payment.error` | 0 | event есть, шаблона нет | создать новый шаблон |
| 6 | payment_started | `payment.init` | 0 | event есть, шаблона нет | создать новый шаблон |
| 7 | paid_chat_no_message_reminder | `message.no_first_chat_message` | 5 | нет event в dropdown | нужен backend event/trigger |
| 8 | chat_sla_delay | `message.answer_delayed` | 0 | нет event в dropdown | нужен backend event/trigger |
| 9 | advisor_chat_reply_ready | `message.received` | 0 | event есть, шаблона нет | создать новый шаблон; в MVP это ответ эксперта клиенту |
| 10 | support_ticket_opened | `support.ticket.opened` | 0 | нет event в dropdown | нужен backend event/trigger |
| 11 | support_reply | `support.message.received` | 0 | event есть, шаблона нет | создать новый шаблон |
| 12 | refund_confirmed | `payment.refund` | 0 | event есть, шаблона нет | создать новый шаблон, проверить refund context |
| 13 | refund_case_update | `payment.refund.update` | 0 | нет event в dropdown | нужен backend event/trigger |
| 14 | same_advisor_followup_offer | `advisor.followup.offer` | 0 | нет event в dropdown | нужен backend event/trigger |
| 15 | review_request | `review.request` | 0 | нет event в dropdown | нужен backend event/trigger |
| 16 | d2_chat_reflection | `message.chat_saved` | 0 | нет event в dropdown | нужен backend event/trigger |
| 17 | safety_notice | `support.safety_notice` | 0 | нет event в dropdown | нужен backend event/trigger |
| 18 | minor_or_age_restriction_notice | `user.age_restricted` | 0 | нет event в dropdown | нужен backend event/trigger |

## Риски, которые программист должен закрыть

- `message.received` в Nebula MVP используется только для `advisor_chat_reply_ready`: других email-сообщений, кроме ответа эксперта клиенту, не заводим.
- `payment.refund` общий: для `refund_confirmed` используется финальный возврат; для промежуточных обновлений нужен отдельный `payment.refund.update`.
- Для запроса отзыва нужен `review.request`; `review.left` остается событием факта оставленного отзыва и не должен подменять request.
- Все live-шаблоны сейчас имеют `count_user_settings=true`. Для критичных сервисных писем пакета рекомендовано `count_user_settings=0`, но это нужно подтвердить по реальному backend-смыслу поля.
- Текущие live-переменные старых шаблонов в основном dating/YouDate. Новые переменные пакета нужно внедрять отдельно по `VARIABLES_CONTRACT_RU.md`.

## Артефакты проверки

Внутренние live-аудит файлы и скриншоты сохранены в рабочем контуре проекта. В клиентский пакет они не включены: для внедрения достаточно этой сводки, `BACKEND_EMAIL_EVENTS_CONTRACT_RU.html`, `EVENT_VARIABLE_COMPATIBILITY_RU.csv` и `IGOR_BACKEND_TASKS_RU.html`.
