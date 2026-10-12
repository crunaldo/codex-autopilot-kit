# Changelog

## Unreleased

- Added `codex-autopilot init` interactive setup wizard.
- Added preset, profile, and concurrency selection before install.
- Added a configuration summary and confirmation gate.
- Added non-interactive `init` support with explicit options plus `--yes`.
- Made subagent concurrency configurable (`1`, `2`, or `3`) and persisted it in the manifest.
- Updated `doctor` and `status` to respect configured concurrency.

## 0.1.0 — 2026-10-12

- Initial public kit.
- Project-scoped installer and uninstaller.
- UTF-8 validation and doctor command.
- Economy, balanced, and quality profiles.
- Generic, frontend-visual, and backend Goal presets.
- Explorer/worker/reviewer role architecture.
- Safety and troubleshooting documentation.
- Field notes from controlled Goal experiments.
