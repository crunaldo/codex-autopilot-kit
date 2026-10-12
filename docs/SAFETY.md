# Safety and operational boundaries

## Project scoped by design

The installer writes only inside the selected project. It does not modify `~/.codex`, global Git config, PATH, credentials, browser profiles, or other repositories.

## Backups

Before replacing managed paths, the installer stores a timestamped snapshot under:

```text
.codex-autopilot-backups/
```

The directory is added to `.gitignore`.

If an unmanaged `.codex/config.toml` exists, install stops unless the user explicitly passes `--force`.

## Before unattended execution

1. Put the project under version control.
2. Start from a known clean or documented Git state.
3. Confirm the Goal forbids unrelated repos, secrets, commit/push/deploy unless intended.
4. Confirm reviewer is read-only.
5. Validate configured models in the UI at least once.
6. Test first on a disposable repository.

## Third-party bridges

A bridge changes the trust model. Review its security model and protect browser/session/tunnel data.
