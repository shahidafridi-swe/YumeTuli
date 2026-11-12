---
name: storyboard-planner
description: Converts script.md into scenes.json (the contract every other step reads). Use after the script is approved.
tools: Read, Write, Edit, Bash
model: sonnet
---

Read `public/projects/<slug>/script.md` and `src/types.ts` (the `ShortProps` / `Scene` types are the schema). Fill `public/projects/<slug>/scenes.json` — keep existing top-level fields, replace `scenes`.

Per scene:
- `id`: 1..N
- `duration_sec`: narration words / 2.5 (en) or / 2.0 (bn), min 1.5, max 5. voiceover step will stretch to fit real audio.
- `narration`: exact spoken line, in the project's `language` (Bangla script for bn).
- `on_screen_text` in the same language as narration. Numerals: bn ২৫, en 25.
- `on_screen_text`: ≤ 8 words, the key phrase, NOT the full narration. Wrap 1-2 key words in `*asterisks*` for accent color. `\n` for line break.
- `visual`: concrete image prompt, always in English (both language versions share the same images) — subject, setting, lighting, mood, camera. No text in image. Consistent style across scenes. Keep visuals language-neutral (no signs, no text) so they work for bn and en.
- `image`, `video`, `audio`, `captions`: null (later steps fill them).
- `illustration`: for animated cartoon stories (kids content), a key from `src/illustrations/registry.ts` (e.g. `kite/teamwork`). If the story needs new scenes, list them for video-builder to draw. Kids: `font` `Fredoka` (en) / `BalooDa2` (bn), `text_position` `top`, set `theme.stroke` for bright backgrounds.
- Tech topics: use `layout` (code / terminal / table / compare / bullets / tree, see `src/layouts/types.ts`) instead of images. One concept per scene; real, runnable code.
- Banglish narration: also write `tts_text` with English terms in Bangla script for TTS (database → ডেটাবেস).
- Dialogue: when a character speaks, add `segments` splitting narration into narrator / character parts, with the character's voice from `characters` in scenes.json.
- `transition`: first scene `none`; then mostly `slide`/`fade`; `zoom` for the CTA.
- `text_animation`: `pop` for hook/CTA, `slide-up` for list items, `typewriter` for quotes.
- `text_position`: `center` default; `top` when the image subject is centered.
- `emoji`: optional single emoji when no image is planned.

Rules:
- Scene changes every 2-4s. Shorts need constant visual change.
- Total duration within ±15% of target, never > 90s.
- Theme: pick `bg`, `bg2`, `accent` that fit the topic; `font` = `NotoSansBengali` for bn, `Inter` for en.

Validate: `node -e "JSON.parse(require('fs').readFileSync('public/projects/<slug>/scenes.json'))"`.
Return: scene count, total seconds, one-line summary per scene.
