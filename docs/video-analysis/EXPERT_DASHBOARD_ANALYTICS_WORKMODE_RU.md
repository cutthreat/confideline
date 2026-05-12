# Expert Dashboard / Analytics / Workmode: полный пакет выводов

Документ собирает все восстановленные материалы по dashboard, страницам аналитики, рабочему режиму эксперта, расписанию, onboarding и управленческим показателям из видеоанализа конкурента InsightOrba.

Это не финальная спецификация Confideline и не точная копия конкурента. Видео дают фрагменты экранов, комментарии тренера и практические действия стажеров. Поэтому каждый вывод помечается уровнем уверенности.

## 1. Что входит в пакет

Связанные документы:

- `EXPERT_DASHBOARD_ANALYTICS_WORKMODE_RU.md` - главный синтез по dashboard/analytics/workmode.
- `EXPERT_DASHBOARD_SCREEN_MAP_RU.md` - карта страниц, экранов, блоков и UI-состояний.
- `EXPERT_METRICS_AND_FORMULAS_RU.md` - словарь метрик, возможные формулы, источники данных и confidence.
- `EXPERT_WORKMODE_ONBOARDING_POLICY_RU.md` - рабочий режим, расписание, online/offline/break, стажировка, questionnaire, manager calls.

Базовые документы, откуда это собрано:

- `INSIGHTORBA_COMPETITOR_WORKFLOW_FULL_DOCUMENTATION_RU.md`
- `EXPERT_WORK_REGULATION_RU.md`
- `SHIFT_SOP_RU.md`
- `UI_BLUEPRINT_RU.md`
- `DATA_DICTIONARY_RU.md`
- per-video analysis docs `day-*/INSIGHTORBA_DAY*_ANALYSIS.md`

## 2. Ключевой вывод

У конкурента кабинет эксперта - это не только чат. Это рабочая операционная среда, где эксперт:

- выходит на смену;
- управляет доступностью;
- задает расписание;
- принимает paid sessions;
- работает с бесплатными и платными чатами;
- видит свои часы/активность;
- следит за статистикой и эффективностью;
- проходит training/onboarding;
- отчитывается перед ментором/менеджером;
- проверяет dashboard как часть допуска и контроля.

Главное для Confideline: analytics/workmode слой должен быть связан с chat workflow. Нельзя строить dashboard отдельно от стадий `Book Now`, paid session, objection, reactivation и safety.

## 3. Уровни уверенности

| Уровень | Значение |
|---|---|
| High | Многократно подтверждено в видео или явно проговорено |
| Medium | Есть несколько фрагментов/комментариев, но точная логика не полностью видна |
| Low | Есть косвенные признаки, требуется отдельная проверка |

## 4. Что подтверждено по dashboard

High confidence:

- У эксперта есть dashboard/statistics area.
- Есть отдельная область или страница `Statistic` / статистики.
- Dashboard используется не только как отчет, но и как инструмент контроля стажировки/работы.
- В dashboard/статистике фигурируют часы, сессии, активность, эффективность.
- В training flow стажеры должны проверять/показывать dashboard, иногда через screenshot.
- Рабочее время связано с активной работой и отправленными сообщениями, а не просто с открытой вкладкой.
- Paid sessions и их качество важны для оценки.
- Schedule и online/offline status напрямую влияют на работу и доступность для клиентов.
- Есть onboarding layer: training/self-work hours, questionnaire, manager/HR calls, first shifts.

Medium confidence:

- Точное название страниц: `Dashboard`, `Statistic`, `My Schedule`, `My Profile` восстановлено по фрагментам и речи, но UI может иметь отличающиеся подписи.
- `Efficiency percent` существует как показатель, но формула не доказана.
- Full-month target звучит как 160-180 часов, но может зависеть от статуса/периода.
- Ставка около `$14/hour` звучит в Day 7, но это не финальное тарифное правило.
- 36 часов training/self-work звучит как условие завершения стажировки, но точный backend trigger не подтвержден.
- Dashboard screenshots могут быть обязательной частью контроля, но точный формат отчетности не виден.

Low confidence:

- Полная структура payout/payroll.
- Формула bonus eligibility.
- Формула active hours.
- Формула efficiency.
- Полный список колонок в статистике.
- Точные роли доступа mentor/manager vs expert.

## 5. Восстановленная структура личного кабинета эксперта

На основании видео рабочий кабинет можно представить так:

```text
Expert cabinet
├─ Chat workspace
│  ├─ Active chats
│  ├─ Pings / follow-up / warm leads
│  ├─ Paid session panel
│  ├─ Right client profile panel
│  └─ Composer / Book Now / offers
├─ Dashboard
│  ├─ hours / work time
│  ├─ sessions
│  ├─ messages/activity
│  ├─ efficiency
│  ├─ financial/pay context
│  └─ training progress if trainee
├─ Statistic page
│  ├─ rows by day/period
│  ├─ sessions / paid outcomes
│  ├─ activity
│  └─ efficiency/pay-related values
├─ My Schedule
│  ├─ available slots
│  ├─ timezone
│  ├─ future sessions
│  └─ breaks/off days
├─ Profile / expert setup
│  ├─ expert profile
│  ├─ language
│  ├─ photo/avatar
│  ├─ coupons/status signals
│  └─ onboarding questionnaire
└─ Support / manager / training layer
   ├─ mentor review
   ├─ HR/payroll call
   ├─ bonus call
   └─ technical issue path
```

## 6. Dashboard как рабочий инструмент

Dashboard нужен минимум для четырех задач:

1. **Самоконтроль эксперта.** Эксперт видит, сколько он реально отработал, сколько осталось до цели, как идут сессии и активность.
2. **Контроль стажировки.** Стажер должен закрыть определенное количество training/self-work hours и показать прогресс.
3. **Операционный контроль.** Ментор/менеджер видит, кто работает, кто проседает, где есть refund/support risk.
4. **Финансовая прозрачность.** Часы, сессии, эффективность, бонусы и оплата должны быть привязаны к понятным метрикам.

## 7. Рабочее время

Важная находка: рабочее время у конкурента похоже не равно простому нахождению online.

Из видео:

- работа считается через активность;
- отправленные сообщения влияют на учет;
- тренер обсуждает, что нельзя просто "сидеть в кабинете";
- paid session и регулярность сообщений важны;
- стажеры проверяют оставшиеся часы до завершения training.

Рабочая модель для Confideline:

```text
work_time = confirmed_active_time, not just browser_open_time
```

Варианты учета:

- online time;
- active chat time;
- sent-message-based active time;
- paid-session active time;
- scheduled shift time;
- training/self-work time.

Рекомендация: не смешивать эти понятия. В dashboard должны быть отдельные метрики:

- `scheduledHours`;
- `onlineHours`;
- `activeWorkHours`;
- `paidSessionMinutes`;
- `trainingHoursCompleted`;
- `messageActivity`.

## 8. Рабочий режим эксперта

Подтвержденные состояния:

- Online / I'm Online;
- Offline;
- Break / Pause;
- active paid session;
- schedule availability;
- future booked sessions.

Целевые состояния для Confideline:

```ts
type ExpertAvailabilityState =
  | 'offline'
  | 'online'
  | 'paused'
  | 'break'
  | 'in_paid_session'
  | 'technical_issue';
```

UI должен предупреждать:

- нельзя уходить offline при active paid session;
- нельзя ставить schedule, если эксперт не сможет работать;
- paid session starts soon;
- break conflicts with booked session;
- timezone mismatch risk.

## 9. Schedule

Schedule нужен не только как календарь, а как управляющий механизм продаж:

- клиент может забронировать future paid session;
- эксперт должен быть доступен в заявленные слоты;
- перед завершением training/смены нужно проверить future bookings;
- future sessions могут мешать закрытию questionnaire/training flow;
- timezone важен, особенно при международной работе.

В Day 7 звучит указание поставить расписание на следующий день. Это важный операционный сигнал: schedule влияет на то, чтобы эксперт не "просидел впустую" и был доступен для клиентов.

## 10. Dashboard / Statistic page: вероятные метрики

| Метрика | Уверенность | Комментарий |
|---|---|---|
| Training/self-work hours | High | В Day 7 обсуждается около 36 часов |
| Remaining hours to training target | High | Был пример оставшегося времени до 36 часов |
| Active/work hours | Medium/High | Обсуждается учет работы через сообщения/активность |
| Sessions | High | Платные сессии - центральная метрика |
| Messages sent | Medium/High | Упоминается связь рабочего времени и сообщений |
| Efficiency % | Medium | Видна/обсуждается, но формула неизвестна |
| Monthly/full target hours | Medium | Звучит 160-180 часов |
| Hourly rate / pay | Medium/Low | Звучит около $14/h, но тариф не подтвержден как общий |
| Bonus eligibility | Medium | Есть bonus call, но формула неизвестна |
| Schedule slots | High | My Schedule и расписание подтверждены |
| Paid session quality | High | Молчание/сообщения/refund risk |
| Dashboard screenshot/report | Medium | Упоминается как часть контроля |

## 11. Training/onboarding dashboard

Для стажера dashboard должен показывать:

- training stage;
- hours completed;
- hours remaining;
- questionnaire status;
- first-shift readiness;
- mentor review status;
- schedule readiness;
- future sessions blocking completion;
- HR/payroll call pending;
- bonus call pending.

Из видео:

- стажировка длится около недели;
- есть цель около 36 часов;
- questionnaire появляется/требуется после выполнения условий;
- questionnaire блокирует доступ к чатам до заполнения;
- questionnaire не является тестом знаний;
- будущие booked sessions могут мешать завершению;
- дальше есть call с Natasha/HR/payroll и bonus call.

## 12. Mentor/manager analytics

Менеджеру/ментору нужны не только финансовые показатели, но и контроль качества:

- paid sessions with idle risk;
- future paid content leakage;
- high objection attempts;
- weak Book Now conversion;
- low activity during shift;
- trainee chats;
- safety flags;
- refund/support risks;
- reactivation outcomes;
- schedule compliance;
- missed booked sessions.

## 13. Что Confideline не должна копировать вслепую

Не стоит без проверки копировать:

- формулу efficiency;
- ставку/часовую модель;
- full-month target 160-180h;
- 36h training trigger как жесткое правило;
- bonus eligibility;
- учет работы только по сообщениям;
- dashboard screenshot reporting как единственный контроль.

Лучше сделать собственную прозрачную модель:

- что считается scheduled time;
- что считается online time;
- что считается active work;
- что считается paid session time;
- как начисляется training progress;
- что влияет на bonus/quality score.

## 14. Продуктовый вывод для Confideline

Dashboard должен отвечать на вопросы:

Для эксперта:

- Я сейчас online?
- Есть ли активная paid session?
- Сколько у меня осталось оплаченного времени в текущей сессии?
- Кто ждет ответа?
- Какие Pings due?
- Сколько я отработал сегодня?
- Сколько осталось до цели?
- Какие мои результаты по сессиям и conversion?
- Есть ли риски по качеству?

Для стажера:

- Сколько training hours закрыто?
- Что осталось до допуска?
- Нужно ли заполнить questionnaire?
- Есть ли mentor feedback?
- Что сделать перед first shift?

Для ментора:

- Кто в риске?
- Где paid session idle?
- Где стажер ошибся?
- Где возможен refund?
- Где слабая конверсия?
- Кто готов к допуску?

Для бизнеса:

- Кто реально работает?
- Кто приносит paid sessions?
- Где теряется выручка?
- Какой retention/reactivation работает?
- Какие эксперты требуют обучения?

## 15. Минимальный MVP dashboard

MVP для Confideline:

1. Expert status: online/paused/offline/in paid session.
2. Today summary: active work time, sent messages, active chats, paid sessions.
3. Paid session block: active/future sessions, timer, idle risk.
4. Pings summary: due, overdue, high priority.
5. Conversion block: Book Now sent, payments, objections.
6. Reactivation block: due lifts, outcomes.
7. Quality/risk block: safety flags, refund risk, future content warnings.
8. Training block for trainees: hours completed, remaining, questionnaire status.
9. Schedule block: today/tomorrow slots, timezone, conflicts.

## 16. Открытые вопросы

- Как именно считать active work time?
- Нужно ли учитывать work time по сообщениям, online status или paid-session activity?
- Какой threshold paid-session idle считается риском?
- Какие dashboard screenshots нужны ментору?
- Какие метрики видит эксперт, а какие только ментор?
- Какие pay/bonus metrics можно показывать без юридических/операционных рисков?
- Как учитывать работу в Pings/reactivation?
- Как связывать dashboard с payroll?
- Как показывать timezone и schedule conflicts?
- Нужно ли блокировать offline/break при active paid session?
