# Implementation mapping к текущему Confideline workspace

Документ связывает продуктовые выводы видеоанализа с текущими файлами `admin-chat-workspace-v2`.

## 1. Текущая точка входа

Основной пакет:

- `web/admin-chat-workspace-v2/index.html`
- `web/admin-chat-workspace-v2/assets/agent_chat_custom.js`
- `web/admin-chat-workspace-v2/assets/agent_chat_custom.css`
- `web/admin-chat-workspace-v2/CHAT_QUEUE_CONTRACT.md`
- `web/admin-chat-workspace-v2/CHAT_MESSAGE_DATA_CONTRACT.md`
- `web/admin-chat-workspace-v2/WORKSPACE_V2_HANDOFF.md`
- `web/admin-chat-workspace-v2/CHAT_WORKSPACE_V2_MIGRATION_GUIDE.md`

Важно: контракты лежат внутри `web/admin-chat-workspace-v2`, а не в корне репозитория.

## 2. Что уже есть

Из текущих контрактов и JS:

- queue cards имеют `data-workload-type="active_chat|ping"`;
- queue payload строится через `getQueueStatePayload(root, changedBy)`;
- queue update идет через `requestQueueStateUpdate(payload)`;
- demo фильтрация через `applyDemoQueueState(root, payload)`;
- переключение диалога через `bindConversationSwitcher()`;
- demo switch через `applyDemoConversationSwitch(payload)`;
- composer имеет режимы `direct`, `reply`, `edit`;
- composer payload собирается через `getComposerServerPayload()`;
- send wrapper через `handleComposerSend()`;
- actions прототипа идут через `data-prototype-action`;
- offer drafts через `data-offer-action`;
- right panel уже содержит flags/action context;
- `open-flags` переключает правую панель на flags, отдельной `#modalControlFlags` в текущем HTML нет.

## 3. Основной gap

Сейчас workspace знает рабочие очереди и визуальные flags, но не хранит полноценную бизнес-стадию конкуренто-подобного lifecycle:

```text
free_reading -> intrigue_ready -> book_now_sent -> objection -> paid_session -> reactivation
```

Нужно добавить explicit state layer поверх существующих queue/message contracts.

## 4. Изменения в `CHAT_QUEUE_CONTRACT.md`

Добавить к queue card data contract:

```text
data-conversation-stage
data-stage-changed-at
data-client-previous-buyer
data-paid-session-status
data-book-now-status
data-objection-type
data-objection-attempt-count
data-reactivation-due-at
data-ping-reason
data-risk-flags
```

Расширить response `conversations[]`:

```json
{
  "conversation_id": "c2",
  "workload_type": "active_chat",
  "conversation_stage": "book_now_sent",
  "stage_changed_at": "2026-05-13T10:15:00Z",
  "client": {
    "previous_buyer": true,
    "purchase_history_count": 3
  },
  "book_now": {
    "status": "sent",
    "promised_topics": ["feelings", "next step"]
  },
  "paid_session": {
    "status": "active",
    "timer_ends_at": "2026-05-13T10:25:00Z",
    "idle_risk": false
  },
  "ping": {
    "reason": "paid_session_idle_risk",
    "due_at": "2026-05-13T10:18:00Z",
    "priority": "urgent"
  },
  "risk_flags": ["future_locked"]
}
```

Обновить смысл `Pings`:

- сохранить текущую идею warm leads;
- расширить до action queue: reactivation due, paid idle, paid starts soon, free ending, safety, technical.

## 5. Изменения в `CHAT_MESSAGE_DATA_CONTRACT.md`

Добавить message/system event attributes:

```text
data-workflow-event-type
data-workflow-event-payload
data-message-risk-flags
data-draft-provenance
data-paid-content-warning
```

Добавить system kinds:

```text
payment
hint
typing
book_now
paid_session
objection
reactivation
safety
technical
```

Расширить composer state:

- не менять primary modes `direct|reply|edit`;
- добавить secondary workflow context:

```html
<div id="conversationInputArea"
     data-composer-mode="direct"
     data-workflow-stage="book_now_sent"
     data-composer-warning="paid_content_locked">
</div>
```

Важно: workflow stage не должен становиться четвертым composer mode. Это отдельный контекст поверх `direct/reply/edit`.

## 6. Изменения в `index.html`

Зоны:

- queue cards: добавить stage/risk badges;
- header: добавить compact stage + paid timer;
- composer: добавить hint/warning area;
- right panel: добавить blocks для stage, Book Now, paid session, objections, reactivation, safety;
- Pings tab: показывать reason/dueAt/recommended action.

Минимальные элементы:

```html
<span class="stage-badge" data-stage="book_now_sent">Book Now</span>
<section class="workflow-hint-panel"></section>
<section class="right-panel-block" data-block="paid-session"></section>
<section class="right-panel-block" data-block="objection"></section>
```

## 7. Изменения в `agent_chat_custom.js`

Добавить helper layer:

```js
getConversationStage(itemOrRoot)
setConversationStage(root, stage, reason)
getWorkflowContext(root)
applyWorkflowContext(root, context)
renderStageBadge(target, stage)
renderComposerHint(root, context)
renderPaidSessionBlock(root, paidSession)
renderObjectionBlock(root, objection)
renderReactivationBlock(root, reactivation)
renderSafetyBlock(root, safety)
```

Расширить:

- `getQueueStatePayload`: добавить stage/risk filters позже, но не ломать independent filter zones;
- `applyDemoQueueState`: учитывать `data-conversation-stage`, `data-ping-reason`, risk badges;
- `getConversationSwitchPayload`: передавать stage, paidSession, bookNow, objection, reactivation;
- `applyDemoConversationSwitch`: обновлять header/right panel/composer hints;
- `getComposerServerPayload`: добавить workflow context fields;
- `handleComposerSend`: перед отправкой проверять warnings.

## 8. Не ломать текущие решения

Сохранить:

- `All / Active chats / Pings` или текущие `Chats / Pings` как workload split;
- independent filter zones;
- `direct/reply/edit` composer modes;
- demo/local hooks до backend integration;
- flags as right-panel details, not modal-only flow;
- card rule: не больше 3-4 видимых flags/badges.

## 9. Demo data

Добавить demo conversations:

1. New free lead.
2. Previous buyer in free chat.
3. Book Now sent with price objection.
4. Active paid session with timer.
5. Future paid session with content locked.
6. Reactivation due.
7. Safety escalation.
8. Technical issue.

Каждый demo conversation должен иметь:

- stage;
- labels/badges;
- right panel context;
- composer hint;
- expected next action.

## 10. CSS additions

Добавить классы:

```text
.stage-badge
.stage-badge--free
.stage-badge--book-now
.stage-badge--paid-live
.stage-badge--future-paid
.stage-badge--objection
.stage-badge--lift
.stage-badge--safety
.workflow-hint-panel
.workflow-warning
.paid-session-timer
.risk-badge
.ping-reason
```

UI должен оставаться плотным и рабочим, без landing/marketing layout.

## 11. Backend endpoints later

Потенциальные endpoints:

```text
POST /admin/messages/conversations/filter
GET /admin/messages/conversations/{conversation_id}
POST /admin/messages/conversations/{conversation_id}/workflow-stage
POST /admin/messages/conversations/{conversation_id}/book-now
POST /admin/messages/conversations/{conversation_id}/objections
POST /admin/messages/conversations/{conversation_id}/reactivation
POST /admin/messages/conversations/{conversation_id}/safety-flags
POST /admin/messages/{conversation_id}/events
```

## 12. Implementation order

Milestone 1:

1. Update contracts.
2. Add demo fields to HTML cards.
3. Add stage badges.
4. Add right panel workflow summary.
5. Add composer hint panel.

Milestone 2:

1. Add Book Now state.
2. Add objection attempts.
3. Add paid session timer block.
4. Add future content warning.

Milestone 3:

1. Add Pings reason model.
2. Add reactivation due.
3. Add safety/claim flags.
4. Add QA timeline events.

## 13. Testing checklist

Manual:

- switching conversation updates stage badge;
- `Pings` shows ping-specific panel;
- active paid session shows timer;
- future paid session shows content locked warning;
- post-Book-Now chat shows objection hint;
- reactivation due shows lift action;
- safety stage suppresses sales hint;
- composer modes direct/reply/edit still work.

Regression:

- queue search still clears other zones;
- quick presets still clear search/user/filter state;
- attachments still work with direct/reply;
- edit mode still clears reply mode;
- flags open right panel tab, not missing modal.
