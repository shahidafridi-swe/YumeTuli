---
description: Expedited fix when the stack or a live feature is broken. Follow-up spec is mandatory.
argument-hint: "<incident>"
---

Hotfix: $ARGUMENTS

1. Stabilise first if needed (`make ps`, `make logs S=…`, restart the broken service) and tell the owner.
2. Minimal spec (type Hotfix): symptom, cause, smallest fix. A failing repro test where possible.
3. **⛔ Gate 1 (expedited):** ask for a quick "go" on the fix plan.
4. Fix, `make check`, verify the symptom is gone.
5. **⛔ Gate 2 (expedited):** show the evidence.
6. Create the follow-up `/bug` or `/feature` spec (root cause, prevention) and link it. Commit.
