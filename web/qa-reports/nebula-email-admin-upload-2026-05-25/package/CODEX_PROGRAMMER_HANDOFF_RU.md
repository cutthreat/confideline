# Handoff для программиста и Codex

Этот файл нужен для внедрения пакета в связке `программист + Codex`: программист контролирует архитектурные решения и доступы, Codex выполняет рутинную сверку, подготовку кода, импорт и тесты.

## Цель

Внедрить русские email-шаблоны для сценариев онлайн-консультации через чат в текущую систему `EmailTemplate` без ручного переписывания каждого письма и без потери совместимости с существующей админкой.

## Что Codex должен прочитать первым

1. `ADMIN_UPLOAD_INDEX_RU.json` - машинная карта всех шаблонов.
2. `EMAIL_NOTIFICATION_LOGIC_RU.md` - логика `event_name`, `condition_id`, `delay` и риски dropdown-only проверки.
3. `ADMIN_UPLOAD_GUIDE_RU.md` - реальные поля формы сайта.
4. `INTEGRATION_STATUS_RU.md` - проверенные факты live-админки и оставшиеся риски.
5. `templates/*/admin-meta.json` - переменные, event, condition, delay и флаг `needs_new_backend_event`.
6. `templates/*/subject_email.txt`, `body_email_html.html`, `body_email_txt.txt`, `comment_about.txt` - значения для записи в модель.

## Правильный сценарий работы

1. Программист дает Codex доступ к актуальному репозиторию сайта и локальному окружению.
2. Codex находит актуальный production-код `EmailTemplate`, модель, миграции, seed/import-механизм и текущие обработчики email-событий. Базовый `youdate_extracted` не считать достаточным доказательством, потому что в нем live-слой `EmailTemplate` не найден.
3. Codex сравнивает `ADMIN_UPLOAD_INDEX_RU.json` с реальными `event_name` и `condition_id` в коде/БД.
4. Шаблоны с `needs_new_backend_event=false` можно импортировать первыми только после подтверждения, что backend реально вызывает соответствующий `event_name`. Наличие значения в dropdown не равно готовому trigger.
5. Шаблоны с `needs_new_backend_event=true` нельзя просто добавить в админку как красивые письма: сначала нужно реализовать или подтвердить backend-trigger.
6. После импорта Codex запускает тестовую отправку или локальный render каждого шаблона с тестовыми переменными.
7. Программист проверяет спорные продуктовые решения: тексты refund/support/safety, delays и условия повторных писем.

## Контракт данных для импорта

Каждая папка `templates/NN_key/` соответствует одному шаблону:

- `subject_email.txt` -> поле `subject_email`
- `body_email_html.html` -> поле `body_email_html`
- `body_email_txt.txt` -> поле `body_email_txt`
- `comment_about.txt` -> поле `comment_about`
- `admin-meta.json` -> настройки и проверочный контракт

`body_email_html.html` является HTML-фрагментом для текущей системы. Не оборачивать его в `doctype`, `html`, `head` или `body` при записи в `EmailTemplate`.

## Что обязательно проверить перед записью в БД

- `type_id` существует и соответствует ожидаемой категории письма.
- `event_name` существует в коде или будет добавлен отдельной задачей.
- `condition_id` существует или корректно заменен на `0`.
- `delay` не создает лишних повторных писем.
- Все переменные из `required_backend_variables` реально передаются в рендер.
- `{{siteName}}` остается переменной, не заменяется на Nebula в коде.
- HTML не проходит через sanitizer, который ломает inline styles или Handlebars-блоки.
- TXT-версия сохраняется отдельно, а не генерируется автоматически из HTML при сохранении.

## Done criteria

Интеграция считается завершенной, когда:

- все шаблоны из `ADMIN_UPLOAD_INDEX_RU.json` либо импортированы, либо явно помечены как blocked by missing backend event;
- для каждого импортированного шаблона сохранены subject/html/txt/comment;
- тестовый render проходит без `undefined`, пустых CTA URL и сломанных Handlebars-блоков;
- отправлено минимум одно тестовое письмо по каждому P0-сценарию: email confirmation, payment success, chat message received, advisor reply ready, support reply;
- программист видит список новых backend events, если они нужны.

## Готовый prompt для Codex

```text
Ты работаешь в репозитории Confideline. Нужно внедрить пакет email-шаблонов из nebula-admin-upload-ready-ru-2026-05-25.

Сначала прочитай CODEX_PROGRAMMER_HANDOFF_RU.md, EMAIL_NOTIFICATION_LOGIC_RU.md, ADMIN_UPLOAD_INDEX_RU.json, ADMIN_UPLOAD_GUIDE_RU.md и INTEGRATION_STATUS_RU.md.

Задача:
1. Найди актуальную модель/таблицу EmailTemplate, текущие event_name, condition_id, delay и механизм отправки email.
2. Сопоставь каждый шаблон из ADMIN_UPLOAD_INDEX_RU.json с текущей системой. Не считай dropdown event доказательством backend-trigger.
3. Для шаблонов без новых backend events подготовь импорт/seed/migration или admin-safe update.
4. Для шаблонов с needs_new_backend_event=true не имитируй готовность: составь список недостающих trigger/event и точек кода, где их нужно реализовать.
5. Проверь render HTML/TXT с тестовыми переменными и зафиксируй результат.
6. Не меняй бренд на Nebula: используй {{siteName}}.
7. Не оборачивай body_email_html.html в полный HTML-документ.

На выходе дай: измененные файлы, команды проверки, список импортированных шаблонов, список заблокированных backend events, риски.
```

## Стоп-условия для Codex

Codex должен остановиться и запросить решение программиста, если:

- в коде нет события, указанного в шаблоне, и непонятно, где его правильно создать;
- переменная письма относится к платежам, refund или support, но нет надежного источника данных;
- текущий sanitizer/редактор админки меняет Handlebars-синтаксис;
- тестовая отправка требует реальной отправки клиенту, а не тестового адреса.
