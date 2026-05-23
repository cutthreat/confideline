# Admin read-only matrix 2026-05-23

Target: https://confideline.com
Mode: authenticated Manhattan read-only navigation
Summary: {"PASS":36,"WARN":1,"FAIL":2}

| Status | Label | HTTP | Title | H1 | URL |
|---|---|---:|---|---|---|
| PASS | admin-root | 200 | Главное | Главное | https://confideline.com/ru/admin |
| PASS | partner-index | 200 | Управление партнерами | Управление партнерами | https://confideline.com/ru/admin/partner/index |
| PASS | user-index | 200 | Управление пользователями | Управление пользователями | https://confideline.com/ru/admin/user/index |
| PASS | balance-transaction-index | 200 | Balance transactions | Balance transactions | https://confideline.com/ru/admin/balance-transaction/index |
| PASS | order-index | 200 | Управление счетами | Управление счетами | https://confideline.com/ru/admin/order/index |
| PASS | support-index | 200 | Поддержка | Поддержка | https://confideline.com/ru/admin/support/index |
| PASS | group-index | 200 | Управление группами | Управление группами | https://confideline.com/ru/admin/group/index |
| PASS | message-chat | 200 | Сообщения | Сообщения | https://confideline.com/ru/admin/message/chat |
| PASS | message-index | 200 | Управление сообщениями | Управление сообщениями | https://confideline.com/ru/admin/message/index |
| PASS | photo-index | 200 | Управление фотографиями | Управление фотографиями | https://confideline.com/ru/admin/photo/index |
| PASS | page-index | 200 | Управление страницами | Управление страницами | https://confideline.com/ru/admin/page/index |
| PASS | news-index | 200 | Управление новостями | Управление новостями | https://confideline.com/ru/admin/news/index |
| PASS | info-block-index | 200 | Info Blocks | Info Blocks | https://confideline.com/ru/admin/info-block/index |
| PASS | report-index | 200 | Управление жалобами | Управление жалобами | https://confideline.com/ru/admin/report/index |
| PASS | verification-index | 200 | Управление верификациями | Управление верификациями | https://confideline.com/ru/admin/verification/index |
| PASS | gift-categories | 200 | Категории подарков | Категории подарков | https://confideline.com/ru/admin/gift/categories |
| PASS | ban-index | 200 | Ban management | Ban management | https://confideline.com/ru/admin/ban/index |
| PASS | settings-index | 200 | Настройки | Настройки | https://confideline.com/ru/admin/settings/index |
| PASS | email-template-index | 200 | Email Templates | Email Templates | https://confideline.com/ru/admin/email-template/index |
| WARN | country-index | 200 | Manage countries | Manage countries | https://confideline.com/ru/admin/country/index |
| PASS | geoname-index | 200 | Manage cities | Manage cities | https://confideline.com/ru/admin/geoname/index |
| PASS | help-index | 200 | Управление справкой | Управление справкой | https://confideline.com/ru/admin/help/index |
| PASS | help-categories | 200 | Управление справкой | Управление справкой | https://confideline.com/ru/admin/help/categories |
| PASS | language-list | 200 | Управление языками | Управление языками | https://confideline.com/ru/admin/language/list |
| PASS | theme-settings | 200 | Тема | Тема | https://confideline.com/ru/admin/theme/settings |
| PASS | theme-index | 200 | Каталог тем | Каталог тем | https://confideline.com/ru/admin/theme/index |
| PASS | language-seo-translate | 200 | Перевод на en-US | Перевод на en-US | https://confideline.com/ru/admin/language/seo-translate?language_id=en-US |
| PASS | log-index | 200 | Управление логами | Управление логами | https://confideline.com/ru/admin/log/index |
| PASS | users-log-index | 200 | Журнал действий | Журнал действий | https://confideline.com/ru/admin/users-log/index |
| PASS | profile-field-index | 200 | Поля профиля | Поля профиля | https://confideline.com/ru/admin/profile-field/index |
| PASS | profile-field-category-index | 200 | Категории полей | Категории полей | https://confideline.com/ru/admin/profile-field-category/index |
| PASS | queue-monitor-index | 200 | Мониторинг очереди | Мониторинг очереди | https://confideline.com/ru/admin/queue-monitor/index |
| PASS | user-data-cache-index | 200 |  |  | https://confideline.com/ru/admin/user-data-cache/index |
| PASS | web-socket-index | 200 |  |  | https://confideline.com/ru/admin/web-socket/index |
| FAIL | plugin-index | 500 | Ошибка (#8192) | Ошибка (#8192) | https://confideline.com/ru/admin/plugin/index |
| FAIL | plugin-browse | 500 | Ошибка (#8192) | Ошибка (#8192) | https://confideline.com/ru/admin/plugin/browse |
| PASS | settings-env-php | 200 | Admin Enviroment | Admin Enviroment | https://confideline.com/ru/admin/settings/env-php |
| PASS | search-index-empty | 200 | Поиск | Поиск | https://confideline.com/ru/admin/search/index?q= |
| PASS | search-index-munich | 200 | Поиск | Поиск | https://confideline.com/ru/admin/search/index?q=Munich |