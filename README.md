<p align="center">
  <img src="assets/brand/banner.svg" alt="Codex Autopilot Kit" width="100%" />
</p>

# Codex Autopilot Kit

**A safe, project-scoped multi-agent autopilot for Codex.**

Codex Autopilot Kit installs a tested `.codex/` agent stack plus reusable Goal templates into any repository. It is designed for long-running coding work where a strong supervisor plans and evaluates while cheaper scoped workers execute, test, and review.

> Default strategy: **Supervisor (you choose) → Luna Medium explorer → Luna High worker → Luna High reviewer**, one subagent at a time.

[![CI](https://img.shields.io/github/actions/workflow/status/crunaldo/codex-autopilot-kit/ci.yml?branch=main&label=CI)](../../actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Project scoped](https://img.shields.io/badge/config-project--scoped-success)](docs/SAFETY.md)
[![No runtime dependencies](https://img.shields.io/badge/runtime_dependencies-0-success)](package.json)

## Why this exists

Long autonomous Codex runs can become expensive or unpredictable when every delegated task uses the strongest available model. This kit separates responsibilities:

- **Supervisor:** reasoning, planning, evaluation, stopping decisions.
- **Explorer:** narrow read-only discovery.
- **Worker:** implementation, debugging, and validation.
- **Reviewer:** independent final review.

The included configuration deliberately avoids an automatic “Max” escalation role because Codex Desktop may not always honor subagent reasoning overrides consistently. Escalation is handled by the supervisor instead.

## Install in a project

### Recommended: invoke this repository with `npx`

From the target project root:

```bash
npx --yes github:crunaldo/codex-autopilot-kit install --target . --profile balanced --preset generic
```

For visual/frontend cloning work:

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

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
