# Vertical 6: dashboard и public traffic gate

Дата: 2026-07-20  
Статус: `requirement_handoff_ready_pilot_baseline_required_not_runtime_verified`  
Coverage: G5.2, G5.4

## Результат

Dashboard показывает только достоверные события и различает `zero/no_data/insufficient_sample/stale/partial_coverage`; public traffic запускается только по свежему доказательному release gate.

## Build-ready scope

- Dashboard строится после trusted G5.1 event layer и показывает freshness/coverage.
- Каждая метрика имеет определение, период, denominator и drilldown к обезличенному evidence.
- G5.4 хранит current release verdict, approver, proof refs, residuals и stop authority.
- До pilot baseline и O5 gate результат по умолчанию `NO_GO`.

## Acceptance suite

| ID | Сценарий | PASS |
|---|---|---|
| L1 | Zero vs no-data | Состояния различимы |
| L2 | Stale/partial coverage | Dashboard явно предупреждает и не показывает green |
| L3 | Reconciliation | Metric drilldown совпадает с event/session/money totals |
| L4 | Missing critical event | Release gate = NO_GO |
| L5 | Threshold unset | Traffic gate = NO_GO |
| L6 | Current evidence passes | Verdict содержит build, период, approver и proof |
| L7 | Critical regression after GO | Stop authority возвращает NO_GO с audit history |

## Owner gate

O5 утверждается после pilot baseline: paid-path success, billing/refund defects, SLA, critical fails, event coverage/freshness, GO approver и stop authority.

Rollback: только task-local документ и ссылки; external traffic не включается.
