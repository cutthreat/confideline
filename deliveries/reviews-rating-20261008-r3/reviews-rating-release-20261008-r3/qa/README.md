# QA r3: отзывы и рейтинг #62

Release `reviews-rating-20261008-r3`. Это доказательства статических макетов, не backend и не production.

`native-runtime.json` содержит проверки поддерживаемым нативным браузером Codex, размеры, фактический DOM/геометрию и хэши проверенных UI-файлов. `screens/` содержит JPEG этого прогона. `model-results.json` - 32 чистых Node unit-теста. `resource-audit.json` проверяет все относительные src/href HTML и весь локальный граф URL в CSS; список удалённых деклараций r2 сохранён отдельно. Внешние ссылки перечислены, но их доступность статическим аудитом не подтверждается. Текущий UI QA не является offline-тестом. `QA-RESULTS.json` связан с developer manifest.

Для повторения чистых тестов из папки release: `node --test qa/model.test.cjs`. Для аудита зависимостей: `npm ci --prefix qa/tooling`, затем `node qa/audit-resources.cjs` без `--prune`. Применённая механическая очистка CSS документирована результатом первичного прогона. `build-release.cjs` генерирует навигацию/manifest после проверок; он не выполняет browser UI и не заменяет нативный QA.

Нативный прогон повторять через поддерживаемый браузер Codex: сценарии P6-01--P6-11, клиентские rated/empty/ineligible/first-review, модерация, фильтры, sidebar/account, размеры 1440/1024/768/390/360. После изменения UI нужен новый прогон и новые source hashes. Не переносить старый receipt r2.

Серверные RBAC/CSRF, DB/rollback, уникальность/гонки/idempotency, реальные авторы/атрибуция, кеш и интеграция экранов, уведомления, live-site и человеческая приёмка: NOT_RUN/NOT_VERIFIED.
