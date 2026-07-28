[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$panelRoot = Join-Path (Split-Path (Split-Path $root -Parent) -Parent) 'web\qa-reports\nebula-6-goals-master-plan-2026-06-11'

$paths = @{
    Pm = Join-Path $root 'etalon-tz-g2-1-price-balance.md'
    Html = Join-Path $root 'tz-g2-1-for-igor.html'
    Docx = Join-Path $root 'tz-g2-1-for-igor.docx'
    Codex = Join-Path $root 'codex-context-g2-1-price-balance.md'
    G2 = Join-Path $root 'tz-g2-billing-refunds-compensation.md'
    Vertical = Join-Path $root 'vertical-package-session-money.md'
    Panel = Join-Path $panelRoot 'task-tz.html'
    Index = Join-Path $panelRoot 'index.html'
    Task = Join-Path $panelRoot 'tasks\task-g2-pricing.html'
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
$panel = Get-Content -Raw -LiteralPath $paths.Panel
$index = Get-Content -Raw -LiteralPath $paths.Index
$task = Get-Content -Raw -LiteralPath $paths.Task
$html = Get-Content -Raw -LiteralPath $paths.Html

$pmHeadings = @(
    '## 1. Цель',
    '## 2. Границы G2.1',
    '## 3. Основная продуктовая модель',
    '## 4. Роли и видимость',
    '## 5. Где клиент видит цену и баланс',
    '## 6. Определение цены Эксперта',
    '## 7. Пакеты credits',
    '## 8. Скидки и сочетание правил',
    '## 9. Coupons, бонусы и компенсация',
    '## 10. Баланс и порядок расходования',
    '## 11. Checkout',
    '## 12. Точки пополнения',
    '## 13. Платеж и начисление credits',
    '## 14. Административные поверхности',
    '## 15. Версии, snapshots и audit',
    '## 16. Особые и ошибочные случаи',
    '## 17. Критерии готового результата',
    '## 18. Действия Игоря'
)
foreach ($heading in $pmHeadings) {
    Add-Check "pm-heading:$heading" $pm.Contains($heading) 'required PM section'
}

foreach ($number in 1..24) {
    Add-Check "codex-heading:$number" $codex.Contains("## $number.") 'required Codex section'
}

$requiredPmConcepts = @(
    'Клиент покупает **credits**, а не минуты.',
    '30 credits за начатую минуту',
    '60 credits за 9.99 USD',
    '150 | 24.98 USD | 1.99 USD | 22.99 USD',
    '300 | 49.95 USD | 6.96 USD | 42.99 USD',
    '600 | 99.90 USD | 19.91 USD | 79.99 USD',
    'Стартовый защитный предел общей денежной скидки — 50%',
    'Купленные credits не имеют срока действия',
    'bonus credits с ближайшим сроком окончания',
    '`/ru/admin/settings/prices`',
    '`/ru/admin/settings/coupons`',
    '`Payment systems`',
    'Auto-refill в MVP не входит',
    'Скрытые доплаты запрещены',
    'применимый налог отдельной строкой',
    'не возобновляет завершенную session'
)
foreach ($phrase in $requiredPmConcepts) {
    Add-Check "pm-concept:$phrase" $pm.Contains($phrase) 'required owner decision'
}

Add-Check 'model:credits-not-minutes' (
    $pm.Contains('Клиент покупает **credits**, а не минуты.') -and
    $pm.Contains('доступные полные минуты = floor') -and
    $codex.Contains('Client purchases credits, never a fixed number of minutes') -and
    $codex.Contains('Never store package purchases as fixed minutes')
) 'package discount does not alter expert minute price'

Add-Check 'price:global-profile-snapshot' (
    $pm.Contains('global price') -and
    $pm.Contains('profile override') -and
    $pm.Contains('snapshot') -and
    $codex.Contains('price snapshot')
) 'effective expert price is resolved and frozen per session'

Add-Check 'privacy:agent-no-balance' (
    $pm.Contains('не видит точный баланс') -and
    $codex.Contains('Agent/Expert API/view lacks exact client balance')
) 'expert sees operational state, not financial amount'

Add-Check 'balance:buckets-order-expiry' (
    $pm.Contains('bonus credits с ближайшим сроком окончания') -and
    $pm.Contains('бессрочные купленные credits') -and
    $codex.Contains('Balance buckets and spending')
) 'wallet source and expiry rules are explicit'

Add-Check 'checkout:honest-total' (
    $pm.Contains('subtotal') -and
    $pm.Contains('discount') -and
    $pm.Contains('налог') -and
    $pm.Contains('final USD') -and
    $pm.Contains('совпадать с суммой, переданной платежной системе')
) 'checkout total is transparent and stable'

Add-Check 'payment:idempotent-grant' (
    $pm.Contains('Повтор callback не создает повторное начисление') -and
    $codex.Contains('provider + provider_payment_id') -and
    $codex.Contains('Retry/callback/reload cannot grant credits twice')
) 'payment callback cannot duplicate wallet grant'

Add-Check 'admin:no-duplicate-owners' (
    $codex.Contains('do not create a parallel package editor') -and
    $pm.Contains('существующую систему permissions') -and
    $pm.Contains('существующей карточке пользователя')
) 'existing settings, RBAC and balance surfaces are extended'

$sourceConcepts = @(
    'models/Price.php',
    'models/Balance.php',
    'models/BalanceTransaction.php',
    'models/Order.php',
    'modules/admin/controllers/SettingsController.php',
    'modules/admin/forms/BalanceUpdateForm.php',
    'managers/BalanceManager.php'
)
foreach ($phrase in $sourceConcepts) {
    Add-Check "source:$phrase" $codex.Contains($phrase) 'known source navigation'
}

Add-Check 'concurrency:no-negative-balance' (
    $codex.Contains('Concurrent debit cannot create negative balance') -and
    $pm.Contains('не создает отрицательный баланс')
) 'last-credit race is covered'

Add-Check 'versioning:historical-truth' (
    $pm.Contains('не переписывает session/order/grant') -and
    $codex.Contains('Rollback does not mutate historical snapshots')
) 'admin changes affect only new objects'

Add-Check 'localization:ru-en' (
    $pm.Contains('RU/EN') -and
    $codex.Contains('RU/EN')
) 'current localization scope is explicit'

Add-Check 'g2:umbrella-aligned' (
    $g2.Contains('credit packages') -and
    $g2.Contains('а не минуты') -and
    $g2.Contains('etalon-tz-g2-1-price-balance.md')
) 'G2 umbrella uses the final product model'

Add-Check 'vertical:no-fixed-package-minutes' (
    $vertical.Contains('credits') -and
    -not $vertical.Contains('пакет минут')
) 'cross-goal vertical does not reintroduce fixed package minutes'

Add-Check 'html:title' $html.Contains('G2.1 «Цена, credits и баланс клиента»') 'human-readable HTML generated'
Add-Check 'docx:nonempty' ((Get-Item -LiteralPath $paths.Docx).Length -gt 10000) 'DOCX generated'

Add-Check 'panel:artifact-mapping' (
    $panel.Contains('tz-g2-1-for-igor.html') -and
    $panel.Contains('codex-context-g2-1-price-balance.md') -and
    $panel.Contains('tz-g2-1-for-igor.docx')
) 'both handoff types and DOCX are mapped'

Add-Check 'panel:spec-ready' (
    $panel.Contains('tasks["task-g2-pricing"].stage = "etalon_spec_ready_runtime_open"') -and
    $panel.Contains('tasks["task-g2-pricing"].tzReady = 100')
) 'panel separates specification from runtime'

Add-Check 'index:readiness-100' (
    $index.Contains('"task-g2-pricing":100') -and
    $index.Contains('title:"Цена, credits и баланс"')
) 'master list updated'

Add-Check 'task:current-requirement' (
    $task.Contains('полное продуктовое ТЗ G2.1') -and
    $task.Contains('Клиент покупает credits') -and
    $task.Contains('runtime остаются открыты')
) 'task card shows current specification'

$forbiddenPm = @(
    'CREATE TABLE',
    'ALTER TABLE',
    'class ',
    'migration',
    'SQL',
    'endpoint /api/'
)
foreach ($token in $forbiddenPm) {
    Add-Check "pm-no-implementation:$token" (-not $pm.Contains($token)) 'Igor owns implementation'
}

$qRows = @(
    'Q1. Цель и измеримый результат',
    'Q2. Границы задачи и зависимости',
    'Q3. Роли, права и видимость данных',
    'Q4. Термины, сущности и источники истины',
    'Q5. Пользовательские и административные сценарии',
    'Q6. Бизнес-правила, расчёты и ограничения',
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
    schema = 'functional_tz_g21_verifier.v1'
    status = if ($failed.Count -eq 0) { 'pass' } else { 'fail' }
    passed = $checks.Count - $failed.Count
    total = $checks.Count
    failed = $failed
    artifacts = $paths
}
$result | ConvertTo-Json -Depth 6
if ($failed.Count -gt 0) { exit 1 }
