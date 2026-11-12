---
name: series-dev-diary
description: Dev Diary design-pattern series — episodes done so far, visual style per pattern, code rules, runnable source
metadata:
  type: project
---

Design patterns in PHP/Laravel for beginners, Bangla voice. Folder `design-patterns/` everywhere (projects, src/stories, recordings, out).

Done (as of 2026-11-12): strategy-p1, p2, p3 (navy/teal, white logo); observer-p1 (weather station, plain PHP `source/weather.php`), observer-p2 (Laravel OrderPlaced event, 3 listeners, orders #1042/#1043; first with outro).

Rules:
- 3–5 PHP lines per shot, narrated line highlighted; highlight label goes in the CodePanel header ("L{n} · label"), never over code.
- Observer style: ivory `#FAF7EF`, charcoal text, plum = observer link, burnt orange = data chip; black logo `brand/dev-diary-logo-black.png`; no theme.stroke.
- Tech layout centring: `theme.title_top`/`caption_bottom` ~300 + per-scene `content_offset` ([[vertical-centering]]).
- Source zip must be runnable and verified. Laravel: fresh Laravel 13 app, listeners via event discovery only (no `Event::listen`, else double-run), feature tests, artisan demo command, README; ship without vendor. Code on screen = code in source.
- Next parts continue the series (likely Part 3 of Observer or a new pattern); recap previous part where useful.

Related: [[video-request-workflow]], [[brand-outro]].
