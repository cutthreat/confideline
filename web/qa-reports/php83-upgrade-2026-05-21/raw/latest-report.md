# Confideline QA/BA Run Report

- Run: confideline-qa-20260523-124834
- Base URL: https://confideline.com
- Overall: **FAIL**
- Started: 2026-05-23 12:48:34 +03:00
- Ended: 2026-05-23 12:48:49 +03:00

## Status Counts

- PASS: 38
- WARN: 7
- FAIL: 2
- BLOCKED: 6
- SKIP: 0

## Checks

| ID | Area | Status | Summary |
|---|---|---|---|
| HTTP-HOME | public-http | PASS | home returned 200. |
| HTTP-LOGIN | public-http | PASS | login returned 200. |
| HTTP-SIGNUP | public-http | PASS | signup returned 200. |
| HTTP-RECOVERY | public-http | PASS | recovery returned 200. |
| HTTP-TERMS | public-http | PASS | terms returned 200. |
| HTTP-PRIVACY | public-http | PASS | privacy returned 200. |
| HTTP-COOKIE | public-http | PASS | cookie returned 200. |
| HTTP-ABOUT | public-http | PASS | about returned 200. |
| BRAND-001 | brand | WARN | Legacy brand appears in page title. |
| MODAL-MODAL-AUTH | modal-surface | PASS | Expected modal id modal-auth is present. |
| MODAL-MODAL-LANGUAGE-SWITCHER | modal-surface | PASS | Expected modal id modal-language-switcher is present. |
| LINKS-001 | link-surface | PASS | Internal link surface collected. |
| SEC-HEADERS-001 | security | WARN | Some baseline security headers are missing on home route. |
| PERF-HTTP-001 | performance | PASS | No checked public route exceeded 1500 ms in this single-run HTTP probe. |
| FORM-LOGIN-001 | auth | PASS | Expected fields are present. |
| FORM-SIGNUP-001 | signup | PASS | Expected fields are present. |
| LEGAL-TERMS | legal-trust | PASS | Expected trust/legal keywords are present. |
| LEGAL-PRIVACY | legal-trust | PASS | Expected trust/legal keywords are present. |
| LEGAL-COOKIE | legal-trust | PASS | Expected trust/legal keywords are present. |
| LEGAL-ABOUT | legal-trust | PASS | Expected trust/legal keywords are present. |
| ANALYTICS-001 | analytics | PASS | Analytics schema contains required launch events and no duplicate event names. |
| ANALYTICS-002 | analytics | PASS | Forbidden sensitive tokens are not required by analytics schema. |
| SOURCE-ANALYTICS-RUNTIME-001 | analytics | PASS | Source runtime analytics bridge contains expected launch events and is registered in the custom theme layout. |
| ANALYTICS-003 | analytics | PASS | Analytics schema columns and event names are readable. |
| ANALYTICS-004 | analytics | PASS | Full launch analytics event coverage has no missing or duplicate events. |
| ANALYTICS-005 | analytics | PASS | Schema event order matches acquisition-to-repeat funnel contract. |
| ANALYTICS-006 | analytics | PASS | Conversion truth metrics have required event/property mapping. |
| ANALYTICS-007 | analytics | PASS | Funnel analytics required properties respect privacy boundary. |
| ANALYTICS-008 | analytics | PASS | Business decision metrics have analytics event coverage. |
| ANALYTICS-009 | analytics | WARN | Runtime analytics firing/order proof is not captured yet; schema is not conversion truth. |
| ANALYTICS-010 | analytics | WARN | Runtime analytics browser capture status is NOT_PROVEN. |
| SOURCE-A11Y-001 | source | PASS | Source-level accessibility fixes are present for viewport, form names, alert close and contrast override. |
| SOURCE-BRAND-001 | source | PASS | Primary source defaults use Confideline branding. |
| SOURCE-SEC-001 | source | PASS | Yii response security header, CSP and cookie-hardening hooks are present in source. |
| SOURCE-PHP-LINT-001 | source | PASS | Edited PHP source files pass php -l. |
| DEPLOY-SYNC-001 | deployment | WARN | Deploy/sync manifest is ready, but no proven external deploy contour is configured in this QA package. |
| ADMIN-SOURCE-001 | admin | PASS | Source admin prefix is configured. |
| DEPLOY-BUNDLE-001 | deployment | PASS | Deploy handoff bundle exists with checksums and rollback checklist. |
| TOOL-NODE-001 | tooling | PASS | Node/npm are available for Playwright checks. |
| TOOL-K6-001 | tooling | WARN | k6 CLI is not installed; Docker fallback is expected for performance smoke. |
| TOOL-ZAP-001 | tooling | WARN | OWASP ZAP CLI is not installed; Docker fallback is expected for passive security baseline. |
| TOOL-DOCKER-001 | tooling | BLOCKED | Docker CLI is installed but the daemon is not ready; containerized k6/ZAP fallback cannot run yet. |
| PERF-K6-001 | performance | BLOCKED | k6 performance smoke is blocked by tooling readiness. |
| SEC-ZAP-001 | security | BLOCKED | OWASP ZAP passive baseline is blocked by tooling readiness. |
| RUNTIME-READINESS-001 | runtime | FAIL | QA runtime readiness has local failures. |
| ADMIN-ROLE-MAP-001 | admin | PASS | Admin role/function map was refreshed from source. |
| BROWSER-PUBLIC-001 | browser | PASS | Playwright public desktop/mobile smoke passed. |
| BROWSER-HUMAN-001 | browser | PASS | Human-paced customer journey passed. |
| A11Y-AXE-001 | accessibility | FAIL | Axe WCAG smoke failed for public routes. |
| BROWSER-ADMIN-001 | admin | BLOCKED | Authenticated Playwright admin gate is blocked because admin storage state is missing. |
| ADMIN-ROLE-AWARE-001 | admin | BLOCKED | Role-aware admin browser gate is blocked by missing per-role storage state. |
| ADMIN-ROUTE-001 | admin | BLOCKED | Admin routes are known from inventory/source but require an authenticated admin browser state; anonymous probes are expected to be inconclusive. |
| MANHATTAN-001 | browser | PASS | Manhattan CDP is ready and no active owner was detected. |

## Findings

| ID | Severity | Confidence | Area | Summary | Recommendation |
|---|---|---|---|---|---|
| BRAND-001-F01 | medium | high | brand | Public page title still exposes legacy YouDate branding. | Replace public title/meta branding with Confideline unless this is an intentional hidden test state. |
| SEC-HEADERS-001-F01 | medium | medium | security | Baseline security headers are incomplete. | Add or verify HSTS, X-Frame-Options or CSP frame-ancestors, X-Content-Type-Options and Referrer-Policy at the web server/app edge. |
| DEPLOY-SYNC-001-F01 | medium | high | deployment | Source repair is ready but live sync is not proven. | Use the deploy-sync manifest with the real hosting/deploy contour, then rerun full QA; do not mark live findings closed from source-only proof. |
| RUNTIME-READINESS-001-F01 | high | high | runtime | QA runtime is not reliable. | Open runtime-readiness.md/json and fix local runtime blockers before trusting browser conclusions. |
| A11Y-AXE-001-F01 | high | high | accessibility | Public pages fail automated WCAG smoke. | Source-level accessibility repair is present; deploy/sync the repaired Yii2 theme to the live target, then rerun Invoke-ConfidelineBrowserQa.ps1. |
| ADMIN-AUTH-STATE-001-F01 | high | high | admin | Authenticated admin browser state is missing for live admin QA. | Create a Playwright storage-state file at the configured secrets path after manual/admin login, then rerun browser QA; do not store the file in git or reports. |

## Repair Cards

- Status: READY
- Cards: 8
- JSON: reports\repair-cards.json
- Markdown: reports\repair-cards.md

## Scenario Coverage

- Status: READY
- Overall: FAIL
- Scenarios: 17
- JSON: reports\coverage-matrix.json
- Markdown: reports\coverage-matrix.md

## Release Decision

- Status: READY
- Decision: NO_GO
- Confidence: high
- JSON: reports\release-decision.json
- Markdown: reports\release-decision.md

## Known Blockers

- Status: READY
- Blockers: 12
- JSON: reports\known-blockers.json
- Markdown: reports\known-blockers.md

## Funnel Analytics

- Status: READY
- Overall: SCHEMA_READY_RUNTIME_OPEN
- Schema status: PASS
- Runtime status: NOT_PROVEN
- JSON: reports\funnel-analytics.json
- Markdown: reports\funnel-analytics.md

## Analytics Runtime Capture

- Status: READY
- Overall: NOT_PROVEN
- Evidence grade: NO_RUNTIME_EVIDENCE
- JSON: reports\analytics-runtime-summary.json
- Markdown: reports\analytics-runtime-summary.md

## Manual Next Actions

- Status: READY
- Items considered: 12
- Actions shown: 12
- JSON: reports\next-actions.json
- Markdown: reports\next-actions.md

## Run History

- Status: READY
- Runs tracked: 20
- Latest run: confideline-qa-20260523-124834
- JSON: reports\run-history-summary.json
- Markdown: reports\run-history-summary.md

## Next Actions

1. Deploy/sync the repaired Yii2 source to the live target, then rerun browser and network QA.
2. Create a non-committed Playwright admin storage state at the configured secrets path, then rerun browser QA.
3. Triage k6 p95 latency and ZAP passive warnings using reports\repair-handoff.md.
4. Rerun performance/security/browser gates after fixes.
