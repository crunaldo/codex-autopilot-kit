param(
  [string]$Target = ".",
  [ValidateSet("economy","balanced","quality")][string]$Profile = "balanced",
  [ValidateSet("generic","frontend-visual","backend")][string]$Preset = "generic",
  [switch]$Force,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { throw "Node.js 20+ is required. Install Node, then re-run this script." }

$args = @("$PSScriptRoot\bin\codex-autopilot.mjs", "install", "--target", $Target, "--profile", $Profile, "--preset", $Preset)
if ($Force) { $args += "--force" }
if ($DryRun) { $args += "--dry-run" }
& node @args
exit $LASTEXITCODE
