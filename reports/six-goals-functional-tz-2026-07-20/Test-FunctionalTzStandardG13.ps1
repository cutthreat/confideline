[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$paths = @{
    Pm = Join-Path $root 'etalon-tz-g1-3-status-history.md'
    Html = Join-Path $root 'tz-g1-3-for-igor.html'
    Docx = Join-Path $root 'tz-g1-3-for-igor.docx'
    Codex = Join-Path $root 'codex-context-g1-3-status-history.md'
    Architecture = Join-Path $root 'product-architecture-g1-g6-ownership-map.md'
    G1 = Join-Path $root 'tz-g1-chat-service-session.md'
    G11 = Join-Path $root 'etalon-tz-g1-1-service-session.md'
    G12 = Join-Path $root 'etalon-tz-g1-2-role-chat.md'
    Admin = Join-Path $root 'admin-panel-settings-development-package.md'
    Owner = Join-Path $root 'owner-decisions.md'
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
$architecture = Get-Content -Raw -LiteralPath $paths.Architecture
$g1 = Get-Content -Raw -LiteralPath $paths.G1
$g11 = Get-Content -Raw -LiteralPath $paths.G11
$g12 = Get-Content -Raw -LiteralPath $paths.G12
$admin = Get-Content -Raw -LiteralPath $paths.Admin
$owner = Get-Content -Raw -LiteralPath $paths.Owner
$html = Get-Content -Raw -LiteralPath $paths.Html

$pmHeadings = @(
    '## 1. Цель',
    '## 2. Место G1.3 в общем продукте',
    '## 3. Термины',
    '## 4. Роли',
    '## 5. Запрос клиента на консультацию',
    '## 9. Создание consultation session',
    '## 17. Завершение',
    '## 18. История консультации',
    '## 21. Настройки через админ-панель',
    '## 22. Обязательные продуктовые invariants',
    '## 23. Ошибки и особые случаи',
    '## 24. Критерии готового результата',
    '## 25. Действия Игоря перед началом и после реализации'
)
foreach ($heading in $pmHeadings) {
    Add-Check "pm-heading:$heading" $pm.Contains($heading) 'required PM section'
}

$codexHeadings = 1..19 | ForEach-Object { "## $_." }
foreach ($heading in $codexHeadings) {
    Add-Check "codex-heading:$heading" $codex.Contains($heading) 'required Codex section'
}

$requiredConcepts = @(
    'Запрос на консультацию',
    'один конечный статус',
    'Операционный подстатус',
    'Ожидание клиента',
    'Balance pause',
    'Client reconnect grace',
    'Agent reconnect grace',
    'Мои консультации',
    'не становятся состояниями consultation',
    'Первая успешно зафиксированная terminal-команда'
)
foreach ($phrase in $requiredConcepts) {
    Add-Check "pm-concept:$phrase" $pm.Contains($phrase) 'required lifecycle concept'
}

$defaults = @(
    '15 минут',
    '60 минут',
    '3 минуты',
    '2 минуты',
    '4 часа',
    '1 приглашения',
    '3',
    '5 минут',
    '60 секунд'
)
foreach ($value in $defaults) {
    Add-Check "default:$value" $pm.Contains($value) 'owner-accepted managed value'
}

Add-Check 'boundary:request-not-session' (
    $architecture.Contains('Запрос существует до создания консультации') -and
    $codex.Contains('Declined/cancelled/expired request -> no debit/session')
) 'request/session boundary'

Add-Check 'boundary:one-terminal-state' (
    $architecture.Contains('Единый конечный статус') -and
    $g1.Contains('Persisted terminal state один') -and
    $codex.Contains('First committed terminal action wins')
) 'completed plus terminal metadata'

Add-Check 'boundary:no-linked-process-states' (
    $architecture.Contains('не являются ее состояниями') -and
    $pm.Contains('Их статусы не становятся состояниями consultation')
) 'support/refund/quality separation'

Add-Check 'boundary:g13-single-lifecycle-owner' (
    $pm.Contains('единственным источником истины') -and
    $codex.Contains('единственным техническим контрактом') -and
    $g11.Contains('Единственный источник этих правил — G1.3')
) 'G1.3 owns lifecycle; G1.1 only renders it'

Add-Check 'boundary:g11-no-lifecycle-defaults' (
    -not $g11.Contains('текущая длительность паузы — 5 минут') -and
    -not $g11.Contains('текущее значение — 60 секунд') -and
    -not $g11.Contains('| Длительность balance pause |') -and
    -not $g11.Contains('| Reconnect grace агента |')
) 'G1.1 does not duplicate G1.3 managed values'

Add-Check 'settings:price-owned-by-prices' (
    $g11.Contains('глобальной ценой paid-минуты') -and
    $g11.Contains('«Настройки цен»')
) 'price is not edited in consultation lifecycle settings'

Add-Check 'settings:chat-no-reconnect-editor' (
    $g12.Contains('reconnect, request/session timers') -and
    $admin.Contains('Client/Agent reconnect, request/session timers')
) 'chat page does not duplicate lifecycle clocks'

Add-Check 'owner:O9' $owner.Contains('## O9. Request, ожидание и compact lifecycle G1.3') 'decision register'
Add-Check 'owner:O10' $owner.Contains('## O10. Refund approval и appeal periods') 'decision register'
Add-Check 'owner:O11' $owner.Contains('## O11. Quality review и appeal Агента') 'decision register'

Add-Check 'html:title' $html.Contains('G1.3 «Статусы и история консультации»') 'human-readable HTML generated'
Add-Check 'docx:nonempty' ((Get-Item -LiteralPath $paths.Docx).Length -gt 10000) 'DOCX generated'

$forbiddenPm = @(
    'CREATE TABLE',
    'ALTER TABLE',
    'class ',
    'controller',
    'migration',
    'SQL',
    'endpoint /api/'
)
foreach ($token in $forbiddenPm) {
    Add-Check "pm-no-implementation:$token" (-not $pm.Contains($token)) 'Igor owns implementation'
}

$failed = @($checks | Where-Object { -not $_.pass })
$result = [pscustomobject]@{
    schema = 'functional_tz_g13_verifier.v1'
    status = if ($failed.Count -eq 0) { 'pass' } else { 'fail' }
    passed = $checks.Count - $failed.Count
    total = $checks.Count
    failed = $failed
    artifacts = $paths
}
$result | ConvertTo-Json -Depth 6
if ($failed.Count -gt 0) { exit 1 }
