# Partner interactions data contract

## Result

Build a reliable analytics layer for a Partner who has the technical role `agent` and manages assigned expert questionnaires. The report must show active interactions between real clients and the expert questionnaires assigned to that Partner.

Core question:

```text
who -> whom -> what action -> how many times
```

## Roles

| Role | Meaning | Analytics access |
| --- | --- | --- |
| Client | Registered real site user who consumes consultation functionality | No access to this report |
| Expert questionnaire | User account/profile presented as an advisor/expert to clients | Counted as the expert side of interactions |
| Partner | Site partner account with technical role `agent`; manages one or more expert questionnaires | Sees only assigned expert questionnaires |
| Admin | Internal administrator | Can choose any Partner |

Important: the Partner is not the expert questionnaire. `agent` is the technical role value shown on `/admin/partner/index`; the user-facing term remains Partner.

## Source-of-truth rule

Current site logic wins over task wording. If a chat/task term conflicts with the live admin model, use the live admin model:

```text
Partner list: /admin/partner/index
Assigned questionnaires: /admin/chief-under/index?userId=<partnerUserId>
Technical role value for a Partner row: agent
User-facing term: Partner
```

Do not introduce a new entity named `agent` in the product UI. Use `agent` only as a technical role/code value when checking permissions or data.

## Assignment model

### MVP source

Use the existing `chief_under` assignment source where available.

Live admin surfaces:

```text
/admin/partner/index
/admin/chief-under/index?userId=<partnerUserId>
```

Expected current mapping:

```text
chief_under.user_id  -> Partner user id, role = agent
chief_under.under_id -> assigned expert questionnaire user id
```

Fallback column detection for local variants:

```text
partner: user_id | chief_id | partner_id | parent_id
expert: under_id | expert_id | questionnaire_id | child_id
```

### Recommended durable model

Add historical assignment state so old performance stays attached to the Partner who actually managed the questionnaire at that time:

```text
partner_expert_assignment
id
partner_user_id
partner_role
expert_user_id
assigned_from
assigned_to
status
assigned_by
created_at
updated_at
```

Rules:

- one active assignment per `expert_user_id` at a time;
- analytics for a period should use the assignment active at event time;
- admin reassignment must close the previous row by setting `assigned_to`;
- deleted/blocked experts remain reportable historically.

Why this matters for esoteric consultations: Partners are responsible for conversion quality, client trust, replies, and complaints while they manage an expert profile. If an expert profile is moved to another Partner, historical results must not move with it.

## Interaction event contract

The report should normalize all source tables into one logical event shape:

```json
{
  "event_id": "guest:123",
  "source_table": "guest",
  "source_id": 123,
  "actor_id": 185,
  "target_id": 184,
  "action_type": "profileViews",
  "event_time": 1779277200,
  "count": 1,
  "metadata": {}
}
```

MVP can aggregate directly from existing tables. The durable implementation should expose a `user_interaction_events` query layer or materialized table with the same columns.

## Relevant pair rule

An event is counted only when exactly one side is an assigned expert questionnaire:

```text
assigned expert -> client
client -> assigned expert
```

Excluded:

- client -> client;
- expert -> expert;
- assigned expert -> assigned expert;
- unassigned expert -> client for the selected Partner;
- self-events where `actor_id = target_id`.

## Direction contract

| directionKey | Meaning |
| --- | --- |
| `client_to_expert` | Client performed the action toward assigned expert questionnaire |
| `expert_to_client` | Assigned expert questionnaire performed the action toward client |
| `all` | Both directions |

## Search, sorting, and pagination contract

Large-volume behavior is not optional. Expected operating scale:

- expert questionnaire: 100-1000 dialog pairs;
- Partner: 5-30 assigned expert questionnaires;
- admin: 1-50 Partners and more than 5000 expert questionnaires in the system.

Required filters:

| field | Meaning |
| --- | --- |
| `expertId` | Optional narrowing to one expert questionnaire inside current allowed scope |
| `query` | Client search by user id, name, username, email where available |
| `minActions` | Hide pairs below selected action count |
| `sort` | `total_desc` or consultation funnel metric sort: `profileViews_desc`, `favorites_desc`, `chatStarts_desc`, `clientMessages_desc`, `expertReplies_desc`, `paidConsultations_desc`, `repeatRequests_desc`, `blocks_desc`, `reports_desc` |
| `page` | 1-based page number |
| `pageSize` | 50, 100, 250, or 500 |

Production rule: do not render all rows in one HTML table. The backend must return the current page of rows plus total row count.

## Funnel order contract

All surfaces must use the same consultation-funnel metric order:

```text
profileViews -> favorites -> chatStarts -> clientMessages -> expertReplies -> paidConsultations -> repeatRequests -> blocks -> reports
```

This order applies to:

- table columns;
- action legend;
- metric sorting dropdown;
- chart metric dropdown;
- fixture `columns`;
- API docs and handoff docs.

Do not reintroduce historical dating/private-content metrics into this order.

## Period contract

| period | Meaning |
| --- | --- |
| `today` | From 00:00 in project timezone to now |
| `7d` | Last 7 x 24 hours to now |
| `30d` | Last 30 x 24 hours to now |
| `all` | No lower date boundary |

Project timezone: `Europe/Minsk` unless the business explicitly changes operational reporting timezone.

## Access contract

The functionality must have three role variants, not one generic page.

### Admin route

```text
GET /admin/partner-interaction/index?partnerId=15&period=7d&direction=all
```

Admin may set `partnerId`.

Admin sees:

- any Partner from `/admin/partner/index`;
- assigned expert questionnaires for selected Partner;
- all client/expert interaction rows for that Partner;
- diagnostic warnings and source gaps.

### Partner route

```text
GET /admin/partner-interaction/my?period=7d&direction=all
```

Partner route must ignore request `partnerId`; it uses `Yii::$app->user->id` and must be available only to users who are valid Partners, i.e. rows from the Partner management contour where the role value is `agent`.

Implementation warning: the local base package used for the prototype does not contain the live-specific `PartnerController` / `ChiefUnderController` sources. Final production wiring must reuse the live Partner access logic instead of inventing a parallel role model.

Partner sees:

- only expert questionnaires assigned to this Partner through `chief-under`;
- no free Partner selector;
- quality KPIs across assigned questionnaires;
- table rows where one side is an assigned expert questionnaire and the other side is a client.

### Expert route

```text
GET /expert/interaction/index?period=7d&direction=all
```

Final route can be adjusted to the actual front/expert cabinet routing. The access rule is fixed: the expert sees only the current expert questionnaire, never other expert questionnaires assigned to the same Partner.

Expert sees:

- only current expert questionnaire;
- client interactions with this questionnaire;
- no Partner selector;
- no assigned-pool view;
- no data for other experts.

## Response contract

```json
{
  "meta": {
    "partnerId": 15,
    "period": "7d",
    "direction": "all",
    "assignmentSource": "chief_under",
    "timezone": "Europe/Minsk"
  },
  "expertIds": [184, 192],
  "summary": {
    "experts": 2,
    "pairs": 4,
    "messages": 26,
    "actions": 48
  },
  "riskSummary": {
    "reports": 1,
    "blocks": 1,
    "paidConsultations": 1,
    "highActivityPairs": 2
  },
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "totalRows": 318,
    "totalPages": 7,
    "from": 1,
    "to": 50
  },
  "qualitySummary": {
    "activeClients": 2,
    "clientStartedDialogs": 2,
    "answeredDialogs": 2,
    "unansweredDialogs": 0,
    "responseRate": 100,
    "outboundWithoutClientMessage": 0
  },
  "rows": []
}
```

## Chart/report contract

Charts must behave like an analytics report builder, not like decorative dashboard cards. The product reference is the Yandex Metrica report pattern: controls at the top, configurable metric/dimension, chart type, segmentation/comparison, chart plus table. Charts must use the same filtered dataset as the table and must never show data outside the current role access scope.

Required chart dimensions:

| Role/view | Main comparison | Secondary drilldown |
| --- | --- | --- |
| Admin, `partnerId = 0` | Partners against each other | Partner -> expert questionnaires -> clients |
| Admin, selected Partner | Expert questionnaires inside selected Partner | Expert questionnaire -> clients |
| Admin, selected expert | Clients of selected expert questionnaire | Client pair rows |
| Partner | Assigned expert questionnaires | Selected client across all assigned questionnaires |
| Expert | Clients of current expert questionnaire | Client pair rows |

Required chart controls:

```json
{
  "charts": {
    "metric": "total|profileViews|favorites|clientStartedDialogs|clientMessages|expertReplies|paidConsultations|repeatRequests|risk",
    "dimension": "partner|expert|client",
    "chartType": "line|bar|stacked|pie|table",
    "comparison": "none|previous_period|selected_segments",
    "granularity": "day|week|month",
    "selectedIds": [15, 77],
    "series": [],
    "rows": []
  }
}
```

Production rule: for admin all-partners and `all` period, chart data should be built server-side from aggregated rows, not by sending all raw events to the browser.

Why this matters for esoteric consultations: the admin needs to compare Partners by response quality and risk, the Partner needs to see which assigned expert questionnaires are failing clients, and the expert needs to see which clients require attention.

## Row contract

```json
{
  "actorId": 185,
  "targetId": 184,
  "directionKey": "client_to_expert",
  "direction": "Клиент -> эксперт",
  "profileViews": 6,
  "favorites": 1,
  "chatStarts": 1,
  "clientMessages": 9,
  "expertReplies": 0,
  "paidConsultations": 1,
  "repeatRequests": 0,
  "blocks": 0,
  "reports": 0,
  "total": 18
}
```

## Performance contract

MVP:

- SQL aggregation per metric;
- no PHP scan over full raw event tables;
- page size 50;
- indexes on actor, target, event time columns.

Scale:

```text
interaction_daily_agg
date
partner_user_id
partner_role
expert_user_id
client_user_id
direction_key
action_type
count
```

Use daily aggregates for `30d` and `all` when raw tables become large.
