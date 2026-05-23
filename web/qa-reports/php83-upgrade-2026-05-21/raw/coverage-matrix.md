# Confideline Scenario Coverage Matrix

- Generated: 2026-05-23T12:48:50.5346201+03:00
- Catalog version: `2026-05-02-wave16`
- Source report: `reports\latest-report.json`
- Overall: **FAIL**
- Scenarios: 17

## Status Counts

- PASS: 8
- WARN: 3
- FAIL: 2
- BLOCKED: 4
- UNKNOWN: 0
- SKIP: 0

## Scenarios

| ID | Surface | Persona/Role | Risk | Status | Blocker | Repair Cards |
|---|---|---|---|---|---|---|
| SC-PUBLIC-HOME-001 | public-funnel | visitor / anonymous | blocker | PASS |  | RC-BROWSER-PUBLIC-001 [NOT_OPEN], RC-PERF-K6-001 [BLOCKED_BY_TOOLING_OR_RUNTIME] |
| SC-PUBLIC-LOGIN-001 | auth | visitor / anonymous | high | PASS |  | RC-BROWSER-PUBLIC-001 [NOT_OPEN] |
| SC-PUBLIC-SIGNUP-001 | signup | visitor / anonymous | high | PASS |  | RC-BROWSER-PUBLIC-001 [NOT_OPEN] |
| SC-PUBLIC-HUMAN-JOURNEY-001 | public-human-customer-journey | visitor / anonymous | high | PASS |  | RC-BROWSER-HUMAN-001 [NOT_OPEN], RC-PERF-K6-001 [BLOCKED_BY_TOOLING_OR_RUNTIME] |
| SC-PUBLIC-MODALS-001 | modal-surface | visitor / anonymous | medium | PASS |  |  |
| SC-PUBLIC-LEGAL-001 | legal-trust | visitor / anonymous | medium | PASS |  |  |
| SC-A11Y-WCAG-001 | accessibility | visitor / anonymous | high | FAIL | A11Y-AXE-001: Axe WCAG smoke failed for public routes. | RC-A11Y-AXE-001 [SOURCE_READY_LIVE_OPEN], RC-DEPLOY-SYNC-001 [READY_FOR_HUMAN_DEPLOY_CONTOUR] |
| SC-PERF-PUBLIC-001 | performance | visitor / anonymous | high | BLOCKED | PERF-K6-001: k6 performance smoke is blocked by tooling readiness. | RC-PERF-K6-001 [BLOCKED_BY_TOOLING_OR_RUNTIME] |
| SC-SEC-PASSIVE-001 | security | security-reviewer / qa-security | high | BLOCKED | SEC-ZAP-001: OWASP ZAP passive baseline is blocked by tooling readiness. | RC-SEC-HEADERS-001 [SOURCE_READY_LIVE_OPEN], RC-DEPLOY-SYNC-001 [READY_FOR_HUMAN_DEPLOY_CONTOUR] |
| SC-FUNNEL-ANALYTICS-001 | analytics/funnel | product-analyst / qa-ba-tester | high | WARN | ANALYTICS-009: Runtime analytics firing/order proof is not captured yet; schema is not conversion truth. | RC-ANALYTICS-RUNTIME-001 [OPEN] |
| SC-ANALYTICS-RUNTIME-001 | analytics/runtime | product-analyst / qa-ba-tester | high | WARN | ANALYTICS-010: Runtime analytics browser capture status is NOT_PROVEN. | RC-ANALYTICS-RUNTIME-001 [OPEN] |
| SC-DEPLOY-SYNC-001 | deployment/live-sync | operator / deploy-owner | blocker | WARN | DEPLOY-SYNC-001: Deploy/sync manifest is ready, but no proven external deploy contour is configured in this QA package. | RC-DEPLOY-SYNC-001 [READY_FOR_HUMAN_DEPLOY_CONTOUR] |
| SC-RUNTIME-READINESS-001 | qa-runtime | qa-operator / qa-runtime | high | FAIL | RUNTIME-READINESS-001: QA runtime readiness has local failures. | RC-RUNTIME-READINESS-001 [OPEN], RC-ADMIN-AUTH-STATE-001 [BLOCKED_BY_HUMAN_LOGIN] |
| SC-ADMIN-ROLE-MAP-001 | admin-role-permission-map | admin / super-admin-or-moderator | high | PASS |  |  |
| SC-ADMIN-AUTH-001 | admin-auth-browser-state | admin / super-admin | blocker | BLOCKED | BROWSER-ADMIN-001: Authenticated Playwright admin gate is blocked because admin storage state is missing. | RC-ADMIN-AUTH-STATE-001 [BLOCKED_BY_HUMAN_LOGIN] |
| SC-ADMIN-ROLE-AWARE-001 | admin-role-aware-browser | admin / super-admin-and-moderator | high | BLOCKED | ADMIN-ROLE-AWARE-001: Role-aware admin browser gate is blocked by missing per-role storage state. | RC-ADMIN-AUTH-STATE-001 [BLOCKED_BY_HUMAN_LOGIN] |
| SC-MACHINE-INTERFACE-001 | machine-interface | qa-operator / qa-ba-tester | medium | PASS |  |  |

## Verification Contract

### SC-PUBLIC-HOME-001 - Visitor opens localized home page

- Status: `PASS`
- Required checks: `HTTP-HOME`, `BROWSER-PUBLIC-001`
- Evidence: `reports/latest-report.json`, `reports/playwright-public-smoke-output.txt`
- Verification: Run full QA and browser QA; home route must return 200 and pass desktop/mobile browser smoke.

### SC-PUBLIC-LOGIN-001 - Visitor can inspect and fill login form

- Status: `PASS`
- Required checks: `HTTP-LOGIN`, `FORM-LOGIN-001`, `BROWSER-PUBLIC-001`
- Evidence: `reports/latest-report.json`, `reports/playwright-public-smoke-output.txt`
- Verification: Login route must expose expected fields and pass real browser smoke without forced fast-click behavior.

### SC-PUBLIC-SIGNUP-001 - Visitor can inspect and fill signup form

- Status: `PASS`
- Required checks: `HTTP-SIGNUP`, `FORM-SIGNUP-001`, `BROWSER-PUBLIC-001`
- Evidence: `reports/latest-report.json`, `reports/playwright-public-smoke-output.txt`
- Verification: Signup route must expose expected fields and pass browser smoke.

### SC-PUBLIC-HUMAN-JOURNEY-001 - Normal-speed customer path is usable

- Status: `PASS`
- Required checks: `BROWSER-HUMAN-001`
- Evidence: `reports/human-journey-observations.jsonl`, `reports/playwright-human-journey-output.txt`
- Verification: Human-paced Playwright scenario must pass with normal delays and route readiness thresholds.

### SC-PUBLIC-MODALS-001 - Auth and language modals are present

- Status: `PASS`
- Required checks: `MODAL-MODAL-AUTH`, `MODAL-MODAL-LANGUAGE-SWITCHER`
- Evidence: `reports/latest-report.json`
- Verification: Home HTML must expose auth and language modal IDs; browser QA must still verify interaction when route readiness is fixed.

### SC-PUBLIC-LEGAL-001 - Visitor can access legal and trust pages

- Status: `PASS`
- Required checks: `HTTP-TERMS`, `HTTP-PRIVACY`, `HTTP-COOKIE`, `HTTP-ABOUT`, `LEGAL-TERMS`, `LEGAL-PRIVACY`, `LEGAL-COOKIE`, `LEGAL-ABOUT`
- Evidence: `reports/latest-report.json`
- Verification: All legal routes must return 200 and contain expected trust/legal keywords.

### SC-A11Y-WCAG-001 - Public pages pass automated WCAG smoke

- Status: `FAIL`
- Required checks: `SOURCE-A11Y-001`, `A11Y-AXE-001`
- Evidence: `reports/playwright-accessibility-output.txt`, `reports/latest-report.json`
- Verification: Source a11y gate and live axe browser gate must both pass.
- Current blocker: A11Y-AXE-001: Axe WCAG smoke failed for public routes.

### SC-PERF-PUBLIC-001 - Public routes meet response-time SLA

- Status: `BLOCKED`
- Required checks: `PERF-HTTP-001`, `PERF-K6-001`
- Evidence: `reports/performance-qa-summary.json`, `reports/k6-smoke-output.txt`
- Verification: HTTP probe should not warn and k6 p95 should stay under the configured SLA.
- Current blocker: PERF-K6-001: k6 performance smoke is blocked by tooling readiness.

### SC-SEC-PASSIVE-001 - Passive security baseline is reviewed

- Status: `BLOCKED`
- Required checks: `SOURCE-SEC-001`, `SEC-HEADERS-001`, `SEC-ZAP-001`
- Evidence: `reports/security-passive-summary.json`, `reports/zap-baseline-output.txt`
- Verification: Source security gate must pass, live headers must be present, and passive ZAP warnings must be fixed or explicitly accepted.
- Current blocker: SEC-ZAP-001: OWASP ZAP passive baseline is blocked by tooling readiness.

### SC-FUNNEL-ANALYTICS-001 - Analytics funnel contract covers launch decision metrics

- Status: `WARN`
- Required checks: `ANALYTICS-001`, `ANALYTICS-002`, `ANALYTICS-003`, `ANALYTICS-004`, `ANALYTICS-005`, `ANALYTICS-006`, `ANALYTICS-007`, `ANALYTICS-008`, `ANALYTICS-009`
- Evidence: `reports/funnel-analytics.json`, `reports/funnel-analytics.md`, `reports/latest-report.json`
- Verification: Schema/order/privacy/conversion mapping must pass; runtimeStatus may remain NOT_PROVEN until browser/network event capture is added.
- Current blocker: ANALYTICS-009: Runtime analytics firing/order proof is not captured yet; schema is not conversion truth.

### SC-ANALYTICS-RUNTIME-001 - Runtime analytics firing and order are captured from browser evidence

- Status: `WARN`
- Required checks: `SOURCE-ANALYTICS-RUNTIME-001`, `ANALYTICS-010`
- Evidence: `reports/analytics-runtime-summary.json`, `reports/analytics-runtime-summary.md`, `reports/analytics-runtime-observations.json`
- Verification: Runtime analytics capture must reach RUNTIME_PROVEN before analytics can be used as conversion truth; route readiness blockers must stay BLOCKED.
- Current blocker: ANALYTICS-010: Runtime analytics browser capture status is NOT_PROVEN.

### SC-DEPLOY-SYNC-001 - Source-fixed defects are synced to live

- Status: `WARN`
- Required checks: `SOURCE-A11Y-001`, `SOURCE-BRAND-001`, `SOURCE-SEC-001`, `SOURCE-PHP-LINT-001`, `DEPLOY-BUNDLE-001`, `DEPLOY-SYNC-001`
- Evidence: `reports/deploy-sync-manifest.md`, `reports/deploy-bundle-summary.json`
- Verification: Deploy bundle must exist and live checks must stop showing source-fixed issues after sync.
- Current blocker: DEPLOY-SYNC-001: Deploy/sync manifest is ready, but no proven external deploy contour is configured in this QA package.

### SC-RUNTIME-READINESS-001 - QA runtime separates product defects from local blockers

- Status: `FAIL`
- Required checks: `RUNTIME-READINESS-001`
- Evidence: `reports/runtime-readiness.md`, `reports/runtime-readiness.json`
- Verification: Runtime readiness must pass or clearly block only capabilities that require human login/storage state.
- Current blocker: RUNTIME-READINESS-001: QA runtime readiness has local failures.

### SC-ADMIN-ROLE-MAP-001 - Admin role/function map is source-derived

- Status: `PASS`
- Required checks: `ADMIN-ROLE-MAP-001`
- Evidence: `reports/admin-role-map-current.json`, `reports/admin-role-map-output.txt`
- Verification: Role map must be regenerated from source and include configured behavior envelopes.

### SC-ADMIN-AUTH-001 - Authenticated admin browser state exists

- Status: `BLOCKED`
- Required checks: `BROWSER-ADMIN-001`, `ADMIN-ROUTE-001`
- Evidence: `reports/playwright-admin-gated-output.txt`, `secrets/admin-storage-state.json`
- Verification: Storage state must be captured outside git, then authenticated admin gate must pass.
- Current blocker: BROWSER-ADMIN-001: Authenticated Playwright admin gate is blocked because admin storage state is missing.

### SC-ADMIN-ROLE-AWARE-001 - Admin and moderator stay inside role behavior envelope

- Status: `BLOCKED`
- Required checks: `ADMIN-ROLE-MAP-001`, `ADMIN-ROLE-AWARE-001`
- Evidence: `reports/admin-role-observations.jsonl`, `reports/playwright-admin-role-aware-output.txt`
- Verification: Per-role browser checks must pass using storage states and source-derived behavior constraints.
- Current blocker: ADMIN-ROLE-AWARE-001: Role-aware admin browser gate is blocked by missing per-role storage state.

### SC-MACHINE-INTERFACE-001 - Tester state is readable through machine interface

- Status: `PASS`
- Required checks: ``
- Evidence: `reports/machine-interface/index.html`, `reports/machine-interface/state.json`, `reports/coverage-matrix.json`
- Verification: Artifact verifier must pass and machine interface must expose status, runtime, role model, repair cards, coverage matrix, and commands.

