// Contract between all agents. Every project's scenes.json must match this shape.

export type Transition = "fade" | "slide" | "zoom" | "none";
export type TextAnimation = "pop" | "typewriter" | "slide-up" | "none";
export type TextPosition = "top" | "center" | "bottom";

import type { Layout } from "./layouts/types";

export type VoiceSegment = { text: string; tts_text?: string; voice?: string; rate?: string; pitch?: string };

export type CaptionWord = { word: string; start: number; end: number }; // seconds, relative to scene start

export type Scene = {
  id: number;
  duration_sec: number;
  narration: string;
  on_screen_text: string;
  visual: string; // prompt / description for asset-generator
  image?: string | null; // path relative to project dir, e.g. "assets/scene-1.png"
  video?: string | null; // optional clip, relative to project dir
  content_offset?: number; // px to shift the illustration down (vertical centering between title and captions)
  illustration?: string | null; // code-drawn animated scene key from src/illustrations/registry.ts (free, no API)
  layout?: Layout | null; // tech explainer template: code / terminal / table / compare / bullets / tree (src/layouts)
  voice_source?: "tts" | "recorded"; // "recorded" = imported real voice, never overwritten by TTS
  tts_text?: string | null; // what TTS speaks if it differs from narration (e.g. English terms spelled in Bangla script)
  audio?: string | null; // per-scene voiceover, e.g. "audio/scene-1.mp3"
  segments?: VoiceSegment[] | null; // multi-voice narration (narrator + characters); joined text should equal narration
  captions?: CaptionWord[] | null;
  transition?: Transition;
  text_animation?: TextAnimation;
  text_position?: TextPosition;
  emoji?: string | null;
  source_narration?: string; // temporary, set by `npm run localize`
  source_on_screen_text?: string;
};

export type Theme = {
  bg: string;
  bg2: string;
  text: string;
  accent: string;
  title_top?: number; // px from top for text_position "top" titles (default 260)
  caption_bottom?: number;
  caption_color?: string; // caption text colour (default theme.text) — e.g. white on a dark pill over a light bg
  caption_accent?: string; // active-word colour (default theme.accent)
  caption_bg?: string; // caption pill background
  caption_style?: "pill" | "shadow"; // shadow = no box, text over the scene with a soft shadow (full-screen videos)
  logo_top?: number; // px from top for the logo (default 56); move it with the content block when centring // px from bottom to the caption box (default 380)
  title_scale?: number; // multiply on-screen title size (e.g. 0.75 for code-heavy explainers)
  warn?: string; // problem/warning color, used by ~word~ in on-screen text
  stroke?: string; // optional outline color for on-screen text/captions (helps on bright backgrounds)
  font: "Inter" | "NotoSansBengali" | "HindSiliguri" | "Fredoka" | "BalooDa2";
};

export type ShortProps = {
  project: string; // folder name under public/projects
  title: string;
  language: "bn" | "en";
  voice?: string | null; // TTS voice override for this project (else from .env by language)
  rate?: string | null; // e.g. "-5%"
  pitch?: string | null; // e.g. "+10Hz"
  characters?: Record<string, { voice: string; rate?: string; pitch?: string }>; // voice cast, for reference
  sibling?: string | null; // slug of the other-language version, e.g. "topic-en" for "topic-bn"
  fps: number;
  format?: "vertical" | "landscape"; // frame: 1080×1920 (default) or 1920×1080, see src/format.ts
  theme: Theme;
  music?: string | null; // relative to project dir
  music_volume?: number;
  logo_plate?: boolean; // light rounded plate behind the logo (for a dark logo over busy art)
  outro?: "devdiary" | "hizibizi" | null; // house outro: video fades to charcoal, then the brand logo outro (cream on dark, 4 s) fades in
  max_duration_sec?: number; // validation limit (default 90s); set for long episodes
  logo?: string | null; // channel logo, relative to public/ (e.g. "brand/dev-diary-logo.png"), shown top-right
  show_captions?: boolean;
  scenes: Scene[];
};
