---
name: project-yumetuli
description: YumeTuli — user's web studio (Next.js + Laravel + MySQL, Docker) that will replace the CLI video workflow; plan in /home/shahid-afridi/AFRIDI/YumeTuli/docs/PLAN.md
metadata:
  type: project
---

Started 2026-11-12. Folder `/home/shahid-afridi/AFRIDI/YumeTuli` (separate project; ai-video stays untouched, YumeTuli gets its own copy in `engine/`).

User decisions:
- Stack: Next.js frontend, Laravel backend, MySQL, files on local disk now → MinIO later. Everything in Docker (`docker compose up` on any PC).
- Single user (only the owner). UI English now, built for i18n (more languages later).
- Design: black and white only, with light/dark mode.
- Runs locally with the user's Claude subscription: worker runs `claude -p` headless in `engine/`, Plan → Approve → Build, feedback via `--resume`.
- Later: social auto-posting with schedule (YouTube first, then FB/IG/TikTok/LinkedIn), upload ready videos, analytics.

**Why:** user wants to stop chatting in the CLI and drive video generation + posting from a UI.
**How to apply:** follow docs/PLAN.md milestones; ask approval before starting code (user prefers explain-first, [[user-profile]]). Related: [[video-request-workflow]].

Update 2026-11-12: Milestones 0–5 done (Docker, API with JWT, Claude runs, web UI). User asked for a format choice per video: vertical 9:16 (default) or landscape 16:9 — implemented end to end (scenes.json `format`, engine `src/format.ts`).
