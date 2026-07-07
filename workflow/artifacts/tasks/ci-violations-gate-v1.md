---
slug: ci-violations-gate
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-06T00:00:00Z
updated: 2026-07-06T00:00:00Z
manifest_ids:
  - R1
  - R2
upstream:
  - workflow/artifacts/plans/ci-violations-gate-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: build-complete
---

# CI Violations Gate — Task

## Active Phase

Phase 1 and Phase 2 complete (single-session, two-file change).

## Branch / Repo Status

Branch: `feat/wp-r1-lifecycle-gate`
Status before edits: clean tracked files, two untracked artifact files (brief + plan).

## Changed Files

| File | Change | Manifest IDs |
|---|---|---|
| `.github/workflows/ci.yml` | Added "Run violation tests" step (`npm run violations:test`) after validate-example | R1 |
| `docs/knowledge-map/repo-mental-map.md` | Added `violations:test` and `--phase`/`--dir` flag notes to Verification Defaults | R2 |
| `CLAUDE.md` | Added `violations:test` line to pre-finish checklist | R2 |

## Implementation Log

**Phase 1 (R1):** Appended a single `run:` step to `.github/workflows/ci.yml` after the
existing `validate-example` step. Step name: "Run violation tests". Command: `npm run violations:test`.
Node 20 is already pinned by the CI setup-node step — no additional version handling needed.

**Phase 2 (R2):** Updated Verification Defaults in `repo-mental-map.md` to add
`npm run violations:test` and inline comments on `--phase`/`--dir` flags for the new
validator modes. Added `violations:test` line to `CLAUDE.md` pre-finish checklist with
acceptance note (all 4 fixtures rejected).

## Verification Items

| Check | Status | Notes |
|---|---|---|
| `npm run violations:test` | ✓ Pass | 4/4 violations detected |
| `npm run validate` | ✓ Pass | All validators ok, examples ok, adapters current |
| CI step present and correctly positioned | ✓ Confirmed | Read `.github/workflows/ci.yml` — step after validate-example |
| Pre-existing CI steps unchanged | ✓ Confirmed | Build bundles, Validate templates, Validate examples all intact |

## Command Results

```
npm run violations:test
[PASS] a: Plan missing required Verification Plan section
[PASS] b: Task manifest_ids reference R99 absent from upstream brief
[PASS] c: Ship claims ready-for-next-phase with unresolved blocker Q1
[PASS] d: Task artifact has orchestration.phase: review (mismatch — lives in tasks/)
4/4 violations detected
```

```
npm run validate → validate-example: ok / render-adapters: adapter shims are current
```

## Architecture Notes

- role: Senior Engineer
- No architectural decisions — purely additive wiring.
- CI change is append-only; no existing steps touched.
- `violations:test` script is already present in `package.json`; CI just invokes it.
- Downstream: Review can confirm file diffs match the plan exactly. No source-of-truth
  update required. No release action needed (CI config ships with the repo, not the npm package).
