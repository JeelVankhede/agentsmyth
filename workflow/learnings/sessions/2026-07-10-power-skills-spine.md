---
slug: power-skills-spine
version: 1
artifact: learning-session
date: 2026-07-10
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/power-skills-spine-v1.md
---

# Raw Learnings - power-skills-spine v1

## Context

WP-R4 Wave 0+1 ("invariant spine"): 7 gate-bound power skills, 8 validators, schema infra, 14
negative fixtures, wired into `npm run validate`. Full brief→plan→build→review→test→ship→reflect
chain, dogfooded on this repo itself. Preceded by a separate Notion research-spike review/resolution
session that expanded WP-R4 from 2 candidates to a 22-skill catalog across 5 categories.

## Candidate Learnings

- New validators/checks need dogfooding against real, complex artifacts before being wired into an
  automated gate — fixtures alone are necessary but not sufficient. 3 of 4 real defects this session
  were found this way; 0 were found by the fixtures written for the same validators.
- A Review finding's disposition (fixed / waived / accepted) should be structurally checkable, not
  just asserted in prose. The P2 finding in this chain's own review was marked "accepted" without
  user sign-off and only caught because the user read the artifact closely.
- When execution is about to diverge from what the agent's own Plan artifact documented, surface the
  divergence at the moment it happens, not silently and wait to be asked later.

## Raw Notes

- The Notion spike/roadmap update phase (before Think) surfaced its own process lesson, worth noting
  even though it predates this reflect artifact's formal chain: early drafts of the WP-R4 catalog
  reused the user's own example list almost verbatim without independent exploration, which the user
  called out directly ("you didn't explore... I'm skeptical whether you understand/follow my
  approach"). Second-pass research (checking actual repo-profile/domain schemas for a platform field
  that turned out not to exist) produced a materially better, independently-reasoned design. Lesson:
  when asked to "explore" or "design," checking the user's own examples against the actual codebase
  before proposing a structure is not optional diligence — it's the difference between real design
  work and paraphrasing.
- Two real defects were pre-existing and unrelated to WP-R4, found only because this chain happened
  to touch adjacent surface: (1) `test/run-violation-tests.mjs`'s validator path had been broken
  since the `src/` restructure, silently invalidating the entire negative-test suite's history; (2)
  `check-lifecycle.mjs`'s Reflect gate could never be satisfied alongside the frontmatter schema,
  which explains why `system-level-install-v1.md`'s ship artifact has a `status: "ship"` schema
  violation still sitting unresolved in `workflow/artifacts/`. Neither would have surfaced without
  actually running the full chain end-to-end on real work, rather than spot-checking pieces.
- The 4 real defects found via Review/Ship-time dogfooding, in order found: `check-scope-fence`
  (Touches matching not phase-scoped), `check-manifest-coverage` (false-failed on verification-only
  IDs), `check-release-readiness` (crude prose regex broke on a real table), `check-waivers`
  (strengthened at the user's explicit choice after a process gap was caught, not a code bug like the
  other three).
- Commit strategy resolved mid-session: per-phase-boundary commits (matching this repo's own
  `system-level-install-v1` precedent) are standing-authorized once a branch/chain is approved;
  push/PR still always need a fresh explicit ask. PR strategy: one PR per completed
  chain/wave, not one PR for all of WP-R4 — keeps the spec's own real-task drift checkpoint (before
  Wave 2-4 begins) meaningful.

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none
