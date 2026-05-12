# CRM video mechanics walkthrough

Source video: `C:\Users\user\Downloads\работа в CRM 2024-11-22 174200.mp4`

Raw transcription:

- `docs/video-analysis/crm-video-transcript-raw.md`
- `docs/video-analysis/crm-video-transcript-raw.json`
- `docs/video-analysis/crm-video-transcript-2min-chunks.md`

Note: the raw transcript was generated locally with `faster-whisper/base`. The speaker mixes Russian and Ukrainian, so exact wording is noisy in places. The notes below are a cleaned product interpretation based on transcript + visual review of the screen.

## Executive Summary

The video is not only a tour of screens. It explains an operating model for expert live chat:

1. Operator starts a CRM shift.
2. Operator controls public availability through Online/Busy.
3. Live chats are prioritized above meetings, messages, and routine work.
4. When not taking live chats, operator must explicitly mark Busy with a reason.
5. Messenger/offline messages are used for engagement, but should usually push the client toward live chat.
6. Pings are a structured warm-up/recovery workflow, not just casual reminders.
7. Scripts are central: they are configured in settings and used from the chat.
8. User profile context is mandatory for good replies: birth date, gender, zodiac, relationship status, balance, bonus balance, client status/segment, notes.
9. Sessions, transactions, reviews, and schedule are separate CRM areas that feed KPI and compensation.

For Confideline, the main migration lesson is: do not treat this as a single chat UI. Treat it as a work system: shift state, public expert availability, queue state, live session lifecycle, pings, scripts, support/reporting, analytics, and finance links.

## Timeline And Mechanics

### 00:00-02:00: Top Bar, Status, Connection, Report

What is explained:

- The top-right profile area contains identity, balance/earnings, notifications, and account controls.
- Public status matters:
  - Busy means users cannot start chat.
  - Online means users can start chat.
- Connection indicator reflects internet/system connection.
- If something is wrong, use Report.
- Example bug: operator is online, Busy is not activated, but status is shown as Busy. This should be reported.

Mechanics:

- `Report` is operational support, not just feedback.
- Status must be auditable because a wrong public status blocks revenue.
- Connection status must be visible and trusted.

Confideline mapping:

- Keep topbar `Report`, `Connected`, shift/status controls.
- Add backend report entity with auto-context: operator, status, URL, browser, connection, current chat/user if any.
- Treat public availability bugs as high-priority because they affect chat intake.

### 02:00-04:00: Make Me Busy And Time For Pings

What is explained:

- Operator presses `Make me busy` so no live chat arrives while doing other tasks.
- One reason is `Time for pings`.
- Pings are messages to users who are worth re-engaging and inviting to chat.
- The system can show users worth pinging first.
- For pings, there is a notion of a limited work block, discussed as roughly 30 minutes split into smaller queues/rounds.
- If the system list is exhausted, operator can go to `All` and filter users manually.

Mechanics:

- Busy is not just "away"; it is a reason-coded work mode.
- `Time for pings` is a valid productive Busy reason.
- Pings need priority ordering and filtering by likely value.

Confideline mapping:

- `Paused` in v2 should probably carry a reason, not only a generic pause.
- Pings need their own queue state and priority.
- Do not merge pings into ordinary unread chats.

### 04:00-06:00: Ping Filtering And Messenger To-Do

What is explained:

- When manually selecting ping targets, operator should filter by highest value/longest interaction within a chosen date period.
- Users with more meaningful previous interaction are higher priority.
- `Time for Messenger` is another Busy reason.
- There is a `Sessions -> To do` area, but it may often be empty or phased out.
- Offline messages/messenger replies should not become long free consultations.

Mechanics:

- Ping targeting is based on prior engagement and potential value.
- Messenger is for engagement and routing to live chat.
- Long detailed answers in messenger can be harmful because they replace paid live chat.

Confideline mapping:

- Add ping scoring fields:
  - last interaction;
  - total previous chat duration;
  - segment/value;
  - unread/offline message presence;
  - response likelihood.
- Add script guidance: answer enough to engage, then invite to live chat.

### 06:00-10:00: Unread Messages And Engagement Strategy

What is explained:

- At shift start, recommended first step is to set Busy for messenger and process unread messages.
- `All chats` has a filter for unread/unanswered.
- Offline messages can contain many questions.
- Operator should not answer 10-20 detailed questions one by one in messenger.
- The correct strategy is to acknowledge, give a light hook, and invite to live chat.
- If a user asks one concrete simple question, a short answer may be acceptable, but the general goal remains live-chat conversion.

Mechanics:

- Messenger is asynchronous, lower-priority, and monetization-sensitive.
- Operator should not give away full readings for free.
- Engagement should be contextual, not generic.

Confideline mapping:

- Add quick filters: `Unread`, `Unanswered`, `Needs reply`.
- Add conversation policy hints:
  - "Do not answer full reading in messenger";
  - "Invite to paid/live chat after first useful hook";
  - "Use user context to personalize."

### 10:00-14:00: Message Examples And Work Blocks

What is explained:

- Example messages show how to turn user questions into engagement and a live chat invite.
- If user gives a lot of emotional/contextual information, operator should lean into empathy and deepen the situation, then invite to live chat.
- Messenger work is time-boxed, discussed around 10-minute blocks inside a 30-minute period.
- If live chat can arrive while operator is doing messenger work, Busy status prevents accidental interruption.
- Operator can decide whether to do messages during shift or at the end, but should avoid losing track of unread messages.

Mechanics:

- There is a work rhythm:
  - shift starts;
  - set Busy for messenger/pings;
  - clear important messages;
  - return to live availability.
- Live chat has higher priority, so Busy is used to protect focused non-live tasks.

Confideline mapping:

- Add workload modes/reasons:
  - accepting live chats;
  - messenger;
  - pings;
  - break;
  - 1-on-1/active paid session;
  - shift lead/admin.
- Track time spent by reason for reporting/KPI.

### 14:00-18:00: Break, One-on-One, Shift Lead

What is explained:

- `Time for a break`: set Busy, notify in Slack/thread, take break.
- Break is around 40 minutes plus extra time for admin/AFK handling in the discussed workflow.
- `Time for 1-on-1`: use when live chat or one-on-one work takes priority over a meeting.
- If live chat conflicts with manager sync, live chat is priority; tell manager in Slack.
- For emergency situations such as air alert/blackout, complete/end chat appropriately, tell user there is a technical/safety issue, then use the right Busy reason.
- `I'm shift lead` is for administrative/coordination work and may be unavailable during trial period.

Mechanics:

- Busy reasons feed operational transparency.
- Live chat outranks internal meetings.
- Safety/technical incidents need scripts and audit.

Confideline mapping:

- Busy reason table should be configurable.
- Add policy: active paid/live chat outranks lower-priority tasks.
- Add emergency/technical templates and handoff/report flows.

### 18:00-23:59: Open Chat, User Info, Scripts, In Progress

What is explained:

- Opened chat shows:
  - client nickname;
  - favorite star;
  - real and bonus balance;
  - expert name;
  - time/session information;
  - earned amount/time;
  - green background for messenger/offline messages and other color states for live chat messages.
- Bottom area has script groups.
- Operator is strongly advised to open user info early.
- Birth date, gender, zodiac, relationship status, and notes give better context for empathy and personalization.
- User info should be filled when possible.
- In-progress live chats are shown in `In Progress`; operator should not search nervously in all chats.
- If a live chat is not visible in chat in-progress due to a bug, it can be found via `Sessions -> In Progress`.

Mechanics:

- Chat view combines conversation, user intelligence, billing context, and scripts.
- Right/context panel is not optional; it materially affects reply quality.
- Sessions are the backup source of truth for active live chats.

Confideline mapping:

- v2 right panel should include:
  - user ID;
  - birth date/time/place;
  - gender;
  - relationship status;
  - zodiac;
  - balance and bonus balance;
  - expert identity and price;
  - notes;
  - active session id.
- Active live chat should be recoverable from session state, not only queue UI.

### 24:00-28:00: Sessions, Transactions, Reviews, Rating Recovery

What is explained:

- Sessions page:
  - `To do`;
  - `In progress`;
  - `Rejected`;
  - `Completed`.
- Rejected contains missed/failed chats and is tied to reject logic.
- Completed contains conducted sessions and their information.
- Transactions show:
  - date/time;
  - user;
  - expert;
  - chat/session;
  - amount;
  - balance.
- Reviews/ratings are visible and can be improved through follow-up/pings.
- A bad rating is not fatal; operator can try to recover communication and improve the situation.
- Internal QA/leadership may review chats.

Mechanics:

- Session lifecycle and financial ledger are separate but connected.
- Reviews are operational quality signals.
- Follow-up/ping can be used for recovery.

Confideline mapping:

- Need session lifecycle model:
  - requested;
  - accepted;
  - in progress;
  - rejected;
  - completed;
  - reviewed.
- Link chat to transactions/reviews, but keep finance pages separate.
- Add review/rating context to right panel for high-risk users.

### 28:00-31:00: Bug Report / Support Widget

What is explained:

- If something is wrong, operator should report it.
- Support asks for:
  - chat/session link;
  - screenshot;
  - user ID;
  - short issue description.
- If issue is about status/availability, the report may need only screenshot/description, not necessarily chat link/user id.
- Operator can later see support response in notifications.

Mechanics:

- Reports need enough diagnostic evidence.
- Required fields depend on problem type.
- Report follow-up should be visible to operator.

Confideline mapping:

- Report modal should auto-fill:
  - current route;
  - selected conversation/session;
  - user id;
  - operator status;
  - connection state.
- Make required fields conditional by category.

### 31:00-35:00: Script Settings

What is explained:

- Scripts are configured under settings.
- Groups can be opened/closed.
- Operators can create/add variants.
- Existing group names can be customized for convenience.
- Scripts shown in settings become available in chats.
- Edits must be saved.
- Script text has a character limit around 600 characters.
- In chat, some script actions are sent immediately or inserted as prepared text depending on UI behavior/group.

Mechanics:

- Scripts are data, not static frontend labels.
- Script groups are a personal/team operational tool.
- The system should prevent overly long scripts.

Confideline mapping:

- Add entities:
  - script group;
  - script;
  - owner/scope;
  - language;
  - category;
  - enabled flag;
  - max length.
- Consider role/team presets plus operator overrides.

### 35:00-41:00: Time Zone And Working Hours

What is explained:

- Operator sets time zone.
- Operator fills working hours by week.
- Weekly tabs/date ranges are used.
- There is a copy-from-last-week action.
- Select day checkbox, then set time from/to.
- Multiple time ranges per day can be entered.
- Schedule is saved and success toast appears.
- Schedule should be filled ahead of time; there are reminders in Slack/CRM.

Mechanics:

- Working hours are planned availability, separate from actual shift.
- Schedule supports multiple intervals per day.
- Schedule is part of management/coordination.

Confideline mapping:

- Separate planned schedule from actual shift records.
- Add schedule model:
  - operator/expert profile;
  - timezone;
  - week range;
  - day intervals;
  - copy previous week;
  - save/audit.

### 41:00-48:00: Knowledge Base, Difficult Cases, Confidentiality

What is explained:

- There is a training/knowledge base with articles for complex cases.
- Difficult cases may be rare but must be handled safely.
- Operator should keep relevant articles open.
- For sensitive situations, use empathy, support, and approved scripts.
- Never abandon the user emotionally in difficult cases.
- Screenshots for internal help should avoid personal/confidential user data when possible.
- Shift lead/colleagues can advise on difficult cases.

Mechanics:

- Knowledge base and scripts are part of live operations.
- Sensitive cases need escalation/support paths.
- Confidentiality rules apply even when asking colleagues for help.

Confideline mapping:

- Add links from Help/scripts/right panel to policy articles.
- Add `Request handoff`/`Ask supervisor` for sensitive cases.
- Add masking guidance for internal screenshots.

### 48:00-53:00: Translator And Restricted Topics

What is explained:

- Experts are English-speaking in the reference workflow.
- If user writes in Ukrainian/Russian/French/German/etc., operator uses online translator.
- Operator should tell user that they can use an online translator if that is more convenient.
- If user writes in English, continue in English.
- Training video/examples show translator use, but test account may not have translator enabled.
- Some topics are restricted:
  - illegal requests;
  - gambling/lottery numbers;
  - bank/payment manipulation;
  - anything outside safe expert guidance.
- Operator should redirect toward safe, legal, empathetic framing.

Mechanics:

- Translator is a real workflow, not just a message action.
- Restricted topics require policy scripts.
- Operator should not give forbidden guarantees or illegal advice.

Confideline mapping:

- Add conversation-level translator toggle.
- Add policy/script groups for restricted topics.
- Add quality checks before sending risky replies.

### 53:00-57:51: Rude Customers, User Leaves Live Chat

What is explained:

- For rude/inappropriate users, operator can use scripts warning about respectful communication.
- If user continues inappropriate behavior, operator can stop/end the chat.
- Operator safety and comfort matter.
- If user leaves live chat after asking a question, do not chase aggressively.
- If user returns, use a script acknowledging they left and offering to continue.
- If enough time passed and user did not return, it is normal; operator did the work and should not panic.

Mechanics:

- Chat termination can be justified by behavior/safety.
- `User leaves live chat` is a script scenario.
- Follow-up is allowed, but pressure should be limited.

Confideline mapping:

- Add end-chat reasons:
  - rude/abusive client;
  - client left;
  - technical issue;
  - no response;
  - policy/safety.
- Add scripts for:
  - rude customer warning;
  - final warning;
  - user-left-live-chat follow-up.

## Core Entities Implied By The Video

- Operator
- Expert profile
- Client/user
- Shift record
- Planned working-hours schedule
- Public availability status
- Busy reason interval
- Chat/conversation
- Live session
- Ping task
- Script group
- Script
- Report/support ticket
- Transaction
- Invoice
- Review
- User note
- Client segment/status
- Training/knowledge article

## Migration Priority For Confideline

1. Split internal shift state from public expert availability.
2. Add Busy reasons with time tracking.
3. Add session lifecycle states and link them to chat queue.
4. Make pings a first-class workload with scoring and recovery rules.
5. Turn scripts into backend-managed groups and variants.
6. Expand right context panel with user/billing/segment/notes data.
7. Implement report/support entity with auto-context.
8. Add schedule/working-hours model.
9. Add translator workflow and policy scripts.
10. Link transactions/reviews/earnings as separate pages, not as chat clutter.
