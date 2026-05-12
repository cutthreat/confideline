# InsightOrba day 1 part 1: transcript, expert workflow, UI map

Source video: `C:\GPT-local\input-videos\day1_part1.mp4` hardlink to the original file in Downloads.

Generated artifacts:
- Machine transcript draft: `day1_part1_fast.md`, `day1_part1_fast.json`, `day1_part1_fast.srt`, `day1_part1_fast.vtt`
- Visual frame index: `frames_index.csv`
- Contact sheets: `contact_sheets/contact_sheet_01.jpg` ... `contact_sheets/contact_sheet_11.jpg`
- Key frames: `frames/`

Note on accuracy: the transcript was produced locally with `faster-whisper tiny` for speed over a 02:46:21 video. It is useful for timing and topic detection, but mixed Ukrainian/Russian speech is noisy. Functional conclusions below are therefore based on the combination of transcript timing and visible frames.

## 1. High-Level Timeline

| Timecode | Layer | What happens | Key frame / artifact |
|---|---|---|---|
| 00:00:00 - 00:18:10 | Training setup | Attendance is checked in Zoom. Participants are asked to complete a small task, put a plus in the training group, keep cameras on, rename/identify themselves, and ask questions in Zoom chat. Recording is explicitly not promised; attendance is treated as live participation. | `contact_sheet_01.jpg`, `contact_sheet_02.jpg` |
| 00:18:20 - 00:20:20 | Lecture start | Trainer explains the structure: first a lecture/presentation, then questions, then a practical platform walkthrough. | `frames/00-18-20_changed.jpg` |
| 00:22:20 - 00:24:20 | Product model | InsightOrba is positioned as a consultation platform in the entertainment niche. Main chat-manager tasks: communication with clients and sale of paid consultations. | `frames/00-22-20_changed.jpg` |
| 00:26:20 - 00:30:20 | Value proposition | Clients choose the platform because of stable availability, client orientation, communication quality, and being on the client's side. | `frames/00-26-20_periodic.jpg` |
| 00:32:20 - 00:36:20 | Client-side funnel | Client flow is shown as registration, first trial chat, expert selection, and transfer to paid consultation. | `frames/00-32-20_periodic.jpg` |
| 00:38:20 - 00:50:20 | Client questions and answer sources | Typical topics: success/career, finance, love/relationships, nonstandard questions. Answer sources: staff experts, online services, personal life experience, video, team lead and regular trainings. | `frames/00-38-20_periodic.jpg` |
| 00:51:20 - 01:02:10 | Working conditions and pay | Effective work requires desire, computer with stable internet, and time. Salary model: hourly rate plus bonus, no fines/no reduction messaging, no earnings cap. | `frames/00-51-20_changed.jpg`, `frames/00-58-10_changed.jpg` |
| 01:04:20 - 01:22:20 | Platform rules | 18+ only; no diagnoses/treatment/medical consultations; no disclosure of confidential personal/location data; no move to another platform/customer theft; no rudeness, roughness, or conflicts. | `frames/01-04-20_changed.jpg` |
| 01:23:50 - 01:28:00 | Chat algorithm | Chat is taught as a sales/conversion script: greeting, data collection, trust, interest, call to action. | `frames/01-23-50_changed.jpg` |
| 01:29:00 - 02:24:40 | Q&A / operational nuances | Discussion with participants: how to answer client questions, whether to use psychology/astrology/other styles, what counts as paid consultation, how client data and card/payment details relate to work, schedule restrictions and flexibility. | `contact_sheet_05.jpg` - `contact_sheet_10.jpg` |
| 02:25:50 - 02:38:00 | Live chat UI demo | Trainer shows expert/operator account. Visible: chat list, selected client, central message thread, right profile/info panel, `Assign to me` / assigned state, filters and badges in the queue. | `frames/02-25-50_changed.jpg`, `frames/02-29-50_periodic.jpg` |
| 02:39:50 - 02:40:30 | Schedule UI | `My Schedule` screen: weekly availability, time slots, vacation banner, add/copy/delete controls. | `frames/02-39-50_periodic.jpg` |
| 02:41:50 - 02:42:30 | Dashboard UI | KPI/payment dashboard: total earnings, rate, bonus/min, payment card, today/yesterday/month blocks, efficiency. | `frames/02-41-50_periodic.jpg` |
| 02:43:50 - 02:44:30 | Transactions UI | Payout periods with hours, session minutes, bonuses, vacation days, card/IBAN, USD/UAH totals, review action. | `frames/02-43-50_periodic.jpg` |
| 02:46:20 | Session end | Zoom quality rating popup appears. | `frames/02-46-20_changed.jpg` |

## 2. Expert / Chat-Manager Work Regulation

### 2.1 Training Attendance

- Training is live; the recording is not treated as a substitute.
- Participant must be visibly present: camera on unless there is an agreed force majeure.
- Participant must identify themselves in Zoom/training materials so the team can match attendance to the person.
- A small attendance task is completed at the beginning, then a plus is placed in the training group.
- Missing planned time should be coordinated in advance, not silently skipped.
- Questions are collected through Zoom chat / raised hand and answered during the training blocks.

### 2.2 Work Preconditions

- Stable computer and internet are mandatory.
- The worker needs enough uninterrupted time for shifts and client communication.
- The work is framed as remote, online, and communication-heavy.
- Initial schedule is expected to follow the selected training/shift option; later schedule flexibility is discussed as conditional on results and agreement.

### 2.3 Core Job

The role is effectively a chat manager/operator behind an expert-facing platform identity.

Main responsibilities:
- communicate with clients in chat;
- support and keep the client engaged;
- collect context and client data needed for a meaningful answer;
- build trust and interest;
- lead the client toward a paid consultation;
- keep work inside the platform.

Important distinction for Confideline:
- The client sees an expert/persona.
- Internally, the worker operates the chat, profile notes, schedule, and payout tooling.
- Assignment/ownership of a client matters because the system treats active work with a client as a locked responsibility.

### 2.4 Allowed Answer Sources

The training explicitly normalizes several sources for answers:
- staff experts;
- online services;
- own life experience;
- video/materials;
- team lead and regular trainings.

This means the product does not require every operator to be a licensed domain specialist. It trains them to answer within a scripted, entertainment/consultation frame while using approved support sources.

### 2.5 Client Topics

Common client question domains shown on slides:
- success and career;
- finance;
- love and relationships;
- nonstandard questions.

For Confideline mapping, these are equivalent to category tags / conversation intents. They can drive scripts, assistant hints, expert routing, and QA checks.

### 2.6 Mandatory Restrictions

Rules visible in the training:
- only adult users, 18+;
- do not diagnose;
- do not prescribe treatment;
- medical consultations are forbidden;
- do not disclose confidential data about yourself or location;
- do not move clients to another platform;
- do not steal clients;
- no rudeness, roughness, or quarrels.

Product implication:
- The workspace should have compliance reminders, flags, and possibly blocked phrase/intent detection for medical/legal/off-platform/contact-data risks.
- Escalation/flag tools should be close to the composer and profile panel, not buried.

### 2.7 Chat Algorithm

The taught algorithm has five stages:

1. Greeting.
2. Data collection.
3. Client trust.
4. Interest.
5. Call to action.

Confideline implication:
- Composer modes and assistant prompts should know the current stage.
- `reply` and `direct` messages can be enriched with stage-specific templates.
- Handoff/QA should record where the conversation currently is in the funnel.

### 2.8 Pay and Motivation

Training frames compensation as:
- hourly rate;
- no fines;
- fixed bonus;
- growth potential;
- no reductions;
- no salary ceiling / income in the worker's hands.

Platform UI confirms this with dashboard and transaction screens:
- hourly rate and bonus/min;
- session minutes;
- total earnings;
- efficiency;
- payout card/IBAN;
- USD and UAH amounts;
- transaction review.

For Confideline this is not necessarily client-facing, but it is important for expert/operator cabinet design if we build internal workforce tooling.

## 3. Functional UI Map

### 3.1 Chat Workspace

Visible around `02:25:50 - 02:38:00`.

Main layout:
- dark theme;
- left queue/list of client chats;
- central conversation thread;
- right profile/context panel;
- bottom navigation on the expert account: `All Chats`, `Schedule`, `Calendar`, `Settings`.

Queue/list behavior:
- filters at top, including `All Users` and paid/not-paid status;
- individual chats show avatar, name, badges, last message preview, time, and pink unread counters;
- selected conversation is highlighted in teal;
- some rows show labels such as `UNASSIGNED`, which suggests unclaimed pool items;
- conversation ownership is controlled through `Assign to me` / assigned state.

Conversation behavior:
- outgoing operator/expert message is a large teal bubble;
- incoming client message is a gray bubble with avatar;
- visible date separator;
- thread is focused on a single active client.

Right panel:
- tabs: `Info`, `Notes`, `Assistant`;
- profile data: client name, balance/status, location/time, first/last name, date of birth, partner name/date of birth;
- collapsible sections: `Limits`, `Chat info`, `User info`, `Coupons`;
- edit/remove controls for profile fields.

Confideline mapping:
- Current `admin-chat-workspace-v2` already has the same broad pattern: queue/list, message thread, right panel, tabs, assignment/switching logic.
- InsightOrba adds stronger worker economics and client profile dimensions: balance, partner data, coupons, limits, and assistant tab.
- Existing `direct / reply / edit` composer modes can be mapped to stages of the chat algorithm.

### 3.2 Assignment / Ownership

Visible controls show `Assign to me` and later an assigned state.

Inferred behavior from speech and UI:
- if the expert/operator wants to answer, they claim the client;
- after claiming, they can communicate in the thread;
- claimed clients should not remain fully open in the general pool;
- ownership prevents multiple workers from answering the same client in parallel.

Confideline implication:
- `requestQueueStateUpdate` and `applyDemoQueueState` should distinguish unassigned pool, assigned-to-me, assigned-to-other, and possibly paid/non-paid statuses.
- Conversation switch should preserve ownership context in the right panel and composer.

### 3.3 Notes / Internal Memory

Right panel includes `Notes`, and training speech discusses saving information about the client.

Expected behavior:
- notes are internal, not visible to the client;
- notes collect facts, impressions, preferences, and context for future answers;
- notes reduce repeated questioning and support continuity.

Confideline implication:
- right panel `flags` / `notes` should support internal-only client memory;
- audit should show who added/edited notes;
- assistant hints should be allowed to read notes but not expose them verbatim to the client.

### 3.4 Schedule

Visible around `02:39:50`.

Screen elements:
- left account sidebar with user `Daniil_Novikov`;
- nav: `Dashboard`, `Statistic`, `Transactions`, `Settings`, `Schedule`, `Black List`, `Log Out`;
- `Back to chat`;
- weekly rows `MON` through `SUN`;
- checkboxes for active days;
- start/end time dropdowns;
- plus button to add time interval;
- copy/duplicate and delete/trash controls;
- `My Vacation` banner;
- availability/status toggle.

Confideline implication:
- If expert availability becomes part of public client routing, schedule must feed public online/busy/offline state.
- Shift state should affect whether the operator receives new chats/pings.

### 3.5 Dashboard

Visible around `02:41:50`.

Screen elements:
- top KPI cards: total amount, rate/earning bucket, bonus/min, count metric;
- hourly-rate calculation;
- payment card field;
- cards for `Today`, `Yesterday`, `This month`, `Last month`;
- metrics: hours, rate, earnings, session minutes, bonus, efficiency.

Confideline implication:
- Not required for the current admin-chat mockup unless building expert/operator cabinet.
- Useful data model if we later track paid chat minutes, bonus rules, or operator performance.

### 3.6 Transactions

Visible around `02:43:50`.

Screen elements:
- payout cards by period;
- total hours and hourly rate;
- session minutes and bonus/min;
- additional bonus;
- vacation days;
- payment UAH card and IBAN;
- total USD;
- exchange rate;
- total UAH;
- `Review` button.

Confideline implication:
- Transaction review is a separate workflow from chat handling.
- If copied, it should live in a workforce/payments area, not in the chat workspace itself.

## 4. Direct Mapping To Confideline Chat Workspace V2

Already aligned:
- queue/list plus active conversation;
- right-side contextual panel;
- assignment/switching mechanics;
- active chat vs ping distinction can map to paid/free/lead states;
- composer modes can support scripted stages.

Missing or worth adding:
- explicit `assigned to me` ownership state in UI and data contract;
- client paid/not-paid filter;
- client balance / payment state in right panel;
- internal notes tab distinct from flags;
- assistant tab for suggested answers by stage;
- client profile fields: birthday, partner, location/time, limits, coupons;
- compliance flags for prohibited topics and off-platform movement;
- schedule state feeding availability;
- KPI/pay screens if Confideline includes operator workforce cabinet.

Risk / caution:
- InsightOrba mixes consultation language with entertainment framing. Confideline should be careful with regulated advice areas: no diagnosis/treatment, no medical consultation, no confidential-data requests, and no external-channel migration.

## 5. Next Extraction Pass

Recommended if higher fidelity is needed:
- Re-run `faster-whisper small` only for key windows:
  - `01:04:20 - 01:28:00` rules and chat algorithm;
  - `02:25:00 - 02:45:00` platform demo;
- manually correct those transcript windows;
- turn the corrected text into detailed acceptance criteria for Confideline queue, assignment, notes, assistant, and profile panels.
