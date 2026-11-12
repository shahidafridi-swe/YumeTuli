"""Synthesise a light zipper sound track (no samples, no API).
Usage: .venv/bin/python -I scripts/zip-sfx.py <events.json> <out.wav> <total_sec>
events.json: {"runs": [[start, end, ticks_per_sec, gain], ...], "clicks": [[time, gain], ...], "clinks": [[time, gain], ...], "tings": [[time, gain], ...], "whooshes": [[time, gain], ...], "dings": [[time, gain], ...], "roomtone": gain}
(all keys optional). A clink = ice cube hitting glass: bright, short ringing partials.
A run = slider moving: a train of tiny plastic ticks (fast runs blur into a 'zzzip').
A click = one tooth locking / unlocking.
"""
import json, sys, wave
import numpy as np

SR = 44100
ev = json.load(open(sys.argv[1]))
total = float(sys.argv[3])
out = np.zeros(int(SR * (total + 0.5)))
rng = np.random.default_rng(7)

def tick(gain, length=0.012, bright=1.0):
    n = int(SR * length)
    noise = rng.standard_normal(n)
    noise = np.diff(noise, prepend=0) * bright + noise * (1 - bright)  # brighter = more 'plastic'
    env = np.exp(-np.linspace(0, 7, n))
    return noise * env * gain

def put(sig, t):
    i = int(t * SR)
    if i >= len(out):
        return
    j = min(len(out), i + len(sig))
    out[i:j] += sig[: j - i]

for start, end, rate, gain in ev.get("runs", []):
    t = start
    while t < end:
        jitter = rng.uniform(-0.15, 0.15) / max(rate, 1)
        put(tick(gain * rng.uniform(0.7, 1.0), bright=0.85), t + jitter)
        t += 1.0 / rate
    if rate > 8:  # add a soft continuous rasp under fast runs
        n = int((end - start) * SR)
        rasp = np.diff(rng.standard_normal(n), prepend=0) * 0.25 * gain
        fade = np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / (0.05 * SR))
        put(rasp * fade, start)

for t, gain in ev.get("clicks", []):
    put(tick(gain, 0.018, 0.95), t)
    put(tick(gain * 0.6, 0.014, 0.95), t + 0.035)

for t, gain in ev.get("clinks", []):
    n = int(SR * 0.45)
    tt = np.arange(n) / SR
    tone = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) for f, a, d in [(2650, 1.0, 14), (4120, 0.6, 18), (5870, 0.35, 24), (1830, 0.25, 10)])
    tone += rng.standard_normal(n) * np.exp(-tt * 120) * 0.6  # tap transient
    put(tone * gain * 0.5, t)

for t, gain in ev.get("tings", []):  # light metallic spoon ting
    n = int(SR * 0.9)
    tt = np.arange(n) / SR
    tone = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) for f, a, d in [(3150, 1.0, 6), (4790, 0.5, 9), (7020, 0.25, 14), (1570, 0.2, 5)])
    put(tone * gain * 0.35, t)

for t, gain in ev.get("whooshes", []):  # soft airy sweep
    n = int(SR * 0.5)
    tt = np.arange(n) / SR
    noise = rng.standard_normal(n)
    k = 1 + (tt / tt[-1]) * 20
    sweep = np.zeros(n)
    acc = 0.0
    for i in range(n):  # one-pole low-pass whose cutoff rises over time
        a = min(0.9, 0.02 * k[i])
        acc += a * (noise[i] - acc)
        sweep[i] = acc
    env = np.sin(np.pi * tt / tt[-1]) ** 2
    put(sweep * env * gain * 1.2, t)

for t, gain in ev.get("dings", []):  # soft bell
    n = int(SR * 1.6)
    tt = np.arange(n) / SR
    tone = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) for f, a, d in [(1046.5, 1.0, 2.6), (2093, 0.35, 3.5), (3140, 0.18, 5), (1568, 0.25, 3)])
    put(tone * gain * 0.45, t)

if ev.get("roomtone"):  # soft brown-noise room tone under everything
    b = np.cumsum(rng.standard_normal(len(out)))
    b -= np.convolve(b, np.ones(2000) / 2000, mode="same")
    b /= (np.max(np.abs(b)) or 1)
    out += b * ev["roomtone"]

peak = np.max(np.abs(out)) or 1
out = out / peak * 10 ** (-14 / 20)  # light: peaks at -14 dBFS before music_volume
pcm = (np.clip(out, -1, 1) * 32767).astype(np.int16)
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("wrote", sys.argv[2], f"{len(pcm)/SR:.1f}s")
