# <NNNN> — <Title>

- **Type:** Feature | Bug | Refactor | Hotfix | Chore | Spike
- **Status:** Draft <!-- Draft → Tests approved → In progress → Done | Blocked | Abandoned -->
- **Owner:** Shahid Afridi
- **Created:** <YYYY-MM-DD>
- **Links:** <related specs, ADRs, PLAN section>

## Problem / goal

What are we solving and why? For a **bug**: expected vs actual and how to reproduce.
Written for someone with no prior context.

## Acceptance criteria

Concrete, checkable statements. Done when all are true.

- [ ] …

## Scope

**In scope:** …

**Out of scope:** … (name what you are deliberately *not* doing)

## Invariants touched

Which of the six invariants (root `CLAUDE.md`) does this touch, and how is each preserved?
(BFF-only browser access, Claude sandbox, media disk, fake externals in tests, B&W + i18n UI,
video house rules.) "None" is a valid answer — say so.

## Assumptions & open questions

Must be resolved or explicitly accepted before Gate 1.

- [ ] Q: … → A: …

## Task plan

Ordered tasks and the files each touches.

1. **T1** — … (`api/…`, `web/…`)

## Test spec  <!-- Gate 1: the owner approves this before any implementation code -->

| # | Task | Scenario | Setup / input | Expected result |
|---|------|----------|---------------|-----------------|
| 1 | T1 | … | … | … |

UI states to screenshot (light, dark, 390 px): …

**Verification command:** `make check` (plus `make ui-check P="…"` for UI)

---

## Outcome / handoff  <!-- filled after Gate 2 -->

- **What was built:** …
- **Deviations from spec (and why):** …
- **How each acceptance criterion is met:** …
- **Follow-ups / tech debt:** …
