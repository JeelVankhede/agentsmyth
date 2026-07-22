---
slug: deepen-setup-interview
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-22
updated: 2026-07-22
manifest_ids: [R1, R2, R3, R4, R5, R6, RI1, RI2]
upstream:
  - user-request
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: "task_class=complex (cross-cutting: bin/agentsmyth.mjs's headlessBootstrap + check command, src/assets/workflow/config/ templates, src/setup/SKILL.md, config-map.md). Read the full git history of the per-repo -> global-install -> resolution-pass transition (commits 3848ccf, 4bb61cd, af82aa3) and the full current state of headlessBootstrap(), SKILL.md, config-map.md, inspection-checklist.md, check-setup-complete.mjs, check-pending-setup.mjs directly this session before framing scope, rather than assuming from memory."
  - skill: architecture-decision-advisor
    decision: ran
    reason: "task_class=complex — this changes what `agentsmyth check` does on every invocation (adds a new validator layer) and widens a mechanically-scaffolded config's seed data, both cross-cutting concerns touching the CLI's primary command and every future consumer repo's onboarding experience."
  - skill: constraint-conflict-scan
    decision: ran
    reason: "task_class=complex — checked CLAUDE.md golden rule 4 (zero runtime deps: no risk, reuses existing check-setup-complete.mjs logic and lib.mjs patterns) and golden rule 8 (branch discipline: branched fresh from origin/main since this is unrelated to the still-open PR #45 pre-commit-hook work). No provider-neutrality conflict — no new mandatory external provider introduced."
---

# Deepen Setup Interview + Fold check-setup-complete into agentsmyth check - Brief

## Source Links

- This session's own audit (delivered as a prior turn's report, not a separate artifact): traced `headlessBootstrap()`'s origin to `3848ccf` (2026-07-08, "headless bootstrap when workflow/config absent" — a narrow crash-avoidance safety net for `check`, always meant to be followed by a real interview), `4bb61cd` (WP-R7, 2026-07-17, global-install-by-default — legitimate, not the regression), and `af82aa3` (WP-R9b, 2026-07-19, replaced the real 9-topic interview with a "resolution pass" reusing the same narrow, never-widened `headlessBootstrap()` seed list).
- `workflow/artifacts/open-items.yaml` **OI-21** (still `status: open`) — the original scoping item for this exact initiative, which explicitly promised "the AI agent still runs 'agentsmyth setup' afterward to do **the real repo-mapping interview**" — not delivered by what WP-R9b actually shipped.
- `src/workflow/validators/check-setup-complete.mjs` — read in full this session. Already has a real mechanical gate (Check 5: `docs/knowledge-map/repo-mental-map.md` must exist with zero `<PLACEHOLDER>` values across sections that map to the old interview's deeper topics) — but it is only ever invoked manually via `src/setup/SKILL.md` Phase 4, never wired into anything that runs automatically. Reproduced live: a fresh `agentsmyth init` scratch repo correctly fails this check today (3 issues: domain.yaml placeholders, missing repo-mental-map.md, leftover `.agentsmyth/`) — the mechanism works, it's just skippable.
- `src/setup/references/config-map.md` — read in full. Still comprehensively maps all 7 old interview topics (Repo Identity, Source-of-Truth, Key Paths, Protected Paths, Verification, Branch/Release Policy, Risks/Non-Goals) to real config fields and `repo-mental-map.md` sections. Confirmed current — `check-setup-refs.mjs` verifies its 47 field references against real schemas, passing today.
- `src/setup/references/inspection-checklist.md` — read in full. Already instructs inspecting CI config, directory structure, branch/git policy, and secrets/sensitive paths — sufficient raw material to answer most of the widened topics via inference, if the resolution pass is actually pointed at them.
- `src/setup/SKILL.md` Step 5e — describes an opt-in pre-commit hook (`workflow/validators/hooks/pre-commit`, offered as a yes/no question at the very end of setup) that is now stale and contradicts the different, mandatory, automatic pre-commit hook shipped in this session's other, separate PR #45 (`src/assets/hooks/pre-commit`, installed by `init` unconditionally). Found during this audit; not fixed by PR #45 itself since that PR never touched `SKILL.md`.
- User's own directives this turn: (1) fold `check-setup-complete.mjs` into `agentsmyth check` so its failures surface automatically while the agent is finishing setup, not only if the agent remembers to run a separate script; (2) widen (deepen) what gets tracked as needing resolution, but keep it bearable — resolvable via inference, via asking the user, or by explicitly marking an item pending/deferred, not a forced wall of mandatory questions.

## Problem

Three years — no, three days — of real, incremental, individually-reasonable changes compounded into an unacknowledged regression: `agentsmyth init` + `agentsmyth setup`'s default flow now asks about only 3–4 narrow fields (domain name, domain summary, one verification command, default branch) before the agent can declare setup "complete," while 5 of the original 7 interview topics — source-of-truth strategy, key paths, protected-path customization, branch/release/CI policy specifics, and risks/non-goals — are silently left at generic template defaults with zero visibility that they were never actually reviewed for the specific repo. A real, already-built mechanical gate against this (`check-setup-complete.mjs`'s repo-mental-map.md placeholder check) exists but is only invoked if the agent chooses to run `src/setup/SKILL.md` Phase 4 — nothing forces it, and this session's own first task demonstrated the failure mode directly: pending-setup items were silently resolved via inspection, declared done, and the deeper config surface was never touched or reviewed.

## Goals

- `agentsmyth check` (the command an agent runs routinely, including per `router.md`'s Pre-Action Gate during any phase) automatically surfaces setup-completeness failures — an agent can no longer silently skip past an incomplete setup without the CLI itself telling it so.
- `headlessBootstrap()`'s pending-setup seed list is widened to cover the topics `config-map.md` already maps (source-of-truth, key paths, protected paths, verification — multiple commands not just one, branch/release/CI policy, risks/non-goals), using the existing `<PLACEHOLDER>` (must resolve) vs. `<USER-TODO:...>` (visible, non-blocking follow-up) vs. `waived` (explicitly not applicable, never surfaced) distinctions that already exist in this codebase, so depth does not mean forced exhaustive interrogation.
- `src/setup/SKILL.md`'s Step 5e (stale, contradictory pre-commit-hook description) is corrected to match what `init` actually ships today (or removed, if `init`'s mandatory hook fully supersedes it — a Plan-level decision).
- No regression to the legitimate improvements already shipped: inspection-first resolution, global-install linking, non-interview-driven adapter placement.

## Non-Goals

- Reverting WP-R7's global-install architecture — confirmed sound in this session's audit, out of scope here.
- Reintroducing a separate, rigid, topic-ordered interview phase independent of `pending-setup.yaml` (Option B from this session's earlier discussion) — the user confirmed Option A (widen the existing resolution-pass mechanism) is the right approach.
- Enforcing *content quality* of `repo-mental-map.md` beyond "no literal placeholder remains" — this session's audit named that as a real, softer residual risk (an agent could still write shallow-but-technically-non-placeholder filler), not solvable by mechanical string-matching; mitigated by widening the actual questions asked, not by a stronger content-quality validator, which is out of scope.

## User Impact

An agent (or a future me, in a future session) can no longer silently declare "agentsmyth setup is done" while `release.yaml` still says `provider: none` for a repo with real CI, or while `source-of-truth.yaml` was never even considered — `agentsmyth check` will fail and say so. A user setting up a new repo answers real, batched questions about the topics that matter for their repo (or explicitly waives what doesn't apply), instead of the agent inventing shallow value from `package.json` alone and calling it done.

## Success Metrics

- A fresh `agentsmyth init` + immediate `agentsmyth check` in a scratch repo now fails with `check-setup-complete`-style errors (not just silently exiting 0 with a headless-bootstrap notice).
- `headlessBootstrap()`'s pending-setup seed list, run against a realistic scratch repo with real CI config, real secrets patterns, and a real README, resolves a meaningfully larger fraction of the widened field set via inspection alone (not asking about things git/CI already answer).
- Existing full local suite (`npm run validate`, `violations:test`, `setup-checks:test`, `setup-refs:test`, `conformance:test`, `root-resolution:test`, `init-prepare-interop:test`, `checkpoint-approval:test`, `setup-validator-definitions-root:test`) all still pass with zero regression.
- `src/setup/SKILL.md` no longer contains a pre-commit-hook description that contradicts what `init` actually ships (verified by direct comparison once Plan decides the exact reconciliation).

## Requirements

See Requirement Manifest below.

## Constraints

- CLAUDE.md golden rule 4 (zero runtime dependencies) — all of this reuses existing hand-rolled parsing/validation, no new dependency.
- CLAUDE.md golden rule 8 (branch discipline) — per explicit user instruction this turn, `deepen-setup-interview` was rebuilt on top of the still-open PR #45 (`mandatory-lifecycle-pre-commit-hook`, at commit `239f1f2`) instead of `origin/main`, to avoid conflicts/gaps and build on its already-shipped work (the two-root-aware `resolveValidator()` helper, `installPreCommitHook()`, `check-config.mjs`'s defs/data-path fix). This branch will need a rebase if PR #45 changes further before either merges.
- Must preserve `check-setup-complete.mjs`'s and `check-pending-setup.mjs`'s existing exit-code contracts for any *existing* caller (`src/setup/SKILL.md` Phase 4 still invokes `check-setup-complete.mjs` directly as today) — folding into `agentsmyth check` is additive, not a replacement of the standalone script's own usability.
- `paths.protected`'s existing generic defaults (`.git/**`, `.env*`, `**/*secret*`) are a reasonable universal floor for every repo — widening scope must distinguish fields that deserve mandatory resolution attention from fields that are fine to keep as sensible, silent defaults (this distinction is itself part of what Plan must decide field-by-field, not assumed here).

## Risks

- **Scope creep risk**: "deepen the interview" could balloon into re-litigating all 7 old topics with full rigor, defeating the "bearable" requirement. Mitigated by explicitly using `waived`/`<USER-TODO:...>` as first-class, expected outcomes for many items, not edge cases.
- **False-failure risk**: folding `check-setup-complete.mjs`'s checks into every `agentsmyth check` call could produce spurious failures for repos that are legitimately, fully set up (e.g. this repo's own `mandatory-lifecycle-pre-commit-hook`/`deepen-setup-interview` dogfood state, which predates any of these new fields and has no `repo-mental-map.md` placeholder issue today). Mitigated by verifying this repo's own `agentsmyth check` still passes cleanly after the change, not just a fresh scratch repo.
- **Interaction with PR #45**: both branches touch `bin/agentsmyth.mjs`. Kept independent by design (fresh branch from `origin/main`), but a merge conflict is expected whichever merges second — explicitly accepted, not solved here.

## Open Questions

- Q1 (non-blocking, resolved in Plan): exactly which of `config-map.md`'s topics get a real `<PLACEHOLDER>` (must-resolve) treatment vs. stay as sensible silent defaults vs. get a lighter "confirm or waive" treatment. This is genuine field-by-field design work belonging in Plan, not guessed here.

## Requirement Manifest

### Explicit (R)

- **R1** — `agentsmyth check` runs `check-setup-complete.mjs`-equivalent checks automatically (in addition to the existing lifecycle-gate check), and fails (non-zero exit, clear output) when setup is genuinely incomplete, without requiring the agent to separately remember to invoke a standalone script.
  Acceptance: a fresh scratch repo (`agentsmyth init`, no further agent action) run through `agentsmyth check` fails with setup-completeness errors; this repo's own `agentsmyth check` (already fully set up) still passes cleanly.

- **R2** — `headlessBootstrap()`'s pending-setup seed list is widened to cover source-of-truth, key paths, protected paths (beyond the generic floor), verification (multiple commands, not just one), branch/release/CI policy, and risks/non-goals — using inference-first resolution where the inspection checklist already supports it, real batched questions where it doesn't, and legitimate `waived`/`<USER-TODO:...>` outcomes where resolution genuinely isn't available yet.
  Acceptance: a scratch repo with real CI config (`.github/workflows/*.yml`), a real README, and `.env`/`secrets/` paths present resolves a meaningfully larger set of the widened fields via inspection alone, without the user being asked things already answered by the repo's own state.

- **R3** — `src/setup/SKILL.md`'s Step 5e is corrected so it no longer describes a pre-commit-hook mechanism inconsistent with what `init` actually ships (exact reconciliation — remove vs. rewrite — decided in Plan).
  Acceptance: no remaining description in `SKILL.md` of an opt-in, end-of-setup pre-commit hook question that doesn't match `init`'s actual current behavior.

- **R4** — `config-map.md` and `inspection-checklist.md` stay in sync with whatever new pending-setup items R2 introduces — no orphaned mapping table entries, no undocumented new fields.
  Acceptance: `check-setup-refs.mjs` still passes (all field references resolve against real schemas) after R2's changes.

- **R5** — Full existing local test suite passes with zero regression.
  Acceptance: `npm run validate`, `npm run violations:test`, `npm run setup-checks:test`, `npm run setup-refs:test`, `npm run conformance:test`, `npm run root-resolution:test`, `npm run init-prepare-interop:test`, `npm run checkpoint-approval:test`, `npm run setup-validator-definitions-root:test` all pass.

- **R6** — (Added mid-chain, post-Ship, per explicit user direction: "Look at it now and resolve it.") The orphaned `src/workflow/validators/hooks/pre-commit` file (found during Phase 4, initially deferred as an out-of-scope open item) is resolved by folding its phase-gate-readiness logic (detect staged lifecycle artifact files, infer the entering phase, verify via `agentsmyth check --phase/--slug`) into the real, mandatory hook (`src/assets/hooks/pre-commit`), then deleting the now-fully-absorbed orphan.
  Acceptance: the mandatory hook runs both the existing coverage check and the phase-gate check in one invocation; a real scratch-repo commit of an artifact with an unapproved checkpoint is rejected with the phase-gate error; the same artifact, once properly approved, commits successfully; the orphaned file no longer exists anywhere in the tree.

### Implicit (RI)

- **RI1** — Preserve the zero-runtime-dependency invariant.
  Acceptance: `git diff package.json` shows no dependency changes attributable to this work.
- **RI2** — `check-setup-complete.mjs`'s and `check-pending-setup.mjs`'s standalone invocation (as used directly by `src/setup/SKILL.md` Phase 4, and by README's "Post-setup validation" section) continues to work unchanged.
  Acceptance: `node workflow/validators/check-setup-complete.mjs` and `node workflow/validators/check-config.mjs`, run standalone, behave identically to before this work.

### Assumptions (A)

- **A1** — The existing `<PLACEHOLDER>` (hard fail) / `<USER-TODO:...>` (visible warning) / `waived` (silent, never blocking) three-state distinction, already present in this codebase's config templates and `pending-setup.yaml` schema respectively, is the correct mechanism for "bearable depth" — not a new state machine. **User-confirmed** by the "marking them pending where needed as a resolution" phrasing in this turn's own request.

### Open Questions (Q)

- **Q1** — Field-by-field classification (must-resolve vs. sensible-default vs. confirm-or-waive) for each of `config-map.md`'s topics. Resolved in Plan.

## Questions For User

None blocking — Q1 is a Plan-level design decision, not something requiring your input before Plan can start, unless you have strong opinions on specific fields now.

## Architecture Notes

- role: Architect
- decision: Fold setup-completeness checking into `agentsmyth check` as an additive layer (not a replacement of the standalone script), and widen `headlessBootstrap()`'s existing seed-list mechanism rather than building a parallel one.
- constraint: Zero runtime dependencies; reuse existing three-state (placeholder/USER-TODO/waived) resolution model.
- tradeoff: Widening the seed list necessarily makes `headlessBootstrap()` (and the templates it copies from) bigger and more complex — accepted, since the alternative (current narrow state) is the actual regression being fixed.
- downstream: `src/setup/SKILL.md` Phase 2/3 prose may need light adjustment if new field categories change how the resolution pass batches questions — scoped fully in Plan.

## Checkpoint Approval

- Checkpoint: brief-review
- Status: approved
- User's own words (verbatim, this turn): "Approved"

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] Blocking Q IDs appear in orchestration.blockers.
- [x] User approved or waiver recorded.
