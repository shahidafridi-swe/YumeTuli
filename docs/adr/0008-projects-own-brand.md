# ADR-0008 — Projects (channels) own the logo and outro

- **Status:** Accepted
- **Date:** 2026-11-13
- **Deciders:** Shahid Afridi, Claude

## Context
Logo and outro were hidden fields on series. The owner runs separate channels (Dev Diary by Afridi,
hizibizi), each with several series, and wants to see and change the logo and outro.

## Decision
- `projects` table: one per channel/page, with logo (+ optional light-background variant) and outro.
  Series belong to a project; videos inherit brand through their series.
- Outro modes: `common` (any logo tinted cream, house animation), `custom` (animation Claude designs,
  `engine/src/brand/custom`), `video` (uploaded file), `none`. Built-in Dev Diary/hizibizi outros are custom keys.
- The worker copies brand files into `engine/public/brand/projects/<slug>/` (generated, git-ignored) and
  renders vertical + landscape previews.

## Consequences
- Social accounts (Phase 2) attach to projects.
- Custom outro code and its sound are committed in the engine; brand file copies are not.
