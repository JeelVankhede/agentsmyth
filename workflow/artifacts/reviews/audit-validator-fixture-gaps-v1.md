---
slug: audit-validator-fixture-gaps
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-07-10T14:20:00Z
updated: 2026-07-10T14:20:00Z
manifest_ids:
  - R1
  - R2
  - R3
  - RI1
  - RI2
  - RI3
upstream:
  - workflow/artifacts/briefs/audit-validator-fixture-gaps-v1.md
  - workflow/artifacts/plans/audit-validator-fixture-gaps-v1.md
  - workflow/artifacts/tasks/audit-validator-fixture-gaps-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# Audit Validator Fixture Gaps — Review

## Findings

### P3 — `domain.schema.yaml`'s `summary` field lacks a `minLength` constraint

- **Path/area:** `src/workflow/schemas/domain.schema.yaml`
- **Affected manifest ID:** none directly (observation, not a defect in this chain's own scope)
- **Problem:** Now that both `check-config.mjs` (schema-based) and `check-setup-complete.mjs`
  (regex-based) are wired into `npm run validate`, they overlap for `domain.name` (schema has
  `minLength: 1`, catches empty) but not for `domain.summary` (schema has no `minLength`, so an
  empty summary passes schema validation and is caught only by `check-setup-complete.mjs`'s regex —
  a real dependency on the weaker of the two checks for this one field).
- **Fix recommendation:** not in scope for this chain (Non-Goals: audit is these 4 validators, not
  schema hardening) — recorded as a Reflect follow-up candidate: add `minLength: 1` to `summary` in
  `domain.schema.yaml` for defense in depth.

## Severity Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 1 |

## Requirement Coverage

*(verify-manifest-coverage / coverage-tracer applied — cross-checked against task's Changed Files)*

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `check-domain-placeholders.mjs` diff; exit 0 against real repo state | covered | verified directly, diff matches task artifact's claim exactly |
| R2 | `check-setup-complete.mjs` diff; `npm run setup-checks:test` 4/4 pass | covered | includes the third bug found and fixed within this same requirement's scope |
| R3 | `scripts/validate-template.mjs` diff; `npm run validate` shows both new checks | covered | verified directly |
| RI1 | `git diff --stat scripts/build-bundle.mjs` — empty | covered | |
| RI2 | `check-setup-complete.mjs` still exits 1, 13 genuine issues, unchanged | covered | verified directly |
| RI3 | `grep -n "^import" test/run-setup-complete-tests.mjs` — only `node:` | covered | |

## Architecture Notes

- role: Staff Reviewer
- decision: No findings block Ship — the single P3 is a pre-existing schema gap unrelated to this
  chain's own changes, correctly deferred rather than scope-crept into this audit.
- constraint: Reviewed the actual diff, not just the task artifact's narrative — confirmed the
  "third bug" claim by re-deriving the `\s` cross-line-match issue independently (see Verification
  Reviewed) rather than trusting the Implementation Log's account at face value.
- downstream: Ship should confirm this chain functioned as the resolved WP-R4 spec's real-task
  checkpoint before Wave 2–4 begins — that determination belongs in Ship/Reflect, not Review.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `git diff` on both fixed validator files | inspected directly | matches task artifact's description exactly; no undisclosed changes |
| Independent regex reproduction of the `\s` vs `[ \t]` fix | reproduced | confirmed the cross-line-match bug and the fix's correctness myself, not just trusting the task artifact |
| `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test` | re-run, all exit 0 | independently reproduced, not just trusted |
| `domain.schema.yaml`'s `summary` field | inspected directly | confirmed the P3 finding (no `minLength`) via direct schema read |

## Residual Risk

- The P3 finding (schema gap) is real but explicitly deferred, not silently dropped — recorded for
  Reflect.
- `check-setup-complete.mjs`'s regex approach for "non-empty" still can't detect a quoted-empty-string
  YAML value (e.g. `name: ""`) — a pre-existing limitation, not introduced or worsened by this
  chain's fix, and out of scope to solve here (would require switching to the real YAML parser for
  this specific check, a larger change).

## Recommendation

pass
