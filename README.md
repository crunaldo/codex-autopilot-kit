<p align="center">
  <img src="assets/brand/banner.svg" alt="Codex Autopilot Kit" width="100%" />
</p>

<p align="center">
  <strong>English</strong> · <a href="README.es.md">Español</a>
</p>

# Codex Autopilot Kit

<p align="center">
  <strong>Keep Codex. Add Autopilot.</strong><br />
  Turn an existing Codex project into a safe, project-scoped multi-agent workflow in one command.
</p>

<p align="center">
  <a href="../../actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/crunaldo/codex-autopilot-kit/ci.yml?branch=main&label=CI" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="docs/SAFETY.md"><img src="https://img.shields.io/badge/config-project--scoped-success" alt="Project scoped" /></a>
  <a href="package.json"><img src="https://img.shields.io/badge/runtime_dependencies-0-success" alt="Zero runtime dependencies" /></a>
</p>

Codex Autopilot Kit installs a tested `.codex/` agent stack plus reusable Goal templates into an existing repository. A strong supervisor plans and evaluates while scoped subagents explore, implement, test, and independently review.

It is deliberately **not another coding agent, IDE, cloud platform, or orchestration runtime**. It is a lightweight autopilot layer for people who already want to use Codex and do not want to replace their existing workflow.

> Default strategy: **Supervisor (you choose) → Luna Medium explorer → Luna High worker → Luna High reviewer**, one subagent at a time.

## Install in one command

From the target project root:

```bash
npx --yes github:crunaldo/codex-autopilot-kit install --target . --profile balanced --preset generic
```

Then verify it:

```bash
npx --yes github:crunaldo/codex-autopilot-kit doctor --target .
```

The installer stays inside the target project, backs up conflicting managed files, creates a local manifest, and never edits your global `~/.codex` configuration.

## Quick visual flow

<p align="center">
  <img src="assets/brand/demo-flow.svg" alt="Install, doctor, and goal flow" width="100%" />
</p>

The shortest path is simple: install the project-scoped stack, run `doctor`, then start the autonomous Goal in a new Codex chat.

## Why Codex Autopilot Kit?

A long autonomous coding run should not require turning every step into the most expensive possible model call or adopting an entirely new agent platform.

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
| Predictable delegation | Explicit explorer, worker, and reviewer responsibilities |
| Conservative autonomy | One subagent concurrently by default |
| Inspectable setup | Managed files, manifest, backups, `status`, and `doctor` |
| Cost-aware execution | Strong supervisor + scoped worker roles instead of strongest-model-everywhere |
| Reusable workflows | Goal presets for general, frontend/visual, and backend work |
| Low operational footprint | Zero package runtime dependencies; no hidden services |

## Architecture

<p align="center">
  <img src="assets/brand/architecture.svg" alt="Codex Autopilot Kit architecture" width="100%" />
</p>

This separation is intentional: discovery and review do not need write access, implementation stays scoped, and the supervisor retains escalation decisions.

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

### Choose this kit if...

- you already use **Codex** and want to keep it;
- you want multi-agent roles without adopting a separate orchestration platform;
- you prefer configuration that is **repository-scoped and reversible**;
- you want explorer and reviewer roles to remain read-only by default;
- you want a reusable autonomous Goal contract instead of an unbounded “keep trying” loop;
- you value a small operational footprint and explicit safety boundaries.

The goal is not to replace broader platforms. It is to make an existing Codex project more autonomous without taking it over.

## What gets installed

The exact generated files depend on the selected preset/profile, but the managed stack includes:

```text
.codex/
  config.toml
  agents/
    explorer.toml
    worker.toml
    reviewer.toml

AUTOPILOT-GOAL.md
```

The installer also records a local manifest and creates backups before replacing conflicting managed paths.

## Installation

### Recommended: invoke this repository with `npx`

General software work:

```bash
npx --yes github:crunaldo/codex-autopilot-kit install --target . --profile balanced --preset generic
```

Visual/frontend cloning work:

```bash
npx --yes github:crunaldo/codex-autopilot-kit install --target . --profile balanced --preset frontend-visual
```

The installer:

1. stays inside the target project;
2. backs up conflicting `.codex` / Goal files;
3. installs UTF-8-safe agent configuration;
4. creates a local manifest;
5. adds the backup directory to `.gitignore`;
6. never edits your global `~/.codex` configuration.

### Local clone

```bash
git clone https://github.com/crunaldo/codex-autopilot-kit.git
cd codex-autopilot-kit
node bin/codex-autopilot.mjs install --target /path/to/project
```

Windows PowerShell wrapper:

```powershell
.\install.ps1 -Target C:\path\to\project
```

macOS/Linux wrapper:

```bash
./install.sh --target /path/to/project
```

## Verify the installation

```bash
npx --yes github:crunaldo/codex-autopilot-kit doctor --target .
```

Expected roles:

| Role | Default model | Reasoning | Purpose |
|---|---|---:|---|
| `explorer` | `gpt-6-luna` | medium | targeted read-only discovery |
| `worker` | `gpt-6-luna` | high | implementation, debugging, tests |
| `reviewer` | `gpt-6-luna` | high | independent final review |

Concurrency defaults to **1** subagent at a time.

## Supervisor model

The kit does **not** force the parent/supervisor model. Select it in Codex when starting the run.

For users of the third-party `codex-chatgpt-web` bridge, the field-tested setup is:

```text
GPT-5.6 Sol (Web) High  -> supervisor
GPT-6 Luna Medium       -> explorer
GPT-6 Luna High         -> worker
GPT-6 Luna High         -> reviewer
```

Without that bridge, use the strongest supervisor model available to you and keep the subagent roles project-scoped.

See [Model strategy](docs/MODEL_STRATEGY.md) and [Bridge setup](docs/BRIDGE_SETUP.md).

## Start an autonomous Goal

After installing, open a **new Codex chat** in the project so the local config is loaded. Select your supervisor model, then invoke `/goal` using the installed `AUTOPILOT-GOAL.md` as the contract.

A practical instruction is:

```text
/goal Read AUTOPILOT-GOAL.md and autonomously complete the objective I provide below. Respect its agent roles, safety rules, stopping conditions, and verification gates. Do not wait for me between iterations unless truly BLOCKED.

OBJECTIVE:
<describe the project outcome here>
```

For long runs, define concrete pass/fail gates in the Goal instead of asking the agent to “keep improving.”

## Profiles

`--profile` changes only subagent reasoning levels:

| Profile | Explorer | Worker | Reviewer | Recommended for |
|---|---:|---:|---:|---|
| `economy` | medium | medium | high | repetitive or well-scoped work |
| `balanced` | medium | high | high | **default; real project work** |
| `quality` | high | high | high | discovery-heavy difficult repos |

No profile enables `max` automatically.

## Goal presets

- `generic` — general software tasks.
- `frontend-visual` — DISCOVER → EVIDENCE → BUILD → CAPTURE → COMPARE → FIX → VERIFY.
- `backend` — inspect → implement → unit/integration tests → contract checks → review.

## Commands

```text
codex-autopilot install   Install/update the project-scoped stack
codex-autopilot doctor    Validate files, UTF-8, roles, and manifest
codex-autopilot status    Show installed profile/preset/version
codex-autopilot uninstall Remove managed files; optionally restore backup
codex-autopilot print-goal Print a Goal preset to stdout
```

Run help:

```bash
npx --yes github:crunaldo/codex-autopilot-kit --help
```

## Safety model

The installer is intentionally conservative:

- project-local only;
- backups before overwriting managed paths;
- no changes to `~/.codex`;
- no git commit/push;
- no package installation in the target project;
- no hidden network services;
- one subagent concurrently by default;
- reviewer is read-only;
- explorer is read-only.

Read [SAFETY.md](docs/SAFETY.md) before using unattended Goals on valuable repositories.

## Third-party bridge

`codex-chatgpt-web` is optional and not maintained by this project. It can expose ChatGPT Web models inside the native Codex harness and supports MCP/subagents, but it adds a browser automation and account-security dependency. This kit never installs or configures it silently.

See [BRIDGE_SETUP.md](docs/BRIDGE_SETUP.md).

## Field notes

The architecture was validated with repeated autonomous Goals. In one controlled run, a Web supervisor + Luna High worker/reviewer completed a larger CLI evolution in ~8.5 minutes while the observed 5-hour usage meter moved from 66% to 65%. The Goal itself reported ~1.52M tokens, illustrating that Goal token telemetry should **not** be treated as a direct proxy for plan quota consumption.

These observations are anecdotal, environment-specific, and not an OpenAI benchmark. Details: [field notes](docs/field-notes/2026-10.md).

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
