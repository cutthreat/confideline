# Vertical 3: полный клиентский путь limited pilot

Дата: 2026-07-20  
Статус: `requirement_handoff_ready_launch_gate_open_not_runtime_verified`  
Coverage: G1.4, G3.1, G3.2, G3.3, G3.4, G3.5, G3.6, G3.7, G4.1, G4.2, G4.3, G5.1

Для G3.6/G3.7 это primary coverage только обязательного V3 manual minimum; их V5 automation/KPI-scale extensions описаны в public-scale packet как linked scope без второго task ownership.

G6.4 остаётся primary task operations package, но его admission-gate minimum является ранним prerequisite этого V3: до G3.7/G3.5 должны существовать current versioned admission для Agent/profile и fail-closed запрет eligibility/session/debit при missing, stale/expired, failed/blocked или wrong-binding admission.

## Результат

Клиент проходит `витрина/каталог -> профиль -> consent/start -> consultation -> history -> support/refund`, а критические уведомления и event lineage объясняют каждый шаг.

## Обязательный scope

- Честные online/busy/offline/admin-blocked состояния и доступное действие.
- Category/city/multi-city filters без дублей и скрытого расширения результата.
- Profile/start/session credits-per-minute/trial consistency; package money/currency/credits/bonus transparency.
- Positive, negative и concurrent start.
- Critical chat notifications с recipient, dedup и stale-event guard.
- Support case из session, foreign negative, reopen и один dispute -> одна correction.
- Versioned terms/consent, missing/stale rules block paid start.
- G5.1 events сохраняют client/expert/actual-agent/session lineage.
- V3 использует опубликованную `expert_specialization_taxonomy_v2`, manual completeness/blocker input G3.6 и versioned eligibility/manual order G3.7 для всех восьми surfaces при `KPI mode = disabled`.

## Enablement gates

- Отдельный pilot pool не создаётся: pilot profiles проходят через те же versioned G3.6/G3.7 policy records; отсутствие eligible profiles даёт честный empty state.
- Связанный G6.4 prerequisite подтверждён до G3.7/G3.5: `admitted_active` и версии читаются из owner-contour G6.4; V3 не создаёт параллельный admission editor.
- O6 product minimum и R1 refund framework приняты/admin-managed; exact legal/domain client copy/resources и runtime money proof требуются до paid pilot.
- G3.5 остается `NO_GO`, пока все P0 runtime cases не пройдут на одной сборке.

## Acceptance suite

| ID | Сценарий | PASS |
|---|---|---|
| C1 | Online/busy/offline profile | Доступность и действие честны на public/admin preview |
| C2 | City + category + pagination | Нет чужих анкет, дублей и потери фильтра |
| C2A | Taxonomy/completeness/eligibility minimum | Taxonomy v2 опубликована; manual G3.6 input и G3.7 eligibility/order объяснимы на всех восьми surfaces; KPI не влияет |
| C2B | G6.4 admission prerequisite | Current admission допускает дальнейший путь; missing/stale/failed/wrong-binding admission даёт no eligibility/session/debit и NO_GO |
| C3 | Profile -> consent -> start | Credits/minute/trial/rules согласованы; purchase currency не выдана за consultation price |
| C4 | Missing consent/rules/price | Paid start запрещен без debit |
| C5 | Concurrent start | Одна session, проигравшие попытки без денег/состояния |
| C6 | Critical notifications | Нужный recipient, одна доставка/задача, корректный deep link |
| C7 | Support from session | Case связан с session и виден только разрешенным ролям |
| C8 | Duplicate/reopen dispute | Одна обработка либо явно связанная отдельная проблема |
| C9 | Rule version change | Новая session требует актуальное правило, старая хранит прежнее |
| C10 | Event reconciliation | UI/session/money/support совпадают с lineage |
| C11 | Missing/stale event | Не превращается в zero/pass |
| C12 | G3.5 E2E | Единый build evidence packet, иначе NO_GO |

## Stop

P0: недоступная анкета начинает paid; foreign case доступен; consent/rules не совпадают; event lineage теряет actual actor; static page выдана за runtime.

Rollback: только task-local документ и ссылки.
