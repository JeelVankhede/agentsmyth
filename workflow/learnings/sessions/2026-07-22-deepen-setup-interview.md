---
slug: deepen-setup-interview
version: 1
artifact: learning-session
date: 2026-07-22
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/deepen-setup-interview-v1.md
---

# Raw Learnings - deepen-setup-interview v1

## Context

User, furious that the current setup/interview flow was a "shallow run pretending to be a setup,"
asked for a full audit of how per-repo installation evolved into global-install + a narrow
resolution pass, then approved widening it back to real interview depth without regressing the
legitimate global-install architecture. Mid-chain, a separate, fully orphaned pre-commit hook file
was found and, per explicit user direction, resolved within the same chain rather than deferred.

## Candidate Learnings

- A function built as a narrow, deliberate safety net (`headlessBootstrap()`, originally just
  "don't crash `check`, write minimal stubs") can get silently promoted to be the default,
  primary path for an entire flow in a later, unrelated change, without anyone re-auditing whether
  its original narrow scope still fits the bigger job. This is the actual root-cause pattern
  worth watching for in future audits: not "who broke this" but "what got promoted past its
  original design intent."
- Two files that look like they solve "the same problem" (two pre-commit hooks here) may be
  complementary rather than redundant — check what each one specifically does before deciding to
  delete one in favor of the other. The right move can be merging both mechanisms.
- Mechanical gates already in this codebase (`check-scope-fence.mjs`, `check-release-readiness.mjs`)
  caught two real self-authored mistakes in this same session — a Plan/Task Touches mismatch and a
  "ship" recommendation declared with open blockers. Confirms these gates are pulling real weight,
  not just theater — worth continuing to run `npm run validate` at every Ship checkpoint.

## Raw Notes

- The user's own phrasing ("deepen placeholders such that it is bearable... fill in gaps by
  inferring or asking user questions... marking them pending where needed") mapped almost exactly
  onto a 3-tier design (auto-resolved / soft-tracked / hard-gated) once the existing
  `<PLACEHOLDER>`/`<USER-TODO:...>`/`waived` states in this codebase were actually read carefully —
  the mechanism didn't need inventing, just applying deliberately per-field instead of uniformly.
- Testing against a *realistic* scratch repo (real CI config, real secrets dir, real package.json
  scripts) rather than only a fully-blind one caught a real false positive (the `npm init` test
  stub) that a purely blind-or-nothing test matrix would have missed entirely.

## Curator Marks

(none yet — curated.md is not edited unless the user explicitly requests curation)
