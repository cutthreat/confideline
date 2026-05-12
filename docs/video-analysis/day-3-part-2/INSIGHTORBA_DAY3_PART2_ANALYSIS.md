# InsightOrba day 3 part 2: supervised practice, live cabinet workflow, hiring signals

Source video: `C:\GPT-local\input-videos\day3_part2.mp4` hardlink to the original file in Downloads.

Generated artifacts:
- Machine transcript draft: `day3_part2_fast.md`, `day3_part2_fast.json`, `day3_part2_fast.srt`, `day3_part2_fast.vtt`
- Visual frame index: `frames_index.csv`
- Contact sheets: `contact_sheets/contact_sheet_01.jpg` ... `contact_sheets/contact_sheet_13.jpg`
- Key frames: `frames/`

Note on accuracy: transcript is a fast local `faster-whisper tiny` draft. It is good enough for timing and topic detection, but exact wording is noisy. Conclusions below are based on transcript plus frame verification.

## 1. What Day 3 Part 2 Adds

This part is a long supervised practice session. Unlike the previous theoretical blocks, the trainer watches trainees work in the real `PB expert` cabinet and corrects them live.

It adds practical rules for:

- first login/browser setup;
- schedule setup before work;
- `I'm Online`/availability mode;
- assigning chats before writing;
- reading client profile and previous data;
- using translator/original language;
- using emojis/gifs and simple human tone;
- checking client status before mentioning coupons or discounts;
- building `Book Now` topics from unresolved client questions;
- handling replies after `Book Now` as objections;
- deciding when to ask clarifying questions;
- not over-answering for free;
- using mentor chat during practice;
- understanding how trainees are evaluated after practice.

Main product takeaway: this is a mentor-supervised sales workflow. The UI needs stage control, assignment locking, availability state, profile completeness, offer state, objection state, mentor review, and performance tracking.

## 2. High-Level Timeline

| Timecode | Layer | What happens | Key frame / artifact |
|---|---|---|---|
| 00:00:00 - 00:03:10 | Setup | Trainer asks trainee to share screen, use Chrome, log in, and prepare the account. Chrome is recommended because the site works better there. | `contact_sheet_01.jpg` |
| 00:03:10 - 00:05:45 | Schedule and online mode | Shows `My Schedule`; trainee sets work time. Trainer explains `I'm Online`: clients see expert online and chats arrive faster; work time is counted from message activity. | `frames/00-03-00_changed.jpg`, `contact_sheet_01.jpg` |
| 00:05:45 - 00:12:30 | First live chat | Trainer instructs to assign the chat, analyze request, greet, use client facts, and begin with emotion. | `frames/00-06-00_periodic.jpg`, `frames/00-09-00_periodic.jpg` |
| 00:12:30 - 00:25:30 | Building first free reading | Mentor guides message-by-message: emotional state, current relationship, hidden issue, intrigue, `Book Now` topics, urgency/benefit wording. | `contact_sheet_01.jpg` |
| 00:25:30 - 00:32:30 | Status, timer, free chat rules | Trainer clarifies: no free-session timer in this work mode; status matters for discounts/coupons; standard client differs from paid/VIP-like clients. | `contact_sheet_01.jpg`, `contact_sheet_02.jpg` |
| 00:32:30 - 01:15:00 | Multiple trainee chats | Trainees work through several chats: missing data, asking for name/DOB, using photos/cards, avoiding unnecessary waiting, balancing free value and intrigue. | `contact_sheet_02.jpg` |
| 01:15:00 - 01:23:00 | Schedule/browser/system issues | Screen sharing and account/schedule views; trainer helps with technical setup and warns about using the right account/browser. | `contact_sheet_03.jpg` |
| 01:23:00 - 02:24:00 | Live chat practice | Many real conversations are handled. Trainer corrects wording, asks operators to use profile facts, do not over-answer, and move toward `Book Now`. | `contact_sheet_03.jpg` ... `contact_sheet_06.jpg` |
| 02:24:00 - 03:21:00 | Objections and continued practice | Work with "no money", "ok", follow-up questions, unclear prompts, and clients continuing after the CTA. Repeated `Book Now` modals appear. | `contact_sheet_07.jpg` ... `contact_sheet_09.jpg` |
| 03:21:00 - 04:12:30 | More live corrections | Trainer reviews additional messages, tells trainees when to ask for clarification, when to stop answering, and how to frame timing/uncertainty. | `contact_sheet_09.jpg` ... `contact_sheet_12.jpg` |
| 04:12:30 - 04:43:00 | Final practice block | More questions from trainees; mentor sends examples/materials, corrects `Book Now`, and repeats that every message after `Book Now` is an objection. | `contact_sheet_12.jpg`, `contact_sheet_13.jpg` |
| 04:43:00 - 04:56:00 | Debrief and hiring criteria | Trainer says first day is not a full indicator, explains future schedule, breaks, evaluation criteria, sales expectations, and final call/group communication. | `contact_sheet_13.jpg` |

## 3. Setup And Technical Rules

The trainer starts by making the trainee use Chrome and share the browser screen.

Rules:

- work should be done in Google Chrome;
- other browsers may have technical problems with the site;
- trainee must use the correct account credentials;
- screen sharing is required during supervised practice;
- mentor needs to see what the trainee clicks and writes;
- if screen/device issues occur, trainer guides setup live.

Confideline implication:
- Training mode should show `browserSupported`, `accountConnected`, `screenShareActive`, and `mentorConnected`.
- If this becomes an internal workflow, practice sessions should have a technical readiness checklist before chat work starts.

## 4. Schedule And Availability

At the start, the trainer opens `My Schedule`.

Observed rules:

- before work, the expert sets working time in `My Schedule`;
- trainee selects the working day/time range;
- `I'm Online` must be enabled from chat view;
- `I'm Online` helps clients see the expert online and makes chats come faster;
- if `I'm Online` is off but the operator writes messages, working time is still counted;
- message sending/activity is important for time accounting;
- later, when fully working, operators can choose their own breaks and schedules more flexibly.

Confideline mapping:

```json
{
  "operator": {
    "scheduleSet": true,
    "availabilityState": "online",
    "screenShareActive": true,
    "workTimeCountingMode": "messageActivity"
  }
}
```

UI implication:
- Availability should not be a decorative toggle. It affects visibility, chat flow, and training quality.
- If schedule is missing, the workspace should show a blocking warning before practice starts.

## 5. Assignment Before Writing

Trainer repeatedly instructs trainees to assign a chat before writing.

Meaning:

- before answering, click assignment / `Assign to me`;
- once assigned, the chat becomes the trainee's responsibility for that expert;
- other colleagues do not work the same assigned chat in normal view;
- during screen share, others can still observe;
- if trainee does not assign quickly, someone else may take the chat.

Practical "catching chat" rule:
- In `All users` or the incoming list, click the chat quickly.
- When it loads, keep the cursor near the assignment action and claim it immediately.
- Slow reaction can lose the chat to another operator.

Confideline implication:
- `assignmentLocked` should be explicit.
- Incoming chats need a visible race/claim state.
- A mentor view should show whether trainee claimed the chat before composing.

## 6. First Message And Human Tone

The trainer emphasizes a natural greeting and simple warmth:

- thank the client for coming;
- say they did not come by accident or "not randomly" if it fits the persona;
- keep language close to the client;
- use emojis lightly;
- emojis/gifs can be inserted from browser/OS menu;
- first message can be in Russian because translator/original rendering handles client-side text after translation.

Important:
- Human tone matters. The platform is not just prediction; it is emotional support and relationship-building.
- The expert should not sound mechanical, even when following a script.

## 7. Reading Client Profile And Previous Context

The mentor constantly compares the current chat with profile/sidebar data:

- client name;
- partner name;
- DOBs;
- gender;
- location;
- previous form data;
- previous paid status;
- status labels;
- whether the client is standard/new/paid-before;
- whether coupons are available;
- last payment or purchase history when visible.

Rules:

- do not use hidden profile facts as if the client told them in this chat;
- use profile data to understand context and ask smarter questions;
- if the client asks neutrally but profile shows gender/context, infer carefully;
- if data is missing, ask for it;
- if the question is unclear, ask the client to rephrase or specify.

Confideline implication:
- Right panel should distinguish "visible in current chat" from "known profile context".
- Suggested replies should not expose hidden profile facts in a way that breaks trust.
- Add `dataSource` metadata for facts used in suggestions.

## 8. Free Reading In Practice

The mentor guides trainees through the day-3-part-1 structure live:

1. Analyze the client request.
2. Check whether data is enough.
3. Start with the client's emotional state.
4. Give 2-4 substantive insights.
5. Use the client's facts and original question.
6. Do not reveal everything.
7. Create intrigue.
8. Build a `Book Now` message with several topics.

Live correction examples:

- "Start with how she feels."
- "You revealed that topic; now choose another hook."
- "Do not wait for the client if you already have the question and data."
- "This is not a prediction; it is just setup."
- "Do not give too much in one free message."
- "Good `Book Now`, rich message."

For Confideline:
- The composer can show a free-reading checklist.
- A mentor or AI assistant can count "substantive insight" messages versus filler.
- Suggested next action should be stage-aware: `empathy`, `insight`, `intrigue`, `bookNow`, `objection`.

## 9. `Book Now` Construction

The training repeatedly shows the `Book Now` modal.

Rules:

- write the `Book Now` text outside or in a reply area first if you need to review the chat;
- include multiple session topics;
- topics should come from unresolved original questions;
- use benefit and urgency;
- mention clarity, truth, timing, what to expect, and how to act;
- do not add discounts before checking client status;
- if client is standard and has no coupon, do not promise a discount;
- coupons/status are handled after or separately, not inside the first CTA unless valid.

Potential `Book Now` topic sources:

- why a person distanced;
- what they feel;
- what will happen next;
- how another person affects the situation;
- how the situation affects a child/family;
- what timeframe is possible;
- what the client can do to influence outcome.

Confideline mapping:

```json
{
  "offer": {
    "bookNowShown": true,
    "topics": [
      "whyPartnerDistanced",
      "partnerFeelings",
      "nextEvents",
      "clientAction",
      "timeframe"
    ],
    "couponEligible": false,
    "statusChecked": true
  }
}
```

## 10. Objections During Practice

A key repeated rule appears near the end and throughout practice:

Any message from the client after `Book Now` is treated as an objection.

This includes:

- "ok";
- "thanks";
- "I will think";
- "I have no money";
- "I will come later";
- "one more question";
- "what should I do?";
- "can you answer this without session?"

Mentor guidance:

- do not keep answering freely after CTA;
- use objection handling tools from the previous lesson;
- mirror, raise value, add urgency, or show benefit;
- if the client asks a new question, convert it into a session hook;
- if client says they will come tomorrow or later, acknowledge and keep them oriented to booking;
- if there is a concrete date/promise, note it.

Confideline implication:
- Once `bookNowShown = true`, inbound messages should be classified as `objection`.
- Composer should switch to objection mode automatically.
- Limit repeated free answers after CTA.

## 11. Clarifying Questions

The mentor allows and encourages clarification when:

- client question is incomprehensible;
- translator/original text is unclear;
- missing name/DOB;
- unclear who is client and who is partner;
- client asks about "future" without specifying area;
- profile context and message conflict.

But:

- do not use clarification to avoid working when there is already enough context;
- do not ask unnecessary questions after the client has given all required data;
- do not stall when the client is waiting.

Suggested product state:

```json
{
  "request": {
    "clarity": "unclear",
    "missingFields": ["partnerName", "partnerDob"],
    "nextAction": "askClarifyingQuestion"
  }
}
```

## 12. Timer And Session Priority

The trainer clarifies there is no free-session timer in this practice/free-chat work mode.

Rules:

- no visible free timer pressures the expert in this mode;
- if a paid session starts, paid session becomes priority;
- when session is active, drop lower-priority free chats and handle paid session;
- if client buys 10 minutes or another package, paid session state should change the workflow.

Confideline implication:
- Need clear `session.status`: `none`, `freeChat`, `paidActive`, `paidBooked`, `expired`.
- Paid active state should visually override free queue priority.
- If an operator is handling free chats and paid session arrives, UI should alert and shift focus.

## 13. Multi-Client And Queue Discipline

The recording shows constant switching across many clients.

Observed behavior:

- trainee may have multiple active chats;
- mentor tells them not to wait passively for one client;
- if client is typing, operator can review or handle another chat;
- if a chat is assigned but client is not responding, continue with another workable chat;
- left list and status labels are operationally central.

For Confideline:
- Queue should show which chats are `assigned`, `waitingForOperator`, `waitingForClient`, `paidActive`, `bookNowSent`, `objectionPending`.
- Conversation switcher should preserve stage and offer state.

## 14. Mentor Supervision

This part strongly shows mentor-as-co-pilot:

- mentor watches screen;
- answers trainee questions;
- suggests exact phrasing;
- corrects over-answering;
- corrects gender/name mistakes;
- points out missing status checks;
- praises good `Book Now`;
- explains when a trainee's message is too much or too little;
- sends example chats/materials in Telegram for inspiration.

Training workflow implication:
- A mentor dashboard should support live observation, comments, scorecards, and example links.
- It should be possible to review each trainee's message history after practice.

## 15. Private Notes And Promised Returns

The previous part introduced notes; here practice confirms why they matter.

Use cases:

- client says salary will arrive on a specific day;
- client promises to come tomorrow;
- client is paid-before and likely to return;
- operator needs to remember personal details;
- mentor wants trainee to follow up later.

Confideline implication:
- Notes should support structured follow-up fields:

```json
{
  "followUp": {
    "promisedReturnDate": "ISO_DATE",
    "reason": "salaryLater",
    "sourceMessageId": "message_id",
    "nextReminderAt": "ISO_DATE"
  }
}
```

## 16. Final Debrief And Hiring Signals

At the end, the trainer explains that first practice day is not a full indicator.

Evaluation factors mentioned:

- how trainee listens and absorbs information;
- how they conduct chats;
- whether they correct mistakes after feedback;
- whether they show up on time for shifts;
- ability to work through power/internet issues;
- activity and involvement during training;
- sales effectiveness;
- daily sales expectation, roughly in the range of 5-7 sales/day for stable work, with exact phrasing noisy in transcript;
- first day can be difficult and not representative;
- second/full day may improve because earlier free chats can start returning.

Operational model:
- Hiring is not based on one chat.
- Mentor looks for learning speed, reliability, resilience, and sales output.
- Technical readiness matters because work depends on long online shifts.

## 17. Suggested Contract Additions For Confideline

```json
{
  "training": {
    "mode": "supervisedPractice",
    "mentorId": "mentor_id",
    "screenShareActive": true,
    "practiceDay": 1,
    "mentorFeedbackCount": 0
  },
  "operator": {
    "scheduleSet": true,
    "availabilityState": "online",
    "powerInternetRisk": "unknown",
    "shiftPunctuality": "onTime"
  },
  "conversation": {
    "assignedOperatorId": "operator_id",
    "assignmentLocked": true,
    "stage": "freeReading",
    "dataCompleteness": "complete",
    "requestClarity": "clear",
    "bookNowShown": false,
    "objectionPending": false,
    "paidSessionPriority": false
  },
  "offer": {
    "statusChecked": false,
    "couponEligible": false,
    "topicsCount": 0,
    "shownAt": null
  },
  "qualitySignals": {
    "usedHiddenProfileFactRisk": false,
    "overAnsweredForFree": false,
    "missingClarification": false,
    "genderNameMismatch": false,
    "softCtaWarning": false
  }
}
```

Suggested UI actions:

- `Set schedule`
- `Go online`
- `Assign to me`
- `Ask missing data`
- `Send holding phrase`
- `Mark insight`
- `Build Book Now`
- `Check coupon eligibility`
- `Classify objection`
- `Add promised return`
- `Request mentor review`

## 18. Product Takeaway

Day 3 part 2 shows the operational reality behind the competitor's cabinet:

- operator work is fast, multi-chat, and mentor-supervised;
- the right panel must be actively used before writing;
- assignment and availability are core business mechanics;
- `Book Now` changes the conversation state;
- every post-CTA client message should be handled as objection or follow-up;
- practice quality is judged by learning speed, reliability, and sales outcomes.

For Confideline, this supports adding an explicit "expert workflow layer" over the current chat workspace: schedule, online state, assignment lock, profile-aware composer, free-reading checklist, `Book Now` state, objection mode, structured notes, and mentor review.
