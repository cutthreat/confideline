# Confideline / Nebula: стенд аналитики взаимодействий

Локальная тестовая среда для страницы аналитики активных действий между клиентами и экспертными анкетами Confideline / Nebula.

Стенд не подключается к боевому сайту и использует только `fixtures/partner-interactions.fixture.json`.
Fixture содержит пользователей, назначения `Партнер -> экспертные анкеты`, сырые события и ожидаемые кейсы аналитики.
Таблица строится из агрегированных событий, а не из заранее посчитанных строк.

## Продуктовая рамка

Это не dating-отчет. Для Confideline / Nebula экран является операционным контролем консультационного сервиса:

```text
просмотр анкеты -> сохранение интереса -> старт диалога -> сообщение клиента -> ответ эксперта -> оплата консультации -> повторное обращение -> блокировка/жалоба
```

В текущую модель не входят подарки, приватные фото, лайки, совпадения и encounter-действия. Для этих legacy YouDate-сущностей добавлен защитный тест, чтобы они не вернулись в макет случайно.

## Ролевые страницы

- `index.html` - админ: видит всех Партнеров, может выбирать Партнера, экспертную анкету, клиента и графики сравнения.
- `partner.html` - Партнер: техническая роль `agent`, видит только назначенные ему экспертные анкеты.
- `expert.html` - экспертная анкета: видит только свои взаимодействия с клиентами.

## Run

```powershell
.\scripts\Start-PartnerInteractionsOfflineEnv.ps1 -Open
```

Default URL:

```text
http://127.0.0.1:8095/index.html
```

Админ:

```text
http://127.0.0.1:8095/index.html
```

Партнер:

```text
http://127.0.0.1:8095/partner.html
```

Эксперт:

```text
http://127.0.0.1:8095/expert.html
```

Боевой вид по умолчанию скрывает симулятор и диагностические блоки. В `partner.html` Партнер берется как текущий аккаунт с технической ролью `agent`; свободного выбора другого Партнера нет. В `expert.html` экспертная анкета не может расширить область до других анкет.

Debug/simulator view:

```text
http://127.0.0.1:8095/index.html?debug=1
http://127.0.0.1:8095/partner.html?debug=1
http://127.0.0.1:8095/expert.html?debug=1
```

## Проверка

```powershell
.\scripts\Test-PartnerInteractionsOfflineEnv.ps1
```

Проверка поднимает локальную страницу, проверяет HTML/CSS/JS на отсутствие внешних зависимостей боевого сайта, сверяет аналитику с expected cases, проверяет симулятор событий, роли, порядок воронки, отсутствие dating/private-photo/gift-метрик и делает screenshots.

Также запускается synthetic large-scale check под рабочий объем:

- 50 Партнеров;
- 5,000 экспертных анкет;
- 1,500 назначенных анкет;
- 3,000 клиентов;
- 48,000 событий.

UI должен показывать страницу строк, а не выгружать весь результат целиком.

For a fast logic-only run after screenshots have already been refreshed:

```powershell
.\scripts\Test-PartnerInteractionsOfflineEnv.ps1 -SkipScreenshots
```

## KPI качества консультаций

- активные клиенты;
- диалоги, начатые клиентом;
- диалоги с ответом;
- диалоги без ответа;
- доля ответа;
- исходящие сообщения эксперта без входящего сообщения клиента.

## Вкладки

- `Таблица`: строки пар `кто -> кому`, сортировка по каждому столбцу, пагинация, поиск и фильтры.
- `Графики`: role-aware отчет в стиле конструктора аналитики: показатель, разрез, тип графика, сравнение, группировка и множественный выбор участников.

## Документация для программиста

Основные документы:

- `H:\GPT-Codex\Confideline\Analitica\partner-interactions-implementation-handoff.md`
- `H:\GPT-Codex\Confideline\Analitica\partner-interactions-data-contract.md`
- `H:\GPT-Codex\Confideline\Analitica\partner-interactions-codex-migration.md`
- `H:\GPT-Codex\Confideline\Analitica\partner-interactions-metric-contract.md`
- `H:\GPT-Codex\Confideline\Analitica\partner-interactions-final-review-2026-06-01.md`

Публичная handoff-панель:

```text
https://cutthreat.github.io/confideline/web/partner-interactions-analytics/
```

Документация намеренно не встроена в продуктовый HTML-макет.

## Production-gaps

Перед внедрением в live-код нужно подтвердить:

- точный source of truth для назначений `chief-under`;
- production route и permission rule для кабинета эксперта;
- источник успешной оплаты консультации на уровне пары клиент/эксперт;
- существует ли production-событие `favorites/bookmarks`;
- формулу `repeatRequests`, если нет отдельного event-log;
- исключение test/admin/QA событий из управленческой аналитики.

## Reports

- `reports/partner-interactions-offline-report.json`
- `reports/partner-interactions-offline-report.md`
- `reports/partner-interactions-analytics-report.json`
- `reports/partner-interactions-simulator-report.json`
- `reports/partner-interactions-large-scale-report.json`

## Screenshots

- `screenshots/partner-interactions-offline-desktop.png`
- `screenshots/partner-interactions-offline-mobile.png`
- `screenshots/partner-interactions-partner-desktop.png`
- `screenshots/partner-interactions-partner-mobile.png`
- `screenshots/partner-interactions-expert-desktop.png`
- `screenshots/partner-interactions-expert-mobile.png`
- `screenshots/partner-interactions-admin-charts-desktop.png`
- `screenshots/partner-interactions-partner-charts-desktop.png`
- `screenshots/partner-interactions-expert-charts-mobile.png`
