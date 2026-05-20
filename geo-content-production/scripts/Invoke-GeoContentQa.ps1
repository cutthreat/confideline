param(
    [switch]$CheckPublic,
    [switch]$SkipDriveRefresh,
    [string]$ProjectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..')).Path
)

$ErrorActionPreference = 'Stop'

function Invoke-Step {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,
        [Parameter(Mandatory = $true)]
        [scriptblock]$Script
    )

    $started = Get-Date
    try {
        $output = & $Script
        [pscustomobject]@{
            name = $Name
            status = 'PASS'
            seconds = [math]::Round(((Get-Date) - $started).TotalSeconds, 2)
            output = $output
            error = $null
        }
    } catch {
        [pscustomobject]@{
            name = $Name
            status = 'FAIL'
            seconds = [math]::Round(((Get-Date) - $started).TotalSeconds, 2)
            output = $null
            error = $_.Exception.Message
        }
    }
}

function Read-JsonFile {
    param([Parameter(Mandatory = $true)][string]$Path)
    (Get-Content -LiteralPath $Path -Raw -Encoding UTF8) | ConvertFrom-Json
}

function Find-WorkspaceRoot {
    param([Parameter(Mandatory = $true)][string]$StartPath)
    $current = (Resolve-Path -LiteralPath $StartPath).Path
    while ($current -and $current -ne (Split-Path -Parent $current)) {
        if (Test-Path -LiteralPath (Join-Path $current '.ops')) {
            return $current
        }
        $current = Split-Path -Parent $current
    }
    return 'H:\GPT-Codex'
}

$ProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
$workspaceRoot = Find-WorkspaceRoot -StartPath $ProjectRoot
$env:CONFIDELINE_PROJECT_ROOT = $ProjectRoot
$env:WORKSPACE_ROOT = $workspaceRoot
$scriptRoot = Join-Path $ProjectRoot 'geo-content-production\scripts'
$panelRoot = Join-Path $ProjectRoot 'web\geo-content-panel'
$reportsRoot = Join-Path $ProjectRoot 'reports\geo-content-qa'
$pagesCheck = Join-Path $ProjectRoot 'deploy\Test-ConfidelinePages.ps1'

$steps = New-Object System.Collections.Generic.List[object]

if (-not $SkipDriveRefresh) {
    $steps.Add((Invoke-Step -Name 'drive-photo-index' -Script {
        node (Join-Path $scriptRoot 'build-drive-photo-index.mjs')
    }))
}

$steps.Add((Invoke-Step -Name 'content-manager-panel' -Script {
    node (Join-Path $scriptRoot 'build-content-manager-panel.mjs')
}))

$steps.Add((Invoke-Step -Name 'country-photo-audit' -Script {
    node (Join-Path $scriptRoot 'audit-country-photo-index.mjs')
}))

$steps.Add((Invoke-Step -Name 'pages-local' -Script {
    & $pagesCheck
}))

if ($CheckPublic) {
    $steps.Add((Invoke-Step -Name 'pages-public' -Script {
        & $pagesCheck -CheckPublic
    }))
}

$manifestPath = Join-Path $panelRoot 'manifest.json'
$photoAuditPath = Join-Path $panelRoot 'country-photo-audit.json'
$manifest = Read-JsonFile -Path $manifestPath
$photoAudit = Read-JsonFile -Path $photoAuditPath
$countryItems = @($manifest.items | Where-Object { $_.type -eq 'country' })
$badFolderLinks = @($countryItems | Where-Object {
    $_.photos.folderUrl -and $_.photos.folderUrl -notlike '*drive.google.com/drive/folders/*'
})

$contractIssues = New-Object System.Collections.Generic.List[string]
if ($countryItems.Count -ne 39) {
    $contractIssues.Add("Expected 39 countries in manifest, found $($countryItems.Count).")
}
if ($photoAudit.summary.countries -ne $countryItems.Count) {
    $contractIssues.Add("Photo audit country count $($photoAudit.summary.countries) does not match manifest country count $($countryItems.Count).")
}
if ($photoAudit.summary.panelMissedDrivePhotos -ne 0) {
    $contractIssues.Add("Panel missed Drive photos: $($photoAudit.summary.panelMissedDrivePhotos).")
}
if ($photoAudit.summary.brokenPhotoLinks -ne 0) {
    $contractIssues.Add("Broken photo links: $($photoAudit.summary.brokenPhotoLinks).")
}
if ($photoAudit.summary.driveFolderFetchFailed -ne 0) {
    $contractIssues.Add("Drive folder fetch failed: $($photoAudit.summary.driveFolderFetchFailed).")
}
if ($badFolderLinks.Count -ne 0) {
    $contractIssues.Add("Non-folder URLs shown as photo folder: $($badFolderLinks.Count).")
}

$failedSteps = @($steps | Where-Object { $_.status -ne 'PASS' })
foreach ($step in $failedSteps) {
    $contractIssues.Add("Step failed: $($step.name): $($step.error)")
}

$finalStatus = if ($contractIssues.Count -eq 0) { 'PASS' } else { 'FAIL' }

$summary = New-Object System.Collections.Specialized.OrderedDictionary
$summary.Add('pages', $manifest.totals.pages)
$summary.Add('countries', $countryItems.Count)
$summary.Add('cities', $manifest.totals.cities)
$summary.Add('ready', $manifest.totals.ready)
$summary.Add('withTwoPhotos', $manifest.totals.withTwoPhotos)
$summary.Add('panelMissedDrivePhotos', $photoAudit.summary.panelMissedDrivePhotos)
$summary.Add('brokenPhotoLinks', $photoAudit.summary.brokenPhotoLinks)
$summary.Add('driveFolderFetchFailed', $photoAudit.summary.driveFolderFetchFailed)
$summary.Add('badFolderLinks', $badFolderLinks.Count)
$summary.Add('driveFolderMissingPhotos', $photoAudit.summary.driveFolderMissingPhotos)
$summary.Add('noDriveFolder', $photoAudit.summary.noDriveFolder)

$result = New-Object System.Collections.Specialized.OrderedDictionary
$result.Add('status', $finalStatus)
$result.Add('generatedAt', (Get-Date).ToString('s'))
$result.Add('projectRoot', $ProjectRoot)
$result.Add('panelUrl', 'https://cutthreat.github.io/confideline/web/geo-content-panel/')
$result.Add('adminUrl', 'https://cutthreat.github.io/confideline/web/geo-content-panel/admin.html')
$result.Add('manifestPath', $manifestPath)
$result.Add('photoAuditPath', $photoAuditPath)
$stepArray = @($steps | ForEach-Object { $_ })
$issueArray = @($contractIssues | ForEach-Object { $_ })
$result.Add('steps', [object]$stepArray)
$result.Add('summary', $summary)
$result.Add('issues', [object]$issueArray)

New-Item -ItemType Directory -Force -Path $reportsRoot | Out-Null
$latestPath = Join-Path $reportsRoot 'latest.json'
($result | ConvertTo-Json -Depth 10) | Set-Content -LiteralPath $latestPath -Encoding UTF8
$result['reportPath'] = $latestPath

$result | ConvertTo-Json -Depth 10

if ($contractIssues.Count -gt 0) {
    exit 1
}
