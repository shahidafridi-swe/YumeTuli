---
name: make-video
description: End-to-end pipeline for a vertical short/reel in Bangla, English, or both — script, storyboard, assets, voiceover, render, QA. Use when the user asks to make a short, reel, or TikTok video, e.g. `/make-video "topic" 30s both`.
---

# make-video

Args: topic (required), duration (default 30s), language `bn` | `en` | `both` (default `bn`), extra style notes.
For `both`: primary language = the one the user wrote the topic in (Bangla/Banglish → bn first, English → en first), unless they say otherwise.

Slugs: `<topic-kebab>-bn` and/or `<topic-kebab>-en`.

Steps — run in order, pause at the two approval gates:

1. **New project** (primary language): `npm run new -- <slug>-<lang> "<Title>" --lang=<lang>`.
2. **Script** → `script-writer` agent. Show the user hook + narration.
   **GATE 1: wait for approval / edits.**
3. **Storyboard** → `storyboard-planner`. Show a compact scene table (id, sec, on-screen text, visual).
   **GATE 2: wait for approval.** Ask: AI images (paid) or gradient+emoji (free)?
4. **Assets** → `asset-generator` (skip in free mode). Done once — images are language-neutral and shared.
5. **If `both`** → `localizer` agent: `<slug>-<primary>` → other language (copies assets, rewrites text).
   Show the side-by-side table; user may tweak, no hard gate.
6. **Voiceover** → `voiceover-agent`, one call per language project, in parallel (single message).
7. **Render preview** → `video-builder`: `npm run render -- <slug> --preview` for each project.
8. **QA** → `video-qa` per project (parallel). If FAIL, route each issue to the named agent, re-render, re-QA. Max 3 loops, then report remaining issues.
9. **Final** → `npm run render -- <slug>` for each. Report `out/<slug>.mp4` paths, durations, and per language: suggested title + caption + 5 hashtags (bn caption in Bangla, en in English).

Rules:
- Never run paid steps (images, paid TTS) before Gate 2.
- Asset generation happens before localizing, so both versions share images and you pay once.
- scenes.json is the single source of truth; agents communicate only through project files.
- If the user says "quick" / "no approval", skip the gates but still do QA.
- To add the other language to an already-finished video later: steps 5 → 9 only.
