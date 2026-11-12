// Shapes returned by the Laravel API (see api/app/Http/Resources).
export type VideoStatus =
  | "draft" | "queued" | "planning" | "awaiting_approval" | "building" | "review" | "ready" | "failed" | "cancelled";
export type RunStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";
export type RunKind = "plan" | "build" | "feedback";
export type Language = "bn" | "en";

export interface User {
  id: number;
  name: string;
  email: string;
  locale: string;
  theme: "light" | "dark" | "system";
  timezone: string;
}

export interface Series {
  id: number;
  slug: string;
  name: string;
  folder: string;
  logo_path: string | null;
  outro: string | null;
  theme: Record<string, unknown> | null;
  rules: string | null;
  videos_count?: number;
  updated_at: string;
}

export interface Asset {
  id: number;
  kind: "voice" | "upload" | "mp4" | "zip" | "thumb";
  original_name: string | null;
  size: number;
  mime: string | null;
  url: string;
  created_at: string;
}

export interface Version {
  id: number;
  number: number;
  feedback: string | null;
  duration_sec: number | null;
  assets?: Asset[];
  created_at: string;
}

export interface Run {
  id: number;
  video_id: number;
  video_version_id: number | null;
  kind: RunKind;
  status: RunStatus;
  input: string | null;
  current_step: string | null;
  cancel_requested: boolean;
  error: string | null;
  num_turns: number | null;
  cost_usd: number | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export interface RunEvent {
  id: number;
  run_id: number;
  type: string;
  step: string | null;
  message: string | null;
  created_at: string;
}

export interface Video {
  id: number;
  title: string;
  slug: string;
  language: Language;
  mode: "agent" | "template";
  status: VideoStatus;
  context: string | null;
  script: string;
  plan: string | null;
  target_seconds: number | null;
  series?: Series;
  voice?: Asset | null;
  current_version?: Version | null;
  versions?: Version[];
  active_run?: Run | null;
  created_at: string;
  updated_at: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { current_page: number; last_page: number; total: number; per_page: number };
}

export interface Health {
  app: string;
  laravel: string;
  php: string;
  database: string;
  time: string;
}
