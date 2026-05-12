# UI Blueprint для Admin Chat Workspace V2

Документ описывает целевую структуру интерфейса Confideline Admin Chat Workspace на основе видеоанализа конкурента. Это не визуальный макет, а функциональная схема экранов, блоков, состояний и предупреждений.

## 1. Главная структура

Workspace должен оставаться быстрым операционным интерфейсом:

```text
Left queue / list
-> Center conversation
-> Composer
-> Right panel
-> Top/session/status controls
```

Главная задача UI: эксперт должен за несколько секунд понять:

- кто клиент;
- какая стадия диалога;
- что уже обещано;
- есть ли paid session;
- что нельзя раскрывать бесплатно;
- что нужно сделать прямо сейчас;
- есть ли safety/refund/technical risk.

## 2. Left queue

### Tabs

Существующие вкладки сохранить:

- `All`
- `Active chats`
- `Pings`

### Chat row fields

Каждая строка должна показывать:

- client name/avatar;
- last message preview;
- time since last activity;
- stage badge;
- paid session badge;
- previous buyer badge;
- risk badges;
- assigned operator;
- unread count;
- Ping reason, если открыт из Pings.

### Stage badges

| Stage | Badge |
|---|---|
| `new` | New |
| `free_reading` | Free |
| `intrigue_ready` | Ready CTA |
| `book_now_sent` | Book Now |
| `post_book_now_objection` | Objection |
| `paid_session_booked_future` | Future Paid |
| `paid_session_active` | Paid Live |
| `extension_offer` | Extension |
| `reactivation_due` | Lift Due |
| `reactivation_active` | Lift |
| `safety_escalation` | Safety |

### Risk badges

- `Idle`
- `Refund risk`
- `Free leak`
- `Future locked`
- `Safety`
- `Claim risk`
- `Technical`
- `Coupon unavailable`

## 3. Pings tab

Pings должны быть очередью действий.

### Ping row fields

- reason;
- dueAt / overdue;
- priority;
- linked conversation;
- recommended action;
- stage;
- resolve/snooze action.

### Ping reasons

| Reason | UI label | Priority |
|---|---|---|
| `client_waiting` | Client waiting | normal/high |
| `paid_session_starts_soon` | Paid starts soon | high |
| `paid_session_idle_risk` | Paid idle | urgent |
| `free_trial_ending` | Free ending | high |
| `next_day_lift_due` | Lift due | normal |
| `failed_objection_followup` | Follow-up | normal |
| `safety_escalation` | Safety | urgent |
| `technical_issue` | Tech issue | high |

## 4. Conversation header

Header должен показывать:

- client name;
- current stage;
- assignment/owner;
- previous buyer badge;
- active/future paid session status;
- timer, если paid session active;
- online/offline/schedule context;
- quick actions.

### Quick actions

- Assign to me;
- Add to Favorites;
- Send Book Now;
- Offer extension;
- Schedule lift;
- Mark safety;
- Escalate to support;
- Archive/close.

## 5. Conversation timeline

В ленте сообщений нужно показывать не только сообщения, но и важные event markers:

- conversation assigned;
- free trial started/expired;
- Book Now sent;
- payment completed;
- paid session started/ended;
- paid idle risk;
- coupon sent;
- objection detected/answered;
- reactivation scheduled/started;
- safety flag detected;
- support escalation.

Event markers должны быть компактными и не мешать чтению переписки.

## 6. Composer

Composer должен быть stage-aware.

### Composer modes

Существующие режимы сохранить:

- `direct`
- `reply`
- `edit`

Добавить смысловые hints поверх режима:

| Stage | Hint |
|---|---|
| `free_reading` | Give limited value, keep paid answer unresolved |
| `intrigue_ready` | Create specific intrigue and move to Book Now |
| `book_now_sent` | Handle objection, do not reveal more value |
| `post_book_now_objection` | Answer objection and return to Book Now |
| `paid_session_booked_future` | Future session content is locked |
| `paid_session_active` | Answer promised topics, watch timer |
| `extension_offer` | Move new topics to another paid slot |
| `reactivation_active` | Reason for return, intrigue, Book Now |
| `safety_escalation` | Use safety path, avoid sales push |

### Composer warnings

Warnings должны отличаться от обычных советов:

- free-value leakage risk;
- future paid content warning;
- too many objection attempts;
- paid session silence risk;
- safety detected;
- claim precision risk;
- coupon unavailable.

## 7. Book Now UI

Book Now должен быть отдельным action block.

### Перед отправкой

Показать:

- promised topics;
- selected duration/package;
- coupon attached or not;
- client eligibility;
- warning, если free value еще слабая или наоборот уже превышена.

### После отправки

Показать:

- sentAt;
- promisedTopics;
- status: sent/clicked/paid/expired/cancelled;
- last client response;
- objection type;
- attempt count.

## 8. Paid session UI

### Active paid session block

Показывать в header и right panel:

- timer;
- session status;
- promised topics;
- completed topics;
- outbound message count;
- last expert message gap;
- idle/refund risk;
- extension action.

### Future paid session block

Показывать:

- start time;
- promised topics;
- content locked notice;
- countdown;
- warning: do not reveal before start.

## 9. Right panel

Right panel должен быть рабочей карточкой клиента.

### Recommended tabs/sections

1. `Profile`
2. `Session`
3. `History`
4. `Offers`
5. `Risks`
6. `Notes`
7. `QA`

### Profile

- client display name;
- client type: new / previous buyer / repeat topic;
- language;
- age/18+ status, если доступно;
- duplicate/new chat suspected;
- favorite status.

### Session

- current stage;
- active/future paid session;
- timer;
- promised topics;
- completed topics;
- extension offer;
- refund risk.

### History

- purchase history;
- previous chats;
- previous experts;
- previous comments;
- repeat topics;
- last payment.

### Offers

- Book Now status;
- coupon eligibility;
- coupon code/status;
- objection type;
- attempt count;
- reactivation eligibility.

### Risks

- safety flags;
- claim precision flags;
- free-value leakage;
- future paid content lock;
- technical issues;
- off-platform/confidential data risk.

### Notes

- expert notes;
- mentor notes;
- support notes;
- next follow-up note.

### QA

- stage timeline;
- risk events;
- score placeholders;
- mentor feedback.

## 10. Dashboard / Statistics

Для эксперта:

- active hours;
- sent messages;
- sessions;
- conversion;
- scheduled sessions;
- remaining training hours, если onboarding;
- current shift risks.

Для ментора:

- paid idle risk conversations;
- future paid content warnings;
- safety cases;
- high objection attempts;
- weak conversion after Book Now;
- trainee/first-shift chats;
- reactivation outcomes.

## 11. Onboarding/workforce UI

Отдельный слой, не обязательно в первом MVP:

- onboarding stage;
- training hours;
- questionnaire required/submitted;
- HR call pending;
- bonus call pending;
- first shift marker;
- mentor assigned;
- schedule readiness.

## 12. Empty/loading/error states

### Empty Active chats

Показывать не маркетинговый экран, а рабочий статус:

- no active chats;
- next scheduled paid session;
- due pings;
- availability state.

### Empty Pings

Показать:

- no due actions;
- next scheduled reactivation;
- paid sessions starting soon.

### Technical issue state

Для stuck button/payment/chat visibility:

- show issue badge;
- action "report to support";
- mark support escalation;
- do not hide conversation context.

## 13. Mobile / narrow viewport

Если workspace нужен на узких экранах:

- queue collapses into drawer;
- right panel becomes tabs/drawer;
- paid session timer stays sticky;
- composer warning remains visible;
- active paid session must not be hidden behind tabs.

## 14. MVP UI scope

Первый слой:

- stage badge in chat list;
- stage summary in right panel;
- Book Now status block;
- paid session timer block;
- basic Pings reasons;
- composer hints;
- previous buyer badge;
- safety/risk badges.

Второй слой:

- objection attempt UI;
- coupon eligibility;
- reactivation workflow panel;
- purchase history and previous experts;
- QA timeline.

Третий слой:

- mentor dashboard;
- onboarding/workforce panel;
- draft provenance;
- advanced analytics.
