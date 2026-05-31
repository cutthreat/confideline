# Partner interactions metric contract

## Goal

Define exactly what each metric means so Partner analytics can be trusted and audited.

The page is not a dating dashboard. For Confideline/Nebula it is an operational consultation-control report: does the Partner's assigned expert pool attract clients, answer them, convert them, and avoid trust problems.

Terminology follows the live admin panel: `Partner` is the product/admin term, while `agent` is the technical role value shown for a Partner row.

## Table metrics

| Metric | Source | Actor -> target | Count rule | Consultation value |
| --- | --- | --- | --- | --- |
| `profileViews` | `guest` | `from_user_id -> visited_user_id` | Raw visits for MVP | Measures interest in an expert profile |
| `favorites` | favorites/bookmarks source | client -> expert | Add expert profile to saved/favorite list | Secondary intent signal; include only if production has this feature |
| `chatStarts` | `message` or event-log | client -> expert | First client action that opens a dialog | Shows consultation intent |
| `clientMessages` | `message` | client -> expert | Raw client messages | Core demand metric |
| `expertReplies` | `message` | expert -> client | Raw expert replies | Core service-quality metric |
| `paidConsultations` | payment/order/balance source | client -> expert | Successful paid consultation only | Real conversion and revenue signal |
| `repeatRequests` | event-log or derived dialog/payment history | client -> expert | Returning request after previous interaction | Retention and trust signal |
| `blocks` | `block` | `from_user_id -> blocked_user_id` | Raw block facts | Trust/safety negative signal |
| `reports` | `report` | `from_user_id -> reported_user_id` | Raw report facts | Trust/safety escalation signal |

## Metric order

The display order is the consultation funnel:

```text
profileViews -> favorites -> chatStarts -> clientMessages -> expertReplies -> paidConsultations -> repeatRequests -> blocks -> reports
```

This order is mandatory for table columns, chart metrics, sorting controls and documentation. It helps the operator read the report as a journey from demand to fulfillment, conversion, retention and risk.

## Paid consultation source gap

Current status: `paidConsultations` must be mapped to a reliable successful payment source before it is used for payroll, sanctions, or Partner comparison.

Acceptable source must include:

- buyer user id;
- expert user id;
- consultation/chat/order id;
- success status;
- event time;
- stable source id.

If no existing table has this, add a write event at successful consultation payment time.

## Quality metrics

These metrics are the best MVP addition for an esoteric-consultation service because they measure whether the Partner's expert pool handles client demand.

| Metric | Rule | Why useful |
| --- | --- | --- |
| `activeClients` | unique client ids with any action toward/from assigned experts | Shows real demand across the Partner's pool |
| `clientStartedDialogs` | client/expert pairs where client sent at least one message | Shows client intent to consult |
| `answeredDialogs` | client-started pairs where expert also sent messages | Shows whether expert profile replied |
| `unansweredDialogs` | client-started dialogs without expert reply | Direct operational loss risk |
| `responseRate` | `answeredDialogs / clientStartedDialogs * 100` | Simple Partner quality KPI |
| `outboundWithoutClientMessage` | expert sent messages where client did not initiate | Finds aggressive or low-quality outreach |

## Recommended next quality metrics

These require event-level timestamps, not only row aggregates:

| Metric | Required source | Value |
| --- | --- | --- |
| `firstResponseTime` | first client message and first later expert message | Core SLA for paid consultation funnel |
| `medianResponseTime` | all client->expert reply gaps | Better than average for outliers |
| `noReplyAfter15m/1h/24h` | message timestamps | Partner shift/control alerts |
| `paidAfterMessage` | payment event + prior dialog | Measures conversion, not vanity activity |
| `repeatClientRate` | clients returning to same expert | Trust/retention signal |
| `complaintRate` | reports/blocks per active client | Quality and safety signal |

## Interpretation rules

1. Client messages and expert replies are more important than inherited dating-style interest actions.
2. Replies are more important than total outbound volume.
3. Paid conversion should not be inferred from messages or balance deltas unless a successful consultation payment event proves it.
4. Reports/blocks must be visible even when total activity is high.
5. Any metric must be drillable to source events before being used for payroll, penalties, or promotion.

## MVP acceptance

MVP is acceptable when:

- Partner route has no free `partnerId` input;
- assigned experts come from the assignment source;
- only client/expert pairs are counted;
- direction filter works;
- table metrics and quality metrics are shown;
- `paidConsultations` is either sourced from successful consultation payments or explicitly unavailable;
- local verifier passes.
