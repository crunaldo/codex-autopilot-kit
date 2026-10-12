import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'bin', 'codex-autopilot.mjs');
function run(args, cwd=root) {
  const r = spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`command failed: ${args.join(' ')}\n${r.stdout}\n${r.stderr}`);
  return r.stdout;
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-autopilot-kit-'));
try {
  fs.writeFileSync(path.join(tmp, '.gitignore'), 'node_modules/\n');
  run(['install','--target',tmp,'--profile','balanced','--preset','frontend-visual']);
  assert(fs.existsSync(path.join(tmp,'.codex','config.toml')), 'config missing');
  assert(fs.existsSync(path.join(tmp,'AUTOPILOT-GOAL.md')), 'goal missing');
  const worker = fs.readFileSync(path.join(tmp,'.codex','agents','worker.toml'),'utf8');
  assert(worker.includes('model_reasoning_effort = "high"'), 'balanced worker must be high');
  const goal = fs.readFileSync(path.join(tmp,'AUTOPILOT-GOAL.md'),'utf8');
  assert(goal.includes('DISCOVER -> EVIDENCE -> BUILD'), 'frontend preset missing state machine');
  run(['doctor','--target',tmp]);
  run(['install','--target',tmp,'--profile','economy','--preset','generic']);
  const worker2 = fs.readFileSync(path.join(tmp,'.codex','agents','worker.toml'),'utf8');
  assert(worker2.includes('model_reasoning_effort = "medium"'), 'economy worker must be medium');
  const backups = path.join(tmp,'.codex-autopilot-backups');
  assert(fs.existsSync(backups) && fs.readdirSync(backups).length >= 1, 'backup not created on update');
  console.log('PASS: install, update, profile replacement, backup, preset, and doctor tests.');
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
