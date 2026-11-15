# Roadmap & status

The living "what's done / what's next" list. Update it in every handoff (spec stage 8).
Details of each phase: `docs/PLAN.md`. Decisions: `docs/adr/`. Task records: `docs/specs/`.

_Last updated: 2026-11-15_

## Done

| When | What | Record |
|------|------|--------|
| 2026-11-12 | Phase 1 milestones 0–6: Docker stack, JWT auth, series/videos API, Claude runs (plan → approve → build → feedback), live progress (Reverb), web UI, acceptance build (spoon rebuilt from the browser) | `docs/PLAN.md` §10, ADR-0001…0006 |
| 2026-11-12 | Video format per video: vertical 9:16 / landscape 16:9 | ADR-0007 |
| 2026-11-13 | Projects (channels) with logo + outro (logo animation, Claude custom, upload, none) and previews; deliverables = video + thumbnail | ADR-0008, ADR-0009 |
| 2026-11-15 | Agentic development setup: spec workflow, agents, Makefile, CI, read-only MySQL MCP | spec 0001 |

## Next (in order — each starts with `/feature` and its own spec)

1. **Phase 2 — Media library + ready-made uploads**
   - Library page: all videos, thumbnails and voices, with filters by project, series and status.
   - Upload a ready-made video (made outside YumeTuli) for posting.
2. **Phase 2 — YouTube**
   - Connect a YouTube channel per **project** (OAuth).
   - Post now or on a schedule (`publishAt`): title, description, tags, privacy, thumbnail.
   - Post status and link, with retry on failure. The scheduler runs in Docker.
3. **Phase 3 — More platforms + calendar**
   - Facebook Page, Instagram, TikTok and LinkedIn per project (X optional, paid API).
   - Per-platform captions and hashtags, with AI suggestions.
   - Content calendar (month/week, drag to reschedule).
   - Cloudflare Tunnel where a platform needs a public HTTPS URL.
4. **Phase 4 — Later**
   - MinIO storage and analytics.
   - Script → voice with the ElevenLabs API.
   - One-click English version.
   - Caption editor.
   - Bangla UI (`bn.json`).
   - Template mode (faster videos from existing layouts).

## Known follow-ups (small; use `/chore` or `/bug`)

- **Engine files from runs are not committed automatically.** Each build adds files under `engine/` (project folder, scenes, registry). Decide: auto-commit per version, or keep committing by hand.
- **Run history shows few "turns" for resumed builds.** Claude's `num_turns` counts only the resumed part. Show the tool-call count instead.
- **Test data in the dev DB:** videos #13 "Cancel test" and #15 "Browser flow test" can be deleted. #14 "Spoon mirror test" is the acceptance video (in review).
- **The allowlist blocks shell redirection** (`> file`) and listing `/opt/venv`. Claude worked around both; widen only if it keeps happening.
- **Optional:** pre-commit `/review-loop --staged` hook; a web unit-test runner if UI logic grows.
