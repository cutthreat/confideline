# Confideline Admin Chat V2: Migration Guide

Date: 2026-05-12
Target mockup: `H:\GPT-Codex\Confideline\Chat\admin-chat-workspace-v2\chat-workspace-v2.html`
Assets:
- `assets/agent_chat_custom.css`
- `assets/agent_chat_custom.js`
- `assets/global_custom.css`
- `assets/global_custom.js`

## Purpose

This file is the integration map for moving the final admin chat mockup into another Codex session or Yii2 integration branch.

The mockup is split into independent working areas. Each area below describes:
- what the area is for;
- what should be visible;
- what data it needs;
- which user actions it must support;
- what should not be moved into this area.

## Product Rules

1. The client always sees the expert profile, not the internal agent/operator.
2. The agent works only with assigned expert profiles. For the agent role, `Mine` is not a useful visible flag because every visible item is already inside the agent's assigned workspace.
3. `Chats / Pings` are workload modes, not CRM segments.
4. Paid and low-balance dialogs outrank ordinary waiting dialogs.
5. Pings are pre-chat leads. They do not have reply SLA until the client answers or a chat starts.
6. Supervisor flags are limited to operational control signals: `Hot`, `Refund risk`, `Do not push`, `Handoff`.
7. Compensation is a request with audit trail, not a direct refund/credit action for a normal agent.

## Area 1: Shift Control

Selector:
- topbar: `#statusDropdown`
- account menu: `.admin-user-menu`
- JS: `assets/global_custom.js`

What it does:
- controls whether the agent receives workload;
- shows current shift state in the topbar;
- keeps the account menu focused on work/settings, not public-site navigation.

Visible controls:
- `On shift`: accepts assigned workload;
- `Paused`: stops new workload, keeps current paid/risk dialogs visible;
- `Off shift`: ends the shift;
- `Pause reason`: records why new workload is paused.

Data needed:
- `agent_id`;
- `shift_status`: `on_shift | paused | off_shift`;
- optional `pause_reason`;
- assigned expert profile count.

Server actions:
- `POST /admin/operator/shift/status`
- `POST /admin/operator/shift/pause-reason`

Do not put here:
- public expert profile preview links;
- moderator controls;
- per-dialog flags;
- a four-button status grid inside the account dropdown.

## Area 2: Left Workload Modes

Selector:
- `.queue-tabs-row`
- `.js-queue-tab`
- JS: `bindQueueTabs()`, `applyDemoQueueState()`

Visible modes:
- `Chats`: all created active dialogs between a client and the expert identity the client sees;
- `Pings`: potential clients who viewed/interacted with that expert profile before starting a chat.

Data needed on queue cards:
- `data-workload-type="active_chat | ping"`;
- `data-priority`;
- `data-conversation-id`;
- sender/client and recipient/expert ids, names, avatars.

Behavior:
- only one mode active at a time;
- mode click clears search, expert selector, and quick filters;
- list is sorted by `data-priority`;
- counters reflect visible business entities, not unread messages only.

Do not add as top tabs:
- `Paid`, `Trial`, `Overdue`, `Escalated`, `Archived`, `Mine`.
These are filters, states, or supervisor views, not launch workspace modes.

## Area 3: Search, Expert Selector, Quick Filters

Selectors:
- search: `#conversationsSearch`
- expert selector: `#queueUserSelect`
- filter button/menu: `.queue-search-filters`

Recommended filter groups:
- `Chats / Status`: `Reply`, `SLA`;
- `Chats / Billing`: `Live`, `PP`, `Sell`;
- `Pings / Status`: `NEW`;
- `Pings / Lead quality`: `Credits`, `Intent`;
- `Shared`: `Favorite`.
- `Chats only`: `Archive`.

Business logic:
- `Chats` filters help the agent choose the next real dialogue by KPI: reply obligation, SLA breach, active paid session, unfinished payment, or sell moment.
- `Pings` filters help the agent warm up leads when the chat queue is empty or there is spare capacity. These leads already showed interest in a specific expert profile, so outreach is not random cold traffic.

Behavior:
- search, expert selector, quick filters, and workload mode are independent zones;
- activating one zone clears the others;
- quick filters are multi-select inside their own zone only.

Do not include:
- `Mine` for the agent role;
- `Has notes`, `Attachments`, `Favorite` as queue chips;
- `Expert online` unless routing actually depends on current expert availability.

## Area 4: Active Chat Queue Card

Selector:
- `.conv-item[data-workload-type="active_chat"]`

Card should show:
- client -> expert identity;
- last activity time;
- one-line work preview;
- unread/action count;
- up to 3 visible operational chips.

Good visible chips:
- `Reply`;
- `SLA`;
- `Live`;
- `PP`;
- `Sell`.

Do not show:
- `Mine`;
- `Has notes`;
- `Attachments`;
- internal agent name.

Sort priority:
1. Live;
2. SLA;
3. Reply;
4. PP;
5. Sell;
6. NEW;
7. follow-up;
8. waiting client.

## Area 5: Ping Queue Card

Selector:
- `.conv-item[data-workload-type="ping"]`

Card should show:
- client -> viewed expert profile;
- what triggered the ping;
- whether outreach was already sent;
- whether client has credits;
- whether this lead is high intent.

Good visible chips:
- `NEW`;
- `Intent`;
- `Credits`;
- `Template sent`;
- `Awaiting reply`.

Business meaning:
- a ping is a lead, not a conversation;
- no SLA clock starts until the client replies;
- the agent can send one soft template, invite to paid chat, mark no-push, or schedule follow-up;
- pings are useful when `Chats` is empty because they let the expert start a warm sales dialogue with people who already viewed the expert profile.

## Area 6: Conversation Header

Selector:
- `.chat-head-stage2`
- `.contact-duo`
- `.dialog-meta-labels`

Header should answer:
- who is the client;
- which expert identity the client sees;
- selected client language;
- what is urgent right now.

Visible signals:
- client avatar/name;
- arrow;
- expert avatar/name;
- compact language badge, for example `RU`;
- only immediate state that is needed to avoid interrupting the active dialogue, for example `Live` or `PP`;
- conversation reference and last activity/wait state.

Do not duplicate:
- pin/favorite icons already available in actions;
- agent identity;
- focus state when a separate focus strip is visible;
- long internal routing text.

## Area 7: Paid Session Panel

Selector:
- `#billingPanel`

Visible when:
- selected active chat has a real active paid session, marked as `Live`.

Start behavior:
- the header play button `.js-session-toggle` starts the paid session for the selected `Chats` item;
- after start, the UI adds/keeps `Live`, opens `#billingPanel`, and marks the button as active;
- the button is disabled for `Pings` because a ping must first become a real chat.

Shows:
- current expert's paid session state;
- credits;
- estimated minutes left;
- translation direction;
- next sell timing;
- one short sales timing hint.

Actions:
- `Offer`: sends sell/package/deep-reading scripts into composer;
- `No push`: sets a do-not-push control flag;
- `Request compensation`: opens audited compensation request.

Do not add:
- direct refund;
- manual credit edit;
- coupon issue without role/limit gates;
- multiple visible script buttons outside `Offer`.

## Area 8: Ping Outreach Panel

Selector:
- `#pingLeadPanel`

Visible when:
- selected queue item has `data-workload-type="ping"`.

Shows:
- ping lead state;
- no active chat;
- intent/credits signals;
- outreach timing hint.

Actions:
- `Send template`: inserts a soft outreach message;
- `Invite`: offer to start paid chat or package;
- `No push`;
- `Follow-up`.

Backend state changes:
- `ping_outreach_prepared`;
- `ping_template_sent`;
- `ping_followup_scheduled`;
- `ping_no_push`.

## Area 9: Focus Strip

Selector:
- `#focusModeStrip`

Purpose:
- visual attention mode for current paid/risk dialog;
- suppresses non-critical alerts mentally and visually;
- keeps paid, SLA, risk and supervisor signals visible.

Visible when:
- selected active chat is paid/low-balance/risk/hot.

Do not treat focus as:
- a queue tab;
- a permanent dialog flag;
- a replacement for paid/SLA sorting.

## Area 10: Header Actions And More Menu

Selectors:
- `.chat-actions`
- `.chat-more-menu`

Primary buttons:
- search in conversation;
- paid session start/control;
- more actions.

More menu:
- `Mark hot client`;
- `Pin dialog`;
- `Request handoff`;
- jump/font controls;
- `Add control flag`;
- `Mark do not push`.

Do not overload:
- keep compensation and sell actions in the paid panel;
- keep ping outreach in the ping panel;
- keep full moderator tooling outside this launch chat.

## Area 11: Right Context Panel

Selector:
- right pane tabs and context sections.

Right panel principle:
- this is the detail layer, not the KPI queue;
- do not duplicate `Live` if it is already visible in the center header or paid-session panel;
- keep slow-reading details here, including birth data, notes, audit, billing history, AI help, and quality checks.

Tab logic:
- `Client`: full client passport. Shows identity, timezone, language, credits, profile expert, real operator, date of birth and birth time/timezone. Birth time is important for esoteric readings, but it is not a left-queue KPI unless missing data blocks the current answer.
- `AI`: summary and draft help. Useful when the agent needs a quick recap or wording support; it should not replace the actual dialogue history.
- `Pay`: billing context, LTV, credits, payment events, used time, sell timing, and allowed paid actions. Useful for sales and compensation decisions; not all of it belongs in the central paid panel.
- `Notes`: private team memory about the client. Useful for continuity between shifts and experts.
- `Follow`: planned next contact. Useful when the client pauses or does not buy now.
- `Prep`: session preparation details such as missing birth time, timezone, previous templates, and internal readiness notes.
- `Quality`: guardrails and checks. `QC watch` means quality control attention is needed, for example a paying client waited too long or the answer has policy/sales risk.

Safety rules:
- shown as `Safety rules`;
- used while drafting an answer;
- prevents guarantees, medical/legal/financial promises, and external-link leakage.

Rules:
- queue/header show only immediate action signals;
- right panel shows full audit/control context.

## Area 12: Modals

Current modals:
- `#modalMakeBusy`: pause reason;
- `#modalCompensationRequest`: audited compensation request;
- `#modalHandoffDialog`: request handoff;
- `#modalFollowUpPlan`: schedule follow-up;
- `#modalControlFlags`: control flags;
- `#modalReportProblem`: support report.

Integration rule:
- modal submit should create a server event and then update the card/header/right panel from the API response.
- the mockup currently mutates DOM locally only for demonstration.

## Area 13: JS Integration Points

Queue:
- `getQueueStatePayload(root, changedBy)`
- `requestQueueStateUpdate(payload)`
- `applyDemoQueueState(root, payload)`

Conversation switch:
- `bindConversationSwitcher()`
- `requestConversationSwitch(payload)`
- `applyDemoConversationSwitch(payload)`

Prototype actions:
- `data-prototype-action`
- `data-offer-action`

Server endpoints to wire:
- `POST /admin/messages/conversations/filter`
- `GET /admin/messages/conversations/{conversation_id}`
- `POST /admin/messages/{conversation_id}/offer`
- `POST /admin/messages/{conversation_id}/flags`
- `POST /admin/messages/{conversation_id}/follow-up`
- `POST /admin/messages/{conversation_id}/handoff`
- `POST /admin/messages/{conversation_id}/compensation-request`
- `POST /admin/pings/{ping_id}/outreach`

## Area 14: CSS Integration Notes

Keep these visual rules:
- queue cards are dense, not marketing cards;
- chips are limited and action-oriented;
- pings have a subtle left accent and `PING` prefix;
- paid panel and ping panel share layout but use different visual tone;
- no nested decorative cards inside the main chat surface.

Key classes:
- `.conv-item`
- `.conv-pill`
- `.dialog-chip`
- `.billing-panel-v2`
- `.ping-lead-panel`
- `.focus-mode-strip`
- `.queue-search-filters`

## Launch Cut

For launch, port these first:
1. workload modes and queue filtering;
2. active chat and ping card contracts;
3. conversation header cleanup;
4. paid session panel;
5. ping outreach panel;
6. shift control;
7. compensation/handoff/follow-up modals.

Defer:
- full moderator workspace;
- direct refund/coupon issue;
- advanced saved segments;
- favorite/notes/attachments as visible queue chips;
- public-site navigation from the account menu.
