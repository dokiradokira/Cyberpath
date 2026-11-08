$ErrorActionPreference = 'Stop'

$agentsPath = Join-Path (Split-Path $PSScriptRoot -Parent) 'AGENTS.md'
$content = Get-Content -LiteralPath $agentsPath -Raw -Encoding UTF8

$requiredLines = @(
    '## 注意事项',
    '- 每次改动完成后，都必须创建一个对应的 Git commit，以便后续追踪和回滚',
    '- 每次改动后，都必须编写或更新相关测试，并在交付给用户前，确保所有测试和验证全部通过'
)

foreach ($line in $requiredLines) {
    if (($content -split '\r?\n') -cnotcontains $line) {
        throw "AGENTS.md is missing a required line: $line"
    }
}

Write-Output 'AGENTS.md validation passed.'
