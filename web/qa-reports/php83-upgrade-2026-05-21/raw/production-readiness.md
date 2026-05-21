# Confideline Production QA Readiness

- Production run: confideline-production-qa-20260521-160149
- Generated: 2026-05-21T16:07:26.1837544+03:00
- Base URL: https://confideline.com
- Overall: **FAIL**
- Production ready: **False**
- Release decision: **NO_GO**
- Latest QA run: confideline-qa-20260521-160614 / FAIL
- Runtime readiness: FAIL
- Analytics runtime: NOT_PROVEN / phase collecting_client_events

## Steps

| Step | Status | Exit | Duration | Output |
|---|---:|---:|---:|---|
| runtime-readiness | FAIL | 0 | 2.79s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\runtime-readiness-production-output.txt |
| admin-storage-validation | WARN | 0 | 49.88s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\admin-storage-validation-production-output.txt |
| performance-qa | BLOCKED | 0 | 0.5s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\performance-qa-production-output.txt |
| security-passive-qa | BLOCKED | 0 | 0.52s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\security-passive-qa-production-output.txt |
| browser-qa | PASS | 0 | 204.68s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\browser-qa-production-output.txt |
| analytics-runtime-qa | WARN | 0 | 6.21s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\analytics-runtime-qa-production-output.txt |
| full-qa | FAIL | 0 | 60.21s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\full-qa-production-output.txt |
| deploy-bundle | PASS | 0 | 2.48s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\deploy-bundle-production-output.txt |
| release-decision | FAIL | 0 | 0.99s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\release-decision-production-output.txt |
| known-blockers | PASS | 0 | 0.85s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\known-blockers-production-output.txt |
| machine-interface | PASS | 0 | 0.85s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\machine-interface-production-output.txt |
| admin-surface-inspection | PASS | 0 | 5.63s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\admin-surface-inspection-production-output.txt |
| evidence-graph | PASS | 0 | 0.46s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\evidence-graph-production-output.txt |
| flake-summary | PASS | 0 | 0.36s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\flake-summary-production-output.txt |
| artifact-contract | FAIL | 0 | 0.47s | H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\artifact-contract-production-output.txt |

## Stop Conditions

- Do not claim release readiness unless productionReady is true.
- Do not claim analytics conversion truth unless analytics runtime is RUNTIME_PROVEN.
- Do not execute external deploy/sync from this runner; use the generated deploy bundle with a proven external deploy contour and rollback path.
- Do not run authenticated admin checks without gitignored storage states captured by a human login.

## Next Operator Command

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineQaProduction.ps1 -SkipInstall
```
