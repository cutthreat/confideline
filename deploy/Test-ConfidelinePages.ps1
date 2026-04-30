param(
    [string]$ManifestPath = "deploy/pages-manifest.json",
    [string]$ReportPath = ".runtime/pages-health/latest.json",
    [switch]$CheckPublic
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$manifestFullPath = Join-Path $projectRoot $ManifestPath
$reportFullPath = Join-Path $projectRoot $ReportPath

if (-not (Test-Path -LiteralPath $manifestFullPath)) {
    throw "Manifest not found: $manifestFullPath"
}

$manifest = Get-Content -LiteralPath $manifestFullPath -Raw | ConvertFrom-Json
$results = @()

foreach ($entry in $manifest.entries) {
    $localFullPath = Join-Path $projectRoot $entry.localPath
    $localExists = Test-Path -LiteralPath $localFullPath -PathType Leaf
    $localTextOk = $true
    $publicOk = $null
    $publicStatusCode = $null
    $publicTextOk = $null
    $errors = New-Object System.Collections.Generic.List[string]

    if (-not $localExists) {
        $localTextOk = $false
        $errors.Add("local file missing")
    } else {
        $localContent = Get-Content -LiteralPath $localFullPath -Raw
        foreach ($text in $entry.requiredText) {
            if ($localContent -notlike "*$text*") {
                $localTextOk = $false
                $errors.Add("local required text missing: $text")
            }
        }
    }

    if ($CheckPublic) {
        $tempFile = New-TemporaryFile
        try {
            $curlOutput = & curl.exe -L --silent --show-error --max-time 25 --output $tempFile.FullName --write-out "%{http_code}" --url ([string]$entry.publicUrl) 2>&1
            if ($LASTEXITCODE -ne 0) {
                throw "curl failed: $curlOutput"
            }
            $publicStatusCode = [int](($curlOutput | Out-String).Trim())
            $publicOk = $publicStatusCode -ge 200 -and $publicStatusCode -lt 300
            $publicTextOk = $true
            $publicContent = Get-Content -LiteralPath $tempFile.FullName -Raw
            foreach ($text in $entry.requiredText) {
                if ($publicContent -notlike "*$text*") {
                    $publicTextOk = $false
                    $errors.Add("public required text missing: $text")
                }
            }
        } catch {
            $publicOk = $false
            $publicTextOk = $false
            $errors.Add("public request failed: $($_.Exception.Message)")
        } finally {
            Remove-Item -LiteralPath $tempFile.FullName -Force -ErrorAction SilentlyContinue
        }
    }

    $entryOk = $localExists -and $localTextOk
    if ($CheckPublic) {
        $entryOk = $entryOk -and $publicOk -and $publicTextOk
    }

    $results += [pscustomobject]@{
        name = [string]$entry.name
        localPath = [string]$entry.localPath
        publicUrl = [string]$entry.publicUrl
        localExists = [bool]$localExists
        localTextOk = [bool]$localTextOk
        publicOk = $publicOk
        publicStatusCode = $publicStatusCode
        publicTextOk = $publicTextOk
        ok = [bool]$entryOk
        errors = @($errors)
    }
}

$ok = -not ($results | Where-Object { -not $_.ok })
$report = [pscustomobject]@{
    generatedAt = (Get-Date).ToString("o")
    project = [string]$manifest.project
    baseUrl = [string]$manifest.baseUrl
    checkPublic = [bool]$CheckPublic
    ok = [bool]$ok
    entries = $results
}

$reportDir = Split-Path -Parent $reportFullPath
New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
$report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $reportFullPath -Encoding UTF8

if ($ok) {
    Write-Host "Confideline Pages check passed. Report: $reportFullPath"
    exit 0
}

Write-Host "Confideline Pages check failed. Report: $reportFullPath"
$results | Where-Object { -not $_.ok } | ForEach-Object {
    Write-Host "- $($_.name): $($_.errors -join '; ')"
}
exit 1
