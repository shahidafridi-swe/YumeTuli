# ADR-0002 — JWT auth behind a Next.js BFF (httpOnly cookie)

- **Status:** Accepted
- **Date:** 2026-11-12
- **Deciders:** Shahid Afridi, Claude

## Context
The owner chose JWT for login. Storing a JWT in browser JS (localStorage) exposes it to XSS.
Media tags (`<video>`, `<audio>`, `<img>`) cannot send an Authorization header.

## Decision
- Laravel issues JWTs (`php-open-source-saver/jwt-auth`): 15-minute access token, 14-day refresh window,
  blacklist on refresh/logout, login rate limit 5/min.
- The browser only talks to Next.js. Next.js keeps the token in an httpOnly cookie and forwards calls to
  Laravel with `Authorization: Bearer` (`src/app/api/[...path]/route.ts`, refresh-once on 401);
  `src/proxy.ts` refreshes before expiry and redirects guests.
- Media uses short-lived signed URLs generated with `APP_URL`.

## Consequences
- Browser JS never sees the token. Every new browser-side call goes through `/api/*`.
- Websocket channel auth also goes through the BFF.
