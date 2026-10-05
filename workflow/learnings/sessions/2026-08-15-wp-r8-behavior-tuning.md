---
slug: wp-r8-behavior-tuning
version: 1
artifact: learning-session
date: 2026-08-15
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/wp-r8-behavior-tuning-v1.md
---

# Raw Learnings - wp-r8-behavior-tuning v1

## Context

WP-R8 added per-repo behavior tuning to agentsmyth: an optional `tuning:` block in
`repo-profile.yaml` carrying six allowlisted keys, an intent layer above it that repo owners
actually answer (`repo_character`, `surface_map`, `concerns` with two non-negotiable floors, plus
`derived_keys` provenance), and non-blocking upgrade-skew reconciliation that seeds intent items
into `pending-setup.yaml` and lets a repo keep working until its owner resolves them.

19 build phases. Reclassified Standard → Complex during Plan, which is why Test ran at all. Four
review rounds (two genuine holds), two verify rounds (one hold), one Ship finding. Seven of the 19
phases were fixes to findings raised by later phases in the same chain. Shipped via PR #62 against
`release/1.1.0`; not merged, not released.

## Candidate Learnings

- **Candidate learning**: A test written to close a coverage finding must be mutation-tested before
  the finding is marked resolved — break the thing it guards and confirm the new assertion fails
  while the pre-existing suite stays green. A passing new test is evidence of nothing; the pre-fix
  failure is the evidence. Applies equally to a fixture, a unit assertion, and a validator wiring —
  source: `workflow/artifacts/verify/wp-r8-behavior-tuning-v2.md` MQ-6 — propose-only.
- **Candidate learning**: Before proposing a fix to shared infrastructure on the strength of a
  diagnosis, run the exact command the real gate runs, in the real configuration, with the
  triggering condition actually present. Verify v1 tried three variant invocations of a validator
  and concluded the root resolver was broken; one run of `npm run validate` with a `tuning:` block
  present falsified that in a single step and reduced the fix from a change to `lib.mjs` to a
  missing fixture — source: `workflow/artifacts/verify/wp-r8-behavior-tuning-v2.md` Findings —
  propose-only.
- **Candidate learning**: When a validator selects one artifact from a versioned set, it must
  select the newest, matching how the rest of the lifecycle resolves upstream artifacts. Taking the
  first sorted candidate silently means the oldest, and for any cross-check on findings-since-fixed
  that makes a chain permanently unshippable once its first round raises a P0/P1. Audit remaining
  validators for `candidates[0]` on a `-v<N>` set — source:
  `src/workflow/validators/check-release-readiness.mjs`, WP-R8 Ship S1 — propose-only.

## Raw Notes

- The dominant pattern of this chain was not feature defects but **checking-layer defects**. F7
  (`check-artifacts.mjs` never invoked against real artifacts, 96 violations accumulated), T1 (the
  tuning overlay reachable but never exercised), and S1 (`check-release-readiness` reading the
  oldest review) are all "the thing that was supposed to catch this wasn't running, or was running
  against the wrong input." For a package whose product *is* a checking layer, that ratio is the
  finding.

- Five separate JSON-Schema keywords turned out to be parsed and ignored — `maximum`,
  schema-valued `additionalProperties`, `if`/`then`, `format`, `x_enforcement`. Each was written in
  good faith by a schema author, each silently constrained nothing, and nothing anywhere reported
  it. `check-schema-keywords.mjs` now fails when a schema uses a keyword the engine does not
  implement, which is the only durable fix — a documented list would drift on the next edit.

- **The chain could not ship itself.** `check-release-readiness.mjs` took `reviewCandidates[0]`,
  which `listFiles`'s sorted output makes the *oldest* review. This chain has four; v1 recorded
  P1:1 and v4 records P1:0 with everything resolved. The only escape available was editing a
  historical review artifact to insert a `(fixed)` marker — rewriting the record to satisfy a check
  pointed at the wrong file. Worth noting that the tempting workaround was also the one that
  destroys the evidence of what the review process actually caught.

- **Verify v1 was confidently wrong and it took a user challenge to surface the pattern.** The T1
  diagnosis blamed `_dataRoot` being redirected by `AGENTSMYTH_WF` and recommended decoupling the
  two roots — a change to the most load-bearing file in the package, to fix nothing. Three variant
  invocations had been tried; the one that settles it (full `npm run validate` with tuning actually
  present) had not. The correction is kept in the committed record alongside the original precisely
  because the wrong explanation is the more plausible-sounding one.

- Review v4 recommended `pass` while carrying an explicit "assumption Test must verify" that had
  not been verified. The check took two minutes when finally run and passed. Naming a verification
  and not performing it is weaker than never naming it, because the name manufactures the
  impression of coverage. This surfaced only because the user asked whether the fix had been done
  "just for sake of moving away from the review."

- All four review rounds were self-authored, with the last one raising, fixing, and closing its own
  finding. Two rounds genuinely held, which is some evidence against rubber-stamping — but there
  was no independent check on the final round. A fresh-context review of the diff was offered and
  not taken up; for a chain this long that is probably the right default rather than an optional
  extra.

- **WP-R8 was misled by the exact problem it was built to solve.** Verify v1 recorded the Test
  skill's Skipped Checks starter block as a source defect (5 columns vs the validator's 6). The
  source has six; the five-column version lives in a **v1.0.0 `~/.agentsmyth`** global install. A
  stale global silently served an agent the wrong contract mid-chain, which is precisely the skew
  reconciliation this package implements.

- Related: **OI-63 was closed as "promoted to WP-R19" while half of it had been fixed by another
  route.** The Test column-count half is fixed in `src`; the Plan half (`## Assumptions Verified`,
  required by `check-assumptions` whenever a brief declares `A` IDs) is still missing. Closing an
  item as "scheduled elsewhere" hid that its scope had shrunk. Worth a general habit: when closing
  an item by promotion, re-verify each component rather than the item as a unit.

- Testing the **packed tarball** rather than the working tree is what made R7/R8/RI9 evidence
  instead of inference — and it surfaced something invisible from inside the repo, that
  `agentsmyth check` never runs `check-config` on the consumer surface at all. Sandboxing `$HOME`
  (verified before being relied on, real install mtimes confirmed after) was what made testing
  `prepare` possible without destroying the developer's global setup.

- The **baseline ratchet** is a reusable answer to inherited debt: grandfather one exact
  file-and-message pair per entry, make stale entries an error so the list can only shrink, check it
  in so the debt is visible and reviewable. It neither blocked wiring the validator in nor blessed
  96 violations into the contract. The honest caveat recorded at the time still stands — nothing
  schedules their repair and no owner is assigned.

- Late-phase fixes (Phases 17–19) each required amending the **plan**, not just the task, because
  `check-scope-fence` resolves declared `Touches` from the plan's `### Phase N` blocks. Discovered
  by failing the check. Not a defect, but not written down anywhere a Build re-entry would look.

- Minor but repeatedly costly: `check-trigger-predicates.mjs` contains 8 deliberate NUL sentinels
  (`\0DOUBLESTAR\0`) inside `globToRegex`, which makes `grep` classify the file as binary and
  return nothing without `-a`. Harmless at runtime, silently misleading during investigation.

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none
