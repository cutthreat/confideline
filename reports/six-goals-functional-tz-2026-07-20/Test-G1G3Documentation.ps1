[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$panelRoot = Resolve-Path (Join-Path $root '..\..\web\qa-reports\nebula-6-goals-master-plan-2026-06-11')

$tasks = @(
    @{ Code='G1.1'; Slug='g1-1-service-session'; Html='tz-g1-1-for-igor'; Panel='task-g1-session' },
    @{ Code='G1.2'; Slug='g1-2-role-chat'; Html='tz-g1-2-for-igor'; Panel='task-g1-chat' },
    @{ Code='G1.3'; Slug='g1-3-status-history'; Html='tz-g1-3-for-igor'; Panel='task-g1-statuses' },
    @{ Code='G1.4'; Slug='g1-4-chat-notifications'; Html='tz-g1-4-for-igor'; Panel='task-g1-chat-notifications' },
    @{ Code='G2.1'; Slug='g2-1-price-balance'; Html='tz-g2-1-for-igor'; Panel='task-g2-pricing' },
    @{ Code='G2.2'; Slug='g2-2-timer-debit-pause'; Html='tz-g2-2-for-igor'; Panel='task-g2-timer' },
    @{ Code='G2.3'; Slug='g2-3-refunds'; Html='tz-g2-3-for-igor'; Panel='task-g2-refund' },
    @{ Code='G2.4'; Slug='g2-4-agent-accruals'; Html='tz-g2-4-for-igor'; Panel='task-g2-accruals' },
    @{ Code='G3.1'; Slug='g3-1-storefront'; Html='tz-g3-1-for-igor'; Panel='task-g3-home' },
    @{ Code='G3.2'; Slug='g3-2-expert-catalog'; Html='tz-g3-2-for-igor'; Panel='task-g3-catalog' },
    @{ Code='G3.3'; Slug='g3-3-expert-profile'; Html='tz-g3-3-for-igor'; Panel='task-g3-profile' },
    @{ Code='G3.4'; Slug='g3-4-matching-start'; Html='tz-g3-4-for-igor'; Panel='task-g3-quiz' },
    @{ Code='G3.5'; Slug='g3-5-client-path-qa'; Html='tz-g3-5-for-igor'; Panel='task-g3-qa' },
    @{ Code='G3.6'; Slug='g3-6-profile-completeness'; Html='tz-g3-6-for-igor'; Panel='task-g3-field-weight' },
    @{ Code='G3.7'; Slug='g3-7-eligibility-rotation'; Html='tz-g3-7-for-igor'; Panel='task-g3-rotation' }
)

$checks = [System.Collections.Generic.List[object]]::new()

function Add-Check {
    param(
        [string]$Id,
        [bool]$Passed,
        [string]$Detail
    )
    $checks.Add([pscustomobject]@{ id=$Id; passed=$Passed; detail=$Detail })
}

function Read-Utf8 {
    param([string]$Path)
    return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}

foreach ($task in $tasks) {
    $igorPath = Join-Path $root ("etalon-tz-{0}.md" -f $task.Slug)
    $codexPath = Join-Path $root ("codex-context-{0}.md" -f $task.Slug)
    $htmlPath = Join-Path $root ("{0}.html" -f $task.Html)
    $docxPath = Join-Path $root ("{0}.docx" -f $task.Html)

    foreach ($pair in @(
        @{ Kind='igor'; Path=$igorPath },
        @{ Kind='codex'; Path=$codexPath },
        @{ Kind='html'; Path=$htmlPath },
        @{ Kind='docx'; Path=$docxPath }
    )) {
        $exists = Test-Path -LiteralPath $pair.Path -PathType Leaf
        Add-Check "$($task.Code):artifact:$($pair.Kind)" $exists $pair.Path
    }

    if (
        (Test-Path -LiteralPath $igorPath) -and
        (Test-Path -LiteralPath $htmlPath) -and
        (Test-Path -LiteralPath $docxPath)
    ) {
        $sourceTime = (Get-Item -LiteralPath $igorPath).LastWriteTimeUtc
        $renderFresh = (
            (Get-Item -LiteralPath $htmlPath).LastWriteTimeUtc -ge $sourceTime -and
            (Get-Item -LiteralPath $docxPath).LastWriteTimeUtc -ge $sourceTime
        )
        Add-Check "$($task.Code):artifact:render-fresh" $renderFresh 'HTML/DOCX не старше PM source'
    }

    if ((Test-Path -LiteralPath $igorPath) -and (Test-Path -LiteralPath $htmlPath)) {
        $sourceTextForRender = Read-Utf8 $igorPath
        $htmlTextForRender = Read-Utf8 $htmlPath
        $fenceRendered = (
            $htmlTextForRender -notmatch '<p>``<code>text' -and
            (
                $sourceTextForRender -notmatch '(?m)^```' -or
                $htmlTextForRender -match '<pre><code(?: class="language-[^"]+")?>'
            )
        )
        Add-Check "$($task.Code):artifact:fenced-code" $fenceRendered 'Fenced blocks сохранены как pre/code без буквальных backticks'
    }

    if (Test-Path -LiteralPath $igorPath) {
        $text = Read-Utf8 $igorPath
        Add-Check "$($task.Code):igor:title" ($text -match "(?m)^# .*$([regex]::Escape($task.Code))") 'Заголовок содержит task code'
        Add-Check "$($task.Code):igor:goal" ($text -match "(?im)^## .*цель|измерим(ый|ого) результат") 'Есть цель/результат'
        Add-Check "$($task.Code):igor:scope" ($text -match "(?im)^## .*границ|scope|не входит") 'Есть границы'
        Add-Check "$($task.Code):igor:roles" ($text -match "(?im)^## .*рол|доступ|видимость") 'Есть роли/доступ'
        Add-Check "$($task.Code):igor:admin" ($text -match "(?im)^## .*админ|admin-панел|админ-панел") 'Есть admin ownership'
        Add-Check "$($task.Code):igor:acceptance" ($text -match "(?im)^## .*критери|приемк|acceptance") 'Есть критерии результата'
        Add-Check "$($task.Code):igor:handoff" ($text -match "(?im)^## .*действия Игоря|handoff|что должен передать") 'Есть handoff'
    }

    if (Test-Path -LiteralPath $codexPath) {
        $text = Read-Utf8 $codexPath
        Add-Check "$($task.Code):codex:title" ($text -match "(?m)^# .*$([regex]::Escape($task.Code))") 'Заголовок содержит task code'
        Add-Check "$($task.Code):codex:passport" ($text -match "(?im)^## .*паспорт|назначение") 'Есть паспорт'
        Add-Check "$($task.Code):codex:scope" ($text -match "(?im)^## .*scope|границ") 'Есть scope'
        Add-Check "$($task.Code):codex:invariants" ($text -match "(?im)^## .*invariant|неизменяем") 'Есть invariants'
        Add-Check "$($task.Code):codex:source" ($text -match "(?im)^## .*source|навигац|текущ") 'Есть source navigation/current facts'
        Add-Check "$($task.Code):codex:acceptance" ($text -match "(?im)^## .*acceptance|приемк") 'Есть acceptance'
        Add-Check "$($task.Code):codex:dod" ($text -match "(?im)^## .*definition of done|DoD|proof boundary") 'Есть DoD/proof boundary'
    }
}

$globalDocs = @(
    'current-site-state-g1-g3-2026-07-29.md',
    'target-site-vision-g1-g3.md',
    'g1-g3-product-consistency-register.md',
    'g1-g3-documentation-matrix.md',
    'g1-g3-product-object-dictionary.md',
    'g1-g3-route-and-admin-ownership-matrix.md',
    'owner-decisions.md'
)
foreach ($name in $globalDocs) {
    Add-Check "global:$name" (Test-Path -LiteralPath (Join-Path $root $name)) $name
}

$canonicalMarkdown = Get-ChildItem -LiteralPath $root -File |
    Where-Object { $_.Name -match '^(etalon-tz|codex-context)-(g1|g2|g3)-.*\.md$' }
$canonicalText = ($canonicalMarkdown | ForEach-Object { Read-Utf8 $_.FullName }) -join "`n"
Add-Check 'semantic:no-fake-experts' -Passed:($canonicalText -notmatch 'Solara Ortiz|Amara Moon') -Detail 'Канонические ТЗ не содержат demo profiles'
Add-Check 'semantic:no-usd-per-minute' -Passed:($canonicalText -notmatch '(?i)(USD|\$)\s*(?:за|/|per)\s*(?:started\s*)?(?:minute|минут)') -Detail 'Нет USD/minute как consultation price'
Add-Check 'semantic:credits-per-minute' -Passed:($canonicalText -match '(?i)credits.{0,30}(?:minute|минут)') -Detail 'Credits/minute присутствует'
Add-Check 'semantic:no-second-state-machine' -Passed:($canonicalText -notmatch '(?im)^\s*[-*]?\s*`?(trial_active|paid_active)`?\s*(?:$|[-—:])') -Detail 'Нет trial_active/paid_active как канонических persisted states'
Add-Check 'semantic:review-safety' -Passed:($canonicalText -match 'verified_consultation=false' -and $canonicalText -match '(?i)не влияет.{0,40}rating|не участвует.{0,40}rating') -Detail 'Historical testimonial не влияет на rating'
Add-Check 'semantic:geo-boundary' -Passed:($canonicalText -match '(?i)country/city.{0,120}hard|hard.{0,120}country/city' -and $canonicalText -match '(?i)dashboard.{0,160}(?:не.*hard|явн)') -Detail 'Geo hard scope отделён от общего dashboard'
Add-Check 'semantic:kpi-pilot-disabled' -Passed:($canonicalText -match '(?i)KPI.{0,80}disabled|disabled.{0,80}KPI') -Detail 'KPI influence disabled в pilot'

$indexPath = Join-Path $panelRoot 'index.html'
$taskTzPath = Join-Path $panelRoot 'task-tz.html'
$indexText = Read-Utf8 $indexPath
$taskTzText = Read-Utf8 $taskTzPath

$g11Pm = Read-Utf8 (Join-Path $root 'etalon-tz-g1-1-service-session.md')
$g11Codex = Read-Utf8 (Join-Path $root 'codex-context-g1-1-service-session.md')
$g12Pm = Read-Utf8 (Join-Path $root 'etalon-tz-g1-2-role-chat.md')
$g12Codex = Read-Utf8 (Join-Path $root 'codex-context-g1-2-role-chat.md')
$g1Umbrella = Read-Utf8 (Join-Path $root 'tz-g1-chat-service-session.md')
$g11Mock = Read-Utf8 (Join-Path $panelRoot 'tasks\task-g1-session.html')
$g13Pm = Read-Utf8 (Join-Path $root 'etalon-tz-g1-3-status-history.md')
$g13Codex = Read-Utf8 (Join-Path $root 'codex-context-g1-3-status-history.md')
$g14Pm = Read-Utf8 (Join-Path $root 'etalon-tz-g1-4-chat-notifications.md')
$g14Codex = Read-Utf8 (Join-Path $root 'codex-context-g1-4-chat-notifications.md')
$g21Pm = Read-Utf8 (Join-Path $root 'etalon-tz-g2-1-price-balance.md')
$g21Codex = Read-Utf8 (Join-Path $root 'codex-context-g2-1-price-balance.md')
$g22Pm = Read-Utf8 (Join-Path $root 'etalon-tz-g2-2-timer-debit-pause.md')
$g22Codex = Read-Utf8 (Join-Path $root 'codex-context-g2-2-timer-debit-pause.md')
$g23Pm = Read-Utf8 (Join-Path $root 'etalon-tz-g2-3-refunds.md')
$g24Pm = Read-Utf8 (Join-Path $root 'etalon-tz-g2-4-agent-accruals.md')
$g24Codex = Read-Utf8 (Join-Path $root 'codex-context-g2-4-agent-accruals.md')
$g31Pm = Read-Utf8 (Join-Path $root 'etalon-tz-g3-1-storefront.md')
$g31Codex = Read-Utf8 (Join-Path $root 'codex-context-g3-1-storefront.md')
$g32Pm = Read-Utf8 (Join-Path $root 'etalon-tz-g3-2-expert-catalog.md')
$g32Codex = Read-Utf8 (Join-Path $root 'codex-context-g3-2-expert-catalog.md')
$g33Pm = Read-Utf8 (Join-Path $root 'etalon-tz-g3-3-expert-profile.md')
$g33Codex = Read-Utf8 (Join-Path $root 'codex-context-g3-3-expert-profile.md')
$g34Pm = Read-Utf8 (Join-Path $root 'etalon-tz-g3-4-matching-start.md')
$g34Codex = Read-Utf8 (Join-Path $root 'codex-context-g3-4-matching-start.md')
$g35Pm = Read-Utf8 (Join-Path $root 'etalon-tz-g3-5-client-path-qa.md')
$g35Codex = Read-Utf8 (Join-Path $root 'codex-context-g3-5-client-path-qa.md')
$g36Pm = Read-Utf8 (Join-Path $root 'etalon-tz-g3-6-profile-completeness.md')
$g36Codex = Read-Utf8 (Join-Path $root 'codex-context-g3-6-profile-completeness.md')
$g37Pm = Read-Utf8 (Join-Path $root 'etalon-tz-g3-7-eligibility-rotation.md')
$g37Codex = Read-Utf8 (Join-Path $root 'codex-context-g3-7-eligibility-rotation.md')
$g3Umbrella = Read-Utf8 (Join-Path $root 'tz-g3-catalog-profile-rotation.md')
$g2Umbrella = Read-Utf8 (Join-Path $root 'tz-g2-billing-refunds-compensation.md')
$consistencyText = Read-Utf8 (Join-Path $root 'g1-g3-product-consistency-register.md')
$adminText = Read-Utf8 (Join-Path $root 'admin-panel-settings-development-package.md')
$routeText = Read-Utf8 (Join-Path $root 'g1-g3-route-and-admin-ownership-matrix.md')
$targetText = Read-Utf8 (Join-Path $root 'target-site-vision-g1-g3.md')
$dictionaryText = Read-Utf8 (Join-Path $root 'g1-g3-product-object-dictionary.md')
$architectureText = Read-Utf8 (Join-Path $root 'product-architecture-g1-g6-ownership-map.md')
$completionText = Read-Utf8 (Join-Path $root 'completion-audit.md')
$sessionVerticalText = Read-Utf8 (Join-Path $root 'vertical-package-session-money.md')
$deliveryText = Read-Utf8 (Join-Path $root 'delivery-matrix.md')
$readmeText = Read-Utf8 (Join-Path $root 'README.md')
$clientVerticalText = Read-Utf8 (Join-Path $root 'vertical-package-client-pilot.md')
$operationsVerticalText = Read-Utf8 (Join-Path $root 'vertical-package-operations-pilot.md')
$closeoutText = Read-Utf8 (Join-Path $root 'g1-g3-documentation-closeout-2026-07-29.md')
$ownerText = Read-Utf8 (Join-Path $root 'owner-decisions.md')
$crosscutSettingsText = Read-Utf8 (Join-Path $root 'tz-crosscut-admin-managed-settings.md')
$g11AdminMock = Read-Utf8 (Join-Path $panelRoot 'g11-consultation-admin-mockup.html')
$taskReadinessText = Read-Utf8 (Join-Path $panelRoot 'task-readiness.html')
$g11AdminStateSelect = [regex]::Match($g11AdminMock, '(?s)<select[^>]+id="state-select"[^>]*>.*?</select>').Value

Add-Check 'semantic:balance-pause-primary-state' (
    $consistencyText -match '(?i)`balance_pause`.{0,80}primary state' -and
    $consistencyText -notmatch '(?i)Balance pause.{0,40}финансовый подстатус'
) 'balance_pause — primary state; waiting/reconnect — подстатусы'

Add-Check 'semantic:trial-single-editor' (
    $adminText -match '(?i)Trial entitlement default.{0,100}G2\.1.{0,80}Coupons' -and
    $g22Pm -match '(?i)Trial entitlement.{0,180}read-only' -and
    $g22Codex -match '(?i)Trial entitlement is not edited here' -and
    $g22Codex -notmatch '(?im)^-\s*trial default minutes\s*='
) 'Trial entitlement редактируется только в G2.1 Coupons'

Add-Check 'semantic:request-clock-replacement' (
    $g13Pm -match '(?i)15-минутный.{0,180}заменяется.{0,180}60 минут' -and
    $g13Pm -match '(?i)новый примененный 15-минутный deadline' -and
    $g13Codex -match '(?i)at most one active request clock pointer'
) 'Clarification заменяет request clock; после ответа запускается новый Expert clock'

Add-Check 'semantic:dual-path-consent' (
    $g13Pm -match '(?i)принятия клиентского запроса.{0,240}confirmation card' -and
    $g13Pm -match '(?i)Предложение Эксперта.{0,180}явное принятие является consent' -and
    $g22Pm -match '(?i)trial=`0`' -and
    $g22Pm -match '(?i)consent version.{0,120}snapshot'
) 'Оба пути требуют явный client consent до session; trial=0 не обходит его'

Add-Check 'semantic:g11-session-after-consent' (
    $g11Pm -match '(?i)только после committed explicit client consent' -and
    $g11Pm -match '(?i)Принятие клиентского запроса Агентом.{0,180}не создаёт session' -and
    $g11Codex -match '(?i)Service session создаётся атомарно и exactly once только после committed explicit client consent' -and
    $g12Pm -match '(?i)Agent accept запроса не создаёт session.{0,180}committed client consent создаёт exactly one session' -and
    $g12Codex -match '(?i)exactly one session создаётся только после committed explicit client consent' -and
    $g1Umbrella -match '(?i)Agent accept открывает confirmation card, но не создаёт session' -and
    $taskTzText -match '(?i)service_session создаётся exactly once только после committed client consent' -and
    (($g11Pm + $g11Codex + $g12Pm + $g12Codex + $g13Pm + $g1Umbrella + $taskTzText) -notmatch '(?i)session созда[её]тся.{0,80}(?:сразу |автоматически )?после (?:Agent )?accept') -and
    $g13Pm -match '(?i)принятие запроса Агентом само по себе session не создаёт'
) 'G1.1/G1.2/G1.3/G2.2 едины: session создаётся только после committed client consent'

Add-Check 'semantic:g11-mock-canonical-states' (
    $g11Mock -match 'connecting' -and
    $g11Mock -match 'balance_pause' -and
    $g11Mock -match 'completed' -and
    $g11Mock -match 'end_reason' -and
    $g11Mock -match '(?i)явный consent клиента создаёт exactly one service_session' -and
    $g11Mock -notmatch 'connected_trial|trial_active|paid_active|manual_end|abnormal_end'
) 'G1.1 interactive mock использует канонические primary states и completion fields'

Add-Check 'semantic:g11-admin-mock-canonical-flow' (
    $g11AdminStateSelect -match 'value="connecting"' -and
    $g11AdminStateSelect -match 'value="trial"' -and
    $g11AdminStateSelect -match 'value="paid"' -and
    $g11AdminStateSelect -match 'value="balance_pause"' -and
    $g11AdminStateSelect -match 'value="completed"' -and
    $g11AdminStateSelect -notmatch 'value="technical"' -and
    $g11AdminMock -match '(?i)Агент принял request.{0,120}consultation ещё не создана' -and
    $g11AdminMock -match '(?i)Committed consent.{0,180}exactly one session' -and
    $g11AdminMock -match '(?i)Принятие предложения клиентом само является committed consent' -and
    $g11AdminMock -match '(?i)Technical end не является отдельным primary state.{0,180}technical_reason'
) 'Подключённый admin mock не создаёт session до consent и не вводит Technical end как primary state'

Add-Check 'semantic:trial-balance-independence' (
    $g2Umbrella -match '(?i)trial.{0,180}независимо от balance' -and
    $g21Pm -match '(?i)trial.{0,180}не зависит от balance' -and
    $dictionaryText -match '(?i)trial начинается после consent/readiness независимо от balance' -and
    $consistencyText -match '(?i)trial после consent/readiness проходит независимо от balance' -and
    $g2Umbrella -notmatch '(?i)(?:нулев|недостаточн).{0,80}balance\s+(?:блокирует|запрещает).{0,80}trial'
) 'Бесплатный trial не зависит от balance; balance проверяется перед paid minute'

Add-Check 'semantic:no-automatic-refund-compensation' (
    $g12Pm -match '(?i)Эксперт/Агент может инициировать проверку или рекомендовать купон.{0,160}фактическое решение и выдачу выполняет только super-admin' -and
    $g22Pm -match '(?i)Agent/platform incident не выполняет automatic compensation' -and
    $g2Umbrella -match '(?i)Любое фактическое начисление выполняется вручную super-admin' -and
    $consistencyText -match '(?i)не выполняет автоматический refund или compensation' -and
    $consistencyText -match '(?i)фактическое начисление требует отдельного ручного решения super-admin' -and
    $dictionaryText -match '(?i)фактически выполняет только super-admin.{0,180}Автоматическое правило.{0,120}не выполняет движение' -and
    $targetText -match '(?i)фактически выполняется только после ручного решения super-admin.{0,180}не начисляет credits само' -and
    $architectureText -match '(?i)Фактический grant выполняет только super-admin вручную.{0,180}автоматическое правило может создать только candidate/preview' -and
    $architectureText -match '(?i)Владелец правил/шаблонов и фактического начисления: G2\.1' -and
    $architectureText -notmatch '(?i)Compensation.{0,180}по включенному правилу или ручному решению'
) 'Technical incident создаёт candidate/preview, но фактическое начисление всегда ручное'

Add-Check 'semantic:g21-profile-price-single-editor' (
    $g21Pm -match '(?is)Административная карточка экспертной анкеты.{0,180}read-only блок «Цена консультации»' -and
    $g21Pm -match '(?i)Редактирование profile override в карточке анкеты запрещено' -and
    $g21Codex -match '(?i)Expert admin card is read-only for consultation price' -and
    $g21Codex -match '(?i)/ru/admin/settings/prices`? is the only editor for both global and profile price rules' -and
    $taskTzText -match '(?i)карточка анкеты показывает read-only effective price и ссылку' -and
    $g21Codex -notmatch '(?i)Add effective price control' -and
    $taskTzText -notmatch '(?i)размещение:.{0,180}profile override в карточке анкеты'
) 'Global/profile price редактируются только на /settings/prices; карточка анкеты read-only'

Add-Check 'semantic:g11-admin-mock-explicit-resume' (
    $g11AdminMock -match '(?i)Пополнение до deadline только пополнит balance' -and
    $g11AdminMock -match '(?i)лишь после явного нажатия клиентом «Продолжить консультацию»' -and
    $g1Umbrella -match '(?i)Пополнение до deadline только увеличивает balance.{0,220}явного нажатия клиентом «Продолжить консультацию»' -and
    $sessionVerticalText -match '(?i)без auto-resume.{0,180}explicit client continue' -and
    (($g11AdminMock + $g1Umbrella + $sessionVerticalText) -notmatch '(?i)Пополнение до deadline (?:продолжит|возобновляет) (?:эту |текущую )?(?:consultation|session)')
) 'Balance top-up не auto-resume в mock, umbrella и vertical; требуется явная команда клиента'

Add-Check 'semantic:g11-admin-mock-actual-actor' (
    $g11AdminMock -match 'actual_actor=super_admin' -and
    $g11AdminMock -match '(?i)server-derived' -and
    $g11AdminMock -match '(?i)не может быть подменён выбранным инициатором' -and
    $g11AdminMock -match 'terminal_initiator='
) 'Mock разделяет server-derived actual actor и terminal initiator'

Add-Check 'semantic:admin-coupon-template-not-grant-owner' (
    $adminText -match '(?i)/ru/admin/settings/coupons.{0,180}правил и шаблонов' -and
    $adminText -match '(?i)фактическое ручное начисление.{0,160}карточку баланса пользователя'
) 'Coupons владеет правилами/шаблонами; фактический grant выполняется в карточке баланса'

Add-Check 'semantic:g24-unset-policy-no-accrual' (
    $g2Umbrella -match '(?i)начисление создаётся только если.{0,180}active compensation policy' -and
    $g2Umbrella -match '(?i)при `draft/unset`.{0,180}денежное начисление не создаётся' -and
    $ownerText -match '(?i)session-linked basis со статусом `recorded/configuration_pending`' -and
    $ownerText -match '(?i)до active complete policy денежный accrual не создаётся' -and
    $ownerText -notmatch '(?i)Consultation accrual возникает сразу после консультации'
) 'Unset compensation policy сохраняет ledger, но не создаёт денежное начисление'

Add-Check 'semantic:panel-primary-state-wording' (
    $taskTzText -match '(?i)Primary state model охватывает только connecting, trial, paid, balance_pause и completed' -and
    $taskTzText -match '(?i)consent является предшествующим фактом, а reconnect — подстатусом'
) 'Панель не смешивает consent/reconnect с primary states'

Add-Check 'semantic:panel-archive-not-source' (
    $taskTzText -match '(?i)Канонический источник требований — открытый основной функциональный документ G1\.1' -and
    $taskTzText -match '(?i)Интерактивный HTML-макет является визуальным приложением.+не подменяет основной документ' -and
    $taskTzText -match 'sourcePath:"g11-consultation-admin-mockup\.html"' -and
    $taskTzText -notmatch 'sourcePath:"tasks/task-g1-session\.html"' -and
    $taskTzText -match '(?i)Активный демонстрационный макет; канонические требования находятся в основном функциональном документе G1\.1'
) 'Архивная task page не объявляется источником текущих требований'

Add-Check 'semantic:g2-defaults-single-register' (
    $g21Pm -match '(?s)`basic`.{0,120}150.{0,120}22\.99 USD' -and
    $g21Pm -match '(?s)`standard`.{0,120}300.{0,120}42\.99 USD' -and
    $g21Pm -match '(?s)`plus`.{0,120}600.{0,120}79\.99 USD' -and
    $g22Pm -match '(?i)Стартовый threshold.{0,80}2 полные paid-минуты' -and
    $g23Pm -match '(?i)Стартовый target.{0,80}72 часа' -and
    $g23Pm -match '(?i)client appeal window - 7 дней' -and
    $g24Pm -match '(?i)Стартовый compensation period.{0,80}weekly' -and
    $consistencyText -match '(?i)Expert SLA compensation proposal.{0,80}1 бонусная минута, только manual super-admin grant' -and
    $crosscutSettingsText -match '(?i)Client reconnect grace\s*\|\s*60\s*\|\s*секунд' -and
    $crosscutSettingsText -match '(?i)core clocks и не является исчерпывающим реестром' -and
    $crosscutSettingsText -match 'admin-panel-settings-development-package\.md' -and
    $crosscutSettingsText -match 'g1-g3-product-consistency-register\.md'
) 'Канонический реестр сохраняет согласованные стартовые значения G2 без расхождений'

Add-Check 'semantic:g35-dual-initiation-e2e' (
    $g35Pm -match '(?i)7A\. Запрос создаёт клиент' -and
    $g35Pm -match '(?is)Агент принимает request.{0,260}confirmation card.{0,260}Клиент явно подтверждает' -and
    $g35Pm -match '(?i)7B\. Начать консультацию предлагает Эксперт' -and
    $g35Pm -match '(?i)Принятие предложения клиентом само является committed consent' -and
    $g35Pm -match '(?i)G3\.1–G3\.7' -and
    $g35Pm -match '(?i)актуального admission G6\.4' -and
    $g35Codex -match '(?i)S1A\. Full positive — client request' -and
    $g35Codex -match '(?i)S1B\. Full positive — Expert offer' -and
    $g35Codex -match '(?i)G3\.1–G3\.7.{0,180}G3\.7 eligibility/manual order' -and
    $g35Codex -match '(?i)G6\.1–G6\.4/G6\.7.{0,180}versioned admission' -and
    $g35Codex -match 'E04A' -and $g35Codex -match 'E04B' -and
    $g35Pm -match '(?i)актуальный versioned admission G6\.4.{0,240}`admitted_active`' -and
    $g35Pm -match '(?i)Missing admission.{0,180}не создаёт session/debit.{0,100}`NO_GO`' -and
    $g35Pm -match '(?i)Stale/expired admission.{0,180}fail-closed' -and
    $g35Pm -match '(?i)Failed/blocked admission.{0,180}запрещает paid flow' -and
    $g35Codex -match '(?i)E23.{0,240}no eligibility/session/debit.{0,120}NO_GO' -and
    $g35Codex -match '(?i)E24.{0,240}fail-closed.{0,160}NO_GO' -and
    $g35Codex -match '(?i)E25.{0,260}no financial side effect.{0,100}NO_GO'
) 'G3.5 отдельно проверяет client-request и Expert-offer порядок'

Add-Check 'semantic:g36-input-g37-owner' (
    $g32Pm -match '(?i)completeness и blocker input.{0,40}G3\.6' -and
    $g32Pm -match '(?i)display/action eligibility.{0,80}G3\.7' -and
    $g32Codex -match '(?i)G3\.6 never grants display/action eligibility'
) 'G3.6 даёт completeness/blocker input; G3.7 владеет итоговым решением'

Add-Check 'semantic:g36-taxonomy-input-boundary' (
    $g36Pm -match 'expert_specialization_taxonomy_v1_legacy' -and
    $g36Pm -match 'expert_specialization_taxonomy_v2' -and
    $g36Pm -match '(?i)Legacy IDs не переиндексированы' -and
    $g36Pm -match '(?i)только G3\.7 формирует итоговые `display_eligible`, `capabilities\[\]`, `reason_codes\[\]`' -and
    $g36Pm -match '(?i)прямого «допустить/исключить из каталога» в G3\.6 нет' -and
    $g36Codex -match '(?i)финальный display/action eligibility рассчитывает только G3\.7' -and
    $g36Codex -match '(?i)paid_start_eligible.{0,120}G1/G2/G6'
) 'G3.6 владеет taxonomy/completeness input, но не финальным eligibility или paid start'

Add-Check 'semantic:eligibility-contract' (
    $g37Pm -match 'display_eligible: boolean' -and
    $g37Pm -match 'capabilities: string\[\]' -and
    $g37Pm -match 'reason_codes: string\[\]' -and
    $g37Codex -match '(?i)paid_start_eligible.{0,100}forbidden.{0,120}cached' -and
    $dictionaryText -match 'display_eligible: boolean' -and
    $adminText -match '(?i)paid_start_eligible.{0,120}не входит в контракт и настройки G3\.7' -and
    $adminText -match '(?i)G1/G2/G6.{0,500}На экране G3\.7 допускается только read-only readback' -and
    $routeText -match '(?i)только read-only fresh `paid_start_eligible` readback.{0,100}G1/G2/G6' -and
    $targetText -match '(?i)только read-only fresh paid-start readback.{0,100}G1/G2/G6'
) 'Eligibility имеет один contract; paid-start — отдельный fresh guard'

Add-Check 'semantic:g3-review-single-owner' (
    $g31Pm -match '(?i)G3\.1 владеет только представлением блока отзывов на главной' -and
    $g31Pm -match 'home_review_card_limit' -and
    $g31Codex -notmatch '(?i)manage review display rules and historical override' -and
    $g33Pm -match '(?i)единственный владелец review policy, eligibility, moderation, author modes, aggregate/rating и historical override' -and
    $g33Pm -match 'profile_review_card_limit' -and
    $adminText -match '(?i)G3\.3 Reviews — единственный owner review policy' -and
    $targetText -match '(?i)G3\.1 владеет только home presentation' -and
    $architectureText -match '(?i)Содержимое → Отзывы.{0,180}moderation queue' -and
    $architectureText -match '(?i)review policy не дублируется.{0,120}/ru/admin/settings/reviews'
) 'Home review presentation и review policy имеют разных единственных владельцев без дубля'

$storefrontNumericKeys = @(
    'home_topic_limit_desktop',
    'home_topic_limit_mobile',
    'home_expert_card_limit',
    'expert_card_specialization_limit',
    'home_faq_limit',
    'home_recent_consultation_limit',
    'home_review_card_limit'
)
$allStorefrontNumericDocsComplete = $true
foreach ($key in $storefrontNumericKeys) {
    foreach ($text in @($g31Pm, $g31Codex, $adminText)) {
        if ($text -notmatch [regex]::Escape($key)) {
            $allStorefrontNumericDocsComplete = $false
        }
    }
}
Add-Check 'semantic:g31-admin-numeric-defaults' (
    $allStorefrontNumericDocsComplete -and
    $g31Pm -match '(?i)home_topic_limit_desktop`\s*\|\s*6' -and
    $g31Pm -match '(?i)home_topic_limit_mobile`\s*\|\s*4' -and
    $g31Pm -match '(?i)home_expert_card_limit`\s*\|\s*6' -and
    $g31Pm -match '(?i)home_review_card_limit`\s*\|\s*3' -and
    $targetText -match '(?i)6` тем на desktop и `4` на mobile.{0,160}`6` карточек Экспертов' -and
    $taskTzText -match '(?i)темы 6 desktop / 4 mobile, 6 карточек Экспертов'
) 'Все согласованные числовые лимиты G3.1 имеют отдельные admin cells и стартовые значения'

Add-Check 'semantic:g33-dependency-owners' (
    $g33Codex -match '(?i)G3\.2 catalog/card consumer' -and
    $g33Codex -match '(?i)G3\.6 taxonomy/completeness owner' -and
    $g33Codex -match '(?i)G3\.7 final display/action eligibility and ranking owner' -and
    $g33Codex -notmatch '(?i)G3\.2 taxonomy/card' -and
    $g33Codex -notmatch '(?i)G3\.6 eligibility/completeness'
) 'G3.3 правильно читает G3.2/G3.6/G3.7 boundaries'

$surfaceIds = @('home','dashboard_catalog','country','city','category','matching_result','thematic_block','expert_profile')
$surfaceDocs = @($g36Pm,$g36Codex,$g37Pm,$g37Codex,$g3Umbrella,$adminText,$dictionaryText,$targetText,$routeText)
$allSurfaceDocsComplete = $true
foreach ($surfaceDoc in $surfaceDocs) {
    foreach ($surfaceId in $surfaceIds) {
        if ($surfaceDoc -notmatch [regex]::Escape($surfaceId)) { $allSurfaceDocsComplete = $false }
    }
}
Add-Check 'semantic:g37-complete-surface-registry' (
    $allSurfaceDocsComplete -and
    (($g37Pm + $g37Codex + $adminText + $dictionaryText + $targetText + $routeText) -match '(?i)скрыт.{0,20}inheritance запрещена|hidden inheritance is forbidden')
) 'Восемь stable surface IDs едины; matching/profile не получают скрытую eligibility'

Add-Check 'semantic:g36-completeness-single-owner-route' (
    $g36Pm -match '/ru/admin/profile-field/completeness' -and
    $g36Codex -match '/ru/admin/profile-field/completeness' -and
    $adminText -match '(?is)/ru/admin/profile-field/completeness.{0,140}единственный editor' -and
    $routeText -match '(?is)/ru/admin/profile-field/completeness.{0,140}единственный editor' -and
    $targetText -match '(?is)/ru/admin/profile-field/completeness.{0,140}единственный editor' -and
    (($canonicalText + $adminText + $routeText + $targetText + $architectureText) -notmatch '/ru/admin/settings/profile-quality')
) 'Completeness редактируется только в существующем profile-field контуре'

Add-Check 'semantic:g36-g37-pilot-sequencing' (
    $g36Pm -match '(?i)V3 limited paid pilot' -and
    $g37Pm -match '(?i)Минимум V3 limited paid pilot' -and
    $targetText -match '(?i)V3 pilot minimum включает taxonomy v2, manual completeness input и eligibility/manual order' -and
    $taskTzText -match '"task-g3-field-weight":"V3 client pilot"' -and
    $taskTzText -match '"task-g3-rotation":"V3 client pilot"' -and
    $taskTzText -match '(?i)automation/KPI scale относится к V5' -and
    $deliveryText -match '(?is)minimum G6\.2-G6\.4.{0,180}V3 minimum G3\.7.{0,180}G3\.5 limited paid pilot' -and
    $deliveryText -match '(?i)V5 KPI-scale extension: G5\.3' -and
    $deliveryText -match '(?i)V3: G3\.6, G6\.1-G6\.4' -and
    $readmeText -match '(?i)vertical-package-client-pilot\.md.{0,220}обязательный V3 manual minimum G3\.6/G3\.7' -and
    $readmeText -match '(?i)vertical-package-public-scale\.md.{0,260}обязательные MVP-срезы G4\.4, G5\.3 и G6\.6.{0,120}post-MVP backlog' -and
    $deliveryText -match '(?is)G6\.4.{0,120}V3 prerequisite admission minimum / V4 operations' -and
    $deliveryText -match '(?is)vertical-package-client-pilot\.md.{0,500}prerequisite slice G6\.4.{0,300}Task ownership G6\.4 сюда не переносится' -and
    $deliveryText -match '(?is)vertical-package-operations-pilot\.md.{0,500}admission-gate minimum как prerequisite для V3' -and
    $readmeText -match '(?is)vertical-package-client-pilot\.md.{0,500}prerequisite slice G6\.4.{0,200}no eligibility/session/debit' -and
    $readmeText -match '(?is)vertical-package-operations-pilot\.md.{0,500}G6\.4 сначала поставляет admission-gate minimum как prerequisite V3' -and
    $taskTzText -match '"task-g6-training":"V3 prerequisite admission gate / V4 operations"' -and
    $clientVerticalText -match '(?is)G6\.4 admission prerequisite.{0,300}no eligibility/session/debit.{0,100}NO_GO' -and
    $operationsVerticalText -match '(?is)minimum admission gate.{0,200}prerequisite V3 до G3\.7/G3\.5' -and
    $closeoutText -match '(?is)G4\.1-G4\.3.{0,100}G5\.1.{0,100}minimum G6\.2-G6\.4.{0,280}до G3\.7/G3\.5' -and
    $closeoutText -match '(?is)V3 minimum G3\.7.{0,260}missing/stale/failed admission.{0,180}fail-closed' -and
    $g37Pm -match '(?i)отдельная страница «Выдача Экспертов»' -and
    $g37Pm -match '(?i)G6\.4.{0,180}Admission' -and
    $g37Pm -match '(?i)Admission является обязательным versioned input от G6\.4.{0,180}fail-closed' -and
    $g37Codex -match '(?i)G6\.4 versioned admission.{0,180}fail-closed eligibility input' -and
    $targetText -match '(?i)versioned admission является обязательным внешним input G6\.4.{0,180}fail-closed eligibility' -and
    $consistencyText -match '(?i)versioned admission принадлежит G6\.4.{0,180}fail-closed eligibility' -and
    $g37Pm -notmatch 'Выдача и ротация Экспертов'
) 'G3.6/G3.7 pilot minimum входит в V3; V5 оставлен scale automation/KPI'

Add-Check 'semantic:single-admin-route-owners' (
    $g11Pm -match '(?i)/ru/admin/settings/prices.{0,180}единственным редактором global price, profile price override, credit packages' -and
    $g11Pm -match '(?i)/ru/admin/settings/coupons.{0,180}единственным редактором coupons, bonus credits и trial entitlement' -and
    $g11Pm -notmatch '(?i)profile.{0,60}(?:price|цена).{0,120}(?:редактируется|настраивается).{0,80}(?:карточк|анкете)' -and
    $g21Pm -match '(?i)/ru/admin/settings/prices.{0,220}единственн' -and
    $g21Pm -match '(?i)/ru/admin/settings/coupons.{0,220}единственн' -and
    $g14Pm -match '(?i)единственный маршрут-владелец правил уведомлений: `/ru/admin/notification-rule/index`' -and
    $g14Codex -match '(?i)canonical and only notification-rule owner route: `/ru/admin/notification-rule/index`' -and
    $g24Pm -match '(?i)/ru/admin/settings/accruals.{0,120}единственный маршрут-владелец configuration' -and
    $g24Codex -match '(?i)/ru/admin/settings/accruals`? is the canonical and only owner of accrual configuration' -and
    $routeText -match '/ru/admin/settings/coupons' -and
    $routeText -match '/ru/admin/notification-rule/index' -and
    $routeText -notmatch '/ru/admin/settings/accruals` или' -and
    $targetText -match '/ru/admin/settings/accruals' -and
    $adminText -match '(?i)единственный маршрут-владелец delivery rules G1\.4 — `/ru/admin/notification-rule/index`'
) 'Prices, coupons, notifications и accrual configuration имеют один точный owner route'

Add-Check 'semantic:task-readiness-spec-runtime-split' (
    $taskReadinessText -match 'canonicalG1G3SpecIds' -and
    $taskReadinessText -match 'tzReadyByTask\[taskId\] = 100' -and
    $taskReadinessText -match 'item\.stage = "etalon_spec_ready_runtime_open"' -and
    $taskReadinessText -match 'процент сайта слева не является процентом готовности ТЗ'
) 'Legacy readiness page показывает 100% ТЗ отдельно от открытого runtime'

Add-Check 'semantic:capability-id-contract' (
    $consistencyText -match 'open_profile' -and
    $consistencyText -match 'send_free_message' -and
    $consistencyText -match 'notify_availability' -and
    $consistencyText -match 'create_consultation_request' -and
    (($consistencyText + $g32Pm + $g32Codex + $g37Pm + $g37Codex + $dictionaryText) -notmatch 'view_profile|subscribe_availability|request_paid_consultation')
) 'Catalog capability IDs едины и не содержат ложного paid-start'

Add-Check 'semantic:matching-admin-owner' (
    $g34Pm -match '/ru/admin/settings/matching' -and
    $g34Codex -match '/ru/admin/settings/matching' -and
    $adminText -match '/ru/admin/settings/matching' -and
    $routeText -match '/ru/admin/settings/matching' -and
    $targetText -match '/ru/admin/settings/matching'
) 'G3.4 PM/Codex и глобальные карты указывают единственную owner-page matching'

Add-Check 'semantic:ranking-admin-owner' (
    $g37Pm -match '/ru/admin/settings/expert-ranking' -and
    $g37Codex -match '/ru/admin/settings/expert-ranking' -and
    $adminText -match '/ru/admin/settings/expert-ranking' -and
    $routeText -match '/ru/admin/settings/expert-ranking'
) 'G3.7 PM/Codex и admin package указывают точную owner-page expert-ranking'

Add-Check 'semantic:completion-audit-current' (
    $completionText -match '(?i)(?:15 из 15|15/15).{0,80}(?:задач|G1\.1-G3\.7|эталонн)' -and
    $completionText -match '(?i)implementation/runtime.{0,120}(?:открыт|не доказан)' -and
    $completionText -notmatch '(?i)только G1\.1.{0,100}(?:нов|эталон|полност)'
) 'Completion audit отражает все 15 эталонных пар и открытую runtime-границу'

Add-Check 'semantic:storefront-single-visibility-editor' (
    $adminText -match '(?i)Visibility редактируется только здесь; order редактируется только в Content' -and
    $adminText -match '(?i)read-only badge фактической visibility' -and
    $routeText -match '(?i)Content редактирует storefront order, но visibility показывает только badge/link' -and
    $architectureText -match '(?i)Содержимое → Витрина Nebula.{0,220}единственный editor порядка' -and
    $architectureText -match '(?i)visibility только read-only badge/link.{0,100}/ru/admin/settings/storefront'
) 'Storefront visibility редактируется только в Settings; order — только в Content'

Add-Check 'semantic:consultations-route-plural' (
    $g22Pm -match '/ru/admin/settings/consultations' -and
    $g22Codex -match '/ru/admin/settings/consultations' -and
    $adminText -match '/ru/admin/settings/consultations' -and
    $routeText -match '/ru/admin/settings/consultations' -and
    (($g22Pm + $g22Codex + $adminText + $routeText + $taskTzText) -notmatch '/ru/admin/settings/consultation(?!s)')
) 'Маршрут settings/consultations един во всех handoff-поверхностях'

$taxonomyLabels = @(
    'Отношения / Relationships',
    'Карьера / Career',
    'Будущее / Future',
    'Развитие / Growth',
    'Духовность / Spirituality'
)
$taxonomyAligned = $true
foreach ($label in $taxonomyLabels) {
    $taxonomyAligned = $taxonomyAligned -and $g32Pm.Contains($label) -and $targetText.Contains($label)
}
Add-Check 'semantic:taxonomy-versioned-mapping' (
    $taxonomyAligned -and
    $g32Pm -match 'expert_specialization_taxonomy_v1_legacy' -and
    $g32Pm -match 'expert_specialization_taxonomy_v2' -and
    $g32Pm -match 'category_id -> specialization_value_ids' -and
    $routeText -match 'category→specialization→method mapping' -and
    $routeText -match '/ru/admin/profile-field/expert-taxonomy'
) 'Пять категорий и versioned mapping едины для всех поверхностей'

Add-Check 'semantic:energy-diagnostics-method-migration' (
    $g32Pm -match 'id=18:value=13 -> id=17:value=16' -and
    $g36Pm -match 'id=18:value=13 -> id=17:value=16' -and
    $g32Pm -match 'id=17:value=16 = Energy Practices' -and
    $g32Pm -match '(?i)value=13.{0,180}(?:отсутствует во всех|не входит ни в один) active `specialization_value_ids`' -and
    $g36Codex -match '(?i)value=13.{0,140}absent from all active `specialization_value_ids`'
) 'Energy Diagnostics deprecated в specialization и мигрирует в Energy Practices method'

Add-Check 'semantic:reconnect-not-chat-owned' (
    $targetText -match '(?i)Настройки чата.{0,160}reconnect здесь не редактируется' -and
    $routeText -match '(?i)/ru/admin/settings/chat.{0,160}\| reconnect, roles/prices/support'
) 'Reconnect принадлежит consultation settings, не chat settings'

Add-Check 'semantic:retention-separated' (
    $adminText -match '(?i)Consultation-history projection retention' -and
    $adminText -match '(?i)Message-storage/privacy retention' -and
    $adminText -match '(?i)не удаляет и не сокращает message storage' -and
    $dictionaryText -match '(?i)не управляет retention message storage'
) 'Client consultation-history projection отделена от message/privacy storage'

Add-Check 'semantic:panel-cross-goal-decisions' (
    $taskTzText -match 'Уточнение заменяет активный 15-минутный request clock' -and
    $taskTzText -match 'Consent фиксируется до session для обоих путей' -and
    $taskTzText -match '/ru/admin/settings/consultations' -and
    $taskTzText -match 'G3\.6 владеет expert_specialization_taxonomy_v2' -and
    $taskTzText -match 'только G3\.7 формирует display_eligible'
) 'Панель отражает исправленные сквозные решения'

foreach ($task in $tasks) {
    Add-Check "$($task.Code):panel:index" ($indexText -match [regex]::Escape('"' + $task.Panel + '":100')) 'standardAuditReadiness=100'
    Add-Check "$($task.Code):panel:task-tz" ($taskTzText -match [regex]::Escape('"' + $task.Panel + '": {')) 'Task exists in task-tz panel'
    Add-Check "$($task.Code):panel:artifact-html" ($taskTzText -match [regex]::Escape($task.Html + '.html')) 'HTML mapped in task-tz'
}

Add-Check 'panel:current-state-link' ($indexText -match 'current-site-state-g1-g3-2026-07-29\.md') 'Panel links current state'
Add-Check 'panel:target-state-link' ($indexText -match 'target-site-vision-g1-g3\.md') 'Panel links target state'
Add-Check 'panel:consistency-link' ($indexText -match 'g1-g3-product-consistency-register\.md') 'Panel links consistency register'

$failed = @($checks | Where-Object { -not $_.passed })
$passed = @($checks | Where-Object { $_.passed })

foreach ($check in $checks) {
    $label = if ($check.passed) { 'PASS' } else { 'FAIL' }
    Write-Host ("[{0}] {1} — {2}" -f $label, $check.id, $check.detail)
}

Write-Host ("RESULT: {0}/{1} PASS" -f $passed.Count, $checks.Count)
if ($failed.Count -gt 0) {
    Write-Host ("FAILED: {0}" -f (($failed | ForEach-Object id) -join ', '))
    exit 1
}

exit 0
