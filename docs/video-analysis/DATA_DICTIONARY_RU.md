# Data Dictionary для Admin Chat Workspace V2

Документ фиксирует целевые поля данных, которые нужны Confideline для реализации логики, восстановленной по видео конкурента: free reading, Book Now, paid session, objections, reactivation/lift, client continuity, safety и onboarding.

Это не текущая схема backend. Это продуктовый словарь данных для согласования contracts, demo data, UI и аналитики.

## 1. Принципы

- Каждое важное бизнес-состояние должно храниться явно, а не только вычисляться из текста сообщений.
- Состояния должны быть пригодны для UI, Pings, QA, аналитики и mentor review.
- Поля с неполной уверенностью отмечаются как `confidence: medium`.
- Денежные, юридические и safety-поля должны иметь источник правды, а не редактироваться только вручную оператором.

## 2. Conversation

| Поле | Тип | Обяз. | Пример | Назначение | Confidence |
|---|---|---:|---|---|---|
| `conversation.id` | `string` | Да | `conv_123` | Идентификатор диалога | high |
| `conversation.stage` | `ConversationStage` | Да | `book_now_sent` | Главная бизнес-стадия | high |
| `conversation.stageChangedAt` | `datetime` | Да | `2026-05-13T10:15:00Z` | Давность стадии, overdue logic | high |
| `conversation.sourceQueue` | `all | active | pings | archive` | Да | `active` | Откуда открыт чат | high |
| `conversation.assignedOperatorId` | `string?` | Нет | `expert_42` | Ownership чата | high |
| `conversation.assignedAt` | `datetime?` | Нет | `...` | Контроль "взял чат - работай" | high |
| `conversation.lastClientMessageAt` | `datetime?` | Нет | `...` | Ожидание ответа | high |
| `conversation.lastExpertMessageAt` | `datetime?` | Нет | `...` | Idle risk | high |
| `conversation.lastActivityAt` | `datetime` | Да | `...` | Сортировка и очереди | high |
| `conversation.language` | `string?` | Нет | `en` | Перевод/шаблоны/локаль | medium |
| `conversation.visibilityState` | `active | hidden | deleted | banned | archived` | Нет | `active` | Поддержка hidden/deleted/banned cases | medium |

```ts
type ConversationStage =
  | 'new'
  | 'free_reading'
  | 'intrigue_ready'
  | 'book_now_sent'
  | 'post_book_now_objection'
  | 'paid_session_booked_future'
  | 'paid_session_active'
  | 'extension_offer'
  | 'post_session_followup'
  | 'reactivation_due'
  | 'reactivation_active'
  | 'cooldown_or_reactivation_due'
  | 'closed_or_archived'
  | 'safety_escalation';
```

## 3. Client

| Поле | Тип | Обяз. | Пример | Назначение | Confidence |
|---|---|---:|---|---|---|
| `client.id` | `string` | Да | `client_88` | Идентификатор клиента | high |
| `client.displayName` | `string` | Да | `Mary` | Отображение в UI | high |
| `client.ageVerified` | `boolean?` | Нет | `true` | 18+ boundary | medium |
| `client.previousBuyer` | `boolean` | Да | `true` | Не давать полный free reading повторно | high |
| `client.purchaseHistoryCount` | `number` | Да | `4` | Retention/priority | high |
| `client.lastPurchaseAt` | `datetime?` | Нет | `...` | Reactivation timing | high |
| `client.purchasedFromOtherExperts` | `boolean?` | Нет | `true` | Cross-expert continuity | high |
| `client.repeatTopic` | `boolean?` | Нет | `true` | Клиент часто спрашивает одно и то же | high |
| `client.duplicateOrNewChatSuspected` | `boolean?` | Нет | `true` | Возможный тот же клиент в новом чате | medium |
| `client.addedToFavorites` | `boolean` | Да | `false` | Follow-up control | high |
| `client.favoriteReason` | `string?` | Нет | `buyer follow-up` | Почему добавлен | medium |
| `client.riskTags` | `string[]` | Нет | `['refund-risk']` | QA/mentor flags | high |

## 4. Free trial / free reading

| Поле | Тип | Обяз. | Пример | Назначение | Confidence |
|---|---|---:|---|---|---|
| `freeTrial.active` | `boolean` | Да | `true` | Идет бесплатная стадия | high |
| `freeTrial.remainingMessages` | `number?` | Нет | `2` | Лимит сообщений, если есть | medium |
| `freeTrial.remainingSeconds` | `number?` | Нет | `300` | Лимит времени, если есть | medium |
| `freeTrial.expired` | `boolean` | Да | `false` | Пора boundary/Book Now | high |
| `freeTrial.boundaryMessageSent` | `boolean` | Да | `false` | Уже обозначили границу | high |
| `freeTrial.insightCount` | `number` | Да | `3` | Баланс ценности и leakage | high |
| `freeTrial.freeValueLimitReached` | `boolean` | Да | `true` | Не давать больше бесплатно | high |
| `freeTrial.requiredDataMissing` | `boolean` | Нет | `false` | Нужно уточнить контекст | high |

## 5. Intrigue

| Поле | Тип | Обяз. | Пример | Назначение | Confidence |
|---|---|---:|---|---|---|
| `intrigue.theme` | `string?` | Нет | `relationship third party` | Тема крючка | high |
| `intrigue.specificity` | `low | medium | high` | Нет | `medium` | Не слишком общая интрига | medium |
| `intrigue.revealsPaidContent` | `boolean` | Да | `false` | Guardrail от утечки ценности | high |
| `intrigue.attemptCountByTheme` | `Record<string, number>` | Нет | `{money: 2}` | Не повторять одно и то же | medium |
| `intrigue.lastSentAt` | `datetime?` | Нет | `...` | Timing | medium |

## 6. Book Now

| Поле | Тип | Обяз. | Пример | Назначение | Confidence |
|---|---|---:|---|---|---|
| `bookNow.status` | `not_sent | sent | clicked | paid | expired | cancelled` | Да | `sent` | Центральное transition state | high |
| `bookNow.sentAt` | `datetime?` | Нет | `...` | Время CTA | high |
| `bookNow.sentByOperatorId` | `string?` | Нет | `expert_42` | QA attribution | high |
| `bookNow.promisedTopics` | `string[]` | Да | `['his feelings', 'next step']` | Контракт paid session | high |
| `bookNow.couponAttached` | `boolean` | Да | `true` | Discount context | high |
| `bookNow.lastClientResponseAt` | `datetime?` | Нет | `...` | Objection detection | high |
| `bookNow.paymentDeadlineAt` | `datetime?` | Нет | `...` | Expiry/cooldown | medium |

## 7. Paid session

| Поле | Тип | Обяз. | Пример | Назначение | Confidence |
|---|---|---:|---|---|---|
| `paidSession.id` | `string` | Нет | `sess_12` | Идентификатор сессии | high |
| `paidSession.status` | `booked_future | active | ended | cancelled | refunded` | Да | `active` | Paid workflow | high |
| `paidSession.startsAt` | `datetime?` | Нет | `...` | Future gating | high |
| `paidSession.endsAt` | `datetime?` | Нет | `...` | Timer | high |
| `paidSession.timerEndsAt` | `datetime?` | Нет | `...` | UI timer | high |
| `paidSession.durationMinutes` | `number?` | Нет | `10` | Product package | high |
| `paidSession.promisedTopics` | `string[]` | Да | `[...]` | Что надо закрыть | high |
| `paidSession.completedTopics` | `string[]` | Да | `[...]` | QA | medium |
| `paidSession.outboundMessageCount` | `number` | Да | `8` | Message density | high |
| `paidSession.lastExpertMessageAt` | `datetime?` | Нет | `...` | Silence risk | high |
| `paidSession.idleSeconds` | `number?` | Нет | `150` | Pings/QA | high |
| `paidSession.idleRisk` | `boolean` | Да | `true` | Refund prevention | high |
| `paidSession.refundRisk` | `boolean` | Да | `false` | Support risk | high |
| `paidSession.extensionOffered` | `boolean` | Да | `false` | Upsell/next 10 min | high |
| `paidSession.futureContentLocked` | `boolean` | Да | `true` | Paid content gating | high |

## 8. Objection

| Поле | Тип | Обяз. | Пример | Назначение | Confidence |
|---|---|---:|---|---|---|
| `objection.active` | `boolean` | Да | `true` | Сейчас идет objection flow | high |
| `objection.type` | `ObjectionType` | Нет | `price` | Playbook и analytics | high |
| `objection.attemptCount` | `number` | Да | `2` | Лимит попыток | high |
| `objection.maxRecommendedAttempts` | `number` | Да | `3` | Guardrail; точное число требует настройки | medium |
| `objection.lastAnsweredAt` | `datetime?` | Нет | `...` | Overdue | high |
| `objection.returnedToBookNow` | `boolean` | Да | `true` | Проверка качества ответа | high |
| `objection.stopPressureRecommended` | `boolean` | Да | `false` | Перевод в cooldown/lift | high |

```ts
type ObjectionType =
  | 'price'
  | 'doubt'
  | 'free_info'
  | 'hidden'
  | 'post_book_now'
  | 'later'
  | 'aggressive'
  | 'technical';
```

## 9. Coupon

| Поле | Тип | Обяз. | Пример | Назначение | Confidence |
|---|---|---:|---|---|---|
| `coupon.eligible` | `boolean` | Да | `true` | Можно ли давать скидку | high |
| `coupon.code` | `string?` | Нет | `NEW50` | Код | medium |
| `coupon.platform` | `string?` | Нет | `web` | Platform-specific codes | high |
| `coupon.reason` | `string?` | Нет | `new user` | Обоснование | medium |
| `coupon.alreadyUsed` | `boolean` | Нет | `false` | Не обещать недоступное | high |
| `coupon.expired` | `boolean` | Нет | `false` | Не обещать недоступное | high |
| `coupon.sentAt` | `datetime?` | Нет | `...` | QA/analytics | high |
| `coupon.sentAsCopyableMessage` | `boolean` | Нет | `true` | Клиент может скопировать | high |

## 10. Reactivation / lift

| Поле | Тип | Обяз. | Пример | Назначение | Confidence |
|---|---|---:|---|---|---|
| `reactivation.eligible` | `boolean` | Да | `true` | Не поднимать всех подряд | high |
| `reactivation.eligibilityReason` | `previous_buyer | recent_session | failed_objection | strong_intent | manual` | Нет | `previous_buyer` | Почему можно поднимать | high |
| `reactivation.nextActionAt` | `datetime?` | Нет | `...` | Ping scheduling | high |
| `reactivation.reasonTemplate` | `string?` | Нет | `after_session_checked` | Причина возвращения | high |
| `reactivation.lastLiftAt` | `datetime?` | Нет | `...` | Не спамить | high |
| `reactivation.attemptCount` | `number` | Да | `1` | QA/stop rules | high |
| `reactivation.stopUntil` | `datetime?` | Нет | `...` | Cooldown | medium |
| `reactivation.outcome` | `ignored | replied | book_now | paid | stopped` | Нет | `replied` | Аналитика | high |

## 11. Safety and claim precision

| Поле | Тип | Обяз. | Пример | Назначение | Confidence |
|---|---|---:|---|---|---|
| `safety.active` | `boolean` | Да | `false` | Есть активный риск | high |
| `safety.flags` | `SafetyFlag[]` | Да | `['self_harm']` | Категории риска | high |
| `safety.escalatedToSupport` | `boolean` | Да | `false` | Support path | high |
| `safety.salesHintsSuppressed` | `boolean` | Да | `true` | Не продавать в safety case | high |
| `safety.lastFlaggedMessageId` | `string?` | Нет | `msg_7` | Источник риска | high |
| `claimPrecision.flags` | `ClaimPrecisionFlag[]` | Да | `['exact_name']` | Overclaiming risk | high |
| `claimPrecision.warningShown` | `boolean` | Да | `true` | Guardrail | medium |

```ts
type SafetyFlag =
  | 'self_harm'
  | 'health'
  | 'pregnancy'
  | 'paternity'
  | 'legal'
  | 'confidential_data'
  | 'off_platform'
  | 'under_18';

type ClaimPrecisionFlag =
  | 'exact_name'
  | 'guaranteed_outcome'
  | 'diagnosis_or_treatment'
  | 'legal_certainty'
  | 'pregnancy_certainty'
  | 'paternity_certainty';
```

## 12. Ping

| Поле | Тип | Обяз. | Пример | Назначение | Confidence |
|---|---|---:|---|---|---|
| `ping.id` | `string` | Да | `ping_1` | Идентификатор | high |
| `ping.conversationId` | `string` | Да | `conv_123` | Связь с чатом | high |
| `ping.reason` | `PingReason` | Да | `paid_session_idle_risk` | Почему создан | high |
| `ping.dueAt` | `datetime` | Да | `...` | Когда реагировать | high |
| `ping.priority` | `low | normal | high | urgent` | Да | `urgent` | Сортировка | high |
| `ping.status` | `open | snoozed | resolved` | Да | `open` | Управление очередью | high |
| `ping.recommendedAction` | `string?` | Нет | `send paid session message` | Подсказка | high |

```ts
type PingReason =
  | 'client_waiting'
  | 'paid_session_starts_soon'
  | 'paid_session_idle_risk'
  | 'free_trial_ending'
  | 'next_day_lift_due'
  | 'failed_objection_followup'
  | 'safety_escalation'
  | 'technical_issue';
```

## 13. Expert / workforce

| Поле | Тип | Обяз. | Пример | Назначение | Confidence |
|---|---|---:|---|---|---|
| `expert.id` | `string` | Да | `expert_42` | Идентификатор | high |
| `expert.availabilityState` | `online | offline | break | in_paid_session` | Да | `online` | Queue assignment | high |
| `expert.scheduleTimezone` | `string?` | Нет | `Europe/Minsk` | Ошибки расписания | high |
| `expert.onboardingStage` | `ExpertOnboardingStage` | Нет | `first_shift` | Training/workforce layer | high |
| `expert.trainingHoursCompleted` | `number?` | Нет | `36` | Training completion | medium |
| `expert.questionnaireRequired` | `boolean?` | Нет | `true` | Блокировка/допуск | high |
| `expert.managerCallPending` | `boolean?` | Нет | `true` | HR/payroll step | medium |

```ts
type ExpertOnboardingStage =
  | 'training'
  | 'self_work'
  | 'questionnaire_required'
  | 'hr_call_pending'
  | 'bonus_call_pending'
  | 'first_shift'
  | 'active';
```

## 14. Draft provenance

| Поле | Тип | Обяз. | Пример | Назначение | Confidence |
|---|---|---:|---|---|---|
| `draft.provenance` | `manual | template | ai_assisted | translated | edited_after_ai` | Нет | `ai_assisted` | Контроль AI/translator use | medium |
| `draft.templateId` | `string?` | Нет | `obj_price_1` | Шаблоны | medium |
| `draft.aiWarningShown` | `boolean?` | Нет | `true` | AI guardrails | medium |
| `draft.editedByOperator` | `boolean?` | Нет | `true` | Эксперт отвечает за смысл | medium |

## 15. Минимальный набор для MVP

P0 data fields:

- `conversation.stage`
- `conversation.stageChangedAt`
- `client.previousBuyer`
- `client.purchaseHistoryCount`
- `freeTrial.active`
- `freeTrial.expired`
- `freeTrial.insightCount`
- `bookNow.status`
- `bookNow.promisedTopics`
- `paidSession.status`
- `paidSession.timerEndsAt`
- `paidSession.promisedTopics`
- `paidSession.idleRisk`
- `objection.type`
- `objection.attemptCount`
- `reactivation.eligible`
- `reactivation.nextActionAt`
- `safety.flags`
- `ping.reason`
- `ping.dueAt`

P1 data fields:

- `coupon.eligible`
- `coupon.alreadyUsed`
- `paidSession.outboundMessageCount`
- `paidSession.refundRisk`
- `client.purchasedFromOtherExperts`
- `client.addedToFavorites`
- `claimPrecision.flags`
- `expert.availabilityState`

## 16. Открытые вопросы

- Какие поля должны приходить с backend, а какие допустимо держать только в client-side demo?
- Есть ли реальный payment/session source of truth?
- Какой точный лимит objection attempts принимает бизнес: 3 или 3-4?
- Как юридически формулируются safety responses в Confideline?
- Какие coupon types реально существуют в продукте?
- Нужно ли хранить AI draft provenance в первой версии?
