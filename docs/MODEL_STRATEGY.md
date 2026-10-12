# Model strategy

The default `balanced` profile follows one principle:

> Use a strong model to decide; use efficient models to execute bounded work.

| Role | Model | Reasoning | Purpose |
|---|---|---:|---|
| Supervisor | user-selected strong model | high | planning, judgment, recovery, stopping |
| Explorer | GPT-6 Luna | medium | targeted discovery |
| Worker | GPT-6 Luna | high | implementation/debugging |
| Reviewer | GPT-6 Luna | high | independent quality gate |

## Profiles

### economy

```text
explorer medium
worker   medium
reviewer high
```

Best for repetitive, well-specified work.

### balanced

```text
explorer medium
worker   high
reviewer high
```

Recommended default for real projects.

### quality

```text
explorer high
worker   high
reviewer high
```

Useful when discovery itself is difficult.

## Why not Max by default

Higher effort can increase latency/usage, and some Codex Desktop builds have not consistently honored custom subagent reasoning overrides. Use Max only after validating that your client actually runs it and your own evaluations show a gain.

## Web supervisor option

With a compatible bridge, the field-tested split is `GPT-5.6 Sol (Web) High` as supervisor and Luna Medium/High as native Codex subagents. Validate quota behavior on your own account.
