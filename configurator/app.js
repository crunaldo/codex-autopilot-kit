import { DEFAULT_CONFIG, PROFILE_EFFORTS, buildInitCommand, configFromSearch, configToSearch, normalizeConfig, usagePercent } from './core.js';

let state = { ...DEFAULT_CONFIG };

const copy = {
  en: {
    heroTitle:'Build your Codex autopilot.', heroBody:'Choose the workflow you need. See exactly which agents will run, how strongly they reason, and copy a project-scoped install command.',
    proofScoped:'Project-scoped', proofZero:'0 runtime dependencies', proofPreview:'Preview before write',
    configureTitle:'Configure', configureBody:'Three choices define the local stack.', presetLabel:'Goal preset', presetGeneric:'General software work', presetFrontend:'Evidence-driven UI work', presetBackend:'APIs, services and contracts',
    profileLabel:'Execution profile', concurrencyLabel:'Maximum subagent concurrency', concurrencyOne:'Conservative', concurrencyTwo:'Moderate', concurrencyThree:'Higher',
    previewTitle:'Live configuration', previewBody:'What Codex will load in this project.', supervisor:'Supervisor', youChoose:'you choose', supervisorRole:'Plans · delegates · evaluates · stops', readOnly:'read-only', writes:'writes', explorerRole:'Targeted discovery and repository understanding.', workerRole:'Implementation, debugging, testing and validation.', reviewerRole:'Independent verification and final quality gate.', usageLabel:'Relative model usage',
    commandTitle:'Copy the command', commandBody:'Preview first, then install the exact configuration you chose from npm.', copyPreview:'Copy preview', copyInstall:'Copy install', copyShare:'Copy share link',
    filesTitle:'Six managed project files. Nothing global.', filesBody:'The installer backs up managed conflicts and never changes ~/.codex.',
    safetyTitle:'Designed to be inspectable.', safetyPreviewTitle:'Preview before write', safetyPreviewBody:'--dry-run and diff show intended changes without modifying the target.', safetyBackupTitle:'Backups before replacement', safetyBackupBody:'Managed conflicts are copied to a local backup directory before replacement.', safetyRolesTitle:'Scoped roles', safetyRolesBody:'Explorer and Reviewer remain read-only; nested subagents stay disabled.',
    footerText:'Community project · MIT · Not affiliated with OpenAI', copied:'Copied to clipboard.', profileNoteBalanced:'Recommended default for real project work.', profileNoteEconomy:'Lower model effort for routine or well-scoped work.', profileNoteQuality:'Higher discovery effort for difficult repositories.', concurrencyNoteOne:'Recommended default. Goal presets remain conservative and sequential by design.', concurrencyNoteMany:'Raises the maximum subagent thread cap. Higher values can increase simultaneous model usage.',
  },
  es: {
    heroTitle:'Construye tu autopiloto para Codex.', heroBody:'Elige el flujo que necesitas. Mira qué agentes se ejecutarán, con qué nivel de razonamiento, y copia el comando exacto para tu proyecto.',
    proofScoped:'Aislado por proyecto', proofZero:'0 dependencias de runtime', proofPreview:'Previsualiza antes de escribir',
    configureTitle:'Configura', configureBody:'Tres decisiones definen la pila local.', presetLabel:'Preset de Goal', presetGeneric:'Trabajo general de software', presetFrontend:'UI guiada por evidencia visual', presetBackend:'APIs, servicios y contratos',
    profileLabel:'Perfil de ejecución', concurrencyLabel:'Concurrencia máxima de subagentes', concurrencyOne:'Conservadora', concurrencyTwo:'Moderada', concurrencyThree:'Mayor',
    previewTitle:'Configuración en vivo', previewBody:'Lo que Codex cargará en este proyecto.', supervisor:'Supervisor', youChoose:'tú eliges', supervisorRole:'Planifica · delega · evalúa · detiene', readOnly:'solo lectura', writes:'escribe', explorerRole:'Descubrimiento puntual y comprensión del repositorio.', workerRole:'Implementación, debugging, pruebas y validación.', reviewerRole:'Verificación independiente y control final de calidad.', usageLabel:'Uso relativo de modelos',
    commandTitle:'Copia el comando', commandBody:'Previsualiza primero y luego instala desde npm exactamente la configuración elegida.', copyPreview:'Copiar preview', copyInstall:'Copiar instalación', copyShare:'Copiar enlace',
    filesTitle:'Seis archivos administrados. Nada global.', filesBody:'El instalador respalda conflictos administrados y nunca modifica ~/.codex.',
    safetyTitle:'Diseñado para poder inspeccionarse.', safetyPreviewTitle:'Preview antes de escribir', safetyPreviewBody:'--dry-run y diff muestran los cambios previstos sin modificar el proyecto.', safetyBackupTitle:'Backups antes de reemplazar', safetyBackupBody:'Los conflictos administrados se copian a un backup local antes de reemplazarse.', safetyRolesTitle:'Roles acotados', safetyRolesBody:'Explorer y Reviewer siguen en solo lectura; los subagentes anidados permanecen deshabilitados.',
    footerText:'Proyecto comunitario · MIT · No afiliado con OpenAI', copied:'Copiado al portapapeles.', profileNoteBalanced:'Predeterminado recomendado para trabajo real de proyecto.', profileNoteEconomy:'Menor esfuerzo de modelo para trabajo rutinario o bien acotado.', profileNoteQuality:'Mayor esfuerzo de descubrimiento para repositorios difíciles.', concurrencyNoteOne:'Predeterminado recomendado. Los Goal presets siguen siendo conservadores y secuenciales por diseño.', concurrencyNoteMany:'Eleva el máximo de threads de subagentes. Valores mayores pueden aumentar el uso simultáneo de modelos.',
  }
};

function loadFromUrl(){ state = configFromSearch(location.search); }
function command(dry){ return buildInitCommand(state, { dryRun: dry, source: 'npm' }); }
function syncUrl(){ history.replaceState(null,'',`${location.pathname}?${configToSearch(state)}`); }

function render(){
  state = normalizeConfig(state);
  document.documentElement.lang = state.lang;
  document.querySelector('#langToggle').textContent = state.lang === 'en' ? 'ES' : 'EN';
  document.querySelectorAll('[data-i18n]').forEach(el => { const key=el.dataset.i18n; if(copy[state.lang][key]) el.textContent=copy[state.lang][key]; });
  document.querySelectorAll('[data-group]').forEach(el => {
    const key = el.dataset.group;
    const value = key === 'concurrency' ? Number(el.dataset.value) : el.dataset.value;
    const active = state[key] === value;
    el.classList.toggle('active', active);
    el.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  const e = PROFILE_EFFORTS[state.profile];
  document.querySelector('#explorerEffort').textContent=e.explorer;
  document.querySelector('#workerEffort').textContent=e.worker;
  document.querySelector('#reviewerEffort').textContent=e.reviewer;
  document.querySelector('#usageLabel').textContent=state.profile === 'economy' ? copy[state.lang].concurrencyOne.replace('Conservative','Economy').replace('Conservadora','Economía') : state.profile === 'quality' ? copy[state.lang].concurrencyThree : state.lang === 'en' ? 'Balanced' : 'Balanceado';
  document.querySelector('#usageMeter').style.width=`${usagePercent(state)}%`;
  const profileKey = state.profile==='balanced'?'profileNoteBalanced':state.profile==='economy'?'profileNoteEconomy':'profileNoteQuality';
  document.querySelector('#profileNote').textContent=copy[state.lang][profileKey];
  document.querySelector('#concurrencyNote').textContent=copy[state.lang][state.concurrency===1?'concurrencyNoteOne':'concurrencyNoteMany'];
  document.querySelector('#commandOutput').textContent=command(true);
  document.querySelector('#terminalLabel').textContent='npm · preview';
  syncUrl();
}

async function copyText(text){
  try{ await navigator.clipboard.writeText(text); }
  catch{
    const ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  const el=document.querySelector('#copyStatus'); el.textContent=copy[state.lang].copied; clearTimeout(copyText.timer); copyText.timer=setTimeout(()=>el.textContent='',1800);
}

loadFromUrl();
document.addEventListener('click',e=>{
  const option=e.target.closest('[data-group]');
  if(option){
    const key=option.dataset.group; state[key]=key==='concurrency'?Number(option.dataset.value):option.dataset.value; render();
  }
});
document.querySelector('#langToggle').addEventListener('click',()=>{state.lang=state.lang==='en'?'es':'en';render();});
document.querySelector('#copyPreview').addEventListener('click',()=>copyText(command(true)));
document.querySelector('#copyInstall').addEventListener('click',()=>copyText(command(false)));
document.querySelector('#copyShare').addEventListener('click',()=>copyText(location.href));
render();
