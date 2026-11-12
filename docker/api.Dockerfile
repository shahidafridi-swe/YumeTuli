# Laravel API image (FrankenPHP = PHP 8.4 + web server in one binary).
# Stages: `api` (HTTP, scheduler, reverb) and `worker` (queue + video engine tools).
FROM dunglas/frankenphp:1-php8.4 AS api

RUN install-php-extensions pdo_mysql pcntl intl zip bcmath opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

ENV COMPOSER_HOME=/tmp/composer \
    XDG_CONFIG_HOME=/tmp/caddy-config \
    XDG_DATA_HOME=/tmp/caddy-data

WORKDIR /app
COPY docker/api-entrypoint.sh /usr/local/bin/api-entrypoint
RUN chmod +x /usr/local/bin/api-entrypoint

ENTRYPOINT ["api-entrypoint"]
CMD ["frankenphp", "php-server", "--root", "public/", "--listen", ":8000"]

# Worker: same Laravel code + Node 22 + ffmpeg for the video engine.
# Milestone 2 adds Chromium deps, Python tools and the Claude CLI.
FROM api AS worker

COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
 && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
 && apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg \
 && rm -rf /var/lib/apt/lists/*

CMD ["php", "artisan", "queue:work", "--sleep=3", "--tries=1", "--timeout=5400"]
