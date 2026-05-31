param(
    [int]$Port = 8095,
    [switch]$SkipScreenshots
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Url = "http://127.0.0.1:$Port/index.html"
$PartnerUrl = "http://127.0.0.1:$Port/partner.html"
$ExpertUrl = "http://127.0.0.1:$Port/expert.html"
$Screenshots = Join-Path $Root 'screenshots'
$Reports = Join-Path $Root 'reports'
$DesktopShot = Join-Path $Screenshots 'partner-interactions-offline-desktop.png'
$MobileShot = Join-Path $Screenshots 'partner-interactions-offline-mobile.png'
$PartnerDesktopShot = Join-Path $Screenshots 'partner-interactions-partner-desktop.png'
$PartnerMobileShot = Join-Path $Screenshots 'partner-interactions-partner-mobile.png'
$ExpertDesktopShot = Join-Path $Screenshots 'partner-interactions-expert-desktop.png'
$ExpertMobileShot = Join-Path $Screenshots 'partner-interactions-expert-mobile.png'
$AdminChartsShot = Join-Path $Screenshots 'partner-interactions-admin-charts-desktop.png'
$PartnerChartsShot = Join-Path $Screenshots 'partner-interactions-partner-charts-desktop.png'
$ExpertChartsMobileShot = Join-Path $Screenshots 'partner-interactions-expert-charts-mobile.png'
$JsonReport = Join-Path $Reports 'partner-interactions-offline-report.json'
$MdReport = Join-Path $Reports 'partner-interactions-offline-report.md'
$AnalyticsJsonReport = Join-Path $Reports 'partner-interactions-analytics-report.json'
$SimulatorJsonReport = Join-Path $Reports 'partner-interactions-simulator-report.json'
$LargeScaleJsonReport = Join-Path $Reports 'partner-interactions-large-scale-report.json'
$UserFlowJsonReport = Join-Path $Reports 'partner-interactions-user-flow-report.json'

New-Item -ItemType Directory -Force $Screenshots, $Reports | Out-Null

& (Join-Path $PSScriptRoot 'Start-PartnerInteractionsOfflineEnv.ps1') -Port $Port | Out-Null

$htmlPath = Join-Path $Root 'index.html'
$partnerHtmlPath = Join-Path $Root 'partner.html'
$expertHtmlPath = Join-Path $Root 'expert.html'
$jsPath = Join-Path $Root 'assets\partner-interactions.js'
$analyticsJsPath = Join-Path $Root 'assets\partner-interactions-analytics.js'
$simulatorJsPath = Join-Path $Root 'assets\partner-interactions-simulator.js'
$cssPath = Join-Path $Root 'assets\partner-interactions.css'
$fixturePath = Join-Path $Root 'fixtures\partner-interactions.fixture.json'

$html = Get-Content -LiteralPath $htmlPath -Raw
$partnerHtml = Get-Content -LiteralPath $partnerHtmlPath -Raw
$expertHtml = Get-Content -LiteralPath $expertHtmlPath -Raw
$js = Get-Content -LiteralPath $jsPath -Raw
$analyticsJs = Get-Content -LiteralPath $analyticsJsPath -Raw
$simulatorJs = Get-Content -LiteralPath $simulatorJsPath -Raw
$css = Get-Content -LiteralPath $cssPath -Raw
$fixture = Get-Content -LiteralPath $fixturePath -Raw | ConvertFrom-Json
$analyticsReportRaw = node (Join-Path $PSScriptRoot 'verify-analytics.js') $fixturePath
$analyticsReportRaw | Set-Content -LiteralPath $AnalyticsJsonReport -Encoding UTF8
$analyticsReport = $analyticsReportRaw | ConvertFrom-Json
$simulatorReportRaw = node (Join-Path $PSScriptRoot 'verify-simulator.js') $fixturePath
$simulatorReportRaw | Set-Content -LiteralPath $SimulatorJsonReport -Encoding UTF8
$simulatorReport = $simulatorReportRaw | ConvertFrom-Json
$largeScaleReportRaw = node (Join-Path $PSScriptRoot 'verify-large-scale.js')
$largeScaleReportRaw | Set-Content -LiteralPath $LargeScaleJsonReport -Encoding UTF8
$largeScaleReport = $largeScaleReportRaw | ConvertFrom-Json
$userFlowReportRaw = node (Join-Path $PSScriptRoot 'verify-user-flows.js')
$userFlowReportRaw | Set-Content -LiteralPath $UserFlowJsonReport -Encoding UTF8
$userFlowReport = $userFlowReportRaw | ConvertFrom-Json
$userFlowFailed = if ($userFlowReport.status -eq 'PASS') { 0 } else { 1 }

$externalPattern = 'https?://(?!127\.0\.0\.1|localhost)'
$externalHits = @()
foreach ($item in @(
    @{Path = $htmlPath; Content = $html},
    @{Path = $partnerHtmlPath; Content = $partnerHtml},
    @{Path = $expertHtmlPath; Content = $expertHtml},
    @{Path = $jsPath; Content = $js},
    @{Path = $analyticsJsPath; Content = $analyticsJs},
    @{Path = $simulatorJsPath; Content = $simulatorJs},
    @{Path = $cssPath; Content = $css}
)) {
    if ($item.Content -match $externalPattern -or $item.Content -match 'confideline\.com') {
        $externalHits += $item.Path
    }
}

$pageResponse = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 10
$partnerPageResponse = Invoke-WebRequest -UseBasicParsing -Uri $PartnerUrl -TimeoutSec 10
$expertPageResponse = Invoke-WebRequest -UseBasicParsing -Uri $ExpertUrl -TimeoutSec 10
$fixtureResponse = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/fixtures/partner-interactions.fixture.json" -TimeoutSec 10

if (-not $SkipScreenshots) {
    npx -y playwright@latest screenshot --channel chrome --viewport-size=1440,900 --wait-for-selector 'body[data-ready="true"]' --full-page $Url $DesktopShot | Out-Null
    npx -y playwright@latest screenshot --channel chrome --viewport-size=390,844 --wait-for-selector 'body[data-ready="true"]' --full-page $Url $MobileShot | Out-Null
    npx -y playwright@latest screenshot --channel chrome --viewport-size=1440,900 --wait-for-selector 'body[data-ready="true"]' --full-page $PartnerUrl $PartnerDesktopShot | Out-Null
    npx -y playwright@latest screenshot --channel chrome --viewport-size=390,844 --wait-for-selector 'body[data-ready="true"]' --full-page $PartnerUrl $PartnerMobileShot | Out-Null
    npx -y playwright@latest screenshot --channel chrome --viewport-size=1440,900 --wait-for-selector 'body[data-ready="true"]' --full-page $ExpertUrl $ExpertDesktopShot | Out-Null
    npx -y playwright@latest screenshot --channel chrome --viewport-size=390,844 --wait-for-selector 'body[data-ready="true"]' --full-page $ExpertUrl $ExpertMobileShot | Out-Null
    npx -y playwright@latest screenshot --channel chrome --viewport-size=1440,900 --wait-for-selector 'body[data-ready="true"]' --full-page "${Url}?tab=charts" $AdminChartsShot | Out-Null
    npx -y playwright@latest screenshot --channel chrome --viewport-size=1440,900 --wait-for-selector 'body[data-ready="true"]' --full-page "${PartnerUrl}?tab=charts" $PartnerChartsShot | Out-Null
    npx -y playwright@latest screenshot --channel chrome --viewport-size=390,844 --wait-for-selector 'body[data-ready="true"]' --full-page "${ExpertUrl}?tab=charts" $ExpertChartsMobileShot | Out-Null
}

$result = [pscustomobject]@{
    status = if ($externalHits.Count -eq 0 -and $pageResponse.StatusCode -eq 200 -and $partnerPageResponse.StatusCode -eq 200 -and $expertPageResponse.StatusCode -eq 200 -and $fixtureResponse.StatusCode -eq 200 -and $analyticsReport.status -eq 'PASS' -and $simulatorReport.status -eq 'PASS' -and $largeScaleReport.status -eq 'PASS' -and $userFlowFailed -eq 0) { 'PASS' } else { 'FAIL' }
    url = $Url
    partnerUrl = $PartnerUrl
    expertUrl = $ExpertUrl
    checkedAt = (Get-Date).ToString('s')
    pageStatus = $pageResponse.StatusCode
    partnerPageStatus = $partnerPageResponse.StatusCode
    expertPageStatus = $expertPageResponse.StatusCode
    fixtureStatus = $fixtureResponse.StatusCode
    analyticsStatus = $analyticsReport.status
    analyticsCaseCount = $analyticsReport.caseCount
    analyticsFailures = $analyticsReport.failures
    simulatorStatus = $simulatorReport.status
    simulatorGeneratedEvents = $simulatorReport.generatedEvents
    simulatorFailures = $simulatorReport.failures
    largeScaleStatus = $largeScaleReport.status
    largeScale = $largeScaleReport.scale
    largeScaleFailures = $largeScaleReport.failures
    userFlowStatus = if ($userFlowFailed -eq 0) { 'PASS' } else { 'FAIL' }
    userFlowChecks = $userFlowReport.checks.Count
    userFlowFailures = $userFlowReport.failures
    externalReferenceHits = $externalHits
    fixtureEvents = $fixture.events.Count
    fixtureAssignments = $fixture.assignments.Count
    fixtureUsers = $fixture.users.Count
    screenshots = @{
        desktop = $DesktopShot
        mobile = $MobileShot
        partnerDesktop = $PartnerDesktopShot
        partnerMobile = $PartnerMobileShot
        expertDesktop = $ExpertDesktopShot
        expertMobile = $ExpertMobileShot
        adminCharts = $AdminChartsShot
        partnerCharts = $PartnerChartsShot
        expertChartsMobile = $ExpertChartsMobileShot
    }
}

$result | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $JsonReport -Encoding UTF8

$md = @(
    "# Partner interactions offline test",
    "",
    "- Status: $($result.status)",
    "- URL: $Url",
    "- Partner URL: $PartnerUrl",
    "- Expert URL: $ExpertUrl",
    "- Page status: $($result.pageStatus)",
    "- Partner page status: $($result.partnerPageStatus)",
    "- Expert page status: $($result.expertPageStatus)",
    "- Fixture status: $($result.fixtureStatus)",
    "- Analytics status: $($result.analyticsStatus)",
    "- Analytics cases: $($result.analyticsCaseCount)",
    "- Simulator status: $($result.simulatorStatus)",
    "- Simulator generated events: $($result.simulatorGeneratedEvents)",
    "- Large-scale status: $($result.largeScaleStatus)",
    "- User-flow status: $($result.userFlowStatus)",
    "- User-flow checks: $($result.userFlowChecks)",
    "- Fixture events: $($result.fixtureEvents)",
    "- Fixture assignments: $($result.fixtureAssignments)",
    "- Fixture users: $($result.fixtureUsers)",
    "- External reference hits: $($externalHits.Count)",
    "- Analytics report: $AnalyticsJsonReport",
    "- Simulator report: $SimulatorJsonReport",
    "- Large-scale report: $LargeScaleJsonReport",
    "- User-flow report: $UserFlowJsonReport",
    "- Desktop screenshot: $DesktopShot",
    "- Mobile screenshot: $MobileShot",
    "- Partner desktop screenshot: $PartnerDesktopShot",
    "- Partner mobile screenshot: $PartnerMobileShot",
    "- Expert desktop screenshot: $ExpertDesktopShot",
    "- Expert mobile screenshot: $ExpertMobileShot",
    "- Admin charts screenshot: $AdminChartsShot",
    "- Partner charts screenshot: $PartnerChartsShot",
    "- Expert charts mobile screenshot: $ExpertChartsMobileShot"
) -join [Environment]::NewLine
Set-Content -LiteralPath $MdReport -Value $md -Encoding UTF8

$result
