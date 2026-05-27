# Admin upload-ready комплект для Confideline email-template

Этот пакет подготовлен после live-проверки `https://confideline.com/ru/admin/email-template/update?id=1` через Manhattan.

## Реальные поля формы

- `EmailTemplate[type_id]`
- `EmailTemplate[is_active]`
- `EmailTemplate[count_user_settings]`
- `EmailTemplate[event_name]`
- `EmailTemplate[condition_id]`
- `EmailTemplate[delay]`
- `EmailTemplate[subject_email]`
- `EmailTemplate[body_email_html]`
- `EmailTemplate[generateBodyTxt]`
- `EmailTemplate[body_email_txt]`
- `EmailTemplate[comment_about]`

## Как загружать один шаблон

Если внедрение делает программист вместе с Codex, сначала использовать `BILINGUAL_UPLOAD_GUIDE_RU.md`, `CODEX_PROGRAMMER_HANDOFF_RU.md`, `ADMIN_UPLOAD_INDEX_RU_EN.json`, `VARIABLES_CONTRACT_RU.html`, `EMAIL_NOTIFICATION_LOGIC_RU.md`, `TEMPLATE_SETTINGS_SCENARIOS_RU.html` и `TEMPLATES_PREVIEW_RU_EN.html`: там описан порядок чтения файлов, контракт импорта, проверки backend events, переменные, логика `event_name` / `condition_id` / `delay`, сценарии настроек, визуальный просмотр писем и готовый prompt для Codex.

Важное правило внедрения: базовый импорт идет через тексты в текущую админку; сначала вносится английский текст из `templates/*/en/`, затем русский перевод из `templates/*/ru/`. Новые переменные нельзя придумывать в шаблонах: если переменной нет в доступном списке конкретного template/event, это отдельная backend-задача. Все неподтвержденные переменные вынесены отдельным списком в `VARIABLES_CONTRACT_RU.md`.

1. Открыть существующий шаблон или создать через `Create from existing`.
2. Взять строку из `ADMIN_UPLOAD_INDEX_RU_EN.csv` для нужного языка.
3. Установить `type_id`, `event_name`, `condition_id`, `delay`, `is_active`, `count_user_settings`.
4. Вставить `subject_email.txt` в `Subject Email`.
5. Вставить `body_email_html.html` в `Body Email(html)`.
6. Вставить `body_email_txt.txt` в text-body; `Generate Body Text from Html Body when save` лучше оставить выключенным, чтобы не потерять ручной fallback.
7. Вставить `comment_about.txt` в `Comment About`.
8. Отправить тестовое письмо через форму `send-test-email`.

## Важное отличие от концепт-макетов

Текущая админка хранит body fragment, а не полный HTML-документ. Поэтому в этом пакете нет `<!doctype>`, `<html>`, `<head>` и `<body>` внутри `body_email_html.html`.

## Переменные

Текущая админка использует Handlebars-подобный синтаксис `{{siteName}}`, `{{userName}}`, `{{confirmUrl}}`.
Все новые шаблоны переведены в этот синтаксис. В `admin-meta.json` у каждого шаблона есть:

- `handlebars_variables_used` - что реально стоит в subject/html/text;
- `required_backend_variables` - какие данные должен дать сервер;
- `needs_new_backend_event` - нужен ли новый backend event, которого сейчас нет в списке админки.

## Что сейчас уже есть в live-админке

В live-индексе найдено 11 шаблонов. Текущие events в форме включают `user.email_confirmation`, `message.received`, `payment.success`, `payment.error`, `payment.refund`, `support.message.received`, `review.left` и другие legacy-события.

Часть сценариев можно посадить на существующие события, но часть требует новых backend events. Это отмечено в индексе.
