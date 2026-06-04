# ТЗ Игорю: слой платной услуги на backend

## Решение PM

В backend нужна универсальная сущность `service_session`. В Nebula она отображается как “консультация”, но архитектурно это слой платной P2P-услуги для всей платформы YouDate.

## Почему это нужно

Текущий backend доказывает пользователей, анкеты, сообщения, заявки экспертов, order/payment и credits/balance. Но платная консультация как цельный lifecycle не доказана: нет надежной связки order, вопроса клиента, исполнителя, чата, SLA, событий, support/refund и качества.

## Scope

Только local/test. Без production, реальных Stripe keys, реальных платежей и реальных писем.

## Минимальная модель

`service_session`: `id`, `order_id`, `client_id`, `vertical`, `service_type`, `offer_id`, `status`, `payment_status`, `test_mode`, `question_text`, `question_language`, `client_locale`, `assigned_expert_profile_id`, `assigned_agent_id`, `conversation_id`, `deadline_at`, `answered_at`, `closed_at`, `dispute_status`, `refund_status`, `quality_status`, `metadata`, `created_at`, `updated_at`.

Дополнительно: `service_session_event`, `service_session_assignment`, связь с `support_ticket`, quality/compensation layer.

## Статусы

`draft`, `question_pending`, `payment_pending`, `paid_waiting_assignment`, `assigned`, `in_work`, `answered`, `closed`, `overdue`, `disputed`, `refund_review`, `refunded`, `cancelled`, `payment_failed`.

## Очереди админки

Новые оплаченные; нужен вопрос; в работе; просрочено; ответ на проверке; споры и возвраты; закрыто; тестовый режим.

## Acceptance criteria

1. Fake success создает order + `service_session`.
2. Cancel/fail не создают оплаченную услугу.
3. Вопрос клиента связан с услугой.
4. Админ видит очередь и карточку услуги.
5. Эксперт/агент видит назначенную задачу, вопрос, срок и чат.
6. Chat/conversation связан с услугой.
7. No-send события фиксируются без реальных писем.
8. Support/refund связан с конкретным order и услугой.
9. Test data отделяется от реальных данных.

## Стоп-условия

Не закрывать задачу, если используется только credits top-up вместо платной услуги; нет связи order с вопросом; нет очереди админки; нет связи с исполнителем; нет test mode; нет problem states; нет proof-скринов; не подтвержден актуальный runtime source.

## Proof-links

- `backend-consultation-domain-gap-proof.html`
- `test-order-sandbox-preflight-report.html`
- `igor-sandbox-checkout-to-consultation-handoff.html`
- `test-order-runtime-proof-plan.html`
