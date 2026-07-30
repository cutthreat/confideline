# Gemini review result: функциональные ТЗ G1-G6

Дата: 2026-07-20  
Gemini surface: Pro Extended  
Conversation: `https://gemini.google.com/app/873f5d6c3c3b9d91`  
Payload safety: 11/11 files `pass`  
Verdict Gemini: `revise`

## Coverage

Gemini вернул все 30 task codes. Статус первого прохода:

- `pass`: 23 задачи.
- `revise`: G1.3, G2.2, G3.4, G3.7, G4.3, G6.1, G6.2.
- `blocked`: 0.

## Принятые замечания

1. Усилен concurrent-start acceptance: один успешный start, остальные без session/debit/accrual.
2. Добавлен конфликт paid-start vs reassignment как функциональный инвариант.
3. Уточнена продуктовая семантика pin/priority/weight без задания алгоритма.
4. Client-visible price/trial/pause values обязаны соответствовать применимым правилам/session.
5. Повторный support case по той же проблеме дополняет существующий либо создается как явно отдельная связанная проблема.
6. Event lineage после reassignment обязана сохранять actual agent/client/expert/session периода.
7. Два непокрытых owner decisions вынесены отдельно: trial с нулевым балансом и agent disconnect/reconnect.

## Отклоненные как implementation prescription

- Требование конкретного atomic lock/transaction.
- Обязательная структура API/payload.
- Конкретный тип integer/float и алгоритм ranking weight.
- Конкретный backend rules/snapshot API.
- Конкретный websocket threshold без owner decision.

В ТЗ сохранены проверяемые продуктовые результаты; способ реализации остается у программиста.

## Подтвержденные границы

Gemini отдельно подтвердил отсутствие необходимости:

- автоматической pause только из-за краткого client disconnect;
- profile cap одного агента;
- автоматического изменения public rating из internal QA.

## Owner questions resolution

1. Trial end + consent + insufficient balance: одна balance pause без списания; admin-managed, текущее значение 5 минут.
2. Agent disconnect/logout during paid/pause: admin-managed reconnect grace, текущее значение 60 секунд; новая minute не начинается, затем technical end, top-up остается на балансе.

Owner answers получены 2026-07-20. G1.3/G2.2/G3.1/G6.2 точечно обновлены; повторный bounded review сохранил product/implementation boundary и runtime proof gate.
