# Roadmap

## In progress — v0.4 Visual Configurator

- Static client-side configurator under `configurator/`.
- Preset, profile, and concurrency selectors with live role preview.
- EN/ES language toggle.
- Shareable URL state.
- Copyable preview and install commands.
- Safety and managed-file summary.
- Responsive layout using the existing Codex Autopilot Kit visual system.
- GitHub Pages deployment workflow prepared.
- One-time GitHub Pages repository enablement is still required because the Actions token cannot create the Pages site for this repository.

## Distribution status — v0.3

Distribution engineering is complete, but external publication is not yet fully closed:

- Root-level `llms.txt` for machine-readable project discovery.
- Deterministic `INSTALL_FOR_AGENTS.md` installation contract for coding agents and CI.
- npm-ready package metadata, public publish configuration, provenance, and release checks.
- Tag-driven GitHub Release workflow with validated tarball + SHA-256 checksum artifacts.
- Opt-in npm publication path using Trusted Publishing or `NPM_TOKEN`.
- Distribution/discovery playbook with release checklist and recommended repository metadata.
- Awesome Agent Orchestrators submission prepared after reaching the 5-star adoption threshold.
- Pending external gates: create tag `v0.3.0`, allow the release workflow to run, and authenticate npm publishing.

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

- Complete v0.4 GitHub Pages deployment and browser QA.
- More installer merge strategies for pre-existing `.codex/config.toml` files.
- Machine-readable run telemetry helper.
- Additional presets for monorepos and data/ML projects.
- Automated compatibility checks against new Codex agent configuration versions.

## Later

- Signed release artifacts beyond SHA-256 checksums.
- Reproducible benchmark suite and local run receipts.
- Autopilot readiness scoring and richer compatibility diagnostics.

The project will not silently install third-party browser bridges or modify global Codex configuration.
