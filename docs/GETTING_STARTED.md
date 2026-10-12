# Getting started

## Requirements

- Codex Desktop/CLI with project-local agent configuration support.
- Node.js 20+.
- Git strongly recommended.

Optional: a compatible ChatGPT Web bridge if you want a Web model as the parent supervisor.

## Recommended setup: interactive wizard

From your target project root:

```bash
npx --yes github:crunaldo/codex-autopilot-kit init --target .
```

The wizard lets you choose:

- a Goal preset: `generic`, `frontend-visual`, or `backend`;
- an execution profile: `economy`, `balanced`, or `quality`;
- maximum subagent concurrency: `1`, `2`, or `3`.

It then shows a configuration summary before writing files. Concurrency `1` is the recommended conservative default. Values above `1` can increase simultaneous model usage.

The wizard uses only Node.js standard-library modules and adds no runtime dependencies.

If the project already contains an unmanaged `.codex/config.toml`, `init` asks before backing it up and replacing kit-managed paths. Declining leaves the project unchanged.

## Non-interactive setup

For CI, scripts, or agent-driven setup, provide all choices explicitly and add `--yes`:

```bash
npx --yes github:crunaldo/codex-autopilot-kit init --target . --preset generic --profile balanced --concurrency 1 --yes
```

A non-interactive `init` without the required choices fails instead of waiting for input.

## Direct install

The lower-level installer remains available:

```bash
npx --yes github:crunaldo/codex-autopilot-kit install --target . --profile balanced --preset generic --concurrency 1
```

For frontend/visual work use `--preset frontend-visual`; for services use `--preset backend`.

If the project already contains an unmanaged `.codex/config.toml`, direct installation stops. Review it first and use `--force` only when you intentionally want the kit to back it up and replace managed paths.

## Verify

```bash
npx --yes github:crunaldo/codex-autopilot-kit doctor --target .
```

Doctor checks expected files, strict UTF-8, role registration, Luna role models, read-only explorer/reviewer, disabled nested agents, configured concurrency, and the installer manifest.

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

Run `init` again to choose a new preset/profile/concurrency interactively, or run `install` with explicit options. Managed files are backed up first.

## Remove

```bash
npx --yes github:crunaldo/codex-autopilot-kit uninstall --target .
```

Restore the latest managed-file backup with:

```bash
npx --yes github:crunaldo/codex-autopilot-kit uninstall --target . --restore-latest
```
