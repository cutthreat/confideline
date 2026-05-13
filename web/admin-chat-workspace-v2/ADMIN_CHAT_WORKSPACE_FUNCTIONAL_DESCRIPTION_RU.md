# Admin Chat Workspace V2: описание функционала для продуктового разбора

Дата: 2026-05-13
Область: `web/admin-chat-workspace-v2/`
Назначение документа: дать коллеге полный перечень элементов текущей версии страницы чата, чтобы решить, что оставляем в продукте, что упрощаем, что переносим в поздние этапы.

## 1. Главная логика экрана

Экран должен помогать эксперту выбрать следующий объект работы и правильно вести клиента по воронке:

`free reading -> intrigue -> Book Now -> objection/payment -> paid session -> extension/reactivation`

Финальный принцип макета: на первом экране остаются только элементы, которые отвечают на один из четырех рабочих вопросов эксперта: кому отвечать сейчас, на какой стадии клиент, есть ли оплаченная обязанность, какое действие допустимо следующим. Все декоративные, спорные и неподтвержденные показатели убираются из дефолтного UI.

При этом в интерфейсе есть три независимых слоя:

| Слой | Что это | Где видно | Нельзя смешивать с |
|---|---|---|---|
| Workload | Тип рабочей очереди: `Chats` или `Pings` | Левая колонка | Stage, потому что stage описывает состояние конкретного клиента |
| Stage | Бизнес-стадия диалога/лида | Badge в очереди, header, Workflow block, composer hint | Composer mode |
| Composer mode | Как отправляется сообщение: `direct`, `reply`, `edit` | Composer | Stage и фильтры очереди |

Практический смысл: `Chats/Pings` отвечают на вопрос "что открыть", `stage` отвечает "как вести кейс", `composer mode` отвечает "как технически отправить сообщение".

## 2. Источники индикаторов и флагов

Все индикаторы должны иметь источник. Это важно для прав доступа, доверия к сигналу и UX.

| Источник | Кто/что ставит | Видимость | Примеры | Правило |
|---|---|---|---|---|
| System/site | Сайт, backend, платежи, аналитика, SLA, workflow engine | Видят эксперт, поддержка, модератор по роли | `Reply`, `SLA`, `Live`, `PP`, `Fire`, `Hot`, `NEW`, `Paid`, `Paid Live`, `Future Paid`, `Safety` | Нельзя скрывать от эксперта, если сигнал влияет на действие сейчас |
| Moderator/supervisor | Модератор, старший смены, QA, support | Видят роли, которым нужен контроль; часть сигналов может влиять на маршрутизацию | `Quality watch`, `Do not push`, `Needs handoff`, `Complaint risk`, `Retention risk`, `Hot client` | Должно быть понятно, это рекомендация или routing-impact |
| Expert-private | Сам эксперт/оператор | По умолчанию видит только этот эксперт; команда видит только если продуктово решено расшарить | `Favorite`, личный `Pin`, личный `Follow-up`, личная заметка/черновой маркер | Не использовать как глобальную правду и не маршрутизировать других экспертов по личному флагу |

Рекомендация: в данных флага хранить `source`, `visibility`, `owner_id`, `created_by`, `expires_at`, `routing_impact`.

## 3. Левая колонка: назначение

Левая колонка отвечает только за выбор следующего объекта работы. В ней не должно быть длинной аналитики, полных заметок, истории оплат или внутренних объяснений.

Оставляем в карточке:

- кто клиент и какой экспертный профиль он видит;
- короткий preview последнего события;
- время последней активности;
- action/unread counter;
- 1 stage badge;
- до 3-4 рабочих индикаторов.

Не оставляем в карточке:

- внутреннее имя оператора;
- длинные notes;
- полную историю платежей;
- все safety/legal правила;
- технические поля, которые не помогают выбрать следующий кейс.

## 4. Workload modes

| Элемент | Источник | Когда появляется | Что делает | Зачем нужен | Решение на запуск |
|---|---|---|---|---|---|
| `Chats` | System | Всегда | Показывает реальные созданные диалоги | Основная очередь ответов, оплат и paid sessions | Оставить |
| `Pings` | System | Всегда, если включен lead workflow | Показывает лиды до начала полноценного чата | Дает эксперту теплую очередь, когда нет срочных chats | Оставить, если бизнес хочет proactive outreach |

`Pings` не являются обычными чатами. У них нет reply SLA до ответа клиента или старта чата.

Сортировка Pings по умолчанию: `Fire = 0`, `Hot = 10`, `NEW = 30`, `NeedR/WaitR = 40`, старый сигнал без freshness = `70`. Меньше число означает выше в очереди. `Fire` заменяет `Hot`, потому что это не просто свежесть, а сильный интерес к конкретному эксперту.

## 5. Поиск и зоны фильтрации

Текущая логика: есть 4 независимые зоны. Активируется одна зона, остальные сбрасываются.

| Зона | Элемент | Что делает | Почему не суммируем все сразу |
|---|---|---|---|
| Workload preset | `Chats`, `Pings` | Переключает тип очереди | Это базовая рабочая область |
| Search | `#conversationsSearch` | Ищет по имени, id, preview, stage, chip | Быстрый поиск конкретного клиента |
| Expert/user select | `#queueUserSelect` | Отбирает по client/expert id | Нужен для ручного поиска по участнику |
| Quick filters | Кнопка `Filters` | Multi-select внутри одной зоны | Это рабочий отбор по KPI/сигналам |

Решение: текущую независимость зон оставить. Если сделать все фильтры кумулятивными, эксперт легко получит пустой список и не поймет почему.

## 6. Полный перечень quick filters

### Chats filters

| Фильтр | Источник | Когда карточка попадает | Что показывает | Зачем нужен | Оставляем? |
|---|---|---|---|---|---|
| `Reply` | System | Последнее значимое сообщение от клиента, ответа эксперта еще нет | Клиент ждет ответа | Главный рабочий фильтр для обычной смены | Да |
| `SLA` | System | Время ожидания ответа превысило порог | Риск просрочки | Снижает потерю клиента/жалобы | Да |
| `Live` | System/payment/session | Есть активная paid session | Платный приоритет | Эксперт не должен пропустить оплаченный кейс | Да |
| `PP` | System/payment | Payment flow открыт, но оплата не завершена | Payment pending | Позволяет довести клиента до платежа | Да |
| `Sell` | System/workflow или expert action | Есть открытый момент продажи/продления | Нужно готовить offer | Не упустить коммерческий момент | Да, но без давления |
| `Favorite` | Expert-private | Эксперт пометил карточку | Личная важная карточка | Быстрый возврат эксперта к своим кейсам | Да, только private |
| `Archive` | System или expert action | Карточка убрана из рабочей очереди | Неактивный/закрытый кейс | Проверка обработанных кейсов | Да, но не как обычный вид |

### Pings filters

| Фильтр | Источник | Когда карточка попадает | Что показывает | Зачем нужен | Оставляем? |
|---|---|---|---|---|---|
| `Fire` | System/analytics | Сильный интерес к конкретному эксперту: повторные просмотры профиля, favorite/expert interest, возврат к теме, chat/payment path | Супер-горячий expert-specific interest | Поднять лид выше Hot; при Fire Hot не показываем | Да |
| `Hot` | System | 0-4 часа после значимого ping-сигнала, если Ping не закрыт, не перешел в Chat и нет Fire | Горячий интерес | Быстро обработать актуальный лид без дубля Fire | Да |
| `NEW` | System | 4-24 часа после значимого ping-сигнала, если Ping не закрыт и не перешел в Chat | Новый, но уже не горячий интерес | Держать лид в работе до конца первых суток | Да |
| `Paid` | System/payment | У клиента есть credits, баланс или другой paid-сигнал | Готовность к paid start | Выше шанс конверсии | Да |
| `Favorite` | Expert-private | Эксперт сохранил ping | Личный перспективный лид | Вернуться позже | Да, private |

Не добавлять на запуск как quick filters:

- `Has notes` - деталь правой панели, не приоритет.
- `Attachments` - технический признак, не бизнес-приоритет.
- `Mine` - лишнее для expert workspace: все видимые элементы уже назначены текущему workspace.
- `Expert online` - только если routing реально зависит от online конкретного экспертного профиля.

## 7. Индикаторы карточки очереди

| Индикатор | Источник | Где видно | Когда появляется | Что делает/зачем | Видимость |
|---|---|---|---|---|---|
| Client -> Expert | System | Верх карточки | Всегда | Показывает, с кем общается клиент и какой экспертный профиль он видит | Общая |
| Online dot/name state | System | Имя клиента | Клиент online | Помогает выбрать активного клиента | Общая |
| Last activity | System | Справа сверху | Всегда | Оценка свежести события | Общая |
| Preview | System | Центр карточки | Всегда | Коротко объясняет текущий контекст | Общая |
| Unread count | System | Справа | Есть непрочитанные или action count | Показывает объем входящих/внимания | Общая |
| Red/fresh unread | System | Справа | Новый недавний входящий | Быстро выделяет свежую работу | Общая |
| Pin | Expert-private или team, зависит от решения | Карточка/действия | Пользователь закрепил | Быстрый возврат | Private по умолчанию |
| Favorite | Expert-private | Звезда | Эксперт отметил | Личная очередь важного | Только владелец |
| Stage badge | System/workflow | Перед KPI chips | Есть `conversation.stage` | Подсказывает, как вести кейс | Общая |
| KPI chips | System/moderator/expert по типу | Низ карточки | Есть активный сигнал | Помогают выбрать следующий кейс | По источнику |

Правило перегруза: в карточке не больше 3-4 visible chips плюс stage badge. Остальное уходит в right panel.

## 8. Stage badges

| Badge | Stage | Источник | Когда появляется | Что значит | Что должен делать эксперт |
|---|---|---|---|---|---|
| `Free read` | `free_reading` | System/workflow | Идет бесплатный вводный ответ | Можно дать ограниченную ценность | Не закрывать весь платный вопрос |
| `Book soon` | `intrigue_ready` | System/workflow | Дано достаточно контекста для перехода | Пора делать конкретную интригу и Book Now | Уточнить минимум и вести к Book Now |
| `Book Now` | `book_now_sent` | System/workflow | Book Now уже отправлен | Бизнес-переход сделан | Не раскрывать новую paid value бесплатно |
| `Objection` | `post_book_now_objection` | System/AI/manual confirmation | Клиент не оплатил и тянет/возражает | Нужно обработать objection | Ответить на objection и вернуть к Book Now |
| `Future Paid` | `paid_session_booked_future` | System/payment | Будущая сессия оплачена/забронирована | Контент будущей сессии закрыт | Подтвердить время, не выдавать content заранее |
| `Paid Live` | `paid_session_active` | System/payment/session | Идет paid session | Платный delivery contract | Закрывать promised topics, не молчать |
| `Extend` | `extension_offer` | System/workflow | Появилась новая тема, не входящая в текущую оплату | Нужен extension/next session | Не смешивать бесплатно с текущей оплатой |
| `Lift Due` | `reactivation_due` | System/workflow | Пора reactivation/lift | Возврат buyer/strong-intent клиента | Reason for return -> intrigue -> Book Now |
| `Lift` | `reactivation_active` | System/workflow | Reactivation уже начат | Нельзя бесконечно плодить интриги | Доводить до Book Now или stop/follow-up |
| `Safety` | `safety_escalation` | System/moderator | Есть safety/self-harm/legal risk | Продажа не главный путь | Использовать safety/support route |

## 9. System/site indicators

| Индикатор | Когда появляется | Что делает | Почему нужен |
|---|---|---|---|
| `Reply` | Клиент ждет ответа | Поднимает карточку в рабочей очереди | Базовая обязанность эксперта |
| `SLA` | Ответ задержан сверх нормы | Повышает срочность | Снижает churn/complaint risk |
| `Live` | Активная paid session | Приоритизирует и предупреждает не перебивать | Деньги и обязательство delivery |
| `PP` | Payment pending | Сигнал завершить оплату | Прямой revenue recovery |
| `Sell` | Есть sell window/offer moment | Подсказывает коммерческий шаг | Продление/пакет без хаоса |
| `Fire` | Супер-горячий expert-specific интерес | Ставит лид выше Hot и скрывает Hot | Outreach основан на сильном персональном поводе |
| `Hot` | Ping 0-4 часа без Fire | Поднимает срочный лид | Теплый outreach вовремя |
| `NEW` | Ping 4-24 часа | Держит свежий лид в работе ниже Hot | Не терять сигнал после горячего окна |
| `Paid` | Есть credits/баланс/paid-сигнал | Повышает вероятность конверсии | Приоритизация лидов |
| `Paid starts soon` | Будущая paid session скоро начнется | Готовит эксперта к старту | Не сорвать оплаченный слот |
| `Paid idle` | В paid session мало активности/долгое молчание | Warning в composer/right panel | Refund/support risk |
| `Free ending` | Free value почти исчерпан | Подсказывает переход к Book Now | Не отдавать весь продукт бесплатно |
| `Previous buyer` | Клиент уже покупал | Ограничивает новый free reading | Возврат должен идти через lift/Book Now |
| `Future content locked` | Будущая paid session оплачена | Блокирует раскрытие content заранее | Иначе клиент может отменить/не прийти |
| `Claim precision` | Есть риск обещаний/гарантий | Показывает safety/quality guard | Нельзя обещать гарантированный результат |

## 10. Moderator/supervisor flags

| Флаг | Тип | Когда ставится | Что делает | Где показывать |
|---|---|---|---|---|
| `Quality watch` | Indicator | QA/модератор видит риск качества ответа или paid delivery | Подсветка и контроль, без авто-перераспределения | Карточка кратко, детали в right panel |
| `Do not push` | Indicator/policy | Клиент раздражен, чувствительная ситуация, риск жалобы | Подавляет sales hints и повторные offer | Header/right panel/composer |
| `Needs handoff` | Routing-impact | Нужен другой эксперт/старший/support | Создает handoff task | Header/right panel, может влиять на очередь |
| `Complaint risk` | Indicator или routing-impact | Есть риск жалобы/refund/support | Повышает внимание | Очередь + right panel |
| `Retention risk` | Routing-impact | Клиент может уйти после плохого опыта | Может поднять приоритет | Очередь + supervisor view |
| `Hot client` | Routing-impact | Активный buyer/важный кейс по подтвержденным правилам | Повышает приоритет | Очередь + right panel |
| `Policy risk` | Indicator | Есть compliance/safety/claims issue | Напоминает guardrails | Right panel, при high risk в composer |

Решение для запуска: оставить `Quality watch`, `Do not push`, `Needs handoff`, `Complaint risk`. `Hot client` и `Retention risk` оставить, только если есть понятная бизнес-формула.

## 11. Expert-private flags

| Флаг | Кто ставит | Кто видит | Что делает | Ограничение |
|---|---|---|---|---|
| `Favorite` | Эксперт | Только этот эксперт | Добавляет в личный быстрый фильтр | Не влияет на чужую очередь |
| `Pin` | Эксперт | По умолчанию этот эксперт; можно расширить до team pin отдельным типом | Быстрый возврат к диалогу/сообщению | Нужен `private/team` subtype |
| `Follow-up` | Эксперт | Этот эксперт или team, если follow-up общий | Напоминание вернуться к клиенту | Должен иметь `due_at` и auto-expire |
| `Need data` | Эксперт/System | Эксперт, support при разборе | Помечает, что не хватает DOB/time/timezone/context | Не должен превращаться в постоянный шум |
| `Offer prepared` | Эксперт/System | Эксперт | Показывает, что sell draft уже подготовлен | Не дублировать offer |
| `Resolved` | Эксперт/System | Team/system | Убирает из активной очереди | Это уже не private, если влияет на общую очередь |

Правило: если флаг меняет маршрутизацию, SLA или видимость для других, он больше не expert-private.

## 12. Conversation header

| Элемент | Источник | Когда видно | Что делает | Зачем |
|---|---|---|---|---|
| Client avatar/name | System | Всегда | Показывает клиента | Быстрая ориентация |
| Arrow | UI | Всегда | Показывает направление client -> expert | Не путать клиента и экспертный профиль |
| Expert avatar/name | System | Всегда | Показывает, кем клиент видит ответ | Критично для multi-expert workspace |
| Language badge | System/profile | Есть язык клиента | Выбор шаблонов/перевода | Операционная подсказка |
| Stage chip | System/workflow | Есть stage | Короткая стадия текущего кейса | Чтобы не искать в right panel |
| `Live` / `PP` / `Sell sent` | System | Есть активный paid/payment/sell state | Immediate state | Не перебить paid session, не продублировать offer |
| `Last activity` / `Signal` | System | Всегда | Время последнего события | Понять свежесть |
| `Pinned` button | Expert/team | Есть pinned panel | Открывает закрепленные сообщения | Быстро найти важные points |

Не добавлять в header: полный список flags, все notes, внутреннее имя агента, полную платежную историю.

## 13. Header actions

| Действие | Когда активно | Что делает | Зачем |
|---|---|---|---|
| Search in chat | В открытом chat | Поиск по текущей истории | Быстро найти context |
| Play / Stop session | В `Chats`, не в `Pings` | Старт/стоп моей paid session panel | Управление paid delivery |
| More menu | Всегда | Pin/archive/handoff/jump/font | Вторичные действия без перегруза header |

Для `Pings` Play disabled: ping еще не является чатом.

## 14. Paid session panel

Панель появляется в центре, когда эксперт запускает или ведет paid session.

| Элемент | Источник | Когда появляется | Что делает | Зачем |
|---|---|---|---|---|
| `My session` | Expert action/session | Текущий эксперт запустил session | Отличает мою сессию от чужого `Live` | Не путать ownership |
| `14m left` | System/session | Есть active paid | Остаток времени | Планировать глубину ответа |
| `Sell window` | System/workflow | Подходит момент продления | Подсказывает sell timing | Продление без раннего давления |
| Translation direction | System/profile | Есть разные языки | RU -> EN и т.п. | Техническая подсказка |
| Sales hint | System/workflow | Есть active paid | Короткая рекомендация | Сначала закрыть promised topics |
| `Offer` | Expert action | В paid или sell state | Вставляет sell/package/deep-reading draft | Быстро подготовить предложение |
| `Comp request` | Expert action | Сбой/спор/платежная проблема | Создает audited request | Не давать эксперту прямой refund |

Не давать обычному эксперту: direct refund, manual credit edit, coupon issue без role/limit gates.

## 15. Ping outreach panel

Появляется при выборе `data-workload-type="ping"`.

| Элемент | Источник | Когда появляется | Что делает | Зачем |
|---|---|---|---|---|
| Ping reason | System | Всегда для ping | Объясняет, почему лид в очереди | Не писать вслепую |
| Due time | System/workflow | Есть срок действия | Показывает дедлайн/окно | Не опоздать с outreach |
| `Previous buyer` / `Lead` | System/history | По истории клиента | Разделяет buyer и новый lead | Buyer не должен получать полный new free reading |
| Guidance | System/workflow | Всегда | Следующий корректный шаг | Мягкий outreach без давления |
| `Send template` | Expert action | Ping без ответа | Вставляет первое сообщение | Быстро начать контакт |
| `Invite` | Expert action | Есть intent/credits | Вставляет paid invite/package | Конверсия интереса |
| `Favorite` | Expert-private | Всегда | Личная отметка | Вернуться позже |
| `Dismiss` | Expert/System | Лид неактуален | Убирает из рабочей очереди | Не засорять список |

## 16. Composer

| Элемент | Источник | Когда видно | Что делает | Зачем |
|---|---|---|---|---|
| Quick replies | UI/templates/workflow | Всегда | 6 сценарных шаблонов: `Need data`, `Book Now`, `Objection`, `Paid topic`, `Extend`, `Safety route` | Скорость без мусорных generic-фраз |
| Controls mode | UI | Переключается кнопкой | Показывает рабочие actions | Не держать все кнопки в строке |
| `Need data` | Expert/System | Когда нужны данные или вручную | Готовит уточнение DOB/time/timezone/context | Корректная консультация |
| `Offer` | Expert/System | Sell/Book Now/paid states | Вставляет commercial draft | Быстрая продажа без ручного текста |
| `Comp request` | Expert action | Сбой/спор | Открывает request modal | Аудит вместо ручных кредитов |
| `Resolve` | Expert action | Кейс обработан | Закрывает/помечает solved | Очистка очереди |
| Workflow hint | System/workflow | Всегда при выбранном кейсе | Показывает stage, next action, warning | Не дать ошибиться со стадией |
| Attachment menu | Expert action | Всегда | Фото/галерея/аудио/файл | Поддержка вложений |
| Reply preview | Expert action | Reply mode | Показывает reply target | Точный ответ на сообщение |
| Edit bar | Expert action | Edit mode | Показывает редактируемое сообщение | Правка до просмотра клиентом |
| Send | Expert action | Есть текст/вложение | Отправляет payload | Основное действие |
| Voice | Expert action | Если включено | Запись/отправка voice | Быстрый ответ голосом |

Workflow hint не блокирует отправку сам по себе, кроме будущих отдельно утвержденных safety/legal правил.

## 17. Right panel tabs

Right panel - это место для деталей. Оно не должно превращаться в вторую очередь.

| Tab | Что содержит | Зачем нужен | Что не выносить в левую очередь |
|---|---|---|---|
| `Client` | Паспорт клиента, язык, timezone, birth data, видимый эксперт, реальный оператор | Контекст для корректного ответа | Все персональные поля |
| `Workflow` | Stage, next action, paid/free boundary, objection, ping/lift, risk, короткий draft | Быстро понять рабочую логику кейса | Полную аналитику как chips в queue |
| `Pay` | Balance, paid status, paid history, coupon rule, extension window, payment events | Коммерческий и платежный контекст | Историю платежей |
| `Notes` | Внутренние заметки, pinned notes | Память команды/эксперта | Все notes в карточку |

## 18. Workflow block

| Поле | Источник | Что показывает | Зачем |
|---|---|---|---|
| Stage badge | System/workflow | Текущую стадию | Основной контекст ответа |
| Next action | System/workflow/AI | Что делать сейчас | Снижает ошибки эксперта |
| Warning | System/workflow | Что нельзя/опасно делать | Book Now boundary, future paid lock, safety |
| Free boundary | System/workflow | Free state + insight count | Не отдавать весь продукт бесплатно |
| Book Now | System/workflow/payment | Status + promised topics | Контроль бизнес-перехода |
| Paid session | System/payment/session | Status/time/start | Delivery obligation |
| Objection | System/AI/manual | Type + attempts | Не давить бесконечно |
| Ping/lift | System/workflow | Reason/due | Корректный outreach |
| Risk | System/moderator | Safety/claim risk | Compliance/quality |

## 19. Pay tab

| Элемент | Источник | Когда важен | Что делает |
|---|---|---|---|
| Balance | System/payment | Всегда | Оценка возможности paid start/extension |
| Status | System/session | Paid/payment states | Показывает live/pending/future |
| Paid history | System/analytics | Для buyer/new lead routing | Показывает, был ли уже оплаченный опыт |
| Coupon rule | System/rules | Objection/payment issues | Показывает, что eligibility надо проверить, не выдает купон сам |
| Extend window | Workflow/session | Paid session/low time | Подсказывает, когда offer уместен |
| Used time | Session | Active paid | Контроль delivery |
| Compensation | Support/rules | Сбой/спор | Request only для обычного эксперта |
| Payment events | System/payment | После free/pay/sell событий | Аудит действий клиента |

## 20. Notes tab

| Элемент | Источник | Видимость | Зачем |
|---|---|---|---|
| Internal note | Expert/team | По настройке visibility | Контекст для следующего ответа |
| Pinned note | Expert/team/moderator | По owner/source | Критичная информация |
| Action log | Prototype/system | В demo/local state | Показать, что действие сработало |

Решение: разделить личные notes эксперта и team notes. Не смешивать без явной метки.

## 21. Modals

| Modal | Кто открывает | Что делает | Зачем | Источник результата |
|---|---|---|---|---|
| `Report a problem` | Expert | Отправляет проблему интерфейса/support | Техническая обратная связь | Expert -> support |
| `Make me busy` | Expert | Pause reason | Управление сменой/нагрузкой | Expert/system |
| `Comp request` | Expert | Запрос компенсации с reason | Аудит вместо ручного refund | Expert -> support/moderator |
| `Request handoff` | Expert/moderator | Передача кейса | Escalation/routing | Expert/moderator |
| `Schedule follow-up` | Expert | Follow-up due time/reason | Вернуться без спама | Expert-private или team по visibility |

## 22. Рекомендованный минимум на запуск

Оставить обязательно:

- `Chats/Pings`;
- Search + quick filters;
- filters: `Reply`, `SLA`, `Live`, `PP`, `Sell`, `Fire`, `Hot`, `NEW`, `Paid`, `Favorite`, `Archive`;
- system indicators: `Reply`, `SLA`, `Live`, `PP`, `Sell`, `Fire`, `Hot`, `NEW`, `Paid`;
- stage badges: `Book soon`, `Book Now`, `Objection`, `Future Paid`, `Paid Live`, `Lift Due`, `Safety`;
- composer workflow hint;
- 6 workflow templates в composer вместо длинного набора generic chips;
- paid session panel;
- ping outreach panel;
- right panel `Client`, `Workflow`, `Pay`, `Notes`;
- source-aware flags: system/moderator/expert-private.

Оставить условно, если есть backend owner:

- `Hot client`;
- `Retention risk`;
- coupon eligibility;
- direct `Future Paid` scheduling events;
- `Paid idle` threshold.

Отложить:

- direct coupon issue by normal expert;
- direct refund/manual credits;
- сложные saved segments;
- все notes/attachments как chips в queue;
- публичную навигацию профиля в account menu;
- точные pay/bonus/efficiency метрики на этом экране.
- проценты потери клиента без утвержденной модели;
- follow-up сценарии без due_at/reason/owner;
- generic quick replies, которые не относятся к paid/free workflow.

## 23. Открытые вопросы для коллеги

1. `Favorite` и `Pin`: строго личные для эксперта или есть team-level variant?
2. `Pings`: кто имеет право первым писать клиенту - любой назначенный эксперт или только эксперт, чей профиль смотрели?
3. `Do not push`: кто может ставить и снимать - эксперт, модератор, system?
4. `Safety`: какие фразы/категории реально блокируют отправку, а какие только warning?
5. `Coupon eligible`: показываем только eligibility или разрешаем action отдельным ролям?
6. `Paid idle`: какой порог молчания считать риском для разных длительностей paid session?
7. `Previous buyer`: всегда запрещает full free reading или есть исключения?
8. `Archive/Resolved`: эксперт может вернуть кейс сам или нужен supervisor/support?
