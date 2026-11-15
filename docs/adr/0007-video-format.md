# ADR-0007 — Video format per video (vertical 9:16 / landscape 16:9)

- **Status:** Accepted
- **Date:** 2026-11-12
- **Deciders:** Shahid Afridi, Claude

## Context
The engine was built for 1080×1920 only. The owner wants each video to be vertical or landscape.

## Decision
`videos.format` (`vertical` default, `landscape`) is passed to Claude and written as `"format"` in
scenes.json. `engine/src/format.ts` defines sizes; shared components use `useFormat()`.
Landscape thumbnails are 1280×720.

## Consequences
- Old episodes are drawn for vertical; they are not re-laid-out for landscape.
- New shared engine code must never hard-code frame sizes.
