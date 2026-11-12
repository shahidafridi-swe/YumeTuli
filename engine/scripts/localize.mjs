// Usage: npm run localize -- <source-slug> <bn|en> [target-slug]
// Creates the other-language sibling of a project: copies scenes.json + assets (images reused, no extra cost),
// resets audio/captions, switches language + font, links both projects via "sibling".
// Narration / on-screen text are NOT translated here — the localizer agent rewrites them next.
import fs from "node:fs";
import path from "node:path";
import { ROOT, projectDir, readScenes, writeScenes, die } from "./lib.mjs";

const [src, lang, targetArg] = process.argv.slice(2);
if (!src || !["bn", "en"].includes(lang)) die("Usage: npm run localize -- <source-slug> <bn|en> [target-slug]");
const srcDir = projectDir(src);
const data = readScenes(srcDir);
if (data.language === lang) die(`${src} is already ${lang}`);

const base = src.replace(/-(bn|en)$/, "");
const target = targetArg ?? `${base}-${lang}`;
const dstDir = path.join(ROOT, "public", "projects", target);
if (fs.existsSync(dstDir)) die(`Already exists: ${dstDir}`);

fs.mkdirSync(path.join(dstDir, "audio"), { recursive: true });
fs.cpSync(path.join(srcDir, "assets"), path.join(dstDir, "assets"), { recursive: true });

const out = structuredClone(data);
out.project = target;
out.language = lang;
out.voice = null;
out.sibling = src;
out.theme.font = lang === "bn" ? "NotoSansBengali" : "Inter";
for (const s of out.scenes) {
  s.audio = null;
  s.captions = null;
  s.source_narration = s.narration; // reference for the localizer; removed after rewrite
  s.source_on_screen_text = s.on_screen_text;
}
writeScenes(dstDir, out);
fs.writeFileSync(path.join(dstDir, "script.md"), `# ${data.title} (${lang})\n\n<!-- localizer agent fills this from ../${src}/script.md -->\n`);

data.sibling = target;
writeScenes(srcDir, data);
console.log(`Created ${target} (${lang}) from ${src}. Next: localizer agent rewrites narration/on_screen_text.`);
