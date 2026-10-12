import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TextDecoder } from 'node:util';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'README.md','README.es.md','CHANGELOG.md','ROADMAP.md','LICENSE','SECURITY.md','CONTRIBUTING.md','package.json',
  'bin/codex-autopilot.mjs','install.ps1','install.sh','uninstall.ps1','uninstall.sh',
  'templates/core/.codex/config.toml','templates/core/.codex/agents/explorer.toml','templates/core/.codex/agents/worker.toml','templates/core/.codex/agents/reviewer.toml',
  'templates/goals/generic.md','templates/goals/frontend-visual.md','templates/goals/backend.md',
  'docs/GETTING_STARTED.md','docs/ARCHITECTURE.md','docs/MODEL_STRATEGY.md','docs/SAFETY.md',
  'assets/brand/logo.svg','assets/brand/banner.svg','assets/brand/architecture.svg','assets/brand/demo-flow.svg','assets/diagrams/architecture.svg'
];
const decoder = new TextDecoder('utf-8', { fatal: true });
let failed = false;
for (const rel of required) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) { console.error(`missing: ${rel}`); failed = true; continue; }
  try { decoder.decode(fs.readFileSync(p)); } catch { console.error(`invalid UTF-8: ${rel}`); failed = true; }
}
const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if (!pkg.bin?.['codex-autopilot']) { console.error('package.json missing bin'); failed = true; }
if (pkg.version !== '0.2.0') { console.error(`expected package version 0.2.0, got ${pkg.version}`); failed = true; }
if (Object.keys(pkg.dependencies || {}).length > 0) { console.error('runtime dependencies must remain zero'); failed = true; }
if (failed) process.exit(1);
console.log(`PASS: v${pkg.version}; ${required.length} required files present, valid UTF-8, zero runtime dependencies.`);
