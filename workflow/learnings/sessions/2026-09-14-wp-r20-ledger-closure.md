---
slug: wp-r20-ledger-closure
version: 1
artifact: learning-session
date: 2026-09-14
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/wp-r20-ledger-closure-v1.md
---

# Raw Learnings - wp-r20-ledger-closure v1

## Context

Complex chain turning the append-only open-items ledger into a two-file rotating ledger: schema fields
for closure, a closed item object, a two-file validator, a one-time sweep of this repo's own 70 closed
items, and the contract amendments that make the sweep legal. Seven Build phases, all seven lifecycle
phases, single-agent throughout — the Think and Review councils were both applicable (Complex,
`council.enabled: on-for-complex`) and both refused, because the operating session resolves
`dispatch.enabled` to `disabled`.

Fully specified in advance on a Notion page written five weeks earlier. That specification turned out
to contain a mechanism that could not execute, which is the through-line of this session.

## Candidate Learnings

- A complete, internally consistent specification can contain a mechanism that cannot run. The page said
  to file each archived item under its `closed_in_run` year; `closed_in_run` is a slug-vN and there is no
  date field anywhere in the schema. Nothing about the spec looks wrong until you read the data it would
  operate on.
- In a repo with a two-root resolver, a bare validator invocation validates against the GLOBAL
  definitions. A green result after a schema edit is not evidence about the edit. `AGENTSMYTH_HOME`
  moves definitions only; `AGENTSMYTH_WF` moves both roots and yields a different false pass.
- Measure the corpus before adding a constraint the precedent suggests. A conditional requirement copied
  from the sibling schema would have failed 31 of 70 existing entries.
- When a matching boundary is corrected, re-inspect every case, not the failing ones. Re-reading all 24
  split boundaries after fixing three surfaced a second, unrelated defect.
- For a data migration, verify by reconstructing the original from the outputs and asserting equality.
  Spot-checking entries would have passed over both split bugs.
- A chain that changes how a shared identifier space is STORED must also grep for instructions that
  SEARCH that space.
- Derive recorded counts from tool output and assert the derived total against the total the tool printed
  itself.

## Raw Notes

**The precedent was the whole job.** Twenty minutes of reading found `finding-quality-archive.yaml`,
shipped by the previous-but-one work package: flat file, second `kind` in the same schema's enum, one
validator reading both with rotation checked in both directions, and a comment in its schema naming the
open-items ledger as the cautionary example of an object left open. The design question was already
answered in the repo; the page had proposed a different answer without it.

**The defect had grown while being accurately documented.** The page recorded the undeclared `resolution`
key as one instance. `finding-quality.schema.yaml` later recorded 22. It measured 39 of 92 this session.
Someone understood the problem precisely enough to write it into a shipped schema description, and it
grew 77% anyway. Documentation of a defect is not pressure on it.

**Phase 1's gate passed and proved nothing.** `check-open-items: ok` against the real ledger — resolved
through `definitions_root`, which is `~/.agentsmyth/workflow`, confirmed still carrying the pre-edit
schema. Caught only by writing a fixture with an undeclared key and expecting rejection. The gate was
well-formed, ran clean, and measured the wrong tree. This is the second chain running to record this
exact failure shape; the prior one phrased it as "an assertion that can only confirm what it already
assumes".

**`Done` is not a closure marker here.** The split regex matched `Done` as a Notion status VALUE in three
entries — "update the page status to Done, with PR #42 link, once merged" — and cut the action sentence
in half, leaving `next_action: "Update Notion WP-R12 page/database row status to"`. Tightening to require
a real closure shape (`Done:`, `Done <ISO date>`, `DONE`, `TRIAGED`) fixed it. Then re-inspecting all 24
boundaries rather than the three that were wrong revealed that the trim was also dropping the trailing
full stop on 21 of 24. Two independent bugs in one small regex, the second invisible while the first was
still there.

**Reconstruction beat inspection.** The final check rebuilds the pre-sweep ledger from the two new files
using `lib.mjs`'s own `loadYaml`, asserting id-set partition, field equality, and character equality per
split. Result: 0 characters consumed. Both split bugs would have survived a sample of five entries.

**Review found the surface the sweep missed, and the miss was self-made.** `lifecycle-ship` step 4b tells
agents to grep `OI-<n>` for duplicate identifiers after a base advance. This chain is what made that grep
incomplete — half the ID space now lives in a file the instruction does not name. The earlier
`grep open-items` had matched the file on an unrelated line, so it read as already swept. The chain that
creates a hazard is not automatically the chain that notices the instruction guarding against it.

**The compatibility escape hatch did not cover the case.** `x_enforcement: warn-until-<version>` exists in
`lib.mjs` for exactly the upgrade break that closing an object causes, and it is honoured only on a
schema-valued `additionalProperties`, never the boolean form. So the single hardening in this change that
could break a consumer is the one that cannot be softened. Recorded as `partial` on RI5 across four
artifacts rather than smoothed into `shipped`.

**`check-waivers` rejected this chain's prose twice**, once for quoting a schema enum description
containing the word "waived", and once for a sentence whose entire content is that there are no waivers.
Both times the artifact was reworded to satisfy the heuristic rather than to say something truer, which is
a small but real cost to pay repeatedly.

**The sweep step this chain shipped has still never moved an item.** Its own Reflect was the first run
under the amended contract, and the live ledger held no `done` item, so it correctly rotated nothing and
reported `items_swept: 0`. The bulk migration of 70 items was done by the chain, not the skill. Filed as
an open item so the first chain that actually closes something verifies the path rather than assuming it.

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none
