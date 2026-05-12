# InsightOrba day 2 part 1: chat handling, conversion rules, session workflow

Source video: `C:\GPT-local\input-videos\day2_part1.mp4` hardlink to the original file in Downloads.

Generated artifacts:
- Machine transcript draft: `day2_part1_fast.md`, `day2_part1_fast.json`, `day2_part1_fast.srt`, `day2_part1_fast.vtt`
- Visual frame index: `frames_index.csv`
- Contact sheets: `contact_sheets/contact_sheet_01.jpg` ... `contact_sheets/contact_sheet_05.jpg`
- Key frames: `frames/`

Note on accuracy: transcript is a fast local `faster-whisper tiny` draft. It is good enough for timing and topic detection, but exact wording is noisy. Conclusions below are based on transcript plus frame verification.

## 1. What Day 2 Part 1 Adds

This part is a practical training on chat handling. The trainer reads real or sample chats and explains:

- what a trial/free reading is;
- how a first chat differs from a returning client chat;
- how to collect mandatory information;
- how to create intrigue;
- how to convert into a paid/personal session;
- how to structure messages so they do not feel like a hard sell;
- why not to copy raw text from ChatGPT or external sources;
- how to work when the client disappears during a session;
- why online/offline status matters for revenue;
- what mistakes block conversion.

## 2. High-Level Timeline

| Timecode | Layer | What happens | Key frame / artifact |
|---|---|---|---|
| 00:00:00 - 00:02:10 | Day setup | Trainer announces day 2 focus: detailed reading of chats, difficult moments, handling client communication, and a test. | `contact_sheet_01.jpg` |
| 00:02:10 - 00:09:10 | Trial session explanation | Shows `PB expert` chat. Trial session is explained as a 5-minute mini demo of paid session and first impression of platform. | `frames/00-03-30_changed.jpg`, `frames/00-09-10_changed.jpg` |
| 00:11:10 - 00:15:50 | Mandatory information | Slide `Обязательная информация`: collect client/partner names and dates of birth. External resources may be used, but raw copying is prohibited. | `frames/00-11-10_changed.jpg`, `frames/00-13-50_changed.jpg` |
| 00:17:20 - 00:29:10 | Free reading scheme | Live chat and slide `Схема ведения фри ридинга`: greeting, mandatory info, positive reading, careful problem framing, intrigue, conversion. | `frames/00-25-20_periodic.jpg`, `frames/00-27-20_periodic.jpg` |
| 00:29:10 - 01:13:30 | Practice on live chat | Trainer explains that conversion is not a fixed number of messages. Need to adapt to the client and expand the free reading enough to build interest. | `contact_sheet_02.jpg`, `contact_sheet_03.jpg` |
| 01:13:30 - 02:16:50 | Long guided example | Multiple examples of relationship readings. Emphasis on empathy, soft language, avoiding hard certainty, compliment/support as tools, and translating complex thoughts clearly. | `contact_sheet_03.jpg`, `contact_sheet_04.jpg` |
| 02:17:40 - 02:22:00 | Pronouns / identity | Slide `Местоимение`: use the correct pronoun/gender; when uncertain, ask carefully or write neutrally. | `frames/02-17-40_changed.jpg`, `frames/02-20-00_periodic.jpg` |
| 02:23:30 - 02:35:30 | Session continuation | Live chat examples: even if client does not read/respond during session, the expert continues the paid session through to the end. | `frames/02-23-30_changed.jpg`, `frames/02-31-30_periodic.jpg` |
| 02:35:30 - 02:43:00 | Returning client rule | Returning client after previous paid session should not receive another free reading. Start with intrigue and invite to personal session. Missing `Book Now` button is called out as a mistake. | `frames/02-37-30_periodic.jpg`, `frames/02-38-40_changed.jpg` |
| 02:43:00 - 02:45:13 | Break | Trainer announces a short break and says recording continues. | `contact_sheet_05.jpg` |

## 3. Session Types And Client Entry

### 3.1 Trial Session

The first platform interaction can be a trial session:

- it has a 5-minute timer;
- it is described as a demo version of a paid session;
- it is the client's first impression of the platform;
- it appears at the top of the chat list;
- it has visible session/timer UI;
- notifications and sound are recommended so the operator does not miss it.

Business meaning:
- Trial is not just "free support"; it is a conversion funnel step.
- The worker must deliver enough value to create trust and interest, but not fully exhaust the question.

### 3.2 Other Free Dialogues

After first registration/trial, the client can still open a limited number of additional free dialogues with selected experts. Those are also conversion opportunities:

- client chooses an expert/avatar;
- operator answers when available;
- goal is still to convert to paid/personal session;
- once free access is exhausted, the client needs balance/top-up or paid session access.

### 3.3 Personal / Paid Session

Paid session:

- starts with a session indicator/timer;
- may be booked through `Book Now`;
- should be conducted from start to finish even if the client is not actively reading/responding;
- can produce material for the next conversion/continuation.

## 4. Free Reading Scheme

Visible slide and speech define a structured free reading:

1. Greeting / establishing contact.
2. Collect mandatory information.
3. Give a positive/supportive part.
4. Carefully show the problem or tension.
5. Create intrigue.
6. Offer to look deeper in a personal/paid session.

The trainer emphasizes that the number of messages is not fixed. The operator must adapt:

- some clients need more warmth before conversion;
- some clients react to positive framing;
- some clients need the problem made concrete;
- conversion can be about causes, solution, timeframes, feelings, next steps, or relationship dynamics.

Confideline implication:
- Conversation stage should not be a rigid wizard.
- It should be a state machine with flexible suggested actions:
  - `greeting`;
  - `dataCollection`;
  - `positiveReading`;
  - `problemFraming`;
  - `intrigue`;
  - `paidOffer`;
  - `paidSession`;
  - `followUp`.

## 5. Mandatory Data

From slides and discussion:

- client name;
- partner/target person's name;
- client date of birth;
- partner/target person's date of birth;
- clarify date format if ambiguous;
- when entering profile/card data, use the platform's required date format, not necessarily the client's US-style format.

Why it matters:
- expert/assistant needs the data for the reading;
- missing data makes the answer weaker;
- missing DOB is called out later as a mistake in a conversion example.

Product implication:
- Right panel should visibly show missing required fields.
- Composer/assistant should warn: "missing partner DOB" or "ask for date of birth before reading".

## 6. Use Of External Sources And AI

Allowed:
- external websites;
- tarot/card meanings;
- astrology/numerology resources;
- ChatGPT or similar tools as a source of ideas;
- online materials, if adapted.

Forbidden / risky:
- raw copy-paste from sites;
- raw copy-paste from ChatGPT;
- letting ChatGPT "talk instead of the agent";
- generic blocks that feel non-human.

Trainer's principle:
- use tools as idea sources, then rewrite in your own words and adapt to the specific client.
- platform wants live human communication, not automated pasted text.

Confideline implication:
- Assistant output should be treated as draft/hint, not auto-send.
- Add friction or QA around long pasted text if it looks generic.
- Keep audit metadata for AI-assisted replies if needed.

## 7. Conversion Logic

### 7.1 What To Convert On

The same client situation can be converted into many paid-session topics:

- causes of the problem;
- how to solve it;
- what the other person feels;
- what happens next;
- timeframes;
- relationship development;
- deeper analysis of a specific person;
- what the client should focus on internally.

This is important: conversion is not only "pay to continue"; it is a proposed deeper angle.

### 7.2 How To Convert

Good conversion:
- acknowledges the situation;
- shows the operator sees the client's problem;
- gives a small useful insight;
- creates a gap / intrigue;
- proposes a concrete deeper look;
- includes the booking action.

Bad conversion:
- too early;
- too generic;
- no specific topic;
- no `Book Now` button;
- no data collection;
- feels like pressure.

### 7.3 Returning Client Rule

Important rule from `02:37:41 - 02:42:57`:

- free reading is for first conversion into paid session;
- if client already had at least one paid session and returns later, do not do another full free reading;
- the client already has trust and disposition, otherwise they would not return;
- start with intrigue and invite to a personal session;
- ask missing key data if needed;
- use `Book Now`.

Confideline implication:
- Need `hasPreviousPaidSession` / `paidSessionCount` in the conversation context.
- Assistant should switch strategy for returning clients.
- "free value" allowance should depend on history.

## 8. Conducting A Paid Session

Important operational rule:

- If the paid session is running, conduct it from beginning to end even if the client is silent, absent, or not reading.
- The client may return later and read it.
- Some clients intentionally book time, send questions, then read the completed answer later.
- Silence is not a reason to stop the paid session.

Product implication:
- Session timer and delivery state are separate from client read/online state.
- The UI should show read status, but not encourage stopping the session.
- Follow-up suggestions can be generated after the session.

## 9. Online / Offline Status

Critical rule from the final block:

- start shift: set online;
- go on break: set offline;
- return from break: set online;
- end shift: set offline.

Why:
- if client writes while operator is offline, client receives an automatic message that the expert is not available;
- if operator forgets to set online, new urgent clients may leave and book another expert;
- online status directly affects conversion and revenue.

Confideline implication:
- Availability should be highly visible and hard to forget.
- Shift start/break/end should be explicit events.
- Queue routing should respect online state.
- System message sent to client should be traceable in the internal thread.

## 10. Pronouns / Identity / Personalization

The slide around `02:17:40` focuses on pronouns:

- if the target person's gender/pronoun is unclear, clarify or phrase neutrally;
- avoid obvious gender mistakes;
- personalize language to the client's data.

Broader rule:
- The reading should feel personally composed, not template-like.

## 11. UI Observations

### 11.1 Chat Workspace

The same cabinet from day 1 appears:

- left queue;
- central chat;
- right `Info` panel;
- `History` on right side;
- client/partner data;
- `Limits`, `Chat info`, `User info`, `Coupons`;
- teal outgoing messages;
- gray incoming messages;
- session banners/status text;
- `Book Now` / coupon/review actions.

### 11.2 Required State In UI

For Confideline, the visible UI and training imply these needed states:

- `trialSessionActive`;
- `paidSessionActive`;
- `sessionTimer`;
- `clientReadStatus`;
- `clientAbsentOrSilent`;
- `missingRequiredData`;
- `previousPaidSessionExists`;
- `bookNowOffered`;
- `operatorOnline`;
- `operatorOnBreak`;
- `systemAutoReplySent`.

## 12. Rules / Regламент Summary

- Treat trial session as first impression and conversion opportunity.
- Always greet warmly, even if auto-greeting exists.
- Collect mandatory names and dates before detailed reading.
- Clarify ambiguous date formats.
- Use external resources only as support; never paste raw text.
- Build free reading with positive part, problem framing, intrigue, and paid offer.
- Adapt number and length of messages to client reaction.
- Do not promise certainty or give hard life instructions.
- Use compliments/support when appropriate.
- Use correct pronouns; if uncertain, ask or phrase neutrally.
- During paid session, continue even if client does not respond/read.
- Returning paid clients do not get another full free reading; move to intrigue and paid session.
- Always include the actual booking action when inviting to session.
- Keep online/offline status correct during shift, breaks, and end of work.

## 13. Confideline Mapping

This video is most relevant to:

- composer mode and assistant hints;
- paid/free session lifecycle;
- queue/session state;
- right-panel required data;
- online/break/offline workflow;
- system messages;
- conversion prompts.

Suggested data contract additions:

- `session.type`: `trial`, `freeChat`, `paid`;
- `session.status`: `pending`, `active`, `completed`, `missed`, `clientAbsent`;
- `session.timerEndsAt`;
- `client.hasPreviousPaidSession`;
- `conversation.stage`;
- `conversation.requiredDataMissing`;
- `offer.bookNowShown`;
- `operator.availability`: `online`, `break`, `offline`;
- `message.readState`: `sent`, `delivered`, `read`;
- `assistant.nextConversionAngles`;
- `assistant.missingDataQuestions`.

Suggested product behavior:

- show a persistent online/offline toggle with shift-state warnings;
- highlight trial sessions at top of queue;
- show session timer and type in the thread;
- warn if trying to convert without `Book Now`;
- warn if reading is attempted without required DOB/name data;
- switch assistant strategy when the client has previous paid sessions;
- keep system offline auto-replies visible in internal history.
