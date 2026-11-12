#!/bin/bash
# Usage: scripts/splice-words.sh <slug> <scene-id> <from-sec> <to-sec> [bn|en]
# Re-transcribes [from,to) of a scene clip and replaces those words in audio/scene-N.words.json
# (fixes spots Whisper dropped or garbled). Then run: npm run align-captions -- <slug>
# Tip: English-heavy Banglish lines often transcribe better with "en" (Latin output still aligns).
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SLUG=$1; N=$2; F=$3; T=$4; L=${5:-bn}
W="$ROOT/public/projects/$SLUG/audio/scene-$N.words.json"
A="$ROOT/public/projects/$SLUG/audio/scene-$N.mp3"
TMP=$(mktemp -d)
ffmpeg -loglevel error -y -ss "$F" -to "$T" -i "$A" "$TMP/sp.mp3"
"$ROOT/.venv/bin/python" -I "$ROOT/scripts/transcribe.py" "$TMP/sp.mp3" "$TMP/sp.json" --lang "$L" 2>/dev/null | grep '→' || true
node -e '
const fs=require("fs");const [W,F,T,J]=process.argv.slice(1);const f=+F,t=+T;
const w=JSON.parse(fs.readFileSync(W));
const n=JSON.parse(fs.readFileSync(J)).words.map(x=>({...x,start:+(x.start+f).toFixed(2),end:+(x.end+f).toFixed(2)}));
w.words=w.words.filter(x=>x.start<f-0.05||x.start>=t).concat(n).sort((a,b)=>a.start-b.start);
fs.writeFileSync(W,JSON.stringify(w,null,1));' "$W" "$F" "$T" "$TMP/sp.json"
rm -rf "$TMP"
