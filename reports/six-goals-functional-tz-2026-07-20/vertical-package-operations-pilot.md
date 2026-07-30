# Vertical 4: SLA, quality, admission и critical operations

Дата: 2026-07-20  
Статус: `requirement_handoff_ready_O1_O2_O6_product_minimum_accepted_legal_runtime_open`  
Coverage: G6.2, G6.3, G6.4, G6.5

Это primary owner-package G6.4. Его minimum admission gate поставляется и доказывается раньше как обязательный prerequisite V3 до G3.7/G3.5; остальной training/re-admission/first-shift workflow продолжается в полном V4 operations scope. Номер V4 не означает, что admission prerequisite можно отложить до завершения V3.

## Результат

Каждый paid request, review, admission decision и critical incident имеет измеримый период, owner, evidence, действие и версионный readback.

## Build-ready configuration contract

- O1 принят: 60 секунд paid accept/decline, 60 секунд first meaningful response, 15 минут support first response, ordinary escalation 2x, critical escalation immediate.
- Все SLA values/modes управляются в admin по `tz-crosscut-admin-managed-settings.md`; обязательны validation, save/readback, version/audit и snapshot активного clock.
- O2 принят: max 100, pass 80, critical fail overrides score, moderator/QA lead verdict, super-admin reasoned override, versioned re-admission path.
- Scorecard, critical-fail registry, roles и re-admission управляются в отдельном admin-разделе по `admin-panel-settings-development-package.md`.
- O6 product minimum принят; prohibited registry, incident routes, templates/resources и protected-minimum guard управляются в Trust & Safety admin screen.
- Admission workflow поддерживает course/tests/final/trial/review/owner approval; незавершенный gate блокирует paid access.
- Ранний prerequisite readback G6.4 содержит current status/version и Agent/profile binding; missing, stale/expired, failed/blocked или wrong-binding admission fail-closed блокирует eligibility, session и debit.
- Critical alerts имеют severity, object, owner, action, deadline, dedup, acknowledgement и resolve.

## Remaining release gates

- Exact legal/domain-approved wording и crisis resources.
- Runtime/admin proof protected policy, critical route и paid-access/admission block.

## Acceptance suite

| ID | Сценарий | PASS |
|---|---|---|
| O1 | SLA authorized/unauthorized change, invalid, readback, version changed during active clock | Действующая версия воспроизводима; старый deadline не меняется; новый clock использует новую версию |
| O2 | Busy paid queue | Async SLA не штрафует исключенный период |
| O3 | Breach + reassignment | Breach и owner history не исчезают |
| O4 | QA normal/critical fail | Review связан с session/actual agent; critical block работает |
| O5 | Appeal/correction | Исходный и новый verdict сохранены |
| O6 | Admission gate missing | Paid access запрещен с понятной причиной |
| O7 | Controlled first shift | Допуск, supervisor и critical pause видимы |
| O8 | Duplicate critical event | Один связанный alert/incident |
| O9 | Foreign-role alert access | Запрещено без раскрытия данных |
| O10 | Failed external delivery | Staff alert остается доступным и actionable |
| O11 | Admin quality config change/readback | Max/pass, registry, roles и workflow сохраняются одной version с audit |
| O12 | Historical review after config change | Review сохраняет примененную scorecard/critical rule version |
| O13 | Attempt weaken protected O6 minimum | Активация запрещена без owner/legal approval |
| O14 | Critical O6 route | Обычный сценарий остановлен, новая paid minute не начинается, staff incident создан |

## Stop

Нельзя включать paid access при unset/failed admission, скрывать critical fail либо считать manual report proof без исходных случаев.

Rollback: только task-local документ и ссылки.
