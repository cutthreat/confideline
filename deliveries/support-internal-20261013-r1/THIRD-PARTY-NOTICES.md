# Зависимости макета

Локальные файлы сохранены из предоставленного Support HTML-пакета; новые CDN и зависимости не добавлялись.

- Bootstrap 3: MIT, https://getbootstrap.com/docs/3.4/about/#license-faqs
- jQuery 3.2.1: MIT, https://jquery.org/license/
- AdminLTE: MIT, https://github.com/ColorlibHQ/AdminLTE
- jQuery slimScroll: MIT/GPL, лицензия в исходном заголовке.
- Font Awesome 4: code MIT, fonts SIL OFL 1.1, https://fontawesome.com/v4/license/
- Fancybox 3.3.5: GPLv3 для open-source use либо Fancybox Commercial License, согласно исходному заголовку. Перед production-переносом подтвердить действующую лицензию проекта; наличие файла в прототипе не предоставляет новых коммерческих прав.

Vendor headers оставлены без изменений. Из производной копии `admin.min.css` удален только внешний `@import` Inter; используются локальные font stacks, оригинал сохранен в рабочем source. Генератор читабельного ТЗ использует установленный локально marked; он не включен в runtime поставки. Исходные изображения прототипа являются иллюстрациями, не утвержденными production-профилями.
