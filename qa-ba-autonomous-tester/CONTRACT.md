# Confideline Autonomous QA/BA Contract

Updated: 2026-05-02

## Goal

Create a repeatable autonomous testing contour that checks Confideline as a business-critical paid consultation product, not just as a generic Yii2 website.

## Business Result

Confideline gets evidence-based QA reports that show whether the product can safely support:

- acquisition traffic;
- signup/login;
- trust/legal disclosure;
- first paid consultation;
- advisor/admin operations;
- repeat purchase and refund-risk analysis.

## Result

This package provides:

- executable non-destructive public-site checks;
- report artifacts in Markdown and JSON;
- Playwright/axe scaffolding for browser E2E and accessibility checks;
- k6 and ZAP scaffolding for performance/security smoke;
- a gated admin/browser contract that does not fake admin coverage when route/session proof is missing.

## Scope

Implemented now:

- public HTTP route checks;
- login/signup form surface checks;
- public link and legal/trust page checks;
- modal/id surface checks from raw HTML;
- analytics event-schema hygiene checks;
- admin route discovery probes;
- Manhattan lane status probe;
- findings register generation.
- subagent/Spark policy guard for up to 10 bounded QA subagents per pass using `gpt-5.3-codex-spark` at `xhigh` reasoning when useful for testing.

Planned next:

- authenticated admin checks after current admin prefix/session is proven;
- Manhattan screenshots and Playwright traces after browser lane ownership is available;
- local Yii2 seeded runtime checks when the local runtime is restored.

## Done When

The first implementation wave is done when:

- `scripts\Invoke-ConfidelineQa.ps1` runs without crashing;
- JSON and Markdown reports are generated under `reports\`;
- PASS/WARN/BLOCKED findings are explicit;
- live admin/browser limitations are reported as blockers, not hidden.

## How To Verify

Run:

```powershell
powershell -ExecutionPolicy Bypass -File H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\scripts\Invoke-ConfidelineQa.ps1
```

Expected artifacts:

- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\latest-report.md`
- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\latest-report.json`
- `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\findings.csv`

## Stop Conditions

Stop or downgrade to blocked when:

- admin route/session cannot be proven;
- Manhattan lane is owned by another task;
- a check would perform a real payment, send external messages, or destructively mutate live data;
- evidence is stale or only documented from an old run.

## Evidence Discipline

Facts:

- current HTTP responses, local source files, generated reports.

Inference:

- product/business impact from observed behavior.

Recommendation:

- smallest next action that improves coverage or fixes a defect.
