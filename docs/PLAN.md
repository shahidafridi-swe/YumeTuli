# YumeTuli — Plan

YumeTuli is a personal web studio that replaces the CLI workflow: write the context, add the script and voice file, press **Generate**, watch progress, review, download, and (later) schedule posts to social media.

- **User:** single owner (no sign-up, no teams). Multi-user is not planned.
- **UI language:** English first, built for i18n from day one (Bangla and more later).
- **Design:** black and white only, with light and dark mode.
- **Runs:** locally in Docker. Any PC with Docker + a Claude subscription can run it.
- `/home/shahid-afridi/AFRIDI/ai-video` stays untouched. YumeTuli gets its own copy of the engine.

---

## 1. Scope

### Phase 1 — Generate videos from the browser (MVP)
- Login with JWT (single owner account, created by a seed command).
- Projects (one channel/page each: Dev Diary by Afridi, hizibizi), each with its own series.
  - Logo upload (plus an optional variant for light backgrounds).
  - Outro: the house logo animation, a custom animation designed by Claude, an uploaded video, or none, with vertical and landscape previews.
- Series inside a project: folder, theme, house rules.
- Deliverables: the video and the thumbnail only (no source zip).
- New video form: series, title, context/brief, script, voice mp3, target length, language, format (vertical 9:16 or landscape 16:9).
- Two-step generation: **Plan → Approve → Build**.
- Live progress (steps + log) over websocket.
- Preview player, written feedback → regenerate (new version), version history.
- Download MP4, source zip, thumbnail.
- Light/dark mode, English UI with i18n structure.

### Phase 2 — Library + YouTube
- Media library (all videos, thumbnails, voices; filter by series/status).
- Upload a ready-made video for posting.
- Connect YouTube (OAuth), schedule or publish now, post status + link.

### Phase 3 — More platforms
- Facebook Page, Instagram, TikTok, LinkedIn (X optional, paid API).
- Per-platform title/description/hashtags, AI suggestions.
- Content calendar (month/week, drag to reschedule).
- Cloudflare Tunnel for platforms that need a public HTTPS URL.

### Phase 4 — Later
- MinIO storage, analytics, script → voice (ElevenLabs API), one-click English version, caption editor, Bangla UI.

**Not in scope:** multi-user, billing, public sign-up, mobile app.

---

## 2. Architecture

```
Browser
  │
web (Next.js 16) ──REST──▶ api (Laravel 13) ──▶ mysql (8.0)
  ▲                          │  queue (database driver)
  └──── websocket ◀── reverb │
                             ▼
                    worker (Laravel queue:work
                            + Node 22 + ffmpeg + Chromium + Claude CLI
                            + engine/)
                             │ claude -p … in engine/
                             ▼
                    storage volume (local disk → MinIO later)
scheduler (Laravel schedule:run) — posting, cleanup
```

- **web:** UI only. Talks to Laravel via REST and listens to Reverb for live updates.
- **Auth (JWT, `php-open-source-saver/jwt-auth`):**
  - Access token 15 min; refresh within 14 days; logout and refresh blacklist the old token.
  - The Next.js server keeps the token in an httpOnly cookie and adds `Authorization: Bearer` when calling Laravel (BFF), so browser JS never sees it.
  - `<audio>`/`<video>` use short-lived signed URLs.
  - Login and refresh are limited to 5 per minute per email + IP.
- **api:** auth, CRUD, uploads, dispatches jobs, serves files.
- **worker:** same Laravel code base, runs `queue:work`. Runs Claude Code headless inside `engine/`. One video job at a time (rendering is CPU-heavy).
- **engine:** copy of ai-video (Remotion, scripts, stories, brand assets, AGENTS.md). Claude edits and renders here.
- **Storage:** Laravel `Storage` disk `media`. Phase 1 = `local` driver on a volume. Later = `s3` driver pointing at MinIO (config change only).

### Folder layout
```
YumeTuli/
├── web/                 Next.js app
├── api/                 Laravel app (also used by worker, scheduler, reverb)
├── engine/              copy of ai-video (no node_modules, out, recordings)
├── docker/
│   ├── api.Dockerfile      targets: api, worker (+ Node, ffmpeg, Chromium, Claude CLI)
│   └── web.Dockerfile
├── docs/
│   ├── PLAN.md
│   └── memory/          project rules moved out of ~/.claude (centring, logos, outro…)
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 3. Database (MySQL)

| Table | Key columns |
|---|---|
| `users` | id, name, email, password, locale, theme (`light`/`dark`/`system`) |
| `projects` | id, slug, name, logo_path, logo_alt_path, logo_ratio, outro_mode (none/common/custom/video), outro_key, outro_brief, outro_video_path, outro_duration_sec, outro previews, outro_status/error |
| `series` | id, project_id, slug (`design-patterns`, `why-is-that`), name, folder, theme_json, rules_md |
| `videos` | id, series_id, title, slug, language, context, script, target_seconds, mode (`agent`/`template`), status, current_version_id, claude_session_id |
| `video_versions` | id, video_id, number, feedback, mp4_path, zip_path, thumb_path, duration_sec, created_at |
| `assets` | id, video_id nullable, kind (`voice`/`upload`/`thumb`/`mp4`/`zip`), disk, path, size, mime |
| `runs` | id, video_id, version_id nullable, kind (`plan`/`build`/`feedback`), status, started_at, finished_at, exit_code, error |
| `run_events` | id, run_id, type (`step`/`log`/`tool`/`message`), step, payload_json, created_at |

Phase 2 and later: `social_accounts`, `posts`, `post_targets`, `analytics_snapshots`.

### Video status
`draft → queued → planning → awaiting_approval → building → review → ready`
- From `review`, feedback goes back to `building` and creates a new version.
- Any step can go to `failed`, which offers retry.
- `cancelled` is available while queued or running.

---

## 4. API (Laravel, `/api/v1`)

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/login`, `/auth/refresh`, `/auth/logout` | JWT login, refresh, logout |
| GET/PATCH | `/me` | profile, locale, theme |
| GET/POST/PATCH | `/series`, `/series/{id}` | presets |
| GET/POST | `/videos` | list (filters), create (multipart: script, voice) |
| GET/PATCH/DELETE | `/videos/{id}` | detail, edit draft |
| POST | `/videos/{id}/plan` | start the plan run |
| POST | `/videos/{id}/approve` | approve the plan and start the build run |
| POST | `/videos/{id}/feedback` | feedback text, starts a new build run (resume) |
| POST | `/videos/{id}/retry` | re-run the last failed run |
| POST | `/videos/{id}/cancel` | stop the running process (or drop a queued run) |
| POST | `/videos/{id}/ready` | mark the reviewed version as final |
| GET | `/videos/{id}/runs`, `/runs/{id}/events?after=<id>` | history + log (catch up after reconnect) |
| POST | `/broadcasting/auth` | Reverb private channel auth (JWT) |
| GET | `/assets/{id}/download?signature=…` | signed file download / stream (Range supported) |

Websocket channel: `private-video.{id}` with events `run.updated` (run status/step + video status) and `run.event` (one log line).

---

## 5. Claude integration

Runs inside the worker container, working dir `engine/`, so `AGENTS.md`/`CLAUDE.md` and the project rules apply.

**Plan run**
```bash
claude -p "<prompt built from form + series preset + rules>
Write the scene plan to plan.md and stop. Do not render." \
  --output-format stream-json --verbose \
  --allowedTools "Read,Write,Edit,Glob,Grep,Bash(npm run *),Bash(ffmpeg *),Bash(ffprobe *),Bash(python3 scripts/*)" \
  --max-turns 80
```
- The worker reads `session_id` from the output and saves it on the video. Status becomes `awaiting_approval`, and the UI shows `plan.md`.

**Build run (approve)**
```bash
claude -p "Approved. Build it: follow docs/memory video-request-workflow. At the end print
RESULT {\"mp4\":…, \"zip\":…, \"thumb\":…, \"duration\":…}" --resume <session_id> …
```

**Feedback run**
```bash
claude -p "Feedback: <text>. Fix, re-render, print RESULT." --resume <session_id> …
```

**Output handling**
- Each stream-json line becomes a `run_events` row and is broadcast to the UI.
- Known command names map to friendly steps: import-voice, align-captions, render, QA, thumbnail, zip.
- The `RESULT` line is parsed, files are copied to the `media` disk, and a `video_versions` row is created.
- **Errors:** a non-zero exit, a missing RESULT or the usage limit marks the run as `failed` with the message. Retry is offered.
- **Limits:** one worker process; a job timeout of 90 min; cancel kills the process group.

**Verified in Milestone 2:**
- Claude headless runs in the worker with cwd `/engine` and loads `engine/CLAUDE.md`/`AGENTS.md` automatically.
- `stream-json` gives `system`, `assistant` (tool_use), `user` (tool_result) and a final `result` with `session_id` and `permission_denials`.
- Tools outside `--allowedTools`, and paths outside `/engine`, are denied (not prompted).
- `--resume <session_id>` keeps the context.
- The Laravel process must pass stdin `/dev/null`, otherwise Claude waits 3 s for stdin.
- `total_cost_usd` is an estimate only; the subscription is not billed per call.

**Implemented in Milestone 4:**
- **Main pieces:**
  - `RunService` is the state machine.
  - `RunVideoJob` runs one step.
  - `ClaudeProcess` uses `setsid`, so cancel and timeout kill Claude and everything it started.
  - `StreamParser` turns stream-json into friendly steps.
  - `Workspace` handles the files.
  - `LiveFeed` stores events and broadcasts them.
- **Files:**
  - Each video's inputs go to `engine/inbox/<id>/`: `script.md`, `brief.md`, `voice.*`, `plan.md`.
  - The finished files named in RESULT are copied to `media/videos/<id>/v<n>/` as assets of the version.
  - A path outside the engine is refused.
- **Prompts:** templates in `api/resources/prompts/` (`plan`, `build`, `feedback`) plus `system.md`, which adds headless rules (no `cd`, one simple command per call).
- **Environment:**
  - Claude gets a clean environment, so no DB, JWT, app or Reverb secrets reach it.
  - The tool allowlist prevents accidents, not attacks (it allows `.venv/bin/python`). The container is the real boundary.
- **Real plan run:** about 2 minutes, around 20 turns, no blocked calls after the system prompt.
- **Tests:** a fake CLI (`tests/Fixtures/fake-claude`) drives the full plan → approve → feedback → ready cycle, failure, retry, the usage limit, a missing RESULT, path escape and cancel.

**Auth:** the `worker-home` volume holds the Claude login (`~/.claude` of the worker user). It is set up once per PC: `docker compose run --rm worker claude` and log in. No API key in Phase 1.

**Template mode** (later in Phase 1, or Phase 2): Claude writes only scenes.json using existing layouts. It is faster and cheaper.

---

## 6. Web (Next.js 16, App Router, TypeScript)

### Pages
- `/login`
- `/` — dashboard: recent videos, running job, quick "New video".
- `/videos` — list with filters (series, status, language).
- `/videos/new` — form (series, title, language, context, script, voice upload, target length, mode).
- `/videos/[id]`:
  - Header: status and steps.
  - Live log panel.
  - Plan view with Approve.
  - Preview player and version switcher.
  - Feedback box and downloads.
- `/series`, `/series/[id]` — presets.
- `/settings` — profile, language, theme, Claude connection check.

### UI rules
- **Black and white only:** grey shades are allowed, no brand colours. Status uses shape, icon and text, not colour.
- **Theme:** CSS variables with `light`, `dark` and `system` options.
  - The choice is saved in the `yt_theme` cookie and the profile.
  - An inline script sets `<html data-theme>` before first paint, so there is no flash.
- **BFF:**
  - `src/app/api/[...path]/route.ts` forwards to Laravel with the JWT from the httpOnly `yt_token` cookie, and refreshes once on 401.
  - `src/proxy.ts` sends guests to `/login` and refreshes the token when it is under 60 s from expiry.
  - Login and logout are server actions.
- **Stack:** Tailwind CSS 4 with small own components (`web/src/components/ui`), lucide icons, TanStack Query for data, Laravel Echo + pusher-js for Reverb, react-markdown for plans.
- **i18n:** a small own layer (`web/src/i18n`) instead of next-intl, because Next 16 Cache Components and next-intl's routing do not fit together cleanly yet.
  - All text lives in `web/src/i18n/messages/en.json`. Keys are type-checked: a missing key fails `tsc`.
  - Adding Bangla means `bn.json` plus an entry in `LOCALES`/`CATALOGS` and in the API's `locales`. The Hind Siliguri font is already loaded.
  - Laravel uses `lang/en/*.php` for API messages.
  - Dates are formatted with Intl in the user's timezone (Asia/Dhaka).

---

## 7. Docker

| Service | Image / build | Notes |
|---|---|---|
| `mysql` | mysql:8.0 | volume `mysql-data` |
| `api` | docker/api.Dockerfile, target `api` (FrankenPHP: PHP 8.4 + web server) | port 8000, runs migrations on start |
| `worker` | docker/api.Dockerfile, target `worker` (+ Node 22, ffmpeg) | `php artisan queue:work --timeout=5400`, volumes `media`, `engine`, `claude-auth` |
| `scheduler` | same as api | `php artisan schedule:work` |
| `reverb` | same as api | `php artisan reverb:start`, port 8080 |
| `web` | docker/web.Dockerfile (Node 22) | port 3000 |
| later | minio, cloudflared | |

- `.env.example` lists every variable. `.env` is never committed.
- First run:
  ```bash
  cp .env.example .env
  docker compose up -d
  docker compose exec api php artisan db:seed   # migrations run automatically
  docker compose run --rm worker claude    # log in once
  ```
- `make backup` / `make restore` dump MySQL and the media volume, for moving to another PC.

---

## 8. Security

- Only the owner account exists; login rate-limited; JWT in an httpOnly cookie held by the Next.js server.
- Tests refuse to run unless the database is sqlite `:memory:` (protects the dev MySQL).
- Claude runs with an allowlist of tools (no `rm`, no network tools beyond what npm/render need), inside the container only.
- Uploads: mp3/wav/m4a only, size limit, stored with random names.
- Downloads via signed, expiring URLs.
- Secrets in `.env` (and encrypted DB columns for social tokens later). Nothing secret in images or git.

---

## 9. Testing

- **Laravel:** Pest feature tests for auth, video CRUD and status transitions. The Claude process is faked (a fixture stream-json file) so tests do not use the subscription.
- **Web:** typecheck, lint, and Playwright smoke tests (login, create video, see the log, theme toggle).
- **End-to-end acceptance:** rebuild an existing episode (hizibizi spoon) through the website. Its length, captions and look must match the CLI version.

---

## 10. Milestones (Phase 1)

| # | Milestone | Done when |
|---|---|---|
| 0 | Repo setup | `git init`, folder layout, engine copied from ai-video, memory rules in `docs/memory/` |
| 1 | Docker skeleton | `docker compose up` shows the Next.js page and the Laravel health endpoint |
| 2 | Worker proof | inside the container: Claude login works, `npm run render` of an existing project produces an MP4 |
| 3 | API core | login, series seed, video create with upload, migrations, tests |
| 4 | Runs | plan/approve/feedback jobs run Claude, events stored and broadcast, RESULT parsed into versions |
| 5 | Web UI | all Phase 1 pages, live log, preview, downloads, light/dark, i18n |
| 6 | Acceptance | spoon rebuilt end-to-end from the browser, README written — **done 2026-11-12**: plan 1m 24s, build 10m 3s, 73.6 s video (69.6 s + 4 s outro), −16.6 LUFS like the CLI cut, episode 3 still renders identically (SSIM 1.0) |

Each milestone ends with something you can run and see.

---

## 11. Decisions

- **Engine copy:** a copy of ai-video goes into `engine/` without `node_modules`, `out` and `recordings`, and becomes YumeTuli's own. ai-video is not changed.
- **Queue driver:** `database`, so no Redis is needed. It can switch to Redis later if needed.
- **One job at a time:** rendering is CPU-heavy (16 cores here, 22 GB RAM).
- **Claude:** CLI headless (`claude -p`) with the subscription login. Agent SDK or API key only if the site moves to a server.
