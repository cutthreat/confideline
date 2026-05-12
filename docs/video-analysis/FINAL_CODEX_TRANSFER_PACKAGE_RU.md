# Финальный пакет передачи в другой Codex

Дата фиксации: 2026-05-13

Документ нужен, чтобы другой Codex на другом ПК мог забрать весь контекст через Git и продолжить работу без доступа к этой переписке.

## 1. Репозиторий

```text
Repository: https://github.com/cutthreat/confideline.git
Branch: codex/confideline-translator-preview
Main docs folder: docs/video-analysis
Workspace target: web/admin-chat-workspace-v2
```

Команда для получения:

```powershell
git clone https://github.com/cutthreat/confideline.git
cd confideline
git checkout codex/confideline-translator-preview
git pull origin codex/confideline-translator-preview
```

## 2. Что было сделано

Обработан пакет обучающих видео конкурента InsightOrba:

- 14 видео;
- примерно 47 часов материала;
- дни 1-7, по 2 части на каждый день;
- сформированы транскрипты, субтитры, индексы кадров, contact sheets и ручные аналитические документы;
- на основе видео восстановлены регламент эксперта, бизнес-процессы, устройство личного кабинета, dashboard/analytics/workmode, продуктовые требования и backlog для Confideline `admin-chat-workspace-v2`.

## 3. Что есть в Git

В Git добавлены:

- полная синтетическая документация;
- per-video analyses;
- transcripts with timecodes;
- `.srt` / `.vtt` subtitles;
- `frames_index.csv`;
- `contact_sheets`;
- продуктовые спецификации;
- регламент эксперта;
- training/certification/SOP;
- dashboard/analytics/workmode package;
- implementation mapping к текущему коду.

В Git не добавлены:

- исходные `.mp4`;
- локальные hardlinks `C:\GPT-local\input-videos`;
- сырые extracted frames `frames/`;
- локальные инструменты `.speech-tools`, `.video-tools`, `.tools`;
- Whisper model cache.

Для продуктовой разработки текущих материалов в Git достаточно. Для повторной проверки аудио/кадров нужны исходные mp4 отдельно.

## 4. Главная точка входа

Новый Codex должен читать в таком порядке:

1. `docs/video-analysis/FINAL_CODEX_TRANSFER_PACKAGE_RU.md`
2. `docs/video-analysis/README.md`
3. `docs/video-analysis/INSIGHTORBA_COMPETITOR_WORKFLOW_FULL_DOCUMENTATION_RU.md`
4. `docs/video-analysis/IMPLEMENTATION_MAPPING_RU.md`
5. `docs/video-analysis/ADMIN_WORKSPACE_BACKLOG_RU.md`
6. `web/admin-chat-workspace-v2/WORKSPACE_V2_HANDOFF.md`
7. `web/admin-chat-workspace-v2/CHAT_QUEUE_CONTRACT.md`
8. `web/admin-chat-workspace-v2/CHAT_MESSAGE_DATA_CONTRACT.md`

## 5. Основные документы по смысловым блокам

### Полный анализ и доказательная база

- `INSIGHTORBA_COMPETITOR_WORKFLOW_FULL_DOCUMENTATION_RU.md` - главный синтез по всем видео.
- `README.md` - индекс всех материалов.
- `day-*/INSIGHTORBA_DAY*_ANALYSIS.md` - ручной анализ каждого видео.
- `day-*/*_fast.md` - транскрипты с таймкодами.
- `day-*/frames_index.csv` - индекс кадров.
- `day-*/contact_sheets/` - визуальные листы кадров.

### Workflow и продуктовая логика

- `CONVERSATION_STATE_MACHINE_RU.md` - стадии, переходы, события, queue mapping.
- `DATA_DICTIONARY_RU.md` - поля данных.
- `EVENT_TAXONOMY_RU.md` - события для аналитики/QA/Pings.
- `USER_STORIES_ACCEPTANCE_CRITERIA_RU.md` - user stories и acceptance criteria.
- `ADMIN_WORKSPACE_BACKLOG_RU.md` - backlog для `admin-chat-workspace-v2`.
- `STAGE_ACTION_UI_MATRIX_RU.md` - стадия -> действие эксперта -> UI support.
- `IMPLEMENTATION_MAPPING_RU.md` - привязка к текущим файлам и JS/contract точкам.

### Регламент, обучение и эксплуатация

- `EXPERT_WORK_REGULATION_RU.md` - полный регламент работы эксперта.
- `SHIFT_SOP_RU.md` - короткий SOP смены.
- `EXPERT_QA_CHECKLIST_RU.md` - QA-чеклист эксперта.
- `MESSAGE_TEMPLATES_RU.md` - безопасные каркасы сообщений.
- `CONVERSATION_EXAMPLES_RU.md` - хорошие/плохие примеры диалогов.
- `EXPERT_TRAINING_PROGRAM_RU.md` - программа обучения.
- `EXPERT_CERTIFICATION_RU.md` - аттестация и допуск.

### Dashboard, analytics, workmode

- `EXPERT_DASHBOARD_ANALYTICS_WORKMODE_RU.md` - главный пакет по dashboard/statistics/workmode.
- `EXPERT_DASHBOARD_SCREEN_MAP_RU.md` - карта страниц и экранов.
- `EXPERT_METRICS_AND_FORMULAS_RU.md` - метрики, возможные формулы, confidence.
- `EXPERT_WORKMODE_ONBOARDING_POLICY_RU.md` - online/offline/break, schedule, training, questionnaire, first shift.

### UI, риски, AI

- `UI_BLUEPRINT_RU.md` - функциональная схема UI.
- `RISK_REGISTER_RU.md` - реестр рисков.
- `AI_ASSISTANT_PROMPT_PACK_RU.md` - prompt pack для будущего AI-помощника.

## 6. Текущий workspace context

Целевой макет/страница:

```text
web/admin-chat-workspace-v2/index.html
```

Основные файлы:

```text
web/admin-chat-workspace-v2/assets/agent_chat_custom.js
web/admin-chat-workspace-v2/assets/agent_chat_custom.css
web/admin-chat-workspace-v2/CHAT_QUEUE_CONTRACT.md
web/admin-chat-workspace-v2/CHAT_MESSAGE_DATA_CONTRACT.md
web/admin-chat-workspace-v2/WORKSPACE_V2_HANDOFF.md
web/admin-chat-workspace-v2/CHAT_WORKSPACE_V2_MIGRATION_GUIDE.md
```

Важно: контракты лежат внутри `web/admin-chat-workspace-v2`, а не в корне репозитория.

Текущие integration points:

- `getQueueStatePayload(root, changedBy)`
- `requestQueueStateUpdate(payload)`
- `applyDemoQueueState(root, payload)`
- `bindConversationSwitcher()`
- `applyDemoConversationSwitch(payload)`
- composer modes: `direct`, `reply`, `edit`
- `getComposerServerPayload()`
- `handleComposerSend()`
- prototype actions: `data-prototype-action`
- offer drafts: `data-offer-action`

Важная находка: migration guide упоминает `#modalControlFlags`, но в текущем HTML отдельной модалки нет. Действие `open-flags` переключает правую панель на вкладку `flags`.

## 7. Ключевой продуктовый вывод

Конкурентский кабинет - это не просто чат. Это операционная система продаж и удержания через экспертный чат.

Lifecycle:

```text
new / free lead
-> free reading
-> intrigue
-> Book Now
-> objection handling
-> paid session
-> extension / next session
-> post-session follow-up
-> reactivation / lift
-> repeat client management
```

First-class сущности для Confideline:

- `conversation.stage`
- `bookNow.status`
- `bookNow.promisedTopics`
- `paidSession.status`
- `paidSession.timerEndsAt`
- `paidSession.promisedTopics`
- `objection.type`
- `objection.attemptCount`
- `freeTrial.freeValueLimitReached`
- `reactivation.nextActionAt`
- `client.previousBuyer`
- `client.purchaseHistoryCount`
- `safety.flags`
- `claimPrecision.flags`
- `ping.reason`
- `expert.availabilityState`
- `expert.onboardingStage`

## 8. Что важно сохранить при реализации

Сохранять:

- различие `Active chats` / `Pings`;
- независимые queue filter zones;
- composer modes `direct / reply / edit`;
- flags как right-panel/context слой, а не только modal;
- demo/prototype hooks до backend integration.

Добавлять:

- stage badges;
- right-panel workflow summary;
- Book Now block;
- paid session timer/promised topics;
- paid content gating warnings;
- objection attempt counter;
- reactivation due Pings;
- previous buyer / purchase history block;
- safety / claim precision flags;
- expert dashboard/workmode metrics.

## 9. Ограничения уверенности

Подтверждено хорошо:

- Book Now как главный transition event;
- paid session timer/promised topics/idle risk;
- free reading boundary;
- reactivation/lift;
- previous buyers/Favorites/notes;
- online/offline/schedule;
- training/onboarding layer;
- наличие dashboard/statistics.

Требует проверки:

- точный лимит objection attempts: 3 или 3-4;
- точные dashboard/statistics formulas;
- `efficiency` formula;
- pay/hourly/bonus rules;
- full-month target 160-180h;
- точный self-harm escalation protocol;
- full coupon eligibility contract;
- duplicate/new chat matching;
- какие AI/background функции встроены, а какие внешние.

Новый Codex должен явно отмечать confidence и не выдавать гипотезы за доказанные факты.

## 10. Рекомендуемый следующий шаг

Если задача - продолжить документацию:

1. Сделать `PRD_MVP_ADMIN_WORKSPACE_RU.md`.
2. Сделать executive summary для команды.
3. Сделать decision log: какие продуктовые решения нужно принять владельцу.

Если задача - идти в разработку:

1. Прочитать `IMPLEMENTATION_MAPPING_RU.md`.
2. Обновить `CHAT_QUEUE_CONTRACT.md` и `CHAT_MESSAGE_DATA_CONTRACT.md`.
3. Добавить demo fields в queue cards.
4. Добавить stage badges.
5. Добавить right-panel workflow summary.
6. Добавить composer hint/warning panel.
7. Добавить demo conversations для:
   - free lead;
   - previous buyer;
   - Book Now + objection;
   - active paid session;
   - future paid session locked;
   - reactivation due;
   - safety escalation;
   - technical issue.
8. Проверить локальный макет в браузере.

## 11. Готовый prompt для нового Codex

```text
Ты работаешь в репозитории confideline.

Branch: codex/confideline-translator-preview
Главная папка документов: docs/video-analysis
Целевой workspace: web/admin-chat-workspace-v2

Сначала прочитай:
1. docs/video-analysis/FINAL_CODEX_TRANSFER_PACKAGE_RU.md
2. docs/video-analysis/README.md
3. docs/video-analysis/INSIGHTORBA_COMPETITOR_WORKFLOW_FULL_DOCUMENTATION_RU.md
4. docs/video-analysis/IMPLEMENTATION_MAPPING_RU.md
5. web/admin-chat-workspace-v2/WORKSPACE_V2_HANDOFF.md
6. web/admin-chat-workspace-v2/CHAT_QUEUE_CONTRACT.md
7. web/admin-chat-workspace-v2/CHAT_MESSAGE_DATA_CONTRACT.md

Контекст:
На основании 14 обучающих видео конкурента InsightOrba восстановлены регламент эксперта, бизнес-процессы, dashboard/analytics/workmode, UI личного кабинета и product requirements для Confideline admin-chat-workspace-v2.

Ключевые сущности:
conversation.stage, Book Now, paid-session gating, free trial boundary, objections, coupons, reactivation/lift, previous buyers, Favorites, notes, safety flags, claim precision, expert dashboard, schedule, onboarding/workforce.

Важное правило:
Не смешивай подтвержденные факты и гипотезы. Если информация неполная, отмечай confidence.

Если начнешь реализацию:
Сначала обновляй contracts/demo data, потом UI, потом JS behavior. Не ломай существующие queue filter zones, Active chats/Pings semantics и composer modes direct/reply/edit.
```

## 12. Проверка перед стартом на другом ПК

После checkout:

```powershell
git status --short --branch
git log -1 --oneline --decorate
Get-ChildItem docs\video-analysis -Filter *.md | Select-Object Name
```

Ожидаемо:

- ветка `codex/confideline-translator-preview`;
- документы в `docs/video-analysis`;
- workspace files в `web/admin-chat-workspace-v2`.

## 13. Git history ключевых пакетов

Ключевые коммиты по слоям:

```text
38660b3 Add competitor video workflow documentation
fbaef99 Add Codex video analysis handoff
be57824 Add workflow implementation artifacts
a40d345 Add workspace product specification artifacts
0a482f5 Add expert work regulation
c75e2bd Add expert operations and implementation bridge docs
8cbd569 Add expert dashboard analytics workmode package
```

Финальный коммит с этим transfer package смотри через `git log -1` после pull.
