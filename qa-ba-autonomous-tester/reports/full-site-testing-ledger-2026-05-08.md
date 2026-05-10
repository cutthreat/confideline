# Confideline Full Site Testing Ledger

Дата старта: 2026-05-08  
Статус: started / первая карта сайта собрана  
База: https://confideline.com

## Цель

Построить полную картину сайта для дальнейшего QA и бизнес-анализа: страницы, роли, сценарии, дефекты, успешные проверки, зоны ретеста и продуктовые наблюдения.

## Метод

Первый проход выполнен как read-only route inventory:

- guest;
- authenticated user `167`;
- admin через сохраненный super-admin storage state;
- без destructive actions;
- сбор статусов HTTP, title, h1, forms, buttons, links, console errors, screenshots.

Основной артефакт:

`H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-route-inventory-20260508-211324\full-site-route-inventory.json`

## Итог первого прохода

| Роль | Проверено routes | PASS | WARN | FAIL |
|---|---:|---:|---:|---:|
| Guest | 24 | 23 | 1 | 0 |
| User | 90 | 85 | 4 | 1 |
| Admin | 90 | 87 | 0 | 3 |

## Важные найденные факты

### Guest

PASS:

- `/en` открывается.
- `/en/login` открывается.
- `/en/signup` открывается.
- `/en/recovery/request` открывается и показывает форму восстановления пароля.
- Legal pages работают по актуальным routes:
  - `/en/page/terms-and-conditions`;
  - `/en/page/privacy-policy`;
  - `/en/page/cookie-policy`.
- Language routes открываются.

WARN:

- `/en/page/about` дал console error от Facebook/PublicKeyCredentials. Это не блокер функции, но сигнал внешнего JS/интеграционного шума.

### User

PASS:

- Dashboard, messages, profile, profile settings, photos, likes, encounters, groups, countries, notifications открываются.
- Рабочие connections routes:
  - `/en/connections/likes`;
  - `/en/connections/likes/from-you`;
  - `/en/connections/likes/to-you`;
  - `/en/connections/likes/mutual`;
  - `/en/connections/guests`;
  - `/en/connections/encounters`.
- Группы и страницы стран открываются.
- Settings sections открываются:
  - profile;
  - photos;
  - access requests;
  - notifications;
  - verification;
  - appearance;
  - account;
  - networks;
  - your data.

Needs triage:

- `/en/connections` возвращает 404. Пока не считаю это багом для Игоря, потому что это seed-route из тест-плана, а не доказанная ссылка из UI. Нужно отдельно проверить, есть ли реальная кликабельная ссылка на этот route.
- `/en/connections/likes?type=to` возвращает 400. Это также seed-route; актуальный рабочий route — `/en/connections/likes/to-you`.
- `/en/settings/verification` работает, но есть console 404 resource и текст `Web-camera access is not allowed`. Нужен отдельный UX/permission тест.
- `/en/notifications/mark-as-viewed` возвращает 405 при GET. Это POST-action; не считать багом без доказательства, что UI ведет пользователя GET-ссылкой.
- `/en/auth/facebook` уводит на Facebook login. Это ожидаемо для OAuth, но требует отдельной проверки product/brand trust.

### Admin

PASS:

- Основные admin pages открываются:
  - dashboard;
  - users;
  - messages;
  - photos;
  - reports;
  - verifications;
  - groups;
  - group posts;
  - bans;
  - premium/photo/stories/groups settings;
  - partners;
  - finance/orders;
  - support;
  - pages/news;
  - gifts;
  - countries/cities;
  - help;
  - languages;
  - logs;
  - profile fields;
  - queue/websocket/user cache monitors;
  - plugins;
  - environment page.

Potential admin UI bug:

- В admin dropdown links встречается шаблонный href `%7Burl%7D` / `{url}`.
- Примеры, которые открылись как 404:
  - `/en/admin/user/%7Burl%7D`;
  - `/en/admin/message/%7Burl%7D`;
  - `/en/admin/photo/%7Burl%7D`.
- Нужно проверить вручную, кликабельны ли эти dropdown parent items. Если да, это UX/UI bug: админское меню содержит шаблонную ссылку вместо `#` или корректного route.

## Public smoke / accessibility

Команда:

`npx playwright test tests/public-smoke.spec.ts tests/accessibility.spec.ts --reporter=line`

Результат:

- Public smoke: 6/6 passed.
- Accessibility: 6/6 failed.

Accessibility findings:

- `/en` desktop/mobile:
  - `button-name` critical: `button[data-dismiss="alert"]`;
  - `select-name` critical: DOB selects;
  - `color-contrast` serious;
  - `meta-viewport` moderate.
- `/en/login` desktop/mobile:
  - `color-contrast` serious;
  - `meta-viewport` moderate.
- `/en/signup` desktop/mobile:
  - `label` critical for sex radio inputs;
  - `color-contrast` serious;
  - `link-in-text-block` serious;
  - `meta-viewport` moderate.

## Human customer journey

Команда:

`npx playwright test tests/human-customer-journey.spec.ts --reporter=line`

Результат:

- Desktop failed: `/en` DOMContentLoaded `8562ms`, threshold `5000ms`.
- Mobile failed: `/en` DOMContentLoaded `8094ms`, threshold `5000ms`.

Вывод:

- Главная страница функционально открывается, но есть performance/UX risk: первое восприятие сайта медленнее порога human-tolerable warning.

## Первичная классификация для будущего отчета

Для Игоря:

- Accessibility critical issues на `/en`, `/en/login`, `/en/signup`.
- Performance warning: `/en` DOMContentLoaded > 8s в human journey.
- Admin menu `%7Burl%7D` href нужно подтвердить вручную и, если кликабельно, заменить на безопасный parent toggle.
- Verification page: проверить 404 resource и UX текста `Web-camera access is not allowed`.

Для Алексея:

- Guest/auth/legal routes в целом живые.
- User dashboard/profile/messages/groups/countries/settings в целом открываются.
- Admin surface по основным разделам открывается.
- Старые seed routes `/page/terms`, `/page/privacy`, `/connections?type=to` не использовать как source truth; актуальные routes отличаются.

Для тестировщика:

- Следующий проход должен быть не route inventory, а сценарный:
  1. guest registration/login/recovery;
  2. user profile edit + photos;
  3. user-to-user messages/likes/favorites/visits;
  4. groups lifecycle;
  5. admin core pages actions read-only first, then controlled mutations.

## Next

1. Подтвердить admin `%7Burl%7D` через клики по dropdown parent items.
2. Сделать отдельный accessibility report для `/en`, `/login`, `/signup`.
3. Сделать scenario pass по guest auth flow.
4. Сделать scenario pass по user dashboard/profile/messages.
5. После накопления 3-4 проходов собрать публичный Full Site QA dashboard.

## 2026-05-09 Scenario pass 1

Артефакты:

- JSON: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260508-214020\full-site-scenario-pass.json`
- Markdown: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260508-214020\full-site-scenario-pass.md`
- Скриншоты: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-site-scenario-pass-20260508-214020\*.png`
- Скрипт: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\playwright\scripts\full-site-scenario-pass-audit.mjs`

Команда:

`node .\scripts\full-site-scenario-pass-audit.mjs`

Результат:

- PASS: 5
- WARN: 1
- FAIL: 0
- Общий статус: `PASS_WITH_WARNINGS`

### Что проверено

PASS:

- `GUEST-LOGIN-INVALID`: login с неверными данными не приводит к 500/падению, форма сохраняет контролируемое состояние.
- `GUEST-SIGNUP-BLANK`: пустая отправка signup не приводит к 500/падению, форма сохраняет контролируемое состояние.
- `GUEST-RECOVERY-INVALID`: recovery с некорректным email не приводит к 500/падению, форма сохраняет контролируемое состояние.
- `USER-MESSAGE-RECIPIENT-DELIVERY`: отправлено тестовое сообщение от U167 к U168; API вернул `success=true`, `messageId=221`; точный текст найден в интерфейсе получателя U168.
- `USER-READONLY-CORE-SURFACES`: после login-as открылись `/en/profile`, `/en/settings/profile`, `/en/settings/photos`, `/en/settings/account`, `/en/groups`, `/en/connections/likes`, `/en/connections/encounters` без явного 404/500.

WARN:

- `ADMIN-TEMPLATE-URL`: в DOM админского меню есть ссылки с `href="{url}"`, которые в разных разделах резолвятся как `/en/%7Burl%7D`, `/en/admin/user/%7Burl%7D`, `/en/admin/message/%7Burl%7D`, `/en/admin/photo/%7Burl%7D`.
- Видимые пункты: `Finance`, `Messages`, `Content`, `Logs`, `Для розробника`.
- Контролируемый click по `Finance` на `/en/admin` не увел страницу на `{url}`, поэтому это пока не FAIL, а UX/разметочный warning.
- Рекомендация для Игоря: заменить `href="{url}"` у dropdown-parent пунктов на безопасный toggle (`#`, `javascript:void(0)` или корректный route по принятому шаблону), чтобы сканеры и пользователи не получали технический URL.

### Снятые недоказанные баги

- `/en/connections` как 404: в UI-инвентаре не найдено реальной ссылки на этот route. Актуальные UI-ссылки идут на `/en/connections/encounters`, `/en/connections/likes/from-you`, `/en/connections/likes/to-you`, `/en/connections/likes/mutual`, `/en/connections/guests`.
- `/en/connections/likes?type=to` как 400: в UI-инвентаре не найдено реальной ссылки на старый query route; актуальная ссылка — `/en/connections/likes/to-you`.

### Вывод для Игоря

На этом проходе нет нового подтвержденного функционального FAIL. Есть один подтвержденный разметочный риск в админском меню: `href="{url}"` присутствует в DOM и должен быть очищен, но текущий клик не доказал пользовательскую навигацию на 404.

### Следующий честный слой

1. Отдельный accessibility report по `/en`, `/en/login`, `/en/signup`.
2. Guest signup happy path с тестовым email и проверкой, где возникает стоп: регистрация, captcha, email confirm или профиль.
3. User-to-user сценарии: лайк, favorite, visit/guests, photo access, gift.
4. Group lifecycle: создание группы, просмотр другим пользователем, посты, участники.

## 2026-05-09 Accessibility pass

Артефакты:

- JSON: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\public-accessibility-audit-20260508-214535\public-accessibility-audit.json`
- Markdown: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\public-accessibility-audit-20260508-214535\public-accessibility-audit.md`
- Скриншоты: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\public-accessibility-audit-20260508-214535\*.png`
- Скрипт: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\playwright\scripts\public-accessibility-audit.mjs`

Команды:

- `node --check .\scripts\public-accessibility-audit.mjs`
- `node .\scripts\public-accessibility-audit.mjs`

Результат:

- Проверки: 6
- PASS: 0
- FAIL: 6
- Уникальные нарушения: `button-name`, `color-contrast`, `meta-viewport`, `select-name`, `label`, `link-in-text-block`

### Вывод для Игоря

Это не “косметика”. На публичных страницах входа/регистрации есть accessibility-блокеры, которые одновременно бьют по обычному UX:

- `/en`: critical `button-name` на `button[data-dismiss="alert"]`; critical `select-name` на `#register-form-dobday`, `#register-form-dobmonth`, `#register-form-dobyear`; serious `color-contrast`; moderate `meta-viewport`.
- `/en/login`: serious `color-contrast` на ссылках recovery/resend и кнопке; moderate `meta-viewport`.
- `/en/signup`: critical `label` на radio `input[value="1"]`, `input[value="2"]`; serious `color-contrast`; serious `link-in-text-block` на legal links; moderate `meta-viewport`.

Что исправлять:

- Добавить доступное имя кнопке закрытия alert (`aria-label` или текст).
- Добавить явные labels/aria-label к DOB selects.
- Исправить label-связи у sex radio buttons.
- Поднять контраст слабого текста/ссылок/кнопок до WCAG AA.
- Проверить viewport: не запрещать пользовательское масштабирование.
- Legal links в тексте должны отличаться не только цветом: underline или другой устойчивый визуальный признак.

### Вывод для Алексея

Главная, login и signup открываются, но качество публичного первого экрана пока не production-grade по доступности. Это важно для доверия, мобильного UX и будущей рекламы: пользователь может видеть форму, но часть элементов формально и практически слабые.

## 2026-05-09 User interactions pass

Диагностический артефакт, не считать актуальным доказательством:

- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\user-interactions-scenario-20260508-215104`
- Причина: была перепутана карта пользователей U167/U168, часть действий могла смотреть на self-profile.

Негативный диагностический артефакт, не считать багом:

- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\user-interactions-scenario-20260508-215613`
- Причина: для пары U167 -> U168 входящий лайк уже существовал до действия; `toggle-like` вернул `liked=false`, то есть скрипт снял старый лайк. Это корректная toggle-логика, а не баг доставки лайка. Скрипт после этого исправлен: если before-state уже содержит лайк, он не нажимает toggle-like и требует чистую пару.

Актуальный артефакт:

- JSON: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\user-interactions-scenario-20260508-215933\user-interactions-scenario.json`
- Markdown: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\user-interactions-scenario-20260508-215933\user-interactions-scenario.md`
- Скриншоты: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\user-interactions-scenario-20260508-215933\*.png`
- Скрипт: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\playwright\scripts\user-interactions-scenario-audit.mjs`

Команды:

- `node --check .\scripts\user-interactions-scenario-audit.mjs`
- `$env:FULL_SITE_ACTOR_USER_ID='184'; $env:FULL_SITE_TARGET_USER_ID='166'; node .\scripts\user-interactions-scenario-audit.mjs`

Результат:

- Actor: U184 `Orion Esposito`
- Target: U166 `Kaelaris Dorn Schwarz`
- PASS: 2
- PASS_SURFACE: 3
- FAIL: 0
- Общий статус: `PASS`

Что доказано:

- `USER-PROFILE-VISIT-GUESTS`: до визита U184 не было в guests у U166; после открытия профиля U166 видит `Orion Esposito` в `/en/connections/guests`.
- `USER-LIKE-RECIPIENT-SIDE`: до лайка U184 не было во входящих лайках U166; `toggle-like` вернул `{"success":true,"liked":true}`; после действия U166 видит `Orion Esposito` в `/en/connections/likes/to-you`.
- `USER-FAVORITE-ACTION-SURFACE`: на профиле найден action `/en/connections/toggle-favorite?toUserId=166`, POST вернул `success=true` и premium upsell message. Это surface/action PASS, но не полный product PASS, потому что нужен отдельный список favorites/локальная проверка состояния.
- `USER-GIFT-SURFACE`: gift form найдена на профиле.
- `USER-PHOTO-ACCESS-SURFACE`: на профиле есть признаки private/photo access, но нужен отдельный профиль с явным request access action для полного proof.

Вывод для Игоря:

- Подтвержденных багов по visit/like/favorite surface/gift surface/photo-access surface в актуальном проходе нет.
- Скрипт теперь защищен от ложного FAIL по лайку: не нажимает `toggle-like`, если входящий лайк уже есть до действия.

## 2026-05-09 Gift send pass

Артефакты:

- JSON: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\gift-send-scenario-20260508-220432\gift-send-scenario.json`
- Markdown: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\gift-send-scenario-20260508-220432\gift-send-scenario.md`
- Скриншоты: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\gift-send-scenario-20260508-220432\*.png`
- Скрипт: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\playwright\scripts\gift-send-scenario-audit.mjs`

Команды:

- `node --check .\scripts\gift-send-scenario-audit.mjs`
- `node .\scripts\gift-send-scenario-audit.mjs`

Результат:

- Actor: U184 `Orion Esposito`
- Target: U166 `Kaelaris Dorn Schwarz`
- Gift item: `224`
- Message: `QA gift 20260508-220432`
- PASS: 2
- FAIL: 0

Что доказано:

- `USER-GIFT-SEND`: `/en/gift/send` вернул `{"success":true,"message":"Gift has been sent","balance":"290"}`.
- `USER-GIFT-RECIPIENT-SIDE`: у U166 в `/en/notifications` появилась запись `Orion Esposito sent you a gift`; в собственном профиле U166 в блоке Gifts видно `From Orion Esposito`.

Вывод для Игоря:

- Отправка подарка и recipient-side отображение работают на проверенной паре U184 -> U166.

## 2026-05-09 Photo access request pass

Артефакты:

- JSON: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\photo-access-request-scenario-20260508-220808\photo-access-request-scenario.json`
- Markdown: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\photo-access-request-scenario-20260508-220808\photo-access-request-scenario.md`
- Скриншоты: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\photo-access-request-scenario-20260508-220808\*.png`
- Скрипт: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\playwright\scripts\photo-access-request-scenario-audit.mjs`

Команды:

- `node --check .\scripts\photo-access-request-scenario-audit.mjs`
- `node .\scripts\photo-access-request-scenario-audit.mjs`

Результат:

- Actor: U182 `Omkar Tiwari`
- Target: U166 `Kaelaris Dorn Schwarz`
- PASS: 2
- FAIL: 0

Что доказано:

- `USER-PHOTO-ACCESS-REQUEST`: POST `/en/profile/KaelarisDornSchwarz/request-access` вернул `success=true`.
- `USER-PHOTO-ACCESS-RECIPIENT-SIDE`: владелец U166 видит входящий request от `Omkar Tiwari` в `/en/settings/access-requests`; на странице есть actions `Approve` и `Reject`. В notifications также есть соответствующие признаки private photo access request.

Вывод для Игоря:

- Запрос доступа к приватным фото и recipient-side отображение работают на проверенной паре U182 -> U166.

## 2026-05-09 Photo access approve/reject pass

Артефакты:

- JSON: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\photo-access-action-scenario-20260508-221753\photo-access-action-scenario.json`
- Markdown: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\photo-access-action-scenario-20260508-221753\photo-access-action-scenario.md`
- Скриншоты: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\photo-access-action-scenario-20260508-221753\*.png`
- Скрипт: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\playwright\scripts\photo-access-action-scenario-audit.mjs`

Команды:

- `node --check .\scripts\photo-access-action-scenario-audit.mjs`
- `node .\scripts\photo-access-action-scenario-audit.mjs`

Результат:

- Owner: U166 `Kaelaris Dorn Schwarz`
- Approve actor: U182 `Omkar Tiwari`
- Reject actor: U168 `Caelum Rast Nielsen`
- PASS: 2
- FAIL: 0

Что доказано:

- `PHOTO-ACCESS-APPROVE`: owner action `/en/settings/photo-access-action?fromUserId=182&action=1` вернул `success=true`; у U182 в notifications есть `You now have access to Kaelaris Dorn Schwarz private photos`.
- `PHOTO-ACCESS-REJECT`: owner action `/en/settings/photo-access-action?fromUserId=168&action=2` вернул `success=true`; у U168 в notifications есть `Kaelaris Dorn Schwarz rejected your request to view private photos`.

Отдельный UX/логический риск:

- После approve/reject на owner page `/en/settings/access-requests` строки могут оставаться видимыми с кнопками `Approve` / `Reject`.
- Это не сломало сам action и уведомления, но Игорю стоит проверить, должен ли обработанный request исчезать из очереди, менять статус или блокировать повторные кнопки.

## 2026-05-09 Group lifecycle pass

Диагностические артефакты, не считать актуальными багами:

- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-lifecycle-scenario-20260508-222318`
- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-lifecycle-scenario-20260508-222910`
- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-lifecycle-scenario-20260508-223314`

Причина: первые проходы проверяли неполный сценарий. Сначала использовался неверный pretty-route для new-post, затем approve выполнялся как GET, хотя в админке action требует `data-method="post"`. После диагностики тест перестроен под фактическую логику: создать группу -> включить `allow_post` / `allow_see_members` -> создать пост -> проверить `Pending moderation` в админке -> одобрить POST-запросом -> проверить видимость вторым пользователем.

Актуальный артефакт:

- JSON: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-lifecycle-scenario-20260508-223600\group-lifecycle-scenario.json`
- Markdown: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-lifecycle-scenario-20260508-223600\group-lifecycle-scenario.md`
- Скриншоты: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-lifecycle-scenario-20260508-223600\*.png`
- Скрипт: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\playwright\scripts\group-lifecycle-scenario-audit.mjs`

Команды:

- `node --check .\scripts\group-lifecycle-scenario-audit.mjs`
- `node .\scripts\group-lifecycle-scenario-audit.mjs`

Результат:

- Owner: U184 `Orion Esposito`
- Viewer: U166 `Kaelaris Dorn Schwarz`
- Group: `QA Fullsite Group 20260508-223600`
- Alias: `qa-fullsite-group-20260508-223600`
- Post ID: `19`
- PASS: 8
- FAIL: 0
- Общий статус: `PASS`

Что доказано:

- `GROUP-CREATE`: владелец создал public group, группа открылась по alias.
- `GROUP-MANAGEMENT-ENABLE-POSTS-MEMBERS`: после включения `allow_post` и `allow_see_members` на странице появился composer поста и members-раздел.
- `GROUP-POST-CREATE-PENDING`: после отправки поста сайт вернул `highlightPostId=19`; до approve пост не виден в feed, потому что он уходит в pending moderation.
- `GROUP-POST-ADMIN-PENDING`: админская страница `/en/admin/group/posts` показывает новый пост со статусом `Pending moderation`.
- `GROUP-POST-ADMIN-APPROVE`: POST на `/en/admin/group/approve-post?id=19` переводит строку поста в `Active`.
- `GROUP-VISIBILITY-OTHER-USER`: второй пользователь видит созданную visible-группу.
- `GROUP-POST-VISIBILITY-OTHER-USER-AFTER-APPROVE`: после approve второй пользователь видит текст поста в группе.
- `GROUP-MEMBERS-PAGE`: members page открывается и показывает участников.

Вывод для Игоря:

- Подтвержденных багов в актуальном group lifecycle проходе нет.
- Важная техническая деталь для воспроизведения: `approve-post` нужно выполнять POST-запросом с CSRF; GET не меняет статус.
- Новые посты групп по текущей фактической логике не публикуются сразу, а идут в `Pending moderation`, и это надо трактовать как ожидаемый moderation lifecycle, пока ТЗ не требует иного.

## 2026-05-09 Signup happy path pass

Диагностический артефакт, не считать багом:

- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\signup-happy-path-20260508-224107`
- Причина: Playwright пытался кликнуть скрытый radio input напрямую, а видимый `span` перехватывал pointer events. Для пользовательского вывода это не доказательство бага, потому что реальный пользователь кликает видимую кнопку. Скрипт исправлен: sex выставляется через checked/change, дальше проверяется серверный happy path.

Актуальный артефакт:

- JSON: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\signup-happy-path-20260508-224201\signup-happy-path.json`
- Markdown: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\signup-happy-path-20260508-224201\signup-happy-path.md`
- Скриншоты: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\signup-happy-path-20260508-224201\*.png`
- Скрипт: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\playwright\scripts\signup-happy-path-audit.mjs`

Команды:

- `node --check .\scripts\signup-happy-path-audit.mjs`
- `node .\scripts\signup-happy-path-audit.mjs`

Результат:

- Username: `QASignup20260508224201`
- Email: `qa.signup.20260508224201@example.com`
- Country: `US`
- City: `New Orleans` / `4335045`
- PASS: 3
- FAIL: 0
- Общий статус: `PASS`

Что доказано:

- `SIGNUP-FORM-LOAD`: `/en/signup` открылась и содержит `registration-form`.
- `SIGNUP-FORM-FILL`: форма приняла валидные поля `sex`, `dob`, `name`, `username`, `country`, `city`, `email`, `password`.
- `SIGNUP-SUBMIT-HAPPY-PATH`: после submit сайт показал сообщение `Your account has been created and a message with further instructions has been sent to your email`; форма исчезла, validation errors нет.

Вывод для Игоря:

- Happy path регистрации работает при валидных данных.
- Отдельно остается accessibility-задача по radio labels/именам и DOB/country/city controls из accessibility-аудита; она не блокирует серверный signup happy path, но ухудшает качество формы.

## 2026-05-09 Profile/settings scenario pass

Диагностический артефакт, не считать актуальным багом:

- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\profile-settings-scenario-20260508-224709`
- Причина: был проверен неверный route `/en/settings/appearance`. В реальном DOM бокового меню пункт `Appearance new` ведет на `/en/appearance`, поэтому 404 по `/en/settings/appearance` был ошибкой теста, а не багом сайта.

Актуальный артефакт:

- JSON: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\profile-settings-scenario-20260508-224941\profile-settings-scenario.json`
- Markdown: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\profile-settings-scenario-20260508-224941\profile-settings-scenario.md`
- Скриншоты: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\profile-settings-scenario-20260508-224941\*.png`
- Скрипт: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\playwright\scripts\profile-settings-scenario-audit.mjs`

Команды:

- `node --check .\scripts\profile-settings-scenario-audit.mjs`
- `node .\scripts\profile-settings-scenario-audit.mjs`

Результат:

- User: U184 `Orion Esposito`
- Тестовый маркер: `QA settings save marker 20260508-224941`
- PASS: 16
- FAIL: 0
- Rollback: profile description restored `true`, notifications restored `true`
- Общий статус: `PASS`

Что доказано:

- Открываются без 404: `/en/settings/profile`, `/en/settings/photos`, `/en/settings/upload`, `/en/settings/access-requests`, `/en/settings/notifications`, `/en/settings/verification`, `/en/appearance`, `/en/settings/account`, `/en/settings/networks`, `/en/settings/blocked-users`, `/en/settings/data`.
- `PROFILE-DESCRIPTION-SAVE-READBACK`: временный маркер сохранился в `Profile[description]` после save/reload.
- `PROFILE-DESCRIPTION-ROLLBACK`: описание профиля восстановлено к исходному значению.
- `NOTIFICATIONS-TOGGLE-SAVE-READBACK`: чекбокс `Settings[receiveEmailOnPhotoView]` изменился после save/reload.
- `NOTIFICATIONS-TOGGLE-ROLLBACK`: чекбокс `Settings[receiveEmailOnPhotoView]` восстановлен к исходному значению.
- `ACCOUNT-SAFE-SURFACE-INSPECTED`: account page открывается, email/password/delete-like controls осмотрены без опасной мутации.

Вывод для Игоря:

- Подтвержденных багов в актуальном profile/settings проходе нет.
- Важная деталь: `Appearance new` находится не в `/settings`, а в `/en/appearance`.
- Пароль, email и delete account в этом проходе не менялись намеренно; они требуют отдельного destructive-safe сценария с тестовым аккаунтом и явным rollback/cleanup.

## 2026-05-09 Photo upload current settings pass

Диагностические артефакты:

- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\photo-upload-current-scenario-20260508-225452`
- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\photo-main-stage-diagnostic-20260508-230056`
- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\photo-upload-current-scenario-20260508-230450`

Зачем они были нужны:

- Первый проход поймал ошибку `From Photo Id must be an integer`, но не доказывал, на какой стадии ломается main photo upload.
- Stage diagnostic отдельно доказал цепочку: после выбора файла появляется `Crop photo and set main`, после `Next` появляется `Preview main photo`, но hidden input `name="photo"` остается пустым.
- Проход `230450` показал, что gallery upload может не создать новый ID при повторном ассете; поэтому для честной проверки были созданы полностью новые картинки `attempt-9`.

Актуальный артефакт:

- JSON: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\photo-upload-current-scenario-20260508-230637\photo-upload-current-scenario.json`
- Markdown: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\photo-upload-current-scenario-20260508-230637\photo-upload-current-scenario.md`
- Скриншоты: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\photo-upload-current-scenario-20260508-230637\*.png`
- Публичный HTML: `H:\GPT-Codex\Confideline\web\qa-reports\photo-upload-current-2026-05-09\index.html`
- Скрипт: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\playwright\scripts\photo-upload-current-scenario-audit.mjs`
- Новые ассеты:
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\photo-stories-moderation-assets\gallery-postmoderation-attempt-9.jpg`
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\photo-stories-moderation-assets\main-premoderation-attempt-9.jpg`

Команды:

- `node --check .\scripts\photo-upload-current-scenario-audit.mjs`
- `$env:PHOTO_ASSET_ATTEMPT='9'; node .\scripts\photo-upload-current-scenario-audit.mjs`

Текущие настройки из админки:

- Main profile photo moderation mode: `premoderation`
- Gallery photo moderation mode: `postmoderation`

Результат:

- User: U167 `Kaelir Tamm`
- PASS: 2
- FAIL: 1
- Общий статус: `FAIL`

Что доказано:

- `PHOTO-SETTINGS-CURRENT-MODES-READ`: текущие режимы прочитаны из `/en/admin/settings/photo`.
- `GALLERY-PHOTO-UPLOAD-CREATED-ID`: новая gallery-картинка создала photo ID `846`; запись попала в `Pending moderation`.
- `MAIN-PHOTO-UPLOAD-CREATED-ID`: новая main/profile-картинка не создала новую photo запись.

Подтвержденный баг для Игоря:

- Где: `/en/settings/photos`, блок загрузки главного фото профиля.
- Как воспроизвести: зайти под U167, выбрать новую картинку в `#main-uploaded-photo`, нажать `Next`, затем `Set main`.
- Факт по DOM: после `Next` hidden input `form#formCropMainPhoto input[name="photo"]` остается пустым.
- Факт по UI: после `Set main` страница показывает `From Photo Id must be an integer`.
- Факт по админке: новый photo ID после main upload не появился в `/en/admin/photo/index?...Photo[user_id]=167`.
- Техническая гипотеза по исходному HTML: в JS для main cropper вызывается `cropEditor.setPostParams({ fromPhotoId: $(input).data('photo-id') })`; при загрузке нового файла `photo-id` не задан, поэтому на сервер уходит пустой/undefined `fromPhotoId`.

Что не считать багом из этого прохода:

- Gallery upload в актуальном проходе работает как создание записи. Отдельный продуктовый вопрос: при `galleryMode=postmoderation` новая запись `846` находится в `Pending moderation`; если по бизнес-логике postmoderation должна публиковать сразу и только потом модерироваться, это надо проверить отдельным двухпользовательским visibility-сценарием, а не только админской очередью.

## 2026-05-09 Stories current publish-flow pass

Диагностические артефакты, не использовать как финальный вывод:

- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-second-user-visibility-20260509-current`
- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-current-visibility-20260508-231834`
- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-current-visibility-20260508-232033`
- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-existing-photo-publish-20260509-070053`
- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-existing-photo-next-diagnostic-20260509-070439`

Почему не использовать как финальный вывод:

- Старый second-user script проверял старые stories и одного заблокированного viewer, поэтому он не доказывает текущую moderation-логику.
- Две попытки загрузки story с устройства не дошли до cropper preview в headless UI; это диагностический контур, но не чистый продуктовый вывод.
- После этого был выделен более стабильный пользовательский сценарий: публикация story из уже существующего фото в modal `Place your photo on spotlight`.

Актуальный артефакт:

- JSON: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-current-publish-scenario-20260509-070717\stories-current-publish-scenario.json`
- Markdown: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-current-publish-scenario-20260509-070717\stories-current-publish-scenario.md`
- Скриншоты: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-current-publish-scenario-20260509-070717\*.png`
- Скрипт: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\playwright\scripts\stories-current-publish-scenario-audit.mjs`

Команды:

- `node --check .\scripts\stories-current-publish-scenario-audit.mjs`
- `node .\scripts\stories-current-publish-scenario-audit.mjs`

Текущие настройки из админки:

- Turn on stories: `true`
- Stories moderation mode: `postmoderation`
- Time when user can publish next story: `1`

Результат:

- Author: U184 `OrionEsposito`
- Viewer: U166 `KaelarisDornSchwarz`
- PASS: 2
- FAIL: 3
- Общий статус: `FAIL`

Что доказано:

- `STORIES-CURRENT-SETTINGS`: настройки stories прочитаны из `/en/admin/settings/stories`.
- `STORIES-EXISTING-PHOTO-MODAL`: в modal есть existing photo radio inputs, то есть пользовательский путь публикации из существующего фото доступен.
- `STORIES-EXISTING-PHOTO-NEXT-OPENS-CROPPER`: после выбора existing photo и клика `Next` modal закрывается, но cropper/preview не открывается.
- Console/network evidence: UI пишет `Selected photo for crop: https://hugs-project.../EdBIIB4pwmFKoKqeJ__DDxs8DoKPPVzz.webp`, S3 image fetch возвращает `200`, ошибок dialog/pageerror нет.
- `STORIES-AUTHOR-VISIBILITY-AFTER-PUBLISH`: story у автора не появилась, потому что publish-flow не дошел до cropper/preview.
- `STORIES-VIEWER-VISIBILITY-AFTER-PUBLISH`: story у второго пользователя не появилась; это следствие блокера публикации, а не отдельное доказательство бага postmoderation visibility.

Подтвержденный баг для Игоря:

- Где: `/en`, horizontal stories/spotlight carousel, кнопка `Add me`, modal `Place your photo on spotlight`.
- Как воспроизвести: зайти под U184, нажать `Add me`, выбрать existing photo radio, нажать `Next`.
- Факт: modal закрывается, но не открывается ни `#modal-inline-cropper`, ни `#modal-inline-preview`.
- Факт: story не создается и не появляется ни у автора, ни у второго пользователя.
- Техническая точка: обработчик `#spotlight-submit-form submit` доходит до `fetch(imageUrl)` и получает `200`, но после установки `File` в `#general-uploaded-image` не происходит ожидаемый переход в `formStoriesMedia afterValidateAttribute -> cropEditor.run(inputEl)`.

Что не считать доказанным этим проходом:

- Этот тест не доказывает, что `postmoderation` неправильно управляет видимостью stories. До проверки видимости нужно сначала починить или обойти блокер публикации story.

## 2026-05-09 Stories device upload cropper full pass

Актуальный финальный артефакт:

- Public HTML: `H:\GPT-Codex\Confideline\web\qa-reports\stories-device-upload-cropper-2026-05-09\index.html`
- JSON: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-device-upload-cropper-scenario-20260509-074434\stories-device-upload-cropper-scenario.json`
- Markdown: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-device-upload-cropper-scenario-20260509-074434\stories-device-upload-cropper-scenario.md`
- Скриншоты: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-device-upload-cropper-scenario-20260509-074434\*.png`
- Скрипт: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\playwright\scripts\stories-device-upload-cropper-scenario-audit.mjs`

Команды:

- `node --check .\playwright\scripts\stories-device-upload-cropper-scenario-audit.mjs`
- `$env:STORIES_AUTHOR_ID='182'; $env:STORIES_AUTHOR_DISPLAY_NAME='Omkar Tiwari'; $env:STORIES_AUTHOR_USERNAME='OmkarTiwari'; node .\playwright\scripts\stories-device-upload-cropper-scenario-audit.mjs`

Почему это новый финальный вывод:

- Предыдущая формулировка про ограничения cropper была неверной. Cropper тестируется автоматически, если дождаться `window.cropEditor._cropper`, затем `window.cropEditor._croppedBlob`, затем network response `/en/balance/spotlight-submit`.
- U184 нельзя было повторно использовать сразу, потому что сайт честно вернул cooldown: `Sorry, you recently published story. You can try later.`
- Админская настройка `allowedTimeNextStory=0` не сохранилась: после save значение осталось `1`. Поэтому повторный запуск выполнен на другом подходящем тестовом пользователе.

Текущие настройки из админки:

- Turn on stories: `true`
- Stories moderation mode: `postmoderation`
- Time when user can publish next story: `1`

Результат:

- Author: U182 `OmkarTiwari`
- Viewer: U166 `KaelarisDornSchwarz`
- PASS: 6
- FAIL: 0
- Общий статус: `PASS`

Что доказано:

- `STORIES-CURRENT-SETTINGS`: настройки stories прочитаны из `/en/admin/settings/stories`.
- `STORIES-DEVICE-CROPPER-OPEN`: device upload новой JPG открывает cropper; `cropperReady=true`.
- `STORIES-DEVICE-PREVIEW`: после `Next` создан cropped blob; `croppedBlobReady=true`.
- `STORIES-DEVICE-UPLOAD`: publish отправил story на сервер; `/en/balance/spotlight-submit` вернул 2xx.
- Баланс U182 изменился `200 -> 150`, значит операция реально применена.
- `STORIES-AUTHOR-VISIBILITY`: автор U182 видит свою story в пользовательской horizontal stories ленте.
- `STORIES-VIEWER-VISIBILITY`: второй пользователь U166 видит story U182 в своей horizontal stories ленте.

Актуальный вывод для Игоря:

- Device upload/cropper/publish для stories в режиме `postmoderation` работает на текущем live-сайте.
- Видимость story проверена правильно: не по admin media queue, а через пользовательскую ленту автора и второго пользователя.
- Отдельный баг остается только по сценарию публикации story из existing photo: modal закрывается после `Next`, но cropper/preview не открывается.

## 2026-05-09 Recheck старых ограничений и частичных выводов

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\limitations-recheck-2026-05-09\index.html`

Что перепроверено:

- Stories device upload/cropper: старое ограничение снято. PASS доказан отдельным проходом `stories-device-upload-cropper-scenario-20260509-074434`.
- Gallery photo postmoderation visibility: старое ограничение “только admin queue, нет author/viewer proof” закрыто. PASS: конкретный upload token `/1/LnJB3qF52ru5q8ovpCpk6rE5z6XYmK12.webp` найден у автора в `/en/settings/photos`, у автора в `/en/profile/KaelirTamm` и у второго пользователя U166 в `/en/profile/KaelirTamm`.
- Premium `messagesOutPremium*`: свежий проход `premium-messages-recipient-delivery-audit-20260509-081438` снова подтвердил FAIL с rollback. При лимите `1` три отправки приняты, 2 из 3 точных текста найдены у получателей. Это не “частично не доказано”, а подтвержденный баг лимита с recipient-side proof для доставленных сообщений.
- Group posts reopen/show: свежий проход `group-posts-moderation-audit-20260509-081059` подтвердил, что hide переводит пост в Hidden, а reopen/show action в проверенной строке не найден. Пост 19 был восстановлен через `approve-post` POST; побочный эффект теста снят. Текущий статус: WARN/product gap, нужна явная кнопка повторного открытия или подтверждение, что approve-post и есть восстановление.
- Admin template href `{url}`: свежий `full-site-scenario-pass-20260509-081059` снова нашел шаблонный href в DOM, но клик не доказал пользовательскую навигацию в 404. Текущий статус: WARN markup debt, не functional FAIL.

Инфраструктура тестов:

- Исправлены дефолтные пути в скриптах, чтобы они запускались из `qa-ba-autonomous-tester` без ручного `ADMIN_STORAGE_STATE`: `full-site-scenario-pass-audit.mjs`, `group-posts-moderation-audit.mjs`, `premium-messages-recipient-delivery-audit.mjs`.
- Синтаксис всех трех скриптов проверен через `node --check`.

Новое правило качества:

- Любая формулировка “не доказано”, “частично”, “ограничение”, “нужен второй пользователь” не является финальным результатом. Она должна попадать в recheck backlog и закрываться живым Yii2-сценарием: CSRF/POST/AJAX корректны, before/after состояние зафиксировано, при user-to-user есть проверка со стороны получателя.

## 2026-05-09 Premium no-debt recheck

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\premium-no-debt-recheck-2026-05-09\index.html`

Raw evidence:

- `H:\GPT-Codex\Confideline\web\qa-reports\premium-no-debt-recheck-2026-05-09\raw\premium-no-debt-recheck.json`
- Screenshots: `H:\GPT-Codex\Confideline\web\qa-reports\premium-no-debt-recheck-2026-05-09\evidence\*.png`
- Скрипт: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\playwright\scripts\premium-no-debt-recheck-audit.mjs`

Команды:

- `node --check .\scripts\premium-no-debt-recheck-audit.mjs`
- `node .\scripts\premium-no-debt-recheck-audit.mjs`

Результат:

- Общий статус: `FAIL`
- Rollback Premium settings: `OK`
- `PREMIUM-SETTINGS-FIELDS`: PASS. Спорные поля `editSentMessageOn`, `timerInMutualOn`, `swipeBackOn`, `countryPremiumPriceOn`, `messagesOutPremiumMen` найдены в live DOM `/en/admin/settings/premium`.
- `PREMIUM-SETTINGS-READBACK`: PASS. Yii2 form submit с CSRF сохраняет тестовые значения и читает их обратно.
- `PREMIUM-MESSAGES-OUT-RECIPIENT-SIDE`: FAIL. При `messagesOutPremiumMen/Women=1` premium user U182 сделал 4/4 успешные отправки разным получателям; все 4 точных QA-текста видны у получателей U166/U167/U168/U165.
- `PREMIUM-EDIT-SENT-MESSAGE-ON`: FAIL. При `editSentMessageOn=1` отправленное сообщение видно отправителю, но edit/update action рядом с сообщением в `/en/messages` не найден.
- `PREMIUM-TIMER-IN-MUTUAL-ON`: FAIL. При `timerInMutualOn=1` и mutual-like паре U182/U184 страница `/en/connections/likes/mutual` открывается, но явный timer/expires marker не найден.
- `PREMIUM-SWIPE-BACK-ON`: PASS. При `swipeBackOn=1` в `/en/connections/encounters` найден back/undo action.
- `PREMIUM-COUNTRY-PRICE-ON`: FAIL после точного recheck. Прежний PASS был методической ошибкой: сравнение полного body поймало QA overlay, а не изменение цены. Точный `country-price-precise-recheck.json` показывает, что `.feature-price/.feature-title` одинаковые при `countryPremiumPriceOn=1` и `countryPremiumPriceOn=0`; rollback OK.

Что это заменяет:

- Старые формулировки `NOT PROVEN`, `частично`, `нужен второй пользователь` по этим Premium-пунктам больше не использовать как финальный вывод.
- Для Игоря текущие actionable items: `PREMIUM-MESSAGES-OUT-LIMIT-001`, `PREMIUM-EDIT-SENT-MESSAGE-001`, `PREMIUM-TIMER-IN-MUTUAL-001`, `PREMIUM-COUNTRY-PRICE-001`.

## 2026-05-09 Group avatar/cover moderation no-debt pass

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\group-media-moderation-modes-2026-05-09\index.html`

Raw evidence:

- `H:\GPT-Codex\Confideline\web\qa-reports\group-media-moderation-modes-2026-05-09\raw\group-media-moderation-modes-audit.json`
- Screenshots: `H:\GPT-Codex\Confideline\web\qa-reports\group-media-moderation-modes-2026-05-09\evidence\*.png`
- Скрипт: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\playwright\scripts\group-media-moderation-modes-audit.mjs`

Команды:

- `node --check .\scripts\group-media-moderation-modes-audit.mjs`
- `node .\scripts\group-media-moderation-modes-audit.mjs`

Контур:

- Запуск выполнен в отдельном `chromium.launch({ headless: true })` контексте со своим `storageState`, без подключения к общему CDP-браузеру.
- Для каждого режима использованы 3 разные картинки для avatar/logo и 3 разные картинки для cover.
- Проверены: user upload, admin media approvals, публичная страница группы `/en/groups/qa-moderation-probe-1777790356509` от owner U167 и viewer U166.
- Settings rollback: original/restored avatar/cover modes `premoderation / premoderation`.

Результат:

- Общий статус публичного отчета после корректировки thumbnail-сравнения: `WARN`.
- `GROUP-MEDIA-PREMODERATION-PUBLIC-VISIBILITY`: PASS. В premoderation submitted avatar/cover не появились публично до approve; admin statuses `Rejected/Rejected`.
- `GROUP-MEDIA-POSTMODERATION-COVER-PUBLIC-VISIBILITY`: PASS. Cover видна owner/viewer после загрузки.
- `GROUP-MEDIA-POSTMODERATION-AVATAR-PUBLIC-VISIBILITY`: PASS. Avatar/logo публично виден owner/viewer как `thumb_<token>.webp`; прежний FAIL был ошибкой сравнения только с исходным full-size path.
- `GROUP-MEDIA-NONE-COVER-PUBLIC-VISIBILITY`: PASS. Cover видна owner/viewer после загрузки.
- `GROUP-MEDIA-NONE-AVATAR-PUBLIC-VISIBILITY`: PASS. Avatar/logo публично виден owner/viewer как `thumb_<token>.webp`; прежний FAIL был ошибкой сравнения только с исходным full-size path.
- `GROUP-MEDIA-NONE-STILL-IN-QUEUE`: WARN. В режиме `none` строки остаются в `/en/admin/group/media-approvals`; нужно подтвердить, это история или лишняя очередь.

Актуальный вывод для Игоря:

- Avatar/logo rendering на публичной странице группы работает: проверять нужно thumbnail-вариант `thumb_<token>.webp`, а не только full-size path.
- Остается проверить, должен ли режим `none` показывать записи в admin media approvals. Если это история, UI должен ясно отличать history от queue.

## 2026-05-09 Photo upload current recheck

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\photo-upload-current-2026-05-09\index.html`

Raw evidence:

- `H:\GPT-Codex\Confideline\web\qa-reports\photo-upload-current-2026-05-09\raw\photo-upload-current-scenario-20260509-094742.json`
- Screenshots: `H:\GPT-Codex\Confideline\web\qa-reports\photo-upload-current-2026-05-09\assets\*.png`
- Скрипт: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\playwright\scripts\photo-upload-current-scenario-audit.mjs`

Контур:

- Скрипт нормализован на абсолютные пути через `__dirname`, запуск не зависит от cwd и не использует общий CDP-браузер.
- User: U167 `KaelirTamm`.
- Current settings: main photo `premoderation`, gallery photo `postmoderation`.

Результат:

- Общий статус: `FAIL`.
- `PHOTO-SETTINGS-CURRENT-MODES-READ`: PASS.
- `GALLERY-PHOTO-UPLOAD-CREATED-ID`: PASS. Gallery upload создал новую photo запись, свежий pending ID `849` виден в admin photos.
- `MAIN-PHOTO-UPLOAD-CREATED-ID`: FAIL. Main/profile upload не создает новую photo запись.

Актуальный вывод для Игоря:

- Баг main/profile photo upload воспроизводится повторно: после выбора файла cropper открывается, после `Next` preview открывается, но hidden input `photo` остается пустым.
- Финальный `Set main` получает пустой photo id и показывает `From Photo Id must be an integer`.
- Проверить JS цепочку main-photo cropper: `cropEditor.setPostParams`, `fromPhotoId=undefined`, заполнение hidden `form#formCropMainPhoto input[name="photo"]`.

## 2026-05-09 Stories existing-photo corrected recheck

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\stories-current-publish-2026-05-09\index.html`

Raw evidence:

- `H:\GPT-Codex\Confideline\web\qa-reports\stories-current-publish-2026-05-09\raw\stories-current-publish-scenario-20260509-095343.json`
- Screenshots: `H:\GPT-Codex\Confideline\web\qa-reports\stories-current-publish-2026-05-09\assets\*.png`
- Скрипт: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\playwright\scripts\stories-current-publish-scenario-audit.mjs`

Контур:

- Скрипт нормализован на абсолютные пути через `__dirname`, запуск не зависит от cwd и не использует общий CDP-браузер.
- Методическая ошибка исправлена: если existing-photo flow не дошел до publish, author/viewer visibility не может быть `PASS`; такие проверки маркируются `INVALID`.
- Current settings: stories on `true`, mode `postmoderation`, `allowedTimeNextStory=1`.

Результат:

- Общий статус: `FAIL`.
- `STORIES-CURRENT-SETTINGS`: PASS.
- `STORIES-EXISTING-PHOTO-MODAL`: PASS. В modal найдено 2 existing-photo radio inputs.
- `STORIES-EXISTING-PHOTO-NEXT-OPENS-CROPPER`: FAIL. После выбора photo radio и `Next` modal закрывается, S3 image fetch возвращает `200`, но cropper/preview не открывается.
- `STORIES-AUTHOR-VISIBILITY-AFTER-PUBLISH`: INVALID. Новая story не опубликована, старые story-card нельзя считать доказательством.
- `STORIES-VIEWER-VISIBILITY-AFTER-PUBLISH`: INVALID. Новая story не опубликована, второй пользователь не доказывает новую story.

Актуальный вывод для Игоря:

- Проверить JS обработчик `#spotlight-submit-form submit`: после `fetch(imageUrl)=200` и установки `File` в `#general-uploaded-image` должен сработать `formStoriesMedia afterValidateAttribute -> cropEditor.run(inputEl)`.
- Текущий факт: modal закрывается, но cropper/preview не стартует.

## 2026-05-09 Bans/shadow-ban current pass

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\bans-current-2026-05-09\index.html`

Raw evidence:

- `H:\GPT-Codex\Confideline\web\qa-reports\bans-current-2026-05-09\raw\ban-behavior-current-20260509-095600.json`
- Screenshots: `H:\GPT-Codex\Confideline\web\qa-reports\bans-current-2026-05-09\assets\*.png`
- Скрипт: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\playwright\scripts\ban-behavior-current-audit.mjs`

Контур:

- Скрипт нормализован на абсолютные пути через `__dirname`, запуск не зависит от cwd и не использует общий CDP-браузер.
- Проверены U1/U2/Admin стороны для full ban и shadow ban.
- Cleanup выполнен: shadow ban `#21` снят, full ban `#22` снят.

Результат:

- Общий статус: `PASS`.
- Checks: 15 PASS, 0 FAIL.
- Findings: 0.

Что доказано:

- До shadow-ban U2 получает сообщение U1.
- При shadow-ban U1 не видит явного бана и может пользоваться основными страницами.
- Во время shadow-ban outbound сообщение U1 не появляется у U2.
- Во время shadow-ban inbound сообщение U3 не появляется у U1.
- Во время shadow-ban лайк U1 не появляется во входящих лайках U2.
- После снятия shadow-ban сообщение, отправленное во время бана, не всплывает у U2.
- После снятия shadow-ban новые сообщения U1->U2 снова доставляются.
- Full-ban явно ограничивает пользовательскую поверхность.
- Сообщение full-banned пользователя не доставляется U2.
- После снятия full-ban новые сообщения снова доставляются.

Остаток большой матрицы:

- Этот current pass закрывает ядро сообщений/лайков/видимости/cleanup. Для полного покрытия всей матрицы Игоря отдельными проходами нужно еще добить gifts, photo access, groups/posts/stories внутри shadow-ban, если их считать обязательными для текущего релиза.

## 2026-05-09 Full-site smoke pass

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\full-site-smoke-2026-05-09\index.html`

Raw evidence:

- `H:\GPT-Codex\Confideline\web\qa-reports\full-site-smoke-2026-05-09\raw\full-site-scenario-pass-20260509-100617.json`
- Screenshots: `H:\GPT-Codex\Confideline\web\qa-reports\full-site-smoke-2026-05-09\assets\*.png`
- Скрипт: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\playwright\scripts\full-site-scenario-pass-audit.mjs`

Контур:

- Скрипт нормализован на абсолютные пути через `__dirname`, запуск не зависит от cwd и не использует общий CDP-браузер.
- Проверены guest validation, user-to-user message delivery, core readonly user surfaces, admin template href scan.

Результат:

- Общий статус: `PASS_WITH_WARNINGS`.
- PASS: invalid guest login validation.
- PASS: blank signup validation.
- PASS: invalid recovery validation.
- PASS: user message recipient delivery.
- PASS: core readonly user surfaces.
- WARN: `ADMIN-TEMPLATE-URL` по admin href `{url}`. Это markup debt, но не доказанный functional FAIL.

## 2026-05-09 Igor root-cause handoff

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\igor-root-cause-handoff-2026-05-09\index.html`

Назначение:

- Это не новый functional run, а техническая сводка для Игоря по подтвержденным `FAIL/WARN`.
- Формат: что доказано live-браузером, где искать в Yii2/PHP views/assets/actions, как воспроизвести, какой минимальный ретест нужен после фикса.
- Важная оговорка: code pointers взяты из локального слепка `Chat\youdate-2.0.2-yii2\Source\youdate_extracted`; если live-код уже отличается, использовать их как направление поиска, а не как абсолютную строку фикса.

Покрытые дефекты/решения:

- `PREMIUM-MESSAGES-OUT-LIMIT-001`: смотреть `/en/messages/create`, `MessagesController::actionCreate`, `MessageManager::createMessage`; в локальном слепке перед save не найден enforcement `messagesOutPremium*`.
- `PREMIUM-EDIT-SENT-MESSAGE-001`: смотреть message item UI/JS; найден create flow, edit flow для исходящего сообщения не найден.
- `PREMIUM-TIMER-IN-MUTUAL-001`: смотреть `connections/likes` views/provider и привязку `timerInMutualOn`.
- `PREMIUM-COUNTRY-PRICE-001`: смотреть `BalanceManager::getPremiumPrice()` и `balance/services`; локальный слепок возвращает общий `common.pricePremium`.
- `MAIN-PHOTO-UPLOAD-CREATED-ID-001`: смотреть main photo cropper; `fromPhotoId` берется из `data('photo-id')`, при новой загрузке значение отсутствует, hidden `photo` остается пустым.
- `STORIES-EXISTING-PHOTO-NEXT-001`: смотреть live AssetBundle/JS для `#spotlight-submit-form`, `#general-uploaded-image`, `formStoriesMedia`, `cropEditor.run`; локальный widget и live flow расходятся.
- `GROUP-MEDIA-NONE-STILL-IN-QUEUE`: product/UI decision, не функциональный fail по видимости.
- `ADMIN-TEMPLATE-URL`: markup debt по незамененному href `{url}`.

## 2026-05-09 UX/UI audit of QA reports

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\ux-ui-audit-2026-05-09\index.html`

Что проверено:

- Удобство публичного QA-каталога для двух ролей: Алексей как постановщик/приемка, Игорь как разработчик.
- Читаемость статусов, риск устаревших отчетов, качество handoff и evidence.

Исправлено сразу:

- Старые активные карточки `Bans full 2026-05-07`, `Moderation full 2026-05-07`, `Premium/free controls 2026-05-06` перенесены из основного активного списка каталога в архив. Актуальные источники теперь: current bans, current photo/stories/groups, premium no-debt recheck, Igor handoff.
- В `web\qa-reports\qa-report.css` добавлены переносы/ограничения для badge/topline/screenshot status, чтобы длинные статусы не ломали карточки.
- В `premium-no-debt-recheck-2026-05-09` исправлена противоречивая строка по `countryPremiumPriceOn`: теперь текст соответствует FAIL.

Остаточные UX-долги:

- `QA-UX-INLINE-CSS-001`: новые generated reports используют разный inline CSS; нужен единый шаблон генерации.
- `QA-UX-SCREENSHOT-ANNOTATION-001`: не все свежие screenshots имеют стрелки/рамки прямо на изображении; для финальных FAIL/WARN это должно стать обязательным.
- `QA-UX-SOURCE-OF-TRUTH-001`: старые отчеты должны получать banner `ARCHIVE / replaced by ...`, чтобы их нельзя было случайно передать как актуальные.

## 2026-05-09 Shadow-ban extended matrix recheck

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\shadow-ban-extended-matrix-2026-05-09\index.html`

Raw evidence:

- `H:\GPT-Codex\Confideline\web\qa-reports\shadow-ban-extended-matrix-2026-05-09\raw\shadow-ban-extended-matrix-20260509-110749.json`
- Screenshots: `H:\GPT-Codex\Confideline\web\qa-reports\shadow-ban-extended-matrix-2026-05-09\screens\*.png`
- Скрипт: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\playwright\scripts\shadow-ban-extended-matrix-audit.mjs`

Что исправлено в тестовом контуре перед финальным прогоном:

- Gift больше не тестируется на грязном балансе: U1 пополняется через `/en/admin/user/update-balance?id=165`, и баланс фиксируется в evidence.
- Recipient-side gift проверяется по уникальному сообщению текущего прогона, а не по старым совпадениям имени пользователя.
- Photo access проверяется сравнением owner-side состояния `before/after`, чтобы старые входящие совпадения не становились ложным FAIL.
- Group create использует реальную Yii2-форму страницы `/en/group/create`, включая `Group[alias]`.
- Group post submit идет через DOM submit формы `form#post-form`, а не через искусственный fetch с `redirect: manual`.
- Добавлен baseline group-post обычным пользователем до shadow-ban.

Результат:

- Общий статус: `WARN`.
- PASS: shadow-ban создан и подтвержден `active_ban_id`.
- PASS: профиль U1 скрыт от U2 во время shadow-ban и снова виден после release.
- PASS: gift во время shadow-ban выглядит успешным для U1 и не создает нового видимого recipient-side эффекта у U2.
- PASS: photo access во время shadow-ban выглядит успешным для U1 и не создает нового видимого входящего эффекта у владельца.
- PASS: группа U1 во время shadow-ban видна самому U1 и скрыта от viewer.
- PASS: cleanup, после теста `active_ban_id=false`.
- WARN: baseline gift до shadow-ban не дал сильного recipient-side evidence по уникальному сообщению.
- WARN: group post publication gap: обычный пользователь до shadow-ban получает `highlightPostId`, но owner-side feed показывает `No posts yet`; поэтому shadow group-post нельзя считать отдельным shadow-ban багом без фикса/решения по group posts.

## 2026-05-09 New pages QA pass

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\new-pages-pass-2026-05-09\index.html`

Raw evidence:

- `H:\GPT-Codex\Confideline\web\qa-reports\new-pages-pass-2026-05-09\raw\profile\profile-settings-scenario.json`
- `H:\GPT-Codex\Confideline\web\qa-reports\new-pages-pass-2026-05-09\raw\interactions\user-interactions-scenario.json`
- `H:\GPT-Codex\Confideline\web\qa-reports\new-pages-pass-2026-05-09\raw\gift\gift-send-scenario.json`
- `H:\GPT-Codex\Confideline\web\qa-reports\new-pages-pass-2026-05-09\raw\photoAccess\photo-access-request-scenario.json`
- `H:\GPT-Codex\Confideline\web\qa-reports\new-pages-pass-2026-05-09\raw\groups\group-lifecycle-scenario.json`

Покрытие:

- PASS: `/en/settings/profile`, `/en/settings/photos`, `/en/settings/upload`, `/en/settings/access-requests`, `/en/settings/notifications`, `/en/settings/verification`, `/en/appearance`, `/en/settings/account`, `/en/settings/networks`, `/en/settings/blocked-users`, `/en/settings/data` открываются без 404.
- PASS: profile description save/readback и rollback.
- PASS: notifications checkbox save/readback и rollback.
- PASS: like U167 -> U168 виден recipient-side.
- PASS: gift send и recipient-side evidence.
- PASS: photo access request и owner-side evidence.
- PASS: group lifecycle: create, management flags, post pending, admin pending queue, approve, viewer group visibility, viewer post visibility after approve, members page.

Остаток:

- WARN: общий interaction smoke не доказал guest visit signal как PASS. Это не новый functional FAIL; при необходимости нужен отдельный guests-focused проход с before/after счетчиками.

## 2026-05-09 Public/Auth + Accessibility

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\public-auth-accessibility-2026-05-09\index.html`

Raw evidence:

- `H:\GPT-Codex\Confideline\web\qa-reports\public-auth-accessibility-2026-05-09\raw\signup-happy-path.json`
- `H:\GPT-Codex\Confideline\web\qa-reports\public-auth-accessibility-2026-05-09\raw\public-accessibility-audit.json`
- Screenshots: `H:\GPT-Codex\Confideline\web\qa-reports\public-auth-accessibility-2026-05-09\assets\*.png`

Что исправлено в тестовом контуре:

- Signup-тест больше не делает ложный FAIL, если не выставлены `Country/City`: добавлена работа с Yii2/selectize через `select.selectize`, before-submit проверка значений формы и устойчивый `requestSubmit()`.
- Загрузка `/en/signup` переведена на `waitUntil: commit` + bounded `domcontentloaded`, чтобы долгие ассеты не зависали и не ломали прогон.

Результат:

- Общий статус: `FAIL`, потому что accessibility-дефекты подтверждены.
- PASS: `/en/signup` happy path. Новый пользователь `QASignup20260509174136` создан; сервер показал `Your account has been created`, validation errors нет.
- FAIL: `/en` accessibility. `button[data-dismiss="alert"]` без доступного имени, weak contrast, `select-name`, `meta-viewport`.
- FAIL: `/en/login` accessibility. Weak contrast у ссылок/кнопки и `meta-viewport`.
- FAIL: `/en/signup` accessibility. Sex radio inputs без корректных labels, terms/privacy/cookie links отличаются только цветом, weak contrast, `meta-viewport`.

Действие для Игоря:

- Чинить в Yii2 PHP views/CSS публичных страниц: alert close button accessible name, signup sex radio labels, dob select names, link contrast, non-color-only link affordance, meta viewport zoom.

## 2026-05-09 Discovery surfaces QA

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\discovery-surfaces-2026-05-09\index.html`

Raw evidence:

- `H:\GPT-Codex\Confideline\web\qa-reports\discovery-surfaces-2026-05-09\raw\discovery-surfaces.json`
- Screenshots: `H:\GPT-Codex\Confideline\web\qa-reports\discovery-surfaces-2026-05-09\assets\*.png`

Что исправлено в тестовом контуре:

- Playwright `chromium.launch()` в текущей среде зависал на headless pipe; для этого прохода поднят отдельный Chrome QA-профиль на CDP `9444`, не общий `9224`.
- Убраны guessed routes `/en/connections` и `/en/connections/likes?type=to`; сценарий использует реальные навигационные surfaces: `/en/dashboard`, `/en`, `/en/browse`, `/en/connections/likes`, `/en/connections/encounters`, `/en/countries`, `/en/groups`.
- Исправлен ложный classifier: текст `Users not found` на нормальном empty state больше не считается `404`.

Результат:

- Общий статус: `PASS`.
- PASS: `/en/dashboard` открывается авторизованным пользователем, показывает dashboard/discovery blocks.
- PASS: `/en` открывается авторизованным пользователем и показывает dashboard content.
- PASS: `/en/browse` открывается, title `Find People`, есть form/cards.
- PASS: `/en/connections/likes` открывается, title `Likes`, есть cards/empty states.
- PASS: `/en/connections/encounters` открывается, title `Encounters`, есть encounter content.
- PASS: `/en/countries` открывается, h1 `Countries`, есть country cards.
- PASS: `/en/groups` открывается, h1 `Groups`, есть group cards.
- Для Игоря новых подтвержденных дефектов нет.

BA / рекомендации для Алексея:

- `Важно, но не срочно`: discovery-поверхности нужно продолжать оценивать как продуктовый сценарий, а не route inventory. HTTP 200 не доказывает пользовательскую ценность; в следующих слоях фиксировать, что пользователь увидел и какое следующее действие доступно.

## 2026-05-10 Detail surfaces QA

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\detail-surfaces-2026-05-10\index.html`

Raw evidence:

- `H:\GPT-Codex\Confideline\web\qa-reports\detail-surfaces-2026-05-10\raw\detail-surfaces.json`
- Screenshots: `H:\GPT-Codex\Confideline\web\qa-reports\detail-surfaces-2026-05-10\assets\*.png`

Что исправлено в тестовом контуре:

- Detail-тест больше не считает невидимые/шаблонные href пользовательским дефектом: собираются только visible links с DOM box, className и HTML-фрагментом.
- Group detail matcher приведен к фактическому Yii2 route `groups/<alias>`, а не к guessed route `/group/<id>`.
- Контентные вопросы EN-разделов выводятся в BA-матрицу для Алексея, а не в доску Игоря как неподтвержденный дефект.

Результат:

- Общий статус: `PASS`.
- PASS: видимая ссылка профиля открывает `/en/profile`, h1 `Kaelir Tamm`, 200.
- PASS: `/en/country/armenia`, `/en/country/estonia`, `/en/country/azerbaijan` открываются с корректными h1 и без 404/login redirect.
- PASS: `/en/groups/pogoda-na-gorizonte`, `/en/groups/gruppa-dla-sbora-deneg`, `/en/groups/test` открываются из карточек групп и не дают 404/login redirect.
- Для Игоря новых подтвержденных дефектов нет.

BA / рекомендации для Алексея:

- `Важно, но не срочно`: на `/en/countries`, `/en/profile` и части `/en/groups/...` заметен русский контент. Нужно product decision: EN-контур сейчас технически рабочий, но контентно не готов, либо заводить отдельную задачу на разделение контента по языкам.

## 2026-05-10 User interactions QA

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\user-interactions-2026-05-10\index.html`

Raw evidence:

- `H:\GPT-Codex\Confideline\web\qa-reports\user-interactions-2026-05-10\raw\user-interactions-scenario.json`
- Screenshots: `H:\GPT-Codex\Confideline\web\qa-reports\user-interactions-2026-05-10\assets\*.png`

Что исправлено в тестовом контуре:

- `user-interactions-scenario-audit.mjs` переведен на опциональный CDP endpoint `INTERACTIONS_CDP_URL` / `FULL_SITE_CDP_URL`.
- CDP persistent context больше не закрывается между user-switching шагами; закрывается только страница, а не весь контекст.
- Статус отчета теперь учитывает `result.errors`, чтобы runtime-error не мог ошибочно стать `PASS`.
- Перед строгим прогоном найден clean pair: U166 -> U168, где before-state не содержит actor ни в guests, ни во входящих лайках.

Результат:

- Общий статус: `PASS`.
- PASS: до визита U168 не видит U166 в guests; после открытия профиля U168 пользователем U166 карточка U166 появляется у U168 в guests.
- PASS: до лайка U168 не видит U166 во входящих лайках; после like U166 -> U168 карточка U166 появляется у U168 в `People who likes you`.
- PASS_SURFACE: favorite action найден и POST успешен.
- PASS_SURFACE: gift form/actions найдены на профиле.
- PASS_SURFACE: photo access/private признаки найдены на профиле.
- Для Игоря новых подтвержденных дефектов нет.

BA / рекомендации для Алексея:

- `Важно, но не срочно`: для visits/likes/favorites нужен пул чистых user pairs или автоматический поиск пары с before-state `not contains`, иначе тест превращается в WARN и не доказывает новое действие.

## 2026-05-10 Continued QA: messages and group posts

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\continued-testing-2026-05-10\index.html`

Raw evidence:

- `H:\GPT-Codex\Confideline\web\qa-reports\continued-testing-2026-05-10\raw\premium-messages-recipient-delivery-audit.json`
- `H:\GPT-Codex\Confideline\web\qa-reports\continued-testing-2026-05-10\raw\group-posts-moderation-audit.json`
- `H:\GPT-Codex\Confideline\web\qa-reports\continued-testing-2026-05-10\raw\restore-premium-message-limits.json`
- Screenshots: `H:\GPT-Codex\Confideline\web\qa-reports\continued-testing-2026-05-10\assets\*.png`

Что исправлено в тестовом контуре:

- `premium-messages-recipient-delivery-audit.mjs` и `group-posts-moderation-audit.mjs` по умолчанию используют изолированный `chromium.launch()`.
- Общий CDP теперь остается только диагностическим режимом через `CONFIDELINE_QA_USE_CDP=1`.
- Добавлен аварийный helper `restore-premium-message-limits.mjs` для возврата `messagesOutPremiumMen=99`, `messagesOutPremiumWomen=99`, `messagesOutPeriod=24`.

Результат:

- Общий статус: `FAIL + WARN`.
- FAIL: при лимите `messagesOutPremiumMen=1`, `messagesOutPremiumWomen=1`, `messagesOutPeriod=1 hour` отправитель U182 успешно отправил 2 сообщения, оба POST `/en/messages/create` вернули `success=true`, messageId `238` и `239`.
- FAIL: recipient-side proof подтвержден: U6 и U10 видят точный текст сообщений после превышения лимита.
- PASS: rollback premium settings выполнен, diff пустой, значения восстановлены `99/99/24`.
- PASS: `/en/admin/group/posts?groupId=10` открывается, hide action найден, post ID 25 после hide остается в списке, получает статус `Hidden`, причина модерации сохраняется.
- WARN: reopen/show/restore action для hidden group post не найден. По исходному ТЗ повторное открытие контента должно быть доступно; нужен product/development decision.

BA / рекомендации для Алексея:

- `Срочно и важно`: premium message limits сейчас нельзя считать рабочей бизнес-логикой, потому что сверхлимитное сообщение реально доставляется получателю.
- `Важно, но не срочно`: для group posts нужно подтвердить, требуется ли администратору reopen hidden post; если да, это отдельная задача Игорю.

## 2026-05-10 Stories existing-photo retest

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\stories-existing-photo-retest-2026-05-10\index.html`

Raw evidence:

- `H:\GPT-Codex\Confideline\web\qa-reports\stories-existing-photo-retest-2026-05-10\raw\stories-current-publish-scenario.json`
- `H:\GPT-Codex\Confideline\web\qa-reports\stories-existing-photo-retest-2026-05-10\raw\stories-current-publish-scenario.md`
- Screenshots: `H:\GPT-Codex\Confideline\web\qa-reports\stories-existing-photo-retest-2026-05-10\assets\*.png`

Результат:

- Общий статус: `FAIL`.
- PASS: stories settings прочитаны: `storiesOn=true`, `storiesMode=postmoderation`, `allowedTimeNextStory=1`.
- PASS: в stories modal есть existing-photo radio inputs, фото выбирается, `Next` становится доступным.
- FAIL: после выбора existing photo и клика `Next` modal закрывается, S3 image fetch возвращает `200`, но cropper/preview не открывается.
- INVALID: author/viewer visibility не оценивается, потому что новая story не была создана; старые carousel cards не являются proof новой публикации.

BA / рекомендации для Алексея:

- `Срочно и важно`: stories из existing photo не публикуются, хотя device upload ранее проходил. Это отдельный дефект publish flow.
- `Важно, но не срочно`: сохранить правило тестирования stories: сначала доказать создание/publish новой story, только потом проверять author/viewer visibility.

## 2026-05-10 Group posts hide visibility recheck

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\group-posts-hide-visibility-2026-05-10\index.html`

Raw evidence:

- `H:\GPT-Codex\Confideline\web\qa-reports\group-posts-hide-visibility-2026-05-10\raw\group-posts-hide-visibility.json`
- `H:\GPT-Codex\Confideline\web\qa-reports\group-posts-hide-visibility-2026-05-10\raw\group-posts-hide-visibility.md`
- Screenshots: `H:\GPT-Codex\Confideline\web\qa-reports\group-posts-hide-visibility-2026-05-10\assets\*.png`

Что исправлено в тестовом контуре:

- Старый `PASS_WITH_GAPS` по group posts заменен отдельным полным сценарием на свежем объекте.
- Проверка больше не использует старый active post: создается новая visible group, новый post, затем admin approve/hide и viewer-side proof.
- Для вывода о hide используется точный уникальный marker текущего прогона, а не совпадение по старым названиям.

Результат:

- Общий статус: `WARN`.
- PASS: owner U184 создал visible group `QA group hide visibility 20260510-071523 group`.
- PASS: owner создал post ID 26, post попал в admin queue как `Pending moderation`.
- PASS: admin approve перевел post ID 26 в `Active`.
- PASS: viewer U166 видел точный текст approved post.
- PASS: admin hide перевел post ID 26 в `Hidden`, moderation reason сохранен, post не удален физически.
- PASS: viewer U166 после hide больше не видит точный текст hidden post.
- WARN: на hidden row не найдено явное действие `reopen/show/restore`; при этом есть кнопка `Approve post`.

BA / рекомендации для Алексея:

- `Важно, но не срочно`: принять решение, является ли `Approve post` на hidden row достаточным повторным открытием, или нужна отдельная понятная кнопка `Reopen` / `Показать снова`.
- `Срочно, но не важно`: если `Approve post` действительно используется как reopen, лучше переименовать/разделить действие в UI, чтобы модератор понимал эффект без знания кода.

## 2026-05-10 Group posts reopen visibility recheck

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\group-posts-reopen-visibility-2026-05-10\index.html`

Raw evidence:

- `H:\GPT-Codex\Confideline\web\qa-reports\group-posts-reopen-visibility-2026-05-10\raw\group-posts-reopen-visibility.json`
- `H:\GPT-Codex\Confideline\web\qa-reports\group-posts-reopen-visibility-2026-05-10\raw\group-posts-reopen-visibility.md`
- Screenshots: `H:\GPT-Codex\Confideline\web\qa-reports\group-posts-reopen-visibility-2026-05-10\assets\*.png`

Результат:

- Общий статус: `PASS`.
- PASS: до reopen viewer U166 не видит hidden post ID 26.
- PASS: на hidden row есть `Approve post`.
- PASS: после `Approve post` post ID 26 становится `Active` в админке.
- PASS: после reopen viewer U166 снова видит точный текст `QA group hide visibility 20260510-071523 post`.

BA / рекомендации для Алексея:

- `Важно, но не срочно`: функционального дефекта reopen не осталось; `Approve post` фактически работает как reopen. UX-рекомендация: на hidden row переименовать действие в `Reopen` / `Показать снова`, если модератору нужно явное название.

## 2026-05-10 QA reports public availability and schema audit

Raw evidence:

- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\report-schema-audit-20260510\report-schema-audit-after-public.json`

Результат:

- Общий статус: `PASS`.
- PASS: все 25 локальных страниц `web\qa-reports\*\index.html` открываются извне по `https://cutthreat.github.io/confideline/web/qa-reports/<slug>/`.
- PASS: все 25 страниц подключают `task-panel-standard.css`.
- PASS: все 25 страниц подключают `qa-report.css`.
- PASS: все 25 страниц имеют единый фильтр статусов через `qa-report-controls.js`.
- PASS: стандартный `deploy\Test-ConfidelinePages.ps1 -CheckPublic` также прошел.

Что изменено:

- Добавлен общий `web\qa-reports\qa-report-controls.js`.
- В `web\qa-reports\qa-report.css` добавлены стили общего sticky-фильтра.
- Старые компактные отчеты приведены к общей схеме: общий CSS, `qa-report-page`, статусные фильтры, поле `Выполнено / комментарий Игоря`.
- Недостающие локальные отчеты опубликованы в Pages-ветку.

## 2026-05-10 Group posts delete/report recheck

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\group-posts-delete-report-2026-05-10\index.html`

Raw evidence:

- `H:\GPT-Codex\Confideline\web\qa-reports\group-posts-delete-report-2026-05-10\raw\group-posts-delete-report.json`
- `H:\GPT-Codex\Confideline\web\qa-reports\group-posts-delete-report-2026-05-10\raw\group-posts-delete-report.md`
- Screenshots: `H:\GPT-Codex\Confideline\web\qa-reports\group-posts-delete-report-2026-05-10\assets\*.png`

Результат:

- Общий статус: `FAIL`.
- PASS: до delete viewer U166 видел post ID 26.
- PASS: до delete admin видел post ID 26 как `Active`.
- FAIL: `/en/group/report-post?alias=...&postId=26` на GET/POST возвращает пустой `200` без JSON, flash, формы, записи жалобы или видимого результата.
- PASS: owner delete через реальный DOM href `/en/group/delete-post?alias=...&postId=26` вернул `success=true`.
- PASS: после delete owner и viewer не видят текст post ID 26.
- PASS: после delete admin row post ID 26 отсутствует.

Действие для Игоря:

- Реализовать `GroupController::actionReportPost($alias)`: form/CSRF или AJAX, запись жалобы, понятный ответ пользователю, admin queue/notification.

BA / рекомендации для Алексея:

- `Срочно и важно`: если жалобы на посты входят в acceptance scope групповой модерации, текущий report-post является релизным дефектом.
- `Важно, но не срочно`: решить, должно ли пользовательское delete физически удалять пост из admin list или оставлять audit trail.

## 2026-05-10 Messages thread lifecycle recheck

Public HTML:

- `H:\GPT-Codex\Confideline\web\qa-reports\messages-thread-lifecycle-2026-05-10\index.html`

Raw evidence:

- `H:\GPT-Codex\Confideline\web\qa-reports\messages-thread-lifecycle-2026-05-10\raw\messages-thread-lifecycle-recheck.json`
- `H:\GPT-Codex\Confideline\web\qa-reports\messages-thread-lifecycle-2026-05-10\raw\messages-thread-lifecycle-recheck.md`
- Screenshots: `H:\GPT-Codex\Confideline\web\qa-reports\messages-thread-lifecycle-2026-05-10\assets\*.png`

Результат:

- Общий статус: `PASS`.
- PASS: U167 -> U168 text message через `/en/messages/create`, `messageId=243`.
- PASS: получатель U168 видит точный QA-текст в `/en/messages/messages?contactId=167`.
- PASS: `/en/messages/read-conversation` вернул `success=true`, `message=Updated`.
- PASS: `/en/messages/upload-images` с валидным PNG asset проекта вернул `success=true`, thread получателя содержит attachment.
- PASS: `/en/messages/delete` работает как sender-side delete: U167 больше не видит точный QA-текст, U168 продолжает видеть его.

Действие для Игоря:

- Функционального дефекта в базовом chat lifecycle не найдено. Следующие проверки по чату должны идти в зонах premium/free limits, bans/shadow-ban delivery и mobile/UX.

Harness / правила:

- Диагностический прогон с synthetic PNG дал 500 на upload и не включен как продуктовый bug; для upload QA использовать реальные fixture assets проекта или заранее проверенные изображения.
