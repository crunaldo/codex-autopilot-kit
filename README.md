<p align="center">
  <img src="assets/brand/banner.svg" alt="Codex Autopilot Kit" width="100%" />
</p>

<p align="center"><strong>English</strong> · <a href="README.es.md">Español</a></p>

# Codex Autopilot Kit

<p align="center">
  <strong>Keep Codex. Add Autopilot.</strong><br />
  Turn an existing Codex project into a safe, project-scoped multi-agent workflow.
</p>

<p align="center">
  <a href="../../actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/crunaldo/codex-autopilot-kit/ci.yml?branch=main&label=CI" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/codex-autopilot-kit"><img src="https://img.shields.io/npm/v/codex-autopilot-kit" alt="npm" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="package.json"><img src="https://img.shields.io/badge/runtime_dependencies-0-success" alt="Zero runtime dependencies" /></a>
</p>

Codex Autopilot Kit installs a tested `.codex/` agent stack plus reusable Goal templates into an existing repository. A supervisor plans and evaluates while scoped subagents explore, implement, test, and independently review.

It is deliberately **not another coding agent, IDE, cloud platform, or orchestration runtime**. It is a lightweight autopilot layer for people who already use Codex and want more autonomy without replacing their workflow.

> Default strategy: **Supervisor (you choose) → Luna Medium explorer → Luna High worker → Luna High reviewer**, concurrency 1 by default.

## Visual Configurator

Configure the stack without memorizing flags:

**https://crunaldo.github.io/codex-autopilot-kit/**

Choose a Goal preset, execution profile, and maximum subagent concurrency. The configurator shows the resulting roles, reasoning levels, relative model usage, managed files, and exact preview/install commands. Its URL preserves the configuration for sharing.

The configurator is static and client-side. It does not receive repository contents or credentials.

## Quick start

From the target project root:

```bash
npx --yes codex-autopilot-kit init --target .
```

Or preview a fully specified configuration before writing anything:

```bash
npx --yes codex-autopilot-kit init \
  --target . \
  --preset generic \
  --profile balanced \
  --concurrency 1 \
  --yes \
  --dry-run
```

Then install:

```bash
npx --yes codex-autopilot-kit init \
  --target . \
  --preset generic \
  --profile balanced \
  --concurrency 1 \
  --yes
```

GitHub remains the canonical source and can be used directly as a fallback:

```bash
npx --yes github:crunaldo/codex-autopilot-kit init --target .
```

## What it installs

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

Managed conflicts are backed up before replacement. A matching reinstall is idempotent and creates no unnecessary backups.

## Inspect before installing

Dry run:

```bash
npx --yes codex-autopilot-kit install \
  --target . \
  --profile balanced \
  --preset generic \
  --concurrency 1 \
  --dry-run
```

Exact diff:

```bash
npx --yes codex-autopilot-kit diff --target .
```

Machine-readable diff:

```bash
npx --yes codex-autopilot-kit diff --target . --json
```

The preview classifies managed paths as `CREATE`, `REPLACE`, or `UNCHANGED`, and reports `.gitignore` updates separately. `--dry-run` and `diff` do not write files.

## Verify

```bash
npx --yes codex-autopilot-kit doctor --target .
```

For CI and agents:

```bash
npx --yes codex-autopilot-kit doctor --target . --json
npx --yes codex-autopilot-kit status --target . --json
```

Doctor validates required files, strict UTF-8, role registration, expected models, read-only Explorer/Reviewer, disabled nested agents, concurrency, and the local manifest.

## Architecture

<p align="center">
  <img src="assets/brand/architecture.svg" alt="Codex Autopilot Kit architecture" width="100%" />
</p>

- **Supervisor** — planning, delegation, evaluation, escalation, and stopping decisions.
- **Explorer** — targeted read-only discovery.
- **Worker** — implementation, debugging, testing, and validation.
- **Reviewer** — independent read-only final review.

The supervisor model is selected by the user; the kit configures the project-local subagent roles.

## Profiles

| Profile | Explorer | Worker | Reviewer | Recommended for |
|---|---:|---:|---:|---|
| `economy` | medium | medium | high | repetitive or well-scoped work |
| `balanced` | medium | high | high | **default; real project work** |
| `quality` | high | high | high | difficult, discovery-heavy repositories |

No profile enables maximum reasoning automatically.

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

## Start an autonomous Goal

After install/update, open a **new Codex chat** so project-local configuration reloads. Select the supervisor model and use the installed `AUTOPILOT-GOAL.md` contract:

```text
/goal Read AUTOPILOT-GOAL.md and autonomously complete the objective below. Respect its roles, safety rules, verification gates, and PASS/BLOCKED contract. Do not wait for me between iterations unless genuinely BLOCKED.

OBJECTIVE:
<your concrete objective>
```

## Safety model

The kit is intentionally conservative:

- project-local only;
- never modifies `~/.codex`;
- backups before managed replacement;
- no git commit/push;
- no package installation in the target project;
- no hidden services;
- concurrency 1 by default;
- Explorer and Reviewer are read-only;
- `--dry-run` and `diff` are inspection-only.

Read [SAFETY.md](docs/SAFETY.md) before unattended Goals on valuable repositories.

## Documentation

- [Visual Configurator](https://crunaldo.github.io/codex-autopilot-kit/)
- [Getting started](docs/GETTING_STARTED.md)
- [Install for coding agents](INSTALL_FOR_AGENTS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Model strategy](docs/MODEL_STRATEGY.md)
- [Goal playbook](docs/GOAL_PLAYBOOK.md)
- [Safety](docs/SAFETY.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Distribution](docs/DISTRIBUTION.md)
- [Roadmap](ROADMAP.md)

## Project status

The v0.4.0 release focuses on the Visual Configurator and npm-first setup; see [CHANGELOG.md](CHANGELOG.md) and [ROADMAP.md](ROADMAP.md) for the release details.

Codex Autopilot Kit is a community project and is not affiliated with or endorsed by OpenAI. Product names and trademarks belong to their respective owners.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
