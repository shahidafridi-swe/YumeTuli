---
description: Fix a bug — investigate the root cause, failing repro test first, two gates.
argument-hint: "<bug report>"
---

Fix a bug using the spec-driven workflow. Report: $ARGUMENTS

Read `docs/specs/README.md` (`/bug` variant). Never guess the cause.

1. **Reproduce and investigate.** Find the real root cause (logs: `make logs S=…`, DB via the
   `mysql-readonly` MCP, code). Write the spec (type Bug): steps, expected vs actual, root cause with evidence.
2. **Test spec:** the failing repro test(s) that fail *because of* the bug.
3. **⛔ Gate 1.** Present repro + root cause + test plan. **STOP.**
4. `tester` writes the repro test and shows it red. `developer` fixes until green with no regressions.
5. Self-review: `reviewer`, `/review-loop`, `make check` (and `make ui-check` if UI).
6. **⛔ Gate 2.** Present cause, fix, evidence. **STOP.**
7. Handoff: root cause, fix, prevention/follow-ups in the spec. Status `Done`. Commit.
