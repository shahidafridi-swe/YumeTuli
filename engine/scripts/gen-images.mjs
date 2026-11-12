// Usage: npm run images -- <slug> [--force] [--only=1,3]
// Generates assets/scene-N.png from each scene's `visual` prompt (OpenAI Images API).
// Costs money per image — run only after scenes.json is approved.
import fs from "node:fs";
import path from "node:path";
import { projectDir, readScenes, writeScenes, die } from "./lib.mjs";

const slug = process.argv[2];
const force = process.argv.includes("--force");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice(7).split(",").map(Number) : null;
const dir = projectDir(slug);
const data = readScenes(dir);

const key = process.env.OPENAI_API_KEY;
if (!key) die("OPENAI_API_KEY missing — add to .env, or place images manually in assets/ and set scene.image.");

const STYLE =
  "Vertical 9:16 composition, cinematic lighting, high detail, no text, no letters, no watermark, leave space for overlay text.";

for (const scene of data.scenes) {
  if (only && !only.includes(scene.id)) continue;
  if (!scene.visual?.trim()) continue;
  const rel = `assets/scene-${scene.id}.png`;
  const file = path.join(dir, rel);
  if (!force && fs.existsSync(file)) {
    scene.image = rel;
    continue;
  }
  console.log(`Image scene ${scene.id}…`);
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
      prompt: `${scene.visual}. ${STYLE}`,
      size: "1024x1536",
      n: 1,
    }),
  });
  if (!res.ok) die(`Image API failed (scene ${scene.id}): ${res.status} ${await res.text()}`);
  const json = await res.json();
  const item = json.data?.[0];
  if (item?.b64_json) fs.writeFileSync(file, Buffer.from(item.b64_json, "base64"));
  else if (item?.url) fs.writeFileSync(file, Buffer.from(await (await fetch(item.url)).arrayBuffer()));
  else die(`No image in response for scene ${scene.id}`);
  scene.image = rel;
  writeScenes(dir, data); // save progress after each paid call
}

writeScenes(dir, data);
console.log("Done.");
