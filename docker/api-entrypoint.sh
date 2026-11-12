#!/bin/sh
# Prepares the bind-mounted Laravel app, then runs the container command.
set -e
cd /app

if [ ! -f vendor/autoload.php ]; then
  composer install --no-interaction --prefer-dist
fi

# Only the `api` service migrates (RUN_MIGRATIONS=1), so services don't race.
if [ "${RUN_MIGRATIONS:-0}" = "1" ]; then
  php artisan migrate --force
fi

exec "$@"
