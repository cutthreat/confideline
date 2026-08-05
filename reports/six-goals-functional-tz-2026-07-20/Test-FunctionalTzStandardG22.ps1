[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$panelRoot = Join-Path (Split-Path (Split-Path $root -Parent) -Parent) 'web\qa-reports\nebula-6-goals-master-plan-2026-06-11'

$paths = @{
    Pm = Join-Path $root 'etalon-tz-g2-2-timer-debit-pause.md'
    Html = Join-Path $root 'tz-g2-2-for-igor.html'
    Docx = Join-Path $root 'tz-g2-2-for-igor.docx'
    Codex = Join-Path $root 'codex-context-g2-2-timer-debit-pause.md'
    G2 = Join-Path $root 'tz-g2-billing-refunds-compensation.md'
    Vertical = Join-Path $root 'vertical-package-session-money.md'
    Admin = Join-Path $root 'admin-panel-settings-development-package.md'
    Owner = Join-Path $root 'owner-decisions.md'
    Panel = Join-Path $panelRoot 'task-tz.html'
    Index = Join-Path $panelRoot 'index.html'
    Task = Join-Path $panelRoot 'tasks\task-g2-timer.html'
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
$g2 = Get-Content -Raw -LiteralPath $paths.G2
$vertical = Get-Content -Raw -LiteralPath $paths.Vertical
$admin = Get-Content -Raw -LiteralPath $paths.Admin
$owner = Get-Content -Raw -LiteralPath $paths.Owner
$panel = Get-Content -Raw -LiteralPath $paths.Panel
$index = Get-Content -Raw -LiteralPath $paths.Index
$task = Get-Content -Raw -LiteralPath $paths.Task
$html = Get-Content -Raw -LiteralPath $paths.Html

$pmHeadings = @(
    '## 1. Цель',
    '## 2. Место G2.2 в общем продукте',
    '## 3. Термины',
    '## 4. Роли и видимость',
    '## 5. Обязательные invariants',
    '## 6. Условия фактического старта',
    '## 7. Trial',
    '## 8. Переход trial -> paid',
    '## 9. Начало и списание paid-минуты',
    '## 10. Граница следующей минуты',
    '## 11. Paid timer и отображение',
    '## 12. Бездействие во время paid',
    '## 13. Предупреждение о низком балансе',
    '## 14. Balance pause',
    '## 15. Пополнение и явное продолжение',
    '## 16. Потеря связи клиентом',
    '## 17. Потеря связи Агентом',
    '## 18. Одновременная потеря связи и сбой платформы',
    '## 19. Завершение и финансовый итог',
    '## 20. Refund и compensation boundary',
    '## 21. Настройки админ-панели',
    '## 22. Snapshots и audit',
    '## 23. Ошибки, retry и concurrency',
    '## 24. Критерии готового результата',
    '## 25. Действия Игоря'
)
foreach ($heading in $pmHeadings) {
    Add-Check "pm-heading:$heading" $pm.Contains($heading) 'required PM section'
}

foreach ($number in 1..30) {
    Add-Check "codex-heading:$number" $codex.Contains("## $number.") 'required Codex section'
}

$requiredPmConcepts = @(
    'Trial предоставляется как coupon/bonus entitlement на фиксированное число бесплатных минут.',
    'Стартовое значение entitlement - **3 минуты**.',
    'Trial не уменьшает credit balance.',
    'Если consent действует и полной стоимости достаточно, первая paid-минута начинается автоматически',
    'система атомарно:',
    'проверяет полную стоимость',
    'Завершение через любое время после start сохраняет полную стоимость этой минуты.',
    'Пока consultation остается `paid-active`, timer и списания продолжаются',
    'Стартовый threshold - **2 полные paid-минуты**',
    'Стартовая длительность - **5 минут**.',
    'Pause предоставляется один раз',
    'Автоматический старт paid после payment success запрещен.',
    'Client reconnect grace',
    'Agent reconnect grace',
    'один technical incident',
    'G2.2 не начисляет compensation автоматически.',
    'ручного решения super-admin',
    '`/ru/admin/settings/consultations`'
)
foreach ($phrase in $requiredPmConcepts) {
    Add-Check "pm-concept:$phrase" $pm.Contains($phrase) 'required owner decision'
}

Add-Check 'start:both-ready-consent-balance' (
    $pm.Contains('клиент подключен') -and
    $pm.Contains('Агент подключен и подтвердил готовность') -and
    $pm.Contains('для paid действует явный consent') -and
    $pm.Contains('для paid доступна полная стоимость следующей минуты')
) 'paid start guards are explicit'

Add-Check 'timer:server-authoritative' (
    $pm.Contains('Источник времени и финансового результата является серверным') -and
    $codex.Contains('Authoritative time contract') -and
    $codex.Contains('browser')
) 'browser clock is display-only'

Add-Check 'debit:atomic-exactly-once' (
    $pm.Contains('Одна логическая минута не может создать два debit') -and
    $codex.Contains('session_id + paid_minute_ordinal') -and
    $codex.Contains('Atomic minute-start unit')
) 'one started minute maps to one debit'

Add-Check 'balance:no-negative' (
    $pm.Contains('Balance не становится отрицательным') -and
    $codex.Contains('negative balance')
) 'last-credit race is covered'

Add-Check 'inactivity:no-hidden-pause' (
    $pm.Contains('Скрытая автоматическая pause из-за отсутствия сообщений запрещена') -and
    $pm.Contains('Reminder не выполняет auto-transition')
) 'inactivity does not silently stop billing'

Add-Check 'pause:single-snapshot' (
    $pm.Contains('Session получает свою единственную balance pause') -and
    $pm.Contains('Примененное значение фиксируется при начале pause') -and
    $codex.Contains('pause')
) 'single pause and applied settings are explicit'

Add-Check 'topup:explicit-continuation' (
    $pm.Contains('кнопку **«Продолжить консультацию»**') -and
    $pm.Contains('Автоматический старт paid после payment success запрещен')
) 'top-up never auto-resumes paid'

Add-Check 'reconnect:separate-graces' (
    $pm.Contains('client reconnect grace') -and
    $pm.Contains('agent reconnect grace') -and
    $pm.Contains('**60 секунд**')
) 'client and Agent timers are separate'

Add-Check 'incident:deduplicated' (
    $pm.Contains('один technical incident') -and
    $pm.Contains('Повторные сигналы одного сбоя связываются с тем же incident') -and
    $codex.Contains('incident')
) 'simultaneous/platform failure is one incident'

Add-Check 'compensation:manual-only' (
    $pm.Contains('Любой compensation grant также выполняется вручную super-admin') -and
    $admin.Contains('не создает автоматического начисления') -and
    $owner.Contains('Любые refund/compensation начисления выполняются вручную super-admin')
) 'no automatic financial grant path'

$sourceConcepts = @(
    'services/ServiceSessionRuntimeMeter.php',
    'services/ServiceSessionStateMachine.php',
    'services/ServiceSessionPricingGate.php',
    'models/ServiceSession.php',
    'models/ServiceSessionRuntimeEvent.php',
    'models/ServiceSessionLedgerEntry.php'
)
foreach ($phrase in $sourceConcepts) {
    Add-Check "source:$phrase" $codex.Contains($phrase) 'known source navigation'
}

Add-Check 'source:unmapped-not-proof' (
    $codex.Contains('untracked/unmapped reference') -and
    $codex.Contains('local_service_session_runtime_slice_present_unmapped_and_not_runtime_accepted')
) 'local source slice is not overclaimed'

Add-Check 'admin:placement' (
    $pm.Contains('после **«Настройки чата»** и перед **«Настройки фото»**') -and
    $admin.Contains('после «Настройки чата» и перед «Настройки фото»')
) 'consultation settings placement is consistent'

Add-Check 'admin:trial-single-editor' (
    $pm.Contains('только как read-only ссылка/readback') -and
    $pm.Contains('Единственный редактор количества и условий выдачи находится в G2.1 «Coupons»') -and
    $codex.Contains('Trial entitlement is not edited here') -and
    -not $codex.Contains('trial default minutes = 3')
) 'trial entitlement is edited only by G2.1 Coupons'

Add-Check 'admin:numeric-fields' (
    $pm.Contains('отдельная числовая input cell') -and
    $pm.Contains('current/draft/active version') -and
    $pm.Contains('история и rollback новой версией')
) 'all variable limits are manageable'

Add-Check 'g2:umbrella-aligned' (
    $g2.Contains('etalon-tz-g2-2-timer-debit-pause.md') -and
    $g2.Contains('Low-balance warning срабатывает при 2 полных минутах') -and
    $g2.Contains('Top-up не auto-resume')
) 'G2 umbrella uses final G2.2 decisions'

Add-Check 'vertical:aligned' (
    $vertical.Contains('G2.2: фиксированный free-minute trial') -and
    $vertical.Contains('| M23 | Simultaneous/platform interruption')
) 'cross-goal vertical is updated'

Add-Check 'owner:o12' (
    $owner.Contains('## O12. Полный финансовый контракт G2.2') -and
    $owner.Contains('Low-balance warning threshold — 2 полные минуты') -and
    $owner.Contains('клиент явно нажимает «Продолжить консультацию»')
) 'owner decisions are durable'

Add-Check 'html:title' $html.Contains('G2.2 «Таймер, списание и остановка консультации»') 'human-readable HTML generated'
Add-Check 'docx:nonempty' ((Get-Item -LiteralPath $paths.Docx).Length -gt 10000) 'DOCX generated'

Add-Check 'panel:artifact-mapping' (
    $panel.Contains('tz-g2-2-for-igor.html') -and
    $panel.Contains('codex-context-g2-2-timer-debit-pause.md') -and
    $panel.Contains('tz-g2-2-for-igor.docx')
) 'both handoff types and DOCX are mapped'

Add-Check 'panel:spec-ready' (
    $panel.Contains('tasks["task-g2-timer"].stage = "etalon_spec_ready_runtime_open"') -and
    $panel.Contains('tasks["task-g2-timer"].tzReady = 100')
) 'panel separates specification from runtime'

Add-Check 'task-tz:readiness-100' (
    $index.Contains('"task-g2-timer": { code:"G2.2"') -and
    $index.Contains('"task-g2-timer": { code:"G2.2", title:"Таймер и остановка", priority:"P0"') -and
    $panel.Contains('"task-g2-timer": { code:"G2.2"') -and
    $panel.Contains('tzReady:100')
) 'master list and task card status updated'

Add-Check 'task:current-requirement' (
    $task.Contains('фиксированные бесплатные минуты') -and
    $task.Contains('Полная цена списывается атомарно в начале каждой started minute') -and
    $task.Contains('runtime не принят') -and
    -not $task.Contains('<b>Проверено локально:</b>')
) 'task card shows current specification without false runtime claim'

$forbiddenPm = @(
    'CREATE TABLE',
    'ALTER TABLE',
    'class ',
    'SQL',
    'endpoint /api/'
)
foreach ($token in $forbiddenPm) {
    Add-Check "pm-no-implementation:$token" (-not $pm.Contains($token)) 'Igor owns implementation'
}

$qRows = @(
    'Q1. Цель и измеримый результат',
    'Q2. Границы задачи и зависимости',
    'Q3. Роли, права и видимость данных',
    'Q4. Термины, сущности и источники истины',
    'Q5. Пользовательские и административные сценарии',
    'Q6. Бизнес-правила, расчеты и ограничения',
    'Q7. Состояния, ошибки и пограничные случаи',
    'Q8. Настройки админ-панели и их размещение',
    'Q9. Уведомления, локализация и отображение',
    'Q10. Acceptance criteria и тестовые примеры',
    'Q11. Интеграции, данные, безопасность и audit',
    'Q12. Definition of Done и граница доказательств',
    '**100/100**'
)
foreach ($row in $qRows) {
    Add-Check "codex-score:$row" $codex.Contains($row) '12-dimension standard'
}

$failed = @($checks | Where-Object { -not $_.pass })
$result = [pscustomobject]@{
    schema = 'functional_tz_g22_verifier.v1'
    status = if ($failed.Count -eq 0) { 'pass' } else { 'fail' }
    passed = $checks.Count - $failed.Count
    total = $checks.Count
    failed = $failed
    artifacts = $paths
}
$result | ConvertTo-Json -Depth 6
if ($failed.Count -gt 0) { exit 1 }
