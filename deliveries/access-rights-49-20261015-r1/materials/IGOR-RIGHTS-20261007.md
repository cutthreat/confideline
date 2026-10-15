# Документация Игоря: права, снимок 07.10.2026

Датированные выдержки. Утверждения об реализации относятся к исходному отчёту разработчика, не к независимо проверенной текущей сборке. Выбраны механизм permissions и поздние уточнения личных/финансовых прав; полный исторический журнал не переносится.

# Admin RBAC

## Left menu v1 (2026-09-16)

- The reordered sidebar preserves effective access gates for retained leaf routes and derives group/header visibility from children. Chat and payment settings use `SETTINGS-view`; My templates retains `CHAT-update` plus the old parent gate (`CHAT-view` or `MESSAGES-view`). Disabled Balance follows the existing Finance gate and grants no action access.
- The user's 2026-09-16 follow-up retains Expert chat templates under Диалоги with `CHAT-view`. Since the 2026-09-23 category regrouping, Payment systems appears only in the internal Payments & Tarifs navigation with `PAYMENT_SYSTEMS-view`; Admin area, Role area, HTML macro variables and Premium settings (Legacy) appear only in Common settings. The legacy Premium action uses the existing `SETTINGS-view` and `SETTINGS-update` gates; other controller authorization is unchanged. The global Common and Payments category links choose an accessible child destination for restricted roles.
- Isolated menu rendering verified 68 permission combinations against the previous sidebar. Details and the pre-existing Theme settings visibility discrepancy are in left menu implementation (смежный источник, вне этого извлечения).

## Current architecture

- Admin module access starts in `application/modules/admin/Module.php`: guests get `404`, users without an `admin` relation get `403`.
- Most admin controllers extend `application/modules/admin/components/Controller`, whose default `behaviors()` attaches `application/modules/admin/components/Permission`.
- `Permission` has controller-level constants and action-level permission names. Stored role permissions are strings such as `users-view`, `users-update`, or `users-all`.
- `app\models\Role::$permissions` stores comma-separated permission strings; `Role::afterFind()` exposes them through `permissionsArray`.
- `app\models\Admin::afterFind()` copies permissions from the related role.
- Support v1 role names are seeded by
  `m260830_120000_seed_support_v1_roles`: the existing `support-moder` role is
  the ordinary Support Moderator (empty legacy permission sets are initialized
  with `support-view,support-update`), and `support-super-moder` is the senior
  Support Moderator with `support-all`. The migration never overwrites a
  non-empty custom permission set.
- `app\models\User::hasPermission($permission, $atLeastOne = true)` is used by admin views and menu code:
  - super admin always returns true;
  - with `$atLeastOne = true`, a section permission such as `Permission::USERS` returns true if the role has any `users-*` permission;
  - with `$atLeastOne = false`, it checks the exact stored permission string.
- Admin sidebar menu lives in `application/modules/admin/views/layouts/_menu.php` and already uses `hasPermission()` for many top-level items.
- `application/modules/admin/widgets/Menu` removes invisible items and can hide empty parent groups.
- Admin quick search (`application/modules/admin/components/Search.php`) already limits user/group search providers by `Permission::USERS` and `Permission::GROUPS`.


## Own admin balance access (2026-10-05)

- Owner-approved rule: everyone admitted to the admin area has My balance by default, including an assigned admin role with no resource permissions. Account type (partner, agent, expert) does not grant admin access on its own; `Module::init()` still requires the current user's `admin` relation.
- Admin `BalanceController` inherits the base controller's `Permission` behavior with no concrete resource permission. The existing filter admits super-admin and `isModerator` (any other user with an admin relation); guests and users without admin access remain rejected. `_menu.php` shows My balance whenever the same admin relation exists; Finance group visibility follows its visible children.
- `actionIndex()` fixes wallet/history owner from the current session; `BalanceTransactionSearch` preserves that owner despite supplied `user_id` filters. Missing wallets display `0.00` without creating a row. This grant is read-only and does not grant global transactions (`balance_transaction-view/all`), Orders (`orders-view/all`), register processing (`payouts-view/all`), or credit changes.
- No role assignments, database records, payout calculation settings or migration changed. Actual Permission filters/sidebar rendering and a newly admitted agent's forged-owner query were checked in isolated SQLite memory; Finance offline suite passed 607 checks. See updated audit (смежный источник, вне этого извлечения).


## Own payouts in the admin shell (2026-10-05)

- Owner's subsequent explicit decision supersedes the previous interpretation of customer D-05: ordinary site clients without admin access can see their purchases/spending but have no My payouts, recipient editor or payout request access. Raw customer answers remain preserved; no frontend personal route is retained for those clients.
- `MyPayoutController` inherits the same basic admin-shell Permission behavior as My balance; index/view/create/cancel/payment-details bind the current session owner. Create is POST-only; cancel/recipient forms submit only on POST with Yii CSRF. `PayoutSearch::search($params, $ownerId)` constrains personal history independently of supplied owner filters. The controller has no approve/paid/reject actions; the global register retains `payouts-view/all` and its processing meaning.
- My balance, partner own payment tab and legacy Partner payout redirect all point to `my-payout/index` inside the current admin module. My balance remains highlighted while using its own payout pages. Site user menu/balance navigation have no payout entry; the retired frontend controller returns 404 for index and has no view/create/cancel/payment-details handlers. Frontend purchase/spending routes are untouched.
- `PayoutRequestService` requires current DB admin membership before own create/cancel/recipient methods and recipient saving, including direct service calls and a cached User whose role was removed. Existing payout records and staff processing remain available; no history is deleted or reassigned. Conversion approval still controls new request availability.
- Offline payout suite passed 191 checks, covering ordinary positive-balance client denial with no mutation, fresh membership checks, empty-permission admin access, owner forgery, CSRF/verbs, actual new views and retired frontend handlers. Finance607, Orders320 and translations3108 also passed. Authenticated local browser verified admin-to-admin navigation, recipient form, range picker, per-page refresh and frontend404 without submitting financial/recipient actions.


## Approved financial staff scope and implementation (2026-10-07)

- Customer Q3/Q5 explicitly approve Financial Manager and Superadmin for new credit rewards/fines/warnings, linked corrections of own or other staff actions on any user's wallet, and global payout viewing/processing. Any wallet includes ordinary clients without granting those clients admin/payout access. Existing positive administrative top-up and its permissions remain separate.
- Global journal/evidence reading retains its own permission; it is not inferred from payout processing. New correction rights derive from Q3, not from having a view right. Own balance/payout/recipient access stays available to all admin-shell users and remains owner-bound.
- Owner authorized selection from existing code rather than adding roles. Verified local balance (ID15, Balance manager role) already has users/partners view/balance rights; payment-moderator (ID9) is empty. `m261007_120100_configure_approved_finance_rules` adds only financial_adjustment-create/correct and payouts-view to balance, preserves its old grants and all other roles, and does not change user assignments. Super-admin keeps its existing full-access behavior; production role identity/rollout must be checked separately.
- `FinancialAccess` queries current admin/role rows for new financial actions and payout processing, including direct service calls. Adjustment mutations require POST/CSRF and the create/correct permission; private detail/evidence routes require balance_transaction-view/all before lookup. This journal permission is not added to balance automatically. The post-operation receipt gives authorized correction access without exposing private reasons/history.
- Q1/Q2 are implemented with five common/manualPayout settings shown on Prices, minimum snapshots and server checks under owner/wallet locks. Locally the approved0.05/500/request/down policy is enabled after isolated checks. See stage-three delivery and role/test limits (смежный источник, вне этого извлечения); production rollout remains separate.

