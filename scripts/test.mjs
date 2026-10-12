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
try {
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

  const emptyStatus = exec(['status','--target',emptyTmp,'--json']);
  assert(emptyStatus.status === 2, 'uninstalled status json should exit 2');
  const emptyStatusJson = JSON.parse(emptyStatus.stdout);
  assert(emptyStatusJson.installed === false && emptyStatusJson.command === 'status', 'uninstalled status json invalid');

  console.log('PASS: v0.2 init, dry-run, diff, JSON status/doctor, idempotency, concurrency, backups, presets, and doctor tests.');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.rmSync(initTmp, { recursive: true, force: true });
  fs.rmSync(dryTmp, { recursive: true, force: true });
  fs.rmSync(emptyTmp, { recursive: true, force: true });
}
