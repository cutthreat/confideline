# Geo admin migration handoff v4

## Что передается программисту

Пакет описывает перенос финальных v4-макетов стран и городов в боевую админку Confideline.

Целевая платформа:

- Yii 2.0.55;
- PHP 8.5.0 во views;
- AdminLTE / Bootstrap текущей админки;
- AssetBundle;
- обычный form submit для сохранения;
- AJAX для предпросмотра и вспомогательных проверок.

## Главный принцип

Миграция гибридная: программист внедряет в текущий Yii2-код, Codex может помогать, но пакет должен быть понятен без Codex.

Поэтому:

- структура вкладок описана явно;
- CSS/JS вынесены в `custom.css` и `custom.js`;
- новые поля разделены по вкладкам;
- системные поля остаются как в текущей админке;
- языки сохраняют текущую механику через поле `Language`.

## Файлы пакета

- `confideline-geo-admin-migration-package.zip` — готовый архив для передачи программисту;
- `index.html` — веб-панель handoff;
- `custom.css` — локальные стили страницы;
- `custom.js` — локальная логика страницы;
- `IGOR-HANDOFF-V4.md` — короткая инструкция для внедрения без Codex;
- `confideline-admin-page-standard.md` — стандарт для будущих страниц Confideline.

## Финальные публичные макеты

- `../geo-india-country-preview-v4.html` — страница страны v4;
- `../geo-delhi-city-preview-v4.html` — страница города v4;
- `../geo-directory-index-preview.html` — список стран и городов.

## Куда переносить в Yii2

```text
modules/admin/assets/GeoAdminPageAsset.php
web/static/admin/geo-page/custom.css
web/static/admin/geo-page/custom.js
modules/admin/views/country/_form.php
modules/admin/views/geoname/_form.php
modules/admin/views/geo/_tabs.php
modules/admin/views/geo/_description.php
modules/admin/views/geo/_images.php
modules/admin/views/geo/_faq.php
modules/admin/views/geo/_seo.php
modules/admin/views/geo/_variables.php
```

## Минимальный AssetBundle

```php
namespace app\modules\admin\assets;

use yii\web\AssetBundle;

class GeoAdminPageAsset extends AssetBundle
{
    public $basePath = '@webroot/static/admin/geo-page';
    public $baseUrl = '@web/static/admin/geo-page';
    public $css = ['custom.css'];
    public $js = ['custom.js'];
    public $depends = [
        'yii\web\YiiAsset',
        'yii\bootstrap\BootstrapAsset',
    ];
}
```

## Подключение во view

```php
use app\modules\admin\assets\GeoAdminPageAsset;

GeoAdminPageAsset::register($this);
```

## Сохранение

Сохранение страницы остается обычным submit текущей формы Yii2. AJAX не должен быть единственным способом сохранить страницу.

## AJAX

AJAX нужен только для:

- предпросмотра текущей языковой версии;
- проверки длины SEO-полей на сервере, если потребуется;
- проверки готовности медиа/FAQ перед публикацией.

Если AJAX недоступен, кнопка `Обновить` все равно должна работать через submit.

## Проверка v4

Финальные макеты проверены на ширинах:

```text
320, 390, 577, 600, 639, 640, 768, 900, 991, 992, 1200, 1440
```

Проверено:

- нет горизонтального overflow;
- один H1 на странице;
- FAQ раскрывается;
- мини-опрос открывается;
- CTA экспертов ведет на регистрацию;
- страна на mobile показывает быстрые ссылки городов поверх фото в Hero;
- страна и город используют один стандарт блока экспертов.


