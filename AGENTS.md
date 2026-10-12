# Repository instructions

This repository ships an installer for project-scoped Codex agent configuration.

When modifying it:

1. Preserve the no-global-mutation safety boundary.
2. Keep runtime dependencies at zero unless unavoidable.
3. Keep Windows PowerShell 5 encoding pitfalls in mind; generated TOML must be valid UTF-8.
4. Do not introduce a default `max` escalation agent without a compatibility test proving the selected Codex client honors its reasoning level.
5. Run `npm test` and `npm run verify` before finalizing changes.
