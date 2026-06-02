# Confideline Stripe-like sandbox

Локальная песочница для проверки оплаты, чеков, отмены, ошибок и возвратов на `confideline.com` без реального Stripe и без реальных платежных данных.

## Что это дает

- Stripe-like API для `customer`, `checkout.session`, `payment_intent`, `refund`, receipt.
- Локальную страницу checkout с исходами `success`, `cancel`, `fail`.
- Подписанные webhook payload в формате `Stripe-Signature`.
- Генератор JSON-фикстур для ручных и автоматических тестов.
- Возможность проверить текущий `BalanceController::actionStripeWebhook()` и `StripeCheckout::handleWebhook()` без настоящих ключей Stripe.
- `ADAPTER_SNIPPET_RU.md` с точными вставками для подключения sandbox API base и `checkoutUrl`.

## Важно по безопасности

- Не использовать реальные Stripe keys.
- Не использовать реальные карты.
- Не отправлять webhook на production URL.
- Запускать локально: `127.0.0.1`.
- Default secret `whsec_confideline_sandbox_local_only` является тестовой строкой, не credential.

## Быстрый запуск

```powershell
cd H:\GPT-Codex\Confideline\payment_sandbox\confideline-stripe-sandbox
php -S 127.0.0.1:8787 server.php
```

Открыть:

```text
http://127.0.0.1:8787/
```

## Генерация тестовых данных

```powershell
php generate-fixtures.php `
  --out output `
  --user-id 1001 `
  --email client@example.test `
  --credits 50 `
  --amount 49.00 `
  --currency USD `
  --site-url http://127.0.0.1:8080
```

Будут созданы:

- `checkout_session_created.json`
- `payment_intent_succeeded.webhook.json`
- `payment_intent_payment_failed.webhook.json`
- `payment_intent_canceled.webhook.json`
- `refund_created.json`
- `charge_refunded.webhook.json`
- `receipt.json`
- `curl_commands.md`

## Быстрая проверка всех sandbox-сценариев

В одном окне запустить сервер:

```powershell
php -S 127.0.0.1:8787 server.php
```

Во втором окне выполнить:

```powershell
php run-sandbox-scenarios.php --base-url http://127.0.0.1:8787 --site-url http://127.0.0.1:8080
```

Скрипт проверяет:

- создание checkout session;
- создание customer;
- успешную оплату;
- receipt URL;
- refund;
- отмену оплаты;
- ошибку оплаты;
- генерацию signed webhook;
- итоговое состояние sandbox-хранилища.

## Как подключить к текущему Yii2/YouDate коду

Текущий код:

- `application/controllers/BalanceController.php`
- `application/payments/StripeCheckout.php`
- `application/payments/CheckoutHelper.php`
- `application/models/Order.php`

Stripe PHP в текущем vendor поддерживает переопределение API base через `\Stripe\Stripe::$apiBase`.
Текущий Confideline flow перед checkout session создает/обновляет Stripe Customer, поэтому sandbox поддерживает `POST /v1/customers`, `POST /v1/customers/{id}` и `GET /v1/customers/{id}`.

Минимальный sandbox-hook в `StripeCheckout::configureStripe()`:

```php
public function configureStripe()
{
    Stripe::setApiVersion(self::STRIPE_API_VERSION);
    Stripe::setApiKey($this->stripeSecretKey);

    $sandboxApiBase = getenv('CONFIDELINE_STRIPE_API_BASE');
    if (!empty($sandboxApiBase)) {
        Stripe::$apiBase = rtrim($sandboxApiBase, '/');
    }
}
```

Для локального теста:

```powershell
$env:CONFIDELINE_STRIPE_API_BASE = 'http://127.0.0.1:8787'
$env:CONFIDELINE_SANDBOX_WEBHOOK_SECRET = 'whsec_confideline_sandbox_local_only'
```

В настройках тестового окружения сайта:

- `paymentStripeSecretKey`: любое тестовое значение, например `sk_test_confideline_sandbox`
- `paymentStripeWebhookSecret`: `whsec_confideline_sandbox_local_only`
- `paymentStripePublishableKey`: любое тестовое значение, если UI требует ключ

## Нюанс frontend Stripe.js

Текущий `actionStripeCreateSession()` возвращает только `sessionId`, а frontend Stripe.js делает redirect через настоящий Stripe. Для локальной песочницы нужен sandbox mode:

```php
$session = $checkout->createSession();
$response = [
    'success' => true,
    'sessionId' => $session->id,
];

if (getenv('CONFIDELINE_STRIPE_API_BASE')) {
    $response['checkoutUrl'] = $session->url;
}

return $this->sendJson($response);
```

Во frontend:

```js
if (response.checkoutUrl) {
  window.location.href = response.checkoutUrl;
} else {
  stripe.redirectToCheckout({ sessionId: response.sessionId });
}
```

В production этот блок не активируется, если `CONFIDELINE_STRIPE_API_BASE` не задан.

## Сценарии проверки

### 1. Успешная оплата

1. Создать checkout session через сайт или `POST /v1/checkout/sessions`.
2. Открыть `http://127.0.0.1:8787/checkout/{sessionId}?outcome=success`.
3. Проверить:
   - order `IN_PROGRESS -> COMPLETED`;
   - баланс/кредиты начислены один раз;
   - `balance_transaction` создан;
   - receipt доступен по `receipt_url`;
   - email event `payment.success` можно ставить в очередь.

### 2. Отмена оплаты

1. Открыть `http://127.0.0.1:8787/checkout/{sessionId}?outcome=cancel`.
2. Проверить:
   - order `IN_PROGRESS/NEW -> CANCELLED`;
   - кредиты не начислены;
   - пользователь видит `Payment canceled`;
   - можно триггерить `payment.error` или отдельный cancel flow, если он будет добавлен.

### 3. Ошибка оплаты

1. Открыть `http://127.0.0.1:8787/checkout/{sessionId}?outcome=fail`.
2. Или отправить webhook `payment_intent.payment_failed`.
3. Проверить:
   - order не завершен;
   - кредиты не начислены;
   - retry URL / checkout URL можно показать пользователю;
   - email event `payment.error` не дублируется на каждую промежуточную ошибку.

### 4. Webhook success

```powershell
curl -X POST http://127.0.0.1:8787/sandbox/webhook `
  -H "Content-Type: application/json" `
  -d "{\"type\":\"payment_intent.succeeded\",\"payment_intent\":\"pi_test_confideline_xxx\",\"webhook_url\":\"http://127.0.0.1:8080/balance/stripe-webhook\",\"webhook_secret\":\"whsec_confideline_sandbox_local_only\"}"
```

Проверить, что `Stripe-Signature` проходит текущую проверку Stripe PHP.

### 5. Refund

```powershell
curl -X POST http://127.0.0.1:8787/v1/refunds `
  -d "payment_intent=pi_test_confideline_xxx" `
  -d "reason=requested_by_customer"
```

Проверить:

- fake refund payload создан;
- receipt/charge обновлены;
- сайт не начисляет повторно кредиты;
- будущий event `payment.refund` можно тестировать отдельно.

## Что Игорю нужно решить при внедрении

- Где хранить sandbox flag: env, setting в админке или local config.
- Возвращать ли `checkoutUrl` только в dev/test окружении.
- Нужен ли отдельный `payment.cancel` event или текущий `payment.error` покрывает отмену.
- Как в текущей доменной модели оформлять refund: только email/уведомление или еще обратная операция по балансу.
- Нужно ли добавить `PAYMENT_REFUND` backend-trigger в реальную очередь после успешного refund.

## Stop condition

Не подключать эту песочницу к production. Она нужна только как промежуточный локальный provider перед подключением Stripe sandbox.
