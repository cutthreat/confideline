# Insightorba competitor training: Day 4, Part 2

Source video: `C:\Users\user\Downloads\Копия День_4_часть_2.mp4`

Local working copy: `C:\GPT-local\input-videos\day4_part2.mp4`

Artifacts:
- Transcript: `C:\GPT-local\confideline\docs\video-analysis\day-4-part-2\day4_part2_fast.md`
- Segments JSON: `C:\GPT-local\confideline\docs\video-analysis\day-4-part-2\day4_part2_fast.json`
- Subtitles: `C:\GPT-local\confideline\docs\video-analysis\day-4-part-2\day4_part2_fast.srt`
- Frame index: `C:\GPT-local\confideline\docs\video-analysis\day-4-part-2\frames_index.csv`
- Contact sheets: `C:\GPT-local\confideline\docs\video-analysis\day-4-part-2\contact_sheets`

Note: transcript quality is noisy because this is live Zoom practice with Russian/Ukrainian speech, browser audio, and many client names. The analysis below combines transcript review with frame/contact-sheet verification.

## Summary

Day 4 Part 2 continues the second half of the practical shift. The training is less about new screen mechanics and more about operational control:
- mentor reviews trainees through screen share;
- trainees work real/pseudo-real chats from the queue and direct mentor links;
- trainer corrects phrasing live;
- Book Now is treated as a conversion state with a limited number of follow-up attempts;
- technical client issues are redirected to support;
- self-harm or extreme emotional risk has a special safety script;
- experts are reminded not to give timeframes, predictions, or session-level value for free;
- end-of-day dashboard screenshots are collected for hours, efficiency, sessions, and internship tracking.

The major new product implication is that the cabinet needs explicit quality and compliance states, not only chat states. The operator needs help recognizing technical escalation, self-harm risk, free-value leakage, post-Book Now objection mode, and end-of-shift reporting.

## Timeline

| Timecode | Topic | Business / product meaning |
|---|---|---|
| 00:00-00:02 | Return after lunch, mentor review | Trainer resumes, asks trainees to show chats/screen share, and starts checking what was written. |
| 00:02-00:04 | Three-attempt rule | If the expert has already "fought" an objection three times, the trainer does not return the chat for more attempts. This reinforces a finite post-offer attempt count. |
| 00:03-00:06 | Technical issues | If the client has a technical/account/payment restriction issue, expert sends them to support. Expert is not technical support and waits for the client after the issue is resolved. |
| 00:25-00:32 | Previous chat history | If the expert takes a chat with prior correspondence, they still should do their own free reading. The trainee is evaluated on their own handling, not on what a previous expert wrote. |
| 00:33-00:35 | Self-harm / suicidal content | Trainer says to respond supportively and positively first, then use hotline/help resources if the client continues talking about suicide/self-harm. This is a separate escalation scenario. |
| 00:35-00:36 | Free limits | Do not reveal exact timelines for free, for example "when will we divorce". Keep detailed/time-based answers for paid session. |
| 00:40-00:41 | Internship hour plan | Four practice days should ideally total about 32 hours. Missing time can be completed on Monday/Tuesday if needed. |
| 00:42-00:45 | Returning client / paid session | Trainer discusses how to close or continue after a client was invited to a paid session and then stopped. If a client does not pay after a period, continue with objection handling. |
| 00:51-00:58 | Peer learning | Trainer recommends sitting with experienced friends/colleagues after the shift, watching their screen, reading their chats, and learning their structures. |
| 01:03-01:06 | Book Now / objections | After the first Book Now, the expert should handle objections instead of continuing free answers. Trainer repeats that there are objections "without button" too. |
| 01:03-01:28 | Metaphorical cards | Cards/images can be used as visual prompts and to explain possible scenarios. Expert should describe what they see and connect it to the client's situation. |
| 01:39-01:41 | Card usage limit | When sending a card/image, do not over-explain the picture if the client can see it. Use it to support the message, not to replace the reading. |
| 02:04-02:05 | Promise only paid value | Trainer clarifies that the expert can promise deeper help/session-level work only when the client pays. |
| 02:10-02:14 | Pulling toward session | When a client is worried or asks complex questions, guide them toward session by framing what can be unpacked there. |
| 02:31-02:33 | Prepared intrigue blocks | Trainer plans to make templates for intrigue: what can be revealed in session and how to hook the client without giving everything away. |
| 02:37-02:39 | "When you are ready" objection | If client says they will come later but gives no time, expert should keep the door open and stress that earlier session means earlier clarity/progress. |
| 02:42-02:44 | Too much free value | Trainer says a client who keeps asking for more is already receiving too much. The expert should stop and move to paid continuation. |
| 02:44-02:46 | Wrong / not exact reading | Trainer normalizes occasional misses but warns that repeated misses undermine trust. Expert should avoid adding too many unsupported details. |
| 02:56-03:05 | Health/body/pregnancy themes | For physical symptoms or pregnancy-like questions, expert can frame energetically but should recommend physical checking rather than making medical claims. |
| 03:21-03:30 | Unanswered cleanup | Trainer again asks trainees to check unanswered/unfinished chats before leaving so the day can close cleanly. |
| 03:45-03:51 | Rituals / paid add-ons | Trainer discusses "ritual" requests and reframes them as advice/help that can be discussed in session. Avoid claiming harmful ritual work. |
| 03:52-03:58 | Dashboard review | Visual and transcript review show dashboard/statistics review. Trainer asks for dashboard screenshots and checks efficiency, hours, sessions, and today/yesterday metrics. |
| 03:54-03:57 | Performance thresholds | Trainer references efficiency around 10% as an ideal target and says low efficiency is not automatically failure if chat quality is good. Work hours around 7:47-8:00 are treated as good for a full day. |
| 03:57-03:59 | Daily reporting | Trainees must send dashboard screenshots privately every day. Mentor reviews hours and gaps. |
| 03:59-04:01 | Bonus logic | Internship bonus is not regular sales bonus. After hiring, bonus is monthly, not daily, and is tied to monthly result/minutes. |
| 04:03-04:06 | End of day | Trainer normalizes weak first-day numbers, gives motivational examples, and closes the day. |

## Reconstructed regulations

### 1. Technical issues are not handled by the expert

If a client has a platform/account/payment restriction problem, the expert should:
- tell the client to contact support;
- not try to solve technical issues in chat;
- say they will wait after the issue is resolved;
- keep the emotional tone warm, but not take over support responsibility.

Product implication: the UI needs a quick support-escalation action and a clear `technicalIssue` state.

### 2. Three-attempt limit after offer

The trainer repeats that if the expert has already handled the objection about three times, it can be left. The exact wording is noisy, but the business rule is consistent with prior videos:
- first Book Now changes the mode;
- further client messages are objections, even if no new button is sent;
- expert should not keep giving free readings;
- after several attempts, stop pushing and leave the door open.

Product implication: track `objectionAttemptCount`, `lastBookNowAt`, and `postBookNowMode`.

### 3. Prior chat history does not remove the free-reading requirement

When taking over a chat with previous correspondence, trainee still gives their own free reading. Reason:
- prior expert may not have interested the client;
- current expert is evaluated on their own work;
- history can be used for context, but should not replace the current response.

Product implication: transferred chats need visible history, but also a new-expert checklist.

### 4. Self-harm / suicide risk is a separate escalation path

Trainer describes a "very rare" situation where a client mentions being beaten, suicidal thoughts, or extreme crisis. The rule:
- start with support and calming tone;
- avoid escalating the emotional pressure;
- if the client continues, send hotline/help resources;
- involve support when needed;
- expert should not present themselves as emergency help.

Product implication: add `risk.selfHarm` and a prepared safety response/hotline block. This should be separate from sales scripts.

### 5. Do not reveal high-value specifics for free

Examples in this video:
- exact divorce timing;
- detailed future/prediction windows;
- full explanation of hidden facts;
- complex session-level analysis;
- too many follow-up answers after the client is already interested.

Regulation: free reading should create trust and intrigue, then move to session.

### 6. Internship is tracked by hours and dashboard

The trainer says four days should ideally total about 32 hours. Missing hours may be completed later. At end of day:
- trainee sends dashboard screenshot privately;
- mentor reviews hours;
- mentor reviews efficiency;
- mentor reviews session/sales count;
- mentor considers chat quality, not only raw metrics.

Important observed thresholds/targets:
- full-day hours around 7:47-8:00 are treated as good;
- 5 or 4 hours for a full day means too much time "fell out";
- efficiency around 10% is described as an ideal direction;
- under 5% efficiency is not automatically disqualifying if chats are strong;
- 4-5 sessions/day is described as realistic;
- strict 9-to-6 work requires stronger performance, mentioned as "15+" in the transcript, but the exact metric is noisy.

### 7. Peer learning is encouraged

Trainer recommends:
- sit with experienced people after the shift;
- watch their screen;
- read their chats;
- ask them to share chats/examples;
- learn their structures and phrasing.

Product implication: training mode could include anonymized exemplary chats, mentor-reviewed examples, and a "reading base".

### 8. Metaphorical cards and visuals are allowed

The video shows repeated use of cards/images:
- as a visual prompt;
- as a way to explain possible scenarios;
- as a trust and interest builder;
- as an additional hook before paid session.

Rules:
- do not over-explain what the image already shows;
- connect the image to the client situation;
- avoid inappropriate or confusing visuals;
- do not let the image replace the expert's actual interpretation.

### 9. Sensitive themes need boundaries

Trainer covers or implies boundaries for:
- technical problems: support;
- suicide/self-harm: support plus hotline/help resources;
- physical symptoms/pregnancy: suggest real checking, do not make medical claims;
- rituals: avoid claiming harmful rituals; reframe as advice/help/session work;
- exact timelines: do not give them for free.

For Confideline this means the assistant/hints layer should be compliance-aware.

## Cabinet / UI observations

| UI area | Observed / inferred behavior |
|---|---|
| Chat queue | Same multi-client list with assigned/unassigned users, unread markers, and paid/not-paid state labels. |
| Right client panel | Shows info such as partner, limits, chat info, user info, coupons. This remains central for eligibility and context. |
| Book Now modal | Visible repeatedly in frames. It can be opened over the chat and confirms the offer state. |
| Message composer | Used for live free reading, objection handling, and copied/adapted structures. |
| Dashboard | Visible at 03:52-04:02. Shows `My profile`, top money/stat cards, Today/Yesterday cards, left navigation: Dashboard, Statistic, Transactions, Settings. |
| Statistics / performance | Trainer uses dashboard screenshots to evaluate hours, efficiency, sessions, and daily progress. |
| External materials | Zoom chat / messenger is used for links, materials, and dashboard screenshot submission. |

## Suggested Confideline contract additions

```json
{
  "conversation": {
    "source": "queue|folder|mentor-link|handoff",
    "hasPreviousHistory": true,
    "newExpertRequiresFreeReading": true,
    "stage": "free-reading|book-now|objection|paid-session|follow-up|support-escalation|safety-risk",
    "lastBookNowAt": "datetime|null",
    "objectionAttemptCount": 0,
    "freeValueLimitReached": false
  },
  "clientRisk": {
    "technicalIssue": false,
    "selfHarmRisk": false,
    "medicalClaimRisk": false,
    "ritualClaimRisk": false,
    "hotlineBlockShown": false,
    "supportEscalated": false
  },
  "offer": {
    "bookNowShown": true,
    "postBookNowMode": true,
    "couponEligible": true,
    "discountPercent": 50,
    "clientSaidLater": false,
    "nextNudgeAllowedAt": "datetime|null"
  },
  "training": {
    "internshipRequiredHours": 32,
    "dashboardScreenshotRequired": true,
    "dashboardScreenshotReceived": false,
    "mentorReviewRequired": true,
    "peerLearningRecommended": true
  },
  "performance": {
    "countedHoursToday": 0,
    "efficiencyPercent": 0,
    "sessionsToday": 0,
    "salesToday": 0,
    "monthlyMinutes": 0,
    "monthlyBonusEligible": false
  },
  "qualitySignals": {
    "gaveExactTimelineForFree": false,
    "overAnsweredAfterBookNow": false,
    "tooManyUnsupportedDetails": false,
    "missedSupportEscalation": false,
    "missedSafetyEscalation": false,
    "visualCardUsed": false
  }
}
```

## Mapping to admin chat workspace v2

Current workspace v2 mechanics can absorb this video's logic well:
- queue state payload should include `stage`, `source`, `supportEscalated`, `risk` and `offer` metadata;
- pings should distinguish ordinary unread messages from paid-session urgency, support escalation, and safety-risk escalation;
- right panel can host client risk, coupon eligibility, prior-history summary, and Book Now state;
- composer should know whether it is in free-reading, post-Book Now objection, safety response, or support-escalation mode;
- dashboard/statistics should become a first-class training/admin surface, not only profile decoration.

High-priority additions for the mock/workspace:
- `technicalIssue` flag with support handoff action;
- `selfHarmRisk` flag with protected response templates;
- `objectionAttemptCount` after Book Now;
- `freeValueLimitReached` warning;
- `dashboardScreenshotRequired` / mentor review state;
- performance cards for counted hours, efficiency, sessions, and monthly minutes.

## Main takeaway

Day 4 Part 2 confirms that the competitor workspace is managed as a supervised sales/support shift. The chat itself is only one layer. The real operating system includes:
- mentor monitoring;
- compliance boundaries;
- conversion attempt limits;
- dashboard reporting;
- internship hour accounting;
- quality evaluation of actual chat handling;
- monthly bonus/performance logic.

For Confideline, the most useful next abstraction is a `conversation.stage + risk + offer + performance` model. That gives the interface enough context to show the correct hints, warnings, right-panel state, and supervisor view.
