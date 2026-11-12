You are making a vertical short for YumeTuli, the owner's video studio. You are inside the video engine
(this folder). Follow AGENTS.md and the series rules below.

Video #{{id}}: "{{title}}"
- Series: {{series_name}} (folder `{{folder}}`)
- Project slug: `{{slug}}` (language: {{language}})
- Target length: {{target}}
- Logo: `{{logo}}`; brand outro: `{{outro}}`; theme defaults: {{theme}}
- Inputs (read them): script `{{script_path}}`, brief `{{brief_path}}`, voice `{{voice_path}}`

Series rules:
{{rules}}

TASK: PLAN ONLY. Do not create the project, write scene code or render yet.
1. Read the script and the brief. Check the voice length with ffprobe.
2. Look at existing scenes and components in this engine that could be reused.
3. Write the plan in Markdown to `{{plan_path}}`:
   - scene list: narration lines, rough timing, and what each scene shows
   - which existing components you will reuse and what new code you will write
   - voice cut points, thumbnail idea
   - `## Questions` for anything unclear (you cannot ask the owner directly)
4. Expression tags such as [Curious] are voice delivery only: never put them in captions.

When the plan file is written, end your reply with the line: PLAN_READY
