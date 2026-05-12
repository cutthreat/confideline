# Timecoded Functional Walkthrough

Документ дает разработчику и продуктовой команде маршрут по ключевым видео-фрагментам: что происходит, какая функция/правило подтверждается, и что это значит для Confideline.

Это не полный пересказ 47 часов, а high-value walkthrough по функциональным и спорным зонам.

## Day 1

| Timecode | What happens | Function / rule | Confideline implication | Confidence |
|---|---|---|---|---|
| Day 1 Part 1, multiple overview segments | Trainer introduces platform/cabinet, chat manager tasks, client funnel, dashboard/schedule/transactions. | Cabinet is multi-area workspace, not just chat. | Workspace must integrate chat, profile, schedule, transactions/session context. | High |
| Day 1 Part 1, rules discussion | 18+, no diagnosis/treatment, no confidential data/off-platform/rudeness. | Policy boundaries. | Safety and claim precision flags. | High |
| Day 1 Part 2, live cabinet | Multi-avatar/multi-chat, same client can create chats with different experts. | Client continuity and cross-expert context. | Previous chats/experts and duplicate hint. | High |

## Day 2

| Timecode | What happens | Function / rule | Confideline implication | Confidence |
|---|---|---|---|---|
| Day 2 Part 1, free reading block | Trial/free reading, required data, external sources/ChatGPT only as ideas. | Free answer must be limited and expert-owned. | Free trial state, draft provenance. | High |
| Day 2 Part 1, returning paid client | Returning paid client should not get a full new free reading. | Previous buyer boundary. | `client.previousBuyer` guard. | High |
| Day 2 Part 1, paid session lifecycle | Paid session through to end even if client silent. | Paid session contract. | Timer, active session state, quality warnings. | High |
| Day 2 Part 2, retention | Session extension, reactivation/lift, emotional component, no copy-paste. | Retention and style quality. | Reactivation workflow, template risk. | High |

## Day 3

| Timecode | What happens | Function / rule | Confideline implication | Confidence |
|---|---|---|---|---|
| Day 3 Part 1, free reading structure | 3-4 insights, holding phrase, direct CTA, objections. | Free reading -> intrigue -> Book Now. | Stage machine and composer hints. | High |
| Day 3 Part 1, live cabinet | Folders/favorites/notes/archive/last payment. | Client context and retention memory. | Right panel sections. | High |
| Day 3 Part 2, supervised practice | My Schedule, I'm Online, Assign to me, profile/status/coupons. | Workmode and schedule are part of expert operations. | Availability state, schedule block. | High |
| Day 3 Part 2, post-Book-Now | Every post-Book-Now message is an objection. | Book Now transition event. | Objection mode after Book Now. | High |

## Day 4

| Timecode | What happens | Function / rule | Confideline implication | Confidence |
|---|---|---|---|---|
| Day 4 Part 1, morning workflow | Unanswered/Answers, online status, work time counted by sent messages/activity. | Workmode and active work tracking. | Separate online vs active work time. | Medium/High |
| Day 4 Part 1, paid priority | Paid session priority and 4-5 minute/message cadence discussions. | Paid sessions are urgent. | Paid idle Ping and timer. | High |
| Day 4 Part 1, schedule/timezone | Schedule and timezone matter. | Availability contract. | Timezone and schedule conflict warnings. | High |
| Day 4 Part 2, support/safety | Tech issues -> support; self-harm/suicide safety path. | Technical and safety escalation. | `technical_issue`, `safety_escalation`. | High/Medium |
| Day 4 Part 2, dashboard screenshots | Dashboard screenshots/efficiency/hours/session metrics discussed. | Dashboard is training/management tool. | Mentor dashboard and metrics verification. | Medium |

## Day 5

| Timecode | What happens | Function / rule | Confideline implication | Confidence |
|---|---|---|---|---|
| Day 5 Part 1 `00:00-00:14` | Valentine promo codes, platform matching, promo after Book Now. | Coupon is stateful and platform-specific. | Coupon eligibility model; copyable coupon message. | High |
| Day 5 Part 1 `00:31-00:40` | Platform labels/codes, existing discount. | Coupon must match client/platform and not downgrade discount. | Coupon panel in right context. | High |
| Day 5 Part 1 `01:38-01:39` | Schedule/calendar page with booked/accepted session slots. | Schedule controls future paid sessions. | My Schedule block. | High |
| Day 5 Part 1 `01:41-01:44` | Trainer criticizes silence/low message count in paid session. | Paid session message density and refund risk. | Timer, outbound count, idle risk. | High |
| Day 5 Part 1 `03:57` | Statistic page with date-level rows/performance columns. | Detailed analytics page exists. | Statistics table, exact formulas unconfirmed. | Medium |
| Day 5 Part 2, weak intrigue | Weak conversion caused by weak intrigue; rotate themes; no direct copy-paste. | Quality of intrigue affects conversion. | Intrigue quality warnings/QA. | High |
| Day 5 Part 2, refund threshold | Paid-session gap around several minutes is high risk. | Paid idle threshold needed. | Configurable idle warning. | Medium/High |

## Day 6

| Timecode | What happens | Function / rule | Confideline implication | Confidence |
|---|---|---|---|---|
| Day 6 Part 1, main topic | "Поднятие" / reactivation defined. | Return to buyer/strong-intent client with reason. | Reactivation workflow and Pings. | High |
| Day 6 Part 1, lift structure | Reason for return, intrigue, Book Now, short/no water. | Lift message formula. | Composer lift template. | High |
| Day 6 Part 1, paid promise | Answer promised Book Now topics first; new questions are another session if not enough time. | Paid contract and extension. | Promised topics and extension flow. | High |
| Day 6 Part 2, AI/translator | AI/translators allowed as support, but expert controls story/tone/conversion. | Draft provenance and expert responsibility. | AI prompt pack and guardrails. | Medium/High |
| Day 6 Part 2, product psychology | Clients buy hope/support/attention. | Sales psychology. | Tone and retention training. | Medium/High |
| Day 6 Part 2, safety-like messages | Self-harm-like messages need safety branch. | Safety priority. | Sales suppression in safety stage. | High/Medium |

## Day 7 Part 1

| Timecode | What happens | Function / rule | Confideline implication | Confidence |
|---|---|---|---|---|
| `00:12:28-00:13:54` | Final training hours/self-work; 36 hours mentioned; buffer recommended. | Training progress tracked. | `trainingTargetHours`, `remainingTrainingHours`. | High/Medium |
| `00:13:54-00:15:59` | Questionnaire appears, blocks chat/client cards, not a knowledge test. | Onboarding gate. | `questionnaireRequired`, workspace block state. | High |
| `00:15:59-00:16:28` | HR/payroll/schedule and bonus calls. | Workforce lifecycle. | Manager checkpoints, not hardcoded names. | Medium/High |
| `00:17:01-00:21:59` | Flexible schedule, power outages, 160-180h, ~$14/h mentioned. | Workmode/pay context. | Pay metrics require business confirmation. | Medium |
| `00:25:34-00:27:11` | Questionnaire can be blocked by future scheduled sessions; cancel via calendar. | Onboarding depends on schedule/session state. | Schedule-onboarding interaction. | High |
| `00:27:11-00:27:39` | Put buyers in Favorites before turning off schedule. | Favorites as retention memory. | Favorite buyers before availability reduction. | High |
| `00:34:09-00:34:37` | Dashboard shows required hours. | Dashboard as training evidence. | Training progress card. | High |
| `00:49:37-01:06:53` | Read comments/previous expert notes. | Cross-expert continuity. | Notes with source/confidence. | High |
| `01:07:10-01:20:12` | Client bought from other experts; labels can be wrong. | Purchase history beats subjective labels. | Purchase history in right panel. | High |
| `01:24:02-01:26:24` | Duplicate/new chat by same buyer. | Duplicate not necessarily deception. | Duplicate suspected hint, no auto-merge. | High |
| `01:31:45-02:15:45` | Dashboard/live performance values. | Operational dashboard checkpoints. | Dashboard metrics; formulas unconfirmed. | Medium |
| `03:16:06-03:24:03` | Paternity/pregnancy sensitive question. | High-risk claims. | Claim precision flags. | High |
| `03:24:03-03:55:55` | Break while some trainees have sessions/live chats. | Break must account for active sessions. | Offline/break guard. | High |

## Day 7 Part 2

| Timecode | What happens | Function / rule | Confideline implication | Confidence |
|---|---|---|---|---|
| `00:01:05-00:05:01` | Paid session time management and compact coverage of promised questions. | Cover promised topics before timer ends. | Topic coverage QA. | High |
| `00:06:00-00:11:27` | Hidden objection identified. | Hidden objections count. | Objection classifier. | High |
| `00:28:40-00:32:01` | Expensive price objection handled by value reframing. | Price objection != automatic coupon. | Value-first objection playbook. | High |
| `00:33:16-00:35:43` | Do not give content before future booked session; client cancelled after mistake. | Future paid content gating. | Strict content lock warning. | High |
| `00:58:50-01:04:13` | Expert style: cards, psychology, stars; good psychic as psychologist. | Style can vary if it converts and fits persona. | Expert style profile/training. | Medium/High |
| `01:13:31-01:15:37` | Free messages end/third objection attempt; after lift send Book Now. | Free trial boundary and attempt limit. | FreeTrial state, max attempts configurable. | High/Medium |
| `01:29:29-01:30:23` | Platform bug/stuck button; reload/incognito/report. | Technical issue handling. | Support escalation path. | High |
| `01:58:26-02:00:07` | Schedule setting and split shift/break issue. | Schedule requires valid availability/break logic. | Schedule validation. | Medium/High |
| `02:05:22-02:12:45` | Free chat is over; invite to session. | Free trial expiry boundary. | `freeTrial.expired`, boundary message. | High |
| `02:20:49-02:22:51` | Final instructions: set schedule, questionnaire language RU/UK. | Workmode/onboarding closure. | Schedule readiness and questionnaire locale. | High |
| `02:22:52-02:24:47` | Remaining dashboard hours check. | Dashboard training progress. | Training hours card. | High |
| `02:27:03-02:31:11` | End training week; turn off online if leaving; continue if staying. | Shift closure. | End-of-shift SOP. | High |

## Walkthrough conclusion

Highest-confidence product areas:

- Book Now transition;
- paid session contract;
- future paid content gating;
- free trial boundary;
- reactivation/lift;
- previous buyer/Favorites/notes;
- schedule/availability;
- onboarding/questionnaire;
- safety/claim precision categories.

Still medium/low:

- exact dashboard/statistics formulas;
- pay/bonus rules;
- active work time formula;
- full coupon eligibility contract;
- exact support/safety protocol text;
- AI/background feature source.
