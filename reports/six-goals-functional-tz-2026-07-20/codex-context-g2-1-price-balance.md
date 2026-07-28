# G2.1 — технический контекст для Codex Игоря

Этот файл передается агенту Codex вместе с продуктовыми требованиями `etalon-tz-g2-1-price-balance.md`. Он объясняет весь технический контур задачи, но не заменяет анализ фактического build.

## 1. Паспорт задачи

### Назначение

Расширить существующий Yii2 financial contour до G2.1: consultation price, profile override, credit packages, discounts, coupons, balance buckets, checkout snapshots, idempotent confirmed grants и admin readback.

### Приоритет источников

1. `etalon-tz-g2-1-price-balance.md` — требуемое продуктовое поведение.
2. Фактический mapped build/commit Игоря — реальная техническая база.
3. Этот файл — integration map и acceptance context.
4. Старые G2/Oracle/reference материалы — только справочный слой.

При конфликте пользовательского поведения приоритет у продуктового ТЗ. При конфликте с фактическим кодом Codex должен показать расхождение, а не молча менять требование.

### Статус на входе

`existing_legacy_financial_contour_requires_mapped_extension`

Локальный source показывает Price, Balance, Order, payment providers и admin settings. Это не является доказательством того, что полный G2.1 уже реализован в целевом deploy.

## 2. Canonical product invariants

1. Client purchases credits, never a fixed number of minutes.
2. Consultation price is credits per started minute.
3. Available full minutes are derived from current balance and selected Expert price.
4. Purchase currency is USD.
5. Money amounts appear on package/checkout/payment surfaces; consultation uses credits.
6. Effective expert price is profile override, otherwise active global price.
7. Session price snapshot is immutable after session creation.
8. Purchased credits never expire.
9. Bonus/promo/compensation grants may have independent expiry.
10. Expiring bonus buckets are consumed before purchased credits.
11. Credits are granted only after confirmed payment success.
12. Retry/callback/reload cannot grant credits twice.
13. Auto-refill is out of MVP.
14. Agent/Expert never receives exact client balance.
15. Admin changes are versioned and do not rewrite historical sessions/orders/grants.

## 3. Scope

### In scope

- price rule resolution;
- profile override;
- session price snapshot;
- package catalog and starter eligibility;
- package/discount/coupon calculation;
- order snapshot;
- checkout context;
- payment-result handling;
- idempotent credit grant;
- balance buckets and spending order;
- expiry handling;
- manual bonus/compensation/correction;
- admin settings/readback/version/audit;
- client price/balance surfaces;
- role-safe operational badges;
- RU/EN translation keys.

### Out of scope

- started-minute timer/debit mechanics beyond G2.1 integration contract;
- pause/reconnect lifecycle;
- refund execution;
- agent payout/accrual;
- payment provider credential configuration;
- auto-refill;
- final tax/legal jurisdiction engine;
- implementation of support workflow.

## 4. Current source navigation

Verify these paths against Igor's actual repository and mapped commit:

- `application/models/Price.php`
  - credits;
  - base price;
  - discount;
  - actual price;
  - price per credit.
- `application/modules/admin/controllers/SettingsController.php`
  - current `actionSettingsPrices`;
  - dynamic Price rows;
  - validation and deletion behavior.
- `application/modules/admin/views/settings/prices.php`
  - current package row UI;
  - absolute/percentage discount;
  - calculated price per credit and final price;
  - `+`/`-` controls.
- `application/controllers/BalanceController.php`
  - package listing;
  - Stripe/PayPal/Robokassa checkout routes;
  - return/cancel/webhook paths.
- `application/models/Order.php`
  - payment method/id;
  - totals and status.
- `application/models/Balance.php`
- `application/models/BalanceTransaction.php`
- `application/managers/BalanceManager.php`
- `application/modules/admin/forms/BalanceUpdateForm.php`
- `application/modules/admin/views/user/_balance.php`
  - existing manual amount/notes grant.
- `application/modules/admin/controllers/UserController.php`
  - existing balance increase action.
- `application/modules/admin/controllers/OrderController.php`
- existing `/admin/payment-system/index`;
- existing `/admin/balance-transaction/index`;
- existing `/admin/order/index`;
- current expert-profile admin edit surface.

Do not assume the local extracted source is identical to production. Record file/route existence, tracked state, migrations, module registration and runtime execution for the mapped build.

## 5. Conceptual records

Exact schema and class names are Igor's choice. The implementation must preserve the following concepts.

### Consultation price rule

- rule id/version;
- scope: global or expert profile;
- credits per started minute;
- status;
- effective from;
- author/reason/audit.

### Session price snapshot

- session id;
- expert profile id;
- effective credits/min;
- source rule id/version;
- captured at.

### Credit package

- package id/code/version;
- RU/EN name keys;
- credits;
- base USD;
- built-in discount type/value;
- final USD;
- display order;
- starter flag;
- audience/eligibility;
- purchase limit;
- valid period;
- stacking policy;
- active status;
- audit.

### Coupon rule

- coupon id/code/version/type;
- monetary discount or bonus credits;
- package scope;
- audience;
- usage limits;
- valid period;
- stacking;
- active status;
- audit.

### Order calculation snapshot

- order id;
- package id/version;
- purchased credits;
- base USD;
- package discount;
- coupon id/version and effect;
- bonus credits;
- tax;
- final USD;
- currency;
- eligibility result;
- return context;
- created/captured time.

### Balance bucket / credit grant

- grant/bucket id;
- user id;
- source: purchase/welcome/promo/compensation/manual correction;
- total and remaining credits;
- expires at nullable;
- order/coupon/case reference;
- idempotency identity;
- created by/at;
- reason.

### Ledger movement

- user;
- amount;
- balance before/after;
- bucket allocation;
- type;
- source reference;
- session/order/case;
- occurred at;
- reversal/correction reference if applicable.

## 6. Effective price resolution

Observable algorithm:

1. Resolve active profile override for selected expert.
2. If absent, resolve active global rule.
3. Validate positive integer credits/min and active version.
4. Show the same effective value on all pre-start surfaces.
5. On session creation, capture immutable price snapshot.
6. Every G2.2 debit reads session snapshot, not current admin price.
7. Reconnect/resume/reload does not re-resolve the price.
8. A new session created later uses the then-active rule.
9. Missing/invalid price fails closed before paid start.

Global starting value: `30`.

## 7. Available minutes projection

Client-facing projection:

`full_minutes = floor(total_spendable_credits / effective_credits_per_minute)`

Also preserve/display remaining credits when useful:

`remainder = total_spendable_credits % effective_credits_per_minute`

This is a projection, not a minute balance. Never store package purchases as fixed minutes merely to support this display.

The projection must reconcile after grant, debit, expiry and correction.

## 8. Starting package configuration

| code | credits | base USD | built-in discount USD | final USD | default eligibility |
|---|---:|---:|---:|---:|---|
| `starter` | 60 | 9.99 | 0.00 | 9.99 | first confirmed purchase, once |
| `basic` | 150 | 24.98 | 1.99 | 22.99 | regular |
| `standard` | 300 | 49.95 | 6.96 | 42.99 | regular |
| `plus` | 600 | 99.90 | 19.91 | 79.99 | regular |

These are initial admin data, not hardcoded business constants.

Starter eligibility is consumed only by confirmed successful order. Pending, failed and cancelled attempts do not consume it.

## 9. Calculation contract

Use decimal-safe money arithmetic; do not use binary floating point for persisted/comparison-critical USD calculations.

Calculation order:

1. `base_amount`;
2. package built-in discount;
3. one monetary coupon if eligible;
4. tax;
5. final amount.

Bonus-credit grants are recorded separately from monetary amount.

Required rules:

- final amount cannot be negative;
- discount cannot exceed configured total-discount cap;
- default cap is 50%, admin-managed/versioned;
- package stacking flag and coupon stacking flag must both allow combination;
- invalid/expired/ineligible coupon is rejected with a safe reason;
- server recalculates; client totals are display input only;
- order stores applied rule versions and all components;
- provider request amount equals confirmed order final amount.

## 10. Balance buckets and spending

Purchased credits:

- `expires_at = null`;
- universally spendable across Experts;
- remain after session completion.

Bonus buckets:

- optional independent `expires_at`;
- source and reason are preserved;
- expired remaining quantity becomes unavailable through an auditable expiry movement/state.

Debit allocation:

1. eligible bonus bucket with nearest expiry;
2. for same expiry, oldest grant first;
3. purchased non-expiring buckets oldest first or another deterministic ledger-safe order.

Concurrency requirements:

- available-balance check and debit allocation are atomic at business level;
- concurrent debit cannot make balance negative;
- a retry reuses the logical debit identity;
- expired bucket cannot be selected;
- ledger and bucket remaining values reconcile.

## 11. Purchase lifecycle

Minimum observable states:

- package selected;
- order created;
- checkout pending;
- payment processing;
- payment confirmed;
- credit grant committed;
- completed;
- failed;
- cancelled;
- reconciliation required.

Do not expose `paid/success` until payment confirmation and credit grant outcome are handled consistently.

If provider success is confirmed but grant commit fails:

- keep durable success evidence;
- do not request a second payment;
- create one reconciliation incident;
- retry idempotently;
- show a truthful processing/support message until grant is reconciled.

## 12. Idempotency identities

Implementation-specific keys are allowed, but logical uniqueness must cover:

- `provider + provider_payment_id`;
- `order_id + purchase_credit_grant`;
- `coupon_id + user_id + redemption identity`;
- `manual_decision_id + credit_grant`;
- `session_id + debit minute/unit` at the G2.2 boundary.

The same provider callback, admin submit or queue retry must return/read the existing result rather than create another financial movement.

## 13. Return context

Package purchase can start from:

- account balance;
- free dialog;
- consultation confirmation;
- low-balance warning;
- balance pause.

Persist a safe return context containing only authorized object references. After payment:

- successful active context returns to the correct current surface;
- completed session opens history/current state;
- stale/unauthorized context falls back to account balance with a clear message;
- no return link performs session start/resume automatically without current-state validation.

## 14. Admin integration

### Existing price page

Extend `/ru/admin/settings/prices`; do not create a parallel package editor.

Required sections:

- consultation global price;
- credit packages;
- discount safeguards;
- legacy price settings visually isolated.

Keep the established Bootstrap/AdminLTE visual structure and existing dynamic-row interaction where appropriate.

### Coupon page

Add `/ru/admin/settings/coupons` in the same settings navigation next to price settings.

### Expert admin card

Add effective price control:

- inherit global;
- profile override;
- readback of active rule/version;
- future activation;
- reason/audit.

### User balance card

Extend the existing balance update form. Do not add a second manual-credit page.

Require:

- amount;
- grant type;
- reason;
- expiry/no expiry;
- linked case where applicable;
- idempotency identity for the decision;
- before/after preview.

### Existing owners

- payment methods/configuration: `/admin/payment-system/index`;
- purchases/payment status: `/admin/order/index`;
- ledger movements: `/admin/balance-transaction/index`;
- role grants: `/admin/settings/role`.

## 15. Versioning and activation

Price/package/coupon changes must support:

- draft;
- validation;
- activation/effective time;
- active version readback;
- author/reason;
- version history;
- rollback by creating/activating a new version;
- no mutation of historical snapshots.

A pending checkout uses its captured order snapshot. If product policy invalidates the offer before payment, the system must either honor the captured valid order within its checkout validity window or cancel it with a clear, deterministic rule. Do not silently charge a different amount.

## 16. Role and privacy contract

### Client

Recipient-scoped access to own balance, order, grants and transaction-safe summary.

### Expert/Agent

Only boolean/enum operational eligibility state. Never serialize exact balance into their page payload merely to hide it visually.

### Super-admin

Full initial admin capability with audit.

### Logs

Do not log:

- payment credentials;
- card data;
- provider secrets;
- full client financial payloads;
- unrelated personal data.

Provider errors shown to the client are mapped to safe categories; full technical detail remains in restricted diagnostics.

## 17. Translation contract

Prepare RU and EN translation keys for:

- credits/minute;
- available full minutes;
- balance breakdown;
- package names/descriptions;
- first-purchase eligibility;
- discount/savings;
- coupon states;
- bonus expiry;
- checkout rows;
- tax;
- payment processing/success/failure/cancel;
- late success;
- reconciliation message;
- admin labels and validation.

Do not hardcode Russian/English prose in business services.

## 18. Failure and race scenarios

### F1. Duplicate provider callback

One payment, one order outcome, one credit grant.

### F2. Concurrent starter checkout

At most one confirmed starter entitlement is consumed; losing concurrent attempt is handled deterministically.

### F3. Package changed after checkout creation

Captured snapshot is honored or safely cancelled according to explicit checkout-validity rule; amount is never silently changed.

### F4. Profile price changes during session

Existing session keeps snapshot.

### F5. Coupon expires during checkout

Server validates at order/confirmation boundary according to captured-validity rule; client sees truthful recalculation/cancel state.

### F6. Stacking exceeds cap

Server rejects/recalculates before provider handoff.

### F7. Provider success, grant failure

Reconciliation required; idempotent grant retry; no second payment.

### F8. Late success after session completion

Credits remain in wallet; completed session is not resumed.

### F9. Concurrent last-credit debit

Only valid atomic debit succeeds; no negative balance.

### F10. Bonus expiry and debit race

One serializable business result; ledger reconciles.

### F11. Repeated manual submit

One decision identity, one grant.

### F12. Agent payload

Exact balance is absent; only allowed badge state exists.

### F13. Invalid price

Paid start fails closed with no debit.

### F14. Failed/cancelled payment

No grant; starter entitlement remains available unless a prior confirmed purchase exists.

### F15. Tax mismatch

Provider handoff is blocked until server-calculated order total and displayed final total reconcile.

## 19. Acceptance matrix

1. Global 30 resolves when no override exists.
2. Profile override resolves for only that profile.
3. Session snapshot survives global/profile edits.
4. Balance/minute projection is correct for 30 and 45 credits/min.
5. Purchased credits have no expiry.
6. Bonus bucket expiry is independently configurable.
7. Earliest-expiry bucket is consumed first.
8. Starter 60/9.99 is first-confirmed-purchase-only.
9. Failed starter attempt does not consume eligibility.
10. Basic/Standard/Plus initial rows match product spec.
11. Package percentage/fixed discount validates and calculates.
12. Allowed package+coupon stacking respects cap.
13. Checkout shows base/discount/coupon/tax/final USD.
14. Provider amount equals captured final USD.
15. Confirmed payment grants credits exactly once.
16. Duplicate callback does not duplicate order/grant.
17. Provider success/grant failure enters reconciliation.
18. Late success grants wallet credits without session resume.
19. Return context restores dialog/session when still valid.
20. Stale context opens safe current state.
21. Agent/Expert API/view lacks exact client balance.
22. Manual grant requires reason/type and is idempotent.
23. Admin package/coupon/price readback exposes active version.
24. Rollback does not mutate historical snapshots.
25. Invalid package cannot be activated.
26. Invalid price blocks paid start.
27. Concurrent debit cannot create negative balance.
28. RU/EN keys render without hardcoded business copy.

## 20. Implementation handoff

Codex must first return a short current-state map:

- mapped repository/build/commit;
- relevant existing routes/classes/tables/views;
- reused parts;
- gaps;
- migrations/config changes;
- implementation sequence;
- test plan.

After implementation it must return:

- exact changed files;
- migration/config notes;
- unit/integration/e2e results;
- concurrency/idempotency proof;
- admin and historical readback;
- screenshots;
- known limits;
- rollback notes.

## 21. Definition of Done

Specification handoff is not runtime completion.

Runtime G2.1 is ready only when:

- actual build/commit is identified;
- full package/price/coupon configuration is implemented and readable;
- session/order/grant snapshots are proven;
- payment-to-grant idempotency is proven;
- balance buckets and spending order reconcile;
- role-positive/negative checks pass;
- client and admin states are visually accepted;
- financial ledger/order/balance totals reconcile;
- PM accepts observable behavior.

## 22. Proof boundary

Current truthful status:

- product specification: ready;
- technical context: ready;
- HTML/DOCX: documentation artifacts only;
- local source map: code-present reference, not deploy proof;
- implementation: open;
- runtime acceptance: open.

## 23. Knowledge basis

- Owner-confirmed decisions in the G2.1 clarification sequence.
- Live `/ru/admin/settings/prices` inspection on 2026-07-28.
- Existing local Yii2 Price/Balance/Order/payment/admin source map.
- `tz-g2-billing-refunds-compensation.md`.
- `vertical-package-session-money.md`.
- `tz-product-g2-billing-truth-2026-07-16.md`, used only where consistent with later owner decisions.
- `nebula-g2-figma-oracle-state-map-2026-07-16.md`, used as design-surface inventory rather than runtime proof.

## 24. Самооценка

| Критерий эталона ТЗ | Балл |
|---|---:|
| Q1. Цель и измеримый результат | 5/5 |
| Q2. Границы задачи и зависимости | 8/8 |
| Q3. Роли, права и видимость данных | 10/10 |
| Q4. Термины, сущности и источники истины | 7/7 |
| Q5. Пользовательские и административные сценарии | 12/12 |
| Q6. Бизнес-правила, расчёты и ограничения | 12/12 |
| Q7. Состояния, ошибки и пограничные случаи | 12/12 |
| Q8. Настройки админ-панели и их размещение | 8/8 |
| Q9. Уведомления, локализация и отображение | 6/6 |
| Q10. Acceptance criteria и тестовые примеры | 12/12 |
| Q11. Интеграции, данные, безопасность и audit | 5/5 |
| Q12. Definition of Done и граница доказательств | 3/3 |
| **Итого** | **100/100** |

Самооценка 100/100 означает полноту спецификации, а не готовность runtime. Implementation proof и runtime proof остаются открытыми до реализации и приёмки.
