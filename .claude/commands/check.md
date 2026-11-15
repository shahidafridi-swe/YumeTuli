---
description: Run the quality gate (make check) and fix what fails.
---

Run `make check` (pint --test, eslint, tsc for web + engine, Laravel tests).

- If Pint fails: run `make fmt`, show the diff.
- If tests, types or lint fail: quote the shortest decisive error line, fix the cause (not the test,
  unless the test is wrong — then say so and ask), re-run until green.
- Report the final result honestly. Never claim green without seeing it.
