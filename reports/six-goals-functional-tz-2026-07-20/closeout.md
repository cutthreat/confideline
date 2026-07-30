# Closeout: канонический комплект функциональных ТЗ G1-G6

Дата: 2026-07-21  
Статус: `functional_tz_30_of_30_six_verticals_handoff_ready_runtime_no_go`
route_card_id: `codex_hub_global_anti_amnesia_route`  
governance_mode: `artifact_only`; Manhattan не применялся, live/admin/browser действий не было

> Актуализация 2026-07-29: этот closeout сохраняется как исторический snapshot. Универсальная передача vertical packets программисту заменена role-aware маршрутизацией из `task-execution-ownership-matrix.md`; operations, content/policy и QA gates сначала выполняют их владельцы.

## Готово

- Выпущены шесть канонических функциональных ТЗ G1-G6.
- Покрыты все 30 задач G1.1-G6.7.
- Добавлены общий Definition of Done, инварианты, фазы, delivery matrix и handoff contract.
- Старые продуктовые пакеты оставлены supporting sources; более поздние owner decisions имеют приоритет.
- PM, Антон, Gemini и Evidence Lead провели challenge/arbitration.
- Gemini: 23 pass / 7 revise / 0 blocked; функциональные замечания применены, implementation prescriptions отклонены.
- Project documentation index и Confideline progress ledger обновлены.
- O7/O8 закрыты: admin-managed balance pause = 5 минут и agent reconnect grace = 60 секунд.
- O1 закрыт: 60 секунд paid decision, 60 секунд first response, 15 минут support, ordinary escalation 2x, critical immediate; все значения admin-managed по отдельному cross-cut ТЗ.
- O2 закрыт: max 100/pass 80, critical fail overrides, moderator/QA verdict, super-admin reasoned override и re-admission workflow; управление выделено в отдельный admin development package.
- O3 закрыт для pilot readback: window 30 дней, minimum 20 paid + 5 QA sessions, no-data без штрафа, rotation influence disabled; все variable KPI parameters вынесены в admin development package.
- O6 product minimum закрыт: обязательные запреты и critical routes приняты; protected registry/routes/templates/resources вынесены в Trust & Safety admin screen, legal/domain wording/resources остаются release gate.
- Механизм O6 detection определен: six-source signal intake, signal/confirmed separation, evidence packet, configurable monitoring modes/thresholds, human verdict, false-positive/duplicate/degraded cases.
- Chat contact/PII censorship определена server-side до отправки в обе стороны: protected categories, obfuscation/split/attachment/direct guards, masked evidence, secure-field exceptions и fail-closed acceptance.
- R1 refund framework закрыт: technical/duplicate/quality/O6/changed-mind outcomes, protected ceilings и отдельный admin screen с numeric input cells, units, unset/zero, validation, preview, version/audit.
- P1 credit model закрыт: consultation price только credits/minute, global default + profile override + session snapshot; initial global `30 credits/started minute`, `USD` и starter `9.99 USD -> 60 credits` приняты. Управляемые credit packages и purchase discounts вынесены в admin screen; package не продает фиксированные минуты, а auto-refill не входит в MVP.
- O4 functional/admin model закрыта: отдельный compensation screen управляет consultation/fixed/SLA/task components, bases/scopes/periods, overrides, refund corrections, permissions, snapshots и audit; open только initial consultation percentage/base, остальные components disabled до enablement.
- Выпущен первый vertical programmer/QA packet: `G6.1 + G6.7 + G1.2`.
- Выпущены остальные пять vertical packets; совокупное coverage = 30/30 задач ровно один раз.
- ТЗ/readiness отделены от owner enablement и runtime acceptance; все 30 задач имеют 100% requirement/handoff readiness.
- Добавлен owner shortcut `owner-enablements-pilot-defaults-proposal.md`; O1 принят, остальные значения остаются proposal до прямого подтверждения.

## Проверка

- `Test-SixGoalsFunctionalTz.ps1`: 30/30 tasks, 295 passed checks, 0 failed.
- Gemini payload safety: 11/11 files pass перед upload.
- JavaScript `index.html` и `task-tz.html`: parse pass.
- Vertical coverage: 6 файлов, 30/30 task codes, без дублей.
- Artifact integrity и локальные ссылки панели: pass.

## Открыто

1. Enablement gates O4/O5, additional discount grid и refill values. O1/O2/O3/O6/O7/O8/R1/P1, USD, global 30, starter 9.99/60 и managed packages/discount закрыты и ожидают runtime/admin proof; legal/domain safety wording/resources и KPI rotation enablement остаются последующими evidence/release gates.
2. Runtime/build proof отсутствует; продукт остается `NO_GO` до QA.
3. Knowledge-card ссылки на recovery corpus сейчас stale/missing; это не меняет прямые owner decisions, но источник нельзя считать текущим proof.

## Следующий шаг

1. Запускать vertical packets в порядке `delivery-matrix.md`, но каждую задачу маршрутизировать по `task-execution-ownership-matrix.md`.
2. Для operations получить admin/public readback; для development — build/commit marker; для QA/policy — соответствующий verdict/version.
3. Выполнять positive/negative QA на сопоставленной сборке без ожидания завершения всех verticals.
4. Закрыть O4, additional discount grid и refill values перед зависимым pilot enablement; получить legal/domain safety release; O5 и KPI rotation enablement — только после pilot baseline.
5. Только после runtime evidence переводить задачи в `runtime_verified -> accepted`.

Rollback: удалить только новый vertical packet и откатить owner-update строки этого каталога/ledger; runtime и чужие изменения не затрагивались.
