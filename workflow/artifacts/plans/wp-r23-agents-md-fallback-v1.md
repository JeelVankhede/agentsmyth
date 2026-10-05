---
slug: wp-r23-agents-md-fallback
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-09-13
updated: 2026-09-13
manifest_ids: [R1, R2, R3, R4, R5, R6, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
upstream:
  - workflow/artifacts/briefs/wp-r23-agents-md-fallback-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
skill_trigger_log:
  - skill: domain.interface-contract-designer
    decision: ran
    reason: "Trigger `path~contract_globs OR touches_contract`; touches_contract is true per A1. Ran: the block's marker grammar and init's write rule are the contract this work adds — specified in Phase 2's exit gate rather than left to Build."
  - skill: domain.system-design-advisor
    decision: ran
    reason: "Trigger `complexity_score >= 60 OR new_surface`; score 73 and new_surface true. Ran: confirmed the single-writer boundary from the brief's architecture decision survives contact with init's existing placement code at bin/agentsmyth.mjs:891,899."
  - skill: domain.quality-gates-validator
    decision: ran
    reason: "Trigger `task_class != trivial`; class is standard. Ran: verification plan built from verification.yaml's two required commands plus a trial for RI5, which no command can prove."
  - skill: domain.data-schema-designer
    decision: skipped
    reason: "Trigger `path~schema_globs` (**/migrations/**, **/schema/**, **/*.sql, **/models/**). No planned touch matches — src/workflow/schemas/ is `schemas`, not `schema`, and no phase edits it."
  - skill: domain.ui-ux-designer
    decision: skipped
    reason: "Trigger `path~ui_globs` (**/components/**, **/views/**, **/screens/**, **/*.css, **/*.tsx, **/*.jsx, **/*.vue). No planned touch matches; this work has no UI surface."
---

# WP-R23 — Generic AGENTS.md Adapter Fallback - Plan

## Summary

Move root `AGENTS.md` from agent-driven placement (the setup skill) to mechanical placement by `init`,
wrapped in version-stamped markers that `init` matches by pattern so it can replace its own block in
place without touching anything the user wrote. Shrink the block from a duplicate of the contract to a
pointer that names the pre-commit hook. Collapse Codex's per-repo adapter row into the same block.

Six phases, sequenced so the block's content exists before the writer that emits it, and so the
cross-version replace path is proven by trial before anything is regenerated or documented.

## Inputs

- `workflow/artifacts/briefs/wp-r23-agents-md-fallback-v1.md` — approved 2026-09-13, checkpoint
  `brief-review`, `orchestration.blockers: []`.
- Manifest: R1–R6, RI1–RI7, A1–A3. Q1, Q2, Q3 all resolved in the brief.
- `workflow/config/repo-profile.yaml` — branch policy, protected paths, generated-output policy.
- `workflow/config/verification.yaml` — `npm run validate`, `npm run violations:test` required at
  review and ship.
- `workflow/config/release.yaml` — branch gate required; PR, CI, release gates all `required: false`.
- `workflow/config/source-of-truth.yaml` — `mode: optional`, `providers: []`.
- Repo state read this session: `bin/agentsmyth.mjs:826-903` (token plumbing and the two existing
  enumerated placements), `bin/agentsmyth.mjs:533,740,747-750` (`pkgVersion` availability),
  `src/assets/AGENTS.md` (2.3K, seven numbered steps, no hook mention), `src/setup/SKILL.md:163-164,189`
  (the two AGENTS.md rows and the Codex row), `src/workflow/validators/check-setup-complete.mjs:220-235`
  (`adapterPaths` and the at-least-one check), `src/adapters/claude/global-gate.md:1,16` (existing
  marker convention), `test/` (13 suites, `run-init-prepare-interop-tests.mjs` the closest harness).

## Requirement Coverage

`coverage-tracer` ledger. Every active R/RI from the brief, its state, the phase that owns completion,
and a citation.

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | P2 | covered — `init` creates-or-inserts. Cited: brief R1 acceptance; `bin/agentsmyth.mjs:891,899` as the pattern to follow. |
| R2 | P1, P2, P4 | covered — P1 supplies the marker grammar, P2 implements pattern matching, P4 proves it across versions. Cited: brief R2, both acceptance criteria. |
| R3 | P2, P4 | covered — implemented in P2, proven by byte-diff trial in P4. Cited: brief R3 acceptance. |
| R4 | P1 | covered — hook named in block content. Cited: brief R4; `src/assets/AGENTS.md` currently has no hook mention. |
| R5 | P1 | covered — block bounded to four concerns with a line-count gate. Cited: brief R5 acceptance. |
| R6 | P2, P3 | covered — write moves into `init` (P2) and out of the setup skill (P3). Cited: brief R6 acceptance. |
| RI1 | P3 | covered — single writer established; Codex row collapses. Cited: `src/setup/SKILL.md:163-164,189`. |
| RI2 | P1, P3 | covered — HTML-comment form retained (P1), documented beside the global-gate markers (P3). Cited: `src/adapters/claude/global-gate.md:1,16`. |
| RI3 | P5 | covered — `npm run build` regenerates `dist/`. Cited: CLAUDE.md golden rule 2; `repo-profile.yaml` `generated_output_policy`. |
| RI4 | P4 | covered — both configured commands run; no validator rule is added by this plan, so the mutation ratchet is unaffected. Cited: `verification.yaml` `commands`; `test/mutation-baseline.json`. |
| RI5 | P4 | covered — trial against a hand-authored `AGENTS.md`. Cited: brief RI5; `verification.yaml` `generated_output.source_only_inspection_is_not_enough`. |
| RI6 | P5 | covered — one example gains a stamped block, closing the gap rather than waiving it. Cited: brief RI6; `scripts/validate-example.mjs`. |
| RI7 | P6 | covered — CHANGELOG entry; Ship records WP-R20 and WP-R24 outstanding. Cited: brief RI7; `docs/release-checklist.md`. |

No row is `deferred`, `waived`, or `dropped`. No waivers are recorded in this plan, so
`waiver-completeness-check` has nothing to check.

## Assumptions Verified

`plan-assumption-verifier`. One row per brief `A` ID, each cross-checked against repo evidence read
this session.

| Assumption ID | Status | Evidence / Question |
|---|---|---|
| A1 | evidence-backed | `workflow/config/repo-profile.yaml` `paths.public_contracts: []` confirmed empty, while `bin/agentsmyth.mjs:891,899` writes files into consumer repos — so `init`'s write behaviour is a contract in substance that the config does not enumerate. Assumption holds as written; Plan treats the empty list as under-specified. |
| A2 | evidence-backed | `git status -sb` reports `feat/wp-r23-agents-md-fallback`, cut from `release/1.1.0` (0 commits divergence at cut). Naming matches the existing convention (`feat/wp-r22-review-council`, `feat/wp-r21-think-council`). No downstream artifact yet references the slug other than this plan. |
| A3 | evidence-backed | `workflow/config/pending-setup.yaml` PS-4, PS-5, PS-6, PS-7 all read `status: open`; PS-1..PS-3 read `resolved`. `src/workflow/router.md` §8 states intent items never gate lifecycle work. No phase in this plan reads a `tuning:` value, so the assumption has no effect on the work. |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `src/assets/AGENTS.md` | rewrite | R4, R5, RI2 | Source of the block body. Shrinks from 2.3K/seven steps to a pointer naming the hook. Existing `{{TOKEN}}` substitution is reused. |
| `bin/agentsmyth.mjs` | modify | R1, R2, R3, R6 | New placement alongside the cursor/copilot writes at 891-903. Only file in this plan that is not documentation, assets, or tests. |
| `src/setup/SKILL.md` | modify | R6, RI1, RI2 | Step 5a's two `AGENTS.md` rows removed; Step 5a.1's Codex row collapses; marker pair documented in the Step 5a.1 table beside the global-gate markers. |
| `test/run-agents-md-tests.mjs` | create | R2, R3, RI5 | New suite. Kept separate from `run-init-prepare-interop-tests.mjs`, which owns a different scenario. |
| `package.json` | modify | RI4 | One `scripts` entry for the new suite. No dependency added. |
| `.github/workflows/ci.yml` | modify | RI4 | **Added by amendment, 2026-09-13** — one step invoking the new suite. |
| `.github/workflows/release.yml` | modify | RI4 | **Added by amendment, 2026-09-13** — one line in the Verify step. |
| `examples/node-package/AGENTS.md` | create | RI6 | Closes the example-coverage gap so `validate-example.mjs` can catch a regression. `node-package` chosen over the other three: it is the example that actually represents an npm-package consumer of this CLI, and `power-skill-sandbox` is a fixture owned by `check-trigger-predicates`. |
| `dist/workflow-bundle.md`, `dist/setup-bundle.md` | regenerate | RI3 | Build product. Never hand-edited; produced by `npm run build`. |
| `CHANGELOG.md` | modify | RI7 | 1.1.0 entry gains this change. Date is **not** set here — corrected at dispatch. |

Protected paths (`.git/**`, `.env*`, `**/*secret*`) — none touched. No new runtime dependency.

## Source-of-Truth Strategy

`source-of-truth.yaml` declares `mode: optional` with `providers: []`. No provider is configured, so
no external source is authoritative and no external write is required by this work.

- **Read**: the Notion WP-R23 page is the requirement's origin and is cited in the brief's Source
  Links. It is not governing authority; on conflict the repo wins per root `AGENTS.md` Source Priority.
- **Update target**: none. The Notion work-plan page already scopes 1.1.0 to seven packages, which is
  what the user confirmed via Q3, so nothing there is stale in the direction this work would change.
- **Recorded, not actioned**: OI-87 in `workflow/artifacts/open-items.yaml` states 1.1.0 is four work
  packages. Under Q3 that under-describes the release by three. Reconciling the ledger is outside this
  work's scope and is not a phase here.
- **Status**: `not required`. No blocked handoff, no waiver.

## Approach

Four decisions shape the sequence.

**The block body is authored before the writer that emits it.** P1 rewrites `src/assets/AGENTS.md` to
final content, so P2's exit gate can assert against real bytes instead of a placeholder.

**The version stamp is read from `pkgVersion`, not hard-coded.** `bin/agentsmyth.mjs` already resolves
it (533, 740, 747-750) for the `agentsmyth_version` stamp. A repo initialised by the published 1.1.0
package gets `agentsmyth:1.1.0`; `release.yml` bumps the version itself, so nothing here pre-stamps a
version that has not shipped.

**Matching is by pattern, and that is a phase exit gate rather than a code comment.** Per Q1's accepted
caveat, a version-stamped marker matched literally makes every release append a block instead of
replacing one. P2's gate asserts the cross-version replace directly.

**`check-setup-complete.mjs` is deliberately left alone.** Its `adapterPaths` check asks "did setup
place something an agent will read", and after this change `init` always writes `AGENTS.md`, so the
check becomes trivially satisfied. That is a real weakening, but every repair is worse: removing
`AGENTS.md` from the list would fail a repo correctly using only the generic fallback, and splitting
"tool adapter present" from "fallback present" is a different concern with its own contract. Recorded
here as a known consequence of Q2, not fixed, and not a phase.

## Phases

### Phase 1 - Block content and marker grammar

- **Manifest IDs:** R2 (grammar only), R4, R5, RI2
- Touches: `src/assets/AGENTS.md`
- Work: replace the seven-step gate text with a block bounded to four concerns — install-root
  resolution (including the `definitions_root` fallback the current file already documents), the
  `workflow/router.md` pointer, the `workflow/lifecycle.md` pointer, and an explicit statement that a
  pre-commit hook refuses commits that skip phases, naming the hook by path. Define the marker grammar
  as `<!-- agentsmyth:<version> BEGIN -->` / `<!-- agentsmyth:<version> END -->`. The markers are
  emitted by `init` (P2), not stored in the asset.
- **Exit gate:** `src/assets/AGENTS.md` is ≤ 25 lines; contains the literal hook path; contains both
  the router and lifecycle paths; contains none of the seven numbered step headings present today.

### Phase 2 - init owns the write

- **Manifest IDs:** R1, R2, R3, R6
- Touches: `bin/agentsmyth.mjs`
- Work: add an `AGENTS.md` placement beside the existing cursor and copilot writes (891-903), reusing
  `buildAdapterTokens()` and `renderAdapterTemplate()`. Rule: create the file when absent; when present,
  locate an existing block by **pattern** (`<!-- agentsmyth:<version> BEGIN -->` … matching `END`) and
  replace between the markers; when present with no marker pair, append one block. Stamp the current
  `pkgVersion`. Unlike the other enumerated placements this one is not skip-if-exists — that is the
  convention change R6 names.
- **Exit gate:** all four observable conditions hold against scratch repos — (a) no `AGENTS.md` → file
  created with exactly one marker pair; (b) `init` run twice → the two files are byte-identical;
  (c) `AGENTS.md` carrying a block stamped with an older version → exactly one marker pair remains and
  it carries the current version; (d) `AGENTS.md` with user content above and below the block → diff of
  the non-block region is empty.

### Phase 3 - Codex reconciliation and convention documentation

- **Manifest IDs:** R6, RI1, RI2
- Touches: `src/setup/SKILL.md`
- Work: remove Step 5a's two `AGENTS.md` collision rows (`does not exist` / `exists`), replacing them
  with a statement that `init` owns the file. Collapse Step 5a.1's Codex row to cite the generic block.
  Add the `<!-- agentsmyth:<version> BEGIN/END -->` pair to the Step 5a.1 marker table, where the
  global-gate markers are already documented.
- **Exit gate:** `grep -n "AGENTS.md" src/setup/SKILL.md` returns no row instructing an agent to copy or
  append root `AGENTS.md`; the Codex row names `init`; the Step 5a.1 marker table contains the new pair.

### Phase 4 - Trials and suites

- **Manifest IDs:** R2, R3, RI4, RI5
- Touches: `test/run-agents-md-tests.mjs` (new), `package.json`, `.github/workflows/ci.yml`,
  `.github/workflows/release.yml`
- Work: a suite covering Phase 2's four conditions, with the byte-preservation case (RI5) built on a
  hand-authored `AGENTS.md` carrying content above and below the block, and the cross-version case
  seeded with an older stamp. Register one `scripts` entry. No validator rule is added, so no rejection
  fixture and no mutation-baseline movement is required.
- **Exit gate:** the new suite exits 0; `npm run validate` exits 0; `npm run violations:test` exits 0;
  `npm run conformance:test` exits 0; `test/mutation-baseline.json` is unchanged.

> **Amendment, 2026-09-13 (during Build).** The two workflow files above were not in this phase's
> original touches. Registering `agents-md:test` in `package.json` without invoking it from CI and
> release fails the repo's own conformance rule `r22-every-suite-runs-in-ci`, which exists precisely
> to stop a suite being registered and never run. This is the mechanical completion of RI4 rather than
> new intent, but it is a scope addition to an approved plan, so it is recorded here and surfaced to
> the user rather than absorbed silently. `conformance:test` is added to the exit gate so the same
> omission cannot recur unnoticed.

### Phase 5 - Regenerate and close the example gap

- **Manifest IDs:** RI3, RI6
- Touches: `dist/workflow-bundle.md`, `dist/setup-bundle.md`, `examples/node-package/AGENTS.md`
- Work: run `npm run build`. Add a stamped block to `examples/node-package/` so `validate-example.mjs`
  covers this path.
- **Exit gate:** `npm run build` followed by `git status --porcelain dist/` is empty (the committed
  bundles match a fresh build); `npm run validate` exits 0 with the new example file included.

### Phase 6 - Release note

- **Manifest IDs:** RI7
- Touches: `CHANGELOG.md`
- Work: add this change to the existing 1.1.0 entry. Do not touch the entry date and do not bump
  `package.json` — `release.yml` runs `npm version` itself, and the date is corrected at dispatch.
- **Exit gate:** the 1.1.0 entry names the `AGENTS.md` fallback; `git diff package.json` is empty; the
  1.1.0 entry's date line is unchanged from its pre-phase value.

## Dependency Order

`P1 → P2 → P4` is the hard chain: P2's gate asserts against P1's bytes, and P4 proves P2's behaviour.

- **P1** first — nothing else can assert against block content that does not exist.
- **P2** after P1.
- **P3** after P2 — the setup skill should not be told `init` owns the file until it does.
- **P4** after P2; independent of P3.
- **P5** after P1, P2 and P3, since `npm run build` compiles all three sources into the bundles.
- **P6** last, and independent of P3–P5; sequenced last only so the CHANGELOG describes shipped work.

P3 and P4 may run in either order once P2 is done. No phase may start before P1.

## Branch Strategy

- Branch: `feat/wp-r23-agents-md-fallback`, already cut from `release/1.1.0` (A2, verified).
- `repo_profile.branch_policy.require_non_default_branch_for_changes` is true and this branch is not
  `main`. `default_branch_commit_requires_user_approval` is not engaged.
- Merge target is `release/1.1.0`, not `main` — 1.1.0 is scoped to seven work packages (Q3) and this
  merge does not close it.
- Commits are staged to approved scope only (`change_policy.stage_only_approved_scope`). The
  uncommitted brief and this plan belong to the same chain and are committed with it.
- No push, no PR, no merge without explicit user authorisation. `release.yaml` sets
  `pull_request.create_policy: user_requested_or_configured`.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| Marker matched literally, so each release appends a block instead of replacing | medium | high | P2 exit gate condition (c) asserts cross-version replace directly; P4 keeps it asserted | agent | R2 |
| Insertion corrupts a user-authored `AGENTS.md` | low | high | P2 gate (d) plus P4's RI5 trial diff the non-block region on a file with content on both sides | agent | R3, RI5 |
| Block shrinks below usefulness for Codex agents | medium | medium | Accepted by the user via Q2 option 1; R4 offsets it by naming the hook, which the current block never did | user | R5, RI1 |
| `dist/` ships stale because a source edit landed without a rebuild | medium | medium | P5 gate asserts `git status --porcelain dist/` is empty after a fresh build | agent | RI3 |
| `check-setup-complete`'s adapter check becomes trivially satisfied | certain | low | Accepted and recorded in Approach; not repaired, because every repair breaks a legitimate case | user | RI1 |
| 1.1.0 stays unreleased pending WP-R20 and WP-R24 | certain | medium | Decided by the user via Q3. P6 gate forbids touching the entry date; Ship reports the release as still open | user | RI7 |

Every risk has a mitigation or a recorded user acceptance. No risk requires a waiver.

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | command — scratch-repo `init` run, file inspected | P2 | Creation case. |
| R2 | command — two `init` runs, `diff` byte-identical; older-stamp replace leaves one pair | P2, P4 | The cross-version case is the one that fails under literal matching. |
| R3 | command — `diff` of non-block region across an `init` run | P2, P4 | Empty diff is the pass condition. |
| R4 | source — `grep` for the hook path in `src/assets/AGENTS.md` | P1 | Currently absent; must be present. |
| R5 | source — line count and absence of the seven step headings | P1 | Binary: ≤ 25 lines. |
| R6 | source — placement code present in `bin/agentsmyth.mjs`, absent from `src/setup/SKILL.md` | P2, P3 | Both halves required. |
| RI1 | source — `grep -n "AGENTS.md" src/setup/SKILL.md` shows no agent-driven write | P3 | Single-writer assertion. |
| RI2 | source — marker pair present in the Step 5a.1 table; HTML-comment form retained | P1, P3 | |
| RI3 | generated-output — `npm run build`, then `git status --porcelain dist/` empty | P5 | `source_only_inspection_is_not_enough` applies. |
| RI4 | command — `npm run validate` and `npm run violations:test`, both exit 0 | P4 | The two commands `verification.yaml` marks required for review and ship. |
| RI5 | manual QA — scratch repo, hand-authored `AGENTS.md`, content above and below, two `init` runs, diffs recorded | P4 | Scenario/environment/steps/expected/observed/outcome/evidence recorded per `verification.yaml` `manual_qa.required_fields`. |
| RI6 | command — `npm run validate` with the new example present | P5 | Closes the gap rather than waiving it; no skipped-check row needed. |
| RI7 | source — CHANGELOG 1.1.0 entry contains the line; `git diff package.json` empty | P6 | Date deliberately unchanged. |

Every active R/RI has named evidence. No requirement relies on "test it". No skipped checks are planned;
if one becomes necessary, `verification.yaml` `skipped_checks.required_fields` governs its record.

## Architecture Notes

- role: Principal Engineer
- **decision**: sequence the chain so the block body precedes its writer (P1 → P2), and make the
  cross-version replace an exit-gate condition rather than a test detail. The brief's architecture
  decision settled *who owns the file*; this plan settles *when the pattern-matching requirement is
  proven*, which is the part that silently degrades if left to Build's judgement.
- **decision**: leave `check-setup-complete.mjs` untouched and record the consequence. Alternative
  considered and rejected: drop `AGENTS.md` from `adapterPaths` so the at-least-one check keeps meaning
  — rejected because a repo correctly using only the generic fallback would then fail setup.
- **constraint**: `[safety-2]` — the write lands in a user-authored file, so R3 is bounded by gate (d)
  and RI5's trial, not by inspection. `verification.yaml` explicitly rules source-only inspection
  insufficient for generated output.
- **constraint**: CLAUDE.md golden rules 1 and 2 — `dist/` is never hand-edited, and P5's gate is what
  makes that observable rather than promised.
- **tradeoff**: `AGENTS.md` becomes the one entry in `init`'s enumerated placements that is not
  skip-if-exists. Accepted in the brief; the plan localises the inconsistency to a single function so
  Review can judge it in one place.
- **assumptions Build must preserve**: A1 (treat `public_contracts: []` as under-specified), A2
  (slug/branch), A3 (no phase reads a `tuning:` value).
- **downstream impact**:
  - *Build* — `src/`, `bin/`, `test/`, `examples/` only. `dist/` changes only via P5's `npm run build`.
  - *Review* — focus on P2's matching logic; it is the single point where literal-vs-pattern decides
    whether every future release corrupts consumer files. `scope-fence` should confirm no hand edit to
    `dist/`.
  - *Test* — RI5 needs a real trial, not inspection. Manual-QA fields are mandatory.
  - *Ship* — must not report this merge as closing 1.1.0 (RI7, Q3). Rollback scope is this branch.
  - *Reflect* — the Requirement Classification schema tension recorded in the brief's Architecture
    Notes is still open and belongs in the Reflect output.

## Open Questions

None. Q1, Q2 and Q3 were all resolved at brief-review on 2026-09-13 and are recorded in the brief's
Requirement Manifest. `orchestration.blockers` is empty. This plan raises no new `Q` IDs: every
assumption cross-checked in `## Assumptions Verified` came back evidence-backed, so none was converted
into a question.

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, this turn): "Approved, start Build"
- Approved: 2026-09-13, after the plan was presented with its six phases, dependency order, and the
  three items flagged for review attention (P2 condition (c), the evidence-backed assumption set, and
  the deliberately-unrepaired check-setup-complete consequence).

## Exit Gate

- [x] Every active R and RI mapped to a phase.
- [x] Every phase has a binary exit gate.
- [x] Verification plan covers every R and RI.
- [x] User approved or waiver recorded.
