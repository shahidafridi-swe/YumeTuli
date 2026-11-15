---
description: Resolve a merge/rebase conflict safely, keeping both sides' intent.
---

1. `git status` and `git diff --name-only --diff-filter=U` to list conflicted files.
2. For each file read both sides and the commits that introduced them (`git log --merge -p -- <file>`).
   Understand each side's intent before editing.
3. Resolve so both intents survive. Never drop the other side's change silently; if they truly conflict,
   stop and ask the owner which wins (full sentences).
4. Special cases: migrations → keep both, fix ordering; `package-lock.json`/`composer.lock` → take one side
   then reinstall in the container; `en.json` → merge keys.
5. `make check`. Show the resolution summary. Do not commit or continue the rebase until the owner says so.
