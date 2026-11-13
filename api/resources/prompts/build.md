The owner approved the plan in `{{plan_path}}` (re-read it: the owner may have edited it). Build the video now,
following AGENTS.md and the series rules:

1. Create the project `{{slug}}`: scenes.json with `"format": "{{format}}"` ({{format_desc}}), logo `{{logo}}`{{logo_alt}},
   the theme, these outro fields exactly `{{outro_json}}`, and `max_duration_sec` if longer than 90 s.
2. Import the voice `{{voice_path}}` (cut at real pauses), align captions (max 2 lines, synced, no expression
   tags), fix Whisper mistakes with scripts/splice-words.sh.
3. Write the scenes, render, then QA: extract frames and look at them (centring, overlaps, captions, outro).
   Fix and re-render until it is clean. Loudness about -16.5 LUFS.
4. Make the thumbnail in the right size for the format. Do not make a source zip or example code.

The very last line of your reply must be exactly one line in this format (paths relative to this folder):
RESULT {"mp4": "out/...", "thumb": "out/...", "duration": 0.0}
