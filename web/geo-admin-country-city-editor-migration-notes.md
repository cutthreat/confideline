# Geo admin migration notes

## Цель

Сделать карточки страны и города управляемыми из текущей админки Confideline без полной перестройки админ-панели.

## Что изучено по WordPress-подходу

В WordPress похожие страницы обычно организованы как:

- основная рабочая область для заголовка, основного контента и дополнительных полей;
- правая колонка для статуса публикации, предпросмотра, featured image и кратких настроек;
- отдельные метабоксы для SEO, изображений, FAQ, дополнительных полей и связей;
- системные поля скрыты от редактора или read-only;
- блоки, влияющие на публичный фронт, вынесены в отдельные понятные секции, а не смешаны в одном HTML-поле.

Источники:

- https://developer.wordpress.org/plugins/metadata/custom-meta-boxes/
- https://developer.wordpress.org/plugins/settings/settings-api/
- https://developer.wordpress.org/block-editor/reference-guides/slotfills/plugin-document-setting-panel/

## Как это применено к Confideline

Видимый макет `geo-admin-country-city-editor-proposal.html` теперь оставлен как эволюция текущей формы `Update country`, а не как новая админка:

- верхние системные поля остаются на своих местах: страна, код страны, slug, translated name, geoname id, публичная ссылка, сортировка, активность, `Show On Main`, язык;
- новые поля для фронта разнесены по Bootstrap-вкладкам внутри той же формы;
- `Html Description` остается центральным редактором SEO-текста;
- фото остаются в текущей модели `Main Photo` / `Cover Photo`, рядом добавляются только alt/title;
- публикация остается в текущих контролах `Is Active`, `Show On Main`, `Language`, без отдельной правой колонки и без нового сценария публикации.

## Роли вкладок

| Вкладка | Роль | Что относится сюда | Что не должно лежать здесь |
|---|---|---|---|
| Информация | Привязка страницы к сущности сайта и статус языковой версии | страна, код, slug, translated name, geoname id, публичная ссылка, sort, active, show on main, language | длинный текст, FAQ, SEO meta |
| Описание | Публичный первый экран и основной SEO-текст | H1 Hero, H2 Hero, teaser, CTA, hero-карточка, HTML-текст, переменные `{{siteName}}`, `{{whatWeOfferBlock}}`, `{{geoServiceListBlock}}`, `{{informationalDisclaimerBlock}}` | canonical, фото, эксперты, города и регионы |
| Изображения | Медиа страницы | main photo, cover photo, alt, title, description, preview modal | meta title, FAQ |
| FAQ | Аккордеон вопросов на публичной странице | 4 вопроса и ответа | основной SEO-текст, ручная schema |
| SEO | Поисковые, социальные и LLM-readable метаданные | meta title, meta description, canonical, robots, hreflang cluster, OG image, schema type, JSON-LD preview | редактирование фото, FAQ |

## Рекомендуемая модель данных

Минимально безопасный вариант:

- оставить текущие таблицы `country` и `geoname` источником системной сущности;
- добавить связанную таблицу или JSON-поле для geo-контента по языку;
- хранить медиа отдельно, но связывать с geo-страницей как main / cover / og;
- slug и системные связи оставить read-only.

Пример структуры:

```json
{
  "pageType": "country",
  "entityId": 3175395,
  "locale": "ru",
  "hero": {
    "h1": "",
    "h2": "",
    "primaryCta": "",
    "secondaryCta": "",
    "card": {
      "eyebrow": "",
      "title": "",
      "text": ""
    }
  },
  "teaserDescription": "",
  "bodyHtml": "",
  "images": {
    "main": {},
    "cover": {},
    "og": {}
  },
  "faqItems": [],
  "seo": {
    "metaTitle": "",
    "metaDescription": "",
    "canonical": "",
    "robots": "index, follow",
    "hreflangCluster": ["ru", "en", "es", "it", "de", "pt", "x-default"],
    "schemaType": "WebPage + FAQPage + BreadcrumbList + ImageObject",
    "ogImage": ""
  },
  "status": "draft"
}
```

## Правила валидации

Для публикации должны быть заполнены:

- H1 Hero;
- H2 Hero;
- teaser description;
- основной HTML-текст;
- main photo;
- cover photo;
- OG image;
- alt/title для изображений;
- 4 FAQ;
- meta title;
- meta description;
- canonical;
- robots = `index, follow` для опубликованной страницы;
- hreflang cluster для всех языков: ru, en, es, it, de, pt, x-default;
- JSON-LD schema: WebPage, BreadcrumbList, FAQPage, ImageObject;
- статус активной страницы.

## Что не нужно показывать контент-менеджеру

- raw JSON;
- внутренние ID связей;
- редактирование schema-разметки в исходном виде;
- технические названия классов фронта;
- пояснения о том, как фронт собирает страницу.

## Интеграция в Yii2/admin

Для переноса макета в текущую админку использовать существующие паттерны:

- использовать только стандартные Bootstrap/AdminLTE вкладки внутри текущей формы;
- не переносить публикацию в отдельную колонку;
- не менять read-only системные поля;
- группировать новые поля по вкладкам текущей формы;
- оставить TinyMCE для `Html Description`;
- сохранить текущий способ загрузки `Main Photo` и `Cover Photo`;
- загруженные изображения должны открываться в Bootstrap modal для проверки полного размера;
- JSON-LD должен генерироваться шаблоном из полей, а не редактироваться вручную;
- FAQPage schema должна выводиться только если заполнены минимум 4 вопроса и ответа;
- hreflang должен строиться по существующим языковым версиям и canonical URL;
- новые поля валидировать по языковой версии страницы.

- `yii\bootstrap\ActiveForm`;
- AdminLTE `box`, `box-header`, `box-body`, `box-footer`;
- Bootstrap `form-group`, `form-control`, `row`, `col-*`;
- `nav nav-pills nav-stacked` для левого меню;
- стандартные `btn btn-primary`, `btn btn-default`, `btn btn-success`;
- существующий uploader для изображений.

Новый CSS должен быть минимальным и только для специфичных preview/image/status элементов.
