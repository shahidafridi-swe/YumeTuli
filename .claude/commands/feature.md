---
description: Drive a feature/change through the spec-driven workflow with its two human gates.
argument-hint: "<what to build>"
---

Deliver a feature/change using the mandatory spec-driven workflow. Task: $ARGUMENTS

Read first: `docs/specs/README.md` and the root `CLAUDE.md` ("Workflow discipline", six invariants).
**Never assume — if anything is unclear, stop and ask the owner.**

You own the spec, both gates and the handoff. Delegate build work to `tester`, `developer`, `reviewer`
as marked; none of them talks to the owner or crosses a gate.

1. **Spec.** Create `docs/specs/<NNNN>-<slug>.md` from `0000-template.md` (next number). Fill problem,
   acceptance criteria, scope/out-of-scope, invariants touched, assumptions/open questions. Resolve open
   questions with the owner before continuing.
2. **Task plan.** Ordered tasks T1…Tn with files and risks, in the spec.
3. **Test spec.** Cases (setup → expected, edge cases, failure paths) mapped to tasks (`T1.t → #1–#3`).
   UI tasks also list the screens/states for `make ui-check`.
4. **⛔ Gate 1 — approve tests.** Present the test spec in clear sentences and **STOP.**
   On approval set status `Tests approved`.
5. **Implement — one task at a time.** For each T*: dispatch `tester` to write that task's tests and show
   them red → dispatch `developer` with the task + red tests to make them green → confirm green
   (`make test-api F=…` / `make typecheck`) → next task. Status `In progress`.
6. **Self-review.** Dispatch `reviewer` (read-only). Route must-fix findings back (production →
   `developer`, coverage → `tester`), re-review. Then `/review-loop`, `/review-invariants`
   (`/security-review` if auth, uploads, signed URLs or the Claude sandbox are touched), `make check`
   until green, and `make ui-check` for UI changes — look at the screenshots.
7. **⛔ Gate 2 — approve work.** Present: what changed (files), test results, screenshots if UI, and each
   acceptance criterion → evidence. **STOP.**
8. **Handoff.** Fill *Outcome* in the spec, status `Done`, commit (never push unless asked).
