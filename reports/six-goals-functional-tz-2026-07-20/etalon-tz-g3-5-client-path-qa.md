# Протокол G3.5 «Сквозная проверка клиентского пути»

## 1. Цель

Подготовить и доказать на одной идентифицируемой сборке полный клиентский путь Nebula от первого входа до результата консультации и связанных операций.

G3.5 является обязательным release gate ограниченного платного пилота. Наличие отдельных экранов, ТЗ, макетов или локальных unit-проверок не заменяет этот сквозной проход.

Класс исполнения: `QA_GATE`.

- Игорь предоставляет идентифицируемую сборку, fixtures/test hooks и исправляет отдельные дефекты.
- Независимый QA/super-admin выполняет scenarios, временные настройки, rollback, persisted/admin/financial readback и собирает evidence packet.
- PM единолично выдаёт итоговый `GO/NO_GO`.
- Этот документ не является поручением Игорю самостоятельно проверить и принять собственную реализацию.

## 2. Место G3.5 в общем продукте

Проверяется единая цепочка:

```text
витрина / каталог / профиль
-> выбор Эксперта или подбор
-> авторизация с сохранением намерения
-> бесплатный диалог
-> consultation request
-> принятие и явное подтверждение
-> connecting
-> trial, если есть
-> paid minute
-> normal end либо balance pause / top-up / reconnect / technical end
-> «Мои консультации» и карточка consultation
-> support/refund route
-> согласованный admin, audit и financial readback
```

G3.5 не создаёт новые бизнес-правила. Она принимает или отклоняет интеграцию G1–G6 на основании заранее утверждённых правил.

## 3. Результат

К пилоту допускается только сборка, для которой:

- один и тот же клиентский сценарий прошёл через реальные интерфейсы;
- клиент, публичный Эксперт, фактический Агент и consultation связаны без подмены;
- состояния, деньги, сообщения и история согласованы;
- server-side negative cases доказаны;
- каждый P0 FAIL исправлен и перепроверен;
- остаточные риски перечислены и имеют принятое решение;
- итоговый verdict равен `GO`.

## 4. Термины

### Проверяемая сборка

Развёрнутая версия продукта с однозначным build/commit marker и зафиксированной конфигурацией.

### Fixture

Контролируемая тестовая сущность: клиент, Эксперт, Агент, баланс, coupon, назначение или consultation, подготовленная для конкретного сценария.

### Evidence packet

Набор доказательств before/after, UI, persisted state, admin readback, audit, события и финансовые движения, достаточный для независимого повторения вывода.

### Oracle

Заранее определённый наблюдаемый результат: состояние, запись, сумма, доступ, сообщение или отсутствие запрещённого side effect.

### P0 FAIL

Подтверждённый дефект денег, доступа, состояния, приватности, доставки либо ключевого клиентского пути, запрещающий пилот.

## 5. Роли

### Гость

Доказывает публичный путь просмотра и корректный переход к авторизации.

### Клиент

Проходит выбор, бесплатный диалог, request, consent, consultation, историю и support/refund route.

### Эксперт

Публичная анкета, видимая клиенту во всех связанных поверхностях.

### Агент

Фактический оператор только назначенных анкет; участвует в positive и foreign-access negative cases.

### Модератор / support

Проверяет support-сценарий в пределах своих разрешений, без доступа к чужим внутренним данным.

### Super-admin

Видит полную связь сущностей, audit, финансовые движения, настройки и принимает итоговый evidence packet.

### PM

Принимает `GO/NO_GO`; технический PASS без PM verdict не является запуском пилота.

## 6. Preconditions

До начала сквозного прохода должны быть зафиксированы:

- build marker;
- base URL и режим окружения;
- роли и тестовые identities;
- клиентский balance;
- trial/bonus entitlement;
- effective price Эксперта;
- active assignment;
- актуальный versioned admission G6.4 для фактического Агента и выбранной экспертной анкеты: статус `admitted_active`, версия курса, версия правил/policy, версия scorecard и результат reviewer/approver;
- источник, версия и время admission snapshot, который будет повторно проверен перед созданием session и перед первой paid-минутой;
- состояния online/offline/busy;
- применимые версии consultation, chat, price, refund и notification settings;
- безопасные тестовые тексты и вложения;
- rollback/cleanup plan;
- список ожидаемых событий и readback-поверхностей.

Если обязательная конфигурация отсутствует, тест не подставляет выдуманное значение и получает `BLOCKED_CONFIGURATION`, а pilot gate остаётся `NO_GO`. Missing, stale, failed, blocked или не связанный с фактическим Агентом/анкетой admission не заменяется допущением: положительный проход блокируется, а отрицательный admission-case обязан доказать fail-closed результат без eligibility, session и debit.

## 7. Основной положительный сценарий

1. Гость открывает публичную витрину.
2. Выбирает тему или Эксперта.
3. Открывает карточку/профиль и видит актуальную цену и доступность.
4. Нажимает «Задать вопрос».
5. Проходит авторизацию; выбор, тема и черновик сохраняются.
6. Отправляет вопрос в бесплатный диалог без списания.

Далее обязательно выполняются **два разных положительных варианта**, потому что порядок действий у них различается.

### 7A. Запрос создаёт клиент

1. Клиент создаёт consultation request; session и списание ещё не создаются.
2. Назначенный Агент принимает request через экспертную анкету.
3. Принятие Агентом только открывает клиенту confirmation card с актуальными price/trial/условиями; session по-прежнему отсутствует.
4. Клиент явно подтверждает условия.
5. Committed client consent создаёт exactly one session в `connecting`.

### 7B. Начать консультацию предлагает Эксперт

1. Эксперт предлагает начать консультацию внутри бесплатного диалога; session и списание ещё не создаются.
2. Клиент видит актуальные price/trial/условия и явно принимает предложение.
3. Принятие предложения клиентом само является committed consent и создаёт exactly one session в `connecting`.
4. Повторное принятие request Агентом в этом варианте отсутствует.

### 7C. Общая часть после создания session

1. До создания session и повторно перед первой paid-минутой система проверяет current versioned admission G6.4 фактического Агента для выбранной экспертной анкеты.
2. Обе стороны фактически подключаются.
3. Trial проходит только при наличии entitlement.
4. Первая paid-минута начинается с одной атомарной операцией списания.
5. Консультация корректно завершается.
6. Клиент видит консультацию в «Моих консультациях».
7. Super-admin видит одну связанную consultation card, диалог, сообщения, состояния, actual Agent, admission snapshot и financial summary.
8. Клиент открывает support/refund route из этой consultation.
9. Связанный case не меняет terminal state консультации и не создаёт деньги без решения.

## 8. Обязательные альтернативные сценарии

Отдельно проверяются:

- оба initiation path из 7A и 7B с их собственным порядком accept/consent;
- trial равен нулю и этап пропускается;
- недостаточно balance для первой paid-минуты;
- trial закончился при нулевом balance и используется одна balance pause;
- пополнение во время pause и явное продолжение;
- late top-up после завершения остаётся на balance;
- клиентский reconnect grace;
- Agent reconnect grace и technical end;
- одновременная потеря связи с единым incident;
- busy/offline Эксперт;
- изменение цены после открытия карточки;
- current admission G6.4 и положительный проход;
- missing admission;
- stale/expired admission после изменения критической версии;
- failed/blocked admission или admission другой связки Agent/profile;
- отмена request до старта;
- истечение request;
- завершение клиентом и Агентом;
- partial/full/no-refund decision и execution failure;
- client appeal;
- цензурированное сообщение и audit incident;
- email fallback при подтверждённом отсутствии пользователя;
- пустой результат каталога или подбора.

## 9. Обязательные negative и security-сценарии

1. Агент открывает назначенную анкету — доступ разрешён.
2. Агент пытается открыть чужую анкету, диалог, consultation или assignment — server-side отказ.
3. Агент подменяет идентификатор публичной анкеты при отправке — отказ без сообщения клиенту.
4. Гость вызывает защищённое действие напрямую — авторизация, без создания request/session.
5. Клиент пытается открыть чужую consultation — отказ без утечки существования и данных.
6. Повтор create/accept/start/end не создаёт второй transition.
7. Повтор minute-start не создаёт второй debit.
8. Одновременные paid-start attempts одного Агента дают не более одной активной paid session.
9. Повтор refund execution не создаёт второе движение.
10. Cumulative refund не превышает eligible debit.
11. Busy/offline/blocked не запускает paid.
12. Устаревший price/start context не используется молча.
13. Запрещённый оригинал сообщения не раскрывается получателю.
14. Изменение current assignment не переписывает historical actual Agent.
15. Missing admission не даёт display/action eligibility, не создаёт session/debit, сохраняет reason code и даёт `NO_GO`.
16. Stale/expired admission после изменения критической версии действует fail-closed до re-check: нет session/debit, положительный E2E не считается пройденным.
17. Failed/blocked admission или admission от другой связки Agent/profile запрещает paid flow без client-data leak и фиксируется в audit.

## 10. Проверка данных и финансов

Для одной консультации должны согласоваться:

- session identifier;
- persistent dialogue;
- message range/events;
- клиент;
- публичная экспертная анкета;
- фактический Агент и assignment snapshot;
- request и consent;
- price/trial/settings snapshots;
- каждая started minute;
- debit ledger;
- accrual;
- terminal result;
- refund/correction/compensation, если применимо;
- support/quality links;
- audit/event history.

Суммы клиента, session summary, transaction ledger и admin readback не должны расходиться.

## 11. Проверка видимости по ролям

### Клиент

Видит только свою consultation, публичного Эксперта, понятные состояния, списанные credits и безопасные support/refund статусы.

### Агент

Видит только назначенные анкеты и необходимый consultation context. Не видит внутренние refund/support details и чужие данные.

### Support/модератор

Видит только данные, требуемые его действием и permissions.

### Super-admin

Видит полную историческую связь, actual actor, applied snapshots, audit и финансовый readback.

## 12. Evidence packet

Для каждого case сохраняются:

- case ID;
- цель и product rule;
- build marker;
- preconditions;
- fixture identifiers без секретов;
- before-state;
- точные шаги;
- expected result;
- actual result;
- UI screenshot;
- persisted/admin readback;
- audit/event/ledger evidence;
- отсутствие запрещённого side effect;
- cleanup/rollback;
- verdict `PASS/FAIL/BLOCKED/RETEST`;
- owner следующего действия.

Скриншот без state/readback не является достаточным доказательством денег, ACL или idempotency.

## 13. Правила verdict

- `PASS` — case доказан полностью.
- `FAIL` — наблюдаемое поведение расходится с утверждённым oracle.
- `BLOCKED_CONFIGURATION` — отсутствует обязательная среда/настройка; не считается PASS.
- `RETEST` — старое или неполное evidence необходимо заменить.
- `INVALID` — сценарий или доказательство не относится к проверяемой сборке.

Итог:

- `GO` — все обязательные P0 cases PASS, residuals приняты PM;
- `NO_GO` — есть P0 FAIL, незакрытый ACL/money/state defect, неполный build traceability или финансовое расхождение.

Средний процент не может превратить P0 FAIL в GO.

## 14. Админ-панель и readback-поверхности

Super-admin является владельцем административной проверки полного клиентского пути. Тест не создаёт новые настройки: он читает и временно изменяет только канонические административные источники каждой функции, после чего обязательно возвращает baseline и подтверждает rollback через readback.

G3.5 не объединяет смежные настройки в одну QA-страницу и не дублирует управление чатом, ценами, возвратами, уведомлениями, профилями или ротацией. QA-пакет содержит ссылки на фактические страницы-владельцы и доказательство согласованности между ними.

Проверка использует канонические операционные поверхности:

- consultation list/card;
- working Chat и message journal;
- client/expert/Agent links;
- Orders и Transactions;
- Refunds;
- Support;
- Quality/incident route, если применимо;
- settings version/readback;
- action/audit log.

Настройки во время теста изменяются только по схеме baseline → one change → save/readback → scenario → rollback/readback.

## 15. Аналитика и уведомления

Основной бизнес-результат фиксируется до события аналитики и уведомления.

Проверяется:

- ключевое событие создаётся один раз;
- повтор доставки не меняет бизнес-состояние;
- событие содержит безопасные идентификаторы и версию, но не текст вопроса/чата;
- клиентское сообщение не обещает refund/compensation до фактического движения;
- необязательная аналитическая ошибка не отменяет уже корректно завершённую бизнес-операцию;
- критическая delivery-ошибка видна staff.

## 16. Ошибки и degraded dependencies

- Finance недоступен до paid start: минута не начинается.
- Debit committed, UI-response потерян: повтор возвращает исходный результат без второго debit.
- Notification provider недоступен: бизнес-состояние сохраняется, доставка retry/audit.
- Analytics недоступна: flow не откатывается, ошибка видна в monitoring.
- Support link временно недоступен: consultation не меняется; клиент получает безопасный retry.
- Admin readback расходится с ledger: case FAIL, pilot NO_GO.
- Вкладка/страница не загрузилась: нельзя подменить проверку прямым изменением данных.

## 17. Связанные задачи

G3.5 потребляет acceptance-контракты G1.1–G1.4, G2.1–G2.4, G3.1–G3.7, G4.1–G4.3, G5.1 и G6.1–G6.4/G6.7. В частности, pilot gate не проходит без V3 taxonomy/completeness input G3.6, eligibility/manual order G3.7 и актуального admission G6.4.

Она не заменяет focused acceptance каждой задачи. Сквозной PASS подтверждает интеграцию, но не снимает непроверенные task-specific cases.

## 18. Что не входит

- создание новой продуктовой логики;
- изменение owner decisions ради прохождения теста;
- тестирование рекламных кампаний;
- O5 public traffic baseline;
- legal approval текста;
- нагрузочное тестирование public scale;
- подмена server-side proof визуальным наличием кнопки;
- тесты с production-платежами или реальными персональными данными.

## 19. Критерии готового результата

1. Все cases выполняются на одной сборке.
2. Полный positive flow проходит.
3. Money/ACL/state/idempotency negative cases проходят.
4. Client, Expert, Agent, dialogue, request и session связаны.
5. Финансовые суммы согласованы.
6. Historical assignment/snapshots не переписываются.
7. Super-admin readback совпадает с пользовательским результатом.
8. Test changes rolled back либо документированы как намеренные fixtures.
9. Каждый FAIL имеет воспроизводимый handoff.
10. Нет открытого P0.
11. PM выдал явный `GO`.

## 20. Разделение результатов

### Перед тестом

Игорь возвращает:

- build marker и список включённых функций;
- карту entry points;
- применимые configuration versions;
- тестовые роли и fixture plan;
- список известных residuals;
- rollback/cleanup plan.

### После теста

Независимый QA/super-admin возвращает:

- единый evidence packet;
- case matrix с verdict;
- сверку client/session/ledger/admin;
- остаточные риски с disposition;
- ссылки на focused evidence каждой зависимой задачи.

Игорь возвращает для каждого defect ticket исправление, build marker и focused retest evidence. QA независимо перепроверяет FAIL. PM после этого выдаёт итоговый `GO/NO_GO`; ни Игорь, ни Codex не подменяют этот verdict.

## Основание продуктового решения

- `functional-tz-quality-standard.md`;
- `product-architecture-g1-g6-ownership-map.md`;
- `owner-decisions.md`;
- эталонные ТЗ G1/G2;
- G3.1–G3.7 product contracts;
- `SIX-GOALS-RUNTIME-ACCEPTANCE.md`.

## Служебные сведения о документе

Task: `G3.5` · Версия: `1.0` · Дата: `2026-07-29` · Приоритет: `P0`.

Фаза: `limited_paid_pilot_gate` · Парный технический контекст: `codex-context-g3-5-client-path-qa.md`.
