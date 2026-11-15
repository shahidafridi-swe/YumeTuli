# api/ — Laravel 13 (API, jobs, Claude runs)

Read the root `CLAUDE.md` first. This file adds local rules.

## Map
```
app/Http/Controllers/Api/   thin controllers (Auth, Project, Series, Video, VideoRun, Asset, Health)
app/Http/Requests/          validation
app/Http/Resources/         JSON output (never return models directly)
app/Models/                 Project → Series → Video → VideoVersion/Asset; Run → RunEvent
app/Enums/                  VideoStatus, RunKind, RunStatus, OutroMode, VideoFormat, …
app/Services/Runs/          RunService (state machine), ClaudeProcess, StreamParser, Workspace,
                            PromptBuilder, ProjectBrand, LiveFeed
app/Jobs/                   RunVideoJob, RenderOutroPreviewJob, GenerateCustomOutroJob
resources/prompts/          plan / build / feedback / custom-outro / system prompts for Claude
config/yumetuli.php         media disk, owner, engine path, Claude bin/timeout/allowlist
lang/en/api.php             owner-facing API messages
tests/Feature/              PHPUnit feature tests; tests/Fixtures/fake-claude
```

## Rules
- Routes: `routes/api.php`, prefix `/api/v1`, `auth:api` (JWT) except health, auth and signed file links.
- Video status changes only through `RunService` (allowed transitions, one active run per video, 409 otherwise).
- Long work is a queued job; the worker runs one job at a time. After PHP changes: `make restart-worker`.
- Claude: build prompts in `resources/prompts/`, never inline. Keep the clean environment and allowlist
  in `ClaudeProcess`/`config/yumetuli.php`. Any new path coming back from Claude must be resolved inside
  the engine (see `Workspace::resolve`).
- Broadcasting: `LiveFeed` stores then broadcasts; a broadcast failure must never fail a run.
- Migrations are additive and reversible (`down()`); data moves live in the migration that needs them.

## Tests
- `make test-api` (or `F=ClassOrMethod`). sqlite in memory is forced; `TestCase` refuses other databases.
- Fake externals: `Storage::fake('media')`, `Queue::fake()`, `config(['yumetuli.engine_path' => <tmp>,
  'yumetuli.claude.bin' => base_path('tests/Fixtures/fake-claude')])`. The fake CLI reacts to words in the
  brief (`FAIL_ONCE`, `NO_RESULT`, `LIMIT`, `ESCAPE`, `SLOW`).
- In tests the JWT singleton keeps the last token: call `forgetGuards()` and `app('tymon.jwt')->unsetToken()`
  between requests that switch tokens.
