# ADR-0005 — Engine is a copy of ai-video inside the repo

- **Status:** Accepted
- **Date:** 2026-11-12
- **Deciders:** Shahid Afridi, Claude

## Context
The CLI video project (`AFRIDI/ai-video`) holds the Remotion composition, scripts, brand assets and all
episode scenes. The owner wants ai-video left untouched and YumeTuli to be self-contained for Docker.

## Decision
Copy ai-video into `engine/` (without node_modules, out, recordings, .venv). From then on YumeTuli's engine
evolves on its own; Claude adds scenes and components there.

## Consequences
- No sync between the two folders. Fixes in one do not reach the other.
- Shared engine changes must keep old episodes identical (re-render + compare).
