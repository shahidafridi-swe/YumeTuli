---
name: vertical-centering
description: Every video and thumbnail must keep content vertically centred with equal empty space above and below — never top-heavy with an empty bottom
metadata:
  node_type: memory
  type: feedback
  originSessionId: 4baa7f64-a170-4aa5-be5a-051ac3d2d940
  modified: 2026-11-11T11:34:13.651Z
---

Keep the main content (visuals, code, diagrams, zipper/stage, cards) vertically centred in the 1080×1920 frame so the empty space above (incl. logo) and below (incl. captions) is about equal. Content must never bunch near the top with a big empty band at the bottom.

**Why:** The user flagged this twice (strategy-p3 and hizibizi zipper): content rode high and the bottom ~20% looked empty. They asked to remember it for all future videos.

**How to apply:** (user had to repeat this a 3rd time on hizibizi sorbot — I reused the old card position without measuring)
- Measure the whole block: top margin = frame top → top of logo/badge; bottom margin = bottom of captions → frame bottom. These two must be ~equal (e.g. ~145px each). A centred card alone is not enough if logo sits at 56px and captions end high.
- hizibizi: `StagePage` in `src/stories/hizibizi/common.tsx` shifts the block by `SHIFT` (85); set `theme.logo_top: 141`, `theme.caption_bottom: 145`.
- Before calling a render done, check contact-sheet frames for top/bottom balance, not just overlaps.
- Tech videos: `theme.title_top` / `theme.caption_bottom` (~300/300) + per-scene `content_offset` to centre the visual between title and captions.
- Illustrated (hizibizi) videos are full-screen now — no stage card; centre the focus via `StagePage` SHIFT (see [[hizibizi-fullscreen]]).
- Thumbnails: same rule — centre the block; don't leave the bottom third empty.
- Related: [[logo-as-given]], [[project-bilingual-shorts]]
