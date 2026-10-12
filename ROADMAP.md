# Roadmap

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
- Static client-side configurator for GitHub Pages.

## Later

- Signed release artifacts.
- npm publication when release/distribution workflow is ready.

The project will not silently install third-party browser bridges or modify global Codex configuration.
