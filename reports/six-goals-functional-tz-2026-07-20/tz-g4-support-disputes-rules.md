# G4. Функциональное ТЗ: support, disputes, refunds и обязательные правила

Статус: `requirement_defined_O1_O6_R1_accepted_legal_runtime_open`  
Задачи: G4.1-G4.4  
Фазы: minimum — `pilot_minimum`; full operations — `public_launch/post_launch`

## Маршрутизация исполнения G4

| Task | Класс | Операционная дорожка | Development-дорожка |
|---|---|---|---|
| G4.1 | `MIXED` | Moderator/support ведёт case, SLA, communication и evidence | Persistence, session linkage, ACL, status/readback |
| G4.2 | `MIXED` | Moderator расследует; только super-admin подтверждает refund/correction | Dispute lifecycle, preview, ledger linkage, appeal/audit |
| G4.3 | `CONTENT_POLICY` | PM/legal утверждают смысл; moderator переводит/публикует; super-admin активирует version | Consent/version enforcement и missing key/route/binding |
| G4.4 | `MIXED` | Owner routes, recipients, acknowledge/resolve и templates | Critical routing, dedup, delivery/escalation/readback |

Policy text не пишется Игорем. Technical handoff создаётся только для отсутствующей или сломанной capability. Канон: `task-execution-ownership-matrix.md`.

## Общий результат G4

Клиент может открыть обращение из конкретной консультации, staff восстанавливает контекст без ручного пересказа, спор заканчивается одним проверяемым решением, а обязательные правила и consent сохраняются для соответствующей session.

## G4.1 Поддержка

### Функциональные требования

1. Клиент может открыть support case из собственной consultation/session или выбрать ее при создании обращения.
2. Case связывается с клиентом, expert profile, session, существенным временным/финансовым итогом и доступным контекстом сообщений.
3. Клиент выбирает понятную категорию и описывает проблему.
4. Клиент видит факт принятия, текущий статус и итог обращения.
5. Case получает ответственного или очередь с понятным owner route.
6. Support видит достаточно контекста для восстановления случая, но не получает доступ ко всем чужим данным.
7. Moderator подключается к quality/safety части по роли; финансовый override доступен только разрешенной роли.
8. Super-admin видит полную историю решений, actors и связанные финансовые действия.
9. Foreign client/agent не может открыть или прочитать чужой case.
10. Закрытие case требует результата/причины; повторное открытие сохраняет историю.
11. Если session недоступна или еще не создана, обращение возможно, но отсутствие связи явно видно и требует последующего уточнения.
12. Если по той же session уже существует открытое обращение с той же проблемой, клиент видит его и может дополнить; новое независимое обращение допускается только для отдельной проблемы и сохраняет связь между связанными cases.
13. Support first-response SLA управляется в админ-панели; текущее значение — 15 минут в настроенные support hours. При создании case фиксируются примененные значение, schedule/timezone version и deadline.
14. Изменение SLA во время активного case не сдвигает его deadline; новый case использует новую сохраненную версию.
15. В личном кабинете существует раздел «Поддержка» со списком обращений. Из истории consultation клиент может открыть связанный case или создать новый по этой session.
16. Клиент видит статус, последнее обновление, ожидаемый срок, безопасный итог и доступное следующее действие. Support-переписка не смешивается с бесплатным диалогом или consultation messages.
17. Необходимое support evidence допускается через защищенный route для поддерживаемых типов с malware/size/access/retention guards. Ограничения consultation chat не должны скрыто блокировать законно необходимое evidence.

### Минимальные статусы

- created/received;
- assigned/in review;
- waiting for client или waiting for staff decision;
- resolved;
- rejected/no action с причиной;
- reopened;
- incident/escalated для несогласованного финансового или технического результата.

### Приемка

- Create from session и manual selection.
- Client status/readback.
- Support assigned/read/update.
- Foreign-access negative cases.
- Reopen без потери истории.
- Повторное обращение по той же проблеме не создает две независимые конкурирующие обработки.
- Technical interruption case восстанавливает session и деньги.

## G4.2 Жалобы и возвраты

### Функциональные требования

1. Жалоба/спор содержит категорию, reason, доказательства/контекст, reviewer и итоговое решение.
2. Решение может быть no refund, partial refund, full refund или escalation в рамках утвержденной policy.
3. Финансовое действие связано с одной session и одним решением.
4. Повторная обработка решения не создает вторую correction.
5. Historical actual agent определяется по session, а не по текущему assignment.
6. Override хранит первоначальное решение, итог, автора и объяснение.
7. Клиент получает понятный итог и сумму, если она применима.
8. Agent/moderator видит только необходимый quality/operational outcome, а не лишние платежные данные.
9. Appeal/correction решения не удаляет первоначальную историю.
10. Critical safety/quality case может приостановить допуск агента независимо от финансового решения.
11. R1 refund framework принят: technical full/proportional, duplicate full correction, quality manual no/partial/full, O6 refund candidate, changed-mind auto 0%/manual exception.
12. Admin numeric cells показывают value/unit/range/unset, eligible remaining amount и calculation preview; confirm доступен только разрешенной роли с evidence/reason.
13. Клиент может запросить refund в течение **30 дней** после завершения consultation; значение управляется в админ-панели до legal review.
14. Все фактические refunds выполняются только после ручного решения `super-admin`. Автоматические signals/rules создают candidate и preview, но не финансовое действие.
15. Перед confirm super-admin видит debits, prior refunds/corrections, remaining eligible amount, full/partial/no-refund variant, refund destination, compensation отдельно, agent correction preview, reason/evidence, policy version и клиентское сообщение.
16. Клиент может один раз обжаловать итоговое решение в течение **7 дней**; значение управляется в админ-панели. Апелляция сохраняет первоначальное решение и создает новую версию итога.
17. Финансовая ошибка при исполнении не закрывает case. Case остается открытым до успешного движения и корректного клиентского сообщения.

### Приемка

- No/full/partial refund.
- One decision -> one financial correction.
- Duplicate/retry.
- Reassignment.
- Appeal/override.
- Quality block без автоматического изменения public rating.
- Numeric input/preview, unauthorized confirm, cumulative ceiling и policy-version change.

## G4.3 Документы и обязательные правила

### Pilot minimum

До paid start клиенту понятны:

- consultation price в credits/minute; purchase currency и package totals показываются отдельно на top-up/payment surface;
- применимый trial и его длительность;
- автоматический переход в paid после заранее данного consent;
- правило оплаты каждой начатой минуты;
- отсутствие старта новой минуты без полной стоимости;
- пятиминутная balance pause и ее одноразовость;
- правило late top-up;
- способы завершения consultation;
- путь support/refund;
- применимые обязательные ограничения услуги и critical escalation.

### Функциональные требования

1. Consent связан с версией применимых правил и service session.
2. Обязательное существенное обновление требует нового consent до следующего paid start.
3. Старые session сохраняют правила, примененные на момент их старта.
4. Отсутствующие/устаревшие обязательные правила блокируют paid start с понятным объяснением.
5. Client-facing price, trial duration, countdown, pause limit и применимое refund состояние соответствуют фактически действующим для данной session правилам; изменение admin values отражается в следующих применимых start/consent screens без изменения старых session.
6. Staff видит актуальную рабочую версию правил и дату/статус допуска к ней.
7. Training/exam examples используют только утвержденные или явно учебные переписанные материалы.
8. Публичная достоверность личности/аватара исключена из этого ТЗ по решению владельца.
9. O6 protected minimum запрещает guarantees, fear/dependency/artificial-incompleteness pressure, hidden paid state, medical/legal/financial instruction, external payments/private contacts и privacy breach.
10. Self-harm, violence, illegal и minor-sensitive cases прекращают обычный сценарий, не запускают новую paid minute и немедленно направляются в approved staff safety route.
11. Prohibited rules, incident categories/routes, client templates и approved resources управляются на отдельном protected admin-экране по `admin-panel-settings-development-package.md`.
12. Удаление/ослабление protected minimum требует отдельного owner/legal approval; обычный admin save не может активировать такую версию.
13. Exact US-English wording/resources остаются legal/domain release gate; missing approval блокирует paid pilot для соответствующего route и не заменяется выдуманным текстом.
14. Клиент может сообщить о нарушении из собственной session/message, выбрать категорию и конкретный эпизод; report создает safety signal, а не автоматически подтвержденное нарушение.
15. Signal проходит состояния `created -> under_review -> confirmed|dismissed -> actioned`; клиент видит допустимый status без внутренних detector/KPI данных.
16. Ограничение consultation chat не запрещает законно необходимый support evidence: он собирается отдельными защищенными полями с purpose, минимальным role access и retention, а не свободным сообщением.

### Acceptance

- Current/stale/missing rule version.
- Consent before start и отсутствие consent.
- Rule update между двумя session.
- Client/history/admin readback примененной версии.
- Wording соответствует фактическому started-minute/pause/refund behavior.
- Admin positive/negative: policy/template/resource version, protected-minimum removal block, stale approval и historical snapshot.
- Critical route: ordinary consultation stops, no new paid minute, one incident/escalation, client/staff readback.

## G4.4 Уведомления поддержки

### Pilot minimum

Обязательные сигналы:

- новый case назначен/поступил в очередь;
- case приближается к SLA или просрочен;
- требуется owner/super-admin refund decision;
- payment/refund result расходится с case/session;
- critical safety/quality incident;
- клиенту доступен итог обращения.

### Функциональные требования

1. Один case/incident имеет одного текущего владельца или понятную очередь.
2. Повтор одного события не создает неконтролируемые дубли.
3. Получатели ограничены ролями и связанным case.
4. Alert содержит case reference, severity, требуемое действие и срок, но не раскрывает лишние данные.
5. Acknowledgement/assignment меняет ответственность и доступно в staff readback.
6. Закрытый incident не продолжает генерировать overdue alerts.
7. Неуспешная доставка не меняет финансовое решение и видна операционно.
8. Ordinary overdue escalation использует admin-множитель 2x применимого SLA; critical payment/access/safety incident создает немедленную escalation.
9. Admin change/readback/audit и snapshot выполняются по `tz-crosscut-admin-managed-settings.md`.

### Public/post-launch extension

- Настраиваемые каналы.
- Escalation levels и duty routes.
- Digest для некритических событий.
- Аналитика delivery/acknowledgement без подмены case status.

### Приемка

- Assignment, overdue, escalation и resolve.
- Dedup.
- Foreign-role negative.
- Incident mismatch.
- Client notification только по собственному case.

## Открытые owner/policy gates

- Refund framework R1 принят/admin-managed; exact operational inputs могут быть `unset` и видимы как configuration state.
- Финансовая approving role; pilot support SLA O1 принят и остается открытым только для runtime/admin proof.
- O6 product minimum принят и admin-managed; открыт exact legal/domain wording/resources и runtime/admin proof.
- Открытые refund/financial approval перечислены в `owner-decisions.md` и не блокируют остальные части ТЗ.

## Knowledge basis

- Claim class: owner decisions + proposed owned support/safety rules; policy wording и runtime открыты.
- `reports/six-global-goals-final-canonical-pm-plan-2026-07-14.md`, G4.
- `reports/tz-product-g4-1-g4-2-support-refund-2026-07-16.md`.
- `reports/tz-product-g4-3-rules-trust-safety-2026-07-16.md`.
- `.ops/knowledge/nebula/answers/expert-training-and-operational-knowledge.md` и его Critical Safety Boundary: source examples не являются утвержденной US policy.
