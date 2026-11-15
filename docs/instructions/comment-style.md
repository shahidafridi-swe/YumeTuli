# Comment style

Imported into every session by the root `CLAUDE.md`.

- Comment **why**, not what. The code says what it does; a comment explains a reason, a constraint,
  a trap, or a link to a decision (`ADR-0003`, `spec 0004`).
- One short line is usually enough. A block comment above a class or function says what it is for
  and anything non-obvious about how to use it.
- No commented-out code, no changelog comments ("added by…", "fixed on…"), no TODO without an owner
  or a spec number.
- Keep comments true: when you change behaviour, update or delete the comment next to it.
- PHP: `/** … */` above classes and public methods when they need explanation; `//` inline.
  TypeScript: `/** … */` for exported functions/components, `//` inline.
