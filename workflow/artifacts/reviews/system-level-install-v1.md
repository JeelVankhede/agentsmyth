---
slug: system-level-install
version: 1
artifact: review
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
  - artifact: task
    slug: system-level-install
    version: 1
orchestration:
  phase: review
  status: complete
  next_phase: test
  blockers: []
  user_checkpoint: false
---

## Findings

**R1 — agent-behavior.yaml relocation**: File moved from `src/workflow/config/` to `src/workflow/` root. Build-bundle exclusion filter and static-asset sync step removed correctly. All 20+ cross-references updated via grep + sed; render-adapters validation passes. No consumer files left referencing the old path in source.

**R2 — two-root resolver**: `_readDefinitionsRoot()` uses regex (not YAML parser) — correct decision given parser is defined later in the same file. Resolution order (repo-profile → AGENTSMYTH_HOME → repo-local) implements the spec. RI1 guard emits clean error on non-existent non-default defsRoot. Backward-compat theorem holds: no config + no env = `_defsRoot === _dataRoot` = unchanged behavior.

**R3 — agentsmyth check CLI**: Validator path resolution uses pkgRoot-first then local fallback. All 6 lifecycle SKILL.md files and the pre-commit hook updated. Existing per-repo behavior preserved.

**R4 — init --system + global gates**: Global gates are token-free (confirmed by RI2 check in render-adapters.mjs). Windsurf gate is 320 chars (well under 6,000). installGateSection handles both insert and update paths. expandBundle regex parses FILE-marker format correctly. writeDefinitionsRoot handles all four cases (file absent, definitions_root present, learnings_sessions_root anchor, repository: block, fallback append).

**R5 — headless bootstrap**: headlessBootstrap() is idempotent (never overwrites). Git branch inference uses two fallback strategies. Pending items cover the most important uninferrable fields. Exit 0 is correct — bootstrap is not a failure.

**R6 — version-skew**: agentsmyth_version at top level of repo-profile.yaml; optional (not in required[]). Skew check is non-fatal warning only — correct for a version mismatch that may be harmless. Regex read avoids parsing dependency.

**Minor findings (no blockers)**:
- The `import { homedir }` was initially placed mid-file (after executable code). Fixed before committing.
- `writeDefinitionsRoot` signature updated to accept pkgVersion; call site in --system updated to pass it.

## Severity Summary

| Severity | Count |
|---|---|
| Critical | 0 |
| Major | 0 |
| Minor (fixed before commit) | 2 |
| Informational | 0 |

## Requirement Coverage

| ID | Requirement | Covered |
|---|---|---|
| R1 | agent-behavior.yaml relocation | yes — commit 225ab1f |
| R2 | Two-root resolver | yes — commit 6d05a37 |
| R3 | agentsmyth check CLI | yes — commit d2c1b01 |
| R4 | init --system + global gates | yes — commit 52bb1f1 |
| R5 | Headless bootstrap | yes — commit 3848ccf |
| R6 | Version-skew policy | yes — commit 6d516e5 |
| RI1 | Non-default defsRoot missing → clean error | yes — lib.mjs guard + check warning |
| RI2 | Global gates token-free | yes — render-adapters.mjs RI2 check |
| RI3 | Bare init unchanged | yes — --system flag gates all new behavior |
| RI4 | CI at each phase boundary | yes — all 3 suites pass at every commit |
| RI5 | Doc currency | yes — CLAUDE.md, repo-mental-map.md, setup SKILL.md updated |

## Architecture Notes

The two-root split is clean. defsRoot and dataRoot are orthogonal: skills/schemas/validators load from defsRoot; config/artifacts/learnings always from dataRoot (repo-local). This means the system install doesn't touch any per-repo data — safe for multi-repo users.

The global gate install (R4) uses section markers for idempotency. Re-running `init --system` updates the gate section in place rather than appending duplicates.

## Verification Reviewed

All three suites confirmed passing:
- `npm run build` → build-bundle: ok
- `npm run validate` → all 4 validators: ok
- `npm run violations:test` → 4/4 detected

## Residual Risk

- Cursor has no global config file — paste-text only. This is a known limitation documented in the CLI output.
- Copilot gate install is macOS + VS Code only; other platforms skip silently (logged as "not installed").
- headlessBootstrap writes `<PLACEHOLDER>` for uninferred fields. schema validation passes because the schema expects `type: string` and `<PLACEHOLDER>` is a valid string. However, `check-domain-placeholders.mjs` would flag these. This is the intended state pending the setup skill run.

## Recommendation

Approve. Proceed to verify phase.
