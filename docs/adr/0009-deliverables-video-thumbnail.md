# ADR-0009 — Deliverables are the video and the thumbnail only

- **Status:** Accepted
- **Date:** 2026-11-13
- **Deciders:** Shahid Afridi, Claude

## Context
The CLI workflow shipped an editable source zip and, for Dev Diary, runnable example code. In YumeTuli,
edits happen through feedback runs and the engine keeps the project files.

## Decision
Claude produces the MP4 and the thumbnail only. No source zip, no example code. The `RESULT` line has
`mp4`, `thumb`, `duration`.

## Consequences
- Builds are faster and storage smaller. Code shown on screen must still be correct.
