# AUTOPILOT GOAL CONTRACT — Generic

> Installed by Codex Autopilot Kit. Customize the **Objective** and **Acceptance criteria** before launching `/goal`.

## Objective
Replace this section with the concrete outcome. Describe what must be true when finished.

## Agent architecture
You are the **SUPERVISOR**. You own planning, prioritization, evaluation, recovery, and the final PASS/BLOCKED decision.
Use only the project-configured roles: `explorer` for narrow read-only discovery, `worker` for implementation/debugging/validation, and `reviewer` for independent final review.

Rules: one subagent active at a time; no model-specific ad-hoc agents; no nested subagents; reuse the same worker for corrections; reviewer only after implementation/tests are green; stop immediately after verified PASS.

## Acceptance criteria
- requested behavior is implemented;
- relevant existing behavior still works;
- focused and full relevant tests pass;
- docs are updated for user-facing changes;
- `git diff-files --check` passes or a documented equivalent is used;
- final diff is objective-scoped;
- reviewer returns PASS.

## Workflow
1. Inspect initial state briefly.
2. Use `explorer` only for narrow missing evidence.
3. Give one clear task to `worker`.
4. Inspect and validate the result.
5. Diagnose failures before giving the same worker a concrete correction.
6. After two failures on the same blocker, supervisor reasons directly and reformulates; do not escalate to unconfigured models.
7. Run one independent reviewer pass after tests are green.
8. Fix real reviewer blockers, revalidate, and allow one follow-up review.
9. Mark complete immediately after all gates pass.

## Safety
Stay inside this repository. No unrelated projects, network/services unless required, global Codex changes, `.codex` modification during the Goal, credentials/secrets changes, commits, pushes, releases, deployments, or weakened tests unless explicitly authorized.

## Stop conditions
PASS only when all criteria are verified. BLOCKED only for a genuine unavailable input, credential, external dependency, or human decision. Do not stop just because a turn ended.

## Final report
Report PASS/BLOCKED, duration, Goal token telemetry if available, subagents/pass counts, model/reasoning shown, files changed, commands/tests, reviewer result, diff stat, workarounds, and workspace/commit confirmations.
