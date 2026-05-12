# Handoff для Codex: видеоанализ конкурента и развитие Confideline

Дата фиксации: 2026-05-13

## 1. Что это за задача

В репозитории зафиксирован анализ обучающих видео конкурента InsightOrba. Цель анализа - восстановить:

- регламент работы эксперта в чатах;
- бизнес-процесс от free reading до paid session и reactivation;
- устройство личного кабинета / workspace конкурента;
- продуктовые требования для развития `admin-chat-workspace-v2` в Confideline;
- места, где выводы подтверждены видео, и места, где информация остается неполной.

Этот handoff нужен, чтобы другой Codex на другом ПК мог быстро продолжить работу без доступа к исходной переписке.

## 2. Репозиторий и ветка

Репозиторий:

```text
https://github.com/cutthreat/confideline.git
```

Рабочая ветка:

```text
codex/confideline-translator-preview
```

Базовый коммит с полной документацией по видео:

```text
38660b3 Add competitor video workflow documentation
```

После получения репозитория:

```powershell
git clone https://github.com/cutthreat/confideline.git
cd confideline
git checkout codex/confideline-translator-preview
```

## 3. Главные документы

Начинать нужно отсюда:

- `docs/video-analysis/INSIGHTORBA_COMPETITOR_WORKFLOW_FULL_DOCUMENTATION_RU.md` - полная синтетическая документация на русском языке: регламент, UI, lifecycle, data contracts, выводы, непроверенные места.
- `docs/video-analysis/README.md` - индекс всех артефактов видеоанализа.
- `docs/video-analysis/day-*/INSIGHTORBA_DAY*_ANALYSIS.md` - ручной разбор каждого видео.
- `docs/video-analysis/day-*/*_fast.md` - транскрибации с таймкодами.
- `docs/video-analysis/day-*/frames_index.csv` - индекс извлеченных кадров.
- `docs/video-analysis/day-*/contact_sheets/` - визуальные листы кадров для сверки UI.

Для кодовой части текущего workspace полезны:

- `web/admin-chat-workspace-v2/index.html`
- `web/assets/js/agent_chat_custom.js`
- `web/assets/css/agent_chat_custom.css`
- `web/assets/js/global_custom.js`
- `CHAT_WORKSPACE_V2_MIGRATION_GUIDE.md`
- `CHAT_QUEUE_CONTRACT.md`
- `CHAT_MESSAGE_DATA_CONTRACT.md`
- `WORKSPACE_V2_HANDOFF.md`

## 4. Что уже сделано

Обработано 14 видео, примерно 47 часов материала:

- День 1, части 1-2;
- День 2, части 1-2;
- День 3, части 1-2;
- День 4, части 1-2;
- День 5, части 1-2;
- День 6, части 1-2;
- День 7, части 1-2.

Для каждого видео сформированы:

- транскрибация с таймкодами;
- `srt` / `vtt` субтитры;
- индекс кадров;
- contact sheets;
- ручной анализ с выводами по регламенту, UI и data-contract implications.

Исходные mp4 и сырые кадры в git не добавлялись из-за размера. В git лежат достаточные рабочие артефакты для продуктового анализа: транскрипты, таймкоды, индексы кадров, contact sheets и аналитика.

## 5. Главное продуктовое понимание

Конкурентский кабинет не является просто мессенджером. Это операционная система продаж через экспертный чат.

Базовый lifecycle:

```text
New/free lead
-> free reading / trial
-> intrigue
-> Book Now
-> paid session
-> session extension / repeat booking
-> reactivation / lift
-> repeat client management
```

Ключевые сущности, которые нужно учитывать в Confideline:

- стадия диалога;
- Book Now как центральное transition event;
- paid-session timer и paid-session gating;
- free trial boundary;
- objection state и лимит попыток;
- coupon / discount eligibility;
- reactivation / lift как отдельный workflow;
- previous buyers / repeat clients;
- client history across experts;
- favorites / notes / comments;
- safety flags;
- claim precision flags;
- expert availability / online status;
- schedule / timezone;
- workforce onboarding layer.

## 6. Что важно для `admin-chat-workspace-v2`

Старый контекст по текущему workspace:

- чат делится на `All / Active chats / Pings`;
- `Active chats` и `Pings` имеют разную бизнес-семантику;
- очередь управляется через `getQueueStatePayload`, `requestQueueStateUpdate`, `applyDemoQueueState`;
- переключение диалога через `bindConversationSwitcher` и `applyDemoConversationSwitch`;
- composer работает в режимах `direct / reply / edit`;
- migration guide упоминает `#modalControlFlags`, но отдельной модалки сейчас нет: действие `open-flags` переключает правую панель на вкладку `flags` в `agent_chat_custom.js`.

Рекомендованное направление развития:

- превратить стадии диалога в first-class state, а не только UI-теги;
- добавить отдельный слой paid-session state;
- сделать Book Now отдельным событием, от которого зависят подсказки, gating и objections;
- переосмыслить `Pings` как reactivation / follow-up queue;
- расширить правую панель блоками: client continuity, purchase history, previous experts, coupons, safety, schedule, session metrics;
- добавить composer hints по стадии: free reading, intrigue, Book Now, paid, objection, lift;
- добавить риск-индикаторы: long silence in paid session, free-value leakage, self-harm/safety, unsupported exact claims.

## 7. Места с ограниченной уверенностью

Подробный список находится в разделе `12. Не подтверждено / неясно` полного документа.

Главные ограничения:

- точные тарифы, нормы часов и формулы бонусов могут зависеть от периода и статуса эксперта;
- лимит objection attempts звучит как 3 или 3-4, вероятно это рабочий guideline, а не строгий backend rule;
- полный список папок/разделов кабинета не подтвержден идеально;
- неясно, какие AI/background-функции встроены в кабинет, а какие использовались внешними инструментами;
- правила coupon eligibility восстановлены частично;
- safety escalation по self-harm подтвержден как направление, но точный внутренний протокол не полностью виден;
- формулы dashboard/statistics требуют отдельной верификации;
- механика matching duplicate clients / new chats неизвестна.

## 8. Чего нет в git

Не добавлены:

- исходные mp4 из `C:\Users\user\Downloads`;
- локальные hardlinks из `C:\GPT-local\input-videos`;
- сырые извлеченные кадры `frames/`;
- локальные инструменты `.speech-tools`, `.video-tools`, `.tools`;
- локальный Whisper model cache.

Если на другом ПК нужно заново сверять аудио или пересобирать кадры, надо отдельно передать исходные видео. Для разработки продукта и аргументированных выводов текущих артефактов в git достаточно.

## 9. Как продолжать работу

Практичный следующий шаг:

1. Прочитать `INSIGHTORBA_COMPETITOR_WORKFLOW_FULL_DOCUMENTATION_RU.md`.
2. Сверить разделы `9-10` полного документа с текущими контрактами `CHAT_QUEUE_CONTRACT.md` и `CHAT_MESSAGE_DATA_CONTRACT.md`.
3. Сформировать backlog для `admin-chat-workspace-v2`:
   - conversation state machine;
   - paid session state;
   - Book Now event;
   - objection tracking;
   - reactivation queue;
   - safety/claim flags;
   - right panel extensions;
   - composer hints.
4. Если началась реализация, сначала расширять demo data/contracts, потом UI, затем поведение очередей.

## 10. Короткий промпт для нового Codex

```text
Ты работаешь в repo confideline, branch codex/confideline-translator-preview.
Главная задача: на основании видеоанализа конкурента InsightOrba развивать admin-chat-workspace-v2.
Сначала прочитай docs/video-analysis/HANDOFF_TO_CODEX_RU.md и docs/video-analysis/INSIGHTORBA_COMPETITOR_WORKFLOW_FULL_DOCUMENTATION_RU.md.
Нужно сохранять различие Active chats / Pings, учитывать Book Now, paid-session gating, reactivation/lift, free trial boundary, objections, favorites, previous buyers, safety flags и onboarding/workforce layer.
Если информации недостаточно, отмечай уровень уверенности и не выдавай гипотезы за подтвержденные факты.
```
