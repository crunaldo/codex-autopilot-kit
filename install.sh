#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js 20+ is required." >&2
  exit 1
fi
exec node "$ROOT/bin/codex-autopilot.mjs" install "$@"
