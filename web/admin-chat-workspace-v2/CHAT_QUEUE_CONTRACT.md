# Admin Agent Chat: Queue And Conversation List Contract

This file documents the queue/list contract inside `#admin-agent-chat`.
Update this document whenever queue cards, queue filters, queue search, or conversation switching logic changes.

## Scope

- Main HTML: `chat-stage1.html`
- Chat JS: `assets/agent_chat_custom.js`
- Chat CSS: `assets/agent_chat_custom.css`
- Applies only to the left conversation queue/list inside `#admin-agent-chat`.

## Conversation Card Data Contract

Each queue item should be rendered as `.conv-item` or `.list-group-item` inside `.conv-list`.

Required attributes:

| Attribute | Example | Meaning |
| --- | --- | --- |
| `data-workload-type` | `active_chat` / `ping` | Queue entity type. `active_chat` is a real dialog; `ping` is a pre-chat interest signal created from expert profile views. |
| `data-conversation-id` | `c2` | Unique conversation id. Used for switching and API calls. |
| `data-sender-user-id` | `791` | Front/client user id. |
| `data-recipient-user-id` | `792` | Backend/operator or paired user id. |
| `data-sender-name` | `Alla` | Client display name. |
| `data-recipient-name` | `Orion Esposito` | Paired/backend display name. |
| `data-sender-avatar` | URL | Client avatar. |
| `data-recipient-avatar` | URL | Paired/backend avatar. |
| `data-display-contact-name` | `Alla` | Name shown in the queue row. Usually the client/front user. |

Current visual rule:

- Queue row shows two overlapped avatars.
- Queue row shows only `data-display-contact-name`.
- Online indicator is shown next to the visible name, not on top of avatars.
- Technical sender/recipient data must stay in `data-*` even if visually hidden.

## Queue Controls

Current controls that affect the queue:

| Control | Selector | Behavior |
| --- | --- | --- |
| Text search | `#conversationsSearch` | Debounced by 1000ms. No dropdown results. Queue cards are filtered/sorted in the list. |
| Search button | `#btnSearchConversations` | Runs queue update immediately. |
| Queue quick presets | `.js-queue-tab` | Standalone quick presets. Selecting one preset clears text search, user select, and quick filter menu state. |
| User select | `#queueUserSelect` inside `.queue-user-select` | Searchable selectbox. Selected value is stored in `data-selected-user-id`. |
| User select clear | `.js-queue-user-clear` | Clears input, active option, and selected user id. |
| Quick filters | `.queue-search-filters input[type="checkbox"]` | Multi-select filters grouped by `data-group`. |
| Quick filter apply/reset | `.js-qf-apply`, `.js-qf-reset` | Apply/reset filter state and run queue update. |

Important rule:

- The queue has 4 independent filter zones: `quick_preset`, `search`, `user_select`, `quick_filters`.
- Using one zone clears the other three zones.
- These zones are not cumulative filters in the current UX.
- JS can still use one shared queue update pipeline, but payload must identify the active zone.

## Queue State Payload

All queue controls should use one shared payload builder:

```js
getQueueStatePayload(root, changedBy)
```

Current payload shape:

```json
{
  "changed_by": "search | quick_preset | user_select | user_select_clear | quick_filters_change | quick_filters_apply | quick_filters_reset",
  "active_filter_zone": "none | quick_preset | search | user_select | quick_filters",
  "query": "maya",
  "selected_user_id": "799",
  "quick_preset": "active_chats | pings",
  "active_filters": [
    { "group": "status", "value": "unread" },
    { "group": "status", "value": "overdue" }
  ]
}
```

Rules:

- `query` is sent only when `active_filter_zone="search"`.
- `selected_user_id` is sent only when `active_filter_zone="user_select"`.
- `quick_preset` is a single standalone preset.
- `quick_preset` is sent only when `active_filter_zone="quick_preset"`.
- `active_filters` is sent only when `active_filter_zone="quick_filters"`.
- `active_filters` can contain multiple values from multiple groups, but only inside the quick filters zone.
- Selecting any zone clears state from the other three zones.
- `changed_by` is diagnostic metadata for backend logging/debugging and can also help optimize server behavior.

## Queue API Integration Point

All queue filtering/sorting should use:

```js
requestQueueStateUpdate(payload)
```

Current real AJAX block is intentionally commented in `assets/agent_chat_custom.js`.

Planned endpoint:

```text
POST /admin/messages/conversations/filter
```

Expected request:

```json
{
  "changed_by": "quick_preset",
  "active_filter_zone": "quick_preset",
  "query": "",
  "selected_user_id": "",
  "quick_preset": "active_chats",
  "active_filters": []
}
```

Expected response options:

```json
{
  "html": "<a class=\"conv-item\" data-conversation-id=\"c2\">...</a>",
  "counters": {
    "active_chats": 3,
    "pings": 2
  }
}
```

or:

```json
{
  "conversations": [
    {
      "conversation_id": "c2",
      "sender_user_id": "791",
      "sender_name": "Alla",
      "recipient_user_id": "792",
      "recipient_name": "Orion Esposito",
      "last_message_preview": "Need a quick confirmation...",
      "last_message_time": "8:17 AM",
      "labels": ["Reply", "Live"],
      "unread_count": 3,
      "is_pinned": true,
      "is_online": true
    }
  ],
  "counters": {
    "active_chats": 3,
    "pings": 2
  }
}
```

Current demo behavior:

- `applyDemoQueueState(root, payload)` filters existing DOM cards locally.
- It reorders cards by ascending `data-priority` before applying visibility filters.
- It applies only the currently active zone from `active_filter_zone`.
- `No chats found` appears when no visible cards remain.

Priority sort order for launch:

1. Live
2. SLA
3. Reply
4. PP
5. Sell
6. NEW
7. Follow-up due
8. Waiting client

Primary UI labels stay `Chats / Pings`; priority states are sorting inputs and quick filters.

## Quick Preset Rules

`queue-tabs-row queue-tabs` is not a regular tab set and not a multi-select filter group.
It is a quick preset area.

Current v2 workload presets:

| UI label | Preset | Meaning | Demo rule |
| --- | --- | --- | --- |
| `Chats` | `active_chats` | Show all created active dialogs between client and expert. | Show `data-workload-type="active_chat"`. |
| `Pings` | `pings` | Show warm leads who viewed or interacted with the expert profile before chat start. | Show `data-workload-type="ping"`. |

Rules:

- Only one quick preset can be active at a time.
- Clicking a quick preset clears text search.
- Clicking a quick preset clears user select.
- Clicking a quick preset clears all quick filter checkboxes.
- Backend can treat `quick_preset` as a saved filter bundle.

Quick filter split:

| Workload | Filters | Business use |
| --- | --- | --- |
| `Chats` | `Reply`, `SLA`, `Live`, `PP`, `Sell`, `Favorite`, `Archive` | Work the real dialogue queue by KPI: who needs an answer, who is breaching SLA, where a paid session is live, where payment is pending, or where a sell action is needed. |
| `Pings` | `NEW`, `No contact`, `Credits`, `Intent`, `Favorite`, `Archive` | Warm up potential clients who already showed interest in the expert profile. Useful when `Chats` is empty or the agent has time to start soft sales outreach. |

## Independent Filter Zone Rules

Current active zones:

| Zone | Trigger | Clears |
| --- | --- | --- |
| `quick_preset` | Click `.js-queue-tab` | `search`, `user_select`, `quick_filters` |
| `search` | Type in `#conversationsSearch` or click search button | `quick_preset`, `user_select`, `quick_filters` |
| `user_select` | Select option in `.queue-user-select` | `quick_preset`, `search`, `quick_filters` |
| `quick_filters` | Change/apply filter menu checkboxes | `quick_preset`, `search`, `user_select` |
| `none` | Clear active zone or reset controls | All filtering state |

Implementation rule:

- Keep using `runQueueStateUpdate(root, changedBy, activeZone)` as the single launch point.
- Do not combine queue zones unless the UX contract is explicitly changed later.

## Conversation Switching Contract

Clicking a queue card runs:

```js
bindConversationSwitcher()
```

Current switch payload:

```json
{
  "conversation_id": "c2",
  "sender_user_id": "791",
  "sender_name": "Alla",
  "sender_avatar": "https://...",
  "recipient_user_id": "792",
  "recipient_name": "Orion Esposito",
  "recipient_avatar": "https://...",
  "display_contact_name": "Alla",
  "is_online": true,
  "unread_count": 3,
  "is_pinned": true,
  "workload_type": "active_chat",
  "labels": ["Reply", "Live", "SLA"],
  "last_message_preview": "Need a quick confirmation...",
  "last_message_time": "8:17 AM"
}
```

Planned endpoint:

```text
GET /admin/messages/conversations/{conversation_id}
```

Expected response can include:

- `conversation`: metadata for the header/right panel.
- `messages_html` or `messages_json`: messages for the center chat.
- `right_context_html` or `context_json`: CRM/right panel context.
- `pinned_messages`: real pinned list.
- `billing/session`: paid session state.
- `client_language` and `translation_target`: language context for templates and translation.
- `focus_mode`: active/inactive plus reason list.
- `offer_actions`: allowed upsell actions for this role/conversation.
- `compensation_policy`: whether the agent can issue or only request compensation.

If `workload_type="ping"`, the center workspace should show `#pingLeadPanel` and hide the paid session panel. A ping is a warm lead, not an active chat, so no reply SLA starts until the client replies or a real chat starts.

## Standalone Prototype Action Rules

The v2 mockup includes local-only business interaction hooks:

| Attribute | Purpose |
| --- | --- |
| `data-prototype-action` | Simulates agent actions such as no-push, handoff, follow-up, focus, compensation, resolve, and note save. |
| `data-offer-action` | Simulates offer preparation and inserts the matching draft into the composer. |

These hooks are for UX validation only. In Yii2 integration, use real endpoints and keep the same product state transitions:

- offer prepared;
- compensation requested;
- handoff created;
- follow-up scheduled;
- focus enabled/disabled;
- flag added/removed;
- dialog resolved.

Current demo behavior:

- Updates active queue card.
- Updates center header avatars, names, and online state.
- Updates visible labels in `contact-subline dialog-meta`.
- Switches between paid-session panel and ping-outreach panel by `workload_type`.
- Stores current id in `#admin-agent-chat[data-conversation-id]`.

## Agent-View Cleanup Rules

- Do not show `Mine` as a visible card chip in the agent queue. For the agent role, every visible item is already inside the assigned workspace.
- Use `Has credits`, not `Has balance`, for ping cards and filters. The business meaning is that the client can convert without an additional payment discovery step.
- Keep `Has notes`, `Attachments`, and `Favorite` out of visible queue chips; those belong in detail panels or icons only if they drive a direct action.

## JS Functions

Queue/filter functions:

- `getQueueStatePayload(root, changedBy)`
- `requestQueueStateUpdate(payload)`
- `applyDemoQueueState(root, payload)`
- `runQueueStateUpdate(root, changedBy)`
- `bindConversationSearch()`
- `bindQuickFilters()`
- `bindQueueUserSelect()`
- `bindQueueTabs()`

Conversation switch functions:

- `bindConversationSwitcher()`
- `getConversationSwitchPayload(item)`
- `requestConversationSwitch(payload)`
- `applyDemoConversationSwitch(payload)`

Rule: new queue code should use these functions instead of directly duplicating filter/search state logic.

## Change Log

| Date | Change |
| --- | --- |
| 2026-04-28 | Added queue/list data contract for conversation cards and filters. |
| 2026-04-28 | Documented unified queue-state payload and AJAX integration point. |
| 2026-04-28 | Documented conversation switching payload and expected server response. |
| 2026-04-28 | Updated queue tabs as standalone quick presets that reset other queue filters. |
| 2026-04-28 | Updated queue filters as 4 independent zones: quick preset, search, user select, quick filters. |
| 2026-05-12 | Added v2 workload split with UI labels `Chats / Pings`, backend presets `active_chats`, `pings`, and `data-workload-type` for cards. |
| 2026-05-12 | Added launch-focused BA refinement: `data-priority` urgency sorting, client language context, Focus mode, grouped `Offer` actions, and audited compensation request. |
| 2026-05-12 | Added standalone clickable prototype layer with offer drafts, compensation/handoff/follow-up modals, focus toggle, flags, action log, and toasts. |
| 2026-05-12 | Fixed tab filtering visibility and simplified duplicated header indicators. Queue tabs now hide irrelevant cards in the standalone prototype. |
| 2026-05-12 | Final launch cleanup: removed visible `Mine`, renamed ping commercial signal to `Has credits`, added ping outreach mode, and reduced shift status controls to `On shift / Paused / Off shift`. |
