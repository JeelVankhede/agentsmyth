---
slug: wp-r5-repo-shape-taxonomy
version: 1
artifact: plan
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
  - workflow/artifacts/briefs/wp-r5-repo-shape-taxonomy-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# WP-R5 T5.2 — Repo-Shape Root Resolution — Plan

## Summary

Fixes the `process.cwd()`-as-root-assumption baked into 5 independent places (`lib.mjs`'s
`repoRoot`, `check-assumptions.mjs`/`check-artifacts.mjs`'s duplicated logic, `check-setup-
complete.mjs`, `check-pending-setup.mjs`, `bin/agentsmyth.mjs`), and adds the two schema changes
(`repo-profile.schema.yaml`'s `mode` enum + monorepo/polyrepo fields, `artifact-frontmatter.
schema.yaml`'s `target_repo`) confirmed in the WP-R5 Notion spike. Five build phases execute in
dependency order (R1 → R2 → R3 → R4 → R5). Each phase must pass
`npm run build && npm run validate && npm run violations:test` before the next begins (RI4).

**Phase gate check passed before writing this plan:**
`AGENTSMYTH_HOME=src/workflow node src/workflow/validators/check-lifecycle.mjs --phase plan --slug wp-r5-repo-shape-taxonomy` → ok

## Inputs

- Brief: `workflow/artifacts/briefs/wp-r5-repo-shape-taxonomy-v1.md` — status `ready-for-next-phase`
- Active manifest IDs: R1–R5, RI1–RI5, A1–A3 (Q1–Q5 all resolved)
- Notion spike (39a972bd) — fully resolved 2026-07-12, cited per requirement below
- Branch: `feat/wp-r5-repo-shape-taxonomy`, stacked on `feat/power-skill-sandbox` (upstream
  unset per this session's established fix for the `branch.autoSetupMerge` direct-push bug)
- `src/workflow/validators/lib.mjs` lines 6, 11–12, 34–36, 216–221 — the current `repoRoot`
  constant and `trackedFiles()` implementation this plan modifies
- `src/workflow/schemas/repo-profile.schema.yaml` — current `repository.mode: const:
  single-repository`, no `packages`/`workspace_root`/`sibling_repos` fields
- `src/workflow/schemas/artifact-frontmatter.schema.yaml` — current schema, no `target_repo` field

## Requirement Coverage

| Manifest ID | Covered by phases | Owning phase |
|---|---|---|
| R1 | Phase 1 | Phase 1 |
| R2 | Phase 2 | Phase 2 |
| R3 | Phase 3 | Phase 3 |
| R4 | Phase 4 | Phase 4 |
| R5 | Phase 5 | Phase 5 |
| RI1 | Phase 1 (verified every phase) | Phase 1 |
| RI2 | Phase 2 | Phase 2 |
| RI3 | Phase 1 | Phase 1 |
| RI4 | All phases (gate at each boundary) | Phase 1–5 each |
| RI5 | Phase 5 | Phase 5 |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `src/workflow/validators/lib.mjs` | modify | R1, R5 | consolidated root-resolution order (R1); parameterized `trackedFiles()` + new `resolveGitCwd()` (R5) |
| `src/workflow/validators/check-setup-complete.mjs` | modify | R2 | own `repoRoot = process.cwd()` replaced with shared resolution |
| `src/workflow/validators/check-pending-setup.mjs` | modify | R2 | same |
| `bin/agentsmyth.mjs` | modify | R2 | own `const cwd = process.cwd()` replaced with shared resolution |
| `src/workflow/validators/check-assumptions.mjs` | modify | R3 | duplicated `_wf`-detection removed, uses `dataPath()` |
| `src/workflow/validators/check-artifacts.mjs` | modify | R3 | same |
| `src/workflow/schemas/repo-profile.schema.yaml` | modify | R4 | `mode` const → enum; new `packages`, `workspace_root`, `sibling_repos` fields |
| `src/workflow/schemas/artifact-frontmatter.schema.yaml` | modify | R5 | new optional `target_repo` field |
| `src/workflow/validators/check-lifecycle.mjs` | modify | R5 | staged-diff `git diff --cached` call parameterized to accept resolved git-cwd |
| `CLAUDE.md` | modify | RI5 | three-world table gains root-resolution note; `mode` values documented |
| `docs/knowledge-map/repo-mental-map.md` | modify | RI5 | resolver section updated with the consolidated root-detection algorithm |

## Source-of-Truth Strategy

**Generated outputs affected:** `dist/workflow-bundle.md`, `validators/` (root, setup-time copy),
`workflow/schemas/` (build-synced dev workspace copy) — all build products of `npm run build`.
Every phase in this plan touches `src/workflow/`, so every phase requires a rebuild before its
commit (per `CLAUDE.md` golden rule 2).

**Setup-time validator copy:** `check-setup-complete.mjs` is one of the two validators copied
verbatim into `validators/` (root) at build time (per `scripts/build-bundle.mjs`'s
`copyFile('src/workflow/validators/${name}', 'validators/${name}')` step). Phase 2's change to
this file must be rebuilt for the copy to stay current — `check-pending-setup.mjs` is not
currently in that copy list (per the brief's R2 acceptance note); confirm this at Phase 2 and
update the copy list if the file is meant to ship too.

**Schema source of truth:** `src/workflow/schemas/` (source) → `workflow/schemas/` (build-synced
dev workspace copy). Phase 4's two schema field additions require a rebuild to sync.

**No Notion or external source-of-truth items beyond the already-cited spike page.**

## Assumptions Verified

| Assumption ID | Status | Evidence / Question |
|---|---|---|
| A1 | evidence-backed | `lib.mjs` already shells out to `git` (`trackedFiles()`'s `git ls-files`, `check-lifecycle.mjs`'s `git diff --cached`) — `git` on PATH is an existing, not new, dependency. Adding `git rev-parse --show-toplevel` introduces no new external tool. |
| A2 | evidence-backed | `lib.mjs`'s `_expandTilde()` (used for `definitions_root`/`AGENTSMYTH_HOME`) is a generic string-prefix check (`p.startsWith('~/')`), not specific to those two fields — directly reusable for `workspace_root` with no modification. |
| A3 | evidence-backed | `repo-profile.schema.yaml`'s current `mode` field is `const: single-repository` — every existing valid profile necessarily has this exact value already; widening to `enum: [single-repository, monorepo, polyrepo-member]` cannot invalidate any profile that validated before. |

## Approach

Land the resolution-order fix first (Phase 1) since every other requirement either depends on it
directly (R2 reuses the same logic) or is independently testable against it (R4/R5's schema
fields don't require R1 to exist, but R5's `resolveGitCwd()` needs R4's fields to exist — hence
R4 before R5). Phase 3's cleanup is independent and could technically run anywhere, but is
sequenced after R1/R2 so all root-resolution call sites are touched in one contiguous block
before moving to schema work.

## Phases

### Phase 1 — Consolidated root resolution in lib.mjs (R1, RI1, RI3, RI4)

**Manifest IDs:** R1, RI1, RI3, RI4

**Touches:**
- `src/workflow/validators/lib.mjs` — replace the bare `export const repoRoot = process.cwd();`
  with a resolution function applying the confirmed order: (1) `workspace_root` from
  `repo-profile.yaml` when `mode: polyrepo-member`, (2) `git rev-parse --show-toplevel`, (3)
  `process.cwd()` fallback if (2) throws (not in a git repo yet)

**Work:**
1. Add a `_resolveRepoRoot()` function above the existing `_readDefinitionsRoot()` helper, reusing
   the existing `execFileSync`/`readFileSync` imports already present in the file
2. Read `mode` and `workspace_root` from `workflow/config/repo-profile.yaml` via a minimal regex
   read (matching the existing `_readDefinitionsRoot()` pattern — no YAML parser dependency at
   this point in the file, same constraint that pattern already works around)
3. If `mode: polyrepo-member` and `workspace_root` is set, return `_expandTilde(workspace_root)`
4. Else, run `execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()`;
   return it on success
5. On `execFileSync` throwing (non-git directory), return `process.cwd()` — today's behavior,
   unchanged (RI3)
6. Replace `export const repoRoot = process.cwd();` with `export const repoRoot =
   _resolveRepoRoot();`
7. Run `npm run build` then `npm run validate` then `npm run violations:test` with no
   `repo-profile.yaml` `mode` field set (this repo's actual state) — confirms RI1 backward-compat:
   result must be identical to pre-change, since `git rev-parse --show-toplevel` on this repo
   returns the same path `process.cwd()` already did when invoked from the repo root

**Exit gate:**
- `lib.mjs` no longer contains the bare `process.cwd()` assignment for `repoRoot`
- `npm run build && npm run validate && npm run violations:test` all exit 0 with this repo's
  actual `repo-profile.yaml` (no `mode` field) — RI1 evidence
- Manually invoking a validator from a subdirectory (e.g. `cd src/workflow/skills && node
  ../../../src/workflow/validators/check-lifecycle.mjs` with appropriate env) resolves the same
  root as invoking from the repo root — documented in the task artifact
- Running `agentsmyth`-style validation in a fresh temp directory with no `.git` yet does not
  throw — falls back to `process.cwd()` (RI3 evidence)

---

### Phase 2 — Apply resolution to the 3 non-lib.mjs call sites (R2, RI2, RI4)

**Manifest IDs:** R2, RI2, RI4

**Touches:**
- `src/workflow/validators/check-setup-complete.mjs` — replace its own `const repoRoot =
  process.cwd();`
- `src/workflow/validators/check-pending-setup.mjs` — replace its own `const repoRoot =
  process.cwd();`
- `bin/agentsmyth.mjs` — replace `const cwd = process.cwd();`

**Work:**
1. Check whether each of the three files can import `lib.mjs`'s new `_resolveRepoRoot` logic
   directly. `check-setup-complete.mjs` and `check-pending-setup.mjs` are setup-time validators
   copied standalone into consumer `validators/` — check whether `lib.mjs` is copied alongside
   them (per `build-bundle.mjs`'s copy list) before assuming the import is available
2. Where importable, import and call the shared resolver
3. Where not importable (standalone copy without `lib.mjs` available), duplicate the minimal
   3-step resolution logic locally with a comment cross-referencing `lib.mjs` as source of truth
   — same pattern this plan's Phase 3 removes for `_wf` detection, so document *why* this
   duplication is kept here (standalone shipping constraint) rather than repeating the mistake
   silently
4. `bin/agentsmyth.mjs` almost certainly can just call into the built/dev-workspace validator
   logic directly or re-derive inline — confirm the simplest correct approach during
   implementation, record the choice in the task artifact
5. Run full suite after each file change

**Exit gate:**
- All three files produce the same resolved root as `lib.mjs` given the same starting directory
  and `repo-profile.yaml` state — verified manually for at least one non-root invocation
- `npm run build && npm run validate && npm run violations:test` all exit 0
- If duplication was necessary (setup-time standalone constraint), each duplicated block carries
  a comment naming `lib.mjs` as the canonical version

---

### Phase 3 — Remove `check-assumptions.mjs`/`check-artifacts.mjs` duplication (R3, RI4)

**Manifest IDs:** R3, RI4

**Touches:**
- `src/workflow/validators/check-assumptions.mjs` — remove local `_wf`-detection block, use
  `dataPath()` from `lib.mjs` instead
- `src/workflow/validators/check-artifacts.mjs` — same

**Work:**
1. In each file, replace the local `const wf = process.env.AGENTSMYTH_WF || (existsSync(join(
   repoRoot, 'workflow')) ? 'workflow' : ['.', 'workflow'].join(''));`-style block with a direct
   `dataPath('artifacts')`-style call (confirm exact call shape needed by reading each file's
   actual usage of `wf` before changing)
2. Remove the now-unused `existsSync`/`join` imports if nothing else in the file needs them
3. Run full suite

**Exit gate:**
- `grep -rn "existsSync(join(repoRoot, 'workflow'))" src/workflow/validators/` returns zero
  matches outside `lib.mjs` itself
- `npm run build && npm run validate && npm run violations:test` all exit 0

---

### Phase 4 — Schema changes: `repo-profile.yaml` mode + fields (R4, RI4)

**Manifest IDs:** R4, RI4

**Touches:**
- `src/workflow/schemas/repo-profile.schema.yaml` — `repository.mode` const → enum; new
  `repository.packages`, `repository.workspace_root`, `repository.sibling_repos` fields

**Work:**
1. Change `mode: { const: single-repository }` to `mode: { enum: [single-repository, monorepo,
   polyrepo-member] }`
2. Add `packages: { type: array, items: { type: object, additionalProperties: false, required:
   [name, path], properties: { name: { type: string }, path: { type: string }, package_manager: {
   type: string } } } }` as an optional `repository` property
3. Add `workspace_root: { type: string }` as an optional `repository` property
4. Add `sibling_repos: { type: array, items: { type: object, additionalProperties: false,
   required: [name, path], properties: { name: { type: string }, path: { type: string }, url: {
   type: string } } } }` as an optional `repository` property
5. Decide and document (task artifact) whether `workspace_root` should be schema-conditionally
   required when `mode: polyrepo-member` (JSON Schema `if`/`then`) or left optional with the
   requirement enforced by a validator message instead — check what this repo's schema engine
   (`validateSchema` in `lib.mjs`) actually supports before committing to the conditional-required
   approach the brief's R4 acceptance criteria describes
6. Run full suite; additionally validate a hand-written fixture profile for each of the three
   `mode` values

**Exit gate:**
- Schema accepts all three `mode` values
- A `mode: single-repository` profile with no new fields validates identically to pre-change
  (no new required fields introduced for that mode)
- A `mode: polyrepo-member` profile missing `workspace_root` is rejected (per brief R4 acceptance)
  — or, if the schema engine doesn't support conditional-required, this is explicitly noted as a
  known gap in the task artifact rather than silently unenforced
- `npm run build && npm run validate && npm run violations:test` all exit 0

---

### Phase 5 — `target_repo` field + git-cwd parameterization (R5, RI4, RI5)

**Manifest IDs:** R5, RI4, RI5

**Touches:**
- `src/workflow/schemas/artifact-frontmatter.schema.yaml` — new optional `target_repo` field
- `src/workflow/validators/lib.mjs` — `trackedFiles()` gains an optional `gitCwd` parameter; new
  `resolveGitCwd(frontmatter)` function
- `src/workflow/validators/check-lifecycle.mjs` — staged-diff `git diff --cached` call
  parameterized the same way
- `CLAUDE.md`, `docs/knowledge-map/repo-mental-map.md` — RI5 doc updates

**Work:**
1. Add `target_repo: { type: string }` to `artifact-frontmatter.schema.yaml`'s optional properties
2. In `lib.mjs`, change `export function trackedFiles() { ... cwd: repoRoot ... }` to accept
   `export function trackedFiles(gitCwd = repoRoot) { ... cwd: gitCwd ... }` — default parameter
   preserves every existing zero-argument call site unchanged
3. Add `export function resolveGitCwd(frontmatter) { ... }`: returns `repoRoot` unless the active
   `repo-profile.yaml` is `mode: polyrepo-member` and `frontmatter.target_repo` is set, in which
   case joins `workspace_root` with the matching `sibling_repos[].path` (falls back to `repoRoot`
   with a console warning if `target_repo` doesn't match any `sibling_repos[].name` — do not throw,
   per this repo's evidence_policy on graceful degradation)
4. Update `check-lifecycle.mjs`'s staged-diff call to accept the same optional parameter,
   defaulting to `repoRoot`
5. Update `CLAUDE.md`'s three-world table and `docs/knowledge-map/repo-mental-map.md`'s resolver
   section (RI5)
6. Run full suite; additionally verify (manual QA, single-repo state — this repo has no real
   polyrepo-member fixture) that `resolveGitCwd()` returns `repoRoot` unchanged when
   `mode` is not `polyrepo-member`, confirming zero behavior change for every existing consumer

**Exit gate:**
- Existing single-repo/monorepo call sites (`trackedFiles()` with no argument) behave identically
  to pre-change
- `resolveGitCwd()` returns `repoRoot` unchanged whenever `mode` is not `polyrepo-member` —
  verified against this repo's own actual profile
- `check-domain-placeholders` passes (RI5 doc-currency check)
- `npm run build && npm run validate && npm run violations:test` all exit 0

## Dependency Order

R1 → R2 → R3 → R4 → R5. R2 depends on R1's resolution logic existing to reuse. R3 is independent
but sequenced after R1/R2 to keep all root-resolution touch points in one contiguous block. R5
depends on R4's schema fields (`workspace_root`, `sibling_repos`) existing before
`resolveGitCwd()` can reference them.

## Branch Strategy

- **T5.2 branch:** `feat/wp-r5-repo-shape-taxonomy` — already created, stacked on
  `feat/power-skill-sandbox` (not yet merged to `main`) per explicit user instruction to continue
  from that branch as base; upstream deliberately unset to avoid the `branch.autoSetupMerge`
  direct-push bug found twice earlier this session
- One commit per phase boundary at minimum; commit only after the full suite passes (RI4)
- Do not push without explicit request; when pushing, use `git push -u origin
  feat/wp-r5-repo-shape-taxonomy` explicitly and verify via `gh api` that it lands on the correct
  branch, not `main` — per this session's established incident-response protocol

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| `git rev-parse --show-toplevel` behaves differently across git versions/platforms | Low | Medium — root resolution silently wrong | Fallback to `process.cwd()` on any failure (RI3); this repo's own CI/dev environment is the only tested platform, documented as a known limit, not silently assumed universal | Build phase | R1, RI3 |
| Setup-time validators (`check-setup-complete.mjs`, `check-pending-setup.mjs`) can't import `lib.mjs` | Medium | Medium — forces logic duplication, a maintenance burden | Explicitly checked in Phase 2 rather than assumed; if duplication is required, comments cross-reference `lib.mjs` as source of truth | Build phase | R2 |
| JSON Schema conditional-required (`workspace_root` required only under `mode: polyrepo-member`) isn't supported by this repo's schema engine | Medium | Low — requirement becomes documentation-only, not enforced | Checked explicitly in Phase 4 before committing to the approach; gap documented in task artifact if unsupported, not silently dropped | Build phase | R4 |
| No real polyrepo-member fixture exists in this repo to exercise `resolveGitCwd()` end-to-end | High | Low — logic is unit-testable via direct function calls but not exercised via a real multi-repo scenario | Manual QA confirms zero-regression for the actual (single-repo) state; full end-to-end polyrepo QA is out of scope per the brief's Non-Goals (no live dogfooding this pass) — explicitly accepted, not hidden | Build phase | R5 |
| Backward-compat regression on this repo's own validator suite | Low | High — would break agentsmyth's own dogfooded lifecycle | `npm run validate` + `npm run violations:test` run after every phase (RI4); Phase 1's exit gate specifically re-confirms identical resolution to pre-change | Build phase | R1, RI1, RI4 |

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | `npm run build && npm run validate && npm run violations:test` all exit 0 with this repo's actual (no-`mode`) profile; manual subdirectory-invocation check documented in task artifact | Phase 1 | Command output + documented manual check |
| R2 | All three call sites resolve the same root as `lib.mjs` for a given starting directory — manual check | Phase 2 | Documented manual check |
| R3 | `grep -rn "existsSync(join(repoRoot, 'workflow'))" src/workflow/validators/` returns zero matches outside `lib.mjs` | Phase 3 | Grep evidence |
| R4 | Schema accepts all 3 `mode` values; a hand-written fixture profile per mode validates as expected | Phase 4 | Command output against fixtures |
| R5 | `resolveGitCwd()` returns `repoRoot` unchanged when `mode` is not `polyrepo-member`, verified against this repo's real profile | Phase 5 | Manual QA — documented since no real polyrepo fixture exists |
| RI1 | Phase 1's exit gate: full suite passes with this repo's actual profile, no `mode` field | Phase 1 | Command output |
| RI2 | All three non-`lib.mjs` call sites use the same resolution algorithm, confirmed via code inspection at Phase 2 | Phase 2 | Manual review, documented |
| RI3 | Fresh-directory fallback to `process.cwd()` confirmed not to throw | Phase 1 | Manual QA in a temp non-git directory |
| RI4 | `npm run build && npm run validate && npm run violations:test` all exit 0 after every phase | Every phase | Recorded per phase in the task artifact's Phase Completion Log |
| RI5 | `check-domain-placeholders` passes; `CLAUDE.md`/`repo-mental-map.md` no longer describe `repoRoot` as a bare `process.cwd()` constant | Phase 5 | `npm run validate` + manual grep |

## Architecture Notes

**This is the second application of WP-R2's precedent, not a new pattern.** `workspace_root` is
structurally identical to `definitions_root` — a config value naming an external location, with a
documented fallback order, expanded via the same `_expandTilde()` helper. Anyone who understands
WP-R2's two-root resolver already understands the shape of this change.

**Phase 1 is load-bearing.** Every other phase either directly reuses its resolution logic (Phase
2) or is independently scoped but benefits from being sequenced immediately after it (Phase 3) or
depends on schema fields that only make sense once the resolution mechanism they describe exists
(Phase 5 depends on Phase 4's fields, which describe what Phase 1's resolution mechanism reads).

**No monorepo/polyrepo fixture exists in this repo.** Every phase's verification for the
polyrepo-specific paths (`workspace_root`, `sibling_repos`, `target_repo`) is necessarily manual
QA against hand-constructed scenarios or direct function-level checks, not an end-to-end run —
this repo is single-repo-shaped and stays that way (per the brief's Non-Goals). This is a real,
accepted limit on verification depth for this pass, not an oversight.

## Open Questions

None — all resolved in the Notion spike before this plan was written (brief §Questions).

## Exit Gate

- [x] Every active R and RI is mapped to exactly one owning phase.
- [x] Every phase has a binary, falsifiable exit gate.
- [x] Dependency order is explicit and correct (R1 → R2 → R3 → R4 → R5).
- [x] All risks have mitigations, including the two genuine unknowns (setup-time import
      feasibility, schema conditional-required support) resolved by explicit in-phase checks
      rather than assumed.
- [x] Verification plan covers every R and RI with named commands or named manual QA.
- [x] Source-of-truth and generated output handling explicit (rebuild required per CLAUDE.md;
      setup-time copy-list implication flagged).
- [x] Branch strategy defined (`feat/wp-r5-repo-shape-taxonomy`, stacked per explicit instruction;
      no push without request).
- [x] RI5 doc updates woven into Phase 5.
- [x] No open questions; no blockers.
