// Usage: npm run align-captions -- <slug>
// Sync captions to the real voice: transcribes each scene clip locally (Whisper, word timestamps),
// then aligns the scene's narration words to the spoken words by sound (consonant skeleton +
// edit-distance alignment, so Whisper's Bangla misspellings and English↔Bangla script still match). Saves raw timings to audio/scene-N.words.json so
// animations can key beats off them.
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { ROOT, projectDir, readScenes, writeScenes, die } from "./lib.mjs";

// ---- sound-based alignment -------------------------------------------------
// Both scripts reduce to a rough consonant skeleton ("a" = word-initial vowel), e.g.
// "extend" → a k s t n d, "একস্টিন্ড" → a k s t n d, "class-এ" → k l s, "ক্লাসে" → k l s.
const BN = { ক:"k",খ:"k",গ:"g",ঘ:"g",ঙ:"n",চ:"c",ছ:"c",জ:"j",ঝ:"j",ঞ:"n",ট:"t",ঠ:"t",ড:"d",ঢ:"d",ণ:"n",ত:"t",থ:"t",দ:"d",ধ:"d",ন:"n",প:"p",ফ:"f",ব:"b",ভ:"b",ম:"m",য:"j",র:"r",ল:"l",শ:"s",ষ:"s",স:"s",হ:"h","ং":"n","ৎ":"t" };
const BN_VOWEL = /[অআইঈউঊঋএঐওঔ]/;
// Numbers are spoken as Bangla words: map digit tokens to their spoken form before reducing.
const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
const NUM_WORDS = { 1042: "এক হাজার বিয়াল্লিশ", 1043: "এক হাজার তেতাল্লিশ", 4: "চার", 10: "দশ", 15: "পনেরো", 30: "ত্রিশ", 32: "বত্রিশ", 33: "তেত্রিশ", 40: "চল্লিশ", 60: "ষাট", 100: "একশো", 120: "একশো বিশ" };
function skeleton(word) {
  const digits = word.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d))).replace(/[^0-9]/g, "");
  if (digits && NUM_WORDS[+digits]) word = word.replace(/[৳0-9০-৯]+/, NUM_WORDS[+digits]);
  const w = word.normalize("NFC").toLowerCase();
  let out = "";
  const first = w.replace(/^[^\p{L}]+/u, "")[0] ?? "";
  if (BN_VOWEL.test(first) || /[aeiou]/.test(first)) out += "a";
  const latin = w
    .replace(/ph/g, "f").replace(/ck/g, "k").replace(/th/g, "t").replace(/sh/g, "s").replace(/ch/g, "c")
    .replace(/x/g, "ks").replace(/q/g, "k").replace(/c/g, "k").replace(/v/g, "b").replace(/z/g, "j");
  for (const ch of latin) {
    if (BN[ch]) out += BN[ch];
    else if (/[bdfghjklmnprst]/.test(ch)) out += ch;
  }
  return out.replace(/(.)\1+/g, "$1");
}

function alignWords(mine, spoken, sceneDur) {
  // spoken chars with times (spread evenly inside each spoken word)
  const sc = [];
  for (const w of spoken) {
    const k = skeleton(w.word);
    const d = (w.end - w.start) / Math.max(1, k.length);
    [...k].forEach((ch, j) => sc.push({ ch, start: w.start + j * d, end: w.start + (j + 1) * d }));
  }
  const mc = [];
  mine.forEach((w, wi) => [...skeleton(w)].forEach((ch) => mc.push({ ch, wi })));
  // Needleman–Wunsch (edit distance with traceback)
  const n = mc.length, m = sc.length, G = 0.8;
  const D = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  for (let i = 1; i <= n; i++) D[i][0] = i * G;
  for (let j = 1; j <= m; j++) D[0][j] = j * G;
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      D[i][j] = Math.min(D[i - 1][j - 1] + (mc[i - 1].ch === sc[j - 1].ch ? 0 : 1), D[i - 1][j] + G, D[i][j - 1] + G);
  const times = mine.map(() => ({ start: Infinity, end: -Infinity }));
  for (let i = n, j = m; i > 0 && j > 0; ) {
    if (D[i][j] === D[i - 1][j - 1] + (mc[i - 1].ch === sc[j - 1].ch ? 0 : 1)) {
      const t = times[mc[i - 1].wi];
      t.start = Math.min(t.start, sc[j - 1].start);
      t.end = Math.max(t.end, sc[j - 1].end);
      i--; j--;
    } else if (D[i][j] === D[i - 1][j] + G) i--;
    else j--;
  }
  // words with no matched sound: interpolate between neighbours
  const first = spoken[0].start, last = Math.min(sceneDur ?? Infinity, spoken.at(-1).end);
  for (let i = 0; i < times.length; i++) {
    if (Number.isFinite(times[i].start)) continue;
    let j = i;
    while (j < times.length && !Number.isFinite(times[j].start)) j++;
    const a = i > 0 ? times[i - 1].end : first;
    const b = j < times.length ? times[j].start : last;
    const step = Math.max(0, b - a) / (j - i);
    for (let k = i; k < j; k++) times[k] = { start: a + (k - i) * step, end: a + (k - i + 1) * step };
    i = j - 1;
  }
  // monotonic, no overlap; each word lasts until the next starts (no caption flicker)
  for (let i = 1; i < times.length; i++) times[i].start = Math.max(times[i].start, times[i - 1].start + 0.05);
  const r = (x) => Math.round(x * 100) / 100;
  return mine.map((word, i) => ({
    word,
    start: r(times[i].start),
    end: r(i + 1 < times.length ? Math.max(times[i].start + 0.05, times[i + 1].start) : Math.max(times[i].end, times[i].start + 0.3)),
  }));
}

// Pauses in the clip. Whisper often starts a word inside the preceding pause; push such starts to the pause end.
function silences(file) {
  const log = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-af", "silencedetect=n=-38dB:d=0.15", "-f", "null", "-"], { encoding: "utf8" }).stderr ?? "";
  const out = [];
  const re = /silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g;
  for (let m; (m = re.exec(log)); ) out.push([+m[1], +m[2]]);
  return out;
}
function snapToSpeech(caps, sil) {
  for (let i = 0; i < caps.length; i++) {
    const { start, end } = caps[i];
    // start inside a pause, or a pause in the first half of this word's slot (word really begins after it)
    const gap = sil.find(([a, b]) => (start >= a - 0.02 && start < b) || (a >= start && a < start + 0.5 * (end - start) && b < end));
    if (gap && i > 0) {
      caps[i].start = Math.round(gap[1] * 100) / 100;
      caps[i - 1].end = caps[i].start;
      if (caps[i].end <= caps[i].start) caps[i].end = Math.round((caps[i].start + 0.2) * 100) / 100;
    }
  }
  for (let i = 1; i < caps.length; i++) if (caps[i].start < caps[i - 1].start) caps[i].start = caps[i - 1].start;
  return caps;
}

const slug = process.argv[2];
const dir = projectDir(slug);
const data = readScenes(dir);
const PY = path.join(ROOT, ".venv/bin/python");
if (!fs.existsSync(PY)) die("Missing .venv — run: python3 -m venv .venv && .venv/bin/pip install faster-whisper");
const lang = data.language === "en" ? "en" : "bn";

for (const scene of data.scenes) {
  if (!scene.audio || !scene.narration?.trim()) continue;
  const audio = path.join(dir, scene.audio);
  const out = audio.replace(/\.mp3$/, ".words.json");
  if (!fs.existsSync(out)) {
    execFileSync(PY, ["-I", path.join(ROOT, "scripts/transcribe.py"), audio, out, "--lang", lang], { stdio: ["ignore", "ignore", "inherit"] });
  }
  const spoken = JSON.parse(fs.readFileSync(out, "utf8")).words.filter((w) => w.word && w.end > w.start);
  const mine = scene.narration.split(/\s+/).filter(Boolean);
  if (!spoken.length) {
    console.warn(`scene ${scene.id}: no words recognized — keeping estimated captions`);
    continue;
  }
  scene.captions = snapToSpeech(alignWords(mine, spoken, scene.duration_sec), silences(audio));
  console.log(`scene ${scene.id}: ${mine.length} caption words ↔ ${spoken.length} spoken words`);
}
writeScenes(dir, data);

