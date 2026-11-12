# Laravel API image (FrankenPHP = PHP 8.4 + web server in one binary).
# Stages: `api` (HTTP, scheduler, reverb) and `worker` (queue + video engine tools).
FROM dunglas/frankenphp:1-php8.4 AS api

RUN install-php-extensions pdo_mysql pcntl intl zip bcmath opcache

# Voice/video uploads.
RUN printf 'upload_max_filesize=64M\npost_max_size=70M\nmemory_limit=512M\n' > "$PHP_INI_DIR/conf.d/yumetuli.ini"

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

ENV COMPOSER_HOME=/tmp/composer \
    XDG_CONFIG_HOME=/tmp/caddy-config \
    XDG_DATA_HOME=/tmp/caddy-data

WORKDIR /app
COPY docker/api-entrypoint.sh /usr/local/bin/api-entrypoint
RUN chmod +x /usr/local/bin/api-entrypoint

ENTRYPOINT ["api-entrypoint"]
CMD ["frankenphp", "php-server", "--root", "public/", "--listen", ":8000"]

# Worker: same Laravel code + everything the video engine needs:
# Node 22, ffmpeg, Chromium libraries (Remotion downloads its own headless shell),
# Python tools (faster-whisper for caption alignment, edge-tts), and the Claude Code CLI.
FROM api AS worker

COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
 && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
 && apt-get update \
 && apt-get install -y --no-install-recommends \
      ffmpeg python3 python3-venv git procps zip unzip \
      libnss3 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libgbm1 \
      libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libasound2 \
      libpango-1.0-0 libcairo2 libx11-xcb1 libxshmfence1 \
      fonts-noto-core fonts-noto-color-emoji \
 && rm -rf /var/lib/apt/lists/*

# Python tools in a fixed venv (engine scripts look for .venv; the entrypoint links it).
COPY engine/requirements.txt /opt/engine-requirements.txt
RUN python3 -m venv /opt/venv && /opt/venv/bin/pip install --no-cache-dir -r /opt/engine-requirements.txt

ARG CLAUDE_CODE_VERSION=2.1.322
RUN npm install -g @anthropic-ai/claude-code@${CLAUDE_CODE_VERSION} && npm cache clean --force

# HOME lives in the `worker-home` volume: Claude login, Whisper model cache, npm cache.
ENV HOME=/home/worker
RUN mkdir -p /home/worker /engine/node_modules && chmod 777 /home/worker /engine/node_modules

COPY docker/worker-entrypoint.sh /usr/local/bin/worker-entrypoint
RUN chmod +x /usr/local/bin/worker-entrypoint
ENTRYPOINT ["worker-entrypoint"]
CMD ["php", "artisan", "queue:work", "--sleep=3", "--tries=1", "--timeout=5700"]
