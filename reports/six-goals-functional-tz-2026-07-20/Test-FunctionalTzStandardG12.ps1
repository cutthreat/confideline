[CmdletBinding()]
param([switch]$Json)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$productPath = Join-Path $root 'etalon-tz-g1-2-role-chat.md'
$htmlPath = Join-Path $root 'tz-g1-2-for-igor.html'
$docxPath = Join-Path $root 'tz-g1-2-for-igor.docx'
$codexPath = Join-Path $root 'codex-context-g1-2-role-chat.md'
$panelPath = Join-Path (Split-Path -Parent (Split-Path -Parent $root)) 'web\qa-reports\nebula-6-goals-master-plan-2026-06-11\task-tz.html'
$indexPath = Join-Path (Split-Path -Parent $panelPath) 'index.html'
$taskPath = Join-Path (Split-Path -Parent $panelPath) 'tasks\task-g1-chat.html'
$issues = [System.Collections.Generic.List[object]]::new()
$passed = 0

foreach ($path in @($productPath, $htmlPath, $docxPath, $codexPath, $panelPath, $indexPath, $taskPath)) {
    if (Test-Path -LiteralPath $path) { $passed++ }
    else { $issues.Add([pscustomobject]@{ check = 'required_file'; item = $path; issue = 'missing' }) }
}

if ($issues.Count -eq 0) {
    $product = Get-Content -LiteralPath $productPath -Raw
    $html = Get-Content -LiteralPath $htmlPath -Raw
    $codex = Get-Content -LiteralPath $codexPath -Raw
    $panel = Get-Content -LiteralPath $panelPath -Raw
    $index = Get-Content -LiteralPath $indexPath -Raw
    $task = Get-Content -LiteralPath $taskPath -Raw

    foreach ($heading in @(
        '## 1. Цель',
        '## 2. Продуктовая задача',
        '## 3. Термины и роли',
        '## 4. Права, видимость и авторство',
        '## 5. Когда и как работает диалог',
        '## 6. Состояния, которые должен понимать клиент',
        '## 7. Сообщения и вложения',
        '## 8. Цензура контактов и защищённых данных',
        '## 9. Потеря связи и повторная доставка',
        '## 10. «История консультации»',
        '## 11. Что видно Агенту',
        '## 12. Что видно super-admin',
        '## 13. Настройки через админ-панель',
        '## 14. Связанные задачи и границы',
        '## 15. Ошибки и запрещённое поведение',
        '## 16. Критерии готового результата',
        '## 17. Что Игорь возвращает на вычитку и приёмку',
        '## Служебные сведения о документе'
    )) {
        if ($product.Contains($heading)) { $passed++ }
        else { $issues.Add([pscustomobject]@{ check = 'product_heading'; item = $heading; issue = 'missing' }) }
    }

    foreach ($phrase in @(
        'один постоянный диалог',
        'цену в credits за минуту',
        'одновременно иметь только одну session',
        'Поддержка Nebula',
        'слово **«ЦЕНЗУРА»**',
        'Начальное значение — **60 секунд**',
        'Срок доступности клиентской истории и legal/privacy retention определяются G1.3/G4.3',
        'название: **«Настройки чата»**',
        'route: `/ru/admin/settings/chat`',
        'существующий RBAC-контур',
        'Скачивание и экспорт относятся к следующему этапу',
        'Повторная доставка, reconnect или повторное нажатие не должны создавать дубликаты'
    )) {
        if ($product.Contains($phrase)) { $passed++ }
        else { $issues.Add([pscustomobject]@{ check = 'product_rule'; item = $phrase; issue = 'missing' }) }
    }

    if ($index.Contains('"task-g1-session":100, "task-g1-chat":100')) { $passed++ }
    else { $issues.Add([pscustomobject]@{ check = 'index_sync'; item = 'task-g1-chat'; issue = 'not_100' }) }

    foreach ($forbidden in @('ServiceSessionController', 'CREATE TABLE', 'ALTER TABLE', 'class Chat', 'TODO', 'TBD')) {
        if ($product -match [regex]::Escape($forbidden)) {
            $issues.Add([pscustomobject]@{ check = 'product_technical_leak'; item = $forbidden; issue = 'present' })
        } else { $passed++ }
    }

    foreach ($phrase in @('Скачать DOCX для Игоря', 'Карточка G1.2', 'Настройки через админ-панель', 'Служебные сведения о документе')) {
        if ($html.Contains($phrase)) { $passed++ }
        else { $issues.Add([pscustomobject]@{ check = 'human_html'; item = $phrase; issue = 'missing' }) }
    }

    if ((Get-Item -LiteralPath $docxPath).Length -gt 10000) { $passed++ }
    else { $issues.Add([pscustomobject]@{ check = 'human_docx'; item = 'file_size'; issue = 'too_small' }) }

    foreach ($phrase in @(
        '## 4. Каноническая продуктовая модель',
        '## 5. Роли и ACL-инварианты',
        '## 6. States и transitions',
        '## 8. Censorship contract',
        '## 10. Reconnect, SLA and idempotency',
        '## 11. Persistence, audit and historical readback',
        '## 13. Settings ownership',
        '## 14. Negative behavior',
        '## 16. Definition of Done',
        'Hard-gate verdict: `pass_for_specification`',
        'Implementation/runtime verdict: `open_until_build_and_runtime_proof`'
    )) {
        if ($codex.Contains($phrase)) { $passed++ }
        else { $issues.Add([pscustomobject]@{ check = 'codex_contract'; item = $phrase; issue = 'missing' }) }
    }

    $scoreRows = [regex]::Matches($codex, '(?m)^\| Q(?:[1-9]|1[0-2]).*?\| (\d+)/(\d+) \|$')
    $score = 0
    $max = 0
    foreach ($match in $scoreRows) {
        $score += [int]$match.Groups[1].Value
        $max += [int]$match.Groups[2].Value
    }
    if ($scoreRows.Count -eq 12 -and $score -eq 100 -and $max -eq 100) { $passed++ }
    else { $issues.Add([pscustomobject]@{ check = 'q1_q12_score'; item = 'Q1-Q12'; issue = "count=$($scoreRows.Count);score=$score/$max" }) }

    foreach ($phrase in @(
        'tasks["task-g1-chat"].tzReady = 100',
        'tz-g1-2-for-igor.html',
        'tz-g1-2-for-igor.docx',
        'codex-context-g1-2-role-chat.md',
        '"task-g1-chat": {',
        'const isSpecReady = Boolean(artifactHref)'
    )) {
        if ($panel.Contains($phrase)) { $passed++ }
        else { $issues.Add([pscustomobject]@{ check = 'panel_sync'; item = $phrase; issue = 'missing' }) }
    }

    foreach ($phrase in @('Spec handoff ready / runtime open', 'tz-g1-2-for-igor.html', 'codex-context-g1-2-role-chat.md')) {
        if ($task.Contains($phrase)) { $passed++ }
        else { $issues.Add([pscustomobject]@{ check = 'task_sync'; item = $phrase; issue = 'missing' }) }
    }
}

$result = [pscustomobject]@{
    schema = 'functional_tz_standard_g12_verifier.v1'
    checked_at = (Get-Date).ToString('o')
    status = if ($issues.Count -eq 0) { 'pass' } else { 'fail' }
    spec_completeness = if ($issues.Count -eq 0) { 100 } else { $null }
    hard_gates = if ($issues.Count -eq 0) { 'pass' } else { 'fail' }
    implementation_status = 'open_until_mapped_build'
    runtime_acceptance = 'open_until_positive_negative_QA'
    passed_checks = $passed
    failed_checks = $issues.Count
    issues = $issues
}

if ($Json) { $result | ConvertTo-Json -Depth 6 } else { $result }
if ($issues.Count -gt 0) { exit 1 }
