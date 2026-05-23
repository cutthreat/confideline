# Confideline Repair Cards

- Generated: 2026-05-23T12:48:50.0849351+03:00
- Source report: `reports\latest-report.json`
- Overall: **FAIL**
- Cards: 8

## RC-ADMIN-AUTH-STATE-001 - Capture authenticated admin Playwright storage state

- Priority: `P0`
- Status: `BLOCKED_BY_HUMAN_LOGIN`
- Owner surface: `admin-auth-browser-state`
- Why it matters: Admin/advisor operations, moderation, refunds and message shell cannot be verified live yet.
- Action: Run the storage-state capture script, complete admin login/MFA manually in the headed browser, and save the gitignored storage state. Then rerun browser QA.
- Verify: `powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineBrowserQa.ps1 -SkipInstall`
- Stop condition: Stop at login/MFA/account confirmation; never commit storage state or secrets.
- Evidence:
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\playwright-admin-gated-output.txt`
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\secrets\admin-storage-state.json`

## RC-DEPLOY-SYNC-001 - Sync repaired Yii2 source to live Confideline

- Priority: `P0`
- Status: `READY_FOR_HUMAN_DEPLOY_CONTOUR`
- Owner surface: `deployment/live-sync`
- Why it matters: Live QA will continue reporting old accessibility, branding, header, and analytics bridge defects until the repaired files are deployed or otherwise synced.
- Action: Use the generated deploy bundle or deploy-sync manifest with the real hosting contour, then rerun full QA. Do not close live browser/accessibility/security findings from source proof alone.
- Verify: `powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineQa.ps1`
- Stop condition: Stop if the hosting/deploy contour is unknown, credentials are missing, or the deploy action would mutate production without an approved external path.
- Evidence:
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\deploy-sync-manifest.md`
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\deploy-bundle-summary.json`
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\deploy-bundle\confideline-source-sync-20260523-124312.zip`

## RC-RUNTIME-READINESS-001 - Repair local QA runtime before trusting browser conclusions

- Priority: `P0`
- Status: `OPEN`
- Owner surface: `qa-runtime`
- Why it matters: Browser or security/performance QA results may be local-runtime failures rather than product defects.
- Action: Open runtime-readiness.md/json, fix local runtime failures, then rerun browser QA. Do not classify browser failures as product defects while runtime readiness is FAIL.
- Verify: `powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Test-ConfidelineQaRuntime.ps1`
- Stop condition: Stop before killing unrelated browser/Manhattan sessions or changing OS pagefile settings without a separate operator action.
- Evidence:
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\runtime-readiness.md`
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\runtime-readiness.json`
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\runtime-readiness-output.txt`

## RC-A11Y-AXE-001 - Close live axe WCAG failures after source sync

- Priority: `P1`
- Status: `SOURCE_READY_LIVE_OPEN`
- Owner surface: `public-theme-accessibility`
- Depends on: `RC-DEPLOY-SYNC-001`
- Why it matters: Keyboard/screen-reader/low-vision users can hit blockers; this also signals rough product quality on paid acquisition pages.
- Action: Deploy/sync the repaired source accessibility changes first, then rerun browser QA. If axe still fails after sync, repair the specific targets from playwright-accessibility-output.txt.
- Verify: `powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineBrowserQa.ps1 -SkipInstall`
- Stop condition: Stop before hiding axe rules or accepting critical label/viewport issues without product/accessibility rationale.
- Evidence:
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\playwright-accessibility-output.txt`
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\latest-report.json`

## RC-ANALYTICS-RUNTIME-001 - Prove runtime analytics firing and order from browser evidence

- Priority: `P1`
- Status: `OPEN`
- Owner surface: `analytics/runtime-browser-capture`
- Why it matters: Without runtime browser proof, paid validation can count schema intent instead of actual conversion-truth events fired by the customer journey.
- Action: Open analytics-runtime-summary.md/json and analytics-runtime-observations.json. First clear the recorded phase blocker, then verify matched expected events and qualified event beacons. Do not accept vendor script/container loads as proof.
- Verify: `powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineAnalyticsRuntimeQa.ps1 -SkipInstall`
- Stop condition: Stop before marking analytics runtime proven unless overall is RUNTIME_PROVEN with matched expected events and qualified event beacons.
- Evidence:
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\analytics-runtime-summary.md`
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\analytics-runtime-summary.json`
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\analytics-runtime-observations.json`
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\playwright-analytics-runtime-output.txt`

## RC-PERF-K6-001 - Unblock k6 performance smoke evidence

- Priority: `P1`
- Status: `BLOCKED_BY_TOOLING_OR_RUNTIME`
- Owner surface: `performance/backend-cache-edge`
- Why it matters: Performance evidence is required before paid validation traffic or release readiness can be trusted.
- Action: Open performance-qa-summary.json and k6 output, repair k6/Docker/runtime blocker, then rerun the k6 smoke before judging route latency.
- Verify: `powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelinePerformanceQa.ps1`
- Stop condition: Stop before speculative server rewrites without route-level evidence; do not loosen the SLA to make the gate pass.
- Evidence:
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\performance-qa-summary.json`
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\k6-smoke-output.txt`
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\k6-smoke-summary.json`

## RC-SEC-HEADERS-001 - Close live security header and cookie hardening warnings

- Priority: `P1`
- Status: `SOURCE_READY_LIVE_OPEN`
- Owner surface: `security/app-edge`
- Depends on: `RC-DEPLOY-SYNC-001`
- Why it matters: Clickjacking, MIME sniffing, referrer leakage, or transport downgrade controls may be weaker than expected.
- Action: Sync the source security hooks and verify whether missing headers must be emitted by Yii2, web server, CDN, or hosting edge. Keep CSP legacy-compatible until browser smoke proves stricter policy is safe.
- Verify: `powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineSecurityPassiveQa.ps1`
- Stop condition: Stop before strict CSP or frontend vendor upgrades without UI/browser verification.
- Evidence:
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\latest-report.json`
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\security-passive-summary.json`
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\zap-baseline-output.txt`

## RC-BRAND-001 - Remove legacy YouDate branding from live public title/meta

- Priority: `P2`
- Status: `SOURCE_READY_LIVE_OPEN`
- Owner surface: `brand/content-config`
- Depends on: `RC-DEPLOY-SYNC-001`
- Why it matters: Confideline paid acquisition and trust may be diluted by upstream dating-script branding.
- Action: Sync Confideline source branding defaults to live or document an intentional exception. Verify title/meta on /en after sync.
- Verify: `powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineQa.ps1`
- Stop condition: Stop if legacy branding is intentionally required for a hidden test; record the exception in the project dossier.
- Evidence:
  - `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\latest-report.json`

