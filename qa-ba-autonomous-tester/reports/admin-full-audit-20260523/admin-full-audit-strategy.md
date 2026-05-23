# Confideline live admin full QA strategy

Generated: 2026-05-23
Scope: https://confideline.com live admin, authenticated user with super-admin/admin role only.

## Goal
Verify every visible and source-derived admin function after PHP migration, including the same business action through different UX paths.

## Safety model

Statuses:

- PASS: live action worked end-to-end and evidence shows expected state.
- FAIL: live action produced server error, wrong state, broken UI, missing validation, or unsafe behavior.
- RETEST: action could not be completed because browser/session/tooling is blocked.
- BLOCKED_BY_RISK: action is destructive and no safe rollback/fixture exists yet.
- INVALID: old evidence used the wrong scenario.

Execution lanes:

1. Read-only lane: page load, menu, direct URL, search, filter, sort, pagination, view pages, empty-results, malformed query, global search. No state changes.
2. Fixture lane: create only QA-prefixed records, verify create/update/view/search/delete, then rollback/delete the fixture.
3. Rollback lane: snapshot one existing low-risk record, no-op save, change one reversible field, verify, restore original value.
4. Destructive lane: delete/flush/block/approve/reject/toggle only on QA fixture or explicitly selected disposable entity. Otherwise BLOCKED_BY_RISK.
5. UX variation lane: repeat critical actions via sidebar, breadcrumb/back, direct URL, grid filter Enter, filter button/Pjax, global header search, mobile viewport, browser back/refresh, empty/invalid/unicode/URL-like input.

## Required checks per grid/list page

- Open from sidebar/menu.
- Open direct URL.
- Search each text filter with: known value, partial value, empty value, unicode value, URL-like value, SQL-like harmless string, long string.
- Sort every sortable column ascending/descending.
- Pagination first/next/last when available.
- Reset filters.
- Open first row view/update action where available.
- Confirm no 500/Yii exception/error page.
- Confirm selected filter remains in the right field and is URL-encoded correctly.

## Munich bug scenario

Target: /ru/admin/geoname/index.

Known user evidence: searching Munich by name led to Yii error #8192. Screenshot URL shows `GeonameSearch[name]` containing the current URL instead of `Munich`, so the test must distinguish:

1. Grid name filter: type `Munich`, press Enter.
2. Grid name filter: type `Munich`, click/filter-submit if present.
3. Header global search: type `Munich`, press Enter.
4. Direct query URL: `?GeonameSearch[name]=Munich`.
5. URL-like value: `?GeonameSearch[name]=https%3A%2F%2Fconfideline.com%2Fru%2Fadmin%2Fgeoname%2Findex`.
6. Mixed filters: name `Munich` + country `DE`.
7. Clear/reset filter after error and reload.

Expected: no 500; grid returns Munich rows or clean empty state; malformed values are handled as input, not server error.

## Initial priority order

P0:
- geoname/country grid search/filter/update because user already hit #8192.
- global admin search field because it can cross-route inject values.
- users/messages/photos/reports/verifications because they affect moderation, support, and user safety.

P1:
- settings/prices/currencies/genders/translator/theme because they can break site behavior globally.
- payments/orders because read-only must work and mutations must be tightly controlled.

P2:
- logs/plugins/themes/help/news/profile fields/gifts where destructive actions need fixture or explicit rollback.

## Stop conditions

- Login/MFA/captcha/account confirmation required.
- Active unrelated browser handoff blocks Manhattan mutation.
- Any action would delete/flush/block/approve/reject/change real user/business data without a QA fixture or rollback.
- CDP/browser tooling cannot capture evidence; record RETEST instead of pretending PASS.
