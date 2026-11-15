# 0001 — Agentic development setup

- **Type:** Chore
- **Status:** Done
- **Owner:** Shahid Afridi
- **Created:** 2026-11-15
- **Links:** reference: the owner's `robi-agent-insight` repo; ADR index `docs/adr/README.md`

## Problem / goal
Give YumeTuli the same agentic development setup as the reference project, so any Claude/Codex session
follows one spec-driven workflow with human gates, shared rules, subagents and guardrails.

## Acceptance criteria
- [x] Root `CLAUDE.md` (six invariants, workflow discipline, map, commands) + `AGENTS.md` pointer; per-app `CLAUDE.md` for `api/`, `web/`, `engine/`.
- [x] `docs/specs/README.md` (lifecycle, two gates, delegation, task variants) + `0000-template.md`.
- [x] `docs/adr/` with template and ADR-0001…0009 recording the decisions made so far.
- [x] `docs/instructions/`: conventions, comment style, communication style, workflow, stack & commands, slash commands.
- [x] Slash commands: feature, bug, refactor, hotfix, chore, spike, check, review-loop, review-invariants, security-review, adr, new-endpoint, new-page, ui-check, merge-conflict.
- [x] Subagents: tester, developer, reviewer, ui-designer, codex-reviewer, review-fixer.
- [x] `.claude/settings.json` guardrails (allow make/test/read-only git; deny rm -rf, push, hard reset, volume removal, secret files).
- [x] `Makefile` entry point (`make check` = pint --test + eslint + tsc web/engine + Laravel tests; `make ui-check`; …).
- [x] GitHub Actions CI (path-filtered api / web / engine).
- [x] Read-only MySQL MCP server (SELECT-only user without secret tables/columns + server writes disabled).

## Scope
**In scope:** documentation, agent config, Makefile, scripts, CI, MCP. **Out of scope:** product features,
a web unit-test runner, pre-commit hooks.

## Invariants touched
Defines them. Security: the MCP user cannot read sessions, tokens, jobs or password hashes; secrets stay in `.env`.

## Test spec
| # | Check | Expected |
|---|-------|----------|
| 1 | `make check` | passes |
| 2 | `make ui-check P="/projects"` | light, dark, 390 px screenshots written |
| 3 | `make db-readonly-user`, then SELECT / DELETE / `users.password` / `sessions` as `yumetuli_ro` | SELECT works; the rest denied |
| 4 | MCP handshake + `mysql_query` SELECT and DELETE | SELECT returns rows; DELETE refused by the server |
| 5 | `ci.yml` parses as YAML | valid |

**Verification command:** `make check`

---

## Outcome / handoff
- **What was built:** everything in the acceptance criteria. All five checks passed on 2026-11-15.
- **Deviations:** `Makefile` instead of Taskfile (owner's choice). Web has no unit runner; UI is verified
  with `make ui-check` screenshots. Engine/video work keeps its own `engine/.claude` (`/make-video`).
- **Follow-ups:** watch the first CI run on GitHub. Optional later: a pre-commit `/review-loop --staged`
  hook, and a web test runner if UI logic grows.
