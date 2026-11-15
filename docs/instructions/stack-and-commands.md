# Stack and commands

## Services (docker-compose.yml)
| Service | What | Port (127.0.0.1) |
|---------|------|------------------|
| `web` | Next.js 16 dev server (BFF + UI) | 3000 |
| `api` | Laravel 13 on FrankenPHP (PHP 8.4), runs migrations on start | 8000 |
| `worker` | `queue:work` + Node 22 + ffmpeg + Chromium + Python tools + Claude CLI; engine at `/engine` | — |
| `reverb` | Laravel Reverb websocket (live progress) | 8080 |
| `mysql` | MySQL 8.0 | 3307 |

## Layout
```
web/       Next.js app (src/app, src/components, src/lib, src/i18n)
api/       Laravel app (app/, routes/api.php, resources/prompts, tests/)
engine/    Remotion video engine (copied from ai-video; Claude builds videos here)
docker/    Dockerfiles (api + worker targets, web)
docs/      PLAN, specs, ADRs, instructions, memory (video house rules)
scripts/   QA screenshots, DB read-only user, MCP wrapper
```

## Commands
```bash
make up / make down        # start / stop the stack
make check                 # quality gate: pint --test, eslint, tsc (web+engine), Laravel tests
make test-api F=Project    # one test class or method
make fmt                   # Pint auto-format
make restart-worker        # after PHP changes (the worker keeps code in memory)
make ui-check P="/videos"  # screenshots light/dark/mobile → out/ui-check/
make seed                  # owner + house projects/series
make db-readonly-user      # SELECT-only MySQL user for the MCP server
```

Inside containers: `docker compose exec api php artisan …`, `docker compose exec -w /engine worker npm run …`.

## Claude in the worker
- Headless `claude -p` with `stream-json`, run from `/engine`. Login lives in the `worker-home` volume
  (`docker compose exec -it worker claude` once per PC) or `CLAUDE_CODE_OAUTH_TOKEN` in `.env`.
- Prompts: `api/resources/prompts/*.md`. Tool allowlist: `api/config/yumetuli.php`.
