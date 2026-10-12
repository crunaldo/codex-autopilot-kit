# Awesome Agent Orchestrators submission

Status: **eligible for submission**.

Eligibility verified on 2026-10-12:

- open/source-available GitHub repository: yes;
- GitHub stars: 5;
- recent activity: yes;
- clear fit in an existing section: yes.

Target repository:

```text
andyrewlee/awesome-agent-orchestrators
```

Target section:

```text
Agent Infrastructure & Primitives
```

Rationale: Codex Autopilot Kit does not replace Codex or provide a separate coding-agent UI/runtime. It installs a project-scoped harness configuration, specialized agent roles, reusable Goal contracts, safety boundaries, preview/diff inspection, and verification around the native Codex workflow. This matches the directory's infrastructure/primitives category more closely than a standalone loop runner.

## Exact README entry

Insert alphabetically after `codecast` and before `Concord MCP`:

```markdown
- [Codex Autopilot Kit](https://github.com/crunaldo/codex-autopilot-kit) - Project-scoped multi-agent workflow layer for Codex, installing supervisor, explorer, worker, and reviewer roles with reusable autonomous Goal contracts, preview/diff tooling, and safety verification without replacing the native harness.
```

## Pull request

Title:

```text
Add Codex Autopilot Kit to Agent Infrastructure & Primitives
```

Body — keep it to one line per the upstream contribution guide:

```text
Adds Codex Autopilot Kit, a project-scoped multi-agent workflow layer for Codex with reusable Goal contracts, inspectable setup, and safety verification.
```

The upstream contribution guide requests one entry per PR, alphabetical ordering, a one-line description, and passing `awesome-lint`.

## Expected patch

```diff
 - [Claudexor](https://github.com/razzant/claudexor) - Routes one coding thread across harnesses with quota-aware rotation between subscription profiles, Best-of-N runs, and cross-family review.
 - [codecast](https://github.com/codecast-sh/codecast) - Watches your real local sessions and surfaces them in a live triage inbox, keeping a searchable record with line-level agent attribution. Claude Code, Codex, Cursor, Gemini.
+- [Codex Autopilot Kit](https://github.com/crunaldo/codex-autopilot-kit) - Project-scoped multi-agent workflow layer for Codex, installing supervisor, explorer, worker, and reviewer roles with reusable autonomous Goal contracts, preview/diff tooling, and safety verification without replacing the native harness.
 - [Concord MCP](https://github.com/Get-Concord-AI/concord-mcp) - Shared coordination protocol for Claude Code, Codex, Cursor, Gemini CLI, and Grok Build agents to claim work, detect edit collisions, exchange durable messages, transfer ownership, and hand off review evidence without replacing their existing harnesses.
```

## External action required

The connected GitHub integration can read the upstream repository but cannot create a fork or write a branch there. Create a fork of `andyrewlee/awesome-agent-orchestrators`, apply the single-line README change above, and open the PR with the exact title/body provided here.
