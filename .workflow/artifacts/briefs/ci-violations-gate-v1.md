---
slug: ci-violations-gate
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-06T00:00:00Z
updated: 2026-07-06T00:00:00Z
manifest_ids:
  - R1
  - R2
upstream:
  - user-request
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
---

# CI Violations Gate — Brief

## Source Links

- User request: wire `npm run violations:test` into CI so R4 fixture tests run on every push.
- Source-of-truth: none (CI config is self-referential)
- GitHub / issue / ticket: WP-R1 R4 completion, PR #23
- Prior lifecycle chain: none

## Problem

The R4 negative test suite (`test/run-violation-tests.mjs`) was added in WP-R1 but is not
wired into CI. A developer can break a validator rule, land a fixture that silently passes,
and `npm run validate` will not catch it. The gap closes only when `violations:test` runs
automatically on every push and PR.

Additionally, the repo's verification documentation (`docs/knowledge-map/repo-mental-map.md`
and `CLAUDE.md`) still lists only the four original validators — it does not reference
`violations:test` or the new `--phase` invocation. Agents contributing to this repo will
miss the check.

## Goals

- `violations:test` runs in CI on every push and PR to `main`.
- Repo verification documentation references `violations:test` so contributors know to run it.

## Non-Goals

- Do not refactor or expand the violation fixtures.
- Do not change the test runner script logic.
- Do not add other CI steps beyond this one.

## Requirement Manifest

### Explicit (R)

- **R1** - Add `violations:test` step to `.github/workflows/ci.yml` after the existing validate steps.
  - Acceptance: CI runs `node test/run-violation-tests.mjs` (or `npm run violations:test`) on push/PR to main; a broken fixture exits non-zero and fails the job.

- **R2** - Update verification documentation to reference `violations:test`.
  - Acceptance: `docs/knowledge-map/repo-mental-map.md` verification defaults and `CLAUDE.md` pre-finish checklist both mention `violations:test`.

## Architecture Notes

No architectural change. CI YAML is additive (one new step). Documentation updates are
non-breaking. The test runner already exists at `test/run-violation-tests.mjs`; CI just
needs to invoke it. Node version compatibility: `run-violation-tests.mjs` uses standard
ESM imports — Node 20 (pinned in CI) is sufficient.

## Exit Gate

- R1 and R2 are fully stated, non-overlapping, and acceptance-testable.
- No open questions.
- Classification confirmed Standard (two files, additive CI step + docs).
