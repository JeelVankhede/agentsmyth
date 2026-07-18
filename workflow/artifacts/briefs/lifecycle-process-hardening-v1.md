---
slug: lifecycle-process-hardening
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-18
updated: 2026-07-18
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4]
upstream:
  - user-request
  - open-items-OI-8
  - open-items-OI-9
  - open-items-OI-12
  - open-items-OI-15
  - open-items-OI-26
  - open-items-OI-27
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: approved
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: "task_class = Standard (6 files/skills touched, no new architectural pattern) satisfies task_class != trivial. Grepped real repo evidence for each of the 6 target open items (range-shorthand occurrences, package.json scripts vs. ci.yml coverage, existing Ship/Build/Plan Workflow sections, rules.md content) before framing requirements, rather than trusting each open item's recorded wording verbatim."
  - skill: architecture-decision-advisor
    decision: skipped
    reason: "complexity_score well under 60 — no new architectural pattern, no new public/consumer surface. Every requirement extends an existing skill's Workflow/Determinism section or adds an additive CI step, following conventions already established in this repo (e.g. lifecycle-build's existing step 6a)."
  - skill: constraint-conflict-scan
    decision: ran
    reason: "task_class = Standard satisfies task_class != trivial. Checked domain.yaml's provider-neutrality constraint against R2 (CI wiring) — confirmed .github/workflows/ci.yml is not in package.json's shipped files list, so it is this repo's own dev CI, not a provider mandated for consumers; no conflict. Checked repo-profile.yaml for protected paths — none configured."
---

# Lifecycle Process Hardening - Brief

## Source Links

- User request: "Run a single lifecycle on smaller items?" → "Continue" — bundling several
  small, self-referential process/validator open items into one Standard-class chain, the same
  pattern used for `manifest-id-parser-hardening` (OI-22).
- `workflow/artifacts/open-items.yaml`: OI-8, OI-9, OI-12, OI-15, OI-26, OI-27 (all `open`,
  `source: follow-up`, all originally recorded during the `power-skills-*` and
  `manifest-id-parser-hardening` chains' own Reflect phases).
- **Scoping correction, found this session by re-reading each item's real context rather than
  bundling the full list the user was shown:** OI-11 ("add a Plan-phase cross-check: spec card
  phase list vs. declared Touches") is excluded from this brief. Its original trigger was a
  Wave-4-era external "spec card" document (a one-off planning artifact for that historical
  work package) — there is no recurring lifecycle-artifact equivalent to cross-check against
  today, so generalizing it risks inventing a fuzzy, prose-based validator prone to the exact
  false-positive/negative class `manifest-id-parser-hardening` just spent 6 phases fixing
  elsewhere. Left open in `open-items.yaml` for a future chain if a concrete recurring trigger
  reappears. OI-13, OI-14, OI-16, OI-17, OI-18, OI-20, OI-21, OI-23 are also excluded — each is
  either a manual/human task (periodic QA pass, Sandbox Testing Plan), a pending user decision
  (next initiative, PR merges), or explicitly blocked on external state that doesn't exist yet
  (a real polyrepo-member config, the OI-21 spike's answered questions).

## Problem

Six small, independently-actionable process gaps have been identified across this repo's own
recent lifecycle chains — each found empirically (not speculatively), each recorded as an
`open-items.yaml` follow-up, none yet acted on:

- **OI-8**: A "range-shorthand" authoring habit (writing e.g. a dash-range or brace-expansion
  instead of enumerating each manifest ID) recurred 3 times across 2 chains
  (`power-skills-wave2-v1`'s Reflect/Review/Ship all name it), each time caught only by manual
  Review/Build inspection, never by a structural check.
- **OI-9**: No standing step verifies `origin/main` hasn't advanced past a chain's intended
  base immediately before Ship — `power-skills-wave2-v1`'s Reflect traces a real Ship blocker
  (R8) to exactly this gap.
- **OI-12**: Ship's default behavior, twice now (`power-skills-wave2-v1`'s R8 and
  `power-skills-domain-experts-v1`'s D3/E1 items), framed a fully-resolved Build discovery as
  an open waiver requiring user risk-acceptance, rather than first asking "is this genuinely
  open risk, or a completed fix that happens to be out of declared Plan scope."
- **OI-15**: An agent marking a Plan or Review artifact `approved`/`ready-for-next-phase`
  without the user having actually seen and responded to that specific artifact's content
  recurred at least 5 times across this repo's history (3× in `power-skills-wave4-v1` alone,
  per its own Reflect; 2 more near-misses this session, both self-caught before presenting).
  Nothing in `rules.md` or the phase skills states this as an explicit rule.
- **OI-26**: Confirmed via `grep`/direct inspection this session: `package.json` defines 6
  `npm run *:test` scripts (`violations:test`, `setup-checks:test`, `setup-refs:test`,
  `conformance:test`, `root-resolution:test`, `init-prepare-interop:test`), but
  `.github/workflows/ci.yml` currently runs only 2 of them (`violations:test`,
  `conformance:test` — the latter only as of the `manifest-id-parser-hardening` chain). The
  other 4 are real, meaningful regression suites (confirmed by reading each: setup-completion
  drift, setup-reference drift, root-resolution drift across 4 scenarios, init/prepare
  interop) that are currently CI-unenforced, exactly the risk class `manifest-id-parser-hardening`
  found and fixed for `conformance:test` alone.
- **OI-27**: `lifecycle-build/SKILL.md`'s Workflow has no explicit step directing an agent to
  verify a fix's boundary (too broad/too narrow) with a before/after comparison before
  implementing — `manifest-id-parser-hardening`'s own Task artifact shows this pattern working
  cleanly twice (Phase 3, Phase 6) once adopted ad hoc, but it isn't yet a named, repeatable
  step any future Build phase would be prompted to use.

## Goals

- A structural check exists that flags manifest-ID range-shorthand (a dash-range or
  brace-expansion pattern) where an artifact expects an enumerated ID list, so Review does not
  have to catch this by inspection a 4th time.
- `ci.yml` runs every real regression suite `package.json` defines, not a subset chosen
  ad hoc per chain.
- `lifecycle-ship/SKILL.md` explicitly directs checking `origin/main` staleness before Ship,
  and explicitly directs classifying a Build discovery as resolved-scope-note vs. genuine-waiver
  before presenting a checkpoint.
- `rules.md` (or the relevant phase skills) explicitly states that a checkpoint status of
  `approved`/`ready-for-next-phase` requires the user to have responded to that specific
  artifact's own content, not a prior phase's.
- `lifecycle-build/SKILL.md`'s Workflow names the before/after boundary-comparison step
  explicitly, mirroring the existing `conditional-preservation-check` (step 6a) convention.

## Non-Goals

- OI-11 and the 8 other excluded items listed in Source Links — out of scope per the
  reasoning given there.
- Inventing new external tooling, CI providers, or dependencies — every fix here extends
  existing skill/config/CI content already present in this repo.
- Retroactively fixing any past chain's artifacts that already exhibit range-shorthand or a
  premature-approval pattern — this brief only prevents recurrence going forward.

## User Impact

Future lifecycle chains (in this repo and, since `rules.md`/skill content ships via
`dist/workflow-bundle.md`, in any consumer repo running `agentsmyth init`) get: a mechanical
catch for a recurring authoring mistake; full CI coverage of every regression suite that
already exists; explicit Ship guidance that already-fixed this repo's own R8/D3 mistakes twice;
an explicit no-self-approval rule; and a named boundary-verification step for Build fixes.

## Success Metrics

- New/extended validator catches a seeded range-shorthand fixture and does not false-positive
  against the full existing `workflow/artifacts/` tree.
- `ci.yml` runs all 6 `npm run *:test` scripts (or an equivalent aggregate); confirmed via a
  diff/read of the updated workflow file.
- `lifecycle-ship/SKILL.md`'s Workflow/Refusal sections name both the origin/main-staleness
  check and the resolved-fix-vs-waiver classification step.
- `rules.md` states the no-self-approval rule in language a future agent invocation can follow
  without needing this brief's context.
- `lifecycle-build/SKILL.md`'s Workflow names the boundary-comparison step.
- Zero internal jargon (open-item IDs, work-package labels, chain slugs) appears in any file
  that ships via `dist/workflow-bundle.md` — verified by grepping the rebuilt `dist/` output,
  not just the source, per this session's hard-learned constraint from the WP-R7 chain's
  jargon-leak incident.

## Requirements

- R1: A structural check flags manifest-ID range-shorthand (dash-range or brace-expansion)
  where an enumerated ID list is expected.
- R2: `ci.yml` runs every real regression suite defined in `package.json`'s scripts.
- R3: `lifecycle-ship/SKILL.md` explicitly checks `origin/main` staleness before Ship.
- R4: `lifecycle-ship/SKILL.md` explicitly classifies a Build discovery as resolved-scope-note
  vs. genuine-waiver before presenting a Ship checkpoint.
- R5: `rules.md` (or the relevant phase skills) states the no-self-approval rule explicitly.
- R6: `lifecycle-build/SKILL.md`'s Workflow names the before/after boundary-comparison step.
- R7 (added during Build, user-directed): fix a pre-existing internal-jargon leak found in
  already-merged `check-manifest-coverage.mjs`/`check-coverage-ledger.mjs` code comments while
  verifying this chain's own RI1.

## Constraints

- `[safety-2]`/`[safety-3]` not implicated — read-only-until-Build parsing/documentation
  changes, no destructive action, no external state claims.
- `[provider-neutrality-1]` not implicated for R2 — `.github/workflows/ci.yml` is confirmed
  absent from `package.json`'s `files` list (not shipped to consumers); this is this repo's
  own dev CI, not a provider made mandatory for the shipped template.
- **Hard constraint from this session's standing user feedback**: any content touching
  `src/workflow/rules.md` or `src/workflow/skills/*/SKILL.md` (all of which compile into
  `dist/workflow-bundle.md` and ship to consumers) must never reference internal work-package
  IDs, open-item IDs, or chain slugs — describe the actual behavior/lesson only.
- CLAUDE.md golden rules: edit source only; `npm run build` after any `src/workflow/` change;
  `npm run validate` before shipping; no new runtime dependency.

## Risks

- A new range-shorthand validator (R1) could false-positive against legitimate prose that
  happens to contain a dash between two ID-shaped tokens (e.g. a sentence citing "R1 through
  R3" in narrative form) — mitigated by requiring Plan/Build to prove both a true-positive
  fixture and a full-tree run against every existing real artifact before considering R1 done,
  per this repo's own established discipline from `manifest-id-parser-hardening`.
- Wiring 4 more test scripts into CI (R2) could surface pre-existing failures in suites that
  were never CI-gated — if any script currently fails when actually run in CI's environment,
  that is new information this brief did not anticipate; Build must run each locally first and
  flag any failure as its own finding rather than silently wiring in a red CI job.
- R5's "no self-approval" rule is process guidance, not mechanically enforceable (an agent's
  own honesty about whether the user genuinely reviewed content can't be validated by a
  script) — accepted as inherent to this requirement's nature, same as other prose-based rules
  already in `rules.md`.

## Open Questions

None. Every requirement is groundable directly from existing repo state, `open-items.yaml`,
and named prior chains' own Reflect/Review/Ship artifacts — no product/policy decision
required.

## Requirement Manifest

### Explicit (R)

- **R1** - A structural check flags manifest-ID range-shorthand used as a Requirement/Manifest
  Coverage table's Manifest ID cell. (Rescoped during Build from an originally-planned
  repo-wide free-text scan, after real evidence showed that scan would false-positive on ~46
  legitimate uses of the same shorthand elsewhere in prose; see the plan's Phase 1 and the
  task artifact's Blockers for the evidence trail. User chose to narrow rather than drop R1.)
  - Acceptance: a seeded fixture whose Requirement/Manifest Coverage table has a row using
    range shorthand (e.g. `R1-R4`) as its Manifest ID cell produces a flagged error; the check
    produces zero errors against the full existing `workflow/artifacts/` tree (no false
    positive); the check does not flag a legitimate hyphenated sub-label (e.g. `RI5-a`) or a
    comma-separated multi-ID cell (e.g. `R9, RI3, RI4`).

- **R2** - `ci.yml` runs every real regression suite `package.json` defines.
  - Acceptance: `.github/workflows/ci.yml`, after the change, includes a step invoking each of
    `violations:test`, `setup-checks:test`, `setup-refs:test`, `conformance:test`,
    `root-resolution:test`, `init-prepare-interop:test` (or a single aggregate script that
    runs all of them); every script is confirmed to actually pass when run locally before
    being wired in.

- **R3** - `lifecycle-ship/SKILL.md` explicitly checks `origin/main` staleness before Ship.
  - Acceptance: the skill's Workflow or Refusal/Stop Conditions names an explicit
    fetch-and-compare-against-origin/main step, worded generically (no chain-specific
    reference), that ships clean via `dist/workflow-bundle.md`.

- **R4** - `lifecycle-ship/SKILL.md` explicitly classifies resolved-fix vs. genuine-waiver
  before presenting a checkpoint.
  - Acceptance: the skill's Workflow names this classification step explicitly, worded
    generically, before the step that presents the Ship checkpoint to the user.

- **R5** - `rules.md` (or relevant phase skills) states the no-self-approval rule.
  - Acceptance: a new rule exists stating that a checkpoint status of `approved` or
    `ready-for-next-phase` requires the user to have responded to that specific artifact's own
    content, worded generically, with zero internal jargon.

- **R6** - `lifecycle-build/SKILL.md`'s Workflow names the boundary-comparison step.
  - Acceptance: a new numbered Workflow step (following the existing step 6a convention)
    directs verifying a fix's boundary via an explicit before/after comparison across
    representative cases before implementing, worded generically.

- **R7** - Fix the pre-existing internal-jargon leak in `check-manifest-coverage.mjs`/
  `check-coverage-ledger.mjs` found during this chain's own Build (Phase 6).
  - Acceptance: `grep -inE "OI-[0-9]|WP-R[0-9]|manifest-id-parser-hardening"` against both
    files and the rebuilt `dist/workflow-bundle.md` finds zero matches; `npm run validate`
    still passes.

### Implicit (RI)

- **RI1** - Zero internal jargon (open-item IDs, work-package labels, chain slugs) in any
  file that ships via `dist/workflow-bundle.md`.
  - Acceptance: `npm run build` regenerates `dist/`; a grep of the rebuilt `dist/` output for
    `OI-`, `WP-R`, and this chain's own slug finds zero matches introduced by this chain's
    diff.

- **RI2** - No existing validator, skill, or CI behavior regresses.
  - Acceptance: `npm run build && npm run validate && npm run violations:test &&
    npm run conformance:test` all pass against the complete existing `workflow/artifacts/`
    tree; every currently-passing local test script (per R2's acceptance) still passes after
    being wired into CI.

- **RI3** - No new runtime dependency.
  - Acceptance: `git diff package.json` shows no `dependencies`/`devDependencies` change
    (CI-step additions and `scripts` entries are configuration, not dependencies).

- **RI4** - R1's new/extended check does not false-positive against any of the 9+ prior
  chains' real existing artifacts.
  - Acceptance: full-tree run of the new/extended validator against `workflow/artifacts/`
    (not just the seeded fixture) produces zero errors.

### Assumptions (A)

none

### Open Questions (Q)

none

## Questions For User

None outstanding.

## Architecture Notes

- role: Architect
- decision: Excluded OI-11 from this brief's scope (see Source Links) — its original trigger
  condition (an external "spec card" document specific to one historical work package) has no
  recurring lifecycle-artifact equivalent today, and forcing a generalization risks inventing
  a fuzzy, prose-based validator prone to the exact false-positive/negative class
  `manifest-id-parser-hardening` just spent 6 phases fixing elsewhere in this same repo.
- decision: Grouped R3+R4 (both `lifecycle-ship/SKILL.md` Workflow additions) and treated R1+R6
  as needing their own dedicated verification (fixture + full-tree run for R1, following-existing-
  convention for R6) — Plan's call on exact phase boundaries, but R1 in particular should not
  be merged into a "quick doc edit" phase given its acceptance criteria require the same
  fixture-and-full-tree-verification discipline as `manifest-id-parser-hardening`.
- constraint: R3, R4, R5, R6 all touch files that ship via `dist/workflow-bundle.md` — every
  sentence added must be phrased as a generic, durable rule/step (describing behavior and
  reasoning), never citing an open-item ID, work-package label, or this chain's own slug. This
  is a hard constraint from this session's own standing user feedback (a real defect,
  previously shipped and fixed twice in this repo's history).
- tradeoff: Considered adding R5's no-self-approval rule as a new mechanical validator (e.g.
  checking `orchestration.status` transitions against conversation history) — rejected as
  infeasible: validators only see the artifact file, not the conversation, so there is no
  mechanical signal distinguishing genuine user review from self-approval. A clearly-worded
  rule in `rules.md` is the only available fix for this requirement.
- downstream: Plan should decide whether R1's structural check extends an existing validator
  (e.g. `check-manifest-coverage.mjs`'s `parseIdList`/`isPureIdTag` machinery already excludes
  malformed tokens) or is a new small validator — Build should ground that decision in reading
  the actual current source first, per this repo's own established Think/Plan discipline.

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] No blocking Q IDs; `orchestration.blockers` is empty.
- [ ] User approved the brief — pending presentation.
