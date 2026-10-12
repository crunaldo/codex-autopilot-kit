# Roadmap

## v0.4 Make it visible — released; visibility follow-ups remain

- GitHub Release `v0.4.0` includes the package tarball and its `.sha256` checksum.
- npm `latest` is `0.4.0`.
- GitHub repository About metadata is set: project description, GitHub Pages website, and eight discovery topics (`codex`, `ai-agents`, `multi-agent`, `agent-orchestration`, `developer-tools`, `automation`, `cli`, `openai`).
- The [Awesome Agent Orchestrators submission](https://github.com/andyrewlee/awesome-agent-orchestrators/pull/293) is open and awaiting maintainer review.

## In progress — v0.5 Make it measurable

- Run receipts and local telemetry: implemented; records are explicit, local, and exclude Goal text and tokens.
- `runs` listing and JSON envelope: implemented.
- Readiness checklist: implemented; ten observable checks, with unavailable Git state reported as unknown.
- Benchmark suite: three fixed, test-backed starter tasks with deterministic acceptance checks; implemented.
- Benchmark pairing and summaries: implemented with explicit case/repetition IDs; mismatched, incomplete, or duplicate pairs are surfaced.
- Reproducible field-test protocol: documented; actual paired Codex-only versus kit runs are NOT RUN.
- Installer merge strategy with conflict detection and backup-before-write: implemented.

## v0.4 Visual Configurator

- Static client-side configurator under `configurator/`.
- Preset, profile, and concurrency selectors with live role preview.
- EN/ES language toggle.
- Shareable URL state.
- Copyable npm-first preview and install commands.
- Safety and managed-file summary.
- Responsive layout using the existing Codex Autopilot Kit visual system.
- GitHub Pages deployment live at `https://crunaldo.github.io/codex-autopilot-kit/`.
- Pure configurator core separated from DOM behavior for deterministic testing.
- Automated coverage for all 54 preset × profile × concurrency × language combinations.
- Package homepage points to the visual configurator.
- Rendered browser QA passed on desktop and mobile: presets, profiles, concurrency, EN/ES, URL state, copy confirmations, responsive layout, and console.

## Completed — v0.3 Distribution & Discovery

- Root-level `llms.txt` for machine-readable project discovery.
- Deterministic `INSTALL_FOR_AGENTS.md` installation contract for coding agents and CI.
- npm package `codex-autopilot-kit@0.3.0` published with `latest` pointing to `0.3.0`.
- Tag-driven GitHub Release workflow with validated tarball + SHA-256 checksum artifacts.
- Staged npm publication workflow with provenance and manual approval boundary.
- Distribution/discovery playbook with release checklist and recommended repository metadata.
- Awesome Agent Orchestrators submission prepared after reaching the 5-star adoption threshold.
- Git tag `v0.3.0` and GitHub Release published.

## Completed — v0.2 Effortless setup

- Interactive `codex-autopilot init` wizard.
- Preset, profile, and concurrency selection before install.
- Configuration summary and confirmation gate.
- Non-interactive `init` path for CI/automation.
- `init --dry-run` and classified `install --dry-run` previews.
- Inspection-only `codex-autopilot diff` with JSON summary mode.
- Stable `doctor --json` and `status --json` envelopes.
- Idempotent install behavior when managed state already matches.
- English/Spanish README parity.

## Near term

- Additional presets for monorepos and data/ML projects.
- Automated compatibility checks against new Codex agent configuration versions.

## Later

- Signed release artifacts beyond SHA-256 checksums.
- Richer compatibility diagnostics.

The project will not silently install third-party browser bridges or modify global Codex configuration.
