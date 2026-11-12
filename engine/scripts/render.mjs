// Usage: npm run render -- <slug> [--preview]
// Validates scenes.json, then renders out/<slug>.mp4 (1080x1920).
// --preview renders at half resolution for fast checks.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, projectDir, readScenes, validateScenes, die } from "./lib.mjs";

const slug = process.argv[2];
const preview = process.argv.includes("--preview");
const dir = projectDir(slug);
const data = readScenes(dir);
data.project = slug;

const { errors, total } = validateScenes(data);
if (errors.length) die("scenes.json invalid:\n - " + errors.join("\n - "));

// Every referenced file must exist
for (const s of data.scenes) {
  for (const k of ["image", "video", "audio"]) {
    if (s[k] && !fs.existsSync(path.join(dir, s[k]))) die(`scene ${s.id}: ${k} not found: ${s[k]}`);
  }
}
if (data.music && !fs.existsSync(path.join(dir, data.music))) die(`music not found: ${data.music}`);

const outDir = path.join(ROOT, "out");  // nested slugs (e.g. hizibizi/zipper-bn) render to out/hizibizi/
fs.mkdirSync(outDir, { recursive: true });
const propsFile = path.join(outDir, `${slug}.props.json`);
fs.mkdirSync(path.dirname(propsFile), { recursive: true });
fs.writeFileSync(propsFile, JSON.stringify(data));
const outFile = path.join(outDir, preview ? `${slug}.preview.mp4` : `${slug}.mp4`);

console.log(`Rendering ${slug} (${total.toFixed(1)}s) → ${path.relative(ROOT, outFile)}`);
const args = ["remotion", "render", "src/index.ts", "Short", outFile, `--props=${propsFile}`];
if (preview) args.push("--scale=0.5");
const r = spawnSync("npx", args, { cwd: ROOT, stdio: "inherit" });
process.exit(r.status ?? 1);
