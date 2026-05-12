# Confideline admin chat workspace v2 handoff

Date: 2026-05-12
Target mockup: `H:\GPT-Codex\Confideline\Chat\admin-chat-workspace-v2\chat-workspace-v2.html`
Source reference: `J:\Codex Base J\Users\alexe\Downloads\admin-chat-stage1`

## Result

Stage 1 was converted into a role-aware operator workspace for paid esoteric minute consultations.

The mockup now separates:
- active dialogs;
- pings, meaning pre-chat interest signals from expert profile views;
- paid-session timing and top-up workflow;
- focus mode for paid/risk conversations;
- client language as operational context;
- clickable prototype actions for agent work simulation;
- system, supervisor, and operator flags.
- final launch cleanup that removes agent-view noise (`Mine`, duplicate queue summary, duplicate header indicators);
- a public migration guide for moving individual areas into another Codex/Yii2 branch.

## Product facts

- Client-side communication always appears from the expert profile.
- Agent/operator identity is internal only and must be visible in audit, assignment, routing, and quality control.
- Moderator functionality is not a separate screen now; moderator value is represented through supervisor flags.
- Billing model is minute-based paid consultation.
- Translation/i18n keys are out of this mockup wave.

## Main queue model

Top workload switch:
- `All`: active chats plus pings that may require action.
- `Active chats`: real dialogs only.
- `Pings`: profile-interest leads before a chat starts.

Do not treat pings as normal unread chats. A ping has no incoming message and no reply SLA until the platform/operator starts outreach or the client opens chat.

Queue cards are auto-sorted by operational urgency:
1. `Paid active`
2. `Top-up needed` / low balance
3. `Overdue`
4. `Needs reply`
5. `New ping`
6. `Follow-up due`
7. `Waiting client`

Do not add these as primary tabs. They are priority states and filters, not separate workspaces.

## Active chat filters

Recommended quick filters:
- `Needs reply`
- `Paid live`
- `Low balance`
- `Top-up needed`
- `Overdue`
- `Waiting client`
- `Follow-up`
- `Escalated`
- `Hot`
- `Refund risk`
- `Do not push`

## Ping filters

Recommended quick filters:
- `New ping`
- `High intent`
- `Repeat view`
- `Uncontacted`
- `Contacted`
- `Expiring`
- `Has credits`
- `Paid before`

Client language:
- show compactly in the conversation header and right context;
- use it for template selection and translation target;
- do not promote it into a main queue tab.

## Flags

Flags must have a source and an action.

System flags:
- `Needs reply`
- `Paid live`
- `Low balance`
- `Overdue`
- `New ping`
- `High intent`
- `Policy risk`

Supervisor flags:
- `Hot client`
- `Quality watch`
- `Do not push`
- `Needs handoff`
- `Retention risk`
- `Complaint risk`

Supervisor flag behavior:
- `indicator`: highlights queue/context only, for example `Quality watch`, `Complaint risk`, `Do not push`.
- `routing-impact`: changes priority or redistribution candidates, for example `Hot client`, `Needs handoff`, `Retention risk`.

Operator flags:
- `Need data`
- `Top-up script prepared`
- `Follow-up`
- `Waiting client`
- `Resolved`

Card rule: show no more than 3-4 visible flags in the queue card. Full flag detail belongs in the right panel.

## Paid session panel

The paid session panel is not just billing data. It is a sales pacing tool.

Compact state should show:
- session state;
- credits;
- approximate paid time left;
- used time;
- warning threshold;
- top-up action.

Expanded/side context should support:
- top-up link;
- insert top-up script;
- no-push state;
- package selection;
- deep reading package;
- audited compensation request.

Do not expose refund, manual credit adjustment, or forced billing actions to normal expert/agent roles.
Normal agents should use `Request compensation` with a reason and audit trail. Direct coupon issuance needs a role/limit rule.

## Focus mode

Focus mode is a visual attention state, not a queue segment.

It can be enabled manually or automatically for:
- `Paid active`;
- `High LTV`;
- `Refund risk`;
- `Complaint risk`;
- `Long wait`;
- `Top-up needed`.

When focus mode is active:
- keep the current paid/risk conversation visually prominent;
- suppress non-critical alerts;
- keep paid, SLA, risk, and supervisor alerts visible;
- surface only relevant actions: `Offer`, `No push`, `Request compensation`, `Handoff`.

Focus mode must not hide other paid/SLA-critical dialogs from the queue.

## Interactive prototype behavior

The standalone mockup now imitates the agent tool instead of staying static.

Clickable actions include:
- queue selection and priority sorting;
- working area tabs that visibly filter the queue: `All`, `Active chats`, `Pings`;
- right-panel tabs and accordions;
- `Offer` menu with composer draft insertion;
- `Request compensation` modal with audited request result;
- `Handoff` modal with escalation flag result;
- `Follow-up` scheduling modal;
- `Focus mode` on/off;
- hot/no-push/resolved/internal-note state changes;
- action log and toast feedback.

This is demo behavior only. Yii2 integration should replace the local DOM mutations with server-backed state updates.

Header simplification rule:
- show only immediate operational signals in the conversation header;
- keep language as one compact badge near the visible expert/client identity;
- keep internal agent identity, translation details, and audit context in the right panel;
- do not duplicate pin/favorite/language/focus states in multiple header locations.

## Account menu

Account menu should be a shift/work control, not a mini public-site navigation.

Keep:
- availability status;
- exclusive expert profiles assigned to the agent;
- working hours;
- personal analytics;
- compact/sound/ping/low-balance alerts;
- report problem;
- help;
- sign out.

Remove public-profile navigation from this menu. Public expert profile editing should open inside admin.

## Locked decisions

1. Agent shift start uses `Online`. Assigned expert profiles are exclusive to that agent and are not assigned to other agents.
2. Pings are a switchable workload area and can be revisited at any moment.
3. Supervisor flags have two classes: `indicator` flags only highlight the queue; `routing-impact` flags can affect redistribution.
4. Competitor-style long segment lists are not used as top navigation for launch.
5. Upsell actions are grouped under `Offer`; compensation is audited and role-gated.
6. In the agent view, `Mine` is not shown as a visible chip/filter because every visible item is already inside the agent's assigned workspace.
7. Ping commercial signal is `Has credits`, not `Has balance`.
8. Shift control is reduced to `On shift / Paused / Off shift`; the account dropdown no longer duplicates status buttons.

## Open product questions

1. Should pings expire globally by time, by expert availability, or by first outreach attempt?
2. Which event is the first business conversion for ping analytics: first expert outreach, client reply, session start, or first paid minute?

## Integration notes

- Queue cards now support `data-workload-type="active_chat"` and `data-workload-type="ping"`.
- Queue cards now support `data-priority` for demo urgency sorting.
- Demo filtering was updated for UI labels `All / Active chats / Pings`; backend preset keys remain `all_workload`, `active_chats`, and `pings`.
- Demo business actions are bound through `data-prototype-action` and `data-offer-action`.
- Header was reduced to the minimum launch signals to avoid duplicate flags and indicator noise.
- The mockup remains a standalone handoff artifact. It is not yet Yii2-integrated runtime code.
- Public migration map: `CHAT_WORKSPACE_V2_MIGRATION_GUIDE.md`.
- Public Pages package target: `web/admin-chat-workspace-v2/`.
