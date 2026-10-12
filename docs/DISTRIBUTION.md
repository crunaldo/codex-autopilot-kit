# Distribution and discovery

Codex Autopilot Kit uses GitHub as the canonical source and is prepared for reproducible GitHub Releases and staged npm publication.

## Channels

### GitHub repository

Canonical source:

```text
https://github.com/crunaldo/codex-autopilot-kit
```

Users can install directly from GitHub without waiting for npm publication:

```bash
npx --yes github:crunaldo/codex-autopilot-kit init --target .
```

### GitHub Releases

The release workflow is triggered by semantic-version tags matching `v*.*.*`.

Before creating a release it:

1. runs `npm run release:check`;
2. verifies that the tag equals `v${package.json.version}`;
3. builds the npm tarball;
4. generates a SHA-256 checksum;
5. uploads both as workflow artifacts;
6. creates or updates the corresponding GitHub Release.

Release command from an authorized local checkout for the current package version:

```bash
git tag v0.4.0
git push origin v0.4.0
```

Do not move an existing release tag after publication. Bump the version instead.

### npm staged publishing

The npm package name is the unscoped package `codex-autopilot-kit`. Do not substitute the account scope `@crunaldo`; that would be a different package identity.

The release workflow intentionally does **not** run `npm publish`. npm distribution is staged first and requires a separate human approval with 2FA.

The `npm-stage` job is opt-in. It runs when either:

- repository variable `NPM_STAGE` is set to `true`; or
- the workflow is manually dispatched with `stage_npm=true`.

The workflow uses:

```bash
npm stage publish --provenance --access public
```

After a successful staged upload, inspect it before approval:

```bash
npm stage list codex-autopilot-kit
```

Only after inspection should an authorized human approve the stage with 2FA:

```bash
npm stage approve <stage-id> --otp <code>
```

The GitHub workflow intentionally never runs `npm stage approve`.

#### Token policy

Do not create a direct-publish token with `All packages` access for this workflow.

For the first publication, `codex-autopilot-kit` may not yet appear in npm's package selector. A short-lived **stage-only** granular access token can therefore require temporary access to all packages so it can create the new unscoped package. That token must be stored only as the GitHub Environment secret `NPM_STAGE_TOKEN`, used only by the staging job, given the shortest practical expiration, and revoked after the first package is established if a narrower package-specific credential can replace it.

Do not use `@crunaldo` merely because npm offers it in the selector; the repository publishes the unscoped `codex-autopilot-kit` package.

Before the first npm stage:

1. confirm the unscoped package name `codex-autopilot-kit` is still available;
2. configure the `npm` GitHub Environment;
3. create a short-lived stage-only granular token only when ready to stage;
4. save it as `NPM_STAGE_TOKEN`;
5. trigger `npm-stage` manually or enable `NPM_STAGE` for the intended release;
6. inspect the staged package;
7. approve manually with 2FA;
8. verify registry metadata before changing README commands to npm-first syntax;
9. revoke or narrow the temporary token after the package exists.

Never claim that a version exists on npm until the approval has completed and the registry confirms it.

## Release checklist

```text
[ ] package.json version is correct
[ ] CHANGELOG.md contains the version
[ ] npm test passes
[ ] npm run verify passes
[ ] npm pack --dry-run passes
[ ] working tree is clean
[ ] CI on main is green
[ ] tag matches package version exactly
[ ] GitHub Release exists with .tgz + SHA-256
[ ] npm stage inspected, if enabled
[ ] npm stage approved manually with 2FA
[ ] npm registry publication verified
[ ] temporary stage token revoked or narrowed
```

The automated validation subset is available as:

```bash
npm run release:check
```

## Discovery for humans

Recommended repository description:

> Safe project-scoped multi-agent autopilot for Codex — interactive setup, diff/doctor, reusable Goal contracts, zero runtime dependencies.

Recommended GitHub topics:

```text
codex
openai
coding-agent
multi-agent
agent-orchestration
autopilot
cli
subagents
developer-tools
ai-agents
```

These repository settings currently require GitHub repository-settings access; keeping the canonical wording here makes them reproducible.

## Discovery for agents

Two root-level files are intentionally optimized for machine discovery:

- `llms.txt` — concise project identity, commands, safety invariants, and canonical docs;
- `INSTALL_FOR_AGENTS.md` — deterministic no-surprises installation sequence for coding agents and CI.

Keep both files synchronized with public CLI behavior.

## Awesome Agent Orchestrators

The project has reached the directory's minimum adoption threshold and the submission material is maintained in `docs/AWESOME_SUBMISSION.md`.

Use one PR, preserve alphabetical ordering, and follow the upstream one-line description style.

## Package identity

The npm package and GitHub repository use the same unscoped name: `codex-autopilot-kit`.

The project is community maintained and is not affiliated with or endorsed by OpenAI.
