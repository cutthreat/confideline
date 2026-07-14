# 6 глобальных целей: практический пакет следующих действий

Актуализировано: 2026-07-14
Статус: `execution_ready_packet_runtime_open`

## P0. Сначала получить scope от программиста

Выход: список функций текущей итерации, ссылки на изменения, порядок демонстрации и тестовое окружение. До этого общий статус остаётся `implementation_in_progress`, без повышения процентов сайта.

Acceptance: каждая функция сопоставлена с G/task и verifier case.

## P0. G6 + G1: изоляция и авторство

1. Assigned profile/dialog/read/send разрешены.
2. Foreign profile, assignment page, dialog и send запрещены server-side.
3. Super-admin видит actual agent каждого сообщения и действия.
4. Direct expert login, если используется технически, не стирает real actor и отмечается как impersonation/admin action.
5. Reassignment блокируется в `paid_active` и `balance_pause` и проходит атомарно после завершения.

Acceptance: positive + четыре negative сценария с audit events.

## P0. G1: service_session state machine

Состояния: `requested -> connected_trial -> paid_active -> balance_pause -> resumed_paid -> completed/timeout/manual_end/abnormal_end`.

Правила:

- акцепт до запуска;
- countdown перед первой платной минутой;
- одна service_session содержит trial и paid;
- одна пяти­минутная резервная пауза на consultation;
- второй zero-balance в той же session завершает её;
- новый paid interaction после timeout создаёт новую session;
- sibling profiles остаются busy для paid start, но принимают async messages.

Acceptance: полный переходный тест и запрет недопустимого перехода для каждой пары состояний.

## P0. G2: billing/accrual/refund

- immutable price + compensation policy snapshot при начале paid;
- каждая начатая минута списывается как полная;
- accrual создаётся после завершения;
- refund создаёт отдельную negative correction историческому агенту;
- override хранит base, percent, reason, actor, previous/new value;
- G4 не считает деньги, а инициирует одну G2 correction.

Acceptance: no double charge, no double correction, reassignment не меняет исторического получателя.

## P1. G3: rotation и состояния

- отдельные правила по page type;
- eligibility до score;
- city multi-select эксперта и один city filter клиента;
- KPI имеет режим immediate / after-threshold / disabled;
- до порога выводится `insufficient_data`, новый агент не получает нулевой штраф;
- cap числа анкет одного агента не вводится;
- собирается мониторинг доли top-N по агентам, чтобы решение о cap принималось по данным;
- preview объясняет факторы позиции и manual overrides.

Acceptance: fixture с 3-5 профилями по городам, состояниям и KPI; порядок и исключения объяснимы.

## P1. G5: event dictionary и dashboard trust

Для каждого события: trigger, actor, session/dialog/profile/agent IDs, timestamp, idempotency key, owner и source. Dashboard показывает freshness, coverage и no-data отдельно от zero.

Дополнительный operational metric: delivery-to-read для async messages, пришедших во время `busy_paid`; он не влияет на rotation до отдельного решения.

Acceptance: пропущенное событие/неполный период видимы как data-quality warning.

## P1. G4: support linkage

Support case связан с session и может запросить refund. Финансовое решение создаётся в G2 и ссылается на case. Повторный submit с тем же решением не создаёт вторую correction.

Acceptance: partial refund после reassignment уменьшает начисление исторического агента и сохраняет полный audit.

## Не делать сейчас

- второй акцепт после trial;
- лимит анкет агента или top-N cap без фактических данных;
- сокращение 5-минутной паузы;
- автоматическое reassignment по SLA;
- predictive KPI, сложный anti-fraud и A/B framework;
- повышение процентов панели по факту ТЗ, commit или старта разработки.

## Следующий контрольный пакет от программиста

```text
iteration scope:
goal/task mapping:
code/build refs:
admin/client surfaces:
implemented states:
not implemented:
demo data:
positive cases:
negative cases:
known residuals:
ready for QA date:
```
