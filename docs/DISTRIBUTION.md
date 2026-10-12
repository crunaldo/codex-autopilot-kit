# Distribution and discovery

Codex Autopilot Kit uses GitHub as the canonical source and is prepared for reproducible GitHub Releases and npm publication.

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

Release command from an authorized local checkout:

```bash
git tag v0.2.0
git push origin v0.2.0
```

Do not move an existing release tag after publication. Bump the version instead.

### npm

`package.json` is configured for public publication with provenance.

The release workflow contains an `npm-publish` job, but it is intentionally opt-in. It runs when either:

- repository variable `NPM_PUBLISH` is set to `true`; or
- the workflow is manually dispatched with `publish_npm=true`.

Recommended authentication is npm Trusted Publishing for this GitHub repository and workflow. A repository/environment secret named `NPM_TOKEN` is also supported when token-based publishing is required.

Before the first publication:

1. confirm the package name is still available on npm;
2. configure the `npm` GitHub Environment;
3. configure npm Trusted Publishing or `NPM_TOKEN`;
4. run the release workflow manually with npm publishing enabled, or enable `NPM_PUBLISH` for tag releases;
5. verify the published registry metadata before changing README commands to npm-first syntax.

Never claim that a version exists on npm until the registry confirms it.

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
[ ] npm publication verified, if enabled
```

The automated subset is available as:

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

The target directory currently requires at least 5 GitHub stars plus recent project activity before accepting a project.

Do not submit prematurely. Once the threshold is met, use one PR and follow the directory's alphabetical ordering and established one-line description style.

Suggested entry text:

> **Codex Autopilot Kit** — Adds safe, project-scoped explorer/worker/reviewer orchestration and reusable autonomous Goal contracts to Codex.

Suggested PR title:

```text
Add Codex Autopilot Kit to Coding Agents
```

Confirm the current section name and contribution rules immediately before submission because external directory structure may change.

## Package identity

The npm package and GitHub repository use the same name: `codex-autopilot-kit`.

The project is community maintained and is not affiliated with or endorsed by OpenAI.
