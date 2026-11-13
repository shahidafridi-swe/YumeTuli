You are making a vertical short for YumeTuli, the owner's video studio. You are inside the video engine
(this folder). Follow AGENTS.md and the series rules below.

Video #{{id}}: "{{title}}"
- Project (channel): {{project_name}} · Series: {{series_name}} (folder `{{folder}}`)
- Project slug: `{{slug}}` (language: {{language}})
- Format: **{{format}}** ({{format_desc}}). Set `"format": "{{format}}"` in scenes.json and design every scene for this frame (see "Video format" in AGENTS.md).
- Target length: {{target}}
- Logo: `{{logo}}`{{logo_alt}} (paths relative to public/, use as given)
- Outro: put these fields in scenes.json exactly: `{{outro_json}}`
- Theme defaults: {{theme}}
- Inputs (read them): script `{{script_path}}`, brief `{{brief_path}}`, voice `{{voice_path}}`

Series rules:
{{rules}}

TASK: PLAN ONLY. Do not create the project, write scene code or render yet.
1. Read the script and the brief. Check the voice length with ffprobe.
2. Look at existing scenes and components in this engine that could be reused.
3. Write the plan in Markdown to `{{plan_path}}`:
   - scene list: narration lines, rough timing, and what each scene shows (laid out for the {{format}} frame)
   - which existing components you will reuse and what new code you will write
   - voice cut points, thumbnail idea (deliverables are the video and the thumbnail only: no source zip or example code)
   - `## Questions` for anything unclear (you cannot ask the owner directly)
4. Expression tags such as [Curious] are voice delivery only: never put them in captions.

When the plan file is written, end your reply with the line: PLAN_READY
