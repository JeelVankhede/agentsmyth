---
slug: wp-r22-review-council
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-08-30
updated: 2026-08-30
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9, RI10, RI11, RI12, RI13, RI14, RI15, RI16, RI17, RI18, RI19, RI20, RI21, RI22, RI23, RI24, RI25]
upstream:
  - workflow/artifacts/briefs/wp-r22-review-council-v1.md
  - workflow/artifacts/plans/wp-r22-review-council-v1.md
  - workflow/artifacts/tasks/wp-r22-review-council-v1.md
  - workflow/artifacts/reviews/wp-r22-review-council-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# WP-R22 Review Council - Verification

## Inputs

- The four upstream artifacts above, including the Review council's 31 findings and their
  remediation.
- `workflow/config/verification.yaml` — declares `npm run validate` and `npm run violations:test`
  as required for `review` and `ship`, with `allow_discovered_commands: true`.
- CI run [33271243967](https://github.com/JeelVankhede/agentsmyth/actions/runs/33271243967) on
  PR #65 — the same suites on a fresh checkout, which is what makes the numbers below more than one
  machine's claim.

## Automated Checks

Every command run, with its real exit status. Nothing here is inferred from a previous run.

| Command | Outcome | Evidence |
|---|---|---|
| `npm run validate` | pass | exit 0 |
| `npm run violations:test` | pass | exit 0 — `92/92 violations detected`; `attribution sweep: 62/62 council fixtures emit exactly one error` |
| `npm run conformance:test` | pass | exit 0 — `44/44 conformance checks passed` |
| `npm run tuning-merge:test` | pass | exit 0 — `15/15 tuning-merge assertions passed` |
| `npm run setup-checks:test` | pass | exit 0 |
| `npm run setup-refs:test` | pass | exit 0 — `5/5 setup-refs checks passed` |
| `npm run root-resolution:test` | pass | exit 0 |
| `npm run init-prepare-interop:test` | pass | exit 0 — `33/33 init/prepare interoperability checks passed` |
| `npm run checkpoint-approval:test` | pass | exit 0 |
| `npm run setup-validator-definitions-root:test` | pass | exit 0 |
| `npm run commit-coverage:test` | pass | exit 0 |
| `npm run build` | pass | exit 0 — `build-bundle: ok` |
| `node scripts/render-adapters.mjs` | pass | exit 0 — `render-adapters: adapter shims are current` |
| `node src/workflow/validators/check-finding-quality.mjs` | pass | `56 proved real, 0 noise, 0 waived, 0 pending` across both ledger files |
| `node src/workflow/validators/check-release-readiness.mjs` | pass | No pending row blocks this chain's ship |
| CI, all of the above on a fresh checkout | pass | Run 33271243967, ubuntu-latest / Node 20 |

**A note on how these were run.** The first attempt used a shell function passing the command as an
unquoted parameter; zsh does not word-split those, so every command reported `exit=127` — command
not found. Recorded because a table of twelve failures produced by the harness rather than the code
is exactly the kind of result that gets explained away instead of investigated.

## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | command + fixture | `npm run violations:test` — fixture `dw`; the parent's consolidated findings still carry fixes, proven by the positive control | pass | Scoped to review records after review finding P2-13 |
| R2 | command + fixture | `npm run violations:test` — fixtures `dr` (transcript named), `ds` (input omitted) | pass | Closed enum enforced after P2-2; a free-text input is rejected |
| R3 | command + fixture | `npm run violations:test`; rule fired on this chain's own review and on the positive control, both fixed | pass | Enforced after P2-9 — it was unenforced when the council ran |
| R4 | command | `npm run violations:test` — the shared disposition fixtures reject on the Review path | pass | No forked enum; `council-contracts.md` byte-stable since `a099b28` |
| R5 | command + trial | `check-finding-quality` reports `56 proved real, 0 noise, 0 pending` across both files; fixtures `eb`, `ec` | pass | Full cycle completed: 56 rows written pending, closed, rotated |
| R6 | command + inspection | `npm run validate` exit 0; `git status` clean over `workflow/artifacts/reviews/` and `examples/` | pass | 30 existing review artifacts validate unedited |
| R7 | command + conformance | `npm run conformance:test` — `r22-review-single-agent-verbatim` now compares all ten steps | pass | Widened from three steps after P2-10 |
| RI1 | command + conformance | `r22-council-review-wellformed`, `r22-council-review-counted` | pass | Both record types checked; a review is counted as a review |
| RI2 | command + fixture | fixture `dw` | pass | Prose-smuggling limit stated as a non-claim in `validators/README.md` |
| RI3 | command + conformance | `r22-review-single-agent-verbatim`; probe: altering one word fails it | pass | Lock discriminates |
| RI4 | command | `npm run validate`; single-agent path records the mode in frontmatter | pass | Contradiction with the output schema removed by P2-11 |
| RI5 | inspection + conformance | `phase-caps.md` shipped-values table; `r22-fan-out-defaults-agree` | pass | Pin verified to fail on a config change |
| RI6 | command + fixture | fixtures `dx`, `dy`, `dz`, `ea`, `eg` | pass | Both rotation directions, closed-only archive, missing-file cases |
| RI7 | command + fixture + probe | fixture `ed`; conformance `r22-ship-gate-chain-scoped`; 4-way waiver probe | pass | Chain scoping and the waiver escape both fixed after P1-6/P1-7 |
| RI8 | command + conformance | `r22-finding-quality-spans-both-files` | pass | Tally spans both files; an active-only count fails the pin |
| RI9 | command | `npm run violations:test` — 92/92, attribution sweep 62/62 inside the harness | pass | Sweep moved from a terminal into the suite after P2-6 |
| RI10 | command + fixture | fixtures `dp`, `dq`, `ee`; conformance `r22-external-question-not-flagged` | pass | Anchored to an explicit bucket marker after P2-1 |
| RI11 | trial | `npm run build` then `node scripts/render-adapters.mjs` then `git status --porcelain` → 0 files; `render-adapters: adapter shims are current` | pass | **The requirement the Review council recorded as a skipped check.** Verifiable here because Test may write to the tree; the council could not without breaking its own fence |
| RI12 | command + conformance | `r22-review-council-sections`, `-fences`, `-no-verdict` | pass | Charter section order and all three fences pinned |
| RI13 | command | `npm run validate`; both modes documented against one output schema | pass |  |
| RI14 | command | `npm run validate` over the starter block | pass | Block now validates unedited after P1-3 — it did not when the council ran |
| RI15 | command + fixture | fixtures `ej`, `ek`, `el` | pass | All three conditionals reject; each isolated to one error |
| RI16 | command + fixture | fixtures `eh`, `ei`, plus absent-ledger conformance | pass | Absent ledger valid unless a council review exists |
| RI17 | command + fixture + probe | fixture `dt`; probe: deleting the subsection now rejects | pass | Omission escape closed and disjointness keyed per round after P1-5 |
| RI18 | command + fixture | fixtures `du`, `ef` | pass | Attribution predicate fixed after P1-4; exact-token matching |
| RI19 | command + fixture + probe | fixture `dv`; probe: mutated after-digest now rejects | pass | Comparison moved out of the sandbox branch after P1-1 |
| RI20 | command + conformance | `r22-fan-out-defaults-agree`; `r22-termination-enum`-style schema/validator agreement | pass | Phase-agnostic default removed from the validator after P3-4 |
| RI21 | command + probe | `check-definitions` under `AGENTSMYTH_WF`; probes for out-of-range, unknown key, unknown phase, removed required key | pass | Fails rather than passing when it validated nothing, after P2-7 |
| RI22 | command | `npm run tuning-merge:test` 15/15, reading the shipped config; `m12a` fails if `per_phase` is absent | pass | Now runs in CI after the workflow drift was closed |
| RI23 | trial | `HOME=/nonexistent AGENTSMYTH_WF=src/workflow node check-definitions.mjs` → same verdict | pass | Source validated, verdict independent of any global install |
| RI24 | command + conformance | `every-validator-wired` (comments stripped), `r22-every-suite-runs-in-ci` | pass | Extended to test suites and both workflows |
| RI25 | command + conformance | `schema-required-without-properties`, `schema-conditional-required` | pass | Asserted against the engine directly |

## Manual QA

not applicable — this package has no interactive surface. Its behaviour is exercised by validators,
fixtures and conformance checks, all of which are automated above.

## Generated Output Evidence

`dist/`, `validators/`, `src/assets/adapters/` and `workflow/schemas/` are gitignored build products
regenerated from `src/`. Verified by regenerating and observing no drift:

| Check | Command | Result |
|---|---|---|
| Bundle and CLI regenerate cleanly | `npm run build` | `build-bundle: ok`, exit 0 |
| Adapter shims match their source | `node scripts/render-adapters.mjs` | `adapter shims are current` |
| Regeneration is deterministic | `git status --porcelain` after both | 0 changed files |

This closes **RI11**, which the Review council recorded as a skipped check because verifying it
would have required writing to the working tree — something every council member was fenced from.
Test has no such fence, so the requirement the council could not reach is discharged here rather
than carried to Ship.

## Findings

none

No new defect was found at Test. That is a weaker statement than it looks: every check run here is
one the Build phases also ran, and the Review council found 30 defects that all of them passed. Test
confirms the remediation holds against the suite; it is not independent evidence that the
remediation is correct.

## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship | Manifest IDs |
|---|---|---|---|---|---|
| Second Review council over the remediation | The remediation of the council's 31 findings was written by the same agent the council exists to check, and no second council was run over it | A defect introduced while fixing would be caught only by the suites, which is exactly the coverage the first council proved insufficient | user | no | R1–R7, RI1–RI25 |
| Review-council cost baseline | No single-agent Review baseline was run against this diff, so the council's cost-per-finding is unmeasured for this phase | `council.enabled` defaults on for Complex work with the Review cost unquantified; WP-R21 measured ~6x for Think | user | no | RI5 |

## Architecture Notes

- role: Senior QA
- decision: Recommend `ship`. Every active requirement has pass evidence from a command, a fixture,
  a conformance check, or a recorded probe, and the numbers reproduce on a fresh checkout.
- observation: The most valuable evidence in this phase is not the green suites — the Build phases
  had those too, while 30 defects sat in the work. It is the CI run, which caught a harness that
  passed locally and died on a runner, and RI11, which Test could verify precisely because it is not
  under the council's read-only fence.
- constraint: Two skipped checks are recorded rather than closed, both about the limits of who
  checked whom. Neither blocks Ship; both are real.
- downstream: Ship inherits a clean ledger — 56 rows closed and rotated, nothing pending — so the
  closure gate this package added does not block its own release.

## Sign-Off

- Verifier: Claude (Senior QA role), with CI run 33271243967 as the independent reproduction
- Date: 2026-08-30
- Recommendation: ship
