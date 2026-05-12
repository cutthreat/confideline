# Workmode / Schedule / Onboarding policy

Документ собирает правила рабочего режима эксперта, расписания, статусов, перерывов, стажировки и допуска, восстановленные по видео.

## 1. Рабочий режим как lifecycle

```text
candidate / trainee
-> training
-> self-work
-> questionnaire required
-> HR/payroll call
-> bonus/manager call
-> first shift
-> active expert
-> ongoing QA / performance review
```

## 2. Availability states

| State | Смысл | Что можно | Что нельзя |
|---|---|---|---|
| `offline` | Эксперт не работает | Смотреть историю, если разрешено | Получать новые paid sessions |
| `online` | Эксперт доступен | Active chats, pings, sessions | Игнорировать клиентские ответы |
| `paused` | Временная пауза | Завершить текущее | Брать новые чаты без готовности |
| `break` | Перерыв | Только emergency/scheduled checks | Оставлять active paid session |
| `in_paid_session` | Идет paid session | Фокус на paid client | Уходить offline/break |
| `technical_issue` | Проблема связи/кабинета | Сообщить support/manager | Делать вид, что все работает |

## 3. Online / I'm Online

Подтверждено:

- эксперт вручную включает online;
- online status связан с получением клиентов;
- schedule и online должны быть согласованы;
- если эксперт online, он должен реально отвечать.

Правила для Confideline:

- Online не должен быть декоративным статусом.
- Online должен запускать ответственность по SLA/очереди.
- Если эксперт online, но не отвечает, это operational risk.
- Online при technical issue должен быть запрещен или помечен.

## 4. Offline / Pause / Break

Перед уходом:

```text
[ ] Нет active paid session
[ ] Нет paid session starts soon
[ ] Нет urgent safety/support ping
[ ] Клиенты с due action обработаны или переданы
[ ] Schedule не конфликтует
```

Если active paid session есть, уход запрещен без handoff/escalation.

## 5. Schedule

Schedule нужен для:

- открытия доступных слотов;
- future paid sessions;
- планирования смен;
- предотвращения простоя;
- контроля timezone;
- first-shift readiness.

Правила:

1. Расписание должно быть выставлено заранее.
2. На следующий день должны быть рабочие слоты, если эксперт выходит.
3. Future booked sessions нужно проверять перед сменой и перед уходом.
4. Timezone должен быть явным.
5. Если эксперт не может выйти, он должен предупредить менеджера.

Из Day 7: тренер напоминает выставить расписание на завтра, чтобы не просидеть впустую и быть доступными.

## 6. Power/connectivity issues

Из видео:

- power outage допускается как реальная жизненная проблема;
- эксперт должен коммуницировать;
- желательно иметь backup power/connectivity.

Policy для Confideline:

- эксперт заранее сообщает о риске;
- active paid sessions требуют handoff/manager notice;
- repeated connectivity failures идут в operational review;
- dashboard может иметь technical_issue state.

## 7. Work time

Рабочая модель:

- online time не равно active work time;
- active work подтверждается действиями;
- сообщения и paid-session activity важны;
- training/self-work hours могут считаться отдельно.

Рекомендованные категории:

```text
scheduled_time
online_time
active_chat_time
paid_session_time
training_time
idle_time
approved_payable_time
```

## 8. Training / self-work

Из видео:

- training длится около недели;
- target около 36 часов;
- dashboard показывает остаток/прогресс;
- стажеры выполняют практику;
- mentor review влияет на допуск.

Policy:

- target hours не должны быть единственным критерием;
- нужен skill/certification check;
- critical safety errors блокируют допуск;
- first shifts должны попадать в QA.

## 9. Questionnaire

Восстановлено:

- появляется после выполнения training condition;
- может блокировать доступ к чатам;
- не является тестом знаний;
- attached to account;
- заполняется на RU/UK;
- содержит identity/work fields.

Поля:

- first name;
- last name;
- current location;
- social networks except Telegram;
- where found job;
- languages and levels;
- photo;
- passport/foreign passport screenshot.

Рекомендация:

- отделить questionnaire от certification;
- sensitive identity documents хранить строго по compliance rules;
- показывать expert only required status, не лишние sensitive details в chat workspace.

## 10. Manager / HR / bonus calls

Из видео:

- есть call с Natasha/HR/payroll примерно в среду 14:00;
- есть bonus call Thu/Fri;
- schedule/pay/manager layer обсуждается после training.

Confidence: Medium.

Для Confideline:

- хранить manager checkpoints;
- не хардкодить конкретные имена/дни;
- показывать pending calls в onboarding dashboard;
- отделить payroll approval от chat access.

## 11. First shift

First shift должен быть под усиленным контролем.

Риски:

- эксперт знает теорию, но теряется в live chats;
- paid session silence;
- неправильный Book Now timing;
- free-value leakage;
- safety mishandling;
- schedule mistakes.

Controls:

- first-shift marker;
- mentor QA queue;
- paid sessions reviewed;
- objections reviewed;
- safety auto-escalation;
- daily feedback.

## 12. Dashboard screenshots / reporting

В видео есть признаки, что стажеры показывают dashboard/progress screenshots или сверяют dashboard с ментором.

Confidence: Medium.

Для Confideline:

- лучше заменить ручные screenshot на mentor dashboard;
- если screenshots нужны временно, фиксировать:
  - date/time;
  - expert id;
  - training hours;
  - sessions;
  - status;
  - source page.

## 13. Active expert monthly mode

Из видео звучит:

- full-month target 160-180 часов;
- ставка около $14/hour;
- при меньших часах ниже ставка/оплата;
- гибкие выходные.

Confidence: Medium/Low.

Не использовать как готовый payroll rule. Для Confideline нужна отдельная модель:

- required monthly hours;
- minimum active hours;
- pay model;
- bonus eligibility;
- absence policy;
- weekend policy;
- timezone policy.

## 14. Break policy

Целевая политика:

- break заранее;
- нельзя на active paid session;
- paid starts soon должен блокировать long break;
- urgent pings должны быть resolved/snoozed/handed off;
- break не должен создавать видимость online.

## 15. Handoff policy

Если эксперт не может продолжить:

1. Сообщить manager/mentor.
2. Зафиксировать active chats.
3. Передать paid sessions.
4. Оставить notes.
5. Отметить technical/availability reason.
6. Не оставлять клиента без объяснения, если это влияет на paid session.

## 16. Role visibility

Expert видит:

- свои часы;
- свои сессии;
- свои Pings;
- свой schedule;
- training progress;
- actionable risks.

Mentor видит:

- trainee progress;
- risky conversations;
- QA scores;
- critical violations;
- first-shift status.

Manager/HR видит:

- onboarding status;
- schedule readiness;
- payroll checkpoints;
- availability issues;
- monthly hours.

Support видит:

- technical issues;
- payment/button/chat visibility problems;
- escalation status.

## 17. MVP requirements

Минимально:

- availability state;
- schedule today/tomorrow;
- active/future paid session warnings;
- training hours for trainees;
- questionnaire status;
- first-shift marker;
- technical issue state;
- manager/mentor notification path.

## 18. Open questions

- Что именно считается payable work time?
- Какие роли могут редактировать training hours?
- Кто подтверждает questionnaire?
- Что блокирует доступ к чатам?
- Как обрабатывать future booked sessions при завершении training?
- Какой break policy для active experts?
- Какой escalation SLA для technical issues?
- Какие payroll/pay fields можно показывать в workspace?
