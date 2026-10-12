# Benchmark protocol

The receipts and summaries support reproducible local comparisons; they do not claim that the kit makes every task faster or better.

The repository includes three fixed starter projects and test suites in [`benchmarks/`](../benchmarks/README.md): strict count parsing, CSV row escaping, and ASCII slug normalization. Their starter tests are intentionally red. Run them from fresh copies and keep the case files and tests unchanged during both modes.

## Define each case

Give every task a stable case ID, such as bug-fix-001. Keep the full task instructions and evaluation rubric in a separate case document. Record the starting repository commit, Codex build, model and reasoning settings, allowed tools, test command, and required network or sandbox conditions.

## Run a paired comparison

For each case, run the same task from a clean copy of the same starting commit in both modes. Reset the copy between runs. Keep the Codex model, reasoning level, tools, timeout, and evaluation rubric constant; use the same preset/profile labels when recording both modes. Give each repetition a unique pair ID and use that same ID for its two mode receipts. Alternate which mode runs first to reduce order effects. Aim for at least three paired repetitions before discussing a pattern.

After each run, record observed values explicitly:

~~~bash
npx --yes codex-autopilot-kit record --target . --preset frontend-visual --profile balanced \
  --benchmark-mode codex-only --case-id bug-fix-001 --pair-id repeat-01 \
  --result PASS --tests PASS --duration-seconds 480 --files-changed 3 --iterations 4

npx --yes codex-autopilot-kit record --target . --preset frontend-visual --profile balanced \
  --benchmark-mode codex-autopilot-kit --case-id bug-fix-001 --pair-id repeat-01 \
  --explorer-calls 1 --worker-calls 2 --reviewer-calls 1 \
  --result PASS --tests PASS --duration-seconds 420 --files-changed 4 --iterations 3 --reviewer-findings 1

npx --yes codex-autopilot-kit benchmarks --target . --json
~~~

Use the same independent tests and defect-confirmation rubric in both modes. Count reviewer findings only when the same rubric confirms them; a raw unverified warning is not a defect. Record BLOCKED outcomes and failed tests instead of excluding those runs.

The local summary matches receipts by case ID and pair ID. A pair is comparable only when there is exactly one receipt per mode and preset/profile labels match; missing, duplicate, or mismatched receipts remain visible as incomplete, ambiguous, or non-comparable. It reports descriptive counts and means; it does not calculate significance or establish causality. Do not claim token savings from these fields.

## Field-test status

The protocol and CLI are available, but no Codex-only versus kit field runs are included with this release candidate. Publish no benchmark result until paired receipts, starting commits, environment details, and the evaluation rubric can be reviewed.
