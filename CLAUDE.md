# YumeTuli

Plan and milestones: `docs/PLAN.md`. Video house rules: `docs/memory/` (read MEMORY.md index first).
Video engine rules: `engine/AGENTS.md` (applies when working inside `engine/`).

- Stack: Next.js (`web/`), Laravel 13 (`api/`), MySQL 8, Docker Compose. Storage: local disk now, MinIO later.
- Single owner user. UI English, all strings through i18n (next-intl / Laravel lang files).
- Design: black, white and greys only; light + dark + system theme.
- Secrets only in `.env`; never commit or print them.
- Git: commit as the personal account (repo-local config); never push without asking.
