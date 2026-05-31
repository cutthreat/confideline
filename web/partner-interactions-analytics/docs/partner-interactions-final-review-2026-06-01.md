# Confideline / Nebula partner interactions analytics: final review

Дата: 2026-06-01

## Результат

Подготовлен финальный offline-пакет для страницы аналитики взаимодействий между клиентами и экспертными анкетами Confideline / Nebula.

Экран решает задачу контроля консультационного сервиса: кто проявил интерес, кто начал диалог, как эксперт ответил, была ли оплата консультации, было ли повторное обращение и есть ли негативные сигналы.

Публичная handoff-панель после публикации:

```text
https://cutthreat.github.io/confideline/web/partner-interactions-analytics/
```

## Продуктовая логика

Финальный порядок метрик соответствует воронке консультации:

```text
Просмотр анкеты -> Избранное -> Начал диалог -> Сообщение клиента -> Ответ эксперта -> Оплата консультации -> Повторное обращение -> Блокировка -> Жалоба
```

Legacy dating/private-content actions не входят в текущий макет:

- подарки;
- приватные фото и доступ к приватным фото;
- лайки;
- взаимные лайки/совпадения;
- encounter like/dislike.

## Ролевые варианты

| Роль | Страница | Область данных |
| --- | --- | --- |
| Админ | `offline-test-env/index.html` | все Партнеры, выбранный Партнер, выбранная экспертная анкета, выбранный клиент |
| Партнер | `offline-test-env/partner.html` | только экспертные анкеты, назначенные текущему Партнеру с технической ролью `agent` |
| Эксперт | `offline-test-env/expert.html` | только текущая экспертная анкета и ее клиенты |

## Что готово

- Таблица активных действий с сортировкой по каждому столбцу.
- Компактные пиктограммы с расшифровкой над таблицей.
- Роль-зависимые фильтры.
- Периоды: сегодня, 7 дней, 30 дней, весь период.
- Пагинация и page size для больших объемов.
- Поиск клиента.
- Фильтр минимального количества действий.
- Краткая сводка и KPI качества консультаций.
- Вкладка графиков с выбором показателя, разреза, типа графика, сравнения, группировки и участников.
- Симулятор событий в debug-режиме.
- Offline fixture без подключения к боевому сайту.
- Документация для миграции в Yii2/live-код.

## Проверка

Последний полный прогон:

```text
status: PASS
checkedAt: 2026-06-01T01:04:07
analyticsStatus: PASS
analyticsCaseCount: 6
simulatorStatus: PASS
largeScaleStatus: PASS
userFlowStatus: PASS
userFlowChecks: 22
externalReferenceHits: 0
```

Large-scale проверка:

```text
partners: 50
expertUsers: 5000
assignedExperts: 1500
clients: 3000
events: 48000
```

Дополнительно добавлены guard-checks:

- интерфейс на русском языке;
- документация не встроена в продуктовый UI;
- нет dating/private-photo/gift-метрик;
- колонки таблицы идут в порядке консультационной воронки;
- сортировки идут в том же порядке;
- показатели графиков идут в том же порядке;
- роли не расширяют область доступа.

## Факты

- Live Confideline сейчас унаследован от YouDate и содержит исторические dating-сущности.
- Задача текущего экрана - аналитика консультационного продукта, а не dating-механики.
- Партнер в live-терминах отображается как продуктовая роль, техническое значение роли - `agent`.
- Перечень назначенных анкет берется из логики `chief-under`.
- Боевой источник оплаты консультации на уровне пары клиент/эксперт еще нужно подтвердить в production-коде/БД.

## Вывод

Offline-макет и документация готовы к передаче программисту как продуктово осмысленный handoff.

Production-внедрение нельзя закрывать как готовое до подтверждения источников:

1. `chief-under` assignment source.
2. successful paid consultation source.
3. expert cabinet route and permission rule.
4. favorites/bookmarks source, если этот показатель остается в боевой версии.
5. repeat request formula or event-log.
6. test/admin/QA event exclusion.

## Основные файлы

- `offline-test-env/index.html`
- `offline-test-env/partner.html`
- `offline-test-env/expert.html`
- `offline-test-env/assets/partner-interactions.js`
- `offline-test-env/assets/partner-interactions-analytics.js`
- `offline-test-env/assets/partner-interactions-simulator.js`
- `offline-test-env/fixtures/partner-interactions.fixture.json`
- `offline-test-env/scripts/Test-PartnerInteractionsOfflineEnv.ps1`
- `partner-interactions-implementation-handoff.md`
- `partner-interactions-data-contract.md`
- `partner-interactions-codex-migration.md`
- `partner-interactions-metric-contract.md`
