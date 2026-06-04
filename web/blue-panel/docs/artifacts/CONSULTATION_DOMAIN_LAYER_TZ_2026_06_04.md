# ТЗ Игорю: минимальный слой платной услуги / консультации

Дата: 2026-06-04
Связано с Trello: Проверка страниц и функций перед запуском рекламы
Статус PM: готово как co2p-пакет для согласования и передачи в разработку.

## Конечная цель

Сделать минимальный backend-слой платной P2P-услуги, чтобы после тестовой оплаты возникала не просто запись `Order COMPLETED` и начисление credits, а управляемая рабочая сессия услуги: вопрос клиента, исполнитель, чат, сроки, события, поддержка и качество.

Для универсальности backend-сущность лучше назвать `service_session`. В Nebula интерфейсе она отображается как `консультация`. Для других ниш она может называться `сессия`, `запрос`, `заказ услуги`, `чат с исполнителем`.

## Почему это нужно

Сейчас платформа имеет важные базовые части: order/payment, credits, users/profiles, messages/conversations, expert applications, admin chat, analytics. Но нет доказанной доменной связки:

`оплата -> вопрос клиента -> платная услуга -> назначение исполнителя -> чат -> ответ -> support/refund -> качество/начисление`.

Без этого нельзя запускать рекламу, потому что клиент может оплатить, а команда не будет иметь надежного рабочего объекта, по которому понятно: что куплено, кто отвечает, где чат, какой срок, что делать при проблеме.

## Scope

Входит:
- `service_session` как минимальная рабочая сущность платной услуги;
- связь с `order`, клиентом, вопросом, исполнителем, чатом;
- admin queues для ручного управления первыми 5 экспертами;
- test/sandbox mode;
- no-send события;
- support/refund связь;
- QA proof по одному тестовому заказу.

Не входит:
- реальные платежи;
- реальные письма клиентам;
- автоматические выплаты экспертам;
- финальная юридическая публикация;
- полноценная LMS/школа экспертов;
- масштабирование подписок/AI.

## Минимальная модель данных

### service_session

- `id`
- `order_id`
- `client_id`
- `vertical` (`nebula`, позже другие ниши)
- `service_type` (`text_consultation`, позже другие форматы)
- `advisor_profile_id` или `expert_profile_id`
- `assigned_user_id` / `agent_id`
- `question_text`
- `question_language`
- `status`
- `payment_status`
- `conversation_id`
- `deadline_at`
- `answered_at`
- `closed_at`
- `support_ticket_id`
- `test_mode`
- `source`
- `utm_data`
- `metadata`
- `created_at`
- `updated_at`

### service_session_event

- `id`
- `service_session_id`
- `order_id`
- `event_type`
- `recipient_type`
- `recipient_id`
- `send_mode` (`no_send`, `queued`, `sent`, `failed`)
- `payload`
- `created_at`

### service_session_quality

- `id`
- `service_session_id`
- `reviewer_id`
- `score`
- `issue_type`
- `comment`
- `decision`
- `created_at`

## Статусы service_session

- `draft`: клиент начал путь, но услуга еще не оплачена/не подтверждена.
- `waiting_question`: заказ есть, но вопрос не заполнен.
- `paid_waiting_assignment`: оплата подтверждена, нужен исполнитель.
- `assigned`: исполнитель назначен.
- `in_work`: исполнитель открыл/ведет консультацию.
- `answered`: ответ отправлен клиенту.
- `closed`: консультация закрыта.
- `overdue`: срок ответа нарушен.
- `disputed`: клиент недоволен или открыт спор.
- `refund_requested`: запрошен возврат.
- `refunded`: возврат подтвержден.
- `cancelled`: заказ отменен.
- `payment_failed`: оплата не прошла.

## Админские очереди

- Новые оплаченные без назначения.
- Оплачено, но нет вопроса.
- В работе у эксперта/агента.
- Просрочено.
- Ответ отправлен, нужно закрыть/проверить качество.
- Спор / жалоба / возврат.
- Тестовые сессии.

## События no-send

- `checkout_start`
- `checkout_complete`
- `payment_failed`
- `payment_cancelled`
- `question_submitted`
- `service_session_created`
- `expert_assigned`
- `answer_started`
- `answer_sent`
- `deadline_overdue`
- `support_ticket_created`
- `refund_requested`
- `refund_approved`
- `refund_declined`
- `session_closed`

На этапе проверки все события должны фиксироваться без реальной отправки писем.

## Правила работы

1. Реальный payment provider не используется в тесте.
2. `test_mode = 1` отделяет тестовые данные от боевых.
3. Fake success из sandbox не должен просто начислять credits и теряться: он должен создавать/активировать `service_session`.
4. Cancel/fail не создают рабочую платную консультацию.
5. Refund/support не являются только платежной операцией: они должны быть видны в контексте сессии услуги.
6. Чат должен иметь явную связь с `service_session` или связь через `conversation_id`.
7. Эксперт/агент должен видеть только нужный контекст: вопрос, клиентский профиль, срок, подсказки, историю, статус.
8. Админ должен видеть все проблемные состояния без ручного поиска.

## Acceptance criteria

1. После fake checkout success создан или активирован `service_session`.
2. `service_session` связан с `order_id`, клиентом и вопросом.
3. В админке есть очередь `paid_waiting_assignment`.
4. Админ может назначить эксперта/агента.
5. Эксперт/агент видит задачу и отвечает в связанном чате.
6. Ответ меняет статус на `answered`.
7. Просрочка меняет статус на `overdue` или попадает в очередь просрочек.
8. Support ticket может быть связан с `service_session`.
9. Refund state виден в контексте `service_session`.
10. No-send события фиксируются, реальные письма не уходят.
11. Test data можно отфильтровать в админке/отчете.
12. QA proof опубликован в Blue Panel со скринами клиента, sandbox checkout, order, service_session, expert task, chat, events, support/problem state.

## QA сценарий

1. Создать тестовый заказ через sandbox checkout.
2. Получить fake success.
3. Проверить `Order COMPLETED/test`.
4. Проверить созданную `service_session`.
5. Заполнить/проверить вопрос клиента.
6. Назначить эксперта/агента.
7. Отправить ответ в чате.
8. Проверить no-send события.
9. Создать проблемный сценарий: просрочка или жалоба.
10. Проверить support/refund связь.
11. Сохранить proof-отчет.

## Stop conditions

- Появилась попытка реального платежа.
- Ушло реальное письмо клиенту.
- Test data смешались с боевыми.
- Нельзя доказать связь `order -> service_session`.
- Нельзя доказать связь `service_session -> chat`.
