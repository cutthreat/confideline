# Метрики эксперта: словарь, формулы и уровень уверенности

Документ фиксирует метрики, которые нужны для dashboard/analytics/workmode. Для каждой метрики указано назначение, возможная формула, источник данных и confidence.

## 1. Главный принцип

Нельзя смешивать разные виды времени:

- запланированное время;
- online time;
- active work time;
- paid session time;
- training/self-work time;
- idle time.

Если все называть просто "часы", dashboard станет непонятным, а payroll/QA вызовет споры.

## 2. Time metrics

| Метрика | Назначение | Возможная формула | Confidence по конкуренту |
|---|---|---|---|
| `scheduledHours` | План по расписанию | сумма scheduled slots | High для наличия schedule, Low для формулы |
| `onlineHours` | Время в online status | online intervals - offline | Medium |
| `activeWorkHours` | Реальная активная работа | active intervals by messages/chats | Medium |
| `paidSessionMinutes` | Оплаченное клиентами время | сумма active paid sessions | High |
| `trainingHoursCompleted` | Прогресс стажировки | approved training/self-work intervals | High/Medium |
| `remainingTrainingHours` | Сколько осталось до допуска | target - completed | High |
| `idleTime` | Паузы без действий | online - active | Medium/Low |

## 3. Activity metrics

| Метрика | Назначение | Возможная формула | Confidence |
|---|---|---|---|
| `messagesSent` | Активность эксперта | count operator messages | High |
| `clientMessagesAnswered` | Ответы клиентам | count client messages followed by operator reply | Medium |
| `activeChatsHandled` | Сколько чатов обработано | unique conversations with operator action | Medium |
| `pingsHandled` | Работа с Pings | count resolved/actioned pings | Medium |
| `notesAdded` | Использование continuity | count notes | Medium |
| `favoritesAdded` | Retention prep | count favorite actions | High/Medium |

## 4. Sales/conversion metrics

| Метрика | Назначение | Формула | Confidence |
|---|---|---|---|
| `bookNowSent` | Сколько CTA отправлено | count `book_now_sent` | High |
| `bookNowToPaymentRate` | Конверсия CTA | payments after Book Now / Book Now sent | High для нужности, Medium для точного окна attribution |
| `paidSessionsCount` | Количество сессий | count paid sessions | High |
| `extensionOffers` | Upsell | count extension offers | Medium |
| `extensionConversionRate` | Продление | paid extensions / extension offers | Medium |
| `couponUsageRate` | Использование скидок | coupon_used / coupon_sent | Medium |
| `reactivationConversionRate` | Эффективность lift | paid after lift / lift attempts | High для нужности, Medium для attribution |

## 5. Paid session quality metrics

| Метрика | Назначение | Формула | Confidence |
|---|---|---|---|
| `paidSessionOutboundMessages` | Плотность ответа | count operator messages during session | High |
| `averagePaidSessionGap` | Паузы | avg seconds between operator messages | High |
| `paidSessionIdleRiskCount` | Refund risk | count idle gaps above threshold | High |
| `promisedTopicsCompleted` | Выполнение контракта | completed topics / promised topics | Medium |
| `refundRiskSessions` | Риск жалоб | sessions with idle/low messages/support signal | High/Medium |
| `futureContentWarnings` | Gating risk | count warnings | High для нужности |

Ориентир из видео: 8-9 сообщений за paid session звучит как ожидание/минимум. Это нельзя превращать в универсальное правило без привязки к длительности сессии.

## 6. Objection metrics

| Метрика | Назначение | Формула | Confidence |
|---|---|---|---|
| `objectionsDetected` | Нагрузка на sales handling | count objections | High |
| `objectionAttemptCount` | Давление | attempts per conversation | High |
| `overLimitObjections` | Риск давления | attempts > maxRecommended | High |
| `priceObjectionRate` | Ценовой барьер | price objections / Book Now responses | Medium |
| `freeInfoFishingRate` | Попытка получить бесплатно | free-info objections / post-Book-Now responses | Medium |
| `objectionToPaymentRate` | Успех обработки | payments after objection / objections | Medium |

Точный лимит attempts: 3 или 3-4. Confidence: Medium.

## 7. Reactivation metrics

| Метрика | Назначение | Формула | Confidence |
|---|---|---|---|
| `reactivationEligibleClients` | Потенциал retention | count eligible clients | High |
| `reactivationScheduled` | План follow-up | count scheduled lifts | High |
| `reactivationAttempts` | Работа эксперта | count lift messages | High |
| `reactivationReplies` | Ответы клиентов | replies after lift / attempts | Medium |
| `reactivationBookNow` | CTA after lift | Book Now after lift / attempts | Medium |
| `reactivationPaid` | Деньги после lift | paid after lift / attempts | High/Medium |
| `spamLiftRisk` | Некачественный lift | attempts without eligibility/reason | Medium |

## 8. Safety/risk metrics

| Метрика | Назначение | Формула | Confidence |
|---|---|---|---|
| `safetyFlags` | Compliance | count safety flags | High |
| `selfHarmEscalations` | Critical safety | count self-harm escalations | High |
| `claimPrecisionWarnings` | Overclaim control | count claim warnings | High |
| `offPlatformAttempts` | Policy risk | count off-platform flags | Medium |
| `technicalIssues` | Support load | count technical issues | Medium |
| `refundRequests` | Quality/revenue risk | support/payment records | Medium |

## 9. Efficiency

`efficiency` упоминается/видна как показатель, но точная формула конкурента не доказана.

Возможные формулы:

```text
efficiency = paidSessionMinutes / activeWorkMinutes
efficiency = paidRevenue / activeWorkHours
efficiency = paidSessions / onlineHours
efficiency = weightedScore(messages, sessions, conversion, hours)
```

Рекомендация для Confideline: не использовать слово `efficiency`, пока формула не утверждена. Лучше показывать прозрачные компоненты:

- active work time;
- paid sessions;
- Book Now conversion;
- paid session quality;
- reactivation outcome.

Если нужен единый score, назвать его `performanceScore` и документировать формулу.

## 10. Pay / bonus metrics

Из видео:

- звучит full-month target 160-180 часов;
- звучит ставка около `$14/hour`;
- есть HR/payroll call;
- есть bonus call;
- при меньших часах ставка/оплата может быть ниже.

Confidence: Medium/Low. Нельзя использовать как готовое правило Confideline.

Для Confideline возможные поля:

```ts
type ExpertPayContext = {
  payModel?: 'hourly' | 'session_based' | 'hybrid';
  targetMonthlyHours?: number;
  approvedActiveHours?: number;
  bonusEligible?: boolean;
  bonusEligibilityReason?: string;
  payrollReviewPending?: boolean;
};
```

Показывать эксперту только подтвержденные значения.

## 11. Training metrics

| Метрика | Назначение | Формула | Confidence |
|---|---|---|---|
| `trainingTargetHours` | Цель стажировки | configured target, например 36h | Medium |
| `trainingHoursCompleted` | Прогресс | approved training/self-work hours | High/Medium |
| `trainingHoursRemaining` | Остаток | target - completed | High |
| `questionnaireRequired` | Gate | training condition met -> required | High/Medium |
| `questionnaireSubmitted` | Допуск | submitted/approved | High |
| `firstShiftQaRequired` | Контроль | onboarding stage | Medium |

## 12. Data sources

| Источник | Метрики |
|---|---|
| Chat events | messages, Book Now, objections, reactivation |
| Payment/session backend | paid sessions, refunds, duration, startsAt/endsAt |
| Availability/status logs | online/offline/break |
| Schedule service | planned hours, future sessions |
| QA/mentor events | scores, critical violations |
| Support system | technical issues, complaints, refund requests |
| Onboarding system | training hours, questionnaire, calls |

## 13. Dashboard cards для MVP

### Today

```text
Online: 3h 20m
Active work: 2h 45m
Messages: 87
Book Now: 14
Paid sessions: 5
Pings due: 3
Risks: 1
```

### Paid session quality

```text
Active sessions: 1
Idle risk: 0
Avg response gap: 01:20
Future locked: 2
Warnings: 0
```

### Conversion

```text
Book Now -> Payment: 28%
Objection -> Payment: 18%
Lift -> Reply: 34%
Lift -> Paid: 9%
```

### Training

```text
Training hours: 32:40 / 36:00
Remaining: 03:20
Questionnaire: locked until target
First shift: pending mentor approval
```

## 14. Red flags in analytics

- Online high, messages low.
- Many free readings, few Book Now.
- Many Book Now, low payment conversion.
- High objection attempts.
- Paid sessions with long idle gaps.
- Future content warnings.
- Previous buyers not reactivated.
- Many coupons, low conversion.
- Schedule set but missed sessions.
- Safety flags without escalation.

## 15. Acceptance criteria для метрик

Метрика готова к production, если:

- есть точное определение;
- есть источник данных;
- есть timezone handling;
- есть role visibility;
- есть fallback для missing data;
- есть explanation tooltip;
- она не конфликтует с payroll/legal policy;
- QA/mentor понимают, как ее использовать.

## 16. Open questions

- Какой source of truth для work time?
- Какой threshold idle risk?
- Какой attribution window для Book Now -> payment?
- Как считать reactivation conversion?
- Показывать ли экспертам conversion rate или только действия?
- Как разделить trainee metrics и active expert metrics?
- Какие pay metrics показывать в UI?
- Как учитывать ручные corrections от mentor/manager?
