# 2026-09-09 — open-items-remediation

Append-only raw session record. Not curated.

## What the chain did

Closed the pre-1.1.0 open-items backlog. Five phases of known fixes (R1–R5) had already shipped
when the chain reached Review; Review held it, three more requirements were added to make the
record match the branch, and six findings were remediated in a user-authorised fix pass.

## The sequence that mattered

1. **Review was scoped to the diff, not the record.** `release/1.1.0..HEAD` — 184 files, eighteen
   commits — against a task artifact describing five phases and seventeen files. The gap was the
   finding.
2. **Thirteen commits had landed after Build closed.** The grandfathered-artifact repair and the
   whole mutation-defence sweep, under no requirement and no plan phase. The sweep reversed a
   Non-Goal the brief itself had declared.
3. **One file in that diff was covered by no task artifact anywhere in the repo.** Reproducing the
   rule in an isolated git repo showed it rejects exactly that shape, so the mandatory gate had not
   executed — on the branch that had just repaired that same gate.
4. **The gate's repair turned out to be half a repair.** It made the hook prefer the repo's own
   `bin/`, but `resolveValidator` still put `definitions_root` first, so the validator FILES came
   from the installed tree. Eight differed from source, including the one this chain had just
   fixed. OI-86's own text had noticed the coupling and dismissed it as harmless because the trees
   were byte-identical — which R2 had already stopped being true.
5. **A marker experiment nearly lied.** The first marker was appended to the end of the validator,
   after its own `process.exit()`. It would have reported "the installed copy ran" whether or not
   that was true. Moving it to import time made the before/after real: 0 hits, then 1.
6. **The fix pass produced a wrong finding of its own.** F5 was written as a breaking change to a
   shipped contract. `check-council-record` has never been published — councils ship first in
   1.1.0. The installed tree carried it, which is what made it look shipped, which is F3 again.
   Caught only when the recommendation was challenged, and withdrawn in place rather than deleted.
7. **Two residual risks were closed by doing the work.** The full mutation audit measured `0/221`
   at head. Re-running the upgrade rehearsal against the genuinely published 1.0.0 tarball found
   F6: the version-skew warning told the reader to run `prepare`, admitted prepare does not update
   `repo-profile.yaml`, and never said what does. The warning survived prepare and every subsequent
   check. `init` is what clears it, and re-scaffolds `.agentsmyth/` doing so.
8. **Validators caught two artifact-prose failures within a minute of writing.** Seven empty
   evidence cells in the verify artifact; a `ship` recommendation carrying blockers in the ship
   artifact. The second taught the distinction: a pending decision is a checkpoint, not a blocker.

## Things worth remembering

- The coverage gate unions Changed Files across every task artifact in the repo. 80 of 81 gated
  files here were "covered" by chains closed months ago. It asks whether some chain once touched a
  path, not whether this change is in scope.
- Repairing debt can lower coverage: fixing the grandfathered violations removed the only thing
  exercising `check-artifacts`' next_phase rule, and the undefended count went up.
- A gate that is trusted and silently bypassable is worse than no gate. Two commits bypassed it and
  the cause is still unproven, because `--no-verify` leaves no trace.

## Where it stopped

Ship approved for the decision and the phase transition only. Nothing pushed, PR #66 still at
`b8fe90a`, `release/1.1.0` untouched. Five commits sit locally. The 1.1.0 release inherits an
unre-derived npm audit position (OI-35) and a CHANGELOG entry dated 2026-09-08.
