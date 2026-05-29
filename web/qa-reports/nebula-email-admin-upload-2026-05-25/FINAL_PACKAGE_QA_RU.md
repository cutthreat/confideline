# Финальная проверка пакета email-шаблонов

Дата проверки: 2026-05-29

## Итог

Пакет готов для передачи программисту и тестирования сценариев email-уведомлений. Проверка закрывает шаблоны, вкладки веб-панели, сценарии настроек, flow-цепочки, словарь переменных, RU/EN версии и список backend-доработок.

## Что проверено

| Блок | Статус | Результат |
|---|---:|---|
| Русские шаблоны | PASS | 20 шаблонов |
| Английские шаблоны | PASS | 20 шаблонов |
| HTML-тела писем | PASS | 60 файлов body/source/wrapped |
| Индекс RU/EN | PASS | 40 строк: 20 RU + 20 EN |
| Дубли настроек админки | PASS | 0 дублей по event_name + condition_id + delay |
| Битые ссылки на вкладках | PASS | 0 битых ссылок |
| Технический мусор | PASS | 0 найденных следов внутренних записей, медиафайлов с комментариями, локальных путей, служебных пометок, чернового текста и локальных адресов |
| Жестко прошитое рабочее название | PASS | 0 в клиентском пакете |
| Справочник переменных | PASS | 39 строк, табличный HTML + CSV + JSON |
| Список backend-доработок | PASS | Отдельная вкладка для Игоря + CSV/JSON |

## Ключевые логические исправления

| Сценарий | Решение |
|---|---|
| Сообщение клиента в оплаченный чат | `message.client_submitted`, чтобы не конфликтовать с ответом эксперта |
| Ответ эксперта клиенту | `message.received`, только для видимого ответа эксперта клиенту |
| Промежуточное обновление возврата | `payment.refund.update`, отдельно от финального refund |
| Финальный возврат | `payment.refund` |
| Запрос отзыва | `review.request`, а `review.left` только отменяет pending request |

## Текущая backend-готовность

| Категория | Количество | Пояснение |
|---|---:|---|
| Можно обновлять существующие live-шаблоны | 2 | `user_registration`, `email_confirmation` |
| Создать в админке после проверки trigger binding | 9 | События есть или близки к текущему dropdown, но payload надо проверить |
| Сначала backend-доработка | 9 | Нужны новые события или недостающие переменные |
| Недостающие backend-переменные | 36 | Полный список в `IGOR_MISSING_BACKEND_VARIABLES_RU.csv` |
| Недостающие backend-события | 12 | Полный список в `IGOR_MISSING_BACKEND_EVENTS_RU.csv` |

## Недостающие события для Игоря

| Приоритет | event_name | Шаблон |
|---|---|---|
| P0 | `message.client_submitted` | `chat_message_received` |
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

1. `SCENARIOS_IMPLEMENTATION_PANEL_RU.html`
2. `BACKEND_EMAIL_EVENTS_CONTRACT_RU.html`
3. `EVENT_VARIABLE_COMPATIBILITY_RU.csv`
4. `IGOR_BACKEND_TASKS_RU.html`
5. `ADMIN_UPLOAD_INDEX_RU_EN.json`
6. `templates/*/admin-meta.json`

Сначала обновляются 2 существующих live-шаблона. Остальные шаблоны загружаются только после проверки event binding, condition, delay и доступности переменных.
