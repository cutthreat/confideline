# Confideline.com i18n legal docs package

Назначение: пакет HTML-фрагментов для админского `pages-language-picker`.

## Locale coverage

- `original`
- `ar-AR`
- `ca-ES`
- `cs-CZ`
- `de-DE`
- `en-US`
- `es-ES`
- `fr-FR`
- `it-IT`
- `ru-RU`
- `uk-UA`

## Document coverage

18 page slugs:

- `legal`
- `about`
- `terms-and-conditions`
- `privacy-policy`
- `cookie-policy`
- `payment-subscription-terms`
- `refund-policy`
- `community-guidelines`
- `disclaimer`
- `safety`
- `anti-scam`
- `notice-action-appeals`
- `ip-complaints`
- `legal-notice-contact`
- `consultant-terms`
- `code-of-ethics`
- `aml-kyc-policy`
- `earnings-disclaimer`

Total generated fragments: `198`.

## Status

These are working localization drafts for legal/native review. They are not final legal texts. Before publishing:

- replace all placeholders;
- confirm EU company details;
- confirm age threshold;
- confirm payment/refund/subscription model;
- run legal review per jurisdiction;
- run native-language review for every locale;
- copy each HTML fragment into the matching page/language in the YouDate admin.

## Files

- `index.html` - visual coverage matrix.
- `manifest.json` - machine-readable coverage list.
- `coverage.csv` - flat coverage table.
- `<locale>/<slug>.html` - HTML fragment for the admin editor.
- `generate_i18n_package.py` - deterministic generator used to rebuild the package.

