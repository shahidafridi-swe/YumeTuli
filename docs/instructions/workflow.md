# Workflow (detail)

The binding contract is `docs/specs/README.md`; this file is the quick reference.

1. Run the slash command for the task type: `/feature` `/bug` `/refactor` `/hotfix` `/chore` `/spike`.
2. **Spec** in `docs/specs/<NNNN>-<slug>.md` from `0000-template.md`. Ask about anything unclear.
3. **Task plan** (T1, T2, …) with the files each touches.
4. **Test spec**: table of cases mapped to tasks (`T1.t → #1–#3`).
5. ⛔ **Gate 1**: owner approves the test spec. Stop and wait.
6. **Implement one task at a time**: `tester` writes that task's tests (red) → `developer` makes them
   green → confirm, then next task.
7. **Self-review**: `reviewer` (spec + invariants), then `/review-loop` (codex-reviewer ↔ review-fixer),
   then `make check` until green. UI changes also need `make ui-check` screenshots looked at.
8. ⛔ **Gate 2**: present the diff summary, test results, screenshots, criterion → evidence. Stop and wait.
9. **Handoff**: fill *Outcome* in the spec, status `Done`, commit (never push without asking).

## Spec mechanics
- Number = highest existing + 1, zero-padded to 4. Kebab-case slug.
- Status: `Draft → Tests approved → In progress → Done` (or `Blocked` / `Abandoned` with a reason).
- Keep the spec truthful: record deviations and follow-ups; never rewrite history to look clean.

## What counts as a test here
| Area | Automated proof | Extra evidence |
|------|-----------------|----------------|
| `api/` | PHPUnit feature tests (`make test-api F=…`) | — |
| `web/` | `make typecheck` + `make lint` | `make ui-check` screenshots (light, dark, 390 px) |
| `engine/` | `make typecheck` | render + frame check; unchanged episodes compared with SSIM |
| Claude runs | fake-claude feature tests | one real run only when the owner agrees (uses the subscription) |

## Commits
- Small, one task or one logical change. Message: what changed and why, in English.
- End with the `Co-Authored-By` line the session gives. Personal git identity is set repo-locally.
