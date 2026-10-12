#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { TextDecoder } from 'node:util';
import { createInterface } from 'node:readline/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const VERSION = PKG.version;
const JSON_SCHEMA_VERSION = 1;

const PROFILES = {
  economy: { explorer: 'medium', worker: 'medium', reviewer: 'high' },
  balanced: { explorer: 'medium', worker: 'high', reviewer: 'high' },
  quality: { explorer: 'high', worker: 'high', reviewer: 'high' },
};
const PRESETS = ['generic', 'frontend-visual', 'backend'];
const CONCURRENCY_CHOICES = [1, 2, 3];
const CONTENT_MANAGED = ['.codex/config.toml','.codex/agents/explorer.toml','.codex/agents/worker.toml','.codex/agents/reviewer.toml','AUTOPILOT-GOAL.md'];
const MANAGED = [...CONTENT_MANAGED,'.codex/autopilot-kit.json'];

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const key = a.slice(2);
    if (['force','dry-run','yes','restore-latest','json'].includes(key)) out[key] = true;
    else out[key] = argv[++i];
  }
  return out;
}
function help(){ console.log(`Codex Autopilot Kit v${VERSION}\n\nUsage:\n  codex-autopilot init [--target .] [--preset generic] [--profile balanced] [--concurrency 1] [--yes] [--dry-run]\n  codex-autopilot install [--target .] [--profile balanced] [--preset generic] [--concurrency 1] [--force] [--dry-run]\n  codex-autopilot diff [--target .] [--profile current] [--preset current] [--concurrency current] [--json]\n  codex-autopilot doctor [--target .] [--json]\n  codex-autopilot status [--target .] [--json]\n  codex-autopilot uninstall [--target .] [--restore-latest] [--dry-run]\n  codex-autopilot print-goal [--preset generic]\n\nProfiles: ${Object.keys(PROFILES).join(', ')}\nPresets:  ${PRESETS.join(', ')}\nConcurrency: ${CONCURRENCY_CHOICES.join(', ')} (1 recommended)\n`); }
function die(message, code=1){ console.error(`ERROR: ${message}`); process.exit(code); }
function info(message){ console.log(`• ${message}`); }
function ok(message){ console.log(`✓ ${message}`); }
function nowStamp(){ return new Date().toISOString().replace(/[:.]/g,'-'); }
function targetPath(args){ return path.resolve(args.target||'.'); }
function ensureDir(p,dry=false){ if(!dry) fs.mkdirSync(p,{recursive:true}); }
function exists(p){ try{fs.accessSync(p);return true;}catch{return false;} }
function read(p){ return fs.readFileSync(p,'utf8'); }
function writeUtf8(p,text,dry=false){ if(dry)return; ensureDir(path.dirname(p)); fs.writeFileSync(p,text,{encoding:'utf8'}); }
function copyFile(src,dst,dry=false){ if(dry)return; ensureDir(path.dirname(dst)); fs.copyFileSync(src,dst); }
function template(rel){ return read(path.join(ROOT,'templates',rel)); }
function manifestPath(target){ return path.join(target,'.codex','autopilot-kit.json'); }
function loadManifest(target){ const p=manifestPath(target); if(!exists(p))return null; try{return JSON.parse(read(p));}catch{return null;} }
function parseConcurrency(value){
  const concurrency = Number(value ?? 1);
  if (!Number.isInteger(concurrency) || !CONCURRENCY_CHOICES.includes(concurrency)) die(`Unknown concurrency '${value}'. Use: ${CONCURRENCY_CHOICES.join(', ')}`);
  return concurrency;
}
function validateInstallOptions(profile,preset,concurrency){
  if(!PROFILES[profile])die(`Unknown profile '${profile}'. Use: ${Object.keys(PROFILES).join(', ')}`);
  if(!PRESETS.includes(preset))die(`Unknown preset '${preset}'. Use: ${PRESETS.join(', ')}`);
  if(!CONCURRENCY_CHOICES.includes(concurrency))die(`Unknown concurrency '${concurrency}'. Use: ${CONCURRENCY_CHOICES.join(', ')}`);
}
function renderTemplate(text,profile,concurrency=1){
  const p=PROFILES[profile];
  return text
    .replaceAll('__EXPLORER_EFFORT__',p.explorer)
    .replaceAll('__WORKER_EFFORT__',p.worker)
    .replaceAll('__REVIEWER_EFFORT__',p.reviewer)
    .replaceAll('__CONCURRENCY__',String(concurrency))
    .replaceAll('__KIT_VERSION__',VERSION);
}
function desiredOutputs(profile,preset,concurrency){
  return new Map([
    ['.codex/config.toml',renderTemplate(template('core/.codex/config.toml'),profile,concurrency)],
    ['.codex/agents/explorer.toml',renderTemplate(template('core/.codex/agents/explorer.toml'),profile,concurrency)],
    ['.codex/agents/worker.toml',renderTemplate(template('core/.codex/agents/worker.toml'),profile,concurrency)],
    ['.codex/agents/reviewer.toml',renderTemplate(template('core/.codex/agents/reviewer.toml'),profile,concurrency)],
    ['AUTOPILOT-GOAL.md',renderTemplate(template(`goals/${preset}.md`),profile,concurrency)],
  ]);
}
function manifestCore(profile,preset,concurrency){
  return {
    schemaVersion:1,
    kit:'codex-autopilot-kit',
    version:VERSION,
    profile,
    preset,
    projectScoped:true,
    concurrency,
    roles:{
      explorer:{model:'gpt-6-luna',reasoning:PROFILES[profile].explorer,readOnly:true},
      worker:{model:'gpt-6-luna',reasoning:PROFILES[profile].worker,readOnly:false},
      reviewer:{model:'gpt-6-luna',reasoning:PROFILES[profile].reviewer,readOnly:true},
    },
  };
}
function manifestEquivalent(current,desiredCore){
  if(!current)return false;
  const normalized={};
  for(const key of Object.keys(desiredCore))normalized[key]=current[key];
  return JSON.stringify(normalized)===JSON.stringify(desiredCore);
}
function buildManifest(profile,preset,concurrency,current=null){
  const timestamp=new Date().toISOString();
  return {...manifestCore(profile,preset,concurrency),installedAt:current?.installedAt||timestamp,updatedAt:timestamp};
}
function gitignoreNeedsUpdate(target){
  const p=path.join(target,'.gitignore'),marker='.codex-autopilot-backups/';
  const text=exists(p)?read(p):'';
  return !text.split(/\r?\n/).includes(marker);
}
function ensureGitignore(target,dry=false){
  if(!gitignoreNeedsUpdate(target))return false;
  const p=path.join(target,'.gitignore'),marker='.codex-autopilot-backups/';
  let text=exists(p)?read(p):'';
  if(text&&!text.endsWith('\n'))text+='\n';
  text+=`\n# Codex Autopilot Kit local backups\n${marker}\n`;
  writeUtf8(p,text,dry);
  return true;
}
function backupManaged(target,dry=false){
  const present=MANAGED.filter(rel=>exists(path.join(target,rel)));
  if(!present.length)return null;
  const backupRoot=path.join(target,'.codex-autopilot-backups',nowStamp());
  if(!dry)ensureDir(backupRoot);
  for(const rel of present) copyFile(path.join(target,rel),path.join(backupRoot,rel),dry);
  if(!dry)writeUtf8(path.join(backupRoot,'backup-manifest.json'),JSON.stringify({createdAt:new Date().toISOString(),files:present},null,2)+'\n');
  return backupRoot;
}
function planInstall(target,profile,preset,concurrency){
  const outputs=desiredOutputs(profile,preset,concurrency);
  const files=[];
  for(const [rel,desired] of outputs){
    const p=path.join(target,rel);
    const current=exists(p)?read(p):null;
    files.push({path:rel,status:current===null?'create':current===desired?'unchanged':'replace',current,desired});
  }
  const currentManifest=loadManifest(target);
  const desiredManifestCore=manifestCore(profile,preset,concurrency);
  const manifestStatus=!exists(manifestPath(target))?'create':manifestEquivalent(currentManifest,desiredManifestCore)?'unchanged':'replace';
  files.push({path:'.codex/autopilot-kit.json',status:manifestStatus,current:currentManifest,desired:desiredManifestCore,manifest:true});
  return {target,profile,preset,concurrency,files,gitignore:gitignoreNeedsUpdate(target)?'update':'unchanged'};
}
function planCounts(plan){
  const counts={create:0,replace:0,unchanged:0};
  for(const file of plan.files)counts[file.status]++;
  return counts;
}
function planHasManagedChanges(plan){return plan.files.some(file=>file.status!=='unchanged');}
function planNeedsBackup(plan){return plan.files.some(file=>file.status==='replace');}
function printPlan(plan,{dryRun=false}={}){
  const counts=planCounts(plan);
  console.log(`Codex Autopilot Kit ${dryRun?'dry run':'plan'} — ${plan.target}`);
  console.log(`Desired: ${plan.profile} / ${plan.preset} / concurrency ${plan.concurrency}`);
  console.log('');
  for(const file of plan.files)console.log(`${file.status.toUpperCase().padEnd(9)} ${file.path}`);
  console.log(`${plan.gitignore.toUpperCase().padEnd(9)} .gitignore`);
  console.log(`\nSummary: ${counts.create} create, ${counts.replace} replace, ${counts.unchanged} unchanged${plan.gitignore==='update'?', .gitignore update':''}.`);
  if(planNeedsBackup(plan))console.log('Backup: existing managed files would be backed up before replacement.');
  console.log('Global config: unchanged (~/.codex is never modified).');
  if(dryRun)console.log('No files were changed.');
}
function resolveDesiredArgs(args,target,{preferCurrent=false}={}){
  const current=loadManifest(target);
  const profile=args.profile||(preferCurrent&&current?.profile)||'balanced';
  const preset=args.preset||(preferCurrent&&current?.preset)||'generic';
  const concurrency=args.concurrency!==undefined?parseConcurrency(args.concurrency):(preferCurrent&&current?.concurrency?parseConcurrency(current.concurrency):1);
  validateInstallOptions(profile,preset,concurrency);
  return {profile,preset,concurrency,current};
}

function install(args){
  const target=targetPath(args);
  const {profile,preset,concurrency,current}=resolveDesiredArgs(args,target);
  const dry=!!args['dry-run'];
  if(!exists(target)||!fs.statSync(target).isDirectory())die(`Target directory does not exist: ${target}`);
  const existingConfig=exists(path.join(target,'.codex','config.toml'));
  if(existingConfig&&!current&&!args.force&&!dry)die('Target already has an unmanaged .codex/config.toml. Re-run with --force to back it up and replace the managed paths, or use diff/--dry-run to inspect first.',3);
  const plan=planInstall(target,profile,preset,concurrency);
  if(dry){printPlan(plan,{dryRun:true});return;}
  if(existingConfig&&!current&&!args.force)die('Target already has an unmanaged .codex/config.toml. Re-run with --force to back it up and replace the managed paths.',3);

  info(`Installing v${VERSION} into ${target}`);
  if(planNeedsBackup(plan)){
    const backup=backupManaged(target,false);
    if(backup)info(`Backup: ${backup}`);
  }
  const outputs=desiredOutputs(profile,preset,concurrency);
  for(const file of plan.files.filter(file=>!file.manifest&&file.status!=='unchanged')){
    writeUtf8(path.join(target,file.path),outputs.get(file.path),false);
    ok(`${file.status==='create'?'created':'updated'} ${file.path}`);
  }
  const manifestFile=plan.files.find(file=>file.manifest);
  if(manifestFile.status!=='unchanged'){
    writeUtf8(manifestPath(target),JSON.stringify(buildManifest(profile,preset,concurrency,current),null,2)+'\n',false);
    ok(`${manifestFile.status==='create'?'created':'updated'} .codex/autopilot-kit.json`);
  }
  if(ensureGitignore(target,false))ok('updated .gitignore');
  if(!planHasManagedChanges(plan)&&plan.gitignore==='unchanged')ok('configuration already matches; no managed files changed');
  console.log(`\nInstalled profile '${profile}' with preset '${preset}' and concurrency ${concurrency}.`);
  console.log('Next: open a NEW Codex chat in this project, select your supervisor model, and use AUTOPILOT-GOAL.md.');
}

async function choose(rl,label,options,defaultValue){
  const defaultIndex=options.findIndex(o=>o.value===defaultValue);
  while(true){
    console.log(`\n${label}`);
    options.forEach((option,index)=>console.log(`  ${index+1}) ${option.label}`));
    const answer=(await rl.question(`Select [${defaultIndex+1}]: `)).trim();
    if(!answer)return defaultValue;
    const numeric=Number(answer);
    if(Number.isInteger(numeric)&&numeric>=1&&numeric<=options.length)return options[numeric-1].value;
    const exact=options.find(option=>String(option.value).toLowerCase()===answer.toLowerCase());
    if(exact)return exact.value;
    console.log('Please choose one of the listed options.');
  }
}
async function confirm(rl,prompt,defaultYes=true){
  const suffix=defaultYes?'[Y/n]':'[y/N]';
  while(true){
    const answer=(await rl.question(`${prompt} ${suffix} `)).trim().toLowerCase();
    if(!answer)return defaultYes;
    if(['y','yes'].includes(answer))return true;
    if(['n','no'].includes(answer))return false;
    console.log('Please answer yes or no.');
  }
}
function printInitSummary({target,preset,profile,concurrency,force,dryRun}){
  const efforts=PROFILES[profile];
  console.log('\nConfiguration summary');
  console.log('────────────────────────────────────────────────────────');
  console.log(`Target       ${target}`);
  console.log(`Preset       ${preset}`);
  console.log(`Profile      ${profile}`);
  console.log(`Concurrency  ${concurrency}${concurrency===1?' (recommended)':''}`);
  console.log(`Explorer     gpt-6-luna / ${efforts.explorer} / read-only`);
  console.log(`Worker       gpt-6-luna / ${efforts.worker}`);
  console.log(`Reviewer     gpt-6-luna / ${efforts.reviewer} / read-only`);
  console.log(`Mode         ${dryRun?'dry-run preview':'install'}`);
  console.log('Global config unchanged');
  console.log(`Existing unmanaged config ${force?'backup + replace':'none detected'}`);
  console.log('────────────────────────────────────────────────────────');
}
async function init(args){
  const target=targetPath(args);
  if(!exists(target)||!fs.statSync(target).isDirectory())die(`Target directory does not exist: ${target}`);
  const selectionsComplete=Boolean(args.preset&&args.profile&&args.concurrency!==undefined);
  const needsInteractive=!selectionsComplete||!args.yes;
  if(needsInteractive&&!process.stdin.isTTY)die('Interactive init requires a terminal. For non-interactive setup, provide --preset, --profile, --concurrency, and --yes.');
  const rl=needsInteractive?createInterface({input:process.stdin,output:process.stdout}):null;
  try{
    console.log(`Codex Autopilot Kit v${VERSION}`);
    console.log('Interactive project setup — no global Codex changes.');
    const preset=args.preset||await choose(rl,'Choose a Goal preset:',[
      {value:'generic',label:'generic          General software work'},
      {value:'frontend-visual',label:'frontend-visual  Visual/frontend evidence workflow'},
      {value:'backend',label:'backend          Backend/API implementation and verification'},
    ],'generic');
    const profile=args.profile||await choose(rl,'Choose an execution profile:',[
      {value:'economy',label:'economy   Explorer medium · Worker medium · Reviewer high'},
      {value:'balanced',label:'balanced  Explorer medium · Worker high · Reviewer high (recommended)'},
      {value:'quality',label:'quality   Explorer high · Worker high · Reviewer high'},
    ],'balanced');
    const concurrency=args.concurrency!==undefined?parseConcurrency(args.concurrency):await choose(rl,'Choose maximum subagent concurrency:',[
      {value:1,label:'1  Sequential and conservative (recommended)'},
      {value:2,label:'2  Moderate parallelism'},
      {value:3,label:'3  Higher parallelism'},
    ],1);
    validateInstallOptions(profile,preset,concurrency);

    const current=loadManifest(target);
    const existingConfig=exists(path.join(target,'.codex','config.toml'));
    let force=!!args.force;
    if(existingConfig&&!current&&!force&&!args['dry-run']){
      console.log('\nAn unmanaged .codex/config.toml already exists.');
      if(!rl)die('An unmanaged .codex/config.toml exists. Re-run with --force only if you intend to back it up and replace managed paths.',3);
      force=await confirm(rl,'Back it up and replace the kit-managed paths?',false);
      if(!force){console.log('Cancelled. No files were changed.');return;}
    }

    printInitSummary({target,preset,profile,concurrency,force,dryRun:!!args['dry-run']});
    if(concurrency>1)console.log('\nNote: concurrency above 1 can increase simultaneous model usage.');
    const approved=args.yes||(rl&&await confirm(rl,args['dry-run']?'Preview this configuration?':'Install this configuration?',true));
    if(!approved){console.log('Cancelled. No files were changed.');return;}
    install({...args,target,profile,preset,concurrency:String(concurrency),force});
  } finally { rl?.close(); }
}

function diffLines(before,after){
  const a=before.split('\n'),b=after.split('\n');
  const dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
  for(let i=a.length-1;i>=0;i--)for(let j=b.length-1;j>=0;j--)dp[i][j]=a[i]===b[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
  const ops=[];
  let i=0,j=0;
  while(i<a.length&&j<b.length){
    if(a[i]===b[j]){ops.push({type:' ',line:a[i]});i++;j++;}
    else if(dp[i+1][j]>=dp[i][j+1]){ops.push({type:'-',line:a[i++]});}
    else{ops.push({type:'+',line:b[j++]});}
  }
  while(i<a.length)ops.push({type:'-',line:a[i++]});
  while(j<b.length)ops.push({type:'+',line:b[j++]});
  return ops;
}
function printFileDiff(file){
  console.log(`\n--- ${file.path} (current)`);
  console.log(`+++ ${file.path} (desired)`);
  if(file.status==='create'){
    for(const line of String(file.desired).split('\n'))console.log(`+${line}`);
    return;
  }
  for(const op of diffLines(String(file.current),String(file.desired)))console.log(`${op.type}${op.line}`);
}
function diffCommand(args){
  const target=targetPath(args);
  if(!exists(target)||!fs.statSync(target).isDirectory())die(`Target directory does not exist: ${target}`);
  const {profile,preset,concurrency}=resolveDesiredArgs(args,target,{preferCurrent:true});
  const plan=planInstall(target,profile,preset,concurrency);
  const counts=planCounts(plan);
  if(args.json){
    console.log(JSON.stringify({schemaVersion:JSON_SCHEMA_VERSION,command:'diff',target,kitVersion:VERSION,desired:{profile,preset,concurrency},changed:planHasManagedChanges(plan)||plan.gitignore==='update',files:plan.files.map(({path,status})=>({path,status})),gitignore:plan.gitignore,summary:counts},null,2));
    return;
  }
  console.log(`Codex Autopilot Kit diff — ${target}`);
  console.log(`Desired: ${profile} / ${preset} / concurrency ${concurrency}`);
  const changed=plan.files.filter(file=>file.status!=='unchanged');
  if(!changed.length&&plan.gitignore==='unchanged'){
    console.log('\nNo managed file changes. The project already matches the desired configuration.');
    return;
  }
  for(const file of changed){
    if(file.manifest){
      console.log(`\n${file.status.toUpperCase()} ${file.path}`);
      console.log(`  version:     ${file.current?.version??'(none)'} -> ${VERSION}`);
      console.log(`  profile:     ${file.current?.profile??'(none)'} -> ${profile}`);
      console.log(`  preset:      ${file.current?.preset??'(none)'} -> ${preset}`);
      console.log(`  concurrency: ${file.current?.concurrency??'(none)'} -> ${concurrency}`);
    } else printFileDiff(file);
  }
  if(plan.gitignore==='update')console.log('\nUPDATE .gitignore\n+ .codex-autopilot-backups/');
  console.log(`\nSummary: ${counts.create} create, ${counts.replace} replace, ${counts.unchanged} unchanged${plan.gitignore==='update'?', .gitignore update':''}.`);
  console.log('No files were changed.');
}

function strictUtf8(p){ const decoder=new TextDecoder('utf-8',{fatal:true}); try{decoder.decode(fs.readFileSync(p));return true;}catch{return false;} }
function doctor(args){
  const target=targetPath(args),results=[];
  const check=(name,pass,detail='')=>results.push({name,pass,detail});
  const required=CONTENT_MANAGED;
  for(const rel of required){const p=path.join(target,rel);check(`exists:${rel}`,exists(p),exists(p)?'':'missing');if(exists(p))check(`utf8:${rel}`,strictUtf8(p),strictUtf8(p)?'':'invalid UTF-8');}
  const manifest=loadManifest(target);
  check('manifest',!!manifest,manifest?`v${manifest.version} ${manifest.profile}/${manifest.preset}`:'missing or invalid');
  const expectedConcurrency=manifest&&CONCURRENCY_CHOICES.includes(Number(manifest.concurrency))?Number(manifest.concurrency):1;
  const configPath=path.join(target,'.codex','config.toml');
  if(exists(configPath)){
    const cfg=read(configPath);
    check(`concurrency=${expectedConcurrency}`,new RegExp(`max_concurrent_threads_per_session\\s*=\\s*${expectedConcurrency}(?:\\s|$)`).test(cfg));
    for(const role of ['explorer','worker','reviewer'])check(`registered:${role}`,cfg.includes(`[agents.${role}]`)&&cfg.includes(`./agents/${role}.toml`));
  }
  for(const role of ['explorer','worker','reviewer']){
    const p=path.join(target,'.codex','agents',`${role}.toml`);
    if(exists(p)){
      const t=read(p);
      check(`model:${role}`,t.includes('model = "gpt-6-luna"'));
      if(role!=='worker')check(`readonly:${role}`,t.includes('sandbox_mode = "read-only"'));
      check(`no-nested-agents:${role}`,/\[agents\][\s\S]*enabled\s*=\s*false/.test(t));
    }
  }
  const pass=results.every(r=>r.pass);
  if(args.json)console.log(JSON.stringify({schemaVersion:JSON_SCHEMA_VERSION,command:'doctor',pass,target,kitVersion:VERSION,results},null,2));
  else{console.log(`Codex Autopilot Kit doctor — ${target}`);for(const r of results)console.log(`${r.pass?'✓':'✗'} ${r.name}${r.detail?` — ${r.detail}`:''}`);console.log(pass?'\nPASS':'\nFAIL');}
  process.exitCode=pass?0:2;
}
function status(args){
  const target=targetPath(args),manifest=loadManifest(target);
  if(!manifest){
    if(args.json){console.log(JSON.stringify({schemaVersion:JSON_SCHEMA_VERSION,command:'status',installed:false,target,kitVersion:VERSION},null,2));process.exitCode=2;return;}
    die('Codex Autopilot Kit is not installed in this target.',2);
  }
  if(args.json)console.log(JSON.stringify({schemaVersion:JSON_SCHEMA_VERSION,command:'status',installed:true,target,kitVersion:VERSION,manifest},null,2));
  else{console.log(`Codex Autopilot Kit v${manifest.version}`);console.log(`Target:      ${target}`);console.log(`Profile:     ${manifest.profile}`);console.log(`Preset:      ${manifest.preset}`);console.log(`Concurrency: ${manifest.concurrency??1}`);console.log(`Installed:   ${manifest.installedAt}`);if(manifest.updatedAt)console.log(`Updated:     ${manifest.updatedAt}`);for(const [role,cfg] of Object.entries(manifest.roles||{}))console.log(`${role}: ${cfg.model} / ${cfg.reasoning}${cfg.readOnly?' / read-only':''}`);}
}
function latestBackup(target){ const root=path.join(target,'.codex-autopilot-backups'); if(!exists(root))return null; return fs.readdirSync(root).map(n=>path.join(root,n)).filter(p=>fs.statSync(p).isDirectory()).sort().reverse()[0]||null; }
function uninstall(args){ const target=targetPath(args),dry=!!args['dry-run'],manifest=loadManifest(target); if(!manifest)die('No managed installation found. Refusing to remove files.',2); const backup=backupManaged(target,dry); if(backup)info(`${dry?'[dry-run] ':''}Safety backup before uninstall: ${backup}`); for(const rel of MANAGED){const p=path.join(target,rel);if(exists(p)){if(!dry)fs.rmSync(p,{force:true});ok(`${dry?'would remove':'removed'} ${rel}`);}} if(args['restore-latest']){const src=latestBackup(target);if(!src)info('No backup found to restore.');else{const m=path.join(src,'backup-manifest.json');if(exists(m)){const bm=JSON.parse(read(m));for(const rel of bm.files||[]){const from=path.join(src,rel),to=path.join(target,rel);if(exists(from)){copyFile(from,to,dry);ok(`${dry?'would restore':'restored'} ${rel}`);}}}}} console.log(dry?'\nDry run only; no files were changed.':'\nUninstall complete.'); }
function printGoal(args){ const preset=args.preset||'generic'; if(!PRESETS.includes(preset))die(`Unknown preset '${preset}'.`); process.stdout.write(template(`goals/${preset}.md`)); }

const args=parseArgs(process.argv.slice(2));
const cmd=args._[0];
if(!cmd||['help','-h','--help'].includes(cmd))help();
else if(cmd==='init')await init(args);
else if(cmd==='install')install(args);
else if(cmd==='diff')diffCommand(args);
else if(cmd==='doctor')doctor(args);
else if(cmd==='status')status(args);
else if(cmd==='uninstall')uninstall(args);
else if(cmd==='print-goal')printGoal(args);
else die(`Unknown command '${cmd}'. Run with --help.`);
