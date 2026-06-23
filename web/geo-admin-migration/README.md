# Geo admin migration handoff v5

## Что передается программисту

Пакет описывает перенос финальных v5-макетов стран и городов в боевую админку Confideline.

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

## Правило CSS/JS

`custom.css` и `custom.js` не заменяют стили сайта или админки. Они подключаются только поверх уже существующих AssetBundle текущего Confideline/YouDate.

Для админки базой остаются текущие AdminLTE/Bootstrap/Yii assets. Для публичных страниц базой остается текущая тема сайта. Новые geo-стили должны быть отдельным слоем и не должны переписывать глобальную тему.

Статические HTML-макеты в пакете используют preview-ассеты только для просмотра вне Yii. При миграции в боевой сайт программист переносит структуру и page-specific слой, а не заменяет существующие фронтовые или админские CSS-файлы.

## Файлы пакета

- `geo-admin-migration/index.html` — веб-панель handoff;
- `geo-admin-migration/custom.css` — локальные стили geo admin страниц;
- `geo-admin-migration/custom.js` — локальная логика geo admin страниц;
- `geo-admin-migration/assets/youdate-original/...` и `geo-admin-migration/assets/original/...` — локальные ресурсы текущей админки по схеме UX/UI Chat;
- `geo-india-country-preview-v5.html` — публичный макет страны;
- `geo-delhi-city-preview-v5.html` — публичный макет города;
- `geo-directory-country-v5.html` — публичный каталог стран;
- `geo-directory-city-v5.html` — публичный каталог городов страны;
- `geo-admin-country-city-editor-proposal-v5.html` — макет админской карточки страны/города;
- `IGOR-HANDOFF-V5.md` — короткая инструкция для внедрения без Codex;
- `PROGRAMMER-HANDOFF-AUDIT.md` — итоговый аудит перед передачей программисту;
- `confideline-admin-page-standard.md` — стандарт для будущих страниц Confideline.

## Финальные публичные макеты

Финальные публичные v5-макеты лежат рядом в корне `web` и входят в общий ZIP-пакет передачи. Они нужны как визуальный эталон для внедрения публичных страниц и каталогов.

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

## Изображения

Main Photo и Cover Photo должны внедряться через штатный `yiiUploadKit`/fileupload слой текущей админки, как поле Photo в News.

Статический прототип использует локально сохраненные upload-kit assets и инициализацию в `custom.js` только для демонстрации поведения. В production программист должен привязать uploader к реальным атрибутам модели, upload route и server-side validation проекта.

## Проверка v5

Финальные макеты проверены на ширинах:

```text
320, 390, 577, 600, 639, 640, 768, 900, 991, 992, 1200, 1440
```

Проверено:

- нет горизонтального overflow;
- один H1 на странице;
- FAQ раскрывается;
- мини-опрос открывается;
- смена темы в фильтре сразу обновляет список экспертов на странице страны и города;
- CTA экспертов ведет на регистрацию;
- 320-576px: мобильный слайдер экспертов со сторис-счетчиком;
- 577-767px: слайдер экспертов без сторис-счетчика, две карточки и край следующей;
- 768-991px: 3 анкеты экспертов в ряд;
- 992px+: 4 анкеты экспертов в ряд;
- страна на mobile показывает быстрые ссылки городов поверх фото в Hero;
- страна и город используют один стандарт блока экспертов.




