# InsightOrba Training Video Analysis: Day 7, Part 2

Source video: `C:\Users\user\Downloads\Копия День_7_часть_2.mp4`

Local working copy: `C:\GPT-local\input-videos\day7_part2.mp4`

Video profile:
- Duration: `02:31:22.567`
- Video: H.264, 1920x1080, ~30 fps
- Audio: AAC, 48 kHz, stereo

Artifacts:
- Transcript JSON/Markdown/SRT/VTT: `C:\GPT-local\confideline\docs\video-analysis\day-7-part-2\day7_part2_fast.*`
- Frame index: `C:\GPT-local\confideline\docs\video-analysis\day-7-part-2\frames_index.csv`
- Contact sheets: `C:\GPT-local\confideline\docs\video-analysis\day-7-part-2\contact_sheets\`

Note: several transcript blocks are noisy, but the repeated trainer corrections and screen frames make the workflow clear.

## Executive Summary

Day 7 Part 2 is the closing practical block of the training week. The trainer continues live supervision in the cabinet and then gives final instructions for trainees who need to finish hours, fill the questionnaire, set tomorrow's schedule, and prepare for the Wednesday call.

Main operational additions:
- do not give extra information between two paid sessions, even if there are 5-7 minutes before the next paid slot;
- if a client books a future session, the expert must not start revealing paid content immediately;
- expensive-price objections should be handled by increasing perceived expert value, not discounting randomly;
- "free chat" expires and should be stated clearly when the client tries to restart it;
- after a lift/reactivation is started, stop adding new intrigue and push to `Book Now`;
- experts can choose their own style path: cards, psychology, stars, or other framing, but it must convert and fit the platform persona;
- final training closure depends on schedule, questionnaire, dashboard hours, and communication in private chat.

## Timeline And Findings

### 00:01:05-00:05:01 - Paid Session Time Management

The trainer reviews a case where a trainee did not have enough time to finish the promised content before the session ended.

Rule:
- if two questions are already inside the paid scope, answer them compactly in one message;
- do not spend too much time on extra explanation;
- after answering the paid questions, move toward booking again if there is a natural continuation.

The trainee explains they were not silent; they were writing. The trainer accepts this but still points out that the answer could have been more concise.

Product implication: paid session QA should track not only silence but also whether the promised themes were covered efficiently before timer end.

### 00:06:00-00:11:27 - Hidden Objection

The trainer identifies a client's behavior as a hidden objection. Even if the client does not explicitly say "I object", the expert should treat hesitation, repeated questions, or avoidance as objection handling.

This extends the objection model:
- explicit objection;
- hidden objection;
- free-information fishing;
- post-Book-Now hesitation.

### 00:20:09-00:28:40 - Document / Emergency Case Structure

The trainer gives a structure for a client anxious about emergency transfer, family placement, documents, consent/refusal, or bureaucratic approval.

Suggested response structure:
1. First message: validate the client's emotions.
2. Second message: explain the situation through the reading structure.
3. Mention unstable energy or negative influence around approval/delay.
4. Move toward a paid session for details.

This is similar to previous legal/document-delay cases: give emotional grounding and a cautious signal, but do not guarantee outcomes.

### 00:28:40-00:32:01 - Expensive Price Objection

A client objects to price, comparing the session cost to a cheaper amount. The trainer's suggested angle is not to apologize for the price but to raise perceived value:

- the expert is a strong specialist;
- they possess tools/knowledge others do not;
- the price is justified by the depth and value of the reading.

This should be modeled as a `price_objection` with a value-reframing response, not a coupon response by default.

### 00:33:16-00:35:43 - Do Not Give Paid Content Before Future Session

Important case: a client buys one session and then books another, but the second session is scheduled later. The trainee mistakenly starts giving content for the second session immediately because they have free time now. The client cancels.

Trainer rule:
- never give extra paid content before the booked session start;
- even if only 5-7 minutes remain before the next session, do not reveal "anything extra";
- otherwise the client may get the value and not attend/pay/continue;
- if the expert made this mistake, try to reconvert politely.

This is a strong product rule for session-state gating.

### 00:55:32-00:58:49 - "He Will Call" Hook

The trainer suggests a relationship hook:
- he is thinking about his behavior;
- he is preparing to call;
- it is not just a call, he is preparing something special;
- Book Now to reveal details.

The trainer notes that the expert does not always need a long three-to-five-message sequence. Sometimes a compact pre-sale message is enough.

### 00:58:50-01:04:13 - Expert Style: Cards, Psychology, Stars

The trainee asks whether to use cards, stars, psychology, or other approaches. The trainer says each expert needs to find a path that fits them and converts.

Rules:
- if cards work for the expert, use cards;
- if psychology works, use psychology;
- if a method feels fake or uncomfortable, do not force it;
- platform persona still positions the expert as psychic/esoteric;
- psychology can be used inside predictions, phrasing, and relationship explanations.

The trainer's view: a good psychic is also a good psychologist. Psychology helps explain partner behavior, addiction-like attachment, conflict patterns, and emotional motives.

### 01:13:31-01:15:37 - Free Messages End / Third Objection Attempt

The trainer discusses a client who asks for more free information. Suggested boundary:

- "I will give you all the information in our reading."
- "My free messages are ending."
- "Please come to the session."

The trainer distinguishes early objection attempts from later ones:
- first/second attempt: handle more humanely and keep working;
- third attempt or repeated free-information request: state the boundary directly and push to session.

Also: if the expert already started a lift/reactivation, do not create another intrigue loop. Send `Book Now`.

### 01:29:29-01:30:23 - Platform Bug / Stuck Button

A trainee reports strange behavior: message sent, button/chat state behaved oddly, or the `Book Now` flow did not appear as expected.

Trainer suggests:
- reload;
- try incognito mode;
- report feedback if needed.

This is a useful support-state signal for Confideline: UI flow issues should be tracked separately from expert mistakes.

### 01:30:23-01:35:31 - After Finishing: Tomorrow Off / Wednesday Call

After a trainee finishes, the trainer says tomorrow can be a day off and the Wednesday call with Natasha will happen at 14:00. Links will be duplicated in the previous group.

This continues the Day 7 Part 1 handoff flow from training to operations.

### 01:58:26-02:00:07 - Schedule Setting And Break Rules

A trainee struggles to set schedule correctly. The trainer notices a 30-minute break / split shift issue and helps reason through the correct availability.

Observed rules:
- schedule needs to be set clearly for tomorrow;
- if shift is split, the platform may require valid breaks;
- the trainee must leave enough time to close remaining hours;
- the trainer checks whether the planned time is enough.

### 02:05:22-02:12:45 - Free Chat Is Over

Client says they want to use their free chat. Trainer says to answer that the free 5 minutes / free messages are already ending or ended, then invite to a session.

This should be a formal state:
- `freeTrial.active`;
- `freeTrial.remainingMessages`;
- `freeTrial.remainingSeconds`;
- `freeTrial.expired`;
- `freeTrialBoundaryMessageSent`.

### 02:20:49-02:22:51 - Final Instructions: Schedule, Questionnaire, Language

The trainer reminds everyone:
- if you work tomorrow, set your schedule;
- make sure availability is actually open so you do not sit idle;
- if the site/questionnaire closes, message the trainer;
- fill the questionnaire;
- questionnaire must be in Russian or Ukrainian, not English;
- Wednesday call with Natasha remains the next step.

### 02:22:52-02:24:47 - Remaining Hours / Dashboard Check

The trainer asks people to check remaining hours in dashboard. One example mentions about 35:20, meaning the trainee needs a bit more to reach 36 hours.

Trainees may finish one hour today and the remaining time tomorrow, depending on convenience.

### 02:27:03-02:31:11 - Closing Training Week

The trainer tells everyone:
- do not forget tomorrow's schedule;
- if staying today, continue the shift;
- message privately when the questionnaire is filled;
- one session in a day is still something, but tomorrow can improve statistics;
- those not staying can turn off online;
- finish the internship/training;
- rest and celebrate completion.

This is the formal end-of-training tone.

## Cabinet / UI Observations

Visible states and components:
- Zoom join and screen-share flow at the start;
- live chat workspace with assigned conversations;
- right client panel with profile, partner, limits, chat info, user info, coupons;
- `Book Now` modal at multiple points, including around 01:55, 02:07, 02:13, and other frames;
- dashboard snapshots with revenue/progress:
  - around 00:21:15: about `$63.07`;
  - around 00:42:30 and 00:48:30: about `$64.26`;
  - around 01:11:00: dashboard reset/other account showing `$0`;
  - around 01:33:45: about `$66.24`;
  - around 02:10:15 and 02:18:45: about `$67.83`;
  - around 02:29:30: another `$0` dashboard/account state;
- schedule/shift setting around 01:58-02:00;
- loading states when switching chats;
- Telegram/group chat and Zoom closure at the end.

UI implication: dashboard can represent different accounts or reset contexts, so analysis should track account identity or role when comparing values.

## Reconstructed Operating Regulations

### Paid Session Content Gating

1. Paid content is delivered only during the active paid session window.
2. If a next session is booked for later, do not start delivering it early.
3. Do not give "extra" information between sessions, even if only a few minutes remain.
4. Answer promised paid questions compactly before the timer ends.
5. If a mistake gives away value early, attempt polite reconversion.

### Objection Handling

1. Hidden objections count as objections.
2. Price objection should first be handled by value framing.
3. Free-information fishing should be bounded.
4. After two softer attempts, the third attempt can use a firmer boundary.
5. If lift/reactivation is already started, stop adding intrigue and send `Book Now`.

### Free Trial Boundary

1. Track when free chat/messages/time are ending.
2. Tell the client clearly when the free part is over.
3. Invite to paid session for remaining information.
4. Do not restart a full free reading just because the client asks.

### Expert Style

1. Expert can lean on cards, psychology, stars, or other framing.
2. The style should fit the expert and convert.
3. Psychology is encouraged as a foundation for persuasive explanations.
4. Platform persona remains psychic/esoteric, even when psychology is used.

### Schedule And Training Closure

1. Set tomorrow's schedule before leaving.
2. Make sure availability is open so the expert does not sit idle.
3. Use dashboard to check remaining training hours.
4. Fill the questionnaire in Russian or Ukrainian.
5. Message mentor privately when questionnaire is complete.
6. Wednesday call with Natasha is the next formal step.

## Suggested Confideline Data Contracts

### Paid Session Gating

```ts
type PaidSessionGating = {
  sessionId: string;
  status: 'booked-future' | 'active' | 'ended' | 'cancelled';
  startsAt?: string;
  endsAt?: string;
  promisedTopics: string[];
  deliveredTopics: string[];
  earlyDeliveryBlocked: boolean;
  earlyDeliveryRisk?: boolean;
  extraInfoBetweenSessionsRisk?: boolean;
};
```

### Objection State

```ts
type ObjectionState = {
  type:
    | 'hidden'
    | 'price'
    | 'free-info'
    | 'post-book-now'
    | 'repeat-question'
    | 'other';
  attemptCount: number;
  lastHandledAt?: string;
  recommendedTone: 'soft' | 'firm-boundary' | 'cooldown';
  valueReframeSuggested?: boolean;
};
```

### Free Trial State

```ts
type FreeTrialState = {
  active: boolean;
  remainingMessages?: number;
  remainingSeconds?: number;
  expired: boolean;
  boundaryMessageSent: boolean;
  convertedToPaid?: boolean;
};
```

### Expert Style Profile

```ts
type ExpertStyleProfile = {
  preferredAngles: Array<'cards' | 'psychology' | 'stars' | 'energy' | 'dreams' | 'other'>;
  convertsBestWith?: 'cards' | 'psychology' | 'stars' | 'energy' | 'dreams' | 'unknown';
  uncomfortableAngles?: string[];
  personaComplianceRequired: boolean;
};
```

### Platform Issue

```ts
type PlatformIssue = {
  type: 'book-now-missing' | 'message-duplicate' | 'chat-stuck' | 'schedule-save-failed' | 'other';
  detectedAt: string;
  suggestedFixes: Array<'reload' | 'incognito' | 'report-feedback' | 'contact-support'>;
  resolved?: boolean;
};
```

### Training Closure

```ts
type TrainingClosureState = {
  targetHours: number;
  currentHours: number;
  remainingHours: number;
  scheduleSetForTomorrow: boolean;
  questionnaireLanguage?: 'ru' | 'uk' | 'other';
  questionnaireSubmitted: boolean;
  mentorNotified: boolean;
  nextHrCallAt?: string;
};
```

## Mapping To Admin Chat Workspace V2

For Confideline:
- Composer should know whether a paid session is active, future, or ended before allowing high-value content suggestions.
- `Pings` should include free-trial ending, next paid session start, schedule not set, questionnaire incomplete, and remaining training hours.
- Right panel should show free-trial state, paid session schedule, objection attempt count, coupon/new-user eligibility, and price objection history.
- Queue/chat ownership should distinguish active paid session from future booked session.
- Mentor QA should flag early delivery of paid content, repeated intrigue after lift, and firm-boundary timing.
- Expert profile should include preferred conversion style so assistant hints can match the expert's voice.

## Key Product Takeaway

Day 7 Part 2 closes the training loop. The platform logic now includes:
- paid-session content gating;
- hidden and price objections;
- free-trial expiration;
- expert style profiling;
- schedule validation;
- questionnaire/training-hour closure;
- mentor handoff to HR/operations.

For Confideline, this means the admin workspace should treat "session state" and "training state" as first-class entities, not just chat messages.
