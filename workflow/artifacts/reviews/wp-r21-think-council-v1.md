---
slug: wp-r21-think-council
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-08-17
updated: 2026-08-17
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

| Severity | Count | IDs |
|---|---|---|
| P0 | 0 | — |
| P1 | 2 | P1-1, P1-2 |
| P2 | 1 | P2-1 |
| P3 | 2 | P3-1, P3-2 |

## Requirement Coverage

| Manifest ID | Status | Notes |
|---|---|---|
| R1 | partial | Complex-only trigger is documented in the pipeline's mode resolution; no artifact records the task class, so no check can re-derive it. Residual R-1. |
| R2 | covered | Both axes enforced; carve-out outward capability rejected by fixture `cr` |
| R3 | covered | Attribution, declared-member existence, and the web spot-check duty all enforced (`ca`, `cx`, `ci`) |
| R4 | covered | Disposition enum and non-empty reason enforced (`cb`) |
| R5 | covered | Missing recommendation, unresolvable refs, and recall-only all enforced (`cu`, `cv`, `cj`) |
| R6 | covered | Every existing brief validates with zero edits; `council:` optional at schema top level |
| R7 | partial | Kill-switch precedence is documented and schema-backed; the resolution itself is agent behaviour with no recorded input. Residual R-1. |
| R8 | covered | Preserved path byte-locked by conformance `r21-single-agent-verbatim` |
| R9 | covered | Classification presence and non-empty class list enforced (`cp`, `cq`) |
| R10 | covered | Per-class citation contracts enforced (`cf`, `cg`, `cj`); P3-2 is a message defect, not a coverage gap |
| R11 | partial | Sandbox declaration and disjointness enforced (`cs`, `ct`, `cw`), but the `sandbox_root` fence is not — P1-1. Repo-integrity hashing over gitignored outputs is not implemented at all. Residual R-2. |
| R12 | covered | Per-class availability enforced; refusal reason enforced (`cl`) |
| R13 | partial | Non-increasing fan-out, taper coherence, and `max_rounds` enforced (`cc`, `cd`); survivor escalation evadable — P1-2 |
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

Four `partial` rows appear as findings (P1-1, P1-2) or residual risk (R-1, R-2) as the schema
requires.

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

- **R-1 — resolution behaviour is unverifiable from the record (R1, R7).** Kill-switch precedence and
  the Complex-only trigger are performed by the agent. No artifact records the inputs — resolved
  `dispatch.enabled`, resolved `council.enabled`, task class — so no validator can re-derive whether
  the decision was correct; it can only confirm what was written down. Closing this means recording
  resolution inputs in the `council:` block. Deliberately not done unilaterally after three plan
  amendments; it is a schema addition and belongs to a decision, not a fix.
- **R-2 — repo-integrity hashing is unimplemented (R11).** The brief calls for a filesystem-scoped
  content assertion over the repo root *including gitignored build outputs*, because `git status`
  reports clean for `dist/`. Nothing implements it. The sandbox declaration checks bound where writes
  are *declared* to go; nothing detects a write that actually landed in `dist/`. This was the
  concrete defect RK-I was re-scoped around, and it is still open.
- **R-3 — cost is still unmeasured (RK-C).** No council has run. The plan committed to measuring the
  multiplier during Build against the single-agent baseline; that has not happened, and the taper's
  economics remain an argument rather than a number.
- **R-4 — two `--no-verify` commits (OI-74).** Both documented in their commit messages with reasons.
  The gate still makes incremental Build commits impossible, and every future multi-phase chain will
  hit it.

## Recommendation

pass-with-risk

The five findings are real but none blocks Test. The two P1s are missed-rejection defects in a
validator, not defects in shipped behaviour, and their fixes are additive. R-2 and R-3 are the ones
worth deciding on before Ship rather than before Test: R-2 is an unimplemented requirement rather
than a weak check, and R-3 means a headline cost claim is still unmeasured.
