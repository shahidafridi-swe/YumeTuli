@AGENTS.md

## Claude Code
- Full pipeline: `/make-video "<topic>" 30s bn|en|both` (skill in `.claude/skills/make-video`).
- Subagents in `.claude/agents/` — run voiceover-agent and asset-generator in parallel.
- video-qa can Read frame images; always QA before declaring a video done.

## Inside YumeTuli
- This engine is driven by the YumeTuli worker (`claude -p` from `/engine`); prompts come from
  `api/resources/prompts/`. Root rules: `../CLAUDE.md` (six invariants, spec workflow).
- Formats: `src/format.ts` + `useFormat()`; outros: `src/brand/` (custom ones in `src/brand/custom/`).
- Deliverables: video + thumbnail only. Shared changes must keep existing episodes identical.

