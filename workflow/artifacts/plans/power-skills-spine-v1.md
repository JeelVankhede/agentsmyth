---
slug: power-skills-spine
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-10T07:20:00Z
updated: 2026-07-10T07:45:00Z
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - R7
  - RI1
  - RI2
  - RI3
  - RI4
  - RI5
  - RI6
  - RI7
upstream:
  - workflow/artifacts/briefs/power-skills-spine-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: approved
---

# Power Skills — Invariant Spine (WP-R4 Wave 0+1) - Plan

## Summary

Ships the smallest complete, independently shippable slice of WP-R4: the `skill_scoring` /
`skill_trigger_log` scoring infrastructure (Wave 0) and the 7 gate-bound invariant-spine skills
(Wave 1) — `waiver-completeness-check`, `coverage-tracer`, `evidence-auditor`, `scope-fence`,
`verify-manifest-coverage`, `skipped-check-accountant`, `release-readiness-gate` — plus their 8
validators and negative fixtures. Six build phases execute in dependency order (schema →
skills → wiring → validators → fixtures → closure). Each phase must pass
`npm run build && npm run validate && npm run violations:test` before the next begins (RI4-style
gate, mirroring the `system-level-install` precedent in this repo).

**Phase gate check passed before writing this plan:**
`node src/workflow/validators/check-lifecycle.mjs --phase plan --slug power-skills-spine` → ok

## Inputs

- Brief: `workflow/artifacts/briefs/power-skills-spine-v1.md` — status `ready-for-next-phase`, user-approved.
- Active manifest IDs: R1–R7, RI1–RI7, A1–A2 (Q1–Q2 resolved, non-blocking).
- Branch: `feat/wp-r4-power-skills-spine`, already created off `feat/system-level-install` (working tree clean at Think time).
- Real precedent inspected: `workflow/artifacts/plans/system-level-install-v1.md` — same repo, same "one plan, multi-phase, strict dependency, gate-per-boundary" shape; followed here for consistency.
- `src/workflow/schemas/agent-behavior.schema.yaml` root has `additionalProperties: false` (line 5) — confirmed by inspection; `skill_scoring` must be an explicit typed property (RI6).
- `src/workflow/schemas/artifact-frontmatter.schema.yaml` root has `additionalProperties: false` — confirmed by inspection; `skill_trigger_log` must be an explicit typed optional property (RI7).
- `scripts/validate-template.mjs` currently invokes exactly 2 validators via a hardcoded `['node', [path]]` array (`check-starter-blocks.mjs`, `check-lifecycle.mjs`) — new validators are registered by extending this array, not by inventing a discovery mechanism.
- `test/run-violation-tests.mjs` currently has a hardcoded `fixtures` array of 4 entries (`a`–`d`), each invoking `check-artifacts.mjs --dir <fixture-dir>` — new validators need their own invocation lines in this runner (it currently only calls `check-artifacts.mjs`), since semantic checks like waiver-completeness or scope-fence are new logic, not something `check-artifacts.mjs`'s structural walk already does.
- `src/adapters/**` confirmed to contain only generic per-tool gate shims referencing `workflow/router.md` / `workflow/agent-behavior.yaml` — no per-skill enumeration exists, so RI4 (no adapter changes) is a zero-risk claim, not an assumption.

## Requirement Coverage

| Manifest ID | Covered by phases | Owning phase |
|---|---|---|
| R1 | Phase 1 | Phase 1 |
| R2 | Phase 1 | Phase 1 |
| R3 | Phase 2 | Phase 2 |
| R4 | Phase 3 | Phase 3 |
| R5 | Phase 4 | Phase 4 |
| R6 | Phase 5 | Phase 5 |
| R7 | Phase 6 | Phase 6 |
| RI1 | Phase 4 | Phase 4 |
| RI2 | Phase 2 | Phase 2 |
| RI3 | Phase 6 | Phase 6 |
| RI4 | Phase 6 (verified; true throughout — no adapter file is ever touched) | Phase 6 |
| RI5 | Phase 1 (branch/slug established at Think; reconfirmed at each phase boundary) | Phase 1 |
| RI6 | Phase 1 | Phase 1 |
| RI7 | Phase 1 | Phase 1 |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `src/workflow/schemas/agent-behavior.schema.yaml` | modify | R1, RI6 | add `skill_scoring` as explicit typed property (optional, additive) |
| `src/workflow/agent-behavior.yaml` | modify | R1 | add `skill_scoring` block: `signals`, `complexity_score.weights`, empty `triggers: {}` (no Wave-1 skill is scored; populated when Wave 3 lands) |
| `src/workflow/schemas/artifact-frontmatter.schema.yaml` | modify | R2, RI7 | add `skill_trigger_log` as explicit typed optional array property |
| `src/workflow/skills/waiver-completeness-check/SKILL.md` + `references/*.md` | new | R3, RI2 | Category A1 skill |
| `src/workflow/skills/coverage-tracer/SKILL.md` + `references/*.md` | new | R3, RI2 | Category A2 skill |
| `src/workflow/skills/evidence-auditor/SKILL.md` + `references/*.md` | new | R3, RI2 | Category A3 skill |
| `src/workflow/skills/scope-fence/SKILL.md` + `references/*.md` | new | R3, RI2 | Category B3 skill |
| `src/workflow/skills/verify-manifest-coverage/SKILL.md` + `references/*.md` | new | R3, RI2 | Category B5 skill (T4.1) |
| `src/workflow/skills/skipped-check-accountant/SKILL.md` + `references/*.md` | new | R3, RI2 | Category B7 skill |
| `src/workflow/skills/release-readiness-gate/SKILL.md` + `references/*.md` | new | R3, RI2 | Category B8 skill |
| `src/workflow/skills/README.md` | modify | R3 | add 7 new rows to the Power Skills table |
| `src/workflow/skills/lifecycle-think/SKILL.md` | modify | R4 | add `waiver-completeness-check` to What To Load + Exit Gate |
| `src/workflow/skills/lifecycle-plan/SKILL.md` | modify | R4 | add `waiver-completeness-check`, `coverage-tracer` |
| `src/workflow/skills/lifecycle-build/SKILL.md` | modify | R4 | add `waiver-completeness-check`, `scope-fence` |
| `src/workflow/skills/lifecycle-review/SKILL.md` | modify | R4 | add `coverage-tracer`, `evidence-auditor`, `verify-manifest-coverage` |
| `src/workflow/skills/lifecycle-test/SKILL.md` | modify | R4 | add `waiver-completeness-check`, `evidence-auditor`, `skipped-check-accountant` |
| `src/workflow/skills/lifecycle-ship/SKILL.md` | modify | R4 | add `waiver-completeness-check`, `coverage-tracer`, `evidence-auditor`, `release-readiness-gate` |
| `src/workflow/skills/lifecycle-reflect/SKILL.md` | modify | R4 | add `coverage-tracer`, `evidence-auditor` |
| `src/workflow/validators/check-waivers.mjs` | new | R5 | validates A1 |
| `src/workflow/validators/check-coverage-ledger.mjs` | new | R5 | validates A2 |
| `src/workflow/validators/check-evidence-citations.mjs` | new | R5 | validates A3 |
| `src/workflow/validators/check-scope-fence.mjs` | new | R5 | validates B3 |
| `src/workflow/validators/check-manifest-coverage.mjs` | new | R5 | validates B5 (extends `b-manifest-gap` fixture coverage) |
| `src/workflow/validators/check-skipped-accounting.mjs` | new | R5 | validates B7 |
| `src/workflow/validators/check-release-readiness.mjs` | new | R5 | validates B8 (extends `c-ready-with-blocker` fixture coverage) |
| `src/workflow/validators/check-skill-triggers.mjs` | new | R5, R1, R2 | validates the Wave-0 `skill_trigger_log` recording contract |
| `src/workflow/validators/README.md` | modify | R5 | add invocation examples for all 8 new validators |
| `scripts/validate-template.mjs` | modify | R5 | extend the validator-invocation array with 8 new entries (`AGENTSMYTH_WF=src/workflow`, matching existing pattern) |
| `test/fixtures/lifecycle-violations/e-waiver-missing-field/` | new | R6 | negative fixture for `check-waivers.mjs` |
| `test/fixtures/lifecycle-violations/f-coverage-dropped-no-waiver/` | new | R6 | negative fixture for `check-coverage-ledger.mjs` |
| `test/fixtures/lifecycle-violations/g-claim-without-evidence/` | new | R6 | negative fixture for `check-evidence-citations.mjs` |
| `test/fixtures/lifecycle-violations/j-file-outside-scope/` | new | R6 | negative fixture for `check-scope-fence.mjs` |
| `test/fixtures/lifecycle-violations/b-manifest-gap/` | modify | R6 | extend existing fixture so it also exercises `check-manifest-coverage.mjs` |
| `test/fixtures/lifecycle-violations/l-skipped-check-no-risk/` | new | R6 | negative fixture for `check-skipped-accounting.mjs` |
| `test/fixtures/lifecycle-violations/c-ready-with-blocker/` | modify | R6 | extend existing fixture so it also exercises `check-release-readiness.mjs` |
| `test/fixtures/lifecycle-violations/n-triggered-skill-unlogged/` | new | R6 | negative fixture for `check-skill-triggers.mjs` |
| `test/run-violation-tests.mjs` | modify | R6 | register 6 new fixture entries + extend 2 existing entries' expected-validator coverage |

Fixture letters `h`, `i`, `k`, `m` are intentionally unused in this chain — they are reserved (in the Notion spec) for Wave 2 skills (`requirement-phase-mapper`, `plan-assumption-verifier`, `verification-matrix-builder`, `follow-up-owner-assigner`) that are out of scope here. No collision risk if the Wave 2–4 follow-up brief claims them later.

## Source-of-Truth Strategy

No external source-of-truth update is required for this Build/Review/Test/Ship chain — all changes are self-contained repository files (schemas, skills, validators, fixtures, docs). The Notion spike page and roadmap page were already updated to `dev-ready` status during this session's Think-adjacent prep work, ahead of this Plan artifact; no further Notion write is owed by this chain. `workflow/config/source-of-truth.yaml` confirms `mode: optional`, `default_required: false` — consistent with "no update required."

## Approach

Each phase is self-contained and leaves the repo in a passing state (`npm run build && npm run validate && npm run violations:test` all exit 0) before the next begins, mirroring the `system-level-install` precedent's enforcement pattern.

Phase 1 is the contract-setting phase — both schema amendments must land before any skill or validator references the new shapes. Phases 2–4 (skill authoring, phase-file wiring, validator implementation) touch disjoint file sets (`src/workflow/skills/<new-dir>/**`, `src/workflow/skills/lifecycle-*/SKILL.md`, `src/workflow/validators/*.mjs` respectively) and have no strict inter-dependency on each other's *content* — only Phase 3 needs the skill *names* from Phase 2 (not their full content) to write correct citations. A single agent executes them sequentially for reviewability; `dispatch-subagents` could parallelize Phases 2–4 under independent file ownership if desired, but that is not required by this plan.

Phase 5 (fixtures) depends on Phase 4 (validators must exist and have defined rejection behavior before a fixture can be authored against them). Phase 6 is closure: full-suite verification, no-regression confirmation on the 4 existing fixtures, and confirmation that RI3/RI4/RI5 hold.

**Enforcement pattern (mirrors `system-level-install`):** after every phase, run:
```
npm run build && npm run validate && npm run violations:test
```
Do not proceed to the next phase if any command exits non-zero.

## Phases

### Phase 1 — Schema & scoring-infra foundation (R1, R2, RI5, RI6, RI7)

**Manifest IDs:** R1, R2, RI5, RI6, RI7

**Touches:**
- `src/workflow/schemas/agent-behavior.schema.yaml`
- `src/workflow/agent-behavior.yaml`
- `src/workflow/schemas/artifact-frontmatter.schema.yaml`

**Work:**
1. In `agent-behavior.schema.yaml`, add an optional top-level `skill_scoring` property (object) with sub-schema: `signals` (object of named signal definitions: `source`, `type`), `complexity_score.weights` (object of numeric weight/cap fields), `triggers` (object, string values — empty `{}` is valid; not required to be non-empty).
2. In `agent-behavior.yaml`, add the `skill_scoring` block per the resolved Notion spec §5 shape: `version: 1`, `signals` (files_touched, ri_count, touches_protected, touches_contract, touches_generated, new_surface, task_class), `complexity_score.weights`, and `triggers: {}` — deliberately empty, since every Wave-1 skill is gate-bound and none has a scoring predicate. A comment notes triggers populate when Wave 2–4 lands.
3. In `artifact-frontmatter.schema.yaml`, add an optional top-level `skill_trigger_log` property (array), item shape: `skill` (string), `signals` (object, free-form), `decision` (enum `ran`/`skipped`), `reason` (string).
4. Confirm branch/slug (RI5): `git branch --show-current` = `feat/wp-r4-power-skills-spine`; this plan's `slug: power-skills-spine` matches the brief.
5. Run `npm run build && npm run validate && npm run violations:test`.

**Exit gate:**
- `agent-behavior.schema.yaml` defines `skill_scoring` as an explicit property (not inside `extensions`), and it is not in the root `required` list (additive/optional).
- `agent-behavior.yaml` contains a `skill_scoring` block with `signals`, `complexity_score.weights`, and `triggers: {}`.
- `artifact-frontmatter.schema.yaml` defines `skill_trigger_log` as an explicit optional array property with the `skill`/`signals`/`decision`/`reason` item shape.
- `npm run build && npm run validate && npm run violations:test` all exit 0 — confirms the schema amendment does not break any existing artifact (4 currently in `workflow/artifacts/**`).

---

### Phase 2 — Author the 7 Wave-1 skill directories (R3, RI2)

**Manifest IDs:** R3, RI2

**Touches:**
- `src/workflow/skills/waiver-completeness-check/` (new)
- `src/workflow/skills/coverage-tracer/` (new)
- `src/workflow/skills/evidence-auditor/` (new)
- `src/workflow/skills/scope-fence/` (new)
- `src/workflow/skills/verify-manifest-coverage/` (new)
- `src/workflow/skills/skipped-check-accountant/` (new)
- `src/workflow/skills/release-readiness-gate/` (new)
- `src/workflow/skills/README.md` (modify)

**Work:**
1. For each of the 7 skills, create `SKILL.md` following the `decompose-requirements` anatomy (frontmatter: `name`, `description`; body: `## Purpose`, `## Invocation Context`, `## What To Load`, `## Inputs`, `## Refusal / Stop Conditions`, `## Workflow`, `## Exit Gate`, `## Determinism Rules`, `## Output`), using the resolved Notion spec §4 per-skill card (Purpose, Wiring, Scoring, Exit Gate assertion, Validator/Fixture) as the source content.
2. For each skill, create at minimum `references/output-schema.md` describing what the skill returns/records; add additional reference files where the spec card implies distinct sub-policies (e.g. `scope-fence` needs a reference describing the diff-vs-`touches` comparison method).
3. Every skill's `## Exit Gate` states the exact detectable failure named in its Notion spec card (e.g. `waiver-completeness-check`: "No waiver in this artifact is missing a required field; none waives an evidence-falsification").
4. Update `src/workflow/skills/README.md`'s Power Skills table with 7 new rows (skill name, purpose), keeping the existing 3-row table intact.
5. Run `npm run build && npm run validate && npm run violations:test`.

**Exit gate:**
- All 7 directories exist, each with a non-empty `SKILL.md` and non-empty `references/`.
- `SKILL.md` in each directory cites every file under its own `references/` by path (RI2 — no reference content collapsed into `SKILL.md`).
- `src/workflow/skills/README.md` lists all 7 new skills.
- `npm run build && npm run validate && npm run violations:test` all exit 0.

---

### Phase 3 — Wire skills into lifecycle phase files (R4)

**Manifest IDs:** R4

**Touches:**
- `src/workflow/skills/lifecycle-think/SKILL.md`
- `src/workflow/skills/lifecycle-plan/SKILL.md`
- `src/workflow/skills/lifecycle-build/SKILL.md`
- `src/workflow/skills/lifecycle-review/SKILL.md`
- `src/workflow/skills/lifecycle-test/SKILL.md`
- `src/workflow/skills/lifecycle-ship/SKILL.md`
- `src/workflow/skills/lifecycle-reflect/SKILL.md`

**Work:**
1. Per the Notion spec's phase mapping, add each skill to the `## What To Load` ("Load when the step requires it" tier, matching how `decompose-requirements` is already referenced from `lifecycle-think/SKILL.md`) and `## Exit Gate` (as an additional bullet naming the skill's assertion) of every phase it applies to:
   - `waiver-completeness-check` → Think, Plan, Build, Test, Ship
   - `coverage-tracer` → Plan, Review, Ship, Reflect
   - `evidence-auditor` → Review, Test, Ship, Reflect
   - `scope-fence` → Build
   - `verify-manifest-coverage` → Review
   - `skipped-check-accountant` → Test
   - `release-readiness-gate` → Ship
2. Do not alter any existing `## What To Load` or `## Exit Gate` bullet — only append.
3. Run `npm run build && npm run validate && npm run violations:test`.

**Exit gate:**
- `grep -l waiver-completeness-check src/workflow/skills/lifecycle-{think,plan,build,test,ship}/SKILL.md` returns exactly those 5 files.
- `grep -l coverage-tracer src/workflow/skills/lifecycle-{plan,review,ship,reflect}/SKILL.md` returns exactly those 4 files.
- `grep -l evidence-auditor src/workflow/skills/lifecycle-{review,test,ship,reflect}/SKILL.md` returns exactly those 4 files.
- `grep -l scope-fence src/workflow/skills/lifecycle-build/SKILL.md`, `grep -l verify-manifest-coverage src/workflow/skills/lifecycle-review/SKILL.md`, `grep -l skipped-check-accountant src/workflow/skills/lifecycle-test/SKILL.md`, `grep -l release-readiness-gate src/workflow/skills/lifecycle-ship/SKILL.md` each return exactly one file.
- Each hit appears in both a `## What To Load` region and a `## Exit Gate` region of the matched file (manual confirmation per file).
- `npm run build && npm run validate && npm run violations:test` all exit 0.

---

### Phase 4 — Implement the 8 validators (R5, RI1)

**Manifest IDs:** R5, RI1

**Touches:**
- `src/workflow/validators/check-waivers.mjs` (new)
- `src/workflow/validators/check-coverage-ledger.mjs` (new)
- `src/workflow/validators/check-evidence-citations.mjs` (new)
- `src/workflow/validators/check-scope-fence.mjs` (new)
- `src/workflow/validators/check-manifest-coverage.mjs` (new)
- `src/workflow/validators/check-skipped-accounting.mjs` (new)
- `src/workflow/validators/check-release-readiness.mjs` (new)
- `src/workflow/validators/check-skill-triggers.mjs` (new)
- `src/workflow/validators/README.md` (modify)
- `scripts/validate-template.mjs` (modify)

**Work:**
1. Each new validator is a standalone Node ESM script using only `node:*` builtins and imports from `./lib.mjs` (no new npm dependency — RI1). Each supports a `--dir <path>` override flag (matching `check-artifacts.mjs`'s existing convention) so `test/run-violation-tests.mjs` can point it at a fixture directory.
2. `check-waivers.mjs` — walks artifacts, for each waiver block found validates all 6 `agent-behavior.yaml`-declared `waivers.required_fields` are present and non-empty.
3. `check-coverage-ledger.mjs` — for artifacts declaring a coverage ledger, confirms every active manifest ID has a row with a valid state (`covered|deferred|waived|dropped`) and a citation; `dropped` requires an accompanying waiver.
4. `check-evidence-citations.mjs` — for each claim row tagged as verified, confirms a non-empty citation field of a recognized shape (command output reference, file path, or artifact path).
5. `check-scope-fence.mjs` — compares a task artifact's `Changed Files` section against its owning plan phase's declared `Touches`; flags files outside that set without a recorded waiver.
6. `check-manifest-coverage.mjs` — compares a review artifact's declared `manifest_ids` against the diff scope it cites; flags mismatches (extends the existing `b-manifest-gap` fixture's failure mode with a dedicated validator).
7. `check-skipped-accounting.mjs` — for verify artifacts, confirms every `Skipped Checks` row and every check marked not explicitly run has `risk`, `owner`, and `blocks_ship` fields per `verification.yaml`'s `skipped_checks.required_fields`.
8. `check-release-readiness.mjs` — for ship artifacts, confirms the `Ship Status` recommendation (`ship|hold|hold-with-waiver`) is consistent with open P0/P1 findings, coverage-ledger state, and waiver presence (extends the existing `c-ready-with-blocker` fixture's failure mode with a dedicated validator).
9. `check-skill-triggers.mjs` — for any artifact containing a `skill_trigger_log`, confirms every entry has `skill`, `decision` (`ran`/`skipped`), and `reason`; this validator has no live producer to check against in this chain beyond the fixture (accepted, per brief Q2).
10. Add all 8 new `['node', ['src/workflow/validators/check-<name>.mjs']]` entries to `scripts/validate-template.mjs`'s existing invocation array, following the exact pattern already used by `check-starter-blocks.mjs` / `check-lifecycle.mjs`.
11. Update `src/workflow/validators/README.md` with an invocation example for each new validator.
12. Run `npm run build && npm run validate && npm run violations:test`.

**Exit gate:**
- All 8 validator files exist under `src/workflow/validators/`, each importing no module outside `node:*` and `./lib.mjs` (`git grep -n "^import" src/workflow/validators/check-{waivers,coverage-ledger,evidence-citations,scope-fence,manifest-coverage,skipped-accounting,release-readiness,skill-triggers}.mjs` shows only `node:` and relative imports).
- `scripts/validate-template.mjs`'s invocation array contains all 8 new entries.
- `npm run validate` output shows all 8 new validators executing (each prints its own invocation line, matching the existing `check-starter-blocks` / `check-lifecycle` console pattern).
- `npm run build && npm run validate && npm run violations:test` all exit 0 (no fixtures yet exist to reject, so this confirms the validators run clean against the current, conforming artifact tree).

---

### Phase 5 — Negative fixtures + violation-test wiring (R6)

**Manifest IDs:** R6

**Touches:**
- `test/fixtures/lifecycle-violations/e-waiver-missing-field/` (new)
- `test/fixtures/lifecycle-violations/f-coverage-dropped-no-waiver/` (new)
- `test/fixtures/lifecycle-violations/g-claim-without-evidence/` (new)
- `test/fixtures/lifecycle-violations/j-file-outside-scope/` (new)
- `test/fixtures/lifecycle-violations/b-manifest-gap/` (modify — extend)
- `test/fixtures/lifecycle-violations/l-skipped-check-no-risk/` (new)
- `test/fixtures/lifecycle-violations/c-ready-with-blocker/` (modify — extend)
- `test/fixtures/lifecycle-violations/n-triggered-skill-unlogged/` (new)
- `test/run-violation-tests.mjs` (modify)

**Work:**
1. Author each new fixture as a minimal artifact tree under its own directory, matching the shape of existing fixtures `a`–`d` (a small `.md` artifact file with the one specific violation, otherwise conforming).
2. Extend `b-manifest-gap` and `c-ready-with-blocker` fixtures' assertions to also be checked by the new `check-manifest-coverage.mjs` / `check-release-readiness.mjs` validators respectively, without breaking their existing role against `check-artifacts.mjs`.
3. In `test/run-violation-tests.mjs`, add 6 new `{id, dir, description}` entries (`e`, `f`, `g`, `j`, `l`, `n`) and extend the `b`/`c` entries (or add a second invocation) to also run the new corresponding validator against the same fixture directory — following the existing `spawnSync` + non-zero-exit pattern exactly.
4. Run `npm run build && npm run validate && npm run violations:test`.

**Exit gate:**
- `npm run violations:test` reports `[PASS]` for all 10 fixture checks (`a`, `b` ×2, `c` ×2, `d`, `e`, `f`, `g`, `j`, `l`, `n`) and 0 `[GAP]` lines.
- The 4 pre-existing fixtures (`a`–`d`) still pass against their original validator (no regression).
- `npm run build && npm run validate` both exit 0.

---

### Phase 6 — Closure: full verification + no-regression confirmation (R7, RI3, RI4)

**Manifest IDs:** R7, RI3, RI4

**Touches:** none (verification-only phase; no source files changed).

**Work:**
1. Run `npm run build` — confirm `dist/workflow-bundle.md` contains FILE-marker blocks for all 7 new skill directories; confirm `workflow/schemas/` contains the updated `agent-behavior.schema.yaml` and `artifact-frontmatter.schema.yaml` (build-synced copies match `src/workflow/schemas/`).
2. Run `npm run validate` — confirm 0 errors across the full template/example/adapter validation chain.
3. Run `npm run violations:test` — confirm 0 `[GAP]` lines across all fixtures.
4. Confirm RI4: `git diff --stat main...HEAD -- src/adapters/` (or equivalent against the branch point) returns no output — no adapter file was touched anywhere in this chain.
5. Record command outputs as evidence in the Build task artifact's `Command Results` section.

**Exit gate:**
- `dist/workflow-bundle.md` contains 7 new FILE-marker blocks (one per new skill directory).
- `workflow/schemas/agent-behavior.schema.yaml` and `workflow/schemas/artifact-frontmatter.schema.yaml` match their `src/workflow/schemas/` counterparts post-build.
- `npm run build && npm run validate && npm run violations:test` all exit 0, current-turn output cited.
- `git diff --stat` against the branch point shows zero files under `src/adapters/`.

## Dependency Order

```
Phase 1 (R1, R2, RI5, RI6, RI7)  ← must complete first: skill_scoring + skill_trigger_log
  │                                  schema shapes must exist before anything references them
Phase 2 (R3, RI2)                ← depends on Phase 1: skill anatomy may reference skill_trigger_log
  │                                  in its Output section
Phase 3 (R4)                     ← depends on Phase 2: needs the 7 skill names/paths to cite
  │
Phase 4 (R5, RI1)                ← no strict content dependency on Phase 2/3, but sequenced after
  │                                  for single-agent reviewability; validators check artifact
  │                                  shape, not skill file content
Phase 5 (R6)                     ← depends on Phase 4: fixtures are authored against validators
  │                                  that must already exist and have defined rejection behavior
Phase 6 (R7, RI3, RI4)           ← depends on Phase 5: closure verification needs the full fixture
                                     set in place to confirm zero regressions
```

Phases 2–4 have no strict inter-dependency on each other's *content* and could be parallelized via `dispatch-subagents` under independent file ownership (`src/workflow/skills/<new-dir>/**` vs. `src/workflow/skills/lifecycle-*/SKILL.md` vs. `src/workflow/validators/*.mjs`) if Build chooses to; this plan does not require it — default execution is sequential, one phase = one reviewable unit, matching the `system-level-install` precedent.

## Branch Strategy

- **Branch:** `feat/wp-r4-power-skills-spine` — already created off `feat/system-level-install` (7 commits ahead of `main`, unmerged), per the branch decision resolved with the user in this session (brief Q1).
- One commit per phase boundary at minimum; commit only after the full verification suite (`npm run build && npm run validate && npm run violations:test`) passes for that phase.
- Do not target `main` directly; PR review required per `repo-profile.yaml`'s `branch_policy.default_branch_commit_requires_user_approval: true`. Because the base branch (`feat/system-level-install`) is itself unmerged, this branch's eventual PR targets `feat/system-level-install` first, then rebases onto `main` once that lands (per the branch decision's stated consequence).
- `workflow/artifacts/` changes (this brief and plan, and the Build/Review/Test/Ship/Reflect artifacts to follow) are committed on this branch; they are dev-workspace dogfood artifacts, excluded from the shipped npm bundle.
- `npm run build` must run before any commit that changes `src/`.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| Phase 3's 7-skill × 7-phase-file wiring misses a phase mapping or introduces inconsistent wording across files | Medium | Medium — inconsistent gate enforcement, phase-specific drift | Phase 3 exit gate requires a `grep -l` count-match per skill against its exact declared phase-file set, not just "at least one" | Build phase | R4 |
| Schema amendment (`additionalProperties: false` roots) accidentally makes a new property required, breaking all 4 existing artifacts | Low | High — every existing artifact fails validation | Phase 1 exit gate explicitly re-runs `npm run validate` across the full existing artifact tree; new properties are additive/optional only, never added to a `required:` list | Build phase | RI6, RI7 |
| `skill_scoring`/`skill_trigger_log` ship with no real producer or consumer until Wave 3 | Known/accepted | Low — dead-but-harmless config until Wave 3 follow-up lands | Explicitly accepted by the user (brief Q2); recorded in Reflect and the roadmap follow-up item, not hidden | Ship phase (record as known limitation) | R1, R2 |
| New validators implemented but never actually wired into `scripts/validate-template.mjs` or `test/run-violation-tests.mjs`, so they silently never run | Medium | High — false confidence, validator exists but is dead code | Phase 4 exit gate requires `npm run validate` console output to show each new validator's own invocation line; Phase 5 exit gate requires an exact fixture-count match (10 checks) with 0 `[GAP]` | Build phase | R5, R6 |
| Extending `b-manifest-gap` / `c-ready-with-blocker` fixtures (rather than creating wholly new ones) accidentally weakens their original `check-artifacts.mjs` coverage | Low | Medium — regression on existing WP-R1 fixture guarantees | Phase 5 exit gate explicitly requires the 4 pre-existing fixtures still pass against their *original* validator, not just the new one | Build phase | R6 |

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | `grep -A20 "^skill_scoring:" src/workflow/agent-behavior.yaml` shows the block; `npm run validate` passes | Phase 1 | Command output is the evidence |
| R2 | `grep -A10 "skill_trigger_log" src/workflow/schemas/artifact-frontmatter.schema.yaml` shows the property; `npm run validate` passes | Phase 1 | Command output |
| R3 | `ls src/workflow/skills/{waiver-completeness-check,coverage-tracer,evidence-auditor,scope-fence,verify-manifest-coverage,skipped-check-accountant,release-readiness-gate}/SKILL.md` — all 7 exist | Phase 2 | Command output |
| R4 | Per-skill `grep -l` count-match against declared phase-file set (see Phase 3 exit gate) | Phase 3 | 7 grep commands, one per skill |
| R5 | `npm run validate` output lists all 8 new validators executing | Phase 4 | Command output |
| R6 | `npm run violations:test` reports 10/10 `[PASS]`, 0 `[GAP]` | Phase 5 | Command output |
| R7 | `npm run build && npm run validate && npm run violations:test` — all three exit 0 | Phase 6 | Command output, full chain |
| RI1 | `git diff package.json` shows no dependency change; `git grep -n "^import"` in new validators shows only `node:` / `./lib.mjs` | Phase 4 | Command output |
| RI2 | Each of 7 skill directories has non-empty `references/`; `SKILL.md` cites each file | Phase 2 | Manual inspection + grep |
| RI3 | Post-build, `dist/workflow-bundle.md` contains 7 new FILE-marker blocks; `workflow/schemas/` matches `src/workflow/schemas/` | Phase 6 | Command output + diff |
| RI4 | `git diff --stat` against branch point shows zero files under `src/adapters/` | Phase 6 | Command output |
| RI5 | `git branch --show-current` = `feat/wp-r4-power-skills-spine`; brief + plan exist with matching slug | Phase 1 | Command output |
| RI6 | `agent-behavior.schema.yaml` diff shows `skill_scoring` as an explicit property, not inside `extensions` | Phase 1 | Diff inspection |
| RI7 | `artifact-frontmatter.schema.yaml` diff shows `skill_trigger_log` as an explicit optional property | Phase 1 | Diff inspection |

## Architecture Notes

- role: Principal Engineer

- decision: **`skill_scoring.triggers` ships empty (`{}`) in this chain.** Every Wave-1 skill is gate-bound, not scored — none has a trigger predicate. Populating `triggers` with forward-references to Wave 2–4 skill names that don't exist yet would be misleading; the empty map is the honest representation of "scoring infra exists, nothing uses it yet," consistent with the accepted Q2 risk.

- decision: **`skill_scoring` and `skill_trigger_log` are explicit schema properties, not `extensions` entries.** Matches every other config file in this repo having a real schema; the `extensions: {}` escape hatch is for ad hoc per-repo data, not a spec-approved structural feature. Both are added as optional (not in `required:`) to avoid breaking any existing artifact.

- decision: **New validators are separate files, not folded into `check-artifacts.mjs`.** Preserves 1:1 traceability to the Notion-approved spec's naming (brief A1). `check-artifacts.mjs` remains the generic structural/schema walker; the 7 new validators are semantic checks layered on top, each independently invocable with `--dir` for fixture testing — same shape as `check-artifacts.mjs` already supports.

- decision: **Phases 2–4 are content-independent but executed sequentially by default.** `dispatch-subagents` parallelization is available (independent file ownership across skill dirs / phase SKILL.md files / validator files) but not mandated — this plan optimizes for reviewability of one phase = one commit over wall-clock speed, matching the `system-level-install` precedent's choice.

- constraint: **Neither schema amendment may add a `required` field.** Both `agent-behavior.schema.yaml` and `artifact-frontmatter.schema.yaml` roots have `additionalProperties: false`; every existing artifact and config file must continue validating unchanged after Phase 1. This is checked explicitly, not assumed.

- constraint: **No adapter file may be touched.** Confirmed by inspection (RI4) that adapters don't enumerate skills; touching one would be an unrequested scope expansion and is explicitly checked at Phase 6, not just assumed absent.

- tradeoff: **Extending `b-manifest-gap` / `c-ready-with-blocker` instead of creating two wholly new fixtures** (per the original Notion spec's "reuse/extend" note for B5/B8) saves fixture-authoring duplication but requires Phase 5 to explicitly verify no regression on those fixtures' original role — a slightly higher-diligence bar than a from-scratch fixture would need.

- tradeoff: **Wave 0 ships with a synthetic-only consumer.** Accepted (Q2) in exchange for not re-touching `agent-behavior.yaml`'s and `artifact-frontmatter.schema.yaml`'s top-level shape a second time when Wave 3 lands.

- downstream: **Waves 2–4 (15 more skills) are explicitly out of scope** and become a separate brief once the real-task drift-measurement checkpoint (spec §8) clears — Reflect must record this as a tracked follow-up, not let it silently stop after Ship.

- downstream: **Build must run `npm run build` before any `src/` commit** (already required by CLAUDE.md); this plan makes it a hard per-phase gate, not an end-of-chain afterthought.

## Open Questions

None. Q1–Q2 from the brief are both resolved and non-blocking. Plan is unblocked.

## Exit Gate

- [x] Every active R and RI is mapped to exactly one owning phase.
- [x] Every phase has a binary, falsifiable exit gate.
- [x] Dependency order is explicit (Phase 1 → 2 → 3 → 4 → 5 → 6), with the Phase 2–4 parallelization option noted but not required.
- [x] All risks have mitigations.
- [x] Verification plan covers every R and RI with named commands or named inspection targets — no vague "test it" phrasing.
- [x] Source-of-truth handling explicit: none required, Notion already updated ahead of this chain.
- [x] Branch strategy defined (`feat/wp-r4-power-skills-spine` off `feat/system-level-install`; no direct push to `main`).
- [x] No open questions; no blockers.
- [x] User approved this plan document ("Continue, implement all phases and then wait for me to review", 2026-07-10). `status` set to `ready-for-next-phase`, `user_checkpoint: approved`.
