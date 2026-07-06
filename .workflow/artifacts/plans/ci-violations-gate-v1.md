---
slug: ci-violations-gate
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-06T00:00:00Z
updated: 2026-07-06T00:00:00Z
manifest_ids:
  - R1
  - R2
upstream:
  - .workflow/artifacts/briefs/ci-violations-gate-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# CI Violations Gate — Plan

## Summary

Two-file additive change. Wire `violations:test` into CI as a new job step; update
verification documentation in two files to reference it. No code logic changes, no
dependency additions.

## Requirement Coverage

| ID | Requirement | Covered by |
|---|---|---|
| R1 | `violations:test` step in CI | Phase 1: `.github/workflows/ci.yml` |
| R2 | Verification docs updated | Phase 2: `docs/knowledge-map/repo-mental-map.md`, `CLAUDE.md` |

## Repo Impact Map

| File | Change | Risk |
|---|---|---|
| `.github/workflows/ci.yml` | Add one `run:` step after `validate-example` | Low — additive, existing steps unaffected |
| `docs/knowledge-map/repo-mental-map.md` | Add `violations:test` to Verification Defaults table | Low — docs only |
| `CLAUDE.md` | Add `violations:test` to pre-finish checklist | Low — docs only |

## Source-of-Truth Strategy

No external source update required. CI config is authoritative in the repo.

## Verification Plan

| Check | Method | Pass condition |
|---|---|---|
| CI step present | Read `.github/workflows/ci.yml` | Step named "Run violation tests" present after existing validate steps |
| Step command correct | Read step `run:` value | `npm run violations:test` or equivalent |
| Docs updated | Read both doc files | `violations:test` present in verification tables/checklists |
| Existing CI unaffected | Read full workflow | All pre-existing steps unchanged |

## Architecture Notes

Single-phase plan. No branch strategy required (no code changes). Branch: `feat/wp-r1-lifecycle-gate` (continuing on same branch since this closes out WP-R1 CI wiring).

## Exit Gate

- R1: CI step added, correct command, correct position.
- R2: Both doc files updated.
- No pre-existing CI step modified.
- `npm run violations:test` exits 0 when run locally (already confirmed during R4 work).

## Phase Plan

### Phase 1 — Wire CI step (R1)

**Touches:** `.github/workflows/ci.yml`
**Manifest IDs:** R1
**Exit gate:** Step present with `npm run violations:test`, positioned after validate-example step.

### Phase 2 — Update verification docs (R2)

**Touches:** `docs/knowledge-map/repo-mental-map.md`, `CLAUDE.md`
**Manifest IDs:** R2
**Exit gate:** Both files reference `violations:test` in their verification sections.
