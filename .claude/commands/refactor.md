---
description: Refactor without behaviour change — characterization tests first, two gates.
argument-hint: "<what and why>"
---

Refactor: $ARGUMENTS

Read `docs/specs/README.md` (`/refactor` variant). No behaviour change allowed.

1. Spec (type Refactor): what behaviour is preserved, why the refactor is worth it, scope.
2. Test spec: characterization tests pinning current behaviour (must pass before *and* after). Engine
   refactors: list episodes to re-render and compare (SSIM ≈ 1.0).
3. **⛔ Gate 1.** **STOP.**
4. `tester` writes/runs characterization tests (green now). `developer` refactors one task at a time;
   tests stay green.
5. Self-review: `reviewer` (hunt for behaviour drift and over-engineering), `/review-loop`, `make check`.
6. **⛔ Gate 2.** Show unchanged results. **STOP.** Handoff + commit.
