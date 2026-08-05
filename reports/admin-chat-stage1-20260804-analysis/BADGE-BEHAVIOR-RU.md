# Admin Agent Chat — описание работы бейджей

Источник: `CHAT_QUEUE_CONTRACT.md`, `agent_chat_custom.js`, `chat-stage1.html` и `verify_badge_contract.ps1` из `admin-chat-stage1-20260804-handoff.rar`.
Бейджи — это серверные операционные сигналы для очереди Chats/Pings и активного диалога. Браузер не вычисляет их смысл по тексту или по видимой подписи.

## 1. Канонический словарь

В MVP есть 19 кодов: 10 для `Chats`, 9 для `Pings`; для `Rejects` утверждённых бейджей нет.

| Подпись | Stable `badge_code` | Сценарий | Роль | Смысл для оператора | Где разрешён | Приоритет |
|---|---|---|---|---|---|---:|
| Sell | `chats_sell` | Chats | action | Доступно действие продажного/paid-предложения; точную eligibility определяет сервер | Left, Center | 60 |
| Live | `chats_live` | Chats | state | Пара активна в live paid-состоянии | Left, Center, Right | 10 |
| PP | `chats_payment_process` | Chats | state | Платёжный процесс находится в работе | Left, Center, Right | 20 |
| Paid | `chats_paid` | Chats | context | У диалога есть paid-контекст/история оплаты | Left, Center, Right | 30 |
| Trial | `chats_trial` | Chats | context | Действует trial-контекст | Left, Center, Right | 70 |
| Skeptic | `chats_skeptic` | Chats | action | Серверный caution/action-сигнал по клиенту или диалогу | Left, Center, Right | 50 |
| Revive | `chats_revive` | Chats | context | Контекст возврата клиента или пополнения | Left, Center, Right | 80 |
| Risk | `chats_risk` | Chats | constraint | Ограничение/риск, требующий внимания | Left, Center, Right | 40 |
| Safe | `chats_safe` | Chats | constraint | Риск снят для конкретной пары client + expert | Left, Center, Right | 35 |
| Coupon | `chats_coupon` | Chats | context | Есть открытый compensation request | Left, Center, Right | 90 |
| Fire | `pings_fire` | Pings | signal | Самый сильный freshness-сигнал Ping | Left, Center | 10 |
| Hot | `pings_hot` | Pings | signal | Средний freshness-сигнал Ping | Left, Center | 20 |
| NEW | `pings_new` | Pings | signal | Новый Ping без более сильного Fire/Hot | Left, Center | 40 |
| Paid | `pings_paid` | Pings | context | Paid-контекст Ping | Left, Center, Right | 30 |
| Reply | `pings_reply` | Pings | action | Действие требуется от Эксперта/Агента | Left, Center | 45 |
| Await | `pings_await` | Pings | state | Ответ ожидается от клиента | Left, Center | 50 |
| Revive | `pings_revive` | Pings | context | Контекст возврата клиента или пополнения | Left, Center, Right | 60 |
| Trial | `pings_trial` | Pings | context | Trial-контекст Ping | Left, Center, Right | 70 |
| Risk | `pings_risk` | Pings | constraint | Риск/ограничение Ping | Left, Center, Right | 55 |

Одинаковые подписи `Paid`, `Trial`, `Revive`, `Risk` в Chats и Pings — разные stable-коды и разные scenario-фильтры.

## 2. Правила разрешения конфликтов

Backend сначала разрешает взаимозаменяемые сигналы, затем UI сортирует результат:

1. `Fire > Hot > NEW`: остаётся только самый сильный freshness-сигнал Pings.
2. `Reply XOR Await`: одновременно они не выдаются.
3. `Live`, `PP`, `Skeptic` или `Risk` скрывают `Sell`. После снятия блокирующего состояния `Sell` может вернуться.
4. `PP` заменяет `Sell` на период платёжного процесса. Срок приходит от сервера через `expires_at`; frontend не ведёт собственный timer. В контракте указано provisional-значение 60 минут, но оно не должно быть hardcoded.
5. `Paid` и `Revive` совместимы: Paid отражает историю оплаты, Revive — текущий контекст возврата/пополнения.
6. `Safe` заменяет `Risk` только в Chats и только для пары `client_user_id + expert_id`. В Pings показывается только `Risk`; после перехода в Chats применяется правило `Risk/Safe`.
7. `Coupon` появляется только при `coupon_request.open=true`; само наличие доступного купона его не включает. Исчезает после разрешения или исполнения запроса модератором.

## 3. Порядок и размещение

После разрешения бейджи сортируются по роли:

1. `action`;
2. `constraint`;
3. `state` / `signal`;
4. `context`.

Внутри одной роли меньшее числовое значение `priority` означает более сильную позицию. Это влияет на порядок, но не на видимый текст.

| Область | DOM-поверхность |
|---|---|
| Left | `.conv-line-labels` в карточке очереди |
| Center | `.contact-subline.dialog-meta .dialog-meta-labels` |
| Right | карточка контекста, преимущественно `context-profile-card context-profile-compact` |

Все разрешённые бейджи должны быть возвращены и отрисованы. Нельзя скрывать их только потому, что в карточке уже отображаются два или три. Допустимы перенос строки и компактная верстка.

`Favorite` не является бейджем: это отдельные `data-is-favorite="true"`, `.is-favorite-conversation` и star icon.

Для кодов, разрешённых одновременно в Left и Center, данные очереди и активного диалога должны совпадать. Chats-бейджи нельзя показывать на Pings-карточках и наоборот без отдельного изменения product contract.

## 4. Фильтры

В меню быстрых фильтров используются только эти 19 stable-кодов. Legacy-фильтры `Unread`, `Overdue`, `Has notes`, `Attachments` не добавлять.

Есть пять независимых зон фильтрации:

- `quick_preset` — Chats/Pings/Rejects;
- `search` — текстовый поиск;
- `user_select`;
- `expert_select`;
- `quick_filters` — выбранные бейджи.

Зоны не складываются: применение одной очищает остальные четыре. Checkbox быстрых фильтров сначала меняет локальное staged-состояние; запрос уходит только после `Apply`. `Reset` возвращает `active_filter_zone="none"`.

В payload передаются stable `badge_code` и scenario. Backend не должен определять смысл по локализованной подписи.

## 5. Цвета и локализация

Semantic tone — только presentation layer:

- `action`: Sell, Reply;
- `positive`: Live, Safe;
- `money`: PP, Paid, Coupon;
- `signal`: Fire, Hot, NEW;
- `warning`: Risk, Skeptic;
- `muted`: Await, Revive, Trial.

Смысловые цвета включаются классом `.has-semantic-badge-tones` на `#admin-agent-chat`; его удаление возвращает нейтральную палитру без изменения payload.

Stable-коды не переводятся и не меняются. Видимые подписи должны идти через существующую translation subsystem для RU/EN и других активных локалей.

## 6. Приёмка

- verifier подтверждает синхронность 19 JS definitions, 19 HTML filter options и 19 contract rows;
- каждый элемент имеет `data-badge-code`;
- scenario, label, zones и tone совпадают между JS/HTML/MD;
- duplicate/conflicting signals разрешаются сервером до сортировки;
- wrong-scenario badges не попадают в очередь;
- фильтр использует stable code, а не label;
- поздний ответ старого conversation не меняет текущие бейджи;
- отсутствие или ошибка badge payload сохраняет предыдущую очередь и показывает безопасную ошибку.
