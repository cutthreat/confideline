[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$panelRoot = Join-Path (Split-Path (Split-Path $root -Parent) -Parent) 'web\qa-reports\nebula-6-goals-master-plan-2026-06-11'

$paths = @{
    Pm = Join-Path $root 'etalon-tz-g2-4-agent-compensation.md'
    Html = Join-Path $root 'tz-g2-4-for-igor.html'
    Docx = Join-Path $root 'tz-g2-4-for-igor.docx'
    Codex = Join-Path $root 'codex-context-g2-4-agent-compensation.md'
    G2 = Join-Path $root 'tz-g2-billing-refunds-compensation.md'
    Vertical = Join-Path $root 'vertical-package-session-money.md'
    Admin = Join-Path $root 'admin-panel-settings-development-package.md'
    Owner = Join-Path $root 'owner-decisions.md'
    Proposal = Join-Path $root 'owner-enablements-pilot-defaults-proposal.md'
    Panel = Join-Path $panelRoot 'task-tz.html'
    Index = Join-Path $panelRoot 'index.html'
    Task = Join-Path $panelRoot 'tasks\task-g2-accruals.html'
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
$vertical = Get-Content -Raw -LiteralPath $paths.Vertical
$admin = Get-Content -Raw -LiteralPath $paths.Admin
$owner = Get-Content -Raw -LiteralPath $paths.Owner
$proposal = Get-Content -Raw -LiteralPath $paths.Proposal
$panel = Get-Content -Raw -LiteralPath $paths.Panel
$index = Get-Content -Raw -LiteralPath $paths.Index
$task = Get-Content -Raw -LiteralPath $paths.Task
$html = Get-Content -Raw -LiteralPath $paths.Html

$pmHeadings = @(
    '## 1. Цель',
    '## 2. Место G2.4 в общем продукте',
    '## 3. Термины',
    '## 4. Роли и видимость',
    '## 5. Обязательные invariants',
    '## 6. Стартовая compensation policy',
    '## 7. Формула начисления',
    '## 8. Пример расчета',
    '## 9. Момент создания начисления',
    '## 10. Hold и доступность к выплате',
    '## 11. Расчетный период',
    '## 12. Статусы начисления',
    '## 13. Refund и negative correction',
    '## 14. Другие удержания',
    '## 15. Ручная correction',
    '## 16. Фактическая выплата',
    '## 17. Existing partner pages - обязательное переиспользование',
    '## 18. Новые административные поверхности',
    '## 19. Global, group и Agent override',
    '## 20. Fixed/SLA component',
    '## 21. Additional-task pay',
    '## 22. Snapshots и audit',
    '## 23. Уведомления и readback',
    '## 24. Ошибки, retry и concurrency',
    '## 25. Критерии готового результата',
    '## 26. Действия Игоря'
)
foreach ($heading in $pmHeadings) {
    Add-Check "pm-heading:$heading" $pm.Contains($heading) 'required PM section'
}

foreach ($number in 1..33) {
    Add-Check "codex-heading:$number" $codex.Contains("## $number.") 'required Codex section'
}

$requiredPmConcepts = @(
    'Стартовое значение - **30%**',
    '**1 credit = 0.1665 USD**',
    '**7 календарных дней**',
    '**еженедельно, понедельник-воскресенье**',
    'Каждый source toggle включается и выключается независимо',
    'Purchased credits',
    'Welcome credits',
    'Trial credits/minutes',
    'Promo credits',
    'Compensation credits клиента',
    'Refunded/erroneous/reversed credits',
    'неизвестный источник credits обрабатывается fail-closed',
    'Автоматический банковский перевод в MVP запрещен',
    'Fixed/SLA и additional-task components по умолчанию `disabled`',
    '/ru/admin/agent-compensation/index',
    '/ru/admin/settings/agent-compensation',
    '/ru/admin/partner/payment-info?id={agentId}',
    '/ru/admin/partner/payments?id={agentId}',
    '/ru/admin/partner/payouts?id={agentId}',
    '/ru/admin/partner/payments?id={agentId}&mode=minus',
    'Premium, gifts, spotlight',
    'переносится в следующий расчетный период'
)
foreach ($phrase in $requiredPmConcepts) {
    Add-Check "pm-concept:$phrase" $pm.Contains($phrase) 'required owner decision'
}

Add-Check 'formula:30-percent' (
    $pm.Contains('eligible_credits × compensation_percentage') -and
    $pm.Contains('300 eligible credits') -and
    $pm.Contains('compensation credits: 90')
) 'formula and worked example'

Add-Check 'conversion:snapshot' (
    $pm.Contains('conversion rate') -and
    $pm.Contains('0.1665') -and
    $codex.Contains('currency/rate snapshot')
) 'conversion is versioned'

Add-Check 'sources:independent' (
    $pm.Contains('Каждый source toggle включается и выключается независимо') -and
    $codex.Contains('source.purchased = true') -and
    $codex.Contains('source.trial = true')
) 'source categories are separately managed'

Add-Check 'trigger:immediate-hold' (
    $pm.Contains('Consultation accrual создается сразу') -and
    $pm.Contains('Ожидает окончания hold') -and
    $codex.Contains('status `pending_hold`')
) 'immediate accrual is separate from payout availability'

Add-Check 'period:weekly' (
    $pm.Contains('weekly;') -and
    $pm.Contains('понедельник 00:00 - воскресенье 23:59') -and
    $codex.Contains('Monday 00:00 through Sunday 23:59')
) 'weekly period is explicit'

Add-Check 'refund:append-only' (
    $pm.Contains('исходное начисление остается неизменным') -and
    $pm.Contains('переносится в следующий расчетный период') -and
    $codex.Contains('Never mutate historical payout')
) 'refund correction preserves history'

Add-Check 'payout:manual-only' (
    $pm.Contains('Автоматическая платежная интеграция не входит в MVP') -and
    $pm.Contains('Отметить выплаченным') -and
    $codex.Contains('it does not send money')
) 'payout is a manual record'

Add-Check 'legacy-minus:separated' (
    $pm.Contains('Premium, gifts, spotlight') -and
    $pm.Contains('не являются зарплатным удержанием') -and
    $codex.Contains('legacy_partner_balance_spend')
) 'legacy spending cannot reduce compensation'

Add-Check 'reuse:existing-partner-pages' (
    $pm.Contains('G2.4 не создает вторые карточки тех же фактов') -and
    $codex.Contains('Extend current payout list') -and
    $admin.Contains('/ru/admin/partner/payment-info?id={id}')
) 'existing admin surfaces are reused'

Add-Check 'placement:operations-vs-settings' (
    $pm.Contains('Финансы -> Вознаграждение агентов') -and
    $pm.Contains('Настройки -> Настройки вознаграждений') -and
    $pm.Contains('Операционные начисления и выплаты на странице настроек не размещаются')
) 'operations and configuration are separated'

Add-Check 'roles:superadmin-first' (
    $pm.Contains('только super-admin') -and
    $codex.Contains('Agent/Expert/Client: denied')
) 'initial RBAC is explicit'

Add-Check 'fixed-task:disabled' (
    $pm.Contains('component стартует `disabled`') -and
    $codex.Contains('fixed_sla.active = false') -and
    $codex.Contains('task_pay.active = false')
) 'additional components stay disabled'

Add-Check 'source:live-facts-bounded' (
    $codex.Contains('Live admin facts verified 2026-07-28') -and
    $codex.Contains('current UI/runtime facts, not proof of underlying source shape') -and
    $codex.Contains('actual runtime repository/build')
) 'live facts do not overclaim source mapping'

Add-Check 'idempotency:covered' (
    $codex.Contains('consultation_component + session_id + terminal_completion_revision') -and
    $codex.Contains('duplicate refund execution') -and
    $codex.Contains('two payout confirmations')
) 'idempotency and concurrency covered'

Add-Check 'acceptance:counts' (
    (
        ([regex]::Matches($pm, '(?m)^\d+\. ')).Count +
        ([regex]::Matches($pm, '(?m)^Шаг \d+\. ')).Count
    ) -ge 68 -and
    $codex.Contains('| AC34 |')
) 'product and technical acceptance are substantial'

Add-Check 'owner:o4-accepted' (
    $owner.Contains('`owner_decision_accepted_2026-07-28`') -and
    $owner.Contains('Consultation percentage в limited pilot - 30%') -and
    $owner.Contains('payment-info`, `payments`, `payouts`')
) 'owner decision durable'

Add-Check 'proposal:o4-accepted' (
    $proposal.Contains('## O4. Compensation — принято 2026-07-28') -and
    $proposal.Contains('Conversion rate: 0.1665 USD')
) 'pilot proposal normalized'

Add-Check 'g2:umbrella-aligned' (
    $g2.Contains('etalon-tz-g2-4-agent-compensation.md') -and
    $g2.Contains('Стартовый consultation percentage - 30%') -and
    $g2.Contains('/ru/admin/agent-compensation/index')
) 'G2 umbrella uses final decisions'

Add-Check 'vertical:aligned' (
    $vertical.Contains('30% от включенных credit sources') -and
    $vertical.Contains('Existing partner payments/payouts/minus/payment-info')
) 'session-money vertical updated'

Add-Check 'admin:aligned' (
    $admin.Contains('consultation percentage - 30%') -and
    $admin.Contains('/ru/admin/settings/agent-compensation') -and
    $admin.Contains('legacy balance spending')
) 'admin development package updated'

Add-Check 'html:title' $html.Contains('G2.4 «Начисления и выплаты Агентам»') 'human-readable HTML generated'
Add-Check 'docx:nonempty' ((Get-Item -LiteralPath $paths.Docx).Length -gt 10000) 'DOCX generated'

Add-Check 'panel:artifact-mapping' (
    $panel.Contains('tz-g2-4-for-igor.html') -and
    $panel.Contains('codex-context-g2-4-agent-compensation.md') -and
    $panel.Contains('tz-g2-4-for-igor.docx')
) 'both handoff types and DOCX mapped'

Add-Check 'panel:spec-ready' (
    $panel.Contains('tasks["task-g2-accruals"].stage = "etalon_spec_ready_runtime_open"') -and
    $panel.Contains('tasks["task-g2-accruals"].tzReady = 100')
) 'panel separates specification from runtime'

Add-Check 'index:readiness-100' (
    $index.Contains('"task-g2-accruals":100') -and
    $index.Contains('эталонное ТЗ готово')
) 'master list updated'

Add-Check 'task:current' (
    $task.Contains('ТЗ 100% / runtime open') -and
    $task.Contains('0.1665 USD') -and
    $task.Contains('Legacy partner spending не влияет')
) 'task card is current'

$forbiddenPm = @('CREATE TABLE','ALTER TABLE','class ','endpoint /api/','SQL')
foreach ($token in $forbiddenPm) {
    Add-Check "pm-no-implementation:$token" (-not $pm.Contains($token)) 'Igor owns implementation'
}

$qRows = @(
    'Q1. Паспорт и измеримый результат',
    'Q2. Scope, non-goals и зависимости',
    'Q3. Термины, роли и доступ',
    'Q4. Preconditions и triggers',
    'Q5. Состояния и инварианты',
    'Q6. Функциональные сценарии',
    'Q7. Edge/security/idempotency',
    'Q8. Данные, audit и readback',
    'Q9. Пользовательские поверхности',
    'Q10. Acceptance-кейсы',
    'Q11. Programmer handoff',
    'Q12. DoD и proof boundary'
)
foreach ($token in $qRows) {
    Add-Check "panel-standard:$token" $panel.Contains($token) 'standard rubric retained'
}

$failed = @($checks | Where-Object { -not $_.pass })
$result = [pscustomobject]@{
    status = if ($failed.Count -eq 0) { 'pass' } else { 'fail' }
    checks = $checks.Count
    passed = $checks.Count - $failed.Count
    failed = $failed.Count
    failures = $failed
}

$result | ConvertTo-Json -Depth 5
if ($failed.Count -gt 0) { exit 1 }
