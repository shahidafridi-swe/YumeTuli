---
description: Add a Laravel API endpoint the YumeTuli way (route, request, resource, lang, tests).
argument-hint: "<method path and purpose>"
---

New endpoint: $ARGUMENTS — run inside the `/feature` flow (spec + Gate 1 first).

Checklist (see `api/CLAUDE.md`):
1. Route in `routes/api.php` under `auth:api` (or `signed` for a file link), RESTful name.
2. Validation in a Form Request or `$request->validate`; enums via `Rule::enum`.
3. Thin controller method; logic in a service; long work in a queued job.
4. Output through a `JsonResource` (add fields to the TS types in `web/src/lib/types.ts`).
5. Owner-facing errors in `lang/en/api.php`; 409 for invalid state, 422 validation, 404 missing.
6. Files via the media disk + signed URL helper.
7. Feature tests (written by `tester` first): happy path, validation, auth required, state conflicts,
   file cleanup. Fake storage/queue/Claude.
8. If the browser needs it: a hook in `web/src/lib/queries.ts` (BFF passes it through automatically).
