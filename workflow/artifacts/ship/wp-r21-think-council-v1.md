---
slug: wp-r21-think-council
version: 1
artifact: ship
status: blocked-for-user
created: 2026-08-18
updated: 2026-08-18
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9]
upstream:
  - workflow/artifacts/verify/wp-r21-think-council-v1.md
orchestration:
  phase: ship
  status: blocked-for-user
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# WP-R21 Think Council - Ship

## Inputs

- `workflow/artifacts/verify/wp-r21-think-council-v1.md` — recommendation `ship`, 24/24 verified,
  zero findings, two non-blocking skipped checks.
- `workflow/artifacts/reviews/wp-r21-think-council-v1.md` — recommendation `pass`, zero open
  findings after remediation.
- `workflow/config/release.yaml` — branch, verification and rollback gates.
- Branch `feat/wp-r21-think-council` at `9fde5fe`, 13 commits, unpushed.

## Ship Status

`hold-for-user` — the work is ready; two decisions are the user's and one of them changes the PR
target.

Nothing technical is outstanding. Every gate passes, the review is `pass`, Test says `ship`. What
blocks is that the base moved under this branch while the chain was running, and that the council's
measured cost makes its default a product call rather than an engineering one.

## Requirement Coverage

All 24 manifest IDs verified in Test with named per-ID evidence — see
`workflow/artifacts/verify/wp-r21-think-council-v1.md` → Manifest Coverage for the fixture or probe
backing each. No ID is dropped, deferred, or waived, so no `## Waivers` entry is required.

| Manifest ID | Status | Shipped as |
|---|---|---|
| R1 | verified | Complex-only trigger; mode re-derived from recorded resolution inputs |
| R2 | verified | Both capability axes, per-stage caps, council default with cap_source |
| R3 | verified | Challenge pass over raw findings; attribution and web spot-check duty |
| R4 | verified | Disposition contract with non-empty reason on rejection |
| R5 | verified | Surviving Q carries a recommendation on resolvable, non-recall evidence |
| R6 | verified | Additive only — every pre-1.1.0 artifact validates unedited |
| R7 | verified | Kill-switch precedence, re-derived including refusal-reason ordering |
| R8 | verified | Pre-R21 single-agent path preserved verbatim and byte-locked |
| R9 | verified | Requirement classification with per-bucket evidence classes |
| R10 | verified | Four evidence classes with per-class citation enforcement |
| R11 | verified | Sandbox confinement to configured root; filesystem-scoped repo integrity |
| R12 | verified | Runtime evidence-class availability recorded as used / unused / unavailable |
| R13 | verified | Tapering round loop, taper coherence, survivor escalation |
| R14 | verified | Full council run logged into the artifact |
| R15 | verified | lifecycle-think restructured into eight named stages |
| RI1 | verified | Independence narrowing with conflict recording as its teeth |
| RI2 | verified | Carve-out as bounding principle; no-nesting restated in the council skill |
| RI3 | verified | check-council-record.mjs registered, with summary output |
| RI4 | verified | Run-mode record, cap_source, dispatch depth 1 |
| RI5 | verified | Schema updated, bundles rebuilt, adapters in sync |
| RI6 | verified | Six non-claims stated plainly in the validator README |
| RI7 | verified | Council default fan-out visible via cap_source; departure scoped to Think |
| RI8 | verified | Research-depth dial, resolved global-then-repo-local |
| RI9 | verified | 31 rejection fixtures, one attributable error each |

## PR / CI Readiness

**The base advanced during this chain — this is a decision point, not a formality.**

Step 4a fetch, run 2026-08-18:

| Ref | Relationship to `HEAD` |
|---|---|
| `origin/feat/wp-r8-behavior-tuning` | base ahead 0, branch ahead 13 |
| `origin/release/1.1.0` | **release ahead 3**, branch ahead 13 |

PRs **#62 (WP-R8)** and **#63 (WP-R19)** both merged into `release/1.1.0` on 2026-08-16 — after this
branch was cut. `release/1.1.0` therefore carries three commits this branch does not: the two merge
commits and `dbc2af6`, WP-R19's plan starter-block fix.

Two consequences:

1. **The PR target changed.** This branch was cut from `feat/wp-r8-behavior-tuning` and the plan's
   Branch Strategy says it targets that branch, retargeting to `release/1.1.0` once #62 merged. #62
   has merged, so the PR now targets `release/1.1.0` directly. The stacking is resolved, not
   pending.
2. **`dbc2af6` is not in this branch.** That is WP-R19's fix adding `## Assumptions Verified` to the
   plan starter block. This chain's own plan already carries that section — I wrote it from
   knowledge rather than by copying the starter block, precisely because the fix was absent from
   this ancestry. So nothing here is broken by its absence; the branch is simply behind.

**Merge is clean.** `git merge-tree --write-tree HEAD origin/release/1.1.0` exits 0 — no conflicts,
despite both sides touching `test/run-conformance-tests.mjs` and `workflow/artifacts/open-items.yaml`.

Recommendation: **merge `origin/release/1.1.0` into the branch before opening the PR**, so the PR
diff shows only R21's work rather than R21 plus a stale-base delta. Surfaced here rather than done
silently, per Ship step 4a.

CI: this repo has no separate CI invocation to cite. The gate is the pre-commit hook plus the suites
recorded in Test. Commits `1b11d7d` and `9fde5fe` both passed the full mandatory gate with **no
`--no-verify`**, which is OI-74's fix demonstrating itself twice.

## Release Readiness

`check-release-readiness.mjs` → `ok`.

| Gate | State | Evidence |
|---|---|---|
| Branch policy | met | Non-default branch `feat/wp-r21-think-council`; no commits to `main` or `release/1.1.0` |
| Verification | met | `workflow/artifacts/verify/wp-r21-think-council-v1.md`, recommendation `ship` |
| Review | met | Recommendation `pass`, 0 open P0/P1 — accepted by `check-release-readiness` |
| Generated output | met | `npm run build` clean; `render-adapters` reports shims current |
| Version bump | not required by this package | 1.1.0 is additive; every new field is optional with a safe default and every pre-1.1.0 artifact validates unedited |

**1.2.0 checklist items this package creates** — both must be carried forward, and neither is
self-enforcing:

- **A5** — remove the preserved single-agent Think path (`lifecycle-think/references/single-agent-path.md`).
  User-approved 2026-08-16 for removal in 1.2.0. A preserved path nobody removes becomes permanent
  dead weight.
- **OI-67** — remove `x_enforcement: warn-until-1.2.0` markers. Pre-existing, same release.

## Source-of-Truth Status

Updated. All edits landed in `src/`; `dist/`, root `validators/` and `workflow/schemas/` are
regenerated build products and remain gitignored. The Notion WP-R21 page is upstream context and is
updated at ship time, not treated as a live source — it still shows `🔵 In Progress` and needs
moving to `✅ Done` with the PR reference once the PR exists.

## Risk And Rollback

| Item | Detail |
|---|---|
| **Rollback trigger** | The staged Think pipeline produces an invalid or unusable brief, or `check-council-record` blocks legitimate work in a consumer repo |
| **Rollback action** | Set `council.enabled: disabled` (or `tuning.dispatch.enabled: disabled`, which outranks it) and follow `lifecycle-think/references/single-agent-path.md` — the pre-R21 workflow preserved verbatim and byte-locked by conformance `r21-single-agent-verbatim` |
| **Owner** | workflow owner |
| **Evidence required** | The failing brief plus the `check-council-record` output that blocked it |
| **Why this is a real rollback** | The preserved path is a verbatim copy, not a mode of the new pipeline. A mode of a broken pipeline is not a rollback, which is why R8 was built this way and why a byte-comparison guards it |

**Carried risk, stated not resolved — the cost result.** Test verified R-3 as *measured*, and the
measurement is unfavourable: a single-agent baseline produced 22 findings from 1 invocation; the
council produced 8 from 4 intended invocations (6 attempted, two lost to API 529s) covering 2 of 3
buckets. Not a controlled A/B — the council ran before several fixes and the baseline after — but on
invocation count the council cost roughly 6× for less coverage.

`council.enabled` currently defaults to `on-for-complex`. That default means every consumer
upgrading to 1.1.0 gets multi-agent Think on Complex work without configuring anything. **This is a
product decision the engineering work does not settle**, and it is the second thing blocking ship.
The council's distinctive contribution was the challenge pass refuting a wrong finding — real value,
but not value the invocation count reflects.

**Residual, unchanged from Review:** `check-council-record` validates the record, not the thinking
(RI6's six non-claims). No amount of remediation changes that, and the docs say so plainly.

## Blocked Handoff

Two decisions, both the user's:

1. **Merge `origin/release/1.1.0` into the branch before the PR?** Recommended — the merge is clean
   and it keeps the PR diff to R21's own work.
2. **Should `council.enabled` default to `on-for-complex` in 1.1.0**, given the measured cost? The
   alternatives are defaulting off for upgrades and on for fresh inits, or defaulting off entirely
   and letting consumers opt in. Either is a one-line schema default change plus a doc note.

Once both are answered: merge, push, open the PR against `release/1.1.0`, update the Notion WP to
Done, then Reflect.

## Architecture Notes

- role: Release Engineer
- decision: Recommend `hold-for-user` rather than `ship`. Nothing technical is outstanding, and
  saying `ship` would be defensible on the gates alone — but the base moved under this branch and
  the cost measurement bears on a shipped default. Both are decisions this phase should surface, not
  absorb into a recommendation.
- decision: Do not merge `release/1.1.0` unilaterally despite the merge being clean. Ship step 4a is
  explicit that meaningful divergence is a decision point.
- observation: Step 6a's resolved-vs-open distinction is why this artifact records **no waivers**.
  Every Build and Review discovery — the five review findings, four residuals, four council findings,
  two validator parsing defects, OI-73 and OI-74 — is a completed, independently-verified fix, not
  open risk. Presenting any of them to the user as pending risk-acceptance would be false.
- downstream: Reflect should capture two things this chain demonstrated at its own expense — that a
  green suite proves only what was written, not what was required (the A4 audit), and that a
  validator's correctness is not establishable by its author reading it (both P1s came from probing,
  after two clean reads).

## Checkpoint Approval

- Checkpoint: ship-review
- Status: pending — this ship decision has not yet been presented to the user.

## Exit Gate

- [x] Verification artifact exists and recommends ship.
- [x] Review recommendation is pass with zero open P0/P1.
- [x] Release readiness gates pass.
- [x] Rollback trigger, action, owner, and evidence recorded.
- [x] Base divergence surfaced rather than absorbed.
- [ ] User approved the ship decision.

## Next Phase

Reflect — blocked until the two decisions above are answered and the Checkpoint Approval is recorded
from the user's own words.
