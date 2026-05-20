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

$steps.Add((Invoke-Step -Name 'city-photo-audit' -Script {
    node (Join-Path $scriptRoot 'audit-city-photo-index.mjs')
}))

$steps.Add((Invoke-Step -Name 'geo-text-audit' -Script {
    node (Join-Path $scriptRoot 'audit-geo-text-packages.mjs')
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
$countryPhotoAuditPath = Join-Path $panelRoot 'country-photo-audit.json'
$cityPhotoAuditPath = Join-Path $panelRoot 'city-photo-audit.json'
$textAuditPath = Join-Path $panelRoot 'geo-text-audit.json'
$manifest = Read-JsonFile -Path $manifestPath
$countryPhotoAudit = Read-JsonFile -Path $countryPhotoAuditPath
$cityPhotoAudit = Read-JsonFile -Path $cityPhotoAuditPath
$textAudit = Read-JsonFile -Path $textAuditPath
$countryItems = @($manifest.items | Where-Object { $_.type -eq 'country' })
$cityItems = @($manifest.items | Where-Object { $_.type -eq 'city' })
$allItems = @($manifest.items)
$badFolderLinks = @($allItems | Where-Object {
    $_.photos.folderUrl -and $_.photos.folderUrl -notlike '*drive.google.com/drive/folders/*'
})

$contractIssues = New-Object System.Collections.Generic.List[string]
if ($countryItems.Count -ne 39) {
    $contractIssues.Add("Expected 39 countries in manifest, found $($countryItems.Count).")
}
if ($cityItems.Count -ne 118) {
    $contractIssues.Add("Expected 118 cities in manifest, found $($cityItems.Count).")
}
if ($countryPhotoAudit.summary.countries -ne $countryItems.Count) {
    $contractIssues.Add("Photo audit country count $($countryPhotoAudit.summary.countries) does not match manifest country count $($countryItems.Count).")
}
if ($cityPhotoAudit.summary.cities -ne $cityItems.Count) {
    $contractIssues.Add("Photo audit city count $($cityPhotoAudit.summary.cities) does not match manifest city count $($cityItems.Count).")
}
if ($textAudit.summary.pages -ne $allItems.Count) {
    $contractIssues.Add("Text audit page count $($textAudit.summary.pages) does not match manifest page count $($allItems.Count).")
}
if ($textAudit.summary.completePages -ne $textAudit.summary.pages) {
    $contractIssues.Add("Text audit incomplete pages: $($textAudit.summary.pages - $textAudit.summary.completePages).")
}
if ($textAudit.summary.missingFilePages -ne 0) {
    $contractIssues.Add("Text audit pages with missing files: $($textAudit.summary.missingFilePages).")
}
if ($textAudit.summary.issuePages -ne 0) {
    $contractIssues.Add("Text audit pages with structural issues: $($textAudit.summary.issuePages).")
}
if ($countryPhotoAudit.summary.panelMissedDrivePhotos -ne 0) {
    $contractIssues.Add("Panel missed country Drive photos: $($countryPhotoAudit.summary.panelMissedDrivePhotos).")
}
if ($cityPhotoAudit.summary.panelMissedDrivePhotos -ne 0) {
    $contractIssues.Add("Panel missed city Drive photos: $($cityPhotoAudit.summary.panelMissedDrivePhotos).")
}
if ($countryPhotoAudit.summary.brokenPhotoLinks -ne 0) {
    $contractIssues.Add("Broken country photo links: $($countryPhotoAudit.summary.brokenPhotoLinks).")
}
if ($cityPhotoAudit.summary.brokenPhotoLinks -ne 0) {
    $contractIssues.Add("Broken city photo links: $($cityPhotoAudit.summary.brokenPhotoLinks).")
}
if ($countryPhotoAudit.summary.driveFolderFetchFailed -ne 0) {
    $contractIssues.Add("Country Drive folder fetch failed: $($countryPhotoAudit.summary.driveFolderFetchFailed).")
}
if ($cityPhotoAudit.summary.driveFolderFetchFailed -ne 0) {
    $contractIssues.Add("City Drive folder fetch failed: $($cityPhotoAudit.summary.driveFolderFetchFailed).")
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
$summary.Add('cities', $cityItems.Count)
$summary.Add('ready', $manifest.totals.ready)
$summary.Add('withTwoPhotos', $manifest.totals.withTwoPhotos)
$summary.Add('textCompletePages', $textAudit.summary.completePages)
$summary.Add('textCompleteCities', $textAudit.summary.completeCities)
$summary.Add('textMissingFilePages', $textAudit.summary.missingFilePages)
$summary.Add('textIssuePages', $textAudit.summary.issuePages)
$summary.Add('countryPanelMissedDrivePhotos', $countryPhotoAudit.summary.panelMissedDrivePhotos)
$summary.Add('cityPanelMissedDrivePhotos', $cityPhotoAudit.summary.panelMissedDrivePhotos)
$summary.Add('countryBrokenPhotoLinks', $countryPhotoAudit.summary.brokenPhotoLinks)
$summary.Add('cityBrokenPhotoLinks', $cityPhotoAudit.summary.brokenPhotoLinks)
$summary.Add('countryDriveFolderFetchFailed', $countryPhotoAudit.summary.driveFolderFetchFailed)
$summary.Add('cityDriveFolderFetchFailed', $cityPhotoAudit.summary.driveFolderFetchFailed)
$summary.Add('badFolderLinks', $badFolderLinks.Count)
$summary.Add('countryDriveFolderMissingPhotos', $countryPhotoAudit.summary.driveFolderMissingPhotos)
$summary.Add('cityDriveFolderMissingPhotos', $cityPhotoAudit.summary.driveFolderMissingPhotos)
$summary.Add('countryNoDriveFolder', $countryPhotoAudit.summary.noDriveFolder)
$summary.Add('cityNoDriveFolder', $cityPhotoAudit.summary.noDriveFolder)

$result = New-Object System.Collections.Specialized.OrderedDictionary
$result.Add('status', $finalStatus)
$result.Add('generatedAt', (Get-Date).ToString('s'))
$result.Add('projectRoot', $ProjectRoot)
$result.Add('panelUrl', 'https://cutthreat.github.io/confideline/web/geo-content-panel/')
$result.Add('adminUrl', 'https://cutthreat.github.io/confideline/web/geo-content-panel/admin.html')
$result.Add('manifestPath', $manifestPath)
$result.Add('countryPhotoAuditPath', $countryPhotoAuditPath)
$result.Add('cityPhotoAuditPath', $cityPhotoAuditPath)
$result.Add('textAuditPath', $textAuditPath)
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
