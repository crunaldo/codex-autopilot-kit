<p align="center">
  <img src="assets/brand/banner.svg" alt="Codex Autopilot Kit" width="100%" />
</p>

<p align="center">
  <strong>English</strong> · <a href="README.es.md">Español</a>
</p>

# Codex Autopilot Kit

<p align="center">
  <strong>Keep Codex. Add Autopilot.</strong><br />
  Turn an existing Codex project into a safe, project-scoped multi-agent workflow.
</p>

<p align="center">
  <a href="../../actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/crunaldo/codex-autopilot-kit/ci.yml?branch=main&label=CI" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="docs/SAFETY.md"><img src="https://img.shields.io/badge/config-project--scoped-success" alt="Project scoped" /></a>
  <a href="package.json"><img src="https://img.shields.io/badge/runtime_dependencies-0-success" alt="Zero runtime dependencies" /></a>
</p>

Codex Autopilot Kit installs a tested `.codex/` agent stack plus reusable Goal templates into an existing repository. A supervisor plans and evaluates while scoped subagents explore, implement, test, and independently review.

It is deliberately **not another coding agent, IDE, cloud platform, or orchestration runtime**. It is a lightweight autopilot layer for people who already want to use Codex without replacing their workflow.

> Default strategy: **Supervisor (you choose) → Luna Medium explorer → Luna High worker → Luna High reviewer**, concurrency 1 by default.

## Recommended setup: `init`

From the target project root:

```bash
npx --yes github:crunaldo/codex-autopilot-kit init --target .
```

The wizard lets you choose:

- Goal preset: `generic`, `frontend-visual`, or `backend`;
- execution profile: `economy`, `balanced`, or `quality`;
- maximum subagent concurrency: `1`, `2`, or `3`.

It shows a configuration summary before any installation happens. Concurrency `1` is the recommended conservative default.

For CI, scripts, or agent-driven setup:

```bash
npx --yes github:crunaldo/codex-autopilot-kit init \
  --target . \
  --preset generic \
  --profile balanced \
  --concurrency 1 \
  --yes
```

The wizard uses only Node.js standard-library modules. The package keeps **zero runtime dependencies**.

## Inspect before installing

### Dry run

```bash
npx --yes github:crunaldo/codex-autopilot-kit install \
  --target . \
  --profile balanced \
  --preset generic \
  --concurrency 1 \
  --dry-run
```

The preview classifies managed paths as:

```text
CREATE     new file
REPLACE    existing file that would change
UNCHANGED  file already matching the desired state
UPDATE     .gitignore if the backup rule is missing
```

No files are written, no backups are created, and `~/.codex` is never touched.

The wizard also supports a preview-only path:

```bash
npx --yes github:crunaldo/codex-autopilot-kit init \
  --target . \
  --preset frontend-visual \
  --profile balanced \
  --concurrency 1 \
  --yes \
  --dry-run
```

### Diff

See the exact managed-file changes before installing:

```bash
npx --yes github:crunaldo/codex-autopilot-kit diff --target .
```

When the kit is already installed, `diff` defaults to the installed profile, preset, and concurrency. Compare against another desired setup without writing anything:

```bash
npx --yes github:crunaldo/codex-autopilot-kit diff \
  --target . \
  --profile quality \
  --preset backend \
  --concurrency 2
```

Machine-readable diff summary:

```bash
npx --yes github:crunaldo/codex-autopilot-kit diff --target . --json
```

## Quick visual flow

<p align="center">
  <img src="assets/brand/demo-flow.svg" alt="Install, doctor, and goal flow" width="100%" />
</p>

The short path is: configure with `init`, inspect with `--dry-run` or `diff`, install, run `doctor`, then start the Goal in a new Codex chat.

## Why Codex Autopilot Kit?

A long autonomous coding run should not require putting every step on the strongest possible model or adopting an entirely new agent platform.

Codex Autopilot Kit separates responsibilities instead:

- **Supervisor** — planning, reasoning, evaluation, escalation, and stopping decisions.
- **Explorer** — narrow, read-only discovery before implementation.
- **Worker** — implementation, debugging, testing, and validation.
- **Reviewer** — independent, read-only final review.

The result is a small project-local layer with explicit roles, reusable Goal contracts, conservative defaults, recovery paths, and no package runtime dependencies.

### What it optimizes for

| Principle | Codex Autopilot Kit approach |
|---|---|
| Keep the existing tool | Adds structure **to Codex** instead of replacing it |
| Project isolation | Configuration lives in the repository, not global user config |
| Predictable delegation | Explicit Explorer / Worker / Reviewer responsibilities |
| Conservative autonomy | Concurrency 1 by default |
| Inspectable setup | `init`, `--dry-run`, `diff`, backups, manifest |
| Cost-aware execution | Strong supervisor + scoped worker roles |
| Reusable workflows | Goal presets for general, frontend/visual, and backend work |
| Low operational footprint | Zero package runtime dependencies; no hidden services |

## Architecture

<p align="center">
  <img src="assets/brand/architecture.svg" alt="Codex Autopilot Kit architecture" width="100%" />
</p>

This separation is intentional: discovery and review do not need write access, implementation stays scoped, and the supervisor retains escalation and stopping decisions.

## Positioning

Codex Autopilot Kit is intentionally narrower than full agent platforms and orchestration frameworks. It focuses on people who already use Codex and want a lightweight, project-scoped autonomy layer rather than a replacement coding environment.

| Tool | Typical focus |
|---|---|
| **Codex Autopilot Kit** | Add structured multi-agent autonomy to an existing Codex project |
| Ralph Orchestrator | Broader autonomous orchestration workflows |
| OpenHands | Full agent platform and execution environments |
| OpenCode | Standalone coding-agent experience |
| Open Ralph Wiggum | Lightweight iterative agent loop |
| Awesome Agent Orchestrators | Discovery/reference list for orchestration projects |

The goal is not to replace broader platforms. It is to make an existing Codex project more autonomous without taking it over.

## What gets installed

```text
.codex/
  config.toml
  agents/
    explorer.toml
    worker.toml
    reviewer.toml
  autopilot-kit.json

AUTOPILOT-GOAL.md
```

Managed files are backed up before replacement. Re-running an install that already matches is idempotent: it does not rewrite managed files or create unnecessary backups.

## Direct installation

The lower-level installer remains available:

```bash
npx --yes github:crunaldo/codex-autopilot-kit install \
  --target . \
  --profile balanced \
  --preset generic \
  --concurrency 1
```

For frontend/visual work:

```bash
npx --yes github:crunaldo/codex-autopilot-kit install \
  --target . \
  --profile balanced \
  --preset frontend-visual \
  --concurrency 1
```

If an unmanaged `.codex/config.toml` exists, normal installation stops. Inspect with `diff` or `--dry-run` first; use `--force` only when you intentionally want the kit to back it up and replace managed paths.

## Doctor

```bash
npx --yes github:crunaldo/codex-autopilot-kit doctor --target .
```

Doctor checks required files, strict UTF-8, role registration, expected role models, read-only Explorer/Reviewer, disabled nested agents, configured concurrency, and the local manifest.

For CI and agents:

```bash
npx --yes github:crunaldo/codex-autopilot-kit doctor --target . --json
```

The JSON contract includes `schemaVersion`, `command`, `pass`, `target`, `kitVersion`, and individual checks.

## Status

```bash
npx --yes github:crunaldo/codex-autopilot-kit status --target .
```

Machine-readable status:

```bash
npx --yes github:crunaldo/codex-autopilot-kit status --target . --json
```

If the kit is not installed, JSON mode returns `installed: false` with exit code `2`.

## Start an autonomous Goal

After install/update, open a **new Codex chat** in the project so local configuration reloads. Select your supervisor model, then invoke `/goal` using `AUTOPILOT-GOAL.md` as the contract.

```text
/goal Read AUTOPILOT-GOAL.md and autonomously complete the objective I provide below. Respect its agent roles, safety rules, stopping conditions, and verification gates. Do not wait for me between iterations unless truly BLOCKED.

OBJECTIVE:
<describe the project outcome here>
```

For long runs, define concrete pass/fail gates instead of asking the agent to “keep improving.”

## Profiles

| Profile | Explorer | Worker | Reviewer | Recommended for |
|---|---:|---:|---:|---|
| `economy` | medium | medium | high | repetitive or well-scoped work |
| `balanced` | medium | high | high | **default; real project work** |
| `quality` | high | high | high | difficult, discovery-heavy repositories |

No profile enables `max` automatically.

## Goal presets

- `generic` — general software tasks.
- `frontend-visual` — DISCOVER → EVIDENCE → BUILD → CAPTURE → COMPARE → FIX → VERIFY.
- `backend` — inspect → implement → unit/integration tests → contract checks → review.

## Commands

```text
codex-autopilot init       Interactive configuration and installation wizard
codex-autopilot install    Install/update the project-scoped stack
codex-autopilot diff       Compare current managed files with desired state
codex-autopilot doctor     Validate files, roles, concurrency, and manifest
codex-autopilot status     Show installed profile/preset/concurrency/version
codex-autopilot uninstall  Remove managed files; optionally restore backup
codex-autopilot print-goal Print a Goal preset to stdout
```

Run help:

```bash
npx --yes github:crunaldo/codex-autopilot-kit --help
```

## Safety model

The installer is intentionally conservative:

- project-local only;
- backups before replacing managed paths;
- no changes to `~/.codex`;
- no git commit/push;
- no package installation in the target project;
- no hidden network services;
- concurrency 1 by default;
- reviewer is read-only;
- explorer is read-only;
- `--dry-run` and `diff` are inspection-only.

Read [SAFETY.md](docs/SAFETY.md) before using unattended Goals on valuable repositories.

## Supervisor model

The kit does **not** force the parent/supervisor model. Select it in Codex when starting the run.

A field-tested optional bridge setup is:

```text
GPT-5.6 Sol (Web) High  -> supervisor
GPT-6 Luna Medium       -> explorer
GPT-6 Luna High         -> worker
GPT-6 Luna High         -> reviewer
```

`codex-chatgpt-web` is optional, third-party, and never installed silently. See [Model strategy](docs/MODEL_STRATEGY.md) and [Bridge setup](docs/BRIDGE_SETUP.md).

## Documentation

- [Getting started](docs/GETTING_STARTED.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Model strategy](docs/MODEL_STRATEGY.md)
- [Goal playbook](docs/GOAL_PLAYBOOK.md)
- [Safety](docs/SAFETY.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Optional ChatGPT Web bridge](docs/BRIDGE_SETUP.md)
- [Field notes](docs/field-notes/2026-10.md)
- [Guía en español](README.es.md)

## Project status

See [ROADMAP.md](ROADMAP.md) for planned improvements.

Codex Autopilot Kit is a community project and is not affiliated with or endorsed by OpenAI. Product names and trademarks belong to their respective owners.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
