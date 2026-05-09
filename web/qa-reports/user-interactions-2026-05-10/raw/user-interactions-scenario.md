# Confideline User Interactions Scenario

- Status: PASS
- Started: 2026-05-09T21:48:25.515Z
- Finished: 2026-05-09T21:49:34.738Z
- Actor: U166 Kaelaris Dorn Schwarz
- Target: U168 Caelum Rast Nielsen

## Checks

### PASS: Визит U1 в профиль U2 проверен через guests у U2

- ID: USER-PROFILE-VISIT-GUESTS
- Комментарий: До визита U1 не было в guests, после визита U2 видит U1.

### PASS: Лайк U1 -> U2 проверен со стороны получателя

- ID: USER-LIKE-RECIPIENT-SIDE
- Комментарий: До действия лайка не было, после действия U2 видит U1 во входящих лайках.

### PASS_SURFACE: Favorite проверен как action surface на профиле

- ID: USER-FAVORITE-ACTION-SURFACE
- Комментарий: Action favorite найден и POST вернул успешный HTTP-ответ. Вторую сторону для favorite проверять не нужно: это локальный список актера.

### PASS_SURFACE: Gift surface найден на профиле

- ID: USER-GIFT-SURFACE
- Комментарий: Форма/кнопка подарка присутствует. Отправку подарка лучше делать отдельным pass с контролем баланса и duplicate rules.

### PASS_SURFACE: Private photo/photo access surface проверен на профиле

- ID: USER-PHOTO-ACCESS-SURFACE
- Комментарий: На профиле есть признаки private/photo access. Нужен отдельный pass на профиле с приватными фото и проверкой входящего request у владельца.

## Findings для Игоря

- Новых подтвержденных багов в этом проходе нет.

## Screenshots

- guests-before: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\user-interactions-scenario-20260509-214825\guests-before.png
- profile-visit-actor: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\user-interactions-scenario-20260509-214825\profile-visit-actor.png
- guests-after: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\user-interactions-scenario-20260509-214825\guests-after.png
- incoming-likes-before: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\user-interactions-scenario-20260509-214825\incoming-likes-before.png
- like-profile-before: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\user-interactions-scenario-20260509-214825\like-profile-before.png
- like-profile-after: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\user-interactions-scenario-20260509-214825\like-profile-after.png
- incoming-likes-after: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\user-interactions-scenario-20260509-214825\incoming-likes-after.png
- favorite-profile-before: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\user-interactions-scenario-20260509-214825\favorite-profile-before.png
- favorite-profile-after: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\user-interactions-scenario-20260509-214825\favorite-profile-after.png
- surfaces-profile: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\user-interactions-scenario-20260509-214825\surfaces-profile.png
