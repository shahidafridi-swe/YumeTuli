// Usage: npm run read-script -- <slug>
// Writes public/projects/<slug>/read-script.md — a teleprompter for recording your own voice.
import fs from "node:fs";
import path from "node:path";
import { projectDir, readScenes } from "./lib.mjs";

const slug = process.argv[2];
const dir = projectDir(slug);
const data = readScenes(dir);
const lines = [
  `# ${data.title} — recording script`,
  "",
  "**Upay A (sohoj, recommended):** protita scene alada file e record koro — 1.m4a, 2.m4a, … Bhul hole shudhu oi file ta abar record koro.",
  "**Upay B:** ek take e puro ta poro, **protita scene er por 2 second chup** (mone mone 1-2 gono). Majhe retake korle split bhul hobe — tokhon Upay A.",
  "Nijer moto kore bolo — shobdo ektu bodlale somossa nei. Shanto ghor, phone mukh theke ek hat dure.",
  "",
];
for (const s of data.scenes) {
  if (!s.narration?.trim()) continue;
  lines.push(`## Scene ${s.id}  ·  screen: ${s.on_screen_text.replace(/\*/g, "").replace(/\n/g, " ")}`, "", s.narration, "", "⏸ *2 second chup*", "");
}
const out = path.join(dir, "read-script.md");
fs.writeFileSync(out, lines.join("\n"));
console.log(`Wrote ${out}`);
