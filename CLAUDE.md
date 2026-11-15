# CLAUDE.md — YumeTuli

Root agent guide. **Read this before editing anything.** `api/`, `web/` and `engine/` each have their own
`CLAUDE.md` with local rules — read the one nearest the file you are changing too.

## What this repo is

YumeTuli is the owner's personal web studio for short videos: write the context, add the script and voice,
Claude plans and builds the video, the owner reviews, downloads, and (later) schedules posts.
Single owner, runs locally in Docker with the owner's Claude subscription.

| Part | Role |
|------|------|
| `web/` | Next.js 16 UI + BFF (the only thing the browser talks to) |
| `api/` | Laravel 13 API, queue worker jobs, Reverb events, MySQL |
| `engine/` | Remotion video engine; Claude builds videos here (worker runs `claude -p`) |
| `docker/`, `docker-compose.yml` | the stack (web, api, worker, reverb, mysql) |

**What's done and what's next: `docs/ROADMAP.md`** (read it when the owner asks what is left or before
starting new work). Plan and phases: `docs/PLAN.md`. Decisions: `docs/adr/`. Video house rules:
`engine/AGENTS.md` + `docs/memory/`.

## The six invariants (non-negotiable)

1. **Browser → BFF only.** The browser calls Next.js (`/api/*` route handler, server actions) — never
   Laravel directly, except signed media links. The JWT lives only in the httpOnly cookie. (ADR-0002)
2. **Claude stays in its sandbox.** Only the worker runs Claude, from `/engine`, with a clean environment
   (no app secrets), the tool allowlist and the headless system prompt. Nothing outside the engine is
   edited by a run; output files come only through the `RESULT` line and are path-checked. (ADR-0004)
3. **Files go through the media disk.** Uploads, renders, logos and outros use
   `Storage::disk(config('yumetuli.media_disk'))` and signed URLs — so local → MinIO is a config change.
4. **Tests never touch the real world.** sqlite `:memory:` (TestCase refuses anything else),
   `Storage::fake('media')`, `Queue::fake()` where needed, `tests/Fixtures/fake-claude` for runs.
   A real Claude run or real render happens only when the owner agrees.
5. **One visual language.** Black, white and greys only; light, dark and system theme; works at 390 px;
   every user-facing string through i18n. Status is icon + text, never colour.
6. **Video house rules hold.** Centring, logos as given, project outro, captions max 2 lines,
   format-aware layout, deliverables = video + thumbnail. Shared engine changes must leave existing
   episodes identical. (`engine/AGENTS.md`, ADR-0007/0008/0009)

If a change would violate one of these, stop and reconsider — or write an ADR first.

## Workflow discipline (how you work on ANY task)

Mandatory for every task, bug or feature:

1. **Never assume. Work from a spec.** No spec → write one (`docs/specs/0000-template.md`) and get it
   approved before code. Anything ambiguous → **stop and ask the owner.** If you must proceed on an
   inference, state it and flag it.
2. **Two hard human gates, never skipped.** (a) The owner approves the **test cases** before any
   implementation code. (b) The owner approves the **finished work** before it is done.
3. **KISS — Keep It Simple and Sound.** Smallest thing that fully meets the spec. No speculative
   abstraction, options or layers. Simple never excuses skipping correctness, tests or the invariants.
4. **One task at a time.** T1, T2, … in order: that task's failing test first, green, verify, next.

Start every task with its slash command — `/feature` `/bug` `/refactor` `/hotfix` `/chore` `/spike`.
Full contract: `docs/specs/README.md`.

## Repo map

```
web/                 Next.js app — CLAUDE.md
api/                 Laravel app — CLAUDE.md
engine/              Remotion engine — CLAUDE.md / AGENTS.md (video rules)
docs/ROADMAP.md      done / next / follow-ups (keep updated)
docs/PLAN.md         phases and milestones
docs/specs/          per-task specs + workflow contract (README.md)
docs/adr/            architecture decisions
docs/instructions/   agent reference files
docs/memory/         video house rules learned in ai-video
scripts/             QA screenshots, read-only DB user, MCP wrapper
.claude/             agent settings, slash commands, subagents
```

## Common commands

```bash
make up            # start the stack
make check         # pint --test + eslint + tsc (web, engine) + Laravel tests — run before committing
make test-api F=…  # one Laravel test
make ui-check      # screenshots light/dark/mobile → out/ui-check/
make restart-worker  # after PHP changes
```

## Always-on rules

@docs/instructions/conventions.md
@docs/instructions/comment-style.md
@docs/instructions/communication-style.md

## Read when the task touches it (not preloaded)

- "What's left?" / choosing the next task → `docs/ROADMAP.md`.
- Starting any task → `docs/specs/README.md`, then `docs/instructions/workflow.md`.
- Stack, services, commands → `docs/instructions/stack-and-commands.md`.
- Slash command catalog → `docs/instructions/slash-commands.md`.
- Laravel work → `api/CLAUDE.md` (+ `/new-endpoint`).
- UI work → `web/CLAUDE.md` (+ `/new-page`, `/ui-check`, `ui-designer` agent).
- Engine/video work → `engine/CLAUDE.md` and `engine/AGENTS.md`.
- Claude run prompts/allowlist → `api/resources/prompts/`, `api/config/yumetuli.php`.
- Architectural decision → `/adr`. Self-review → `reviewer`, `/review-loop`, `/review-invariants`, `/security-review`.
- Database questions → the `mysql-readonly` MCP server (SELECT-only; `make db-readonly-user` once).

## Git
- Commit with the repo-local personal identity. Never `git push` without the owner asking.
- Never commit `.env`, media, `engine/out/`, `engine/public/brand/projects/`.
