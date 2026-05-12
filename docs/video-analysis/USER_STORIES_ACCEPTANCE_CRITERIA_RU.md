# User Stories и Acceptance Criteria

Документ переводит видеоанализ конкурента в пользовательские истории для разработки `admin-chat-workspace-v2`.

Формат: роль -> потребность -> результат -> acceptance criteria.

## 1. Expert: стадия диалога

### Story

Как эксперт, я хочу видеть стадию каждого чата, чтобы понимать, что нужно делать дальше: free reading, Book Now, objection, paid session или lift.

### Acceptance criteria

- В списке чатов виден stage badge.
- В right panel виден stage summary.
- Stage обновляется после ключевых событий.
- Composer hints соответствуют текущей стадии.
- Stage не ломает существующие вкладки `All / Active chats / Pings`.

## 2. Expert: previous buyer

### Story

Как эксперт, я хочу сразу видеть, что клиент уже покупал, чтобы не давать ему полный бесплатный ответ повторно и вести к paid session быстрее.

### Acceptance criteria

- Right panel показывает `previous buyer`.
- Видно количество покупок и дату последней покупки, если данные есть.
- Composer предупреждает, если previous buyer находится в полном free-reading flow.
- История покупок доступна без ухода из чата.

## 3. Expert: free reading boundary

### Story

Как эксперт, я хочу видеть лимит бесплатной стадии, чтобы дать ценность, но не раскрыть весь платный ответ.

### Acceptance criteria

- Видны `insightCount`, `freeTrial.expired`, `freeValueLimitReached`.
- При 3-4 insight система предлагает переход к Book Now.
- Если free trial закончился, composer предлагает boundary message.
- Если эксперт продолжает раскрывать тему бесплатно, появляется warning.

## 4. Expert: Book Now как состояние

### Story

Как эксперт, я хочу, чтобы Book Now был отдельным состоянием, а не просто кнопкой, чтобы после него правильно обрабатывать ответы клиента.

### Acceptance criteria

- После отправки Book Now stage становится `book_now_sent`.
- В right panel видны promised topics.
- Любое сообщение клиента после Book Now помечается как possible objection.
- Composer предлагает objection playbook, а не продолжение бесплатного ответа.

## 5. Expert: objection handling

### Story

Как эксперт, я хочу видеть тип возражения и количество попыток, чтобы не давить бесконечно и не терять клиента.

### Acceptance criteria

- Система позволяет выбрать или предложить objection type.
- Видно `attemptCount`.
- После достижения лимита появляется warning "stop pressure / schedule lift".
- Можно перевести чат в reactivation/cooldown.
- Возврат к Book Now логируется событием.

## 6. Expert: coupon eligibility

### Story

Как эксперт, я хочу видеть, можно ли дать клиенту coupon, чтобы не обещать недоступную скидку.

### Acceptance criteria

- Right panel показывает coupon eligibility.
- Видно, если coupon expired или already used.
- Coupon можно отправить копируемым сообщением.
- Coupon отправляется как часть objection handling, но не заменяет value.

## 7. Expert: active paid session

### Story

Как эксперт, я хочу видеть таймер и promised topics активной paid session, чтобы выполнить оплаченный контракт.

### Acceptance criteria

- Active paid session визуально выделяется.
- Видны timer, startsAt/endsAt и promised topics.
- Считается outboundMessageCount.
- При долгом молчании появляется urgent Ping.
- После завершения сессии можно отметить completed topics.

## 8. Expert: future paid session gating

### Story

Как эксперт, я хочу получать предупреждение, если клиент купил будущую paid session, чтобы не раскрыть ее контент заранее.

### Acceptance criteria

- При `paid_session_booked_future` right panel показывает content locked.
- Composer показывает warning при попытке раскрыть promised topic.
- Warning логируется.
- Mentor может увидеть suspected gating violation.

## 9. Expert: extension offer

### Story

Как эксперт, я хочу отделять новые темы от текущей paid session, чтобы предлагать продление или новую сессию.

### Acceptance criteria

- Есть action "offer extension / next 10 minutes".
- Новая тема может быть добавлена в proposed extension topics.
- После extension offer stage меняется на `extension_offer`.
- Conversion extension -> payment логируется.

## 10. Expert: reactivation/lift

### Story

Как эксперт, я хочу видеть, кого и когда нужно поднять, чтобы возвращать previous buyers и strong-intent clients.

### Acceptance criteria

- Pings показывает `reactivation_due`.
- У reactivation есть reason: previous buyer, recent session, failed objection, strong intent.
- Composer предлагает структуру: reason for return -> intrigue -> Book Now.
- После lift система не предлагает бесконечно добавлять новые intrigue.
- Outcome lift фиксируется.

## 11. Expert: client continuity

### Story

Как эксперт, я хочу видеть notes, previous experts и purchase history, чтобы не начинать работу с клиентом с нуля.

### Acceptance criteria

- Right panel содержит purchase history.
- Right panel содержит previous experts/comments.
- Можно добавить клиента в Favorites.
- Можно добавить note/comment.
- Негативный комментарий другого эксперта не скрывает факт покупок.

## 12. Expert: safety cases

### Story

Как эксперт, я хочу получать safety warnings, чтобы не продавать и не импровизировать в рискованных темах.

### Acceptance criteria

- Система распознает категории self-harm, health, pregnancy, paternity, legal, confidential data, off-platform, under_18.
- При self-harm stage становится `safety_escalation`.
- Sales hints подавляются или понижаются.
- Есть action "support escalation".
- Safety event попадает в QA timeline.

## 13. Expert: claim precision

### Story

Как эксперт, я хочу получать предупреждения о слишком точных или опасных утверждениях, чтобы не обещать невозможное.

### Acceptance criteria

- Система флагует exact names, guarantees, diagnosis/treatment, legal certainty, pregnancy/paternity certainty.
- Warning не обязательно блокирует отправку, но логируется.
- Mentor видит claim precision issues.

## 14. Expert: availability and schedule

### Story

Как эксперт, я хочу управлять online/offline/schedule так, чтобы не получать paid sessions, когда я недоступен.

### Acceptance criteria

- В UI виден availability state.
- Break/offline предупреждает об active paid session.
- Schedule timezone явно показан.
- Перед уходом можно увидеть будущие paid sessions.

## 15. Mentor: QA review

### Story

Как ментор, я хочу видеть диалоги с рисками, чтобы быстро разбирать ошибки экспертов.

### Acceptance criteria

- Есть mentor review queue.
- В очередь попадают paid idle risk, gating violation, high objection attempts, safety flags, refund risk.
- Timeline показывает stage transitions и events.
- Можно оставить feedback и score.

## 16. Mentor: trainee supervision

### Story

Как ментор, я хочу видеть чаты стажера и его first-shift state, чтобы контролировать допуск к самостоятельной работе.

### Acceptance criteria

- У эксперта есть onboardingStage.
- First-shift chats помечены для QA.
- Видно trainingHoursCompleted.
- Questionnaire required/pending отображается.

## 17. Operator manager: Pings

### Story

Как операционный менеджер, я хочу, чтобы Pings были очередью действий, а не просто уведомлениями.

### Acceptance criteria

- У каждого Ping есть reason, dueAt, priority и status.
- Ping можно resolve/snooze.
- Из Ping открывается нужный чат.
- Ping показывает recommended action.
- Pings покрывают paid idle, reactivation, free trial ending, safety и technical issues.

## 18. Product analyst: event analytics

### Story

Как аналитик, я хочу видеть события воронки, чтобы понимать, где теряются деньги и конверсия.

### Acceptance criteria

- Логируются Book Now, objections, payments, paid sessions, reactivation, safety.
- Можно посчитать Book Now -> payment conversion.
- Можно посчитать reactivation -> paid conversion.
- Можно найти refund risk по paid-session idle.
- Можно сравнить экспертов по stage outcomes.

## 19. Support: technical issue

### Story

Как support, я хочу видеть технические проблемы в чатах, чтобы эксперт не решал их импровизацией.

### Acceptance criteria

- Technical objection/issue создает Ping или support escalation.
- Есть категория issue: button stuck, payment, chat hidden, visibility, schedule.
- Expert может отметить "reported to support".
- Timeline хранит issue status.

## 20. Business owner: revenue protection

### Story

Как владелец продукта, я хочу видеть риски утечки ценности и refund, чтобы не терять деньги на слабой дисциплине экспертов.

### Acceptance criteria

- Есть метрика free-value leakage warnings.
- Есть метрика future paid content gating warnings.
- Есть paid-session idle/refund risk.
- Есть objection attempts over limit.
- Есть conversion by stage.

## 21. MVP story set

Для первого релиза достаточно реализовать:

1. Expert sees conversation stage.
2. Expert sees previous buyer.
3. Expert sends Book Now as stateful event.
4. Expert handles post-Book-Now objections with attempt count.
5. Expert sees active paid session timer and promised topics.
6. Expert receives paid-session idle Ping.
7. Expert receives future paid content warning.
8. Expert sees reactivation due Pings.
9. Mentor sees QA timeline for risky conversations.
10. System logs safety flags.

## 22. Non-goals for first release

- Полностью автоматический AI-ответ вместо эксперта.
- Автоматическое объединение duplicate clients без ручной проверки.
- Точные payroll/bonus formulas.
- Полная юридическая safety engine без отдельного legal review.
- Сложный ML scoring качества intrigue.
