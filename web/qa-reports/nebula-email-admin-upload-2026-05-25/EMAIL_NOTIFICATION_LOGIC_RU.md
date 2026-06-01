# Логика почтовых уведомлений Confideline

Дата разбора: 2026-05-27

## Что подтверждено по странице шаблона

Страница `https://confideline.com/ru/admin/email-template/update?id=1` была прочитана через рабочий браузер. В публичный пакет сырые данные формы не включаются.

Подтвержденные поля модели `EmailTemplate`:

- `type_id` - тип письма: сервисное, поведенческое, маркетинговое.
- `is_active` - включение шаблона.
- `count_user_settings` - признак учета пользовательских email-настроек.
- `event_name` - ключ события, к которому привязан шаблон.
- `condition_id` - дополнительное условие выбора или отправки.
- `delay` - задержка перед отправкой; по существующим шаблонам выглядит как часы, но точную единицу должен подтвердить код `EmailTemplate`.
- `subject_email` - тема письма.
- `body_email_html` - HTML-фрагмент письма, не полный HTML-документ.
- `generateBodyTxt` - автогенерация TXT из HTML при сохранении.
- `body_email_txt` - ручная TXT-версия.
- `comment_about` - внутренний комментарий.

На странице также есть отдельная форма `send-test-email`, которая отправляет тест по `email_template_id` и `event_name`.

## Как читать Event Name

`event_name` - главный ключ маршрутизации. Но наличие значения в dropdown означает только то, что админка разрешает выбрать такой ключ. Это не доказывает, что backend уже генерирует событие и передает все переменные письма.

Текущий список из live-админки:

- `user.register`
- `user.email_confirmation`
- `user.email_reconfirmation`
- `message.received`
- `like.received`
- `profile.viewed`
- `gift.received`
- `photo.access.request`
- `photo.access.decision`
- `group.access.request`
- `group.access.granted`
- `group.buy.access.request`
- `security.2fa_generated`
- `payment.init`
- `payment.success`
- `payment.error`
- `payment.refund`
- `credits.spent`
- `support.message.received`
- `group.post.published`
- `review.left`
- `premium.expires_24h`
- `premium.expired`
- `user.not_login_48h`
- `user.go.to.site`

## Как читать Condition ID

`condition_id` - не сценарий письма, а дополнительный фильтр/условие:

- `0` - No conditions
- `1` - Hasn't logged in for 1 day
- `2` - Hasn't logged in for 3 days
- `3` - Hasn't logged in for 7 days
- `4` - No photos
- `5` - No messages
- `6` - Profile is less than 30% complete
- `7` - Not premium
- `8` - Premium active
- `9` - Premium expires in the next 24 hours

Пример live-шаблона `id=1`: `event_name=user.register`, `condition_id=1`, `delay=24`. Это похоже на логику "после регистрации подождать 24 часа и отправить письмо только если пользователь не логинился 1 день".

## Что найдено в локальном коде

В локальном исходнике `Confideline/Chat/youdate-2.0.2-yii2/Source/youdate_extracted/application` найдены две старые системы отправки:

1. `components/UserMailer.php` + `components/AppMailer.php`
   - регистрация, confirmation, reconfirmation, recovery;
   - использует PHP view-файлы из `views/mail`;
   - не использует найденный live `EmailTemplate` напрямую.

2. `managers/NotificationManager.php` + `jobs/SendNotification.php`
   - in-app notifications и email-копии уведомлений;
   - проверяет пользовательские настройки через `UserSettings`;
   - отправляет через `appMailer->sendMessage(..., 'notification', ...)`;
   - не использует найденный live `EmailTemplate` напрямую.

В локальном извлеченном исходнике не найдены модель/контроллер `EmailTemplate`, поля `subject_email`, `body_email_html`, `condition_id`, `event_name` как production-код. Значит live-админка содержит кастомный слой, которого нет в базовом `youdate_extracted`, или он лежит в другом актуальном репозитории/варианте.

## Практический вывод для внедрения

Нельзя считать шаблон готовым к production только потому, что его `event_name` есть в dropdown.

Для каждого письма нужно отдельно подтвердить:

1. Есть ли такой `event_name` в live-админке.
2. Есть ли backend-trigger, который реально вызывает этот `event_name`.
3. Есть ли реализация `condition_id`.
4. Как `delay` ставится в очередь: часы, минуты или cron-window.
5. Какие переменные реально приходят в renderer.
6. Учитывается ли `count_user_settings` для конкретного типа письма.

## Статус наших 19 шаблонов

Шаблоны делятся на три группы:

### Можно грузить только после проверки существующего trigger

Эти `event_name` есть в live dropdown, но backend-вызов все равно должен быть подтвержден в актуальном коде:

- `user.email_confirmation`
- `payment.init`
- `payment.success`
- `payment.error`
- `payment.refund`
- `message.received`
- `support.message.received`
- `review.left`

### Требуют нового backend event или явной привязки

Эти события отсутствуют в live dropdown или не были подтверждены как готовые:

- `user.password_recovery`
- `security.security_change`
- `message.no_first_chat_message`
- `message.answer_delayed`
- `support.ticket.opened`
- `advisor.followup.offer`
- `message.chat_saved`
- `support.safety_notice`
- `user.age_restricted`

### Принятое правило для чата

В текущем MVP не заводим отдельное письмо на сообщение клиента. В email-логике есть только одно чат-сообщение для клиента: эксперт ответил, клиенту нужно вернуться в кабинет.

- `message_received` использует существующее `MESSAGE_RECEIVED / message.received`;
- отдельный backend event для сообщения клиента не нужен;
- `message.received` трактуем как ответ эксперта клиенту, а не как общее событие любого сообщения.

## Что должен сделать программист с Codex

1. Найти актуальный production-код `EmailTemplate`, а не только базовый `youdate_extracted`.
2. Найти таблицы/модели для `event_name`, `condition_id`, `delay`.
3. Для каждого шаблона из `ADMIN_UPLOAD_INDEX_RU.json` построить статус:
   - `ready_to_import`;
   - `needs_backend_trigger`;
   - `needs_condition_mapping`;
   - `needs_variable_mapping`;
   - `blocked`.
4. Не загружать спорные шаблоны в active state до проверки trigger + variables + test email.
5. После импорта отправить тестовые письма через форму `send-test-email` и через реальный бизнес-триггер.


