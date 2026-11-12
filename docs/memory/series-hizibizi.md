---
name: series-hizibizi
description: hizibizi "Why Is That?" kids-science series — episodes done, style rules, what the next episode must include
metadata:
  type: project
---

Kids science shorts, Bangla, full-screen SVG animation (no image API). Folder `hizibizi/` everywhere.

Done (as of 2026-11-12): zipper, sorbot, spoon (concave-mirror). None has an outro.

Rules:
- Full-screen default ([[hizibizi-fullscreen]]); template `src/stories/hizibizi/spoon/`; helpers in `src/stories/hizibizi/common.tsx`.
- Centring: `StagePage` SHIFT, `theme.logo_top: 141`, `theme.caption_bottom: 145` ([[vertical-centering]]).
- Logo `brand/hizibizi-logo.png`, transparent, top-right, no plate ([[logo-as-given]]).
- SFX: `scripts/zip-sfx.py` events JSON → wav as project `music`.
- Thumbnails: `src/thumbs/HizibiziThumbs.tsx`, `npm run thumbs:hizibizi`.
- **Next episode: add `"outro": "hizibizi"`** — user asked for it from the next hizibizi video onward.
- Characters must be original.

Related: [[video-request-workflow]], [[brand-outro]].
