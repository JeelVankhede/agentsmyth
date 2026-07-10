---
slug: system-level-install
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-08T00:00:00Z
updated: 2026-07-08T00:00:00Z
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - RI1
  - RI2
  - RI3
  - RI4
  - RI5
upstream:
  - artifact: plan
    slug: system-level-install
    version: 1
orchestration:
  phase: build
  status: complete
  next_phase: review
  blockers: []
  user_checkpoint: false
---

## Active Phase

All 6 plan phases complete. Ready for review.

## Plan Phases Overview

| Phase | Status | Covers |
|---|---|---|
| Phase 1 — R1: agent-behavior.yaml relocation | complete | R1, RI5-a |
| Phase 2 — R2: two-root resolver | complete | R2, RI1 |
| Phase 3 — R3: agentsmyth check CLI | complete | R3, RI5-b |
| Phase 4 — R4: init --system + global gates | complete | R4, RI2, RI3, RI4, RI5-c |
| Phase 5 — R5: headless bootstrap | complete | R5 |
| Phase 6 — R6: version-skew | complete | R6 |

## Branch / Repo Status

Branch: `feat/system-level-install` (6 commits ahead of main)

```
6d516e5 feat(check): version-skew detection + agentsmyth_version stamp (Phase 6)
3848ccf feat(check): headless bootstrap when workflow/config absent (Phase 5)
52bb1f1 feat(init): add --system global install + global gate templates (Phase 4)
d2c1b01 feat(R3): add agentsmyth check CLI subcommand; decouple hook/router from node path
6d05a37 feat(R2): add two-root resolver (defsPath/dataPath) to lib.mjs
225ab1f refactor(R1): relocate agent-behavior.yaml to workflow root
```

## Scope

Source files touched across all 6 phases:

- `src/workflow/agent-behavior.yaml` — moved from `src/workflow/config/`
- `src/assets/workflow/config/agent-behavior.yaml` — deleted (no longer a static asset)
- `src/workflow/validators/lib.mjs` — two-root resolver + defsPath/dataPath
- `src/workflow/validators/check-lifecycle.mjs` — uses defsPath; loads agent-behavior
- `src/workflow/validators/check-artifacts.mjs` — uses defsPath for schema
- `src/workflow/validators/hooks/pre-commit` — uses agentsmyth check
- `src/workflow/validators/README.md` — updated invocation examples
- `src/workflow/router.md` — updated paths and check command
- `src/workflow/skills/lifecycle-{plan,build,review,test,ship,reflect}/SKILL.md` — check command
- `scripts/build-bundle.mjs` — removed WORKFLOW_EXCLUDES + sync step
- `scripts/render-adapters.mjs` — added global gate RI2 validation
- `bin/agentsmyth.mjs` — check + --system + headlessBootstrap + version-skew
- `src/adapters/claude/global-gate.md` — NEW
- `src/adapters/codex/global-gate.md` — NEW
- `src/adapters/copilot/global-gate.md` — NEW
- `src/adapters/windsurf/global-gate.md` — NEW
- `src/workflow/schemas/repo-profile.schema.yaml` — definitions_root + agentsmyth_version fields
- `CLAUDE.md` — three-tier table
- `docs/knowledge-map/repo-mental-map.md` — global tier + two-root resolver section
- `src/setup/SKILL.md` — system install note
- `workflow/config/repo-profile.yaml` — fixed stale workflow_root
- ~20 files mass-updated (workflow/config/agent-behavior.yaml → workflow/agent-behavior.yaml refs)

## Changed Files

See scope above. All edits are to source (`src/`) and project config; no generated output edited directly.

## Implementation Log

- Phase 1 (R1): Moved agent-behavior.yaml → workflow root; removed WORKFLOW_EXCLUDES from build-bundle; mass-updated all 20+ cross-references; fixed repo-profile.yaml stale field.
- Phase 2 (R2): Added two-root resolver (_readDefinitionsRoot, _expandTilde, _defsRoot, _dataRoot) to lib.mjs; added defsPath/dataPath exports; added RI1 guard (non-default defsRoot missing → clean error + exit 1); updated validators to use defsPath; added definitions_root to repo-profile schema.
- Phase 3 (R3): Added check subcommand to bin/agentsmyth.mjs; updated pre-commit hook and all 6 lifecycle SKILL.md files to use `agentsmyth check`; updated README.md and router.md.
- Phase 4 (R4): Wrote 4 global-gate.md templates (token-free); added RI2 validation to render-adapters.mjs; added --system path to init (expandBundle, installGateSection, writeDefinitionsRoot); RI5-c doc updates.
- Phase 5 (R5): headlessBootstrap() in bin/agentsmyth.mjs writes stub configs + pending-setup.yaml when workflow/config/repo-profile.yaml is absent; check exits 0 after bootstrap.
- Phase 6 (R6): added agentsmyth_version field to repo-profile schema; headlessBootstrap and writeDefinitionsRoot stamp the version; agentsmyth check warns on skew.

## Verification Items

- [ ] npm run build passes
- [ ] npm run validate passes
- [ ] npm run violations:test passes (all 4 fixtures rejected)
- [ ] render-adapters: global gates token-free, windsurf ≤ 6,000 chars
- [ ] node --check bin/agentsmyth.mjs syntax OK

## Command Results

```
npm run build    → build-bundle: ok (all 6 phases)
npm run validate → check-starter-blocks: ok / check-lifecycle: ok / validate-example: ok / render-adapters: ok
npm run violations:test → 4/4 violations detected
node --check bin/agentsmyth.mjs → syntax OK
```

## Dispatch Log

No subagents dispatched. All changes written in main session.

## Architecture Notes

- Two-root resolver uses regex (not YAML parser) to read definitions_root from repo-profile.yaml because the parser is defined later in lib.mjs — circular dependency avoided.
- Global gate templates deliberately contain zero `{{...}}` markers so they work across all repos without substitution; render-adapters.mjs RI2 check enforces this.
- headlessBootstrap never overwrites existing files; idempotent-safe on re-run.
- agentsmyth_version stamped as top-level YAML field rather than inside repository: block to keep it visible and schema-compatible with additionalProperties: false.

## Blockers

None.

## Phase Completion Log

- Phase 1 complete: commit 225ab1f, all validators pass.
- Phase 2 complete: commit 6d05a37, RI1 guard confirmed (AGENTSMYTH_HOME pointing to non-existent path exits clean).
- Phase 3 complete: commit d2c1b01, pre-commit hook uses agentsmyth check.
- Phase 4 complete: commit 52bb1f1, render-adapters validates global gates.
- Phase 5 complete: commit 3848ccf.
- Phase 6 complete: commit 6d516e5.
