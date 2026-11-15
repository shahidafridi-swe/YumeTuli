---
description: Add a Next.js page the YumeTuli way (thin page, client component, i18n, B&W, Suspense).
argument-hint: "<route and purpose>"
---

New page: $ARGUMENTS — run inside the `/feature` flow (spec + Gate 1 first).

Checklist (see `web/CLAUDE.md`):
1. `src/app/(app)/<route>/page.tsx`: `metadata` + render one client component; wrap it in `<Suspense>`
   if it reads params/search params/pathname.
2. Client component next to it; data from hooks in `src/lib/queries.ts`; mutations through `api()`.
3. Reuse `src/components/ui` (PageHeader, Card, Field, Button, Alert, EmptyState, Spinner).
4. Every string in `src/i18n/messages/en.json` (keys type-checked).
5. B&W tokens only; loading, empty, error states; keyboard + screen-reader labels.
6. Add to the nav in `AppShell.tsx` if it is top-level.
7. Verify: `make typecheck`, `make lint`, `make ui-check P="/<route>"` and look at light, dark and 390 px.
