# AI Shorts Factory

Vertical (1080x1920, 9:16) shorts/reels built with Remotion. LLM agents write the script, plan scenes, generate assets/voice, render and QA. Languages: Bangla (`bn`) and English (`en`); one topic can ship as a bn/en pair sharing the same images.

## Layout
- `public/projects/<slug>/` — one folder per video per language (`<topic>-bn`, `<topic>-en`): `script.md`, `scenes.json`, `assets/`, `audio/`
- `src/` — Remotion composition (`types.ts` = scenes.json schema)
- `scripts/` — CLI steps (new, voice, images, render, frames)
- `out/` — renders and QA frames (gitignored)
- `.claude/agents/*.md` — role instructions for each pipeline step (Codex: read the matching file before doing that step)

## Pipeline
| Step | Role file | Command |
|------|-----------|---------|
| 1 new project | — | `npm run new -- <slug> "Title" --lang=bn\|en` |
| 2 script | `.claude/agents/script-writer.md` | writes `script.md` |
| 3 storyboard | `.claude/agents/storyboard-planner.md` | writes `scenes.json` |
| 4 images (paid, shared by both languages) | `.claude/agents/asset-generator.md` | `npm run images -- <slug>` |
| 5 localize (only for bn+en pair) | `.claude/agents/localizer.md` | `npm run localize -- <slug> <bn\|en>` then rewrite text |
| 6 voiceover (per language) | `.claude/agents/voiceover-agent.md` | `npm run voice -- <slug>` |
| 7 render | `.claude/agents/video-builder.md` | `npm run render -- <slug> [--preview]` |
| 8 QA | `.claude/agents/video-qa.md` | `npm run frames -- <slug>` then inspect |

`scenes.json` is the contract between steps. Steps communicate only through project files.

## "Make a video" requests
When asked to make a short/reel, follow `.claude/skills/make-video/SKILL.md` step by step (same pipeline Claude Code uses):
read each step's role file, do the work yourself, stop at the two approval gates (after script, after storyboard),
run QA on the rendered frames (open the images and look), fix, and report the final `out/<slug>.mp4` path.
Language arg: `bn`, `en`, or `both`.

## Tech explainers (software engineering)
- Scenes use `"layout": {...}` — data-only templates in `src/layouts/` (types in `src/layouts/types.ts`):
  `code` (typing + syntax highlight + line highlight), `terminal`, `table` (row scan), `compare`, `bullets`, `tree` (B-Tree search path).
- No drawing per video: write the layout JSON in scenes.json. Example: `public/projects/db-index-bn/scenes.json`.
- Dark theme (`bg #0d1117`, accent `#58a6ff`, font `HindSiliguri`), `text_position: "top"`.
- Banglish: `narration` = what viewers read in captions (Bangla + English terms); `tts_text` = same line with English terms spelled in Bangla script (ডেটাবেস, কোয়েরি, ইনডেক্স) so Bangla TTS pronounces them. Rate `+5%` for tech.
- Keep shorts ≤ 60s.

## Cartoon / kids stories (no image API needed)
- Scenes use `"illustration": "<story>/<scene>"` instead of images — code-drawn SVG animation.
- Reuse characters in `src/characters/` (Tia = `Kid`, Pip = `Elephant`); new story beats go in `src/stories/<story>/Scenes.tsx` and are registered in `src/illustrations/registry.ts`. Template: `src/stories/kite/`, project `public/projects/tia-pip-kite-bn`.
- Characters must be original — never recreate characters, logos or designs from existing shows, even if given as reference; only borrow general style.
- Fonts: `Fredoka` (en), `BalooDa2` (bn). Set `theme.stroke` on bright backgrounds.

## Voices
- Free TTS: edge-tts in `.venv` (`python3 -m venv .venv && .venv/bin/pip install edge-tts`). Needs internet.
- Bangla: narrator `bn-IN-TanishaaNeural`, characters `bn-IN-BashkarNeural`, rate `-5%` (user-approved).
- Dialogue: scene `segments` split narration by speaker; cast in `characters`. See `.claude/agents/voiceover-agent.md`.
- After changing voices: `npm run voice -- <slug> --force`.
- Real voice (preferred by the user for tech videos): `npm run read-script -- <slug>` → user records → `npm run import-voice -- <slug> <file | folder>` → render.
  Imported scenes get `voice_source: "recorded"`; `npm run voice` will not overwrite them (needs `--replace-recorded`).

## Branding & caption sync
- Channel logo: set `"logo": "brand/dev-diary-logo.png"` in scenes.json (top-right overlay, every scene).
- Real voice captions: `npm run align-captions -- <slug>` aligns narration to the Whisper words by sound. If a scene's
  `audio/scene-N.words.json` misses words (Whisper drops chunk ends), fix it with
  `scripts/splice-words.sh <slug> <scene> <from> <to> [bn|en]`, then re-run.
- Vertical balance: `theme.title_top` / `theme.caption_bottom` (px; strategy-p3 uses 300/300) and per-scene
  `content_offset` (px down) to center the visual between title and captions.
- Episodes longer than 90s: set `"max_duration_sec": 180` in scenes.json.

## Design patterns (Dev Diary series)
- All design-pattern episodes live in one folder: projects `public/projects/design-patterns/<slug>`, scenes
  `src/stories/design-patterns/<slug>/`, recordings `recordings/design-patterns/`, renders + source zips `out/design-patterns/`.
- Nested slugs: `npm run render -- design-patterns/observer-p1-bn`. Thumbnails: `npm run thumbs:patterns` → `out/design-patterns/thumbs/`
  (`src/thumbs/StrategyThumbs.tsx`, `src/thumbs/ObserverThumbs.tsx`).
- Strategy series: dark navy/teal, white logo. Observer series: ivory `#FAF7EF`, charcoal, plum (observer link), burnt orange
  (temperature), black logo `brand/dev-diary-logo-black.png`; caption colours via `theme.caption_color/caption_accent/caption_bg`.

## Video format: vertical or landscape
- scenes.json `"format": "vertical"` (default, 1080×1920, 9:16 Shorts/Reels/TikTok) or `"landscape"` (1920×1080, 16:9 YouTube).
  Sizes live in `src/format.ts`; use `useFormat()` in components instead of hard-coding 1080/1920.
- Shared pieces adapt by themselves: captions (wider, max 2 lines, lower), logo, titles, layouts, brand outro.
- Landscape scene design: use the width. Put visuals side by side (e.g. code left, diagram right), keep the
  focus in the middle band, captions at the bottom. The centring rule still applies: space above the
  logo/title = space below the captions.
- Thumbnails: vertical 1080×1920; landscape 1280×720 (`THUMB_SIZES`). Big readable title, same series style.
- Landscape brand outros for standalone files: `OutroDevDiaryLandscape`, `OutroHizibiziLandscape`.

## Brand outro (user rule: every NEW video)
- One house format: main video fades to charcoal `#141318`, then a 4 s cream `#F3E9D7` logo outro fades in.
- scenes.json: `"outro": "devdiary"` (Dev Diary / tech) or `"outro": "hizibizi"` (hizibizi). Code: `src/brand/BrandOutro.tsx`.
- Standalone files: `npm run outro` → `out/brand/dev-diary/`, `out/brand/hizibizi/` (MP4 + transparent ProRes 4444 `.mov`).
- Don't retrofit older videos unless asked.

## hizibizi (kids science series "Why Is That?")
- Everything for hizibizi lives in its own folders: projects `public/projects/hizibizi/<slug>`, scenes code
  `src/stories/hizibizi/<topic>/`, recordings `recordings/hizibizi/`, renders `out/hizibizi/`.
- Slugs are nested: `npm run render -- hizibizi/zipper-bn` (scenes.json `"project": "hizibizi/zipper-bn"`).
- Full-screen is the default style (user rule): animation fills the frame — no card/box/border/padding.
  Captions: `theme.caption_style: "shadow"` (text over the scene). Draw backgrounds that overscan (svg `overflow: visible`, y −400…2400)
  because content is shifted down to centre it. Template: `src/stories/hizibizi/spoon/`.
- Centring (user rule, all videos): top margin above logo/badge = bottom margin below captions. hizibizi: use
  `StagePage` from `src/stories/hizibizi/common.tsx` (shifts block by `SHIFT`) with `theme.logo_top: 141`, `theme.caption_bottom: 145`.
- Logo: `"logo": "brand/hizibizi-logo.png"` (transparent background, top-right; no plate).
- Thumbnails: `src/thumbs/HizibiziThumbs.tsx` → `npm run thumbs:hizibizi` → `out/hizibizi/thumbs/`.
- Light SFX without samples: `scripts/zip-sfx.py` (events JSON → wav, used as the project's `music`).

## Rules
- Get user approval on script and scenes before paid API calls (images, paid TTS).
- `scenes.json.language` drives voice (`.env` `*_BN` / `*_EN`), font, and validation. bn narration in Bangla script, not Banglish (TTS needs it).
- Both languages: generate images first, then localize — images are shared, paid once. Localize = adapt naturally, not literal translation.
- On-screen text short (≤ 8 words); `*word*` = accent color. Keep text out of top 12% / bottom 20%.
- After code changes: `npm run typecheck` and `npm run render -- example --preview`.
- Secrets live in `.env` (see `.env.example`); never commit or print them.

## Commands
- `npm run studio` — Remotion Studio live preview (example project by default)
- `npm run typecheck`
