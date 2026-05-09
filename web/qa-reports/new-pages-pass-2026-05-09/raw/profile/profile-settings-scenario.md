# Confideline Profile Settings Scenario

- Status: PASS
- User: U184 Orion Esposito
- Marker: QA settings save marker 20260509-170517

## Checks

### PASS: Страница настроек открывается: /en/settings/profile

- ID: SETTINGS-ROUTE-EN-SETTINGS-PROFILE
- Комментарий: Страница открылась без 404 и показывает настройки/состояние.

### PASS: Страница настроек открывается: /en/settings/photos

- ID: SETTINGS-ROUTE-EN-SETTINGS-PHOTOS
- Комментарий: Страница открылась без 404 и показывает настройки/состояние.

### PASS: Страница настроек открывается: /en/settings/upload

- ID: SETTINGS-ROUTE-EN-SETTINGS-UPLOAD
- Комментарий: Страница открылась без 404 и показывает настройки/состояние.

### PASS: Страница настроек открывается: /en/settings/access-requests

- ID: SETTINGS-ROUTE-EN-SETTINGS-ACCESS-REQUESTS
- Комментарий: Страница открылась без 404 и показывает настройки/состояние.

### PASS: Страница настроек открывается: /en/settings/notifications

- ID: SETTINGS-ROUTE-EN-SETTINGS-NOTIFICATIONS
- Комментарий: Страница открылась без 404 и показывает настройки/состояние.

### PASS: Страница настроек открывается: /en/settings/verification

- ID: SETTINGS-ROUTE-EN-SETTINGS-VERIFICATION
- Комментарий: Страница открылась без 404 и показывает настройки/состояние.

### PASS: Страница настроек открывается: /en/appearance

- ID: SETTINGS-ROUTE-EN-APPEARANCE
- Комментарий: Страница открылась без 404 и показывает настройки/состояние.

### PASS: Страница настроек открывается: /en/settings/account

- ID: SETTINGS-ROUTE-EN-SETTINGS-ACCOUNT
- Комментарий: Страница открылась без 404 и показывает настройки/состояние.

### PASS: Страница настроек открывается: /en/settings/networks

- ID: SETTINGS-ROUTE-EN-SETTINGS-NETWORKS
- Комментарий: Страница открылась без 404 и показывает настройки/состояние.

### PASS: Страница настроек открывается: /en/settings/blocked-users

- ID: SETTINGS-ROUTE-EN-SETTINGS-BLOCKED-USERS
- Комментарий: Страница открылась без 404 и показывает настройки/состояние.

### PASS: Страница настроек открывается: /en/settings/data

- ID: SETTINGS-ROUTE-EN-SETTINGS-DATA
- Комментарий: Страница открылась без 404 и показывает настройки/состояние.

### PASS: Profile description сохраняется и читается обратно

- ID: PROFILE-DESCRIPTION-SAVE-READBACK
- Комментарий: Маркер сохранился в Profile[description] после save и reload.

### PASS: Profile description восстановлен после теста

- ID: PROFILE-DESCRIPTION-ROLLBACK
- Комментарий: Описание профиля восстановлено к исходному значению.

### PASS: Email notification checkbox сохраняется и читается обратно

- ID: NOTIFICATIONS-TOGGLE-SAVE-READBACK
- Комментарий: Чекбокс Settings[receiveEmailOnPhotoView] изменился после save/reload.

### PASS: Email notification checkbox восстановлен после теста

- ID: NOTIFICATIONS-TOGGLE-ROLLBACK
- Комментарий: Чекбокс Settings[receiveEmailOnPhotoView] восстановлен к исходному значению.

### PASS: Account settings inspected without destructive mutation

- ID: ACCOUNT-SAFE-SURFACE-INSPECTED
- Комментарий: Account page opened; password/email/delete-like controls inspected as surface only.

## Findings для Игоря

- Новых подтвержденных багов нет.

## Screenshots

- route-en-settings-profile: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\profile-settings-scenario-20260509-170517\en-settings-profile.png
- route-en-settings-photos: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\profile-settings-scenario-20260509-170517\en-settings-photos.png
- route-en-settings-upload: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\profile-settings-scenario-20260509-170517\en-settings-upload.png
- route-en-settings-access-requests: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\profile-settings-scenario-20260509-170517\en-settings-access-requests.png
- route-en-settings-notifications: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\profile-settings-scenario-20260509-170517\en-settings-notifications.png
- route-en-settings-verification: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\profile-settings-scenario-20260509-170517\en-settings-verification.png
- route-en-appearance: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\profile-settings-scenario-20260509-170517\en-appearance.png
- route-en-settings-account: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\profile-settings-scenario-20260509-170517\en-settings-account.png
- route-en-settings-networks: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\profile-settings-scenario-20260509-170517\en-settings-networks.png
- route-en-settings-blocked-users: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\profile-settings-scenario-20260509-170517\en-settings-blocked-users.png
- route-en-settings-data: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\profile-settings-scenario-20260509-170517\en-settings-data.png
- profile-after-rollback: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\profile-settings-scenario-20260509-170517\profile-after-rollback.png
- notifications-after-rollback: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\profile-settings-scenario-20260509-170517\notifications-after-rollback.png
