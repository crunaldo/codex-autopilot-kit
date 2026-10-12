# AUTOPILOT GOAL CONTRACT — Frontend / Visual Fidelity

## Objective
Replace this section with the target visual/product outcome and authoritative references.

## Mandatory state machine
```text
DISCOVER -> EVIDENCE -> BUILD -> CAPTURE -> COMPARE -> FIX -> VERIFY -> DONE
                                  ^                    |
                                  |____________________|
```
DONE is impossible until VERIFY passes.

### DISCOVER
Understand routes, components, styling, animation/runtime dependencies, viewports, and constraints.
### EVIDENCE
Confirm authoritative references and acceptance criteria. Never replace evidence because implementation cannot match it.
### BUILD
Implement the smallest coherent change set.
### CAPTURE
Produce required screenshots/renders/tests at declared viewports/states.
### COMPARE
Compare against authoritative evidence and record concrete discrepancies.
### FIX
Correct evidenced discrepancies only.
### VERIFY
Run final build/tests/captures/comparisons and independent reviewer. Only this gate may declare PASS.

## Agent architecture
Supervisor owns planning and PASS/FAIL decisions. `explorer` is narrow read-only discovery; `worker` handles UI implementation/debugging/captures/tests; `reviewer` is the independent read-only final gate. One subagent at a time, no nested/ad-hoc model agents.

## Visual integrity rules
Never modify frozen/golden evidence, loosen thresholds, delete failing visual tests, or substitute references merely to obtain PASS. If a platform limitation prevents fidelity, return BLOCKED/IMPLEMENTATION with evidence. Preserve declared responsive viewports and reproducible captures.

## Acceptance criteria
Required routes/viewports pass; build/typecheck/lint/tests pass as applicable; capture artifacts exist; COMPARE passes against authoritative evidence; frozen evidence is unchanged; `git diff-files --check` passes or equivalent is documented; reviewer finds no blockers; VERIFY passes.

## Recovery policy
If the worker fails twice on the same blocker, the supervisor inspects evidence directly and reformulates. Do not escalate to unconfigured models or add reviewers.

## Safety
Stay inside the workspace. No unrelated projects, global config/secrets changes, network use, commits, pushes, deployments, releases, or `.codex` modification unless explicitly authorized.

## Stop conditions
PASS only after VERIFY. BLOCKED only for genuine missing input/external decision/platform limitation.

## Final report
Include each state-machine gate/status, duration, agent passes, models/reasoning if visible, files changed, commands/tests, capture/compare results, reviewer result, diff stat, workarounds, and confirmation frozen evidence was not changed.
