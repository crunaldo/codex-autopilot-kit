#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
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
const CONFIG_STRATEGIES = ['merge','replace'];
const AGENT_ROLES = ['explorer','worker','reviewer'];
const RUN_RESULTS = ['PASS','FIX','BLOCKED'];
const TEST_RESULTS = ['PASS','FAIL','NOT_RUN'];
const BENCHMARK_MODES = ['codex-only','codex-autopilot-kit'];
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
function help(){ console.log(`Codex Autopilot Kit v${VERSION}\n\nUsage:\n  codex-autopilot init [--target .] [--preset generic] [--profile balanced] [--concurrency 1] [--config-strategy merge|replace] [--yes] [--dry-run]\n  codex-autopilot install [--target .] [--profile balanced] [--preset generic] [--concurrency 1] [--config-strategy merge|replace] [--force] [--dry-run]\n  codex-autopilot diff [--target .] [--profile current] [--preset current] [--concurrency current] [--config-strategy merge|replace] [--json]\n  codex-autopilot doctor [--target .] [--json]\n  codex-autopilot status [--target .] [--json]\n  codex-autopilot uninstall [--target .] [--restore-latest] [--dry-run]\n  codex-autopilot print-goal [--preset generic]\n\nProfiles: ${Object.keys(PROFILES).join(', ')}\nPresets:  ${PRESETS.join(', ')}\nConcurrency: ${CONCURRENCY_CHOICES.join(', ')} (1 recommended)\n\nConfig strategies:\n  merge    Preserve unrelated TOML settings; add kit settings only when safe.\n  replace  Back up and replace the managed config (same behavior as --force).\n`); }
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
function splitTomlComment(line){
  let quote=null;
  for(let i=0;i<line.length;i++){
    if(quote){
      if(quote==='"""'&&line.startsWith('"""',i)&&!isEscaped(line,i)){quote=null;i+=2;continue;}
      if(quote==="'''"&&line.startsWith("'''",i)){quote=null;i+=2;continue;}
      if(quote==='"'&&line[i]==='\\'){i++;continue;}
      if(quote==='"'&&line[i]==='"'||quote==="'"&&line[i]==="'")quote=null;
      continue;
    }
    if(line.startsWith('"""',i)||line.startsWith("'''",i)){
      const delimiter=line.slice(i,i+3),end=findTomlMultilineEnd(line,i+3,delimiter);
      if(end<0)return {code:line,comment:'',multiline:delimiter};
      i=end+2;continue;
    }
    if(line[i]==='"'||line[i]==="'"){quote=line[i];continue;}
    if(line[i]==='#')return {code:line.slice(0,i),comment:line.slice(i),multiline:null};
  }
  return {code:line,comment:'',multiline:null};
}
function isEscaped(text,index){let slashes=0;for(let i=index-1;i>=0&&text[i]==='\\';i--)slashes++;return slashes%2===1;}
function findTomlMultilineEnd(line,start,delimiter){
  for(let i=start;i<=line.length-delimiter.length;i++)if(line.startsWith(delimiter,i)&&(delimiter!== '"""'||!isEscaped(line,i)))return i;
  return -1;
}
function splitTomlPath(raw){
  const parts=[];let start=0,quote=null,escaped=false;
  for(let i=0;i<raw.length;i++){
    const char=raw[i];
    if(quote){if(quote==='"'&&char==='\\'&&!escaped){escaped=true;continue;}if(char===quote&&!escaped)quote=null;escaped=false;continue;}
    if(char==='"'||char==="'"){quote=char;continue;}
    if(char==='.'){parts.push(raw.slice(start,i).trim());start=i+1;}
  }
  if(quote)return null;
  parts.push(raw.slice(start).trim());
  const decoded=[];
  for(const part of parts){
    if(/^[A-Za-z0-9_-]+$/.test(part)){decoded.push(part);continue;}
    if(part.length>=2&&part[0]==='\''&&part.at(-1)==='\''){decoded.push(part.slice(1,-1));continue;}
    if(part.length>=2&&part[0]==='"'&&part.at(-1)==='"'){
      try{decoded.push(JSON.parse(part));}catch{return null;}
      continue;
    }
    return null;
  }
  return decoded;
}
function parseTomlHeader(line){
  const code=splitTomlComment(line).code.trim();
  const array=code.startsWith('[['),open=array?'[[':'[',close=array?']]':']';
  if(!code.startsWith(open)||!code.endsWith(close))return null;
  const pathParts=splitTomlPath(code.slice(open.length,-close.length).trim());
  return pathParts?{path:pathParts,array}:null;
}
function parseTomlAssignment(line){
  const {code,comment,multiline}=splitTomlComment(line);
  const match=/^\s*((?:"(?:[^"\\]|\\.)*"|'[^']*'|[A-Za-z0-9_-]+)(?:\s*\.\s*(?:"(?:[^"\\]|\\.)*"|'[^']*'|[A-Za-z0-9_-]+))*)\s*=\s*(.*)$/.exec(code);
  if(!match)return null;
  const keyParts=splitTomlPath(match[1]);
  if(!keyParts)return null;
  return {key:keyParts.length===1?keyParts[0]:null,keyParts,value:match[2].trim(),comment,multiline,indent:(/^\s*/.exec(code)||[''])[0]};
}
function tomlPathKey(parts){return JSON.stringify(parts);}
function parseTomlDocument(lines){
  const tables=[],rootAssignments=[];let active=null,multiline=null;
  for(let index=0;index<lines.length;index++){
    const line=lines[index];
    if(multiline){if(findTomlMultilineEnd(line,0,multiline)>=0)multiline=null;continue;}
    const {multiline:opened}=splitTomlComment(line);
    const header=parseTomlHeader(line);
    if(header){if(active)active.end=index;active={...header,start:index,end:lines.length,assignments:new Map(),duplicateKeys:new Set(),nestedAssignments:[]};tables.push(active);}
    else {
      const assignment=parseTomlAssignment(line);
      if(assignment&&active&&assignment.key!==null){
        if(active.assignments.has(assignment.key))active.duplicateKeys.add(assignment.key);
        else active.assignments.set(assignment.key,{...assignment,lineIndex:index});
      } else if(assignment&&active)active.nestedAssignments.push({...assignment,lineIndex:index});
      else if(assignment)rootAssignments.push({...assignment,lineIndex:index});
    }
    if(opened)multiline=opened;
  }
  return {tables,rootAssignments};
}
function sectionMatches(table,parts){return tomlPathKey(table.path)===tomlPathKey(parts);}
function mergeConfigToml(current,desired,{allowManagedUpdates=false}={}){
  const eol=current.includes('\r\n')?'\r\n':'\n';
  const hadFinalNewline=/(?:\r\n|\n)$/.test(current);
  const lines=current.split(/\r?\n/);if(hadFinalNewline)lines.pop();
  const desiredLines=desired.split(/\r?\n/),sourceDocument=parseTomlDocument(desiredLines),currentDocument=parseTomlDocument(lines);
  const sourceTables=sourceDocument.tables,currentTables=currentDocument.tables;
  const wanted=sourceTables.filter(table=>table.path[0]==='agents'&&(table.path.length===1||AGENT_ROLES.includes(table.path[1])&&table.path.length===2));
  const conflicts=[],replaceLines=new Map(),insertions=new Map(),preserved=[];
  const addAt=(index,values)=>insertions.set(index,[...(insertions.get(index)||[]),...values]);
  const critical=(section,key)=>section.length===1?key==='enabled'||key==='max_concurrent_threads_per_session':true;
  const formatSection=(section,entries)=>[`[${section.join('.')}]`,...entries.map(({key,value})=>`${key} = ${value}`)];

  for(const assignment of currentDocument.rootAssignments)if(assignment.keyParts[0]==='agents')conflicts.push(`root-level agents assignment '${assignment.keyParts.join('.')}' cannot be merged safely.`);
  for(const table of currentTables)if(table.path.length===1&&table.path[0]==='agents'){
    for(const assignment of table.nestedAssignments)if(AGENT_ROLES.includes(assignment.keyParts[0]))conflicts.push(`dotted assignment '${assignment.keyParts.join('.')}' in [agents] conflicts with a kit role table.`);
  }

  for(const wantedTable of wanted){
    const same=currentTables.filter(table=>sectionMatches(table,wantedTable.path));
    const descendants=currentTables.filter(table=>table.path.length>wantedTable.path.length&&wantedTable.path.every((part,index)=>table.path[index]===part));
    if(same.length>1||same.some(table=>table.array)){conflicts.push(`duplicate or array table [${wantedTable.path.join('.')}].`);continue;}
    if(same.length===0&&descendants.some(table=>table.array&&sectionMatches({path:table.path.slice(0,wantedTable.path.length)},wantedTable.path))){conflicts.push(`array table conflicts with [${wantedTable.path.join('.')}].`);continue;}

    let table=same[0];
    if(!table){
      let insertionIndex=lines.length;
      if(wantedTable.path.length===1){
        const child=currentTables.find(candidate=>candidate.path.length>1&&candidate.path[0]==='agents');
        if(child)insertionIndex=child.start;
      } else {
        const child=currentTables.filter(candidate=>candidate.path.length>wantedTable.path.length&&wantedTable.path.every((part,index)=>candidate.path[index]===part));
        if(child.length)insertionIndex=Math.min(...child.map(candidate=>candidate.start));
      }
      const entries=[...wantedTable.assignments.entries()].map(([key,assignment])=>({key,value:assignment.value}));
      if(entries.some(entry=>!entry.value||/^\[|^\{|^"""|^'''/.test(entry.value))){conflicts.push(`unsupported complex value in [${wantedTable.path.join('.')}].`);continue;}
      const block=formatSection(wantedTable.path,entries);
      if(insertionIndex===lines.length&&lines.length&&lines.at(-1).trim())block.unshift('');
      if(insertionIndex<lines.length&&lines[insertionIndex-1]?.trim())block.push('');
      addAt(insertionIndex,block);
      continue;
    }
    if(table.duplicateKeys.size){conflicts.push(`duplicate key(s) in [${wantedTable.path.join('.')}]: ${[...table.duplicateKeys].join(', ')}.`);continue;}
    const additions=[];
    for(const [key,expected] of wantedTable.assignments){
      const existing=table.assignments.get(key);
      if(!existing){additions.push(`${key} = ${expected.value}`);continue;}
      if(existing.value===expected.value)continue;
      const isOptionalDefault=wantedTable.path.length===1&&['default_subagent_model','default_subagent_reasoning_effort'].includes(key);
      if(!allowManagedUpdates&&!critical(wantedTable.path,key)&&isOptionalDefault){preserved.push(`[agents].${key}`);continue;}
      if(!allowManagedUpdates&&critical(wantedTable.path,key)){
        conflicts.push(`[${wantedTable.path.join('.')}].${key} is ${existing.value}; expected ${expected.value}.`);continue;
      }
      if(existing.multiline||/^\s*(?:\[|\{|"""|''')/.test(existing.value)){
        conflicts.push(`[${wantedTable.path.join('.')}].${key} uses a complex value and cannot be updated safely.`);continue;
      }
      const original=lines[existing.lineIndex],parts=splitTomlComment(original),assignment=parseTomlAssignment(original);
      if(!assignment){conflicts.push(`could not safely update [${wantedTable.path.join('.')}].${key}.`);continue;}
      const trailing=(parts.code.match(/[ \t]*$/)||[''])[0];
      replaceLines.set(existing.lineIndex,`${assignment.indent}${key} = ${expected.value}${trailing}${parts.comment}`);
    }
    if(additions.length)addAt(table.end,additions);
  }
  if(conflicts.length)return {text:current,conflicts,preserved};

  const output=[];
  for(let index=0;index<=lines.length;index++){
    if(insertions.has(index))output.push(...insertions.get(index));
    if(index<lines.length)output.push(replaceLines.has(index)?replaceLines.get(index):lines[index]);
  }
  let text=output.join(eol);
  if(text&&!text.endsWith('\n'))text+=eol;
  return {text,conflicts:[],preserved};
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
function planCounts(plan){
  const counts={create:0,replace:0,merge:0,conflict:0,unchanged:0};
  for(const file of plan.files)counts[file.status]++;
  return counts;
}
function planHasManagedChanges(plan){return plan.files.some(file=>file.status!=='unchanged'&&file.status!=='conflict');}
function planNeedsBackup(plan){return plan.files.some(file=>file.status==='replace'||file.status==='merge');}
function printPlan(plan,{dryRun=false}={}){
  const counts=planCounts(plan);
  console.log(`Codex Autopilot Kit ${dryRun?'dry run':'plan'} — ${plan.target}`);
  console.log(`Desired: ${plan.profile} / ${plan.preset} / concurrency ${plan.concurrency}`);
  console.log(`Config strategy: ${plan.configStrategy}`);
  console.log('');
  for(const file of plan.files)console.log(`${file.status.toUpperCase().padEnd(9)} ${file.path}`);
  for(const file of plan.files)for(const conflict of file.conflicts||[])console.log(`CONFLICT  ${conflict}`);
  for(const file of plan.files)for(const preserved of file.preserved||[])console.log(`PRESERVED ${preserved} (existing project default)`);
  console.log(`${plan.gitignore.toUpperCase().padEnd(9)} .gitignore`);
  console.log(`\nSummary: ${counts.create} create, ${counts.replace} replace, ${counts.merge} merge, ${counts.conflict} conflict, ${counts.unchanged} unchanged${plan.gitignore==='update'?', .gitignore update':''}.`);
  if(planNeedsBackup(plan))console.log('Backup: existing managed files would be backed up before changes.');
  if(counts.conflict)console.log('The merge is blocked until the conflicting settings are resolved.');
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

function requestedConfigStrategy(args){
  const supplied=args['config-strategy'];
  if(supplied&&!CONFIG_STRATEGIES.includes(supplied))die(`Unknown config strategy '${supplied}'. Use: ${CONFIG_STRATEGIES.join(', ')}.`);
  if(args.force&&supplied==='merge')die('Do not combine --force with --config-strategy merge. Use --config-strategy replace or --force to back up and replace.');
  return supplied||(args.force?'replace':null);
}

function planInstall(target,profile,preset,concurrency,{configStrategy='replace',allowManagedUpdates=false}={}){
  const outputs=desiredOutputs(profile,preset,concurrency),files=[];
  for(const [rel,desired] of outputs){
    const p=path.join(target,rel),current=exists(p)?read(p):null;
    if(rel==='.codex/config.toml'&&current!==null&&configStrategy==='merge'){
      const merged=strictUtf8(p)?mergeConfigToml(current,desired,{allowManagedUpdates}):{text:current,conflicts:['.codex/config.toml is not valid UTF-8; fix its encoding before merging.'],preserved:[]};
      files.push({path:rel,status:merged.conflicts.length?'conflict':merged.text===current?'unchanged':'merge',current,desired:merged.text,conflicts:merged.conflicts,preserved:merged.preserved});
    } else files.push({path:rel,status:current===null?'create':current===desired?'unchanged':'replace',current,desired});
  }
  const currentManifest=loadManifest(target),desiredManifestCore=manifestCore(profile,preset,concurrency);
  const manifestStatus=!exists(manifestPath(target))?'create':manifestEquivalent(currentManifest,desiredManifestCore)?'unchanged':'replace';
  files.push({path:'.codex/autopilot-kit.json',status:manifestStatus,current:currentManifest,desired:desiredManifestCore,manifest:true});
  return {target,profile,preset,concurrency,files,configStrategy,gitignore:gitignoreNeedsUpdate(target)?'update':'unchanged'};
}
function install(args){
  const target=targetPath(args);
  const {profile,preset,concurrency,current}=resolveDesiredArgs(args,target);
  const dry=!!args['dry-run'];
  if(!exists(target)||!fs.statSync(target).isDirectory())die(`Target directory does not exist: ${target}`);
  const existingConfig=exists(path.join(target,'.codex','config.toml')),requested=requestedConfigStrategy(args);
  if(existingConfig&&!current&&!requested&&!dry)die('Target already has an unmanaged .codex/config.toml. Choose --config-strategy merge to preserve unrelated settings, or --config-strategy replace to back up and replace it.');
  const configStrategy=requested||'replace';
  const plan=planInstall(target,profile,preset,concurrency,{configStrategy,allowManagedUpdates:!!current});
  const conflicts=plan.files.flatMap(file=>file.conflicts||[]);
  if(dry){printPlan(plan,{dryRun:true});if(conflicts.length)process.exitCode=3;return;}
  if(conflicts.length)die(`Cannot merge existing .codex/config.toml safely:\n- ${conflicts.join('\n- ')}\nNo files were changed. Use --config-strategy replace only if you intend to back up and replace the managed config.`,3);

  info(`Installing v${VERSION} into ${target}`);
  if(planNeedsBackup(plan)){
    const backup=backupManaged(target,false);
    if(backup)info(`Backup: ${backup}`);
  }
  for(const file of plan.files.filter(file=>!file.manifest&&file.status!=='unchanged')){
    writeUtf8(path.join(target,file.path),file.desired,false);
    ok(`${file.status==='create'?'created':file.status==='merge'?'merged':'updated'} ${file.path}`);
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
function printInitSummary({target,preset,profile,concurrency,existingConfig,configStrategy,dryRun}){
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
  console.log(`Existing unmanaged config ${existingConfig?(configStrategy==='merge'?'merge nonconflicting settings':configStrategy==='replace'?'backup + replace':'replacement preview only'):'none detected'}`);
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

    const current=loadManifest(target),existingConfig=exists(path.join(target,'.codex','config.toml'));
    let configStrategy=requestedConfigStrategy(args);
    if(existingConfig&&!current&&!configStrategy&&!args['dry-run']){
      console.log('\nAn unmanaged .codex/config.toml already exists.');
      if(!rl)die('An unmanaged .codex/config.toml exists. Provide --config-strategy merge or --config-strategy replace.');
      configStrategy=await choose(rl,'How should the existing config be handled?',[{
        value:'merge',label:'merge     Preserve unrelated settings; stop on conflicts'},
        {value:'replace',label:'replace   Back up, then replace the config'},
        {value:'cancel',label:'cancel    Leave the project unchanged'},
      ],'merge');
      if(configStrategy==='cancel'){console.log('Cancelled. No files were changed.');return;}
    }

    printInitSummary({target,preset,profile,concurrency,existingConfig,configStrategy:configStrategy||(existingConfig?'replace':null),dryRun:!!args['dry-run']});
    if(concurrency>1)console.log('\nNote: concurrency above 1 can increase simultaneous model usage.');
    const approved=args.yes||(rl&&await confirm(rl,args['dry-run']?'Preview this configuration?':'Install this configuration?',true));
    if(!approved){console.log('Cancelled. No files were changed.');return;}
    install({...args,target,profile,preset,concurrency:String(concurrency),'config-strategy':configStrategy});
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
  const {profile,preset,concurrency,current}=resolveDesiredArgs(args,target,{preferCurrent:true});
  const configStrategy=requestedConfigStrategy(args)||'replace';
  const plan=planInstall(target,profile,preset,concurrency,{configStrategy,allowManagedUpdates:!!current});
  const counts=planCounts(plan);
  const conflicts=plan.files.flatMap(file=>file.conflicts||[]);
  if(args.json){
    console.log(JSON.stringify({schemaVersion:JSON_SCHEMA_VERSION,command:'diff',target,kitVersion:VERSION,desired:{profile,preset,concurrency},configStrategy,changed:planHasManagedChanges(plan)||plan.gitignore==='update',conflicts,files:plan.files.map(({path,status})=>({path,status})),gitignore:plan.gitignore,summary:counts},null,2));
    if(conflicts.length)process.exitCode=3;
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
    if(file.status==='conflict'){
      console.log(`\nCONFLICT ${file.path}`);
      for(const conflict of file.conflicts||[])console.log(`  ${conflict}`);
      continue;
    }
    if(file.manifest){
      console.log(`\n${file.status.toUpperCase()} ${file.path}`);
      console.log(`  version:     ${file.current?.version??'(none)'} -> ${VERSION}`);
      console.log(`  profile:     ${file.current?.profile??'(none)'} -> ${profile}`);
      console.log(`  preset:      ${file.current?.preset??'(none)'} -> ${preset}`);
      console.log(`  concurrency: ${file.current?.concurrency??'(none)'} -> ${concurrency}`);
    } else printFileDiff(file);
  }
  if(plan.gitignore==='update')console.log('\nUPDATE .gitignore\n+ .codex-autopilot-backups/');
  console.log(`\nSummary: ${counts.create} create, ${counts.replace} replace, ${counts.merge} merge, ${counts.conflict} conflict, ${counts.unchanged} unchanged${plan.gitignore==='update'?', .gitignore update':''}.`);
  console.log('No files were changed.');
  if(conflicts.length)process.exitCode=3;
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
function nonNegativeInteger(value,label,defaultValue=0){
  if(value===undefined)return defaultValue;
  if(!/^\d+$/.test(String(value)))die(label+' must be a non-negative integer.');
  const parsed=Number(value);
  if(!Number.isSafeInteger(parsed))die(label+' must be a safe integer.');
  return parsed;
}
function nonNegativeNumber(value,label){
  if(value===undefined)return undefined;
  if(!/^(?:\d+\.?\d*|\.\d+)$/.test(String(value)))die(label+' must be a non-negative number.');
  const parsed=Number(value);
  if(!Number.isFinite(parsed))die(label+' must be finite.');
  return parsed;
}
function runReceiptDirectory(target,{create=false}={}){
  const root=path.join(target,'.autopilot'),runs=path.join(root,'runs');
  for(const dir of [root,runs]){
    if(exists(dir)){
      const stat=fs.lstatSync(dir);
      if(stat.isSymbolicLink()||!stat.isDirectory())die('Run receipt path must be a real directory: '+dir);
    }else if(create)fs.mkdirSync(dir);
    else return null;
  }
  return runs;
}
function recordRun(args){
  const target=targetPath(args);
  if(!exists(target)||!fs.statSync(target).isDirectory())die('Target directory does not exist: '+target);
  const preset=args.preset,profile=args.profile,result=String(args.result||'').toUpperCase(),tests=String(args.tests||'NOT_RUN').toUpperCase();
  if(!PRESETS.includes(preset))die('Unknown or missing preset. Use: '+PRESETS.join(', ')+'.');
  if(!PROFILES[profile])die('Unknown or missing profile. Use: '+Object.keys(PROFILES).join(', ')+'.');
  if(!RUN_RESULTS.includes(result))die('Result must be one of: '+RUN_RESULTS.join(', ')+'.');
  if(!TEST_RESULTS.includes(tests))die('Tests must be one of: '+TEST_RESULTS.join(', ')+'.');
  const receipt={schemaVersion:1,kitVersion:VERSION,recorded_at:new Date().toISOString(),preset,profile,
    explorer_calls:nonNegativeInteger(args['explorer-calls'],'--explorer-calls'),
    worker_calls:nonNegativeInteger(args['worker-calls'],'--worker-calls'),
    reviewer_calls:nonNegativeInteger(args['reviewer-calls'],'--reviewer-calls'),
    result,tests};
  const duration=nonNegativeNumber(args['duration-seconds'],'--duration-seconds');
  if(duration!==undefined)receipt.duration_seconds=duration;
  if(args['files-changed']!==undefined)receipt.files_changed=nonNegativeInteger(args['files-changed'],'--files-changed');
  if(args.iterations!==undefined)receipt.iterations=nonNegativeInteger(args.iterations,'--iterations');
  if(args['reviewer-findings']!==undefined)receipt.reviewer_findings=nonNegativeInteger(args['reviewer-findings'],'--reviewer-findings');
  const benchmarkMode=args['benchmark-mode'],caseId=args['case-id'],pairId=args['pair-id'];
  if((benchmarkMode===undefined)!==(caseId===undefined)||(benchmarkMode===undefined)!==(pairId===undefined))die('--benchmark-mode, --case-id, and --pair-id must be provided together.');
  if(benchmarkMode!==undefined){
    if(!BENCHMARK_MODES.includes(benchmarkMode))die('--benchmark-mode must be one of: '+BENCHMARK_MODES.join(', ')+'.');
    if(!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(caseId))die('--case-id must be 1-64 letters, numbers, dots, underscores, or hyphens.');
    if(!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(pairId))die('--pair-id must be 1-64 letters, numbers, dots, underscores, or hyphens.');
    receipt.benchmark_mode=benchmarkMode;
    receipt.case_id=caseId;
    receipt.pair_id=pairId;
  }
  const runs=runReceiptDirectory(target,{create:true}),base=receipt.recorded_at.replace(/[:.]/g,'-');
  let suffix=0,file;
  while(true){
    const name=base+(suffix?'-'+suffix:'')+'.json';
    file=path.join(runs,name);
    try{fs.writeFileSync(file,JSON.stringify(receipt,null,2)+'\n',{encoding:'utf8',flag:'wx'});break;}
    catch(error){if(error.code!=='EEXIST')throw error;suffix++;}
  }
  if(args.json)console.log(JSON.stringify({schemaVersion:JSON_SCHEMA_VERSION,command:'record',receipt},null,2));
  else console.log('Run receipt saved: '+path.relative(target,file));
}
function validRunReceipt(receipt){
  const integerFields=['explorer_calls','worker_calls','reviewer_calls'];
  const optionalIntegerFields=['files_changed','iterations','reviewer_findings'];
  const benchmarkFields=(receipt?.benchmark_mode===undefined&&receipt?.case_id===undefined&&receipt?.pair_id===undefined)||
    (BENCHMARK_MODES.includes(receipt?.benchmark_mode)&&typeof receipt?.case_id==='string'&&/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(receipt.case_id)&&
      typeof receipt?.pair_id==='string'&&/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(receipt.pair_id));
  return receipt?.schemaVersion===1&&typeof receipt.recorded_at==='string'&&!Number.isNaN(Date.parse(receipt.recorded_at))&&
    PRESETS.includes(receipt.preset)&&PROFILES[receipt.profile]&&RUN_RESULTS.includes(receipt.result)&&TEST_RESULTS.includes(receipt.tests)&&
    integerFields.every(key=>Number.isSafeInteger(receipt[key])&&receipt[key]>=0)&&
    optionalIntegerFields.every(key=>receipt[key]===undefined||Number.isSafeInteger(receipt[key])&&receipt[key]>=0)&&
    (receipt.duration_seconds===undefined||typeof receipt.duration_seconds==='number'&&Number.isFinite(receipt.duration_seconds)&&receipt.duration_seconds>=0)&&benchmarkFields;
}
function normalizedReceipt(receipt){
  const keys=['schemaVersion','kitVersion','recorded_at','preset','profile','explorer_calls','worker_calls','reviewer_calls','result','tests',
    'duration_seconds','files_changed','iterations','reviewer_findings','benchmark_mode','case_id','pair_id'];
  return Object.fromEntries(keys.filter(key=>receipt[key]!==undefined).map(key=>[key,receipt[key]]));
}
function readReceiptFiles(dir,files){
  return files.map(name=>{
    const file=path.join(dir,name),stat=fs.lstatSync(file);
    if(stat.isSymbolicLink()||!stat.isFile())die('Run receipt must be a regular file: '+file);
    let receipt;
    try{receipt=JSON.parse(read(file));}catch{die('Invalid run receipt JSON: '+file);}
    if(!validRunReceipt(receipt))die('Unsupported or invalid run receipt: '+file);
    return normalizedReceipt(receipt);
  });
}
function runsCommand(args){
  const target=targetPath(args);
  if(!exists(target)||!fs.statSync(target).isDirectory())die('Target directory does not exist: '+target);
  const dir=runReceiptDirectory(target),files=dir?fs.readdirSync(dir).filter(name=>name.endsWith('.json')).sort().reverse():[];
  const runs=dir?readReceiptFiles(dir,files):[];
  if(args.json){console.log(JSON.stringify({schemaVersion:JSON_SCHEMA_VERSION,command:'runs',count:runs.length,runs},null,2));return;}
   console.log('Codex Autopilot Kit runs');
  if(!runs.length){console.log('No run receipts found.');return;}
  console.log('DATE                      PRESET           RESULT   WORKERS');
  for(const run of runs)console.log(run.recorded_at.replace('T',' ').replace(/\.\d{3}Z$/,' UTC').padEnd(26)+' '+run.preset.padEnd(16)+' '+run.result.padEnd(8)+' '+run.worker_calls);
}
function runHelp(){
  console.log('\nRun receipts:\n  codex-autopilot record --target . --preset generic --profile balanced --result PASS [--tests PASS|FAIL|NOT_RUN] [--explorer-calls 0] [--worker-calls 0] [--reviewer-calls 0] [--duration-seconds N] [--files-changed N] [--json]\n  codex-autopilot runs [--target .] [--json]\n  codex-autopilot readiness [--target .] [--json]\nReceipts are stored locally in .autopilot/runs; Goal text, tokens, and network data are not recorded.');
  console.log('  codex-autopilot benchmarks [--target .] [--json]\nOptional record fields: --iterations N --reviewer-findings N --benchmark-mode codex-only|codex-autopilot-kit --case-id ID --pair-id ID');
}
function metricMean(receipts,key){
  const values=receipts.map(receipt=>receipt[key]).filter(value=>typeof value==='number'&&Number.isFinite(value));
  return values.length?Number((values.reduce((sum,value)=>sum+value,0)/values.length).toFixed(2)):null;
}
function summarizeBenchmarkMode(receipts){
  return {runs:receipts.length,pass:receipts.filter(receipt=>receipt.result==='PASS').length,
    blocked:receipts.filter(receipt=>receipt.result==='BLOCKED').length,
    tests_pass:receipts.filter(receipt=>receipt.tests==='PASS').length,
    mean_duration_seconds:metricMean(receipts,'duration_seconds'),
    mean_iterations:metricMean(receipts,'iterations'),
    mean_files_changed:metricMean(receipts,'files_changed'),
    mean_reviewer_findings:metricMean(receipts,'reviewer_findings')};
}
function benchmarksCommand(args){
  const target=targetPath(args);
  if(!exists(target)||!fs.statSync(target).isDirectory())die('Target directory does not exist: '+target);
  const dir=runReceiptDirectory(target),files=dir?fs.readdirSync(dir).filter(name=>name.endsWith('.json')).sort():[];
  const receipts=(dir?readReceiptFiles(dir,files):[]).filter(receipt=>receipt.benchmark_mode);
  const cases=new Map();
  for(const receipt of receipts){
    if(!cases.has(receipt.case_id))cases.set(receipt.case_id,new Map());
    const pairs=cases.get(receipt.case_id);
    if(!pairs.has(receipt.pair_id))pairs.set(receipt.pair_id,{'codex-only':[],'codex-autopilot-kit':[]});
    pairs.get(receipt.pair_id)[receipt.benchmark_mode].push(receipt);
  }
  const rows=[...cases.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([caseId,pairs])=>{
    const pairRows=[...pairs.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([pairId,modes])=>{
      const left=modes['codex-only'],right=modes['codex-autopilot-kit'];
      const complete=left.length>0&&right.length>0;
      const ambiguous=left.length>1||right.length>1;
      const mismatched=left.length===1&&right.length===1&&(left[0].preset!==right[0].preset||left[0].profile!==right[0].profile);
      const comparable=complete&&!ambiguous&&!mismatched;
      return {pair_id:pairId,complete,comparable,ambiguous,mismatched,
        modes:{'codex-only':summarizeBenchmarkMode(left),'codex-autopilot-kit':summarizeBenchmarkMode(right)}};
    });
    const caseReceipts=receipts.filter(receipt=>receipt.case_id===caseId);
    return {case_id:caseId,pair_count:pairRows.length,complete_pairs:pairRows.filter(pair=>pair.complete).length,
      comparable_pairs:pairRows.filter(pair=>pair.comparable).length,incomplete_pairs:pairRows.filter(pair=>!pair.complete).length,
      ambiguous_pairs:pairRows.filter(pair=>pair.ambiguous).length,
      modes:{'codex-only':summarizeBenchmarkMode(caseReceipts.filter(receipt=>receipt.benchmark_mode==='codex-only')),
        'codex-autopilot-kit':summarizeBenchmarkMode(caseReceipts.filter(receipt=>receipt.benchmark_mode==='codex-autopilot-kit'))},pairs:pairRows};
  });
  const pairRows=rows.flatMap(row=>row.pairs);
  const pairedCases=rows.filter(row=>row.complete_pairs>0).length;
  const comparableCases=rows.filter(row=>row.comparable_pairs>0).length;
  const summary={schemaVersion:JSON_SCHEMA_VERSION,command:'benchmarks',run_count:receipts.length,
    pair_count:pairRows.length,complete_pairs:pairRows.filter(pair=>pair.complete).length,
    comparable_pairs:pairRows.filter(pair=>pair.comparable).length,incomplete_pairs:pairRows.filter(pair=>!pair.complete).length,
    ambiguous_pairs:pairRows.filter(pair=>pair.ambiguous).length,mismatched_pairs:pairRows.filter(pair=>pair.mismatched).length,
    paired_cases:pairedCases,comparable_cases:comparableCases,incomplete_cases:rows.filter(row=>row.incomplete_pairs>0).length,
    mismatched_cases:rows.filter(row=>row.pairs.some(pair=>pair.mismatched)).length,
    modes:{'codex-only':summarizeBenchmarkMode(receipts.filter(receipt=>receipt.benchmark_mode==='codex-only')),
      'codex-autopilot-kit':summarizeBenchmarkMode(receipts.filter(receipt=>receipt.benchmark_mode==='codex-autopilot-kit'))},
    cases:rows,interpretation:'Descriptive local summary only; it does not establish causality or statistical significance.'};
  if(args.json){console.log(JSON.stringify(summary,null,2));return;}
  console.log('Codex Autopilot Kit benchmark summary');
  if(!rows.length){console.log('No benchmark receipts found.');return;}
  console.log('CASE                 CODEX ONLY (PASS/RUNS, AVG SEC)    KIT (PASS/RUNS, AVG SEC)');
  for(const row of rows){
    const a=row.modes['codex-only'],b=row.modes['codex-autopilot-kit'];
    const avg=value=>value===null?'n/a':String(value);
    console.log(row.case_id.padEnd(21)+(a.pass+'/'+a.runs+', '+avg(a.mean_duration_seconds)).padEnd(36)+b.pass+'/'+b.runs+', '+avg(b.mean_duration_seconds));
  }
  console.log('\nComparable run pairs: '+summary.comparable_pairs+'/'+summary.pair_count+' (one receipt per mode, same preset/profile). Descriptive only; no causal or statistical claim.');
}
function readiness(args){
  const target=targetPath(args);
  if(!exists(target)||!fs.statSync(target).isDirectory())die('Target directory does not exist: '+target);
  const configPath=path.join(target,'.codex','config.toml'),config=exists(configPath)?read(configPath):'';
  const goalPath=path.join(target,'AUTOPILOT-GOAL.md'),goal=exists(goalPath)?read(goalPath):'';
  const agentsPath=path.join(target,'AGENTS.md'),agents=exists(agentsPath)?read(agentsPath):'';
  const gitignorePath=path.join(target,'.gitignore'),gitignore=exists(gitignorePath)?read(gitignorePath):'';
  let pkg=null;
  try{pkg=JSON.parse(read(path.join(target,'package.json')));}catch{}
  const checks=[];
  const add=(id,pass,detail)=>checks.push({id,status:pass?'pass':'fail',points:pass?10:0,detail});
  add('installation',!!loadManifest(target)&&CONTENT_MANAGED.every(rel=>exists(path.join(target,rel))),'Managed files and manifest are present.');
  add('goal-contract',/\bPASS\b/i.test(goal)&&/\bBLOCKED\b/i.test(goal),'Goal includes explicit PASS and BLOCKED outcomes.');
  add('tests-available',typeof pkg?.scripts?.test==='string'&&pkg.scripts.test.trim().length>0,'package.json declares a test script.');
  const reviewerPath=path.join(target,'.codex','agents','reviewer.toml'),reviewer=exists(reviewerPath)?read(reviewerPath):'';
  add('reviewer-read-only',!!reviewer&&/sandbox_mode\s*=\s*["']read-only["']/.test(reviewer),'Reviewer file exists and declares read-only sandbox mode.');
  const explorerPath=path.join(target,'.codex','agents','explorer.toml'),explorer=exists(explorerPath)?read(explorerPath):'';
  add('explorer-read-only',!!explorer&&/sandbox_mode\s*=\s*["']read-only["']/.test(explorer),'Explorer file exists and declares read-only sandbox mode.');
  const backupIgnorePatterns=['.codex-autopilot-backups','.codex-autopilot-backups/','/.codex-autopilot-backups','/.codex-autopilot-backups/'];
  const backupsIgnored=gitignore.split(/\r?\n/).some(line=>backupIgnorePatterns.includes(line.trim()));
  add('backups-protected',backupsIgnored,'Project .gitignore excludes the installer backup directory.');
  const concurrency=/max_concurrent_threads_per_session\s*=\s*(\d+)/.exec(config)?.[1];
  add('concurrency',concurrency==='1','Configured concurrency is '+(concurrency||'unknown')+'; 1 is the conservative default.');
  add('agent-instructions',/\b(?:PASS|BLOCKED)\b/i.test(agents)&&/(?:never|must not|do not|scope)/i.test(agents),'AGENTS.md states a result contract and at least one boundary.');
  const git=spawnSync('git',['status','--porcelain=v1','--untracked-files=all'],{cwd:target,encoding:'utf8',timeout:5000,windowsHide:true});
  const gitStatus=git.error||git.status!==0?'unknown':git.stdout.trim()?'fail':'pass';
  checks.push({id:'git-status',status:gitStatus,points:gitStatus==='pass'?10:0,detail:gitStatus==='pass'?'Git working tree is clean.':gitStatus==='fail'?'Git working tree has changes.':'Git status is unavailable for this target.'});
  add('verification-command',typeof pkg?.scripts?.verify==='string'&&pkg.scripts.verify.trim().length>0,'package.json declares a verify script.');
  const score=checks.reduce((total,check)=>total+check.points,0);
  if(args.json)console.log(JSON.stringify({schemaVersion:JSON_SCHEMA_VERSION,command:'readiness',score:{value:score,max:100},checks},null,2));
  else{console.log('Codex Autopilot Kit readiness — '+target);for(const check of checks)console.log((check.status==='pass'?'✓':check.status==='unknown'?'?':'✗')+' '+check.id+' ('+check.points+'/10) — '+check.detail);console.log('\nAUTOPILOT READINESS: '+score+'/100\nInformational checklist; it does not measure agent intelligence or guarantee task quality.');}
}
function latestBackup(target){ const root=path.join(target,'.codex-autopilot-backups'); if(!exists(root))return null; return fs.readdirSync(root).map(n=>path.join(root,n)).filter(p=>fs.statSync(p).isDirectory()).sort().reverse()[0]||null; }
function uninstall(args){ const target=targetPath(args),dry=!!args['dry-run'],manifest=loadManifest(target); if(!manifest)die('No managed installation found. Refusing to remove files.',2); const backup=backupManaged(target,dry); if(backup)info(`${dry?'[dry-run] ':''}Safety backup before uninstall: ${backup}`); for(const rel of MANAGED){const p=path.join(target,rel);if(exists(p)){if(!dry)fs.rmSync(p,{force:true});ok(`${dry?'would remove':'removed'} ${rel}`);}} if(args['restore-latest']){const src=latestBackup(target);if(!src)info('No backup found to restore.');else{const m=path.join(src,'backup-manifest.json');if(exists(m)){const bm=JSON.parse(read(m));for(const rel of bm.files||[]){const from=path.join(src,rel),to=path.join(target,rel);if(exists(from)){copyFile(from,to,dry);ok(`${dry?'would restore':'restored'} ${rel}`);}}}}} console.log(dry?'\nDry run only; no files were changed.':'\nUninstall complete.'); }
function printGoal(args){ const preset=args.preset||'generic'; if(!PRESETS.includes(preset))die(`Unknown preset '${preset}'.`); process.stdout.write(template(`goals/${preset}.md`)); }

const args=parseArgs(process.argv.slice(2));
const cmd=args._[0];
if(!cmd||['help','-h','--help'].includes(cmd)){help();runHelp();}
else if(cmd==='init')await init(args);
else if(cmd==='install')install(args);
else if(cmd==='diff')diffCommand(args);
else if(cmd==='doctor')doctor(args);
else if(cmd==='status')status(args);
else if(cmd==='record')recordRun(args);
else if(cmd==='runs')runsCommand(args);
else if(cmd==='readiness')readiness(args);
else if(cmd==='benchmarks')benchmarksCommand(args);
else if(cmd==='uninstall')uninstall(args);
else if(cmd==='print-goal')printGoal(args);
else die(`Unknown command '${cmd}'. Run with --help.`);
