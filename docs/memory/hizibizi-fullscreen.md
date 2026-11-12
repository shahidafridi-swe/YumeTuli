---
name: hizibizi-fullscreen
description: "hizibizi \"Why Is That?\" episodes are full-screen by default — no card/box/border/panel around the animation; shadow-style captions over the scene"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 4baa7f64-a170-4aa5-be5a-051ac3d2d940
  modified: 2026-11-11T12:42:03.700Z
---

All hizibizi episodes use the full-screen style: the animation fills the whole 1080×1920 frame from first to last frame. No card, box, slide, phone mockup, bordered panel, padding or black bars. Captions sit directly on the scene with a soft text shadow (`theme.caption_style: "shadow"`), max 2 lines, never covering the key visual.

**Why:** User asked for full-screen in episode 3 (spoon), then had episodes 1 (zipper) and 2 (sorbot) converted and said to make it the default (2026-11-11).

**How to apply:** Draw backgrounds that overscan the frame (they get shifted down to centre the focus), keep the focus in the middle per [[vertical-centering]], logo top-right as given per [[logo-as-given]]. Template: `src/stories/hizibizi/spoon/Scenes.tsx`; `StagePage` in `src/stories/hizibizi/common.tsx` is full-screen by default.
