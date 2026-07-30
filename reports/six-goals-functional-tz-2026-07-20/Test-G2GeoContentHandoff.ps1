[CmdletBinding()]
param(
    [switch]$Json
)

$ErrorActionPreference = 'Stop'

$reportRoot = $PSScriptRoot
$projectRoot = (Resolve-Path (Join-Path $reportRoot '..\..')).Path
$panelRoot = Join-Path $projectRoot 'web\qa-reports\nebula-6-goals-master-plan-2026-06-11'

$paths = [ordered]@{
    pm = Join-Path $reportRoot 'etalon-tz-g2-geo-content-restoration.md'
    codex = Join-Path $reportRoot 'codex-context-g2-geo-content-restoration.md'
    html = Join-Path $reportRoot 'tz-g2-geo-content-for-igor.html'
    docx = Join-Path $reportRoot 'tz-g2-geo-content-for-igor.docx'
    index = Join-Path $panelRoot 'index.html'
    taskPanel = Join-Path $panelRoot 'task-tz.html'
    target = Join-Path $reportRoot 'target-site-vision-g1-g3.md'
    current = Join-Path $reportRoot 'current-site-state-g1-g3-2026-07-29.md'
    routeMatrix = Join-Path $reportRoot 'g1-g3-route-and-admin-ownership-matrix.md'
    documentationMatrix = Join-Path $reportRoot 'g1-g3-documentation-matrix.md'
    deliveryMatrix = Join-Path $reportRoot 'delivery-matrix.md'
    readme = Join-Path $reportRoot 'README.md'
    readiness = Join-Path $reportRoot 'readiness-summary.md'
}

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

function Read-Text {
    param([string]$Path)
    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        return Get-Content -LiteralPath $Path -Raw -Encoding UTF8
    }
    return ''
}

function Get-FileLength {
    param([string]$Path)
    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        return (Get-Item -LiteralPath $Path).Length
    }
    return 0
}

foreach ($entry in $paths.GetEnumerator()) {
    Add-Check "file_exists_$($entry.Key)" (Test-Path -LiteralPath $entry.Value -PathType Leaf) $entry.Value
}

$pm = Read-Text $paths.pm
$codex = Read-Text $paths.codex
$html = Read-Text $paths.html
$index = Read-Text $paths.index
$taskPanel = Read-Text $paths.taskPanel
$target = Read-Text $paths.target
$current = Read-Text $paths.current
$routeMatrix = Read-Text $paths.routeMatrix
$documentationMatrix = Read-Text $paths.documentationMatrix
$deliveryMatrix = Read-Text $paths.deliveryMatrix
$readme = Read-Text $paths.readme
$readiness = Read-Text $paths.readiness
$pair = $pm + "`n" + $codex

Add-Check 'pm_substantial' ($pm.Length -gt 30000) "length=$($pm.Length)"
Add-Check 'codex_substantial' ($codex.Length -gt 26000) "length=$($codex.Length)"
Add-Check 'html_substantial' ((Get-FileLength $paths.html) -gt 25000) "bytes=$(Get-FileLength $paths.html)"
Add-Check 'docx_substantial' ((Get-FileLength $paths.docx) -gt 15000) "bytes=$(Get-FileLength $paths.docx)"

Add-Check 'pm_title' ($pm -match '^# (ТЗ для Игоря — G2\.GEO|Операционный пакет G2\.GEO)') 'canonical PM title'
Add-Check 'codex_title' ($codex -match '^# (Технический контекст G2\.GEO|Технический и диагностический контекст G2\.GEO)') 'canonical Codex title'
Add-Check 'priority_p0' (($pm -match 'P0 implementation package') -and ($codex -match 'Приоритет:\s*`P0`')) 'P0 package'
Add-Check 'not_g25' ($pair -match 'не G2\.5') 'not a G2.5 functional task'
Add-Check 'outside_canonical_30' (($pm -match 'не меняет канонический реестр 30') -and ($codex -match 'не 31-я строка')) 'outside canonical 30 tasks'

Add-Check 'current_coverage_unknown_pm' ($pm -match 'live_content_coverage\s*=\s*unknown_after_template_update') 'PM truth status'
Add-Check 'current_coverage_unknown_codex' ($codex -match 'live_content_coverage\s*=\s*unknown_after_template_update') 'Codex truth status'
Add-Check 'historical_counts_pm' (($pm -match '\b39\b.+стран') -and ($pm -match '\b118\b.+город') -and ($pm -match '\b157\b.+страниц') -and ($pm -match '\b942\b') -and ($pm -match '\b1884\b')) '39/118/157/942/1884'
Add-Check 'historical_counts_codex' (($codex -match '\|\s*Country pages\s*\|\s*39\s*\|') -and ($codex -match '\|\s*City pages\s*\|\s*118\s*\|') -and ($codex -match '\|\s*Всего pages\s*\|\s*157\s*\|') -and ($codex -match '\|\s*Locale pages\s*\|\s*942\s*\|') -and ($codex -match '\|\s*Expected/existing TXT files\s*\|\s*1884 / 1884\s*\|')) '39/118/157/942/1884'
Add-Check 'partial_restore_evidence_pm' (($pm -match '\b180\b') -and ($pm -match '30/30|30 из 30')) '30 pages / 180 locale pages historical partial proof'
Add-Check 'partial_restore_evidence_codex' (($codex -match '\b180\b') -and ($codex -match '30/30|30 из 30')) '30 pages / 180 locale pages historical partial proof'
Add-Check 'partial_not_full_acceptance' (($pair -match 'не подтвержда(ет|ют).{0,160}полнот|does not prove.{0,160}full') -and ($pair -match '\b180\b') -and ($pair -match '30/30|30 из 30')) 'partial proof is not full current acceptance'

Add-Check 'source_first_contract' (($pm -match 'source-пакет.+restore/adapt|restore/adapt.+source-пакет') -and ($codex -match 'source-first rule')) 'restore/adapt before generate-missing'
Add-Check 'no_auto_publish' (($pm -match 'автоматическая публикация сгенерированного AI-текста') -and ($codex -match 'no-auto-publish rule|cannot auto-publish')) 'Codex output is draft only'
Add-Check 'dynamic_denominator' (($pm -match 'denominator определяется свежим') -and ($codex -match 'current CMS inventory|current inventory')) 'fresh CMS denominator'
Add-Check 'admin_routes' (($pair -match '/ru/admin/country/index') -and ($pair -match '/ru/admin/geoname/index') -and ($pair -match '/ru/admin/country/update\?id=') -and ($pair -match '/ru/admin/geoname/update\?id=') -and ($pair -match '/\{lang\}/admin/geo-content/index')) 'existing editors plus geo content operations page'
Add-Check 'state_machine' (($pair -match '`missing`') -and ($pair -match '`source_ready`') -and ($pair -match '`draft`') -and ($pair -match '`review_required`') -and ($pair -match '`approved`') -and ($pair -match '`publish_queued`') -and ($pair -match '`published`') -and ($pair -match '`verified`')) 'content lifecycle states'
Add-Check 'failure_states' (($pair -match '`blocked_source`') -and ($pair -match '`validation_failed`') -and ($pair -match '`publish_failed`') -and ($pair -match '`rollback_required`')) 'failure states'
Add-Check 'failure_taxonomy' (($codex -match 'SOURCE_CONFLICT') -and ($codex -match 'VALIDATION_FORMAT') -and ($codex -match 'VALIDATION_LOCALE') -and ($codex -match 'REVISION_CONFLICT')) 'bounded failure taxonomy'
Add-Check 'template_regression_guard_pm' (($pm -match 'регресс|regression') -and ($pm -match 'шаблон|template') -and ($pm -match 'pre.?/?.?post|до и после|hash|хеш')) 'template migration pre/post preservation guard'
Add-Check 'template_regression_guard_codex' (($codex -match 'регресс|regression') -and ($codex -match 'шаблон|template') -and ($codex -match 'pre.?/?.?post|до и после|hash|хеш')) 'template migration pre/post preservation guard'

$pmCases = ([regex]::Matches($pm, '\| G2G-P\d{2} \|')).Count
$codexCases = ([regex]::Matches($codex, '\| G2G-A\d{2} \|')).Count
Add-Check 'pm_36_acceptance_cases' ($pmCases -eq 36) "count=$pmCases"
Add-Check 'codex_48_acceptance_cases' ($codexCases -eq 48) "count=$codexCases"
Add-Check 'last_pm_case' ($pm -match '\| G2G-P36 \|') 'G2G-P36 present'
Add-Check 'last_codex_case' ($codex -match '\| G2G-A48 \|') 'G2G-A48 present'

Add-Check 'pm_no_architecture_prescription' (-not ($pm -match '(?im)\bCREATE TABLE\b|\bSELECT \* FROM\b|\bclass\s+\w+Controller\b|\bREST endpoint\b')) 'implementation remains Igor-owned'
Add-Check 'panel_package_card' (($index -match 'implementationPackage') -and ($index -match 'id:"task-g2-geo-content"') -and ($index -match 'code:"G2\.GEO"') -and ($index -match 'priority:"P0"') -and ($index -match 'вне реестра 30')) 'master panel package'
Add-Check 'panel_pair_links' (($taskPanel -match 'tz-g2-geo-content-for-igor\.html') -and ($taskPanel -match 'codex-context-g2-geo-content-restoration\.md') -and ($taskPanel -match 'tz-g2-geo-content-for-igor\.docx')) 'task panel artifacts'
Add-Check 'panel_source_map' (($taskPanel -match '"task-g2-geo-content":"\.\./\.\./\.\./reports/.+etalon-tz-g2-geo-content-restoration\.md"') -and ($taskPanel -match 'implementationPackageSourceByTask')) 'implementation package source'
Add-Check 'panel_score_100' ($taskPanel -match '"task-g2-geo-content": \[5,8,10,7,12,12,12,8,6,12,5,3\]') '12-criteria vector'
Add-Check 'panel_runtime_honest' ((($index -match 'фактический denominator и live coverage должны быть измерены заново') -or ($index -match 'общий denominator после обновления шаблона неизвестен')) -and ($taskPanel -match '(Runtime открыт|runtime открыт)')) 'runtime not promoted'

$taskMetaMatch = [regex]::Match(
    $index,
    'const taskMeta = \{(?<body>.*?)\r?\n\s*\};',
    [Text.RegularExpressions.RegexOptions]::Singleline
)
Add-Check 'task_meta_block_found' $taskMetaMatch.Success 'const taskMeta block'
if ($taskMetaMatch.Success) {
    $taskMeta = $taskMetaMatch.Groups['body'].Value
    $taskCount = [regex]::Matches($taskMeta, '(?m)^\s*"task-[^"]+":\s*\{').Count
    Add-Check 'canonical_task_count_30' ($taskCount -eq 30) "task_count=$taskCount"
    Add-Check 'g2geo_not_primary_task' (-not ($taskMeta -match '"task-g2-geo-content"')) 'G2.GEO stays outside taskMeta'
}
else {
    Add-Check 'canonical_task_count_30' $false 'taskMeta unavailable'
    Add-Check 'g2geo_not_primary_task' $false 'taskMeta unavailable'
}

$htmlExists = Test-Path -LiteralPath $paths.html -PathType Leaf
$docxExists = Test-Path -LiteralPath $paths.docx -PathType Leaf
$pmExists = Test-Path -LiteralPath $paths.pm -PathType Leaf
$htmlCurrent = $htmlExists -and $pmExists -and ((Get-Item -LiteralPath $paths.html).LastWriteTimeUtc -ge (Get-Item -LiteralPath $paths.pm).LastWriteTimeUtc)
$docxCurrent = $docxExists -and $pmExists -and ((Get-Item -LiteralPath $paths.docx).LastWriteTimeUtc -ge (Get-Item -LiteralPath $paths.pm).LastWriteTimeUtc)
Add-Check 'html_current' ($htmlCurrent -and ($html -match 'G2\.GEO')) 'generated from current PM source'
Add-Check 'html_task_backlink' ($html -match 'task-tz\.html\?task=task-g2-geo-content&amp;doc=igor') 'returns to canonical G2.GEO task card'
Add-Check 'docx_current' $docxCurrent 'generated from current PM source'

Add-Check 'target_vision_updated' ($target -match 'G2\.GEO') 'target-site vision'
Add-Check 'current_state_updated' (($current -match 'G2\.GEO') -and ($current -match 'unknown|неизвест|не подтвержд')) 'current-site truth'
Add-Check 'route_ownership_updated' (($routeMatrix -match 'G2\.GEO') -and ($routeMatrix -match 'geo-content')) 'route/admin ownership'
Add-Check 'documentation_matrix_updated' ($documentationMatrix -match 'G2\.GEO') 'documentation registry'
Add-Check 'delivery_matrix_updated' (($deliveryMatrix -match '\| G2\.GEO \|') -and ($deliveryMatrix -match 'не считается|вне.+30|outside.+30')) 'delivery sequence and boundary'
Add-Check 'readme_updated' (($readme -match 'G2\.GEO') -and ($readme -match 'Test-G2GeoContentHandoff\.ps1')) 'README handoff'
Add-Check 'readiness_updated' (($readiness -match 'G2\.GEO') -and ($readiness -match 'P0')) 'readiness registry'

$passCount = @($checks | Where-Object passed).Count
$failures = @($checks | Where-Object { -not $_.passed })
$result = [pscustomobject]@{
    status = if ($failures.Count -eq 0) { 'PASS' } else { 'FAIL' }
    pass = $passCount
    fail = $failures.Count
    total = $checks.Count
    checks = $checks
}

if ($Json) {
    $result | ConvertTo-Json -Depth 5
}
else {
    "G2.GEO handoff: $($result.status) ($passCount/$($checks.Count))"
    if ($failures.Count -gt 0) {
        $failures | ForEach-Object { "FAIL $($_.name): $($_.evidence)" }
    }
}

if ($failures.Count -gt 0) {
    exit 1
}
