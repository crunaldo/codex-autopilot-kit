import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import TOML from '@iarna/toml';
import Ajv from 'ajv';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaUrl = process.env.CODEX_CONFIG_SCHEMA_URL || 'https://developers.openai.com/codex/config-schema.json';
const profiles = {
  economy: { explorer: 'medium', worker: 'medium', reviewer: 'high' },
  balanced: { explorer: 'medium', worker: 'high', reviewer: 'high' },
  quality: { explorer: 'high', worker: 'high', reviewer: 'high' },
};
const roles = ['explorer', 'worker', 'reviewer'];
const decoder = new TextDecoder('utf-8', { fatal: true });

function render(text, profile) {
  return text
    .replaceAll('__EXPLORER_EFFORT__', profile.explorer)
    .replaceAll('__WORKER_EFFORT__', profile.worker)
    .replaceAll('__REVIEWER_EFFORT__', profile.reviewer)
    .replaceAll('__CONCURRENCY__', '1')
    .replaceAll('__KIT_VERSION__', JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version);
}

function parseToml(file, profile) {
  return TOML.parse(render(decoder.decode(fs.readFileSync(file)), profile));
}

function validate(validator, label, value) {
  if (validator(value)) return;
  const errors = (validator.errors || []).map(error => `${error.instancePath || '/'} ${error.message}`).join('; ');
  throw new Error(`${label} is incompatible with the current Codex config schema: ${errors}`);
}

const response = await fetch(schemaUrl, { signal: AbortSignal.timeout(20_000) });
if (!response.ok) throw new Error(`Could not download Codex config schema (${response.status}) from ${schemaUrl}`);
const schemaText = await response.text();
const schema = JSON.parse(schemaText);
const ajv = new Ajv({ allErrors: true, strict: false, validateFormats: false });
const validateConfig = ajv.compile(schema);
let validatedFiles = 0;

for (const [profileName, profile] of Object.entries(profiles)) {
  const configPath = path.join(root, 'templates', 'core', '.codex', 'config.toml');
  const config = parseToml(configPath, profile);
  validate(validateConfig, `${profileName} config.toml`, config);
  validatedFiles++;

  for (const role of roles) {
    const agentPath = path.join(root, 'templates', 'core', '.codex', 'agents', `${role}.toml`);
    const agent = parseToml(agentPath, profile);
    for (const key of ['name', 'description', 'developer_instructions']) {
      if (typeof agent[key] !== 'string' || !agent[key].trim()) throw new Error(`${role}.toml must define non-empty ${key}`);
    }
    const { name, description, developer_instructions, ...configLayer } = agent;
    validate(validateConfig, `${profileName} ${role}.toml config layer`, configLayer);
    validatedFiles++;
  }

  for (const role of roles) {
    const ref = config.agents?.[role]?.config_file;
    if (typeof ref !== 'string' || !ref) throw new Error(`${profileName} config.toml is missing agents.${role}.config_file`);
    const resolved = path.resolve(path.dirname(configPath), ref);
    if (!fs.existsSync(resolved)) throw new Error(`agents.${role}.config_file does not resolve to a shipped role file: ${ref}`);
  }
}

const probeConfig = parseToml(path.join(root, 'templates', 'core', '.codex', 'config.toml'), profiles.balanced);
if (validateConfig({ ...probeConfig, codex_autopilot_unknown_probe: true })) {
  throw new Error('Codex schema compatibility probe failed to reject an unknown root key.');
}

const schemaHash = createHash('sha256').update(schemaText).digest('hex');
console.log(`PASS: ${validatedFiles} rendered TOML files across 3 profiles match the published Codex config schema; custom-agent required fields and role paths pass. Schema SHA-256: ${schemaHash}`);
