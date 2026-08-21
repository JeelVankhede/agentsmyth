---
slug: wp-r21-think-council
version: 1
artifact: learning-session
date: 2026-08-18
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/wp-r21-think-council-v1.md
---

# Raw Learnings - wp-r21-think-council v1

## Context

WP-R21 (Complex, P1) added a read-only research council with an adversarial challenge pass to the
Think phase, restructured `lifecycle-think` into eight explicit stages, and shipped
`check-council-record.mjs` plus 31 rejection fixtures. Full lifecycle chain across 2026-08-15 to
2026-08-18; shipped via PR #64 into `release/1.1.0`.

The package's own premise is that instruction is what an agent drifts from, so every rule should be
mechanically checked. The chain repeatedly demonstrated that premise at its author's expense, which
is what makes this session worth keeping.

## Candidate Learnings

1. A green suite proves what was written, not what was required.
2. A validator's correctness cannot be established by its author reading it.
3. Repeated deferral hides behind local defensibility.
4. A negative control must assert its mutation applied.
5. A rejection fixture should emit exactly one error.
6. State a rule once; every restatement is a future drift site.
7. Dogfooding surfaces contract defects that inspection does not.
8. An unfavourable measurement should be recorded in more places than one.

## Raw Notes

**The self-audit.** Seven Build phases were marked complete on `validate 0 · conformance 19/19 ·
violations 44/44`. An audit then found six acceptance criteria with no enforcement whatsoever — R9
(requirement classification) had no schema field, no body section, and no check; R11's sandbox rules
were entirely unimplemented because the validator never read a Members table. The suite had only
ever tested what was written. The prior commit had called this a "partial gate deferral", which was
worse than the gap: it framed a hole as a schedule and stopped further looking.

**Probing versus reading.** Two full reads of `check-council-record.mjs` produced a clean bill.
Probing it found two P1s in minutes: `sandbox_root` was resolved, stored in config, and never
compared against anything; the survivor-escalation rule read survivors out of free text, so a run
could terminate `max-rounds` and delete the line. The second is notable because the code *looks*
complete — the failure is an absence, and absences are what reading is worst at.

**Deferral shape.** The cost measurement was deferred at Build ("that's Review-phase work"), at
Review ("next is Test"), and again at Test. Each was locally defensible; the pattern was not. It
took direct user intervention. When the measurement finally ran it was unfavourable to the feature,
which is worth noting as a plausible cause rather than a coincidence.

**The worthless probe.** A negative control meant to prove a rule still rejected bad input returned
`ok`. The mutation had silently not applied — probe and original were byte-identical. It was nearly
reported as evidence that the rule held. Subsequent probes assert `if (mutated === original) exit 1`
before concluding anything.

**Attribution sweep.** After wiring 15 fixtures, a sweep counting errors per fixture found two
emitting two errors each — they rejected partly for an undeclared member, not only for the rule they
targeted. Both would have continued passing if their real rule regressed. "Fixture rejects" is a
weaker claim than "fixture rejects for its stated reason", and the stronger one was being asserted
from the weaker evidence.

**Restatement is where drift lives.** RI1's narrowing was stated once in `independence-rules.md` and
referenced elsewhere; it stayed consistent. The carve-out was written into two files; when one was
reworded the other kept superseded text, and a live council member found it. Separately,
`decision-tree-by-phase.md` was written to restate four conditions *and* claim "this file does not
restate them, it defers" — both sentences authored in the same edit.

**The council's actual value.** On volume it lost: a single-agent baseline produced 22 findings from
1 invocation against 8 from 4 intended council invocations covering 2 of 3 buckets. What the
baseline could not do was refute itself. The challenger overturned a researcher's headline claim
(that the carve-out's principle contradicted its conditions), corrected a line number, and flagged a
citation as true-but-misleading. Refutation is the mechanism a single agent structurally lacks, and
it is invisible to finding counts.

**Gates catching the author.** Across the chain: `check-scope-fence` three times (abbreviated paths,
a glob, undeclared files), `check-commit-coverage` twice, `check-evidence-citations` five times
(empty cells are uncited claims), `check-council-record` three times on its own author's record,
`check-coverage-ledger` once — the last a genuine false positive, filed as OI-75. The gates were
right in every case but one.

**Two latent contract defects surfaced by use.** OI-73: the checkpoint quote extractor terminated at
the first line end, so a multi-line approval truncated into the placeholder guard — meaning "quote
the user verbatim" was in direct tension with what could be stored. OI-74: the pre-commit gate
mapped a `tasks/` artifact to the downstream `review` phase, so a task legitimately `in-progress`
for all of Build could never be committed, forcing routine `--no-verify`. Neither would have been
found by auditing; both bit immediately when the workflow was actually used.

## Curator Marks

<!-- empty — for the curator, not the author -->
