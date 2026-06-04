# Пакет Игорю: связать sandbox checkout с тестовой консультацией

Дата: 2026-06-04
Карточка Trello: Проверка страниц и функций перед запуском рекламы
Статус PM: готово к согласованию/передаче Игорю
Ограничения: только локальный/test контур, без production, без реальных платежей, без реальных email.

## Источник правды по коду

Для анализа использован вариант:
`H:\GPT-Codex\Confideline\Chat\youdate-2.0.2-yii2\Source\youdate_extracted`

`Chat/README.md` говорит, что в `Confideline/Chat` несколько вариантов и нет единого canonical source по умолчанию. Поэтому Игорю нужно подтвердить, что именно этот вариант является целевым для внедрения, либо указать актуальный runtime-путь.

## Что уже найдено в коде

1. `application/controllers/BalanceController.php`
   - `actionStripeCreateSession()` уже возвращает `checkoutUrl`, если задан `CONFIDELINE_STRIPE_API_BASE` и у session есть `url`.

2. `application/payments/StripeCheckout.php`
   - `configureStripe()` уже задает `Stripe::$apiBase = rtrim($sandboxApiBase, '/')`, если задан `CONFIDELINE_STRIPE_API_BASE`.

3. `application/payments/Checkout.php`
   - `successPayment()` ищет `Order` по payment id, увеличивает баланс пользователя и переводит order в `COMPLETED`.

4. `application/models/Order.php`
   - базовые статусы: `NEW`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.
   - payment methods: `stripe`, `paypal`, `robokassa`.

## PM-вывод

Sandbox hook в найденном Yii2-варианте уже частично есть. Главный незакрытый разрыв не в fake provider, а в доменной логике Nebula: успешная оплата сейчас доказывает платеж/кредиты, но не доказывает создание консультации, вопроса, назначения эксперта, чата, no-send событий и support-связки.

## Задача Игорю

Сделать или подтвердить безопасный test-mode маршрут:

`клиент выбирает услугу -> создается Order в test/sandbox режиме -> открывается fake checkout -> fake success -> Order становится COMPLETED -> создается/привязывается Consultation -> вопрос клиента связан с Order/Consultation -> админ видит карточку -> эксперт/агент видит задачу -> чат привязан к Consultation -> события фиксируются без отправки писем`.

## Что нельзя делать

- Не подключать `CONFIDELINE_STRIPE_API_BASE` к production.
- Не использовать реальные Stripe keys или реальные карты.
- Не отправлять sandbox webhook на production URL.
- Не отправлять реальные письма клиентам.
- Не считать `Order COMPLETED + credits added` готовой консультацией.

## Минимальные изменения / подтверждения

1. Подтвердить целевой backend-путь для внедрения.
2. Подтвердить, что sandbox hook в `BalanceController` и `StripeCheckout` есть в фактическом runtime, а не только в extracted source.
3. Добавить флаг test/sandbox order, чтобы тестовые данные отделялись от боевых.
4. На fake success создать или привязать сущность консультации.
5. Сохранить вопрос клиента как часть order/consultation, а не отдельный текст без связи.
6. Показать order/consultation в админке: клиент, услуга, вопрос, статус, срок, исполнитель, problem state.
7. Назначить эксперта/агента вручную и проверить, что он видит задачу.
8. Привязать чат к consultation/order.
9. Зафиксировать no-send события: checkout_start, checkout_complete, question_submitted, consultation_created, expert_assigned, answer_sent, overdue, support_ticket_created.
10. Проверить cancel/fail/refund как проблемные состояния без создания оплаченной консультации.

## Acceptance criteria

- Sandbox checkout открывается через response.checkoutUrl.
- После fake success в админке виден order со статусом completed/test.
- После fake success видна consultation или явно созданная рабочая сущность услуги.
- Вопрос клиента связан с order/consultation.
- Эксперт/агент получает задачу и видит контекст.
- Чат сохраняет связь с consultation/order.
- No-send события видны в журнале или тестовом отчете, реальные письма не уходят.
- Cancel/fail не создают оплаченную консультацию.
- Refund/support состояние можно связать с order/consultation.
- В отчете QA есть скрины: клиентский шаг, sandbox checkout, order admin, consultation admin, expert/agent task, chat, event log, support/problem state.

## QA proof после внедрения

Итоговый proof должен быть опубликован в Blue Panel/GitHub Pages и привязан к Trello. До этого реклама остается запрещенной.
