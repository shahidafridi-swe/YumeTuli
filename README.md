# YumeTuli

Personal web studio for making vertical shorts: write the context, add the script and voice,
press **Generate**, review, download — later, schedule posts to social media.

- `web/` — Next.js UI (black & white, light/dark, i18n)
- `api/` — Laravel API, queue worker, scheduler, Reverb
- `engine/` — Remotion video engine (copied from ai-video; Claude Code builds videos here)
- `docker/` — Dockerfiles
- `docs/PLAN.md` — full plan and milestones
- `docs/memory/` — house rules for videos (centring, logos, outro, series)

## Run

```bash
cp .env.example .env      # fill APP_KEY (base64:…32 random bytes), DB_PASSWORD, DB_ROOT_PASSWORD
docker compose up -d --wait
```

- Web: http://localhost:3000 (log in with OWNER_EMAIL / OWNER_PASSWORD)
- API health: http://localhost:8000/api/v1/health
- Queue smoke test: `docker compose exec api php artisan tinker --execute="App\Jobs\PingJob::dispatch();"`
  then `docker compose logs worker`

Ports are bound to 127.0.0.1 only. MySQL is on host port 3307 (change in `.env`).

### Claude login (once per PC)
```bash
docker compose exec -it worker claude     # then /login, approve in the browser, /exit
```
Or set `CLAUDE_CODE_OAUTH_TOKEN` in `.env` (from `claude setup-token`).

### Render test
```bash
docker compose exec -w /engine worker npm run render -- hizibizi/spoon-bn   # → engine/out/hizibizi/spoon-bn.mp4
```

### Owner account
Set `OWNER_NAME`, `OWNER_EMAIL`, `OWNER_PASSWORD` in `.env`, then:
```bash
docker compose up -d api && docker compose exec api php artisan db:seed   # re-run after changing the password
```

### Tests
```bash
docker compose exec api php artisan test     # sqlite in memory, never touches MySQL
```

### After changing PHP code
The queue worker keeps code in memory: `docker compose restart worker`.

### Live progress
Reverb runs on `ws://localhost:8080` (key `REVERB_APP_KEY`). Channel `private-video.<id>`, auth via
`POST /api/v1/broadcasting/auth` with the JWT. Events: `run.updated`, `run.event`.

Status: Phase 1 done (Milestones 0–6). Acceptance: the hizibizi spoon episode was rebuilt end to end from the
browser flow (plan ~2 min, build ~10 min) and matches the CLI episode (same voice timing and loudness, current
house rules applied, brand outro added). Videos can be vertical 9:16 or landscape 16:9. See `docs/PLAN.md`.

### Projects, logos and outros
Each project is one channel/page with its own logo, outro and series. On the project page:
- **Logo:** upload a PNG, WebP or SVG with transparency.
- **Outro:** pick the logo animation, ask Claude for a custom one, upload a video, or none, and watch the preview.

The worker copies logos and outros into `engine/public/brand/projects/` (generated, ignored by git). Custom
outro code lives in `engine/src/brand/custom/`; commit it.

### QA screenshots
`node scripts/qa/shot.mjs <outDir> <jwt> light|dark <width> /path ...` (needs google-chrome).
