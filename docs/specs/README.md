# Specs & the spec-driven workflow

**Every task in this repo — bug or feature — is driven by a spec.** No spec, no code. This directory
holds one spec per task plus the rules the AI agent (and humans) follow to take a task from idea to done.
The short version lives in the root `CLAUDE.md` ("Workflow discipline"); this file is the full contract.

Work done before this workflow existed (Phase 1, milestones 0–6, landscape, projects) is recorded in
`docs/PLAN.md`, the ADRs and git history. New work starts at spec `0001`.

## Rules that never bend

1. **Never assume. Work from a spec.**
   - No spec for the task → write one from `0000-template.md` and get it approved before touching code.
   - Anything ambiguous, missing or contradictory → **stop and ask the owner.** Do not guess intent or
     silently fill a gap. If you must proceed on an inference, write it under **Assumptions** and flag it.
2. **Two hard human gates, never skipped.**
   - **Gate 1 — Test approval:** the owner approves the *test cases* before any implementation code.
   - **Gate 2 — Work approval:** the owner approves the *finished work* before it counts as done.
   - Never cross a gate on your own initiative. Waiting at a gate is the process working.
3. **KISS — Keep It Simple and Sound.** Smallest thing that fully meets the spec. No speculative options,
   layers or generalization. Boring, obvious code. Simplicity never excuses skipping correctness, tests or
   the six invariants.
4. **One task at a time.** A spec holds many tasks (T1, T2, …). Do them in order: that task's failing
   test(s) first, implement to green, verify, then the next. Never batch.

## The default lifecycle (feature / change)

Driven by `/feature`. Every other task type is a variation.

| # | Stage | What happens | Owner | Gate |
|---|-------|--------------|-------|------|
| 1 | **Spec** | Create `docs/specs/<NNNN>-<slug>.md`: problem, acceptance criteria, scope, out-of-scope, invariants touched, open questions. Ask about anything unclear. | lead | |
| 2 | **Task plan** | Ordered tasks T1…Tn with the files each touches and the risks. | lead | |
| 3 | **Test spec** | Test cases (setup → expected, edge cases, failure paths) mapped to tasks (`T1.t → #1–#3`). A plan, not code. UI work lists the screens/states to screenshot. | lead | |
| 4 | **Approve tests** | Present the test spec. **STOP.** | lead | ⛔ **Gate 1** |
| 5 | **Implement** | Per task, in order: `tester` writes that task's tests (red), `developer` makes them green. Confirm green before the next task. | `tester` → `developer` | |
| 6 | **Self-review** | `reviewer` grills the diff (spec, invariants, security, over-engineering). Findings go back to their author. Then `/review-loop`, then `make check` until green; `make ui-check` for UI. | `reviewer` | |
| 7 | **Approve work** | Present diff summary, test results, screenshots, and criterion → evidence. **STOP.** | lead | ⛔ **Gate 2** |
| 8 | **Handoff** | Fill *Outcome* in the same spec: what was built, deviations (with reasons), follow-ups. Status `Done`. Update `docs/ROADMAP.md`. Commit. | lead | |

"Lead" is the main agent talking to the owner. "Grilling" means reviewing as a hostile reviewer would:
assume there is a bug and find it — including unrequested abstraction, which is a finding to cut.

## Who does what (subagent delegation)

Definitions live in `.claude/agents/`. The split exists so **the code author never grades their own work**.

| Agent | Owns | Must never |
|-------|------|------------|
| `tester` | Test files (`api/tests/**`, fixtures), running suites, UI-check scenarios | Edit production code; weaken a red test |
| `developer` | One approved task at a time: the production diff | Create or edit test files; exceed the task's scope |
| `reviewer` | Read-only adversarial review of the finished diff | Edit anything; rubber-stamp; invent findings |
| `ui-designer` | Advice and review for UI: B&W system, states, a11y, 390 px | Add colour; skip dark mode |
| `codex-reviewer` / `review-fixer` | The `/review-loop` pair | Go beyond the listed findings (fixer) |

Rules that bind the delegation:
1. **The lead owns both gates.** Subagents never talk to the owner or approve anything.
2. **Tester before developer, always.** Never dispatch `developer` for a task without approved red tests.
3. **The wall is the point.** If `developer` thinks a test is wrong, ask `tester` or the owner — the
   developer never edits it.
4. **One task per dispatch.**
5. **Ambiguity comes back up.** Relay a subagent's question to the owner; do not pick for it.
6. **Findings route back to the author** — production to `developer`, coverage to `tester` — then re-review.

`/spike` and `/chore` may be done by the lead alone.

## Task-type variants

### `/feature`
The canonical flow above.

### `/bug`
- Spec: reproduction steps, expected vs actual, **investigated root cause** (never guessed).
- Test spec: a **failing repro test** that fails because of the bug. Gate 1 approves it.
- Implement: repro goes green, no regressions. Handoff records cause, fix, prevention.

### `/refactor`
- No behaviour change. Spec states what is preserved and why the refactor is worth it.
- Test spec: **characterization tests** that pass before and after. For engine refactors: re-render
  affected episodes and compare frames (SSIM ≈ 1.0).

### `/hotfix`
- The stack or a live feature is broken. Minimal spec + failing repro test; gates may be a quick "go".
- A follow-up `/bug` or `/feature` spec is **mandatory** once fixed.

### `/chore`
- Deps, Docker, CI, config, docs, tiny UI copy tweaks. Light spec: what and why, plus the verification
  command (`make check`, `docker compose build`, `make ui-check`…). Gate 2 still applies.

### `/spike`
- Time-boxed research. Output: findings + recommendation in the spec (or an ADR if it decides something).
- Gate 1 approves the questions; Gate 2 approves the findings.

## Spec files
- `docs/specs/<NNNN>-<kebab-slug>.md`, zero-padded, next number after the highest existing.
- Start from `0000-template.md`.
- The spec is the single durable record of the task. Keep it truthful.
