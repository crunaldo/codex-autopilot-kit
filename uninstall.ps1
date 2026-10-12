param(
  [string]$Target = ".",
  [switch]$RestoreLatest,
  [switch]$DryRun
)
$ErrorActionPreference = "Stop"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js 20+ is required." }
$args = @("$PSScriptRoot\bin\codex-autopilot.mjs", "uninstall", "--target", $Target)
if ($RestoreLatest) { $args += "--restore-latest" }
if ($DryRun) { $args += "--dry-run" }
& node @args
exit $LASTEXITCODE
