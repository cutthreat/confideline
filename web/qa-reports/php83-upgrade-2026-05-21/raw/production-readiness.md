# Confideline Production QA Readiness

- Production run: confideline-production-qa-20260523-124528
- Generated: 2026-05-23T12:49:02.0778349+03:00
- Base URL: https://confideline.com
- Overall: **FAIL**
- Production ready: **False**
- Release decision: **NO_GO**
- Latest QA run: confideline-qa-20260523-124834 / FAIL
- Runtime readiness: FAIL
- Analytics runtime: NOT_PROVEN / phase collecting_client_events

## Steps

| Step | Status | Exit | Duration | Output |
|---|---:|---:|---:|---|
| runtime-readiness | FAIL | 0 | 1.24s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\runtime-readiness-production-output.txt |
| admin-storage-validation | WARN | 0 | 5.95s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\admin-storage-validation-production-output.txt |
| performance-qa | BLOCKED | 0 | 0.46s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\performance-qa-production-output.txt |
| security-passive-qa | BLOCKED | 0 | 0.5s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\security-passive-qa-production-output.txt |
| browser-qa | PASS | 0 | 171.59s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\browser-qa-production-output.txt |
| analytics-runtime-qa | WARN | 0 | 6.01s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\analytics-runtime-qa-production-output.txt |
| full-qa | FAIL | 0 | 19s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-qa-production-output.txt |
| deploy-bundle | PASS | 0 | 1.02s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\deploy-bundle-production-output.txt |
| release-decision | FAIL | 0 | 0.57s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\release-decision-production-output.txt |
| known-blockers | PASS | 0 | 0.38s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\known-blockers-production-output.txt |
| machine-interface | PASS | 0 | 0.45s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\machine-interface-production-output.txt |
| admin-surface-inspection | PASS | 0 | 5.53s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\admin-surface-inspection-production-output.txt |
| evidence-graph | PASS | 0 | 0.39s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\evidence-graph-production-output.txt |
| flake-summary | PASS | 0 | 0.36s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\flake-summary-production-output.txt |
| artifact-contract | FAIL | 0 | 0.48s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\artifact-contract-production-output.txt |

## Stop Conditions

- Do not claim release readiness unless productionReady is true.
- Do not claim analytics conversion truth unless analytics runtime is RUNTIME_PROVEN.
- Do not execute external deploy/sync from this runner; use the generated deploy bundle with a proven external deploy contour and rollback path.
- Do not run authenticated admin checks without gitignored storage states captured by a human login.

## Next Operator Command

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineQaProduction.ps1 -SkipInstall
```
