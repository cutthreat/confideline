# Admin Chat Workspace V2: backlog по итогам видеоанализа

Документ переводит видеоанализ конкурента InsightOrba в backlog для развития Confideline `admin-chat-workspace-v2`.

Это не финальный product spec. Это аргументированный список задач и направлений, где каждая тема привязана к наблюдениям из видео: Book Now, free reading, paid session, objections, reactivation/lift, client continuity, safety и workforce/onboarding.

## 1. Цели продукта

Workspace должен помогать оператору не просто отвечать в чатах, а управлять продажной и сервисной воронкой:

- быстро брать релевантные активные чаты;
- понимать стадию клиента;
- не отдавать платную ценность бесплатно;
- вовремя отправлять Book Now;
- качественно вести paid session;
- удерживать previous buyers;
- поднимать клиентов через reactivation/lift;
- видеть риски: refund, safety, claim precision, free-value leakage;
- давать ментору и бизнесу данные для QA.

## 2. Приоритеты

| Priority | Смысл |
|---|---|
| P0 | Нужен для корректной бизнес-логики и предотвращения потерь денег/рисков |
| P1 | Сильно повышает качество работы и конверсию |
| P2 | Улучшает управление, аналитику и обучение |
| P3 | Полезно позже, после стабилизации основной логики |

## 3. Epic: Conversation stage machine

### P0. Добавить явную стадию диалога

Проблема: без `conversation.stage` UI не понимает, чем является текущий чат: free reading, objection, paid session, lift или safety case.

Минимальные стадии:

- `new`
- `free_reading`
- `intrigue_ready`
- `book_now_sent`
- `post_book_now_objection`
- `paid_session_booked_future`
- `paid_session_active`
- `extension_offer`
- `post_session_followup`
- `reactivation_due`
- `reactivation_active`
- `cooldown_or_reactivation_due`
- `closed_or_archived`
- `safety_escalation`

Acceptance criteria:

- stage хранится в demo data / contract layer;
- stage виден в списке чатов;
- stage виден в right panel;
- stage влияет на composer hints;
- stage участвует в queue/pings logic.

Связанные документы:

- `CONVERSATION_STATE_MACHINE_RU.md`
- `INSIGHTORBA_COMPETITOR_WORKFLOW_FULL_DOCUMENTATION_RU.md`, разделы 5 и 9.

### P0. Логировать transition events

События:

- `book_now_sent`
- `payment_completed`
- `paid_session_started`
- `paid_session_idle_risk`
- `objection_answered`
- `reactivation_scheduled`
- `reactivation_started`
- `safety_flag_detected`

Acceptance criteria:

- каждое событие имеет timestamp;
- событие можно показать в activity timeline;
- событие может создавать Ping;
- событие можно использовать для QA.

## 4. Epic: Book Now

### P0. Сделать Book Now first-class событием

Проблема: в видео Book Now является бизнес-переходом, а не просто кнопкой.

Нужно:

- хранить `bookNow.status`;
- хранить `bookNow.sentAt`;
- хранить `bookNow.promisedTopics`;
- хранить `bookNow.couponAttached`;
- после Book Now переключать composer в режим objection handling.

Acceptance criteria:

- после отправки Book Now стадия меняется на `book_now_sent`;
- клиентское сообщение после Book Now классифицируется как possible objection;
- right panel показывает promised topics;
- composer предупреждает, если эксперт раскрывает новую ценность после Book Now.

### P1. Book Now outcome tracking

Нужно видеть:

- оплатил ли клиент;
- сколько времени прошло до оплаты;
- какое objection было перед оплатой;
- какой coupon участвовал;
- кто отправил Book Now;
- была ли отмена/неявка.

## 5. Epic: Paid session

### P0. Paid-session timer и статус

Поля:

```ts
type PaidSessionState = {
  id: string;
  status: 'booked-future' | 'active' | 'ended' | 'cancelled';
  startsAt?: string;
  endsAt?: string;
  timerEndsAt?: string;
  promisedTopics: string[];
  outboundMessageCount: number;
  lastExpertMessageAt?: string;
  idleRisk: boolean;
  refundRisk: boolean;
};
```

Acceptance criteria:

- active paid session визуально выделяется;
- timer виден в chat header или right panel;
- promised topics видны рядом с таймером;
- при молчании создается Ping;
- считается outbound message count.

### P0. Paid content gating

Проблема: эксперт не должен выдавать контент будущей оплаченной сессии заранее.

Acceptance criteria:

- если `paidSession.status = booked-future`, composer показывает warning;
- если эксперт пишет ответ, похожий на раскрытие promised topic, показывается guardrail;
- в right panel явно видно: "future paid session, content locked until start";
- событие `paid_content_gating_warning` логируется.

### P1. Extension offer flow

Нужно:

- отдельная стадия `extension_offer`;
- быстрый action "offer next 10 minutes";
- привязка новых тем к новой оплате;
- аналитика conversion from paid session to extension.

## 6. Epic: Objections

### P0. Objection tracking

Типы:

- `price`
- `doubt`
- `free_info`
- `hidden`
- `post_book_now`
- `later`
- `aggressive`
- `technical`

Acceptance criteria:

- objection type хранится в state;
- attempt count виден эксперту;
- после 3-4 попыток появляется warning "stop pressure / schedule lift";
- objection handling может вернуть чат в `book_now_sent`;
- objection handling может поставить `reactivation_due`.

### P1. Objection playbook в right panel/composer

Показывать короткие подсказки:

- price: value reframing, then coupon if eligible;
- doubt: calm trust-building, no argument;
- free-info: boundary to paid session;
- later: schedule follow-up;
- aggressive: neutral tone, no conflict.

## 7. Epic: Free reading / trial

### P0. Free trial boundary

Поля:

- `freeTrial.active`;
- `freeTrial.remainingMessages`;
- `freeTrial.remainingSeconds`;
- `freeTrial.expired`;
- `freeTrial.boundaryMessageSent`;
- `freeTrial.insightCount`;
- `freeTrial.freeValueLimitReached`.

Acceptance criteria:

- right panel показывает free trial state;
- composer предупреждает о слишком полном бесплатном ответе;
- previous buyer не получает полный новый free reading без причины;
- после expiry предлагается Book Now.

### P1. Insight counter / value signal tracking

Нужно не считать слова, а помогать эксперту держать баланс:

- 0 insight: мало ценности;
- 1-2 insight: можно прогревать;
- 3-4 insight: пора Book Now;
- больше: риск free-value leakage.

## 8. Epic: Reactivation / Pings

### P0. Переосмыслить Pings как follow-up queue

Pings должны включать:

- next-day lift due;
- previous buyer follow-up;
- failed objection follow-up;
- paid session starts soon;
- paid session idle risk;
- free trial ending;
- safety/support required.

Acceptance criteria:

- Ping имеет reason;
- Ping имеет dueAt;
- Ping связан с conversation stage;
- Ping можно resolve/snooze;
- из Ping можно открыть чат и увидеть recommended action.

### P1. Reactivation workflow

Поля:

- `reactivation.eligible`;
- `reactivation.eligibilityReason`;
- `reactivation.nextActionAt`;
- `reactivation.reasonTemplate`;
- `reactivation.lastLiftAt`;
- `reactivation.attemptCount`;
- `reactivation.stopUntil`.

Acceptance criteria:

- lift доступен не всем подряд, а previous buyers / strong intent / failed objection;
- expert выбирает или фиксирует reason for return;
- после lift не предлагается бесконечно добавлять новую intrigue;
- outcome логируется: ignored, replied, Book Now, paid.

## 9. Epic: Client continuity

### P1. Right panel: история клиента

Блоки:

- previous buyer badge;
- purchase history;
- previous experts;
- previous chats;
- notes/comments;
- duplicate/new chat suspected;
- favorite status;
- repeat topic.

Acceptance criteria:

- эксперт видит, покупал ли клиент раньше;
- эксперт видит, были ли покупки у других экспертов;
- эксперт может добавить в Favorites;
- эксперт может оставить note;
- негативные comments не скрывают purchase history.

### P2. Duplicate/new chat detection hints

Если система подозревает, что это тот же клиент в новом чате:

- показать possible duplicate;
- показать похожие темы/имена/покупки;
- не делать автоматическое слияние без уверенности.

## 10. Epic: Safety and claim precision

### P0. Safety flags

Категории:

- `self_harm`
- `health`
- `pregnancy`
- `paternity`
- `legal`
- `confidential_data`
- `off_platform`
- `under_18`

Acceptance criteria:

- safety flag виден в right panel;
- composer показывает предупреждение;
- self-harm переводит stage в `safety_escalation`;
- есть action "mark support escalation";
- sales hints скрываются или понижаются при safety case.

### P1. Claim precision guardrails

Флаги:

- exact name claim;
- guaranteed outcome;
- diagnosis/treatment;
- legal certainty;
- paternity/pregnancy certainty.

Acceptance criteria:

- warning не блокирует каждое сообщение, но фиксирует risky claim;
- mentor видит claim precision issues в QA.

## 11. Epic: Composer

### P1. Stage-aware composer hints

Hints:

- free reading: "keep value limited";
- intrigue: "connect to client question";
- Book Now: "answer objection, do not reveal more";
- future paid session: "content locked until start";
- active paid session: "answer promised topics, watch timer";
- reactivation: "reason + intrigue + Book Now";
- safety: "use safety response, no sales push".

Acceptance criteria:

- hints меняются при stage transition;
- hints не занимают много места;
- hints можно collapse;
- warning-level hints визуально отличаются от advice-level hints.

### P2. Draft provenance

Отмечать, откуда взялся черновик:

- manual;
- template;
- AI-assisted;
- translated;
- edited after AI.

Это важно, потому что в видео AI/translator используются как помощь, но ответственность за тон, смысл и конверсию остается на эксперте.

## 12. Epic: Dashboard and QA

### P1. Conversation QA timeline

Показывать:

- stage transitions;
- Book Now;
- objections;
- payment;
- session start/end;
- idle risk;
- reactivation;
- safety flags;
- coupons.

### P2. Expert performance metrics

Метрики:

- active hours;
- sent messages;
- paid sessions;
- conversion Book Now -> payment;
- refund/support risk;
- average paid-session silence gap;
- reactivation conversion;
- objection handling success;
- safety incidents.

Точные формулы dashboard у конкурента не подтверждены полностью, поэтому внедрять как собственную модель Confideline.

### P2. Mentor QA queue

Очередь для ревью:

- paid session with idle risk;
- future paid content leakage warning;
- high objection attempts;
- safety flag;
- low conversion with high activity;
- repeated template/copy-paste smell;
- trainee/new expert chats.

## 13. Epic: Workforce / onboarding

### P2. Expert onboarding state

Стадии:

- `training`;
- `self_work`;
- `questionnaire_required`;
- `hr_call_pending`;
- `bonus_call_pending`;
- `first_shift`;
- `active`.

Acceptance criteria:

- mentor видит статус эксперта;
- questionnaire completion visible;
- schedule readiness visible;
- first-shift chats can be flagged for QA.

### P3. Schedule/pay context

Из видео есть упоминания часов, ставок и звонков, но точные условия требуют проверки. Поэтому в продукте пока фиксировать только:

- availability;
- schedule;
- planned hours;
- actual active time;
- training completion;
- manager/mentor checkpoints.

## 14. Рекомендуемый порядок реализации

### Milestone 1: State foundation

1. Добавить demo fields для `conversation.stage`.
2. Добавить Book Now state.
3. Добавить paidSession state.
4. Добавить right-panel stage summary.
5. Добавить basic composer hints.

### Milestone 2: Queue and Pings

1. Связать Pings с reason/dueAt.
2. Добавить paid-session idle ping.
3. Добавить reactivation due ping.
4. Добавить free trial ending ping.
5. Добавить safety escalation ping.

### Milestone 3: Revenue controls

1. Paid content gating.
2. Objection attempt counter.
3. Coupon eligibility block.
4. Extension offer flow.
5. Free-value leakage warning.

### Milestone 4: Continuity and retention

1. Previous buyer block.
2. Purchase history.
3. Previous experts/comments.
4. Favorites.
5. Reactivation workflow.

### Milestone 5: QA and workforce

1. QA timeline.
2. Mentor review queue.
3. Expert performance metrics.
4. Onboarding states.
5. Training/first-shift QA markers.

## 15. Open questions

- Нужно ли делать strict backend state machine или сначала demo/client-side model?
- Какие events уже есть в текущих queue/message contracts?
- Какой источник правды для payment/session: backend, webhook, CRM state или mock data?
- Как Confideline юридически формулирует safety responses?
- Какие coupons реально существуют в нашей бизнес-модели?
- Нужен ли AI composer как часть MVP или только guardrails/hints?
- Как измерять active work time: по онлайн-статусу, отправленным сообщениям или paid-session activity?

## 16. Definition of Done для первого продуктового слоя

Первый слой можно считать готовым, если:

- у каждого demo conversation есть stage;
- Book Now виден как событие и состояние;
- active paid session имеет timer, promised topics и idle risk;
- Pings имеют reason и dueAt;
- right panel показывает client continuity и risk blocks;
- composer дает stage-aware hints;
- QA-чеклист можно применить к demo conversations;
- новая логика не ломает существующее различие `All / Active chats / Pings`.
