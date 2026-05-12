# Expert Dashboard: карта страниц, экранов и блоков

Документ описывает восстановленную карту страниц личного кабинета эксперта и целевую структуру UI для Confideline. Уровень детализации максимальный из доступных по видео, но точные визуальные макеты конкурента восстановлены не полностью.

## 1. Карта подтвержденных и вероятных экранов

| Экран / страница | Уверенность | Что видно/слышно | Назначение |
|---|---|---|---|
| Chat workspace | High | Все дни обучения | Основная работа с клиентами |
| Dashboard | High | Day 1, Day 4, Day 5, Day 7 | Общие показатели эксперта |
| Statistic page | High/Medium | Day 5, Day 7 | Подробная статистика по сессиям/активности |
| My Schedule | High | Day 3, Day 4, Day 7 | Настройка доступности и слотов |
| Profile / expert profile | High | Day 1-3 | Профиль, статус, купоны, публичное лицо |
| Questionnaire | High | Day 7 | Onboarding после training/self-work |
| Transactions / payments | Medium | Day 1 и общая логика paid sessions | Деньги/оплаты/история |
| Sessions | High | Во всех днях через paid session | Оплаченные консультации |
| Favorites | High | Day 3, Day 6, Day 7 | Retention/follow-up |
| Notes/comments | High | Day 3, Day 7 | Контекст клиента |
| Support/technical issue path | Medium/High | Day 4, Day 7 | Технические проблемы |
| Mentor/manager layer | High | Day 4-7 | Проверка стажеров и качества |

## 2. Chat workspace

Основные зоны:

- left queue;
- active chats;
- pings/follow-ups;
- center conversation;
- composer;
- right client panel;
- paid session panel;
- Book Now / offer controls;
- schedule/session context;
- flags/risk indicators.

Что должно быть видно эксперту:

- стадия диалога;
- client previous buyer;
- active/future paid session;
- Book Now status;
- objection status;
- coupon availability;
- safety flags;
- notes/history;
- favorite status.

## 3. Dashboard

Dashboard должен быть первым местом, где эксперт понимает свое состояние:

### Header summary

Поля:

- current status: online/paused/offline;
- current shift time;
- active paid session alert;
- next scheduled paid session;
- unresolved Pings;
- risk alerts.

### Today block

Поля:

- active work time today;
- online time today;
- messages sent today;
- active chats handled;
- Book Now sent;
- paid sessions completed;
- paid minutes;
- reactivation attempts;
- due Pings.

### Training block

Показывать только trainee/onboarding users:

- training stage;
- target hours;
- completed hours;
- remaining hours;
- questionnaire required/submitted;
- mentor review status;
- first shift readiness.

### Quality block

- paid idle warnings;
- refund risk;
- safety flags;
- future content warnings;
- objection over-limit;
- mentor feedback pending.

### Revenue/conversion block

- Book Now -> payment;
- paid sessions count;
- extension count;
- coupon usage;
- reactivation -> payment;
- repeat buyers.

## 4. Statistic page

Statistic page должна быть детальнее dashboard.

Вероятная структура:

```text
Filters:
  period, expert profile, status, session type

Rows:
  date
  online/work time
  messages
  chats
  Book Now
  paid sessions
  paid minutes
  revenue/pay-related value
  efficiency
  notes/risks
```

Фрагменты из видео подтверждают наличие статистики, но не полный набор колонок.

## 5. My Schedule

Назначение:

- выставлять доступность;
- управлять будущими paid sessions;
- видеть timezone;
- не создавать конфликт с break/offline;
- планировать завтрашний день;
- закрывать стажировку/допуск без зависших future bookings.

Блоки:

- calendar/day slots;
- timezone selector/display;
- available/unavailable slots;
- booked paid sessions;
- off days;
- break windows;
- schedule warnings.

Операционные правила:

- перед уходом проверить будущие сессии;
- перед завершением дня выставить расписание на завтра;
- если есть booked sessions, не уходить без плана;
- timezone mismatch должен быть явно виден.

## 6. Profile / expert setup

Профиль влияет на продажи:

- публичное имя/аватар;
- expert persona/style;
- языки;
- статус доступности;
- coupons/discount context;
- schedule;
- клиентские ожидания.

Для Confideline профиль эксперта должен быть связан с:

- availability;
- assigned operator;
- public expert identity;
- chat routing;
- analytics.

## 7. Questionnaire

Из Day 7:

- появляется после training/self-work condition;
- блокирует доступ к чатам до заполнения;
- не является тестом знаний;
- attached to account;
- заполняется на RU/UK, не на English;
- содержит personal/identity/work fields.

Поля, восстановленные из видео:

- first name / last name;
- current location;
- social networks кроме Telegram;
- where found job;
- languages and spoken/written level;
- photo;
- passport/foreign passport screenshot.

Для Confideline важно отделить:

- onboarding questionnaire;
- knowledge certification;
- legal identity verification;
- payroll setup.

## 8. Sessions page / session block

Нужные данные:

- active session;
- future session;
- completed session;
- cancelled/refunded session;
- duration;
- timer;
- promised topics;
- completed topics;
- client;
- source Book Now;
- coupon;
- idle risk;
- extension offered.

Это может быть отдельной страницей или блоком в dashboard/right panel.

## 9. Transactions / pay context

В видео есть намеки на transactions/pay/pay rate, но точной структуры нет.

Для Confideline безопасная модель:

- payment history для клиента;
- expert earnings summary отдельно;
- payroll rules не смешивать с chat UI;
- bonus eligibility показывать только при подтвержденных формулах.

## 10. Favorites

Favorites используются для:

- previous buyers;
- future follow-up;
- reactivation;
- клиентов, которых нельзя потерять;
- клиентов с purchase potential.

Экран/блок Favorites должен показывать:

- client;
- reason;
- last purchase;
- next action;
- nextActionAt;
- topic;
- assigned expert/operator.

## 11. Notes/comments

Notes нужны для continuity.

Типы:

- expert note;
- mentor note;
- support note;
- risk note;
- promised topic note;
- reactivation note.

Плохая note:

- эмоциональный ярлык;
- "плохой клиент";
- субъективный негатив без фактов.

Хорошая note:

- "Bought 10 min on relationship, asked about X, promised follow-up on Y";
- "Price objection after Book Now, coupon unavailable";
- "Previous buyer, add to lift tomorrow morning".

## 12. Mentor dashboard

Ментору нужны отдельные queues:

- trainee first-shift chats;
- paid sessions with idle risk;
- future paid content warnings;
- high objection attempts;
- safety flags;
- low conversion after many Book Now;
- refund/support risk;
- technical issues;
- training hours incomplete;
- questionnaire pending.

## 13. Manager/HR dashboard

Manager/HR слой:

- onboarding stage;
- questionnaire status;
- identity verification;
- schedule readiness;
- payroll call pending;
- bonus call pending;
- monthly hours target;
- actual hours;
- availability consistency.

Точные payroll/pay fields требуют отдельной проверки.

## 14. Notifications / alerts

Обязательные alerts:

- active paid session idle;
- paid session starts soon;
- future content locked;
- free trial ending;
- objection attempts over limit;
- reactivation due;
- safety escalation;
- technical issue;
- schedule conflict;
- questionnaire required;
- training hours remaining.

## 15. UX-принципы для Confideline

- Dashboard не должен быть декоративным.
- Метрики должны быть объяснимы.
- Эксперт должен видеть только то, на что может повлиять.
- Mentor/manager metrics не обязательно показывать эксперту.
- Pay/bonus numbers нельзя показывать без подтвержденных формул.
- Safety alerts должны быть заметнее sales hints.
- Active paid session timer должен быть виден всегда.
- Schedule timezone должен быть очевиден.

## 16. MVP screen package

Минимум:

1. Expert dashboard summary.
2. Today activity.
3. Paid session block.
4. Pings/action queue block.
5. Schedule today/tomorrow.
6. Training progress for trainees.
7. Quality/risk alerts.
8. Statistic page with period filter.
9. Mentor risk queue.

## 17. Что нужно перепроверить по кадрам

Если будут исходные видео/кадры:

- точные названия пунктов меню;
- расположение Dashboard/Statistic/My Schedule;
- колонки Statistic page;
- форматы часов;
- формат efficiency;
- вид questionnaire;
- вид schedule slots;
- какие метрики видит эксперт vs mentor.
