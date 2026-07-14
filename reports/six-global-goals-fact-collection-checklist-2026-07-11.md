# 6 глобальных целей: чеклист фактов и доказательств

Актуализировано: 2026-07-14
Статус: `reusable_evidence_standard`

## Перед добавлением факта

- [ ] Указана цель G1-G6 и одна каноническая task page.
- [ ] Указан владелец истины: Confideline implementation/QA либо Nebula/Oracle strategy.
- [ ] Утверждение помечено: `fact`, `owner_confirmed`, `owner_confirmed_existing`, `inference`, `decision`, `recommendation`.
- [ ] Есть источник, дата и версия/окружение.
- [ ] Static HTML, ТЗ, transcript и сообщение программиста не названы runtime proof.
- [ ] Конкурентный пример помечен как pattern, а не как факт нашего продукта.

## Evidence grade

| Grade | Что считается |
|---|---|
| P0 | Runtime readback + отрицательный сценарий на нужной роли/версии |
| P1 | Воспроизводимый QA/test output с expected/actual |
| P2 | Code/config/schema proof без runtime acceptance |
| P3 | Owner/developer confirmation |
| P4 | ТЗ, макет, static HTML, конкурентный pattern |

## Перед изменением статуса

- [ ] `packet_ready` означает только достаточность постановки.
- [ ] `implementation_in_progress` требует подтверждения исполнителя, но не повышает `% сайта`.
- [ ] `implemented_unverified` требует code/build ref.
- [ ] `runtime_verified` требует positive + negative runtime evidence.
- [ ] `accepted` требует выполнение acceptance и отсутствие незакрытого P0 residual.
- [ ] Для каждого перехода указан новый proof ref.

## Обязательный challenge pass

- [ ] Где мы можем быть неправы?
- [ ] Какой факт основан только на словах владельца/исполнителя?
- [ ] Есть ли противоположный runtime evidence?
- [ ] Может ли UI скрывать данные, которые backend всё ещё отдаёт?
- [ ] Может ли частичный event coverage выглядеть как полный KPI?
- [ ] Не создаём ли вторую source of truth?
- [ ] Улучшает ли новый процесс качество, скорость или ясность приёмки?

## Минимальный QA envelope

```text
goal/task:
claim:
status_before -> status_after:
environment/build:
role/account type:
preconditions:
steps:
expected:
actual:
positive proof:
negative proof:
source refs:
residual:
next owner/action:
```

## Goal-specific gates

- [ ] G1: trial, paid, one-session rule, one balance-pause, resume/timeout, abnormal end.
- [ ] G2: started-minute rounding, snapshot, accrual, partial/full refund, override audit.
- [ ] G3: page type, city/category filter, eligibility, online/busy/off/admin states, KPI threshold.
- [ ] G4: ticket -> session -> exactly one financial correction.
- [ ] G5: event trigger, deduplication, freshness, coverage, `insufficient_data`.
- [ ] G6: assigned positive; foreign profile/dialog/send negative; reassignment atomicity; actual-agent audit.

## Stop conditions

- Нет source ref.
- Есть только static artifact.
- Версия runtime неизвестна.
- Нет отрицательного сценария для ACL/денег.
- Confideline proof смешан с Nebula/Oracle strategy.
- Один claim имеет два противоречащих активных статуса.
