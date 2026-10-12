# Goal playbook

## Goals need finish lines

A robust autonomous Goal defines objective, allowed scope, role architecture, workflow, acceptance gates, retry policy, safety boundaries, PASS/BLOCKED conditions, and a final report.

## Prefer evidence loops

Engineering:

```text
inspect -> implement -> test -> inspect result -> correct -> final test -> review -> PASS
```

Visual work:

```text
DISCOVER -> EVIDENCE -> BUILD -> CAPTURE -> COMPARE -> FIX -> VERIFY
```

Do not allow completion from prose confidence alone.

## Reuse workers

Reuse the same worker for correction where possible. This preserves task-local context without multiplying concurrent histories.

## Reviewer timing

Run reviewer only after implementation is believed complete. If it finds a real blocker, fix it and permit one follow-up review. Avoid review loops when no code changed.

## Long projects

Keep detailed requirements in repository files and make Goal point to them. Versioned files survive compaction and are easier to audit than one giant prompt.

## Telemetry

Goal token counts can include context/cache/replay accounting and should not automatically be interpreted as direct plan quota consumption. Record visible quota meters before and after runs when efficiency matters.
