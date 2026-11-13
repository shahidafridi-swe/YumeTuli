---
name: brand-outro
description: "Every NEW video ends with the house brand outro — main video fades to charcoal, then cream logo outro fades in (Dev Diary or hizibizi)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 4baa7f64-a170-4aa5-be5a-051ac3d2d940
  modified: 2026-11-12T07:44:06.697Z
---

Every new video gets the brand outro at the end: the main video fades out to dark charcoal (#141318), then the 4 s logo outro fades in — cream (#F3E9D7) logo on charcoal. One format for all videos.

- Dev Diary videos (design patterns, tech): `"outro": "devdiary"` in scenes.json.
- hizibizi videos: `"outro": "hizibizi"`.
- Standalone files: `npm run outro` → `out/brand/dev-diary/`, `out/brand/hizibizi/` (MP4 + transparent ProRes).

**Why:** User asked (2026-11-12) for one dark-bg/cream-text outro "sob video er last e", fade-out → fade-in. Older videos (Strategy 1–3, hizibizi zipper/sorbot/spoon) were deliberately NOT changed; Observer Part 1 got it. "porer gula te sob gulatei add korba", and hizibizi's version is to be added from the next hizibizi episode.

2026-11-13: in YumeTuli the outro belongs to the **project** (channel). Options per project: built-in/custom animation (Claude designs one per logo, `src/brand/custom`), common logo animation (any logo tinted cream), uploaded outro video, or none. The owner sees and changes it on the project page.

**How to apply:** Set `outro` when creating every new project's scenes.json; don't retrofit old videos unless asked. Code: `src/brand/BrandOutro.tsx`, fade in `src/Short.tsx`. Related: [[logo-as-given]], [[vertical-centering]].
