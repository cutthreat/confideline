# Тестировщик: Operator Runbook

## Purpose

Use this tester as the launch-readiness and regression evidence system for Confideline. It can inspect public customer journeys, human-paced browser flows, performance, passive security, analytics runtime proof, admin role envelopes, source gates, repair cards, release decision, and operator next actions.

Canonical command intent:

- `запусти тестировщика` means run this Confideline QA/BA contour.
- Default launcher:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-Testirovshchik.ps1
```

## Production Command

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineQaProduction.ps1 -SkipInstall
```

Use `-FailOnNoGo` in CI or scheduled control loops when a non-green release state must fail the job.

For diagnostic runs that intentionally skip heavy browser/performance/security steps, keep `-FailOnNoGo` off and validate the tester with:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Test-ConfidelineQaBattleReady.ps1
```

Subagent/Spark policy:

- `Тестировщик` may connect up to `10` QA subagents in one pass.
- Useful testing cards may use `gpt-5.3-codex-spark` with `xhigh` reasoning and may consume the full available Spark quota while useful independent QA work remains.
- Each subagent must own one bounded QA card and return verdict, evidence paths or URLs, findings, residual risks, and the recommended next action.
- Do not parallelize human login/MFA/payment/credential actions, shared mutable browser sessions, destructive external work, or duplicate checks.
- Validate the policy with:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Test-ConfidelineQaSubagentSparkPolicy.ps1
```

If the parent production process is externally interrupted before `production-readiness.json` is updated, finalize from checkpoint:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Complete-ConfidelineQaProductionRun.ps1
```

## Interpret The Result

- `productionReady=true`: latest QA is `PASS`, release decision is `GO`, and artifact contract passed.
- `BATTLE_READY_WITH_SITE_NO_GO`: tester infrastructure is ready and fail-closed, but product release remains blocked.
- `overall=NO_GO`: tester is functioning, but product/live/admin/deploy evidence blocks release.
- `overall=FAIL`: production runner or critical generation step failed.
- `overall=BLOCKED`: local runtime, browser, admin auth, or external tool dependency blocked evidence.
- `overall=WARN`: release is not fully green or optional supporting gates warned.

## Evidence To Open

- `reports\production-readiness.md`
- `reports\release-decision.md`
- `reports\known-blockers.md`
- `reports\next-actions.md`
- `reports\machine-interface\index.html`
- `reports\repair-cards.md`
- `reports\battle-ready.md`
- `reports\evidence-graph.md`
- `reports\flake-summary.md`
- `reports\production-runs\<productionRunId>\archive-manifest.md`
- `reports\production-run-state.json`

## Normal Operating Loop

1. Run the production command.
2. Open `production-readiness.md`.
3. If `productionReady=false`, open `known-blockers.md`.
4. Execute the first `unblockCommand` or `humanAction` that is inside your role boundary.
5. Run the listed `verifyCommand`.
6. Rerun the production command.

## Human Login Boundary

Admin coverage requires a human-authenticated, gitignored storage state under `secrets\`. The tester must not invent or commit credentials. Use:

For the full super-admin human-testing contract, including login-as-user, human pace, admin chat, ban testing, and evidence rules, read:

- `SUPER-ADMIN-HUMAN-TESTER-RUNBOOK.md`

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Capture-ConfidelineAdminStorageState.ps1
```

For known demo credentials, use the automated capture mode and keep credentials out of source files:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Capture-ConfidelineAdminStorageState.ps1 -AutoLogin -Username <admin-user> -Password <admin-password> -Role super-admin
```

After capture, inspect the admin surfaces:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Inspect-ConfidelineAdminSurface.ps1
```

To seed and verify assigned-questionnaire admin chat dialogs, use:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineAdminAssignedDialogSeed.ps1 -DialogCount 20
```

This creates the inbound side through frontend user impersonation, then replies from the assigned questionnaire through the admin chat endpoint `/admin/chat/message-create`.

To audit full and shadow-ban behavior:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineBanBehaviorAudit.ps1
```

The audit creates temporary bans only on internal demo users, tests the banned-user and counterpart perspectives, then releases the created bans and verifies `active_ban_id=false`.

## Deploy Boundary

This tester does not deploy externally. Use the generated deploy bundle and manifest with a proven hosting/deploy contour, then rerun production QA.

Required evidence:

- `reports\deploy-sync-manifest.md`
- `reports\deploy-bundle-summary.json`
- `reports\deploy-bundle\...\checksums.csv`
- rollback checklist
- post-deploy production QA run

## Stop Conditions

- Do not claim conversion truth until analytics runtime is `RUNTIME_PROVEN`.
- Do not claim release readiness while release decision is `NO_GO`.
- Do not mark source-fixed live defects closed until live checks pass after sync.
- Do not treat missing admin storage state as product failure.
- Do not use stale browser summaries as current production evidence.
- Do not treat a copied archive as valid unless its `archive-manifest.json` passes validation.
- Do not hide interrupted production steps; finalizer must mark unfinished required steps as `BLOCKED`.
