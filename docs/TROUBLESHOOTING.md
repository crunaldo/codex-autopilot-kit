# Troubleshooting

## `invalid utf-8 sequence` in `.codex/config.toml`

This often appears on Windows when TOML is written with legacy PowerShell encoding. The kit writes UTF-8 from Node and `doctor` validates strict UTF-8.

```bash
npx --yes github:crunaldo/codex-autopilot-kit doctor --target .
```

## Wrong reasoning effort

Open a new chat after changing `.codex`. Run a tiny read-only role test and inspect the model/effort shown by Codex. If a Max/XHigh role is silently shown as Medium, do not rely on it for unattended escalation.

## `git diff` worktree errors

Some virtual/worktree environments can be inconsistent. Useful fallbacks for unstaged tracked changes:

```bash
git diff-files -p
git diff-files --check
git diff-files --stat
```

## Reviewer cannot start

The default concurrency is one. Wait for/close the completed worker before starting reviewer.

## Existing `.codex/config.toml`

The installer refuses to replace unmanaged config unless `--force` is passed. Review the backup and merge any project-specific settings you still need.

## `codex` command not found

Codex Desktop can be installed without a CLI on PATH. The kit itself only requires Node.js for installation.
