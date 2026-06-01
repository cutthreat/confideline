# Единый стандарт файлов для внедрения

Дата обновления: 2026-06-01

## Решение

Используем один стандарт: один сценарий письма = одна папка `templates/NN_template_code/`, внутри только две языковые папки `en/` и `ru/`.

Корневые файлы внутри `templates/NN_template_code/` не используются для внедрения и удалены из пакета, чтобы не было ощущения старой структуры.

## Структура одного шаблона

```text
templates/NN_template_code/
  en/
    subject_email.txt
    preheader_note.txt
    body_email_html.html
    body_email_txt.txt
    comment_about.txt
    admin-meta.json
  ru/
    subject_email.txt
    preheader_note.txt
    body_email_html.html
    body_email_txt.txt
    comment_about.txt
    admin-meta.json
```

`template_code` - наше понятное имя сценария и папки. `event_name` - технический ключ backend/админки. Старые системные события вроде `user.register` или `payment.success` не переименовываем в файлах: они остаются только в настройках шаблона, потому что на них завязан текущий backend.

## Как импортировать

1. Открыть строку в `ADMIN_UPLOAD_INDEX_RU_EN.csv`.
2. Перейти в папку из колонки `folder`.
3. Взять одинаковые файлы из `en/` и `ru/`.
4. Настройки `event_name`, `condition_id`, `delay`, `type_id`, `count_user_settings` брать из `admin-meta.json` или индекса.
5. Если в строке `needs_new_backend_event=True`, сначала реализовать backend event/payload/queue-binding, потом импортировать письмо.

## Проверка

- В пакете 20 сценариев.
- В пакете 40 языковых комплектов: 20 EN + 20 RU.
- В каждом языковом комплекте одинаковые имена файлов.
- Корневых дублей `subject_email.txt`, `body_email_html.html`, `admin-meta.json` в папках шаблонов нет.
