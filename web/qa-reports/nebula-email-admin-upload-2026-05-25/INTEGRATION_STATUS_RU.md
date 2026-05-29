# Статус подготовки к интеграции

Дата обновления: 2026-05-28

## Факт

Админка повторно проверена через Manhattan в авторизованной read-only сессии:

- `/ru/admin/email-template/update?id=1` открывается как `Edit template - User registration (Hasn't logged in for 1 day)`.
- `/ru/admin/email-template/update?id=4` открывается как `Edit template - Email confirmation (No conditions)`.
- `/ru/admin/email-template/index` открывается как `Email Templates`.
- В индексе сейчас 11 шаблонов.
- В dropdown `event_name` сейчас 25 событий.
- В dropdown `condition_id` сейчас 10 условий.

Свежая live-сверка вынесена отдельно: `LIVE_CUSTOM_SITE_RECONCILIATION_RU.md`.
Рабочая веб-панель сценариев вынесена отдельно: `SCENARIOS_IMPLEMENTATION_PANEL_RU.html`.
Flow-панель пересечений и отмен вынесена отдельно: `EMAIL_FLOW_CHAINS_PANEL_RU.html`.

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

Первый импорт не должен начинаться с `id=1`: базовый `user_registration` соответствует live-записи `id=3` (`user.register`, `No conditions`). `id=1` и `id=2` - это отложенные registration follow-up с условиями `1 day` и `3 days`.

Retention-ветка разведена по времени, чтобы письма не приходили одновременно: `review_request` через 24 часа, `d2_chat_reflection` через 48 часов, `same_advisor_followup_offer` через 72 часа.

## Оставшийся риск

Не все сценарии уже имеют backend event в текущем списке `event_name`. В `ADMIN_UPLOAD_INDEX_RU_EN.csv`, `ADMIN_UPLOAD_INDEX_RU.csv` и `admin-meta.json` поле `needs_new_backend_event=true` отмечает такие сценарии.
