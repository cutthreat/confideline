# G6. Функциональное ТЗ: assignment, SLA, quality, admission и staff access

Статус: `requirement_defined_owner_thresholds_accepted_legal_runtime_open`  
Задачи: G6.1-G6.7  
Фазы: assignment/ACL — `pilot_core`; SLA/QA/admission minimum — `pilot_minimum`; full staff operations — `public_launch/post_launch`

## Маршрутизация исполнения G6

| Task | Класс | Операционная дорожка | Development-дорожка |
|---|---|---|---|
| G6.1 | `MIXED` | Только super-admin назначает/переназначает и указывает причину | Atomic assignment, history, actual actor, ACL/conflict guards |
| G6.2 | `MIXED` | SLA/schedule/escalation settings и breach handling | Clocks, snapshots, reconnect/exclusions и events |
| G6.3 | `MIXED` | Moderator/QA review/appeal; super-admin protected action | Review workflow, scorecard version, block/audit/events |
| G6.4 | `CONTENT_POLICY` | PM/domain/legal + moderator/Ксения ведут training/review; owner admission | Persisted admission/re-admission gates и fail-closed paid access |
| G6.5 | `MIXED` | Recipients/severity/fallback/escalation и alert handling | Critical events, dedup/retry, role delivery и journal |
| G6.6 | `DEV` | PM/staff утверждает состав workspace и принимает route | Separate admin route/shell, redirects/security/rollback |
| G6.7 | `DEV` | Super-admin назначает permissions и даёт role fixtures | Server-side ACL, direct/search/send deny и isolation audit |

Moderator не назначает анкеты, не активирует protected policy и не даёт финальный paid admission. Канон: `task-execution-ownership-matrix.md`.

## Общий результат G6

Expert profiles управляются назначенными агентами в пределах строгих прав. Super-admin видит реальные действия. SLA, QA и admission обеспечивают управляемое качество, а отдельная staff-поверхность улучшает работу, но не подменяет access control.

## G6.1 Назначение анкет

### Функциональные требования

1. В каждый момент expert profile имеет не более одного active agent assignment.
2. Один агент может иметь много assigned expert profiles.
3. Назначить/переназначить expert profile может только super-admin.
4. Агент видит assignment в своем workspace и получает связанные будущие диалоги/очередь.
5. Reassignment передает новому агенту всю историю анкеты, но не меняет actual actor прошлых сообщений/session.
6. Public profile, reviews/rating и клиентский диалог остаются у expert account.
7. Internal KPI и compensation attribution прошлого агента не переходят новому.
8. Reassignment запрещен во время active paid chat и balance pause.
9. Неуспешное назначение/переназначение не должно оставлять две активные связи или частично переданную видимость.
10. История назначений доступна super-admin: кто, когда, от кого, кому, причина.
11. После переназначения старый агент сразу теряет доступ к будущим и текущим разрешенным данным этой анкеты, кроме явно разрешенной собственной исторической compensation view.
12. Самостоятельный технический вход expert account не используется как путь обхода agent workspace.
13. Одновременные paid-start и reassignment для одной анкеты не могут оба завершиться успешно: итог имеет либо неизмененное назначение и запущенную session, либо выполненный перенос без запущенной session; проигравшее действие не оставляет денег/доступа в промежуточном состоянии.

### Приемка

- Initial assignment и multiple profiles to one agent.
- Попытка второго active assignment.
- Reassignment после завершенной consultation.
- Reassignment в paid/pause запрещен.
- Одновременный start/reassignment дает один согласованный результат без частичного переноса или списания проигравшей попытки.
- History/actual actor/accrual до и после переноса.
- Старый агент не читает/не отправляет после переноса.

## G6.2 SLA и сроки реакции

### Области SLA

- Paid request accept/decline: текущее admin-значение 60 секунд.
- First meaningful response после фактического старта: текущее admin-значение 60 секунд.
- Async queue вне busy-paid исключения.
- Support first response: текущее admin-значение 15 минут в настроенные support hours.
- Обычная escalation: текущее admin-значение 2x применимого SLA.
- Critical payment/access/safety incident: admin-режим `immediate`.

### Функциональные требования

1. Для каждого SLA определены начало, остановка/пауза, breach и владелец.
2. Busy paid/pause period не штрафует агента за queued async response.
3. Off-shift/offline/profile-offline/admin-blocked periods обрабатываются объяснимо и не создают скрытый SLA breach.
4. Agent/profile выключается с обязательной краткой причиной.
5. Выключение действует до ручного включения или старта новой online-смены; admin-block сохраняется.
6. Клиент видит корректное ожидание/недоступность без внутренних чисел, если они не предназначены клиенту.
7. Breach создает staff action/escalation и не исчезает при reassignment.
8. Manual pilot report допустим, если каждый случай измерим и связан с session/case.
9. Все SLA values/modes управляются в админ-панели по `tz-crosscut-admin-managed-settings.md`: authorized role, unit/mode, validation, save/readback, old/new actor/time/reason, версия и история обязательны.
10. Глобальный online-статус агента определяет исходную доступность назначенных анкет: при offline они недоступны для нового paid start; при начале новой online-смены возвращаются разрешенные анкеты, кроме индивидуально/административно заблокированных по действующему правилу.
11. Агент может отдельно выключить конкретную анкету с обязательной причиной, не меняя статус остальных назначенных анкет.
12. При потере связи агентом во время paid/pause действует reconnect grace из admin-настройки; текущее значение — 60 секунд. Во время grace новый paid start запрещен для всех его анкет; после technical end агент остается offline до новой online-смены.
13. При начале SLA-clock фиксируются примененные значение и версия; изменение настройки не меняет уже рассчитанный deadline и применяется к новым периодам.
14. Async queue в limited pilot измеряется без отдельного hard threshold; busy paid/pause исключается, а отсутствие hard threshold не показывается как pass/fail.
15. Support schedule/timezone задаются operationally в admin; отсутствие конфигурации дает `configuration_missing`, а не ложное соблюдение SLA.

### Приемка

- Paid request/first response.
- Busy queue exclusion.
- Shift start/end и profile reason.
- Reassignment после breach.
- Support overdue/escalation.
- Authorized/unauthorized admin change, invalid value, readback, history и изменение во время активного clock.
- Manual report воспроизводится по исходным случаям.
- Потеря связи во время paid/pause: возврат до grace сохраняет session, timeout дает technical end и agent-offline без нового paid start.

## G6.3 Контроль качества

### Pilot minimum

1. Каждая pilot consultation проходит ручной review по единому scorecard: текущий max = 100, pass = 80.
2. Review связан с session, expert profile и actual agent.
3. Quality оценивается отдельно от revenue/duration.
4. Critical fail блокирует или приостанавливает paid access до решения уполномоченной роли.
5. Review сохраняет reviewer, время, оценку, причину, evidence и action.
6. Agent может получить понятный feedback в разрешенном объеме.
7. Appeal/correction сохраняет исходный результат и новое решение.
8. Internal quality score не меняет public rating автоматически.
9. Safety/billing/manipulation critical fails имеют приоритет над коммерческим KPI.
10. Raw client evidence не переносится в training/mockups без anonymized rewrite.
11. Critical fail перекрывает общий score. Активный минимум: hidden/false billing state, prohibited guarantee, pressure/fear/dependency manipulation, missed safety escalation, foreign-data/access action, unauthorized refund/payment action, private-data disclosure, internal agent presented as public expert.
12. Первичный verdict выносит moderator/QA lead; override/unblock доступен super-admin только с причиной.
13. Score max/pass, critical-fail registry, role bindings и re-admission workflow управляются через отдельный admin-раздел по `admin-panel-settings-development-package.md`.
14. Review фиксирует примененную scorecard/rule version; последующее изменение admin-настроек не пересчитывает историю автоматически.
15. O6 protected safety rules входят в critical-fail registry и управляются через Trust & Safety admin screen; ослабление protected minimum требует owner/legal approval.
16. Автоматический content signal не становится историческим critical fail без разрешенного verdict; confirmed/dismissed, evidence, reviewer и detector/rule version сохраняются отдельно.
17. Попытка агента отправить direct contact, payment/identity/authentication data или обойти privacy filter является protected signal; repeated confirmed bypass входит в critical fail/paid-access review.
18. Quality review может быть создан из client complaint, technical/billing incident, SLA/reconnect failure, confirmed privacy/safety signal, refund anomaly, manual super-admin flag, random QA sample, repeated low-rating threshold или appeal/reopen. Автоматический signal является кандидатом на review, а не доказанной виной.
19. Допустимые outcomes: dismissed/no issue, insufficient evidence, monitoring, coaching, warning, retraining/reassessment, temporary paid suspension, expert-profile restriction, safety/legal/security escalation, block и corrected/overturned after appeal.
20. Для outcome обязательны reason, evidence, reviewer, severity, effective period, applied policy version, appeal availability и audit.
21. Агент не видит support ticket, refund details и внутреннюю клиентскую переписку. После итогового action он получает отдельное минимальное уведомление: тип решения, допустимая категория, последствие, срок действия, deadline и действие appeal.
22. Appeal Агента включается/выключается для новых quality decisions. Текущий срок — **7 дней**, значение управляется в админ-панели. Уже открытая апелляция не удаляется при изменении настройки.
23. Appeal содержит обязательный комментарий; внутренняя переписка по appeal клиенту не видна. В MVP reviewer/decision actor — `super-admin`.

### Full workflow

- Настраиваемая выборка консультаций.
- Повторный контроль после correction/retraining.
- Moderator workload/status.
- Trends и coaching routes при достоверных данных.
- Recertification/recheck по изменению критических правил.

### Приемка

- Normal review, critical fail, appeal/correction.
- Paid access block/readback.
- Reassignment не меняет historical score attribution.
- Public rating остается отдельно.
- Review каждой pilot session подтвержден.
- Admin positive/negative: change/readback/version, invalid max/pass, empty critical registry, concurrent activation и historical snapshot.
- Message/system/client-report/staff-flag/QA detection sources, false positive и duplicate-signal linkage.

## G6.4 Обучение и регламенты

### Требуемый admission path

```text
candidate -> course/modules -> tests -> final exam -> trial consultation
-> Ksenia review -> owner approval -> controlled first shifts -> regular admission/recheck
```

### Функциональные требования

1. Paid access закрыт, пока обязательные admission gates не пройдены.
2. Для каждого gate видны status, responsible reviewer, evidence, decision и rule/content version.
3. Минимальный pilot curriculum включает:
   - роли и privacy;
   - paid/session states и busy behavior;
   - billing/refund truth;
   - support/escalation;
   - tone, answer quality и boundaries;
   - difficult situations/safety route;
   - практику единого agent workspace.
4. Astrology/Tarot материалы допускаются только как source-backed content с утвержденными claim limits.
5. Reference competitor practices не становятся правилом без owned rewrite/approval.
6. Изменение критического billing/safety/session rule требует обновления материала и recheck допуска.
7. Failed/blocked/recheck statuses не позволяют paid work.
8. Первые смены имеют усиленный review и возможность быстро приостановить допуск.
9. Manual owner/Ksenia decision допустим в MVP при наличии audit/evidence.
10. Public certificate/badge не требуется для pilot и не подменяет внутренний admission.
11. После critical fail повторный допуск использует текущий workflow `correction -> retraining -> repeat test -> new trial consultation -> repeat review`.
12. Обязательность/порядок re-admission stages управляются в admin как versioned workflow; пропуск обязательного этапа не открывает paid access.
13. Admission использует только active safety policy/template/resource version; exact legal/domain approval остается обязательным release gate.

### Приемка

- Candidate без gate не получает paid access.
- Полный admission path pilot agent.
- Failed exam/trial/Ksenia/owner case.
- Rule update вызывает required recheck.
- Controlled first shift и critical pause.
- Evidence/version readback.
- Missing/stale/unapproved safety policy/resource не дает paid admission.

## G6.5 Командные уведомления

### Pilot critical alerts

- Missed paid request.
- Paid/first-response SLA breach.
- Payment/refund inconsistency.
- Assignment conflict или forbidden access attempt.
- Critical quality/safety fail.
- Admission/recheck expired или paid-access block.

### Функциональные требования

1. Alert имеет severity, объект, владельца, действие и срок.
2. Duplicate события объединяются или связываются.
3. Получатели ограничены ролью и областью ответственности.
4. Acknowledgement/assignment видимы staff.
5. Resolve требует результата/причины и останавливает повторный шум.
6. Critical alert не зависит только от email/push; он остается видимым в staff workflow.
7. Manual routing допустим в pilot при воспроизводимом evidence.
8. Critical O6 incident немедленно создает один staff route, прекращает обычный сценарий, не запускает новую paid minute и сохраняет safety-policy version.

### Приемка

- Owner, dedup, escalation, resolve.
- Foreign-role negative.
- Alert сохраняется при неуспешной внешней доставке.
- Один incident не превращается в несколько несвязанных задач.
- Protected safety route сохраняет applied policy/template/resource version и доступен разрешенному staff readback.

## G6.6 Отдельный staff/admin URL

### Требуемый результат

Agent/moderator/support работают в отделенной staff-поверхности, ориентированной на их рабочие задачи. Отдельный URL/меню не является механизмом безопасности и не дает прав сам по себе.

### Функциональные требования

1. Staff-role попадает в соответствующий workspace и не вынужден использовать клиентский frontend для работы.
2. Основные маршруты поддерживают assigned profiles/dialog queue, active paid focus, support/QA actions и role-appropriate readback.
3. Навигация не показывает мертвые/запрещенные действия.
4. Direct path с недостаточной ролью дает тот же запрет, что и отсутствие UI action.
5. Возврат/ошибка не переводит staff в client account context с расширенными правами.
6. URL/поверхность может отличаться по роли, но access определяется правами и assignment.
7. Current paid task, queue и critical alerts имеют понятный приоритет.
8. Mobile/responsive behavior поддерживает просмотр/critical action без перекрытий, но primary paid work может иметь явно заявленные ограничения устройства.

### Приемка

- Agent/moderator/support/super-admin navigation.
- Direct-path negative.
- Assigned workspace completeness.
- Ошибка/возврат не дает role confusion.
- Нет fake/dead actions на критическом пути.

## G6.7 Изолированный доступ

### Функциональные требования

1. Agent видит только assigned expert profiles, их разрешенных клиентов, диалоги, sessions и действия.
2. Foreign profile/dialog/client недоступны через list, search, direct path и любое действие.
3. Agent не может отправить от чужой экспертной анкеты.
4. Agent не может самостоятельно расширить assignment или внутреннюю роль.
5. Support/moderator имеют отдельные минимально необходимые области доступа.
6. Super-admin видит actual actor и полную audit history.
7. UI hiding не считается достаточным запретом: фактическое действие также отклоняется без раскрытия данных.
8. После reassignment старый agent теряет доступ, новый получает только предусмотренный scope.
9. Access attempt и critical denial доступны для staff audit/incident review без раскрытия клиенту внутренних деталей.
10. Staff-role не использует client frontend/login-as-user как обычный обход рабочего контура.

### Обязательная матрица приемки

| Сценарий | Результат |
|---|---|
| Assigned profile read | Разрешено |
| Assigned dialog read/send | Разрешено |
| Foreign profile read | Запрещено |
| Foreign dialog read | Запрещено |
| Send as foreign profile | Запрещено |
| Direct path/search | Те же ограничения |
| Actual actor readback | Видим super-admin |
| Reassignment after end | History сохранена, access передан |
| Reassignment during paid/pause | Запрещено |

## Оставшиеся release/proof gates

- O2 scorecard/critical-fail/re-admission принят; открыт только admin/runtime proof.
- O6 product minimum принят/admin-managed; exact safety legal/domain wording/resources остаются release gate.
- O1 SLA принят; admin/readback/runtime proof остается обязательным, но дополнительного owner-решения по цифрам нет.
- Legal/domain release gate не блокирует описание и разработку workflow, но блокирует limited paid pilot acceptance для соответствующих safety routes.

## Proof

G6 принимается только по authenticated role matrix на сопоставленной сборке. Проверка скрытых кнопок, static admin mockup или отдельного URL без direct negative actions недостаточна.

## Knowledge basis

- Claim class: owner decisions + accepted canonical product rules; O1/O2/O6 thresholds/product minimum приняты, legal resources и runtime proof открыты.
- `reports/six-global-goals-owner-facts-update-2026-07-12.md`.
- `reports/six-global-goals-final-canonical-pm-plan-2026-07-14.md`, G6.
- `reports/tz-product-g6-3-quality-control-2026-07-16.md`.
- `reports/tz-product-g6-4-expert-training-admission-2026-07-16.md`.
- `.ops/knowledge/nebula/answers/expert-training-and-operational-knowledge.md` и `.../knowledge/six-goals-training-product-addendum.md` для admission/QA; source material не является approved policy/runtime.
