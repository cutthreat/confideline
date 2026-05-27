# Статус подготовки к интеграции

Дата: 2026-05-25

## Факт

Админка проверена через Manhattan в авторизованной сессии:

- `/ru/admin/email-template/update?id=1` открывается как `Edit template - User registration (Hasn't logged in for 1 day)`.
- `/ru/admin/email-template/index` открывается как `Email Templates`.
- В индексе сейчас 11 шаблонов.

## Реальный формат сайта

Сайт хранит email-шаблон как набор полей модели `EmailTemplate`, а не как standalone HTML-файл:

- `type_id`
- `is_active`
- `count_user_settings`
- `event_name`
- `condition_id`
- `delay`
- `subject_email`
- `body_email_html`
- `generateBodyTxt`
- `body_email_txt`
- `comment_about`

`body_email_html` - это HTML-фрагмент для вставки в текущую mail-систему. Поэтому этот admin-ready пакет отличается от концепт-макетов: в `body_email_html.html` нет `doctype/html/head/body`.

## Переменные

Live-шаблон id=1 использует Handlebars-подобный синтаксис:

- `{{siteName}}`
- `{{userName}}`
- `{{confirmUrl}}`
- `{{#if showPassword}}...{{/if}}`

Все шаблоны в этом пакете переведены в такой синтаксис. Брендовая переменная заменена на `{{siteName}}`. Для каждого сценария подготовлены две языковые версии: `templates/*/en/` и `templates/*/ru/`.

## Интеграционный вывод

Для легкой загрузки программисту нужен текущий admin upload-ready пакет, а не старый концепт-пакет.

Он уже разложен по реальным полям формы и содержит live-аудит текущей админки.

## Оставшийся риск

Не все сценарии уже имеют backend event в текущем списке `event_name`. В `ADMIN_UPLOAD_INDEX_RU_EN.csv`, `ADMIN_UPLOAD_INDEX_RU.csv` и `admin-meta.json` поле `needs_new_backend_event=true` отмечает такие сценарии.
