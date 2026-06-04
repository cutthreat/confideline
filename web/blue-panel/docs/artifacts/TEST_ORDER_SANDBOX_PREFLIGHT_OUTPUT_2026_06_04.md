# Preflight proof: тестовый платежный sandbox

Дата: 2026-06-04
Контур: локальный Confideline Stripe-like sandbox на 127.0.0.1:8787
Ограничение: реальные платежи, реальные карты, production webhook и реальные письма не использовались.

## Выполненная проверка

Сценарий `run-sandbox-scenarios.php` прошел успешно.

Доказанные шаги:
- создан sandbox customer;
- создана checkout session;
- успешная fake-оплата перевела payment intent в `succeeded`;
- cancel-сценарий перевел payment intent в `canceled`;
- fail-сценарий вернул payment error и статус `requires_payment_method`;
- создан fake refund;
- создан signed webhook `payment_intent.succeeded`;
- sandbox state содержит 1 customer, 3 sessions, 1 refund.

## Фактический вывод команды

```text
Confideline payment sandbox scenarios passed.
Customer: cus_test_confideline_6d486fd07f569cb2
Success session: cs_test_confideline_4f61c3b997223d74
Cancel session: cs_test_confideline_9d22603fa85037fb
Fail session: cs_test_confideline_ca74a2d243e9377b
Refund: re_test_confideline_f5b9324115083fd0
Webhook type: payment_intent.succeeded
```

## Отдельная checkout session для proof-скрина

```text
Session: cs_test_confideline_570c386034403797
Amount: USD 49.00
URL: http://127.0.0.1:8787/checkout/cs_test_confideline_570c386034403797
```

## PM-вывод

Payment sandbox пригоден как безопасный нижний слой для дальнейшей проверки тестового заказа. Но это не доказывает готовность платной консультации как продукта, потому что пока не пройдены: создание заказа на сайте, вопрос клиента, консультация, назначение эксперта/агента, чат, no-send события, support/refund очередь и админская видимость.
