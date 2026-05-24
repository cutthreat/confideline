# Confideline Client Full Journey

- Status: FAIL
- Started: 2026-05-24T10:35:09.092Z
- Finished: 2026-05-24T10:37:22.603Z
- QA user: QAClient20260524103509 / qa.client.20260524103509@example.com

## Checks

- PASS: CLIENT-SIGNUP-PAGE - Страница регистрации открывается. Sign up
- PASS: CLIENT-SIGNUP-FILL - Форма регистрации принимает заполнение. Заполнены sex/dob/name/username/email/password/country/city
- PASS: CLIENT-SIGNUP-SUBMIT - Новый клиент регистрируется. После submit не остались на registration-form.
- PASS: CLIENT-PROFILE-SETTINGS-OPEN - Клиент открывает настройки профиля. Sign in
- WARN: CLIENT-PROFILE-UPDATE - Не найдено безопасное текстовое поле профиля для обновления. Профиль открыт, но автоматический safe update не выполнен.
- PASS: CLIENT-LOGOUT - Клиент выходит из аккаунта. https://confideline.com/en/login
- FAIL: CLIENT-LOGIN - Созданный клиент повторно логинится. Login не подтвержден.
- PASS: CLIENT-DISCOVERY - Клиент видит каталог/профили. 6 profile links found
- PASS: CLIENT-PROFILE-OPEN - Клиент открывает профиль другого пользователя. https://confideline.com/en/profile/QASignup20260509174136
- WARN: CLIENT-LIKE-FAVORITE - Клиент нажимает like/favorite на профиле. На профиле не найден явный like/favorite control.

## Findings

- critical: CLIENT-LOGIN-BLOCKER - Созданный клиент не может повторно войти

## Rollback


## Errors

- Error: Cannot take screenshot with 0 width. ""
    at WebSocket.<anonymous> (file:///H:/GPT-Codex/Confideline/qa-ba-autonomous-tester/reports/client-full-journey-20260524/live-client-full-journey-cdp.mjs:78:31)
    at [nodejs.internal.kHybridDispatch] (node:internal/event_target:843:20)
    at WebSocket.dispatchEvent (node:internal/event_target:776:26)
    at fireEvent (node:internal/deps/undici/undici:14147:14)
    at #onMessage (node:internal/deps/undici/undici:15425:9)
    at Object.onMessage (node:internal/deps/undici/undici:15138:76)
    at websocketMessageReceived (node:internal/deps/undici/undici:14151:15)
    at node:internal/deps/undici/undici:14857:19
    at node:internal/deps/undici/undici:14671:11
    at afterWrite (node:internal/streams/writable:708:5)