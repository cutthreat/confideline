param(
    [switch]$Json
)

$ErrorActionPreference = 'Stop'

$reportRoot = $PSScriptRoot
$projectRoot = (Resolve-Path (Join-Path $reportRoot '..\..')).Path
$panelRoot = Join-Path $projectRoot 'web\qa-reports\nebula-6-goals-master-plan-2026-06-11'

$paths = [ordered]@{
    pm = Join-Path $reportRoot 'etalon-tz-g3-int-layout-backend-integration.md'
    codex = Join-Path $reportRoot 'codex-context-g3-int-layout-backend-integration.md'
    html = Join-Path $reportRoot 'tz-g3-int-for-igor.html'
    docx = Join-Path $reportRoot 'tz-g3-int-for-igor.docx'
    index = Join-Path $panelRoot 'index.html'
    taskPanel = Join-Path $panelRoot 'task-tz.html'
    target = Join-Path $reportRoot 'target-site-vision-g1-g3.md'
    current = Join-Path $reportRoot 'current-site-state-g1-g3-2026-07-29.md'
    routeMatrix = Join-Path $reportRoot 'g1-g3-route-and-admin-ownership-matrix.md'
    documentationMatrix = Join-Path $reportRoot 'g1-g3-documentation-matrix.md'
    deliveryMatrix = Join-Path $reportRoot 'delivery-matrix.md'
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

foreach ($entry in $paths.GetEnumerator()) {
    Add-Check "file_exists_$($entry.Key)" (Test-Path -LiteralPath $entry.Value -PathType Leaf) $entry.Value
}

if (($checks | Where-Object { -not $_.passed }).Count -gt 0) {
    $summary = [pscustomobject]@{
        status = 'FAIL'
        pass = ($checks | Where-Object passed).Count
        fail = ($checks | Where-Object { -not $_.passed }).Count
        checks = $checks
    }
    $summary | ConvertTo-Json -Depth 5
    exit 1
}

$pm = Get-Content -LiteralPath $paths.pm -Raw
$codex = Get-Content -LiteralPath $paths.codex -Raw
$html = Get-Content -LiteralPath $paths.html -Raw
$index = Get-Content -LiteralPath $paths.index -Raw
$taskPanel = Get-Content -LiteralPath $paths.taskPanel -Raw
$target = Get-Content -LiteralPath $paths.target -Raw
$current = Get-Content -LiteralPath $paths.current -Raw
$routeMatrix = Get-Content -LiteralPath $paths.routeMatrix -Raw
$documentationMatrix = Get-Content -LiteralPath $paths.documentationMatrix -Raw
$deliveryMatrix = Get-Content -LiteralPath $paths.deliveryMatrix -Raw

Add-Check 'pm_substantial' ($pm.Length -gt 16000) "length=$($pm.Length)"
Add-Check 'codex_substantial' ($codex.Length -gt 22000) "length=$($codex.Length)"
Add-Check 'html_substantial' ($html.Length -gt 25000) "length=$($html.Length)"
Add-Check 'docx_substantial' ((Get-Item -LiteralPath $paths.docx).Length -gt 15000) "bytes=$((Get-Item -LiteralPath $paths.docx).Length)"

Add-Check 'pm_title' ($pm -match '^# Функциональное ТЗ G3\.INT') 'canonical functional title'
Add-Check 'codex_title' ($codex -match '^# Технический контекст G3\.INT') 'canonical Codex title'
Add-Check 'package_not_31st_task' (($pm -match 'не меняет канонический реестр 30 задач') -and ($codex -match 'не 31-я строка')) 'ownership boundary'
Add-Check 'g35_independent_gate' (($pm -match 'не заменяет G3\.5') -and ($codex -match 'G3\.5 остается release gate')) 'G3.5 separation'
Add-Check 'implementation_status_honest' ($codex -match '`implementation_status`: `code_present_unmapped`') 'runtime not promoted'

$surfaces = @('home','dashboard_catalog','country','city','category','matching_result','thematic_block','expert_profile')
foreach ($surface in $surfaces) {
    $surfaceToken = ([char]96) + $surface + ([char]96)
    Add-Check "surface_$surface" (($pm -match [regex]::Escape($surfaceToken)) -and ($codex -match [regex]::Escape($surfaceToken))) $surface
}

Add-Check 'auth_shared_not_surface' (($pm -match 'auth-состояния.+не становятся новыми eligibility surfaces') -and ($codex -match 'not a ninth surface|не является девятой')) 'auth boundary'
Add-Check 'no_demo_data_contract' (($pm -match 'Demo data отсутствует') -and ($codex -match 'No demo data can be used as fallback')) 'demo detector contract'
Add-Check 'five_widths' (($pm -match '`320`, `576`, `768`, `992`, `1200`') -and ($codex -match '320/576/768/992/1200')) 'responsive matrix'
Add-Check 'rollout_modes' (($pm -match '`legacy_active`') -and ($codex -match '`nebula_preview`') -and ($codex -match '`rollback_active`')) 'controlled rollout'
Add-Check 'i18n_workstream_owned_by_g3int' (($pm -match '`G3\.INT\.I18N`') -and ($codex -match '`G3\.INT\.I18N`') -and ($taskPanel -match 'G3\.INT\.I18N')) 'translation keys and locale coverage stay inside G3.INT'
Add-Check 'i18n_existing_admin_owner' (($pm -match '/\{lang\}/admin/language/list') -and ($pm -match 'не создаёт.+вторую translation-админку') -and ($codex -match '/ru/admin/language/list')) 'reuse current Languages admin'
Add-Check 'i18n_required_locale_fail_closed' (($pm -match 'не получает `nebula_active`') -and ($codex -match '100% required-key coverage|every required key') -and ($codex -match 'remains outside the Nebula rollout')) 'incomplete locale cannot activate'
Add-Check 'i18n_functional_copy_ownership' (($pm -match 'G1–G4.+утверждённый смысл') -and ($pm -match 'Игорь отвечает только за отсутствующие/сломанные key bindings и runtime') -and ($codex -match 'does not author or approve translations, policy, financial, support or legal meaning')) 'functional owners approve meaning, moderator publishes, developer repairs technical gaps'
Add-Check 'i18n_surface_locale_owner' (($pm -match 'surface × rollout locale') -and ($codex -match 'surface × rollout_locale') -and ($codex -match 'Global Language `Active/Beta/Inactive` alone does not admit')) 'explicit rollout locale set references current Language IDs'
Add-Check 'i18n_safe_import_contract' (($pm -match 'translation-only режиме') -and ($pm -match 'идемпотентна') -and ($codex -match 'Translation import safety contract') -and ($codex -match 'cannot create a Language, change `Language\.status`')) 'dry-run atomic idempotent rollback import'
Add-Check 'rollback_during_session' (($pm -match 'rollback выполняется во время активного диалога/consultation') -and ($codex -match 'rollback during consultation')) 'domain continuity'
Add-Check 'source_gap_fail_closed' (($taskPanel -match 'blocked_source') -and ($codex -match 'blocked_source')) 'source gap classification'
Add-Check 'exact_source_packets' (($codex -match 'c76-master-map-top-level-frame-index-20260716\.json') -and ($codex -match 'public-home-master-c76-source-packet-2026-07-13\.json') -and ($codex -match 'auth-account-entry-state-handoff-2026-07-28\.json')) 'source navigation'

$pmCases = ([regex]::Matches($pm, '\| G3I-P\d{2} \|')).Count
$codexCases = ([regex]::Matches($codex, '\| G3I-A\d{2} \|')).Count
Add-Check 'pm_32_acceptance_cases' ($pmCases -eq 32) "count=$pmCases"
Add-Check 'codex_40_acceptance_cases' ($codexCases -eq 40) "count=$codexCases"
Add-Check 'last_pm_case_is_g35' ($pm -match '\| G3I-P32 \| Запущена G3\.5') 'G3.5 consumes completed i18n proof'
Add-Check 'last_codex_case_is_g35' ($codex -match '\| G3I-A40 \| G3\.5 starts') 'G3.5 intake evidence'

Add-Check 'pm_no_architecture_prescription' (-not ($pm -match '(?im)\bCREATE TABLE\b|\bSELECT \* FROM\b|\bclass\s+\w+Controller\b|\bREST endpoint\b')) 'implementation remains Igor-owned'
Add-Check 'panel_package_card' (($index -match 'implementationPackage') -and ($index -match 'task-g3-integration') -and ($index -match 'не новая продуктовая задача')) 'master panel'
Add-Check 'panel_i18n_scope_visible' (($index -match 'G3\.INT\.I18N') -and ($index -match 'moderator-first') -and ($taskPanel -match 'G3\.INT\.I18N выполняется moderator-first') -and ($taskPanel -match 'existing-key search')) 'P0 i18n workstream and operator-first owner split visible in both panels'
Add-Check 'panel_pair_links' (($taskPanel -match 'tz-g3-int-for-igor\.html') -and ($taskPanel -match 'codex-context-g3-int-layout-backend-integration\.md') -and ($taskPanel -match 'tz-g3-int-for-igor\.docx')) 'task panel artifacts'
Add-Check 'panel_oracle_inventory' (($taskPanel -match 'Home — публичная витрина') -and ($taskPanel -match 'All Psychic New') -and ($taskPanel -match 'Expert Page New') -and ($taskPanel -match 'Login \+ Signup step 1/2')) 'visible source cards'
Add-Check 'panel_score_100' ($taskPanel -match '"task-g3-integration": \[5,8,10,7,12,12,12,8,6,12,5,3\]') '12-criteria vector'
Add-Check 'html_current' (($html -match 'G3\.INT') -and ((Get-Item -LiteralPath $paths.html).LastWriteTimeUtc -ge (Get-Item -LiteralPath $paths.pm).LastWriteTimeUtc)) 'generated from current PM source'
Add-Check 'html_task_backlink' ($html -match 'task-tz\.html\?task=task-g3-integration&amp;doc=igor') 'returns to the canonical G3.INT task card'
Add-Check 'docx_current' ((Get-Item -LiteralPath $paths.docx).LastWriteTimeUtc -ge (Get-Item -LiteralPath $paths.pm).LastWriteTimeUtc) 'generated from current PM source'
Add-Check 'target_vision_updated' (($target -match 'Сквозная интеграция G3\.INT') -and ($target -match 'Figma/source package') -and ($target -match 'Confideline route')) 'target state'
Add-Check 'current_state_updated' (($current -match 'Граница интеграции Oracle / Nebula') -and ($current -match 'не натягивание верстки на backend')) 'current truth'
Add-Check 'route_ownership_updated' (($routeMatrix -match 'G3\.INT выполняет presentation/backend binding') -and ($routeMatrix -match 'не создаёт отдельный редактор')) 'one editor rule'
Add-Check 'documentation_matrix_updated' ($documentationMatrix -match 'G3\.INT Oracle/Nebula → Confideline backend') 'docs registry'
Add-Check 'delivery_matrix_updated' (($deliveryMatrix -match '\| G3\.INT \|') -and ($deliveryMatrix -match 'не считается 31-м task code')) 'delivery sequence'
Add-Check 'legacy_g38_absent' (-not (($pm + $codex + $index + $taskPanel + $target + $current + $routeMatrix + $documentationMatrix + $deliveryMatrix) -match 'G3\.8|g3-8|G38-')) 'no stale task identity'

$passCount = ($checks | Where-Object passed).Count
$failures = @($checks | Where-Object { -not $_.passed })
$result = [pscustomobject]@{
    status = if ($failures.Count -eq 0) { 'PASS' } else { 'FAIL' }
    pass = $passCount
    fail = $failures.Count
    checks = $checks
}

if ($Json) {
    $result | ConvertTo-Json -Depth 5
}
else {
    "G3.INT handoff: $($result.status) ($passCount/$($checks.Count))"
    if ($failures.Count -gt 0) {
        $failures | ForEach-Object { "FAIL $($_.name): $($_.evidence)" }
    }
}

if ($failures.Count -gt 0) {
    exit 1
}
