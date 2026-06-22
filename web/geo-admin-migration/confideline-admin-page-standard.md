# Confideline admin page standard

## Назначение

Для каждой кастомной страницы Confideline, которая расширяет текущую админку, отдельные стили и скрипты выносятся в файлы:

- `custom.css`
- `custom.js`

Это стандарт для будущих задач Confideline.com.

## Правило подключения

Каждая страница или группа однотипных страниц получает свой AssetBundle. В AssetBundle должны попадать только файлы, относящиеся к этой странице.

Запрещено смешивать page-specific код с общими файлами админки без отдельного согласования.

Базовые стили и скрипты текущего сайта/админки не копируются в `custom.css` и не заменяются. `custom.css` и `custom.js` всегда подключаются после штатных AssetBundle и отвечают только за новую страницу или группу однотипных страниц.

## Yii2

- версия проекта: Yii 2.0.55;
- PHP в views: PHP 8.5.0;
- подключение через AssetBundle;
- форма сохраняется обычным submit;
- вспомогательные проверки и предпросмотр работают через AJAX;
- HTML-редактор остается текущим TinyMCE;
- языки работают через существующий `Language` select, без языковых вкладок.

## Структура файлов

```text
modules/admin/assets/GeoAdminPageAsset.php
modules/admin/views/country/_form.php
modules/admin/views/geoname/_form.php
modules/admin/views/geo/_tabs.php
modules/admin/views/geo/_description.php
modules/admin/views/geo/_images.php
modules/admin/views/geo/_faq.php
modules/admin/views/geo/_seo.php
modules/admin/views/geo/_variables.php
web/static/admin/geo-page/custom.css
web/static/admin/geo-page/custom.js
```

## Граница ответственности custom.css/custom.js

`custom.css`:

- оформление новых вкладок;
- блоки проверки перед сохранением;
- подсказки глобальных переменных;
- счетчики SEO;
- локальные состояния полей.

`custom.js`:

- переключение вкладок, если это не делает штатный Bootstrap;
- счетчики Meta Title и Meta Description;
- подсказки и копирование глобальных переменных;
- клиентская проверка перед сохранением;
- AJAX-предпросмотр;
- AJAX-проверка уникальности/готовности, если будет добавлена.

## Что не должно попадать в custom.css/custom.js

- общий дизайн админки;
- глобальные меню;
- авторизация;
- загрузчик файлов, если уже есть штатный uploader;
- логика сохранения модели;
- маршрутизация Yii;
- бизнес-логика генерации публичной страницы.

## Проверка перед handoff

- страница открывается без ошибок JS;
- вкладки переключаются;
- counters работают;
- глобальные переменные копируются и показывают hint;
- форма не теряет текущий `Language`;
- submit остается стандартным Yii2 form submit;
- AJAX не блокирует сохранение, если endpoint временно недоступен.
