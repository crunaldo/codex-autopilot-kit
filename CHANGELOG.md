# Changelog

## 0.2.0 — 2026-10-12

### Effortless setup

- Added interactive `codex-autopilot init` wizard.
- Added preset, profile, and concurrency selection with a confirmation summary.
- Added non-interactive `init` for CI, scripts, and agent-driven setup.
- Added `init --dry-run` and improved `install --dry-run` with `CREATE`, `REPLACE`, and `UNCHANGED` classification.
- Added `codex-autopilot diff` for inspection-only managed-file comparisons.
- Added `diff --json` for machine-readable change summaries.
- Stabilized `doctor --json` and `status --json` envelopes with `schemaVersion`, `command`, and `kitVersion` metadata.
- `status --json` now reports `installed: false` with exit code `2` for uninstalled targets.
- Install is now idempotent when managed files already match the desired state, avoiding unnecessary writes and backups.
- Configured concurrency is persisted in both `.codex/config.toml` and the local manifest and is validated by `doctor`.
- Brought the Spanish README to feature parity with the English README.
- Expanded automated tests for init, dry-run, diff, JSON contracts, idempotency, concurrency, and backups.

## 0.1.0 — 2026-10-12

- Initial public kit.
- Project-scoped installer and uninstaller.
- UTF-8 validation and doctor command.
- Economy, balanced, and quality profiles.
- Generic, frontend-visual, and backend Goal presets.
- Explorer/worker/reviewer role architecture.
- Safety and troubleshooting documentation.
- Field notes from controlled Goal experiments.
