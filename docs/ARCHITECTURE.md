# Architecture

Codex Autopilot Kit uses a deliberately small multi-agent topology:

```text
                  SUPERVISOR
           planning / evaluation
                    /  |  \
                   /   |   \
                  v    v    v
            explorer worker reviewer
            read-only  write read-only
             medium    high   high
                  \     |     /
                   \    |    /
                    v   v   v
                   project
```

The supervisor spends its reasoning budget deciding what needs to happen and whether evidence is sufficient. Workers receive bounded implementation tasks. Reviewers stay independent and read-only so they cannot silently fix what they are reviewing.

## Why concurrency = 1

One active subagent at a time provides predictable quota consumption, simpler Git state, fewer conflicting edits, easier debugging, and clearer attribution when a test fails.

## Why no automatic Max agent

In field testing, a custom role configured for Luna Max was displayed/executed as Luna Medium in Codex Desktop. The kit therefore avoids shipping a misleading automatic Max escalation path.

Fallback policy:

1. worker High attempt;
2. same worker High correction with new evidence;
3. supervisor analyzes the blocker and reformulates the task.

## Installed scope

```text
.codex/
  config.toml
  autopilot-kit.json
  agents/
    explorer.toml
    worker.toml
    reviewer.toml
AUTOPILOT-GOAL.md
```

The installer never edits `~/.codex`.
