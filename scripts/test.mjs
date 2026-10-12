import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'bin', 'codex-autopilot.mjs');
function exec(args, cwd=root) { return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' }); }
function run(args, cwd=root) {
  const r = exec(args, cwd);
  if (r.status !== 0) throw new Error(`command failed: ${args.join(' ')}\n${r.stdout}\n${r.stderr}`);
  return r.stdout;
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }
function json(args) { return JSON.parse(run(args)); }
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-autopilot-kit-'));
const initTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-autopilot-init-'));
const dryTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-autopilot-dry-'));
const emptyTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-autopilot-empty-'));
const mergeTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-autopilot-merge-'));
const conflictTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-autopilot-merge-conflict-'));
const runsTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-autopilot-runs-'));
try {
  const presetList = json(['presets','--json']);
  assert(presetList.schemaVersion === 1 && presetList.command === 'presets', 'presets JSON envelope invalid');
  assert(presetList.presets.map(preset=>preset.name).join(',') === 'generic,frontend-visual,backend', 'presets JSON should list all supported presets in stable order');
  assert(presetList.presets.every(preset=>typeof preset.description === 'string' && preset.description.length > 0), 'each preset should have a description');
  const presetText = run(['presets']);
  assert(presetText.includes('generic') && presetText.includes('frontend-visual') && presetText.includes('backend'), 'human presets output should list every preset');
  assert(exec(['presets','--unknown','value']).status !== 0, 'presets should reject unsupported flags');

  fs.writeFileSync(path.join(tmp, '.gitignore'), 'node_modules/\n');
  run(['install','--target',tmp,'--profile','balanced','--preset','frontend-visual']);
  assert(fs.existsSync(path.join(tmp,'.codex','config.toml')), 'config missing');
  assert(fs.existsSync(path.join(tmp,'AUTOPILOT-GOAL.md')), 'goal missing');
  const worker = fs.readFileSync(path.join(tmp,'.codex','agents','worker.toml'),'utf8');
  assert(worker.includes('model_reasoning_effort = "high"'), 'balanced worker must be high');
  const goal = fs.readFileSync(path.join(tmp,'AUTOPILOT-GOAL.md'),'utf8');
  assert(goal.includes('DISCOVER -> EVIDENCE -> BUILD'), 'frontend preset missing state machine');

  const doctorJson = json(['doctor','--target',tmp,'--json']);
  assert(doctorJson.schemaVersion === 1 && doctorJson.command === 'doctor' && doctorJson.pass === true, 'doctor json contract invalid');
  const statusJson = json(['status','--target',tmp,'--json']);
  assert(statusJson.schemaVersion === 1 && statusJson.command === 'status' && statusJson.installed === true, 'status json contract invalid');
  assert(statusJson.manifest.profile === 'balanced', 'status json manifest missing');

  const cleanDiff = run(['diff','--target',tmp]);
  assert(cleanDiff.includes('No managed file changes'), 'clean diff should report no changes');
  const changedDiff = run(['diff','--target',tmp,'--profile','economy','--preset','generic','--concurrency','2']);
  assert(changedDiff.includes('max_concurrent_threads_per_session = 2'), 'diff missing concurrency change');
  assert(changedDiff.includes('AUTOPILOT-GOAL.md'), 'diff missing goal change');
  const diffJson = json(['diff','--target',tmp,'--profile','economy','--preset','generic','--concurrency','2','--json']);
  assert(diffJson.command === 'diff' && diffJson.changed === true, 'diff json contract invalid');
  assert(diffJson.desired.concurrency === 2, 'diff json desired concurrency invalid');

  const backupsBefore = fs.existsSync(path.join(tmp,'.codex-autopilot-backups')) ? fs.readdirSync(path.join(tmp,'.codex-autopilot-backups')).length : 0;
  const idempotent = run(['install','--target',tmp,'--profile','balanced','--preset','frontend-visual']);
  assert(idempotent.includes('configuration already matches'), 'idempotent install should not rewrite');
  const backupsAfter = fs.existsSync(path.join(tmp,'.codex-autopilot-backups')) ? fs.readdirSync(path.join(tmp,'.codex-autopilot-backups')).length : 0;
  assert(backupsAfter === backupsBefore, 'idempotent install must not create a backup');

  run(['install','--target',tmp,'--profile','economy','--preset','generic','--concurrency','2']);
  const worker2 = fs.readFileSync(path.join(tmp,'.codex','agents','worker.toml'),'utf8');
  assert(worker2.includes('model_reasoning_effort = "medium"'), 'economy worker must be medium');
  const backups = path.join(tmp,'.codex-autopilot-backups');
  assert(fs.existsSync(backups) && fs.readdirSync(backups).length >= 1, 'backup not created on update');
  run(['doctor','--target',tmp]);

  const initOut = run(['init','--target',initTmp,'--preset','backend','--profile','quality','--concurrency','2','--yes']);
  assert(initOut.includes('Configuration summary'), 'init summary missing');
  assert(initOut.includes('Concurrency  2'), 'init concurrency summary missing');
  const initConfig = fs.readFileSync(path.join(initTmp,'.codex','config.toml'),'utf8');
  assert(initConfig.includes('max_concurrent_threads_per_session = 2'), 'init did not render concurrency');
  const initManifest = JSON.parse(fs.readFileSync(path.join(initTmp,'.codex','autopilot-kit.json'),'utf8'));
  assert(initManifest.preset === 'backend', 'init preset missing from manifest');
  assert(initManifest.profile === 'quality', 'init profile missing from manifest');
  assert(initManifest.concurrency === 2, 'init concurrency missing from manifest');
  run(['doctor','--target',initTmp]);

  const initDryOut = run(['init','--target',dryTmp,'--preset','generic','--profile','balanced','--concurrency','1','--yes','--dry-run']);
  assert(initDryOut.includes('dry run'), 'init dry-run summary missing');
  assert(!fs.existsSync(path.join(dryTmp,'.codex')), 'init dry-run changed files');
  const installDryOut = run(['install','--target',dryTmp,'--profile','balanced','--preset','generic','--concurrency','1','--dry-run']);
  assert(installDryOut.includes('CREATE'), 'install dry-run must classify creates');
  assert(!fs.existsSync(path.join(dryTmp,'.codex')), 'install dry-run changed files');

  fs.mkdirSync(path.join(mergeTmp,'.codex'),{recursive:true});
  const originalConfig=['# User-owned Codex settings','[project]','name = "demo"','','[agents]','enabled = true','custom_flag = "keep"','','[other]','active = true',''].join('\r\n');
  const mergeConfigPath=path.join(mergeTmp,'.codex','config.toml');
  fs.writeFileSync(mergeConfigPath,originalConfig);
  const mergePreview=run(['install','--target',mergeTmp,'--profile','balanced','--preset','generic','--concurrency','1','--config-strategy','merge','--dry-run']);
  assert(mergePreview.includes('MERGE')&&mergePreview.includes('config.toml'), 'merge dry-run must identify the config merge');
  assert(fs.readFileSync(mergeConfigPath,'utf8')===originalConfig, 'merge dry-run changed the existing config');
  assert(!fs.existsSync(path.join(mergeTmp,'.codex','agents')), 'merge dry-run created role files');
  run(['install','--target',mergeTmp,'--profile','balanced','--preset','generic','--concurrency','1','--config-strategy','merge']);
  let mergedConfig=fs.readFileSync(mergeConfigPath,'utf8');
  for(const text of ['# User-owned Codex settings','name = "demo"','custom_flag = "keep"','active = true','max_concurrent_threads_per_session = 1','[agents.explorer]','[agents.worker]','[agents.reviewer]'])assert(mergedConfig.includes(text),`merge should preserve/add ${text}`);
  assert(mergedConfig.indexOf('[agents]')<mergedConfig.indexOf('[agents.explorer]'), 'parent [agents] table must precede its role tables');
  assert(fs.readdirSync(path.join(mergeTmp,'.codex-autopilot-backups')).length===1, 'merge must back up the existing config before writing');
  run(['doctor','--target',mergeTmp]);
  run(['install','--target',mergeTmp,'--profile','balanced','--preset','generic','--concurrency','1','--config-strategy','merge']);
  assert(fs.readdirSync(path.join(mergeTmp,'.codex-autopilot-backups')).length===1, 'an idempotent merge must not create another backup');

  mergedConfig=mergedConfig.replace('max_concurrent_threads_per_session = 1\r\n','max_concurrent_threads_per_session = 1\r\ncustom_after_install = "preserve"\r\n');
  fs.writeFileSync(mergeConfigPath,mergedConfig);
  run(['install','--target',mergeTmp,'--profile','balanced','--preset','generic','--concurrency','2','--config-strategy','merge']);
  const updatedMergedConfig=fs.readFileSync(mergeConfigPath,'utf8');
  assert(updatedMergedConfig.includes('max_concurrent_threads_per_session = 2'), 'managed merge should update the selected concurrency');
  assert(updatedMergedConfig.includes('custom_after_install = "preserve"'), 'managed merge should preserve later user settings');
  run(['doctor','--target',mergeTmp]);

  fs.mkdirSync(path.join(conflictTmp,'.codex'),{recursive:true});
  const conflictingConfig='[agents]\nenabled = true\nmax_concurrent_threads_per_session = 3\n';
  const conflictConfigPath=path.join(conflictTmp,'.codex','config.toml');
  fs.writeFileSync(conflictConfigPath,conflictingConfig);
  const conflictInstall=exec(['install','--target',conflictTmp,'--profile','balanced','--preset','generic','--concurrency','1','--config-strategy','merge']);
  assert(conflictInstall.status===3&&conflictInstall.stderr.includes('max_concurrent_threads_per_session'), 'merge must stop on a conflicting concurrency value');
  assert(fs.readFileSync(conflictConfigPath,'utf8')===conflictingConfig, 'conflicting merge must preserve the source config');
  assert(!fs.existsSync(path.join(conflictTmp,'.codex','agents'))&&!fs.existsSync(path.join(conflictTmp,'.codex-autopilot-backups')), 'conflicting merge must not write files or backups');
  const conflictDiff=exec(['diff','--target',conflictTmp,'--config-strategy','merge','--json']);
  assert(conflictDiff.status===3, 'JSON diff should return nonzero for an unsafe merge');
  const conflictJson=JSON.parse(conflictDiff.stdout);
  assert(conflictJson.conflicts.some(value=>value.includes('max_concurrent_threads_per_session')), 'JSON diff should expose merge conflicts');
  const dottedConfig='agents.max_concurrent_threads_per_session = 1\n';
  fs.writeFileSync(conflictConfigPath,dottedConfig);
  const dottedInstall=exec(['install','--target',conflictTmp,'--profile','balanced','--preset','generic','--concurrency','1','--config-strategy','merge']);
  assert(dottedInstall.status===3&&dottedInstall.stderr.includes('root-level agents assignment'), 'merge must reject root dotted agents assignments');
  assert(fs.readFileSync(conflictConfigPath,'utf8')===dottedConfig&&!fs.existsSync(path.join(conflictTmp,'.codex','agents')), 'root dotted conflict must not write project files');

  const emptyStatus = exec(['status','--target',emptyTmp,'--json']);
  assert(emptyStatus.status === 2, 'uninstalled status json should exit 2');
  const emptyStatusJson = JSON.parse(emptyStatus.stdout);
  assert(emptyStatusJson.installed === false && emptyStatusJson.command === 'status', 'uninstalled status json invalid');

  const emptyRuns = json(['runs','--target',runsTmp,'--json']);
  assert(emptyRuns.command === 'runs' && emptyRuns.count === 0 && emptyRuns.runs.length === 0, 'empty run list JSON contract invalid');
  const recordJson = json(['record','--target',runsTmp,'--preset','frontend-visual','--profile','balanced','--explorer-calls','1','--worker-calls','3','--reviewer-calls','1','--result','PASS','--tests','PASS','--duration-seconds','510.5','--files-changed','4','--iterations','3','--reviewer-findings','0','--benchmark-mode','codex-autopilot-kit','--case-id','smoke-001','--pair-id','repeat-01','--json']);
  assert(recordJson.command === 'record' && recordJson.receipt.schemaVersion === 1, 'record JSON contract invalid');
  assert(recordJson.receipt.preset === 'frontend-visual' && recordJson.receipt.profile === 'balanced', 'receipt configuration fields missing');
  assert(recordJson.receipt.explorer_calls === 1 && recordJson.receipt.worker_calls === 3 && recordJson.receipt.reviewer_calls === 1, 'receipt role call counts invalid');
  assert(recordJson.receipt.result === 'PASS' && recordJson.receipt.tests === 'PASS' && recordJson.receipt.duration_seconds === 510.5 && recordJson.receipt.files_changed === 4, 'receipt outcome fields invalid');
  assert(recordJson.receipt.iterations === 3 && recordJson.receipt.reviewer_findings === 0 && recordJson.receipt.benchmark_mode === 'codex-autopilot-kit' && recordJson.receipt.case_id === 'smoke-001' && recordJson.receipt.pair_id === 'repeat-01', 'benchmark receipt metadata invalid');
  const receiptDir = path.join(runsTmp,'.autopilot','runs'),receiptFiles = fs.readdirSync(receiptDir);
  assert(receiptFiles.length === 1 && receiptFiles[0].endsWith('.json'), 'record must create one local JSON receipt');
  const savedReceipt = JSON.parse(fs.readFileSync(path.join(receiptDir,receiptFiles[0]),'utf8'));
  assert(savedReceipt.recorded_at === recordJson.receipt.recorded_at && !('goal' in savedReceipt) && !('tokens' in savedReceipt), 'receipt should store a timestamp without goal text or token fields');
  run(['record','--target',runsTmp,'--preset','frontend-visual','--profile','balanced','--result','BLOCKED','--tests','PASS','--duration-seconds','720','--files-changed','5','--iterations','4','--reviewer-findings','0','--benchmark-mode','codex-only','--case-id','smoke-001','--pair-id','repeat-01']);
  run(['record','--target',runsTmp,'--preset','frontend-visual','--profile','balanced','--result','PASS','--benchmark-mode','codex-only','--case-id','smoke-001','--pair-id','repeat-02']);
  run(['record','--target',runsTmp,'--preset','generic','--profile','balanced','--result','PASS','--benchmark-mode','codex-only','--case-id','smoke-001','--pair-id','repeat-03']);
  run(['record','--target',runsTmp,'--preset','frontend-visual','--profile','balanced','--result','PASS','--benchmark-mode','codex-autopilot-kit','--case-id','smoke-001','--pair-id','repeat-03']);
  run(['record','--target',runsTmp,'--preset','frontend-visual','--profile','balanced','--result','PASS','--benchmark-mode','codex-only','--case-id','smoke-001','--pair-id','repeat-04']);
  run(['record','--target',runsTmp,'--preset','frontend-visual','--profile','balanced','--result','PASS','--benchmark-mode','codex-only','--case-id','smoke-001','--pair-id','repeat-04']);
  run(['record','--target',runsTmp,'--preset','frontend-visual','--profile','balanced','--result','PASS','--benchmark-mode','codex-autopilot-kit','--case-id','smoke-001','--pair-id','repeat-04']);
  const listedRuns = json(['runs','--target',runsTmp,'--json']);
  assert(listedRuns.count === 8 && listedRuns.runs.some(receipt=>receipt.worker_calls === 3), 'runs JSON must include saved receipts');
  assert(!JSON.stringify(listedRuns).includes(runsTmp), 'runs JSON must not expose the target path');
  assert(run(['runs','--target',runsTmp]).includes('frontend-visual') && run(['runs','--target',runsTmp]).includes('PASS'), 'human run list must show preset and result');
  const benchmarkJson = json(['benchmarks','--target',runsTmp,'--json']);
  assert(benchmarkJson.paired_cases === 1 && benchmarkJson.run_count === 8 && benchmarkJson.pair_count === 4 && benchmarkJson.complete_pairs === 3 && benchmarkJson.comparable_pairs === 1 && benchmarkJson.incomplete_pairs === 1 && benchmarkJson.ambiguous_pairs === 1 && benchmarkJson.mismatched_pairs === 1, 'benchmark summary must count explicitly paired repetitions');
  assert(benchmarkJson.cases[0].pairs.find(pair=>pair.pair_id==='repeat-01').comparable, 'matching pair IDs and settings should be comparable');
  assert(!benchmarkJson.cases[0].pairs.find(pair=>pair.pair_id==='repeat-02').complete, 'a run without its matching mode must remain incomplete');
  assert(!benchmarkJson.cases[0].pairs.find(pair=>pair.pair_id==='repeat-03').comparable && benchmarkJson.mismatched_cases === 1, 'different preset labels must not be comparable');
  assert(benchmarkJson.cases[0].pairs.find(pair=>pair.pair_id==='repeat-04').ambiguous, 'duplicate receipts for a mode must be marked ambiguous');
  assert(!JSON.stringify(benchmarkJson).includes(runsTmp), 'benchmark JSON must not expose the target path');
  assert(benchmarkJson.modes['codex-autopilot-kit'].mean_duration_seconds === 510.5 && benchmarkJson.modes['codex-only'].mean_duration_seconds === 720, 'benchmark aggregates should report descriptive averages');
  fs.mkdirSync(path.join(runsTmp,'.codex-autopilot-backups'));
  const readinessWithoutIgnore = json(['readiness','--target',runsTmp,'--json']);
  assert(readinessWithoutIgnore.checks.find(check=>check.id==='backups-protected').status==='fail', 'an existing backup directory without an ignore rule must not count as protected');
  const readinessJson = json(['readiness','--target',tmp,'--json']);
  assert(readinessJson.command === 'readiness' && readinessJson.score.max === 100 && readinessJson.checks.length === 10, 'readiness JSON contract invalid');
  assert(readinessJson.checks.find(check=>check.id==='explorer-read-only').status === 'pass', 'readiness should inspect read-only role evidence');
  assert(['pass','fail','unknown'].includes(readinessJson.checks.find(check=>check.id==='git-status').status), 'readiness must distinguish a git status result');
  const invalidRecord = exec(['record','--target',runsTmp,'--preset','generic','--profile','balanced','--result','PASS','--explorer-calls','-1']);
  assert(invalidRecord.status !== 0 && fs.readdirSync(receiptDir).length === 8, 'invalid telemetry must fail before writing a receipt');
  const incompleteBenchmark = exec(['record','--target',runsTmp,'--preset','generic','--profile','balanced','--result','PASS','--benchmark-mode','codex-only','--case-id','bad-001']);
  assert(incompleteBenchmark.status !== 0 && fs.readdirSync(receiptDir).length === 8, 'benchmark receipts must require mode, case ID, and pair ID');

  console.log('PASS: CLI setup, preset listing, merge conflicts, run receipts, JSON runs, dry-run, diff, status/doctor, idempotency, backups, and validation tests.');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.rmSync(initTmp, { recursive: true, force: true });
  fs.rmSync(dryTmp, { recursive: true, force: true });
  fs.rmSync(emptyTmp, { recursive: true, force: true });
  fs.rmSync(mergeTmp, { recursive: true, force: true });
  fs.rmSync(conflictTmp, { recursive: true, force: true });
  fs.rmSync(runsTmp, { recursive: true, force: true });
}
