# Admin Agent Chat Handoff

## Scope
This package replaces admin messages `GridView` with a chat shell page and keeps legacy mode available.
The shell is reachable from both `/admin/message/index` and `/admin/message/chat`.
An additional visual handoff screen for the staged expert CRM layout is reachable via `/admin/message/expert-preview`.
The preview is also linked from the `Messages` sidebar node and from the chat shell top bar.

## File Map
- `application/modules/admin/controllers/MessageController.php`
  - Added endpoints: `conversations`, `messages`, `send`
  - Added legacy fallback: `index?legacy=1`
- `application/modules/admin/services/MessageShellService.php`
  - Conversation/message query and formatting layer
- `application/modules/admin/views/message/index.php`
  - Chat shell markup (`#admin-agent-chat`)
- `application/modules/admin/views/message/expert-preview.php`
  - Visual handoff screen for the staged expert CRM/admin layout
- `application/modules/admin/views/message/legacy.php`
  - Old table-based page
- `application/modules/admin/assets/AdminAgentChatAsset.php`
  - Page-level asset bundle
- `application/modules/admin/static/css/admin-agent-chat.css`
  - Scoped styles for chat shell
- `application/modules/admin/static/js/admin-agent-chat.js`
  - UI logic (jQuery, no new libraries)

## Runtime Requirements
- Yii2 admin module (existing project structure)
- Existing `AdminAsset` stack (Bootstrap 3 / AdminLTE / jQuery)
- Existing app components:
  - `messageManager`
  - `userManager`
  - `settings` (optional; service has safe fallback if unavailable)

## Endpoints Contract
All routes are under admin message controller.

1. `GET message/conversations`
- Query params:
  - `query` string (optional)
  - `limit` int (optional)
- Response:
  - `success` bool
  - `conversations` array

2. `GET message/messages`
- Query params:
  - `userAId` int
  - `userBId` int
  - `limit` int (optional)
- Response:
  - `success` bool
  - `conversation` object|null
  - `messages` array

3. `POST message/send`
- Body params:
  - `fromUserId` int
  - `toUserId` int
  - `text` string
- Response on success:
  - `success` true
  - `message` object
  - `conversation` object
- Response on validation error:
  - `success` false
  - `message` string
  - status `422`

## Behavior Notes
- Legacy page remains available:
  - `/<ADMIN_PREFIX>/message/index?legacy=1`
- Search applies on server side.
- Polling refresh interval default: `15000ms` (config in view).
- Styles are scoped under `#admin-agent-chat` to avoid global CSS collision.

## Integration Steps
1. Copy all files from **File Map** as-is.
2. Ensure admin message route points to updated `MessageController`.
3. Open `/<ADMIN_PREFIX>/message/index` or `/<ADMIN_PREFIX>/message/chat`.
4. Open `/<ADMIN_PREFIX>/message/expert-preview` for the programmer-facing CRM layout mock.
5. Validate legacy mode via `?legacy=1`.

## Smoke Checklist
1. Conversations list loads and search works.
2. Clicking conversation loads messages.
3. Sender switcher works and send action creates message.
4. Polling updates conversation list and active thread.
5. Responsive behavior:
   - mobile `<=480`
   - tablet `481-991`
   - desktop `>=992`
6. No layout break in admin header/sidebar.

## Safe Rollback
If rollback is required:
1. Replace `actionIndex()` implementation with legacy render only.
2. Remove `AdminAgentChatAsset` registration from `views/message/index.php`.
3. Keep `legacy.php` as active message page.
