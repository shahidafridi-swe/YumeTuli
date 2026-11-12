---
name: logo-as-given
description: "Use the user's logo files exactly as supplied (keep transparent background) — no added plates, boxes or backgrounds behind them"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 4baa7f64-a170-4aa5-be5a-051ac3d2d940
  modified: 2026-11-11T11:34:13.858Z
---

When the user supplies a logo (Dev Diary white, hizibizi black — both transparent PNGs), place it as-is with its transparent background. Do not add a white plate/box behind it. If contrast is a problem, move the logo onto a calm area (e.g. the margin above a stage card) instead of adding a background.

**Why:** I added a white plate behind the hizibizi logo; the user objected: "ami to transparent background dici, oi transparent bg rakho".

**How to apply:** logos go top-right on every video (`scenes.json` `"logo"`), no `logo_plate`. See [[vertical-centering]].
