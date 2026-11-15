---
description: Run codex-reviewer against the current diff, fix findings with review-fixer, re-review. Repeats until clean or 3 rounds.
argument-hint: "[base branch, e.g. main] [--staged] [--max-rounds N] [--dry-run]"
allowed-tools: Agent, Read, Bash, Grep, Glob
---

Adversarial review-and-fix loop on the current changes. Arguments: $ARGUMENTS

Parse: base branch (default `origin/main`; if the work is uncommitted, review `git diff HEAD`),
`--staged` (review `git diff --cached` only), `--max-rounds N` (default 3), `--dry-run` (review only).

## Loop (up to max-rounds)

**Review.** Spawn a **fresh** `codex-reviewer` subagent (foreground) every round — never continue the old
one. Give it the diff scope; from round 2, list which findings were fixed so it verifies them.

**Stop when:** `VERDICT: clean`; only `low` findings remain (report, don't fix); `--dry-run`; max rounds;
or the same finding survives two fix attempts (escalate to the owner).

**Fix.** Spawn a `review-fixer` subagent (foreground) with the verbatim `critical`/`high`/`medium`
findings. Carry `disputed` findings to the final report without re-sending them.

In `--staged` mode: max 2 rounds, fix only critical/high, `git add` exactly the files the fixer changed.

## Report
1. Per round: findings by severity, fixed, disputed.
2. Remaining unfixed findings in full, with why.
3. `git diff --stat` of the loop's changes.
4. The fixer's last verification command and result.

Then stop. Do not commit or push.
