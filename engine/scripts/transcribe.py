"""Transcribe a voice recording with word timestamps (local, free).

Usage: .venv/bin/python -I scripts/transcribe.py <audio> <out.json> [--lang bn] [--model large-v3-turbo]
Output: {"duration": s, "words": [{"word","start","end"}], "segments": [{"start","end","text"}]}
"""
import json
import subprocess
import sys

import numpy as np

from faster_whisper import WhisperModel

args = sys.argv[1:]
audio, out = args[0], args[1]
lang = args[args.index("--lang") + 1] if "--lang" in args else "bn"
model_name = args[args.index("--model") + 1] if "--model" in args else "large-v3-turbo"

model = WhisperModel(model_name, device="cpu", compute_type="int8")
# Decode with ffmpeg (avoids PyAV version incompatibilities): 16 kHz mono float32
pcm = subprocess.run(
    ["ffmpeg", "-loglevel", "error", "-i", audio, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
    check=True,
    capture_output=True,
).stdout
samples = np.frombuffer(pcm, dtype=np.float32)
SR = 16000
duration = len(samples) / SR

# Whisper tends to skip text in long Bangla stretches. Transcribe short chunks (≤ ~12s) cut at the
# quietest points so every part of the recording gets its own pass.
def chunk_bounds(x, max_len=12.0, min_len=4.0):
    win = int(0.05 * SR)
    energy = np.array([np.sqrt(np.mean(x[i : i + win] ** 2) + 1e-12) for i in range(0, len(x) - win, win)])
    bounds, start = [0.0], 0.0
    while duration - start > max_len:
        lo, hi = int((start + min_len) / 0.05), int((start + max_len) / 0.05)
        cut = (lo + int(np.argmin(energy[lo:hi]))) * 0.05
        bounds.append(cut)
        start = cut
    bounds.append(duration)
    return bounds

bounds = chunk_bounds(samples)
words, segs = [], []
for a, b in zip(bounds[:-1], bounds[1:]):
    chunk = samples[int(a * SR) : int(b * SR)]
    segments, _ = model.transcribe(chunk, language=lang, word_timestamps=True, vad_filter=False, condition_on_previous_text=False, beam_size=5)
    for s in segments:
        segs.append({"start": round(a + s.start, 2), "end": round(a + s.end, 2), "text": s.text.strip()})
        for w in s.words or []:
            words.append({"word": w.word.strip(), "start": round(a + w.start, 2), "end": round(a + w.end, 2)})
        print(f"[{a + s.start:6.2f} → {a + s.end:6.2f}] {s.text.strip()}", flush=True)

class _Info:
    pass

info = _Info()
info.duration = duration

with open(out, "w", encoding="utf-8") as f:
    json.dump({"duration": info.duration, "words": words, "segments": segs}, f, ensure_ascii=False, indent=1)
print(f"words: {len(words)}  →  {out}")
