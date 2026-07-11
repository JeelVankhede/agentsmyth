---
slug: power-skills-domain-experts
version: 1
artifact: learning-session
date: 2026-07-11
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/power-skills-domain-experts-v1.md
---

# Raw Learnings - power-skills-domain-experts v1

## Context

WP-R4 Wave 3 (explorers + domain experts): C1-C3 (`repo-alignment-scan`,
`architecture-decision-advisor`, `constraint-conflict-scan`), D1-D7 (7 domain-expert skills, 39
substantive knowledge-route files), E1 (`verification-parallelizer`, a `dispatch-subagents`
profile). 1 new validator (`check-constraint-conflicts.mjs`). Full brief→plan→build→review→test→ship→reflect
chain, third consecutive dogfooded WP-R4 chain on this repo after Wave 1's spine and Wave 2's
phase-gates.

## Candidate Learnings

- Ship's default posture toward an out-of-declared-scope fix should be "is this actually resolved
  and independently re-verified, or genuinely open risk" — not "frame it as a waiver and let the
  user correct me." This happened twice now (Wave 2's R8, this chain's E1/D3 items), same user
  correction both times, same shape of over-caution mistaken for diligence.
- A Plan's Repo Impact Map can omit a wiring target its own upstream spec explicitly names — worth
  a structural cross-check (every phase in a skill's spec card appears in the Plan's declared
  Touches) before Plan finalizes, rather than relying on Build's own later `grep -l` verification to
  catch it (which it did, but later than ideal).
- When a new capability requires changing an existing rule stated in multiple files (E1's
  Test-dispatch exception touched 3 files all stating the old blanket rule), the Plan is unlikely to
  have anticipated all of them — check every location a rule is restated, not just the one file the
  Plan happened to name.
- For content-heavy, largely non-validator-checkable work (Category D), a structural no-stub check
  across 100% of files plus a deliberately diverse sample read across ~50% is a defensible,
  disclosed tradeoff — but must be named as a real residual-coverage gap, not silently treated as
  equivalent to exhaustive review.

## Raw Notes

- The user's Ship-checkpoint response this chain ("So what's the status? Is everything ready or
  still needs explicit fixing? ... Don't force waiver on obvious fixes, it'll increase iterations
  later for fixes") is nearly a direct repeat of Wave 2's R8 correction ("Need to resolve them
  instead of silently passing or skipping"). Both times the underlying issue was the same: treating
  a fully-resolved, independently-verified fix as if it still carried open risk requiring
  permission, when the actual ask was just "tell me plainly whether this is really done." Worth
  treating this as a settled instruction going forward, not re-deriving it per chain.
- The response to that correction this chain was more complete than Wave 2's: not just accepting
  the correction, but running one more fresh, independent regression specifically to answer the
  status question with actual current evidence rather than only re-asserting prior claims. This
  matches the user's own explicit ask ("do one more regression if you are not confident") and
  produced a materially more useful reply (a direct "everything is ready" backed by fresh command
  output, not a re-statement of the same waiver framing with softer language).
- `check-release-readiness.mjs`'s rule ("a ship declaration cannot coexist with unresolved
  orchestration.blockers") caught a real self-inflicted inconsistency mid-Ship-rewrite: after
  reclassifying the 2 items as resolved, the Ship Status section briefly declared "ship" while
  `orchestration.blockers` still held the pending confirmation ask. The validator's distinction
  (verification confidence vs. procedural authorization to close the chain) is a genuinely useful
  one, not just pedantry — it forced explicitly separating "I'm technically confident" from "the
  user has actually said yes," which is exactly the gap the whole Ship-checkpoint discipline this
  session has built exists to close.
- The E1/Test-dispatch contradiction had apparently sat latent in shipped documentation since Wave
  1 (3 files stating a blanket rule that Wave 3's own spec directly contradicted) — invisible until
  this chain tried to implement the one capability that exercised both simultaneously. A reminder
  that "shipped and passing validate" does not mean "internally consistent across every file that
  states a policy," only that the specific things validators check are consistent.

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none
