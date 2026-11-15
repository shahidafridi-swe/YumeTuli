#!/usr/bin/env bash
# Starts the MySQL MCP server for Claude Code with the SELECT-only user (see scripts/db-readonly-user.sh).
# Reads connection values from .env so no password lives in .mcp.json. Writes are off in the server too.
set -euo pipefail
cd "$(dirname "$0")/.."
get() { grep -E "^$1=" .env | head -1 | cut -d= -f2- | sed -E 's/^"(.*)"$/\1/'; }
export MYSQL_HOST=127.0.0.1
export MYSQL_PORT="$(get MYSQL_HOST_PORT)"; MYSQL_PORT=${MYSQL_PORT:-3307}
export MYSQL_USER=yumetuli_ro
export MYSQL_PASS="$(get DB_RO_PASSWORD)"
export MYSQL_DB="$(get DB_DATABASE)"; MYSQL_DB=${MYSQL_DB:-yumetuli}
export ALLOW_INSERT_OPERATION=false ALLOW_UPDATE_OPERATION=false ALLOW_DELETE_OPERATION=false
exec npx -y @benborla29/mcp-server-mysql@2.0.9
