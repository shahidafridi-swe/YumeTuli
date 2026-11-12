#!/usr/bin/env bash
# Usage: npm run frames -- <slug> [every_sec=1]
# Extracts frames from out/<slug>.mp4 into out/frames/<slug>/ for visual QA.
set -euo pipefail
slug="${1:?Usage: npm run frames -- <slug> [every_sec]}"
every="${2:-1}"
root="$(cd "$(dirname "$0")/.." && pwd)"
video="$root/out/$slug.mp4"
[ -f "$video" ] || video="$root/out/$slug.preview.mp4"
[ -f "$video" ] || { echo "No render found for $slug. Run: npm run render -- $slug"; exit 1; }

dest="$root/out/frames/$slug"
rm -rf "$dest" && mkdir -p "$dest"
ffmpeg -loglevel error -i "$video" -vf "fps=1/$every,scale=540:-1" "$dest/frame-%03d.jpg"
echo "Frames: $dest ($(ls "$dest" | wc -l) files)"
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height -of compact "$video"
