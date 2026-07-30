[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$panelRoot = Join-Path (Split-Path (Split-Path $root -Parent) -Parent) 'web\qa-reports\nebula-6-goals-master-plan-2026-06-11'

$paths = @{
    Pm = Join-Path $root 'etalon-tz-g2-3-refunds.md'
    Html = Join-Path $root 'tz-g2-3-for-igor.html'
    Docx = Join-Path $root 'tz-g2-3-for-igor.docx'
    Codex = Join-Path $root 'codex-context-g2-3-refunds.md'
    G2 = Join-Path $root 'tz-g2-billing-refunds-compensation.md'
    G4 = Join-Path $root 'tz-g4-support-disputes-rules.md'
    Vertical = Join-Path $root 'vertical-package-session-money.md'
    Admin = Join-Path $root 'admin-panel-settings-development-package.md'
    Owner = Join-Path $root 'owner-decisions.md'
    Panel = Join-Path $panelRoot 'task-tz.html'
    Index = Join-Path $panelRoot 'index.html'
    Task = Join-Path $panelRoot 'tasks\task-g2-refund.html'
}

$checks = [System.Collections.Generic.List[object]]::new()
function Add-Check([string]$Name, [bool]$Pass, [string]$Detail) {
    $checks.Add([pscustomobject]@{ name = $Name; pass = $Pass; detail = $Detail })
}

foreach ($entry in $paths.GetEnumerator()) {
    Add-Check "file:$($entry.Key)" (Test-Path -LiteralPath $entry.Value -PathType Leaf) $entry.Value
}

$pm = Get-Content -Raw -LiteralPath $paths.Pm
$codex = Get-Content -Raw -LiteralPath $paths.Codex
$g2 = Get-Content -Raw -LiteralPath $paths.G2
$g4 = Get-Content -Raw -LiteralPath $paths.G4
$vertical = Get-Content -Raw -LiteralPath $paths.Vertical
$admin = Get-Content -Raw -LiteralPath $paths.Admin
$owner = Get-Content -Raw -LiteralPath $paths.Owner
$panel = Get-Content -Raw -LiteralPath $paths.Panel
$index = Get-Content -Raw -LiteralPath $paths.Index
$task = Get-Content -Raw -LiteralPath $paths.Task
$html = Get-Content -Raw -LiteralPath $paths.Html

$pmHeadings = @(
    '## 1. Цель',
    '## 2. Место G2.3 в общем продукте',
    '## 3. Термины',
    '## 4. Роли и видимость',
    '## 5. Обязательные invariants',
    '## 6. Точки входа клиента',
    '## 7. Создание candidate системой или staff',
    '## 8. Один активный case и связанные дела',
    '## 9. Обязательные данные запроса',
    '## 10. Защищенное evidence',
    '## 11. Статусы refund case',
    '## 12. Срок подачи',
    '## 13. Срок решения',
    '## 14. Категории и базовые правила',
    '## 15. Eligible amount',
    '## 16. No, partial и full decision',
    '## 17. Calculation preview',
    '## 18. Возврат в balance buckets',
    '## 19. Ручное подтверждение и исполнение',
    '## 20. Ошибка исполнения',
    '## 21. Отзыв запроса',
    '## 22. Appeal',
    '## 23. Клиентский readback и уведомления',
    '## 24. Админ-панель',
    '## 25. Snapshots и audit',
    '## 26. Ошибки, retry и concurrency',
    '## 27. Критерии готового результата',
    '## 28. Действия Игоря'
)
foreach ($heading in $pmHeadings) {
    Add-Check "pm-heading:$heading" $pm.Contains($heading) 'required PM section'
}

foreach ($number in 1..32) {
    Add-Check "codex-heading:$number" $codex.Contains("## $number.") 'required Codex section'
}

$requiredPmConcepts = @(
    'Refund case не меняет terminal status consultation.',
    'только super-admin',
    'не более одного активного refund case',
    '30 календарных дней',
    '**72 часа**',
    '**7 календарных дней**',
    'конкретные affected paid minutes',
    'точное количество credits',
    'purchased credits возвращаются в purchased bucket без срока действия',
    'minimum refund-use grace **30 дней**',
    'Refund candidate может появиться',
    'Completed refund нельзя удалить',
    '`/ru/admin/settings/refunds`',
    'после **«Настройки цен»** и перед **«Group settings»**',
    'Cash refund package purchase не исполняется через session refund',
    'In-app уведомление обязательно'
)
foreach ($phrase in $requiredPmConcepts) {
    Add-Check "pm-concept:$phrase" $pm.Contains($phrase) 'required owner decision'
}

Add-Check 'boundary:separate-process' (
    $pm.Contains('Refund case не меняет terminal status consultation') -and
    $codex.Contains('Consultation terminal status never changes') -and
    $g4.Contains('Финансовое действие связано с одной session и одним решением')
) 'refund is not a consultation state'

Add-Check 'case:identity-linked' (
    $pm.Contains('session + category/problem identity') -and
    $codex.Contains('session_id + category + active_problem_key') -and
    $pm.Contains('создается отдельный linked case')
) 'same problem dedup and different problem linkage'

Add-Check 'candidate:no-money' (
    $pm.Contains('Candidate не создает финансовое движение') -and
    $codex.Contains('Candidate does not create decision/execution')
) 'signal is not approval'

Add-Check 'decision:manual-superadmin' (
    $pm.Contains('Любой фактический refund подтверждает только super-admin') -and
    $admin.Contains('every actual refund requires super-admin') -and
    $owner.Contains('Любой actual refund выполняется только вручную super-admin')
) 'manual-only actual refund'

Add-Check 'eligibility:cumulative' (
    $pm.Contains('Суммарный refund не превышает remaining refundable amount') -and
    $codex.Contains('Cumulative refund never exceeds eligible charges')
) 'no over-refund'

Add-Check 'partial:minutes-or-credits' (
    $pm.Contains('конкретные affected paid minutes') -and
    $pm.Contains('точное количество credits') -and
    $codex.Contains('select minute ordinals or exact credits')
) 'partial basis is explicit'

Add-Check 'bucket:source-grace' (
    $pm.Contains('purchased credits возвращаются в purchased bucket без срока действия') -and
    $pm.Contains('minimum refund-use grace **30 дней**') -and
    $codex.Contains('execution time + configured minimum grace')
) 'refund reverses source allocation'

Add-Check 'execution:exactly-once' (
    $pm.Contains('Retry/reload/double click не создают второй refund') -and
    $codex.Contains('refund_case_id + confirmed_decision_version') -and
    $codex.Contains('One logical execution produces one refund result')
) 'financial execution is idempotent'

Add-Check 'failure:case-open' (
    $pm.Contains('case получает `execution_failed`') -and
    $pm.Contains('case и support route остаются открыты') -and
    $codex.Contains('no success message')
) 'failure is recoverable and honest'

Add-Check 'appeal:one-seven-days' (
    $pm.Contains('один раз обжаловать') -and
    $pm.Contains('**7 календарных дней**') -and
    $codex.Contains('Second client appeal is rejected')
) 'appeal contract is explicit'

Add-Check 'admin:placement' (
    $pm.Contains('/ru/admin/settings/index') -and
    $pm.Contains('/ru/admin/settings/refunds') -and
    $admin.Contains('после **«Настройки цен»** и перед **«Group settings»**')
) 'settings live in existing settings list'

Add-Check 'admin:not-case-queue' (
    $pm.Contains('Настройки не используются как очередь cases') -and
    $codex.Contains('Settings page is never a case queue')
) 'configuration and operations are separated'

$sourceConcepts = @(
    'ServiceSessionRefundCase.php',
    'ServiceSessionRefundLedger.php',
    'm260615_235000_service_session_refund_ledger.php',
    'ServiceSessionLedgerEntry.php',
    'ServiceSession.php',
    'ServiceSessionStateMachine.php',
    'BalanceTransaction.php',
    'BalanceManager.php',
    'SUPPORT_TICKET_UI_CONTRACT.md'
)
foreach ($phrase in $sourceConcepts) {
    Add-Check "source:$phrase" $codex.Contains($phrase) 'known source navigation'
}

Add-Check 'source:incompatibilities' (
    $codex.Contains('disputed/refunded') -and
    $codex.Contains('unique index') -and
    $codex.Contains('violates the product boundary')
) 'local slice conflicts are called out'

Add-Check 'source:not-runtime-proof' (
    $codex.Contains('code-present/unmapped navigation') -and
    $codex.Contains('not runtime proof')
) 'source/prototype are not overclaimed'

Add-Check 'g2:umbrella-aligned' (
    $g2.Contains('etalon-tz-g2-3-refunds.md') -and
    $g2.Contains('decision target - 72 часа') -and
    $g2.Contains('minimum refund-use grace 30 дней')
) 'G2 umbrella uses final decisions'

Add-Check 'vertical:aligned' (
    $vertical.Contains('отдельный session-linked refund case') -and
    $vertical.Contains('| M28 | Client appeal')
) 'cross-goal vertical updated'

Add-Check 'owner:o13' (
    $owner.Contains('## O13. Полный продуктовый контракт G2.3') -and
    $owner.Contains('/ru/admin/settings/refunds') -and
    $owner.Contains('decision target - 72 часа')
) 'owner decisions durable'

Add-Check 'html:title' $html.Contains('G2.3 «Возвраты по консультации»') 'human-readable HTML generated'
Add-Check 'docx:nonempty' ((Get-Item -LiteralPath $paths.Docx).Length -gt 10000) 'DOCX generated'

Add-Check 'panel:artifact-mapping' (
    $panel.Contains('tz-g2-3-for-igor.html') -and
    $panel.Contains('codex-context-g2-3-refunds.md') -and
    $panel.Contains('tz-g2-3-for-igor.docx')
) 'both handoff types and DOCX mapped'

Add-Check 'panel:spec-ready' (
    $panel.Contains('tasks["task-g2-refund"].stage = "etalon_spec_ready_runtime_open"') -and
    $panel.Contains('tasks["task-g2-refund"].tzReady = 100')
) 'panel separates specification from runtime'

Add-Check 'index:readiness-100' (
    $index.Contains('"task-g2-refund":100') -and
    $index.Contains('все задачи G1.1–G3.7 имеют автономные пары PM-ТЗ и Codex-контекста')
) 'master list updated'

Add-Check 'task:current' (
    $task.Contains('отдельный refund process') -and
    $task.Contains('ТЗ 100% / runtime не принят') -and
    -not $task.Contains('<b>Проверено локально:</b>')
) 'task card is current without false runtime claim'

$forbiddenPm = @('CREATE TABLE','ALTER TABLE','class ','SQL','endpoint /api/')
foreach ($token in $forbiddenPm) {
    Add-Check "pm-no-implementation:$token" (-not $pm.Contains($token)) 'Igor owns implementation'
}

$qRows = @(
    'Q1. Цель и измеримый результат',
    'Q2. Границы задачи и зависимости',
    'Q3. Роли, права и видимость данных',
    'Q4. Термины, сущности и источники истины',
    'Q5. Пользовательские и административные сценарии',
    'Q6. Бизнес-правила, расчеты и ограничения',
    'Q7. Состояния, ошибки и пограничные случаи',
    'Q8. Настройки админ-панели и их размещение',
    'Q9. Уведомления, локализация и отображение',
    'Q10. Acceptance criteria и тестовые примеры',
    'Q11. Интеграции, данные, безопасность и audit',
    'Q12. Definition of Done и граница доказательств',
    '**100/100**'
)
foreach ($row in $qRows) {
    Add-Check "codex-score:$row" $codex.Contains($row) '12-dimension standard'
}

$failed = @($checks | Where-Object { -not $_.pass })
$result = [pscustomobject]@{
    schema = 'functional_tz_g23_verifier.v1'
    status = if ($failed.Count -eq 0) { 'pass' } else { 'fail' }
    passed = $checks.Count - $failed.Count
    total = $checks.Count
    failed = $failed
    artifacts = $paths
}
$result | ConvertTo-Json -Depth 6
if ($failed.Count -gt 0) { exit 1 }
