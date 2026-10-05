---
slug: wp-r25-prerelease-hardening
version: 1
artifact: learning-session
date: 2026-10-05
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/wp-r25-prerelease-hardening-v1.md
---

# Raw Learnings - wp-r25-prerelease-hardening v1

## Context

Three consumer-reported observations before the 1.1.0 release — a stale global definitions tree, the
gate hook landing in husky's regenerated directory, and the council having no model/effort parameter
— became an eight-phase chain. The Review council then returned `hold` with 22 findings, 4 critical,
all in code written during this chain. Phase 8 was added by explicit plan update to remediate them
before Test.

Net: 23 requirements shipped, 22 findings fixed, no waivers anywhere in the chain, two new test
suites, and twelve new validator rules each with its own rejection fixture. The release itself has
not been dispatched.

## Candidate Learnings

**LC-1 — Assert the wiring, not the rule.**
A rule can be correct, reachable, fixture-covered and mutation-defended while nothing invokes it, and
every suite stays green. Two findings in this chain were that exact shape: the Think gate had no
invoker, and the council-record check ran on only one of the commit hook's two legs. Neither a
rule-level fixture nor a mutation ratchet can see this class, because both operate on a rule that is
never reached. When a surface claims a mechanical gate, something must assert the surface invokes it.

**LC-2 — Verify a Fix line clause by clause, not finding by finding.**
Two findings carried two separable obligations each and had one landed each. A finding-level check
passed both. Decomposing every Fix line into clauses afterward found four further obligations that
had never been tested. The unit of verification should match the unit the finding was written in.

**LC-3 — A checklist entry is not coverage until something executes it.**
`docs/release-checklist.md` described the exact double-edit upgrade rehearsal that would have caught
F5, and had since 1.0.1. The defect shipped anyway. Entries that can be automated should become
suites and leave the checklist; the ones that cannot — another host, OS, or tool — are the ones that
actually need a human, and are the ones most likely to be skipped.

## Raw Notes

- The Review council found roughly nine times more than the field reported, and all of it in code
  from this chain. Worth holding both readings: the council is valuable, and a chain that produces 22
  findings in its own new code is also telling you something about how that code was written.

- **Six findings were one defect.** F3, F6, F7, F13, F14 and F20 all came from asking a string a
  question only the filesystem can answer. One resolving helper and one new suite closed all six.
  Reading a finding list as a list of problems rather than looking for the shared cause would have
  produced six patches and probably a seventh face of the same mistake later.

- **My own Phase 3 default nearly vacated Phase 3's feature.** I shipped
  `council.model_tier: standard` as a global default. F8 asked for the gate to key on the resolved
  value instead of the item's status — and keying on the value exposed that a global default resolves
  a tier for every repo that never answered. The feature and its gate cancelled out. No finding named
  it; it surfaced only while fixing a different one. A "safe default" is not safe when the thing being
  defaulted is how much the user spends.

- **A fix can make another fix's guard unreachable.** Once F5 relocates a colliding backup, F4's
  guard can never be reached: the precondition requires this run's file to byte-match a backup taken
  before an earlier rewrite of the same file, and if those match then that earlier run changed
  nothing and raised no item. I kept the guard as a backstop and wrote the reasoning beside it,
  because the next reader will look for its test and conclude it is dead code.

- **A review can be right about the defect and wrong about the remedy.** F9 asked for a catch on an
  unreadable pending-setup file. The hand-rolled parser tolerates malformed YAML, so the catch would
  never have fired. The value-based redesign fixes it structurally. Implementing a Fix line literally
  is not the same as closing the finding.

- **The gate refused my commits four times and was right every time.** Twice for files outside the
  task's Changed Files, twice for paths outside the plan's Phase 8 Touches. The correct response was
  an explicit plan update, not a waiver. Friction that is correct is not friction to remove.

- **`mutation:audit` is hostile to concurrent work and I hit it twice in one phase.** It mutates
  validator source in place; any edit alongside it can clobber a fix and invalidates the result
  either way. Both runs were discarded. ~40 minutes lost to a hazard a lock file would prevent.

- **Three probes failed first-run and all three were the probe's fault.** The instructive one
  asserted gate-before-host on the hook APPEND path, where the gate being last is deliberate —
  outside a generated hooks directory a hand-written hook may establish the environment the gate
  depends on. I had encoded a husky-specific invariant as a universal one. The code was more careful
  than my test of it.

- **Two of my comments asserted properties the code lacked** — the prune's containment claim and a
  ledger-ordering claim. Both were caught by the council, not by me. A safety argument in a comment
  stops the next reader from checking, which makes a wrong one worse than none.

- **Four factual claims in my own artifacts were wrong before I checked them**: a ship-artifact count
  (26 vs 33), a command I cited without running, and twice telling the user `package.json` at 1.0.1
  was outstanding work when the release checklist's own first section says pre-bumping is the error.
  All four were in prose I wrote confidently.

- **Dogfooding caught the defect in this repo.** F22 required a rendered council-member definition
  once a tier resolves; agentsmyth had a configured tier and no definition, so its own council members
  ran on the host default. The feature was a wish here too.

- **154 finding-quality rows, zero `noise`.** No council finding in this ledger's history has ever
  been judged as not holding up. Either the councils are that accurate or `noise` is a verdict nobody
  reaches for. Filed as OI-119 rather than guessed at.

- **The thing that caught my worst error was being asked.** "Are you sure that all findings are
  resolved?" found two open findings that fifteen green suites had not. Then "re-audit the other 20
  the same way" found four more untested clauses. No step in the process produced either; a question
  did. That is a real limitation of the process, not a compliment to the question.

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none
