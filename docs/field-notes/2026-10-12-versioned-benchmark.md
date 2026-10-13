# Versioned benchmark observations — 2026-10-12

20/20 attempts recorded (18 original slots plus 2 supplemental); 10/10 pairs have both outcomes; 9/10 pairs passed both tests and the required workflow. Failures remain in the dataset.

## Protocol

Fixtures came from commit `2cb3ebbfa73d9d45fe3aff512d85bfc20307315d`. Three repetitions per case, fresh Git repositories, matching initial SHA-256 hashes for both modes. Tests, task, package and configuration remain immutable; only the designated source file may change. Independent post-run tests and diffs verify the outcome.

Both modes use Codex CLI 0.162.0-alpha.17.2, Node v25.2.1, supervisor gpt-6.1-sol/high, workspace-write sandbox and a 300-second limit. Kit installs balanced/generic with concurrency 1 and runs Explorer (Luna/medium), Worker (Luna/high), Reviewer (Luna/high), sequentially. Baseline uses no subagents. Kit runs first on odd repetitions; baseline first on even repetitions. Durations include CLI startup, execution and shutdown, excluding fixture preparation and independent post-run checks.

## Recorded outcomes

| Pair | Codex-only | Seconds | Kit | Seconds |
| --- | --- | ---: | --- | ---: |
| blank-number-cli-1 | PASS | 54.295 | PASS | 186.940 |
| blank-number-cli-2 | PASS | 58.660 | PASS | 241.944 |
| blank-number-cli-3 | PASS | 60.991 | BLOCKED | 12.412 |
| blank-number-cli-4 | PASS | 62.141 | PASS | 133.018 |
| csv-row-escaping-1 | PASS | 62.666 | PASS | 129.905 |
| csv-row-escaping-2 | PASS | 40.535 | PASS | 127.637 |
| csv-row-escaping-3 | PASS | 37.262 | PASS | 128.740 |
| slug-normalization-1 | PASS | 51.646 | PASS | 252.572 |
| slug-normalization-2 | PASS | 54.810 | PASS | 287.237 |
| slug-normalization-3 | PASS | 42.361 | PASS | 173.287 |

## Interruptions and limitations

All 19 successful attempts passed the fixed tests, preserved immutable inputs, and changed only the permitted source file. All nine completed Kit flows received a final reviewer PASS. Two slug runs resumed their existing Worker and Reviewer after an initial review finding, so they have five completed close events for three unique agents. Codex-only was faster in each of the nine successful pairs; this does not isolate the effect of orchestration from the extra model and review work.

- blank-number-cli-3, codex-autopilot-kit: Codex usage limit reached. Tests: FAIL; turn completed: false.

The quota-blocked slot was preserved when usage became available again; remaining unstarted slots resumed. Earlier launch-configuration errors occurred before model execution and are separate preflight failures, outside these 18 planned slots.

These small synthetic local tasks do not establish general performance, quality, cost or token savings. The treatment changes both model composition and review work. Do not mix interrupted durations with successful completion times. An attempted pair is not automatically a successful workflow pair. The supplemental fourth parsing pair was specified after the quota failure and before its execution; it remains labeled separately rather than replacing the original third pair. This adaptive extension limits statistical interpretation.

[Machine-readable evidence](2026-10-12-versioned-benchmark.json) contains environment, outcomes, integrity hashes, changed paths and delegation counts. Full raw logs remain local and are not published.
