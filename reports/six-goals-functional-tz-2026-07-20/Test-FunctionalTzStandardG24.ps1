[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

$paths = @{
    Pm = Join-Path $root 'etalon-tz-g2-4-agent-accruals.md'
    Codex = Join-Path $root 'codex-context-g2-4-agent-accruals.md'
    Standard = Join-Path $root 'functional-tz-quality-standard.md'
    G11Codex = Join-Path $root 'codex-context-g1-1-service-session.md'
    G12Pm = Join-Path $root 'etalon-tz-g1-2-role-chat.md'
    G12Codex = Join-Path $root 'codex-context-g1-2-role-chat.md'
    G13Pm = Join-Path $root 'etalon-tz-g1-3-status-history.md'
    G13Codex = Join-Path $root 'codex-context-g1-3-status-history.md'
    G14Pm = Join-Path $root 'etalon-tz-g1-4-chat-notifications.md'
    G21Pm = Join-Path $root 'etalon-tz-g2-1-price-balance.md'
    G21Codex = Join-Path $root 'codex-context-g2-1-price-balance.md'
    G22Pm = Join-Path $root 'etalon-tz-g2-2-timer-debit-pause.md'
    G22Codex = Join-Path $root 'codex-context-g2-2-timer-debit-pause.md'
    G2 = Join-Path $root 'tz-g2-billing-refunds-compensation.md'
    Admin = Join-Path $root 'admin-panel-settings-development-package.md'
    Vertical = Join-Path $root 'vertical-package-session-money.md'
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
$g11Codex = Get-Content -Raw -LiteralPath $paths.G11Codex
$g12Pm = Get-Content -Raw -LiteralPath $paths.G12Pm
$g12Codex = Get-Content -Raw -LiteralPath $paths.G12Codex
$g13Pm = Get-Content -Raw -LiteralPath $paths.G13Pm
$g13Codex = Get-Content -Raw -LiteralPath $paths.G13Codex
$g14Pm = Get-Content -Raw -LiteralPath $paths.G14Pm
$g21Pm = Get-Content -Raw -LiteralPath $paths.G21Pm
$g21Codex = Get-Content -Raw -LiteralPath $paths.G21Codex
$g22Pm = Get-Content -Raw -LiteralPath $paths.G22Pm
$g22Codex = Get-Content -Raw -LiteralPath $paths.G22Codex
$g2 = Get-Content -Raw -LiteralPath $paths.G2
$admin = Get-Content -Raw -LiteralPath $paths.Admin
$vertical = Get-Content -Raw -LiteralPath $paths.Vertical

foreach ($number in 1..22) {
    Add-Check "pm-heading:$number" $pm.Contains("## $number.") 'required autonomous PM section'
}
foreach ($number in 1..25) {
    Add-Check "codex-heading:$number" $codex.Contains("## $number.") 'required technical-context section'
}

$requiredPm = @(
    'Стартовое значение — **weekly**',
    'Стартовый процент и точная eligible base остаются **`unset`**',
    'Initial mode — **`disabled`**',
    'Accrual и payout — разные процессы',
    'refund создаёт отдельную отрицательную correction',
    'Correction не переписывает исходный accrual',
    '/ru/admin/partner/payments?id={agentId}',
    '/ru/admin/partner/payouts?id={agentId}',
    '/ru/admin/partner/payments?id={agentId}&mode=minus',
    'Не создаётся параллельная вторая карточка платежей',
    'Reassignment после consultation не меняет исторического получателя',
    'Автоматическая внешняя выплата в MVP запрещена'
)
foreach ($phrase in $requiredPm) {
    Add-Check "pm-concept:$phrase" $pm.Contains($phrase) 'required G2.4 product rule'
}

$requiredCodex = @(
    'service session -> actual Agent snapshot',
    'configuration_pending',
    'eligible_for_payout',
    'included_in_payout',
    'Actual Agent comes from session history',
    'successful immutable refund execution',
    'Stable logical identities are required',
    'G24-A01',
    'G24-A35',
    'hard gates pass at specification level',
    'initial consultation percentage',
    'external payout: manual/separate'
)
foreach ($phrase in $requiredCodex) {
    Add-Check "codex-concept:$phrase" $codex.Contains($phrase) 'required Codex contract'
}

Add-Check 'g24:weekly-managed' (
    $pm.Contains('Стартовый compensation period — **weekly**') -and
    $pm.Contains('per session') -and
    $pm.Contains('daily') -and
    $pm.Contains('monthly') -and
    $codex.Contains('compensation period: `weekly`')
) 'weekly is default, not hardcoded'

Add-Check 'g24:components-independent' (
    $pm.Contains('Consultation component') -and
    $pm.Contains('Fixed/SLA component') -and
    $pm.Contains('Additional-task component') -and
    $pm.Contains('Consultation refund не изменяет unrelated fixed/SLA или task pay')
) 'three components do not mask one another'

Add-Check 'g24:unset-disabled' (
    $pm.Contains('`unset` не равен `0`, `disabled`') -and
    $codex.Contains('`unset`, `0`, `disabled`, `pending`, `held` and `no_data` are distinct') -and
    $admin.Contains('Consultation percentage | `draft/unset`') -and
    $admin.Contains('Fixed за график/SLA | `disabled`')
) 'open economics values fail closed'

Add-Check 'g24:existing-surfaces' (
    $pm.Contains('/ru/admin/partner/payments?id={agentId}') -and
    $pm.Contains('/ru/admin/partner/payouts?id={agentId}') -and
    $pm.Contains('mode=minus') -and
    $codex.Contains('Extend these operation/readback surfaces; do not create a second competing partner-finance workflow')
) 'existing finance surfaces are reused'

Add-Check 'g24:refund-correction' (
    $pm.Contains('Только успешный refund movement G2.3 создаёт trigger correction') -and
    $codex.Contains('Only a successful G2.3 refund movement') -and
    $pm.Contains('Повторное refund event не создаёт вторую correction')
) 'refund decision and correction are separated'

Add-Check 'g24:historical-agent' (
    $pm.Contains('фактическим Агентом') -and
    $pm.Contains('Reassignment после consultation не меняет исторического получателя') -and
    $codex.Contains('Actual Agent comes from session history')
) 'historical attribution survives reassignment'

Add-Check 'g24:umbrella-aligned' (
    $g2.Contains('## G2.4 Начисления и оплата агента') -and
    $g2.Contains('Refund создает отдельную отрицательную correction') -and
    $vertical.Contains('G2.4: consultation accrual и отрицательная correction')
) 'new task refines existing umbrella without changing ownership'

$canonicalDocs = @($g11Codex, $g12Pm, $g12Codex, $g13Pm, $g13Codex, $g21Pm, $g21Codex, $g22Pm, $g22Codex)
Add-Check 'crosscut:canonical-states' (
    -not (($canonicalDocs -join "`n") -match '\b(trial_active|paid_active)\b')
) 'only connecting/trial/paid/balance_pause/completed are canonical'

Add-Check 'crosscut:conditional-edit-marker' (
    $g12Pm.Contains('Если клиент прочитал сообщение до редактирования') -and
    $g12Pm.Contains('Если сообщение не было прочитано до редактирования, пометка клиенту не показывается') -and
    $g12Codex.Contains('conditional edited marker')
) 'edited marker follows read-before-edit truth'

Add-Check 'crosscut:topup-no-auto-resume' (
    $g13Pm.Contains('автоматический переход в `paid` запрещён') -and
    $g13Pm.Contains('явно нажимает «Продолжить консультацию»') -and
    $g13Codex.Contains('It never auto-resumes paid')
) 'payment success updates balance, explicit continue starts paid'

Add-Check 'crosscut:retention-24-legal-hold' (
    $g13Pm.Contains('**24 месяца после завершения consultation**') -and
    $g13Pm.Contains('legal hold') -and
    $g13Codex.Contains('Client history default is 24 months') -and
    $g13Codex.Contains('scoped evidence')
) 'client history retention is explicit and scoped'

Add-Check 'crosscut:refund-owner' (
    $g14Pm.Contains('refund approval и исполнение — G2.3') -and
    $g14Pm.Contains('G2.4 получает только факт успешного refund для agent correction') -and
    -not $g14Pm.Contains('refund approval — G2.4/G4')
) 'G2.3 owns refund; G2.4 owns correction'

Add-Check 'crosscut:trial-single-owner' (
    $g21Pm.Contains('G2.1 является единственным владельцем создания, настройки и выдачи trial entitlement') -and
    $g21Codex.Contains('single configuration owner for trial-entitlement grants') -and
    $g22Pm.Contains('G2.2 не создаёт второй редактор') -and
    $g22Codex.Contains('source G2.1 rule/version is the only configuration owner')
) 'trial entitlement is configured once and consumed by G2.2'

$forbiddenPm = @('CREATE TABLE', 'ALTER TABLE', 'class ', 'controller', 'endpoint /api/')
foreach ($token in $forbiddenPm) {
    Add-Check "pm-no-implementation:$token" (-not $pm.Contains($token)) 'Igor owns implementation design'
}

Add-Check 'codex:self-score' (
    $codex.Contains('| **Total** | **100/100**') -and
    $codex.Contains('Q10 Acceptance matrix') -and
    $codex.Contains('Q12 DoD/proof boundary')
) 'quality-standard score is explicit'

$failed = @($checks | Where-Object { -not $_.pass })
$result = [ordered]@{
    schema = 'functional_tz_g24_verifier.v1'
    checked_at = (Get-Date).ToString('o')
    status = if ($failed.Count -eq 0) { 'pass' } else { 'fail' }
    passed = @($checks | Where-Object pass).Count
    total = $checks.Count
    failed = $failed
    artifacts = @{
        Pm = $paths.Pm
        Codex = $paths.Codex
    }
}

$result | ConvertTo-Json -Depth 8
if ($failed.Count -gt 0) { exit 1 }
