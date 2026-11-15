---
description: Deps, Docker, CI, config, docs or tiny tweaks — light spec with a verification command.
argument-hint: "<change>"
---

Chore: $ARGUMENTS

1. Light spec (type Chore): what changes and why, risks, and the **verification command**
   (`make check`, `docker compose build`, `make ui-check P="…"`, a CI run…). Ask if anything is unclear.
2. Small changes may skip Gate 1 if the owner already described them exactly; otherwise present and **STOP.**
3. Do the change (lead may do it alone). Run the verification command and `make check`.
4. **⛔ Gate 2.** Show what changed and the verification output. **STOP.** Handoff in the spec + commit.
