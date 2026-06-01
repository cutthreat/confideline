# Email template file structure

Primary language: English.

Russian files are included as a second localization and for product-owner review.

## Decision

One email scenario equals one folder:

```text
templates/NN_template_code/
  en/
  ru/
```

Each language folder contains the same file names:

```text
subject_email.txt
preheader_note.txt
body_email_html.html
body_email_txt.txt
comment_about.txt
admin-meta.json
```

Root-level duplicates inside `templates/NN_template_code/` are not part of the import contract.

`template_code` is the package scenario name. `event_name` is the backend/admin trigger key.
