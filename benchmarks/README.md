# Reproducible benchmark suite

This suite contains three small, deterministic code tasks with fixed starter files and independent Node.js tests:

- `cases/blank-number-cli/` — reject blank, fractional, and unsafe count values.
- `cases/csv-row-escaping/` — correctly quote CSV cells with delimiters and line breaks.
- `cases/slug-normalization/` — normalize input into stable ASCII slugs.

Each task folder is its own project. For every repetition, make a fresh copy of the same case folder, run its tests once to confirm the starter failure, then let the selected mode solve the task. Use the same task instructions, starting files, model settings, tools, time limit, and independent test command in both modes. Reset to a fresh copy for the paired run. Do not edit `TASK.md` or the tests during a run. Record one receipt per mode using the same case ID and pair ID, then use `codex-autopilot benchmarks --target <case-project> --json` to inspect pairing. The starter test failures are intentional; they are not failures of the benchmark suite.

The case IDs are `blank-number-cli`, `csv-row-escaping`, and `slug-normalization`. Record the benchmark-suite commit hash, Node.js version, Codex build, model/reasoning, and any environment details alongside the results. See [the protocol](../docs/BENCHMARKS.md) for repetitions, evaluation, and interpretation limits.
