[CmdletBinding()]
param(
    [switch]$Json
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

$expectedFiles = @(
    'README.md',
    'delivery-matrix.md',
    'owner-decisions.md',
    'review-register.md',
    'committee-arbitration.md',
    'closeout.md',
    'gemini-review-prompt.md',
    'gemini-review-result.md',
    'vertical-package-g6-1-g6-7-g1-2.md',
    'vertical-package-session-money.md',
    'vertical-package-client-pilot.md',
    'vertical-package-operations-pilot.md',
    'vertical-package-public-scale.md',
    'vertical-package-analytics-launch.md',
    'readiness-summary.md',
    'owner-enablements-pilot-defaults-proposal.md',
    'curation-control.md',
    'completion-audit.md',
    'tz-crosscut-admin-managed-settings.md',
    'admin-panel-settings-development-package.md',
    'asknebula-pricing-benchmark-2026-07-21.md',
    'functional-tz-quality-standard.md',
    'etalon-tz-g1-1-service-session.md',
    'tz-g1-1-for-igor.html',
    'tz-g1-1-for-igor.docx',
    'codex-context-g1-1-service-session.md',
    'Test-FunctionalTzStandardG11.ps1',
    'tz-g1-chat-service-session.md',
    'tz-g2-billing-refunds-compensation.md',
    'tz-g3-catalog-profile-rotation.md',
    'tz-g4-support-disputes-rules.md',
    'tz-g5-events-kpi-launch.md',
    'tz-g6-assignment-sla-quality-access.md'
)

$expectedTasks = @(
    'G1.1','G1.2','G1.3','G1.4',
    'G2.1','G2.2','G2.3','G2.4',
    'G3.1','G3.2','G3.3','G3.4','G3.5','G3.6','G3.7',
    'G4.1','G4.2','G4.3','G4.4',
    'G5.1','G5.2','G5.3','G5.4',
    'G6.1','G6.2','G6.3','G6.4','G6.5','G6.6','G6.7'
)

$issues = [System.Collections.Generic.List[object]]::new()
$passed = 0

foreach ($name in $expectedFiles) {
    if (Test-Path -LiteralPath (Join-Path $root $name)) {
        $passed++
    } else {
        $issues.Add([pscustomobject]@{ check = 'required_file'; item = $name; issue = 'missing' })
    }
}

$tzFiles = Get-ChildItem -LiteralPath $root -File -Filter 'tz-g*.md' | Sort-Object Name
$actualTasks = foreach ($file in $tzFiles) {
    foreach ($line in Get-Content -LiteralPath $file.FullName) {
        if ($line -match '^## (G[1-6]\.[0-9]+)\b') {
            $Matches[1]
        }
    }
}

foreach ($task in $expectedTasks) {
    $count = @($actualTasks | Where-Object { $_ -eq $task }).Count
    if ($count -eq 1) {
        $passed++
    } else {
        $issues.Add([pscustomobject]@{ check = 'task_heading'; item = $task; issue = "count=$count" })
    }
}

foreach ($task in ($actualTasks | Sort-Object -Unique)) {
    if ($task -notin $expectedTasks) {
        $issues.Add([pscustomobject]@{ check = 'unexpected_task'; item = $task; issue = 'not_in_canonical_30' })
    }
}

$requiredPhrases = @(
    @{ File = 'README.md'; Phrase = 'не определяет архитектуру' },
    @{ File = 'README.md'; Phrase = 'Static HTML' },
    @{ File = 'README.md'; Phrase = 'G1_G2_G3_15_of_15_etalon_pairs_verified' },
    @{ File = 'functional-tz-quality-standard.md'; Phrase = '## 3. Шкала `spec_completeness`' },
    @{ File = 'functional-tz-quality-standard.md'; Phrase = '## 4. Hard gates' },
    @{ File = 'etalon-tz-g1-1-service-session.md'; Phrase = '## 1. Цель' },
    @{ File = 'etalon-tz-g1-1-service-session.md'; Phrase = '## 13. Границы ТЗ' },
    @{ File = 'etalon-tz-g1-1-service-session.md'; Phrase = 'Эти решения принимает Игорь' },
    @{ File = 'codex-context-g1-1-service-session.md'; Phrase = 'runtime_acceptance: fail_not_acceptance_ready' },
    @{ File = 'codex-context-g1-1-service-session.md'; Phrase = 'G11-A26' },
    @{ File = 'owner-decisions.md'; Phrase = 'G1_G2_G3_product_decisions_consolidated_O4_economics_O5_traffic_legal_brand_runtime_open' },
    @{ File = 'owner-decisions.md'; Phrase = 'owner_decision_accepted_2026-07-21' },
    @{ File = 'owner-decisions.md'; Phrase = 'текущее значение — 5 минут' },
    @{ File = 'owner-decisions.md'; Phrase = 'текущее значение — 60 секунд' },
    @{ File = 'vertical-package-g6-1-g6-7-g1-2.md'; Phrase = 'G6.1 + G6.7 + G1.2' },
    @{ File = 'review-register.md'; Phrase = 'committee_review_complete' },
    @{ File = 'delivery-matrix.md'; Phrase = 'requirements_30_of_30_verticalized_handoff_ready_runtime_open' },
    @{ File = 'readiness-summary.md'; Phrase = '30_of_30_functional_tz_handoff_ready' },
    @{ File = 'owner-enablements-pilot-defaults-proposal.md'; Phrase = 'O1_O2_O3_O6_R1_P1_starter_package_accepted_remaining_discount_grid_refill_proposal' },
    @{ File = 'curation-control.md'; Phrase = 'waiting_two_owner_economics_inputs_requirement_layer_verified' },
    @{ File = 'curation-control.md'; Phrase = 'Runtime/сайт | `NO_GO`' },
    @{ File = 'completion-audit.md'; Phrase = 'requirement_scope_audited_30_of_30_runtime_open' },
    @{ File = 'completion-audit.md'; Phrase = 'Функциональный слой доказан как `requirement-ready 30/30`' },
    @{ File = 'completion-audit.md'; Phrase = '## Финальный audit snapshot 2026-07-21' },
    @{ File = 'completion-audit.md'; Phrase = 'только additional package discount grid + refill/auto-refill и O4 initial consultation percentage + eligible base' },
    @{ File = 'completion-audit.md'; Phrase = '| Runtime/site | нет mapped build' },
    @{ File = 'tz-crosscut-admin-managed-settings.md'; Phrase = 'Paid request accept/decline SLA | 60' },
    @{ File = 'tz-crosscut-admin-managed-settings.md'; Phrase = 'Support first response SLA | 15' },
    @{ File = 'tz-crosscut-admin-managed-settings.md'; Phrase = 'old/new, actor, time, reason и version' },
    @{ File = 'tz-crosscut-admin-managed-settings.md'; Phrase = 'Изменение настройки влияет только на периоды' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'не является седьмым vertical' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'Максимальный score: текущее значение 100' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'Проходной score: текущее значение 80' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'admin routes/screens:' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'KPI influence на public rotation | `disabled`' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'formula type, numerator, denominator и aggregation' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'Для каждого KPI admin управляет всеми изменяемыми параметрами' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'Protected prohibited-claims registry' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'Attempt remove protected minimum' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'Exact crisis resources и US-English wording' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'Message monitoring' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'signal_created -> under_review -> confirmed_violation' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'Detector unavailable' },
    @{ File = 'completion-audit.md'; Phrase = 'Violation detection закрыт как функциональное требование' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'Chat privacy: запрет контактов и чувствительных личных данных' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'server-side до фактической отправки в обе стороны' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'sender_original_recipient_censored' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'Plain/spaced/worded phone number' },
    @{ File = 'completion-audit.md'; Phrase = 'Chat privacy closure' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = '## Экран 5. Возвраты' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'Каждый числовой параметр имеет отдельную видимую input cell' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'Empty versus zero input' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'Maximum cumulative refund | 100' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = '## Экран 6. Credits, цены и промо' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'Global default consultation price | `30`' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'Default package purchase currency | `USD`' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = '### Управление ценой минуты' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = '`pricing.manage` permission' },
    @{ File = 'tz-g2-billing-refunds-compensation.md'; Phrase = 'Initial global value — `30 credits/started minute`' },
    @{ File = 'tz-g2-billing-refunds-compensation.md'; Phrase = 'Клиент покупает credits, а не минуты' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = '### Управляемые пакеты credits и package discount' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = '| Starter | 60 | 9.99 USD | none / 0% | 9.99 USD |' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'AP97' },
    @{ File = 'tz-g3-catalog-profile-rotation.md'; Phrase = '## Отложенные enablement/release gates' },
    @{ File = 'tz-g5-events-kpi-launch.md'; Phrase = 'O3 pilot readback принят' },
    @{ File = 'tz-g6-assignment-sla-quality-access.md'; Phrase = '## Оставшиеся release/proof gates' },
    @{ File = 'tz-g4-support-disputes-rules.md'; Phrase = 'requirement_defined_O1_O6_R1_accepted_legal_runtime_open' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = '## Экран 7. Вознаграждение агентов' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = '`compensation.manage`' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'AP110' },
    @{ File = 'tz-g2-billing-refunds-compensation.md'; Phrase = 'Consultation percentage, eligible base' },
    @{ File = 'vertical-package-session-money.md'; Phrase = 'Экран 7. Вознаграждение агентов' },
    @{ File = 'asknebula-pricing-benchmark-2026-07-21.md'; Phrase = 'current_public_reference_global_rate_and_starter_package_adopted_discount_grid_open' },
    @{ File = 'asknebula-pricing-benchmark-2026-07-21.md'; Phrase = '30 credits/started minute' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'Coupons, discounts и bonus credits' },
    @{ File = 'admin-panel-settings-development-package.md'; Phrase = 'Client transparency' },
    @{ File = 'closeout.md'; Phrase = 'six_verticals_handoff_ready_runtime_no_go' }
)

foreach ($item in $requiredPhrases) {
    $path = Join-Path $root $item.File
    if ((Test-Path -LiteralPath $path) -and (Select-String -LiteralPath $path -SimpleMatch $item.Phrase -Quiet)) {
        $passed++
    } else {
        $issues.Add([pscustomobject]@{ check = 'required_phrase'; item = $item.File; issue = $item.Phrase })
    }
}

if (Select-String -LiteralPath (Join-Path $root 'owner-decisions.md') -SimpleMatch 'owner_decision_pending' -Quiet) {
    $issues.Add([pscustomobject]@{ check = 'closed_owner_gate'; item = 'owner-decisions.md'; issue = 'owner_decision_pending_present' })
} else {
    $passed++
}

$verticalFiles = Get-ChildItem -LiteralPath $root -File -Filter 'vertical-package-*.md' | Sort-Object Name
if ($verticalFiles.Count -eq 6) {
    $passed++
} else {
    $issues.Add([pscustomobject]@{ check = 'vertical_packet_count'; item = 'vertical-package-*.md'; issue = "count=$($verticalFiles.Count)" })
}

$verticalCoverage = foreach ($file in $verticalFiles) {
    $coverageLine = Get-Content -LiteralPath $file.FullName | Where-Object { $_ -match '^Coverage:\s*' } | Select-Object -First 1
    if (-not $coverageLine) {
        $issues.Add([pscustomobject]@{ check = 'vertical_coverage_line'; item = $file.Name; issue = 'missing' })
        continue
    }
    $coverageLine -replace '^Coverage:\s*','' -split ',' | ForEach-Object { $_.Trim() }
}

foreach ($task in $expectedTasks) {
    $count = @($verticalCoverage | Where-Object { $_ -eq $task }).Count
    if ($count -eq 1) {
        $passed++
    } else {
        $issues.Add([pscustomobject]@{ check = 'vertical_task_coverage'; item = $task; issue = "count=$count" })
    }
}

foreach ($task in ($verticalCoverage | Sort-Object -Unique)) {
    if ($task -notin $expectedTasks) {
        $issues.Add([pscustomobject]@{ check = 'vertical_unexpected_task'; item = $task; issue = 'not_in_canonical_30' })
    }
}

$allTzContent = ($tzFiles | ForEach-Object { Get-Content -LiteralPath $_.FullName -Raw }) -join "`n"
$deliveryContent = Get-Content -LiteralPath (Join-Path $root 'delivery-matrix.md') -Raw
$auditContent = Get-Content -LiteralPath (Join-Path $root 'completion-audit.md') -Raw

foreach ($task in $expectedTasks) {
    $escapedTask = [regex]::Escape($task)
    $taskBlockMatch = [regex]::Match(
        $allTzContent,
        "(?ms)^## $escapedTask\b.*?(?=^## G[1-6]\.[0-9]+\b|\z)"
    )
    if ($taskBlockMatch.Success -and
        $taskBlockMatch.Value -match '(?m)^### ' -and
        $taskBlockMatch.Value -match '(Приемка|Acceptance|Gate result|матрица приемки|Требования к evidence)') {
        $passed++
    } else {
        $issues.Add([pscustomobject]@{ check = 'task_acceptance_block'; item = $task; issue = 'missing_behavior_or_acceptance' })
    }

    $deliveryCount = ([regex]::Matches($deliveryContent, "(?m)^\| $escapedTask\s*\|")).Count
    if ($deliveryCount -eq 1) {
        $passed++
    } else {
        $issues.Add([pscustomobject]@{ check = 'delivery_matrix_task'; item = $task; issue = "count=$deliveryCount" })
    }

    $auditCount = ([regex]::Matches($auditContent, "(?m)^\| $escapedTask\s*\|")).Count
    if ($auditCount -eq 1) {
        $passed++
    } else {
        $issues.Add([pscustomobject]@{ check = 'completion_audit_task'; item = $task; issue = "count=$auditCount" })
    }
}

$projectRoot = Split-Path (Split-Path $root -Parent) -Parent
$panelRoot = Join-Path $projectRoot 'web\qa-reports\nebula-6-goals-master-plan-2026-06-11'
$panelIndex = Join-Path $panelRoot 'index.html'
$panelTz = Join-Path $panelRoot 'task-tz.html'

foreach ($panelFile in @($panelIndex, $panelTz)) {
    if (Test-Path -LiteralPath $panelFile) {
        $passed++
    } else {
        $issues.Add([pscustomobject]@{ check = 'panel_file'; item = $panelFile; issue = 'missing' })
    }
}

if (Test-Path -LiteralPath $panelIndex) {
    $panelIndexContent = Get-Content -LiteralPath $panelIndex -Raw
    $panelTzReadyCount = ([regex]::Matches($panelIndexContent, 'tzReady:100')).Count
    $panelStageCount = ([regex]::Matches($panelIndexContent, 'stage:"functional_tz_handoff_ready_runtime_open"')).Count
    if ($panelTzReadyCount -eq 30 -and $panelStageCount -eq 30) {
        $passed++
    } else {
        $issues.Add([pscustomobject]@{ check = 'panel_30_of_30'; item = 'index.html'; issue = "tzReady100=$panelTzReadyCount;stage=$panelStageCount" })
    }
}

if ((Test-Path -LiteralPath $panelTz) -and (Select-String -LiteralPath $panelTz -SimpleMatch 'Object.entries(tasks).forEach' -Quiet)) {
    $passed++
} else {
    $issues.Add([pscustomobject]@{ check = 'panel_canonical_overlay'; item = 'task-tz.html'; issue = 'missing' })
}

if (Test-Path -LiteralPath $panelTz) {
    $panelTzContent = Get-Content -LiteralPath $panelTz -Raw
    if ($panelTzContent -match 'acceptedAdminSettingByTask' -and
        $panelTzContent -match 'paid decision 60 сек, first response 60 сек, support 15 мин' -and
        $panelTzContent -match 'O2/O6: max 100/pass 80, critical-fail/prohibited registry' -and
        $panelTzContent -match 'O3: 30-day window, 20 paid \+ 5 QA minimum' -and
        $panelTzContent -match 'O6: protected prohibited registry, six-source detection' -and
        $panelTzContent -match 'O6 privacy: server-side pre-send contact/PII censorship' -and
        $panelTzContent -match 'R1/P1: session refund returns credits' -and
        $panelTzContent -match 'P1: credits/minute; USD, global 30 and starter 9.99 USD to 60 credits accepted' -and
        $panelTzContent -match 'O4 admin model: consultation/fixed/SLA/task components, scopes, periods, corrections and snapshots are admin-managed' -and
        $panelTzContent -match 'admin-panel-settings-development-package.md' -and
        $panelTzContent -notmatch '"task-g6-sla":"O1 numeric SLA"' -and
        $panelTzContent -notmatch '"task-g6-quality":"O2 score/critical fail"' -and
        $panelTzContent -notmatch '"task-g5-kpi":"O3 formula/window/sample"' -and
        $panelTzContent -notmatch '"task-g4-docs":"O6 safety/prohibited claims"' -and
        $panelTzContent -notmatch '"task-g2-refund":"refund eligibility policy"' -and
        $panelTzContent -notmatch '"task-g4-complaints":"refund policy/approving role"') {
        $passed++
    } else {
        $issues.Add([pscustomobject]@{ check = 'panel_O1_admin_setting'; item = 'task-tz.html'; issue = 'accepted_admin_setting_missing_or_open_gate_present' })
    }
}

$forbiddenPatterns = @(
    '\batomic lock\b',
    '\bREST API\b',
    '\bendpoint\b',
    '\bSQL\b',
    'создать таблиц',
    'структура базы данных',
    'использовать транзакц'
)

foreach ($file in $tzFiles) {
    $content = Get-Content -LiteralPath $file.FullName -Raw
    foreach ($pattern in $forbiddenPatterns) {
        if ($content -match $pattern) {
            $issues.Add([pscustomobject]@{ check = 'implementation_boundary'; item = $file.Name; issue = $pattern })
        } else {
            $passed++
        }
    }
}

$result = [pscustomobject]@{
    schema = 'six_goals_functional_tz_verifier.v1'
    checked_at = (Get-Date).ToString('o')
    status = if ($issues.Count -eq 0) { 'pass' } else { 'fail' }
    task_count = @($actualTasks).Count
    unique_task_count = @($actualTasks | Sort-Object -Unique).Count
    expected_task_count = $expectedTasks.Count
    passed_checks = $passed
    failed_checks = $issues.Count
    issues = @($issues)
}

if ($Json) {
    $result | ConvertTo-Json -Depth 6
} else {
    $result | Format-List
    if ($issues.Count -gt 0) {
        $issues | Format-Table -AutoSize
    }
}

if ($issues.Count -gt 0) {
    exit 1
}
