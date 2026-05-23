# Admin authenticated flow correction

- Generated: 2026-05-23T10:31:35.9642519Z
- Verdict: **PASS_EXISTING_AUTHENTICATED_ADMIN_SESSION_EVIDENCE**
- Correct rule: login as a normal user that has super-admin/admin role, then open admin panel via the user dropdown menu or authenticated `/ru/admin` tab.
- Previous direct route check without that flow is invalid for admin functionality verdict.

## Visible authenticated admin pages

- Update geoname: https://confideline.com/ru/admin/geoname/update?id=2867714&lang=ru-RU
- Update country: https://confideline.com/ru/admin/country/update?id=3865483&lang=ru-RU
- Update country: https://confideline.com/ru/admin/country/update?id=3175395&lang=ru-RU
- Update country: https://confideline.com/ru/admin/country/update?id=2921044&lang=ru-RU
