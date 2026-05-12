# Metrics Verification

Документ отделяет подтвержденные метрики от предположений. Цель - не копировать формулы конкурента без доказательств.

## 1. Verification summary

| Метрика | Статус | Confidence | Что известно | Что не доказано |
|---|---|---|---|---|
| Training hours | Confirmed | High/Medium | Цель около 36 часов, dashboard показывает прогресс/остаток | Точный backend trigger |
| Remaining training hours | Confirmed | High | Day 7 Part 2 пример around 35:20/remaining context | Exact UI label |
| Dashboard money/progress values | Confirmed as visible | Medium | Значения `$51.96`, `$53.95`, `$55.53`, `$63.07`, `$67.83` видны/зафиксированы | Что именно означает каждый value |
| Statistic page | Confirmed as screen | Medium | Date-level rows, hours/efficiency/session-like columns | Exact columns/formulas |
| Efficiency | Mentioned/visible | Low/Medium | Показатель есть в stats context | Formula unknown |
| Active work hours | Partly confirmed | Medium | Work linked to activity/messages, not just open tab | Exact formula unknown |
| Online hours | Partly confirmed | Medium | Online status/availability matters | Whether used for pay directly |
| Sent messages | Confirmed as important | High/Medium | Paid session message density and work activity | Exact dashboard counting window |
| Paid sessions | Confirmed | High | Central paid workflow | Exact dashboard aggregation |
| Paid session outbound count | Confirmed as QA need | High | 8-9 messages guideline mentioned | Duration-specific minimum |
| Refund/support risk | Confirmed | High | Silence/under-delivery creates risk | Exact threshold |
| Book Now conversion | Product inference | Medium | Book Now -> payment is core funnel | Competitor formula unknown |
| Reactivation conversion | Product inference | Medium | Lift workflow confirmed | Competitor analytics unknown |
| Coupon usage | Partly confirmed | Medium | Coupon eligibility/use important | Full eligibility contract |
| Monthly target hours | Mentioned | Medium | 160-180 hours referenced | Whether universal rule |
| Hourly rate/pay | Mentioned | Low/Medium | Around `$14/hour` referenced | Exact payroll model |
| Bonus eligibility | Mentioned | Low/Medium | Bonus call exists | Formula and eligibility unknown |

## 2. Training metrics

### `trainingTargetHours`

Evidence:

- Day 7 Part 1 `00:12:28-00:15:59`: trainer discusses 36 hours for training/self-work.
- Day 7 Part 1 `00:34:09-00:34:37`: dashboard shows where required hours are visible.
- Day 7 Part 2 `02:22:52-02:24:47`: trainer asks to check remaining dashboard hours; example mentions about 35:20 context.

Recommendation:

```ts
trainingTargetHours: number // configured, not hardcoded
trainingHoursCompleted: number
trainingHoursRemaining: number
```

Confidence: High for existence, Medium for universal target value.

## 3. Work time metrics

### `onlineHours`

Evidence:

- Online/I'm Online status appears repeatedly.
- Trainer ties online/schedule to client availability.

Open:

- whether online time alone counts toward pay;
- whether idle online time is discounted.

Confidence: Medium.

### `activeWorkHours`

Evidence:

- Day 4 and Day 5 mention work time/activity connected to sent messages and active work.
- Trainer discourages simply sitting idle.

Possible formulas:

```text
activeWorkHours = intervals with sent messages / active chats
activeWorkHours = online time minus idle gaps
activeWorkHours = approved shift time with minimum activity
```

Confidence: Medium for concept, Low for exact formula.

## 4. Paid session quality metrics

### `paidSessionOutboundMessages`

Evidence:

- Day 5 Part 1 `01:41-01:44`: sending one message in many minutes is criticized.
- Day 5 Part 1 operating regulations: 8-9 messages expected/minimum in session context.

Recommendation:

Use as warning, not hard block:

```ts
paidSession.outboundMessageCount
paidSession.lastExpertMessageAt
paidSession.idleSeconds
paidSession.idleRisk
```

Confidence: High.

### `paidSessionIdleRisk`

Evidence:

- Day 5 Part 1: silence causes refund/support risk.
- Day 7 Part 2: paid questions must be covered before timer ends.

Open:

- exact threshold: 2 min, 3 min, or dynamic by session duration.

Confidence: High for need, Medium for threshold.

## 5. Dashboard money/progress values

Evidence:

- Day 7 Part 1 `01:31:45-02:15:45`: dashboard frames show values around `$51.96`, `$53.95`, `$55.53`.
- Day 7 Part 2 UI observations: around `$63.07`, `$64.26`, `$66.24`, `$67.83`, and `$0` states.

Interpretation:

- Dashboard values can differ by account/profile/context.
- They likely represent revenue/earnings/progress-like values.
- Exact label and calculation remain unconfirmed.

Confidence: Medium.

## 6. Statistic page metrics

Evidence:

- Day 5 Part 1 near `03:57`: `Statistic` page visible with date-level rows and performance columns.
- Analysis mentions hours/efficiency/session-like metrics.

Open:

- exact column names;
- formulas;
- filters;
- whether expert or mentor sees all fields.

Confidence: Medium.

## 7. Efficiency

Evidence:

- Mentioned/visible in statistics context.

Not proven:

- whether efficiency means revenue/hour;
- sessions/hour;
- active minutes ratio;
- weighted productivity score;
- bonus factor.

Recommendation:

For Confideline, do not ship an opaque `efficiency` metric. Use:

- active work time;
- paid sessions;
- conversion;
- paid session quality;
- reactivation outcome;
- risk count.

Confidence: Low/Medium.

## 8. Pay / bonus

Evidence:

- Day 7 Part 1 `00:17:01-00:21:59`: trainer references full rate, 160-180 hours, around `$14/hour`.
- Day 7 Part 1 `00:15:59-00:16:28`: HR/payroll/schedule call and bonus-system call.

Not proven:

- payroll formula;
- rate tiers;
- bonus conditions;
- whether figures apply to all experts or trainee context;
- currency/accounting details.

Recommendation:

Keep pay/bonus out of MVP dashboard unless business confirms formulas.

Confidence: Low/Medium.

## 9. Schedule metrics

Evidence:

- My Schedule shown/used.
- Day 7 Part 2 `02:20:49-02:22:51`: set tomorrow schedule, availability should be open.
- Day 7 Part 1 `00:25:34-00:27:11`: future sessions can block questionnaire closure.

Recommended fields:

```ts
schedule.slots
schedule.timezone
schedule.nextPaidSessionAt
schedule.conflicts
schedule.tomorrowReady
```

Confidence: High.

## 10. Onboarding metrics

Confirmed:

- training hours;
- questionnaire required/submitted;
- manager/HR call;
- bonus call;
- first independent week/shift.

Recommended fields:

```ts
expert.onboardingStage
expert.trainingHoursCompleted
expert.trainingHoursRemaining
expert.questionnaireStatus
expert.firstShiftQaRequired
expert.managerCallPending
```

Confidence: High/Medium.

## 11. Red/yellow metric flags

Red:

- active paid session idle;
- future paid content warning;
- safety flag without escalation;
- refund request;
- active session during offline/break.

Yellow:

- many Book Now, low payment;
- many free readings, few Book Now;
- high coupon usage, low payment;
- over-limit objection attempts;
- schedule not set for next work day;
- trainee close to target but questionnaire blocked.

## 12. What would raise metrics confidence to 9.5/10

Needed:

- close-up manual review of Statistic page frames/video;
- OCR/manual reading of exact dashboard labels;
- source/backend docs for payroll/efficiency;
- confirmation from business on pay/bonus policy;
- exact event source for active work time.

Without those, dashboard/metrics confidence should stay around 8-9 for structure and 6.5-7.5 for exact formulas.
