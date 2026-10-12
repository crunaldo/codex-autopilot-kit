# Roadmap

## Completed — v0.3 Distribution & Discovery

- Root-level `llms.txt` for machine-readable project discovery.
- Deterministic `INSTALL_FOR_AGENTS.md` installation contract for coding agents and CI.
- npm-ready package metadata, public publish configuration, provenance, and release checks.
- Tag-driven GitHub Release workflow with validated tarball + SHA-256 checksum artifacts.
- Opt-in npm publication path using Trusted Publishing or `NPM_TOKEN`.
- Distribution/discovery playbook with release checklist and recommended repository metadata.
- Prepared Awesome Agent Orchestrators submission copy and acceptance-gate tracking.

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

- Static client-side configurator for GitHub Pages.
- More installer merge strategies for pre-existing `.codex/config.toml` files.
- Machine-readable run telemetry helper.
- Additional presets for monorepos and data/ML projects.
- Automated compatibility checks against new Codex agent configuration versions.
- Publish the first npm version once npm Trusted Publishing or a publishing token is configured.
- Submit to Awesome Agent Orchestrators after the project's adoption threshold is met.

## Later

- Signed release artifacts beyond SHA-256 checksums.
- Reproducible benchmark suite and local run receipts.
- Autopilot readiness scoring and richer compatibility diagnostics.

The project will not silently install third-party browser bridges or modify global Codex configuration.
