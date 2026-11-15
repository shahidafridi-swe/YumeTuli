# ADR-0004 — Claude Code headless in the worker (subscription), Plan → Approve → Build

- **Status:** Accepted
- **Date:** 2026-11-12
- **Deciders:** Shahid Afridi, Claude

## Context
Videos are made by Claude writing custom Remotion scenes, not by templates. The owner runs YumeTuli
locally for personal use with a Claude subscription.

## Decision
- The queue worker runs `claude -p --output-format stream-json` inside `/engine`, logged in with the
  owner's subscription (`worker-home` volume) — no API key.
- Steps: **plan** (writes `inbox/<id>/plan.md`, stops) → owner approves/edits → **build** (`--resume`) →
  **feedback** runs (`--resume`) create new versions. Final files come from a `RESULT {…}` line.
- Claude runs with a clean environment (no app secrets), a tool allowlist, the headless system prompt,
  and cancel/timeout kill its whole process group (`setsid`).
- Tests use `tests/Fixtures/fake-claude`; real runs only when the owner agrees.

## Consequences
- Usage limits of the subscription apply; the UI shows a friendly error and Retry.
- Moving to a server for other users would need an API key (new ADR).
- The allowlist prevents accidents, not attacks (Python is allowed); the container is the boundary.
