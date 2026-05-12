# InsightOrba day 1 part 2: project model, rules, business process, cabinet

Source video: `C:\GPT-local\input-videos\day1_part2.mp4` hardlink to the original file in Downloads.

Generated artifacts:
- Machine transcript draft: `day1_part2_fast.md`, `day1_part2_fast.json`, `day1_part2_fast.srt`, `day1_part2_fast.vtt`
- Visual frame index: `frames_index.csv`
- Contact sheets: `contact_sheets/contact_sheet_01.jpg` ... `contact_sheets/contact_sheet_07.jpg`
- Key frames: `frames/`

Note on accuracy: transcript is a fast local `faster-whisper tiny` draft. It is enough for timing and topic detection, but the wording is noisy. Conclusions below are based on transcript plus visual verification from frames.

## 1. What Part 2 Adds

Part 1 explained the platform at a high level. Part 2 goes deeper into the real operating model:

- how the operator/expert works with a client inside the chat cabinet;
- how one client can create several chats with different avatars/experts;
- how assignment/locking works;
- how free chat converts into paid session;
- how to answer without crossing into medical/psychological/directive advice;
- what common client types look like;
- what errors reduce conversion;
- what notifications and force-majeure states appear;
- how new workers register, create a profile, choose language, and open schedule.

## 2. High-Level Timeline

| Timecode | Layer | What happens | Key frame / artifact |
|---|---|---|---|
| 00:00:00 - 00:12:30 | Q&A after part 1 | Discussion of client motivation, emotional safety, anonymity, and the goal of helping without judging. Free communication is treated as a bridge to paid communication. | `contact_sheet_01.jpg` |
| 00:12:50 - 00:24:00 | Live cabinet demo | Trainer shows light-theme `PB expert` chat cabinet: expert persona, client list, profile panel, `Assign to me`, filters, multiple chats from one client. | `frames/00-18-50_periodic.jpg`, `frames/00-19-40_changed.jpg` |
| 00:24:00 - 00:57:00 | Multi-avatar / expert logic | Discussion: clients choose an avatar/expert they feel comfortable with; the same real client may open several chats with different expert personas. Chat assignment should preserve continuity. | `contact_sheet_02.jpg` |
| 00:43:00 - 00:52:30 | Assistant summary in chat | Visible AI/assistant-style summary block in the thread with `Summary`, `Actions`, and suggested message. Bottom actions include `Book Now`, `Coupons`, `Review`, plus read/summarize controls. | `frames/00-43-00_periodic.jpg` |
| 00:57:20 - 00:59:20 | Client portraits | Training slide: client types/portraits: victim, narcissist, hysterioid, fantasizer. | `frames/00-57-20_changed.jpg` |
| 01:01:20 - 01:09:20 | Chat algorithm | Welcome message, data collection, names/DOBs/photos if available, client question/sphere, filler phrases, reading structure, and paid-session continuation. | `frames/01-01-20_changed.jpg`, `frames/01-03-20_changed.jpg`, `frames/01-05-20_changed.jpg` |
| 01:11:20 - 01:17:20 | Force majeure | Slide lists operational exceptions: incomplete initial data, missed trial/paid reading, self-assigned/unassigned chat, session started at 8:59, user blocked/deleted chat, platform/client technical issues, statistics not updating. | `frames/01-11-20_changed.jpg` |
| 01:19:00 - 01:21:00 | Common mistakes | Avoid short closure phrases, vague promises to write later, generic "anything else?", and talking about yourself. | `frames/01-19-00_changed.jpg` |
| 01:21:50 - 01:23:00 | Notifications | Examples of system/client notices: "message is important", chat blocked by user, deleted chat restored, summary block. | `frames/01-21-50_changed.jpg` |
| 01:23:00 - 02:20:00 | Practice / critique | Participants discuss examples. Main rule: support and guide the client, but do not issue hard instructions or claim certainty. Need more questions, more empathy, more conversion-oriented continuation. | `contact_sheet_04.jpg`, `contact_sheet_05.jpg` |
| 02:22:40 - 02:24:00 | Registration link | Telegram group contains registration link, login, and temporary password. | `frames/02-22-40_changed.jpg` |
| 02:24:00 - 02:25:00 | Sign up | `Please Sign Up`: email, password, confirm password, Next. | `frames/02-24-00_changed.jpg` |
| 02:26:00 - 02:28:00 | Create profile | `Create My Profile`: first name, last name, date of birth, phone, Telegram, preferred customer communication language. | `frames/02-26-00_changed.jpg`, `frames/02-27-40_changed.jpg` |
| 02:29:10 - 02:34:20 | Schedule / end | New user reaches `My Schedule`; discussion of next training/stage schedule, mentoring, and what to do after registration. | `frames/02-29-10_changed.jpg` |

## 3. Project Model

### 3.1 Roles

- Client: asks personal/relationship/career/finance questions, may start with free communication, then is moved toward paid session.
- Expert persona/avatar: public identity selected by the client. The same platform worker can operate through a persona.
- Operator/chat manager: internal worker who answers, claims chats, uses notes/context, and sells paid consultations.
- Mentor/team lead: helps trainees, answers process questions, and likely supervises during internship/stage period.

Important for Confideline:
- Public expert identity and internal operator identity should remain separate.
- The same real client may have several conversations with several expert personas.
- A conversation is not just a message thread; it carries persona, assignment, paid state, profile data, notes, and conversion stage.

### 3.2 Client Motivation

Training frames the client as seeking:
- emotional safety;
- anonymity;
- a non-judgmental listener;
- support and interpretation;
- a feeling that the expert is personally involved;
- direction without hard pressure.

The business process depends on the client feeling heard before conversion. This is why the chat algorithm emphasizes greeting, data collection, trust, intrigue, and only then call to action.

### 3.3 Multi-Avatar / Multi-Chat Behavior

The same client can create several chats with different experts/avatars. This appears in the demo as repeated names in the list and is discussed in the transcript around `00:18:30 - 00:22:30`.

Implications:
- Client identity and chat identity are not identical.
- Profile data should be shared or at least linkable across the same real client.
- Assignment should be per chat, while client memory can be cross-chat if policy allows.
- Operator should know whether this is a new chat from an existing client.
- The client chooses the avatar they feel comfortable with; this is part of conversion.

## 4. Business Process

### 4.1 Entry

1. Client chooses an expert/avatar.
2. Client starts a free/trial chat.
3. Operator claims or receives the chat.
4. Operator sends a welcome message.
5. Operator collects the minimum data needed for the reading/answer.

Visible UI supports this with:
- `Assign to me` at top right of chat;
- left queue filters;
- right profile panel;
- client details such as name, DOB, partner, location/time, balance.

### 4.2 Free Chat To Paid Session

Training repeatedly frames free communication as limited and conversion-oriented.

Working model:
- Free/trial chat gives a short initial answer and engagement.
- Operator should propose paid continuation after the free value.
- Free reading target shown on slide: about `5-7` minutes plus conversion attempt and `Book Now`.
- Paid session shown on slide: `10-60` minutes with possibility to continue/extend.
- Conversion can be attempted more than once, but should not feel like hard pressure.

Product implication:
- Conversation needs explicit paid state: free/trial, paid active, paid ended, continuation offered, booked.
- The composer should show conversion tools such as `Book Now`, coupon, and scripted continuation prompts.

### 4.3 Paid Session Mechanics

From UI and slides:
- `Book Now` action exists at the bottom of the chat area.
- `Coupons` and `Review` also appear as chat-level actions.
- Dashboard/transactions in part 1 show session minutes and bonus/min, which means paid session duration affects earnings.
- Force-majeure slide mentions trial and paid reading as session types.

Confideline implication:
- If we model paid chat, contracts need session lifecycle events:
  - offered;
  - booked;
  - started;
  - missed;
  - extended;
  - ended;
  - reviewed/refunded/escalated.

### 4.4 Assignment

Visible states:
- `Assign to me`;
- `Assigned to Me`;
- unassigned labels in the left queue.

Business meaning:
- A worker must claim the chat before stable work starts.
- Claimed chat should not be freely picked up by others.
- Some accidental states exist: chat self-assigned/unassigned is listed as force majeure.

Confideline implication:
- Queue state should distinguish:
  - unassigned pool;
  - assigned to me;
  - assigned to another operator;
  - archived;
  - new paid;
  - unanswered;
  - watchlist/favorite/top.

## 5. Chat Algorithm And Writing Rules

### 5.1 Required Flow

From slides and speech:

1. Welcome message.
2. Data collection:
   - names;
   - dates of birth;
   - photos if available;
   - relationship/partner data when relevant.
3. Clarify the sphere/question:
   - what area of life should be focused on;
   - what is bothering the client;
   - what exactly they want to know.
4. Use filler/process phrases to create a feeling of work:
   - tuning in;
   - connecting to energy field;
   - tapping into energies;
   - checking/cards/spread.
5. Give a short reading.
6. Create intrigue / continuation.
7. Offer paid continuation with `Book Now`.

### 5.2 Good Answer Style

- Empathetic, supportive, and non-judgmental.
- Ask open-ended questions.
- Do not close the conversation too early.
- Do not issue direct instructions.
- Offer possible directions, not absolute claims.
- Maintain the persona/reading format the client chose.
- Keep client focus; avoid turning the response into a story about yourself.

### 5.3 Forbidden / Bad Patterns

Slide at `01:19:00` lists mistakes:
- `Thank you` / `You're welcome` as a dead-end response;
- `Is there anything else you'd like to know?` as a generic weak close;
- "When I have new information, I will write to you" style vague promise;
- talking about yourself.

Other rules reinforced by discussion:
- Do not diagnose.
- Do not prescribe.
- Do not tell the client exactly what to do as a mandatory instruction.
- Do not make medical/psychological claims outside the platform's allowed entertainment/consultation frame.
- Do not move the client outside the platform.

## 6. Force-Majeure And Operational Exceptions

Slide at `01:11:20` lists:

- incomplete initial data;
- missed session: trial or paid reading;
- chat self-assigned or unassigned;
- session started at `8:59`;
- chat blocked by user / chat deleted by user;
- technical problems on platform side:
  - no audio/visual notification about session;
  - site hangs;
  - similar platform issues;
- technical problems on client side:
  - payment does not go through;
  - session did not start;
  - message is not visible;
- statistics are not updating.

Product implication:
- These should become explicit issue/flag types, not free-text only.
- Some are operational, some billing-related, some abuse/client-state related.
- A good workspace should expose a quick "problem reason" selector and track resolution.

## 7. Notifications

Slide at `01:21:50` shows examples:

- `Your message is important to me and I will respond to you when I am back online`;
- `This chat was blocked by the user. Until unblocked by the user, you cannot access it`;
- `The user has restored a previously deleted chat with an expert. Use previous chat history wisely`;
- assistant-style summary and suggested message.

Confideline implication:
- System messages must be visually distinct from client/expert messages.
- Restored/deleted/blocked states should affect composer availability.
- "Use previous history wisely" implies prior context is available but sensitive.

## 8. Cabinet / UI Structure

### 8.1 Chat Workspace

Visible layout:
- light theme;
- browser app `PB expert`;
- left queue;
- central chat;
- right info/notes panel;
- top selected expert/avatar and client/partner context;
- bottom navigation.

Left queue:
- filters:
  - `All Users`;
  - `My Tops`;
  - `New (Unassigned)`;
  - `UnAnswered`;
  - `Watchlist`;
  - `Favorites`;
  - `Assigned to Me`;
  - `New Paid`;
  - `Archived`;
- paid filter: `Paid & Not Paid`;
- rows show avatar, name, labels like `UNASSIGNED`, message preview, time, unread pink counters.

Central chat:
- teal outgoing expert messages;
- gray incoming client messages;
- date separators;
- long AI/assistant summary blocks;
- bottom actions:
  - `Book Now`;
  - `Coupons`;
  - `Review`;
  - `Read`;
  - `Summarize`;
- composer area with icons.

Right panel:
- tabs: `Info`, `Notes`;
- client identity and balance/status;
- location/time;
- first/last name;
- date of birth;
- partner first/last name and DOB;
- edit/remove partner info;
- collapsible sections:
  - `Limits`;
  - `Chat info`;
  - `User info`;
  - `Coupons`.

### 8.2 Assistant / Summary Behavior

At `00:43:00` visible summary block includes:
- summary of client's request;
- identified relationship/person data;
- actions to take;
- suggested message.

Product implication:
- Assistant can be a workflow coach, not only a text generator.
- It should surface:
  - what the client asks;
  - missing data;
  - recommended next question;
  - conversion opportunity;
  - compliance warning if needed.

### 8.3 Registration

Around `02:22:40 - 02:28:00`:

1. Trainer sends a Telegram group message with:
   - sign-up link;
   - login;
   - temporary password.
2. User opens sign-up page.
3. `Please Sign Up` form asks:
   - email;
   - password;
   - confirm password.
4. `Create My Profile` form asks:
   - first name;
   - last name;
   - date of birth;
   - phone number;
   - Telegram;
   - preferred language of communication with customers.
5. Language options visible:
   - Russian;
   - English;
   - Ukrainian.

Training instruction:
- name/surname should be entered in English/transliteration;
- date is selected through calendar;
- phone country code can be changed;
- Telegram handle/link is entered;
- if Russian/Ukrainian is selected, messages may be translated for the client; English is preferred for direct client-facing output.

### 8.4 Schedule

Visible after profile completion:
- `My Schedule`;
- `I am online` toggle;
- `Back to chat`;
- profile block;
- menu:
  - `Settings`;
  - `Schedule`;
  - `Black List`;
  - `Log Out`;
- bottom nav:
  - `All Chats`;
  - `Schedule`;
  - `Calendar`;
  - `Settings`;
- weekday rows with add/copy controls.

This confirms that schedule and online status are central to availability/routing.

## 9. Confideline Mapping

Strong matches to current `admin-chat-workspace-v2`:
- queue/list, active thread, right context panel;
- assignment-based conversation switching;
- need for distinct active chats vs pings;
- composer modes can map to chat algorithm stages.

Additional mechanics to bring into Confideline thinking:
- client can have multiple chats under different expert/persona identities;
- right panel should separate client profile, partner data, notes, limits, coupons, and history;
- assignment must be a first-class queue state;
- paid state and conversion state should exist separately from assignment;
- assistant should summarize, detect missing data, recommend next action, and guard compliance;
- force-majeure states should be typed flags;
- schedule/online toggle should feed routing and public expert availability;
- registration/profile setup is part of operator onboarding, not just authentication.

## 10. Suggested Next Modeling Work

For the Confideline contracts, this video suggests adding or checking:

- `clientId` vs `conversationId` vs `expertPersonaId`;
- `assignmentState`: unassigned, assignedToMe, assignedToOther, archived;
- `paymentState`: freeTrial, paidAvailable, paidActive, paidMissed, paidEnded, conversionOffered;
- `conversationStage`: greeting, dataCollection, trust, reading, conversion, support, blocked;
- `issueType`: missingData, missedTrial, missedPaid, selfAssigned, unassigned, blockedByUser, deletedByUser, platformTech, clientTech, statsNotUpdated;
- `profileMemory`: client fields, partner fields, internal notes, prior chats;
- `assistantPayload`: summary, missingData, nextQuestions, suggestedReply, complianceRisk, conversionHint.

This part is especially relevant for queue contracts, right-panel data contract, assistant tab, and future paid-session logic.
