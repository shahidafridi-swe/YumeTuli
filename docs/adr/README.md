# Architecture decision records

One file per decision: `NNNN-kebab-title.md`, from `0000-template.md`. Use `/adr` to add one.
An ADR is never edited to change its decision — write a new ADR that supersedes it and link both ways.

| ADR | Decision | Status |
|-----|----------|--------|
| 0001 | Monorepo in Docker Compose, `make` as the entry point | Accepted |
| 0002 | JWT auth behind a Next.js BFF (httpOnly cookie) | Accepted |
| 0003 | FrankenPHP image for api, worker, reverb | Accepted |
| 0004 | Claude Code headless in the worker (subscription), Plan → Approve → Build | Accepted |
| 0005 | Engine is a copy of ai-video inside the repo | Accepted |
| 0006 | Own small i18n layer instead of next-intl | Accepted |
| 0007 | Video format per video (vertical 9:16 / landscape 16:9) | Accepted |
| 0008 | Projects (channels) own the logo and outro | Accepted |
| 0009 | Deliverables are the video and the thumbnail only | Accepted |
