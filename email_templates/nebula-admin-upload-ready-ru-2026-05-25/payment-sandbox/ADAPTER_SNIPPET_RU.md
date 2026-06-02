# Adapter snippet для подключения песочницы к Yii2/YouDate

Это не production-код и не готовая миграция. Это минимальные точные вставки для Игоря, чтобы подключить локальную песочницу к текущей Stripe-ветке и не менять основной платежный поток.

## 1. `application/payments/StripeCheckout.php`

В методе `configureStripe()` после строки:

```php
Stripe::setApiKey($this->stripeSecretKey);
```

добавить:

```php
$sandboxApiBase = getenv('CONFIDELINE_STRIPE_API_BASE');
if (!empty($sandboxApiBase)) {
    Stripe::$apiBase = rtrim($sandboxApiBase, '/');
}
```

Итог:

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

## 2. `application/controllers/BalanceController.php`

В `actionStripeCreateSession()` заменить успешный ответ:

```php
return $this->sendJson([
    'success' => true,
    'sessionId' => $session->id,
]);
```

на:

```php
$response = [
    'success' => true,
    'sessionId' => $session->id,
];

if (getenv('CONFIDELINE_STRIPE_API_BASE') && isset($session->url)) {
    $response['checkoutUrl'] = $session->url;
}

return $this->sendJson($response);
```

## 3. Frontend-обработчик Stripe checkout

В фактическом JS, который получает ответ `/balance/stripe-create-session`, добавить ветку:

```js
if (response.checkoutUrl) {
  window.location.href = response.checkoutUrl;
} else {
  stripe.redirectToCheckout({ sessionId: response.sessionId });
}
```

Почему так: текущий Stripe.js умеет редиректить только в настоящий Stripe по `sessionId`. Для локальной песочницы нужен прямой переход на `session.url`, который возвращает fake provider.

## 4. Тестовые env/settings

```powershell
$env:CONFIDELINE_STRIPE_API_BASE = 'http://127.0.0.1:8787'
$env:CONFIDELINE_SANDBOX_WEBHOOK_SECRET = 'whsec_confideline_sandbox_local_only'
```

В тестовом окружении сайта:

- `paymentStripeSecretKey`: `sk_test_confideline_sandbox`
- `paymentStripeWebhookSecret`: `whsec_confideline_sandbox_local_only`
- `paymentStripePublishableKey`: любое тестовое значение, если UI требует ключ

## 5. Условия безопасности

- Не задавать `CONFIDELINE_STRIPE_API_BASE` в production.
- Не отправлять sandbox webhook на production URL.
- Не использовать реальные Stripe keys или реальные карты.
