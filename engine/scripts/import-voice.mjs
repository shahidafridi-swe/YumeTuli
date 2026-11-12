// Import a real voice recording into a project, replacing TTS.
//
// Usage:
//   npm run import-voice -- <slug> <recording-file>     one take, ~1.5s pause between scenes → auto-split on silences
//   npm run import-voice -- <slug> <folder>             one file per scene (sorted by name: 1.m4a, 2.m4a, …)
//   npm run import-voice -- <slug> <recording-file> --cuts=9.3,13.5,…   explicit scene boundaries (seconds);
//                                                    each cut snaps to the quietest point within ±0.35s
//   add --no-clean to skip audio cleanup
//
// Any format ffmpeg reads works (m4a, mp3, wav, ogg/opus WhatsApp notes, …).
// Cleanup: high-pass (rumble), light denoise, loudness normalize to -16 LUFS (YouTube/Reels level).
// Then: scene.audio = audio/scene-N.mp3, duration fitted, captions re-estimated from narration.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { projectDir, readScenes, writeScenes, audioDuration, die } from "./lib.mjs";

const args = process.argv.slice(2);
const [slug, input] = args.filter((a) => !a.startsWith("--"));
const clean = !args.includes("--no-clean");
const cutsArg = args.find((a) => a.startsWith("--cuts="));
const manualCuts = cutsArg ? cutsArg.slice(7).split(",").map(Number) : null;
if (!slug || !input) die("Usage: npm run import-voice -- <slug> <recording-file | folder-of-scene-files>");
if (!fs.existsSync(input)) die(`Not found: ${input}`);

const dir = projectDir(slug);
const data = readScenes(dir);
const scenes = data.scenes.filter((s) => s.narration?.trim());
const N = scenes.length;
const PAD_SEC = 0.3;
const FILTERS = clean
  ? "afftdn=nf=-25,loudnorm=I=-16:TP=-1.5:LRA=11"
  : "anull";
const ff = (a) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...a], { stdio: ["ignore", "pipe", "pipe"] });

// Trim leading/trailing silence and write mp3
const exportClip = (src, start, end, out) => {
  // Cut inside the filter graph (atrim) so silence trimming only sees this scene's audio
  const trim = start != null ? `atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS,` : "";
  ff([
    "-i", src,
    "-af",
    // trim silence on the (high-passed) raw signal first — loudnorm would lift the noise floor above the threshold
    `${trim}highpass=f=80,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15,areverse,${FILTERS}`,
    "-ar", "44100", "-ac", "1", "-b:a", "160k", out,
  ]);
};

const audioDir = path.join(dir, "audio");
fs.mkdirSync(audioDir, { recursive: true });
// Remove old TTS files (incl. multi-voice parts) so nothing stale is reused
for (const f of fs.readdirSync(audioDir)) if (/^scene-\d+(-part\d+)?\.mp3$/.test(f)) fs.rmSync(path.join(audioDir, f));

let clips = [];
if (fs.statSync(input).isDirectory()) {
  const files = fs
    .readdirSync(input)
    .filter((f) => /\.(m4a|mp3|wav|ogg|opus|aac|flac|webm|mp4)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (files.length !== N) die(`Folder has ${files.length} audio files, project has ${N} scenes.`);
  clips = files.map((f) => ({ src: path.join(input, f) }));
} else if (manualCuts) {
  if (manualCuts.length !== N - 1) die(`--cuts needs ${N - 1} values (project has ${N} scenes), got ${manualCuts.length}.`);
  const total = audioDuration(input);
  // Snap each cut to the middle of the nearest short pause, if one is close
  const log = execFileSync("bash", ["-c", 'ffmpeg -hide_banner -i "$1" -af silencedetect=noise=-40dB:d=0.06 -f null - 2>&1', "_", input]).toString();
  const pauses = [];
  let ps = null;
  for (const line of log.split("\n")) {
    const a = line.match(/silence_start: ([\d.]+)/);
    const b = line.match(/silence_end: ([\d.]+)/);
    if (a) ps = parseFloat(a[1]);
    if (b && ps != null) {
      pauses.push((ps + parseFloat(b[1])) / 2);
      ps = null;
    }
  }
  const snapped = manualCuts.map((c) => {
    const near = pauses.filter((p) => Math.abs(p - c) <= 0.35).sort((x, y) => Math.abs(x - c) - Math.abs(y - c))[0];
    if (near == null) console.warn(`⚠ no pause near ${c}s — cutting exactly there`);
    return near ?? c;
  });
  const bounds = [0, ...snapped, total];
  clips = scenes.map((_, i) => ({ src: input, start: bounds[i], end: bounds[i + 1] }));
  console.log("cuts:", snapped.map((c) => c.toFixed(2)).join(", "));
} else {
  // Find silences, pick the N-1 longest as scene boundaries
  const total = audioDuration(input);
  // ffmpeg prints silencedetect results on stderr
  const stderr = execFileSync("bash", ["-c", 'ffmpeg -hide_banner -i "$1" -af silencedetect=noise=-35dB:d=0.6 -f null - 2>&1', "_", input]).toString();
  const silences = [];
  let start = null;
  for (const line of stderr.split("\n")) {
    const s = line.match(/silence_start: ([\d.]+)/);
    const e = line.match(/silence_end: ([\d.]+) \| silence_duration: ([\d.]+)/);
    if (s) start = parseFloat(s[1]);
    if (e && start != null) {
      const end = parseFloat(e[1]);
      if (start > 0.3 && end < total - 0.3) silences.push({ start, end, dur: parseFloat(e[2]) });
      start = null;
    }
  }
  if (silences.length < N - 1)
    die(
      `Found only ${silences.length} pauses but need ${N - 1} (project has ${N} scenes).\n` +
        `Pause ~1.5s between scenes, or record one file per scene into a folder.`,
    );
  const cuts = silences
    .sort((a, b) => b.dur - a.dur)
    .slice(0, N - 1)
    .sort((a, b) => a.start - b.start);
  const shortest = Math.min(...cuts.map((c) => c.dur));
  const nextLongest = silences.sort((a, b) => b.dur - a.dur)[N - 1];
  if (nextLongest && nextLongest.dur > shortest * 0.8)
    console.warn(`⚠ Scene pauses are not much longer than pauses inside sentences (${shortest.toFixed(2)}s vs ${nextLongest.dur.toFixed(2)}s). Check the split below.`);
  const bounds = [0, ...cuts.map((c) => (c.start + c.end) / 2), total];
  clips = scenes.map((_, i) => ({ src: input, start: bounds[i], end: bounds[i + 1] }));
}

const words = (t) => t.split(/\s+/).filter(Boolean);
const estimateCaptions = (text, dur) => {
  const w = words(text);
  const weights = w.map((x) => Array.from(x).length + 1);
  const sum = weights.reduce((a, b) => a + b, 0);
  let t = 0.05;
  return w.map((word, i) => {
    const len = (weights[i] / sum) * Math.max(0.1, dur - 0.1);
    const out = { word, start: +t.toFixed(3), end: +(t + len).toFixed(3) };
    t += len;
    return out;
  });
};

console.log(`Importing ${N} scene clips${clean ? " (cleanup on)" : ""}…`);
scenes.forEach((scene, i) => {
  const rel = `audio/scene-${scene.id}.mp3`;
  exportClip(clips[i].src, clips[i].start, clips[i].end, path.join(dir, rel));
  const dur = audioDuration(path.join(dir, rel));
  scene.audio = rel;
  scene.voice_source = "recorded";
  scene.segments = null;
  scene.duration_sec = +Math.max(1.5, dur + PAD_SEC).toFixed(2);
  scene.captions = estimateCaptions(scene.narration, dur);
  const preview = scene.narration.length > 42 ? scene.narration.slice(0, 42) + "…" : scene.narration;
  console.log(`  scene ${scene.id}: ${dur.toFixed(2)}s  "${preview}"`);
});
data.voice_source = "recorded";
writeScenes(dir, data);
const total = data.scenes.reduce((a, s) => a + s.duration_sec, 0);
console.log(`Done. Total ${total.toFixed(1)}s. Next: npm run render -- ${slug} --preview`);
