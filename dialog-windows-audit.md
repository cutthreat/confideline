# Диалоговые окна Confideline

Дата: 2026-04-05

## Факт

Каноничный код для Yii2-админки в этой задаче:

- `H:\GPT-Codex\Confideline\Chat\youdate-2.0.2-yii2\Source\youdate_extracted\application`

Фронтовые модалки подтверждены по рабочему статическому слепку:

- `H:\GPT-Codex\Confideline\web\dashboard-real-preview.html`

## 1. Полный перечень диалоговых окон

### Админка: confirm-диалоги через `data-confirm`

- Пользователи, список: подтвердить, разблокировать, заблокировать, удалить.
  - `modules/admin/views/user/index.php`
- Пользователь, карточка: подтвердить, заблокировать, разблокировать, добавить/снять права администратора, добавить/снять значок верификации, удалить.
  - `modules/admin/views/user/update.php`
- Группы, карточка: добавить/убрать значок верификации, удалить.
  - `modules/admin/views/group/_layout.php`
- Группы, список: удалить группу.
  - `modules/admin/views/group/index.php`
- Сообщения, legacy-таблица: заблокировать пользователя, удалить сообщение.
  - `modules/admin/views/message/legacy.php`
- Логи: удалить все сообщения логов, удалить одно сообщение.
  - `modules/admin/views/log/index.php`
- Страницы: сбросить страницы из theme files.
  - `modules/admin/views/page/index.php`
- Плагины: uninstall установленного или найденного плагина.
  - `modules/admin/views/plugin/_plugin-item-installed.php`
  - `modules/admin/views/plugin/_plugin-item-browse.php`
- Подарки: удалить категорию, удалить gift item.
  - `modules/admin/views/gift/categories.php`
  - `modules/admin/views/gift/update-category.php`
- Help: удалить категорию, удалить help item.
  - `modules/admin/views/help/categories.php`
  - `modules/admin/views/help/index.php`
- Бан-лист: удалить ban record.
  - `modules/admin/views/ban/index.php`
- Репорты: удалить report.
  - `modules/admin/views/report/index.php`
- Настройки админов/модераторов: удалить пользователя из списка админов/модераторов.
  - `modules/admin/views/settings/admin.php`
  - `modules/admin/views/admin/_form.php`
- Profile fields / categories, language list, news: delete-действия.
  - `modules/admin/views/profile-field/index.php`
  - `modules/admin/views/profile-field-category/index.php`
  - `modules/admin/views/language/list.php`
  - `modules/admin/views/news/index.php`

### Админка: confirm-диалоги через прямой JS

- Pages editor: предупреждение о несохранённых изменениях при смене языка.
  - `modules/admin/static/js/admin.js`
  - появляется на странице `modules/admin/views/page/index.php`
- Language scan: удалить выбранные элементы, удалить один элемент.
  - `modules/admin/static/js/translate.js`
  - появляется в языковом сканере/очистке переводов

### Админка: modal-окна Bootstrap

- `Cron setup`
  - `modules/admin/views/default/index-admin.php`
- `New page`
  - `modules/admin/views/page/index.php`

### Админка: уведомления и alert-блоки

- Flash alerts через `Alert::widget()`
  - layout: `modules/admin/views/layouts/main.php`
  - виджет: `modules/admin/widgets/Alert.php`
- Messenger toasts
  - AJAX error handler и list actions: `modules/admin/static/js/admin.js`
  - agent chat notifications: `modules/admin/static/js/admin-agent-chat.js`
- Inline alerts на страницах
  - dashboard, payment, page, gift, settings, language scan/optimizer, installer, error pages
  - примеры:
    - `modules/admin/views/default/index-admin.php`
    - `modules/admin/views/settings/payment.php`
    - `modules/admin/views/page/index.php`
    - `modules/admin/views/language/scan.php`
    - `installer/views/install/*.php`

### Фронт: модальные окна и уведомления

- Upload error modal `#spotlight-warning`
  - статический слепок: `H:\GPT-Codex\Confideline\web\dashboard-real-preview.html`
  - появляется при невалидной загрузке файла для spotlight/story media
- Premium/info modal `#premiumModal`
  - тот же слепок, фронтовое информационное окно с CTA
- `important-messages`
  - контейнер верхних фронтовых уведомлений на странице
- Inline upload/form alerts
  - `#result-stories-upload`
  - `#cropper-alert`
  - `#video-trim-alert`
  - `error-summary alert alert-danger`

## 2. Предлагаемый единый стиль

### Факт

В админке уже подключены:

- Bootstrap modal
- Bootbox
- Font Awesome
- Messenger

Поэтому безопасный путь унификации:

1. Не переписывать все `data-confirm` вручную.
2. Переопределить `yii.confirm` в одном месте.
3. Оставить существующие точки вызова и заменить только прямые `window.confirm`.
4. Дать единые CSS-правила для `modal`, `bootbox`, `alert`, `messenger`.

### Реализованная верстка в коде

Файлы:

- `modules/admin/static/css/admin-dialogs.css`
- `modules/admin/static/js/admin-dialogs.js`

Подключение:

- `modules/admin/assets/AdminAsset.php`

Дополнительные адаптации:

- `modules/admin/static/js/admin.js`
- `modules/admin/static/js/translate.js`
- `modules/admin/static/js/admin-agent-chat.js`

### HTML-шаблон для confirm/error/info

```html
<div class="cfd-dialog__body">
    <span class="cfd-dialog__icon">
        <i class="fa fa-info-circle"></i>
    </span>
    <div class="cfd-dialog__copy">
        <p class="cfd-dialog__message">Вы действительно хотите удалить это сообщение?</p>
        <p class="cfd-dialog__hint">Действие выполнится сразу и без дополнительного шага.</p>
    </div>
</div>
```

### Цветовая схема

- Ошибка / удаление / блокировка: красный `danger`
- Информация / нейтральное подтверждение: синий `info`
- Важное / подтверждение / выдача прав / верификация: зелёный `success`

### Рекомендация

Для фронта использовать тот же HTML-шаблон и те же семантические классы:

- `.cfd-dialog--danger`
- `.cfd-dialog--info`
- `.cfd-dialog--success`

Это позволит держать один визуальный язык между пользовательским сайтом и админкой даже при разных наборах JS-плагинов.
