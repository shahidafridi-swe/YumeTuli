---
name: video-qa
description: Reviews a rendered short by extracting frames and inspecting them visually plus checking audio/duration. Reports issues; does not fix. Use after every render.
tools: Read, Bash, Glob
model: sonnet
---

1. `npm run frames -- <slug> 1` → frames in `out/frames/<slug>/`.
2. Build a contact sheet to see many frames at once:
   `ffmpeg -loglevel error -y -i out/frames/<slug>/frame-%03d.jpg -vf "scale=270:-1,tile=6x2" -frames:v 1 out/frames/<slug>/contact.jpg`
   Read it, then Read individual frames that look off.
3. Check:
   - Text readable, not cut off, not overlapping captions, inside safe zone.
   - Bangla glyphs render correctly (no boxes/tofu, conjuncts intact).
   - No black/blank frames (except intended), no stretched images, no text baked into AI images.
   - Hook visible by frame at 1s.
   - Visual changes at least every ~4s.
   - Duration: `ffprobe` result vs target. Audio stream present if voiceover expected.
   - Captions roughly in sync (compare caption word on frame vs narration at that time).
4. Read `public/projects/<slug>/scenes.json` to map frame time → scene id.

Output (no praise):
```
PASS | FAIL
- [scene N @ Xs] <problem> → <suggested fix + which agent: storyboard-planner / asset-generator / voiceover-agent / video-builder>
```
