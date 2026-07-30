$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$panel = Join-Path (Split-Path -Parent (Split-Path -Parent $root)) 'web\qa-reports\nebula-6-goals-master-plan-2026-06-11\task-tz.html'

$paths = @{
    Canonical = Join-Path $root 'expert-specialization-taxonomy-v2-2026-07-29.md'
    G32Pm = Join-Path $root 'etalon-tz-g3-2-expert-catalog.md'
    G32Codex = Join-Path $root 'codex-context-g3-2-expert-catalog.md'
    G36Pm = Join-Path $root 'etalon-tz-g3-6-profile-completeness.md'
    G36Codex = Join-Path $root 'codex-context-g3-6-profile-completeness.md'
    G32Html = Join-Path $root 'tz-g3-2-for-igor.html'
    G36Html = Join-Path $root 'tz-g3-6-for-igor.html'
    Panel = $panel
}

$results = [System.Collections.Generic.List[object]]::new()

function Add-Check {
    param(
        [string]$Name,
        [bool]$Passed,
        [string]$Evidence
    )
    $results.Add([pscustomobject]@{
        check = $Name
        passed = $Passed
        evidence = $Evidence
    })
}

foreach ($entry in $paths.GetEnumerator()) {
    Add-Check "file:$($entry.Key)" (Test-Path -LiteralPath $entry.Value -PathType Leaf) $entry.Value
}

$text = @{}
foreach ($entry in $paths.GetEnumerator()) {
    if (Test-Path -LiteralPath $entry.Value -PathType Leaf) {
        $text[$entry.Key] = Get-Content -LiteralPath $entry.Value -Raw -Encoding UTF8
    }
}

$categories = @(
    'relationships_family',
    'career_money_projects',
    'choice_future_changes',
    'personal_growth_inner_balance',
    'spirituality_energy_practices'
)
$labels = @(
    '| Отношения | Relationships |',
    '| Карьера | Career |',
    '| Будущее | Future |',
    '| Развитие | Growth |',
    '| Духовность | Spirituality |'
)

foreach ($category in $categories) {
    Add-Check "category:$category" ($text.Canonical -match [regex]::Escape($category)) $category
}
foreach ($label in $labels) {
    Add-Check "label:$label" ($text.Canonical -match [regex]::Escape($label)) $label
}

$specializationRows = [regex]::Matches(
    $text.Canonical,
    '(?m)^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|$'
)
$ids = @($specializationRows | ForEach-Object { [int]$_.Groups[1].Value })
$expectedIds = 1..21
Add-Check 'specialization_rows:21' ($specializationRows.Count -eq 21) "count=$($specializationRows.Count)"
Add-Check 'specialization_ids:1..21' (($ids -join ',') -eq ($expectedIds -join ',')) ($ids -join ',')
Add-Check 'specialization:13_deprecated' ($text.Canonical -match '\|\s*13\s*\|[^\r\n]+deprecated') 'id=18:value=13'
Add-Check 'specialization:21_append_only' ($text.Canonical -match '\|\s*21\s*\|[^\r\n]+append-only') 'id=18:value=21'
Add-Check 'method:migration_13_to_17_16' ($text.Canonical -match 'id=18:value=13[\s\S]+id=17:value=16') '13 -> method 16'
Add-Check 'reset:not_category' ($text.Canonical -match 'не шестой категорией') 'Все / All'
Add-Check 'geo:no_local_hardcode' ($text.Canonical -match 'Отдельный hardcode четырёх geo-тем запрещён') 'country/city'
Add-Check 'admin:canonical_route' ($text.Canonical -match '/ru/admin/profile-field/expert-taxonomy') '/ru/admin/profile-field/expert-taxonomy'

foreach ($key in @('G32Pm','G32Codex','G36Pm','G36Codex','G32Html','G36Html')) {
    Add-Check "${key}:taxonomy_version" ($text[$key] -match 'expert_specialization_taxonomy_v2') $key
}
foreach ($key in @('G32Pm','G32Codex','G36Pm','G36Codex','G32Html','G36Html')) {
    Add-Check "${key}:admin_route" ($text[$key] -match '/ru/admin/profile-field/expert-taxonomy') $key
}

Add-Check 'panel:canonical_link' ($text.Panel -match 'expert-specialization-taxonomy-v2-2026-07-29\.md') $paths.Panel
Add-Check 'panel:g32_short_labels' ($text.Panel -match 'Отношения, Карьера, Будущее, Развитие, Духовность') $paths.Panel

$canonicalDocs = @(
    $paths.Canonical,
    $paths.G32Pm,
    $paths.G32Codex,
    $paths.G36Pm,
    $paths.G36Codex
)
$stale = foreach ($file in $canonicalDocs) {
    $matches = Select-String -LiteralPath $file -Pattern 'Духовность и энергетические практики' -SimpleMatch
    foreach ($match in $matches) {
        "${file}:$($match.LineNumber)"
    }
}
Add-Check 'stale_full_label:none' (@($stale).Count -eq 0) (@($stale) -join '; ')

$failed = @($results | Where-Object { -not $_.passed })
[pscustomobject]@{
    schema = 'confideline.expert-taxonomy-v2-verification.v1'
    status = if ($failed.Count -eq 0) { 'pass' } else { 'fail' }
    checks = $results.Count
    passed = $results.Count - $failed.Count
    failed = $failed.Count
    failures = $failed
}

if ($failed.Count -gt 0) {
    exit 1
}
