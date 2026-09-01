---
slug: open-items-remediation
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-08-31
updated: 2026-08-31
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
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

- Phase: Phase 5 — resolveGitCwd coverage — **complete; Build is done, all five phases closed**.
  Written as a phase number because `check-scope-fence` extracts it from this line to bound the
  scope union, and a line it cannot parse fails the gate.
- Manifest IDs: R5 (Build total: R1–R5)
- Exit gate: met. `npm run validate` exit 0, 129/129 violations with attribution 92/92, 46/46
  conformance, 21/21 root-resolution, 38/38 init/prepare interop, mutation ratchet ok.

## Plan Phases Overview

| Phase | Manifest IDs | Status |
|---|---|---|
| 1 — Pre-commit gate defects | R1 | complete |
| 2 — Versioned-artifact selection | R2 | complete |
| 3 — Lifecycle skill process gaps | R3 | complete |
| 4 — Release-readiness evidence | R4 | complete |
| 5 — resolveGitCwd coverage | R5 | complete |

## Branch / Repo Status

Branch `chore/open-items-triage-1.1.0`, cut from `release/1.1.0` at `7c224dc`. Not pushed; no PR
opened.

## Scope

The open items triaged as having a known fix and an achievable verification: OI-79, OI-86 (R1),
OI-66 (R2), OI-45, OI-55, OI-56 (R3), OI-67, OI-69 (R4), OI-20 (R5). Also closes OI-84, OI-16 and
OI-43 as stale or superseded, which required record changes only.

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
- `workflow/artifacts/open-items.yaml` — close resolved items with evidence; re-evidence the rest — IDs: R1, R2, R3, R4, R5

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

## Architecture Notes

- role: Workflow maintainer

## Blockers

None.

## Phase Completion Log

- Phase 1 — R1 complete, both hook copies verified.
- Phase 2 — R2 complete, fixture verified in both directions.
- Phase 3 — R3 complete, conformance unaffected.
- Phase 4 — R4 complete, rehearsal clean, checklist written.
- Phase 5 — R5 complete, suite 16 → 21 checks.
