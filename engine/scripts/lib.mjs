import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

try {
  process.loadEnvFile(path.join(ROOT, ".env"));
} catch {
  // no .env — fine, use real environment
}

export function projectDir(slug) {
  if (!slug) die("Usage: <command> <project-slug>");
  const dir = path.join(ROOT, "public", "projects", slug);
  if (!fs.existsSync(dir)) die(`Project not found: ${dir}`);
  return dir;
}

export function readScenes(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, "scenes.json"), "utf8"));
}

export function writeScenes(dir, data) {
  fs.writeFileSync(path.join(dir, "scenes.json"), JSON.stringify(data, null, 2) + "\n");
}

export function audioDuration(file) {
  const out = execFileSync("ffprobe", [
    "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file,
  ], { stdio: ["ignore", "pipe", "ignore"] }).toString();
  return parseFloat(out);
}

export function die(msg) {
  console.error(msg);
  process.exit(1);
}

export function validateScenes(data) {
  const errors = [];
  if (!Array.isArray(data.scenes) || data.scenes.length === 0) errors.push("scenes[] empty");
  for (const s of data.scenes ?? []) {
    if (typeof s.id !== "number") errors.push(`scene missing numeric id`);
    if (!(s.duration_sec > 0)) errors.push(`scene ${s.id}: duration_sec must be > 0`);
    if (typeof s.narration !== "string") errors.push(`scene ${s.id}: narration missing`);
    if (typeof s.on_screen_text !== "string") errors.push(`scene ${s.id}: on_screen_text missing`);
    if ("source_narration" in s) errors.push(`scene ${s.id}: not localized yet (source_narration still present)`);
    const bengali = /[ঀ-৿]/.test(s.narration ?? "");
    if (data.language === "en" && bengali) errors.push(`scene ${s.id}: Bangla text in an "en" project`);
    if (data.language === "bn" && s.narration && !bengali)
      errors.push(`scene ${s.id}: "bn" narration must be in Bangla script (not Banglish/English)`);
  }
  const total = (data.scenes ?? []).reduce((a, s) => a + (s.duration_sec || 0), 0);
  const maxSec = data.max_duration_sec ?? 90; // longer episodes opt in via scenes.json "max_duration_sec"
  if (total > maxSec) errors.push(`total ${total.toFixed(1)}s > ${maxSec}s — too long (set "max_duration_sec" for a long episode)`);
  return { errors, total };
}
