#!/bin/sh
# Prepares the video engine (/engine) and the Laravel app (/app), then runs the command.
set -e

# Engine Python tools: scripts expect <engine>/.venv
[ -e /engine/.venv ] || ln -s /opt/venv /engine/.venv

# Engine Node packages live in the `engine-node-modules` volume.
if [ ! -f /engine/node_modules/.package-lock.json ]; then
  (cd /engine && npm ci --no-audit --no-fund)
fi

exec api-entrypoint "$@"
