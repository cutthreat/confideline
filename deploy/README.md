# Confideline Pages Reliability Helper

## Result

Keep one canonical list of public Confideline preview links and verify that local files and
GitHub Pages URLs are still alive.

## Canonical URL

Use this as the stable entry point:

```text
https://cutthreat.github.io/confideline/web/
```

## Check Local Files

```powershell
cd H:\GPT-Codex\Confideline
.\deploy\Test-ConfidelinePages.ps1
```

## Check Public GitHub Pages

```powershell
cd H:\GPT-Codex\Confideline
.\deploy\Test-ConfidelinePages.ps1 -CheckPublic
```

The script writes a machine-readable report to:

```text
.runtime/pages-health/latest.json
```

## How To Use

Run the public check before sending links to anyone and after every push that changes preview
HTML. If the check fails, the report shows the broken local file or public URL.

The helper does not stage, commit, push, delete, or rewrite existing pages. It is a health gate
for the GitHub Pages contour.
