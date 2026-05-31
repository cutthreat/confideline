# Partner interactions analytics - Codex migration task

## Result

Move the approved offline web panel into the real Confideline/Yii2 site as a role-scoped analytics feature for active client/expert interactions.

The feature answers:

```text
кто -> кому -> какое действие -> сколько раз
```

## Scope

Implement three separate pages with one shared analytics service:

| Variant | Route | Data scope |
| --- | --- | --- |
| Admin | `/admin/partner-interaction/index` | all Partners, selected Partner, or selected expert questionnaire |
| Partner | `/admin/partner-interaction/my` | only expert questionnaires assigned to current Partner |
| Expert | `/expert/interaction/index` or actual live expert cabinet route | only current expert questionnaire and its clients |

User-facing term: `Партнер`.

Technical role value: `agent`.

Do not create a new public entity named `agent`.

Documentation must stay outside the product UI. Do not add a `ТЗ`, `Codex handoff`, developer notes, debug payload, or implementation text to the working analytics pages.

## Required current-site sources

Use the current live admin model:

```text
/admin/partner/index
/admin/chief-under/index?userId=<partnerUserId>
```

Expected assignment mapping:

```text
chief_under.user_id  -> Partner user id
chief_under.under_id -> expert questionnaire user id
```

If the live schema uses different column names, map them once in the service/repository layer and keep the UI/API contract unchanged.

## UI migration

Source panel:

```text
H:\GPT-Codex\Confideline\Analitica\offline-test-env
```

Files to use as implementation reference:

```text
index.html
partner.html
expert.html
assets/partner-interactions.css
assets/partner-interactions.js
assets/partner-interactions-analytics.js
```

Production migration rule:

- convert HTML into Yii2 views/partials;
- keep Confideline admin/sidebar styling;
- keep role-specific filters;
- move aggregation from browser JS into PHP service/SQL;
- use browser JS only for UI state, tab switching, AJAX refresh, and chart rendering;
- do not expose debug simulator in production.

## Filters

All variants:

```json
{
  "period": "today|7d|30d|all",
  "direction": "all|client_to_expert|expert_to_client",
  "expertId": 0,
  "query": "",
  "minActions": 0,
  "sort": "total_desc",
  "page": 1,
  "pageSize": 50
}
```

Admin additionally supports:

```json
{
  "partnerId": 0
}
```

Partner must ignore any request `partnerId` and use the current user id.

Expert must ignore any request `partnerId` and any foreign `expertId`.

## Metrics

MVP metrics:

- profile views of expert questionnaires;
- favorites/bookmarks only if the production feature exists;
- chat starts from client to expert;
- client messages;
- expert replies;
- paid consultations from a reliable successful payment source;
- repeat requests;
- blocks;
- reports.

The UI and API docs must keep these metrics in consultation-funnel order:

```text
profile views -> favorites/bookmarks -> chat starts -> client messages -> expert replies -> paid consultations -> repeat requests -> blocks -> reports
```

This is a product decision for Confideline / Nebula, not a technical sorting preference.

Consultation-quality KPIs:

- active clients;
- client-started dialogs;
- answered dialogs;
- unanswered dialogs;
- response rate;
- expert outbound without client message.

## Charts

Use the same filtered dataset as the table. The chart screen should follow the Yandex Metrica-style report-builder pattern:

- top controls;
- metric selector;
- dimension selector;
- chart type selector;
- period/segment comparison;
- time grouping;
- selected comparison participants;
- chart, legend, and detail table.

Admin:

- `partnerId = 0`: compare Partners;
- selected Partner: compare assigned expert questionnaires;
- selected expert: compare clients.

Partner:

- compare assigned expert questionnaires;
- if a client is searched, show that client across all assigned expert questionnaires.

Expert:

- compare clients of current expert questionnaire.

Required chart cards:

Required chart controls:

- metric: all actions, profile views, favorites/bookmarks, client-started dialogs, client messages, expert replies, paid consultations, repeat requests, reports+blocks;
- dimension: Partners, expert questionnaires, clients;
- chart type: line, bar, stacked/action mix, share, table;
- comparison: none, previous period, selected participants;
- grouping: day, week, month;
- selected participants: 2-6 entities from the current access scope.

Required chart output:

- line chart for time dynamics;
- bar/share view for participant comparison;
- action-mix view for understanding what creates activity;
- table with selected participant, value, previous period, delta, expert count, client count.

## Backend contract

The backend response must include:

```json
{
  "meta": {},
  "summary": {},
  "qualitySummary": {},
  "riskSummary": {},
  "pagination": {},
  "rows": [],
  "charts": {
    "groups": [],
    "metricMix": [],
    "timeline": []
  },
  "warnings": []
}
```

Do not render all rows for admin scale. Aggregate and paginate on the server.

## Security and access rules

Admin:

- can choose any Partner and expert questionnaire;
- should still use permission checks from the existing admin module.

Partner:

- must have technical role `agent` or pass the same rule used by `/admin/partner/index`;
- sees only `chief_under` assignments for current user;
- cannot request another Partner by query parameter.

Expert:

- sees only current expert questionnaire;
- cannot view other expert questionnaires assigned to the same Partner.

All:

- exclude client/client, expert/expert, assigned expert/assigned expert, self-events, and unassigned expert rows.

## Acceptance tests

Before production handoff, run the offline verifier:

```powershell
cd H:\GPT-Codex\Confideline\Analitica\offline-test-env
.\scripts\Test-PartnerInteractionsOfflineEnv.ps1
```

Production implementation is accepted when:

1. Admin route opens and filters all Partners / one Partner / one expert.
2. Partner route has no Partner selector and cannot be widened by URL.
3. Expert route shows only the current expert questionnaire.
4. Table and charts use the same filters and access scope.
5. Large data is paginated server-side.
6. Counts match fixture-equivalent seeded data.
7. `paidConsultations` is either proven from a successful consultation payment source or shown as unavailable.
8. Desktop and mobile layouts do not overlap or break.

## Open production questions

These do not block the offline panel, but block final production accuracy:

1. Which table/log is the reliable source for successful paid consultation at the client/expert pair level?
2. What is the exact live route and permission rule for the expert cabinet?
3. Does the live project store assignment history, or must `partner_expert_assignment` be added?
4. Does production have a real favorites/bookmarks event and a reliable repeat-request definition, or should these be hidden until event logging is added?
