# QA r4: отзывы и рейтинг #62

Проверяемый состав: соседняя папка developer. Итог: QA-RESULTS.json. Нативные проверки и source SHA256: native-runtime.json. Чистая модель и workflow: model-results.json. Локальный граф ресурсов: resource-audit.json. Снимки: screens/.

Повтор unit-тестов: `node --test model.test.cjs workflow.test.cjs`.

Повтор resource audit: `npm ci --prefix tooling`, затем `node audit-resources.cjs`. Installed node_modules не входят в поставку. Audit проверяет локальные ссылки, а не доступность внешнего Google Fonts.

Для повторной проверки UI запустить локальный HTTP-сервер, открыть developer/index.html, пройти три административные страницы в RU/EN, проверить прямые URL модератора, сценарии pending и immediate, анонимность, оценку без текста, ручные 125 голосов и ширины 1440/1024/768/390/360. Не изменять cookies/профили/боевые аккаунты. Все значения и действия макета синтетические.

Native receipt — запись фактически выполненных действий через поддерживаемый браузерный инструмент, не автоматически воспроизводимый headless E2E-тест. Часть переходов дополнительно покрыта чистыми unit-тестами. Нельзя трактовать число UI-проверок как число независимых backend-тестов.

Backend: NOT_RUN. Реальные RBAC/CSRF/eligibility/транзакции/конкурентность/оплата: не проверены. Product acceptance: NOT_VERIFIED. Архив developer и архив QA разделены.
