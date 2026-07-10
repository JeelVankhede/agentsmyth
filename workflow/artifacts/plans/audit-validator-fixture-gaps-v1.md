---
slug: audit-validator-fixture-gaps
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-10T13:30:00Z
updated: 2026-07-10T13:30:00Z
manifest_ids:
  - R1
  - R2
  - R3
  - RI1
  - RI2
  - RI3
upstream:
  - workflow/artifacts/briefs/audit-validator-fixture-gaps-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: approved
---

# Audit Validator Fixture Gaps — Plan

## Summary

Two-phase plan: fix the two confirmed regex/scope bugs first (R1, R2), then wire the two
correctly-scoped validators into `npm run validate` (R3) — matching the Wave 1 precedent's own
"don't automate a check with a known bug" ordering. Actively invokes the Wave 1 invariant-spine
skills throughout, per this chain's role as the resolved spec's real-task checkpoint.

**Phase gate check passed before writing this plan:**
`node src/workflow/validators/check-lifecycle.mjs --phase plan --slug audit-validator-fixture-gaps` → ok

## Inputs

- Brief: `workflow/artifacts/briefs/audit-validator-fixture-gaps-v1.md` — approved.
- Confirmed bugs (found by direct inspection + regex reproduction this session): `check-domain-placeholders.mjs`'s "Bare"/"multi-repo" false positives against `workflow/artifacts/**`; `check-setup-complete.mjs`'s unanchored-multiline regex bug on `domain.name`/`domain.summary`.
- `scripts/build-bundle.mjs`'s `setupValidators` array (must stay unbroken — RI1).

## Requirement Coverage

*(coverage-tracer ledger — established here, extended by Review/Ship)*

| Manifest ID | State | Citation |
|---|---|---|
| R1 | covered | Phase 1 |
| R2 | covered | Phase 1 |
| R3 | covered | Phase 2 |
| RI1 | covered | Phase 2 (verified, not changed) |
| RI2 | covered | Phase 1 (verified, not changed) |
| RI3 | covered | Phase 1 + 2 (both use only `node:*`/`lib.mjs`) |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `src/workflow/validators/check-domain-placeholders.mjs` | modify | R1 | exclude `workflow/artifacts/**`; narrow the "Bare" pattern |
| `src/workflow/validators/check-setup-complete.mjs` | modify | R2 | add `m` flag to the two `domain.name`/`domain.summary` regexes |
| `test/fixtures/setup-complete/domain-valid.yaml` | new | R2 | targeted regression fixture — pass case |
| `test/fixtures/setup-complete/domain-empty.yaml` | new | R2 | targeted regression fixture — fail case (amended into this Plan during Build; a valid-only fixture cannot test the "correctly rejects empty" direction of R2's own acceptance criteria) |
| `test/run-setup-complete-tests.mjs` | new | R2 | small dedicated test script for the 2 regex checks |
| `scripts/validate-template.mjs` | modify | R3 | add `check-config.mjs` + `check-domain-placeholders.mjs` to the existing `artifactCommands` group |
| `package.json` | modify | R3 | add a `setup-checks:test` script for the new fixture test |

## Source-of-Truth Strategy

No external source-of-truth update required — self-contained repository fix.

## Approach

Phase 1 fixes both bugs and re-verifies each validator against real repo state directly (no
wiring yet, so a still-broken fix doesn't get automated). Phase 2 wires the two validators into
`npm run validate` and adds the R2 regression fixture, only once Phase 1 is confirmed clean.

## Phases

### Phase 1 — Fix the two confirmed bugs (R1, R2, RI2)

**Manifest IDs:** R1, R2, RI2

**Touches:**
- `src/workflow/validators/check-domain-placeholders.mjs`
- `src/workflow/validators/check-setup-complete.mjs`

**Work:**
1. `check-domain-placeholders.mjs`: add `/^workflow\/artifacts\//` to the `excluded` array (dev-workspace dogfood content, never shipped — same reasoning already applied to `examples/` and `scripts/`).
2. `check-domain-placeholders.mjs`: narrow the `term('Ba', 're')` pattern so it no longer matches the standalone English word "Bare" — since the real leakage risk is the paired "fare/bare" starter-naming scheme, require both halves to co-occur in reasonable proximity, or scope the pattern to a less common casing/context. Confirm `Fa`+`re` (fare) pattern stays intact for genuine detection.
3. `check-setup-complete.mjs`: add the `m` flag to both `/^  name:\s+\S/` and `/^  name:\s*$/` (and the summary equivalent) so they match at the start of any line, not just string-start.
4. Re-run each validator directly (not via `npm run validate` yet) against real repo state; confirm `check-domain-placeholders` now exits 0, and `check-setup-complete` still exits non-zero (RI2) but with the `domain.name`/`domain.summary` lines gone from its error list.

**Exit gate:**
- `node src/workflow/validators/check-domain-placeholders.mjs` exits 0.
- `node src/workflow/validators/check-setup-complete.mjs` still exits non-zero (workflow-tree-missing errors unchanged) but no longer reports `domain.name`/`domain.summary` as empty.
- A minimal in-place check (`node -e` reproduction) confirms the `Fa`+`re` ("fare") pattern still matches genuine old-naming leakage.

### Phase 2 — Regression fixture + wire into npm run validate (R3, RI1, RI3)

**Manifest IDs:** R3, RI1, RI3

**Touches:**
- `test/fixtures/setup-complete/domain-valid.yaml`
- `test/fixtures/setup-complete/domain-empty.yaml` (amended into this Plan during Build — see Repo Impact Map note; `check-scope-fence` correctly flagged its absence before this amendment)
- `test/run-setup-complete-tests.mjs`
- `scripts/validate-template.mjs`
- `package.json`

**Work:**
1. Create `test/fixtures/setup-complete/domain-valid.yaml` — a minimal `domain.yaml` shape (`version`, `kind`, then `domain.name`/`domain.summary` non-empty, matching the real schema's field order) that exercises the exact bug found.
2. Create `test/run-setup-complete-tests.mjs` — a small, standalone script (same shape as `test/run-violation-tests.mjs`) that runs just the two regex checks from `check-setup-complete.mjs` against the fixture and asserts they pass; and against a deliberately-empty variant, asserts they fail.
3. Add `check-config.mjs` and `check-domain-placeholders.mjs` to `scripts/validate-template.mjs`'s `artifactCommands` array (both correctly resolve against `workflow/` dev-workspace state already — `check-config.mjs` already does via its hardcoded `workflow` root; `check-domain-placeholders.mjs` scans `trackedFiles()` repo-wide, unaffected by the env split).
4. Add a `"setup-checks:test": "node test/run-setup-complete-tests.mjs"` script to `package.json` (kept separate from `violations:test` since it exercises a different validator family with a different fixture shape).
5. Run `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test`.

**Exit gate:**
- `npm run validate` output shows `check-config` and `check-domain-placeholders` executing and passing.
- `npm run setup-checks:test` passes against the valid fixture and correctly fails against the empty variant.
- `npm run build && npm run validate && npm run violations:test` all still exit 0 — no regression to Wave 1's 14 fixtures.
- `scripts/build-bundle.mjs`'s `setupValidators` array unchanged (RI1) — confirmed via diff.

## Dependency Order

```
Phase 1 (R1, R2, RI2)  ← must complete first: don't automate a check with a known bug
  │
Phase 2 (R3, RI1, RI3) ← depends on Phase 1: wiring assumes both validators are already correct
```

## Branch Strategy

- Branch: `feat/audit-validator-fixture-gaps` — created off `feat/wp-r4-power-skills-spine` (needs
  Wave 1's validators to exist for dogfooding; kept independent of the Wave 2–4 explorer branch).
- One commit per phase boundary, after the full verification suite passes for that phase.
- Not targeting `main` directly — will PR against `main` once complete (mirrors the Wave 1 PR, since
  `feat/wp-r4-power-skills-spine` itself is also an open PR, not yet merged).

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| Narrowing the "Bare" pattern weakens real leakage detection | Low | Medium | Explicit re-test of the `Fa`+`re` ("fare") pattern after the change; keep both halves of the original paired pattern intact | Build phase | R1 |
| The `m`-flag fix has a similar bug elsewhere in `check-setup-complete.mjs` not yet found | Low | Low | Full re-run of the validator confirms only the 2 targeted checks changed behavior; all other checks (workflow-tree-presence, `.agentsmyth/` cleanup, adapter presence) remain correctly failing against this dev repo | Build phase | RI2 |
| Wiring `check-domain-placeholders.mjs` into `npm run validate` surfaces additional pre-existing leakage not yet found | Medium | Low | If found, treat as a new, separately-scoped finding — fix or waive explicitly, not silently exclude | Build phase | R3 |

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | `node src/workflow/validators/check-domain-placeholders.mjs` exits 0 | Phase 1 | Command output |
| R2 | `npm run setup-checks:test` passes both directions | Phase 2 | Command output |
| R3 | `npm run validate` output shows both new checks executing | Phase 2 | Command output |
| RI1 | `git diff scripts/build-bundle.mjs` shows no change to `setupValidators` | Phase 2 | Diff inspection |
| RI2 | `check-setup-complete.mjs` still exits non-zero against this dev repo, workflow-tree errors unchanged | Phase 1 | Command output |
| RI3 | `git grep -n "^import"` on the new test script shows only `node:`/`lib.mjs` | Phase 2 | Command output |

## Architecture Notes

- role: Principal Engineer
- decision: Wave 1 skills are dogfooded throughout Build by actually running the corresponding
  validator scripts against this chain's own artifacts as they're written — the same pattern used
  during `power-skills-spine`'s own construction, since that IS how these skills mechanically operate
  (there's no separate "invocation" beyond running the check).
- constraint: `check-setup-complete.mjs`'s dev-repo failure must remain (RI2) — this plan does not
  attempt to make it pass here.
- tradeoff: a targeted fixture (Phase 2) over a full synthetic consumer-repo tree — smaller scope,
  leaves ~13 other `check-setup-complete.mjs` checks without automated regression coverage; named as
  a Reflect follow-up candidate, not addressed here.
- downstream: Review should confirm the Wave 1 dogfooding actually happened and was meaningful (not
  just nominally mentioned) — this is the real content of the resolved spec's §8 checkpoint.

## Open Questions

None. Plan is unblocked.

## Exit Gate

- [x] Every active R and RI is mapped to exactly one owning phase.
- [x] Every phase has a binary, falsifiable exit gate.
- [x] Dependency order is explicit.
- [x] All risks have mitigations.
- [x] Verification plan covers every R and RI with named commands.
- [x] Source-of-truth handling explicit: none required.
- [x] Branch strategy defined (`feat/audit-validator-fixture-gaps` off `feat/wp-r4-power-skills-spine`).
- [x] No open questions; no blockers.
