# Сквозное функциональное ТЗ: управляемые настройки админ-панели

Дата: 2026-07-21  
Статус: `requirement_defined_O1_O2_O3_O6_O7_O8_values_accepted_not_runtime_verified`  
Область: все G1-G6 функции, поведение которых зависит от изменяемого времени, порога, режима или правила.

## Требуемый результат

Принятые продуктовые значения не зашиваются как неизменяемые константы. Уполномоченная staff-роль управляет ими в админ-панели, видит фактически сохраненное значение и его версию, а каждая session, SLA-clock, case, quality review, admission или KPI period сохраняет примененную версию для последующего QA и спора.

## Принятые текущие значения

| Настройка | Текущее значение | Единица/режим | Где применяется |
|---|---:|---|---|
| Paid request accept/decline SLA | 60 | секунд | новый paid request |
| First meaningful response SLA | 60 | секунд | фактически начавшаяся consultation |
| Support first response SLA | 15 | минут в настроенные support hours | новый support case |
| Ordinary breach escalation | 2 | множитель применимого SLA | некритический overdue |
| Critical payment/access/safety incident | immediate | режим | critical incident |
| Balance pause duration | 5 | минут | единственная pause конкретной session |
| Agent reconnect grace | 60 | секунд | disconnect во время paid/pause |

Async queue в limited pilot измеряется для readback, но не имеет отдельного hard SLA и не влияет на санкции/KPI. Busy paid/pause исключается из ее времени. Отдельный threshold можно включить позже только как новую версионированную admin-настройку.

## Обязательное поведение админ-панели

1. Каждая настройка имеет отдельное понятное название, текущее значение, единицу или режим и краткое описание области применения.
2. Просмотр и изменение доступны только разрешенной staff-роли; наличие URL или скрытой кнопки не дает право изменения.
3. Сохранение различает pending, success и failure. После success экран показывает фактически сохраненное значение, а не только введенный текст.
4. Недопустимое, пустое или неразбираемое значение не заменяет последнее корректное и дает понятную ошибку.
5. Для изменения сохраняются старое значение, новое значение, actor, время, версия и причина/комментарий.
6. Staff может увидеть историю и действующую версию без чтения внутренних данных или кода.
7. Настройка support hours/calendar/timezone является отдельной operational admin-конфигурацией. Ее отсутствие показывается как `configuration_missing`, а не как соблюденный SLA.
8. Critical mode `immediate` не заменяется обычным multiplier и всегда создает немедленный staff action/escalation.
9. Возврат к предыдущему корректному значению выполняется как новое аудируемое изменение, без переписывания истории.
10. Одновременная или повторная отправка не создает две конкурирующие активные версии.

## Правило применения и snapshot

1. При старте соответствующего периода система фиксирует примененное значение и версию.
2. Изменение настройки влияет только на периоды, начавшиеся после успешного сохранения.
3. Уже идущие paid request SLA, response SLA, support SLA, balance pause и reconnect grace сохраняют прежний deadline.
4. Reassignment, reopen или retry не переписывают примененное значение и не сбрасывают clock без отдельного разрешенного продуктового перехода.
5. Case/session/staff readback показывает примененные значение, версию, start, исключения, deadline, breach и escalation result.

## Приемка

| ID | Сценарий | PASS |
|---|---|---|
| AS1 | Authorized read/change/readback | Новое значение сохранено и показано с новой версией |
| AS2 | Unauthorized direct/UI change | Запрещено; действующее значение не изменено |
| AS3 | Invalid/blank value | Ошибка понятна; последнее корректное значение сохранено |
| AS4 | Change во время активного clock | Текущий deadline прежний; следующий clock использует новое значение |
| AS5 | Retry/double submit | Одна согласованная активная версия |
| AS6 | History/audit | Видны old/new, actor, time, reason и version |
| AS7 | Support schedule unset | `configuration_missing`, не ложный pass |
| AS8 | Critical incident | Немедленная escalation независимо от ordinary multiplier |
| AS9 | Rollback to prior value | Новая аудируемая версия; старая история не переписана |
| AS10 | Session/case dispute readback | Примененная версия совпадает с фактическим deadline/result |

## Runtime boundary

Форма, static mockup или сохранение без readback не доказывают работу настройки. Runtime acceptance требует mapped build, разрешенную и запрещенную роли, изменение значения, активный/новый clock, audit history и negative cases.
