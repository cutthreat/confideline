# Evidence Matrix по видео InsightOrba

Матрица связывает ключевые выводы с видео, таймкодами, типом доказательства и продуктовым последствием для Confideline.

Уровни evidence:

- `A` - повторяется в нескольких видео и/или подтверждено речью тренера плюс UI/кадрами.
- `B` - подтверждено в одном или нескольких местах, но не всегда виден UI или точная формула.
- `C` - есть косвенные признаки, требуется повторная проверка исходного видео.

## 1. Главная воронка и стадии

| Claim | Evidence | Source | Confidence | Product implication |
|---|---|---|---|---|
| Конкурентский чат работает как воронка `free reading -> intrigue -> Book Now -> paid session -> reactivation`. | Повторяется во всех днях: тренер постоянно ведет trainees от бесплатного ответа к кнопке/сессии и затем к повторным покупкам. | Day 1-7 analyses; `INSIGHTORBA_COMPETITOR_WORKFLOW_FULL_DOCUMENTATION_RU.md` | A | В Confideline нужна `conversation.stage`, а не только сообщения и labels. |
| `Book Now` является бизнес-переходом, а не просто кнопкой. | После кнопки сообщения клиента трактуются как objection/уточнение; paid session obligations зависят от promised topics до кнопки. | Day 3 Part 1, Day 3 Part 2, Day 7 Part 2 `01:13:31-01:15:37` | A | `bookNow.status`, `bookNow.promisedTopics`, post-Book-Now objection mode. |
| После `Book Now` нельзя продолжать раскрывать платную ценность бесплатно. | Тренер исправляет trainees: после кнопки надо работать с возражением и вести к оплате. | Day 3 Part 1; Day 7 Part 2 `01:13:31-01:15:37` | A | Composer warning: "Do not reveal more after Book Now". |
| Previous buyer не должен получать полноценный новый free reading. | Возвращающиеся клиенты и клиенты после покупок переводятся в reactivation/lift или быстрый Book Now. | Day 2 Part 1; Day 6 Part 1; Day 7 Part 1 `00:36:22-00:37:35` | A | `client.previousBuyer`, previous-buyer badge, free reading guard. |

## 2. Free reading и intrigue

| Claim | Evidence | Source | Confidence | Product implication |
|---|---|---|---|---|
| Free reading должен дать ограниченную ценность, но не закрыть весь запрос. | Тренер требует 3-4 insight/прогрев, но затем вести к Book Now. | Day 2 Part 1; Day 3 Part 1; full synthesis section 6.1 | A | `freeTrial.insightCount`, `freeValueLimitReached`. |
| Интрига должна быть связана с запросом и не быть общей. | Тренер исправляет слабые абстрактные формулировки, просит менять угол. | Day 3 Part 1; Day 5 Part 2; Day 7 Part 2 `00:55:32-00:58:49` | A | Intrigue quality hints in composer. |
| Не нужно бесконечно создавать новую intrigue после запуска lift/reactivation. | Тренер говорит: если lift уже начат, не делать новую интригу, отправлять Book Now. | Day 7 Part 2 `01:13:31-01:15:37` | A | Reactivation state should warn about repeated hooks. |

## 3. Paid session

| Claim | Evidence | Source | Confidence | Product implication |
|---|---|---|---|---|
| Paid session имеет отдельный контракт: timer, promised topics, active delivery. | Тренер ругает молчание, требует закрывать обещанные темы в оплаченный период. | Day 5 Part 1 `01:41-01:44`, `02:34-02:37`; Day 7 Part 2 `00:01:05-00:05:01` | A | `paidSession.status`, `timerEndsAt`, `promisedTopics`, `outboundMessageCount`. |
| Долгое молчание в paid session создает refund/support risk. | Day 5 Part 1: "one message in many minutes" criticized; refund/support risk explicitly described. | Day 5 Part 1 `01:41-01:44` | A | Paid idle Ping, refund risk warning. |
| 8-9 сообщений в paid session звучит как ожидаемый минимум/ориентир. | Тренер упоминает message density/minimum in session context. | Day 5 Part 1 analysis, section "Paid session has a minimum delivery rhythm" | B | Use as QA guideline, not hard universal rule until duration-specific policy is approved. |
| Новые темы внутри paid session должны уходить в extension/next session. | Если тема новая и времени не хватает, не смешивать с текущим paid scope. | Day 5 Part 1; Day 7 Part 2 `00:01:05-00:05:01` | A | `extension_offer`, proposed topics, next session CTA. |

## 4. Future paid content gating

| Claim | Evidence | Source | Confidence | Product implication |
|---|---|---|---|---|
| Если клиент купил future session, эксперт не должен раскрывать ее контент заранее. | Тренер разбирает ошибку: trainee начала давать content до будущей сессии, клиент отменил. | Day 7 Part 2 `00:33:16-00:35:43` | A | `paidSession.status='booked_future'`, content locked warning. |
| Правило действует даже если до будущей сессии осталось 5-7 минут. | Тренер прямо говорит не давать extra information even if only 5-7 minutes remain. | Day 7 Part 2 `00:33:16-00:35:43` | A | Composer guardrail should be strict around future sessions. |

## 5. Objections и coupons

| Claim | Evidence | Source | Confidence | Product implication |
|---|---|---|---|---|
| Hidden objection считается objection. | Клиент может не говорить "дорого/не хочу", но тянуть, спрашивать и избегать оплаты. | Day 7 Part 2 `00:06:00-00:11:27` | A | Objection classifier supports hidden/free-info/post-Book-Now. |
| После 3 или 3-4 попыток нужно прекращать давление. | Тренер различает первые попытки и third attempt; в документах звучит 3 или 3-4. | Day 7 Part 2 `01:13:31-01:15:37`; full synthesis unknowns | B | `maxRecommendedAttempts` configurable, not hardcoded as proven backend rule. |
| Coupon используется как помощь в objection handling, но не заменяет value. | Promo code after Book Now; value insight still required. | Day 5 Part 1 `00:00-00:14`, `00:54-00:55` | A | Coupon panel should be tied to eligibility and Book Now, not generic discount spam. |
| Coupon зависит от platform/source и existing discount. | Trainer points to platform labels/codes, says wrong code will not work and better existing discount matters. | Day 5 Part 1 `00:31-00:40` | A/B | `coupon.platform`, `coupon.eligible`, `existingDiscountPercent`. |
| Если coupon fails/used/expired, expert routes to support. | Trainer says send to support for promo not working/account reasons. | Day 5 Part 1 `00:47-00:49`, `03:05-03:10` | A | Technical/support issue event for coupon failures. |

## 6. Reactivation / lift

| Claim | Evidence | Source | Confidence | Product implication |
|---|---|---|---|---|
| Reactivation/lift - отдельный workflow для buyers/strong-intent clients. | Day 6 подробно учит "поднятие"; Day 7 продолжает применять к returning clients. | Day 6 Part 1/2; Day 7 Part 1 `00:36:22-00:37:35` | A | Pings as reactivation queue; `reactivation.eligible`, `nextActionAt`. |
| Lift-сообщение должно иметь reason for return. | "После нашей сессии я проверила...", "появилось новое...", then intrigue and Book Now. | Day 6 Part 1; Day 6 Part 2 | A | Composer lift template: reason -> intrigue -> Book Now. |
| Buyers надо добавлять в Favorites перед выключением/сокращением расписания. | Trainer: review clients who purchased and add buyers to Favorites before reducing availability. | Day 7 Part 1 `00:27:11-00:27:39` | A | Favorites are retention memory, not decorative flag. |

## 7. Client continuity

| Claim | Evidence | Source | Confidence | Product implication |
|---|---|---|---|---|
| История, previous chats и comments влияют на работу. | Trainer discusses comments from previous experts and how to use them. | Day 7 Part 1 `00:49:37-01:06:53` | A | Right panel needs notes/comments with author/time/source. |
| Клиент может покупать у многих экспертов; negative labels may be misleading. | Trainer says purchase history matters more than subjective note. | Day 7 Part 1 `01:07:10-01:20:12` | A | Treat labels as signals with confidence, not absolute truth. |
| Duplicate/new chat by same buyer is not always deception. | Trainer normalizes clients returning through new chats. | Day 7 Part 1 `01:24:02-01:26:24` | A | `duplicateOrNewChatSuspected` should be hint, not auto-merge. |

## 8. Dashboard / statistics / workmode

| Claim | Evidence | Source | Confidence | Product implication |
|---|---|---|---|---|
| Dashboard is used for training-hour progress. | Trainer shows where to see required hours in dashboard. | Day 7 Part 1 `00:34:09-00:34:37`; frames around `00:34:00-00:34:45` | A | Dashboard must include training progress for trainees. |
| Dashboard repeatedly shows revenue/progress snapshots during live work. | Values around `$51.96`, `$53.95`, `$55.53` in Day 7 Part 1; `$63.07`, `$64.26`, `$67.83` in Day 7 Part 2. | Day 7 Part 1 `01:31:45-02:15:45`; Day 7 Part 2 UI observations | B | Dashboard is operational checkpoint; exact formulas still unverified. |
| Statistic page exists and shows date-level rows/performance columns. | Day 5 Part 1 near `03:57`, analysis says rows by date and columns like hours/efficiency/session-like metrics. | Day 5 Part 1 `03:57`; contact sheets / frames_index | B | Build Statistic page spec, but mark exact columns/formulas as unconfirmed. |
| Work time is related to activity/messages, not simply open cabinet. | Trainer discusses message-based work/activity and not just sitting. | Day 4 Part 1; Day 5 Part 1; dashboard docs | B | Separate online time, active work time, paid session time. |
| Training target around 36 hours. | Trainer discusses 36 hours and dashboard remaining time; Day 7 Part 2 example around 35:20 remaining/to target context. | Day 7 Part 1 `00:12:28-00:15:59`, `00:34:09-00:34:37`; Day 7 Part 2 `02:22:52-02:24:47` | A/B | `trainingTargetHours` configurable; do not hardcode as universal business rule. |
| Full-month target 160-180 hours and full rate around $14/h are mentioned. | Trainer discusses hours and pay in operations handoff. | Day 7 Part 1 `00:17:01-00:21:59` | B | Do not treat as Confideline payroll rule without business confirmation. |

## 9. Schedule / availability / onboarding

| Claim | Evidence | Source | Confidence | Product implication |
|---|---|---|---|---|
| Expert manually manages schedule/availability. | My Schedule visible; trainer instructs set schedule for tomorrow. | Day 3 Part 2; Day 4 Part 1; Day 7 Part 2 `02:20:49-02:22:51` | A | Schedule/tomorrow slots must be part of workmode dashboard. |
| Questionnaire appears after training/self-work condition and can block chat access. | Trainer explains account-attached form appears, not knowledge test; access returns after saving. | Day 7 Part 1 `00:13:54-00:15:59` | A | `expert.onboardingStage`, `questionnaireRequired`. |
| Future booked sessions can block questionnaire closure. | Trainer says final questionnaire may not close because future session exists; cancel via calendar. | Day 7 Part 1 `00:25:34-00:27:11` | A | Onboarding and schedule/session states interact. |
| HR/payroll/schedule call and bonus call exist after training. | Trainer mentions Wednesday call with Natasha and later bonus-system call. | Day 7 Part 1 `00:15:59-00:16:28`; Day 7 Part 2 `01:30:23-01:35:31` | A/B | Add manager checkpoints but avoid hardcoding names/days. |

## 10. Safety / risk

| Claim | Evidence | Source | Confidence | Product implication |
|---|---|---|---|---|
| Self-harm/suicide requires safety path, not sales flow. | Discussed in Day 4 Part 2 and Day 6 Part 2 as safety branch. | Day 4 Part 2; Day 6 Part 2 | A/B | `safety_escalation`, approved safety copy, suppress sales hints. |
| Pregnancy/paternity questions are high-risk. | Trainer reviews paternity/pregnancy case; competitor may frame via "energy", but Confideline should be stricter. | Day 7 Part 1 `03:16:06-03:24:03` | A | Claim precision guardrails: no pregnancy/paternity certainty. |
| Technical issues should go to support/reload/incognito, not be treated as expert failure. | Button/chat bug discussed. | Day 7 Part 2 `01:29:29-01:30:23` | A | `technical_issue` Ping/support escalation. |

## 11. Remaining evidence gaps

| Area | Current confidence | Why not higher yet | Required next check |
|---|---|---|---|
| Exact efficiency formula | C | Labels/rows mentioned but formula not visible enough | Manual close-up review of Statistic page frames/video |
| Exact active work time formula | B/C | Activity/message relationship clear, exact calculation unknown | Backend/product confirmation or clearer dashboard walkthrough |
| Pay/bonus formulas | C | Trainer speech only; may be period/status-specific | HR/payroll source or dedicated training segment |
| Coupon eligibility full contract | B | Platform/new user/expiration confirmed; full rule set absent | More promo-specific video segments or backend rules |
| Self-harm escalation exact text/path | B | Safety direction clear; exact approved flow absent | Compliance/legal protocol needed |
| Duplicate matching mechanism | B/C | Behavior observed, backend identity matching unknown | UI/backend source or more screenshots |
| AI/background functionality | C | Mentioned, unclear if internal or external | Rewatch Day 6-7 around background/AI mentions |
