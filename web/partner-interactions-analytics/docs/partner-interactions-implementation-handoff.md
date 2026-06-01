# Partner interactions analytics - implementation handoff

## Цель

Сделать страницу админ-панели для контроля активных действий между клиентами и экспертными анкетами, закрепленными за конкретным партнером.

Страница отвечает на вопрос:

```text
кто -> кому -> сколько активных действий сделал
```

Первый масштаб:

- клиент -> эксперт;
- эксперт -> клиент;
- только эксперты, закрепленные за выбранным партнером;
- периоды: сегодня, 7 дней, 30 дней, весь период;
- вывод: KPI-сводка, таблица и отдельная вкладка графиков. ТЗ не размещается в рабочем интерфейсе.

Важно: рабочая HTML-панель не должна содержать вкладку, блок или кнопку `ТЗ для внедрения`. Документация для программиста живет отдельными файлами рядом с макетом.

## Текущий offline-стенд

Локальный стенд находится тут:

```text
H:\GPT-Codex\Confideline\Analitica\offline-test-env
```

Запуск:

```powershell
cd H:\GPT-Codex\Confideline\Analitica\offline-test-env
.\scripts\Start-PartnerInteractionsOfflineEnv.ps1 -Open
```

Проверка:

```powershell
.\scripts\Test-PartnerInteractionsOfflineEnv.ps1
```

URL:

```text
http://127.0.0.1:8095/index.html
```

Админский вариант позволяет выбрать:

- всех Партнеров для сравнения между собой;
- одного Партнера;
- одну экспертную анкету внутри доступного среза;
- клиента через поиск по имени, username, email или ID.

Боевой вид макета по умолчанию не показывает технические блоки, mock payload и simulator.

Партнерский рабочий кабинет:

```text
http://127.0.0.1:8095/partner.html
```

Экспертный кабинет:

```text
http://127.0.0.1:8095/expert.html
```

Во всех трех вариантах есть вкладки:

- `Таблица` - точные строки "кто -> кому -> сколько действий";
- `Графики` - отчет-конструктор для сравнения Партнеров, экспертных анкет или клиентов.

## Финальный ролевой UX/UI проход

Дата финального прохода: 2026-06-01.

Проверены актуальными скриншотами шесть рабочих состояний:

| Роль | Таблица | Графики |
| --- | --- | --- |
| Админ | `screenshots/role-final-pass-after/admin-table.png` | `screenshots/role-final-pass-after/admin-charts.png` |
| Партнер | `screenshots/role-final-pass-after/partner-table.png` | `screenshots/role-final-pass-after/partner-charts.png` |
| Эксперт | `screenshots/role-final-pass-after/expert-table.png` | `screenshots/role-final-pass-after/expert-charts.png` |

Итоговые UX-решения обязательны для production-внедрения:

- Админская страница показывает выборку по всем Партнерам, отдельному Партнеру, экспертной анкете или клиенту.
- Страница Партнера не содержит выбора другого Партнера и ограничена закрепленными экспертными анкетами текущего пользователя с технической ролью `agent`.
- Страница эксперта не содержит выбора другой анкеты и ограничена текущей экспертной анкетой.
- Ролевые меню не должны содержать нерелевантные для консультационного продукта dating/photo-разделы; для этой задачи оставлены активность, анкеты/консультации, сообщения, отзывы/жалобы и настройки.
- Сортировки в UI должны быть короткими: `Всего действий ↓`, `Сообщения клиентов ↓`, `Оплаты консультаций ↓`, чтобы селекты не резали текст.
- Легенда действий должна быть читаемой, с переносом текста, без обрезания `Повторные обращения клиента`.
- Графики должны быть компактным отчетным блоком: фиксированная высота, ось значений, аккуратная легенда, короткий вывод, таблица сравнения под графиком.
- Футеры рабочих таблиц должны коротко объяснять область выборки роли, без длинных методических пояснений.

Отдельные страницы:

| Страница | URL в стенде | Production route |
| --- | --- | --- |
| Админ | `index.html` | `/admin/partner-interaction/index` |
| Партнер | `partner.html` | `/admin/partner-interaction/my` |
| Эксперт | `expert.html` | `/expert/interaction/index` или фактический route кабинета эксперта |

В этом режиме партнер - это аккаунт из раздела `/admin/partner/index` с технической ролью `agent`. `partnerId` берется из текущего аккаунта партнера, а не выбирается вручную в интерфейсе.

Тестовый debug-режим для внутренней проверки:

```text
http://127.0.0.1:8095/index.html?debug=1
http://127.0.0.1:8095/partner.html?debug=1
http://127.0.0.1:8095/expert.html?debug=1
```

Стенд не подключается к live-сайту. Он использует fixture:

```text
fixtures/partner-interactions.fixture.json
```

## Контракты

Детальные контракты вынесены отдельно:

```text
H:\GPT-Codex\Confideline\Analitica\partner-interactions-data-contract.md
H:\GPT-Codex\Confideline\Analitica\partner-interactions-metric-contract.md
```

Ключевое решение: пользовательский термин - `Партнер`, техническая роль - `agent`. Экспертная анкета остается отдельным пользовательским аккаунтом, по которому клиенты совершают действия.

Live-ориентиры:

```text
https://confideline.com/ru/admin/partner/index
https://confideline.com/ru/admin/chief-under/index?userId=<partnerId>
```

Правило источника истины: если формулировка задачи расходится с текущей логикой админки, используем текущую логику админки. Сейчас это:

- пользовательский термин: `Партнер`;
- техническое значение роли в таблице партнеров: `agent`;
- список партнеров: `/admin/partner/index`;
- назначенные анкеты: `/admin/chief-under/index?userId=<partnerId>`;
- ожидаемая связь назначений: `chief_under.user_id -> chief_under.under_id`.

## Что имитирует стенд

1. Назначения партнер -> эксперт:

```json
{ "partnerId": 15, "expertId": 184 }
```

2. Сырые события:

```json
{
  "type": "messages",
  "actorId": 185,
  "targetId": 184,
  "createdAt": "2026-05-20T09:30:00+03:00",
  "count": 9
}
```

3. Агрегацию:

```text
actorId + targetId + metric -> count
```

4. Отсечение нерелевантных пар:

- эксперт -> эксперт не попадает;
- клиент -> клиент не попадает;
- незакрепленный эксперт не попадает в отчет выбранного партнера;
- попадает только пара, где ровно одна сторона является закрепленным экспертом.

5. Фильтры:

- partnerId;
- period;
- direction;
- expertIds в UI только отображаются как результат назначения.

6. Random simulator:

- `Random filters` меняет входные переменные;
- `Send mock payload` показывает контракт запроса;
- `Add event` добавляет одно случайное событие;
- `Add 10 events` добавляет пакет событий;
- `Auto stream` генерирует поток событий;
- `Reset` возвращает исходный fixture.

## UX для больших объемов

После пользовательского прогона по трем ролям добавлены обязательные элементы работы с большим объемом данных:

- Админ: выбор `Все Партнеры` / конкретный Партнер / конкретная экспертная анкета через `ID эксперта`, поиск клиента, минимальный порог действий, сортировка по конкретной метрике действий, нижний выбор размера страницы и пагинация.
- Партнер: выбор одной из закрепленных анкет в поле `Эксперт`, поиск клиента, минимальный порог действий, сортировка по конкретной метрике действий, нижний выбор размера страницы и пагинация. Это нужно для сценария 5-30 закрепленных анкет.
- Эксперт: поиск клиента, минимальный порог действий, сортировка по конкретной метрике действий, нижний выбор размера страницы и пагинация. Это нужно для сценария 100-1000 диалогов на одной анкете.
- Все роли: отдельная строка сигналов риска и качества - жалобы, блокировки, оплаченные консультации, активные пары 10+.
- Все роли: вкладка графиков строится из тех же фильтров, что и таблица. Админ сравнивает Партнеров, анкеты или клиентов; Партнер сравнивает закрепленные анкеты или клиентов; эксперт сравнивает клиентов своей анкеты.

Антонский UX-вывод: таблица без сужения, поиска и страниц непригодна для реального оператора. Поэтому production-внедрение не должно выводить полный набор строк одной HTML-таблицей. Сервер должен отдавать страницу данных и общий счетчик строк.

Финальное состояние handoff-панели опубликовано:

```text
https://cutthreat.github.io/confideline/web/partner-interactions-analytics/
```

Последний Git-коммит финального UX-прохода:

```text
2739ec5 Finalize partner analytics role UX
```

## Контракт запроса

Предлагаемый route:

```text
GET /admin/partner-interaction/index
```

Query:

```json
{
  "partnerId": 15,
  "expertId": 184,
  "period": "7d",
  "direction": "all",
  "query": "omkar",
  "minActions": 1,
  "sort": "total_desc",
  "page": 1,
  "pageSize": 50,
  "expertIds": "184,192",
  "view": "table|charts"
}
```

Поля:

- `partnerId` - обязательный основной фильтр в админском режиме. В партнерском кабинете это id текущего Партнера с ролью `agent`.
- `period` - `today`, `7d`, `30d`, `all`.
- `direction` - `all`, `client_to_expert`, `expert_to_client`.
- `expertId` - optional narrowing to one expert questionnaire inside the current allowed scope.
- `query` - optional client search by user id, name, username, or email where available.
- `minActions` - optional lower bound for noisy low-action pairs.
- `sort` - `total_desc` or concrete consultation funnel metric: `profileViews_desc`, `favorites_desc`, `chatStarts_desc`, `clientMessages_desc`, `expertReplies_desc`, `paidConsultations_desc`, `repeatRequests_desc`, `blocks_desc`, `reports_desc`.
- `page` and `pageSize` - required for real data volumes; page size values: 50, 100, 250, 500.
- `expertIds` - fallback/debug input. В обычном режиме эксперты должны браться из назначения партнера.
- `view` - optional UI state. Backend formulas are the same; charts use the same filtered scope as the table.

## Порядок метрик в интерфейсе

Порядок столбцов, сортировок, графиков и fixture должен оставаться единым и идти по консультационной воронке:

```text
profileViews -> favorites -> chatStarts -> clientMessages -> expertReplies -> paidConsultations -> repeatRequests -> blocks -> reports
```

Почему так: оператор сначала видит интерес к анкете, затем сохраненное намерение, старт диалога, входящий спрос клиента, обработку экспертом, денежную конверсию, удержание и только затем негативные сигналы. Такой порядок легче читать при ежедневном контроле Партнеров и экспертных анкет, чем алфавитный или исторический YouDate-порядок.

Партнерский route:

```text
GET /admin/partner-interaction/my
```

В партнерском route `partnerId` не читается из запроса и берется из текущего аккаунта Партнера: `Yii::$app->user->id`.

Важно: в локальном базовом Yii-пакете, где сделан прототип, live-специфичные контроллеры `partner/chief-under` не найдены. При production-интеграции нельзя выдумывать новую роль; нужно использовать существующую live-логику раздела `Партнеры` и назначений `chief-under`.

Ролевые варианты:

| Вариант | Кто открывает | Доступ к данным | Основной фильтр |
| --- | --- | --- | --- |
| Админ | администратор/модератор с правами | любой Партнер и его назначенные анкеты | `partnerId` |
| Партнер | аккаунт Партнера, техническая роль `agent` | только анкеты, назначенные этому Партнеру | текущий `Yii::$app->user->id` |
| Эксперт | текущая экспертная анкета | только взаимодействия клиентов с этой анкетой | текущий `expertId` |

## Графики: подход Яндекс Метрики

Графики нужны не как декоративный dashboard, а как рабочий аналитический отчет. Берем логику Яндекс Метрики: сверху панель управления отчетом, далее график, легенда и таблица. Оператор должен сам выбрать показатель, разрез, тип графика, режим сравнения, группировку и конкретных участников сравнения.

| Роль | Лучший график | Почему полезно |
| --- | --- | --- |
| Админ | сравнение Партнеров по действиям, сообщениям, жалобам/блокировкам и динамике периода | позволяет увидеть, какой Партнер реально ведет назначенные анкеты, где копятся риски и кого сравнивать между собой |
| Админ, выбран Партнер | сравнение экспертных анкет внутри Партнера | показывает слабые/сильные анкеты одного агентского пула |
| Партнер | сравнение закрепленных анкет + срез выбранного клиента по всем анкетам | помогает понять, к какой анкете клиент проявлял интерес и где был провал ответа |
| Эксперт | сравнение клиентов текущей анкеты | удобно для 100-1000 диалогов: кто активен, кому не ответили, где жалоба/блокировка |

Обязательные элементы вкладки `Графики`:

- `Показатель`: все действия, просмотры анкет, добавления в избранное, начатые диалоги, сообщения клиентов, ответы экспертов, оплаченные консультации, повторные обращения, жалобы+блокировки.
- `Разрез`: Партнеры / экспертные анкеты / клиенты в рамках прав роли.
- `Тип графика`: линии по времени, столбцы, структура действий, доля участников, таблица.
- `Сравнение`: без сравнения, с предыдущим периодом, сравнить выбранных.
- `Группировка`: день, неделя, месяц.
- `Кого сравнить`: multi-select с 2-6 участниками.

Поведение:

- при сравнении с предыдущим периодом основной период рисуется сплошной линией, предыдущий - пунктиром;
- при сравнении выбранных участников оператор сам выбирает Партнеров/анкеты/клиентов;
- таблица под графиком показывает те же выбранные участники, значение, предыдущий период, дельту, количество анкет и клиентов;
- фильтры над страницей остаются главным ограничением доступа и периода.

На production данные графиков должны приходить с сервера вместе с ответом таблицы или отдельным endpoint, но строго по тем же фильтрам и тем же правилам доступа.

Использованные ориентиры:

- Yandex Metrica report setup: report as configurable constructor with dimensions, metrics, period and top controls.
- Yandex Metrica chart setup: line/bar/stacked/category/pie chart types, time granularity, chart metric selection.
- AppMetrica comparison model: previous period and segment comparison, with solid line for main period and dashed line for compared period/segment.

## Контракт ответа / строки таблицы

Одна строка:

```json
{
  "actorId": 185,
  "targetId": 184,
  "actor": {
    "id": 185,
    "name": "Omkar Tiwari",
    "username": "omkar",
    "role": "client"
  },
  "target": {
    "id": 184,
    "name": "Orion Esposito",
    "username": "OrionEsposito",
    "role": "expert"
  },
  "directionKey": "client_to_expert",
  "direction": "Клиент -> эксперт",
  "profileViews": 6,
  "favorites": 1,
  "chatStarts": 1,
  "clientMessages": 9,
  "expertReplies": 0,
  "paidConsultations": 1,
  "repeatRequests": 0,
  "blocks": 0,
  "reports": 0,
  "total": 18
}
```

## Метрики

| Metric | Meaning | Expected source |
| --- | --- | --- |
| `profileViews` | просмотр анкеты | `guest` / visits table |
| `favorites` | клиент добавил анкету эксперта в избранное | favorites/bookmarks source, only if this feature exists in production |
| `chatStarts` | клиент начал диалог с экспертом | первое клиентское сообщение или отдельный event-log |
| `clientMessages` | сообщения клиента эксперту | `message` where sender is client and recipient is expert |
| `expertReplies` | ответы эксперта клиенту | `message` where sender is expert and recipient is client |
| `paidConsultations` | успешная оплата консультации | order/payment/balance source with client, expert, status, created_at |
| `repeatRequests` | повторное обращение клиента к эксперту | derived from repeated client dialog/payment events or event-log |
| `blocks` | блокировка | `block` |
| `reports` | жалоба | `report` |

## Консультационные KPI качества

Эти показатели добавлены как первый практический слой именно для эзотерических консультаций:

| Metric | Meaning |
| --- | --- |
| `activeClients` | уникальные клиенты, которые взаимодействовали с закрепленными анкетами |
| `clientStartedDialogs` | пары клиент/эксперт, где клиент написал первым или хотя бы написал эксперту |
| `answeredDialogs` | клиентские диалоги, где экспертная анкета ответила |
| `unansweredDialogs` | клиентские диалоги без ответа эксперта |
| `responseRate` | доля клиентских диалогов с ответом |
| `outboundWithoutClientMessage` | исходящие сообщения эксперта без клиентского входящего сообщения |

Почему это важно: для консультационного сервиса главный риск - клиент проявил намерение получить консультацию, но экспертная анкета не ответила или Партнер не контролирует качество обработки.

## Важный gap

`paidConsultations` нельзя считать надежно, пока в проекте не найден или не добавлен источник успешной оплаты консультации на уровне пары клиент/эксперт.

Решение:

1. Найти существующую таблицу/лог платежа с pair-level связкой:
   - buyer user id;
   - expert user id;
   - consultation/chat/order id;
   - created_at;
   - status.
2. Если источника нет, добавить событие в момент успешной оплаты консультации.
3. До этого в UI показывать показатель как недоступный или скрывать его из боевого отчета.

## UI-поведение

Страница должна быть плотной рабочей админ-таблицей:

- без маркетингового hero;
- слева текущий admin sidebar;
- сверху стандартный content header;
- первая строка: фильтры;
- затем KPI:
  - expert profiles;
  - interaction pairs;
  - messages;
  - total actions;
- затем таблица с компактными action headers.

Таблица должна поддерживать горизонтальный скролл на мобильных и узких экранах.

## Sorting and filtering

Минимум:

- сортировка по `total`;
- сортировка по каждой метрике;
- фильтр period;
- фильтр direction;
- фильтр partnerId;
- fallback expertIds.

Позже:

- фильтр actor/target;
- фильтр only non-zero metric;
- export CSV;
- drill-down по строке до списка событий.

## Current Yii files

Controller:

```text
Chat\youdate-2.0.2-yii2\Source\youdate_extracted\application\modules\admin\controllers\PartnerInteractionController.php
```

Service:

```text
Chat\youdate-2.0.2-yii2\Source\youdate_extracted\application\modules\admin\services\PartnerInteractionAnalyticsService.php
```

View:

```text
Chat\youdate-2.0.2-yii2\Source\youdate_extracted\application\modules\admin\views\partner-interaction\index.php
```

Menu:

```text
Chat\youdate-2.0.2-yii2\Source\youdate_extracted\application\modules\admin\views\layouts\_menu.php
```

Current implementation routes:

```text
/admin/partner-interaction/index
/admin/partner-interaction/my
```

## Acceptance criteria

1. `/admin/partner-interaction/index?partnerId=15&period=7d&direction=all` opens in admin panel.
2. Partner-facing route opens without a free `partnerId` selector and uses the current Partner user id as partner id.
3. Page uses real admin/partner layout and permissions.
4. Partner assignments are read from `chief_under`.
5. Only assigned expert-client pairs are counted.
6. Client-client, expert-expert, unassigned expert pairs are excluded.
7. All period filters work.
8. Direction filter works.
9. Empty state is readable.
10. Large table does not break layout.
11. `paidConsultations` is either correctly sourced from successful consultation payments or explicitly marked as unavailable.
12. Offline verifier passes before integration handoff:

```powershell
.\scripts\Test-PartnerInteractionsOfflineEnv.ps1
```

Fast logic-only check after screenshots are already current:

```powershell
.\scripts\Test-PartnerInteractionsOfflineEnv.ps1 -SkipScreenshots
```

## Verification artifacts

Expected reports:

```text
offline-test-env\reports\partner-interactions-offline-report.md
offline-test-env\reports\partner-interactions-analytics-report.json
offline-test-env\reports\partner-interactions-simulator-report.json
```

Expected screenshots:

```text
offline-test-env\screenshots\partner-interactions-offline-desktop.png
offline-test-env\screenshots\partner-interactions-offline-mobile.png
```

## Next implementation step

Connect the Yii service to a real local database and compare the output with the offline fixture contract:

1. Seed local DB with fixture-equivalent users, assignments, and events.
2. Open real route.
3. Confirm counts match the offline expected cases.
4. Add missing indexes if query time is unacceptable.
