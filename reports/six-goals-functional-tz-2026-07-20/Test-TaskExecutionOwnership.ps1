param(
    [switch]$Json
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$repo = Resolve-Path (Join-Path $root '..\..')
$panelRoot = Join-Path $repo 'web\qa-reports\nebula-6-goals-master-plan-2026-06-11'

$checks = [System.Collections.Generic.List[object]]::new()

function Add-Check {
    param(
        [string]$Name,
        [bool]$Pass,
        [string]$Detail
    )
    $checks.Add([pscustomobject]@{
        name = $Name
        pass = $Pass
        detail = $Detail
    })
}

function Read-Utf8 {
    param([string]$Path)
    return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}

$matrixPath = Join-Path $root 'task-execution-ownership-matrix.md'
$standardPath = Join-Path $root 'functional-tz-quality-standard.md'
$deliveryPath = Join-Path $root 'delivery-matrix.md'
$indexPath = Join-Path $panelRoot 'index.html'
$taskTzPath = Join-Path $panelRoot 'task-tz.html'

foreach ($path in @($matrixPath, $standardPath, $deliveryPath, $indexPath, $taskTzPath)) {
    Add-Check "exists:$([System.IO.Path]::GetFileName($path))" (Test-Path -LiteralPath $path) $path
}

$matrix = Read-Utf8 $matrixPath
$standard = Read-Utf8 $standardPath
$delivery = Read-Utf8 $deliveryPath
$index = Read-Utf8 $indexPath
$taskTz = Read-Utf8 $taskTzPath

$taskSection = [regex]::Match(
    $matrix,
    '(?s)## 4\. Матрица 30 задач(?<body>.*?)## 5\. Связанные P0-пакеты'
).Groups['body'].Value

$expectedTasks = [System.Collections.Generic.List[string]]::new()
foreach ($goal in 1..6) {
    $max = if ($goal -eq 3 -or $goal -eq 6) { 7 } else { 4 }
    foreach ($task in 1..$max) {
        $expectedTasks.Add("G$goal.$task")
    }
}

$foundTasks = [regex]::Matches($taskSection, '(?m)^\|\s*(G[1-6]\.\d)\s') |
    ForEach-Object { $_.Groups[1].Value }

Add-Check 'canonical-task-count' ($foundTasks.Count -eq 30) "found=$($foundTasks.Count); expected=30"

foreach ($taskCode in $expectedTasks) {
    $count = @($foundTasks | Where-Object { $_ -eq $taskCode }).Count
    Add-Check "task-once:$taskCode" ($count -eq 1) "count=$count"
}

$unexpected = @($foundTasks | Where-Object { $_ -notin $expectedTasks })
Add-Check 'no-unexpected-task-code' ($unexpected.Count -eq 0) ($unexpected -join ',')

foreach ($linked in @('G2.GEO', 'G3.INT')) {
    $count = [regex]::Matches($matrix, "(?m)^\|\s*$([regex]::Escape($linked))\s").Count
    Add-Check "linked-package-once:$linked" ($count -eq 1) "count=$count"
}

foreach ($class in @('DEV', 'MIXED', 'OPS_FIRST', 'CONTENT_POLICY', 'QA_GATE')) {
    Add-Check "class-present:$class" ($matrix.Contains("``$class``") -and $standard.Contains("``$class``")) $class
}

Add-Check 'standard-role-aware' ($standard.Contains('## 5. Role-aware handoff')) 'role-aware section'
Add-Check 'standard-no-universal-two-file-rule' (-not $standard.Contains('## 5. Обязательный двухфайловый handoff')) 'old universal section absent'
Add-Check 'standard-has-escalation-gate' ($standard.Contains('### 5.5 Gate технической эскалации')) 'technical escalation gate'
Add-Check 'delivery-links-ownership' ($delivery.Contains('task-execution-ownership-matrix.md')) 'delivery routing source'

$g2Geo = Read-Utf8 (Join-Path $root 'etalon-tz-g2-geo-content-restoration.md')
$g35 = Read-Utf8 (Join-Path $root 'etalon-tz-g3-5-client-path-qa.md')
$g36 = Read-Utf8 (Join-Path $root 'etalon-tz-g3-6-profile-completeness.md')
$g3Int = Read-Utf8 (Join-Path $root 'etalon-tz-g3-int-layout-backend-integration.md')
$g3IntCodex = Read-Utf8 (Join-Path $root 'codex-context-g3-int-layout-backend-integration.md')

Add-Check 'g2geo-operator-heading' ($g2Geo.StartsWith('# Операционный пакет G2.GEO')) 'operator-first heading'
Add-Check 'g2geo-live-pilot-current' (
    $g2Geo.Contains('5/5') -and
    $g2Geo.Contains('30/30') -and
    $g2Geo.Contains('controlled before/after RU') -and
    $g2Geo.Contains('полный denominator')
) 'bounded pilot proof and boundary'
Add-Check 'g35-qa-heading' ($g35.StartsWith('# Протокол G3.5')) 'QA gate heading'
Add-Check 'g35-independent-verdict' (
    $g35.Contains('Независимый QA/super-admin') -and
    $g35.Contains('PM единолично выдаёт итоговый')
) 'QA/PM owner split'
Add-Check 'g36-ops-first-heading' ($g36.StartsWith('# Операционно-функциональный пакет G3.6')) 'OPS_FIRST heading'
Add-Check 'g36-gap-only-dev' ($g36.Contains('Игорь получает только подтверждённый gap')) 'gap-only development'

$i18nOwnerPass =
    $g3Int.Contains('G3.INT.I18N') -and
    $g3Int.Contains('moderator/super-admin инвентаризирует') -and
    $g3Int.Contains('Игорь получает только') -and
    $g3IntCodex.Contains('### Owner split') -and
    $g3IntCodex.Contains('Every technical escalation includes route')
Add-Check 'g3int-i18n-moderator-first' $i18nOwnerPass 'inventory/translation/readback before dev gap'

Add-Check 'g43-content-policy-owner' (
    $matrix -match '(?m)^\|\s*G4\.3\b.*`CONTENT_POLICY`.*PM/legal.*moderator'
) 'G4.3 policy/content routing'
Add-Check 'g64-training-policy-owner' (
    $matrix -match '(?m)^\|\s*G6\.4\b.*`CONTENT_POLICY`.*moderator/Ксения'
) 'G6.4 training/admission routing'
Add-Check 'g61-super-admin-only' (
    $matrix -match '(?m)^\|\s*G6\.1\b.*Только super-admin'
) 'assignment protected decision'
Add-Check 'g42-refund-super-admin-only' (
    $matrix -match '(?m)^\|\s*G4\.2\b.*только super-admin'
) 'refund protected decision'

Add-Check 'panel-has-routing-map' (
    $index.Contains('const executionRoutingByTask') -and
    $taskTz.Contains('const executionRoutingByTask')
) 'both panel pages'
Add-Check 'panel-primary-label-role-aware' (
    $index.Contains('Основной документ') -and
    $taskTz.Contains('Основной документ задачи')
) 'role-aware user labels'
Add-Check 'panel-no-universal-description' (
    -not $index.Contains('Для каждой из 30 задач панель теперь содержит два самостоятельных типа документа') -and
    -not $taskTz.Contains('Для каждой задачи доступны два самостоятельных документа')
) 'old blanket copy absent'
Add-Check 'panel-links-ownership-matrix' (
    $index.Contains('task-execution-ownership-matrix.md') -and
    $taskTz.Contains('task-execution-ownership-matrix.md')
) 'ownership matrix linked'

$failed = @($checks | Where-Object { -not $_.pass })
$result = [pscustomobject]@{
    verifier = 'Test-TaskExecutionOwnership'
    status = if ($failed.Count -eq 0) { 'PASS' } else { 'FAIL' }
    passed = $checks.Count - $failed.Count
    failed = $failed.Count
    total = $checks.Count
    failures = $failed
}

if ($Json) {
    $result | ConvertTo-Json -Depth 6
} else {
    $result
}

if ($failed.Count -gt 0) {
    exit 1
}
