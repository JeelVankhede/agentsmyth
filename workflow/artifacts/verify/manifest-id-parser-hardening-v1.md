---
slug: manifest-id-parser-hardening
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-07-18
updated: 2026-07-18
manifest_ids: [R1, R2, R3, RI1, RI2, RI3]
upstream:
  - workflow/artifacts/briefs/manifest-id-parser-hardening-v1.md
  - workflow/artifacts/plans/manifest-id-parser-hardening-v1.md
  - workflow/artifacts/tasks/manifest-id-parser-hardening-v1.md
  - workflow/artifacts/reviews/manifest-id-parser-hardening-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# Manifest-ID Parser Hardening - Verification

## Inputs

- Brief: `workflow/artifacts/briefs/manifest-id-parser-hardening-v1.md` (approved).
- Plan: `workflow/artifacts/plans/manifest-id-parser-hardening-v1.md` (approved, 6 phases —
  Phase 6 added post-Review to fix findings).
- Task: `workflow/artifacts/tasks/manifest-id-parser-hardening-v1.md` (`ready-for-next-phase`,
  6 phases complete).
- Review: `workflow/artifacts/reviews/manifest-id-parser-hardening-v1.md` (`pass`, 0 open
  findings — 1 P2 + 3 P3 found and fixed in Task Phase 6, all independently re-verified by
  Review after the fix).
- No configured commands in `workflow/config/verification.yaml` (`commands: []`,
  `allow_discovered_commands: true`) — all commands below are discovered from the repo's own
  `package.json` scripts and direct validator invocations, matching Build/Review's own
  evidence trail.

## Automated Checks

| Command | Outcome | Evidence |
|---|---|---|
| `AGENTSMYTH_WF=src/workflow node src/workflow/validators/check-manifest-coverage.mjs --dir test/fixtures/conformance/manifest-id-false-positive` | pass (exit 0) | `check-manifest-coverage: ok` — no false positive on `WP-R7-T7.2`/incidental prose; real `— ID: R5` tag credited |
| `AGENTSMYTH_WF=src/workflow node src/workflow/validators/check-coverage-ledger.mjs --dir test/fixtures/conformance/coverage-ledger-sublabel` | expected-fail (exit 1) | `check-coverage-ledger: failed with 1 issue(s) — manifest ID R7 is marked dropped/removed with no matching Waivers entry`. This is the *correct* outcome: the fixture's `RI5` (waived only via the `RI5-a` sub-label) produced no error, while `R7` (waiver-claimed only via the `WP-R7-T7.2` compound token) still correctly fails — proving both directions of the fix in one run |
| `AGENTSMYTH_WF=src/workflow node src/workflow/validators/check-phase-map.mjs --dir test/fixtures/conformance/phase-map-parenthetical` | pass (exit 0) | `check-phase-map: ok` — `RI2 (partial)` and `RI1 (infra supporting R2, R3, R4, R7 verification)` both parsed correctly, no orphan |
| `npm run build` | pass (exit 0) | Dist bundles + `workflow/schemas/` regenerated clean |
| `npm run validate` | pass (exit 0) | Full existing `workflow/artifacts/` tree (9+ prior chains), zero errors |
| `npm run violations:test` | pass (20/20 detected) | All 20 existing must-fail fixtures still correctly rejected — zero regression |
| `npm run conformance:test` | pass (12/12) | 9 pre-existing checks + this chain's 3 (`mid-false-positive`, `phase-map-parenthetical`, `coverage-ledger-sublabel`) all pass |
| `git diff package.json` | empty | No new runtime dependency introduced |
| `grep -n conformance:test .github/workflows/ci.yml` | `32: run: npm run conformance:test` | CI now runs the full conformance suite on every push/PR to `main` (Review P2 fix) |

## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | command | `check-manifest-coverage.mjs --dir .../manifest-id-false-positive` (Automated Checks row 1) | pass | No spurious extraction from compound token or incidental prose; real tag still credited |
| R2 | command | `check-coverage-ledger.mjs --dir .../coverage-ledger-sublabel` (Automated Checks row 2) | pass | Exit 1 is the correct/expected result for this fixture — see Notes column above; both the sub-label credit and the compound-token exclusion are proven in one run |
| R3 | command | `check-phase-map.mjs --dir .../phase-map-parenthetical` (Automated Checks row 3) | pass | Parenthetical annotation parsed correctly, no orphan, no spurious `R2`/`R3`/`R4`/`R7` credit |
| RI1 | command | `npm run validate` + `npm run violations:test` (Automated Checks rows 5-6) | pass | Zero regression against the full existing 9+ chain artifact tree |
| RI2 | command | `npm run conformance:test` (Automated Checks row 7); `grep` of `ci.yml` (row 9) | pass | 3 new fixtures exist, pass, and are CI-enforced — not just locally runnable |
| RI3 | command | `npm run build` (row 4); `git diff package.json` (row 8) | pass | No new dependency; build regenerates clean |

## Manual QA

not applicable

## Generated Output Evidence

not applicable

## Findings

none

## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship |
|---|---|---|---|---|

## Architecture Notes

- role: Senior QA
- decision: Re-ran every command fresh in this Test pass rather than only citing Build/Review's
  prior runs, per Determinism Rule "do not claim a command passed unless it actually ran" —
  all 9 Automated Checks rows are current-turn output from this phase.
- decision: Recorded `check-coverage-ledger.mjs`'s fixture command as "expected-fail (exit
  1)" rather than "pass," since the raw process exit code is non-zero by design (the fixture
  intentionally contains one still-invalid ID to prove the exclusion still works) — a plain
  "pass" label would misrepresent what actually happened to a future reader of this artifact.
- constraint: `workflow/config/verification.yaml` has no configured commands (`commands: []`),
  so all evidence here is discovered directly from `package.json` scripts and direct validator
  invocations — consistent with how Build and Review already established evidence for this
  chain, no new evidence method introduced.
- downstream: Ship should note that CI (`.github/workflows/ci.yml`) now runs
  `npm run conformance:test` in addition to `npm run violations:test` — any future PR that
  touches a conformance fixture or one of the 4 hardened validators gets this suite's
  protection automatically, closing the gap Review's P2 finding identified.

## Sign-Off

- Verifier: Senior QA (this chain)
- Date: 2026-07-18
- Recommendation: ship
