param(
    [string]$QaRoot = "H:\GPT-Codex\Confideline\qa-ba-autonomous-tester",
    [switch]$Json
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$policyPath = Join-Path $QaRoot "config\subagent-spark-policy.json"
$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
    param(
        [string]$Id,
        [bool]$Pass,
        [string]$Detail
    )
    $script:checks.Add([pscustomobject]@{
        id = $Id
        status = $(if ($Pass) { "PASS" } else { "FAIL" })
        detail = $Detail
    }) | Out-Null
}

if (-not (Test-Path -LiteralPath $policyPath -PathType Leaf)) {
    Add-Check -Id "POLICY-FILE" -Pass $false -Detail "Missing policy file: $policyPath"
    $policy = $null
} else {
    $policy = Get-Content -LiteralPath $policyPath -Raw -Encoding UTF8 | ConvertFrom-Json
    Add-Check -Id "POLICY-FILE" -Pass $true -Detail $policyPath
}

if ($policy) {
    $allowedEfforts = @($policy.subagentLane.allowedReasoningEfforts | ForEach-Object { [string]$_ })
    $doNotUse = @($policy.doNotUseWhen | ForEach-Object { [string]$_ })
    $stopConditions = @($policy.stopConditions | ForEach-Object { [string]$_ })
    $outputs = @($policy.requiredPerSubagentContract.outputs | ForEach-Object { [string]$_ })

    Add-Check -Id "MAX-SUBAGENTS-PER-PASS" -Pass ([int]$policy.maxSubagentsPerPass -eq 10) -Detail "Expected 10, actual $($policy.maxSubagentsPerPass)."
    Add-Check -Id "SPARK-MODEL" -Pass ([string]$policy.subagentLane.defaultModel -eq "gpt-5.3-codex-spark") -Detail "Default model: $($policy.subagentLane.defaultModel)."
    Add-Check -Id "XHIGH-REASONING" -Pass ([string]$policy.subagentLane.defaultReasoningEffort -eq "xhigh" -and $allowedEfforts -contains "xhigh") -Detail "Default effort: $($policy.subagentLane.defaultReasoningEffort); allowed: $($allowedEfforts -join ', ')."
    Add-Check -Id "FULL-USEFUL-QUOTA-ALLOWED" -Pass ([bool]$policy.subagentLane.allowFullAvailableSparkQuotaForUsefulTesting) -Detail "Quota mode: $($policy.subagentLane.quotaUseMode)."
    Add-Check -Id "HUMAN-BOUNDARY" -Pass (($doNotUse -join " ") -match "human login|MFA|payment|credential") -Detail "Human/account boundary is explicit."
    Add-Check -Id "LOCAL-TRUST-BOUNDARY" -Pass (($doNotUse -join " ") -match "destructive outside the local trust boundary") -Detail "External destructive work is forbidden."
    Add-Check -Id "STOP-NO-USEFUL-WORK" -Pass (($stopConditions -join " ") -match "no useful independent testing work") -Detail "No-useful-work stop condition is explicit."
    Add-Check -Id "SUBAGENT-OUTPUT-CONTRACT" -Pass ($outputs -contains "verdict" -and $outputs -contains "evidence paths or URLs" -and $outputs -contains "findings") -Detail "Subagent output contract covers verdict, evidence, and findings."
}

$failures = @($checks | Where-Object { [string]$_.status -eq "FAIL" })
$status = if ($failures.Count -eq 0) { "PASS" } else { "FAIL" }
$result = [pscustomobject]@{
    status = $status
    generated = (Get-Date).ToString("o")
    qaRoot = $QaRoot
    policyPath = $policyPath
    maxSubagentsPerPass = $(if ($policy) { [int]$policy.maxSubagentsPerPass } else { $null })
    defaultModel = $(if ($policy) { [string]$policy.subagentLane.defaultModel } else { $null })
    defaultReasoningEffort = $(if ($policy) { [string]$policy.subagentLane.defaultReasoningEffort } else { $null })
    checks = @($checks.ToArray())
}

if ($Json.IsPresent) {
    $result | ConvertTo-Json -Depth 8
} else {
    "Subagent Spark policy: $status"
    "Policy: $policyPath"
    "Max subagents per pass: $($result.maxSubagentsPerPass)"
    "Default model: $($result.defaultModel)"
    "Default reasoning effort: $($result.defaultReasoningEffort)"
}

if ($status -ne "PASS") {
    exit 1
}
