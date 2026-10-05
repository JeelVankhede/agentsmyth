# Session — wp-r18-delta-upgrades (2026-09-21 → 2026-09-24)

## Context

WP-R18, the eighth and last package of 1.1.0, and the only one the release was waiting on. Give
agentsmyth an upgrade path: record what it wrote to each governed file, and on a later run tell a
file the user edited from one that is merely stale — bringing the second current key by key and
preserving the first before anything touches it. Complex class, so councils fired at Think and
Review. Branch `feat/wp-r18-delta-upgrades` off `release/1.1.0`.

Shipped as PR #72. 26 of 27 manifest IDs shipped, 1 waived, 0 deferred.

## Candidate Learnings

- A test that runs its subject from a location the product never uses can be green and mean nothing.
  The source tree, the expanded bundle and the global install are three different places, and any
  code that resolves a path relative to itself answers differently in each.
- A phase that both performs work and records its own outcome will record success. "This finding was
  real" and "the fix worked" are different claims with different authors and different timing.
- A writer that owns only part of a file must normalise what it preserves, not only what it writes.
  Assert idempotence on bytes, across repeated runs, against a file seeded with the user's content.

## What Happened

Four separate defect-finding passes fired *after* Build declared itself complete, and each found real
defects that the previous pass had certified.

**Think round 2** (re-run at the user's direction, because round 1's integrity bracket had been taken
wrongly) found two release-blockers in code whose Build exit gate was already met: the gate refresh
had been routed through the governed set, so a hook in `.git/hooks` — every consumer who had not set
`core.hooksPath` — silently stopped being upgradeable; and adapter governance keyed on existence
rather than authorship, so a pre-existing `.github/copilot-instructions.md` was adopted as
agentsmyth's and replaced.

**The Review council** (12 members, 3 rounds, 77 findings) returned `hold` with six P0. Every one was
a path to irrecoverable data loss or a write outside the repository. The most severe needed no
attacker and one keystroke: re-running `init` re-baselined provenance against whatever was on disk,
laundering a user's edits into "agentsmyth wrote this". Two adversarial challengers were worth more
than two more finders — they refuted one overbroad framing, recalibrated two severities, and *proved*
the suite's worst gap by trial rather than asserting it.

That gap: reverting the one upgrade-logic defect the council had already caught left all 51
assertions green. So the remediation adopted a rule — every fix verified by reverting *that fix
alone* in a throwaway package copy and confirming a named assertion goes red. Twelve for twelve. It
caught three of my own new tests passing for the wrong reason, none of which inspection had caught.

**Test** found two defects in that remediation, both the same shape the council had been convened to
find: a check that cannot fail for the reason it was written. The RI14 enforcement required *every*
governed file to differ, but setup rewrites only the five configs, so the real signature is five of
seven and the condition was dead. The RI16 version read probed for a `package.json` that resolves in
`src/` and in no location a consumer runs from — inert everywhere it shipped, while its unit test
stayed green because that suite runs the validator out of `src/`.

**Live use** found two more, neither reachable by any fixture, because every fixture seeded an empty
or unrelated file. `AGENTS.md` duplicated its own block when the body was already present unmarked.
And `prepare` appended a blank line to the user's global config on every run — the real machine had
accumulated 34. I had been reporting `prepare` as "un-run" for several turns instead of observing it;
the user had to say so directly, and the diff that followed is what exposed the second bug.

## What I Would Do Differently

- Run the thing, in a sandbox, early. The `prepare` observation took ten minutes and produced the
  first real evidence that the adapter-gate fix reached an installed file — plus a bug. I had been
  treating it as a decision to defer rather than a behaviour to watch.
- Seed fixtures with the *awkward* state, not the empty one. Both live bugs lived in a file that
  already contained something plausible. An empty-file fixture cannot see them by construction.
- When narrowing a rule, check its own rejection fixture still rejects. Narrowing RI14 to config
  files silently broke the fixture added for it three commits earlier; the only signal was
  `violations:test` dropping 223 → 222.
- Do not let a long-running audit's tree snapshot go stale. `mutation:audit` was run three times and
  re-derived once; every re-run was necessary because the copy predated later edits.

## Notes For The Next Chain

- The chain's own artifacts needed re-closing twice, and both times the stale record read as
  authoritative: a Command Results table claiming 36 assertions where 51 ran, and a brief asserting
  three contradictory things about one validator result while that validator reported `ok`.
- `check-council-record` reads a single integrity bracket. A two-round council has two, and the
  record cannot currently say so — filed as a follow-up.
- Eight follow-ups are open with named owners. Two gate the 1.1.0 tag: a non-darwin CI job for
  RI18's eight-artifact branch and RI13's Windows half, and acceptance of the FQ-80 waiver.
- `package.json` is deliberately still 1.0.1. Every version-stamp behaviour this package ships was
  exercised at 1.0.1 → 1.0.1, so the mechanism is proven and a real version step is not. The first
  genuine step happens at dispatch.
