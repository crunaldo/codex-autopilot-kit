# Security policy

Codex Autopilot Kit changes files inside a target repository and is intended for autonomous coding workflows. Treat it as developer tooling with write access to your project.

## Design boundaries

- The installer must never edit global `~/.codex` state.
- Existing managed paths are backed up before replacement.
- Default concurrency is one subagent.
- Explorer and reviewer run read-only.
- Goal templates forbid network access, commits, pushes, secrets changes, and access outside the project unless the user deliberately edits the template.
- Third-party model bridges are optional and are never installed silently.

## Reporting a vulnerability

Open a private security advisory on GitHub if available. Do not post secrets, tokens, tunnel IDs, cookies, account session data, or private repository content in public issues.

## Important

Autonomous agents can still make mistakes. Use source control, review diffs, keep backups, and start with disposable/test repositories before enabling unattended work on important codebases.
