# Финальная проверка пакета email-шаблонов

Дата проверки: 2026-06-01

## Итог

Пакет приведен к текущей MVP-логике: email-сценарий `advisor_chat_reply_ready` использует существующее backend-событие `MESSAGE_RECEIVED / message.received`, потому что других email-сообщений, кроме ответа эксперта клиенту, на текущем этапе нет. Отдельный сценарий сообщения клиента удален из пакета.

## Что проверено

| Блок | Статус | Результат |
|---|---:|---|
| Английские шаблоны | PASS | 19 шаблонов; English primary |
| Русские шаблоны | PASS | 19 шаблонов; Russian localization/review |
| HTML-тела писем | PASS | 38 языковых файлов body_email_html.html: 19 EN + 19 RU |
| Индекс RU/EN | PASS | 38 строк: 19 EN + 19 RU |
| Сценарии | PASS | 19 сценариев |
| Chat event logic | PASS | `advisor_chat_reply_ready` = `message.received`; отдельного события для сообщения клиента нет |
| Единая структура файлов | PASS | В папках сценариев нет корневых дублей; файлы лежат только в `en/` и `ru/` |
| Справочник переменных | PASS | 39 строк, табличный HTML + CSV + JSON |
| Список backend-доработок | PASS | Отдельная вкладка для Игоря + CSV/JSON |
| English-first старт | PASS | `START_HERE_FOR_DEVELOPER_EN.html` и `FILE_STRUCTURE_FOR_IMPORT_EN.html` |

## Ключевые логические исправления

| Сценарий | Решение |
|---|---|
| Ответ эксперта клиенту | `message.received`; использовать текущий `MESSAGE_RECEIVED` |
| Сообщение клиента в чат | Не выделять в email-шаблон; отдельный backend event для сообщения клиента не нужен |
| Промежуточное обновление возврата | `payment.refund.update`, отдельно от финального refund |
| Финальный возврат | `payment.refund` |
| Запрос отзыва | `review.request`; `review.left` только факт оставленного отзыва |

## Текущая backend-готовность

| Категория | Количество | Пояснение |
|---|---:|---|
| Обновить существующие live-шаблоны | 2 | `user_registration`, `email_confirmation` |
| Создать в админке после проверки trigger binding | 6 | События есть в текущем dropdown или уже заложены в backend-контракте |
| Сначала backend-доработка | 11 | Нужны новые события или недостающие переменные |
| Недостающие backend-переменные | 36 | Полный список в `IGOR_MISSING_BACKEND_VARIABLES_RU.csv` |
| Недостающие backend-события | 11 | Полный список в `IGOR_MISSING_BACKEND_EVENTS_RU.csv` |

## Недостающие события для Игоря

| Приоритет | event_name | Шаблон |
|---|---|---|
| P1 | `message.answer_delayed` | `chat_sla_delay` |
| P1 | `message.no_first_chat_message` | `paid_chat_no_message_reminder` |
| P1 | `payment.refund.update` | `refund_case_update` |
| P1 | `review.request` | `review_request` |
| P1 | `security.security_change` | `security_change_alert` |
| P1 | `support.safety_notice` | `safety_notice` |
| P1 | `support.ticket.opened` | `support_ticket_opened` |
| P1 | `user.age_restricted` | `minor_or_age_restriction_notice` |
| P1 | `user.password_recovery` | `password_reset` |
| P2 | `advisor.followup.offer` | `same_advisor_followup_offer` |
| P2 | `message.chat_saved` | `d2_chat_reflection` |

## Правило внедрения

Программист вместе с Codex должен идти не по визуальному списку, а по связке:

1. `START_HERE_FOR_DEVELOPER_EN.html`
2. `FILE_STRUCTURE_FOR_IMPORT_EN.html`
3. `ADMIN_UPLOAD_INDEX_RU_EN.json`
4. `SCENARIOS_IMPLEMENTATION_PANEL_RU.html`
5. `BACKEND_EMAIL_EVENTS_CONTRACT_RU.html`
6. `EVENT_VARIABLE_COMPATIBILITY_RU.csv`
7. `IGOR_BACKEND_TASKS_RU.html`
8. `templates/*/{en,ru}/admin-meta.json`

Сначала обновляются 2 существующих live-шаблона. Остальные шаблоны загружаются только после проверки event binding, condition, delay и доступности переменных.

