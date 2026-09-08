---
slug: open-items-remediation
version: 1
artifact: plan
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
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: none
---

# Open-Items Remediation (pre-1.1.0) — Plan

## Summary

Five independent fixes, each closing one or more triaged open items. No two phases touch the same
file, so the order is free; they are sequenced defect-first so that the gate protecting the rest of
the work is correct before the rest of the work lands.

## Requirement Coverage

| ID | Requirement | Covered by |
|---|---|---|
| R1 | Pre-commit gate defects | Phase 1: both hook copies |
| R2 | Versioned-artifact selection | Phase 2: `check-assumptions.mjs` + fixture `fw` |
| R3 | Lifecycle skill process gaps | Phase 3: ship, build, review skills |
| R4 | Release-readiness evidence | Phase 4: rehearsal + release checklist |
| R5 | `resolveGitCwd()` coverage | Phase 5: root-resolution scenario 5 |
| R6 | Grandfathered artifact violations | Phase 6: repair at source, empty the baseline |
| R7 | Undefended validator rules | Phase 7: rejection fixture per rule |
| R8 | Review findings F1–F5 | Phase 8: chain record, gate resolution, release note, mode contract |

## Repo Impact Map

| File | Change | Risk |
|---|---|---|
| `.githooks/pre-commit` | `if !` guard around the coverage check; prefer repo `bin/` | Low — the gate still blocks; it blocks on more |
| `src/assets/hooks/pre-commit` | Same two changes, kept in sync | Low — consumer repos have no `bin/`, so resolution is unchanged for them |
| `src/workflow/validators/check-assumptions.mjs` | Select the highest brief version, not `[0]` | Medium — a plan judged against a newer brief can now fail where it passed |
| `test/run-violation-tests.mjs` | Register fixture `fw` | Low — additive |
| `test/mutation-baseline.json` | Lower `check-assumptions` undefended 3 → 2 | Low — ratchet only shrinks |
| `src/workflow/skills/lifecycle-ship/SKILL.md` | 4a unconditional, new 4b | Low — prose |
| `src/workflow/skills/lifecycle-build/SKILL.md` | New step 8a | Low — prose |
| `src/workflow/skills/lifecycle-review/SKILL.md` | Workflow preamble paragraph | Low — prose; the byte-locked path is untouched |
| `test/run-root-resolution-drift-tests.mjs` | New scenario 5 | Low — additive |
| `docs/release-checklist.md` | New file | Low — documentation |
| `workflow/artifacts/open-items.yaml` | Close resolved items with evidence | Low — record |
| `workflow/artifacts/` (40+ files) | Frontmatter normalised to the schema's own enums | Low — record; no requirement or scope changed |
| `workflow/config/artifact-baseline.yaml` | 96 entries → empty | Low — a ratchet that only shrinks |
| `test/fixtures/` (~130 new) | One rejection fixture per previously undefended rule | Low — additive |
| `src/workflow/validators/check-pending-setup.mjs` | `--dir` flag, making its 8 rules reachable | Low — matches every sibling validator |
| `src/workflow/validators/check-domain-placeholders.mjs` | Exclude `test/fixtures/` from the scan | Low — fixtures are unshipped by construction |
| `src/workflow/validators/lib.mjs` | Schema-engine rules defended; one dead export removed | Medium — shipped module loses a symbol |
| `test/run-domain-placeholders-tests.mjs` | New suite; the validator cannot be fixtured in-repo | Low — additive |
| `package.json`, `.github/workflows/{ci,release}.yml` | Wire the new suite | Low — additive |
| `src/workflow/validators/check-council-record.mjs` | Non-Complex chains expect `single-agent`, not `refused` | Medium — a record that validated before may now be rejected, and vice versa |
| `bin/agentsmyth.mjs` | Source-repo validator precedence in `resolveValidator()` | Medium — resolution order change, guarded to the source repo |
| `test/run-conformance-tests.mjs` | Pin the precedence and the mode contract | Low — additive |
| `CHANGELOG.md` | 1.1.0 entry | Low — release record |

## Source-of-Truth Strategy

No external source-of-truth update required. `open-items.yaml` is authoritative in the repo and is
updated as part of this chain.

## Verification Plan

| Check | Method | Pass condition |
|---|---|---|
| Hook syntax | `sh -n` on both copies | Both parse |
| `set -e` behaviour | Run the `if !` form under `set -e` | The line after a failing check is reached with status 1 |
| Binary resolution | Evaluate the resolution branch in this repo | Selects `node ./bin/agentsmyth.mjs` |
| Selection fix discriminates | Run fixture `fw` against pre-fix and post-fix code | Passes pre-fix, rejects post-fix |
| Mutation ratchet | `mutation:audit --only check-assumptions.mjs` | No regression at the lowered baseline |
| Upgrade rehearsal | Real published 1.0.0 tarball, isolated `HOME` | Skew detected, families appended, configs parse, `check` exits 0 after setup |
| `resolveGitCwd` | New scenario against real sibling checkouts | Routing and both fallbacks assert |
| Whole suite | `npm run validate` and every `:test` script | All exit 0 |
| Baseline emptied honestly | `check-artifacts` with `entries: []` | 0 live violations, so nothing was re-baselined |
| Undefended count | `test/mutation-baseline.json` | 0 for every audited validator |
| New suite is reachable | `grep` the suite name in `package.json`, both workflows, and the audit's `SUITES` | Present in all four |
| Source-repo validator precedence | Marker experiment: mark a source validator, run the CLI's own gate, observe | Marker absent before the change, present after, source restored |
| Mode contract | Fixture `jd` against `check-council-record` | A non-Complex record declaring `refused` is rejected and told to expect `single-agent` |
| Chain record matches the branch | `check-scope-fence` over the task's Changed Files | Every path on the branch is inside a declared phase's Touches |

## Architecture Notes

Branch: `chore/open-items-triage-1.1.0`, cut from `release/1.1.0`. The work is deliberately kept off
`release/1.1.0` directly so the release branch takes it as one reviewable merge.

Phase 2 carries the only behaviour risk worth stating: `check-assumptions` now reads the current
brief rather than the first one, so a chain whose brief was revised can newly fail. That is the
defect being fixed, not a side effect, but it is a real change in what the gate rejects.

## Exit Gate

- R1–R5 each verified by the method named in the Verification Plan above.
- `npm run validate` exits 0 and every `:test` script passes.
- Items closed in `open-items.yaml` each carry a resolution stating what was done and how it was
  checked; items that could not be honestly closed remain open.

## Phase Plan

### Phase 1 — Pre-commit gate defects (R1)

- **Touches:** `.githooks/pre-commit`, `src/assets/hooks/pre-commit`
- **Manifest IDs:** R1
- **Exit gate:** Both copies pass `sh -n`; the coverage check runs as an `if` condition; the repo's
  own `bin/` is preferred when present.

### Phase 2 — Versioned-artifact selection (R2)

- **Touches:** `src/workflow/validators/check-assumptions.mjs`, `test/run-violation-tests.mjs`, `test/mutation-baseline.json`, `test/fixtures/lifecycle-violations/fw-brief-revision-assumption-uncovered/briefs/probe-v1.md`, `test/fixtures/lifecycle-violations/fw-brief-revision-assumption-uncovered/briefs/probe-v2.md`, `test/fixtures/lifecycle-violations/fw-brief-revision-assumption-uncovered/plans/probe-v1.md`
- **Manifest IDs:** R2
- **Exit gate:** Fixture `fw` rejects under the fix and passes under a restored pre-fix copy;
  `check-assumptions` drops to 2 undefended and the baseline matches.

### Phase 3 — Lifecycle skill process gaps (R3)

- **Touches:** `src/workflow/skills/lifecycle-ship/SKILL.md`, `src/workflow/skills/lifecycle-build/SKILL.md`, `src/workflow/skills/lifecycle-review/SKILL.md`
- **Manifest IDs:** R3
- **Exit gate:** Ship 4a unconditional and 4b present; Build 8a present; Review preamble present;
  conformance still passes, including the byte-locked single-agent path check.

### Phase 4 — Release-readiness evidence (R4)

- **Touches:** `docs/release-checklist.md`
- **Manifest IDs:** R4
- **Exit gate:** The rehearsal has been run against the published 1.0.0 tarball with its results
  recorded; the checklist carries the deprecation-window removal step and the do-not-pre-bump rule.

### Phase 5 — resolveGitCwd coverage (R5)

- **Touches:** `test/run-root-resolution-drift-tests.mjs`, `workflow/artifacts/open-items.yaml`
- **Manifest IDs:** R5

  `open-items.yaml` is declared here rather than in each phase because the record is written once,
  at the end, when every phase's outcome is known — closing an item before its verification has run
  would be recording a result that does not exist yet.
- **Exit gate:** Scenario 5 asserts routing, a second distinct target, no-target, and unknown-target;
  the suite passes.

### Phase 6 — Grandfathered artifact violations (R6)

- **Touches:** `workflow/artifacts/`, `workflow/config/artifact-baseline.yaml`
- **Manifest IDs:** R6

  Recorded retroactively — see the brief's Scope Change note. The work landed in `87e8a1b`
  before this phase existed.
- **Exit gate:** `workflow/config/artifact-baseline.yaml` carries `entries: []`, and
  `check-artifacts` reports zero live violations with the baseline empty, proving the violations
  were repaired rather than re-accepted.

### Phase 7 — Undefended validator rules (R7)

- **Touches:** `test/fixtures/`, `test/run-violation-tests.mjs`, `test/run-mutation-audit.mjs`, `test/mutation-baseline.json`, `test/run-checkpoint-approval-tests.mjs`, `test/run-setup-complete-tests.mjs`, `test/run-domain-placeholders-tests.mjs`, `src/workflow/validators/check-pending-setup.mjs`, `src/workflow/validators/check-domain-placeholders.mjs`, `src/workflow/validators/lib.mjs`, `package.json`, `.github/workflows/ci.yml`, `.github/workflows/release.yml`
- **Manifest IDs:** R7

  Recorded retroactively — see the brief's Scope Change note. The work landed in
  `443a6c3..b8fe90a` before this phase existed, and reverses a Non-Goal the brief had stated.
- **Exit gate:** `test/mutation-baseline.json` records 0 undefended for every audited validator;
  `npm run violations:test` passes at the raised fixture count; `domain-placeholders:test` is
  named in `package.json`, `ci.yml`, `release.yml` and the audit's `SUITES`.

### Phase 8 — Review remediation (R8)

- **Touches:** `src/workflow/validators/check-council-record.mjs`, `test/fixtures/`, `test/run-violation-tests.mjs`, `test/run-conformance-tests.mjs`, `bin/agentsmyth.mjs`, `CHANGELOG.md`, `workflow/artifacts/open-items.yaml`
- **Manifest IDs:** R8
- **Exit gate:** Each of F1–F5 is either fixed with evidence or explicitly recorded as accepted;
  the review artifact's Severity Summary shows 0 open with the found counts preserved; the whole
  suite passes at head.

  Sequenced last because F1 — the record not matching the branch — is repaired by Phases 6 and 7
  existing at all, so those must be written before this phase can claim it closed.
