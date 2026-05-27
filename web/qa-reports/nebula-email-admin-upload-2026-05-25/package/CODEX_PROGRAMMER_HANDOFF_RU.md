# Handoff для программиста и Codex

Этот файл нужен для внедрения пакета в связке `программист + Codex`: программист контролирует архитектурные решения и доступы, Codex выполняет рутинную сверку, подготовку кода, импорт и тесты.

## Цель

Внедрить русские и английские email-шаблоны для сценариев онлайн-консультации через чат в текущую систему `EmailTemplate` без ручного переписывания каждого письма и без потери совместимости с существующей админкой.

## Что Codex должен прочитать первым

1. `BILINGUAL_UPLOAD_GUIDE_RU.md` - структура RU/EN папок и порядок внедрения языков.
2. `ADMIN_UPLOAD_INDEX_RU_EN.json` - машинная карта всех шаблонов в двух языках.
3. `VARIABLES_CONTRACT_RU.md` - отдельный список новых/неподтвержденных переменных.
4. `ADMIN_UPLOAD_INDEX_RU.json` - RU-only карта, оставлена для совместимости.
5. `EMAIL_NOTIFICATION_LOGIC_RU.md` - логика `event_name`, `condition_id`, `delay` и риски dropdown-only проверки.
6. `TEMPLATE_SETTINGS_SCENARIOS_RU.html` - когда, зачем и с какими настройками использовать каждый шаблон.
7. `TEMPLATES_PREVIEW_RU_EN.html` - визуальный просмотр всех 19 писем в RU/EN.
8. `TEMPLATES_PREVIEW_RU.html` - RU-only просмотр для совместимости.
9. `ADMIN_UPLOAD_GUIDE_RU.md` - реальные поля формы сайта.
10. `INTEGRATION_STATUS_RU.md` - проверенные факты live-админки и оставшиеся риски.
11. `templates/*/en/admin-meta.json` и `templates/*/ru/admin-meta.json` - переменные, event, condition, delay и язык.
12. `templates/*/{en,ru}/subject_email.txt`, `body_email_html.html`, `body_email_txt.txt`, `comment_about.txt` - значения для записи в модель.

## Правильный сценарий работы

1. Программист дает Codex доступ к актуальному репозиторию сайта и локальному окружению.
2. Codex находит актуальный production-код `EmailTemplate`, модель, миграции, seed/import-механизм и текущие обработчики email-событий. Базовый `youdate_extracted` не считать достаточным доказательством, потому что в нем live-слой `EmailTemplate` не найден.
3. Codex проверяет доступные переменные каждого текущего template/event по `VARIABLES_CONTRACT_RU.md`. Новые переменные не добавлять в текст самовольно; если они нужны, оформить отдельное изменение backend-кода.
4. Codex сравнивает `ADMIN_UPLOAD_INDEX_RU_EN.json` с реальными `event_name`, `condition_id`, переменными, языковой моделью и queue-binding в коде/БД.
5. Шаблоны с `needs_new_backend_event=false` можно импортировать первыми только после подтверждения, что backend реально вызывает соответствующий `event_name` и ставит письмо в очередь. Наличие значения в dropdown не равно готовому trigger.
6. Шаблоны с `needs_new_backend_event=true` нельзя просто добавить в админку как красивые письма: сначала нужно реализовать или подтвердить backend-trigger и queue.
7. Импорт учитывать как EN-first процесс: сначала английский текст из `templates/*/en/`, затем русский перевод из `templates/*/ru/`.
8. После импорта Codex запускает тестовую отправку или локальный render каждого шаблона с тестовыми переменными.
9. Программист проверяет спорные продуктовые решения: тексты refund/support/safety, delays и условия повторных писем.

## Контракт данных для импорта

Каждая папка `templates/NN_key/` соответствует одному сценарию. Внутри есть две языковые версии: `en/` и `ru/`.

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
- Все переменные из `required_backend_variables` реально доступны для конкретного template/event и передаются в рендер.
- Если нужна новая переменная, сначала изменить backend contract, затем обновлять шаблон.
- Событие реально попадает в queue/очередь отправки; шаблон не просто существует в админке.
- `{{siteName}}` остается переменной, не заменяется на рабочее название проекта в коде.
- HTML не проходит через sanitizer, который ломает inline styles или Handlebars-блоки.
- TXT-версия сохраняется отдельно, а не генерируется автоматически из HTML при сохранении.

## Done criteria

Интеграция считается завершенной, когда:

- все строки из `ADMIN_UPLOAD_INDEX_RU_EN.json` либо импортированы, либо явно помечены как blocked by missing backend event/language model;
- для каждого импортированного языка сохранены subject/html/txt/comment;
- тестовый render проходит без `undefined`, пустых CTA URL и сломанных Handlebars-блоков;
- отправлено минимум одно тестовое письмо по каждому P0-сценарию: email confirmation, payment success, chat message received, advisor reply ready, support reply;
- программист видит список новых backend events, если они нужны.

## Готовый prompt для Codex

```text
Ты работаешь в репозитории Confideline. Нужно внедрить текущий пакет email-шаблонов из переданного ZIP/папки.

Сначала прочитай BILINGUAL_UPLOAD_GUIDE_RU.md, CODEX_PROGRAMMER_HANDOFF_RU.md, VARIABLES_CONTRACT_RU.md, EMAIL_NOTIFICATION_LOGIC_RU.md, TEMPLATE_SETTINGS_SCENARIOS_RU.md, ADMIN_UPLOAD_INDEX_RU_EN.json, ADMIN_UPLOAD_GUIDE_RU.md и INTEGRATION_STATUS_RU.md.

Задача:
1. Найди актуальную модель/таблицу EmailTemplate, текущие event_name, condition_id, delay и механизм отправки email.
2. Сопоставь каждый шаблон и язык из ADMIN_UPLOAD_INDEX_RU_EN.json с текущей системой. Не считай dropdown event доказательством backend-trigger.
3. Проверь доступные переменные текущего template/event по VARIABLES_CONTRACT_RU.md. Новые переменные не придумывай; если переменной нет, вынеси это в backend change request.
4. Проверь, какие события уже добавляются в queue и выполняются, а какие template events не задействованы в очередях.
5. Для шаблонов без новых backend events подготовь импорт/seed/migration или admin-safe update.
6. Для шаблонов с needs_new_backend_event=true не имитируй готовность: составь список недостающих trigger/event/queue-binding и точек кода, где их нужно реализовать.
7. Проверь render HTML/TXT для EN и RU с тестовыми переменными и зафиксируй результат.
8. Не подставляй рабочее название проекта вместо бренда: используй {{siteName}}.
9. Не оборачивай body_email_html.html в полный HTML-документ.

На выходе дай: измененные файлы, команды проверки, список импортированных шаблонов, список заблокированных backend events, риски.
```

## Стоп-условия для Codex

Codex должен остановиться и запросить решение программиста, если:

- в коде нет события, указанного в шаблоне, и непонятно, где его правильно создать;
- переменная письма относится к платежам, refund или support, но нет надежного источника данных;
- текущий sanitizer/редактор админки меняет Handlebars-синтаксис;
- тестовая отправка требует реальной отправки клиенту, а не тестового адреса.
