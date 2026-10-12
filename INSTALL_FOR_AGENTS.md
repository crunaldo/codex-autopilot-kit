# Install Codex Autopilot Kit as an agent

This file is a deterministic installation contract for coding agents, automation runners, and CI systems.

## Objective

Install or update Codex Autopilot Kit inside the current repository without modifying global Codex configuration, unrelated project files, credentials, git history, or remote state.

## Preconditions

- Node.js 20+ is available.
- The working directory is the intended target repository.
- The repository may already contain `.codex/` files; treat unmanaged configuration conservatively.
- Do not assume permission to overwrite unmanaged `.codex/config.toml`.

## Default configuration

Use these defaults unless the user or repository context explicitly requires another supported option:

```text
preset       generic
profile      balanced
concurrency  1
```

Supported presets: `generic`, `frontend-visual`, `backend`.

Supported profiles: `economy`, `balanced`, `quality`.

Supported concurrency: `1`, `2`, `3`. Prefer `1` unless the user explicitly wants parallel subagents.

## Required sequence

### 1. Preview

Run a no-write preview first:

```bash
npx --yes github:crunaldo/codex-autopilot-kit init \
  --target . \
  --preset generic \
  --profile balanced \
  --concurrency 1 \
  --yes \
  --dry-run
```

The command must not change project files.

### 2. Inspect the desired diff

```bash
npx --yes github:crunaldo/codex-autopilot-kit diff \
  --target . \
  --preset generic \
  --profile balanced \
  --concurrency 1 \
  --json
```

Check `changed`, each managed file status, and the `.gitignore` status.

### 3. Handle unmanaged `.codex/config.toml`

If an unmanaged `.codex/config.toml` exists, do **not** add `--force` automatically.

Only use `--force` after explicit authorization to back up and replace kit-managed paths.

### 4. Install

```bash
npx --yes github:crunaldo/codex-autopilot-kit init \
  --target . \
  --preset generic \
  --profile balanced \
  --concurrency 1 \
  --yes
```

### 5. Verify

```bash
npx --yes github:crunaldo/codex-autopilot-kit doctor --target . --json
```

Require `pass: true` before reporting success.

Then inspect status:

```bash
npx --yes github:crunaldo/codex-autopilot-kit status --target . --json
```

Confirm the expected preset, profile, concurrency, version, and roles.

## Files the kit may manage

```text
.codex/config.toml
.codex/agents/explorer.toml
.codex/agents/worker.toml
.codex/agents/reviewer.toml
.codex/autopilot-kit.json
AUTOPILOT-GOAL.md
.gitignore               # only the local backup ignore entry
```

Backups may be created under:

```text
.codex-autopilot-backups/
```

## Forbidden side effects

During installation, do not:

- modify `~/.codex` or other global Codex settings;
- install dependencies into the target project;
- add a separate orchestration runtime;
- modify credentials or secrets;
- commit, push, tag, release, deploy, or create remote infrastructure;
- delete tests or weaken validation;
- modify files unrelated to the kit installation;
- silently use `--force`.

## Role invariants

After installation:

- `explorer` uses GPT-6 Luna and is read-only;
- `worker` uses GPT-6 Luna and may modify the project when delegated by the supervisor;
- `reviewer` uses GPT-6 Luna and is read-only;
- nested agents are disabled in each subagent configuration;
- the parent/supervisor model is not forced by the kit;
- configured concurrency matches the selected value.

## Idempotency

Re-running the same desired configuration should not rewrite matching managed files or create unnecessary backups.

Use `diff --json` before repeat installs when you need an explicit proof that the target already matches.

## After installation

A human should open a **new Codex chat** in the target repository so the project-local agent configuration reloads.

The autonomous run contract is `AUTOPILOT-GOAL.md`. A typical start is:

```text
/goal Read AUTOPILOT-GOAL.md and autonomously complete the objective below. Respect its roles, safety rules, verification gates, and PASS/BLOCKED contract. Do not wait for me between iterations unless genuinely BLOCKED.

OBJECTIVE:
<concrete outcome>
```

## Completion report

Report only after verification. Include:

- installed kit version;
- preset;
- profile;
- concurrency;
- `doctor` PASS/FAIL;
- whether managed files changed;
- backup path if one was created;
- confirmation that global Codex configuration, credentials, git history, and remotes were not modified.
