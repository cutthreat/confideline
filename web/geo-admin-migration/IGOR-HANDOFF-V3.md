# Confideline Geo Country / City Pages v3

## Цель

Перенести финальные макеты страниц страны и города в боевой сайт Confideline так, чтобы контент, SEO-поля, FAQ и изображения управлялись из текущей Yii2-админки без полной перестройки админ-панели.

## Платформа

- Yii 2.0.55
- PHP 8.5.0 во views
- текущая AdminLTE / Bootstrap админка
- `ActiveForm` и обычный submit для сохранения
- AJAX только для предпросмотра, счетчиков и проверок
- page-specific CSS/JS только через отдельные `custom.css` и `custom.js`

## Финальные макеты v3

- Страна: `web/geo-india-country-preview-v3.html`
- Город: `web/geo-delhi-city-preview-v3.html`
- Каталог стран/городов: `web/geo-directory-index-preview.html`
- Макет админки: `web/geo-admin-country-city-editor-proposal.html`
- Миграционная панель: `web/geo-admin-migration/index.html`

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

Использовать переменные вместо жестко прописанных повторяемых сущностей:

- `{{siteName}}` — название проекта;
- `{{geoName}}` — текущая страна или город;
- `{{countryName}}` — страна;
- `{{cityName}}` — город;
- `{{whatWeOfferBlock}}` — блок "Что предлагаем";
- `{{geoServiceListBlock}}` — список сервисов;
- `{{informationalDisclaimerBlock}}` — информационный дисклеймер;
- `{{languageName}}` — язык текущей версии.

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
- предпросмотра изображения в полном размере;
- предпросмотра текущей языковой версии, если потребуется.

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

## Контроль v3

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
- CTA эксперта ведет на регистрацию;
- на desktop 4 анкеты экспертов в ряд;
- на tablet 2 анкеты экспертов в ряд;
- на mobile работает слайдер экспертов;
- на mobile страницы страны быстрые ссылки городов находятся поверх фото в Hero.

