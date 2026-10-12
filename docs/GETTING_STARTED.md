# Getting started

## Requirements

- Codex Desktop/CLI with project-local agent configuration support.
- Node.js 20+.
- Git strongly recommended.

Optional: a compatible ChatGPT Web bridge if you want a Web model as the parent supervisor.

## Install

From your target project root:

```bash
npx --yes github:crunaldo/codex-autopilot-kit install --target . --profile balanced --preset generic
```

For frontend/visual work use `--preset frontend-visual`; for services use `--preset backend`.

If the project already contains an unmanaged `.codex/config.toml`, installation stops. Review it first and use `--force` only when you intentionally want the kit to back it up and replace managed paths.

## Verify

```bash
npx --yes github:crunaldo/codex-autopilot-kit doctor --target .
```

Doctor checks expected files, strict UTF-8, role registration, Luna role models, read-only explorer/reviewer, disabled nested agents, one-thread concurrency, and the installer manifest.

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

Run the install command again. Managed files are backed up first.

## Remove

```bash
npx --yes github:crunaldo/codex-autopilot-kit uninstall --target .
```

Restore the latest managed-file backup with:

```bash
npx --yes github:crunaldo/codex-autopilot-kit uninstall --target . --restore-latest
```
