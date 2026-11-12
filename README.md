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

- Web: http://localhost:3000 (shows system status)
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

Status: Milestone 2 done (worker renders + Claude headless). See `docs/PLAN.md`.
