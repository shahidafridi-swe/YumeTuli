# web/ — Next.js 16 UI + BFF

Read the root `CLAUDE.md` first. `web/AGENTS.md` is maintained by `next dev` (Next.js version notes) — read it too.

@AGENTS.md

## Map
```
src/proxy.ts                  guest redirect + token refresh (Next 16 "proxy", formerly middleware)
src/app/api/[...path]/        BFF: forwards to Laravel with the JWT from the httpOnly cookie
src/app/login/                login page + server actions (login/logout)
src/app/(app)/                signed-in pages: dashboard, videos, projects, series, settings
src/components/ui/            primitives (Button, Field, Card, …) — reuse before adding
src/components/               StatusBadge, RunLog, VideoForm, SeriesForm, LogoPreview, ThemeToggle, AppShell…
src/lib/                      api client, queries (TanStack), echo (Reverb), types, format, theme, session
src/i18n/                     useT(), messages/en.json (type-checked keys)
```

## Rules
- Data: add a typed hook in `src/lib/queries.ts`; call the BFF through `api()`; never call Laravel or read
  the token in the browser.
- Live updates: subscribe through `useVideoLive` / `getEcho()`; invalidate queries on events.
- Pages: `page.tsx` = metadata + one client component; wrap URL-reading components in `<Suspense>`.
- Text: add keys to `src/i18n/messages/en.json`; no literal UI strings in components.
- Design: only CSS variables from `globals.css` (`background`, `foreground`, `surface`, `muted`, `border`,
  `strong`); no colour classes. Check light, dark and 390 px.
- Run checks in the container: `make typecheck`, `make lint`; look at `make ui-check` screenshots.
- If the dev server shows a stale module error after big edits: clear `.next/dev/cache` and `docker compose restart web`.
