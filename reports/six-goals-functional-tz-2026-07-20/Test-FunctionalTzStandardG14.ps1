[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$panelRoot = Join-Path (Split-Path (Split-Path $root -Parent) -Parent) 'web\qa-reports\nebula-6-goals-master-plan-2026-06-11'

$paths = @{
    Pm = Join-Path $root 'etalon-tz-g1-4-chat-notifications.md'
    Html = Join-Path $root 'tz-g1-4-for-igor.html'
    Docx = Join-Path $root 'tz-g1-4-for-igor.docx'
    Codex = Join-Path $root 'codex-context-g1-4-chat-notifications.md'
    G1 = Join-Path $root 'tz-g1-chat-service-session.md'
    Architecture = Join-Path $root 'product-architecture-g1-g6-ownership-map.md'
    Panel = Join-Path $panelRoot 'task-tz.html'
    Index = Join-Path $panelRoot 'index.html'
    Task = Join-Path $panelRoot 'tasks\task-g1-chat-notifications.html'
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
$g1 = Get-Content -Raw -LiteralPath $paths.G1
$architecture = Get-Content -Raw -LiteralPath $paths.Architecture
$panel = Get-Content -Raw -LiteralPath $paths.Panel
$index = Get-Content -Raw -LiteralPath $paths.Index
$task = Get-Content -Raw -LiteralPath $paths.Task
$html = Get-Content -Raw -LiteralPath $paths.Html

$pmHeadings = @(
    '## 1. Цель',
    '## 2. Место G1.4 в общем продукте',
    '## 3. Что уже есть и должно быть использовано',
    '## 4. Роли и получатели',
    '## 5. Каналы MVP',
    '## 6. Приоритеты уведомлений',
    '## 7. Каталог событий',
    '## 8. Получатель и видимость',
    '## 10. Переход по уведомлению',
    '## 12. Дубли, повторная доставка и порядок',
    '## 13. Ошибки доставки',
    '## 14. Пользовательские настройки',
    '## 15. Административный раздел',
    '## 16. Журнал доставки',
    '## 17. Границы с другими административными страницами',
    '## 18. Особые и ошибочные случаи',
    '## 19. Критерии готового результата',
    '## 20. Действия Игоря перед началом и после реализации'
)
foreach ($heading in $pmHeadings) {
    Add-Check "pm-heading:$heading" $pm.Contains($heading) 'required PM section'
}

$codexHeadings = 1..26 | ForEach-Object { "## $_." }
foreach ($heading in $codexHeadings) {
    Add-Check "codex-heading:$heading" $codex.Contains($heading) 'required Codex section'
}

$requiredPmConcepts = @(
    'категория **«Консультации»**',
    'Browser push относится к следующему этапу',
    'существующие индикаторы `/ru/messages`',
    '`/ru/settings/notifications`',
    '`/ru/admin/email-template/index`',
    '«Настройки уведомлений»',
    '`/ru/admin/notification-rule/index`',
    'Получатель определяется на серверной стороне',
    'не обещает компенсацию',
    'один административный сигнал',
    'полный transcript',
    'русском и английском'
)
foreach ($phrase in $requiredPmConcepts) {
    Add-Check "pm-concept:$phrase" $pm.Contains($phrase) 'required product decision'
}

$defaults = @(
    '5 минут',
    '1 минута',
    '22:00',
    '08:00',
    '90 дней'
)
foreach ($value in $defaults) {
    Add-Check "managed-default:$value" $pm.Contains($value) 'admin-managed starting value'
}

$groups = @(
    '### 7.1. Сообщения',
    '### 7.2. Запросы и предложения',
    '### 7.3. Подключение и доступность',
    '### 7.4. Trial, время и credits',
    '### 7.5. Завершение и история',
    '### 7.6. Технические события и компенсация'
)
foreach ($group in $groups) {
    Add-Check "event-group:$group" $pm.Contains($group) 'complete event catalog'
}

Add-Check 'boundary:email-copy-vs-rule' (
    $pm.Contains('`Email Templates` остается редактором') -and
    $pm.Contains('`Настройки уведомлений` управляют')
) 'email content and notification behavior are separate'

Add-Check 'boundary:g4-g6' (
    $pm.Contains('G4.4 определяет уведомления поддержки') -and
    $pm.Contains('G6.5 определяет внутренние командные уведомления')
) 'support/team workflows are not absorbed'

Add-Check 'boundary:g13-lifecycle' (
    $pm.Contains('G1.3 определяет запрос, статусы, переходы') -and
    $pm.Contains('Ошибка доставки не отменяет')
) 'delivery does not own lifecycle'

Add-Check 'boundary:permissions-not-duplicated' (
    $pm.Contains('permissions — `/ru/admin/settings/role`') -and
    $codex.Contains('do not add chat-role assignment')
) 'existing RBAC remains owner'

Add-Check 'privacy:safe-email' (
    $pm.Contains('не содержит полный текст сообщения или кейса') -and
    $pm.Contains('исходный цензурированный фрагмент')
) 'safe email content'

Add-Check 'channels:critical-mandatory' (
    $pm.Contains('Их нельзя отключить в пользовательских настройках') -and
    $pm.Contains('Критические уведомления тихими часами не задерживаются')
) 'mandatory critical route'

Add-Check 'delivery:dedup' (
    $pm.Contains('не должен создавать несколько одинаковых') -and
    $codex.Contains('business_event_id + recipient_id + channel + rule_version')
) 'idempotent delivery'

Add-Check 'delivery:super-admin' (
    $pm.Contains('получатель сигнала в MVP — super-admin') -and
    $codex.Contains('one super-admin incident/signal')
) 'critical failure route'

Add-Check 'delivery:retention' (
    $pm.Contains('Стартовый срок хранения — **90 дней**') -and
    $codex.Contains('Retention default 90 days')
) 'admin-managed retention'

Add-Check 'source:bounded-slice-not-runtime' (
    $codex.Contains('code_present_unmapped') -and
    $codex.Contains('Local consultation slice') -and
    $codex.Contains('не доказывает')
) 'source proof boundary'

Add-Check 'source:current-map' (
    $codex.Contains('managers/NotificationManager.php') -and
    $codex.Contains('services/ConsultationNotificationService.php') -and
    $codex.Contains('notifications/ConsultationMessageAttentionNotification.php') -and
    $codex.Contains('verify whether they are tracked, migrated, registered and executed')
) 'known local source is mapped without treating an untracked slice as portable runtime proof'

Add-Check 'html:title' $html.Contains('G1.4 «Уведомления консультации»') 'human-readable HTML generated'
Add-Check 'docx:nonempty' ((Get-Item -LiteralPath $paths.Docx).Length -gt 10000) 'DOCX generated'

Add-Check 'panel:artifact-mapping' (
    $panel.Contains('tz-g1-4-for-igor.html') -and
    $panel.Contains('codex-context-g1-4-chat-notifications.md') -and
    $panel.Contains('tz-g1-4-for-igor.docx')
) 'both handoff types and DOCX are mapped'

Add-Check 'panel:spec-ready' (
    $panel.Contains('tasks["task-g1-chat-notifications"].stage = "etalon_spec_ready_runtime_open"') -and
    $panel.Contains('tasks["task-g1-chat-notifications"].tzReady = 100')
) 'panel separates spec from runtime'

Add-Check 'index:readiness-100' (
    $index.Contains('"task-g1-chat-notifications":100') -and
    $index.Contains('title:"Уведомления консультации"')
) 'master list updated'

Add-Check 'task:current-not-old-slice' (
    $task.Contains('Полное продуктовое ТЗ G1.4') -and
    $task.Contains('Настройки уведомлений') -and
    -not $task.Contains('согласован только первый ограниченный срез')
) 'task card no longer presents old bounded-only requirement'

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

$qRows = @(
    'Q1 Цель и измеримый результат',
    'Q2 Scope, non-goals, dependencies',
    'Q3 Роли и ACL',
    'Q4 Triggers и preconditions',
    'Q5 Event/delivery states и invariants',
    'Q6 Основные сценарии',
    'Q7 Negative/retry/concurrency/privacy',
    'Q8 Data, audit, retention',
    'Q9 Поверхности и admin ownership',
    'Q10 Acceptance matrix',
    'Q11 Programmer handoff',
    'Q12 DoD и proof boundary',
    '**100/100**'
)
foreach ($row in $qRows) {
    Add-Check "codex-score:$row" $codex.Contains($row) '12-dimension standard'
}

$failed = @($checks | Where-Object { -not $_.pass })
$result = [pscustomobject]@{
    schema = 'functional_tz_g14_verifier.v1'
    status = if ($failed.Count -eq 0) { 'pass' } else { 'fail' }
    passed = $checks.Count - $failed.Count
    total = $checks.Count
    failed = $failed
    artifacts = $paths
}
$result | ConvertTo-Json -Depth 6
if ($failed.Count -gt 0) { exit 1 }
