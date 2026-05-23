# Confideline QA Runtime Readiness

- Generated: 2026-05-23T12:45:37.3764403+03:00
- Overall: **FAIL**

| ID | Status | Summary |
|---|---|---|
| RUNTIME-NODE | PASS | Node is available. |
| RUNTIME-NPM | PASS | npm is available. |
| RUNTIME-PLAYWRIGHT | PASS | Local Playwright command is available. |
| RUNTIME-MEMORY | PASS | Physical memory snapshot collected. |
| RUNTIME-PAGEFILE | PASS | Pagefile usage snapshot collected. |
| RUNTIME-BROWSER-PROCESS-PRESSURE | WARN | Browser/Node process pressure snapshot collected. |
| RUNTIME-DOCKER | WARN | Docker command exists but readiness check failed. |
| RUNTIME-ROLE-MAP | PASS | Admin role map exists. |
| RUNTIME-ADMIN-STORAGE-STATES | WARN | Admin storage-state presence checked; role-aware admin QA requires both super-admin and moderator states. |
| RUNTIME-ADMIN-STORAGE-VALIDATION | FAIL | Admin storage-state validation evidence exists. |
| RUNTIME-PLAYWRIGHT-VERSION | PASS | Playwright CLI version check completed. |
