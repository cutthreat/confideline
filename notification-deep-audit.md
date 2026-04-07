# Deep Audit: Confideline Notifications And Dialogs

Дата: 2026-04-07

Источник доказательств:
- live inventory после авторизации на [confideline.com](https://confideline.com/)
- static code audit по Yii2 source-of-truth:
  `H:\GPT-Codex\Confideline\Chat\youdate-2.0.2-yii2\Source\youdate_extracted`

## Coverage model

Этот audit собран в 2 слоя:

1. Live-confirmed:
   окна и уведомления, которые реально присутствуют в HTML боевого сайта.
2. Code-confirmed hidden/system:
   окна и уведомления, которые зашиты в коде, но могут не проявляться в текущем состоянии сайта:
   premium off, нет ошибки, нет недостатка кредитов, нет validation fail, нет specific moderator/admin action.

## 1. Front: live-confirmed modal windows

Подтвержденные modal id:

- `spotlight-submit`
  - где: `/en/`, `/en/dashboard`
  - назначение: размещение фото в spotlight
- `spotlight-warning`
  - где: `/en/`, `/en/dashboard`
  - назначение: предупреждение внутри spotlight flow
- `premiumModal`
  - где: `/en/`, `/en/dashboard`, `/en/profile/*`
  - назначение: premium upsell / purchase entry
- `profile-new-message`
  - где: `/en/`, `/en/dashboard`, `/en/profile/*`
  - назначение: отправка нового сообщения
- `modal-language-switcher`
  - где: большинство front-страниц
  - назначение: переключение языка
- `modal-search`
  - где: `/en/browse`
  - назначение: advanced search filters
- `conversation-report`
  - где: `/en/messages`
  - назначение: complaint/report из диалога
- `profile-report`
  - где: `/en/profile/*`
  - назначение: complaint/report из профиля
- `send-gift`
  - где: `/en/profile/*`
  - назначение: выбор и отправка подарка
- `user-gifts`
  - где: `/en/profile/*`
  - назначение: просмотр подарков пользователя

HTML preview:
- [Front dialogs](/H:/GPT-Codex/Confideline/notification-preview-pack/front-dialogs.html)

## 2. Front: hidden premium/system notifications

Эти сценарии подтверждены кодом, но могут быть скрыты на live в текущем состоянии.

### 2.0 Product-limit and feature-lock scenarios

Это как раз тот слой, который раньше был недобран: не просто общие premium окна, а прямые блокировки действий в продуктовых механиках.

#### Incoming likes lock

Подтверждено в коде:
- `application/controllers/ConnectionsController.php:77`
- `content/themes/youdate/views/connections/likes.php:21`

Сообщение:
- `You need premium account to unlock this page`

Как проявляется:
- lock-card на странице incoming likes (`type=to-you`)
- CTA `Premium settings`

#### Encounters premium restriction

Live-confirmed:
- `/en/connections/encounters`

Сообщения из runtime HTML:
- `Get premium`
- `The return profile function is available only to Premium users. Connect Premium and don't miss out on interesting profiles!`
- `I got it`

Как проявляется:
- runtime premium dialog/config для действия возврата профиля в encounters flow

#### Browse country restriction

Live-confirmed:
- `/en/browse`

Сообщения из runtime HTML:
- `Get premium`
- `Want to search in other countries? Connect Premium and meet people all over the world!`
- `I got it`

Как проявляется:
- `bootbox.dialog` при попытке сменить страну поиска вне разрешенного default state

#### Blocked messaging

Подтверждено в коде:
- `application/forms/MessageForm.php:55`

Сообщение:
- `You are not allowed to send messages to this user`

Как проявляется:
- `error-summary alert alert-danger` внутри modal `profile-new-message`
- trigger: пользователь заблокирован для текущего sender

### 2.1 Premium-only search restrictions

Подтверждено в коде:
- `content/themes/youdate/components/MultiSelect.php:61`
- `content/themes/youdate/components/Checkbox.php`
- `application/models/fields/Text.php`
- `application/models/fields/Select.php`
- `application/models/fields/Number.php`
- `application/models/fields/MultiSelect.php`

Сообщения:
- `Premium only`
- `Activate premium account to use this search criteria`

Как проявляется:
- disabled select / multiselect / checkbox внутри `modal-search`
- tooltip или title на premium-ограниченном поле

### 2.2 Spotlight insufficient credits / no photos

Подтверждено в коде:
- `application/forms/SpotlightForm.php:68`
- `content/themes/youdate/widgets/views/spotlight/submit.php:35`

Сообщения:
- `You don't have enough credits for this operation`
- `No photos`
- `You need at least one photo`

Как проявляется:
- error summary или warning state внутри spotlight modal
- CTA на покупку кредитов или загрузку фото

### 2.3 Gift insufficient credits

Подтверждено в коде:
- `application/forms/GiftForm.php:79`
- `content/themes/youdate/widgets/views/gifts/picker.php:33`

Сообщение:
- `You don't have enough credits for this operation`

Как проявляется:
- `error-summary alert alert-danger` внутри `send-gift`

### 2.4 Account confirmation warning

Подтверждено в коде:
- `content/themes/youdate/views/partials/user-confirmation.php:7`

Как проявляется:
- `alert alert-warning mb-0`
- системное предупреждение о необходимости подтвердить аккаунт

### 2.5 Verification warnings and failures

Подтверждено в коде:
- `content/themes/youdate/views/settings/verification.php:59`
- `content/themes/youdate/views/settings/verification.php:64`
- `content/themes/youdate/static/js/verification.js`

Как проявляется:
- webcam/camera warning
- upload failure / validation failure alert

### 2.6 Translation-backed latent messaging limits

Это отдельная категория доказательств: строки присутствуют в source-of-truth переводах и продуктовых настройках, но в текущем live HTML и в прямом PHP-trigger path они не проявились. Поэтому их нужно считать не live-confirmed, а latent product states.

Подтверждено в:
- `application/installer/data/core.sql`
- `application/config/settings.php`

Сообщения:
- `youre out of credits: {upgradeLink}`
- `get more credits`
- `You need premium status to send private messages. {upgradeLink}`
- `Upgrade to premium`
- `You have reached daily messages limit`
- `You have reached daily messages limit. {upgradeLink}`
- `You have reached daily messages limit for this conversation`
- `You have reached daily messages limit for this conversation. {upgradeLink}`
- `Only premium users are allowed to send messages`
- `Only users who like each other can send messages to each other`

Как трактовать:
- это продуктовые сообщения для messaging/paywall слоя;
- их нужно учитывать в унификации preview pack и ТЗ;
- но их нельзя маркировать как live-confirmed без отдельного runtime trigger.

### 2.7 Auth, recovery and account-state notices

Подтверждено в коде:
- `application/forms/LoginForm.php`
- `application/forms/RecoveryForm.php`
- `application/forms/DataRequestForm.php`
- `application/controllers/SecurityController.php`
- `content/themes/youdate/views/site/error/banned.php`

Сообщения:
- `You need to confirm your email address`
- `Your account has been blocked`
- `Invalid login or password`
- `An email has been sent with instructions for resetting your password`
- `Your password has been changed successfully.`
- `An error occurred and your password has not been changed. Please try again later.`
- `Sorry, you have already requested {0} data exports today`
- `Your account has been blocked.`
- `Your IP address has been blocked`

HTML preview:
- [Front hidden premium/system notices](/H:/GPT-Codex/Confideline/notification-preview-pack/front-hidden-notices.html)

## 3. Front: inline alerts, validation and JS notifications

### 3.1 Inline alert blocks

Подтверждено в коде:
- `content/themes/youdate/widgets/views/news/important.php:9`
  - `alert alert-primary alert-news mb-0`
- `content/themes/youdate/views/balance/services.php:34`
- `content/themes/youdate/views/balance/services.php:93`
  - `alert alert-success alert-dismissible`
- `content/themes/youdate/views/settings/data.php`
  - success/info/danger states
- `content/themes/youdate/views/settings/networks.php:20`
  - info alert
- `content/themes/youdate/views/page/about.php:13`
- `content/themes/youdate/views/page/privacy-policy.php:13`
- `content/themes/youdate/views/page/terms-and-conditions.php:13`
  - warning alerts
- `content/themes/youdate/views/site/error.php:16`
  - danger alert
- `content/themes/youdate/views/registration/connect.php:31`
  - info alert

### 3.2 Validation summaries

Подтверждено в коде:
- `content/themes/youdate/widgets/ActiveForm.php`
  - default `error-summary alert alert-danger`
- `content/themes/youdate/views/settings/profile.php`
- `content/themes/youdate/widgets/views/post/new.php`
- `content/themes/youdate/widgets/views/directory-search-form/widget.php`
- `content/themes/youdate/views/message.php`

### 3.3 JS messenger / toast notifications

Подтверждено в коде:
- `content/themes/youdate/static/js/app.js`
- `content/themes/youdate/static/js/messages.js`
- `content/themes/youdate/static/js/payment.js`
- `content/themes/youdate/widgets/Upload.php`

Типы:
- success
- error
- generic message/info

### 3.4 Runtime AJAX / product-action messages

Это отдельный слой уведомлений, который не всегда выглядит как modal или inline alert. Часть из них уходит через `Messenger().post`, часть через `error-summary`, часть через flash.

#### Messaging / blocking

Подтверждено в коде:
- `application/forms/MessageForm.php:55`
- `application/controllers/BlockController.php:67`
- `application/controllers/BlockController.php:80`
- `application/controllers/BlockController.php:102`

Сообщения:
- `You are not allowed to send messages to this user`
- `You can not block administrators`
- `Could not block this user`
- `Could find block record for this user`

#### Photo actions

Подтверждено в коде:
- `application/controllers/PhotoController.php:129`
- `application/controllers/PhotoController.php:191`
- `application/controllers/PhotoController.php:198`
- `application/controllers/PhotoController.php:210`
- `application/controllers/PhotoController.php:235`
- `application/controllers/PhotoController.php:242`
- `application/controllers/PhotoController.php:249`
- `application/controllers/PhotoController.php:279`

Сообщения:
- `Maximum photos per profile is {0}`
- `You're not allowed to set unverified photo as your main photo`
- `You can not set private photo as your main photo`
- `You can not toggle private status for your main photo`
- `Visibility of this photo has been set by the administrator`
- `Your primary photo has been set`
- `Photo visibility has been changed`
- `Photo has been deleted`

#### Payments / balance / spotlight

Подтверждено в коде:
- `application/controllers/BalanceController.php:169`
- `application/controllers/BalanceController.php:208`
- `application/controllers/BalanceController.php:336`
- `application/controllers/BalanceController.php:356`
- `application/controllers/BalanceController.php:382`
- `application/controllers/BalanceController.php:405`

Сообщения:
- `Unknown payment error occurred. Please try again later`
- `Payment canceled`
- `Your profile has been raised up in search`
- `Premium features activated`
- `Premium settings saved`
- `Photo has been placed on spotlight`

#### Related interaction/system success messages

Подтверждено в коде:
- `application/controllers/MessagesController.php`
- `application/controllers/GiftController.php`
- `application/controllers/ReportController.php`
- `application/controllers/NotificationsController.php`
- `application/controllers/SettingsController.php`
- `application/payments/Checkout.php`

Сообщения:
- `Message has been sent`
- `Could not create message`
- `Gift has been sent`
- `User has been reported`
- `Could not create report for this user`
- `Notifications have been marked as viewed`
- `Private photo access has been changed for this user`
- `Added {0} credits to your balance`
- `Your profile has been updated`
- `Your account details have been updated`
- `Settings have been saved`
- `Your account has been completely deleted`

HTML preview:
- [Front notifications](/H:/GPT-Codex/Confideline/notification-preview-pack/front-notifications.html)

## 4. Admin: live-confirmed confirm and modal windows

### 4.1 Live modal windows

- `cron-setup`
  - где: `/en/admin`
- `new-page`
  - где: `/en/admin/page/index`

### 4.2 Live-confirmed confirm messages

На live подтверждены 24 уникальных confirm-текста, включая:

- `Are you sure want to delete this group?`
- `Are you sure want to delete this message?`
- `Are you sure want to delete this report?`
- `Are you sure want to delete this news?`
- `Are you sure want to delete this category?`
- `Are you sure want to delete log message?`
- `Are you sure want to delete this Help item?`
- `Are you sure you want to confirm this user?`
- `Are you sure you want to block this user?`
- `Are you sure you want to unblock this user?`
- `Are you sure you want to add admin rights to this user?`
- `Are you sure you want to add verification badge to this user?`
- `Are you sure you want to login as this user?`
- `Do you really want to restore pages from theme files?`
- `Перезапустить воркер?`

Полный список:
- [Full live inventory](/H:/GPT-Codex/Confideline/live-dialog-inventory-full.md)

HTML preview:
- [Admin dialogs](/H:/GPT-Codex/Confideline/notification-preview-pack/admin-dialogs.html)

## 5. Admin: code-confirmed hidden confirms not fully visible in current live path set

### 5.1 User actions

Подтверждено в коде:
- `application/modules/admin/views/user/update.php`

Есть отдельные confirm-сценарии:
- `Are you sure you want to confirm this user?`
- `Are you sure you want to block this user?`
- `Are you sure you want to unblock this user?`
- `Are you sure you want to add admin rights to this user?`
- `Are you sure you want to remove admin rights from this user?`
- `Are you sure you want to add verification badge to this user?`
- `Are you sure you want to remove verification badge from this user?`
- `Are you sure you want to delete this user?`

### 5.2 Group actions

Подтверждено в коде:
- `application/modules/admin/views/group/_layout.php`

Есть отдельные confirm-сценарии:
- `Are you sure you want to add verification badge to this group?`
- `Are you sure you want to remove verification badge from this group?`
- `Are you sure you want to delete this group?`

### 5.3 Plugin and translator actions

Подтверждено в коде:
- `application/modules/admin/views/plugin/_plugin-item-browse.php:71`
- `application/modules/admin/views/plugin/_plugin-item-installed.php:62`
- `application/modules/admin/static/js/translate.js:188`
- `application/modules/admin/static/js/translate.js:189`

Есть confirm-сценарии:
- `Are you sure you want to uninstall this plugin?`
- `Are you sure you want to delete these items?`
- `Are you sure you want to delete this item?`

### 5.4 Additional delete/removal confirms

Подтверждено в коде:
- `application/modules/admin/views/gift/update-category.php:140`
  - `Are you sure want to delete this gift item?`
- `application/modules/admin/views/help/categories.php:64`
  - `Are you sure want to delete this help category?`
- `application/modules/admin/views/settings/admin.php:94`
- `application/modules/admin/views/admin/_form.php:57`
  - `Are you sure want to delete this user from admins/moderators?`

## 6. Admin: alerts, flash states and JS notifications

### 6.1 Static/inline alerts

Подтверждено в коде:
- `application/modules/admin/widgets/Alert.php`
  - base mapping for `danger / success / info / warning`
- `application/modules/admin/views/default/index-admin.php:51`
  - success
- `application/modules/admin/views/default/error.php:13`
  - danger
- `application/modules/admin/views/default/error-403.php:13`
  - danger
- `application/modules/admin/views/page/index.php:75`
  - success
- `application/modules/admin/views/page/index.php:80`
  - info
- `application/modules/admin/views/user/_balance.php:21`
  - info
- `application/modules/admin/views/gift/update-category.php:54`
  - info
- `application/modules/admin/views/settings/translator.php:181`
  - warning
- `application/modules/admin/views/settings/payment.php:35`
  - success
- `application/modules/admin/views/settings/prices.php:28`
  - info
- `application/modules/admin/views/settings/genders.php:51`
  - info
- `application/modules/admin/views/plugin/browse.php:30`
  - warning
- `application/modules/admin/views/help/_form-category.php:34`
  - info
- `application/modules/admin/views/expert-application/index.php:52`
  - success

### 6.2 Admin messenger/toast channels

Подтверждено в коде:
- `application/modules/admin/static/js/admin.js`
- `application/modules/admin/static/js/admin-agent-chat.js`
- `application/modules/admin/static/js/translate.js`

Типы:
- success
- error
- inline green/red tooltip-like states in translator tools

HTML preview:
- [Admin notifications](/H:/GPT-Codex/Confideline/notification-preview-pack/admin-notifications.html)

## 7. Coverage result

### Факты

- live layer покрывает текущие реально присутствующие front/admin modal и confirm окна.
- static layer покрывает скрытые premium/system/validation/admin action сценарии, которые не всегда видны на боевом сайте.
- hidden premium/system front сценарии вынесены в отдельный HTML preview.
- admin hidden confirms и alert channels задокументированы как code-confirmed, даже если конкретная ветка сейчас не была визуально открыта вручную на live.

### Inference

- Главный пропуск прошлого прохода был не в live inventory, а в code-only ветках: premium gating, credits, verification, translator/admin utility confirms.
- Для задач редизайна и унификации этого набора уже достаточно: охвачены и визуально проявляющиеся, и условные состояния.

### Recommendation

- Использовать для дальнейшей работы 3 артефакта вместе:
  - [Preview pack index](/H:/GPT-Codex/Confideline/notification-preview-pack/index.html)
  - [Full live inventory](/H:/GPT-Codex/Confideline/live-dialog-inventory-full.md)
  - [Deep audit](/H:/GPT-Codex/Confideline/notification-deep-audit.md)
- Если нужен уже не audit, а production-handoff для разработчика, следующий шаг:
  - собрать таблицу `источник -> тип -> селектор/id -> trigger -> current style shell -> target unification rule`.
