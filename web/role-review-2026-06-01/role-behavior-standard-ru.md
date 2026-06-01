# Внутренняя инструкция-эталон по ролям Confideline/PbExpert

Дата: 2026-06-01
Статус: теоретический эталон для разработки и QA
Назначение: заранее зафиксировать ожидаемое поведение каждой существующей роли, чтобы при практическом тестировании сравнивать факт с эталоном.

## 1. Как использовать документ

Этот документ не описывает, как роли сейчас фактически работают в live-админке. Он описывает, как они должны работать для безопасного платного текстового чата.

Для программиста:

1. Найти пользователя или сотрудника по реальной функции в проекте.
2. Выставить ему одну из существующих ролей, не создавая новую роль без отдельного решения.
3. Проверить, что role permissions и backend scope соответствуют этой инструкции.
4. Если существующий permission слишком широкий, добавить backend-фильтр или отдельное ограничение на уровне controller/service/query.

Для тестировщика:

1. Авторизоваться под ролью.
2. Пройти разрешенные действия.
3. Пройти запрещенные прямые URL.
4. Сравнить факт с ожидаемым поведением из этого документа.
5. Любое расхождение фиксировать как `PASS`, `FAIL`, `WARN` или `RETEST_AUTH_REQUIRED`.

Главное правило: меню не является доказательством безопасности. Проверять нужно прямые URL и backend-result.

## 2. Термины

`агент` - сотрудник/оператор проекта, который общается с клиентом от лица назначенных экспертных анкет.

`expert questionnaire` или `экспертная анкета` - профиль эксперта, от лица которого идет консультация.

`chief_under` - текущая техническая связь в админке: агент -> назначенная экспертная анкета.

`assigned expert` - экспертная анкета, назначенная агенту.

`unassigned expert` - экспертная анкета, не назначенная агенту.

`paid session` - оплаченный чат-разбор/консультация, привязанная к order, client, expert/advisor и transcript.

`transcript` - история консультации/переписки, используемая для клиента, поддержки, refund/evidence и QA.

Важно: продуктовый термин `partner` не используется. Если в старом коде, route или permission встречается `partner`, для ТЗ это legacy-техническое название зоны агентов.

## 3. Общие принципы

1. Минимально необходимый доступ: роль получает только то, что нужно для ее работы.
2. Разделение обязанностей: агент не видит финансы, финансы не читают личные консультации, поддержка не меняет платежный итог без финансовой роли.
3. Backend scope важнее меню: если URL открыт напрямую, backend обязан проверить роль и конкретный объект доступа.
4. Любое чувствительное действие логируется: кто, роль, действие, объект, время, результат.
5. Любой доступ к transcript должен иметь причину: assigned session, support/refund case, QA/safety escalation или super-admin investigation.
6. Raw PHP, env, plugins, license, payment secrets - зона `super-admin`, не операционных ролей.
7. Если роль не должна менять настройки, она не должна иметь update/delete/create для settings/roles/admins.

## 4. Эталонные backend-правила

Для paid chat нужны не только permissions, но и объектные проверки.

Обязательные проверки:

```text
canViewAdminArea(userRole, route)
canViewUser(actor, targetUserId)
canViewExpert(actor, expertUserId)
canSendAsExpert(agentId, expertUserId)
canViewConversation(actor, conversationId)
canViewPaidSession(actor, paidSessionId)
canViewTranscript(actor, transcriptId, reason)
canManageAssignment(actorRole, agentId, expertUserId)
canChangePaymentStatus(actorRole, orderId)
canViewPaymentEvidence(actorRole, orderId)
canEditContent(actorRole, pageType)
canUseRawPhpEditor(actorRole)
canViewAuditLog(actorRole, targetType, targetId)
```

Минимальная логика:

```text
agent может видеть expert/session/conversation только если они назначены ему через chief_under или paid_session assignment.
agent не может расширить scope через query params: userId, agentId, partnerId, expertId.
support видит transcript только внутри support/refund case и это логируется.
payment-moderator видит payment/refund evidence, но не provider secrets и не весь raw transcript.
user-moderator видит moderation/safety context, но не финансы и не все консультации.
content-moder не получает raw PHP editor без отдельной защиты.
```

## 5. Кому какую роль выставлять

| Роль | Кому выставлять | Когда использовать | Когда не использовать |
|---|---|---|---|
| `super-admin` | Технический владелец, главный администратор системы | Настройка ролей, платежных ключей, env/license/plugins, аварийное восстановление | Для ежедневной поддержки, модерации, агентов, контента |
| `admin` | Операционный руководитель продукта | Контроль общей картины, users/orders/support/moderation overview | Если человеку нужны только деньги, только support или только контент |
| `agent` | Агент проекта, который ведет консультации от назначенных экспертов | Ответы клиентам от assigned expert questionnaires | Для управления всеми агентами, платежами, поддержкой, контентом |
| `agent-moder` | Старший оператор/диспетчер назначений | Назначить/снять экспертные анкеты с агентов, контролировать scope | Для чтения всех чатов или решения refund |
| `balance` | Финансовый учет/бухгалтерская сверка | Балансы, транзакции, выплаты, финансовые отчеты | Для чтения переписок и управления консультациями |
| `payment-moderator` | Платежный модератор/refund reviewer | Статусы оплат, refund review, payment evidence | Для доступа к payment secrets или всей переписке |
| `support` | Первая линия поддержки | Тикеты, клиентские обращения, базовый статус заказа/сессии | Для финального refund decision и чтения всех чатов |
| `support-moder` | Старшая поддержка/эскалация | Спорные support/refund кейсы, evidence bundle, escalation | Для самостоятельного изменения платежного результата без finance |
| `content-moder` | Контент-менеджер | News/help/info blocks, безопасный public copy | Для raw PHP страниц, платежей, чатов, ролей |
| `user-moderator` | Модератор пользователей | Жалобы, баны, фото, верификации, safety flags | Для платежей, балансов, глобальных чатов и ролей |

## 6. Эталон по ролям

### 6.1. `super-admin`

Смысл роли: полный системный владелец.

Должен видеть: все разделы админки; роли и администраторов; settings всех типов; payment/provider secrets; env/license/plugins/developer pages; raw PHP/page editor; logs/audit/queue/cache/websocket; все users, agents, chats, orders, support, moderation.

Должен уметь: создавать/изменять роли; создавать/изменять admin accounts; менять payment/settings/license/env/plugin config; выполнять аварийные действия и расследование.

Не должен использоваться: для обычной ежедневной работы оператора; для сотрудника, которому нужен один узкий участок.

Ожидаемый тестовый результат: прямые URL открываются; sensitive actions логируются; доступ есть ко всем проверяемым surfaces.

### 6.2. `admin`

Смысл роли: операционное управление без системного root-доступа.

Должен видеть: dashboard; общий обзор пользователей/экспертов; общий обзор заказов и support; moderation overview; read-only audit/logs, если нужно для расследований.

Должен уметь: помогать операционно разбирать кейсы; видеть агрегированную картину работы сервиса; эскалировать в finance/support/moderation/super-admin.

Должно быть закрыто: изменение ролей; создание admin accounts; payment secrets; env/license/plugins; raw PHP page editing; destructive logs/cache/dev actions без отдельного разрешения.

Ожидаемый тестовый результат: операционные страницы открываются; `/admin/settings/role`, `/admin/admin/create`, `/admin/role/create`, `/admin/settings/payment` с secret edit, `/admin/settings/env-php`, `/admin/plugin/index` закрыты или read-only по безопасной модели.

### 6.3. `agent`

Смысл роли: агент общается с клиентами от лица назначенных экспертных анкет.

Должен видеть: свой agent workspace; assigned paid sessions; assigned expert questionnaires; сообщения/чаты только по assigned sessions; шаблоны, заметки, перевод, policy hints только внутри assigned session; свой `chief_under` view.

Должен уметь: открыть назначенную экспертную анкету; ответить клиенту в assigned paid session; использовать разрешенные templates/notes/translation; видеть SLA по своим assigned sessions; завершить или передать кейс по правилам workflow, если это предусмотрено.

Должно быть закрыто: unassigned expert questionnaires; чужой `chief_under`; global users list; global messages/chat; orders/payments/balances; support/refund decision; settings/roles/pages/logs/plugins/env/license; изменение назначений.

Эталонная проверка на Kristy:

| Объект | Ожидание |
|---|---|
| Kristy `userId=12` | агент видит только свой scope |
| assigned expert `103` Solara Ortiz | доступ разрешен |
| assigned expert `104` Stella Bērziņa | доступ разрешен |
| assigned expert `105` Talia Munkrest | доступ разрешен |
| unassigned expert `184` Orion Esposito | доступ запрещен |
| чужой `chief_under` | доступ запрещен или принудительно own scope |

Ожидаемый тестовый результат: assigned открывается; unassigned закрыт; попытка подставить чужой `userId`, `partnerId`, `agentId`, `expertId` не расширяет доступ; chat/messages показывают только assigned paid sessions; запрет settings/payment/logs/pages подтвержден прямыми URL.

### 6.4. `agent-moder`

Смысл роли: управляет назначениями агент -> экспертные анкеты.

Должен видеть: список агентов; список экспертных анкет, доступных для назначения; текущие `chief_under` assignments; audit trail по изменениям назначений.

Должен уметь: назначить экспертную анкету агенту; снять назначение; проверить текущий scope агента; исправить ошибочное назначение.

Должно быть закрыто: чтение всех чатов; global message workspace; платежи и балансы; support/refund decision; settings/roles/payment/env/plugins/raw PHP.

Ожидаемый тестовый результат: assignment CRUD работает; изменение назначения логируется; global chat/payment/settings прямые URL закрыты.

### 6.5. `balance`

Смысл роли: финансовый учет и сверка.

Должен видеть: balance transactions; user/agent balance summary; order finance summary, если нужно для сверки; payout/audit reports без текста консультаций.

Должен уметь: сверить начисления; проверить финансовый статус; подготовить payout/export, если это предусмотрено; передать спорный платеж в `payment-moderator` или `support-moder`.

Должно быть закрыто: chat/messages/transcript text; support text вне финансового статуса; role/settings/pages/plugins/env; agent assignment mutation; user moderation actions.

Ожидаемый тестовый результат: finance pages открываются; chat/messages/transcripts закрыты; settings/roles закрыты.

### 6.6. `payment-moderator`

Смысл роли: платежные статусы, refund review и payment evidence.

Должен видеть: orders; payment/refund status; balance transaction references; receipt/webhook/evidence status; support/refund case summary.

Должен уметь: проверить оплату; изменить payment/refund status в разрешенных пределах; прикрепить или проверить evidence; передать спор в support/legal/super-admin.

Должно быть закрыто: provider secret keys; payment system credentials; raw transcript без конкретного refund/support основания; global chat; agent assignments; roles/admins/env/plugins/license.

Ожидаемый тестовый результат: order/payment/refund surfaces доступны; provider secrets недоступны; transcript доступен только как case-bound evidence и логируется; settings/role/env/plugins закрыты.

### 6.7. `support`

Смысл роли: первая линия клиентской поддержки.

Должен видеть: support tickets; limited user lookup; order/session status summary; минимальный context по обращению; customer-visible status support case.

Должен уметь: создать/обновить support case; запросить дополнительную информацию; эскалировать в `support-moder`, `payment-moderator`, `user-moderator` или `super-admin`; видеть ссылку на evidence bundle только при наличии support/refund case.

Должно быть закрыто: full global chat/messages; payment mutation; balance mutation; role/settings/pages/plugins/env; agent assignments.

Ожидаемый тестовый результат: support queue открыта; пользовательский статус/заказ виден в ограниченном объеме; глобальный чат без case закрыт; payment mutation закрыта.

### 6.8. `support-moder`

Смысл роли: старшая поддержка и эскалация сложных кейсов.

Должен видеть: support queue; escalation cases; order/session/transcript evidence bundle по конкретному кейсу; internal support notes; audit trail support actions.

Должен уметь: назначить/эскалировать кейс; запросить refund review; зафиксировать внутреннее решение поддержки; закрыть support case, если финансовое решение не требуется.

Должно быть закрыто: финальное payment/refund mutation без финансовой роли; roles/settings/env/plugins/license; agent assignments; global transcript outside support/refund case.

Ожидаемый тестовый результат: escalation работает; support evidence доступен только по кейсу; payment final decision закрыт, если роль не имеет отдельного finance permission.

### 6.9. `content-moder`

Смысл роли: управление безопасным публичным контентом.

Должен видеть: news; help; info blocks; безопасные content/language copy surfaces; legal/support/public copy, если это предусмотрено workflow.

Должен уметь: создавать/редактировать безопасный контент; отправлять спорный legal/payment copy на review; обновлять help/news/info blocks.

Должно быть закрыто: raw PHP page editor без sanitization/review; chats/messages/transcripts; orders/payments/balances; roles/admins/settings secrets/plugins/env/license; user moderation destructive actions.

Ожидаемый тестовый результат: safe content открывается; raw PHP edit закрыт или требует super-admin/review; chat/payment/roles закрыты.

### 6.10. `user-moderator`

Смысл роли: модерация пользователей и safety-сигналов.

Должен видеть: users moderation fields; reports; bans; photos; verifications; safety flags по конкретному кейсу.

Должен уметь: обработать жалобу; забанить/разбанить пользователя по правилам; проверить фото/верификацию; поставить safety flag; эскалировать transcript review в `support-moder` или QA/safety queue.

Должно быть закрыто: orders/payments/balances; global raw transcript без safety case; settings/roles/pages/plugins/env/license; agent assignments; payment/refund final decision.

Ожидаемый тестовый результат: reports/bans/photos/verifications доступны; orders/payment/settings/roles закрыты; transcript виден только при safety escalation и логируется.

## 7. Эталонная матрица тестирования

| Роль | Обязательные allow-тесты | Обязательные deny-тесты |
|---|---|---|
| `super-admin` | все baseline URL | нет прикладных deny, только audit |
| `admin` | dashboard, overview users/orders/support/moderation | roles mutation, payment secrets, env/plugins/raw PHP |
| `agent` | assigned experts, assigned sessions, own chat workspace | unassigned expert, чужой `chief_under`, global chat, payments, settings, logs |
| `agent-moder` | assignment CRUD, agents/experts assignment view | global chat, payments, roles/settings |
| `balance` | transactions, balances, finance order summary | chat/transcript, roles/settings, assignments |
| `payment-moderator` | order/payment/refund status | provider secrets, global transcript, roles/env |
| `support` | support queue, limited user/order/session summary | payment mutation, global chat, roles/settings |
| `support-moder` | escalation queue, case evidence bundle | final payment mutation without finance, global transcript outside case |
| `content-moder` | news/help/info blocks | raw PHP editor, chat, payments, roles/settings |
| `user-moderator` | reports/bans/photos/verifications | payments/orders, global transcript, roles/settings |

## 8. Формат результата тестирования

Для каждой роли тестировщик должен вернуть таблицу:

| Проверка | Ожидание по эталону | Факт | Статус | Evidence |
|---|---|---|---|---|
| direct URL или действие | ALLOW/DENY/CASE_BOUND | что произошло | PASS/FAIL/WARN/RETEST_AUTH_REQUIRED | screenshot/report/log |

Статусы:

- `PASS` - факт совпал с эталоном.
- `FAIL` - доступ шире или уже эталона и это влияет на роль.
- `WARN` - доступ технически работает, но требует уточнения продукта или backend scope.
- `RETEST_AUTH_REQUIRED` - не было валидной role session или test fixture.

## 9. Что считать дефектом

Критический дефект:

- `agent` видит unassigned expert/chat/session.
- `agent` открывает settings/roles/payment/logs/pages.
- `support` или `payment-moderator` видит global transcript без кейса.
- `balance` видит chat/transcript.
- `content-moder` может редактировать raw PHP pages без защиты.
- любая не-super-admin роль меняет roles/admin accounts/payment secrets/env/plugins/license.

Высокий дефект:

- отсутствует audit log для sensitive action;
- роль не может выполнить свою основную работу;
- прямой URL обходит меню и открывает запрещенный раздел;
- query params расширяют scope роли.

Средний дефект:

- UI скрывает нужную функцию, но direct URL/backend работает корректно;
- недостаточно понятное сообщение об отказе доступа;
- роль видит лишний metadata-context без текста/денег, но это не раскрывает sensitive data.

## 10. Минимальный критерий готовности роли

Роль считается готовой только если:

1. Есть валидная тестовая учетная запись с этой ролью.
2. Выполнены allow-тесты.
3. Выполнены deny-тесты прямыми URL.
4. Проверен row-level scope там, где есть чужие/свои объекты.
5. Sensitive actions логируются.
6. Есть отчет с evidence.
7. Нет критических FAIL.

Если хотя бы один пункт не выполнен, роль нельзя считать готовой для платного чата.

