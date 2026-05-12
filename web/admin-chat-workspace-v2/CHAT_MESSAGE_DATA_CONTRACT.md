# Admin Agent Chat: Message Data Contract

This file documents the `data-*` contract for messages inside `#admin-agent-chat`.
When message logic changes, update this file first, then update HTML, JS, and CSS.

## Scope

- Main HTML: `chat-stage1.html`
- Chat JS: `assets/agent_chat_custom.js`
- Chat CSS: `assets/agent_chat_custom.css`
- This document covers only markup and behavior inside `#admin-agent-chat`.

## Core Message Attributes

| Attribute | Values | Required | Meaning | UI/JS usage |
| --- | --- | --- | --- | --- |
| `data-message-id` | string/id | yes for real messages | Unique message id. Used for anchors, reply, pinned messages, and jump navigation. | `ensureMessageAnchor`, pinned panel, reply quote navigation |
| `data-message-author` | `operator`, `client`, `system` | yes | Message author. This is the source of truth. Do not use visual left/right side as business logic. | Reply, translate, edit/delete, pinned sender, system handling |
| `data-message-viewed-by-client` | `true`, `false` | operator messages | Whether the client has already viewed an operator message. | Edit/delete visibility and eligibility |
| `data-message-has-text` | `true`, `false` | yes | Whether the message has a text part that can be copied or translated. | Copy/translate/non-text badges |
| `data-message-lang` | `ru`, `en`, `auto`, etc. | text messages | Original language of the visible message text. | Translation label and API payload |
| `data-message-kind` | legacy string | optional/legacy | Old message type. Kept only as a compatibility fallback. | `getMessageKind()` fallback only |

## Attachment Attributes

| Attribute | Values | Required | Meaning | Notes |
| --- | --- | --- | --- | --- |
| `data-attachment-kind` | `none`, `file`, `image`, `audio`, `voice`, `mix` | yes | Attachment type for the message. | Do not use `files` or `images`; use `data-attachment-count`. |
| `data-attachment-count` | number string, e.g. `0`, `1`, `5`, `10` | yes | Number of attachments. | For `mix`, this is the total count across attachment types. |

Current rules:

- `audio` and `voice` are non-text attachment types by default.
- If `data-message-has-text="false"`, copy and translate are not available.
- If a message has both text and attachments, use `data-message-has-text="true"` and describe attachments via `data-attachment-kind`.
- Mixed attachments use `data-attachment-kind="mix"` plus numeric `data-attachment-count`.

## System Message Attributes

| Attribute | Values | Required | Meaning |
| --- | --- | --- | --- |
| `data-message-author` | `system` | yes | System message, not operator/client. |
| `data-system-kind` | `payment`, `hint`, `typing`, future values | yes for system | System event subtype. |

Current rules:

- System messages are not regular bubbles.
- System messages should not receive regular actions such as reply, copy, or translate unless explicitly designed.

## Delivery State Attributes

| Attribute | Values | Required | Meaning |
| --- | --- | --- | --- |
| `data-send-state` | `sending`, `failed`, `retrying`, `sent` | operator pending/demo messages | Current delivery state. |

Current rules:

- Delivery states belong to operator messages.
- `failed` can show Retry.
- `sending`, `failed`, and `retrying` should not show translate.
- Read checkmarks are replaced or augmented by delivery state when needed.

## Moderation And Censorship Attributes

| Attribute | Values | Required | Meaning |
| --- | --- | --- | --- |
| `data-message-moderated` | `true`, `false`/missing | moderated messages | Server moderation touched this message. |
| `data-message-censored` | `partial`, `full`, `none`/missing | moderated messages | How much of the message was hidden. |

Current rules:

- The server should send only censored/safe text to the frontend.
- The frontend must never receive original forbidden fragments.
- `partial`: the message remains readable; censored fragments are rendered inline as `.message-censored-fragment`.
- `full`: the message bubble shows a neutral hidden-by-moderation notice.
- `full` messages do not show reply, copy, or translate.
- Moderated messages receive a subtle `moderated` status badge in the message meta row.

Partial example:

```html
<div class="direct-chat-msg right read"
     data-message-id="123"
     data-message-author="client"
     data-message-has-text="true"
     data-message-lang="ru"
     data-attachment-kind="none"
     data-attachment-count="0"
     data-message-moderated="true"
     data-message-censored="partial">
  <span class="ng-binding">
    Text before <span class="message-censored-fragment">hidden</span> text after.
  </span>
</div>
```

Full example:

```html
<div class="direct-chat-msg right read"
     data-message-id="124"
     data-message-author="client"
     data-message-has-text="false"
     data-attachment-kind="none"
     data-attachment-count="0"
     data-message-moderated="true"
     data-message-censored="full">
  <div class="message-censored-full">
    <span>Message hidden by server moderation</span>
  </div>
</div>
```

## Translation Contract

Current frontend setting:

```js
const CHAT_TRANSLATION_TARGET_LANG = 'en';
```

Later this should be replaced by a global site/app parameter.

Current rules:

- Translate is available only for client messages.
- Translate is hidden for system messages.
- Translate is hidden for delivery-state messages.
- Translate is hidden when `data-message-has-text="false"`.
- Translate is hidden for `audio` and `voice`.
- Translation label format: `Translated ru -> en`.
- The AJAX integration point is commented in `requestDemoTranslation()`.

Planned API payload:

```json
{
  "message_id": "123",
  "source_text": "safe visible text",
  "source_lang": "ru",
  "target_lang": "en"
}
```

## Composer State Contract

The composer has one primary intent mode. These modes are mutually exclusive:

| Mode | Meaning | Server action on Send | Required payload |
| --- | --- | --- | --- |
| `direct` | Send a new regular message to the current conversation. | `POST /admin/messages` | `conversation_id`, `text`, optional attachment data |
| `reply` | Send a new message as a reply to another message. | `POST /admin/messages` | `conversation_id`, `text`, `reply_to_message_id`, optional attachment data |
| `edit` | Save changes to an existing operator message. | `PATCH /admin/messages/{message_id}` | `message_id`, `text`, optional `previous_text` |

Current frontend representation:

- `direct`: `#conversationInputArea[data-composer-mode="direct"]`; no reply preview, no edit bar, no `data-editing-message-id` on Send.
- `reply`: `#conversationInputArea[data-composer-mode="reply"]`; `#replyPreview` is visible and stores `data-reply-to`.
- `edit`: `#conversationInputArea[data-composer-mode="edit"]`; `.composer-edit-bar` is visible and `#btnSendMessage` stores `data-editing-message-id`.

Current rules:

- `direct`, `reply`, and `edit` are mutually exclusive.
- Entering `reply` clears `edit`.
- Entering `edit` clears `reply`.
- Canceling `reply` returns to `direct`.
- Canceling `edit` returns to `direct`.
- Attachments are not a primary composer mode. They are a secondary payload state that can be combined with `direct` or `reply`.
- For now, attachments should not be combined with `edit` unless explicitly designed later.
- Voice recording is also a secondary send type, not a replacement for the primary intent mode.

Recommended future frontend attribute:
Implemented frontend attribute:

```html
<div id="conversationInputArea" data-composer-mode="direct|reply|edit"></div>
```

```js
setComposerMode('direct' | 'reply' | 'edit')
getComposerServerPayload()
sendComposerPayload()
handleComposerSend()
```

Current integration note:

- `direct`, `reply`, and `edit` are intercepted by custom JS through `handleComposerSend()`.
- Real AJAX is documented in `sendComposerPayload()` and currently commented.
- Demo mode emulates successful `direct`/`reply` sending by appending a local message to `#conversationItems`.
- Demo send supports text-only, attachment-only, and text plus attachment payloads.
- `edit` uses the optimistic edit flow and PATCH integration point documented below.

## Reply Contract

| Attribute | Values | Meaning |
| --- | --- | --- |
| `data-reply-to` | message id | Reply quote target. Clicking it navigates to the original message anchor. |

Current rules:

- Reply is available for client messages.
- Reply is not available for fully censored messages.
- Reply quote click jumps to `#message-{id}`.
- Reply mode and edit mode are mutually exclusive in the composer.

## Message Actions Menu Contract

Current rules:

- Secondary message actions live inside the compact `...` menu.
- `Copy` is available in the `...` menu when `data-message-has-text="true"` and the message is not fully censored or deleted.
- `Edit` and `Delete` are available in the same `...` menu only when `canMutateOwnMessage()` is true.
- Primary/contextual actions can stay outside the menu when they are frequent or stateful, for example Reply, Pin/Unpin, and Translate.
- Fully censored messages do not show Copy, Reply, or Translate.

## Pinned Contract

Current rules:

- Pinned messages are linked by `data-message-id`.
- Pinned panel should read real pinned state from API/table later.
- Current demo can derive pinned cards from message metadata, text, and attachments.
- Pin/unpin should be optimistic in UI, then API confirms or rolls back.
- Sort order: pin time, newest first.

## Edit/Delete Contract

Current rules:

- Edit/delete only for operator messages.
- Edit/delete only while `data-message-viewed-by-client="false"`.
- Edit puts message text into the composer.
- Edit mode and reply mode are mutually exclusive in the composer.
- Saving edit is an optimistic UI action: update visible text, call PATCH, rollback to previous text on failure.
- Delete uses a UI placeholder/soft state in demo.
- No edit history UI for now.

Planned edit API payload:

```json
{
  "message_id": "123",
  "text": "updated visible text",
  "previous_text": "previous visible text"
}
```

Planned edit API endpoint:

```text
PATCH /admin/messages/{message_id}
```

## Helper Function Policy

JS helper functions in `agent_chat_custom.js` should be the only place where fallback logic lives:

- `getMessageAuthor()`
- `isMessageViewedByClient()`
- `getMessageKind()`
- `getAttachmentKind()`
- `getAttachmentCount()`
- `getSystemKind()`
- `getMessageCensoredState()`
- `getMessageSendState()`
- `getMessageLang()`
- `messageHasTextPart()`

Rule: new code should call helpers instead of reading `dataset` directly, unless it is writing a new state.

## Change Log

| Date | Change |
| --- | --- |
| 2026-04-27 | Added explicit `data-message-author`; stopped treating visual left/right as source of truth. |
| 2026-04-27 | Added `data-message-viewed-by-client` for edit/delete eligibility. |
| 2026-04-27 | Added attachment model: `data-attachment-kind` plus `data-attachment-count`; simplified `file/files` and `image/images`. |
| 2026-04-27 | Added translation language model: `data-message-lang` plus `CHAT_TRANSLATION_TARGET_LANG`. |
| 2026-04-27 | Added server moderation model: `data-message-moderated` plus `data-message-censored`. |
| 2026-04-27 | Moved Copy into the compact message `...` menu; Edit/Delete remain conditional operator-only menu items. |
| 2026-04-27 | Documented optimistic edit save flow and commented PATCH integration point. |
| 2026-04-27 | Added composer state contract: `direct`, `reply`, and `edit` as mutually exclusive primary modes. |
| 2026-04-28 | Implemented `data-composer-mode` and documented shared composer payload builder for direct/reply/edit. |
| 2026-04-28 | Added `handleComposerSend()` wrapper with commented direct/reply AJAX integration point. |
| 2026-04-28 | Replaced legacy Angular send dependency for demo direct/reply with custom local message append flow. |
| 2026-04-28 | Updated demo send readiness so selected attachments can be sent even without text. |
