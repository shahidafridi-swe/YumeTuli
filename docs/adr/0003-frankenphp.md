# ADR-0003 — FrankenPHP image for api, worker, reverb

- **Status:** Accepted
- **Date:** 2026-11-12
- **Deciders:** Shahid Afridi, Claude

## Context
PHP-FPM + nginx needs two processes or two containers. The worker also needs the same PHP plus video tools.

## Decision
`docker/api.Dockerfile` builds from FrankenPHP (PHP 8.4 + web server in one binary) with two targets:
`api` (HTTP, also used by reverb) and `worker` (adds Node 22, ffmpeg, Chromium libs, Python venv, Claude CLI).

## Consequences
- One base image to maintain. The FrankenPHP built-in healthcheck is disabled for non-HTTP services.
