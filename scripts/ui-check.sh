#!/usr/bin/env bash
# Logs in with the owner account from .env (values are never printed) and takes light, dark and
# mobile screenshots of the given paths into out/ui-check/. Usage: scripts/ui-check.sh / /videos ...
set -euo pipefail
cd "$(dirname "$0")/.."
get() { grep -E "^$1=" .env | head -1 | cut -d= -f2- | sed -E 's/^"(.*)"$/\1/'; }
token=$(curl -sf -X POST http://localhost:8000/api/v1/auth/login -H 'Accept: application/json' -H 'Content-Type: application/json' \
  -d "{\"email\":\"$(get OWNER_EMAIL)\",\"password\":\"$(get OWNER_PASSWORD)\"}" | python3 -c 'import json,sys;print(json.load(sys.stdin)["access_token"])')
out=out/ui-check
mkdir -p "$out"
node scripts/qa/shot.mjs "$out" "$token" light 1280 "$@"
node scripts/qa/shot.mjs "$out" "$token" dark 1280 "$@"
node scripts/qa/shot.mjs "$out" "$token" light 390 "$@"
echo "screenshots in $out/"
