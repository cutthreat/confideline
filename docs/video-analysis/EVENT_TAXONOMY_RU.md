# Event Taxonomy для Confideline Chat Workspace

Документ описывает события, которые нужно логировать для управления диалогами, Pings, QA, аналитики и mentor review.

Основа: видеоанализ конкурента, `CONVERSATION_STATE_MACHINE_RU.md`, `DATA_DICTIONARY_RU.md`.

## 1. Принципы событий

- Event фиксирует факт, который уже произошел.
- Event не должен заменять текущее состояние: состояние хранится отдельно.
- Event должен иметь actor, timestamp и conversationId.
- Event должен быть пригоден для timeline, analytics и QA.
- Events уровня safety и payment должны иметь надежный source.

## 2. Базовый event envelope

```ts
type WorkspaceEvent = {
  id: string;
  type: WorkspaceEventType;
  conversationId: string;
  clientId?: string;
  operatorId?: string;
  actorType: 'client' | 'operator' | 'system' | 'support' | 'mentor';
  occurredAt: string;
  source: 'ui' | 'backend' | 'payment' | 'automation' | 'manual_review' | 'demo';
  payload: Record<string, unknown>;
};
```

## 3. Conversation events

| Event | Actor | Payload | Создает Ping | Меняет stage | Назначение |
|---|---|---|---:|---:|---|
| `conversation_created` | system | `source`, `clientId` | Нет | Да | Новый чат |
| `conversation_assigned` | operator/system | `operatorId`, `sourceQueue` | Нет | Иногда | Ownership |
| `conversation_unassigned` | operator/system | `reason` | Да | Да | Чат остался без владельца |
| `conversation_stage_changed` | system/operator | `from`, `to`, `reason` | Иногда | Да | Audit trail |
| `conversation_archived` | operator/system | `reason` | Нет | Да | Закрытие |
| `conversation_reopened` | client/operator/system | `reason` | Да | Да | Возврат в работу |

## 4. Message events

| Event | Actor | Payload | Создает Ping | Назначение |
|---|---|---|---:|---|
| `client_message_received` | client | `messageId`, `textLength`, `detectedIntent` | Да | Очередь ответа |
| `operator_message_sent` | operator | `messageId`, `stage`, `draftProvenance` | Нет | Work time, QA |
| `message_read` | client/operator | `messageId` | Нет | Read state |
| `message_edited` | operator | `messageId`, `reason` | Нет | Audit |
| `message_deleted_or_hidden` | system/operator | `messageId`, `reason` | Иногда | Visibility/support |
| `draft_warning_shown` | system | `warningType`, `stage` | Нет | Guardrail analytics |

## 5. Free reading events

| Event | Payload | Меняет stage | QA use |
|---|---|---:|---|
| `free_trial_started` | `remainingMessages`, `remainingSeconds` | Да | Проверка начала free flow |
| `required_data_requested` | `fields` | Нет | Эксперт не отвечает вслепую |
| `value_signal_delivered` | `insightCount`, `themes` | Иногда | Баланс ценности |
| `free_value_limit_reached` | `insightCount`, `reason` | Да | Leakage prevention |
| `free_trial_expired` | `reason` | Да | Boundary / Book Now |
| `free_trial_boundary_sent` | `messageId` | Иногда | Проверка регламента |

## 6. Intrigue events

| Event | Payload | Меняет stage | QA use |
|---|---|---:|---|
| `intrigue_created` | `theme`, `specificity`, `linkedToClientQuestion` | Да | Качество intrigue |
| `intrigue_repeated` | `theme`, `repeatCount` | Нет | Риск слабой конверсии |
| `paid_content_leakage_risk_detected` | `messageId`, `reason` | Нет | Guardrail |
| `intrigue_to_book_now_ready` | `reason` | Да | Переход к CTA |

## 7. Book Now events

| Event | Actor | Payload | Меняет stage | Создает Ping |
|---|---|---|---:|---:|
| `book_now_sent` | operator/system | `promisedTopics`, `couponAttached`, `messageId` | Да | Нет |
| `book_now_clicked` | client/system | `buttonId` | Нет | Нет |
| `book_now_expired` | system | `sentAt`, `reason` | Да | Да |
| `book_now_cancelled` | client/system | `reason` | Да | Да |
| `post_book_now_client_message` | client | `messageId`, `detectedObjectionType` | Да | Да |

Business rule: после `book_now_sent` сообщения клиента без оплаты должны попадать в possible objection flow.

## 8. Payment and paid-session events

| Event | Actor | Payload | Меняет stage | Создает Ping |
|---|---|---|---:|---:|
| `payment_completed` | payment/backend | `sessionId`, `amount`, `duration`, `startsAt` | Да | Да, если future |
| `payment_failed` | payment/backend | `reason` | Нет | Да |
| `paid_session_booked_future` | backend | `sessionId`, `startsAt`, `promisedTopics` | Да | Да |
| `paid_session_started` | backend/system | `sessionId`, `timerEndsAt` | Да | Нет |
| `paid_session_message_sent` | operator | `sessionId`, `messageId`, `secondsSincePrevious` | Нет | Нет |
| `paid_session_idle_risk` | system | `sessionId`, `idleSeconds`, `threshold` | Нет | Да |
| `paid_session_topic_completed` | operator/system | `topic` | Нет | Нет |
| `paid_session_ended` | backend/system | `sessionId`, `outboundMessageCount` | Да | Иногда |
| `paid_session_cancelled` | client/backend | `sessionId`, `reason` | Да | Да |
| `refund_risk_detected` | system/support | `reason`, `sessionId` | Нет | Да |
| `refund_requested` | client/support | `sessionId`, `reason` | Нет | Да |

## 9. Paid content gating events

| Event | Payload | Severity | Назначение |
|---|---|---|---|
| `future_paid_content_warning_shown` | `futureSessionId`, `messageId?` | warning | Предотвратить раскрытие будущей сессии |
| `paid_content_gating_violation_suspected` | `futureSessionId`, `messageId`, `promisedTopic` | high | QA/mentor review |
| `paid_content_gating_violation_confirmed` | `reviewerId`, `messageId` | critical | Revenue loss analysis |

## 10. Objection events

| Event | Payload | Меняет stage | QA use |
|---|---|---:|---|
| `objection_detected` | `type`, `messageId`, `confidence` | Да | Классификация |
| `objection_answered` | `type`, `attemptNumber`, `messageId` | Нет | Качество ответа |
| `objection_returned_to_book_now` | `attemptNumber` | Да | Успех playbook |
| `objection_attempt_limit_reached` | `attemptCount`, `maxRecommendedAttempts` | Да | Stop pressure |
| `objection_flow_stopped` | `reason`, `nextActionAt` | Да | Cooldown/lift |

Типы objection:

- `price`
- `doubt`
- `free_info`
- `hidden`
- `post_book_now`
- `later`
- `aggressive`
- `technical`

## 11. Coupon events

| Event | Payload | Назначение |
|---|---|---|
| `coupon_eligibility_checked` | `eligible`, `reason`, `platform` | Не обещать недоступный discount |
| `coupon_sent` | `code`, `platform`, `messageId`, `copyable` | QA/conversion |
| `coupon_rejected` | `reason` | Почему нельзя дать |
| `coupon_used` | `code`, `paymentId` | Attribution |
| `coupon_expired_or_used_warning` | `code`, `reason` | Guardrail |

## 12. Reactivation events

| Event | Payload | Меняет stage | Создает Ping |
|---|---|---:|---:|
| `reactivation_eligibility_detected` | `reason`, `confidence` | Нет | Нет |
| `reactivation_scheduled` | `nextActionAt`, `reason` | Да | Да |
| `reactivation_started` | `reasonTemplate`, `clientHistoryBasis` | Да | Нет |
| `reactivation_message_sent` | `messageId`, `reasonTemplate` | Нет | Нет |
| `reactivation_book_now_sent` | `promisedTopics` | Да | Нет |
| `reactivation_outcome_recorded` | `outcome` | Да | Нет |
| `reactivation_stopped` | `reason`, `stopUntil` | Да | Нет |

Outcomes:

- `ignored`
- `replied`
- `book_now`
- `paid`
- `stopped`

## 13. Client continuity events

| Event | Payload | Назначение |
|---|---|---|
| `previous_buyer_detected` | `purchaseCount`, `lastPurchaseAt` | Приоритет и no full free reading |
| `purchase_history_opened` | `operatorId` | Проверка использования кабинета |
| `previous_expert_comment_read` | `commentId` | QA |
| `client_added_to_favorites` | `reason` | Follow-up |
| `client_removed_from_favorites` | `reason` | Cleanup |
| `client_note_added` | `noteId`, `category` | Continuity |
| `duplicate_client_suspected` | `basis`, `confidence` | Context hint |
| `repeat_topic_detected` | `topic`, `count` | Retention |

## 14. Safety and risk events

| Event | Payload | Severity | Меняет stage |
|---|---|---|---:|
| `safety_flag_detected` | `category`, `messageId`, `confidence` | high/critical | Да, если self-harm |
| `safety_response_suggested` | `category` | high | Нет |
| `support_escalation_created` | `category`, `conversationId` | critical | Да |
| `support_escalation_resolved` | `resolution` | high | Да |
| `claim_precision_flagged` | `category`, `messageId` | medium/high | Нет |
| `off_platform_request_detected` | `messageId` | high | Нет |
| `confidential_data_request_detected` | `messageId` | high | Нет |

Safety categories:

- `self_harm`
- `health`
- `pregnancy`
- `paternity`
- `legal`
- `confidential_data`
- `off_platform`
- `under_18`

## 15. Expert/workforce events

| Event | Payload | Назначение |
|---|---|---|
| `expert_availability_changed` | `from`, `to`, `reason` | Queue assignment |
| `expert_schedule_updated` | `timezone`, `slots` | Booking readiness |
| `expert_training_hours_updated` | `hoursCompleted`, `targetHours` | Onboarding |
| `expert_questionnaire_required` | `reason` | Access gate |
| `expert_questionnaire_submitted` | `language`, `fieldsCompleted` | Onboarding |
| `mentor_review_requested` | `reason`, `conversationId` | QA |
| `mentor_feedback_added` | `score`, `summary` | Coaching |

## 16. Ping creation rules

| Condition | Event | Ping reason | Priority |
|---|---|---|---|
| Client sent message in active flow | `client_message_received` | `client_waiting` | normal/high |
| Paid session starts soon | `paid_session_booked_future` | `paid_session_starts_soon` | high |
| Active paid session idle | `paid_session_idle_risk` | `paid_session_idle_risk` | urgent |
| Free trial near limit | `free_value_limit_reached` | `free_trial_ending` | high |
| Reactivation due | `reactivation_scheduled` | `next_day_lift_due` | normal |
| Objection flow stopped | `objection_flow_stopped` | `failed_objection_followup` | normal |
| Safety risk | `safety_flag_detected` | `safety_escalation` | urgent |
| Technical issue | `objection_detected(type=technical)` | `technical_issue` | high |

## 17. MVP event set

Минимум для первой реализации:

- `conversation_stage_changed`
- `client_message_received`
- `operator_message_sent`
- `free_value_limit_reached`
- `book_now_sent`
- `post_book_now_client_message`
- `objection_detected`
- `objection_answered`
- `payment_completed`
- `paid_session_started`
- `paid_session_idle_risk`
- `paid_session_ended`
- `future_paid_content_warning_shown`
- `reactivation_scheduled`
- `reactivation_started`
- `safety_flag_detected`
- `claim_precision_flagged`
- `ping_created`
- `ping_resolved`

## 18. Open questions

- Какие events должны приходить только от backend/payment, а какие можно создавать на клиенте?
- Нужно ли хранить полный event log в demo data или достаточно агрегированного timeline?
- Какой SLA для paid session idle risk: 2 минуты, 3 минуты или настраиваемый threshold?
- Какие safety events должны блокировать отправку сообщения, а какие только предупреждать?
