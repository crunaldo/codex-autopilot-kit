# Codex configuration compatibility

The compatibility CI job downloads OpenAI's published [Codex config schema](https://developers.openai.com/codex/config-schema.json) and runs `npm run test:compat`. It parses the shipped TOML templates, renders all three profiles, validates the project config and each agent's config layer against the current schema, checks the required custom-agent fields, and verifies that every `config_file` reference resolves. It prints the schema SHA-256 so the exact compatibility input is recorded in CI.

The check makes no model request and does not access or modify the user's Codex home. It has no local fixture cleanup or runtime Codex dependency.

This gate checks the schema published by OpenAI; it does not run the Codex binary or prove that a model can be reached, that a particular model/reasoning level is available, or that a delegated agent completes work correctly. Older Codex versions are not claimed compatible unless they are tested separately.

To run locally, install the development dependencies and run:

```bash
npm run test:compat
```

Set `CODEX_CONFIG_SCHEMA_URL` to a schema-compatible URL when testing a pinned schema snapshot.
