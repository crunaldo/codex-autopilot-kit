# Safety and operational boundaries

## Project scoped by design

The installer writes only inside the selected project. It does not modify `~/.codex`, global Git config, PATH, credentials, browser profiles, or other repositories.

## Backups

Before replacing managed paths, the installer stores a timestamped snapshot under:

```text
.codex-autopilot-backups/
```

The directory is added to `.gitignore`.

If an unmanaged `.codex/config.toml` exists, install stops unless a config strategy is selected. `--config-strategy merge` preserves unrelated entries, backs up before writing, and aborts without changes on duplicate tables or conflicting kit settings. `--config-strategy replace` (or the legacy `--force`) backs up and replaces the config.

## Local telemetry

The record command writes only user-supplied, structured run metadata inside the selected target at `.autopilot/runs/`. It does not inspect or intercept Codex sessions and does not collect Goal text, prompts, tokens, costs, file paths, or network data. The files are not automatically added to `.gitignore`; decide whether to retain them in the project based on its privacy and collaboration needs.

The readiness score inspects local project files and a read-only Git status command. Missing evidence is not reported as a pass; unavailable Git status is labeled unknown and receives no points. The score is a checklist, not a prediction of task quality.

## Before unattended execution

1. Put the project under version control.
2. Start from a known clean or documented Git state.
3. Confirm the Goal forbids unrelated repos, secrets, commit/push/deploy unless intended.
4. Confirm reviewer is read-only.
5. Validate configured models in the UI at least once.
6. Test first on a disposable repository.

## Third-party bridges

A bridge changes the trust model. Review its security model and protect browser/session/tunnel data.
