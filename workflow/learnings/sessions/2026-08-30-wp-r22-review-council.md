# 2026-08-30 — wp-r22-review-council

Append-only raw session record. Not curated.

## What the chain did

Extended the WP-R21 council mechanism to Review, and added the finding-quality ledger. Ten Build
phases, a real Review council, mutation testing at Test, ship recommendation `ship`.

## The sequence that mattered

1. **Build shipped clean, by its own measure.** Ten phases, every suite green, 92 fixtures.
2. **The Review council found 30 distinct defects.** Three reviewers over disjoint risk categories,
   one challenger. Every P1 was a rule the documentation asserted and the code did not perform:
   the repo fence never compared, the ledger with no producer, a starter block that did not
   validate, an attribution predicate whose member-matching half was unreachable, a disjointness
   rule that passed when its section was deleted, a waiver escape satisfied by prose denying a
   waiver.
3. **One finding broke the tree while the review was being written.** Populating the ledger with the
   council's own 56 rows failed 26 historical ship artifacts, because the Ship gate read a
   repo-global ledger with no chain scoping. Fixed immediately; the rest went through the Build loop.
4. **Test replaced a suite re-run with mutation testing**, after the first Test pass was rejected for
   confirming rather than verifying. 27 of this package's 86 rules were undefended. Driven to zero.
5. **The sweep was extended to the whole package.** 106 of 217 rules undefended. Ten validators at
   100%. `check-lifecycle` at 16 of 17.

## Mistakes worth keeping

- Ran a repo-mutating harness in the background while continuing to work in the same repo, then
  treated the resulting measurement as contaminated. It was correct.
- Manually "disproved" that measurement using a check broken by a bug I had not yet found.
- Shipped a mutation harness that reported perfect coverage when a suite was already failing —
  every mutant scores as killed. The most reassuring possible output from a completely broken state.
- Baked a volatile fact into a fixture expectation (`package.json has 63 lines`). Adding one script
  broke it.
- Reintroduced, while fixing a finding, the exact temporal-dead-zone ReferenceError that the file's
  own comment warns about.
- Deleted Phase 7's rules in Phase 9 by anchoring a text replacement on a span that ran past them.
  Every suite stayed green for two commits.
- Left two files committed with no task artifact declaring them, after a fix-up edit failed silently.

## The pattern under all of it

Every defect in this chain — mine and the council's — was invisible to reading and visible to
probing. The suite answers "does it pass". Almost nothing here answered "would it notice", until
something was deliberately broken to find out.

## Unresolved

- OI-82: 106 undefended rules, baselined as a ratchet.
- OI-83: the pre-commit gate passed a commit it should have rejected, and the cause is unknown.
- PR #65 is not merged; the user approved the ship decision, not the merge.
