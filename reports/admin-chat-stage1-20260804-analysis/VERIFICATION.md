# Верификация разбора и demo runtime

## 1. Целостность архива

| Проверка | Результат |
|---|---|
| SHA-256 архива | `1D111B27B71060174323BE17278F89BA2680DFB00262B591A52F40A193D605F3` |
| Extraction | `Everything is Ok` |
| Embedded checksums | `64/64 PASS`, 0 mismatches |
| Extracted inventory | 65 files / 42 directories |

Проверка выполнена над `extracted/`; исходный `.rar` не изменялся.

## 2. Контрактные проверки

| Команда | Результат |
|---|---|
| `node --check assets/agent_chat_custom.js` | PASS |
| `node --check assets/agent_chat_paid_session.js` | PASS |
| `node --check assets/global_custom.js` | PASS |
| `tools/verify_badge_contract.ps1` | PASS — 19 definitions/options/rows |
| `tools/verify_message_contract.ps1` | PASS — 22 direct + 3 system messages |
| `tools/verify_control_contract.ps1` | PASS — 20 chat + 5 global endpoints |
| `tools/verify_paid_session_contract.ps1` | PASS — 8 states + 7 endpoint keys |

## 3. Локальный browser smoke

Использован отдельный headless Chromium context и входящий в пакет `codex-static-server.cjs`. Внешние site/profile данные и авторизация не использовались.

| Сценарий | Фактический результат |
|---|---|
| Initial control | `no_consent` |
| Offer modal | открывается; submit переводит в `offer_pending` |
| Demo consent | `ready` |
| Start modal | открывается; submit переводит в `connecting` |
| Demo readiness | `active` |
| Pause modal | открывается; после выбора `technical` → `paused` |
| Resume modal | открывается; submit после подключения → `active` |
| Complete modal | открывается; после выбора `consultation_finished` → `completed` |
| Horizontal overflow | `false` на viewport `1200×700` |
| Browser console/page errors | runtime ошибок нет; initial probe сохранил один transient resource 404, не воспроизводимый при отдельном response probe |

## 4. Скриншоты состояний

- [01 — initial / no consent](screenshots/01-initial.png)
- [02 — offer modal](screenshots/02-offer-modal.png)
- [03 — ready after consent](screenshots/03-ready.png)
- [04 — active](screenshots/04-active.png)
- [05 — paused](screenshots/05-paused.png)
- [06 — completed](screenshots/06-completed.png)

Скриншоты — доказательство поведения demo UI, не доказательство production backend/billing.

## 5. Production acceptance boundary

Для закрытия интеграции нужны отдельные runtime evidence:

1. authorized Yii2 view и RBAC для эксперта/staff;
2. server/data post-condition каждой mutation;
3. negative server-side checks (`403`, stale `409`, `422`, expired offer, insufficient balance, offline/reconnect);
4. persisted messages, session ledger, audit и billing records;
5. realtime delivery/dedup/reconnect evidence с обеих сторон;
6. client-visible safe text против internal comments/original moderation data;
7. rollback/reconciliation evidence.

До этих доказательств статус production должен оставаться `implemented_unverified`, даже если preview и static checks зелёные.

## 6. Повторная проверка после контракта production-поверхностей

`2026-08-04`: PM/Антон и Caster повторно прошли все 12 integration points из исходного handoff. Результат сведён в [EXTENDED_PRODUCTION_SURFACES-RU.md](EXTENDED_PRODUCTION_SURFACES-RU.md). Контрактная матрица не меняет demo-код и не заявляет production readiness.

Повторно выполнены без изменений исходного пакета:

- `node --check` для трёх custom JS — PASS;
- четыре static verifier — PASS (`19/19`, `22+3`, `20+5`, `8+7`);
- проверка документа — 12 нумерованных production-поверхностей, все с endpoint/границей, RBAC, idempotency, audit и acceptance.

После повторного PM-прохода 2026-08-05:

- `Test-FunctionalTzStandardG12.ps1` через `pwsh` — `81/81 PASS`, `spec_completeness=100`, runtime остаётся open до QA;
- `Test-G1G3Documentation.ps1` — `402/402 PASS`;
- канонический G1.2 source обновлён до версии `2.1`, HTML/DOCX regenerated;
- в контракт добавлен безопасный `Copy history` (в MVP только super-admin, позднее staff через существующие permissions), разделение permanent dialogue/session history и обязательная передача translation-key integration Игорю;
- опубликованная карточка панели приведена к навигационному формату и больше не объявляет lifecycle/retention chat-owned.
