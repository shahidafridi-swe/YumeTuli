// Usage: npm run voice -- <slug> [--force]
// Generates audio/scene-N.mp3 per scene, fits duration_sec to audio, writes word-level captions.
// Multi-voice: a scene may have "segments": [{ "text", "voice"?, "rate"?, "pitch"? }] (e.g. narrator + character);
// each segment is synthesized separately and joined with a short pause. Project-level "voice"/"rate"/"pitch" are defaults.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT, projectDir, readScenes, writeScenes, audioDuration, die } from "./lib.mjs";

const slug = process.argv[2];
const force = process.argv.includes("--force");
const dir = projectDir(slug);
const data = readScenes(dir);
const provider = process.env.TTS_PROVIDER ?? "edge";
const PAD_SEC = 0.35; // breathing room after each line
const GAP_SEC = 0.25; // pause between segments inside one scene
const LANG = (data.language ?? "bn").toUpperCase(); // BN | EN
const env = (name, fallback) => process.env[`${name}_${LANG}`] || process.env[name] || fallback;
const DEFAULT_EDGE = { BN: "bn-IN-TanishaaNeural", EN: "en-US-AndrewNeural" };
// Prefer project-local venv (python3 -m venv .venv && .venv/bin/pip install edge-tts), else PATH
const EDGE_BIN = fs.existsSync(path.join(ROOT, ".venv/bin/edge-tts")) ? path.join(ROOT, ".venv/bin/edge-tts") : "edge-tts";
console.log(`Language ${LANG}, provider ${provider}`);

if (provider === "none") die("TTS_PROVIDER=none — skipping voiceover.");

function isValidAudio(file) {
  try {
    return fs.statSync(file).size > 0 && audioDuration(file) > 0;
  } catch {
    return false;
  }
}

async function tts(text, outFile, opts = {}) {
  if (provider === "edge") {
    const voice = opts.voice ?? data.voice ?? env("EDGE_VOICE", DEFAULT_EDGE[LANG]);
    const rate = opts.rate ?? data.rate ?? env("EDGE_RATE", "+0%");
    const pitch = opts.pitch ?? data.pitch ?? "+0Hz";
    // edge-tts service intermittently returns "No audio was received" — retry with backoff.
    for (let attempt = 1; attempt <= 6; attempt++) {
      try {
        execFileSync(EDGE_BIN, ["--voice", voice, `--rate=${rate}`, `--pitch=${pitch}`, "--text", text, "--write-media", outFile], {
          stdio: ["ignore", "ignore", "pipe"],
        });
        if (isValidAudio(outFile)) return;
      } catch (e) {
        const msg = (e.stderr?.toString() ?? "").trim().split("\n").pop();
        if (attempt === 6) die(`edge-tts failed after ${attempt} attempts: ${msg}`);
      }
      fs.rmSync(outFile, { force: true });
      await new Promise((r) => setTimeout(r, 800 * attempt));
      console.log(`  retry ${attempt}…`);
    }
    return;
  }
  if (provider === "openai") {
    if (!process.env.OPENAI_API_KEY) die("OPENAI_API_KEY missing");
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts",
        voice: opts.voice ?? data.voice ?? env("OPENAI_TTS_VOICE", "alloy"),
        input: text,
        response_format: "mp3",
      }),
    });
    if (!res.ok) die(`OpenAI TTS failed: ${res.status} ${await res.text()}`);
    fs.writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
    return;
  }
  if (provider === "elevenlabs") {
    const key = process.env.ELEVENLABS_API_KEY;
    const voice = opts.voice ?? data.voice ?? env("ELEVENLABS_VOICE_ID");
    if (!key || !voice) die(`ELEVENLABS_API_KEY / ELEVENLABS_VOICE_ID_${LANG} missing`);
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ text, model_id: process.env.ELEVENLABS_MODEL ?? "eleven_multilingual_v2" }),
    });
    if (!res.ok) die(`ElevenLabs failed: ${res.status} ${await res.text()}`);
    fs.writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
    return;
  }
  die(`Unknown TTS_PROVIDER: ${provider}`);
}

// Approximate word timings: spread words over audio length, weighted by character count.
function estimateCaptions(text, dur, offset = 0) {
  const words = text.split(/\s+/).filter(Boolean);
  const weights = words.map((w) => Array.from(w).length + 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let t = offset + 0.05;
  const usable = Math.max(0.1, dur - 0.1);
  return words.map((word, i) => {
    const len = (weights[i] / total) * usable;
    const w = { word, start: +t.toFixed(3), end: +(t + len).toFixed(3) };
    t += len;
    return w;
  });
}

// Join segment files with a short silence between them (re-encode to one mp3).
function concatAudio(files, outFile) {
  const args = ["-loglevel", "error", "-y"];
  const parts = [];
  files.forEach((f, i) => {
    args.push("-i", f);
    parts.push(`[${i}:a]aresample=24000,aformat=channel_layouts=mono[a${i}]`);
  });
  const chain = files.map((_, i) => (i ? `[gap${i}][a${i}]` : `[a0]`)).join("");
  const gaps = files.slice(1).map((_, i) => `anullsrc=r=24000:cl=mono,atrim=0:${GAP_SEC}[gap${i + 1}]`);
  const n = files.length * 2 - 1;
  args.push("-filter_complex", [...parts, ...gaps, `${chain}concat=n=${n}:v=0:a=1[out]`].join(";"), "-map", "[out]", outFile);
  execFileSync("ffmpeg", args);
}

const allowOverwriteRecorded = process.argv.includes("--replace-recorded");
for (const scene of data.scenes) {
  if (!scene.narration?.trim()) continue;
  if (scene.voice_source === "recorded" && !allowOverwriteRecorded) {
    console.log(`  scene ${scene.id}: recorded voice — kept (use --replace-recorded to switch back to TTS)`);
    continue;
  }
  const segments = scene.segments?.length ? scene.segments : [{ text: scene.narration, tts_text: scene.tts_text }];
  const rel = `audio/scene-${scene.id}.mp3`;
  const file = path.join(dir, rel);
  if (fs.existsSync(file) && !isValidAudio(file)) fs.rmSync(file); // leftover from a failed run
  const captions = [];
  if (force || !fs.existsSync(file)) {
    console.log(`TTS scene ${scene.id}${segments.length > 1 ? ` (${segments.length} voices)` : ""}…`);
    if (segments.length === 1) {
      await tts(segments[0].tts_text || segments[0].text, file, segments[0]);
    } else {
      const segFiles = [];
      for (const [k, seg] of segments.entries()) {
        const f = path.join(dir, `audio/scene-${scene.id}-part${k + 1}.mp3`);
        await tts(seg.tts_text || seg.text, f, seg);
        segFiles.push(f);
      }
      concatAudio(segFiles, file);
    }
  }
  const dur = audioDuration(file);
  // Captions: per segment when part files exist (accurate per-voice timing), else spread over whole clip
  const partFiles = segments.map((_, k) => path.join(dir, `audio/scene-${scene.id}-part${k + 1}.mp3`));
  if (segments.length > 1 && partFiles.every(isValidAudio)) {
    let offset = 0;
    segments.forEach((seg, k) => {
      const d = audioDuration(partFiles[k]);
      captions.push(...estimateCaptions(seg.text, d, offset));
      offset += d + GAP_SEC;
    });
  } else {
    captions.push(...estimateCaptions(scene.narration, dur));
  }
  scene.audio = rel;
  // --force re-fits durations to the new audio; otherwise only ever extend
  scene.duration_sec = +(force ? Math.max(2.5, dur + PAD_SEC) : Math.max(scene.duration_sec ?? 0, dur + PAD_SEC)).toFixed(2);
  scene.captions = captions;
  console.log(`  scene ${scene.id}: audio ${dur.toFixed(2)}s → duration ${scene.duration_sec}s`);
}

writeScenes(dir, data);
const total = data.scenes.reduce((a, s) => a + s.duration_sec, 0);
console.log(`Done. Total ${total.toFixed(1)}s`);
