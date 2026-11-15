# Slash commands

Defined in `.claude/commands/`. Start every task with one of the workflow commands.

| Command | Use for |
|---------|---------|
| `/feature <task>` | New feature or change — full spec workflow, two gates |
| `/bug <report>` | Bug: investigate root cause, failing repro test, fix |
| `/refactor <goal>` | No behaviour change; characterization tests first |
| `/hotfix <incident>` | Production/stack broken: expedited gates, follow-up spec required |
| `/chore <change>` | Deps, Docker, CI, config, docs, small tweaks: lighter spec, verification command |
| `/spike <question>` | Time-boxed research → findings + recommendation (maybe an ADR) |
| `/check` | Run `make check` and fix what fails |
| `/review-loop` | codex-reviewer ↔ review-fixer loop on the diff |
| `/review-invariants` | Check the diff against the six invariants + KISS |
| `/security-review` | Auth, secrets, uploads, signed URLs, Claude sandbox |
| `/adr <decision>` | Record an architecture decision in `docs/adr/` |
| `/new-endpoint <what>` | Laravel endpoint: route, request, resource, lang, tests |
| `/new-page <what>` | Next.js page: thin page + client component, i18n, B&W, Suspense |
| `/ui-check [paths]` | Screenshots light/dark/mobile and look at them |
| `/merge-conflict` | Resolve a merge/rebase conflict safely |

Engine video work (making an episode by hand in the CLI) keeps using `engine/.claude` (`/make-video`).
