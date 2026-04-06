# Confideline Admin Translator Visual Preview

## Назначение
- Быстрый локальный визуальный стенд для показа программисту двух готовых макетов.
- Не требует поднятой БД и рабочего Yii2-контура.
- Содержит два отдельных preview-экрана:
  - `./chat-translator-preview.html`
  - `./translator-settings-preview.html`
- Оба экрана теперь собраны на существующем стеке админки:
  - `Bootstrap 3`
  - `AdminLTE`
  - `admin-chat/dist/css/admin-agent-chat.css` для страницы чата

## Запуск
1. Запустить:
   - `H:\GPT-Codex\Confideline\Chat\start-admin-chat-preview.ps1`
2. Открыть:
   - `http://127.0.0.1:8091/admin-chat-preview-local/`

## Что это дает
- Можно показывать чат эксперта уже с кнопкой `Сделать перевод`.
- Можно отдельно показывать страницу `Translator settings` с API key, fallback и размещением в меню.
- Можно обсуждать доработки без ожидания полноценного backend-подъема.

## Где потом внедрять в Yii2
- `H:\GPT-Codex\Confideline\Chat\youdate-2.0.2-yii2\Source\youdate_extracted\application\modules\admin`
- Каноническая Yii2-страница настроек уже реализована здесь:
  - `H:\GPT-Codex\Confideline\Chat\youdate-2.0.2-yii2\Source\youdate_extracted\application\modules\admin\views\settings\translator.php`

## Ограничение
- Это именно visual preview.
- Реальные данные, авторизация, БД и полноценные endpoints сюда не подключены.
