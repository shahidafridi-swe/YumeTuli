---
name: project-bilingual-shorts
description: ai-video project goal — user makes vertical shorts/reels in both Bangla and English with Claude Code / Codex
metadata:
  node_type: memory
  type: project
  originSessionId: 4baa7f64-a170-4aa5-be5a-051ac3d2d940
  modified: 2026-11-10T11:00:49.570Z
---

User builds AI shorts/reels (9:16) in both Bangla (bn) and English (en), driven by Claude Code and Codex. Scaffolded 2026-11-10: Remotion + agent pipeline, bn/en pairs share images (localize after asset generation).

2026-11-10 pivot: user dropped kids cartoons (2D/3D) and now wants software-engineering explainer shorts in Banglish (Bangla script + English tech terms). Approved Bangla TTS voices: bn-IN-TanishaaNeural, bn-IN-BashkarNeural.

2026-11-11 onward: user records own voice in ElevenLabs (preferred over edge-tts); current output is Bangla only for two series — [[series-dev-diary]], [[series-hizibizi]]. en support must still keep working.

**Why:** user explicitly wants both languages, not Bangla only; cost-conscious (free edge-tts default, paid steps gated).
**How to apply:** any new feature must work for both `language: bn` and `en` (fonts, TTS voice, validation, captions). User writes in Banglish — reply in Banglish.
