# Confideline Client Impersonation Journey

- Status: PASS_WITH_WARNINGS
- Marker: QA_CLIENT_IMPERSONATION_20260524-105254
- Actor: U166 KaelarisDornSchwarz
- Recipient: U168 CaelumRastNielsen

## Checks
- PASS: IMPERSONATE-ACTOR - Вход от лица клиента-отправителя через admin Login as user. Identity verified and admin UI absent.
- PASS: IMPERSONATE-RECIPIENT - Вход от лица клиента-получателя через admin Login as user. Identity verified and admin UI absent.
- PASS: CLIENT-PROFILE-VISIT - Клиент открывает профиль другого пользователя. https://confideline.com/en/profile/CaelumRastNielsen
- PASS: CLIENT-LIKE-ACTION - Клиент нажимает like/favorite. Click executed.
- PASS: CLIENT-MESSAGE-SENDER - Клиент отправляет сообщение с уникальным marker. Visible profile send did not complete; used proven frontend /messages/create endpoint with contactId.
- PASS: CLIENT-VISIT-RECIPIENT-PROOF - Получатель видит визит клиента. Actor appears in recipient guests.
- WARN: CLIENT-LIKE-RECIPIENT-PROOF - Получатель видит like от клиента. Actor not found in likes-to-you; like may already be mutual/hidden or control unavailable.
- PASS: CLIENT-MESSAGE-RECIPIENT-PROOF - Получатель видит точный текст сообщения. QA_CLIENT_IMPERSONATION_20260524-105254
- PASS: CLIENT-MESSAGES - Клиент открывает сообщения. https://confideline.com/en/messages
- PASS: CLIENT-CONNECTIONS - Клиент открывает connections. https://confideline.com/en/connections/encounters
- PASS: CLIENT-SETTINGS-PROFILE - Клиент открывает настройки профиля. https://confideline.com/en/settings/profile
- PASS: CLIENT-SETTINGS-ACCOUNT - Клиент открывает настройки аккаунта. https://confideline.com/en/settings/account
- PASS: CLIENT-GROUPS - Клиент открывает groups. https://confideline.com/en/groups
- PASS: CLIENT-BROWSE - Клиент открывает browse. https://confideline.com/en/browse

## Findings
- medium: CLIENT-MESSAGE-SENDER-UI - Profile message UI не был доказан через visible modal

## Errors
- none