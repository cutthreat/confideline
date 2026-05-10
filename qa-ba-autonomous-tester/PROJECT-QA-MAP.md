# Confideline QA project map

Дата: 2026-05-10

## Назначение

Эта карта нужна, чтобы тестирование Confideline не начиналось каждый раз с нуля. Она показывает:

- где лежит код и тестовый контур;
- какие продуктовые зоны уже выделены;
- какие отчеты являются актуальными источниками правды;
- как подключать субагентов без конфликта за browser/session/live-state;
- какие следующие волны тестирования надо закрывать.

Главное правило: финальный результат теста может быть только `PASS`, `FAIL` или `WARN` с доказательствами. `Частично`, `не доказано`, `нужен второй пользователь`, `скрипт не смог` и похожие формулировки являются recheck-долгом, а не результатом.

## Карта репозитория

| Зона | Путь | Для чего используется |
|---|---|---|
| Yii2 application | `H:\GPT-Codex\Confideline\Chat\youdate-2.0.2-yii2\Source\youdate_extracted\application` | Основная локальная копия Yii2/PHP source: controllers, modules, views, assets, settings. |
| Public controllers | `H:\GPT-Codex\Confideline\Chat\youdate-2.0.2-yii2\Source\youdate_extracted\application\controllers` | Пользовательские сценарии: profile, messages, group, connections, photo, gift, balance, auth. |
| Admin controllers | `H:\GPT-Codex\Confideline\Chat\youdate-2.0.2-yii2\Source\youdate_extracted\application\modules\admin\controllers` | Админка: settings, bans, users, messages, groups, photos, orders, reports. |
| Views/themes | `H:\GPT-Codex\Confideline\Chat\youdate-2.0.2-yii2\Source\youdate_extracted\application\views` и `...\application\themes` | PHP views и UI-слой, который нужно учитывать при browser QA. |
| Settings | `H:\GPT-Codex\Confideline\Chat\youdate-2.0.2-yii2\Source\youdate_extracted\application\settings` | Настройки Yii2/YouDate и возможные feature/config entry points. |
| QA tester contour | `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester` | Канонический контур `Тестировщик`: стандарты, скрипты, отчеты, fixtures, playbooks. |
| Public QA reports | `H:\GPT-Codex\Confideline\web\qa-reports` | Удобные HTML-отчеты для Игоря, Алексея и истории тестирования. |
| QA report index | `H:\GPT-Codex\Confideline\web\qa-reports\index.html` | Внешний каталог актуальных и архивных QA-отчетов. |
| QA control center | `H:\GPT-Codex\Confideline\web\qa-reports\qa-control-center-2026-05-07\index.html` | Рабочая панель: FAIL/WARN/PASS, фильтры, поле `выполнено` для Игоря. |
| Deploy manifest | `H:\GPT-Codex\Confideline\deploy\pages-manifest.json` | Проверка публичных GitHub Pages URL и обязательного текста на страницах. |

## Yii2 entry points для тестировщика

| Контур | Основные файлы/URL | Что проверять |
|---|---|---|
| Premium/free | `/en/admin/settings/premium`, `modules\admin\controllers\SettingsController.php` | Сохранение checkbox/limits, rollback, free/premium пары, превышение лимитов 3-10 попытками, sender + recipient outcome. |
| Photo moderation | `/en/admin/settings/photo`, `controllers\PhotoController.php`, admin photo/media queue | Profile main и gallery отдельно, три режима, автор + второй пользователь + admin action. |
| Stories | `/en/admin/settings/stories` | Device upload, existing-photo publish, carousel visibility author/viewer, не делать вывод только по media queue. |
| Groups media | `/en/admin/settings/groups`, `/en/admin/group/update?id=X`, `controllers\GroupController.php`, `modules\admin\controllers\GroupController.php` | Avatar/cover pre/post/none, approve/reject, возврат к прежнему approved media, user-side visibility. |
| Group posts | `/en/group/...`, `/en/admin/group/posts?groupId=X` если доступно | Create/hide/reopen/delete/report, author/viewer/admin proof, причина модерации и история. |
| Bans | `/en/admin/ban/index`, `modules\admin\controllers\BanController.php` | Full ban и shadow ban: U1/U2/Admin, до/во время/после, входящие и исходящие действия. |
| Messages | `/en/messages`, `controllers\MessagesController.php`, admin message queue | Thread list/detail, create/delete/read, premium limits, доставка получателю. |
| Connections | `/en/connections/*`, `controllers\ConnectionsController.php` | Likes, guests, encounters, mutual state, hidden/shadow behavior. |
| Groups public | `/en/group`, `controllers\GroupController.php` | Create/update/join/leave/users/posts/report. |
| Photo access | `controllers\PhotoController.php` и UI profile/photo requests | Request/approve/deny, sender + recipient + paid/free constraints. |

## Продуктовая карта сайта

| Зона | Роли | Главный риск тестирования | Минимальное доказательство |
|---|---|---|---|
| Auth/signup/recovery | Guest, new user | Форма выглядит рабочей, но validation/accessibility ломают вход | Before/after form state, validation, успешная регистрация или точный FAIL. |
| Profile/settings | User | Сохранение без rollback или без проверки фактического состояния | Before settings, submit/AJAX, after state, rollback. |
| Discovery/detail | U1/U2 | Карточка видна, но detail/links/EN-content/гости не доказаны | Open list, open detail, verify content/action side effects. |
| Likes/favorites/visits | U1/U2 | Действие видно отправителю, но не проверена вторая сторона | U1 action + U2 incoming list/guest/notification. |
| Messages/chat | U1/U2/Admin | Лимит или ban может скрыто пропускать сообщения | U1 send response + U2 thread/message presence/absence. |
| Stories | Author, viewer, Admin | Ошибка смотреть в admin media queue вместо пользовательской story feed | Author carousel + second-user carousel + admin status/action. |
| Photos/photo access | Owner, viewer, Admin | Main/gallery/private access имеют разные правила | Upload/request/action + visibility owner/viewer + admin moderation proof. |
| Gifts/balance | Sender, recipient | Платное действие может списывать/не доставлять | Sender result + balance/transaction if relevant + recipient visible effect. |
| Groups/posts | Owner, member/viewer, Admin | Group visible owner-side, но скрыта viewer-side или наоборот | Owner state + viewer list/detail/feed + admin state. |
| Premium/free | Free, Premium, Admin | Настройка сохранилась, но не влияет на реальный flow | Admin setting + free/premium scenario + limit overflow + recipient proof. |
| Bans/shadow bans | U1, U2, Admin | U1 видит успех, но надо доказать скрытие у U2 | Before/during/after matrix, U1 illusion + U2 absence + admin history. |
| Admin UX | Admin, Igor | Админка дает route, но действие/фильтр/модал не проверены | UI action, POST/AJAX response, list/detail state, rollback. |

## Актуальные источники правды

Состояние на момент карты: в `web\qa-reports\index.html` есть 21 актуальный отчет в QA Control Center, плюс архив. Агрегатный статус QA Control Center остается `FAIL`, потому что premium messagesOut, stories existing-photo, group report-post и accessibility еще требуют исправлений.

| Отчет | Статус | URL/путь |
|---|---|---|
| QA Control Center | Рабочая панель для Игоря и Алексея | `H:\GPT-Codex\Confideline\web\qa-reports\qa-control-center-2026-05-07\index.html` |
| User interactions | Актуальный PASS по likes/favorites/visits/profile actions | `H:\GPT-Codex\Confideline\web\qa-reports\user-interactions-2026-05-10\index.html` |
| Connections mutual likes | Актуальный PASS: clean baseline, one-way like, recipient-side incoming like, mutual у обоих, rollback | `H:\GPT-Codex\Confideline\web\qa-reports\connections-mutual-likes-2026-05-10\index.html` |
| Photo access actions | Актуальный FAIL: approve/reject happy path PASS, но action без request возвращает false `success=true` | `H:\GPT-Codex\Confideline\web\qa-reports\photo-access-actions-2026-05-10\index.html` |
| Detail surfaces | Актуальный PASS по detail surfaces с BA-замечанием по EN-content | `H:\GPT-Codex\Confideline\web\qa-reports\detail-surfaces-2026-05-10\index.html` |
| Discovery surfaces | Актуальный PASS по dashboard/browse/encounters | `H:\GPT-Codex\Confideline\web\qa-reports\discovery-surfaces-2026-05-09\index.html` |
| Public/Auth + Accessibility | Актуальный FAIL по accessibility при рабочем signup path | `H:\GPT-Codex\Confideline\web\qa-reports\public-auth-accessibility-2026-05-09\index.html` |
| Premium no-debt recheck | Актуальный FAIL по premium controls/limits | `H:\GPT-Codex\Confideline\web\qa-reports\premium-no-debt-recheck-2026-05-09\index.html` |
| Premium messagesOut limit | Актуальный FAIL: при лимите 1 отправлено и доставлено 10/10 сообщений | `H:\GPT-Codex\Confideline\web\qa-reports\premium-messages-out-limit-2026-05-10\index.html` |
| Stories existing photo vs device | Актуальный FAIL: existing-photo не открывает cropper/preview после Next; device upload в тех же settings PASS | `H:\GPT-Codex\Confideline\web\qa-reports\stories-existing-photo-vs-device-2026-05-10\index.html` |
| Stories device upload cropper | PASS по device upload/cropper | `H:\GPT-Codex\Confideline\web\qa-reports\stories-device-upload-cropper-2026-05-09\index.html` |
| Photo upload current | Актуальный photo moderation/upload source | `H:\GPT-Codex\Confideline\web\qa-reports\photo-upload-current-2026-05-09\index.html` |
| Group media moderation modes | Актуальный WARN/PASS mix по avatar/cover modes | `H:\GPT-Codex\Confideline\web\qa-reports\group-media-moderation-modes-2026-05-09\index.html` |
| Group posts hide/reopen visibility | Актуальный PASS: approve -> viewer visible, hide -> viewer hidden, approve на hidden row -> viewer visible | `H:\GPT-Codex\Confideline\web\qa-reports\group-posts-reopen-visibility-2026-05-10\index.html` |
| Group posts delete/report | Актуальный FAIL: delete работает, report-post endpoint пустой | `H:\GPT-Codex\Confideline\web\qa-reports\group-posts-delete-report-2026-05-10\index.html` |
| Messages thread lifecycle | Актуальный PASS: create, recipient delivery, read, image upload, sender-side delete | `H:\GPT-Codex\Confideline\web\qa-reports\messages-thread-lifecycle-2026-05-10\index.html` |
| Bans current pass | Актуальный pass по ban UI/current cases | `H:\GPT-Codex\Confideline\web\qa-reports\bans-current-2026-05-09\index.html` |
| Shadow-ban extended matrix | Актуальный WARN по group-post baseline | `H:\GPT-Codex\Confideline\web\qa-reports\shadow-ban-extended-matrix-2026-05-09\index.html` |

### Текущие блокеры из каталога отчетов

| Приоритет | Блокер | Что значит для следующего теста |
|---|---|---|
| P0 | `Premium no-debt recheck` / `messagesOutPremium` | Лимиты сообщений должны проверяться 3-10 попытками и обязательно со стороны получателя. |
| P0 | `Stories current publish flow` | Нужен полный author + viewer + admin proof для existing-photo publish. |
| P1 | `Photo upload current settings` | Main/profile photo остается отдельной зоной от gallery и требует user-side visibility. |
| P1 | `Photo access actions` | Action без существующего request возвращает `success=true`; нужен controller-level отказ. |
| P1 | `Public/Auth + Accessibility` | Signup path работает, но accessibility FAIL остается задачей для UI/верстки. |
| P1 | `Bans / SHADOW-RELEASE-001` | После снятия shadow/full ban нужно доказывать восстановление видимости и новых действий. |
| P2 | `Full-site smoke` admin href `{url}` | Проверить админский шаблон/ссылку как отдельный route/UI bug. |

### Гигиена отчетов и скриптов

В `qa-ba-autonomous-tester\playwright\scripts` уже есть широкое покрытие: premium, moderation, stories, photo, bans, groups, user interactions, discovery/detail, signup, accessibility, admin storage, analytics. Но имена run-директорий и скриптов не всегда совпадают 1:1 (`current`, `scenario`, `full`, `audit` смешаны). Следующая инфраструктурная задача: нормализовать `script -> report slug -> public report slug`, чтобы новый тестировщик сразу видел, какой скрипт породил какой отчет.

## Как подключать субагентов

Используем субагентов только там, где их работа независима и не требует общего browser state.

Политика контура разрешает до `10` QA-субагентов за один проход на `gpt-5.3-codex-spark` с `xhigh` reasoning, если задачи действительно независимы и полезны. Исполняемый guard:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Test-ConfidelineQaSubagentSparkPolicy.ps1 -QaRoot H:\GPT-Codex\Confideline\qa-ba-autonomous-tester
```

Операционный нюанс: если текущая Codex-сессия уже держит лимит активных agent threads, фактически может подняться меньше 10. Тогда работа не останавливается: первые агенты закрывают самые дорогие зоны, остальные карты выполняются локально или запускаются после закрытия активных агентов.

| Агент | Зона | Тип работы | Результат |
|---|---|---|---|
| A1 | User flows | Read-only карта public/auth/profile/discovery/messages/stories | Список сценариев, ролей, evidence debt. |
| A2 | Admin/settings | Read-only карта admin URLs/controllers/views | Матрица админских surface + smoke/recheck. |
| A3 | Moderation | Read-only карта photo/stories/groups/posts | Правильные proofs по 3 режимам. |
| A4 | Premium/free | Read-only карта controls/limits | Fixture plan и список проверок sender/recipient. |
| A5 | Bans | Read-only карта full/shadow ban | U1/U2/Admin matrix и next tests. |
| A6 | Groups/posts | Read-only карта lifecycle | Gaps по posts/reopen/feed/visibility. |
| A7 | Messages/chat | Read-only или отдельный fixture pass | Thread/detail/limits/delivery matrix. |
| A8 | Reports/publishing | Read-only audit | Улучшения QA panel/report templates. |
| A9 | Harness/runtime | Read-only audit | Что укрепить в storageState, cropper, CSRF, AJAX waits. |
| A10 | BA/UX backlog | Read-only synthesis | Рекомендации для Алексея отдельно от дефектов Игоря. |

### Правила для субагентов

- Один агент получает одну bounded QA-карту.
- Prompt агенту должен быть коротким: зона, 2-5 файлов/URL, ожидаемый формат ответа. Не передавать весь исторический контекст, иначе Spark может упереться в context limit.
- Агент не меняет live state без отдельного права на конкретный сценарий.
- Агент не логинится через общую пользовательскую сессию, не трогает MFA/payment/credentials.
- Агент возвращает: `verdict`, `что проверил`, `где смотрел`, `что доказано`, `что не доказано`, `следующий тест`, `риски`.
- Если нужен браузерный mutating test, основной тестировщик готовит isolated context, fixtures, rollback и только потом делегирует выполнение.

### 10 коротких правил для future agents

1. Проверять реальный Yii2 flow: view, JS, submit/AJAX, CSRF, метод.
2. Всегда фиксировать before-state и after-state.
3. Для user-to-user действий проверять автора и получателя.
4. Для moderation не считать admin queue достаточным доказательством.
5. Для crop/modal/upload ждать readiness компонента, а не таймер.
6. Для лимитов ставить 1-2 и делать действия сверх лимита до конца сценария.
7. Любой побочный эффект требует rollback или явной фиксации намеренного изменения.
8. Browser QA вести в изолированной сессии, не в общем CDP по умолчанию.
9. Финал теста: только `PASS`, `FAIL`, `WARN`, `RETEST`, `INVALID` с evidence.
10. `Частично`, `не доказано`, `нужен второй пользователь` не являются финалом.

## Следующие волны тестирования

| Приоритет | Волна | Почему следующая | Done when |
|---|---|---|---|
| P0 | Chat premium/free limits | Базовый thread lifecycle закрыт PASS; premium messagesOut fresh FAIL подтвержден 10/10 доставкой | После фикса: при лимите 1 первая отправка проходит, попытки 2-10 не доставляются получателям, rollback clean. |
| P0 | Stories existing-photo publish | Fresh FAIL локализован: existing-photo path ломается, device-upload path PASS | После фикса: existing-photo открывает cropper/preview, публикуется, автор и viewer видят новую story. |
| P0 | Group posts lifecycle | Hide/reopen/delete закрыты; report-post FAIL | Реализовать/ретестить report-post owner/viewer/admin flow. |
| P1 | Connections premium/shadow gates | Базовый mutual flow закрыт PASS; нужно проверить влияние premium incoming lock и shadow-ban | U1/U2 matrix: likes/mutual до/во время/после premium gate или shadow-ban, sender + recipient proof, rollback. |
| P1 | Premium controls remaining | Проверить edit/timer/swipe/country price и checkbox features | Каждая настройка имеет реальный user-side proof или оформленный product decision. |
| P1 | Bans extended paid/content actions | Shadow ban должен покрывать gifts/photo access/groups/posts/stories/messages | До/во время/после снятия бана, U1 illusion + U2 absence + admin history. |
| P2 | Admin settings smoke | Убедиться, что админские формы не ломают Yii2 CSRF/AJAX/rollback | Все ключевые settings сохраняются, отображаются и откатываются. |
| P2 | UX/UI audit mobile/desktop | Нужен отдельный слой для Алексея и Антона | UX debt разделен на urgent/important matrix и не смешан с багами Игоря. |

## Специальные карты для ближайшего прохода

### Chat/messages

Проверять:

- `/messages`;
- `/messages/conversations`;
- `/messages/messages?contactId=<id>`;
- `/messages/create`;
- `/messages/upload-images`;
- `/messages/delete`;
- `/messages/read-conversation`;
- `/messages/new-messages-counters`.

Особые риски:

- `actionMessages($contactId)` должен быть проверен именно через фактический `contactId` из запроса и JS-клиента.
- Для premium/free limits проверять не только sender response, но и факт доставки/недоставки у получателя.
- Для upload-images проверять ошибки валидации и результат в thread/detail.

### Groups/posts

Проверять:

- `/groups`;
- `/your-groups`;
- `/groups/<alias>`;
- `/groups/<alias>/feed`;
- `/groups/<alias>/info`;
- `/groups/<alias>/members`;
- join/leave;
- management/users;
- new-post;
- delete-post;
- report-post.

Особые риски:

- `actionReportPost` в контроллере выглядит пустым: нужен отдельный тест, что жалоба на пост реально дает понятный результат, а не пустой ответ.
- `actionDeletePost` не должен проверяться только UI-кликом; нужен HTTP method proof, потому что это действие потенциально не ограничено POST.
- Для group feature нужно сначала доказать, включена ли фича; при выключенной фиче корректный результат `404`, а не баг сценария.

### Admin bans/groups

Проверять:

- `/en/admin/ban/index`, create, update, delete;
- `/en/admin/group/index`, update, delete, toggle-verification, toggle-block.

Особые риски:

- В `admin/group` delete/toggle actions должны идти только через `POST`.
- В `admin/ban/delete` нужно отдельно проверить метод запроса и фактическое удаление, потому что по коду не видно такого же `VerbFilter`.
- Доказательство для admin actions: UI flash + HTTP method/status + database/model state, если доступно.

## Evidence standard

Каждый отчет обязан показывать:

- что тестировали;
- что ожидали;
- что получили;
- как воспроизвести;
- где смотреть Игорю: URL + controller/view/action, если известно;
- evidence screenshot с цветным статусом, стрелкой/рамкой и понятной подписью;
- user-side proof для автора и второго пользователя, если действие влияет на другого;
- rollback или явную фиксацию намеренного live-state изменения;
- вывод для Алексея отдельно от задачи для Игоря.

## Что делать при ограничении контура

Ограничение не закрывает тест. Оно запускает доработку тестового контура:

1. Создать или выбрать чистую пару пользователей.
2. Подготовить нужный premium/free/ban/balance/status state.
3. Запускать отдельную browser session, не общий CDP пользователя.
4. Для Yii2 форм идти через реальный submit/AJAX с CSRF.
5. Для cropper/modal/upload ждать готовность компонента.
6. После теста выполнить rollback или записать намеренно оставленное состояние.
7. Старый вывод пометить `INVALID/RETEST`, новый проход сделать source of truth.

## BA/product слой для Алексея

Рекомендации по улучшению продукта не должны смешиваться с доской Игоря. Формат:

| Квадрант | Когда использовать | Пример |
|---|---|---|
| Срочно и важно | Ломает ключевой flow, приемку, доверие, платежи, доставку, модерацию, баны | Сообщение отправляется сверх лимита и доходит получателю. |
| Важно, но не срочно | Улучшает продукт/UX/админку/аналитику, но не блокирует приемку | Улучшить понятность states в карточке пользователя. |
| Срочно, но не важно | Мешает тесту/демо/отчету, но не меняет бизнес-логику | Длинный статус ломает карточку отчета. |
| Не срочно и не важно | Идея без доказанного влияния | Косметический текст без связи с flow. |

Каждая рекомендация должна иметь пользу, owner, критерий готовности и источник evidence.

## Текущая схема использования карты

1. Перед новым проходом открыть эту карту и QA Control Center.
2. Выбрать одну волну и roles/fixtures.
3. Если сценарий большой, нарезать на независимые QA-карты и раздать субагентам.
4. Провести live/browser pass только после discovery.
5. Обновить HTML-отчет, ledger и при необходимости эту карту.
6. Проверить публичный URL через `deploy\pages-manifest.json` и соответствующий deploy/check script, если отчет публикуется.
