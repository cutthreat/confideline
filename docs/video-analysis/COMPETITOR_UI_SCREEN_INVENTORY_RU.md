# Competitor UI Screen Inventory

Инвентаризация экранов и функциональных областей конкурентского кабинета InsightOrba по видео, ручным анализам, frame indexes и contact sheets.

Confidence:

- `High` - экран/блок явно виден или многократно используется.
- `Medium` - экран/блок виден фрагментарно или подтвержден речью тренера.
- `Low` - косвенная реконструкция.

## 1. Chat Workspace

| Поле | Значение |
|---|---|
| Confidence | High |
| Где видно | Все дни; особенно Day 3 Part 2, Day 4, Day 5, Day 7 |
| Назначение | Основная работа с клиентскими чатами, paid sessions, Book Now, objections |
| UI blocks | Left chat list, center conversation, composer, right client panel, Book Now controls, paid session context |
| Actions | Assign/take chat, reply, send Book Now, use coupon, add notes/favorite, handle paid session, schedule follow-up |
| Confideline equivalent | `web/admin-chat-workspace-v2/index.html` |

Нужные Confideline additions:

- stage badge;
- previous buyer badge;
- paid live/future paid badge;
- objection attempt state;
- reactivation due state;
- safety/claim risk state.

## 2. Left Queue / Chat List

| Поле | Значение |
|---|---|
| Confidence | High |
| Где видно | Day 3-7 live practice |
| Назначение | Выбор активного клиента/чата |
| Observed semantics | Unanswered, active chats, folders/labels, paid/not-paid status, favorites/archive-like states |
| Confideline equivalent | Existing `Chats / Pings`, `data-workload-type`, queue cards |

Product notes:

- queue should distinguish active chats from pings/follow-ups;
- priority should be driven by paid live, client waiting, Book Now objection, reactivation due, safety;
- card should not show too many badges.

## 3. Right Client Panel

| Поле | Значение |
|---|---|
| Confidence | High |
| Где видно | Day 1-7, repeated live work |
| Назначение | Client context and operational controls |
| Visible/reconstructed blocks | Profile, partner/person context, limits, chat info, user info, coupons, previous notes/comments, purchase history-like context |
| Product importance | Critical for previous buyer, coupon, paid session, reactivation, safety |

Confideline target sections:

- Profile;
- Session;
- History;
- Offers;
- Risks;
- Notes;
- QA.

## 4. Book Now Modal / Flow

| Поле | Значение |
|---|---|
| Confidence | High |
| Где видно | All practice days; Day 7 Part 2 around `01:55`, `02:07`, `02:13` in UI observations |
| Назначение | Conversion from chat to paid session |
| Actions | Send button/booking offer, promised topics, client booking, coupon after button |
| Related rule | After Book Now, client messages become objection/free-info handling |

Confideline needs:

- `bookNow.status`;
- `promisedTopics`;
- coupon eligibility;
- post-Book-Now objection mode;
- event timeline.

## 5. Paid Session Panel / Timer

| Поле | Значение |
|---|---|
| Confidence | High |
| Где видно | Day 5 paid-session critique; Day 7 paid content gating; repeated session work |
| Назначение | Manage paid time and promised topics |
| Key states | active, booked future, ended/cancelled |
| Risks | silence, under-delivery, future content leakage, refund/support |

Confideline target:

- sticky active paid timer;
- promised topics;
- outbound message count;
- last expert message gap;
- extension action;
- future content locked warning.

## 6. Dashboard

| Поле | Значение |
|---|---|
| Confidence | High for existence, Medium for exact fields |
| Где видно | Day 5 Part 1, Day 7 Part 1, Day 7 Part 2 |
| Observed values | Day 7 Part 1: about `$51.96`, `$53.95`, `$55.53`; Day 7 Part 2: about `$63.07`, `$64.26`, `$66.24`, `$67.83`, some `$0` account states |
| Назначение | Performance/progress monitoring, training-hour checking, revenue/progress snapshots |
| Related timestamps | Day 7 Part 1 `00:34:09-00:34:37`, `01:31:45-02:15:45`; Day 7 Part 2 UI observations |

Confirmed:

- dashboard is used during training and live work;
- trainee hours/progress can be checked;
- money/progress cards appear.

Not confirmed:

- exact formula for each card;
- role-specific visibility;
- whether values are revenue, balance, earnings, or account stat in all screenshots.

## 7. Statistic Page

| Поле | Значение |
|---|---|
| Confidence | Medium |
| Где видно | Day 5 Part 1 near `03:57` |
| Observed | Date-level rows and columns such as hours/efficiency/session-like metrics |
| Назначение | Detailed performance review |
| Confideline implication | Need period table, but formulas must be defined by us |

Needs recheck:

- exact column labels;
- exact efficiency formula;
- whether stats are expert-facing or mentor-facing;
- export/screenshot/reporting behavior.

## 8. My Schedule / Calendar

| Поле | Значение |
|---|---|
| Confidence | High |
| Где видно | Day 3 Part 2, Day 4 Part 1, Day 5 Part 1 `01:38-01:39`, Day 7 Part 1 `00:25:34-00:27:11`, Day 7 Part 2 `01:58:26-02:00:07` |
| Назначение | Availability slots, booked sessions, future session cancellation, tomorrow schedule |
| Actions | Set schedule, cancel future session, save availability, handle split shift/break |

Confideline target:

- today/tomorrow slots;
- timezone;
- future paid sessions;
- break conflict warnings;
- schedule readiness for onboarding.

## 9. Questionnaire

| Поле | Значение |
|---|---|
| Confidence | High |
| Где видно | Day 7 Part 1 `00:13:54-00:15:59`, Day 7 Part 2 final instructions |
| Назначение | Account-attached onboarding form, not knowledge test |
| Behavior | Can replace/lock chat view until filled; access returns after save |
| Fields | first/last name, location, social networks except Telegram, job source, languages, photo, passport/foreign passport screenshot |

Confideline implication:

- onboarding gate should be separate from certification;
- sensitive identity fields require compliance handling;
- questionnaire status belongs in expert dashboard/workmode, not in client chat UI.

## 10. Favorites

| Поле | Значение |
|---|---|
| Confidence | High |
| Где видно | Day 3, Day 6, Day 7 Part 1 `00:27:11-00:27:39` |
| Назначение | Retention/follow-up memory |
| Rule | Add buyers before reducing schedule/offline |

Confideline target:

- favorite reason;
- previous buyer;
- nextActionAt;
- lift eligibility.

## 11. Notes / Comments

| Поле | Значение |
|---|---|
| Confidence | High |
| Где видно | Day 7 Part 1 `00:49:37-01:06:53` |
| Назначение | Cross-expert continuity |
| Rule | Read comments, but do not treat negative labels as absolute truth |

Confideline target:

- notes with author/time/source;
- purchase history alongside comments;
- mentor/support note separation.

## 12. Profile / Expert Setup

| Поле | Значение |
|---|---|
| Confidence | Medium/High |
| Где видно | Day 1-3 and onboarding discussions |
| Назначение | Expert persona, public profile, languages, schedule, status |
| Product meaning | Client-facing identity is expert profile; internal operator identity stays audit-only |

Confideline target:

- expert profile assignment;
- public profile vs internal operator identity;
- schedule/status;
- language.

## 13. Transactions / Payment Context

| Поле | Значение |
|---|---|
| Confidence | Medium |
| Где видно | Day 1 overview, dashboard/statistics mentions, paid session flow |
| Назначение | Payment/session evidence |
| Not fully confirmed | exact transaction page structure, payroll link |

Confideline target:

- payment/session source of truth should come from backend/payment events;
- don't infer payment from chat text.

## 14. Support / Technical Issue Flow

| Поле | Значение |
|---|---|
| Confidence | High/Medium |
| Где видно | Day 5 coupon fails; Day 7 Part 2 stuck button `01:29:29-01:30:23` |
| Actions | Reload, incognito, report feedback/support, route coupon issues to support |

Confideline target:

- `technical_issue` Ping;
- support escalation action;
- avoid blaming expert for platform bug.

## 15. Mentor / Manager Views

| Поле | Значение |
|---|---|
| Confidence | Medium/High |
| Где видно | All live training, Day 7 onboarding handoff |
| Назначение | Supervision, training, QA, HR/payroll/schedule, bonus calls |
| Not fully visible | dedicated mentor dashboard UI |

Confideline target:

- mentor QA queue;
- trainee progress;
- first-shift marker;
- risk conversations;
- manager checkpoints.

## 16. Screen gaps requiring visual recheck

| Screen | Gap |
|---|---|
| Dashboard | exact labels/formulas, role identity of values |
| Statistic page | exact columns and filters |
| My Schedule | exact slot UI, split shift/break constraints |
| Questionnaire | exact field labels and validation |
| Coupons | exact eligibility UI and platform codes |
| Support flow | exact reporting route |
| AI/background | whether built-in feature or external workflow |
