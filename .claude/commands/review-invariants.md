---
description: Check the current diff against the six invariants and the KISS rule.
---

Review the current diff (`git diff` + `git diff --staged`, or the range the owner names) against the root
`CLAUDE.md` invariants. For each, say **OK** or give the finding with file:line and the fix.

1. **Browser → BFF only.** No browser code calls Laravel directly or touches the JWT; new client calls go
   through `src/lib/api.ts`; media uses signed URLs.
2. **Claude sandbox.** Clean env kept; allowlist not widened without reason; prompts in
   `resources/prompts/`; any path from Claude resolved inside the engine; nothing outside `/engine` edited.
3. **Media disk.** No hard-coded disk/path; `Storage::disk(config('yumetuli.media_disk'))`; signed URLs.
4. **Tests isolated.** No test can reach MySQL, real storage, real Claude, or the network.
5. **Visual language.** No colour classes; light + dark + 390 px; all strings via i18n; status = icon + text.
6. **Video rules.** Format-aware (no 1080/1920 literals), outro/logo from the project, deliverables =
   video + thumbnail, old episodes unchanged.

**KISS pass:** list every abstraction, option, layer or file the spec did not ask for — each is a finding.
End with: `INVARIANTS: clean` or `INVARIANTS: <n> findings`.
