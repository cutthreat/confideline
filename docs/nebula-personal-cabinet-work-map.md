# Nebula Personal Cabinet And CRM Work Map

Purpose: describe how Nebula's personal cabinet / CRM works as a product system, what each area is for, why the mechanics exist, and what logic must be understood before adapting the model to Confideline.

Sources:

- Google Sheet: `C:\GPT-local\nebula-chat-logic.xlsx`
- Extracted table notes: `C:\GPT-local\nebula-chat-logic-extracted.md`
- Video: `C:\Users\user\Downloads\работа в CRM 2024-11-22 174200.mp4`
- Raw transcript: `docs/video-analysis/crm-video-transcript-raw.md`
- Cleaned video walkthrough: `docs/video-analysis/crm-video-mechanics-walkthrough.md`
- Existing Confideline v2 mockup: `web/admin-chat-workspace-v2/`

## 1. High-Level Product Model

Nebula is built around paid expert consultations.

The client thinks they are choosing and speaking to an expert: astrologer, tarot reader, psychic, relationship specialist, etc. The CRM worker sees a deeper operational layer: live chat queue, user context, money/balance, pings, scripts, shift status, reviews, transactions, and work schedule.

The important split:

- Client-facing identity: expert profile.
- Internal working identity: operator/agent/consultant account.
- Business goal: convert user attention into paid live consultation, retain the user, and recover users who left or did not start chat.

The system is not "just messages". It is a revenue workflow:

1. Attract user.
2. Show expert catalog/profile.
3. Start live paid consultation if expert is available.
4. Use messenger/pings to reactivate users who did not pay or left.
5. Use scripts to keep quality and conversion consistent.
6. Track sessions, transactions, reviews, and operator KPI.

## 2. Roles

### Client/User

The client searches for guidance, chooses experts, starts chats, pays for credits/minutes, receives expert messages, and can leave reviews.

Client sees:

- expert cards;
- expert profile;
- online/busy/offline status;
- start chat button;
- chat screen;
- payment/top-up prompts;
- blurred/locked answers or paid unlock prompts;
- reviews/ratings;
- support/report paths.

Client does not see:

- internal operator identity;
- shift reason;
- internal notes;
- KPI;
- transaction calculation internals;
- script library.

### Expert Profile

This is the public persona. It is what the client trusts and buys from.

Profile contains:

- nickname/pseudonym;
- photo/avatar;
- category/specialization;
- rating/reviews;
- expertise tags;
- experience;
- consultation count;
- about text;
- price per minute/credits;
- public availability.

Why it exists:

- It is the product packaging.
- It creates trust and conversion.
- It allows one internal CRM to serve many expert personas.

### Operator/Agent/Consultant

This is the person working inside CRM.

Operator controls:

- shift start/stop;
- public status;
- Busy reason;
- chat replies;
- pings;
- scripts;
- schedule;
- reports;
- user notes/context.

Operator is measured by:

- live chat acceptance speed;
- rejected/timeout rates;
- reply time;
- session duration;
- pings sent;
- reviews/CSAT;
- working hours;
- conversion/retention signals.

### Shift Lead / Supervisor

Coordinates the shift, answers difficult cases, monitors quality, and may advise during sensitive conversations.

Supervisor logic exists because:

- complex cases need human escalation;
- operators should not improvise on safety/legal/payment-sensitive topics;
- live chat has revenue priority and staffing must be coordinated.

### Support / Technical Team

Handles bug reports and payment/technical issues.

Operators should not solve or promise refunds directly. They gather evidence and route the issue.

## 3. Client-Side Cabinet And Flow

### 3.1 Expert Discovery

Client enters through ads, tests, quizzes, forecasts, or direct expert catalog.

Expert teaser card shows:

- category;
- nickname;
- rating;
- online/busy/offline status;
- expertise;
- experience;
- number of readings;
- about summary;
- price;
- start action.

Why:

- Helps user quickly choose someone credible.
- Online status creates urgency.
- Price and rating reduce uncertainty.
- Free minutes/starter offers lower entry friction.

### 3.2 Expert Profile

Full profile expands the sales surface:

- avatar/name/country;
- rating and latest/all reviews;
- favorite action;
- specialization;
- status;
- price;
- start chat button;
- about;
- expertise tags;
- FAQ.

Rules:

- If expert is Online: Start chat can be active.
- If expert is Busy: client should not be able to start paid live chat; system can suggest another expert or allow message.
- If expert is Offline: live chat unavailable.

Why:

- The client decision happens here.
- Availability status directly controls monetization.

### 3.3 Chat Start

If expert is available:

1. Client presses Start chat.
2. Connection/progress screen appears.
3. Client is told connection takes about 15-20 seconds.
4. Client is told they are not charged during connection.
5. After connection, live paid chat starts.

If expert is busy:

- client sees fallback modal;
- may be offered another expert or asynchronous message.

Why:

- Reduces abandonment during wait.
- Makes charging boundary clear.
- Protects operator from receiving live chat during Busy work.

### 3.4 Active Paid Chat

Client sees:

- expert photo/name/status;
- elapsed timer;
- messages;
- own question;
- instruction to stay on page;
- payment/top-up prompts when balance/free time ends.

Payment mechanics:

- consultation is minute-based;
- credits are spent during live chat;
- free/starter minutes can exist;
- packages/top-ups are offered when time/balance is low.

Why:

- Timer and balance make the paid session understandable.
- Top-up prompts prevent abrupt end.
- Operator needs matching billing state in CRM to time offers correctly.

### 3.5 Locked/Blurred Answers And Reactivation

Nebula uses expert-originated messages after profile views or previous interaction:

- user receives a notification/message;
- answer can be blurred/locked;
- user must buy credits to reveal or continue;
- example logic from notes: pay credits for an answer.

Why:

- This monetizes dormant interest.
- It turns profile views and partial answers into return paths.
- It is tightly connected to pings.

## 4. Operator CRM Shell

### 4.1 Left Navigation

Observed sections:

- Workflow:
  - Chats;
  - Sessions;
  - Pings.
- Salary:
  - Invoices;
  - Transactions;
  - Reviews.
- User Management:
  - Activity.
- Settings:
  - Chats/scripts;
  - Personal info;
  - Audio Call.

Why this layout:

- Workflow is where operator earns money.
- Salary explains earnings.
- Reviews and activity explain quality and performance.
- Settings control scripts and availability.

### 4.2 Top Bar

Top bar contains:

- Report;
- Connected indicator;
- public status: Online/Busy;
- Make me busy;
- Start/Stop work;
- profile/account;
- monthly earnings/balance;
- notifications;
- dropdown menu.

Why:

- These are always-needed operational controls.
- Operator must control availability without leaving the current chat.
- Reporting and connection state are critical for live operations.

## 5. Shift, Availability, And Busy Logic

This is one of the most important mechanics in Nebula.

### 5.1 Shift

Shift is CRM work-time tracking. It is not the same as login.

States:

- not started;
- active;
- stopped.

Actions:

- Start work: starts shift timer and creates shift record.
- Stop work: ends shift, stops timer, sets public status Offline, clears Busy.

Rules:

- Online outside an active shift is not allowed.
- If Stop work fails server-side, shift should not be ended locally.
- Shift history feeds payroll, KPI, and schedule compliance.

Why:

- Business needs to know who is working.
- Client availability depends on real staffing.
- Earnings/bonuses need working-time records.

### 5.2 Public Availability

Public status is what clients see.

Statuses:

- Online: client can start live chat.
- Busy: operator is working, but client cannot start paid live chat.
- Offline: live chat unavailable.

Important:

- Busy does not mean operator is gone.
- Busy still allows messages/messenger work.
- Busy blocks new paid live chat requests.

Why:

- Prevents clients from starting paid sessions when operator is occupied.
- Lets operator do pings/messages/breaks without losing control.
- Avoids bad user experience from unanswered live chat requests.

### 5.3 Make Me Busy

Make me busy switches public status to Busy and records a reason.

Observed reasons:

- Time for pings.
- Time for messenger.
- Time for a break.
- Time for 1-on-1.
- I'm a shift lead.

Rules:

- Reason can be optional in some setups.
- To change reason, operator should exit Busy and enter Busy again.
- Each Busy interval should have start/end time.

Why:

- Distinguishes productive work from absence.
- Gives managers visibility into how shift time is spent.
- Protects operator from incoming live chat while doing other required tasks.

### 5.4 Connection State

Connected indicator shows whether the operator can reliably work.

Suggested states:

- Green: stable.
- Yellow: unstable/reconnecting.
- Red: disconnected.

Suggested logic:

- monitor API and realtime chat connection;
- measure RTT, error rate, reconnects;
- if Red persists, auto-move to Busy;
- do not auto-return to Online.

Why:

- Connection problems can cause missed chats and poor paid-session experience.
- Auto-Busy prevents users from starting sessions with unreachable operator.

## 6. Chats

### 6.1 Chat List

Chat list contains:

- all chats;
- in progress tab;
- search by name;
- filters;
- chat cards with client name, preview, date, expert identity, status marker.

Useful filters from Nebula:

- unread;
- favorites;
- unanswered;
- in work.

Why:

- Operator needs to find who requires reply.
- Favorites help track valuable clients.
- Unanswered/unread prevent revenue leakage.

### 6.2 Open Chat

Open chat shows:

- client nickname;
- favorite star;
- client balance;
- bonus balance;
- expert identity;
- price per minute;
- message timeline;
- composer;
- script groups;
- right user panel.

Why:

- Operator replies better with money/session/user context visible.
- Scripts accelerate and standardize responses.
- Favorite lets operator mark potential whales or important clients.

### 6.3 Messenger vs Live Chat

Messenger/offline messages are not the same as paid live chat.

Messenger purpose:

- answer light questions;
- keep user engaged;
- invite to live chat;
- recover abandoned users;
- handle asynchronous communication.

Live chat purpose:

- real-time paid consultation;
- deeper reading;
- monetized conversation;
- highest operational priority.

Rule:

- Do not give complete paid readings in messenger.
- If user asks many questions, answer lightly and route to live chat.
- If user asks one concrete simple question, a short answer can be acceptable, but conversion remains the goal.

Why:

- Messenger can accidentally replace paid product.
- Live chat is the revenue center.

### 6.4 Live Chat Priority

Live chat outranks:

- manager syncs;
- messenger cleanup;
- pings;
- routine admin;
- most non-emergency tasks.

If live chat conflicts with meeting:

- continue live chat;
- inform manager/shift lead.

Why:

- User is in a monetized, high-intent state.
- Dropping live chat risks revenue and bad review.

## 7. Sessions

Sessions are the lifecycle layer behind chats.

Tabs:

- To do.
- In progress.
- Rejected.
- Completed.

### 7.1 To Do

May contain pending tasks/offline requests depending on workflow.

In the video, this area is described as possibly empty or less used, but conceptually it is a task intake area.

### 7.2 In Progress

Contains active live chats.

Why:

- If chat UI fails or active chat is hard to find, Sessions/In Progress is the backup source of truth.
- Operator can re-open active live session from there.

### 7.3 Rejected

Contains failed/missed/rejected chat requests.

Possible reasons:

- user refreshed page;
- technical reject;
- late accept;
- expert/operator refused;
- automatic page refresh;
- timeout.

Rules from notes:

- accept live chat quickly, target around 15 seconds;
- expert reject rate should stay low;
- timeout reject rate should stay low.

Why:

- Rejected chats are lost revenue and KPI risk.
- They can trigger recovery pings.

### 7.4 Completed

Contains finished sessions with:

- id;
- created at;
- project;
- expert;
- type;
- status;
- client name;
- client type;
- session duration;
- total/amount.

Why:

- Operator and managers need session history.
- Completed sessions feed transactions, reviews, payroll, and KPI.

## 8. Pings

Pings are not ordinary messages. They are structured reactivation and conversion work.

### 8.1 Ping Types

Observed/inferred types:

- System-suggested pings: users system thinks are worth contacting.
- Manual pings: operator filters all users and chooses targets.
- Rejected-chat recovery pings: after failed live-chat start.
- Mandatory/admin pings: tasks from management.
- Profile-interest pings: user viewed/interacted with expert profile but did not start chat.

### 8.2 Ping Workflow

Typical flow:

1. Operator sets Busy reason `Time for pings`.
2. Opens pings area.
3. Processes system-priority list first.
4. If list is empty, uses filters in All.
5. Prioritizes users with higher previous engagement/value.
6. Sends light, engaging message.
7. Goal is to return user to paid live chat.

For rejected chat:

- there can be a time window after rejection;
- notes mention 10 minutes for a ping to count;
- after first ping, button/state changes to normal send;
- later messages no longer count as pings.

Why:

- Pings recover revenue that would otherwise be lost.
- They keep high-potential users warm.
- They are measurable work for operator KPI/bonuses.

### 8.3 Ping Targeting

Priority can use:

- previous chat duration;
- recent activity;
- client segment;
- payment history;
- profile views;
- rejected chat event;
- unread/offline messages;
- birthday/astrological context;
- available credits/balance.

Why:

- Operators should not ping randomly.
- Highest-value users should be contacted first.

## 9. User Context And Segments

The right user panel is critical.

Data shown/needed:

- user ID;
- nickname;
- zodiac sign;
- birth date;
- time/place of birth;
- gender;
- relationship status;
- balance;
- bonus balance/free minutes;
- client type/status;
- device/platform;
- notes;
- expert profile used;
- price per minute;
- previous sessions/reviews.

Why:

- Expert consultation depends on personal context.
- Balance and bonus state determine monetization timing.
- Segment/status tells operator how much attention and empathy is needed.

### Client Segments

From table notes:

- Low: new/early user, first paid event or low history.
- Casual: came from mailing/pings and paid once.
- Promising: paid and visits often, potential whale.
- VIP: frequent visitor and payer.
- Whale: consistently paying, high-value client.

Why:

- Segment affects priority and tone.
- Promising/VIP/Whale users may deserve faster recovery and more careful handling.

## 10. Scripts

Scripts are a core operating tool.

### 10.1 Script Groups

Observed groups:

- Greetings.
- Tech issues.
- Fraud.
- Test/Quiz results.
- Support.
- Rude customers.
- Distrust.
- User leaves live chat.
- Ascendant.
- Empathy.
- Custom/new group.

### 10.2 Script Settings

Operators can:

- open script groups;
- add/edit/delete script variants;
- save changes;
- use scripts later in chat.

Observed constraints:

- script text has a character limit, around 600 characters;
- scripts should be concise;
- edits must be saved.

### 10.3 Script Use In Chat

In active chat:

- script group buttons appear near composer;
- some groups can open modal with several variants;
- operator selects variant;
- Send sends chosen script or inserts it depending on workflow.

Why:

- Speeds up work.
- Keeps communication on policy.
- Helps new operators handle common cases.
- Reduces risk in sensitive topics.

## 11. Support And Report

Report is the path for bugs and technical issues.

### Report Flow

Operator opens report/support.

Support asks for:

- chat/session link;
- screenshot;
- user ID;
- issue description.

For status/availability bugs, required fields may differ:

- screenshot;
- description;
- current status;
- connection state.

Why:

- Technical team needs reproduction context.
- Operator should not silently work around critical bugs.
- Availability bugs directly reduce revenue.

### Report Data Model

Report should store:

- report id;
- category;
- priority;
- title;
- description;
- attachments;
- operator;
- role;
- URL;
- user/session/chat context;
- browser/OS;
- connection state;
- current shift/status;
- status/resolution.

## 12. Transactions, Invoices, Earnings

### Transactions

Transaction table shows:

- number/id;
- customer/system;
- client type;
- expert;
- created date/time;
- description;
- amount;
- balance.

Description can include:

- type: online;
- session time;
- total amount.

Why:

- Shows how money was earned or adjusted.
- Lets operator audit activity.
- Feeds payroll/balance.

### Invoices

Invoices show:

- invoice number;
- date of creation;
- status;
- user;
- supply type;
- amount;
- created by;
- comment.

Why:

- Payroll/accounting view.
- Not core chat UI.

### Monthly Earnings

Top bar/profile area shows earned balance/monthly amount.

Why:

- Operator sees compensation progress.
- Reinforces performance loop.

## 13. Reviews And Quality

Reviews page shows:

- live chat id;
- created/edited date;
- client;
- client type;
- comment;
- rating.

Ratings matter because:

- quality metric;
- operator performance;
- possible bonus/penalty;
- signal for follow-up/recovery.

Logic:

- Bad rating is not final; operator can attempt recovery communication.
- QA/supervisors can review chats.

## 14. Working Hours And Schedule

Settings include time zone and working hours.

Schedule model:

- timezone;
- week range;
- day checkbox;
- from time;
- to time;
- multiple intervals per day;
- copy previous week;
- save;
- success toast.

Why:

- Managers need planned coverage.
- Operators must declare availability ahead of time.
- Planned schedule is separate from actual shift.

Important distinction:

- Schedule: planned availability.
- Shift: actual work session.
- Public status: current client-facing ability to start chat.

These should not be collapsed into one field.

## 15. Training And Knowledge Base

Nebula uses separate training/knowledge pages.

Topics include:

- live chats;
- audio calls;
- expert knowledge;
- difficult cases;
- questions by cards;
- payment/conversion;
- emergency cases;
- scripts and communication examples.

Why:

- Operators need guided behavior for edge cases.
- Training reduces improvisation.
- Knowledge base supports consistent quality.

How it connects to CRM:

- scripts link to training;
- help menu can link to relevant article;
- difficult cases can be escalated to shift lead.

## 16. Translator And Language Workflow

Nebula reference assumes experts may be English-speaking.

If user writes another language:

- operator can use translator;
- operator can tell user they may write in their language and the operator will use translator;
- if user writes English, continue in English.

Why:

- Removes language barrier.
- Allows operators with limited language coverage to still work.
- Must be handled transparently enough for user trust.

Confideline implication:

- Translator should be conversation-level mode, not only one message action.
- Templates/scripts need language awareness.

## 17. Sensitive And Restricted Cases

Examples from video:

- rude customers;
- user leaves live chat;
- illegal requests;
- gambling/lottery requests;
- bank/payment manipulation requests;
- emotionally difficult cases;
- technical/safety incidents.

Rules:

- Use approved scripts.
- Use empathy.
- Do not promise impossible outcomes.
- Do not provide illegal/unsafe advice.
- Do not expose confidential user data when asking colleagues for help.
- If abusive user continues, operator may end chat.

Why:

- Protects user.
- Protects operator.
- Protects company from policy/legal/reputation risk.

## 18. End-Chat Logic

Possible end reasons:

- normal completion;
- client stopped responding;
- client left live chat;
- rude/abusive client;
- technical issue;
- safety/emergency;
- policy-restricted topic;
- payment/balance ended.

Why:

- End reason feeds session history.
- End reason can trigger ping/follow-up.
- End reason affects KPI and support review.

## 19. Core Data Entities

### Identity

- User/client.
- Expert profile.
- Operator/agent.
- Supervisor/shift lead.

### Work State

- Shift record.
- Planned schedule.
- Public availability status.
- Busy interval/reason.
- Connection state.

### Communication

- Conversation/chat.
- Message.
- Live session.
- Ping task.
- Script group.
- Script.
- User note.

### Monetization

- Balance.
- Bonus balance/free minutes.
- Credit package.
- Transaction.
- Invoice.
- Session charge.

### Quality And Control

- Review.
- Rating.
- Report/support ticket.
- KPI metric.
- Training article.
- Policy flag.

## 20. State Machines

### Shift State

```text
not_started -> active -> stopped
```

Rules:

- Start work moves to active.
- Stop work moves to stopped and sets public status Offline.
- Active shift is required for Online/Busy.

### Public Availability

```text
offline -> online -> busy -> online
online -> offline
busy -> offline
```

Rules:

- Online allows Start chat.
- Busy blocks Start chat but allows messages.
- Offline blocks Start chat.
- Connection Red can force Busy.

### Live Session

```text
requested -> accepted -> in_progress -> completed
requested -> rejected
requested -> timeout
in_progress -> completed
in_progress -> ended_by_operator
in_progress -> ended_by_client
```

Rules:

- Accept quickly, target around 15 seconds.
- Rejected/timeout feed KPI.
- Rejected can create recovery ping.

### Ping

```text
suggested -> prepared -> sent -> replied -> converted
sent -> expired
sent -> no_push
```

Rules:

- Some pings have time window, especially rejected-chat recovery.
- First ping counts differently from later normal messages.
- Conversion means user returns, replies, starts live chat, or pays depending on analytics definition.

### Script

```text
draft -> active -> used
active -> edited -> active
active -> disabled
```

Rules:

- Scripts need owner/scope.
- Scripts should be short enough for chat.
- Sensitive scripts may require modal selection.

## 21. Why Nebula Works This Way

Nebula optimizes for five things:

1. Availability: users can start paid chat only when someone can serve them.
2. Conversion: messenger/pings push users toward live chat.
3. Retention: pings, favorites, notes, reviews and user context help recover value.
4. Consistency: scripts and knowledge base standardize operator behavior.
5. Control: shifts, Busy reasons, sessions, transactions and reviews make work measurable.

This explains why many details exist:

- Busy reasons are not cosmetic; they make non-live work visible.
- Pings are not messages; they are a conversion workflow.
- User context is not "nice to have"; it changes reply quality and sales timing.
- Sessions are not just history; they are the source for KPI and recovery.
- Scripts are not just shortcuts; they are policy and training embedded into chat.

## 22. What To Transfer To Confideline

### Must Transfer

- Client sees expert, not operator.
- Public availability: Online/Busy/Offline or equivalent.
- Separate shift state from public availability.
- Start/Stop work and shift timer.
- Busy reasons and audit.
- Active chat queue.
- Pings as first-class workload.
- Paid session panel.
- User context/right panel.
- Script groups.
- Report/support flow with auto-context.
- Session lifecycle.

### Should Transfer

- Working-hours schedule.
- Transactions/reviews as linked pages.
- Translator workflow.
- Knowledge base links.
- KPI tracking.
- Review recovery flow.
- Rejected-chat recovery pings.

### Can Be Deferred

- Full invoice UI inside operator launch.
- Advanced bonus/motivation dashboard.
- Complex saved segments.
- Full support chat widget if report modal is enough.
- Deep analytics dashboards.

## 23. Main Differences From Current Confideline V2 Mockup

Current Confideline v2 already has:

- `All / Active chats / Pings`;
- paid session panel;
- ping outreach panel;
- right context panel;
- report modal;
- compensation request;
- handoff/follow-up modals;
- focus mode;
- expert-facing identity rule.

Missing or needs stronger definition:

- Start/Stop work timer.
- Public `Online / Busy / Offline` availability.
- Mapping between `Paused` and Nebula Busy.
- Busy reasons exactly as work categories.
- Session lifecycle pages/states.
- Rejected-chat recovery ping.
- Script library backend.
- Working-hours schedule.
- Translator toggle/state.
- Transactions/reviews links.
- KPI/reject/reply-time rules.

## 24. Recommended Confideline Adaptation Model

Use three separate layers:

### Layer 1: Shift

Internal work record:

- off shift;
- on shift;
- shift start/end;
- actual worked time.

### Layer 2: Public Availability

Client-facing status:

- Online: can start live chat.
- Busy: can message, cannot start live chat.
- Offline: cannot start live chat.

### Layer 3: Workload Mode

What the operator is doing:

- accepting live chats;
- active paid chat;
- messenger;
- pings;
- break;
- support/admin;
- shift lead.

This avoids the biggest product mistake: collapsing shift, public status and workload into one ambiguous field.

## 25. Open Product Questions

1. Will Confideline operators own one expert profile or multiple expert profiles?
2. Are assigned expert profiles exclusive per operator during a shift?
3. Should `Busy` be public to users exactly as Nebula shows it?
4. Should users be allowed to send async messages when expert is Busy?
5. What counts as ping conversion: sent, user replied, live chat started, or paid minute started?
6. Should rejected-chat recovery ping have a strict 10-minute window?
7. Are scripts global, per role, per expert profile, or per operator?
8. Can operators edit scripts themselves, or only use admin-approved scripts?
9. What billing actions are allowed to operator: offer only, compensation request, coupon issue, refund request?
10. Which sensitive topics require hard blocking vs warning/checklist?

