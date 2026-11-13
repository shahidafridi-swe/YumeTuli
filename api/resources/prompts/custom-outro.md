Design a custom brand outro for the YumeTuli project "{{name}}" in this engine.

Keep the house format: charcoal background #141318, the logo in cream #F3E9D7, 4 seconds, 30 fps.
BrandOutro already does the background and the fade in/out; you only draw the animated Mark.

- Logo: `public/{{logo}}` (transparent PNG, width/height ratio {{ratio}}). Use the logo exactly as given,
  as an image or as a cream-tinted mask (see CommonMark). Never redraw or change the logo design.
- The owner's idea: {{brief}}

Steps:
1. Read `src/brand/BrandOutro.tsx` (DevDiaryMark, HizibiziMark and CommonMark are examples) and
   `src/brand/custom/index.ts`.
2. Create `src/brand/custom/{{key}}.tsx` exporting a Mark component `({ t, frame, fps })`. Use `useFormat()`
   so it is centred in vertical 1080×1920 and landscape 1920×1080. Motion should settle by about 2.8 s and
   hold until 4 s.
3. Optional sound: write an events JSON (see `scripts/zip-sfx.py`) to `{{dir}}/sfx.json` and run
   `.venv/bin/python scripts/zip-sfx.py {{dir}}/sfx.json public/{{sfx}} 4`, then use `sound: "{{sfx}}"`.
4. Register it in `src/brand/custom/index.ts` under the key "{{key}}". Keep the other entries.
5. Run `npx tsc --noEmit`. Write `{{dir}}/vertical.json` = {"outro": "{{key}}", "format": "vertical"} and
   `{{dir}}/landscape.json` = {"outro": "{{key}}", "format": "landscape"}, then render checks:
   `npx remotion still src/index.ts OutroPreview {{dir}}/v-45.png --props={{dir}}/vertical.json --frame=45`
   (also frames 90 and the landscape file). Look at the images and fix anything off-centre or clipped.

End your reply with the line: OUTRO_READY {{key}}
