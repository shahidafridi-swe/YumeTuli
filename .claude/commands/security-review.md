---
description: Security review of the diff — auth, secrets, uploads, signed URLs, Claude sandbox.
---

Review the current diff for security. Report findings as `file:line — severity — problem — fix`.

- **Auth:** every new API route is under `auth:api` unless it is health, auth, or a `signed` file link.
  Rate limits on login/refresh kept. No token in URLs, logs or browser storage.
- **Secrets:** nothing read from or written to `.env` by code paths that could leak it; no secrets in logs,
  responses, prompts, the Claude environment, or committed files.
- **Uploads:** size + extension + MIME validated; stored with random names on the media disk; never
  executed; served only through signed routes.
- **Signed URLs:** short expiry; generated with `APP_URL`; tampering → 403.
- **Claude sandbox:** clean env, allowlist, system prompt, process-group kill on cancel/timeout,
  `RESULT` paths resolved inside the engine, no shell built from user text without escaping.
- **Injection:** no raw SQL with user input; no `shell_exec`/`Process` with unescaped input.
- **MySQL MCP:** remains SELECT-only (`scripts/db-readonly-user.sh`), no secret tables/columns added to grants.

End with `SECURITY: clean` or `SECURITY: <n> findings (<critical/high/medium/low counts>)`.
