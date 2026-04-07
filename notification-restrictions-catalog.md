# Confideline Restrictions Catalog

Дата: 2026-04-07

Назначение:
- это отдельный каталог именно ограничительных и отказных сообщений;
- сюда вынесены тексты вида `нельзя`, `недоступно`, `нужен premium`, `не хватает кредитов`, `действие запрещено`, `ошибка оплаты`.

Источник:
- `H:\GPT-Codex\Confideline\Chat\youdate-2.0.2-yii2\Source\youdate_extracted`

## 1. Premium and feature locks

- `You need premium account to unlock this page`
  - источник: `content/themes/youdate/views/connections/likes.php`
  - trigger: incoming likes page locked for non-premium user

- `Premium only`
  - источник:
    - `content/themes/youdate/components/MultiSelect.php`
    - `application/models/fields/Checkbox.php`
    - `application/models/fields/Select.php`
    - `application/models/fields/Text.php`
    - `application/models/fields/Number.php`
    - `application/models/fields/MultiSelect.php`
  - trigger: premium-only search fields

- `Activate premium account to use this search criteria`
  - источник:
    - `content/themes/youdate/components/MultiSelect.php`
    - `application/models/fields/Checkbox.php`
    - `application/models/fields/Select.php`
    - `application/models/fields/Text.php`
    - `application/models/fields/Number.php`
    - `application/models/fields/MultiSelect.php`
  - trigger: tooltip/title on disabled search filter

- `Get premium`
  - источник:
    - live runtime in `/en/`, `/en/dashboard`, `/en/profile/*`, `/en/connections/encounters`, `/en/browse`
  - trigger:
    - premium modal
    - encounters premium runtime dialog
    - browse country restriction dialog

- `The return profile function is available only to Premium users. Connect Premium and don't miss out on interesting profiles!`
  - источник: live runtime HTML in `/en/connections/encounters`
  - trigger: return-profile function in encounters

- `Want to search in other countries? Connect Premium and meet people all over the world!`
  - источник: live runtime HTML in `/en/browse`
  - trigger: search country switch outside allowed default

## 2. Credit and payment restrictions

- `You don't have enough credits for this operation`
  - источник:
    - `application/forms/SpotlightForm.php`
    - `application/forms/GiftForm.php`
    - `application/controllers/BalanceController.php`
  - trigger:
    - spotlight submit
    - send gift
    - rise up / activate premium

- `Unknown payment error occurred. Please try again later`
  - источник:
    - `application/controllers/BalanceController.php`
    - `application/payments/PaypalCheckout.php`
  - trigger: payment processing error

- `Payment canceled`
  - источник:
    - `application/controllers/BalanceController.php`
    - `application/payments/Checkout.php`
    - `application/payments/StripeCheckout.php`
  - trigger: payment cancel/failure flow

- `youre out of credits: {upgradeLink}`
  - источник: `application/installer/data/core.sql`
  - trigger: latent product state for credit-based messaging/paywall flow

- `get more credits`
  - источник: `application/installer/data/core.sql`
  - trigger: CTA inside latent exhausted-credits state

## 3. Messaging and interaction restrictions

- `You are not allowed to send messages to this user`
  - источник: `application/forms/MessageForm.php`
  - trigger: recipient is blocked or messaging forbidden

- `You need premium status to send private messages. {upgradeLink}`
  - источник: `application/installer/data/core.sql`
  - trigger: latent premium-required private messaging state

- `Upgrade to premium`
  - источник: `application/installer/data/core.sql`
  - trigger: CTA inside premium-required messaging state

- `You have reached daily messages limit`
  - источник: `application/installer/data/core.sql`
  - trigger: latent daily messaging cap

- `You have reached daily messages limit. {upgradeLink}`
  - источник: `application/installer/data/core.sql`
  - trigger: latent premium-upgrade branch for daily messaging cap

- `You have reached daily messages limit for this conversation`
  - источник: `application/installer/data/core.sql`
  - trigger: latent per-conversation cap

- `You have reached daily messages limit for this conversation. {upgradeLink}`
  - источник: `application/installer/data/core.sql`
  - trigger: latent premium-upgrade branch for per-conversation cap

- `Only premium users are allowed to send messages`
  - источник: `application/installer/data/core.sql`
  - trigger: latent premium-only messaging rule

- `Only users who like each other can send messages to each other`
  - источник: `application/installer/data/core.sql`
  - trigger: latent mutual-like messaging rule

- `You can not block administrators`
  - источник: `application/controllers/BlockController.php`
  - trigger: user tries to block admin

- `Could not block this user`
  - источник: `application/controllers/BlockController.php`
  - trigger: block action failed

- `Could find block record for this user`
  - источник: `application/controllers/BlockController.php`
  - trigger: unblock/delete block action failed

## 4. Photo restrictions

- `Maximum photos per profile is {0}`
  - источник: `application/controllers/PhotoController.php`
  - trigger: upload count exceeds allowed maximum

- `You're not allowed to set unverified photo as your main photo`
  - источник: `application/controllers/PhotoController.php`
  - trigger: moderation enabled and photo is not verified

- `You can not set private photo as your main photo`
  - источник: `application/controllers/PhotoController.php`
  - trigger: trying to set private photo as main

- `You can not toggle private status for your main photo`
  - источник: `application/controllers/PhotoController.php`
  - trigger: trying to hide/unhide main public photo

- `Visibility of this photo has been set by the administrator`
  - источник: `application/controllers/PhotoController.php`
  - trigger: photo private status locked by admin

- `You have already submitted your photo today`
  - источник: `application/forms/SpotlightForm.php`
  - trigger: spotlight daily limit reached

- `You have already sent this gift to this user`
  - источник: `application/forms/GiftForm.php`
  - trigger: duplicate gift attempt

## 5. Verification and account-state restrictions

- `Please confirm your account to unlock all platform features.`
  - источник: project preview + `content/themes/youdate/views/partials/user-confirmation.php`
  - trigger: user confirmation warning

- `You need to confirm your email address`
  - источник: `application/forms/LoginForm.php`
  - trigger: login attempt for unconfirmed account

- `Your account has been blocked`
  - источник: `application/forms/LoginForm.php`
  - trigger: login attempt for blocked account

- `Invalid login or password`
  - источник: `application/forms/LoginForm.php`
  - trigger: invalid auth credentials

- `An email has been sent with instructions for resetting your password`
  - источник: `application/forms/RecoveryForm.php`
  - trigger: password recovery request submitted

- `Your password has been changed successfully.`
  - источник: `application/forms/RecoveryForm.php`
  - trigger: successful password reset

- `An error occurred and your password has not been changed. Please try again later.`
  - источник: `application/forms/RecoveryForm.php`
  - trigger: failed password reset

- `Sorry, you have already requested {0} data exports today`
  - источник: `application/forms/DataRequestForm.php`
  - trigger: daily export limit

- `Your account has been blocked.`
  - источник: `application/controllers/SecurityController.php`
  - trigger: blocked account redirect flash

- `Your IP address has been blocked`
  - источник: `content/themes/youdate/views/site/error/banned.php`
  - trigger: banned IP error page

- `Web-camera access is not allowed.`
  - источник: `content/themes/youdate/views/settings/verification.php`
  - trigger: browser camera permission denied

- `Sorry, your previous photo submission was rejected.`
  - источник: `content/themes/youdate/views/settings/verification.php`
  - trigger: previous verification rejected

## 6. Related success messages

Эти тексты не являются ограничениями, но часто идут рядом с ограничительными сценариями и нужны для полного catalog coverage:

- `Your profile has been raised up in search`
- `Premium features activated`
- `Premium settings saved`
- `Photo has been placed on spotlight`
- `Your primary photo has been set`
- `Photo visibility has been changed`
- `Photo has been deleted`

Preview pages:
- [Front hidden notices](H:\GPT-Codex\Confideline\notification-preview-pack\front-hidden-notices.html)
- [Front notifications](H:\GPT-Codex\Confideline\notification-preview-pack\front-notifications.html)
- [Deep audit](H:\GPT-Codex\Confideline\notification-deep-audit.md)
