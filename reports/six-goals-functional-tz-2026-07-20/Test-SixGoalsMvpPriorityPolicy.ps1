[CmdletBinding()]
param(
    [switch]$Json
)

$ErrorActionPreference = 'Stop'

$reportRoot = $PSScriptRoot
$projectRoot = (Resolve-Path (Join-Path $reportRoot '..\..')).Path
$panelRoot = Join-Path $projectRoot 'web\qa-reports\nebula-6-goals-master-plan-2026-06-11'

$paths = [ordered]@{
    index = Join-Path $panelRoot 'index.html'
    taskDetails = Join-Path $panelRoot 'task-details.html'
    backlog = Join-Path $reportRoot 'post-mvp-backlog-2026-07-29.md'
    readme = Join-Path $reportRoot 'README.md'
    delivery = Join-Path $reportRoot 'delivery-matrix.md'
    owner = Join-Path $reportRoot 'owner-decisions.md'
    readiness = Join-Path $reportRoot 'readiness-summary.md'
    vertical5 = Join-Path $reportRoot 'vertical-package-public-scale.md'
    g24pm = Join-Path $reportRoot 'etalon-tz-g2-4-agent-accruals.md'
    g24codex = Join-Path $reportRoot 'codex-context-g2-4-agent-accruals.md'
    g24html = Join-Path $reportRoot 'tz-g2-4-for-igor.html'
    g34pm = Join-Path $reportRoot 'etalon-tz-g3-4-matching-start.md'
    g34codex = Join-Path $reportRoot 'codex-context-g3-4-matching-start.md'
    g34html = Join-Path $reportRoot 'tz-g3-4-for-igor.html'
}

$archiveTaskFiles = @(
    'task-g2-accruals.html',
    'task-g3-quiz.html',
    'task-g4-support-notifications.html',
    'task-g5-kpi.html',
    'task-g6-team-notifications.html'
) | ForEach-Object { Join-Path $panelRoot "tasks\$_" }

$checks = [System.Collections.Generic.List[object]]::new()

function Add-Check {
    param(
        [string]$Name,
        [bool]$Passed,
        [string]$Evidence
    )
    $checks.Add([pscustomobject]@{
        name = $Name
        passed = $Passed
        evidence = $Evidence
    })
}

foreach ($entry in $paths.GetEnumerator()) {
    Add-Check "file_exists_$($entry.Key)" (Test-Path -LiteralPath $entry.Value -PathType Leaf) $entry.Value
}
foreach ($file in $archiveTaskFiles) {
    Add-Check "archive_exists_$([IO.Path]::GetFileNameWithoutExtension($file))" (Test-Path -LiteralPath $file -PathType Leaf) $file
}

if (($checks | Where-Object { -not $_.passed }).Count -eq 0) {
    $index = Get-Content -LiteralPath $paths.index -Raw -Encoding UTF8
    $taskDetails = Get-Content -LiteralPath $paths.taskDetails -Raw -Encoding UTF8
    $backlog = Get-Content -LiteralPath $paths.backlog -Raw -Encoding UTF8
    $readme = Get-Content -LiteralPath $paths.readme -Raw -Encoding UTF8
    $delivery = Get-Content -LiteralPath $paths.delivery -Raw -Encoding UTF8
    $owner = Get-Content -LiteralPath $paths.owner -Raw -Encoding UTF8
    $readiness = Get-Content -LiteralPath $paths.readiness -Raw -Encoding UTF8
    $vertical5 = Get-Content -LiteralPath $paths.vertical5 -Raw -Encoding UTF8

    $taskMetaMatch = [regex]::Match(
        $index,
        'const taskMeta = \{(?<body>.*?)\r?\n\s*\};',
        [Text.RegularExpressions.RegexOptions]::Singleline
    )
    Add-Check 'task_meta_block_found' $taskMetaMatch.Success 'const taskMeta block'

    if ($taskMetaMatch.Success) {
        $taskMeta = $taskMetaMatch.Groups['body'].Value
        $taskCount = [regex]::Matches($taskMeta, '(?m)^\s*"task-[^"]+":\s*\{').Count
        $p0Count = [regex]::Matches($taskMeta, 'priority:"P0"').Count
        $nonP0Count = [regex]::Matches($taskMeta, 'priority:"P[1-9]"').Count
        Add-Check 'canonical_task_count_30' ($taskCount -eq 30) "task_count=$taskCount"
        Add-Check 'canonical_p0_count_30' ($p0Count -eq 30) "p0_count=$p0Count"
        Add-Check 'canonical_no_lower_priority' ($nonP0Count -eq 0) "non_p0_count=$nonP0Count"
        Add-Check 'canonical_g2geo_not_primary' (-not ($taskMeta -match '"task-g2-geo-content"')) 'G2.GEO stays outside the canonical taskMeta registry'
    }

    Add-Check 'panel_policy_visible' (($index -match 'Все 30 задач — P0') -and ($index -match 'отдельный список «После MVP»')) 'P0-only policy and separate list'
    Add-Check 'panel_backlog_linked' ($index -match 'post-mvp-backlog-2026-07-29\.md') 'post-MVP link'
    Add-Check 'panel_g3int_separate_p0' (($index -match 'code:"G3\.INT"') -and ($index -match 'priority:"P0"') -and ($index -match 'не входит в 30')) 'G3.INT boundary'
    Add-Check 'panel_g2geo_separate_p0' (($index -match 'id:"task-g2-geo-content"') -and ($index -match 'code:"G2\.GEO"') -and ($index -match 'priority:"P0"') -and ($index -match 'вне реестра 30')) 'G2.GEO P0 implementation package boundary'

    Add-Check 'backlog_excluded_from_counts' (($backlog -match 'не входит в 30 канонических задач') -and ($backlog -match 'не влияет на проценты')) 'count boundary'
    $backlogItemCount = [regex]::Matches($backlog, '(?m)^\| PM-\d{2} \|').Count
    Add-Check 'backlog_has_bounded_items' ($backlogItemCount -ge 10) "items=$backlogItemCount"
    Add-Check 'backlog_has_reentry_rule' ($backlog -match 'Как вернуть элемент после MVP') 're-entry contract'

    foreach ($docKey in @('g24pm','g24codex','g34pm','g34codex','g24html','g34html')) {
        $content = Get-Content -LiteralPath $paths[$docKey] -Raw -Encoding UTF8
        Add-Check "${docKey}_priority_p0" ($content -match '(Приоритет|Priority):\s*(<code>)?`?P0') 'P0 metadata'
    }

    Add-Check 'g24_mvp_boundary' ((Get-Content -LiteralPath $paths.g24pm -Raw -Encoding UTF8) -match 'Граница P0 для MVP') 'consultation slice'
    Add-Check 'g34_mvp_boundary' ((Get-Content -LiteralPath $paths.g34pm -Raw -Encoding UTF8) -match 'Граница P0 для MVP') 'direct and rule-based start slice'

    Add-Check 'task_details_no_lower_badges' (-not ($taskDetails -match 'class="badge p[12]"')) 'archive detail badges'
    foreach ($file in $archiveTaskFiles) {
        $content = Get-Content -LiteralPath $file -Raw -Encoding UTF8
        Add-Check "archive_p0_$([IO.Path]::GetFileNameWithoutExtension($file))" (($content -match 'class="badge p0">P0') -and -not ($content -match 'class="badge p[12]"')) $file
    }

    Add-Check 'readme_policy' (($readme -match 'Все 30 задач') -and ($readme -match 'post-mvp-backlog-2026-07-29\.md')) 'README contract'
    Add-Check 'owner_policy' (($owner -match 'D0\. Шесть целей') -and ($owner -match 'owner_decision_accepted_2026-07-29')) 'owner decision'
    Add-Check 'delivery_policy' (($delivery -match 'Все 30 строк G1\.1-G6\.7') -and ($delivery -match 'post-mvp-backlog-2026-07-29\.md')) 'delivery contract'
    Add-Check 'readiness_policy' (($readiness -match 'Все 30 задач имеют приоритет `P0`') -and ($readiness -match 'post-mvp-backlog-2026-07-29\.md')) 'readiness contract'
    Add-Check 'vertical5_mvp_only' (($vertical5 -match 'P0 MVP') -and ($vertical5 -match 'post-mvp-backlog-2026-07-29\.md') -and -not ($vertical5 -match 'Linked V5 scale extensions')) 'vertical scope'
}

$failed = @($checks | Where-Object { -not $_.passed })
$summary = [pscustomobject]@{
    status = if ($failed.Count -eq 0) { 'PASS' } else { 'FAIL' }
    pass = @($checks | Where-Object passed).Count
    fail = $failed.Count
    total = $checks.Count
    checks = $checks
}

if ($Json) {
    $summary | ConvertTo-Json -Depth 5
} else {
    Write-Output "$($summary.status) $($summary.pass)/$($summary.total)"
    if ($failed.Count -gt 0) {
        $failed | ForEach-Object { Write-Output "FAIL $($_.name): $($_.evidence)" }
    }
}

if ($failed.Count -gt 0) {
    exit 1
}
