# Тестировщик

Autonomous senior QA/BA testing contour for Confideline.

Canonical project name: `Тестировщик`.

When the operator says `запусти тестировщика`, run the production contour through:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-Testirovshchik.ps1
```

## Quick Run

Production run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineQaProduction.ps1 -SkipInstall
```

Production gate:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Test-ConfidelineQaProductionReadiness.ps1
```

CI dry run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Test-ConfidelineQaCiDryRun.ps1
```

Battle-ready tester gate:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Test-ConfidelineQaBattleReady.ps1
```

Subagent/Spark policy gate:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Test-ConfidelineQaSubagentSparkPolicy.ps1
```

## Subagent/Spark Policy

- Maximum connectable QA subagents in one pass: `10`.
- Default subagent lane for useful testing work: `gpt-5.3-codex-spark`.
- Default reasoning effort for useful testing cards: `xhigh`.
- The tester may consume the full available Spark quota for useful testing when work is split into independent QA cards with evidence output.
- Do not spend agents on human login/MFA/payment/credential actions, shared mutable browser state, destructive external work, or duplicate copies of the same check.
- The executable policy is `config\subagent-spark-policy.json`; the guard is `scripts\Test-ConfidelineQaSubagentSparkPolicy.ps1` and is included in the battle-ready gate.

Interrupted production-run finalizer:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Complete-ConfidelineQaProductionRun.ps1
```

Operator runbook:

- `OPERATOR-RUNBOOK.md`
- `SUPER-ADMIN-HUMAN-TESTER-RUNBOOK.md` - how to operate the live site as a human super-admin while testing frontend/user behavior.

Legacy full QA only:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineQa.ps1
```

Browser layer:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineBrowserQa.ps1
```

Admin role/function map:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Update-ConfidelineAdminRoleMap.ps1
```

Runtime readiness:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Test-ConfidelineQaRuntime.ps1
```

Performance smoke:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelinePerformanceQa.ps1
```

Passive security baseline:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineSecurityPassiveQa.ps1
```

Repair-card queue:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\New-ConfidelineRepairCards.ps1
```

Scenario coverage matrix:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\New-ConfidelineCoverageMatrix.ps1
```

Next-action plan:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\New-ConfidelineQaNextActions.ps1
```

Run history:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\New-ConfidelineQaRunHistory.ps1
```

Funnel analytics:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\New-ConfidelineFunnelAnalytics.ps1
```

Analytics runtime capture:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineAnalyticsRuntimeQa.ps1 -SkipInstall
```

Release decision:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\New-ConfidelineQaReleaseDecision.ps1
```

Machine interface:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\New-ConfidelineQaMachineInterface.ps1
```

Artifact contract check:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Test-ConfidelineQaArtifacts.ps1
```

Archive manifest check:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Test-ConfidelineQaArchiveManifest.ps1
```

Evidence graph:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\New-ConfidelineQaEvidenceGraph.ps1
```

Flake summary:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\New-ConfidelineQaFlakeSummary.ps1
```

Retention dry run:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineQaRetention.ps1 -WhatIf
```

Install daily local schedule:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Install-ConfidelineQaSchedule.ps1 -WhatIf
```

Deployment handoff bundle:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\New-ConfidelineDeployBundle.ps1
```

Admin storage state capture:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Capture-ConfidelineAdminStorageState.ps1
```

Automated admin storage state capture:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Capture-ConfidelineAdminStorageState.ps1 -AutoLogin -Username <admin-user> -Password <admin-password> -Role super-admin
```

Admin surface inspection:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Inspect-ConfidelineAdminSurface.ps1
```

Admin impersonation message smoke:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineImpersonationMessageSmoke.ps1
```

Admin assigned-questionnaire dialog seed:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineAdminAssignedDialogSeed.ps1 -DialogCount 20
```

Ban and shadow-ban behavior audit:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineBanBehaviorAudit.ps1
```

## Outputs

- `reports\latest-report.md` - human-readable run report.
- `reports\latest-report.json` - machine-readable run report.
- `reports\findings.csv` - findings register.
- `reports\browser-qa-summary.json` - Playwright public/accessibility status.
- `reports\admin-role-map-current.json` - source-derived admin role, permission, menu, and controller map refreshed by browser QA.
- `reports\human-journey-observations.jsonl` - normal-speed visitor journey observations and timeout evidence.
- `reports\admin-role-observations.jsonl` - per-role admin observations when storage states are available.
- `reports\performance-qa-summary.json` - k6 status plus per-route p95 diagnostics.
- `reports\security-passive-summary.json` - ZAP passive baseline status.
- `reports\repair-cards.json` - executable repair queue generated from the latest QA evidence.
- `reports\repair-cards.md` - human-readable repair cards with priority, owner surface, evidence, action, verification, and stop condition.
- `reports\coverage-matrix.json` - machine-readable business scenario coverage matrix, mapped to checks, evidence, blockers, and repair cards.
- `reports\coverage-matrix.md` - human-readable scenario coverage matrix.
- `reports\next-actions.json` - prioritized action plan generated from all non-green scenarios and active repair cards.
- `reports\next-actions.md` - human-readable next actions with scenario, blocker, card, owner surface, action, and verify command.
- `reports\run-history.jsonl` - append-only local run history.
- `reports\run-history-summary.json` - latest run plus trend deltas against the previous local run.
- `reports\run-history-summary.md` - human-readable run history summary.
- `reports\funnel-analytics.json` - schema, event-order, privacy, conversion-truth, phase coverage, and runtime-proof gap for analytics.
- `reports\funnel-analytics.md` - human-readable funnel analytics contract report.
- `reports\analytics-runtime-summary.json` - runtime browser capture status for analytics firing/order proof.
- `reports\analytics-runtime-summary.md` - human-readable runtime analytics capture report.
- `reports\known-blockers.json` - typed blocker register with unblock command, verify command, human action, and stop condition.
- `reports\known-blockers.md` - human-readable blocker register.
- `reports\production-readiness.json` - one-command production runner status and step evidence.
- `reports\production-readiness.md` - human-readable production readiness summary.
- `reports\retention-manifest.json` - retention cleanup manifest.
- `reports\retention-manifest.md` - human-readable retention cleanup manifest.
- `reports\ci-dry-run.json` - CI-safe script and artifact dry-run status.
- `reports\ci-dry-run.md` - human-readable CI dry-run status.
- `reports\battle-ready.json` - tester-readiness gate that separates battle-ready tester state from product release readiness.
- `reports\battle-ready.md` - human-readable battle-ready gate.
- `reports\evidence-graph.json` - recursive evidence-link validation across coverage, release decision, and machine interface.
- `reports\evidence-graph.md` - human-readable evidence graph.
- `reports\flake-summary.json` - retryable/browser/runtime failure-class summary.
- `reports\flake-summary.md` - human-readable flake summary.
- `reports\production-runs\<productionRunId>\archive-manifest.json` - checksum manifest for a production evidence archive.
- `reports\production-runs\<productionRunId>\archive-manifest.md` - human-readable archive manifest.
- `reports\production-run-state.json` - step-by-step production checkpoint used for interrupted-run recovery.
- `reports\admin-storage-state-validation.json` - strict admin storage-state validation when storage state exists.
- `reports\admin-storage-state-validation.md` - human-readable admin storage validation.
- `reports\admin-surface-inspection.json` - authenticated admin dashboard/settings/roles map.
- `reports\admin-surface-inspection.md` - human-readable admin surface map.
- `reports\admin-surface-*.png` - authenticated admin screenshots.
- `reports\impersonation-message-smoke.json` - super-admin login-as-user message smoke with identity, send, and conversation proof.
- `reports\impersonation-message-smoke.md` - human-readable impersonation message smoke.
- `reports\impersonation-message-smoke.png` - screenshot evidence for the impersonated message flow.
- `reports\admin-assigned-dialog-seed.json` - verified admin assigned-questionnaire dialog seed with user/profile pairs, conversation ids, inbound message proof, and admin reply proof.
- `reports\admin-assigned-dialog-seed.md` - human-readable assigned-questionnaire seed report.
- `reports\admin-assigned-dialog-seed.png` - screenshot evidence for the live admin chat after the seed.
- `reports\ban-behavior-audit.json` - live full/shadow ban behavior evidence with test users, message-delivery checks, release checks, and cleanup state.
- `reports\ban-behavior-audit.md` - human-readable full/shadow ban audit and bug report.
- `reports\ban-behavior-audit.png` - screenshot evidence for the live ban admin page after cleanup.
- `reports\playwright-analytics-runtime-output.txt` - runtime analytics capture process output and timeout evidence.
- `reports\release-decision.json` - machine-readable release decision with critical gates, evidence links, blockers, and hard-rule status.
- `reports\release-decision.md` - human-readable `GO` / `CONDITIONAL_GO` / `NO_GO` release decision.
- `reports\machine-interface\index.html` - local static tester interface for QA status, release decision, scenarios, next actions, history, roles, human pace, repair cards, and commands.
- `reports\machine-interface\state.json` - machine-readable state behind the local tester interface.
- `reports\runtime-readiness.json` - local QA runtime readiness, including tools, memory/pagefile/browser pressure, Docker, role map, and admin storage-state presence.
- `reports\runtime-readiness.md` - human-readable runtime readiness report.
- `reports\deploy-sync-manifest.md` - source files that must be deployed/synced to close source-fixed live findings.
- `reports\deploy-bundle-summary.json` - generated deploy bundle metadata after bundle creation.
- `reports\playwright-public-smoke-output.txt` - public browser smoke output.
- `reports\playwright-accessibility-output.txt` - axe accessibility output.
- `reports\playwright-admin-gated-output.txt` - authenticated admin browser output or storage-state blocker.

## Current Architecture

- `scripts\Invoke-ConfidelineQa.ps1` - dependency-light public QA runner.
- `scripts\Invoke-ConfidelineQaProduction.ps1` - one-command production QA orchestrator.
- `scripts\Test-ConfidelineQaProductionReadiness.ps1` - production readiness gate for CI/scheduled use.
- `scripts\Test-ConfidelineQaBattleReady.ps1` - verifies the tester itself is battle-ready without falsely marking the product as releasable.
- `scripts\Complete-ConfidelineQaProductionRun.ps1` - finalizes a fail-closed production readiness report from the latest checkpoint after external interruption.
- `scripts\New-ConfidelineQaArchiveManifest.ps1` - writes per-run archive manifests with SHA256 and byte sizes.
- `scripts\Test-ConfidelineQaArchiveManifest.ps1` - validates per-run archive integrity.
- `scripts\New-ConfidelineQaEvidenceGraph.ps1` - validates required and optional evidence paths.
- `scripts\New-ConfidelineQaFlakeSummary.ps1` - aggregates browser and production retryability/failure classes.
- `scripts\New-ConfidelineKnownBlockers.ps1` - generates typed blocker register.
- `scripts\Invoke-ConfidelineQaRetention.ps1` - retention/TTL cleanup with manifest.
- `scripts\Install-ConfidelineQaSchedule.ps1` - local Windows Task Scheduler installer.
- `scripts\Test-ConfidelineQaCiDryRun.ps1` - CI-safe dry-run of script syntax, Node syntax, and required local artifacts.
- `scripts\Test-ConfidelineAdminStorageState.ps1` - validates captured admin storage state against authenticated admin markers.
- `scripts\Invoke-ConfidelineImpersonationMessageSmoke.ps1` - uses super-admin storage state to login as a selected user, message a target profile, and verify the conversation.
- `scripts\Invoke-ConfidelineAdminAssignedDialogSeed.ps1` - discovers questionnaires assigned to admin, creates inbound frontend messages from demo users, replies as the assigned questionnaires through `/admin/chat/message-create`, and verifies the resulting admin conversations.
- `scripts\Invoke-ConfidelineBanBehaviorAudit.ps1` - creates temporary live shadow/full bans on internal demo users, verifies user-side and counterpart-side restrictions, releases the bans, and reports confirmed defects.
- `scripts\Invoke-ConfidelineBrowserQa.ps1` - Playwright public, accessibility, and authenticated-admin runner.
- `scripts\Update-ConfidelineAdminRoleMap.ps1` - regenerates role/function/permission map from Yii2 admin source and behavior config.
- `scripts\Test-ConfidelineQaRuntime.ps1` - separates product findings from local QA runtime/tooling/resource blockers.
- `scripts\Invoke-ConfidelinePerformanceQa.ps1` - k6 runner with Docker fallback.
- `scripts\Invoke-ConfidelineSecurityPassiveQa.ps1` - passive ZAP baseline runner with Docker fallback.
- `scripts\New-ConfidelineRepairCards.ps1` - generates an executable repair-card queue from the latest QA report and supporting artifacts.
- `scripts\New-ConfidelineCoverageMatrix.ps1` - generates scenario-level coverage from the scenario catalog and latest QA evidence.
- `scripts\New-ConfidelineQaNextActions.ps1` - generates prioritized next actions from coverage and repair-card evidence.
- `scripts\New-ConfidelineQaRunHistory.ps1` - records local run history and trend deltas.
- `scripts\New-ConfidelineFunnelAnalytics.ps1` - validates launch analytics schema, event order, privacy boundary, conversion-truth mapping, and runtime proof gap.
- `scripts\Invoke-ConfidelineAnalyticsRuntimeQa.ps1` - captures runtime analytics firing/order evidence through browser automation and reports route-readiness/test blockers without claiming false proof.
- `content\themes\custom\static\js\confideline-analytics.js` - canonical Yii2 custom-theme analytics bridge that emits privacy-safe launch events for runtime proof.
- `scripts\New-ConfidelineQaReleaseDecision.ps1` - generates the evidence-based release go/no-go decision.
- `scripts\New-ConfidelineQaMachineInterface.ps1` - generates the local machine interface from latest QA artifacts.
- `scripts\Test-ConfidelineQaArtifacts.ps1` - verifies report/card/handoff artifact structure.
- `scripts\New-ConfidelineDeployBundle.ps1` - creates a deploy handoff zip, checksum files, and rollback checklist from the current manifest.
- `scripts\Capture-ConfidelineAdminStorageState.ps1` - opens a headed browser for admin login and saves a gitignored Playwright storage state.
- `scripts\Inspect-ConfidelineAdminSurface.ps1` - inspects authenticated admin pages, settings forms, roles table, screenshots, and navigation links.
- `config\confideline.qa.json` - routes, expected fields, legal pages, modal IDs, analytics rules.
- `config\scenario-catalog.json` - versioned catalog of public, human-paced, performance, security, deploy, runtime, and admin role-aware scenarios.
- `playwright\` - browser E2E and accessibility scaffold.
- `performance\k6-smoke.js` - k6 smoke scaffold.
- `security\zap-baseline.conf` - ZAP baseline scaffold notes.
- `templates\` - reusable report/finding templates.

## Current Status

- Public HTTP/auth/legal/analytics checks: running.
- Playwright public desktop/mobile smoke: running; latest live run fails because `/en` times out before `domcontentloaded` in browser profiles.
- Human-paced customer journey: running at normal human pace; latest live run fails because `/en` does not reach `domcontentloaded` within 60s on desktop/mobile.
- Admin role map: refreshed from source on each browser QA pass; current map has `super-admin` and `moderator`, 14 permissions, 24 menu items, and 22 controllers.
- Admin role-aware checks: source role-map contract passes; live role navigation is blocked until per-role storage states exist.
- Runtime readiness: checked before browser QA and surfaced in full QA; latest state is `BLOCKED` only because admin storage states are missing, with one browser/process pressure warning.
- Axe accessibility smoke: running and currently failing on live pages until repaired source is deployed/synced.
- Source gates: running for accessibility repair, branding defaults, security headers/CSP/cookie hardening, runtime analytics bridge, and PHP syntax.
- Deploy/sync manifest: generated and ready when source gates pass; current bundle has 20 files including the custom analytics bridge.
- k6 performance smoke: runnable through k6 CLI or Docker fallback; latest live run fails the 1.5s p95 SLA on `/en` and `/en/page/terms-and-conditions`.
- OWASP ZAP baseline: runnable through ZAP CLI or Docker fallback; latest live run is WARN with passive findings and no new FAIL classification.
- Repair cards: generated automatically by the main QA runner; latest queue has 10 cards, including P0 admin auth-state, deploy sync, runtime readiness, and analytics runtime proof blockers.
- Scenario coverage: generated automatically by the main QA runner; maps each business scenario to current checks, evidence, blockers, and repair cards.
- Next actions: generated automatically by the main QA runner; latest plan shows 18 actions from all non-green scenario/card links.
- Run history: generated automatically by the main QA runner; latest history tracks local run trend deltas so regressions/improvements are visible.
- Funnel analytics: generated automatically by the main QA runner; latest state is `SCHEMA_READY_RUNTIME_OPEN` with schema/order/privacy/conversion mapping PASS and runtime firing/order proof still blocked.
- Analytics source bridge: `SOURCE-ANALYTICS-RUNTIME-001` PASS from canonical Yii2 custom theme evidence.
- Analytics runtime capture: generated automatically by the main QA runner; latest state is `BLOCKED_BY_ROUTE_READINESS` at phase `navigation_waiting_domcontentloaded` with 0 matched expected events, 0 qualified event beacons, and 0 matched runtime events.
- Known blockers: generated automatically by the main QA runner and production runner; latest register has typed human-login, local-runtime, product-live, and deploy blockers with unblock commands.
- Production readiness: one-command runner is available and verified; latest production run is `FAIL` / `productionReady=false` because release decision remains `NO_GO`, while production gate and artifact contract pass in `AllowNoGo` mode. Admin storage validation is deliberately `BLOCKED` until human-captured storage states exist.
- Release decision: generated automatically by the main QA runner; latest state is `NO_GO` with high confidence because public browser, human journey, accessibility, performance, analytics runtime, runtime/admin auth and role-aware gates are not green.
- Machine interface: generated locally in `reports\machine-interface\index.html`; latest state shows release decision, coverage matrix, next actions, run history, repair cards, runtime readiness, and role models.
- Live admin checks: super-admin storage state exists and supports targeted authenticated checks. The assigned-questionnaire chat seed created and verified 20 dialogs through frontend impersonation plus `/admin/chat/message-create`; broader per-role live navigation still needs moderator/limited-role storage states.

## Operating Rule

Admin and browser coverage must be evidence-based. If current admin storage state or Manhattan ownership is unavailable, the runner marks those checks `BLOCKED` instead of pretending coverage exists. Never commit files under `secrets\`.
