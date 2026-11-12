# AI Shorts Factory

Claude Code / Codex diye Bangla (ba English) shorts/reels banano.

## Setup
```bash
npm install
cp .env.example .env          # API key dorkar hole bosao
python3 -m venv .venv && .venv/bin/pip install edge-tts   # free bn/en voiceover
```

## Use (Claude Code)
```
/make-video "3 ta habit jeta productivity 2x kore" 30s bn     # shudhu Bangla
/make-video "3 habits that double productivity" 30s en      # shudhu English
/make-video "3 ta habit jeta productivity 2x kore" 30s both   # Bangla + English, same images
```

## Use (Codex)
> AGENTS.md follow kore "<topic>" niye 30s Bangla short banao. Script ar scenes er por amar approval nao.

## Manual
```bash
npm run new -- my-video-bn "Title" --lang=bn
# edit public/projects/my-video-bn/script.md + scenes.json
npm run voice -- my-video-bn
npm run images -- my-video-bn        # optional, paid
npm run render -- my-video-bn --preview
npm run frames -- my-video-bn
npm run render -- my-video-bn     # out/my-video-bn.mp4
npm run localize -- my-video-bn en  # English copy: my-video-en (text tarpor translate korte hobe)
npm run studio                    # live preview
```
