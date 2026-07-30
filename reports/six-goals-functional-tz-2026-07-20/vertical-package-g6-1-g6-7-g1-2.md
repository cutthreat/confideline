# Первый vertical programmer/QA packet: G6.1 + G6.7 + G1.2

Дата: 2026-07-20  
Статус: `requirement_handoff_ready_not_runtime_verified`  
Фаза: `pilot_core`  
Продуктовый статус: `NO_GO` до authenticated runtime acceptance
Coverage: G6.1, G6.7, G1.2

## Цель

На одной сопоставленной сборке доказать сквозную цепочку `назначение анкеты -> изолированный staff-доступ -> ответ агента от назначенной анкеты -> actual actor readback` без доступа к чужим данным и без переписывания истории.

## Scope

- G6.1: initial assignment, несколько анкет одному агенту, reassignment и history.
- G6.7: assigned-only доступ для agent и минимальные области support/moderator.
- G1.2: чтение/отправка от назначенной анкеты, client-visible expert identity и super-admin actual actor.

Не входит: billing/session lifecycle G1.1/G1.3/G2, полноценный staff workspace G6.6, SLA/QA/admission, изменение архитектуры или способа реализации.

## Обязательное поведение

1. Только super-admin назначает и переназначает expert profile.
2. У expert profile не более одного active agent assignment; один agent может иметь несколько profiles.
3. Agent видит и использует только assigned profiles, их разрешенных clients/dialogs и действия.
4. Foreign profile/dialog/client недоступны через list, search, direct path, сохраненную ссылку и send action.
5. Клиент видит сообщение expert profile; super-admin отдельно видит actual agent.
6. Contact/sensitive-data guard действует server-side в обе стороны до показа получателю: отправитель видит original + policy warning, получатель — `ЦЕНЗУРА`, а moderation incident хранит actor/category/rule и restricted evidence по действующей retention/access policy.
6. Reassignment после завершенной consultation передает будущую работу новому agent, сохраняет старую историю и actual actor.
7. Старый agent после reassignment не читает и не отправляет новые сообщения этой анкеты.
8. Reassignment во время paid/pause запрещен без частичного переноса, нового доступа или побочного финансового результата.
9. UI hiding не является acceptance: запрет подтверждается фактическим direct action.
10. Повтор assignment/retry не создает вторую активную связь или дубликат результата.

## Build handoff программиста

```text
task IDs в версии: G6.1, G6.7, G1.2
окружение:
build/commit marker:
что реализовано:
что отсутствует:
пути client/agent/support/moderator/super-admin:
обезличенные тестовые роли и объекты:
известные ограничения:
готовность к QA: yes/no
```

Без заполненного build marker и role paths QA не начинает приемку.

## Минимальный тестовый набор

| ID | Actor | Сценарий | Ожидаемый результат |
|---|---|---|---|
| V1 | super-admin | Назначить profile A agent 1 | Assignment виден обеим разрешенным staff-ролям; одна active связь |
| V2 | super-admin | Назначить profiles A/B agent 1 | Оба доступны agent 1 без смешения dialogs |
| V3 | agent 1 | Read/send profile A | Разрешено; client видит profile A, super-admin видит agent 1 |
| V4 | agent 1 | Read profile C другого agent | Запрещено без раскрытия данных |
| V5 | agent 1 | Direct path к foreign dialog | Тот же запрет, что через UI |
| V6 | agent 1 | Send as foreign profile C | Запрещено; сообщение не создано |
| V7 | support/moderator | Доступ за пределами своей области | Запрещено; минимальный разрешенный scope сохранен |
| V8 | super-admin | Reassign A от agent 1 к agent 2 после end | Новый agent получает будущую работу; старое авторство сохранено |
| V9 | agent 1 | Read/send A после reassignment | Запрещено |
| V10 | agent 2 | Read/send A после reassignment | Разрешено; actual actor = agent 2 |
| V11 | super-admin | Reassign во время paid/pause | Запрещено; assignment/session/history не изменены |
| V12 | client/agent | Отправить phone/email/messenger/external contact | Sender видит original + warning; recipient получает `ЦЕНЗУРА`; один incident |
| V13 | client/agent | Obfuscated/split contact или direct send | Тот же server-side censorship; один связанный incident без raw value у recipient |
| V14 | client/agent | Benign date/time/price и approved internal link | Нет необоснованной цензуры |
| V15 | client/agent | Uninspectable attachment/QR | Fail-closed либо approved secure-support route |
| V12 | две попытки | Concurrent/retry assignment | Один согласованный итог, без двух active связей |
| V13 | audit role | Открыть assignment/access history | Видны actor, время, from/to, причина и critical denial |
| V14 | client | Просмотреть сообщения до/после reassignment | Expert identity стабильна; internal agent не раскрыт |

## Evidence packet

Для каждого V1-V14:

```text
test ID:
build marker:
actor/role:
обезличенный object ID:
expected:
actual:
result: PASS/FAIL/BLOCKED
proof ref:
cleanup/rollback result:
```

Обязательные агрегаты: role matrix, assignment history before/after, message actual-actor readback, список дефектов `expected/actual/proof`, подтверждение возврата тестовых настроек.

## Acceptance

- QA: все V1-V14 имеют PASS на одной build marker; BLOCKED и missing proof не считаются PASS.
- PM: подтверждены G6.1/G6.7/G1.2 без расширения scope.
- Антон: client identity, запреты и error states понятны и не обещают недоступное действие.
- Evidence Lead: positive и negative proof сопоставимы, direct-path запреты проверены.
- Только после этого задачи переходят `requirement_defined -> runtime_verified -> accepted`.

## Stop conditions

- Нет authenticated test roles или build marker.
- Нельзя безопасно отделить assigned от foreign objects.
- Проверка требует live payment, публикации, browser-profile internals или секретов.
- Обнаружено переписывание history/actual actor либо foreign access: пакет возвращается программисту как P0.

## Источники и границы

- `tz-g6-assignment-sla-quality-access.md`, G6.1/G6.7.
- `tz-g1-chat-service-session.md`, G1.2.
- `delivery-matrix.md` и общий Definition of Done из `README.md`.
- Claim class: owner-approved functional requirement; не runtime proof.
- Knowledge pointer `expert-training-and-operational-knowledge.md` проверен, но его recovery-corpus paths на 2026-07-20 отсутствуют; они не использованы как доказательство этого packet.

Rollback: удалить только этот task-local packet и отменить его ссылки в README/index/ledger; runtime/source code не изменяется.
