# Confideline Full-Site Scenario Pass

- Started: 2026-05-09T10:06:17.579Z
- Finished: 2026-05-09T10:08:50.388Z
- Status: PASS_WITH_WARNINGS
- Base URL: https://confideline.com
- Sender user: 167
- Recipient user: 168

## Summary

- PASS: 5
- WARN: 1
- FAIL: 0

## Checks

### WARN: Админское меню содержит href с шаблоном {url}

- ID: ADMIN-TEMPLATE-URL
- Комментарий: Шаблонный href найден в DOM. Клик в этом проходе не доказал навигацию, поэтому это предупреждение для проверки/исправления разметки меню.
- Evidence keys: allBadLinks, visibleBadCount, clickResult

### PASS: Login: неверные данные не ломают страницу и должны показать отказ

- ID: GUEST-LOGIN-INVALID
- Комментарий: Форма сохранила контролируемое состояние после негативной проверки.
- Evidence keys: before, post, after

### PASS: Signup: пустая отправка формы должна дать валидацию, а не 500/переход в неизвестное состояние

- ID: GUEST-SIGNUP-BLANK
- Комментарий: Форма сохранила контролируемое состояние после негативной проверки.
- Evidence keys: before, post, after

### PASS: Recovery: некорректный email должен дать валидацию, а не 500

- ID: GUEST-RECOVERY-INVALID
- Комментарий: Форма сохранила контролируемое состояние после негативной проверки.
- Evidence keys: before, post, after

### PASS: Сообщение U1 -> U2 проверено со стороны отправителя и получателя

- ID: USER-MESSAGE-RECIPIENT-DELIVERY
- Комментарий: Отправка подтверждена научно: есть факт отправки и точный текст найден в интерфейсе получателя.
- Evidence keys: text, send, senderFacts, recipientFacts, exactTextVisible

### PASS: Базовые пользовательские разделы открываются после login-as

- ID: USER-READONLY-CORE-SURFACES
- Комментарий: Профиль, настройки, фото, аккаунт, группы и connections открылись без явного 404/500.
- Evidence keys: routeFacts, failures

## Findings для Игоря

- В этом проходе новых подтвержденных багов нет.

## Screenshots

- admin-template-en-admin: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260509-100617\admin-template-url-en-admin.png
- admin-template-en-admin-user-index: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260509-100617\admin-template-url-en-admin-user-index.png
- admin-template-en-admin-message-index: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260509-100617\admin-template-url-en-admin-message-index.png
- admin-template-en-admin-photo-index: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260509-100617\admin-template-url-en-admin-photo-index.png
- admin-template-click-result: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260509-100617\admin-template-url-click-result.png
- GUEST-LOGIN-INVALID: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260509-100617\guest-login-invalid.png
- GUEST-SIGNUP-BLANK: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260509-100617\guest-signup-blank.png
- GUEST-RECOVERY-INVALID: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260509-100617\guest-recovery-invalid.png
- sender-loginas: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260509-100617\sender-user-167-messages-after-loginas.png
- message-sender-after-send: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260509-100617\message-sender-167-after-send.png
- recipient-loginas: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260509-100617\recipient-user-168-messages-after-loginas.png
- message-recipient-proof: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260509-100617\message-recipient-168-proof.png
- readonly-user-loginas: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260509-100617\readonly-user-user-167-messages-after-loginas.png
- readonly-en-profile: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260509-100617\readonly-en-profile.png
- readonly-en-settings-profile: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260509-100617\readonly-en-settings-profile.png
- readonly-en-settings-photos: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260509-100617\readonly-en-settings-photos.png
- readonly-en-settings-account: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260509-100617\readonly-en-settings-account.png
- readonly-en-groups: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260509-100617\readonly-en-groups.png
- readonly-en-connections-likes: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260509-100617\readonly-en-connections-likes.png
- readonly-en-connections-encounters: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260509-100617\readonly-en-connections-encounters.png
