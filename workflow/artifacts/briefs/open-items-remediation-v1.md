---
slug: open-items-remediation
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-08-31
updated: 2026-08-31
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
upstream:
  - user-request
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: none
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: skipped
    reason: The scope is a fixed list of already-triaged open items, each with its own recorded evidence; there is no alignment question to scan for.
  - skill: architecture-decision-advisor
    decision: skipped
    reason: No architectural choice — every item's fix shape was settled when the item was written or during triage.
  - skill: constraint-conflict-scan
    decision: skipped
    reason: No new constraints introduced; the changes tighten existing gates rather than adding requirements.
---

# Open-Items Remediation (pre-1.1.0) — Brief

## Source Links

- User directive: the 1.1.0 release is blocked until the open-items backlog is resolved.
- Prior lifecycle chain: `workflow/artifacts/reviews/wp-r22-review-council-v1.md` (several items were filed by it)
- Record under change: `workflow/artifacts/open-items.yaml`

## Problem

`workflow/artifacts/open-items.yaml` carried 32 open entries going into the 1.1.0 release. A
triage pass established that most are genuinely open, but that a subset are real defects with
known fixes that had simply never been scheduled — and that two entries were stale, describing
work already done.

Three of the open entries are defects in machinery this repo relies on for its own discipline:
the mandatory pre-commit gate silently skipped half its checks under `set -e`, the same gate ran
whichever CLI version happened to be on `PATH` rather than the repo under change, and a validator
selected the oldest version from a versioned artifact set. A fourth, the pre-release upgrade
rehearsal, gates the release by its own wording and had never been run against a real published
artifact.

Leaving these open is not neutral. A gate that reports one class of problem while skipping another
is trusted more than it deserves, and a validator that reads a superseded brief reports coverage
it has not established.

## Goals

- Close the open items whose fix is known and whose verification is achievable in this repo.
- Verify, rather than assert, the upgrade path this release depends on.
- Leave every item that cannot be honestly closed open, with its evidence recorded.

## Non-Goals

- Do not close items that need a decision from the user, an event in the world, or a tool this
  environment cannot reach. Recording them as done would be fabricating verification.
- Do not take on OI-82 (the undefended-rule sweep), OI-80, or OI-71: each is a sized work package
  and folding them in here is the scope creep the lifecycle exists to prevent.
- Do not bump `package.json`. The release workflow does its own version bump.

## Requirement Manifest

### Explicit (R)

- **R1** — Fix the mandatory pre-commit gate's two defects (OI-79, OI-86) in both hook copies.
  - Acceptance: a failing coverage check no longer terminates the script before the per-artifact
    phase-gate loop; the gate prefers the repo's own `bin/agentsmyth.mjs` when one exists and
    falls through to the previous PATH/npx resolution when none does; both copies pass `sh -n`.

- **R2** — Fix the versioned-artifact selection bug and complete the audit it belongs to (OI-66).
  - Acceptance: every `[0]` selection across the validator set is checked; any over a versioned
    (`-v<N>`) set selects the highest version compared numerically; a violation fixture rejects a
    plan judged against a superseded brief and passes under the pre-fix code.

- **R3** — Close the three lifecycle skill process gaps (OI-45, OI-55, OI-56).
  - Acceptance: ship step 4a is unconditional; a step 4b requires identifier reconciliation when
    the base has advanced; Build and Review both instruct running the configured validate command
    right after writing an artifact. `references/single-agent-path.md` is unchanged.

- **R4** — Establish the release-readiness evidence the backlog demands (OI-67, OI-69).
  - Acceptance: the 1.0.0 → 1.1.0 upgrade is rehearsed against the genuinely published 1.0.0
    tarball in an isolated `HOME`, with version skew, item-family append, config parse, `prepare`,
    and `check` all confirmed; a release checklist exists and carries the deprecation-window
    removal step the markers depend on.

- **R5** — Give `resolveGitCwd()` end-to-end coverage (OI-20).
  - Acceptance: a scenario builds a polyrepo-member workspace with real sibling checkouts and
    asserts both the routing and the two fallbacks.

## Architecture Notes

No architectural change. Every change either tightens an existing gate, corrects a selection
within an existing validator, adds prose to a skill, or adds test coverage. The one new file is
a documentation checklist. No runtime dependency is introduced and no shipped contract is
widened — the hook change narrows which binary runs, and the validator change narrows which brief
is read.

The hook fixes apply to both `.githooks/pre-commit` (this repo's own) and
`src/assets/hooks/pre-commit` (the copy `init` appends into a consumer's hook), because the
`set -e` hazard belongs to whatever host script the block is appended to.

## Exit Gate

- R1–R5 are non-overlapping and each is acceptance-testable in this repo.
- Items that cannot be honestly closed are named in Non-Goals rather than silently omitted.
- Classification confirmed Standard: a fixed list of known fixes, no design work outstanding.
