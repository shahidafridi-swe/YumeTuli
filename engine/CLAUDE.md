@AGENTS.md

## Claude Code
- Full pipeline: `/make-video "<topic>" 30s bn|en|both` (skill in `.claude/skills/make-video`).
- Subagents in `.claude/agents/` — run voiceover-agent and asset-generator in parallel.
- video-qa can Read frame images; always QA before declaring a video done.
