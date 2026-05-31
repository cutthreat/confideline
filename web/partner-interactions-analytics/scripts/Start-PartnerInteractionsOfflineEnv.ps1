param(
    [int]$Port = 8095,
    [switch]$Open
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Url = "http://127.0.0.1:$Port/index.html"
$PidFile = Join-Path $Root 'offline-env.pid'

$existing = Test-NetConnection -ComputerName 127.0.0.1 -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
if (-not $existing) {
    $process = Start-Process -WindowStyle Hidden -FilePath php -ArgumentList @('-S', "127.0.0.1:$Port", '-t', $Root) -PassThru
    Set-Content -LiteralPath $PidFile -Value $process.Id -Encoding ASCII
    Start-Sleep -Milliseconds 700
}

$status = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 10

if ($Open) {
    Start-Process $Url
}

[pscustomobject]@{
    Url = $Url
    Root = $Root
    StatusCode = $status.StatusCode
    PidFile = $PidFile
} | ConvertTo-Json
