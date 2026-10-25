# CSS и границы внедрения

Существующие CSS сайта использовать без изменения. global_custom, header, логотип, sidebar, footer и остальные модули не входят в правки.

integration/common-icon-badge.css — только .admin-icon-badges .transaction-type: существующий серый квадрат26×26, r5, #eef2f6, рамка#dfe6ee, FontAwesome12px. Не импортировать весь balance_custom.css ради этого элемента.

integration/categories.css — только [data-contact-filter-page=incidents]. Столбец134px для четырёх квадратов на desktop;212px при coarse pointer для44px целей. Текстовые фильтры и сами category values сохраняются. Отменённая общая панель отсутствует; её неиспользуемые CSS-правила удалены из этой копии.

integration/rule-category-icons.css — только [data-contact-filter-page="rules"]. Сохраняет текст и добавляет пиктограмму/модификатор. Имена rule IDs не определяют категорию.

Сайт использует chat-contact-filter.css с cf-workspace/cr-page/cf-pill. Исходный архив contact-filter использовал cf-panel-toolbar/cf-badge/cf-modal. Это разные контракты адаптации. Не перекрывать действующий CSS всем архивным contact_filter_custom.css и не переносить вспомогательный preview/customer-components-scoped.css на сервер. Подставить presentation в действующие Yii views/AssetBundle.

Финансовые customer CSS из архива и действующего сайта совпали побайтово при проверке25.10; сайт дополнительно использует financial-adapter.css. Сохранить существующую регистрацию, не заменять этот адаптер архивом. Для одинакового периода переиспользовать действующий компонент, а не копировать финансовую страницу.

preview/assets содержит неизменённые CSS и библиотеки только для переносимого просмотра. Они НЕ являются списком файлов для production. HTML-анонимизация header меняет только демонстрационную подпись пользователя, не стили. Единственный отсутствующий legacy-ресурс — неиспользуемый AdminLTE boxed-bg.jpg; layout-boxed в этих макетах не применяется.
