# Admin live audit summary 2026-05-23

Verdict: NO_GO
Target: https://confideline.com
Admin auth: confirmed via Manhattan after handoff blocker was finished

Read-only matrix: 39 URL, corrected PASS=37, FAIL=2

## Findings

- P0 FAIL Admin Cities search: GeonameSearch[name]=Munich returns Ошибка (#8192); URL-like value also returns #8192.
- P1 FAIL Admin grid query links: Cities sort/page and Countries sort query URLs return Not Found (#404).
- P1 FAIL Admin Plugins: /ru/admin/plugin/index and /ru/admin/plugin/browse return HTTP 500 / Ошибка (#8192).
- P2 WARN Admin sidebar parent links: Parent menu links render literal {url} placeholder in href for grouped menu items.

## Not executed without rollback

- DELETE actions
- plugin enable/disable/install/update/uninstall
- settings save
- moderation approve/reject
- ban create/delete
- money-changing flows

Admin PHP lint: 215 files, errors=0, PHP 8.1.34 (cli) (built: Dec 16 2025 18:41:32) (ZTS Visual C++ 2019 x64)