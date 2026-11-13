---
name: video-request-workflow
description: Standard steps + deliverables checklist for every new episode request (voice mp3 + script → MP4, source zip, thumbnail)
metadata:
  type: feedback
---

Every episode request = voice mp3 (+ script). Do all of this without being asked:

1. Save recording to `recordings/<series>/`, project at `public/projects/<series>/<slug>-bn` (nested slug). Scene code in `src/stories/<series>/<topic>/`, register in `src/illustrations/registry.ts`.
2. scenes.json: logo, theme, `"outro"` ([[brand-outro]]), `max_duration_sec` if >90s.
3. `npm run import-voice -- <slug> <mp3> --cuts=...` (cuts snapped to real pauses, never mid-phrase).
4. `npm run align-captions -- <slug>`; fix garbled/dropped Whisper ranges with `scripts/splice-words.sh`; numbers need NUM_WORDS map in align-captions.
5. Captions: max 2 lines, synced to voice, no expression tags.
6. Render `npm run render -- <slug>`, QA with contact-sheet frames: centring, overlaps, caption lines, last frames/outro. Loudness ~ −16.5 LUFS.
7. Deliverables to `out/<series>/`: `<slug>.mp4` and the thumbnail in `out/<series>/thumbs/` (thumbs file in `src/thumbs/`, Still in `src/Root.tsx`, same centring rule). **No source zip and no example code** (user, 2026-11-13: "code er dorkar nai, video r thumbnail holei hobe").
8. Report in Banglish: paths, scene flow, length, what was verified.

**Why:** user expects video + thumbnail every time. Earlier they asked for an editable source zip; on 2026-11-13 they dropped zip and example code.
**How to apply:** treat this as the default checklist; ask nothing that this answers. Related: [[user-profile]].
