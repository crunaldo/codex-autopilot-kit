# Local run receipts

Codex Autopilot Kit does not control or observe a Codex session. After a Goal, the operator can explicitly record a small summary:

~~~bash
npx --yes codex-autopilot-kit record --target . --preset frontend-visual --profile balanced \
  --explorer-calls 1 --worker-calls 3 --reviewer-calls 1 \
  --result PASS --tests PASS --duration-seconds 510 --files-changed 4 \
  --iterations 5 --reviewer-findings 1
npx --yes codex-autopilot-kit runs --target . --json
~~~

The record command writes one timestamped JSON file to <code>.autopilot/runs/</code>. Repeated records are preserved; the command never overwrites a prior receipt.

## Receipt fields

Every receipt contains schema version, kit version, recording timestamp, selected preset/profile, overall result, and test result. Manually observed Explorer/Worker/Reviewer call counts and optional numeric fields for duration, files changed, iteration count, and independently confirmed reviewer findings are included when supplied; omitted values stay unavailable rather than being inferred as zero.

Overall result is one of PASS, FIX, or BLOCKED. Test result is PASS, FAIL, or NOT_RUN; omitted tests default to NOT_RUN. Counts are non-negative integers. Receipts are manual records and are not inferred from Codex logs.

Benchmark receipts may also include a benchmark mode, case ID, and pair ID. The two modes are codex-only and codex-autopilot-kit. Reuse one pair ID for the two runs in a repetition, and choose a new pair ID for the next repetition. Case and pair IDs are short labels that refer to separately documented work; do not put prompts, customer data, or source text in them. Ordinary receipts may omit role counts; omitted fields mean unrecorded, not zero.

## Privacy and retention

Receipts do not contain Goal text, prompts, model token counts, cost, file paths, Git diffs, or conversation logs. Nothing is uploaded. The command does not add the receipt directory to Git ignore rules; each project owner decides whether receipts are useful to version or should remain local. Remove sensitive local receipts using ordinary project file management.

The readiness command is a separate read-only checklist. Its JSON envelope includes ten observable checks with pass/fail/unknown status and points. Unknown Git state receives zero points and remains visibly unknown.

See [BENCHMARKS.md](BENCHMARKS.md) for paired comparisons and the limitations of the summary.

