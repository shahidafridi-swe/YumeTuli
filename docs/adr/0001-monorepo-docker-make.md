# ADR-0001 — Monorepo in Docker Compose, `make` as the entry point

- **Status:** Accepted
- **Date:** 2026-11-12
- **Deciders:** Shahid Afridi, Claude

## Context
YumeTuli has a Next.js UI, a Laravel API, a queue worker that needs Node, ffmpeg, Chromium, Python and the
Claude CLI, a websocket server and MySQL. The owner wants to run it on any PC with `docker compose up`.

## Decision
One repo with `web/`, `api/`, `engine/`, `docker/`. Everything runs in Docker Compose with code
bind-mounted for live editing; ports bind to 127.0.0.1. A root `Makefile` is the single entry point for
humans and agents (`make up`, `make check`, `make test-api`, …) — `make` exists everywhere, no extra install.

## Consequences
- One command set for agents and CI. Containers run as the host UID so files stay owned by the owner.
- Moving PCs means copying `.env`, logging Claude in once and restoring data volumes.
