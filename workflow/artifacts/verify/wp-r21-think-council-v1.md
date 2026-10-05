---
slug: wp-r21-think-council
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-08-18
updated: 2026-08-18
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9]
upstream:
  - workflow/artifacts/reviews/wp-r21-think-council-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# WP-R21 Think Council - Verify

## Inputs

- `workflow/artifacts/reviews/wp-r21-think-council-v1.md` — recommendation `pass`, zero open
  findings, zero partial coverage rows, all four residuals closed.
- `workflow/config/verification.yaml` — configured commands: `npm run validate`,
  `npm run violations:test`.
- Commit `1b11d7d` — the remediation commit, and the first in this chain that passed the mandatory
  pre-commit gate with no `--no-verify`.

## Automated Checks

Every command in this repo's `package.json` was run, not only the two configured in
`verification.yaml`. Three suites in my first sweep reported `npm error`; that was a wrong script
name on my part, not a failure — re-run under their real names, all three pass. Recorded because a
transcript showing `npm error` next to a `ship` recommendation should be explainable.

| Command | Outcome | Notes |
|---|---|---|
| `npm run validate` | exit 0 | Configured. Full validator sweep including `check-council-record` |
| `npm run violations:test` | **60/60** | Configured. Was 29/29 pre-R21; 31 council fixtures added |
| `npm run conformance:test` | 19/19 | Includes the council positive control and summary-output lock |
| `npm run build` | exit 0 | `dist/` and generated assets regenerated |
| `check-release-readiness.mjs` | ok | Accepts the amended review; no unwaived P0/P1 |
| `npm run setup-refs:test` | 5/5 | Setup token/field references still resolve after the schema additions |
| `npm run setup-checks:test` | 6/6 | `check-setup-complete` regexes unaffected by the new config keys |
| `npm run root-resolution:test` | 16/16 | Covers the `repoRoot` resolution P2-1 now depends on |
| `npm run tuning-merge:test` | 11/11 | Covers the global-then-repo-local merge `council:` reuses |
| `npm run checkpoint-approval:test` | 3/3 | Covers the OI-73 extractor |
| `npm run commit-coverage:test` | 7 passed, 0 failed | Guards the coverage check that rejected this chain's own commit twice until scope was declared |
| `npm run init-prepare-interop:test` | 33/33 | `init`/`prepare` interop unaffected by the new `council:` block |
| `npm run setup-validator-definitions-root:test` | 3/3 | `definitions_root` resolution intact — the pattern `sandbox_root` was modelled on |
| `validators/repo-digest.mjs` (×2) | stable `ebf9c8c56bba` | Determinism precondition for R-2 |

Not run, and stated rather than implied: there is no separate CI invocation to cite. This repo's
gate is the pre-commit hook plus these suites, and commit `1b11d7d` exercised the hook end to end.

## Manifest Coverage

| Manifest ID | Status | Evidence |
|---|---|---|
| R1 | verified | Council fires on Complex only; mode re-derived from `council.resolution` (`db`) |
| R2 | verified | Both capability axes (`cr`), per-stage caps (`cm`), council default recorded via `cap_source` |
| R3 | verified | Attribution (`ca`), declared-member existence (`cx`), web spot-check duty (`ci`) |
| R4 | verified | Disposition enum and non-empty reason (`cb`) |
| R5 | verified | Missing recommendation (`cu`), unresolvable refs (`cv`), recall-only (`cj`), vacuous-section guard (`da`) |
| R6 | verified | Every pre-existing brief validates with zero edits; `council:` optional at schema top level |
| R7 | verified | Kill-switch precedence re-derived, including refusal-reason ordering (`db`, `dc`) |
| R8 | verified | Preserved single-agent path byte-locked (`r21-single-agent-verbatim`) |
| R9 | verified | Classification presence and non-empty class list (`cp`, `cq`) |
| R10 | verified | Per-class citation contracts (`cf`, `cg`, `cj`) |
| R11 | verified | Sandbox declaration (`cw`), disjointness (`ct`), inside-repo (`cs`), outside-root (`cy`), repo integrity (`dd`, `de`) |
| R12 | verified | Per-class availability; refusal reason (`cl`) |
| R13 | verified | Fan-out growth (`cc`), incoherent taper (`cd`), survivor escalation (`ce`), mandatory survivor line (`cz`) |
| R14 | verified | Round, finding, conflict and termination structure required; `cn`, `co` |
| R15 | verified | Eight-stage list locked (`r21-think-stages`) |
| RI1 | verified | Blanket form gone by grep; conflict recording (`ch`, `co`) |
| RI2 | verified | Carve-out stated as bounding principle in both files; no-nesting restated in the council skill |
| RI3 | verified | Registered in the explicit validator list; summary output locked (`r21-council-summary`) |
| RI4 | verified | Frontmatter-only distinguishability; depth-1 (`ck`) |
| RI5 | verified | `npm run build` clean; `render-adapters` reports shims current |
| RI6 | verified | Six non-claims present in the validator README as plain limitations |
| RI7 | verified | `cap_source` schema-constrained; phase-caps departure documented and scoped to Think |
| RI8 | verified | Depth dial resolves global-then-repo-local; schema-constrained |
| RI9 | verified | 31 council fixtures; attribution sweep confirms exactly one error each |

## Manual QA

Three checks that no suite performs, run by hand because each asserts something a fixture cannot.

**R-2, the check the whole residual existed for.** Mutating `dist/workflow-bundle.md` — gitignored,
and the file consumers actually install — leaves `git status --porcelain dist/` **empty** while the
digest moves `7c7aaf95bb62 → f08677cc6ca1`; `npm run build` restores it exactly. This is the
proposition that a git-scoped integrity check passes green precisely where the damage is invisible,
demonstrated rather than argued.

**P2-1, discriminating probe.** An absolute in-repo sandbox path is rejected identically when the
validator runs from the repo root and from `src/`. Under the previous `process.cwd()` the
subdirectory run would have passed it as "outside the repo". My first attempt at this probe did not
discriminate — the fixture path was outside the repo either way — so it was rebuilt with a
mutation-applied assertion.

**OI-73, three quote shapes.** A four-line approval containing a blank line is preserved whole; a
single-line quote still works; `"<exact quote>"` is still rejected as a placeholder.

## Generated Output Evidence

`npm run build` regenerates `dist/workflow-bundle.md`, `dist/setup-bundle.md`, `bin/prompts.mjs`,
root `validators/`, and `workflow/schemas/`. All are gitignored, so they carry no tracked diff —
which is exactly why R-2's digest covers them. Build determinism was verified directly: two
consecutive builds produce an identical whole-tree digest, so the R-2 before/after bracket cannot
false-positive on a rebuild.

`render-adapters` reports adapter shims current; no gate content changed, so no adapter re-sync was
required.

## Findings

none

## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship | Manifest IDs |
|---|---|---|---|---|---|
| Real council run on a second Complex requirement | One live council run was performed against WP-R22 and is recorded in that brief's Council Log. A second run would cost materially more and test the same paths | low — the one run exercised dispatch, challenge, disposition, conflict recording and the record contract end to end, and its output was rejected by `check-council-record` until the record was correct | workflow owner | no | R3, R13, R14 |
| Consumer-side upgrade rehearsal (1.0.0 → 1.1.0) | Pre-existing OI-69, owned at release level rather than by this package | medium — R6 is verified against this repo's own artifacts, not a published 1.0.0 tarball | user | no | R6 |

## Architecture Notes

- role: Verifier
- decision: Run every suite in `package.json`, not only the two named in `verification.yaml`. R21
  touches the checkpoint extractor, the repo-root resolver and the tuning merge — all covered by
  suites the config does not list, and verifying only the configured pair would have left those
  changes unexercised.
- observation: The strongest evidence in this chain is not a passing suite. It is that
  `check-council-record` **rejected its own author's first real council record** three times, and
  that the live run found four defects three prior review passes had missed. A suite proves the
  rules fire; those two facts are the only evidence the rules are worth having.
- observation: The measured cost result (R-3) is unfavourable and is not re-litigated here. It is a
  verified input to a product decision, not a defect for Test to resolve.
- downstream: Ship must carry two items onto the 1.2.0 checklist — A5's removal of the preserved
  single-agent path, and OI-67's `warn-until-1.2.0` markers.

## Sign-Off

- Verifier: agent (Claude Opus 5), session `01Mqmcbz3sTdV96rQFXSmSUH`
- Date: 2026-08-18
- Recommendation: ship
- Basis: all 24 manifest IDs verified with named evidence; zero findings; 14 command results all
  green; two skipped checks recorded with owners, neither blocking. The review upstream is `pass`
  with zero open findings, and `check-release-readiness` accepts it.
