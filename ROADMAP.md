# Roadmap

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

- More installer merge strategies for pre-existing `.codex/config.toml` files.
- Machine-readable run telemetry helper.
- Additional presets for monorepos and data/ML projects.
- Automated compatibility checks against new Codex agent configuration versions.

## Later

- Signed release artifacts beyond SHA-256 checksums.
- Reproducible benchmark suite and local run receipts.
- Autopilot readiness scoring and richer compatibility diagnostics.

The project will not silently install third-party browser bridges or modify global Codex configuration.
