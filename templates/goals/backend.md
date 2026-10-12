# AUTOPILOT GOAL CONTRACT — Backend / Service

## Objective
Replace this section with the service/API/data outcome and explicit compatibility requirements.

## Agent architecture
Supervisor plans/evaluates. Use only `explorer` for narrow read-only discovery, `worker` for implementation/migrations/tests/debugging, and `reviewer` for final independent read-only review. One subagent at a time; no nested agents; reuse the worker for fixes.

## Required workflow
1. Inspect service boundaries, schemas, persistence, and tests.
2. Define compatibility/migration constraints before editing.
3. Delegate a concrete implementation to worker.
4. Run focused unit tests then relevant integration/contract tests.
5. Verify error handling/backward compatibility.
6. If schema changed, verify migration safety without touching production.
7. Run final checks.
8. Run one reviewer pass; correct real blockers and re-review once if needed.

## Default acceptance gates
Required behavior implemented; API/contract compatibility preserved or documented; validation/error behavior covered; unit/integration tests pass; no secrets/environment changes; migrations deterministic/reviewed; `git diff-files --check` passes or equivalent documented; diff objective-scoped; reviewer PASS.

## Safety
No production access, destructive DB actions, secret rotation, deployment, commit, push, release, global Codex changes, or `.codex` edits unless explicitly authorized. Stay inside workspace.

## Stop conditions
PASS only when all gates are verified. BLOCKED only for a genuine unavailable dependency/input/decision.

## Final report
Report PASS/BLOCKED, duration, agents/passes, models/reasoning if visible, files changed, migrations, commands/tests, reviewer result, diff stat, workaround/unresolved risk.
