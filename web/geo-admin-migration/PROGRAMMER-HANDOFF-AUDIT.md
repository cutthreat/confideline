# Programmer handoff audit

Дата проверки: 2026-06-23

## Статус

Верстку можно передавать программисту как готовый статический UX/UI-прототип для внедрения в текущую Yii2-админку Confideline.

Это не готовая backend-интеграция: реальные модели, маршруты, права доступа, сохранение и server-side validation должен подключить программист в текущем проекте.

## Основные файлы

- `../geo-admin-country-city-editor-proposal-v5.html` — основная статическая страница админки.
- `../custom.css` — все дополнительные стили текущего прототипа.
- `../custom.js` — вся дополнительная логика текущего прототипа.
- `../assets/` — локальные копии штатных ресурсов админки и upload-kit/fileupload.

## Что проверено

- `custom.css` и `custom.js` существуют в корне пакета.
- В HTML нет inline `<style>` и inline `<script>`.
- В HTML/CSS/JS нет внешних `http(s)` подключений.
- Все `href` и `src` в HTML ведут на существующие локальные файлы.
- Все `url(...)` внутри CSS ведут на существующие локальные файлы.
- `custom.js` проходит `node --check`.
- Старые кастомные image preview/modal классы и функции удалены.
- Все HTML `id` уникальны.
- Все локальные hash-ссылки имеют целевой элемент.
- Все `label for` указывают на существующий `id`.
- Вкладка `tab-images` визуально проверена в headless Edge на desktop и mobile.

## Результат по `tab-images`

В блоке изображений больше нет самодельной зоны загрузки. Используется штатный Yii upload-kit/fileupload слой, снятый по образцу поля Photo в `/ru/admin/news/create`.

Текущая структура:

- hidden input с классом `empty-value`;
- file input с `data-geo-upload-kit`;
- инициализация через `jQuery(input).yiiUploadKit(...)` в `custom.js`;
- CSS upload-kit подключен отдельным штатным asset-файлом;
- иконки Font Awesome и шрифты лежат локально.

Для production лучше не копировать вручную HTML `upload-kit`, а сгенерировать эти поля штатным Yii2 widget/helper, как это сделано в существующей админке для News Photo.

## Что должен сделать программист

1. Завести или расширить Yii2 AssetBundle для geo admin страницы.
2. Подключить `custom.css` и `custom.js` после штатных assets админки.
3. Оставить jQuery/Bootstrap/AdminLTE/Yii assets из текущей админки, не заменять их файлами из прототипа.
4. Подключить штатные upload-kit/fileupload assets проекта для полей Main Photo и Cover Photo.
5. Привязать поля `mainPhoto` и `coverPhoto` к реальным атрибутам модели.
6. Заменить прототипные имена `GeoPage[mainPhoto]` и `GeoPage[coverPhoto]` на реальные model/form names.
7. Проверить upload route. В прототипе стоит путь вида `/ru/admin/default/upload-photo?fileparam=...`; в production нужен актуальный route проекта.
8. Реализовать сохранение alt/title/description для каждого изображения.
9. Оставить основное сохранение через обычный Yii form submit.
10. Добавить server-side validation для SEO, FAQ, обязательных изображений и статуса публикации.
11. Проверить права доступа на upload/delete изображений.
12. Проверить MIME/type/size validation изображений на сервере.

## Что не считать готовым backend-кодом

- Демо-тексты и значения полей.
- Прототипные model names.
- Прототипный upload URL.
- Клиентские статус-бейджи готовности.
- AJAX preview-заглушки.

## Acceptance checklist для внедрения

- Страница открывается в текущей админке без JS ошибок.
- Вкладки переключаются штатно.
- Main Photo и Cover Photo загружаются через тот же upload-kit стиль, что и News Photo.
- После загрузки изображение сохраняется и отображается при повторном открытии формы.
- Alt/title/description сохраняются отдельно для Main Photo и Cover Photo.
- Без JS форма все равно отправляется обычным submit.
- SEO counters и предупреждения не блокируют сохранение без server-side причины.
- На ширине 390px блок `tab-images` не имеет горизонтального overflow.
- На desktop оба upload поля выглядят как штатные поля админки.

