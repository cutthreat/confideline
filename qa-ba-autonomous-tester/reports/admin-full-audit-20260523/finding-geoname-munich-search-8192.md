# FAIL candidate: Geoname search server error (#8192)

Status: FAIL_CANDIDATE / needs live reproduction once Manhattan handoff is free.
Source: user screenshot from live `https://confideline.com/ru/admin/geoname/index`.

## Observed

Admin page shows Yii error:

- Header: `Ошибка (#8192)`
- Alert: `Возникла внутренняя ошибка сервера.`
- URL path: `/ru/admin/geoname/index`
- Query contains `GeonameSearch[name]=https%3A%2F%2Fconfideline.com%2Fru%2Fadmin%2Fgeoname%2Findex` instead of expected city text.

## Product expectation

Searching cities by name must never produce 500/Yii error. For `Munich`, the grid should show matching city rows or a clean empty state. URL-like input must be treated as plain text and either return empty results or validation feedback.

## Reproduction matrix to run

1. Sidebar/menu -> Geonames -> Name filter -> `Munich` -> Enter.
2. Same filter -> `Munich` -> click filter/search control if present.
3. Header global search -> `Munich` -> Enter.
4. Direct URL: `/ru/admin/geoname/index?GeonameSearch%5Bname%5D=Munich`.
5. Direct URL-like input: `/ru/admin/geoname/index?GeonameSearch%5Bname%5D=https%3A%2F%2Fconfideline.com%2Fru%2Fadmin%2Fgeoname%2Findex`.
6. Mixed filters: `GeonameSearch[name]=Munich&GeonameSearch[country]=DE`.
7. Browser back, reset filters, reload.
8. Repeat on mobile width if admin layout supports it.

## Likely risk area for Igor

The live admin geoname module is customized compared with the local source snapshot. Search/filter handling should be checked in:

- `GeonameSearch` model: validation rules for `name`, `country`, `geoname_id`.
- Geoname admin index GridView/Pjax/filter form.
- Any global admin header search JavaScript that may write the current URL into a grid filter input.
- Yii2 urlManager/query parsing after PHP 8.5 migration.

## Acceptance criteria

- No `Ошибка (#8192)` for any matrix case.
- `Munich` stays in the intended field after submit.
- URL-like value does not crash the server.
- Filter reset clears `GeonameSearch[...]` values.
- Evidence includes screenshot/JSON for PASS and any FAIL.
