# Getting started

## Requirements

- Codex Desktop/CLI with project-local agent configuration support.
- Node.js 20+.
- Git strongly recommended.

Optional: a compatible ChatGPT Web bridge if you want a Web model as the parent supervisor.

## Visual setup

Open the public configurator:

```text
https://crunaldo.github.io/codex-autopilot-kit/
```

Choose a Goal preset, execution profile, and maximum subagent concurrency. The URL preserves those choices so the configuration can be shared. Use **Copy preview** first, inspect the dry run, then use **Copy install**.

The configurator is static, client-side, and does not receive your repository contents or credentials.

## Recommended CLI setup: interactive wizard

From your target project root:

```bash
npx --yes codex-autopilot-kit init --target .
```

The wizard lets you choose:

- a Goal preset: `generic`, `frontend-visual`, or `backend`;
- an execution profile: `economy`, `balanced`, or `quality`;
- maximum subagent concurrency: `1`, `2`, or `3`.

It then shows a configuration summary before writing files. Concurrency `1` is the recommended conservative default. Values above `1` can increase simultaneous model usage.

The wizard uses only Node.js standard-library modules and adds no runtime dependencies.

If the project already contains an unmanaged `.codex/config.toml`, `init` asks before backing it up and replacing kit-managed paths. Declining leaves the project unchanged.

GitHub-source fallback:

```bash
npx --yes github:crunaldo/codex-autopilot-kit init --target .
```

## Non-interactive setup

For CI, scripts, or agent-driven setup, provide all choices explicitly and add `--yes`:

```bash
npx --yes codex-autopilot-kit init --target . --preset generic --profile balanced --concurrency 1 --yes
```

A non-interactive `init` without the required choices fails instead of waiting for input.

## Preview without changing files

Use the installer dry run to classify the planned changes:

```bash
npx --yes codex-autopilot-kit install --target . --profile balanced --preset generic --concurrency 1 --dry-run
```

The output reports `CREATE`, `REPLACE`, and `UNCHANGED` for managed files and `UPDATE` for `.gitignore` when needed. It does not write files or create backups.

`init` also supports `--dry-run`:

```bash
npx --yes codex-autopilot-kit init --target . --preset generic --profile balanced --concurrency 1 --yes --dry-run
```

## Inspect exact changes with diff

```bash
npx --yes codex-autopilot-kit diff --target .
```

On an installed project, omitted profile/preset/concurrency values are taken from the current manifest. To inspect a proposed change:

```bash
npx --yes codex-autopilot-kit diff --target . --profile quality --preset backend --concurrency 2
```

Machine-readable summary:

```bash
npx --yes codex-autopilot-kit diff --target . --json
```

`diff` never writes files.

## Direct install

The lower-level installer remains available:

```bash
npx --yes codex-autopilot-kit install --target . --profile balanced --preset generic --concurrency 1
```

For frontend/visual work use `--preset frontend-visual`; for services use `--preset backend`.

If the project already contains an unmanaged `.codex/config.toml`, direct installation stops. Review it first with `diff` or `--dry-run`; use `--force` only when you intentionally want the kit to back it up and replace managed paths.

An install that already matches the requested state is idempotent and does not create unnecessary backups.

## Verify

```bash
npx --yes codex-autopilot-kit doctor --target .
```

Doctor checks expected files, strict UTF-8, role registration, Luna role models, read-only explorer/reviewer, disabled nested agents, configured concurrency, and the installer manifest.

For CI or agents:

```bash
npx --yes codex-autopilot-kit doctor --target . --json
```

The JSON envelope contains `schemaVersion`, `command`, `pass`, `target`, `kitVersion`, and individual check results.

## Read installation status

```bash
npx --yes codex-autopilot-kit status --target .
```

Machine-readable status:

```bash
npx --yes codex-autopilot-kit status --target . --json
```

If the target has no managed installation, JSON status returns `installed: false` and exits with code `2`.

## Start Codex

After install/update, open a **new Codex chat** in the project so local configuration reloads. Restart Desktop if it caches config aggressively.

Recommended tested pattern with a Web bridge:

```text
GPT-5.6 Sol (Web) High -> supervisor
GPT-6 Luna Medium      -> explorer
GPT-6 Luna High        -> worker
GPT-6 Luna High        -> reviewer
```

## Launch a Goal

Edit `AUTOPILOT-GOAL.md` with a concrete objective and finish criteria, then invoke:

```text
/goal Read AUTOPILOT-GOAL.md and autonomously complete the objective below. Respect its roles, safety rules, verification gates, and PASS/BLOCKED contract. Do not wait for me between iterations unless genuinely BLOCKED.

OBJECTIVE:
<your concrete objective>
```

Prefer measurable finish lines over vague instructions such as "keep improving".

## Monitor useful metrics

Track start/end 5-hour quota, start/end weekly quota, duration, worker/reviewer passes, unintended model escalations, and Goal token telemetry as informational data only.

## Update

Run `init` again to choose a new preset/profile/concurrency interactively, or inspect the proposed change with `diff` before running `install`. Managed replacements are backed up first.

## Remove

```bash
npx --yes codex-autopilot-kit uninstall --target .
```

Restore the latest managed-file backup with:

```bash
npx --yes codex-autopilot-kit uninstall --target . --restore-latest
```
