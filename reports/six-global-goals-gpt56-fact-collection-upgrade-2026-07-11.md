# Confideline / Nebula: аудит 6 глобальных целей и доказательной базы

Дата первичного пакета: 2026-07-11
Актуализировано: 2026-07-14
Статус: `review_complete_changes_accepted_not_runtime_verified`

## 1. Итоговый вердикт

Выбранный путь верный: PM собирает модель и зависимости, QA отделяет наблюдаемое поведение от ожиданий, конкурентные материалы дают паттерны, frontend/backend и admin-проверки показывают реальную границу системы, а программист получает функциональное ТЗ. Ошибка была бы не в этом наборе процессов, а в смешивании их доказательной силы.

На 2026-07-14 модель шести целей стала достаточно определённой для реализации, но не для заявления о готовности сайта. Подтверждён старт внедрения, однако `service_session`, новые начисления, KPI-ротация и финальная изоляция остаются `implementation_in_progress_owner_confirmed_not_runtime_verified`.

Независимые проходы:

- Gemini, UI, режим Flash: полный критический аудит, 2026-07-14.
- Grok 4.5, UI, режим Expert: полный критический аудит, 2026-07-14.
- Оба получили один и тот же ограниченный факт-пакет и не видели ответ друг друга.
- Совпадение моделей использовано как сигнал приоритета, а не как доказательство факта.

## 2. Что принято после независимого review

| Решение | Классификация | Почему |
|---|---|---|
| P0 runtime-проверка изоляции агента до пилота | `decision` | Старый live-proof противоречит owner-confirmed claim о permissions; нужен положительный и отрицательный сценарий. |
| Единый автомат состояний `offline / online / busy_paid / balance_pause / off_manual / admin_blocked` | `decision` | Убирает противоречия между сменой, paid-lock, ручным выключением и ротацией. |
| Пауза остаётся 5 минут, но резерв предоставляется один раз на одну консультацию | `decision` | Сохраняет согласованное время на пополнение и закрывает повторное бесплатное удержание агента. |
| Предупреждение и countdown перед первой платной минутой | `decision` | Повышает прозрачность; повторный акцепт не добавляется, потому что клиент уже принял условия до старта. |
| Policy/rate snapshot фиксируется в момент начала paid-фазы | `decision` | Делает начисление и возврат воспроизводимыми после изменения правил. |
| KPI до порога показываются как `insufficient_data`, а не как ноль | `decision` | Не наказывает новых агентов и не создаёт ложную аналитику. |
| Dashboard показывает freshness и полноту событий | `decision` | Частичная инструментализация не должна выглядеть как полный funnel proof. |
| G4 владеет support-case, G2 владеет финансовой коррекцией | `decision` | Убирает две конкурирующие истины о возврате. |

## 3. Что отклонено

| Совет моделей | Решение | Основание |
|---|---|---|
| Лимит числа анкет одного агента в верхней выдаче | `rejected` | Владелец явно отказался от лимита; нет runtime-данных о монополизации. Риск наблюдаем, но не вводим выдуманный cap. |
| Второй акцепт при переходе trial -> paid | `rejected` | Акцепт уже даётся перед запуском paid chat. Добавляется предупреждение, но не новый блокирующий шаг. |
| Сократить паузу до 2 минут | `rejected` | Пять минут уже выбраны; злоупотребление закрывается одноразовым резервом и аудитом. |
| Убрать фикс и дополнительные задания из MVP | `rejected` | Владелец утвердил три независимо управляемых компонента. На старте ненужный компонент можно выключить настройкой. |
| Сохранять ручной off после начала новой смены | `rejected` | Подтверждённое правило: новая смена возвращает анкеты online, кроме admin-blocked и текущего paid/balance lock. |
| Удалить финансовые значения из service_session | `rejected_with_refinement` | Для спора нужны price/debit/accrual/refund snapshots, но ledger остаётся финансовым source of truth; session хранит ссылки и неизменяемый итоговый срез, а не второй расчётный ledger. |

## 4. Состояние целей

| Цель | Текущий статус | Доказательства | Не хватает | Следующее действие / владелец | Acceptance |
|---|---|---|---|---|---|
| G1 Чат и service_session | `functional_model_accepted_implementation_in_progress_not_runtime_verified` | Owner-решения, revalidated plan, programmer start claim | Runtime lifecycle и role views | Программист: state machine; QA: lifecycle suite | Trial и no-trial пути, paid lock, одна 5-мин пауза, resume/timeout, abnormal end, новый session после timeout. |
| G2 Деньги и начисления | `owner_rules_accepted_implementation_in_progress_not_runtime_verified` | Общий финансовый live-контур; утверждённые правила G2.4 | Policy snapshot и session-linked proof | Программист + finance QA | Started-minute billing, немедленное начисление, proportional refund, override с причиной, исторический агент после reassignment. |
| G3 Каталог и ротация | `owner_model_accepted_existing_controls_need_runtime_verification` | Owner claim: weights/pinning/exclusions/preview; city rules | Runtime readback на всех page types; KPI cold start | Программист + PM/QA | City filter, profile eligibility, busy/off/admin states, KPI threshold, insufficient_data, explainable preview. |
| G4 Support и споры | `frontend_packet_ready_backend_linkage_open` | Интерактивный support prototype и task pages | Ticket persistence/RBAC/session/ledger link | Backend + support QA | Один support case связан с session; refund создаёт одну G2 correction; повторная операция не дублирует деньги. |
| G5 События и KPI | `event_model_clarified_runtime_analytics_open` | Список KPI и разрезов | Event dictionary, coverage, freshness, threshold defaults | Analytics owner + QA | События имеют trigger/owner/source; dashboard отличает zero от no-data и сигнализирует неполное покрытие. |
| G6 Назначение, SLA, изоляция | `p0_proof_gap_owner_claim_conflicted_by_old_runtime_evidence` | Owner claim о permissions/audit/logs; старый foreign-access proof | Текущий ACL retest и actual-agent trace | Backend/security QA | Assigned разрешён; foreign profile/dialog/send запрещены; reassignment атомарен и запрещён в paid/pause; история авторства неизменна. |

## 5. Минимальная service_session после review

Сессия создаётся при подтверждённом соединении и запуске таймера консультации. Она хранит:

1. client, public expert profile, actual agent, dialog и consultation sequence;
2. request/start/end, trial granted/used, paid transition;
3. immutable price/policy snapshot;
4. paid duration, debit/accrual/refund итоговый audit snapshot и ссылки на ledger entries;
5. final status, abnormal reason, pause count и автор досрочного завершения;
6. ссылки на message range, support case, QA и admin audit.

Полный чат, ticket, QA и финансовый ledger не дублируются.

## 6. Аудит процессов сбора фактов

| Процесс | Вход -> выход | Source of truth | Слабость | Upgrade | Pass/fail |
|---|---|---|---|---|---|
| Аудио/расшифровка | Голос владельца -> решения | Подтверждённый owner transcript | Пересказ может смешать факт и совет | Decision table с цитатой/датой/статусом | Pass: каждое правило имеет owner status; fail: пересказ назван runtime. |
| Конкурентный анализ | Сайт/видео конкурента -> pattern | Наблюдаемый competitor surface | Pattern принимается за требование или backend truth | Хранить `observed_pattern`, `inference`, `adoption_decision` отдельно | Pass: нет чужих claims как фактов Confideline. |
| PM/QA reports | Наблюдения -> задачи | Report + evidence ref | Дубликаты и разная терминология | Один goal/task registry, единый vocabulary | Pass: у задачи один current status и next action. |
| Admin checks | UI/runtime -> readback | Текущий runtime | Только positive path; UI скрытие принимается за ACL | Positive + negative + direct-route verifier | Pass: foreign read/write blocked server-side. |
| Backend handoff | ТЗ -> implementation | Code/runtime + acceptance output | `передано` или `начато` принимается за done | Статус `implementation_in_progress`, затем proof packet | Pass: commit/build/readback/test ref; fail: только сообщение исполнителя. |
| Static HTML panel | Сводка -> PM navigation | Не runtime; только artifact | Визуальная завершённость создаёт false-ready | Отдельные `% сайта` и `% ТЗ`; proof label рядом | Pass: HTML никогда не повышает сайт %. |
| PM-watch/page registry | Страницы -> dependencies | Реестр + текущий source | Confideline/Nebula ownership смешивается | Явное поле owner/product/evidence surface | Pass: strategy и implementation proof разделены. |
| Tester/QA output | Test -> verdict | Reproducible test evidence | Нет отрицательного сценария/версии | Evidence envelope: target, build, role, steps, expected/actual | Pass: воспроизводимо и привязано к версии. |
| Linear/ручные задачи | Finding -> execution | Канонический task ID | Фрагментация и повторные карточки | Одна задача, backlinks на источники | Pass: нет двух активных владельцев одной истины. |

## 7. Evidence standard

У каждого существенного утверждения должны быть:

- `claim`;
- `class`: fact / owner_confirmed / inference / decision / recommendation;
- `source_ref` и дата;
- `product_owner`: Confideline либо Nebula/Oracle;
- `proof_grade`: P0 runtime, P1 reproducible QA, P2 code/config, P3 owner statement, P4 static artifact;
- `verifier_path`;
- `residual` и следующий action.

Статусы реализации: `planned`, `packet_ready`, `implementation_in_progress`, `implemented_unverified`, `runtime_verified`, `accepted`, `blocked`. Переход через ступень без нового proof запрещён.

## 8. Challenge pass

- Где владелец может ошибаться: оценивать существующие permissions/rotation/accrual analytics как закрытый вопрос без актуального отрицательного retest.
- Где модели могли ошибаться: предполагаемый масштаб злоупотреблений паузой и выдачей не подтверждён продуктовой статистикой.
- Process theater: ввод лимитов, дополнительных согласований и новых сущностей без наблюдаемого риска или acceptance value.
- Главный остаточный риск: начать пилот на owner-confirmed и static packet, не дождавшись runtime proof изоляции и денег.

## 9. Proof refs

- `reports/six-global-goals-external-expert-review-prompt-2026-07-14.md`
- `reports/external-review-runtime/gemini-review-raw-2026-07-14.txt`
- `reports/external-review-runtime/grok-review-raw-2026-07-14.txt`
- `C:\Users\alexe\OneDrive\Документы\Confideline\reports\six-global-goals-revalidated-plan-2026-07-12.md`
- `.ops/codex-head/projects/memory/confideline/source-audit-2026-07-08.md`
- `.ops/codex-head/projects/memory/confideline/progress-ledger.md`
