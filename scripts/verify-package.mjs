import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TextDecoder } from 'node:util';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'README.md','README.es.md','CHANGELOG.md','ROADMAP.md','LICENSE','SECURITY.md','CONTRIBUTING.md','INSTALL_FOR_AGENTS.md','llms.txt','package.json',
  'bin/codex-autopilot.mjs','install.ps1','install.sh','uninstall.ps1','uninstall.sh',
  'templates/core/.codex/config.toml','templates/core/.codex/agents/explorer.toml','templates/core/.codex/agents/worker.toml','templates/core/.codex/agents/reviewer.toml',
  'templates/goals/generic.md','templates/goals/frontend-visual.md','templates/goals/backend.md',
  'docs/GETTING_STARTED.md','docs/ARCHITECTURE.md','docs/MODEL_STRATEGY.md','docs/SAFETY.md','docs/DISTRIBUTION.md',
  '.github/workflows/ci.yml','.github/workflows/release.yml','.github/workflows/pages.yml',
  'assets/brand/logo.svg','assets/brand/banner.svg','assets/brand/architecture.svg','assets/brand/demo-flow.svg','assets/diagrams/architecture.svg',
  'configurator/index.html','configurator/styles.css','configurator/app.js','configurator/assets/logo.svg'
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
if (!/^\d+\.\d+\.\d+$/.test(pkg.version)) { console.error(`package version must be semver, got ${pkg.version}`); failed = true; }
if (Object.keys(pkg.dependencies || {}).length > 0) { console.error('runtime dependencies must remain zero'); failed = true; }
if (pkg.publishConfig?.access !== 'public') { console.error('npm publishConfig.access must be public'); failed = true; }
if (pkg.publishConfig?.provenance !== true) { console.error('npm provenance must remain enabled'); failed = true; }
for (const rel of ['README.md','README.es.md','INSTALL_FOR_AGENTS.md','llms.txt','CHANGELOG.md']) {
  if (!(pkg.files || []).includes(rel)) { console.error(`npm package files missing ${rel}`); failed = true; }
}
const configurator = fs.readFileSync(path.join(root,'configurator/index.html'),'utf8');
for (const marker of ['preset','profile','concurrency','copyPreview','copyInstall','langToggle']) {
  if (!configurator.includes(marker)) { console.error(`configurator missing marker: ${marker}`); failed = true; }
}
const appSource = fs.readFileSync(path.join(root,'configurator/app.js'),'utf8');
try { new Function(appSource); } catch (error) { console.error(`configurator/app.js syntax error: ${error.message}`); failed = true; }
const pagesWorkflow = fs.readFileSync(path.join(root,'.github/workflows/pages.yml'),'utf8');
if (!pagesWorkflow.includes('enablement: true')) { console.error('Pages workflow must enable the Pages site when absent'); failed = true; }
const releaseWorkflow = fs.readFileSync(path.join(root,'.github/workflows/release.yml'),'utf8');
if (!releaseWorkflow.includes('npm stage publish --provenance --access public')) { console.error('release workflow must use npm staged publishing'); failed = true; }
if (!releaseWorkflow.includes('NPM_STAGE_TOKEN')) { console.error('release workflow must use the dedicated NPM_STAGE_TOKEN secret'); failed = true; }
if (releaseWorkflow.split(/\r?\n/).some(line => /^\s*(run:\s*)?npm publish(?:\s|$)/.test(line))) { console.error('direct npm publish is forbidden in release workflow'); failed = true; }
if (releaseWorkflow.includes('npm stage approve')) {
  const executableApproval = releaseWorkflow.split(/\r?\n/).some(line => /^\s*(run:\s*)?npm stage approve(?:\s|$)/.test(line));
  if (executableApproval) { console.error('automated npm stage approval is forbidden'); failed = true; }
}
if (failed) process.exit(1);
console.log(`PASS: v${pkg.version}; ${required.length} required files present, valid UTF-8, zero runtime dependencies, staged npm distribution policy and configurator surface valid.`);
