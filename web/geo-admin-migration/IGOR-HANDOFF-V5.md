# Confideline Geo Country / City Pages v5

## Цель

Перенести финальные макеты страниц страны и города в боевой сайт Confideline так, чтобы контент, SEO-поля, FAQ и изображения управлялись из текущей Yii2-админки без полной перестройки админ-панели.

## Платформа

- Yii 2.0.55
- PHP 8.5.0 во views
- текущая AdminLTE / Bootstrap админка
- `ActiveForm` и обычный submit для сохранения
- AJAX только для предпросмотра, счетчиков и проверок
- page-specific CSS/JS только через отдельные `custom.css` и `custom.js`

## CSS/JS boundary

Do not use the geo preview CSS as a replacement for the current Confideline theme.

Production integration must keep the existing site/admin AssetBundle chain:

- admin pages: current Yii/AdminLTE/Bootstrap assets first;
- public country/city/directory pages: current Confideline/YouDate frontend theme first;
- geo-specific `custom.css` / `custom.js` or frontend geo CSS/JS after the base theme.

The static HTML files in this package include preview assets only so the handoff can be opened outside Yii. In production, the base styles come from the existing application.

## Файлы текущего пакета

- Макет админки: `geo-admin-country-city-editor-proposal-v5.html`
- Миграционная панель: `geo-admin-migration/index.html`
- Короткая инструкция: `geo-admin-migration/IGOR-HANDOFF-V5.md`
- Итоговый аудит для программиста: `geo-admin-migration/PROGRAMMER-HANDOFF-AUDIT.md`

Финальные публичные v5-макеты страны, города и каталогов лежат рядом в корне `web` и входят в общий ZIP-пакет передачи. Они являются визуальным эталоном для публичного фронта, а папка `geo-admin-migration` описывает админскую часть и правила внедрения.

## Анкеты экспертов v5

- Используется единый блок анкет для страны и города.
- При смене темы в `geo-topic-options` на странице страны и города сразу вызывается `renderAdvisors()`, и блок экспертов перерисовывается под выбранную тему.
- CTA находится внутри каждой карточки эксперта.
- Верхний тематический тег в карточке не выводится, чтобы не съедать высоту.
- Галочка выбранной карточки не выводится.
- Сторис-счетчик выводится только на мобильном слайдере.
- На мобильном слайдере нет отдельного цветового состояния "активная карточка"; карточки читаются как равноправные элементы карусели.
- На 577-767px используется горизонтальный слайдер: две стройные карточки в рабочей области и видимый край следующей.
- На 768-991px выводятся 3 карточки в ряд, четвертая не переносится вниз.
- На 992px и шире выводятся 4 карточки в ряд.
- Цветной акцент остается в мета-бейджах, hover/focus на desktop/tablet и CTA.

## Что управляется из админки

- все SEO-поля;
- H1 Hero;
- H2 Hero;
- Teaser Description;
- основной HTML-текст страницы;
- FAQ: 4 вопроса и 4 ответа;
- Main Photo;
- Cover Photo;
- alt/title/description для изображений;
- активность страницы, `Show on main`, язык, сортировка через существующие поля.

## Что не управляется в карточке страны/города

- эксперты;
- города и регионы страны;
- ручной JSON-LD;
- сырые технические классы фронта;
- логика подбора экспертов.

Эксперты и быстрые подборки должны приходить из общего фронтового контура или локального подготовленного набора, а не редактироваться в карточке страны/города.

## Переменные в текстах

Использовать только глобальные переменные вместо жестко прописанных повторяемых сущностей:

- `{{siteName}}` — название проекта;
- `{{whatWeOfferBlock}}` — блок "Что предлагаем";
- `{{geoServiceListBlock}}` — список сервисов;
- `{{informationalDisclaimerBlock}}` — информационный дисклеймер.

Страна, город, язык, slug и URL берутся из текущей записи Yii2 и не вводятся как текстовые переменные в SEO-текстах.

В админке рядом с HTML-текстом нужен компактный список переменных. При наведении на переменную показывать hint с пояснением.

## Yii2 структура

Рекомендуемые файлы:

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

## AssetBundle

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

Во view:

```php
use app\modules\admin\assets\GeoAdminPageAsset;

GeoAdminPageAsset::register($this);
```

## AJAX

Submit формы остается главным способом сохранения.

AJAX использовать только для:

- live-счетчиков `Meta Title` и `Meta Description`;
- проверки перед сохранением;
- предпросмотра текущей языковой версии, если потребуется.

Изображения Main Photo и Cover Photo внедрять через штатный `yiiUploadKit`/fileupload текущей админки, по образцу поля Photo в News. Не возвращать самодельный uploader или отдельный custom image preview.

## Проверки перед сохранением

Показывать предупреждения, если:

- `Meta Title` длиннее 70 символов;
- `Meta Description` длиннее 160 символов;
- нет Main Photo;
- нет Cover Photo;
- FAQ меньше 4 вопросов;
- в тексте осталось `Neiro` вместо `{{siteName}}`;
- в тексте нет обязательных переменных `{{whatWeOfferBlock}}`, `{{geoServiceListBlock}}`, `{{informationalDisclaimerBlock}}`;
- страница активна, но SEO/текст/фото заполнены не полностью.

## SEO для фронта

Для страниц страны и города выводить:

- уникальный `title`;
- уникальный `meta description`;
- canonical;
- OpenGraph / Twitter image из главного изображения страницы;
- `BreadcrumbList`;
- `FAQPage`, если заполнены 4 FAQ;
- `ImageObject` для Main/Cover;
- hreflang по языковым версиям: `ru`, `en`, `es`, `it`, `de`, `pt`, `x-default`.

## Контроль v5

Проверенные брейкпоинты макетов:

```text
320, 390, 577, 600, 639, 640, 768, 900, 991, 992, 1200, 1440
```

Критерии:

- нет горизонтального overflow;
- один H1 на странице;
- Hero содержит H1 и H2;
- FAQ раскрывается кликом по области;
- CTA "Пройти короткий подбор" открывает мини-опрос;
- смена темы в фильтре сразу обновляет список экспертов без дополнительного клика по кнопке;
- CTA эксперта ведет на регистрацию;
- на 992px+ выводятся 4 анкеты экспертов в ряд;
- на 768-991px выводятся 3 анкеты экспертов в ряд;
- на 577-767px работает слайдер экспертов без сторис-счетчика;
- на 320-576px работает мобильный слайдер экспертов со сторис-счетчиком;
- на mobile страницы страны быстрые ссылки городов находятся поверх фото в Hero.




