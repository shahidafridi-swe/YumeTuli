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
- Login (single owner account, created by a seed command).
- Series presets (Dev Diary, hizibizi): logo, theme, outro, caption style, folder.
- New video form: series, title, context/brief, script, voice mp3, target length, language.
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

- **web:** UI only. Talks to Laravel via REST (Sanctum cookie auth) and listens to Reverb for live updates.
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
│   ├── api.Dockerfile
│   ├── worker.Dockerfile   PHP + Node + ffmpeg + Chromium + Claude CLI
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
| `series` | id, slug (`devdiary`, `hizibizi`), name, folder (`design-patterns`, `hizibizi`), logo_path, outro, theme_json, rules_md |
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
| POST | `/auth/login`, `/auth/logout` | session login (Sanctum SPA) |
| GET/PATCH | `/me` | profile, locale, theme |
| GET/POST/PATCH | `/series`, `/series/{id}` | presets |
| GET/POST | `/videos` | list (filters), create (multipart: script, voice) |
| GET/PATCH/DELETE | `/videos/{id}` | detail, edit draft |
| POST | `/videos/{id}/plan` | start the plan run |
| POST | `/videos/{id}/approve` | approve the plan and start the build run |
| POST | `/videos/{id}/feedback` | feedback text, starts a new build run (resume) |
| POST | `/videos/{id}/cancel` | stop the running process |
| GET | `/videos/{id}/runs`, `/runs/{id}/events` | history + log |
| GET | `/versions/{id}/download/{mp4\|zip\|thumb}` | signed file download |
| GET | `/versions/{id}/stream` | video preview (range requests) |

Websocket channel: `private-video.{id}` with events `RunStatusChanged`, `RunEventCreated`, `VersionCreated`.

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

**Auth:** the `claude-auth` volume holds the Claude login (`~/.claude` of the worker user). It is set up once per PC: `docker compose run --rm worker claude` and log in. No API key in Phase 1.

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
- **Theme:** CSS variables (`--bg`, `--fg`, `--muted`, `--border`) with `light`, `dark` and `system` options. Saved in the cookie and the user row, with no flash on load.
- **Stack:** Tailwind CSS + shadcn/ui (restyled to monochrome), TanStack Query for data, Laravel Echo for Reverb.
- **i18n:** `next-intl`.
  - All text lives in `web/messages/en.json`, and locale is in the URL (`/en/...`).
  - Bangla later means adding `bn.json` with a Bangla font.
  - Laravel uses `lang/en/*.php` for API messages.
  - Dates are formatted with Intl in the user's timezone (Asia/Dhaka).

---

## 7. Docker

| Service | Image / build | Notes |
|---|---|---|
| `mysql` | mysql:8.0 | volume `mysql-data` |
| `api` | docker/api.Dockerfile (PHP 8.4-fpm + nginx) | port 8000 |
| `worker` | docker/worker.Dockerfile | `php artisan queue:work --timeout=5400`, volumes `media`, `engine`, `claude-auth` |
| `scheduler` | same as api | `php artisan schedule:work` |
| `reverb` | same as api | `php artisan reverb:start`, port 8080 |
| `web` | docker/web.Dockerfile (Node 22) | port 3000 |
| later | minio, cloudflared | |

- `.env.example` lists every variable. `.env` is never committed.
- First run:
  ```bash
  cp .env.example .env
  docker compose up -d
  docker compose exec api php artisan migrate --seed
  docker compose run --rm worker claude    # log in once
  ```
- `make backup` / `make restore` dump MySQL and the media volume, for moving to another PC.

---

## 8. Security

- Only the owner account exists; login rate-limited; Sanctum session cookies.
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
| 6 | Acceptance | spoon rebuilt end-to-end from the browser, README written |

Each milestone ends with something you can run and see.

---

## 11. Decisions

- **Engine copy:** a copy of ai-video goes into `engine/` without `node_modules`, `out` and `recordings`, and becomes YumeTuli's own. ai-video is not changed.
- **Queue driver:** `database`, so no Redis is needed. It can switch to Redis later if needed.
- **One job at a time:** rendering is CPU-heavy (16 cores here, 22 GB RAM).
- **Claude:** CLI headless (`claude -p`) with the subscription login. Agent SDK or API key only if the site moves to a server.
