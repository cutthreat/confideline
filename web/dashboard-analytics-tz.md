# ТЗ: analytics dashboard для Confideline

## Result
- В админке есть dashboard под эзотерические консультации в живом текстовом чате с поминутной оплатой.
- Экран реализован на существующем admin stack YouDate/Yii2.

## Scope
- Только консультации / эзотерика.
- Только live text chat.
- Только free -> paid -> repeat модель.
- LTV вынесен в отдельный слой, а не встроен в основную воронку.

## Done When
- Верхний экран показывает спрос, выход в бесплатные минуты, первую оплату и повтор.
- Есть продуктовый контур, воронка, unit-экономика, повторы, LTV и риски.
- Нет dating-метрик и dating-сущностей.

## How To Verify
- Открыть `http://127.0.0.1:8092/admin`
- Проверить `index-admin.php`
- При необходимости сравнить с `index-admin-v1.php`, `index-admin-v2.php`, `index-admin-v3.php`

## Source Of Truth
- `Chat/youdate-2.0.2-yii2/Source/youdate_extracted/application/modules/admin/views/default/index-admin.php`
