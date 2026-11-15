# Conventions

Imported into every session by the root `CLAUDE.md`. Match the code around you first; these fill the gaps.

## General
- KISS: the smallest change that fully meets the spec. No speculative options, layers or abstractions.
- Every user-facing string goes through i18n (web `src/i18n/messages/en.json`, api `lang/en/*.php`).
  A missing web key fails `tsc` — that is intended.
- Secrets live only in `.env`. Never read, print, log or commit them. Never hard-code credentials.
- Dates are stored in UTC and shown in the owner's timezone (default `Asia/Dhaka`).

## Laravel (`api/`)
- PHP 8.4, Laravel 13. Style is enforced by Pint (`make fmt`); do not hand-format.
- Model attributes use Laravel 13 PHP attributes (`#[Fillable([...])]`, `#[Hidden([...])]`) and `casts()`.
- Enums for every fixed set of values (`app/Enums`), cast on the model.
- Controllers stay thin: validation in Form Requests or `$request->validate`, output through
  `JsonResource`s, multi-step logic in `app/Services`, long work in queued `app/Jobs`.
- API routes live under `/api/v1` and are JWT-protected (`auth:api`) unless they are signed links.
- Errors for the owner are short English sentences in `lang/en/api.php`; 409 for invalid state
  transitions, 422 for validation.
- Files go through `Storage::disk(config('yumetuli.media_disk'))` — never a hard-coded disk or path.
- Tests: feature tests in `tests/Feature`, PHPUnit, `RefreshDatabase`. Fake everything external:
  `Storage::fake('media')`, `Queue::fake()`, `tests/Fixtures/fake-claude` via `config(['yumetuli.claude.bin' => ...])`.

## Next.js (`web/`)
- Next.js 16 (App Router, Cache Components, `proxy.ts` instead of middleware). Read the local docs in
  `web/node_modules/next/dist/docs/` before using an API you are unsure of — it differs from older Next.
- Pages are thin server files that render one client component; data comes from TanStack Query hooks
  in `src/lib/queries.ts` calling the BFF (`src/lib/api.ts` → `/api/*`).
- Anything reading the URL (`useParams`, `useSearchParams`, `usePathname`) must sit inside `<Suspense>`.
- Design: black, white and greys only (CSS variables in `globals.css`), status shown with icon + text,
  never colour. Must work in light, dark and system theme and at 390 px width.
- Reuse `src/components/ui` primitives before adding new ones. Icons from `lucide-react`.
- No unit-test runner in web: verification is `make typecheck`, `make lint` and `make ui-check` screenshots.

## Engine (`engine/`)
- Remotion 4. Follow `engine/AGENTS.md` (video house rules, formats, outros, captions).
- Never hard-code 1080/1920: use `useFormat()` from `src/format.ts`.
- Changing shared engine code must not change existing episodes: re-render one and compare (SSIM ≈ 1.0).
