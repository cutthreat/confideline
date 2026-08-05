# Readiness summary: 30 задач / 6 vertical packets

Дата актуализации: 2026-08-05
Статус требований G1-G3: `15_of_15_etalon_pairs_verified`  
Исторический структурный статус 30 задач: `30_of_30_functional_tz_handoff_ready`  
Статус реализации: `not_runtime_verified / NO_GO`

Последний сквозной аудит G1-G3: `g1-g3-cross-goal-audit-2026-08-05.md`. Межцелевая сверка завершена; региональный fallback для страниц country/city приведён к последнему решению владельца. Runtime-статус намеренно не повышен.

ТЗ считается полным, когда требуемое поведение, правильный тип основного документа, operational/development boundary, зависимости, positive/negative acceptance, rollback и применимый handoff определены. Owner enablement value и runtime proof учитываются отдельно. Историческое покрытие 30/30 означает наличие постановки и vertical ownership; исполнитель определяется `task-execution-ownership-matrix.md`.

Все 30 задач имеют приоритет `P0` шестимесячной программы MVP. Порядок фаз не означает более низкий приоритет. Расширения после MVP находятся только в `post-mvp-backlog-2026-07-29.md` и не входят в эти показатели.

`G2.GEO`, `G3.INT` и `G5.SEO` — обязательные связанные P0 packages вне primary registry. Они не добавляют новые task codes и не меняют показатели `30/30`.

| Задачи | Уровень проверки | ТЗ/handoff | Enablement | Runtime |
|---|---|---|---|---|
| G1.1-G1.4 | эталонный task-level | 4/4 пары + HTML/DOCX, 100% | product decisions closed; legal/runtime gates остаются | open |
| G2.1-G2.4 | эталонный task-level | 4/4 пары + HTML/DOCX, 100% | price/package готовы; compensation economics может быть unset/disabled | open |
| G2.GEO | linked P0 content package | эталонная пара + HTML/DOCX | 5-country text-pilot complete; full rollout планируется отдельно | historical `157 = 39 + 118`, `942` locale pages, `1884` files; финальный pilot proof: `5/5` RU before/after, `30/30` source↔CMS, `5/5` RU visual checks |
| G3.1-G3.7 | эталонный task-level | 7/7 пар + HTML/DOCX, 100% | taxonomy/routes/admin ownership закрыты; brand/legal/O5/KPI enablement остаются gates | open |
| G3.INT | linked P0 implementation package | эталонная пара + HTML/DOCX | source gates fail-closed | open; передаётся в G3.5 |
| G5.SEO | linked P0 launch package | человеческий HTML-план + технический Codex-контекст, 100% | brand/domain/locale, mapped build, G2.GEO/G3/G4.3/G5.1 | plan ready; implementation/crawl/indexing/organic baseline open |
| G4.1-G6.7 | legacy structural + vertical | постановки распределены по packets; повторный аудит текущего стандарта открыт | owner values и release gates ведутся отдельно | open |

## Что можно делать немедленно

G1-G3 можно запускать по проверенным автономным документам и `task-execution-ownership-matrix.md`: operations/content/QA идут своим владельцам, а Игорь получает development scope или evidence-backed gap. Все шесть vertical packets сохраняются как delivery architecture. G2.GEO продолжается moderator-first через fresh inventory, source-first Codex draft, review/publish/admin+public readback/rollback. G5.SEO начинает baseline и admin capability inventory в месяце 1, не ожидая месяца 4. `admin-panel-settings-development-package.md` является mixed subpackage, а не поручением заново разработать все существующие настройки. Unset owner values остаются admin-configurable/disabled state.

## Что нельзя повысить сейчас

- `runtime_verified`, пока нет environment/build marker и positive/negative evidence.
- `G2.GEO full live coverage`, пока свежий inventory не подтвердил каждую активную country/city × locale после template update.
- `G5.SEO runtime/indexed/organic baseline`, пока нет mapped build, full crawl, admin/public/search-system readback и достаточного observation window.
- `accepted`, пока QA и PM не приняли сопоставленную сборку.
- `limited_paid_pilot` и `public traffic`, пока соответствующие owner/pilot gates не закрыты.
