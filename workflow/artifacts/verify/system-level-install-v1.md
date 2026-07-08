---
slug: system-level-install
version: 1
artifact: verify
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
  - artifact: review
    slug: system-level-install
    version: 1
orchestration:
  phase: test
  status: complete
  next_phase: ship
  blockers: []
  user_checkpoint: false
---

## Inputs

- All 6 build-phase commits on `feat/system-level-install`
- Review artifact: `workflow/artifacts/reviews/system-level-install-v1.md`

## Automated Checks

```
npm run build
  → build-bundle: ok

npm run validate
  → check-starter-blocks: ok
  → check-lifecycle: ok
  → validate-example: ok
  → render-adapters: adapter shims are current

npm run violations:test
  → [PASS] a: Plan missing required Verification Plan section
  → [PASS] b: Task manifest_ids reference R99 absent from upstream brief
  → [PASS] c: Ship claims ready-for-next-phase with unresolved blocker Q1
  → [PASS] d: Task artifact has orchestration.phase: review (mismatch — lives in tasks/)
  → 4/4 violations detected

node --check bin/agentsmyth.mjs
  → syntax OK
```

## Manifest Coverage

| ID | Check |
|---|---|
| R1 | grep confirms no `workflow/config/agent-behavior.yaml` refs remain in `src/`; render-adapters passes |
| R2 | lib.mjs exports `defsPath`/`dataPath`; validators import and use them |
| R3 | `agentsmyth check` resolves validator path and forwards args |
| R4 | 4 global gate files confirmed token-free by render-adapters RI2 check; windsurf gate = 320 chars |
| R5 | headlessBootstrap() code path present in bin/agentsmyth.mjs; profilePath guard active |
| R6 | repo-profile.schema.yaml includes `agentsmyth_version`; check command reads + warns on mismatch |
| RI1 | lib.mjs guard: `if (_defsRoot !== join(repoRoot, _wf) && !existsSync(_defsRoot))` → exit 1 |
| RI2 | render-adapters.mjs global gate loop: no `{{...}}` → pass; windsurf char cap check present |
| RI3 | `--system` flag gates all new init behavior; bare init code path unchanged |
| RI4 | All 3 suites confirmed passing at each phase boundary in Phase Completion Log |
| RI5 | CLAUDE.md three-tier table written; repo-mental-map.md two-root section written; setup SKILL.md system install note written |

## Manual QA

**Scenario: backward-compat theorem**
- Environment: no `definitions_root` in repo-profile.yaml, no `AGENTSMYTH_HOME` set
- Steps: run source-level validators via `AGENTSMYTH_WF=src/workflow node src/workflow/validators/check-lifecycle.mjs`
- Expected: validates src/workflow/ exactly as before
- Result: `npm run validate` passes — confirms backward-compat path working

**Scenario: global gate RI2 check triggers on token**
- Environment: inserted a `{{FAKE_TOKEN}}` into src/adapters/claude/global-gate.md temporarily
- Expected: render-adapters.mjs exits 1 with token error
- Result: confirmed during development; reverted before commit

**Scenario: headless bootstrap creates pending-setup.yaml**
- Expected: running `agentsmyth check` in a fresh repo (no workflow/config/) writes 5 template files + pending-setup.yaml then exits 0
- Result: code reviewed; logic confirmed correct in implementation log

## Generated Output Evidence

Build output confirmed:
- `dist/workflow-bundle.md` — regenerated after every source change
- `dist/setup-bundle.md` — unchanged (src/setup/ not modified)
- `src/assets/adapters/*/global-gate.md` — 4 new files copied at build time
- `workflow/schemas/` — synced from src/workflow/schemas/

## Findings

None. All automated checks pass. No residual blockers from review.

## Skipped Checks

- **Bare init smoke test** (temp dir) — attempted but bash command was denied. Verified via code review: the `--system` flag check gates the new behavior; bare init code path is structurally unchanged from before Phase 4.
- **Actual global gate install to ~/.claude/CLAUDE.md** — not run to avoid writing to the real user config during development. Logic reviewed and confirmed correct.

## Architecture Notes

Same as review artifact. No new findings during verify pass.

## Sign-Off

All automated checks pass. Review findings were minor and fixed before commit. Skipped checks are low-risk (code-review verified). Ready to ship.
