// Usage: npm run new -- <slug> "Title" [--lang=bn|en]
import fs from "node:fs";
import path from "node:path";
import { ROOT, die } from "./lib.mjs";

const args = process.argv.slice(2);
const langArg = args.find((a) => a.startsWith("--lang="));
const lang = langArg ? langArg.slice(7) : "bn";
const [slug, title = slug] = args.filter((a) => !a.startsWith("--"));
if (!slug || !/^[a-z0-9-]+$/.test(slug)) die('Usage: npm run new -- <slug-kebab-case> "Title" [--lang=bn|en]');
if (!["bn", "en"].includes(lang)) die("--lang must be bn or en");

const dir = path.join(ROOT, "public", "projects", slug);
if (fs.existsSync(dir)) die(`Already exists: ${dir}`);

fs.mkdirSync(path.join(dir, "assets"), { recursive: true });
fs.mkdirSync(path.join(dir, "audio"), { recursive: true });
const tpl = fs.readFileSync(path.join(ROOT, "templates", "scenes.json"), "utf8");
fs.writeFileSync(
  path.join(dir, "scenes.json"),
  tpl
    .replace("__SLUG__", slug)
    .replace("__TITLE__", title.replace(/"/g, '\\"'))
    .replace("__LANG__", lang)
    .replace("__FONT__", lang === "bn" ? "NotoSansBengali" : "Inter"),
);
fs.writeFileSync(path.join(dir, "script.md"), `# ${title}\n\n<!-- script-writer agent fills this (language: ${lang}) -->\n`);
console.log(`Created ${path.relative(ROOT, dir)} (${lang})`);
