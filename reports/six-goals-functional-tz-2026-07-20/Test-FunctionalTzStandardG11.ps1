[CmdletBinding()]
param(
    [switch]$Json
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$standardPath = Join-Path $root 'functional-tz-quality-standard.md'
$productPath = Join-Path $root 'etalon-tz-g1-1-service-session.md'
$humanHtmlPath = Join-Path $root 'tz-g1-1-for-igor.html'
$humanDocxPath = Join-Path $root 'tz-g1-1-for-igor.docx'
$codexPath = Join-Path $root 'codex-context-g1-1-service-session.md'
$panelRoot = Join-Path (Split-Path -Parent (Split-Path -Parent $root)) 'web\qa-reports\nebula-6-goals-master-plan-2026-06-11'
$panelIndexPath = Join-Path $panelRoot 'index.html'
$panelTaskPath = Join-Path $panelRoot 'task-tz.html'
$issues = [System.Collections.Generic.List[object]]::new()
$passed = 0

foreach ($path in @($standardPath, $productPath, $humanHtmlPath, $humanDocxPath, $codexPath, $panelIndexPath, $panelTaskPath)) {
    if (Test-Path -LiteralPath $path) {
        $passed++
    } else {
        $issues.Add([pscustomobject]@{ check = 'required_file'; item = $path; issue = 'missing' })
    }
}

if ($issues.Count -eq 0) {
    $standard = Get-Content -LiteralPath $standardPath -Raw
    $product = Get-Content -LiteralPath $productPath -Raw
    $humanHtml = Get-Content -LiteralPath $humanHtmlPath -Raw
    $codex = Get-Content -LiteralPath $codexPath -Raw
    $panelIndex = Get-Content -LiteralPath $panelIndexPath -Raw
    $panelTask = Get-Content -LiteralPath $panelTaskPath -Raw

    $standardHeadings = @(
        '## 1. Что означает «ТЗ готово на 100%»',
        '## 2. Четыре независимых показателя',
        '## 3. Шкала `spec_completeness`',
        '## 4. Hard gates',
        '## 5. Role-aware handoff',
        '## 7. Правила acceptance matrix',
        '## 9. Граница архитектуры',
        '## 10. Definition of Ready и Definition of Done'
    )
    foreach ($heading in $standardHeadings) {
        if ($standard.Contains($heading)) {
            $passed++
        } else {
            $issues.Add([pscustomobject]@{ check = 'standard_heading'; item = $heading; issue = 'missing' })
        }
    }

    $standardWeights = [regex]::Matches($standard, '(?m)^\| Q(?:[1-9]|1[0-2]) \|.*?\| (\d+) \|$')
    $weightSum = 0
    foreach ($match in $standardWeights) {
        $weightSum += [int] $match.Groups[1].Value
    }
    if ($standardWeights.Count -eq 12 -and $weightSum -eq 100) {
        $passed++
    } else {
        $issues.Add([pscustomobject]@{ check = 'standard_weight_total'; item = 'Q1-Q12'; issue = "count=$($standardWeights.Count);sum=$weightSum" })
    }

    $productHeadings = @(
        '## 1. Цель',
        '## 2. Продуктовая задача',
        '## 3. Пользователи карточки и видимость данных',
        '## 4. Когда создаётся карточка консультации',
        '## 5. Как карточка отображает жизненный цикл',
        '## 6. Обязательные продуктовые правила',
        '## 7. Что должно быть видно клиенту',
        '## 8. Что должно быть видно агенту',
        '## 9. Что должно быть видно super-admin',
        '## 10. Состояния интерфейса',
        '## 11. Настройки через админ-панель',
        '## 12. Связанные задачи',
        '## 13. Границы ТЗ',
        '## 14. Критерии готового результата',
        '## 15. Действия Игоря перед началом реализации'
    )
    foreach ($heading in $productHeadings) {
        if ($product.Contains($heading)) {
            $passed++
        } else {
            $issues.Add([pscustomobject]@{ check = 'product_heading'; item = $heading; issue = 'missing' })
        }
    }

    $productRequiredPhrases = @(
        'Product Owner / Project Manager Nebula',
        'Единственный источник этих правил — G1.3',
        'Карточка не должна самостоятельно:',
        'Перечень lifecycle-настроек и их стартовые значения задаются только в G1.3',
        'G1.1 не создаёт роли, не назначает их пользователям',
        'Карточка использует существующую систему ролей и permissions',
        'Все числовые и изменяемые правила должны настраиваться через админ-панель',
        'самостоятельный пункт верхнего уровня **«Консультации»**',
        'сразу после существующего раздела **«Сообщения»**',
        'перед существующим разделом **«Фотографии»**',
        'страницу **«Настройки консультаций»**',
        'На production-странице не должно быть кнопки ручного создания консультации',
        'Эти решения принимает Игорь',
        'передаёт своему Codex файл `codex-context-g1-1-service-session.md`'
    )
    foreach ($phrase in $productRequiredPhrases) {
        if ($product.Contains($phrase)) {
            $passed++
        } else {
            $issues.Add([pscustomobject]@{ check = 'product_required_phrase'; item = $phrase; issue = 'missing' })
        }
    }

    foreach ($forbidden in @('ServiceSessionController', 'ServiceSessionStateMachine', 'migration', 'implementation_status:', 'runtime_acceptance:', 'spec_completeness:', 'Current source navigation', 'G11-A26')) {
        if ($product -match [regex]::Escape($forbidden)) {
            $issues.Add([pscustomobject]@{ check = 'product_technical_leak'; item = $forbidden; issue = 'present' })
        } else {
            $passed++
        }
    }

    foreach ($duplicate in @('текущая длительность паузы — 5 минут', 'текущее значение — 60 секунд', '| Длительность balance pause |', '| Reconnect grace агента |')) {
        if ($product.Contains($duplicate)) {
            $issues.Add([pscustomobject]@{ check = 'product_lifecycle_duplicate'; item = $duplicate; issue = 'must be owned by G1.3' })
        } else {
            $passed++
        }
    }

    foreach ($phrase in @('Скачать DOCX для Игоря', 'Содержание', '## 1. Цель', 'По завершённой карточке')) {
        $expected = if ($phrase.StartsWith('## ')) { $phrase.Substring(3) } else { $phrase }
        if ($humanHtml.Contains($expected)) {
            $passed++
        } else {
            $issues.Add([pscustomobject]@{ check = 'human_html'; item = $phrase; issue = 'missing' })
        }
    }
    if ((Get-Item -LiteralPath $humanDocxPath).Length -gt 10000) {
        $passed++
    } else {
        $issues.Add([pscustomobject]@{ check = 'human_docx'; item = 'file_size'; issue = 'too_small' })
    }

    $codexHeadings = @(
        '## 1. Паспорт задачи',
        '## 2. Контекст и проблема',
        '## 3. Требуемый результат',
        '## 4. Термины',
        '## 5. Scope',
        '## 6. Доступ к карточке, действия и видимость',
        '## 7. Preconditions и trigger создания',
        '## 8. Неизменяемые invariants',
        '## 9. Состояния и граница с G1.3',
        '## 10. Функциональные сценарии карточки',
        '## 11. Продуктовый контракт данных',
        '## 12. Поверхности и обязательный readback',
        '## 13. Ошибки и negative behavior',
        '## 14. Acceptance matrix',
        '## 15. Programmer handoff',
        '## 16. Definition of Done',
        '## 17. Proof boundary',
        '## 18. Knowledge basis',
        '## 19. Самооценка по стандарту'
    )
    foreach ($heading in $codexHeadings) {
        if ($codex.Contains($heading)) {
            $passed++
        } else {
            $issues.Add([pscustomobject]@{ check = 'codex_heading'; item = $heading; issue = 'missing' })
        }
    }

    $codexRequiredPhrases = @(
        'Этот файл не является постановкой задачи от PM',
        'Продуктовое ТЗ владельца: `etalon-tz-g1-1-service-session.md`',
        'spec_completeness: 100%',
        'owner_policy_closure: closed_for_G1.1',
        'implementation_status: code_present_unmapped',
        'runtime_acceptance: fail_not_acceptance_ready',
        'Service session создаётся атомарно и exactly once только после committed explicit client consent',
        'До consent принятие Агентом лишь изменяет pre-session request',
        'G1.3 единолично владеет lifecycle state machine',
        'G1.1 не является RBAC/permissions contract',
        'Карточка не вычисляет переход повторно',
        'Все ограничения действуют server-side',
        'Duplicate/concurrent command не создаёт вторую session',
        'Current implementation gaps на 2026-07-27',
        'Hard gates: `pass`',
        'Verdict: `spec_handoff_ready / not_runtime_verified`'
    )
    foreach ($phrase in $codexRequiredPhrases) {
        if ($codex.Contains($phrase)) {
            $passed++
        } else {
            $issues.Add([pscustomobject]@{ check = 'codex_required_phrase'; item = $phrase; issue = 'missing' })
        }
    }

    $acceptanceIds = [regex]::Matches($codex, '\bG11-A\d{2}\b') | ForEach-Object { $_.Value } | Sort-Object -Unique
    if ($acceptanceIds.Count -eq 26 -and $acceptanceIds[0] -eq 'G11-A01' -and $acceptanceIds[-1] -eq 'G11-A26') {
        $passed++
    } else {
        $issues.Add([pscustomobject]@{ check = 'g11_acceptance_coverage'; item = 'G11-A01..G11-A26'; issue = "count=$($acceptanceIds.Count)" })
    }

    $scoreRows = [regex]::Matches($codex, '(?m)^\| Q(?:[1-9]|1[0-2]) .*?\| (\d+)/(\d+) \|')
    $score = 0
    $scoreMax = 0
    foreach ($match in $scoreRows) {
        $score += [int] $match.Groups[1].Value
        $scoreMax += [int] $match.Groups[2].Value
    }
    if ($scoreRows.Count -eq 12 -and $score -eq 100 -and $scoreMax -eq 100) {
        $passed++
    } else {
        $issues.Add([pscustomobject]@{ check = 'g11_score'; item = 'Q1-Q12'; issue = "count=$($scoreRows.Count);score=$score/$scoreMax" })
    }

    foreach ($forbidden in @('TODO', 'TBD', 'owner_decision_pending', 'нужен второй пользователь', 'проверить, что работает')) {
        if ($codex -match [regex]::Escape($forbidden)) {
            $issues.Add([pscustomobject]@{ check = 'forbidden_vague_marker'; item = $forbidden; issue = 'present' })
        } else {
            $passed++
        }
    }

    $panelPhrases = @(
        @{ Content = $panelIndex; File = 'index.html'; Phrase = '"task-g1-session": { code:"G1.1"' },
        @{ Content = $panelIndex; File = 'index.html'; Phrase = '"task-g1-session": { code:"G1.1", title:"Карточка консультации", priority:"P0"' },
        @{ Content = $panelTask; File = 'task-tz.html'; Phrase = 'const standardTzCriteria = [' },
        @{ Content = $panelTask; File = 'task-tz.html'; Phrase = '"task-g1-session": { code:"G1.1"' },
        @{ Content = $panelTask; File = 'task-tz.html'; Phrase = '"task-g1-chat": {' },
        @{ Content = $panelTask; File = 'task-tz.html'; Phrase = 'id="igor-link"' },
        @{ Content = $panelTask; File = 'task-tz.html'; Phrase = 'id="codex-link"' },
        @{ Content = $panelTask; File = 'task-tz.html'; Phrase = 'Связанные материалы' },
        @{ Content = $panelTask; File = 'task-tz.html'; Phrase = 'Runtime acceptance = fail_not_acceptance_ready' }
    )
    foreach ($item in $panelPhrases) {
        if ($item.Content.Contains($item.Phrase)) {
            $passed++
        } else {
            $issues.Add([pscustomobject]@{ check = 'panel_sync'; item = $item.File; issue = $item.Phrase })
        }
    }

    $topLinksBlock = [regex]::Match($panelTask, '(?s)<div class="top-links">(.*?)</div>').Groups[1].Value
    $relatedLinksBlock = [regex]::Match($panelTask, '(?s)<section class="related-materials".*?<div class="related-links">(.*?)</div>').Groups[1].Value
    $topLinkCount = [regex]::Matches($topLinksBlock, '<a\b').Count
    $relatedLinkCount = [regex]::Matches($relatedLinksBlock, '<a\b').Count
    if ($topLinkCount -eq 7 -and
        $topLinksBlock.Contains('id="igor-link"') -and
        $topLinksBlock.Contains('id="docx-link"') -and
        $topLinksBlock.Contains('id="codex-link"') -and
        $topLinksBlock.Contains('id="admin-mockup-link"') -and
        $topLinksBlock.Contains('id="artifact-link"') -and
        -not $topLinksBlock.Contains('Карта 30/30') -and
        $relatedLinkCount -ge 5 -and
        $relatedLinksBlock.Contains('Карта 30/30') -and
        $relatedLinksBlock.Contains('Стандарт полноты ТЗ') -and
        $relatedLinksBlock.Contains('Что есть на сайте сейчас') -and
        $relatedLinksBlock.Contains('Какой сайт строим')) {
        $passed++
    } else {
        $issues.Add([pscustomobject]@{ check = 'panel_link_priority'; item = 'task-tz.html'; issue = "top=$topLinkCount;related=$relatedLinkCount" })
    }

    if ($panelTask -match 'Object\.entries\(tasks\).*?taskItem\.tzReady\s*=\s*100' -and
        $panelTask -notmatch 'if \(taskId === "task-g1-session"\) return;') {
        $issues.Add([pscustomobject]@{ check = 'panel_no_mass_100'; item = 'task-tz.html'; issue = 'mass_100_override_present' })
    } else {
        $passed++
    }
}

$result = [pscustomobject]@{
    schema = 'functional_tz_standard_g11_verifier.v1'
    checked_at = (Get-Date).ToString('o')
    status = if ($issues.Count -eq 0) { 'pass' } else { 'fail' }
    spec_completeness = if ($issues.Count -eq 0) { 100 } else { $null }
    hard_gates = if ($issues.Count -eq 0) { 'pass' } else { 'fail' }
    owner_policy_closure = 'closed_for_G1.1'
    implementation_status = 'code_present_unmapped'
    runtime_acceptance = 'fail_not_acceptance_ready'
    acceptance_case_count = 26
    passed_checks = $passed
    failed_checks = $issues.Count
    issues = $issues
}

if ($Json) {
    $result | ConvertTo-Json -Depth 6
} else {
    $result
}

if ($issues.Count -gt 0) {
    exit 1
}
