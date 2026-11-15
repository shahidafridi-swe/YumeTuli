---
description: Record an architecture decision in docs/adr/.
argument-hint: "<decision>"
---

Record a decision: $ARGUMENTS

1. Read `docs/adr/README.md` and the related ADRs. If this changes an accepted decision, the new ADR
   **supersedes** it (link both ways; never rewrite the old decision).
2. Create `docs/adr/<NNNN>-<slug>.md` from `0000-template.md`: context (forces, options), decision,
   consequences. Status `Proposed`.
3. Present it to the owner in full sentences. On approval set `Accepted` and add it to the README table.
