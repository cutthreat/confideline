# Матрица: стадия -> действие эксперта -> UI support

Документ связывает регламент эксперта с интерфейсом `admin-chat-workspace-v2`.

## 1. Основная матрица

| Stage | Что должен сделать эксперт | Что должен показать UI | Автоматический риск |
|---|---|---|---|
| `new` | Проверить историю и взять чат в работу | Client profile, previous buyer, notes, Assign to me | Chat ownership gap |
| `free_reading` | Дать ограниченную ценность | Free trial state, insight counter, previous buyer warning | Free-value leakage |
| `intrigue_ready` | Сформулировать intrigue и отправить Book Now | Composer hint, Book Now action, promised topics form | Weak CTA timing |
| `book_now_sent` | Не раскрывать новую ценность, ждать оплаты/objection | Book Now status, promised topics, client response | Free-info fishing |
| `post_book_now_objection` | Классифицировать objection, вернуть к покупке | Objection type, attempt count, playbook | Infinite pressure |
| `paid_session_booked_future` | Удерживать контент до старта | Future session block, content locked warning | Future paid leakage |
| `paid_session_active` | Закрыть promised topics, не молчать | Timer, topics, outbound count, idle gap | Refund/support risk |
| `extension_offer` | Вынести новую тему в новую оплату | Extension action, proposed topics | Value leakage in paid |
| `post_session_followup` | Зафиксировать итог, note, favorite | Notes, Favorites, follow-up action | Lost buyer |
| `reactivation_due` | Сделать lift, если клиент подходит | Ping reason, history basis, lift template | Spam lift |
| `reactivation_active` | Reason -> intrigue -> Book Now | Reactivation state, stop repeat warning | Infinite intrigue |
| `cooldown_or_reactivation_due` | Не давить, поставить follow-up | Snooze/dueAt, stop pressure marker | Churn from pressure |
| `closed_or_archived` | Не держать в активной очереди | Archive state, reopen action | Queue noise |
| `safety_escalation` | Остановить sales-flow, escalate | Safety panel, approved response, support action | Legal/safety risk |

## 2. Queue support

| Stage | Queue area | Badge | Priority |
|---|---|---|---|
| `paid_session_active` | Active chats | Paid Live | urgent |
| `paid_session_booked_future` | Pings/Active | Future Paid | high |
| `post_book_now_objection` | Active chats | Objection | high |
| `reactivation_due` | Pings | Lift Due | normal |
| `free_reading` | Active chats | Free | normal |
| `safety_escalation` | Active/Pings | Safety | urgent |

## 3. Composer support

| Stage | Primary hint | Warning |
|---|---|---|
| `free_reading` | Give limited value | Too much free detail |
| `intrigue_ready` | Move to Book Now | Weak or generic intrigue |
| `book_now_sent` | Handle objection | Do not reveal more |
| `post_book_now_objection` | Answer and return to Book Now | Attempt limit |
| `paid_session_booked_future` | Hold boundary | Future content locked |
| `paid_session_active` | Answer promised topics | Paid idle risk |
| `reactivation_active` | Reason + intrigue + Book Now | Do not repeat hooks |
| `safety_escalation` | Use safety path | Sales hints suppressed |

## 4. Right panel support

| Block | Required fields | Why |
|---|---|---|
| Stage summary | stage, changedAt, next action | Expert knows workflow |
| Client continuity | previous buyer, purchases, previous experts | Avoid blind free reading |
| Paid session | status, timer, topics, idle risk | Revenue and quality |
| Book Now | status, promised topics, sentAt | Transition control |
| Objections | type, attempts, last answer | Stop infinite pressure |
| Reactivation | eligible, reason, nextActionAt | Retention |
| Offers | coupon eligibility, code, expired/used | Avoid coupon misuse |
| Risks | safety, claim precision, technical | Compliance and support |
| Notes | expert/mentor/support notes | Handoff continuity |

## 5. Events required per stage

| Stage | Events |
|---|---|
| `free_reading` | `free_trial_started`, `value_signal_delivered`, `free_value_limit_reached` |
| `book_now_sent` | `book_now_sent`, `post_book_now_client_message` |
| `post_book_now_objection` | `objection_detected`, `objection_answered`, `objection_attempt_limit_reached` |
| `paid_session_active` | `paid_session_started`, `paid_session_message_sent`, `paid_session_idle_risk`, `paid_session_ended` |
| `reactivation_active` | `reactivation_started`, `reactivation_message_sent`, `reactivation_outcome_recorded` |
| `safety_escalation` | `safety_flag_detected`, `support_escalation_created` |

## 6. MVP mapping

В MVP достаточно:

1. Stage badge in queue.
2. Stage summary in right panel.
3. Composer hint per stage.
4. Paid timer and promised topics.
5. Book Now status.
6. Objection attempts.
7. Pings reason/dueAt.
8. Safety/risk flags.

## 7. Не делать в MVP

- Не делать новые top-level tabs под каждую стадию.
- Не смешивать queue filters и stage filters без UX-решения.
- Не заменять эксперта AI-ответом.
- Не блокировать все сообщения из-за warning, кроме явно утвержденных safety/legal cases.
