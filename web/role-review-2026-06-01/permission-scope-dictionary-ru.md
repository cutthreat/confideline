# Справочник permission keys и scope-надстроек Confideline/PbExpert

Дата: 2026-06-01
Назначение: объяснить, какие значения уже существуют в live-форме ролей, а какие являются обязательными backend-ограничениями для платного чата.

## 1. Типы значений

| Тип | Что значит | Где реализуется |
|---|---|---|
| Существующий permission key | Значение уже есть в live-форме `/admin/settings/role` | Role permissions в админке |
| Backend scope rule | Значения нет как чекбокса, но это обязательная серверная проверка объекта доступа | Controller/service/query/policy |
| Proposed granular key | Значения нет в текущей форме, но его можно добавить как отдельный permission, если команда решит дробить крупные права | Permission model + role UI + backend guard |

## 2. Ключевые значения для роли `agent`

| Значение | Статус | Что означает | Риск без backend scope | Что должен сделать программист |
|---|---|---|---|---|
| `users-agent` | Есть в live permissions | Техническое право агентского пользовательского контура. По смыслу должно открывать агентские/экспертные записи, но не всю базу пользователей | Может быть шире, чем нужно, если backend не фильтрует назначенные анкеты | Проверить реальные controller checks и ограничить доступ assigned expert ids |
| `chief_under-view` | Есть в live permissions | Просмотр связки агент -> назначенные экспертные анкеты | Само по себе не доказывает, что агент не увидит чужие назначения через прямой URL | Проверять `userId` по текущей сессии агента; чужой `chief_under` закрывать или принудительно заменять на own scope |
| `messages-all` | Есть в live permissions | Крупное право на раздел сообщений | Критический риск: агент может получить глобальные сообщения/переписки | Не использовать как самостоятельное разрешение для агента; добавить фильтр по assigned paid sessions |
| `chat-all` | Есть в live permissions | Крупное право на chat workspace | Критический риск: агент может открыть чужие чаты | Не использовать как самостоятельное разрешение для агента; все chat queries резать по assigned expert/session |
| `scoped chat assigned` | Нет в live permissions; это backend scope rule | Агент видит только чаты, назначенные ему через экспертную анкету или paid session assignment | Без этого `messages-all`/`chat-all` слишком широкие | Реализовать `canViewConversation(agentId, conversationId)` |
| `backend-scope` | Нет в live permissions; это архитектурное правило | Любой доступ проверяется не только по роли, но и по конкретному объекту: expert, session, conversation, transcript, order | Меню может скрыть раздел, но прямой URL обойдет UI | Реализовать guards в controller/service/query и direct-url tests |

## 3. Как читать suffix permissions

| Suffix | Общий смысл | Важное ограничение |
|---|---|---|
| `-all` | Обычно полный доступ к модулю | Для paid chat опасно без row-level scope |
| `-view` | Просмотр | Должен быть ограничен объектом доступа, если есть чужие/свои записи |
| `-update` | Изменение | Требует audit log и проверки, какие поля можно менять |
| `-delete` | Удаление | Для операционных ролей должно быть закрыто или сильно ограничено |
| `-balance` | Балансовые поля/операции | Не дает права читать transcript |
| `users-agent` | Специальный agent-related key | Не заменяет проверку assigned expert ids |

## 4. Существующие группы permission keys

Эти группы найдены в live role form:

```text
partners-*
users-*
groups-*
messages-*
chat-all
photos-*
orders-*
balance_transaction-*
pages-*
help-*
news-*
languages-*
reports-*
verifications-*
gifts-*
bans-*
chief_under-*
support-*
info_block-*
```

## 5. Значения, которых нет в live permissions, но они нужны как требования

| Требование | Статус | Как реализовать |
|---|---|---|
| `chat.queue.assigned` | Нет | Backend guard или новый granular permission |
| `chat.message.send.assigned` | Нет | Backend guard `canSendAsExpert(agentId, expertUserId)` |
| `chat.transcript.read.assigned` | Нет | Backend guard по assigned paid session |
| `support.case.read` | Нет | Case-bound support guard |
| `refund.workflow` | Нет | Workflow permission + audit |
| `content.pages.safe` | Нет | Разделить safe content и raw PHP pages |

## 6. Правило для ТЗ

В ТЗ нельзя писать `scoped chat assigned` как будто это существующий permission key.

Корректная формулировка:

```text
Выдать существующие keys: users-agent, chief_under-view.
messages-all/chat-all разрешать роли agent только при обязательном backend scope.
Backend scope должен ограничивать chat/messages/conversation/transcript assigned expert/session.
Если команда хочет видеть это в UI ролей, добавить новые granular permissions.
```

## 7. Что проверять QA

| Проверка | Ожидание |
|---|---|
| `agent` открывает assigned expert `103/104/105` | ALLOW |
| `agent` открывает unassigned expert `184` | DENY |
| `agent` открывает чужой `chief_under` | DENY или forced own scope |
| `agent` открывает `/admin/message/chat` | ALLOW только assigned conversations |
| `agent` открывает `/admin/settings/role` | DENY |
| `agent` открывает `/admin/settings/payment` | DENY |
| `agent` открывает `/admin/log/index` | DENY |
