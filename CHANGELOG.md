# Changelog

## Unreleased — v0.4.0

### Visual Configurator

- Added a public visual configurator deployed with GitHub Pages.
- Added preset, execution profile, and concurrency controls with live Explorer/Worker/Reviewer preview.
- Added EN/ES UI, shareable URL state, and copyable preview/install commands.
- Switched configurator-generated commands to the published npm package while keeping GitHub as the canonical source/fallback.
- Added a framework-free `configurator/core.js` module so command generation and URL state can be tested independently from the DOM.
- Added exhaustive automated coverage for all 54 preset × profile × concurrency × language combinations.
- Pointed package homepage metadata to the configurator.
- Kept the configurator static, client-side, and free of runtime dependencies.

## 0.3.0 — 2026-10-12

### Distribution & Discovery

- Added `llms.txt` with a concise machine-readable project guide, CLI surface, safety invariants, and canonical documentation map.
- Added `INSTALL_FOR_AGENTS.md` with a deterministic preview → diff → install → doctor flow for coding agents and CI.
- Added `docs/DISTRIBUTION.md` covering GitHub Releases, npm publication, discovery metadata, release checks, and community-directory submission readiness.
- Expanded npm metadata, keywords, package contents, public publish configuration, and provenance support.
- Added `npm run release:check` and a `prepublishOnly` validation gate.
- Hardened the release workflow to validate tag/version alignment, run the full release check, build the npm tarball, generate SHA-256 checksums, and create/update GitHub Releases.
- Added opt-in npm publication with provenance through the release workflow when npm authentication or Trusted Publishing is configured.
- Expanded package verification to require distribution/discovery docs, release automation, npm metadata, zero runtime dependencies, and provenance configuration.
- Prepared the canonical one-line description and submission plan for Awesome Agent Orchestrators; submission remains intentionally deferred until the directory's adoption threshold is met.

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
