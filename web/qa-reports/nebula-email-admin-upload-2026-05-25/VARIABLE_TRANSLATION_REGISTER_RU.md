# Реестр переменных и переводимых значений

Вывод: переводить нужно не ключи, а значения только для переменных типа text/html_block/enum label/locale phrase. URL, ID, даты, суммы, имена, siteName и user/entity payload не переводятся.

## Переводить через панель
- `{{errorMessage}}` - enum_i18n - Ошибку платежа нельзя тянуть сырой строкой провайдера; нужен код ошибки -> локализованный user-safe текст.
- `{{paymentMethod}}` - enum_i18n - Способ оплаты должен быть label из справочника методов оплаты по языку.
- `{{reason}}` - enum_i18n - Причина списания/действия должна быть кодом причины -> локализованным текстом.
- `{{supportCaseStatus}}` - enum_i18n - Публичный статус обращения должен выводиться из словаря статусов по языку, не внутренний код.
- `{{expiresIn}}` - locale_phrase - Время действия кода/ссылки нужно локализовать как duration label.
- `{{firstResponseSla}}` - locale_phrase - SLA вроде “within 24 hours” должен быть локализованной фразой или форматтером duration.
- `{{refundEta}}` - locale_phrase - ETA возврата вроде “3-10 business days” должен быть локализованной фразой.
- `{{updatedAnswerEta}}` - locale_phrase - Обновленный ETA ответа должен быть локализованной фразой, рассчитанной backend.
- `{{geoServiceListBlock}}` - translate - Переводимый список услуг для geo-страниц; не использовать inline в предложениях.
- `{{informationalDisclaimerBlock}}` - translate - Переводимый информационный дисклеймер; централизованно контролирует юридически аккуратную формулировку.
- `{{siteMetaDescription}}` - translate - Глобальный meta description по языкам, не заменяет page-specific SEO description.
- `{{siteMetaKeywords}}` - translate - Глобальные meta keywords по языкам, если используются в настройках сайта.
- `{{whatWeOfferBlock}}` - translate - Переводимый стандартный SEO-блок: хранить EN master + переводы, разрешить HTML только whitelist.

## Не делать inline
- `{{cityName}}` - Не делать inline-переменной: риск падежей, артиклей, рода и SEO-естественности. Использовать page-specific текст или whole-block.
- `{{consultationFormat}}` - Не делать inline-переменной: риск падежей, артиклей, рода и SEO-естественности. Использовать page-specific текст или whole-block.
- `{{countryName}}` - Не делать inline-переменной: риск падежей, артиклей, рода и SEO-естественности. Использовать page-specific текст или whole-block.
- `{{geoType}}` - Не делать inline-переменной: риск падежей, артиклей, рода и SEO-естественности. Использовать page-specific текст или whole-block.
- `{{locationName}}` - Не делать inline-переменной: риск падежей, артиклей, рода и SEO-естественности. Использовать page-specific текст или whole-block.
- `{{locationType}}` - Не делать inline-переменной: риск падежей, артиклей, рода и SEO-естественности. Использовать page-specific текст или whole-block.
- `{{mainService}}` - Не делать inline-переменной: риск падежей, артиклей, рода и SEO-естественности. Использовать page-specific текст или whole-block.
- `{{noPhotoAccess}}` - Не выводить пользователю как текст. Использовать только для условных блоков; текст блока переводится в самом шаблоне.
- `{{photoAccess}}` - Не выводить пользователю как текст. Использовать только для условных блоков; текст блока переводится в самом шаблоне.
- `{{serviceName}}` - Не делать inline-переменной: риск падежей, артиклей, рода и SEO-естественности. Использовать page-specific текст или whole-block.
