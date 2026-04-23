# Live Dialog Inventory

Дата фиксации: 2026-04-06  
Источник: `https://confideline.com/` после авторизации тестовым админом.

## Front

### Модальные окна
- `#spotlight-submit`
  - Заголовок: `Place your photo on spotlight`
  - Где: `/en/dashboard`
  - Когда: выбор фото для публикации в spotlight/stories.
- `#spotlight-warning`
  - Заголовок: `Place your photo on spotlight`
  - Где: `/en/dashboard`
  - Когда: ошибка публикации или нехватка баланса.
- `#premiumModal`
  - Заголовок: `Get premium`
  - Где: `/en/dashboard`
  - Когда: upsell премиума.
- `#profile-new-message`
  - Заголовок: динамический, shell подтверждён
  - Где: `/en/dashboard`
  - Когда: отправка нового сообщения из профиля.
- `#modal-language-switcher`
  - Заголовок: `Current language: English (US)`
  - Где: `/en/dashboard`
  - Когда: переключение языка интерфейса.

### Уведомления
- `.important-messages .alert.alert-primary.alert-news.mb-0`
  - Где: верхняя полоса страницы `/en/dashboard`
  - Когда: новостное/системное сообщение.
- `#result-stories-upload.alert.alert-success.alert-dismissible`
  - Где: `/en/dashboard`
  - Когда: успешная загрузка stories/media.
- `#cropper-alert.alert.alert-danger`
  - Где: `/en/dashboard`
  - Когда: ошибка кропа/валидации изображения.
- `#video-trim-alert.alert.alert-danger.mt-2`
  - Где: `/en/dashboard`
  - Когда: ошибка обрезки или длительности видео.
- `.error-summary.alert.alert-danger`
  - Где: формы фронта, в том числе новое сообщение
  - Когда: серверная/клиентская валидация формы.
- `.alert.alert-warning`
  - Где: блок рекламного слота
  - Когда: вывод placeholder/banner `Header Ad`.

## Admin

### Confirm-окна
- `/en/admin/user/index`
  - `Are you sure you want to block this user?`
  - `Are you sure want to delete this user?`
- `/en/admin/group/index`
  - `Are you sure want to delete this group?`
- `/en/admin/message/index`
  - `Are you sure want to block this user?`
  - `Are you sure want to delete this message?`
- `/en/admin/page/index`
  - `Do you really want to restore pages from theme files?`
- `/en/admin/news/index`
  - `Are you sure want to delete this news?`
- `/en/admin/report/index`
  - `Are you sure want to delete this report?`
- `/en/admin/gift/categories`
  - `Are you sure want to delete this category?`
- `/en/admin/ban/index`
  - `Are you sure want to delete this ban record?`
- `/en/admin/help/index`
  - `Are you sure want to delete this Help item?`
- `/en/admin/language/list`
  - `Are you sure want to delete this user?`
  - Примечание: вероятно copy mismatch в live-тексте.
- `/en/admin/log/index`
  - `Are you sure you want to delete all log messages?`
  - `Are you sure want to delete log message?`

### Модальные окна
- `/en/admin`
  - `#cron-setup`
  - Заголовок: `Cron setup`
- `/en/admin/page/index`
  - `#new-page`
  - Заголовок: `New page`
