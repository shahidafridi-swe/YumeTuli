#!/usr/bin/env bash
# Creates (or refreshes) a SELECT-only MySQL user for agents (MySQL MCP server, see .mcp.json).
# Secrets stay out of reach: no access to sessions, tokens, cache, jobs, and only safe user columns.
# Re-run after adding tables (`make db-readonly-user`). Password: DB_RO_PASSWORD in .env (generated if missing).
set -euo pipefail
cd "$(dirname "$0")/.."
get() { grep -E "^$1=" .env | head -1 | cut -d= -f2- | sed -E 's/^"(.*)"$/\1/'; }
if [ -z "$(get DB_RO_PASSWORD)" ]; then
  sed -i '/^DB_RO_PASSWORD=/d' .env
  printf '\n# SELECT-only MySQL user for agents (make db-readonly-user)\nDB_RO_PASSWORD=%s\n' "$(openssl rand -hex 16)" >> .env
fi
db=$(get DB_DATABASE); db=${db:-yumetuli}
ro_pass=$(get DB_RO_PASSWORD)
root_pass=$(get DB_ROOT_PASSWORD)

hidden="'sessions','password_reset_tokens','cache','cache_locks','jobs','job_batches','failed_jobs','users','migrations'"
tables=$(docker compose exec -T -e MYSQL_PWD="$root_pass" mysql mysql -uroot -N -e \
  "SELECT table_name FROM information_schema.tables WHERE table_schema='${db}' AND table_name NOT IN (${hidden})")

{
  echo "CREATE USER IF NOT EXISTS 'yumetuli_ro'@'%' IDENTIFIED BY '${ro_pass}';"
  echo "ALTER USER 'yumetuli_ro'@'%' IDENTIFIED BY '${ro_pass}';"
  echo "REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'yumetuli_ro'@'%';"
  for t in $tables; do echo "GRANT SELECT ON \`${db}\`.\`${t}\` TO 'yumetuli_ro'@'%';"; done
  echo "GRANT SELECT (id, name, email, locale, theme, timezone, created_at, updated_at) ON \`${db}\`.\`users\` TO 'yumetuli_ro'@'%';"
  echo "FLUSH PRIVILEGES;"
} | docker compose exec -T -e MYSQL_PWD="$root_pass" mysql mysql -uroot

echo "yumetuli_ro: SELECT on $(echo "$tables" | wc -w) tables + safe users columns (host port $(get MYSQL_HOST_PORT || true))"
