# Vertical 5: MVP operations — критические уведомления, KPI readback и staff workspace

Дата: 2026-07-29  
Статус: `P0_MVP_requirement_handoff_ready_not_runtime_verified`  
Coverage: G4.4, G5.3, G6.6

Имя файла сохранено для совместимости ссылок. В текущей шестимесячной программе это P0 MVP-пакет, содержащий только обязательный MVP-срез. Automation/KPI-scale extensions G3.6/G3.7 находятся в `post-mvp-backlog-2026-07-29.md` и не являются скрытой частью этого handoff.

## Результат

- Критические support/refund/safety события получают owner, дедупликацию, deadline и escalation.
- Super-admin видит минимальную объяснимую KPI-таблицу для ручного решения о состоянии пилота.
- KPI influence на публичную выдачу остаётся `disabled`.
- Staff работает в идентифицируемой ролевой поверхности; URL не заменяет server-side ACL.

## P0 build-ready режим

- Support alert создаётся только для утверждённых критических событий и остаётся доступным в staff workflow, даже если email не доставлен.
- Повтор события не создаёт второй incident; overdue и resolution сохраняют audit.
- KPI readback показывает формулу, окно, sample, no-data/insufficient-data, применённую версию и источник факта.
- New Agent и малая выборка дают `insufficient_data`, а не нулевое качество.
- KPI не смешивается с public rating и не меняет выдачу.
- Staff URL, navigation и прямые действия проверяются для разрешённой и чужой роли.

## Owner enablement gates

- O1 задаёт критические SLA/escalation values через админ-панель.
- O3 фиксирует KPI readback и `disabled` для влияния на выдачу.
- Все изменяемые KPI и notification values имеют validation, version, audit, preview/readback и безопасный fallback.
- Некритические дайджесты, browser push, дополнительные каналы, predictive BI и KPI-ротация не входят в MVP.

## Acceptance suite

| ID | Сценарий | PASS |
|---|---|---|
| S1 | Critical support/refund/safety event | Создан один incident с owner и deadline |
| S2 | Повторная доставка события | Дубль не создан, исходный incident возвращён |
| S3 | Overdue critical incident | Создана одна объяснимая escalation |
| S4 | Email delivery failure | Staff incident остаётся открытым и видимым |
| S5 | New Agent/low sample | `insufficient_data`, без скрытого штрафа |
| S6 | KPI disabled | Public выдача не меняется от KPI |
| S7 | Refund/reassignment | Historical KPI attribution не переписана |
| S8 | Staff navigation | Нет dead actions и role confusion |
| S9 | Direct path foreign role | Запрещено server-side |
| S10 | Mobile critical action | Доступно без перекрытия; ограничения явно указаны |

## Stop

Пакет не принимается без critical incident readback, KPI formula/version readback и server-side role proof. Наличие URL, UI-badge или отправленного email не является достаточным доказательством.

Rollback: только task-local документ и ссылки.
