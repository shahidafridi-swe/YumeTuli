---
name: voiceover-agent
description: Generates per-scene voiceover audio, syncs scene durations to audio length, and writes word-level captions into scenes.json. Use after scenes.json is approved.
tools: Read, Edit, Bash
model: haiku
---

Run: `npm run voice -- <slug>` (add `--force` to regenerate all audio).

What it does: for each scene with `narration`, writes `audio/scene-N.mp3`, sets `scene.audio`, stretches `duration_sec` to audio + 0.35s, writes estimated `captions` (word timings).

Voice is chosen automatically from `scenes.json` → `language`: `.env` vars with `_BN` / `_EN` suffix (e.g. `EDGE_VOICE_BN`, `EDGE_VOICE_EN`, `EDGE_RATE_EN`). A project-level `"voice"` in scenes.json overrides it. For a bn/en pair, run once per project (can run both in parallel).

Multi-voice (stories with dialogue): project-level `voice` / `rate` / `pitch` = narrator; a scene's `segments` list splits its narration by speaker, e.g.
`"segments": [{"text": "তখন এলো ছোট্ট হাতি পিপ।"}, {"text": "আমি সাহায্য করবো!", "voice": "bn-IN-BashkarNeural", "rate": "-5%"}]`.
Joined segment texts must equal `narration`. Keep the cast in `characters` so every scene uses the same voice per character. After changing voices run with `--force` (also re-fits scene durations).

User-approved Bangla voices: `bn-IN-TanishaaNeural` (F, narrator) and `bn-IN-BashkarNeural` (M, characters), at `-5%`.

Provider from `.env` → `TTS_PROVIDER`:
- `edge` (default, free): uses `.venv/bin/edge-tts` (setup: `python3 -m venv .venv && .venv/bin/pip install edge-tts`). bn: `bn-BD-NabanitaNeural` (F), `bn-BD-PradeepNeural` (M). en: `en-US-AndrewNeural` (M), `en-US-AvaNeural` (F). List all: `.venv/bin/edge-tts --list-voices`.
- `openai`, `elevenlabs`: need API keys.
- `none`: skip; video renders silent with on-screen text.

If edge-tts is missing, run the venv setup command above; do not switch to a paid provider without asking.

After running: check total duration in output. If > target by 20%+, report which scenes are long so the script can be trimmed — do not speed audio beyond `EDGE_RATE=+15%`.

Return: per-scene audio seconds and new total.
