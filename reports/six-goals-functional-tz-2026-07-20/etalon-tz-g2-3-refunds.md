# ТЗ для Игоря - G2.3 «Возвраты по консультации»

Продуктовая постановка для вычитки и согласования с программистом. Документ описывает требуемую логику и результат. Способ технической реализации выбирает Игорь.

## 1. Цель

Создать понятный и проверяемый процесс возврата credits по конкретной завершенной consultation session.

Готовый результат:

- клиент может запросить возврат из собственной консультации или поддержки;
- система автоматически прикладывает финансовый и временной контекст session;
- super-admin принимает ручное решение `без возврата / частичный / полный`;
- одобренные credits возвращаются exactly once и не превышают допустимую сумму;
- клиент видит понятный статус, решение и фактически возвращенную сумму;
- refund не меняет конечный статус consultation и не смешивается с cash refund покупки пакета;
- все настройки, решения, версии и финансовые действия доступны в audit.

## 2. Место G2.3 в общем продукте

G2.3 владеет:

- refund case по одной consultation session и одной категории проблемы;
- проверкой допустимой суммы;
- решением no/partial/full;
- возвратом credits в balance;
- клиентской апелляцией;
- связью с support case, ledger и agent correction;
- настройками refund policy.

Связанные владельцы:

- G1.1 показывает refund в карточке consultation;
- G1.3 хранит consultation завершенной и показывает связанные процессы;
- G1.4 доставляет клиентские уведомления;
- G2.1 владеет balance buckets и движениями credits;
- G2.2 предоставляет minute/debit/incident facts;
- G2.4 применяет agent correction после успешного refund;
- G4.1 владеет support ticket и перепиской;
- G4.2 владеет жалобой, evidence и безопасным клиентским решением;
- G5 получает события и показатели.

G2.3 не владеет:

- состояниями активной consultation;
- правилами списания минуты;
- cash refund покупки credit package;
- chargeback платежного провайдера;
- support-перепиской;
- quality или safety verdict;
- agent payout;
- автоматическим compensation bonus.

## 3. Термины

### Refund candidate

Факт или сигнал, который требует финансовой проверки. Candidate не является одобрением и не создает движение credits.

### Refund request

Запрос клиента на рассмотрение возврата по конкретной consultation.

### Refund case

Отдельный финансовый процесс, связанный с consultation session и support ticket. Он имеет собственный статус и не становится статусом consultation.

### Eligible charge

Фактически сохраненный debit consultation, который можно учитывать в конкретном refund case.

### Remaining refundable amount

`eligible charges - все уже выполненные refunds/corrections по этой допустимой базе`.

### Refund decision

Версионируемое ручное решение super-admin: no refund, partial refund или full refund.

### Refund execution

Фактическое защищенное движение credits в balance клиента.

### Appeal

Одна формальная просьба клиента пересмотреть итоговое решение в установленный срок.

### Compensation

Отдельное бонусное начисление, не являющееся возвратом ранее списанных credits.

## 4. Роли и видимость

### Клиент

Может:

- открыть refund request по своей consultation;
- дополнить существующее активное дело;
- предоставить разрешенное evidence;
- видеть безопасный статус, срок, запрос дополнительной информации и итог;
- один раз подать appeal;
- отозвать запрос до принятия решения.

Не видит:

- внутренние комментарии staff;
- detector/quality/safety details;
- agent correction и payout;
- чужие cases и sessions;
- внутренние reason codes.

### Эксперт и Агент

Не видят refund case, support ticket, клиентскую переписку, точную сумму, evidence и решение. G2.4 отдельно определяет допустимый readback собственной correction после финансового результата.

### Super-admin

В MVP:

- видит полный case, session, support link, minute/debit facts и evidence;
- создает candidate или case вручную;
- запрашивает уточнение;
- готовит и подтверждает no/partial/full decision;
- выполняет или повторяет безопасное исполнение;
- рассматривает appeal;
- делает исправление отдельным движением;
- управляет refund settings.

Другие роли и permissions могут быть назначены позднее через существующий RBAC. Новая роль в рамках G2.3 не создается.

## 5. Обязательные invariants

1. Refund относится к одной конкретной consultation session.
2. Refund case не меняет terminal status consultation.
3. Support ticket и refund case являются разными связанными объектами.
4. Candidate не создает финансовое движение.
5. Любой фактический refund подтверждает только super-admin.
6. Суммарный refund не превышает remaining refundable amount.
7. Один logical execution не создает два движения credits.
8. No-refund decision не создает нулевое финансовое движение для имитации возврата.
9. Completed refund нельзя удалить или переписать.
10. Ошибка исправляется отдельной correction с причиной и audit.
11. Refund не создает скрытый отрицательный balance клиента.
12. Refund не превращает agent correction в положительное дополнительное начисление.
13. Cash refund package purchase не исполняется через session refund.
14. Compensation bonus не подменяет refund.
15. Клиенту нельзя обещать сумму до успешного исполнения.
16. Изменение admin policy не переписывает старые решения и движения.

## 6. Точки входа клиента

Refund request доступен:

1. из карточки завершенной consultation в «Мои консультации»;
2. из связанного support ticket;
3. из раздела «Поддержка» с обязательным выбором consultation.

При входе из consultation:

- session подставляется автоматически;
- клиент видит Эксперта, дату, тему, duration и total debited credits;
- изменить session на чужую или недоступную невозможно.

При входе из поддержки:

- клиент выбирает одну из своих подходящих завершенных consultations;
- если подходящей consultation нет, создается обычный support case, но не refund case;
- cash/payment dispute направляется в отдельный route.

## 7. Создание candidate системой или staff

Refund candidate может появиться:

- после подтвержденного technical incident G2.2;
- при duplicate/incorrect debit;
- после quality/safety verdict;
- при финансовой reconciliation anomaly;
- вручную super-admin с обязательной причиной.

Candidate:

- сохраняет источник, category и связанные факты;
- может быть связан с существующим support ticket;
- не обещает клиенту возврат;
- требует ручного review;
- может завершиться без открытия клиентского refund request.

## 8. Один активный case и связанные дела

Для сочетания `session + category/problem identity` одновременно существует не более одного активного refund case.

Если клиент повторяет ту же проблему:

- система показывает существующий case;
- новый текст и evidence добавляются туда;
- deadline и audit обновляются по применимому правилу;
- второе финансовое дело не создается.

Если проблема другая:

- создается отдельный linked case;
- cases видят связь друг с другом;
- общий cumulative ceiling продолжает действовать по всей session.

## 9. Обязательные данные запроса

Клиент указывает:

- category;
- понятное описание проблемы;
- подтверждение, что запрос относится к выбранной consultation.

Необязательно:

- конкретные сообщения;
- период или paid minutes;
- поддерживаемые документы/изображения;
- дополнительный комментарий.

Система автоматически прикладывает:

- session ref и terminal result;
- Эксперта и actual Agent для внутреннего readback;
- applied price/config snapshots;
- trial/paid minute timeline;
- debit ledger и bucket allocation;
- warning/pause/reconnect/technical incidents;
- prior refund cases и movements;
- linked support/quality/safety records в разрешенном объеме.

## 10. Защищенное evidence

Evidence собирается только через support/refund route, а не через consultation chat.

Обязательны:

- разрешенные типы и размер;
- malware/content guard;
- purpose и минимальный role access;
- retention status;
- audit каждого restricted view;
- запрет раскрытия evidence Агенту;
- понятная ошибка при недоступном или отклоненном файле.

## 11. Статусы refund case

Используется отдельный lifecycle:

1. `candidate` - создан системный или staff signal;
2. `requested` - получен запрос клиента;
3. `under_review` - super-admin начал проверку;
4. `waiting_client` - нужны дополнительные данные клиента;
5. `decision_ready` - подготовлен draft решения и preview;
6. `approved` - ручное решение о partial/full refund подтверждено;
7. `declined` - принято no-refund решение;
8. `execution_pending` - финансовое исполнение ожидается;
9. `completed` - credits успешно возвращены;
10. `execution_failed` - движение не завершено;
11. `appealed` - клиент подал допустимый appeal;
12. `closed` - процесс окончательно закрыт.

Support ticket сохраняет свои статусы `waiting_support / waiting_client / escalated / on_hold / resolved / closed`. Статусы support и refund не подменяют друг друга.

## 12. Срок подачи

1. Стартовый срок - **30 календарных дней** после завершения consultation.
2. Значение управляется в админ-панели до legal review.
3. Примененное правило и deadline сохраняются в case.
4. Истекший срок блокирует обычный клиентский request с понятным объяснением и support route.
5. Super-admin может создать protected correction/candidate после срока при объективной финансовой ошибке.
6. Изменение настройки не сокращает уже действующий срок открытого case.

## 13. Срок решения

1. Стартовый target - **72 часа** после получения полного набора необходимых данных.
2. Значение управляется в админ-панели.
3. При `waiting_client` decision clock приостанавливается.
4. После ответа клиента clock продолжается с сохраненным остатком.
5. SLA не является статусом case.
6. Нарушение срока создает staff escalation, но не автоматический refund.
7. Клиент видит ожидаемый срок без внутренних SLA details.

## 14. Категории и базовые правила

### Technical platform/Agent failure

Допустим full или proportional refund затронутой части по подтвержденным minute/incident facts.

### Duplicate/incorrect debit

Ошибочное движение исправляется полностью. Optional thresholds не отменяют protected correction.

### Quality complaint

Manual decision `no / partial / full` по evidence.

### Confirmed safety/prohibited-rule violation

Создается refund candidate. Financial outcome остается ручным evidence-based decision.

### Client changed mind

Для корректно оказанной started minute automatic refund = 0%. Возможен только ручной exception super-admin с причиной.

### Cash/payment dispute

Не является session refund. Клиент получает ссылку на отдельный payment-dispute route.

## 15. Eligible amount

Перед решением система показывает:

- все фактические paid-minute debits;
- допустимые affected minutes;
- уже возвращенные credits;
- remaining refundable amount;
- excluded movements и причину исключения;
- сумму, которую нельзя превысить.

Trial minutes не входят в refundable charges, потому что не списывали credits.

Compensation grants не увеличивают eligible session charges.

## 16. No, partial и full decision

### No refund

Super-admin выбирает reason и клиентское объяснение. Финансовое движение не создается.

### Partial refund

Super-admin выбирает:

- конкретные affected paid minutes; либо
- точное количество credits.

Система рассчитывает percentage, remaining amount и agent correction preview.

### Full refund

Возвращается вся remaining eligible amount по выбранной допустимой базе, но не больше cumulative ceiling.

Во всех вариантах обязательны:

- category;
- evidence/readback;
- internal reason;
- клиентское сообщение;
- policy version;
- actor и timestamp.

## 17. Calculation preview

До confirm super-admin видит:

- eligible charges;
- prior refunds/corrections;
- remaining refundable amount;
- выбранные minutes или credits;
- calculated percent и rounding;
- destination balance buckets;
- bonus expiry/grace result;
- client balance before/after;
- agent correction preview;
- warnings и blocking errors.

Confirm недоступен при:

- отсутствии обязательной причины;
- недопустимой сумме;
- missing evidence для выбранной категории;
- stale case revision;
- отсутствии super-admin access;
- invalid policy version.

## 18. Возврат в balance buckets

Refund восстанавливает источник списанных credits:

1. purchased credits возвращаются в purchased bucket без срока действия;
2. bonus credits возвращаются в соответствующий bonus bucket;
3. сохраняется source/campaign и исходный expiry;
4. если bonus expiry уже истек или до него осталось меньше **30 дней**, применяется minimum refund-use grace **30 дней**;
5. значение grace управляется в админ-панели;
6. refund credits участвуют в обычном spending order G2.1 согласно восстановленному bucket;
7. клиент видит понятную расшифровку.

## 19. Ручное подтверждение и исполнение

1. Draft decision не меняет balance.
2. Только super-admin может выполнить confirm.
3. Approved decision и financial execution разделены.
4. Refund считается выполненным только после успешного balance movement.
5. Execution использует устойчивую identity одного decision/version.
6. Retry/reload/double click не создают второй refund.
7. Одно logical refund может восстановить несколько source buckets, но имеет один согласованный execution result.
8. После success case получает `completed`.

## 20. Ошибка исполнения

Если financial action не завершен:

- case получает `execution_failed`;
- refund не показывается как выполненный;
- клиент видит безопасное сообщение о задержке;
- case и support route остаются открыты;
- super-admin видит техническую причину и безопасный retry;
- повтор не создает duplicate;
- agent correction и success notification не выполняются раньше refund.

Ошибка email после успешного ledger movement не отменяет refund. Delivery failure обрабатывается G1.4 отдельно, а клиент видит результат in-app.

## 21. Отзыв запроса

Клиент может отозвать request до финального решения.

При отзыве:

- case не удаляется;
- сохраняются actor, reason и timestamp;
- candidate/technical correction может остаться на внутренней проверке;
- после approved/declined/completed отзыв недоступен;
- объективную duplicate/incorrect debit correction нельзя отменить отзывом клиента.

## 22. Appeal

1. Клиент может один раз обжаловать final decision.
2. Стартовый срок - **7 календарных дней**.
3. Значение управляется в админ-панели.
4. Appeal требует комментарий.
5. Первоначальное решение не удаляется и остается видимым в audit.
6. Super-admin принимает новую версию decision.
7. Appeal может сохранить, увеличить или уменьшить еще не исполненный результат.
8. Уже выполненный refund не забирается скрыто у клиента.
9. После appeal обычное повторное открытие решения недоступно.
10. Объективная ошибка исправляется отдельной super-admin correction.

## 23. Клиентский readback и уведомления

Клиент видит:

- category понятным языком;
- дату подачи и последнее обновление;
- текущий статус;
- ожидаемый срок;
- запрос дополнительной информации;
- approved/declined outcome;
- затронутые minutes, если применимо;
- точное количество фактически возвращенных credits;
- balance after;
- понятную reason;
- срок и доступность appeal.

Клиент не видит internal codes, notes, Agent identity, agent correction, fraud/security details и чужие records.

In-app уведомление обязательно. Email fallback и отсутствие пользователя обрабатываются по G1.4. Клиенту не обещается сумма до successful execution.

## 24. Админ-панель

### Настройки

В существующем списке `/ru/admin/settings/index` добавляется пункт **«Настройки возвратов»**.

Маршрут: `/ru/admin/settings/refunds`.

Размещение: сразу после **«Настройки цен»** и перед **«Group settings»**.

На странице находятся только refund policy/settings:

- claim window - 30 дней;
- decision target - 72 часа;
- client appeal window - 7 дней;
- bonus refund-use grace - 30 дней;
- category enabled state;
- category eligibility/evidence checklist;
- full/proportional factors;
- maximum cumulative refund - 100%;
- rounding;
- client texts;
- version/effective date/audit.

Protected rules нельзя отключить обычным toggle:

- duplicate/incorrect debit full correction;
- no refund above eligible charges;
- no duplicate execution;
- manual super-admin approval;
- no hidden negative balance;
- immutable completed movements.

### Операционная работа

Настройки не используются как очередь cases.

Refund case открывается из связанного support ticket, consultation card или super-admin financial readback. В support ticket показываются link, status и безопасный outcome; финансовый confirm выполняется в защищенном refund block/case. Отдельная параллельная support-переписка не создается.

## 25. Snapshots и audit

Case сохраняет:

- session/support/candidate links;
- category/problem identity;
- request/candidate source;
- claim/deadline snapshots;
- policy version;
- eligible charge snapshot;
- selected minutes/credits;
- calculation preview;
- original and final decisions;
- appeal version;
- client/internal messages отдельно;
- execution identity and result;
- balance transaction links;
- restored bucket allocation;
- agent correction link;
- actors, reasons and timestamps;
- notification result.

## 26. Ошибки, retry и concurrency

Система безопасно обрабатывает:

- duplicate submit;
- два одновременных request по той же category;
- concurrent super-admin decisions;
- stale case revision;
- два confirm;
- partial refunds одновременно;
- refund и late correction;
- insufficient remaining amount;
- balance write failure;
- notification failure;
- appeal и execution одновременно;
- policy change во время review;
- lost worker after ledger commit;
- unauthorized access.

## 27. Критерии готового результата

### Positive

1. Клиент создает request из своей consultation.
2. Повтор той же проблемы дополняет активный case.
3. Другая category создает linked case.
4. Technical incident создает candidate без обещания денег.
5. No refund завершает decision без движения.
6. Partial by minutes возвращает правильные credits.
7. Partial by amount показывает совпадающий percentage.
8. Full возвращает remaining eligible amount.
9. Purchased credits восстановлены без expiry.
10. Bonus credits восстановлены с применимым grace.
11. Success показан клиенту после ledger movement.
12. Appeal принят один раз в срок.
13. Клиент отзывает request до decision.
14. Cash refund направлен в payment-dispute route.

### Negative, privacy и concurrency

15. Чужая session недоступна.
16. Истекший claim window блокирует обычный request.
17. Agent не видит case/evidence/amount.
18. Candidate не создает refund.
19. Amount выше remaining блокируется.
20. Два confirm создают одно движение.
21. Два partial refund не превышают cumulative ceiling.
22. Execution failure оставляет case открытым.
23. Notification failure не отменяет успешный refund.
24. Completed refund нельзя удалить.
25. Correction не создает скрытый negative balance.
26. Appeal второй раз блокируется.
27. Policy change не переписывает открытый snapshot.
28. Withdraw не отменяет protected duplicate correction.
29. No-refund не создает fake ledger movement.
30. Compensation не включается в refund amount.
31. Session остается с прежним terminal status.
32. Support status и refund status не расходятся скрыто.
33. Concurrent admin получает conflict/readback.
34. Unauthorized settings/decision action блокируется.

## 28. Действия Игоря

Перед реализацией:

- показать фактическую карту текущих support, finance, balance и service session частей;
- отметить, какие существующие страницы расширяются;
- подтвердить, что refund не меняет consultation status;
- согласовать mapping этого ТЗ на реальные сущности и routes;
- отметить текущие ограничения и migrations.

После реализации предоставить:

- список измененных файлов и migrations;
- positive/negative/concurrency tests;
- proof client request/status/appeal;
- proof super-admin preview/confirm/retry;
- balance and bucket reconciliation;
- session/support/refund/agent-correction linkage;
- permissions and audit proof;
- rollback и known limits.

## Основание продуктового решения

- Прямые решения владельца от 2026-07-28 по G2.3.
- `etalon-tz-g2-1-price-balance.md`.
- `etalon-tz-g2-2-timer-debit-pause.md`.
- `etalon-tz-g1-3-status-history.md`.
- `tz-g4-support-disputes-rules.md`.
- `admin-panel-settings-development-package.md`.
- Support-ticket prototype используется как accepted UI/workflow reference, но не как runtime proof.

## Служебные сведения о документе

- Задача: G2.3.
- Версия: 1.0.
- Дата: 2026-07-28.
- Приоритет: P0.
- Автор постановки: Product Owner / Project Manager Nebula.
- Статус спецификации: `spec_handoff_ready`.
- Статус реализации: `implementation_runtime_open`.
- Связанный технический контекст: `codex-context-g2-3-refunds.md`.
