---
slug: power-skills-wave2
version: 1
artifact: learning-session
date: 2026-07-10
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/power-skills-wave2-v1.md
---

# Raw Learnings - power-skills-wave2 v1

## Context

WP-R4 Wave 2 (phase-gate skills): `requirement-phase-mapper` (B1), `plan-assumption-verifier` (B2),
`verification-matrix-builder` (B6), `follow-up-owner-assigner` (B9), plus the corrected
`open-items-ledger` (E2). 5 validators, 5 negative fixtures, wired into `npm run validate`. Full
brief→plan→build→review→test→ship→reflect chain, second consecutive dogfooded chain on this repo
after Wave 1's spine.

## Candidate Learnings

- Before presenting a gap as unresolvable and asking the user to accept a waiver, check whether the
  stated blocker is actually still true — specifically, whether local branch refs are stale relative
  to their remotes. This chain's R8 was framed as a genuine cross-branch dependency; a 2-command
  investigation (`git log origin/main`) found it had already been resolved upstream via 2 merged PRs.
- A heuristic-based validator (not a full parser) needs a new exemption roughly every time the
  artifact vocabulary it scans gains a new structural convention. `check-waivers.mjs`'s prose-scan
  heuristic needed 2 more fixes this chain alone (Skipped Checks recognition, Risk And Rollback
  recognition), on top of the 1 fix already made in Wave 1 — 3 total. Treat this as an ongoing
  maintenance cost, not a one-time calibration event.
- The recurring range-shorthand mistake ("R1-R4" instead of individual rows) has now been named as a
  learning candidate twice (Wave 1's Reflect, and again here) without being structurally addressed.
  Naming a pattern in Reflect does not, by itself, stop it from recurring — this chain hit it in its
  own Requirement Coverage table (Phase 1) and again in a Plan heading/diagram (Review), a third and
  fourth occurrence.
- Dogfooding new validators against real, complex artifacts (not just their own purpose-built
  fixtures) continues to be the dominant bug-finding method, now confirmed across two consecutive
  chains: 3 real defects in Wave 1, 6 in Wave 2, 0 found by fixtures for the same validators in
  either chain.

## Raw Notes

- The user's response to the Ship-checkpoint waiver summary — "Need to resolve them instead of
  silently passing or skipping" — was the single highest-leverage moment of this chain. It rejected
  a plausible-sounding but under-investigated framing (R8 as an external, unfixable dependency) and
  led directly to finding the real root cause (stale local `main`) and a genuinely better outcome (a
  clean `ship` instead of a permanent-feeling `hold-with-waiver`). Worth internalizing as a general
  habit: when a blocker is framed as "external" or "not fixable in this chain," that framing itself
  deserves the same skepticism this session has applied to unverified claims and Review findings —
  not just accepted because it sounds reasonable.
- Merging `origin/main` mid-chain (a structural git action, not just an artifact edit) was judged
  low-risk before being done: `git merge-tree` dry-run showed exactly one resolvable conflict, the
  action was local-only (not pushed), and it was reversible. This is a useful template for when an
  agent should take a meaningful action versus asking first — verify blast radius and reversibility
  concretely, then act, rather than defaulting to asking for permission on every structural git
  operation regardless of risk.
- `check-assumptions.mjs`'s retroactive-application gap recurred a third time when the `origin/main`
  merge brought in a plan (`audit-validator-fixture-gaps-v1.md`) from a sibling chain that also
  predated the new convention. The resolution pattern (reformat the plan's own real brief text,
  independently re-verify against current shipped code) generalized cleanly to a chain this repo's
  own agent hadn't even written — a good sign the pattern is sound, not chain-specific.
- Both `check-waivers.mjs` false positives this chain were found by the agent writing its own new,
  real artifact content and immediately re-running `npm run validate` — not by a fixture, not by a
  separate audit pass. This is the same "write real content, validate immediately" discipline that
  found the `lib.mjs` parser bug in Build, just recurring at Test and Ship too.

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none
