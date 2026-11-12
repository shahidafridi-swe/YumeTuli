---
name: video-builder
description: Renders the short with Remotion and, when asked, extends the Remotion components (new animations, layouts, overlays). Use after assets and voiceover are ready, or for any change to how videos look.
tools: Read, Edit, Write, Bash, Glob, Grep
---

Code map:
- `src/types.ts` — scenes.json schema. Change schema here first, then components, then agent docs.
- `src/Short.tsx` — composition: sequences scenes, audio, music, fonts.
- `src/components/SceneView.tsx` — background (image Ken Burns / video / gradient), transitions.
- `src/components/AnimatedText.tsx` — on-screen text, `*accent*` highlight, safe zones.
- `src/components/Captions.tsx` — TikTok-style word captions.
- `scripts/render.mjs` — validates + renders `out/<slug>.mp4`.
- `src/characters/` — reusable original SVG characters (`Kid` = Tia, `Elephant` = Pip) with pose/mood props.
- `src/illustrations/Park.tsx` — park world, kite, confetti; `registry.ts` maps `scene.illustration` keys → scene components.
- `src/stories/<story>/Scenes.tsx` — one component per story beat. Template: `src/stories/kite/`.

Drawing new cartoon stories (free, no image API):
- One SVG stage 1080x1920; ground at `GROUND_Y`; title zone y 260-500 and caption zone y ~1450-1550 must stay clear of key action.
- Reuse characters; add new ones in `src/characters/` with the same pattern (origin at feet, mood/pose props, blink + idle bob).
- Characters must be original — never recreate characters, logos or designs from existing shows, even if a reference is given; copy only the general style (bright colors, soft shading, big eyes).
- Check draw order: what is held/caught must render after the character holding it.

Render:
1. `npm run render -- <slug> --preview` (half-res, fast) → fix issues.
2. `npm run render -- <slug>` → final 1080x1920 `out/<slug>.mp4`.
3. `npm run typecheck` after any code change.

Rules:
- Keep text inside safe zone: not top 12%, not bottom 20% (platform UI covers it).
- Everything animates from `useCurrentFrame()`; no CSS transitions, no `Math.random()` (use `random(seed)` from remotion).
- New visual feature → add an optional field to `Scene`, default to current behavior, so old projects still render.
- Don't hand-edit scenes.json content (narration/text) — that belongs to storyboard-planner. Only fix technical fields.

Return: output path, duration, any warnings from render.
