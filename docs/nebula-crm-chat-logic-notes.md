# Nebula CRM chat logic notes

Source:
- Google Sheet: `nebula-chat-logic.xlsx`
- Extracted text copy: `C:\GPT-local\nebula-chat-logic-extracted.md`
- Local Confideline mockup: `C:\GPT-local\confideline\web\admin-chat-workspace-v2\`
- CRM video raw transcript: `docs/video-analysis/crm-video-transcript-raw.md`
- CRM video cleaned walkthrough: `docs/video-analysis/crm-video-mechanics-walkthrough.md`
- Full personal cabinet work map: `docs/nebula-personal-cabinet-work-map.md`

Purpose: describe Nebula-style personal cabinet / CRM chat mechanics and map them onto Confideline admin chat workspace v2.

## 1. Core Product Model

Nebula separates the product into two visible sides:

1. Client side: the client chooses an expert, starts a paid live chat, receives offers/top-ups, and later sees blurred expert replies or paid unlock prompts.
2. Operator/agent side: the agent works inside CRM, controls shift/status, accepts live chats, sends pings, uses scripts, tracks sessions, and is evaluated by timing/KPI metrics.

Key distinction for Confideline:

- The client should see the expert profile.
- The internal worker is the operator/agent.
- A single operator can work through assigned expert profiles, but the public identity remains the expert.

This matches the current Confideline v2 rule: client-facing communication is from expert identity, while agent identity belongs in audit/context panels.

## 2. Client Flow

### 2.1 Expert Discovery

Client sees expert cards with:

- category / specialization;
- nickname or pseudonym;
- rating and reviews;
- online/busy/offline status;
- expertise tags;
- years of practice;
- number of readings/consultations;
- short "about me";
- price per minute in credits;
- start button.

Mechanic:

- New users can receive free minutes or a starter free experience.
- The expert card is both discovery and conversion surface.
- The important conversion trigger is whether the expert can be started now.

Confideline implication:

- Expert profile availability should be backed by operator shift/status rules.
- Public `Start chat` availability must derive from internal operator state and expert assignment.

### 2.2 Expert Profile Page

Profile page expands the teaser card:

- expert name/nickname, country, rating, favorite action;
- specialization;
- online/busy/offline status;
- expertise tags;
- price;
- start chat button;
- reviews;
- "about me";
- experience and consultation count;
- FAQ.

Mechanic:

- If expert is online and not busy, client can start chat.
- If expert is busy, client is routed into a fallback offer/modal to choose another expert or send a message.

Confideline implication:

- Public status needs three-state semantics: `online`, `busy`, `offline`.
- `busy` does not mean unavailable for all contact; it blocks paid live chat start, while asynchronous messages/pings can still exist.

### 2.3 Chat Start

If the expert is busy:

- client sees a modal suggesting another expert.

If the expert is available:

- client sees a connection/progress screen;
- messaging says connection takes roughly 15-20 seconds;
- client is told they are not charged during connection;
- client is told the expert will focus on them after connection.

Mechanic:

- Connection screen manages wait anxiety and sets expectations.
- Accepted live chat becomes a paid 1-on-1 session.

Confideline implication:

- Admin queue should track incoming live chat requests separately from active live dialogs.
- Accept/reject timing matters; Nebula expects acceptance within 15 seconds.

### 2.4 Active Paid Chat

Client active chat shows:

- expert photo/name/status;
- elapsed chat timer;
- user question;
- notice to stay on the page;
- conversation window;
- payment/top-up prompts when paid/free time ends.

Mechanic:

- The timer and payment state are central to the live chat.
- The client can be interrupted by balance/top-up offers.
- Packages include examples like 120 credits for $9.99, 300+50 for $24.99, 1200+600 for $99.99.

Confideline implication:

- The admin paid-session panel should show live session state, credits, time left, used time, warning threshold, and offer actions.
- Operators should prepare top-up scripts but should not directly alter billing.

### 2.5 Paid Unlock / Blurred Replies

Client may receive expert notifications/messages after viewing experts:

- notifications come from experts viewed earlier;
- expert answers can be blurred;
- to view an answer, client must buy credits, e.g. 40 credits per answer.

Mechanic:

- This is a reactivation/monetization mechanic.
- It is related to pings/outreach: expert-originated messages create intent to return and pay.

Confideline implication:

- Pings should be treated as pre-chat leads, not ordinary chat messages.
- Ping/outreach state should track whether template was sent, whether user replied, whether paid conversion happened.

## 3. Operator Workspace

### 3.1 Report Button

Nebula logic:

- Report is available always, whether in shift or not.
- Opens bug/problem form.
- Submit creates an internal report/log entry.
- Failure should show error and allow retry.

Expected fields:

- category: Chat / Payment / UI / System / Other;
- priority: Low / Medium / High / Critical;
- title;
- description;
- optional file/screenshot.

Auto-attached context:

- operator id;
- role;
- page URL;
- datetime;
- browser/OS/user-agent;
- current status: offline / online / busy;
- connection state;
- current conversation/user ids when available.

Confideline v2 status:

- Mockup has `#modalReportProblem`.
- Needs backend entity: `Reports`.
- Admin should include report list, filters, report detail, status, export.

### 3.2 Connected Indicator

Nebula logic:

- Always visible.
- Three states: green, yellow, red.
- Measures API health and realtime chat health.
- Suggested metrics: RTT, request error percent, realtime reconnect rate over last 30-60 seconds.
- If red persists more than 10 seconds, operator is automatically moved to Busy.
- No automatic return to Online; operator manually removes Busy.

Confideline v2 status:

- Mockup has connected badge in topbar.
- Should be upgraded from static indicator into a status engine.

Backend/admin settings:

- thresholds for green/yellow/red;
- timeout before auto-Busy;
- banner/toast texts;
- toggle for auto-Busy behavior.

### 3.3 Shift And Availability

Nebula separates shift tracking from public availability.

Terms:

- Shift: CRM working-time tracking, not authorization.
- Online: operator is in shift and available for paid live chat.
- Busy: operator is in shift and visible, but new paid live chat cannot start.
- Offline: paid live chat cannot start.

Rules:

- `Start work` creates shift record and starts timer.
- After shift start, operator can become Online/Busy.
- "Online outside shift" is forbidden.
- `Stop work` ends shift, stops timer, sets Offline, and clears Busy.
- If server is unavailable during Stop work, do not end shift locally; show error and keep shift active.

Confideline v2 status:

- Mockup currently uses `On shift / Paused / Off shift`.
- Product mapping should be clarified:
  - `On shift` = shift active + can receive workload;
  - `Paused` = internal Busy/new workload paused;
  - `Off shift` = shift ended/offline.

Important gap:

- Nebula has public profile statuses `Online / Busy / Offline`, while the v2 migration guide has shift statuses `on_shift / paused / off_shift`.
- We need a mapping layer so internal shift and public expert availability are not collapsed incorrectly.

### 3.4 Make Me Busy

Nebula logic:

- Make me busy moves operator to Busy.
- Busy blocks starting paid consultation from client side.
- Busy still allows ordinary messages.
- Reason is optional by default.
- Reason is selected in a modal.
- Operator cannot change reason while Busy; must exit Busy and enter again with another reason.

Busy reasons:

- Time for pings: warming up clients through pings.
- Time for messenger: answering async messages/inbox without accepting 1-on-1.
- Time for a break: break.
- Time for 1-on-1: busy with another paid consultation/prep.
- I'm a shift lead: shift-lead/admin coordination.

Confideline v2 status:

- Mockup has pause/busy modal, but reasons are simplified.
- Need decide whether Confideline keeps Nebula-style reasons or v2 simplified `Current paid dialogs only / Break / Supervisor review`.

## 4. Chat Queue And Work Modes

Nebula manager-side chat filters:

- all chats;
- unread;
- favorites;
- unanswered;
- in work.

Nebula session tabs:

- To-do;
- In progress;
- Rejected;
- Completed.

Nebula pings:

- mandatory pings / admin tasks;
- pings after rejected chat;
- 10-minute window after reject for ping to count;
- after first ping is sent, button changes from Ping to Send;
- subsequent messages are not counted as ping;
- if 10 minutes pass, outgoing message no longer counts as ping.

Confideline v2 mapping:

- v2 already has `All / Active chats / Pings`.
- Nebula `To-do / In progress / Rejected / Completed` can be represented as states/filtering inside active chats and session history, not necessarily top workspace tabs.
- Nebula `unread / favorites / unanswered` are useful filters, but v2 intentionally avoids too many top tabs.

Recommended Confideline launch structure:

- Primary workload modes: `All`, `Active chats`, `Pings`.
- Quick filters:
  - unread/new;
  - unanswered/needs reply;
  - favorites/hot;
  - rejected/recovery ping;
  - in progress;
  - completed/history only outside live workspace.

## 5. Conversation/User Context

Nebula operator chat shows a user block with:

- nickname;
- favorite action;
- device type: web/mobile;
- user balance;
- bonus balance/minutes;
- user status;
- session time in seconds;
- price per minute;
- end chat action.

Expanded user info includes:

- user id;
- balance in dollars;
- zodiac sign;
- birth date;
- gender;
- time before/after birthday;
- relationship status;
- notes from agents;
- which expert profile was used;
- price per minute;
- client segment/badge.

Client segments:

- low: new user, first paid event or early potential;
- casual: came from mailing/pings and paid once;
- promising: came from mailing, paid, visits often;
- vip: frequent visitor and frequent payer;
- whale: consistently paying and regularly visiting.

Confideline v2 mapping:

- Header should show immediate identity and action state.
- Right context panel should carry the full user/billing/segment/audit context.
- Queue cards should show no more than 3-4 operational chips; full segment detail belongs in right panel.

## 6. Translator

Nebula logic:

- Customer support expert can have low English level and must use built-in translator.
- Translator is available on Chats and Pings.
- Expert opens chat and turns on a top-right toggle.

Confideline implication:

- Translation should be conversation-level state.
- It should affect incoming message translation, outgoing draft language, and template selection.
- It should be present in both active chat and ping outreach flows.

Current v2 status:

- Message data contract already documents translation per message.
- Need add product-level translator toggle/state and API behavior.

## 7. Scripts

Nebula script groups:

- greetings;
- technical problems;
- fraud;
- test/quiz results;
- support;
- rude clients;
- distrust;
- user leaving chat;
- dominant tone / control;
- empathy.

Rules:

- Scripts are core operator tooling.
- In support/payment topics, operator should not promise refunds or discuss technical payment details.
- Operator should redirect payment/refund issues to support.

Confideline implication:

- Scripts should be organized by scenario and state.
- Payment/top-up scripts should be available in paid panel under `Offer`.
- Support scripts should avoid refund/credit promises unless role-gated.

## 8. Session Outcomes And KPI

Rejected session causes:

- user refreshed page;
- technical reject;
- late accept;
- expert refusal;
- automatic page refresh.

KPI rules from Nebula notes:

- Accept chat within 15 seconds.
- Expert reject percent should be below 5%.
- Timeout reject percent should be below 5%.
- Rejected/Accepted 15 sec+ should not exceed target.

Completed sessions table includes:

- id;
- created at;
- project;
- expert;
- type;
- status;
- client name;
- client type;
- session duration;
- charged/earned values.

Reviews table includes:

- live chat id;
- created/edited;
- client;
- client type;
- comment;
- rating.

Confideline implication:

- Need session lifecycle events and analytics:
  - request received;
  - accepted;
  - rejected with reason;
  - timed out;
  - completed;
  - reviewed.
- These events should drive queue state, KPI, earnings, and pings.

## 9. Earnings, Invoices, Transactions

Nebula has calculation pages:

- Invoices: invoice number, creation date, status, user, supply type, amount, creator, comment.
- Transactions: transaction id, customer/system, client type, expert, created time, description, amount, balance.
- Negative amount indicates refund.
- Base income can be calculated from session duration and rate.
- Bonus income depends on rules.

Confideline implication:

- Agent chat should not expose raw finance controls in the conversation UI.
- Earnings and transactions are separate admin/account pages.
- Chat context can show summary/billing state, but adjustments/refunds need role-gated workflows.

## 10. Motivation / Onboarding Mechanics

Nebula motivation sheet lists bonus events:

- completed training and first shift;
- first 30 pings sent;
- schedule entered for 4 weeks;
- maintaining whale table;
- NDA test passed;
- starter kit studied;
- promo hours worked;
- first rating 5;
- first 25+ minute session;
- 50/100 hours worked;
- monthly CSAT 4.75;
- reply time under 7 seconds.

Confideline implication:

- These are not core chat UI mechanics, but they affect what events must be tracked.
- Pings, shift time, review score, session duration, and reply time should be first-class analytics events.

## 11. Direct Mapping To Confideline Admin Chat Workspace V2

Already covered well in v2:

- `All / Active chats / Pings` workload split.
- Paid session panel.
- Ping outreach panel.
- Right context panel.
- Report modal.
- Compensation as request, not direct refund.
- Focus mode for paid/risk dialogs.
- Client sees expert, operator is internal.

Needs clarification or extension:

- Public expert availability: `Online / Busy / Offline`.
- Separate internal shift state from public expert status.
- `Start work / Stop work` timer and shift records.
- Auto-Busy on connection loss.
- Nebula-style Busy reasons.
- Incoming live-chat request acceptance SLA, especially 15-second accept target.
- Rejected-chat recovery ping with 10-minute counting window.
- Translator toggle for chats and pings.
- Script library grouped by scenario.
- Reviews/session/completed/rejected analytics.
- Earnings/invoices/transactions outside chat workspace.

Potential mismatch:

- v2 uses `Paused` as workload state, while Nebula uses `Busy` as public status that blocks paid live chat but still allows messages.
- v2 treats pings as profile-interest leads; Nebula also has rejected-chat recovery pings and mandatory/admin pings.
- v2 queue avoids `Favorites`; Nebula uses favorites to track potential whales. This can become `Hot`/right-panel flag rather than a main tab.

## 12. Suggested Next Documentation Output

The final descriptive package should likely be split into:

1. Client flow: discovery, expert profile, start chat, connection, active paid chat, top-up, blurred answers, review.
2. Operator flow: shift start/stop, availability, Busy reasons, chat request acceptance, active chat, scripts, translator, support escalation.
3. Ping flow: profile-interest ping, rejected-chat recovery ping, mandatory/admin ping, conversion tracking.
4. Data model: users, experts, operators, conversations, live sessions, pings, scripts, reports, reviews, transactions, shift records.
5. Migration map: what already exists in Confideline v2, what needs backend/API, what can wait.

## 13. Video Timeline: CRM Recording 2024-11-22

Video file:

- Source: `C:\Users\user\Downloads\работа в CRM 2024-11-22 174200.mp4`
- Working copy: `C:\GPT-local\crm-work-video-complete.mp4`
- Duration: about 57:51
- Keyframes: `C:\GPT-local\crm-video-frames\keyframes\`
- Raw transcript: `C:\GPT-local\confideline\docs\video-analysis\crm-video-transcript-raw.md`
- Cleaned mechanics walkthrough: `C:\GPT-local\confideline\docs\video-analysis\crm-video-mechanics-walkthrough.md`

### 00:00-10:59: Main Chats Workspace

Visible structure:

- Product label: `Astro CRM`.
- Left navigation:
  - Workflow: `Chats`, `Sessions`, `Pings`;
  - Salary: `Invoices`, `Transactions`, `Reviews`;
  - User management: `Activity`.
- Top bar:
  - `Report`;
  - `Connected`;
  - public status: `Online` / later `Busy`;
  - `Make me busy` toggle;
  - `Stop work`;
  - operator profile (`Test account`, role `Astrologer`);
  - current balance/earnings `$0.00`;
  - notifications bell;
  - profile dropdown.
- Chat workspace:
  - tabs `All chats` and `In progress`;
  - search by name;
  - filter icon;
  - list of chat cards with client name, date, preview, expert name;
  - color markers on cards, likely client type/status;
  - empty-state center when no chat is opened.

Mechanic:

- The chat list is a queue/inbox, not only an active live-session board.
- Operator can be in shift (`Stop work` visible) while public status is Busy.
- `Make me busy` is a fast availability control independent from opening a specific chat.

Confideline mapping:

- Keep topbar report/connection/shift controls.
- Add clear mapping between CRM shift and public expert availability.
- Left queue in v2 should keep card metadata: client, expert identity, preview, status markers, date, and current state.

### 11:00-23:59: Opened Chat And User Context

Visible structure:

- Selected chat opens in the center.
- Header shows client name with favorite star.
- Near the client name: balance/bonus-like value, for example `$0.55 ($2.02 in bonus...)`.
- Expert identity in the conversation header: `Rose-Marry67`.
- Price shown as `$0.60 / min`.
- Message timeline with a user/operator message and date separator.
- Composer:
  - input placeholder `Add your message`;
  - `Send` button.
- Bottom script shortcuts:
  - `Greetings`;
  - `Tech issues`;
  - `Fraud`;
  - `Test/Quiz results`;
  - `Support`;
  - `Rude customers`;
  - `Distrust`;
  - `User leaves live chat`;
  - `Ascendant`;
  - `Empathy`;
  - `New group`.
- Right user panel:
  - client username;
  - zodiac sign;
  - user ID;
  - user balance;
  - birth date;
  - time of birth/place of birth fields;
  - gender;
  - relationship status;
  - notes count.

Mechanic:

- Operator writes from the expert profile context.
- Client balance and price per minute are visible inside the chat because they influence scripts and upsell timing.
- Favorite/star is a CRM marker for important clients, not necessarily a main queue segment.
- Right panel stores deeper context and notes; header stays compact.

Confideline mapping:

- v2 header/right-panel structure is aligned with this.
- Keep billing and identity context near the conversation but avoid crowding the header.
- Put full birth/zodiac/relationship/notes data into the right context panel.

### 24:00-28:59: Sessions, Transactions, Reviews

Sessions page:

- Tabs:
  - `To do`;
  - `In progress`;
  - `Rejected`;
  - `Completed`.
- Table columns include:
  - ID;
  - Created;
  - Project;
  - Expert;
  - Type;
  - Status;
  - Client name;
  - Client type;
  - Session;
  - Total.

Transactions page:

- Table columns include:
  - Number;
  - Customer;
  - Client type;
  - Expert;
  - Created;
  - Description;
  - Amount;
  - Balance.
- Rows show online session transaction descriptions and amounts.
- System and client transactions appear in the same ledger.

Reviews page:

- Filter by rating.
- Table columns include:
  - Live chat ID;
  - Created;
  - Edited;
  - Client;
  - Client type;
  - Comment;
  - Rating.

Mechanic:

- Chat is only one part of the CRM.
- Sessions are the operational lifecycle.
- Transactions are the financial ledger.
- Reviews feed quality/KPI.

Confideline mapping:

- Do not overload chat workspace with full financial/admin tables.
- Chat workspace should link to session/transaction/review context, while full tables belong in separate admin pages.
- Session state events must be preserved in backend: request, accepted, rejected, timed out, completed, reviewed.

### 29:00-31:59: Support/Bug Report Chat Widget

Visible structure:

- Intercom-like support widget opens on the right.
- Bot asks: `How can we help?`
- User chooses: `I want to submit a bug report`.
- Bot asks for:
  - link to the chat/session in question;
  - screenshot illustrating the issue;
  - User ID;
  - issue description.

Mechanic:

- Bug reporting can happen from inside CRM.
- Support report needs operational context and evidence.
- Report flow is conversational in the reference, but can be implemented as a modal/form.

Confideline mapping:

- v2 `Report problem` modal should auto-attach current chat/session/user context.
- Optional future improvement: conversational support widget or report status follow-up.

### 32:00-35:59: Script Groups Settings

Visible structure:

- Settings section has secondary nav:
  - `Chats`;
  - `Personal info`;
  - `Audio Call`.
- `Script Groups` page lists groups with counts:
  - `Greetings (3)`;
  - `Tech issues (4)`;
  - `Fraud (1)`;
  - `Test/Quiz results (2)`;
  - `Support (2)`;
  - `Rude customers (3)`;
  - `Distrust (3)`;
  - `User leaves live chat (1)`;
  - `Ascendant (2)`;
  - `Empathy (1)`;
  - additional custom groups.
- Expanded group shows editable scripts, character counters, delete/edit controls, `Add Script`, and `Save`.

Mechanic:

- Scripts are agent-editable or at least account-level configurable.
- The same script groups appear as quick actions in the active chat composer.
- Groups can be expanded/collapsed.

Confideline mapping:

- Script library should be a real entity, not hardcoded button labels.
- Chat composer should consume allowed script groups for the operator/expert/profile.
- Some scripts need compliance restrictions, especially payment/refund/support topics.

### 36:00-42:59: Personal Info, Time Zone, Working Hours

Visible structure:

- Personal info settings show:
  - time zone selector;
  - working hours section;
  - weekly date ranges;
  - `Copy the work schedule from last week`;
  - weekday rows with checkboxes;
  - from/to time dropdowns;
  - save action;
  - success toast after update.

Mechanic:

- Operator/expert availability is scheduled weekly.
- Working hours are planned ahead and stored.
- Time zone is part of scheduling.
- Schedule updates give explicit success feedback.

Confideline mapping:

- If assigned expert profiles rely on operator availability, schedule must feed public online availability and routing.
- Need decide whether schedule is operator-level, expert-profile-level, or both.

### 43:00-53:59: Training / Knowledge Base

Visible structure:

- Separate dark Notion-like workspace.
- Pages visible:
  - audio-calls training;
  - expert knowledge base;
  - база знаний до QS;
  - live chats;
  - intro;
  - CR to Payment;
  - questions by cards;
  - emergency/complex cases guidance.

Mechanic:

- CRM operation is supported by a knowledge base.
- Training covers conversation conduct, payments, live chat, and edge cases.

Confideline mapping:

- Not part of launch chat UI, but useful as operator help/manual.
- Right panel or Help menu can link to relevant script/training content by scenario.

### 54:00-57:51: Script Modal In Active Chat

Visible structure:

- Active chat is dimmed.
- Modal opens for `Rude customers`.
- It shows predefined scripts with radio choices.
- Modal text says the operator can send prepared script to the customer and can change script groups/create own scripts in Settings.
- `Send` button sends the selected script.

Mechanic:

- Script insertion can be modal-based, not only immediate one-click insert.
- Group click can open multiple script variants.
- Operator chooses the appropriate tone/version before sending.

Confideline mapping:

- Current v2 script/offer insertion can be expanded into a script-picker modal.
- For sensitive groups like rude customers, fraud, support, and distrust, a modal is better than instant insertion because it reduces accidental sending.

## 14. Video-Derived Requirements To Add To Confideline Scope

High-priority:

- Explicit shift timer: `Start work` / `Stop work`.
- Public availability state: `Online / Busy / Offline`.
- Busy reason modal and audit fields: reason, start time, end time.
- Session lifecycle page or data: To do, In progress, Rejected, Completed.
- Script groups as configurable entities.
- User right panel with balance, bonus balance, birth/zodiac fields, notes.
- Report flow with auto-attached context.
- Working-hours schedule and time zone.

Medium-priority:

- Reviews list and rating analytics.
- Transaction/earnings links from chat context.
- Support widget or report follow-up flow.
- Knowledge-base/help links tied to script groups.

Product decision needed:

- Should Confideline preserve Nebula's exact public statuses `Online / Busy / Offline`, or map them to v2 `On shift / Paused / Off shift` plus a separate public `Start chat available` flag?
- Should script groups be global, per operator, per expert profile, or inherited with overrides?
- Are pings counted only as profile-interest leads, or also as rejected-chat recovery tasks with a strict time window?
