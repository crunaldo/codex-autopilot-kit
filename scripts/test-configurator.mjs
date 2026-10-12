import assert from 'node:assert/strict';
import {
  CONCURRENCY_CHOICES,
  LANGUAGES,
  PRESETS,
  PROFILES,
  PROFILE_EFFORTS,
  buildDoctorCommand,
  buildInitCommand,
  configFromSearch,
  configToSearch,
  normalizeConfig,
  usagePercent,
} from '../configurator/core.js';

let cases = 0;
for (const preset of PRESETS) {
  for (const profile of PROFILES) {
    for (const concurrency of CONCURRENCY_CHOICES) {
      for (const lang of LANGUAGES) {
        const config = { preset, profile, concurrency, lang };
        const query = configToSearch(config);
        assert.deepEqual(configFromSearch(`?${query}`), config, `URL round trip failed for ${query}`);

        const preview = buildInitCommand(config, { dryRun: true });
        const install = buildInitCommand(config);
        for (const command of [preview, install]) {
          assert.match(command, /^npx --yes codex-autopilot-kit init/);
          assert.match(command, new RegExp(`--preset ${preset}(?:\\s|$)`));
          assert.match(command, new RegExp(`--profile ${profile}(?:\\s|$)`));
          assert.match(command, new RegExp(`--concurrency ${concurrency}(?:\\s|$)`));
          assert.match(command, /--yes(?:\s|$)/);
        }
        assert.match(preview, /--dry-run$/);
        assert.doesNotMatch(install, /--dry-run/);

        const githubPreview = buildInitCommand(config, { dryRun: true, source: 'github' });
        assert.match(githubPreview, /^npx --yes github:crunaldo\/codex-autopilot-kit init/);

        const expectedUsage = Math.min(94, PROFILE_EFFORTS[profile].usage + (concurrency - 1) * 8);
        assert.equal(usagePercent(config), expectedUsage);
        cases += 1;
      }
    }
  }
}

assert.deepEqual(normalizeConfig({ preset: 'invalid', profile: 'invalid', concurrency: 99, lang: 'xx' }), {
  preset: 'generic', profile: 'balanced', concurrency: 1, lang: 'en',
});
assert.equal(buildDoctorCommand(), 'npx --yes codex-autopilot-kit doctor --target . --json');
assert.equal(buildDoctorCommand({ json: false, source: 'github' }), 'npx --yes github:crunaldo/codex-autopilot-kit doctor --target .');

console.log(`PASS: configurator core validated across ${cases} preset/profile/concurrency/language combinations.`);
