#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MOD_DIR="$ROOT_DIR/modernization"

cleanup() {
  [[ -n "${MOD_PID:-}" ]] && kill "$MOD_PID" >/dev/null 2>&1 || true
  [[ -n "${LEGACY_PID:-}" ]] && kill "$LEGACY_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

cd "$MOD_DIR"
DATA_MODE=file npm run extract:data >/tmp/gu_preview_extract.log 2>&1
DATA_MODE=file npm run db:migrate >/tmp/gu_preview_migrate.log 2>&1
DATA_MODE=file npm run db:seed >/tmp/gu_preview_seed.log 2>&1
DATA_MODE=file node backend/src/server.js >/tmp/gu_preview_modernization.log 2>&1 &
MOD_PID=$!

cd "$ROOT_DIR"
python3 -m http.server 8080 >/tmp/gu_preview_legacy.log 2>&1 &
LEGACY_PID=$!

echo "Legacy site: http://localhost:8080"
echo "Modernized student (API): http://localhost:4000"
echo "Modernized admin (API): http://localhost:4000/admin"
echo "Static modernized UI: http://localhost:8080/modernization/frontend/student/index.html"
echo "\nPress Ctrl+C to stop both servers."

wait "$MOD_PID"
