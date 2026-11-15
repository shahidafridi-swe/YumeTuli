---
description: Screenshot pages in light, dark and mobile and inspect them.
argument-hint: "[paths, e.g. / /videos/14]"
---

Run `make ui-check P="$ARGUMENTS"` (default paths if empty). Then open every screenshot in `out/ui-check/`
with the Read tool and check: layout at 1280 and 390 px, dark mode contrast, no overflow or clipped text,
no colour, loading/empty states sensible, console errors printed by the script. Report issues per page
with the fix; say plainly if everything looks right.
