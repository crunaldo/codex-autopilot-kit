export const PRESETS = Object.freeze(['generic', 'frontend-visual', 'backend']);
export const PROFILES = Object.freeze(['economy', 'balanced', 'quality']);
export const CONCURRENCY_CHOICES = Object.freeze([1, 2, 3]);
export const LANGUAGES = Object.freeze(['en', 'es']);

export const DEFAULT_CONFIG = Object.freeze({
  preset: 'generic',
  profile: 'balanced',
  concurrency: 1,
  lang: 'en',
});

export const PROFILE_EFFORTS = Object.freeze({
  economy: Object.freeze({ explorer: 'medium', worker: 'medium', reviewer: 'high', usage: 38 }),
  balanced: Object.freeze({ explorer: 'medium', worker: 'high', reviewer: 'high', usage: 58 }),
  quality: Object.freeze({ explorer: 'high', worker: 'high', reviewer: 'high', usage: 76 }),
});

function pick(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

export function normalizeConfig(input = {}) {
  const concurrency = Number(input.concurrency);
  return {
    preset: pick(input.preset, PRESETS, DEFAULT_CONFIG.preset),
    profile: pick(input.profile, PROFILES, DEFAULT_CONFIG.profile),
    concurrency: CONCURRENCY_CHOICES.includes(concurrency) ? concurrency : DEFAULT_CONFIG.concurrency,
    lang: pick(input.lang, LANGUAGES, DEFAULT_CONFIG.lang),
  };
}

export function configFromSearch(search = '') {
  const params = new URLSearchParams(search);
  return normalizeConfig({
    preset: params.get('preset'),
    profile: params.get('profile'),
    concurrency: params.get('concurrency'),
    lang: params.get('lang'),
  });
}

export function configToSearch(config) {
  const normalized = normalizeConfig(config);
  return new URLSearchParams({
    preset: normalized.preset,
    profile: normalized.profile,
    concurrency: String(normalized.concurrency),
    lang: normalized.lang,
  }).toString();
}

export function buildInitCommand(config, { dryRun = false, source = 'npm' } = {}) {
  const normalized = normalizeConfig(config);
  const executable = source === 'github'
    ? 'npx --yes github:crunaldo/codex-autopilot-kit init'
    : 'npx --yes codex-autopilot-kit init';

  return `${executable} \\\n  --target . \\\n  --preset ${normalized.preset} \\\n  --profile ${normalized.profile} \\\n  --concurrency ${normalized.concurrency} \\\n  --yes${dryRun ? ' \\\n  --dry-run' : ''}`;
}

export function buildDoctorCommand({ json = true, source = 'npm' } = {}) {
  const executable = source === 'github'
    ? 'npx --yes github:crunaldo/codex-autopilot-kit doctor'
    : 'npx --yes codex-autopilot-kit doctor';
  return `${executable} --target .${json ? ' --json' : ''}`;
}

export function usagePercent(config) {
  const normalized = normalizeConfig(config);
  const base = PROFILE_EFFORTS[normalized.profile].usage;
  return Math.min(94, base + (normalized.concurrency - 1) * 8);
}
