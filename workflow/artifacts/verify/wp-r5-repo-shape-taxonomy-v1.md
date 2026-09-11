---
slug: wp-r5-repo-shape-taxonomy
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-07-12T00:00:00Z
updated: 2026-07-12T00:00:00Z
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - RI1
  - RI2
  - RI3
  - RI4
  - RI5
upstream:
  - workflow/artifacts/reviews/wp-r5-repo-shape-taxonomy-v1.md
orchestration:
  phase: test
  status: done
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

## Inputs

- All 8 build/lifecycle commits on `feat/wp-r5-repo-shape-taxonomy`
- Review artifact: `workflow/artifacts/reviews/wp-r5-repo-shape-taxonomy-v1.md` — recommendation: approve

## Automated Checks

```
npm run build
  → build-bundle: ok

npm run validate
  → check-starter-blocks: ok
  → check-lifecycle: ok
  → check-waivers: ok
  → check-coverage-ledger: ok
  → check-evidence-citations: ok
  → check-scope-fence: ok
  → check-manifest-coverage: ok
  → check-skipped-accounting: ok
  → check-release-readiness: ok
  → check-skill-triggers: ok
  → check-phase-map: ok
  → check-assumptions: ok
  → check-verify-matrix: ok
  → check-followups: ok
  → check-open-items: ok
  → check-config: ok
  → check-domain-placeholders: ok
  → check-constraint-conflicts: ok
  → check-trigger-predicates: ok
  → validate-example: ok
  → render-adapters: adapter shims are current

npm run violations:test
  → 20/20 violations detected

npm run setup-checks:test
  → 4/4 setup-complete regex checks passed
```

Re-run fresh at the start of this test phase (not carried over from earlier build-phase output) —
all pass.

## Manifest Coverage

| ID | Check |
|---|---|
| R1 | `_resolveRepoRoot()` present in `lib.mjs`; manual subdirectory-invocation test confirmed resolution to git top-level, not the subdirectory |
| R2 | `check-pending-setup.mjs` imports `repoRoot` from `lib.mjs`; `check-setup-complete.mjs` and `bin/agentsmyth.mjs` each carry a documented duplicate resolver |
| R3 | `grep -rn "existsSync(join(repoRoot, 'workflow'))" src/workflow/validators/` returns zero matches outside `lib.mjs` and the two deliberately-kept usages (`check-constraint-conflicts.mjs`, `check-lifecycle.mjs`'s `consumerWf`) |
| R4 | `repo-profile.schema.yaml`'s `mode` is an enum; `packages`/`workspace_root`/`sibling_repos` present; 5 hand-written fixtures (3 valid modes, 2 negative) all validated as expected |
| R5 | `target_repo` present in `artifact-frontmatter.schema.yaml`; `resolveGitCwd()` in `lib.mjs`; passthrough confirmed against this repo's real state |
| RI1 | `npm run validate` passes with this repo's actual (no-`mode`) `repo-profile.yaml`, at every phase boundary and again fresh at test time |
| RI2 | Manual cross-check: all 3 non-`lib.mjs` call sites (Phase 2) resolve the same root as `lib.mjs` for a subdirectory invocation |
| RI3 | Manual: non-git temp directory (`/private/tmp/.../fresh-test/`) falls back to `process.cwd()` without throwing |
| RI4 | Full suite (build/validate/violations:test) confirmed passing after every one of the 5 build phases, individually — see task artifact's Phase Completion Log |
| RI5 | `CLAUDE.md`'s "Repo-root resolution (WP-R5 T5.2)" bullet and `repo-mental-map.md`'s "Repo-Root Resolution (WP-R5)" section both present; `check-domain-placeholders` confirms no stale references |

## Manual QA

**Scenario: backward-compat theorem (RI1)**
- Environment: this repo's actual `workflow/config/repo-profile.yaml` — no `mode` field set
- Steps: `node -e "import('./src/workflow/validators/lib.mjs').then(m => console.log(m.repoRoot))"`
- Expected: resolves to this repo's actual root, identical to pre-change `process.cwd()` behavior
- Result: confirmed — `/Users/jeelvankhede/Work/agentsmyth`, matching `process.cwd()` exactly

**Scenario: subdirectory invocation (R1, the actual bug this phase fixes)**
- Environment: same repo, invoked from `src/workflow/skills/` instead of the repo root
- Steps: `cd src/workflow/skills && node -e "import('../validators/lib.mjs').then(m => console.log(m.repoRoot))"`
- Expected: still resolves to the repo root, not `src/workflow/skills/`
- Result: confirmed — resolved to `/Users/jeelvankhede/Work/agentsmyth`

**Scenario: fresh non-git directory fallback (RI3)**
- Environment: a directory with no `.git` (`/private/tmp/.../fresh-test/`)
- Steps: import `lib.mjs` from that cwd
- Expected: falls back to `process.cwd()` without throwing (git's "not a git repository" error caught, not propagated)
- Result: confirmed — `repoRoot` equaled the fresh directory's own path; git's stderr message appeared but did not crash the process

**Scenario: `repo-profile.schema.yaml` — 3 modes + 2 negative cases (R4)**
- Steps: hand-written fixtures for `single-repository` (no new fields), `monorepo` (with `packages`), `polyrepo-member` (with `workspace_root` + `sibling_repos`), an invalid `mode` value, and a `sibling_repos` entry missing its required `path`
- Expected: first 3 valid, last 2 rejected with a specific error naming the field
- Result: all 5 exactly as expected — see review artifact's Findings for the full transcript

**Scenario: `resolveGitCwd()` passthrough (R5)**
- Steps: called with no `target_repo`; called with `target_repo` set against this repo's actual (non-`polyrepo-member`) profile
- Expected: both return `repoRoot` unchanged
- Result: confirmed, both cases

## Generated Output Evidence

- `dist/workflow-bundle.md` — regenerated at every phase (`npm run build`)
- `workflow/schemas/repo-profile.schema.yaml`, `workflow/schemas/artifact-frontmatter.schema.yaml`
  — synced from `src/workflow/schemas/` at every phase
- `validators/lib.mjs` (setup-time copy) — regenerated; confirmed `check-setup-complete.mjs`
  (also setup-time-copied) does NOT import the copy, per its documented reason (Phase 2)

## Findings

None new at test phase. Review's two named residual risks (no real polyrepo fixture in this
repo; 3 independent root-resolution copies with no drift-detection) stand — not resolved here,
not hidden either.

## Skipped Checks

- **True end-to-end polyrepo scenario** (a real `workspace_root` pointing at an actual parent
  directory containing multiple git checkouts) — not run. No such fixture exists in this repo
  (single-repo-shaped, by design — see brief's Non-Goals), and constructing one purely to
  exercise this pass was explicitly out of scope. Risk: the `workspace_root` → `sibling_repos` →
  `resolveGitCwd()` chain is verified at the unit/function level and by code inspection, not by
  an actual multi-repo run. Owner: whoever first configures a real polyrepo-member repo with this
  code — should report back if the chain doesn't work as designed.
- **`bin/agentsmyth.mjs`'s `init --system` full install flow** — not re-run end-to-end during
  this pass (it was verified in WP-R2's own verify artifact; T5.2 only touched the `check`
  subcommand path within this file, documented and isolated from `init`'s own logic in the task
  artifact's Implementation Log). Risk: low — the two code paths (`check` vs `init`) share no
  mutated state, confirmed by inspection during Phase 2.

## Architecture Notes

Same as review artifact. No new findings during the test pass.

## Sign-Off

All automated checks pass, re-run fresh at test time, not carried over. Both skipped items are
genuinely unexercisable without a real polyrepo fixture this repo doesn't have — named plainly,
not glossed over, consistent with the review's own residual-risk framing. Ready to ship.
