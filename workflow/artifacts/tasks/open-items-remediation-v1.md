---
slug: open-items-remediation
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-08-31
updated: 2026-09-08
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - R7
  - R8
upstream:
  - workflow/artifacts/briefs/open-items-remediation-v1.md
  - workflow/artifacts/plans/open-items-remediation-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# Open-Items Remediation (pre-1.1.0) — Task

## Active Phase

- Phase: Phase 8 — Review remediation — in progress.
  Written as a phase number because `check-scope-fence` extracts it from this line to bound the
  scope union, and a line it cannot parse fails the gate.
- Manifest IDs: R8 (Build total: R1–R8)
- Exit gate: F1–F5 of `workflow/artifacts/reviews/open-items-remediation-v1.md` each fixed with
  evidence or recorded as accepted; whole suite green at head.

## Plan Phases Overview

| Phase | Manifest IDs | Status |
|---|---|---|
| 1 — Pre-commit gate defects | R1 | complete |
| 2 — Versioned-artifact selection | R2 | complete |
| 3 — Lifecycle skill process gaps | R3 | complete |
| 4 — Release-readiness evidence | R4 | complete |
| 5 — resolveGitCwd coverage | R5 | complete |
| 6 — Grandfathered artifact violations | R6 | complete (recorded retroactively) |
| 7 — Undefended validator rules | R7 | complete (recorded retroactively) |
| 8 — Review remediation | R8 | in progress |

## Branch / Repo Status

Branch `chore/open-items-triage-1.1.0`, cut from `release/1.1.0` at `7c224dc`. Not pushed; no PR
opened.

## Scope

The open items triaged as having a known fix and an achievable verification: OI-79, OI-86 (R1),
OI-66 (R2), OI-45, OI-55, OI-56 (R3), OI-67, OI-69 (R4), OI-20 (R5). Also closes OI-84, OI-16 and
OI-43 as stale or superseded, which required record changes only.

Extended 2026-09-08 after Review. R6 covers OI-65/OI-5 (the 96 grandfathered artifact violations)
and R7 covers OI-82 (the undefended-rule sweep); both landed on this branch after Phase 5 closed
and are recorded here retroactively, per the brief's Scope Change note. R8 covers the five findings
this chain's own Review raised against that gap and against the R1 work.

## Changed Files

- `.githooks/pre-commit` — coverage check runs as an `if` condition so the artifact loop is
  reachable under `set -e`; repo-local `bin/agentsmyth.mjs` preferred — IDs: R1
- `src/assets/hooks/pre-commit` — same two changes, kept in sync with the dev copy — IDs: R1
- `src/workflow/validators/check-assumptions.mjs` — select the highest brief version numerically
  rather than `briefCandidates[0]` — IDs: R2
- `test/run-violation-tests.mjs` — register fixture `fw` — IDs: R2
- `test/fixtures/lifecycle-violations/fw-brief-revision-assumption-uncovered/briefs/probe-v1.md` —
  superseded brief declaring A1 only — IDs: R2
- `test/fixtures/lifecycle-violations/fw-brief-revision-assumption-uncovered/briefs/probe-v2.md` —
  current brief declaring A1 and A2 — IDs: R2
- `test/fixtures/lifecycle-violations/fw-brief-revision-assumption-uncovered/plans/probe-v1.md` —
  plan covering only what v1 declared — IDs: R2
- `test/mutation-baseline.json` — `check-assumptions` undefended lowered 3 → 2 — IDs: R2
- `src/workflow/skills/lifecycle-ship/SKILL.md` — step 4a made unconditional; new step 4b for
  identifier reconciliation — IDs: R3
- `src/workflow/skills/lifecycle-build/SKILL.md` — new step 8a, validate after writing an
  artifact — IDs: R3
- `src/workflow/skills/lifecycle-review/SKILL.md` — Workflow preamble paragraph, both modes — IDs: R3
- `docs/release-checklist.md` — new; do-not-pre-bump rule, pre-dispatch list, deprecation-window
  removal step — IDs: R4
- `test/run-root-resolution-drift-tests.mjs` — scenario 5, `resolveGitCwd()` end to end — IDs: R5
- `workflow/artifacts/open-items.yaml` — close resolved items with evidence; re-evidence the rest; record the gate-bypass reproduction on OI-83 — IDs: R1, R2, R3, R4, R5, R8

### Phase 6 — grandfathered artifact violations (R6)

- `workflow/artifacts/` — 40+ closed chains' artifacts normalised to the frontmatter schema's own
  enums: `status`/`orchestration.status` values, `upstream` object-to-path-string, `user_checkpoint`
  booleans, two `next_phase` values, and manifest IDs restated in the `**R1**` form the validator
  scans for — IDs: R6
- `workflow/config/artifact-baseline.yaml` — 96 entries emptied, with the breakdown recorded in the
  file's own note — IDs: R6

### Phase 7 — undefended validator rules (R7)

- `test/fixtures/` — ~130 new rejection fixtures, one per previously undefended rule — IDs: R7
- `test/run-violation-tests.mjs` — register every new fixture — IDs: R7
- `test/run-mutation-audit.mjs` — measurement fix: the `SUITES` list named three of eleven suites,
  so rules that were tested scored as gaps — IDs: R7
- `test/mutation-baseline.json` — the ratchet, now 0 undefended over 221 rules in 30 validators — IDs: R7
- `test/run-checkpoint-approval-tests.mjs` — cases for previously unreachable rules — IDs: R7
- `test/run-setup-complete-tests.mjs` — cases for previously unreachable rules — IDs: R7
- `test/run-domain-placeholders-tests.mjs` — new suite; the validator scans `git ls-files`, so a
  fixture inside this repo would have to contain the leakage it tests for — IDs: R7
- `src/workflow/validators/check-pending-setup.mjs` — `--dir` flag, making all 8 rules reachable — IDs: R7
- `src/workflow/validators/check-domain-placeholders.mjs` — exclude `test/fixtures/` from the scan — IDs: R7
- `src/workflow/validators/lib.mjs` — schema-engine rules defended; the unused `assertCondition`
  export removed — IDs: R7
- `package.json` — wire `domain-placeholders:test` — IDs: R7
- `.github/workflows/ci.yml` — run the new suite on every push — IDs: R7
- `.github/workflows/release.yml` — run the new suite before publish — IDs: R7

### Phase 8 — review remediation (R8)

- `src/workflow/validators/check-council-record.mjs` — a non-Complex chain expects `single-agent`,
  not `refused`; `refused` is reserved for the two kill-switch cases (F5) — IDs: R8
- `test/run-violation-tests.mjs` — register fixture `jd`, pinning the mode contract (F5) — IDs: R8
- `test/fixtures/lifecycle-violations/jd-mode-not-complex-refused/reviews/probe-v1.md` — a
  non-Complex record declaring `refused` (F5) — IDs: R8
- `bin/agentsmyth.mjs` — `resolveValidator()` prefers the repository's own
  `src/workflow/validators/` when the repo being checked IS the package (F3) — IDs: R8
- `test/run-conformance-tests.mjs` — pin the source-repo validator precedence in both directions (F3) — IDs: R8
- `CHANGELOG.md` — 1.1.0 entry, including the removed `lib.mjs` export (F4) — IDs: R8
- `workflow/artifacts/open-items.yaml` — file OI-88 (`--dir` operand sweep) and OI-89 (prose-only
  skill rules, to be assessed with OI-50), so two residual risks leave the review with an owner — IDs: R8

## Implementation Log

### Phase 1 — Pre-commit gate defects (R1)

Both defects were confirmed by reading the file before changing it. `.githooks/pre-commit` sets
`-e` at line 9 and ran `$AGENTSMYTH_BIN check --staged` as a bare command with `status=$?` on the
next line: under `set -e` a non-zero exit terminated the script there, so the per-artifact
phase-gate loop below never ran. The gate still blocked, so nothing was let through — but it
reported one class of problem while silently skipping another.

The shipped copy has no `set -e` of its own, but is appended to a host script that may well set it,
so both copies got the same `if !` form.

For the binary: `command -v agentsmyth` resolved to a globally installed 1.0.0 shipping three
validators, used to gate a repo whose own `bin/` ships thirty. Both copies now try
`./bin/agentsmyth.mjs` first — git runs hooks from the repo root — and fall through unchanged when
there is none, which is every consumer repo.

### Phase 2 — Versioned-artifact selection (R2)

Found by doing OI-66's audit rather than assuming it. Swept every `[0]` selection across the
validator set; all are over non-versioned collections (table cells, staged-file lists, regex match
groups) except `check-assumptions.mjs`, which filtered `slug-v[0-9]+\.md` and then took `[0]`.

Impact: a brief revised to `-v2` with a new assumption had its plan judged against `-v1`, so a plan
missing the new assumption passed. Fixed by reducing to the highest version, compared numerically
because `-v10` sorts before `-v2` as a string.

Two things caught during this phase. First, the fixture had to be built twice: the first attempt
used `## Assumptions` and unbolded IDs, and the validator reads `## Assumptions (A)` with `**A1**`
bold markers, so it silently matched nothing and reported `ok` — a green that meant "found no
briefs", not "the fix works". Second, `shipped-neutrality` rejected the first draft of the fix
comment because it cited `OI-66` and `WP-R8`, which are internal tracker IDs and may not appear in
shipped `src/`. Both were caught by suites, not by inspection.

### Phase 3 — Lifecycle skill process gaps (R3)

`references/single-agent-path.md` was deliberately not touched: conformance check
`r22-review-single-agent-verbatim` byte-compares its ten steps, so the Review guidance went into the
Workflow preamble where it applies to both modes.

### Phase 4 — Release-readiness evidence (R4)

The rehearsal ran against `npm pack @jeelvankhede/agentsmyth@1.0.0` — the genuine published
artifact — in a scratch `HOME`, so the real `~/.agentsmyth` was never read or written.

While building it, `package.json` was briefly edited to `1.1.0` so the candidate tarball would carry
a version that triggers skew detection. Reading `release.yml` to write the checklist showed that the
workflow runs `npm version <bump>` **itself**: a repo left at `1.1.0` and dispatched with
`bump: minor` would publish **1.2.0**. The edit was reverted; `package.json` stays at `1.0.1`, and
the hazard is now the first entry in the checklist.

### Phase 5 — resolveGitCwd coverage (R5)

The new scenario found a real trap on its first run, though not a code defect:
`sibling_repos[].path` is relative to `workspace_root` per the schema's own field description, and a
fixture written with absolute paths produced `<workspace_root><absolute path>` silently. The
resolver is correct for conforming input. The hazard — a non-conforming absolute path is neither
used nor rejected, just quietly corrupted — is recorded on OI-20 rather than changed, since the
schema documents the contract and altering `join()` semantics is outside this chain.

### Phase 6 — Grandfathered artifact violations (R6)

Recorded after the fact; the work is `87e8a1b`. Nothing was re-baselined — the baseline file is
empty and `check-artifacts` runs against the real corpus with nothing to lean on. The breakdown is
kept in the file's own note because the count alone misleads: 35 of the 96 were manifest IDs that
were declared all along, in brief bodies writing `- R1 (T-D1):` rather than the `**R1**` form the
validator scans for. No requirement was ever missing.

### Phase 7 — Undefended validator rules (R7)

Recorded after the fact; the work is `443a6c3..b8fe90a`. It reverses a Non-Goal this chain's brief
had stated, which the brief's Scope Change note now says plainly.

Three things from that work are worth keeping. A fifth of the original 106 was measurement error —
the audit's `SUITES` list named three of eleven suites, so rules that were tested scored as gaps.
A rule can be defended by accident: repairing the grandfathered violations (Phase 6) removed the
only thing exercising `check-artifacts`' next_phase rule, and the undefended count went up. And two
fixtures passed while leaving their rule undefended, both by asserting something broader than the
rule — hence the convention that a fixture asserts the rule's own wording.

### Phase 8 — Review remediation (R8)

**F1** — the chain record. Repaired by writing R6, R7 and R8 into the brief, Phases 6–8 into the
plan, and their Changed Files here. The alternative — splitting the thirteen commits onto their own
chain — was weighed and rejected in the brief's Scope Change note.

**F2** — the uncovered file. `test/run-domain-placeholders-tests.mjs` is now declared under Phase 7.
The bypass itself is recorded on OI-83, with the reproduction: the coverage rule was recomputed
against the task artifacts as they existed at each of the two commits, and it rejects both. What is
NOT claimed is a cause — `--no-verify` leaves no trace, so the item stays open with a narrowed next
action (a range mode, so CI can re-run the rule on the PR head where a local bypass has no effect).

**F3** — validator resolution. `resolveValidator()` now puts the repository's own
`src/workflow/validators/` first when the repo being checked IS the package. Verified by marker
experiment before changing anything: a marker inserted at import time in
`src/workflow/validators/check-lifecycle.mjs` did NOT appear when the repo's own CLI ran the phase
gate, proving the installed copy was executing. It appears after the change. The marker had to go at
the top of the file, not the bottom — the first attempt appended it after the validator's own
`process.exit()`, where it could never run, and would have "confirmed" the defect either way.

Both directions are pinned by conformance checks built on two throwaway repos whose
identically-named validators say different things: `r8-source-precedence` (the package's own copy
wins) and `r8-consumer-precedence` (a consumer still resolves from `definitions_root`). The second
is the one that matters — the risk of this change is not that it fails, it is that it leaks.

**F4** — the removed export. `CHANGELOG.md` now carries the 1.1.0 entry, with `assertCondition`
under Removed. The date is written as today's; if the dispatch slips, it needs correcting before the
run, per `docs/release-checklist.md`.

**F6** — found, not fixed-in-advance. Re-running R4's rehearsal against the real 1.0.0 tarball
(closing a residual risk from this chain's Review) surfaced a defect the first run had not: the
version-skew warning tells the reader to run `prepare`, admits prepare does not update
`repo-profile.yaml`, and never says what does. Verified by observation, not inference — after
`prepare` the stamp is still `1.0.0` and the same warning prints on every subsequent `check`;
`init` is what updates it, and it re-scaffolds `.agentsmyth/` in the process. The message now names
all of that. `prepare` stays global-only; that invariant is not what was wrong.

**F5** — the mode contract. `check-council-record` now expects `single-agent` for a chain that is
not Complex, and reserves `refused` for the two kill-switch cases, which is what both
`lifecycle-review/SKILL.md`'s mode resolution and the frontmatter schema's own description of
`refused` already said. `not-complex` stays in the `refusal_reason` enum so records written under
the old reading still parse. Fixture `jd` pins it by asserting the rule's own wording
(`require "single-agent"`), not merely that an error occurred — the mismatch message is shared with
the two kill-switch branches, so a broader assertion would have passed while leaving the new
behaviour undefended.

## Verification Items

| Item | Method | Outcome |
|---|---|---|
| Hook syntax, both copies | `sh -n` | pass |
| `set -e` reachability | run the `if !` form under `set -e` | reached, status=1 |
| Binary resolution | evaluate the branch in this repo | `node ./bin/agentsmyth.mjs` |
| Fixture `fw` discriminates | run against pre-fix and post-fix code | passes pre-fix, rejects post-fix |
| Mutation ratchet | `mutation:audit --only check-assumptions.mjs` | 2/4, ok at lowered baseline |
| Upgrade rehearsal | real 1.0.0 tarball, isolated HOME | skew detected, 7 → 11 items, configs parse, `check` exit 0 after setup |
| `resolveGitCwd` | new scenario, real sibling checkouts | 5 checks pass |
| Baseline emptied, not re-accepted | `check-artifacts` with `entries: []` | 0 live violations |
| Undefended rules | `test/mutation-baseline.json` | 0 across 221 rules in 30 validators (read, not re-measured — see the review's Residual Risk) |
| New suite is reachable | grep the suite name in `package.json`, `ci.yml`, `release.yml`, audit `SUITES` | present in all four |
| Source-repo validator precedence | marker experiment, before and after | 0 marker hits before, 1 after; source restored |
| Consumer resolution unchanged | conformance `r8-consumer-precedence` | linked copy runs, source copy does not |
| Mode contract | fixture `jd` against `check-council-record` | one error, naming `require "single-agent"` |
| Coverage rule vs. the two bypassed commits | recompute `coveredPaths()`/`isCovered()` at each commit | rejects both — the rule is correct, execution is the variable |
| Upgrade rehearsal, re-run at head | genuine `npm pack @jeelvankhede/agentsmyth@1.0.0`, isolated `HOME` | skew detected, PS-9..PS-12 appended with PS-1..8 intact, 6/6 configs parse, global tree 27 → 32 validators, `check` exit 0 after setup |
| Skew warning remedy (F6) | reset the rehearsal consumer's stamp to 1.0.0, re-run `check` | the corrected message prints and names `init` as what updates the stamp |

## Command Results

| Command | Outcome |
|---|---|
| `npm run validate` | exit 0 |
| `npm run violations:test` | 129/129, attribution 92/92 |
| `npm run conformance:test` | 46/46 |
| `npm run root-resolution:test` | 21/21 |
| `npm run init-prepare-interop:test` | 38/38 |
| `npm run tuning-merge:test` | 15/15 |
| `npm run setup-checks:test` | 6/6 |
| `npm run setup-refs:test` | 5/5 |
| `npm run commit-coverage:test` | 7 passed, 0 failed |
| `npm run checkpoint-approval:test` | exit 0 |
| `npm run setup-validator-definitions-root:test` | exit 0 |
| `node test/run-mutation-audit.mjs --only check-assumptions.mjs` | 2/4 undefended, ok |

Re-run at head 2026-09-08, after Phases 6–8, because the table above was recorded when the branch
was four commits long and the branch is now eighteen:

| Command | Outcome |
|---|---|
| `npm run validate` | exit 0 |
| `npm run violations:test` | 210/210, attribution 93/93 |
| `npm run conformance:test` | 48/48 |
| `npm run root-resolution:test` | 21/21 |
| `npm run commit-coverage:test` | 7 passed, 0 failed |
| `npm run domain-placeholders:test` | 5/5 |
| `npm run setup-checks:test` | 13/13 |
| `npm run setup-refs:test` | 5/5 |
| `npm run tuning-merge:test` | 15/15 |
| `npm run checkpoint-approval:test` | 9/9 |
| `npm run init-prepare-interop:test` | 38/38 |
| `npm run setup-validator-definitions-root:test` | 3/3 |
| `npm run build` | exit 0, no generated-output drift in tracked files |
| `npm pack` + real 1.0.0 tarball upgrade rehearsal | every assertion in `docs/release-checklist.md` met; surfaced F6 |
| `node test/run-mutation-audit.mjs --only check-council-record.mjs` | 73 rules, 0 undefended — `mutation-audit: ok`, no regression against the baseline's 0 |
| `npm run mutation:audit` (full, at head) | `0/221 rules undefended` across 30 validators — `mutation-audit: ok`. R7's central claim, re-measured with this chain's own changes in place rather than read from the baseline |

## Architecture Notes

- role: Workflow maintainer

## Blockers

None. The one verification that was outstanding has since completed: the mutation ratchet for
`check-council-record.mjs`, the single validator Phase 8 changed, reports 73 rules and 0 undefended.
The change adds no `errors.push` site — it alters which mode an existing rule expects — so the rule
count is unchanged, and fixture `jd` defends the new branch directly. The audit confirms that
reasoning rather than being its basis.

## Phase Completion Log

- Phase 1 — R1 complete, both hook copies verified.
- Phase 2 — R2 complete, fixture verified in both directions.
- Phase 3 — R3 complete, conformance unaffected.
- Phase 4 — R4 complete, rehearsal clean, checklist written.
- Phase 5 — R5 complete, suite 16 → 21 checks.
- Phase 6 — R6 recorded retroactively; baseline empty, 0 live violations.
- Phase 7 — R7 recorded retroactively; 0 undefended over 221 rules, new suite wired in four places.
- Phase 8 — R8 complete. F1–F5 each fixed with evidence, and F6 found by re-running R4's rehearsal
  and fixed in the same phase. Two residual risks filed as OI-88 and OI-89 rather than left in the
  review. Whole suite green at head.
