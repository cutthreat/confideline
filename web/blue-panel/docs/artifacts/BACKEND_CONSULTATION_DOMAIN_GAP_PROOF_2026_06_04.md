# Backend proof: доменный разрыв платной консультации Nebula

Дата: 2026-06-04
Проверенный source: `H:\GPT-Codex\Confideline\Chat\youdate-2.0.2-yii2\Source\youdate_extracted\application`
Ограничение: source-level proof, без изменения backend и без production.

## Что проверялось

Проверялось наличие backend-сущностей и экранов, которые могли бы закрывать платную текстовую консультацию Nebula:

- consultation / paid session;
- client question;
- связь order -> question -> consultation;
- назначение expert/agent на консультацию;
- admin queue консультаций;
- экспертский чат, привязанный к консультации;
- события/no-send по консультации;
- support/refund связь с консультацией.

## Факты из source

1. В `application/models` нет моделей `Consultation`, `Question`, `PaidSession` или аналогичной явной сущности платной консультации.
2. Есть `Order`, `Balance`, `BalanceTransaction`, `Message`, `Conversation`, `ExpertApplication`, `Notification`.
3. `Order` поддерживает статусы `NEW`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` и payment methods `stripe`, `paypal`, `robokassa`.
4. `Checkout::successPayment()` увеличивает баланс/credits и переводит order в `COMPLETED`.
5. `ExpertApplication` является заявкой эксперта и прямо не создает public advisor profile или paid-session access.
6. `ExpertApplicationController` закрывает очередь/статусы заявок экспертов, но не консультации клиентов.
7. `PartnerInteractionAnalyticsService` агрегирует действия между клиентами и assigned experts: messages, gifts, likes, photo access, reports; это аналитика общения, не paid consultation lifecycle.
8. `message/expert-preview.php` показывает iframe preview экспертского CRM, но это не runtime-модель consultation/order/question.

## PM-вывод

Текущий backend содержит важные универсальные части платформы: пользователи, анкеты, сообщения, админский чат, платежный order/credits, заявки экспертов, аналитика взаимодействий. Но платная консультация Nebula как доменный объект не доказана.

MVP нельзя считать готовым, пока не появится или не будет подтверждена связка:

`Order -> ClientQuestion -> Consultation -> Expert/Agent assignment -> ConsultationChat -> Events -> Support/Refund -> Quality/Compensation`.

## Решение PM

Не называть существующий dating/chat/order функционал готовой консультацией. Его нужно использовать как базу, но добавить Nebula/service слой платной консультации.

## Следующая задача Игорю

Спроектировать и реализовать минимальный consultation domain layer для тестового заказа:

- `consultation` или аналогичная сущность;
- связь с `order_id`, `client_id`, `question_text`, `expert_id/agent_id`, `chat/conversation_id`, `status`, `deadline_at`, `test_mode`;
- admin queue: new paid, waiting question, waiting assignment, in work, overdue, answered, closed, disputed/refund;
- no-send события;
- support ticket связь;
- QA proof по одному test order.
