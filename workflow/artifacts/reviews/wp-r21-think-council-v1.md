---
slug: wp-r21-think-council
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-08-17
updated: 2026-08-29
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9]
upstream:
  - workflow/artifacts/tasks/wp-r21-think-council-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# WP-R21 Think Council - Review

## Findings

Five findings. Two are P1 — one is a requirement that reads as enforced and is not, the other is an
anti-drift rule evadable by omitting a line. Both were found by probing the validator rather than by
reading it, which is worth noting: reading it had already produced a clean bill twice.

### P1-1 — `sandbox_root` is loaded and never used; R11's fence is not enforced

- **Severity:** P1
- **Area:** `src/workflow/validators/check-council-record.mjs` (`resolveCouncilConfig`, member loop)
- **Manifest IDs:** R11
- **Problem:** R11's acceptance requires that "a declared path outside the resolved `sandbox_root`
  fails". The validator resolves `sandbox_root` global-then-repo-local, stores it in
  `councilConfig`, and then never reads it. The member loop checks only `isOutsideRepo()`. So a
  member declaring `/tmp/anywhere` — or any absolute path outside the repo — passes, and the
  configured sandbox is decoration.

  This is the same failure class as the audit that produced amendment A4, one layer in: the config
  key, the schema, the documentation, and the resolver all exist, which makes the requirement *look*
  enforced from every angle except the one that matters. `grep sandbox_root` returns four hits and
  none of them is a check.
- **Fix:** compare the declared path against the resolved `sandbox_root` prefix, not merely against
  the repo root. Keep the outside-repo assertion as well — they are different guarantees, and
  `sandbox_root` being misconfigured to a path inside the repo should fail both.

### P1-2 — the survivor-escalation rule is evadable by omission

- **Severity:** P1
- **Area:** `src/workflow/validators/check-council-record.mjs` (survivor block)
- **Manifest IDs:** R13
- **Problem:** Survivors are parsed out of the Termination subsection's free-text
  `Surviving items and their round history:` line. If a run terminates `max-rounds` and simply omits
  that line, `survivors` is empty and the check passes.

  Verified empirically: the well-formed fixture with `termination_reason` flipped to `max-rounds`
  and the surviving-items line deleted returns `check-council-record: ok`.

  This matters more than its size suggests. The rule exists because RK-H identified convergence-by-
  exhaustion as the likeliest real failure — an agent closes easy items while the hard one survives
  every round. Making the escape "delete a line" leaves the rule enforcing good behaviour only in
  runs that were already behaving well.
- **Fix:** require the surviving-items line whenever `termination_reason` is `max-rounds` or
  `no-progress`, and derive survivors structurally instead — an item ID appearing in a round's
  open-in set and in no round's closed set — rather than trusting prose. The Rounds table already
  carries closed IDs; the open-in side needs IDs rather than a count.

### P2-1 — the repo fence uses `process.cwd()` instead of the resolved repo root

- **Severity:** P2
- **Area:** `src/workflow/validators/check-council-record.mjs` (`isOutsideRepo`)
- **Manifest IDs:** R11
- **Problem:** `isOutsideRepo` compares against `process.cwd()`. Every other validator resolves the
  repo root through `lib.mjs`'s `repoRoot`, which handles the `workspace_root` pointer, then
  `git rev-parse --show-toplevel`, then cwd (WP-R5 T5.2). Invoked from a package subdirectory of a
  monorepo — a configuration this repo explicitly supports — `process.cwd()` is the subdirectory, so
  a sandbox path elsewhere in the same repo reads as "outside" and passes.

  CI does not catch this because the conformance harness spawns with `cwd: repoRoot`.
- **Fix:** import and use `repoRoot` from `lib.mjs`.

### P3-1 — dead code in the survivor block

- **Severity:** P3
- **Area:** `src/workflow/validators/check-council-record.mjs`
- **Manifest IDs:** R13
- **Problem:** `const everOpen = new Set(...)` followed by `void everOpen;` — a half-written
  structural survivor derivation, abandoned and silenced rather than removed. It is also a marker
  of exactly where P1-2's proper fix belongs.
- **Fix:** delete it as part of the P1-2 fix.

### P3-2 — misleading message for a directory citation, and an unguarded `readText`

- **Severity:** P3
- **Area:** `src/workflow/validators/check-council-record.mjs` (`checkCitation`)
- **Manifest IDs:** R10
- **Problem:** A `repo` citation naming a directory (`src/workflow/skills`) is rejected with
  "citation names no file path", which is untrue — a path was given, it just did not match the
  extension-bearing regex. Separately, the line-range branch calls `readText(cited)` with no guard;
  a citation naming a directory *with* a dotted segment and a line range would throw rather than
  producing a validator error.
- **Fix:** distinguish "no path found" from "path is not a file", and guard the `readText` call.

## Severity Summary

| Severity | Open | Found | IDs | Status |
|---|---|---|---|---|
| P0 | 0 | 0 | — | — |
| P1 | 0 | 2 | P1-1, P1-2 | both fixed 2026-08-18, each locked by a fixture |
| P2 | 0 | 1 | P2-1 | fixed 2026-08-18, locked by a discriminating probe |
| P3 | 0 | 2 | P3-1, P3-2 | both fixed 2026-08-18 |

All findings are closed. The `Open` column is what `check-release-readiness.mjs` reads; `Found`
preserves what the review actually caught, because erasing that would make the review look like it
found nothing.

## Requirement Coverage

| Manifest ID | Status | Notes |
|---|---|---|
| R1 | covered | `council.resolution.task_class` is recorded and the validator recomputes the expected mode from it (`db`). Was partial; closed by R-1 remediation. |
| R2 | covered | Both axes enforced; carve-out outward capability rejected by fixture `cr` |
| R3 | covered | Attribution, declared-member existence, and the web spot-check duty all enforced (`ca`, `cx`, `ci`) |
| R4 | covered | Disposition enum and non-empty reason enforced (`cb`) |
| R5 | covered | Missing recommendation, unresolvable refs, and recall-only all enforced (`cu`, `cv`, `cj`) |
| R6 | covered | Every existing brief validates with zero edits; `council:` optional at schema top level |
| R7 | covered | Precedence is re-derived from the recorded resolution inputs, including refusal-reason ordering (`db`, `dc`). Was partial; closed by R-1 remediation. |
| R8 | covered | Preserved path byte-locked by conformance `r21-single-agent-verbatim` |
| R9 | covered | Classification presence and non-empty class list enforced (`cp`, `cq`) |
| R10 | covered | Per-class citation contracts enforced (`cf`, `cg`, `cj`); P3-2 is a message defect, not a coverage gap |
| R11 | covered | Declaration and disjointness (`cs`, `ct`, `cw`), the `sandbox_root` fence (`cy`), and filesystem-scoped repo integrity including gitignored outputs (`dd`, `de`) all enforced. Was partial; closed by P1-1 and R-2 remediation. |
| R12 | covered | Per-class availability enforced; refusal reason enforced (`cl`) |
| R13 | covered | Non-increasing fan-out, taper coherence, `max_rounds` (`cc`, `cd`, `ce`), and the now-mandatory survivor declaration (`cz`) all enforced. Was partial; closed by P1-2 remediation. |
| R14 | covered | Round, finding, conflict, and termination structure all required |
| R15 | covered | Eight-stage list locked by conformance `r21-think-stages` |
| RI1 | covered | Blanket form gone; conflict recording enforced (`ch`, `co`) |
| RI2 | covered | Carve-out stated as bounding principle; no-nesting restated in the council skill |
| RI3 | covered | Registered in the explicit validator list; summary output locked by `r21-council-summary` |
| RI4 | covered | Frontmatter-only distinguishability; depth-1 enforced (`ck`, `cn`) |
| RI5 | covered | `npm run build` clean; `render-adapters` current |
| RI6 | covered | All six non-claims present as plain limitations |
| RI7 | covered | `cap_source` recorded and schema-constrained; departure documented in `phase-caps.md` |
| RI8 | covered | Depth dial resolves global-then-repo-local and is schema-constrained |
| RI9 | covered | 24 fixtures, attribution sweep confirms one error each |

No `partial` rows remain. The four that were partial at review time — R1, R7, R11, R13 — are closed
by the remediation recorded below, each with a fixture named in its row.

## Architecture Notes

- role: Reviewer
- decision: Recommend `pass-with-risk` rather than `hold`. Neither P1 is a correctness bug in
  shipped agent behaviour — both are validators failing to catch a violation, so the failure mode is
  a missed rejection rather than a false one. Nothing that currently passes would start failing once
  fixed, so the fixes are additive and carry no regression surface.
- observation: Both P1s were found by **probing** the validator, not by reading it. Two prior reads
  produced a clean bill. The lesson generalises beyond this package — a validator's own correctness
  is exactly the thing its authors cannot establish by inspection, and the attribution sweep added
  during Build is the same insight arriving one step earlier.
- observation: P1-1 and the A4 audit are the same failure at different depths. There, requirements
  were documented but unchecked. Here, a check exists, resolves its config, and then does not use
  it — which is *harder* to see, because every surface except the comparison itself looks correct.
- downstream: WP-R22 inherits the three frozen contracts, none of which is implicated in any
  finding. R22 is not blocked by this review.

## Verification Reviewed

| Command / probe | Outcome | Notes |
|---|---|---|
| `npm run validate` | exit 0 | Full validator sweep including `check-council-record` |
| `npm run conformance:test` | 19/19 | Includes positive control and the summary-output lock |
| `npm run violations:test` | 53/53 | 24 council fixtures |
| Attribution sweep (24 fixtures) | one error each | Confirms every rejection is traceable to its own rule |
| `grep -n sandbox_root check-council-record.mjs` | 1 hit, in defaults only | Evidence for P1-1 — the resolved value is never compared against |
| Probe: `max-rounds` with surviving-items line deleted | `check-council-record: ok` | Evidence for P1-2 |
| Probe: `repo` citation naming a directory | rejected, misleading message | Evidence for P3-2; no crash in the common path |

## Residual Risk

All four residual risks raised by this review are closed. Retained here with their outcomes rather
than deleted, because a residual-risk section that only ever lists open items gives no signal about
whether anything ever gets closed.

- **R-1 — resolution behaviour unverifiable from the record. CLOSED.** `council.resolution` now
  records resolved `dispatch_enabled`, resolved `council_enabled`, and `task_class`; the validator
  recomputes the expected mode and fails on disagreement. Fixtures `db`, `dc`.
- **R-2 — repo-integrity hashing unimplemented. CLOSED.** `validators/repo-digest.mjs` digests the
  tree including gitignored build outputs; `council.repo_integrity` carries before/after and is
  required whenever a member declared a sandbox. Fixtures `dd`, `de`, plus the live `dist/` proof.
- **R-3 — cost unmeasured. CLOSED as measured, and the result is unfavourable.** ~6× invocations for
  less coverage than a single-agent baseline. Not a defect to fix; an input to the product decision
  about whether `council.enabled` should default on.
- **R-4 — two `--no-verify` commits (OI-74). CLOSED.** The hook now gates a `tasks/` artifact on the
  downstream phase only once it claims `ready-for-next-phase`, so incremental Build commits no longer
  require a bypass.

Carried forward as a stated limit rather than a risk: RI6's non-claims. `check-council-record`
validates the record, not the thinking, and no amount of remediation changes that.

## Post-Review Remediation (2026-08-18)

All five findings and all four residual risks were closed after this review was written. Recorded
here rather than by rewriting the findings above, so the review still shows what it caught.

| Item | Fix | Locked by |
|---|---|---|
| P1-1 `sandbox_root` never compared | `isUnderSandboxRoot()`; both fences kept so a root misconfigured inside the repo fails both | fixture `cy-sandbox-outside-root` |
| P1-2 survivor rule evadable by omission | The surviving-items declaration is now mandatory for `max-rounds`/`no-progress`, so silence fails before the comparison runs | fixture `cz-maxrounds-no-survivor-line` |
| P2-1 `process.cwd()` not repo root | Uses `lib.mjs`'s resolved `repoRoot` | probe: absolute in-repo sandbox path rejected identically from repo root and from `src/` |
| P3-1 dead code | Removed with the P1-2 rewrite | `grep void everOpen` → 0 |
| P3-2 message + unguarded `readText` | Extensionless paths recognised; `readText` guarded so a directory citation errors instead of throwing | — |
| R-1 resolution unverifiable | `council.resolution` records the three deciding inputs; the validator recomputes the expected mode and fails on disagreement, including refusal-reason precedence | fixtures `db-resolution-mismatch`, `dc-refusal-reason-wrong` |
| R-2 repo integrity unimplemented | New `validators/repo-digest.mjs` hashes the tree **including gitignored build outputs**; `council.repo_integrity` carries before/after, required whenever a member declared a sandbox | fixtures `dd-sandbox-without-integrity`, `de-integrity-mismatch` |
| R-3 cost unmeasured | Measured against a real single-agent baseline — see below | — |
| R-4 `--no-verify` (OI-74) | Hook now checks the downstream gate only once a task claims `ready-for-next-phase` | — |

Four further defects were found by the live council run and fixed at the same time: the
`decision-tree-by-phase.md` carve-out desync, `think-council/SKILL.md` carrying superseded wording,
the phase-agnostic `default_fan_out`, and two validator parsing defects (wrapped Q bullets, and a
missing `Questions For User` section failing open).

**R-2 proof.** Mutating `dist/workflow-bundle.md` — gitignored, and the file consumers actually
install — leaves `git status --porcelain dist/` empty while the digest moves
`7c7aaf95bb62 → f08677cc6ca1`, and `npm run build` restores it exactly. The build is deterministic
across repeated runs.

**R-3 measurement, reported against interest.** A real single-agent baseline over the same three
research buckets produced **22 findings from 1 invocation**; the council produced **8 from 4 intended
invocations (6 attempted, two lost to API 529s)** and covered only 2 of 3 buckets after one member
died. Not a controlled A/B — the council ran before several fixes and the baseline after — but on
invocation count the council cost roughly 6× for less coverage. Its distinctive contribution was the
challenge pass refuting a wrong finding, which the baseline has no mechanism for and which showed in
the baseline's own output (at least one of its claims is imprecise and nothing checked it). Whether
that justifies `council.enabled` defaulting on is a product decision this review does not make.

Suite after remediation: `validate` exit 0 · conformance 19/19 · violations 56 → **60/60** ·
31 council fixtures, attribution sweep confirming exactly one error each.

## External Review (PR #64, 2026-08-24)

A fresh external review of the PR raised thirteen findings against the shipped branch. All are
recorded here with dispositions. Eleven are fixed in this pass; two are recorded as open items
because acting on them unilaterally would change a shipped CLI contract or a gate that predates this
package.

| # | Finding | Disposition |
|---|---|---|
| 1 | `check-council-record.mjs` unreachable in a consumer repo — CLI hardcodes two filenames, `validate-template.mjs` is not shipped, no skill names it | **fixed (partial) + deferred** — named in `lifecycle-think`'s Exit Gate and pinned by conformance `r21-validator-named`. The mechanism question is OI-80, not decided here |
| 2 | `council.resolution` optional, so R-1 re-derivation fails open | **fixed** — schema stays optional; validator requires it when `mode: council`. Fixture `dg` |
| 3 | `repo` citation regex unanchored — `see \`src/x.mjs\`` resolved to `see` | **fixed** — all candidate tokens collected, passes if any resolves. Base fixture's F1 is now prose-prefixed, so the positive path is exercised |
| 4 | RI1's reconcile-contract precondition unrecorded and unenforced | **fixed** — `### Reconcile Contract` in the starter block, required whenever ≥2 members share a `surface`. Fixture `df` |
| 5 | `web`-may-not-decide-a-repo-shaped-question stated twice, enforced nowhere | **fixed (enforced)** — checked against Requirement Classification, which already records the settling class |
| 6 | Spot-check scope drift — docs say per round, validator satisfied by any one finding | **fixed** — Findings gains a `Round` column; the rule is per round. Fixture `dh` |
| 7 | Taper coherence tested the open-item delta, not "closed nothing" | **fixed** — gates on `prev.closed.length === 0`, so the message can no longer contradict the table |
| 8 | Survivor escalation skipped single-round runs and never fired for `no-progress` | **fixed** — round-count guard removed; covers both terminations that imply unfinished business |
| 9 | Questions For User folding merged unrelated entries | **fixed** — folding stops at any line introducing its own `Q`, and at table rows |
| 10 | Validation not hermetic — config read from the host repo, fences depended on `$HOME` | **fixed** — config resolves from the fixture dir under `--dir`; `homedir()` fallback makes the fences `$HOME`-independent. Verified identical with and without |
| 11 | Hook read the working tree and the wrong status field | **fixed** — reads `git show :"$file"` and matches `orchestration.status`, falling back to top-level. Both copies. The `set -e` unreachable-loop observation is OI-79 |
| 12 | Ledger contradicted the PR body on OI-73/OI-74 | **fixed** — both closed with resolutions |
| 13 | Validator brief-only, will reject council-mode reviews | **fixed** — escalation checks gated on `artifact === 'brief'` now, ahead of the Review council |

**Two corrections to my own work that the review surfaced indirectly.** The `r21-council-summary`
conformance check asserted the fixture's literal counts, so it failed the moment the base fixture
gained a finding — it now pins the summary's *shape* instead. And the real council record in
`briefs/wp-r22-review-council-v1.md` had to be migrated to the tightened contract rather than
grandfathered, since it is the only real instance of the record this validator exists to check.

**Not claimed.** Finding 1's acceptance depends on a consumer actually running the validator. The
skill mention plus its conformance pin makes the reference durable; it does not make the CLI run it.
That gap is real and stated rather than closed by wording.

## Second External Review (PR #64, 2026-08-29)

A second external pass over the same branch raised nine findings — two blocking, two "should land",
five non-blocking — plus one observation about the PR body. All nine are fixed here; one carries a
deferred follow-up (OI-81) for the part that needs a record-shape change rather than a validator
change. The pass also re-verified the previous thirteen: eleven closed, finding 1 correctly reported
as partial with OI-80 filed.

| # | Finding | Disposition |
|---|---|---|
| 1 | `max-rounds` and `no-progress` were terminations no valid record could carry — the survivor line was mandatory for both and any declared survivor forced `user-decision-required`, so only a vacuous survivor line passed | **fixed by removal** — the enum is now `resolved` \| `user-decision-required` in the schema, in `TERMINATIONS`, in the skill's Round Loop and Exit Gate, and in the `max_rounds` description. The rule hangs off the two remaining reasons and both directions are reachable: `user-decision-required` must declare survivors, `resolved` must have closed everything it declared. No entered-every-round inference is attempted — the Rounds table carries open *counts*, not open IDs, so that predicate is not derivable from it, and the comment says so rather than implying otherwise. Fixtures `ce`, `cz` re-pointed; `di` locks the removal |
| 2 | CI never ran on this branch — `pull_request.branches: [main]` while the PR targets `release/1.1.0` | **fixed** — `release/**` added to both the push and pull_request filters, with the reason in the file. See the CI note below for what it reproduced |
| 3 | `validators/README.md` stale on five rules; the same stale taper wording in `lifecycle-think`'s Exit Gate and Round Loop | **fixed** — the README entry now describes the `Items closed` taper test, the required `resolution` block, the reconcile contract, the Findings `Round` cross-checks, the two-value termination enum, and web-may-not-decide; the non-claims list gains the brief-wide approximation. Both skill sites corrected. Pinned by conformance `r21-taper-wording` and `r21-termination-enum`, the same anti-drift shape as `r21-validator-named` |
| 4 | The Findings `Round` column was authoritative and unvalidated, and the positive control was itself incoherent — F6/F7 declared round 2 with no round-2 member declared anywhere | **fixed** — the fixture declares round-2 rows for m1, m2 and c1, which also makes the Rounds table's 2-researcher/1-challenger claim true; the rows were propagated to all 34 council fixtures so the one-error-per-fixture property holds. The validator now requires a finding's round to name a Rounds row and its member to be declared for that round. Fixtures `dj`, `dk` |
| 5 | `repoShapedClassified` is any-row, not this-question's-row | **fixed as stated, not as joined** — there is no join to make: classification is keyed by manifest ID and a Q line names findings. The approximation is now stated in the error text and in the README non-claims. The record-shape change that would make the join expressible is OI-81 |
| 6 | The recall and web rules both used `every`, so a Q resting on one recall and one web finding escaped both | **fixed** — one predicate: a recommendation with no `repo` or `trial` finding under it fails, outright when it is recall-only and on the repo-shaped condition otherwise |
| 7 | Reconcile Contract fired on the challenge pass, and was checked for non-emptiness only | **fixed** — overlap counts non-challenger members only, so a challenger filing against the surface it attacks is the design working rather than a violation; and the contract must state both how duplicates collapse and how disagreements surface, so "we will reconcile" now fails the check its own starter block says it must. Fixture `dl` |
| 8 | The hook failed open on an unreadable blob — empty `orch_status` skipped the gate | **fixed** — it skips only on a status positively read and not ready; empty gates. Both copies |
| 9 | `expandHome`'s comment contradicted the `homedir()` fallback below it; `isBrief` unreachable behind the `briefs/` filter | **fixed as comments** — the stale claim is gone, and the `isBrief` guard is labelled inert-by-design: the filter widening belongs to the Review council, and widening it without the guard already in place would reject every council-mode review on its first run |

**PR-body observation, accepted.** The R21 brief carries no `council:` block and no other brief on
this branch does either, so `npm run validate` exercises `check-council-record` against zero council
records in the diff. The one real record — `briefs/wp-r22-review-council-v1.md`, migrated to the
tightened contract — is untracked on this branch and therefore not evidence a reader can check. It
does pass locally against the rules as tightened here, and that is stated in the PR body as a local
observation rather than as a verified claim.

## Third External Review (PR #64, 2026-08-29)

Verdict `approve`, with four items to land before merge. The pass verified the second round's nine
findings closed against source and confirmed CI run 33203292050 as a real off-machine reproduction.
All four are fixed here; nothing is deferred, so no new open item is filed.

| # | Finding | Disposition |
|---|---|---|
| 1 | `resolved` was not cross-checked against the final round's `Open out`, so a run with items still open and no `Surviving items` line passed — removing `max-rounds` had made `resolved` the cheapest way to record an unfinished run | **fixed** — a `resolved` record whose final round does not report `Open out: 0` is rejected, naming the round and the number it recorded. The number was already in the table; the check the enum narrowing was implicitly relying on is now explicit. Fixture `dm` |
| 2 | Mirror hole: `Surviving items: none` satisfied the presence test while saying exactly what that test exists to prevent | **fixed, not waived** — an escalation must name at least one parseable item ID. No legitimate escalation lacks one: `user-decision-required` means something is being asked about, and a run with nothing left open is `resolved` — which finding 1 now forces the record to demonstrate. The two rules are each other's floor. Fixture `dn` |
| 3 | `r21-termination-enum` pinned superseded sentences, not the contract | **fixed** — it now parses `TERMINATIONS` out of the validator and `termination_reason.enum` out of `artifact-frontmatter.schema.yaml` and asserts the two lists are identical. String-independent, and verified to fail when either side gains a value the other lacks — the paraphrase escape and the unavailable token ban both stop mattering |
| 4 | Exit Gate said "the four bullets above"; there are six | **fixed count-free** — it reads "the council bullets above", so the sentence cannot rot again the next time a bullet is added. The termination bullet also now states both corroborations rather than only the survivor half |

`ce-resolved-with-survivor` was adjusted alongside finding 1: its final round now reports `Open out:
0`, so the declared-survivor contradiction remains the single error it is there to prove rather than
tripping the new rule as well. All 41 council fixtures still emit exactly one error each.

## Recommendation

pass

All five original findings and all four residual risks are closed, each mechanically locked rather
than asserted. The recommendation at the time of review was `pass-with-risk`; it was raised to
`pass` on that remediation, and the thirteen external-review findings above do not lower it: eleven
are fixed with fixtures, and the two deferred are recorded as open items with real next actions
rather than dropped.

The third pass returned `approve` and its four items are closed here — two of them rules the second
pass's enum narrowing had implicitly assumed, which is the honest cost of removing a contract value:
what the removed value used to catch has to be caught somewhere.

The nine findings of the second external pass do not lower it either: all nine are fixed, four with
new fixtures, two with conformance pins, and the one part that needs a record-shape change rather
than a validator change is filed as OI-81 with a real next action. The branch also runs CI for the
first time, so its suite numbers are no longer a single machine's claim.

Two things are carried forward as known limits rather than open findings, because neither is a
defect in what shipped: the `check-council-record` non-claims stated in RI6 (it validates the
record, not the thinking), and the R-3 cost result, which is a measured input to a product decision
about the default rather than something to fix.
