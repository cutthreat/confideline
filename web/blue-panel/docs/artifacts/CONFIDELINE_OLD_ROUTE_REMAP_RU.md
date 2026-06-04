# Ремап старых ссылок Confideline

Основание: текущая карта админки от 2026-05-30 показывает 54 рабочих `/en/admin/...` маршрута и 0 admin 404 в проверенном списке. Поэтому старые `/ru/admin/...` ссылки из Trello считаются историческими, пока не доказано обратное.

| Старая ссылка | Тип | Текущий кандидат | Статус | Решение PM |
|---|---|---|---|---|
| [https://confideline.com/admin/page/index?currentPage=1.php](https://confideline.com/admin/page/index?currentPage=1.php) | устаревший admin route | /en/admin/page/index | есть текущий аналог | Использовать текущую страницу Pages; старую ссылку не считать proof. |
| [https://confideline.com/ru/admin/chief-under/index?userId=2](https://confideline.com/ru/admin/chief-under/index?userId=2) | старый/непонятный admin route | нет подтвержденного аналога | требует проверки backend/смысла | Не включать в P0 как готовую функцию без runtime/source proof. |
| [https://confideline.com/ru/admin/group/](https://confideline.com/ru/admin/group/) | старый admin route | /en/admin/group/index | есть текущий аналог | Ремапить на группы. |
| [https://confideline.com/ru/admin/message/index](https://confideline.com/ru/admin/message/index) | старый admin route | /en/admin/message/index | есть текущий аналог | Ремапить на список сообщений. |
| [https://confideline.com/ru/admin/settings/social](https://confideline.com/ru/admin/settings/social) | старый admin route | /en/admin/settings/social | есть текущий аналог | Ремапить на social settings. |
| [https://confideline.com/ru/admin/support/index](https://confideline.com/ru/admin/support/index) | старый admin route | /en/admin/support/index | есть текущий аналог | Ремапить на support. |
| [https://confideline.com/ru/admin/user](https://confideline.com/ru/admin/user) | старый admin route | /en/admin/user/index | есть текущий аналог | Ремапить на пользователей. |
| [https://confideline.com/ru/admin/user/index](https://confideline.com/ru/admin/user/index) | старый admin route | /en/admin/user/index | есть текущий аналог | Ремапить на пользователей. |
| [https://confideline.com/ru/admin/user/info?id=82](https://confideline.com/ru/admin/user/info?id=82) | старый detail route | нет в текущей карте 54 маршрутов | требует runtime/source check | Не считать подтвержденным detail view. |
| [https://confideline.com/page/AntiScam](https://confideline.com/page/AntiScam) | старый legal route | legal package / новая page route | нет текущего proof | Восстановить/создать через legal HTML пакет. |
| [https://confideline.com/page/Cancellation-and-Refund](https://confideline.com/page/Cancellation-and-Refund) | старый legal route | legal package / refund page | нет текущего proof | Восстановить/создать refund правила после founder/legal решения. |
| [https://confideline.com/page/cancellation-refund](https://confideline.com/page/cancellation-refund) | старый legal route | legal package / refund page | нет текущего proof | Дедублировать и оставить один канонический route. |
| [https://confideline.com/page/legal-safety-center](https://confideline.com/page/legal-safety-center) | старый legal route | legal package / safety center | нет текущего proof | Восстановить trust/safety страницу. |
| [https://confideline.com/page/policy-content](https://confideline.com/page/policy-content) | старый legal route | legal package / content policy | нет текущего proof | Восстановить content policy. |
| [https://confideline.com/page/Safety](https://confideline.com/page/Safety) | старый legal route | legal package / safety page | нет текущего proof | Дедублировать с legal-safety-center. |

Вывод: проблема не в доступе, а в устаревших ссылках. Для P0 нужно использовать актуальную карту `/en/admin/...` и отдельно восстановить legal/safety/refund страницы через legal package.
