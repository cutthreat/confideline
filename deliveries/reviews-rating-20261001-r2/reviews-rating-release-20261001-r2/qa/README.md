# Отзывы #62: evidence отдельно от developer-пакета

Release id: `reviews-rating-20261001-r2`. Вход: `index.html`.

`QA-RESULTS.json` - переносимый обзор фактических результатов с SHA-привязкой к developer manifest. `runtime-receipt.json` - исходный локальный suite receipt; абсолютные пути в нём - provenance проверявшего ПК, не навигация для получателя. `screens/` - текущие состояния на пяти ширинах, без снимков старой встроенной админки. `manifest.json` - хэши evidence и developer binding.

`source-provenance.json` хранит разрешённые пути/хэши исходных шаблонов. Здесь нет auth/session/profile/VPN материалов, пользовательских cookies или raw chat/runtime dumps.

## Повтор Проверки

Нужны Node.js, Playwright и Edge. При распаковке двух архивов рядом:

```powershell
$env:PLAYWRIGHT_MODULE = '<installed Playwright module path>'
$env:REVIEWS_FIXTURE_DIR = (Resolve-Path '../developer').Path
$env:REVIEWS_PROOF_DIR = Join-Path $PWD 'rerun'
$env:REVIEWS_OFFLINE = '1'
node tools/verify-reviews-site-20260930.cjs
```

Это повтор harness на данном снимке, не подмена существующего frozen receipt. Новые результаты находятся в `rerun`, исходные доказательства остаются неизменными. Developer-архив сам по себе открывается без Node/Playwright и без QA tools.

Серверные R01--R09/B01--B08 описаны в developer HANDOFF/CONTRACT. Их фактическая backend приёмка NOT_RUN: UI PASS не доказывает RBAC, persistence, идемпотентность, сообщения или real payments.
